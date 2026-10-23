/* ═══════════════════════ Carte d'expédition : parchemin peint, chemins à l'encre, jetons de salles ═══════════════════════ */
const MAP_INK = "#3a2616";
const TOKEN_ART = {};
// chemins de la carte, dessinés sur un calque transparent : le décor animé de la région reste visible dessous
function paintMapBg(c, run, W, H, pos) {
  const x = c.getContext("2d"), k = c.width / W, rng = mkRng((run.seed || 7) * 13 + (run.floor || 0));
  x.save(); x.scale(k, k); x.clearRect(0, 0, W, H);
  const cur = run.pos;
  const ink = (a, b, style) => {
    const mx = (a[0] + b[0]) / 2 + (rng() - .5) * 22, my = (a[1] + b[1]) / 2 + (rng() - .5) * 22;
    const path = new Path2D(); path.moveTo(a[0], a[1]); path.quadraticCurveTo(mx, my, b[0], b[1]);
    x.lineCap = "round";
    if (style === "hot") { x.save(); x.shadowColor = "#ffb04a"; x.shadowBlur = 12; x.strokeStyle = "rgba(20,10,4,.8)"; x.lineWidth = 6; x.stroke(path); x.restore(); x.strokeStyle = "#e8b04a"; x.lineWidth = 3; x.stroke(path); }
    else if (style === "done") { x.strokeStyle = "rgba(10,4,2,.75)"; x.lineWidth = 6; x.stroke(path); x.strokeStyle = "#a83a24"; x.lineWidth = 3; x.stroke(path); }
    else { x.strokeStyle = "rgba(10,6,4,.7)"; x.lineWidth = 4.5; x.setLineDash([1, 9]); x.stroke(path); x.strokeStyle = "rgba(230,205,160,.55)"; x.lineWidth = 2.2; x.stroke(path); x.setLineDash([]); }
  };
  for (const col of run.map) for (const n of col) for (const j of n.links) {
    const m = run.map[n.c + 1][j], from = cur && cur.c === n.c && cur.i === n.i;
    ink(pos(n), pos(m), n.visited && m.visited ? "done" : from ? "hot" : "");
  }
  x.restore();
}
// jeton peint d'une salle (cercle de pierre et objet), mis en cache en image
function mapToken(type) {
  if (!HASWIN) return "";
  if (type !== "pawn") return artHas("map_" + type) ? "assets/map_" + type + ".webp" : ""; // jetons peints, servis tels quels
  if (TOKEN_ART.pawn) return TOKEN_ART.pawn;
  const S0 = 128, cv = document.createElement("canvas"); cv.width = cv.height = S0; const x = cv.getContext("2d"), c = S0 / 2;
  x.save(); x.translate(c, c); x.lineCap = x.lineJoin = "round";
  switch (type) {
    case "pawn": { // fanion du groupe planté sur la carte
      x.translate(-10, 6);
      shade(x, seg([0, 50], [0, -50], 3.6, 3), MAT.dwood, { d: 1 });
      shade(x, circ(0, -52, 4.2), MAT.gold, { ol: 1.2, d: .8 });
      const fl = P([[2, -46, 1], [46, -38], [32, -26], [46, -14], [2, -10, 1]], true, .25); shade(x, fl, "#8a1a14", { grad: lgrad(x, 2, -46, 46, -10, [[0, "#a82a1a"], [1, "#5a0e0a"]]), d: 2 });
      x.save(); x.clip(fl); x.strokeStyle = MAT.gold; x.lineWidth = 2; x.stroke(fl); x.restore(); x.lineWidth = 2.2; x.strokeStyle = INK; x.stroke(fl);
      shade(x, poly([[16, -34], [22, -34], [22, -30], [26, -30], [26, -26], [22, -26], [22, -18], [16, -18], [16, -26], [12, -26], [12, -30], [16, -30]]), "#e8c878", { ol: 1, d: .5 });
      x.fillStyle = "rgba(0,0,0,.35)"; x.beginPath(); x.ellipse(2, 52, 12, 4, 0, 0, 7); x.fill();
      break;
    }
  }
  x.restore();
  return TOKEN_ART.pawn = cv.toDataURL();
}
