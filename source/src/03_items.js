/* ═══════════════════════ Équipement, reliques, événements, bâtiments ═══════════════════════ */
const RARITY = [
  { n: "Commun", c: "#a8a090", aff: 0 },
  { n: "Rare", c: "#5aa0ff", aff: 1 },
  { n: "Épique", c: "#c070ff", aff: 2 },
  { n: "Légendaire", c: "#ffb040", aff: 3 },
  { n: "Mythique", c: "#ff4a6a", aff: 4 },
  { n: "Divin", c: "#7af0ff", aff: 5 },
];
const TIER_N = ["", "Rustique", "Forgé", "Trempé", "Noble", "Royal", "Ascendant"];
// nom de l'arme et de l'armure de chaque classe, par palier (1 à 5) : le palier change aussi l'apparence du héros
const GEAR_NAMES = {
  templier: { wpn: ["Gourdin clouté", "Masse d'armes", "Masse bénie", "Étoile du matin", "Marteau de l'Aube"], arm: ["Gambison de pèlerin", "Haubert de croisé", "Plates du Temple", "Armure du Saint-Ordre", "Égide de l'Aube"] },
  revenant: { wpn: ["Épée ébréchée", "Épée bâtarde", "Espadon funèbre", "Lame des tombes", "Faucheuse du roi mort"], arm: ["Cotte trouée", "Mailles du gisant", "Plates du tombeau", "Armure du revenant", "Carapace d'outre-tombe"] },
  pretresse: { wpn: ["Bâton de pèlerin", "Crosse de chêne", "Crosse d'argent", "Soleil captif", "Sceptre de l'Aube"], arm: ["Robe de novice", "Aube de chapelle", "Robe brodée d'or", "Vêtements sacerdotaux", "Parure de la Sainte"] },
  sorciere: { wpn: ["Faucille de jardin", "Serpe de sorcière", "Faucille de lune", "Croissant venimeux", "Faucille de la Mère"], arm: ["Haillons de cueilleuse", "Mante de cuir", "Manteau de mousse", "Atours des haies", "Parure de la Forêt"] },
  menestrel: { wpn: ["Vielle fêlée", "Luth de taverne", "Luth d'ébène", "Harpe des tombes", "Lyre du dernier jour"], arm: ["Pourpoint usé", "Doublet de saltimbanque", "Pourpoint de velours", "Habit de cour", "Atours du Roi-poète"] },
  berserker: { wpn: ["Hachette de bûcheron", "Hache de guerre", "Hache double", "Hache des clans", "Fendeuse de montagnes"], arm: ["Fourrures", "Cuir clouté", "Broigne d'ours", "Armure des clans", "Peau du Grand Ours"] },
  ombre: { wpn: ["Couteaux rouillés", "Dagues jumelles", "Lames de nuit", "Crocs de vipère", "Murmures de la Mort"], arm: ["Capuche de voleur", "Cuir sombre", "Tenue d'ombre", "Habit de la Guilde", "Voile de la Nuit"] },
  arbaletriere: { wpn: ["Arbalète de chasse", "Arbalète de rempart", "Arbalète à cric", "Arbalète de siège", "Baliste de poing"], arm: ["Gambison de milice", "Brigandine", "Cuirasse de garde", "Armure du rempart", "Plates de la Capitaine"] },
  pyromancien: { wpn: ["Carnet brûlé", "Grimoire de flammes", "Tome du brasier", "Codex infernal", "Livre du Soleil noir"], arm: ["Robe roussie", "Robe d'apprenti", "Robe de mage", "Manteau du brasier", "Parure de l'Archimage"] },
  necromancien: { wpn: ["Faux de fossoyeur", "Faux d'os", "Faux funéraire", "Moissonneuse d'âmes", "Faux de la Liche"], arm: ["Linceul", "Robe de fossoyeur", "Robe d'ossuaire", "Manteau des tombes", "Parure du Seigneur des morts"] },
  gardien_runes: { wpn: ["Maillet de carrier", "Marteau gravé", "Marteau runique", "Marteau du tonnerre", "Marteau des Ancêtres"], arm: ["Peaux et mailles", "Broigne de pierre", "Plates runiques", "Armure du Thane", "Carapace des Ancêtres"] },
  medecin_peste: { wpn: ["Encensoir de cuivre", "Encensoir de fer", "Encensoir d'argent", "Encensoir du lazaret", "Encensoir de la Grande Peste"], arm: ["Manteau ciré", "Manteau de lazaret", "Habit de docteur", "Manteau du barbier", "Parure du Fléau"] },
  chasseur_sorcieres: { wpn: ["Épée de milice", "Rapière", "Rapière d'argent", "Lame du tribunal", "Lame du Dernier Bûcher"], arm: ["Pourpoint de cuir", "Brigandine noire", "Cuirasse du tribunal", "Armure du Saint-Office", "Parure du Grand Chasseur"] },
  hallebardier: { wpn: ["Fourche de guerre", "Vouge", "Hallebarde", "Hallebarde de la garde", "Hallebarde du Roi"], arm: ["Gambison de piquier", "Haubert de milice", "Demi-armure", "Plates de la garde", "Armure du Garde royal"] },
  exorciste: { wpn: ["Croix de bois", "Croix de fer", "Croix d'argent", "Croix reliquaire", "Croix de l'Exorciste"], arm: ["Soutane usée", "Soutane noire", "Habit de chapelain", "Chasuble brodée", "Parure du Saint-Siège"] },
};
// bonus de base par palier
const WPN_DMG = [0, .0, .18, .38, .62, .9, 1.25];
const ARM_HP = [0, .0, .14, .3, .48, .7, .98];
const ARM_PROT = [0, 0, .03, .06, .09, .12, .16];
// affixes aléatoires
const AFFIXES = {
  dmg: { n: "dégâts", v: [.05, .12], fmt: "pct" }, hp: { n: "PV", v: [.05, .12], fmt: "pct" }, crit: { n: "critique", v: [3, 7], fmt: "flat" },
  spd: { n: "vitesse", v: [1, 2], fmt: "flat" }, dodge: { n: "esquive", v: [4, 9], fmt: "flat" }, prot: { n: "protection", v: [.03, .06], fmt: "pct" },
  acc: { n: "précision", v: [4, 8], fmt: "flat" }, healPow: { n: "soins", v: [.08, .18], fmt: "pct" }, res: { n: "résistance", v: [8, 16], fmt: "flat" }, leech: { n: "vol de vie", v: [.04, .08], fmt: "pct" },
};
// bibelots : 2 emplacements. Uniques, avec un effet marquant
const TRINKETS = {
  dent_loup: { n: "Dent de loup", r: 0, ic: "fang", pas: [{ k: "stat", s: "crit", v: 4 }], d: "+4 % de critique." },
  chapelet: { n: "Chapelet usé", r: 0, ic: "rosary", pas: [{ k: "stat", s: "res", v: 12 }], d: "+12 de résistance." },
  bague_fer: { n: "Bague de fer", r: 0, ic: "ring", pas: [{ k: "stat", s: "prot", v: .05 }], d: "+5 % de protection." },
  plume_corbeau: { n: "Plume de corbeau", r: 0, ic: "feather", pas: [{ k: "stat", s: "spd", v: 2 }], d: "+2 de vitesse." },
  fiole_sang: { n: "Fiole de sang", r: 0, ic: "vial", pas: [{ k: "stat", s: "hp", v: .1 }], d: "+10 % de PV." },
  oeil_verre: { n: "Œil de verre", r: 0, ic: "eye", pas: [{ k: "stat", s: "acc", v: 8 }], d: "+8 de précision." },
  amulette_sel: { n: "Amulette de sel", r: 1, ic: "amulet", pas: [{ k: "stat", s: "dmg", v: .1 }, { k: "vsTag", tag: "impie", v: .15 }], d: "+10 % de dégâts, +15 % contre les impies." },
  gant_bourreau: { n: "Gant du bourreau", r: 1, ic: "glove", pas: [{ k: "execute", v: .3 }], d: "+30 % de dégâts contre les cibles sous 40 % de PV." },
  cloche_morte: { n: "Clochette des morts", r: 1, ic: "bell", pas: [{ k: "debuffPow", v: .2 }, { k: "stat", s: "acc", v: 5 }], d: "+20 % de chances d'altération." },
  pierre_ame: { n: "Pierre d'âme", r: 1, ic: "gem", pas: [{ k: "ultGain", v: .3 }], d: "La jauge d'ultime monte 30 % plus vite." },
  herbe_rare: { n: "Herbe des tombes", r: 1, ic: "herb", pas: [{ k: "stat", s: "healPow", v: .2 }], d: "+20 % de soins prodigués." },
  cape_brume: { n: "Fermoir de brume", r: 1, ic: "cloak", pas: [{ k: "stat", s: "dodge", v: 10 }], d: "+10 d'esquive." },
  sceau_rouge: { n: "Sceau rouge", r: 1, ic: "seal", pas: [{ k: "dotPow", v: .25 }], d: "+25 % de dégâts sur la durée." },
  ecu_brise: { n: "Écu brisé", r: 1, ic: "shield", pas: [{ k: "thornsP", v: .25 }], d: "Renvoie 25 % des dégâts de mêlée subis." },
  coeur_braise: { n: "Cœur de braise", r: 2, ic: "heart", pas: [{ k: "burnPow", v: .4 }, { k: "stat", s: "dmg", v: .08 }], d: "+40 % de brûlure, +8 % de dégâts." },
  crane_saint: { n: "Crâne de saint", r: 2, ic: "skull", pas: [{ k: "cheatDeath", v: 1 }], d: "Une fois par combat : survit à un coup fatal avec 1 PV." },
  couronne_epines: { n: "Couronne d'épines", r: 2, ic: "crown", pas: [{ k: "lowHpDmg", v: .4 }, { k: "stat", s: "hp", v: -.05 }], d: "+40 % de dégâts sous 50 % de PV." },
  sablier: { n: "Sablier noir", r: 2, ic: "hourglass", pas: [{ k: "stat", s: "spd", v: 4 }, { k: "stat", s: "dodge", v: 5 }], d: "+4 de vitesse, +5 d'esquive." },
  relique_aube: { n: "Relique de l'Aube", r: 2, ic: "sun", pas: [{ k: "stat", s: "healPow", v: .3 }, { k: "overhealShield", v: .4 }], d: "+30 % de soins ; le surplus devient bouclier." },
  croc_vampire: { n: "Croc de vampire", r: 2, ic: "fang", pas: [{ k: "stat", s: "leech", v: .12 }], d: "+12 % de vol de vie." },
  griffe_ombre: { n: "Griffe d'ombre", r: 2, ic: "claw", pas: [{ k: "critBleed", v: .5 }, { k: "stat", s: "crit", v: 4 }], d: "Les critiques font saigner." },
  coeur_roi: { n: "Cœur du Roi", r: 3, ic: "heart", pas: [{ k: "stat", s: "dmg", v: .2 }, { k: "stat", s: "hp", v: .2 }], d: "+20 % de dégâts et de PV." },
  oeil_abime: { n: "Œil de l'Abîme", r: 3, ic: "eye", pas: [{ k: "stat", s: "crit", v: 12 }, { k: "critDmg", v: .5 }], d: "+12 % de critique, critiques +50 %." },
  phylactere: { n: "Phylactère", r: 3, ic: "gem", pas: [{ k: "cheatDeath", v: 2 }, { k: "stat", s: "res", v: 20 }], d: "Deux fois par combat : survit à un coup fatal." },
  fragment_couronne: { n: "Éclat de la Couronne", r: 3, ic: "crown", pas: [{ k: "ultGain", v: .5 }, { k: "stat", s: "dmg", v: .12 }], d: "Ultime +50 % plus vite, +12 % de dégâts." },
};
// reliques : bonus temporaires d'une expédition, qui se combinent entre elles
const RELICS = {
  cierge_noir: { n: "Cierge noir", r: 0, d: "+15 % de dégâts quand la lueur est sous 50.", h: { darkDmg: .15 } },
  sel_benit: { n: "Sel béni", r: 0, d: "+20 % de dégâts contre les impies.", h: { vsImpie: .2 } },
  bandages: { n: "Bandages propres", r: 0, d: "Soigne le groupe de 8 % après chaque combat.", h: { postHeal: .08 } },
  carte_usee: { n: "Carte usée", r: 0, d: "+20 % d'or trouvé.", h: { gold: .2 } },
  lanterne: { n: "Lanterne de fer", r: 0, d: "La lueur baisse deux fois moins vite.", h: { lightSave: .5 } },
  dent_requin: { n: "Dent barbelée", r: 0, d: "Les saignements infligés durent 1 tour de plus.", h: { bleedT: 1 } },
  ampoule_huile: { n: "Ampoule d'huile", r: 0, d: "Les brûlures infligées durent 1 tour de plus.", h: { burnT: 1 } },
  venin: { n: "Venin d'aspic", r: 0, d: "Les poisons infligés durent 1 tour de plus.", h: { poisonT: 1 } },
  pain_noir: { n: "Pain noir", r: 0, d: "+10 % de PV max pour tout le groupe.", h: { hp: .1 } },
  drapeau: { n: "Étendard déchiré", r: 0, d: "Chaque combat commence avec +10 de résolution.", h: { morale: 10 } },
  pierre_queux: { n: "Pierre à aiguiser", r: 0, d: "+5 % de critique pour le groupe.", h: { crit: 5 } },
  bottes_vent: { n: "Bottes de vent", r: 0, d: "+2 de vitesse pour le groupe.", h: { spd: 2 } },
  miroir_brise: { n: "Miroir brisé", r: 1, d: "Les critiques ont 30 % de chances d'étourdir.", h: { critStun: .3 } },
  calice: { n: "Calice ébréché", r: 1, d: "+5 % de vol de vie pour le groupe.", h: { leech: .05 } },
  cloche_eglise: { n: "Cloche d'église", r: 1, d: "Les ennemis commencent le combat affaiblis.", h: { startWeak: 1 } },
  ossuaire: { n: "Doigt d'ossuaire", r: 1, d: "Chaque ennemi tué soigne le tueur de 10 %.", h: { killHeal: .1 } },
  sang_dragon: { n: "Sang de dragon", r: 1, d: "Les ultimes se chargent 25 % plus vite.", h: { ult: .25 } },
  marque_chasseur: { n: "Marque du chasseur", r: 1, d: "+25 % de dégâts contre les cibles marquées.", h: { markDmg: .25 } },
  epine_rose: { n: "Rose d'épines", r: 1, d: "Les ennemis qui frappent en mêlée subissent 15 % des dégâts.", h: { thorns: .15 } },
  plume_ange: { n: "Plume d'ange", r: 1, d: "+20 % de soins.", h: { heal: .2 } },
  collier_meute: { n: "Collier de meute", r: 1, d: "Le compagnon inflige +40 % de dégâts.", h: { pet: .4 } },
  sablier_rouge: { n: "Sablier rouge", r: 1, d: "Le groupe agit en premier au premier tour.", h: { firstStrike: 1 } },
  livre_interdit: { n: "Livre interdit", r: 2, d: "+30 % de dégâts sur la durée.", h: { dot: .3 } },
  couronne_fer: { n: "Couronne de fer", r: 2, d: "+15 % de dégâts et +10 % de protection pour le groupe.", h: { dmg: .15, prot: .1 } },
  ame_martyr: { n: "Âme de martyr", r: 2, d: "La première fois qu'un héros tombe, il se relève à 40 %.", h: { revive: .4 } },
  oeil_tempete: { n: "Œil de la tempête", r: 2, d: "Les attaques de zone infligent +25 %.", h: { aoe: .25 } },
  coeur_noir: { n: "Cœur noir", r: 2, d: "+35 % de dégâts, mais -15 % de PV max.", h: { dmg: .35, hp: -.15 } },
  graal: { n: "Graal terni", r: 2, d: "Soigne tout le groupe de 4 % au début de chaque tour.", h: { roundHeal: .04 } },
};
// synergies de compagnie : bonus d'expédition quand certaines classes partent ensemble
// need : liste de groupes, il faut au moins une classe de chaque groupe · roles : rôles distincts requis · tanks : nombre de tanks
const SYNERGIES = {
  sainte_traque: { n: "La Sainte Traque", need: [["exorciste"], ["chasseur_sorcieres"]], h: { vsImpie: .25, morale: 10 }, d: "+25 % de dégâts contre les impies, +10 de résolution au début des combats." },
  foi_acier: { n: "Foi et acier", need: [["templier"], ["pretresse"]], h: { prot: .06, heal: .15 }, d: "+6 % de protection et +15 % de soins pour le groupe." },
  mur_boucliers: { n: "Mur de boucliers", tanks: 2, h: { prot: .08, thorns: .1 }, d: "Deux tanks : +8 % de protection, 10 % des dégâts de mêlée renvoyés." },
  sang_nord: { n: "Sang du Nord", need: [["berserker"], ["gardien_runes"]], h: { dmg: .1, morale: 8 }, d: "+10 % de dégâts, +8 de résolution au début des combats." },
  morts_sans_repos: { n: "Morts sans repos", need: [["necromancien"], ["revenant"]], h: { leech: .06, hp: .08 }, d: "+6 % de vol de vie et +8 % de PV pour le groupe." },
  herbes_poisons: { n: "Herbes et poisons", need: [["medecin_peste"], ["sorciere"]], h: { poisonT: 1, heal: .12 }, d: "Les poisons durent 1 tour de plus, +12 % de soins." },
  bucher: { n: "Le Bûcher", need: [["pyromancien"], ["chasseur_sorcieres", "templier"]], h: { burnT: 1, dot: .15 }, d: "Les brûlures durent 1 tour de plus, +15 % de dégâts sur la durée." },
  embuscade: { n: "Embuscade", need: [["ombre"], ["arbaletriere"]], h: { firstStrike: 1, crit: 5 }, d: "Le groupe agit en premier au premier tour, +5 % de critique." },
  garde_royale: { n: "Garde royale", need: [["hallebardier"], ["arbaletriere", "templier"]], h: { thorns: .12, crit: 4 }, d: "12 % des dégâts de mêlée renvoyés, +4 % de critique." },
  choeur_funebre: { n: "Chœur funèbre", need: [["menestrel"], ["exorciste", "pretresse"]], h: { morale: 15, roundHeal: .02 }, d: "+15 de résolution au début des combats, le groupe récupère 2 % de PV par tour." },
  danse_macabre: { n: "Danse macabre", need: [["necromancien"], ["menestrel"]], h: { markDmg: .2 }, d: "+20 % de dégâts contre les cibles marquées." },
  compagnie_complete: { n: "Compagnie complète", roles: ["tank", "soin", "soutien", "dps"], h: { dmg: .05, hp: .05 }, d: "Un tank, un soigneur, un soutien et une lame : +5 % de dégâts et de PV." },
};
function activeSynergies(classes) {
  const roles = classes.map(c => CLASSES[c] && CLASSES[c].role);
  return Object.keys(SYNERGIES).filter(k => { const Y = SYNERGIES[k];
    if (Y.need && !Y.need.every(g => g.some(c => classes.includes(c)))) return false;
    if (Y.tanks && roles.filter(r => r === "tank").length < Y.tanks) return false;
    if (Y.roles && !Y.roles.every(r => roles.includes(r))) return false;
    return true; });
}
// événements : choix narratifs entre deux salles
const EVENTS = [
  { id: "autel", n: "Autel sanglant", t: "Un autel de pierre, encore humide. Une voix murmure : « Donne, et tu recevras. »", ch: [
    { n: "Offrir du sang (tout le groupe perd 15 % de PV)", fx: { hurt: .15, relic: 1 } }, { n: "Profaner l'autel", fx: { gold: 80, curse: 1 } }, { n: "Passer son chemin", fx: {} }] },
  { id: "pelerin", n: "Le pèlerin mourant", t: "Un vieil homme agonise contre un mur. Il serre une bourse contre son cœur.", ch: [
    { n: "Le soigner", fx: { gold: 60, morale: 10, light: -5 } }, { n: "Prendre la bourse", fx: { gold: 140, morale: -10 } }, { n: "Prier pour lui", fx: { heal: .15 } }] },
  { id: "coffre", n: "Coffre scellé", t: "Un coffre cerclé de fer, couvert de runes. Il est peut-être piégé.", ch: [
    { n: "Forcer la serrure", fx: { gamble: [.6, { loot: 1, gold: 60 }, { hurt: .12 }] } }, { n: "Le briser à la hache", fx: { gold: 40, mat: 2 } }, { n: "Le laisser", fx: {} }] },
  { id: "puits", n: "Le puits des souhaits", t: "Au fond du puits, quelque chose brille. On entend des rires d'enfants.", ch: [
    { n: "Jeter une pièce d'or (30 or)", fx: { cost: 30, gamble: [.55, { relic: 1 }, { morale: -8 }] } }, { n: "Descendre", fx: { gamble: [.5, { loot: 1 }, { hurt: .2, fight: 1 }] } }, { n: "Repartir", fx: {} }] },
  { id: "chapelle", n: "Chapelle abandonnée", t: "Les vitraux sont brisés mais un cierge brûle encore sur l'autel.", ch: [
    { n: "Se recueillir", fx: { heal: .25, cleanse: 1 } }, { n: "Prendre le cierge", fx: { light: 30 } }, { n: "Fouiller la crypte", fx: { gamble: [.5, { loot: 1 }, { fight: 1 }] } }] },
  { id: "marchande", n: "La marchande voilée", t: "« Je vends ce que vous n'osez pas demander », dit-elle sans montrer son visage.", ch: [
    { n: "Acheter une relique (120 or)", fx: { cost: 120, relic: 1 } }, { n: "Lui vendre un souvenir (+ or, - résolution)", fx: { gold: 90, morale: -12 } }, { n: "La chasser", fx: { fight: 1 } }] },
  { id: "corps", n: "Le charnier", t: "Des dizaines de corps, et parmi eux, du bon acier.", ch: [
    { n: "Récupérer l'acier", fx: { mat: 4, gamble: [.6, {}, { poison: 1 }] } }, { n: "Brûler le charnier", fx: { light: -10, morale: 8 } }] },
  { id: "loup_blesse", n: "La bête blessée", t: "Une bête prise dans un piège. Elle grogne mais ne bouge plus.", ch: [
    { n: "La libérer", fx: { petXp: 60, morale: 6 } }, { n: "L'achever", fx: { gold: 30 } }] },
  { id: "miroir", n: "Le miroir noir", t: "Un grand miroir. Votre reflet sourit alors que vous ne souriez pas.", ch: [
    { n: "Toucher le reflet", fx: { gamble: [.5, { xp: 80 }, { hurt: .15, morale: -10 }] } }, { n: "Briser le miroir", fx: { morale: -5, relic: 1 } }, { n: "Détourner le regard", fx: {} }] },
  { id: "forgeron", n: "Le forgeron fantôme", t: "Un spectre bat le fer sur une enclume invisible. Il vous fait signe d'approcher.", ch: [
    { n: "Lui confier une arme", fx: { upgrade: 1 } }, { n: "Lui demander conseil", fx: { xp: 50 } }] },
  { id: "enfant", n: "L'enfant perdue", t: "Une petite fille en blanc pleure au milieu du chemin. Elle n'a pas d'ombre.", ch: [
    { n: "La consoler", fx: { gamble: [.5, { heal: .3, morale: 15 }, { fight: 1, morale: -10 }] } }, { n: "Fuir", fx: { light: -10 } }] },
  { id: "source", n: "Source claire", t: "Une source d'eau pure, chose impossible ici.", ch: [
    { n: "Boire", fx: { heal: .35 } }, { n: "Remplir les gourdes", fx: { potion: 1 } }] },
  { id: "pendus", n: "Le gibet", t: "Trois pendus se balancent. L'un d'eux porte encore une belle bague.", ch: [
    { n: "Prendre la bague", fx: { trinket: 1, morale: -8 } }, { n: "Les dépendre et les enterrer", fx: { morale: 15, light: -8 } }] },
  { id: "chaudron", n: "Le chaudron de la sorcière", t: "Une potion bouillonne. Elle sent la menthe… et le soufre.", ch: [
    { n: "En boire une gorgée", fx: { gamble: [.6, { buff: 1 }, { hurt: .1, poison: 1 }] } }, { n: "Renverser le chaudron", fx: { mat: 2 } }] },
  { id: "pretre", n: "Le prêtre fou", t: "« Repentez-vous ! » hurle un prêtre en haillons, une torche à la main.", ch: [
    { n: "Se confesser", fx: { morale: 12, cleanse: 1 } }, { n: "Lui prendre sa torche", fx: { light: 25, morale: -5 } }, { n: "L'ignorer", fx: {} }] },  { id: "ossuaire", n: "L'ossuaire", t: "Des crânes empilés jusqu'à la voûte. L'un d'eux porte une couronne de fer rouillée.", ch: [
    { n: "Prendre la couronne", fx: { gamble: [.5, { relic: 1 }, { fight: 1 }] } }, { n: "Réciter une prière des morts", fx: { morale: 10, light: 10 } }, { n: "Fouiller les os", fx: { mat: 3, morale: -6 } }] },
  { id: "deserteur", n: "Le déserteur", t: "Un soldat blessé, l'uniforme du Bastion en lambeaux. « Ne me ramenez pas… ils me pendront. »", ch: [
    { n: "Lui donner une potion", fx: { potionCost: 1, gold: 120, morale: 8 } }, { n: "Le dépouiller", fx: { trinket: 1, morale: -12 } }, { n: "Le laisser partir", fx: { morale: 4 } }] },
  { id: "statue", n: "La statue qui pleure", t: "Une sainte de pierre verse des larmes de sang. Le sol autour est fertile, étrangement.", ch: [
    { n: "Recueillir les larmes", fx: { heal: .3, cleanse: 1 } }, { n: "Briser la statue", fx: { gold: 70, curse: 1 } }, { n: "S'agenouiller", fx: { xp: 60 } }] },
  { id: "tanniere", n: "Le hurlement", t: "Un hurlement tout proche. Des traces énormes, encore fraîches, mènent à une tanière.", ch: [
    { n: "Suivre les traces", fx: { fight: 1, loot: 1 } }, { n: "Poser des pièges", fx: { petXp: 40, morale: 5 } }, { n: "Faire un détour", fx: { light: -12 } }] },
  { id: "aveugle", n: "La prêtresse aveugle", t: "« Je vois votre fin, voyageurs. Voulez-vous la connaître ? »", ch: [
    { n: "Écouter la prophétie", fx: { gamble: [.5, { buff: 1, morale: 12 }, { morale: -15 }] } }, { n: "Lui offrir 50 or", fx: { cost: 50, relic: 1 } }, { n: "Refuser", fx: {} }] },
  { id: "pont", n: "Le pont effondré", t: "Le pont est à moitié écroulé au-dessus d'un gouffre. Il y a peut-être un autre chemin.", ch: [
    { n: "Traverser quand même", fx: { gamble: [.65, { light: 5, xp: 40 }, { hurt: .18 }] } }, { n: "Chercher un passage", fx: { light: -15, loot: 1 } }] },
  { id: "fontaine", n: "La fontaine aux pièces", t: "Une fontaine pleine de pièces d'or, gardée par une inscription : « Qui prend sera pris. »", ch: [
    { n: "Prendre l'or", fx: { gold: 160, curse: 1 } }, { n: "Jeter une pièce (20 or)", fx: { cost: 20, heal: .2, morale: 6 } }, { n: "Passer", fx: {} }] },
  { id: "forge_ruine", n: "La forge en ruine", t: "Une forge éteinte depuis cent ans. Le soufflet fonctionne encore.", ch: [
    { n: "Rallumer la forge", fx: { upgrade: 1, light: -8 } }, { n: "Récupérer le métal", fx: { mat: 4 } }] },
  { id: "corbeaux", n: "L'assemblée des corbeaux", t: "Des centaines de corbeaux, immobiles, vous fixent. Un seul croasse.", ch: [
    { n: "Leur jeter de la nourriture", fx: { petXp: 50, relic: 1, light: -10 } }, { n: "Les disperser", fx: { gamble: [.5, { gold: 60 }, { fight: 1 }] } }] },
  { id: "chevalier_mort", n: "Le chevalier agenouillé", t: "Un chevalier mort, agenouillé, les mains sur son épée. Sa visière est relevée : il sourit.", ch: [
    { n: "Prendre son épée", fx: { loot: 1, gamble: [.6, {}, { fight: 1 }] } }, { n: "Lui fermer les yeux", fx: { morale: 14 } }] },
  { id: "brume", n: "La brume rouge", t: "Une brume écarlate envahit le chemin. Elle sent le fer et la rose.", ch: [
    { n: "La traverser en courant", fx: { hurt: .08, light: 5 } }, { n: "Attendre qu'elle se dissipe", fx: { light: -15, heal: .1 } }, { n: "La respirer", fx: { gamble: [.5, { buff: 1 }, { poison: 1 }] } }] },
  { id: "cachot", n: "Le cachot", t: "Derrière une grille, un prisonnier squelettique tend la main. « La clé… elle est là, sous la dalle. »", ch: [
    { n: "Le libérer", fx: { gamble: [.6, { gold: 90, morale: 10 }, { fight: 1 }] } }, { n: "Prendre la clé pour vous", fx: { trinket: 1, morale: -10 } }, { n: "Partir", fx: {} }] },
  { id: "banquet", n: "Le banquet fantôme", t: "Une longue table dressée, des chandelles, un festin fumant. Aucun convive. Une chaise vide par héros.", ch: [
    { n: "S'asseoir et manger", fx: { gamble: [.55, { heal: .45, morale: 10 }, { hurt: .15, morale: -10 }] } }, { n: "Voler l'argenterie", fx: { gold: 110, morale: -5 } }, { n: "Souffler les chandelles", fx: { light: 20 } }] },
  { id: "flagellants", n: "La procession", t: "Des flagellants passent en chantant, le dos en sang. Leur chef vous tend un fouet.", ch: [
    { n: "Se joindre à eux", fx: { hurt: .1, xp: 70, morale: 8 } }, { n: "Leur acheter des cierges (40 or)", fx: { cost: 40, light: 35 } }, { n: "Les éviter", fx: {} }] },

];
// bâtiments du Bastion
const BUILDINGS = {
  taverne: { n: "Taverne du Pendu", ic: "tavern", d: "Recrutez des héros. Plus elle grandit, plus les recrues sont nombreuses et aguerries.", max: 5, cost: [0, 250, 700, 1600, 3200], shards: [0, 0, 1, 2, 4] },
  forge: { n: "Forge noire", ic: "anvil", d: "Fabriquez et améliorez l'équipement. Chaque niveau débloque un palier d'armure ; le palier VI (ascendant) est réservé aux héros évolués et révèle leur apparence finale.", max: 6, cost: [0, 300, 800, 1800, 3600, 7500], shards: [0, 0, 1, 2, 4, 6] },
  chapelle: { n: "Chapelle en ruine", ic: "chapel", d: "Soignez les blessés. Chaque niveau ajoute une potion par expédition.", max: 5, cost: [0, 200, 600, 1400, 3000], shards: [0, 0, 1, 2, 3] },
  academie: { n: "Salle des maîtres", ic: "book", d: "Entraînez les compétences. Chaque niveau élève le rang maximal des compétences.", max: 5, cost: [0, 300, 800, 1800, 3600], shards: [0, 1, 1, 2, 4] },
  menagerie: { n: "Ménagerie", ic: "paw", d: "Adoptez et entraînez des compagnons.", max: 5, cost: [0, 250, 700, 1600, 3200], shards: [0, 0, 1, 2, 3] },
  fonderie: { n: "Fonderie d'âmes", ic: "furnace", d: "Elle produit de l'or même quand vous êtes absent.", max: 5, cost: [0, 200, 600, 1500, 3000], shards: [0, 0, 1, 2, 3] },
};
// succès
const ACHIEVEMENTS = [
  { id: "premier_sang", n: "Premier sang", d: "Gagner un combat.", k: "wins", v: 1, gold: 50 },
  { id: "cent_morts", n: "Fossoyeur", d: "Tuer 100 ennemis.", k: "kills", v: 100, gold: 200 },
  { id: "mille_morts", n: "Faucheur", d: "Tuer 1 000 ennemis.", k: "kills", v: 1000, gold: 800 },
  { id: "boss1", n: "Médecin, guéris-toi", d: "Vaincre le Docteur Peste.", k: "boss_bourg", v: 1, shards: 1 },
  { id: "boss2", n: "Élagueur", d: "Vaincre la Mère des Ronces.", k: "boss_foret", v: 1, shards: 1 },
  { id: "boss3", n: "Repos éternel", d: "Vaincre la Liche couronnée.", k: "boss_catacombes", v: 1, shards: 2 },
  { id: "boss4", n: "Eaux claires", d: "Vaincre la Mère des Noyés.", k: "boss_marais", v: 1, shards: 2 },
  { id: "boss5", n: "Régicide", d: "Vaincre le Roi de Cendres.", k: "boss_citadelle", v: 1, shards: 3 },
  { id: "abime10", n: "Plongeur", d: "Atteindre la profondeur 10 de l'Abîme.", k: "abyss", v: 10, shards: 2 },
  { id: "abime25", n: "Sans fond", d: "Atteindre la profondeur 25 de l'Abîme.", k: "abyss", v: 25, shards: 4 },
  { id: "abime50", n: "Celui qui revient", d: "Atteindre la profondeur 50 de l'Abîme.", k: "abyss", v: 50, shards: 8 },
  { id: "evolution", n: "Métamorphose", d: "Faire évoluer un héros.", k: "evos", v: 1, gold: 150 },
  { id: "apex", n: "Apogée", d: "Faire atteindre l'apogée (niveau 18) à un héros.", k: "apex", v: 1, shards: 1 },
  { id: "legende", n: "Légende", d: "Faire atteindre le niveau 20 à un héros.", k: "maxlvl", v: 1, shards: 3 },
  { id: "armee", n: "Une petite armée", d: "Avoir 10 héros.", k: "roster", v: 10, gold: 300 },
  { id: "toutes_classes", n: "Toutes les voies", d: `Recruter les ${CLASS_IDS.length} classes.`, k: "classes", v: CLASS_IDS.length, shards: 2 },
  { id: "forge_t5", n: "Acier royal", d: "Forger un équipement de palier V.", k: "tier5", v: 1, shards: 2 },
  { id: "legendaire", n: "Trésor des rois", d: "Obtenir un objet légendaire.", k: "legend", v: 1, gold: 400 },
  { id: "menagerie", n: "Dresseur", d: "Posséder 6 compagnons.", k: "pets", v: 6, gold: 500 },
  { id: "evo_pet", n: "Bête mythique", d: "Faire évoluer un compagnon.", k: "petEvo", v: 1, shards: 1 },
  { id: "sans_perte", n: "Personne ne reste derrière", d: "Finir une expédition sans qu'aucun héros ne tombe.", k: "flawless", v: 1, gold: 200 },
  { id: "serment5", n: "Serment de fer", d: "Vaincre un gardien de l'Abîme avec 5 serments.", k: "oath", v: 5, shards: 3 },
  { id: "quotidien", n: "Fidèle au poste", d: "Terminer 7 expéditions du jour.", k: "daily", v: 7, shards: 2 },
  { id: "riche", n: "Trésor de guerre", d: "Posséder 10 000 or.", k: "goldMax", v: 10000, shards: 1 },
];
// serments de l'Abîme : la difficulté choisie, pour plus de récompenses
const OATHS = {
  sang: { n: "Serment du sang", d: "Les ennemis infligent +15 % de dégâts.", v: .15 },
  fer: { n: "Serment du fer", d: "Les ennemis ont +20 % de PV.", v: .2 },
  nuit: { n: "Serment de la nuit", d: "La lueur baisse deux fois plus vite.", v: 1 },
  jeune: { n: "Serment du jeûne", d: "Une potion de moins.", v: 1 },
  hate: { n: "Serment de la hâte", d: "Les ennemis ont +2 de vitesse.", v: 2 },
  elite: { n: "Serment de l'élite", d: "Plus d'élites sur la carte.", v: 1 },
  pierre: { n: "Serment de pierre", d: "Les ennemis ont +10 % de protection.", v: .1 },
  silence: { n: "Serment du silence", d: "Les ultimes se chargent 30 % moins vite.", v: .3 },
};
