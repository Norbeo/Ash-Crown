// ── La Porte en 3 onglets (21 nov.) : Carte (carte + niveau + menaces), Compagnie (4 héros + compagnon), Options (tout le reste, replié)
const XP3 = { dest: "map", team: "team", pet: "team", opts: "opts", special: "opts" };
function xpCur() { return ["map", "team", "opts"].includes(UI.xp3) ? UI.xp3 : (UI.xp3 = "map"); }
ACT.expePane = v => { UI.xp3 = XP3[v] || v; UI.expePane = v; refresh(); };
ACT.xp3 = v => { UI.xp3 = v; refresh(); };
// morceau de l'ancien écran pour un volet donné (entre les onglets et la barre de départ)
function xpSlice(old, pane, noMap) { const P0 = UI.expePane, T0 = expePaneTabs, W0 = worldMapHTML; let h = "";
  try { UI.expePane = pane; expePaneTabs = () => "<!--XPT-->"; if (noMap) worldMapHTML = () => ""; h = old(); } finally { UI.expePane = P0; expePaneTabs = T0; worldMapHTML = W0; }
  const a = h.indexOf("<!--XPT-->"), b = h.lastIndexOf('<div class="stickybar">'); return { top: a > 0 ? h.slice(h.indexOf("</h1>") + 5, a) : "", body: a >= 0 && b > a ? h.slice(a + 10, b) : "", bar: b >= 0 ? h.slice(b, h.lastIndexOf("</div>")) : "" }; }
function xpFold(k, title, ic, html) { if (!html || !html.replace(/<[^>]*>|\s/g, "")) return ""; UI.xpOpen = UI.xpOpen || {};
  return `<details class="xpfold" data-k="${k}" ${UI.xpOpen[k] ? "open" : ""}><summary>${ico(ic, "#e8c878", 15)}<b>${title}</b><span class="atchev">▸</span></summary><div class="xpin">${html}</div></details>`; }
