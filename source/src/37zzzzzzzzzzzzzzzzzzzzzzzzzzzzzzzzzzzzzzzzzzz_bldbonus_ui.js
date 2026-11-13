/* Bonus de niveau de bâtiment affiché dans chaque bâtiment (actuel → prochain niveau). */
{ const bf = bldFooter; bldFooter = function (k) { const s = bf.apply(this, arguments); if (!BLD_BONUS[k]) return s; const l = S.bld[k], mx = BUILDINGS[k].max;
    return `<div class="tiny" style="margin-top:6px">${ico("up", "#e8c878", 12)} <b>Bonus du bâtiment</b> (niveau ${l}) : <span class="gold">${bldBonusText(k)}</span>${l < mx ? ` <span class="dim">→ niveau ${l + 1} : ${bldBonusText(k, l + 1)}</span>` : ""}</div>` + s; }; }
