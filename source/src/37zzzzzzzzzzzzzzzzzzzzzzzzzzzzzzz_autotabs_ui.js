/* Onglets et pages automatiques : toute fenêtre ou page des Archives trop longue est découpée.
   - plusieurs titres (h2/h3) de premier niveau → une barre d'onglets, une seule section visible ;
   - longue grille/liste (plus de AT_PAGE éléments) → pages 1, 2, 3…
   L'onglet et la page choisis sont mémorisés par écran (UI.atTab / UI.atPg). */
const AT_MIN_H = 1250, AT_PAGE = 24;
UI.atTab = UI.atTab || {}; UI.atPg = UI.atPg || {};
function atLabel(t) { t = t.replace(/\s+/g, " ").trim(); if (!/^Chapitre/.test(t)) t = t.split(/ — | – | \(/)[0].trim(); const m = t.match(/^Chapitre ([IVXLC]+)\s*[—-]\s*(.*)$/); if (m) return m[1] + " · " + m[2].replace(/^(Le |La |Les |L')/, "").slice(0, 16); return t.length > 22 ? t.slice(0, 21) + "…" : t; }
function atItemName(c) { const h = c.querySelector("h3, h4, b, strong"); let t = (h || c).textContent.replace(/\s+/g, " ").trim(); t = t.split(/ — | – | · | \(/)[0]; return t.length > 20 ? t.slice(0, 19) + "…" : t; }
function atPager(list, key) { // longue liste → sections repliables (une ouverte par défaut), au lieu de pages numérotées
  const items = [...list.children].filter(c => !c.classList.contains("atfold")); const lh = list.scrollHeight || list.offsetHeight;
  if (items.length <= 6 || lh < AT_MIN_H) return;
  const PG = Math.max(6, Math.min(40, Math.round(items.length * 1000 / lh))); if (items.length <= PG) return;
  const n = Math.ceil(items.length / PG), per = Math.ceil(items.length / n); const open = UI.atPg[key] = Array.isArray(UI.atPg[key]) ? UI.atPg[key] : [0];
  list.classList.add("atpager-done");
  for (let g = 0; g < n; g++) {
    const grp = items.slice(g * per, (g + 1) * per); if (!grp.length) continue; const hd = document.createElement("button"); hd.className = "atfold"; hd.type = "button";
    const a = atItemName(grp[0]), z = atItemName(grp[grp.length - 1]);
    const set = () => { const on = open.includes(g); hd.classList.toggle("on", on); hd.innerHTML = `<span class="atchev">${on ? "▾" : "▸"}</span><span class="atlab">${esc(a)}${grp.length > 1 ? ` <span class="dim">→</span> ${esc(z)}` : ""}</span><span class="atn">${grp.length}</span>`; grp.forEach(c => c.classList.toggle("athid", !on)); };
    hd.onclick = e => { e.stopPropagation(); const k = open.indexOf(g); if (k >= 0) open.splice(k, 1); else open.push(g); set(); };
    list.insertBefore(hd, grp[0]); set();
  }
}
function atBigLists(root, key) { if (root.querySelector(".tabs:not(.autotabs):not(.atpager)") && root.id === "modal") return; let k = 0; for (const el of root.querySelectorAll(".grid, .col")) { if (el.classList.contains("atpager-done") || el.parentElement.closest(".grid, .col")) continue; if (el.children.length > 6) atPager(el, key + "#" + (k++)); } }
function autoTabs(root, key) {
  if (!root || root.querySelector(":scope > .autotabs, .atpager, .atfold")) return;
  if (root.scrollHeight < AT_MIN_H && root.offsetHeight < AT_MIN_H) return;
  const kids = [...root.children], heads = kids.filter((c, i) => /^H[23]$/.test(c.tagName) && i > 0 && !(i === 0 && root.id === "modal"));
  const isBox = root.classList.contains("box"), title = isBox ? kids.find(c => c.tagName === "H2") : null, firstIsTitle = !!title; const H = heads.filter(h => h !== title);
  if (H.length >= 2) {
    const pre = []; for (let n = H[0].previousElementSibling; n; n = n.previousElementSibling) { if (/^H1$/.test(n.tagName) || n.classList.contains("tabs") || n === title) break; pre.unshift(n); }
    const preBig = pre.some(e => e.matches(".grid, .col, .panel, .card") && e.offsetHeight > 300);
    const secs = H.map(h => { const L = [h]; let n = h.nextElementSibling; while (n && !H.includes(n)) { L.push(n); n = n.nextElementSibling; } return L; });
    const labels = H.map(h => atLabel(h.textContent)); if (preBig) { const p0 = pre.filter(e => !(e.tagName === "P" && e === pre[0] && pre.length > 1)); secs.unshift(p0); labels.unshift("Général"); }
    let cur = Math.min(secs.length - 1, UI.atTab[key] || 0);
    const bar = document.createElement("div"); bar.className = "tabs autotabs"; bar.style.cssText = "flex-wrap:wrap;gap:4px;margin:6px 0";
    const show = () => { secs.forEach((L, i) => L.forEach(e => { e.classList.toggle("athid", i !== cur); })); [...bar.children].forEach((b, i) => b.classList.toggle("on", i === cur)); };
    labels.forEach((lb, i) => { const b = document.createElement("button"); b.className = "btn sm"; b.textContent = lb; b.onclick = e => { e.stopPropagation(); cur = i; UI.atTab[key] = i; show(); const sc = root.closest("#view") || root; if (bar.getBoundingClientRect().top < 0) bar.scrollIntoView({ block: "start" }); }; bar.appendChild(b); });
    root.insertBefore(bar, preBig ? (secs[0][0] || H[0]) : H[0]); show();
  }
  atBigLists(root, key);
}
function atKey(el) { const tabOn = el.querySelector(".tabs:not(.autotabs):not(.atpager) .on"); const h = el.querySelector("h2, h1"); return (h ? h.textContent.trim().slice(0, 30) : "") + "|" + (tabOn ? tabOn.textContent.trim().slice(0, 20) : ""); }
function atRun() {
  try {
    const box = document.querySelector("#modal:not([hidden]) .box"); if (box && !box.dataset.noat) autoTabs(box, "m:" + atKey(box));
    if (["codex", "heroes", "expe"].includes(UI.screen)) { const w = document.querySelector("#view .wrap"); if (w) autoTabs(w, "v:" + UI.screen + ":" + atKey(w)); }
  } catch (e) { }
}
if (typeof document !== "undefined" && typeof MutationObserver !== "undefined") {
  let at = 0; const sched = () => { if (at) return; at = requestAnimationFrame(() => { at = 0; atRun(); }); };
  const go0 = () => { const v = document.getElementById("view"), m = document.getElementById("modal"); if (!v || !m) return setTimeout(go0, 200); const ob = new MutationObserver(sched); ob.observe(v, { childList: true }); ob.observe(m, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden"] }); };
  go0();
}
