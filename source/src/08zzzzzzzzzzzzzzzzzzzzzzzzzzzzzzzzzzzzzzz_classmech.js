// ── Mécaniques de classe (20 nov.) : chaque classe a un trait de combat qui n'appartient qu'à elle ──
// Toujours actif, visible en combat (texte qui s'affiche) et décrit sur la fiche du héros et dans le glossaire.
const CLASS_MECH = {
  templier: { n: "Bouclier de foi", d: "Au début de chacun de ses tours, place un bouclier de 10 % de ses PV max sur l'allié le plus blessé." },
  revenant: { n: "Refus de mourir", d: "La première fois qu'il devrait tomber à l'agonie dans un combat, il se relève aussitôt avec 30 % de ses PV." },
  pretresse: { n: "Grâce", d: "Ses soins sur un allié sous 35 % de PV sont augmentés de 50 % et retirent ses altérations." },
  sorciere: { n: "Malédiction", d: "Chaque altération qu'elle pose sur un ennemi le maudit : +8 % de dégâts subis par malédiction (jusqu'à 3)." },
  menestrel: { n: "Refrain", d: "Au début de chacun de ses tours, tout le groupe gagne +10 % de dégâts et +5 de précision pendant 2 tours." },
  berserker: { n: "Soif de sang", d: "+2 % de dégâts par tranche de 10 % de PV manquants (jusqu'à +18 %) ; sous 50 % de PV, il récupère 10 % des dégâts infligés." },
  ombre: { n: "Embuscade", d: "Sa première attaque de chaque combat est un coup critique garanti ; chaque ennemi abattu lui donne +20 d'esquive pendant 2 tours." },
  arbaletriere: { n: "Visée posée", d: "Si elle n'a pas été frappée depuis son dernier tour, ses tirs font +25 % de dégâts et gagnent +10 de précision." },
  pyromancien: { n: "Embrasement", d: "Ses coups ont 25 % de chance d'enflammer la cible ; il inflige +20 % de dégâts aux ennemis qui brûlent." },
  necromancien: { n: "Moisson d'âmes", d: "Chaque ennemi qui meurt lui donne une âme (jusqu'à 5) : +6 % de dégâts par âme jusqu'à la fin du combat." },
  gardien_runes: { n: "Rune gravée", d: "Un tour sur trois, son coup suivant libère une rune qui étourdit la cible (70 %)." },
  medecin_peste: { n: "Contagion", d: "Quand un ennemi empoisonné meurt, son poison se propage à un autre ennemi." },
  chasseur_sorcieres: { n: "Traque", d: "+25 % de dégâts contre les élites et les gardiens, et contre tout ennemi sous 30 % de PV." },
  hallebardier: { n: "Garde d'allonge", d: "Quand un ennemi frappe un allié, il a 25 % de chance de riposter avec sa hallebarde (50 % de ses dégâts) (une fois par tour)." },
  exorciste: { n: "Bannissement", d: "Ses coups ignorent la moitié de la protection ennemie et font +20 % de dégâts aux créatures impies." }
};
function classMech(cls) { return CLASS_MECH[cls] || null; }
const CM_COL = "#ffd27a";
const cmPop = (ev, u, txt, c) => { if (ev) ev.push({ k: "cls", u: u.uid, txt, c: c || CM_COL }); };
const cmIs = (u, c) => u && u.side === "h" && u.cls === c && u.uid !== "PET";

// multiplicateurs de dégâts
{ const sm = strikeMul; strikeMul = function (B, u, x, sk, ev) {
  let d = sm.apply(this, arguments);
  if (!u || u.side !== "h" || u.uid === "PET" || !x) return d;
  const c = u.cls;
  if (c === "berserker") d *= 1 + Math.min(.18, Math.floor((1 - u.hp / u.hpMax) * 10) * .02);
  else if (c === "arbaletriere" && !u.hitSince) d *= 1.25;
  else if (c === "pyromancien" && hasSt(x, "burn")) d *= 1.2;
  else if (c === "necromancien" && u._souls) d *= 1 + .06 * u._souls;
  else if (c === "chasseur_sorcieres" && (x.boss || x.elite || x.hp / x.hpMax < .3)) d *= 1.25;
  else if (c === "exorciste" && x.tags && x.tags.includes("impie")) d *= 1.2;
  if (x._curse) d *= 1 + .08 * x._curse; // malédictions de la sorcière (profitent à tout le groupe)
  return d;
}; }

