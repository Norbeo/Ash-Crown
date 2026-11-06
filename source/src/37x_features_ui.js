// ── Améliorations du 6 nov. (interface) ──

// 1 · décor teinté par les phases du gardien de saison : voile dessiné par-dessus le décor du combat
// le voile est posé dans la scène du combat (voir 35_ui_combat : B.bgTint) via drawCombatTint
function drawCombatTint(x, W, H) { const B = CB.B; if (!B || !B.bgTint) return; x.fillStyle = B.bgTint; x.fillRect(0, 0, W, H); }

// 2 · formations : affichées à la préparation de l'expédition
function formationHTML(E) {
  const hs = (E.party || []).map(heroById).filter(Boolean); if (hs.length < 2) return "";
  const ks = formationsOf(hs.map(h => CLASSES[h.cls].role));
  return `<div class="row" style="gap:4px;margin-top:6px;flex-wrap:wrap"><span class="tiny dim">Formation :</span>${ks.length ? ks.map(k => `<span class="tag good" ${tipAttr(FORMATIONS[k].n, FORMATIONS[k].d)}>${ico("shield", "#8ad06a", 12)}${FORMATIONS[k].n}</span>`).join("") : `<span class="tiny dim" ${tipAttr("Formations", Object.values(FORMATIONS).map(F => F.n + " : " + F.d).join(" · "))}>aucune (touchez pour voir les formations)</span>`}</div>`;
}
// 11 · seconde compagnie (réserve) et 12 · Ironman, sous l'option de nuit
function twinToggleHTML(E) {
  if (E.rush) return "";
  return `<div class="row" style="margin-top:6px"><button class="btn sm ${E.twin ? "gold" : "ghost"}" data-a="toggleTwin">${ico("helm", E.twin ? "#e8c878" : "#9a8c7a", 14)}Seconde compagnie</button><span class="tiny dim">Jusqu'à ${RESERVE_MAX} héros de réserve suivent l'expédition (moitié de l'expérience) ; une relève par expédition depuis la carte.</span></div>`;
}
if (typeof nightToggleHTML === "function") { const nt0 = nightToggleHTML; nightToggleHTML = E => nt0(E) + twinToggleHTML(E) + formationHTML(E); }
ACT.toggleTwin = () => { UI.expe.twin = !UI.expe.twin; refresh(); };
{ const L0 = ACT.launch; ACT.launch = (...a) => { const twin = UI.expe && UI.expe.twin, had = !!S.run; L0(...a); if (!had && S.run && twin) { S.run.reserve = pickReserve(S.run.party); save(); if (S.run.reserve.length) toast(`Seconde compagnie : ${S.run.reserve.map(id => esc(heroById(id).name)).join(", ")}.`); } }; }
// relève : bouton sur la carte (voir mapExtrasHTML), fenêtre d'échange
function mapExtrasHTML(run) {
  if (!run) return ""; const tags = [];
  if (run.reserve && run.reserve.length) tags.push(`<button class="btn sm ${run.relieved ? "ghost off" : "ghost"}" data-a="relief">${ico("swap")}Relève${run.relieved ? " (faite)" : ""}</button>`);
  if (S.ironman) tags.push(`<span class="tag bad" ${tipAttr("Ironman", "Morts définitives, pas de seconde chance ; or et expérience doublés.")}>${ico("skull", "#ff6a5a", 12)}Ironman</span>`);
  return tags.length ? `<div class="row" style="gap:4px;margin-top:6px">${tags.join("")}</div>` : "";
}
ACT.relief = () => {
  const run = S.run; if (!run || run.relieved) return toast("La relève a déjà eu lieu.", "bad");
  const out = run.party.filter(id => !run.fallen.includes(id)).map(heroById), inn = run.reserve.map(heroById).filter(Boolean);
  modal(`<h2>${ico("swap")} Relève</h2><p class="small">Choisissez qui rentre au Bastion, puis qui le remplace. Une seule relève par expédition.</p>
  <h3>Rentre au Bastion</h3><div class="row" style="gap:6px;flex-wrap:wrap">${out.map(h => `<button class="btn sm ${UI.relOut === h.id ? "gold" : "ghost"}" data-a="relOut" data-v="${h.id}">${esc(h.name)} · ${CLASSES[h.cls].n} ${h.lvl}</button>`).join("")}</div>
  <h3 style="margin-top:8px">Prend sa place</h3><div class="row" style="gap:6px;flex-wrap:wrap">${inn.map(h => `<button class="btn sm" data-a="relIn" data-v="${h.id}" ${UI.relOut ? "" : "disabled"}>${esc(h.name)} · ${CLASSES[h.cls].n} ${h.lvl}</button>`).join("")}</div>`);
};
ACT.relOut = id => { UI.relOut = id; ACT.relief(); };
ACT.relIn = id => { const run = S.run; if (!relieve(run, UI.relOut, id)) return toast("Relève impossible.", "bad"); UI.relOut = null; save(); closeModal(); refresh(); toast(`${esc(heroById(id).name)} rejoint le groupe.`, "good"); };

