/* ═══════════ Améliorations du 7 nov. (interface) ═══════════ */

// ══ Forge : choisir l'objet à sertir, enchanter ou graver, vu par héros (ses 4 pièces), par qualité ou dans l'inventaire ══
const GV_SLOTS = [["wpn", "Arme"], ["arm", "Armure"], ["tr1", "Bibelot"], ["tr2", "Bibelot"]];
function gearViewHTML(opt) {
  // opt : { ok(it) → true | "raison", row(it, h) → html, title }
  const V = ["hero", "rar", "inv"].includes(UI.gearView) ? UI.gearView : "hero";
  const tabs = `<div class="row" style="gap:4px;flex-wrap:wrap;margin:4px 0 8px">${[["hero", "Par héros"], ["rar", "Par qualité"], ["inv", "Inventaire"]].map(([k, n]) => `<button class="btn sm ${V === k ? "gold" : "ghost"}" data-a="gearView" data-v="${k}">${n}</button>`).join("")}</div>`;
  const okOf = it => { const r = opt.ok(it); return r === true; }, why = it => { const r = opt.ok(it); return r === true ? "" : r; };
  const dim = (it, h) => `<div class="row card" style="cursor:default;gap:10px;opacity:.55">${slotHTML(it, "itemInfo", it.id)}<div style="flex:1;min-width:150px"><b class="rar${it.rar}">${gearName(it)}</b>${h ? "" : ' <span class="tiny dim">inventaire</span>'}<div class="tiny dim">${why(it)}</div></div></div>`;
  let body = "";
  if (V === "hero") {
    const sel = UI.gearHero && heroById(UI.gearHero) ? UI.gearHero : "";
    const hs = S.heroes.filter(h => !sel || h.id === sel).filter(h => GV_SLOTS.some(([s]) => h.gear[s])).sort((a, b) => (GV_SLOTS.some(([s]) => b.gear[s] && okOf(b.gear[s])) - GV_SLOTS.some(([s]) => a.gear[s] && okOf(a.gear[s]))) || b.lvl - a.lvl);
    body = `<select class="invf" data-gvhero="1" style="margin-bottom:8px"><option value="">Tous les héros (${S.heroes.length})</option>${S.heroes.slice().sort((a, b) => b.lvl - a.lvl).map(h => `<option value="${h.id}" ${sel === h.id ? "selected" : ""}>${esc(h.name)} — ${CLASSES[h.cls].n}, niv ${h.lvl}</option>`).join("")}</select>`;
    body += hs.map(h => { const n = typeof setCount === "function" ? setCount(h) : {};
      const sets = Object.keys(n).map(k => `<span class="tag" style="color:${SETS[k].c}">❖ ${SETS[k].n} ${n[k]}/4</span>`).join("");
      return `<div class="panel" style="padding:8px;margin-bottom:8px"><div class="row sp" style="gap:6px;flex-wrap:wrap"><span>${heroLabel(h)}</span><span class="row" style="gap:4px;flex-wrap:wrap">${sets}</span></div><div class="col" style="margin-top:6px">${GV_SLOTS.map(([s, nm]) => { const it = h.gear[s];
        if (!it) return `<div class="row card" style="cursor:default;gap:10px;opacity:.45"><div class="slot">${ico("plus", "#5a4a3a")}</div><span class="tiny dim">${nm} — emplacement vide</span></div>`;
        return okOf(it) ? opt.row(it, h) : dim(it, h); }).join("")}</div></div>`; }).join("") || '<div class="empty">Aucun héros équipé.</div>';
  } else {
    const all = V === "inv" ? S.inv.map(it => ({ it, h: null })) : allGearTr();
    const L = all.filter(g => okOf(g.it)).sort((a, b) => b.it.rar - a.it.rar || (b.it.tier || 0) - (a.it.tier || 0));
    let cur = -1;
    body = L.map(({ it, h }) => { let hd = ""; if (V === "rar" && it.rar !== cur) { cur = it.rar; hd = `<h3 class="rar${it.rar}" style="margin:10px 0 4px">${RARITY[it.rar].n} <span class="tiny dim">(${L.filter(g => g.it.rar === it.rar).length})</span></h3>`; } return hd + opt.row(it, h); }).join("") || `<div class="empty">${V === "inv" ? "Rien d'éligible dans l'inventaire." : "Aucun objet éligible."}</div>`;
  }
  return tabs + `<div class="col">${body}</div>`;
}
ACT.gearView = v => { UI.gearView = v; if (UI.gearRedraw) UI.gearRedraw(); };
if (typeof document !== "undefined") document.addEventListener("change", e => { const s = e.target.closest && e.target.closest("select[data-gvhero]"); if (!s) return; UI.gearHero = s.value; if (UI.gearRedraw) UI.gearRedraw(); });
const carried = h => (UI.gearView || "hero") === "hero" && h ? "" : h ? `<span class="tiny dim">porté par ${esc(h.name.split(" ")[0])}</span>` : '<span class="tiny dim">inventaire</span>';

