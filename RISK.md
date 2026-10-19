# RISK.md : les niveaux de risque de ce projet

Ce fichier dit, pour chaque zone du code, ce qu'une erreur coûte et qui doit relire.
Il est lu par `scripts/risk-level.mjs` (en CI et en local) et par la skill `review-front`.

Règle d'or : c'est le changement qui fixe le niveau, pas l'auteur.
Un fichier qui correspond à plusieurs niveaux prend le plus haut.
Un fichier qui ne correspond à rien est classé en **moyen**.

> Format à respecter pour le script : sous chaque titre de niveau, une puce par motif,
> le motif entre backticks. Le texte après le motif est libre (c'est pour vous).

## Haut

Relecture humaine ligne à ligne, test manuel dans le navigateur, et rien n'est fusionné le vendredi soir.

- `app/api/**` : routes serveur, une erreur ici touche les données
- `proxy.ts` : chaque requête passe par là (s'appelait `middleware.ts` avant Next.js 16)
- `middleware.ts` : idem, pour les projets plus anciens
- `**/auth/**` : connexion, sessions, droits
- `**/checkout/**` : paiement
- `app/connexion/**` : page de connexion (propre à ce projet de démo)
- `**/*.server.ts` : code exécuté côté serveur
- `next.config.*` : en-têtes de sécurité, redirections, build
- `.env*` : ne devrait jamais apparaître dans un diff
- `package.json` : nouvelles dépendances, scripts d'installation
- `package-lock.json` : à lire avec `package.json`
- `.github/workflows/**` : la CI elle-même

À quoi ressemble une panne ici : des données qui fuient, un paiement qui passe deux fois, un utilisateur connecté sous le mauvais compte.

## Moyen

Je lis le résumé de la skill `review-front`, puis seulement les fichiers qu'elle signale et ceux de la liste « à lire ».

- `app/**` : pages et layouts
- `components/**` : composants partagés
- `hooks/**` : logique d'état réutilisée
- `lib/**` : utilitaires
- `app/globals.css` : styles globaux du projet de démo (une régression visuelle passe facilement inaperçue)

À quoi ressemble une panne ici : un écran blanc, un formulaire qui ne s'envoie plus, un composant inutilisable au clavier.

## Bas

La CI verte suffit. Je survole le diff, je ne le lis pas.

- `**/*.md` : documentation
- `**/*.mdx` : contenu
- `public/**` : images et fichiers statiques
- `**/*.stories.tsx` : Storybook
- `**/*.test.ts` : tests (attention : un test supprimé ou affaibli remonte quand même dans la skill)
- `**/*.test.tsx` : tests de composants

À quoi ressemble une panne ici : une faute de frappe, une image trop lourde.

## Ce que la revue ignore

Pas de remarque sur ces points, la CI ou le formateur s'en chargent déjà :

- le formatage (Prettier)
- l'ordre des imports
- les noms de variables, sauf s'ils mentent sur ce que fait le code

## Seuil de taille

Au-delà de **400 lignes modifiées** (hors lockfile), le diff est découpé avant relecture.
Modifiez ce chiffre si besoin : le script lit la valeur en gras de cette section.
