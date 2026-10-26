/* ═══════════════════════ Héros : caserne et fiche ═══════════════════════ */
SCREENS.heroes = {
  title: "Les Héros", tab: "heroes",
  scene: () => backdrop("bastion", { dark: .55 }),
  html: () => {
    const hs = S.heroes.slice().sort((a, b) => b.lvl - a.lvl);
    return `<div class="wrap"><div class="row sp"><h1>La Compagnie</h1><span class="small dim">${S.heroes.length}/${rosterMax()} héros</span></div>
    <div class="grid" style="--min:250px">${hs.map(h => { const C = CLASSES[h.cls]; return `<div class="card" data-go="hero" data-arg="${h.id}"><div class="row" style="gap:10px;flex-wrap:nowrap">${canvasSlot("h:" + h.id, 84, 84)}<div style="flex:1;min-width:0"><h3 style="margin:0">${esc(h.name)}</h3><div class="small gold">${heroTitle(h)}</div><div class="row" style="gap:4px;margin:3px 0">${roleTag(C.role)}<span class="tag">niv ${h.lvl}</span>${isInjured(h) ? '<span class="tag bad">Blessé</span>' : ""}${h.lvl >= EVO_LVL && !h.evo ? '<span class="tag gold">Évolution !</span>' : ""}</div><div class="bar xp"><i style="width:${h.lvl >= MAX_LVL ? 100 : 100 * h.xp / xpNeed(h.lvl)}%"></i></div><div class="tiny dim" style="margin-top:3px">Puissance ${heroPower(h)} · ${h.kills} victimes</div></div></div></div>`; }).join("")}</div>
    <div class="row" style="margin-top:12px"><button class="btn" data-a="openInv">${ico("chest")}Inventaire (${S.inv.length})</button><button class="btn ghost" data-a="bld" data-v="taverne">${ico("tavern")}Recruter</button></div></div>`;
  },
  mount: () => fillCanvases($("#view"), (c, id) => paintHero(c, heroById(id.split(":")[1]))),
};
ACT.openInv = () => { UI.bldTab = "inv"; openBuilding("forge", "inv"); };
SCREENS.hero = {
  title: () => "Fiche du héros", tab: "heroes",
  scene: () => backdrop("bastion", { dark: .6 }),
  html: id => {
    const h = heroById(id); if (!h) return '<div class="empty">Héros introuvable.</div>';
    const C = CLASSES[h.cls], st = heroStats(h), pool = heroSkillPool(h), ult = heroUlt(h);
    const evoBlock = h.evo ? `<div class="panel" style="padding:10px;margin-top:10px"><h3>${ico("star", "#e8c878", 14)} ${C.evos[h.evo].n}${h.lvl >= APEX_LVL ? ` — <span class="gold">${APEX[h.evo].n}</span>` : ""}</h3><p class="small lore">${C.evos[h.evo].d}</p><p class="tiny">${pasText(C.evos[h.evo].pas)}</p>${h.lvl >= APEX_LVL ? `<p class="tiny gold">Apogée : ${pasText(APEX[h.evo].pas)}</p>` : `<p class="tiny dim">Apogée au niveau ${APEX_LVL} : ${APEX[h.evo].n} (${pasText(APEX[h.evo].pas)})</p>`}</div>`
      : `<div class="panel" style="padding:10px;margin-top:10px"><h3>${ico("star", "#e8c878", 14)} Évolution ${h.lvl >= EVO_LVL ? "" : `(niveau ${EVO_LVL})`}</h3><div class="grid" style="--min:220px">${Object.entries(C.evos).map(([k, E]) => `<div class="card ${h.lvl < EVO_LVL ? "lock" : ""}" style="cursor:default">${canvasSlot("evo:" + k, 170, 215)}<div class="tiny dim" style="text-align:center">Aspect final avec une armure de palier VI</div><h3 style="text-align:center">${E.n}</h3><p class="small lore">${gl(E.d)}</p><p class="tiny">${pasText(E.pas)}</p><p class="tiny">Compétences : ${Object.values(E.skills).map(s => "<b>" + s.n + "</b>").join(", ")} · Ultime : <b>${E.ult.n}</b></p>${h.lvl >= EVO_LVL ? `<button class="btn gold sm" style="width:100%" data-a="evolve" data-v="${h.id}:${k}">Choisir · 250 or, 2 ess.</button>` : ""}</div>`).join("")}</div></div>`;
    return `<div class="wrap"><button class="btn ghost sm" data-go="heroes">← Compagnie</button>
    <div class="row" style="align-items:flex-start;gap:14px;margin-top:8px">
      <div class="panel" style="padding:8px;text-align:center;flex:0 0 auto;margin:0 auto">${canvasSlot("full", 210, 262)}<div class="row" style="justify-content:center">${slotHTML(h.gear.wpn, "gearSlot", h.id + ":wpn")}${slotHTML(h.gear.arm, "gearSlot", h.id + ":arm")}${slotHTML(h.gear.tr1, "gearSlot", h.id + ":tr1")}${slotHTML(h.gear.tr2, "gearSlot", h.id + ":tr2")}</div><div class="tiny dim" style="margin-top:4px">Arme · Armure · Bibelots</div></div>
      <div style="flex:1;min-width:260px">
        <h1 style="margin-bottom:2px">${esc(h.name)} <button class="btn ghost sm" data-a="rename" data-v="${h.id}">✎</button></h1>
        <div class="row">${roleTag(C.role)}<span class="tag gold">${heroTitle(h)}</span><span class="tag">Niveau ${h.lvl}</span>${isInjured(h) ? '<span class="tag bad">Blessé</span>' : ""}</div>
        <div class="bar xp" style="margin:8px 0 2px"><i style="width:${h.lvl >= MAX_LVL ? 100 : 100 * h.xp / xpNeed(h.lvl)}%"></i></div><div class="tiny dim">${h.lvl >= MAX_LVL ? "Niveau maximal" : `${h.xp} / ${xpNeed(h.lvl)} XP`}</div>
        <p class="lore small">${C.lore}</p>
        <div class="row small">${h.traits.map(t => `<span class="tag ${TRAITS[t].good ? "good" : "bad"}" ${tipAttr(TRAITS[t].n, TRAITS[t].d)}>${TRAITS[t].n}</span>`).join("")}</div>
        <div class="statgrid" style="margin-top:8px"><div>PV <b>${st.hp}</b></div><div>Dégâts <b>${st.dmgLo}–${st.dmgHi}</b></div><div>Protection <b>${Math.round(st.prot * 100)} %</b></div><div>Vitesse <b>${st.spd}</b></div><div>Critique <b>${Math.round(st.crit)} %</b></div><div>Esquive <b>${Math.round(st.dodge)}</b></div><div>Précision <b>${Math.round(st.acc)}</b></div><div>Résistance <b>${Math.round(st.res)}</b></div>${st.healPow > 1.01 ? `<div>Soins <b>${Math.round(st.healPow * 100)} %</b></div>` : ""}${st.leech ? `<div>Vol de vie <b>${Math.round(st.leech * 100)} %</b></div>` : ""}</div>
        <p class="tiny dim" style="margin-top:6px">Rangs préférés : ${C.rk.join(", ")} · Armure ${C.armor} · Puissance ${heroPower(h)}</p>
      </div>
    </div>
    <h2 style="margin-top:14px">Compétences <span class="small dim" style="font-family:var(--f-body)">(${h.skills.length}/4 équipées — touchez pour équiper)</span></h2>
    <div class="col">${pool.map(k => { const sk = skillDef(h, k), on = h.skills.includes(k), r = h.skr[k] || 1, c = skillUpCost(r); return `<div class="skl ${on ? "on" : ""}" data-a="toggleSk" data-v="${h.id}:${k}">${ico(sk.ic, on ? "#e8c878" : "#9a8c7a")}<div style="flex:1"><div class="row sp"><b>${sk.n}</b><span>${rankPips(sk.use, sk.t === "e" || sk.t === "ae" ? sk.at : null)}</span></div><div class="tiny">${skillText(Object.assign({ id: k }, sk), h)}</div><div class="row sp tiny" style="margin-top:3px"><span class="ranks">${[1, 2, 3, 4, 5].map(i => `<i class="${i <= r ? "u" : ""}"></i>`).join("")}</span>${r < 5 ? `<button class="btn ghost sm ${r >= skillRankMax(h) || !canPay(c) ? "off" : ""}" data-a="skUp" data-v="${h.id}:${k}" title="${r >= skillRankMax(h) ? "Salle des maîtres ou niveau du héros insuffisant" : ""}">Rang ${r + 1} · ${c.gold} or${c.essence ? ` ${c.essence} ess.` : ""}</button>` : '<span class="gold">Maîtrisée</span>'}</div></div></div>`; }).join("")}</div>
    <div class="skl" style="margin-top:8px;border-color:#a05a2a;cursor:default">${ico(ult.ic, "#ff9a4a")}<div><b>Ultime : ${ult.n}</b><div class="tiny">${skillText(Object.assign({ isUlt: 1 }, ult), h)}</div><div class="tiny dim">La jauge d'ultime se remplit en agissant, en frappant et en encaissant.</div></div></div>
    ${questMarkHTML(h)}
    ${evoBlock}
    <div class="row" style="margin-top:14px;justify-content:space-between"><span class="tiny dim">${h.runs} expéditions · ${h.kills} victimes</span><button class="btn ghost sm" data-a="dismiss" data-v="${h.id}">Renvoyer</button></div></div>`;
  },
  mount: id => { const h = heroById(id); if (!h) return; UI.heroOpen = id; fillCanvases($("#view"), (c, cid) => { if (cid === "full") paintHero(c, h, true); else if (cid.startsWith("evo:")) { const k = cid.split(":")[1]; const x = c.getContext("2d"); const L = Object.assign(heroLook(h), { evo: k, tier: 6, wtier: 6 }); const sp = heroSprite(L, {}, 0, c.height / 200); x.drawImage(sp, c.width / 2 - sp.ax, c.height - 4 - sp.ay); } }); },
  leave: () => { UI.heroOpen = null; },
};
function pasText(pas) {
  const N = { dmg: "dégâts", hp: "PV", prot: "protection", spd: "vitesse", crit: "critique", dodge: "esquive", acc: "précision", res: "résistance", healPow: "soins", leech: "vol de vie" };
  const H = { guardProt: "protection quand il protège", burnPow: "brûlures", dodgeRiposte: "riposte en esquivant", lowHpDmg: "dégâts sous 50 % PV", overhealShield: "surplus de soin en bouclier", regenPow: "régénération", dotPow: "dégâts sur la durée", buffPow: "renforcements", moralePow: "résolution", debuffPow: "altérations", markDmg: "dégâts contre les marqués", critBleed: "critiques qui font saigner", killMorale: "résolution par victime", critDmg: "dégâts critiques", killStealth: "furtivité après une victime", dodgeBleed: "saignement en esquivant", petDmg: "dégâts du compagnon", aoeDmg: "dégâts de zone", cheatDeath: "survie à un coup fatal", shieldPow: "boucliers", healTaken: "soins reçus", ultGain: "charge de l'ultime", xp: "expérience", gold: "or", execute: "dégâts sur les blessés", thornsP: "renvoi des dégâts" };
  return gl(pas.map(p => { if (p.k === "stat") { const pc = ["dmg", "hp", "prot", "healPow", "leech"].includes(p.s); return `${p.v > 0 ? "+" : ""}${pc ? Math.round(p.v * 100) + " %" : p.v} ${N[p.s]}`; } if (p.k === "cheatDeath") return `survit ${p.v > 1 ? p.v + " fois" : "une fois"} à un coup fatal`; return `+${p.v < 2 ? Math.round(p.v * 100) + " %" : p.v} ${H[p.k] || p.k}`; }).join(" · "));
}
ACT.toggleSk = (v, el, e) => { if (e && e.target.closest("[data-a=skUp]")) return; const [id, k] = v.split(":"); const h = heroById(id); if (h.skills.includes(k)) { if (h.skills.length <= 1) return; h.skills = h.skills.filter(x => x !== k); } else { if (h.skills.length >= 4) return toast("4 compétences au maximum : retirez-en une d'abord.", "bad"); h.skills.push(k); } save(); refresh(); };
ACT.skUp = (v, el, e) => { e && e.stopPropagation(); const [id, k] = v.split(":"); const h = heroById(id); const r = skillUp(h, k); if (r.err) return toast(r.err, "bad"); sfx("level"); save(); renderHud(); refresh(); };
ACT.evolve = v => { const [id, k] = v.split(":"); const h = heroById(id); const E = CLASSES[h.cls].evos[k]; confirmBox(`${esc(h.name)} deviendra <b>${E.n}</b>. Ce choix est définitif.`, () => { const r = evolve(h, k); if (r.err) return toast(r.err, "bad"); sfx("ult"); toast(`${esc(h.name)} devient ${E.n} !`, "epic"); save(); renderHud(); refresh(); }, { yes: "Évoluer" }); };
ACT.dismiss = id => { const h = heroById(id); confirmBox(`Renvoyer <b>${esc(h.name)}</b> ? Son équipement rejoindra l'inventaire.`, () => { if (dismiss(id)) { save(); go("heroes"); } }); };
ACT.rename = id => { const h = heroById(id); const n = prompt("Nouveau nom", h.name); if (n && n.trim()) { h.name = n.trim().slice(0, 28); save(); refresh(); } };
ACT.gearSlot = v => {
  const [id, slot] = v.split(":"); const h = heroById(id); const kind = slot.startsWith("tr") ? "tr" : slot;
  const items = S.inv.filter(it => it.kind === kind && canEquip(h, it)).sort((a, b) => b.rar - a.rar || b.tier - a.tier);
  const cur = h.gear[slot];
  modal(`<h2>${{ wpn: "Arme", arm: "Armure", tr: "Bibelot" }[kind]} — ${esc(h.name)}</h2>${cur ? `<div class="row card" style="cursor:default">${slotHTML(cur, "itemInfo", cur.id)}<div style="flex:1"><b class="rar${cur.rar}">${gearName(cur)}</b><div class="tiny">${itemLine(cur)}</div></div>${kind !== "tr" ? `<button class="btn sm" data-a="upItem" data-v="${cur.id}">${ico("up")}+1 · ${upCost(cur).gold} or</button>` : `<button class="btn ghost sm" data-a="unequip" data-v="${id}:${slot}">Retirer</button>`}</div>` : ""}
  <h3 style="margin-top:10px">Inventaire</h3>${items.length ? items.map(it => `<div class="row card" data-a="equipTo" data-v="${it.id}:${h.id}" style="align-items:flex-start">${slotHTML(it, "itemInfo", it.id)}<div style="flex:1;min-width:0"><b class="rar${it.rar}">${gearName(it)}</b><div class="tiny dim">${itemLine(it)}</div><div class="chips" style="margin-top:4px">${deltaChips(gearDelta(h, it))}</div></div></div>`).join("") : '<div class="empty small">Rien à équiper ici. Forgez ou explorez.</div>'}`);
};
ACT.unequip = v => { const [id, slot] = v.split(":"); unequip(heroById(id), slot); save(); closeModal(); refresh(); };
// ── fiches de consultation : héros à recruter ou à choisir, compagnons ──
function heroSheetHTML(h, foot = "") {
  const C = CLASSES[h.cls], st = heroStats(h), ult = heroUlt(h);
  const skl = (k, sk, on) => `<div class="skl ${on ? "on" : ""}" style="cursor:default">${ico(sk.ic, on ? "#e8c878" : "#9a8c7a")}<div style="flex:1;min-width:0"><div class="row sp"><b>${sk.n}</b><span>${rankPips(sk.use, sk.t === "e" || sk.t === "ae" ? sk.at : null)}</span></div><div class="tiny">${skillText(Object.assign({ id: k }, sk), h)}</div></div></div>`;
  return `<div class="row" style="gap:12px;flex-wrap:wrap;align-items:flex-start">
    <div style="flex:0 0 auto;margin:0 auto;text-align:center">${canvasSlot("sheet", 150, 188)}</div>
    <div style="flex:1;min-width:220px">
      <h2 style="margin:0">${esc(h.name)}</h2>
      <div class="row" style="gap:4px;margin:4px 0">${roleTag(C.role)}<span class="tag gold">${heroTitle(h)}</span><span class="tag">Niveau ${h.lvl}</span></div>
      <p class="lore small" style="margin:4px 0">${C.lore}</p>
      <div class="col" style="gap:2px">${h.traits.map(t => `<div class="tiny"><b class="${TRAITS[t].good ? "good" : "bad"}">${TRAITS[t].n}</b> — ${gl(TRAITS[t].d)}</div>`).join("")}</div>
      <div class="statgrid" style="margin-top:8px"><div>PV <b>${st.hp}</b></div><div>Dégâts <b>${st.dmgLo}–${st.dmgHi}</b></div><div>Protection <b>${Math.round(st.prot * 100)} %</b></div><div>Vitesse <b>${st.spd}</b></div><div>Critique <b>${Math.round(st.crit)} %</b></div><div>Esquive <b>${Math.round(st.dodge)}</b></div></div>
      <p class="tiny dim" style="margin:6px 0 0">Rangs préférés : ${C.rk.join(", ")} · Armure ${C.armor}</p>
    </div></div>
    ${questMarkHTML(h)}
    <h3 style="margin-top:12px">Compétences <span class="tiny dim" style="font-family:var(--f-body)">— en doré, les 4 équipées au départ</span></h3>
    <div class="col">${heroSkillPool(h).map(k => skl(k, skillDef(h, k), h.skills.includes(k))).join("")}</div>
    <div class="skl" style="margin-top:6px;border-color:#a05a2a;cursor:default">${ico(ult.ic, "#ff9a4a")}<div><b>Ultime : ${ult.n}</b><div class="tiny">${skillText(Object.assign({ isUlt: 1 }, ult), h)}</div></div></div>
    ${h.evo ? "" : `<h3 style="margin-top:12px">Évolutions au niveau ${EVO_LVL}</h3><div class="grid" style="--min:220px">${Object.values(C.evos).map(E => `<div class="card" style="cursor:default"><b class="gold">${E.n}</b><p class="tiny lore" style="margin:2px 0">${gl(E.d)}</p><div class="tiny">${pasText(E.pas)}</div><div class="tiny dim" style="margin-top:3px">Compétences : ${Object.values(E.skills).map(s => s.n).join(", ")} · Ultime : ${E.ult.n}</div></div>`).join("")}</div>`}
    ${foot}`;
}
function heroSheet(h, foot) { modal(heroSheetHTML(h, foot), { wide: 1, mount: m => fillCanvases(m, c => paintHero(c, h, true)) }); }
function petSkillText(s) {
  const out = [], tg = { low: "l'allié le plus blessé", aa: "tout le groupe", e: "un ennemi", ae: "les ennemis visés" }[s.t] || "";
  if (s.m) out.push(`Dégâts ${Math.round(s.m * 100)} % sur ${tg}`);
  if (s.heal) out.push(`Soigne ${tg} de ${Math.round(s.heal * 100)} %`);
  if (s.regen) out.push(`Régénération ${Math.round(s.regen * 100)} %`);
  if (s.shield) out.push(`Bouclier ${Math.round(s.shield * 100)} % sur ${tg}`);
  if (s.leechLow) out.push(`Soigne l'allié le plus blessé de ${Math.round(s.leechLow * 100)} % des dégâts`);
  if (s.cleanse1) out.push("Purge une altération");
  if (s.light) out.push(`+${s.light} lueur`);
  if (s.cr) out.push(`+${s.cr} % critique`);
  const fx = skillText({ t: s.t === "low" ? "a" : s.t, fx: s.fx, afx: s.afx });
  if (fx) out.push(fx);
  if (s.at && !s.m && !s.fx) out.push(`sur ${tg}`);
  return out.join(" · ") + (s.every ? ` · tous les ${s.every} tours` : " · chaque tour");
}
function petSheet(id, foot = "") {
  const P = PETS[id];
  modal(`<div class="row" style="gap:12px;flex-wrap:wrap"><div style="margin:0 auto">${canvasSlot("pet", 200, 150)}</div><div style="flex:1;min-width:220px"><h2 style="margin:0">${P.n}</h2><div class="row" style="gap:4px;margin:4px 0">${roleTag(P.role)}${P.gold ? `<span class="tag gold">+${Math.round(P.gold * 100)} % d'or</span>` : ""}</div><p class="lore small">${P.d}</p><p class="tiny dim">Le compagnon agit seul à la fin de chaque tour. Il gagne des niveaux avec le groupe et évolue au niveau ${PET_EVO_LVL}.</p></div></div>
    <h3 style="margin-top:10px">Compétences</h3><div class="col">${P.sk.map(s => `<div class="skl" style="cursor:default">${ico(s.m ? "claw" : s.heal ? "heal" : s.shield ? "shield" : "star", "#e8c878")}<div><b>${s.n}</b><div class="tiny">${petSkillText(s)}</div></div></div>`).join("")}</div>
    <h3 style="margin-top:10px">Évolution : ${P.evo.n}</h3><p class="tiny lore">${P.evo.d}</p><div class="skl" style="cursor:default;border-color:#a05a2a">${ico("star", "#ff9a4a")}<div><b>${P.evo.sk.n}</b><div class="tiny">${petSkillText(Object.assign({ every: 2 }, P.evo.sk))}</div></div></div>${foot}`, { wide: 1, mount: m => fillCanvases(m, c => paintPet(c, id, 0)) });
}
ACT.petInfo = (id, el, e) => { e && e.stopPropagation(); petSheet(id, `<div class="row" style="justify-content:flex-end;margin-top:10px"><button class="btn" data-a="bld" data-v="menagerie">Retour à la Ménagerie</button></div>`); };
ACT.recruitInfo = (i, el, e) => { e && e.stopPropagation(); const h = S.recruits[+i]; if (!h) return; const c = recruitPrice(+i); heroSheet(h, `<div class="row" style="justify-content:flex-end;gap:6px;margin-top:12px"><button class="btn ghost" data-a="bld" data-v="taverne">Retour</button><button class="btn main" data-a="recruit" data-v="${i}">Recruter · ${c === 0 ? "gratuit" : c + " or"}</button></div>`); };
