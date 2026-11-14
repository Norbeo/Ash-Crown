/* ═══════════════════════ Héros : caserne et fiche ═══════════════════════ */
SCREENS.heroes = {
  title: "Les Héros", tab: "heroes",
  scene: () => backdrop("bastion", { dark: .55 }),
  html: () => {
    const tab = ["all", "tank", "soin", "soutien", "dps"].includes(UI.heroTab) ? UI.heroTab : "all";
    const hs = S.heroes.filter(h => tab === "all" || CLASSES[h.cls].role === tab).sort(typeof heroSortFn === "function" ? heroSortFn() : (a, b) => b.lvl - a.lvl || a.cls.localeCompare(b.cls));
    const cnt = r => S.heroes.filter(h => r === "all" || CLASSES[h.cls].role === r).length;
    const tb = (k, n) => `<button class="btn sm ${tab === k ? "gold" : "ghost"}" data-a="heroTab" data-v="${k}">${n} (${cnt(k)})</button>`;
    return `<div class="wrap"><div class="row sp"><h1>La Compagnie</h1><span class="small dim">${S.heroes.length}/${capTxt(rosterMax())} héros</span></div>
    <div class="row" style="gap:4px;margin:4px 0 8px;flex-wrap:wrap">${tb("all", "Tous")}${tb("tank", "Tanks")}${tb("soin", "Soigneurs")}${tb("soutien", "Soutiens")}${tb("dps", "Dégâts")}</div>
    <div class="grid" style="--min:250px">${hs.map(h => { const C = CLASSES[h.cls]; return `<div class="card" data-go="hero" data-arg="${h.id}"><div class="row" style="gap:10px;flex-wrap:nowrap">${canvasSlot("h:" + h.id, 84, 84)}<div style="flex:1;min-width:0"><h3 style="margin:0">${esc(h.name)}</h3><div class="small gold">${heroTitle(h)}</div><div class="row" style="gap:4px;margin:3px 0">${roleTag(C.role)}<span class="tag">niv ${h.lvl}</span>${isInjured(h) ? '<span class="tag bad">Blessé</span>' : ""}${h.lvl >= EVO_LVL && !h.evo ? '<span class="tag gold">Évolution !</span>' : ""}</div><div class="bar xp"><i style="width:${h.lvl >= MAX_LVL ? 100 : 100 * h.xp / xpNeed(h.lvl)}%"></i></div><div class="row sp" style="margin-top:3px"><span class="tiny dim">Puissance ${heroPower(h)} · ${h.kills} victimes</span>${hubShowBtn(h)}</div></div></div></div>`; }).join("")}</div>
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
      : `<div class="panel" style="padding:10px;margin-top:10px"><h3>${ico("star", "#e8c878", 14)} Évolution ${h.lvl >= EVO_LVL ? "" : `(niveau ${EVO_LVL})`}</h3><div class="grid" style="--min:220px">${Object.entries(C.evos).map(([k, E]) => `<div class="card ${h.lvl < EVO_LVL ? "lock" : ""}" style="cursor:default">${canvasSlot("evo:" + k, 170, 215)}<div class="tiny dim" style="text-align:center">Aspect final avec une armure de palier ${TIER_ROM[evoTopTier(h.cls, k)]}</div><h3 style="text-align:center">${E.n}</h3><p class="small lore">${gl(E.d)}</p><p class="tiny">${pasText(E.pas)}</p><p class="tiny">Compétences : ${Object.values(E.skills).map(s => "<b>" + s.n + "</b>").join(", ")} · Ultime : <b>${E.ult.n}</b></p>${h.lvl >= EVO_LVL ? `<button class="btn gold sm" style="width:100%" data-a="evolve" data-v="${h.id}:${k}">Choisir · 250 or, 2 ess.</button>` : ""}</div>`).join("")}</div></div>`;
    return `<div class="wrap"><button class="btn ghost sm" data-go="heroes">← Compagnie</button>
    <div class="row" style="align-items:flex-start;gap:14px;margin-top:8px">
      <div class="panel" style="padding:8px;text-align:center;flex:0 0 auto;margin:0 auto">${canvasSlot("full", 210, 262)}<div class="row" style="justify-content:center">${slotHTML(h.gear.wpn, "gearSlot", h.id + ":wpn")}${slotHTML(h.gear.arm, "gearSlot", h.id + ":arm")}${slotHTML(h.gear.tr1, "gearSlot", h.id + ":tr1")}${slotHTML(h.gear.tr2, "gearSlot", h.id + ":tr2")}</div><div class="tiny dim" style="margin-top:4px">Arme · Armure · Bibelots</div></div>
      <div style="flex:1;min-width:260px">
        <h1 style="margin-bottom:2px">${esc(h.name)} <button class="btn ghost sm" data-a="rename" data-v="${h.id}">✎</button></h1>
        <div class="row">${roleTag(C.role)}<span class="tag gold">${heroTitle(h)}</span><span class="tag">Niveau ${h.lvl}</span>${h.asc ? `<span class="tag" style="color:${ASC_COL[(h.asc - 1) % ASC_COL.length]}">${"✦".repeat(Math.min(5, h.asc))} Ascension ${roman(h.asc)}</span>` : ""}${isInjured(h) ? '<span class="tag bad">Blessé</span>' : ""}</div>
        <div class="bar xp" style="margin:8px 0 2px"><i style="width:${h.lvl >= MAX_LVL ? 100 : 100 * h.xp / xpNeed(h.lvl)}%"></i></div><div class="tiny dim">${h.lvl >= MAX_LVL ? "Niveau maximal" : `${h.xp} / ${xpNeed(h.lvl)} XP`}</div>
        <p class="lore small">${C.lore}</p>
        <div class="row small">${h.traits.map(t => `<span class="tag ${TRAITS[t].good ? "good" : "bad"}" ${tipAttr(TRAITS[t].n, TRAITS[t].d)}>${TRAITS[t].n}</span>`).join("")}</div>
        ${heroStatsBlockHTML(h, st)}
        <p class="tiny dim" style="margin-top:6px">Rangs préférés : ${C.rk.join(", ")} · Armure ${C.armor} · Puissance ${heroPower(h)}</p>
      </div>
    </div>
    <h2 style="margin-top:14px">Compétences <span class="small dim" style="font-family:var(--f-body)">(${h.skills.length}/4 équipées — touchez pour équiper)</span></h2>
    <div class="col">${pool.map(k => { const sk = skillDef(h, k), on = h.skills.includes(k), r = h.skr[k] || 1, c = skillUpCost(r); return `<div class="skl ${on ? "on" : ""}" data-a="toggleSk" data-v="${h.id}:${k}">${ico(sk.ic, on ? "#e8c878" : "#9a8c7a")}<div style="flex:1"><div class="row sp"><b>${sk.n}</b><span>${rankPips(sk.use, sk.t === "e" || sk.t === "ae" ? sk.at : null)}</span></div><div class="tiny">${skillText(Object.assign({ id: k }, sk), h)}</div><div class="row sp tiny" style="margin-top:3px"><span class="ranks">${[1, 2, 3, 4, 5].map(i => `<i class="${i <= r ? "u" : ""}"></i>`).join("")}</span>${r < 5 ? `<button class="btn ghost sm ${r >= skillRankMax(h) || !canPay(c) ? "off" : ""}" data-a="skUp" data-v="${h.id}:${k}" title="${r >= skillRankMax(h) ? "Salle des maîtres ou niveau du héros insuffisant" : ""}">Rang ${r + 1} · ${c.gold} or${c.essence ? ` ${c.essence} ess.` : ""}</button>` : '<span class="gold">Maîtrisée</span>'}</div></div></div>`; }).join("")}${lockedSkillsHTML(h)}</div>
    <div class="skl" style="margin-top:8px;border-color:#a05a2a;cursor:default">${ico(ult.ic, "#ff9a4a")}<div><b>Ultime : ${ult.n}</b><div class="tiny">${skillText(Object.assign({ isUlt: 1 }, ult), h)}</div><div class="tiny dim">La jauge d'ultime se remplit en agissant, en frappant et en encaissant.</div></div></div>
    ${vetOutfitHTML(h)}${questMarkHTML(h)}${tomeHTML(h)}${stressHTML(h)}${talentsHTML(h)}
    ${evoBlock}
    <div class="row" style="margin-top:14px;justify-content:space-between"><span class="tiny dim">${h.runs} expéditions · ${h.kills} victimes</span><button class="btn ghost sm" data-a="dismiss" data-v="${h.id}">Renvoyer</button></div></div>`;
  },
  mount: id => { const h = heroById(id); if (!h) return; UI.heroOpen = id; fillCanvases($("#view"), (c, cid) => { if (cid === "full") paintHero(c, h, true); else if (cid.startsWith("evo:")) { const k = cid.split(":")[1]; const x = c.getContext("2d"); const tt = evoTopTier(h.cls, k), L = Object.assign(heroLook(h), { evo: k, tier: tt, wtier: tt }); const sp = heroSprite(L, {}, 0, c.height / 200); x.drawImage(sp, c.width / 2 - sp.ax, c.height - 4 - sp.ay); } }); },
  leave: () => { UI.heroOpen = null; },
};
function pasText(pas) {
  const N = { dmg: "dégâts", hp: "PV", prot: "protection", spd: "vitesse", crit: "chance de critique", dodge: "esquive", acc: "précision", res: "résistance", healPow: "soins", leech: "vol de vie" };
  const H = { guardProt: "protection quand il protège", burnPow: "brûlures", dodgeRiposte: "riposte en esquivant", lowHpDmg: "dégâts sous 50 % PV", overhealShield: "surplus de soin en bouclier", regenPow: "régénération", dotPow: "dégâts sur la durée", buffPow: "renforcements", moralePow: "résolution", debuffPow: "altérations", markDmg: "dégâts contre les marqués", critBleed: "critiques qui font saigner", killMorale: "résolution par victime", critDmg: "dégâts critiques", killStealth: "furtivité après une victime", dodgeBleed: "saignement en esquivant", petDmg: "dégâts du compagnon", aoeDmg: "dégâts de zone", cheatDeath: "survie à un coup fatal", shieldPow: "boucliers", healTaken: "soins reçus", ultGain: "charge de l'ultime", xp: "expérience", gold: "or", execute: "dégâts sur les blessés", thornsP: "renvoi des dégâts" };
  return gl(pas.map(p => { if (p.k === "stat") { const pc = ["dmg", "hp", "prot", "healPow", "leech"].includes(p.s); return `${p.v > 0 ? "+" : ""}${pc ? Math.round(p.v * 100) + " %" : Math.round(p.v) + (p.s === "crit" ? " %" : "")} ${N[p.s]}`; } if (p.k === "cheatDeath") return `survit ${p.v >= 2 ? Math.floor(p.v) + " fois" : "une fois"} à un coup fatal`; if (p.k === "critBleed") return `critiques : saignement de ${Math.round(p.v * 100)} % des dégâts moyens par tour (3 tours)`; if (p.k === "vsTag") return `+${Math.round(p.v * 100)} % contre les ${p.tag}s`; if (p.k === "killMorale") return `+${Math.round(p.v)} de résolution par victime`; return `+${p.v < 2 ? Math.round(p.v * 100) + " %" : p.v} ${H[p.k] || p.k}`; }).join(" · "));
}
ACT.toggleSk = (v, el, e) => { if (e && e.target.closest("[data-a=skUp]")) return; const [id, k] = v.split(":"); const h = heroById(id); if (h.skills.includes(k)) { if (h.skills.length <= 1) return; h.skills = h.skills.filter(x => x !== k); } else { if (h.skills.length >= 4) return toast("4 compétences au maximum : retirez-en une d'abord.", "bad"); h.skills.push(k); } save(); refresh(); };
ACT.skUp = (v, el, e) => { e && e.stopPropagation(); const [id, k] = v.split(":"); const h = heroById(id); const r = skillUp(h, k); if (r.err) return toast(r.err, "bad"); sfx("level"); save(); renderHud(); refresh(); };
ACT.evolve = v => { const [id, k] = v.split(":"); const h = heroById(id); const E = CLASSES[h.cls].evos[k]; confirmBox(`${esc(h.name)} deviendra <b>${E.n}</b>. Ce choix est définitif.`, () => { const r = evolve(h, k); if (r.err) return toast(r.err, "bad"); sfx("ult"); toast(`${esc(h.name)} devient ${E.n} !`, "epic"); save(); renderHud(); refresh(); }, { yes: "Évoluer" }); };
ACT.dismiss = id => { const h = heroById(id); confirmBox(`Renvoyer <b>${esc(h.name)}</b> ? Son équipement rejoindra l'inventaire.`, () => { if (dismiss(id)) { save(); go("heroes"); } }); };
ACT.rename = id => { const h = heroById(id); const n = prompt("Nouveau nom", h.name); if (n && n.trim()) { h.name = n.trim().slice(0, 28); save(); refresh(); } };
ACT.gearSlot = v => { UI.gsV = v;
  const [id, slot] = v.split(":"); const h = heroById(id); const kind = slot.startsWith("tr") ? "tr" : slot;
  const items = S.inv.filter(it => it.kind === kind && canEquip(h, it)).sort((a, b) => b.rar - a.rar || b.tier - a.tier);
  const cur = h.gear[slot];
  modal(`<h2>${{ wpn: "Arme", arm: "Armure", tr: "Bibelot" }[kind]} — ${esc(h.name)}</h2>${cur ? `<div class="row card" style="cursor:default">${slotHTML(cur, "itemInfo", cur.id)}<div style="flex:1"><b class="rar${cur.rar}">${gearName(cur)}</b><div class="tiny">${itemLine(cur)}</div></div>${kind !== "tr" ? `<button class="btn sm" data-a="upItem" data-v="${cur.id}">${ico("up")}+1 · ${upCost(cur).gold} or</button>` : `<button class="btn ghost sm" data-a="unequip" data-v="${id}:${slot}">Retirer</button>`}</div>` : ""}
  <h3 style="margin-top:10px">Inventaire</h3>${items.length ? items.map(it => `<div class="row card" data-a="equipTo" data-v="${it.id}:${h.id}${kind === "tr" ? ":" + slot : ""}" style="align-items:flex-start">${slotHTML(it, "itemInfo", it.id)}<div style="flex:1;min-width:0"><b class="rar${it.rar}">${gearName(it)}</b><div class="tiny dim">${itemLine(it)}</div><div class="chips" style="margin-top:4px">${deltaChips(gearDelta(h, it))}</div></div></div>`).join("") : '<div class="empty small">Rien à équiper ici. Forgez ou explorez.</div>'}`);
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
      ${typeof heroProgressHTML === "function" ? heroProgressHTML(h) : ""}
      <div class="col" style="gap:2px">${h.traits.map(t => `<div class="tiny"><b class="${TRAITS[t].good ? "good" : "bad"}">${TRAITS[t].n}</b> — ${gl(TRAITS[t].d)}</div>`).join("")}</div>
      ${heroStatsBlockHTML(h, st)}
      <p class="tiny dim" style="margin:6px 0 0">Rangs préférés : ${C.rk.join(", ")} · Armure ${C.armor}</p>
    </div></div>
    ${questMarkHTML(h)}
    <h3 style="margin-top:12px">Compétences <span class="tiny dim" style="font-family:var(--f-body)">— en doré, les 4 équipées au départ</span></h3>
    <div class="col">${heroSkillPool(h).map(k => skl(k, skillDef(h, k), h.skills.includes(k))).join("")}${lockedSkillsHTML(h)}</div>
    <div class="skl" style="margin-top:6px;border-color:#a05a2a;cursor:default">${ico(ult.ic, "#ff9a4a")}<div><b>Ultime : ${ult.n}</b><div class="tiny">${skillText(Object.assign({ isUlt: 1 }, ult), h)}</div></div></div>
    ${h.evo ? "" : `<h3 style="margin-top:12px">Évolutions au niveau ${EVO_LVL}</h3><div class="grid" style="--min:220px">${Object.values(C.evos).map(E => `<div class="card" style="cursor:default"><b class="gold">${E.n}</b><p class="tiny lore" style="margin:2px 0">${gl(E.d)}</p><div class="tiny">${pasText(E.pas)}</div><div class="tiny dim" style="margin-top:3px">Compétences : ${Object.values(E.skills).map(s => s.n).join(", ")} · Ultime : ${E.ult.n}</div></div>`).join("")}</div>`}
    ${foot}`;
}
function heroSheet(h, foot) { modal(heroSheetHTML(h, foot), { wide: 1, onClose: bldBack(), mount: m => fillCanvases(m, c => paintHero(c, h, true)) }); }
function petSkillText(s, id) {
  const out = [], t = s.t || "e";
  const one = s.tgt === "high" ? "l'ennemi le plus robuste" : "l'ennemi le plus blessé";
  const tg = { low: "l'allié le plus blessé", aa: "tout le groupe", e: one, ae: "tous les ennemis à portée" }[t] || "";
  const ranks = s.at && (t === "e" || t === "ae") && s.at.length < 4 ? ` (${s.at.length > 1 ? "rangs" : "rang"} ${s.at.join("-")})` : "";
  const pw = id && typeof petPower === "function" ? petPower(id) : null;
  if (s.m) { const lo = pw ? Math.max(1, Math.round(pw.dmg * .8 * s.m)) : 0, hi = pw ? Math.round(pw.dmg * 1.2 * s.m) : 0; out.push(`Dégâts ${Math.round(s.m * 100)} %${pw ? ` (<b class="num">${lo === hi ? lo : lo + "–" + hi}</b>)` : ""}${s.hits > 1 ? " × " + s.hits + " coups" : ""} sur ${tg}${ranks}`); }
  else if (t === "e" || t === "ae") out.push(`Vise ${tg}${ranks}`);
  if (s.exec) out.push("Dégâts doublés sur une cible sous 35 % PV");
  if (s.cr) out.push(`+${s.cr} % de critique`);
  if (s.heal) out.push(`Soigne ${tg} de ${Math.round(s.heal * 100)} % de ses PV max`);
  if (s.regen) out.push(`Régénération ${Math.round(s.regen * 100)} % (2 t.) sur ${tg}`);
  if (s.shield) out.push(`Bouclier ${Math.round(s.shield * 100)} % des PV (2 t.) sur ${tg}`);
  if (s.leechLow) out.push(`Rend ${Math.round(s.leechLow * 100)} % des dégâts infligés à l'allié le plus blessé`);
  if (s.cleanse1) out.push("Purge une altération de l'allié le plus blessé");
  const fxs = (arr, pre) => { if (!arr || !arr.length) return; const tx = skillText({ t: "s", fx: arr.map(f => Object.assign({ ch: f.ch == null ? 1 : f.ch }, f)) }).replace(/<[^>]+>/g, ""); if (tx) out.push(pre + tx); };
  fxs(s.fx, t === "e" ? "Sur la cible : " : t === "ae" ? "Sur les cibles : " : "");
  fxs(s.afx, "Tout le groupe : ");
  fxs(s.lowfx, "Allié le plus blessé : ");
  if (s.morale) out.push(`+${s.morale} résolution`);
  if (s.ult) out.push(`+${s.ult} jauge d'ultime pour chaque héros`);
  if (s.light) out.push(`+${s.light} lueur`);
  return gl(out.join(" · ") + (s.every ? ` · tous les ${s.every} tours` : s.base ? " · les autres tours" : " · chaque tour"));
}
function petSheet(id, foot = "") {
  const P = PETS[id];
  modal(`<div class="row" style="gap:12px;flex-wrap:wrap"><div style="margin:0 auto">${canvasSlot("pet", 200, 150)}</div><div style="flex:1;min-width:220px"><h2 style="margin:0">${P.n}</h2><div class="row" style="gap:4px;margin:4px 0">${roleTag(P.role)}${P.gold ? `<span class="tag gold">+${Math.round(P.gold * 100)} % d'or</span>` : ""}</div><p class="lore small">${P.d}</p><p class="tiny dim">Le compagnon agit seul à la fin de chaque tour. Il gagne des niveaux avec le groupe et évolue ${P.legendary ? "grâce à ses succès légendaires" : "au niveau " + PET_EVO_LVL}.</p></div></div>
    ${P.rank > 1.001 ? `<div class="tiny gold" style="margin-top:6px">${ico("star", "#e8c878", 11)} Puissance du rang : +${Math.round((P.rank - 1) * 100)} % sur toutes ses compétences</div>` : ""}${typeof petProgressHTML === "function" ? petProgressHTML(id) : ""}<h3 style="margin-top:10px">Compétences</h3><div class="col">${P.sk.map((s, i) => `<div class="skl" style="cursor:default">${petSkIco(id, i, s, "#e8c878")}<div><b>${s.n}</b><div class="tiny">${petSkillText(Object.assign(i === 1 && !s.every ? { every: 3 } : {}, petSkScaled(s, P.rank || 1), i === 0 && P.sk[1] ? { base: 1 } : {}), id)}</div></div></div>`).join("")}</div>
    ${typeof legendPetGoalsHTML === "function" ? legendPetGoalsHTML(id) : ""}<h3 style="margin-top:10px">Évolution : ${P.evo.n}${S && typeof petEvolved === "function" && petEvolved(id) ? ' <span class="tag gold">atteinte</span>' : ""}</h3><div class="row" style="gap:10px;align-items:center">${canvasSlot("petevo", 120, 90)}<p class="tiny lore" style="flex:1">${P.evo.d}</p></div><div class="skl" style="cursor:default;border-color:#a05a2a">${petSkIco(id, 2, P.evo.sk, "#ff9a4a")}<div><b>${P.evo.sk.n}</b><div class="tiny">${petSkillText(Object.assign({ every: 2 }, petSkScaled(P.evo.sk, P.rank || 1)), id)}</div></div></div>${foot}`, { wide: 1, onClose: bldBack(), mount: m => fillCanvases(m, (c, k) => paintPet(c, id, k === "petevo" || (S && typeof petEvolved === "function" && petEvolved(id)) ? 1 : 0)) });
}
ACT.petInfo = (id, el, e) => { e && e.stopPropagation(); petSheet(id, `<div class="row" style="justify-content:flex-end;margin-top:10px"><button class="btn" data-a="bld" data-v="menagerie">Retour à la Ménagerie</button></div>`); };
ACT.recruitInfo = (i, el, e) => { e && e.stopPropagation(); const h = S.recruits[+i]; if (!h) return; const c = recruitPrice(+i); heroSheet(h, `<div class="row" style="justify-content:flex-end;gap:6px;margin-top:12px"><button class="btn ghost" data-a="bld" data-v="taverne">Retour</button><button class="btn main" data-a="recruit" data-v="${i}">Recruter · ${c === 0 ? "gratuit" : c + " or"}</button></div>`); };

ACT.heroTab = t => { UI.heroTab = t; refresh(); };

// compétences pas encore débloquées : grisées, avec le niveau requis
function lockedSkillsHTML(h) { return heroSkillLocked(h).map(([k, l]) => { const sk = skillDef(h, k) || (CLASSES[h.cls].evos[h.evo] || {}).skills[k]; if (!sk) return ""; return `<div class="skl" style="cursor:default;opacity:.5">${ico(sk.ic, "#6a5e52")}<div style="flex:1"><div class="row sp"><b>🔒 ${sk.n}</b><span class="tag">Niveau ${l}</span></div><div class="tiny">${skillText(Object.assign({ id: k }, sk), h)}</div></div></div>`; }).join(""); }
