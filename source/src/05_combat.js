/* ═══════════════════════ Moteur de combat (logique pure, sans affichage) ═══════════════════════ */
const NEG = new Set(["bleed", "poison", "burn", "stun", "weak", "vuln", "accDn", "spdDn", "protDn", "dodgeDn", "mark"]);
const DOTS = ["bleed", "poison", "burn"];
const ST_INFO = {
  bleed: { n: "Saignement", c: "#d02a2a" }, poison: { n: "Poison", c: "#7ac03a" }, burn: { n: "Brûlure", c: "#ff8a2a" }, stun: { n: "Étourdi", c: "#ffd84a" },
  weak: { n: "Affaibli", c: "#a08a7a" }, vuln: { n: "Vulnérable", c: "#ff5a8a" }, mark: { n: "Marqué", c: "#ff3a3a" }, accDn: { n: "Aveuglé", c: "#8a8aa0" },
  spdDn: { n: "Ralenti", c: "#6a8ac0" }, protDn: { n: "Armure brisée", c: "#c0805a" }, dodgeDn: { n: "Exposé", c: "#c0a05a" },
  protUp: { n: "Protection", c: "#8ab0d8" }, dmgUp: { n: "Force", c: "#ff7a4a" }, spdUp: { n: "Hâte", c: "#7ad0ff" }, dodgeUp: { n: "Esquive", c: "#b0e0ff" },
  accUp: { n: "Précision", c: "#e0e0a0" }, critUp: { n: "Acuité", c: "#ffc04a" }, regen: { n: "Régénération", c: "#7ad07a" }, shield: { n: "Bouclier", c: "#a0c8ff" },
  prov: { n: "Provocation", c: "#ff9a5a" }, riposte: { n: "Riposte", c: "#e0c080" }, stealth: { n: "Furtif", c: "#9a8ab0" }, guarded: { n: "Protégé", c: "#c0d0e0" }, thorns: { n: "Épines", c: "#e07a3a" },
};

// ── création des combattants ──
function heroUnit(h, relicH) {
  const s = heroStats(h, relicH), C = CLASSES[h.cls];
  const sk = h.skills.filter(id => skillDef(h, id)).map(id => Object.assign({ id, rank: h.skr[id] || 1 }, skillDef(h, id)));
  const u = { uid: "H" + h.id, side: "h", hid: h.id, name: h.name, cls: h.cls, tags: ["humain"], sz: 1, hpMax: s.hp, hp: h.hp == null ? s.hp : clamp(h.hp, 0, s.hp),
    dmgLo: s.dmgLo, dmgHi: s.dmgHi, prot: s.prot, spd: s.spd, crit: s.crit, dodge: s.dodge, acc: s.acc, res: s.res, healPow: s.healPow, leech: s.leech, hooks: s.hooks,
    skills: sk, ult: Object.assign({ id: "ult", isUlt: 1 }, heroUlt(h)), ultV: 0, cds: {}, st: [], cheat: s.hooks.cheatDeath || 0, agony: false, role: C.role };
  if (u.hp <= 0) { u.hp = 0; u.agony = true; }
  return u;
}
function monUnit(key, lvl, mods = {}) {
  const M = MONSTERS[key], L = lvl - 1;
  // difficulté : les combats ordinaires mordent dès le chapitre II, les derniers gardiens sont de vrais murs
  const late = lvl >= 11 ? 1 : 0, early = lvl <= 3 ? 1 : 0;
  const hpM = 1.2 * (1 + (M.boss ? .12 : .2) * L) * (mods.hp || 1) * (M.boss ? (1 + (mods.bossHp || 0)) * (late ? 1.75 : 1) : early ? 1 : 1.2),
    dM = 1.4 * (1 + .11 * L) * (mods.dmg || 1) * (M.boss ? (late ? 1.38 : 1.1) : early ? 1.08 : 1.45);
  const u = { uid: uid("E"), side: "e", key, name: M.name || M.n, art: M.art, tags: M.tags, sz: M.sz || 1, boss: !!M.boss, elite: !!M.elite, lvl,
    hpMax: Math.round(M.hp * hpM), dmgLo: Math.max(1, Math.round(M.dmg[0] * dM)), dmgHi: Math.max(2, Math.round(M.dmg[1] * dM)), prot: clamp(M.prot + (mods.prot || 0), 0, .7),
    spd: M.spd + Math.floor(L / 5) + (mods.spd || 0), crit: 4 + L * .3, dodge: M.dodge + L * .4, acc: 90 + L * .7, res: (M.res || 15) + L * 1.4, healPow: 1, leech: 0, hooks: {},
    skills: M.sk.map((s, i) => Object.assign({ id: "m" + i }, s)), cds: {}, st: [], ultV: 0, phase: M.phase, phaseDone: false };
  u.hp = u.hpMax;
  return u;
}

