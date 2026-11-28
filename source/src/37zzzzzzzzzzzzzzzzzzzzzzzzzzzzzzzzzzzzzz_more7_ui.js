/* Revue du 12 nov. (« toutes ») : écran unique de retour au Bastion (A), récupération automatique des récompenses (B), vitesse unique (D),
   barre du Bastion allégée (F), astuces coupées après le chapitre II (G), expédition éclair (H), équipe conseillée contre le gardien (I),
   comparateur de héros (J), ressources en un coup d'œil (K), chasse de la semaine au bestiaire (L). */

// ── B · Récupération automatique : on joue les actions « Réclamer » existantes en silence et on additionne ──
function quietly(fn) {
  const sv = { toast, refresh, renderHud, openBuilding, modal, sfx, carnet: ACT.carnet, goals: ACT.goals };
  toast = () => { }; refresh = () => { }; renderHud = () => { }; openBuilding = () => { }; modal = () => { }; sfx = () => { }; ACT.carnet = () => { }; ACT.goals = () => { };
  try { fn(); } catch (e) { console.warn("récupération auto", e); }
  finally { toast = sv.toast; refresh = sv.refresh; renderHud = sv.renderHud; openBuilding = sv.openBuilding; modal = sv.modal; sfx = sv.sfx; ACT.carnet = sv.carnet; ACT.goals = sv.goals; }
}
function autoClaimAll() {
  if (!S || !S.heroes || !S.heroes.length || S.opts.autoClaim === 0) return null;
  const g0 = S.gold, s0 = S.shards || 0, L = [];
  const n = (lbl, f) => { const a = S.gold, b = S.shards || 0; let k = 0; quietly(() => { k = f() || 0; }); if (k || S.gold !== a || (S.shards || 0) !== b) L.push(lbl + (k > 1 ? ` ×${k}` : "")); };
  n("Défis du jour", () => { let k = 0; (S.daily.contracts || []).forEach((c, i) => { if (!c.claimed && c.p >= c.goal) { ACT.claimCt(i); k++; } }); return k; });
  n("Contrats de la Taverne", () => { let k = 0; if (S.tavContracts) S.tavContracts.list.forEach((C, i) => { if (!C.done && C.got >= C.n) { ACT.tavClaim(i); k++; } }); return k; });
  n("Quêtes de classe", () => { let k = 0; if (S.classWeek) S.classWeek.list.forEach((Q, i) => { if (!Q.done && Q.got >= Q.n) { ACT.cwClaim(i); k++; } }); return k; });
  n("Passe de saison", () => { let k = 0; for (let l = 1; l <= passLvl(); l++) if (!AD().pass.got.includes(l)) { ACT.passClaim(l); k++; } return k; });
  n("Coffre du chasseur", () => { if (huntDone() && !AD().hunt.chest) { ACT.huntClaim(); return 1; } return 0; });
  n("Album des compagnons", () => { let k = 0; for (const r of albumRoles()) if (albumClaim(r)) k++; return k; });
  n("Collections", () => { let k = 0; for (const c of Object.keys(COL_N)) for (const p of colClaimable(c)) if (colClaim(c, p)) k++; return k; });
  n("Dîme de la Fonderie", () => { if (S.fondDay !== dayKey() && typeof ACT.tithe === "function") { ACT.tithe(); return 1; } return 0; });
  if (!L.length) return null; save();
  return { L, gold: S.gold - g0, shards: (S.shards || 0) - s0 };
}
const autoClaimText = R => `${R.L.join(" · ")}${R.gold ? ` — <b class="gold">+${fmt(R.gold)} or</b>` : ""}${R.shards ? ` · +${R.shards} éclats` : ""}`;

