// ── Familiers légendaires (14 nov.) : 4 compagnons propres, un par rôle, plus puissants que tous les autres ──
//   Déblocage par des succès de fin de partie ; évolution débloquée par d'autres succès (et non par le niveau 10).
//   Remplacent les anciens familiers recoloriés (fenrir, corbeau_fin, ours_titan), convertis à la reprise d'une sauvegarde.
const LP_RANK = 2, LP_AURA = .08; // puissance ×2 ; aura : +8 % de dégâts et de PV pour toute la compagnie quand il accompagne l'expédition
const lpThreatV = () => (typeof REGIONS === "undefined" || !S || !S.prog) ? 0 : REGIONS.filter(r => S.prog[r.id] && (S.prog[r.id].threat || 0) >= 4).length;
const lpWander = () => typeof wanderBeaten === "function" ? wanderBeaten().length : 0;
const lpCycle = () => typeof cycleN === "function" ? cycleN() : 0;
const lpAbyss = () => (S && S.abyss && S.abyss.best) || 0;
const lpLegends = () => S && S.legends ? Object.keys(S.legends).length : 0;
const lpPetEvo = () => (S && S.stats && S.stats.petEvo) || 0;
const lpBoss = () => (S && S.stats && S.stats.bossKills) || 0;
const lpAch = () => S && S.ach ? Object.keys(S.ach).length : 0;
// chaque objectif : [texte, valeur actuelle, cible]
const LEGEND_PET_DEF = {
  behemoth: { role: "tank", n: "Béhémoth des Cendres", col: "#6a4a2a", d: "Une montagne de chair et de pierre brûlée, née sous le Trône. Rien ne passe tant qu'il se tient debout.",
    sk: [{ n: "Rempart de cendre", t: "low", shield: .22 }, { n: "Piétinement", m: 1, t: "ae", at: [1, 2], fx: [{ k: "stun", v: 0, t: 1, ch: .35 }], every: 2 }],
    evo: { n: "Béhémoth de la Couronne brisée", d: "Il porte sur son dos les ruines de l'ancien royaume.", sk: { n: "Muraille vivante", t: "aa", shield: .16, afx: [{ k: "protUp", v: .15, t: 2 }] } },
    unl: () => [["Achever l'histoire (premier cycle)", lpCycle(), 1], ["Débloquer la menace V dans 5 chapitres", lpThreatV(), 5], ["Vaincre 100 gardiens", lpBoss(), 100]],
    ev: () => [["Débloquer la menace V dans 10 chapitres", lpThreatV(), 10], ["Atteindre la profondeur 30 de l'Abîme", lpAbyss(), 30]] },
  seraphe: { role: "soin", n: "Cerf-Séraphin", col: "#c8c0a0", d: "Un cerf aux bois de lumière pâle, dernier témoin des sanctuaires d'avant la Chute.",
    sk: [{ n: "Lumière des bois", t: "aa", heal: .08, afx: [{ k: "regen", v: .05, t: 2 }] }, { n: "Miracle", t: "low", heal: .45, every: 4 }],
    evo: { n: "Cerf de l'Aube Éternelle", d: "Là où il passe, les morts se taisent et les vivants se relèvent.", sk: { n: "Aube éternelle", t: "aa", heal: .16, afx: [{ k: "regen", v: .07, t: 3 }] } },
    unl: () => [["Achever l'histoire (premier cycle)", lpCycle(), 1], ["Faire évoluer 15 compagnons", lpPetEvo(), 15], ["Débloquer la menace V dans 3 chapitres", lpThreatV(), 3]],
    ev: () => [["Recruter 8 héros légendaires", lpLegends(), 8], ["Faire évoluer 30 compagnons", lpPetEvo(), 30]] },
  devoreur: { role: "dps", n: "Dévoreur d'Étoiles", col: "#3a2050", d: "Un loup immense au pelage de nuit, dont la gueule retient encore la lueur d'astres avalés.",
    sk: [{ n: "Croc d'étoile", m: 1.25, t: "e", at: [1, 2, 3], fx: [{ k: "bleed", v: .5, t: 3, ch: 1 }] }, { n: "Avaler la lumière", m: .7, t: "ae", at: [1, 2, 3, 4], fx: [{ k: "vuln", t: 2, ch: .6 }], every: 3 }],
    evo: { n: "Dévoreur de Soleils", d: "Quand il ouvre la gueule, le ciel s'éteint un instant.", sk: { n: "Éclipse", m: 1.6, t: "ae", at: [1, 2, 3, 4], fx: [{ k: "burn", v: .6, t: 3, ch: 1 }] } },
    unl: () => [["Achever l'histoire (premier cycle)", lpCycle(), 1], ["Vaincre 10 gardiens errants différents", lpWander(), 10], ["Atteindre la profondeur 20 de l'Abîme", lpAbyss(), 20]],
    ev: () => [["Vaincre les 20 gardiens errants", lpWander(), 20], ["Vaincre 250 gardiens", lpBoss(), 250]] },
  heraut: { role: "soutien", n: "Héraut de la Fin", col: "#4a3a6a", d: "Un corbeau à quatre ailes qui annonce la chute des rois. Ses cris brisent la volonté des monstres.",
    sk: [{ n: "Présage funeste", t: "ae", at: [1, 2, 3, 4], fx: [{ k: "vuln", t: 2, ch: .8 }, { k: "accDn", v: 12, t: 2, ch: .8 }] }, { n: "Ailes de la fin", t: "aa", afx: [{ k: "dmgUp", v: .18, t: 2 }], every: 3 }],
    evo: { n: "Héraut du Dernier Jour", d: "Son ombre suffit à faire plier les gardiens.", sk: { n: "Dernier jour", t: "ae", at: [1, 2, 3, 4], fx: [{ k: "stun", v: 0, t: 1, ch: .45 }, { k: "vuln", t: 2, ch: 1 }] } },
    unl: () => [["Achever l'histoire (premier cycle)", lpCycle(), 1], ["Obtenir 60 succès", lpAch(), 60], ["Vaincre 5 gardiens errants différents", lpWander(), 5]],
    ev: () => [["Commencer un troisième cycle", lpCycle(), 2], ["Obtenir 100 succès", lpAch(), 100]] },
};
const LEGEND_PET_IDS = Object.keys(LEGEND_PET_DEF);
// retrait des anciens familiers recoloriés
for (const id of ["fenrir", "corbeau_fin", "ours_titan"]) { delete PETS[id]; const i = PET_IDS.indexOf(id); if (i >= 0) PET_IDS.splice(i, 1); }
if (typeof LEGEND_PETS !== "undefined") LEGEND_PETS.length = 0;
for (const id of LEGEND_PET_IDS) { const D = LEGEND_PET_DEF[id];
  PETS[id] = { n: D.n, role: D.role, d: D.d + " Familier légendaire : bien plus puissant que les autres compagnons, et sa présence renforce toute la compagnie (+8 % de dégâts et de PV).", col: D.col, sk: D.sk, evo: D.evo,
    legendary: 1, legend: 1, starter: 0, pool0: 0, cost: 30000, rank: LP_RANK, unl: null };
  if (!PET_IDS.includes(id)) PET_IDS.push(id); }
