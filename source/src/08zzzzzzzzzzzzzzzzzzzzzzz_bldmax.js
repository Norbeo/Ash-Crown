/* Bâtiments jusqu'au niveau 10 (13 nov.) : Taverne, Chapelle, Salle des maîtres et Ménagerie montent maintenant à 10 comme la Forge et la Fonderie.
   Chaque bâtiment donne en plus un bonus permanent qui grandit avec son niveau (BLD_BONUS, affiché dans le bâtiment). */
for (const k of ["taverne", "chapelle", "academie", "menagerie"]) {
  const B = BUILDINGS[k]; B.max = 10;
  const c5 = B.cost[4] || 3200, s5 = B.shards[4] || 4;
  B.cost = B.cost.slice(0, 5).concat([c5 * 2.2, c5 * 4.5, c5 * 9, c5 * 18, c5 * 36].map(v => Math.round(v / 100) * 100));
  B.shards = B.shards.slice(0, 5).concat([s5 + 2, s5 + 5, s5 + 9, s5 + 14, s5 + 20]);
}
// noms de bâtiments aux niveaux 8 et 10
BUILDINGS.taverne.nl = [[10, "Salle des Héros"], [8, "Auberge fortifiée"]].concat(BUILDINGS.taverne.nl || []);
BUILDINGS.chapelle.nl = [[10, "Cathédrale de l'Ordre"], [8, "Église fortifiée"]].concat(BUILDINGS.chapelle.nl || []);
BUILDINGS.academie.nl = [[10, "Citadelle des Grands Maîtres"], [8, "Haute Salle des maîtres"]].concat(BUILDINGS.academie.nl || []);
BUILDINGS.menagerie.nl = [[10, "Donjon des Bêtes"], [8, "Grande Ménagerie"]].concat(BUILDINGS.menagerie.nl || []);

// bonus par niveau de bâtiment (niveau 1 = rien, puis par niveau au-delà)
const BLD_BONUS = {
  taverne: { per: .02, t: v => `+${Math.round(v * 100)} % d'expérience gagnée` },
  forge: { per: .01, t: v => `+${Math.round(v * 100)} % de dégâts pour tous les héros` },
  chapelle: { per: .01, t: v => `+${Math.round(v * 100)} % de PV max pour tous les héros` },
  academie: { per: .5, t: v => `+${+v.toFixed(1)} % de chance de critique pour tous les héros` },
  menagerie: { per: .03, t: v => `+${Math.round(v * 100)} % de puissance des compagnons` },
  fonderie: { per: .02, t: v => `+${Math.round(v * 100)} % d'or gagné en expédition` },
};
function bldBonusV(k, l) { const lv = l == null ? (typeof S !== "undefined" && S && S.bld ? S.bld[k] || 1 : 1) : l; return Math.max(0, lv - 1) * BLD_BONUS[k].per; }
function bldBonusText(k, l) { return BLD_BONUS[k].t(bldBonusV(k, l)); }
PAS_HOOKS.push(() => { if (typeof S === "undefined" || !S || !S.bld) return []; const o = [];
  const d = bldBonusV("forge"), hp = bldBonusV("chapelle"), cr = bldBonusV("academie");
  if (d) o.push({ k: "stat", s: "dmg", v: d }); if (hp) o.push({ k: "stat", s: "hp", v: hp }); if (cr) o.push({ k: "stat", s: "crit", v: cr });
  return o; });
{ const gr = grantReward; grantReward = function (run, R) { try { if (R && S && S.bld && run && !run._sim0) { if (R.xp) R.xp = Math.round(R.xp * (1 + bldBonusV("taverne"))); if (R.gold) R.gold = Math.round(R.gold * (1 + bldBonusV("fonderie"))); } } catch (e) { } return gr.apply(this, arguments); }; }
{ const pm = petMul; petMul = function (id) { const m = pm.apply(this, arguments); try { const b = bldBonusV("menagerie"); if (b && m) { if (m.dmg != null) m.dmg *= 1 + b; if (m.sup != null) m.sup *= 1 + b; } } catch (e) { } return m; }; }

// garde-fous pour les niveaux 6 à 10 (formules pensées pour un maximum de 5)
healInjured = function (id) { const h = heroById(id); if (!h || !isInjured(h)) return false; const c = Math.round(healCost(h) * (1 - Math.min(.6, (S.bld.chapelle - 1) * .1)) * (1 - Math.min(.4, .01 * advA()))); if (S.gold < c) return false; S.gold -= c; h.injured = 0; return true; };
{ const rl = recruitLevel; recruitLevel = function () { const t = S.bld.taverne; if (t <= 5) return rl.apply(this, arguments); S.bld.taverne = 5; try { return rl.apply(this, arguments) + (t - 5); } finally { S.bld.taverne = t; } }; }
{ const rr = refreshRecruits; refreshRecruits = function () { const t = S.bld.taverne; if (t <= 5) return rr.apply(this, arguments); S.bld.taverne = 5 + Math.ceil((t - 5) / 2); try { return rr.apply(this, arguments); } finally { S.bld.taverne = t; } }; }
