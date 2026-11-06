// ── Réglages de fin de partie (5 nov.) : présages d'expédition, 2e phase des gardiens en menace IV–V, soins réduits au fond de l'Abîme ──
const OMENS = {
  sang: { n: "Présage de sang", ic: "blood", d: "Ennemis +10 % de dégâts ; or +20 %.", edmg: .1, gold: .2 },
  fer: { n: "Présage de fer", ic: "shield", d: "Ennemis +12 % de PV ; expérience +20 %.", ehp: .12, xp: .2 },
  corbeau: { n: "Présage du corbeau", ic: "eye", d: "Lueur −15 au départ ; meilleur butin.", light: -15, luck: .05 },
  cendre: { n: "Présage de cendre", ic: "fire", d: "Ennemis +1 vitesse ; or +12 %, expérience +12 %.", espd: 1, gold: .12, xp: .12 },
  aube: { n: "Présage de l'aube", ic: "sun", d: "Héros +8 % de dégâts ; or −10 %.", hdmg: .08, gold: -.1 },
};
function rollOmen(run) { if (run.week || run.daily) return null; const r = mkRng(hashStr("omen" + run.seed)); return r.chance(.4) ? r.pick(Object.keys(OMENS)) : null; }
function omenOf(run) { return run && run.omen && OMENS[run.omen] || null; }
function omenTag(run) { const O = omenOf(run); return O ? `<span class="tag" ${tipAttr(O.n, O.d)}>${ico(O.ic, "#d8a070", 13)}${O.n}</span>` : ""; }
// 2e phase : en menace IV et V, chaque gardien se relève une fois de plus sous 25 % de PV
const PHASE2 = { at: .25, n: "Le gardien refuse de tomber. La menace le nourrit : il se relève, enragé.", sfx: [{ k: "dmgUp", v: .3, t: 99 }, { k: "spdUp", v: 2, t: 99 }, { k: "shield", v: .12, t: 2 }] };
// Abîme : à partir de la profondeur 20, les soins reçus par les héros baissent (−2,5 % par étage, au plus −50 %)
const abyssHealCut = run => run && run.region === "abime" && run.floor >= 20 ? Math.min(.5, (run.floor - 19) * .025) : 0;

// ── Niveau conseillé et écart de niveau ──
// Niveau conseillé pour vaincre le gardien : niveau du chapitre (4 au chapitre I), +2 par menace au-dessus de I.
function recLevel(regId, threat = 0) { const R = regionById(regId); if (!R || regId === "abime") return null; return Math.max(4, R.lvl) + 2 * (threat || 0); }
// Un groupe sous le niveau conseillé fait face à un gardien plus coriace : +7 % de PV et +5 % de dégâts par niveau d'écart (au plus 10 niveaux).
const GAP_HP = .07, GAP_DMG = .05;
function levelGap(run) { const rec = recLevel(run.region, run.threat); if (rec == null) return 0; const p = runParty().filter(h => !run.fallen.includes(h.id)); if (!p.length) return 0; const avg = p.reduce((a, h) => a + h.lvl, 0) / p.length; return clamp(rec - avg, 0, 10); }
// réglage fin par chapitre (calibré par test/bosslvl.js : ~85 % de victoires au niveau conseillé, nettement moins 3 et 6 niveaux en dessous)
const BOSS_TUNE = {bourg: [1.5, 1.6, 1.7, 1.75, 1.8], foret: [1.1, 1.15, 0.88, 0.98, 1.12], catacombes: [0.45, 0.5, 0.62, 0.82, 1.0], marais: [0.72, 0.78, 0.95, 1.05, 1.12], citadelle: [0.48, 0.5, 0.56, 0.64, 0.7], terres: [0.55, 0.56, 0.62, 0.68, 0.72], cimes: [0.87, 0.9, 0.97, 1.04, 1.09], cite: [0.85, 0.86, 0.88, 0.95, 0.98], mines: [0.88, 0.92, 0.95, 1.02, 1.08], trone: [1.06, 1.08, 1.1, 1.13, 1.1]};
const bossTune = (regId, threat) => { const T = BOSS_TUNE[regId]; return T ? (T[threat] != null ? T[threat] : T[T.length - 1]) : 1; };