const lpDone = L => L.every(([, v, t]) => v >= t);
function legendPetUnlockGoals(id) { const D = LEGEND_PET_DEF[id]; return D && S ? D.unl() : []; }
function legendPetEvoGoals(id) { const D = LEGEND_PET_DEF[id]; return D && S ? D.ev() : []; }
const lpOpen = id => !!(LEGEND_PET_DEF[id] && S && lpDone(LEGEND_PET_DEF[id].unl()));
{ const pu = petUnlocked; petUnlocked = function (id) { if (LEGEND_PET_DEF[id]) return !!(S && S.pets && S.pets.owned.includes(id)) || lpOpen(id); return pu.apply(this, arguments); }; }
{ const pt = petUnlockText; petUnlockText = function (id) { if (LEGEND_PET_DEF[id]) return "Familier légendaire : " + legendPetUnlockGoals(id).map(([t, v, c]) => `${t} (${Math.min(v, c)}/${c})`).join(" · "); return pt.apply(this, arguments); }; }
// évolution : par les succès, sans condition de niveau
{ const ep = evolvePet; evolvePet = function (id) { const D = LEGEND_PET_DEF[id]; if (!D) return ep.apply(this, arguments);
    if (petEvolved(id)) return { err: "Déjà évolué." }; if (!S.pets.owned.includes(id)) return { err: "Pas encore adopté." };
    const g = D.ev(); if (!lpDone(g)) return { err: "Évolution légendaire : " + g.filter(([, v, t]) => v < t).map(([t, v, c]) => `${t} (${Math.min(v, c)}/${c})`).join(" · ") };
    if (!pay(PET_EVO_COST)) return { err: "Il faut 600 or, 4 essences et 1 éclat." }; S.pets.evo[id] = 1; S.stats.petEvo++; checkAchievements(); return { ok: 1 }; }; }
