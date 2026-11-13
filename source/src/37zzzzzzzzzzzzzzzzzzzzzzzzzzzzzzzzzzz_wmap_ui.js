/* Carte du monde en deux cartes : « Le Royaume » (chapitres I–X et l'Abîme) et « L'Envers » (XI–XX, fond bg_worldmap2).
   Chaque carte suit un vrai chemin en serpentin ; onglets pour passer de l'une à l'autre, flèches au bout de la route.
   Large : 5 colonnes × 2 rangées (l'Abîme sur le tournant entre V et VI) ; étroit : 2 colonnes, carte en hauteur. */
function wmapPages(regs) {
  const ch = regs.filter(r => r.id !== "abime"), ab = regs.find(r => r.id === "abime");
  const A = ch.slice(0, 10), B = ch.slice(10);
  if (ab) { const i = A.findIndex(r => r.id === "citadelle"); A.splice(i >= 0 ? i + 1 : A.length, 0, ab); }
  return B.length ? [A, B] : [A];
}
const WMAP2 = { racines: [.09, .2], sel: [.1, .72], pendus: [.27, .56], monastere: [.31, .2], echo: [.46, .14], mer_cendres: [.44, .52], cathedrale: [.65, .13], jardin_os: [.62, .68], faille: [.79, .58], coeur: [.92, .36] };
function wmapLayout(L) {
  const narrow = typeof innerWidth !== "undefined" && innerWidth < 600, P = {};
  // L'Envers (grand écran) : chaque chapitre posé sur son lieu peint (bg_worldmap2) — racines, sel, gibets, monastère, mer de cendres, cathédrale renversée, jardin d'os, faille, cœur
  if (!narrow && L.length && !L.some(r => r.id === "abime") && L.every(r => WMAP2[r.id])) { for (const r of L) P[r.id] = WMAP2[r.id]; return { P, W: 1000, H: 560, narrow }; }
  if (!narrow) {
    const main = L.filter(r => r.id !== "abime"), xs = n => [.09, .27, .45, .63, .81].slice(0, n);
    main.forEach((r, i) => { const row = Math.floor(i / 5), c0 = i % 5, c = row ? 4 - c0 : c0, wave = (c % 2 ? .07 : -.05) * (row ? -1 : 1);
      P[r.id] = [xs(5)[c] + (L.some(x => x.id === "abime") ? 0 : .05), (row ? .74 : .24) + wave]; });
    if (L.some(r => r.id === "abime")) P.abime = [.93, .5];
    return { P, W: 1000, H: 560, narrow };
  }
  const rows = Math.ceil(L.length / 2);
  L.forEach((r, i) => { const row = Math.floor(i / 2), c = (row % 2 ? 1 - i % 2 : i % 2); P[r.id] = [c ? .72 : .28, (row + .5) / rows]; });
  return { P, W: 1000, H: Math.round(1000 * rows * .36), narrow };
}
// menace : 5 crans (vaincue en or, ouverte en contour, fermée en gris) ; survol = niveau conseillé
function wmapPips(r) { const p = S.prog[r.id] || {}, top = p.clears ? (p.threat || 0) : -1, open = threatMax(r.id);
  const tip = `Menace vaincue : ${top >= 0 ? roman(top + 1) : "aucune"} · niveau conseillé ${typeof recLevel === "function" ? recLevel(r.id, Math.min(4, open)) : r.lvl}`;
  return `<u class="wthr" title="${esc(tip)}">${[0, 1, 2, 3, 4].map(t => `<b class="${t <= top ? "on" : t <= open ? "op" : ""}"></b>`).join("")}</u>`; }
// cartes composées (art/mkworldmap.py : chaque chapitre = sa propre illustration, posée à son emplacement)
// cartes peintes d'une seule pièce : chaque chapitre posé à la main sur son lieu dans l'illustration (spirale depuis le centre)
const WMAP_ART = {
  A: { img: "bg_wmap_royaume", W: 2000, H: 1125, pos: { bourg: [.467, .41], foret: [.67, .39], catacombes: [.75, .12], marais: [.48, .12], citadelle: [.22, .11], abime: [.17, .36], terres: [.18, .62], cimes: [.13, .80], cite: [.48, .78], mines: [.78, .68], trone: [.92, .40] } },
  B: { img: "bg_wmap_envers", W: 2000, H: 1125, pos: { racines: [.50, .47], sel: [.27, .42], pendus: [.15, .68], monastere: [.48, .75], echo: [.77, .74], mer_cendres: [.83, .44], cathedrale: [.80, .18], jardin_os: [.55, .18], faille: [.30, .13], coeur: [.11, .19] } },
};
function wmapComposed(pg) { try { const A = WMAP_ART[pg ? "B" : "A"]; if (A && artHas(A.img)) return { img: A.img, art: 1, G: { P: A.pos, W: A.W, H: A.H, narrow: false } }; } catch (e) { }
  try { const W = window.WMAP_POS && window.WMAP_POS[pg ? "B" : "A"]; if (!W) return null; const narrow = typeof innerWidth !== "undefined" && innerWidth < 600, V = W[narrow ? "tall" : "wide"];
    if (!V || !artHas(V.img)) return null; return { img: V.img, G: { P: V.pos, W: V.size[0], H: V.size[1], narrow } }; } catch (e) { return null; } }
