// ── Combat : icônes peintes propres aux actions (planche ui_cb_*, 14 nov.) — remplacent les anciennes icônes une fois la planche peinte ──
const CB_ICO = { cbPotion: "cb_potion", cbDelay: "cb_delay", cbPass: "cb_skip", cbPet: "cb_pet", cbInfoMode: "cb_info", petInfo: "cb_info", cbReplay: "cb_replay",
  cbMore: () => CB.moreOpen ? "cb_less" : "cb_more", cbMove: b => +b.dataset.v > 0 ? "cb_back" : "cb_fwd", cbStance: () => ({ off: "cb_atk", def: "cb_def" })[CB.B && CB.B.stance] || "cb_stance",
  cbFlee: "cb_flee", cbAuto: "cb_auto", cbSpeed: "cb_speed", cbLogShow: "cb_log", cbHub: "cb_hub", cbDuo: "cb_duo", relief: "cb_relief", cbSkip: "cb_skip" };
function cbIcoSwap() {
  try { document.querySelectorAll("#cbar button[data-a], #cb-tr button[data-a], #cb-tl button[data-a]").forEach(b => {
      let m = CB_ICO[b.dataset.a]; if (!m) return; if (typeof m === "function") m = m(b); if (!m || !artHas("ui_" + m)) return;
      if (b.dataset.a === "cbPet" && b.querySelector(".skic")) return; // icône peinte de la compétence du compagnon : gardée
      const old = b.querySelector(".ic"); const t = document.createElement("span"); t.innerHTML = ico(m, null, old && old.style.width ? parseInt(old.style.width) : undefined);
      const n = t.firstElementChild; if (!n) return; if (old) old.replaceWith(n); else b.prepend(n); });
  } catch (e) { } }
{ const cb0 = cbBar; cbBar = function () { const r = cb0.apply(this, arguments); cbIcoSwap(); return r; }; }
{ const m0 = ACT.cbMore; ACT.cbMore = function () { const r = m0.apply(this, arguments); cbIcoSwap(); return r; }; }
{ const s0 = ACT.cbStance; if (s0) ACT.cbStance = function () { const r = s0.apply(this, arguments); cbIcoSwap(); return r; }; }
{ const mt = SCREENS.combat.mount; SCREENS.combat.mount = function () { const r = mt.apply(this, arguments); setTimeout(cbIcoSwap, 60); return r; }; }
