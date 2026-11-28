/* ═══════════ Améliorations du 7 nov. (logique) ═══════════
   Panoplies par rôle, spécialisations d'objet, codex et fusion de bibelots, « Tout améliorer », rang de compagnie,
   gardien-raid, mutations de l'Abîme, expéditions de panoplie, arène des échos. */

// ── 12 · quatre panoplies de plus, une par rôle ──
Object.assign(SETS, {
  heraut: { n: "Panoplie du Héraut", c: "#e8b0ff", b2: { d: "+15 % aux renforcements", pas: [{ k: "buffPow", v: .15 }] }, b3: { d: "+20 % de résolution, ultime 15 % plus vite", pas: [{ k: "moralePow", v: .2 }, { k: "ultGain", v: .15 }] }, b4: { d: "+30 % aux renforcements, +20 % d'altération, +2 vitesse", pas: [{ k: "buffPow", v: .3 }, { k: "debuffPow", v: .2 }, { k: "stat", s: "spd", v: 2 }] } },
  misericorde: { n: "Panoplie de la Miséricorde", c: "#9ae8c8", b2: { d: "+12 % de soins", pas: [{ k: "stat", s: "healPow", v: .12 }] }, b3: { d: "+25 % de régénération, +25 % de boucliers", pas: [{ k: "regenPow", v: .25 }, { k: "shieldPow", v: .25 }] }, b4: { d: "+25 % de soins, +20 % de soins reçus, +15 résistance", pas: [{ k: "stat", s: "healPow", v: .25 }, { k: "healTaken", v: .2 }, { k: "stat", s: "res", v: 15 }] } },
  rempart: { n: "Panoplie du Rempart", c: "#b8a888", b2: { d: "+8 % de protection", pas: [{ k: "stat", s: "prot", v: .08 }] }, b3: { d: "+15 % de PV, renvoie 15 % des dégâts", pas: [{ k: "stat", s: "hp", v: .15 }, { k: "thornsP", v: .15 }] }, b4: { d: "+10 % de protection, +15 % de PV, survit une fois à un coup fatal", pas: [{ k: "stat", s: "prot", v: .1 }, { k: "stat", s: "hp", v: .15 }, { k: "cheatDeath", v: 1 }] } },
  ombrelame: { n: "Panoplie de l'Ombre-Lame", c: "#8a8aff", b2: { d: "+6 % de critique", pas: [{ k: "stat", s: "crit", v: 6 }] }, b3: { d: "critiques +25 %, +25 % sur les blessés", pas: [{ k: "critDmg", v: .25 }, { k: "execute", v: .25 }] }, b4: { d: "+8 esquive, +2 vitesse, les critiques font saigner", pas: [{ k: "stat", s: "dodge", v: 8 }, { k: "stat", s: "spd", v: 2 }, { k: "critBleed", v: .5 }] } },
});

// ── 17 · spécialisation d'un objet amélioré à +15 : une voie à choisir, définitive ──
const SPEC_UP = 15;
const ITEM_SPECS = {
  wpn: { tranchant: { n: "Tranchante", d: "+8 % de critique, critiques +20 %", pas: [{ k: "stat", s: "crit", v: 8 }, { k: "critDmg", v: .2 }] }, lourde: { n: "Lourde", d: "+10 % de dégâts, +20 % sur les blessés", pas: [{ k: "stat", s: "dmg", v: .1 }, { k: "execute", v: .2 }] } },
  arm: { bastion: { n: "Bastion", d: "+8 % de protection, +10 % de PV", pas: [{ k: "stat", s: "prot", v: .08 }, { k: "stat", s: "hp", v: .1 }] }, souple: { n: "Souple", d: "+8 esquive, +2 vitesse", pas: [{ k: "stat", s: "dodge", v: 8 }, { k: "stat", s: "spd", v: 2 }] } },
};
function itemSpecOk(it) { return it && (it.kind === "wpn" || it.kind === "arm") && (it.up || 0) >= SPEC_UP && !it.spec; }
function itemSpec(it, k) { if (!itemSpecOk(it) || !ITEM_SPECS[it.kind][k]) return false; it.spec = k; return true; }
PAS_HOOKS.push(h => { const out = []; for (const s of ["wpn", "arm"]) { const it = h.gear[s]; if (it && it.spec && ITEM_SPECS[s][it.spec]) out.push(...ITEM_SPECS[s][it.spec].pas); } return out; });

