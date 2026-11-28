/* Forge : onglet Panoplies, sertissage par objet dans l'onglet Gemmes.
   Navigation : fermer une fenêtre (✕, toucher à côté, Annuler) ramène à la fenêtre précédente au lieu du Bastion. */

// ── Onglet Panoplies ──
function setsTabHTML() {
  const worn = S.heroes.map(h => ({ h, n: setCount(h) })).filter(x => Object.keys(x.n).length);
  const inv = {}; for (const it of S.inv) if (it.set && SETS[it.set]) inv[it.set] = (inv[it.set] || 0) + 1;
  const bon = (T, n) => [["2", T.b2], ["3", T.b3], ["4", T.b4]].filter(x => x[1]).map(([i, B]) => `<span class="${n >= +i ? "good" : "dim"}">${i} pièces : ${B.d}</span>`).join("<br>");
  return `<p class="lore">Une même panoplie portée sur plusieurs pièces (arme, armure, bibelots) éveille des bonus à 2, 3 et 4 pièces. Les objets Légendaires et mieux peuvent en porter une ; la gravure en impose une au choix.</p>
  ${typeof engraveBarHTML === "function" ? engraveBarHTML() : ""}
  ${worn.length ? `<h3>${ico("helm", "#e8c878", 15)} Portées par la compagnie</h3><div class="col">${worn.map(({ h, n }) => `<div class="card" style="cursor:pointer;padding:6px 10px" data-a="heroInfo" data-v="${h.id}"><b>${esc(h.name)}</b> <span class="tiny dim">${CLASSES[h.cls].n} · niv ${h.lvl}</span>${Object.keys(n).map(k => `<div class="tiny"><b style="color:${SETS[k].c}">❖ ${SETS[k].n}</b> <b>${n[k]}/4</b></div>`).join("")}</div>`).join("")}</div>` : `<p class="tiny dim">Aucun héros ne porte encore de pièce de panoplie.</p>`}
  <h3 style="margin-top:10px">${ico("book", "#e8c878", 15)} Toutes les panoplies</h3><div class="grid" style="--min:250px">${Object.keys(SETS).map(k => { const T = SETS[k], best = Math.max(0, ...worn.map(x => x.n[k] || 0));
    return `<div class="card" style="cursor:default;border-color:${T.c}55"><b style="color:${T.c}">❖ ${T.n}</b><div class="tiny dim">${inv[k] ? `${inv[k]} pièce${inv[k] > 1 ? "s" : ""} à l'inventaire` : "aucune pièce à l'inventaire"}${best ? ` · meilleur porteur ${best}/4` : ""}</div><div class="tiny" style="margin-top:4px">${bon(T, best)}</div></div>`; }).join("")}</div>`;
}

ACT.heroInfo = id => { const h = heroById(id); if (h) heroSheet(h); };

// ── Gemmes : sertir en partant de l'objet ──
{ const gt0 = gemsTabHTML; gemsTabHTML = function () {
    const L = gemTargets().sort((a, b) => b.it.rar - a.it.rar || b.it.tier - a.it.tier), nG = Object.values(S.gems || {}).reduce((x, y) => x + y, 0);
    const sock = `<h3 style="margin-top:12px">${ico("gem", "#9ad0ff", 15)} Sertissage par objet</h3><p class="tiny dim">Choisissez l'objet, puis la gemme à y sertir.</p>` + (L.length ? `<div class="col">${L.map(({ it, h }) => `<div class="row card" style="gap:10px;cursor:pointer" data-a="sockItem" data-v="${it.id}">${slotHTML(it, "sockItem", it.id)}<div style="flex:1;min-width:150px"><b class="rar${it.rar}">${gearName(it)}</b> <span class="tiny dim">${h ? "porté par " + esc(h.name) : "inventaire"}</span><div class="row" style="gap:4px;flex-wrap:wrap;margin-top:2px">${(it.gems || []).map(g => gemChip(g)).join("")}<span class="tiny dim">${(it.gems || []).length}/${sockets(it)} emplacements</span></div></div><button class="btn sm ${nG ? "" : "ghost off"}" data-a="sockItem" data-v="${it.id}">Sertir</button></div>`).join("")}</div>` : `<p class="tiny dim">Aucun objet avec un emplacement libre (Mythique ou mieux).</p>`);
    return gt0() + sock; }; }
ACT.sockItem = (iid, el, e) => { e && e.stopPropagation && e.stopPropagation(); const g = allGearTr().find(x => x.it.id === iid); if (!g) return; const it = g.it, G = Object.entries(S.gems || {}).filter(([, n]) => n > 0).sort((a, b) => a[0].localeCompare(b[0]));
  if (!G.length) return toast("Aucune gemme en réserve.", "bad");
  modal(`<h2>${ico("gem", "#9ad0ff")} Sertir : ${gearName(it)}</h2><p class="tiny dim">${g.h ? "Porté par " + esc(g.h.name) + " · " : ""}${(it.gems || []).length}/${sockets(it)} emplacements occupés.</p><div class="col">${G.map(([id, n]) => { const [k, l] = id.split(":"); return `<div class="row card" style="gap:8px;cursor:pointer" data-a="gemPut" data-v="${it.id}|${id}">${gemChip(id, n)}<span class="tiny dim" style="flex:1">${GEMS[k].d(gemVal(k, +l))}</span><button class="btn sm" data-a="gemPut" data-v="${it.id}|${id}">Sertir</button></div>`; }).join("")}</div>`, { wide: 1 }); };

