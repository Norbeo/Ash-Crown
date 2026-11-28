/* 12 nov. — propositions : coffre du gardien (toutes les 4 h), invasions du week-end, records par gardien, roue de la Taverne,
   récompenses de collection, titres du joueur, « pendant votre absence ». Logique pure (testable sous node). */
const M5 = () => { S.m5 = S.m5 || { chest: 0, wheel: 0, rec: {}, col: {}, title: "", inv: 0, away: 0 }; return S.m5; };
const m5Scale = () => typeof progressScale === "function" ? progressScale() : 1;
function m5Hero() { return S.heroes.slice().sort((a, b) => b.lvl - a.lvl)[0]; }
function m5Item(rar, kind) { const h = m5Hero(); if (!h) return null; let t = 1; for (let i = 1; i < TIER_LVL.length; i++) if (h.lvl >= TIER_LVL[i]) t = i; if (!h.evo) t = Math.min(t, 5);
  kind = kind || pick(["wpn", "arm", "tr"]); const it = makeGear(kind, kind === "tr" ? null : h.cls, t, rar, null, kind === "arm" && t >= 6 ? h.evo : undefined); S.inv.push(it); return it; }
function m5Give(R) {
  if (R.gold) S.gold += R.gold; if (R.shards) S.shards = (S.shards || 0) + R.shards; if (R.tome) S.tomes = (S.tomes || 0) + R.tome;
  if (R.essence) S.mats.essence = (S.mats.essence || 0) + R.essence; if (R.fer) S.mats.fer = (S.mats.fer || 0) + R.fer; if (R.cendre) S.mats.cendre = (S.mats.cendre || 0) + R.cendre;
  if (R.gem && typeof gemAdd === "function") gemAdd(pick(Object.keys(GEMS)), R.gem);
  if (R.rar != null) R.it = m5Item(R.rar); return R; }

// ── Coffre du gardien : gratuit toutes les 4 h ──
const CHEST_H = 4;
function chestLeft() { return Math.max(0, M5().chest + CHEST_H * 3600e3 - Date.now()); }
function chestReady() { return !!S.heroes.length && chestLeft() <= 0; }
function chestOpen() { if (!chestReady()) return null; const k = m5Scale(), A = M5(); A.chest = Date.now(); A.chestN = (A.chestN || 0) + 1;
  const R = { gold: Math.round((250 + rnd() * 250) * k / 10) * 10, shards: 1 + (chance(.4) ? 1 : 0), rar: rollRarity(.05, 2) };
  if (chance(.3)) R.gem = 1 + (chance(.25) ? 1 : 0); if (chance(.3)) R.tome = 1; if (chance(.25)) R.essence = 3 + Math.floor(rnd() * 4);
  if (A.chestN % 10 === 0) { R.rar = Math.max(R.rar, 5); R.tenth = 1; } // chaque 10e coffre : au moins Divin
  return m5Give(R); }

// ── Roue de la Taverne : un tirage par jour ──
const WHEEL = [{ n: "Bourse", w: 24, gold: 600 }, { n: "Éclats", w: 16, shards: 3 }, { n: "Tomes", w: 14, tome: 2 }, { n: "Essence", w: 14, essence: 8 }, { n: "Gemme", w: 12, gem: 2 },
  { n: "Objet Légendaire", w: 9, rar: 4 }, { n: "Grande bourse", w: 7, gold: 2000 }, { n: "Objet Mythique", w: 3, rar: 5 }, { n: "Jackpot : objet Céleste", w: 1, rar: 7 }];
function wheelReady() { return !!S.heroes.length && M5().wheel !== dayKey(); }
function wheelSpin() { if (!wheelReady()) return null; M5().wheel = dayKey(); const tot = WHEEL.reduce((a, s) => a + s.w, 0); let r = rnd() * tot, i = 0; for (; i < WHEEL.length - 1; i++) { r -= WHEEL[i].w; if (r < 0) break; }
  const R = Object.assign({}, WHEEL[i]); if (R.gold) R.gold = Math.round(R.gold * m5Scale() / 10) * 10; R.idx = i; return m5Give(R); }