// ── 18 · codex des bibelots : chaque bibelot trouvé est noté, +1 % de dégâts et de PV tous les 10 ──
function trSeen() { S.seen = S.seen || {}; return S.seen.tr || (S.seen.tr = {}); }
function trScan() { if (!S || !S.inv) return 0; const T = trSeen(); let n = 0; const all = S.inv.concat(...S.heroes.map(h => [h.gear.tr1, h.gear.tr2])); if (S.run && S.run.loot) all.push(...S.run.loot); for (const it of all) if (it && it.kind === "tr" && TRINKETS[it.key] && !TRINKETS[it.key].uniq && !T[it.key]) { T[it.key] = 1; n++; } return n; }
const trCodexTotal = () => Object.keys(TRINKETS).filter(k => !TRINKETS[k].uniq).length;
const trCodexBonus = () => Math.floor(Object.keys(trSeen()).filter(k => TRINKETS[k]).length / 10);
PAS_HOOKS.push(() => { if (!S || !S.seen) return []; const b = trCodexBonus(); return b ? [{ k: "stat", s: "dmg", v: .01 * b }, { k: "stat", s: "hp", v: .01 * b }] : []; });

// ── 16 · fusion de bibelots : trois de la même qualité → un d'une qualité au-dessus ──
function trFuseCands(rar) { return S.inv.filter(it => it.kind === "tr" && it.rar === rar && !it.lock && TRINKETS[it.key] && !TRINKETS[it.key].uniq); }
function trFuse(rar) { const L = trFuseCands(rar); if (L.length < 3 || rar >= RARITY.length - 1) return null; for (const it of L.slice(0, 3)) S.inv.splice(S.inv.indexOf(it), 1); const nu = makeGear("tr", null, 1, rar + 1); S.inv.push(nu); trScan(); return nu; }

// ── 7 · « Tout améliorer » : l'équipement porté, du moins cher au plus cher, dans la limite d'un budget ──
function upgradeAllWorn(budget) {
  const items = []; for (const h of S.heroes) for (const s of ["wpn", "arm"]) if (h.gear[s]) items.push(h.gear[s]);
  let spent = 0, n = 0, guard = 0;
  while (guard++ < 2000) {
    const c = items.filter(it => it.up < upCap()).map(it => ({ it, c: upCost(it) })).filter(x => canPay(x.c) && spent + x.c.gold <= budget).sort((a, b) => a.c.gold - b.c.gold)[0];
    if (!c) break; const r = upgradeItem(c.it); if (!r || r.err) break; spent += c.c.gold; n++;
  }
  return { n, spent };
}

// ── 19 · rang de compagnie : gardiens, succès, niveaux, expéditions → récompenses cosmétiques ──
function compPts() { const st = S.stats || {}; return Object.keys(S.beaten || {}).length * 25 + Object.keys(S.ach || {}).length * 15 + S.heroes.reduce((a, h) => a + h.lvl, 0) * 2 + (st.runs || 0) * 3 + (S.cycle || 0) * 200; }
const compRank = () => Math.floor(Math.sqrt(compPts() / 40));
const compNext = () => { const r = compRank() + 1; return r * r * 40; };
const COSM = {
  banner: [[0, "Cendre", "#8a7a6a"], [2, "Sang", "#c83a2a"], [4, "Or", "#e8c878"], [6, "Azur", "#6a9aff"], [8, "Émeraude", "#4ac87a"], [10, "Améthyste", "#b46aff"], [13, "Aube", "#ffe8a0"], [16, "Abîme", "#3a2a6a"]],
  frame: [[0, "Fer", "#5a5048"], [3, "Bronze", "#b0783a"], [5, "Argent", "#c8d0d8"], [7, "Or", "#ffd27a"], [10, "Rubis", "#ff4a5a"], [14, "Céleste", "#9ae8ff"]],
  tint: [[0, "Aucune", ""], [4, "Braises", "#ff6a2a"], [6, "Lune", "#6a8aff"], [9, "Sacre", "#ffe0a0"], [12, "Spectre", "#9aff9a"], [15, "Pourpre", "#c83aff"]],
};
function cosmOf(kind) { const C = S.cosm || {}, L = COSM[kind], i = Math.max(0, Math.min(L.length - 1, C[kind] || 0)); return L[i][0] <= compRank() ? L[i] : L[0]; }

