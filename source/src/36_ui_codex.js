/* ═══════════════════════ Archives et options ═══════════════════════ */
function glossaryHTML() {
  const grp = [["Combat", ["resolution", "lueur", "agonie", "ultime", "rage", "intention", "rang", "pv", "protection", "esquive", "precision", "critique", "vitesse", "resistance", "vol_vie", "soins", "alteration"]],
    ["États", ["bleed", "poison", "burn", "stun", "weak", "vuln", "mark", "accDn", "spdDn", "protDn", "dodgeDn", "protUp", "dmgUp", "spdUp", "dodgeUp", "accUp", "critUp", "regen", "shield", "prov", "riposte", "stealth", "guarded", "thorns"]],
    ["Progression", ["trait", "relique", "synergie", "evolution", "apogee", "palier", "rarete", "serment", "compagnon"]],
    ["Ressources", ["or", "eclat", "ferraille", "essence", "cendre", "potion"]]];
  return `<p class="small dim">Touchez un mot souligné n'importe où dans le jeu pour retrouver ces explications.</p>${grp.map(([t, ks]) => `<h3 style="margin-top:14px">${t}</h3><div class="grid" style="--min:260px">${ks.map(k => { const G = GLOSS[k]; return `<div class="card" style="cursor:default"><b class="gold" style="display:flex;align-items:center;gap:6px">${ico(G.ic, (ST_INFO[k] || {}).c || "#e8c878", 18)}${G.n}</b><div class="small" style="margin-top:4px">${G.d}</div></div>`; }).join("")}</div>`).join("")}`;
}
ACT.optDiff = k => { if (S.run) return; S.opts.diff = k; save(); refresh(); toast("Difficulté : " + DIFFS[k].n); };
SCREENS.codex = {
  title: "Les Archives", tab: "codex",
  scene: () => backdrop("catacombes", { dark: .6 }),
  html: () => {
    const tab = UI.codexTab || "classes";
    const T = [["classes", "helm", "Classes"], ["bestiaire", "skull", "Bestiaire"], ["synergies", "link", "Synergies"], ["reliques", "gem", "Reliques"], ["defis", "trophy", "Défis de classe"], ["elites", "skull", "Élites"], ["memorial", "skull", "Mémorial"], ["histoire", "scroll", "Chroniques"], ["succes", "trophy", "Succès"], ["records", "cup", "Registres"], ["glossaire", "book", "Glossaire"]];
    let body = "";
    if (tab === "glossaire") body = glossaryHTML();
    if (tab === "reliques") body = relicsCodexHTML();
    if (tab === "defis") body = classChCodexHTML();
    if (tab === "memorial") body = memorialHTML();
    if (tab === "elites") body = eliteCodexHTML();
    if (tab === "succes") body += hiddenAchHTML();
    if (tab === "classes") body = `<div class="grid" style="--min:280px">${CLASS_IDS.map(k => { const C = CLASSES[k], un = classUnlocked(k); return `<div class="card ${un ? "" : "lock"}" style="cursor:default"><div class="row" style="flex-wrap:nowrap;gap:8px">${canvasSlot("cl:" + k, 90, 112)}<div style="flex:1"><h3 style="margin:0">${C.n} ${un ? "" : ico("lock", "#9a8c7a", 13)}</h3>${roleTag(C.role)}<p class="tiny lore" style="margin:4px 0">${C.lore}</p><div class="tiny">Voies : ${Object.values(C.evos).map(e => `<b class="gold">${e.n}</b>`).join(" ou ")}</div>${un ? "" : `<div class="tiny dim">Débloquée au chapitre ${C.unlock}</div>`}</div></div></div>`; }).join("")}</div>`;
    if (tab === "synergies") body = `<p class="small dim">Certaines classes se complètent. Quand elles partent ensemble en expédition, tout le groupe en profite.</p><div class="grid" style="--min:260px">${Object.keys(SYNERGIES).map(k => { const Y = SYNERGIES[k]; return `<div class="card" style="cursor:default"><h3 style="margin:0">${ico("link", "#e8c878", 15)} ${Y.n}</h3><div class="tiny gold" style="margin:3px 0">${synergyNeedText(Y)}</div><p class="small" style="margin:0">${gl(Y.d)}</p></div>`; }).join("")}</div>`;
    if (tab === "bestiaire") body = bestiaryHTML();
    if (tab === "histoire") body = `<div class="panel" style="padding:14px"><h3>Prologue</h3>${STORY.intro.map(l => `<p class="lore">${l}</p>`).join("")}${REGIONS.map(r => S.prog[r.id] && S.prog[r.id].clears ? `<div class="sep"></div><h3>${r.sub} — ${r.n}</h3><p class="lore">${STORY[r.id]}</p>` : `<div class="sep"></div><h3 class="dim">${r.sub} — ???</h3>`).join("")}</div>`;
    if (tab === "succes") body = `<p class="small dim">${Object.keys(S.ach).length}/${ACHIEVEMENTS.length} succès.</p><div class="grid" style="--min:240px">${ACHIEVEMENTS.map(a => { const done = S.ach[a.id], p = Math.min(a.v, S.stats[a.k] || 0); return `<div class="card ${done ? "sel" : ""}" style="cursor:default"><div class="row" style="flex-wrap:nowrap">${ico("trophy", done ? "#e8c878" : "#5a4a3a", 28)}<div style="flex:1"><b>${a.n}</b><div class="tiny">${a.d}</div>${done ? '<div class="tiny good">Accompli</div>' : `<div class="bar xp" style="margin-top:3px"><i style="width:${100 * p / a.v}%"></i></div>`}<div class="tiny dim">${a.gold ? a.gold + " or" : ""}${a.shards ? a.shards + " éclats" : ""}</div></div></div></div>`; }).join("")}</div>`;
    if (tab === "records") { const s = S.stats; body = `<div class="panel" style="padding:14px"><div class="statgrid"><div>Expéditions <b>${s.runs}</b></div><div>Victoires en combat <b>${s.wins}</b></div><div>Ennemis tués <b>${fmt(s.kills)}</b></div><div>Gardiens vaincus <b>${REGIONS.reduce((a, r) => a + (s["boss_" + r.id] || 0), 0)}</b></div><div>Record de l'Abîme <b>${S.abyss.best}</b></div><div>Évolutions <b>${s.evos}</b></div><div>Objets forgés <b>${s.crafts}</b></div><div>Expéditions du jour <b>${s.daily}</b></div><div>Mode <b>${S.opts.hardcore ? "Hardi" : "Normal"}</b></div></div>${S.graves && S.graves.length ? `<div class="sep"></div><h3>${ico("skull", "#c8b8a0", 16)} Le cimetière</h3>${S.graves.slice(-20).reverse().map(g => `<div class="small">${esc(g.name)} — ${CLASSES[g.cls].n}, niveau ${g.lvl}</div>`).join("")}` : ""}</div>`; }
    if (tab === "records") body += seasonRecordsHTML();
    if (tab === "histoire") body = `<h2>Dialogues</h2>${scenesCodexHTML()}<h2 style="margin-top:14px">Chroniques</h2>` + body;
    return `<div class="wrap"><h1>Les Archives</h1><div class="tabs">${T.map(([k, ic, n]) => `<button class="btn sm ${tab === k ? "on" : ""}" data-a="codexTab" data-v="${k}">${ico(ic)}${n}</button>`).join("")}</div>${body}</div>`;
  },
  mount: () => fillCanvases($("#view"), (c, id) => { const [k, v] = id.split(":"); if (k === "cl") { const x = c.getContext("2d"); const sp = heroSprite({ cls: v, tier: 3, wtier: 3, skin: SKINS[2], hair: 2, hairCol: HAIRCOL[2], beard: 0, female: ["pretresse", "sorciere", "ombre", "arbaletriere", "chasseur_sorcieres"].includes(v) }, {}, 0, c.width / 230 * 1.2); x.drawImage(sp, c.width / 2 - sp.ax, c.height - 4 - sp.ay); } if (k === "mo") paintMon(c, v); }),
};
ACT.codexTab = v => { UI.codexTab = v; refresh(); };
SCREENS.options = {
  title: "Options", tab: "options",
  scene: () => backdrop("bastion", { dark: .6 }),
  html: () => `<div class="wrap" style="max-width:640px"><h1>Options</h1><div class="panel" style="padding:14px"><div class="col">
    <label class="row sp"><span>${ico("sound")} Effets sonores</span><input type="checkbox" data-opt="sound" ${S.opts.sound ? "checked" : ""}></label>
    <label class="row sp"><span>${ico("music")} Musique</span><input type="checkbox" data-opt="music" ${S.opts.music ? "checked" : ""}></label>
    <div class="row sp"><span>${ico("speed")} Vitesse des combats</span><span>${[1, 2, 3].map(v => `<button class="btn sm ${S.opts.speed === v ? "gold" : "ghost"}" data-a="optSpeed" data-v="${v}">×${v}</button>`).join(" ")}</span></div>
    <div class="row sp"><span>${ico("skull")} Difficulté</span><span>${Object.keys(DIFFS).map(k => `<button class="btn sm ${S.opts.diff === k ? "gold" : "ghost"}" data-a="optDiff" data-v="${k}" ${S.run ? "disabled" : ""}>${DIFFS[k].n}</button>`).join(" ")}</span></div>${S.run ? '<div class="tiny dim" style="text-align:right">Changeable entre deux expéditions.</div>' : ""}
    <label class="row sp"><span>${ico("eye")} Mode apaisé <span class="tiny dim">— sans tremblement ni éclair d'écran</span></span><input type="checkbox" data-opt="calm" ${S.opts.calm ? "checked" : ""}></label>
    <div class="small" style="margin-top:6px"><b>Combat : panneaux affichés</b></div>${[["ord", "Ordre de passage"], ["log", "Mini-journal"], ["mor", "Résolution et tour"]].map(([k, n]) => `<label class="row sp"><span>${n}</span><input type="checkbox" data-a="hudOpt" data-v="${k}" ${hud(k) ? "checked" : ""}></label>`).join("")}
    <label class="row sp"><span>${ico("speed")} Animations rapides <span class="tiny dim">— enchaîne les actions plus vite</span></span><input type="checkbox" data-opt="quick" ${S.opts.quick ? "checked" : ""}></label>
    <label class="row sp"><span>${ico("run")} Partie rapide <span class="tiny dim">— combats en vitesse ×3 et animations rapides (idéal sur téléphone)</span></span><input type="checkbox" data-opt="fast" ${S.opts.fast ? "checked" : ""}></label>
    <label class="row sp"><span>${ico("star")} Mode auto économe <span class="tiny dim">— en automatique, garde les ultimes pour les élites, les gardiens et les coups durs</span></span><input type="checkbox" data-opt="smartUlt" ${S.opts.smartUlt !== 0 ? "checked" : ""}></label>
    <label class="row sp"><span>${ico("info")} Astuces <span class="tiny dim">— explique une mécanique la première fois qu'elle apparaît</span></span><input type="checkbox" data-opt="hintsOn" ${!S.opts.noHints ? "checked" : ""}></label>
    <div class="row sp"><span>${ico("skull")} Mode</span><span class="gold">${S.opts.hardcore ? "Hardi (mort définitive)" : "Normal"}</span></div>
    <div class="sep"></div>
    <div class="row">${PWA.standalone ? `<span class="tag good">Appli installée</span>` : `<button class="btn" data-a="install">${ico("install")}Installer sur l'appareil</button>`}<button class="btn ghost" data-a="exportSave">${ico("scroll")}Exporter la sauvegarde</button><button class="btn ghost" data-a="importSave">Importer</button></div>
    <div class="sep"></div><button class="btn ghost" data-a="toTitle">Écran-titre</button><button class="btn ghost" style="color:var(--bad)" data-a="wipeSave">Effacer la partie</button>
  </div></div><p class="tiny dim" style="text-align:center;margin-top:10px">Couronne de Cendres · RPG tactique dark fantasy · sauvegarde locale automatique</p></div>`,
  mount: () => document.querySelectorAll("[data-opt]").forEach(i => i.onchange = () => { S.opts[i.dataset.opt] = i.checked ? 1 : 0; if (i.dataset.opt === "hintsOn") S.opts.noHints = i.checked ? 0 : 1; if (i.dataset.opt === "sound") ambVolume(); if (i.dataset.opt === "music") musicMute(i.checked); save(); }),
};
ACT.optSpeed = v => { S.opts.speed = +v; save(); refresh(); };
ACT.toTitle = () => { save(); go("title"); };
ACT.wipeSave = () => confirmBox("Effacer définitivement votre partie ?", () => { try { localStorage.removeItem(SAVE_KEY); } catch (e) { } S = null; go("title"); }, { yes: "Effacer" });
ACT.exportSave = () => { const s = btoa(unescape(encodeURIComponent(JSON.stringify(S)))); modal(`<h2>Sauvegarde</h2><p class="small">Copiez ce texte pour le garder ou le transférer sur un autre appareil.</p><textarea style="width:100%;height:140px;background:#000;color:#c8b8a0;border:1px solid #3a2a22" readonly onclick="this.select()">${s}</textarea>`); };
ACT.importSave = () => { modal(`<h2>Importer</h2><textarea id="imp" style="width:100%;height:140px;background:#000;color:#c8b8a0;border:1px solid #3a2a22"></textarea><div class="row" style="justify-content:flex-end;margin-top:8px"><button class="btn main" id="impgo">Charger</button></div>`, { mount: m => m.querySelector("#impgo").onclick = () => { try { const s = JSON.parse(decodeURIComponent(escape(atob(m.querySelector("#imp").value.trim())))); S = migrate(s); save(); closeModal(); go("bastion"); toast("Sauvegarde chargée.", "good"); } catch (e) { toast("Texte invalide.", "bad"); } } }); };
