/* Améliorations du 12 nov. (après-midi), interface : badges des bâtiments, bestiaire complété, fiche d'ennemi en combat, meilleure trouvaille sur la carte,
   taille du texte et lettres de rareté, « Tout récupérer » du Carnet, temps de jeu et onglet Carrière des Archives. */

// ── Badges des bâtiments : un point quand une action utile y attend ──
function bldUpPick() { try { let best = null, bg = Infinity; for (const k in BUILDINGS) { const c = bldCost(k); if (c && canPay(c) && bldAdvOk(k) && (c.gold || 0) < bg) { bg = c.gold || 0; best = k; } } return best; } catch (e) { return null; } }
function bldNote(k) {
  try {
    if (BUILDINGS[k] && typeof bldCost === "function" && bldUpPick() === k) return true; // une seule pastille d'amélioration : la moins chère
    if (k === "taverne" && ((typeof wheelReady === "function" && wheelReady()) || (S.tavContracts && S.tavContracts.list.some(C => !C.done && C.got >= C.n)))) return true;
    if (k === "chapelle" && S.heroes.some(h => h.cursed)) return true;
    if (k === "menagerie" && typeof petCanEvolve === "function" && S.pets.owned.some(id => petCanEvolve(id))) return true;
  } catch (e) { }
  return false;
}

// ── Bestiaire : chapitres complets marqués, bonus rappelé ──
{ const bg = bestiaryGroups; bestiaryGroups = function () { const G = bg.apply(this, arguments), C = bestChapters();
    for (const g of G) { const c = C.find(c => g.ks.length && c.ks.includes(g.ks[0]) && g.n.endsWith(c.r.n)); if (!c) continue; g.best = bestState(c.id); if (g.best.done) g.n += " ✓"; }
    return G; }; }
{ const bh = bestiaryHTML; bestiaryHTML = function () { const G = bestiaryGroups(); let i = 0;
    const h = bh.apply(this, arguments).replace(/<\/h3>/g, m => { const g = G[i++], st = g && g.best; return st ? m + `<p class="tiny ${st.done ? "good" : "dim"}" style="margin:2px 0 6px">${st.done ? `Page complète : +${Math.round(BEST_DMG * 100)} % de dégâts contre ces créatures.` : `${st.n}/${st.of} créatures vaincues — toutes pour compléter la page (+${Math.round(BEST_DMG * 100)} % de dégâts contre elles).`}</p>` : m; });
    return `<p class="tiny dim" style="margin:0 0 4px">${ico("skull", "#c8a070", 13)} Vaincre chacune des créatures d'un chapitre (ordinaires, élites et gardien) complète sa page : <b>+${Math.round(BEST_DMG * 100)} % de dégâts</b> contre elles, pour toujours.</p>` + h; }; }

// ── Combat : la bulle d'un ennemi ouvre sa fiche du bestiaire ──
{ const ci = cbInfo; cbInfo = function (u, what) { const r = ci.apply(this, arguments);
    try { if (u && u.side === "e" && MONSTERS[u.key] && what !== "st") { const el = $("#cbinfo"); if (el && !el.querySelector(".cbsheet")) el.insertAdjacentHTML("beforeend", `<div class="row" style="justify-content:flex-end;margin-top:4px"><button class="btn sm ghost cbsheet" data-a="monSheet" data-v="${u.key}">${ico("book", "#c8a070", 13)} Fiche du bestiaire</button></div>`); } } catch (e) { }
    return r; }; }

// ── Carte d'expédition : meilleure trouvaille ──
{ const mh = SCREENS.map.html; SCREENS.map.html = function () { let h = mh.apply(this, arguments); const run = S.run;
    try { if (run && run.loot.length) { const best = run.loot.reduce((a, it) => !a || it.rar > a.rar || (it.rar === a.rar && (it.tier || 0) > (a.tier || 0)) ? it : a, null);
      const tag = `<span class="tag" style="cursor:pointer" data-a="runBag" title="Meilleure trouvaille : ${esc(gearName(best))}">${ico("star", "#e8c878")}<b class="rar${best.rar}">${RARITY[best.rar].n}</b></span>`;
      h = h.replace(/(data-a="runBag" title="Butin : voir et équiper">[\s\S]*?<\/span>)/, "$1" + tag); } } catch (e) { }
    return h; }; }

