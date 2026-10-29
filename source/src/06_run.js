/* ═══════════════════════ Expéditions : carte, salles, récompenses ═══════════════════════ */
const NODE_T = {
  combat: { n: "Combat", ic: "swords", c: "#c8b8a0" }, elite: { n: "Élite", ic: "skullc", c: "#ff6a4a" }, event: { n: "Mystère", ic: "quest", c: "#b48cff" },
  treasure: { n: "Trésor", ic: "chest", c: "#ffc04a" }, camp: { n: "Feu de camp", ic: "camp", c: "#ff9a3a" }, shop: { n: "Colporteur", ic: "coin", c: "#7ad0a0" }, boss: { n: "Gardien", ic: "crown", c: "#ff3a3a" },
};

const THREAT_N = ["I", "II", "III", "IV", "V"];
// menace : chaque victoire à la menace la plus haute débloque la suivante (jusqu'à V)
function threatMax(id) { const p = S.prog[id]; return p && p.clears ? Math.min(4, (p.threat || 0) + 1) : 0; }
function regionsCleared() { return REGIONS.filter(r => S.prog[r.id] && S.prog[r.id].clears > 0).length; }
function classUnlocked(c) { return CLASSES[c].unlock <= regionsCleared() || !!(S.seen && S.seen.classes[c]); }
function petUnlocked(id) { return PETS[id].starter || (PETS[id].unlock || 0) <= regionsCleared(); }
function regionUnlocked(id) { if (id === "abime") return regionsCleared() >= 1; const i = REGIONS.findIndex(r => r.id === id); return i === 0 || (S.prog[REGIONS[i - 1].id] && S.prog[REGIONS[i - 1].id].clears > 0); }

// ── génération de la carte ──
function genMap(rng, cols, opt = {}) {
  const map = [];
  for (let c = 0; c < cols; c++) {
    const last = c === cols - 1;
    const n = last ? 1 : c === 0 ? 3 : c === cols - 2 ? 2 : rng.int(2, 4);
    const col = [];
    for (let i = 0; i < n; i++) {
      let type;
      if (last) type = "boss";
      else if (c === 0) type = "combat";
      else if (c === cols - 2) type = "camp";
      else type = rng.weighted(["combat", "event", "elite", "treasure", "camp", "shop"], t => ({ combat: 44, event: 22, elite: c >= 2 ? 11 + (opt.elite ? 10 : 0) : 0, treasure: 8, camp: c >= 2 ? 6 : 0, shop: c >= 2 ? 7 : 0 })[t]);
      col.push({ c, i, type, links: [], done: false, x: n === 1 ? .5 : .12 + .76 * i / (n - 1) + (rng() - .5) * .08 });
    }
    // pas deux colporteurs/camps dans la même colonne
    const seen = {}; for (const nd of col) { if ((nd.type === "shop" || nd.type === "camp" || nd.type === "treasure") && !last && c !== cols - 2) { if (seen[nd.type]) nd.type = "combat"; seen[nd.type] = 1; } }
    map.push(col);
  }
  for (let c = 0; c < cols - 1; c++) {
    const A = map[c], Bn = map[c + 1];
    for (const nd of A) {
      const rel = A.length === 1 ? .5 : nd.i / (A.length - 1);
      const j = Math.round(rel * (Bn.length - 1));
      nd.links.push(j);
      if (Bn.length > 1 && rng.chance(.45)) { const k = clamp(j + (rng.chance(.5) ? 1 : -1), 0, Bn.length - 1); if (!nd.links.includes(k)) nd.links.push(k); }
    }
    for (let j = 0; j < Bn.length; j++) if (!A.some(nd => nd.links.includes(j))) { const nd = A.reduce((b, x) => Math.abs(x.x - Bn[j].x) < Math.abs(b.x - Bn[j].x) ? x : b); nd.links.push(j); }
    for (const nd of A) nd.links.sort((a, b) => a - b);
  }
  fixMapRules(map, rng);
  return map;
}
// règles de la carte : jamais deux salles identiques d'affilée (sauf les combats) et au moins une élite sur chaque chemin
function fixMapRules(map, rng) {
  const cols = map.length, parents = (nd) => nd.c ? map[nd.c - 1].filter(p => p.links.includes(nd.i)) : [], kids = nd => nd.c < cols - 1 ? nd.links.map(j => map[nd.c + 1][j]) : [];
  for (let c = 1; c < cols - 1; c++) for (const nd of map[c]) if (nd.type !== "combat") for (const p of parents(nd)) if (p.type === nd.type) { if (c === cols - 2) p.type = "combat"; else nd.type = "combat"; }
  for (let guard = 0; guard < 40; guard++) {
    // f : existe-t-il un chemin sans élite depuis ce nœud jusqu'au gardien ?
    const f = new Map(); for (let c = cols - 1; c >= 0; c--) for (const nd of map[c]) f.set(nd, nd.type !== "elite" && (c === cols - 1 || kids(nd).some(k => f.get(k))));
    let cur = map[0].find(nd => f.get(nd)); if (!cur) break;
    const path = []; while (cur) { path.push(cur); cur = kids(cur).find(k => f.get(k)); }
    const cand = path.filter(nd => nd.c >= 1 && nd.c <= cols - 3 && nd.type === "combat");
    const calm = cand.filter(nd => ![...parents(nd), ...kids(nd)].some(x => x.type === "elite"));
    const pickN = (calm.length ? calm : cand)[Math.floor(rng() * (calm.length || cand.length))];
    if (!pickN) { const any = path.find(nd => nd.c >= 1 && nd.c <= cols - 3); if (!any) break; any.type = "elite"; } else pickN.type = "elite";
  }
}

