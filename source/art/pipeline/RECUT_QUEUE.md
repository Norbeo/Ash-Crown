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
- [x] hero_menestrel_chantre (Canva MAHcKJ785So) — ÉVOLUTIONS DU MÉNESTREL À ADAPTER (28 nov.) : référence = NOUVEAU hero_menestrel_t5 (cape fermée derrière les jambes) + ancien chantre pour le style de la voie ; armure plus riche que le V, même silhouette étroite, cape fermée, aucun vide ni bloc noir entre les jambes. Puis cx.py + build (hx_menestrel).
- [x] hero_menestrel_heraut (Canva MAHcKcDILSc) — même méthode (réf. nouveau t5 MAHcKJmFkUI + ancien héraut déjà importé MAHcKC05zUI : tabard bleu à fleurs de lys, dorures) ; aucun vide à la cuisse.
- [x] mon_homme_poisson (Canva MAHcKfJJuIE) — PRIORITÉ (28 nov.) : torse criblé de trous. Prompt : même homme-poisson, même pose accroupie avec sa lance, torse et haillons PLEINS (aucun trou), entier, fond gris.
- [x] hero_menestrel_chantre_t7 (Canva MAHcKWu3BX8) — réf. le chantre VI refait, plus riche, même silhouette, cape fermée.
- [x] hero_menestrel_heraut_t7 (Canva MAHcKvozN-M) — réf. le héraut VI refait.
- [x] hero_menestrel_chantre_t8 (Canva MAHcKnaeajM) — réf. chantre VII refait.
- [x] hero_menestrel_heraut_t8 (Canva MAHcKtXKUxc) — réf. héraut VII refait.
- [x] hero_menestrel_chantre_t9 (Canva MAHcKj075Gk) — réf. chantre VIII refait.
- [x] hero_menestrel_heraut_t9 (Canva MAHcK3yQbq8) — réf. héraut VIII refait.
- [x] hero_menestrel_chantre_t10 (Canva MAHcK7vfhv0) — réf. chantre IX refait (palier X : le plus somptueux).
- [x] hero_menestrel_heraut_t10 (Canva MAHcMLYagKM) — réf. héraut IX refait.
- [x] pet_tortue_evo (Canva MAHcMFJ0krw)
- [x] pet_rat_geant (Canva MAHcMURYDPc)
## RÈGLE TENUES (28 nov. 11 h 17, utilisateur) : pour toute illustration de héros refaite, prévoir la recoloration des tenues — grandes surfaces de tissu UNIES (cape, tabard, robe) dans un ton sombre et neutre (noir, gris, brun sombre), métal sombre/patiné plutôt que doré brillant, peu de motifs dorés sur le tissu ; ambiance dark, jamais flashy.

## PRIORITÉ 28 nov. (10 h 13) — refaire entièrement Lame d'ombre, Sorcière des haies, Berserker
Règles : cape fermée sans trou, AUCUN vide ni bloc noir entre jambes/armes, silhouette étroite, personnage entier avec marge (tête/cornes non coupées), fond gris, peau intacte. Tissus de couleur unie et lisible (pour que les tenues se recolorent bien). Chaque palier = réf. du palier précédent refait. Après recut.sh : cx.py.
- [x] hero_ombre_t1 (Canva MAHcMXxke0w)
- [x] hero_ombre_t2 (Canva MAHcMcPK8rI)
- [x] hero_ombre_t3 (Canva MAHcMY68JKw)
- [x] hero_ombre_t4 (Canva MAHcMQvFz2E)
- [x] hero_ombre_t5 (Canva MAHcMkbDUMc)

