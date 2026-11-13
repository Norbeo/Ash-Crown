/* Forge › Inventaire : objets regroupés par qualité dans des catégories repliables (comme les gemmes), de la meilleure à la moins bonne. */
{ const prev = invList; invList = function (f) {
    const bar = invFilterBar(), F = invFilterFn(), all = S.inv.filter(it => (!f || f(it)) && F(it));
    if (!all.length) return prev.apply(this, arguments);
    const O = UI.invOpen || (UI.invOpen = {}), q = UI.invF && UI.invF.q, rs = [...new Set(all.map(it => it.rar))].sort((a, b) => b - a);
    const groups = rs.map(r => { const L = all.filter(it => it.rar === r), op = !!O[r] || !!q || rs.length === 1, kinds = { wpn: 0, arm: 0, tr: 0 }; for (const it of L) kinds[it.kind]++;
      const body = op ? prev.call(this, it => (!f || f(it)) && it.rar === r).slice(bar.length) : "";
      return `<div class="card" style="cursor:default;padding:0;margin-bottom:6px;border-color:${RARITY[r].c}66"><div class="row sp" style="cursor:pointer;padding:8px 10px" data-a="invCat" data-v="${r}"><b class="rar${r}">${RARITY[r].n}</b><span class="tiny">${L.length} objet${L.length > 1 ? "s" : ""} <span class="dim">(${kinds.wpn} arme${kinds.wpn > 1 ? "s" : ""} · ${kinds.arm} armure${kinds.arm > 1 ? "s" : ""} · ${kinds.tr} bibelot${kinds.tr > 1 ? "s" : ""})</span> ${op ? "▾" : "▸"}</span></div>${op ? `<div style="padding:0 8px 8px">${body}</div>` : ""}</div>`; }).join("");
    return bar + `<p class="tiny dim" style="margin:2px 0 6px">Touchez une qualité pour dérouler ses objets.</p>` + groups; }; }
ACT.invCat = r => { const O = UI.invOpen || (UI.invOpen = {}); O[r] = !O[r]; openBuilding("forge", "inv"); };
// filtres repliés derrière un bouton tant qu'aucun n'est actif
{ const fb = invFilterBar; invFilterBar = function () { const F = UI.invF || {}, act = ["kind", "tier", "rar", "cls"].some(k => F[k] !== undefined && F[k] !== "") || F.eq || F.q || F.upOnly || F.ult;
    if (UI.invFiltOpen || act) return `<button class="btn sm ghost" data-a="invFilt" style="margin-bottom:4px">${ico("scroll")}Filtres ▾${act ? " (actifs)" : ""}</button>` + fb.apply(this, arguments);
    return `<button class="btn sm ghost" data-a="invFilt" style="margin-bottom:6px">${ico("scroll")}Filtres et recherche ▸</button>`; }; }
ACT.invFilt = () => { UI.invFiltOpen = !UI.invFiltOpen; openBuilding("forge", "inv"); };
