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
function setPassives(h) { const out = [], n = setCount(h); for (const k in n) { if (n[k] >= 2) out.push(...SETS[k].b2.pas); if (n[k] >= 3) out.push(...SETS[k].b3.pas); } return out; }

// Enchantement : relancer l'effet unique d'un objet Épique ou mieux (choix parmi trois)
function enchantCost(it) { return { gold: 250 * it.tier + 150 * (it.rar - 2), shards: Math.max(1, it.rar - 2) }; }
function enchantChoices(it) { const pool = Object.keys(ITEM_MODS).filter(k => ITEM_MODS[k].kind === it.kind && k !== it.mod); RNG.shuffle(pool); return pool.slice(0, 3); }

// Ascension : un héros de niveau 30+ renaît au niveau 15, garde sa voie et gagne un bonus permanent
const ASC_LVL = 30, ASC_BACK = 15;
const ASC_AURA = ["#ffffff", "#9af0ff", "#c08aff", "#ff7a9a", "#ffd27a"];
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
function petMul(id) { const c = petCollar(id), t = typeof S !== "undefined" && S && S.pets && S.pets.owned.includes(id) ? petTrait(id) : null; return { dmg: (1 + .08 * c) * (t === "feroce" ? 1.15 : 1), sup: (1 + .06 * c) * (t === "fidele" ? 1.15 : 1), every: t === "vif" ? -1 : 0, morale: t === "meneur" ? 4 : 0, gold: t === "flaireur" ? .06 : 0, robust: t === "robuste" }; }

// ── Gardiens secrets : des conditions cachées remplacent le gardien d'un chapitre par une version inédite ──
const SECRET_BOSSES = {
  juge_immacule: { base: "cardinal", n: "Le Juge Immaculé", hue: "#f0e2a0", f: 1.3, hint: "Atteindre un gardien sans avoir perdu un seul héros, en menace II ou plus.", cond: run => run.flawless && run.threat >= 1 },
  mere_ombres: { base: "reine_sabbat", n: "La Mère des Ombres", hue: "#7a3aff", f: 1.25, hint: "Affronter un gardien au cœur d'une expédition de nuit.", cond: run => !!run.night },
  boucher: { base: "docteur_peste", n: "Le Boucher Affamé", hue: "#ff2a2a", f: 1.25, hint: "Atteindre un gardien sans aucun soigneur dans le groupe.", cond: run => run.party.map(id => heroById(id)).filter(Boolean).every(h => CLASSES[h.cls].role !== "soin") },
  roi_oublie: { base: "roi_cendres", n: "Le Roi Oublié", hue: "#40c0ff", f: 1.35, hint: "Descendre dans l'Abîme en prêtant au moins trois serments.", cond: run => run.region === "abime" && (run.oaths || []).length >= 3 },
};
const SECRET_INFO = {
  juge_immacule: ["Celui qui pèse les âmes sans tache", "« Aucune faute ? Alors je jugerai votre orgueil. »", "Balance du Juge", "wpn"],
  mere_ombres: ["Elle n'apparaît qu'à la nuit tombée", "« Chut… mes enfants dorment dans vos ombres. »", "Voile de la Mère", "arm"],
  boucher: ["Il sent les groupes sans guérisseur", "« Personne pour recoudre ? Tant mieux. »", "Couperet du Boucher", "wpn"],
  roi_oublie: ["Le roi que la Couronne a effacé", "« Trois serments… Vous me rappelez quelqu'un. Moi. »", "Couronne oubliée", "tr"],
};
for (const k in SECRET_BOSSES) { const D = SECRET_BOSSES[k], M = MONSTERS[D.base]; if (!M) continue; MONSTERS[k] = Object.assign({}, M, { n: D.n, art: M.art || D.base, hue: D.hue, secret: 1, hp: Math.round(M.hp * D.f), dmg: M.dmg.map(v => Math.round(v * (1 + (D.f - 1) * .6))), res: (M.res || 0) + 10 }); }
// gardien secret à la place du gardien prévu : toujours la première fois que la condition est remplie, puis une fois sur trois
function secretBossFor(run, rng = RNG) {
  for (const k in SECRET_BOSSES) { const D = SECRET_BOSSES[k]; if (!MONSTERS[k]) continue; let ok = false; try { ok = D.cond(run); } catch (e) { ok = false; } if (!ok) continue; const won = typeof S !== "undefined" && S && S.beaten && S.beaten[k]; if (!won || rng.chance(.33)) return k; }
  return null;
}
