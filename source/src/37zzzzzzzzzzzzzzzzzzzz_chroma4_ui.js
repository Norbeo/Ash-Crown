// Tenues accentuées (28 nov., validé par l'utilisateur) : ménestrel, Lame d'ombre, sorcière des haies.
// Après la recoloration, couleur de la tenue renforcée hors peau et hors reflets métalliques clairs.
const CHROMA_BOOST = /^hero_(menestrel|ombre|sorciere)_/;
// force de l'accentuation par classe (sorcière adoucie le 28 nov. : détails noyés)
const CHROMA_BOOST_K = { sorciere: .4 };
function chromaBoost(im, c, name, P) {
  const W = c.width, H = c.height, cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const x = cv.getContext("2d"); x.drawImage(c, 0, 0); const D = x.getImageData(0, 0, W, H), d = D.data;
  const o0 = document.createElement("canvas"); o0.width = W; o0.height = H; const x0 = o0.getContext("2d"); x0.drawImage(im, 0, 0, W, H);
  const d0 = x0.getImageData(0, 0, W, H).data, SK = chromaSkinMask(d0, W, H, false, name);
  const hsv = (h, s, v) => { h = ((h % 360) + 360) % 360; const i = Math.floor(h / 60) % 6, f = h / 60 - Math.floor(h / 60), p = v * (1 - s), q = v * (1 - s * f), t = v * (1 - s * (1 - f)); return [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][i]; };
  const cm = /^hero_([a-z]+)_/.exec(name), K = cm && CHROMA_BOOST_K[cm[1]] != null ? CHROMA_BOOST_K[cm[1]] : 1;
  const ps = P.p[1], T = P.trial ? null : (ps >= .3 ? P.p : (P.a && P.a[1] >= .25 ? P.a : P.p));
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 8 || SK[i >> 2] > .5) continue;
    const r0 = d0[i] / 255, g0 = d0[i + 1] / 255, b0 = d0[i + 2] / 255, m0 = Math.max(r0, g0, b0), s0 = m0 ? (m0 - Math.min(r0, g0, b0)) / m0 : 0;
    if (s0 < .2 && m0 > .42) continue;
    const r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), s = mx ? (mx - mn) / mx : 0, dd = Math.max(mx - mn, 1e-6);
    let h = mx === r ? ((g - b) / dd) % 6 : mx === g ? (b - r) / dd + 2 : (r - g) / dd + 4; h *= 60; if (h < 0) h += 360;
    let hh = h, ns, nv;
    if (T) { const dh = ((((T[0] - h) % 360) + 540) % 360) - 180; hh = h + dh * .55; ns = Math.min(.9, Math.max(s * 1.5, T[1] * .85)); nv = Math.min(1, mx * 1.22 * (T[2] > 1.2 ? 1.3 : 1) + .03); }
    else { ns = Math.min(.92, s * 1.5); nv = Math.min(1, mx * 1.15); }
    const o = hsv(hh, ns, nv); d[i] = d[i] * (1 - K) + o[0] * 255 * K; d[i + 1] = d[i + 1] * (1 - K) + o[1] * 255 * K; d[i + 2] = d[i + 2] * (1 - K) + o[2] * 255 * K;
  }
  x.putImageData(D, 0, 0); return cv;
}
{ const ca = chromaArt; chromaArt = function (im, name, key) {
    if (!CHROMA_BOOST.test(name || "")) return ca.apply(this, arguments);
    const id = "boost|" + name + "|" + key; if (CHROMA_CACHE.has(id)) return CHROMA_CACHE.get(id);
    const r = ca.apply(this, arguments); if (!r || r === im || !r.getContext) return r;
    const O = (typeof OUTFITS !== "undefined" ? OUTFITS : []).find(o => o.k === key); if (!O || !O.pal) return r;
    let o = r; try { o = chromaBoost(im, r, name, O.pal); } catch (e) { } CHROMA_CACHE.set(id, o); return o; }; }
