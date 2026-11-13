// ── Améliorations du 6 nov. (matin), logique : ordres tactiques, points faibles, provocation de secours, défis de combat,
// spécialisations de compagnon, héritage, reliques renforcées, arbre du Bastion, légende de la semaine, contrats,
// champions, visiteurs, séries d'expéditions, journal ──

// 1 · Ordres tactiques avant un gardien (choisis au briefing) : run.order, appliqué au combat suivant contre un gardien
const ORDERS = {
  focus: { n: "Abattre le gardien", d: "+12 % de dégâts pour les héros, mais −5 % de protection.", apply: B => B.heroes.forEach(u => { u.dmgLo *= 1.12; u.dmgHi *= 1.12; u.prot = Math.max(0, u.prot - .05); }) },
  wall: { n: "Tenir la ligne", d: "+12 % de protection et +5 résistance, mais −8 % de dégâts.", apply: B => B.heroes.forEach(u => { u.prot = Math.min(.8, u.prot + .12); u.res += 5; u.dmgLo *= .92; u.dmgHi *= .92; }) },
  ult: { n: "Garder les ultimes", d: "Les héros commencent avec 40 % de jauge d'ultime.", apply: B => B.heroes.forEach(u => { u.ultV = Math.max(u.ultV || 0, 40); }) },
};

// 2 · Points faibles : la moitié des élites et des gardiens ont une partie fragile ; trois coups critiques la brisent (−20 % de dégâts, −10 % de protection)
const WEAK_PARTS = ["Lanterne", "Bouclier fêlé", "Couronne", "Masque", "Cœur exposé", "Chaîne", "Œil unique", "Corne"];
const WP_HITS = 3;
function giveWeakPoints(B, rng = RNG) { for (const e of B.enemies) if ((e.boss || e.elite) && rng.chance(.5)) e.wp = { n: rng.pick(WEAK_PARTS), hits: WP_HITS }; }
// 3 · Provocation de secours : quand un héros tombe à l'agonie, un tank encore debout provoque l'ennemi (une fois par tour de table)
// 4 · Défis de combat : un combat sur trois propose un défi ; réussi, il double l'or et ajoute un objet
const CHALLENGES = {
  fast: { n: "Expéditif", d: "Gagner en 8 tours ou moins.", ok: B => B.round <= 8 },
  nopot: { n: "Sans potion", d: "Gagner sans utiliser de potion.", ok: B => !B.potUsed },
  clean: { n: "Sans faiblir", d: "Gagner sans qu'aucun héros ne tombe à l'agonie.", ok: B => !B.agonies },
};
{ const ad0 = applyDamage; applyDamage = function (B, src, x, d, ev, o = {}) {
    const wasAg = x && x.side === "h" && x.agony;
    if (o && o.crit && src && src.side === "h" && x && x.wp && x.wp.hits > 0 && --x.wp.hits === 0) { x.prot = Math.max(0, x.prot - .1); x.dmgLo *= .8; x.dmgHi *= .8; if (ev) ev.push({ k: "phase", u: x.uid, text: `Point faible brisé : ${x.wp.n} !` }); }
    const r = ad0.apply(this, arguments);
    if (x && x.side === "h" && !wasAg && x.agony && B) { B.agonies = (B.agonies || 0) + 1;
      if (B.guardRound !== B.round) { const t = B.heroes.find(h => h !== x && alive(h) && !h.agony && h.role === "tank"); if (t) { B.guardRound = B.round; addSt(B, t, t, { k: "prov", t: 2 }, ev || []); if (ev) ev.push({ k: "guard", u: t.uid }); } } }
    return r; }; }
{ const up0 = usePotion; usePotion = function (B) { if (B) B.potUsed = (B.potUsed || 0) + 1; return up0.apply(this, arguments); }; }
{ const bf0 = battleFor; battleFor = function (run, node, enc) {
    const B = bf0.apply(this, arguments);
    giveWeakPoints(B);
    if (node && node.type === "boss" && run.order && ORDERS[run.order]) { B.tactic = run.order; ORDERS[run.order].apply(B); run.order = null; }
    if (node && (node.type === "combat" || node.type === "elite") && !node.chal) node.chal = RNG.chance(.33) ? RNG.pick(Object.keys(CHALLENGES)) : "none";
    if (node && node.chal && node.chal !== "none") B.chal = node.chal;
    if (node && node.champ) for (const e of B.enemies) if (e.elite) { e.hpMax = Math.round(e.hpMax * 1.3); e.hp = e.hpMax; e.name = "Champion : " + e.name; }
    return B; }; }
{ const ab0 = afterBattle; afterBattle = function (run, B) {
    if (B && B.over === "win" && B.chal && CHALLENGES[B.chal]) run.chalOk = CHALLENGES[B.chal].ok(B) ? B.chal : null; else if (run) run.chalOk = null;
    if (B && B.over === "win" && typeof tavContractTick === "function") tavContractTick(run, B);
    return ab0.apply(this, arguments); }; }