// 4 · recommencer un combat perdu (une fois par expédition, −30 lueur) : instantané de la partie au début du combat
function retrySnap(node) { try { CB.snap = JSON.stringify(S); CB.snapNode = { c: node.c, i: node.i, type: node.type, ambush: node.ambush, nightAmbush: node.nightAmbush }; } catch (e) { CB.snap = null; } }
function retryOffer(onNo) {
  const run = S.run; if (!CB.snap || !canRetry(run)) return onNo();
  modal(`<h2>${ico("skull", "#e05050")} Défaite</h2><p class="lore">Les torches vacillent… Mais l'histoire n'est pas encore écrite.</p><p class="small">Une fois par expédition, vous pouvez <b>recommencer ce combat</b> depuis son début, contre <b>${RETRY_LIGHT} lueur</b>.</p>
  <div class="row" style="gap:8px;margin-top:10px"><button class="btn gold" style="flex:1" data-a="retryFight">${ico("dice")}Recommencer (−${RETRY_LIGHT} lueur)</button><button class="btn ghost" style="flex:1" data-a="retryNo">Accepter la défaite</button></div>`, { close: false });
  UI.retryNo = onNo;
}
ACT.retryNo = () => { closeModal(); const f = UI.retryNo; UI.retryNo = null; CB.snap = null; if (f) f(); };
ACT.retryFight = () => {
  const snap = CB.snap, spec = CB.snapNode; if (!snap) return ACT.retryNo(); closeModal();
  S = JSON.parse(snap); const run = S.run; run.retried = 1; run.light = Math.max(0, run.light - RETRY_LIGHT); CB.snap = null; save();
  const node = spec.ambush ? Object.assign({}, spec) : run.map[spec.c][spec.i]; toast("Le combat recommence…", "good"); go("combat", { node });
};

