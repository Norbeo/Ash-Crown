/* ═══════════════════════ État du jeu, héros, objets, sauvegarde ═══════════════════════ */
let S = null;

function newState(opts = {}) {
  return {
    v: 1, created: Date.now(), gold: 150, shards: 0, mats: { fer: 6, essence: 2, cendre: 0 },
    heroes: [], recruits: [], recruitSeed: 1,
    pets: { owned: [], lvl: {}, xp: {}, evo: {} }, pet: null,
    bld: { taverne: 1, forge: 1, chapelle: 1, academie: 1, menagerie: 1, fonderie: 1 },
    prog: {}, story: 0, unlocked: ["bourg"],
    inv: [], potions: 0,
    stats: { wins: 0, kills: 0, runs: 0, deaths: 0, evos: 0, apex: 0, maxlvl: 0, roster: 0, classes: 0, tier5: 0, legend: 0, pets: 0, petEvo: 0, flawless: 0, oath: 0, daily: 0, goldMax: 0, abyss: 0, bossKills: 0, crafts: 0 },
    seen: { classes: {}, monsters: {} }, ach: {},
    daily: { key: 0, done: 0, contracts: [] },
    abyss: { best: 0, oaths: [] },
    lastSeen: Date.now(), bank: 0,
    run: null, log: [],
    flags: [],
    opts: { sound: 1, music: 1, speed: 1, hardcore: !!opts.hardcore, auto: 0, diff: opts.diff || "normal" },
    tuto: {},
  };
}

// ── Héros ──
const SKINS = ["#f0d2b4", "#e0b48c", "#c8946a", "#a87250", "#7a5034", "#e8c8a8"];
const HAIRCOL = ["#1a1410", "#3a2414", "#6a3a1a", "#a06a30", "#c8a060", "#d8d0c0", "#7a2a14", "#2a2a30"];
function makeHero(cls, opt = {}) {
  const C = CLASSES[cls], female = CLASS_FEMALE.has(cls);
  const name = opt.name || heroName(female);
  const goods = Object.keys(TRAITS).filter(k => TRAITS[k].good && !TRAITS[k].unique), bads = Object.keys(TRAITS).filter(k => !TRAITS[k].good);
  const traits = opt.traits || (() => { const t = [pick(goods)]; if (chance(.35)) { let g = pick(goods); if (!t.includes(g)) t.push(g); } if (chance(.4)) t.push(pick(bads)); return t; })();
  const sk = Object.keys(C.skills);
  const h = {
    id: uid("h"), cls, name, female, lvl: opt.lvl || 1, xp: 0, evo: null, traits,
    look: { skin: pick(SKINS), hair: rint(0, 5), hairCol: pick(HAIRCOL), beard: female ? -1 : rint(-1, 3), scar: chance(.3) ? rint(0, 2) : -1, eye: rint(0, 2) },
    gear: { wpn: makeGear("wpn", cls, 1, 0), arm: makeGear("arm", cls, 1, 0), tr1: null, tr2: null },
    skills: sk.slice(0, 4), skr: {}, hp: null, injured: 0, kills: 0, runs: 0, born: Date.now(),
  };
  for (const k of sk) h.skr[k] = 1;
  return h;
}
const xpNeed = l => Math.round(110 + 75 * Math.pow(l - 1, 1.62));
function heroSkillPool(h) {
  const C = CLASSES[h.cls]; const pool = Object.keys(C.skills);
  if (h.evo) pool.push(...Object.keys(C.evos[h.evo].skills));
  return pool;
}
function skillDef(h, id) { const C = CLASSES[h.cls]; return C.skills[id] || (h.evo && C.evos[h.evo].skills[id]) || null; }
function heroUlt(h) { const C = CLASSES[h.cls]; return h.evo ? C.evos[h.evo].ult : C.ult; }
function heroTitle(h) { const C = CLASSES[h.cls]; if (h.evo) { const e = C.evos[h.evo]; return h.lvl >= APEX_LVL ? APEX[h.evo].n : e.n; } return C.n; }
function heroPassives(h) {
  const C = CLASSES[h.cls], out = [];
  for (const t of h.traits) out.push(...TRAITS[t].pas);
  if (h.evo) { out.push(...C.evos[h.evo].pas); if (h.lvl >= APEX_LVL) out.push(...APEX[h.evo].pas); }
  for (const s of ["tr1", "tr2"]) { const it = h.gear[s]; if (it && TRINKETS[it.key]) out.push(...TRINKETS[it.key].pas); }
  if (h.mark && typeof GUARD_MARKS !== "undefined" && GUARD_MARKS[h.mark]) out.push(...GUARD_MARKS[h.mark].pas); // marque d'un gardien vaincu
  return out;
}