// ── lancement d'une expédition ──
function startRun(regionId, partyIds, petId, opt = {}) {
  const R = regionById(regionId);
  const seed = opt.seed || (Date.now() & 0x7fffffff);
  const rng = mkRng(seed);
  const abyss = regionId === "abime";
  const oaths = (abyss ? (opt.oaths || S.abyss.oaths || []).slice() : (opt.oaths || []).slice()).concat(opt.week && weekRule() ? (weekRule().oaths || []) : []);
  const run = { region: regionId, seed, party: partyIds.slice(), pet: petId, floor: abyss ? (opt.floor || 1) : 0, map: genMap(rng, abyss ? 6 : 9, { elite: oaths.includes("elite") }), pos: null,
    light: 100, relics: (opt.relics || []).slice(), potions: potionMax() - (oaths.includes("jeune") ? 1 : 0), gold: 0, loot: [], mats: { fer: 0, essence: 0, cendre: 0 }, shards: 0,
    kills: 0, fallen: [], oaths, week: opt.week ? S.week.rule : null, daily: !!opt.daily, threat: opt.threat || 0, startedAt: Date.now(), xpGain: {}, flawless: true, combats: 0, log: [] };
  S.run = run;
  if (run.week) { const W = weekRule(); if (W.light != null) run.light = W.light; if (W.potions != null) run.potions = W.potions === 0 ? 0 : run.potions * W.potions; }
  for (const id of partyIds) { const h = heroById(id); h.hp = isInjured(h) ? Math.round(heroStats(h).hp * .5) : null; }
  S.stats.runs++;
  return run;
}
const heroById = id => S.heroes.find(h => h.id === id);
// blessure : le héros guérit seul avec le temps (ou à la Chapelle) ; s'il part blessé, il commence à 50 % de PV
const injuryTime = h => (12 + h.lvl * 2) * 60000;
const isInjured = h => !!h.injured && Date.now() < h.injured;
function runSynergies(run) { return activeSynergies(run.party.map(id => { const h = heroById(id); return h && h.cls; }).filter(Boolean)); }
function runParty() { return S.run.party.map(heroById).filter(Boolean); }
function relicHooks(run = S.run) {
  const H = {};
  for (const k of (run ? run.relics : [])) { const R = RELICS[k]; if (!R) continue; for (const h in R.h) H[h] = (H[h] || 0) + R.h[h]; }
  for (const k of (run ? runSynergies(run) : [])) { const Y = SYNERGIES[k]; for (const h in Y.h) H[h] = (H[h] || 0) + Y.h[h]; }
  return H;
}
function runLevel(run, node) {
  const R = regionById(run.region);
  // chaque chapitre couvre 5 niveaux (I : 1–5, II : 5–10, III : 10–15…), du premier au dernier pas
  let l = R.lvl + Math.round((node ? node.c : 0) / Math.max(1, run.map.length - 1) * (R.lvl === 1 ? 4 : 5)) + run.threat * 2;
  if (run.region === "abime") l = 25 + Math.floor((run.floor - 1) * 1.2) + Math.floor((node ? node.c : 0) / 2);
  return l;
}
// butin plafonné au palier du chapitre : chapitre I → palier II (niveau 5) max, chapitre II → palier III, etc.
function lootTierCap(run = S && S.run) { if (!run) return 6; if (run.region === "abime") return 5; const i = REGIONS.findIndex(r => r.id === run.region); return i < 0 ? 5 : Math.min(5, i + 2); }
function availableNodes(run = S.run) {
  if (!run.pos) return run.map[0].map(n => n);
  const cur = run.map[run.pos.c][run.pos.i];
  if (run.pos.c >= run.map.length - 1) return [];
  return cur.links.map(j => run.map[run.pos.c + 1][j]);
}