ACT.enchantList = () => {
  UI.gearRedraw = ACT.enchantList;
  const row = (it, h) => { const c = enchantCost(it); return `<div class="row card" style="cursor:default;gap:10px">${slotHTML(it, "itemInfo", it.id)}<div style="flex:1;min-width:150px"><b class="rar${it.rar}">${gearName(it)}</b> ${carried(h)}<div class="tiny">${it.mod && ITEM_MODS[it.mod] ? `✦ ${ITEM_MODS[it.mod].n} — ${ITEM_MODS[it.mod].d}` : "Aucun effet unique"}</div></div><button class="btn sm" data-a="enchant" data-v="${it.id}">${fmt(c.gold)} or · ${c.shards} ${ico("gem", "#9ad0ff", 12)}</button></div>`; };
  modal(`<h2>${ico("gem", "#9ad0ff")} Enchantement</h2><p class="tiny dim">Éclats : <b>${S.shards || 0}</b> · Or : <b>${fmt(S.gold)}</b> · armes et armures Épiques ou mieux.</p>${gearViewHTML({ ok: it => it.kind === "tr" ? "Les bibelots ne s'enchantent pas." : it.rar >= 3 ? true : "Épique ou mieux requis.", row })}`, { wide: 1, onClose: () => openBuilding("forge") });
};
ACT.engraveList = () => {
  UI.gearRedraw = ACT.engraveList;
  const row = (it, h) => { const c = engraveCost(it), T = it.set && SETS[it.set]; return `<div class="row card" style="cursor:default;gap:10px">${slotHTML(it, "itemInfo", it.id)}<div style="flex:1;min-width:150px"><b class="rar${it.rar}">${gearName(it)}</b> ${carried(h)}<div class="tiny">${T ? `<b style="color:${T.c}">❖ ${T.n}</b>` : '<span class="dim">Aucune panoplie</span>'}</div></div><button class="btn sm ${S.gold >= c.gold && (S.shards || 0) >= c.shards ? "gold" : "ghost off"}" data-a="engrave" data-v="${it.id}">${fmt(c.gold)} or · ${c.shards} éclats</button></div>`; };
  modal(`<h2>${ico("link", "#e8c878")} Gravure de panoplie</h2><p class="tiny dim">Éclats : <b>${S.shards || 0}</b> · Or : <b>${fmt(S.gold)}</b> · Légendaire ou mieux. Vue « Par héros » : les 4 pièces de chacun et ses panoplies en cours, pour compléter la bonne.</p>${gearViewHTML({ ok: it => it.rar >= 4 ? true : "Légendaire ou mieux requis.", row })}`, { wide: 1, onClose: () => openBuilding("forge") });
};
ACT.gemPick = (id, el, e) => { e && e.stopPropagation && e.stopPropagation(); if (!S.gems || !S.gems[id]) return; const [k, l] = id.split(":");
  UI.gearRedraw = () => ACT.gemPick(id);
  const row = (it, h) => `<div class="row card" style="gap:10px;cursor:pointer" data-a="gemPut" data-v="${it.id}|${id}">${slotHTML(it, "gemPut", it.id + "|" + id)}<div style="flex:1;min-width:150px"><b class="rar${it.rar}">${gearName(it)}</b> ${carried(h)}<div class="row" style="gap:4px;flex-wrap:wrap;margin-top:2px">${(it.gems || []).map(g => gemChip(g)).join("")}<span class="tiny dim">${(it.gems || []).length}/${sockets(it)}</span></div></div><button class="btn sm gold" data-a="gemPut" data-v="${it.id}|${id}">Sertir</button></div>`;
  modal(`<h2>${ico("gem", GEMS[k].c)} Sertir ${gemName(id)}</h2><p class="tiny dim">${GEMS[k].d(gemVal(k, +l))} · il vous en reste ${S.gems[id]}.</p>${gearViewHTML({ ok: it => it.kind === "tr" ? "Les bibelots n'ont pas d'emplacement." : !sockets(it) ? "Mythique ou mieux requis." : (it.gems || []).length >= sockets(it) ? "Emplacements pleins." : true, row })}<button class="btn ghost sm" style="margin-top:8px" data-a="gemBack">Retour aux gemmes</button>`, { wide: 1 }); };

// ══ Recyclage rapide : intitulé ══
{ const sa0 = ACT.salvAll; ACT.salvAll = () => { sa0(); const fix = () => { const k = document.querySelector("#salvkeep"); if (k) { const sp = k.closest("label").querySelector("span"); sp.innerHTML = 'Conserver le meilleur équipement <span class="tiny dim">— tout objet qui ferait mieux que celui que porte un de vos héros capable de l\'équiper reste à l\'inventaire</span>'; } const p = [...document.querySelectorAll("#modal p.tiny.dim")].find(x => /épargnés/.test(x.textContent)); if (p && k && k.checked) p.textContent = "Sont épargnés : les objets verrouillés 🔒 et le meilleur équipement de vos héros."; };
    fix(); const M = $("#modal"); if (M && !M._salvObs) { M._salvObs = new MutationObserver(() => { if (M.querySelector("#salvkeep") && !/Conserver/.test(M.querySelector("#salvkeep").closest("label").textContent)) fix(); }); M._salvObs.observe(M, { childList: true, subtree: true }); } }; }

