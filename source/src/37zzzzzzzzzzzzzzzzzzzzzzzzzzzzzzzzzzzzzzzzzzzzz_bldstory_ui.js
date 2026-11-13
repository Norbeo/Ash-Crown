/* Archives › Histoire : les petites histoires du Bastion déjà vécues (une par niveau de bâtiment atteint), relisibles. */
function bldStoryCodexHTML() {
  const blds = Object.keys(BLD_SCENES).filter(k => BUILDINGS[k] && (S.bld[k] || 1) >= 2);
  if (!blds.length) return `<p class="tiny dim">Les histoires du Bastion apparaîtront ici à mesure que vos bâtiments grandiront.</p>`;
  return blds.map(k => { const lv = S.bld[k] || 1, L = Object.keys(BLD_SCENES[k]).map(Number).filter(n => n <= lv).sort((a, b) => a - b);
    return `<details class="panel" style="padding:10px 12px;margin-top:8px"><summary class="row sp" style="cursor:pointer"><b>${ico(BUILDINGS[k].ic || "castle", "#e8c878", 16)} ${bldName(k)}</b><span class="tiny dim">${L.length} histoire${L.length > 1 ? "s" : ""}</span></summary>${L.map(n => `<div style="margin-top:8px"><div class="row sp"><b class="small gold">Niveau ${n}</b><button class="btn sm ghost" data-a="bldStory" data-v="${k}:${n}">▶ Revoir</button></div>${BLD_SCENES[k][n].map(sceneLineHTML).join("")}</div>`).join("")}</details>`; }).join("");
}
{ const sc = scenesCodexHTML; scenesCodexHTML = function () { return sc.apply(this, arguments) + `<h2 style="margin-top:14px">${ico("castle", "#e8c878")} Histoires du Bastion</h2>${bldStoryCodexHTML()}`; }; }
ACT.bldStory = v => { const [k, n] = String(v).split(":"); const L = (BLD_SCENES[k] || {})[n]; if (L) showLines(`${bldName(k)} — niveau ${n}`, L); };
