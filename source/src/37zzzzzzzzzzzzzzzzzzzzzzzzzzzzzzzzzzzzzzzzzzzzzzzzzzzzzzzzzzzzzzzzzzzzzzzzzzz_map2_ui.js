// ── Carte d'expédition refaite (21 nov.) : bandeau peint compact et collant en haut, compagnie collante en bas
//    (portraits encadrés, barres de PV forgées), étiquettes de salles en plaques, défilement vers les salles à jouer
{ const mh = SCREENS.map.html; SCREENS.map.html = function () { let h = mh.apply(this, arguments); if (!h || !S.run) return h;
    h = h.replace('<div class="panel" style="padding:8px 10px">', '<div class="panel maphud">');
    h = h.replace('<div class="row" style="justify-content:center;gap:6px;margin-top:6px;flex-wrap:nowrap">', '<div class="row mapparty">');
    h = h.replace(/<div class="panel" style="padding:4px;width:84px;text-align:center;([^"]*)">/g, '<div class="mphero" style="$1">');
    h = h.replace(/<div class="bar" style="height:6px"><i style="width:([0-9.]+)%"><\/i><\/div>/g, '<div class="mphp"><i style="width:$1%"></i></div>');
    return h; }; }
{ const mm = SCREENS.map.mount; SCREENS.map.mount = function () { const r = mm && mm.apply(this, arguments);
    setTimeout(() => { try { const v = $("#view"), n = v && v.querySelector(".node.av"); if (!v || !n || UI._mapScrolled === (S.run && S.run.pos && S.run.pos.c)) return;
      UI._mapScrolled = S.run && S.run.pos && S.run.pos.c; const rv = v.getBoundingClientRect(), rn = n.getBoundingClientRect(), y = rn.top - rv.top + v.scrollTop - rv.height * .38;
      v.scrollTo({ top: Math.max(0, y), behavior: "smooth" }); } catch (e) { } }, 250); return r; }; }
// chemins en pas de cendres (21 nov.) : parcourus = suie et braises, possibles = cendre pâle lumineuse, à venir = traces à peine visibles
function ashFoot(x, px, py, ang, left, s) { x.save(); x.translate(px, py); x.rotate(ang + Math.PI / 2); if (!left) x.scale(-1, 1); x.scale(s, s);
  x.beginPath(); x.ellipse(0, -4, 3.3, 5.2, .12, 0, 7); x.fill(); x.beginPath(); x.ellipse(.4, 5.2, 2.5, 2.8, 0, 0, 7); x.fill();
  for (const [tx, ty, r] of [[-2.6, -10.2, 1], [-.9, -11, 1], [.8, -10.9, .95], [2.4, -10.1, .85]]) { x.beginPath(); x.arc(tx, ty, r, 0, 7); x.fill(); } x.restore(); }
function ashTrail(x, a, b, mx, my, style, rng) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), N = Math.max(8, L | 0), pts = [];
  for (let k = 0; k <= N; k++) { const t = k / N, u = 1 - t; pts.push([u * u * a[0] + 2 * u * t * mx + t * t * b[0], u * u * a[1] + 2 * u * t * my + t * t * b[1]]); }
  const step = 17, gap = 28; let acc = 0, left = rng() < .5;
  const C = style === "done" ? { f: "rgba(26,18,14,.92)", g: "#ff7a2a", gb: 7 } : style === "hot" ? { f: "rgba(236,222,200,.92)", g: "#ffc06a", gb: 9 } : { f: "rgba(215,200,180,.34)", g: null, gb: 0 };
  for (let k = 1; k < pts.length; k++) { acc += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]); if (acc < step) continue; acc = 0;
    const [px, py] = pts[k]; if (Math.hypot(px - a[0], py - a[1]) < gap || Math.hypot(px - b[0], py - b[1]) < gap) continue;
    const ang = Math.atan2(py - pts[k - 1][1], px - pts[k - 1][0]), o = left ? 3.2 : -3.2;
    x.save(); const im = artImg("map_step" + (1 + (k % 4))), fx = px - Math.sin(ang) * o, fy = py + Math.cos(ang) * o;
    if (im) { x.translate(fx, fy); x.rotate(ang + Math.PI / 2); if (!left) x.scale(-1, 1); x.globalAlpha = style === "done" ? 1 : style === "hot" ? 1 : .6; if (C.g) { x.shadowColor = C.g; x.shadowBlur = C.gb; } x.filter = style === "hot" ? "brightness(3) sepia(.3)" : style === "done" ? "brightness(1.3)" : "brightness(2.4) sepia(.2)"; const hh = 24, ww = hh * .58; x.drawImage(im, -ww / 2, -hh / 2, ww, hh); }
    else { x.fillStyle = C.f; if (C.g) { x.shadowColor = C.g; x.shadowBlur = C.gb; } ashFoot(x, fx, fy, ang, left, .72); } x.restore();
    if (style === "done" && rng() < .35) { x.fillStyle = "rgba(255,140,50,.85)"; x.beginPath(); x.arc(px - Math.sin(ang) * o + (rng() - .5) * 3, py + Math.cos(ang) * o + (rng() - .5) * 3, .9, 0, 7); x.fill(); }
    left = !left; } }
paintMapBg = function (c, run, W, H, pos) { // pas de cendres peints
  const x = c.getContext("2d"), k = c.width / W, rng = mkRng((run.seed || 7) * 13 + (run.floor || 0));
  x.save(); x.scale(k, k); x.clearRect(0, 0, W, H); const cur = run.pos;
  for (const col of run.map) for (const n of col) for (const j of n.links) {
    const m = run.map[n.c + 1][j], from = cur && cur.c === n.c && cur.i === n.i, a = pos(n), b = pos(m);
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, bend = (rng() - .5) * .5 * L; // courbe douce, d'un côté ou de l'autre
    const mx = (a[0] + b[0]) / 2 - dy / L * bend, my = (a[1] + b[1]) / 2 + dx / L * bend;
    ashTrail(x, a, b, mx, my, n.visited && m.visited ? "done" : from ? "hot" : "", rng); }
  x.restore(); };
