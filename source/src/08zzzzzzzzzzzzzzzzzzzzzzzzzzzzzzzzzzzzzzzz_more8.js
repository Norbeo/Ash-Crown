// ── 20 nov. (soir) : duos de mécaniques, compétences signatures, rivaux, défis de combat, cicatrices, événements de combat ──

// 1 · Duos de mécaniques : deux classes dont les mécaniques se répondent (affichés avec les synergies)
const MECH_DUOS = {
  duo_peste_maudite: { n: "Peste maudite", need: [["sorciere"], ["medecin_peste"]], d: "Chaque poison du Médecin de peste maudit aussi la cible (Malédiction de la Sorcière)." },
  duo_bucher: { n: "Bûcher des sorcières", need: [["pyromancien"], ["chasseur_sorcieres"]], d: "Tout le groupe inflige +15 % de dégâts aux ennemis qui brûlent." },
  duo_hymne: { n: "Hymne de la foi", need: [["menestrel"], ["pretresse"]], d: "Le Refrain du Ménestrel soigne aussi tout le groupe de 4 % de ses PV max." },
  duo_rempart: { n: "Rempart d'acier", need: [["templier"], ["hallebardier"]], d: "Bouclier de foi à 15 % des PV max, Garde d'allonge à 40 % de chance." },
  duo_ombres: { n: "Ombres jumelles", need: [["ombre"], ["arbaletriere"]], d: "Le premier tir de l'Arbalétrière est aussi un critique garanti ; Visée posée passe à +40 %." },
  duo_moisson: { n: "Moisson sanglante", need: [["necromancien"], ["berserker"]], d: "Chaque âme du Nécromancien donne aussi +3 % de dégâts au Berserker." },
  duo_rune_benie: { n: "Rune bénie", need: [["gardien_runes"], ["exorciste"]], d: "La Rune gravée étourdit à coup sûr et rend la cible vulnérable." },
  duo_faucheuse: { n: "Le spectre et la faucheuse", need: [["revenant"], ["necromancien"]], d: "Quand le Revenant refuse de mourir, le Nécromancien gagne 2 âmes ; chaque âme donne +4 % de dégâts au Revenant." }
};
for (const k in MECH_DUOS) SYNERGIES[k] = Object.assign({ h: {}, duo: 1 }, MECH_DUOS[k]); // listés, comptés et affichés comme les autres synergies
const duoOn = (B, k) => { if (!B || !B.heroes) return false; if (!B._dz) B._dz = new Set(activeSynergies(B.heroes.map(h => h.cls)).filter(x => MECH_DUOS[x])); return B._dz.has(k); };

