// ── Facilités (21 nov.) : recommencer un combat des chapitres I–II, bulles du glossaire à la première rencontre,
//    « Pourquoi j'ai perdu ? », mode gaucher, optimiser la compagnie au départ, flèches sur les vignettes,
//    notifications groupées, recherche globale.

// 1 · Recommencer le combat sans pénalité (chapitres I et II) : depuis le bouton Bastion du combat
const EASY_RESTART = ["bourg", "foret"];
function canEasyRestart() { return !!(S && S.run && CB.snap && EASY_RESTART.includes(S.run.region) && !S.ironman); }
{ const hub0 = ACT.cbHub; ACT.cbHub = function () { const r = hub0.apply(this, arguments);
    if (canEasyRestart()) { const col = document.querySelector("#modal .col"); if (col && !col.querySelector('[data-a="cbRestart"]')) col.insertAdjacentHTML("afterbegin", `<button class="choice" data-a="cbRestart"><b>${ico("dice", "#e8c878", 14)} Recommencer ce combat</b><div class="tiny">Chapitres I et II : le combat repart de son début, sans aucune pénalité.</div></button>`); }
    return r; }; }
ACT.cbRestart = () => { if (!canEasyRestart()) return closeModal(); const snap = CB.snap, spec = CB.snapNode; closeModal();
  let S2 = null; try { S2 = JSON.parse(snap); } catch (e) { } if (!S2 || !S2.run) return;
  CB.skipping = 0; CB.B = null; CB.resolve = null; S = S2; const run = S.run; save();
  const node = spec && spec.ambush ? Object.assign({}, spec) : spec ? run.map[spec.c][spec.i] : CB.node;
  toast("Le combat recommence…", "good"); go("combat", { node }); };

// 2 · Glossaire : la première fois qu'un terme souligné apparaît, sa bulle s'ouvre d'elle-même (une fois par terme)
const GL_AUTO = { t: 0 };
function glAutoScan() { if (!S || !S.opts || S.opts.noHints || S.opts.noGlAuto) return; if (UI.screen === "combat" || UI.screen === "title") return;
  if (typeof TIP !== "undefined" && TIP.src) return; S.glSeen = S.glSeen || {};
  const root = !$("#modal").hidden ? $("#modal") : $("#view"); if (!root) return;
  for (const el of root.querySelectorAll(".gl[data-tip]")) { const k = el.dataset.tip; if (!k || S.glSeen[k] || !GLOSS[k]) continue;
    const r = el.getBoundingClientRect(); if (!r.width || r.top < 40 || r.bottom > innerHeight - 90) continue;
    S.glSeen[k] = 1; try { save(); } catch (e) { } tipShow(el); el.classList.add("glnew"); setTimeout(() => { el.classList.remove("glnew"); if (TIP.src === el || (TIP.src && !TIP.src.isConnected)) tipHide(); }, 4200); return; } }
function glAutoKick() { try { if (TIP.src && !TIP.src.isConnected) tipHide(); } catch (e) { } clearTimeout(GL_AUTO.t); GL_AUTO.t = setTimeout(glAutoScan, 900); }
if (HASWIN) addEventListener("load", () => { try { const mo = new MutationObserver(glAutoKick); const v = $("#view"), m = $("#modal"); if (v) mo.observe(v, { childList: true }); if (m) mo.observe(m, { childList: true, attributes: true, attributeFilter: ["hidden"] }); } catch (e) { } });

// 3 · « Pourquoi j'ai perdu ? » : quelques causes lisibles sous le bilan d'une déroute
{ const er0 = endRun; endRun = function (outcome) { const run = S.run; let ctx = null;
    if (run && outcome === "wipe") { try { ctx = { threat: run.threat || 0, region: run.region, foes: (CB.B && CB.B.enemies || []).map(u => ({ n: u.name, boss: !!u.boss, w: typeof weakOf === "function" && weakOf(u) ? weakOf(u).n : null })).slice(0, 4) }; } catch (e) { } }
    const res = er0.apply(this, arguments); if (res && ctx) res.why = ctx; return res; }; }
