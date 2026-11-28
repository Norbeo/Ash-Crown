// Lame d'ombre (voleur) : teinture réaliste (28 nov. 14 h 31, demande de l'utilisateur).
// Remplace la recoloration : on garde exactement les ombres et lumières de l'illustration,
// on teint seulement les tissus/cuirs avec une couleur sourde ; les noirs restent noirs, le métal garde son acier.
const CHROMA_DYE = /^hero_ombre_/;
function chromaDye(im, name, P) {
  const W = im.naturalWidth || im.width, H = im.naturalHeight || im.height, cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const x = cv.getContext("2d"); x.drawImage(im, 0, 0); const D = x.getImageData(0, 0, W, H), d = D.data, SK = chromaSkinMask(d, W, H, false, name);
  const hsv = (h, s, v) => { h = ((h % 360) + 360) % 360; const i = Math.floor(h / 60) % 6, f = h / 60 - Math.floor(h / 60), p = v * (1 - s), q = v * (1 - s * f), t = v * (1 - s * (1 - f)); return [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][i]; };
  const sm = (a, b, v) => { const t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
  const hue = P.p[0], sat = P.trial ? 0 : Math.min(.42, P.p[1] * .62), vk = P.trial ? .72 : Math.min(1.22, Math.max(.85, P.p[2])), M = P.m || [150, 150, 150], mk = (P.mk || .5) * .35;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 8) continue; const sk = SK[i >> 2]; if (sk > .5) continue;
    const r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), s = mx ? (mx - mn) / mx : 0;
    const metal = (1 - sm(.12, .25, s)) * sm(.38, .55, mx); // reflets clairs et neutres = acier
    // tissu / cuir : on garde la luminosité, couleur sourde, rien sur les noirs profonds
    const v = Math.min(1, mx * vk), se = sat * sm(.05, .2, mx) * (1 - metal);
    const o = hsv(hue, se, v);
    let R = o[0], G = o[1], B = o[2];
    if (metal > 0) { R = R * (1 - metal) + (r * (1 - mk) + M[0] / 255 * mk * mx * 1.3) * metal; G = G * (1 - metal) + (g * (1 - mk) + M[1] / 255 * mk * mx * 1.3) * metal; B = B * (1 - metal) + (b * (1 - mk) + M[2] / 255 * mk * mx * 1.3) * metal; }
    d[i] = Math.min(255, R * 255); d[i + 1] = Math.min(255, G * 255); d[i + 2] = Math.min(255, B * 255);
  }
  x.putImageData(D, 0, 0); return cv;
}
{ const ca = chromaArt; chromaArt = function (im, name, key) {
    if (!key || !CHROMA_DYE.test(name || "")) return ca.apply(this, arguments);
    const O = (typeof OUTFITS !== "undefined" ? OUTFITS : []).find(o => o.k === key); if (!O || !O.pal) return ca.apply(this, arguments);
    const id = "dye|" + name + "|" + key; if (CHROMA_CACHE.has(id)) return CHROMA_CACHE.get(id);
    if (!im || !(im.naturalWidth || im.width)) return im;
    let o = im; try { o = chromaDye(im, name, O.pal); } catch (e) { return ca.apply(this, arguments); } CHROMA_CACHE.set(id, o); return o; }; }