// ── rencontres ──
const ALL_ELITES = Object.keys(MONSTERS).filter(k => MONSTERS[k].elite);
const ALL_BOSSES = Object.keys(MONSTERS).filter(k => MONSTERS[k].boss);
// facteurs pour ramener un monstre venu d'ailleurs à la force de la référence du chapitre
function monNorm(key, ref) {
  if (!ref || key === ref) return null; const M = MONSTERS[key], R = MONSTERS[ref], avg = m => (m.dmg[0] + m.dmg[1]) / 2;
  return { hp: R.hp / M.hp * .92, dmg: avg(R) / avg(M) * .95, prot: (R.prot || 0) - (M.prot || 0) };
}
// gardiens déjà vaincus (anciennes sauvegardes : ceux des chapitres terminés)
function beatenBosses() { const b = S.beaten = S.beaten || {}; for (const r of REGIONS) if (S.prog[r.id] && S.prog[r.id].clears) b[r.boss] = 1; return Object.keys(b).filter(k => MONSTERS[k] && MONSTERS[k].boss); }
// la rencontre est tirée une seule fois par salle : quitter puis reprendre redonne les mêmes ennemis (et le même gardien)
function genEncounter(run, node, rng = RNG) {
  if (node.enc) return node.enc.map(e => Object.assign({}, e));
  const enc = genEncounter0(run, node, rng); node.enc = enc.map(e => Object.assign({}, e)); return enc;
}
function genEncounter0(run, node, rng = RNG) {
  const R = regionById(run.region), lvl = runLevel(run, node);
  const pool = R.pool.slice(), out = [];
  const pickFor = rank => { const ok = pool.filter(k => MONSTERS[k].rk.includes(rank)); return rng.pick(ok.length ? ok : pool); };
  if (node.type === "boss") {
    // gardien tiré parmi tous les gardiens du jeu (jamais deux fois de suite le même ici), ramené à la force du gardien du chapitre
    const ref = run.region === "abime" ? R.bosses[(run.floor - 1) % R.bosses.length] : R.boss2 && S.prog[R.id] && S.prog[R.id].clears && rng.chance(.5) ? R.boss2 : R.boss;
    // 1re fois : le gardien de l'histoire ; ensuite, au hasard parmi les gardiens déjà vaincus (jamais deux fois de suite le même)
    const last = (S.lastBoss || (S.lastBoss = {}))[R.id], beaten = beatenBosses(), firstTime = run.region !== "abime" && !(S.prog[R.id] && S.prog[R.id].clears);
    const cand = beaten.filter(k => k !== last), pool = cand.length ? cand : beaten.length ? beaten : [ref];
    const bk = firstTime ? R.boss : run.region === "abime" && run.floor % 5 === 0 && S.season && S.season.boss ? S.season.boss : rng.pick(pool); S.lastBoss[R.id] = bk; // l'Abîme : gardien de la saison tous les 5 étages
    out.push({ key: pickFor(1), lvl });
    out.push({ key: bk, lvl: lvl + 1, f: monNorm(bk, ref) });
    if (run.region === "abime" || R.lvl >= 9) out.push({ key: pickFor(4), lvl });
    return out;
  }
  let n = node.c === 0 ? 2 + (rng.chance(.4) ? 1 : 0) : rng.chance(.55) ? 3 : 4;
  if (R.lvl >= 9 && node.c >= 3) n = Math.max(n, 3);
  let ranks = 0;
  if (node.type === "elite") { // élite tirée parmi toutes les élites, adaptée au niveau du chapitre
    const ref = rng.pick(R.elite), last = (S.lastElite || (S.lastElite = {}))[R.id], cand = ALL_ELITES.filter(k => k !== last);
    const ek = rng.pick(cand); S.lastElite[R.id] = ek;
    out.push({ key: ek, lvl: lvl + 1, f: monNorm(ek, ref) }); ranks += MONSTERS[ek].sz || 1; n = Math.min(n, 3); }
  while (out.length < n && ranks < 4) { const k = pickFor(ranks + 1); out.push({ key: k, lvl }); ranks += MONSTERS[k].sz || 1; }
  // les monstres de mêlée devant
  out.sort((a, b) => Math.min(...MONSTERS[a.key].rk) - Math.min(...MONSTERS[b.key].rk));
  return out;
}

