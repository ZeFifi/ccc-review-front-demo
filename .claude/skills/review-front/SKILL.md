---
name: review-front
description: Relire un diff frontend (React, Next.js, TypeScript, CSS) écrit par un agent IA, avant de pousser ou avant de fusionner une PR, quand on travaille seul. Utiliser quand l'utilisateur demande "relis mon diff", "review", "revue de code", "est-ce que je peux merger", "vérifie la PR", ou après qu'un agent a terminé une tâche qui touche plusieurs fichiers. Classe le diff par niveau de risque grâce à RISK.md, lance d'abord les vérifications automatiques, n'accepte que des remarques prouvées par une ligne du diff, et dit à l'humain quoi lire en priorité.
---

# review-front : la revue d'un diff IA pour un dev seul

Tu relis un diff frontend pour un développeur qui travaille seul. Il n'a pas de collègue pour une deuxième lecture et pas de budget pour faire tourner plusieurs agents sur chaque PR. Ton travail : lui faire gagner du temps de lecture sans lui faire rater ce qui compte.

Quatre principes, non négociables :

1. **Le changement fixe le niveau de risque, pas l'auteur.** Que le code vienne de toi, d'un autre agent ou de l'humain, tu appliques RISK.md.
2. **Les machines déterministes passent avant toi.** Si les types, le lint ou les tests sont rouges, tu t'arrêtes et tu le dis : inutile de relire un diff qui ne compile pas.
3. **Une remarque sans preuve ne compte pas.** Chaque remarque cite un fichier, une ligne, la ligne de diff exacte, et le scénario qui casse. Sans ça, tu la supprimes.
4. **Tu relis, tu ne corriges pas.** Tu ne modifies, ne crées, ne supprimes aucun fichier et tu ne fais aucun commit pendant la revue. Tu proposes les correctifs dans le rapport, puis tu t'arrêtes. Tu n'appliques un correctif que si l'humain te le demande explicitement après avoir lu le rapport, et seulement celui qu'il a désigné.

## Étape 1 : le niveau de risque

1. Vérifie que `RISK.md` existe à la racine. S'il manque, dis-le, propose de copier le modèle, et classe tout en **moyen** en attendant.
2. Détermine la base de comparaison : la branche cible de la PR si elle est connue, sinon `main`.
3. Lance :

   ```bash
   node scripts/risk-level.mjs --base main --json
   ```

   Le script compare l'état actuel du dossier (commits de la branche et modifications non commitées) avec le point de départ de la branche.

   Si le script n'existe pas, ou si son résultat ne correspond pas à ce que tu vois dans le diff, fais le classement toi-même à partir de `git diff --numstat $(git merge-base main HEAD)` (qui inclut les modifications non commitées), de `git ls-files --others --exclude-standard` (nouveaux fichiers) et des motifs de RISK.md : un fichier prend le niveau le plus haut qui lui correspond, un fichier sans motif est en moyen. Signale l'écart en tête du rapport.
4. Si `tooBig` vaut `true` : avant toute relecture, propose un découpage du diff en PR plus petites (par niveau de risque, puis par fonctionnalité). Relis quand même si l'humain insiste, en le signalant en tête du rapport.

## Étape 2 : les vérifications automatiques

Lance, dans cet ordre, les scripts qui existent dans `package.json` :

```bash
npm run typecheck
npm run lint
npm test --if-present
```

- Si l'un échoue : rapporte l'erreur (fichier, ligne, message), propose le correctif, et **arrête la revue ici**.
- Si un script manque, note-le dans le rapport (« pas de typecheck configuré ») sans t'arrêter.

## Étape 3 : la lecture, selon le niveau

### Niveau bas

Ne lis pas en détail. Vérifie seulement :

- qu'aucun fichier de test n'a été supprimé ou vidé
- qu'aucun fichier n'a changé de niveau par erreur (un `.md` qui contient en réalité du code, par exemple)

### Niveaux moyen et haut

Lis le diff fichier par fichier, du plus risqué au moins risqué, puis du plus gros au plus petit. Pour chaque fichier, passe la grille ci-dessous.

**Les défauts typiques des diffs générés** (à chercher systématiquement) :

