/* Tenues = chromas : le tissu (couleurs saturées) prend une nouvelle teinte, le métal (gris, doré) une nouvelle couleur,
   la peau et les ombres restent intactes. Calculé une fois par illustration et par tenue, puis mis en cache. */
const CHROMA_CACHE = new Map();
function chromaArt(im, name, key) {
  const O = (typeof OUTFITS !== "undefined" ? OUTFITS : []).find(o => o.k === key); if (!O || !O.ch || !im) return im;
  const id = name + "|" + key; if (CHROMA_CACHE.has(id)) return CHROMA_CACHE.get(id);
  const W = im.naturalWidth || im.width, H = im.naturalHeight || im.height; if (!W || !H) return im;
  const c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d"); x.drawImage(im, 0, 0);
  let D; try { D = x.getImageData(0, 0, W, H); } catch (e) { return im; }
  const d = D.data, P = O.ch, [ch, cs, cv] = P.cloth, mc = P.metal.map(v => v / 255), ml = mc[0] * .3 + mc[1] * .59 + mc[2] * .11, mk = P.mk, gl = P.glow ? P.glow.map(v => v / 255) : null;
  const hsv = (h, s, v) => { const i = Math.floor(h / 60) % 6, f = h / 60 - Math.floor(h / 60), p = v * (1 - s), q = v * (1 - s * f), t = v * (1 - s * (1 - f)); return [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][i]; };
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 8) continue;
    const r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), v = mx, s = mx > 0 ? (mx - mn) / mx : 0, dd = Math.max(mx - mn, 1e-6);
    let h = mx === r ? ((g - b) / dd) % 6 : mx === g ? (b - r) / dd + 2 : (r - g) / dd + 4; h *= 60; if (h < 0) h += 360;
    const lum = r * .3 + g * .59 + b * .11;
    const skin = h > 4 && h < 32 && s > .22 && s < .6 && v > .35, gold = h >= 32 && h < 60 && s > .3 && v > .35, metal = (s < .25 && v > .22) || gold, cloth = s >= .25 && !skin && !gold && v > .08;
    let o = [r, g, b];
    if (cloth) o = hsv(ch, Math.min(1, cs * (.6 + .4 * s)), Math.min(1, v * cv));
    if (metal) { const t = [0, 1, 2].map(k => Math.min(1, lum * mc[k] / Math.max(ml, 1e-3))); o = o.map((z, k) => z * (1 - mk) + t[k] * mk); }
    if (gl && v > .75 && s > .4) o = o.map((z, k) => z * .4 + gl[k] * .6 * v);
    d[i] = o[0] * 255; d[i + 1] = o[1] * 255; d[i + 2] = o[2] * 255;
  }
  x.putImageData(D, 0, 0); c.naturalWidth = W; c.naturalHeight = H; CHROMA_CACHE.set(id, c); return c;
}