// ── rangs ──
function sideArr(B, side) { return side === "h" ? B.heroes : B.enemies; }
function rankOf(B, u) { const arr = sideArr(B, u.side); let r = 1; for (const x of arr) { if (x === u) return r; r += x.sz; } return 0; }
function occupies(B, u, ranks) { const r = rankOf(B, u); if (!r) return false; for (let i = 0; i < u.sz; i++) if (ranks.includes(r + i)) return true; return false; }
const foeSide = s => s === "h" ? "e" : "h";
const alive = u => u && !u.dead && !u.fallen;
function stSum(u, k) { let v = 0; for (const s of u.st) if (s.k === k) v += s.v || 1; return v; }
function hasSt(u, k) { return u.st.some(s => s.k === k); }

// ── création d'un combat ──
function newBattle(heroes, enemyKeys, opt = {}) {
  const relicH = opt.relicH || {};
  const B = { heroes: heroes.map(h => heroUnit(h, relicH)), enemies: [], fallen: [], round: 0, order: [], turn: -1, morale: clamp(50 + (relicH.morale || 0) + (opt.morale || 0), 0, 100),
    light: opt.light == null ? 100 : opt.light, relicH, pet: null, over: null, log: [], kills: 0, crits: 0, opt, revived: 0, firstRound: true, mods: opt.mods || {} };
  for (const k of enemyKeys) B.enemies.push(monUnit(k.key || k, k.lvl || opt.lvl || 1, opt.mods));
  if (opt.pet) B.pet = { id: opt.pet, lvl: petLvl(opt.pet), evo: petEvolved(opt.pet), pw: petPower(opt.pet), n: 0 };
  if (relicH.startWeak) for (const e of B.enemies) addSt(B, null, e, { k: "weak", t: 2 }, []);
  return B;
}

// ── tour par tour ──
function startRound(B) {
  B.round++;
  const all = [...B.heroes, ...B.enemies].filter(alive);
  for (const u of all) u._ini = effSpd(u) + rint(0, 3) + (u.side === "h" ? .5 : 0) + (B.firstRound && B.relicH.firstStrike && u.side === "h" ? 50 : 0);
  B.order = all.sort((a, b) => b._ini - a._ini).map(u => u.uid);
  B.turn = -1; B.firstRound = false;
  // rage : un combat qui s'éternise devient de plus en plus mortel (pas d'impasse)
  if (B.round > 14) for (const e of B.enemies.filter(alive)) { const r = e.st.find(z => z.k === "dmgUp" && z.rage); if (r) { r.v += .12; r.t = 99; } else e.st.push({ k: "dmgUp", v: .12, t: 99, rage: 1 }); }
  if (B.round === 15) B.rageMsg = 1;
  if (B.relicH.roundHeal) for (const h of B.heroes.filter(alive)) healUnit(B, null, h, h.hpMax * B.relicH.roundHeal, []);
  planIntents(B);
}
function unitById(B, id) { return B.heroes.find(u => u.uid === id) || B.enemies.find(u => u.uid === id); }
// renvoie l'unité dont c'est le tour (ou null si le tour de table est fini : le compagnon agit puis nouveau tour)
function nextActor(B) {
  while (++B.turn < B.order.length) { const u = unitById(B, B.order[B.turn]); if (alive(u)) return u; }
  return null;
}
// début du tour d'une unité : altérations. Renvoie les événements ; u.skip si étourdi
function beginTurn(B, u) {
  const ev = []; u.skip = false; u.hitSince = u.hitSince || 0;
  for (const k of DOTS) { const tot = u.st.filter(s => s.k === k).reduce((a, s) => a + s.v, 0); if (tot > 0 && alive(u)) { const d = Math.max(1, Math.round(tot)); ev.push({ k: "dot", u: u.uid, st: k, dmg: d }); applyDamage(B, null, u, d, ev, { dot: 1 }); } }
  const rg = stSum(u, "regen"); if (rg > 0 && alive(u)) healUnit(B, null, u, u.hpMax * rg * (1 + (u.hooks.regenPow || 0)), ev, { regen: 1 });
  if (alive(u) && hasSt(u, "stun")) { u.skip = true; u.st = u.st.filter(s => s.k !== "stun"); ev.push({ k: "stunned", u: u.uid }); }
  for (const id in u.cds) if (u.cds[id] > 0) u.cds[id]--;
  return ev;
}
function endTurn(B, u) {
  for (const s of u.st) if (s.k !== "stun") s.t--;
  u.st = u.st.filter(s => s.t > 0 || s.k === "stun");
  u.hitSince = 0;
  checkEnd(B);
}
function checkEnd(B) {
  if (!B.enemies.some(alive)) B.over = "win";
  else if (!B.heroes.some(alive)) B.over = "lose";
}

