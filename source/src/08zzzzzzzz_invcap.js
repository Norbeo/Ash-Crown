/* Inventaire plafonné à 1000 objets (logique, vaut aussi pour les séries et les bots) : le surplus le moins bon est recyclé. */
const INV_CAP = 1000;
function invCapLogic() {
  if (typeof S === "undefined" || !S || !S.inv || S.inv.length <= INV_CAP) return 0;
  const free = S.inv.filter(it => !it.lock && !it.uniq).sort((a, b) => (a.rar - b.rar) || ((a.tier || 0) - (b.tier || 0)) || ((a.up || 0) - (b.up || 0)));
  let n = 0; while (S.inv.length > INV_CAP && free.length) { if (salvageItem(free.shift())) n++; } return n;
}
{ const gr = grantReward; grantReward = function () { const r = gr.apply(this, arguments); invCapLogic(); return r; }; }
/* Qualités ultimes vraiment rares : Primordial et Éternel ne dépendent plus de la cascade chance/plancher
   (la chance les multipliait par 100+) ; chance propre = taux de base × (1 + chance) × (1 + plancher/2). */
{ const rr = rollRarity; rollRarity = function (luck = 0, floor = 0) { const k = (1 + Math.max(0, luck + (typeof cycleLuck === "function" ? cycleLuck() : 0))) * (1 + (floor || 0) / 2), u = rnd() * 100;
    if (u < RARITY[9].p * k) return 9; if (u < (RARITY[9].p + RARITY[8].p) * k) return 8; return Math.min(7, rr.apply(this, arguments)); }; }
