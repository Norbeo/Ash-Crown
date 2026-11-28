(function () {
  const mode = location.hash.slice(1) || "heroes";
  const c = document.getElementById("c"), x = c.getContext("2d");
  const errs = []; window.onerror = (m) => errs.push(m);
  try {
  if (mode.startsWith("heroes")) {
    const half = mode === "heroes2" ? 1 : 0;
    const cls = CLASS_IDS.slice(half * 5, half * 5 + 5);
    const W = 170, H = 230, Z = +(new URLSearchParams(location.search).get("z") || 1), only = new URLSearchParams(location.search).get("c"); if (only) cls.splice(0, 9, ...only.split(",")); c.width = W * 5 * Z; c.height = H * cls.length * Z; x.scale(Z, Z);
    const g = x.createLinearGradient(0, 0, 0, c.height); g.addColorStop(0, "#1c1a20"); g.addColorStop(1, "#0c0a0c"); x.fillStyle = g; x.fillRect(0, 0, c.width, c.height);
    cls.forEach((k, r) => {
      for (let t = 1; t <= 5; t++) {
        x.save(); x.translate((t - 1) * W + W / 2, r * H + H - 18);
        x.fillStyle = "rgba(0,0,0,.35)"; x.beginPath(); x.ellipse(0, 0, 40, 8, 0, 0, Math.PI * 2); x.fill();
        x.scale(1 / Z, 1 / Z);
        const cv = heroSprite({ cls: k, tier: t, wtier: t, female: r % 2 === 1, skin: SKINS[(r + t) % 6], hair: (r + t) % 6, hairCol: HAIRCOL[(r * 2 + t) % 8], beard: r % 2 ? -1 : (t % 4) - 1, scar: -1 }, {}, 0, Z * .78);
        x.drawImage(cv, -cv.ax, -cv.ay);
        x.restore();
        x.fillStyle = "#c8b8a0"; x.font = "11px sans-serif"; x.fillText(k + " T" + t, (t - 1) * W + 6, r * H + 14);
      }
    });
  }
  if (mode === "monsters" && typeof drawMonster === "function") {
    const Q = new URLSearchParams(location.search), Z = +(Q.get("z") || 1); let ks = Object.keys(MONSTERS); if (Q.get("c")) ks = Q.get("c").split(","); const cols = Math.min(8, ks.length), W = 190, H = 230; c.width = W * cols * Z; c.height = H * Math.ceil(ks.length / cols) * Z; x.scale(Z, Z);
    x.fillStyle = "#2a2420"; x.fillRect(0, 0, c.width, c.height);
    const g = x.createLinearGradient(0, 0, 0, c.height); g.addColorStop(0, "#1c1a20"); g.addColorStop(1, "#0c0a0c"); x.fillStyle = g; x.fillRect(0, 0, c.width, c.height);
    ks.forEach((k, i) => { const cx = (i % cols) * W + W / 2, cy = Math.floor(i / cols) * H + H - 20; x.save(); x.translate(cx, cy); const sc = ((MONSTERS[k].sz || 1) > 1 ? .5 : .72) * Z; const cv = monSprite(k, {}, 0, sc); x.scale(1 / Z, 1 / Z); x.drawImage(cv, -cv.ax, -cv.ay); x.restore(); x.fillStyle = "#c8b8a0"; x.font = "11px sans-serif"; x.fillText(k, cx - W / 2 + 6, cy - H + 34); });
  }
  if (mode === "pets" && typeof drawPet === "function") {
    const ks = PET_IDS; const cols = 6, W = 180, H = 170; c.width = W * cols; c.height = H * Math.ceil(ks.length * 2 / cols);
    x.fillStyle = "#2a2420"; x.fillRect(0, 0, c.width, c.height);
    let i = 0; for (const k of ks) for (const ev of [0, 1]) { const cx = (i % cols) * W + W / 2, cy = Math.floor(i / cols) * H + H - 20; x.save(); x.translate(cx, cy); const cv = petSprite(k, { evo: ev }, 0, .8); x.drawImage(cv, -cv.ax, -cv.ay); x.restore(); x.fillStyle = "#c8b8a0"; x.font = "11px sans-serif"; x.fillText(k + (ev ? " évo" : ""), cx - W / 2 + 6, cy - H + 34); i++; }
  }
  } catch (e) { errs.push(e.stack); }
  document.title = errs.length ? "ERR " + errs.join(" || ") : "OK";
})();
(function () {
  if (location.hash !== "#bg") return;
  const c = document.getElementById("c"), x = c.getContext("2d");
  const ids = ["bourg", "foret", "catacombes", "marais", "citadelle", "abime", "bastion", "titre"]; const W = 800, H = 450;
  c.width = W * 2; c.height = H * 4;
  try { ids.forEach((id, i) => { const bg = paintRegion(id, W, H); x.drawImage(bg, (i % 2) * W, Math.floor(i / 2) * H); if (id !== "bastion" && id !== "titre") { const hs = ["templier", "berserker", "arbaletriere", "pretresse"]; hs.forEach((k, j) => { const cv = heroSprite({ cls: k, tier: 2 + (i % 3), wtier: 3, skin: SKINS[j], hair: j, hairCol: HAIRCOL[j], beard: j - 1 }, {}, 0, .55); x.drawImage(cv, (i % 2) * W + 330 - j * 85 - cv.ax, Math.floor(i / 2) * H + 400 - cv.ay); }); const R = regionById(id); R.pool.slice(0, 3).forEach((k, j) => { const cv = monSprite(k, {}, 0, .55); x.save(); x.translate((i % 2) * W + 470 + j * 95, Math.floor(i / 2) * H + 400); x.scale(-1, 1); x.drawImage(cv, -cv.ax, -cv.ay); x.restore(); }); } }); document.title = "OK"; } catch (e) { document.title = "ERR " + e.stack; }
})();
