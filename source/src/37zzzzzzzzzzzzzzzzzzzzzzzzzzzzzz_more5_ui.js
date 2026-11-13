/* 12 nov. — interface des propositions : coffre du gardien, roue de la Taverne, invasions, records, collections, titres, « pendant votre absence ». */
function m5RewardHTML(R) { const L = [];
  if (R.gold) L.push(`${ico("coin", "#e8c060", 18)} <b>+${fmt(R.gold)} or</b>`); if (R.shards) L.push(`${ico("shard", "#c090ff", 18)} <b>+${R.shards} éclats</b>`);
  if (R.tome) L.push(`${ico("book", "#9ad0ff", 18)} <b>+${R.tome} tome${R.tome > 1 ? "s" : ""}</b>`); if (R.essence) L.push(`${ico("essence", "#7ad0ff", 18)} <b>+${R.essence} essence</b>`);
  if (R.gem) L.push(`${ico("gem", "#ff7a9a", 18)} <b>Gemme taillée niveau ${R.gem}</b>`);
  return `<div class="col" style="gap:6px">${L.map(x => `<div class="reward">${x}</div>`).join("")}${R.it ? `<div class="reward" style="align-items:flex-start">${slotHTML(R.it, "itemInfo", R.it.id)}<div style="flex:1;min-width:0"><b class="rar${R.it.rar}">${gearName(R.it)}</b><div class="tiny dim">${itemLine(R.it)}</div></div></div>` : ""}${R.title ? `<div class="reward">${ico("crown", "#ffd27a", 18)} <b>Titre obtenu : « ${R.title} »</b></div>` : ""}</div>`; }
const hmTxt = ms => { const m = Math.ceil(ms / 60000); return m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}` : `${m} min`; };

// Coffre du gardien
ACT.chestOpen = () => { if (!chestReady()) return toast(`Le coffre se remplit encore : ${hmTxt(chestLeft())}.`, "bad"); const R = chestOpen(); save(); renderHud(); sfx("open");
  modal(`<h2>${ico("chest", "#e8c060")} Coffre du gardien</h2><p class="tiny dim">${R.tenth ? "Dixième coffre : le gardien a mis le meilleur de côté." : "Le gardien du Bastion vous a gardé quelques trouvailles."} Prochain coffre dans ${CHEST_H} h.</p>${m5RewardHTML(R)}`);
  if (R.it && R.it.rar >= 5 && typeof jackpot === "function") jackpot(R.it); if (typeof refresh === "function" && UI.screen === "bastion") setTimeout(() => { try { const r = document.querySelector(".hubrail"); if (r) r.outerHTML = hubRailHTML(); } catch (e) { } }, 50); };

// Roue de la Taverne
function wheelHTML() { if (!S.heroes.length) return ""; const ok = wheelReady();
  return `<div class="card" style="cursor:default;margin:8px 0;border-color:#ffb84855"><div class="row sp"><span class="small">${ico("dice", "#ffb848", 16)} <b>Roue de la Taverne</b> <span class="tiny dim">— un tirage gratuit par jour : or, éclats, tomes, gemme… ou un objet Mythique, voire Céleste.</span></span><button class="btn sm ${ok ? "gold" : "ghost off"}" data-a="wheel">${ok ? "Tourner" : "Demain"}</button></div></div>`; }
ACT.wheel = () => { if (!wheelReady()) return toast("Déjà tournée aujourd'hui. Revenez demain.", "bad"); const R = wheelSpin(); save(); renderHud(); sfx("coin");
  modal(`<h2>${ico("dice", "#ffb848")} Roue de la Taverne</h2><div class="row" style="flex-wrap:wrap;gap:4px;margin-bottom:8px">${WHEEL.map((s, i) => `<span class="tag" style="${i === R.idx ? "background:#e8c86044;border-color:#e8c860;color:#fff" : "opacity:.5"}">${s.n}</span>`).join("")}</div><p class="small">La roue s'arrête sur <b class="gold">${R.n}</b>.</p>${m5RewardHTML(R)}`);
  if (R.it && R.it.rar >= 5 && typeof jackpot === "function") jackpot(R.it); };
{ const ob = openBuilding; openBuilding = (k, tab) => { ob(k, tab); if (k === "taverne" && UI.tavTab === "rec" && typeof insertAfterLore === "function") insertAfterLore(wheelHTML()); }; }

