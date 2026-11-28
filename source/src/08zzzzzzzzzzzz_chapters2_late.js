/* Chapitres XI à XX : histoire, scènes, marques, gardiens cachés (un par chapitre), titres et récits du bestiaire. */
(function () {
  if (typeof CH_XX === "undefined") return;
  for (const C of CH_XX) {
    if (!C.ready) continue;
    STORY[C.id] = C.story; SCENES[C.id] = { t: `${C.sub} — ${C.n}`, lines: C.scene }; SCENE_END[C.id] = C.end; GUARD_MARKS[C.id] = C.mark;
    const [bk, bn] = C.boss, [ek, en] = C.elite, [hk, hn, hint, cond] = C.hidden, B = MONSTERS[bk];
    if (C.boss[3]) BOSS_FEM.add(bk);
    BOSS_INFO[bk] = BOSS_INFO[bk] || [C.sub, "« " + C.d + " »", "Relique de " + bn.replace(/^(Le |La |L')/, ""), "tr"];
    ELITE_INFO[ek] = ELITE_INFO[ek] || ["Élite du " + C.sub.toLowerCase(), "« Vous n'irez pas plus loin. »", "Trophée de " + en.replace(/^(Le |La |L')/, ""), "Aucun point faible connu"];
    LORE[bk] = LORE[bk] || C.story; LORE[ek] = LORE[ek] || C.d;
    // gardien caché : propre illustration, plus fort que le gardien du chapitre
    MONSTERS[hk] = Object.assign({}, B, { n: hn, art: hk, secret: 1, hp: Math.round(B.hp * 1.3), dmg: B.dmg.map(v => Math.round(v * 1.18)), res: (B.res || 50) + 10, chx: C.id });
    SECRET_BOSSES[hk] = { base: hk, n: hn, f: 1.3, hint, cond: run => run.region === C.id && cond(run) };
    SECRET_INFO[hk] = ["Gardien caché du " + C.sub.toLowerCase(), "« Vous m'avez trouvé. Peu y parviennent. »", "Trophée de " + hn.replace(/^(Le |La |L')/, ""), "tr"];
    LORE[hk] = LORE[hk] || hint;
  }
})();
