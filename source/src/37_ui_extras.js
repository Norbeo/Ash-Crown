/* ═══════════════════════ Interface des extensions ═══════════════════════
   Coffres piégés, ordre au compagnon, répliques des héros, quêtes et marques, saison, boss rush, codex des reliques. */

// ── Coffres : piège possible, un héros habile peut le désamorcer ──
const SLY = ["ombre", "medecin_peste", "arbaletriere", "chasseur_sorcieres"];
function showTreasure(n) {
  const run = S.run, party = runParty().filter(h => !run.fallen.includes(h.id)), sly = party.find(h => SLY.includes(h.cls));
  n.trap = n.trap == null ? (chance(.45) ? 1 : 0) : n.trap;
  modal(`<h2>${ico("chest", "#e8c878")} Un coffre</h2><p class="lore">${n.trap ? "Le couvercle est hérissé de pointes rouillées, une ficelle court jusqu'à la serrure. Piégé, sans doute." : "Un coffre cerclé de fer, la serrure rouillée. Rien de suspect… en apparence."}</p>
    <button class="btn choice" data-a="trChoice" data-v="disarm"><b>${sly ? `${esc(sly.name)} désamorce et crochète` : "Tenter de désamorcer"}</b><div class="tiny" style="font-weight:400">${sly ? "Une main habile : bien plus sûr, et la serrure révèle parfois un double fond." : "Sans spécialiste (Lame d'ombre, Médecin de peste, Arbalétrière, Chasseur de sorcières), c'est risqué."}</div></button>
    <button class="btn choice" data-a="trChoice" data-v="force"><b>Forcer le coffre</b></button>
    <button class="btn choice" data-a="trChoice" data-v="leave"><b>Le laisser</b></button>`, { close: false });
  UI.trNode = n;
}
ACT.trChoice = k => {
  const n = UI.trNode, run = S.run; if (!n || n.done) return;
  const party = runParty().filter(h => !run.fallen.includes(h.id)), sly = party.some(h => SLY.includes(h.cls));
  n.done = 1;
  if (k === "leave") { save(); closeModal(); refresh(); toast("Vous laissez le coffre derrière vous."); return; }
  const R = rewardFor(run, n); let text;
  const hurt = f => { for (const h of party) { const mx = heroStats(h, relicHooks(run)).hp; h.hp = Math.max(1, Math.round((h.hp == null ? mx : h.hp) - mx * f)); } };
  if (k === "disarm") {
    const ok = chance(n.trap ? (sly ? .88 : .45) : 1);
    if (ok) { text = n.trap ? "Le mécanisme cède sans un bruit. Sous le butin, un double fond…" : "La serrure s'ouvre proprement."; if (n.trap || sly) R.loot.push(lootGear(runLevel(run, n) + 2, .08)); }
    else { hurt(.14); text = "Clac ! Les pointes jaillissent. Le groupe est blessé, mais le coffre est ouvert."; }
  } else { if (n.trap) { hurt(.18); text = "Le piège se déclenche en plein visage. Le butin est là, au prix du sang."; } else text = "Le couvercle vole en éclats."; }
  const ups = grantReward(run, R); save(); sfx("coin"); closeModal(); refresh(); rewardModal("Coffre", text, R, ups);
};

// ── Ordre au compagnon : une attaque spéciale, une fois par combat, sans perdre son tour ──
ACT.cbPet = async () => {
  const B = CB.B, u = CB.actor; if (!B || !B.pet || B.petBurst || !CB.resolve || CB.busy) return;
  B.petBurst = 1; CB.busy = true; const ev = [{ k: "act", u: u.uid, sk: "Ordre : " + petName(B.pet.id), anim: "buff" }]; petAct(B, ev, true);
  try { await playEvents(ev); } finally { CB.busy = false; }
  checkEnd(B); if (B.over) { const r = CB.resolve; CB.resolve = null; if (r) r({ pass: 1 }); return; }
  cbBar(u); const first = u.ultV >= 100 ? u.ult : u.skills.find(sk => canUse(B, u, sk)); if (first) selectSkill(first);
};
function petBurstBtn() { const B = CB.B; if (!B || !B.pet) return ""; return `<button class="sk ${B.petBurst ? "no" : "pet"}" data-a="cbPet" title="Une fois par combat, sans perdre son tour">${ico("paw", "#c8f0a0")}<span>${B.petBurst ? "Compagnon ✓" : "Ordre au compagnon"}</span></button>`; }