// ══ Combat ══
// 1 · vitesse ×1 / ×2 / ×4
ACT.cbSpeed = () => { CB.speed = CB.speed >= 4 ? 1 : CB.speed >= 2 ? 4 : 2; S.opts.speed = CB.speed; save(); const b = $("#cb-spd"); if (b) b.textContent = "×" + CB.speed; };
// 3 · rejouer la dernière action du héros (même compétence, même cible si elle est encore valable)
{ const ch0 = choose; choose = function (a) { const u = CB.actor; if (a && a.sk && u && u.side === "h") (CB.last = CB.last || {})[u.uid] = { id: a.sk.id, tgt: a.tgt ? a.tgt.uid : null }; return ch0.apply(this, arguments); }; }
ACT.cbReplay = () => { const u = CB.actor, L = u && CB.last && CB.last[u.uid]; if (!u || !L || !CB.resolve) return; const sk = L.id === "ult" ? u.ult : u.skills.find(s => s.id === L.id); if (!sk || !canUse(CB.B, u, sk)) return toast("Cette compétence n'est pas disponible.", "bad");
  const tg = validTargets(CB.B, u, sk), t = ["aa", "ae", "s"].includes(sk.t || "e") ? null : (tg.find(x => x.uid === L.tgt) || tg.find(x => x.side === "e" && x.hp === Math.min(...tg.filter(y => y.side === "e").map(y => y.hp))) || tg[0]);
  choose({ sk, tgt: t }); };
{ const cb0 = cbBar; cbBar = function (u) { cb0.apply(this, arguments); const box = $("#cb-skills"); if (!u || !box) return; const L = CB.last && CB.last[u.uid]; if (!L) return; const sk = L.id === "ult" ? u.ult : u.skills.find(s => s.id === L.id); if (!sk) return;
    box.insertAdjacentHTML("beforeend", `<button class="sk sec ${canUse(CB.B, u, sk) ? "" : "no"}" data-a="cbReplay" title="Rejouer : ${esc(sk.n)}">${ico("swap", "#e8c878")}<span>Rejouer</span></button>`); }; }
// 2 · cibler en glissant la compétence sur l'ennemi
if (typeof document !== "undefined") {
  let D = null;
  document.addEventListener("pointerdown", e => { const b = e.target.closest && e.target.closest("#cb-skills .sk[data-a=cbSk]"); D = b ? { id: b.dataset.v, x: e.clientX, y: e.clientY } : null; }, true);
  document.addEventListener("pointerup", e => { if (!D) return; const d = D; D = null; if (Math.hypot(e.clientX - d.x, e.clientY - d.y) < 30 || !CB.B || !CB.resolve) return;
    ACT.cbSk(d.id); const u = typeof unitAt === "function" ? unitAt(e.clientX, e.clientY) : null; if (u && CB.sel && CB.sel.tg.includes(u)) choose({ sk: CB.sel.sk, tgt: u }); }, true);
}
// 4 · danger : le héros qu'une intention ennemie peut abattre ce tour-ci est cerclé de rouge
function dangerOf(B, h) {
  if (!B || h.side !== "h" || !alive(h)) return false; let sum = 0; const r = rankOf(B, h);
  for (const e of B.enemies) { if (!alive(e) || !e.intent || !e.intent.sk) continue; const sk = e.intent.sk, t = sk.t || "e"; if (!(sk.m > 0)) continue;
    const hits = t === "ae" ? (sk.at || [1, 2, 3, 4]).includes(r) : e.intent.tgt === h.uid; if (hits) sum += (e.dmgHi || 0) * sk.m * (1 - (h.prot || 0)); }
  return sum >= h.hp;
}
{ const du0 = drawUnitUI; drawUnitUI = function (x, u, v, t) { du0.apply(this, arguments); try { if (u.side === "h" && !u.agony && CB.B && dangerOf(CB.B, u)) { const pk = .5 + Math.sin(t * 6) * .5; glow(x, v.x, v.y - 60 * CB.scale, 70 * CB.scale, "#ff1a1a", .16 + pk * .18); x.save(); x.font = `700 ${Math.round(16 * CB.scale)}px serif`; x.textAlign = "center"; x.fillStyle = "#ff4a3a"; x.fillText("☠", v.x + 42 * CB.scale, v.y - 150 * CB.scale); x.restore(); } } catch (e) { } }; }
// 5 · priorités du combat automatique, propres à chaque héros
const AI_PRI = { def: "Équilibrée", heal50: "Soigne dès qu'un allié passe sous 50 %", ultBoss: "Garde l'ultime pour les élites et gardiens", focusHeal: "Vise d'abord les soigneurs ennemis", focusLow: "Achève les ennemis blessés" };
{ const ac0 = autoChoice; autoChoice = function (u) { const h = heroById(u.hid), P = h && h.aiPri; const B = CB.B; if (!P || P === "def" || !B) return ac0.apply(this, arguments);
    if (P === "ultBoss" && u.ultV >= 100 && !B.enemies.some(e => alive(e) && (e.boss || e.elite))) { const k = u.ultV; u.ultV = 99; const a = ac0.apply(this, arguments); u.ultV = k; return a; }
    const a = ac0.apply(this, arguments);
    if (P === "heal50") { const low = B.heroes.filter(x => alive(x) && x.hp / x.hpMax < .5).sort((p, q) => p.hp / p.hpMax - q.hp / q.hpMax)[0]; if (low && !(a.sk && a.sk.heal)) { const sk = u.skills.find(s => s.heal && canUse(B, u, s)); if (sk) { const tg = validTargets(B, u, sk); if (["aa", "s"].includes(sk.t)) return { sk, tgt: null }; if (tg.includes(low)) return { sk, tgt: low }; } } }
    if ((P === "focusHeal" || P === "focusLow") && a.sk && a.tgt && a.tgt.side === "e") { const tg = validTargets(B, u, a.sk).filter(x => x.side === "e" && alive(x)); let best = null;
      if (P === "focusHeal") best = tg.find(x => (MONSTERS[x.key] && MONSTERS[x.key].sk || []).some(s => s.heal || s.t === "a" || s.t === "aa"));
      if (!best || P === "focusLow") best = P === "focusLow" ? tg.sort((p, q) => p.hp / p.hpMax - q.hp / q.hpMax)[0] : best;
      if (best) return Object.assign({}, a, { tgt: best }); }
    return a; }; }
