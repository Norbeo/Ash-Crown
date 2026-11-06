/* ═══════════ Améliorations du 6 nov. (soir) : Absolu, marché des éclats, variantes, collections ═══════════ */

// ── 5 · Gardiens « Absolu » : menace V, groupe de niveau 45+ → gardien renforcé et butin de palier X garanti ──
const ABSOLU_LVL = 45;
function absoluOn(run) {
  if (!run || run.region === "abime" || run.rush || run.daily || (run.threat || 0) < 4) return false;
  const hs = run.party.map(heroById).filter(Boolean); return hs.length > 0 && Math.max(...hs.map(h => h.lvl)) >= ABSOLU_LVL;
}
{ const ge1 = genEncounter; genEncounter = function (run, node, rng = RNG) {
    const had = !!node.enc, e = ge1.apply(this, arguments);
    if (!had && node.type === "boss" && absoluOn(run)) { node.absolu = 1; }
    return e; }; }
{ const bf2 = battleFor; battleFor = function (run, node, enc) { const B = bf2.apply(this, arguments);
    if (node && node.absolu) for (const e of B.enemies) if (MONSTERS[e.key] && MONSTERS[e.key].boss) { e.hpMax = Math.round(e.hpMax * 1.4); e.hp = e.hpMax; e.dmgLo = Math.round(e.dmgLo * 1.3); e.dmgHi = Math.round(e.dmgHi * 1.3); e.name += " Absolu"; e.absolu = 1; }
    return B; }; }
function absoluDrop(run) {
  const hs = run.party.map(heroById).filter(Boolean).filter(h => h.lvl >= TIER_LVL[TIER_MAX]); const h = hs.length ? pick(hs) : null;
  const cls = h ? h.cls : pick(CLASS_IDS), kind = h && h.evo && chance(.5) ? "arm" : "wpn";
  const evo = kind === "arm" ? h.evo : null, rar = Math.max(4, rollRarity(.35, 4));
  const it = makeGear(kind, cls, TIER_MAX, rar, null, evo); it.absolu = 1; return it;
}
{ const rf1 = rewardFor; rewardFor = function (run, node, rng = RNG) { const R = rf1.apply(this, arguments);
    if (node && node.type === "boss" && node.absolu) { const it = absoluDrop(run); R.loot.push(it); R.absolu = it; R.shards = (R.shards || 0) + 2; S.absolu = (S.absolu || 0) + 1; }
    return R; }; }

// ── 4 · Marché des éclats : or → éclats (prix croissant dans la journée), éclats → gemmes ──
function shardMarket() { const day = new Date().toDateString(); if (!S.shardBuy || S.shardBuy.day !== day) S.shardBuy = { day, n: 0, g: 0, c: 0 }; return S.shardBuy; }
function shardPrice() { const M = shardMarket(); return Math.round((400 + 80 * advA()) * Math.pow(1.35, M.n) / 10) * 10; }
function cendrePrice() { const M = shardMarket(); return Math.round((250 + 40 * advA()) * Math.pow(1.25, M.c) / 10) * 10; }
const GEM_SHARDS = 3;
function gemShopLvl() { return Math.min(GEM_MAX, 1 + Math.floor(advA() / 15)); }
function marketBuy(kind) {
  const M = shardMarket();
  if (kind === "shard") { const c = shardPrice(); if (S.gold < c) return { err: "Pas assez d'or." }; S.gold -= c; S.shards++; M.n++; return { ok: "1 éclat", c }; }
  if (kind === "cendre") { const c = cendrePrice(); if (S.gold < c) return { err: "Pas assez d'or." }; S.gold -= c; S.mats.cendre = (S.mats.cendre || 0) + 1; M.c++; return { ok: "1 cendre", c }; }
  if (kind === "gem") { if (S.shards < GEM_SHARDS) return { err: `Il faut ${GEM_SHARDS} éclats.` }; S.shards -= GEM_SHARDS; const [k, l] = gemRoll(RNG, gemShopLvl()).split(":"); gemAdd(k, +l); M.g++; return { ok: (GEMS[k] ? GEMS[k].n : k) + " " + l, gem: k + ":" + l }; }
  return { err: "?" };
}

