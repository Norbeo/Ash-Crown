/* Objectifs : la liste des prochaines étapes utiles (histoire, menace, évolution, bâtiments, passe, compagnons), bouton « Objectifs » du Bastion. */
function goalsList() {
  const G = [], regs = REGIONS.filter(r => r.id !== "abime");
  const avg = (() => { const H = S.heroes.slice().sort((a, b) => b.lvl - a.lvl).slice(0, 4); return H.length ? Math.round(H.reduce((a, h) => a + h.lvl, 0) / H.length) : 1; })();
  const next = regs.find(r => regionUnlocked(r.id) && !(S.prog[r.id] && S.prog[r.id].clears));
  if (next) { const rl = recLevel(next.id, 0); G.push({ ic: "crown", col: "#e8c878", t: `Vaincre le gardien ${deNom(next.n)}`, d: `${next.sub} · niveau conseillé ${rl}${avg < rl ? ` — vos 4 meilleurs héros sont niveau ${avg} en moyenne` : " ✓"}`, a: "goalGo", v: next.id, p: 100 }); }
  const cleared = regs.filter(r => S.prog[r.id] && S.prog[r.id].clears);
  for (const r of cleared.slice(-2).reverse()) { const tm = threatMax(r.id); if (tm >= 4 && (S.prog[r.id].threat || 0) >= 4) continue; const t = Math.min(4, tm); const rl = recLevel(r.id, t);
    G.push({ ic: "skull", col: "#e07060", t: `${r.n} : menace ${roman(t + 1)}`, d: `Vaincre le gardien à cette menace débloque la suivante (et un compagnon). Niveau conseillé ${rl}.`, a: "goalGo", v: r.id + ":" + t, p: 80 }); }
  const evo = S.heroes.filter(h => h.lvl >= EVO_LVL && !h.evo);
  if (evo.length) G.push({ ic: "up", col: "#9ad0ff", t: `Faire évoluer ${evo.length > 1 ? evo.length + " héros" : esc(evo[0].name)}`, d: "Niveau d'évolution atteint : choisissez une voie à la Salle des maîtres.", a: "goalBld", v: "academie", p: 95 });
  const up = Object.keys(BUILDINGS).filter(k => { const c = bldCost(k); return c && canPay(c) && bldAdvOk(k); });
  if (up.length) G.push({ ic: "anvil", col: "#ffb848", t: `Améliorer ${up.length > 1 ? up.length + " bâtiments" : bldName(up[0])}`, d: up.map(k => bldName(k)).join(", ") + " — l'or nécessaire est en caisse.", a: "goalBld", v: up[0], p: 70 });
  const hurt = S.heroes.filter(h => typeof isInjured === "function" && isInjured(h));
  if (hurt.length) G.push({ ic: "heart", col: "#e07060", t: `Soigner ${hurt.length} héros blessé${hurt.length > 1 ? "s" : ""}`, d: "La Chapelle remet vos héros sur pied.", a: "goalBld", v: "chapelle", p: 60 });
  if (typeof carnetBadge === "function" && carnetBadge()) G.push({ ic: "book", col: "#e8c878", t: "Récompenses à récupérer", d: "Connexion, passe de saison ou commandes : le Carnet a quelque chose pour vous.", a: "carnet", v: "", p: 90 });
  if (S.heroes.length < 4) G.push({ ic: "helm", col: "#c8b890", t: "Recruter des héros", d: "Une compagnie complète compte quatre héros.", a: "goalBld", v: "taverne", p: 99 });
  const free = S.inv.filter(it => typeof itemUseful === "function" && S.heroes.some(h => canEquip(h, it)) && it.rar >= 4).length;
  if (free >= 3) G.push({ ic: "chest", col: "#c090ff", t: `${free} objets Légendaires ou mieux dans l'inventaire`, d: "« Optimiser l'équipement » à la Forge les répartit au mieux.", a: "goalBld", v: "forge", p: 50 });
  return G.sort((a, b) => b.p - a.p);
}
ACT.goals = () => {
  const G = goalsList();
  modal(`<h2>${ico("star", "#e8c878")} Objectifs</h2><p class="tiny dim">Les prochaines étapes utiles, de la plus importante à la moins pressée.</p>
    <div class="col">${G.map(g => `<div class="row card" style="gap:10px;cursor:pointer" data-a="${g.a}" data-v="${g.v}">${ico(g.ic, g.col, 22)}<div style="flex:1;min-width:0"><b class="small">${g.t}</b><div class="tiny dim">${g.d}</div></div><span class="gold">›</span></div>`).join("") || `<div class="empty">Rien d'urgent. L'Abîme vous attend.</div>`}</div>`);
};
ACT.goalBld = k => { closeModal(); if (UI.screen !== "bastion") go("bastion"); openBuilding(k, k === "taverne" ? "rec" : undefined); };
ACT.goalGo = v => { closeModal(); const [r, t] = String(v).split(":"); UI.expe = UI.expe || {}; try { UI.expePane = "dest"; go("expe"); if (typeof ACT.pickReg === "function") ACT.pickReg(r); if (t != null && typeof ACT.threat === "function") ACT.threat(+t); } catch (e) { go("expe"); } };
{ const hr = hubRailHTML; hubRailHTML = function () { const n = goalsList().filter(g => g.p >= 80).length; return hr.apply(this, arguments).replace(/<\/div>\s*$/, `<button class="hrail" data-a="goals" title="Objectifs">${ico("star", "#e8c878", 22)}<span>Objectifs</span>${n ? `<i>${n}</i>` : ""}</button></div>`); }; }