// ── stats effectives ──
const effSpd = u => u.spd + stSum(u, "spdUp") - stSum(u, "spdDn");
const effProt = u => clamp(u.prot + stSum(u, "protUp") - stSum(u, "protDn"), -.5, .85);
const effDodge = u => clamp(u.dodge + stSum(u, "dodgeUp") - stSum(u, "dodgeDn"), 0, 75);
const avgDmg = u => (u.dmgLo + u.dmgHi) / 2;

// ── compétences utilisables ──
function canUse(B, u, sk) {
  if (!alive(u) || B.over) return false;
  if (sk.isUlt) return u.ultV >= 100;
  if (u.cds[sk.id] > 0) return false;
  if (u.side === "h" && sk.use && !sk.use.includes(rankOf(B, u))) return false;
  return validTargets(B, u, sk).length > 0 || ["s", "aa", "ae"].includes(sk.t || "e");
}
function validTargets(B, u, sk) {
  const t = sk.t || "e";
  if (t === "s") return [u];
  if (t === "a" || t === "aa") return sideArr(B, u.side).filter(x => alive(x) && (!sk.at || t === "aa" || occupies(B, x, sk.at)));
  if (t === "allies" || t === "self") return [u];
  const foes = sideArr(B, foeSide(u.side)).filter(alive);
  let list = foes.filter(x => !sk.at || occupies(B, x, sk.at));
  if (t === "e") { const vis = list.filter(x => !hasSt(x, "stealth")); if (vis.length) list = vis; }
  return list;
}

// ── exécution d'une action ──
function act(B, u, sk, tgt) {
  const ev = [], t = sk.t || "e";
  const rk = 1 + .1 * ((sk.rank || 1) - 1);
  ev.push({ k: "act", u: u.uid, sk: sk.n, ult: !!sk.isUlt, anim: skillAnim(u, sk), tgt: tgt && tgt.uid, t });
  if (sk.isUlt) u.ultV = 0; else { gainUlt(u, 18); if (sk.cd) u.cds[sk.id] = sk.cd + 1; }
  if (sk.selfDmg) { const d = Math.min(u.hp - 1, Math.round(u.hpMax * sk.selfDmg)); if (d > 0) { u.hp -= d; ev.push({ k: "hit", u: u.uid, dmg: d, self: 1 }); } }
  // cibles
  let tgts = [];
  if (t === "e" || t === "a") { const vt = validTargets(B, u, sk); tgts = [tgt && vt.includes(tgt) ? tgt : vt[0]].filter(Boolean); }
  else if (t === "ae" || t === "aa") tgts = validTargets(B, u, sk);
  else if (t === "s" || t === "self") tgts = [u];
  else if (t === "allies") { const al = sideArr(B, u.side).filter(alive); tgts = [al.sort((a, b) => a.hp / a.hpMax - b.hp / b.hpMax)[0]]; }
  // garde : un allié protégé est remplacé par son gardien pour les attaques ciblées
  if (t === "e" && tgts[0]) { const g = tgts[0].st.find(s => s.k === "guarded"); if (g) { const gd = unitById(B, g.by); if (alive(gd) && gd !== tgts[0]) { ev.push({ k: "guard", u: gd.uid, from: tgts[0].uid }); tgts = [gd]; } } }
  const foe = t === "e" || t === "ae";
  const hits = sk.hits || 1;
  for (const x of tgts) {
    if (!alive(x)) continue;
    if (foe && sk.m > 0) {
      let landed = false;
      for (let i = 0; i < hits && alive(x); i++) landed = strike(B, u, x, sk, sk.m * rk * (t === "ae" ? 1 + (u.hooks.aoeDmg || 0) + (u.side === "h" ? B.relicH.aoe || 0 : 0) : 1), ev) || landed;
      if (landed && alive(x)) applyFx(B, u, x, sk.fx, ev, rk);
      if (landed && sk.det) detonate(B, u, x, sk, ev);
      if (landed && sk.pull) moveUnit(B, x, -sk.pull, ev);
      if (landed && sk.push) moveUnit(B, x, sk.push, ev);
    } else if (foe) {
      // altération pure
      if (!rollHit(B, u, x, sk)) { ev.push({ k: "miss", u: x.uid }); continue; }
      applyFx(B, u, x, sk.fx, ev, rk);
      if (sk.pull) moveUnit(B, x, -sk.pull, ev);
    } else {
      if (sk.heal && !sk.healAllies) healUnit(B, u, x, x.hpMax * sk.heal * rk, ev);
      if (sk.cleanse) cleanse(x, ev);
      if (sk.guard && x !== u) { x.st = x.st.filter(s => s.k !== "guarded"); x.st.push({ k: "guarded", by: u.uid, t: sk.guard }); ev.push({ k: "st", u: x.uid, st: "guarded" }); }
      applyFx(B, u, x, sk.fx, ev, rk);
    }
  }
  if (sk.afx) for (const a of sideArr(B, u.side).filter(alive)) applyFx(B, u, a, sk.afx.map(f => Object.assign({ ch: 1 }, f)), ev, rk);
  if (sk.efx) for (const e of sideArr(B, foeSide(u.side)).filter(alive)) applyFx(B, u, e, sk.efx.map(f => Object.assign({ ch: 1 }, f)), ev, rk);
  if (sk.sfx) applyFx(B, u, u, sk.sfx.map(f => Object.assign({ ch: 1 }, f)), ev, rk);
  if (sk.healAllies && sk.heal) for (const a of sideArr(B, u.side).filter(alive)) healUnit(B, u, a, a.hpMax * sk.heal * rk, ev);
  if (sk.healSelf) healUnit(B, u, u, u.hpMax * sk.healSelf, ev);
  if (sk.revive && u.side === "h") reviveFallen(B, sk.revive, ev);
  if (sk.t === "aa" && sk.cleanse) for (const a of B.heroes.filter(alive)) cleanse(a, ev);
  if (sk.prov) addSt(B, u, u, { k: "prov", t: sk.prov }, ev);
  if (sk.mv) moveUnit(B, u, -sk.mv, ev);
  if (sk.morale && u.side === "h") changeMorale(B, sk.morale * (1 + (u.hooks.moralePow || 0)), ev);
  if (sk.light && B.opt.onLight) B.opt.onLight(sk.light);
  if (sk.petStrike && B.pet) for (let i = 0; i < sk.petStrike; i++) petAct(B, ev, true);
  checkEnd(B);
  return ev;
}
function skillAnim(u, sk) {
  const t = sk.t || "e";
  if (t === "a" || t === "aa" || t === "s" || t === "allies" || t === "self") return sk.heal || sk.healSelf ? "heal" : "buff";
  if (u.side === "h") { const w = CLASSES[u.cls].wpn; if (w === "arbalete") return "shoot"; if (["grimoire", "baton", "luth"].includes(w) || (w === "faux" && !sk.at?.every(r => r <= 2)) || (w === "faucille" && !(sk.use || []).includes(1))) return "cast"; return sk.mv > 0 ? "leap" : "melee"; }
  const M = MONSTERS[u.key]; if (M && M.rk.every(r => r >= 3)) return /Flèche|Volée|Carreau/.test(sk.n) ? "shoot" : "cast";
  return t === "ae" && !(sk.at || []).every(r => r <= 2) ? "cast" : "melee";
}
function gainUlt(u, v) { if (u.side !== "h") return; u.ultV = Math.min(100, u.ultV + v * (1 + (u.hooks.ultGain || 0)) * (1 - (S && S.run && S.run.oaths && S.run.oaths.includes("silence") ? OATHS.silence.v : 0))); }

