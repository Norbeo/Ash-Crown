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
  let out = ""; const n = setCount(h);
  for (const k in n) { const T = SETS[k]; out += `<div class="tiny" style="margin:2px 0"><b style="color:${T.c}">❖ ${T.n}</b> ${n[k]}/3 — <span class="${n[k] >= 2 ? "good" : "dim"}">2 : ${T.b2.d}</span> · <span class="${n[k] >= 3 ? "good" : "dim"}">3 : ${T.b3.d}</span></div>`; }
  if (h.asc) out += `<div class="tiny" style="color:${ASC_AURA[(h.asc - 1) % ASC_AURA.length]}">✦ Ascension ${roman(h.asc)} : +${6 * h.asc} % de dégâts et de PV, +${4 * h.asc} résistance.</div>`;
  if (S.heroes.includes(h)) out += canAscend(h) ? `<button class="btn sm gold" style="margin:4px 0" data-a="ascend" data-v="${h.id}">✦ Ascension : renaître au niveau ${ASC_BACK}</button>` : h.lvl >= 20 ? `<div class="tiny dim">✦ Ascension possible au niveau ${ASC_LVL} pour un héros évolué.</div>` : "";
  return out;
}
ACT.ascend = id => {
  const h = heroById(id); if (!canAscend(h)) return;
  confirmBox(`<b>${esc(h.name)}</b> renaît au niveau ${ASC_BACK}. Il garde sa voie, ses compétences et son équipement (s'il a encore le niveau requis pour en changer), et gagne pour toujours +6 % de dégâts et de PV, +4 résistance et une aura nouvelle.`, () => { ascend(h); save(); sfx("holy"); toast(`✦ ${esc(h.name)} atteint l'Ascension ${roman(h.asc)} !`, "good"); heroSheet(h); }, { yes: "Renaître" });
};
// fiche du compagnon : trait et collier
function petProgressHTML(id) {
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
