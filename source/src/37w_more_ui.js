// ── Améliorations du 6 nov. (matin), interface ──
const insertAfterLore = (html) => { const box = $("#modal .box"); if (!box) return; const p = box.querySelector("p.lore") || box.querySelector("h2"); if (p) p.insertAdjacentHTML("afterend", html); };

// 1 · ordres tactiques dans le briefing du gardien
if (typeof bossBriefing === "function") { const bb0 = bossBriefing; bossBriefing = (run, n, v) => {
  bb0(run, n, v); const box = $("#modal .box"); if (!box) return; const go = box.querySelector('[data-a="bossGo"]'); if (!go) return;
  const enc = genEncounter(run, n), b = enc.find(e => MONSTERS[e.key] && MONSTERS[e.key].boss);
  go.closest(".row").insertAdjacentHTML("beforebegin", `<h3 style="margin-top:10px">${ico("banner", "#e8c878", 15)} Ordre tactique</h3><div class="row" style="gap:6px;flex-wrap:wrap">${Object.entries(ORDERS).map(([k, O]) => `<button class="btn sm ${run.order === k ? "gold" : "ghost"}" data-a="setOrder" data-v="${k}|${v}" ${tipAttr(O.n, O.d)}>${O.n}</button>`).join("")}</div><p class="tiny dim">${run.order ? ORDERS[run.order].d : "Aucun ordre : le groupe se bat comme d'habitude."}${b && (MONSTERS[b.key].elite || MONSTERS[b.key].boss) ? " · Les gardiens ont souvent un point faible : trois coups critiques le brisent." : ""}</p>`);
}; }
ACT.setOrder = x => { const [k, v] = x.split("|"), run = S.run; if (!run) return; run.order = run.order === k ? null : k; save(); const [c, i] = v.split(":").map(Number); bossBriefing(run, run.map[c][i], v); };

// 2 · 4 · points faibles et défi annoncés au début du combat
if (typeof startCombat === "function") { const sc0 = startCombat; startCombat = (...a) => { const r = sc0(...a); setTimeout(() => { const B = CB.B; if (!B) return; const msg = [];
  if (B.chal && CHALLENGES[B.chal]) msg.push(`${ico("trophy", "#e8c878", 13)} Défi <b>${CHALLENGES[B.chal].n}</b> : ${CHALLENGES[B.chal].d} (or ×2 et un objet)`);
  for (const e of B.enemies) if (e.wp) msg.push(`${ico("aim", "#ff9a6a", 13)} ${esc(e.name)} : point faible <b>${e.wp.n}</b> (${e.wp.hits} critiques)`);
  if (B.tactic) msg.push(`${ico("banner", "#e8c878", 13)} Ordre : <b>${ORDERS[B.tactic].n}</b>`);
  if (msg.length) toast(msg.join("<br>")); }, 1600); return r; }; }
// lignes de récompense : défi, champion, légende, relique renforcée
if (typeof rewardModal === "function") { const rm0 = rewardModal; rewardModal = (title, text, R, ups, onClose) => { rm0(title, text, R, ups, onClose); const L = [];
  if (R.chal) L.push(`${ico("trophy", "#e8c878", 22)}<b>Défi réussi : ${CHALLENGES[R.chal].n}</b> — or doublé et un objet en plus`);
  if (R.champ) L.push(`${ico("crown", "#ff9a6a", 22)}<b>Champion vaincu</b> — butin Épique`);
  if (R.legend) L.push(`${ico("star", "#ffd27a", 22)}<b>Légende de la semaine accomplie</b> — +5 éclats et un objet Mythique`);
  if (R.gem && typeof gemName === "function") L.push(`${ico("gem", "#e8a0ff", 22)}<b>Gemme : ${gemName(R.gem)}</b>`);
  if (R.relic && S.run && (S.run.relicUp || {})[R.relic]) L.push(`${ico("gem", "#e8c878", 22)}<b>Relique renforcée : ${RELICS[R.relic].n}</b> (+50 % d'effet)`);
  if (L.length) { const h2 = $("#modal .box h2"); if (h2) h2.insertAdjacentHTML("afterend", L.map(l => `<div class="reward" style="color:var(--gold2)">${l}</div>`).join("")); } }; }

