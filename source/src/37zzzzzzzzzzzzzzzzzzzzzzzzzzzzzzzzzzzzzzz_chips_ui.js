/* Refonte de l'interface (12 nov.) — rangées d'onglets et de filtres en « puces » :
   toute rangée d'au moins 3 petits boutons d'onglet/tri/filtre (ou .tabs) devient une bande d'une seule ligne,
   défilable au doigt sur téléphone (fondu sur le bord quand elle déborde), avec un état actif net.
   Le marquage est automatique (observateur sur #view et #modal), aucun écran n'est à réécrire. */
const CHIP_RX = /(Tab|Sort|Cls|Pane|Page|Fam|View|Filter|Mode|Kind|Rar|Cat|Pri|Speed|Diff)$/i;
function chipsRow(el) {
  if (!el || el.dataset.chips) return false;
  const kids = [...el.children], mn = el.classList.contains("tabs") ? 2 : 3; if (kids.length < mn) return false;
  const btns = kids.filter(k => k.tagName === "BUTTON");
  if (btns.length < mn) return false;
  if (kids.some(k => k.tagName !== "BUTTON" && !(k.tagName === "SPAN" && k.textContent.length < 14))) return false; // seulement des boutons (+ un libellé court « Trier : »)
  const isTabs = el.classList.contains("tabs");
  if (!isTabs && !btns.every(b => b.classList.contains("sm") && (CHIP_RX.test(b.dataset.a || "") || b.classList.contains("on")))) return false;
  if (btns.some(b => b.classList.contains("main"))) return false; // pas les rangées d'actions
  return true;
}
function chipsScan(root) {
  if (!root || !root.querySelectorAll) return;
  for (const el of root.querySelectorAll(".tabs, .row, .row > span")) {
    if (!chipsRow(el)) continue;
    el.dataset.chips = 1; el.classList.add("chips");
    for (const b of el.children) if (b.tagName === "BUTTON") { const on = b.classList.contains("on") || (b.classList.contains("gold") && !b.classList.contains("ghost")); b.classList.toggle("chip-on", on); }
    chipsEdge(el);
    if (!el._chipScroll) { el._chipScroll = 1; el.addEventListener("scroll", () => chipsEdge(el), { passive: true }); }
    const on = el.querySelector(".chip-on"); if (on && el.scrollWidth > el.clientWidth && on.offsetLeft + on.offsetWidth > el.clientWidth - 8) { const x = on.offsetLeft - el.clientWidth / 2 + on.offsetWidth / 2; el.scrollLeft = Math.max(0, x); }
  }
}
function chipsEdge(el) { const o = el.scrollWidth > el.clientWidth + 2; el.classList.toggle("ovf-r", o && el.scrollLeft + el.clientWidth < el.scrollWidth - 4); el.classList.toggle("ovf-l", o && el.scrollLeft > 4); }
if (typeof document !== "undefined" && typeof MutationObserver !== "undefined") {
  let pend = 0;
  const run = () => { pend = 0; chipsScan(document.getElementById("view")); chipsScan(document.getElementById("modal")); };
  const mo = new MutationObserver(() => { if (!pend) { pend = 1; requestAnimationFrame(run); } });
  const start = () => { for (const id of ["view", "modal"]) { const n = document.getElementById(id); if (n) mo.observe(n, { childList: true, subtree: true }); } run(); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else setTimeout(start, 0);
  addEventListener("resize", () => document.querySelectorAll(".chips").forEach(chipsEdge));
}

// ── Fiche du héros en onglets : Profil · Compétences · Talents · Évolution · Plus (au lieu d'un très long défilement) ──
const HERO_PANES = [["profil", "Profil"], ["skills", "Compétences"], ["talents", "Talents"], ["evo", "Évolution"], ["plus", "Plus"]];
function heroPaneOf(el, i) {
  if (i <= 1) return "profil"; // bouton retour + en-tête (portrait, équipement, caractéristiques)
  const t = (el.querySelector("h1,h2,h3") || el).textContent || "";
  if (el.tagName === "H2" || el.classList.contains("skl") || (el.classList.contains("col") && el.querySelector(".skl"))) return "skills";
  if (/Talents/.test(t.slice(0, 60))) return "talents";
  if (/Évolution|Apogée|Voie/.test(t.slice(0, 60)) || el.querySelector("[data-cv^='evo:']")) return "evo";
  if (/Combat automatique/.test(el.textContent.slice(0, 200))) return "talents";
  return "plus";
}
function heroTabs() {
  const w = document.querySelector("#view .wrap"); if (!w || w.dataset.htabs) return;
  const kids = [...w.children]; if (kids.length < 4) return;
  w.dataset.htabs = 1;
  const groups = {}; kids.forEach((k, i) => { const p = heroPaneOf(k, i); (groups[p] = groups[p] || []).push(k); k.dataset.hp = p; });
  const panes = HERO_PANES.filter(([k]) => groups[k] && groups[k].length);
  if (!panes.some(([k]) => k === UI.heroPane)) UI.heroPane = "profil";
  const bar = document.createElement("div"); bar.className = "tabs chips htabs"; bar.dataset.chips = 1;
  bar.innerHTML = panes.map(([k, n]) => `<button class="btn sm${k === UI.heroPane ? " chip-on" : ""}" data-hp="${k}">${n}</button>`).join("");
  const show = () => { for (const k of kids) if (k !== kids[0]) k.classList.toggle("athid", k.dataset.hp !== UI.heroPane); bar.querySelectorAll("button").forEach(b => b.classList.toggle("chip-on", b.dataset.hp === UI.heroPane)); chipsEdge(bar); };
  bar.addEventListener("click", e => { const b = e.target.closest("button[data-hp]"); if (!b) return; e.stopPropagation(); UI.heroPane = b.dataset.hp; show(); const v = document.getElementById("view"); if (v) v.scrollTop = 0; });
  kids[0].after(bar); kids[0].style.display = ""; show();
}
{ const S0 = SCREENS.hero, m0 = S0.mount; S0.mount = function () { const r = m0.apply(this, arguments); try { heroTabs(); } catch (e) { } return r; }; }