ACT.aiPri = v => { const [id, k] = v.split("|"), h = heroById(id); if (!h) return; h.aiPri = k; save(); toast(`${esc(h.name.split(" ")[0])} : ${AI_PRI[k]}`); refresh(); };
{ const hp2 = talentsHTML; talentsHTML = h => { let out = hp2(h); if (!S || !h || !S.heroes.includes(h)) return out; const cur = h.aiPri || "def";
    return out + `<div class="panel" style="padding:10px;margin-top:10px"><div class="tiny" style="margin:6px 0 2px"><b>Combat automatique</b> — priorité :</div><div class="row" style="gap:4px;flex-wrap:wrap">${Object.entries(AI_PRI).map(([k, n]) => `<button class="btn sm ${cur === k ? "gold" : "ghost"}" data-a="aiPri" data-v="${h.id}|${k}" title="${n}">${k === "def" ? "Équilibrée" : k === "heal50" ? "Soins < 50 %" : k === "ultBoss" ? "Ultime : gardiens" : k === "focusHeal" ? "Vise soigneurs" : "Achève"}</button>`).join("")}</div><div class="tiny dim" style="margin-top:4px">${AI_PRI[cur]}</div></div>`; }; }

// ══ Confort ══
// 6 · appui long sur un objet : comparaison avec ce que portent les héros capables de l'équiper
{ const sl0 = slotHTML; slotHTML = function (it) { const h = sl0.apply(this, arguments); return it && it.id ? h.replace('<div class="slot', `<div data-iid="${it.id}" class="slot`) : h; }; }
ACT.cmpItem = id => { const it = findItem(id); if (!it) return; const hs = S.heroes.filter(h => canEquip(h, it) && !Object.values(h.gear).includes(it)).map(h => ({ h, D: gearDelta(h, it) })).sort((a, b) => b.D.score - a.D.score).slice(0, 10);
  const wearer = S.heroes.find(h => Object.values(h.gear).includes(it));
  modal(`<h2>${ico("swap", "#e8c878")} Comparer</h2><div class="row" style="gap:10px;margin-bottom:8px">${slotHTML(it, "itemInfo", it.id)}<div><b class="rar${it.rar}">${gearName(it)}</b><div class="tiny">${itemLine(it)}</div>${wearer ? `<div class="tiny dim">porté par ${esc(wearer.name)}</div>` : ""}</div></div>
    <div class="col">${hs.map(({ h, D }) => `<div class="card" style="cursor:default"><div class="row sp">${heroLabel(h)}${D.old ? `<span class="tiny dim">remplace ${gearName(D.old)}</span>` : '<span class="tiny good">emplacement libre</span>'}</div><div class="row" style="gap:4px;flex-wrap:wrap;margin-top:4px">${deltaChips(D)}</div>${!wearer && S.inv.includes(it) && !(D.old && D.old.lock) ? `<button class="btn sm ${D.score > 0 ? "gold" : "ghost"}" style="margin-top:6px" data-a="cmpEquip" data-v="${h.id}|${it.id}">Équiper sur ${esc(h.name.split(" ")[0])}</button>` : ""}</div>`).join("") || '<div class="empty">Aucun héros ne peut porter cet objet.</div>'}</div>`, { wide: 1 }); };
