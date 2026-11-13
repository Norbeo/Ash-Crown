/* ═══════════ Préparation d'expédition en onglets · déblocages · tutoriel des bâtiments ═══════════ */

// ── déblocages : séries après un premier cycle achevé ──
function seriesOpen() { return (typeof cycleN === "function" && cycleN() >= 1) || !!S.finaleReady || !!S.seriesOpen; }
{ const sh0 = seriesHTML; seriesHTML = E => { if (!UI._xpSpecial) return ""; if (!seriesOpen()) return E.rush || E.daily ? "" : `<div class="row" style="margin-top:6px"><span class="tiny dim">${ico("lock", "#7a6a5a", 13)} Séries d'expéditions automatiques : achevez d'abord un premier cycle (jusqu'au dernier chapitre).</span></div>`; return sh0(E); }; }
{ const lw0 = legendWeekHTML; legendWeekHTML = E => UI._xpSpecial ? lw0(E) : ""; }
{ const sp0 = specialHTML; specialHTML = E => UI._xpSpecial ? sp0(E) : ""; }
{ const L2 = ACT.launch; ACT.launch = (...a) => { if (!S.run && UI.seriesN && !seriesOpen()) UI.seriesN = 0; return L2(...a); }; }

// ── préparation d'expédition : onglets ──
function expePaneTabs(E) {
  const P = ["dest", "team", "pet", "opts", "special"].includes(UI.expePane) ? UI.expePane : (UI.expePane = "dest");
  const R = regionById(E.region) || (E.region === "abime" ? ABYSS : null), hs = E.party.map(heroById).filter(Boolean), avg = hs.length ? Math.round(hs.reduce((a, h) => a + h.lvl, 0) / hs.length) : 0;
  const roles = hs.map(h => CLASSES[h.cls].role), warn = (!roles.includes("soin") ? 1 : 0) + (!roles.includes("tank") ? 1 : 0) + (hs.length < 4 ? 1 : 0);
  const on = [E.night && "Nuit", E.hard && "Hardi", E.setRun && SETS[E.setRun] && "Panoplie", E.special === "raid" && "Raid", E.special === "arena" && "Arène", UI.seriesN && "Série", E.rush && "Boss rush", E.twin && "2e compagnie"].filter(Boolean);
  const tab = (k, n, ic, badge) => `<button class="btn sm ${P === k ? "gold" : "ghost"}" data-a="expePane" data-v="${k}">${ico(ic, P === k ? "#e8c878" : "#9a8c7a", 13)}${n}${badge ? ` <span class="tag" style="padding:0 5px">${badge}</span>` : ""}</button>`;
  return `<div class="panel" style="padding:8px 10px;margin:6px 0 8px"><div class="small"><b class="gold">${esc(R ? R.n : "")}</b>${E.region !== "abime" ? ` · menace ${roman((E.threat || 0) + 1)}` : ` · profondeur ${E.floor || 1}`} · ${hs.length} héros, niv moyen ${avg} · ${esc(petName(E.pet) || "sans compagnon")}${on.length ? ` · <span class="gold">${on.join(", ")}</span>` : ""}${warn ? ` · <span class="bad">${warn} alerte${warn > 1 ? "s" : ""}</span>` : ""}</div></div>
  <div class="row" style="gap:4px;flex-wrap:wrap;margin-bottom:8px">${tab("dest", "Destination", "map")}${tab("team", "Compagnie", "helm", warn || "")}${tab("pet", "Compagnon", "paw")}${tab("opts", "Options", "moon", [E.night, E.hard, E.twin].filter(Boolean).length || "")}${tab("special", "Spécial", "star", [E.setRun, E.special, UI.seriesN, E.rush].filter(Boolean).length || "")}</div>`;
}
ACT.expePane = v => { UI.expePane = v; refresh(); };
// onglet Spécial : légende de la semaine, expédition de panoplie, raid, arène, séries, boss rush
{ const eh0 = SCREENS.expe.html; SCREENS.expe.html = (...a) => { let h = eh0(...a); if (S.run || UI.expePane !== "special") return h; const E = UI.expe;
    UI._xpSpecial = 1; let body = ""; try { body = legendWeekHTML(E) + specialHTML(E) + seriesHTML(E) + `<div style="margin-top:10px">${rushPanelHTML(E)}</div>`; } finally { UI._xpSpecial = 0; }
    const i = h.indexOf('<div class="stickybar">'); return i < 0 ? h : h.slice(0, i) + `<h2 style="margin-top:6px">Expéditions spéciales</h2>${body || '<div class="empty">Rien de spécial pour le moment : les raids, l\'arène et les séries se débloquent en progressant.</div>'}` + h.slice(i); }; }
// le boss rush passe dans l'onglet Spécial
{ const rp0 = rushPanelHTML; rushPanelHTML = E => UI._xpSpecial ? rp0(E) : ""; }

