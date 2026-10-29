/* ═══════════════════════ Contenu supplémentaire : chapitre VI, gardiens de menace ═══════════════════════ */
Object.assign(MONSTERS, {
  // Chapitre VI — Les Terres Brûlées
  penitent_ardent: { n: "Pénitent ardent", art: "penitent_ardent", tags: ["humain"], hp: 46, dmg: [8, 13], prot: .08, spd: 5, dodge: 4, rk: [1, 2],
    sk: [{ n: "Fouet de braises", m: 1, at: [1, 2], fx: [{ k: "burn", v: .45, t: 3, ch: .9 }] }, { n: "Immolation", m: .7, t: "ae", at: [1, 2], fx: [{ k: "burn", v: .4, t: 2, ch: .7 }], self: .06, every: 3 }] },
  chien_cendre: { n: "Molosse de cendre", art: "chien_cendre", tags: ["bete"], hp: 40, dmg: [8, 12], prot: .04, spd: 8, dodge: 10, rk: [1, 2],
    sk: [{ n: "Crocs brûlants", m: 1, at: [1, 2], fx: [{ k: "bleed", v: .5, t: 3, ch: .9 }] }, { n: "Bond", m: .8, at: [2, 3], fx: [{ k: "spdDn", v: 2, t: 2, ch: .7 }] }] },
  pretre_suie: { n: "Prêcheur de suie", art: "pretre_suie", tags: ["humain"], hp: 36, dmg: [6, 10], prot: 0, spd: 6, dodge: 8, rk: [3, 4],
    sk: [{ n: "Sermon noir", m: .5, t: "ae", at: [1, 2, 3, 4], fx: [{ k: "weak", t: 2, ch: .8 }] }, { n: "Bénédiction cendrée", t: "allies", heal: .12, w: .6 }, { n: "Anathème", m: .9, at: [1, 2, 3, 4], fx: [{ k: "vuln", t: 2, ch: 1 }] }] },
  sentinelle_obsidienne: { n: "Sentinelle d'obsidienne", art: "sentinelle_obsidienne", tags: ["impie"], hp: 70, dmg: [9, 14], prot: .3, spd: 2, dodge: 0, res: 40, rk: [1, 2],
    sk: [{ n: "Poing de verre noir", m: 1.1, at: [1, 2], fx: [{ k: "stun", t: 1, ch: .3 }] }, { n: "Éclats", m: .5, t: "ae", at: [1, 2, 3, 4], fx: [{ k: "bleed", v: .4, t: 2, ch: .6 }], every: 3 }] },
  chevaucheur_calcine: { n: "Chevaucheur calciné", art: "chevaucheur_calcine", tags: ["impie"], hp: 52, dmg: [9, 15], prot: .12, spd: 7, dodge: 6, rk: [2, 3],
    sk: [{ n: "Charge ardente", m: 1.1, at: [1, 2], fx: [{ k: "burn", v: .4, t: 2, ch: .8 }] }, { n: "Lance de cendre", m: .9, at: [2, 3, 4], fx: [{ k: "protDn", v: .12, t: 2, ch: .8 }] }] },
  colosse_braise: { n: "Colosse de braise", art: "colosse_braise", tags: ["impie"], elite: 1, hp: 180, dmg: [12, 18], prot: .2, spd: 3, dodge: 0, res: 40, rk: [1, 2],
    sk: [{ n: "Marteau de lave", m: 1.3, at: [1, 2], fx: [{ k: "burn", v: .5, t: 3, ch: 1 }, { k: "stun", t: 1, ch: .25 }] }, { n: "Éruption", m: .7, t: "ae", at: [1, 2, 3, 4], fx: [{ k: "burn", v: .4, t: 2, ch: .8 }], every: 3 }] },
  cardinal: { n: "Le Cardinal Écarlate", art: "cardinal", tags: ["humain"], boss: 1, sz: 2, hp: 1150, dmg: [13, 20], prot: .18, spd: 7, dodge: 10, res: 50, rk: [2],
    sk: [{ n: "Sentence écarlate", m: 1.3, at: [1, 2, 3, 4], fx: [{ k: "bleed", v: .6, t: 3, ch: 1 }] }, { n: "Autodafé", m: .8, t: "ae", at: [1, 2, 3, 4], fx: [{ k: "burn", v: .5, t: 3, ch: 1 }] }, { n: "Excommunication", m: .4, t: "ae", at: [1, 2, 3, 4], fx: [{ k: "weak", t: 2, ch: .8 }, { k: "vuln", t: 2, ch: .6 }] }, { n: "Reliques volées", t: "self", heal: .08, sfx: [{ k: "shield", v: .14, t: 2 }], w: .4 }],
    phase: { at: .5, n: "Le Cardinal brandit les fragments volés. La Couronne crie !", sfx: [{ k: "dmgUp", v: .4, t: 99 }, { k: "spdUp", v: 3, t: 99 }] } },
  // Gardiens de menace : un inédit par niveau de menace (II à V)
  sans_visage: { n: "Le Chevalier Sans-Visage", art: "sans_visage", tags: ["impie"], boss: 1, sz: 2, hp: 700, dmg: [11, 17], prot: .25, spd: 5, dodge: 6, res: 40, rk: [2], threatBoss: 1,
    sk: [{ n: "Taille sans fin", m: 1.2, at: [1, 2], fx: [{ k: "bleed", v: .5, t: 3, ch: 1 }] }, { n: "Heaume vide", m: .5, t: "ae", at: [1, 2, 3, 4], fx: [{ k: "accDn", v: 12, t: 2, ch: .9 }] }, { n: "Garde de fer", t: "self", sfx: [{ k: "protUp", v: .2, t: 2 }, { k: "riposte", t: 2 }], w: .5 }],
    phase: { at: .5, n: "Sous le heaume, il n'y a rien. Et ce rien a faim.", sfx: [{ k: "dmgUp", v: .35, t: 99 }] } },
  matrone_os: { n: "La Matrone des Os", art: "matrone_os", tags: ["impie"], boss: 1, sz: 2, hp: 760, dmg: [10, 16], prot: .15, spd: 5, dodge: 8, res: 45, rk: [2], threatBoss: 2,
    sk: [{ n: "Berceuse d'ossements", m: .6, t: "ae", at: [1, 2, 3, 4], fx: [{ k: "stun", t: 1, ch: .25 }] }, { n: "Étreinte maternelle", m: 1.2, at: [1, 2], fx: [{ k: "weak", t: 2, ch: 1 }] }, { n: "Enfants des tombes", t: "self", heal: .1, sfx: [{ k: "shield", v: .15, t: 2 }], w: .4 }],
    phase: { at: .5, n: "La Matrone appelle ses enfants. La terre se met à bouger.", sfx: [{ k: "spdUp", v: 3, t: 99 }, { k: "dmgUp", v: .3, t: 99 }] } },
  devoreur_lumiere: { n: "Le Dévoreur de Lumière", art: "devoreur_lumiere", tags: ["impie"], boss: 1, sz: 2, hp: 820, dmg: [12, 18], prot: .18, spd: 6, dodge: 10, res: 50, rk: [2], threatBoss: 3,
    sk: [{ n: "Engloutir", m: 1.3, at: [1, 2, 3], fx: [{ k: "vuln", t: 2, ch: 1 }] }, { n: "Nuit totale", m: .6, t: "ae", at: [1, 2, 3, 4], fx: [{ k: "accDn", v: 15, t: 2, ch: 1 }, { k: "dodgeDn", v: 10, t: 2, ch: .8 }] }, { n: "Festin d'étoiles", t: "self", heal: .1, w: .35 }],
    phase: { at: .5, n: "Les torches s'éteignent une à une. Le Dévoreur grandit.", sfx: [{ k: "dmgUp", v: .45, t: 99 }] } },
  archonte_cendres: { n: "L'Archonte de Cendres", art: "archonte_cendres", tags: ["impie"], boss: 1, sz: 2, hp: 900, dmg: [13, 20], prot: .2, spd: 7, dodge: 10, res: 55, rk: [2], threatBoss: 4,
    sk: [{ n: "Jugement", m: 1.4, at: [1, 2, 3, 4], fx: [{ k: "burn", v: .6, t: 3, ch: 1 }] }, { n: "Ailes de cendre", m: .8, t: "ae", at: [1, 2, 3, 4], fx: [{ k: "burn", v: .5, t: 2, ch: 1 }, { k: "weak", t: 2, ch: .6 }] }, { n: "Couronne d'ailes", t: "self", sfx: [{ k: "shield", v: .18, t: 2 }, { k: "dmgUp", v: .2, t: 2 }], w: .4 }],
    phase: { at: .5, n: "L'Archonte déploie six ailes de cendre. Le ciel brûle.", sfx: [{ k: "dmgUp", v: .45, t: 99 }, { k: "spdUp", v: 3, t: 99 }] } },
});
// chapitre VI, entre la Citadelle et l'Abîme
REGIONS.push({ id: "terres", n: "Les Terres Brûlées", sub: "Chapitre VI", lvl: 25, pool: ["penitent_ardent", "chien_cendre", "pretre_suie", "sentinelle_obsidienne", "chevaucheur_calcine"], elite: ["colosse_braise"], boss: "cardinal",
  d: "Au-delà de la Citadelle, la terre brûle encore. Le Cardinal y emporte les fragments volés.", sky: ["#1a0806", "#4a1a0a"], fog: "#d0602a", accent: "#ff6a3a" });
ABYSS.lvl = 30;
const THREAT_BOSS = { 1: "sans_visage", 2: "matrone_os", 3: "devoreur_lumiere", 4: "archonte_cendres" };
