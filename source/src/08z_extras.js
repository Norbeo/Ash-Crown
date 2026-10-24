/* ═══════════════════════ Extensions : quêtes, marques, saisons, boss rush, reliques vues ═══════════════════════ */

// ── Reliques découvertes (codex) ──
function seeRelics(run) { S.seen.relics = S.seen.relics || {}; for (const k of run.relics || []) S.seen.relics[k] = 1; }

// ── Quêtes personnelles : un héros aguerri reçoit parfois une quête ; l'accomplir lui donne un trait unique ──
const QUESTS = {
  kills: { n: "Venger les siens", d: "Tuer {v} ennemis.", v: [22, 36], trait: "vengeur" },
  impie: { n: "Croisade", d: "Abattre {v} impies (morts-vivants, démons…).", v: [10, 18], trait: "croise" },
  boss: { n: "Tueur de rois", d: "Vaincre {v} gardien(s) de chapitre.", v: [1, 2], trait: "tueur_rois" },
  survive: { n: "Increvable", d: "Revenir de {v} expéditions sans tomber.", v: [3, 4], trait: "increvable" },
  heal: { n: "Mains de lumière", d: "Rendre {v} PV à ses alliés.", v: [300, 520], trait: "lumiere", role: "soin" },
  dmg: { n: "Fléau", d: "Infliger {v} dégâts.", v: [700, 1300], trait: "fleau" },
  relic: { n: "L'héritage", d: "Rapporter {v} relique(s) d'expédition.", v: [2, 3], trait: "heritier" },
};
// traits uniques (non tirés au recrutement : unique = 1)
Object.assign(TRAITS, {
  vengeur: { n: "Vengeur", good: 1, unique: 1, d: "+8 % de dégâts et +5 % de critique.", pas: [{ k: "stat", s: "dmg", v: .08 }, { k: "stat", s: "crit", v: 5 }] },
  croise: { n: "Croisé", good: 1, unique: 1, d: "+20 % de dégâts contre les impies.", pas: [{ k: "vsTag", tag: "impie", v: .2 }] },
  tueur_rois: { n: "Tueur de rois", good: 1, unique: 1, d: "+12 % de dégâts et +10 % de PV.", pas: [{ k: "stat", s: "dmg", v: .12 }, { k: "stat", s: "hp", v: .1 }] },
  increvable: { n: "Increvable", good: 1, unique: 1, d: "+15 % de PV et +15 de résistance.", pas: [{ k: "stat", s: "hp", v: .15 }, { k: "stat", s: "res", v: 15 }] },
  lumiere: { n: "Mains de lumière", good: 1, unique: 1, d: "+25 % de soins prodigués.", pas: [{ k: "stat", s: "healPow", v: .25 }] },
  fleau: { n: "Fléau", good: 1, unique: 1, d: "+10 % de dégâts et +2 de vitesse.", pas: [{ k: "stat", s: "dmg", v: .1 }, { k: "stat", s: "spd", v: 2 }] },
  heritier: { n: "Héritier", good: 1, unique: 1, d: "+15 % d'or et +10 % d'expérience.", pas: [{ k: "gold", v: .15 }, { k: "xp", v: .1 }] },
});
function questFor(h) {
  const C = CLASSES[h.cls], ks = Object.keys(QUESTS).filter(k => (!QUESTS[k].role || QUESTS[k].role === C.role) && !h.traits.includes(QUESTS[k].trait));
  if (!ks.length) return null; const k = pick(ks), Q = QUESTS[k]; return { k, goal: rint(Q.v[0], Q.v[1]), p: 0 };
}
function questText(q) { const Q = QUESTS[q.k]; return Q.d.replace("{v}", q.goal); }
function questProgress(h, k, v) {
  const q = h.quest; if (!q || q.k !== k || q.done) return null;
  q.p = Math.min(q.goal, q.p + v);
  if (q.p >= q.goal) { q.done = 1; const T = QUESTS[q.k].trait; if (!h.traits.includes(T)) h.traits.push(T); S.stats.quests = (S.stats.quests || 0) + 1; return { h, trait: T }; }
  return null;
}
// après un combat : dégâts, soins, ennemis tués, impies
function questsAfterBattle(run, B) {
  const T = B.tally || { dmg: {}, heal: {} }, done = [];
  const impies = (B.dead || []).filter(e => e.tags && e.tags.includes("impie")).length;
  for (const u of [...B.heroes, ...B.fallen]) {
    const h = heroById(u.hid); if (!h || !h.quest) continue;
    for (const r of [questProgress(h, "kills", u.kills || 0), questProgress(h, "dmg", T.dmg[u.hid] || 0), questProgress(h, "heal", T.heal[u.hid] || 0), questProgress(h, "impie", impies)]) if (r) done.push(r);
  }
  run.questsDone = (run.questsDone || []).concat(done);
}

