/* Rendre le jeu addictif (12 nov.) — logique : connexion 7 jours, passe de saison, commandes du Bastion, série de victoires,
   contrats de chasse, salles secrètes (clés), connaissance du bestiaire, cartes de héros, album des compagnons, constellations,
   records personnels, défi hebdomadaire noté. Interface : 37z…_addict_ui.js (Carnet). */
const adDay = (t = Date.now()) => { const d = new Date(t); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); };
const adWeek = (t = Date.now()) => Math.floor((t / 864e5 + 3) / 7);
function AD() { if (!S) return {}; S.ad = S.ad || {}; const A = S.ad;
  A.login = A.login || { last: 0, streak: 0, claimed: 0 }; A.pass = A.pass || { s: 0, xp: 0, got: [] }; A.orders = A.orders || { d: 0, list: [] };
  A.buff = A.buff || []; A.streak = A.streak || 0; A.hunt = A.hunt || { w: 0, list: [], chest: 0 }; A.keys = A.keys || 0; A.mk = A.mk || {};
  A.cards = A.cards || {}; A.album = A.album || {}; A.stars = A.stars || {}; A.rec = A.rec || {}; A.weekBest = A.weekBest || {}; return A; }
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const adScale = () => typeof progressScale === "function" ? progressScale() : 1;

// ── 1. Connexion quotidienne : 7 jours, le 7e une pièce de panoplie Légendaire ──
function loginTick() { const A = AD().login, d = adDay(); if (A.last === d) return; const y = adDay(Date.now() - 864e5); A.streak = A.last === y ? A.streak % 7 + 1 : 1; A.last = d; }
function loginReward(day) { const k = adScale(); return { gold: Math.round(150 * day * k / 10) * 10, shards: day >= 3 ? Math.ceil(day / 2) : 0, essence: day >= 5 ? day : 0, set: day === 7 }; }
function loginClaim() { const A = AD().login; loginTick(); if (A.claimed === A.last) return null; const R = loginReward(A.streak); A.claimed = A.last;
  S.gold += R.gold; S.shards = (S.shards || 0) + R.shards; if (R.essence) S.mats.essence = (S.mats.essence || 0) + R.essence;
  if (R.set) { const h = S.heroes.slice().sort((a, b) => b.lvl - a.lvl)[0], kind = Math.random() < .5 ? "wpn" : "arm"; let t = 1; for (let i = 1; i < TIER_LVL.length; i++) if (h && h.lvl >= TIER_LVL[i]) t = i; if (!h || !h.evo) t = Math.min(t, 5);
    const it = makeGear(kind, h ? h.cls : pick(CLASS_IDS), t, 4, null, kind === "arm" && t >= 6 && h ? h.evo : undefined); if (typeof SETS !== "undefined") it.set = pick(Object.keys(SETS)); S.inv.push(it); R.item = it; }
  return R; }

// ── 2. Passe de saison (4 semaines, 50 paliers de 100 points) ──
const PASS_LV = 50, PASS_XP = 100;
const passSeason = () => Math.floor(adWeek() / 4);
function passAdd(n) { const P = AD().pass, s = passSeason(); if (P.s !== s) { P.s = s; P.xp = 0; P.got = []; } P.xp = Math.min(PASS_LV * PASS_XP, P.xp + n); }
const passLvl = () => Math.floor(AD().pass.xp / PASS_XP);
function passReward(l) { const k = adScale();
  if (l % 10 === 0) return { n: l === 50 ? "Coffre éternel" : l >= 40 ? "Coffre primordial" : l >= 20 ? "Coffre céleste" : "Coffre divin", item: l === 50 ? 9 : l >= 40 ? 8 : l >= 20 ? 7 : 6, gold: Math.round(800 * k * (1 + l / 10) / 10) * 10, shards: 4 + l / 5 };
  if (l % 5 === 0) return { n: "Gemmes taillées", gem: 3 + Math.floor(l / 10), gems: 2, shards: 3 };
  const T = [{ n: "Bourse", gold: 400 }, { n: "Gemme", gem: 2 }, { n: "Éclats", shards: 4 }, { n: "Tomes", tome: 2 }, { n: "Essence", essence: 8 }, { n: "Tomes de compagnon", ptome: 2 }, { n: "Grande bourse", gold: 900 }, { n: "Gemme taillée", gem: 3 }, { n: "Cendre", cendre: 5 }];
  const r = Object.assign({}, T[l % T.length]); if (r.gold) r.gold = Math.round(r.gold * k * (1 + l / 15) / 10) * 10; return r; }