// ── Options : texte agrandi, lettres de rareté ──
function applyLookOpts() { if (typeof document === "undefined" || !document.body) return; document.body.classList.toggle("bigtxt", !!S.opts.bigTxt); document.body.classList.toggle("rarlbl", !!S.opts.rarLbl); }
{ const oh = SCREENS.options.html; SCREENS.options.html = function () { const s = oh.apply(this, arguments);
    const rows = `<label class="row sp"><span>${ico("eye")} Texte agrandi <span class="tiny dim">— fenêtres et menus plus lisibles</span></span><input type="checkbox" data-opt="bigTxt" ${S.opts.bigTxt ? "checked" : ""}></label>
      <label class="row sp"><span>${ico("gem")} Lettres de rareté <span class="tiny dim">— une lettre sur chaque objet en plus de la couleur (C, PC, R, É, L…)</span></span><input type="checkbox" data-opt="rarLbl" ${S.opts.rarLbl ? "checked" : ""}></label>`;
    const i = s.indexOf('<label class="row sp"><span>' + ico("speed")); return i >= 0 ? s.slice(0, i) + rows + s.slice(i) : s.replace(/(<label class="row sp">)/, rows + "$1"); };
  const om = SCREENS.options.mount; SCREENS.options.mount = function () { const r = om && om.apply(this, arguments); document.querySelectorAll('[data-opt="bigTxt"],[data-opt="rarLbl"]').forEach(i => i.addEventListener("change", () => setTimeout(applyLookOpts, 0))); return r; }; }
setTimeout(() => { try { applyLookOpts(); } catch (e) { } }, 0);
{ const ld = typeof load === "function" ? load : null; if (ld) load = function () { const r = ld.apply(this, arguments); try { applyLookOpts(); } catch (e) { } return r; }; }

// ── Carnet : tout récupérer ──
function carnetPending() { try { return carnetBadge() > 0; } catch (e) { return false; } }
{ const ca = ACT.carnet; ACT.carnet = function () { const r = ca.apply(this, arguments);
    try { const h = $("#modal h2"); if (h && !$("#modal .cnall")) h.insertAdjacentHTML("afterend", `<div class="row" style="justify-content:flex-end;margin:-4px 0 6px"><button class="btn sm gold cnall" data-a="carnetAll">${ico("chest", "#e8c878", 14)} Tout récupérer</button></div>`); } catch (e) { }
    return r; }; }
ACT.carnetAll = () => { const R = carnetClaimAll(); if (!R.n) return toast("Rien à récupérer pour l'instant.");
  sfx("coin"); save(); renderHud(); toast(`${R.n} récompense${R.n > 1 ? "s" : ""} récupérée${R.n > 1 ? "s" : ""}${R.gold ? ` · +${fmt(R.gold)} or` : ""}${R.shards ? ` · +${R.shards} éclats` : ""}`, "good"); ACT.carnet(); };

// ── Temps de jeu (minutes, seulement quand la page est visible) ──
setInterval(() => { try { if (S && S.heroes && S.heroes.length && (typeof document === "undefined" || !document.hidden)) { S.playMin = (S.playMin || 0) + 1; } } catch (e) { } }, 60000);

