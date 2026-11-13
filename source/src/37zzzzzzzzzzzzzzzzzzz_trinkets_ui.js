/* Forge › onglet Bibelots (expert) : inventaire des seuls bibelots, fusion par qualité et « Fusionner tout » en cascade. */
const TR_FUSE_TOP = 7; // la cascade s'arrête à Primordial (8) : l'Éternel ne s'obtient pas par fusion
function trFusePlan() { // simulation : ce que donnerait la cascade complète
  const c = RARITY.map((_, q) => trFuseCands(q).length), made = RARITY.map(() => 0); let n = 0;
  for (let q = 0; q <= TR_FUSE_TOP; q++) { const f = Math.floor(c[q] / 3); if (!f) continue; c[q] -= 3 * f; c[q + 1] += f; made[q + 1] += f; n += f; }
  return { n, made };
}
function trFuseEverything() { const got = []; for (let q = 0; q <= TR_FUSE_TOP; q++) while (trFuseCands(q).length >= 3) { const it = trFuse(q); if (!it) break; got.push(it); } return got; }
ACT.trFuseEverything = () => {
  const P = trFusePlan(); if (!P.n) return toast("Aucun trio de bibelots à fondre.", "bad");
  const out = P.made.map((m, q) => m ? `<b class="rar${q}">${m} ${RARITY[q].n}</b>` : "").filter(Boolean).join(", ");
  confirmBox(`Fusionner en cascade tous les bibelots non verrouillés (${P.n} fusion${P.n > 1 ? "s" : ""}) ?<br><span class="tiny">Fusions obtenues : ${out}. Les nouveaux bibelots sont refondus à leur tour s'ils forment un trio.</span>`, () => {
    const L = trFuseEverything(); sfx("forge"); save();
    const best = L.reduce((a, it) => !a || it.rar > a.rar ? it : a, null);
    toast(`${L.length} fusion${L.length > 1 ? "s" : ""}${best ? ` · meilleur : <b class="rar${best.rar}">${gearName(best)}</b>` : ""}`, "good"); openBuilding("forge", "tr");
  }, { yes: "Fusionner tout" });
};
ACT.trQ = v => { UI.trQ = v === "all" ? null : +v; openBuilding("forge", "tr"); };
function trTabHTML() {
  const all = S.inv.filter(it => it.kind === "tr"), P = trFusePlan();
  const by = RARITY.map((_, q) => all.filter(it => it.rar === q));
  const q0 = UI.trQ != null && by[UI.trQ] && by[UI.trQ].length ? UI.trQ : null;
  const chips = `<div class="row" style="gap:4px;flex-wrap:wrap;margin:6px 0"><button class="btn sm ${q0 == null ? "on gold" : "ghost"}" data-a="trQ" data-v="all">Tous (${all.length})</button>${by.map((L, q) => L.length ? `<button class="btn sm ${q0 === q ? "on" : "ghost"}" data-a="trQ" data-v="${q}"><span class="rar${q}">${RARITY[q].n}</span> ${L.length}</button>` : "").join("")}</div>`;
  const rows = by.map((L, q) => { if (q > TR_FUSE_TOP) return ""; const c = trFuseCands(q).length, f = Math.floor(c / 3); if (!L.length) return ""; return `<div class="row sp" style="padding:3px 0;border-bottom:1px solid #ffffff10"><span class="small"><b class="rar${q}">${RARITY[q].n}</b> <span class="tiny dim">${c} fusionnable${c > 1 ? "s" : ""}${L.length > c ? ` · ${L.length - c} verrouillé${L.length - c > 1 ? "s" : ""} ou unique${L.length - c > 1 ? "s" : ""}` : ""}</span></span><span class="row" style="gap:4px"><button class="btn sm ${f ? "" : "ghost off"}" data-a="trFuse" data-v="${q}">3 → 1</button><button class="btn sm ${f > 1 ? "gold" : "ghost off"}" data-a="trFuseAll" data-v="${q}">×${f} → <span class="rar${q + 1}">${RARITY[q + 1].n}</span></button></span></div>`; }).join("");
  const fuse = `<div class="card" style="cursor:default;margin-bottom:8px;border-color:#c090ff55"><div class="row sp"><span class="small">${ico("gem", "#c090ff", 16)} <b>Fusion</b> <span class="tiny dim">— trois bibelots d'une même qualité (non verrouillés) → un bibelot de la qualité au-dessus.</span></span><button class="btn sm ${P.n ? "gold" : "ghost off"}" data-a="trFuseEverything">Fusionner tout${P.n ? ` (${P.n})` : ""}</button></div>${rows ? `<div style="margin-top:6px">${rows}</div>` : ""}</div>`;
  const list = (q0 == null ? all : by[q0]).slice().sort((a, b) => b.rar - a.rar || (TRINKETS[a.key] ? TRINKETS[a.key].n : "").localeCompare(TRINKETS[b.key] ? TRINKETS[b.key].n : ""));
  const grid = list.length ? `<div class="grid" style="--min:200px">${list.map(it => `<div class="row card" style="gap:8px;cursor:pointer;padding:6px" data-a="itemInfo" data-v="${it.id}" data-iid="${it.id}">${slotHTML(it, "itemInfo", it.id)}<div style="flex:1;min-width:0"><b class="rar${it.rar} small">${gearName(it)}</b><div class="tiny dim">${typeof trinketText === "function" ? trinketText(it) : ""}</div></div></div>`).join("")}</div>` : `<div class="empty">Aucun bibelot à l'inventaire.</div>`;
  return `<p class="lore">Le cabinet des bibelots : chaque babiole classée par qualité, et le creuset pour les fondre.</p>${fuse}${chips}${grid}`;
}
