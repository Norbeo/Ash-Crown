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

// ── Bulle d'information en combat : altérations (bonus/malus), intention ennemie, fiche d'unité ──
function stLine(st) {
  const I = ST_INFO[st.k] || { n: st.k, c: "#ddd" }, G = GLOSS[st.k], neg = NEG.has(st.k);
  const dur = st.t >= 50 ? "permanent" : st.t + " tour" + (st.t > 1 ? "s" : "");
  const val = st.v ? (["bleed", "poison", "burn", "regen", "shield", "thorns"].includes(st.k) ? ` · ${Math.round(st.v)}${st.k === "shield" ? " PV absorbés" : st.k === "regen" ? " PV/tour" : st.k === "thorns" ? " renvoyés" : " dégâts/tour"}` : Math.abs(st.v) < 1.01 && st.v % 1 ? ` · ${st.v > 0 ? "+" : "−"}${Math.round(Math.abs(st.v) * 100)} %` : ` · ${st.v > 0 ? "+" : "−"}${Math.round(Math.abs(st.v))}`) : "";
  return `<div class="cbi-st"><span class="cbi-ic" style="border-color:${I.c}">${ico(ST_IC[st.k] || "star", I.c, 16)}</span><div><b style="color:${I.c}">${I.n}</b> <span class="tiny ${neg ? "bad" : "good"}">${neg ? "malus" : "bonus"}</span> <span class="tiny dim">${dur}${val}</span><div class="tiny">${G ? G.d : ""}</div></div></div>`;
}
function intentHTML(u) {
  const B = CB.B, sk = u.intent && u.intent.sk; if (!sk) return "";
  const tt = sk.t || "e", tg = u.intent.tgt && unitById(B, u.intent.tgt);
  const kind = sk.heal || tt === "allies" ? "Soin ou renfort de ses alliés" : tt === "self" ? "Se protège ou se renforce" : !sk.m ? "Malédiction : altérations sans gros dégâts" : tt === "ae" ? "Attaque de zone : touche plusieurs héros" : "Attaque";
  return `<div class="cbi-int"><b class="bad">Intention : ${sk.n}</b><div class="tiny dim">${kind}${tg && tg.side === "h" ? ` · vise <b>${esc(tg.name)}</b>` : ""}</div><div class="tiny">${skillText(sk, u)}</div></div>`;
}
function cbInfo(u, what, px, py) {
  const B = CB.B; if (!B || !u) return;
  const seen = {}, sts = u.st.filter(s => !seen[s.k] && (seen[s.k] = 1));
  let h = `<div class="row sp" style="flex-wrap:nowrap"><b>${esc(u.name)}</b><span class="tiny dim">${u.side === "e" ? `niv ${u.lvl}${u.tags.includes("impie") ? " · impie" : ""}` : CLASSES[u.cls] ? CLASSES[u.cls].n : ""} · rang ${rankOf(B, u)}</span></div>`;
  if (what !== "st") h += `<div class="tiny">PV ${Math.ceil(u.hp)}/${u.hpMax} · Protection ${Math.round(effProt(u) * 100)} % · Vitesse ${Math.round(effSpd(u))} · Esquive ${Math.round(effDodge(u))}</div>`;
  if (what === "intent") h += intentHTML(u);
  if (what !== "intent") h += sts.length ? `<div class="cbi-list">${sts.map(stLine).join("")}</div>` : `<div class="tiny dim" style="margin-top:4px">Aucune altération.</div>`;
  if (what === "unit" && u.side === "e") h += intentHTML(u);
  let el = $("#cbinfo"); if (!el) { el = document.createElement("div"); el.id = "cbinfo"; document.body.appendChild(el); el.onclick = () => el.remove(); }
  el.innerHTML = h + `<div class="tiny dim" style="text-align:right;margin-top:4px">Touchez pour fermer</div>`;
  const W = window.innerWidth, w = Math.min(340, W - 24); el.style.width = w + "px";
  const r = SC.cv.getBoundingClientRect(), cx = r.left + (px != null ? px : (CB.vis[u.uid] || { x: W / 2 }).x) * r.width / SC.w;
  el.style.left = clamp(cx - w / 2, 12, W - w - 12) + "px"; el.style.top = Math.max(8, r.top + 70) + "px";
  clearTimeout(CB.infoT); CB.infoT = setTimeout(() => { const e = $("#cbinfo"); if (e) e.remove(); }, 9000);
}
document.addEventListener("pointerdown", e => { const el = $("#cbinfo"); if (el && !el.contains(e.target) && e.target !== SC.cv) el.remove(); });

