// ── Progression avancée : panoplies, enchantement, ascension, colliers et traits des compagnons ──

// Panoplies : les objets Légendaires ou mieux peuvent appartenir à une panoplie (arme, armure, bibelots)
const SETS = {
  roi: { n: "Panoplie du Roi de Cendres", c: "#ff9a4a", b2: { d: "+10 % de dégâts", pas: [{ k: "stat", s: "dmg", v: .1 }] }, b3: { d: "+15 % de dégâts critiques, +6 % de critique", pas: [{ k: "critDmg", v: .15 }, { k: "stat", s: "crit", v: 6 }] } },
  veilleur: { n: "Panoplie du Veilleur", c: "#8ab8ff", b2: { d: "+8 % de PV, +5 % de protection", pas: [{ k: "stat", s: "hp", v: .08 }, { k: "stat", s: "prot", v: .05 }] }, b3: { d: "Les boucliers posés sont 30 % plus solides, +10 résistance", pas: [{ k: "shieldPow", v: .3 }, { k: "stat", s: "res", v: 10 }] } },
  peste: { n: "Panoplie de la Peste", c: "#8ad06a", b2: { d: "+20 % de dégâts des altérations", pas: [{ k: "dotPow", v: .2 }] }, b3: { d: "+20 % de chance d'infliger les altérations, +2 vitesse", pas: [{ k: "debuffPow", v: .2 }, { k: "stat", s: "spd", v: 2 }] } },
  aube: { n: "Panoplie de l'Aube", c: "#ffe08a", b2: { d: "+12 % de soins", pas: [{ k: "stat", s: "healPow", v: .12 }] }, b3: { d: "+25 % aux bonus donnés au groupe, la jauge d'ultime monte 20 % plus vite", pas: [{ k: "buffPow", v: .25 }, { k: "ultGain", v: .2 }] } },
  loup: { n: "Panoplie du Loup gris", c: "#c8c0b0", b2: { d: "+8 esquive", pas: [{ k: "stat", s: "dodge", v: 8 }] }, b3: { d: "Le compagnon frappe 35 % plus fort, +25 % de dégâts sous la moitié des PV", pas: [{ k: "petDmg", v: .35 }, { k: "lowHpDmg", v: .25 }] } },
};
function rollSet(it) { if (it && it.rar >= 4 && !it.set && chance(it.rar >= 5 ? .35 : .2)) it.set = pick(Object.keys(SETS)); return it; }
function setCount(h) { const n = {}; for (const s of ["wpn", "arm", "tr1", "tr2"]) { const it = h.gear[s]; if (it && it.set && SETS[it.set]) n[it.set] = (n[it.set] || 0) + 1; } return n; }
// bonus de panoplie complète (4 pièces : arme, armure et les deux bibelots)
const SET_B4 = {
  roi: { d: "+12 % de dégâts, +8 % de vol de vie, ultime 25 % plus vite", pas: [{ k: "stat", s: "dmg", v: .12 }, { k: "stat", s: "leech", v: .08 }, { k: "ultGain", v: .25 }] },
  veilleur: { d: "+12 % de protection, +12 % de PV, renvoie 20 % des dégâts de mêlée", pas: [{ k: "stat", s: "prot", v: .12 }, { k: "stat", s: "hp", v: .12 }, { k: "thornsP", v: .2 }] },
  peste: { d: "+35 % de dégâts sur la durée, +20 % de dégâts de zone, +20 résistance", pas: [{ k: "dotPow", v: .35 }, { k: "aoeDmg", v: .2 }, { k: "stat", s: "res", v: 20 }] },
  aube: { d: "+25 % de soins, le surplus devient bouclier, survit une fois à un coup fatal", pas: [{ k: "stat", s: "healPow", v: .25 }, { k: "overhealShield", v: .4 }, { k: "cheatDeath", v: 1 }] },
  loup: { d: "+3 vitesse, +10 esquive, riposte en esquivant, compagnon +25 %", pas: [{ k: "stat", s: "spd", v: 3 }, { k: "stat", s: "dodge", v: 10 }, { k: "dodgeRiposte", v: .3 }, { k: "petDmg", v: .25 }] },
};
for (const k in SET_B4) if (SETS[k]) SETS[k].b4 = SET_B4[k];
function setPassives(h) { const out = [], n = setCount(h); for (const k in n) { if (n[k] >= 2) out.push(...SETS[k].b2.pas); if (n[k] >= 3) out.push(...SETS[k].b3.pas); if (n[k] >= 4 && SETS[k].b4) out.push(...SETS[k].b4.pas); } return out; }

