/* Capes complètes (26 nov.) : les grandes zones d'un noir plein (fonds de cape, intérieur des pans, anciens trous
   comblés) restaient noires une fois la tenue appliquée → taches. Elles reçoivent maintenant la couleur principale
   de la tenue, assombrie comme une étoffe à l'arrière, avec les plis tirés des nuances d'origine. */
function chromaCape(src, out, key) {
  const O = (typeof OUTFITS !== "undefined" ? OUTFITS : []).find(o => o.k === key); if (!O || !O.pal || !out || out === src) return out;
  const W = out.width, H = out.height, n = W * H; if (!W || !H) return out;
  const c0 = document.createElement("canvas"); c0.width = W; c0.height = H; const x0 = c0.getContext("2d"); x0.drawImage(src, 0, 0, W, H);
  let S0, D; const xo = out.getContext("2d"); try { S0 = x0.getImageData(0, 0, W, H).data; D = xo.getImageData(0, 0, W, H); } catch (e) { return out; }
  const d = D.data, L = new Float32Array(n), K = new Float32Array(n);
  for (let p = 0; p < n; p++) { const i = p * 4; if (S0[i + 3] < 200) continue; const m = Math.max(S0[i], S0[i + 1], S0[i + 2]) / 255; L[p] = m; K[p] = m < .075 ? 1 : m < .12 ? (.12 - m) / .045 : 0; }
  const blur = (A, R) => { const T = new Float32Array(n), Q = new Float32Array(n), k = 1 / ((2 * R + 1) * (2 * R + 1));
    for (let y = 0; y < H; y++) { let s = 0; for (let x = -R; x < W; x++) { if (x + R < W) s += A[y * W + x + R]; if (x - R - 1 >= 0) s -= A[y * W + x - R - 1]; if (x >= 0) T[y * W + x] = s; } }
    for (let x = 0; x < W; x++) { let s = 0; for (let y = -R; y < H; y++) { if (y + R < H) s += T[(y + R) * W + x]; if (y - R - 1 >= 0) s -= T[(y - R - 1) * W + x]; if (y >= 0) Q[y * W + x] = s * k; } } return Q; };
  const RA = Math.max(3, Math.round(Math.min(W, H) / 40)), A = blur(K, RA);           // part de noir autour : grande zone = étoffe
  const Z = new Float32Array(n); for (let p = 0; p < n; p++) { const a = A[p]; Z[p] = K[p] * Math.max(0, Math.min(1, (a - .38) / .25)); }
  const Zs = blur(Z, Math.max(1, RA >> 2)), Lm = blur(L, 1), Lw = blur(L, Math.max(2, RA >> 1));
  const P = O.pal, [ph, ps, pv] = P.p || [0, 0, .5]; let ty = H, by = 0; for (let p = 0; p < n; p++) if (S0[p * 4 + 3] > 200) { const y = (p / W) | 0; if (y < ty) ty = y; if (y > by) by = y; } const hy0 = ty + (by - ty) * .1, hy1 = ty + (by - ty) * .2;
  const hsv = (h, s, v) => { h = ((h % 360) + 360) % 360; const i = Math.floor(h / 60) % 6, f = h / 60 - Math.floor(h / 60), p = v * (1 - s), q = v * (1 - s * f), t = v * (1 - s * (1 - f)); return [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][i]; };
  const base = hsv(ph, Math.min(.7, ps * .8), 1), lb = base[0] * .3 + base[1] * .59 + base[2] * .11 || .3, vk = Math.min(1.3, Math.max(.55, pv));
  for (let p = 0; p < n; p++) { const yy = (p / W) | 0, w = Math.min(.88, Zs[p] * 1.1) * (yy < hy0 ? 0 : yy < hy1 ? (yy - hy0) / (hy1 - hy0) : 1); if (w < .02 || S0[p * 4 + 3] < 8) continue; const i = p * 4, x = p % W, y = (p / W) | 0;
    const fold = .5 + .5 * Math.sin(x / W * 44 + Math.sin(y / H * 9 + x / W * 3) * 2.2), det = Math.min(1, Lm[p] / .075), amb = Math.min(1, Lw[p] / .2);
    const lum = (.05 + .08 * det + .035 * fold + .04 * amb) * vk, f = lum / lb;
    for (let k = 0; k < 3; k++) d[i + k] = d[i + k] * (1 - w) + Math.min(255, base[k] * f * 255) * w; }
  xo.putImageData(D, 0, 0); return out;
}
{ const ca = chromaArt; chromaArt = function (im, name, key) { const id = "cape|" + name + "|" + key;
    if (typeof CHROMA_CACHE !== "undefined" && CHROMA_CACHE.has(id)) return CHROMA_CACHE.get(id);
    const r = ca.apply(this, arguments); if (!r || r === im || !r.getContext || !key || S && S.opts && S.opts.chromaOld) return r;
    const W = im.naturalWidth || im.width; if (!W) return r; let o = r; try { o = chromaCape(im, r, key); } catch (e) { } CHROMA_CACHE.set(id, o); return o; }; }