function lossWhy(res) { const W = res.why, sum = res.sum && res.sum.heroes ? res.sum.heroes.filter(Boolean) : []; if (!W) return []; const out = [];
  const rec = typeof recLevel === "function" ? recLevel(W.region, W.threat) : null, avg = sum.length ? sum.reduce((a, h) => a + h.lvl, 0) / sum.length : 0;
  if (rec && avg && avg < rec - .5) out.push(`${ico("helm", "#e8c878", 14)} Niveau moyen <b>${Math.round(avg)}</b> pour un conseillé de <b>${rec}</b> : entraînez la compagnie dans un chapitre plus facile, lisez des tomes ou passez par l'Académie.`);
  const roles = sum.map(h => CLASSES[h.cls] && CLASSES[h.cls].role);
  if (!roles.includes("soin")) out.push(`${ico("potion", "#e86a5a", 14)} Aucun soigneur : les blessures s'accumulent d'un combat à l'autre.`);
  if (!roles.includes("tank")) out.push(`${ico("shield", "#8ab0e0", 14)} Aucun tank : vos héros fragiles encaissent en première ligne.`);
  if (sum.length < 4) out.push(`${ico("helm", "#e8c878", 14)} Compagnie incomplète (${sum.length}/4).`);
  const tk = sum.slice().sort((a, b) => (b.taken || 0) - (a.taken || 0))[0];
  if (tk && tk.taken) { const rk = sum.indexOf(tk), role = CLASSES[tk.cls] && CLASSES[tk.cls].role; if (role !== "tank") out.push(`${ico("skull", "#e05050", 14)} <b>${esc(tk.name)}</b> a encaissé le plus de coups (${fmt(Math.round(tk.taken))}) sans être tank : changez l'ordre de marche ou équipez-le d'une meilleure armure.`); }
  const weak = (W.foes || []).filter(f => f.w).map(f => `${esc(f.n)} — ${f.w}`); if (weak.length) out.push(`${ico("eye", "#e8c878", 14)} Faiblesses repérées : ${weak.join(" · ")}.`);
  const empty = S.heroes.filter(h => sum.some(s => s.id === h.id) && (!h.gear.wpn || !h.gear.arm)).length; if (empty) out.push(`${ico("anvil", "#e8c878", 14)} ${empty} héros sans arme ou sans armure : « Optimiser l'équipement » à la Forge ou au départ.`);
  if (!out.length) out.push(`${ico("dice", "#e8c878", 14)} Rien d'évident : la chance a tourné. Essayez une autre formation, un autre ordre tactique ou un compagnon soigneur.`);
  return out.slice(0, 5); }
{ const rh0 = SCREENS.results.html; SCREENS.results.html = function (res) { let h = rh0.apply(this, arguments); if (!res || res.outcome !== "wipe" || !res.why) return h;
    const box = `<details class="panel losswhy" open style="margin-top:10px;padding:8px 12px"><summary><b class="gold">${ico("scroll", "#e8c878", 14)} Pourquoi j'ai perdu ?</b></summary><ul class="small" style="margin:6px 0 0 16px;padding:0">${lossWhy(res).map(l => `<li style="margin:3px 0">${l}</li>`).join("")}</ul></details>`;
    const i = h.indexOf('<p class="lore"'); if (i < 0) return h + box; const j = h.indexOf("</p>", i); return h.slice(0, j + 4) + box + h.slice(j + 4); }; }

// 4 · Mode gaucher : compétences et commandes du combat en miroir
function applyLefty() { if (HASWIN && document.body) document.body.classList.toggle("lefty", !!(S && S.opts && S.opts.lefty)); }
{ const oh = SCREENS.options.html; SCREENS.options.html = function () { const s = oh.apply(this, arguments);
    const rows = `<label class="row sp"><span>${ico("hand", "#e8c878")} Mode gaucher <span class="tiny dim">— compétences et commandes du combat en miroir, pour jouer d'une main</span></span><input type="checkbox" data-opt="lefty" ${S.opts.lefty ? "checked" : ""}></label>
      <label class="row sp"><span>${ico("book")} Bulles du glossaire <span class="tiny dim">— la définition d'un terme s'ouvre la première fois qu'il apparaît</span></span><input type="checkbox" data-opt="glAuto" ${S.opts.noGlAuto ? "" : "checked"}></label>
      <label class="row sp"><span>${ico("scroll")} Notifications groupées <span class="tiny dim">— au-delà de deux messages, les suivants se rangent dans une pile</span></span><input type="checkbox" data-opt="toastPile" ${S.opts.noPile ? "" : "checked"}></label>`;
    const i = s.indexOf('<label class="row sp">'); return i >= 0 ? s.slice(0, i) + rows + s.slice(i) : s + rows; };
  const om = SCREENS.options.mount; SCREENS.options.mount = function () { const r = om && om.apply(this, arguments);
    const l = document.querySelector('[data-opt="lefty"]'); if (l) l.addEventListener("change", () => setTimeout(applyLefty, 0));
    const g = document.querySelector('[data-opt="glAuto"]'); if (g) g.addEventListener("change", () => { S.opts.noGlAuto = g.checked ? 0 : 1; delete S.opts.glAuto; save(); });
    const p = document.querySelector('[data-opt="toastPile"]'); if (p) p.addEventListener("change", () => { S.opts.noPile = p.checked ? 0 : 1; delete S.opts.toastPile; save(); });
    return r; }; }
{ const gw = go; go = function () { const r = gw.apply(this, arguments); applyLefty(); try { if (TIP.src && !TIP.src.isConnected) tipHide(); } catch (e) { } return r; }; }