// ── Pile de navigation des fenêtres ──
const MNAV = { stack: [], cur: null, pc: 0, closed: null, act: null, restoring: 0, noPush: 0 };
const MNAV_SAFE = /(Info|heroInfo|Sheet|List|Pick|View|Zoom|Slot|Cmp|cmp|Codex|codex|Peek|^open|^show|details|Details|trophies|turnOrder|petInfo|recruitInfo|tierZoom|sockItem|teamCmp|^goals$|^carnet$|^resPanel$|^journal$|^trophies)/, MNAV_BAD = /(Do$|Go$|^buy|Buy|^sell|Put$|[cC]laim|Hire|^adopt|^salv|Fuse|^launch|^equip$|Release|^up[A-Z]|Lock$)/;
const navKey = html => ((String(html).match(/<h2[^>]*>([\s\S]*?)<\/h2>/) || [])[1] || "").replace(/<[^>]+>/g, "").replace(/🔒/g, "").trim();
if (typeof document !== "undefined") document.addEventListener("click", e => { const a = e.target && e.target.closest && e.target.closest("[data-a]"); MNAV.act = a ? { a: a.dataset.a, v: a.dataset.v } : null; setTimeout(() => { MNAV.act = null; }, 0); }, true);
function navClose() {
  const prev = MNAV.stack.pop(); if (!prev) { MNAV.cur = null; MNAV.closed = null; return closeModal(); }
  const f = UI.modalClose; if (f && f._bld) UI.modalClose = null; // la fenêtre du bâtiment est rouverte par la pile
  closeModal(); MNAV.closed = null; MNAV.cur = null;
  setTimeout(() => { if ($("#modal").hidden) navRestore(prev); else MNAV.stack.length = 0; }, 0);
}
function navRestore(p) {
  MNAV.restoring = 1; MNAV.act = p.act;
  try {
    if (p.bld) openBuilding(p.bld.k, p.bld.tab);
    else if (p.act && ACT[p.act.a]) { const ev = { stopPropagation() { }, preventDefault() { } }; ACT[p.act.a](p.act.v, document.createElement("div"), ev); }
  } catch (err) { console.warn("nav", err); }
  if ($("#modal").hidden && !p.bld) { try { modal(p.html, p.o); } catch (err) { } }
  MNAV.restoring = 0; MNAV.act = null;
}
{ const m0 = modal; modal = function (html, o = {}) {
    const M = $("#modal"), open = !M.hidden, key = navKey(html);
    if (!MNAV.restoring) {
      const prev = open ? MNAV.cur : (Date.now() - MNAV.pc < 400 ? MNAV.closed : null);
      if (!prev) { if (!open) MNAV.stack = []; }
      else if (prev.key !== key) { const i = MNAV.stack.findIndex(x => x.key === key); if (i >= 0) MNAV.stack.length = i; else if (!prev.skip) { MNAV.stack.push(prev); if (MNAV.stack.length > 12) MNAV.stack.shift(); } }
    }
    const bld = open && UI.inBld ? { k: UI.bldOpen, tab: UI.bldTab } : null; if (bld && MNAV.cur && !MNAV.cur.bld) MNAV.cur.bld = bld;
    if (bld && MNAV.stack.length && MNAV.stack[MNAV.stack.length - 1] === MNAV.cur) MNAV.stack[MNAV.stack.length - 1].bld = bld;
    m0(html, o);
    const same = MNAV.cur && MNAV.cur.key === key;
    MNAV.cur = { key, html, o, skip: MNAV.noPush || o.close === false || /id="cf-yes"/.test(html), act: MNAV.act && MNAV_SAFE.test(MNAV.act.a) && !MNAV_BAD.test(MNAV.act.a) ? MNAV.act : same ? MNAV.cur.act : null };
    if (UI.modalOut === closeModal) UI.modalOut = navClose;
  }; }
{ const c0 = closeModal; closeModal = function () { if (!$("#modal").hidden) { MNAV.pc = Date.now(); if (MNAV.cur && UI.inBld) MNAV.cur.bld = { k: UI.bldOpen, tab: UI.bldTab }; MNAV.closed = MNAV.cur; } return c0.apply(this, arguments); }; }
ACT.closeModal = () => navClose();
{ const b0 = bldBack; bldBack = function () { const f = b0.apply(this, arguments); if (f) f._bld = 1; return f; }; }
{ const ob = openBuilding; openBuilding = function () { const r = ob.apply(this, arguments); if (MNAV.cur) MNAV.cur.bld = { k: UI.bldOpen, tab: UI.bldTab }; return r; }; }
// une confirmation : « Oui » qui ne rouvre rien ramène à la fenêtre d'où elle venait
{ const cb0 = confirmBox; confirmBox = function (text, yes, o) { return cb0(text, () => { yes(); setTimeout(() => { if ($("#modal").hidden && MNAV.stack.length) navRestore(MNAV.stack.pop()); }, 30); }, o); }; }
{ const g0 = go; go = function () { MNAV.stack = []; MNAV.cur = null; MNAV.closed = null; return g0.apply(this, arguments); }; }
