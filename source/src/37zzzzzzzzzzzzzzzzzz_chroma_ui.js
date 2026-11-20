/* Tenues = palettes (refonte 20 nov.) : chaque tenue a une couleur principale, une couleur d'accent, une teinte de métal
   et une teinte de cuir/armure sombre. La couleur dominante de l'illustration devient la principale, les autres teintes
   deviennent l'accent (la tenue reste multicolore) ; la peau ne change pas ; les zones sombres sont teintées sans être
   éclaircies (pas de grain ni de halo autour du détourage). Calculé une fois par illustration et par tenue. */
const CHROMA_CACHE = new Map();
function chromaHue(d) { // teinte dominante des pixels saturés (hors peau)
  const H = new Float32Array(36);
  for (let i = 0; i < d.length; i += 16) { if (d[i + 3] < 160) continue;
    const r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), s = mx > 0 ? (mx - mn) / mx : 0;
    if (s < .28 || mx < .12) continue; const dd = mx - mn; let h = mx === r ? ((g - b) / dd) % 6 : mx === g ? (b - r) / dd + 2 : (r - g) / dd + 4; h *= 60; if (h < 0) h += 360;
    if (h > 4 && h < 32 && s < .6 && mx > .35) continue; H[Math.floor(h / 10) % 36] += s * mx; }
  let best = 0; for (let k = 1; k < 36; k++) if (H[k] + H[(k + 35) % 36] + H[(k + 1) % 36] > H[best] + H[(best + 35) % 36] + H[(best + 1) % 36]) best = k;
  return best * 10 + 5;
}
/* Peau protégée (20 nov.) : pixels couleur chair au sens large (y compris visages pâles ou dans l'ombre), gardés s'ils
   forment la tête (haut de la silhouette) ou de petites zones (mains) — jamais une grande surface de cuir brun. */