ACT.wmapPage = v => { UI.wmapPage = +v; refresh(); };
worldMapHTML = function (E, regs) {
  const pages = wmapPages(regs);
  let pg = UI.wmapPage; if (pg == null || pg >= pages.length) { pg = pages.findIndex(L => L.some(r => r.id === E.region)); if (pg < 0) pg = 0; }
  const L = pages[pg], WM = wmapComposed(pg), G = WM ? WM.G : wmapLayout(L), pos = r => G.P[r.id] || [.5, .5], pt = r => [pos(r)[0] * G.W, pos(r)[1] * G.H];
  const sel = regs.find(r => r.id === E.region), un = sel && regionUnlocked(sel.id), p = sel && S.prog[sel.id];
  const segs = [];
  for (let i = 0; i < L.length - 1; i++) { const a = L[i], b = L[i + 1], c1 = pt(a), c2 = pt(b), p0 = L[i - 1] ? pt(L[i - 1]) : c1, p3 = L[i + 2] ? pt(L[i + 2]) : c2;
    const f = v => v.toFixed(1), d = WM && WM.art ? `M${f(c1[0])},${f(c1[1])} L${f(c2[0])},${f(c2[1])}` : `M${f(c1[0])},${f(c1[1])} C${f(c1[0] + (c2[0] - p0[0]) / 6)},${f(c1[1] + (c2[1] - p0[1]) / 6)} ${f(c2[0] - (p3[0] - c1[0]) / 6)},${f(c2[1] - (p3[1] - c1[1]) / 6)} ${f(c2[0])},${f(c2[1])}`;
    segs.push(`<path d="${d}" class="road ${a.id === "abime" || b.id === "abime" ? "abyss" : ""} ${regionUnlocked(b.id) ? "done" : ""}"/>`); }
  const node = r => { const ok = regionUnlocked(r.id), cl = S.prog[r.id] && S.prog[r.id].clears, [x, y] = pos(r), idx = r.id !== "abime" && r.sub ? r.sub.replace(/^Chapitre /, "") : "";
    return `<button class="wnode ${E.region === r.id ? "sel" : ""} ${ok ? "" : "lock"} ${r.id === "abime" ? "abyss" : ""}" style="left:${x * 100}%;top:${y * 100}%" data-a="${ok && !E.daily ? "pickReg" : ""}" data-v="${r.id}" title="${esc(r.n)}"><i style="background-image:url(assets/bg_${r.id}.webp)">${idx ? `<b class="wnum">${idx}</b>` : ""}</i>${!ok ? `<em>${ico("lock", "#c8b8a0", 14)}</em>` : cl ? `<em class="cl">${ico("crown", "#e8c878", 14)}</em>` : ""}<span>${esc(r.n.replace(/^(Les|Le|La|L') ?/, ""))}</span>${ok && r.id !== "abime" ? wmapPips(r) : ""}</button>`; };
  const names = ["Le Royaume · I–X", "L'Envers · XI–" + roman(10 + (pages[1] || []).length)];
  const tabs = pages.length > 1 ? `<div class="tabs wmtabs">${pages.map((P, i) => `<button class="btn sm ${i === pg ? "on" : ""}" data-a="wmapPage" data-v="${i}">${i ? ico("skull", "#c8a0ff", 14) : ico("crown", "#e8c878", 14)} ${names[i]}${P.some(r => r.id === E.region) && i !== pg ? " •" : ""}</button>`).join("")}</div>` : "";
  const bg = WM ? WM.img : (pg ? "bg_worldmap2" : "bg_worldmap"), hasBg = artHas(bg);
  const next = pages.length > 1 ? (pg ? `<button class="wmgo prev" data-a="wmapPage" data-v="0">‹ Le Royaume</button>` : `<button class="wmgo next" data-a="wmapPage" data-v="1">L'Envers ›</button>`) : "";
  return `${tabs}${WM && WM.art ? `<div class="wmscroll">` : ""}<div class="wmap wmap2 ${WM ? "wmap3" : ""} ${WM && WM.art ? "wmart" : ""} ${G.narrow ? "tall" : ""} ${hasBg ? "img" : ""} ${pg ? "envers" : ""}" style="aspect-ratio:${G.W}/${G.H};${hasBg ? `background-image:url(assets/${bg}.webp)` : ""}"><svg viewBox="0 0 ${G.W} ${G.H}" preserveAspectRatio="none">${segs.join("")}</svg>${L.map(node).join("")}${next}</div>${WM && WM.art ? "</div>" : ""}
    ${sel ? `<div class="panel wsel"><div class="tiny dim">${sel.sub}${sel.id === "abime" ? ` · record ${S.abyss.best}` : ` · niveau ${sel.lvl}+`}${p && p.clears ? ` · vaincu ${p.clears} fois` : ""}</div><h3 style="margin:2px 0">${sel.n}</h3><p class="small" style="margin:0">${un ? sel.d : "Terminez le chapitre précédent pour ouvrir la route."}</p></div>` : ""}`;
};
// en choisissant une destination, la carte suit (sauf si le joueur a changé de carte à la main depuis)
{ const pr = ACT.pickReg; if (pr) ACT.pickReg = function (v) { UI.wmapPage = null; return pr.apply(this, arguments); }; }
// téléphone : la carte peinte défile ; on centre le chapitre choisi
{ const em = SCREENS.expe.mount; SCREENS.expe.mount = function () { const r = em && em.apply(this, arguments);
    try { const sc = document.querySelector(".wmscroll"), n = sc && sc.querySelector(".wnode.sel"); if (sc && n && sc.scrollWidth > sc.clientWidth) sc.scrollLeft = Math.max(0, n.offsetLeft - sc.clientWidth / 2); } catch (e) { }
    return r; }; }
