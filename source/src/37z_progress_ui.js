// ── Interface : enchantement, panoplies, ascension, compagnons (collier, trait) ──
function allGear() { const out = []; for (const it of S.inv) out.push({ it, h: null }); for (const h of S.heroes) for (const k of ["wpn", "arm"]) if (h.gear[k]) out.push({ it: h.gear[k], h }); return out; }
function enchantBarHTML() {
  const n = allGear().filter(g => g.it.rar >= 3).length;
  return `<div class="row sp card" style="cursor:default;margin-bottom:8px;border-color:#9ad0ff55"><span class="small">${ico("gem", "#9ad0ff", 16)} <b>Enchantement</b> <span class="tiny dim">— changez l'effet unique (✦) d'une arme ou armure Épique ou mieux : trois effets proposés, vous choisissez.</span></span><button class="btn sm" data-a="enchantList" ${n ? "" : "disabled"}>Enchanter (${n})</button></div>`;
}
ACT.enchantList = () => {
  const L = allGear().filter(g => g.it.rar >= 3).sort((a, b) => b.it.rar - a.it.rar || b.it.tier - a.it.tier);
  modal(`<h2>${ico("gem", "#9ad0ff")} Enchantement</h2><p class="tiny dim">Éclats : <b>${S.shards || 0}</b> · Or : <b>${fmt(S.gold)}</b></p><div class="col">${L.map(({ it, h }) => { const c = enchantCost(it); return `<div class="row card" style="cursor:default;gap:10px">${slotHTML(it, "itemInfo", it.id)}<div style="flex:1;min-width:150px"><b class="rar${it.rar}">${gearName(it)}</b> <span class="tiny dim">${h ? "porté par " + esc(h.name) : "inventaire"}</span><div class="tiny">${it.mod && ITEM_MODS[it.mod] ? `✦ ${ITEM_MODS[it.mod].n} — ${ITEM_MODS[it.mod].d}` : "Aucun effet unique"}</div></div><button class="btn sm" data-a="enchant" data-v="${it.id}">${fmt(c.gold)} or · ${c.shards} ${ico("gem", "#9ad0ff", 12)}</button></div>`; }).join("") || '<div class="empty">Aucun objet Épique ou mieux.</div>'}</div>`, { wide: 1, onClose: () => openBuilding("forge") });
};
ACT.enchant = id => {
  const it = findItem(id) || allGear().map(g => g.it).find(x => x.id === id); if (!it || it.rar < 3 || it.kind === "tr") return;
  const c = enchantCost(it); if (S.gold < c.gold || (S.shards || 0) < c.shards) return toast(`Il faut ${fmt(c.gold)} or et ${c.shards} éclats.`, "bad");
  S.gold -= c.gold; S.shards -= c.shards; UI.ench = { id, ch: enchantChoices(it) }; save(); renderHud(); sfx("forge");
  modal(`<h2>${ico("gem", "#9ad0ff")} ${gearName(it)}</h2><p class="small">Les runes s'éveillent. Choisissez l'effet qui restera gravé${it.mod ? " — ou gardez l'actuel" : ""}.</p><div class="col">${UI.ench.ch.map(k => `<button class="choice" data-a="enchantDo" data-v="${k}"><b style="color:#ffb848">✦ ${ITEM_MODS[k].n}</b><div class="tiny">${ITEM_MODS[k].d}</div></button>`).join("")}${it.mod && ITEM_MODS[it.mod] ? `<button class="choice" data-a="enchantDo" data-v="keep"><b>Garder ✦ ${ITEM_MODS[it.mod].n}</b><div class="tiny dim">${ITEM_MODS[it.mod].d}</div></button>` : ""}</div>`, { onClose: () => { UI.ench = null; } });
};
ACT.enchantDo = k => {
  const E = UI.ench; if (!E) return; const it = findItem(E.id) || allGear().map(g => g.it).find(x => x.id === E.id); if (!it) return;
  if (k !== "keep" && E.ch.includes(k)) it.mod = k; UI.ench = null; save(); closeModal(); toast(`${ico("gem", "#9ad0ff", 14)} ${gearName(it)} : ✦ ${ITEM_MODS[it.mod] ? ITEM_MODS[it.mod].n : "—"}`, "good"); openBuilding("forge");
};
// fiche du héros : panoplies actives et ascension
function heroProgressHTML(h) {
  if (!S || !h || !h.gear) return ""; // nouvelle aventure : pas encore de partie
  let out = ""; const n = setCount(h);
  for (const k in n) { const T = SETS[k]; out += `<div class="tiny" style="margin:2px 0"><b style="color:${T.c}">❖ ${T.n}</b> ${n[k]}/3 — <span class="${n[k] >= 2 ? "good" : "dim"}">2 : ${T.b2.d}</span> · <span class="${n[k] >= 3 ? "good" : "dim"}">3 : ${T.b3.d}</span></div>`; }
  if (h.asc) out += `<div class="tiny" style="color:${ASC_COL[(h.asc - 1) % ASC_COL.length]}">✦ Ascension ${roman(h.asc)} : +${6 * h.asc} % de dégâts et de PV, +${4 * h.asc} résistance.</div>`;
  if (S.heroes.includes(h)) out += canAscend(h) ? `<button class="btn sm gold" style="margin:4px 0" data-a="ascend" data-v="${h.id}">✦ Ascension : renaître au niveau ${ASC_BACK}</button>` : h.lvl >= 20 ? `<div class="tiny dim">✦ Ascension possible au niveau ${ASC_LVL} pour un héros évolué.</div>` : "";
  return out;
}
ACT.ascend = id => {
  const h = heroById(id); if (!canAscend(h)) return;
  confirmBox(`<b>${esc(h.name)}</b> renaît au niveau ${ASC_BACK}. Il garde sa voie, ses compétences et son équipement (s'il a encore le niveau requis pour en changer), et gagne pour toujours +6 % de dégâts et de PV, +4 résistance.`, () => { ascend(h); save(); sfx("holy"); toast(`✦ ${esc(h.name)} atteint l'Ascension ${roman(h.asc)} !`, "good"); heroSheet(h); }, { yes: "Renaître" });
};
// fiche du compagnon : trait et collier
function petProgressHTML(id) {
  if (!S || !S.pets) return "";
  const owned = S.pets.owned.includes(id), t = owned ? petTrait(id) : null, c = petCollar(id), cost = collarCost(id);
  return `<div class="row sp card" style="cursor:default;margin-top:8px;gap:8px">${t ? `<div class="tiny">${ico("paw", "#e8c878", 12)} Trait : <b>${PET_TRAITS[t].n}</b> — ${PET_TRAITS[t].d}</div>` : `<div class="tiny dim">Trait tiré au hasard à son arrivée.</div>`}
    <div class="tiny">${ico("ring", "#e8c878", 12)} Collier : <b>${c}/${COLLAR_MAX}</b> <span class="dim">(+${8 * c} % dégâts, +${6 * c} % soins et bonus)</span></div>
    ${owned && c < COLLAR_MAX ? `<button class="btn sm" data-a="collarUp" data-v="${id}">Renforcer · ${fmt(cost.gold)} or${cost.shards ? " · " + cost.shards + " éclats" : ""}</button>` : ""}</div>`;
}
ACT.collarUp = id => {
  if (!S.pets.owned.includes(id) || petCollar(id) >= COLLAR_MAX) return; const c = collarCost(id);
  if (S.gold < c.gold || (S.shards || 0) < c.shards) return toast(`Il faut ${fmt(c.gold)} or${c.shards ? " et " + c.shards + " éclats" : ""}.`, "bad");
  S.gold -= c.gold; S.shards -= c.shards; S.petCollar = S.petCollar || {}; S.petCollar[id] = petCollar(id) + 1; save(); renderHud(); sfx("forge"); toast(`${petName(id)} : collier ${S.petCollar[id]}/${COLLAR_MAX}`, "good"); petSheet(id);
};
// Archives (Atlas) : gardiens secrets, avec un indice tant qu'ils n'ont pas été vaincus
function secretBossesHTML() {
  return `<h3 style="margin-top:14px">${ico("skull", "#c08aff", 15)} Gardiens secrets</h3><p class="tiny dim">Certains gardiens ne se montrent que si l'on remplit d'étranges conditions. Ils laissent un objet unique.</p><div class="col">${Object.keys(SECRET_BOSSES).map(k => { const D = SECRET_BOSSES[k], won = (S.beaten || {})[k], seen = S.seen.monsters[k] != null;
    return `<div class="row card" style="cursor:${seen ? "pointer" : "default"};gap:10px" ${seen ? `data-a="monSheet" data-v="${k}"` : ""}>${ico(won ? "trophy" : seen ? "eye" : "lock", won ? "#e8c878" : "#8a7a6a", 20)}<div style="flex:1"><b style="color:${seen ? D.hue : "#8a7a6a"}">${seen ? esc(D.n) : "???"}</b>${won ? ' <span class="tag gold">vaincu</span>' : ""}<div class="tiny dim">${esc(D.hint)}</div>${won ? `<div class="tiny">${ico("star", "#ffb848", 11)} ${esc(SECRET_INFO[k][2])}</div>` : ""}</div></div>`; }).join("")}</div>`;
}
// Archives (Atlas) : avancement des quêtes de région
const QUEST_REG = [["bourg", "La cloche fêlée"], ["foret", "La corde coupée"], ["catacombes", "Le psautier inachevé"], ["marais", "La barque vide"], ["citadelle", "Le blason effacé"]];
function questsHTML() {
  const sf = S.flags || [];
  return `<h3 style="margin-top:14px">${ico("quest", "#e8c878", 15)} Quêtes de région</h3><p class="tiny dim">Trois rencontres, sur plusieurs expéditions, mènent au point faible d'un gardien — ou à son trésor caché.</p><div class="col">${QUEST_REG.map(([r, n]) => { const k = r === "catacombes" ? "cata" : r === "citadelle" ? "cit" : r, st = sf.includes("q_" + k + "2") ? 2 : sf.includes("q_" + k + "1") ? 1 : 0, R = regionById(r);
    return `<div class="row sp card" style="cursor:default"><span><b>${esc(n)}</b> <span class="tiny dim">${R ? esc(R.n) : ""}</span></span><span class="tiny ${st ? "gold" : "dim"}">${st ? `Étape ${st + 1}/3 — à poursuivre là-bas` : "Étape 1/3 — rencontre à trouver"}</span></div>`; }).join("")}</div>`;
}
// ── Optimiser l'équipement : pour chaque héros, l'objet de l'inventaire qui l'améliore le plus (qualité minimale au choix) ──
function bestScore(h, it) { const D = gearDelta(h, it), R = CLASSES[h.cls].role; return (R === "tank" ? D.surv * 100 + D.dps * 35 : R === "soin" ? D.surv * 60 + D.dps * 25 + D.score * .4 : D.dps * 100 + D.surv * 35) + D.score * .05; }
function autoEquipAll(minRar, onlyIds) {
  const out = []; let changed = true, guard = 0;
  while (changed && guard++ < 6) { changed = false;
    for (const h of S.heroes) { if (onlyIds && !onlyIds.includes(h.id)) continue;
      for (const kind of ["wpn", "arm", "tr"]) {
        const cands = S.inv.filter(it => it.kind === kind && it.rar >= minRar && canEquip(h, it)); if (!cands.length) continue;
        let best = null, bs = 1;
        for (const it of cands) { if (kind === "tr") { const slot = !h.gear.tr1 ? "tr1" : !h.gear.tr2 ? "tr2" : null; if ([h.gear.tr1, h.gear.tr2].some(x => x && x.key === it.key)) continue; } const sc = bestScore(h, it); if (sc > bs) { bs = sc; best = it; } }
        if (best) { const slot = kind === "tr" ? (!h.gear.tr1 ? "tr1" : !h.gear.tr2 ? "tr2" : (bestScore(h, h.gear.tr1) < bestScore(h, h.gear.tr2) ? "tr1" : "tr2")) : undefined; if (equip(h, best, slot)) { out.push({ h, it: best }); changed = true; } }
      }
    }
  }
  return out;
}
ACT.autoEquip = () => {
  const draw = () => { const R = UI.aeq || (UI.aeq = { min: 0 }); const n = (() => { const snap = JSON.stringify(S.heroes.map(h => h.gear)); return snap; })();
    modal(`<h2>${ico("armor", "#e8c878")} Optimiser l'équipement</h2><p class="small">Chaque héros prend dans l'inventaire l'objet qui l'améliore le plus selon son rôle (tank : survie, soigneur : survie et soins, dégâts : dégâts par tour). L'ancien objet retourne à l'inventaire.</p>
      <div class="small" style="margin:6px 0">Qualité minimale :</div><div class="row" style="gap:4px;flex-wrap:wrap">${RARITY.map((Q, q) => `<button class="btn sm ${R.min === q ? "gold" : "ghost"}" data-a="aeqMin" data-v="${q}"><span class="rar${q}">${Q.n}</span></button>`).join("")}</div>
      <div class="row" style="justify-content:flex-end;gap:6px;margin-top:12px"><button class="btn ghost" data-a="closeModal">Annuler</button><button class="btn main" data-a="aeqGo">Équiper toute la compagnie</button></div>`, { onClose: () => openBuilding("forge", "inv") }); };
  UI.aeqDraw = draw; draw();
};
ACT.aeqMin = q => { UI.aeq.min = +q; UI.aeqDraw(); };
ACT.aeqGo = () => { const L = autoEquipAll(UI.aeq.min); save(); closeModal(); toast(L.length ? `${ico("armor", "#e8c878", 14)} ${L.length} objet${L.length > 1 ? "s" : ""} équipé${L.length > 1 ? "s" : ""} : ${L.slice(0, 6).map(x => esc(x.h.name) + " ← " + gearName(x.it)).join(" · ")}${L.length > 6 ? "…" : ""}` : "Rien de mieux dans l'inventaire.", L.length ? "good" : ""); };
ACT.petTab = t => openBuilding("menagerie", t);
ACT.petRelease = id => { confirmBox(`Rendre sa liberté à <b>${petName(id)}</b> ? Il quittera la Ménagerie (son niveau et son collier sont perdus). Vous récupérez 25 % de son prix.`, () => { const r = releasePet(id); if (r.err) return toast(r.err, "bad"); if (S.petCollar) delete S.petCollar[id]; delete S.pets.lvl[id]; delete S.pets.xp[id]; save(); renderHud(); toast(`${petName(id)} retourne à la nature. +${r.gold} or.`, "good"); openBuilding("menagerie"); }, { yes: "Libérer" }); };
// héros visibles au Bastion (œil sur la fiche de la Compagnie), dix au plus pour garder la place lisible
const HUB_SHOW_MAX = 10;
ACT.hubShow = id => { S.hubShow = S.hubShow && S.hubShow.length ? S.hubShow.filter(x => heroById(x)) : S.heroes.slice(0, 6).map(h => h.id); const i = S.hubShow.indexOf(id); if (i >= 0) S.hubShow.splice(i, 1); else { if (S.hubShow.length >= HUB_SHOW_MAX) return toast(`Au plus ${HUB_SHOW_MAX} héros se promènent au Bastion.`, "bad"); S.hubShow.push(id); } if (!S.hubShow.length) S.hubShow = ["-"]; save(); refresh(); };
function hubShowBtn(h) { const on = S.hubShow && S.hubShow.length ? S.hubShow.includes(h.id) : S.heroes.indexOf(h) < 6; return `<button class="btn sm ${on ? "gold" : "ghost"}" data-a="hubShow" data-v="${h.id}" title="${on ? "Se promène au Bastion" : "Invisible au Bastion"}">${ico("eye", on ? "#e8c878" : "#7a6a5a", 13)}</button>`; }
// Bastion : bandeau « expédition en pause »
function pausedRunHTML() { const r = S.run; if (!r) return ""; const R = regionById(r.region); return `<div class="panel" style="position:absolute;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom) + 70px);z-index:5;padding:8px 12px;display:flex;gap:10px;align-items:center;border-color:#e8c87877"><span class="small">${ico("hourglass", "#e8c878", 15)} Expédition en pause : <b>${esc(R ? R.n : "")}</b>${r.region === "abime" ? ` · profondeur ${r.floor}` : ""}</span><button class="btn sm main" data-a="runResume">Reprendre</button></div>`; }