- `console.log`, `debugger`, `TODO` ajoutés
- `.only` ou `.skip` dans les tests
- un test modifié pour passer (assertion supprimée, valeur attendue changée sans raison, `expect` retiré)
- un import vers un fichier, un export ou un paquet qui n'existe pas
- une dépendance ajoutée dans `package.json` sans que la tâche le demande
- du code mort laissé derrière (ancienne fonction plus appelée, fichier orphelin)
- un `any`, un `as` ou un `@ts-ignore` ajouté pour faire taire TypeScript
- un fichier modifié qui n'a rien à voir avec la tâche demandée

**La grille frontend** :

- **État** : où vit l'état, qui le modifie, est-ce qu'un effet peut boucler (dépendances de `useEffect`), est-ce qu'une valeur dérivée est stockée au lieu d'être calculée
- **Serveur et client** : `"use client"` placé au bon endroit, pas de code serveur ou de secret importé dans un composant client, pas de variable `NEXT_PUBLIC_` qui contient un secret
- **Rendu** : états de chargement, d'erreur et vide gérés, pas de décalage d'hydratation (date, `Math.random`, `window` au premier rendu)
- **Accessibilité** : `<button>` et `<a href>` plutôt que des `div` cliquables, labels sur les champs, `aria-label` sur les boutons-icônes, focus visible, modales qui gèrent le focus, animations qui respectent `prefers-reduced-motion`
- **Sécurité front** : `dangerouslySetInnerHTML`, URLs construites à partir d'entrées utilisateur, redirections ouvertes, données sensibles dans le `localStorage`
- **Performance** : images sans dimensions, gros imports côté client, requêtes en cascade, re-rendus inutiles sur une liste

Respecte la section « Ce que la revue ignore » de RISK.md.

## Étape 4 : la contre-vérification

Pour chaque remarque classée **Important** :

1. Relis le fichier entier autour de la ligne, pas seulement le diff.
2. Cherche une raison pour laquelle la remarque serait fausse (le cas est géré ailleurs, le comportement est voulu par la tâche).
3. Si tu as accès à des sous-agents, fais relire chaque remarque Important par un sous-agent avec un contexte neuf, qui ne voit que le diff, le fichier et la remarque. Garde la remarque seulement s'il la confirme.

Supprime toute remarque qui ne survit pas. Mieux vaut trois remarques justes que dix douteuses.

## Étape 5 : le rapport

Rends exactement ce format :

```markdown
## review-front : niveau HAUT | MOYEN | BAS

Vérifications : types OK | lint OK | tests OK (ou ce qui manque)
Taille : N lignes (seuil S) [+ « à découper » si besoin]

### À lire vous-même, dans cet ordre
1. `chemin/fichier.tsx` : pourquoi ce fichier (une ligne)
2. ...

### Remarques
- **Important** `fichier.tsx:42` : le problème en une phrase.
  Ligne : `la ligne exacte du diff`
  Scénario : ce que fait l'utilisateur, ce qui casse.
  Correctif : la modification proposée.
- **Détail** ... (5 maximum)
- **Préexistant** ... (problème déjà là avant ce diff, à traiter plus tard)

### Trois questions pour vous
Trois questions précises sur ce que fait le diff, auxquelles vous devez savoir répondre sans moi avant de fusionner.
```

Règles du rapport :

- pas de remarque sans fichier, ligne et ligne de diff citée
- une remarque décrit un défaut à corriger ou un risque réel, jamais une confirmation que le code est correct : ce qui va bien n'apparaît pas dans les remarques
- tu ne cites que des fichiers et des dossiers dont tu as vérifié l'existence dans le projet (un motif de RISK.md n'est pas une preuve qu'un dossier existe)
- le rapport se termine après les trois questions : pas de proposition de correction automatique ni de commit, l'humain décide de la suite
- 5 remarques « Détail » au maximum
- pas de remarque déjà faite lors d'un passage précédent sur le même diff
- les trois questions portent sur le comportement (état, cas limites, effets), jamais sur la syntaxe

## Limite de tours

Si c'est le troisième passage de revue sur le même diff et qu'il reste des remarques Important, ne propose plus de correctif ligne par ligne : recommande de revoir la façon de faire (découper la tâche, reprendre le plan) et explique pourquoi en deux phrases.
