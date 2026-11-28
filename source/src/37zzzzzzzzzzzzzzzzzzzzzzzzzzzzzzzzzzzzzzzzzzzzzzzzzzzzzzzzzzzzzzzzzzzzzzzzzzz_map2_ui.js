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
function ashTrail(x, a, b, mx, my, style, rng) { // chemin de braises : un fil de cendre sombre semé de tisons rougeoyants
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), N = Math.max(8, L | 0), pts = [], gap = 26;
  for (let k = 0; k <= N; k++) { const t = k / N, u = 1 - t; pts.push([u * u * a[0] + 2 * u * t * mx + t * t * b[0], u * u * a[1] + 2 * u * t * my + t * t * b[1]]); }
  const P = pts.filter(([px, py]) => Math.hypot(px - a[0], py - a[1]) > gap && Math.hypot(px - b[0], py - b[1]) > gap); if (P.length < 2) return;
  const C = { done: ["#ff7a2a", "#ffd08a", 1, 8], hot: ["#ffcf6a", "#fff4d0", 1, 10], gold: ["#d8962a", "#f0cc80", .75, 5], shut: ["#8a1e14", "#c0402a", .55, 0] }[style] || ["#9a8a78", "#d8ccb8", .35, 0];
  x.save(); x.lineCap = "round"; x.lineJoin = "round";
  // lit de cendre (trait sombre et doux)
  x.globalAlpha = .55 * C[2]; x.strokeStyle = "#0c0806"; x.lineWidth = 5; x.beginPath(); x.moveTo(...P[0]); for (const p of P) x.lineTo(...p); x.stroke();
  // tisons : petits traits allongés espacés, qui suivent la courbe
  let acc = 0, on = true; x.globalAlpha = C[2]; x.shadowColor = C[0]; x.shadowBlur = C[3];
  for (let i = 1; i < P.length; i++) { const d = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); acc += d;
    if (on) { const g = x.createLinearGradient(P[i - 1][0], P[i - 1][1], P[i][0], P[i][1]); x.strokeStyle = C[1]; x.lineWidth = 2.1; x.beginPath(); x.moveTo(...P[i - 1]); x.lineTo(...P[i]); x.stroke(); }
    if (acc > (on ? 6 : 5)) { acc = 0; on = !on; } }
  // quelques étincelles sur le chemin parcouru
  if (style === "done" || style === "hot") { x.shadowBlur = 6; x.fillStyle = C[1]; for (let i = 0; i < P.length; i += 9) if (rng() < .5) { x.beginPath(); x.arc(P[i][0] + (rng() - .5) * 6, P[i][1] + (rng() - .5) * 6, .9, 0, 7); x.fill(); } }
  x.restore(); }
paintMapBg = function (c, run, W, H, pos) { // pas de cendres peints
  const x = c.getContext("2d"), k = c.width / W, rng = mkRng((run.seed || 7) * 13 + (run.floor || 0));
  x.save(); x.scale(k, k); x.clearRect(0, 0, W, H); const cur = run.pos;
  // salles encore atteignables depuis la position actuelle (avant le premier pas : toutes)
  const R = new Set(), key = n => n.c + ":" + n.i, st = cur ? [run.map[cur.c][cur.i]] : run.map[0].slice();
  while (st.length) { const n = st.pop(); if (!n || R.has(key(n))) continue; R.add(key(n)); for (const j of n.links) if (run.map[n.c + 1]) st.push(run.map[n.c + 1][j]); }
  for (const col of run.map) for (const n of col) for (const j of n.links) {
    const m = run.map[n.c + 1][j], from = cur && cur.c === n.c && cur.i === n.i, a = pos(n), b = pos(m);
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, bend = (rng() - .5) * .5 * L; // courbe douce, d'un côté ou de l'autre
    const mx = (a[0] + b[0]) / 2 - dy / L * bend, my = (a[1] + b[1]) / 2 + dx / L * bend;
    ashTrail(x, a, b, mx, my, n.visited && m.visited ? "done" : from ? "hot" : R.has(key(n)) && R.has(key(m)) ? "gold" : "shut", rng); }
  x.restore(); };
