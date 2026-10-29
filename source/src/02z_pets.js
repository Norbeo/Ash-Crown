/* ═══════════════════════ Compagnons supplémentaires (×3) ═══════════════════════
   Chaque compagnon suit un modèle par rôle, avec sa propre altération. */
const PET_MORE = [
  // id, nom, rôle, déblocage (chapitres terminés), description, couleur, élément, évolution, description de l'évolution
  ["belette", "Belette des tombes", "dps", 0, "Elle se faufile entre les côtes des morts et ronge ce qui dépasse.", "#7a6a58", "bleed", "Hermine funèbre", "Blanche comme un linceul, rouge jusqu'aux babines."],
  ["hibou_gris", "Hibou des clochers", "soutien", 0, "Il voit tout depuis les clochers et hulule quand l'ennemi faiblit.", "#8a8478", "mark", "Grand hibou des glas", "Chacun de ses cris sonne un glas."],
  ["chevre", "Chèvre noire", "tank", 0, "Têtue comme une mule, cornue comme un démon.", "#3a3430", "protUp", "Bouc du sabbat", "Ses cornes ont percé des armures de chevalier."],
  ["pie", "Pie voleuse", "soutien", 1, "Elle vole tout ce qui brille… y compris le courage de l'ennemi.", "#2a2a30", "weak", "Pie des gibets", "Elle niche dans les cordes des pendus."],
  ["lievre", "Lièvre blanc", "soin", 1, "Un lièvre qui ne fuit jamais. On dit qu'il porte chance.", "#e0dcd0", "heal", "Lièvre de lune", "Il bondit sur les rayons de lune."],
  ["rat_geant", "Rat des égouts", "dps", 1, "Gros comme un chien, plus intelligent que certains hommes.", "#5a4a40", "poison", "Roi des rats", "Une couronne de queues nouées, une armée sous ses ordres."],
  ["blaireau", "Blaireau de fer", "tank", 1, "Il ne recule devant rien, pas même devant un ours.", "#5a5a52", "shield", "Blaireau cuirassé", "Sa fourrure est devenue aussi dure que l'acier."],
  ["luciole", "Essaim de lucioles", "soin", 1, "Des lumières douces qui referment les plaies.", "#d8d07a", "regen", "Constellation vivante", "Un ciel étoilé qui vous suit dans le noir."],
  ["serpent_eau", "Couleuvre des douves", "dps", 2, "Elle glisse sous l'eau et mord aux chevilles.", "#3a5a4a", "poison", "Hydre des douves", "Trois têtes, trois morsures."],
  ["chien_berger", "Chien de berger", "tank", 2, "Il protège le troupeau, quel qu'il soit.", "#8a6a4a", "shield", "Gardien des bergeries", "Aucun loup n'a jamais franchi sa garde."],
  ["corneille", "Corneille borgne", "soutien", 2, "Il lui manque un œil, mais elle voit l'avenir.", "#1e1e24", "vuln", "Corneille du destin", "Elle a vu votre mort, et l'a repoussée."],
  ["tortue", "Tortue des marais", "tank", 2, "Lente, mais rien ne traverse sa carapace.", "#4a5a3a", "protUp", "Tortue-forteresse", "Une carapace couverte de mousse et de runes."],
  ["cygne_noir", "Cygne noir", "soin", 2, "Il chante pour les mourants, et parfois ils guérissent.", "#1a1a22", "heal", "Cygne de deuil", "Son chant ramène les âmes égarées."],
  ["frelon", "Frelon géant", "dps", 3, "Son dard traverse le cuir comme une aiguille.", "#a07a2a", "poison", "Frelon-reine", "Une reine, et son essaim."],
  ["lynx", "Lynx des neiges", "dps", 3, "Silencieux, patient, mortel.", "#c8c0b0", "bleed", "Lynx spectral", "On ne le voit qu'au moment où il frappe."],
  ["mouton_noir", "Agneau noir", "soin", 3, "Un agneau né pendant une éclipse. Sa laine apaise.", "#2a2624", "regen", "Bélier des cendres", "Ses cornes brûlent d'un feu qui soigne."],
  ["sangsue", "Sangsue géante", "soutien", 3, "Elle boit le sang de l'ennemi et vous rend ses forces.", "#4a2a2a", "weak", "Mère-sangsue", "Gorgée de sang, elle partage son festin."],
  ["scarabee", "Scarabée d'ébène", "tank", 3, "Une carapace noire qui renvoie les coups.", "#20202a", "thorns", "Scarabée sacré", "Il porte un soleil noir sur le dos."],
  ["chacal", "Chacal des ruines", "dps", 4, "Il rôde autour des champs de bataille. Il sait qui va tomber.", "#8a6a3a", "bleed", "Chacal d'Anubis", "Gardien des tombes, juge des morts."],
  ["paon", "Paon funèbre", "soutien", 4, "Ses plumes ont des yeux qui fixent l'ennemi.", "#2a4a5a", "accDn", "Paon aux cent yeux", "Cent regards, cent malédictions."],
  ["elan", "Élan des tourbières", "tank", 4, "Ses bois arrêtent les lames.", "#5a4a32", "shield", "Élan-roi", "Couronné de bois et de mousse."],
  ["phalene", "Phalène d'argent", "soin", 4, "Ses ailes répandent une poussière qui soigne.", "#b8b8c8", "heal", "Phalène lunaire", "Sa poussière brille comme la lune."],
  ["anguille", "Anguille électrique", "dps", 4, "Une décharge, et le cœur s'arrête.", "#2a3a4a", "stun", "Anguille-tonnerre", "La foudre dans un corps de serpent."],
  ["mante", "Mante des cimetières", "soutien", 4, "Elle prie sur les tombes, puis elle tue.", "#5a7a3a", "protDn", "Mante-prêtresse", "Ses prières sont des sentences."],
  ["bouc_sacre", "Bouc des sommets", "tank", 5, "Né sur les falaises, il ne tombe jamais.", "#a09a8a", "protUp", "Bouc des tempêtes", "Ses cornes attirent la foudre."],
  ["kirin", "Poulain de brume", "soin", 5, "Un poulain fait de brouillard. Là où il passe, les blessures se referment.", "#c8d0d8", "regen", "Destrier de brume", "Un cheval de nuages, rapide comme le vent."],
  ["scorpion", "Scorpion des cendres", "dps", 5, "Son dard brûle autant qu'il empoisonne.", "#6a3a1a", "burn", "Scorpion-empereur", "Une armure de lave, un dard de feu."],
  ["chimere", "Chimérot", "soutien", 5, "Un peu lion, un peu chèvre, un peu serpent. Totalement imprévisible.", "#7a4a3a", "vuln", "Chimère adulte", "Trois têtes, trois souffles."],
  ["golem_os", "Golem d'os", "tank", 5, "Assemblé par un nécromancien, abandonné, puis adopté.", "#c8c0a8", "shield", "Colosse d'ossements", "Un rempart de crânes."],
  ["ange_dechu", "Chérubin déchu", "soin", 5, "Un petit ange aux ailes brûlées. Il soigne encore.", "#d8c8a8", "heal", "Séraphin déchu", "Six ailes noires, une lumière intacte."],
  ["wyverne", "Wyvernette", "dps", 6, "Un dragonnet venimeux à deux pattes.", "#4a5a3a", "poison", "Wyverne des marais", "Son venin ronge l'acier."],
  ["sphinx", "Sphinxelet", "soutien", 6, "Il pose des énigmes à vos ennemis, qui en perdent la tête.", "#b8945a", "stun", "Sphinx des sables noirs", "Nul ne survit à sa dernière énigme."],
  ["mammouth", "Mammouthon", "tank", 6, "Un petit mammouth laineux venu du grand froid.", "#6a5040", "protUp", "Mammouth de guerre", "Une montagne qui charge."],
  ["phenix", "Phénix de cendre", "soin", 6, "Il meurt et renaît dans la cendre, encore et encore.", "#ff7a3a", "regen", "Phénix royal", "Ses flammes soignent ceux qu'il aime."],
  ["basilic", "Basilic", "dps", 6, "Un regard, et l'ennemi se fige.", "#5a6a2a", "stun", "Roi-basilic", "Il pétrifie d'un battement de paupières."],
  ["ombre_chat", "Chat d'ombre", "soutien", 6, "Un chat fait de nuit pure. Il désigne les proies.", "#14121a", "mark", "Panthère d'ombre", "La nuit entière marche à vos côtés."],
];
const PET_ROLE_SK = {
  dps: (fx, nm) => ({ sk: [{ n: "Assaut", m: .9, t: "e", at: [1, 2], fx: [{ k: fx, v: .45, t: 3, ch: .9 }] }, { n: "Curée", m: .6, t: "ae", at: [1, 2, 3], fx: [{ k: fx, v: .35, t: 2, ch: .6 }], every: 3 }], evo: { n: "Furie " + nm, m: 1.3, t: "ae", at: [1, 2, 3], fx: [{ k: fx, v: .5, t: 3, ch: 1 }] } }),
  tank: (fx, nm) => ({ sk: [{ n: "Rempart", t: "low", shield: .18 }, { n: "Charge", m: .7, t: "e", at: [1, 2], fx: [{ k: "stun", t: 1, ch: .25 }], every: 2 }], evo: { n: "Rempart " + nm, t: "aa", shield: .14, afx: [{ k: fx === "thorns" ? "thorns" : "protUp", v: fx === "thorns" ? .2 : .08, t: 2 }] } }),
  soin: (fx, nm) => ({ sk: [{ n: "Soin", t: "low", heal: .14, regen: fx === "regen" ? .04 : 0 }, { n: "Bénédiction", t: "aa", heal: .06, cleanse1: true, every: 3 }], evo: { n: "Grâce " + nm, t: "aa", heal: .14, cleanse1: true } }),
  soutien: (fx, nm) => ({ sk: [{ n: "Présage", t: "e", at: [1, 2, 3, 4], fx: [{ k: fx, v: fx === "accDn" ? 10 : fx === "protDn" ? .12 : .2, t: 2, ch: 1 }] }, { n: "Cri", t: "aa", afx: [{ k: "dmgUp", v: .1, t: 2 }], every: 3 }], evo: { n: "Augure " + nm, m: .4, t: "ae", at: [1, 2, 3, 4], fx: [{ k: fx, v: fx === "accDn" ? 12 : fx === "protDn" ? .15 : .25, t: 2, ch: 1 }] } }),
};
for (const [id, n, role, unlock, d, col, fx, en, ed] of PET_MORE) {
  const T = PET_ROLE_SK[role](fx, ""), cost = [500, 800, 1200, 1700, 2400, 3000, 3600][unlock] || 3600;
  for (const s of T.sk) if (!s.regen) delete s.regen;
  PETS[id] = { n, role, unlock, cost, d, col, sk: T.sk, evo: { n: en, d: ed, sk: Object.assign(T.evo, { n: en.split(" ")[0] === en ? en : T.evo.n.trim() + en.split(" ").slice(0, 1).join("") }) }, art: "pet_" + id, more: 1 };
  PETS[id].evo.sk.n = { dps: "Furie", tank: "Rempart", soin: "Grâce", soutien: "Augure" }[role] + " de " + en.toLowerCase().replace(/^(le |la |l')/, "");
}
// compagnons pas encore peints : masqués dans le jeu (la simulation, sans illustrations, les garde tous)
if (typeof window !== "undefined" && window.ART_LIST) { const L = new Set(window.ART_LIST); for (const p of PET_MORE) if (!L.has("pet_" + p[0])) delete PETS[p[0]]; }
PET_IDS.push(...PET_MORE.map(p => p[0]).filter(id => PETS[id] && !PET_IDS.includes(id)));
