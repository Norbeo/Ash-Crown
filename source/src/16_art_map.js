/* ═══════════════════════ Carte d'expédition : parchemin peint, chemins à l'encre, jetons de salles ═══════════════════════ */
const MAP_INK = "#3a2616";
const TOKEN_ART = {};
const TOKEN_BASE = { combat: "#6a6a6e", elite: "#7a1e16", event: "#4a3466", treasure: "#8a6a24", camp: "#6a3e1e", shop: "#2e5a44", boss: "#1a1214", pawn: null };
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
  const pim = type !== "pawn" ? artImg("map_" + type) : null, tk = type + (pim ? "|i" : "");
  if (TOKEN_ART[tk]) return TOKEN_ART[tk];
  const S0 = 128, cv = document.createElement("canvas"); cv.width = cv.height = S0; const x = cv.getContext("2d"), c = S0 / 2;
  if (pim) { // jeton peint
    const s = Math.min(S0 * .9 / pim.width, S0 * .9 / pim.height) * (type === "boss" ? 1 : .9), w = pim.width * s, h = pim.height * s;
    x.save(); x.shadowColor = "rgba(0,0,0,.7)"; x.shadowBlur = 10; x.shadowOffsetY = 4; x.drawImage(pim, c - w / 2, c - h / 2, w, h); x.restore();
    return TOKEN_ART[tk] = cv.toDataURL();
  }
  if (type !== "pawn") {
    const base = TOKEN_BASE[type] || "#5a5a5a", R = S0 * .4;
    x.save(); x.shadowColor = "rgba(0,0,0,.7)"; x.shadowBlur = 10; x.shadowOffsetY = 4;
    const g = x.createRadialGradient(c - R * .35, c - R * .4, 2, c, c, R * 1.1); g.addColorStop(0, lt(base, .35)); g.addColorStop(.6, base); g.addColorStop(1, dk(base, .55));
    x.fillStyle = g; x.beginPath(); x.arc(c, c, R, 0, 7); x.fill(); x.restore();
    x.lineWidth = 4; x.strokeStyle = INK; x.beginPath(); x.arc(c, c, R, 0, 7); x.stroke();
    x.lineWidth = 2; x.strokeStyle = type === "boss" ? "#b02a1a" : rgba(lt(base, .5), .8); x.beginPath(); x.arc(c, c, R - 5, 0, 7); x.stroke();
    x.lineWidth = 1.2; x.strokeStyle = rgba(INK, .6); x.beginPath(); x.arc(c, c, R - 8, 0, 7); x.stroke();
    if (type === "boss") for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; shade(x, P([[c + Math.cos(a - .12) * R, c + Math.sin(a - .12) * R], [c + Math.cos(a) * (R + 11), c + Math.sin(a) * (R + 11), 1], [c + Math.cos(a + .12) * R, c + Math.sin(a + .12) * R]], true), "#2a1a1a", { ol: 1.4, d: .6 }); }
  }
  x.save(); x.translate(c, c); x.lineCap = x.lineJoin = "round";
  switch (type) {
    case "combat": { const sw = uprightWeapon("espadon", 2, {}, .62); x.save(); for (const s of [-1, 1]) { x.save(); x.rotate(s * .62); x.drawImage(sw, -sw.width / 2, -sw.height + 70 * .62 + 26); x.restore(); } x.restore(); break; }
    case "elite": {
      for (const s of [-1, 1]) { x.save(); x.rotate(s * .7); shade(x, seg([0, -26], [0, 26], 5, 5), MAT.bone, { ol: 1.6, d: 1 }); for (const e of [-26, 26]) shade(x, circ(0, e, 4.5), MAT.bone, { ol: 1.4, d: .8 }); x.restore(); }
      shade(x, skullPath(0, -2, 17), MAT.bone, { d: 2.5 }); x.fillStyle = INK; for (const dx of [-6, 6]) { x.beginPath(); x.ellipse(dx, -4, 4.4, 5, 0, 0, 7); x.fill(); }
      x.save(); x.globalCompositeOperation = "lighter"; for (const dx of [-6, 6]) glow(x, dx, -4, 7, "#ff4a2a", .8); x.restore();
      x.beginPath(); x.moveTo(0, 2); x.lineTo(-2.5, 7); x.lineTo(2.5, 7); x.closePath(); x.fill(); for (let i = -2; i <= 2; i++) x.fillRect(i * 3.2 - 1, 10, 2, 5);
      break;
    }
    case "event": {
      x.save(); x.globalCompositeOperation = "lighter"; glow(x, 0, 0, 34, "#b48cff", .35); x.restore();
      const eye = P([[-26, 0], [0, -15], [26, 0], [0, 15]], true, .5); shade(x, eye, "#efe6d4", { d: 2 });
      x.save(); x.clip(eye); const ig = x.createRadialGradient(0, 0, 1, 0, 0, 11); ig.addColorStop(0, "#e8d0ff"); ig.addColorStop(.5, "#8a4ad0"); ig.addColorStop(1, "#2a1040"); x.fillStyle = ig; x.beginPath(); x.arc(0, 0, 11, 0, 7); x.fill(); x.fillStyle = INK; x.beginPath(); x.ellipse(0, 0, 2.6, 8, 0, 0, 7); x.fill(); x.restore();
      dot(x, 4, -4, 2, "rgba(255,255,255,.9)"); x.lineWidth = 3; x.strokeStyle = INK; x.stroke(eye);
      break;
    }
    case "treasure": {
      const w = 26, h = 16; shade(x, P([[-w, -2, 1], [w, -2, 1], [w, h, 1], [-w, h, 1]], true), "#6a3e1a", { d: 2.5 });
      shade(x, P([[-w, -2, 1], [-w, -12], [0, -20], [w, -12], [w, -2, 1]], true, .6), "#7a4a20", { d: 2 });
      for (const dx of [-16, 16]) shade(x, P([[dx - 3, -17, 1], [dx + 3, -17, 1], [dx + 3, h, 1], [dx - 3, h, 1]], true), MAT.gold, { ol: 1.4, d: 1 });
      shade(x, P([[-w, -3, 1], [w, -3, 1], [w, 1, 1], [-w, 1, 1]], true), MAT.gold, { ol: 1.2, d: .6 });
      shade(x, P([[-5, -6, 1], [5, -6, 1], [5, 6, 1], [-5, 6, 1]], true), MAT.gold, { ol: 1.4, d: 1 }); x.fillStyle = INK; x.fillRect(-1, -2, 2, 5);
      x.save(); x.globalCompositeOperation = "lighter"; glow(x, 0, -14, 20, "#ffd27a", .45); x.restore();
      break;
    }
    case "camp": {
      for (const s of [-1, 1]) { x.save(); x.rotate(s * .45); shade(x, seg([-24, 14], [24, 14], 8, 8), "#5a3a1e", { d: 1.5 }); x.restore(); }
      for (let i = 0; i < 7; i++) { const a = i * .9; shade(x, ell(Math.cos(a) * 22, 20 + Math.sin(a) * 4, 6, 4), "#6a6460", { ol: 1.2, d: 1 }); }
      x.save(); x.globalCompositeOperation = "lighter"; glow(x, 0, -4, 34, "#ff8a2a", .55);
      const fl = (s, h, col) => { x.fillStyle = col; x.beginPath(); x.moveTo(-s, 12); x.bezierCurveTo(-s * 1.3, -h * .3, -s * .2, -h * .6, 0, -h); x.bezierCurveTo(s * .3, -h * .55, s * 1.3, -h * .3, s, 12); x.closePath(); x.fill(); };
      fl(14, 30, "#ff6a1a"); fl(9, 22, "#ffb03a"); fl(4.5, 13, "#fff0b0"); x.restore();
      break;
    }
    case "shop": {
      shade(x, P([[-16, 18], [-20, 2], [-12, -12], [-4, -16], [4, -16], [12, -12], [20, 2], [16, 18]], true, .5), "#7a5a34", { d: 2.5 });
      x.lineWidth = 3; x.strokeStyle = "#3a2410"; x.beginPath(); x.moveTo(-10, -12); x.quadraticCurveTo(0, -7, 10, -12); x.stroke();
      for (const [dx, dy] of [[-20, 16], [-12, 22], [16, 20], [22, 14]]) { shade(x, ell(dx, dy, 8, 3.6), MAT.gold, { ol: 1.3, d: 1 }); x.fillStyle = rgba("#ffffff", .35); x.fillRect(dx - 3, dy - 1.5, 4, 1); }
      x.save(); x.globalCompositeOperation = "lighter"; glow(x, 0, 6, 26, "#ffd27a", .3); x.restore();
      break;
    }
    case "boss": {
      x.save(); x.globalCompositeOperation = "lighter"; glow(x, 0, 0, 40, "#ff3a1a", .45); x.restore();
      const cr = poly([[-24, 14], [-26, -12], [-14, 0], [-8, -20], [0, -4], [8, -20], [14, 0], [26, -12], [24, 14]]);
      shade(x, cr, MAT.gold, { grad: metalGrad(x, MAT.gold, -24, -20, 24, 14), d: 2.5 });
      shade(x, P([[-25, 10, 1], [25, 10, 1], [25, 18, 1], [-25, 18, 1]], true), dk(MAT.gold, .1), { ol: 1.6, d: 1 });
      for (const [dx, col] of [[-14, "#c02a3a"], [0, "#2a8ad0"], [14, "#c02a3a"]]) shade(x, circ(dx, 14, 3.2), col, { ol: 1, hi: .7 });
      for (const dx of [-26, -8, 8, 26]) shade(x, circ(dx * .96, dx === -26 || dx === 26 ? -12 : -20, 2.6), "#f0e8d0", { ol: 1 });
      break;
    }
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
  return TOKEN_ART[tk] = cv.toDataURL();
}
