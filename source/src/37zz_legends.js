// ── Légendes, version étendue : une par classe et par voie d'évolution, ordre d'apparition aléatoire, Mythes cachés ──
// Les 16 légendes historiques (37_ui_extras.js) restent ; s'ajoutent les légendes de voie (30) et les Mythes (8).
const LG_EPIT_M = ["le Juste", "l'Impitoyable", "Brise-Rois", "aux Cent Batailles", "le Veilleur", "Cœur-de-Loup", "le Silencieux", "Mange-Ombre", "le Revenu", "Porte-Aube", "l'Inflexible", "aux Yeux Gris", "le Sans-Peur", "Main-Rouge", "le Dernier Serment"];
const LG_EPIT_F = ["la Juste", "l'Impitoyable", "Brise-Rois", "aux Cent Batailles", "la Veilleuse", "Cœur-de-Louve", "la Silencieuse", "Mange-Ombre", "la Revenue", "Porte-Aube", "l'Inflexible", "aux Yeux Gris", "la Sans-Peur", "Main-Rouge", "du Dernier Serment"];
const LG_TALES = ["On chante son nom dans les tavernes de trois royaumes.", "Elle a survécu à la chute de son ordre ; il en garde les clés.", "Les gardiens la reconnaissent et reculent d'un pas.", "Personne ne sait d'où vient sa voie ; tout le monde sait où elle mène.", "Il a vu la Couronne de près, et n'a pas cédé.", "Ses cicatrices racontent une guerre que nul n'a gagnée.", "Les morts de l'Abîme murmurent son nom avec respect."];
// légendes de voie : héros déjà évolués, générés une fois pour toutes (graine fixe)
const LEGENDS_EVO = (() => { const R = mkRng(424242), out = [];
  for (const cls in CLASSES) for (const evo of Object.keys(CLASSES[cls].evos)) {
    const fem = CLASS_FEMALE.has(cls), nm = R.pick(fem ? NAMES_F : NAMES_M) + " " + R.pick(fem ? LG_EPIT_F : LG_EPIT_M);
    out.push({ id: "lv_" + cls + "_" + evo, cls, evo, name: nm, story: CLASSES[cls].evos[evo].n + ". " + R.pick(LG_TALES).replace(/^Elle a survécu à la chute de son ordre ; il en garde/, fem ? "Elle a survécu à la chute de son ordre ; elle en garde" : "Il a survécu à la chute de son ordre ; il en garde"), cond: () => true, how: "" });
  }
  return out; })();
