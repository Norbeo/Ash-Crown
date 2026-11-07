/* Fiche du héros : toutes les caractéristiques + détail des bonus par source (niveau, équipement, bibelots, talents…). */
function pasSum(list) {
  const m = new Map();
  for (const p of list || []) { if (typeof p.v !== "number") continue; const key = p.k + "|" + (p.s || "") + "|" + (p.tag || ""); const o = m.get(key); if (o) o.v += p.v; else m.set(key, Object.assign({}, p)); }
  return [...m.values()].filter(p => Math.abs(p.v) > 1e-6);
}
const pasMinus = (all, parts) => { const sub = pasSum(parts).map(p => Object.assign({}, p, { v: -p.v })); return pasSum(all.concat(sub)).filter(p => Math.abs(p.v) > .004); };
function heroBonusSources(h) {
  const C = CLASSES[h.cls], L = h.lvl - 1, src = [];
  const add = (n, pas) => { const s = pasSum(pas); if (s.length) src.push({ n, pas: s }); return pas; };
  const known = [];
  // niveau
  src.push({ n: `Niveau ${h.lvl}`, txt: L ? `+${Math.round(11 * L)} % PV · +${Math.round(8 * L)} % dégâts · +${Math.floor(L / 4)} vitesse · +${Math.round(L * .3)} % critique · +${Math.round(L * .5)} esquive · +${Math.round(L * .6)} précision · +${Math.round(L * 1.5)} résistance · +${Math.round(L * 4)} % soins` : "aucun bonus au niveau 1" });
  // équipement
  const w = h.gear.wpn, a = h.gear.arm, eq = [];
  if (w) eq.push({ k: "stat", s: "dmg", v: WPN_DMG[w.tier] * (1 + .07 * w.up) + w.up * .03 });
  if (a) eq.push({ k: "stat", s: "hp", v: ARM_HP[a.tier] * (1 + .07 * a.up) + a.up * .025 }, { k: "stat", s: "prot", v: ARM_PROT[a.tier] });
  for (const it of [w, a, h.gear.tr1, h.gear.tr2]) if (it && it.aff) for (const f of it.aff) eq.push({ k: "stat", s: f.k, v: f.v });
  add("Arme, armure et affixes", eq);
  const tr = [];
  for (const s of ["tr1", "tr2"]) { const it = h.gear[s]; if (it && TRINKETS[it.key]) { const m = 1 + .2 * Math.max(0, (it.rar || 0) - TRINKETS[it.key].r); tr.push(...TRINKETS[it.key].pas.map(p => m === 1 || typeof p.v !== "number" || p.k === "cheatDeath" ? p : Object.assign({}, p, { v: p.v * m }))); } }
  known.push(...add("Bibelots (qualité incluse)", tr));
  const mods = []; for (const s of ["wpn", "arm"]) { const it = h.gear[s]; if (it && it.mod && ITEM_MODS[it.mod]) mods.push(...ITEM_MODS[it.mod].pas); }
  known.push(...add("Effets uniques d'équipement", mods));
  if (typeof setPassives === "function") known.push(...add("Panoplies", setPassives(h)));
  if (h.talents && typeof talentPas === "function") known.push(...add("Talents", talentPas(h)));
  known.push(...add("Traits", [].concat(...h.traits.map(t => TRAITS[t] ? TRAITS[t].pas : []))));
  if (h.evo) known.push(...add(h.lvl >= APEX_LVL ? "Évolution et apogée" : "Évolution", C.evos[h.evo].pas.concat(h.lvl >= APEX_LVL && APEX[h.evo] ? APEX[h.evo].pas : [])));
  if (typeof ascPassives === "function") known.push(...add("Ascension", ascPassives(h)));
  if (typeof PAS_HOOKS !== "undefined") { const ph = []; for (const f of PAS_HOOKS) ph.push(...f(h)); known.push(...add("Gemmes, prestige, maîtrise et Bastion", ph)); }
  const rest = [];
  if (h.cursed > 0) rest.push({ k: "stat", s: "dmg", v: -.12 });
  if (h.mark && typeof GUARD_MARKS !== "undefined" && GUARD_MARKS[h.mark]) rest.push(...GUARD_MARKS[h.mark].pas);
  if (h.affl && typeof AFFLICTIONS !== "undefined" && AFFLICTIONS[h.affl]) rest.push(...AFFLICTIONS[h.affl].pas);
  if (h.vet && typeof VET_TITLES !== "undefined" && VET_TITLES[h.vet]) rest.push(...VET_TITLES[h.vet].pas);
  known.push(...add("Marque, état, malédiction et vétéran", rest));
  const other = pasMinus(heroPassives(h), known); if (other.length) src.push({ n: "Autres (héritage, liens…)", pas: other });
  return src;
}
function heroStatsBlockHTML(h, st) {
  st = st || heroStats(h); const H = st.hooks || {};
  const cell = (n, v, tip) => `<div${tip ? ` data-tip="${tip}"` : ""}>${n} <b>${v}</b></div>`;
  const grid = [cell("PV", Math.round(st.hp)), cell("Dégâts", `${Math.round(st.dmgLo)}–${Math.round(st.dmgHi)}`), cell("Protection", Math.round(st.prot * 100) + " %"), cell("Vitesse", Math.round(st.spd)),
    cell("Critique", Math.round(st.crit) + " %"), cell("Esquive", Math.round(st.dodge)), cell("Précision", Math.round(st.acc)), cell("Résistance", Math.round(st.res)),
    cell("Soins", Math.round(st.healPow * 100) + " %"), cell("Vol de vie", Math.round((st.leech || 0) * 100) + " %")].join("");
  const sp = Object.keys(H).filter(k => k !== "vsTag" && k !== "vsTagV" && typeof H[k] === "number" && H[k]).map(k => k === "vsTag" ? null : { k, v: H[k] });
  if (H.vsTag && H.vsTagV) sp.push({ k: "vsTag", tag: H.vsTag, v: H.vsTagV });
  const spec = sp.filter(p => p.k !== "vsTag" || p.tag).length ? `<div class="tiny" style="margin-top:4px"><b>Effets spéciaux</b> : ${pasText(sp.filter(p => p.k !== "vsTag" || p.tag))}</div>` : "";
  const src = heroBonusSources(h).map(s => `<div class="tiny" style="margin:2px 0"><b>${s.n}</b> : ${s.txt || pasText(s.pas)}</div>`).join("");
  const sn = typeof setCount === "function" ? setCount(h) : {};
  const sets = Object.keys(sn).map(k => { const T = SETS[k], n = sn[k], b = (i, B) => B ? `<span class="${n >= i ? "good" : "dim"}">${i} : ${B.d}</span>` : ""; return `<div class="tiny" style="margin:2px 0"><b style="color:${T.c}">❖ ${T.n}</b> <b>${n}/4</b> — ${[b(2, T.b2), b(3, T.b3), b(4, T.b4)].filter(Boolean).join(" · ")}</div>`; }).join("");
  return `<div class="statgrid" style="margin-top:8px">${grid}</div>${sets ? `<div style="margin-top:4px">${sets}</div>` : ""}${spec}<details style="margin-top:4px"><summary class="tiny gold" style="cursor:pointer">Détail des bonus par source</summary><div style="margin-top:4px">${src}</div></details>`;
}

// cadenas devant le nom d'un objet verrouillé (listes, fiches, comparaisons)
{ const gn0 = gearName; gearName = function (it) { const n = gn0.apply(this, arguments); return it && it.lock ? "🔒 " + n : n; }; }
