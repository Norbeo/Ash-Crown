# Dernières illustrations (26 nov.) — UNE génération Canva toutes les ~25 min (pause de crédits)
Procédé : generate-image (style MAHY1eg0iC4, planche sur fond noir pur, grille stricte, sans texte) → page 1920×1080 ajoutée au
document d'export DAHa2RggGxc (insert_fill centré) → export png pro → curl raw/<planche>.png → `python3 icongrid.py raw/<planche>.png <planche>`
(cases repérées, détourage par luminance → assets/ui_<clé>.webp 96×96) → build.sh (lance mkatlas.py ; les ui_ séparés ne sont pas livrés : git rm assets/ui_*.webp à la racine s’ils y ont été copiés) → code (icoOr) → publier.
Ordre des cases = ordre de la ligne, de gauche à droite puis de haut en bas.

- [x] P1 (MAHcDSnxdVs, page 72) reliques 5×4 : cierge_noir, sel_benit, bandages, carte_usee, lanterne, dent_requin, ampoule_huile, venin, pain_noir, drapeau, pierre_queux, bottes_vent, miroir_brise, calice, cloche_eglise, ossuaire, sang_dragon, marque_chasseur, epine_rose, plume_ange → ui_rel_<clé>
- [x] P2 (MAHcDVLOWOo, page 73) reliques 5×4 : collier_meute, sablier_rouge, livre_interdit, couronne_fer, ame_martyr, oeil_tempete, coeur_noir, graal, clou_gibet, sablier_sel, cierge_moine, racine_seche, ancre_cendre, cloche_fendue, os_jardinier, echo_epee, eclat_etoile, couronne_sel, coeur_battant, sceau_pape → ui_rel_<clé>
- [x] P3 (MAHcDheuXcg, page 74, découpe iconblobs.py) 5×4 : reliques lanterne_avide, sang_impur, couronne_epines, oeil_fou, pacte_sang ; gemmes rubis, saphir, emeraude, topaze, onyx, opale, grenat, amethyste, perle (ui_gem_<clé>) ; veillée garde, bouclier, panser, priere, recits, chant (ui_camp_<clé>)
- [x] P4 (MAHcDnFPvDQ, page 75) 5×4 : veillée affuter ; succès wins, kills, boss_bourg, boss_foret, boss_catacombes, boss_marais, boss_citadelle, abyss, evos, apex, maxlvl, roster, classes, tier5, legend, pets, petEvo, flawless, oath (ui_ach_<k>)
- [x] P5 (MAHcDzINReg, page 76) 4×4 : succès daily, goldMax, secret, collection ; symboles close, plus, up, skip, auto, speed, info, install, swap (ui_<nom>, retirer de ICO_LINE) ; ach_boss, ach_cycle, ach_chapter
- [x] (MAHcD0025_g, page 77) Portrait de l histoire : por_voix (« Une voix dans la Cendre »), buste peint 3:4
- [x] (en réserve pour la semaine prochaine) pet_araignee_evo entière : MAHcDFgjjzk ; 80 illustrations coupées → RECUT_QUEUE.md
- [x] P6 (MAHcGV2H3Y0, page 78) chiffres romains peints I à X (plaques de fer et d'or, 5×2, LANDSCAPE_5_4 avec 2 rangées) → ui_rn_1…ui_rn_10, utilisés pour les niveaux de bâtiments et les paliers (après por_voix, replanifier)
- [x] P8 (bibliothèque MAHcGqUkDx4 p80, bureau MAHcGiVvfFo p81, tableau MAHcGymEAXU p82) décors de lieux 16:9 : bibliothèque des Archives (rayonnages, chandelles, parchemins) → bg_place_library ; bureau du capitaine (cartes, plume, sceau, chandelier) → bg_place_desk ; (option) tableau de chasse cloué au mur pour les Objectifs → bg_place_board
