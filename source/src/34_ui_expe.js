/* ═══════════════════════ Expéditions : préparation, carte, salles, bilan ═══════════════════════ */
function regionThumb(c, id) { const x = c.getContext("2d"); const bg = paintRegion(id, 640, 360); x.drawImage(bg, 0, 0, c.width, c.height); const g = x.createLinearGradient(0, c.height * .4, 0, c.height); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,.85)"); x.fillStyle = g; x.fillRect(0, 0, c.width, c.height); }
function autoParty() {
  const ok = S.heroes.filter(h => !isInjured(h)).concat(S.heroes.filter(isInjured)).sort((a, b) => b.lvl - a.lvl);
  const pick4 = []; for (const r of ["tank", "soin"]) { const h = ok.find(x => CLASSES[x.cls].role === r && !pick4.includes(x)); if (h) pick4.push(h); }
  for (const h of ok) if (pick4.length < 4 && !pick4.includes(h)) pick4.push(h);
  return pick4.sort((a, b) => CLASSES[a.cls].rk[0] - CLASSES[b.cls].rk[0]).map(h => h.id);
}
SCREENS.expe = {
  title: "Expédition", tab: "expe",
  scene: () => backdrop((UI.expe && UI.expe.region) || "bourg", { dark: .5 }),
  html: () => {
    if (S.run) return `<div class="wrap"><div class="empty">Une expédition est en cours.<br><button class="btn main" data-a="toMap" style="margin-top:10px">Reprendre</button></div></div>`;
    const E = UI.expe = UI.expe || {};
    if (!E.party || E.party.some(id => !heroById(id))) E.party = autoParty();
    if (!E.region || !regionUnlocked(E.region)) E.region = [...REGIONS].reverse().find(r => regionUnlocked(r.id)).id;
    E.pet = S.pets.owned.includes(E.pet) ? E.pet : S.pet; E.threat = E.threat || 0;
    const R = regionById(E.region), prog = S.prog[E.region], cleared = prog && prog.clears;
    const avgL = E.party.length ? Math.round(E.party.reduce((a, id) => a + heroById(id).lvl, 0) / E.party.length) : 0;
    const roles = E.party.map(id => CLASSES[heroById(id).cls].role);
    const warn = [!roles.includes("soin") && "Aucun soigneur : les blessures vont s'accumuler.", !roles.includes("tank") && "Aucun tank : vos héros fragiles seront exposés.", E.party.length < 4 && "Moins de 4 héros.", avgL < R.lvl - 1 && E.region !== "abime" && `Niveau conseillé : ${R.lvl}+ (votre groupe : ${avgL}).`].filter(Boolean);
    const regs = [...REGIONS, ABYSS];
    return `<div class="wrap"><h1>Préparer l'expédition</h1>
    ${E.daily ? `<div class="panel" style="padding:10px;margin-bottom:10px;border-color:#c9a24a"><b class="gold">${ico("star", "#e8c878", 14)} Expédition du jour</b> <span class="small">— ${R.n}, reliques offertes : ${E.daily.relics.map(k => RELICS[k].n).join(", ")}. Récompenses +25 %.</span> <button class="btn ghost sm" data-a="noDaily">Annuler</button></div>` : ""}
    <h2>Destination</h2><div class="grid" style="--min:200px">${regs.map(r => { const un = regionUnlocked(r.id), p = S.prog[r.id]; return `<div class="card ${E.region === r.id ? "sel" : ""} ${un ? "" : "lock"}" data-a="${un && !E.daily ? "pickReg" : ""}" data-v="${r.id}" style="padding:0">${canvasSlot("reg:" + r.id, 280, 120)}<div style="padding:8px 10px"><div class="tiny dim">${r.sub}${r.id === "abime" ? ` · record ${S.abyss.best}` : ` · niv ${r.lvl}+`}</div><h3 style="margin:0">${r.n} ${!un ? ico("lock", "#9a8c7a", 14) : p && p.clears ? ico("crown", "#e8c878", 14) : ""}</h3><p class="tiny dim" style="margin:2px 0 0">${un ? r.d : "Terminez le chapitre précédent."}</p></div></div>`; }).join("")}</div>
    ${E.region === "abime" ? abyssOpts(E) : cleared && !E.daily ? `<div class="row" style="margin-top:8px"><span class="small">Menace :</span>${[0, 1, 2].map(t => `<button class="btn sm ${E.threat === t ? "gold" : "ghost"}" data-a="threat" data-v="${t}">${["I", "II", "III"][t]}</button>`).join("")}<span class="tiny dim">Ennemis +${E.threat * 2} niveaux, récompenses +${E.threat * 30} %</span></div>` : ""}
    <h2 style="margin-top:14px">Ordre de marche</h2><p class="tiny dim" style="margin-top:-4px">Le rang 1 est en première ligne, face à l'ennemi. Touchez un héros pour l'ajouter ou le retirer, et une flèche pour changer son rang.</p>
    <div class="partyrow">${[3, 2, 1, 0].map(i => { const h = heroById(E.party[i]); return `<div class="card" style="text-align:center;padding:6px 3px" data-a="${h ? "unparty" : ""}" data-v="${i}"><div class="tiny gold">Rang ${i + 1}</div>${h ? canvasSlot("pt:" + h.id, 96, 120) + `<div class="tiny"><b>${esc(h.name.split(" ")[0])}</b></div><div class="tiny dim">${CLASSES[h.cls].n} ${h.lvl}</div>${isInjured(h) ? '<div class="tiny bad">Blessé (50 % PV)</div>' : ""}<div class="row" style="justify-content:center;gap:2px;margin-top:3px"><button class="btn ghost sm" data-a="mvParty" data-v="${i}:1" ${i >= 3 || !E.party[i + 1] ? "disabled" : ""}>◀</button><button class="btn ghost sm" data-a="mvParty" data-v="${i}:-1" ${i <= 0 ? "disabled" : ""}>▶</button></div>` : '<div class="empty" style="padding:40px 4px">vide</div>'}</div>`; }).join("")}</div>
    ${warn.length ? `<div class="small bad" style="text-align:center">${warn.join("<br>")}</div>` : ""}
    ${synergyHTML(E.party.map(id => heroById(id).cls), S.heroes.filter(h => !E.party.includes(h.id)).map(h => h.cls))}
    <div class="row" style="gap:6px;margin-top:8px">${S.heroes.filter(h => !E.party.includes(h.id)).map(h => `<div class="card" style="padding:4px 8px" data-a="addParty" data-v="${h.id}"><div class="row" style="gap:6px;flex-wrap:nowrap">${canvasSlot("ro:" + h.id, 40, 40)}<div class="tiny"><b>${esc(h.name.split(" ")[0])}</b><br><span class="dim">${CLASSES[h.cls].n} ${h.lvl}${isInjured(h) ? ' · <span class="bad">blessé</span>' : ""}</span></div></div></div>`).join("")}<button class="btn ghost sm" data-a="autoParty">${ico("auto")}Composition auto</button></div>
    <h2 style="margin-top:14px">Compagnon</h2><div class="row">${S.pets.owned.map(id => `<div class="card ${E.pet === id ? "sel" : ""}" style="padding:4px 10px;text-align:center" data-a="pickPet" data-v="${id}">${canvasSlot("pe:" + id, 90, 64)}<div class="tiny"><b>${petName(id)}</b> niv ${petLvl(id)}</div></div>`).join("")}</div>
    <div class="stickybar"><span class="small dim">${ico("potion", "#e86a5a", 16)} ${potionMax() - (E.region === "abime" && (S.abyss.oaths || []).includes("jeune") ? 1 : 0)} potions</span><button class="btn main glow" data-a="launch" ${E.party.length ? "" : "disabled"}>${ico("map")}Partir</button></div></div>`;
  },
  mount: () => fillCanvases($("#view"), (c, id) => { const [k, v] = id.split(":"); if (k === "reg") regionThumb(c, v); if (k === "pt") paintHero(c, heroById(v), true); if (k === "ro") paintHero(c, heroById(v)); if (k === "pe") paintPet(c, v, petEvolved(v)); }),
};
function abyssOpts(E) {
  const best = S.abyss.best, cps = [1]; for (let f = 5; f <= best; f += 5) cps.push(f);
  E.floor = cps.includes(E.floor) ? E.floor : 1;
  const oathOk = REGIONS.every(r => S.prog[r.id] && S.prog[r.id].clears);
  return `<div class="panel" style="padding:10px;margin-top:8px"><div class="row"><span class="small">Départ :</span>${cps.map(f => `<button class="btn sm ${E.floor === f ? "gold" : "ghost"}" data-a="abFloor" data-v="${f}">Prof. ${f}</button>`).join("")}</div>
  <div class="small" style="margin-top:8px"><b>Serments</b> ${oathOk ? "<span class='dim'>— plus de difficulté, plus d'or et d'éclats</span>" : "<span class='dim'>— disponibles après le Roi de Cendres</span>"}</div>
  ${oathOk ? `<div class="row" style="margin-top:4px">${Object.entries(OATHS).map(([k, O]) => `<button class="btn sm ${S.abyss.oaths.includes(k) ? "main" : "ghost"}" data-a="oath" data-v="${k}" title="${O.d}">${O.n}</button>`).join("")}</div><div class="tiny dim">${S.abyss.oaths.map(k => OATHS[k].d).join(" ")}</div>` : ""}</div>`;
}
ACT.toMap = () => go("map");
ACT.noDaily = () => { UI.expe.daily = null; refresh(); };
ACT.pickReg = v => { UI.expe.region = v; UI.expe.threat = 0; SC.draw = backdrop(v, { dark: .5 }); refresh(); };
ACT.threat = v => { UI.expe.threat = +v; refresh(); };
ACT.abFloor = v => { UI.expe.floor = +v; refresh(); };
ACT.oath = k => { const o = S.abyss.oaths; if (o.includes(k)) S.abyss.oaths = o.filter(x => x !== k); else o.push(k); refresh(); };
ACT.addParty = id => { const E = UI.expe; if (E.party.length >= 4) return toast("4 héros au maximum.", "bad"); E.party.push(id); E.party.sort((a, b) => CLASSES[heroById(a).cls].rk[0] - CLASSES[heroById(b).cls].rk[0]); refresh(); };
ACT.unparty = (i, el, e) => { if (e.target.closest("button")) return; UI.expe.party.splice(+i, 1); refresh(); };
ACT.mvParty = (v, el, e) => { e.stopPropagation(); const [i, d] = v.split(":").map(Number); const P = UI.expe.party, j = i + d; if (j < 0 || j >= P.length) return; [P[i], P[j]] = [P[j], P[i]]; refresh(); };
ACT.autoParty = () => { UI.expe.party = autoParty(); refresh(); };
ACT.pickPet = id => { UI.expe.pet = id; S.pet = id; refresh(); };
ACT.launch = () => {
  const E = UI.expe; if (!E.party.length) return;
  const opt = { threat: E.region === "abime" ? 0 : E.threat, floor: E.region === "abime" ? E.floor : 1 };
  if (E.daily) { opt.relics = E.daily.relics; opt.seed = E.daily.seed; opt.daily = 1; }
  startRun(E.region, E.party, E.pet, opt);
  E.daily = null; save(); sfx("door"); musicPlay("map");
  go("map");
  const R = regionById(S.run.region);
  setTimeout(() => toast(`<b>${R.n}</b><br><span class="small lore">${gl(R.d)}</span>`), 300);
};
// ── carte ──
SCREENS.map = {
  noNav: 1, title: () => S.run ? regionById(S.run.region).n + (S.run.region === "abime" ? ` · profondeur ${S.run.floor}` : "") : "",
  scene: () => backdrop(S.run ? S.run.region : "bourg", { dark: .55 }),
  html: () => {
    const run = S.run; if (!run) return "";
    const port = SC.w < SC.h, cols = run.map.length, av = availableNodes(run);
    const W = port ? Math.min(SC.w - 20, 440) : Math.min(SC.w - 30, 980), H = port ? Math.max(460, SC.h - 300) : Math.min(SC.h - 230, 420);
    const pos = n => port ? [24 + n.x * (W - 48), H - 40 - n.c * (H - 92) / (cols - 1)] : [46 + n.c * (W - 98) / (cols - 1), 18 + n.x * (H - 36)];
    UI.mapPos = pos; UI.mapWH = [W, H];
    const nodes = run.map.flat().map(n => { const [x, y] = pos(n), T = NODE_T[n.type], isAv = av.includes(n), cur = run.pos && run.pos.c === n.c && run.pos.i === n.i, art = mapToken(n.type); return `<div class="node ${n.type === "boss" ? "boss" : ""} ${isAv ? "av" : ""} ${n.visited && !cur ? "done" : ""} ${cur ? "cur" : ""}" style="left:${x}px;top:${y}px;--nc:${T.c}" ${isAv ? `data-a="node" data-v="${n.c}:${n.i}"` : ""} title="${T.n}">${art ? `<img src="${art}" alt="${T.n}">` : ico(T.ic, T.c)}${isAv ? `<span class="nlab">${T.n}</span>` : ""}</div>`; }).join("");
    const cp = run.pos ? run.map[run.pos.c][run.pos.i] : null, pawn = cp ? pos(cp) : null, pawnArt = mapToken("pawn");
    const party = runParty();
    return `<div class="wrap" style="padding-top:4px">
      <div class="panel" style="padding:8px 10px"><div class="row sp"><div class="row" style="gap:10px">
        <span class="tag" data-tip="lueur">${ico("torch", run.light < 30 ? "#ff5a3a" : "#ffb050")}<span style="width:70px" class="bar"><i style="width:${run.light}%;background:linear-gradient(#ffd08a,#c0601a)"></i></span>${Math.round(run.light)}</span>
        <span class="tag" data-tip="potion">${ico("potion", "#e86a5a")}${run.potions}</span><span class="tag" data-tip="or">${ico("coin", "#e8c060")}${fmt(run.gold)}</span><span class="tag" style="cursor:pointer" data-a="runBag" title="Butin : voir et équiper">${ico("chest", "#c8a070")}${run.loot.length}</span>
      </div><button class="btn ghost sm" data-a="retreat">${ico("flee")}Rentrer</button></div>
      ${runSynergies(run).length ? `<div class="row" style="gap:4px;margin-top:6px">${runSynergies(run).map(k => `<span class="tag gold" style="cursor:pointer" ${tipAttr(SYNERGIES[k].n, SYNERGIES[k].d)}>${ico("link", "#e8c878")}${SYNERGIES[k].n}</span>`).join("")}</div>` : ""}
      ${run.relics.length ? `<div class="row" style="gap:4px;margin-top:6px">${run.relics.map(k => `<span class="tag" style="cursor:pointer" ${tipAttr(RELICS[k].n, RELICS[k].d)}>${ico("gem", ["#c8beaa", "#6ab0ff", "#c87aff"][RELICS[k].r])}${RELICS[k].n}</span>`).join("")}</div>` : ""}</div>
      <div class="mapwrap" style="width:${W}px;height:${H}px;margin-top:8px"><canvas data-cv="mapbg" width="${Math.round(W * Math.min(2, devicePixelRatio || 1))}" height="${Math.round(H * Math.min(2, devicePixelRatio || 1))}" style="position:absolute;inset:0;width:${W}px;height:${H}px"></canvas>${nodes}${pawn && pawnArt ? `<img class="pawn" src="${pawnArt}" alt="" style="left:${pawn[0]}px;top:${pawn[1]}px">` : ""}</div>
      <div class="row" style="justify-content:center;gap:6px;margin-top:6px;flex-wrap:nowrap">${party.map(h => { const mx = heroStats(h, relicHooks(run)).hp, hp = h.hp == null ? mx : h.hp, fallen = run.fallen.includes(h.id); return `<div class="panel" style="padding:4px;width:84px;text-align:center;${fallen ? "filter:grayscale(1) brightness(.5)" : ""}">${canvasSlot("mh:" + h.id, 64, 64)}<div class="tiny"><b>${esc(h.name.split(" ")[0])}</b></div><div class="bar" style="height:6px"><i style="width:${100 * hp / mx}%"></i></div><div class="tiny dim">${fallen ? "Tombé" : hp + "/" + mx}</div></div>`; }).join("")}</div>
      <p class="tiny dim" style="text-align:center">${run.region === "abime" ? "Chaque gardien vaincu ouvre un passage plus profond." : "Atteignez le gardien au bout du chemin."} Touchez une salle lumineuse pour avancer.</p></div>`;
  },
  mount: () => { fillCanvases($("#view"), (c, id) => id === "mapbg" ? paintMapBg(c, S.run, UI.mapWH[0], UI.mapWH[1], UI.mapPos) : paintHero(c, heroById(id.split(":")[1]))); resumeNode(); tutoHint("map", "Choisissez votre chemin : <b>combats</b>, <b>mystères</b>, <b>trésors</b>, <b>feux de camp</b>… La lueur baisse à chaque salle."); },
  resize: () => refresh(),
};
ACT.relicInfo = k => toast(`<b>${RELICS[k].n}</b><br><span class="small">${gl(RELICS[k].d)}</span>`);
ACT.retreat = () => confirmBox("Rentrer au Bastion ? Vous gardez l'or et le butin, mais le gardien n'est pas vaincu.", () => finishRun("retreat"), { yes: "Rentrer" });
ACT.node = v => {
  const [c, i] = v.split(":").map(Number); const run = S.run, n = run.map[c][i];
  if (!availableNodes(run).includes(n)) return;
  enterNode(run, n); save();
  go("travel", { node: n });
};
function resolveNode(n) {
  const run = S.run; UI.resolving = 1; setTimeout(() => UI.resolving = 0, 50);
  if (["combat", "elite", "boss"].includes(n.type)) { go("combat", { node: n }); return; }
  go("map");
  if (n.type === "event") return showEvent(n);
  if (n.type === "treasure") { const R = rewardFor(run, n); grantReward(run, R); n.done = 1; save(); sfx("coin"); rewardModal("Trésor", pick(["Un coffre oublié sous les gravats.", "Une bourse encore pleine, serrée par une main morte.", "Une cache de contrebandier, derrière une pierre descellée."]), R); return; }
  if (n.type === "camp") return showCamp(n);
  if (n.type === "shop") return showShop(n);
}
// ── marche entre deux salles : le groupe avance à travers le décor ──
const WALK_CACHE = {};
const WALK = [{ lFh: .5, lFk: -.25, lBh: -.5, lBk: -.55, aFs: .1, lean: .12 }, { lFh: .1, lFk: -.45, lBh: -.08, lBk: -.2, hy: -3, lean: .1 }, { lFh: -.42, lFk: -.6, lBh: .45, lBk: -.15, aFs: .5, lean: .12 }, { lFh: -.05, lFk: -.2, lBh: .1, lBk: -.5, hy: -3, lean: .1 }];
const TRAVEL_TXT = { combat: ["Des grognements dans l'ombre…", "Quelque chose bouge devant vous.", "L'odeur du sang frais."], elite: ["Une présence terrible vous attend.", "Le sol tremble sous des pas lourds."], event: ["Un bruit étrange, plus loin…", "Une lueur vacille entre les ruines.", "Quelqu'un — ou quelque chose — vous observe."], treasure: ["Un éclat doré sous la poussière.", "Un coffre, oublié de tous."], camp: ["Un abri. Enfin.", "Des braises encore chaudes."], shop: ["Une lanterne, et une silhouette encapuchonnée.", "Le tintement de pièces dans le noir."], boss: ["Le gardien vous attend.", "L'air devient glacé. C'est ici."] };
SCREENS.travel = {
  noNav: 1, noHud: 1, mount: () => { $("#toasts").innerHTML = ""; },
  html: a => { const T = NODE_T[a.node.type]; return `<div style="position:absolute;inset:0" data-a="skipTravel"><div style="position:absolute;left:0;right:0;top:calc(env(safe-area-inset-top) + 18%);text-align:center;pointer-events:none"><div class="tag" style="font-size:14px;padding:6px 14px;color:${T.c}">${ico(T.ic, T.c)} ${T.n}</div><p class="lore" style="font-size:17px;text-shadow:0 2px 8px #000;margin-top:10px">${pick(TRAVEL_TXT[a.node.type] || [""])}</p></div><p class="tiny dim" style="position:absolute;bottom:calc(env(safe-area-inset-bottom) + 14px);width:100%;text-align:center">Touchez pour passer</p></div>`; },
  scene: a => {
    const run = S.run, party = runParty().filter(h => !run.fallen.includes(h.id));
    const W = SC.w, H = SC.h, port = W < H;
    const sc = Math.min(H * (port ? .2 : .32) / 200, W / (port ? 6 : 9.5) / 70);
    const frames = party.map(h => { const L = heroLook(h), hurt = h.hp != null && h.hp / heroStats(h).hp < .3; return WALK.map((p, j) => { const key = L.key + sc.toFixed(3) + j + (hurt ? "h" : ""); return WALK_CACHE[key] = WALK_CACHE[key] || heroSprite(L, Object.assign({}, p, hurt ? { lean: .3, head: .3 } : {}), 0, sc); }); });
    const pet = run.pet ? [petSprite(run.pet, { evo: petEvolved(run.pet) }, 0, sc * .9), petSprite(run.pet, { evo: petEvolved(run.pet) }, .4, sc * .9)] : null;
    const t0 = SC.t, dur = a.node.type === "boss" ? 2.6 : 1.7;
    let doneOnce = false; UI.travelDone = () => { if (doneOnce) return; doneOnce = true; resolveNode(a.node); };
    let stepT = 0;
    return (x, t, dt) => {
      const k = (t - t0) / dur, bg = paintRegion(run.region, 1280, 720);
      const bw = Math.max(W, H * 16 / 9) * 1.25, bh = bw * 9 / 16, scroll = ((t - t0) * 70) % bw;
      for (const o of [0, 1]) x.drawImage(bg, -scroll + o * bw - (bw - W) / 2 * 0, Math.min(0, H - bh) * .6, bw, Math.max(bh, H));
      if (!SC.amb || SC.ambKind !== run.region) { SC.amb = makeAmbient(REGION_AMB[run.region] || "braises", 36, W, H); SC.ambKind = run.region; }
      drawAmbient(x, SC.amb, t, dt);
      const gy = H * (port ? .78 : .86), gap = 64 * sc * 1.15, fi = Math.floor((t - t0) * 7);
      if (fi !== stepT && fi % 2 === 0) { stepT = fi; sfx("step"); }
      const front = W * (port ? .62 : .58) + Math.min(1, k * 1.5) * 20;
      if (pet) { const cv = pet[fi % 2]; x.save(); x.translate(front - gap * (party.length + .3), gy - Math.abs(Math.sin(t * 9)) * 4); x.fillStyle = "rgba(0,0,0,.4)"; x.beginPath(); x.ellipse(0, 4, 30 * sc, 6 * sc, 0, 0, 7); x.fill(); x.drawImage(cv, -cv.ax, -cv.ay); x.restore(); }
      party.forEach((h, i) => { const cv = frames[i][(fi + i) % 4]; const px = front - gap * i; x.fillStyle = "rgba(0,0,0,.45)"; x.beginPath(); x.ellipse(px, gy + 2, 34 * sc, 7 * sc, 0, 0, 7); x.fill(); x.drawImage(cv, px - cv.ax, gy - cv.ay); });
      // torche portée par le groupe
      const f = .8 + Math.sin(t * 9) * .1; glow(x, front + 20 * sc, gy - 120 * sc, 200 * sc * (run.light / 100 + .4), "#ff9a4a", .22 * f);
      const vg = x.createRadialGradient(front, gy - 60, 40, front, gy - 60, Math.max(W, H) * (.35 + run.light / 250)); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,.85)"); x.fillStyle = vg; x.fillRect(0, 0, W, H);
      const fade = k < .12 ? 1 - k / .12 : k > .88 ? (k - .88) / .12 : 0; if (fade > 0) { x.fillStyle = `rgba(0,0,0,${clamp(fade, 0, 1)})`; x.fillRect(0, 0, W, H); }
      if (k >= 1) UI.travelDone();
    };
  },
};
ACT.skipTravel = () => { if (UI.travelDone) UI.travelDone(); };
function showEvent(n) {
  const E = EVENTS.find(e => e.id === n.ev);
  modal(`<h2>${ico("quest", "#b48cff")} ${E.n}</h2><p class="lore">${E.t}</p>${E.ch.map((c, i) => `<button class="btn choice" data-a="evChoice" data-v="${i}">${c.n}</button>`).join("")}`, { close: false });
  UI.evNode = n;
}
ACT.evChoice = i => {
  const n = UI.evNode, run = S.run; const res = resolveEvent(run, n.ev, +i); n.done = 1; save();
  if (res.fight) { closeModal(); toast(res.text.join("<br>"), "bad"); const fn = { c: n.c, i: n.i, type: "combat", ambush: 1 }; go("combat", { node: fn }); return; }
  sfx(res.relic || res.item ? "coin" : "click");
  modal(`<h2>${EVENTS.find(e => e.id === n.ev).n}</h2>${res.text.map(t => `<p>${t}</p>`).join("")}${res.relic ? `<p class="small"><b>${RELICS[res.relic].n}</b> : ${gl(RELICS[res.relic].d)}</p>` : ""}<div class="row" style="justify-content:flex-end"><button class="btn main" data-a="closeModal">Continuer</button></div>`, { onClose: () => refresh() });
};
function showCamp(n) {
  modal(`<h2>${ico("camp", "#ff9a3a")} Feu de camp</h2><p class="lore">Un instant de répit. Les flammes dansent, les ombres reculent. Que faire de cette nuit ?</p>${CAMP.map(c => `<button class="btn choice" data-a="camp" data-v="${c.k}"><b>${c.n}</b> — <span class="small">${c.d}</span></button>`).join("")}`, { close: false });
  UI.campNode = n;
}
ACT.camp = k => { doCamp(S.run, k); UI.campNode.done = 1; sfx(k === "rest" ? "heal" : "buff"); save(); closeModal(); refresh(); toast({ rest: "Le groupe reprend des forces.", train: "Les héros s'entraînent jusqu'à l'aube.", watch: "Vous ravivez les torches." }[k], "good"); };
function showShop(n) {
  const st = n.stock;
  modal(`<h2>${ico("coin", "#7ad0a0")} Le colporteur</h2><p class="lore">« Tout se paie, voyageurs. Surtout ici. »</p><p class="small">Or disponible : <b class="gold">${fmt(S.run.gold + S.gold)}</b> <span class="tiny dim">(expédition + Bastion)</span></p>${st.map((o, i) => `<div class="row card" style="cursor:default;${o.sold ? "opacity:.4" : ""}"><div style="flex:1"><b class="${o.it ? "rar" + o.it.rar : ""}">${o.n}</b><div class="tiny dim">${o.it ? itemLine(o.it) : o.d}</div></div><button class="btn sm ${o.sold || S.run.gold + S.gold < o.cost ? "off" : ""}" data-a="buy" data-v="${i}">${o.sold ? "Vendu" : o.cost + " or"}</button></div>`).join("")}<div class="row" style="justify-content:flex-end;margin-top:8px"><button class="btn main" data-a="leaveShop">Partir</button></div>`, { close: false });
  UI.shopNode = n;
}
ACT.buy = i => { if (!shopBuy(S.run, UI.shopNode, +i)) return toast("Pas assez d'or.", "bad"); sfx("coin"); save(); renderHud(); showShop(UI.shopNode); };
ACT.leaveShop = () => { UI.shopNode.done = 1; save(); closeModal(); refresh(); };
// équipement du butin en cours d'expédition : boutons par héros, sans quitter la fenêtre ouverte
function runEquipBtns(it) {
  const run = S.run; if (!run || !run.loot.includes(it)) return "";
  const hs = runEquipTargets(it); if (!hs.length) return "";
  const rh = relicHooks(run);
  return `<div class="runeq">${hs.sort((a, b) => gearDelta(b, it, rh).score - gearDelta(a, it, rh).score).map(h => equipRow(h, it, "runEquip", it.id + ":" + h.id, rh)).join("")}</div>`;
}
ACT.runEquip = (v, el, e) => {
  e && e.stopPropagation(); const [id, hid] = v.split(":"); const run = S.run; if (!run) return;
  const it = run.loot.find(x => x.id === id), h = heroById(hid); if (!it || !h) return;
  const old = it.kind === "tr" ? null : h.gear[it.kind];
  if (!runEquip(h, it)) return toast("Impossible d'équiper cet objet.", "bad");
  sfx("forge"); save();
  const row = el.closest(".runeq"); if (row) row.outerHTML = `<div class="tiny good" style="margin-top:6px">${ico("up", "#8ad06a", 12)} Équipé sur ${esc(h.name)} (${heroTitle(h)})${old ? ` · ${gearName(old)} rangé dans le butin` : ""}</div>`;
  if (UI.screen === "map" && $("#bagList")) ACT.runBag();
};
ACT.runBag = () => {
  const run = S.run; if (!run) return;
  modal(`<h2>${ico("chest", "#e8c878")} Butin de l'expédition</h2><p class="small dim">Rapporté au Bastion à la fin de l'expédition, ou perdu en cas de déroute. Vous pouvez l'équiper dès maintenant.</p><div class="col" id="bagList">${run.loot.length ? run.loot.map(i => `<div class="reward" style="align-items:flex-start">${slotHTML(i, "itemInfo", i.id)}<div style="flex:1;min-width:0"><b class="rar${i.rar}">${gearName(i)}</b><div class="tiny dim">${RARITY[i.rar].n}${i.cls ? " · " + CLASSES[i.cls].n : ""} — ${itemLine(i)}</div>${runEquipBtns(i)}</div></div>`).join("") : '<div class="empty small">Le sac est vide pour l\'instant.</div>'}</div>`, { wide: 1 });
};
function rewardModal(title, text, R, ups = [], onClose) {
  const it = R.loot || [];
  modal(`<h2>${ico("chest", "#e8c878")} ${title}</h2>${text ? `<p class="lore">${text}</p>` : ""}
  ${R.gold ? `<div class="reward">${ico("coin", "#e8c060", 22)}<b>+${R.gold} or</b></div>` : ""}
  ${R.xp ? `<div class="reward">${ico("star", "#e8c878", 22)}<span>+${R.xp} expérience pour chaque héros</span></div>` : ""}
  ${ups.map(h => `<div class="reward" style="color:var(--gold2)">${ico("up", "#e8c878", 22)}<b>${esc(h.name)}</b> passe niveau ${h.lvl} !${h.lvl === EVO_LVL ? " <span class='small'>(évolution possible)</span>" : ""}</div>`).join("")}
  ${it.map(i => `<div class="reward" style="align-items:flex-start">${slotHTML(i, "itemInfo", i.id)}<div style="flex:1;min-width:0"><b class="rar${i.rar}">${gearName(i)}</b><div class="tiny dim">${RARITY[i.rar].n}${i.cls ? " · " + CLASSES[i.cls].n : ""} — ${itemLine(i)}</div>${runEquipBtns(i)}</div></div>`).join("")}
  ${R.relic ? `<div class="reward">${ico("gem", "#c87aff", 22)}<div><b>Relique : ${RELICS[R.relic].n}</b><div class="tiny">${gl(RELICS[R.relic].d)}</div></div></div>` : ""}
  ${R.mats && (R.mats.fer || R.mats.essence || R.mats.cendre) ? `<div class="reward">${ico("iron", "#a8a8a8", 22)}<span>${[R.mats.fer && "+" + R.mats.fer + " ferraille", R.mats.essence && "+" + R.mats.essence + " essence", R.mats.cendre && "+" + R.mats.cendre + " cendre royale"].filter(Boolean).join(", ")}</span></div>` : ""}
  ${R.shards ? `<div class="reward">${ico("shard", "#c090ff", 22)}<b>+${R.shards} éclat${R.shards > 1 ? "s" : ""} de couronne</b></div>` : ""}
  <div class="row" style="justify-content:flex-end;margin-top:10px"><button class="btn main" data-a="closeModal">Continuer</button></div>`, { close: false, onClose: onClose || (() => refresh()) });
  if (ups.length) sfx("level");
}
function finishRun(outcome) {
  const run = S.run; const fl = run ? run.floor : 0;
  const res = endRun(outcome); save();
  const ach = checkAchievements();
  go("results", res);
  for (const a of ach) setTimeout(() => toast(`${ico("trophy", "#e8c878")} Succès : <b>${a.n}</b>${a.gold ? ` +${a.gold} or` : ""}${a.shards ? ` +${a.shards} éclats` : ""}`, "epic"), 800);
  void fl;
}
SCREENS.results = {
  noNav: 1, title: "Retour au Bastion",
  scene: res => backdrop(res && res.region ? res.region : "bastion", { dark: .6 }),
  html: res => {
    const T = { victory: ["Victoire", "Le gardien est tombé. Vos héros rentrent, couverts de gloire et de sang."], retreat: ["Retraite", "Vous rentrez avant que la nuit ne vous dévore."], wipe: ["Déroute", "Personne n'est resté debout. Vos héros sont ramenés au Bastion par des inconnus… sans leur butin."] }[res.outcome];
    return `<div class="wrap" style="max-width:640px"><div class="panel frame" style="margin-top:10px"><span class="corner c1"></span><span class="corner c2"></span><span class="corner c3"></span><span class="corner c4"></span>
      <h1 style="text-align:center;color:${res.outcome === "wipe" ? "#ff6a5a" : res.outcome === "victory" ? "var(--gold2)" : "var(--txt)"}">${T[0]}</h1><p class="lore" style="text-align:center">${T[1]}</p>
      ${res.story ? `<div class="storybox" style="font-size:16px;padding:6px 10px">${res.story}</div>` : ""}
      <div class="reward">${ico("coin", "#e8c060", 22)}<b>+${res.gold} or</b>${res.outcome === "wipe" ? ' <span class="tiny bad">(moitié perdue)</span>' : ""}</div>
      ${res.shards ? `<div class="reward">${ico("shard", "#c090ff", 22)}<b>+${res.shards} éclats de couronne</b></div>` : ""}
      ${res.mats.fer || res.mats.essence || res.mats.cendre ? `<div class="reward">${ico("iron", "#a8a8a8", 22)}${res.mats.fer} ferraille · ${res.mats.essence} essence${res.mats.cendre ? " · " + res.mats.cendre + " cendre royale" : ""}</div>` : ""}
      ${res.loot.map(i => `<div class="reward">${slotHTML(i, "itemInfo", i.id)}<div><b class="rar${i.rar}">${gearName(i)}</b><div class="tiny dim">${itemLine(i)}</div></div></div>`).join("")}
      ${res.unlocks.map(u => `<div class="reward" style="color:var(--gold2)">${ico("star", "#e8c878", 22)}<b>${u.k === "class" ? "Nouvelle classe à la Taverne : " + CLASSES[u.id].n : u.k === "pet" ? "Nouveau compagnon à la Ménagerie : " + PETS[u.id].n : "Nouvelle destination : " + regionById(u.id).n}</b></div>`).join("")}
      ${res.region === "abime" ? `<p class="small" style="text-align:center">Record de l'Abîme : <b>${S.abyss.best}</b></p>` : ""}
      <div class="row" style="justify-content:center;margin-top:12px"><button class="btn main" data-go="bastion">${ico("castle")}Au Bastion</button></div></div></div>`;
  },
  mount: res => { sfx(res.outcome === "victory" ? "win" : res.outcome === "wipe" ? "lose" : "door"); musicPlay("bastion"); },
};

// reprise après rechargement : une salle entamée mais pas terminée est rejouée
function resumeNode() {
  const run = S.run; if (!run || !run.pos || !$("#modal").hidden || UI.resolving) return;
  const n = run.map[run.pos.c][run.pos.i]; if (!n || n.done) return;
  if (["combat", "elite", "boss"].includes(n.type)) { setTimeout(() => { if (UI.screen === "map") go("combat", { node: n }); }, 300); return; }
  if (n.type === "event") showEvent(n); else if (n.type === "camp") showCamp(n); else if (n.type === "shop") showShop(n); else if (n.type === "treasure") { n.done = 1; }
}