// Rail : coffre (minuteur) — le badge « ! » quand il est prêt
{ const hr = hubRailHTML; hubRailHTML = function () { const ok = chestReady(); return hr.apply(this, arguments).replace(/<\/div>\s*$/, `<button class="hrail" data-a="chestOpen" title="Coffre du gardien">${ico("chest", ok ? "#ffd27a" : "#8a7a6a", 22)}<span>${ok ? "Coffre" : hmTxt(chestLeft())}</span>${ok ? "<i>!</i>" : ""}</button></div>`); }; }

// Invasion : bandeau à la préparation d'expédition + destination marquée
{ const eh = SCREENS.expe.html; SCREENS.expe.html = function () { let h = eh.apply(this, arguments); const inv = invasionRegion(); if (!inv) return h; const R = regionById(inv);
  const b = `<div class="card" style="cursor:pointer;border-color:#e0707088;background:#3a101088;margin:6px 0" data-a="pickReg" data-v="${inv}">${ico("skull", "#ff7a6a", 16)} <b>Invasion du week-end : ${R.n}</b> <span class="tiny">— ennemis +25 %, <b>or ×2, expérience ×1,5</b>. ${UI.expe && UI.expe.region === inv ? '<span class="good">Destination choisie ✓</span>' : "Toucher pour y aller."}</span></div>`;
  const i = h.indexOf('<div class="stickybar">'); return i >= 0 ? h.slice(0, i) + b + h.slice(i) : h + b; }; }

// Records : annonce au retour de combat
{ const ab = afterBattle; afterBattle = function (run, B) { const n0 = run && run.recNew ? run.recNew.length : 0; const r = ab.apply(this, arguments);
  try { const L = (run && run.recNew || []).slice(n0); for (const x of L) if (!x.first && typeof toast === "function") toast(`${ico("crown", "#ffd27a", 14)} Record battu contre ${esc(x.name)} : ${x.got.join(", ")} — +${x.shards} éclats`, "good"); } catch (e) { } return r; }; }

// Collections, titres et records
ACT.collect = tab => { UI.colTab = tab || UI.colTab || "col"; const t = UI.colTab, A = M5();
  const tabs = `<div class="tabs"><button class="btn sm ${t === "col" ? "on" : ""}" data-a="collect" data-v="col">${ico("star")}Collections</button><button class="btn sm ${t === "tit" ? "on" : ""}" data-a="collect" data-v="tit">${ico("crown")}Titres</button><button class="btn sm ${t === "rec" ? "on" : ""}" data-a="collect" data-v="rec">${ico("skull")}Records</button></div>`;
  let body = "";
  if (t === "col") { const C = colCounts(); body = `<p class="tiny dim">Chaque palier atteint rapporte or, éclats et un objet, et <b>+1 % de dégâts et de PV</b> à tous vos héros (actuellement +${colBonus()} %).</p>` + Object.keys(COL_N).map(c => { const [a, b] = C[c], p = colPct(c), got = A.col[c] || [];
      return `<div class="card" style="cursor:default;margin-bottom:6px"><div class="row sp"><b class="small">${COL_N[c]}</b><span class="tiny">${a} / ${b} · <b>${p} %</b></span></div><div style="height:6px;background:#ffffff14;border-radius:3px;margin:6px 0"><div style="height:6px;width:${p}%;background:linear-gradient(90deg,#a07a30,#ffd27a);border-radius:3px"></div></div><div class="row" style="gap:4px;flex-wrap:wrap">${COL_STEPS.map(s => got.includes(s) ? `<span class="tag good">${s} % ✓</span>` : p >= s ? `<button class="btn sm gold" data-a="colClaim" data-v="${c}:${s}">${s} % — récupérer</button>` : `<span class="tag" style="opacity:.5">${s} %${s === 100 ? " · titre" : ""}</span>`).join("")}</div></div>`; }).join(""); }
  if (t === "tit") { const L = titlesOwned(), cur = titleCur(); body = `<p class="tiny dim">Votre titre s'affiche sur l'écran-titre. D'autres se gagnent en terminant les collections, en repoussant les invasions, en battant des records…</p><div class="col">${L.map(x => `<button class="btn ${x === cur ? "gold" : "ghost"}" data-a="titleSet" data-v="${esc(x)}">${x === cur ? "✓ " : ""}${esc(x)}</button>`).join("")}</div><p class="tiny dim" style="margin-top:8px">À gagner : ${TITLES_BASE.filter(x => !L.includes(x.t)).map(x => x.t).concat(Object.values(COL_TITLE).filter(x => !L.includes(x))).join(" · ") || "tous obtenus !"}</p>`; }
  if (t === "rec") { const R = Object.entries(A.rec); body = `<p class="tiny dim">Battre un de vos records (moins de tours, plus gros coup, victoire sans agonie) rapporte 2 éclats par record.</p>` + (R.length ? `<div class="col">${R.sort((a, b) => a[1].name.localeCompare(b[1].name)).map(([k, r]) => `<div class="row sp card" style="cursor:default;padding:6px 10px"><b class="small">${esc(r.name)}</b><span class="tiny">${r.turns} tours · ${fmt(r.hit)} max${r.clean ? ' · <span class="good">sans agonie</span>' : ""}</span></div>`).join("")}</div>` : `<div class="empty">Vainquez un gardien pour établir un premier record.</div>`); }
  modal(`<h2>${ico("star", "#e8c878")} Collections et titres</h2>${tabs}${body}`); };