// frappe : embuscade, visée, protection ignorée, rune, embrasement, soif de sang
{ const st0 = strike; strike = function (B, u, x, sk, mult, ev) {
  if (!u || u.side !== "h" || u.uid === "PET" || !x) return st0.apply(this, arguments);
  const c = u.cls; let crit0 = null, acc0 = null, prot0 = null;
  if (c === "ombre" && !u._amb) { u._amb = 1; crit0 = u.crit; u.crit = 999; cmPop(ev, u, "Embuscade !"); }
  if (c === "arbaletriere" && !u.hitSince) { acc0 = u.acc; u.acc += 10; }
  if (c === "exorciste") { prot0 = x.prot; x.prot = (x.prot || 0) * .5; }
  const hp0 = x.hp, r = st0.apply(this, arguments);
  if (crit0 != null) u.crit = crit0; if (acc0 != null) u.acc = acc0; if (prot0 != null && x) x.prot = prot0;
  if (!r) return r;
  if (c === "pyromancien" && alive(x) && chance(.25)) { addSt(B, u, x, { k: "burn", v: avgDmg(u) * .3, t: 2 }, ev); cmPop(ev, x, "Embrasement", "#ff8a3a"); }
  if (c === "gardien_runes" && u._rune && alive(x)) { u._rune = 0; cmPop(ev, x, "Rune !", "#8ad0ff"); if (chance(.7)) addSt(B, u, x, { k: "stun", t: 1 }, ev); }
  if (c === "berserker" && u.hp / u.hpMax < .5 && alive(u)) { const dealt = Math.max(0, hp0 - Math.max(0, x.hp)); if (dealt > 0) healUnit(B, u, u, dealt * .1, ev, { leech: 1 }); }
  return r;
}; }

// début de tour : bouclier de foi, refrain, rune
{ const bt = beginTurn; beginTurn = function (B, u) {
  const ev = bt.apply(this, arguments);
  if (!u || u.side !== "h" || u.uid === "PET" || !alive(u) || u.skip) return ev;
  const c = u.cls;
  if (c === "templier") { const al = B.heroes.filter(h => alive(h) && !h.dead); if (al.length) { const t = al.reduce((a, b) => b.hp / b.hpMax < a.hp / a.hpMax ? b : a); addSt(B, u, t, { k: "shield", v: Math.round(u.hpMax * .1), t: 2, abs: 1 }, ev); cmPop(ev, t, "Bouclier de foi", "#c0d8ff"); } }
  if (c === "menestrel") { for (const h of B.heroes.filter(alive)) { h.st = h.st.filter(s => !s.refrain); h.st.push({ k: "dmgUp", v: .1, t: 2, refrain: 1 }, { k: "accUp", v: 5, t: 2, refrain: 1 }); } cmPop(ev, u, "Refrain : +10 % dégâts au groupe", "#e8b8ff"); }
  if (c === "gardien_runes") { u._tn = (u._tn || 0) + 1; if (u._tn % 3 === 0) { u._rune = 1; cmPop(ev, u, "Rune gravée", "#8ad0ff"); } }
  return ev;
}; }

