/* ═══════════ Interface des améliorations du 6 nov. (soir) ═══════════ */

// ── 1 · Compagnie automatique pour les séries : meilleur tank, meilleur soigneur, deux meilleurs autres (hors blessés) ──
function seriesParty(n = 4) {
  const ok = S.heroes.filter(h => !isInjured(h)).sort((a, b) => heroPower(b) - heroPower(a)), out = [];
  for (const r of ["tank", "soin"]) { const h = ok.find(x => CLASSES[x.cls].role === r && !out.includes(x)); if (h) out.push(h); }
  for (const h of ok) if (out.length < n && !out.includes(h)) out.push(h);
  return out.length < n ? null : out.sort((a, b) => CLASSES[a.cls].rk[0] - CLASSES[b.cls].rk[0]).map(h => h.id);
}
function seriesHTML(E) { if (E.rush || E.daily) return ""; const n = UI.seriesN || 0, ab = E.region === "abime";
  return `<div class="row" style="margin-top:6px;gap:4px;flex-wrap:wrap"><span class="tiny dim">${ico("auto", "#9a8c7a", 13)} Série :</span>${[0, 3, 5, 10, 999].map(v => `<button class="btn sm ${n === v ? "gold" : "ghost"}" data-a="seriesN" data-v="${v}">${v === 999 ? "∞" : v ? v + "×" : "Non"}</button>`).join("")}${n && !ab ? `<button class="btn sm ${UI.seriesEvo ? "gold" : "ghost"}" data-a="seriesEvo">${ico("up", "#ffd27a", 12)} Évolutive</button>` : ""}${n ? `<button class="btn sm ${UI.seriesAuto ? "gold" : "ghost"}" data-a="seriesAuto">${ico("helm", "#ffd27a", 12)} Compagnie auto</button>` : ""}
  <span class="tiny dim">Relance l'expédition en mode auto ; s'arrête sur une défaite${UI.seriesAuto ? "" : " ou un héros blessé"}. Les objets inutiles (Commun à Rare) sont recyclés au-delà de 150 objets. Un rapport complet s'affiche à la fin.${UI.seriesEvo && !ab ? " <b>Évolutive</b> : après chaque gardien vaincu, passe à la menace suivante, puis au chapitre suivant (menace I) une fois la menace V vaincue." : ""}${UI.seriesAuto ? " <b>Compagnie auto</b> : à chaque départ, le meilleur tank, le meilleur soigneur et les deux héros les plus puissants encore valides partent ; un blessé est remplacé au lieu d'arrêter la série." : ""}${ab && n ? " <b>Abîme infini</b> : chaque expédition descend étage par étage jusqu'à la chute ; une retraite relance la série, seule une déroute l'arrête. Le record est consigné." : ""}</span></div>`; }
ACT.seriesAuto = () => { UI.seriesAuto = !UI.seriesAuto; refresh(); };
{ const L1 = ACT.launch; ACT.launch = (...a) => { const fresh = !S.repeat && UI.seriesN; if (fresh && UI.seriesAuto) { const p = seriesParty(); if (p) UI.expe.party = p; }
    L1(...a); if (fresh && S.repeat) { S.repeat.auto = !!UI.seriesAuto; S.repeat.rep = { n: 0, win: 0, gold: 0, loot: 0, kills: 0, fallen: 0, bosses: {}, floor: 0, abyss0: S.abyss.best || 0, t0: Date.now(), seen: (S.journal && S.journal[0] && S.journal[0].t) || 0, region: UI.expe.region }; save(); } }; }

// ── 2 · Rapport de série ──
function seriesAccount(R) { const rep = R.rep, last = (S.journal || [])[0]; if (!rep || !last || last.t <= rep.seen) return; rep.seen = last.t;
  rep.n++; if (last.outcome === "victory") rep.win++; rep.gold += last.gold || 0; rep.loot += last.loot || 0; rep.kills += last.kills || 0; rep.fallen += (last.fallen || []).length;
  if (last.boss) rep.bosses[last.boss] = (rep.bosses[last.boss] || 0) + 1; if (last.region === "abime") rep.floor = Math.max(rep.floor, (last.floor || 1) - (last.outcome === "victory" ? 0 : 1)); }
