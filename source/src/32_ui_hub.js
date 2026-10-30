/* ═══════════════════════ Le Bastion : bâtiments et gestion ═══════════════════════ */
function hubLayout(w, h) {
  const port = w < h * .9, s = port ? Math.min(w / 4.2, h / 8) : Math.min(w / 8.5, h / 5.2);
  const P = (k, fx, fy, k2 = 1) => ({ k, x: fx * w, y: fy * h, s: s * k2 });
  // portrait : tout le monde au sol de la cour, en trois rangées (fond → devant)
  return port ? [P("academie", .22, .47, .72), P("menagerie", .78, .47, .72), P("chapelle", .14, .64, .82), P("fonderie", .86, .64, .82), P("porte", .5, .7, .98), P("taverne", .25, .85, .9), P("forge", .75, .85, .9)]
    : [P("academie", .33, .6, .78), P("menagerie", .67, .6, .78), P("chapelle", .1, .8), P("taverne", .27, .82), P("porte", .5, .78, 1.15), P("forge", .73, .82), P("fonderie", .9, .8)];
}
// ménagerie : d'abord les compagnons possédés (l'actif en tête), puis ceux qu'on peut acheter, enfin ceux à débloquer plus tard
function petOrder() {
  const rank = id => id === S.pet ? 0 : S.pets.owned.includes(id) ? 1 : petUnlocked(id) ? 2 : 3;
  return PET_IDS.slice().sort((a, b) => rank(a) - rank(b) || (PETS[a].unlock || 0) - (PETS[b].unlock || 0) || (PETS[a].cost || 0) - (PETS[b].cost || 0));
}
const BLD_CACHE = {};
// nom selon le niveau (la Chapelle en ruine devient Chapelle restaurée puis Cathédrale)
function bldName(k) { const B = BUILDINGS[k], l = (S.bld || {})[k] || 1; return ((B.nl || []).find(([n]) => l >= n) || [0, B.n])[1]; }
function bldTinted(im, lvl, k) { // niveau 1 : bâtiment délabré, assombri ; puis il s'éclaire à chaque amélioration
  const key = k + "|" + lvl + "|" + im.width; if (BLD_CACHE[key]) return BLD_CACHE[key];
  const c = mkCanvas(im.width, im.height), x = c.getContext("2d"); x.drawImage(im, 0, 0);
  const dark = Math.max(0, .5 - (lvl - 1) * .12); if (dark > 0) { x.globalCompositeOperation = "source-atop"; x.fillStyle = `rgba(12,8,14,${dark})`; x.fillRect(0, 0, c.width, c.height); }
  if (lvl >= 4) { x.globalCompositeOperation = "source-atop"; const g = x.createLinearGradient(0, 0, 0, c.height); g.addColorStop(0, `rgba(255,200,110,${.05 * (lvl - 3)})`); g.addColorStop(1, "rgba(255,140,60,0)"); x.fillStyle = g; x.fillRect(0, 0, c.width, c.height); }
  return BLD_CACHE[key] = c;
}
// illustration évolutive : bld_<k>_2 dès le niveau 3, bld_<k>_3 dès le niveau 5 (si peintes)
const bldScale = k => (SC.w < SC.h * .9 ? 1.15 : 1.35) * (k === "porte" ? .85 : 1); // bâtiments agrandis par rapport au décor de la cour (moins en portrait)
function bldArtName(k, lvl) { if (k !== "porte") for (const [n, v] of [[5, 3], [3, 2]]) if (lvl >= n && artHas("bld_" + k + "_" + v)) return "bld_" + k + "_" + v; return "bld_" + k; }
// taille affichée d'un bâtiment (sert au dessin et à la zone cliquable / étiquette)
function bldDims(k, s, lvl) {
  const nm = bldArtName(k, lvl), im = artImg(nm) || artImg("bld_" + k); if (!im) return null;
  const grow = k === "porte" ? 1 : .86 + Math.min(lvl, 8) * .035;
  const hh = s * grow * bldScale(k) * (k === "porte" ? 1.62 : k === "academie" ? 2.0 : k === "chapelle" ? 1.9 : 1.3), sc = Math.min(hh / im.height, s * grow * bldScale(k) * 1.9 / im.width);
  return { im, nm, w: im.width * sc, h: im.height * sc };
}
function drawBuilding(x, k, bx, by, s, lvl, t) { // bâtiment peint : grandit, s'éclaire et se pare de bannières et de braseros à chaque niveau
  const D = bldDims(k, s, lvl); if (!D) return; const { im, nm, w, h } = D;
  if (lvl > 1) glow(x, bx, by - h * .35, w * (.45 + lvl * .06), "#ff9a4a", .05 + lvl * .03 + Math.sin(t * 2 + bx) * .015);
  x.drawImage(k === "porte" ? im : bldTinted(im, lvl, nm), bx - w / 2, by - h + s * .04, w, h);
  if (k === "porte") return;
}
SCREENS.bastion = {
  title: "Le Bastion", tab: "bastion",
  scene: () => (x, t, dt) => {
    const portBg = SC.w < SC.h * .9 && artHas("bg_bastion_port"); backdrop(artHas("bg_bastion2") ? "bastion2" : "bastion", { align: .9, img: portBg ? "bg_bastion_port" : null, portShift: SC.w < SC.h * .9 && !portBg ? .16 : 0 })(x, t, dt);
    const L = hubLayout(SC.w, SC.h);
    // sol de la cour
    x.fillStyle = lgrad(x, 0, SC.h * .5, 0, SC.h, [[0, "rgba(10,8,10,0)"], [1, "rgba(10,8,10,.6)"]]); x.fillRect(0, SC.h * .5, SC.w, SC.h);
    for (const b of L) { x.fillStyle = "rgba(0,0,0,.45)"; x.beginPath(); x.ellipse(b.x, b.y, b.s * .75, b.s * .1, 0, 0, 7); x.fill(); drawBuilding(x, b.k, b.x, b.y, b.s, b.k === "porte" ? 1 : S.bld[b.k], t); }
    if (typeof bastionLife === "function") bastionLife(x, L, t, dt); // fumées, fenêtres, héros qui se promènent
    // feu de camp central
    const fx = SC.w * .5, fy = SC.h * (SC.w < SC.h * .9 ? .84 : .93); const f = .8 + Math.sin(t * 9) * .1;
    glow(x, fx, fy, 90, "#ff6a1a", .35 * f); x.save(); x.globalCompositeOperation = "lighter"; for (let i = 0; i < 5; i++) glow(x, fx + Math.sin(t * 5 + i) * 4, fy - 8 - i * 6, 14 - i * 2, i < 2 ? "#ffe08a" : "#ff7a2a", .7); x.restore();
  },
  html: () => {
    const L = hubLayout(SC.w || innerWidth, SC.h || innerHeight);
    const names = { porte: "La Porte", ...Object.fromEntries(Object.keys(BUILDINGS).map(k => [k, bldName(k)])) };
    const note = k => (k === "taverne" && S.heroes.length < 4) || (k === "fonderie" && idleBank() >= fonderieRate()) || (k === "academie" && S.heroes.some(h => h.lvl >= EVO_LVL && !h.evo)) || (k === "chapelle" && S.heroes.some(isInjured));
    const ct = S.daily.contracts || [];
    const off = $("#view") ? $("#view").getBoundingClientRect().top : 0;
    setTimeout(() => document.querySelectorAll(".hot .lbl").forEach(l => { l.style.transform = ""; const r = l.getBoundingClientRect(), d = r.left < 4 ? 4 - r.left : r.right > innerWidth - 4 ? innerWidth - 4 - r.right : 0; if (d) l.style.transform = `translateX(${d}px)`; }), 0); // étiquettes jamais coupées au bord de l'écran
    if (UI.hideDaily == null) UI.hideDaily = false;
    return `${L.map(b => { const D = bldDims(b.k, b.s, b.k === "porte" ? 1 : S.bld[b.k]), hh = D ? D.h * .97 : b.s * bldScale(b.k) * 1.3, ww = D ? Math.max(D.w * .8, b.s) : b.s * 1.3; return `<button class="hot" style="left:${b.x}px;top:${b.y - off - hh}px;width:${ww}px;height:${hh}px" data-a="bld" data-v="${b.k}"><span class="lbl">${note(b.k) ? '<i class="dotn"></i>' : ""}${names[b.k]}${b.k !== "porte" ? ` <b>${"I II III IV V VI".split(" ")[S.bld[b.k] - 1]}</b>` : ""}</span></button>`; }).join("")}
    ${UI.hubOpen ? `<div class="panel" style="position:absolute;left:10px;top:6px;width:min(300px,calc(100vw - 20px));padding:10px 12px;max-height:calc(100% - 20px);overflow:auto" id="dailyp">
      <div class="row sp" style="margin-bottom:6px"><b class="small gold">Tableau du Bastion</b><button class="btn sm ghost" data-a="hubPanel" title="Réduire">${ico("close", "#c8b8a0", 12)}Réduire</button></div>
      ${(() => { const A = advNext(); return `<div class="small" data-tipn="Niveau d'aventure" data-tipd="Monte avec les combats gagnés, les expéditions, les gardiens vaincus et la profondeur de l'Abîme. Il conditionne l'amélioration des bâtiments."><b class="gold">${ico("crown", "#e8c878", 14)} Niveau d'aventure ${A.l}</b><div class="bar xp" style="margin:3px 0 8px"><i style="width:${100 * A.cur / A.need}%"></i></div></div>`; })()}<div class="row sp"><h3 style="margin:0">${ico("daily", "#e8c878", 16)} Défis du jour</h3><button class="btn ghost sm" data-a="toggleDaily">${UI.hideDaily ? "+" : "–"}</button></div>
      ${UI.hideDaily ? "" : ct.map((c, i) => `<div style="margin-top:6px"><div class="row sp small"><span>${c.n}</span><span class="${c.p >= c.goal ? "good" : "dim"}">${c.p}/${c.goal}</span></div><div class="row" style="gap:6px"><div class="bar xp" style="flex:1"><i style="width:${100 * c.p / c.goal}%"></i></div>${c.claimed ? '<span class="tiny good">✓</span>' : c.p >= c.goal ? `<button class="btn gold sm" data-a="claimCt" data-v="${i}">+${c.gold}</button>` : `<span class="tiny dim">${c.gold} or</span>`}</div></div>`).join("") + `<div class="sep" style="margin:8px 0"></div><button class="btn ${S.daily.done ? "ghost off" : "main"} sm" style="width:100%" data-a="dailyRun">${ico("star")}${S.daily.done ? "Expédition du jour accomplie" : "Expédition du jour (+récompenses)"}</button>` + weekPanel()}
    </div>` : hubRailHTML()}`;
  },
  mount: () => { tutoHint("bastion", "Touchez un bâtiment pour y entrer. <b>La Porte</b> mène aux expéditions."); },
  resize: () => refresh(),
};
ACT.hubPanel = () => { UI.hubOpen = !UI.hubOpen; try { localStorage.setItem("cc-hubOpen", UI.hubOpen ? "1" : ""); } catch (e) {} refresh(); };
ACT.toggleDaily = () => { UI.hideDaily = !UI.hideDaily; refresh(); };
ACT.claimCt = i => { const c = S.daily.contracts[+i]; if (!c || c.claimed || c.p < c.goal) return; c.claimed = 1; S.gold += c.gold; sfx("coin"); toast(`+${c.gold} or`, "good"); save(); refresh(); };
function weekPanel() {
  if (!S.week) weekCheck(); const W = weekRule(); if (!W) return ""; const R = weekReward();
  return `<div class="sep" style="margin:8px 0"></div><div class="small"><b class="gold">${ico("trophy", "#e8c878", 14)} Défi de la semaine : ${W.n}</b></div><div class="tiny" style="margin:2px 0 6px">${gl(W.d)} — ${regionById(S.week.region).n}. Victoire : +${R.gold} or, +${R.shards} éclats, +${R.essence} essence.</div><button class="btn ${S.week.done ? "ghost off" : "gold"} sm" style="width:100%" data-a="weekRun">${ico("trophy")}${S.week.done ? "Défi de la semaine relevé" : "Relever le défi"}</button>`;
}
ACT.weekRun = () => { if (!S.week || S.week.done) return; UI.expe = { region: S.week.region, week: 1 }; go("expe"); };
ACT.dailyRun = () => { if (S.daily.done) return; const d = dailyRun(); UI.expe = { region: d.region, daily: d }; go("expe"); };
function tutoHint(k, text) { if (S.tuto[k]) return; S.tuto[k] = 1; setTimeout(() => toast(`${ico("info", "#e8c878")} ${text}`), 700); }
ACT.bld = k => { if (k === "porte") { sfx("door"); go("expe"); return; } sfx("open"); openBuilding(k); };
function bldFooter(k) {
  const B = BUILDINGS[k], c = bldCost(k), l = S.bld[k];
  const next = { taverne: `Caserne : ${4 + (l + 1) * 2} héros · ${3 + l} recrues mieux aguerries`, forge: `Palier d'armure ${l + 1} · amélioration jusqu'à +${(l + 1) * 2}`, chapelle: `${3 + l} potions par expédition · soins moins chers`, academie: `Rang de compétence maximal ${l + 1}`, menagerie: `${l + 2} compagnons`, fonderie: `${[0, 18, 34, 58, 90, 135][l + 1]} or/h, réserve ${[0, 6, 8, 10, 12, 16][l + 1]} h` }[k];
  return `<div class="sep"></div><div class="row sp"><div><b>${bldName(k)}</b> <span class="gold">niveau ${l}</span>${c ? `<div class="small dim">Niveau ${l + 1} : ${next}</div><div class="tiny ${advLevel() >= bldAdvReq(k) ? "good" : "bad"}">Niveau d'aventure ${bldAdvReq(k)} requis (actuel : ${advLevel()})</div>` : '<div class="small good">Niveau maximal</div>'}</div>${c ? `<button class="btn gold sm ${canPay(c) && advLevel() >= bldAdvReq(k) ? "" : "off"}" data-a="upBld" data-v="${k}">${ico("up")}${c.gold} ${ico("coin", "#e8c060")}${c.shards ? ` ${c.shards} ${ico("shard", "#c090ff")}` : ""}</button>` : ""}</div>`;
}
ACT.upBld = k => { const r = upgradeBld(k); if (r.err) return toast(r.err, "bad"); sfx("forge"); toast(`${bldName(k)} : niveau ${S.bld[k]} !`, "good"); save(); renderHud(); const L = (BLD_SCENES[k] || {})[S.bld[k]]; if (L) showLines(`${BUILDINGS[k].n} — niveau ${S.bld[k]}`, L, () => openBuilding(k)); else openBuilding(k); };
function openBuilding(k, tab) {
  const B = BUILDINGS[k]; let body = "";
  UI.bldTab = tab || UI.bldTab || "";
  if (k === "taverne") {
    body = `<p class="lore">Une odeur de bière tiède et de sang séché. Des âmes perdues attendent un capitaine.</p><p class="small">Caserne : <b>${S.heroes.length}/${rosterMax()}</b> héros.</p>${typeof legendsHTML === "function" ? legendsHTML() : ""}
    <div class="grid" style="--min:170px">${S.recruits.map((h, i) => { const C = CLASSES[h.cls], c = recruitPrice(i); return `<div class="card" style="text-align:center">${canvasSlot("r:" + i, 150, 188)}<h3 style="margin:2px 0">${esc(h.name)}</h3><div class="row" style="justify-content:center;gap:4px">${roleTag(C.role)}<span class="tag">${h.evo ? CLASSES[h.cls].evos[h.evo].n : C.n} · niv ${h.lvl}</span></div><p class="tiny" style="min-height:30px;margin-bottom:2px">${h.traits.map(t => `<span class="${TRAITS[t].good ? "good" : "bad"}" ${tipAttr(TRAITS[t].n, TRAITS[t].d)}>${TRAITS[t].n}</span>`).join(" · ")}</p><div class="tiny dim" style="margin-bottom:6px">${h.skills.map(k => skillDef(h, k).n).join(" · ")}</div><div class="row" style="justify-content:center;gap:4px"><button class="btn ghost sm" data-a="recruitInfo" data-v="${i}">${ico("info")}Détails</button><button class="btn ${c === 0 ? "main" : ""} sm" data-a="recruit" data-v="${i}">${c === 0 ? "Gratuit" : c + " " + ico("coin", "#e8c060")}</button></div></div>`; }).join("") || '<div class="empty">Plus personne. Revenez après une expédition.</div>'}</div>
    <div class="row" style="margin-top:10px"><button class="btn ghost sm" data-a="reroll">${ico("dice")}Nouvelles recrues (${40 + S.bld.taverne * 20} or)</button><span class="small dim">Les recrues changent après chaque expédition. Classes débloquées : ${CLASS_IDS.filter(classUnlocked).length}/${CLASS_IDS.length}.</span></div>${tavernCalmHTML()}`;
  }
  if (k === "forge") {
    const tabs = ["craft", "inv"]; const tb = tabs.includes(UI.bldTab) ? UI.bldTab : "craft";
    const head = `<div class="tabs"><button class="btn sm ${tb === "craft" ? "on" : ""}" data-a="bldTab" data-v="forge:craft">${ico("anvil")}Forger</button><button class="btn sm ${tb === "inv" ? "on" : ""}" data-a="bldTab" data-v="forge:inv">${ico("chest")}Inventaire (${S.inv.length})</button></div>`;
    if (tb === "craft") {
      const cls = UI.forgeCls && S.heroes.some(h => h.cls === UI.forgeCls) ? UI.forgeCls : (S.heroes[0] || {}).cls;
      const owned = [...new Set(S.heroes.map(h => h.cls))];
      body = head + `<p class="lore">L'enclume chante. Plus la forge est grande, plus l'acier est noble — et plus vos héros sont redoutables à voir.</p>
      <div class="row">${owned.map(c => `<button class="btn sm ${c === cls ? "on gold" : "ghost"}" data-a="forgeCls" data-v="${c}">${CLASSES[c].n}</button>`).join("")}</div>
      <div class="grid" style="--min:250px;margin-top:10px">${[1, 2, 3, 4, 5, 6].map(t => { const c = craftCost(t), lock = t > S.bld.forge; return `<div class="card ${lock ? "lock" : ""}" style="cursor:default"><div class="row">${t >= 6 ? Object.keys(CLASSES[cls].evos).map(k => `<span data-a="tierZoom" data-v="${cls}:6:${k}" style="cursor:zoom-in">${canvasSlot("tier:" + cls + ":6:" + k, 60, 95)}</span>`).join("") : `<span data-a="tierZoom" data-v="${cls}:${t}" style="cursor:zoom-in">${canvasSlot("tier:" + cls + ":" + t, 76, 95)}</span>`}<div style="flex:1"><h3>${TIER_N[t]} ${lock ? ico("lock", "#9a8c7a", 14) : ""}</h3><div class="tiny gold">Héros niveau ${TIER_LVL[t]}+</div><div class="tiny dim">${t >= 6 ? "Ascendant : " + GEAR_NAMES[cls].wpn[4] + "<br>" + Object.values(CLASSES[cls].evos).map(E => "Armure ascendante : " + E.n).join("<br>") + '<br><span class="gold">Réservé aux héros évolués : chaque voie a son armure, qui révèle son aspect final</span>' : GEAR_NAMES[cls].wpn[t - 1] + "<br>" + GEAR_NAMES[cls].arm[t - 1]}</div><div class="tiny" style="margin-top:4px">${c.gold} or · ${c.fer} fer${c.essence ? ` · ${c.essence} ess.` : ""}${c.cendre ? ` · ${c.cendre} cendre` : ""}</div></div></div>${lock ? `<p class="tiny dim">Forge niveau ${t} requise</p>` : `<div class="row" style="margin-top:6px"><button class="btn sm ${canPay(c) ? "" : "off"}" data-a="craft" data-v="${cls}:wpn:${t}">${ico("weapon")}Arme</button>${t >= 6 ? Object.entries(CLASSES[cls].evos).map(([k, E]) => `<button class="btn sm ${canPay(c) && S.heroes.some(h => h.cls === cls && h.evo === k) ? "" : "off"}" data-a="craft" data-v="${cls}:arm:6:${k}" ${S.heroes.some(h => h.cls === cls && h.evo === k) ? "" : 'title="Faites d\'abord évoluer un héros dans cette voie"'}>${ico("armor")}${E.n}</button>`).join("") : `<button class="btn sm ${canPay(c) ? "" : "off"}" data-a="craft" data-v="${cls}:arm:${t}">${ico("armor")}Armure</button>`}</div>`}</div>`; }).join("")}</div>`;
    } else {
      const junk = S.inv.filter(it => !itemUseful(it) && !itemFuture(it));
      body = head + (S.inv.length ? `<div class="row sp" style="margin-bottom:8px"><span class="tiny dim">${junk.length ? `${junk.length} objet${junk.length > 1 ? "s" : ""} moins bon${junk.length > 1 ? "s" : ""} que ce que portent vos héros` : "Tout l'inventaire peut encore servir."}</span><button class="btn sm ${junk.length ? "gold" : "ghost off"}" data-a="salvAll">${ico("iron")}Recyclage rapide</button></div>` : "") + invList();
    }
  }
  if (k === "chapelle") {
    const inj = S.heroes.filter(isInjured);
    body = `<p class="lore">Les cierges ne s'éteignent jamais ici. Les blessés reprennent des forces, lentement.</p><p class="small">Potions par expédition : <b>${potionMax()}</b>. Les blessés guérissent seuls avec le temps ; ils peuvent aussi partir blessés, à 50 % de leurs PV.</p>
    ${inj.length ? inj.map(h => { const c = Math.round(healCost(h) * (1 - (S.bld.chapelle - 1) * .15)); const m = Math.ceil((h.injured - Date.now()) / 60000); return `<div class="row sp card" style="cursor:default">${canvasSlot("h:" + h.id, 56, 56)}<div style="flex:1"><b>${esc(h.name)}</b> <span class="small dim">· ${heroTitle(h)} niv ${h.lvl}</span><div class="small bad">Blessé · guéri dans ${m} min</div></div><button class="btn sm" data-a="heal" data-v="${h.id}">${ico("heal")}${c} or</button></div>`; }).join("") : '<div class="empty">Aucun blessé. Que la lumière vous garde.</div>'}${chapelMarksHTML()}`;
  }
  if (k === "academie") {
    const evo = S.heroes.filter(h => h.lvl >= EVO_LVL && !h.evo);
    body = `<p class="lore">Des livres, des maîtres d'armes fatigués, et des leçons écrites dans le sang.</p><p class="small">Rang maximal des compétences : <b>${skillRankMax()}</b>, +1 tous les 10 niveaux du héros (chaque rang : +10 % d'efficacité). Améliorez les compétences depuis la fiche de chaque héros.</p>
    ${evo.length ? `<h3>Prêts à évoluer</h3>${evo.map(h => `<div class="row sp card" data-go="hero" data-arg="${h.id}">${canvasSlot("h:" + h.id, 56, 56)}<div style="flex:1"><b>${esc(h.name)}</b> <span class="small dim">· ${CLASSES[h.cls].n} niv ${h.lvl}</span><div class="small gold">Peut devenir ${Object.values(CLASSES[h.cls].evos).map(e => e.n).join(" ou ")}</div></div>${ico("up", "#e8c878")}</div>`).join("")}` : `<p class="small dim">Au niveau ${EVO_LVL}, chaque héros choisit une voie : deux évolutions par classe, chacune avec ses compétences, son ultime et son apparence. Au niveau ${APEX_LVL}, il atteint son apogée.</p>`}`;
  }
  if (k === "menagerie") {
    body = `<p class="lore">Grognements, plumes et yeux luisants dans le noir. Un seul compagnon vous suit en expédition.</p><div class="grid" style="--min:200px">${petOrder().map(id => { const P = PETS[id], own = S.pets.owned.includes(id), un = petUnlocked(id), ev = petEvolved(id), l = petLvl(id); return `<div class="card ${S.pet === id ? "sel" : ""} ${!un ? "lock" : ""}" style="text-align:center;cursor:default">${canvasSlot("p:" + id + ":" + (ev ? 1 : 0), 170, 120)}<h3 style="margin:0">${petName(id)}</h3><div class="row" style="justify-content:center;gap:4px">${roleTag(P.role)}${own ? `<span class="tag">niv ${l}</span>` : ""}</div><p class="tiny dim" style="min-height:32px">${ev ? P.evo.d : P.d}</p><button class="btn ghost sm" data-a="petInfo" data-v="${id}" style="margin-bottom:4px">${ico("info")}Compétences</button><br>${own ? `<div class="bar xp" style="margin:4px 0"><i style="width:${l >= 20 ? 100 : 100 * (S.pets.xp[id] || 0) / petXpNeed(l)}%"></i></div>` + (S.pet === id ? '<span class="tag gold">Compagnon actif</span>' : `<button class="btn sm" data-a="setPet" data-v="${id}">Emmener</button>`) + (!ev && l >= PET_EVO_LVL ? ` <button class="btn gold sm" data-a="evoPet" data-v="${id}">${ico("star")}Évoluer</button>` : "") : un ? `<button class="btn sm" data-a="adopt" data-v="${id}">Adopter · ${P.cost} ${ico("coin", "#e8c060")}</button>` : `<span class="tiny dim">${ico("lock", "#9a8c7a", 12)} Chapitre ${P.unlock} requis</span>`}</div>`; }).join("")}</div><p class="small dim">Évolution au niveau ${PET_EVO_LVL} : 600 or, 4 essences, 1 éclat. Capacité : ${S.bld.menagerie + 2} compagnons.</p>`;
  }
  if (k === "fonderie") {
    const b = idleBank();
    body = `<p class="lore">Les âmes des morts brûlent ici, et leur chaleur se change en or. Elle travaille même quand vous dormez.</p><div class="row sp card" style="cursor:default"><div><div class="small dim">Réserve</div><div style="font-size:28px;font-family:var(--f-head)" class="gold">${fmt(b)} or</div><div class="small dim">${fonderieRate()} or par heure · réserve pleine en ${fonderieCap()} h</div></div><button class="btn main ${b > 0 ? "glow" : "off"}" data-a="collect">${ico("coin")}Récolter</button></div>`;
  }
  modal(`<h2>${ico(B.ic, "#e8c878")} ${B.n}</h2>${body}${bldFooter(k)}`, { wide: 1, mount: m => fillCanvases(m, (c, id) => { const p = id.split(":"); if (p[0] === "r") paintHero(c, S.recruits[+p[1]], true); if (p[0] === "lg") { const L = LEGENDS.find(l => l.id === p[1]); if (L) paintHero(c, { cls: L.cls, lvl: 20, gear: { wpn: { tier: 5, rar: 4 }, arm: { tier: 5, rar: 4 } }, look: { skin: SKINS[1], hair: 1, hairCol: HAIRCOL[1], beard: 0 }, traits: [], name: L.name }, true); } if (p[0] === "h") paintHero(c, heroById(p[1])); if (p[0] === "p") paintPet(c, p[1], p[2] === "1"); if (p[0] === "tier") { const x = c.getContext("2d"); const sp = heroSprite({ cls: p[1], tier: +p[2], wtier: +p[2], evo: p[3] || null, skin: SKINS[1], hair: 1, hairCol: HAIRCOL[1], beard: 0 }, {}, 0, c.width / 230 * 1.2); x.drawImage(sp, c.width / 2 - sp.ax, c.height - 4 - sp.ay); } if (p[0] === "it") paintItem(c, findItem(p[1])); }) });
  UI.bldOpen = k;
}
ACT.bldTab = v => { const [k, t] = v.split(":"); UI.bldTab = t; openBuilding(k, t); };
// Forge : l'aperçu du palier en grand, pour voir le détail de l'armure
ACT.tierZoom = v => { const [cls, t, evo] = v.split(":"), back = bldBack(), W = Math.min(innerWidth - 60, 420), H = Math.round(W * 1.25);
  modal(`<h2>${CLASSES[cls].n} — ${TIER_N[+t]}${evo ? " : " + CLASSES[cls].evos[evo].n : ""}</h2><div style="text-align:center">${canvasSlot("zoom", W, H)}</div><p class="tiny dim" style="text-align:center">${GEAR_NAMES[cls].arm[Math.min(4, +t - 1)]} · héros niveau ${TIER_LVL[+t]}+</p>`,
    { onClose: back, mount: m => fillCanvases(m, c => { const x = c.getContext("2d"); const sp = heroSprite({ cls, tier: +t, wtier: +t, evo: evo || null, skin: SKINS[1], hair: 1, hairCol: HAIRCOL[1], beard: 0 }, {}, 0, c.width / 230 * 1.05); x.drawImage(sp, c.width / 2 - sp.ax, c.height - 6 - sp.ay); }) }); };