// ── récompenses ──
function rewardFor(run, node, rng = RNG) {
  const lvl = runLevel(run, node), rh = relicHooks(run), luck = run.light < 30 ? .05 : 0;
  const goldM = 1 + (rh.gold || 0) + run.party.map(heroById).filter(Boolean).reduce((a, h) => a + heroPassives(h).filter(p => p.k === "gold").reduce((b, p) => b + p.v, 0), 0) + (run.pet && PETS[run.pet].gold ? PETS[run.pet].gold : 0) + (run.daily ? .25 : 0) + run.oaths.length * .15 + run.threat * .3;
  const R = { gold: 0, xp: 0, loot: [], relic: null, mats: { fer: 0, essence: 0, cendre: 0 }, shards: 0, petXp: 0 };
  const t = node.type;
  if (t === "combat") { R.gold = (14 + lvl * 4.5) * (0.85 + rng() * .3); R.xp = 26 + lvl * 7; R.mats.fer = rng.chance(.6) ? 1 : 0; if (rng.chance(.22 + luck)) R.loot.push(lootGear(lvl, luck)); }
  if (t === "elite") { R.gold = (34 + lvl * 9) * (0.9 + rng() * .3); R.xp = 50 + lvl * 12; R.mats.fer = 2; R.mats.essence = 1; R.loot.push(lootGear(lvl + 2, .08 + luck)); if (rng.chance(.5)) R.relic = randRelic(run, rng, 1); }
  if (t === "elite" && run.week && weekRule() && weekRule().eliteLoot) R.loot.push(lootGear(lvl + 2, .1));
  if (t === "treasure") { R.gold = (30 + lvl * 7) * (0.8 + rng() * .5); R.loot.push(lootGear(lvl + 1, .05 + luck)); R.mats.fer = 1; if (rng.chance(.4)) R.relic = randRelic(run, rng); }
  if (t === "boss") {
    const first = run.region !== "abime" && !(S.prog[run.region] && S.prog[run.region].clears);
    R.gold = (120 + lvl * 22) * (first ? 1.5 : 1); R.xp = 120 + lvl * 22; R.mats.fer = 3; R.mats.essence = 2 + Math.floor(lvl / 8); R.mats.cendre = lvl >= 13 ? 1 : 0;
    R.loot.push(lootGear(lvl + 3, .15)); if (rng.chance(.5)) R.loot.push(lootGear(lvl + 2, .1));
    R.shards = first ? 3 : 1 + (run.region === "abime" && run.floor % 3 === 0 ? 1 : 0) + Math.floor(run.oaths.length / 3); R.relic = randRelic(run, rng, 2);
  }
  R.gold = Math.round(R.gold * goldM * diffOf().gold); R.xp = Math.round(R.xp * (1 + run.threat * .2) * diffOf().xp); R.petXp = Math.round(R.xp * .8);
  R.tome = t === "boss" ? 1 : t === "elite" ? (rng.chance(.22) ? 1 : 0) : t === "treasure" ? (rng.chance(.14) ? 1 : 0) : 0; // tome d'expérience
  return R;
}
function randRelic(run, rng = RNG, minR = 0) {
  const pool = Object.keys(RELICS).filter(k => !run.relics.includes(k) && RELICS[k].r >= Math.min(minR, 2) - (minR === 2 ? 1 : 0));
  return pool.length ? rng.pick(pool) : null;
}
function grantReward(run, R) {
  run.gold += R.gold; for (const m in R.mats) run.mats[m] += R.mats[m]; run.shards += R.shards;
  for (const it of R.loot) run.loot.push(it);
  if (R.relic) run.relics.push(R.relic);
  if (R.tome) S.tomes = (S.tomes || 0) + R.tome;
  const ups = [];
  if (R.xp) for (const h of runParty()) { if (run.fallen.includes(h.id)) continue; const u = giveXp(h, R.xp); if (u) ups.push(h); }
  if (R.petXp && run.pet) givePetXp(run.pet, R.petXp);
  return ups;
}
function giveXp(h, v) {
  if (h.lvl >= MAX_LVL) return false;
  const mul = 1 + heroPassives(h).filter(p => p.k === "xp").reduce((a, p) => a + p.v, 0);
  h.xp += Math.round(v * mul); let up = false;
  if (S && S.run && S.run.xpGain && S.run.party.includes(h.id)) S.run.xpGain[h.id] = (S.run.xpGain[h.id] || 0) + Math.round(v * mul);
  while (h.lvl < MAX_LVL && h.xp >= xpNeed(h.lvl)) { h.xp -= xpNeed(h.lvl); h.lvl++; up = true; if (h.lvl === APEX_LVL && h.evo) S.stats.apex++; S.stats.maxlvl = Math.max(S.stats.maxlvl, h.lvl >= MAX_LVL ? 1 : 0); }
  if (h.lvl >= MAX_LVL) h.xp = 0;
  return up;
}
function givePetXp(id, v) {
  if (!S.pets.lvl[id]) S.pets.lvl[id] = 1;
  S.pets.xp[id] = (S.pets.xp[id] || 0) + v;
  let up = false; while (S.pets.lvl[id] < 20 && S.pets.xp[id] >= petXpNeed(S.pets.lvl[id])) { S.pets.xp[id] -= petXpNeed(S.pets.lvl[id]); S.pets.lvl[id]++; up = true; }
  return up;
}