// ── Statistiques ──
function heroStats(h, relicH = {}) {
  const C = CLASSES[h.cls], b = C.base, L = h.lvl - 1;
  const st = { hp: b.hp * (1 + .11 * L), dmgLo: b.dmg[0] * (1 + .08 * L), dmgHi: b.dmg[1] * (1 + .08 * L), prot: b.prot, spd: b.spd + Math.floor(L / 4), crit: b.crit + L * .3, dodge: b.dodge + L * .5, acc: 95 + L * .6, res: 20 + L * 1.5, healPow: 1 + L * .04, leech: 0, hooks: {} };
  let dmgP = 0, hpP = 0;
  const w = h.gear.wpn, a = h.gear.arm;
  if (w) { dmgP += WPN_DMG[w.tier] * (1 + .07 * w.up) + w.up * .03; }
  if (a) { hpP += ARM_HP[a.tier] * (1 + .07 * a.up) + a.up * .025; st.prot += ARM_PROT[a.tier]; }
  for (const it of [w, a, h.gear.tr1, h.gear.tr2]) if (it && it.aff) for (const f of it.aff) {
    if (f.k === "dmg") dmgP += f.v; else if (f.k === "hp") hpP += f.v; else if (f.k === "healPow") st.healPow += f.v; else st[f.k] = (st[f.k] || 0) + f.v;
  }
  for (const p of heroPassives(h)) {
    if (p.k === "stat") { if (p.s === "dmg") dmgP += p.v; else if (p.s === "hp") hpP += p.v; else if (p.s === "healPow") st.healPow += p.v; else st[p.s] = (st[p.s] || 0) + p.v; }
    else st.hooks[p.k] = (st.hooks[p.k] || 0) + p.v, p.tag && (st.hooks.vsTag = p.tag, st.hooks.vsTagV = (st.hooks.vsTagV || 0) + p.v);
  }
  if (relicH.dmg) dmgP += relicH.dmg; if (relicH.hp) hpP += relicH.hp; if (relicH.crit) st.crit += relicH.crit; if (relicH.spd) st.spd += relicH.spd; if (relicH.prot) st.prot += relicH.prot; if (relicH.leech) st.leech += relicH.leech; if (relicH.heal) st.healPow += relicH.heal;
  st.hp = Math.round(st.hp * (1 + hpP)); st.dmgLo = Math.max(1, Math.round(st.dmgLo * (1 + dmgP))); st.dmgHi = Math.max(st.dmgLo + 1, Math.round(st.dmgHi * (1 + dmgP)));
  st.prot = clamp(st.prot, 0, .75); st.crit = clamp(st.crit, 0, 75); st.dodge = clamp(st.dodge, 0, 60);
  return st;
}
const heroPower = h => { const s = heroStats(h); return Math.round(s.hp * .6 + (s.dmgLo + s.dmgHi) * 2.2 + s.prot * 120 + s.crit * 1.2 + s.dodge * .8 + s.spd * 3); };