ACT.cmpEquip = v => { const [hid, iid] = v.split("|"), h = heroById(hid), it = findItem(iid); if (!h || !it) return; if (equip(h, it)) { save(); toast(`${esc(h.name.split(" ")[0])} ← ${gearName(it)}`, "good"); closeModal(); refresh(); } };
if (typeof document !== "undefined") {
  let T = null, swallow = 0;
  document.addEventListener("pointerdown", e => { const s = e.target.closest && e.target.closest("[data-iid]"); clearTimeout(T); if (!s) return; const id = s.dataset.iid, x0 = e.clientX, y0 = e.clientY; T = setTimeout(() => { swallow = Date.now(); buzz && buzz(20); ACT.cmpItem(id); }, 480); s._lp = { x0, y0 }; }, true);
  document.addEventListener("pointermove", e => { if (T && e.target.closest && e.target.closest("[data-iid]")) { const s = e.target.closest("[data-iid]"); if (s._lp && Math.hypot(e.clientX - s._lp.x0, e.clientY - s._lp.y0) > 12) clearTimeout(T); } }, true);
  document.addEventListener("pointerup", () => clearTimeout(T), true);
  document.addEventListener("click", e => { if (Date.now() - swallow < 600) { e.stopPropagation(); e.preventDefault(); swallow = 0; } }, true);
  document.addEventListener("contextmenu", e => { if (e.target.closest && e.target.closest("[data-iid]")) e.preventDefault(); }, true);
}
// 7 · Forge : tout améliorer ; 16 · fusion de bibelots
{ const eb1 = enchantBarHTML; enchantBarHTML = () => { const fuse = [...Array(RARITY.length - 1).keys()].filter(q => trFuseCands(q).length >= 3);
    return eb1() + `<div class="row sp card" style="cursor:default;margin-bottom:8px;border-color:#ffd27a55"><span class="small">${ico("up", "#ffd27a", 16)} <b>Tout améliorer</b> <span class="tiny dim">— améliore les armes et armures portées par la compagnie, des moins chères aux plus chères, dans la limite du budget.</span></span><span class="row" style="gap:4px">${[25, 50, 100].map(p => `<button class="btn sm" data-a="upAll" data-v="${p}">${p} %</button>`).join("")}</span></div>`
      + `<div class="row sp card" style="cursor:default;margin-bottom:8px;border-color:#c090ff55"><span class="small">${ico("gem", "#c090ff", 16)} <b>Fusion de bibelots</b> <span class="tiny dim">— trois bibelots de la même qualité (non verrouillés, à l'inventaire) donnent un bibelot d'une qualité au-dessus.</span></span><span class="row" style="gap:4px;flex-wrap:wrap">${fuse.map(q => `<button class="btn sm" data-a="trFuse" data-v="${q}"><span class="rar${q}">${RARITY[q].n}</span> → <span class="rar${q + 1}">${RARITY[q + 1].n}</span> (${Math.floor(trFuseCands(q).length / 3)})</button>`).join("") || '<span class="tiny dim">Aucun trio disponible.</span>'}</span></div>`; }; }
ACT.upAll = p => { const b = Math.floor(S.gold * +p / 100); confirmBox(`Dépenser jusqu'à <b class="gold">${fmt(b)} or</b> pour améliorer l'équipement porté ?`, () => { const r = upgradeAllWorn(b); save(); renderHud(); sfx("forge"); toast(r.n ? `${r.n} amélioration${r.n > 1 ? "s" : ""} pour ${fmt(r.spent)} or.` : "Rien à améliorer dans ce budget.", r.n ? "good" : ""); openBuilding("forge"); }, { yes: "Améliorer" }); };
ACT.trFuse = q => { q = +q; const L = trFuseCands(q).slice(0, 3); if (L.length < 3) return; confirmBox(`Fondre <b>${L.map(it => `<span class="rar${q}">${gearName(it)}</span>`).join(", ")}</b> en un bibelot <b class="rar${q + 1}">${RARITY[q + 1].n}</b> ?`, () => { const it = trFuse(q); if (!it) return; save(); sfx("forge"); toast(`Nouveau bibelot : <b class="rar${it.rar}">${gearName(it)}</b>`, "good"); openBuilding("forge"); }, { yes: "Fondre" }); };
// 8 · notifications : série terminée, défis du jour renouvelés
{ const sr0 = seriesReport; seriesReport = function (rep, why) { const r = sr0.apply(this, arguments); try { gameNotify("Série terminée", String(why || "Votre série d'expéditions est finie.").replace(/<[^>]+>/g, "")); } catch (e) { } return r; }; }
{ const nt0 = notifyTick; notifyTick = function () { nt0.apply(this, arguments); try { const N = UI.notes || (UI.notes = {}), d = new Date().toDateString(); if (N.chal && N.chal !== d) gameNotify("Nouveaux défis du jour", "Les défis et l'expédition du jour sont renouvelés."); N.chal = d; } catch (e) { } }; }
// 9 · recherche dans l'inventaire (nom, effet, panoplie)
{ const fb0 = invFilterBar; invFilterBar = function () { const q = (UI.invF && UI.invF.q) || ""; return fb0.apply(this, arguments) + `<input type="search" class="invq" placeholder="Rechercher : nom, effet, panoplie…" value="${esc(q)}" style="width:100%;margin:4px 0 8px;padding:6px 8px;background:#1a1410;color:#e8d8b8;border:1px solid #4a3a2a;border-radius:6px">`; }; }
{ const ff0 = invFilterFn; invFilterFn = function () { const f = ff0.apply(this, arguments), q = ((UI.invF && UI.invF.q) || "").trim().toLowerCase(); if (!q) return f; const norm = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""), nq = norm(q);
    return it => f(it) && norm(gearName(it) + " " + String(itemLine(it)).replace(/<[^>]+>/g, " ") + " " + (it.set && SETS[it.set] ? SETS[it.set].n : "") + " " + RARITY[it.rar].n).includes(nq); }; }