// 5 · spécialisation du compagnon évolué (fiche du compagnon)
if (typeof petSheet === "function") { const ps0 = petSheet; petSheet = (id, foot = "") => { ps0(id, foot); if (!petEvolved(id) || !S.pets.owned.includes(id)) return; const sp = (S.petSpec || {})[id], box = $("#modal .box"); if (!box) return;
  box.insertAdjacentHTML("beforeend", `<div class="panel" style="padding:10px;margin-top:10px"><h3>${ico("paw", "#e8c878", 15)} Spécialisation</h3>${sp ? `<p class="small"><b class="gold">${PET_SPECS[sp].n}</b> — ${PET_SPECS[sp].d}</p>` : `<p class="small dim">Une fois évolué, votre compagnon choisit une voie (définitif).</p><div class="row" style="gap:6px">${Object.entries(PET_SPECS).map(([k, P]) => `<button class="btn sm" data-a="petSpec" data-v="${id}:${k}">${P.n} <span class="tiny dim">${P.d}</span></button>`).join("")}</div>`}</div>`); }; }
ACT.petSpec = v => { const [id, k] = v.split(":"); (S.petSpec = S.petSpec || {})[id] = k; save(); toast(`${PETS[id].n} : ${PET_SPECS[k].n}.`, "good"); petSheet(id); };

// 6 · héritage annoncé à l'embauche
{ const ar0 = ACT.recruit; ACT.recruit = i => { const n0 = (S.legacies || []).length, L = n0 ? S.legacies[0] : null; ar0(i); if (L && (S.legacies || []).length < n0) toast(`Héritage de <b>${esc(L.name)}</b> : la recrue reçoit le trait <b>${TRAITS[L.trait].n}</b>.`, "epic"); }; }

// 8 · arbre du Bastion (dans la Salle des maîtres) · 10 · contrats (dans la Taverne)
function btreeHTML() { const free = btreeFree();
  return `<div class="panel" style="padding:10px;margin:8px 0"><div class="row sp"><h3 style="margin:0">${ico("tree", "#8ad06a", 15)} Arbre du Bastion</h3><span class="tiny ${free ? "good" : "dim"}">${free} point${free > 1 ? "s" : ""} libre${free > 1 ? "s" : ""} (1 par niveau d'aventure)</span></div>
  <div class="col" style="margin-top:6px">${Object.entries(BTREE).map(([k, B]) => `<div class="row sp"><span class="small"><b>${B.n}</b> <span class="tiny dim">${B.d}</span></span><span class="row" style="gap:4px"><span class="tiny gold">${btree(k)}/${B.max}</span><button class="btn sm ${free && btree(k) < B.max ? "gold" : "ghost off"}" data-a="btreeAdd" data-v="${k}">+1</button></span></div>`).join("")}</div>
  <div class="row" style="justify-content:flex-end;margin-top:6px"><button class="btn ghost sm" data-a="btreeReset">Réinitialiser (gratuit)</button></div></div>`; }
ACT.btreeAdd = k => { if (!btreeAdd(k)) return toast("Plus de point libre.", "bad"); save(); renderHud(); openBuilding("academie"); };
ACT.btreeReset = () => { btreeReset(); save(); openBuilding("academie"); };
function tavContractsHTML() { const C = tavContracts();
  return `<div class="panel" style="padding:10px;margin:8px 0"><h3 style="margin:0">${ico("quest", "#b48cff", 15)} Contrats du jour</h3><div class="col" style="margin-top:6px">${C.list.map((c, i) => { const T = TAV_CONTRACTS.find(t => t.k === c.k), ok = c.got >= c.n;
    return `<div class="row sp"><span class="small"><b>${T.n}</b> — ${T.d(c.n)} <span class="tiny ${ok ? "good" : "dim"}">${Math.min(c.got, c.n)}/${c.n}</span></span>${c.done ? '<span class="tag good">Réclamé</span>' : `<button class="btn sm ${ok ? "gold" : "ghost off"}" data-a="tavClaim" data-v="${i}">${c.gold} or${c.shards ? " · " + c.shards + " éclat" + (c.shards > 1 ? "s" : "") : ""}</button>`}</div>`; }).join("")}</div></div>`; }