// ── A · Un seul écran de retour au Bastion (connexion, absence, entraînement, récompenses encaissées) ──
const RET = { lines: [], idle: null, timer: 0, shown: 0 };
function retPush(x) { RET.lines.push(x); retSchedule(); }
function retSchedule() { clearTimeout(RET.timer); RET.timer = setTimeout(retShow, 1600); }
function retShow() {
  if (RET.shown || UI.screen !== "bastion") return; if (!$("#modal").hidden) return void (RET.timer = setTimeout(retShow, 1200));
  const L = RET.lines.slice(), I = RET.idle; if (!L.length && !I) return; RET.shown = 1;
  const idle = I && I.out.some(x => x.xp) ? `<h3 style="margin-top:10px">${ico("helm", "#e8c878")} Entraînement (${Math.floor(I.hrs)} h ${Math.round((I.hrs % 1) * 60)} min)</h3><div class="col">${I.out.map(({ h, xp, up, capped }) => `<div class="row card" style="cursor:default;gap:10px;padding:6px 10px">${heroLabel(h)}<span class="small" style="margin-left:auto">${capped ? '<span class="dim">au plafond</span>' : `+${fmt(xp)} XP${up ? ` · <b class="gold">niv ${h.lvl}</b>` : ""}`}</span></div>`).join("")}</div>` : "";
  modal(`<h2>${ico("castle", "#e8c878")} Retour au Bastion</h2><div class="col">${L.map(x => `<div class="row card" style="gap:10px;padding:8px 10px;${x.a ? "cursor:pointer" : "cursor:default"}" ${x.a ? `data-a="${x.a}" data-v="${x.v || ""}"` : ""}>${ico(x.ic === "clock" ? "hourglass" : x.ic, x.c || "#e8c878", 20)}<span class="small" style="flex:1">${x.t}</span>${x.a ? '<span class="tiny gold">›</span>' : ""}</div>`).join("")}</div>${idle}
    <div class="row" style="justify-content:flex-end;margin-top:10px"><button class="btn main" data-a="closeModal">Au travail</button></div>`);
}
{ const ir = idleReport; idleReport = function (R) { if (!RET.shown && UI.screen === "bastion") { RET.idle = R; retSchedule(); return; } return ir.apply(this, arguments); }; }
{ const bm = SCREENS.bastion.mount; SCREENS.bastion.mount = function () {
    const first = !UI._retDone && !S.run && S.heroes && S.heroes.length;
    if (first) { UI._retDone = 1; UI._carnetAuto = 1; UI._awayShown = 1; } // remplacés par l'écran unique
    const r = bm && bm.apply(this, arguments);
    try {
      if (first) {
        try { loginTick(); const st = AD().login.streak, R = loginClaim(); if (R) RET.lines.push({ ic: "coin", t: `Connexion, jour ${st} : +${fmt(R.gold)} or${R.shards ? ` · +${R.shards} éclats` : ""}${R.set ? " · pièce de panoplie" : ""}`, a: "carnet", v: "login" }); } catch (e) { }
        try { const A = awaySummary(); if (A) for (const x of A) RET.lines.push(x); save(); } catch (e) { }
        const C = autoClaimAll(); if (C) RET.lines.push({ ic: "chest", t: `Récupéré automatiquement : ${autoClaimText(C)}` });
        if (RET.lines.length) retSchedule();
      } else if (!S.run) { const C = autoClaimAll(); if (C) setTimeout(() => toast(`${ico("chest", "#e8c878", 14)} ${autoClaimText(C)}`, "good"), 500); }
    } catch (e) { console.warn("retour", e); }
    return r; }; }