// 5 · gemmes : onglet de la Forge et sertissage depuis la fiche d'un objet
function gemName(id) { const [k, l] = id.split(":"); return `${GEMS[k].n} ${roman(+l)}`; }
function gemChip(id, n) { const [k, l] = id.split(":"); return `<span class="tag" style="color:${GEMS[k].c}" ${tipAttr(gemName(id), GEMS[k].d(gemVal(k, +l)))}>${ico("gem", GEMS[k].c, 12)}${gemName(id)}${n > 1 ? " ×" + n : ""}</span>`; }
function gemsTabHTML() {
  const G = Object.entries(S.gems || {}).sort((a, b) => a[0].localeCompare(b[0]));
  return `<p class="lore">Les objets Mythiques et mieux ont des emplacements de gemmes (Mythique 1, Divin 2, Céleste 3, Primordial 4). Trois gemmes identiques se fondent en une gemme du niveau supérieur.</p>
  ${G.length ? `<div class="col">${G.map(([id, n]) => { const [k, l] = id.split(":"); return `<div class="row card" style="cursor:default;gap:8px">${gemChip(id, n)}<span class="tiny dim" style="flex:1">${GEMS[k].d(gemVal(k, +l))}</span><button class="btn sm ${n >= 3 && +l < GEM_MAX ? "gold" : "ghost off"}" data-a="gemFuse" data-v="${id}">Fondre 3 → ${roman(Math.min(GEM_MAX, +l + 1))}</button></div>`; }).join("")}</div>` : `<div class="empty">Aucune gemme. Les élites, les gardiens et les coffres en laissent parfois.</div>`}`;
}
ACT.gemFuse = id => { if (!gemFuse(id)) return toast("Il faut trois gemmes identiques.", "bad"); sfx("forge"); save(); openBuilding("forge", "gems"); };
ACT.gemSock = v => { const [iid, gid] = v.split("|"), it = findItem(iid); if (!gemSocket(it, gid)) return toast("Impossible de sertir.", "bad"); sfx("forge"); save(); ACT.itemInfo(iid); };
ACT.gemOut = v => { const [iid, i] = v.split("|"), it = findItem(iid); if (!gemUnsocket(it, +i)) return; save(); ACT.itemInfo(iid); };
// 13 · fiche d'objet en grand (plein écran sur téléphone) : gains de dégâts et de survie pour chaque héros capable de l'équiper
ACT.itemInfo = id => {
  const it = findItem(id); if (!it) return; const c = it.kind !== "tr" ? upCost(it) : null;
  const hs = S.heroes.filter(h => canEquip(h, it) || (it.kind !== "tr" && h.cls === it.cls)).map(h => ({ h, D: gearDelta(h, it) })).sort((a, b) => b.D.score - a.D.score).slice(0, 8);
  const pct = v => `<b class="${v > .005 ? "good" : v < -.005 ? "bad" : "dim"}" style="font-size:18px">${v > 0 ? "+" : ""}${Math.round(v * 100)} %</b>`;
  const sk = sockets(it), gs = it.gems || [], owned = Object.entries(S.gems || {});
  modal(`<h2><span class="rar${it.rar}">${gearName(it)}</span></h2><div class="tiny dim">${RARITY[it.rar].n}${it.cls ? " · " + CLASSES[it.cls].n : ""}${it.kind !== "tr" ? " · palier " + roman(it.tier) + " · niv " + TIER_LVL[it.tier] + "+" : ""}</div><p class="small">${itemLine(it)}</p>
  ${sk ? `<h3>${ico("gem")} Gemmes (${gs.length}/${sk})</h3><div class="row" style="gap:4px;flex-wrap:wrap">${gs.map((g, i) => `<span data-a="gemOut" data-v="${it.id}|${i}" style="cursor:pointer" title="Retirer">${gemChip(g)}</span>`).join("")}${gs.length < sk ? (owned.length ? owned.map(([g, n]) => `<button class="btn sm ghost" data-a="gemSock" data-v="${it.id}|${g}">+ ${gemName(g)} (${n})</button>`).join("") : '<span class="tiny dim">Aucune gemme à sertir.</span>') : ""}</div>` : ""}
  ${c ? `<p class="tiny dim">Amélioration vers +${it.up + 1} : ${c.gold} or, ${c.fer} fer${c.essence ? ", " + c.essence + " ess." : ""}${c.cendre ? ", " + c.cendre + " cendre" : ""}${it.up >= upCap() ? ` <span class="bad">(Forge niveau ${Math.ceil((it.up + 1) / 2)} requise)</span>` : ""}</p>` : ""}
  ${hs.length ? `<h3>Pour vos héros</h3><div class="col">${hs.map(({ h, D }) => `<div class="card" style="cursor:default;padding:8px"><div class="row sp"><span>${heroLabel(h)}</span>${D.score > 0 ? `<span class="tag good">${ico("up", "#8ad06a", 12)}Meilleur</span>` : ""}</div><div class="row" style="gap:16px;margin-top:4px"><span class="small">Dégâts/tour ${pct(D.dps)}</span><span class="small">Survie ${pct(D.surv)}</span></div><div class="tiny dim">${D.list.map(x => `<span class="${x.d > 0 ? "good" : "bad"}">${x.n} ${x.txt}</span>`).join(" · ") || "Aucun changement"}${D.old ? ` — remplace <span class="rar${D.old.rar}">${gearName(D.old)}</span>` : ""}</div></div>`).join("")}</div>` : ""}`, { wide: 1 });
  const box = $("#modal .box"); if (box && SC.w < 700) box.classList.add("full");
};