function rollHit(B, u, x, sk) {
  if (u.side === x.side) return true;
  let acc = u.acc + (sk.acc || 0) + stSum(u, "accUp") - stSum(u, "accDn") - effDodge(x);
  if (u.side === "h" && B.morale <= 20) acc -= 10;
  return rnd() * 100 < clamp(acc, 8, 97);
}
// une frappe : renvoie true si elle touche
function strike(B, u, x, sk, mult, ev) {
  if (!rollHit(B, u, x, sk)) { ev.push({ k: "miss", u: x.uid, src: u.uid }); if (x.hooks.dodgeRiposte && x.side === "h" && rankOf(B, u) <= 2 && chance(x.hooks.dodgeRiposte)) counter(B, x, u, .7, ev); if (x.hooks.dodgeBleed && chance(x.hooks.dodgeBleed)) addSt(B, x, u, { k: "bleed", v: avgDmg(x) * .35, t: 2 }, ev); return false; }
  let d = rnd() * (u.dmgHi - u.dmgLo) + u.dmgLo;
  d *= mult;
  let mod = 1 + stSum(u, "dmgUp") * (u.side === "h" ? 1 : 1);
  if (hasSt(u, "weak")) mod -= .25;
  const hk = u.hooks, hpr = x.hp / x.hpMax;
  if (hk.lowHpDmg && u.hp / u.hpMax < .5) mod += hk.lowHpDmg;
  if (hk.vsTag && x.tags.includes(hk.vsTag)) mod += hk.vsTagV;
  if (hk.execute && hpr < .4) mod += hk.execute;
  if (hasSt(x, "mark")) mod += .15 + (hk.markDmg || 0) + (u.side === "h" ? B.relicH.markDmg || 0 : 0);
  if (hasSt(x, "vuln")) mod += .25;
  if (u.side === "h") { if (B.relicH.vsImpie && x.tags.includes("impie")) mod += B.relicH.vsImpie; if (B.relicH.darkDmg && B.light < 50) mod += B.relicH.darkDmg; if (B.morale >= 80) mod += .15; if (B.morale <= 20) mod -= .15; if (B.light < 30) mod += .05; }
  else { if (B.light < 30) mod += .12; if (B.mods.edmg) mod += B.mods.edmg; }
  const bn = sk.bonus;
  if (bn) {
    if (bn.tag && x.tags.includes(bn.tag)) d *= bn.x;
    if (bn.st === "stealth_self" ? hasSt(u, "stealth") : bn.st && hasSt(x, bn.st)) d *= bn.x;
    if (bn.low && hpr < bn.low) d *= bn.x;
    if (bn.selfHit && u.hitSince) d *= bn.x;
    if (bn.fallen) d *= 1 + bn.x * B.kills;
  }
  d *= Math.max(.2, mod);
  let critC = u.crit + (sk.cr || 0) + stSum(u, "critUp") + (u.side === "h" && B.light < 30 ? 5 : 0) + (u.side === "h" && B.morale >= 80 ? 5 : 0);
  const crit = rnd() * 100 < critC;
  if (crit) { d *= 1.5 + (hk.critDmg || 0); B.crits++; }
  d *= 1 - effProt(x);
  d = Math.max(1, Math.round(d));
  if (hasSt(u, "stealth") && u.side === "h") u.st = u.st.filter(s => s.k !== "stealth");
  const dealt = applyDamage(B, u, x, d, ev, { crit });
  if (crit && u.side === "h") { changeMorale(B, 3, ev); gainUlt(u, 6); if (hk.critBleed && alive(x)) addSt(B, u, x, { k: "bleed", v: avgDmg(u) * hk.critBleed, t: 3 }, ev); if (B.relicH.critStun && alive(x) && chance(B.relicH.critStun)) addSt(B, u, x, { k: "stun", t: 1 }, ev); }
  const lch = (sk.leech || 0) + (u.leech || 0);
  if (lch > 0 && dealt > 0) healUnit(B, u, u, dealt * lch, ev, { leech: 1 });
  // riposte et épines (mêlée)
  const melee = rankOf(B, u) <= 2 && (sk.at || [1]).some(r => r <= 2);
  if (alive(x) && alive(u) && melee) {
    const rp = x.st.find(s => s.k === "riposte"); if (rp && (sk.t || "e") === "e") counter(B, x, u, rp.v, ev);
    const th = stSum(x, "thorns") + (x.hooks.thornsP || 0) + (x.side === "h" ? B.relicH.thorns || 0 : 0);
    if (th > 0) { const r = Math.max(1, Math.round(dealt * th)); ev.push({ k: "thorns", u: u.uid }); applyDamage(B, x, u, r, ev, {}); }
  }
  return true;
}
function counter(B, x, u, mult, ev) {
  if (!alive(x) || !alive(u)) return;
  ev.push({ k: "riposte", u: x.uid, tgt: u.uid });
  let d = (rnd() * (x.dmgHi - x.dmgLo) + x.dmgLo) * mult * (1 - effProt(u));
  applyDamage(B, x, u, Math.max(1, Math.round(d)), ev, {});
}
function applyDamage(B, src, x, d, ev, o = {}) {
  if (!alive(x)) return 0;
  // bouclier
  let sh = x.st.filter(s => s.k === "shield");
  for (const s of sh) { const a = Math.min(s.v, d); s.v -= a; d -= a; if (a > 0) ev.push({ k: "absorb", u: x.uid, v: Math.round(a) }); if (s.v <= 0) s.t = 0; }
  x.st = x.st.filter(s => !(s.k === "shield" && s.v <= 0));
  if (d <= 0) return 0;
  const before = x.hp;
  if (!o.dot) ev.push({ k: "hit", u: x.uid, dmg: d, crit: !!o.crit, src: src && src.uid });
  x.hitSince = 1;
  if (x.side === "h") gainUlt(x, 8);
  if (x.side === "h" && x.agony) {
    // à l'agonie : chaque coup peut être le dernier
    const p = clamp(.55 - x.res / 300, .25, .7);
    if (x.cheat > 0) { x.cheat--; ev.push({ k: "cheat", u: x.uid }); return 0; }
    if (chance(p)) { fallHero(B, x, ev); } else ev.push({ k: "resist_death", u: x.uid });
    return 0;
  }
  x.hp -= d;
  if (x.hp <= 0) {
    if (x.side === "h") { x.hp = 0; x.agony = true; ev.push({ k: "agony", u: x.uid }); changeMorale(B, -8, ev); }
    else { x.hp = 0; x.dead = true; B.kills++; ev.push({ k: "die", u: x.uid, boss: x.boss }); B.enemies = B.enemies.filter(e => e !== x); B.dead = (B.dead || []).concat([x]);
      if (src && src.side === "h") { src.kills = (src.kills || 0) + 1; changeMorale(B, 5 + (src.hooks.killMorale || 0), ev); if (src.hooks.killStealth) addSt(B, src, src, { k: "stealth", t: 1 }, ev); if (B.relicH.killHeal) healUnit(B, src, src, src.hpMax * B.relicH.killHeal, ev); gainUlt(src, 10); }
    }
  } else if (x.phase && !x.phaseDone && x.hp / x.hpMax < x.phase.at) {
    x.phaseDone = true; ev.push({ k: "phase", u: x.uid, text: x.phase.n }); for (const f of x.phase.sfx) x.st.push(Object.assign({}, f));
  }
  return Math.min(d, before);
}
function fallHero(B, x, ev) {
  if (B.relicH.revive && !B.revived) { B.revived = 1; x.agony = false; x.hp = Math.round(x.hpMax * B.relicH.revive); ev.push({ k: "revive", u: x.uid }); return; }
  x.fallen = true; x.agony = false; x.hp = 0; B.heroes = B.heroes.filter(h => h !== x); B.fallen.push(x);
  ev.push({ k: "fall", u: x.uid });
  changeMorale(B, -15, ev);
  for (const h of B.heroes) if (h.hooks.fearful) changeMorale(B, -6, ev);
}
function reviveFallen(B, frac, ev) {
  for (const x of B.fallen.splice(0)) { x.fallen = false; x.hp = Math.round(x.hpMax * frac); x.st = []; B.heroes.push(x); ev.push({ k: "revive", u: x.uid }); }
}
function healUnit(B, src, x, v, ev, o = {}) {
  if (!alive(x)) return;
  let h = v * (src && !o.leech ? src.healPow : 1) * (1 + (x.hooks.healTaken || 0));
  h = Math.max(1, Math.round(h));
  const room = x.hpMax - x.hp, real = Math.min(room, h);
  x.hp += real;
  if (x.agony && x.hp > 0) { x.agony = false; ev.push({ k: "saved", u: x.uid }); }
  if (real > 0 || !o.regen) ev.push({ k: "heal", u: x.uid, v: real, regen: !!o.regen, leech: !!o.leech });
  if (src && src.hooks.overhealShield && h > real) addSt(B, src, x, { k: "shield", v: (h - real) * src.hooks.overhealShield, t: 2 }, ev);
}
function cleanse(x, ev) { const n = x.st.length; x.st = x.st.filter(s => !NEG.has(s.k)); if (x.st.length < n) ev.push({ k: "cleanse", u: x.uid }); }
function applyFx(B, u, x, fx, ev, rk = 1) {
  if (!fx) return;
  for (const f of fx) addSt(B, u, x, f, ev, rk);
}
function addSt(B, u, x, f, ev, rk = 1) {
  if (!alive(x)) return;
  const neg = NEG.has(f.k);
  if (neg && u && u.side !== x.side) {
    const ch = (f.ch == null ? 1 : f.ch) * (1 + (u.hooks.debuffPow || 0)) - x.res / 100 * (f.k === "stun" ? 1.1 : .8);
    if (!chance(clamp(ch, .05, .97))) { ev.push({ k: "resist", u: x.uid, st: f.k }); return; }
  } else if (f.ch != null && f.ch < 1 && !chance(f.ch)) return;
  const s = { k: f.k, t: f.t || 1 };
  if (DOTS.includes(f.k)) {
    const pw = 1 + (u ? (u.hooks.dotPow || 0) + (f.k === "burn" ? u.hooks.burnPow || 0 : 0) : 0) + (u && u.side === "h" ? B.relicH.dot || 0 : 0);
    s.v = Math.max(1, (f.v || .4) * (u ? avgDmg(u) : 3) * pw * rk);
    if (u && u.side === "h") s.t += (f.k === "bleed" ? B.relicH.bleedT || 0 : f.k === "burn" ? B.relicH.burnT || 0 : B.relicH.poisonT || 0);
    if (f.k === "bleed" && x.hooks.bleedTaken) s.t += x.hooks.bleedTaken;
    if (x.st.filter(z => z.k === f.k).length >= 4) { const old = x.st.find(z => z.k === f.k); x.st.splice(x.st.indexOf(old), 1); }
  } else if (f.k === "shield") s.v = x.hpMax * f.v * rk * (1 + (u ? u.hooks.shieldPow || 0 : 0));
  else if (f.k === "regen") s.v = f.v * rk;
  else if (f.v != null) s.v = f.v * (neg ? 1 : (1 + (u && u !== x ? u.hooks.buffPow || 0 : 0)));
  if (f.k === "stun" && hasSt(x, "stun")) return;
  const same = !DOTS.includes(f.k) && f.k !== "shield" && f.k !== "guarded" && x.st.find(z => z.k === f.k);
  if (same) { same.t = Math.max(same.t, s.t); if (s.v != null) same.v = Math.max(same.v || 0, s.v); }
  else x.st.push(s);
  ev.push({ k: "st", u: x.uid, st: f.k });
}
function detonate(B, u, x, sk, ev) {
  const stacks = x.st.filter(s => s.k === sk.det); if (!stacks.length) return;
  const tot = stacks.reduce((a, s) => a + s.v * s.t, 0) * (sk.detX || 1);
  x.st = x.st.filter(s => s.k !== sk.det);
  ev.push({ k: "detonate", u: x.uid, st: sk.det });
  applyDamage(B, u, x, Math.max(1, Math.round(tot)), ev, { crit: true });
}
function moveUnit(B, x, delta, ev) {
  // delta < 0 : vers l'avant (rang 1)
  const arr = sideArr(B, x.side), i = arr.indexOf(x); if (i < 0) return;
  const j = clamp(i + delta, 0, arr.length - 1); if (i === j) return;
  arr.splice(i, 1); arr.splice(j, 0, x);
  ev.push({ k: "move", side: x.side, u: x.uid });
}
function swapHero(B, u, dir) { const ev = [{ k: "act", u: u.uid, sk: dir < 0 ? "Avancer" : "Reculer", anim: "move" }]; moveUnit(B, u, dir, ev); gainUlt(u, 5); return ev; }
function changeMorale(B, v, ev) { const o = B.morale; B.morale = clamp(B.morale + v, 0, 100); if (Math.round(B.morale) !== Math.round(o)) ev.push({ k: "morale", v: B.morale, d: v }); }