// ── Invasions du week-end : un chapitre déjà vaincu est envahi (ennemis +25 %, or ×2, xp ×1,5) ──
function invasionRegion() { const d = new Date(), wd = d.getDay(); if (wd !== 0 && wd !== 6) return null;
  const regs = REGIONS.filter(r => r.id !== "abime" && S.prog[r.id] && S.prog[r.id].clears); if (!regs.length) return null;
  const wk = Math.floor((Date.now() / 864e5 + 3) / 7); return regs[wk % regs.length].id; }
{ const sr = startRun; startRun = function (reg) { const run = sr.apply(this, arguments); if (run && reg === invasionRegion() && !run.daily) run.invaded = 1; return run; }; }
{ const bf = balFactor; balFactor = function (run, boss) { const F = bf.apply(this, arguments); return run && run.invaded ? { hp: F.hp * 1.25, dmg: F.dmg * 1.25 } : F; }; }
{ const gr = grantReward; grantReward = function (run, R) { if (run && run.invaded && R) { if (R.gold) R.gold *= 2; if (R.xp) R.xp *= 1.5; } return gr.apply(this, arguments); }; }

// ── Records par gardien (moins de tours, plus gros coup, sans agonie) : battre un record = éclats ──
function bossRecordAfter(run, B) { if (!B || B.over !== "win") return null; const b = (B.dead || []).find(e => e.boss); if (!b) return null;
  const k = typeof bossBase === "function" ? bossBase(b.key) : b.key, A = M5(), o = A.rec[k], T = B.tally || {};
  const cur = { turns: B.round || 99, hit: T.best ? T.best.v : 0, clean: ![...B.heroes, ...(B.fallen || [])].some(u => u.agonyN) ? 1 : 0, name: b.name };
  const got = []; if (!o) { A.rec[k] = cur; return { first: 1, k, name: b.name }; }
  if (cur.turns < o.turns) { got.push(`moins de tours (${cur.turns} au lieu de ${o.turns})`); o.turns = cur.turns; }
  if (cur.hit > o.hit) { got.push(`plus gros coup (${fmt(cur.hit)})`); o.hit = cur.hit; }
  if (cur.clean && !o.clean) { got.push("sans agonie"); o.clean = 1; }
  if (!got.length) return null; const sh = 2 * got.length; S.shards = (S.shards || 0) + sh; return { k, name: b.name, got, shards: sh }; }
{ const ab = afterBattle; afterBattle = function (run, B) { let r = null; try { r = bossRecordAfter(run, B); } catch (e) { } if (r && run) (run.recNew = run.recNew || []).push(r); if (run && run.invaded && B && B.over === "win" && (B.dead || []).some(e => e.boss)) M5().inv = (M5().inv || 0) + 1; return ab.apply(this, arguments); }; }

