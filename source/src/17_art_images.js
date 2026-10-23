/* ═══════════════════════ Illustrations peintes (générées avec Canva) ═══════════════════════
   Les images (assets/*.webp) remplacent le dessin procédural dès qu'elles sont chargées.
   Tant qu'une image manque (hors ligne, chargement en cours, node), le dessin procédural sert de repli. */
const PIC = { v: 0, img: {}, queue: [], busy: 0, done: 0, total: 0, timer: 0 };
// liste des illustrations livrées (complétée par le build : window.ART_LIST)
const ART_SET = new Set(typeof window !== "undefined" && window.ART_LIST ? window.ART_LIST : []);
// images tournées vers la gauche à retourner (héros : face à droite ; monstres : face à droite avant le miroir du combat)
const ART_FLIP = new Set(typeof window !== "undefined" && window.ART_FLIP ? window.ART_FLIP : []);
// part de l'image au-dessus de la tête (bâton, arme levée) : tous les héros ont la même taille de corps
const ART_META = typeof window !== "undefined" && window.ART_META ? window.ART_META : {};
function artHas(n) { return ART_SET.has(n); }
function artImg(n) {
  if (!ART_SET.has(n) || typeof Image === "undefined") return null;
  let e = PIC.img[n];
  if (!e) { e = PIC.img[n] = { ok: 0 }; PIC.queue.unshift(n); artPump(); }
  return e.ok ? e.im : null;
}
function artPump() {
  while (PIC.busy < 6 && PIC.queue.length) {
    const n = PIC.queue.shift(), e = PIC.img[n] || (PIC.img[n] = { ok: 0 });
    if (e.started) continue;
    e.started = 1; PIC.busy++;
    const im = new Image(); im.decoding = "async";
    im.onload = () => { e.im = im; e.ok = 1; PIC.busy--; PIC.done++; artProgress(); artChanged(); artPump(); };
    im.onerror = () => { e.fail = 1; PIC.busy--; PIC.done++; artProgress(); artPump(); };
    im.src = "assets/" + n + ".webp";
  }
}
// précharge tout en tâche de fond (après les images demandées par l'écran courant)
function artPreload() { if (typeof Image === "undefined") return; PIC.total = ART_SET.size; for (const n of [...ART_SET].sort((a, b) => /^(tr|wpn|map)_/.test(b) - /^(tr|wpn|map)_/.test(a))) if (!PIC.img[n]) { PIC.img[n] = { ok: 0 }; PIC.queue.push(n); } artPump(); artProgress(); }
// barre de chargement discrète (premier lancement : ensuite tout vient du cache de l'appli)
function artProgress() {
  if (typeof document === "undefined" || !PIC.total) return;
  const el = document.getElementById("artload"); if (!el) return;
  const k = Math.min(1, PIC.done / PIC.total);
  if (k >= 1) { el.classList.add("done"); return; }
  el.hidden = false; el.firstElementChild.style.width = (k * 100).toFixed(1) + "%"; el.lastElementChild.textContent = "Illustrations " + Math.min(PIC.done, PIC.total) + " / " + PIC.total;
}
const ART_REPAINT = [];
// une image vient d'arriver : on vide les caches de sprites et on repeint les vignettes encore à l'écran
function artChanged() {
  PIC.v++;
  if (PIC.timer) return;
  PIC.timer = setTimeout(() => {
    PIC.timer = 0;
    for (const k in BG_CACHE) delete BG_CACHE[k];
    if (typeof PORT_CACHE !== "undefined") for (const k in PORT_CACHE) delete PORT_CACHE[k];
    if (typeof WALK_CACHE !== "undefined") for (const k in WALK_CACHE) delete WALK_CACHE[k];
    if (typeof CB !== "undefined") { for (const id in CB.vis) if (CB.vis[id]) CB.vis[id].cache = {}; CB.petCache = null; }
    if (typeof ICON_CACHE !== "undefined") for (const k in ICON_CACHE) delete ICON_CACHE[k];
    if (typeof ITEM_WAIT !== "undefined" && ITEM_WAIT.size && typeof document !== "undefined") document.querySelectorAll("span.itw[data-iw]").forEach(sp => {
      const it = ITEM_WAIT.get(sp.dataset.iw); const u = it && itemArt(it); if (u) { sp.outerHTML = `<img class="itimg" src="${u}" alt="">`; ITEM_WAIT.delete(sp.dataset.iw); } });
    for (let i = ART_REPAINT.length - 1; i >= 0; i--) {
      const [root, fn] = ART_REPAINT[i];
      if (!root.isConnected) { ART_REPAINT.splice(i, 1); continue; }
      root.querySelectorAll("canvas[data-cv]").forEach(c => { try { c.getContext("2d").clearRect(0, 0, c.width, c.height); fn(c, c.dataset.cv); } catch (e) { console.error(e); } });
    }
  }, 120);
}
// hauteur (unités de dessin à l'échelle 1) et largeur max des illustrations de monstres
const MON_H = { rat: 90, charognard: 125, loup: 120, araignee: 105, alpha: 165, follet: 105, sangsue: 135, crapaud: 125, oeil: 150, diablotin: 150, gargouille: 165, horreur: 230, golem: 255, hydre: 300, mere_ronces: 340, mere_noyes: 330, ogre: 275, boucher: 245, bourreau: 250, chevalier_os: 240, prieur: 240, chevalier_dechu: 230, docteur: 320, liche: 340, abbe: 340, reine_sabbat: 335, roi: 350, sans_nom: 360, necrophage: 175, pendu: 210, spectre: 215 };
const PET_H = { chauve_souris: 95, feu_follet: 85, corbeau: 95, chouette: 100, vipere: 90, araignee: 80, salamandre: 70, crapaud: 80, chat_noir: 85, renard: 85, griffon: 120, drake: 120, gargouille: 95, ours: 105, sanglier: 100, cerf: 125, loup: 110, molosse: 105 };
// sprite à partir d'une illustration : même convention que les sprites procéduraux (pieds en ax, ay)
// pose : lean (penché, + = vers l'avant), hx/hy (décalage), atk (fente), hurt, agony, glow
function imgSprite(im, o) {
  const sc = o.sc || 1, fh = (o.h || 210) * sc, maxW = (o.maxW || 260) * sc;
  let s = fh / (im.height * (1 - (o.top || 0))); if (im.width * s > maxW) s = maxW / im.width;
  const iw = im.width * s, ih = im.height * s, pad = Math.ceil(Math.max(iw, ih) * .35 + 30 * sc);
  const W = Math.ceil(iw + pad * 2), H = Math.ceil(ih + pad + 24 * sc), cv = mkCanvas(W, H), x = cv.getContext("2d");
  const ax = W / 2, ay = H - 22 * sc, p = o.pose || {};
  // aura d'évolution / d'apogée
  if (o.aura) { const g = x.createRadialGradient(ax, ay - ih * .5, ih * .1, ax, ay - ih * .5, ih * .7); g.addColorStop(0, rgba(o.aura, o.auraA || .32)); g.addColorStop(1, rgba(o.aura, 0)); x.fillStyle = g; x.fillRect(0, 0, W, H); }
  let rot = (p.lean || 0) * .32, dx = (p.hx || 0) * sc, dy = (p.hy || 0) * sc, sy = 1, sx = 1;
  if (p.atk) { rot += .1; dx += 12 * sc; }
  if (p.agony) { rot = .22; dy = 10 * sc; sy = .82; }
  if (p.cast) { dy -= 4 * sc; sx = 1.02; }
  x.save(); x.translate(ax + dx, ay + dy); x.rotate(rot); x.scale(sx * (o.flip ? -1 : 1), sy);
  x.drawImage(im, -iw / 2, -ih, iw, ih);
  x.restore();
  if (o.tint) { x.save(); x.globalCompositeOperation = "source-atop"; x.fillStyle = o.tint; x.fillRect(0, 0, W, H); x.restore(); }
  cv.ax = ax; cv.ay = ay; cv.sc = sc; cv.art = 1; return cv;
}
// couleur d'aura d'une évolution : première voie = teinte de la classe, seconde = contraste froid
function evoAura(L) {
  if (!L.evo) return null;
  const C = CLASSES[L.cls]; const keys = C && C.evos ? Object.keys(C.evos) : [];
  const i = Math.max(0, keys.indexOf(L.evo));
  return i === 0 ? (C.pal.trim || "#e8c060") : (["#8a7ae0", "#5ad0c0", "#e05a5a"][hashStr(L.cls) % 3]);
}
function heroArt(L) { const t = clamp(L.tier || 1, 1, 5); return artImg("hero_" + L.cls + "_t" + t) || artImg("hero_" + L.cls + "_t3"); }
function heroImgSprite(L, pose, sc, o = {}) {
  const im = heroArt(L); if (!im) return null;
  const hurt = pose.lean < -.25 && pose.hx < 0, agony = pose.hy > 15;
  const nm = "hero_" + L.cls + "_t" + clamp(L.tier || 1, 1, 5);
  return imgSprite(im, { sc, h: 182, maxW: 260, top: ART_META[nm] || ART_META["hero_" + L.cls + "_t3"] || 0, flip: ART_FLIP.has("hero_" + L.cls + "_t" + clamp(L.tier || 1, 1, 5)), aura: evoAura(L), auraA: L.apex ? .45 : .28,
    pose: Object.assign({}, pose, { agony, cast: pose.free || pose.aBs > 1.5 }), tint: o.tint || (agony ? "rgba(70,8,8,.38)" : hurt ? "rgba(160,20,20,.16)" : null) });
}
function monImgSprite(key, pose, sc) {
  const M = MONSTERS[key] || {}, n = "mon_" + (M.art || key), im = artImg(n); if (!im) return null;
  const big = (M.sz || 1) > 1, f = pose.fig || {};
  return imgSprite(im, { sc, h: MON_H[M.art || key] || (M.elite ? 225 : 190), maxW: big ? 300 : (M.elite ? 175 : 140), flip: !ART_FLIP.has(n),
    pose: { atk: pose.atk, lean: f.lean, hx: f.hx }, tint: f.lean < 0 ? "rgba(170,20,20,.16)" : null });
}
function petImgSprite(id, o, sc) {
  const n = "pet_" + id + (o.evo ? "_evo" : ""), im = artImg(n) || artImg("pet_" + id); if (!im) return null;
  return imgSprite(im, { sc, h: (PET_H[id] || 100) * (o.evo ? 1.25 : 1), maxW: o.evo ? 150 : 120, flip: ART_FLIP.has(n), pose: { atk: o.atk }, aura: o.evo ? "#e8c070" : null, auraA: .18 });
}
// fond de région peint : recadré en 16/9 (la ligne de sol reste dans le tiers bas)
function regionArt(id, w, h) {
  const im = artImg("bg_" + id); if (!im) return null;
  const cv = mkCanvas(w, h), x = cv.getContext("2d");
  const s = Math.max(w / im.width, h / im.height); x.drawImage(im, (w - im.width * s) / 2, (h - im.height * s) / 2, im.width * s, im.height * s);
  // léger voile sombre pour que l'interface reste lisible
  x.fillStyle = lgrad(x, 0, 0, 0, h, [[0, "rgba(5,4,8,.25)"], [.6, "rgba(5,4,8,0)"], [1, "rgba(5,4,8,.35)"]]); x.fillRect(0, 0, w, h);
  return cv;
}
