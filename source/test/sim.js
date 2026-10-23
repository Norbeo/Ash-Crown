// Bots : simulent des carrières complètes pour trouver les bugs et équilibrer.  node test/sim.js [carrières] [expéditions] [graine]
const fs = require("fs"), path = require("path");
const SRC = ["00_util", "01_classes", "02_world", "03_items", "03z_events", "04_state", "05_combat", "06_run", "07_nodes", "08_meta"];
const code = SRC.map(f => fs.readFileSync(path.join(__dirname, "../src/" + f + ".js"), "utf8")).join("\n");
const N = +process.argv[2] || 12, EXP = +process.argv[3] || 40, SEED = +process.argv[4] || 1;
const VERB = process.argv.includes("-v");
const DIFF = (process.argv.find(a => a.startsWith("--diff=")) || "--diff=normal").slice(7);
const out = new Function("N", "EXP", "SEED", "VERB", "DIFF", code + `
RNG = mkRng(SEED);
const T = { runs: 0, wins: 0, wipes: 0, retreats: 0, battles: 0, blost: 0, rounds: 0, falls: 0, errors: [], bossTry: {}, bossWin: {}, regionAt: {}, lvlAt: {}, abyss: [], gold: [], perClassFall: {}, perClassUse: {}, stalls: 0, potions: 0, nodeDeaths: {}, ft: {}, fw: {} };
function partyFor() {
  const ok = S.heroes.slice().sort((a, b) => (b.lvl - (isInjured(b) ? 3 : 0)) - (a.lvl - (isInjured(a) ? 3 : 0)));
  const roles = { tank: 0, soin: 0 }; const pick4 = [];
  for (const r of ["tank", "soin"]) { const h = ok.find(x => CLASSES[x.cls].role === r && !pick4.includes(x)); if (h) pick4.push(h); }
  for (const h of ok) if (pick4.length < 4 && !pick4.includes(h)) pick4.push(h);
  return pick4.sort((a, b) => CLASSES[a.cls].rk[0] - CLASSES[b.cls].rk[0] || CLASSES[a.cls].rk.length - CLASSES[b.cls].rk.length);
}
function chooseRegion(party) {
  const avg = party.reduce((a, h) => a + h.lvl, 0) / party.length;
  const allClear = REGIONS.every(r => S.prog[r.id] && S.prog[r.id].clears);
  if (allClear && chance(.6)) return "abime";
  let best = "bourg";
  for (const r of REGIONS) if (regionUnlocked(r.id) && avg >= r.lvl - 1.5) best = r.id;
  return best;
}
function hpFrac(run) { const p = runParty().filter(h => !run.fallen.includes(h.id)); return p.reduce((a, h) => { const m = heroStats(h, relicHooks(run)).hp; return a + (h.hp == null ? 1 : h.hp / m); }, 0) / Math.max(1, p.length); }
function doRun() {
  const party = partyFor(); if (party.length < 1) return "none";
  const reg = chooseRegion(party);
  const run = startRun(reg, party.map(h => h.id), S.pet, { floor: reg === "abime" ? Math.max(1, S.abyss.best - 1) : 1 });
  T.runs++; T.regionAt[reg] = (T.regionAt[reg] || 0) + 1;
  for (const h of party) T.perClassUse[h.cls] = (T.perClassUse[h.cls] || 0) + 1;
  let steps = 0;
  while (steps++ < 80) {
    const av = availableNodes(run);
    if (!av.length) {
      if (reg === "abime") { if (hpFrac(run) > .5 && run.fallen.length === 0 && run.floor < 80) { run.floor++; run.map = genMap(RNG, 6); run.pos = null; continue; } return endRun("victory"); }
      return endRun("victory");
    }
    const hf = hpFrac(run);
    let node = av.slice().sort((a, b) => score(b, hf) - score(a, hf))[0];
    if (run.fallen.length >= 2 && node.type !== "boss") return endRun("retreat");
    enterNode(run, node);
    if (["combat", "elite", "boss"].includes(node.type)) {
      if (node.type === "boss") { T.bossTry[reg] = (T.bossTry[reg] || 0) + 1; node.first = !(S.prog[reg] && S.prog[reg].clears); if (node.first) T.ft[reg] = (T.ft[reg] || 0) + 1; }
      const B = battleFor(run, node, genEncounter(run, node));
      const p0 = run.potions;
      const bkey = node.type === "boss" ? (B.enemies.find(e => e.boss) || {}).key : null;
      const r = simBattle(B, run, "bal");
      if (bkey) { T.bk = T.bk || {}; const o = T.bk[reg + ":" + bkey] = T.bk[reg + ":" + bkey] || [0, 0]; o[1]++; if (r === "win") o[0]++; }
      T.potions += p0 - run.potions;
      T.battles++; T.rounds += B.round; if (B.round >= 55) { T.stalls++; if (T.stalls < 6) console.log("ENLISÉ", reg, node.type, "H:", B.heroes.map(h => h.cls + ":" + Math.round(h.hp) + (h.agony ? "!" : "") + "@" + rankOf(B, h)).join(" "), "E:", B.enemies.map(e => e.key + ":" + e.hp + "@" + rankOf(B, e)).join(" ")); }
      for (const f of B.fallen) { T.falls++; T.perClassFall[f.cls] = (T.perClassFall[f.cls] || 0) + 1; }
      afterBattle(run, B);
      if (r !== "win") { T.blost++; const key = reg + "-" + node.c; T.nodeDeaths[key] = (T.nodeDeaths[key] || 0) + 1; return endRun("wipe"); }
      if (node.type === "boss") { T.bossWin[reg] = (T.bossWin[reg] || 0) + 1; if (node.first) T.fw[reg] = (T.fw[reg] || 0) + 1; }
      grantReward(run, rewardFor(run, node));
      for (const it of run.loot.slice()) { if (it.kind === "tr") continue; for (const h of runEquipTargets(it, run)) { const cur = h.gear[it.kind]; if (!cur || it.tier * 3 + it.rar > cur.tier * 3 + cur.rar) { runEquip(h, it, run); T.runEq = (T.runEq || 0) + 1; break; } } }
    } else if (node.type === "event") {
      const E = EVENTS.find(e => e.id === node.ev); const ci = rint(0, E.ch.length - 1);
      const res = resolveEvent(run, node.ev, ci);
      if (res.fight) { const fn = { c: node.c, type: "combat" }; const B = battleFor(run, fn, genEncounter(run, fn)); const r = simBattle(B, run); afterBattle(run, B); if (r !== "win") return endRun("wipe"); grantReward(run, rewardFor(run, fn)); }
    } else if (node.type === "treasure") grantReward(run, rewardFor(run, node));
    else if (node.type === "camp") doCamp(run, hf < .75 ? "rest" : "train");
    else if (node.type === "shop") { node.stock.forEach((o, i) => { if ((o.k === "potion" && run.potions < 3) || (o.k === "relic" && run.gold > o.cost * 2) || (o.k === "heal" && hf < .5)) shopBuy(run, node, i); }); }
    node.done = true;
  }
  return endRun("retreat");
}
function score(n, hf) { const t = n.type; const base = { combat: 5, elite: hf > .75 ? 7 : 1, event: 4, treasure: 6, camp: hf < .6 ? 9 : 2, shop: 3, boss: 10 }[t]; return base + RNG() * 2; }
function hub() {
  collectBank(); dailyCheck();
  for (const c of S.daily.contracts) if (c.p >= c.goal && !c.claimed) { c.claimed = 1; S.gold += c.gold; }
  // équiper le meilleur
  for (const h of S.heroes) {
    for (const it of S.inv.slice()) {
      if (it.kind !== "tr" && it.cls === h.cls) { const cur = h.gear[it.kind]; if (!cur || it.tier * 10 + it.rar * 4 + it.up > cur.tier * 10 + cur.rar * 4 + cur.up) equip(h, it); }
      if (it.kind === "tr" && (!h.gear.tr1 || !h.gear.tr2)) equip(h, it);
    }
    if (h.lvl >= EVO_LVL && !h.evo) evolve(h, pick(Object.keys(CLASSES[h.cls].evos)));
  }
  for (const it of S.inv.slice()) if (!S.heroes.some(h => canEquip(h, it) && it.kind !== "tr") && it.kind !== "tr") salvageItem(it);
  while (S.inv.filter(i => i.kind === "tr").length > 6) salvageItem(S.inv.find(i => i.kind === "tr"));
  for (const k of ["forge", "taverne", "chapelle", "academie", "fonderie", "menagerie"]) { const c = bldCost(k); if (c && S.gold > c.gold * 1.3) upgradeBld(k); }
  const party = partyFor();
  for (const h of party) { for (const s of ["wpn", "arm"]) { const it = h.gear[s]; if (it.tier < S.bld.forge && S.gold > craftCost(S.bld.forge).gold * 2) { const r = craft(h.cls, s, S.bld.forge); if (r.ok) equip(h, r.ok); } } }
  for (const h of party) for (const s of ["wpn", "arm"]) { let g = 0; while (g++ < 3 && S.gold > upCost(h.gear[s]).gold * 2.5) if (!upgradeItem(h.gear[s]).ok) break; }
  for (const h of party) for (const k of h.skills) { const c = skillUpCost(h.skr[k] || 1); if (S.gold > c.gold * 3) skillUp(h, k); }
  for (const h of S.heroes.filter(isInjured)) if (S.gold > healCost(h) * 3) healInjured(h.id);
  const healthy = S.heroes.filter(h => !isInjured(h)).length;
  if (healthy < 5 || S.heroes.length < 6) { const order = S.recruits.map((h, i) => i).sort((a, b) => S.recruits[b].lvl - S.recruits[a].lvl); for (const i of order) if (S.heroes.length < rosterMax() && S.gold >= recruitPrice(i) + (recruitPrice(i) ? 50 : 0)) { recruit(i); break; } }
  for (const p of PET_IDS) if (!S.pets.owned.includes(p) && petUnlocked(p) && S.gold > (PETS[p].cost || 0) * 2.5) adoptPet(p);
  if (S.pets.owned.length > 1) S.pet = S.pets.owned.slice().sort((a, b) => petLvl(b) - petLvl(a))[0];
  for (const p of S.pets.owned) if (petLvl(p) >= PET_EVO_LVL && !petEvolved(p)) evolvePet(p);
}
const careers = [];
for (let c = 0; c < N; c++) {
  try {
    newGame(pick(PET_IDS.filter(p => PETS[p].starter)), { diff: DIFF });
    const rec = { cleared: [], lvlAt10: 0, lvlAt20: 0 };
    for (let e = 0; e < EXP; e++) {
      hub();
      const before = regionsCleared();
      const r = doRun();
      if (r && r.outcome === "victory") T.wins++; else if (r && r.outcome === "wipe") T.wipes++; else T.retreats++;
      if (regionsCleared() > before) rec.cleared.push(e + 1);
      const avg = S.heroes.slice().sort((a, b) => b.lvl - a.lvl).slice(0, 4).reduce((a, h) => a + h.lvl, 0) / 4;
      if (e === 9) rec.lvlAt10 = avg; if (e === 19) rec.lvlAt20 = avg;
      if (VERB && (c === +process.env.CC)) console.log("exp", e + 1, r && r.outcome, r && r.region, "lvl", avg.toFixed(1), "or", S.gold, "abyss", S.abyss.best, "forge", S.bld.forge);
    }
    rec.final = S.heroes.slice().sort((a, b) => b.lvl - a.lvl).slice(0, 4).reduce((a, h) => a + h.lvl, 0) / 4;
    rec.abyss = S.abyss.best; rec.gold = S.gold; rec.heroes = S.heroes.length; rec.ach = Object.keys(S.ach).length; rec.pets = S.pets.owned.length;
    careers.push(rec);
  } catch (err) { T.errors.push(err.stack.split("\\n").slice(0, 4).join(" | ")); }
}
return { T, careers };
`)(N, EXP, SEED, VERB, DIFF);
const { T, careers } = out;
const avg = (a, f) => a.length ? (a.reduce((s, x) => s + f(x), 0) / a.length) : 0;
console.log(`\n${N} carrières × ${EXP} expéditions`);
console.log(`Expéditions ${T.runs} · victoires ${T.wins} · déroutes ${T.wipes} · retraites ${T.retreats}`);
console.log(`Combats ${T.battles} · perdus ${T.blost} (${(100 * T.blost / T.battles).toFixed(1)} %) · tours moyens ${(T.rounds / T.battles).toFixed(1)} · enlisés ${T.stalls} · potions/expé ${(T.potions / T.runs).toFixed(2)}`);
console.log(`Héros tombés ${T.falls} (${(T.falls / T.battles).toFixed(2)} par combat)`);
console.log("Région jouée :", JSON.stringify(T.regionAt));
console.log("Gardiens jamais vaincus (victoires/essais) :", Object.keys(T.ft).map(k => k + " " + (T.fw[k] || 0) + "/" + T.ft[k]).join(" · "));
if (T.bk) console.log("Par gardien :", Object.keys(T.bk).sort().map(k => k + " " + T.bk[k][0] + "/" + T.bk[k][1]).join(" · "));
console.log("Gardiens (victoires/essais) :", Object.keys(T.bossTry).map(k => k + " " + (T.bossWin[k] || 0) + "/" + T.bossTry[k]).join(" · "));
for (let i = 0; i < 5; i++) { const xs = careers.filter(c => c.cleared[i]).map(c => c.cleared[i]); console.log(`Chapitre ${i + 1} terminé par ${xs.length}/${careers.length} carrières, à l'expédition ${xs.length ? avg(xs, x => x).toFixed(1) : "—"}`); }
console.log(`Niveau moyen : à 10 exp ${avg(careers, c => c.lvlAt10).toFixed(1)} · à 20 ${avg(careers, c => c.lvlAt20).toFixed(1)} · final ${avg(careers, c => c.final).toFixed(1)}`);
console.log(`Abîme record moyen ${avg(careers, c => c.abyss).toFixed(1)} · or final ${avg(careers, c => c.gold).toFixed(0)} · héros ${avg(careers, c => c.heroes).toFixed(1)} · succès ${avg(careers, c => c.ach).toFixed(1)} · compagnons ${avg(careers, c => c.pets).toFixed(1)}`);
console.log("Chutes par classe (chutes / participations) :", Object.keys(T.perClassUse).map(k => k + " " + ((T.perClassFall[k] || 0) / T.perClassUse[k]).toFixed(2)).join(" · "));
console.log("Défaites par salle :", JSON.stringify(T.nodeDeaths));
console.log(`Objets équipés en expédition : ${T.runEq || 0}`);
console.log("Erreurs :", T.errors.length ? "\n" + T.errors.slice(0, 8).join("\n") : "aucune");
