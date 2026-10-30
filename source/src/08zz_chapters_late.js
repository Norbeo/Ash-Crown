// Chapitres VII à X : histoire, scènes et marques des gardiens (branchés après 03y_story et 08z_extras)
(function () {
  if (typeof CH_MORE === "undefined") return;
  for (const C of CH_MORE) {
    if (!C.ready) continue;
    STORY[C.id] = C.story;
    SCENES[C.id] = { t: `${C.sub} — ${C.n}`, lines: C.scene };
    SCENE_END[C.id] = C.end;
    GUARD_MARKS[C.id] = C.mark;
  }
})();

// ── Fin de l'histoire et nouveaux cycles ──
const FINALE = [
  ["narr", "Le dernier gardien tombe. Pour la première fois depuis la chute d'Aldemar, le vent qui souffle sur les ruines ne sent plus la cendre."],
  ["anselme", "Les fragments… ils se taisent. Tous. La Couronne ne chuchote plus."],
  ["ysolde", "Alors c'est fini ? On peut rentrer, enterrer nos morts, reconstruire ?"],
  ["capitaine", "On peut. Pour un temps. J'ai vu trop de guerres finir pour croire qu'une seule le fait vraiment."],
  ["voix", "Vous avez rassemblé la Couronne. Il fallait bien que quelqu'un le fasse. Merci… porteurs."],
  ["maugrin", "Vous avez entendu ? Dites-moi que vous n'avez pas entendu."],
  ["narr", "Sous le Bastion, très loin, quelque chose se retourne dans son sommeil. Les cloches de Morvaine sonnent une fois, toutes seules. Puis elles se taisent."],
  ["anselme", "Le cycle recommence. Il recommence toujours. Mais cette fois, nous savons ce qui nous attend."],
];
const lastChapter = () => REGIONS[REGIONS.length - 1].id;
const cycleN = () => (typeof S !== "undefined" && S && S.cycle) || 0;
const cycleFoe = () => 1 + cycleN() * .3;      // ennemis : +30 % de PV et de dégâts par cycle
const cycleLoot = () => 1 + cycleN() * .25;    // or et expérience : +25 % par cycle
function startNewCycle() {
  S.cycle = cycleN() + 1;
  for (const r of REGIONS) S.prog[r.id] = { clears: 0, threat: 0, best: S.prog[r.id] && S.prog[r.id].best || 0 };
  S.seenScene = {}; S.finaleReady = 0;
}
