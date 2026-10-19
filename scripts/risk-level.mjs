#!/usr/bin/env node
// risk-level.mjs : classe un diff selon RISK.md
// Usage : node scripts/risk-level.mjs [--base origin/main] [--risk RISK.md] [--json]
// Sans dépendance. Node 20 ou plus.
// Sortie : un résumé Markdown (ou JSON avec --json).
// En CI GitHub, écrit aussi le résumé dans GITHUB_STEP_SUMMARY et le niveau dans GITHUB_OUTPUT.

import { execFileSync } from "node:child_process";
import { readFileSync, appendFileSync, existsSync } from "node:fs";

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const base = opt("--base", "origin/main");
const riskPath = opt("--risk", "RISK.md");
const asJson = args.includes("--json");

const LEVELS = ["bas", "moyen", "haut"];
const LOCKFILES = ["package-lock.json", "pnpm-lock.yaml", "yarn.lock", "bun.lockb", "bun.lock"];

// 1. Lire RISK.md
if (!existsSync(riskPath)) {
  console.error(`Fichier ${riskPath} introuvable. Copiez le modèle RISK.md à la racine du projet.`);
  process.exit(2);
}
const riskMd = readFileSync(riskPath, "utf8");
const patterns = { haut: [], moyen: [], bas: [] };
let current = null;
let maxLines = 400;
let inSizeSection = false;
for (const line of riskMd.split("\n")) {
  const h = line.match(/^##\s+(.+)$/);
  if (h) {
    const title = h[1].trim().toLowerCase();
    current = LEVELS.find((l) => title.startsWith(l)) || null;
    inSizeSection = title.startsWith("seuil");
    continue;
  }
  if (current) {
    const p = line.match(/^\s*-\s+`([^`]+)`/);
    if (p) patterns[current].push(p[1].trim());
  }
  if (inSizeSection) {
    const n = line.match(/\*\*(\d+)\s+lignes/);
    if (n) maxLines = Number(n[1]);
  }
}

// 2. Glob vers RegExp : ** (tous dossiers), * (un segment), point littéral
function globToRegExp(glob) {
  let re = "";
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === "*" && glob[i + 1] === "*") {
      // "**/" correspond à zéro ou plusieurs dossiers
      if (glob[i + 2] === "/") { re += "(.*/)?"; i += 2; }
      else { re += ".*"; i += 1; }
    } else if (c === "*") {
      re += "[^/]*";
    } else if ("\\^$+.()|{}[]".includes(c)) {
      re += "\\" + c;
    } else {
      re += c;
    }
  }
  return new RegExp("^" + re + "$");
}
const compiled = Object.fromEntries(
  LEVELS.map((l) => [l, patterns[l].map((g) => ({ glob: g, re: globToRegExp(g) }))])
);

// 3. Fichiers et lignes modifiés
const git = (...a) => execFileSync("git", a, { encoding: "utf8" }).trim();
let numstat;
let untracked;
try {
  // On part du point commun avec la branche de base, et on compare avec l'état actuel
  // du dossier : les commits de la branche, mais aussi les modifications pas encore commitées.
  const mergeBase = git("merge-base", base, "HEAD");
  numstat = git("diff", "--numstat", mergeBase);
  // Les nouveaux fichiers jamais ajoutés à Git (git add) n'apparaissent pas dans git diff.
  untracked = git("ls-files", "--others", "--exclude-standard");
} catch {
  console.error(`Impossible de comparer avec ${base}. En CI, utilisez actions/checkout avec fetch-depth: 0.`);
  process.exit(2);
}
const files = numstat
  .split("\n")
  .filter(Boolean)
  .map((l) => {
    const [add, del, ...rest] = l.split("\t");
    const path = rest.join("\t");
    const lines = (Number(add) || 0) + (Number(del) || 0); // les binaires valent 0
    return { path, lines };
  });
for (const path of untracked.split("\n").filter(Boolean)) {
  let lines = 0;
  try {
    lines = readFileSync(path, "utf8").split("\n").length;
  } catch {
    // fichier illisible ou binaire : compté pour 0 ligne
  }
  files.push({ path, lines });
}

// 4. Classer chaque fichier
const classified = files.map((f) => {
  let level = null;
  let matched = null;
  for (const l of [...LEVELS].reverse()) {
    const hit = compiled[l].find((p) => p.re.test(f.path));
    if (hit) { level = l; matched = hit.glob; break; }
  }
  return { ...f, level: level || "moyen", matched: matched || "(aucun motif, moyen par défaut)" };
});

const overall = classified.reduce(
  (acc, f) => (LEVELS.indexOf(f.level) > LEVELS.indexOf(acc) ? f.level : acc),
  "bas"
);
const totalLines = classified
  .filter((f) => !LOCKFILES.some((lf) => f.path.endsWith(lf)))
  .reduce((s, f) => s + f.lines, 0);
const tooBig = totalLines > maxLines;

// 5. Sortie
const result = { base, overall, totalLines, maxLines, tooBig, files: classified };

if (asJson) {
  console.log(JSON.stringify(result, null, 2));
} else {
  const order = { haut: 0, moyen: 1, bas: 2 };
  const rows = [...classified]
    .sort((a, b) => order[a.level] - order[b.level] || b.lines - a.lines)
    .map((f) => `| ${f.level} | \`${f.path}\` | ${f.lines} | \`${f.matched}\` |`)
    .join("\n");
  const md = [
    `## Niveau de risque : ${overall.toUpperCase()}`,
    "",
    `${classified.length} fichier(s), ${totalLines} ligne(s) modifiée(s) hors lockfile (seuil : ${maxLines}).`,
    tooBig ? `\n**Diff trop gros pour une relecture d'une traite : découpez-le avant de relire.**` : "",
    "",
    "| Niveau | Fichier | Lignes | Motif |",
    "|---|---|---|---|",
    rows || "| - | aucun fichier modifié | 0 | - |",
    "",
  ].join("\n");
  console.log(md);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, md + "\n");
}

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `level=${overall}\ntoo_big=${tooBig}\nlines=${totalLines}\n`);
}