// ── Histoire : scène dialoguée avant chaque chapitre ──
function sceneLineHTML([sp, txt]) { const P = SPEAKERS[sp] || SPEAKERS.narr; return P.n ? `<p class="scn"><b style="color:${P.c}">${P.n}</b><br>« ${txt} »</p>` : `<p class="scn lore">${txt}</p>`; }
function showScene(reg, done, custom) {
  const Sc = custom || SCENES[reg]; if (!Sc) return done && done();
  if (reg) { (S.seenScene = S.seenScene || {})[reg] = 1; save(); }
  let i = 0;
  const step = () => {
    const shown = Sc.lines.slice(0, i + 1).map(sceneLineHTML).join(""), last = i >= Sc.lines.length - 1;
    modal(`<h2>${ico("scroll", "#e8c878")} ${Sc.t}</h2><div class="scnbox">${shown}</div><div class="row sp" style="margin-top:10px"><button class="btn ghost sm" data-a="sceneSkip">Passer</button><button class="btn main" data-a="sceneNext">${last ? "En route" : "Suite"}</button></div>`, { close: false, outside: () => ACT.sceneNext() });
    const b = $("#modal .scnbox"); if (b) b.scrollTop = b.scrollHeight;
  };
  ACT.sceneNext = () => { if (i >= Sc.lines.length - 1) { closeModal(); done && done(); } else { i++; step(); } };
  ACT.sceneSkip = () => { closeModal(); done && done(); };
  step();
}
function scenesCodexHTML() {
  const seen = S.seenScene || {};
  return Object.keys(SCENES).filter(k => seen[k]).map(k => `<div class="panel" style="padding:12px;margin-top:10px"><h3>${SCENES[k].t}</h3>${SCENES[k].lines.map(sceneLineHTML).join("")}${S.prog[k] && S.prog[k].clears && SCENE_END[k] ? `<div class="sep"></div>${SCENE_END[k].map(sceneLineHTML).join("")}` : ""}</div>`).join("") || '<p class="tiny dim">Les dialogues des chapitres apparaîtront ici au fil de l\'aventure.</p>';
}

// ── Tomes d'expérience : réservés aux héros moins aguerris que le plus haut niveau du roster ──
function tomeCap() { return Math.max(1, ...S.heroes.map(h => h.lvl)); }
function tomeHTML(h) {
  const n = S.tomes || 0; if (!n) return "";
  const ok = h.lvl < tomeCap();
  return `<div class="panel" style="padding:10px;margin-top:10px"><div class="row sp"><div><b>${ico("book", "#9ad0ff", 14)} Tomes d'expérience : ${n}</b><div class="tiny dim">${ok ? `Un tome fait gagner un niveau, jusqu'au niveau ${tomeCap()} (le plus haut de votre compagnie).` : "Réservés aux héros d'un niveau inférieur au plus aguerri de la compagnie."}</div></div><button class="btn sm ${ok ? "gold" : "off"}" data-a="readTome" data-v="${h.id}">Lire</button></div></div>`;
}
ACT.readTome = id => { const h = heroById(id); if (!h || !(S.tomes > 0)) return; if (h.lvl >= tomeCap()) return toast("Ce héros est déjà parmi les plus aguerris.", "bad");
  S.tomes--; const need = xpNeed(h.lvl) - h.xp; giveXp(h, Math.max(1, Math.ceil(need / Math.max(.5, 1 + heroPassives(h).filter(p => p.k === "xp").reduce((a, p) => a + p.v, 0))))); sfx("level"); toast(`${esc(h.name)} passe niveau ${h.lvl}.`, "good"); save(); refresh(); };