if (typeof document !== "undefined") { let qt = null; document.addEventListener("input", e => { const s = e.target.closest && e.target.closest("input.invq"); if (!s) return; clearTimeout(qt); qt = setTimeout(() => { UI.invF = UI.invF || {}; UI.invF.q = s.value; const pos = s.selectionStart; openBuilding("forge", "inv"); const n = document.querySelector("input.invq"); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) { } } }, 350); }); }
// 10 · tri des héros
const HERO_SORTS = { lvl: ["Niveau", (a, b) => b.lvl - a.lvl || a.cls.localeCompare(b.cls)], pow: ["Puissance", (a, b) => heroPower(b) - heroPower(a)], stress: ["Stress", (a, b) => (b.stress || 0) - (a.stress || 0)], hurt: ["Blessures", (a, b) => (isInjured(b) - isInjured(a)) || (a.hp == null ? 1 : a.hp / heroStats(a).hp) - (b.hp == null ? 1 : b.hp / heroStats(b).hp)], cls: ["Classe", (a, b) => a.cls.localeCompare(b.cls) || b.lvl - a.lvl] };
function heroSortFn() { return (HERO_SORTS[UI.heroSort] || HERO_SORTS.lvl)[1]; }
ACT.heroSort = k => { UI.heroSort = k; refresh(); };
{ const hh0 = SCREENS.heroes.html; SCREENS.heroes.html = () => { let h = hh0(); const k = HERO_SORTS[UI.heroSort] ? UI.heroSort : "lvl";
    h = h.replace('<div class="grid" style="--min:250px">', `<div class="row" style="gap:4px;margin:0 0 8px;flex-wrap:wrap"><span class="tiny dim" style="align-self:center">Trier :</span>${Object.entries(HERO_SORTS).map(([q, [n]]) => `<button class="btn sm ${k === q ? "gold" : "ghost"}" data-a="heroSort" data-v="${q}">${n}</button>`).join("")}</div><div class="grid" style="--min:250px">`);
    const B = cosmOf("banner"), F = cosmOf("frame"); h = h.replace("<h1>La Compagnie</h1>", `<h1><span style="color:${B[2]}">⚑</span> La Compagnie <span class="tag" style="color:${B[2]}">Rang ${roman(compRank() || 0) || "0"}</span></h1>`);
    if (F[0] > 0) h = h.replace(/<div class="card" data-go="hero"/g, `<div class="card" style="border-color:${F[2]};box-shadow:0 0 0 1px ${F[2]}55 inset" data-go="hero"`);
    return h; }; }

// ══ Contenu : expéditions spéciales (préparation) ══
function specialHTML(E) {
  if (E.rush || E.daily) return "";
  let out = "";
  if (E.region !== "abime") { const keys = Object.keys(SETS), k = E.setRun && SETS[E.setRun] ? E.setRun : null;
    out += `<div class="row" style="margin-top:6px;gap:6px;flex-wrap:wrap"><button class="btn sm ${k ? "gold" : "ghost"}" data-a="setRunCycle">${ico("link", k ? SETS[k].c : "#9a8c7a", 14)}${k ? SETS[k].n : "Expédition de panoplie"}</button><span class="tiny dim">${k ? "Gardien : une pièce garantie de cette panoplie (Légendaire ou mieux), élites 30 %. Ennemis +15 % PV." : "Touchez pour choisir la panoplie traquée."}</span></div>`; }
  if (raidOpen()) { const R = raidState(); if (R) { const M = MONSTERS[R.key];
    out += `<div class="row" style="margin-top:6px;gap:6px;flex-wrap:wrap"><button class="btn sm ${E.special === "raid" ? "gold" : "ghost"}" data-a="specialSet" data-v="raid">${ico("skull", "#ff6a4a", 14)}Raid : ${esc(M.n)}</button><span class="tiny dim">PV ×${RAID_HP}, entamés d'un assaut à l'autre : <b>${Math.round(R.frac * 100)} %</b> restants. ${RAID_ROUNDS} tours par assaut. Abattu : objet Mythique+, 10 éclats.${R.n ? ` (${R.n} abattu${R.n > 1 ? "s" : ""})` : ""}</span></div>`; } }
  const G = echoGraves(); if (G.length) out += `<div class="row" style="margin-top:6px;gap:6px;flex-wrap:wrap"><button class="btn sm ${E.special === "arena" ? "gold" : "ghost"}" data-a="specialSet" data-v="arena">${ico("ghost", "#9ad0ff", 14)}Arène des échos</button><span class="tiny dim">Un seul combat contre les ombres de ${Math.min(4, G.length)} héros tombés au Mémorial. Éclats et or.</span></div>`;
  return out;
}
{ const ntx = nightToggleHTML; nightToggleHTML = E => ntx(E) + specialHTML(E); }
ACT.setRunCycle = () => { const E = UI.expe, ks = [null, ...Object.keys(SETS)], i = ks.indexOf(E.setRun || null); E.setRun = ks[(i + 1) % ks.length]; refresh(); };
ACT.specialSet = v => { const E = UI.expe; E.special = E.special === v ? null : v; refresh(); };
function specialStart(kind) {
  const E = UI.expe, reg = [...REGIONS].reverse().find(r => S.prog[r.id] && S.prog[r.id].clears) || REGIONS[0];
  startRun(reg.id, E.party, E.pet, {}); const run = S.run, lvl = Math.max(...run.party.map(id => (heroById(id) || { lvl: 1 }).lvl));
  const enc = kind === "raid" ? [{ key: raidState().key, lvl: lvl + 3 }] : echoEncounter(lvl);
  run.map = [[{ c: 0, i: 0, type: "elite", links: [], done: false, x: .5, enc }]]; if (kind === "arena") { run.echoDefs = {}; for (const e of enc) run.echoDefs[e.key] = MONSTERS[e.key]; } run.light = 100; run[kind] = 1; run.special = kind;
  E.special = null; save(); sfx("door"); musicPlay("map"); go("map");
  toast(kind === "raid" ? `Raid : ${MONSTERS[enc[0].key].n} vous attend (${RAID_ROUNDS} tours).` : "L'Arène des échos s'ouvre.", "good");
}
{ const L1 = ACT.launch; ACT.launch = (...a) => { const E = UI.expe;
    if (!S.run && E && E.special && E.party.length && !E.rush && !E.daily) { if (E.special === "raid" && !raidState()) return toast("Aucun gardien pour le raid.", "bad"); if (E.special === "arena" && !echoGraves().length) return toast("Le Mémorial est vide.", "bad"); return specialStart(E.special); }
    // 14 · Abîme : choisir une mutation avant de descendre (hors séries)
    if (!S.run && E && E.region === "abime" && !S.repeat && !E._mutOk && E.party.length) { const C = mutChoices();
      return modal(`<h2>${ico("skull", "#c090ff")} Mutation de l'Abîme</h2><p class="small">Choisissez une règle pour cette descente : plus de risque, plus de récompense.</p><div class="col">${C.map(k => { const M = MUTATIONS[k]; return `<button class="choice" data-a="mutPick" data-v="${k}"><b>${M.n}</b><div class="tiny"><span class="bad">${M.d}</span> · <span class="good">${M.r}</span></div></button>`; }).join("")}<button class="choice" data-a="mutPick" data-v=""><b>Aucune mutation</b><div class="tiny dim">Descente normale.</div></button></div>`); }
    const had = !!S.run; L1(...a); if (!had && S.run) { if (E.setRun && S.run.region !== "abime" && !S.run.rush && !S.run.daily) S.run.setRun = E.setRun; if (E._mut) { const M = MUTATIONS[E._mut]; S.run.mut = E._mut; if (M.nopot) S.run.potions = 0; if (M.light) S.run.light = clamp(S.run.light + M.light, 0, 100); } E._mut = null; E._mutOk = 0; save(); } }; }
