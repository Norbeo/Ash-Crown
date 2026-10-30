/* ═══════════════════════ Combat : scène, animations, commandes ═══════════════════════ */
const CB = { B: null, vis: {}, fx: [], txt: [], proj: [], shake: 0, flash: 0, banner: null, resolve: null, actor: null, sel: null, hoverU: null, speed: 1, auto: false, busy: false, barH: 150, zoom: 0 };
const wait = ms => new Promise(r => setTimeout(r, ms / (CB.speed || 1) / (S.opts.quick || S.opts.fast ? 1.7 : 1)));
const HPOSE = {
  idle: () => ({}),
  windup: st => ({ lean: -.08, aFs: st.aFs - .7, aFe: st.aFe + .5, wa: (st.wa || 2.5) + .6 }),
  strike: st => st.twoH && st.wa < 2 ? { lean: -.05, hx: -5 } : { lean: .32, hx: 8, lFh: .62, lFk: -.3, lBh: -.58, aFs: 1.55, aFe: .2, wa: 1.4 },
  cast: () => ({ aFs: 2.45, aFe: .3, aBs: 2.0, aBe: .5, wa: 3.1, lean: -.1, head: -.2, free: 1 }),
  buff: st => ({ aFs: 1.9, aFe: .9, wa: 3.0, lean: -.05, head: -.15 }),
  hurt: () => ({ lean: -.32, hx: -8, head: -.35, aFs: .1, aFe: .9, lFh: .22, lBh: -.22 }),
  agony: () => ({ lean: .55, hy: 22, lFh: 1.3, lFk: -2.3, lBh: -.2, lBk: -1.6, head: .45, aFs: .4, aFe: .2, aBs: .2, air: 0 }),
};
// silhouette blanche d'un sprite (éclair d'impact), mise en cache sur le sprite
function whiteOf(sp) { if (sp.white) return sp.white; const c = mkCanvas(sp.width, sp.height), x = c.getContext("2d"); x.drawImage(sp, 0, 0); x.globalCompositeOperation = "source-in"; x.fillStyle = "#fff6e8"; x.fillRect(0, 0, c.width, c.height); return sp.white = c; }
function heroPoseFor(u, key) { const C = CLASSES[u.cls]; const st = STANCE[C.wpn] || STANCE.masse; return (HPOSE[key] || HPOSE.idle)(st); }
function unitSprite(u, key) {
  const V = CB.vis[u.uid]; const sc = u.side === "h" && CB.port && CB.hScale ? CB.hScale : CB.port && (u.sz || 1) > 1 ? CB.scale * .74 : CB.scale; // portrait : gardiens réduits pour tenir dans le cadre
  const ck = key + ":" + sc.toFixed(3) + (u.side === "h" ? ":" + V.lookKey : "");
  V.cache = V.cache || {};
  if (V.cache[ck]) return V.cache[ck];
  let cv;
  if (u.side === "h") cv = heroSprite(V.look, heroPoseFor(u, key), 0, sc);
  else { const p = key === "strike" ? { atk: 1 } : key === "hurt" ? { fig: { lean: -.3, hx: -6, head: -.3 } } : {}; cv = monSprite(u.key, p, key === "strike" ? .3 : 0, sc); }
  V.cache[ck] = cv; return cv;
}
// ── disposition ──
function cbLayout() {
  const B = CB.B, W = SC.w, H = SC.h - CB.barH, port = W < SC.h * .85;
  CB.port = port; CB.stageH = H;
  const pos = {};
  if (!port) {
    const mid = W / 2, gap = Math.min(W / 10, H * .27), gy = H * .86;
    CB.scale = Math.min(H * .44 / 200, gap / 84); CB.ground = gy; CB.hScale = null;
    let r = 1; for (const u of B.heroes) { pos[u.uid] = [mid - gap * .85 - gap * (r - 1), gy]; r += 1; }
    r = 1; for (const u of B.enemies) { const s = u.sz || 1; pos[u.uid] = [mid + gap * .85 + gap * (r - 1 + (s - 1) / 2), gy]; r += s; }
  } else {
    const colW = W / 4.1, colH = B.pet ? W / 5.05 : colW, eY = H * .47, hY = H * .89; // avec un compagnon, les héros se resserrent pour lui laisser la place à gauche
    CB.scale = Math.min((hY - eY) * .68 / 200, colW / 82); CB.hScale = Math.min(CB.scale, colH / 70); CB.ground = hY; CB.petX = W - colH * 4.5 - W * .012;
    const cx = rk => W - colW * (rk - .5) - W * .012, hx = rk => W - colH * (rk - .5) - W * .012;
    let r = 1; for (const u of B.heroes) { pos[u.uid] = [hx(r), hY]; r++; }
    r = 1; for (const u of B.enemies) { const s = u.sz || 1; pos[u.uid] = [cx(r + (s - 1) / 2), eY]; r += s; }
  }
  for (const u of [...B.heroes, ...B.enemies, ...B.fallen, ...(B.dead || [])]) {
    const V = CB.vis[u.uid] = CB.vis[u.uid] || { a: 1, pose: "idle", pt: 0, off: 0, flash: 0, hp: u.hp, born: SC.t };
    if (pos[u.uid]) { V.tx = pos[u.uid][0]; V.ty = pos[u.uid][1]; if (V.x == null) { V.x = V.tx + (u.side === "h" ? -SC.w * .4 : SC.w * .4) * (CB.port ? .3 : 1); V.y = V.ty; } }
    if (u.side === "h" && !V.look) { const h = heroById(u.hid); V.look = heroLook(h); V.lookKey = V.look.key; }
  }
}
// ── écran ──
SCREENS.combat = {
  noNav: 1, noHud: 1, pass: 1,
  scene: () => drawCombat,
  html: () => `<div class="ctop l" id="cb-tl"></div><div id="cb-hud"><div id="cb-ord"></div><div id="cb-mlog"></div></div><div id="cb-boss"></div><div class="ctop" id="cb-tr"><button class="btn ghost sm" data-a="cbSpeed" title="Vitesse">${ico("speed")}<span id="cb-spd">×${S.opts.speed || 1}</span></button><button class="btn ghost sm ${S.opts.auto ? "on" : ""}" data-a="cbAuto" title="Combat automatique">${ico("auto")}<span id="cb-auto">${S.opts.auto ? "Auto" : "Manuel"}</span></button><button class="btn ghost sm" data-a="cbLogShow" title="Journal du combat">${ico("scroll")}</button><button class="btn ghost sm" data-a="cbFlee" id="cb-flee" title="Fuir">${ico("flee")}</button></div><div id="cbar"><div class="skdesc" id="cb-desc"></div><div class="skills" id="cb-skills"></div></div>`,
  mount: arg => startCombat(arg.node),
  leave: () => { CB.B = null; CB.resolve = null; { const ci = $("#cbinfo"); if (ci) ci.remove(); } const c = $("#coach"); if (c) c.remove(); UI.coach = null; document.querySelectorAll(".coachon").forEach(e => e.classList.remove("coachon")); },
  resize: () => { if (CB.B) { CB.barH = $("#cbar") ? $("#cbar").offsetHeight + 6 : 150; cbLayout(); } },
};
async function startCombat(node) {
  const run = S.run;
  const enc = genEncounter(run, node);
  const B = CB.B = battleFor(run, node, enc);
  CB.vis = {}; CB.fx = []; CB.txt = []; CB.proj = []; CB.log = []; CB.node = node; CB.speed = S.opts.fast ? 3 : S.opts.speed || 1; CB.auto = !!S.opts.auto; CB.banner = null;
  CB.barH = $("#cbar").offsetHeight + 6 || 150;
  cbLayout();
  SC.click = cbClick; SC.hover = cbHover;
  musicPlay(node.type === "boss" ? "boss" : "combat");
  for (const e of B.enemies) S.seen.monsters[e.key] = S.seen.monsters[e.key] || 0;
  $("#cb-flee").style.display = "";
  cbTopLeft(); cbBar(null);
  if (node.type === "boss") { const bs = B.enemies.find(e => e.boss); await bossIntro(bs); }
  else if (node.type === "elite") { const el = B.enemies.find(e => e.elite); if (el && !(S.eliteSeen || {})[el.key] && ELITE_INFO[el.key]) await eliteIntro(el); else await showBanner(node.nestOn ? "Nid d'élites" : node.nightAmbush ? "Embuscade !" : "Élite", el ? el.name : "", "#ff8a4a", 1100); }
  else await wait(500);
  if (typeof combatHints === "function") combatHints(B, node);
  combatLoop();
}
async function combatLoop() {
  const B = CB.B;
  while (B && !B.over && CB.B === B) {
    startRound(B); cbTopLeft();
    if (B.rageMsg === 1) { B.rageMsg = 2; await showBanner("Rage !", "Les ennemis frappent plus fort, mais se soignent moins", "#ff3a2a", 1100); }
    let u;
    while (!B.over && CB.B === B && (u = nextActor(B))) {
      CB.actor = u; cbTopLeft();
      const ev0 = beginTurn(B, u); if (ev0.length) await playEvents(ev0);
      checkEnd(B); if (B.over) break;
      if (!alive(u)) continue;
      if (u.skip) { await wait(350); endTurn(B, u); continue; }
      if (u.side === "e") { await wait(280); const ev = enemyTurn(B, u); await playEvents(ev); }
      else {
        let a;
        if (CB.auto) { await wait(220); a = autoChoice(u); } else a = await playerChoice(u);
        if (!CB.B) return;
        let ev;
        if (a.flee) { const ok = chance(CB.node.type === "boss" ? .5 : .75); if (ok) { await showBanner("Retraite !", "", "#c8b8a0", 800); return combatEnd("flee"); } ev = [{ k: "act", u: u.uid, sk: "Fuite ratée", anim: "move" }]; toast("La fuite échoue !", "bad"); }
        else if (a.potion) ev = usePotion(B, S.run, u, a.tgt);
        else if (a.move) ev = swapHero(B, u, a.move);
        else if (a.pass) ev = [{ k: "act", u: u.uid, sk: "Attend", anim: "idle" }];
        else if (a.delay) { ev = delayTurn(B, u); }
        else { if (a.sk.isUlt) B.ults = (B.ults || 0) + 1; ev = act(B, u, a.sk, a.tgt); }
        cbBar(null);
        await playEvents(ev);
      }
      endTurn(B, u); CB.actor = null; cbTopLeft();
    }
    if (B.over || CB.B !== B) break;
    const ev = []; petAct(B, ev); if (ev.length) await playEvents(ev); checkEnd(B);
  }
  if (CB.B === B) { if (B.over === "win" && typeof winBark === "function") { winBark(B); await wait(1300); } if (CB.B === B) combatEnd(B.over); }
}
function autoChoice(u) {
  const B = CB.B; const run = S.run;
  const dying = B.heroes.find(h => alive(h) && h.agony);
  if (dying && run.potions > 0 && !B.heroes.some(h => h.role === "soin" && alive(h) && h !== dying)) return { potion: 1, tgt: dying };
  // auto économe : l'ultime est gardé pour les élites, les gardiens ou quand un allié est en danger
  const keep = u.ultV, spare = S.opts.smartUlt !== 0 && u.ultV >= 100 && !B.enemies.some(e => e.boss || e.elite) && !B.heroes.some(h => alive(h) && (h.agony || h.hp / h.hpMax < .35));
  if (spare) u.ultV = 99; const a = heroAuto(B, u, "bal"); u.ultV = keep; return a.move ? { move: a.move } : a;
}
// ── choix du joueur ──
function playerChoice(u) {
  return new Promise(res => {
    CB.resolve = res; CB.sel = null;
    cbBar(u);
    // présélection : première compétence utilisable
    const first = u.ultV >= 100 ? u.ult : u.skills.find(sk => canUse(CB.B, u, sk));
    if (first) selectSkill(first);
    if (!S.tuto.coach) coachStart();
  });
}
// ── tutoriel guidé du premier combat ──
const COACH = [
  { t: "Vos héros et leurs rangs", d: "À gauche, vos quatre héros, du <b>rang 1</b> (au contact de l'ennemi) au <b>rang 4</b> (à l'arrière). Les tanks tiennent la ligne, les soigneurs et tireurs restent derrière.", gl: "rang", at: "tl" },
  { t: "Les intentions ennemies", d: "L'icône au-dessus de chaque ennemi annonce ce qu'il prépare : épées pour une attaque, flammes pour une attaque de zone, cœur pour un soin… Frappez d'abord celui qui va faire le plus mal.", gl: "intention", at: "tr" },
  { t: "Les compétences", d: "Choisissez une compétence en bas. Les <b>losanges</b> indiquent les rangs d'où elle se lance (bleu) et les rangs qu'elle touche (rouge). Les dégâts et soins chiffrés sont affichés. Touchez ensuite une cible en surbrillance.", el: "#cb-skills", at: "bottom" },
  { t: "La résolution", d: "En haut à gauche, le moral du groupe. Coups critiques et ennemis tués la font monter : à 80, vos héros sont <b>exaltés</b> (+15 % de dégâts). Sous 20, ils sont <b>ébranlés</b>.", gl: "resolution", el: "#cb-tl", at: "tl" },
  { t: "L'ultime", d: "Chaque héros remplit une jauge en agissant et en encaissant. Pleine, elle débloque sa compétence <b>ultime</b>, bien plus puissante.", gl: "ultime", el: "#cb-skills", at: "bottom" },
  { t: "L'agonie", d: "À 0 PV, un héros n'est pas mort : il est <b>à l'agonie</b>. Le moindre soin le relève ; un nouveau coup peut l'achever. Les potions sont en bas à gauche.", gl: "agonie", at: "bottom" },
];
function coachStart() { if (UI.coach != null) return; UI.coach = 0; coachShow(); }
function coachShow() {
  let el = $("#coach"); const i = UI.coach, C = COACH[i];
  if (!C) { if (el) el.remove(); UI.coach = null; S.tuto.coach = 1; save(); return; }
  if (!el) { el = document.createElement("div"); el.id = "coach"; document.body.appendChild(el); }
  document.querySelectorAll(".coachon").forEach(e => e.classList.remove("coachon"));
  if (C.el) { const t = $(C.el); if (t) t.classList.add("coachon"); }
  el.className = "panel frame at-" + C.at;
  el.innerHTML = `<div class="row sp" style="flex-wrap:nowrap"><b class="gold">${ico("info", "#e8c878", 16)} ${C.t}</b><span class="tiny dim">${i + 1} / ${COACH.length}</span></div><p class="small" style="margin:6px 0">${C.d}</p><div class="row sp">${C.gl ? `<span class="tiny gl" data-tip="${C.gl}">En savoir plus</span>` : "<span></span>"}<span class="row" style="gap:6px"><button class="btn ghost sm" data-a="coachSkip">Passer</button><button class="btn main sm" data-a="coachNext">${i + 1 < COACH.length ? "Suivant" : "Au combat !"}</button></span></div>`;
}
ACT.coachNext = () => { UI.coach++; coachShow(); };
ACT.coachSkip = () => { UI.coach = COACH.length; coachShow(); };
function choose(a) { if (CB.busy) return; const r = CB.resolve; CB.resolve = null; CB.sel = null; if (r) r(a); }
function selectSkill(sk) {
  const B = CB.B, u = CB.actor; if (!u || !canUse(B, u, sk)) return;
  CB.sel = { sk, tg: validTargets(B, u, sk) };
  const t = sk.t || "e";
  $("#cb-desc").innerHTML = `<b class="gold">${sk.n}</b>${sk.isUlt ? ' <span class="tag" style="color:#ff9a4a">ULTIME</span>' : ""} ${sk.use ? rankPips(sk.use, t === "e" || t === "ae" ? sk.at : null) : ""}<br><span class="small">${skillText(sk, u)}</span><br><span class="tiny dim">${t === "e" || t === "a" ? "Touchez une cible en surbrillance." : "Touchez une cible en surbrillance (ou la compétence à nouveau) pour lancer."}</span>`;
  document.querySelectorAll("#cb-skills .sk").forEach(b => b.classList.toggle("on", b.dataset.v === sk.id));
  $("#cb-desc").insertAdjacentHTML("beforeend", skillPreviewHTML(u, sk));
}
ACT.cbSk = id => {
  const u = CB.actor; if (!u || !CB.resolve) return;
  const sk = id === "ult" ? u.ult : u.skills.find(s => s.id === id); if (!sk) return;
  if (!canUse(CB.B, u, sk)) { toast(sk.isUlt ? "L'ultime n'est pas encore chargé." : u.cds[sk.id] > 0 ? "En recharge." : "Impossible depuis ce rang ou sans cible.", "bad"); return; }
  if (CB.sel && CB.sel.sk === sk && ["aa", "ae", "s"].includes(sk.t || "e")) return choose({ sk, tgt: null });
  selectSkill(sk);
};
ACT.cbPotion = () => { const u = CB.actor; if (!u || !CB.resolve) return; if (S.run.potions <= 0) return toast("Plus de potion.", "bad"); CB.sel = { potion: 1, tg: CB.B.heroes.filter(alive) }; $("#cb-desc").innerHTML = `<b class="gold">Potion de soin</b> (${S.run.potions})<br><span class="small">Soigne 40 % des PV, purge les altérations et sauve de l'agonie. Utilise le tour.</span>`; document.querySelectorAll("#cb-skills .sk").forEach(b => b.classList.toggle("on", b.dataset.v === "potion")); };
ACT.cbMove = d => { const u = CB.actor; if (!u || !CB.resolve) return; const r = rankOf(CB.B, u), n = CB.B.heroes.length; if ((+d < 0 && r <= 1) || (+d > 0 && r >= n)) return; choose({ move: +d }); };
ACT.cbPass = () => { if (CB.resolve) choose({ pass: 1 }); };
ACT.cbDelay = () => { const u = CB.actor; if (!u || !CB.resolve) return; if (u.delayR === CB.B.round) return toast("Déjà retardé ce tour.", "bad"); if (!turnQueue(CB.B).now.slice(1).length) return toast("Personne ne joue après lui ce tour.", "bad"); choose({ delay: 1 }); };
ACT.cbFlee = () => { if (!CB.resolve) return toast("Attendez votre tour.", "bad"); confirmBox(CB.node && CB.node.type === "boss" ? "Fuir le gardien ? (50 % de réussite) L'expédition s'arrête : vous rentrez au Bastion avec l'or et le butin, sans la victoire." : "Tenter de fuir ? (75 % de réussite, aucune récompense)", () => choose({ flee: 1 }), { yes: "Fuir" }); };
ACT.cbSpeed = () => { CB.speed = CB.speed >= 3 ? 1 : CB.speed + 1; S.opts.speed = CB.speed; save(); $("#cb-spd").textContent = "×" + CB.speed; };
ACT.cbAuto = (v, el) => { CB.auto = !CB.auto; S.opts.auto = CB.auto ? 1 : 0; save(); $("#cb-auto").textContent = CB.auto ? "Auto" : "Manuel"; el.classList.toggle("on", CB.auto); if (CB.auto && CB.resolve && CB.actor) choose(autoChoice(CB.actor)); };
function cbBar(u) {
  CB.preview = null;
  const box = $("#cb-skills"), d = $("#cb-desc"); if (!box) return;
  if (!u) { box.innerHTML = ""; d.innerHTML = CB.actor && CB.actor.side === "e" ? `<span class="bad">${esc(CB.actor.name)}</span> agit…` : '<span class="dim">…</span>'; return; }
  const B = CB.B, r = rankOf(B, u), n = B.heroes.length;
  const btn = (sk) => { const ok = canUse(B, u, sk); const cd = u.cds[sk.id] > 0 ? u.cds[sk.id] : 0; return `<button class="sk ${ok ? "" : "no"} ${sk.isUlt ? "ult" + (u.ultV >= 100 ? " ready" : "") : ""}" data-a="cbSk" data-v="${sk.id}">${ico(sk.ic, sk.isUlt ? "#ff9a4a" : ok ? "#e8d8b8" : "#6a5a4a")}<span>${sk.n}</span>${sk.rank > 1 ? `<span class="rk">${roman(sk.rank)}</span>` : ""}${cd ? `<span class="cd">${cd}</span>` : ""}${sk.isUlt && u.ultV < 100 ? `<span class="cd" style="font-size:13px">${Math.floor(u.ultV)} %</span>` : ""}</button>`; };
  box.innerHTML = u.skills.map(btn).join("") + btn(u.ult) +
    `<button class="sk ${S.run.potions ? "" : "no"}" data-a="cbPotion" data-v="potion">${ico("potion", "#e86a5a")}<span>Potion ×${S.run.potions}</span></button>` +
    `<button class="sk ${r >= n ? "no" : ""}" data-a="cbMove" data-v="1" title="Reculer">${ico("back", "#c8b8a0")}<span>Reculer</span></button>` +
    `<button class="sk ${r <= 1 ? "no" : ""}" data-a="cbMove" data-v="-1" title="Avancer">${ico("charge", "#c8b8a0")}<span>Avancer</span></button>` +
    `<button class="sk ${u.delayR === B.round ? "no" : ""}" data-a="cbDelay" title="Retarder : rejouer en fin de tour (+10 % de protection)">${ico("hourglass", "#c8b8a0")}<span>Retarder</span></button>` +
    `<button class="sk" data-a="cbPass" title="Passer">${ico("skip", "#9a8c7a")}<span>Passer</span></button>` + petBurstBtn();
  d.innerHTML = `<b>${esc(u.name)}</b> <span class="dim small">${CLASSES[u.cls].n} · rang ${r}</span>`;
  void n;
  CB.barH = $("#cbar").offsetHeight + 6; cbLayout();
}
function cbTopLeft() {
  const B = CB.B, el = $("#cb-tl"); if (!el || !B) return; const ord = $("#cb-ord"); if (ord) ord.innerHTML = turnOrderHTML(); miniLogRefresh();
  if (!hud("mor")) { el.innerHTML = ""; return; }
  const mc = B.morale >= 80 ? "#ffd27a" : B.morale <= 20 ? "#ff5a4a" : "#c8b8a0";
  el.innerHTML = `<div class="panel" style="padding:5px 8px;font-size:12px"><div class="row" style="gap:6px;flex-wrap:nowrap"><span data-tip="resolution" style="display:contents">${ico("banner", mc, 16)}</span><div class="bar" style="width:70px"><i style="width:${B.morale}%;background:linear-gradient(${mc},#6a4a2a)"></i></div><span class="gl" data-tip="resolution" style="color:${mc}">${B.morale >= 80 ? "Exaltés" : B.morale <= 20 ? "Ébranlés" : "Résolus"}</span></div><div class="row" style="gap:6px;margin-top:3px;flex-wrap:nowrap"><span class="row" data-tip="lueur" style="gap:4px;flex-wrap:nowrap">${ico("torch", B.light < 30 ? "#ff5a3a" : "#ffb050", 16)}<span class="tiny">${Math.round(B.light)}</span></span><span class="tiny dim">Tour ${B.round}</span></div></div>`;
}
// ── saisie sur la scène ──
function unitAt(px, py) {
  const B = CB.B; if (!B) return null;
  for (const u of [...B.heroes, ...B.enemies]) { const V = CB.vis[u.uid]; if (!V || V.x == null) continue; const w = 64 * CB.scale * (u.sz || 1) * (u.side === "e" && u.sz > 1 ? 1.3 : 1), h = 190 * CB.scale * (u.sz > 1 ? 1.45 : 1); if (px > V.x - w && px < V.x + w && py > V.y - h && py < V.y + 20) return u; }
  return null;
}
function cbHover(px, py) { CB.hoverU = unitAt(px, py); SC.cv.style.cursor = CB.hoverU && CB.sel && CB.sel.tg.includes(CB.hoverU) ? "pointer" : "default"; }
function cbClick(px, py) {
  const z = (CB.zones || []).find(z => px >= z.x0 && px <= z.x1 && py >= z.y0 && py <= z.y1);
  if (z) return cbInfo(z.u, z.k, px, py);
  const u = unitAt(px, py);
  if (!CB.resolve || !CB.sel) { if (u) showUnitInfo(u); return; }
  if (!u) return;
  if (!CB.sel.tg.includes(u)) { showUnitInfo(u); return; }
  if (CB.sel.potion) return choose({ potion: 1, tgt: u });
  choose({ sk: CB.sel.sk, tgt: u });
}
function showUnitInfo(u) { return cbInfo(u, "unit"); }
// ── lecture des événements ──
function V(id) { return CB.vis[id]; }
function U(id) { return unitById(CB.B, id) || CB.B.fallen.find(f => f.uid === id) || (CB.B.dead || []).find(d => d.uid === id); }
function popText(id, text, col, big) { const v = V(id); if (!v) return; text = typeof text === "number" ? String(Math.round(text)) : cleanNum(text); const y0 = v.y - 170 * CB.scale * (U(id) && U(id).sz > 1 ? 1.4 : 1);
  const near = CB.txt.filter(q => q.id === id && q.t < .5).length; // les textes d'une même unité s'empilent au lieu de se chevaucher
  CB.txt.push({ id, x: v.x + (Math.random() - .5) * 14, y: y0 - near * 26 * Math.max(.8, CB.scale * 1.4), text, col, big, t: 0, life: big ? 1.4 : 1.1 }); }