// 5 · Spécialisation de compagnon à l'évolution : Prédateur (+20 % de dégâts) ou Gardien (+20 % de soins, boucliers et bonus)
const PET_SPECS = { pred: { n: "Prédateur", d: "+20 % de dégâts." }, gard: { n: "Gardien", d: "+20 % de soins, boucliers et bonus." } };
{ const pm0 = petMul; petMul = function (id) { const m = pm0(id), sp = typeof S !== "undefined" && S && S.petSpec ? S.petSpec[id] : null; if (sp === "pred") m.dmg *= 1.2; if (sp === "gard") m.sup *= 1.2; return m; }; }

// 6 · Héritage : un héros mort lègue un de ses bons traits à la prochaine recrue
function legacyTrait(h) { const good = (h.traits || []).filter(t => TRAITS[t] && TRAITS[t].good); return good.length ? good[Math.floor(Math.random() * good.length)] : null; }
{ const rc0 = recruit; recruit = function (i) { const r = rc0.apply(this, arguments); if (r && r.ok && S.legacies && S.legacies.length) { const L = S.legacies.shift(), h = r.ok; if (L.trait && !h.traits.includes(L.trait)) { h.traits.push(L.trait); r.legacy = L; } } return r; }; }

// 7 · Reliques renforcées : obtenir une relique déjà possédée la renforce (+50 % de ses effets, cumulable une fois)
{ const ar0 = addRelic; addRelic = function (run, k) { if (k && run.relics.includes(k)) { run.relicUp = run.relicUp || {}; if ((run.relicUp[k] || 0) < 1) { run.relicUp[k] = 1; return; } } return ar0.apply(this, arguments); }; }
{ const rr0 = randRelic; randRelic = function (run, rng = RNG, minR = 0) { const own = run.relics.filter(k => RELICS[k] && !(run.relicUp || {})[k]); if (own.length && run.region !== "abime" && rng.chance(.12)) return rng.pick(own); return rr0.apply(this, arguments); }; }
{ const rh0 = relicHooks; relicHooks = function (run = S.run) { const H = rh0(run); if (run && run.relicUp) for (const k in run.relicUp) { const R = RELICS[k]; if (!R) continue; for (const h in R.h) if (typeof R.h[h] === "number") H[h] = (H[h] || 0) + R.h[h] * .5; } return H; }; }