// ── 7 · Bestiaire des variantes de gardiens ──
function bossVariantGroups() {
  const G = {}; for (const k of Object.keys(MONSTERS)) { const M = MONSTERS[k]; if (M.variantOf) (G[M.variantOf] = G[M.variantOf] || []).push(k); }
  return G;
}
function variantsBeaten() { const B = S.beaten || {}; return Object.keys(MONSTERS).filter(k => MONSTERS[k].variantOf && B[k]).length; }

// ── 8 · Succès de collection ──
function ownedGear() { const L = S.inv.slice(); for (const h of S.heroes) for (const v of Object.values(h.gear || {})) { if (Array.isArray(v)) L.push(...v.filter(Boolean)); else if (v) L.push(v); } return L.filter(i => i && i.kind); }
function pathArmorClass(minTier) { const G = ownedGear(); return CLASS_IDS.find(c => CLASSES[c].evos && Object.keys(CLASSES[c].evos).every(v => G.some(i => i.kind === "arm" && i.cls === c && i.evo === v && i.tier >= minTier))); }
const COLL_ACH = [
  { id: "coll_voies", n: "Garde-robe des voies", d: "Posséder l'armure de voie (palier VI ou plus) des deux voies d'une même classe.", gold: 1500, shards: 4, ok: () => !!pathArmorClass(6) },
  { id: "coll_absolu", n: "Panoplie absolue", d: "Posséder l'armure de palier X des deux voies d'une même classe.", gold: 6000, shards: 10, ok: () => !!pathArmorClass(TIER_MAX) },
  { id: "coll_mythes", n: "Panthéon", d: "Recruter les quinze Mythes.", gold: 8000, shards: 12, ok: () => typeof MYTHS !== "undefined" && MYTHS.every(m => (S.legends || {})[m.id]) },
  { id: "coll_mythes5", n: "Récits d'avant", d: "Recruter cinq Mythes.", gold: 2500, shards: 5, ok: () => typeof MYTHS !== "undefined" && MYTHS.filter(m => (S.legends || {})[m.id]).length >= 5 },
  { id: "coll_variantes", n: "Quatre visages", d: "Vaincre les quatre variantes d'un même gardien.", gold: 2000, shards: 5, ok: () => Object.values(bossVariantGroups()).some(L => L.every(k => (S.beaten || {})[k])) },
  { id: "coll_variantes34", n: "Chasseur de variantes", d: "Vaincre 34 variantes de gardiens.", gold: 5000, shards: 8, ok: () => variantsBeaten() >= 34 },
  { id: "coll_uniques", n: "Reliquaire", d: "Obtenir dix objets uniques de gardiens différents.", gold: 3000, shards: 6, ok: () => Object.keys(S.uniqs || {}).length >= 10 },
  { id: "coll_absolus", n: "Au-delà de l'absolu", d: "Vaincre dix gardiens Absolus.", gold: 5000, shards: 8, ok: () => (S.absolu || 0) >= 10 },
  { id: "coll_compagnons", n: "Arche", d: "Posséder 30 compagnons.", gold: 2500, shards: 5, ok: () => ((S.pets && S.pets.owned) || []).length >= 30 },
];
if (typeof HIDDEN_ACH !== "undefined") for (const A of COLL_ACH) if (!HIDDEN_ACH.some(a => a.id === A.id)) HIDDEN_ACH.push(Object.assign({ coll: 1 }, A));
function collAchCheck() { const got = []; for (const A of COLL_ACH) { try { if (A.ok()) { const r = hiddenAch(A.id); if (r) got.push(r); } } catch (e) { } } return got; }
{ const he0 = hiddenEndRun; hiddenEndRun = function (run, outcome, res) { const r = he0.apply(this, arguments); try { if (res) res.hidden = (res.hidden || []).concat(collAchCheck()); } catch (e) { } return r; }; }
