/* Contenu additionnel du 12 nov. : 24 événements (dont 2 par chapitre XI–XX), 12 reliques, 12 succès. */
const MORE_EVENTS2 = [
  // ── généraux ──
  ["puits_voix", "Le puits qui parle", "Au fond d'un puits sec, une voix compte des pièces. Elle s'arrête quand vous vous penchez.", [["Descendre une corde", EVG(.5, { gold: 160, loot: 1 }, { hurt: .12 })], ["Jeter une pièce", { cost: 10, morale: 10, light: 8 }], ["Reboucher le puits", { xp: 25 }]]],
  ["forgeron_mort", "La forge abandonnée", "Une enclume encore tiède, un marteau posé dessus. Personne. Juste l'odeur du métal chaud.", [["Reforger une arme", { upgrade: 1 }], ["Fouiller les cendres", { mat: 3, ess: 1 }], ["Prier pour le forgeron", { morale: 8 }]]],
  ["pelerins_aveugles", "Les pèlerins aveugles", "Une file de pèlerins aux yeux bandés avance en chantant. Le dernier vous tend la main.", [["Les guider un moment", { xp: 45, light: -8 }], ["Leur demander l'aumône", EVG(.5, { gold: 90 }, { curse: 1 })], ["Les laisser passer", { morale: 5 }]]],
  ["corbeau_messager", "Le corbeau messager", "Un corbeau se pose sur l'épaule du plus jeune, une lettre scellée à la patte. Le sceau porte une couronne brisée.", [["Lire la lettre", { bossWeak: .08, xp: 20 }], ["Brûler la lettre", { light: 12 }], ["Nourrir le corbeau", { petXp: 80, morale: 6 }]]],
  ["autel_sang", "L'autel de sang", "Une pierre creusée, encore humide. Une inscription : « Donne, et tu frapperas. »", [["Offrir son sang", { hurt: .12, buff: 1 }], ["Laver l'autel", { cleanse: 1, morale: 10 }], ["Le profaner", EVG(.4, { relic: 1 }, { curse: 1, fight: 1 })]]],
  ["chariot_renverse", "Le chariot renversé", "Un chariot de marchand renversé dans le fossé. Les chevaux ont disparu, les caisses sont intactes.", [["Ouvrir les caisses", EVG(.65, { loot: 1, gold: 60 }, { fight: 1 })], ["Récupérer les roues", { mat: 4 }], ["Chercher le marchand", { xp: 30, potion: 1 }]]],
  ["miroir_noir", "Le miroir noir", "Un miroir sans reflet. Quand vous vous éloignez, votre reflet apparaît — et reste.", [["Lui parler", EVG(.5, { xp: 70, trinket: 1 }, { morale: -12 })], ["Le retourner", { light: 10 }], ["Le briser", { curse: 1, relic: 1 }]]],
  ["veilleur_tour", "Le veilleur de la tour", "Un vieux veilleur garde une tour sans porte. « Je surveille ce qui vient. Vous, peut-être. »", [["Monter avec lui", { light: 20, xp: 25 }], ["Lui laisser des vivres", { potionCost: 1, morale: 15 }], ["Lui demander la route", { bossWeak: .05 }]]],
  ["source_claire", "La source claire", "Une eau pure au milieu de la pourriture. Trop pure.", [["Boire", EVG(.7, { heal: .3 }, { poison: 1 })], ["Remplir les gourdes", { potion: 1 }], ["N'y pas toucher", {}]]],
  ["duel_spectre", "Le duel du spectre", "Un chevalier spectral barre la route et lève son épée en salut. Il attend un champion.", [["Accepter le duel", EVG(.55, { xp: 90, trinket: 1 }, { hurt: .2 })], ["Saluer et passer", { morale: 8 }], ["Le prendre à revers", { fight: 1, curse: 1 }]]],
  ["marche_ombre", "Le marché des ombres", "Des étals sans marchands. Sur chacun, un prix écrit à la craie, et une boîte pour payer.", [["Payer honnêtement", { cost: 60, loot: 1 }], ["Se servir", { loot: 1, curse: 1 }], ["Laisser une offrande", { cost: 20, morale: 12 }]]],
  ["tambour_lointain", "Le tambour lointain", "Un tambour bat quelque part, au rythme exact de vos pas. Quand vous vous arrêtez, il s'arrête.", [["Presser le pas", { light: -10, xp: 40 }], ["Battre la mesure", { morale: 14 }], ["Tendre une embuscade", EVG(.5, { relic: 1 }, { fight: 1 })]]],
  // ── chapitres XI–XX ──
  ["racine_coeur", "La racine qui bat", "Une racine grosse comme un tronc pulse sous vos pieds, chaude et régulière.", [["L'entailler", EVG(.5, { ess: 4, xp: 40 }, { poison: 1 })], ["Poser la main dessus", { heal: .2 }], ["S'éloigner", {}]], ["racines"]],
  ["graines_luisantes", "Les graines luisantes", "Des graines phosphorescentes jonchent le sol. Elles roulent vers vous.", [["En ramasser", { trinket: 1, curse: 1 }], ["Les écraser", { light: 15 }], ["Les planter", { morale: 10, xp: 25 }]], ["racines"]],
  ["statue_sel", "La statue de sel", "Un voyageur figé dans le sel, la bouche ouverte sur un cri. Sa bourse pend encore à sa ceinture.", [["Prendre la bourse", { gold: 180, curse: 1 }], ["Briser la statue", { mat: 3, ess: 2 }], ["Prier pour lui", { morale: 12 }]], ["sel"]],
  ["mirage_oasis", "Le mirage", "Une oasis au loin. Puis une autre. Puis une troisième, au même endroit.", [["Marcher vers elles", EVG(.4, { heal: .35, potion: 1 }, { hurt: .15, light: -10 })], ["Suivre la trace de sel", { xp: 35 }], ["Attendre la nuit", { light: -5, morale: 8 }]], ["sel"]],
  ["corde_neuve", "La corde neuve", "Au pied d'un gibet, une corde neuve, soigneusement roulée, comme un cadeau.", [["La prendre", EVG(.5, { trinket: 1 }, { morale: -15 })], ["La brûler", { light: 15, cleanse: 1 }], ["La laisser", { morale: 4 }]], ["pendus"]],
  ["chant_silence", "Le chant du silence", "Des moines chantent sans un son. Vous entendez pourtant chaque mot.", [["Chanter avec eux", { morale: 18, light: -8 }], ["Les interrompre", { fight: 1 }], ["Écouter jusqu'au bout", { xp: 60 }]], ["monastere"]],
  ["echo_soi", "Votre propre écho", "Votre voix vous revient avec un temps de retard — puis avec des mots que vous n'avez pas dits.", [["Lui répondre", EVG(.5, { xp: 80 }, { morale: -12 })], ["Se taire", { light: 10 }], ["Crier plus fort", { buff: 1 }]], ["echo"]],
  ["epave_braise", "L'épave en braise", "Une épave brûle sans se consumer au bord de la mer de cendres. Sa cale est intacte.", [["Fouiller la cale", EVG(.6, { loot: 1, gold: 120 }, { hurt: .15 })], ["Récupérer les clous", { mat: 5 }], ["Éteindre les flammes", { light: 20 }]], ["mer_cendres"]],
  ["confessionnal", "Le confessionnal inversé", "Le confessionnal est à l'envers. De l'autre côté de la grille, quelqu'un attend votre confession.", [["Se confesser", { cleanse: 1, morale: 12 }], ["Écouter la sienne", { bossWeak: .1, morale: -6 }], ["Arracher la grille", { relic: 1, curse: 1 }]], ["cathedrale"]],
  ["jardinier_absent", "Les outils du jardinier", "Une brouette de crânes, une pelle d'os, des gants de cuir sombre. Le jardinier ne doit pas être loin.", [["Prendre les gants", { trinket: 1 }], ["Enterrer les crânes", { xp: 40, morale: 8 }], ["Attendre le jardinier", { fight: 1, xp: 30 }]], ["jardin_os"]],
  ["etoile_tombee", "L'étoile tombée", "Un éclat de lumière froide fume au fond d'un cratère. Il chante très doucement.", [["L'emporter", { ess: 5, light: 15 }], ["Le briser", EVG(.5, { relic: 1 }, { hurt: .2 })], ["Le laisser chanter", { morale: 15 }]], ["faille"]],
  ["battement", "Le grand battement", "Le sol se soulève et retombe. Tout bat, ici. Vous aussi, à son rythme.", [["Se caler sur le rythme", { buff: 1, morale: 10 }], ["Résister", { xp: 50, hurt: .1 }], ["Frapper le sol", EVG(.5, { bossWeak: .12 }, { fight: 1 })]], ["coeur"]],
];
for (const [id, n, t, ch, reg] of MORE_EVENTS2) if (!EVENTS.some(e => e.id === id)) EVENTS.push({ id, n, t, ch: ch.map(([cn, fx]) => ({ n: cn, fx })), reg });