ACT.tavClaim = i => { const r = tavContractClaim(+i); if (!r) return toast("Contrat pas encore rempli.", "bad"); sfx("coin"); save(); renderHud(); toast(`Contrat rempli : +${r.gold} or${r.shards ? `, +${r.shards} éclats` : ""}.`, "good"); openBuilding("taverne"); };
if (typeof openBuilding === "function") { const ob0 = openBuilding; openBuilding = (k, tab) => { ob0(k, tab); if (k === "academie") insertAfterLore(btreeHTML()); if (k === "taverne" && UI.tavTab === "quest") insertAfterLore(tavContractsHTML()); }; }

// 9 · légende de la semaine · 13 · séries d'expéditions (préparation)
function legendWeekHTML(E) { const L = legendWeek(); if (!L || E.region !== L.region || E.daily || E.rush) return "";
  return `<div class="panel" style="padding:8px;margin-top:6px;border-color:#a08040"><div class="row sp"><b class="gold">${ico("star", "#ffd27a", 14)} Légende de la semaine</b>${L.done ? '<span class="tag good">Accomplie</span>' : `<button class="btn sm ${E.legend ? "gold" : "ghost"}" data-a="toggleLegend">${E.legend ? "Activée" : "Activer"}</button>`}</div><div class="tiny">Gardien imposé : <b>${L.boss ? esc(MONSTERS[L.boss].n) : "—"}</b> · ${LEGEND_RULES[L.rule]} · Récompense : 5 éclats et un objet Mythique (une fois par semaine).</div></div>`; }
function seriesHTML(E) { if (E.rush || E.daily) return ""; const n = UI.seriesN || 0;
  return `<div class="row" style="margin-top:6px;gap:4px;flex-wrap:wrap"><span class="tiny dim">${ico("auto", "#9a8c7a", 13)} Série :</span>${[0, 3, 5, 10, 999].map(v => `<button class="btn sm ${n === v ? "gold" : "ghost"}" data-a="seriesN" data-v="${v}">${v === 999 ? "∞" : v ? v + "×" : "Non"}</button>`).join("")}${n ? `<button class="btn sm ${UI.seriesEvo ? "gold" : "ghost"}" data-a="seriesEvo">${ico("up", "#ffd27a", 12)} Évolutive</button>` : ""}<span class="tiny dim">Relance l'expédition en mode auto ; s'arrête sur une défaite ou un héros blessé. Les objets inutiles (Commun à Rare) sont recyclés quand l'inventaire dépasse 150 objets.${UI.seriesEvo ? " <b>Évolutive</b> : après chaque gardien vaincu, passe à la menace suivante, puis au chapitre suivant (menace I) une fois la menace V vaincue." : ""}</span></div>`; }
