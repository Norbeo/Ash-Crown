/* Bibelots supplémentaires (7 nov.) : 40 nouveaux noms répartis sur toutes les qualités, y compris Peu commun, Céleste et Primordial.
   `art` = icône peinte réutilisée (même famille d'objet). */
const TR_MORE = {
  // Commun (0)
  os_saint: { n: "Os de saint anonyme", r: 0, ic: "skull", art: "crane_saint", pas: [{ k: "stat", s: "res", v: 10 }, { k: "stat", s: "hp", v: .03 }], d: "+10 de résistance, +3 % de PV." },
  anneau_cuivre: { n: "Anneau de cuivre terni", r: 0, ic: "ring", art: "bague_fer", pas: [{ k: "stat", s: "dodge", v: 3 }, { k: "stat", s: "acc", v: 3 }], d: "+3 d'esquive, +3 de précision." },
  brin_sauge: { n: "Brin de sauge", r: 0, ic: "herb", art: "herbe_rare", pas: [{ k: "stat", s: "healPow", v: .07 }], d: "+7 % de soins prodigués." },
  griffe_rat: { n: "Griffe de rat géant", r: 0, ic: "claw", art: "griffe_ombre", pas: [{ k: "stat", s: "dmg", v: .03 }, { k: "stat", s: "spd", v: 1 }], d: "+3 % de dégâts, +1 de vitesse." },
  // Peu commun (1)
  fiole_vinaigre: { n: "Fiole de vinaigre des Quatre", r: 1, ic: "vial", art: "fiole_sang", pas: [{ k: "stat", s: "res", v: 18 }, { k: "healTaken", v: .08 }], d: "+18 de résistance, +8 % de soins reçus." },
  cloche_lepreux: { n: "Cloche de lépreux", r: 1, ic: "bell", art: "cloche_morte", pas: [{ k: "debuffPow", v: .12 }], d: "+12 % de chances d'altération." },
  medaillon_veuve: { n: "Médaillon de la veuve", r: 1, ic: "amulet", art: "amulette_sel", pas: [{ k: "stat", s: "hp", v: .06 }, { k: "stat", s: "prot", v: .03 }], d: "+6 % de PV, +3 % de protection." },
  plume_hibou: { n: "Plume de grand-duc", r: 1, ic: "feather", art: "plume_corbeau", pas: [{ k: "stat", s: "acc", v: 6 }, { k: "stat", s: "crit", v: 2 }], d: "+6 de précision, +2 % de critique." },
  chapelet_buis: { n: "Chapelet de buis", r: 1, ic: "rosary", art: "chapelet", pas: [{ k: "moralePow", v: .15 }, { k: "stat", s: "res", v: 8 }], d: "+15 % de résolution, +8 de résistance." },
  boucle_ecu: { n: "Boucle d'écu", r: 1, ic: "shield", art: "ecu_brise", pas: [{ k: "stat", s: "prot", v: .05 }, { k: "thornsP", v: .08 }], d: "+5 % de protection, renvoie 8 % des dégâts de mêlée." },
  // Rare (2)
  sceau_inquisiteur: { n: "Sceau de l'inquisiteur", r: 2, ic: "seal", art: "sceau_rouge", pas: [{ k: "markDmg", v: .2 }, { k: "stat", s: "acc", v: 4 }], d: "+20 % de dégâts contre les marqués, +4 de précision." },
  dent_ogre: { n: "Molaire d'ogre", r: 2, ic: "fang", art: "croc_vampire", pas: [{ k: "stat", s: "hp", v: .08 }, { k: "stat", s: "dmg", v: .05 }], d: "+8 % de PV, +5 % de dégâts." },
  sablier_fele: { n: "Sablier fêlé", r: 2, ic: "hourglass", art: "sablier", pas: [{ k: "ultGain", v: .2 }, { k: "stat", s: "spd", v: 1 }], d: "Ultime 20 % plus vite, +1 de vitesse." },
  gant_ecorcheur: { n: "Gant d'écorcheur", r: 2, ic: "glove", art: "gant_bourreau", pas: [{ k: "critBleed", v: .3 }, { k: "stat", s: "crit", v: 3 }], d: "Les critiques font saigner, +3 % de critique." },
  ronce_tombale: { n: "Ronce tombale", r: 2, ic: "herb", art: "herbe_rare", pas: [{ k: "regenPow", v: .25 }, { k: "stat", s: "healPow", v: .08 }], d: "+25 % de régénération, +8 % de soins." },
  // Épique (3)
  coeur_gargouille: { n: "Cœur de gargouille", r: 3, ic: "heart", art: "coeur_roi", pas: [{ k: "stat", s: "prot", v: .1 }, { k: "stat", s: "hp", v: .06 }, { k: "stat", s: "spd", v: -1 }], d: "+10 % de protection, +6 % de PV, −1 de vitesse." },
  oeil_sorciere: { n: "Œil de la sorcière", r: 3, ic: "eye", art: "oeil_abime", pas: [{ k: "debuffPow", v: .25 }, { k: "dotPow", v: .15 }], d: "+25 % d'altération, +15 % de dégâts sur la durée." },
  couronne_rouille: { n: "Couronne rouillée", r: 3, ic: "crown", art: "couronne_epines", pas: [{ k: "killMorale", v: 4 }, { k: "stat", s: "dmg", v: .07 }], d: "+4 de résolution par victime, +7 % de dégâts." },
  fiole_peste: { n: "Fiole de peste", r: 3, ic: "vial", art: "fiole_sang", pas: [{ k: "dotPow", v: .35 }], d: "+35 % de dégâts sur la durée." },
  ecu_sacre: { n: "Umbo sacré", r: 3, ic: "shield", art: "ecu_brise", pas: [{ k: "shieldPow", v: .3 }, { k: "stat", s: "res", v: 10 }], d: "+30 % de boucliers, +10 de résistance." },
  // Légendaire (4)
  griffe_wyverne: { n: "Griffe de wyverne", r: 4, ic: "claw", art: "griffe_ombre", pas: [{ k: "critBleed", v: .6 }, { k: "critDmg", v: .25 }, { k: "stat", s: "crit", v: 5 }], d: "Les critiques font saigner, critiques +25 %, +5 % de critique." },
  amulette_ermite: { n: "Amulette de l'ermite", r: 4, ic: "amulet", art: "amulette_sel", pas: [{ k: "stat", s: "healPow", v: .22 }, { k: "overhealShield", v: .3 }, { k: "stat", s: "res", v: 10 }], d: "+22 % de soins, le surplus devient bouclier, +10 de résistance." },
  cloche_glas: { n: "Cloche du glas", r: 4, ic: "bell", art: "cloche_morte", pas: [{ k: "aoeDmg", v: .25 }, { k: "debuffPow", v: .15 }], d: "+25 % de dégâts de zone, +15 % d'altération." },
  anneau_bourreau: { n: "Anneau du bourreau", r: 4, ic: "ring", art: "bague_fer", pas: [{ k: "execute", v: .35 }, { k: "stat", s: "dmg", v: .08 }], d: "+35 % de dégâts sur les blessés, +8 % de dégâts." },
  // Mythique (5)
  plume_seraphin: { n: "Plume de séraphin déchu", r: 5, ic: "feather", art: "plume_corbeau", pas: [{ k: "stat", s: "dodge", v: 12 }, { k: "stat", s: "spd", v: 3 }, { k: "dodgeRiposte", v: .3 }], d: "+12 d'esquive, +3 de vitesse, riposte en esquivant." },
  pierre_sabbat: { n: "Pierre du Sabbat", r: 5, ic: "gem", art: "pierre_ame", pas: [{ k: "ultGain", v: .45 }, { k: "stat", s: "crit", v: 6 }], d: "Ultime 45 % plus vite, +6 % de critique." },
  relique_martyr: { n: "Relique du martyr", r: 5, ic: "sun", art: "relique_aube", pas: [{ k: "cheatDeath", v: 1 }, { k: "stat", s: "hp", v: .12 }, { k: "healTaken", v: .15 }], d: "Survit une fois à un coup fatal, +12 % de PV, +15 % de soins reçus." },
  sceau_cardinal: { n: "Sceau du Cardinal", r: 5, ic: "seal", art: "sceau_rouge", pas: [{ k: "burnPow", v: .5 }, { k: "dotPow", v: .25 }, { k: "stat", s: "dmg", v: .08 }], d: "+50 % de brûlure, +25 % sur la durée, +8 % de dégâts." },
  // Divin (6)
  crane_prophete: { n: "Crâne du prophète", r: 6, ic: "skull", art: "crane_saint", pas: [{ k: "stat", s: "crit", v: 12 }, { k: "critDmg", v: .4 }, { k: "stat", s: "acc", v: 8 }], d: "+12 % de critique, critiques +40 %, +8 de précision." },
  coeur_titan: { n: "Cœur de titan", r: 6, ic: "heart", art: "coeur_roi", pas: [{ k: "stat", s: "hp", v: .25 }, { k: "stat", s: "prot", v: .1 }, { k: "thornsP", v: .2 }], d: "+25 % de PV, +10 % de protection, renvoie 20 % des dégâts." },
  gantelet_archonte: { n: "Gantelet de l'Archonte", r: 6, ic: "glove", art: "gant_bourreau", pas: [{ k: "stat", s: "dmg", v: .18 }, { k: "execute", v: .3 }, { k: "stat", s: "spd", v: 1 }], d: "+18 % de dégâts, +30 % sur les blessés, +1 de vitesse." },
  // Céleste (7)
  sablier_astres: { n: "Sablier des astres", r: 7, ic: "hourglass", art: "sablier", pas: [{ k: "stat", s: "spd", v: 5 }, { k: "ultGain", v: .5 }, { k: "stat", s: "dodge", v: 8 }], d: "+5 de vitesse, ultime 50 % plus vite, +8 d'esquive." },
  oeil_firmament: { n: "Œil du firmament", r: 7, ic: "eye", art: "oeil_abime", pas: [{ k: "stat", s: "crit", v: 15 }, { k: "critDmg", v: .5 }, { k: "critBleed", v: .5 }], d: "+15 % de critique, critiques +50 %, les critiques font saigner." },
  couronne_aube: { n: "Couronne de l'aube", r: 7, ic: "crown", art: "couronne_epines", pas: [{ k: "stat", s: "healPow", v: .4 }, { k: "overhealShield", v: .5 }, { k: "stat", s: "hp", v: .15 }], d: "+40 % de soins, le surplus devient bouclier, +15 % de PV." },
  ecu_firmament: { n: "Égide céleste", r: 7, ic: "shield", art: "ecu_brise", pas: [{ k: "stat", s: "prot", v: .15 }, { k: "stat", s: "hp", v: .2 }, { k: "shieldPow", v: .35 }], d: "+15 % de protection, +20 % de PV, +35 % de boucliers." },
  // Primordial (8)
  croc_fenrir: { n: "Croc du Dévoreur", r: 8, ic: "fang", art: "croc_vampire", pas: [{ k: "stat", s: "dmg", v: .25 }, { k: "stat", s: "leech", v: .15 }, { k: "lowHpDmg", v: .3 }], d: "+25 % de dégâts, +15 % de vol de vie, +30 % sous 50 % de PV." },
  chapelet_origine: { n: "Chapelet de l'Origine", r: 8, ic: "rosary", art: "chapelet", pas: [{ k: "cheatDeath", v: 2 }, { k: "stat", s: "res", v: 40 }, { k: "moralePow", v: .3 }], d: "Survit deux fois à un coup fatal, +40 de résistance, +30 % de résolution." },
  amulette_premier: { n: "Amulette du Premier Feu", r: 8, ic: "amulet", art: "amulette_sel", pas: [{ k: "stat", s: "dmg", v: .22 }, { k: "stat", s: "hp", v: .22 }, { k: "stat", s: "spd", v: 3 }], d: "+22 % de dégâts et de PV, +3 de vitesse." },
  herbe_monde: { n: "Racine du Monde", r: 8, ic: "herb", art: "herbe_rare", pas: [{ k: "stat", s: "healPow", v: .5 }, { k: "regenPow", v: .5 }, { k: "healTaken", v: .2 }], d: "+50 % de soins, +50 % de régénération, +20 % de soins reçus." },
};
Object.assign(TRINKETS, TR_MORE);
// icônes : chaque bibelot sans icône peinte reprend celle de sa famille
const TR_ART_BY_IC = { eye: "oeil_abime", feather: "plume_corbeau", skull: "crane_saint", glove: "gant_bourreau", hourglass: "sablier", heart: "coeur_roi", cloak: "cape_brume", fang: "croc_vampire", gem: "pierre_ame", crown: "couronne_epines", sun: "relique_aube", rosary: "chapelet", ring: "bague_fer", vial: "fiole_sang", amulet: "amulette_sel", bell: "cloche_morte", herb: "herbe_rare", shield: "ecu_brise", claw: "griffe_ombre", seal: "sceau_rouge", ember: "coeur_braise", dagger: "griffe_ombre", flask: "fiole_sang" };
