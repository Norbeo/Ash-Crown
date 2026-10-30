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
    E.pet = S.pets.owned.includes(E.pet) ? E.pet : S.pet; E.threat = Math.min(E.threat || 0, threatMax(E.region || "bourg"));
    const R = regionById(E.region), prog = S.prog[E.region], cleared = prog && prog.clears;
    const avgL = E.party.length ? Math.round(E.party.reduce((a, id) => a + heroById(id).lvl, 0) / E.party.length) : 0;
    const roles = E.party.map(id => CLASSES[heroById(id).cls].role);
    const warn = [!roles.includes("soin") && "Aucun soigneur : les blessures vont s'accumuler.", !roles.includes("tank") && "Aucun tank : vos héros fragiles seront exposés.", E.party.length < 4 && "Moins de 4 héros.", avgL < R.lvl - 1 && E.region !== "abime" && `Niveau conseillé : ${R.lvl}+ (votre groupe : ${avgL}).`].filter(Boolean);
    const regs = [...REGIONS, ABYSS];
    return `<div class="wrap"><h1>Préparer l'expédition</h1>
    ${E.week && weekRule() ? `<div class="panel" style="padding:10px;margin-bottom:10px;border-color:#c9a24a"><b class="gold">${ico("trophy", "#e8c878", 14)} Défi de la semaine : ${weekRule().n}</b> <span class="small">— ${gl(weekRule().d)}</span> <button class="btn ghost sm" data-a="noWeek">Annuler</button>${weekPartyOk(E.party || []) ? `<div class="small bad" style="margin-top:4px">${weekPartyOk(E.party || [])}</div>` : ""}</div>` : ""}
    ${E.daily ? `<div class="panel" style="padding:10px;margin-bottom:10px;border-color:#c9a24a"><b class="gold">${ico("star", "#e8c878", 14)} Expédition du jour</b> <span class="small">— ${R.n}, reliques offertes : ${E.daily.relics.map(k => RELICS[k].n).join(", ")}. Récompenses +25 %.</span> <button class="btn ghost sm" data-a="noDaily">Annuler</button></div>` : ""}
    <h2>Destination <button class="btn ghost sm" style="float:right" data-a="mapView">${UI.listView ? "Carte" : "Liste"}</button></h2>${UI.listView ? "" : worldMapHTML(E, regs)}<div class="grid" style="--min:200px;${UI.listView ? "" : "display:none"}">${regs.map(r => { const un = regionUnlocked(r.id), p = S.prog[r.id]; return `<div class="card ${E.region === r.id ? "sel" : ""} ${un ? "" : "lock"}" data-a="${un && !E.daily ? "pickReg" : ""}" data-v="${r.id}" style="padding:0">${canvasSlot("reg:" + r.id, 280, 120)}<div style="padding:8px 10px"><div class="tiny dim">${r.sub}${r.id === "abime" ? ` · record ${S.abyss.best}` : ` · niv ${r.lvl}+`}</div><h3 style="margin:0">${r.n} ${!un ? ico("lock", "#9a8c7a", 14) : p && p.clears ? ico("crown", "#e8c878", 14) : ""}</h3><p class="tiny dim" style="margin:2px 0 0">${un ? r.d : "Terminez le chapitre précédent."}</p></div></div>`; }).join("")}</div>
    ${E.region === "abime" ? seasonPanelHTML() + abyssOpts(E) : cleared && !E.daily ? `<div class="row" style="margin-top:8px"><span class="small">Menace :</span>${[0, 1, 2, 3, 4].map(t => { const ok = t <= threatMax(E.region); return `<button class="btn sm ${E.threat === t ? "gold" : "ghost"} ${ok ? "" : "off"}" data-a="threat" data-v="${t}" title="${ok ? "" : "Vainquez le gardien en menace " + THREAT_N[t - 1]}">${ok ? "" : ico("lock", "#9a8c7a", 12)}${THREAT_N[t]}</button>`; }).join("")}<span class="tiny dim">Ennemis +${E.threat * 2} niveaux, récompenses +${E.threat * 30} %${threatMax(E.region) < 4 ? ` · vainquez le gardien en menace ${THREAT_N[threatMax(E.region)]} pour débloquer la ${THREAT_N[threatMax(E.region) + 1]}` : ""}</span></div>` : ""}
    ${nightToggleHTML(E)}${hardToggleHTML(E)}
    <div style="margin-top:10px">${rushPanelHTML(E)}</div>
    <h2 style="margin-top:14px">Ordre de marche</h2><p class="tiny dim" style="margin-top:-4px">Le rang 1 est en première ligne, face à l'ennemi. Touchez un héros pour l'ajouter ou le retirer, et une flèche pour changer son rang.</p>
    <div class="partyrow">${[3, 2, 1, 0].map(i => { const h = heroById(E.party[i]); return `<div class="card" style="text-align:center;padding:6px 3px" data-a="${h ? "unparty" : ""}" data-v="${i}"><div class="tiny gold">Rang ${i + 1}</div>${h ? canvasSlot("pt:" + h.id, 96, 120) + `<div class="tiny"><b>${esc(h.name.split(" ")[0])}</b></div><div class="tiny dim">${CLASSES[h.cls].n} ${h.lvl}</div>${isInjured(h) ? '<div class="tiny bad">Blessé (50 % PV)</div>' : ""}<div class="row" style="justify-content:center;gap:2px;margin-top:3px"><button class="btn ghost sm" data-a="mvParty" data-v="${i}:1" ${i >= 3 || !E.party[i + 1] ? "disabled" : ""}>◀</button><button class="btn ghost sm" data-a="mvParty" data-v="${i}:-1" ${i <= 0 ? "disabled" : ""}>▶</button></div>` : '<div class="empty" style="padding:40px 4px">vide</div>'}</div>`; }).join("")}</div>
    ${warn.length ? `<div class="small bad" style="text-align:center">${warn.join("<br>")}</div>` : ""}
    ${synergyHTML(E.party.map(id => heroById(id).cls), S.heroes.filter(h => !E.party.includes(h.id)).map(h => h.cls))}
    ${teamsHTML(E)}${duoHTML(E)}
    <div class="row" style="gap:6px;margin-top:8px">${S.heroes.filter(h => !E.party.includes(h.id)).map(h => `<div class="card" style="padding:4px 8px" data-a="addParty" data-v="${h.id}"><div class="row" style="gap:6px;flex-wrap:nowrap">${canvasSlot("ro:" + h.id, 40, 40)}<div class="tiny"><b>${esc(h.name.split(" ")[0])}</b><br><span class="dim">${CLASSES[h.cls].n} ${h.lvl}${isInjured(h) ? ' · <span class="bad">blessé</span>' : ""}</span></div></div></div>`).join("")}<button class="btn ghost sm" data-a="autoParty">${ico("auto")}Composition auto</button></div>
    <h2 style="margin-top:14px">Compagnon</h2><div class="row">${S.pets.owned.map(id => `<div class="card ${E.pet === id ? "sel" : ""}" style="padding:4px 10px;text-align:center" data-a="pickPet" data-v="${id}">${canvasSlot("pe:" + id, 90, 64)}<div class="tiny"><b>${petName(id)}</b> niv ${petLvl(id)}</div></div>`).join("")}</div>
    <div class="stickybar"><span class="small dim">${ico("potion", "#e86a5a", 16)} ${potionMax() - (E.region === "abime" && (S.abyss.oaths || []).includes("jeune") ? 1 : 0)} potions</span><button class="btn main glow" data-a="launch" ${E.party.length ? "" : "disabled"}>${ico("map")}Commencer l'expédition</button></div></div>`;
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
ACT.noWeek = () => { UI.expe.week = null; refresh(); };
ACT.noDaily = () => { UI.expe.daily = null; refresh(); };
ACT.pickReg = v => { UI.expe.region = v; UI.expe.threat = 0; SC.draw = backdrop(v, { dark: .5 }); refresh(); };
ACT.threat = v => { if (+v > threatMax(UI.expe.region)) return toast(`Vainquez d'abord le gardien en menace ${THREAT_N[+v - 1]}.`, "bad"); UI.expe.threat = +v; refresh(); };
ACT.abFloor = v => { UI.expe.floor = +v; refresh(); };
ACT.oath = k => { const o = S.abyss.oaths; if (o.includes(k)) S.abyss.oaths = o.filter(x => x !== k); else o.push(k); refresh(); };
ACT.addParty = id => { const E = UI.expe; if (E.party.length >= 4) return toast("4 héros au maximum.", "bad"); E.party.push(id); E.party.sort((a, b) => CLASSES[heroById(a).cls].rk[0] - CLASSES[heroById(b).cls].rk[0]); refresh(); };
ACT.unparty = (i, el, e) => { if (e.target.closest("button")) return; UI.expe.party.splice(+i, 1); refresh(); };
ACT.mvParty = (v, el, e) => { e.stopPropagation(); const [i, d] = v.split(":").map(Number); const P = UI.expe.party, j = i + d; if (j < 0 || j >= P.length) return; [P[i], P[j]] = [P[j], P[i]]; refresh(); };
ACT.autoParty = () => { UI.expe.party = autoParty(); refresh(); };
ACT.pickPet = id => { UI.expe.pet = id; S.pet = id; refresh(); };
ACT.launch = () => {
  const E = UI.expe; if (!E.party.length) return;
  const opt = { threat: E.region === "abime" ? 0 : E.threat, floor: E.region === "abime" ? E.floor : 1, night: E.region !== "abime" && !E.daily && E.night ? 1 : 0, hardBoss: E.hard && hardOk(E) ? 1 : 0 };
  if (E.week) { const err = weekPartyOk(E.party); if (err) return toast(err, "bad"); if (E.region !== S.week.region) E.week = null; else { opt.week = 1; opt.seed = S.week.seed; } }
  if (E.daily) { opt.relics = E.daily.relics; opt.seed = E.daily.seed; opt.daily = 1; }
  if (E.rush && rushAvailable()) { startRush(E.party, E.pet); E.rush = 0; save(); sfx("door"); musicPlay("map"); go("map"); toast("Boss rush : les gardiens vous attendent.", "good"); return; }
  startRun(E.region, E.party, E.pet, opt);
  E.daily = null; E.week = null; save(); sfx("door"); musicPlay("map");
  go("map");
  if (!(S.seenScene || {})[S.run.region] && SCENES[S.run.region]) return showScene(S.run.region);
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
      ${run.weather ? `<div class="row" style="gap:4px;margin-top:6px">${weatherTag(run)}</div>` : ""}
      ${run.relics.length ? `<div class="row" style="gap:4px;margin-top:6px">${run.relics.map(k => `<span class="tag" style="cursor:pointer" ${tipAttr(RELICS[k].n, RELICS[k].d)}>${ico(RELICS[k].cursed ? "skull" : "gem", RELICS[k].cursed ? "#e05050" : ["#c8beaa", "#6ab0ff", "#c87aff"][RELICS[k].r])}${RELICS[k].n}${RELICS[k].cursed ? ' <span class="bad tiny">maudite</span>' : ""}</span>`).join("")}</div>` : ""}</div>
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
  if (n.type === "elite" && n.nest && n.nestOn == null) return modal(`<h2>${ico("skull", "#e05050")} Nid d'élites</h2><p class="lore">Deux silhouettes massives se dressent dans l'ombre. Elles ne vous ont pas encore vus.</p><p class="small">Affronter le nid : <b>deux élites</b> à la fois, mais <b>or ×1,8, expérience ×1,5</b>, un objet Épique garanti et un éclat. Ou n'en attirer qu'une seule.</p><div class="row sp" style="margin-top:10px"><button class="btn" data-a="nest" data-v="${v}:0">Une seule élite</button><button class="btn main" data-a="nest" data-v="${v}:1">Attaquer le nid</button></div>`);
  if (run.night && !["combat", "elite", "boss"].includes(n.type) && !n.ambushed && chance(.15)) { // nuit : une élite surgit en chemin
    n.ambushed = 1; enterNode(run, n); run.pendingNode = { c: n.c, i: n.i }; save();
    const fake = { c: n.c, i: n.i, type: "elite", nightAmbush: 1, links: [] }; toast(`${ico("skull", "#e05050")} Une élite surgit des ténèbres sur le chemin !`, "bad");
    return go("travel", { node: fake });
  }
  enterNode(run, n); save();
  go("travel", { node: n });
};
function resolveNode(n) {
  const run = S.run; UI.resolving = 1; setTimeout(() => UI.resolving = 0, 50);
  if (["combat", "elite", "boss"].includes(n.type)) { go("combat", { node: n }); return; }
  go("map");
  if (n.type === "event") return showEvent(n);
  if (n.type === "treasure") { void run; return showTreasure(n); }
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
    let stepT = 0, walkFit = null;
    return (x, t, dt) => {
      const k = (t - t0) / dur, bg = paintRegion(run.region, 1280, 720);
      const bw = Math.max(W, H * 16 / 9) * 1.25, bh = bw * 9 / 16, scroll = ((t - t0) * 70) % bw;
      for (const o of [0, 1]) x.drawImage(bg, -scroll + o * bw - (bw - W) / 2 * 0, Math.min(0, H - bh) * .6, bw, Math.max(bh, H));
      if (!SC.amb || SC.ambKind !== run.region) { SC.amb = makeAmbient(REGION_AMB[run.region] || "braises", 36, W, H); SC.ambKind = run.region; }
      drawAmbient(x, SC.amb, t, dt);
      // espacement d'après la largeur réelle des illustrations ; en portrait on réduit le groupe pour qu'il tienne sans se chevaucher
      if (!walkFit || walkFit.W !== W) { let bw = 0; for (const fr of frames) { const b = spriteBox(fr[0]); bw = Math.max(bw, b ? b.w : 64 * sc); } const pw = pet ? ((spriteBox(pet[0]) || {}).w || 60 * sc) : 0;
        const need = bw * .82 * (party.length - 1) + bw * .5 + (pet ? pw * .9 + bw * .2 : 0), avail = W * (port ? .9 : .7); walkFit = { W, ds: Math.min(1, avail / need), gap: bw * .82, pg: bw * .5 + pw * .5 }; }
      const ds = walkFit.ds, gy = H * (port ? .78 : .86), gap = Math.max(64 * sc * 1.15 * ds, walkFit.gap * ds), fi = Math.floor((t - t0) * 7);
      if (fi !== stepT && fi % 2 === 0) { stepT = fi; sfx("step"); }
      const front = W * (port ? .9 : .58) - (port ? walkFit.gap * .5 * ds : 0) + Math.min(1, k * 1.5) * 20 * ds;
      const blit = (cv, px, py) => x.drawImage(cv, px - cv.ax * ds, py - cv.ay * ds, cv.width * ds, cv.height * ds);
      if (pet) { const cv = pet[fi % 2], px = front - gap * (party.length - 1) - walkFit.pg * ds, py = gy - Math.abs(Math.sin(t * 9)) * 4; x.fillStyle = "rgba(0,0,0,.4)"; x.beginPath(); x.ellipse(px, py + 4, 30 * sc * ds, 6 * sc * ds, 0, 0, 7); x.fill(); blit(cv, px, py); }
      party.forEach((h, i) => { const cv = frames[i][(fi + i) % 4]; const px = front - gap * i; x.fillStyle = "rgba(0,0,0,.45)"; x.beginPath(); x.ellipse(px, gy + 2, 34 * sc * ds, 7 * sc * ds, 0, 0, 7); x.fill(); blit(cv, px, gy); });
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
  modal(`<h2>${ico("quest", "#b48cff")} ${E.n}</h2><p class="lore">${E.t}</p>${E.ch.map((c, i) => { const poor = c.fx.cost && S.gold + S.run.gold < c.fx.cost; return `<button class="btn choice" data-a="evChoice" data-v="${i}" ${poor ? "disabled" : ""}><b>${c.n}</b></button>`; }).join("")}`, { close: false });
  UI.evNode = n;
}
ACT.evChoice = i => {
  const n = UI.evNode, run = S.run; const res = resolveEvent(run, n.ev, +i); n.done = 1; save();
  if (res.fight) { closeModal(); toast(res.text.join("<br>"), "bad"); const fn = { c: n.c, i: n.i, type: "combat", ambush: 1 }; go("combat", { node: fn }); return; }
  sfx(res.relic || res.item ? "coin" : "click");
  modal(`<h2>${EVENTS.find(e => e.id === n.ev).n}</h2>${res.text.map(t => `<p>${t}</p>`).join("")}${res.relic ? `<p class="small"><b>${RELICS[res.relic].n}</b> : ${gl(RELICS[res.relic].d)}</p>` : ""}<div class="row" style="justify-content:flex-end"><button class="btn main" data-a="closeModal">Continuer</button></div>`, { onClose: () => refresh() });
};
function showCamp(n) {
  modal(`<h2>${ico("camp", "#ff9a3a")} Feu de camp</h2><p class="lore">Un instant de répit. Les flammes dansent, les ombres reculent. Que faire de cette nuit ?</p>${campPartyHTML()}${CAMP.map(c => `<button class="btn choice" data-a="camp" data-v="${c.k}"><b>${c.n}</b> — <span class="small">${c.d}</span></button>`).join("")}`, { close: false, mount: m => fillCanvases(m, (c, id) => paintHero(c, heroById(id.split(":")[1]))) });
  UI.campNode = n;
}
// état du groupe autour du feu : PV actuels et ce que rendrait le repos
function campPartyHTML() {
  const run = S.run, rh = relicHooks(run);
  return `<div class="campparty">${runParty().map(h => { const mx = heroStats(h, rh).hp, hp = h.hp == null ? mx : h.hp, dead = run.fallen.includes(h.id), after = dead ? 0 : Math.min(mx, Math.round(hp + mx * .45));
    return `<div class="cph ${dead ? "dead" : ""}">${canvasSlot("h:" + h.id, 64, 72)}<div style="flex:1;min-width:0"><b class="small">${esc(h.name)}</b><div class="bar hp"><i class="gain" style="width:${100 * after / mx}%"></i><i style="width:${100 * hp / mx}%"></i></div><div class="tiny ${dead ? "bad" : hp < mx * .4 ? "bad" : "dim"}">${dead ? "Tombé" : `${hp} / ${mx} PV${after > hp ? ` <span class="good">→ ${after} en se reposant</span>` : ""}`}</div></div></div>`; }).join("")}</div>`;
}
ACT.camp = k => { doCamp(S.run, k); UI.campNode.done = 1; sfx(k === "rest" ? "heal" : "buff"); save(); closeModal(); refresh(); toast({ rest: "Le groupe reprend des forces.", train: "Les héros s'entraînent jusqu'à l'aube.", watch: "Vous ravivez les torches." }[k], "good"); };
function showShop(n) {
  const st = n.stock;
  modal(`<h2>${ico("coin", "#7ad0a0")} Le colporteur</h2><p class="lore">« Tout se paie, voyageurs. Surtout ici. »</p><p class="small">Or disponible : <b class="gold">${fmt(S.run.gold + S.gold)}</b> <span class="tiny dim">(expédition + Bastion)</span></p>${st.map((o, i) => `<div class="row card" style="cursor:default;${o.sold && !(o.it && S.run.loot.includes(o.it)) ? "opacity:.4" : ""}"><div style="flex:1;min-width:0"><b class="${o.it ? "rar" + o.it.rar : ""}">${o.n}</b><div class="tiny dim">${o.it ? itemLine(o.it) : o.d}</div>${o.it ? (o.sold ? runEquipBtns(o.it) : shopPreview(o.it)) : ""}</div><button class="btn sm ${o.sold || S.run.gold + S.gold < o.cost ? "off" : ""}" data-a="buy" data-v="${i}">${o.sold ? "Vendu" : o.cost + " or"}</button></div>`).join("")}${shopSellHTML()}<div class="row" style="justify-content:flex-end;margin-top:8px"><button class="btn main" data-a="leaveShop">Partir</button></div>`, { close: false, outside: () => ACT.leaveShop() });
  UI.shopNode = n;
}
ACT.buy = i => { const o = UI.shopNode.stock[+i]; if (!shopBuy(S.run, UI.shopNode, +i)) return toast("Pas assez d'or.", "bad"); sfx("coin"); save(); renderHud(); showShop(UI.shopNode); if (o && o.it) toast(runEquipTargets(o.it).length ? "Objet ajouté au butin — équipez-le directement ci-dessous." : "Objet ajouté au butin.", "good"); };
ACT.leaveShop = () => { UI.shopNode.done = 1; save(); closeModal(); refresh(); };
// colporteur : avant l'achat, comparaison avec ce que portent les héros de l'expédition capables de l'équiper
function shopPreview(it) {
  const run = S.run, rh = relicHooks(run), hs = runParty().filter(h => !run.fallen.includes(h.id) && canEquip(h, it));
  if (!hs.length) return `<div class="tiny bad" style="margin-top:4px">Aucun héros de l'expédition ne peut l'équiper.</div>`;
  return `<div class="runeq">${hs.sort((a, b) => gearDelta(b, it, rh).score - gearDelta(a, it, rh).score).map(h => { const D = gearDelta(h, it, rh); return `<div class="eqrow ${D.score > 0 ? "better" : ""}"><div class="eqtop"><span class="eqwho">${heroLabel(h)}</span>${D.score > 0 ? `<span class="tiny good">${ico("up", "#8ad06a", 12)}Meilleur</span>` : ""}</div><div class="eqcmp"><span class="tiny dim">${D.old ? `Remplace <span class="rar${D.old.rar}">${gearName(D.old)}</span>` : "Emplacement libre"}</span><span class="chips">${deltaChips(D)}</span></div></div>`; }).join("")}</div>`;
}
// équipement du butin en cours d'expédition : boutons par héros, sans quitter la fenêtre ouverte
function runEquipBtns(it) {
  const run = S.run; if (!run || !run.loot.includes(it)) return "";
  const hs = runEquipTargets(it); if (!hs.length) return "";
  const rh = relicHooks(run);
  return `<div class="runeq">${hs.sort((a, b) => gearDelta(b, it, rh).score - gearDelta(a, it, rh).score).map(h => equipRow(h, it, "runEquip", it.id + ":" + h.id, rh)).join("")}</div>`;
}
ACT.runEquip = (v, el, e) => {
  e && e.stopPropagation(); const [id, hid, sl] = v.split(":"); const run = S.run; if (!run) return;
  const it = run.loot.find(x => x.id === id), h = heroById(hid); if (!it || !h) return;
  if (it.kind === "tr" && !sl && h.gear.tr1 && h.gear.tr2) { // deux bibelots portés : choisir lequel remplacer, sur place
    const row = el.closest(".eqrow"); if (row) row.querySelector(".eqcmp").innerHTML = `<span class="tiny">Remplacer :</span> ${["tr1", "tr2"].map(s => `<button class="btn sm ghost" data-a="runEquip" data-v="${id}:${hid}:${s}"><span class="rar${h.gear[s].rar}">${gearName(h.gear[s])}</span></button>`).join(" ")}`; return; }
  const old = it.kind === "tr" ? null : h.gear[it.kind];
  if (!runEquip(h, it, run, sl)) return toast("Impossible d'équiper cet objet.", "bad");
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
  ${R.tome ? `<div class="reward">${ico("book", "#9ad0ff", 22)}<b>+${R.tome} tome d'expérience</b> <span class="tiny dim">(fiche d'un héros moins aguerri)</span></div>` : ""}
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
// bilan d'expédition : chaque héros, le plus beau coup, les ennemis notables, les chiffres clés
function runSummaryHTML(res) {
  const M = res.sum, mx = Math.max(1, ...M.heroes.map(h => h.dmg)), bestH = M.best && M.heroes.find(h => h.id === M.best.hid);
  const mvp = M.heroes.slice().sort((a, b) => (b.dmg + b.heal * 1.2) - (a.dmg + a.heal * 1.2))[0];
  const stat = (ic, c, v, n) => `<div class="sumstat">${ico(ic, c, 20)}<b>${v}</b><span class="tiny dim">${n}</span></div>`;
  return `<div class="sep"></div><h3 style="text-align:center">Bilan de l'expédition</h3>
    <div class="sumstats">${stat("map", "#c8a070", M.rooms, "salles")}${stat("swords", "#ff7a5a", M.combats, "combats")}${stat("skull", "#d8ccb4", M.kills, "ennemis tués")}${stat("star", "#ffc04a", M.crits, "critiques")}${stat("torch", "#ffb050", M.light, "lueur finale")}${stat("hourglass", "#9ab8ff", M.mins + " min", "durée")}</div>
    ${M.best ? `<div class="reward">${ico("flare", "#ff9a4a", 22)}<div><b>Plus beau coup : ${M.best.v} dégâts${M.best.crit ? " (critique)" : ""}</b><div class="tiny dim">${bestH ? esc(bestH.name) : "?"} — ${esc(M.best.sk || "attaque")} sur ${esc(M.best.vs || "un ennemi")}</div></div></div>` : ""}
    ${M.foes.length ? `<div class="reward">${ico("crown", "#e8c878", 22)}<div><b>Ennemis redoutables vaincus</b><div class="tiny dim">${M.foes.map(f => esc(f.name) + (f.boss ? " (gardien)" : "")).join(" · ")}</div></div></div>` : ""}
    ${M.relics.length ? `<div class="reward">${ico("gem", "#c87aff", 22)}<div><b>Reliques portées</b><div class="tiny dim">${M.relics.map(k => RELICS[k].n).join(" · ")}</div></div></div>` : ""}
    <div class="sumheroes">${M.heroes.map(h => `<div class="sumhero ${h.fallen ? "dead" : ""}">${canvasSlot("h:" + h.id, 70, 80)}<div style="flex:1;min-width:0">
      <div class="row sp" style="flex-wrap:nowrap"><b class="small">${esc(h.name)}</b>${h.fallen ? '<span class="tag bad">Tombé</span>' : mvp && h.id === mvp.id ? '<span class="tag gold">Héros de l\'expédition</span>' : ""}</div>
      <div class="tiny dim">${CLASSES[h.cls].n} · niv ${h.lvl}${h.xp ? ` · +${h.xp} xp` : ""}</div>
      <div class="bar" style="margin:3px 0"><i style="width:${100 * h.dmg / mx}%"></i></div>
      <div class="tiny">${ico("sword", "#ff7a5a", 12)} ${fmt(h.dmg)} dégâts · ${ico("heal", "#8fe07a", 12)} ${fmt(h.heal)} soins · ${ico("shield", "#9ab8ff", 12)} ${fmt(h.taken)} reçus · ${ico("skull", "#d8ccb4", 12)} ${h.kills}</div></div></div>`).join("")}</div>`;
}
SCREENS.results = {
  noNav: 1, title: "Retour au Bastion",
  scene: res => backdrop(res && res.region ? res.region : "bastion", { dark: .6 }),
  html: res => {
    const T = { victory: ["Victoire", "Le gardien est tombé. Vos héros rentrent, couverts de gloire et de sang."], retreat: ["Retraite", "Vous rentrez avant que la nuit ne vous dévore."], wipe: ["Déroute", "Personne n'est resté debout. Vos héros sont ramenés au Bastion par des inconnus… sans leur butin."] }[res.outcome];
    return `<div class="wrap" style="max-width:640px"><div class="panel frame" style="margin-top:10px"><span class="corner c1"></span><span class="corner c2"></span><span class="corner c3"></span><span class="corner c4"></span>
      <h1 style="text-align:center;color:${res.outcome === "wipe" ? "#ff6a5a" : res.outcome === "victory" ? "var(--gold2)" : "var(--txt)"}">${T[0]}</h1><p class="lore" style="text-align:center">${T[1]}</p>
      ${res.story ? `<div class="storybox" style="font-size:16px;padding:6px 10px">${res.story}</div>${SCENE_END[res.region] ? `<button class="btn sm" style="margin-top:6px" data-a="replayEnd" data-v="${res.region}">▶ Voir l'épilogue</button>` : ""}` : ""}
      <div class="reward">${ico("coin", "#e8c060", 22)}<b>+${res.gold} or</b>${res.outcome === "wipe" ? ' <span class="tiny bad">(moitié perdue)</span>' : ""}</div>
      ${res.shards ? `<div class="reward">${ico("shard", "#c090ff", 22)}<b>+${res.shards} éclats de couronne</b></div>` : ""}
      ${res.mats.fer || res.mats.essence || res.mats.cendre ? `<div class="reward">${ico("iron", "#a8a8a8", 22)}${res.mats.fer} ferraille · ${res.mats.essence} essence${res.mats.cendre ? " · " + res.mats.cendre + " cendre royale" : ""}</div>` : ""}
      ${res.loot.map(i => `<div class="reward">${slotHTML(i, "itemInfo", i.id)}<div><b class="rar${i.rar}">${gearName(i)}</b><div class="tiny dim">${itemLine(i)}</div></div></div>`).join("")}
      ${res.unlocks.map(u => `<div class="reward" style="color:var(--gold2)">${ico("star", "#e8c878", 22)}<b>${u.k === "class" ? "Nouvelle classe à la Taverne : " + CLASSES[u.id].n : u.k === "pet" ? "Nouveau compagnon à la Ménagerie : " + PETS[u.id].n : "Nouvelle destination : " + regionById(u.id).n}</b></div>`).join("")}
      ${res.threatUp ? `<div class="reward" style="color:var(--gold2)">${ico("skull", "#ff8a6a", 22)}<b>Menace ${THREAT_N[res.threatUp.t]} débloquée : ${regionById(res.threatUp.region).n}</b></div>` : ""}
      ${res.week ? `<div class="reward" style="color:var(--gold2)">${ico("trophy", "#e8c878", 22)}<b>Défi de la semaine relevé ! +${res.week.gold} or · +${res.week.shards} éclats · +${res.week.essence} essence</b></div>` : ""}
      ${res.goldTrophy ? `<div class="reward" style="color:var(--gold2)">${ico("trophy", "#ffd27a", 22)}<b>Trophée doré : ${esc(res.goldTrophy)} vaincu en mode Hardi !</b></div>` : ""}${extrasResultsHTML(res)}${bondResultsHTML(res)}${(res.hidden || []).map(a => `<div class="reward" style="color:var(--gold2)">${ico("star", "#e8c878", 22)}<b>Succès caché : ${a.n} — ${a.d} (+${a.gold} or, +${a.shards} éclats)</b></div>`).join("")}${(res.vets || []).map(v => `<div class="reward" style="color:var(--gold2)">${ico("crown", "#e8c878", 22)}<b>${esc(v.name.split(" ")[0])} devient ${esc(v.t)} : ${v.d}</b></div>`).join("")}${(res.classCh || []).map(c => `<div class="reward" style="color:var(--gold2)">${ico("trophy", "#e8c878", 22)}<b>Défi de classe — ${CLASSES[c.cls].n} : ${CLASS_GOALS[c.g]} gardiens vaincus ! +${c.gold} or, +${c.sh} éclats</b></div>`).join("")}
      ${res.sum ? runSummaryHTML(res) : ""}
      ${res.region === "abime" ? `<p class="small" style="text-align:center">Record de l'Abîme : <b>${S.abyss.best}</b></p>` : ""}
      <div class="row" style="justify-content:center;margin-top:12px"><button class="btn main" data-go="bastion">${ico("castle")}Au Bastion</button></div></div></div>`;
  },
  mount: res => { fillCanvases($("#view"), (c, id) => { const h = heroById(id.split(":")[1]); if (h) paintHero(c, h); }); sfx(res.outcome === "victory" ? "win" : res.outcome === "wipe" ? "lose" : "door"); musicPlay("bastion"); if (res.finale) setTimeout(() => showFinale(), 1800); },
};

// reprise après rechargement : une salle entamée mais pas terminée est rejouée
function resumeNode() {
  const run = S.run; if (!run || !run.pos || !$("#modal").hidden || UI.resolving) return;
  const n = run.map[run.pos.c][run.pos.i]; if (!n || n.done) return;
  if (["combat", "elite", "boss"].includes(n.type)) { setTimeout(() => { if (UI.screen === "map") go("combat", { node: n }); }, 300); return; }
  if (n.type === "event") showEvent(n); else if (n.type === "camp") showCamp(n); else if (n.type === "shop") showShop(n); else if (n.type === "treasure") showTreasure(n);
}
