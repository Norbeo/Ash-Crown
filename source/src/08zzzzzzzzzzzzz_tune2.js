/* Rééquilibrage du 12 nov. : les synergies de classe, constellations, séries et cartes rendent la compagnie plus forte au fil de la partie ;
   les ennemis suivent, d'autant plus que le chapitre est avancé (mesuré avec test/deep.js). */
const POWER_COMP = { hp: .11, dmg: .07 };
const BOSS_COMP = { hp: 0, dmg: 0 }; // essai du 12 nov. (renfort des gardiens dès le chapitre V) : sans effet sur les bots très équipés de deep.js, trop dur pour un groupe à équipement Rare (bosslvl.js) → laissé à 0
{ const bf = balFactor; balFactor = function (run, boss) { const F = bf.apply(this, arguments); if (!run || run.region === "abime") return F; const i = Math.max(0, REGIONS.findIndex(r => r.id === run.region));
    const j = Math.max(0, i - 6), b = boss ? Math.max(0, i - 3) : 0; return { hp: F.hp * (1 + POWER_COMP.hp * i + .12 * j * j / 4) * (1 + BOSS_COMP.hp * b), dmg: F.dmg * (1 + POWER_COMP.dmg * i + .05 * j * j / 4) * (1 + BOSS_COMP.dmg * b) }; }; }
// Essais d'équilibrage sous node : BOSSH / BOSSD / FOEH / FOED (multiplicateurs) — sans effet dans le navigateur.
{ const E = typeof process !== "undefined" && process.env ? process.env : {}; const bh = +E.BOSSH || 1, bd = +E.BOSSD || 1, fh = +E.FOEH || 1, fd = +E.FOED || 1;
  if (bh !== 1 || bd !== 1 || fh !== 1 || fd !== 1) { const bf = balFactor; balFactor = function (run, boss) { const F = bf.apply(this, arguments); return boss ? { hp: F.hp * bh, dmg: F.dmg * bd } : { hp: F.hp * fh, dmg: F.dmg * fd }; }; } }
// Courbe de difficulté du 12 nov. (demande : « que les bots se crashent plus souvent sur les gardiens ») — mesurée avec deep.js :
// la puissance de la compagnie croît bien plus vite que les ennemis à partir du chapitre VII. Gardiens : PV × m, dégâts × √m ; ennemis courants : moitié de l'effet.
const DIFF_CURVE = { base: 1.25, step: 1.45, from: 5, late: 1.3, lateFrom: 10 };
const DIFF_TAB = [1.15, 1.25, 1.4, 1.55, 1.75, 1.95, 2.4, 2.9, 3.4, 6.5, 13, 13.5, 12, 12.5, 15, 15, 15.5, 16, 16.5, 17]; // mesuré avec deep.js (objectif ≈ 75–85 % de victoires des bots contre les gardiens au niveau conseillé)
function diffMul(i) { return i < DIFF_TAB.length ? DIFF_TAB[i] : DIFF_TAB[DIFF_TAB.length - 1] * Math.pow(1.08, i - DIFF_TAB.length + 1); }
{ const bf = balFactor; balFactor = function (run, boss) { const F = bf.apply(this, arguments); if (!run || run.region === "abime") return F; const i = Math.max(0, REGIONS.findIndex(r => r.id === run.region));
    const c = typeof cycleN === "function" ? cycleN() : 0; let dm = diffMul(i);
    if (c > 0 && typeof CYCLE_FLOOR !== "undefined") { // cycles : la difficulté des premiers chapitres rejoint celle du dernier (comme leur niveau)
      const lc = (typeof process !== "undefined" && process.env && process.env.LASTCH) || lastChapter(), li = REGIONS.findIndex(r => r.id === lc);
      if (li > i) dm = Math.max(dm, .8 * diffMul(li)); }
    const m = dm * (1 + .15 * (run.threat || 0)), mf = 1 + (m - 1) * .5; return boss ? { hp: F.hp * m, dmg: F.dmg * Math.sqrt(m) } : { hp: F.hp * mf, dmg: F.dmg * Math.sqrt(mf) }; }; }