{ const sm = strikeMul; strikeMul = function (B, u, x, sk, ev) {
  let d = sm.apply(this, arguments);
  if (!u || u.side !== "h" || u.uid === "PET" || !x) return d;
  if (duoOn(B, "duo_bucher") && hasSt(x, "burn")) d *= 1.15;
  if (u.cls === "arbaletriere" && !u.hitSince && duoOn(B, "duo_ombres")) d *= 1.4 / 1.25;
  if (u.cls === "berserker" && duoOn(B, "duo_moisson")) { const n = B.heroes.find(h => h.cls === "necromancien"); if (n && n._souls) d *= 1 + .03 * n._souls; }
  if (u.cls === "revenant" && duoOn(B, "duo_faucheuse")) { const n = B.heroes.find(h => h.cls === "necromancien"); if (n && n._souls) d *= 1 + .04 * n._souls; }
  return d;
}; }
{ const st0 = strike; strike = function (B, u, x, sk, mult, ev) {
  let c0 = null; if (u && u.cls === "arbaletriere" && u.side === "h" && !u._amb2 && duoOn(B, "duo_ombres")) { u._amb2 = 1; c0 = u.crit; u.crit = 999; cmPop(ev, u, "Ombres jumelles !"); }
  const runeArmed = u && u.cls === "gardien_runes" && u._rune && duoOn(B, "duo_rune_benie");
  const r = st0.apply(this, arguments);
  if (c0 != null) u.crit = c0;
  if (runeArmed && r && x && alive(x)) { if (!hasSt(x, "stun")) addSt(B, u, x, { k: "stun", t: 1 }, ev); addSt(B, u, x, { k: "vuln", t: 2 }, ev); }
  return r;
}; }
{ const bt = beginTurn; beginTurn = function (B, u) {
  const ev = bt.apply(this, arguments);
  if (u && u.side === "h" && alive(u) && !u.skip) {
    if (u.cls === "menestrel" && duoOn(B, "duo_hymne")) for (const h of B.heroes.filter(alive)) healUnit(B, null, h, h.hpMax * .04, ev, { regen: 1 });
    if (u.cls === "templier" && duoOn(B, "duo_rempart")) { const s = B.heroes.flatMap(h => h.st).filter(s => s.k === "shield").pop(); if (s) s.v = Math.round(s.v * 1.5); }
  }
  return ev;
}; }
{ const as = addSt0; addSt0 = function (B, u, x, f, ev, rk) {
  const r = as.apply(this, arguments);
  if (u && u.cls === "medecin_peste" && u.side === "h" && x && x.side === "e" && f && f.k === "poison" && duoOn(B, "duo_peste_maudite") && (x._curse || 0) < 3) { x._curse = (x._curse || 0) + 1; cmPop(ev, x, "Peste maudite ×" + x._curse, "#a0e070"); }
  return r;
}; }
{ const ad = applyDamage; applyDamage = function (B, src, x, d, ev, o = {}) {
  const und0 = x && x._und; if (B) B._lastSrc = src;
  const r = ad.apply(this, arguments);
  if (x && x.cls === "revenant" && !und0 && x._und && duoOn(B, "duo_faucheuse")) { const n = B.heroes.find(h => h.cls === "necromancien" && alive(h)); if (n) { n._souls = Math.min(5, (n._souls || 0) + 2); cmPop(ev, n, "Âmes +2", "#b48aff"); } }
  // garde d'allonge renforcée (rempart d'acier) : seconde chance de riposte
  if (x && x.side === "h" && src && src.side === "e" && !o.dot && alive(src) && r > 0 && duoOn(B, "duo_rempart")) { const hb = B.heroes.find(h => h.cls === "hallebardier" && alive(h) && !h.agony && h._hg !== B.round + ":" + B.turn); if (hb && chance(.2)) { hb._hg = B.round + ":" + B.turn; cmPop(ev, hb, "Garde d'allonge", "#e0d0a0"); counter(B, hb, src, .5, ev); } }
  // rivaux : l'ennemi juré meurt → vengeance
  if (x && x.nem && x.dead && !x._nemDone) { x._nemDone = 1; const N = S.nemesis; if (ev) ev.push({ k: "phase", u: x.uid, text: "Vengeance ! " + (N ? N.victim + " est vengé." : "") }); if (S.run) { S.run.gold += N ? N.gold : 200; S.run.nemKill = 1; } S.nemesisLog = (S.nemesisLog || 0) + 1; S.nemesis = null; }
  return r;
}; }

// 2 · Compétences signatures : les attaques « simples » prennent la marque de leur classe
const SIG_FX = {
  berserker: { fendoir: { fx: [{ k: "bleed", v: .3, t: 2, ch: .6 }] }, tourbillon: { sfx: [{ k: "dmgUp", v: .1, t: 2 }] } },
  ombre: { dague: { bonus: { st: "mark", x: 1.4 } }, couteaux: { fx: [{ k: "poison", v: .25, t: 2, ch: .5 }] }, lame_cachee: { cr: 15, fx: [{ k: "bleed", v: .35, t: 2, ch: .7 }] }, saigner_ombre: { fx: [{ k: "dodgeDn", v: 10, t: 2, ch: .8 }] } },
  arbaletriere: { carreau: { fx: [{ k: "mark", t: 2, ch: .5 }] }, pluie: { fx: [{ k: "spdDn", v: 2, t: 2, ch: .4 }] }, tir_tete: { bonus: { low: .4, x: 1.5 } }, meute: { fx: [{ k: "vuln", t: 2, ch: .4 }] } },
  hallebardier: { taille: { fx: [{ k: "bleed", v: .3, t: 2, ch: .5 }] }, estoc_long: { fx: [{ k: "protDn", v: .1, t: 2, ch: .7 }] }, moulinet: { fx: [{ k: "weak", t: 2, ch: .4 }] }, coup_boucher: { bonus: { low: .35, x: 1.6 } } },
  sorciere: { putrefaction: { fx: [{ k: "poison", v: .4, t: 3, ch: .9 }] } },
  necromancien: { nuee_os: { fx: [{ k: "vuln", t: 2, ch: .3 }] } },
  medecin_peste: { elixir: { fx: [{ k: "poison", v: .45, t: 3, ch: 1 }] } }
};
for (const c in SIG_FX) { const C = CLASSES[c]; if (!C) continue; const pools = [C.skills].concat(Object.values(C.evos || {}).map(e => e.skills || {}));
  for (const id in SIG_FX[c]) for (const P of pools) if (P[id]) { const s = P[id], g = SIG_FX[c][id]; if (g.fx) s.fx = (s.fx || []).concat(g.fx); if (g.sfx) s.sfx = (s.sfx || []).concat(g.sfx); if (g.bonus && !s.bonus) s.bonus = g.bonus; if (g.cr) s.cr = (s.cr || 0) + g.cr; s.sig = 1; } }