function passClaim(l) { const P = AD().pass; if (l > passLvl() || P.got.includes(l)) return null; const R = passReward(l); P.got.push(l);
  if (R.gold) S.gold += R.gold; if (R.shards) S.shards = (S.shards || 0) + R.shards; if (R.tome) S.tomes = (S.tomes || 0) + R.tome; if (R.ptome) S.ptomes = (S.ptomes || 0) + R.ptome;
  if (R.essence) S.mats.essence = (S.mats.essence || 0) + R.essence; if (R.cendre) S.mats.cendre = (S.mats.cendre || 0) + R.cendre;
  if (R.gem && typeof gemAdd === "function") for (let i = 0; i < (R.gems || 1); i++) gemAdd(pick(Object.keys(GEMS)), Math.min(GEM_MAX, R.gem + Math.floor(l / 12)));
  if (R.item) { const h = S.heroes.slice().sort((a, b) => b.lvl - a.lvl)[0]; let t = 1; for (let i = 1; i < TIER_LVL.length; i++) if (h && h.lvl >= TIER_LVL[i]) t = i; if (!h || !h.evo) t = Math.min(t, 5);
    const kind = pick(["wpn", "arm", "tr"]), it = makeGear(kind, kind === "tr" ? null : h.cls, t, R.item, null, kind === "arm" && t >= 6 ? h.evo : undefined); S.inv.push(it); R.it = it; }
  return R; }

// ── 3. Commandes du Bastion : 3 par jour, une ressource contre un bonus pour les prochaines expéditions ──
const ORDER_T = [
  { b: "forge", n: "La Forge noire réclame du fer", mat: "fer", q: 25, buff: { k: "loot", v: .15, n: "+15 % de chance de qualité", runs: 3 } },
  { b: "fonderie", n: "La Fonderie veut de la cendre", mat: "cendre", q: 4, buff: { k: "gold", v: .2, n: "+20 % d'or", runs: 3 } },
  { b: "chapelle", n: "La Chapelle demande de l'essence", mat: "essence", q: 6, buff: { k: "xp", v: .2, n: "+20 % d'expérience", runs: 3 } },
  { b: "taverne", n: "La Taverne a besoin d'or", gold: 1, q: 400, buff: { k: "streak", v: 1, n: "série de victoires protégée une fois", runs: 1 } },
  { b: "menagerie", n: "La Ménagerie veut des éclats", mat: "shards", q: 3, buff: { k: "pet", v: .3, n: "+30 % d'expérience des compagnons", runs: 3 } },
];
function ordersTick() { const O = AD().orders, d = adDay(); if (O.d === d) return; O.d = d; const k = adScale(); O.list = shuffle(ORDER_T.slice()).slice(0, 3).map(t => ({ i: ORDER_T.indexOf(t), q: t.gold ? Math.round(t.q * k / 10) * 10 : Math.ceil(t.q * (1 + Math.log(Math.max(1, k)) * .5)), done: 0 })); }
function orderHave(t) { return t.gold ? S.gold : t.mat === "shards" ? (S.shards || 0) : (S.mats[t.mat] || 0); }
function orderDeliver(j) { const O = AD().orders; ordersTick(); const o = O.list[j]; if (!o || o.done) return false; const t = ORDER_T[o.i]; if (orderHave(t) < o.q) return false;
  if (t.gold) S.gold -= o.q; else if (t.mat === "shards") S.shards -= o.q; else S.mats[t.mat] -= o.q; o.done = 1; AD().buff.push(Object.assign({}, t.buff, { left: t.buff.runs })); passAdd(15); return true; }
const buffV = k => AD().buff ? AD().buff.filter(b => b.k === k && b.left > 0).reduce((a, b) => a + b.v, 0) : 0;

// ── 4/5. Série de victoires : +5 % d'or et de chance de qualité par victoire d'affilée (max +50 %) ──
const streakMul = () => Math.min(10, AD().streak || 0) * .05;