Object.assign(RELICS, {
  clou_gibet: { n: "Clou de gibet", r: 0, d: "+8 % de chance de critique.", h: { crit: 8 } },
  sablier_sel: { n: "Sablier de sel", r: 0, d: "+2 de vitesse pour tout le groupe.", h: { spd: 2 } },
  cierge_moine: { n: "Cierge du moine muet", r: 0, d: "Soigne le groupe de 10 % après chaque combat.", h: { postHeal: .1 } },
  racine_seche: { n: "Racine séchée", r: 0, d: "+6 % de protection.", h: { prot: .06 } },
  ancre_cendre: { n: "Ancre de cendre", r: 1, d: "+12 % de PV max.", h: { hp: .12 } },
  cloche_fendue: { n: "Cloche fendue", r: 1, d: "+12 % de dégâts et +6 % de chance de critique.", h: { dmg: .12, crit: 6 } },
  os_jardinier: { n: "Os du jardinier", r: 1, d: "Chaque ennemi tué soigne le tueur de 6 % de ses PV.", h: { killHeal: .06 } },
  echo_epee: { n: "Écho d'épée", r: 1, d: "+15 % de dégâts quand la lueur est sous 50.", h: { darkDmg: .15, dmg: .05 } },
  eclat_etoile: { n: "Éclat d'étoile froide", r: 2, d: "Soigne le groupe de 3 % au début de chaque tour, +8 % de dégâts.", h: { roundHeal: .03, dmg: .08 } },
  couronne_sel: { n: "Couronne de sel", r: 2, d: "+20 % de PV max et +8 % de protection.", h: { hp: .2, prot: .08 } },
  coeur_battant: { n: "Cœur qui bat encore", r: 2, d: "+25 % de dégâts et +3 de vitesse.", h: { dmg: .25, spd: 3 } },
  sceau_pape: { n: "Sceau du Pape d'en bas", r: 2, d: "+40 % de dégâts, mais −10 % de PV max.", h: { dmg: .4, hp: -.1 }, cursed: 1 },
});

