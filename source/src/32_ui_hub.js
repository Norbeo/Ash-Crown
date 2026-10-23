/* ═══════════════════════ Le Bastion : bâtiments et gestion ═══════════════════════ */
function hubLayout(w, h) {
  const port = w < h * .9, s = port ? Math.min(w / 4.2, h / 8) : Math.min(w / 8.5, h / 5.2);
  const P = (k, fx, fy, k2 = 1) => ({ k, x: fx * w, y: fy * h, s: s * k2 });
  return port ? [P("academie", .26, .36, .8), P("menagerie", .74, .36, .8), P("chapelle", .2, .56, .9), P("fonderie", .8, .56, .9), P("taverne", .2, .78), P("porte", .5, .74, 1.1), P("forge", .8, .78)]
    : [P("academie", .33, .6, .78), P("menagerie", .67, .6, .78), P("chapelle", .1, .8), P("taverne", .27, .82), P("porte", .5, .78, 1.15), P("forge", .73, .82), P("fonderie", .9, .8)];
}
function drawBuilding(x, k, bx, by, s, lvl, t) {
  x.save(); x.translate(bx, by); const u = s / 100; x.scale(u, u);
  const win = (wx, wy, ww, wh, col = "#ffb050") => { const f = .75 + Math.sin(t * 3 + wx) * .1; glow(x, wx + ww / 2, wy + wh / 2, ww * 2.2, col, .35 * f); x.fillStyle = col; x.fillRect(wx, wy, ww, wh); x.strokeStyle = INK; x.lineWidth = 2; x.strokeRect(wx, wy, ww, wh); x.beginPath(); x.moveTo(wx + ww / 2, wy); x.lineTo(wx + ww / 2, wy + wh); x.stroke(); };
  const stone = "#1e1a1e", wood = "#22160e", roof = "#120c0e";
  const bricks = (x0, y0, x1, y1) => { x.save(); x.beginPath(); x.rect(x0, y0, x1 - x0, y1 - y0); x.clip(); x.strokeStyle = "rgba(0,0,0,.55)"; x.lineWidth = 1.2; for (let yy = y0, r = 0; yy < y1; yy += 9, r++) { x.beginPath(); x.moveTo(x0, yy); x.lineTo(x1, yy); x.stroke(); for (let xx = x0 + (r % 2) * 8; xx < x1; xx += 16) { x.beginPath(); x.moveTo(xx, yy); x.lineTo(xx, yy + 9); x.stroke(); } } x.fillStyle = lgrad(x, 0, y0, 0, y1, [[0, "rgba(0,0,0,.35)"], [1, "rgba(255,140,60,.08)"]]); x.fillRect(x0, y0, x1 - x0, y1 - y0); x.restore(); };
  const lv = lvl || 1;
  switch (k) {
    case "taverne": {
      shade(x, poly([[-50, 0], [-50, -70], [50, -70], [50, 0]]), wood, { d: 4 });
      for (let i = 0; i < 4; i++) line(x, [[-50 + i * 33, -70], [-50 + i * 33, 0]], 3, "#140c08");
      line(x, [[-50, -40], [50, -40]], 3, "#140c08");
      shade(x, poly([[-62, -68], [0, -120], [62, -68]]), roof, { d: 5 });
      shade(x, poly([[24, -105], [24, -130], [36, -130], [36, -95]]), stone, { d: 2 });
      for (let i = 0; i < 3; i++) { const k2 = (t * .3 + i / 3) % 1; x.fillStyle = rgba("#8a8080", .25 * (1 - k2)); x.beginPath(); x.arc(30 + Math.sin(t + i) * 6, -134 - k2 * 50, 6 + k2 * 10, 0, 7); x.fill(); }
      win(-38, -60, 18, 16); win(20, -60, 18, 16); if (lv >= 3) win(-9, -100, 18, 14);
      shade(x, poly([[-12, 0], [-12, -30], [12, -30], [12, 0]]), "#1a0e08", { d: 2 });
      line(x, [[50, -50], [70, -50]], 3, INK); shade(x, poly([[60, -50], [78, -50], [78, -30], [60, -30]]), "#4a3424", { d: 1.5 }); x.save(); x.translate(69, -40); x.scale(.5, .5); x.strokeStyle = "#e8c070"; x.lineWidth = 3; x.strokeRect(-8, -10, 12, 18); x.beginPath(); x.arc(6, -1, 5, -1.4, 1.4); x.stroke(); x.restore();
      break;
    }
    case "forge": {
      shade(x, poly([[-55, 0], [-55, -60], [55, -60], [55, 0]]), stone, { d: 4 }); bricks(-55, -60, 55, 0);
      shade(x, poly([[-62, -58], [-10, -100], [40, -100], [62, -58]]), roof, { d: 4 });
      shade(x, poly([[18, -90], [18, -150], [40, -150], [40, -90]]), "#221e20", { d: 3 });
      x.save(); x.globalCompositeOperation = "lighter"; for (let i = 0; i < 8; i++) { const k2 = (t * .6 + i / 8) % 1; glow(x, 29 + Math.sin(t * 3 + i) * 8, -152 - k2 * 70, 4, "#ff8a3a", (1 - k2) * .9); } x.restore();
      const fl = .8 + Math.sin(t * 9) * .1 + Math.sin(t * 13) * .08;
      glow(x, -15, -24, 60, "#ff6a1a", .5 * fl); shade(x, P([[-38, 0, 1], [-38, -30], [-15, -48], [8, -30], [8, 0, 1]], true, .5), "#3a1408", { ol: 3, d: 2 }); x.save(); x.globalCompositeOperation = "lighter"; for (let i = 0; i < 5; i++) glow(x, -15 + Math.sin(t * 7 + i) * 6, -8 - i * 6, 18 - i * 2, i < 2 ? "#fff0a0" : "#ff7a2a", .75 * fl); x.restore();
      x.fillStyle = rgba("#fff0a0", .6 * fl); x.beginPath(); x.ellipse(-15, -12, 10, 8, 0, 0, 7); x.fill();
      shade(x, poly([[20, -20], [48, -20], [44, -12], [36, -12], [36, 0], [30, 0], [30, -12], [24, -12]]), "#4a4448", { d: 1.5 });
      if (lv >= 3) win(30, -50, 14, 12, "#ff9a4a");
      break;
    }
    case "chapelle": {
      shade(x, poly([[-40, 0], [-40, -70], [40, -70], [40, 0]]), "#221e22", { d: 4 }); bricks(-40, -70, 40, 0);
      shade(x, poly([[-46, -68], [0, -112], [46, -68]]), roof, { d: 4 });
      shade(x, poly([[-14, -100], [-14, -150], [14, -150], [14, -100]]), "#1e1a1e", { d: 3 }); bricks(-14, -150, 14, -100); shade(x, poly([[-18, -148], [0, -185], [18, -148]]), roof, { d: 3 });
      line(x, [[0, -185], [0, -200]], 3, MAT.gold); line(x, [[-6, -195], [6, -195]], 3, MAT.gold);
      const rc = lv >= 3 ? "#ffd27a" : "#c8a060"; glow(x, 0, -55, 40, rc, .35); shade(x, circ(0, -55, 14), rc, { ol: 2.5, d: 2 });
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; line(x, [[0, -55], [Math.cos(a) * 13, -55 + Math.sin(a) * 13]], 1.5, INK); }
      shade(x, P([[-10, 0, 1], [-10, -22], [0, -32], [10, -22], [10, 0, 1]], true, .5), "#140e0c", { d: 2 });
      if (lv >= 2) for (const dx of [-30, 30]) candle(x, dx, 0, 1.4);
      break;
    }
    case "academie": {
      shade(x, poly([[-30, 0], [-30, -150], [30, -150], [30, 0]]), "#1c1820", { d: 5 }); bricks(-30, -150, 30, 0);
      shade(x, poly([[-38, -148], [0, -200], [38, -148]]), roof, { d: 4 });
      for (let i = 0; i < 3; i++) win(-8, -130 + i * 38, 16, 22, lv > i ? "#9ab8ff" : "#3a3a44");
      shade(x, poly([[-50, 0], [-50, -40], [-30, -40], [-30, 0]]), "#221e24", { d: 2 }); shade(x, poly([[30, 0], [30, -40], [50, -40], [50, 0]]), "#221e24", { d: 2 });
      if (lv >= 4) { glow(x, 0, -205, 30, "#9ab8ff", .5); }
      break;
    }
    case "menagerie": {
      shade(x, poly([[-60, 0], [-60, -50], [60, -50], [60, 0]]), "#241810", { d: 4 }); for (let i = 0; i < 8; i++) line(x, [[-60 + i * 15, -50], [-60 + i * 15, 0]], 1.4, "rgba(0,0,0,.5)");
      shade(x, poly([[-70, -48], [0, -95], [70, -48]]), "#1e1410", { d: 4 });
      shade(x, P([[-16, 0, 1], [-16, -30], [0, -40], [16, -30], [16, 0, 1]], true, .5), "#120c08", { d: 2 });
      for (let i = 0; i < 6; i++) { line(x, [[-90 + i * 8, 0], [-90 + i * 8, -22]], 3, "#3a2a1a"); } line(x, [[-92, -16], [-50, -16]], 3, "#3a2a1a");
      win(-44, -38, 14, 12); win(30, -38, 14, 12);
      x.save(); x.translate(0, -70); x.scale(.9, .9); x.fillStyle = "#c8a060"; x.beginPath(); x.arc(0, 4, 6, 0, 7); x.fill(); for (const [dx, dy] of [[-8, -4], [-3, -9], [3, -9], [8, -4]]) { x.beginPath(); x.arc(dx, dy, 2.6, 0, 7); x.fill(); } x.restore();
      break;
    }
    case "fonderie": {
      shade(x, poly([[-40, 0], [-34, -120], [34, -120], [40, 0]]), "#1e1a1c", { d: 5 }); bricks(-40, -120, 40, 0);
      for (let i = 0; i < 4; i++) line(x, [[-38 + i, -30 * i], [38 - i, -30 * i]], 2, rgba(INK, .6));
      const fl = .75 + Math.sin(t * 4) * .15;
      glow(x, 0, -70, 60 + lv * 6, "#9ad06a", .35 * fl);
      shade(x, P([[-16, -40], [-16, -80], [0, -96], [16, -80], [16, -40]], true, .5), "#2a3a1a", { ol: 2.5, d: 2 }); x.save(); x.globalCompositeOperation = "lighter"; for (let i = 0; i < 6; i++) glow(x, Math.sin(t * 4 + i) * 5, -48 - i * 7 - Math.abs(Math.sin(t * 3 + i)) * 5, 16 - i * 1.5, i < 2 ? "#f0ffc0" : "#8ad04a", .7); x.restore();
      x.save(); x.globalCompositeOperation = "lighter"; for (let i = 0; i < 6; i++) { const k2 = (t * .5 + i / 6) % 1; glow(x, Math.sin(t * 2 + i) * 10, -125 - k2 * 60, 5, "#c8f07a", (1 - k2) * .8); } x.restore();
      break;
    }
    case "porte": {
      shade(x, poly([[-80, 0], [-80, -150], [-44, -150], [-44, 0]]), stone, { d: 5 }); shade(x, poly([[44, 0], [44, -150], [80, -150], [80, 0]]), stone, { d: 5 }); bricks(-80, -150, -44, 0); bricks(44, -150, 80, 0);
      for (const dx of [-80, 44]) for (let i = 0; i < 3; i++) shade(x, poly([[dx + i * 13, -150], [dx + i * 13, -164], [dx + i * 13 + 9, -164], [dx + i * 13 + 9, -150]]), stone, { d: 1.5 });
      shade(x, P([[-44, 0, 1], [-44, -96], [0, -132], [44, -96], [44, 0, 1]], true, .5), "#0a0608", { d: 0, flat: true });
      const g = x.createLinearGradient(0, -130, 0, 0); g.addColorStop(0, "rgba(255,120,40,.0)"); g.addColorStop(1, "rgba(255,120,40,.25)"); x.fillStyle = g; x.fill(P([[-44, 0, 1], [-44, -96], [0, -132], [44, -96], [44, 0, 1]], true, .5));
      const lift = 30 + Math.sin(t * .6) * 4;
      x.save(); x.clip(P([[-44, 0, 1], [-44, -96], [0, -132], [44, -96], [44, 0, 1]], true, .5));
      for (let i = -4; i <= 4; i++) line(x, [[i * 10, -140], [i * 10, -lift]], 3, "#3a3436"); for (let j = 0; j < 8; j++) line(x, [[-44, -lift - j * 14], [44, -lift - j * 14]], 3, "#3a3436");
      x.restore();
      for (const dx of [-62, 62]) { const f = .8 + Math.sin(t * 8 + dx) * .15; glow(x, dx, -110, 40, "#ff8a3a", .55 * f); shade(x, poly([[dx - 3, -96], [dx + 3, -96], [dx + 4, -110], [dx - 4, -110]]), "#3a2a1a", { d: 1 }); x.save(); x.globalCompositeOperation = "lighter"; glow(x, dx, -118, 10, "#ffd08a", .9 * f); x.restore(); }
      banner(x, -76, -146, 26, 70, "#5a0e08", t); banner(x, 50, -146, 26, 70, "#5a0e08", t + 1);
      break;
    }
  }
  x.restore();
}
SCREENS.bastion = {
  title: "Le Bastion", tab: "bastion",
  scene: () => (x, t, dt) => {
    backdrop("bastion", { align: .9 })(x, t, dt);
    const L = hubLayout(SC.w, SC.h);
    // sol de la cour
    x.fillStyle = lgrad(x, 0, SC.h * .5, 0, SC.h, [[0, "rgba(10,8,10,0)"], [1, "rgba(10,8,10,.6)"]]); x.fillRect(0, SC.h * .5, SC.w, SC.h);
    for (const b of L) { x.fillStyle = "rgba(0,0,0,.45)"; x.beginPath(); x.ellipse(b.x, b.y, b.s * .75, b.s * .1, 0, 0, 7); x.fill(); drawBuilding(x, b.k, b.x, b.y, b.s, b.k === "porte" ? 1 : S.bld[b.k], t); }
    // feu de camp central
    const fx = SC.w * .5, fy = SC.h * (SC.w < SC.h * .9 ? .88 : .93); const f = .8 + Math.sin(t * 9) * .1;
    glow(x, fx, fy, 90, "#ff6a1a", .35 * f); x.save(); x.globalCompositeOperation = "lighter"; for (let i = 0; i < 5; i++) glow(x, fx + Math.sin(t * 5 + i) * 4, fy - 8 - i * 6, 14 - i * 2, i < 2 ? "#ffe08a" : "#ff7a2a", .7); x.restore();
  },
  html: () => {
    const L = hubLayout(SC.w || innerWidth, SC.h || innerHeight);
    const names = { porte: "La Porte", ...Object.fromEntries(Object.keys(BUILDINGS).map(k => [k, BUILDINGS[k].n])) };
    const note = k => (k === "taverne" && S.heroes.length < 4) || (k === "fonderie" && idleBank() >= fonderieRate()) || (k === "academie" && S.heroes.some(h => h.lvl >= EVO_LVL && !h.evo)) || (k === "chapelle" && S.heroes.some(isInjured));
    const ct = S.daily.contracts || [];
    const off = $("#view") ? $("#view").getBoundingClientRect().top : 0;
    if (UI.hideDaily == null) UI.hideDaily = (SC.w || innerWidth) < (SC.h || innerHeight);
    return `${L.map(b => { const hh = b.s * (b.k === "porte" ? 1.62 : b.k === "academie" ? 2.0 : b.k === "chapelle" ? 1.9 : 1.3); return `<button class="hot" style="left:${b.x}px;top:${b.y - off - hh}px;width:${b.s * 1.3}px;height:${hh}px" data-a="bld" data-v="${b.k}"><span class="lbl">${note(b.k) ? '<i class="dotn"></i>' : ""}${names[b.k]}${b.k !== "porte" ? ` <b>${"I II III IV V".split(" ")[S.bld[b.k] - 1]}</b>` : ""}</span></button>`; }).join("")}
    <div class="panel" style="position:absolute;left:10px;top:6px;width:min(300px,calc(100vw - 20px));padding:10px 12px" id="dailyp">
      <div class="row sp"><h3 style="margin:0">${ico("daily", "#e8c878", 16)} Défis du jour</h3><button class="btn ghost sm" data-a="toggleDaily">${UI.hideDaily ? "+" : "–"}</button></div>
      ${UI.hideDaily ? "" : ct.map((c, i) => `<div style="margin-top:6px"><div class="row sp small"><span>${c.n}</span><span class="${c.p >= c.goal ? "good" : "dim"}">${c.p}/${c.goal}</span></div><div class="row" style="gap:6px"><div class="bar xp" style="flex:1"><i style="width:${100 * c.p / c.goal}%"></i></div>${c.claimed ? '<span class="tiny good">✓</span>' : c.p >= c.goal ? `<button class="btn gold sm" data-a="claimCt" data-v="${i}">+${c.gold}</button>` : `<span class="tiny dim">${c.gold} or</span>`}</div></div>`).join("") + `<div class="sep" style="margin:8px 0"></div><button class="btn ${S.daily.done ? "ghost off" : "main"} sm" style="width:100%" data-a="dailyRun">${ico("star")}${S.daily.done ? "Expédition du jour accomplie" : "Expédition du jour (+récompenses)"}</button>`}
    </div>`;
  },
  mount: () => { tutoHint("bastion", "Touchez un bâtiment pour y entrer. <b>La Porte</b> mène aux expéditions."); },
  resize: () => refresh(),
};
ACT.toggleDaily = () => { UI.hideDaily = !UI.hideDaily; refresh(); };
ACT.claimCt = i => { const c = S.daily.contracts[+i]; if (!c || c.claimed || c.p < c.goal) return; c.claimed = 1; S.gold += c.gold; sfx("coin"); toast(`+${c.gold} or`, "good"); save(); refresh(); };
ACT.dailyRun = () => { if (S.daily.done) return; const d = dailyRun(); UI.expe = { region: d.region, daily: d }; go("expe"); };
function tutoHint(k, text) { if (S.tuto[k]) return; S.tuto[k] = 1; setTimeout(() => toast(`${ico("info", "#e8c878")} ${text}`), 700); }
ACT.bld = k => { if (k === "porte") { sfx("door"); go("expe"); return; } sfx("open"); openBuilding(k); };
function bldFooter(k) {
  const B = BUILDINGS[k], c = bldCost(k), l = S.bld[k];
  const next = { taverne: `Caserne : ${4 + (l + 1) * 2} héros · ${3 + l} recrues mieux aguerries`, forge: `Palier d'armure ${l + 1} · amélioration jusqu'à +${(l + 1) * 2}`, chapelle: `${3 + l} potions par expédition · soins moins chers`, academie: `Rang de compétence maximal ${l + 1}`, menagerie: `${l + 2} compagnons`, fonderie: `${[0, 18, 34, 58, 90, 135][l + 1]} or/h, réserve ${[0, 6, 8, 10, 12, 16][l + 1]} h` }[k];
  return `<div class="sep"></div><div class="row sp"><div><b>${B.n}</b> <span class="gold">niveau ${l}</span>${c ? `<div class="small dim">Niveau ${l + 1} : ${next}</div>` : '<div class="small good">Niveau maximal</div>'}</div>${c ? `<button class="btn gold sm ${canPay(c) ? "" : "off"}" data-a="upBld" data-v="${k}">${ico("up")}${c.gold} ${ico("coin", "#e8c060")}${c.shards ? ` ${c.shards} ${ico("shard", "#c090ff")}` : ""}</button>` : ""}</div>`;
}
ACT.upBld = k => { const r = upgradeBld(k); if (r.err) return toast(r.err, "bad"); sfx("forge"); toast(`${BUILDINGS[k].n} : niveau ${S.bld[k]} !`, "good"); save(); openBuilding(k); renderHud(); };
function openBuilding(k, tab) {
  const B = BUILDINGS[k]; let body = "";
  UI.bldTab = tab || UI.bldTab || "";
  if (k === "taverne") {
    body = `<p class="lore">Une odeur de bière tiède et de sang séché. Des âmes perdues attendent un capitaine.</p><p class="small">Caserne : <b>${S.heroes.length}/${rosterMax()}</b> héros.</p>
    <div class="grid" style="--min:170px">${S.recruits.map((h, i) => { const C = CLASSES[h.cls], c = recruitPrice(i); return `<div class="card" style="text-align:center">${canvasSlot("r:" + i, 150, 188)}<h3 style="margin:2px 0">${esc(h.name)}</h3><div class="row" style="justify-content:center;gap:4px">${roleTag(C.role)}<span class="tag">${h.evo ? CLASSES[h.cls].evos[h.evo].n : C.n} · niv ${h.lvl}</span></div><p class="tiny" style="min-height:30px">${h.traits.map(t => `<span class="${TRAITS[t].good ? "good" : "bad"}" title="${TRAITS[t].d}">${TRAITS[t].n}</span>`).join(" · ")}</p><button class="btn ${c === 0 ? "main" : ""} sm" data-a="recruit" data-v="${i}">${c === 0 ? "Gratuit" : c + " " + ico("coin", "#e8c060")}</button></div>`; }).join("") || '<div class="empty">Plus personne. Revenez après une expédition.</div>'}</div>
    <div class="row" style="margin-top:10px"><button class="btn ghost sm" data-a="reroll">${ico("dice")}Nouvelles recrues (${40 + S.bld.taverne * 20} or)</button><span class="small dim">Les recrues changent après chaque expédition. Classes débloquées : ${CLASS_IDS.filter(classUnlocked).length}/10.</span></div>`;
  }
  if (k === "forge") {
    const tabs = ["craft", "inv"]; const tb = tabs.includes(UI.bldTab) ? UI.bldTab : "craft";
    const head = `<div class="tabs"><button class="btn sm ${tb === "craft" ? "on" : ""}" data-a="bldTab" data-v="forge:craft">${ico("anvil")}Forger</button><button class="btn sm ${tb === "inv" ? "on" : ""}" data-a="bldTab" data-v="forge:inv">${ico("chest")}Inventaire (${S.inv.length})</button></div>`;
    if (tb === "craft") {
      const cls = UI.forgeCls && S.heroes.some(h => h.cls === UI.forgeCls) ? UI.forgeCls : (S.heroes[0] || {}).cls;
      const owned = [...new Set(S.heroes.map(h => h.cls))];
      body = head + `<p class="lore">L'enclume chante. Plus la forge est grande, plus l'acier est noble — et plus vos héros sont redoutables à voir.</p>
      <div class="row">${owned.map(c => `<button class="btn sm ${c === cls ? "on gold" : "ghost"}" data-a="forgeCls" data-v="${c}">${CLASSES[c].n}</button>`).join("")}</div>
      <div class="grid" style="--min:250px;margin-top:10px">${[1, 2, 3, 4, 5].map(t => { const c = craftCost(t), lock = t > S.bld.forge; return `<div class="card ${lock ? "lock" : ""}" style="cursor:default"><div class="row">${canvasSlot("tier:" + cls + ":" + t, 76, 95)}<div style="flex:1"><h3>${TIER_N[t]} ${lock ? ico("lock", "#9a8c7a", 14) : ""}</h3><div class="tiny dim">${GEAR_NAMES[cls].wpn[t - 1]}<br>${GEAR_NAMES[cls].arm[t - 1]}</div><div class="tiny" style="margin-top:4px">${c.gold} or · ${c.fer} fer${c.essence ? ` · ${c.essence} ess.` : ""}${c.cendre ? ` · ${c.cendre} cendre` : ""}</div></div></div>${lock ? `<p class="tiny dim">Forge niveau ${t} requise</p>` : `<div class="row" style="margin-top:6px"><button class="btn sm ${canPay(c) ? "" : "off"}" data-a="craft" data-v="${cls}:wpn:${t}">${ico("weapon")}Arme</button><button class="btn sm ${canPay(c) ? "" : "off"}" data-a="craft" data-v="${cls}:arm:${t}">${ico("armor")}Armure</button></div>`}</div>`; }).join("")}</div>`;
    } else {
      body = head + invList();
    }
  }
  if (k === "chapelle") {
    const inj = S.heroes.filter(isInjured);
    body = `<p class="lore">Les cierges ne s'éteignent jamais ici. Les blessés reprennent des forces, lentement.</p><p class="small">Potions par expédition : <b>${potionMax()}</b>. Les blessés guérissent seuls avec le temps ; ils peuvent aussi partir blessés, à 50 % de leurs PV.</p>
    ${inj.length ? inj.map(h => { const c = Math.round(healCost(h) * (1 - (S.bld.chapelle - 1) * .15)); const m = Math.ceil((h.injured - Date.now()) / 60000); return `<div class="row sp card" style="cursor:default">${canvasSlot("h:" + h.id, 56, 56)}<div style="flex:1"><b>${esc(h.name)}</b> <span class="small dim">· ${heroTitle(h)} niv ${h.lvl}</span><div class="small bad">Blessé · guéri dans ${m} min</div></div><button class="btn sm" data-a="heal" data-v="${h.id}">${ico("heal")}${c} or</button></div>`; }).join("") : '<div class="empty">Aucun blessé. Que la lumière vous garde.</div>'}`;
  }
  if (k === "academie") {
    const evo = S.heroes.filter(h => h.lvl >= EVO_LVL && !h.evo);
    body = `<p class="lore">Des livres, des maîtres d'armes fatigués, et des leçons écrites dans le sang.</p><p class="small">Rang maximal des compétences : <b>${skillRankMax()}</b> (chaque rang : +10 % d'efficacité). Améliorez les compétences depuis la fiche de chaque héros.</p>
    ${evo.length ? `<h3>Prêts à évoluer</h3>${evo.map(h => `<div class="row sp card" data-go="hero" data-arg="${h.id}">${canvasSlot("h:" + h.id, 56, 56)}<div style="flex:1"><b>${esc(h.name)}</b> <span class="small dim">· ${CLASSES[h.cls].n} niv ${h.lvl}</span><div class="small gold">Peut devenir ${Object.values(CLASSES[h.cls].evos).map(e => e.n).join(" ou ")}</div></div>${ico("up", "#e8c878")}</div>`).join("")}` : `<p class="small dim">Au niveau ${EVO_LVL}, chaque héros choisit une voie : deux évolutions par classe, chacune avec ses compétences, son ultime et son apparence. Au niveau ${APEX_LVL}, il atteint son apogée.</p>`}`;
  }
  if (k === "menagerie") {
    body = `<p class="lore">Grognements, plumes et yeux luisants dans le noir. Un seul compagnon vous suit en expédition.</p><div class="grid" style="--min:200px">${PET_IDS.map(id => { const P = PETS[id], own = S.pets.owned.includes(id), un = petUnlocked(id), ev = petEvolved(id), l = petLvl(id); return `<div class="card ${S.pet === id ? "sel" : ""} ${!un ? "lock" : ""}" style="text-align:center;cursor:default">${canvasSlot("p:" + id + ":" + (ev ? 1 : 0), 170, 120)}<h3 style="margin:0">${petName(id)}</h3><div class="row" style="justify-content:center;gap:4px">${roleTag(P.role)}${own ? `<span class="tag">niv ${l}</span>` : ""}</div><p class="tiny dim" style="min-height:32px">${ev ? P.evo.d : P.d}</p>${own ? `<div class="bar xp" style="margin:4px 0"><i style="width:${l >= 20 ? 100 : 100 * (S.pets.xp[id] || 0) / petXpNeed(l)}%"></i></div>` + (S.pet === id ? '<span class="tag gold">Compagnon actif</span>' : `<button class="btn sm" data-a="setPet" data-v="${id}">Emmener</button>`) + (!ev && l >= PET_EVO_LVL ? ` <button class="btn gold sm" data-a="evoPet" data-v="${id}">${ico("star")}Évoluer</button>` : "") : un ? `<button class="btn sm" data-a="adopt" data-v="${id}">Adopter · ${P.cost} ${ico("coin", "#e8c060")}</button>` : `<span class="tiny dim">${ico("lock", "#9a8c7a", 12)} Chapitre ${P.unlock} requis</span>`}</div>`; }).join("")}</div><p class="small dim">Évolution au niveau ${PET_EVO_LVL} : 600 or, 4 essences, 1 éclat. Capacité : ${S.bld.menagerie + 2} compagnons.</p>`;
  }
  if (k === "fonderie") {
    const b = idleBank();
    body = `<p class="lore">Les âmes des morts brûlent ici, et leur chaleur se change en or. Elle travaille même quand vous dormez.</p><div class="row sp card" style="cursor:default"><div><div class="small dim">Réserve</div><div style="font-size:28px;font-family:var(--f-head)" class="gold">${fmt(b)} or</div><div class="small dim">${fonderieRate()} or par heure · réserve pleine en ${fonderieCap()} h</div></div><button class="btn main ${b > 0 ? "glow" : "off"}" data-a="collect">${ico("coin")}Récolter</button></div>`;
  }
  modal(`<h2>${ico(B.ic, "#e8c878")} ${B.n}</h2>${body}${bldFooter(k)}`, { wide: 1, mount: m => fillCanvases(m, (c, id) => { const p = id.split(":"); if (p[0] === "r") paintHero(c, S.recruits[+p[1]], true); if (p[0] === "h") paintHero(c, heroById(p[1])); if (p[0] === "p") paintPet(c, p[1], p[2] === "1"); if (p[0] === "tier") { const x = c.getContext("2d"); const sp = heroSprite({ cls: p[1], tier: +p[2], wtier: +p[2], skin: SKINS[1], hair: 1, hairCol: HAIRCOL[1], beard: 0 }, {}, 0, c.width / 230 * 1.2); x.drawImage(sp, c.width / 2 - sp.ax, c.height - 4 - sp.ay); } if (p[0] === "it") paintItem(c, findItem(p[1])); }) });
  UI.bldOpen = k;
}
ACT.bldTab = v => { const [k, t] = v.split(":"); UI.bldTab = t; openBuilding(k, t); };
ACT.forgeCls = c => { UI.forgeCls = c; openBuilding("forge", "craft"); };
ACT.craft = v => { const [c, kind, t] = v.split(":"); const r = craft(c, kind, +t); if (r.err) return toast(r.err, "bad"); sfx("forge"); const it = r.ok; toast(`Forgé : <span class="rar${it.rar}">${gearName(it)}</span> (${RARITY[it.rar].n})`, it.rar >= 2 ? "epic" : "good"); const h = S.heroes.find(h => h.cls === c && h.gear[kind] && h.gear[kind].tier < it.tier); if (h) { equip(h, it); toast(`${esc(h.name)} s'en équipe.`); } save(); renderHud(); openBuilding("forge", "craft"); };
ACT.recruit = i => { const r = recruit(+i); if (r.err) return toast(r.err, "bad"); sfx("coin"); toast(`${esc(r.ok.name)} rejoint le Bastion.`, "good"); save(); renderHud(); openBuilding("taverne"); };
ACT.reroll = () => { if (!rerollRecruits()) return toast("Pas assez d'or.", "bad"); save(); renderHud(); openBuilding("taverne"); };
ACT.heal = id => { if (!healInjured(id)) return toast("Pas assez d'or.", "bad"); sfx("heal"); save(); renderHud(); openBuilding("chapelle"); };
ACT.collect = () => { const v = collectBank(); if (v <= 0) return; sfx("coin"); toast(`+${v} or`, "good"); save(); renderHud(); openBuilding("fonderie"); };
ACT.setPet = id => { S.pet = id; save(); openBuilding("menagerie"); };
ACT.adopt = id => { const r = adoptPet(id); if (r.err) return toast(r.err, "bad"); sfx("level"); toast(`${PETS[id].n} vous rejoint !`, "good"); save(); renderHud(); openBuilding("menagerie"); };
ACT.evoPet = id => { const r = evolvePet(id); if (r.err) return toast(r.err, "bad"); sfx("ult"); toast(`${PETS[id].n} devient ${PETS[id].evo.n} !`, "epic"); save(); renderHud(); openBuilding("menagerie"); };
// inventaire
function findItem(id) { return S.inv.find(i => i.id === id) || S.heroes.flatMap(h => Object.values(h.gear)).find(i => i && i.id === id) || (S.run ? S.run.loot.find(i => i.id === id) : null); }
function itemIcon(it) { return it.kind === "wpn" ? { masse: "mace", espadon: "sword", baton: "sun", faucille: "scythe", luth: "lute", hache: "axe", dagues: "dagger", arbalete: "bolt", grimoire: "book", faux: "scythe" }[CLASSES[it.cls].wpn] : it.kind === "arm" ? "armor" : TRINKETS[it.key].ic; }
function paintItem(c, it) { if (!it) return; const x = c.getContext("2d"); const g = x.createRadialGradient(c.width / 2, c.height / 2, 2, c.width / 2, c.height / 2, c.width / 2); g.addColorStop(0, RARITY[it.rar].c + "55"); g.addColorStop(1, "#0000"); x.fillStyle = g; x.fillRect(0, 0, c.width, c.height); }
function itemLine(it) {
  if (!it) return "";
  const stats = [];
  if (it.kind === "wpn") stats.push(`+${Math.round((WPN_DMG[it.tier] * (1 + .07 * it.up) + it.up * .03) * 100)} % dégâts`);
  if (it.kind === "arm") stats.push(`+${Math.round((ARM_HP[it.tier] * (1 + .07 * it.up) + it.up * .025) * 100)} % PV`, `+${Math.round(ARM_PROT[it.tier] * 100)} % protection`);
  if (it.kind === "tr") stats.push(TRINKETS[it.key].d);
  for (const f of it.aff || []) { const A = AFFIXES[f.k]; stats.push(`+${A.fmt === "pct" ? Math.round(f.v * 100) + " %" : f.v} ${A.n}`); }
  return stats.join(" · ");
}
function slotHTML(it, act, v, extra = "") { if (!it) return `<div class="slot" data-a="${act}" data-v="${v}">${ico("plus", "#5a4a3a")}</div>`; return `<div class="slot r${it.rar}" data-a="${act}" data-v="${v}" title="${esc(gearName(it))}">${ico(itemIcon(it), RARITY[it.rar].c)}${it.kind !== "tr" ? `<span class="tier">${"I II III IV V".split(" ")[it.tier - 1]}</span>` : ""}${it.up ? `<span class="up">+${it.up}</span>` : ""}${extra}</div>`; }
function invList(filter) {
  const items = S.inv.filter(filter || (() => true)).sort((a, b) => b.rar - a.rar || b.tier - a.tier);
  if (!items.length) return '<div class="empty">Inventaire vide. Explorez pour trouver du butin, ou forgez.</div>';
  return `<div class="col">${items.map(it => `<div class="row card" style="cursor:default;gap:10px">${slotHTML(it, "itemInfo", it.id)}<div style="flex:1;min-width:150px"><b class="rar${it.rar}">${gearName(it)}</b> <span class="tiny dim">${RARITY[it.rar].n}${it.cls ? " · " + CLASSES[it.cls].n : ""}</span><div class="tiny">${itemLine(it)}</div></div><div class="row" style="gap:4px">${it.kind !== "tr" ? `<button class="btn sm" data-a="upItem" data-v="${it.id}" title="Améliorer">${ico("up")}</button>` : ""}<button class="btn sm" data-a="equipPick" data-v="${it.id}">Équiper</button><button class="btn ghost sm" data-a="salv" data-v="${it.id}" title="Recycler">${ico("iron")}</button></div></div>`).join("")}</div>`;
}
ACT.itemInfo = id => { const it = findItem(id); if (!it) return; const c = it.kind !== "tr" ? upCost(it) : null; toast(`<b class="rar${it.rar}">${gearName(it)}</b><br><span class="small">${itemLine(it)}</span>${c ? `<br><span class="tiny dim">Amélioration : ${c.gold} or, ${c.fer} fer${c.essence ? ", " + c.essence + " ess." : ""}</span>` : ""}`); };
ACT.upItem = id => { const it = findItem(id); const r = upgradeItem(it); if (!r || r.err) return toast((r && r.err) || "Impossible.", "bad"); sfx("forge"); toast(`${gearName(it)}`, "good"); save(); renderHud(); if (UI.bldOpen === "forge" && !$("#modal").hidden && !UI.heroOpen) openBuilding("forge", "inv"); else refresh(); };
ACT.salv = id => { const it = findItem(id); if (!it) return; const go2 = () => { const r = salvageItem(it); sfx("forge"); toast(`Recyclé : +${r.fer} fer${r.essence ? `, +${r.essence} ess.` : ""}${r.cendre ? ", +1 cendre" : ""}, +${r.gold} or`); save(); renderHud(); openBuilding("forge", "inv"); }; if (it.rar >= 2) confirmBox(`Recycler <b class="rar${it.rar}">${gearName(it)}</b> ?`, go2); else go2(); };
ACT.equipPick = id => { const it = findItem(id); const hs = S.heroes.filter(h => canEquip(h, it)); if (!hs.length) return toast("Aucun héros ne peut porter cet objet.", "bad"); modal(`<h2>Équiper ${gearName(it)}</h2><div class="col">${hs.map(h => { const cur = it.kind === "tr" ? null : h.gear[it.kind]; return `<div class="row card" data-a="equipTo" data-v="${it.id}:${h.id}">${canvasSlot("h:" + h.id, 48, 48)}<div style="flex:1"><b>${esc(h.name)}</b> <span class="tiny dim">${heroTitle(h)} niv ${h.lvl}</span>${cur ? `<div class="tiny dim">Actuel : <span class="rar${cur.rar}">${gearName(cur)}</span></div>` : ""}</div></div>`; }).join("")}</div>`, { mount: m => fillCanvases(m, (c, i) => paintHero(c, heroById(i.split(":")[1]))) }); };
ACT.equipTo = v => { const [iid, hid] = v.split(":"); const it = findItem(iid), h = heroById(hid); if (!equip(h, it)) return toast("Impossible (deux fois le même bibelot ?).", "bad"); sfx("forge"); toast(`${esc(h.name)} : ${gearName(it)}`, "good"); save(); closeModal(); if (UI.screen === "hero") refresh(); else openBuilding("forge", "inv"); };