// équiper un objet du butin pendant l'expédition (l'ancien rejoint le butin ; annulé en cas de déroute)
function runEquipTargets(it, run = S.run) { if (!run || !it) return []; return runParty().filter(h => !run.fallen.includes(h.id) && canEquip(h, it) && !(it.kind === "tr" && [h.gear.tr1, h.gear.tr2].some(x => x && x.key === it.key))); }
function runEquip(h, it, run = S.run, want) {
  const i = run.loot.indexOf(it); if (i < 0 || !runEquipTargets(it, run).includes(h)) return false;
  const slot = it.kind === "wpn" ? "wpn" : it.kind === "arm" ? "arm" : want === "tr1" || want === "tr2" ? want : !h.gear.tr1 ? "tr1" : !h.gear.tr2 ? "tr2" : "tr1";
  const before = heroStats(h, relicHooks(run)).hp;
  run.loot.splice(i, 1); const old = h.gear[slot]; h.gear[slot] = it; if (old) run.loot.push(old);
  (run.swaps = run.swaps || []).push({ hid: h.id, slot, old: old ? old.id : null, nu: it.id });
  const after = heroStats(h, relicHooks(run)).hp; if (h.hp != null) h.hp = clamp(Math.round(h.hp * after / before), 1, after);
  if (it.tier >= 5) S.stats.tier5 = 1;
  return true;
}
// ── fin d'expédition ──
function endRun(outcome) {
  const run = S.run; if (!run) return null;
  const R = regionById(run.region);
  const res = { outcome, gold: run.gold, loot: run.loot.slice(), mats: Object.assign({}, run.mats), shards: run.shards, region: run.region, floor: run.floor, story: null, unlocks: [] };
  // bilan de l'expédition
  const L = run.sum || { dmg: {}, heal: {}, taken: {}, kills: {}, best: null, foes: [], crits: 0 };
  res.sum = { heroes: run.party.map(id => { const h = heroById(id); return h && { id, name: h.name, cls: h.cls, lvl: h.lvl, fallen: run.fallen.includes(id), dmg: L.dmg[id] || 0, heal: L.heal[id] || 0, taken: L.taken[id] || 0, kills: L.kills[id] || 0, xp: (run.xpGain || {})[id] || 0 }; }).filter(Boolean),
    best: L.best, foes: L.foes, crits: L.crits, kills: run.kills, combats: run.combats, rooms: run.map.flat().filter(n => n.visited).length, relics: run.relics.slice(), light: Math.round(run.light), mins: Math.max(1, Math.round((Date.now() - run.startedAt) / 60000)) };
  if (outcome === "wipe") { res.gold = Math.round(run.gold * .5); res.loot = []; res.shards = 0;
    for (const w of (run.swaps || []).slice().reverse()) { const h = heroById(w.hid); if (!h || !h.gear[w.slot] || h.gear[w.slot].id !== w.nu) continue; h.gear[w.slot] = w.old ? run.loot.find(x => x.id === w.old) || h.gear[w.slot] : null; } }
  const before = regionsCleared();
  if (outcome === "victory" && run.region !== "abime" && !run.rush) {
    const p = S.prog[run.region] = S.prog[run.region] || { clears: 0, best: 0 };
    if (!p.clears) res.story = STORY[run.region];
    const tm = threatMax(run.region); if (p.clears) p.threat = Math.max(p.threat || 0, run.threat || 0); else p.threat = 0;
    { const bn = run.map[run.map.length - 1][0], bm = bn && bn.enc && bn.enc.find(e => MONSTERS[e.key].boss); (S.beaten = S.beaten || {})[bm ? bm.key : regionById(run.region).boss] = 1; }
    p.clears++; if (threatMax(run.region) > tm) res.threatUp = { region: run.region, t: threatMax(run.region) };
    S.stats["boss_" + run.region] = (S.stats["boss_" + run.region] || 0) + 1;
  }
  if (run.region === "abime") { const depth = run.floor - (outcome === "victory" ? 0 : 1); S.abyss.best = Math.max(S.abyss.best, depth); S.stats.abyss = Math.max(S.stats.abyss, S.abyss.best); if (outcome === "victory" || outcome === "retreat") S.stats.oath = Math.max(S.stats.oath, run.oaths.length); }
  const after = regionsCleared();
  if (after > before) {
    for (const c of CLASS_IDS) if (CLASSES[c].unlock === after) res.unlocks.push({ k: "class", id: c });
    for (const p of PET_IDS) if (PETS[p].unlock === after) res.unlocks.push({ k: "pet", id: p });
    const nx = REGIONS[after]; if (nx) res.unlocks.push({ k: "region", id: nx.id }); if (after === 1) res.unlocks.push({ k: "region", id: "abime" });
  }
  S.gold += res.gold; for (const m in res.mats) S.mats[m] += res.mats[m]; S.shards += res.shards;
  for (const it of res.loot) { S.inv.push(it); if (it.rar >= 4) S.stats.legend++; }
  // retour au Bastion : soins, blessures
  for (const h of S.heroes) {
    if (run.party.includes(h.id)) {
      h.runs++;
      if (run.fallen.includes(h.id)) { if (S.opts.hardcore) h.dead = 1; else h.injured = Date.now() + injuryTime(h); }
    }
    h.hp = null;
  }
  if (S.opts.hardcore) { const dead = S.heroes.filter(h => h.dead); S.stats.deaths += dead.length; S.graves = (S.graves || []).concat(dead.map(h => ({ name: h.name, cls: h.cls, lvl: h.lvl, at: Date.now() }))); S.heroes = S.heroes.filter(h => !h.dead); }
  if (run.flawless && outcome === "victory") S.stats.flawless++;
  if (run.daily && outcome === "victory") { S.daily.done = 1; S.stats.daily++; }
  if (run.week && outcome === "victory" && S.week && !S.week.done) { const W = weekReward(); S.week.done = 1; res.week = W; S.gold += W.gold; S.shards += W.shards; S.mats.essence += W.essence; S.stats.weeks = (S.stats.weeks || 0) + 1; }
  extrasEndRun(run, outcome, res);
  S.stats.goldMax = Math.max(S.stats.goldMax, S.gold);
  S.run = null;
  refreshRecruits();
  checkAchievements();
  return res;
}