// ── Répliques des héros ──
const BARKS = {
  crit: { tank: ["Tiens bon, la ligne !", "Pas un pas de plus !"], soin: ["La lumière frappe aussi.", "Que l'Aube te juge !"], dps: ["Au cœur !", "Saigne, maintenant.", "Un de moins… presque."], soutien: ["Écoutez ce chant !", "En mesure !"] },
  kill: { tank: ["Suivant !", "Il n'ira pas plus loin."], soin: ["Repose en paix… enfin.", "Pardonne-moi."], dps: ["Trop facile.", "À qui le tour ?", "Encore un pour la fosse."], soutien: ["Le refrain s'achève.", "Silence, enfin."] },
  agony: { tank: ["Je… tiens encore…", "Pas… maintenant…"], soin: ["Ma lumière… vacille…", "Aidez-moi…"], dps: ["Je saigne…", "Pas comme ça…"], soutien: ["Ma voix… se brise…"] },
  ally: { tank: ["Non ! Couvrez-le !", "Ils vont payer !"], soin: ["Je n'ai pas pu…", "Que l'Aube l'accueille."], dps: ["Vengeance !", "Ce sera leur dernière erreur."], soutien: ["Un chant de deuil, plus tard…"] },
  saved: { tank: ["Je suis encore debout.", "Merci, frère d'armes."], soin: ["La lumière me revient."], dps: ["Pas encore mort.", "On reprend."], soutien: ["La mélodie continue !"] },
};
function bark(uid, kind) {
  if (!CB.B || (CB.lastBark && SC.t - CB.lastBark < 2.2) || !chance(.35)) return;
  const u = [...CB.B.heroes, ...CB.B.fallen].find(h => h.uid === uid); if (!u) return;
  const role = { tank: "tank", soin: "soin", soutien: "soutien" }[u.role] || "dps", L = (BARKS[kind] || {})[role]; if (!L) return;
  CB.lastBark = SC.t; const v = CB.vis[u.uid]; if (!v) return;
  CB.txt.push({ id: u.uid + "b", x: v.x, y: v.y - 210 * CB.scale, text: "« " + pick(L) + " »", col: "#e8dcc0", t: 0, life: 2.2, bark: 1 });
}

// ── Quêtes et marques sur la fiche du héros ──
function questMarkHTML(h) {
  const q = h.quest, M = h.mark && GUARD_MARKS[h.mark];
  if (!q && !M) return "";
  return `<div class="panel" style="padding:10px;margin-top:10px">${q ? `<h3>${ico("quest", "#e8c878", 14)} Quête : ${QUESTS[q.k].n}</h3><p class="small" style="margin:2px 0">${questText(q)} <span class="tiny dim">— récompense : trait unique « ${TRAITS[QUESTS[q.k].trait].n} » (${TRAITS[QUESTS[q.k].trait].d})</span></p><div class="bar xp"><i style="width:${100 * q.p / q.goal}%"></i></div><div class="tiny ${q.done ? "good" : "dim"}">${q.done ? "Accomplie !" : q.p + " / " + q.goal}</div>` : ""}
    ${M ? `<h3 style="margin-top:${q ? 10 : 0}px">${ico("seal", "#c87aff", 14)} ${M.n}</h3><p class="small" style="margin:2px 0">${gl(M.d)} <span class="tiny dim">Purifiable à la Chapelle.</span></p>` : ""}</div>`;
}
function chapelMarksHTML() {
  const ms = S.heroes.filter(h => h.mark);
  return `<h3 style="margin-top:12px">${ico("seal", "#c87aff", 14)} Marques des gardiens</h3><p class="tiny dim">Chaque gardien vaincu laisse sa marque sur ceux qui l'ont affronté : un don et une malédiction. Gardez-la pour sa force, ou faites-la purifier.</p>
    ${ms.length ? ms.map(h => { const M = GUARD_MARKS[h.mark]; return `<div class="row sp card" style="cursor:default"><div style="flex:1;min-width:0"><b>${esc(h.name)}</b> <span class="small dim">· ${heroTitle(h)}</span><div class="small">${M.n} — ${gl(M.d)}</div></div><button class="btn sm" data-a="purify" data-v="${h.id}">${ico("cleanse")}${markCost(h)} or</button></div>`; }).join("") : '<div class="empty">Aucun héros marqué.</div>'}`;
}
ACT.purify = id => { const h = heroById(id), r = purifyMark(h); if (r.err) return toast(r.err, "bad"); sfx("holy"); save(); renderHud(); toast(`${esc(h.name)} est purifié.`, "good"); openBuilding("chapelle"); };