ACT.forgeCls = c => { UI.forgeCls = c; openBuilding("forge", "craft"); };
ACT.craft = v => { const [c, kind, t, evo] = v.split(":"); const r = craft(c, kind, +t, evo); if (r.err) return toast(r.err, "bad"); sfx("forge"); const it = r.ok; toast(`Forgé : <span class="rar${it.rar}">${gearName(it)}</span> (${RARITY[it.rar].n})`, it.rar >= 3 ? "epic" : "good"); const h = S.heroes.find(h => h.cls === c && canEquip(h, it) && h.gear[kind] && h.gear[kind].tier < it.tier); if (h) { equip(h, it); toast(`${esc(h.name)} s'en équipe.`); } save(); renderHud(); openBuilding("forge", "craft"); };
ACT.recruit = i => { const r = recruit(+i); if (r.err) return toast(r.err, "bad"); sfx("coin"); toast(`${esc(r.ok.name)} rejoint le Bastion.`, "good"); save(); renderHud(); openBuilding("taverne"); };
ACT.reroll = () => { if (!rerollRecruits()) return toast("Pas assez d'or.", "bad"); save(); renderHud(); openBuilding("taverne"); };
ACT.heal = id => { if (!healInjured(id)) return toast("Pas assez d'or.", "bad"); sfx("heal"); save(); renderHud(); openBuilding("chapelle"); };
ACT.collect = () => { const v = collectBank(); if (v <= 0) return; sfx("coin"); toast(`+${v} or`, "good"); save(); renderHud(); openBuilding("fonderie"); };
ACT.setPet = id => { S.pet = id; save(); openBuilding("menagerie"); };
ACT.adopt = id => { const r = adoptPet(id); if (r.err) return toast(r.err, "bad"); sfx("level"); toast(`${PETS[id].n} vous rejoint !`, "good"); save(); renderHud(); openBuilding("menagerie"); };
ACT.evoPet = id => { const r = evolvePet(id); if (r.err) return toast(r.err, "bad"); sfx("ult"); toast(`${PETS[id].n} devient ${PETS[id].evo.n} !`, "epic"); save(); renderHud(); openBuilding("menagerie"); };
// inventaire
function findItem(id) { return S.inv.find(i => i.id === id) || S.heroes.flatMap(h => Object.values(h.gear)).find(i => i && i.id === id) || (S.run ? S.run.loot.find(i => i.id === id) : null); }
// ── comparaison d'équipement : ce que l'objet change pour ce héros ──
function gearSlotFor(h, it) { return it.kind === "tr" ? (!h.gear.tr1 ? "tr1" : !h.gear.tr2 ? "tr2" : "tr1") : it.kind; }
function gearDelta(h, it, relicH = {}) {
  const slot = gearSlotFor(h, it), old = h.gear[slot];
  const a = heroStats(h, relicH); h.gear[slot] = it; const b = heroStats(h, relicH); h.gear[slot] = old;
  const out = [], add = (n, d, fmt, k = 1) => { if (Math.abs(d) >= (fmt === "pct" ? .005 : .5)) out.push({ n, d, txt: (d > 0 ? "+" : "−") + (fmt === "pct" ? Math.round(Math.abs(d) * 100) + " %" : Math.round(Math.abs(d))), w: d * k }); };
  add("Dégâts", (b.dmgLo + b.dmgHi - a.dmgLo - a.dmgHi) / 2, "n", 3); add("PV", b.hp - a.hp, "n", .6); add("Protection", b.prot - a.prot, "pct", 120);
  add("Critique", b.crit - a.crit, "n", 1.2); add("Vitesse", b.spd - a.spd, "n", 3); add("Esquive", b.dodge - a.dodge, "n", .8); add("Précision", b.acc - a.acc, "n", .6);
  add("Résistance", b.res - a.res, "n", .3); add("Soins", b.healPow - a.healPow, "pct", 60); add("Vol de vie", b.leech - a.leech, "pct", 80);
  // estimations globales : dégâts par tour (dégâts moyens × chance de critique × vitesse) et survie (PV effectifs × esquive)
  if (it.mod && (!old || old.mod !== it.mod) && ITEM_MODS[it.mod]) out.push({ n: "✦ " + ITEM_MODS[it.mod].n, d: 1, txt: "", w: 6 });
  if (old && old.mod && old.mod !== it.mod && ITEM_MODS[old.mod]) out.push({ n: "✦ " + ITEM_MODS[old.mod].n + " perdu", d: -1, txt: "", w: -6 });
  const dps = x => (x.dmgLo + x.dmgHi) / 2 * (1 + Math.min(.6, x.crit / 100) * .5) * (1 + x.spd / 40), surv = x => x.hp / Math.max(.1, 1 - x.prot) / Math.max(.4, 1 - x.dodge / 150);
  const dD = dps(b) / Math.max(.01, dps(a)) - 1, dS = surv(b) / Math.max(.01, surv(a)) - 1;
  return { slot, old, list: out, dps: dD, surv: dS, score: out.reduce((s, x) => s + x.w, 0) + (it.kind === "tr" && !old ? 5 : 0) };
}
function deltaChips(D) {
  if (!D.list.length) return `<span class="tiny dim">${D.old ? "Aucun changement de caractéristiques" : "Effet spécial du bibelot"}</span>`;
  const est = (n, v) => Math.abs(v) >= .01 ? `<span class="chip ${v > 0 ? "up" : "down"}" style="font-weight:700" title="Estimation globale">${n} ${v > 0 ? "+" : "−"}${Math.round(Math.abs(v) * 100)} %</span>` : "";
  return est("Dégâts/tour", D.dps || 0) + est("Survie", D.surv || 0) + D.list.map(x => `<span class="chip ${x.d > 0 ? "up" : "down"}">${x.n} ${x.txt}</span>`).join("");
}
function heroLabel(h) { return `<b>${esc(h.name.split(" ")[0])}</b> <span class="tag" style="color:${ROLES[CLASSES[h.cls].role].c}">${ico(ROLES[CLASSES[h.cls].role].ic, ROLES[CLASSES[h.cls].role].c, 12)}${heroTitle(h)}</span> <span class="tiny dim">niv ${h.lvl}</span>`; }
// une ligne de choix : qui, ce qui est remplacé, les écarts, et le bouton
function equipRow(h, it, act, v, relicH = {}) {
  const D = gearDelta(h, it, relicH), good = D.score > 0;
  return `<div class="eqrow ${good ? "better" : ""}"><div class="eqtop"><span class="eqwho">${heroLabel(h)}</span><button class="btn sm ${good ? "gold" : "ghost"}" data-a="${act}" data-v="${v}">${ico(good ? "up" : "swap", good ? "#8ad06a" : "#9a8c7a", 12)}Équiper</button></div>
    <div class="eqcmp"><span class="tiny dim">${it.kind === "tr" && h.gear.tr1 && h.gear.tr2 ? `Remplacera au choix : ${["tr1", "tr2"].map(s => `<span class="rar${h.gear[s].rar}">${gearName(h.gear[s])}</span> <i>(${itemLine(h.gear[s])})</i>`).join(" ou ")}` : D.old ? `Remplace <span class="rar${D.old.rar}">${gearName(D.old)}</span>${it.kind === "tr" ? ` <i>(${itemLine(D.old)})</i>` : ""}` : "Emplacement libre"}</span><span class="chips">${deltaChips(D)}</span></div></div>`;
}
// ── icônes d'équipement peintes : l'arme réelle, l'armure portée sur un mannequin, les bibelots en médaillon ciselé ──
const ITEM_ART = {}, ITEM_WAIT = Object.assign(new Map(), { n: 0 });
function cropDraw(src, W, pad) { // recadre au plus juste puis centre dans un carré W×W
  const w = src.width, h = src.height, d = src.getContext("2d").getImageData(0, 0, w, h).data;
  let x0 = w, y0 = h, x1 = 0, y1 = 0;
  for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) if (d[(y * w + x) * 4 + 3] > 24) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  const out = document.createElement("canvas"); out.width = out.height = W; const o = out.getContext("2d");
  if (x1 <= x0) return out;
  const bw = x1 - x0 + 2, bh = y1 - y0 + 2, sc = Math.min((W - pad * 2) / bw, (W - pad * 2) / bh);
  o.imageSmoothingQuality = "high";
  o.drawImage(src, x0, y0, bw, bh, (W - bw * sc) / 2, (W - bh * sc) / 2, bw * sc, bh * sc);
  return out;
}
function itemArt(it) {
  if (!HASWIN || !it) return "";
  const bust = it.kind === "arm" ? heroArt({ cls: it.cls, tier: it.tier, evo: it.evo }) : null;
  const wim = it.kind === "wpn" ? artImg("wpn_" + CLASSES[it.cls].wpn) : null, tim = it.kind === "tr" ? artImg("tr_" + it.key) : null;
  const key = (it.kind === "tr" ? "tr|" + it.key + "|" + it.rar : [it.kind, it.cls, it.tier, it.rar, it.evo || ""].join("|")) + (bust || wim || tim ? "|i" : "");
  if (ITEM_ART[key]) return ITEM_ART[key];
  const W = 112;
  let cv;
  try {
    if (wim) { // arme peinte : posée en diagonale, patine selon le palier, lueur selon la rareté
      const s = 300 / wim.height, src0 = mkCanvas(Math.ceil(wim.width * s), 300), x0 = src0.getContext("2d");
      x0.drawImage(wim, 0, 0, src0.width, 300);
      const pat = ["rgba(70,45,25,.32)", "rgba(70,45,25,.14)", null, "rgba(255,210,140,.10)", "rgba(255,200,90,.18)"][clamp(it.tier || 1, 1, 5) - 1] || null;
      if (pat) { x0.globalCompositeOperation = it.tier >= 4 ? "lighter" : "source-atop"; if (it.tier >= 4) { x0.save(); x0.globalCompositeOperation = "source-atop"; x0.fillStyle = pat; x0.fillRect(0, 0, src0.width, 300); x0.restore(); } else { x0.fillStyle = pat; x0.fillRect(0, 0, src0.width, 300); } x0.globalCompositeOperation = "source-over"; }
      const ang = src0.width / src0.height > .8 ? -.15 : .45;
      const src = rotatedCopy(src0, ang);
      cv = cropDraw(src, W, 6);
      if (it.rar >= 3) { const o = mkCanvas(W, W), ox = o.getContext("2d"), r = W / 2;
        const gr = ox.createRadialGradient(r, r, 3, r, r, r); gr.addColorStop(0, it.rar >= 4 ? "rgba(255,120,40,.55)" : "rgba(170,110,255,.42)"); gr.addColorStop(1, "rgba(0,0,0,0)");
        ox.fillStyle = gr; ox.fillRect(0, 0, W, W); ox.drawImage(cv, 0, 0); cv = o; }
    } else if (tim) { // bibelot peint, halo selon la rareté
      const t0 = mkCanvas(tim.width, tim.height); t0.getContext("2d").drawImage(tim, 0, 0);
      cv = cropDraw(t0, W, 10);
    } else if (it.kind === "arm" && bust) { // armure : buste de l'illustration du héros portant ce palier
      const bh = Math.round(bust.height * .52), src = mkCanvas(bust.width, bh), x = src.getContext("2d");
      x.drawImage(bust, 0, 0, bust.width, bh, 0, 0, bust.width, bh);
      const fade = x.createLinearGradient(0, bh * .8, 0, bh); fade.addColorStop(0, "rgba(0,0,0,1)"); fade.addColorStop(1, "rgba(0,0,0,0)");
      x.globalCompositeOperation = "destination-in"; x.fillStyle = fade; x.fillRect(0, 0, bust.width, bh); x.globalCompositeOperation = "source-over";
      cv = cropDraw(src, W, 4);
    } else return ""; // illustration pas encore chargée : slotHTML met l'icône en attendant
    // éclat de rareté discret
    if (it.rar >= 1) { const x = cv.getContext("2d"); x.save(); x.globalCompositeOperation = "destination-over"; const g = x.createRadialGradient(W / 2, W / 2, 4, W / 2, W / 2, W / 2); g.addColorStop(0, RARITY[it.rar].c + "50"); g.addColorStop(1, "#0000"); x.fillStyle = g; x.fillRect(0, 0, W, W); x.restore(); }
    const url = ITEM_ART[key] = cv.toDataURL();
    return url;
  } catch (e) { return ITEM_ART[key] = ""; }
}
function itemIcon(it) { return it.kind === "wpn" ? "wpn_" + CLASSES[it.cls].wpn : it.kind === "arm" ? "armor" : TRINKETS[it.key].ic; }
function paintItem(c, it) { if (!it) return; const x = c.getContext("2d"); const g = x.createRadialGradient(c.width / 2, c.height / 2, 2, c.width / 2, c.height / 2, c.width / 2); g.addColorStop(0, RARITY[it.rar].c + "55"); g.addColorStop(1, "#0000"); x.fillStyle = g; x.fillRect(0, 0, c.width, c.height); }
function itemLine(it) {
  if (!it) return "";
  const stats = [];
  if (it.kind === "wpn") stats.push(`+${Math.round((WPN_DMG[it.tier] * (1 + .07 * it.up) + it.up * .03) * 100)} % dégâts`);
  if (it.kind === "arm") stats.push(`+${Math.round((ARM_HP[it.tier] * (1 + .07 * it.up) + it.up * .025) * 100)} % PV`, `+${Math.round(ARM_PROT[it.tier] * 100)} % protection`);
  if (it.kind === "tr") stats.push(TRINKETS[it.key].d);
  if (it.mod && ITEM_MODS[it.mod]) stats.push(`<b style="color:#ffb848">✦ ${ITEM_MODS[it.mod].n}</b> : ${ITEM_MODS[it.mod].d}`);
  for (const f of it.aff || []) { const A = AFFIXES[f.k]; stats.push(`+${A.fmt === "pct" ? Math.round(f.v * 100) + " %" : f.v} ${A.n}`); }
  const req = it.kind !== "tr" && TIER_LVL[it.tier] > 1 ? ` · <span class="tiny dim">niv ${TIER_LVL[it.tier]}+</span>` : "";
  return (gl(stats.filter(t => !/^\+0 %/.test(t)).join(" · ")) || "Équipement de base") + req;
}
function slotHTML(it, act, v, extra = "") { if (!it) return `<div class="slot" data-a="${act}" data-v="${v}">${ico("plus", "#5a4a3a")}</div>`; return `<div class="slot r${it.rar}" data-a="${act}" data-v="${v}" title="${esc(gearName(it))}">${(() => { const a = itemArt(it); if (a) return `<img class="itimg" src="${a}" alt="">`; const id = "w" + (++ITEM_WAIT.n); ITEM_WAIT.set(id, it); return `<span class="itw" data-iw="${id}">${ico(itemIcon(it), RARITY[it.rar].c)}</span>`; })()}${it.kind !== "tr" ? `<span class="tier">${"I II III IV V VI".split(" ")[it.tier - 1]}</span>` : ""}${it.up ? `<span class="up">+${it.up}</span>` : ""}${extra}</div>`; }
function invList(filter) {
  const items = S.inv.filter(filter || (() => true)).sort((a, b) => b.rar - a.rar || b.tier - a.tier);
  if (!items.length) return '<div class="empty">Inventaire vide. Explorez pour trouver du butin, ou forgez.</div>';
  return `<div class="col">${items.map(it => `<div class="row card" style="cursor:default;gap:10px">${slotHTML(it, "itemInfo", it.id)}<div style="flex:1;min-width:150px"><b class="rar${it.rar}">${gearName(it)}</b> <span class="tiny dim">${RARITY[it.rar].n}${it.cls ? " · " + CLASSES[it.cls].n : ""}</span><div class="tiny">${itemLine(it)}</div></div><div class="row" style="gap:4px">${it.kind !== "tr" ? `<button class="btn sm" data-a="upItem" data-v="${it.id}" title="Améliorer">${ico("up")}</button>` : ""}<button class="btn sm" data-a="equipPick" data-v="${it.id}">Équiper</button><button class="btn ghost sm" data-a="salv" data-v="${it.id}" title="Recycler">${ico("iron")}</button></div></div>`).join("")}</div>`;
}
ACT.itemInfo = id => { const it = findItem(id); if (!it) return; const c = it.kind !== "tr" ? upCost(it) : null; toast(`<b class="rar${it.rar}">${gearName(it)}</b><br><span class="small">${itemLine(it)}</span>${c ? `<br><span class="tiny dim">Amélioration : ${c.gold} or, ${c.fer} fer${c.essence ? ", " + c.essence + " ess." : ""}</span>` : ""}`); };
ACT.upItem = id => { const it = findItem(id); const r = upgradeItem(it); if (!r || r.err) return toast((r && r.err) || "Impossible.", "bad"); sfx("forge"); toast(`${gearName(it)}`, "good"); save(); renderHud(); if (UI.bldOpen === "forge" && !$("#modal").hidden && !UI.heroOpen) openBuilding("forge", "inv"); else refresh(); };
ACT.salv = id => { const it = findItem(id); if (!it) return; const go2 = () => { const r = salvageItem(it); sfx("forge"); toast(`Recyclé : +${r.fer} fer${r.essence ? `, +${r.essence} ess.` : ""}${r.cendre ? ", +1 cendre" : ""}, +${r.gold} or`); save(); renderHud(); openBuilding("forge", "inv"); }; if (it.rar >= 2) confirmBox(`Recycler <b class="rar${it.rar}">${gearName(it)}</b> ?`, go2); else go2(); };
// un objet sert encore s'il améliore au moins un héros de la caserne (les légendaires sont toujours gardés)
function itemUseful(it) {
  if (it.rar >= 4) return true;
  return S.heroes.some(h => {
    if (!canEquip(h, it)) return false;
    if (it.kind === "tr") { const t = [h.gear.tr1, h.gear.tr2]; if (t.some(x => x && x.key === it.key)) return false; if (!t[0] || !t[1]) return true; return it.rar > Math.min(t[0].rar, t[1].rar); }
    return gearDelta(h, it).score > 0;
  });
}
// objet gardé pour plus tard : un héros de la classe existe mais n'a pas encore le niveau pour ce palier
function itemFuture(it) { if (it.kind === "tr") return false; const hs = S.heroes.filter(h => h.cls === it.cls); return hs.length > 0 && hs.every(h => h.lvl < TIER_LVL[it.tier]) && hs.some(h => !h.gear[it.kind] || h.gear[it.kind].tier < it.tier); }
function salvCandidates(rars, keepUseful) { return S.inv.filter(it => rars.includes(it.rar) && !itemFuture(it) && !(keepUseful && itemUseful(it))); }
ACT.salvAll = () => {
  UI.salv = UI.salv || { rars: [0, 1], keep: 1 };
  const draw = () => {
    const R = UI.salv, list = salvCandidates(R.rars, R.keep), tot = { fer: 0, essence: 0, cendre: 0, gold: 0 }; for (const it of list) { const r = salvage(it); for (const k in tot) tot[k] += r[k]; }
    const fut = S.inv.filter(itemFuture).length;
    modal(`<h2>${ico("iron", "#c8c8c8")} Recyclage rapide</h2><p class="small">Choisissez les qualités à recycler.</p>
      <div class="col" style="gap:4px">${RARITY.map((Q, q) => { const n = S.inv.filter(it => it.rar === q).length; return n ? `<label class="row sp card" style="cursor:pointer;padding:6px 10px"><span class="rar${q}"><b>${Q.n}</b></span><span class="tiny dim">${n} objet${n > 1 ? "s" : ""}</span><input type="checkbox" data-salvq="${q}" ${R.rars.includes(q) ? "checked" : ""}></label>` : ""; }).join("")}</div>
      <label class="row sp" style="margin-top:8px"><span class="small">Garder ce qui améliorerait un héros</span><input type="checkbox" id="salvkeep" ${R.keep ? "checked" : ""}></label>
      ${fut ? `<p class="tiny dim">${fut} objet${fut > 1 ? "s" : ""} de palier supérieur ${fut > 1 ? "sont gardés" : "est gardé"} : vos héros pourront ${fut > 1 ? "les" : "le"} porter en montant de niveau.</p>` : ""}
      <div class="row sp" style="margin-top:10px"><span class="small">${list.length} objet${list.length > 1 ? "s" : ""} · +${tot.gold} or, +${tot.fer} fer${tot.essence ? `, +${tot.essence} ess.` : ""}${tot.cendre ? `, +${tot.cendre} cendre` : ""}</span><button class="btn main ${list.length ? "" : "off"}" data-a="salvGo">Recycler</button></div>`,
      { onClose: () => setTimeout(() => { if ($("#modal").hidden && UI.screen === "bastion") openBuilding("forge", "inv"); }, 0), mount: m => { m.querySelectorAll("[data-salvq]").forEach(c => c.onchange = () => { const q = +c.dataset.salvq; R.rars = c.checked ? [...new Set([...R.rars, q])] : R.rars.filter(x => x !== q); draw(); }); const k = m.querySelector("#salvkeep"); if (k) k.onchange = () => { R.keep = k.checked ? 1 : 0; draw(); }; } });
  };
  ACT.salvGo = () => { const list = salvCandidates(UI.salv.rars, UI.salv.keep); if (!list.length) return; let g = 0; for (const it of list) g += salvageItem(it).gold || 0; sfx("forge"); toast(`${list.length} objet${list.length > 1 ? "s" : ""} recyclé${list.length > 1 ? "s" : ""}.`, "good"); save(); renderHud(); UI.modalClose = null; openBuilding("forge", "inv"); };
  draw();
};
ACT.equipPick = id => { const it = findItem(id); const hs = S.heroes.filter(h => canEquip(h, it)); if (!hs.length) return toast("Aucun héros ne peut porter cet objet.", "bad"); modal(`<h2>Équiper ${gearName(it)}</h2><div class="row" style="gap:10px;margin-bottom:8px">${slotHTML(it, "itemInfo", it.id)}<div style="flex:1;min-width:0"><b class="rar${it.rar}">${gearName(it)}</b><div class="tiny dim">${itemLine(it)}</div></div></div><div class="col">${hs.sort((a, b) => gearDelta(b, it).score - gearDelta(a, it).score).map(h => equipRow(h, it, "equipTo", it.id + ":" + h.id)).join("")}</div>`, { onClose: bldBack(), mount: m => fillCanvases(m, (c, i) => paintHero(c, heroById(i.split(":")[1]))) }); };
// bibelot : si les deux emplacements sont pris, on choisit lequel remplacer
function askTrSlot(h, it, cb) {
  if (it.kind !== "tr" || !h.gear.tr1 || !h.gear.tr2) return cb(null);
  const back = UI.screen === "hero" ? null : bldBack();
  modal(`<h2>${ico("gem", "#e8c878")} Quel bibelot remplacer ?</h2><p class="small">${esc(h.name)} porte déjà deux bibelots. <b class="rar${it.rar}">${gearName(it)}</b> <span class="tiny dim">(${itemLine(it)})</span> prendra la place de :</p>
    ${["tr1", "tr2"].map(s => { const o = h.gear[s]; return `<div class="row card" data-a="trSlotPick" data-v="${s}">${slotHTML(o, "", "")}<div style="flex:1;min-width:0"><b class="rar${o.rar}">${gearName(o)}</b><div class="tiny dim">${itemLine(o)}</div></div><button class="btn sm">${ico("swap")}Remplacer</button></div>`; }).join("")}`, { onClose: back });
  ACT.trSlotPick = s => { UI.modalClose = null; closeModal(); cb(s); };
}
ACT.equipTo = v => { const [iid, hid, sl] = v.split(":"); const it = findItem(iid), h = heroById(hid); if (it && h && it.kind === "tr" && !sl && h.gear.tr1 && h.gear.tr2) return askTrSlot(h, it, s => ACT.equipTo(iid + ":" + hid + ":" + s)); if (!equip(h, it, sl || undefined)) return toast("Impossible (deux fois le même bibelot ?).", "bad"); sfx("forge"); toast(`${esc(h.name)} : ${gearName(it)}`, "good"); save(); closeModal(); if (UI.screen === "hero") refresh(); else openBuilding("forge", "inv"); };