// 14 · filtres d'inventaire de la Forge
function invFilterBar() {
  const F = UI.invF || (UI.invF = {}), sel = (k, opts) => `<select data-f="${k}" class="invf">${opts.map(([v, n]) => `<option value="${v}" ${String(F[k] ?? "") === String(v) ? "selected" : ""}>${n}</option>`).join("")}</select>`;
  const cls = [...new Set(S.inv.filter(i => i.cls).map(i => i.cls))];
  return `<div class="row invfbar" style="gap:6px;flex-wrap:wrap;margin:6px 0">${sel("kind", [["", "Tous les objets"], ["wpn", "Armes"], ["arm", "Armures"], ["tr", "Bibelots"]])}${sel("tier", [["", "Tous paliers"], ...Array.from({ length: TIER_MAX }, (_, i) => [i + 1, "Palier " + roman(i + 1)])])}${sel("rar", [["", "Toutes qualités"], ...RARITY.map((R, q) => [q, R.n])])}${sel("cls", [["", "Toutes classes"], ...cls.map(c => [c, CLASSES[c].n])])}<button class="btn sm ${F.eq ? "gold" : "ghost"}" data-a="invEq">Équipable maintenant</button></div>`;
}
function invFilterFn() { const F = UI.invF || {}; return it => (!F.kind || it.kind === F.kind) && (!F.tier || (it.kind !== "tr" && it.tier === +F.tier)) && (F.rar === undefined || F.rar === "" || it.rar === +F.rar) && (!F.cls || it.cls === F.cls) && (!F.eq || S.heroes.some(h => canEquip(h, it))); }
ACT.invEq = () => { UI.invF = UI.invF || {}; UI.invF.eq = !UI.invF.eq; openBuilding("forge", "inv"); };
if (typeof invList === "function") { const il0 = invList; invList = f => invFilterBar() + il0(it => (!f || f(it)) && invFilterFn()(it)); }
if (typeof document !== "undefined") document.addEventListener("change", e => { const s = e.target.closest && e.target.closest("select.invf"); if (!s) return; UI.invF = UI.invF || {}; UI.invF[s.dataset.f] = s.value; openBuilding("forge", "inv"); });

// 10 · événement propre au gardien errant, avant le briefing
if (typeof bossBriefing === "function") { const bb0 = bossBriefing; bossBriefing = (run, n, v) => {
  const enc = genEncounter(run, n), b = enc.find(e => MONSTERS[e.key] && MONSTERS[e.key].boss), base = b && bossBase(b.key), W = base && WANDER_EV[base];
  if (!W || n.wev) return bb0(run, n, v);
  UI.wev = { run, n, v, W };
  modal(`<h2>${ico("quest", "#b48cff")} ${esc(MONSTERS[b.key].n)}</h2><p class="lore">${W[0]}</p>${W[1].map((c, i) => `<button class="btn choice" data-a="wevChoice" data-v="${i}"><b>${c[0]}</b></button>`).join("")}`, { close: false });
}; }
ACT.wevChoice = i => { const E = UI.wev; if (!E) return; E.n.wev = 1; const out = wanderEvApply(E.run, E.W[1][+i][1]); save(); closeModal(); toast(out.join("<br>")); UI.wev = null; setTimeout(() => bossBriefing(E.run, E.n, E.v), 350); };

// 9 · codex des gardiens errants (Archives) + récompenses
function wanderCodexHTML() {
  const ks = Object.keys(WANDER_BOSSES), won = wanderBeaten(), vb = wanderVariantsBeaten();
  return `<p class="small dim">Les gardiens errants rejoignent le roulement d'un chapitre quand son gardien est vaincu. Vaincus : <b>${won.length}/${ks.length}</b> · variantes : <b>${vb}/${ks.length * 4}</b>.</p>
  <div class="row" style="gap:6px;flex-wrap:wrap;margin:6px 0">${LEGEND_PETS.map(([id, , n, , need]) => `<span class="tag ${won.length >= need ? "good" : ""}">${ico("paw", won.length >= need ? "#8ad06a" : "#9a8c7a", 12)}${n} : ${Math.min(won.length, need)}/${need}</span>`).join("")}</div>
  <div class="grid" style="--min:220px">${ks.map(k => { const M = MONSTERS[k], ok = (S.beaten || {})[k], seen = S.seen && S.seen.monsters && S.seen.monsters[k] != null, nv = M ? Object.keys(BOSS_VARIANTS).filter(v => (S.beaten || {})[k + "_" + v]).length : 0, I = WANDER_INFO[k] || [];
    return `<div class="card ${seen || ok ? "" : "lock"}" style="cursor:default"><div class="row" style="gap:8px;flex-wrap:nowrap">${canvasSlot("wb:" + k, 64, 72)}<div style="min-width:0"><b>${seen || ok ? esc(WANDER_BOSSES[k].n) : "???"}</b><div class="tiny dim">${regionById(WANDER_BOSSES[k].wander).n}</div><div class="tiny ${ok ? "good" : "dim"}">${ok ? "Vaincu" : "Jamais vaincu"} · variantes ${nv}/4</div>${seen || ok ? `<div class="tiny lore">${esc(I[0] || "")}</div>` : ""}</div></div></div>`; }).join("")}</div>`;
}

