/* Lot 2 (11 nov.) : lecture rapide des tomes, tomes de compagnon, gemmes classées par pierre + tout fondre,
   fusion de bibelots par qualité en une fois, chance et dégâts critiques séparés dans les stats. */

// ── Tomes d'expérience : lecture rapide (tous ceux utiles d'un coup) ──
function tomeLevelCost(h) { return Math.max(0, tomeCap() - h.lvl); }
ACT.readTomeAll = id => { const h = heroById(id); if (!h || !(S.tomes > 0)) return; let n = 0; while (S.tomes > 0 && h.lvl < tomeCap()) { const lv = h.lvl; ACT._tomeQuiet = 1; S.tomes--; const need = xpNeed(h.lvl) - h.xp; giveXp(h, Math.max(1, Math.ceil(need / Math.max(.5, 1 + heroPassives(h).filter(p => p.k === "xp").reduce((a, p) => a + p.v, 0))))); n++; if (h.lvl === lv) break; }
  ACT._tomeQuiet = 0; if (!n) return toast("Ce héros est déjà parmi les plus aguerris.", "bad"); sfx("level"); toast(`${esc(h.name)} lit ${n} tome${n > 1 ? "s" : ""} et passe niveau ${h.lvl}.`, "good"); save(); refresh(); };
{ const th = tomeHTML; tomeHTML = function (h) { const s = th.apply(this, arguments); if (!s) return s; const n = Math.min(S.tomes || 0, tomeLevelCost(h)); return n > 1 ? s.replace(/(<button class="btn sm [^"]*" data-a="readTome" data-v="[^"]*">Lire<\/button>)/, `<span class="row" style="gap:4px">$1<button class="btn sm gold" data-a="readTomeAll" data-v="${h.id}">Lecture rapide ×${n}</button></span>`) : s; }; }

// ── Tomes de compagnon : trouvés avec les tomes de héros, un tome = un niveau ──
{ const gr = grantReward; grantReward = function (run, R) { const r = gr.apply(this, arguments); if (R && R.tome) S.ptomes = (S.ptomes || 0) + R.tome; return r; }; }
function petTomeCap() { return Math.max(...S.pets.owned.map(petLvl)); }
function petTomeHTML(id) {
  if (!S) return ""; const n = S.ptomes || 0; if (!n || !S.pets.owned.includes(id)) return ""; const ok = petLvl(id) < petTomeCap(), q = Math.min(n, petTomeCap() - petLvl(id));
  return `<div class="panel" style="padding:10px;margin-top:10px"><div class="row sp"><div><b>${ico("book", "#c8a0ff", 14)} Tomes de compagnon : ${n}</b><div class="tiny dim">${ok ? `Un tome fait gagner un niveau, jusqu'au niveau ${petTomeCap()} (votre compagnon le plus aguerri).` : "Réservés aux compagnons d'un niveau inférieur au plus aguerri."}</div></div><span class="row" style="gap:4px"><button class="btn sm ${ok ? "gold" : "off"}" data-a="readPetTome" data-v="${id}">Lire</button>${ok && q > 1 ? `<button class="btn sm gold" data-a="readPetTomeAll" data-v="${id}">Lecture rapide ×${q}</button>` : ""}</span></div></div>`;
}
function petReadOne(id) { if (!(S.ptomes > 0) || petLvl(id) >= petTomeCap()) return false; S.ptomes--; const need = petXpNeed(petLvl(id)) - (S.pets.xp[id] || 0); S.pets.xp[id] = (S.pets.xp[id] || 0) + need; givePetXp(id, 0); return true; }
ACT.readPetTome = id => { if (!petReadOne(id)) return toast("Ce compagnon est déjà parmi les plus aguerris.", "bad"); sfx("level"); toast(`${petName(id)} passe niveau ${petLvl(id)}.`, "good"); save(); refresh(); if (!$("#modal").hidden) petSheet(id); };
ACT.readPetTomeAll = id => { let n = 0; while (petReadOne(id)) n++; if (!n) return toast("Ce compagnon est déjà parmi les plus aguerris.", "bad"); sfx("level"); toast(`${petName(id)} lit ${n} tome${n > 1 ? "s" : ""} et passe niveau ${petLvl(id)}.`, "good"); save(); refresh(); if (!$("#modal").hidden) petSheet(id); };
{ const pp = petProgressHTML; petProgressHTML = function (id) { return pp.apply(this, arguments) + petTomeHTML(id); }; }