// 3 · Rivaux : l'ennemi qui achève un héros revient plus tard, nommé, plus fort — l'abattre venge le héros (gros butin)
const NEM_TITLES = ["le Fossoyeur", "l'Égorgeur", "le Charognard", "la Mauvaise Étoile", "le Rancunier", "le Dévoreur", "l'Implacable", "le Boucher"];
{ const fh = fallHero; fallHero = function (B, x, ev, worn) {
  const r = fh.apply(this, arguments);
  try { const s = B && B._lastSrc; if (s && s.side === "e" && !s.boss && !s.nem && S && S.run && S.run.region !== "abime" && !B.opt.sim0 && MONSTERS[s.key]) {
    const t = NEM_TITLES[Math.floor(rnd() * NEM_TITLES.length)], lvl = s.lvl || 1;
    S.nemesis = { key: s.key, n: (MONSTERS[s.key].n || s.name) + " " + t, victim: x.name, region: S.run.region, lvl, gold: Math.round(120 + lvl * 25) };
    if (ev) ev.push({ k: "phase", u: s.uid, text: `${s.name} devient votre ennemi juré` }); } } catch (e) { }
  return r;
}; }
{ const nb = newBattle; newBattle = function (heroes, enemyKeys, opt = {}) {
  const B = nb.apply(this, arguments);
  try { const N = S && S.nemesis, run = S && S.run; if (N && run && run.region === N.region && !B.enemies.some(e => e.boss) && B.enemies.length && rnd() < .3 && MONSTERS[N.key]) {
    const m = monUnit(N.key, N.lvl + 2, B.mods || {}); m.hpMax = m.hp = Math.round(m.hpMax * 1.4); m.dmgLo *= 1.2; m.dmgHi *= 1.2; m.name = N.n; m.nem = 1; m.elite = true;
    B.enemies[0] = m; B.nemesisIn = 1; } } catch (e) { }
  return B;
}; }

// 4 · Défis de combat plus fréquents et plus variés
Object.assign(CHALLENGES, {
  blitz: { n: "Éclair", d: "Gagner en 4 tours ou moins.", ok: B => B.round <= 4 },
  noult: { n: "Sans ultime", d: "Gagner sans utiliser d'ultime.", ok: B => !B.ults && !B.ultUsed },
  allhit: { n: "Tous au combat", d: "Chaque héros inflige des dégâts.", ok: B => { const T = B.tally && B.tally.dmg || {}; return B.heroes.every(h => (T[h.hid] || 0) > 0); } },
  full: { n: "Indemnes", d: "Finir le combat avec tous les héros au-dessus de 50 % de PV.", ok: B => B.heroes.every(h => alive(h) && h.hp / h.hpMax > .5) }
});
{ const a0 = act; act = function (B, u, sk) { if (sk && sk.isUlt && u && u.side === "h") B.ultUsed = 1; return a0.apply(this, arguments); }; }

