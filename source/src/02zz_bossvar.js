// ── Variantes de gardiens : chaque gardien existe en quatre déclinaisons (68 gardiens de plus) ──
// Même illustration recolorée, statistiques et compétences modifiées. Elles entrent dans le roulement
// une fois le gardien d'origine vaincu (voir nextBossKey dans 06_run.js).
const BOSS_FEM = new Set(["mere_ronces", "liche", "mere_noyes", "reine_sabbat", "matrone_os", "reine_hiver"]);
const BOSS_VARIANTS = {
  sang: { m: "Sanglant", f: "Sanglante", hue: "#c01818", d: "Chaque coup fait saigner ; frappe 20 % plus fort.",
    tune: M => { M.dmg = M.dmg.map(v => Math.round(v * 1.2)); M.res = (M.res || 0) + 5; for (const s of M.sk) if (s.m) s.fx = (s.fx || []).concat([{ k: "bleed", v: .4, t: 3, ch: .7 }]); } },
  spectre: { m: "Spectral", f: "Spectrale", hue: "#7ab8ff", d: "Insaisissable : +15 esquive, +2 vitesse, mais 10 % de PV en moins.",
    tune: M => { M.hp = Math.round(M.hp * .9); M.dodge = (M.dodge || 0) + 15; M.spd = (M.spd || 0) + 2; } },
  braise: { m: "Ardent", f: "Ardente", hue: "#ff7a2a", d: "Ses attaques enflamment ; 5 % de PV en plus.",
    tune: M => { M.hp = Math.round(M.hp * 1.05); for (const s of M.sk) if (s.m) s.fx = (s.fx || []).concat([{ k: "burn", v: .45, t: 3, ch: .8 }]); } },
  abime: { m: "Abyssal", f: "Abyssale", hue: "#7a3aff", d: "Venu de l'Abîme : +25 % de PV, +20 résistance, appelle des horreurs.",
    tune: (M, k) => { M.hp = Math.round(M.hp * 1.25); M.res = (M.res || 0) + 20; M.dmg = M.dmg.map(v => Math.round(v * 1.05)); if (!M.sk.some(s => s.summon)) M.sk.push({ n: "Appel de l'Abîme", t: "self", summon: ["horreur", "oeil"].filter(x => MONSTERS[x]), cd: 4, w: .6 }); } },
};
const BOSS_VAR_INFO = {};
for (const base of Object.keys(MONSTERS).filter(k => MONSTERS[k].boss && !MONSTERS[k].variantOf)) {
  for (const v in BOSS_VARIANTS) {
    const V = BOSS_VARIANTS[v], B = MONSTERS[base], k = base + "_" + v; if (MONSTERS[k]) continue;
    const M = JSON.parse(JSON.stringify(B)); // copie profonde : compétences modifiables
    M.n = B.n + " " + (BOSS_FEM.has(base) || B.fem ? V.f : V.m); M.art = B.art || base; M.hue = V.hue; M.variantOf = base; M.vkind = v; delete M.threatBoss;
    V.tune(M, k); MONSTERS[k] = M;
    BOSS_VAR_INFO[k] = [V.d, null, null, null]; // titre, réplique et objet unique complétés depuis le gardien d'origine (08zy_bosses.js)
  }
}
const bossBase = k => (MONSTERS[k] && MONSTERS[k].variantOf) || k;