// ── Saison et boss rush (écran d'expédition) ──
function seasonPanelHTML() {
  if (!S.season) seasonCheck(); const Sn = S.season, T = TRINKETS[Sn.relic], M = MONSTERS[Sn.boss];
  return `<div class="panel" style="padding:10px;margin-bottom:10px;border-color:#6a4a8a"><b style="color:#c8a0ff">${ico("crown", "#c8a0ff", 14)} ${Sn.n}</b> <span class="small">— encore ${seasonDaysLeft()} jour(s). Gardien de la saison dans l'Abîme (tous les 5 étages) : <b>${M ? M.name || M.n : "?"}</b>. Atteindre la profondeur 10 : <b>${T.n}</b> + 3 éclats${Sn.claimed ? " <span class='good'>✓ obtenu</span>" : ""}. Meilleure profondeur de la saison : <b>${Sn.best}</b>.</span></div>`;
}
function rushPanelHTML(E) {
  if (!rushAvailable()) return "";
  const R0 = S.rush;
  return `<div class="panel" style="padding:10px;margin-bottom:10px;border-color:#8a2a1a"><div class="row sp"><div><b style="color:#ff8a6a">${ico("skull", "#ff8a6a", 14)} Boss rush</b> <span class="small">— élites et gardiens à la suite, un feu de camp toutes les deux victoires. Ni progression ni butin de chapitre : seulement la gloire${R0 ? ` · record : <b>${R0.best}</b> victoires en ${R0.time} min (${R0.alive} survivants)` : ""}.</span></div><button class="btn sm ${E.rush ? "gold" : ""}" data-a="toggleRush">${E.rush ? "Boss rush choisi" : "Choisir"}</button></div></div>`;
}
ACT.toggleRush = () => { UI.expe.rush = !UI.expe.rush; refresh(); };

// ── Codex des reliques ──
function relicsCodexHTML() {
  const seen = S.seen.relics || {}, ks = Object.keys(RELICS), n = ks.filter(k => seen[k]).length, col = ["#c8beaa", "#6ab0ff", "#c87aff"];
  return `<p class="small dim">${n}/${ks.length} reliques découvertes. Elles se trouvent dans les trésors, les événements, chez le colporteur et sur les gardiens, et durent le temps d'une expédition.</p><div class="grid" style="--min:230px">${ks.map(k => { const R = RELICS[k], s = seen[k]; return `<div class="card ${s ? "" : "lock"}" style="cursor:default"><b style="display:flex;gap:6px;align-items:center;color:${s ? col[R.r] : "#7a6a5a"}">${ico("gem", s ? col[R.r] : "#5a4a3a", 16)}${s ? R.n : "???"}</b><div class="small" style="margin-top:3px">${s ? gl(R.d) : "Pas encore découverte."}</div><div class="tiny dim">${["Commune", "Rare", "Épique"][R.r] || ""}</div></div>`; }).join("")}</div>`;
}

// ── Résultats : quêtes, marques, saison, rush ──
function extrasResultsHTML(res) {
  let h = "";
  for (const q of res.quests || []) h += `<div class="reward" style="color:var(--gold2)">${ico("quest", "#e8c878", 22)}<b>Quête accomplie : ${esc(q.name)} gagne « ${TRAITS[q.trait].n} »</b></div>`;
  for (const q of res.newQuests || []) h += `<div class="reward">${ico("quest", "#c8b8a0", 22)}<div><b>Nouvelle quête pour ${esc(q.name)} : ${q.n}</b><div class="tiny dim">${q.q}</div></div></div>`;
  if (res.mark) h += `<div class="reward">${ico("seal", "#c87aff", 22)}<div><b>${res.mark.n}</b><div class="tiny dim">${res.marks.map(esc).join(", ")} : ${gl(res.mark.d)} Purifiable à la Chapelle.</div></div></div>`;
  if (res.season) h += `<div class="reward" style="color:#c8a0ff">${ico("crown", "#c8a0ff", 22)}<b>Récompense de saison : ${gearName(res.season.it)} + 3 éclats</b></div>`;
  if (res.rush) h += `<div class="reward" style="color:#ff8a6a">${ico("skull", "#ff8a6a", 22)}<b>Boss rush : ${res.rush.n} victoires en ${res.rush.mins} min, ${res.rush.alive} survivant(s)${res.rush.record ? " — nouveau record !" : ""}</b></div>`;
  return h;
}
function seasonRecordsHTML() {
  if (!S.season) seasonCheck(); const H = (S.seasons || []).slice(-8).reverse(), R0 = S.rush;
  return `<h2 style="margin-top:14px">Saisons de l'Abîme</h2>${seasonPanelHTML()}${H.length ? `<div class="panel" style="padding:10px">${H.map(x => `<div class="row sp small"><span>${x.n}</span><b>profondeur ${x.best}</b></div>`).join("")}</div>` : '<p class="tiny dim">Aucune saison passée pour l\'instant.</p>'}
  <h2 style="margin-top:14px">Boss rush</h2><div class="panel" style="padding:10px"><span class="small">${R0 ? `Record : <b>${R0.best}</b> victoires en ${R0.time} min (${R0.alive} survivant(s)) · ${R0.runs} tentative(s)` : rushAvailable() ? "Pas encore tenté. Choisissez « Boss rush » en préparant une expédition." : "Disponible après avoir vaincu deux gardiens de chapitre."}</span></div>`;
}