ACT.seriesEvo = () => { UI.seriesEvo = !UI.seriesEvo; refresh(); };
if (typeof nightToggleHTML === "function") { const nt0 = nightToggleHTML; nightToggleHTML = E => nt0(E) + legendWeekHTML(E) + seriesHTML(E); }
ACT.toggleLegend = () => { UI.expe.legend = !UI.expe.legend; refresh(); };
ACT.seriesN = v => { UI.seriesN = +v; refresh(); };
{ const L0 = ACT.launch; ACT.launch = (...a) => { const E = UI.expe, had = !!S.run; L0(...a); if (!had && S.run) { if (E.legend) E.legend = false; if (UI.seriesN && !S.repeat) S.repeat = { left: UI.seriesN - 1, cfg: { region: E.region, party: E.party.slice(), pet: E.pet, threat: E.threat, night: E.night }, evo: !!UI.seriesEvo }; if (S.repeat) { S.run.autoMap = 1; save(); if (typeof autoMapLoop === "function") setTimeout(autoMapLoop, 500); } } }; }
function seriesTick() {
  const R = S.repeat; if (!R || UI.screen !== "results" || UI.seriesT) return;
  const last = (S.journal || [])[0], hs = R.cfg.party.map(heroById);
  const stop = !R.left ? "Série terminée." : !last || last.outcome !== "victory" ? "Série arrêtée : expédition perdue ou abandonnée." : hs.some(h => !h || isInjured(h)) ? "Série arrêtée : un héros est blessé ou absent." : null;
  if (stop) { S.repeat = null; UI.seriesN = 0; save(); toast(stop); return; }
  if (S.inv.length > 150) { const L = salvCandidates([0, 1, 2], true); for (const it of L) salvageItem(it); if (L.length) toast(`Série : ${L.length} objet${L.length > 1 ? "s" : ""} inutile${L.length > 1 ? "s" : ""} recyclé${L.length > 1 ? "s" : ""}.`); }
  if (R.evo && !R.evoDone) { R.evoDone = 1; const c = R.cfg, tm = threatMax(c.region);
    if (c.threat < tm) { c.threat++; toast(`Série évolutive : menace ${THREAT_N ? THREAT_N[c.threat] || c.threat + 1 : c.threat + 1} débloquée, on monte d'un cran.`, "good"); }
    else if (c.threat >= 4) { const i = REGIONS.findIndex(r => r.id === c.region), nx = REGIONS[i + 1]; if (nx && nx.id !== "abime" && regionUnlocked(nx.id)) { c.region = nx.id; c.threat = 0; toast(`Série évolutive : chapitre suivant — ${esc(nx.n || nx.name || nx.id)}.`, "good"); } } }
  UI.seriesT = setTimeout(() => { UI.seriesT = null; if (!S.repeat || UI.screen !== "results") return; S.repeat.left--; S.repeat.evoDone = 0; go("expe"); Object.assign(UI.expe, { region: R.cfg.region, party: R.cfg.party.slice(), pet: R.cfg.pet, threat: R.cfg.threat, night: R.cfg.night }); UI.seriesN = 0; ACT.launch(); closeModal(); toast(S.repeat && S.repeat.left > 900 ? "Série sans fin : expédition suivante." : `Série : encore ${S.repeat ? S.repeat.left : 0} expédition(s) après celle-ci.`); }, 3500);
}

// 11 · champions sur la carte (libellé) — voir 34_ui_expe (n.champ)
// 12 · visiteurs du Bastion (barre d'icônes)
if (typeof hubRailHTML === "function") { const hr0 = hubRailHTML; hubRailHTML = () => { const V = visitorToday(), D = VISITORS[V.k]; return hr0().replace(/<\/div>\s*$/, `<button class="hrail" data-a="visitor" title="${D.n}">${ico("cloak", "#c8a0e0", 22)}<span>Visiteur</span>${V.bought.length < D.offers.length && S.visitorSeen !== dayKey() ? "<i>!</i>" : ""}</button></div>`); }; }
ACT.visitor = () => { const V = visitorToday(), D = VISITORS[V.k]; if (S.visitorSeen !== dayKey()) { S.visitorSeen = dayKey(); save(); const b = document.querySelector('.hrail[data-a="visitor"] i'); if (b) b.remove(); }
  modal(`${D.por && artHas(D.por) ? `<img src="assets/${D.por}.webp" alt="" style="float:right;width:min(140px,30vw);margin:0 0 6px 10px;border-radius:4px">` : ""}<h2>${ico("cloak", "#c8a0e0")} ${D.n}</h2><p class="lore">${D.d}</p><p class="tiny dim">Un visiteur différent chaque jour.</p>
  <div class="col">${D.offers.map((O, i) => { const c = O.price ? O.price() : O.cost, done = V.bought.includes(i); return `<div class="row sp card" style="cursor:default"><div><b>${O.n}</b><div class="tiny dim">${O.d}</div></div>${done ? '<span class="tag good">Acheté</span>' : `<button class="btn sm ${S.gold >= c ? "gold" : "ghost off"}" data-a="visitBuy" data-v="${i}">${fmt(c)} or</button>`}</div>`; }).join("")}</div>`); };
ACT.visitBuy = i => { const r = visitorBuy(+i); if (r.err) return toast(r.err, "bad"); sfx("coin"); save(); renderHud(); toast(r.r && r.r.name ? `${esc(r.r.name)} rejoint la caserne.` : `${r.ok.n} : acheté.`, "good"); ACT.visitor(); };