// ── Bastion : recrues, fonderie, quotidien ──
function recruitLevel() { const best = Math.max(1, ...REGIONS.filter(r => S.prog[r.id] && S.prog[r.id].clears).map(r => r.lvl + 3)); return Math.max(1, Math.round(best * (.35 + .12 * S.bld.taverne))); }
function refreshRecruits(force) {
  const n = 2 + S.bld.taverne, lvl = recruitLevel();
  const cls = CLASS_IDS.filter(classUnlocked);
  S.recruits = [];
  for (let i = 0; i < n; i++) { const h = makeHero(pick(cls), { lvl: Math.max(1, lvl - rint(0, 2)) }); if (h.lvl >= 6 && chance(.25 + S.bld.taverne * .05)) { const ev = Object.keys(CLASSES[h.cls].evos); h.evo = pick(ev); h.skills = heroSkillPool(h).slice(0, 2).concat(Object.keys(CLASSES[h.cls].evos[h.evo].skills)); for (const k of heroSkillPool(h)) h.skr[k] = h.skr[k] || 1; } const t = clamp(Math.floor(h.lvl / 4.5) + 1, 1, 5); h.gear.wpn = makeGear("wpn", h.cls, t, 0); h.gear.arm = makeGear("arm", h.cls, t, 0); S.recruits.push(h); }
}
const recruitCost = h => Math.round(60 + h.lvl * 45 + (h.evo ? 150 : 0));
function idleBank() { const hrs = Math.min(fonderieCap(), (Date.now() - (S.lastSeen || Date.now())) / 3.6e6); return Math.round(S.bank + hrs * fonderieRate()); }
function collectBank() { const v = idleBank(); S.gold += v; S.bank = 0; S.lastSeen = Date.now(); return v; }
function bankTick() { S.bank = idleBank(); S.lastSeen = Date.now(); }
// défis du jour
const CONTRACT_T = [
  { k: "kills", n: "Tuer {v} ennemis", v: [25, 40], gold: 150 }, { k: "impie", n: "Tuer {v} impies", v: [10, 20], gold: 180 }, { k: "elites", n: "Vaincre {v} élites", v: [1, 3], gold: 220 },
  { k: "crits", n: "Porter {v} coups critiques", v: [15, 30], gold: 150 }, { k: "ults", n: "Lancer {v} ultimes", v: [3, 6], gold: 170 }, { k: "runs", n: "Terminer {v} expédition", v: [1, 1], gold: 200 }, { k: "rooms", n: "Explorer {v} salles", v: [8, 14], gold: 160 },
];
function dailyCheck() {
  const k = dayKey();
  if (S.daily.key === k) return false;
  const rng = mkRng(k * 7 + 13);
  S.daily = { key: k, done: 0, contracts: rng.shuffle(CONTRACT_T.slice()).slice(0, 3).map(c => ({ k: c.k, n: c.n.replace("{v}", "§"), goal: rng.int(c.v[0], c.v[1]), p: 0, gold: c.gold, claimed: 0 })), seed: k };
  for (const c of S.daily.contracts) c.n = c.n.replace("§", c.goal);
  return true;
}
function contractProgress(k, v = 1) { if (!S.daily || !S.daily.contracts) return; for (const c of S.daily.contracts) if (c.k === k && !c.claimed) c.p = Math.min(c.goal, c.p + v); }
// ── défi de la semaine : une règle spéciale, une expédition, une grosse récompense ──
const WEEK_RULES = [
  { k: "sans_soin", n: "Sans soigneur", d: "Aucun soigneur dans le groupe. Les potions sont doublées.", noRole: "soin", potions: 2 },
  { k: "penombre", n: "Pénombre", d: "La lueur commence à 50 et baisse deux fois plus vite.", light: 50, oaths: ["nuit"] },
  { k: "jeune", n: "Le grand jeûne", d: "Aucune potion. Les camps soignent deux fois plus.", potions: 0, campX: 2 },
  { k: "carnage", n: "Carnage", d: "Les ennemis frappent +25 % plus fort ; vos héros aussi (+25 % de dégâts).", oaths: ["sang"], heroDmg: .25 },
  { k: "elite", n: "La traque", d: "La carte regorge d'élites. Chaque élite rapporte un objet de plus.", oaths: ["elite"], eliteLoot: 1 },
  { k: "trio", n: "Les trois", d: "Trois héros seulement. Ils gagnent +20 % de PV.", maxParty: 3, heroHp: .2 },
  { k: "fer", n: "Murailles de fer", d: "Les ennemis ont +20 % de PV et +10 % de protection.", oaths: ["fer", "pierre"] },
  { k: "silence", n: "Le silence", d: "Les ultimes se chargent 30 % moins vite, mais la résolution commence à 70.", oaths: ["silence"], morale: 20 },
];
const weekKey = (d = new Date()) => { const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const day = (t.getUTCDay() + 6) % 7; t.setUTCDate(t.getUTCDate() - day + 3); const y = t.getUTCFullYear(), w1 = new Date(Date.UTC(y, 0, 4)); return y * 100 + 1 + Math.round(((t - w1) / 864e5 - 3 + ((w1.getUTCDay() + 6) % 7)) / 7); };
function weekCheck() {
  const k = weekKey(); if (S.week && S.week.key === k) return false;
  const rng = mkRng(k * 17 + 5), open = REGIONS.filter(r => regionUnlocked(r.id));
  S.week = { key: k, done: 0, rule: rng.pick(WEEK_RULES).k, region: rng.pick(open).id, seed: k * 53 + 11 };
  return true;
}
const weekRule = () => S.week && WEEK_RULES.find(r => r.k === S.week.rule);
function weekReward() { const l = regionById(S.week.region).lvl || 1; return { gold: 250 + l * 25, shards: 2, essence: 3 }; }
function weekPartyOk(ids) {
  const W = weekRule(); if (!W) return "";
  if (W.maxParty && ids.length > W.maxParty) return `${W.maxParty} héros au maximum cette semaine.`;
  if (W.noRole && ids.some(id => CLASSES[heroById(id).cls].role === W.noRole)) return "Pas de soigneur cette semaine.";
  return "";
}
function dailyRun() {
  const rng = mkRng(S.daily.key * 31 + 7);
  const open = REGIONS.filter(r => regionUnlocked(r.id));
  const R = rng.pick(open);
  const relics = rng.shuffle(Object.keys(RELICS).slice()).slice(0, 2);
  return { region: R.id, relics, seed: S.daily.key * 101 + 3 };
}
function checkAchievements() {
  const out = [];
  S.stats.roster = Math.max(S.stats.roster, S.heroes.length);
  S.stats.classes = Math.max(S.stats.classes, Object.keys(S.seen.classes).length);
  S.stats.pets = Math.max(S.stats.pets, S.pets.owned.length);
  for (const a of ACHIEVEMENTS) if (!S.ach[a.id] && (S.stats[a.k] || 0) >= a.v) { S.ach[a.id] = Date.now(); out.push(a); if (a.gold) S.gold += a.gold; if (a.shards) S.shards += a.shards; }
  return out;
}
