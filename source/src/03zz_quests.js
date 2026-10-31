// ── Quêtes de région (3 étapes, sur plusieurs expéditions) et événements de compagnon ──
// Étape 1 : événement ordinaire du chapitre (pose un drapeau de sauvegarde). Étapes 2 et 3 : suites (sneed).
// La dernière étape agit sur le gardien de l'expédition en cours : bossWeak (−PV) ou bossRage (+PV, butin en plus).
const QUEST_EVENTS = [
  // Bourg pestiféré
  ["q_bourg1", "La cloche fêlée", "Dans le clocher éventré, une cloche fendue sonne seule. Gravée à l'intérieur : « Trois coups pour le médecin, et il descendra. »", [["Noter l'inscription", { sflag: "q_bourg1", xp: 20 }], ["Faire taire la cloche", { morale: 6 }]], { reg: ["bourg"], snot: ["q_bourg1", "q_bourg2"] }],
  ["q_bourg2", "Le carnet du médecin", "Vous retrouvez la maison du vieux médecin. Un carnet couvert de croquis de becs et de fioles, et une liste de noms barrés.", [["Garder le carnet", { sflag: "q_bourg2", xp: 40 }], ["Brûler la maison", { light: 20, morale: 5 }]], { reg: ["bourg"], sneed: "q_bourg1" }],
  ["q_bourg3", "Le remède du Docteur", "Le carnet mène à une cave : l'antidote que le Docteur n'a jamais su utiliser. Ou la souche pure de sa peste.", [["Emporter l'antidote (gardien affaibli)", { bossWeak: .2, heal: .2 }], ["Briser la souche dans les égouts (gardien enragé, butin)", { bossRage: .2, gold: 120 }]], { reg: ["bourg"], sneed: "q_bourg2" }],
  // Forêt des Pendus
  ["q_foret1", "La corde coupée", "Un pendu a été décroché. Des traces de pas d'enfant s'éloignent vers les ronces.", [["Suivre les traces", { sflag: "q_foret1", petXp: 40 }], ["Rependre le corps, par prudence", { morale: -3, xp: 20 }]], { reg: ["foret"], snot: ["q_foret1", "q_foret2"] }],
  ["q_foret2", "Le cercle de pierres", "Au cœur des ronces, un cercle de pierres. Des poupées de racines y sont alignées, chacune avec un nom.", [["Prendre la poupée qui porte le nom d'un de vos héros", { sflag: "q_foret2", relic: 1 }], ["Tout brûler", { light: 25 }]], { reg: ["foret"], sneed: "q_foret1" }],
  ["q_foret3", "Le cœur de la Mère", "La poupée vous conduit au cœur battant de la forêt : une graine noire, chaude comme une main.", [["Planter du sel autour (gardien affaibli)", { bossWeak: .2, morale: 10 }], ["Arroser la graine de sang (gardien enragé, butin)", { bossRage: .2, loot: 1 }]], { reg: ["foret"], sneed: "q_foret2" }],
  // Catacombes
  ["q_cata1", "Le psautier inachevé", "Sur un lutrin, un psautier dont la dernière page est restée blanche. L'encre est encore humide.", [["Prendre le psautier", { sflag: "q_cata1", xp: 30 }], ["Écrire votre nom sur la page", { morale: 8, curse: 1 }]], { reg: ["catacombes"], snot: ["q_cata1", "q_cata2"] }],
  ["q_cata2", "Le moine qui chante", "Un squelette agenouillé chante encore la même note. Le psautier frémit entre vos mains.", [["Lui lire la dernière prière", { sflag: "q_cata2", heal: .15 }], ["Briser sa mâchoire", { mat: 3 }]], { reg: ["catacombes"], sneed: "q_cata1" }],
  ["q_cata3", "La crypte scellée", "La prière ouvre une crypte. À l'intérieur, l'os de saint qui garde la liche prisonnière de sa propre éternité.", [["Bénir l'os (gardien affaibli)", { bossWeak: .2, light: 20 }], ["Le voler (gardien enragé, butin)", { bossRage: .2, relic: 1 }]], { reg: ["catacombes"], sneed: "q_cata2" }],
  // Marais des Noyés
  ["q_marais1", "La barque vide", "Une barque dérive, une lanterne allumée à la proue. Quelqu'un attendait un passager.", [["Monter à bord", { sflag: "q_marais1", light: 15 }], ["La couler", { mat: 2 }]], { reg: ["marais"], snot: ["q_marais1", "q_marais2"] }],
  ["q_marais2", "Le passeur", "La barque vous mène à un vieillard aux yeux laiteux. « Une pièce pour l'aller. Le retour, c'est elle qui décide. »", [["Payer le passeur (40 or)", { cost: 40, sflag: "q_marais2" }], ["Le menacer", { fight: 1, gold: 50 }]], { reg: ["marais"], sneed: "q_marais1" }],
  ["q_marais3", "Le nom de la Mère", "Le passeur murmure enfin le vrai nom de la Mère des Noyés, celui qu'elle portait vivante.", [["Le prononcer face à l'eau (gardien affaibli)", { bossWeak: .2, morale: 12 }], ["Le garder pour la provoquer (gardien enragé, butin)", { bossRage: .2, gold: 150 }]], { reg: ["marais"], sneed: "q_marais2" }],
  // Citadelle
  ["q_cit1", "Le blason effacé", "Sur un mur de la Citadelle, un blason a été gratté au couteau. Il reste une couronne et un loup.", [["Recopier ce qu'il en reste", { sflag: "q_cit1", xp: 40 }], ["L'achever", { morale: 5 }]], { reg: ["citadelle"], snot: ["q_cit1", "q_cit2"] }],
  ["q_cit2", "Le chambellan", "Un spectre en livrée vous reconnaît. « Le blason… Vous cherchez le frère du Roi. Personne ne le cherche plus. »", [["Le suivre", { sflag: "q_cit2", light: 20 }], ["Le chasser", { xp: 30 }]], { reg: ["citadelle"], sneed: "q_cit1" }],
  ["q_cit3", "La lettre du frère", "Dans une chambre murée, la lettre du frère trahi : la faiblesse du Roi y est écrite noir sur blanc.", [["Lire la lettre (gardien affaibli)", { bossWeak: .25, buff: 1 }], ["La lui rendre en face (gardien enragé, butin)", { bossRage: .25, loot: 1, relic: 1 }]], { reg: ["citadelle"], sneed: "q_cit2" }],
];
for (const [id, n, t, ch, o] of QUEST_EVENTS) EVENTS.push(Object.assign({ id, n, t, ch: ch.map(([cn, fx]) => ({ n: cn, fx })), quest: 1 }, o, o.sneed ? { chain: 1 } : {}));