// 14 · comparer les équipes enregistrées
if (typeof teamsHTML === "function") { const th0 = teamsHTML; teamsHTML = E => th0(E) + ((S.teams || []).filter(Boolean).length >= 2 ? `<button class="btn ghost sm" style="margin-top:6px" data-a="teamCmp">${ico("link")}Comparer les équipes</button>` : ""); }
ACT.teamCmp = () => { const T = (S.teams || []).map((t, i) => t && { i, hs: t.party.map(heroById).filter(Boolean), pet: t.pet }).filter(Boolean);
  modal(`<h2>${ico("link")} Comparer les équipes</h2><div class="grid" style="--min:200px">${T.map(t => { const roles = t.hs.map(h => CLASSES[h.cls].role), syn = activeSynergies(t.hs.map(h => h.cls)), fm = formationsOf(roles), pw = t.hs.reduce((a, h) => a + heroPower(h), 0), lv = t.hs.length ? Math.round(t.hs.reduce((a, h) => a + h.lvl, 0) / t.hs.length) : 0;
    return `<div class="card" style="cursor:default"><h3 style="margin:0">Équipe ${t.i + 1}</h3><div class="tiny">${t.hs.map(h => esc(h.name.split(" ")[0]) + " (" + CLASSES[h.cls].n + " " + h.lvl + ")").join(", ")}</div><div class="statgrid" style="margin-top:6px"><div>Puissance <b>${fmt(pw)}</b></div><div>Niveau moyen <b>${lv}</b></div><div>Synergies <b>${syn.length}</b></div><div>Formations <b>${fm.length}</b></div></div><div class="tiny dim">${syn.map(k => SYNERGIES[k].n).concat(fm.map(k => FORMATIONS[k].n)).join(" · ") || "—"}</div><button class="btn sm" style="margin-top:6px" data-a="teamLoad" data-v="${t.i}">Choisir</button></div>`; }).join("")}</div>`, { wide: 1 }); };

// 15 · journal du Bastion (Archives)
function journalHTML() { const J = S.journal || []; if (!J.length) return `<div class="empty">Aucune expédition encore consignée.</div>`;
  const out = { victory: ["Victoire", "good"], wipe: ["Déroute", "bad"], retreat: ["Retraite", "dim"] };
  return `<div class="col">${J.map(j => { const R = regionById(j.region), o = out[j.outcome] || [j.outcome, "dim"]; return `<div class="card" style="cursor:default;padding:8px"><div class="row sp"><b>${R ? R.n : j.region}${j.region === "abime" ? " · prof. " + j.floor : ""}</b><span class="tag ${o[1]}">${o[0]}</span></div><div class="tiny dim">${new Date(j.t).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })} · ${j.party.join(", ")}</div><div class="tiny">${fmt(j.gold)} or · ${j.loot} objet${j.loot > 1 ? "s" : ""} · ${j.kills} ennemis${j.boss ? " · gardien : " + esc(j.boss) : ""}${j.fallen.length ? ` · <span class="bad">tombés : ${j.fallen.join(", ")}</span>` : ""}</div></div>`; }).join("")}</div>`; }

// 16 · raccourcis clavier (PC) : 1 à 5 compétences, A auto, P potion, Espace passer, R retarder ; sur la carte, Entrée = mode auto
if (HASWIN) document.addEventListener("keydown", e => {
  if (e.target && /input|textarea|select/i.test(e.target.tagName) || e.ctrlKey || e.metaKey || e.altKey || !S) return;
  const k = e.key.toLowerCase();
  if (UI.screen === "combat") {
    if (/^[1-6]$/.test(k)) { const b = [...document.querySelectorAll('#cbar [data-a="cbSk"]')][+k - 1]; if (b) { b.click(); e.preventDefault(); } }
    else if (k === "a") { const b = document.querySelector('[data-a="cbAuto"]'); if (b) b.click(); }
    else if (k === "p") ACT.cbPotion && ACT.cbPotion();
    else if (k === " ") { ACT.cbPass && ACT.cbPass(); e.preventDefault(); }
    else if (k === "r") ACT.cbDelay && ACT.cbDelay();
  } else if (UI.screen === "map" && k === "enter" && $("#modal").hidden) ACT.mapAuto && ACT.mapAuto();
  else if (k === "escape" && !$("#modal").hidden) closeModal();
});
if (HASWIN) setInterval(() => { try { if (S && S.heroes) seriesTick(); } catch (e) { } }, 1500);
