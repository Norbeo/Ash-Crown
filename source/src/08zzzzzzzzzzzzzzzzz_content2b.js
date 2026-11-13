/* Contenu additionnel (suite) : mutations de l'Abîme, présages, défis de combat. */
Object.assign(MUTATIONS, {
  verre: { n: "Plaies ouvertes", d: "Soins des héros −30 %", r: "Butin : +1 qualité, or ×1,3", heal: -.3, rarUp: 1, gold: .3 },
  horde: { n: "La horde", d: "Ennemis +15 % PV et +10 % dégâts", r: "Expérience ×1,6", ehp: .15, edmg: .1, xp: .6 },
  avare: { n: "Bourses percées", d: "Or −40 %", r: "Gardien : +5 éclats", gold: -.4, shards: 5 },
  tenebres: { n: "Ténèbres", d: "Lueur −25, ennemis +1 vitesse", r: "Élites et gardien : un objet de plus, or ×1,3", light: -25, espd: 1, extra: 1, gold: .3 },
});
Object.assign(OMENS, {
  cendre: { n: "Présage de cendre", ic: "ember", d: "Ennemis +8 % de PV et de dégâts ; or +30 %.", ehp: .08, edmg: .08, gold: .3 },
  lune_noire: { n: "Lune noire", ic: "moon", d: "Lueur −10 au départ ; expérience +25 %.", light: -10, xp: .25 },
  hiboux: { n: "Cri des hiboux", ic: "feather", d: "Meilleur butin ; ennemis +6 % de dégâts.", luck: .06, edmg: .06 },
  cloche: { n: "Glas lointain", ic: "bell", d: "Héros +5 % de dégâts ; ennemis +10 % de PV.", hdmg: .05, ehp: .1 },
});
Object.assign(CHALLENGES, {
  eclair: { n: "Éclair", d: "Gagner en 6 tours ou moins.", ok: B => B.round <= 6 },
  intact: { n: "Intacts", d: "Gagner sans qu'aucun héros ne tombe.", ok: B => !(B.fallen || []).length },
  precis: { n: "Lames précises", d: "Porter au moins 8 coups critiques.", ok: B => (B.crits || 0) >= 8 },
});
