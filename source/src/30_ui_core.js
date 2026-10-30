/* ═══════════════════════ Interface : écrans, scène animée, fenêtres ═══════════════════════ */
const $ = s => document.querySelector(s);
const UI = { screen: null, arg: null, sel: {}, hubOpen: (() => { try { return !!localStorage.getItem("cc-hubOpen"); } catch (e) { return false; } })() };
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
  const RES_TIP = { coin: "or", shard: "eclat" }, r = (ic, v, c, t) => `<span class="res" data-tip="${RES_TIP[ic] || ""}">${ico(ic, c)}${fmt(v)}</span>`;
  hd.innerHTML = `<span class="title">${Sx.title ? (typeof Sx.title === "function" ? Sx.title() : Sx.title) : "Couronne de Cendres"}</span>` +
    r("coin", S.gold, "#e8c060", "Or") + r("shard", S.shards, "#c090ff", "Éclats de couronne") +
    `<span class="res"><span data-tip="ferraille">${ico("iron", "#a8a8a8")}${S.mats.fer}</span><span class="dim">·</span><span data-tip="essence">${ico("essence", "#7ad0ff")}${S.mats.essence}</span>${S.mats.cendre ? `<span class="dim">·</span><span data-tip="cendre">${ico("ember", "#ff8a3a")}${S.mats.cendre}</span>` : ""}</span>`;
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
  UI.modalClose = o.onClose || null; UI.modalOut = o.close === false ? o.outside || null : closeModal; // un clic à côté de la fenêtre la ferme
}
// fenêtre ouverte depuis un bâtiment (inventaire de la forge, fiche à la taverne…) : en la fermant, on revient au bâtiment
function bldBack() { const m = $("#modal"); if (!m || m.hidden || !UI.bldOpen) return null; const k = UI.bldOpen, t = UI.bldTab; return () => setTimeout(() => { if ($("#modal").hidden && UI.screen === "bastion") openBuilding(k, t); }, 0); }
function closeModal() { const m = $("#modal"); m.hidden = true; m.innerHTML = ""; const f = UI.modalClose; UI.modalClose = null; if (f) f(); }
ACT.closeModal = closeModal;
function confirmBox(text, yes, o = {}) {
  modal(`<h2>${o.title || "Confirmer"}</h2><p>${text}</p><div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn ghost" data-a="closeModal">Annuler</button><button class="btn main" id="cf-yes">${o.yes || "Oui"}</button></div>`, { mount: m => m.querySelector("#cf-yes").onclick = () => { closeModal(); yes(); } });
}
// délégation des clics
function uiEvents() {
  document.addEventListener("click", e => {
    audioInit();
    if (e.target.id === "modal" && UI.modalOut) { UI.modalOut(); return; }
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
function fillCanvases(root, fn) { const r = ART_REPAINT.find(e => e[0] === root); if (r) r[1] = fn; else ART_REPAINT.push([root, fn]); root.querySelectorAll("canvas[data-cv]").forEach(c => { try { fn(c, c.dataset.cv); } catch (e) { console.error(e); } }); }
function paintHero(c, h, full) { const sz = c.width; const src = heroCanvas(h, sz, full); c.height = src.height; c.getContext("2d").drawImage(src, 0, 0); }
// cadre d'une vignette : le sprite est recadré sur sa partie visible puis ajusté pour tenir entièrement (pieds en bas)
function spriteBox(sp) {
  if (sp.bb) return sp.bb; const w = sp.width, h = sp.height, d = sp.getContext("2d").getImageData(0, 0, w, h).data; let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) if (d[(y * w + x) * 4 + 3] > 20) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return sp.bb = x1 < 0 ? null : { x: x0, y: y0, w: x1 - x0 + 2, h: y1 - y0 + 2 };
}
function fitSprite(c, sp, mirror) {
  const b = spriteBox(sp); if (!b) return; const x = c.getContext("2d"), pad = 6, s = Math.min((c.width - pad * 2) / b.w, (c.height - pad * 2) / b.h, 1.6);
  const w = b.w * s, h = b.h * s; x.save(); x.imageSmoothingQuality = "high";
  if (mirror) { x.translate(c.width, 0); x.scale(-1, 1); }
  x.drawImage(sp, b.x, b.y, b.w, b.h, (c.width - w) / 2, c.height - pad - h, w, h); x.restore();
}
function paintPet(c, id, evo) { const sp = petSprite(id, { evo }, 0, c.width / 160); if (!sp.blank) fitSprite(c, sp); }
function paintMon(c, key) { const big = (MONSTERS[key].sz || 1) > 1; const sp = monSprite(key, {}, 0, c.width / (big ? 330 : 250)); if (!sp.blank) fitSprite(c, sp, true); }
function roleTag(role) { const R = ROLES[role]; return `<span class="tag" style="color:${R.c}">${ico(R.ic, R.c)}${R.n}</span>`; }
function rankPips(use, at) { let s = '<span class="pips" title="Rangs">'; for (let r = 4; r >= 1; r--) s += `<i class="${use && use.includes(r) ? "y" : ""}"></i>`; s += "</span>"; if (at) { s += ' <span class="pips" title="Cibles">'; for (let r = 1; r <= 4; r++) s += `<i class="${at.includes(r) ? "t" : ""}"></i>`; s += "</span>"; } return s; }
// synergies : actives (dorées) et à portée de main (une classe manque et elle est dans la caserne)
function synergyNeedText(Y) { if (Y.tanks) return Y.tanks + " tanks"; if (Y.roles) return Y.roles.map(r => ROLES[r].n).join(" + "); return Y.need.map(g => g.map(c => CLASSES[c].n).join(" ou ")).join(" + "); }
function synergyHTML(classes, roster) {
  const act = activeSynergies(classes);
  const near = roster ? Object.keys(SYNERGIES).filter(k => !act.includes(k) && SYNERGIES[k].need && SYNERGIES[k].need.filter(g => !g.some(c => classes.includes(c))).length === 1 && SYNERGIES[k].need.some(g => !g.some(c => classes.includes(c)) && g.some(c => roster.includes(c)))).slice(0, 3) : [];
  if (!act.length && !near.length) return "";
  return `<div class="syn">${act.map(k => `<div class="synr on" data-a="synInfo" data-v="${k}">${ico("link", "#e8c878", 14)}<b>${SYNERGIES[k].n}</b><span class="tiny">${gl(SYNERGIES[k].d)}</span></div>`).join("")}${near.map(k => `<div class="synr" data-a="synInfo" data-v="${k}">${ico("link", "#7a6a5a", 14)}<b>${SYNERGIES[k].n}</b><span class="tiny dim">Il manque : ${SYNERGIES[k].need.filter(g => !g.some(c => classes.includes(c))).map(g => g.map(c => CLASSES[c].n).join(" ou ")).join(", ")}</span></div>`).join("")}</div>`;
}
ACT.synInfo = k => { const Y = SYNERGIES[k]; toast(`<b>${Y.n}</b> <span class="tiny dim">(${synergyNeedText(Y)})</span><br><span class="small">${gl(Y.d)}</span>`); };
// description automatique d'une compétence
// valeurs chiffrées d'une compétence pour un héros (ou une unité de combat) : dégâts avant protection, soins
function skillNums(sk, u) {
  if (!u || u.side === "e") return null;
  let lo, hi, hp, hpw, rank = sk.rank || (u.skr && sk.id && u.skr[sk.id]) || 1;
  if (u.dmgLo != null) { lo = u.dmgLo; hi = u.dmgHi; hp = u.hpMax; hpw = u.healPow || 1; }
  else { const st = heroStats(u, S && S.run ? relicHooks(S.run) : {}); lo = st.dmgLo; hi = st.dmgHi; hp = st.hp; hpw = st.healPow || 1; }
  const rk = sk.isUlt ? 1 : 1 + .1 * (rank - 1), m = (sk.m || 0) * rk;
  const team = S && S.run ? runParty().map(h => heroStats(h).hp) : (S ? S.heroes.slice(0, 4).map(h => heroStats(h).hp) : [hp]);
  const avgHp = team.length ? team.reduce((a, b) => a + b, 0) / team.length : hp;
  return { lo: Math.max(1, Math.round(lo * m)), hi: Math.max(1, Math.round(hi * m)), heal: Math.round(avgHp * (sk.heal || 0) * rk * hpw), self: Math.round(hp * (sk.healSelf || 0) * hpw) };
}
function skillText(sk, u) {
  const out = [], t = sk.t || "e", N = skillNums(sk, u);
  const who = { e: "un ennemi", ae: "les ennemis visés", a: "un allié", aa: "tout le groupe", s: "soi-même" }[t] || "";
  if (sk.m) out.push(`Dégâts ${Math.round(sk.m * 100)} %${N ? ` (<b class="num">${N.lo}–${N.hi}</b>)` : ""}${sk.hits > 1 ? " × " + sk.hits : ""} sur ${who}`);
  if (sk.heal && !sk.healAllies) out.push(`Soigne ${Math.round(sk.heal * 100)} % des PV${N && N.heal ? ` (<b class="num heal">≈ ${N.heal} PV</b>)` : ""} ${t === "aa" ? "de tout le groupe" : t === "s" ? "de soi" : "d'un allié"}`);
  if (sk.healAllies) out.push(`Soigne le groupe de ${Math.round(sk.heal * 100)} %${N && N.heal ? ` (<b class="num heal">≈ ${N.heal} PV chacun</b>)` : ""}`);
  if (sk.healSelf) out.push(`Se soigne de ${Math.round(sk.healSelf * 100)} %${N && N.self ? ` (<b class="num heal">${N.self} PV</b>)` : ""}`);
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
  return gl(out.join(" · "));
}
// ── nombres propres : aucun « 2.9999999 » à l'écran (arrondi à l'entier, ou à 1 décimale pour les petits nombres) ──
const NUM_UGLY = /(\d+)[.,](\d{3,})/g;
function cleanNum(s) { return typeof s !== "string" ? s : s.replace(NUM_UGLY, m => { const n = parseFloat(m.replace(",", ".")); const r = Math.abs(n - Math.round(n)) < .05 || n >= 10 ? Math.round(n) : Math.round(n * 10) / 10; return String(r).replace(".", ","); }); }
(function () {
  if (typeof document === "undefined" || typeof MutationObserver === "undefined") return;
  const fix = n => { if (n.nodeType === 3) { if (NUM_UGLY.test(n.data)) { NUM_UGLY.lastIndex = 0; n.data = cleanNum(n.data); } NUM_UGLY.lastIndex = 0; } else if (n.nodeType === 1 && n.tagName !== "SCRIPT" && n.tagName !== "STYLE") { const w = document.createTreeWalker(n, NodeFilter.SHOW_TEXT); let t; while ((t = w.nextNode())) { if (NUM_UGLY.test(t.data)) t.data = cleanNum(t.data); NUM_UGLY.lastIndex = 0; } } };
  const start = () => new MutationObserver(ms => { for (const m of ms) { if (m.type === "characterData") fix(m.target); else m.addedNodes.forEach(fix); } }).observe(document.body, { childList: true, subtree: true, characterData: true });
  if (document.body) start(); else addEventListener("DOMContentLoaded", start);
})();
