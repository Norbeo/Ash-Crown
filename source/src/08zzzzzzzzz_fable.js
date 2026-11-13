/* Refonte (12 nov.) : fin des combats de gardiens qui s'éternisent.
   Effondrement : dès le tour 22 contre un gardien, l'arène se délite — le gardien perd chaque tour un pourcentage croissant
   de ses PV max (2 %, 4 %, 6 %…) et les héros debout davantage (3 %, 6 %…), sans jamais achever un héros à l'agonie. */
const COLLAPSE_ROUND = 22, COLLAPSE_BOSS = .02, COLLAPSE_HERO = .03;
function collapseRound(B) {
  if (!B || B.round < COLLAPSE_ROUND || !B.enemies.some(e => alive(e) && e.boss)) return;
  const n = B.round - COLLAPSE_ROUND + 1, ev = [];
  for (const e of B.enemies.filter(x => alive(x) && x.boss)) applyDamage(B, null, e, Math.max(1, Math.round(e.hpMax * COLLAPSE_BOSS * n)), ev, { dot: 1 });
  for (const h of B.heroes.filter(x => alive(x) && !x.agony)) applyDamage(B, null, h, Math.max(1, Math.round(h.hpMax * Math.min(.3, COLLAPSE_HERO * n))), ev, { dot: 1 });
  if (B.round === COLLAPSE_ROUND) B.collapseMsg = 1;
  B.collapseN = n; checkEnd(B);
}
{ const sr = startRound; startRound = function (B) { const r = sr.apply(this, arguments); try { collapseRound(B); } catch (e) { } return r; }; }
