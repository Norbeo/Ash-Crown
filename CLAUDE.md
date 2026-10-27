# Couronne de Cendres (Ash Crown) — notes pour reprendre le projet

Toujours répondre en **français**. Pas de Unity tant que le jeu n'est pas finalisé.

## Le jeu
RPG tactique dark fantasy médiéval, vanilla JS + Canvas 2D, PWA installable (mobile + PC).
- Combat au tour par tour façon Darkest Dungeon : 4 héros en rangs 1–4 contre jusqu'à 4 ennemis (gardiens sur 2 rangs), intentions ennemies affichées, agonie à 0 PV, jauge de résolution, ultimes, rage après le tour 14.
- 15 classes (3 tanks, 3 soin, 2 soutien, 7 dégâts), 2 évolutions chacune au niveau 15 (`EVO_LVL`), apogée au niveau 18, niveau max 20. Armure visible sur 5 paliers. Nouvelles (oct. 2026) : Gardien des runes, Médecin de peste, Chasseur de sorcières, Hallebardier, Exorciste (armes : marteau, encensoir, rapière, hallebarde, croix).
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
- Icônes d'interface peintes `ui_<nom>.webp` : `ico()` sert l'image si elle existe (sauf `ICO_LINE`, commandes au trait) ; toutes peintes (planches A–E) ; fanion `ui_pawn`, icônes PWA tirées de `ui_emblem`.
- Illustrations peintes (oct. 2026, générées avec Canva) : `source/assets/*.webp` (décors `bg_*`, héros `hero_<classe>_t<palier>`, monstres `mon_<art>`, compagnons `pet_<id>[_evo]`, bâtiments `bld_<k>`). `17_art_images.js` (registre `PIC`, `artImg`, `imgSprite`) : `heroSprite`/`monSprite`/`petSprite`/`paintRegion`/`drawBuilding` utilisent l'image si elle est chargée, sinon le dessin procédural. Préchargement en tâche de fond au démarrage ; à chaque image arrivée les caches de sprites sont vidés et les vignettes `fillCanvases` repeintes. Les évolutions de héros = même image + aura colorée. `build.sh` injecte `window.ART_LIST` (contenu d'assets/) et `window.ART_FLIP` (`source/art/flip.txt` : images à retourner) et copie assets/ dans dist/. Service worker : cache dédié aux illustrations. Identifiants Canva dans `source/art/canva.json` (document technique « Conteneur noir Couronne de Cendres » DAHY1Nqfaek pour exporter en pleine résolution ; détourage local ISNet).
- Taille des héros : `source/art/meta.json` (généré, part de l'image au-dessus de la tête) → `ART_META` ; `heroImgSprite` met tous les corps à la même hauteur quel que soit le bâton/l'arme levée.
- Icônes peintes d'armes `wpn_<type>` et de bibelots `tr_<clé>` (planches Canva découpées) dans `itemArt` ; jetons de carte peints `map_<type>` dans `mapToken` ; icône procédurale en attendant le chargement, puis remplacée (`ITEM_WAIT`).
- Forge : bouton « Tout recycler l'inutile » (`ACT.salvAll`, `itemUseful`) — garde tout objet légendaire ou meilleur que ce que porte au moins un héros capable de l'équiper.
- Élites et gardiens aléatoires : chaque salle d'élite/gardien tire parmi TOUS les élites (`ALL_ELITES`) / gardiens (`ALL_BOSSES`) du jeu, jamais deux fois de suite le même (`S.lastElite`/`S.lastBoss` par région) ; `monNorm` ramène PV/dégâts/protection à ceux du monstre prévu pour la région (`k.f` appliqué dans 05_combat).
- Difficulté `S.opts.diff` (`DIFFS` dans 04_state : facile/normal/cauchemar, PV/dégâts ennemis, or/xp) ; choix au départ et dans les Options ; `node test/sim.js 10 25 7 --diff=cauchemar`.
- Événements : 133 + 11 suites (`03z_events.js`). effets des choix cachés (`fxText` reste disponible mais n'est plus affiché). Chaînes : `flag` (expédition) / `sflag` (sauvegarde `S.flags`), suites avec `need`/`sneed`, `reg` = régions.
- Bilan d'expédition (`run.sum`, `B.tally` dans 05_combat, `runSummaryHTML`) ; défi de la semaine (`WEEK_RULES`, `S.week`, `weekPartyOk`) ; tutoriel guidé du premier combat (`COACH`, `S.tuto.coach`).
- Compétences chiffrées : `skillNums` (dégâts avant protection, soins ≈ PV moyens du groupe) dans `skillText(sk, héros|unité)`.
- Noms : sexe fixé par l'illustration de la classe (`CLASS_FEMALE`), surnoms accordés, migration `fixHeroName`.
- Son : `source/audio/gen_audio.py` synthétise ambiances par région (`amb_<région>`) et bruitages (`fx_*`) en mp3 dans `source/sfx/` ; `ambPlay`, `sfx()` joue l'enregistrement, synthèse en repli.
- Combat : élan avec traînée, estafilade (`f.slash`), silhouette blanche à l'impact (`whiteOf`), agonie assombrie et pulsante ; textes empilés par unité. Toucher les icônes d'altérations ou l'intention ennemie ouvre une bulle détaillée (`CB.zones`, `cbInfo` dans 37_ui_extras.js).
- Palier VI « Ascendant » (Forge niveau 6, réservé aux héros évolués, `canEquip`) ; l'armure VI est propre à une voie (`it.evo`, deux boutons à la Forge, icône = illustration de la voie ; une ancienne armure VI sans voie prend celle de son porteur) ; l'illustration de voie `hero_<classe>_<voie>.webp` ne s'affiche qu'avec une armure de palier VI (`heroArtName`), aperçu sur la fiche d'évolution ; file Canva dans /tmp/claude-0/canva/QUEUE.md.
- Extensions (`08z_extras.js` logique, `37_ui_extras.js` interface) : codex des reliques (`S.seen.relics`, onglet Reliques des Archives) ; coffres piégés (`showTreasure`, désamorçage par Lame d'ombre/Médecin de peste/Arbalétrière/Chasseur de sorcières) ; quêtes de héros (`QUESTS` → traits uniques) ; marques des gardiens (`GUARD_MARKS`, purification à la Chapelle) ; saisons de 4 semaines dans l'Abîme (`S.season`, gardien de saison, récompense à la profondeur 10) ; ordre au compagnon une fois par combat (`ACT.cbPet`, `B.petBurst`) ; répliques des héros (`BARKS`, `bark`) ; options Mode apaisé (`S.opts.calm`) et Animations rapides (`S.opts.quick`) ; boss rush (`startRush`, `S.rush`) après 2 chapitres.
- Menace I à V par chapitre (`THREAT_N`, `threatMax`, `S.prog[r].threat`) : vaincre le gardien à la menace la plus haute débloque la suivante.
- Progression sans limite (`MAX_LVL = Infinity`, rang de compétence max = Salle des maîtres + niveau/10, `roman()`), paliers d'équipement par niveau (`TIER_LVL` : II niv 5, III 10, IV 15, V 20, VI 25), armure VI forgeable seulement si un héros a la voie ; niveau d'aventure (`advLevel`, `bldAdvReq` = niveau du bâtiment × 3) ; qualités Mythique (4) et Divin (5).
- Carte : `fixMapRules` (pas deux salles identiques d'affilée hors combats, une élite sur chaque chemin). Bâtiments : `bldTinted` (délabré au niv 1, s'éclaire). Clic hors d'une fenêtre = fermeture (`UI.modalOut`, `outside`).
- Histoire : `03y_story.js` (`SCENES` dialogues avant chaque chapitre, `SCENE_END`, `showScene`, onglet Chroniques). 45 synergies (dont par rôles : `count`, `none`), 42 bibelots.
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

## À faire (demandes du 26 oct. 2026, après réinitialisation de l'utilisation)
- Doubler le contenu : nouveaux monstres, élites, gardiens, un 6e chapitre (illustrations Canva : décor + monstres), bibelots peints `tr_<clé>` pour les 20 nouveaux.
- Compagnons ×3 (18 → 54) avec illustrations Canva.
- Sons : refaire `gen_audio.py` en plus réaliste et sombre (moins « enfantin »).
- Accueil (écran-titre) et bâtiments : retravailler, éventuellement nouvelles illustrations par niveau.
- Armures palier V trop belles par rapport au VI : retoucher le palier V ou renforcer le VI (aura déjà ajoutée).
- Idées validées « toutes » : équipes enregistrées, arbre de talents après le niveau 15, stress/folie, ennemis corrompus en menace IV–V, fiches d'ennemis au Bestiaire, journal de combat, défis de classe, revente au colporteur, scènes du Bastion.

## À faire jeudi soir (demandes du 27 oct. 2026), en plus de la liste ci-dessus
1. Armures palier V : certaines classes deviennent toutes dorées au palier V puis redeviennent « normales » au VI (prêtresse, templier, hallebardier…). Repeindre le palier V de chaque classe pour une progression cohérente IV → V → VI (le VI = illustration de voie). Pas d'aura ajoutée (retirée à la demande).
2. Recyclage rapide : ne pas recycler les objets de palier supérieur que les héros ne peuvent pas encore équiper (niveau trop bas) ; proposer une sélection par rareté (tout le commun, tout le peu commun, etc.).
3. Forge : toucher une armure (ou son palier) ouvre l'image en grand pour voir le détail.
4. Quitter en plein combat de gardien : à la reprise, même gardien (ne pas retirer au hasard) — mémoriser le monstre tiré dans le nœud.
5. Agonie : un héros qui tombe 3 fois à l'agonie dans le même combat meurt (évite les combats infinis avec le soin du compagnon). Fuite toujours possible si le combat est trop dur.
6. Niveaux des chapitres alignés sur les paliers : chap. 1 niv 1–5, chap. 2 niv 5–10, chap. 3 niv 10–15, chap. 4 niv 15–20, chap. 5 niv 20–25 ; butin plafonné au palier du chapitre (chap. 1 → niveau 5 max, etc.).
7. Taux de drop par qualité, à documenter (glossaire/Archives + CLAUDE.md) : commun ≈ 50 %, peu commun ≈ 30 %, rare ≈ 10 %, puis épique, légendaire, mythique, divin décroissants ; prévoir une qualité au-dessus plus tard (« cosmique »). NB : il faut une qualité « Peu commun » entre Commun et Rare (renommer/insérer dans `RARITY`).
8. Retour d'interface : après avoir équipé un objet (ex. depuis l'inventaire de la forge), revenir à l'écran précédent (la forge) et non au menu principal.
9. Gardiens hors cadre en portrait sur téléphone : réduire leur taille en portrait.
10. Statistiques affichées avec trop de décimales (ex. 2.0333333) : arrondir à l'entier partout.
11. Nouveaux objets « tome d'expérience » : donnent de l'XP uniquement aux héros d'un niveau inférieur au héros le plus haut du roster.
12. Bibelots : quand les deux emplacements sont pleins, laisser choisir lequel remplacer (pas toujours le premier).
13. Gardiens de chapitre : remettre l'ordre de l'histoire à la première victoire (chap. 1 Docteur Peste, etc.) ; ensuite, aux passages suivants, gardien aléatoire parmi ceux déjà vaincus uniquement (un gardien du chap. 3 n'apparaît pas tant qu'on ne l'a pas battu à la fin du chap. 3).
14. Un nouveau gardien inédit par niveau de menace (II à V), à créer avec illustrations.
