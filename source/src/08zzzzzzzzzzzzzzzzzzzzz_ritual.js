/* Gardiens à mécanique (12 nov.) : le rituel.
   À partir du tour 3 puis tous les 4 tours, un gardien commence un rituel annoncé (« dans 2 tours ») et une jauge de rupture apparaît :
   infliger 14 % de ses PV max avant l'échéance brise le rituel → le gardien est étourdi et exposé.
   Sinon il déchaîne le Cataclysme : 1,6× ses dégâts sur tout le groupe, étourdissement possible et stress.
   Actif en menace II et plus, dans l'Abîme et dans les nouveaux cycles. */
const RIT = { start: 3, every: 4, delay: 2, need: .09, m: 1.35 };
function ritualOn(B) { if (typeof process !== "undefined" && process.env && process.env.RITOFF) return false; try { if (typeof S !== "undefined" && S && S.run) return (S.run.threat || 0) >= 1 || S.run.region === "abime" || (typeof cycleN === "function" && cycleN() > 0); } catch (e) { } return false; }
{ const sr = startRound; startRound = function (B) { const r = sr.apply(this, arguments);
    try { if (!ritualOn(B)) return r; const boss = B.enemies.find(e => alive(e) && e.boss); if (!boss) return r;
      const R = B.rit;
      if (R && R.u === boss.uid) { R.t--; } // compte à rebours (déclenché au tour du gardien)
      else if (!R && B.round >= RIT.start && (B.round - RIT.start) % RIT.every === 0) { B.rit = { u: boss.uid, need: Math.round(boss.hpMax * RIT.need), dealt: 0, t: RIT.delay, name: ritualName(boss) }; B.ritMsg = 1; }
    } catch (e) { }
    return r; }; }
function ritualName(b) { const n = ["Cataclysme", "Jugement", "Marée noire", "Éclipse", "Hurlement du néant"]; let h = 0; for (const c of String(b.key || "")) h = (h * 31 + c.charCodeAt(0)) | 0; return n[Math.abs(h) % n.length]; }
{ const ad = applyDamage; applyDamage = function (B, src, x, d, ev) { const r = ad.apply(this, arguments);
    try { const R = B && B.rit; if (R && x && x.uid === R.u && src && src.side === "h" && r > 0) { R.dealt += r;
        if (R.dealt >= R.need && !R.broken) { R.broken = 1; B.rit = null; B.ritBroke = 1; if (ev) ev.push({ k: "rit", u: x.uid, txt: "RITUEL BRISÉ", c: "#7ad0ff" }); addSt(B, src, x, { k: "stun", t: 1, ch: 1 }, ev); addSt(B, src, x, { k: "vuln", v: .2, t: 2, ch: 1 }, ev); } } } catch (e) { }
    return r; }; }
{ const et = enemyTurn; enemyTurn = function (B, e) {
    const R = B && B.rit;
    if (R && e && R.u === e.uid && R.t <= 0 && alive(e)) { B.rit = null; B.ritFired = (B.ritFired || 0) + 1;
      const sk = { id: "rit", n: R.name, m: RIT.m, t: "ae", at: [1, 2, 3, 4], fx: [{ k: "stun", t: 1, ch: .3 }], stress: 10 };
      try { return act(B, e, sk, null); } catch (err) { } }
    return et.apply(this, arguments); }; }
// l'IA (mode automatique) vise le gardien pendant un rituel
{ const ha = heroAuto; heroAuto = function (B, u) { const a = ha.apply(this, arguments);
    try { const R = B && B.rit; if (R && a && a.sk && (a.sk.t || "e") === "e") { const bs = unitById(B, R.u); if (bs && validTargets(B, u, a.sk).includes(bs)) a.tgt = bs; } } catch (e) { }
    return a; }; }