ACT.colClaim = v => { const [c, p] = v.split(":"); const R = colClaim(c, +p); if (!R) return; save(); renderHud(); sfx("holy"); toast(`${COL_N[c]} ${p} % : récompense obtenue.`, "good"); ACT.collect("col"); if (R.it && R.it.rar >= 5 && typeof jackpot === "function") jackpot(R.it); };
ACT.titleSet = v => { M5().title = v; save(); ACT.collect("tit"); };

// Objectifs : collections réclamables + coffre/roue ; lien vers Collections
{ const gl0 = goalsList; goalsList = function () { const G = gl0.apply(this, arguments); const C = Object.keys(COL_N).reduce((a, c) => a + colClaimable(c).length, 0);
  if (C) G.push({ ic: "star", col: "#ffd27a", t: `${C} palier${C > 1 ? "s" : ""} de collection à récupérer`, d: "Or, éclats, objet et +1 % de dégâts/PV permanents par palier.", a: "collect", v: "col", p: 92 });
  if (chestReady()) G.push({ ic: "chest", col: "#e8c060", t: "Ouvrir le coffre du gardien", d: "Gratuit toutes les 4 h.", a: "chestOpen", v: "", p: 91 });
  if (wheelReady()) G.push({ ic: "dice", col: "#ffb848", t: "Tourner la roue de la Taverne", d: "Un tirage gratuit par jour.", a: "goalBld", v: "taverne", p: 85 });
  const inv = invasionRegion(); if (inv) G.push({ ic: "skull", col: "#ff7a6a", t: `Repousser l'invasion : ${regionById(inv).n}`, d: "Ce week-end : or ×2 et expérience ×1,5 dans ce chapitre.", a: "goalGo", v: inv, p: 88 });
  return G.sort((a, b) => b.p - a.p); }; }
{ const g0 = ACT.goals; ACT.goals = () => { g0(); const h2 = document.querySelector("#modal .box h2"); if (h2) h2.insertAdjacentHTML("afterend", `<div class="row" style="gap:6px;margin:4px 0 6px"><button class="btn sm ghost" data-a="collect" data-v="col">${ico("star")}Collections & titres</button></div>`); }; }

// Écran-titre : titre du joueur
{ const th = SCREENS.title.html; SCREENS.title.html = function () { const h = th.apply(this, arguments); if (!S || !S.heroes || !S.heroes.length) return h; const t = titleCur(); return t ? h.replace(/(<small>LE DERNIER BASTION<\/small><\/div>)/, `$1<div class="tiny" style="color:#e8c878;letter-spacing:.12em;text-transform:uppercase;text-align:center;margin-top:4px">« ${esc(t)} »</div>`) : h; }; }

// Pendant votre absence
{ const bm = SCREENS.bastion.mount; SCREENS.bastion.mount = function () { const r = bm && bm.apply(this, arguments); try { if (!S.run && !UI._awayShown) { UI._awayShown = 1; const L = awaySummary(); save();
    if (L && L.length > 1) { let n = 0; const tick = () => { if (UI.screen !== "bastion" || ++n > 120) return; if (!$("#modal").hidden) return setTimeout(tick, 1000); modal(`<h2>${ico("hourglass", "#e8c878")} Pendant votre absence</h2><div class="col">${L.map(x => `<div class="row card" style="gap:10px;${x.a ? "cursor:pointer" : "cursor:default"}" ${x.a ? `data-a="${x.a}" data-v="${x.v || ""}"` : ""}>${ico(x.ic === "clock" ? "hourglass" : x.ic, "#e8c878", 20)}<span class="small" style="flex:1">${x.t}</span>${x.a ? '<span class="tiny gold">›</span>' : ""}</div>`).join("")}</div>`); }; setTimeout(tick, 900); } } } catch (e) { } return r; }; }
ACT.bld = ACT.bld || (k => openBuilding(k));
