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