// ── Récompenses de collection : paliers 25/50/75/100 % ──
function colCounts() {
  const allMon = Object.keys(MONSTERS).filter(k => !MONSTERS[k].variantOf), seen = Object.keys((S.seen || {}).monsters || {}).filter(k => MONSTERS[k] && !MONSTERS[k].variantOf).length;
  const pets = Object.keys(PETS).length, own = ((S.pets || {}).owned || []).length;
  const uq = typeof UNIQ !== "undefined" ? Object.keys(UNIQ).length : 0, uqGot = Object.keys(S.uniqs || {}).length;
  return { bestiaire: [seen, allMon.length], compagnons: [own, pets], uniques: [uqGot, uq || 1], gardiens: [Object.keys(S.trophies || {}).length, ALL_BOSSES.filter(k => !MONSTERS[k].variantOf).length] };
}
const COL_N = { bestiaire: "Bestiaire", compagnons: "Ménagerie", uniques: "Objets uniques", gardiens: "Trophées de gardiens" };
const COL_STEPS = [25, 50, 75, 100];
function colReward(cat, p) { const k = m5Scale(); return { gold: Math.round(800 * (p / 25) * k / 10) * 10, shards: 3 * p / 25, rar: p === 100 ? 7 : p >= 75 ? 6 : p >= 50 ? 5 : 4, title: p === 100 ? COL_TITLE[cat] : null }; }
const COL_TITLE = { bestiaire: "Érudit des Ombres", compagnons: "Maître des Bêtes", uniques: "Collectionneur Maudit", gardiens: "Fléau des Gardiens" };
function colPct(cat) { const [a, b] = colCounts()[cat]; return Math.min(100, Math.floor(a / Math.max(1, b) * 100)); }
function colClaimable(cat) { const A = M5(), got = (A.col[cat] || []); return COL_STEPS.filter(p => colPct(cat) >= p && !got.includes(p)); }
function colClaim(cat, p) { if (!colClaimable(cat).includes(p)) return null; const A = M5(); (A.col[cat] = A.col[cat] || []).push(p); const R = m5Give(colReward(cat, p)); if (R.title) titleAdd(R.title); return R; }
function colBonus() { const A = M5(); return Object.values(A.col).reduce((a, L) => a + L.length, 0); } // +1 % dégâts et PV par palier obtenu
if (typeof PAS_HOOKS !== "undefined") PAS_HOOKS.push(h => { const n = S && S.m5 ? colBonus() : 0; return n ? [{ k: "stat", s: "dmg", v: n * .01 }, { k: "stat", s: "hp", v: n * .01 }] : []; });

// ── Titres du joueur ──
const TITLES_BASE = [{ t: "Capitaine des Cendres", need: () => true }, { t: "Pourfendeur", need: () => Object.keys(S.trophies || {}).length >= 5 }, { t: "Seigneur du Bastion", need: () => Object.values(S.bld || {}).reduce((a, b) => a + b, 0) >= 30 },
  { t: "Briseur de Cycles", need: () => (S.cycle || 0) >= 1 }, { t: "Envahisseur repoussé", need: () => (M5().inv || 0) >= 3 }, { t: "Gardien des Records", need: () => Object.keys(M5().rec).length >= 15 },
  { t: "Chanceux", need: () => (M5().chestN || 0) >= 30 }, { t: "Légende vivante", need: () => Object.keys(S.legends || {}).length >= 5 }];
function titleAdd(t) { const A = M5(); A.titles = A.titles || []; if (!A.titles.includes(t)) A.titles.push(t); }
function titlesOwned() { const A = M5(); const L = TITLES_BASE.filter(x => { try { return x.need(); } catch (e) { return false; } }).map(x => x.t); return [...new Set(L.concat(A.titles || []))]; }
function titleCur() { const A = M5(), L = titlesOwned(); return L.includes(A.title) ? A.title : L[0]; }

// ── Pendant votre absence ──
function awaySummary() { const A = M5(), now = Date.now(), last = A.away || 0; A.away = now; if (!last || now - last < 30 * 60e3 || !S.heroes.length) return null;
  const L = [], h = (now - last) / 3600e3;
  L.push({ ic: "clock", t: `Absent ${h >= 24 ? Math.floor(h / 24) + " j " + Math.floor(h % 24) + " h" : Math.floor(h) + " h " + Math.round((h % 1) * 60) + " min"}` });
  if (typeof idleBank === "function") { const g = Math.floor(idleBank()); if (g > 0) L.push({ ic: "coin", t: `La Fonderie a amassé ${fmt(g)} or`, a: "bld", v: "fonderie" }); }
  if (chestReady()) L.push({ ic: "chest", t: "Le coffre du gardien est prêt", a: "chestOpen" });
  if (wheelReady()) L.push({ ic: "dice", t: "Un tirage gratuit vous attend à la Taverne", a: "wheel" });
  if (invasionRegion()) { const R = regionById(invasionRegion()); L.push({ ic: "skull", t: `Invasion du week-end : ${R ? R.n : ""} (or ×2)`, a: "goalGo", v: invasionRegion() }); }
  const C = Object.keys(COL_N).reduce((a, c) => a + colClaimable(c).length, 0); if (C) L.push({ ic: "star", t: `${C} récompense${C > 1 ? "s" : ""} de collection à récupérer`, a: "collect" });
  return L; }
