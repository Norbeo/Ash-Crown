// Équilibrage des gardiens par niveau : node test/bosslvl.js [essais] [graine]
// Pour chaque chapitre et menace, un groupe type (tank, soin, 2 dégâts) équipé au palier de son niveau (qualité Rare) affronte le gardien.
const fs = require("fs"), path = require("path");
const SRC = fs.readdirSync(path.join(__dirname, "../src")).filter(f => /^0[0-8].*\.js$/.test(f)).sort();
const code = SRC.map(f => fs.readFileSync(path.join(__dirname, "../src/" + f), "utf8")).join("\n");
const TR = +process.argv[2] || 16, SEED = +process.argv[3] || 3, ONLY = process.argv[4];
new Function("TR", "SEED", "ONLY", code + `
RNG = mkRng(SEED);
const comp = [["templier","gardien_runes","hallebardier"],["pretresse","medecin_peste","exorciste"],["berserker","arbaletriere","pyromancien","ombre","sorciere","chasseur_sorcieres","necromancien","revenant"],["menestrel","sorciere","arbaletriere"]];
function party(L, k) {
  S = newState(); S.heroes = []; S.inv = [];
  const out = [];
  for (let i = 0; i < 4; i++) { const pool = comp[i].filter(c => CLASSES[c]); const cls = pool[(k + i) % pool.length]; const h = makeHero(cls); h.lvl = L; if (L >= EVO_LVL) h.evo = Object.keys(CLASSES[cls].evos)[k % 2];
    const tier = Math.max(1, TIER_LVL.filter(l => l <= L).length - 1);
    h.gear.wpn = makeGear("wpn", cls, tier, 2); h.gear.arm = makeGear("arm", cls, tier, 2, null, h.evo); h.gear.tr1 = makeGear("tr", null, 1, 2); h.gear.tr2 = makeGear("tr", null, 1, 2);
    S.heroes.push(h); out.push(h); }
  return out;
}
function trial(reg, threat, L, k) {
  const hs = party(L, k); S.prog = {}; const run = startRun(reg, hs.map(h => h.id), null, { threat });
  run.weather = null; run.omen = null; const node = run.map[run.map.length - 1][0];
  const B = battleFor(run, node, genEncounter(run, node)); const r = simBattle(B, run, "bal"); return [r === "win", B.round];
}
if (process.argv.includes("--tune")) { const out = {};
  for (const R of REGIONS) { out[R.id] = [];
    for (let t = 0; t <= 4; t++) { const rec = Math.max(4, R.lvl) + 2 * t; let lo = .45, hi = 1.8;
      for (let it = 0; it < 6; it++) { const f = (lo + hi) / 2; (BOSS_TUNE[R.id] = BOSS_TUNE[R.id] || [])[t] = f; let w = 0; for (let k = 0; k < TR; k++) if (trial(R.id, t, rec, k)[0]) w++; if (w / TR > .85) lo = f; else hi = f; }
      out[R.id][t] = +((lo + hi) / 2).toFixed(2); BOSS_TUNE[R.id][t] = out[R.id][t]; } console.log(R.id, JSON.stringify(out[R.id])); }
  console.log("TUNE " + JSON.stringify(out)); return; }
const res = [];
for (const R of REGIONS) { if (ONLY && R.id !== ONLY) continue;
  for (let t = 0; t <= 4; t++) { const rec = Math.max(4, R.lvl) + 2 * t; const row = [R.id + " M" + (t + 1) + " conseillé " + rec];
    for (const d of [-6, -3, 0, 3]) { let w = 0, rd = 0; for (let k = 0; k < TR; k++) { const [ok, r] = trial(R.id, t, Math.max(1, rec + d), k); if (ok) w++; rd += r; } row.push((d >= 0 ? "+" : "") + d + ":" + Math.round(100 * w / TR) + "% (" + (rd / TR).toFixed(0) + "t)"); }
    console.log(row.join("  ")); } }
`)(TR, SEED, ONLY);