// ── compagnon ──
function petAct(B, ev, extra) {
  const P = B.pet; if (!P || B.over) return;
  const D = PETS[P.id]; P.n++;
  let sk = D.sk[0];
  if (!extra && D.sk[1] && P.n % (D.sk[1].every || 3) === 0) sk = D.sk[1];
  if (P.evo && !extra && P.n % 2 === 0) sk = D.evo.sk;
  if (extra) sk = D.sk.find(s => s.m) || D.evo.sk;
  const fake = { uid: "PET", side: "h", name: petName(P.id), dmgLo: P.pw.dmg * .8, dmgHi: P.pw.dmg * 1.2, crit: 8, acc: 98, hooks: {}, st: [], healPow: P.pw.heal, sz: 1, leech: 0, tags: ["bete"] };
  const boost = 1 + (B.heroes.reduce((a, h) => a + (h.hooks.petDmg || 0), 0)) + (B.relicH.pet || 0);
  fake.dmgLo *= boost; fake.dmgHi *= boost;
  ev.push({ k: "pet", sk: sk.n, t: sk.t });
  const allies = B.heroes.filter(alive);
  const low = allies.slice().sort((a, b) => a.hp / a.hpMax - b.hp / b.hpMax)[0];
  if (sk.t === "low" && low) {
    if (sk.heal) healUnit(B, fake, low, low.hpMax * sk.heal, ev);
    if (sk.regen) addSt(B, fake, low, { k: "regen", v: sk.regen, t: 2 }, ev);
    if (sk.shield) addSt(B, fake, low, { k: "shield", v: sk.shield, t: 2 }, ev);
    if (sk.light && B.opt.onLight) B.opt.onLight(sk.light);
    return;
  }
  if (sk.t === "aa") {
    for (const a of allies) { if (sk.heal) healUnit(B, fake, a, a.hpMax * sk.heal, ev); if (sk.shield) addSt(B, fake, a, { k: "shield", v: sk.shield, t: 2 }, ev); }
    if (sk.afx) for (const a of allies) applyFx(B, fake, a, sk.afx.map(f => Object.assign({ ch: 1 }, f)), ev);
    if (sk.cleanse1 && low) cleanse(low, ev);
    if (sk.light && B.opt.onLight) B.opt.onLight(sk.light);
    return;
  }
  const foes = B.enemies.filter(e => alive(e) && occupies(B, e, sk.at || [1, 2, 3, 4]));
  if (!foes.length) return;
  const tg = sk.t === "ae" ? foes : [foes.sort((a, b) => a.hp - b.hp)[0]];
  for (const x of tg) {
    if (sk.m) { const ok = strike(B, fake, x, { m: sk.m, cr: sk.cr, t: sk.t }, sk.m, ev); if (ok && sk.leechLow && low) { healUnit(B, null, low, avgDmg(fake) * sk.m * sk.leechLow, ev); } if (ok) applyFx(B, fake, x, sk.fx, ev); }
    else applyFx(B, fake, x, sk.fx, ev);
  }
  checkEnd(B);
}

