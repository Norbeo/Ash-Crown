/* Marchand ambulant › rachat : onglets par qualité, vente groupée par qualité (cases à cocher), objets verrouillés et uniques jamais vendus. */
const mSellable = it => !it.uniq && !it.lock;
function mSellPool() { const keep = UI.mSellKeep !== false; return S.inv.filter(it => mSellable(it) && !(keep && typeof itemUseful === "function" && itemUseful(it))); }
merchantSellHTML = function () {
  const all = S.inv.filter(mSellable), qs = [...new Set(all.map(it => it.rar))].sort((a, b) => a - b);
  if (!all.length) return `<h3 style="margin-top:14px">${ico("coin", "#e8c060", 14)} Il rachète aussi</h3><div class="empty">Rien à vendre (les objets verrouillés et les uniques de gardien ne se vendent pas).</div>`;
  let q = UI.mSellQ; if (q == null || (q >= 0 && !qs.includes(q))) q = UI.mSellQ = qs[0];
  const L = all.filter(it => q < 0 || it.rar === q).sort((a, b) => b.rar - a.rar || b.tier - a.tier);
  const sel = UI.mSellSet || (UI.mSellSet = {}), keep = UI.mSellKeep !== false, pool = mSellPool().filter(it => sel[it.rar]);
  const tabs = `<div class="tabs" style="flex-wrap:wrap;gap:4px">${qs.map(r => `<button class="btn sm ${q === r ? "on" : ""}" data-a="mSellQ" data-v="${r}"><span class="rar${r}">${RARITY[r].n}</span> ${all.filter(it => it.rar === r).length}</button>`).join("")}<button class="btn sm ${q < 0 ? "on" : ""}" data-a="mSellQ" data-v="-1">Tout ${all.length}</button></div>`;
  const bulk = `<div class="card" style="cursor:default;margin:8px 0;border-color:#e8c06055"><div class="small"><b>${ico("coin", "#e8c060", 14)} Vente par qualité</b> <span class="tiny dim">— cochez les qualités à vendre d'un coup.</span></div>
    <div class="row" style="gap:4px;flex-wrap:wrap;margin:6px 0">${qs.map(r => `<button class="btn sm ${sel[r] ? "gold" : "ghost"}" data-a="mSellTog" data-v="${r}">${sel[r] ? "☑" : "☐"} <span class="rar${r}">${RARITY[r].n}</span></button>`).join("")}</div>
    <div class="row sp" style="gap:6px;flex-wrap:wrap"><button class="btn sm ghost" data-a="mSellKeep">${keep ? "☑" : "☐"} Garder ce qui améliore un héros</button><button class="btn sm ${pool.length ? "gold" : "ghost off"}" data-a="mSellBulk">Vendre ${pool.length} objet${pool.length > 1 ? "s" : ""} · ${fmt(pool.reduce((a, it) => a + sellPrice(it), 0))} or</button></div></div>`;
  const tot = L.reduce((a, it) => a + sellPrice(it), 0);
  return `<h3 style="margin-top:14px">${ico("coin", "#e8c060", 14)} Il rachète aussi <span class="tiny dim">(${all.length} objets vendables ; verrouillés et uniques exclus)</span></h3>${bulk}${tabs}
    <div class="row sp" style="margin:6px 0"><span class="tiny dim">${L.length} objet${L.length > 1 ? "s" : ""} · ${fmt(tot)} or</span>${q >= 0 ? `<button class="btn sm" data-a="mSellAll" data-v="${q}">Tout vendre (${RARITY[q].n})</button>` : ""}</div>
    <div class="col">${L.map(it => `<div class="row card" style="cursor:default">${slotHTML(it, "itemInfo", it.id)}<div style="flex:1;min-width:0"><b class="rar${it.rar}">${gearName(it)}</b> <span class="tiny dim">${RARITY[it.rar].n}</span><div class="tiny dim">${itemLine(it)}</div></div><button class="btn sm" data-a="mSell" data-v="${it.id}">Vendre · ${fmt(sellPrice(it))}</button></div>`).join("")}</div>`;
};
function mSellList(L, after) { if (!L.length) return; const g0 = L.reduce((a, it) => a + sellPrice(it), 0);
  confirmBox(`Vendre ${L.length} objet${L.length > 1 ? "s" : ""} pour ${fmt(g0)} or ?`, () => { let g = 0; for (const it of L) { const i = S.inv.indexOf(it); if (i >= 0 && mSellable(it)) { S.inv.splice(i, 1); g += sellPrice(it); gemsBack(it); } } S.gold += g; sfx("coin"); save(); renderHud(); toast(`+${fmt(g)} or`, "good"); (after || ACT.merchant)(); }, { yes: "Vendre" }); }
ACT.mSellAll = q => mSellList(S.inv.filter(it => mSellable(it) && it.rar === +q));
ACT.mSellTog = r => { const s = UI.mSellSet || (UI.mSellSet = {}); s[+r] = !s[+r]; ACT.merchant(); };
ACT.mSellKeep = () => { UI.mSellKeep = UI.mSellKeep === false; ACT.merchant(); };
ACT.mSellBulk = () => { const sel = UI.mSellSet || {}; mSellList(mSellPool().filter(it => sel[it.rar])); };
ACT.mSell = id => { const i = S.inv.findIndex(x => x.id === id); if (i < 0 || !mSellable(S.inv[i])) return; const it = S.inv[i]; S.inv.splice(i, 1); S.gold += sellPrice(it); gemsBack(it); sfx("coin"); save(); renderHud(); ACT.merchant(); };