// 7 · maîtrises de classe : ajoutées à l'onglet Défis de classe
if (typeof classChCodexHTML === "function") { const cc0 = classChCodexHTML; classChCodexHTML = () => cc0() + `<h3 style="margin-top:14px">${ico("crown", "#e8c878", 15)} Maîtrises</h3><p class="small dim">${MASTERY_WINS} expéditions réussies avec une classe : +5 % dégâts, +5 % PV, +5 résistance pour cette classe, et la Tenue de maître.</p><div class="grid" style="--min:200px">${CLASS_IDS.filter(classUnlocked).map(c => { const w = (S.classWins || {})[c] || 0; return `<div class="card" style="cursor:default;padding:6px"><b>${CLASSES[c].n}</b> <span class="tiny ${w >= MASTERY_WINS ? "good" : "dim"}">${Math.min(w, MASTERY_WINS)}/${MASTERY_WINS}${w >= MASTERY_WINS ? " · Maître" : ""}</span><div class="bar" style="margin-top:3px"><i style="width:${Math.min(100, 100 * w / MASTERY_WINS)}%;background:#e8c060"></i></div></div>`; }).join("")}</div>`; }

// 6 · Bastion doré au prestige (nouveaux cycles)
if (typeof bldTinted === "function") { const bt0 = bldTinted; bldTinted = (im, lvl, k) => { const p = prestigeRank(); if (!p) return bt0(im, lvl, k); const key = k + "|" + lvl + "|" + im.width + "|p" + p; if (BLD_CACHE[key]) return BLD_CACHE[key];
  const base = bt0(im, lvl, k), c = mkCanvas(base.width, base.height), x = c.getContext("2d"); x.drawImage(base, 0, 0); x.globalCompositeOperation = "source-atop"; const g = x.createLinearGradient(0, 0, 0, c.height); g.addColorStop(0, `rgba(255,215,110,${Math.min(.35, .12 + .06 * p)})`); g.addColorStop(1, "rgba(255,180,60,.05)"); x.fillStyle = g; x.fillRect(0, 0, c.width, c.height); return BLD_CACHE[key] = c; }; }

// 12 · Ironman (Options) : irréversible
function ironmanHTML() { return `<div class="panel" style="padding:12px;margin-top:10px"><h3>${ico("skull", "#ff6a5a")} Mode Ironman</h3><p class="small dim">Morts définitives, pas de seconde chance après une défaite, pas d'import de sauvegarde. En échange, l'or et l'expérience sont doublés. Irréversible.</p>${S.ironman ? '<span class="tag bad">Ironman actif</span>' : '<button class="btn sm" data-a="ironOn">Activer le mode Ironman</button>'}</div>`; }
ACT.ironOn = () => confirmBox("Activer le mode Ironman ? Ce choix est définitif pour cette partie.", () => { S.ironman = 1; save(); refresh(); toast("Mode Ironman activé.", "bad"); }, { yes: "Activer" });
{ const im0 = ACT.importSave; ACT.importSave = (...a) => { if (S && S.ironman) return toast("Import impossible en mode Ironman.", "bad"); return im0(...a); }; }

