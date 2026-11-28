/* ═══════════════════════ Décors ═══════════════════════
   Décors peints uniquement (bg_<région>.webp) ; voile sombre tant que l'image n'est pas chargée. */
const BG_CACHE = {};
function paintRegion(id, w, h) {
  if (id === "bastion2" && !artHas("bg_bastion2")) id = "bastion";
  const key = id + w + "x" + h; if (BG_CACHE[key]) return BG_CACHE[key];
  const A = regionArt(id, w, h); if (A) return BG_CACHE[key] = A;
  const cv = mkCanvas(w, h), x = cv.getContext("2d"); // attente : fond uni (non mis en cache)
  x.fillStyle = lgrad(x, 0, 0, 0, h, [[0, "#0c0a0e"], [.75, "#1a1416"], [1, "#0a0808"]]); x.fillRect(0, 0, w, h);
  return cv;
}
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