// ── Équipes enregistrées : 3 compositions (héros, ordre, compagnon) ──
function teamsHTML(E) {
  const T = S.teams = S.teams || [null, null, null];
  return `<div class="row" style="gap:6px;margin-top:8px;align-items:center"><span class="small dim">${ico("banner", "#c8b8a0", 14)} Équipes :</span>${T.map((t, i) => {
    const ok = t && t.party.every(id => heroById(id)), nm = t ? t.party.map(id => { const h = heroById(id); return h ? esc(h.name.split(" ")[0]) : "?"; }).join(", ") : "vide";
    return `<span class="row" style="gap:2px"><button class="btn sm ${ok ? "" : "ghost"}" data-a="teamLoad" data-v="${i}" title="${nm}" ${ok ? "" : "disabled"}>${i + 1}${t ? " · " + nm : ""}</button><button class="btn ghost sm" data-a="teamSave" data-v="${i}" title="Enregistrer la composition actuelle">${ico("plus", "#9a8c7a", 12)}</button></span>`; }).join("")}</div>`;
}
ACT.teamSave = i => { const E = UI.expe; if (!E || !E.party.length) return; (S.teams = S.teams || [null, null, null])[+i] = { party: E.party.slice(), pet: E.pet }; save(); refresh(); toast(`Équipe ${+i + 1} enregistrée.`, "good"); };
ACT.teamLoad = i => { const t = (S.teams || [])[+i]; if (!t) return; const E = UI.expe; E.party = t.party.filter(id => heroById(id)).slice(0, 4); if (t.pet && S.pets.owned.includes(t.pet)) E.pet = t.pet; refresh(); toast(`Équipe ${+i + 1} chargée.`); };

// ── Journal du combat : qui a fait quoi, pour comprendre d'où viennent les dégâts ──
function cbLog(e) {
  const B = CB.B; if (!B || !CB.log) return; const N = id => { const u = unitById(B, id) || [...B.fallen, ...(B.dead || [])].find(x => x.uid === id); return u ? esc(u.name.split(" ")[0]) : id === "PET" ? "Compagnon" : "?"; };
  const side = id => { const u = unitById(B, id) || [...B.fallen].find(x => x.uid === id); return u && u.side === "h" ? "good" : "bad"; };
  let l = null;
  if (e.k === "act") l = `<b class="${side(e.u)}">${N(e.u)}</b> : ${esc(e.sk)}`;
  else if (e.k === "hit" && !e.dot) l = `&nbsp;→ ${N(e.u)} <b>−${e.dmg}</b>${e.crit ? " (critique)" : ""}`;
  else if (e.k === "dot") l = `&nbsp;${N(e.u)} −${e.dmg} (${(ST_INFO[e.st] || {}).n || e.st})`;
  else if (e.k === "heal" && e.v > 0) l = `&nbsp;→ ${N(e.u)} <span class="good">+${e.v}</span>`;
  else if (e.k === "miss") l = `&nbsp;→ ${N(e.u)} esquive`;
  else if (e.k === "st") l = `&nbsp;→ ${N(e.u)} : ${(ST_INFO[e.st] || {}).n || e.st}`;
  else if (e.k === "agony") l = `<span class="bad">${N(e.u)} est à l'agonie</span>`;
  else if (e.k === "fall") l = `<span class="bad">${N(e.u)} tombe</span>`;
  else if (e.k === "die") l = `<span class="good">${N(e.u)} est vaincu</span>`;
  else if (e.k === "pet") l = `<b class="good">Compagnon</b> : ${esc(e.sk)}`;
  if (l) { CB.log.push((B.round ? `<span class="tiny dim">T${B.round}</span> ` : "") + l); if (CB.log.length > 300) CB.log.shift(); }
}
ACT.cbLogShow = () => modal(`<h2>${ico("scroll", "#e8c878")} Journal du combat</h2><div class="small" style="max-height:60vh;overflow:auto;line-height:1.45" id="cblogbox">${(CB.log || []).slice(-150).join("<br>") || '<span class="dim">Rien pour l\'instant.</span>'}</div>`, { mount: m => { const b = m.querySelector("#cblogbox"); if (b) b.scrollTop = b.scrollHeight; } });