// 16 · notifications : Fonderie pleine, nouveau stock du marchand (dans le jeu, et par le navigateur si autorisé)
function notifyHTML() { return `<div class="panel" style="padding:12px;margin-top:10px"><h3>${ico("bell")} Notifications</h3><p class="small dim">Prévenir quand la Fonderie est pleine ou que le marchand ambulant change de stock.</p><button class="btn sm ${S.opts.notify ? "gold" : "ghost"}" data-a="notifyToggle">${S.opts.notify ? "Activées" : "Désactivées"}</button></div>`; }
ACT.notifyToggle = async () => { S.opts.notify = S.opts.notify ? 0 : 1; if (S.opts.notify && typeof Notification !== "undefined" && Notification.permission === "default") { try { await Notification.requestPermission(); } catch (e) { } } save(); refresh(); };
function gameNotify(title, body) {
  toast(`<b>${title}</b><br><span class="small">${body}</span>`, "good");
  if (!S.opts.notify || typeof Notification === "undefined" || Notification.permission !== "granted" || !document.hidden) return;
  try { if (navigator.serviceWorker && navigator.serviceWorker.ready) navigator.serviceWorker.ready.then(r => r.showNotification(title, { body, icon: "icon-192.png" })).catch(() => new Notification(title, { body })); else new Notification(title, { body }); } catch (e) { }
}
function notifyTick() {
  if (!S || !S.heroes) return; const N = UI.notes || (UI.notes = {});
  try { const full = typeof fonderieCap === "function" && (Date.now() - (S.lastSeen || Date.now())) / 3.6e6 >= fonderieCap(); if (full && !N.full) gameNotify("Fonderie pleine", "L'or s'accumule : passez à la Fonderie le récolter."); N.full = full; } catch (e) { }
  try { const day = new Date().toDateString(); if (N.day && N.day !== day) gameNotify("Marchand ambulant", "Un nouveau stock vous attend au Bastion."); N.day = day; } catch (e) { }
}

// 15 · résumé de séance : à l'arrivée au Bastion, ce qui s'est passé pendant l'absence et lors de la dernière séance
function sessionSummary() {
  const L = S.lastSess, away = L ? Date.now() - L.end : 0;
  if (!L || away < 20 * 60 * 1000) return;
  const h = Math.floor(away / 3.6e6), m = Math.round(away % 3.6e6 / 6e4), bank = typeof idleBank === "function" ? idleBank() : 0;
  const line = (ic, t) => `<div class="reward">${ico(ic, "#e8c878", 20)}<span>${t}</span></div>`;
  modal(`<h2>${ico("hourglass", "#e8c878")} Depuis votre dernière visite</h2><p class="small dim">Absent ${h ? h + " h " : ""}${m} min.</p>
  ${bank ? line("coin", `La Fonderie a produit <b>${fmt(bank)} or</b> en votre absence.`) : ""}${line("chest", "Le marchand ambulant a peut-être changé de stock.")}
  <h3 style="margin-top:10px">Votre dernière séance</h3>${line("coin", `${L.gold >= 0 ? "+" : ""}${fmt(L.gold)} or`)}${L.lv ? line("up", `+${L.lv} niveau${L.lv > 1 ? "x" : ""} de héros`) : ""}${L.runs ? line("map", `${L.runs} expédition${L.runs > 1 ? "s" : ""}`) : ""}${L.kills ? line("skull", `${fmt(L.kills)} ennemis vaincus`) : ""}${L.beaten ? line("crown", `${L.beaten} nouveau${L.beaten > 1 ? "x" : ""} gardien${L.beaten > 1 ? "s" : ""} vaincu${L.beaten > 1 ? "s" : ""}`) : ""}${L.ach ? line("trophy", `${L.ach} succès`) : ""}
  <div class="row" style="justify-content:flex-end"><button class="btn main" data-a="closeModal">Continuer</button></div>`);
}
if (HASWIN) setInterval(() => {
  if (!S || !S.heroes) return;
  if (!UI.sess0) { UI.sess0 = sessSnap(); }
  if (UI.screen === "bastion" && !UI.sessShown && $("#modal").hidden) { UI.sessShown = 1; try { sessionSummary(); } catch (e) { } }
  S.lastSess = sessDiff(UI.sess0, sessSnap()); // enregistré avec la prochaine sauvegarde
  if (!UI.noteT || Date.now() - UI.noteT > 60000) { UI.noteT = Date.now(); notifyTick(); }
}, 5000);