// ── 13 · gardien-raid : un colosse dont les PV restent entamés d'une expédition à l'autre (10 tours par assaut) ──
const RAID_HP = 14, RAID_ROUNDS = 10;
function raidOpen() { return regionsCleared() >= 2; }
function raidState() {
  if (!S.raid || !MONSTERS[S.raid.key]) { const pool = beatenBosses().filter(k => MONSTERS[k] && !MONSTERS[k].secret); if (!pool.length) return null; S.raid = { key: pick(pool), frac: 1, n: (S.raid && S.raid.n) || 0, tries: 0 }; }
  return S.raid;
}
function raidWin() { const n = (S.raid ? S.raid.n : 0) + 1; S.raid = null; raidState(); if (S.raid) S.raid.n = n; }

// ── 14 · mutations de l'Abîme : une règle risquée contre une meilleure récompense, choisie au départ ──
const MUTATIONS = {
  pierre: { n: "Chair de pierre", d: "Ennemis +30 % PV", r: "Butin : +1 qualité", ehp: .3, rarUp: 1 },
  lame: { n: "Lames affûtées", d: "Ennemis +20 % dégâts", r: "Or ×1,6", edmg: .2, gold: .6 },
  sec: { n: "Gourdes vides", d: "Aucune potion", r: "Expérience ×1,5", nopot: 1, xp: .5 },
  nuit: { n: "Lueur mourante", d: "Lueur −40 au départ", r: "Gardien : +3 éclats", light: -40, shards: 3 },
  fureur: { n: "Fureur", d: "Ennemis +2 vitesse", r: "Élites et gardien : un objet de plus", espd: 2, extra: 1 },
  tari: { n: "Sources taries", d: "Soins des héros −25 %", r: "Or ×1,4, expérience ×1,3", heal: -.25, gold: .4, xp: .3 },
};
function mutChoices(n = 3) { return RNG.shuffle(Object.keys(MUTATIONS).slice()).slice(0, n); }

// ── 11 · expéditions de panoplie : la panoplie choisie tombe sur le gardien (garanti) et les élites (30 %) ──
function setPieceFor(run, key) {
  const hs = run.party.map(heroById).filter(Boolean), h = pick(hs), kind = pick(["wpn", "arm", "tr", "tr"]), rar = Math.max(4, rollRarity(.3, 4));
  let tier = 1; for (let t = 1; t <= TIER_MAX; t++) if (h.lvl >= TIER_LVL[t]) tier = t;
  if (tier >= 6 && kind === "arm" && !h.evo) tier = 5;
  const it = kind === "tr" ? makeGear("tr", null, 1, rar) : makeGear(kind, h.cls, tier, rar, null, kind === "arm" && tier >= 6 ? h.evo : null);
  it.set = key; return it;
}