// événements de compagnon : seulement si un compagnon accompagne le groupe
const PET_EVENTS = [
  ["pet_trouvaille", "Une trouvaille", "Votre compagnon gratte furieusement le sol, puis lève la tête, fier, quelque chose entre les crocs.", [["Voir ce qu'il a trouvé", { loot: 1, petXp: 40 }], ["Le récompenser", { morale: 8, petXp: 60 }]]],
  ["pet_fugue", "La fugue", "Votre compagnon a flairé quelque chose et file dans l'obscurité sans se retourner.", [["Le suivre", { gamble: [.6, { gold: 90, petXp: 60 }, { hurt: .08, light: -10 }] }], ["L'attendre", { light: -10, morale: -4 }], ["L'appeler sèchement", { morale: -2 }]]],
  ["pet_allie", "Un ami de la meute", "Votre compagnon revient accompagné : une bête sauvage de son espèce, blessée, qui vous observe sans crainte.", [["Soigner la bête (une potion)", { potionCost: 1, buff: 1, petXp: 80 }], ["La laisser repartir", { morale: 6 }]]],
  ["pet_garde", "Veille de nuit", "Pendant votre halte, votre compagnon reste éveillé. À l'aube, des traces de griffes entourent le camp.", [["Le remercier", { heal: .15, morale: 10 }], ["Suivre les traces", { fight: 1, gold: 60, petXp: 50 }]]],
  ["pet_os", "L'os maudit", "Votre compagnon a rapporté un os gravé de runes. Il refuse de le lâcher et gronde quand on approche.", [["Le lui laisser", { petXp: 100, curse: 1 }], ["Le lui arracher", { gamble: [.5, { relic: 1 }, { petHurt: 1 }] }]]],
  ["pet_eclaireur", "L'éclaireur", "Votre compagnon part en avant et revient, nerveux. Il tourne autour de vos jambes en grondant vers le chemin.", [["Écouter son instinct", { light: 15, buff: 1 }], ["Ignorer et avancer", { fight: 1, xp: 40 }]]],
];
for (const [id, n, t, ch] of PET_EVENTS) EVENTS.push({ id, n, t, ch: ch.map(([cn, fx]) => ({ n: cn, fx })), pet: 1 });