// dégâts reçus : refus de mourir, âmes, contagion, embuscade, garde d'allonge
{ const ad = applyDamage; applyDamage = function (B, src, x, d, ev, o = {}) {
  const wasAlive = x && alive(x), poisoned = x && x.side === "e" && hasSt(x, "poison"), pz = poisoned ? x.st.filter(s => s.k === "poison").reduce((a, s) => a + s.v, 0) : 0;
  const r = ad.apply(this, arguments);
  if (!x) return r;
  if (x.side === "h" && x.cls === "revenant" && x.agony && !x._und && (x.agonyN || 0) <= 1) { x._und = 1; x.agony = false; x.agonyN = 0; x.hp = Math.max(1, Math.round(x.hpMax * .3)); cmPop(ev, x, "Refus de mourir !", "#ff6a5a"); }
  if (x.side === "e" && wasAlive && x.dead) {
    for (const h of B.heroes) if (cmIs(h, "necromancien") && alive(h) && (h._souls || 0) < 5) { h._souls = (h._souls || 0) + 1; cmPop(ev, h, "Âme " + h._souls + "/5", "#b48aff"); }
    if (src && cmIs(src, "ombre") && alive(src)) { src.st.push({ k: "dodgeUp", v: 20, t: 2 }); }
    if (poisoned && pz > 0 && B.heroes.some(h => cmIs(h, "medecin_peste") && alive(h))) { const nx = B.enemies.filter(e => alive(e) && e !== x); if (nx.length) { const t = nx[Math.floor(rnd() * nx.length)]; const md = B.heroes.find(h => cmIs(h, "medecin_peste")); addSt(B, md, t, { k: "poison", v: pz, t: 3 }, ev); cmPop(ev, t, "Contagion", "#9ae060"); } }
  }
  // garde d'allonge : un allié est frappé par un ennemi → riposte du hallebardier
  if (x.side === "h" && src && src.side === "e" && !o.dot && alive(src) && r > 0) {
    const hb = B.heroes.find(h => cmIs(h, "hallebardier") && alive(h) && !h.agony && h._hg !== B.round + ":" + B.turn);
    if (hb && chance(.25)) { hb._hg = B.round + ":" + B.turn; cmPop(ev, hb, "Garde d'allonge", "#e0d0a0"); counter(B, hb, src, .5, ev); }
  }
  return r;
}; }

// altérations posées par la sorcière : malédiction
{ const as = addSt0; addSt0 = function (B, u, x, f, ev, rk) {
  const n0 = x ? x.st.length : 0, r = as.apply(this, arguments);
  if (cmIs(u, "sorciere") && x && x.side === "e" && f && NEG.has(f.k) && x.st.length > n0 && (x._curse || 0) < 3) { x._curse = (x._curse || 0) + 1; cmPop(ev, x, "Maudit ×" + x._curse, "#c080ff"); }
  return r;
}; }

// soins de la prêtresse : grâce
{ const hu = healUnit; healUnit = function (B, src, x, v, ev, o = {}) {
  if (cmIs(src, "pretresse") && x && x.side === "h" && !o.leech && !o.regen && x.hp / x.hpMax < .35 && alive(x)) { v *= 1.5; cleanse(x, ev || []); cmPop(ev, x, "Grâce", "#fff0b0"); }
  return hu.call(this, B, src, x, v, ev, o);
}; }

// ── Compagnons plus accessibles (20 nov.) : prix −40 %, un compagnon offert à la première victoire contre chaque gardien d'histoire ──
for (const id in PETS) { const P = PETS[id]; if (P && P.cost && !P.legendary) P.cost = Math.max(100, Math.round(P.cost * .6 / 10) * 10); }
function petGiftPick() { const own = new Set(S.pets.owned); const c = PET_IDS.filter(id => !own.has(id) && !PETS[id].legendary && petUnlocked(id)); c.sort((a, b) => (PETS[a].cost || 0) - (PETS[b].cost || 0)); return c[0] || null; }
{ const er = endRun; endRun = function (outcome) {
  const res = er.apply(this, arguments);
  if (res && res.story && outcome === "victory" && S && S.pets) { const id = petGiftPick(); if (id) { S.pets.owned.push(id); if (S.pets.lvl && !S.pets.lvl[id]) S.pets.lvl[id] = 1; res.unlocks.unshift({ k: "petgift", id }); } }
  return res;
}; }

// ── Rythme (20 nov.) : le chapitre IV n'est plus un mur ; héros en retard sur le niveau conseillé = expérience de rattrapage ──
if (typeof BAL_R !== "undefined") BAL_R[3] = .95;
if (typeof DIFF_TAB !== "undefined") DIFF_TAB[3] = 1.4;
{ const gx = giveXp; giveXp = function (h, v) {
  try { const run = S && S.run; if (run && run.region && run.region !== "abime" && typeof recLevel === "function") { let rl = recLevel(run.region, run.threat || 0) || 0; for (const R of REGIONS) if (regionUnlocked(R.id)) rl = Math.max(rl, Math.max(4, R.lvl)); /* front de progression : le chapitre ouvert le plus avancé */ if (rl && h.lvl < rl) v = Math.round(v * (1 + Math.min(1.2, .3 * (rl - h.lvl)))); } } catch (e) { }
  return gx.call(this, h, v);
}; }