ACT.mutPick = k => { const E = UI.expe; E._mut = k || null; E._mutOk = 1; closeModal(); ACT.launch(); };
// raid : 10 tours par assaut, PV du colosse conservés ; arène et raid : retour au Bastion une fois la salle faite
{ const ce0 = combatEnd; combatEnd = async function (over) { const B = CB.B, run = S.run;
    if (B && run && run.raid && S.raid) { const e = [...B.enemies, ...(B.dead || [])].find(x => x.raid) || B.enemies.find(x => x.raid);
      if (over === "win") { run.raidWin = 1; raidWin(); toast(`${ico("skull", "#ff6a4a", 14)} Le colosse du raid est abattu !`, "epic"); }
      else if (e) { const f0 = S.raid.frac, f1 = clamp(e.hp / e.hpMax, .01, 1); S.raid.frac = f1; S.raid.tries = (S.raid.tries || 0) + 1; const g = Math.round((f0 - f1) * 4000 * (1 + (e.lvl || 1) / 10)); if (g > 0) { S.gold += g; toast(`Raid : ${Math.round((f0 - f1) * 100)} % des PV arrachés, +${fmt(g)} or. Il reste ${Math.round(f1 * 100)} %.`, "good"); } } }
    return ce0.apply(this, arguments); }; }
{ const tl0 = cbTopLeft; cbTopLeft = function () { tl0.apply(this, arguments); const B = CB.B; if (B && B.raid && !B._raidOut && B.round > RAID_ROUNDS) { B._raidOut = 1; toast(`Le colosse se retire après ${RAID_ROUNDS} tours.`, "bad"); setTimeout(() => { if (CB.B === B) combatEnd("flee"); }, 400); } }; }
if (typeof setInterval !== "undefined") setInterval(() => { try { const r = S && S.run; if (r && r.special && !CB.B && UI.screen === "map" && $("#modal").hidden && r.map.flat().every(n => n.done)) finishRun("retreat"); } catch (e) { } }, 1000);

