/* Succès liés aux tenues (12 nov.) */
const OUTFIT_ACH = [
  { id: "tenue_1", n: "Première parure", d: "Débloquer une tenue pour une classe.", gold: 800, shards: 2, ok: () => Object.values(S.classWins || {}).some(n => n >= 3) },
  { id: "tenue_sang", n: "Vêtu d'écarlate", d: "Débloquer la Tenue écarlate pour trois classes.", gold: 2500, shards: 5, ok: () => Object.values(S.classWins || {}).filter(n => n >= 10).length >= 3 },
  { id: "tenue_maitre", n: "Maître tailleur", d: "Débloquer toutes les tenues de victoires d'une même classe.", gold: 6000, shards: 10, ok: () => { const top = Math.max(0, ...OUTFITS.filter(o => !o.trial).map(o => o.need || 0)); return Object.values(S.classWins || {}).some(n => n >= top); } },
  { id: "tenue_garde_robe", n: "Garde-robe complète", d: "Débloquer au moins une tenue pour les quinze classes.", gold: 9000, shards: 14, ok: () => Object.keys(CLASSES).every(c => ((S.classWins || {})[c] || 0) >= 3) },
];
for (const A of OUTFIT_ACH) { if (!COLL_ACH.some(a => a.id === A.id)) COLL_ACH.push(A); if (!HIDDEN_ACH.some(a => a.id === A.id)) HIDDEN_ACH.push(Object.assign({ coll: 1 }, A)); }
// compteur durable des trouvailles ultimes (le journal S.finds est limité à 80 lignes)
{ const gr = grantReward; grantReward = function (run, R) { try { for (const it of (R && R.loot) || []) if (it && it.rar >= 8) { S.ultN = S.ultN || { 8: 0, 9: 0 }; S.ultN[it.rar] = (S.ultN[it.rar] || 0) + 1; } } catch (e) { } return gr.apply(this, arguments); }; }
/* Événements des cycles avancés : n'apparaissent qu'à partir du cycle indiqué (cyc). */
const CYCLE_EVENTS = [
  { id: "cy_echo", cyc: 1, n: "L'écho d'une autre vie", t: "Sur un mur, votre propre écriture : des noms barrés, une carte, une date qui n'a pas encore eu lieu. Vous êtes déjà passés ici.", ch: [
    { n: "Suivre la carte de l'autre vous", fx: { loot: 2, hurt: .1 } }, { n: "Effacer les noms", fx: { morale: 15, xp: 120 } }, { n: "Lire jusqu'au bout", fx: { gamble: [.5, { relic: 1 }, { curse: 1 }] } }] },
  { id: "cy_couronne", cyc: 1, n: "Fragment de la Couronne", t: "Un éclat de la Couronne de Cendres palpite dans la boue, encore tiède. Il murmure le nom de chacun d'entre vous.", ch: [
    { n: "Le briser", fx: { ess: 6, morale: -5 } }, { n: "Le garder contre soi", fx: { buff: 1, heroCurse: 1 } }, { n: "L'offrir au compagnon", fx: { petXp: 400 } }] },
  { id: "cy_pelerins", cyc: 1, n: "Les pèlerins du cycle", t: "Des pèlerins aux yeux vides marchent en rond depuis des années. Ils vous reconnaissent : « Vous êtes revenus. Encore. »", ch: [
    { n: "Les guider hors du cercle", fx: { gold: 500, light: -10 } }, { n: "Marcher avec eux un moment", fx: { heal: .3, morale: 10 } }, { n: "Les dépouiller", fx: { gold: 900, morale: -15 } }] },
  { id: "cy_forge_temps", cyc: 2, n: "La forge hors du temps", t: "Une enclume flotte au-dessus d'un puits sans fond. Le marteau frappe seul, au rythme d'un cœur.", ch: [
    { n: "Poser une arme sur l'enclume", fx: { upgrade: 1 } }, { n: "Jeter du fer dans le puits", fx: { mat: 8, ess: 3 } }, { n: "Arrêter le marteau", fx: { gamble: [.4, { loot: 3 }, { hurt: .2 }] } }] },
  { id: "cy_double", cyc: 2, n: "Votre reflet armé", t: "Votre propre compagnie se dresse en travers du chemin, armes tirées — plus fatiguée, plus vieille. Elle ne dit rien.", ch: [
    { n: "Combattre vos doubles", fx: { fight: 1, loot: 3 } }, { n: "Leur céder le passage", fx: { morale: -10, xp: 200 } }, { n: "Échanger vos armes", fx: { trinket: 1 } }] },
  { id: "cy_cendres_vives", cyc: 3, n: "Pluie de cendres vives", t: "Le ciel se déchire et il pleut des braises qui chantent. Là où elles tombent, l'or fond et se reforme.", ch: [
    { n: "Ramasser l'or fondu", fx: { gold: 1500, hurt: .15 } }, { n: "S'abriter et prier", fx: { heal: .2, light: 10 } }, { n: "Tendre les mains vers le ciel", fx: { gamble: [.35, { relic: 1, loot: 2 }, { heroCurse: 1, hurt: .2 }] } }] },
  { id: "cy_juge", cyc: 3, n: "Le Juge des cycles", t: "Un vieillard couronné tient une balance. Sur un plateau, vos victoires ; sur l'autre, vos morts. Elle penche.", ch: [
    { n: "Ajouter de l'or au plateau", fx: { cost: 800, buff: 1, morale: 20 } }, { n: "Ajouter du sang", fx: { hurt: .25, relic: 1 } }, { n: "Renverser la balance", fx: { fight: 1, ess: 8 } }] },
  { id: "cy_fin", cyc: 4, n: "La fin qui ne vient pas", t: "Un portail ouvert sur un champ vide et paisible. Au-delà, rien ne recommence. Vos héros hésitent.", ch: [
    { n: "Regarder longuement, puis repartir", fx: { morale: 25, heal: .4 } }, { n: "Y laisser un souvenir", fx: { xp: 500, petXp: 300 } }] },
];
for (const e of CYCLE_EVENTS) if (!EVENTS.some(x => x.id === e.id)) EVENTS.push(e);
{ const pe = pickEvent; pickEvent = function (run) { const c = typeof cycleN === "function" ? cycleN() : 0, out = [];
    for (let i = EVENTS.length - 1; i >= 0; i--) if (EVENTS[i].cyc && EVENTS[i].cyc > c) out.push([i, EVENTS.splice(i, 1)[0]]);
    try { return pe.apply(this, arguments); } finally { for (const [i, e] of out.reverse()) EVENTS.splice(i, 0, e); } }; }