// ── 6. Contrats de chasse : 3 par semaine, coffre si les trois sont remplis ──
const HUNT_T = [
  { k: "kills", n: "Abattre {g} ennemis", g: 120 }, { k: "elites", n: "Vaincre {g} élites", g: 6 }, { k: "bosses", n: "Vaincre {g} gardiens", g: 3 },
  { k: "noheal", n: "Vaincre un gardien sans soigneur", g: 1 }, { k: "flawless", n: "Terminer {g} expéditions sans perte", g: 3 }, { k: "crits", n: "Porter {g} coups critiques", g: 80 },
  { k: "abyss", n: "Descendre de {g} étages dans l'Abîme", g: 5 }, { k: "secret", n: "Ouvrir {g} salles secrètes", g: 2 }, { k: "night", n: "Réussir {g} expéditions de nuit", g: 2 },
];
function huntTick() { const H = AD().hunt, w = adWeek(); if (H.w === w && H.list.length) return; H.w = w; H.chest = 0; H.list = shuffle(HUNT_T.map((t, i) => i)).slice(0, 3).map(i => ({ i, p: 0 })); }
function huntAdd(k, n = 1) { huntTick(); for (const c of AD().hunt.list) if (HUNT_T[c.i].k === k) c.p = Math.min(HUNT_T[c.i].g, c.p + n); }
const huntDone = () => AD().hunt.list.length && AD().hunt.list.every(c => c.p >= HUNT_T[c.i].g);
function huntClaim() { const H = AD().hunt; if (!huntDone() || H.chest) return null; H.chest = 1; const k = adScale(), R = { gold: Math.round(1500 * k / 10) * 10, shards: 6 };
  S.gold += R.gold; S.shards = (S.shards || 0) + R.shards; const h = S.heroes.slice().sort((a, b) => b.lvl - a.lvl)[0]; let t = 1; for (let i = 1; i < TIER_LVL.length; i++) if (h && h.lvl >= TIER_LVL[i]) t = i; if (!h.evo) t = Math.min(t, 5);
  const kind = pick(["wpn", "arm"]); R.it = makeGear(kind, h.cls, t, rollRarity(.3, 4), null, kind === "arm" && t >= 6 ? h.evo : undefined); S.inv.push(R.it); passAdd(60); return R; }

// ── 7. Salles secrètes : porte murée dans un trésor ou une salle mystère, clé gagnée en combat ──
{ const gm = genMap; genMap = function () { const M = gm.apply(this, arguments); try { for (const col of M) for (const n of col) if ((n.type === "treasure" || n.type === "mystery") && Math.random() < .2) n.secret = 1; } catch (e) { } return M; }; }
function secretLoot(run) { const lvl = typeof runLevel === "function" ? runLevel(run) : 10; let t = 1; for (let i = 1; i < TIER_LVL.length; i++) if (lvl >= TIER_LVL[i]) t = i; t = Math.min(t, 5);
  const out = []; for (let i = 0; i < 2; i++) { const kind = pick(["wpn", "arm", "tr"]), h = heroById(pick(run.party)); out.push(makeGear(kind, kind === "tr" ? null : h.cls, t, rollRarity(.25, 3))); } return out; }

// ── 8. Connaissance du bestiaire : 10 / 50 / 200 vaincus → +4 / +8 / +12 % de dégâts contre ce monstre ──
const KNOW = [[200, .12], [50, .08], [10, .04]];
const knowOf = key => { const n = (AD().mk || {})[key] || 0; for (const [m, v] of KNOW) if (n >= m) return v; return 0; };
{ const sm = strikeMul; strikeMul = function (B, u, x) { const m = sm.apply(this, arguments); try { if (u && u.side === "h" && x && x.key && S && S.ad) { const k = knowOf(x.key); if (k) return m * (1 + k); } } catch (e) { } return m; }; }