function burst(x, y, col, n = 14, o = {}) { for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, s = (o.sp || 160) * (.3 + Math.random()); CB.fx.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - (o.up || 60), g: o.g == null ? 300 : o.g, r: (o.r || 3) * (.5 + Math.random()), col, t: 0, life: (o.life || .6) * (.6 + Math.random() * .6), add: o.add !== false }); } }
const ANIM_COL = { holy: "#ffe08a", fire: "#ff7a2a", shadow: "#9a6aff", blood: "#d02a2a", nature: "#8ad06a", poison: "#9ad04a", music: "#c9a0ff", arrows: "#e8e0c8" };
function skillColor(u, name) {
  if (u.side === "e") { const M = MONSTERS[u.key]; if (/feu|Bûcher|Flamme|Boule|lave|ardent|Couronne/i.test(name)) return "#ff7a2a"; if (/peste|Vomi|Poison|Bave|Crachat|Pollen|Brume/i.test(name)) return "#9ad04a"; if (M && M.tags.includes("impie")) return "#9a6aff"; return "#d84a3a"; }
  const C = CLASSES[u.cls]; return { templier: "#ffe08a", revenant: "#7af0e0", pretresse: "#ffe8a0", sorciere: "#8ad06a", menestrel: "#c9a0ff", berserker: "#ff5a3a", ombre: "#a06aff", arbaletriere: "#e8e0c8", pyromancien: "#ff7a2a", necromancien: "#6ad0a0", gardien_runes: "#7ad0ff", medecin_peste: "#9fe86a", chasseur_sorcieres: "#ffe8a0", hallebardier: "#e8d8a0", exorciste: "#e8f0ff" }[u.cls] || "#ffffff";
}
async function playEvents(ev) {
  const B = CB.B; if (!B) return;
  let cur = null, srcCol = "#fff";
  for (let i = 0; i < ev.length; i++) {
    const e = ev[i]; if (!CB.B) return; cbLog(e);
    switch (e.k) {
      case "act": {
        cur = e; const u = U(e.u); if (!u) break; const v = V(e.u); srcCol = skillColor(u, e.sk);
        if (e.anim === "idle" || e.anim === "move") { popText(e.u, e.sk, "#c8b8a0"); break; }
        if (e.ult) { sfx("ult"); await showBanner(e.sk, u.name, srcCol, 1000); CB.flash = .6; }
        const tgt = e.tgt ? V(e.tgt) : null;
        if (e.anim === "melee" || e.anim === "leap") {
          v.pose = "windup"; v.pt = .25; await wait(170);
          const dx = tgt ? (tgt.x - v.x) * (CB.port && tgt.y !== v.y ? .55 : .62) : (u.side === "h" ? 60 : -60);
          const dy = tgt && CB.port ? (tgt.y - v.y) * .5 : 0;
          v.off = dx; v.offy = dy; v.pose = "strike"; v.pt = .5; sfx(u.side === "e" && (u.sz || 1) > 1 ? "heavy" : u.side === "h" && CLASSES[u.cls] && CLASSES[u.cls].wpn === "arbalete" ? "shoot" : "slash"); CB.shake = .15;
          await wait(120);
        } else if (e.anim === "shoot") {
          v.pose = u.side === "h" ? "strike" : "strike"; v.pt = .45; sfx("shoot");
          for (const t of targetsAfter(ev, i)) projectile(v, V(t), "bolt", srcCol);
          await wait(220);
        } else if (e.anim === "cast") {
          v.pose = u.side === "h" ? "cast" : "strike"; v.pt = .6; sfx(/feu|flamme|Météore|Embras|Combust|Bûcher|braise|magma|Fonte/i.test(e.sk) ? "fire" : /glac|givre|gel|hiver|blizzard|froid|neige/i.test(e.sk) ? "frost" : /foudre|éclair|décharge|tonnerre/i.test(e.sk) ? "shock" : /poison|venin|peste|toxi|acide/i.test(e.sk) ? "poison" : u.side === "h" && ["pretresse", "templier", "exorciste", "chasseur_sorcieres"].includes(u.cls) ? "holy" : "dark");
          glowAt(v, srcCol, 1); for (const t of targetsAfter(ev, i)) projectile(v, V(t), "orb", srcCol);
          await wait(300);
        } else if (e.anim === "heal" || e.anim === "buff" || e.anim === "potion") {
          v.pose = u.side === "h" ? (e.anim === "potion" ? "buff" : "cast") : "strike"; v.pt = .55; sfx(e.anim === "buff" ? "buff" : "heal"); glowAt(v, e.anim === "buff" ? "#c8b0ff" : "#9fe8a0", 1);
          popText(e.u, e.sk, e.anim === "buff" ? "#c8b0ff" : "#9fe8a0");
          await wait(260);
        }
        if (e.anim !== "heal" && e.anim !== "buff" && e.anim !== "potion") popText(e.u, e.sk, "#e8d8b8");
        break;
      }
      case "hit": {
        const v = V(e.u), u = U(e.u); if (!v) break;
        if (e.self) { popText(e.u, "-" + e.dmg, "#ff8a7a"); break; }
        v.pose = "hurt"; v.pt = .35; v.flash = 1; v.kick = (u && u.side === "h" ? -1 : 1) * (e.crit ? 26 : 16);
        if (!e.dot) CB.fx.push({ slash: 1, x: v.x, y: v.y - 105 * CB.scale, r: (e.crit ? 64 : 48) * CB.scale, a: (u && u.side === "h" ? Math.PI : 0) + (Math.random() - .5) * .8, col: e.crit ? "#ffd04a" : "#ffb08a", t: 0, life: e.crit ? .45 : .32 });
        if (e.crit) CB.flash = Math.max(CB.flash || 0, .25);
        burst(v.x, v.y - 100 * CB.scale, srcCol === "#e8e0c8" ? "#d02a2a" : srcCol, e.crit ? 26 : 12, { sp: e.crit ? 260 : 170 });
        if (u && !u.tags.includes("impie") || (u && u.side === "h")) burst(v.x, v.y - 100 * CB.scale, "#8a0a0a", 6, { add: false, g: 500 });
        popText(e.u, (e.crit ? "" : "") + e.dmg, e.crit ? "#ffd04a" : "#ff6a5a", e.crit);
        if (e.crit) { CB.shake = .35; sfx("crit"); popText(e.u, "CRITIQUE", "#ffd04a"); if (cur && U(cur.u) && U(cur.u).side === "h") bark(cur.u, "crit"); } else sfx("hit");
        await wait(e.crit ? 220 : 130);
        break;
      }
      case "miss": popText(e.u, "Esquive", "#c8c8d8"); sfx("miss"); { const v = V(e.u); if (v) v.kick = (U(e.u) && U(e.u).side === "h" ? -1 : 1) * 22; } await wait(120); break;
      case "absorb": popText(e.u, "Bloqué " + e.v, "#a0c8ff"); sfx("block"); await wait(60); break;
      case "dot": { const v = V(e.u); popText(e.u, "-" + e.dmg, ST_INFO[e.st].c); if (v) { v.flash = .6; burst(v.x, v.y - 90 * CB.scale, ST_INFO[e.st].c, 8, { up: 120, g: -40 }); } sfx(e.st === "burn" ? "fire" : e.st === "poison" ? "poison" : e.st === "bleed" ? "bleed" : "hit"); await wait(260); break; }
      case "heal": if (e.v > 0) { popText(e.u, "+" + e.v, "#8fe07a"); const v = V(e.u); if (v) burst(v.x, v.y - 80 * CB.scale, "#8fe07a", e.regen ? 5 : 10, { up: 90, g: -60, sp: 60 }); } await wait(e.regen ? 200 : 90); break;
      case "st": { const u = U(e.u); if (!u) break; const neg = NEG.has(e.st); popText(e.u, ST_INFO[e.st].n, ST_INFO[e.st].c); if (e.st === "stun") sfx("stun"); else if (neg && e.st !== "mark") sfx("debuff"); await wait(70); break; }
      case "resist": popText(e.u, "Résiste", "#d8d0c0"); await wait(60); break;
      case "stunned": popText(e.u, "Étourdi", "#ffd84a"); await wait(320); break;
      case "cleanse": popText(e.u, "Purifié", "#e8f0ff"); break;
      case "guard": popText(e.u, "Protège !", "#c0d0e0"); await wait(120); break;
      case "riposte": popText(e.u, "Riposte !", "#e0c080"); { const v = V(e.u); if (v) { v.pose = "strike"; v.pt = .35; v.off = (U(e.u).side === "h" ? 30 : -30); } } sfx("slash"); await wait(150); break;
      case "thorns": popText(e.u, "Épines", "#e07a3a"); break;
      case "detonate": { const v = V(e.u); if (v) { burst(v.x, v.y - 90 * CB.scale, ST_INFO[e.st].c, 30, { sp: 280 }); CB.shake = .3; } sfx("crit"); await wait(150); break; }
      case "agony": popText(e.u, "À L'AGONIE", "#ff3a2a", true); sfx("fall"); CB.shake = .25; bark(e.u, "agony"); await wait(450); break;
      case "saved": popText(e.u, "Sauvé !", "#8fe07a"); bark(e.u, "saved"); break;
      case "resist_death": popText(e.u, "Tient bon !", "#ffd27a", true); await wait(380); break;
      case "cheat": popText(e.u, "Défie la mort !", "#ffd27a", true); await wait(380); break;
      case "fall": { popText(e.u, "TOMBÉ", "#ff3a2a", true); sfx("fall"); const v = V(e.u); if (v) v.dying = 1; CB.shake = .3; { const o = CB.B.heroes.filter(h => alive(h) && h.uid !== e.u); if (o.length) bark(pick(o).uid, "ally"); } await wait(700); cbLayout(); break; }
      case "revive": { popText(e.u, "Se relève !", "#ffe08a", true); sfx("holy"); cbLayout(); const v = V(e.u); if (v) { v.dying = 0; v.a = 1; glowAt(v, "#ffe08a", 1.5); } await wait(400); break; }
      case "die": { const v = V(e.u); if (cur && U(cur.u) && U(cur.u).side === "h" && alive(U(cur.u))) bark(cur.u, "kill"); if (v) { v.dying = 1; burst(v.x, v.y - 80 * CB.scale, "#2a1a1a", 20, { add: false, g: 200 }); burst(v.x, v.y - 80 * CB.scale, "#ffb070", 10, { up: 140, g: -30 }); } sfx("die"); await wait(e.boss ? 900 : 380); cbLayout(); break; }
      case "move": cbLayout(); sfx("step"); await wait(200); break;
      case "lastbreath": { const v = V(e.u); if (v) glowAt(v, "#ffd070", 2); popText(e.u, "Dernier souffle !", "#ffd070", true); sfx("ult"); CB.shake = .5; await wait(700); break; }
      case "summon": { cbLayout(); sfx("dark"); const v = V(e.u); if (v) { v.a = 1; v.born = SC.t; glowAt(v, "#9a3aff", 1.4); } popText(e.u, "Renfort !", "#c89aff", true); await wait(500); break; }
      case "morale": if (Math.abs(e.d) >= 8) { const pc = e.d > 0 ? "#ffd27a" : "#ff6a5a"; CB.txt.push({ x: SC.w / 2, y: CB.stageH * .2, text: (e.d > 0 ? "Résolution +" : "Résolution ") + Math.round(e.d), col: pc, t: 0, life: 1.2 }); } cbTopLeft(); break;
      case "phase": sfx("dark"); CB.flash = .8; await showBanner(e.text, "", "#ff4a3a", 1500); break;
      case "pet": { sfx(e.t === "aa" || e.t === "low" ? "heal" : "slash"); CB.petAct = { t: 0, name: e.sk }; await wait(280); break; }
    }
  }
  cbTopLeft();
  await wait(160);
}
function targetsAfter(ev, i) { const out = []; for (let j = i + 1; j < ev.length && ev[j].k !== "act"; j++) if ((ev[j].k === "hit" || ev[j].k === "miss") && !ev[j].self && !out.includes(ev[j].u)) out.push(ev[j].u); return out; }
function glowAt(v, col, s) { CB.fx.push({ glow: 1, x: v.x, y: v.y - 90 * CB.scale, r: 120 * CB.scale * s, col, t: 0, life: .7 }); }
function projectile(a, b, kind, col) { if (!a || !b) return; CB.proj.push({ x0: a.x + (b.x > a.x ? 40 : -40) * CB.scale, y0: a.y - 110 * CB.scale, x1: b.x, y1: b.y - 100 * CB.scale, t: 0, life: kind === "bolt" ? .18 : .3, kind, col }); }
function showBanner(title, sub, col, ms) { CB.banner = { title, sub, col, t: 0, life: ms / 1000 / (CB.speed || 1) }; return wait(ms); }
// ── fin du combat ──
async function combatEnd(over) {
  const B = CB.B, run = S.run, node = CB.node; if (!B) return;
  CB.B = null; CB.resolve = null;
  afterBattle(run, B);
  if (over === "flee" && node.type === "boss") { save(); toast("Vous fuyez le gardien et rentrez au Bastion.", "bad"); finishRun("retreat"); return; } // fuir un gardien met fin à l'expédition (sans victoire)
  if (over === "flee") { node.done = 1; if (node.nightAmbush && run.pendingNode) { const pn = run.pendingNode; run.pendingNode = null; save(); go("map"); const n0 = run.map[pn.c][pn.i]; if (n0) resolveNode(n0); return; } save(); go("map"); return; }
  if (over === "win") {
    await new Promise(r => setTimeout(r, 300));
    const R = rewardFor(run, node.ambush ? { c: node.c, type: "combat" } : node);
    const ups = grantReward(run, R);
    node.done = 1; save();
    sfx("win");
    if (node.type === "boss" && run.rush && node.c < run.map.length - 1) { go("map"); rewardModal("Gardien vaincu", "Le suivant vous attend déjà…", R, ups); return; } // boss rush : on enchaîne
    if (node.type === "boss") {
      if (run.region === "abime") {
        modal(`<h2>${ico("crown", "#e8c878")} Gardien vaincu — profondeur ${run.floor}</h2><p class="lore">L'Abîme s'ouvre plus bas. L'air y est plus froid, les trésors plus brillants.</p>${rewardHTML(R)}<div class="row" style="justify-content:flex-end;gap:8px;margin-top:10px"><button class="btn" data-a="abyssUp">Remonter avec le butin</button><button class="btn main" data-a="abyssDown">Descendre plus bas</button></div>`, { close: false });
        go("map");
        return;
      }
      CB.pendingVictory = 1;
      rewardModal("Gardien vaincu !", "", R, ups, () => finishRun("victory"));
      return;
    }
    go("map");
    rewardModal(node.type === "elite" ? (node.nightAmbush ? "Embuscade repoussée" : node.nestOn ? "Nid d'élites détruit" : "Élite vaincue") : "Victoire", eliteNewsText(run), R, ups, () => { const pn = run.pendingNode; if (pn) { run.pendingNode = null; const n0 = run.map[pn.c] && run.map[pn.c][pn.i]; if (n0) resolveNode(n0); } });
    return;
  }
  // défaite
  save();
  await new Promise(r => setTimeout(r, 600));
  finishRun("wipe");
}
function rewardHTML(R) { return `${R.uniq ? `<div class="reward" style="color:var(--gold2)">${ico("crown", "#ffd27a", 22)}<b>Objet unique de gardien : <span class="rar4">${gearName(R.uniq)}</span> !</b></div>` : ""}${R.gold ? `<div class="reward">${ico("coin", "#e8c060", 22)}<b>+${R.gold} or</b></div>` : ""}${(R.loot || []).map(i => `<div class="reward" style="align-items:flex-start">${slotHTML(i, "itemInfo", i.id)}<div style="flex:1;min-width:0"><b class="rar${i.rar}">${gearName(i)}</b><div class="tiny dim">${i.cls ? CLASSES[i.cls].n + " — " : ""}${itemLine(i)}</div>${runEquipBtns(i)}</div></div>`).join("")}${R.relic ? `<div class="reward">${ico("gem", "#c87aff", 22)}<b>${RELICS[R.relic].n}</b> <span class="tiny">${gl(RELICS[R.relic].d)}</span></div>` : ""}${R.shards ? `<div class="reward">${ico("shard", "#c090ff", 22)}<b>+${R.shards} éclats</b></div>` : ""}`; }
ACT.abyssUp = () => { closeModal(); finishRun("victory"); };
ACT.abyssDown = () => { const run = S.run; run.floor++; run.map = genMap(RNG, 6, { elite: run.oaths.includes("elite") }); run.pos = null; run.light = clamp(run.light + 30, 0, 100); S.abyss.best = Math.max(S.abyss.best, run.floor - 1); save(); closeModal(); go("map"); toast(`Profondeur ${run.floor}…`, "epic"); };
// ── dessin ──
function drawCombat(x, t, dt) {
  const B = CB.B, run = S.run;
  const W = SC.w, H = SC.h;
  if (S.opts.calm) CB.shake = 0; let sx = 0, sy = 0; if (CB.shake > 0) { CB.shake -= dt; sx = (Math.random() - .5) * 14 * CB.shake; sy = (Math.random() - .5) * 10 * CB.shake; }
  CB.zones = []; x.save(); x.translate(sx, sy);
  // décor
  const reg = run ? run.region : "bourg"; const bg = paintRegion(reg, 1280, 720);
  const stH = CB.stageH || H * .7, bw = Math.max(W, stH * 16 / 9 * 1.1), bh = bw * 9 / 16;
  x.drawImage(bg, (W - bw) / 2, Math.min(0, stH - bh * .86), bw, bh);
  x.fillStyle = "#050304"; x.fillRect(0, stH - 2, W, H);
  if (!SC.amb || SC.ambKind !== reg) { SC.amb = makeAmbient(REGION_AMB[reg] || "braises", 36, W, H); SC.ambKind = reg; }
  drawAmbient(x, SC.amb, t, dt);
  if (CB.port && B) { x.fillStyle = "rgba(0,0,0,.35)"; x.fillRect(0, stH * .5, W, 3); }
  if (!B) { x.restore(); return; }
  // lumière de torche selon la lueur
  const lg = x.createRadialGradient(W * .3, stH * .7, 10, W * .3, stH * .7, W * .8); lg.addColorStop(0, `rgba(255,150,70,${.06 + B.light / 1000})`); lg.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = lg; x.fillRect(0, 0, W, stH);
  if ([...B.heroes, ...B.enemies].some(u => !CB.vis[u.uid])) cbLayout(); // renfort invoqué pas encore placé : on le place avant de dessiner (sinon l'écran devenait noir)
  const units = [...B.heroes, ...B.enemies, ...B.fallen.filter(f => CB.vis[f.uid] && CB.vis[f.uid].a > .02), ...(B.dead || []).filter(d => CB.vis[d.uid] && CB.vis[d.uid].a > .02)];
  units.sort((a, b) => (CB.vis[a.uid].ty || 0) - (CB.vis[b.uid].ty || 0));
  const tg = CB.sel ? CB.sel.tg : [];
  for (const u of units) {
    const v = CB.vis[u.uid]; if (!v || v.tx == null) continue;
    v.x += (v.tx - v.x) * Math.min(1, dt * 7); v.y += (v.ty - v.y) * Math.min(1, dt * 7);
    v.off = (v.off || 0) * Math.pow(.0005, dt); v.offy = (v.offy || 0) * Math.pow(.0005, dt); v.kick = (v.kick || 0) * Math.pow(.002, dt);
    if (v.pt > 0) { v.pt -= dt * (CB.speed || 1); if (v.pt <= 0) v.pose = "idle"; }
    v.flash = Math.max(0, (v.flash || 0) - dt * 4);
    if (v.dying) v.a = Math.max(0, v.a - dt * 1.4);
    const px = v.x + v.off + v.kick, py = v.y + (v.offy || 0) + (v.dying ? (1 - v.a) * 20 : 0);
    // ombre au sol
    x.fillStyle = "rgba(0,0,0,.45)"; x.beginPath(); x.ellipse(v.x, v.y, 38 * CB.scale * (u.sz || 1) * 1.1, 8 * CB.scale, 0, 0, 7); x.fill();
    // surbrillance des cibles
    const isTg = tg.includes(u), isCur = CB.actor === u;
    if (isCur) { glow(x, v.x, v.y - 4, 60 * CB.scale * 1.6, "#ffd27a", .35); x.strokeStyle = "rgba(255,210,122,.9)"; x.lineWidth = 2; x.beginPath(); x.ellipse(v.x, v.y, 40 * CB.scale * (u.sz || 1), 10 * CB.scale, 0, 0, 7); x.stroke(); }
    if (isTg) { const pc = u.side === "e" ? "#ff4a3a" : "#7ad07a"; const pulse = .5 + Math.sin(t * 6) * .3; x.strokeStyle = rgba(pc, .6 + pulse * .4); x.lineWidth = 2.5; x.beginPath(); x.ellipse(v.x, v.y, 46 * CB.scale * (u.sz || 1), 12 * CB.scale, 0, 0, 7); x.stroke(); if (CB.hoverU === u) glow(x, v.x, v.y - 80 * CB.scale, 110 * CB.scale, pc, .25); }
    // sprite
    let pose = v.pose || "idle"; if (u.side === "h" && u.agony && pose === "idle") pose = "agony";
    const sp = unitSprite(u, pose);
    if (pose === "idle" || v.top == null) { const bb = spriteBox(sp); if (bb) v.top = py - sp.ay + bb.y; } // haut réel de l'illustration (intentions, cible)
    x.save(); x.globalAlpha = v.a;
    const br = pose === "idle" ? 1 + Math.sin(t * 2.2 + (u.uid.length * 1.7)) * .012 : 1;
    x.translate(px, py); if (u.side === "e") x.scale(-1, 1);
    if (u.side === "e" && (MONSTERS[u.key].art === "spectre" || MONSTERS[u.key].art === "follet" || MONSTERS[u.key].art === "oeil" || MONSTERS[u.key].art === "liche" || MONSTERS[u.key].art === "mere_noyes")) x.translate(0, Math.sin(t * 2 + px) * 4);
    // attaque : élan étiré + traînée de l'image ; coup reçu : silhouette blanche ; agonie : souffle lent
    const k = v.pt > 0 ? Math.min(1, v.pt * 3) : 0;
    if (pose === "strike" && k > 0) { x.save(); for (const [d, a] of [[-34, .16], [-18, .28]]) { x.globalAlpha = v.a * a * k; x.drawImage(sp, -sp.ax + d * CB.scale, -sp.ay); } x.restore(); x.scale(1 + .07 * k, 1 - .03 * k); }
    if (pose === "agony") x.scale(1 + Math.sin(t * 1.6) * .008, 1 - Math.sin(t * 1.6) * .012);
    x.scale(1, br);
    x.drawImage(sp, -sp.ax, -sp.ay);
    if (v.flash > 0) { x.globalAlpha = Math.min(1, v.flash) * .85 * v.a; x.drawImage(whiteOf(sp), -sp.ax, -sp.ay); }
    x.restore();
    if (u.side === "h" && u.agony && !u.fallen) { x.save(); x.globalCompositeOperation = "lighter"; glow(x, v.x, v.y - 30 * CB.scale, 70 * CB.scale, "#c01a10", .18 + Math.sin(t * 3) * .06); x.restore(); }
    if (u.dead || u.fallen) continue;
    drawUnitUI(x, u, v, t);
  }
  // compagnon : silhouette derrière le groupe
  if (B.pet) drawPetInCombat(x, t, dt);
  // projectiles
  for (const p of CB.proj) { p.t += dt * (CB.speed || 1); const k = Math.min(1, p.t / p.life), px2 = lerp(p.x0, p.x1, k), py2 = lerp(p.y0, p.y1, k) - Math.sin(k * Math.PI) * (p.kind === "orb" ? 30 : 6);
    x.save(); x.globalCompositeOperation = "lighter"; if (p.kind === "bolt") { x.strokeStyle = p.col; x.lineWidth = 3; x.beginPath(); x.moveTo(px2 - (p.x1 - p.x0) * .08, py2 - (p.y1 - p.y0) * .08); x.lineTo(px2, py2); x.stroke(); glow(x, px2, py2, 10, p.col, .6); } else { glow(x, px2, py2, 26, p.col, .8); glow(x, px2, py2, 9, "#ffffff", .9); } x.restore();
    if (k >= 1) { burst(p.x1, p.y1, p.col, 10); p.done = 1; } }
  CB.proj = CB.proj.filter(p => !p.done);
  // particules
  x.save();
  for (const f of CB.fx) {
    f.t += dt; const k = f.t / f.life; if (k >= 1) { f.done = 1; continue; }
    if (f.glow) { x.globalCompositeOperation = "lighter"; glow(x, f.x, f.y, f.r * (.6 + k * .6), f.col, .55 * (1 - k)); continue; }
    if (f.slash) { // estafilade : arc lumineux qui se trace puis s'efface
      x.globalCompositeOperation = "lighter"; const a0 = f.a - 1.1, a1 = a0 + 2.2 * Math.min(1, k * 2.5);
      for (const [w, c, al] of [[f.r * .22, f.col, .35], [f.r * .08, "#fff4dc", .9]]) { x.strokeStyle = rgba(c, al * (1 - k)); x.lineWidth = w * (1 - k * .5); x.lineCap = "round"; x.beginPath(); x.arc(f.x, f.y, f.r, a0, a1); x.stroke(); }
      continue;
    }
    f.vy += f.g * dt; f.x += f.vx * dt; f.y += f.vy * dt;
    x.globalCompositeOperation = f.add ? "lighter" : "source-over";
    if (f.add) glow(x, f.x, f.y, f.r * 3, f.col, .8 * (1 - k)); else { x.fillStyle = rgba(f.col, 1 - k); x.fillRect(f.x, f.y, f.r * 1.5, f.r * 1.5); }
  }
  x.restore(); CB.fx = CB.fx.filter(f => !f.done);
  // textes flottants
  for (const tx2 of CB.txt) {
    tx2.t += dt; const k = tx2.t / tx2.life; if (k >= 1) { tx2.done = 1; continue; }
    const sc = tx2.big ? 1.4 : 1, yy = tx2.y - easeOut(k) * (tx2.bark ? 18 : 50), a = k < .8 ? 1 : (1 - k) * 5;
    x.save(); x.globalAlpha = a; x.font = tx2.bark ? `italic 600 ${Math.round(15 * Math.max(.85, Math.min(1.2, CB.scale * 1.5)))}px Alegreya, Georgia, serif` : `${tx2.big ? 900 : 700} ${Math.round((16 + (/^\d+$/.test(tx2.text) ? 6 : 0)) * sc * Math.max(.8, Math.min(1.3, CB.scale * 1.5)))}px Cinzel, serif`; x.textAlign = "center";
    const hw = x.measureText(tx2.text).width / 2 + 6, tx = clamp(tx2.x, hw, SC.w - hw), ty = Math.max(CB.port ? 96 : 70, yy); // jamais hors de l'écran ni sous le bandeau
    x.lineWidth = 4; x.strokeStyle = "#000"; x.strokeText(tx2.text, tx, ty); x.fillStyle = tx2.col; x.fillText(tx2.text, tx, ty); x.restore();
  }
  CB.txt = CB.txt.filter(t2 => !t2.done);
  x.restore();
  if (typeof combatWeather === "function") combatWeather(x, t, dt, stH); if (typeof bossBarTick === "function") bossBarTick();
  // éclair d'écran, bandeau
  if (CB.flash > 0) { // coup critique / ultime / phase : pulsation sombre sur les bords (plus de voile blanc plein écran)
    const a = Math.min(1, CB.flash) * (S.opts.calm ? .15 : .5), g = x.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .35, W / 2, H / 2, Math.max(W, H) * .75);
    g.addColorStop(0, "rgba(90,10,6,0)"); g.addColorStop(1, `rgba(90,10,6,${a})`); x.fillStyle = g; x.fillRect(0, 0, W, H); CB.flash -= dt * 2; }
  if (CB.banner) { const b = CB.banner; b.t += dt; const k = b.t / b.life; if (k >= 1) CB.banner = null; else {
    const a = k < .15 ? k / .15 : k > .85 ? (1 - k) / .15 : 1; const cy = stH * .32;
    x.save(); x.globalAlpha = a; x.fillStyle = lgrad(x, 0, cy - 50, 0, cy + 50, [[0, "rgba(0,0,0,0)"], [.3, "rgba(0,0,0,.82)"], [.7, "rgba(0,0,0,.82)"], [1, "rgba(0,0,0,0)"]]); x.fillRect(0, cy - 50, W, 100);
    x.fillStyle = lgrad(x, 0, 0, W, 0, [[0, rgba(b.col, 0)], [.5, rgba(b.col, .9)], [1, rgba(b.col, 0)]]); x.fillRect(0, cy - 34, W, 1.5); x.fillRect(0, cy + 32, W, 1.5);
    x.textAlign = "center"; x.font = `900 ${Math.min(42, W / 14)}px "Cinzel Decorative", Cinzel, serif`; x.shadowColor = b.col; x.shadowBlur = 20; x.fillStyle = "#f8ecd0"; x.fillText(b.title, W / 2 + (1 - easeOut(Math.min(1, k * 4))) * 60, cy + 10);
    if (b.sub) { x.shadowBlur = 0; x.font = `600 14px Cinzel, serif`; x.fillStyle = b.col; x.fillText(b.sub.toUpperCase(), W / 2, cy + 28); }
    x.restore(); } }
  // vignette
  const vg = x.createRadialGradient(W / 2, stH * .6, stH * .3, W / 2, stH * .6, Math.max(W, stH)); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,.55)"); x.fillStyle = vg; x.fillRect(0, 0, W, stH);
}
function drawIcon(x, name, cx, cy, s, col, lw = 2) {
  const im = artImg("ui_" + name); if (im) { const d = 26 * s; x.drawImage(im, cx - d / 2, cy - d / 2, d, d); return; } // icône peinte
 const p = new Path2D(IC[name] || IC.star); x.save(); x.translate(cx - 12 * s, cy - 12 * s); x.scale(s, s); x.strokeStyle = col; x.lineWidth = lw / s * s; x.lineCap = "round"; x.lineJoin = "round"; x.stroke(p); x.restore(); }
