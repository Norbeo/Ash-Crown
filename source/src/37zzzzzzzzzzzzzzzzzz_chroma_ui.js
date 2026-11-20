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
/* Refonte 20 nov. (2) : tenues pluricolores. L'illustration est découpée en grandes zones (regroupement des couleurs,
   de la clarté et de la position : cape, plastron, ceinture, bottes…) et chaque zone reçoit une couleur différente de la
   palette de la tenue (4 couleurs + métal). La peau reste intacte ; le métal clair prend la teinte de métal de la tenue. */
const CHROMA_COLS = { // 4 couleurs franchement différentes par tenue (principale, contraste, neutre, touche vive)
  deuil: [[115, .62, .42], [28, .62, .4], [45, .2, .68], [355, .6, .38]],
  sang: [[356, .82, .42], [44, .72, .58], [0, 0, .16], [40, .1, .74]],
  nuit: [[222, .72, .4], [210, .08, .68], [275, .55, .4], [44, .55, .55]],
  givre: [[198, .55, .6], [210, .05, .84], [265, .4, .52], [220, .5, .3]],
  cendre: [[20, .85, .52], [0, 0, .18], [350, .72, .38], [45, .78, .6]],
  peste: [[80, .62, .42], [290, .45, .38], [45, .2, .64], [0, 0, .16]],
  ivoire: [[40, .1, .82], [44, .65, .58], [205, .42, .55], [350, .55, .4]],
  emeraude: [[150, .72, .42], [45, .78, .6], [0, 0, .16], [50, .08, .8]],
  maitre: [[280, .68, .42], [45, .75, .6], [40, .05, .84], [350, .7, .38]],
  epreuve: [[0, 0, .14], [44, .82, .62], [355, .7, .34], [40, .1, .7]]
};
function chromaZones(d, W, H) { // grandes zones de couleur : regroupement (k-moyennes) sur une grille réduite, puis lissage
  const cs = Math.max(3, Math.round(Math.max(W, H) / 160)), gw = Math.ceil(W / cs), gh = Math.ceil(H / cs), n = gw * gh;
  const F = new Float32Array(n * 5), ok = new Uint8Array(n), sk = new Float32Array(n);
  for (let gy = 0; gy < gh; gy++) for (let gx = 0; gx < gw; gx++) {
    let r = 0, g = 0, b = 0, a = 0, c = 0, ns = 0;
    for (let y = gy * cs; y < Math.min(H, gy * cs + cs); y += 2) for (let x = gx * cs; x < Math.min(W, gx * cs + cs); x += 2) { const i = (y * W + x) * 4; c++; if (d[i + 3] < 160) continue; a++; r += d[i]; g += d[i + 1]; b += d[i + 2]; if (chromaSkin(d[i], d[i + 1], d[i + 2])) ns++; }
    const k = gy * gw + gx; if (a < c * .5) continue; ok[k] = 1; r /= a * 255; g /= a * 255; b /= a * 255; sk[k] = ns / a;
    const L = r * .3 + g * .59 + b * .11, nrm = Math.max(.06, L);
    F[k * 5] = L * 1.4; F[k * 5 + 1] = (r - g) / nrm * .9; F[k * 5 + 2] = ((r + g) / 2 - b) / nrm * .9; F[k * 5 + 3] = gx / gw * .15; F[k * 5 + 4] = gy / gh * .2;
  }
  const idx = []; for (let k = 0; k < n; k++) if (ok[k] && sk[k] < .5) idx.push(k);
  let K = 5; const Z = new Int8Array(n).fill(-1); if (idx.length < K * 3) return null;
  idx.sort((p, q) => F[p * 5] - F[q * 5] || F[p * 5 + 4] - F[q * 5 + 4]);
  const C = []; for (let j = 0; j < K; j++) { const k = idx[Math.floor((j + .5) / K * idx.length)]; C.push(Array.from(F.subarray(k * 5, k * 5 + 5))); }
  for (let it = 0; it < 14; it++) {
    const S = C.map(() => [0, 0, 0, 0, 0, 0]);
    for (const k of idx) { let bj = 0, bd = 1e9; for (let j = 0; j < K; j++) { let dd = 0; for (let q = 0; q < 5; q++) { const z = F[k * 5 + q] - C[j][q]; dd += z * z; } if (dd < bd) { bd = dd; bj = j; } } Z[k] = bj; const s2 = S[bj]; for (let q = 0; q < 5; q++) s2[q] += F[k * 5 + q]; s2[5]++; }
    S.forEach((s2, j) => { if (s2[5]) for (let q = 0; q < 5; q++) C[j][q] = s2[q] / s2[5]; });
  }
  // zone trop grande (armure uniforme) : coupée selon la position (cape, buste, jambes…) pour garder plusieurs couleurs
  for (let sp = 0; sp < 3; sp++) { const cn = C.map(() => 0); for (const k of idx) cn[Z[k]]++; const big = cn.indexOf(Math.max(...cn)); if (cn[big] < idx.length * .34) break;
    const mem = idx.filter(k => Z[k] === big), G2 = k => [(k % gw) / gw, Math.floor(k / gw) / gh * 1.3, F[k * 5] * .6];
    let A = G2(mem[Math.floor(mem.length * .2)]), Bc = G2(mem[Math.floor(mem.length * .8)]); { const ys = mem.map(k => Math.floor(k / gw)).sort((p, q) => p - q); const ya = ys[Math.floor(ys.length * .25)], yb = ys[Math.floor(ys.length * .75)]; A = [.5, ya / gh * 1.3, .1]; Bc = [.5, yb / gh * 1.3, .1]; }
    const nj = C.length; let lab = new Uint8Array(mem.length);
    for (let it = 0; it < 10; it++) { const sa = [0, 0, 0, 0], sb = [0, 0, 0, 0]; mem.forEach((k, m) => { const g = G2(k); const da = (g[0] - A[0]) ** 2 + (g[1] - A[1]) ** 2 + (g[2] - A[2]) ** 2, db = (g[0] - Bc[0]) ** 2 + (g[1] - Bc[1]) ** 2 + (g[2] - Bc[2]) ** 2; lab[m] = db < da ? 1 : 0; const t = lab[m] ? sb : sa; t[0] += g[0]; t[1] += g[1]; t[2] += g[2]; t[3]++; });
      if (sa[3]) A = sa.slice(0, 3).map(v => v / sa[3]); if (sb[3]) Bc = sb.slice(0, 3).map(v => v / sb[3]); }
    const cb = [0, 0, 0, 0, 0]; let nb = 0; mem.forEach((k, m) => { if (lab[m]) { Z[k] = nj; nb++; for (let q = 0; q < 5; q++) cb[q] += F[k * 5 + q]; } });
    if (!nb) break; C.push(cb.map(v => v / nb)); const ca = [0, 0, 0, 0, 0]; let na = 0; mem.forEach((k, m) => { if (!lab[m]) { na++; for (let q = 0; q < 5; q++) ca[q] += F[k * 5 + q]; } }); if (na) C[big] = ca.map(v => v / na); }
  K = C.length;
  const cnt = new Array(K).fill(0); for (const k of idx) cnt[Z[k]]++;
  const order = [...Array(K).keys()].sort((p, q) => cnt[q] - cnt[p]); const rank = []; order.forEach((j, r) => rank[j] = r);
  // appartenance douce (lissée) par zone ; cellules de peau ou vides : prises du voisinage
  let M = new Float32Array(n * K); for (const k of idx) M[k * K + rank[Z[k]]] = 1;
  for (let pass = 0; pass < 1; pass++) { const N = new Float32Array(n * K);
    for (let gy = 0; gy < gh; gy++) for (let gx = 0; gx < gw; gx++) { const k = gy * gw + gx;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const yy = gy + dy, xx = gx + dx; if (yy < 0 || xx < 0 || yy >= gh || xx >= gw) continue; const kk = yy * gw + xx, wt = dx || dy ? 1 : 2; for (let j = 0; j < K; j++) N[k * K + j] += M[kk * K + j] * wt; } }
    for (let k = 0; k < n; k++) { let t = 0; for (let j = 0; j < K; j++) t += N[k * K + j]; if (t > 0) for (let j = 0; j < K; j++) N[k * K + j] /= t; } M = N; }
  // clarté moyenne de chaque zone (pour ramener chaque zone à la clarté de sa couleur cible)
  const Lm = new Array(K).fill(0), Ln = new Array(K).fill(0); for (const k of idx) { const r = rank[Z[k]]; Lm[r] += F[k * 5] / 1.4; Ln[r]++; }
  return { cs, gw, gh, K, M, C: order.map(j => C[j]), Lm: Lm.map((v, j) => Ln[j] ? v / Ln[j] : .2) };
}
function chromaSkin(R, G, B) { const r = R / 255, g = G / 255, b = B / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), s = mx > 0 ? (mx - mn) / mx : 0; if (mx !== r || s < .22 || s > .6 || mx < .35) return false; const h = 60 * ((g - b) / Math.max(mx - mn, 1e-6)); return h > 4 && h < 32; }
function chromaArt(im, name, key) {
  const O = (typeof OUTFITS !== "undefined" ? OUTFITS : []).find(o => o.k === key); if (!O || !O.pal || !im) return im;
  const id = name + "|" + key; if (CHROMA_CACHE.has(id)) return CHROMA_CACHE.get(id);
  const W = im.naturalWidth || im.width, H = im.naturalHeight || im.height; if (!W || !H) return im;
  const c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d"); x.drawImage(im, 0, 0);
  let D; try { D = x.getImageData(0, 0, W, H); } catch (e) { return im; }
  const d = D.data, P = O.pal, cols = CHROMA_COLS[key] || [P.p, P.a, P.dk, P.a], Zn = chromaZones(d, W, H);
  if (!Zn) { CHROMA_CACHE.set(id, im); return im; }
  const { cs, gw, gh, K, M, C, Lm } = Zn, mc = P.m.map(v => v / 255), ml = Math.max(.05, mc[0] * .3 + mc[1] * .59 + mc[2] * .11), gl = P.glow ? P.glow.map(v => v / 255) : null;
  const hsv = (h, s, v) => { h = ((h % 360) + 360) % 360; const i = Math.floor(h / 60) % 6, f = h / 60 - Math.floor(h / 60), p = v * (1 - s), q = v * (1 - s * f), t = v * (1 - s * (1 - f)); return [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][i]; };
  // zone j → couleur cols[j % 4] (la 5e zone reprend la 1re avec une teinte décalée)
  const T = []; for (let j = 0; j < K; j++) { const cc = cols[j % cols.length]; T.push([cc[0] + (j >= cols.length ? 18 : 0), cc[1], cc[2]]); }
  const gain = T.map((t, j) => Math.min(2.4, Math.max(.6, t[2] * .82 / Math.max(.03, Lm[j]))));
  const w = new Float32Array(K);
  for (let y = 0; y < H; y++) { const fy = Math.min(gh - 1.001, Math.max(0, y / cs - .5)), y0 = Math.floor(fy), ty = fy - y0;
    for (let xx = 0; xx < W; xx++) { const i = (y * W + xx) * 4, al = d[i + 3]; if (al < 8) continue;
      const R = d[i], G = d[i + 1], B = d[i + 2]; if (chromaSkin(R, G, B)) continue;
      const fx = Math.min(gw - 1.001, Math.max(0, xx / cs - .5)), x0 = Math.floor(fx), tx = fx - x0;
      const k00 = (y0 * gw + x0) * K, k10 = k00 + K, k01 = k00 + gw * K, k11 = k01 + K; let tw = 0;
      const r = R / 255, g = G / 255, b = B / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), s = mx > 0 ? (mx - mn) / mx : 0, L = r * .3 + g * .59 + b * .11;
      // zone du pixel : sa propre couleur (bords nets entre matières) pondérée par la zone lissée du voisinage
      const nr = Math.max(.15, L), f0 = L * 1.4, f1 = (r - g) / nr * .9, f2 = ((r + g) / 2 - b) / nr * .9, f3 = xx / W * .7, f4 = y / H * 1.0;
      for (let j = 0; j < K; j++) { const m = M[k00 + j] * (1 - tx) * (1 - ty) + M[k10 + j] * tx * (1 - ty) + M[k01 + j] * (1 - tx) * ty + M[k11 + j] * tx * ty; if (m < .001) { w[j] = 0; continue; }
        const cj = C[j], z0 = f0 - cj[0], z1 = f1 - cj[1], z2 = f2 - cj[2], z3 = f3 - cj[3], z4 = f4 - cj[4];
        w[j] = m; tw += w[j]; }
      if (tw < 1e-6) continue;
      let o0 = 0, o1 = 0, o2 = 0;
      for (let j = 0; j < K; j++) { if (w[j] < .002) continue; const t = T[j];
        const v = Math.min(1, Math.max(Math.pow(L, .92) * gain[j], t[2] * .55 * Math.pow(L / Math.max(.012, Lm[j]), .75))), sat = t[1] * .9 * Math.min(1, .3 + v * 1.4), ww = w[j] / tw;
        let q = hsv(t[0], sat, v); // reliefs et liserés de la zone : couleur suivante de la palette (touches de couleur)
        const hl = Math.min(1, Math.max(0, (L / Math.max(.03, Lm[j]) - 1.25) / .7)) * .8;
        if (hl > 0) { const t2 = T[(j + 1) % K], q2 = hsv(t2[0], t2[1] * .85 * Math.min(1, .3 + v * 1.4), Math.min(1, v * 1.08)); q = q.map((z, n) => z + (q2[n] - z) * hl); }
        o0 += q[0] * ww; o1 += q[1] * ww; o2 += q[2] * ww; }
      let o = [o0, o1, o2];
      // métal clair (gris, doré) : teinte de métal de la tenue, reflets gardés
      if (s < .3 && mx > .42 || (s > .3 && mx > .5 && r >= g && g > b * 1.15 && !(r > g * 1.35))) { const k = Math.min(1, (mx - .35) / .3) * P.mk; const t = [0, 1, 2].map(z => Math.min(1, L * mc[z] / ml)); o = o.map((z, n) => z * (1 - k) + t[n] * k); }
      if (gl && mx > .7 && s > .45) o = o.map((z, n) => z * .45 + gl[n] * .55 * mx);
      const e = al < 200 ? al / 200 : 1; // bords du détourage : couleur adoucie, pas éclaircie
      d[i] = (r * (1 - e) + o[0] * e) * 255; d[i + 1] = (g * (1 - e) + o[1] * e) * 255; d[i + 2] = (b * (1 - e) + o[2] * e) * 255;
    } }
  x.putImageData(D, 0, 0); c.naturalWidth = W; c.naturalHeight = H; CHROMA_CACHE.set(id, c); return c;
}