// 5 · Préparation d'expédition : optimiser l'équipement des héros choisis
{ const eh = SCREENS.expe.html; SCREENS.expe.html = function () { const h = eh.apply(this, arguments); if (S.run || UI.expePane !== "team" || !UI.expe || !(UI.expe.party || []).length) return h;
    const b = `<div class="row" style="justify-content:center;margin:8px 0"><button class="btn sm gold" data-a="expeGear">${ico("anvil")}Optimiser l'équipement de la compagnie</button></div>`;
    const k = h.indexOf('<div class="partyrow">'); return k < 0 ? h : h.slice(0, k) + b + h.slice(k); }; }
ACT.expeGear = () => { const E = UI.expe; if (!E || !E.party.length) return; const out = autoEquipAll(0, E.party.slice()) || [];
  save(); sfx("forge"); toast(out.length ? `${ico("anvil", "#e8c878", 14)} ${out.length} objet${out.length > 1 ? "s" : ""} équipé${out.length > 1 ? "s" : ""}.` : "Vos héros portent déjà le meilleur de l'inventaire.", out.length ? "good" : ""); refresh(); };

// 6 · Flèche sur les vignettes de l'inventaire : ▲ vert = mieux que ce que porte un héros capable de l'équiper
const USEFUL_C = { m: new Map(), t: 0 };
function usefulCached(it) { if (!USEFUL_C.t) USEFUL_C.t = setTimeout(() => { USEFUL_C.m.clear(); USEFUL_C.t = 0; }, 0);
  if (USEFUL_C.m.has(it.id)) return USEFUL_C.m.get(it.id); let v = false; try { v = itemUseful(it); } catch (e) { } USEFUL_C.m.set(it.id, v); return v; }
{ const sl = slotHTML; slotHTML = function (it) { const h = sl.apply(this, arguments); if (!it || !it.id || !S || !S.inv || !S.inv.includes(it)) return h;
    const up = usefulCached(it); const mk = up ? `<span class="uparr" title="Meilleur que l'équipement d'un de vos héros">▲</span>` : `<span class="uparr no" title="Aucun héros n'y gagne">▼</span>`;
    const e = h.lastIndexOf("</div>"); return e < 0 ? h : h.slice(0, e) + mk + h.slice(e); }; }

// 7 · Notifications groupées : au-delà de deux messages visibles, les suivants vont dans une pile à toucher
const TPILE = { list: [], el: null, t: 0 };
{ const t0 = toast; toast = function (msg, kind = "") { try {
      if (S && S.opts && !S.opts.noPile && kind !== "hint" && HASWIN && UI.screen !== "combat") { const box = $("#toasts"); const vis = box ? [...box.querySelectorAll(".toast:not(.hint):not(.tpile)")].length : 0;
        if (vis >= 2) { TPILE.list.push({ msg, kind, at: Date.now() }); if (TPILE.list.length > 40) TPILE.list.shift(); tpileDraw(); return; } }
    } catch (e) { } return t0.apply(this, arguments); }; }
function tpileDraw() { const box = $("#toasts"); if (!box) return; if (!TPILE.el || !TPILE.el.isConnected) { TPILE.el = document.createElement("div"); TPILE.el.className = "toast tpile"; TPILE.el.onclick = () => ACT.toastPile(); box.appendChild(TPILE.el); }
  const n = TPILE.list.length; TPILE.el.innerHTML = `${ico("scroll", "#e8c878", 14)} <b>${n}</b> autre${n > 1 ? "s" : ""} notification${n > 1 ? "s" : ""} — toucher pour lire`;
  clearTimeout(TPILE.t); TPILE.t = setTimeout(() => { if (TPILE.el) TPILE.el.remove(); TPILE.el = null; UI.pileOld = TPILE.list.splice(0); }, 6500); }
ACT.toastPile = () => { const L = TPILE.list.length ? TPILE.list.splice(0) : (UI.pileOld || []); UI.pileOld = L; if (TPILE.el) { TPILE.el.remove(); TPILE.el = null; } clearTimeout(TPILE.t);
  modal(`<h2>${ico("scroll", "#e8c878")} Notifications</h2>${L.length ? `<div class="col">${L.map(x => `<div class="card toastline ${x.kind}" style="cursor:default;padding:6px 10px">${x.msg}</div>`).join("")}</div>` : '<p class="small dim">Rien de nouveau.</p>'}<button class="btn" style="margin-top:10px;width:100%" data-a="closeModal">Fermer</button>`); };