// ── D · Vitesse unique (remplace « Animations rapides », « Partie rapide » et la vitesse des combats) ──
const GAME_SPEEDS = [["n", "Normale", { speed: 1, quick: 0, fast: 0 }], ["r", "Rapide", { speed: 2, quick: 1, fast: 0 }], ["tr", "Très rapide", { speed: 4, quick: 1, fast: 1 }]];
const gameSpeedCur = () => S.opts.fast ? "tr" : (S.opts.quick || (S.opts.speed || 1) >= 2) ? "r" : "n";
ACT.optGameSpeed = k => { const G = GAME_SPEEDS.find(g => g[0] === k); if (!G) return; Object.assign(S.opts, G[2]); save(); refresh(); toast("Vitesse : " + G[1]); };
{ const oh = SCREENS.options.html; SCREENS.options.html = function () { let s = oh.apply(this, arguments);
    s = s.replace(/<label class="row sp">(?:(?!<\/label>)[\s\S])*?data-opt="quick"[\s\S]*?<\/label>/, "").replace(/<label class="row sp">(?:(?!<\/label>)[\s\S])*?data-opt="fast"[\s\S]*?<\/label>/, "");
    const cur = gameSpeedCur(), row = `<div class="row sp"><span>${ico("speed")} Vitesse du jeu <span class="tiny dim">— combats, animations et carte (×1 · ×2 · ×4)</span></span><span>${GAME_SPEEDS.map(([k, n]) => `<button class="btn sm ${cur === k ? "gold" : "ghost"}" data-a="optGameSpeed" data-v="${k}">${n}</button>`).join(" ")}</span></div>`;
    const ac = `<label class="row sp"><span>${ico("chest")} Récupération automatique <span class="tiny dim">— défis, contrats, passe, collections et dîme encaissés seuls au retour au Bastion</span></span><input type="checkbox" data-opt="autoClaim" ${S.opts.autoClaim !== 0 ? "checked" : ""}></label>`;
    s = s.replace(/(<label class="row sp"><span>[^]*?Recyclage automatique)/, ac + "$1");
    return s.replace(/<div class="row sp"><span>[^]*?Vitesse des combats<\/span><span>[\s\S]*?<\/span><\/div>/, row); }; }