## APERÇUS VOIES DE LA LAME D'OMBRE (28 nov. 11 h 16) — À MONTRER À L'UTILISATEUR AVANT DE LANCER LES PALIERS VI–X
Les deux voies doivent être deux personnages distincts sur la même base (comme Purificateur / Traqueur du chasseur), pas un simple changement de couleur.
- [ ] apercu_ombre_assassin — Assassin (« Un seul coup. Au bon endroit. ») : tueuse silencieuse, silhouette fine et sobre, capuche profonde + masque, cuir noir mat ajusté, cape courte, lames droites (stylets / dague longue), fioles de poison, sangles, touches d'argent froid ; aucun rouge.
- [ ] apercu_ombre_ombre_sang — Ombre-sang (« Elle danse entre ses proies et laisse des rivières derrière elle ») : danseuse sanguinaire, sans capuche (cheveux noirs tressés, demi-masque d'os), armure écarlate et noire à épines, voiles rouges déchirés, deux faucilles dentelées, runes de sang ; silhouette en mouvement.
(les lignes hero_ombre_assassin*/hero_ombre_ombre_sang* restent en attente de l'accord)

## PIED MANQUANT (28 nov., 11 h 04)
- [x] hero_medecin_peste_t5 (Canva MAHcMuKIqxE) — un seul pied visible (l'autre caché par la cape) : deux bottes bien visibles, cape fermée derrière les jambes

## AURÉOLES (28 nov., 11 h) — fond sombre peint à l'intérieur de l'auréole → repeindre avec un anneau fin, fond gris visible dans l'anneau, aucun disque sombre derrière la tête
- [ ] hero_hallebardier_garde_roi_t10 — disque noir + rayons noirs
- [ ] hero_exorciste_penitent_t9 — disque noir
- [ ] hero_exorciste_confesseur_t10 — disque brun
- [ ] hero_gardien_runes_thane_pierre_t9 — disque bleu nuit
- [ ] hero_revenant_spectre_t9 — disque sombre
- [ ] hero_revenant_seigneur_sang_t10 — disque rouge sombre
(ombre_sang_t9 : visage troué par l'auréole ; berserker_ecorcheur_t9, sorciere_noire_t9/t10 : déjà dans la file ci-dessous)

- [ ] hero_ombre_assassin (VI)
- [ ] hero_ombre_assassin_t7
- [ ] hero_ombre_assassin_t8
- [ ] hero_ombre_assassin_t9
- [ ] hero_ombre_assassin_t10
- [ ] hero_ombre_ombre_sang (VI)
- [ ] hero_ombre_ombre_sang_t7
- [ ] hero_ombre_ombre_sang_t8
- [ ] hero_ombre_ombre_sang_t9
- [ ] hero_ombre_ombre_sang_t10
- [ ] hero_sorciere_t1
- [ ] hero_sorciere_t2
- [ ] hero_sorciere_t3
- [ ] hero_sorciere_t4
- [ ] hero_sorciere_t5
- [ ] hero_sorciere_druidesse (VI)
- [ ] hero_sorciere_druidesse_t7
- [ ] hero_sorciere_druidesse_t8
- [ ] hero_sorciere_druidesse_t9
- [ ] hero_sorciere_druidesse_t10
- [ ] hero_sorciere_sorciere_noire (VI)
- [ ] hero_sorciere_sorciere_noire_t7
- [ ] hero_sorciere_sorciere_noire_t8
- [ ] hero_sorciere_sorciere_noire_t9
- [ ] hero_sorciere_sorciere_noire_t10
- [ ] hero_berserker_chef_guerre (VI) — tête/cornes coupées
- [ ] hero_berserker_chef_guerre_t7 — tête coupée
- [ ] hero_berserker_chef_guerre_t9 — tête coupée
- [ ] hero_berserker_chef_guerre_t10 — tête coupée
- [ ] hero_berserker_ecorcheur (VI) — tête/cornes coupées
- [ ] hero_berserker_ecorcheur_t7 — tête coupée
- [ ] hero_berserker_ecorcheur_t9 — tête coupée
- [ ] hero_berserker_ecorcheur_t10 — tête coupée

## Suite (compagnons / créatures)
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