// ── Gemmes : classées par pierre, « Tout fondre » ──
function gemFuseAll() { let n = 0, go = true; while (go) { go = false; for (const id of Object.keys(S.gems || {}).sort((a, b) => +a.split(":")[1] - +b.split(":")[1])) while ((S.gems[id] || 0) >= 3 && +id.split(":")[1] < GEM_MAX) { gemFuse(id); n++; go = true; } } return n; }
ACT.gemFuseAll = () => { const n = gemFuseAll(); if (!n) return toast("Aucune fusion possible (il faut trois gemmes identiques).", "bad"); sfx("forge"); toast(`${n} fusion${n > 1 ? "s" : ""} de gemmes.`, "good"); save(); openBuilding("forge", "gems"); };
{ const gt = gemsTabHTML; gemsTabHTML = function () { let h = gt.apply(this, arguments); const i = h.indexOf('<div class="col">'), j = i < 0 ? -1 : h.indexOf("</div>", h.lastIndexOf('data-a="gemFuse"'));
    const can = Object.entries(S.gems || {}).some(([id, n]) => n >= 3 && +id.split(":")[1] < GEM_MAX);
    const bar = `<div class="row sp card" style="cursor:default;margin-bottom:8px"><span class="small">${ico("gem", "#c090ff", 16)} <b>Fusion</b> <span class="tiny dim">— trois gemmes identiques → une du niveau supérieur (jusqu'au niveau ${GEM_MAX}).</span></span><button class="btn sm ${can ? "gold" : "ghost off"}" data-a="gemFuseAll">Fusionner</button></div>`;
    if (i < 0) return bar + h;
    // regroupe la liste par pierre
    const G = Object.entries(S.gems || {}), nT = gemTargets().length, rows = id => { const n = S.gems[id], [k, l] = id.split(":"); return `<div class="row card" style="gap:8px;cursor:pointer" data-a="gemPick" data-v="${id}">${gemChip(id, n)}<span class="tiny dim" style="flex:1">${GEMS[k].d(gemVal(k, +l))}</span><button class="btn sm ${nT ? "" : "ghost off"}" data-a="gemPick" data-v="${id}">${ico("gem", GEMS[k].c, 12)}Sertir</button><button class="btn sm ${n >= 3 && +l < GEM_MAX ? "gold" : "ghost off"}" data-a="gemFuse" data-v="${id}">Fusionner 3 → 1</button></div>`; };
    const lab = k => GEMS[k].d(0).replace(/^\+0\s*/, "").replace(/^de /, ""), O = UI.gemOpen || (UI.gemOpen = {});
    const ks = Object.keys(GEMS).map(k => { const ids = G.filter(([id]) => id.split(":")[0] === k).map(([id]) => id).sort((a, b) => +b.split(":")[1] - +a.split(":")[1]); return { k, ids, top: ids.length ? +ids[0].split(":")[1] : 0, n: ids.reduce((a, id) => a + S.gems[id], 0) }; }).filter(x => x.ids.length).sort((a, b) => b.top - a.top || b.n - a.n);
    const groups = ks.map(({ k, ids, top, n }) => { const op = !!O[k], fz = ids.some(id => S.gems[id] >= 3 && +id.split(":")[1] < GEM_MAX);
      return `<div class="card" style="cursor:default;padding:0;margin-bottom:6px;border-color:${GEMS[k].c}55"><div class="row sp" style="cursor:pointer;padding:8px 10px" data-a="gemCat" data-v="${k}"><span>${ico("gem", GEMS[k].c, 16)} <b style="color:${GEMS[k].c}">${GEMS[k].n}</b> <span class="tiny dim">(${lab(k)})</span></span><span class="tiny">${n} gemme${n > 1 ? "s" : ""} · meilleure niv ${top} — <b>${GEMS[k].d(gemVal(k, top))}</b>${fz ? ' <span class="gold">· fusion possible</span>' : ""} ${op ? "▾" : "▸"}</span></div>${op ? `<div class="col" style="padding:0 8px 8px">${ids.map(rows).join("")}</div>` : ""}</div>`; }).join("");
    const end = h.indexOf('<h3 style="margin-top:12px">'); // début du sertissage par objet (s'il est là)
    let tail = end > i ? h.slice(end) : "";
    if (tail) { const op = !!O._sock, t2 = tail.replace(/^<h3 style="margin-top:12px">([\s\S]*?)<\/h3>/, ""); tail = `<div class="card" style="cursor:default;padding:0;margin-top:10px"><div class="row sp" style="cursor:pointer;padding:8px 10px" data-a="gemCat" data-v="_sock"><b>${ico("gem", "#9ad0ff", 15)} Sertissage par objet</b><span class="tiny">${gemTargets().length} objet(s) ${op ? "▾" : "▸"}</span></div>${op ? `<div style="padding:0 8px 8px">${t2}</div>` : ""}</div>`; }
    const head = h.slice(0, i);
    return head.replace("Primordial 4)", "Primordial 4, Éternel 5 — bibelots compris)") + bar + `<p class="tiny dim" style="margin:2px 0 6px">Touchez une pierre pour dérouler ses gemmes, de la plus forte à la plus faible.</p>` + groups + tail; }; }
