/* ═══════════ Équilibrage du 7 nov. (calibré par test/deep.js) ═══════════
   - Nouveaux cycles : les chapitres reprennent CYCLE_LVL niveaux plus haut (au lieu de simples PV/dégâts ×1,3) : les héros gardent une vraie difficulté.
   - Force des ennemis selon le chapitre et la menace (BAL), les gardiens un peu plus. */
const CYCLE_LVL = (typeof process !== "undefined" && process.env && +process.env.CYL) || 12; // essais sous node : CYL=…
const BAL = { hp0: .92, hpC: .14, hpT: .15, dmg0: .95, dmgC: .08, dmgT: .10, boss: 1.2, cyHp: .85, cyDmg: .42 };
// Cycles (réglé le 12 nov. avec deep.js) : les premiers chapitres sont « tassés » vers le niveau du dernier chapitre (CYCLE_FLOOR),
// pour que chaque cycle reste un vrai défi du début à la fin au lieu de trois chapitres faciles puis un mur ; +CYCLE_LVL par cycle ensuite.
const CYCLE_FLOOR = .75, CYCLE_BOOST = 2.5;
function cycleLmax() { try { const id = (typeof process !== "undefined" && process.env && process.env.LASTCH) || lastChapter(); const R = REGIONS.find(r => r.id === id); return R ? R.lvl : 0; } catch (e) { return 0; } }
function cycleLvlAdd(l, c, abyss) { if (!c) return 0; if (abyss) return c * 20; return c * CYCLE_LVL + Math.round(CYCLE_FLOOR * Math.max(0, cycleLmax() - l)); }
{ const rl0 = runLevel; runLevel = function (run, node) { const l = rl0.apply(this, arguments); const c = typeof cycleN === "function" ? cycleN() : 0; return l + cycleLvlAdd(l, c, run.region === "abime"); }; }
{ const rc0 = recLevel; recLevel = function (regId, threat) { const r = rc0.apply(this, arguments); if (r == null) return r; const c = typeof cycleN === "function" ? cycleN() : 0; return r + cycleLvlAdd(r, c, regId === "abime"); }; }

const BAL_R = [1, .88, 1, 1.1, 1.3, 1.4, 1.2, 1.35, 1.45, .85]; // correction par chapitre (mesurée)
function balFactor(run, boss) { if (!run || run.region === "abime") return { hp: 1, dmg: 1 }; let i = Math.max(0, REGIONS.findIndex(r => r.id === run.region)); const t = run.threat || 0;
  { const c0 = typeof cycleN === "function" ? cycleN() : 0; if (c0 > 0) { const lc = (typeof process !== "undefined" && process.env && process.env.LASTCH) || lastChapter(), li = REGIONS.findIndex(r => r.id === lc); if (li > i) { run._cyBoost = 1 + CYCLE_BOOST * (li - i) / li; i = Math.round(i + CYCLE_FLOOR * (li - i)); } } } // cycles : les chapitres se rapprochent du dernier (créatures de base plus faibles compensées par CYCLE_BOOST)
  const k = BAL_R[i] || 1, c = typeof cycleN === "function" ? cycleN() : 0; const hp = (BAL.hp0 + BAL.hpC * i + BAL.hpT * t) * (boss ? BAL.boss : 1) * k * (1 + BAL.cyHp * Math.pow(c, .75)) * (c ? (run._cyBoost || 1) : 1), dmg = (BAL.dmg0 + BAL.dmgC * i + BAL.dmgT * t) * Math.sqrt(k) * (1 + BAL.cyDmg * Math.pow(c, .75)) * (c ? Math.sqrt(run._cyBoost || 1) : 1); return { hp, dmg }; }
{ const bf9 = battleFor; battleFor = function (run, node, enc) { const B = bf9.apply(this, arguments); if (!B || !run) return B;
    for (const e of B.enemies) { const F = balFactor(run, e.boss); e.hpMax = Math.round(e.hpMax * F.hp); e.hp = Math.round(e.hp * F.hp); e.dmgLo = Math.round(e.dmgLo * F.dmg); e.dmgHi = Math.round(e.dmgHi * F.dmg); }
    return B; }; }