// ── 15 · arène des échos : les héros tombés reviennent en ombres ──
function echoGraves() { return (S.graves || []).filter(g => g && g.cls && CLASSES[g.cls]); }
function echoEncounter(lvl) {
  const G = RNG.shuffle(echoGraves().slice()).slice(0, 4), base = MONSTERS.garde_spectral || MONSTERS.spectre, out = [];
  G.forEach((g, i) => { const role = CLASSES[g.cls].role, k = "echo_" + i, B = JSON.parse(JSON.stringify(base));
    const f = role === "tank" ? { hp: 1.5, dmg: .8, prot: .25, rk: [1, 2] } : role === "soin" ? { hp: .9, dmg: .7, prot: .05, rk: [3, 4] } : role === "soutien" ? { hp: 1, dmg: .9, prot: .1, rk: [2, 3] } : { hp: 1, dmg: 1.25, prot: .1, rk: [1, 2, 3, 4] };
    MONSTERS[k] = Object.assign(B, { n: "Écho de " + String(g.name || "l'oublié").split(" ")[0], hp: Math.round((base.hp || 60) * f.hp), dmg: (base.dmg || [6, 10]).map(x => Math.round(x * f.dmg)), prot: f.prot, rk: f.rk, tags: ["impie", "spectre"], echo: 1 });
    out.push({ key: k, lvl: lvl + 1 }); });
  return out;
}

// ── effets en combat : raid, mutation, panoplie ──
{ const bf2 = battleFor; battleFor = function (run, node, enc) { if (run && run.echoDefs) Object.assign(MONSTERS, run.echoDefs); const B = bf2.apply(this, arguments); if (!B || !run) return B;
    const M = run.mut && MUTATIONS[run.mut];
    if (M) for (const e of B.enemies) { if (M.ehp) { e.hpMax = Math.round(e.hpMax * (1 + M.ehp)); e.hp = Math.round(e.hp * (1 + M.ehp)); } if (M.edmg) { e.dmgLo = Math.round(e.dmgLo * (1 + M.edmg)); e.dmgHi = Math.round(e.dmgHi * (1 + M.edmg)); } if (M.espd) e.spd += M.espd; }
    if (M && M.heal) for (const h of B.heroes) h.healPow = (h.healPow || 1) * (1 + M.heal);
    if (run.setRun) for (const e of B.enemies) { e.hpMax = Math.round(e.hpMax * 1.15); e.hp = Math.round(e.hp * 1.15); }
    if (run.raid && S.raid) { const e = B.enemies.find(x => x.key === S.raid.key) || B.enemies[0]; if (e) { e.hpMax = Math.round(e.hpMax * RAID_HP); e.hp = Math.max(1, Math.round(e.hpMax * clamp(S.raid.frac, .01, 1))); e.raid = 1; e.boss = 1; B.raid = 1; } }
    return B; }; }
{ const rf3 = rewardFor; rewardFor = function (run, node, rng = RNG) { const R = rf3.apply(this, arguments); if (!run || !node) return R;
    const M = run.mut && MUTATIONS[run.mut];
    if (M) { if (M.gold) R.gold = Math.round(R.gold * (1 + M.gold)); if (M.xp) R.xp = Math.round(R.xp * (1 + M.xp)); if (M.rarUp) for (const it of R.loot || []) if (it.rar < RARITY.length - 1 && !it.uniq) it.rar++;
      if (M.shards && node.type === "boss") R.shards = (R.shards || 0) + M.shards;
      if (M.extra && (node.type === "boss" || node.type === "elite")) R.loot.push(lootGear(Math.max(...run.party.map(id => (heroById(id) || { lvl: 1 }).lvl)) + 2, node.type === "boss" ? .3 : .15, null, 1)); }
    if (run.setRun && SETS[run.setRun] && (node.type === "boss" || (node.type === "elite" && chance(.3)))) R.loot.push(setPieceFor(run, run.setRun));
    if (run.raidWin) { run.raidWin = 0; const hs = run.party.map(heroById).filter(Boolean), h = pick(hs); let tier = 1; for (let t = 1; t <= TIER_MAX; t++) if (h.lvl >= TIER_LVL[t]) tier = t;
      R.loot.push(makeGear("wpn", h.cls, tier, Math.max(5, rollRarity(.4, 5)))); R.shards = (R.shards || 0) + 10; R.gold = (R.gold || 0) + 2500 + 120 * h.lvl; }
    if (run.arena && node.type === "elite") { R.shards = (R.shards || 0) + 2; R.gold = (R.gold || 0) + 300 + 30 * Math.max(...run.party.map(id => (heroById(id) || { lvl: 1 }).lvl)); }
    return R; }; }
