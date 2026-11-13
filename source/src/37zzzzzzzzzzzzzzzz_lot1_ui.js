/* Lot du 11 nov. : déroulement (auto/manuel + séries) dans Options, départ rapide = dernière expédition, combat auto après le chapitre 5,
   inventaire plafonné à 1000, rafraîchissement de l'écran sous les fenêtres. */

// ── combat automatique : après le chapitre 5 au premier cycle, d'office ensuite ──
function autoCombatOpen() { return cycleN() >= 1 || !!(S.prog.citadelle && S.prog.citadelle.clears) || !!S.finaleReady; }
{ const ca = ACT.cbAuto; ACT.cbAuto = function (v, el) { if (!CB.auto && !autoCombatOpen()) return toast("Le combat automatique se débloque après avoir vaincu le gardien du chapitre 5.", "bad"); return ca.apply(this, arguments); }; }
{ const cm = SCREENS.combat.mount; SCREENS.combat.mount = function () { if (!autoCombatOpen()) { S.opts.auto = 0; } const r = cm.apply(this, arguments); if (!autoCombatOpen()) { CB.auto = false; const b = $("#cb-auto"); if (b) { const bt = b.closest("button") || b; bt.style.display = "none"; } } return r; }; }
{ const chh = SCREENS.combat.html; SCREENS.combat.html = function () { const s = chh.apply(this, arguments); if (autoCombatOpen()) return s; return s.replace(/<button[^>]*data-a="cbAuto"[^>]*>[\s\S]*?<\/button>/, ""); }; }

// ── Options de l'expédition : déroulement de la carte (manuel par défaut) et séries ──
function runFlowHTML(E) {
  const on = !!E.autoMap;
  let h = `<h2 style="margin-top:12px">${ico("auto", "#e8c878")} Déroulement</h2><div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn sm ${on ? "ghost" : "gold"}" data-a="expeAuto" data-v="0">${ico("hand")}Carte manuelle</button><button class="btn sm ${on ? "gold" : "ghost"}" data-a="expeAuto" data-v="1">${ico("auto")}Carte automatique</button></div><p class="tiny dim" style="margin:4px 0 0">${on ? "Le groupe avance seul de salle en salle ; le bouton Auto de la carte repasse en manuel à tout moment." : "Vous choisissez chaque salle vous-même."}</p>`;
  UI._xpSpecial = 1; UI._xpOpts = 1; try { h += seriesHTML(E); } finally { UI._xpSpecial = 0; UI._xpOpts = 0; }
  return h;
}
ACT.expeAuto = v => { UI.expe.autoMap = +v ? 1 : 0; refresh(); };
{ const sh = seriesHTML; seriesHTML = E => UI._xpOpts ? sh(E) : ""; }
{ const eh = SCREENS.expe.html; SCREENS.expe.html = (...a) => { const h = eh(...a); if (S.run || UI.expePane !== "opts") return h; const i = h.indexOf('<div class="stickybar">'); return i < 0 ? h : h.slice(0, i) + runFlowHTML(UI.expe) + h.slice(i); }; }

// ── départ rapide : relance la dernière expédition avec les mêmes réglages ──
const LAST_KEYS = ["region", "threat", "party", "pet", "night", "hard", "floor", "autoMap"];
{ const L = ACT.launch; ACT.launch = (...a) => { const had = !!S.run, E = UI.expe; const r = L(...a); if (!had && S.run && !E.rush && !E.daily && !E.special) { S.lastExpe = {}; for (const k of LAST_KEYS) if (E[k] !== undefined) S.lastExpe[k] = Array.isArray(E[k]) ? E[k].slice() : E[k]; save(); } return r; }; }
ACT.quickStart = () => {
  if (S.run) return go("map");
  const P = S.lastExpe; if (!P || !P.party) { go("expe"); UI.expePane = "dest"; refresh(); return toast("Lancez une première expédition : le départ rapide reprendra ensuite ses réglages."); }
  const party = P.party.filter(id => heroById(id) && !isInjured(heroById(id)));
  if (!party.length) return toast("Départ rapide impossible : les héros de la dernière expédition sont blessés ou absents.", "bad");
  if (!regionUnlocked(P.region)) return toast("Destination indisponible.", "bad");
  go("expe"); Object.assign(UI.expe, { rush: false, daily: false, special: null, twin: false, legend: false }, P, { party, pet: P.pet && S.pets.owned.includes(P.pet) ? P.pet : UI.expe.pet });
  if (party.length < P.party.length) toast(`${P.party.length - party.length} héros blessé(s) laissé(s) au Bastion.`);
  ACT.launch();
};

// ── inventaire plafonné à 1000 objets : le surplus le moins utile est recyclé automatiquement ──
function invCap() { const n = invCapLogic(); if (n && typeof toast === "function") toast(`Inventaire plein (${INV_CAP}) : ${n} objet(s) parmi les moins bons recyclés automatiquement.`); return n; }
{ const s0 = save; save = function () { invCap(); return s0.apply(this, arguments); }; }

// ── l'écran sous une fenêtre se met à jour dès qu'on la ferme (cadenas, équipement, etc.) ──
{ const c0 = closeModal; closeModal = function () { const r = c0.apply(this, arguments); if (["hero", "heroes", "expe", "codex"].includes(UI.screen)) setTimeout(() => { if ($("#modal").hidden) refresh(); }, 0); return r; }; }
ACT.closeModal = () => navClose();