function seriesReport(rep, why) { if (!rep || !rep.n) return toast(why);
  const dur = Math.max(1, Math.round((Date.now() - rep.t0) / 60000)), B = Object.entries(rep.bosses).sort((a, b) => b[1] - a[1]);
  modal(`<h2>${ico("scroll")} Rapport de série</h2><p class="small dim">${esc(why)}</p>
  <div class="statgrid"><div>Expéditions <b>${rep.n}</b></div><div>Victoires <b>${rep.win} (${Math.round(rep.win / rep.n * 100)} %)</b></div><div>Or gagné <b>${fmt(rep.gold)}</b></div><div>Objets trouvés <b>${fmt(rep.loot)}</b></div><div>Ennemis tués <b>${fmt(rep.kills)}</b></div><div>Héros tombés <b class="${rep.fallen ? "bad" : ""}">${rep.fallen}</b></div><div>Durée <b>${dur} min</b></div><div>Or par expédition <b>${fmt(Math.round(rep.gold / rep.n))}</b></div>${rep.floor ? `<div>Profondeur atteinte <b>${rep.floor}</b></div><div>Record de l'Abîme <b class="${(S.abyss.best || 0) > rep.abyss0 ? "good" : ""}">${S.abyss.best || 0}${(S.abyss.best || 0) > rep.abyss0 ? " (nouveau !)" : ""}</b></div>` : ""}</div>
  ${B.length ? `<h3 style="margin-top:10px">Gardiens vaincus</h3><div class="tiny">${B.map(([n, c]) => `${esc(n)}${c > 1 ? " ×" + c : ""}`).join(" · ")}</div>` : ""}`); }
function seriesTick() {
  const R = S.repeat; if (!R || UI.screen !== "results" || UI.seriesT) return;
  seriesAccount(R);
  const last = (S.journal || [])[0], abyss = R.cfg.region === "abime";
  if (R.auto) { const p = seriesParty(); if (p) R.cfg.party = p; }
  const hs = R.cfg.party.map(heroById), lost = !last || (abyss ? last.outcome === "wipe" : last.outcome !== "victory");
  const stop = !R.left ? "Série terminée." : lost ? (abyss ? "Série arrêtée : le groupe a péri dans l'Abîme." : "Série arrêtée : expédition perdue ou abandonnée.") : hs.some(h => !h || isInjured(h)) ? (R.auto ? "Série arrêtée : pas assez de héros valides." : "Série arrêtée : un héros est blessé ou absent.") : null;
  if (stop) { const rep = R.rep; S.repeat = null; UI.seriesN = 0; save(); seriesReport(rep, stop); return; }
  if (S.inv.length > 150) { const L = salvCandidates([0, 1, 2], true); for (const it of L) salvageItem(it); if (L.length) toast(`Série : ${L.length} objet${L.length > 1 ? "s" : ""} inutile${L.length > 1 ? "s" : ""} recyclé${L.length > 1 ? "s" : ""}.`); }
  if (R.evo && !R.evoDone && !abyss) { R.evoDone = 1; const c = R.cfg, tm = threatMax(c.region);
    if (c.threat < tm) { c.threat++; toast(`Série évolutive : menace ${THREAT_N ? THREAT_N[c.threat] || c.threat + 1 : c.threat + 1} débloquée, on monte d'un cran.`, "good"); }
    else if (c.threat >= 4) { const i = REGIONS.findIndex(r => r.id === c.region), nx = REGIONS[i + 1]; if (nx && nx.id !== "abime" && regionUnlocked(nx.id)) { c.region = nx.id; c.threat = 0; toast(`Série évolutive : chapitre suivant — ${esc(nx.n || nx.name || nx.id)}.`, "good"); } } }
  UI.seriesT = setTimeout(() => { UI.seriesT = null; if (!S.repeat || UI.screen !== "results") return; S.repeat.left--; S.repeat.evoDone = 0; go("expe"); Object.assign(UI.expe, { region: R.cfg.region, party: R.cfg.party.slice(), pet: R.cfg.pet, threat: R.cfg.threat, night: R.cfg.night }); UI.seriesN = 0; ACT.launch(); closeModal(); toast(S.repeat && S.repeat.left > 900 ? "Série sans fin : expédition suivante." : `Série : encore ${S.repeat ? S.repeat.left : 0} expédition(s) après celle-ci.`); }, 3500);
}

// ── 4 · Marché des éclats (Fonderie) ──
function marketHTML() { const M = shardMarket(), sp = shardPrice(), cp = cendrePrice();
  return `<div class="panel" style="padding:10px;margin:8px 0"><h3 style="margin:0">${ico("gem", "#b48cff", 15)} Marché des éclats</h3><p class="tiny dim">Le fondeur échange votre or contre ses rebuts les plus précieux. Les prix montent à chaque achat et redescendent chaque jour.</p>
  <div class="col">
    <div class="row sp"><span class="small"><b>Éclat</b> <span class="tiny dim">acheté ${M.n} fois aujourd'hui</span></span><button class="btn sm ${S.gold >= sp ? "gold" : "ghost off"}" data-a="market" data-v="shard">${fmt(sp)} or</button></div>
    <div class="row sp"><span class="small"><b>Cendre</b> <span class="tiny dim">achetée ${M.c} fois aujourd'hui</span></span><button class="btn sm ${S.gold >= cp ? "gold" : "ghost off"}" data-a="market" data-v="cendre">${fmt(cp)} or</button></div>
    <div class="row sp"><span class="small"><b>Gemme au hasard</b> <span class="tiny dim">niveau 1 à ${gemShopLvl()}</span></span><button class="btn sm ${S.shards >= GEM_SHARDS ? "gold" : "ghost off"}" data-a="market" data-v="gem">${GEM_SHARDS} éclats</button></div>
  </div></div>`; }
