# Couronne de Cendres (Ash Crown) — notes pour reprendre le projet

Toujours répondre en **français**. Pas de Unity tant que le jeu n'est pas finalisé.

## Le jeu
RPG tactique dark fantasy médiéval, vanilla JS + Canvas 2D, PWA installable (mobile + PC).
- Combat au tour par tour façon Darkest Dungeon : 4 héros en rangs 1–4 contre jusqu'à 4 ennemis (gardiens sur 2 rangs), intentions ennemies affichées, agonie à 0 PV, jauge de résolution, ultimes, rage après le tour 14.
- 15 classes (3 tanks, 3 soin, 2 soutien, 7 dégâts), 2 évolutions chacune au niveau 5, apogée au niveau 12, niveau max 20. Armure visible sur 5 paliers. Nouvelles (oct. 2026) : Gardien des runes, Médecin de peste, Chasseur de sorcières, Hallebardier, Exorciste (armes : marteau, encensoir, rapière, hallebarde, croix).
- Départ aléatoire : 4 héros tirés au sort (`START_SLOTS` : tank, soin, dégâts, dégâts/soutien — toutes classes possibles, 3 relances) et 3 compagnons proposés parmi ceux marqués `starter` (1 relance). Une classe déjà possédée reste recrutable à la Taverne (`classUnlocked`).
- 18 compagnons (8 `starter` : loup, corbeau, chouette, molosse, renard, ours, cerf, vipère), évolution au niveau 10.
- Icônes d'équipement (`itemArt` dans 32_ui_hub.js) : arme peinte, buste du héros pour l'armure, bibelot peint ; mises en cache en data URL.
- Synergies de compagnie (`SYNERGIES` dans 03_items.js, 12 au total) : appliquées comme des reliques via `relicHooks` → `runSynergies(run)`. Affichées à la préparation d'expédition, sur la carte et dans les Archives.
- Fiches détaillées : `heroSheet` / `petSheet` (33_ui_heroes.js), boutons Détails à la Taverne, à la Ménagerie et au départ.
- Butin équipable en expédition : `runEquip` (06_run.js) ; l'ancien objet retourne au butin ; en cas de déroute les échanges sont annulés (`run.swaps`).
- Carte d'expédition (16_art_map.js) : calque transparent sur le décor animé de la région, chemins à l'encre claire, jetons de salles peints (`mapToken`), fanion du groupe.
- Images peintes : pas de `filter` CSS sur les images peintes ; `color-scheme: dark` déclaré pour éviter l'inversion par le mode sombre forcé des navigateurs.
- Comparaison d'équipement : `gearDelta` / `equipRow` (32_ui_hub.js) — écarts de caractéristiques en vert/rouge, nom + classe + niveau du héros.
- Chapitres 3 et 4 : nouveaux monstres (moine flagellant, thuriféraire, hallebardier d'os, sorcière des tourbières, pêcheur d'âmes), élites (Prieur sanglant, Ogre) et gardiens alternatifs (`boss2` : L'Abbé de Saint-Morne, La Reine du Sabbat), tirés une fois sur deux après la première victoire.
- Combats longs : après le tour 14 les soins ennemis sont divisés par 2, après le tour 18 les héros gagnent +5 % de dégâts par tour (évite les enlisements).
- Plus aucun dessin procédural des personnages/décors/bâtiments (fichiers 11, 13, 14 supprimés, 12 → `12_art_sprites.js`) : `heroSprite`/`monSprite`/`petSprite` renvoient l'illustration ou un sprite vide (`blankSprite`) en attendant le chargement ; `paintRegion` un fond uni. Barre « Illustrations x / n » (`#artload`) au premier chargement.
- Glossaire (`29_glossary.js`) : `GLOSS` (combat, états, progression, ressources), `gl(texte)` souligne les termes connus, `data-tip="clé"` ou `tipAttr(n, d)` ouvre une bulle au toucher/survol ; onglet Glossaire dans les Archives.
- Icônes d'interface peintes `ui_<nom>.webp` : `ico()` sert l'image si elle existe (sauf `ICO_LINE`, commandes au trait) ; planches restantes dans /tmp/claude-0/canva/ui/sheets.txt (B–E).
- Illustrations peintes (oct. 2026, générées avec Canva) : `source/assets/*.webp` (décors `bg_*`, héros `hero_<classe>_t<palier>`, monstres `mon_<art>`, compagnons `pet_<id>[_evo]`, bâtiments `bld_<k>`). `17_art_images.js` (registre `PIC`, `artImg`, `imgSprite`) : `heroSprite`/`monSprite`/`petSprite`/`paintRegion`/`drawBuilding` utilisent l'image si elle est chargée, sinon le dessin procédural. Préchargement en tâche de fond au démarrage ; à chaque image arrivée les caches de sprites sont vidés et les vignettes `fillCanvases` repeintes. Les évolutions de héros = même image + aura colorée. `build.sh` injecte `window.ART_LIST` (contenu d'assets/) et `window.ART_FLIP` (`source/art/flip.txt` : images à retourner) et copie assets/ dans dist/. Service worker : cache dédié aux illustrations. Identifiants Canva dans `source/art/canva.json` (document technique « Conteneur noir Couronne de Cendres » DAHY1Nqfaek pour exporter en pleine résolution ; détourage local ISNet).
- Taille des héros : `source/art/meta.json` (généré, part de l'image au-dessus de la tête) → `ART_META` ; `heroImgSprite` met tous les corps à la même hauteur quel que soit le bâton/l'arme levée.
- Icônes peintes d'armes `wpn_<type>` et de bibelots `tr_<clé>` (planches Canva découpées) dans `itemArt` ; jetons de carte peints `map_<type>` dans `mapToken` ; icône procédurale en attendant le chargement, puis remplacée (`ITEM_WAIT`).
- Forge : bouton « Tout recycler l'inutile » (`ACT.salvAll`, `itemUseful`) — garde tout objet légendaire ou meilleur que ce que porte au moins un héros capable de l'équiper.
- Élites et gardiens aléatoires : chaque salle d'élite/gardien tire parmi TOUS les élites (`ALL_ELITES`) / gardiens (`ALL_BOSSES`) du jeu, jamais deux fois de suite le même (`S.lastElite`/`S.lastBoss` par région) ; `monNorm` ramène PV/dégâts/protection à ceux du monstre prévu pour la région (`k.f` appliqué dans 05_combat).
- Difficulté `S.opts.diff` (`DIFFS` dans 04_state : facile/normal/cauchemar, PV/dégâts ennemis, or/xp) ; choix au départ et dans les Options ; `node test/sim.js 10 25 7 --diff=cauchemar`.
- Événements : 133 + 11 suites (`03z_events.js`). `fxText` affiche l'effet de chaque choix. Chaînes : `flag` (expédition) / `sflag` (sauvegarde `S.flags`), suites avec `need`/`sneed`, `reg` = régions.
- Bilan d'expédition (`run.sum`, `B.tally` dans 05_combat, `runSummaryHTML`) ; défi de la semaine (`WEEK_RULES`, `S.week`, `weekPartyOk`) ; tutoriel guidé du premier combat (`COACH`, `S.tuto.coach`).
- Compétences chiffrées : `skillNums` (dégâts avant protection, soins ≈ PV moyens du groupe) dans `skillText(sk, héros|unité)`.
- Noms : sexe fixé par l'illustration de la classe (`CLASS_FEMALE`), surnoms accordés, migration `fixHeroName`.
- Son : `source/audio/gen_audio.py` synthétise ambiances par région (`amb_<région>`) et bruitages (`fx_*`) en mp3 dans `source/sfx/` ; `ambPlay`, `sfx()` joue l'enregistrement, synthèse en repli.
- Combat : élan avec traînée, estafilade (`f.slash`), silhouette blanche à l'impact (`whiteOf`), agonie assombrie et pulsante ; textes empilés par unité.
- Évolutions peintes : `hero_<classe>_<voie>.webp` (prioritaires dans `heroArtName`) ; file Canva dans /tmp/claude-0/canva/QUEUE.md.
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
