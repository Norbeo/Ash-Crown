# Bâtiments niveau 1 retravaillés en détail + Porte (étapes 5–7) — demande du 13 nov.
# Procédé bâtiments par paire : refs = upload https://norbeo.github.io/Ash-Crown/assets/<nom>.webp (les 2 images actuelles de la paire) ;
#   generate-image LANDSCAPE_4_3, style « dark, desaturated, grim, muted palette, deep shadows, Darkest Dungeon style », niveau 1 = délabré, plus détaillé que l'actuel, même silhouette générale ;
#   page 1920×1080 de DAHap1GBl1k (insert_fill left 240 1440×1080) → export png pro 2912 → sh evo/bld.sh URL nomGauche nomDroite (remplace assets/<nom>.webp ; vérifier le détourage, T=2 si murs sombres rongés).
- [FAIT MAHa06LFcN8] L1 taverne + forge → bld_taverne bld_forge
- L2 chapelle + academie → bld_chapelle bld_academie
- L3 menagerie + fonderie → bld_menagerie bld_fonderie
- P1 porte étapes 5 et 6 (ref bld_porte_4 ; 10 et 15 chapitres : encore plus grande, runes, statues, puis remparts colossaux) → bld_porte_5 bld_porte_6
- P2 porte étape 7 (20 chapitres, porte légendaire du Royaume) + porte niveau 1 retravaillée (délabrée) → bld_porte_7 bld_porte
