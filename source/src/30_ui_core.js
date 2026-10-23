/* ═══════════════════════ Interface : écrans, scène animée, fenêtres ═══════════════════════ */
const $ = s => document.querySelector(s);
const UI = { screen: null, arg: null, sel: {} };
const SC = { cv: null, x: null, w: 0, h: 0, dpr: 1, t: 0, last: 0, draw: null, click: null, amb: null, ambKind: null, bg: null };
const ACT = {}; // actions déclenchées par data-a

function sceneInit() {
  SC.cv = $("#scene"); SC.x = SC.cv.getContext("2d");
  const rs = () => { SC.dpr = Math.min(2, window.devicePixelRatio || 1); SC.w = innerWidth; SC.h = innerHeight; SC.cv.width = Math.round(SC.w * SC.dpr); SC.cv.height = Math.round(SC.h * SC.dpr); SC.amb = null; if (UI.screen && SCREENS[UI.screen] && SCREENS[UI.screen].resize) SCREENS[UI.screen].resize(); };
  addEventListener("resize", rs); rs();
  SC.cv.addEventListener("pointerdown", e => { if (SC.click) SC.click(e.clientX, e.clientY, e); });
  SC.cv.addEventListener("pointermove", e => { if (SC.hover) SC.hover(e.clientX, e.clientY); });
  const loop = now => {
    const dt = Math.min(.05, (now - (SC.last || now)) / 1000); SC.last = now; SC.t += dt;
    const x = SC.x; x.setTransform(SC.dpr, 0, 0, SC.dpr, 0, 0);
    try { if (SC.draw) SC.draw(x, SC.t, dt); else { x.fillStyle = "#07060a"; x.fillRect(0, 0, SC.w, SC.h); } } catch (e) { console.error(e); SC.draw = null; }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
// fond peint + particules (utilisé par la plupart des écrans)
function backdrop(id, opts = {}) {
  return (x, t, dt) => {
    const w = SC.w, h = SC.h;
    const bw = Math.max(w, h * 16 / 9), bh = bw * 9 / 16;
    const bg = paintRegion(id, 1280, 720);
    const ox = (w - bw) / 2 + Math.sin(t * .05) * 8, oy = Math.min(0, (h - bh) * (opts.align || .7));
    x.drawImage(bg, ox, oy, bw, bh * Math.max(1, h / bh));
    if (!SC.amb || SC.ambKind !== id) { SC.amb = makeAmbient(REGION_AMB[id] || "braises", w < 700 ? 28 : 50, w, h); SC.ambKind = id; }
    drawAmbient(x, SC.amb, t, dt);
    if (opts.dark) { x.fillStyle = rgba("#000000", opts.dark); x.fillRect(0, 0, w, h); }
    if (opts.after) opts.after(x, t, dt);
  };
}
const SCREENS = {};
function go(name, arg) {
  if (UI.screen && SCREENS[UI.screen] && SCREENS[UI.screen].leave) SCREENS[UI.screen].leave();
  UI.screen = name; UI.arg = arg; SC.click = null; SC.hover = null;
  const Sx = SCREENS[name];
  renderHud(); renderNav();
  const v = $("#view"); v.className = Sx.pass ? "pass" : ""; v.scrollTop = 0;
  v.innerHTML = Sx.html ? Sx.html(arg) : "";
  v.classList.add("enter"); setTimeout(() => v.classList.remove("enter"), 700);
  SC.draw = Sx.scene ? Sx.scene(arg) : backdrop("bastion", { dark: .45 });
  if (Sx.mount) Sx.mount(arg);
  renderHud(); renderNav();
}
function refresh() { if (!UI.screen) return; const Sx = SCREENS[UI.screen]; const v = $("#view"), st = v.scrollTop; if (Sx.html) v.innerHTML = Sx.html(UI.arg); if (Sx.mount) Sx.mount(UI.arg); v.scrollTop = st; renderHud(); renderNav(); }
function renderHud() {
  const hd = $("#hud"); const Sx = SCREENS[UI.screen] || {};
  if (!S || Sx.noHud) { hd.innerHTML = ""; hd.style.display = "none"; return; }
  hd.style.display = "";
  const r = (ic, v, c, t) => `<span class="res" title="${t}">${ico(ic, c)}${fmt(v)}</span>`;
  hd.innerHTML = `<span class="title">${Sx.title ? (typeof Sx.title === "function" ? Sx.title() : Sx.title) : "Couronne de Cendres"}</span>` +
    r("coin", S.gold, "#e8c060", "Or") + r("shard", S.shards, "#c090ff", "Éclats de couronne") +
    `<span class="res" title="Ferraille, essences, cendres royales">${ico("iron", "#a8a8a8")}${S.mats.fer}<span class="dim">·</span>${ico("essence", "#7ad0ff")}${S.mats.essence}${S.mats.cendre ? `<span class="dim">·</span>${ico("ember", "#ff8a3a")}${S.mats.cendre}` : ""}</span>`;
}
const NAV = [["bastion", "castle", "Bastion"], ["heroes", "helm", "Héros"], ["expe", "map", "Expédition"], ["codex", "book", "Archives"], ["options", "gear", "Options"]];
function renderNav() {
  const nv = $("#nav"); const Sx = SCREENS[UI.screen] || {};
  if (!S || Sx.noNav) { nv.innerHTML = ""; nv.style.display = "none"; return; }
  nv.style.display = "";
  const badges = navBadges();
  nv.innerHTML = NAV.map(([k, ic, n]) => `<button class="${(Sx.tab || UI.screen) === k ? "on" : ""}" data-go="${k}">${ico(ic)}<span>${n}</span>${badges[k] ? `<span class="badge">${badges[k]}</span>` : ""}</button>`).join("");
}
function navBadges() {
  const b = {};
  if (!S) return b;
  const evo = S.heroes.filter(h => h.lvl >= EVO_LVL && !h.evo).length; if (evo) b.heroes = evo;
  const ct = S.daily.contracts ? S.daily.contracts.filter(c => c.p >= c.goal && !c.claimed).length : 0; if (ct) b.bastion = ct;
  if (S.run) b.expe = "!";
  return b;
}
function toast(msg, kind = "") { const t = document.createElement("div"); t.className = "toast " + kind; t.innerHTML = msg; $("#toasts").appendChild(t); setTimeout(() => t.remove(), 3400); }
function modal(html, o = {}) {
  const m = $("#modal"); m.hidden = false;
  m.innerHTML = `<div class="box panel frame ${o.wide ? "wide" : ""}"><span class="corner c1"></span><span class="corner c2"></span><span class="corner c3"></span><span class="corner c4"></span>${o.close === false ? "" : `<button class="btn ghost sm" data-a="closeModal" style="position:absolute;top:8px;right:8px;z-index:2">${ico("close")}</button>`}${html}</div>`;
  if (o.mount) o.mount(m);
  UI.modalClose = o.onClose || null;
}
function closeModal() { const m = $("#modal"); m.hidden = true; m.innerHTML = ""; const f = UI.modalClose; UI.modalClose = null; if (f) f(); }
ACT.closeModal = closeModal;
function confirmBox(text, yes, o = {}) {
  modal(`<h2>${o.title || "Confirmer"}</h2><p>${text}</p><div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn ghost" data-a="closeModal">Annuler</button><button class="btn main" id="cf-yes">${o.yes || "Oui"}</button></div>`, { mount: m => m.querySelector("#cf-yes").onclick = () => { closeModal(); yes(); } });
}
// délégation des clics
function uiEvents() {
  document.addEventListener("click", e => {
    audioInit();
    const g = e.target.closest("[data-go]"); if (g) { sfx("click"); const k = g.dataset.go; if (k === "expe" && S && S.run) go("map"); else go(k, g.dataset.arg); return; }
    const a = e.target.closest("[data-a]"); if (a) { const f = ACT[a.dataset.a]; if (f) { sfx("click"); f(a.dataset.v, a, e); } }
  });
  document.addEventListener("pointerover", e => { const a = e.target.closest(".btn,.card,.sk"); if (a && a !== UI.lastHover) { UI.lastHover = a; sfx("hover"); } });
  if (HASWIN) setInterval(() => { if (S) save(); }, 15000);
  addEventListener("visibilitychange", () => { if (document.hidden && S) save(); });
  addEventListener("pagehide", () => { if (S) save(); });
}
// portrait d'un héros (canvas) : buste ou corps entier
const PORT_CACHE = {};
function heroCanvas(h, size = 96, full = false) {
  const L = heroLook(h); const key = L.key + size + (full ? "f" : "b");
  let src = PORT_CACHE[key];
  if (!src) {
    const sc = full ? size / 230 : size / 92; const sp = heroSprite(L, {}, 0, sc);
    const cv = mkCanvas(size, full ? Math.round(size * 1.25) : size), x = cv.getContext("2d");
    if (full) x.drawImage(sp, cv.width / 2 - sp.ax, cv.height - 6 - sp.ay);
    else { x.drawImage(sp, cv.width * .42 - sp.ax, -(sp.ay - 202 * sc)); const g = x.createLinearGradient(0, size * .7, 0, size); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,.85)"); x.globalCompositeOperation = "destination-out"; x.fillStyle = g; x.fillRect(0, size * .7, size, size * .3); x.globalCompositeOperation = "source-over"; }
    PORT_CACHE[key] = src = cv;
  }
  const out = document.createElement("canvas"); out.width = src.width; out.height = src.height; out.className = "port"; out.getContext("2d").drawImage(src, 0, 0);
  return out;
}
function canvasSlot(id, w, h) { return `<canvas data-cv="${id}" width="${w}" height="${h}" class="port"></canvas>`; }
// les canvas sont remplis après insertion dans le DOM
function fillCanvases(root, fn) { root.querySelectorAll("canvas[data-cv]").forEach(c => { try { fn(c, c.dataset.cv); } catch (e) { console.error(e); } }); }
function paintHero(c, h, full) { const sz = c.width; const src = heroCanvas(h, sz, full); c.height = src.height; c.getContext("2d").drawImage(src, 0, 0); }
function paintPet(c, id, evo) { const x = c.getContext("2d"); const sp = petSprite(id, { evo }, 0, c.width / 160); x.drawImage(sp, c.width / 2 - sp.ax, c.height - 6 - sp.ay); }
function paintMon(c, key) { const x = c.getContext("2d"); const big = (MONSTERS[key].sz || 1) > 1; const sp = monSprite(key, {}, 0, c.width / (big ? 330 : 250)); x.save(); x.translate(c.width / 2, 0); x.scale(-1, 1); x.drawImage(sp, -sp.ax, c.height - 6 - sp.ay); x.restore(); }
function roleTag(role) { const R = ROLES[role]; return `<span class="tag" style="color:${R.c}">${ico(R.ic, R.c)}${R.n}</span>`; }
function rankPips(use, at) { let s = '<span class="pips" title="Rangs">'; for (let r = 4; r >= 1; r--) s += `<i class="${use && use.includes(r) ? "y" : ""}"></i>`; s += "</span>"; if (at) { s += ' <span class="pips" title="Cibles">'; for (let r = 1; r <= 4; r++) s += `<i class="${at.includes(r) ? "t" : ""}"></i>`; s += "</span>"; } return s; }
// description automatique d'une compétence
function skillText(sk, u) {
  const out = [], t = sk.t || "e";
  const who = { e: "un ennemi", ae: "les ennemis visés", a: "un allié", aa: "tout le groupe", s: "soi-même" }[t] || "";
  if (sk.m) out.push(`Dégâts ${Math.round(sk.m * 100)} %${sk.hits > 1 ? " × " + sk.hits : ""} sur ${who}`);
  if (sk.heal && !sk.healAllies) out.push(`Soigne ${Math.round(sk.heal * 100)} % des PV ${t === "aa" ? "de tout le groupe" : t === "s" ? "de soi" : "d'un allié"}`);
  if (sk.healAllies) out.push(`Soigne le groupe de ${Math.round(sk.heal * 100)} %`);
  if (sk.healSelf) out.push(`Se soigne de ${Math.round(sk.healSelf * 100)} %`);
  if (sk.leech) out.push(`Vol de vie ${Math.round(sk.leech * 100)} %`);
  if (sk.selfDmg) out.push(`Coûte ${Math.round(sk.selfDmg * 100)} % de ses PV`);
  const fx = (arr, pre) => { if (!arr) return; for (const f of arr) { const n = ST_INFO[f.k] ? ST_INFO[f.k].n : f.k; let s = n; if (f.v != null && ["dmgUp", "protUp", "protDn", "shield", "regen"].includes(f.k)) s += ` ${f.v > 0 ? "+" : ""}${Math.round(f.v * 100)} %`; else if (f.v != null && ["spdUp", "spdDn", "dodgeUp", "dodgeDn", "accDn", "accUp", "critUp"].includes(f.k)) s += ` ${f.v}`; if (f.t) s += ` (${f.t} t.)`; if (f.ch != null && f.ch < 1) s += ` ${Math.round(f.ch * 100)} %`; out.push(pre + s); } };
  fx(sk.fx, ""); fx(sk.sfx, "Sur soi : "); fx(sk.afx, "Groupe : "); fx(sk.efx, "Ennemis : ");
  if (sk.cleanse) out.push("Purge les altérations"); if (sk.revive) out.push(`Relève les tombés (${Math.round(sk.revive * 100)} %)`);
  if (sk.guard) out.push(`Protège l'allié ${sk.guard} tours`); if (sk.prov) out.push(`Provoque ${sk.prov} tours`);
  if (sk.mv > 0) out.push(`Avance de ${sk.mv}`); if (sk.mv < 0) out.push(`Recule de ${-sk.mv}`); if (sk.pull) out.push(`Attire de ${sk.pull}`); if (sk.push) out.push(`Repousse de ${sk.push}`);
  if (sk.bonus) { const b = sk.bonus; if (b.tag) out.push(`×${b.x} contre les ${b.tag}s`); if (b.st === "stealth_self") out.push(`×${b.x} si furtif`); else if (b.st) out.push(`×${b.x} si ${ST_INFO[b.st].n.toLowerCase()}`); if (b.low) out.push(`×${b.x} sous ${Math.round(b.low * 100)} % PV`); if (b.selfHit) out.push(`×${b.x} si frappé depuis son dernier tour`); if (b.fallen) out.push(`+${Math.round(b.x * 100)} % par ennemi tué`); }
  if (sk.det) out.push(`Fait exploser les ${ST_INFO[sk.det].n.toLowerCase()}s (×${sk.detX})`);
  if (sk.cr) out.push(`+${sk.cr} % critique`); if (sk.cd) out.push(`Recharge ${sk.cd} t.`); if (sk.morale) out.push(`+${sk.morale} résolution`); if (sk.petStrike) out.push(`Le compagnon frappe ${sk.petStrike > 1 ? sk.petStrike + " fois" : ""}`); if (sk.light) out.push(`+${sk.light} lueur`);
  return out.join(" · ");
}