ACT.market = k => { const r = marketBuy(k); if (r.err) return toast(r.err, "bad"); sfx("coin"); save(); renderHud(); toast(`Marché : ${esc(r.ok)}${r.c ? ` (−${fmt(r.c)} or)` : ""}.`, "good"); openBuilding("fonderie"); };
{ const ob1 = openBuilding; openBuilding = (k, tab) => { ob1(k, tab); if (k === "fonderie") insertAfterLore(marketHTML()); }; }

// ── 7 · Bestiaire des variantes (Archives) ──
function variantCodexHTML() { const G = bossVariantGroups(), B = S.beaten || {}, U = S.uniqs || {}, tot = Object.values(G).reduce((a, L) => a + L.length, 0);
  return `<p class="small dim">Chaque gardien a quatre visages : Sanglant, Spectral, Ardent et Abyssal. ${variantsBeaten()}/${tot} variantes vaincues.</p><div class="grid" style="--min:260px">${Object.keys(G).filter(b => MONSTERS[b]).map(b => { const L = G[b], n = L.filter(k => B[k]).length, met = n || B[b], Ui = typeof UNIQ !== "undefined" && UNIQ[b];
    return `<div class="card ${met ? "" : "lock"}" style="cursor:default"><div class="row sp"><b>${met ? esc(MONSTERS[b].n) : "???"}</b><span class="tag ${n === L.length ? "good" : "dim"}">${n}/${L.length}</span></div><div class="tiny" style="margin-top:4px">${L.map(k => B[k] ? `<span style="color:hsl(${MONSTERS[k].hue || 0},60%,70%)">${esc(MONSTERS[k].n)}</span>` : '<span class="dim">???</span>').join("<br>")}</div>${Ui ? `<div class="tiny ${U[b] ? "gold" : "dim"}" style="margin-top:4px">${ico("crown", U[b] ? "#e8c878" : "#5a4a3a", 12)} ${U[b] || met ? esc(Ui.n) : "Objet unique inconnu"}${U[b] ? ` ×${U[b]}` : ""}</div>` : ""}</div>`; }).join("")}</div>`; }
{ const ch0 = SCREENS.codex.html; SCREENS.codex.html = () => { let h = ch0(); const on = UI.codexTab === "variantes";
    h = h.replace('<div class="tabs">', `<div class="tabs"><button class="btn sm ${on ? "on" : ""}" data-a="codexTab" data-v="variantes">${ico("crown")}Variantes</button>`);
    if (on) { const i = h.lastIndexOf("</div>"); h = h.slice(0, i) + variantCodexHTML() + h.slice(i); } return h; }; }

// ── 8 · Succès de collection : visibles (pas cachés), avec leur état ──
function hiddenAchHTML() { const H = HIDDEN_ACH.filter(a => !a.coll), C = HIDDEN_ACH.filter(a => a.coll);
  return `<h3 style="margin-top:14px">Collections</h3><div class="grid" style="--min:240px">${C.map(a => { const ok = S.ach && S.ach[a.id]; return `<div class="card ${ok ? "sel" : ""}" style="cursor:default"><div class="row" style="flex-wrap:nowrap">${ico("trophy", ok ? "#e8c878" : "#5a4a3a", 18)}<b>${a.n}</b></div><div class="tiny">${a.d}</div><div class="tiny ${ok ? "gold" : "dim"}">+${fmt(a.gold)} or · +${a.shards} éclats</div></div>`; }).join("")}</div>
  <h3 style="margin-top:14px">Succès cachés</h3><div class="grid" style="--min:240px">${H.map(a => { const ok = S.ach && S.ach[a.id]; return `<div class="card ${ok ? "" : "lock"}" style="cursor:default"><b>${ok ? a.n : "???"}</b><div class="tiny">${ok ? a.d : "Un défi secret. Jouez autrement pour le découvrir."}</div>${ok ? `<div class="tiny gold">+${a.gold} or · +${a.shards} éclats</div>` : ""}</div>`; }).join("")}</div>`; }

// ── 5 · Annonce du gardien Absolu à la préparation ──
{ const nt1 = nightToggleHTML; nightToggleHTML = E => { let h = nt1(E); if (E.region !== "abime" && !E.rush && !E.daily && (E.threat || 0) >= 4) { const hs = (E.party || []).map(heroById).filter(Boolean), mx = hs.length ? Math.max(...hs.map(x => x.lvl)) : 0;
    h += `<div class="panel" style="padding:8px;margin-top:6px;border-color:${mx >= ABSOLU_LVL ? "#c0a050" : "#4a3a2a"}"><b class="${mx >= ABSOLU_LVL ? "gold" : "dim"}">${ico("crown", mx >= ABSOLU_LVL ? "#ffd27a" : "#6a5a4a", 14)} Gardien Absolu</b><div class="tiny">${mx >= ABSOLU_LVL ? "Le gardien de cette menace se présentera sous sa forme Absolue : +40 % PV, +30 % dégâts. Butin garanti : une pièce de palier X (Légendaire ou mieux) et 2 éclats." : `En menace V, un groupe dont un héros atteint le niveau ${ABSOLU_LVL} affronte le gardien Absolu (butin de palier X garanti).`}</div></div>`; } return h; }; }