if (typeof ACHIEVEMENTS !== "undefined") ACHIEVEMENTS.push(
  { id: "c2_mille", n: "Faucheur", d: "Tuer 1 000 ennemis.", k: "kills", v: 1000, gold: 800 },
  { id: "c2_cinqmille", n: "Fléau des Ombres", d: "Tuer 5 000 ennemis.", k: "kills", v: 5000, gold: 3000 },
  { id: "c2_victoires", n: "Vétéran des routes", d: "Gagner 500 combats.", k: "wins", v: 500, gold: 1200 },
  { id: "c2_victoires2", n: "Infatigable", d: "Gagner 2 000 combats.", k: "wins", v: 2000, gold: 4000 },
  { id: "c2_niv40", n: "Au-delà des légendes", d: "Amener un héros au niveau 40.", k: "maxlvl", v: 40, gold: 1500 },
  { id: "c2_niv60", n: "Presque immortel", d: "Amener un héros au niveau 60.", k: "maxlvl", v: 60, gold: 4000 },
  { id: "c2_roster", n: "Une armée entière", d: "Compter 20 héros au Bastion.", k: "roster", v: 20, gold: 1500 },
  { id: "c2_pets", n: "La grande ménagerie", d: "Posséder 25 compagnons.", k: "pets", v: 25, gold: 2000 },
  { id: "c2_abime", n: "Au fond du gouffre", d: "Atteindre la profondeur 25 de l'Abîme.", k: "abyss", v: 25, gold: 3000 },
  { id: "c2_daily", n: "Fidèle au poste", d: "Réussir 20 expéditions du jour.", k: "daily", v: 20, gold: 1500 },
  { id: "c2_flawless", n: "Sans une égratignure", d: "Terminer 25 expéditions sans perte.", k: "flawless", v: 25, gold: 2000 },
  { id: "c2_or", n: "Trésor de guerre", d: "Posséder 1 000 000 d'or.", k: "goldMax", v: 1000000, gold: 10000 },
);
