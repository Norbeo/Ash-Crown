/* Tenues du berserker (21 nov.) : illustration toute en cuir, fourrure et peau brunes — la détection pixel par pixel
   donnait des taches et des trous noirs. Ici : zones lissées (peau = régions entières, jamais des points isolés),
   recoloration qui garde la luminosité d'origine (pas de trou sombre), métal teinté à part. */
const CHROMA_SOFT = /berserker/;
function chromaSoft(im, name, key) {
  const O = OUTFITS.find(o => o.k === key); const W = im.naturalWidth || im.width, H = im.naturalHeight || im.height;
  const c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d"); x.drawImage(im, 0, 0);
  let D; try { D = x.getImageData(0, 0, W, H); } catch (e) { return im; }
  const d = D.data, P = O.pal, n = W * H;
  const sst = (a, b, v) => { const t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
  const hsv = (h, s, v) => { h = ((h % 360) + 360) % 360; const i = Math.floor(h / 60) % 6, f = h / 60 - Math.floor(h / 60), p = v * (1 - s), q = v * (1 - s * f), t = v * (1 - s * (1 - f)); return [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][i]; };
  const blur = (A, R) => { const T = new Float32Array(n), Q = new Float32Array(n), k = 1 / ((2 * R + 1) * (2 * R + 1));
    for (let y = 0; y < H; y++) { let s = 0; for (let xx = -R; xx < W; xx++) { if (xx + R < W) s += A[y * W + xx + R]; if (xx - R - 1 >= 0) s -= A[y * W + xx - R - 1]; if (xx >= 0) T[y * W + xx] = s; } }
    for (let xx = 0; xx < W; xx++) { let s = 0; for (let y = -R; y < H; y++) { if (y + R < H) s += T[(y + R) * W + xx]; if (y - R - 1 >= 0) s -= T[(y - R - 1) * W + xx]; if (y >= 0) Q[y * W + xx] = s * k; } } return Q; };
  // 1 · probabilité de peau (orangé, saturation moyenne, assez clair), lissée sur de larges zones
  const SP = new Float32Array(n), MT = new Float32Array(n); let y0 = H, y1 = 0, x0 = W, x1 = 0;
  for (let p = 0; p < n; p++) { const i = p * 4; if (d[i + 3] < 120) continue; const yy = (p / W) | 0, xx = p % W; if (yy < y0) y0 = yy; if (yy > y1) y1 = yy; if (xx < x0) x0 = xx; if (xx > x1) x1 = xx;
    const r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), s = mx > 0 ? (mx - mn) / mx : 0;
    if (mx === r && g >= b) { const h = 60 * (g - b) / Math.max(mx - mn, 1e-6); SP[p] = sst(.32, .5, mx) * sst(.2, .3, s) * (1 - sst(.62, .75, s)) * sst(3, 9, h) * (1 - sst(30, 38, h)); }
    const h2 = mx === r ? 60 * (((g - b) / Math.max(mx - mn, 1e-6)) % 6) : mx === g ? 60 * ((b - r) / Math.max(mx - mn, 1e-6) + 2) : 60 * ((r - g) / Math.max(mx - mn, 1e-6) + 4);
    MT[p] = Math.max(s < .22 ? sst(.25, .45, mx) : 0, h2 >= 30 && h2 < 62 && s > .3 ? sst(.35, .55, mx) : 0); } // métal clair (acier, bronze, or)
  const R1 = Math.max(3, Math.round(Math.min(W, H) / 45)), SB = blur(SP, R1), hy = y0 + (y1 - y0) * .62;
  const SK = new Float32Array(n);
  const ZS0 = window.ART_SKIN && window.ART_SKIN[name]; if (!ZS0) for (let p = 0; p < n; p++) { const yy = (p / W) | 0; SK[p] = sst(.28, .48, SB[p]) * (yy < hy ? 1 : 1 - sst(hy, hy + (y1 - y0) * .1, yy)); } // zones marquées à la main : elles seules font foi
  const ZS = window.ART_SKIN && window.ART_SKIN[name];
  if (ZS) for (const [cx, cy, rx, ry] of ZS) for (let yy = Math.max(0, (cy - ry) * H | 0); yy <= Math.min(H - 1, (cy + ry) * H | 0); yy++) for (let xx = Math.max(0, (cx - rx) * W | 0); xx <= Math.min(W - 1, (cx + rx) * W | 0); xx++) { const u = (xx / W - cx) / rx, v = (yy / H - cy) / ry, q = u * u + v * v; if (q < 1) SK[yy * W + xx] = Math.max(SK[yy * W + xx], 1 - sst(.7, 1, q)); }
  const SKs = blur(SK, Math.max(1, R1 >> 2)), MB = blur(MT, Math.max(1, R1 >> 3));
  // 2 · recoloration à luminosité gardée : ombres → teinte sombre, tons moyens → principale (cape) / accent (corps), métal → teinte de métal
  const CX = (x0 + x1) / 2, HW = Math.max(1, (x1 - x0) / 2), [ph, ps, pv] = P.p, [ah, as, av] = P.a, [dh, ds] = P.dk, mc = P.m.map(v => v / 255), ml = Math.max(.05, mc[0] * .3 + mc[1] * .59 + mc[2] * .11);
  const lumOf = c3 => c3[0] * .3 + c3[1] * .59 + c3[2] * .11;
  for (let p = 0; p < n; p++) { const i = p * 4, al = d[i + 3]; if (al < 8) continue;
    const r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255, L = r * .3 + g * .59 + b * .11;
    const side = sst(.25, .5, Math.abs(p % W - CX) / HW), lift = 1.12;
    const mainH = ph + ((((ah - ph) % 360) + 540) % 360 - 180) * (1 - side) * .6, mainS = ps + (as - ps) * (1 - side) * .6, mainV = pv + (av - pv) * (1 - side) * .6;
    const dk = sst(.04, .22, L), hh = dh + ((((mainH - dh) % 360) + 540) % 360 - 180) * dk, ss = Math.min(.85, ds + (mainS * 1.05 - ds) * dk);
    let cl = hsv(hh, ss, 1); const lc = lumOf(cl); const tv = Math.min(1, L * lift * (1 + (mainV - 1) * .6)); cl = cl.map(z => Math.min(1, z * tv / Math.max(.05, lc)));
    let mt = [0, 1, 2].map(z => Math.min(1, L * 1.08 * mc[z] / ml)); if (P.goldHi && L > .35) { const gk = sst(.35, .6, L), G = [.96, .73, .22]; mt = mt.map((z, k) => z * (1 - gk) + G[k] * L * 1.35 * gk); }
    const mk = MB[p] * (P.mk || .55) * 1.2, w = .9;
    let o = cl.map((z, k) => z * (1 - mk) + mt[k] * mk); o = o.map((z, k) => [r, g, b][k] * (1 - w) + z * w);
    const sk = Math.min(1, SKs[p]); o = o.map((z, k) => z * (1 - sk) + [r, g, b][k] * sk);
    d[i] = o[0] * 255; d[i + 1] = o[1] * 255; d[i + 2] = o[2] * 255; }
  x.putImageData(D, 0, 0); c.naturalWidth = W; c.naturalHeight = H; return c;
}
{ const ca0 = chromaArt; chromaArt = function (im, name, key) {
    if (!im || !CHROMA_SOFT.test(name || "") || S && S.opts && S.opts.chromaOld) return ca0.apply(this, arguments);
    const O = (typeof OUTFITS !== "undefined" ? OUTFITS : []).find(o => o.k === key); if (!O || !O.pal) return im;
    const id = "soft|" + name + "|" + key; if (CHROMA_CACHE.has(id)) return CHROMA_CACHE.get(id);
    const W = im.naturalWidth || im.width; if (!W) return im; const c = chromaSoft(im, name, key); CHROMA_CACHE.set(id, c); return c; }; }