// ── intelligence des ennemis ──
function planIntents(B) {
  for (const e of B.enemies.filter(alive)) e.intent = chooseEnemyAction(B, e);
}
function chooseEnemyAction(B, e) {
  const hurtAlly = B.enemies.some(a => alive(a) && a.hp / a.hpMax < .65);
  const opts = e.skills.filter(sk => {
    if (e.cds[sk.id] > 0) return false;
    const t = sk.t || "e";
    if (t === "allies") return hurtAlly;
    if (t === "self") return !(sk.sfx || []).every(f => hasSt(e, f.k)) || (sk.heal && e.hp / e.hpMax < .7);
    return validTargets(B, e, sk).length > 0;
  });
  if (!opts.length) return { sk: null };
  const sk = RNG.weighted(opts, s => (s.w || 1) * ((s.t === "allies" || s.t === "self") ? 1.2 : 1));
  let tgt = null;
  if ((sk.t || "e") === "e") {
    const vt = validTargets(B, e, sk);
    const prov = vt.filter(h => hasSt(h, "prov"));
    if (prov.length && chance(.75)) tgt = prov[0];
    else tgt = RNG.weighted(vt, h => 1 + (h.agony ? 1.4 : 0) + (1 - h.hp / h.hpMax) * .8 + (hasSt(h, "mark") ? 1 : 0));
  }
  return { sk, tgt: tgt && tgt.uid };
}
function enemyTurn(B, e) {
  let it = e.intent && e.intent.sk ? e.intent : chooseEnemyAction(B, e);
  if (!it.sk) return [{ k: "act", u: e.uid, sk: "Attend", anim: "idle" }];
  let tgt = it.tgt ? unitById(B, it.tgt) : null;
  if ((it.sk.t || "e") === "e") { const vt = validTargets(B, e, it.sk); if (!tgt || !vt.includes(tgt)) { if (!vt.length) { it = chooseEnemyAction(B, e); if (!it.sk) return [{ k: "act", u: e.uid, sk: "Attend", anim: "idle" }]; } tgt = it.tgt ? unitById(B, it.tgt) : null; } }
  if (it.sk.cd) e.cds[it.sk.id] = it.sk.cd + 1;
  return act(B, e, it.sk, tgt);
}
// IA simple pour les héros (mode automatique et bots de test)
function heroAuto(B, u, style = "bal") {
  const usable = u.skills.filter(sk => canUse(B, u, sk));
  if (u.ultV >= 100) { const ult = u.ult; const vt = validTargets(B, u, ult); return { sk: ult, tgt: (ult.t === "e" ? vt.sort((a, b) => a.hp - b.hp)[0] : vt[0]) || null }; }
  if (!usable.length) { const r = rankOf(B, u); const pref = CLASSES[u.cls].rk; return { move: pref[0] < r ? -1 : 1 }; }
  const allies = B.heroes.filter(alive), foes = B.enemies.filter(alive);
  let best = null, bs = -1e9;
  for (const sk of usable) {
    const t = sk.t || "e"; const vt = validTargets(B, u, sk);
    let sc = 0, tgt = vt[0];
    if (sk.heal || sk.cleanse || sk.healSelf) {
      const low = allies.slice().sort((a, b) => a.hp / a.hpMax - b.hp / b.hpMax)[0];
      const need = 1 - low.hp / low.hpMax + (low.agony ? 1.2 : 0);
      if (t === "aa") { const tot = allies.reduce((a, h) => a + (1 - h.hp / h.hpMax) + (h.agony ? .8 : 0), 0); sc = tot * 45 * sk.heal * 4; }
      else { sc = need * 60 * sk.heal * 3.5; tgt = t === "a" ? vt.sort((a, b) => a.hp / a.hpMax - b.hp / b.hpMax)[0] : tgt; }
      if (sk.cleanse) sc += allies.reduce((a, h) => a + h.st.filter(s => DOTS.includes(s.k)).length, 0) * 6;
      if (need < .25 && t !== "aa") sc -= 25;
    }
    if (sk.m > 0) {
      const n = t === "ae" ? vt.length : 1;
      sc += sk.m * n * (sk.hits || 1) * 22 * (style === "agr" ? 1.2 : 1);
      if (t === "e") { tgt = vt.slice().sort((a, b) => (a.hp - (hasSt(a, "mark") ? 30 : 0)) - (b.hp - (hasSt(b, "mark") ? 30 : 0)))[0]; if (sk.bonus && sk.bonus.low && tgt.hp / tgt.hpMax < sk.bonus.low) sc *= sk.bonus.x; if (sk.bonus && sk.bonus.st && hasSt(tgt, sk.bonus.st)) sc *= 1.5; if (tgt.hp <= u.dmgHi * sk.m) sc += 12; }
      if (sk.det && tgt && hasSt(tgt, sk.det)) sc += 25;
    }
    if (sk.fx) sc += sk.fx.length * 6 * (t === "ae" ? vt.length * .7 : 1);
    if (sk.afx) sc += sk.afx.length * 8 * (B.round <= 2 ? 1.5 : .8);
    if (sk.sfx && !sk.m) sc += sk.sfx.every(f => hasSt(u, f.k)) ? -30 : 10;
    if (sk.guard) sc += allies.some(a => a !== u && a.hp / a.hpMax < .5) ? 25 : -10;
    if (sk.selfDmg) sc -= u.hp / u.hpMax < .5 ? 40 : 5;
    if (sc > bs) { bs = sc; best = { sk, tgt }; }
  }
  return best;
}