function drawUnitUI(x, u, v, t) {
  const B = CB.B, us = u.side === "h" && CB.port && CB.hScale ? CB.hScale : CB.scale, s = Math.max(.7, Math.min(1.25, us * 1.6)), w = Math.min(64 * s, CB.port && u.side === "h" ? SC.w / 5.4 : 1e9) * (u.sz > 1 ? 1.5 : 1), bx = v.x - w / 2, by = v.y + 8 * s;
  // barre de PV
  x.fillStyle = "rgba(0,0,0,.75)"; x.fillRect(bx - 1, by - 1, w + 2, 8 * s + 2);
  const hpk = clamp(u.hp / u.hpMax, 0, 1); v.hp = v.hp == null ? hpk : v.hp + (hpk - v.hp) * .12;
  x.fillStyle = "#5a1410"; x.fillRect(bx, by, w * v.hp, 8 * s);
  x.fillStyle = u.side === "h" ? lgrad(x, 0, by, 0, by + 8 * s, [[0, "#e04a3a"], [1, "#8a1a10"]]) : lgrad(x, 0, by, 0, by + 8 * s, [[0, "#c03a3a"], [1, "#6a1010"]]); x.fillRect(bx, by, w * hpk, 8 * s);
  const sh = stSum(u, "shield"); if (sh > 0) { x.fillStyle = "rgba(140,190,255,.7)"; x.fillRect(bx, by, w * clamp(sh / u.hpMax, 0, 1), 3 * s); }
  x.font = `700 ${Math.round(9.5 * s)}px Alegreya, serif`; x.textAlign = "center"; x.fillStyle = "#fff"; x.lineWidth = 3; x.strokeStyle = "#000"; const ht = u.agony ? "AGONIE" : Math.ceil(u.hp) + "/" + u.hpMax; x.strokeText(ht, v.x, by + 7.5 * s); x.fillStyle = u.agony ? "#ff6a5a" : "#f0e8e0"; x.fillText(ht, v.x, by + 7.5 * s);
  if (u.corrupt) glow(x, v.x, v.y - 60 * CB.scale, 80 * CB.scale, "#9a3aff", .14 + Math.sin(t * 3) * .04); // créature corrompue
  if (u.agony) { const pk = .5 + Math.sin(t * 5) * .5; glow(x, v.x, v.y - 60 * CB.scale, 60 * CB.scale, "#ff2a1a", .2 + pk * .2); }
  // ultime (héros)
  if (u.side === "h") { x.fillStyle = "rgba(0,0,0,.7)"; x.fillRect(bx, by + 9 * s, w, 3 * s); x.fillStyle = u.ultV >= 100 ? `rgba(255,170,60,${.7 + Math.sin(t * 6) * .3})` : "#b0702a"; x.fillRect(bx, by + 9 * s, w * u.ultV / 100, 3 * s); }
  // lien d'amitié / de rivalité avec le voisin (bonus actif) et duo compagnon/classe
  if (u.side === "h" && (u.bond || u.duo)) { const ix = bx + w + 8 * s, iy = by + 4 * s, col = u.bond === "rival" ? "#e05050" : u.bond === "ami" ? "#8ad06a" : "#e8c878"; x.fillStyle = "rgba(0,0,0,.8)"; x.beginPath(); x.arc(ix, iy, 6 * s, 0, 7); x.fill(); drawIcon(x, u.bond === "rival" ? "swords" : u.bond ? "heart" : "paw", ix, iy, .4 * s, col, 1.8);
    (CB.zones = CB.zones || []).push({ x0: ix - 7 * s, x1: ix + 7 * s, y0: iy - 7 * s, y1: iy + 7 * s, u, k: "bond" }); }
  // altérations
  const sts = []; const seen = {}; for (const st of u.st) if (!seen[st.k]) { seen[st.k] = 1; sts.push(st.k); }
  if (sts.length) (CB.zones = CB.zones || []).push({ x0: bx - 4, x1: bx + Math.min(7, sts.length) * 12 * s + 10 * s, y0: by + 10 * s, y1: by + 26 * s, u, k: "st" });
  sts.slice(0, 7).forEach((k, i) => { const ix = bx + i * 12 * s + 5 * s, iy = by + 18 * s; x.fillStyle = "rgba(0,0,0,.8)"; x.beginPath(); x.arc(ix, iy, 5.6 * s, 0, 7); x.fill(); drawIcon(x, ST_IC[k] || "star", ix, iy, .38 * s, ST_INFO[k].c, 1.8); });
  // rang
  x.font = `700 ${Math.round(9 * s)}px Cinzel, serif`; x.fillStyle = "rgba(232,200,120,.6)"; x.fillText(String(rankOf(B, u)), bx - 6 * s, by + 7 * s);
  // intention ennemie
  if (u.side === "e" && u.intent && u.intent.sk && !B.over) {
    const sk = u.intent.sk, tt = sk.t || "e";
    const kind = sk.heal || tt === "allies" ? ["heart", "#8fe07a"] : tt === "self" ? ["shield", "#a0c8ff"] : !sk.m ? ["curse", "#c090ff"] : tt === "ae" ? ["flames", "#ff8a4a"] : ["swords", "#ff5a4a"];
    const iy = Math.max(14 * s, (v.top != null ? v.top - 16 * s : v.y - 200 * CB.scale * (u.sz > 1 ? 1.5 : 1) - 8)) + Math.sin(t * 3) * 2; // au-dessus de la tête, jamais sur le corps
    x.fillStyle = "rgba(0,0,0,.75)"; x.beginPath(); x.arc(v.x, iy, 11 * s, 0, 7); x.fill(); x.strokeStyle = rgba(kind[1], .8); x.lineWidth = 1.5; x.stroke();
    drawIcon(x, kind[0], v.x, iy, .62 * s, kind[1], 2);
    (CB.zones = CB.zones || []).push({ x0: v.x - 16 * s, x1: v.x + 16 * s, y0: iy - 16 * s, y1: iy + 16 * s, u, k: "intent" });
    if (u.intent.tgt) { const tv = CB.vis[u.intent.tgt], tu = unitById(B, u.intent.tgt); if (tv && tu && alive(tu)) { x.fillStyle = rgba("#ff3a2a", .85); const ty = tv.top != null ? tv.top - 8 : tv.y - 192 * CB.scale - 6; x.beginPath(); x.moveTo(tv.x - 5, ty); x.lineTo(tv.x + 5, ty); x.lineTo(tv.x, ty + 7); x.fill(); } }
  }
}
function drawPetInCombat(x, t, dt) {
  const B = CB.B; const P = B.pet; const W = SC.w;
  const back = B.heroes[B.heroes.length - 1]; const bv = back ? CB.vis[back.uid] : null; if (!bv) return;
  const gapL = Math.min(SC.w / 10, CB.stageH * .27); // paysage/ordi : une demi-place derrière le dernier héros ; portrait : colonne réservée
  const px = CB.port ? Math.max(30 * CB.scale, CB.petX || 40) : Math.max(46 * CB.scale, Math.min(bv.x - gapL * .78, SC.w / 2 - gapL * 4.4)), py = CB.port ? CB.ground - 4 : CB.ground + 4;
  CB.petCache = CB.petCache && CB.petCache.k === P.id + P.evo + CB.scale + CB.port ? CB.petCache : { k: P.id + P.evo + CB.scale + CB.port, cv: petSprite(P.id, { evo: P.evo }, 0, (CB.port ? CB.hScale * .72 : CB.scale * .9)), cva: petSprite(P.id, { evo: P.evo, atk: 1 }, .3, (CB.port ? CB.hScale * .72 : CB.scale * .9)) };
  let atk = 0, lunge = 0; if (CB.petAct) { CB.petAct.t += dt * (CB.speed || 1); atk = CB.petAct.t < .5 ? 1 : 0; lunge = CB.petAct.t < .6 ? Math.sin(Math.PI * CB.petAct.t / .6) : 0; if (CB.petAct.t > 1) CB.petAct = null; }
  const cv = atk ? CB.petCache.cva : CB.petCache.cv;
  x.save(); x.translate(px + lunge * 150 * CB.scale, py + Math.sin(t * 2.5) * 1.5 - lunge * 18 * CB.scale); x.fillStyle = "rgba(0,0,0,.4)"; x.beginPath(); x.ellipse(0, 0, 34 * CB.scale, 6 * CB.scale, 0, 0, 7); x.fill(); x.drawImage(cv, -cv.ax, -cv.ay); x.restore();
  if (CB.petAct && CB.petAct.t < .9) { x.save(); x.font = "700 13px Cinzel, serif"; x.textAlign = "center"; x.lineWidth = 3; x.strokeStyle = "#000"; x.strokeText(CB.petAct.name, px, py - 90 * CB.scale); x.fillStyle = "#c8f0a0"; x.fillText(CB.petAct.name, px, py - 90 * CB.scale); x.restore(); }
}
