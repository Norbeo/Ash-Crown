/* ═══════════════════════ Sprites des personnages ═══════════════════════
   Tout l'affichage passe par les illustrations peintes (17_art_images.js).
   Tant qu'une image n'est pas chargée, on renvoie un sprite vide (jamais d'ancien dessin) ;
   artChanged() vide les caches et l'image apparaît dès son arrivée. */
const STANCE = {
  masse: { aFs: .45, aFe: 1.4, aBs: .85, aBe: .55, wa: 2.75 },
  espadon: { aFs: .55, aFe: 1.2, aBs: .95, aBe: .5, wa: 2.75, twoH: 1 },
  baton: { aFs: .3, aFe: .95, aBs: -.15, aBe: .35, wa: 3.1 },
  faucille: { aFs: .45, aFe: 1.25, aBs: .6, aBe: .95, wa: 2.45 },
  luth: { aFs: .25, aFe: 1.35, aBs: .95, aBe: .75, wa: 1.6 },
  hache: { aFs: .35, aFe: 1.75, aBs: .35, aBe: .55, wa: 2.9 },
  dagues: { aFs: .7, aFe: 1.0, aBs: .55, aBe: 1.25, wa: 1.95, wa2: 2.5 },
  arbalete: { aFs: 1.3, aFe: .25, aBs: 1.15, aBe: .3, wa: 1.57, twoH: 1 },
  grimoire: { aFs: .6, aFe: 1.25, aBs: .7, aBe: .9, wa: 2.2 },
  faux: { aFs: .5, aFe: 1.0, aBs: .9, aBe: .45, wa: 3.0, twoH: 1 },
  marteau: { aFs: .45, aFe: 1.4, aBs: .85, aBe: .55, wa: 2.7 },
  encensoir: { aFs: .1, aFe: .9, aBs: .5, aBe: .8, wa: 2.9 },
  rapiere: { aFs: .75, aFe: .95, aBs: .45, aBe: 1.1, wa: 1.9 },
  hallebarde: { aFs: .5, aFe: 1.0, aBs: .9, aBe: .45, wa: 3.0, twoH: 1 },
  croix: { aFs: .3, aFe: .95, aBs: -.15, aBe: .35, wa: 3.1 },
};
// posture de combat par arme (penché, fente…) : utilisée par heroPoseFor
function heroLook(h) {
  const wt = h.gear && h.gear.wpn ? h.gear.wpn.tier : 1, at = h.gear && h.gear.arm ? h.gear.arm.tier : 1;
  const rar = Math.max(h.gear && h.gear.arm ? h.gear.arm.rar : 0, h.gear && h.gear.wpn ? h.gear.wpn.rar : 0);
  return { cls: h.cls, tier: at, wtier: wt, rar, evo: h.evo, apex: h.lvl >= APEX_LVL && !!h.evo, female: h.female, skin: h.look.skin, hair: h.look.hair, hairCol: h.look.hairCol, beard: h.female ? -1 : h.look.beard, scar: h.look.scar, tint: h.outfit && typeof OUTFITS !== "undefined" ? (OUTFITS.find(o => o.k === h.outfit) || {}).tint || null : null, key: [h.outfit || "", h.cls, at, wt, h.evo, h.female ? 1 : 0, h.look.hair, h.look.beard, h.look.skin, h.look.hairCol, h.lvl >= APEX_LVL ? 1 : 0].join("|") };
}
function rotatedCopy(src, ang, W, H) { W = H = Math.ceil(Math.hypot(src.width, src.height)); const cv = mkCanvas(W, H), x = cv.getContext("2d"); x.translate(W / 2, H / 2); x.rotate(ang); x.drawImage(src, -src.width / 2, -src.height / 2); return cv; }
function blankSprite(w, h, sc) { const cv = mkCanvas(Math.ceil(w * sc), Math.ceil(h * sc)); cv.ax = cv.width / 2; cv.ay = cv.height - 22 * sc; cv.sc = sc; cv.blank = 1; return cv; }
function heroSprite(L, pose = {}, t = 0, sc = 1, o = {}) { return heroImgSprite(L, pose, sc, o) || blankSprite(280, 320, sc); }
function monSprite(key, pose = {}, t = 0, sc = 1, o = {}) { const big = ((MONSTERS[key] || {}).sz || 1) > 1; return monImgSprite(key, pose, sc) || blankSprite(big ? 420 : 300, big ? 420 : 320, sc); }
function petSprite(id, o = {}, t = 0, sc = 1) { return petImgSprite(id, o, sc) || blankSprite(220, 200, sc); }