// Mythes : héros cachés, encore plus forts, débloqués par les succès cachés
TRAITS.mythe = { n: "Mythe", good: 1, unique: 1, d: "+20 % de dégâts et de PV, +20 résistance, +3 vitesse, +10 % de critique.", pas: [{ k: "stat", s: "dmg", v: .2 }, { k: "stat", s: "hp", v: .2 }, { k: "stat", s: "res", v: 20 }, { k: "stat", s: "spd", v: 3 }, { k: "stat", s: "crit", v: 10 }] };
const MYTHS = [
  { id: "my_aldemar", cls: "templier", evo: "bastion", name: "Aldemar, Premier Roi", ach: "intact", story: "Le roi qui porta la Couronne avant qu'elle ne brûle. Il revient expier." },
  { id: "my_sybille", cls: "pretresse", evo: "sainte", name: "Sybille l'Inextinguible", ach: "sans_potion", story: "Sa lampe ne s'est jamais éteinte, même au fond de l'Abîme." },
  { id: "my_kael", cls: "ombre", evo: "assassin", name: "Kael, l'Ombre du Trône", ach: "solitaire", story: "Il a tué trois rois. Le quatrième l'a engagé." },
  { id: "my_morrigan", cls: "sorciere", evo: "sorciere_noire", name: "Morrigan aux Corbeaux", ach: "nuit_noire", story: "Les corbeaux du champ de bataille portent ses yeux." },
  { id: "my_tharn", cls: "berserker", evo: "chef_guerre", name: "Tharn Brise-Montagne", ach: "sans_soin", story: "Il a fendu le Cœur de la Montagne d'un seul coup. On l'a cru mort pendant un siècle." },
  { id: "my_vesper", cls: "necromancien", evo: "liche", name: "Vesper, Reine des Tombes", ach: "maudit", story: "Elle collectionne les malédictions comme d'autres les bijoux." },
  { id: "my_ferrand", cls: "gardien_runes", evo: "forge_tonnerre", name: "Ferrand, Forgeur d'Orages", ach: "mythe_gardiens", story: "Chaque rune qu'il frappe fait gronder le ciel." },
  { id: "my_lucrece", cls: "exorciste", evo: "confesseur", name: "Lucrèce la Dernière Sainte", ach: "mythe_secret", story: "Elle a entendu la confession d'un gardien secret, et lui a pardonné." },
];
// nouveaux succès cachés liés aux Mythes
if (typeof HIDDEN_ACH !== "undefined") HIDDEN_ACH.push(
  { id: "mythe_gardiens", n: "Collectionneur de couronnes", d: "Vaincre 25 gardiens différents (variantes comprises).", gold: 800, shards: 4 },
  { id: "mythe_secret", n: "Le secret des secrets", d: "Vaincre un gardien secret.", gold: 600, shards: 3 },
  { id: "abime_25", n: "Plus bas que tout", d: "Atteindre la profondeur 25 de l'Abîme.", gold: 1000, shards: 5 },
  { id: "legendes_5", n: "Panthéon", d: "Recruter cinq légendes.", gold: 600, shards: 3 },
);
function legendExtraAch() { // vérifiés au retour d'expédition
  const got = []; S.beaten = S.beaten || {};
  if (Object.keys(S.beaten).filter(k => MONSTERS[k] && MONSTERS[k].boss).length >= 25) got.push(hiddenAch("mythe_gardiens"));
  if (Object.keys(S.beaten).some(k => MONSTERS[k] && MONSTERS[k].secret)) got.push(hiddenAch("mythe_secret"));
  if ((S.abyss.best || 0) >= 25) got.push(hiddenAch("abime_25"));
  if (Object.keys(S.legends || {}).filter(k => !k.startsWith("errant_")).length >= 5) got.push(hiddenAch("legendes_5"));
  return got.filter(Boolean);
}
// nombre de légendes proposées à la fois : grandit avec la progression ; l'ordre est tiré au hasard une fois par partie
function legendSlots() { const ch = REGIONS.filter(r => clearsOf(r.id)).length; return Math.min(6, 1 + Math.floor(ch / 2) + Math.floor((S.abyss.best || 0) / 10) + (S.bld.taverne >= 5 ? 1 : 0)); }
function legendPool() {
  S.legendOrder = S.legendOrder && S.legendOrder.length ? S.legendOrder : RNG.shuffle(LEGENDS.concat(LEGENDS_EVO).map(l => l.id));
  for (const l of LEGENDS.concat(LEGENDS_EVO)) if (!S.legendOrder.includes(l.id)) S.legendOrder.splice(rint(0, S.legendOrder.length), 0, l.id);
  const open = S.legendOrder.filter(id => !S.legends[id]).map(legendById).filter(l => l && CLASSES[l.cls]);
  return open.slice(0, legendSlots());
}
const legendById0 = legendById;
legendById = id => MYTHS.find(l => l.id === id) || LEGENDS_EVO.find(l => l.id === id) || legendById0(id);
const _legendCost0 = legendCost;
legendCost = l => { const c = _legendCost0(l); if (l && l.evo) { c.gold = Math.round(c.gold * 1.6); c.shards += 2; } if (l && l.ach) { c.gold = Math.round(c.gold * 2.5); c.shards += 5; } return c; };
legendsHTML = function () {
  if (!S) return ""; S.legends = S.legends || {}; const w = wanderLegend();
  const ready = legendPool().concat(w && !S.legends[w.id] ? [w] : []), myths = MYTHS.filter(m => !S.legends[m.id]);
  const card = l => { const c = legendCost(l), R = legendRoll(l.id), T = TRAITS[R.boon], myth = !!l.ach, ok = !myth || (S.ach || {})[l.ach];
    return `<div class="row card" style="cursor:default;gap:10px;border-color:${myth ? "#ff5a7a99" : l.wander ? "#9ad0ff77" : "#ffb84877"};${ok ? "" : "opacity:.55"}">${canvasSlot("lg:" + l.id, 70, 84)}<div style="flex:1;min-width:0">
      <b class="rar${myth ? 6 : R.rar}">${ok || !myth ? esc(l.name) : "???"}</b> <span class="tiny dim">${CLASSES[l.cls].n}${l.evo ? " · " + CLASSES[l.cls].evos[l.evo].n : ""}${l.wander ? " · errant" : ""}${myth ? " · Mythe" : ""}</span><div class="tiny lore">${ok || !myth ? esc(l.story) : "Un nom qu'on ne prononce pas encore."}</div>
      <div class="tiny">${ico("star", myth ? "#ff5a7a" : "#ffb848", 11)} <b>${myth ? "Mythe" : "Légende vivante"}</b> — ${TRAITS[myth ? "mythe" : "legende"].d}</div>
      <div class="tiny">${ico("gem", "#9ad0ff", 11)} Don : <b>${T.n}</b> — ${T.d}</div>
      ${myth && !ok ? `<div class="tiny bad">${ico("lock", "#e07060", 11)} Succès caché requis : ${esc((HIDDEN_ACH.find(a => a.id === l.ach) || {}).n || "?")}</div>` : `<div class="tiny dim">${l.evo ? "Arrive déjà évolué(e) · " : ""}Arme et armure ${RARITY[myth ? 6 : R.rar].n}</div>`}</div>
      ${ok ? `<button class="btn sm gold" data-a="legendHire" data-v="${l.id}">${fmt(c.gold)} or · ${c.shards} éclats</button>` : ""}</div>`; };
  const all = LEGENDS.length + LEGENDS_EVO.length + MYTHS.length, got = Object.keys(S.legends).filter(k => !k.startsWith("errant_")).length;
  return `<h3 style="margin-top:6px">${ico("crown", "#ffb848", 15)} Légendes <span class="tiny dim">${got}/${all}</span></h3><p class="tiny dim">Des héros dont on chante déjà le nom, tirés au hasard : ${legendSlots()} se présentent à la fois (davantage en progressant). Une légende errante passe chaque semaine ; les Mythes n'apparaissent qu'aux vainqueurs de succès cachés.</p>
    <div class="col">${ready.map(card).join("")}${myths.map(card).join("")}</div>`;
};
ACT.legendHire = id => {
  const l = legendById(id); if (!l || (S.legends || {})[id]) return; if (l.ach && !(S.ach || {})[l.ach]) return toast("Ce Mythe ne vous connaît pas encore.", "bad");
  if (!l.ach && !l.wander && !legendPool().includes(l)) return toast("Cette légende n'est pas (encore) à la Taverne.", "bad");
  if (S.heroes.length >= rosterMax()) return toast("La caserne est pleine.", "bad");
  const c = legendCost(l); if (S.gold < c.gold || (S.shards || 0) < c.shards) return toast("Il vous faut " + fmt(c.gold) + " or et " + c.shards + " éclats.", "bad");
  S.gold -= c.gold; S.shards -= c.shards; const R = legendRoll(id), rar = l.ach ? 6 : R.rar;
  let lv = Math.max(1, Math.max(...S.heroes.map(h => h.lvl)) - 2 + R.lvlB); if (l.evo) lv = Math.max(EVO_LVL, lv);
  const h = makeHero(l.cls, { name: l.name, lvl: lv, traits: [l.ach ? "mythe" : "legende", R.boon] }); if (l.evo) { h.evo = l.evo; const ns = Object.keys(CLASSES[h.cls].evos[l.evo].skills); for (const k of ns) h.skr[k] = 1; h.skills = h.skills.slice(0, 2).concat(ns); }
  const tier = Math.max(1, TIER_LVL.filter(x => x <= lv).length - 1); h.gear.wpn = makeGear("wpn", l.cls, Math.min(5, tier), rar); h.gear.arm = makeGear("arm", l.cls, Math.min(5, tier), rar);
  h.legend = id; addHero(h); S.legends[id] = 1; save(); sfx("holy"); renderHud(); toast(`${ico("crown", "#ffb848", 14)} ${esc(l.name)} rejoint le Bastion !`, "good"); openBuilding("taverne");
};