// ── 9. Cartes de héros : un héros tombé ou renvoyé laisse sa carte ; une collection de rôle complète donne un bonus ──
const CARD_SET = { tank: { s: "prot", v: .03, d: "+3 % de protection" }, soin: { s: "healPow", v: .05, d: "+5 % de soins" }, soutien: { s: "res", v: 5, d: "+5 de résistance" }, dps: { s: "dmg", v: .03, d: "+3 % de dégâts" } };
function cardAdd(h) { if (!h) return; const C = AD().cards; (C[h.cls] = C[h.cls] || []).unshift({ n: h.name, l: h.lvl, t: Date.now() }); C[h.cls].length = Math.min(C[h.cls].length, 12); }
const cardRoleDone = r => Object.keys(CLASSES).filter(c => CLASSES[c].role === r).every(c => (AD().cards[c] || []).length);
PAS_HOOKS.push(() => { if (!S || !S.ad) return []; const out = []; for (const r in CARD_SET) if (cardRoleDone(r)) out.push({ k: "stat", s: CARD_SET[r].s, v: CARD_SET[r].v }); return out; });
{ const dm = dismiss; dismiss = function (id) { const h = heroById(id); const r = dm.apply(this, arguments); if (r) cardAdd(h); return r; }; }
if (typeof engrave === "function") { const eg = engrave; engrave = function (h) { try { cardAdd(h); } catch (e) { } return eg.apply(this, arguments); }; }

// ── 10. Album des compagnons : une page par rôle, complète quand tous les compagnons du rôle sont adoptés et évolués ──
const albumRoles = () => [...new Set(PET_IDS.map(id => PETS[id].role))];
const albumPage = r => { const ids = PET_IDS.filter(id => PETS[id].role === r); return { ids, own: ids.filter(id => S.pets.owned.includes(id)).length, evo: ids.filter(id => petEvolved(id)).length }; };
function albumClaim(r) { const A = AD().album, P = albumPage(r); if (A[r] || P.evo < P.ids.length) return null; A[r] = 1; const k = adScale(), R = { gold: Math.round(2500 * k / 10) * 10, shards: 8, ptome: 5 }; S.gold += R.gold; S.shards = (S.shards || 0) + R.shards; S.ptomes = (S.ptomes || 0) + R.ptome; return R; }

// ── 11. Constellations : points gagnés par les cycles, les gardiens Absolus et le niveau d'aventure ──
const STARS = [
  { k: "dmg", n: "Le Glaive", s: "dmg", v: .02, d: "+2 % de dégâts" }, { k: "hp", n: "La Tour", s: "hp", v: .02, d: "+2 % de PV" }, { k: "heal", n: "La Source", s: "healPow", v: .03, d: "+3 % de soins" },
  { k: "prot", n: "Le Bouclier", s: "prot", v: .015, d: "+1,5 % de protection" }, { k: "crit", n: "L'Œil", s: "crit", v: 1, d: "+1 de critique" }, { k: "res", n: "Le Voile", s: "res", v: 2, d: "+2 de résistance" },
  { k: "gold", n: "La Couronne", d: "+3 % d'or" }, { k: "xp", n: "Le Livre", d: "+3 % d'expérience" }, { k: "luck", n: "L'Étoile du soir", d: "+2 % de chance de qualité" },
];
const STAR_MAX = 10;
function starPoints() { const ab = Object.values((S && S.absolu) || {}).reduce((a, v) => a + (typeof v === "number" ? v : 1), 0); return cycleN() * 3 + Math.min(40, ab) + Math.floor((typeof advLevel === "function" ? advLevel() : 1) / 10); }
const starSpent = () => Object.values(AD().stars).reduce((a, b) => a + b, 0);
const starRank = k => (AD().stars || {})[k] || 0;
function starBuy(k) { if (starSpent() >= starPoints() || starRank(k) >= STAR_MAX) return false; AD().stars[k] = starRank(k) + 1; return true; }
PAS_HOOKS.push(() => { if (!S || !S.ad) return []; return STARS.filter(s => s.s && starRank(s.k)).map(s => ({ k: "stat", s: s.s, v: s.v * starRank(s.k) })); });