// ── F · Barre du Bastion : l'essentiel visible, le reste dans « Plus » ──
const RAIL_KEEP = ["hubPanel", "goals", "carnet", "merchant", "chestOpen"];
ACT.railMore = () => { UI.railMore = !UI.railMore; refresh(); };
{ const hr = hubRailHTML; hubRailHTML = function () { const h = hr.apply(this, arguments);
    try { const btns = h.match(/<button class="hrail"[\s\S]*?<\/button>/g) || [], keep = [], more = []; let badge = 0;
      for (const b of btns) { const a = (b.match(/data-a="([^"]*)"/) || [])[1]; if (RAIL_KEEP.includes(a)) keep.push(b); else { more.push(b); const m = b.match(/<i>(\d+)<\/i>/); if (m) badge += +m[1]; else if (/<i>/.test(b)) badge++; } }
      if (more.length < 2) return h;
      const plus = `<button class="hrail ${UI.railMore ? "on" : ""}" data-a="railMore" title="Plus">${ico(UI.railMore ? "close" : "plus", "#e8c878", 22)}<span>${UI.railMore ? "Fermer" : "Plus"}</span>${badge && !UI.railMore ? `<i>${badge}</i>` : ""}</button>`;
      return `<div class="hubrail">${keep.join("")}${plus}${UI.railMore ? more.join("") : ""}</div>`; } catch (e) { return h; } }; }

// ── G · Astuces : coupées d'elles-mêmes après le chapitre II (réactivables dans les Options) ──
{ const ho = hintOnce; hintOnce = function () { try { if (!S.opts.hintsOn && regionsCleared() >= 2) return; } catch (e) { } return ho.apply(this, arguments); }; }

// ── H · Expédition éclair : un chapitre déjà vaincu à cette menace se résout d'un coup (carte et combats automatiques, sans animation) ──
const flashOk = E => E && E.region && E.region !== "abime" && S.prog[E.region] && S.prog[E.region].clears && (S.prog[E.region].threat || 0) >= (E.threat || 0) && !E.special && !E.rush && !E.hard && !E.legend && !E.week && !E.daily && !E.twin && !UI.seriesN && (E.party || []).length > 0;
ACT.flashRun = () => { const E = UI.expe; if (!flashOk(E)) return toast("L'expédition éclair demande un gardien déjà vaincu à cette menace.", "bad"); UI._flash = 1; try { ACT.launch(); } finally { if (!S.run || !S.run.flash) UI._flash = 0; } };
{ const sr = startRun; startRun = function () { const r = sr.apply(this, arguments); try { if (UI._flash && S.run && flashOk(UI.expe)) { S.run.flash = 1; UI._flash = 0; setTimeout(flashResolve, 60); } } catch (e) { } return r; }; }
// résolution instantanée côté logique (comme les bots) : salles choisies au mieux, combats simulés, bilan direct
function flashResolve() { const run = S.run; if (!run || !run.flash) return; let out = "retreat";
  const hpf = () => { const H = run.party.map(id => heroById(id)).filter(Boolean); return H.length ? H.reduce((a, h) => a + (h.hp != null ? h.hp / Math.max(1, heroStats(h).hp) : 1), 0) / H.length : 1; };
  const sc = (n, hf) => ({ combat: 5, elite: hf > .75 ? 7 : 1, event: 4, treasure: 6, camp: hf < .6 ? 9 : 2, shop: 0, boss: 10 }[n.type] || 3) + Math.random();
  try { for (let st = 0; st < 80; st++) { const av = availableNodes(run); if (!av.length) { out = "victory"; break; }
      const hf = hpf(), node = av.slice().sort((a, b) => sc(b, hf) - sc(a, hf))[0];
      if (run.fallen.length >= 2 && node.type !== "boss") { out = "retreat"; break; }
      enterNode(run, node);
      if (["combat", "elite", "boss"].includes(node.type)) { const B = battleFor(run, node, node.enc || genEncounter(run, node)); const r = simBattle(B, run, "bal"); afterBattle(run, B); if (r !== "win") { out = "wipe"; break; } grantReward(run, rewardFor(run, node)); }
      else if (node.type === "event") { const ci = typeof autoEventChoice === "function" ? autoEventChoice(run, node) : 0; const res = resolveEvent(run, node.ev, ci); if (res && res.fight) { const fn = { c: node.c, type: "combat" }; const B = battleFor(run, fn, genEncounter(run, fn)); const r = simBattle(B, run, "bal"); afterBattle(run, B); if (r !== "win") { out = "wipe"; break; } grantReward(run, rewardFor(run, fn)); } }
      else if (node.type === "treasure") grantReward(run, rewardFor(run, node));
      else if (node.type === "camp") doCamp(run, hf < .75 ? "rest" : "train");
      node.done = true; }
  } catch (e) { console.warn("éclair", e); }
  try { closeModal(); } catch (e) { } finishRun(out); }

{ const bi = bossIntro; bossIntro = function (bs, ov) { if (S.run && S.run.flash) return Promise.resolve(); return bi.apply(this, arguments); }; }

// ── I · Équipe conseillée contre le gardien du chapitre ──
function bossCounterScore(h, tags) { let best = 1; try { for (const sk of heroSkillPool(h)) { let m = 1; for (const g of sk.tags || []) m = Math.max(m, affinity({ side: "e", tags }, g)); for (const f of sk.fx || []) if (["bleed", "poison", "burn"].includes(f.k)) m = Math.max(m, affinity({ side: "e", tags }, f.k)); best = Math.max(best, m); } } catch (e) { } return best; }
function counterParty(E) {
  const R = regionById(E.region), M = R && MONSTERS[R.boss]; if (!M) return null; const tags = M.tags || [];
  const hs = S.heroes.filter(h => !h.dead && !(typeof isInjured === "function" && isInjured(h))), sc = h => heroPower(h) * bossCounterScore(h, tags), pick = [];
  for (const role of ["tank", "soin"]) { const c = hs.filter(h => CLASSES[h.cls].role === role && !pick.includes(h)).sort((a, b) => sc(b) - sc(a))[0]; if (c) pick.push(c); }
  for (const h of hs.slice().sort((a, b) => sc(b) - sc(a))) if (pick.length < 4 && !pick.includes(h)) pick.push(h);
  return { M, tags, pick, aff: affinityOf(tags) };
}
ACT.counterApply = () => { const C = counterParty(UI.expe); if (!C) return; UI.expe.party = C.pick.map(h => h.id); refresh(); toast("Équipe conseillée appliquée."); };
function counterHTML(E) { const C = counterParty(E); if (!C || C.pick.length < 2) return "";
  const W = (C.aff && C.aff.W && C.aff.W.length) ? C.aff.W.join(", ") : "aucune faiblesse marquée";
  return `<div class="card" style="cursor:default;margin:8px 0;border-color:#e8c87855"><div class="row sp" style="gap:8px;flex-wrap:wrap"><div class="small">${ico("crown", "#e8c878", 15)} <b>Contre ${esc(C.M.n)}</b> <span class="tiny dim">(${(C.tags || []).join(", ") || "—"} · faiblesses : ${W})</span><div class="tiny">Conseil : ${C.pick.map(h => `${esc(h.name)} <span class="dim">(${CLASSES[h.cls].n})</span>`).join(", ")}</div></div><button class="btn sm gold" data-a="counterApply">Appliquer</button></div></div>`; }

// ── H + I dans la préparation : bouton éclair (Destination) et conseil (Compagnie) ──
{ const eh = SCREENS.expe.html; SCREENS.expe.html = function () { let h = eh.apply(this, arguments); if (S.run) return h; const E = UI.expe; if (!E) return h;
    try { const i = h.indexOf('<div class="stickybar">'); if (i < 0) return h;
      let add = "";
      if ((UI.expePane || "dest") === "team") add += counterHTML(E);
      if (flashOk(E) && (UI.expePane || "dest") === "dest") add += `<div class="card" style="cursor:default;margin:8px 0"><div class="row sp" style="gap:8px;flex-wrap:wrap"><div class="small">${ico("speed", "#9ad0ff", 15)} <b>Expédition éclair</b><div class="tiny dim">Gardien déjà vaincu à cette menace : carte et combats résolus d'un coup, bilan direct.</div></div><button class="btn sm" data-a="flashRun">${ico("speed")} Éclair</button></div></div>`;
      return add ? h.slice(0, i) + add + h.slice(i) : h; } catch (e) { return h; } }; }

// ── J · Comparateur de héros ──
ACT.heroCmp = v => { const ids = S.heroes.map(h => h.id); UI.cmp = UI.cmp || [ids[0], ids[1]]; if (v) { const [s, id] = String(v).split(":"); UI.cmp[+s] = id; }
  const [A, B] = UI.cmp.map(heroById); if (!A || !B) return toast("Il faut au moins deux héros.", "bad");
  const sa = heroStats(A), sb = heroStats(B), row = (n, a, b, fmtv = x => Math.round(x)) => { const d = a - b; return `<tr><td class="${d > 0 ? "good" : ""}" style="text-align:right">${fmtv(a)}</td><td class="tiny dim" style="text-align:center;padding:2px 8px">${n}</td><td class="${d < 0 ? "good" : ""}">${fmtv(b)}</td></tr>`; };
  const pick = s => `<div class="row" style="gap:4px;flex-wrap:wrap;justify-content:center">${S.heroes.slice().sort((a, b) => b.lvl - a.lvl).map(h => `<button class="btn sm ${UI.cmp[s] === h.id ? "gold" : "ghost"}" data-a="heroCmp" data-v="${s}:${h.id}">${esc(typeof shortName === "function" ? shortName(h.name) : h.name)}</button>`).join("")}</div>`;
  const pct = x => Math.round(x * 100) + " %";
  modal(`<h2>${ico("swords", "#e8c878")} Comparer deux héros</h2><div class="grid" style="--min:240px"><div>${pick(0)}</div><div>${pick(1)}</div></div>
    <table style="width:100%;margin-top:10px;border-collapse:collapse"><tr><th style="text-align:right">${esc(A.name)}<div class="tiny dim">${CLASSES[A.cls].n} · niv ${A.lvl}</div></th><th></th><th style="text-align:left">${esc(B.name)}<div class="tiny dim">${CLASSES[B.cls].n} · niv ${B.lvl}</div></th></tr>
    ${row("Puissance", heroPower(A), heroPower(B))}${row("PV", sa.hp, sb.hp)}${row("Dégâts", (sa.dmgLo + sa.dmgHi) / 2, (sb.dmgLo + sb.dmgHi) / 2)}${row("Protection", sa.prot, sb.prot, pct)}${row("Vitesse", sa.spd, sb.spd)}${row("Esquive", sa.dodge, sb.dodge)}${row("Critique", sa.crit, sb.crit)}${row("Précision", sa.acc || 0, sb.acc || 0)}${row("Résistance", sa.res || 0, sb.res || 0)}</table>
    <p class="tiny dim" style="margin-top:8px">En vert : le meilleur des deux.</p>`); };
{ const hh = SCREENS.heroes.html; SCREENS.heroes.html = function () { const h = hh.apply(this, arguments); if (S.heroes.length < 2) return h;
    return h.replace(/(<h2[^>]*>[\s\S]*?<\/h2>)/, `$1<div class="row" style="justify-content:flex-end;margin:-4px 0 6px"><button class="btn sm ghost" data-a="heroCmp">${ico("swords")} Comparer</button></div>`); }; }

// ── K · Ressources en un coup d'œil ──
ACT.resPanel = () => { const G = S.gems || {}, gems = Object.values(G).reduce((a, b) => a + b, 0), r = (ic, c, n, v, d) => `<div class="row card" style="cursor:default;gap:10px;padding:6px 10px">${ico(ic, c, 20)}<div style="flex:1"><b class="small">${n}</b><div class="tiny dim">${d}</div></div><b>${v}</b></div>`;
  modal(`<h2>${ico("chest", "#e8c878")} Ressources</h2><div class="col">
    ${r("coin", "#e8c060", "Or", fmt(S.gold), "Recrues, bâtiments, soins, améliorations.")}${r("shard", "#c090ff", "Éclats de couronne", fmt(S.shards || 0), "Objets de qualité, marché des éclats, éveil.")}
    ${r("iron", "#a8a8a8", "Ferraille", fmt(S.mats.fer || 0), "Forge : fabrication et améliorations.")}${r("essence", "#7ad0ff", "Essence", fmt(S.mats.essence || 0), "Améliorations avancées, enchantements.")}${r("ember", "#ff8a3a", "Cendre", fmt(S.mats.cendre || 0), "Paliers élevés, gravures.")}
    ${r("gem", "#e06090", "Gemmes", fmt(gems), "À sertir sur les objets Mythiques et mieux (Forge › Gemmes).")}${r("book", "#c8a070", "Tomes d'expérience", fmt(S.tomes || 0), "À lire depuis la fiche d'un héros.")}${S.ptomes ? r("paw", "#c8a070", "Tomes de compagnon", fmt(S.ptomes), "Expérience pour les compagnons.") : ""}</div>`); };
{ const rh = renderHud; renderHud = function () { const r = rh.apply(this, arguments); try { const hd = $("#hud"); if (hd && hd.style.display !== "none" && !hd.querySelector(".resmore")) hd.insertAdjacentHTML("beforeend", `<button class="resmore" data-a="resPanel" title="Toutes les ressources">⋯</button>`); } catch (e) { } return r; }; }

// ── L · Chasse de la semaine au bestiaire : trois créatures à traquer ──
function weekHunt() { const wk = legWeekKey(); if (S.wHunt && S.wHunt.wk === wk) return S.wHunt;
  const pool = []; for (const r of REGIONS) if (regionUnlocked(r.id)) for (const k of r.pool || []) if (MONSTERS[k]) pool.push(k);
  const rng = mkRng(hashStr("wh" + wk)), ks = rng.shuffle([...new Set(pool)]).slice(0, 3), base = {}; for (const k of ks) base[k] = (S.seen.monsters[k] || 0);
  S.wHunt = { wk, ks, base, n: 6, done: 0 }; return S.wHunt; }
const weekHuntProg = W => W.ks.map(k => Math.min(W.n, Math.max(0, (S.seen.monsters[k] || 0) - (W.base[k] || 0))));
function weekHuntReward() { const lv = Math.max(1, ...S.heroes.map(h => h.lvl)); return { gold: Math.round((400 + lv * 120) / 10) * 10, shards: 3 + Math.floor(lv / 20) }; }
ACT.weekHuntClaim = () => { const W = weekHunt(); if (W.done || weekHuntProg(W).some(p => p < W.n)) return; const R = weekHuntReward(); W.done = 1; S.gold += R.gold; S.shards = (S.shards || 0) + R.shards; sfx("level"); save(); renderHud(); toast(`Chasse de la semaine : +${fmt(R.gold)} or · +${R.shards} éclats`, "good"); refresh(); };
function weekHuntHTML() { if (!S.heroes.length) return ""; const W = weekHunt(); if (!W.ks.length) return ""; const P = weekHuntProg(W), ok = P.every(p => p >= W.n), R = weekHuntReward();
  return `<div class="card" style="cursor:default;margin:6px 0 10px;border-color:#c8a07066"><div class="row sp" style="gap:8px;flex-wrap:wrap"><b class="small">${ico("skull", "#c8a070", 15)} Chasse de la semaine</b><span class="tiny dim">${fmt(R.gold)} or · ${R.shards} éclats</span></div>
    <div class="col" style="gap:4px;margin-top:6px">${W.ks.map((k, i) => `<div class="row" style="gap:8px"><span class="small" style="flex:1">${esc(MONSTERS[k].n)}</span><div class="bar xp" style="width:90px"><i style="width:${100 * P[i] / W.n}%"></i></div><span class="tiny ${P[i] >= W.n ? "good" : "dim"}">${P[i]}/${W.n}</span></div>`).join("")}</div>
    ${W.done ? `<div class="tiny good" style="margin-top:6px">✓ Récompense reçue. Nouvelle chasse la semaine prochaine.</div>` : ok ? `<div class="row" style="justify-content:flex-end;margin-top:6px"><button class="btn sm gold" data-a="weekHuntClaim">Récupérer</button></div>` : ""}</div>`; }
{ const bh = bestiaryHTML; bestiaryHTML = function () { return weekHuntHTML() + bh.apply(this, arguments); }; }

// Objectifs › défi du jour : ouvre le panneau du Bastion (au lieu de le basculer derrière la fenêtre)
ACT.goalDaily = () => { closeModal(); if (UI.screen !== "bastion") go("bastion"); UI.hubOpen = true; try { localStorage.setItem("cc-hubOpen", "1"); } catch (e) { } refresh(); };
// Chasse de la semaine : initialisée dès le premier combat de la semaine
{ const cm2 = SCREENS.combat.mount; SCREENS.combat.mount = function () { try { if (S && S.heroes && S.heroes.length) weekHunt(); } catch (e) { } return cm2 && cm2.apply(this, arguments); }; }

// Forge : 6 onglets → « Forger / Inventaire / Améliorer / Atelier » ; l'Atelier regroupe Bibelots, Panoplies et Gemmes
const FORGE_ATELIER = ["tr", "sets", "gems"];
ACT.forgeAtelier = () => { const cur = (UI.bldTab && UI.bldTab.forge) || ""; openBuilding("forge", FORGE_ATELIER.includes(cur) ? cur : (UI.forgeAtelierLast || "tr")); };
{ const ob = openBuilding; openBuilding = function (k, tab) { const r = ob.apply(this, arguments);
    if (k === "forge") try { const bar = [...document.querySelectorAll("#modal .tabs")].find(t => t.querySelector('[data-v="forge:craft"]')); if (bar && !bar.querySelector(".fatl")) {
        const bs = FORGE_ATELIER.map(v => bar.querySelector(`[data-v="forge:${v}"]`)).filter(Boolean); if (bs.length) {
          const on = bs.some(b => b.classList.contains("on")); if (on) UI.forgeAtelierLast = bs.find(b => b.classList.contains("on")).dataset.v.split(":")[1];
          const sub = document.createElement("div"); sub.className = "tabs fsub"; bs.forEach(b => sub.appendChild(b));
          bar.insertAdjacentHTML("beforeend", `<button class="btn sm fatl ${on ? "on" : ""}" data-a="forgeAtelier">${ico("gem")}Atelier</button>`);
          if (on) bar.after(sub); } } } catch (e) { }
    return r; }; }
