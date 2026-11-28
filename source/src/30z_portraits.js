// ── Cadrage des portraits (22 nov.) : chaque héros est recadré sur sa propre silhouette
//    – en pied : toute la figure tient dans la vignette (pieds en bas, armes comprises)
//    – en buste : tête et épaules centrées, quelle que soit la largeur de l'arme ou de la cape
function portBox(sp) { // boîte de la silhouette + haut de la tête (première rangée assez large, on ignore la pointe des armes levées)
  if (sp.pb) return sp.pb; const b = spriteBox(sp); if (!b) return null;
  const w = sp.width, d = sp.getContext("2d").getImageData(0, 0, w, sp.height).data, rows = [];
  for (let y = b.y; y < b.y + b.h; y++) { let best = 0, bs = 0, run = 0, rs = 0, n = 0, sx = 0;
    for (let x = b.x; x < b.x + b.w; x++) { if (d[(y * w + x) * 4 + 3] > 40) { if (!run) rs = x; run++; n++; sx += x; if (run > best) { best = run; bs = rs; } } else run = 0; }
    rows.push([best, best ? bs + best / 2 : 0, n, n ? sx / n : 0]); }
  // tête = première zone où une masse pleine (≥ 13 % de la largeur) tient sur plusieurs rangées : on écarte lames, hampes et pointes d'armes
  const thr = Math.max(5, b.w * .13), need = Math.max(3, Math.round(b.h * .045)); let head = 0;
  for (let i = 0; i < rows.length - need; i++) { let ok = true; for (let j = 0; j < need; j++) if (rows[i + j][0] < thr) { ok = false; break; } if (ok) { head = i; break; } }
  const bodyH = b.h - head, hz = rows.slice(head, head + Math.max(4, Math.round(bodyH * .16))); let tn = 0, tx = 0; for (const [n, cx] of hz) { tn += n; tx += n * cx; }
  return sp.pb = { b, headY: b.y + head, bodyH, cx: tn ? tx / tn : b.x + b.w / 2 };
}
heroCanvas = function (h, size = 96, full = false) {
  const L = heroLook(h), key = L.key + size + (full ? "F" : "B"); let src = PORT_CACHE[key];
  if (!src) {
    const sp = heroSprite(L, {}, 0, Math.max(size / 110, .5)), W = size, H = full ? Math.round(size * 1.25) : size, cv = mkCanvas(W, H), x = cv.getContext("2d"), P = !sp.blank && portBox(sp);
    if (P) { x.imageSmoothingQuality = "high"; const { b } = P;
      if (full) { const pad = Math.round(W * .05), s = Math.min((W - pad * 2) / b.w, (H - pad * 2) / b.h), w = b.w * s, hh = b.h * s; x.drawImage(sp, b.x, b.y, b.w, b.h, (W - w) / 2, H - pad - hh, w, hh); }
      else { // buste : de 6 % au-dessus de la tête jusqu'à mi-corps
        const top = P.headY - P.bodyH * .06, span = P.bodyH * .56, s = H / span, sx = P.cx - (W / s) / 2;
        x.drawImage(sp, sx, top, W / s, span, 0, 0, W, H);
        const g = x.createLinearGradient(0, H * .72, 0, H); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,.85)"); x.globalCompositeOperation = "destination-out"; x.fillStyle = g; x.fillRect(0, H * .72, W, H * .28); x.globalCompositeOperation = "source-over"; }
      PORT_CACHE[key] = src = cv;
    } else src = cv; // pas encore chargé : on ne met pas en cache
  }
  const out = document.createElement("canvas"); out.width = src.width; out.height = src.height; out.className = "port"; out.getContext("2d").drawImage(src, 0, 0); return out;
};