// multiplicateurs d'or / d'expérience / de chance : constellations + commandes + série
const goldMul = () => 1 + starRank("gold") * .03 + buffV("gold") + streakMul();
const xpMul = () => 1 + starRank("xp") * .03 + buffV("xp");
const luckAdd = () => starRank("luck") * .02 + buffV("loot") + streakMul() * .4;
{ const gr = grantReward; grantReward = function (run, R) { try { if (R && S && S.ad && run && !run._sim0) { if (R.gold) R.gold = Math.round(R.gold * goldMul()); if (R.xp) R.xp = Math.round(R.xp * xpMul()); if (R.petXp) R.petXp = Math.round(R.petXp * (1 + buffV("pet"))); } } catch (e) { } return gr.apply(this, arguments); }; }
{ const rr = rollRarity; rollRarity = (luck = 0, floor = 0) => rr(luck + (S && S.ad && S.run ? luckAdd() : 0), floor); }

// ── combats : passe, contrats, bestiaire, clés, records ──
{ const ab = afterBattle; afterBattle = function (run, B) { try { if (S && B && B.over === "win") { const A = AD();
      const dead = B.dead || [], boss = dead.some(e => e.boss), elite = dead.some(e => e.elite);
      for (const e of dead) if (e.key) A.mk[e.key] = (A.mk[e.key] || 0) + 1;
      huntAdd("kills", dead.length); if (elite) huntAdd("elites", dead.filter(e => e.elite).length); if (boss) { huntAdd("bosses"); if (!run.party.some(id => { const h = heroById(id); return h && CLASSES[h.cls].role === "soin"; })) huntAdd("noheal"); }
      huntAdd("crits", (B.tally && B.tally.crits) || 0);
      passAdd(boss ? 40 : elite ? 15 : 5);
      if (Math.random() < (boss ? .5 : elite ? .3 : .06)) { A.keys++; run.keyNew = (run.keyNew || 0) + 1; }
      const T = B.tally; if (T && T.best && T.best.v > (A.rec.hit || 0)) { A.rec.hit = Math.round(T.best.v); (run.recNew = run.recNew || []).push("Plus gros coup : " + fmt(A.rec.hit)); }
      if (boss && (!A.rec.fast || B.round < A.rec.fast)) { A.rec.fast = B.round; (run.recNew = run.recNew || []).push(`Gardien le plus rapide : ${B.round} tour${B.round > 1 ? "s" : ""}`); } } } catch (e) { } return ab.apply(this, arguments); }; }
// fin d'expédition : série, records, buffs, défi hebdomadaire
{ const er = endRun; endRun = function (outcome) { const run = S && S.run; let info = null;
    try { if (run) { const A = AD(); info = { prev: A.streak };
        if (outcome === "victory") { A.streak = Math.min(99, A.streak + 1); if (A.streak > (A.rec.streak || 0)) { A.rec.streak = A.streak; (run.recNew = run.recNew || []).push("Série de victoires : " + A.streak); } if (!run.fallen.length) huntAdd("flawless"); if (run.night) huntAdd("night"); }
        else if (outcome === "wipe") { const prot = A.buff.find(b => b.k === "streak" && b.left > 0); if (prot) prot.left = 0; else A.streak = 0; }
        if (run.region === "abime") { huntAdd("abyss", Math.max(0, (run.floor || 1) - 1)); if ((run.floor || 0) > (A.rec.abyss || 0)) { A.rec.abyss = run.floor; (run.recNew = run.recNew || []).push("Profondeur de l'Abîme : " + run.floor); } }
        const real = (run.combats || 0) > 0; if (real) for (const b of A.buff) if (b.k !== "streak") b.left--; A.buff = A.buff.filter(b => b.left > 0);
        if (run.week || (S.week && run.weekRun)) { const sc = weekScore(run, outcome), w = adWeek(); if (sc > (A.weekBest[w] || 0)) { A.weekBest[w] = sc; (run.recNew = run.recNew || []).push("Défi de la semaine : " + fmt(sc) + " points"); } }
        if (real) passAdd(outcome === "victory" ? 25 : 5); info.rec = (run.recNew || []).filter(x => typeof x === "string"); info.keys = run.keyNew || 0; info.streak = A.streak; } } catch (e) { }
    const res = er.apply(this, arguments); if (res && info) res.ad = info; return res; }; }
function weekScore(run, outcome) { return Math.round((run.kills || 0) * 10 + (run.gold || 0) / 5 + (run.combats || 0) * 20 + (outcome === "victory" ? 2000 : 0) - (run.fallen || []).length * 300); }