// Enchantement : relancer l'effet unique d'un objet Épique ou mieux (choix parmi trois)
function enchantCost(it) { return { gold: 250 * it.tier + 150 * (it.rar - 2), shards: Math.max(1, it.rar - 2) }; }
function enchantChoices(it) { const pool = Object.keys(ITEM_MODS).filter(k => ITEM_MODS[k].kind === it.kind && k !== it.mod); RNG.shuffle(pool); return pool.slice(0, 3); }

// Ascension : un héros de niveau 30+ renaît au niveau 15, garde sa voie et gagne un bonus permanent
const ASC_LVL = 30, ASC_BACK = 15;
const ASC_COL = ["#ffffff", "#9af0ff", "#c08aff", "#ff7a9a", "#ffd27a"];
function canAscend(h) { return h && h.lvl >= ASC_LVL && !!h.evo; }
function ascend(h) { if (!canAscend(h)) return false; h.asc = (h.asc || 0) + 1; h.lvl = ASC_BACK; h.xp = 0; return true; }
function ascPassives(h) { const a = h.asc || 0; return a ? [{ k: "stat", s: "dmg", v: .06 * a }, { k: "stat", s: "hp", v: .06 * a }, { k: "stat", s: "res", v: 4 * a }] : []; }

// Compagnons : collier (amélioration achetée) et trait tiré au hasard à l'arrivée
const PET_TRAITS = {
  feroce: { n: "Féroce", d: "+15 % de dégâts." },
  fidele: { n: "Fidèle", d: "Soins, boucliers et bonus 15 % plus forts." },
  vif: { n: "Vif", d: "Sa compétence spéciale revient un tour plus tôt." },
  robuste: { n: "Robuste", d: "Ne peut pas être blessé par les événements." },
  meneur: { n: "Meneur de meute", d: "+4 résolution au début de chaque combat." },
  flaireur: { n: "Flaireur", d: "+6 % d'or trouvé en expédition." },
};
const COLLAR_MAX = 5;
function petTrait(id) { S.petTraits = S.petTraits || {}; if (!S.petTraits[id] && PETS[id]) S.petTraits[id] = pick(Object.keys(PET_TRAITS)); return S.petTraits[id]; }
function petCollar(id) { return (S && S.petCollar && S.petCollar[id]) || 0; }
function collarCost(id) { const n = petCollar(id), r = (PETS[id] && PETS[id].rank) || 1; return { gold: Math.round(300 * (n + 1) * (n + 1) * r), shards: n >= 3 ? n - 2 : 0 }; }
// multiplicateurs appliqués au compagnon en combat
function petMul(id) { const c = petCollar(id), t = typeof S !== "undefined" && S && S.pets && S.pets.owned.includes(id) ? petTrait(id) : null; const lv = typeof petLvl === "function" ? petLvl(id) : 1; return { dmg: (1 + .08 * c) * (t === "feroce" ? 1.15 : 1), sup: (1 + .06 * c) * (t === "fidele" ? 1.15 : 1) * (1 + .015 * (lv - 1)), lvB: .015 * (lv - 1), every: t === "vif" ? -1 : 0, morale: t === "meneur" ? 4 : 0, gold: t === "flaireur" ? .06 : 0, robust: t === "robuste" }; }

