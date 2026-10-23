/* ═══════════════════════ Combat : scène, animations, commandes ═══════════════════════ */
const CB = { B: null, vis: {}, fx: [], txt: [], proj: [], shake: 0, flash: 0, banner: null, resolve: null, actor: null, sel: null, hoverU: null, speed: 1, auto: false, busy: false, barH: 150, zoom: 0 };
const wait = ms => new Promise(r => setTimeout(r, ms / (CB.speed || 1)));
const HPOSE = {
  idle: () => ({}),
  windup: st => ({ lean: -.08, aFs: st.aFs - .7, aFe: st.aFe + .5, wa: (st.wa || 2.5) + .6 }),
  strike: st => st.twoH && st.wa < 2 ? { lean: -.05, hx: -5 } : { lean: .32, hx: 8, lFh: .62, lFk: -.3, lBh: -.58, aFs: 1.55, aFe: .2, wa: 1.4 },
  cast: () => ({ aFs: 2.45, aFe: .3, aBs: 2.0, aBe: .5, wa: 3.1, lean: -.1, head: -.2, free: 1 }),
  buff: st => ({ aFs: 1.9, aFe: .9, wa: 3.0, lean: -.05, head: -.15 }),
  hurt: () => ({ lean: -.32, hx: -8, head: -.35, aFs: .1, aFe: .9, lFh: .22, lBh: -.22 }),
  agony: () => ({ lean: .55, hy: 22, lFh: 1.3, lFk: -2.3, lBh: -.2, lBk: -1.6, head: .45, aFs: .4, aFe: .2, aBs: .2, air: 0 }),
};
function heroPoseFor(u, key) { const C = CLASSES[u.cls]; const st = STANCE[C.wpn] || STANCE.masse; return (HPOSE[key] || HPOSE.idle)(st); }
function unitSprite(u, key) {
  const V = CB.vis[u.uid]; const sc = CB.scale * (u.side === "e" && (u.sz || 1) > 1 ? 1.0 : 1);
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
    CB.scale = Math.min(H * .44 / 200, gap / 84); CB.ground = gy;
    let r = 1; for (const u of B.heroes) { pos[u.uid] = [mid - gap * .85 - gap * (r - 1), gy]; r += 1; }
    r = 1; for (const u of B.enemies) { const s = u.sz || 1; pos[u.uid] = [mid + gap * .85 + gap * (r - 1 + (s - 1) / 2), gy]; r += s; }
  } else {
    const colW = W / 4.1, eY = H * .47, hY = H * .89;
    CB.scale = Math.min((hY - eY) * .68 / 200, colW / 82); CB.ground = hY;
    const cx = rk => W - colW * (rk - .5) - W * .012;
    let r = 1; for (const u of B.heroes) { pos[u.uid] = [cx(r), hY]; r++; }
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
  html: () => `<div class="ctop l" id="cb-tl"></div><div class="ctop" id="cb-tr"><button class="btn ghost sm" data-a="cbSpeed" title="Vitesse">${ico("speed")}<span id="cb-spd">×${CB.speed}</span></button><button class="btn ghost sm ${CB.auto ? "on" : ""}" data-a="cbAuto" title="Combat automatique">${ico("auto")}<span id="cb-auto">${CB.auto ? "Auto" : "Manuel"}</span></button><button class="btn ghost sm" data-a="cbFlee" id="cb-flee" title="Fuir">${ico("flee")}</button></div><div id="cbar"><div class="skdesc" id="cb-desc"></div><div class="skills" id="cb-skills"></div></div>`,
  mount: arg => startCombat(arg.node),
  leave: () => { CB.B = null; CB.resolve = null; },
  resize: () => { if (CB.B) { CB.barH = $("#cbar") ? $("#cbar").offsetHeight + 6 : 150; cbLayout(); } },
};
async function startCombat(node) {
  const run = S.run;
  const enc = genEncounter(run, node);
  const B = CB.B = battleFor(run, node, enc);
  CB.vis = {}; CB.fx = []; CB.txt = []; CB.proj = []; CB.node = node; CB.speed = S.opts.speed || 1; CB.auto = !!S.opts.auto; CB.banner = null;
  CB.barH = $("#cbar").offsetHeight + 6 || 150;
  cbLayout();
  SC.click = cbClick; SC.hover = cbHover;
  musicPlay(node.type === "boss" ? "boss" : "combat");
  for (const e of B.enemies) S.seen.monsters[e.key] = S.seen.monsters[e.key] || 0;
  $("#cb-flee").style.display = node.type === "boss" ? "none" : "";
  cbTopLeft(); cbBar(null);
  if (node.type === "boss") { const bs = B.enemies.find(e => e.boss); await showBanner(bs.name, "Gardien", "#ff4a3a", 1800); }
  else if (node.type === "elite") await showBanner("Élite", B.enemies.find(e => e.elite)?.name || "", "#ff8a4a", 1100);
  else await wait(500);
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
        if (a.flee) { const ok = chance(.75); if (ok) { await showBanner("Retraite !", "", "#c8b8a0", 800); return combatEnd("flee"); } ev = [{ k: "act", u: u.uid, sk: "Fuite ratée", anim: "move" }]; toast("La fuite échoue !", "bad"); }
        else if (a.potion) ev = usePotion(B, S.run, u, a.tgt);
        else if (a.move) ev = swapHero(B, u, a.move);
        else if (a.pass) ev = [{ k: "act", u: u.uid, sk: "Attend", anim: "idle" }];
        else { if (a.sk.isUlt) B.ults = (B.ults || 0) + 1; ev = act(B, u, a.sk, a.tgt); }
        cbBar(null);
        await playEvents(ev);
      }
      endTurn(B, u); CB.actor = null; cbTopLeft();
    }
    if (B.over || CB.B !== B) break;
    const ev = []; petAct(B, ev); if (ev.length) await playEvents(ev); checkEnd(B);
  }
  if (CB.B === B) combatEnd(B.over);
}
function autoChoice(u) {
  const B = CB.B; const run = S.run;
  const dying = B.heroes.find(h => alive(h) && h.agony);
  if (dying && run.potions > 0 && !B.heroes.some(h => h.role === "soin" && alive(h) && h !== dying)) return { potion: 1, tgt: dying };
  const a = heroAuto(B, u, "bal"); return a.move ? { move: a.move } : a;
}
// ── choix du joueur ──
function playerChoice(u) {
  return new Promise(res => {
    CB.resolve = res; CB.sel = null;
    cbBar(u);
    // présélection : première compétence utilisable
    const first = u.ultV >= 100 ? u.ult : u.skills.find(sk => canUse(CB.B, u, sk));
    if (first) selectSkill(first);
  });
}
function choose(a) { const r = CB.resolve; CB.resolve = null; CB.sel = null; if (r) r(a); }
function selectSkill(sk) {
  const B = CB.B, u = CB.actor; if (!u || !canUse(B, u, sk)) return;
  CB.sel = { sk, tg: validTargets(B, u, sk) };
  const t = sk.t || "e";
  $("#cb-desc").innerHTML = `<b class="gold">${sk.n}</b>${sk.isUlt ? ' <span class="tag" style="color:#ff9a4a">ULTIME</span>' : ""} ${sk.use ? rankPips(sk.use, t === "e" || t === "ae" ? sk.at : null) : ""}<br><span class="small">${skillText(sk)}</span><br><span class="tiny dim">${t === "e" || t === "a" ? "Touchez une cible en surbrillance." : "Touchez une cible en surbrillance (ou la compétence à nouveau) pour lancer."}</span>`;
  document.querySelectorAll("#cb-skills .sk").forEach(b => b.classList.toggle("on", b.dataset.v === sk.id));
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
ACT.cbFlee = () => { if (!CB.resolve) return toast("Attendez votre tour.", "bad"); confirmBox("Tenter de fuir ? (75 % de réussite, aucune récompense)", () => choose({ flee: 1 }), { yes: "Fuir" }); };
ACT.cbSpeed = () => { CB.speed = CB.speed >= 3 ? 1 : CB.speed + 1; S.opts.speed = CB.speed; $("#cb-spd").textContent = "×" + CB.speed; };
ACT.cbAuto = (v, el) => { CB.auto = !CB.auto; S.opts.auto = CB.auto ? 1 : 0; $("#cb-auto").textContent = CB.auto ? "Auto" : "Manuel"; el.classList.toggle("on", CB.auto); if (CB.auto && CB.resolve && CB.actor) choose(autoChoice(CB.actor)); };
function cbBar(u) {
  const box = $("#cb-skills"), d = $("#cb-desc"); if (!box) return;
  if (!u) { box.innerHTML = ""; d.innerHTML = CB.actor && CB.actor.side === "e" ? `<span class="bad">${esc(CB.actor.name)}</span> agit…` : '<span class="dim">…</span>'; return; }
  const B = CB.B, r = rankOf(B, u), n = B.heroes.length;
  const btn = (sk) => { const ok = canUse(B, u, sk); const cd = u.cds[sk.id] > 0 ? u.cds[sk.id] : 0; return `<button class="sk ${ok ? "" : "no"} ${sk.isUlt ? "ult" + (u.ultV >= 100 ? " ready" : "") : ""}" data-a="cbSk" data-v="${sk.id}">${ico(sk.ic, sk.isUlt ? "#ff9a4a" : ok ? "#e8d8b8" : "#6a5a4a")}<span>${sk.n}</span>${sk.rank > 1 ? `<span class="rk">${"I II III IV V".split(" ")[sk.rank - 1]}</span>` : ""}${cd ? `<span class="cd">${cd}</span>` : ""}${sk.isUlt && u.ultV < 100 ? `<span class="cd" style="font-size:13px">${Math.floor(u.ultV)} %</span>` : ""}</button>`; };
  box.innerHTML = u.skills.map(btn).join("") + btn(u.ult) +
    `<button class="sk ${S.run.potions ? "" : "no"}" data-a="cbPotion" data-v="potion">${ico("potion", "#e86a5a")}<span>Potion ×${S.run.potions}</span></button>` +
    `<button class="sk ${r >= n ? "no" : ""}" data-a="cbMove" data-v="1" title="Reculer">${ico("back", "#c8b8a0")}<span>Reculer</span></button>` +
    `<button class="sk ${r <= 1 ? "no" : ""}" data-a="cbMove" data-v="-1" title="Avancer">${ico("charge", "#c8b8a0")}<span>Avancer</span></button>` +
    `<button class="sk" data-a="cbPass" title="Passer">${ico("skip", "#9a8c7a")}<span>Passer</span></button>`;
  d.innerHTML = `<b>${esc(u.name)}</b> <span class="dim small">${CLASSES[u.cls].n} · rang ${r}</span>`;
  void n;
  CB.barH = $("#cbar").offsetHeight + 6; cbLayout();
}
function cbTopLeft() {
  const B = CB.B, el = $("#cb-tl"); if (!el || !B) return;
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
  const u = unitAt(px, py);
  if (!CB.resolve || !CB.sel) { if (u) showUnitInfo(u); return; }
  if (!u) return;
  if (!CB.sel.tg.includes(u)) { showUnitInfo(u); return; }
  if (CB.sel.potion) return choose({ potion: 1, tgt: u });
  choose({ sk: CB.sel.sk, tgt: u });
}
function showUnitInfo(u) {
  const st = u.st.map(s => `<span class="tag" data-tip="${s.k}" style="color:${ST_INFO[s.k].c}">${ST_INFO[s.k].n}${s.t < 50 ? " " + s.t : ""}</span>`).join(" ");
  let txt = `<b>${esc(u.name)}</b> ${u.side === "e" ? `<span class="tiny dim">niv ${u.lvl}${u.tags.includes("impie") ? " · impie" : ""}</span>` : ""}<br><span class="small">PV ${Math.ceil(u.hp)}/${u.hpMax} · Prot ${Math.round(effProt(u) * 100)} % · Vit ${effSpd(u)} · Esq ${Math.round(effDodge(u))}</span>${st ? "<br>" + st : ""}`;
  if (u.side === "e" && u.intent && u.intent.sk) txt += `<br><span class="small bad">Intention : ${u.intent.sk.n}</span>`;
  toast(txt);
}
// ── lecture des événements ──
function V(id) { return CB.vis[id]; }
function U(id) { return unitById(CB.B, id) || CB.B.fallen.find(f => f.uid === id) || (CB.B.dead || []).find(d => d.uid === id); }
function popText(id, text, col, big) { const v = V(id); if (!v) return; CB.txt.push({ x: v.x + (Math.random() - .5) * 20, y: v.y - 170 * CB.scale * (U(id) && U(id).sz > 1 ? 1.4 : 1), text, col, big, t: 0, life: big ? 1.4 : 1.1 }); }
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
    const e = ev[i]; if (!CB.B) return;
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
          v.off = dx; v.offy = dy; v.pose = "strike"; v.pt = .5; sfx(u.side === "e" && (u.sz || 1) > 1 ? "heavy" : "slash"); CB.shake = .15;
          await wait(120);
        } else if (e.anim === "shoot") {
          v.pose = u.side === "h" ? "strike" : "strike"; v.pt = .45; sfx("shoot");
          for (const t of targetsAfter(ev, i)) projectile(v, V(t), "bolt", srcCol);
          await wait(220);
        } else if (e.anim === "cast") {
          v.pose = u.side === "h" ? "cast" : "strike"; v.pt = .6; sfx(/feu|flamme|Météore|Embras|Combust|Bûcher/i.test(e.sk) ? "fire" : u.side === "h" && ["pretresse", "templier", "exorciste", "chasseur_sorcieres"].includes(u.cls) ? "holy" : "dark");
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
        v.pose = "hurt"; v.pt = .35; v.flash = 1; v.kick = (u && u.side === "h" ? -1 : 1) * 14;
        burst(v.x, v.y - 100 * CB.scale, srcCol === "#e8e0c8" ? "#d02a2a" : srcCol, e.crit ? 26 : 12, { sp: e.crit ? 260 : 170 });
        if (u && !u.tags.includes("impie") || (u && u.side === "h")) burst(v.x, v.y - 100 * CB.scale, "#8a0a0a", 6, { add: false, g: 500 });
        popText(e.u, (e.crit ? "" : "") + e.dmg, e.crit ? "#ffd04a" : "#ff6a5a", e.crit);
        if (e.crit) { CB.shake = .35; sfx("crit"); popText(e.u, "CRITIQUE", "#ffd04a"); } else sfx("hit");
        await wait(e.crit ? 220 : 130);
        break;
      }
      case "miss": popText(e.u, "Esquive", "#c8c8d8"); sfx("miss"); { const v = V(e.u); if (v) v.kick = (U(e.u) && U(e.u).side === "h" ? -1 : 1) * 22; } await wait(120); break;
      case "absorb": popText(e.u, "Bloqué " + e.v, "#a0c8ff"); await wait(60); break;
      case "dot": { const v = V(e.u); popText(e.u, "-" + e.dmg, ST_INFO[e.st].c); if (v) { v.flash = .6; burst(v.x, v.y - 90 * CB.scale, ST_INFO[e.st].c, 8, { up: 120, g: -40 }); } sfx(e.st === "burn" ? "fire" : e.st === "poison" ? "poison" : "hit"); await wait(260); break; }
      case "heal": if (e.v > 0) { popText(e.u, "+" + e.v, "#8fe07a"); const v = V(e.u); if (v) burst(v.x, v.y - 80 * CB.scale, "#8fe07a", e.regen ? 5 : 10, { up: 90, g: -60, sp: 60 }); } await wait(e.regen ? 200 : 90); break;
      case "st": { const u = U(e.u); if (!u) break; const neg = NEG.has(e.st); popText(e.u, ST_INFO[e.st].n, ST_INFO[e.st].c); if (neg && e.st !== "mark") sfx("debuff"); await wait(70); break; }
      case "resist": popText(e.u, "Résiste", "#d8d0c0"); await wait(60); break;
      case "stunned": popText(e.u, "Étourdi", "#ffd84a"); await wait(320); break;
      case "cleanse": popText(e.u, "Purifié", "#e8f0ff"); break;
      case "guard": popText(e.u, "Protège !", "#c0d0e0"); await wait(120); break;
      case "riposte": popText(e.u, "Riposte !", "#e0c080"); { const v = V(e.u); if (v) { v.pose = "strike"; v.pt = .35; v.off = (U(e.u).side === "h" ? 30 : -30); } } sfx("slash"); await wait(150); break;
      case "thorns": popText(e.u, "Épines", "#e07a3a"); break;
      case "detonate": { const v = V(e.u); if (v) { burst(v.x, v.y - 90 * CB.scale, ST_INFO[e.st].c, 30, { sp: 280 }); CB.shake = .3; } sfx("crit"); await wait(150); break; }
      case "agony": popText(e.u, "À L'AGONIE", "#ff3a2a", true); sfx("fall"); CB.shake = .25; await wait(450); break;
      case "saved": popText(e.u, "Sauvé !", "#8fe07a"); break;
      case "resist_death": popText(e.u, "Tient bon !", "#ffd27a", true); await wait(380); break;
      case "cheat": popText(e.u, "Défie la mort !", "#ffd27a", true); await wait(380); break;
      case "fall": { popText(e.u, "TOMBÉ", "#ff3a2a", true); sfx("fall"); const v = V(e.u); if (v) v.dying = 1; CB.shake = .3; await wait(700); cbLayout(); break; }
      case "revive": { popText(e.u, "Se relève !", "#ffe08a", true); sfx("holy"); cbLayout(); const v = V(e.u); if (v) { v.dying = 0; v.a = 1; glowAt(v, "#ffe08a", 1.5); } await wait(400); break; }
      case "die": { const v = V(e.u); if (v) { v.dying = 1; burst(v.x, v.y - 80 * CB.scale, "#2a1a1a", 20, { add: false, g: 200 }); burst(v.x, v.y - 80 * CB.scale, "#ffb070", 10, { up: 140, g: -30 }); } sfx("die"); await wait(e.boss ? 900 : 380); cbLayout(); break; }
      case "move": cbLayout(); sfx("step"); await wait(200); break;
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
  if (over === "flee") { node.done = 1; save(); go("map"); return; }
  if (over === "win") {
    await new Promise(r => setTimeout(r, 300));
    const R = rewardFor(run, node.ambush ? { c: node.c, type: "combat" } : node);
    const ups = grantReward(run, R);
    node.done = 1; save();
    sfx("win");
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
    rewardModal(node.type === "elite" ? "Élite vaincue" : "Victoire", "", R, ups);
    return;
  }
  // défaite
  save();
  await new Promise(r => setTimeout(r, 600));
  finishRun("wipe");
}
function rewardHTML(R) { return `${R.gold ? `<div class="reward">${ico("coin", "#e8c060", 22)}<b>+${R.gold} or</b></div>` : ""}${(R.loot || []).map(i => `<div class="reward" style="align-items:flex-start">${slotHTML(i, "itemInfo", i.id)}<div style="flex:1;min-width:0"><b class="rar${i.rar}">${gearName(i)}</b><div class="tiny dim">${i.cls ? CLASSES[i.cls].n + " — " : ""}${itemLine(i)}</div>${runEquipBtns(i)}</div></div>`).join("")}${R.relic ? `<div class="reward">${ico("gem", "#c87aff", 22)}<b>${RELICS[R.relic].n}</b> <span class="tiny">${gl(RELICS[R.relic].d)}</span></div>` : ""}${R.shards ? `<div class="reward">${ico("shard", "#c090ff", 22)}<b>+${R.shards} éclats</b></div>` : ""}`; }
ACT.abyssUp = () => { closeModal(); finishRun("victory"); };
ACT.abyssDown = () => { const run = S.run; run.floor++; run.map = genMap(RNG, 6, { elite: run.oaths.includes("elite") }); run.pos = null; run.light = clamp(run.light + 30, 0, 100); S.abyss.best = Math.max(S.abyss.best, run.floor - 1); save(); closeModal(); go("map"); toast(`Profondeur ${run.floor}…`, "epic"); };
// ── dessin ──
function drawCombat(x, t, dt) {
  const B = CB.B, run = S.run;
  const W = SC.w, H = SC.h;
  let sx = 0, sy = 0; if (CB.shake > 0) { CB.shake -= dt; sx = (Math.random() - .5) * 14 * CB.shake; sy = (Math.random() - .5) * 10 * CB.shake; }
  x.save(); x.translate(sx, sy);
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
    x.save(); x.globalAlpha = v.a;
    const br = pose === "idle" ? 1 + Math.sin(t * 2.2 + (u.uid.length * 1.7)) * .012 : 1;
    x.translate(px, py); if (u.side === "e") x.scale(-1, 1);
    if (u.side === "e" && (MONSTERS[u.key].art === "spectre" || MONSTERS[u.key].art === "follet" || MONSTERS[u.key].art === "oeil" || MONSTERS[u.key].art === "liche" || MONSTERS[u.key].art === "mere_noyes")) x.translate(0, Math.sin(t * 2 + px) * 4);
    x.scale(1, br);
    x.drawImage(sp, -sp.ax, -sp.ay);
    if (v.flash > 0) { x.globalCompositeOperation = "lighter"; x.globalAlpha = v.flash * .7 * v.a; x.drawImage(sp, -sp.ax, -sp.ay); }
    if (u.agony) { x.globalCompositeOperation = "source-atop"; }
    x.restore();
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
    f.vy += f.g * dt; f.x += f.vx * dt; f.y += f.vy * dt;
    x.globalCompositeOperation = f.add ? "lighter" : "source-over";
    if (f.add) glow(x, f.x, f.y, f.r * 3, f.col, .8 * (1 - k)); else { x.fillStyle = rgba(f.col, 1 - k); x.fillRect(f.x, f.y, f.r * 1.5, f.r * 1.5); }
  }
  x.restore(); CB.fx = CB.fx.filter(f => !f.done);
  // textes flottants
  for (const tx2 of CB.txt) {
    tx2.t += dt; const k = tx2.t / tx2.life; if (k >= 1) { tx2.done = 1; continue; }
    const sc = tx2.big ? 1.4 : 1, yy = tx2.y - easeOut(k) * 50, a = k < .8 ? 1 : (1 - k) * 5;
    x.save(); x.globalAlpha = a; x.font = `${tx2.big ? 900 : 700} ${Math.round((16 + (/^\d+$/.test(tx2.text) ? 6 : 0)) * sc * Math.max(.8, Math.min(1.3, CB.scale * 1.5)))}px Cinzel, serif`; x.textAlign = "center";
    x.lineWidth = 4; x.strokeStyle = "#000"; x.strokeText(tx2.text, tx2.x, yy); x.fillStyle = tx2.col; x.fillText(tx2.text, tx2.x, yy); x.restore();
  }
  CB.txt = CB.txt.filter(t2 => !t2.done);
  x.restore();
  // éclair d'écran, bandeau
  if (CB.flash > 0) { x.fillStyle = `rgba(255,240,220,${CB.flash * .35})`; x.fillRect(0, 0, W, H); CB.flash -= dt * 2; }
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
function drawIcon(x, name, cx, cy, s, col, lw = 2) { const p = new Path2D(IC[name] || IC.star); x.save(); x.translate(cx - 12 * s, cy - 12 * s); x.scale(s, s); x.strokeStyle = col; x.lineWidth = lw / s * s; x.lineCap = "round"; x.lineJoin = "round"; x.stroke(p); x.restore(); }
function drawUnitUI(x, u, v, t) {
  const B = CB.B, s = Math.max(.75, Math.min(1.25, CB.scale * 1.6)), w = 64 * s * (u.sz > 1 ? 1.5 : 1), bx = v.x - w / 2, by = v.y + 8 * s;
  // barre de PV
  x.fillStyle = "rgba(0,0,0,.75)"; x.fillRect(bx - 1, by - 1, w + 2, 8 * s + 2);
  const hpk = clamp(u.hp / u.hpMax, 0, 1); v.hp = v.hp == null ? hpk : v.hp + (hpk - v.hp) * .12;
  x.fillStyle = "#5a1410"; x.fillRect(bx, by, w * v.hp, 8 * s);
  x.fillStyle = u.side === "h" ? lgrad(x, 0, by, 0, by + 8 * s, [[0, "#e04a3a"], [1, "#8a1a10"]]) : lgrad(x, 0, by, 0, by + 8 * s, [[0, "#c03a3a"], [1, "#6a1010"]]); x.fillRect(bx, by, w * hpk, 8 * s);
  const sh = stSum(u, "shield"); if (sh > 0) { x.fillStyle = "rgba(140,190,255,.7)"; x.fillRect(bx, by, w * clamp(sh / u.hpMax, 0, 1), 3 * s); }
  x.font = `700 ${Math.round(9.5 * s)}px Alegreya, serif`; x.textAlign = "center"; x.fillStyle = "#fff"; x.lineWidth = 3; x.strokeStyle = "#000"; const ht = u.agony ? "AGONIE" : Math.ceil(u.hp) + "/" + u.hpMax; x.strokeText(ht, v.x, by + 7.5 * s); x.fillStyle = u.agony ? "#ff6a5a" : "#f0e8e0"; x.fillText(ht, v.x, by + 7.5 * s);
  if (u.agony) { const pk = .5 + Math.sin(t * 5) * .5; glow(x, v.x, v.y - 60 * CB.scale, 60 * CB.scale, "#ff2a1a", .2 + pk * .2); }
  // ultime (héros)
  if (u.side === "h") { x.fillStyle = "rgba(0,0,0,.7)"; x.fillRect(bx, by + 9 * s, w, 3 * s); x.fillStyle = u.ultV >= 100 ? `rgba(255,170,60,${.7 + Math.sin(t * 6) * .3})` : "#b0702a"; x.fillRect(bx, by + 9 * s, w * u.ultV / 100, 3 * s); }
  // altérations
  const sts = []; const seen = {}; for (const st of u.st) if (!seen[st.k]) { seen[st.k] = 1; sts.push(st.k); }
  sts.slice(0, 7).forEach((k, i) => { const ix = bx + i * 12 * s + 5 * s, iy = by + 18 * s; x.fillStyle = "rgba(0,0,0,.8)"; x.beginPath(); x.arc(ix, iy, 5.6 * s, 0, 7); x.fill(); drawIcon(x, ST_IC[k] || "star", ix, iy, .38 * s, ST_INFO[k].c, 1.8); });
  // rang
  x.font = `700 ${Math.round(9 * s)}px Cinzel, serif`; x.fillStyle = "rgba(232,200,120,.6)"; x.fillText(String(rankOf(B, u)), bx - 6 * s, by + 7 * s);
  // intention ennemie
  if (u.side === "e" && u.intent && u.intent.sk && !B.over) {
    const sk = u.intent.sk, tt = sk.t || "e";
    const kind = sk.heal || tt === "allies" ? ["heart", "#8fe07a"] : tt === "self" ? ["shield", "#a0c8ff"] : !sk.m ? ["curse", "#c090ff"] : tt === "ae" ? ["flames", "#ff8a4a"] : ["swords", "#ff5a4a"];
    const iy = v.y - 200 * CB.scale * (u.sz > 1 ? 1.5 : 1) - 8 + Math.sin(t * 3) * 2;
    x.fillStyle = "rgba(0,0,0,.75)"; x.beginPath(); x.arc(v.x, iy, 11 * s, 0, 7); x.fill(); x.strokeStyle = rgba(kind[1], .8); x.lineWidth = 1.5; x.stroke();
    drawIcon(x, kind[0], v.x, iy, .62 * s, kind[1], 2);
    if (u.intent.tgt) { const tv = CB.vis[u.intent.tgt], tu = unitById(B, u.intent.tgt); if (tv && tu && alive(tu)) { x.fillStyle = rgba("#ff3a2a", .85); const ty = tv.y - 192 * CB.scale - 6; x.beginPath(); x.moveTo(tv.x - 5, ty); x.lineTo(tv.x + 5, ty); x.lineTo(tv.x, ty + 7); x.fill(); } }
  }
}
function drawPetInCombat(x, t, dt) {
  const B = CB.B; const P = B.pet; const W = SC.w;
  const back = B.heroes[B.heroes.length - 1]; const bv = back ? CB.vis[back.uid] : null; if (!bv) return;
  const px = CB.port ? Math.max(36 * CB.scale, bv.x - 60 * CB.scale) : Math.max(50 * CB.scale, bv.x - 75 * CB.scale), py = CB.port ? CB.ground - 6 : bv.y + 6;
  CB.petCache = CB.petCache && CB.petCache.k === P.id + P.evo + CB.scale ? CB.petCache : { k: P.id + P.evo + CB.scale, cv: petSprite(P.id, { evo: P.evo }, 0, CB.scale * .95), cva: petSprite(P.id, { evo: P.evo, atk: 1 }, .3, CB.scale * .95) };
  let atk = 0; if (CB.petAct) { CB.petAct.t += dt * (CB.speed || 1); atk = CB.petAct.t < .5 ? 1 : 0; if (CB.petAct.t > 1) CB.petAct = null; }
  const cv = atk ? CB.petCache.cva : CB.petCache.cv;
  x.save(); x.translate(px + (atk ? 30 * CB.scale : 0), py + Math.sin(t * 2.5) * 1.5); x.fillStyle = "rgba(0,0,0,.4)"; x.beginPath(); x.ellipse(0, 0, 34 * CB.scale, 6 * CB.scale, 0, 0, 7); x.fill(); x.drawImage(cv, -cv.ax, -cv.ay); x.restore();
  if (CB.petAct && CB.petAct.t < .9) { x.save(); x.font = "700 13px Cinzel, serif"; x.textAlign = "center"; x.lineWidth = 3; x.strokeStyle = "#000"; x.strokeText(CB.petAct.name, px, py - 90 * CB.scale); x.fillStyle = "#c8f0a0"; x.fillText(CB.petAct.name, px, py - 90 * CB.scale); x.restore(); }
}
