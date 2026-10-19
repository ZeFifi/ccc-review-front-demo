#!/usr/bin/env node
// demo/diff-ia.mjs : simule le diff qu'un agent pourrait rendre pour la tâche
// « ajoute un bouton favori sur les cartes produits ».
//
// Le diff contient volontairement les défauts typiques des diffs générés :
// - un <div onClick> à la place d'un <button> (accessibilité)
// - un @ts-ignore pour faire taire TypeScript
// - un console.log qui écrit des données personnelles dans les logs serveur
// - un test passé en .skip
// - un fichier serveur modifié alors que la tâche ne le demandait pas
//
// Usage (sur une branche dédiée) :
//   git checkout -b demo/diff-ia
//   npm run demo:diff-ia
//   npm run risk
//   git commit -am "feat: bouton favori" && git push -u origin demo/diff-ia
// Puis ouvrez la PR sur GitHub et regardez la CI.

import { readFileSync, writeFileSync } from "node:fs";

function patch(path, from, to) {
  const src = readFileSync(path, "utf8");
  if (src.includes(to)) {
    console.log(`déjà appliqué : ${path}`);
    return;
  }
  if (!src.includes(from)) {
    console.error(`motif introuvable dans ${path}, le fichier a changé depuis la démo.`);
    process.exit(1);
  }
  writeFileSync(path, src.replace(from, to));
  console.log(`modifié : ${path}`);
}

// 1. La fonctionnalité demandée, écrite « comme un agent pressé »
patch(
  "components/ProductCard.tsx",
  `  const [added, setAdded] = useState(false);
`,
  `  const [added, setAdded] = useState(false);
  const [fav, setFav] = useState(false);
  console.log("render ProductCard", product.id);
`
);
patch(
  "components/ProductCard.tsx",
  `      <h3>{product.name}</h3>
`,
  `      <h3>{product.name}</h3>
      {/* @ts-ignore */}
      <div className="fav" onClick={() => setFav(!fav)}>
        {fav ? "♥" : "♡"}
      </div>
`
);

// 2. Un fichier serveur touché alors que la tâche ne le demandait pas
patch(
  "app/api/contact/route.ts",
  `  const errors = validateContact(body);
`,
  `  console.log("contact reçu", body);
  const errors = validateContact(body);
`
);

// 3. Un test « qui gênait » mis de côté
patch(
  "lib/contact.test.ts",
  `  it("signale chaque champ invalide"`,
  `  it.skip("signale chaque champ invalide"`
);

console.log("\nDiff de démo appliqué. Lancez maintenant : npm run risk");
