# Papeterie Démo : relire des diffs IA quand on est seul

Projet d'accompagnement de l'article CodeCodeCoders sur la revue de code IA pour un développeur seul.
Une boutique fictive en Next.js 16, avec tout le dispositif de l'article déjà branché :

| Fichier | Rôle |
|---|---|
| `RISK.md` | les niveaux de risque du projet (haut, moyen, bas) |
| `scripts/risk-level.mjs` | classe un diff selon `RISK.md`, sans dépendance |
| `.github/workflows/review-front.yml` | la CI : étiquette de risque, types, lint, tests, accessibilité, verdict |
| `e2e/a11y.spec.ts` | audit axe sur les pages clés et test clavier |
| `.claude/skills/review-front/SKILL.md` | la skill Claude de relecture |
| `.rules` | la même consigne pour l'agent de Zed |
| `demo/diff-ia.mjs` | fabrique un « diff d'agent » plein de pièges, pour tester le tout |

## 1. Installer

Il faut Node.js 24 (LTS, recommandé, c'est aussi la version de la CI) ou Node.js 22.12 et plus. Les versions impaires comme Node 25 ne sont pas prises en charge par Vitest. Avec nvm, un `nvm use` à la racine lit le fichier `.nvmrc`.

```bash
npm install
npx playwright install chromium
npm run dev
```

Le site tourne sur http://localhost:3000.

À l'installation, npm affiche un avertissement « eslint@9 … no longer supported ». Il est attendu :
`eslint-config-next` ne prend pas encore en charge ESLint 10, le projet reste donc sur la dernière version d'ESLint 9.
`npm audit` signale aussi 5 vulnérabilités « high », toutes issues du même paquet : `braces`
(alerte GHSA-vfj7-8cjw-p6xm, publiée le 18 septembre 2026), tiré par la config ESLint de Next.js
(`eslint-config-next` → `@next/eslint-plugin-next` → `fast-glob` → `micromatch` → `braces`).
Aucune version corrigée de `braces` n'existe encore, donc rien à mettre à jour pour l'instant. Le risque est faible ici :
la faille demande qu'un attaquant fournisse lui-même un motif de fichiers piégé, alors que ce paquet ne sert
qu'au lint de vos propres fichiers, en local et en CI, et n'est jamais livré dans le site.
`npm audit --omit=dev` ne vérifie que les dépendances livrées dans le site.

N'utilisez pas `npm audit fix --force` : il « corrige » en rétrogradant `eslint-config-next` en version 14,
incompatible avec Next.js 16.

## 2. Vérifier que tout est vert en local

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run test:a11y
```

## 3. Pousser sur GitHub

Créez un dépôt vide sur GitHub (sans README), puis :

```bash
git init -b main
git add -A
git commit -m "Projet de démo review-front"
git remote add origin git@github.com:VOTRE-COMPTE/papeterie-demo.git
git push -u origin main
```

Pensez à committer le `package-lock.json` créé par `npm install` : la CI utilise `npm ci`, qui en a besoin.

## 4. Tester avec un « diff d'agent »

Le script `demo/diff-ia.mjs` simule ce qu'un agent pressé pourrait rendre pour la tâche
« ajoute un bouton favori sur les cartes produits » :

- un `<div onClick>` à la place d'un bouton
- un `@ts-ignore`
- un `console.log` qui écrit des données personnelles dans les logs du serveur
- un test passé en `.skip`
- une route serveur modifiée alors que la tâche ne le demandait pas

```bash
git checkout -b demo/diff-ia
npm run demo:diff-ia
npm run risk
git commit -am "feat: bouton favori"
git push -u origin demo/diff-ia
```

Ouvrez ensuite la PR sur GitHub. Ce que vous devez voir :

- l'étiquette `risque:haut` sur la PR (la route `app/api/contact` a été touchée)
- le job « Types, lint, tests » en rouge, à cause des règles d'accessibilité
- le résumé « Verdict review-front » dans l'onglet Actions

Puis, dans Claude Code à la racine du projet : `/review-front`, ou « relis mon diff ».
La skill doit vous signaler le `console.log` de la route, le test sauté, le `div` cliquable
et le `@ts-ignore`, chacun avec la ligne du diff en preuve.

## 5. Adapter à votre projet

Copiez `RISK.md`, `scripts/`, `.github/workflows/review-front.yml`, `e2e/a11y.spec.ts`
et `.claude/skills/review-front/` dans votre projet, puis réécrivez `RISK.md` avec vos propres chemins.
Dans `e2e/a11y.spec.ts`, remplacez la liste `PAGES` par les pages que vous ne voulez jamais casser.

---

Projet fourni avec l'article payant de [CodeCodeCoders](https://codecodecoders.substack.com).
Boutique fictive : aucune donnée n'est envoyée ni stockée.