function chromaSkinMask(d, W, H, nat) {
  const n = W * H, cand = new Uint8Array(n); let y0 = H, y1 = 0, nO = 0;
  for (let p = 0; p < n; p++) { const i = p * 4; if (d[i + 3] < 120) continue; nO++; const y = (p / W) | 0; if (y < y0) y0 = y; if (y > y1) y1 = y;
    const r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), s = mx > 0 ? (mx - mn) / mx : 0;
    if (nat && mx === r && mx > .045 && s > .18 && g >= b) { const hh = 60 * ((g - b) / Math.max(mx - mn, 1e-6)); if (hh > 4 && hh < 42) { cand[p] = 2; continue; } } // torse nu (berserker) : peau et fourrure gardent leur couleur naturelle
    if (mx < .1 || mx !== r || s < .1 || s > .62 || g < b * .92) continue; const h = 60 * ((g - b) / Math.max(mx - mn, 1e-6)); if (h < 2 || h > 42) continue; cand[p] = h > 6 && h < 30 && s > .24 && s < .58 && mx > .3 && g > b * 1.12 ? 2 : 1; }
  // teinte de peau du visage (haut de la silhouette) → toute la peau du corps qui a la même teinte, même dans l'ombre
  { const hy = y0 + (y1 - y0) * .3; let sh = 0, ss = 0, nn = 0;
    for (let p = 0; p < n; p++) { if (cand[p] !== 2 || (p / W | 0) > hy) continue; const i = p * 4, r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b); sh += 60 * ((g - b) / Math.max(mx - mn, 1e-6)); ss += (mx - mn) / mx; nn++; }
    if (nn > 30) { const H0 = sh / nn, S0 = ss / nn;
      for (let p = 0; p < n; p++) { const i = p * 4; if (d[i + 3] < 120 || cand[p] === 2) continue; const r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b); if (mx < .09 || mx !== r || g < b) continue; const sv = (mx - mn) / mx, h = 60 * ((g - b) / Math.max(mx - mn, 1e-6)); if (Math.abs(h - H0) < 8 && Math.abs(sv - S0) < .13) cand[p] = 2; } } }
  const lab = new Int32Array(n), keep = new Uint8Array(n), headY = y0 + (y1 - y0) * .38, small = Math.max(40, nO * .006), st = new Int32Array(n);
  let id = 0;
  for (let p = 0; p < n; p++) { if (!cand[p] || lab[p]) continue; id++; let top = 0, sp = 0, cnt = 0, sy = 0; st[sp++] = p; lab[p] = id; const mem = [];
    while (sp) { const q = st[--sp]; mem.push(q); cnt++; sy += (q / W) | 0; const x = q % W;
      for (const nb of [q - 1, q + 1, q - W, q + W]) { if (nb < 0 || nb >= n || (nb === q - 1 && x === 0) || (nb === q + 1 && x === W - 1)) continue; if (cand[nb] && !lab[nb]) { lab[nb] = id; st[sp++] = nb; } } }
    const all = sy / cnt < headY || cnt < small; for (const q of mem) if (all || cand[q] === 2) keep[q] = 1; }
  // masque élargi et adouci : le visage reste d'un seul tenant (plus de taches sombres entre peau et tenue)
  const R = Math.max(2, Math.round(Math.min(W, H) / 90)), tmp = new Float32Array(n), soft = new Float32Array(n);
  for (let y = 0; y < H; y++) { let acc = 0; for (let x = -R; x < W; x++) { const xa = x + R; if (xa < W) acc += keep[y * W + xa]; if (x - R - 1 >= 0) acc -= keep[y * W + x - R - 1]; if (x >= 0) tmp[y * W + x] = acc; } }
  for (let x = 0; x < W; x++) { let acc = 0; for (let y = -R; y < H; y++) { const ya = y + R; if (ya < H) acc += tmp[ya * W + x]; if (y - R - 1 >= 0) acc -= tmp[(y - R - 1) * W + x]; if (y >= 0) soft[y * W + x] = acc; } }
  const k2 = 1 / ((2 * R + 1) * (2 * R + 1));
  for (let p = 0; p < n; p++) { const v = soft[p] * k2; const y = (p / W) | 0; if (keep[p]) soft[p] = 1; else soft[p] = y < headY ? Math.min(1, v * 2.2) : Math.min(1, v * 1.2); }
  return soft;
  const out = new Float32Array(n); // bord adouci (1 px)
  for (let p = 0; p < n; p++) { if (keep[p]) { out[p] = 1; continue; } const x = p % W; let k = 0; if (x > 0 && keep[p - 1]) k++; if (x < W - 1 && keep[p + 1]) k++; if (p >= W && keep[p - W]) k++; if (p + W < n && keep[p + W]) k++; if (k >= 2) out[p] = .5; }
  return out;
}
function chromaArt(im, name, key) {
  const O = (typeof OUTFITS !== "undefined" ? OUTFITS : []).find(o => o.k === key); if (!O || !O.pal || !im) return im;
  const id = name + "|" + key; if (CHROMA_CACHE.has(id)) return CHROMA_CACHE.get(id);
  const W = im.naturalWidth || im.width, H = im.naturalHeight || im.height; if (!W || !H) return im;
  const c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d"); x.drawImage(im, 0, 0);
  let D; try { D = x.getImageData(0, 0, W, H); } catch (e) { return im; }
  const d = D.data, P = O.pal, dom = chromaHue(d), SK = chromaSkinMask(d, W, H, /berserker/.test(name));
  // illustration sombre (armure noire) : on mesure la clarté pour appliquer un dégradé de couleurs franc (sinon la tenue ne se voit pas)
  let nO = 0, nD = 0; const Lh = new Uint32Array(64);
  for (let i = 0; i < d.length; i += 16) { if (d[i + 3] < 160) continue; nO++; const m = Math.max(d[i], d[i + 1], d[i + 2]); if (m < 60) nD++; Lh[m >> 2]++; }
  let acc = 0, p95 = 255; for (let k = 0; k < 64; k++) { acc += Lh[k]; if (acc >= nO * .95) { p95 = (k + 1) * 4; break; } }
  const darkArt = nO > 0 && nD / nO > .55, vTop = Math.max(.12, p95 / 255);
  const [ph, ps, pv] = P.p, [ah, as, av] = P.a, mc = P.m.map(v => v / 255), ml = Math.max(.05, mc[0] * .3 + mc[1] * .59 + mc[2] * .11), mk = P.mk, [dh, ds, dg] = P.dk, gl = P.glow ? P.glow.map(v => v / 255) : null;
  const hsv = (h, s, v) => { h = ((h % 360) + 360) % 360; const i = Math.floor(h / 60) % 6, f = h / 60 - Math.floor(h / 60), p = v * (1 - s), q = v * (1 - s * f), t = v * (1 - s * (1 - f)); return [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][i]; };
  const adist = (a, b) => { const z = Math.abs(a - b) % 360; return z > 180 ? 360 - z : z; };
  for (let i = 0; i < d.length; i += 4) {
    const al = d[i + 3]; if (al < 8) continue;
    const r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), v = mx, s = mx > 0 ? (mx - mn) / mx : 0, dd = Math.max(mx - mn, 1e-6);
    let h = mx === r ? ((g - b) / dd) % 6 : mx === g ? (b - r) / dd + 2 : (r - g) / dd + 4; h *= 60; if (h < 0) h += 360;
    const lum = r * .3 + g * .59 + b * .11;
    const sk = SK[i >> 2], skin = sk >= .999, gold = h >= 32 && h < 62 && s > .3 && v > .3, grey = s < .25 && v > .24;
    let o = [r, g, b];
    if (skin) { /* peau intacte */ }
    else if (gold || grey) { const t = [0, 1, 2].map(k => Math.min(1, lum * mc[k] / ml)); o = o.map((z, k) => z * (1 - mk) + t[k] * mk); }
    else if (s >= .25 && v > .1) { // tissu, cuir coloré, gemmes : principale si proche de la teinte dominante, sinon accent
      const near = adist(h, dom) < 50, off = ((h - dom + 540) % 360) - 180;
      if (near) { const k2 = Math.max(0, Math.min(1, (.42 - v) / .25)) * .55, hd = ((((ah - ph) % 360) + 540) % 360) - 180; // replis sombres du tissu tirés vers l'accent
        o = hsv(ph + off * .35 + hd * k2, Math.min(1, (ps + (as - ps) * k2) * (.55 + .45 * s)), Math.min(1, v * (pv + (av - pv) * k2))); }
      else o = hsv(ah + off * .15, Math.min(1, as * (.55 + .45 * s)), Math.min(1, v * av));
    } else if (darkArt && v > .015) { // armure noire : dégradé ombre → principale → accent selon la clarté relative (couleurs franches, sans éclaircir le bruit)
      const u = Math.min(1, v / vTop), w = al < 200 ? al / 200 * .9 : .9;
      const c1 = hsv(dh, Math.min(.65, ds + .22), .1 + .14 * u), c2 = hsv(ph, Math.min(.6, ps), .18 + .4 * u * pv), c3 = hsv(ah, Math.min(.58, as), .32 + .52 * u * Math.min(1.2, av));
      const t = u < .55 ? c1.map((z, k) => z + (c2[k] - z) * (u / .55)) : c2.map((z, k) => z + (c3[k] - z) * ((u - .55) / .45));
      o = o.map((z, k) => z * (1 - w) + t[k] * w);
    } else { // ombres et armure sombre : teinte légère, luminosité gardée (gamma doux), jamais sur les bords du détourage
      const w = al < 200 ? 0 : Math.min(1, v * 6), vv = Math.pow(v, dg), q = Math.min(1, Math.max(0, (v - .07) / .22)), qq = q * q * (3 - 2 * q);
      // dégradé : ombres profondes → teinte sombre de la tenue, plaques et reliefs → couleur d'accent (armure bicolore)
      const t = hsv(dh + ((((ah - dh) % 360) + 540) % 360 - 180) * qq, ds + (Math.min(.8, as) - ds) * qq, Math.min(1, vv * (1 + .7 * qq))); o = o.map((z, k) => z * (1 - w) + t[k] * w);
    }
    if (gl && v > .7 && s > .45 && !skin) o = o.map((z, k) => z * .45 + gl[k] * .55 * v);
    if (sk > 0 && sk < 1) o = o.map((z, k) => z * (1 - sk) + [r, g, b][k] * sk);
    d[i] = o[0] * 255; d[i + 1] = o[1] * 255; d[i + 2] = o[2] * 255;
  }
  x.putImageData(D, 0, 0); c.naturalWidth = W; c.naturalHeight = H; CHROMA_CACHE.set(id, c); return c;
}