// ── Marques des gardiens : vaincre un gardien de chapitre laisse une marque (bonus + malus), purifiable à la Chapelle ──
const GUARD_MARKS = {
  bourg: { n: "Marque de la peste", d: "+15 de résistance, mais −8 % de PV.", pas: [{ k: "stat", s: "res", v: 15 }, { k: "stat", s: "hp", v: -.08 }] },
  foret: { n: "Sève noire", d: "+10 % de dégâts, mais −6 d'esquive.", pas: [{ k: "stat", s: "dmg", v: .1 }, { k: "stat", s: "dodge", v: -6 }] },
  catacombes: { n: "Os maudits", d: "+8 % de protection, mais −2 de vitesse.", pas: [{ k: "stat", s: "prot", v: .08 }, { k: "stat", s: "spd", v: -2 }] },
  marais: { n: "Fièvre des noyés", d: "+20 % de soins reçus, mais −5 de précision.", pas: [{ k: "healTaken", v: .2 }, { k: "stat", s: "acc", v: -5 }] },
  citadelle: { n: "Cendres du roi", d: "+8 % de critique, mais −10 % de soins prodigués.", pas: [{ k: "stat", s: "crit", v: 8 }, { k: "stat", s: "healPow", v: -.1 }] },
};
const markCost = h => 120 + h.lvl * 25;
function purifyMark(h) { if (!h.mark) return { err: "Aucune marque." }; const c = markCost(h); if (S.gold < c) return { err: "Pas assez d'or." }; S.gold -= c; h.mark = null; return { ok: 1 }; }

// ── Saisons de 4 semaines : gardien de l'Abîme, récompense à la profondeur 10, registre des records ──
const SEASON_NAMES = ["des Cendres", "du Givre", "du Sang", "des Ombres", "de la Peste", "des Corbeaux", "du Gibet", "des Noyés"];
function seasonKey(d = new Date()) { const wk = weekKey(d), y = Math.floor(wk / 100), w = wk % 100; return y * 100 + Math.floor((w - 1) / 4) + 1; }
function seasonCheck() {
  const k = seasonKey(); if (S.season && S.season.key === k) return false;
  if (S.season && S.season.best) (S.seasons = S.seasons || []).push({ key: S.season.key, n: S.season.n, best: S.season.best });
  const rng = mkRng(k * 29 + 3);
  S.season = { key: k, n: "Saison " + rng.pick(SEASON_NAMES), boss: rng.pick(ALL_BOSSES), relic: rng.pick(Object.keys(TRINKETS).filter(t => TRINKETS[t].r >= 2)), best: 0, claimed: 0 };
  return true;
}
function seasonDaysLeft(d = new Date()) { const k = seasonKey(d); let n = 0; const t = new Date(d); while (seasonKey(t) === k && n < 40) { t.setDate(t.getDate() + 1); n++; } return n; }

// ── Boss rush : tous les gardiens à la suite, un camp toutes les deux victoires ──
function rushAvailable() { return regionsCleared() >= 2; }
function startRush(partyIds, petId) {
  const reg = [...REGIONS].reverse().find(r => S.prog[r.id] && S.prog[r.id].clears) || REGIONS[0];
  startRun(reg.id, partyIds, petId, {});
  const types = ["elite", "boss", "camp", "elite", "boss", "camp", "boss", "boss"];
  S.run.map = types.map((type, c) => [{ c, i: 0, type, links: c < types.length - 1 ? [0] : [], done: false, x: .5 }]);
  S.run.rush = 1; S.run.light = 100;
  return S.run;
}

// ── fin d'expédition : quêtes, marques, saison, rush ──
function extrasEndRun(run, outcome, res) {
  seeRelics(run);
  const party = run.party.map(heroById).filter(Boolean), done = run.questsDone || [];
  for (const h of party) {
    if (!run.fallen.includes(h.id) && outcome !== "wipe") { const r = questProgress(h, "survive", 1); if (r) done.push(r); }
    if (outcome === "victory" && !run.rush && run.region !== "abime") { const r = questProgress(h, "boss", 1); if (r) done.push(r); }
    if (outcome !== "wipe" && run.relics.length) { const r = questProgress(h, "relic", run.relics.length); if (r) done.push(r); }
  }
  // nouvelles quêtes : un héros de niveau 3+ sans quête en reçoit une une fois sur trois
  const fresh = [];
  for (const h of party) if (h.lvl >= 3 && (!h.quest || h.quest.done) && chance(.34)) { const q = questFor(h); if (q) { h.quest = q; fresh.push(h); } }
  res.quests = done.map(d => ({ name: d.h.name, trait: d.trait })); res.newQuests = fresh.map(h => ({ name: h.name, q: questText(h.quest), n: QUESTS[h.quest.k].n }));
  // marque du gardien vaincu
  if (outcome === "victory" && !run.rush && GUARD_MARKS[run.region]) { res.marks = []; for (const h of party) if (!run.fallen.includes(h.id) && !h.mark) { h.mark = run.region; res.marks.push(h.name); } if (res.marks.length) res.mark = GUARD_MARKS[run.region]; }
  // saison de l'Abîme
  if (run.region === "abime" && S.season) { S.season.best = Math.max(S.season.best, run.floor - (outcome === "victory" ? 0 : 1)); if (S.season.best >= 10 && !S.season.claimed) { S.season.claimed = 1; const it = makeGear("tr", null, 1, TRINKETS[S.season.relic].r, S.season.relic); S.inv.push(it); S.shards += 3; res.season = { it }; } }
  // boss rush
  if (run.rush) { const n = run.map.flat().filter(x => x.done && (x.type === "boss" || x.type === "elite")).length, mins = Math.max(1, Math.round((Date.now() - run.startedAt) / 60000)), alive = party.filter(h => !run.fallen.includes(h.id)).length;
    const B0 = S.rush || { best: 0, time: 0, alive: 0, runs: 0 }; B0.runs++; res.rush = { n, mins, alive, record: n > B0.best || (n === B0.best && mins < B0.time) };
    if (res.rush.record) { B0.best = n; B0.time = mins; B0.alive = alive; } S.rush = B0; }
}
