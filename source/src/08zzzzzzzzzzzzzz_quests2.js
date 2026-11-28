/* Quêtes de héros (12 nov.) : une quête accomplie est aussitôt remplacée par une nouvelle (au lieu de rester affichée),
   et douze quêtes de plus, chacune avec son trait unique. */
Object.assign(QUESTS, {
  elites: { n: "Chasseur d'élites", d: "Abattre {v} élites.", v: [4, 7], trait: "q_elites" },
  combats: { n: "Aguerri", d: "Remporter {v} combats.", v: [25, 40], trait: "q_aguerri" },
  taken: { n: "Rempart vivant", d: "Encaisser {v} dégâts.", v: [900, 1600], trait: "q_rempart", role: "tank" },
  shield: { n: "Égide", d: "Accorder {v} points de bouclier.", v: [400, 800], trait: "q_egide", role: "soutien" },
  night: { n: "Noctambule", d: "Revenir de {v} expéditions de nuit.", v: [2, 3], trait: "q_nuit" },
  abyss: { n: "Abyssal", d: "Descendre de {v} étages dans l'Abîme.", v: [4, 8], trait: "q_abysse" },
  flawless: { n: "Inflexible", d: "Terminer {v} expéditions sans qu'aucun héros ne tombe.", v: [2, 4], trait: "q_inflexible" },
  goldq: { n: "Avide", d: "Rapporter {v} or au Bastion.", v: [1500, 3000], trait: "q_avide" },
  threat: { n: "Défi des menaces", d: "Vaincre {v} gardien(s) en menace III ou plus.", v: [1, 2], trait: "q_menace" },
  burstq: { n: "Coup fatal", d: "Porter un coup d'au moins {v} dégâts.", v: [120, 200], trait: "q_coupfatal", role: "dps" },
  healbig: { n: "Miracle", d: "Rendre {v} PV en une seule expédition.", v: [700, 1100], trait: "q_miracle", role: "soin" },
  pets: { n: "Ami des bêtes", d: "Partir {v} fois avec un compagnon.", v: [4, 6], trait: "q_betes" },
});
Object.assign(TRAITS, {
  q_elites: { n: "Chasseur d'élites", good: 1, unique: 1, d: "+8 % de dégâts et +4 de critique.", pas: [{ k: "stat", s: "dmg", v: .08 }, { k: "stat", s: "crit", v: 4 }] },
  q_aguerri: { n: "Aguerri", good: 1, unique: 1, d: "+8 % de PV et +5 % de dégâts.", pas: [{ k: "stat", s: "hp", v: .08 }, { k: "stat", s: "dmg", v: .05 }] },
  q_rempart: { n: "Rempart vivant", good: 1, unique: 1, d: "+12 % de PV et +6 % de protection.", pas: [{ k: "stat", s: "hp", v: .12 }, { k: "stat", s: "prot", v: .06 }] },
  q_egide: { n: "Égide", good: 1, unique: 1, d: "+15 % de soins et boucliers, +10 de résistance.", pas: [{ k: "stat", s: "healPow", v: .15 }, { k: "stat", s: "res", v: 10 }] },
  q_nuit: { n: "Noctambule", good: 1, unique: 1, d: "+6 de critique et +2 de vitesse.", pas: [{ k: "stat", s: "crit", v: 6 }, { k: "stat", s: "spd", v: 2 }] },
  q_abysse: { n: "Abyssal", good: 1, unique: 1, d: "+15 de résistance et +6 % de dégâts.", pas: [{ k: "stat", s: "res", v: 15 }, { k: "stat", s: "dmg", v: .06 }] },
  q_inflexible: { n: "Inflexible", good: 1, unique: 1, d: "+10 % de PV et +10 de résistance.", pas: [{ k: "stat", s: "hp", v: .1 }, { k: "stat", s: "res", v: 10 }] },
  q_avide: { n: "Avide", good: 1, unique: 1, d: "+20 % d'or.", pas: [{ k: "gold", v: .2 }] },
  q_menace: { n: "Défieur", good: 1, unique: 1, d: "+10 % de dégâts et +6 % de PV.", pas: [{ k: "stat", s: "dmg", v: .1 }, { k: "stat", s: "hp", v: .06 }] },
  q_coupfatal: { n: "Coup fatal", good: 1, unique: 1, d: "+8 de critique.", pas: [{ k: "stat", s: "crit", v: 8 }] },
  q_miracle: { n: "Miracle", good: 1, unique: 1, d: "+20 % de soins prodigués.", pas: [{ k: "stat", s: "healPow", v: .2 }] },
  q_betes: { n: "Ami des bêtes", good: 1, unique: 1, d: "+10 % de PV et +2 de vitesse.", pas: [{ k: "stat", s: "hp", v: .1 }, { k: "stat", s: "spd", v: 2 }] },
});
// une quête accomplie est remplacée aussitôt (le trait gagné reste dans la liste des traits)
{ const qp = questProgress; questProgress = function (h) { const r = qp.apply(this, arguments); if (r && h.quest && h.quest.done) { (h.questsDone = h.questsDone || []).push(h.quest.k); const nq = questFor(h); h.quest = nq || null; if (nq) r.next = QUESTS[nq.k].n; } return r; }; }
// ménage des anciennes sauvegardes : quêtes accomplies restées affichées
function questsMigrate() { if (!S) return; for (const h of S.heroes) if (h.quest && h.quest.done) { const nq = questFor(h); h.quest = nq || null; } }
// progression des nouvelles quêtes : combats
{ const qa = questsAfterBattle; questsAfterBattle = function (run, B) { const r = qa.apply(this, arguments); try { if (B.over !== "win") return r; const T = B.tally || {}, done = [], el = (B.dead || []).filter(e => e.elite).length, thr = (B.dead || []).some(e => e.boss) && (run.threat || 0) >= 2;
      for (const u of [...B.heroes, ...B.fallen]) { const h = heroById(u.hid); if (!h || !h.quest) continue; const best = T.best && T.best.hid === u.hid ? T.best.v : 0;
        for (const x of [questProgress(h, "elites", el), questProgress(h, "combats", 1), questProgress(h, "taken", (T.taken || {})[u.hid] || 0), questProgress(h, "shield", (T.shield || {})[u.hid] || 0), thr ? questProgress(h, "threat", 1) : null, best && h.quest && h.quest.k === "burstq" && best >= h.quest.goal ? questProgress(h, "burstq", h.quest.goal) : null]) if (x) done.push(x);
        if (h.quest && h.quest.k === "healbig") { run._healQ = run._healQ || {}; run._healQ[h.id] = (run._healQ[h.id] || 0) + ((T.heal || {})[u.hid] || 0); const x = questProgress(h, "healbig", Math.max(0, run._healQ[h.id] - h.quest.p)); if (x) done.push(x); } }
      run.questsDone = (run.questsDone || []).concat(done); } catch (e) { } return r; }; }
// progression des nouvelles quêtes : fin d'expédition
{ const xe = extrasEndRun; extrasEndRun = function (run, outcome, res) { try { if (outcome !== "wipe") for (const h of run.party.map(heroById).filter(Boolean)) { const extra = [];
        if (run.night) extra.push(questProgress(h, "night", 1)); if (run.region === "abime") extra.push(questProgress(h, "abyss", Math.max(0, (run.floor || 1) - 1)));
        if (!run.fallen.length) extra.push(questProgress(h, "flawless", 1)); extra.push(questProgress(h, "goldq", run.gold || 0)); if (run.pet) extra.push(questProgress(h, "pets", 1));
        run.questsDone = (run.questsDone || []).concat(extra.filter(Boolean)); } } catch (e) { } return xe.apply(this, arguments); }; }
