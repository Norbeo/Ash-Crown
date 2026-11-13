/* Nouvelles compétences (13 nov.) : 2 de plus par classe et 2 de plus par voie d'évolution.
   Même vocabulaire que 01_classes.js (t, use, at, m, fx/sfx/afx, heal, leech, cd, morale…). Fusionnées dans CLASSES au chargement. */
const SKILLS_MORE = {
  templier: {
    base: {
      jugement_ordre: { n: "Jugement de l'Ordre", ic: "mace", use: [1, 2], t: "e", at: [1, 2], m: 1.1, fx: [{ k: "weak", v: .2, t: 2, ch: .8 }], tags: ["sacré"], cd: 1 },
      serment_garde: { n: "Serment de garde", ic: "shield", use: [1, 2, 3], t: "a", at: [1, 2, 3, 4], m: 0, heal: .12, afx: [{ k: "shield", v: .15, t: 2 }], cd: 2 },
    },
    bastion: {
      porte_fer: { n: "Porte de fer", ic: "wall", use: [1, 2], t: "s", m: 0, sfx: [{ k: "protUp", v: .4, t: 2 }, { k: "prov", t: 2 }, { k: "thorns", v: .3, t: 2 }], cd: 3 },
      bouclier_brise: { n: "Coup de bouclier", ic: "shield", use: [1, 2], t: "e", at: [1, 2], m: .8, push: 1, fx: [{ k: "stun", t: 1, ch: .7 }, { k: "protDn", v: .15, t: 2, ch: 1 }] },
    },
    inquisiteur: {
      question: { n: "La Question", ic: "chain", use: [1, 2], t: "e", at: [1, 2, 3], m: 1, fx: [{ k: "vuln", v: .2, t: 3, ch: 1 }, { k: "spdDn", v: 3, t: 2, ch: .8 }] },
      cendres_saintes: { n: "Cendres saintes", ic: "fire", use: [1, 2, 3], t: "ae", at: [1, 2, 3], m: .55, fx: [{ k: "burn", v: .3, t: 3, ch: .8 }], tags: ["feu", "sacré"], cd: 2 },
    },
  },
  revenant: {
    base: {
      poigne_tombe: { n: "Poigne de la tombe", ic: "hand", use: [1, 2], t: "e", at: [1, 2, 3], m: .7, pull: 1, fx: [{ k: "spdDn", v: 3, t: 2, ch: 1 }] },
      souffle_glace: { n: "Souffle glacé", ic: "frost", use: [1, 2, 3], t: "ae", at: [1, 2], m: .6, leech: .15, fx: [{ k: "accDn", v: 10, t: 2, ch: .7 }], cd: 1 },
    },
    spectre: {
      hantise: { n: "Hantise", ic: "ghost", use: [1, 2, 3], t: "e", at: [1, 2, 3, 4], m: .9, fx: [{ k: "weak", v: .25, t: 2, ch: .8 }, { k: "accDn", v: 10, t: 2, ch: .6 }] },
      voile_trepas: { n: "Voile du trépas", ic: "shroud", use: [1, 2, 3], t: "s", m: 0, sfx: [{ k: "dodgeUp", v: 25, t: 2 }, { k: "riposte", v: .7, t: 2 }], cd: 2 },
    },
    seigneur_sang: {
      calice_rouge: { n: "Calice rouge", ic: "blood", use: [1, 2], t: "e", at: [1, 2], m: 1.15, leech: .5, fx: [{ k: "bleed", v: .3, t: 3, ch: .7 }] },
      sang_noble: { n: "Sang noble", ic: "crown", use: [1, 2, 3, 4], t: "s", m: 0, selfDmg: .1, sfx: [{ k: "dmgUp", v: .3, t: 3 }, { k: "critUp", v: 12, t: 3 }], cd: 3 },
    },
  },
  pretresse: {
    base: {
      psaume: { n: "Psaume du matin", ic: "bless", use: [2, 3, 4], t: "aa", m: 0, heal: .07, afx: [{ k: "regen", v: .05, t: 3 }], cd: 1 },
      eclat_divin: { n: "Éclat divin", ic: "ray", use: [2, 3, 4], t: "e", at: [1, 2, 3, 4], m: .8, fx: [{ k: "accDn", v: 12, t: 2, ch: .8 }], tags: ["sacré"], bonus: { tag: "impie", x: 1.4 } },
    },
    sainte: {
      intercession: { n: "Intercession", ic: "heal", use: [2, 3, 4], t: "a", at: [1, 2, 3, 4], m: 0, heal: .4, cleanse: true, afx: [{ k: "protUp", v: .15, t: 2 }], cd: 2 },
      aureole: { n: "Auréole", ic: "sun", use: [2, 3, 4], t: "aa", m: 0, afx: [{ k: "shield", v: .12, t: 2 }, { k: "accUp", v: 8, t: 2 }], cd: 3 },
    },
    martyre: {
      stigmates: { n: "Stigmates", ic: "blood", use: [2, 3, 4], t: "aa", m: 0, selfDmg: .1, heal: .15, afx: [{ k: "dmgUp", v: .15, t: 2 }], cd: 2 },
      bucher_foi: { n: "Bûcher de la foi", ic: "flames", use: [2, 3, 4], t: "ae", at: [1, 2, 3], m: .7, fx: [{ k: "burn", v: .3, t: 3, ch: .8 }], tags: ["feu", "sacré"], cd: 1 },
    },
  },
  sorciere: {
    base: {
      tisane_amere: { n: "Tisane amère", ic: "herb", use: [2, 3, 4], t: "a", at: [1, 2, 3, 4], m: 0, heal: .22, cleanse: true },
      chardons: { n: "Chardons", ic: "thorn", use: [2, 3, 4], t: "ae", at: [1, 2, 3], m: .45, fx: [{ k: "bleed", v: .25, t: 3, ch: .8 }, { k: "spdDn", v: 2, t: 2, ch: .6 }], cd: 1 },
    },
    druidesse: {
      rosee: { n: "Rosée de l'aube", ic: "tree", use: [2, 3, 4], t: "aa", m: 0, heal: .1, afx: [{ k: "regen", v: .07, t: 3 }], cd: 2 },
      ronce_garde: { n: "Ronces gardiennes", ic: "root", use: [2, 3, 4], t: "a", at: [1, 2, 3, 4], m: 0, afx: [{ k: "thorns", v: .35, t: 3 }, { k: "protUp", v: .15, t: 3 }], cd: 2 },
    },
    sorciere_noire: {
      poupee: { n: "Poupée d'épingles", ic: "curse", use: [2, 3, 4], t: "e", at: [1, 2, 3, 4], m: .6, fx: [{ k: "weak", v: .25, t: 3, ch: .9 }, { k: "vuln", v: .15, t: 3, ch: .9 }] },
      chaudron: { n: "Chaudron noir", ic: "flask", use: [2, 3, 4], t: "ae", at: [1, 2, 3, 4], m: .4, fx: [{ k: "poison", v: .35, t: 3, ch: .9 }], cd: 2 },
    },
  },
  menestrel: {
    base: {
      gigue: { n: "Gigue endiablée", ic: "note", use: [2, 3, 4], t: "aa", m: 0, afx: [{ k: "spdUp", v: 3, t: 2 }, { k: "dodgeUp", v: 8, t: 2 }], cd: 1 },
      corde_rompue: { n: "Corde rompue", ic: "lute", use: [2, 3, 4], t: "e", at: [1, 2, 3, 4], m: .85, fx: [{ k: "stun", t: 1, ch: .45 }] },
    },
    heraut: {
      etendard: { n: "Étendard levé", ic: "banner", use: [2, 3, 4], t: "aa", m: 0, afx: [{ k: "dmgUp", v: .15, t: 3 }, { k: "protUp", v: .08, t: 3 }], morale: 6, cd: 3 },
      sonner_charge: { n: "Sonner la charge", ic: "horn", use: [2, 3, 4], t: "a", at: [1, 2, 3, 4], m: 0, afx: [{ k: "critUp", v: 15, t: 2 }, { k: "accUp", v: 10, t: 2 }], cd: 1 },
    },
    chantre: {
      lamento: { n: "Lamento", ic: "bell", use: [2, 3, 4], t: "ae", at: [1, 2, 3, 4], m: .45, fx: [{ k: "weak", v: .15, t: 2, ch: .8 }], cd: 1 },
      voix_morts: { n: "Voix des morts", ic: "skull", use: [2, 3, 4], t: "e", at: [1, 2, 3, 4], m: 1, fx: [{ k: "mark", t: 2, ch: 1 }, { k: "spdDn", v: 3, t: 2, ch: .8 }] },
    },
  },
  berserker: {
    base: {
      eventrer: { n: "Éventrer", ic: "axe", use: [1, 2], t: "e", at: [1, 2], m: 1.2, fx: [{ k: "bleed", v: .35, t: 3, ch: .8 }], cd: 1 },
      peau_ours: { n: "Peau d'ours", ic: "claw", use: [1, 2, 3], t: "s", m: 0, healSelf: .15, sfx: [{ k: "protUp", v: .2, t: 2 }] , cd: 2 },
    },
    ecorcheur: {
      crochets: { n: "Crochets d'écorcheur", ic: "claw", use: [1, 2], t: "e", at: [1, 2, 3], m: .9, pull: 1, fx: [{ k: "bleed", v: .3, t: 3, ch: 1 }] },
      trophee: { n: "Trophée sanglant", ic: "blood", use: [1, 2], t: "e", at: [1, 2], m: 1.3, bonus: { selfHit: 1, x: 1.4 }, leech: .2, cd: 2 },
    },
    chef_guerre: {
      cor_guerre: { n: "Cor de guerre", ic: "horn", use: [1, 2, 3], t: "aa", m: 0, afx: [{ k: "dmgUp", v: .18, t: 2 }], morale: 8, cd: 3 },
      fracas: { n: "Fracas", ic: "hammer", use: [1, 2], t: "ae", at: [1, 2], m: .8, fx: [{ k: "stun", t: 1, ch: .4 }, { k: "protDn", v: .1, t: 2, ch: .8 }], cd: 2 },
    },
  },
  ombre: {
    base: {
      croc_en_jambe: { n: "Croc-en-jambe", ic: "dagger", use: [1, 2, 3], t: "e", at: [1, 2], m: .7, push: 1, fx: [{ k: "dodgeDn", v: 12, t: 2, ch: 1 }] },
      fiole_noire: { n: "Fiole noire", ic: "smoke", use: [2, 3, 4], t: "ae", at: [2, 3, 4], m: .45, fx: [{ k: "poison", v: .25, t: 3, ch: .8 }, { k: "accDn", v: 8, t: 2, ch: .7 }], cd: 2 },
    },
    assassin: {
      lame_cachee: { n: "Lame cachée", ic: "dagger", use: [1, 2, 3], t: "e", at: [1, 2, 3, 4], m: 1.25, cr: 15 },
      contrat: { n: "Contrat", ic: "mark", use: [1, 2, 3, 4], t: "e", at: [1, 2, 3, 4], m: .4, fx: [{ k: "mark", t: 3, ch: 1 }, { k: "vuln", v: .2, t: 3, ch: 1 }], cd: 2 },
    },
    ombre_sang: {
      saignee_lune: { n: "Saignée de lune", ic: "moon", use: [1, 2, 3], t: "ae", at: [1, 2, 3], m: .6, fx: [{ k: "bleed", v: .3, t: 3, ch: .9 }], cd: 1 },
      pas_rouge: { n: "Pas rouge", ic: "blood", use: [1, 2, 3, 4], t: "s", m: 0, sfx: [{ k: "stealth", t: 1 }, { k: "critUp", v: 20, t: 2 }], cd: 3 },
    },
  },
  arbaletriere: {
    base: {
      carreau_barbele: { n: "Carreau barbelé", ic: "bolt", use: [2, 3, 4], t: "e", at: [1, 2, 3, 4], m: .9, fx: [{ k: "bleed", v: .3, t: 3, ch: .8 }] },
      tir_jambes: { n: "Tir aux jambes", ic: "aim", use: [2, 3, 4], t: "e", at: [1, 2, 3, 4], m: .8, fx: [{ k: "spdDn", v: 4, t: 2, ch: 1 }, { k: "dodgeDn", v: 10, t: 2, ch: .8 }], cd: 1 },
    },
    tireuse_elite: {
      souffle_retenu: { n: "Souffle retenu", ic: "eye", use: [3, 4], t: "s", m: 0, sfx: [{ k: "accUp", v: 20, t: 2 }, { k: "critUp", v: 25, t: 2 }], cd: 2 },
      perce_armure: { n: "Perce-armure", ic: "pierce", use: [3, 4], t: "e", at: [1, 2, 3, 4], m: 1.1, fx: [{ k: "protDn", v: .25, t: 3, ch: 1 }] },
    },
    chasseresse: {
      appat: { n: "Appât", ic: "trap", use: [2, 3, 4], t: "e", at: [1, 2, 3, 4], m: .5, pull: 1, fx: [{ k: "mark", t: 2, ch: 1 }] },
      meute: { n: "Hallali", ic: "paw", use: [2, 3, 4], t: "e", at: [1, 2, 3, 4], m: .9, petStrike: 1, cd: 1 },
    },
  },
  pyromancien: {
    base: {
      etincelles: { n: "Gerbe d'étincelles", ic: "flare", use: [2, 3, 4], t: "ae", at: [1, 2, 3, 4], m: .4, fx: [{ k: "burn", v: .2, t: 2, ch: .7 }], tags: ["feu"] },
      mur_flammes: { n: "Mur de flammes", ic: "flames", use: [2, 3, 4], t: "aa", m: 0, afx: [{ k: "thorns", v: .25, t: 2 }, { k: "protUp", v: .08, t: 2 }], cd: 3 },
    },
    archimage: {
      lance_solaire: { n: "Lance solaire", ic: "ray", use: [2, 3, 4], t: "e", at: [1, 2, 3, 4], m: 1.35, fx: [{ k: "burn", v: .35, t: 3, ch: .8 }], tags: ["feu"], cd: 1 },
      fournaise: { n: "Fournaise", ic: "fire", use: [3, 4], t: "s", m: 0, sfx: [{ k: "dmgUp", v: .3, t: 3 }, { k: "critUp", v: 10, t: 3 }], cd: 3 },
    },
    demoniste: {
      chaines_enfer: { n: "Chaînes de l'enfer", ic: "chain", use: [2, 3, 4], t: "e", at: [1, 2, 3, 4], m: .8, fx: [{ k: "stun", t: 1, ch: .5 }, { k: "burn", v: .3, t: 3, ch: .8 }], cd: 2 },
      dime_sang: { n: "Dîme de sang", ic: "pact", use: [2, 3, 4], t: "s", m: 0, selfDmg: .12, sfx: [{ k: "dmgUp", v: .4, t: 2 }], cd: 2 },
    },
  },
  necromancien: {
    base: {
      rale: { n: "Râle d'agonie", ic: "skull", use: [2, 3, 4], t: "e", at: [1, 2, 3, 4], m: .7, leech: .3, fx: [{ k: "weak", v: .15, t: 2, ch: .7 }] },
      osselets: { n: "Osselets", ic: "bones", use: [2, 3, 4], t: "a", at: [1, 2, 3, 4], m: 0, afx: [{ k: "shield", v: .18, t: 2 }], cd: 1 },
    },
    liche: {
      phylactere: { n: "Phylactère", ic: "crown", use: [2, 3, 4], t: "s", m: 0, healSelf: .25, sfx: [{ k: "shield", v: .25, t: 3 }], cd: 3 },
      givre_ame: { n: "Givre de l'âme", ic: "frost", use: [2, 3, 4], t: "ae", at: [1, 2, 3, 4], m: .5, fx: [{ k: "spdDn", v: 4, t: 2, ch: .9 }], cd: 1 },
    },
    maitre_tombes: {
      fosse_commune: { n: "Fosse commune", ic: "bones", use: [2, 3, 4], t: "ae", at: [1, 2], m: .75, fx: [{ k: "stun", t: 1, ch: .3 }], cd: 1 },
      linceul_os: { n: "Linceul d'os", ic: "shroud", use: [2, 3, 4], t: "aa", m: 0, afx: [{ k: "protUp", v: .12, t: 3 }], cd: 3 },
    },
  },
  gardien_runes: {
    base: {
      rune_vie: { n: "Rune de vie", ic: "pillar", use: [1, 2, 3], t: "a", at: [1, 2, 3, 4], m: 0, heal: .15, afx: [{ k: "regen", v: .05, t: 3 }], cd: 1 },
      enclume: { n: "Coup d'enclume", ic: "hammer", use: [1, 2], t: "e", at: [1, 2], m: 1.1, fx: [{ k: "protDn", v: .15, t: 2, ch: .9 }] },
    },
    thane_pierre: {
      rocher: { n: "Rocher roulant", ic: "boom", use: [1, 2], t: "ae", at: [1, 2], m: .8, push: 1, fx: [{ k: "stun", t: 1, ch: .3 }], cd: 2 },
      granit: { n: "Chair de granit", ic: "wall", use: [1, 2, 3], t: "s", m: 0, sfx: [{ k: "protUp", v: .35, t: 3 }, { k: "prov", t: 2 }], cd: 3 },
    },
    forge_tonnerre: {
      enclume_foudre: { n: "Enclume foudroyée", ic: "bolt", use: [1, 2, 3], t: "e", at: [1, 2, 3, 4], m: 1.15, fx: [{ k: "stun", t: 1, ch: .35 }] },
      orage_runique: { n: "Orage runique", ic: "rain", use: [1, 2, 3], t: "ae", at: [1, 2, 3, 4], m: .5, fx: [{ k: "accDn", v: 10, t: 2, ch: .7 }], cd: 2 },
    },
  },
  medecin_peste: {
    base: {
      cauterisation: { n: "Cautérisation", ic: "fire", use: [2, 3, 4], t: "a", at: [1, 2, 3, 4], m: 0, heal: .2, cleanse: true, cd: 1 },
      bec_venin: { n: "Bec venimeux", ic: "mask", use: [1, 2, 3], t: "e", at: [1, 2], m: .8, fx: [{ k: "poison", v: .35, t: 3, ch: .9 }] },
    },
    chirurgien: {
      transfusion: { n: "Transfusion", ic: "blood", use: [2, 3, 4], t: "a", at: [1, 2, 3, 4], m: 0, selfDmg: .08, heal: .35, cd: 1 },
      amputation: { n: "Amputation", ic: "dagger", use: [1, 2, 3], t: "e", at: [1, 2], m: 1.2, fx: [{ k: "weak", v: .25, t: 3, ch: .9 }, { k: "bleed", v: .3, t: 3, ch: .8 }], cd: 2 },
    },
    apothicaire: {
      vapeurs: { n: "Vapeurs délétères", ic: "smoke", use: [2, 3, 4], t: "ae", at: [1, 2, 3, 4], m: .35, fx: [{ k: "poison", v: .3, t: 3, ch: .8 }, { k: "accDn", v: 8, t: 2, ch: .6 }], cd: 1 },
      panacee: { n: "Panacée", ic: "flask", use: [2, 3, 4], t: "aa", m: 0, heal: .12, cleanse: true, afx: [{ k: "regen", v: .05, t: 2 }], cd: 3 },
    },
  },
  chasseur_sorcieres: {
    base: {
      pieu_argent: { n: "Pieu d'argent", ic: "pierce", use: [1, 2, 3], t: "e", at: [1, 2, 3], m: 1, bonus: { tag: "impie", x: 1.4 }, tags: ["sacré"] },
      fumee_sauge: { n: "Fumée de sauge", ic: "smoke", use: [1, 2, 3, 4], t: "aa", m: 0, cleanse: true, afx: [{ k: "accUp", v: 8, t: 2 }], cd: 2 },
    },
    purificateur: {
      brandon: { n: "Brandon", ic: "flames", use: [1, 2, 3], t: "e", at: [1, 2, 3], m: .9, fx: [{ k: "burn", v: .4, t: 3, ch: 1 }], tags: ["feu"] },
      autodafe_petit: { n: "Cercle de sel", ic: "sanct", use: [1, 2, 3, 4], t: "aa", m: 0, afx: [{ k: "protUp", v: .1, t: 2 }, { k: "shield", v: .08, t: 2 }], cd: 3 },
    },
    traqueur: {
      piste: { n: "Sur la piste", ic: "eye", use: [1, 2, 3, 4], t: "e", at: [1, 2, 3, 4], m: .5, fx: [{ k: "mark", t: 3, ch: 1 }, { k: "dodgeDn", v: 15, t: 3, ch: 1 }] },
      filet: { n: "Filet lesté", ic: "trap", use: [1, 2, 3], t: "e", at: [1, 2, 3, 4], m: .6, fx: [{ k: "stun", t: 1, ch: .6 }, { k: "spdDn", v: 3, t: 2, ch: 1 }], cd: 2 },
    },
  },
  hallebardier: {
    base: {
      garde_basse: { n: "Garde basse", ic: "guard", use: [1, 2], t: "s", m: 0, sfx: [{ k: "riposte", v: .7, t: 2 }, { k: "protUp", v: .12, t: 2 }], cd: 1 },
      coup_pommeau: { n: "Coup de talon", ic: "hammer", use: [1, 2], t: "e", at: [1], m: .7, fx: [{ k: "stun", t: 1, ch: .6 }] },
    },
    lansquenet: {
      double_taille: { n: "Double taille", ic: "axe", use: [1, 2], t: "e", at: [1, 2], m: .65, hits: 2 },
      mercenaire: { n: "Solde du mercenaire", ic: "whirl", use: [1, 2], t: "s", m: 0, sfx: [{ k: "dmgUp", v: .25, t: 2 }, { k: "critUp", v: 10, t: 2 }], cd: 2 },
    },
    garde_roi: {
      haie_honneur: { n: "Haie d'honneur", ic: "banner", use: [1, 2], t: "aa", m: 0, afx: [{ k: "protUp", v: .12, t: 2 }], morale: 5, cd: 2 },
      chatiment_roi: { n: "Justice du roi", ic: "crown", use: [1, 2], t: "e", at: [1, 2, 3], m: 1.15, fx: [{ k: "weak", v: .2, t: 2, ch: .8 }] },
    },
  },
  exorciste: {
    base: {
      chapelet: { n: "Chapelet", ic: "bless", use: [2, 3, 4], t: "a", at: [1, 2, 3, 4], m: 0, heal: .15, afx: [{ k: "protUp", v: .1, t: 2 }] },
      verbe_sacre: { n: "Verbe sacré", ic: "ray", use: [1, 2, 3], t: "e", at: [1, 2, 3, 4], m: .85, bonus: { tag: "impie", x: 1.5 }, fx: [{ k: "spdDn", v: 2, t: 2, ch: .6 }], tags: ["sacré"] },
    },
    confesseur: {
      secret_confession: { n: "Secret de la confession", ic: "cleanse", use: [2, 3, 4], t: "a", at: [1, 2, 3, 4], m: 0, heal: .25, cleanse: true, afx: [{ k: "regen", v: .05, t: 2 }], cd: 1 },
      paix: { n: "Paix de l'âme", ic: "sanct", use: [2, 3, 4], t: "aa", m: 0, afx: [{ k: "shield", v: .1, t: 2 }], morale: 8, cd: 3 },
    },
    penitent: {
      haire: { n: "Haire", ic: "chain", use: [1, 2, 3], t: "s", m: 0, selfDmg: .08, sfx: [{ k: "thorns", v: .4, t: 3 }, { k: "dmgUp", v: .2, t: 3 }], cd: 2 },
      fouet_saint: { n: "Fouet saint", ic: "whirl", use: [1, 2, 3], t: "ae", at: [1, 2], m: .7, fx: [{ k: "bleed", v: .2, t: 3, ch: .7 }], tags: ["sacré"], cd: 1 },
    },
  },
};
for (const c in SKILLS_MORE) { const C = CLASSES[c]; if (!C) continue;
  for (const w in SKILLS_MORE[c]) { const L = SKILLS_MORE[c][w];
    if (w === "base") Object.assign(C.skills, L);
    else if (C.evos[w]) { const E = C.evos[w]; E.skills = Object.assign(E.skills || {}, L); } } }