// ── tutoriel des bâtiments : à la première entrée, passable, retrouvable dans les Archives › Guide ──
const GUIDE = {
  porte: { n: "La Porte — expéditions", ic: "map", p: [
    "La Porte mène aux expéditions. Les onglets de la préparation : <b>Destination</b> (chapitre et menace), <b>Compagnie</b> (ordre de marche : le rang 1 est en première ligne), <b>Compagnon</b>, <b>Options</b> (nuit, mode Hardi, formation, seconde compagnie) et <b>Spécial</b> (panoplie, raid, arène, séries, boss rush).",
    "Vaincre le gardien d'un chapitre ouvre le suivant et la menace supérieure (I à V) : ennemis plus forts, meilleur butin.",
    "L'Abîme sans fin s'ouvre après le chapitre 5 ; les séries d'expéditions automatiques après un premier cycle complet." ] },
  taverne: { n: "La Taverne", ic: "tavern", p: [
    "Recrutez de nouveaux héros (la liste se renouvelle) et gérez la caserne : sa capacité grandit avec le niveau du bâtiment.",
    "Les héros stressés s'y apaisent. Les quêtes de classe de la semaine et les contrats donnent éclats et gemmes.",
    "Les légendes — héros rares aux dons uniques — y apparaissent parfois." ] },
  forge: { n: "La Forge", ic: "anvil", p: [
    "<b>Forger</b> : armes et armures du palier choisi (chaque palier demande un niveau de héros). <b>Inventaire</b> : améliorer (+N à l'or), recycler (une partie de l'or investi est rendue), verrouiller 🔒, comparer (appui long sur un objet).",
    "<b>Optimiser l'équipement</b> équipe toute la compagnie ; <b>Tout améliorer</b> dépense un budget d'or ; le <b>recyclage rapide</b> vide l'inventaire par qualité.",
    "Enchantement (effet unique), gravure de panoplie, gemmes (objets Mythiques et mieux) et fusion de trois bibelots : choisissez l'objet par héros, par qualité ou dans l'inventaire. À +15, une arme ou une armure se spécialise." ] },
  chapelle: { n: "La Chapelle", ic: "heal", p: [
    "Soignez les blessures entre deux expéditions et remplissez vos potions.",
    "Purifiez les marques laissées par les gardiens et levez les malédictions." ] },
  academie: { n: "La Salle des maîtres", ic: "book", p: [
    "Montez le rang des compétences de vos héros (le rang maximal dépend du bâtiment et du niveau du héros).",
    "L'arbre du Bastion y donne des bonus permanents : un point par niveau d'aventure." ] },
  menagerie: { n: "La Ménagerie", ic: "paw", p: [
    "Achetez et choisissez le compagnon qui suit la compagnie : il agit seul en combat et peut recevoir un ordre une fois par combat.",
    "Colliers, traits et spécialisations le renforcent ; il évolue au niveau 10. Les compagnons puissants se débloquent en battant les gardiens des chapitres à chaque menace." ] },
  fonderie: { n: "La Fonderie", ic: "gold", p: [
    "Produit de l'or même quand vous ne jouez pas, jusqu'à sa réserve maximale : passez le récolter.",
    "La dîme quotidienne donne des ressources ; le Marché des éclats vend gemmes et cendre." ] },
};
function guideHTML(k, foot) { const G = GUIDE[k]; return `<h2>${ico(G.ic, "#e8c878")} ${G.n}</h2>${G.p.map(t => `<p class="small">${t}</p>`).join("")}${foot || ""}`; }
function guideShow(k, then) { S.guideSeen = S.guideSeen || {}; if (S.opts.noGuide || S.guideSeen[k] || !GUIDE[k]) return false; S.guideSeen[k] = 1; save(); UI.guideThen = then;
  modal(guideHTML(k, `<p class="tiny dim">Ce guide reste disponible dans les Archives › Guide.</p><div class="row" style="justify-content:flex-end;gap:6px;margin-top:10px"><button class="btn ghost" data-a="guideOff">Passer tous les tutoriels</button><button class="btn main" data-a="guideOk">Compris</button></div>`), { onClose: () => { const f = UI.guideThen; UI.guideThen = null; if (f) setTimeout(f, 0); } }); return true; }
ACT.guideOk = () => closeModal();
ACT.guideOff = () => { S.opts.noGuide = 1; save(); closeModal(); toast("Tutoriels désactivés. Retrouvez-les dans les Archives › Guide."); };
{ const ob9 = openBuilding; openBuilding = (k, tab) => { if (guideShow(k, () => ob9(k, tab))) return; return ob9(k, tab); }; }
{ const em0 = SCREENS.expe.mount; SCREENS.expe.mount = (...a) => { const r = em0 && em0(...a); if (!S.run) setTimeout(() => guideShow("porte"), 300); return r; }; }
ACT.guideRead = k => modal(guideHTML(k, `<div class="row" style="justify-content:flex-end;margin-top:10px"><button class="btn" data-a="closeModal">Fermer</button></div>`));
ACT.guideReset = () => { S.guideSeen = {}; S.opts.noGuide = 0; save(); toast("Les tutoriels se rouvriront à la prochaine entrée dans chaque bâtiment."); refresh(); };
function guideCodexHTML() { const seen = S.guideSeen || {};
  return `<p class="small dim">Le rôle de chaque lieu du Bastion. Touchez une fiche pour la relire.</p><div class="grid" style="--min:240px">${Object.entries(GUIDE).map(([k, G]) => `<div class="card" data-a="guideRead" data-v="${k}"><b>${ico(G.ic, "#e8c878", 14)} ${G.n}</b><div class="tiny dim">${seen[k] ? "Lu" : "Pas encore lu"}</div></div>`).join("")}</div><div class="row" style="margin-top:10px"><button class="btn sm ghost" data-a="guideReset">${S.opts.noGuide ? "Réactiver les tutoriels" : "Revoir les tutoriels à la prochaine entrée"}</button></div>`; }
{ const ch3 = SCREENS.codex.html; SCREENS.codex.html = () => { let h = ch3(); const on = UI.codexTab === "guide";
    h = h.replace('<div class="tabs">', `<div class="tabs"><button class="btn sm ${on ? "on" : ""}" data-a="codexTab" data-v="guide">${ico("book")}Guide</button>`);
    if (on) { const i = h.lastIndexOf("</div>"); h = h.slice(0, i) + guideCodexHTML() + h.slice(i); } return h; }; }