// ══ Progression ══
// 17 · spécialisation d'objet à +15 (fiche d'objet)
{ const ii1 = ACT.itemInfo; ACT.itemInfo = id => { ii1(id); const it = findItem(id), box = $("#modal .box"); if (!it || !box || $("#modal").hidden) return; trScan();
    if (it.spec && ITEM_SPECS[it.kind] && ITEM_SPECS[it.kind][it.spec]) { const P = ITEM_SPECS[it.kind][it.spec]; box.insertAdjacentHTML("beforeend", `<p class="small" style="margin-top:8px"><b class="gold">◆ ${P.n}</b> — ${P.d}</p>`); }
    else if (it.kind === "wpn" || it.kind === "arm") box.insertAdjacentHTML("beforeend", itemSpecOk(it) ? `<div class="panel" style="padding:8px;margin-top:8px"><b class="gold">◆ Spécialisation</b> <span class="tiny dim">(définitive)</span><div class="col" style="margin-top:6px">${Object.entries(ITEM_SPECS[it.kind]).map(([k, P]) => `<button class="choice" data-a="itemSpec" data-v="${it.id}|${k}"><b>${P.n}</b><div class="tiny">${P.d}</div></button>`).join("")}</div></div>` : `<p class="tiny dim" style="margin-top:8px">◆ Spécialisation à +${SPEC_UP} : ${Object.values(ITEM_SPECS[it.kind]).map(P => P.n).join(" ou ")}.</p>`); }; }
ACT.itemSpec = v => { const [id, k] = v.split("|"), it = findItem(id); if (!itemSpec(it, k)) return toast("Impossible.", "bad"); save(); sfx("forge"); toast(`${gearName(it)} : ◆ ${ITEM_SPECS[it.kind][k].n}`, "good"); ACT.itemInfo(id); };
// 18 · codex des bibelots ; 19 · rang de compagnie (Archives)
function trCodexHTML() { trScan(); const T = trSeen(), keys = Object.keys(TRINKETS).filter(k => !TRINKETS[k].uniq).sort((a, b) => TRINKETS[a].r - TRINKETS[b].r || TRINKETS[a].n.localeCompare(TRINKETS[b].n)), n = keys.filter(k => T[k]).length, b = trCodexBonus();
  return `<p class="small dim">${n}/${keys.length} bibelots trouvés. Tous les 10 : +1 % de dégâts et de PV pour toute la compagnie (actuellement <b class="good">+${b} %</b>).</p><div class="grid" style="--min:220px">${keys.map(k => { const D = TRINKETS[k], got = T[k]; return `<div class="card" style="cursor:default;${got ? "" : "opacity:.45"}"><b class="rar${D.r}">${got ? D.n : "???"}</b> <span class="tiny dim">${RARITY[D.r].n}</span><div class="tiny">${got ? gl(D.d) : "Pas encore trouvé."}</div></div>`; }).join("")}</div>`; }
function rankHTML() { const r = compRank(), p = compPts(), nx = compNext(), C = S.cosm || {};
  const row = (kind, nm) => `<div class="small" style="margin:8px 0 4px"><b>${nm}</b></div><div class="row" style="gap:4px;flex-wrap:wrap">${COSM[kind].map(([lv, n, c], i) => { const ok = lv <= r, on = (C[kind] || 0) === i; return `<button class="btn sm ${on ? "gold" : "ghost"} ${ok ? "" : "off"}" data-a="cosm" data-v="${kind}|${i}" ${ok ? "" : "disabled"}>${c ? `<span style="color:${c}">■</span> ` : ""}${n}${ok ? "" : ` <span class="tiny">(rang ${lv})</span>`}</button>`; }).join("")}</div>`;
  return `<p class="small">Rang de compagnie <b class="gold">${roman(r) || "0"}</b> — ${fmt(p)} points (prochain rang à ${fmt(nx)}).</p><p class="tiny dim">Points : 25 par gardien différent vaincu, 15 par succès, 2 par niveau de héros, 3 par expédition, 200 par cycle.</p>${row("banner", "Bannière (Compagnie)")}${row("frame", "Cadre des portraits")}${row("tint", "Lueur du Bastion")}`; }
ACT.cosm = v => { const [k, i] = v.split("|"); S.cosm = S.cosm || {}; if (COSM[k][+i][0] > compRank()) return; S.cosm[k] = +i; save(); refresh(); };
{ const ch2 = SCREENS.codex.html; SCREENS.codex.html = () => { let h = ch2(); const a = UI.codexTab === "bibelots", b = UI.codexTab === "rang";
    h = h.replace('<div class="tabs">', `<div class="tabs"><button class="btn sm ${a ? "on" : ""}" data-a="codexTab" data-v="bibelots">${ico("gem")}Bibelots</button><button class="btn sm ${b ? "on" : ""}" data-a="codexTab" data-v="rang">${ico("banner")}Rang</button>`);
    if (a || b) { const i = h.lastIndexOf("</div>"); h = h.slice(0, i) + (a ? trCodexHTML() : rankHTML()) + h.slice(i); } return h; }; }
// lueur du Bastion (voile coloré par-dessus le décor, sans filtre sur l'illustration)
{ const bh0 = SCREENS.bastion.html; SCREENS.bastion.html = (...a) => { const h = bh0(...a), T = cosmOf("tint"); return T[2] ? `<div style="position:fixed;inset:0;pointer-events:none;z-index:0;background:radial-gradient(ellipse at 50% 70%, ${T[2]}22, transparent 70%)"></div>` + h : h; }; }
// le codex des bibelots se remplit au retour d'expédition
{ const er0 = endRun; endRun = function () { try { trScan(); const sm = S.seen && S.seen.monsters; if (sm) for (const k in sm) if (/^echo_/.test(k)) delete sm[k]; } catch (e) { } return er0.apply(this, arguments); }; }