// 8 · Recherche globale : héros, objets, termes du glossaire, bâtiments, créatures rencontrées
const SRCH_SVG = `<svg viewBox="0 0 24 24" width="15" height="15" style="vertical-align:-3px" fill="none" stroke="#e8c878" stroke-width="2.4" stroke-linecap="round"><circle cx="10" cy="10" r="6.5"/><path d="M15 15l6 6"/></svg>`;
{ const rh = renderHud; renderHud = function () { const r = rh.apply(this, arguments); try { const hd = $("#hud"); if (hd && hd.style.display !== "none" && UI.screen !== "combat" && !hd.querySelector(".gsrch")) hd.insertAdjacentHTML("beforeend", `<button class="resmore gsrch" data-a="gSearch" title="Rechercher">${SRCH_SVG}</button>`); } catch (e) { } return r; }; }
const norm = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
function gSearchResults(q) { q = norm(q).trim(); if (q.length < 2) return []; const out = [], has = s => norm(s).includes(q);
  for (const h of S.heroes) if (has(h.name) || has(CLASSES[h.cls] && CLASSES[h.cls].n)) out.push({ g: "Héros", n: `${esc(h.name)} <span class="tiny dim">${CLASSES[h.cls].n} · niv ${h.lvl}</span>`, a: "gsHero", v: h.id });
  const items = S.inv.concat(S.heroes.flatMap(h => Object.values(h.gear).filter(Boolean)));
  let ni = 0; for (const it of items) { if (ni >= 25) break; const nm = gearName(it); if (has(nm)) { ni++; const w = S.heroes.find(h => Object.values(h.gear).includes(it)); out.push({ g: "Objets", n: `<span class="rar${it.rar}">${nm}</span>${w ? ` <span class="tiny dim">porté par ${esc(w.name)}</span>` : ""}`, a: "gsItem", v: it.id }); } }
  for (const k in BUILDINGS) { const B = BUILDINGS[k]; const nm = typeof bldName === "function" ? bldName(k) : B.n; if (has(nm) || has(B.n) || has(k)) out.push({ g: "Bâtiments", n: esc(nm), a: "gsBld", v: k }); }
  for (const k in GLOSS) { const G = GLOSS[k]; if (has(G.n) || has(k)) out.push({ g: "Glossaire", n: `<b>${G.n}</b><div class="tiny dim">${G.d}</div>`, a: "", v: k }); }
  const seen = (S.seen && S.seen.monsters) || {}; let nm2 = 0; for (const k in seen) { const M = MONSTERS[k]; if (M && has(M.n) && nm2++ < 15) out.push({ g: "Créatures", n: esc(M.n), a: "gsMon", v: k }); }
  return out.slice(0, 80); }
function gSearchList(q) { const R = gSearchResults(q); if (!R.length) return `<p class="small dim" style="text-align:center">${norm(q).trim().length < 2 ? "Tapez au moins deux lettres." : "Aucun résultat."}</p>`;
  let g = "", s = ""; for (const r of R) { if (r.g !== g) { g = r.g; s += `<div class="tiny gold" style="margin:8px 0 3px;text-transform:uppercase;letter-spacing:.08em">${g}</div>`; } s += r.a ? `<button class="choice" style="padding:6px 10px;text-align:left" data-a="${r.a}" data-v="${r.v}">${r.n}</button>` : `<div class="card" style="cursor:default;padding:6px 10px">${r.n}</div>`; }
  return `<div class="col" style="gap:4px">${s}</div>`; }
ACT.gSearch = () => { modal(`<h2>${SRCH_SVG} Rechercher</h2><input id="gsq" class="uk_input" type="search" autocomplete="off" placeholder="Héros, objet, terme, bâtiment, créature…" value="${esc(UI.gsq || "")}" style="width:100%;font-size:16px;padding:8px 10px;box-sizing:border-box"><div id="gsr" style="margin-top:6px">${gSearchList(UI.gsq || "")}</div>`);
  const i = $("#gsq"); if (!i) return; let t = 0; i.addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => { UI.gsq = i.value; const r = $("#gsr"); if (r) r.innerHTML = gSearchList(i.value); }, 120); }); setTimeout(() => { try { i.focus(); } catch (e) { } }, 60); };
ACT.gsHero = id => { closeModal(); ACT.heroInfo(id); };
ACT.gsItem = id => { closeModal(); ACT.itemInfo(id); };
ACT.gsBld = k => { closeModal(); if (k === "porte") return go("expe"); if (UI.screen !== "bastion") go("bastion"); openBuilding(k); };
ACT.gsMon = k => { closeModal(); ACT.monSheet(k); };
// notifications (26 nov.) : une notification qui a fini de s'effacer est retirée aussitôt — plus de zone invisible qui capte le toucher
if (typeof document !== "undefined") document.addEventListener("animationend", e => { const t = e.target; if (e.animationName === "tout" && t && t.classList && t.classList.contains("toast")) { if (t === TPILE.el) TPILE.el = null; t.remove(); } }, true);