// 8 · Arbre du Bastion : un point par niveau d'aventure, à placer dans cinq branches
const BTREE = {
  or: { n: "Trésorerie", d: "+3 % d'or par point.", max: 20 },
  xp: { n: "Bibliothèque", d: "+3 % d'expérience par point.", max: 20 },
  lueur: { n: "Lampisterie", d: "+3 de lueur au départ par point.", max: 10 },
  potion: { n: "Herboristerie", d: "+1 potion tous les 4 points.", max: 12 },
  vigueur: { n: "Salle d'armes", d: "+1 % de PV et de dégâts par point.", max: 20 },
};
const btree = k => ((typeof S !== "undefined" && S && S.btree) || {})[k] || 0;
const btreeFree = () => Math.max(0, (typeof advLevel === "function" ? advLevel() - 1 : 0) - Object.values(S.btree || {}).reduce((a, b) => a + b, 0));
function btreeAdd(k) { const B = BTREE[k]; if (!B || btreeFree() < 1 || btree(k) >= B.max) return false; S.btree = S.btree || {}; S.btree[k] = btree(k) + 1; return true; }
function btreeReset() { S.btree = {}; }
if (typeof PAS_HOOKS !== "undefined") PAS_HOOKS.push(() => { const v = btree("vigueur"); return v ? [{ k: "stat", s: "hp", v: .01 * v }, { k: "stat", s: "dmg", v: .01 * v }] : []; });
{ const rf0 = rewardFor; rewardFor = function (run, node, rng = RNG) {
    const R = rf0.apply(this, arguments), lvl = runLevel(run, node);
    R.gold = Math.round(R.gold * (1 + .03 * btree("or"))); R.xp = Math.round(R.xp * (1 + .03 * btree("xp")));
    if (run.chalOk && node && (node.type === "combat" || node.type === "elite")) { R.chal = run.chalOk; R.gold *= 2; R.loot.push(lootGear(lvl + 1, .15, null, 1)); run.chalOk = null; } // défi réussi
    if (node && node.champ) { R.gold = Math.round(R.gold * 1.5); R.loot.push(lootGear(lvl + 3, .3, null, 3)); R.champ = 1; } // champion : Épique au minimum
    if (node && node.type === "boss" && run.legendWeek) { R.shards = (R.shards || 0) + 5; R.loot.push(lootGear(lvl + 3, .5, null, 5)); R.legend = 1; S.legendWeekDone = legWeekKey(); } // légende de la semaine : Mythique garanti
    return R; }; }
{ const sr0 = startRun; startRun = function (regionId, partyIds, petId, opt = {}) {
    const run = sr0.apply(this, arguments);
    run.light = clamp(run.light + 3 * btree("lueur"), 0, 100); run.potions += Math.floor(btree("potion") / 4);
    const nb = S.nextRun; if (nb) { if (nb.potion) run.potions += nb.potion; if (nb.light) run.light = clamp(run.light + nb.light, 0, 100); S.nextRun = null; } // achats des visiteurs
    const LW = typeof UI !== "undefined" && UI.expe && UI.expe.legend && legendWeek(); if (opt.legendWeek || (LW && LW.region === regionId && !LW.done)) { run.legendWeek = 1; run.forceBoss = legendWeek().boss; for (const col of run.map) for (const n of col) if (n.type === "camp" && legendWeek().rule === "nocamp") n.type = "combat"; }
    markChampion(run.map, mkRng(run.seed + 31));
    return run; }; }

// 9 · Légende de la semaine : chapitre, gardien imposé et règle tirés chaque semaine (une victoire par semaine)
const legWeekKey = () => Math.floor((Date.now() / 864e5 + 3) / 7);
const LEGEND_RULES = { nocamp: "Aucun feu de camp.", corrupt: "Tous les ennemis sont corrompus.", elite: "Ennemis +15 % de PV et de dégâts." };
function legendWeek() { const w = legWeekKey(), rng = mkRng(hashStr("legende" + w)), regs = REGIONS.filter(r => S.prog[r.id] && S.prog[r.id].clears), pool = typeof bossPoolEligible === "function" ? bossPoolEligible() : [];
  if (!regs.length) return null; return { w, region: rng.pick(regs).id, boss: pool.length ? rng.pick(pool) : null, rule: rng.pick(Object.keys(LEGEND_RULES)), done: S.legendWeekDone === w }; }
{ const ge0 = genEncounter; genEncounter = function (run, node, rng = RNG) {
    const had = !!node.enc; let e = ge0.apply(this, arguments);
    if (!had && node.type === "boss" && run.forceBoss && MONSTERS[run.forceBoss]) { const b = e.find(x => MONSTERS[x.key] && MONSTERS[x.key].boss); if (b) { b.key = run.forceBoss; b.f = monNorm(bossBase(run.forceBoss), regionById(run.region).boss); node.enc = e.map(x => Object.assign({}, x)); } }
    if (!had && run.legendWeek && legendWeek() && legendWeek().rule === "corrupt") { for (const x of e) if (!MONSTERS[x.key].boss) x.corrupt = 1; node.enc = e.map(x => Object.assign({}, x)); }
    if (!had && node.champ && e.length < 4) { const R = regionById(run.region), k = rng.pick(R.pool); e.push({ key: k, lvl: e[0].lvl }); node.enc = e.map(x => Object.assign({}, x)); }
    return e; }; }
{ const bf1 = battleFor; battleFor = function (run, node, enc) { const B = bf1.apply(this, arguments); if (run.legendWeek && legendWeek() && legendWeek().rule === "elite") for (const e of B.enemies) { e.hpMax = Math.round(e.hpMax * 1.15); e.hp = e.hpMax; e.dmgLo *= 1.15; e.dmgHi *= 1.15; } return B; }; }