// ── Archives › Carrière ──
function careerHTML() {
  const st = S.stats || {}, pm = S.playMin || 0, beaten = Object.keys(S.beaten || {}).length, ach = Object.keys(S.ach || {}).length;
  const kills = Object.entries((S.seen && S.seen.monsters) || {}).filter(([k, n]) => n > 0 && MONSTERS[k]).sort((a, b) => b[1] - a[1]);
  const C = bestChapters().filter(c => c.id !== "abime"), done = C.filter(c => c.ks.every(bestKilled)).length;
  const box = (ic, col, n, v) => `<div class="card" style="cursor:default;text-align:center;padding:8px">${ico(ic, col, 20)}<div class="tiny dim">${n}</div><b>${v}</b></div>`;
  return `<p class="small dim">Tout ce que votre compagnie a accompli depuis le début.</p>
    <div class="grid" style="--min:130px">${[
      ["hourglass", "#c8b8a0", "Temps de jeu", pm >= 60 ? `${Math.floor(pm / 60)} h ${pm % 60} min` : `${pm} min`],
      ["map", "#e8c878", "Expéditions", fmt(st.runs || 0)], ["swords", "#e07060", "Combats gagnés", fmt(st.wins || 0)], ["skull", "#c8a070", "Ennemis vaincus", fmt(st.kills || 0)],
      ["crown", "#e8c878", "Gardiens différents vaincus", beaten], ["coin", "#e8c060", "Or le plus haut", fmt(st.goldMax || S.gold || 0)],
      ["up", "#9ad0ff", "Niveau le plus haut", st.maxlvl || Math.max(1, ...S.heroes.map(h => h.lvl))], ["torch", "#9a6aff", "Abîme : record", (S.abyss && S.abyss.best) || 0],
      ["trophy", "#e8c878", "Succès", ach], ["book", "#c8a070", "Bestiaire complet", `${done}/${C.length} chapitres`], ["heart", "#8ad06a", "Évolutions", st.evos || 0], ["skull", "#a09080", "Héros tombés", (S.graves || []).length]
    ].map(a => box(...a)).join("")}</div>
    <h3 style="margin-top:14px">${ico("skull", "#c8a070")} Tableau de chasse <span class="tiny dim">${kills.length} espèces</span></h3>
    <div class="col">${kills.slice(0, 15).map(([k, n], i) => `<div class="row sp card" style="cursor:pointer;padding:6px 10px" data-a="monSheet" data-v="${k}"><span class="small">${i + 1}. ${esc(MONSTERS[k].n)}</span><b class="small">${fmt(n)}</b></div>`).join("") || `<div class="empty">Aucune créature vaincue pour l'instant.</div>`}</div>`;
}
{ const ch0 = SCREENS.codex.html; SCREENS.codex.html = function () { let h = ch0.apply(this, arguments); const on = UI.codexTab === "carriere";
    h = h.replace('<div class="tabs">', `<div class="tabs"><button class="btn sm ${on ? "on" : ""}" data-a="codexTab" data-v="carriere">${ico("trophy")}Carrière</button>`);
    if (on) { const i = h.lastIndexOf("</div>"); h = h.slice(0, i) + careerHTML() + h.slice(i); } return h; }; }

// ── Archives : une vingtaine d'onglets regroupés en 4 familles (Collections, Récits, Progrès, Aide) ──
const CODEX_FAM = [["coll", "skull", "Bestiaire", ["bestiaire", "elites", "errants", "variantes"]],
  ["tres", "coin", "Trésors", ["uniques", "reliques", "bibelots", "finds"]],
  ["comp", "crown", "Compagnie", ["classes", "synergies"]],
  ["story", "scroll", "Récits", ["histoire", "atlas", "journal", "memorial", "loss", "news"]],
  ["prog", "trophy", "Progrès", ["carriere", "succes", "defis", "rang", "records"]],
  ["help", "book", "Aide", ["glossaire", "guide"]]];
const codexFamOf = t => (CODEX_FAM.find(f => f[3].includes(t)) || CODEX_FAM[0])[0];
ACT.codexFam = f => { const F = CODEX_FAM.find(x => x[0] === f); if (!F) return; UI.codexFam = f; if (codexFamOf(UI.codexTab || "classes") !== f) UI.codexTab = F[3][0]; refresh(); };
{ const ch0 = SCREENS.codex.html; SCREENS.codex.html = function () { const h = ch0.apply(this, arguments);
    try { const i = h.indexOf('<div class="tabs">'); if (i < 0) return h; let j = i + 18, d = 1; // fin du bloc d'onglets
      const re = /<\/?div\b/g; re.lastIndex = j; let m; while ((m = re.exec(h))) { d += m[0] === "<div" ? 1 : -1; if (!d) { j = m.index; break; } }
      const inner = h.slice(i + 18, j), btns = inner.match(/<button[^>]*data-a="codexTab"[\s\S]*?<\/button>/g) || [];
      const cur = UI.codexTab || "classes", fam = codexFamOf(cur), vOf = b => (b.match(/data-v="([^"]+)"/) || [])[1];
      const mine = btns.filter(b => codexFamOf(vOf(b)) === fam).sort((a, b) => { const L = CODEX_FAM.find(f => f[0] === fam)[3]; return L.indexOf(vOf(a)) - L.indexOf(vOf(b)); });
      const famBar = `<div class="tabs cxfam">${CODEX_FAM.map(([k, ic, n]) => `<button class="btn ${k === fam ? "on" : ""}" data-a="codexFam" data-v="${k}">${ico(ic)}${n}</button>`).join("")}</div>`;
      return h.slice(0, i) + famBar + `<div class="tabs cxsub">${mine.join("")}</div>` + h.slice(j + 6); } catch (e) { return h; } }; }

