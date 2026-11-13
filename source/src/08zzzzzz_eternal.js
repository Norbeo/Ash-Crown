/* ═══════════ Qualité Éternelle (9) : objets propres à une classe, écho d'une voie d'évolution et traits tirés au sort, inchangeables ═══════════ */
const ETERNAL = 9;
const ETERNAL_TRAITS = {
  sang: { n: "Sang éternel", d: "+8 % de vol de vie", pas: [{ k: "stat", s: "leech", v: .08 }] },
  ame: { n: "Âme ardente", d: "ultime 25 % plus vite", pas: [{ k: "ultGain", v: .25 }] },
  veille: { n: "Veille sans fin", d: "+6 esquive, +5 précision", pas: [{ k: "stat", s: "dodge", v: 6 }, { k: "stat", s: "acc", v: 5 }] },
  colosse: { n: "Colosse", d: "+12 % de PV", pas: [{ k: "stat", s: "hp", v: .12 }] },
  fureur: { n: "Fureur des âges", d: "+10 % de dégâts", pas: [{ k: "stat", s: "dmg", v: .1 }] },
  grace: { n: "Grâce", d: "+15 % de soins", pas: [{ k: "stat", s: "healPow", v: .15 }] },
  bourreau: { n: "Bourreau", d: "+25 % sur les blessés", pas: [{ k: "execute", v: .25 }] },
  ecorche: { n: "Écorcheur", d: "les critiques font saigner", pas: [{ k: "critBleed", v: .4 }] },
  rempart: { n: "Rempart", d: "+6 % de protection", pas: [{ k: "stat", s: "prot", v: .06 }] },
  celerite: { n: "Célérité", d: "+2 vitesse", pas: [{ k: "stat", s: "spd", v: 2 }] },
  serment: { n: "Serment", d: "+20 % de résolution, +10 résistance", pas: [{ k: "moralePow", v: .2 }, { k: "stat", s: "res", v: 10 }] },
  oeil: { n: "Œil d'aigle", d: "+8 % de critique, critiques +15 %", pas: [{ k: "stat", s: "crit", v: 8 }, { k: "critDmg", v: .15 }] },
  epines: { n: "Épines", d: "renvoie 20 % des dégâts de mêlée", pas: [{ k: "thornsP", v: .2 }] },
  phenix: { n: "Phénix", d: "survit une fois à un coup fatal", pas: [{ k: "cheatDeath", v: 1 }] },
};
const ETERNAL_ECHO = .6; // part des passifs de la voie recopiée sur l'objet
function eternalize(it, cls) {
  if (!it || it.rar < ETERNAL || it.et) return it;
  const C = CLASSES[cls] || CLASSES[pick(CLASS_IDS)]; cls = Object.keys(CLASSES).find(k => CLASSES[k] === C);
  const evo = it.evo || pick(Object.keys(C.evos)); const tk = RNG.shuffle(Object.keys(ETERNAL_TRAITS).slice()).slice(0, 2);
  it.et = { cls, evo, traits: tk }; if (it.kind === "tr") it.eCls = cls;
  if (it.kind !== "tr" && !it.mod) { const pool = Object.keys(ITEM_MODS).filter(k => ITEM_MODS[k].kind === it.kind); if (pool.length) it.mod = pick(pool); }
  return it;
}
function eternalEchoPas(it) { const C = CLASSES[it.et.cls], E = C && C.evos[it.et.evo]; if (!E) return []; return E.pas.map(p => typeof p.v === "number" && p.k !== "cheatDeath" ? Object.assign({}, p, { v: Math.round(p.v * ETERNAL_ECHO * 1000) / 1000 }) : p); }
{ const mg0 = makeGear; makeGear = function (kind, cls, tier, rar, key, evo) { const it = mg0.apply(this, arguments); if (it && it.rar >= ETERNAL) { let c = cls; if (!c && typeof S !== "undefined" && S && S.run && S.run.party) { const h = heroById(pick(S.run.party)); c = h && h.cls; } eternalize(it, c || it.cls); } return it; }; }
// un bibelot Éternel ne se porte que par sa classe
{ const ce0 = canEquip; canEquip = function (h, it) { if (it && it.kind === "tr" && it.eCls && h && h.cls !== it.eCls) return false; return ce0.apply(this, arguments); }; }
PAS_HOOKS.push(h => { const out = []; for (const s of ["wpn", "arm", "tr1", "tr2"]) { const it = h.gear[s]; if (!it || !it.et) continue; for (const t of it.et.traits) if (ETERNAL_TRAITS[t]) out.push(...ETERNAL_TRAITS[t].pas); if (h.evo === it.et.evo) out.push(...eternalEchoPas(it)); } return out; });