// ── Bestiaire : fiche détaillée d'une créature rencontrée ──
ACT.monSheet = k => { const M = MONSTERS[k]; if (!M) return;
  const tags = M.tags.map(t => t === "impie" ? "impie" : t === "bete" ? "bête" : "humain").join(", "), kills = (S.stats.monKills || {})[k] || 0;
  let skt = ""; try { skt = M.sk.map(sk => `<div class="skl" style="cursor:default">${ico(sk.heal ? "heal" : sk.m ? "sword" : "curse", "#e8b8a0")}<div style="flex:1;min-width:0"><b>${sk.n}</b>${sk.every ? ` <span class="tiny dim">(tous les ${sk.every} tours)</span>` : ""}<div class="tiny">${skillText(sk, null)}</div></div></div>`).join(""); } catch (e) { skt = M.sk.map(sk => `<div class="small">${sk.n}</div>`).join(""); }
  modal(`<div class="row" style="gap:12px;flex-wrap:wrap;align-items:flex-start"><div style="margin:0 auto">${canvasSlot("mon", 200, 200)}</div><div style="flex:1;min-width:220px"><h2 style="margin:0">${M.n}</h2><div class="tiny dim">${M.boss ? "Gardien" : M.elite ? "Élite" : "Créature"} · ${tags}</div>
    <div class="statgrid" style="margin-top:8px"><div>PV de base <b>${M.hp}</b></div><div>Dégâts <b>${M.dmg[0]}–${M.dmg[1]}</b></div><div>Protection <b>${Math.round((M.prot || 0) * 100)} %</b></div><div>Vitesse <b>${M.spd}</b></div><div>Esquive <b>${M.dodge || 0}</b></div><div>Résistance <b>${M.res || 0}</b></div></div>
    <p class="tiny dim" style="margin-top:6px">Rangs : ${(M.rk || []).join(", ")} · rencontré ${S.seen.monsters[k] || 0} fois${kills ? ` · ${kills} vaincus` : ""}${M.tags.includes("impie") ? " · sensible aux armes saintes" : ""}</p></div></div>
    <h3 style="margin-top:10px">Compétences</h3><div class="col">${skt}</div>`, { wide: 1, onClose: null, mount: m => fillCanvases(m, c => paintMon(c, k)) });
};

// ── Fiche du héros : stress, talents ──
function stressHTML(h) {
  const s = Math.round(h.stress || 0), A = h.affl && AFFLICTIONS[h.affl];
  if (!s && !A) return "";
  return `<div class="panel" style="padding:10px;margin-top:10px"><div class="row sp"><b>${ico("skull", "#c87a7a", 14)} Stress ${s} / 100</b>${A ? `<span class="tag ${A.bad ? "bad" : "good"}" ${tipAttr(A.n, A.d)}>${A.n}</span>` : ""}</div><div class="bar" style="margin:4px 0"><i style="width:${s}%;background:linear-gradient(90deg,#6a2a6a,#c03a3a)"></i></div>
    <div class="tiny dim">${A ? gl(A.d) + " " : ""}Le stress monte dans les combats éprouvants (agonies, alliés tombés, gardiens) ; à 100, le héros craque (ou se révèle). Le feu de camp l'apaise ; la Taverne l'efface.</div></div>`;
}
function talentsHTML(h) {
  const P = talentPoints(h); if (!P) return `<div class="panel" style="padding:10px;margin-top:10px"><b>${ico("star", "#9a8c7a", 14)} Talents</b> <span class="tiny dim">— un point par niveau à partir du niveau 15.</span></div>`;
  const left = P - talentSpent(h), T = h.talents || {};
  return `<div class="panel" style="padding:10px;margin-top:10px"><div class="row sp"><b>${ico("star", "#e8c878", 14)} Talents</b><span class="small ${left ? "gold" : "dim"}">${left} point${left > 1 ? "s" : ""} à placer</span></div>
    <div class="grid" style="--min:180px;margin-top:6px">${Object.entries(TALENTS).map(([k, X]) => `<div class="card" style="cursor:default"><div class="row sp"><b>${ico(X.ic, "#e8c878", 14)} ${X.n} <span class="gold">${T[k] || 0}</span></b><button class="btn sm ${left ? "gold" : "off"}" data-a="talentAdd" data-v="${h.id}:${k}">+1</button></div><div class="tiny dim">${X.d}</div></div>`).join("")}</div></div>`;
}
ACT.talentAdd = v => { const [id, k] = v.split(":"), h = heroById(id); if (!h || !talentAdd(h, k)) return toast("Aucun point disponible.", "bad"); sfx("level"); save(); refresh(); };
function tavernCalmHTML() {
  const hs = S.heroes.filter(h => (h.stress || 0) >= 20 || (h.affl && AFFLICTIONS[h.affl].bad));
  return `<h3 style="margin-top:12px">${ico("skull", "#c87a7a", 14)} Se changer les idées</h3><p class="tiny dim">Une nuit à la taverne efface le stress et les afflictions (les vertus restent).</p>${hs.length ? hs.map(h => `<div class="row sp card" style="cursor:default"><div style="flex:1;min-width:0"><b>${esc(h.name)}</b> <span class="small dim">· stress ${Math.round(h.stress || 0)}${h.affl ? " · " + AFFLICTIONS[h.affl].n : ""}</span></div><button class="btn sm" data-a="calmHero" data-v="${h.id}">${calmCost(h)} or</button></div>`).join("") : '<div class="empty">Personne n\'a besoin de boire pour oublier.</div>'}`;
}
ACT.calmHero = id => { const h = heroById(id), r = calmHero(h); if (r.err) return toast(r.err, "bad"); sfx("coin"); save(); renderHud(); toast(`${esc(h.name)} a les idées claires.`, "good"); openBuilding("taverne"); };