// 5 · Cicatrices : survivre à l'agonie marque un héros pour toujours (petit bonus, et une histoire)
const SCARS = [
  { k: "sc_gorge", n: "Gorge balafrée", d: "+4 de résistance", st: "res", v: 4 },
  { k: "sc_oeil", n: "Œil crevé", d: "+4 % de chance critique", st: "crit", v: 4 },
  { k: "sc_cotes", n: "Côtes brisées", d: "+5 % de PV max", st: "hp", v: .05 },
  { k: "sc_main", n: "Main mutilée", d: "+5 d'esquive", st: "dodge", v: 5 },
  { k: "sc_brule", n: "Grand brûlé", d: "+3 % de protection", st: "prot", v: .03 },
  { k: "sc_survivant", n: "Revenu d'entre les morts", d: "+5 % de dégâts", st: "dmg", v: .05 }
];
function scarsOf(h) { return (h && h.scars || []).map(k => SCARS.find(s => s.k === k)).filter(Boolean); }
if (typeof PAS_HOOKS !== "undefined") PAS_HOOKS.push(h => scarsOf(h).map(s => ({ k: "stat", s: s.st, v: s.v })));
{ const sb = typeof stressAfterBattle === "function" ? stressAfterBattle : null;
  const scarCheck = B => { if (!B || B.over !== "win" || !S) return; for (const u of B.heroes) { if (!u.agonyN || !alive(u)) continue; const h = heroById(u.hid); if (!h) continue; h.scars = h.scars || []; if (h.scars.length >= 3 || rnd() > .4) continue;
    const free = SCARS.filter(s => !h.scars.includes(s.k)); if (!free.length) continue; const s = free[Math.floor(rnd() * free.length)]; h.scars.push(s.k); (B.newScars = B.newScars || []).push({ name: h.name, n: s.n, d: s.d }); } };
  if (sb) stressAfterBattle = function (run, B) { const r = sb.apply(this, arguments); try { scarCheck(B); } catch (e) { } return r; };
  else if (typeof afterBattle === "function") { const ab = afterBattle; afterBattle = function (run, B) { const r = ab.apply(this, arguments); try { scarCheck(B); } catch (e) { } return r; }; } }

// 6 · Événements de combat : un choix au milieu du combat (interface seulement ; les bots ne les voient pas)
const COMBAT_EVENTS = [
  { k: "autel", t: "Un autel oublié s'allume", c: [
    { n: "Prier", d: "Soigne le groupe de 15 %", f: B => { for (const h of B.heroes.filter(alive)) healUnit(B, null, h, h.hpMax * .15, []); } },
    { n: "Profaner", d: "+20 % de dégâts 3 tours, −5 résolution", f: B => { for (const h of B.heroes.filter(alive)) h.st.push({ k: "dmgUp", v: .2, t: 3 }); changeMorale(B, -5, []); } }] },
  { k: "breche", t: "Une brèche dans leur garde", c: [
    { n: "Viser le chef", d: "L'ennemi le plus solide devient vulnérable 3 tours", f: B => { const e = B.enemies.filter(alive).sort((a, b) => b.hp - a.hp)[0]; if (e) addSt(B, null, e, { k: "vuln", t: 3 }, []); } },
    { n: "Achever les faibles", d: "Les ennemis sous 40 % de PV perdent 15 % de leurs PV max", f: B => { for (const e of B.enemies.filter(alive)) if (e.hp / e.hpMax < .4) applyDamage(B, null, e, e.hpMax * .15, [], { dot: 1 }); } }] },
  { k: "renfort", t: "Des pas lourds approchent", c: [
    { n: "Tenir la ligne", d: "+15 % de protection 3 tours", f: B => { for (const h of B.heroes.filter(alive)) h.st.push({ k: "protUp", v: .15, t: 3 }); } },
    { n: "Frapper vite", d: "+3 de vitesse et +10 % de dégâts 2 tours", f: B => { for (const h of B.heroes.filter(alive)) h.st.push({ k: "spdUp", v: 3, t: 2 }, { k: "dmgUp", v: .1, t: 2 }); } }] },
  { k: "lueur", t: "Une lueur d'espoir", c: [
    { n: "Rassembler les forces", d: "+25 de jauge d'ultime pour tous", f: B => { for (const h of B.heroes.filter(alive)) gainUlt(h, 25); } },
    { n: "Chanter", d: "+12 de résolution", f: B => changeMorale(B, 12, []) }] },
  { k: "sol", t: "Le sol se fend sous leurs pieds", c: [
    { n: "Pousser", d: "Étourdit l'ennemi de tête (70 %)", f: B => { const e = B.enemies.filter(alive)[0]; if (e && chance(.7)) addSt(B, null, e, { k: "stun", t: 1 }, []); } },
    { n: "Reculer", d: "Soigne le groupe de 8 % et +10 d'esquive 2 tours", f: B => { for (const h of B.heroes.filter(alive)) { healUnit(B, null, h, h.hpMax * .08, []); h.st.push({ k: "dodgeUp", v: 10, t: 2 }); } } }] }
];
{ const sr = startRound; startRound = function (B) {
  const r = sr.apply(this, arguments);
  if (B && B.round === 3 && !B.cevtDone && typeof document !== "undefined" && typeof cevtShow === "function" && !B.enemies.some(e => e.boss) && rnd() < .35) { B.cevtDone = 1; try { cevtShow(B, COMBAT_EVENTS[Math.floor(rnd() * COMBAT_EVENTS.length)]); } catch (e) { } }
  return r;
}; }
