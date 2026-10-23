/* ═══════════════════════ Carte d'expédition : parchemin peint, chemins à l'encre, jetons de salles ═══════════════════════ */
const MAP_INK = "#3a2616";

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
function mapToken(type) { // jetons et fanion du groupe peints, servis tels quels
  if (!HASWIN) return "";
  const n = type === "pawn" ? "ui_pawn" : "map_" + type; return artHas(n) ? "assets/" + n + ".webp" : "";
}