// aura : +8 % de dégâts et de PV pour toute la compagnie quand un familier légendaire accompagne l'expédition
PAS_HOOKS.push(() => { const p = S && S.run && S.run.pet; return p && LEGEND_PET_DEF[p] ? [{ k: "stat", s: "dmg", v: LP_AURA }, { k: "stat", s: "hp", v: LP_AURA }] : []; });
// sauvegardes : anciens familiers recoloriés → nouveaux (même rôle), niveaux et évolution conservés
const LP_MIGRATE = { fenrir: "devoreur", corbeau_fin: "heraut", ours_titan: "behemoth" };
function legendPetsMigrate(G) { if (!G || !G.pets) return; let ch = 0;
  for (const [o, n] of Object.entries(LP_MIGRATE)) { const i = G.pets.owned.indexOf(o); if (i < 0) continue; ch = 1;
    if (G.pets.owned.includes(n)) G.pets.owned.splice(i, 1); else G.pets.owned[i] = n;
    for (const k of ["lvl", "xp", "evo"]) if (G.pets[k] && G.pets[k][o] != null) { if (G.pets[k][n] == null) G.pets[k][n] = G.pets[k][o]; delete G.pets[k][o]; }
    for (const k of ["petCollar", "petTraits", "petSpec", "petHurt"]) if (G[k] && G[k][o] != null) { if (G[k][n] == null) G[k][n] = G[k][o]; delete G[k][o]; }
    if (G.pet === o) G.pet = n; if (G.run && G.run.pet === o) G.run.pet = n; }
  for (const id of Object.keys(G.pets.lvl || {})) if (!PETS[id]) delete G.pets.lvl[id];
  return ch; }
{ const mg = migrate; migrate = function (s) { const r = mg.apply(this, arguments); try { legendPetsMigrate(r || s); } catch (e) { } return r; }; }
// fiche : objectifs de déblocage et d'évolution d'un familier légendaire
function legendPetGoalsHTML(id) { if (!LEGEND_PET_DEF[id] || !S) return "";
  const row = ([t, v, c]) => `<div class="tiny" style="margin:2px 0">${v >= c ? "✔" : "◦"} ${t} <span class="${v >= c ? "good" : "dim"}">(${Math.min(v, c)}/${c})</span></div>`;
  const own = S.pets.owned.includes(id), ev = petEvolved(id);
  return `<div class="panel" style="padding:8px;margin-top:8px;border-color:#a08040"><b class="gold">Familier légendaire</b> <span class="tiny dim">— puissance ×2 et +8 % de dégâts et de PV pour toute la compagnie</span>
    ${own ? "" : `<div class="small" style="margin-top:4px">Déblocage :</div>${legendPetUnlockGoals(id).map(row).join("")}`}
    ${ev ? "" : `<div class="small" style="margin-top:4px">Évolution (au lieu du niveau 10) :</div>${legendPetEvoGoals(id).map(row).join("")}`}</div>`; }
