/* ═══════════════════════ Décors peints : régions, Bastion, écran-titre ═══════════════════════ */
const BG_CACHE = {};
function silhouette(x, rng, w, y0, amp, step, col, rough = .5) {
  x.fillStyle = col; x.beginPath(); x.moveTo(0, y0 + 400);
  let yy = y0; for (let xx = 0; xx <= w + step; xx += step) { yy = clamp(yy + (rng() - .5) * amp * rough, y0 - amp, y0 + amp * .4); x.lineTo(xx, yy); }
  x.lineTo(w, y0 + 400); x.closePath(); x.fill();
}
function fogBand(x, w, y, h, col, a) { x.fillStyle = lgrad(x, 0, y - h, 0, y + h, [[0, rgba(col, 0)], [.5, rgba(col, a)], [1, rgba(col, 0)]]); x.fillRect(0, y - h, w, h * 2); }
function moon(x, mx, my, r, col = "#e8e0c8") { glow(x, mx, my, r * 6, col, .18); glow(x, mx, my, r * 2.2, col, .35); x.fillStyle = col; x.beginPath(); x.arc(mx, my, r, 0, 7); x.fill(); x.fillStyle = rgba("#a8a088", .35); for (let i = 0; i < 5; i++) { x.beginPath(); x.arc(mx - r * .3 + (i * 13 % 7) * r * .12, my - r * .2 + (i * 7 % 5) * r * .15, r * (.08 + i * .03), 0, 7); x.fill(); } }
function deadTree(x, rng, bx, by, h, col, lw = 1) {
  const branch = (px, py, a, len, w, d) => { if (d > 5 || len < 4) return; const ex = px + Math.sin(a) * len, ey = py - Math.cos(a) * len; x.strokeStyle = col; x.lineWidth = w; x.lineCap = "round"; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.sin(a + .3) * len * .5, py - Math.cos(a + .3) * len * .5, ex, ey); x.stroke(); const n = d < 2 ? 2 : rng() < .6 ? 2 : 1; for (let i = 0; i < n; i++) branch(ex, ey, a + (rng() - .5) * 1.4 + (i ? .5 : -.5), len * (.6 + rng() * .2), w * .62, d + 1); };
  branch(bx, by, (rng() - .5) * .2, h * .45, h * .07 * lw, 0);
}
function gothicHouse(x, hx, hy, w, h, col, win, rng) {
  x.fillStyle = col; x.beginPath(); x.moveTo(hx, hy); x.lineTo(hx, hy - h); x.lineTo(hx + w * .5, hy - h - w * .7); x.lineTo(hx + w, hy - h); x.lineTo(hx + w, hy); x.fill();
  if (rng() < .5) { x.fillRect(hx + w * .7, hy - h - w * .7, w * .12, w * .5); }
  if (win) for (let i = 0; i < 2; i++) if (rng() < .55) { const wx = hx + w * (.25 + i * .35), wy = hy - h * .65; glow(x, wx + 3, wy + 4, 18, win, .35); x.fillStyle = win; x.fillRect(wx, wy, 6, 9); }
}
function arch(x, ax, ay, w, h, col, th = 14) {
  x.fillStyle = col; x.beginPath(); x.moveTo(ax - th, ay); x.lineTo(ax - th, ay - h); x.quadraticCurveTo(ax + w / 2, ay - h - w * .9, ax + w + th, ay - h); x.lineTo(ax + w + th, ay); x.lineTo(ax + w, ay); x.lineTo(ax + w, ay - h); x.quadraticCurveTo(ax + w / 2, ay - h - w * .65, ax, ay - h); x.lineTo(ax, ay); x.fill();
}
function pillar(x, px, py, w, h, col, hi) { x.fillStyle = lgrad(x, px, 0, px + w, 0, [[0, hi || lt(col, .15)], [.4, col], [1, dk(col, .5)]]); x.fillRect(px, py - h, w, h); x.fillStyle = dk(col, .3); x.fillRect(px - 6, py - h, w + 12, 12); x.fillRect(px - 6, py - 14, w + 12, 14); }
function banner(x, bx, by, w, h, col, t = 0) { x.fillStyle = col; x.beginPath(); x.moveTo(bx, by); x.lineTo(bx + w, by); x.lineTo(bx + w + Math.sin(t) * 2, by + h); x.lineTo(bx + w / 2, by + h - w * .4); x.lineTo(bx + Math.sin(t) * 2, by + h); x.fill(); x.fillStyle = rgba("#000", .3); x.fillRect(bx + w * .7, by, w * .3, h - w * .2); }
function candle(x, cx, cy, s = 1) { x.fillStyle = "#d8ccb0"; x.fillRect(cx - 2 * s, cy - 10 * s, 4 * s, 10 * s); glow(x, cx, cy - 13 * s, 22 * s, "#ffb050", .45); x.fillStyle = "#ffd890"; x.beginPath(); x.ellipse(cx, cy - 13 * s, 1.6 * s, 3.4 * s, 0, 0, 7); x.fill(); }
// décor d'une région : couches lointaine, moyenne, sol
function paintRegion(id, w, h) {
  const key = id + w + "x" + h; if (BG_CACHE[key]) return BG_CACHE[key];
  const A = regionArt(id, w, h); if (A) return BG_CACHE[key] = A;
  if (id === "bastion2") return paintRegion("bastion", w, h);
  const cv = mkCanvas(w, h), x = cv.getContext("2d"), rng = mkRng(hashStr(id) + 7);
  const R = id === "bastion" || id === "titre" ? null : regionById(id) || REGIONS[0];
  const gy = h * .78; // ligne de sol
  const sky = R ? R.sky : ["#0c0a10", "#2a1e24"];
  x.fillStyle = lgrad(x, 0, 0, 0, gy, [[0, dk(sky[0], .3)], [.7, sky[1]], [1, lt(sky[1], .08)]]); x.fillRect(0, 0, w, h);
  // étoiles
  for (let i = 0; i < 90; i++) { x.fillStyle = rgba("#e8e0d0", rng() * .5); x.fillRect(rng() * w, rng() * gy * .6, 1.2, 1.2); }
  const fog = R ? R.fog : "#8a6a7a";
  switch (id) {
    case "bourg": {
      moon(x, w * .78, h * .2, h * .07, "#e0e0b0");
      silhouette(x, rng, w, gy * .62, 40, 30, "#1e2218");
      for (let i = 0; i < 9; i++) { const hx = i * w / 8 - 40 + rng() * 30, hw = 50 + rng() * 40; gothicHouse(x, hx, gy * .9, hw, 50 + rng() * 60, "#141610", "#e0c060", rng); }
      fogBand(x, w, gy * .86, 50, fog, .22);
      // gibet
      x.strokeStyle = "#0e0e0a"; x.lineWidth = 7; x.beginPath(); x.moveTo(w * .14, gy); x.lineTo(w * .14, gy - h * .42); x.lineTo(w * .24, gy - h * .42); x.stroke(); x.lineWidth = 2; x.beginPath(); x.moveTo(w * .22, gy - h * .42); x.lineTo(w * .22, gy - h * .32); x.stroke();
      x.fillStyle = "#0e0e0a"; x.beginPath(); x.ellipse(w * .22, gy - h * .29, 6, 14, 0, 0, 7); x.fill();
      deadTree(x, rng, w * .9, gy + 4, h * .5, "#0c0c08");
      for (let i = 0; i < 3; i++) { const cx = w * (.35 + i * .15); x.fillStyle = "#121410"; x.fillRect(cx, gy - 22, 4, 22); x.fillRect(cx - 8, gy - 16, 20, 4); }
      break;
    }
    case "foret": {
      moon(x, w * .2, h * .16, h * .05, "#c8e0c8");
      for (let l = 0; l < 3; l++) { const c = mixc("#0a120c", fog, .25 - l * .1); for (let i = 0; i < 9; i++) { const tx0 = rng() * w, th = h * (.5 + rng() * .4) * (1 - l * .1); x.fillStyle = c; x.fillRect(tx0 - 6 - l * 3, gy - th, 12 + l * 6, th); deadTree(x, rng, tx0, gy - th * .55, th * .7, c, 1 + l * .3); if (rng() < .35) { const bx = tx0 + 20 + rng() * 20, by = gy - th * .6; x.strokeStyle = c; x.lineWidth = 1.5; x.beginPath(); x.moveTo(bx, by - 40); x.lineTo(bx, by); x.stroke(); x.fillStyle = c; x.beginPath(); x.ellipse(bx, by + 14, 5, 15, 0, 0, 7); x.fill(); } } fogBand(x, w, gy * (.7 + l * .1), 60, fog, .14); }
      break;
    }
    case "catacombes": {
      x.fillStyle = lgrad(x, 0, 0, 0, gy, [[0, "#08080c"], [1, "#1e1e28"]]); x.fillRect(0, 0, w, gy);
      for (let r = 0; r < 14; r++) for (let c = 0; c < 26; c++) { x.fillStyle = rgba(rng() < .5 ? "#2a2a34" : "#24242c", .9); x.fillRect(c * w / 24 + (r % 2) * 20 - 20, r * 26, w / 24 - 3, 23); }
      for (let i = 0; i < 40; i++) { const sx = rng() * w, sy = rng() * gy * .8; shade(x, skullPath(sx, sy, 4 + rng() * 2), "#3a3830", { ol: 1, d: 1.5, hatch: 0 }); dot(x, sx - 1.5, sy - 1, 1.3, INK); dot(x, sx + 2, sy - 1, 1.3, INK); }
      for (let i = 0; i < 5; i++) { arch(x, i * w / 4 - 60, gy, w / 6, h * .45, "#121218", 22); pillar(x, i * w / 4 - 82, gy, 26, h * .62, "#1a1a22"); }
      for (let i = 0; i < 7; i++) candle(x, 30 + rng() * (w - 60), gy - 4 - rng() * 6, 1.2);
      fogBand(x, w, gy * .9, 40, fog, .18);
      break;
    }
    case "marais": {
      moon(x, w * .62, h * .18, h * .06, "#c0e0e0");
      silhouette(x, rng, w, gy * .7, 30, 40, "#0c1818");
      for (let i = 0; i < 8; i++) { const tx0 = rng() * w; deadTree(x, rng, tx0, gy, h * (.3 + rng() * .3), "#0a1414", 1.3); }
      x.fillStyle = lgrad(x, 0, gy - 30, 0, h, [[0, "#0e2224"], [1, "#04080a"]]); x.fillRect(0, gy - 20, w, h);
      for (let i = 0; i < 30; i++) { x.strokeStyle = rgba("#6a9a9a", .15); x.lineWidth = 1; const yy = gy - 10 + rng() * (h - gy); x.beginPath(); x.moveTo(rng() * w, yy); x.lineTo(rng() * w, yy); x.stroke(); }
      glow(x, w * .62, gy + 20, 80, "#a0d0d0", .1);
      for (let i = 0; i < 6; i++) glow(x, rng() * w, gy - 40 - rng() * 80, 14, "#5ac0ff", .5);
      fogBand(x, w, gy * .92, 50, fog, .25);
      break;
    }
    case "citadelle": {
      x.fillStyle = lgrad(x, 0, 0, 0, gy, [[0, "#0c0606"], [1, "#3a140a"]]); x.fillRect(0, 0, w, gy);
      for (let i = 0; i < 6; i++) { const px = i * w / 5 - 30; pillar(x, px, gy, 44, h * .8, "#1e1210", "#4a2a1a"); banner(x, px + 52, h * .12, 36, h * .3, "#4a0e08"); }
      for (let i = 0; i < 4; i++) arch(x, i * w / 3 + 30, gy, w / 5, h * .4, "#140a08", 18);
      glow(x, w * .5, gy, w * .5, "#ff5a1a", .22);
      for (let i = 0; i < 6; i++) { const bx = 40 + i * (w - 80) / 5; glow(x, bx, gy - h * .45, 30, "#ff8a3a", .45); x.fillStyle = "#2a1a10"; x.fillRect(bx - 3, gy - h * .45, 6, 18); }
      fogBand(x, w, gy * .9, 40, fog, .18);
      break;
    }
    case "abime": {
      x.fillStyle = lgrad(x, 0, 0, 0, gy, [[0, "#040208"], [1, "#1e1028"]]); x.fillRect(0, 0, w, gy);
      for (let i = 0; i < 12; i++) { const rx = rng() * w, ry = rng() * gy * .7, rs = 10 + rng() * 40; x.fillStyle = "#120a18"; x.beginPath(); x.moveTo(rx - rs, ry); x.lineTo(rx - rs * .4, ry - rs * .4); x.lineTo(rx + rs, ry - rs * .2); x.lineTo(rx + rs * .2, ry + rs * 1.2); x.fill(); glow(x, rx, ry, rs * 1.5, "#8a4aff", .08); }
      for (let i = 0; i < 6; i++) { const bx = rng() * w; x.strokeStyle = "#0e0814"; x.lineWidth = 14 - i; x.beginPath(); x.moveTo(bx, gy); x.bezierCurveTo(bx + 40, gy - 80, bx - 50, gy - 160, bx + 20, gy - 220 - rng() * 60); x.stroke(); }
      fogBand(x, w, gy * .85, 70, fog, .2);
      break;
    }
    case "bastion": case "titre": {
      moon(x, w * .8, h * .15, h * .07, "#f0e0c0");
      silhouette(x, rng, w, h * .5, 50, 40, "#120e14");
      // château
      const cx = id === "titre" ? w * .5 : w * .3, base = h * (id === "titre" ? .62 : .5);
      x.fillStyle = "#0a080c";
      for (let i = 0; i < 5; i++) { const tw = 26 + (i % 2) * 14, th = 120 + (i * 37 % 5) * 30, tx0 = cx - 120 + i * 60; x.fillRect(tx0, base - th, tw, th + 300); x.beginPath(); x.moveTo(tx0 - 6, base - th); x.lineTo(tx0 + tw / 2, base - th - 50); x.lineTo(tx0 + tw + 6, base - th); x.fill(); for (let j = 0; j < 3; j++) if (rng() < .6) { glow(x, tx0 + tw / 2, base - th + 30 + j * 30, 12, "#ffb050", .5); x.fillStyle = "#ffc070"; x.fillRect(tx0 + tw / 2 - 2, base - th + 26 + j * 30, 4, 7); x.fillStyle = "#0a080c"; } }
      x.fillRect(cx - 150, base - 60, 300, 400);
      for (let i = 0; i < 15; i++) x.fillRect(cx - 150 + i * 21, base - 72, 12, 12);
      if (id === "titre") { glow(x, cx, base - 200, 160, "#ff6a2a", .25); }
      fogBand(x, w, h * .6, 60, "#6a4a5a", .2);
      break;
    }
  }
  // sol
  if (id !== "marais") {
    x.fillStyle = lgrad(x, 0, gy - 10, 0, h, [[0, R ? mixc("#1a1410", R.fog, .12) : "#1a1410"], [1, "#060404"]]); x.fillRect(0, gy - 8, w, h - gy + 8);
    for (let i = 0; i < 60; i++) { x.fillStyle = rgba("#000", .35); const sx = rng() * w, sy = gy + rng() * (h - gy); x.beginPath(); x.ellipse(sx, sy, 10 + rng() * 30, 2 + rng() * 4, 0, 0, 7); x.fill(); }
    if (id === "catacombes" || id === "citadelle" || id === "bastion") for (let r = 0; r < 6; r++) for (let c = 0; c < 20; c++) { x.strokeStyle = rgba("#000", .45); x.lineWidth = 1.2; x.strokeRect(c * w / 18 + (r % 2) * 30 - 30, gy + r * (h - gy) / 6, w / 18, (h - gy) / 6); }
  }
  // grain et vignette
  const np = noisePattern(x); if (np) { x.fillStyle = np; x.fillRect(0, 0, w, h); }
  const vg = x.createRadialGradient(w / 2, h * .55, h * .2, w / 2, h * .55, Math.max(w, h) * .75); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,.72)"); x.fillStyle = vg; x.fillRect(0, 0, w, h);
  BG_CACHE[key] = cv; return cv;
}
// particules d'ambiance : braises, cendres, lucioles, gouttes
function makeAmbient(kind, n, w, h) { const a = []; for (let i = 0; i < n; i++) a.push({ x: Math.random() * w, y: Math.random() * h, v: .2 + Math.random() * .8, r: .6 + Math.random() * 1.8, p: Math.random() * 6 }); return { kind, a, w, h }; }
function drawAmbient(x, A, t, dt) {
  const col = { braises: "#ff8a3a", cendres: "#b8a8a0", lucioles: "#c8f07a", ames: "#9fe8ff", spores: "#c8e05a", neige: "#e8e8f0" }[A.kind] || "#ff8a3a";
  x.save(); x.globalCompositeOperation = A.kind === "cendres" ? "source-over" : "lighter";
  for (const p of A.a) {
    if (A.kind === "braises" || A.kind === "ames") { p.y -= p.v * dt * 40; p.x += Math.sin(t + p.p) * dt * 12; }
    else if (A.kind === "lucioles" || A.kind === "spores") { p.x += Math.sin(t * .7 + p.p) * dt * 14; p.y += Math.cos(t * .5 + p.p) * dt * 10; }
    else { p.y += p.v * dt * 26; p.x += Math.sin(t * .6 + p.p) * dt * 16; }
    if (p.y < -10) p.y = A.h + 10; if (p.y > A.h + 10) p.y = -10; if (p.x < -10) p.x = A.w + 10; if (p.x > A.w + 10) p.x = -10;
    const fl = .5 + Math.sin(t * 3 + p.p * 5) * .5;
    if (A.kind === "cendres") { x.fillStyle = rgba(col, .35 + fl * .3); x.fillRect(p.x, p.y, p.r * 1.4, p.r * 1.4); }
    else { glow(x, p.x, p.y, p.r * 5, col, .35 * fl + .15); }
  }
  x.restore();
}
const REGION_AMB = { bourg: "spores", foret: "lucioles", catacombes: "ames", marais: "lucioles", citadelle: "braises", abime: "ames", bastion: "braises", titre: "braises" };
