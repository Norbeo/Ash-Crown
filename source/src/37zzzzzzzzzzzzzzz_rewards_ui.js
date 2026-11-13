/* Défis du jour et défi de la semaine : récompenses exponentielles selon la progression (chapitres vaincus, menaces, cycles). */
function progressScale() {
  if (!S) return 1;
  const regs = REGIONS.filter(r => r.id !== "abime"), done = regs.filter(r => S.prog[r.id] && S.prog[r.id].clears);
  const ch = done.length, th = done.reduce((a, r) => a + (S.prog[r.id].threat || 0), 0), cy = cycleN();
  let lvl = 4; for (const r of done) { const l = recLevel(r.id, threatMax(r.id)); if (l) lvl = Math.max(lvl, l); }
  lvl += cy * (typeof CYCLE_LVL !== "undefined" ? CYCLE_LVL : 12);
  return (1 + lvl * .25) * Math.pow(1.12, ch + th / 2) * (1 + .5 * cy); // cycles : progression linéaire (avant ×1,5 par cycle, explosif)
}
function contractGoldSync() { if (!S || !S.daily || !S.daily.contracts) return; const k = progressScale(); for (const c of S.daily.contracts) { if (c.base == null) c.base = c.gold; if (!c.claimed) c.gold = Math.round(c.base * k / 10) * 10; } }
{ const dc = dailyCheck; dailyCheck = function () { const r = dc.apply(this, arguments); contractGoldSync(); return r; }; }
{ const wr = weekReward; weekReward = function () { const R = wr.apply(this, arguments), k = progressScale(), ch = REGIONS.filter(r => r.id !== "abime" && S.prog[r.id] && S.prog[r.id].clears).length;
    return { gold: Math.round(R.gold * k * 2 / 10) * 10, shards: R.shards + Math.floor(ch / 2) + 2 * cycleN(), essence: Math.round(R.essence * (1 + ch / 2) * (1 + cycleN())) }; }; }
{ const cc = ACT.claimCt; ACT.claimCt = function () { contractGoldSync(); return cc.apply(this, arguments); }; }
{ const bh = SCREENS.bastion.html; SCREENS.bastion.html = function () { contractGoldSync(); return bh.apply(this, arguments); }; }