// 11 · Champions : une salle de combat sur deux avant le gardien devient un champion (élite renforcée + renfort, butin Épique)
function markChampion(map, rng) { if (!map || map.length < 4 || !rng.chance(.5)) return; const c = map.length - 2, col = map[c].filter(n => n.type === "combat"); if (!col.length) return; const n = rng.pick(col); n.type = "elite"; n.champ = 1; }

// 10 · Contrats de la Taverne : trois contrats par jour, suivis pendant les expéditions, récompense à réclamer à la Taverne
const TAV_CONTRACTS = [
  { k: "impie", n: "Purifier", d: n => `Tuer ${n} créatures impies`, need: [20, 30, 40] },
  { k: "bete", n: "Chasse", d: n => `Tuer ${n} bêtes`, need: [12, 20, 28] },
  { k: "humain", n: "Justice", d: n => `Tuer ${n} humains`, need: [10, 16, 24] },
  { k: "elite", n: "Tête mise à prix", d: n => `Vaincre ${n} élites`, need: [2, 3, 4] },
  { k: "boss", n: "Régicide", d: n => `Vaincre ${n} gardien${n > 1 ? "s" : ""}`, need: [1, 1, 2] },
  { k: "crit", n: "Coups de maître", d: n => `Porter ${n} coups critiques`, need: [15, 25, 35] },
];
function tavContracts() { const day = new Date().toDateString(); if (S.tavContracts && S.tavContracts.day === day) return S.tavContracts;
  const rng = mkRng(hashStr("contrat" + day)), ks = rng.shuffle(TAV_CONTRACTS.map(c => c.k)).slice(0, 3);
  S.tavContracts = { day, list: ks.map((k, i) => { const T = TAV_CONTRACTS.find(c => c.k === k), n = T.need[i]; return { k, n, got: 0, done: 0, gold: 150 + n * 25 + i * 150 + advA() * 20, shards: i }; }) }; return S.tavContracts; }
function tavContractTick(run, B) { if (!S.tavContracts) return; for (const C of S.tavContracts.list) { if (C.done) continue;
    if (["impie", "bete", "humain"].includes(C.k)) C.got += (B.dead || []).filter(e => (e.tags || []).includes(C.k)).length;
    if (C.k === "elite") C.got += (B.dead || []).filter(e => e.elite).length;
    if (C.k === "boss") C.got += (B.dead || []).filter(e => e.boss).length;
    if (C.k === "crit") C.got += B.crits || 0; } }
function tavContractClaim(i) { const C = S.tavContracts && S.tavContracts.list[i]; if (!C || C.done || C.got < C.n) return false; C.done = 1; S.gold += C.gold; S.shards += C.shards; return C; }

