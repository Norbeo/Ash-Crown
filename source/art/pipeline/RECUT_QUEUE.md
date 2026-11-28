# Illustrations coupées au bord du cadre — à repeindre entières (Canva, une toutes les ~25 min)
Méthode : upload-asset-from-url (https://norbeo.github.io/Ash-Crown/assets/<nom>.webp) → generate-image avec cette référence
(« même créature, même style, entière, marge autour, fond noir uni ») → get-generate-image-job → télécharger dans
/tmp/claude-0/canva/raw/<nom>.png → `python3 cut.py <nom>` (ISNet, /tmp/claude-0/models/isnet.onnx) → redimensionner
(hauteur 430) → source/assets/<nom>.webp → build.sh (planches mx_/px_) → publier.
Références déjà importées : troll MAHcDElZhQM, tisseuse MAHcDO7tZw4, anguille MAHcDHWT5Nc, loup_gibet MAHcDI51i08, mante MAHcDJlpEa0, chimere MAHcDOpALxk.
Par réveil (25 min) : 2 créatures. Fond gris moyen uni dans le prompt (détourage ISNet plus net que sur noir) ; page 1920×1080 dans DAHcKJo9J4U (« Export Royaume des Cendres 3 » depuis le 28 nov. ; DAHa2RggGxc plein à 101 pages) avec 2 images 960×960 côte à côte, export png 3840, découpe moitiés, `python3 cut.py <nom>` (LUM=1 si fond noir), hauteur = hauteur d'origine (min 330), ancienne image gardée dans /tmp/claude-0/capefill/recut_bak/.
Note : les compagnons et créatures du bestiaire sont dans les planches px_/mx_ (refaites par build.sh).

- [x] pet_araignee_evo
- [x] pet_raie_evo
- [x] mon_troll_mousse
- [x] mon_tisseuse_peste
- [x] mon_anguille_ombre
- [x] mon_loup_gibet
- [x] pet_mante_evo
- [x] pet_chimere_evo
- [x] pet_seraphe_evo
- [x] pet_lynx_evo
- [x] pet_renard_evo
- [x] mon_crabe_braise
- [x] mon_sans_visage
- [x] mon_carapace_sel
- [x] pet_scorpion
- [x] pet_renarde_evo
- [x] mon_tortue_vase
- [x] mon_chat_noir
- [x] mon_equarrisseur
- [x] mon_rat_os
- [x] pet_molosse_evo
- [x] hero_menestrel_t5 — PRIORITÉ (demande du 28 nov.) : trou entre la cape et les cuisses. Prompt : même ménestrel, même armure noire, même chapeau à plume et luth, MAIS cape longue fermée qui tombe derrière les jambes jusqu'aux bottes (aucun vide entre cape et jambes), personnage entier, fond gris. Après recut.sh : python3 cx.py.
- [ ] mon_homme_poisson — PRIORITÉ (28 nov.) : torse criblé de trous. Prompt : même homme-poisson, même pose accroupie avec sa lance, torse et haillons PLEINS (aucun trou), entier, fond gris.
- [ ] hero_menestrel_chantre — même consigne (cape/pans fermés derrière les jambes, pas de bloc noir plat entre les jambes). Puis cx.py.
- [ ] hero_menestrel_heraut — même consigne (tabard et cape sans vide à la cuisse, pas de rectangle sombre). Puis cx.py.
- [ ] vérifier hero_menestrel_chantre_t7–t10 et heraut_t7–t10 (vides aux cuisses, rectangles sombres) : refaire ceux qui en ont.
- [ ] pet_tortue_evo
- [ ] pet_rat_geant
- [ ] pet_renard
- [ ] pet_crapaud_evo
- [ ] pet_chouette_evo
- [ ] pet_heraut_evo
- [ ] mon_ame_gelee
- [ ] mon_bourreau_encapuchonne
- [ ] mon_chene_noueux
- [ ] mon_echo_cavalier
- [ ] mon_lueur_puits
- [ ] mon_meduse_abyssale
- [ ] mon_myconide
- [ ] mon_pendue_chantante
- [ ] mon_tortue_ossuaire
- [ ] pet_cerf_evo
- [ ] pet_chien_berger_evo
- [ ] pet_lievre_evo
- [ ] pet_raie
- [ ] pet_serpent_eau_evo
