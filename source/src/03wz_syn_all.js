/* Synergies de classe (12 nov.) : chaque classe en a autant que les autres, liées aux rôles de ses compagnons d'armes.
   Toute équipe de quatre en active une dizaine au moins, quelle que soit sa composition. Bonus modestes : c'est leur nombre qui compte. */
(() => {
  const BY = r => Object.keys(CLASSES).filter(c => CLASSES[c].role === r);
  const RN = { tank: "un tank", soin: "un soigneur", soutien: "un soutien", dps: "une lame (dégâts)" };
  // [classe, [nom, rôle partenaire, bonus, texte] ×4] — le 4e est un serment propre à la classe (actif dès qu'elle part)
  const T = {
    templier: [["Bouclier de la foi", "soin", { prot: .03 }, "+3 % de protection"], ["Croisade", "dps", { dmg: .03 }, "+3 % de dégâts"], ["Chœur des remparts", "soutien", { morale: 5 }, "+5 de résolution au début des combats"], ["Serment du Temple", null, { hp: .02 }, "+2 % de PV"]],
    revenant: [["Pacte d'outre-tombe", "soin", { leech: .02 }, "+2 % de vol de vie"], ["Rancune éternelle", "dps", { crit: 2 }, "+2 de critique"], ["Glas des revenants", "soutien", { thorns: .04 }, "4 % des dégâts de mêlée renvoyés"], ["Serment des tombes", null, { hp: .02 }, "+2 % de PV"]],
    gardien_runes: [["Runes de vie", "soin", { hp: .03 }, "+3 % de PV"], ["Runes de guerre", "dps", { dmg: .03 }, "+3 % de dégâts"], ["Runes chantées", "soutien", { prot: .03 }, "+3 % de protection"], ["Serment de la pierre", null, { prot: .02 }, "+2 % de protection"]],
    pretresse: [["Aube protectrice", "tank", { heal: .05 }, "+5 % de soins"], ["Lumière vengeresse", "dps", { dmg: .03 }, "+3 % de dégâts"], ["Hymne de l'aube", "soutien", { roundHeal: .006 }, "chaque tour, le groupe récupère 0,6 % de ses PV"], ["Serment de l'aube", null, { heal: .03 }, "+3 % de soins"]],
    sorciere: [["Haie d'épines", "tank", { thorns: .04 }, "4 % des dégâts de mêlée renvoyés"], ["Malédiction partagée", "dps", { dot: .06 }, "+6 % aux dégâts sur la durée"], ["Ronde des haies", "soutien", { heal: .05 }, "+5 % de soins"], ["Serment des haies", null, { hp: .02 }, "+2 % de PV"]],
    medecin_peste: [["Quarantaine", "tank", { prot: .03 }, "+3 % de protection"], ["Miasmes", "dps", { dot: .06 }, "+6 % aux dégâts sur la durée"], ["Remèdes amers", "soutien", { heal: .05 }, "+5 % de soins"], ["Serment du bec", null, { leech: .015 }, "+1,5 % de vol de vie"]],
    menestrel: [["Ballade du rempart", "tank", { prot: .03 }, "+3 % de protection"], ["Chant de bataille", "dps", { dmg: .03 }, "+3 % de dégâts"], ["Complainte apaisante", "soin", { heal: .05 }, "+5 % de soins"], ["Serment du luth", null, { morale: 4 }, "+4 de résolution au début des combats"]],
    exorciste: [["Encens protecteur", "tank", { prot: .03 }, "+3 % de protection"], ["Anathème", "dps", { vsImpie: .08 }, "+8 % de dégâts contre les impies"], ["Litanie de guérison", "soin", { heal: .05 }, "+5 % de soins"], ["Serment de la croix", null, { morale: 4 }, "+4 de résolution au début des combats"]],
    berserker: [["Fureur gardée", "tank", { dmg: .03 }, "+3 % de dégâts"], ["Plaies refermées", "soin", { leech: .02 }, "+2 % de vol de vie"], ["Tambours de guerre", "soutien", { crit: 2 }, "+2 de critique"], ["Serment du sang", null, { dmg: .02 }, "+2 % de dégâts"]],
    ombre: [["Derrière le bouclier", "tank", { crit: 2 }, "+2 de critique"], ["Lames soignées", "soin", { dmg: .03 }, "+3 % de dégâts"], ["Pas feutrés", "soutien", { spd: 1 }, "+1 de vitesse"], ["Serment des ombres", null, { crit: 1 }, "+1 de critique"]],
    arbaletriere: [["Ligne de tir", "tank", { dmg: .03 }, "+3 % de dégâts"], ["Carreaux bénis", "soin", { crit: 2 }, "+2 de critique"], ["Cadence", "soutien", { markDmg: .06 }, "+6 % de dégâts contre les cibles marquées"], ["Serment du carreau", null, { dmg: .02 }, "+2 % de dégâts"]],
    pyromancien: [["Mur de flammes", "tank", { prot: .02, dmg: .02 }, "+2 % de protection et de dégâts"], ["Cendres apaisées", "soin", { dot: .06 }, "+6 % aux dégâts sur la durée"], ["Brasier attisé", "soutien", { aoe: .04 }, "+4 % de dégâts de zone"], ["Serment des braises", null, { dmg: .02 }, "+2 % de dégâts"]],
    necromancien: [["Os et acier", "tank", { hp: .03 }, "+3 % de PV"], ["Sève volée", "soin", { leech: .02 }, "+2 % de vol de vie"], ["Requiem", "soutien", { darkDmg: .06 }, "+6 % de dégâts d'ombre"], ["Serment des morts", null, { killHeal: .02 }, "chaque ennemi tué soigne de 2 %"]],
    chasseur_sorcieres: [["Bûcher gardé", "tank", { vsImpie: .08 }, "+8 % de dégâts contre les impies"], ["Absolution", "soin", { crit: 2 }, "+2 de critique"], ["Inquisition", "soutien", { dmg: .03 }, "+3 % de dégâts"], ["Serment du bûcher", null, { vsImpie: .05 }, "+5 % de dégâts contre les impies"]],
    hallebardier: [["Formation serrée", "tank", { prot: .03 }, "+3 % de protection"], ["Garde soignée", "soin", { hp: .03 }, "+3 % de PV"], ["Marche cadencée", "soutien", { dmg: .03 }, "+3 % de dégâts"], ["Serment de la hampe", null, { thorns: .03 }, "3 % des dégâts de mêlée renvoyés"]],
  };
  for (const c in T) T[c].forEach(([n, r, h, d], i) => {
    if (!CLASSES[c]) return;
    SYNERGIES["cs_" + c + "_" + i] = r ? { n, need: [[c], BY(r).filter(x => x !== c)], h, d: `${CLASSES[c].n} et ${RN[r]} : ${d}.`, cls: c } : { n, need: [[c]], h, d: `${CLASSES[c].n} en expédition : ${d}.`, cls: c };
  });
  // le groupe entier : synergies de rôles (toujours au moins une)
  Object.assign(SYNERGIES, {
    rg_deux_lames: { n: "Deux lames", count: { dps: 2 }, h: { dmg: .03 }, d: "Au moins deux lames : +3 % de dégâts." },
    rg_trois_lames: { n: "Tempête d'acier", count: { dps: 3 }, h: { crit: 3 }, d: "Au moins trois lames : +3 de critique." },
    rg_double_soin: { n: "Infirmerie", count: { soin: 2 }, h: { heal: .06 }, d: "Deux soigneurs : +6 % de soins." },
    rg_double_soutien: { n: "Chœur", count: { soutien: 2 }, h: { morale: 6 }, d: "Deux soutiens : +6 de résolution au début des combats." },
    rg_quatre: { n: "Fraternité", h: { hp: .02 }, d: "Quatre héros partent ensemble : +2 % de PV." },
  });
})();