// 12 · Visiteurs du Bastion : un visiteur par jour, offres uniques
const VISITORS = {
  alchimiste: { n: "L'alchimiste", por: "por_marchand", d: "Une odeur de soufre et de miel. « Tout se distille, même le courage. »",
    offers: [{ k: "pot", n: "Élixir de vigueur", d: "+2 potions à la prochaine expédition.", cost: 300, buy: () => { (S.nextRun = S.nextRun || {}).potion = ((S.nextRun || {}).potion || 0) + 2; } }, { k: "tome", n: "Tonique de mémoire", d: "+1 tome d'expérience.", cost: 450, buy: () => { S.tomes = (S.tomes || 0) + 1; } }] },
  cartographe: { n: "Le cartographe", por: "por_colporteur", d: "Des parchemins plein les poches. « Je sais où dorment les monstres. »",
    offers: [{ k: "light", n: "Carte annotée", d: "+30 lueur à la prochaine expédition.", cost: 250, buy: () => { (S.nextRun = S.nextRun || {}).light = 30; } }, { k: "gem", n: "Pierre trouvée en chemin", d: "Une gemme au hasard.", cost: 600, buy: () => { if (typeof gemAdd === "function") { const [k, l] = gemRoll(RNG, 2).split(":"); gemAdd(k, +l); } } }] },
  mercenaire: { n: "La mercenaire", por: null, d: "Une cicatrice d'une oreille à l'autre. « Je me bats pour qui paie. »",
    offers: [{ k: "merc", n: "Engager une vétérane", d: "Une recrue de haut niveau rejoint la caserne.", cost: 0, buy: () => { const top = Math.max(1, ...S.heroes.map(h => h.lvl)), h = makeHero(pick(CLASS_IDS.filter(classUnlocked)), { lvl: Math.max(1, top - 2) }); addHero(h); return h; }, price: () => 200 + 60 * Math.max(1, ...S.heroes.map(h => h.lvl)) }] },
};
function visitorToday() { const day = new Date().toDateString(); if (S.visitor && S.visitor.day === day) return S.visitor; const k = mkRng(hashStr("visiteur" + day)).pick(Object.keys(VISITORS)); return S.visitor = { day, k, bought: [] }; }
function visitorBuy(i) { const V = visitorToday(), D = VISITORS[V.k], O = D.offers[i]; if (!O || V.bought.includes(i)) return { err: "Déjà acheté." }; const c = O.price ? O.price() : O.cost;
  if (O.k === "merc" && S.heroes.length >= rosterMax()) return { err: "La caserne est pleine." }; if (S.gold < c) return { err: "Pas assez d'or." }; S.gold -= c; const r = O.buy(); V.bought.push(i); return { ok: O, r }; }

// 15 · Journal du Bastion : les 40 dernières expéditions
{ const er0 = endRun; endRun = function (outcome) { const run = S.run; const snap = run ? { t: Date.now(), region: run.region, floor: run.floor, outcome, gold: run.gold, loot: run.loot.length, fallen: run.fallen.map(id => { const h = heroById(id); return h ? h.name : "?"; }), party: run.party.map(id => { const h = heroById(id); return h ? h.name : "?"; }), kills: run.kills, boss: (() => { const bn = run.map && run.map[run.map.length - 1] && run.map[run.map.length - 1][0]; const b = bn && bn.enc && bn.enc.find(e => MONSTERS[e.key] && MONSTERS[e.key].boss); return b ? MONSTERS[b.key].n : null; })() } : null;
  const res = er0.apply(this, arguments); if (snap) { (S.journal = S.journal || []).unshift(snap); S.journal.length = Math.min(40, S.journal.length); } return res; }; }
// 6 · morts : retenir l'héritage
{ const en0 = engrave; engrave = function (h) { const t = legacyTrait(h); if (t) (S.legacies = S.legacies || []).push({ name: h.name, cls: h.cls, trait: t }); return en0.apply(this, arguments); }; }

// ── Jauge d'ultime conservée d'un combat à l'autre pendant l'expédition ──
{ const ab1 = afterBattle; afterBattle = function (run, B) { if (run && B) { run.ult = run.ult || {}; for (const u of B.heroes) if (u.hid) run.ult[u.hid] = u.hp > 0 && !u.dead ? Math.round(u.ultV || 0) : 0; } return ab1.apply(this, arguments); }; }
{ const bf2 = battleFor; battleFor = function (run, node, enc) { const B = bf2.apply(this, arguments); if (run && run.ult) for (const u of B.heroes) if (u.hid && run.ult[u.hid]) u.ultV = Math.min(100, Math.max(u.ultV || 0, run.ult[u.hid])); return B; }; }
// ── Mode auto de la carte : le dernier choix (auto ou manuel) est repris à chaque nouvelle expédition ──
{ const sr1 = startRun; startRun = function () { const run = sr1.apply(this, arguments); if (typeof UI !== "undefined" && UI.expe && UI.expe.autoMap) run.autoMap = 1; /* choisi dans Options de l'expédition (manuel par défaut) */ return run; }; }
