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
