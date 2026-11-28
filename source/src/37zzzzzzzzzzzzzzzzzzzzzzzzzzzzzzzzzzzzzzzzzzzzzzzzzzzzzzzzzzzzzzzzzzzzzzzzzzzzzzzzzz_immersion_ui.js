// ── Mode Immersion (27 nov., actif par défaut, Options) : le Bastion sans barres ni bandeau. Une lanterne en bas à gauche
//    rallume les menus ; l'objectif est dit par Frère Anselme en une phrase qui s'efface ; pas d'astuces, pas de pastilles.
function immersOn() { if (S && S.opts && S.opts.immersion == null) S.opts.immersion = 1; return !!(S && S.opts && S.opts.immersion); }
function immersApply() { try { if (S && S.opts && S.opts.immersion == null) S.opts.immersion = 1; document.body.classList.toggle("immersion", immersOn()); if (immersOn()) S.opts.noHints = 1; } catch (e) { } }
ACT.immLamp = () => { document.body.classList.toggle("uiopen"); clearTimeout(UI._lampT); if (document.body.classList.contains("uiopen")) UI._lampT = setTimeout(() => document.body.classList.remove("uiopen"), 12000); };
{ const bh = SCREENS.bastion.html; SCREENS.bastion.html = (...a) => bh(...a) + (immersOn() && !S.run ? `<button class="immlamp" data-a="immLamp" title="Menus du Bastion">${ico("rel_lanterne", "#ffcf6a", 26)}</button>` : ""); }
// Anselme annonce l'objectif (au plus toutes les 4 minutes, jamais pendant le bandeau de retour)
function anselmeSays() {
  if (!immersOn() || S.run || UI.screen !== "bastion" || !$("#modal").hidden) return; if (Date.now() - (UI._ansT || 0) < 240000) return;
  const g = typeof nextGoal === "function" ? nextGoal() : null; if (!g) return; UI._ansT = Date.now();
  const t = String(g.t || "").replace(/<[^>]+>/g, ""), say = /^Histoire/.test(t) ? `Capitaine. ${t.replace(/^Histoire\s*:\s*/, "").replace(/^./, c => c.toUpperCase())}. Le royaume ne attendra pas.` : `Capitaine, un conseil : ${t.charAt(0).toLowerCase() + t.slice(1)}.`;
  const d = document.createElement("div"); d.className = "anssay"; d.dataset.a = g.a || "goals"; if (g.v != null) d.dataset.v = String(g.v);
  d.innerHTML = `${artHas("por_anselme") ? `<img src="assets/por_anselme.webp" alt="">` : ""}<div><b>Frère Anselme</b><span>« ${esc(say.replace("ne attendra", "n'attendra"))} »</span></div>`;
  d.addEventListener("click", () => d.remove()); const v = $("#view"); (v || document.body).appendChild(d);
  setTimeout(() => d.classList.add("out"), 9000); setTimeout(() => d.remove(), 10000);
}
{ const bm = SCREENS.bastion.mount; SCREENS.bastion.mount = function () { const r = bm && bm.apply(this, arguments); immersApply(); document.querySelectorAll("body > .immlamp").forEach(e => e.remove()); const lp = document.querySelector("#view .immlamp"); if (lp) document.body.appendChild(lp); setTimeout(anselmeSays, (typeof CALM !== "undefined" && Date.now() < CALM.until) ? 8200 : 900); return r; }; }
{ const rf = refresh; refresh = function () { immersApply(); const r = rf.apply(this, arguments); if (UI.screen !== "bastion" || S.run) document.querySelectorAll("body > .immlamp").forEach(e => e.remove()); return r; }; }
{ const g0 = go; go = function () { document.querySelectorAll("body > .immlamp").forEach(e => e.remove()); immersApply(); return g0.apply(this, arguments); }; }
// Options : interrupteur
{ const oh = SCREENS.options.html; SCREENS.options.html = function () { let h = oh.apply(this, arguments);
    const row = `<label class="row sp"><span>${ico("eye")} Mode Immersion <span class="tiny dim">— Bastion sans barres (lanterne pour les menus), objectif dit par Anselme, sans astuces ni pastilles</span></span><input type="checkbox" data-opt="immersion" ${immersOn() ? "checked" : ""}></label>`;
    const i = h.indexOf('<label class="row sp">'); return i < 0 ? h + row : h.slice(0, i) + row + h.slice(i); }; }