function xpLevelHTML(E) { if (E.region === "abime") return "";
  const hs = E.party.map(heroById).filter(Boolean), avg = hs.length ? Math.round(hs.reduce((a, h) => a + h.lvl, 0) / hs.length) : 0, rec = typeof recLevel === "function" ? recLevel(E.region, E.threat) : null, R = regionById(E.region), tm = threatMax(E.region), cleared = S.prog[E.region] && S.prog[E.region].clears;
  return `<div class="xplvl panel"><div class="row sp" style="align-items:baseline"><b class="gold" style="font-family:var(--f-head);font-size:18px">${esc(R.n)}</b><span class="small">Niveau conseillé <b class="${rec && avg < rec ? "bad" : "good"}">${rec || R.lvl}</b> · votre compagnie <b>${avg}</b></span></div>
    ${cleared && !E.daily ? `<div class="row xpthr">${[0, 1, 2, 3, 4].map(t => { const ok = t <= tm; return `<button class="btn sm ${E.threat === t ? "gold" : "ghost"} ${ok ? "" : "off"}" data-a="threat" data-v="${t}">${ok ? "" : ico("lock", "#9a8c7a", 12)}${THREAT_N[t]}</button>`; }).join("")}</div><div class="tiny dim" style="text-align:center">Menace ${THREAT_N[E.threat || 0]} : ennemis +${(E.threat || 0) * 2} niveaux, récompenses +${(E.threat || 0) * 30} %</div>` : `<div class="tiny dim" style="text-align:center;margin-top:4px">Les menaces s'ouvrent après la première victoire sur le gardien.</div>`}</div>`; }
const XP_ARR = `<svg viewBox="0 0 24 24" width="18" height="18"><path d="M16 3 L5 12 L16 21 Z" fill="#e8c878" stroke="#3a2410" stroke-width="2" stroke-linejoin="round"/><path d="M14 7 L8 12 L14 17" fill="none" stroke="#fff2c8" stroke-width="1.2" opacity=".7"/></svg>`;
function xpPartyHTML(E) {
  const arrow = (i, d, dis) => `<button class="xparr ${d > 0 ? "l" : "r"}" data-a="mvParty" data-v="${i}:${d}" ${dis ? "disabled" : ""} title="${d > 0 ? "Reculer" : "Avancer"}">${XP_ARR}</button>`;
  return `<div class="partyrow xpparty">${[3, 2, 1, 0].map(i => { const h = heroById(E.party[i]);
    return `<div class="card xpcard" data-a="${h ? "xpHero" : "xpPick"}" data-v="${h ? h.id : i}"><div class="tiny gold">Rang ${i + 1}</div>${h ? canvasSlot("pt:" + h.id, 112, 140) + `<div class="xpn">${esc(h.name.split(" ")[0])}</div><div class="tiny dim">${CLASSES[h.cls].n} · ${h.lvl}</div>${isInjured(h) ? '<div class="tiny bad">Blessé</div>' : ""}<div class="row xparrs">${arrow(i, 1, i >= 3 || !E.party[i + 1])}${arrow(i, -1, i <= 0)}</div>` : `<div class="xpempty">${ico("plus", "#8a7a6a", 26)}<div class="tiny dim">Ajouter</div></div>`}</div>`; }).join("")}</div>`; }
function xpPetHTML(E) { const id = E.pet && S.pets.owned.includes(E.pet) ? E.pet : null;
  return `<div class="card xppet" data-a="xpPet">${id ? canvasSlot("pe:" + id, 90, 64) : ico("paw", "#8a7a6a", 30)}<div style="flex:1;min-width:0"><div class="tiny gold">Compagnon</div><b>${id ? esc(petName(id)) : "Aucun"}</b>${id ? ` <span class="tiny dim">niv ${petLvl(id)}</span>` : ""}</div><span class="btn sm ghost">Changer</span></div>`; }
function xpWarn(E) { const roles = E.party.map(id => CLASSES[heroById(id).cls].role); const w = [!roles.includes("tank") && "aucun tank", !roles.includes("soin") && "aucun soigneur", E.party.length < 4 && "moins de 4 héros"].filter(Boolean); return w.length ? `<div class="small bad" style="text-align:center;margin:4px 0">${ico("skull", "#e05050", 13)} ${w.join(" · ")}</div>` : ""; }
{ const old = SCREENS.expe.html; SCREENS.expe.html = function () { if (S.run) return old.apply(this, arguments);
    const cur = xpCur(), base = xpSlice(old, "dest", cur !== "map"), E = UI.expe;
    const tab = (k, n, ic) => `<button class="btn sm ${cur === k ? "gold" : "ghost"}" data-a="xp3" data-v="${k}">${ico(ic, cur === k ? "#e8c878" : "#9a8c7a", 14)}${n}</button>`;
    let body = "";
    if (cur === "map") { const wm = typeof worldMapHTML === "function" ? worldMapHTML(E, [...REGIONS, ABYSS]) : "";
      body = xpLevelHTML(E) + wm + (E.region === "abime" ? xpFold("abyss", "Abîme : départ et serments", "skull", seasonPanelHTML() + abyssOpts(E)) : ""); }
    else if (cur === "team") body = `<div class="row" style="justify-content:center;gap:6px;flex-wrap:wrap;margin:2px 0 8px"><button class="btn sm ghost" data-a="autoParty">${ico("auto")}Composition auto</button><button class="btn sm ghost" data-a="expeGear">${ico("anvil")}Optimiser l'équipement</button></div>${xpPartyHTML(E)}${xpWarn(E)}${xpPetHTML(E)}<p class="tiny dim" style="text-align:center;margin-top:8px">Touchez un héros pour le remplacer ; les flèches changent son rang (rang 1 = première ligne).</p>`;
    else { const o = xpSlice(old, "opts", true).body, sp = xpSlice(old, "special", true).body;
      let ex = base.body.replace(/<h2>Destination[\s\S]*?<\/h2>/, "").replace(/<div class="row" style="margin-top:8px"><span class="small">Menace :<\/span>[\s\S]*?<\/span><\/div>/, "");
      if (E.region === "abime") { const k = ex.indexOf('<div class="panel" style="padding:10px;margin-top:8px'); if (k >= 0) ex = ex.slice(0, k); }
      const grp = synergyHTML(E.party.map(id => heroById(id).cls), S.heroes.filter(h => !E.party.includes(h.id)).map(h => h.cls)) + teamsHTML(E) + duoHTML(E) + (typeof counterHTML === "function" ? counterHTML(E) : "");
      body = xpFold("rules", "Règles de l'expédition", "moon", o) + xpFold("ev", "Défis, invasions et observatoire", "star", ex) + xpFold("team", "Synergies, équipes et conseil", "banner", grp) + xpFold("sp", "Expéditions spéciales", "trophy", sp); }
    return `<div class="wrap xp3"><div class="row xptabs">${tab("map", "Carte", "map")}${tab("team", "Compagnie", "helm")}${tab("opts", "Options", "gear")}</div>${base.top}${body}${base.bar}</div>`; }; }
// remplacer un héros : fenêtre de choix par rôle
ACT.xpHero = id => xpPickHero(UI.expe.party.indexOf(id));
ACT.xpPick = () => xpPickHero(-1);
function xpPickHero(slot) { const E = UI.expe; UI.xpSlot = slot; const r = UI.xpRole || "all"; const roles = [["all", "Tous"], ["tank", "Tanks"], ["soin", "Soigneurs"], ["soutien", "Soutiens"], ["dps", "Dégâts"]];
  const L = S.heroes.filter(h => !E.party.includes(h.id) && (r === "all" || CLASSES[h.cls].role === r)).sort((a, b) => b.lvl - a.lvl);
  modal(`<h2>${ico("helm", "#e8c878")} ${slot >= 0 ? "Remplacer " + esc(heroById(E.party[slot]).name.split(" ")[0]) : "Ajouter un héros"}</h2><div class="row chips" style="gap:4px;flex-wrap:wrap">${roles.map(([k, n]) => `<button class="btn sm ${r === k ? "gold" : "ghost"}" data-a="xpRole" data-v="${k}">${n}</button>`).join("")}</div>
  <div class="grid" style="--min:150px;margin-top:8px">${L.map(h => `<div class="card" style="padding:4px 8px" data-a="xpSwap" data-v="${h.id}"><div class="row" style="gap:6px;flex-wrap:nowrap">${canvasSlot("ro:" + h.id, 44, 44)}<div class="tiny"><b>${esc(h.name.split(" ")[0])}</b><br><span class="dim">${CLASSES[h.cls].n} ${h.lvl}${isInjured(h) ? ' · <span class="bad">blessé</span>' : ""}</span></div></div></div>`).join("") || '<p class="tiny dim">Aucun héros disponible.</p>'}</div>
  ${slot >= 0 ? `<button class="btn ghost" style="width:100%;margin-top:10px" data-a="xpRemove">Retirer de la compagnie</button>` : ""}`);
  fillCanvases($("#modal"), (c, id) => { const [k, v] = id.split(":"); if (k === "ro") paintHero(c, heroById(v)); }); }
ACT.xpRole = k => { UI.xpRole = k; xpPickHero(UI.xpSlot); };
ACT.xpSwap = id => { const E = UI.expe, s = UI.xpSlot; if (s >= 0) E.party[s] = id; else { if (E.party.length >= 4) return toast("4 héros au maximum.", "bad"); E.party.push(id); E.party.sort((a, b) => CLASSES[heroById(a).cls].rk[0] - CLASSES[heroById(b).cls].rk[0]); } closeModal(); refresh(); };
ACT.xpRemove = () => { const s = UI.xpSlot; if (s >= 0) UI.expe.party.splice(s, 1); closeModal(); refresh(); };
ACT.xpPet = () => { const E = UI.expe, r = UI.xpPetRole || "all", roles = [["all", "Tous"], ["tank", "Tanks"], ["soin", "Soigneurs"], ["soutien", "Soutiens"], ["dps", "Dégâts"]];
  const L = S.pets.owned.filter(id => PETS[id] && (r === "all" || PETS[id].role === r));
  modal(`<h2>${ico("paw", "#e8c878")} Compagnon</h2><div class="row chips" style="gap:4px;flex-wrap:wrap">${roles.map(([k, n]) => `<button class="btn sm ${r === k ? "gold" : "ghost"}" data-a="xpPetRole" data-v="${k}">${n}</button>`).join("")}</div>
  <div class="grid" style="--min:120px;margin-top:8px">${L.map(id => `<div class="card ${E.pet === id ? "sel" : ""}" style="padding:4px;text-align:center" data-a="xpPetGo" data-v="${id}">${canvasSlot("pe:" + id, 90, 64)}<div class="tiny"><b>${esc(petName(id))}</b> · ${petLvl(id)}</div></div>`).join("")}</div>`);
  fillCanvases($("#modal"), (c, id) => { const [k, v] = id.split(":"); if (k === "pe") paintPet(c, v, petEvolved(v)); }); };
ACT.xpPetRole = k => { UI.xpPetRole = k; ACT.xpPet(); };
ACT.xpPetGo = id => { closeModal(); ACT.pickPet(id); };
// mémoriser les volets ouverts
if (HASWIN) document.addEventListener("toggle", e => { const d = e.target; if (d && d.classList && d.classList.contains("xpfold")) { UI.xpOpen = UI.xpOpen || {}; UI.xpOpen[d.dataset.k] = d.open; } }, true);