// ── Équipement ──
function makeGear(kind, cls, tier, rar, key, evo) {
  const it = { id: uid("i"), kind, tier: clamp(tier, 1, 6), rar: clamp(rar, 0, 6), up: 0, aff: [] };
  if (kind === "arm" && it.tier >= 6 && evo) it.evo = evo; // armure Ascendante : propre à une voie d'évolution
  if (kind === "tr") {
    let pool = []; for (let q = rar; q >= 0 && !pool.length; q--) pool = Object.keys(TRINKETS).filter(k => TRINKETS[k].r === q); // qualité sans bibelot : la plus proche en dessous
    it.key = key || pick(pool.length ? pool : Object.keys(TRINKETS)); it.rar = TRINKETS[it.key].r; it.tier = 1;
  } else it.cls = cls;
  const nAff = kind === "tr" ? 0 : RARITY[it.rar].aff;
  const keys = Object.keys(AFFIXES).filter(k => !(kind === "wpn" && k === "prot")); RNG.shuffle(keys);
  for (let i = 0; i < nAff; i++) { const A = AFFIXES[keys[i]], sc = 1 + (it.tier - 1) * .25; let v = lerp(A.v[0], A.v[1], rnd()) * sc; v = A.fmt === "pct" ? Math.round(v * 100) / 100 : Math.round(v); it.aff.push({ k: keys[i], v }); }
  return it;
}
function gearName(it) {
  if (!it) return "—";
  if (it.kind === "tr") return TRINKETS[it.key].n;
  const L = GEAR_NAMES[it.cls][it.kind === "wpn" ? "wpn" : "arm"], n = it.tier >= 6 ? (it.evo && CLASSES[it.cls].evos[it.evo] ? "Armure ascendante : " + CLASSES[it.cls].evos[it.evo].n : "Ascendant : " + L[4]) : L[it.tier - 1];
  return n + (it.up ? " +" + it.up : "");
}
// tirage de qualité : poids RARITY[q].p ; la chance (0 à ~0,4) renforce les qualités hautes de façon progressive, le plancher retire les basses
const rollRarity = (luck = 0, floor = 0) => { const w = RARITY.map((R, q) => q < floor ? 0 : R.p * Math.pow(1 + Math.max(0, luck) * 6, q / 2)); let r = rnd() * w.reduce((a, b) => a + b, 0); for (let q = 0; q < w.length; q++) { r -= w[q]; if (r < 0) return q; } return floor; };
function lootGear(lvl, luck = 0, cls, floor = 0) {
  const base = TIER_LVL.filter(l => l <= lvl).length - 1; // palier que le niveau permet de porter
  const tier = clamp(base + (chance(.25) ? 1 : 0), 1, typeof lootTierCap === "function" ? lootTierCap() : 5);
  const r = rnd(), rar = rollRarity(luck, floor);
  if (r < .3) return makeGear("tr", null, 1, rar);
  const owned = S ? [...new Set(S.heroes.map(h => h.cls))] : [];
  const c = cls || (owned.length && chance(.85) ? pick(owned) : pick(CLASS_IDS));
  return makeGear(r < .65 ? "wpn" : "arm", c, tier, rar);
}
const upCost = it => ({ gold: Math.round(60 * it.tier * (1 + it.up * .7)), fer: 1 + Math.floor(it.up / 2) + (it.tier >= 3 ? 1 : 0), essence: it.up >= 3 ? 1 + (it.up >= 5 ? 1 : 0) : 0 });
const craftCost = tier => ({ gold: [0, 80, 220, 520, 1100, 2200, 4500][tier], fer: [0, 3, 5, 8, 12, 16, 22][tier], essence: [0, 0, 1, 3, 5, 8, 12][tier], cendre: [0, 0, 0, 0, 1, 3, 6][tier] });
const salvage = it => ({ fer: it.kind === "tr" ? 1 : 1 + it.tier + it.up, essence: it.rar >= 1 ? it.rar : 0, cendre: it.rar >= 4 ? 1 : 0, gold: 10 * it.tier * (1 + it.rar) });

// ── Compagnons ──
function petLvl(id) { return (S && S.pets.lvl[id]) || 1; }
const petXpNeed = l => Math.round(60 + 40 * Math.pow(l - 1, 1.35));
function petEvolved(id) { return !!(S && S.pets.evo[id]); }
function petName(id) { return petEvolved(id) ? PETS[id].evo.n : PETS[id].n; }
function petPower(id) { const l = petLvl(id); return { dmg: 3.2 + l * .95, heal: 1 + l * .03 }; }