// ── Gardiens secrets : des conditions cachées remplacent le gardien d'un chapitre par une version inédite ──
const SECRET_BOSSES = {
  juge_immacule: { base: "cardinal", n: "Le Juge Immaculé", hue: "#f0e2a0", f: 1.3, hint: "Atteindre un gardien sans avoir perdu un seul héros, en menace II ou plus.", cond: run => run.flawless && run.threat >= 1 },
  mere_ombres: { base: "reine_sabbat", n: "La Mère des Ombres", hue: "#7a3aff", f: 1.25, hint: "Affronter un gardien au cœur d'une expédition de nuit.", cond: run => !!run.night },
  boucher_affame: { base: "docteur_peste", n: "Le Boucher Affamé", hue: "#ff2a2a", f: 1.25, hint: "Atteindre un gardien sans aucun soigneur dans le groupe.", cond: run => run.party.map(id => heroById(id)).filter(Boolean).every(h => CLASSES[h.cls].role !== "soin") },
  moissonneuse: { base: "matrone_os", n: "La Moissonneuse", hue: "#d8d0a0", f: 1.3, hint: "Atteindre un gardien avec quatre héros de dégâts.", cond: run => run.party.map(id => heroById(id)).filter(Boolean).every(h => CLASSES[h.cls].role === "dps") },
  enfant_cendre: { base: "archonte_cendres", n: "L'Enfant de Cendre", hue: "#ff4a1a", f: 1.3, hint: "Affronter un gardien sous la lune rouge.", cond: run => run.weather === "lune" },
  gardien_pactes: { base: "roi_vide", n: "Le Gardien des Pactes", hue: "#40ff9a", f: 1.35, hint: "Atteindre un gardien en portant au moins deux malédictions.", cond: run => (run.curse || 0) >= 2 },
  dame_blanche: { base: "reine_hiver", n: "La Dame Blanche", hue: "#f4f8ff", f: 1.3, hint: "Atteindre un gardien de nuit sans avoir perdu un seul héros.", cond: run => !!run.night && run.flawless },
  roi_oublie: { base: "roi_cendres", n: "Le Roi Oublié", hue: "#40c0ff", f: 1.35, hint: "Descendre dans l'Abîme en prêtant au moins trois serments.", cond: run => run.region === "abime" && (run.oaths || []).length >= 3 },
};
const SECRET_INFO = {
  juge_immacule: ["Celui qui pèse les âmes sans tache", "« Aucune faute ? Alors je jugerai votre orgueil. »", "Balance du Juge", "wpn"],
  mere_ombres: ["Elle n'apparaît qu'à la nuit tombée", "« Chut… mes enfants dorment dans vos ombres. »", "Voile de la Mère", "arm"],
  boucher_affame: ["Il sent les groupes sans guérisseur", "« Personne pour recoudre ? Tant mieux. »", "Couperet du Boucher", "wpn"],
  moissonneuse: ["Elle fauche ceux qui ne savent que frapper", "« Quatre lames ? Je n'ai qu'une faux. Elle suffira. »", "Faux de la Moissonneuse", "wpn"],
  enfant_cendre: ["Né sous la lune rouge", "« Maman disait que la lune saignait pour moi. »", "Braise de l'Enfant", "tr"],
  gardien_pactes: ["Il garde chaque serment rompu", "« Deux malédictions… Signez la troisième, juste là. »", "Sceau des Pactes", "arm"],
  dame_blanche: ["Elle n'apparaît qu'aux âmes sans faute, la nuit", "« Si pure… si froide… restez avec moi. »", "Voile de la Dame Blanche", "arm"],
  roi_oublie: ["Le roi que la Couronne a effacé", "« Trois serments… Vous me rappelez quelqu'un. Moi. »", "Couronne oubliée", "tr"],
};
for (const k in SECRET_BOSSES) { const D = SECRET_BOSSES[k], M = MONSTERS[D.base]; if (!M || (MONSTERS[k] && !MONSTERS[k].secret)) { if (MONSTERS[k]) console.warn("clé de gardien secret déjà prise", k); continue; } MONSTERS[k] = Object.assign({}, M, { n: D.n, art: M.art || D.base, hue: D.hue, secret: 1, hp: Math.round(M.hp * D.f), dmg: M.dmg.map(v => Math.round(v * (1 + (D.f - 1) * .6))), res: (M.res || 0) + 10 }); }
// gardien secret : jamais deux fois de suite, au moins 4 autres gardiens entre deux apparitions ; 50 % tant qu'il n'est pas vaincu, 6 % ensuite
const bossHistRecent = b => (S.bossHist || []).slice(-3).includes(b);
function secretBossFor(run, rng = RNG) {
  if (typeof S === "undefined" || !S || (S.secretCD || 0) < 4 && S.lastSecret) return null;
  for (const k of rng.shuffle(Object.keys(SECRET_BOSSES))) { const D = SECRET_BOSSES[k]; if (!MONSTERS[k]) continue; let ok = false; try { ok = D.cond(run); } catch (e) { ok = false; } if (!ok) continue; const won = typeof S !== "undefined" && S && S.beaten && S.beaten[k]; if (bossHistRecent(D.base)) continue; if (won ? rng.chance(.06) : rng.chance(.5)) return k; }
  return null;
}