// ── Colporteur : revendre le butin de l'expédition ──
const sellPrice = it => Math.round((20 + it.tier * 25 + it.rar * 45) * (it.kind === "tr" ? .8 : 1));
function shopSellHTML() {
  const L = (S.run && S.run.loot) || []; if (!L.length) return "";
  return `<h3 style="margin-top:12px">${ico("coin", "#e8c060", 14)} Revendre le butin</h3><div class="col">${L.map(it => `<div class="row card" style="cursor:default">${slotHTML(it, "itemInfo", it.id)}<div style="flex:1;min-width:0"><b class="rar${it.rar}">${gearName(it)}</b><div class="tiny dim">${itemLine(it)}</div></div><button class="btn sm" data-a="sellLoot" data-v="${it.id}">+${sellPrice(it)} or</button></div>`).join("")}</div>`;
}
ACT.sellLoot = id => { const run = S.run, i = run.loot.findIndex(x => x.id === id); if (i < 0) return; const it = run.loot[i]; run.loot.splice(i, 1); run.gold += sellPrice(it); sfx("coin"); save(); renderHud(); showShop(UI.shopNode); };

// ── Archives : défis de classe ──
function classChCodexHTML() {
  const W = S.classWins || {};
  return `<p class="small dim">Vaincre des gardiens avec une classe dans le groupe : 3, 10 et 25 victoires rapportent de l'or et des éclats.</p><div class="grid" style="--min:230px">${CLASS_IDS.map(c => { const n = W[c] || 0, g = CLASS_GOALS.find(x => x > n); return `<div class="card" style="cursor:default"><b>${CLASSES[c].n}</b><div class="bar xp" style="margin:4px 0"><i style="width:${g ? 100 * n / g : 100}%"></i></div><div class="tiny ${g ? "dim" : "good"}">${n} victoire${n > 1 ? "s" : ""}${g ? ` · prochain palier : ${g}` : " · tous les paliers atteints"}</div></div>`; }).join("")}</div>`;
}
function showLines(title, lines, done) { showScene(null, done, { t: title, lines }); }