// ── Sauvegarde ──
function save() {
  if (!HASWIN || !S) return;
  try { S.lastSeen = Date.now(); localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { }
}
function load() {
  if (!HASWIN) return null;
  try { const raw = localStorage.getItem(SAVE_KEY); if (!raw) return null; const s = JSON.parse(raw); return migrate(s); } catch (e) { return null; }
}
function fixHeroName(h) {
  const f = CLASS_FEMALE.has(h.cls), [first, ...rest] = String(h.name).split(" "), sur = rest.join(" ");
  const okFirst = (f ? NAMES_F : NAMES_M).includes(first) || !NAMES_F.concat(NAMES_M).includes(first);
  const tail = x => x.replace(/^(le |la |l'|du |des )/, ""), pair = SURNAMES.find(p => p.some(x => tail(x) === tail(sur)));
  const newFirst = okFirst ? first : (f ? NAMES_F : NAMES_M)[hashStr(h.id || first) % (f ? NAMES_F : NAMES_M).length];
  const newSur = !sur ? "" : pair ? (f && pair[1] ? pair[1] : pair[0]) : sur.replace(/^(le|la) /, f ? "la " : "le ");
  h.female = f; if (h.look && f) h.look.beard = -1;
  h.name = newFirst + (newSur ? " " + newSur : "");
}
function migrate(s) {
  const base = newState();
  for (const k in base) if (s[k] === undefined) s[k] = base[k];
  for (const k in base.stats) if (s.stats[k] === undefined) s.stats[k] = 0;
  for (const k in base.bld) if (!s.bld[k]) s.bld[k] = 1;
  for (const k in base.opts) if (s.opts[k] === undefined) s.opts[k] = base.opts[k];
  // le nom et le sexe suivent l'illustration de la classe (anciennes sauvegardes : héroïne dessinée en homme, surnom mal accordé…)
  for (const h of (s.heroes || []).concat(s.recruits || [])) fixHeroName(h);
  // qualité « Peu commun » insérée en 2e position : décale les anciennes qualités
  if (!s.rarV) { const items = [...(s.inv || []), ...(s.run ? s.run.loot || [] : [])]; for (const h of s.heroes || []) for (const k in h.gear || {}) if (h.gear[k]) items.push(h.gear[k]); for (const it of new Set(items)) if (it.rar >= 1) it.rar++; s.rarV = 2; }
  return s;
}
// difficulté : ennemis (PV, dégâts) et récompenses (or, expérience)
const DIFFS = {
  facile: { n: "Facile", d: "Ennemis affaiblis (−25 % PV, −20 % dégâts). Pour découvrir l'histoire.", hp: .75, dmg: .8, gold: .9, xp: 1, ic: "heal" },
  normal: { n: "Normal", d: "L'expérience prévue.", hp: 1, dmg: 1, gold: 1, xp: 1, ic: "sword" },
  cauchemar: { n: "Cauchemar", d: "Ennemis redoutables (+30 % PV, +25 % dégâts) mais +35 % d'or et +20 % d'expérience.", hp: 1.3, dmg: 1.25, gold: 1.35, xp: 1.2, ic: "skull" },
};
const diffOf = () => DIFFS[(S && S.opts && S.opts.diff) || "normal"] || DIFFS.normal;
const potionMax = () => 2 + (S ? S.bld.chapelle : 1);
const rosterMax = () => 4 + S.bld.taverne * 2;
const skillRankMax = h => S.bld.academie + (h ? Math.floor(h.lvl / 10) : 0); // la Salle des maîtres, puis le niveau du héros : sans limite
const fonderieRate = () => [0, 18, 34, 58, 90, 135][S.bld.fonderie]; // or par heure
const fonderieCap = () => [0, 6, 8, 10, 12, 16][S.bld.fonderie]; // heures
