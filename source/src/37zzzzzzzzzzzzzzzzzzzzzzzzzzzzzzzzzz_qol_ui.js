/* Confort (12 nov.) : héros favoris, recyclage automatique au retour, recherche dans les Archives, résumé de fin d'expédition enrichi. */
// ── Héros favoris : ★ sur la fiche, toujours en tête des listes ──
ACT.heroFav = id => { const h = heroById(id); if (!h) return; h.fav = h.fav ? 0 : 1; save(); toast(h.fav ? `${esc(h.name)} est en favori.` : `${esc(h.name)} n'est plus en favori.`, "good"); heroSheet(h); };
{ const hs = heroSheetHTML; heroSheetHTML = function (h, foot) { let s = hs.apply(this, arguments); if (!h || !heroById(h.id)) return s;
  const b = `<button class="btn sm ${h.fav ? "gold" : "ghost"}" data-a="heroFav" data-v="${h.id}" style="margin-left:6px">${h.fav ? "★ Favori" : "☆ Favori"}</button>`;
  return s.replace(/(<h2[^>]*>)([\s\S]*?)(<\/h2>)/, (m, a, b0, c) => a + b0 + b + c); }; }
if (typeof heroSortFn === "function") { const hf = heroSortFn; heroSortFn = function () { const f = hf.apply(this, arguments); return (a, b) => ((b.fav ? 1 : 0) - (a.fav ? 1 : 0)) || f(a, b); }; }
{ const hh = SCREENS.heroes.html; SCREENS.heroes.html = function () { const s = hh.apply(this, arguments); return S.heroes.some(h => h.fav) ? s.replace(/(data-go="hero" data-arg="([^"]+)"[^>]*>)/g, (m, a, id) => { const h = heroById(id); return h && h.fav ? a + '<span style="float:right;color:#ffd27a;font-size:16px">★</span>' : a; }) : s; }; }

// ── Recyclage automatique au retour d'expédition (option) ──
{ const er = endRun; endRun = function (outcome) { const r = er.apply(this, arguments); try { if (S.opts.autoSalv) { const L = salvCandidates([0, 1], true).filter(it => !it.lock && !it.uniq); let g = 0; for (const it of L) { const g0 = S.gold; if (salvageItem(it)) g += S.gold - g0; } if (L.length && typeof toast === "function") toast(`Recyclage automatique : ${L.length} objet${L.length > 1 ? "s" : ""} Commun${L.length > 1 ? "s" : ""}/Peu commun${L.length > 1 ? "s" : ""} inutile${L.length > 1 ? "s" : ""} (+${fmt(g)} or)`, "good"); } } catch (e) { } return r; }; }
{ const oh = SCREENS.options.html; SCREENS.options.html = function () { const s = oh.apply(this, arguments);
  const row = `<label class="row sp"><span>${ico("anvil")} Recyclage automatique <span class="tiny dim">— au retour, recycle les objets Communs et Peu communs qui n'améliorent aucun héros</span></span><input type="checkbox" data-opt="autoSalv" ${S.opts.autoSalv ? "checked" : ""}></label>`;
  const i = s.indexOf('<label class="row sp"><span>' + ico("speed")); return i >= 0 ? s.slice(0, i) + row + s.slice(i) : s.replace(/(<label class="row sp">)/, row + "$1"); }; }

// ── Recherche dans les Archives (filtre les fiches de l'onglet courant) ──
{ const ch = SCREENS.codex.html; SCREENS.codex.html = function () { const s = ch.apply(this, arguments); const q = UI.codexQ || "";
  return s.replace(/(<div class="tabs">[\s\S]*?<\/div>)/, `$1<div class="row" style="gap:6px;margin:6px 0"><input id="cxq" type="search" placeholder="Rechercher dans cet onglet…" value="${esc(q)}" style="flex:1;min-width:0;padding:7px 10px;background:#0c0806;border:1px solid #c9a24a55;border-radius:6px;color:#e8dcc8;font:inherit">${q ? '<button class="btn sm ghost" data-a="codexQ" data-v="">✕</button>' : ""}</div>`); };
  const cm = SCREENS.codex.mount; SCREENS.codex.mount = function () { const r = cm && cm.apply(this, arguments); const inp = document.getElementById("cxq"); if (inp) { inp.oninput = () => { UI.codexQ = inp.value; codexFilter(); }; if (UI.codexQ) codexFilter(); } return r; }; }
ACT.codexQ = v => { UI.codexQ = v || ""; refresh(); };
function codexFilter() { const q = (UI.codexQ || "").trim().toLowerCase(); const w = document.querySelector("#view .wrap"); if (!w) return;
  const items = [...w.querySelectorAll(".grid > *, .col > *")].filter(e => !e.closest(".tabs") && !e.classList.contains("atpager"));
  if (!q) { refresh(); setTimeout(() => { const i = document.getElementById("cxq"); if (i) i.focus(); }, 0); return; }
  w.querySelectorAll(".atpager, .autotabs").forEach(b => b.style.display = "none"); // en recherche : tout l'onglet, sans pages ni sous-onglets
  w.querySelectorAll("h2, h3, .grid, .col, p").forEach(e => { if (e.style.display === "none" && !e.closest(".card")) { e.style.display = ""; e.dataset.qh = 1; } });
  for (const e of items) { const hit = e.textContent.toLowerCase().includes(q); e.style.display = hit ? "" : "none"; e.dataset.qh = 1; }
  for (const L of w.querySelectorAll(".grid, .col")) { if (L.closest(".card")) continue; const any = [...L.children].some(c => c.style.display !== "none"); L.style.display = any ? "" : "none"; L.dataset.qh = 1; const h = L.previousElementSibling; if (h && /^H[23]$/.test(h.tagName)) { h.style.display = any ? "" : "none"; h.dataset.qh = 1; } }
  let none = w.querySelector(".cxnone"); const vis = items.some(e => e.style.display !== "none"); if (!vis && !none) { none = document.createElement("div"); none.className = "empty cxnone"; none.textContent = "Aucun résultat dans cet onglet."; w.appendChild(none); } else if (vis && none) none.remove(); }

// ── Bilan d'expédition : « Repartir » relance aussitôt la même expédition (mêmes héros, destination, menace) ──
{ const rh = SCREENS.results.html; SCREENS.results.html = function (res) { const s = rh.apply(this, arguments); if (!S.lastExpe || !S.lastExpe.party || (S.repeat && S.repeat.n)) return s;
  const R = regionById(S.lastExpe.region); return s.replace('<button class="btn main" data-go="bastion">', `<button class="btn" data-a="quickStart" style="margin-right:6px">${ico("map")}Repartir${R ? ` · ${R.n}` : ""}</button><button class="btn main" data-go="bastion">`); }; }

// ── Combat : « Terminer » — résout instantanément le reste du combat en automatique (même moteur que les bots) ──
ACT.cbSkip = () => { const B = CB.B; if (!B || B.over || CB.skipping || !skipOpen()) return; CB.skipping = B; CB.B = null; toast("Résolution du combat…");
  setTimeout(() => { if (CB.skipping !== B) return; CB.skipping = 0; let ok = true;
    try { if ((B.raid || (S.run && S.run.raid)) && typeof RAID_ROUNDS !== "undefined") { simBattle(B, S.run, "bal", Math.max(1, RAID_ROUNDS - (B.round || 0) + 1)); if (!B.over || (B.over === "lose" && B.heroes.some(alive))) B.over = "flee"; } else simBattle(B, S.run, "bal"); } catch (e) { ok = false; console.warn("cbSkip", e); }
    if (!S.run || UI.screen !== "combat") return; CB.B = B; combatEnd(ok ? (B.over || "lose") : "lose"); }, 700); };
{ const ch = SCREENS.combat.html; SCREENS.combat.html = function () { const s = ch.apply(this, arguments);
  if (!skipOpen()) return s;
  return s.replace(/(<button class="btn ghost sm" data-a="cbSpeed")/, `<button class="btn ghost sm" data-a="cbSkip" title="Terminer le combat instantanément (automatique)">${ico("skip")}<span>Fin</span></button>$1`); }; }

// ── Garde-fou : les commandes de combat ne font rien s'il n'y a plus de combat (clic tardif après la fin) ──
for (const k of Object.keys(ACT)) if (/^cb[A-Z]/.test(k) && !/^cb(Hub|Log|Desc|Info|Speed)$/.test(k)) { const f = ACT[k]; ACT[k] = function () { if (!CB.B && k !== "cbSkip") return; return f.apply(this, arguments); }; }

// ── Atlas : quêtes de région des chapitres VI–XVII ──
{ const qh = questsHTML; questsHTML = function () { const s = qh.apply(this, arguments), sf = S.flags || [];
  const rows = QUEST_REG3.filter(([r]) => regionById(r) && regionUnlocked(r)).map(([r, n]) => { const st = sf.includes("q3_" + r + "2") ? 2 : sf.includes("q3_" + r + "1") ? 1 : 0, R = regionById(r);
    return `<div class="row sp card" style="cursor:default"><span><b>${esc(n)}</b> <span class="tiny dim">${esc(R.n)}</span></span><span class="tiny ${st ? "gold" : "dim"}">${st ? `Étape ${st + 1}/3 — à poursuivre là-bas` : "Étape 1/3 — rencontre à trouver"}</span></div>`; }).join("");
  return rows ? s.replace(/<\/div>\s*$/, rows + "</div>") : s; }; }

// résolution instantanée (« Fin ») : réservée aux compagnies qui ont vaincu le gardien du chapitre X (ou à partir du 2e cycle)
const SKIP_CH = 10;
function skipOpen() { try { if (typeof cycleN === "function" && cycleN() >= 1) return true; return REGIONS.filter(r => r.id !== "abime" && S.prog[r.id] && S.prog[r.id].clears > 0).length >= SKIP_CH; } catch (e) { return false; } }