// ── Frise de l'ordre des tours ──
function turnOrderHTML() {
  const B = CB.B; if (!B || !B.order) return "";
  const next = []; for (let i = Math.max(0, B.turn); i < B.order.length && next.length < 7; i++) { const u = unitById(B, B.order[i]); if (u && alive(u)) next.push(u); }
  return `<div class="cbord">${next.map((u, i) => `<span class="${u.side === "h" ? "h" : "e"} ${i === 0 ? "now" : ""}" title="${esc(u.name)}">${esc(u.name.split(" ")[0].slice(0, 7))}</span>`).join("")}</div>`;
}
// ── Expédition : nuit, duo du compagnon ──
function nightToggleHTML(E) {
  if (E.region === "abime" || E.daily || E.rush) return "";
  return `<div class="row" style="margin-top:6px"><button class="btn sm ${E.night ? "gold" : "ghost"}" data-a="toggleNight">${ico("moon", E.night ? "#e8c878" : "#9a8c7a", 14)}Expédition de nuit</button><span class="tiny dim">Lueur réduite, ennemis +15 %, butin et or améliorés, événements de nuit.</span></div>`;
}
ACT.toggleNight = () => { UI.expe.night = !UI.expe.night; refresh(); };
function duoHTML(E) {
  const D = PET_DUOS[E.pet]; if (!D) return "";
  const cl = E.party.map(id => heroById(id) && heroById(id).cls), on = D.cls.some(c => cl.includes(c));
  return `<div class="tiny ${on ? "good" : "dim"}" style="margin-top:4px">${ico("paw", on ? "#8ad06a" : "#9a8c7a", 12)} Duo : ${petName(E.pet)} s'entend avec ${D.cls.map(c => CLASSES[c].n).join(" ou ")} — ${D.d}${on ? " (actif)" : ""}</div>`;
}
// ── Bastion : marchand ambulant ──
ACT.merchant = () => {
  const M = merchantStock();
  modal(`<h2>${ico("coin", "#e8c060")} Le marchand ambulant</h2><p class="lore">« Je ne reste qu'un jour. Demain, je serai loin… ou mort. »</p><p class="small">Or : <b class="gold">${fmt(S.gold)}</b> · nouvelle marchandise chaque jour, dont un objet légendaire ou mieux.</p>
    <div class="col">${M.items.map((o, i) => `<div class="row card" style="cursor:default;${o.sold ? "opacity:.45" : ""}">${slotHTML(o.it, "itemInfo", o.it.id)}<div style="flex:1;min-width:0"><b class="rar${o.it.rar}">${gearName(o.it)}</b> <span class="tiny dim">${RARITY[o.it.rar].n}</span><div class="tiny dim">${itemLine(o.it)}</div></div><button class="btn sm ${o.sold || S.gold < o.cost ? "off" : "gold"}" data-a="merchantBuy" data-v="${i}">${o.sold ? "Vendu" : o.cost + " or"}</button></div>`).join("")}</div>`);
};
ACT.merchantBuy = i => { const r = merchantBuy(+i); if (r.err) return toast(r.err, "bad"); sfx("coin"); save(); renderHud(); toast(`Acheté : <span class="rar${r.ok.rar}">${gearName(r.ok)}</span> — dans l'inventaire de la forge.`, "good"); ACT.merchant(); };
// ── Archives : mémorial ──
function memorialHTML() {
  const G = (S.graves || []).slice().reverse();
  return G.length ? `<p class="small dim">Ici reposent ceux qui ne sont pas revenus.</p><div class="grid" style="--min:240px">${G.map(g => `<div class="card" style="cursor:default"><div class="row" style="gap:6px">${ico("skull", "#9a8c7a", 18)}<b>${esc(g.name)}</b></div><div class="tiny dim">${CLASSES[g.cls] ? CLASSES[g.cls].n : ""} · niveau ${g.lvl}${g.title ? " · " + esc(g.title) : ""}</div><div class="tiny">${esc(g.cause || "Tombé au combat")}${g.where ? "" : ""}</div><div class="tiny dim">${g.runs || 0} expéditions · ${g.kills || 0} ennemis abattus</div><p class="lore tiny" style="margin:4px 0 0">« ${esc(g.epi || "Le Bastion se souvient.")} »</p></div>`).join("")}</div>` : '<p class="small dim">Le cimetière est vide. Pour l\'instant. (En mode Hardi, les héros tombés y reposent.)</p>';
}
// ── Archives : succès cachés ──
function hiddenAchHTML() { return `<h3 style="margin-top:14px">Succès cachés</h3><div class="grid" style="--min:240px">${HIDDEN_ACH.map(a => { const ok = S.ach && S.ach[a.id]; return `<div class="card ${ok ? "" : "lock"}" style="cursor:default"><b>${ok ? a.n : "???"}</b><div class="tiny">${ok ? a.d : "Un défi secret. Jouez autrement pour le découvrir."}</div>${ok ? `<div class="tiny gold">+${a.gold} or · +${a.shards} éclats</div>` : ""}</div>`; }).join("")}</div>`; }
// ── Fiche du héros : titre de vétéran et tenue ──
function vetOutfitHTML(h) {
  const t = h.vet ? `<div class="small" style="margin-top:6px">${ico("crown", "#e8c878", 14)} <b class="gold">${esc(h.name.split(" ")[0])} ${esc(vetTitle(h))}</b> <span class="tiny dim">— ${VET_TITLES[h.vet].d}</span></div>` : `<div class="tiny dim" style="margin-top:6px">${ico("crown", "#9a8c7a", 12)} Titre de vétéran après 10 expéditions (${h.runs || 0}/10).</div>`;
  const o = `<div class="row" style="gap:4px;margin-top:6px"><span class="tiny dim">Tenue :</span>${OUTFITS.map(O => { const ok = outfitOk(h, O.k); return `<button class="btn sm ${(h.outfit || "") === O.k ? "gold" : "ghost"} ${ok ? "" : "off"}" data-a="setOutfit" data-v="${h.id}:${O.k}" title="${ok ? "" : `Défi de classe : ${O.need} gardiens vaincus avec un ${CLASSES[h.cls].n}`}">${ok ? "" : ico("lock", "#9a8c7a", 11)}${O.n}</button>`; }).join("")}</div>`;
  return `<div class="panel" style="padding:10px;margin-top:10px">${t}${o}</div>`;
}
ACT.setOutfit = v => { const [id, k] = v.split(":"), h = heroById(id); if (!h || !outfitOk(h, k)) return toast("Tenue pas encore débloquée.", "bad"); h.outfit = k || null; save(); refresh(); };
