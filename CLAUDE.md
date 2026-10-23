# Couronne de Cendres (Ash Crown) — notes pour reprendre le projet

Toujours répondre en **français**. Pas de Unity tant que le jeu n'est pas finalisé.

## Le jeu
RPG tactique dark fantasy médiéval, vanilla JS + Canvas 2D, PWA installable (mobile + PC).
- Combat au tour par tour façon Darkest Dungeon : 4 héros en rangs 1–4 contre jusqu'à 4 ennemis (gardiens sur 2 rangs), intentions ennemies affichées, agonie à 0 PV, jauge de résolution, ultimes, rage après le tour 14.
- 10 classes (2 tanks, 3 soin/soutien, 5 dégâts), 2 évolutions chacune au niveau 5, apogée au niveau 12, niveau max 20. Armure visible sur 5 paliers.
- 12 compagnons (4 au départ : loup, corbeau, chouette, molosse), évolution au niveau 10.
- 5 chapitres (Bourg, Forêt, Catacombes, Marais, Citadelle) + l'Abîme sans fin avec serments.
- Cartes procédurales (combat, élite, mystère, trésor, camp, colporteur, gardien), 29 événements, 28 reliques, marche animée entre les salles.
- Bastion : taverne, forge, chapelle, salle des maîtres, ménagerie, fonderie (or hors ligne). Défis du jour, expédition du jour, 24 succès, archives.

## Structure
- Racine du dépôt = jeu publié (GitHub Pages, branche main, dossier /) : https://norbeo.github.io/Ash-Crown/
- `source/src/` : code concaténé dans l'ordre des noms de fichiers (00_util … 39_main), `head.html` (CSS), `body.html`.
  - 00–08 logique pure (testable sous node) : classes, monde, objets, état, combat, expéditions, salles, Bastion.
  - 10–15 rendu : encre et ombres (`shade`), héros (`drawFigure`, `outfit` par classe/palier), armes, monstres, compagnons, décors.
  - 20–21 son et icônes, 30–39 interface (écrans dans `SCREENS`, actions `data-a` → `ACT`).
- `source/build.sh` : produit `index.html` (aperçu) et `dist/` (appli). Pour publier : copier `dist/` à la racine du dépôt.
- `source/test/sim.js` : bots qui jouent des carrières (`node test/sim.js 20 40 5`) — erreurs, équilibrage, taux de victoire des gardiens.
- Sauvegarde : localStorage `couronne-de-cendres-v1`.

## Commits
Auteur `Norbeo`, et terminer les messages par :
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