// Combat épuré : ni frise ni journal en mode Immersion ; pendant que les ennemis agissent et que les coups pleuvent,
// les commandes s'effacent pour laisser la scène ; elles reviennent dès que c'est au joueur.
setInterval(() => { try { const on = immersOn() && UI.screen === "combat" && CB && CB.B; document.body.classList.toggle("cbwait", !!(on && !CB.resolve)); } catch (e) { } }, 150);
// fondu au noir traversé de cendres quand on change d'écran (pas en combat rapide ni pendant les séries)
{ const g1 = go; go = function (scr) { try { if (scr !== UI.screen && !(S.opts && S.opts.quick) && !(S.repeat && S.repeat.n)) { const o = $("#ashfade"); if (o) o.remove(); const d = document.createElement("div"); d.id = "ashfade"; d.innerHTML = Array.from({ length: 16 }, () => `<i style="left:${Math.random() * 100}%;animation-delay:${Math.random() * .2}s"></i>`).join(""); document.body.appendChild(d); setTimeout(() => d.remove(), 700); } } catch (e) { } return g1.apply(this, arguments); }; }
// Menus en lieux : la bibliothèque pour les Archives, le bureau du capitaine pour les Options (dès que les décors sont peints)
{ const cs = SCREENS.codex.scene; SCREENS.codex.scene = function () { return artHas("bg_place_library") ? backdrop("catacombes", { img: "bg_place_library", dark: .45 }) : cs.apply(this, arguments); }; }
{ const os = SCREENS.options.scene; SCREENS.options.scene = function () { return artHas("bg_place_desk") ? backdrop("bastion", { img: "bg_place_desk", dark: .45 }) : os.apply(this, arguments); }; }
// Chaque bâtiment a son bruit quand on y entre
const BLD_SFX = { forge: "forge", chapelle: "bell", taverne: "door", fonderie: "fire", menagerie: "step", academie: "slash", porte: "door" };
{ const ob = openBuilding; openBuilding = function (k) { try { const open = !$("#modal").hidden && UI.inBld && UI.bldOpen === k; if (!open && k !== UI._bldSnd) { UI._bldSnd = k; setTimeout(() => { UI._bldSnd = null; }, 1500); const s = BLD_SFX[k] || Object.entries(BLD_SFX).find(([p]) => String(k).startsWith(p))?.[1]; if (s) sfx(s); } } catch (e) { } return ob.apply(this, arguments); }; }
// Chiffres romains peints (plaques de fer et d'or) sur les étiquettes des bâtiments et les niveaux de la Forge
const RN_N = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10 };
function rnPlate(r, sz = 22) { const n = RN_N[r]; return n && ((typeof UIA !== "undefined" && UIA && UIA.n && UIA.n["rn_" + n] != null) || artHas("ui_rn_" + n)) ? `<span class="rnp" title="${r}">${ico("rn_" + n, null, sz)}</span>` : null; }
{ const bh2 = SCREENS.bastion.html; SCREENS.bastion.html = function () { return bh2.apply(this, arguments).replace(/(<span class="lbl">[^]*?) <b>([IVX]+)<\/b>/g, (m, a, r) => { const p = rnPlate(r, 24); return p ? a + p : m; }); }; }
// Objectifs : la fenêtre s'ouvre sur le tableau de chasse peint
{ const ag = ACT.goals; ACT.goals = function () { const r = ag.apply(this, arguments); try { if (artHas("bg_place_board")) { const bx = $("#modal .box"); if (bx) bx.classList.add("boardbox"); } } catch (e) { } return r; }; }