// ── Chapelle : soigner toute la compagnie (blessures, stress et afflictions, larmes maudites, compagnons blessés) en un clic ──
const PET_REST_COST = p => 120 + 40 * (PET_ORDER ? Math.max(0, PET_ORDER.indexOf(p)) : 0) / 10;
function restorePlan() {
  const L = [], hc = h => Math.round(healCost(h) * (1 - Math.min(.6, (S.bld.chapelle - 1) * .1)) * (1 - Math.min(.4, .01 * advA())));
  for (const h of S.heroes) { if (h.dead) continue;
    if (isInjured(h)) L.push({ t: "heal", h, c: hc(h) });
    if (typeof calmCost === "function" && ((h.stress || 0) > 0 || (h.affl && AFFLICTIONS[h.affl] && AFFLICTIONS[h.affl].bad))) L.push({ t: "calm", h, c: calmCost(h) });
    if (h.cursed > 0) L.push({ t: "curse", h, c: 60 + h.lvl * 10 }); }
  for (const p in S.petHurt || {}) if (S.petHurt[p] > 0) L.push({ t: "pet", p, c: Math.round(PET_REST_COST(p)) });
  return L;
}
function restoreAllHTML() { const L = restorePlan(); if (!L.length) return "";
  const tot = L.reduce((a, x) => a + x.c, 0), n = k => L.filter(x => x.t === k).length;
  const parts = [n("heal") && `${n("heal")} blessure${n("heal") > 1 ? "s" : ""}`, n("calm") && `${n("calm")} stress`, n("curse") && `${n("curse")} larme${n("curse") > 1 ? "s" : ""} maudite${n("curse") > 1 ? "s" : ""}`, n("pet") && `${n("pet")} compagnon${n("pet") > 1 ? "s" : ""} blessé${n("pet") > 1 ? "s" : ""}`].filter(Boolean).join(" · ");
  return `<div class="card" style="cursor:default;margin:8px 0;border-color:#8ad06a66"><div class="row sp" style="gap:8px;flex-wrap:wrap"><div class="small">${ico("heart", "#8ad06a", 16)} <b>Soigner toute la compagnie</b><div class="tiny dim">${parts}</div></div><button class="btn sm ${S.gold >= tot ? "gold" : "ghost off"}" data-a="restoreAll">${fmt(tot)} or</button></div></div>`; }
ACT.restoreAll = () => { const L = restorePlan(), tot = L.reduce((a, x) => a + x.c, 0); if (!L.length) return; if (S.gold < tot) return toast("Pas assez d'or pour tout soigner.", "bad");
  S.gold -= tot; for (const x of L) { if (x.t === "heal") x.h.injured = 0; if (x.t === "calm") { x.h.stress = 0; if (x.h.affl && AFFLICTIONS[x.h.affl].bad) x.h.affl = null; } if (x.t === "curse") x.h.cursed = 0; if (x.t === "pet") delete S.petHurt[x.p]; }
  sfx("holy"); save(); renderHud(); toast(`Toute la compagnie est soignée (${L.length} soin${L.length > 1 ? "s" : ""}).`, "good"); openBuilding("chapelle"); };
{ const ob = openBuilding; openBuilding = function (k) { const r = ob.apply(this, arguments); if (k === "chapelle") try { insertAfterLore(restoreAllHTML()); } catch (e) { } return r; }; }
{ const bn = bldNote; bldNote = function (k) { return bn(k) || (k === "chapelle" && restorePlan().length > 0); }; }

// ── Gardiens déjà vaincus : entrée courte (un bandeau) au lieu de la cinématique, sauf si l'option « Entrées complètes » est cochée ──
{ const bi = bossIntro; bossIntro = function (bs, ov) {
    try { if (!ov && bs && S.beaten && S.beaten[bs.key] && !S.opts.fullIntro) { const I = (typeof BOSS_INFO !== "undefined" && BOSS_INFO[bs.key]) || ["Gardien", ""]; toast(`${ico("crown", "#e8c878", 14)} <b>${esc(bs.name)}</b> — ${esc(I[0])}`); try { sfx("bell"); } catch (e) { } return Promise.resolve(); } } catch (e) { }
    return bi.apply(this, arguments); }; }
{ const oh = SCREENS.options.html; SCREENS.options.html = function () { const s = oh.apply(this, arguments);
    const row = `<label class="row sp"><span>${ico("crown")} Entrées complètes des gardiens <span class="tiny dim">— rejouer la cinématique même contre un gardien déjà vaincu</span></span><input type="checkbox" data-opt="fullIntro" ${S.opts.fullIntro ? "checked" : ""}></label>`;
    const i = s.indexOf('<label class="row sp"><span>' + ico("speed")); return i >= 0 ? s.slice(0, i) + row + s.slice(i) : s; }; }