ACT.gemCat = k => { const O = UI.gemOpen || (UI.gemOpen = {}); O[k] = !O[k]; openBuilding("forge", "gems"); };

// ── Bibelots : fusion de toute une qualité en une fois ──
function trFuseAll(rar) { const out = []; while (trFuseCands(rar).length >= 3) { const it = trFuse(rar); if (!it) break; out.push(it); } return out; }
ACT.trFuseAll = q => { q = +q; const n = Math.floor(trFuseCands(q).length / 3); if (!n) return; confirmBox(`Fusionner <b>${n * 3}</b> bibelots <b class="rar${q}">${RARITY[q].n}</b> (non verrouillés) en <b>${n}</b> bibelot${n > 1 ? "s" : ""} <b class="rar${q + 1}">${RARITY[q + 1].n}</b> ?`, () => { const L = trFuseAll(q); sfx("forge"); toast(`${L.length} bibelot${L.length > 1 ? "s" : ""} ${RARITY[q + 1].n} obtenu${L.length > 1 ? "s" : ""}.`, "good"); save(); openBuilding("forge", UI.bldTab || "inv"); }, { yes: "Fusionner tout" }); };
{ const eb = enchantBarHTML; enchantBarHTML = function () { let h = eb.apply(this, arguments); return h.replace(/<button class="btn sm([^"]*)" data-a="trFuse" data-v="(\d+)">([\s\S]*?)<\/button>/g, (m, c, q, t) => { const n = Math.floor(trFuseCands(+q).length / 3); return n > 1 ? m + `<button class="btn sm gold" data-a="trFuseAll" data-v="${q}">Tout (${n})</button>` : m; }); }; }

// ── Stats : chance de critique et dégâts critiques séparés ──
{ const hb = heroStatsBlockHTML; heroStatsBlockHTML = function (h, st) { st = st || heroStats(h); let s = hb.call(this, h, st); const cd = Math.round((1.5 + (st.hooks.critDmg || 0)) * 100);
    return s.replace(/<div([^>]*)>Critique <b>([^<]*)<\/b><\/div>/, `<div$1>Chance crit. <b>$2</b>${st.critOver ? ` <span class="tiny gold">(max · +${Math.round(st.critOver)} en dégâts crit.)</span>` : ""}</div><div data-tip="critDmg">Dégâts crit. <b>${cd} %</b></div>`); }; }
if (typeof GLOSS !== "undefined" && !GLOSS.critDmg) GLOSS.critDmg = { n: "Dégâts critiques", ic: "star", d: "Multiplicateur des coups critiques : 150 % de base, augmenté par les « dégâts critiques » des objets, bibelots, talents et voies. La chance de critique monte jusqu'à 100 % : chaque point au-delà devient +1 % de dégâts critiques." };

// ── Lecture d'un nombre choisi de tomes (héros et compagnons) : − [N] + · Lire ×N · Max ──
function tomeQtyHTML(kind, id, max) { if (max < 1) return ""; const v = Math.min(max, Math.max(1, (UI.tomeQ && UI.tomeQ[kind + id]) || 1));
  return `<span class="row tomeq" style="gap:4px;flex-wrap:nowrap"><button class="btn sm ghost" data-a="tomeQ" data-v="${kind}|${id}|-1">−</button><input type="number" class="tqin" min="1" max="${max}" value="${v}" data-tq="${kind}|${id}" style="width:54px;text-align:center"><button class="btn sm ghost" data-a="tomeQ" data-v="${kind}|${id}|1">+</button><button class="btn sm gold" data-a="tomeRead" data-v="${kind}|${id}">Lire ×<span class="tqn">${v}</span></button>${max > 1 ? `<button class="btn sm ghost" data-a="tomeQ" data-v="${kind}|${id}|max">Max ${max}</button>` : ""}</span>`; }
function tomeQGet(kind, id, max) { const el = document.querySelector(`input[data-tq="${kind}|${id}"]`); const v = Math.round(+((el && el.value) || (UI.tomeQ && UI.tomeQ[kind + id]) || 1)); return clamp(v || 1, 1, max); }
function tomeQSet(kind, id, v) { UI.tomeQ = UI.tomeQ || {}; UI.tomeQ[kind + id] = v; document.querySelectorAll(`input[data-tq="${kind}|${id}"]`).forEach(el => { el.value = v; const n = el.parentNode.querySelector(".tqn"); if (n) n.textContent = v; }); }
function tomeMax(kind, id) { if (kind === "h") { const h = heroById(id); return h ? Math.min(S.tomes || 0, tomeLevelCost(h)) : 0; } return Math.min(S.ptomes || 0, Math.max(0, petTomeCap() - petLvl(id))); }
ACT.tomeQ = v => { const [kind, id, d] = String(v).split("|"), mx = tomeMax(kind, id); if (mx < 1) return; const cur = tomeQGet(kind, id, mx); tomeQSet(kind, id, d === "max" ? mx : clamp(cur + (+d), 1, mx)); };
ACT.tomeRead = v => { const [kind, id] = String(v).split("|"), mx = tomeMax(kind, id); if (mx < 1) return toast(kind === "h" ? "Ce héros est déjà parmi les plus aguerris." : "Ce compagnon est déjà parmi les plus aguerris.", "bad");
  const want = tomeQGet(kind, id, mx); let n = 0;
  if (kind === "h") { const h = heroById(id); while (n < want && S.tomes > 0 && h.lvl < tomeCap()) { const lv = h.lvl; S.tomes--; const need = xpNeed(h.lvl) - h.xp; giveXp(h, Math.max(1, Math.ceil(need / Math.max(.5, 1 + heroPassives(h).filter(p => p.k === "xp").reduce((a, p) => a + p.v, 0))))); n++; if (h.lvl === lv) break; }
    sfx("level"); toast(`${esc(h.name)} lit ${n} tome${n > 1 ? "s" : ""} et passe niveau ${h.lvl}.`, "good"); }
  else { while (n < want && petReadOne(id)) n++; sfx("level"); toast(`${petName(id)} lit ${n} tome${n > 1 ? "s" : ""} et passe niveau ${petLvl(id)}.`, "good"); }
  UI.tomeQ = UI.tomeQ || {}; UI.tomeQ[kind + id] = 1; save(); refresh(); if (kind === "p" && !$("#modal").hidden) petSheet(id); };
document.addEventListener("input", e => { const el = e.target; if (!el.dataset || !el.dataset.tq) return; const [kind, id] = el.dataset.tq.split("|"); const mx = tomeMax(kind, id); const v = clamp(Math.round(+el.value || 1), 1, Math.max(1, mx)); UI.tomeQ = UI.tomeQ || {}; UI.tomeQ[kind + id] = v; const n = el.parentNode.querySelector(".tqn"); if (n) n.textContent = v; });
{ const th = tomeHTML; tomeHTML = function (h) { const s = th.apply(this, arguments); if (!s) return s; const mx = tomeMax("h", h.id); if (mx < 1) return s;
    return s.replace(/<span class="row" style="gap:4px"><button class="btn sm [^"]*" data-a="readTome"[\s\S]*?<\/span>|<button class="btn sm [^"]*" data-a="readTome" data-v="[^"]*">Lire<\/button>/, tomeQtyHTML("h", h.id, mx)); }; }
{ const pt = petTomeHTML; petTomeHTML = function (id) { const s = pt.apply(this, arguments); if (!s) return s; const mx = tomeMax("p", id); if (mx < 1) return s;
    return s.replace(/<span class="row" style="gap:4px"><button class="btn sm [^"]*" data-a="readPetTome"[\s\S]*?<\/span>/, tomeQtyHTML("p", id, mx)); }; }
