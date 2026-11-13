/* Quêtes de région des chapitres VI–XVII (3 étapes, même mécanique que 03zz_quests : sflag → sneed, dernière étape bossWeak/bossRage). */
const QUEST_EVENTS3 = [
  ["terres", "La braise qui parle", [
    ["Une braise qui ne s'éteint pas murmure un nom de cardinal.", ["L'enfermer dans une lanterne", { xp: 40 }], ["L'écraser", { light: 10 }]],
    ["Le nom mène à une chapelle calcinée : un registre de pénitences, à demi brûlé.", ["Sauver le registre", { xp: 60 }], ["Le laisser brûler", { morale: 6 }]],
    ["Le registre révèle la pénitence que le Cardinal n'a jamais accomplie.", ["L'accomplir à sa place (gardien affaibli)", { bossWeak: .2, heal: .15 }], ["La retourner contre lui (gardien enragé, butin)", { bossRage: .2, gold: 200 }]]]],
  ["cimes", "Le cor gelé", [
    ["Pris dans la glace, un cor de chasse. Quand le vent passe, il sonne une note.", ["Le dégager", { xp: 40 }], ["Le laisser chanter", { morale: 8 }]],
    ["Un refuge de chasseurs morts de froid, tous tournés vers la montagne.", ["Fouiller les sacs", { xp: 60, potion: 1 }], ["Les ensevelir", { morale: 10 }]],
    ["Le carnet du dernier chasseur dessine le passage où dort la bête des Cimes.", ["Prendre le passage (gardien affaibli)", { bossWeak: .2, buff: 1 }], ["Sonner le cor (gardien enragé, butin)", { bossRage: .2, gold: 220 }]]]],
  ["cite", "La clé noyée", [
    ["Une clé rouillée flotte à la surface, impossible : elle est en fer.", ["La repêcher", { xp: 40 }], ["La laisser couler", { light: 8 }]],
    ["La clé ouvre une maison sèche au fond des eaux. Une table mise pour sept.", ["S'asseoir", { xp: 60, morale: -4 }], ["Compter les couverts", { light: 12 }]],
    ["Le septième couvert porte le nom du gardien de la Cité, et sa promesse rompue.", ["Tenir la promesse (gardien affaibli)", { bossWeak: .22 }], ["La briser une seconde fois (gardien enragé, butin)", { bossRage: .22, gold: 240 }]]]],
  ["mines", "Le dernier filon", [
    ["Un mineur fantôme pioche la roche en boucle, toujours au même endroit.", ["Piocher avec lui", { mat: 3, xp: 30 }], ["Le laisser travailler", { morale: 6 }]],
    ["Derrière la roche, un filon d'argent marqué d'une croix à la craie.", ["Suivre le filon", { xp: 60 }], ["Effacer la croix", { light: 10 }]],
    ["Le filon passe sous la tanière du gardien. Le plafond tient à peine.", ["Étayer et contourner (gardien affaibli)", { bossWeak: .22, heal: .15 }], ["Faire tout s'effondrer (gardien enragé, butin)", { bossRage: .22, gold: 260 }]]]],
  ["trone", "La couronne vide", [
    ["Sur les marches du Trône, une couronne posée sur un coussin — sans tête pour la porter.", ["La regarder longtemps", { xp: 40, morale: -4 }], ["La recouvrir", { light: 10 }]],
    ["Un héraut fantôme répète une proclamation que personne n'écoute plus.", ["L'écouter jusqu'au bout", { xp: 70 }], ["Le faire taire", { morale: 6 }]],
    ["La proclamation nomme l'héritier légitime — et ce n'est pas celui qui règne.", ["Proclamer l'héritier (gardien affaibli)", { bossWeak: .25, buff: 1 }], ["Ceindre la couronne (gardien enragé, butin)", { bossRage: .25, gold: 300 }]]]],
  ["racines", "La première graine", [
    ["Une graine brille au creux d'une racine. Elle bat comme un cœur.", ["La recueillir", { xp: 50 }], ["La recouvrir de terre", { morale: 8 }]],
    ["La graine germe dans vos mains et pointe une direction.", ["La suivre", { xp: 70, light: 10 }], ["La rendre à la terre", { heal: .15 }]],
    ["Elle mène au cœur de la Mère des Racines, là où tout a commencé.", ["La planter là (gardien affaibli)", { bossWeak: .25 }], ["La dévorer (gardien enragé, butin)", { bossRage: .25, gold: 320, curse: 1 }]]]],
  ["sel", "Le pas dans le sel", [
    ["Des empreintes fraîches dans le sel, qui commencent nulle part.", ["Les suivre", { xp: 50 }], ["Les effacer", { light: 10 }]],
    ["Les pas mènent à une couronne de sel brisée en deux.", ["Ramasser les morceaux", { xp: 70 }], ["Les disperser", { morale: 8 }]],
    ["Réunis, les morceaux montrent le visage de la Reine avant le sel.", ["Lui rendre son visage (gardien affaibli)", { bossWeak: .25, heal: .2 }], ["Briser la couronne (gardien enragé, butin)", { bossRage: .25, gold: 340 }]]]],
  ["cathedrale", "La prière à l'envers", [
    ["Sur un pilier, une prière gravée à l'envers. Lue dans un miroir, elle a un sens.", ["La recopier", { xp: 50 }], ["La gratter", { light: 10 }]],
    ["Un confessionnal garde les péchés du Pape d'En-Bas, rangés par ordre.", ["Les lire", { xp: 80, morale: -6 }], ["Fermer la porte", { morale: 8 }]],
    ["Le dernier péché est le seul qu'il n'a jamais avoué.", ["L'absoudre (gardien affaibli)", { bossWeak: .25, buff: 1 }], ["Le crier sous la voûte (gardien enragé, butin)", { bossRage: .25, gold: 380 }]]]],
];
const QUEST_REG3 = [];
for (const [reg, title, steps] of QUEST_EVENTS3) { const b = "q3_" + reg; QUEST_REG3.push([reg, title]);
  steps.forEach(([t, a, c], i) => { const id = b + (i + 1), n = i ? `${title} (${i + 1}/3)` : title;
    const fx = i < 2 ? Object.assign({ sflag: id }, a[1]) : a[1];
    const o = i === 0 ? { reg: [reg], snot: [b + "1", b + "2"] } : { reg: [reg], sneed: b + i, chain: 1 };
    EVENTS.push(Object.assign({ id, n, t, ch: [{ n: a[0], fx }, { n: c[0], fx: c[1] }], quest: 1 }, o)); }); }
