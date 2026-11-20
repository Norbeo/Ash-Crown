/* ═══════════════════════ Extensions II : reliques maudites, vétérans, mémorial, nuit, marchand, tenues, duos, succès cachés ═══════════════════════ */
// ── Reliques maudites : puissantes, mais avec un prix ──
Object.assign(RELICS, {
  coeur_noir: { n: "Cœur noir", r: 2, cursed: 1, d: "+25 % de dégâts. Malédiction : −1 potion.", h: { dmg: .25 }, onGet: run => { run.potions = Math.max(0, run.potions - 1); } },
  lanterne_avide: { n: "Lanterne avide", r: 2, cursed: 1, d: "+30 % d'or et +10 % de critique. Malédiction : la lueur baisse deux fois plus vite.", h: { gold: .3, crit: 10, lightDrain: 1 } },
  sang_impur: { n: "Sang impur", r: 2, cursed: 1, d: "+12 % de vol de vie. Malédiction : −12 % de PV maximum.", h: { leech: .12, hp: -.12 } },
  couronne_epines: { n: "Couronne d'épines", r: 2, cursed: 1, d: "30 % des dégâts de mêlée renvoyés. Malédiction : −25 % de soins reçus.", h: { thorns: .3, heal: -.25 } },
  oeil_fou: { n: "Œil du fou", r: 2, cursed: 1, d: "+3 de vitesse et +15 % de dégâts. Malédiction : −20 de résolution au début des combats.", h: { spd: 3, dmg: .15, morale: -20 } },
  pacte_sang: { n: "Pacte de sang", r: 2, cursed: 1, d: "Les ennemis commencent affaiblis et un héros tombé se relève une fois. Malédiction : −1 potion et −8 % de protection.", h: { startWeak: 1, revive: .3, prot: -.08 }, onGet: run => { run.potions = Math.max(0, run.potions - 1); } },
});
function addRelic(run, k) { if (!k || !RELICS[k]) return; run.relics.push(k); if (RELICS[k].onGet) RELICS[k].onGet(run); }

// ── Héros vétérans : un titre après 10 expéditions, selon ce qu'il a accompli ──
const VET_TITLES = {
  boucher: { n: "le Boucher", d: "+6 % de dégâts.", pas: [{ k: "stat", s: "dmg", v: .06 }], test: h => (h.kills || 0) >= 80 },
  main_sainte: { n: "la Main sainte", d: "+12 % de soins prodigués.", pas: [{ k: "stat", s: "healPow", v: .12 }], test: h => CLASSES[h.cls].role === "soin" },
  roc: { n: "le Roc", d: "+8 % de PV et +3 % de protection.", pas: [{ k: "stat", s: "hp", v: .08 }, { k: "stat", s: "prot", v: .03 }], test: h => CLASSES[h.cls].role === "tank" },
  voix: { n: "la Voix", d: "+10 de résistance et +1 de vitesse.", pas: [{ k: "stat", s: "res", v: 10 }, { k: "stat", s: "spd", v: 1 }], test: h => CLASSES[h.cls].role === "soutien" },
  survivant: { n: "le Survivant", d: "+10 % de PV.", pas: [{ k: "stat", s: "hp", v: .1 }], test: () => true },
};
function vetCheck(h, run) {
  if (h.vet || (h.runs || 0) < 10) return null;
  const k = Object.keys(VET_TITLES).find(t => VET_TITLES[t].test(h)) || "survivant";
  const R = regionById(run.region); h.vet = k; h.vetOf = R ? R.n.replace(/^(Le |La |Les |L')/, "") : "";
  return k;
}
const vetTitle = h => h.vet ? `${VET_TITLES[h.vet].n}${h.vetOf ? " de " + h.vetOf : ""}` : "";

// ── Mémorial : épitaphe et exploits des héros morts ou partis ──
const EPITAPHS = ["Il n'a jamais reculé.", "Elle a tenu jusqu'au bout.", "La Cendre l'a pris, pas sa mémoire.", "Mort debout.", "Il riait encore en tombant.", "Que la lumière lui soit douce.", "Le Bastion se souvient.", "Il a payé pour les autres."];
function engrave(h, cause, run) {
  (S.graves = S.graves || []).push({ name: h.name, cls: h.cls, lvl: h.lvl, at: Date.now(), cause, kills: h.kills || 0, runs: h.runs || 0, title: vetTitle(h), where: run ? regionById(run.region).n : "", epi: pick(EPITAPHS), last: typeof lastWords === "function" ? lastWords(h) : "" });
}

// ── Marchand ambulant au Bastion : une boutique par jour, un objet de haute qualité garanti ──
function merchantStock() {
  const d = S.daily; if (d.merchant && d.merchant.key === d.key) return d.merchant;
  const top = Math.max(1, ...S.heroes.map(h => h.lvl)), items = [];
  for (let i = 0; i < 3; i++) items.push(lootGear(top + i, .05 + i * .05));
  const best = lootGear(top + 2, .3, null, 4); items.push(best);
  d.merchant = { key: d.key, items: items.map(it => ({ it, cost: Math.round((90 + it.tier * 60 + it.rar * it.rar * 70) * 1.2), sold: 0 })) };
  return d.merchant;
}
function merchantBuy(i) { const M = merchantStock(), o = M.items[i]; if (!o || o.sold) return { err: "Déjà vendu." }; if (S.gold < o.cost) return { err: "Pas assez d'or." }; S.gold -= o.cost; o.sold = 1; const it = JSON.parse(JSON.stringify(o.it)); it.id = uid("i"); S.inv.push(it); return { ok: it }; } // copie : l'objet acheté n'est plus lié à l'étal du jour

// ── Tenues alternatives : une teinte d'armure, débloquée par les défis de classe ──
const OUTFITS = [{ k: "", n: "Tenue d'origine", need: 0 },
  // pal : p = principale [teinte, saturation, luminosité], a = accent, m = métal (rgb), mk = force du métal, dk = ombres [teinte, saturation, gamma]
  { k: "deuil", n: "Tenue des bois", need: 3, pal: { p: [110, .6, 1], a: [32, .6, 1], m: [160, 125, 80], mk: .55, dk: [105, 0.37, 0.88] } },
  { k: "sang", n: "Tenue écarlate", need: 10, pal: { p: [356, .85, 1.05], a: [44, .75, 1.1], m: [215, 180, 95], mk: .6, dk: [355, 0.51, 0.88] } },
  { k: "nuit", n: "Tenue de nuit", need: 18, pal: { p: [220, .7, 1], a: [275, .55, 1], m: [195, 205, 220], mk: .6, dk: [225, 0.54, 0.88] } },
  { k: "givre", n: "Tenue de givre", need: 22, pal: { p: [195, .55, 1.25], a: [262, .4, 1.3], m: [220, 235, 245], mk: .65, dk: [200, 0.42, 0.85] } },
  { k: "cendre", n: "Cendre et braise", need: 25, pal: { p: [22, .85, 1.05], a: [348, .8, .95], m: [85, 78, 72], mk: .6, dk: [12, 0.48, 0.88], glow: [255, 120, 40] } },
  { k: "peste", n: "Tenue de la peste", need: 30, pal: { p: [78, .7, .95], a: [290, .5, .9], m: [120, 130, 95], mk: .55, dk: [85, 0.42, 0.88] } },
  { k: "ivoire", n: "Tenue d'ivoire", need: 35, pal: { p: [40, .22, 1.7], a: [205, .3, 1.4], m: [235, 205, 130], mk: .65, dk: [38, 0.12, 0.72] } },
  { k: "emeraude", n: "Émeraude et or", need: 42, pal: { p: [150, .75, 1.05], a: [45, .8, 1.15], m: [235, 190, 80], mk: .7, dk: [155, 0.51, 0.88] } },
  { k: "maitre", n: "Pourpre royal (maître)", need: 50, pal: { p: [280, .7, 1.05], a: [45, .75, 1.1], m: [210, 215, 228], mk: .6, dk: [282, 0.51, 0.88] } },
  { k: "epreuve", n: "Noir et or (Épreuve)", need: 0, trial: 1, pal: { p: [0, 0, .45], a: [44, .85, 1.15], m: [245, 185, 55], mk: .85, dk: [40, 0.08, 0.88] } }];
const outfitOk = (h, k) => { const O = OUTFITS.find(o => o.k === k); return O && (O.trial ? !!((S.classTrial || {})[h.cls]) : ((S.classWins || {})[h.cls] || 0) >= O.need); };

// ── Compagnons en duo : bonus quand le compagnon s'entend avec une classe du groupe ──
const PET_DUOS = {
  loup: { cls: ["berserker", "chasseur_sorcieres"], h: { dmg: .08 }, d: "+8 % de dégâts" }, corbeau: { cls: ["necromancien", "ombre"], h: { markDmg: .15 }, d: "+15 % sur les cibles marquées" },
  chouette: { cls: ["pretresse", "exorciste"], h: { heal: .12 }, d: "+12 % de soins" }, molosse: { cls: ["templier", "revenant"], h: { prot: .05 }, d: "+5 % de protection" },
  renard: { cls: ["ombre", "arbaletriere"], h: { crit: 6 }, d: "+6 % de critique" }, ours: { cls: ["gardien_runes", "hallebardier"], h: { hp: .08 }, d: "+8 % de PV" },
  cerf: { cls: ["sorciere", "medecin_peste"], h: { roundHeal: .015 }, d: "1,5 % de PV rendus par tour" }, vipere: { cls: ["medecin_peste", "sorciere"], h: { poisonT: 1 }, d: "poisons prolongés" },
  salamandre: { cls: ["pyromancien"], h: { burnT: 1 }, d: "brûlures prolongées" }, chauve_souris: { cls: ["revenant", "necromancien"], h: { leech: .05 }, d: "+5 % de vol de vie" },
  feu_follet: { cls: ["menestrel", "pretresse"], h: { morale: 10 }, d: "+10 de résolution" }, gargouille: { cls: ["templier", "gardien_runes"], h: { thorns: .1 }, d: "10 % des dégâts renvoyés" },
  belette: { cls: ["ombre", "berserker"], h: { bleedT: 1 }, d: "saignements prolongés" },
};
function petDuo(run) { const D = run && run.pet && PET_DUOS[run.pet]; if (!D) return null; const cl = run.party.map(id => { const h = heroById(id); return h && h.cls; }); return D.cls.some(c => cl.includes(c)) ? D : null; }

// ── Succès cachés ──
const HIDDEN_ACH = [
  { id: "sans_soin", n: "Sans prières", d: "Vaincre un gardien de chapitre sans soigneur dans le groupe.", gold: 400, shards: 2 },
  { id: "sans_potion", n: "Abstinence", d: "Terminer un chapitre sans boire une seule potion.", gold: 400, shards: 2 },
  { id: "solitaire", n: "Le dernier debout", d: "Vaincre un gardien avec un seul héros encore en vie.", gold: 500, shards: 3 },
  { id: "intact", n: "Sans une égratignure", d: "Vaincre un gardien sans qu'aucun héros ne tombe à l'agonie.", gold: 400, shards: 2 },
  { id: "nuit_noire", n: "Enfant de la nuit", d: "Terminer une expédition de nuit.", gold: 350, shards: 2 },
  { id: "maudit", n: "Collectionneur de malédictions", d: "Terminer une expédition avec trois reliques maudites.", gold: 500, shards: 3 },
];
function hiddenAch(id) { S.ach = S.ach || {}; if (S.ach[id]) return null; const A = HIDDEN_ACH.find(a => a.id === id); if (!A) return null; S.ach[id] = Date.now(); S.gold += A.gold || 0; S.shards += A.shards || 0; return A; }
function hiddenEndRun(run, outcome, res) {
  const got = [], party = run.party.map(heroById).filter(Boolean), roles = party.map(h => CLASSES[h.cls].role);
  if (outcome === "victory" && !run.rush) {
    if (!roles.includes("soin")) got.push(hiddenAch("sans_soin"));
    if (!run.potionsUsed && run.region !== "abime") got.push(hiddenAch("sans_potion"));
    if (party.filter(h => !run.fallen.includes(h.id)).length === 1) got.push(hiddenAch("solitaire"));
    if (!run.agonies) got.push(hiddenAch("intact"));
  }
  if (outcome !== "wipe" && run.night) got.push(hiddenAch("nuit_noire"));
  if (outcome !== "wipe" && run.relics.filter(k => RELICS[k] && RELICS[k].cursed).length >= 3) got.push(hiddenAch("maudit"));
  if (typeof legendExtraAch === "function") got.push(...legendExtraAch());
  res.hidden = got.filter(Boolean);
  // vétérans
  res.vets = party.map(h => vetCheck(h, run) ? { name: h.name, t: vetTitle(h), d: VET_TITLES[h.vet].d } : null).filter(Boolean);
}

// ── Événements de nuit (seulement en expédition de nuit) ──
EVENTS.push(
  { id: "n_lune", need: "nuit", n: "La lune rouge", t: "La lune se lève, rouge comme une plaie. Dans sa lumière, les morts dansent au loin.", ch: [{ n: "Les rejoindre un instant", fx: { gamble: [.5, { relic: 1, morale: 10 }, { hurt: .15, curse: 1 }] } }, { n: "Se cacher jusqu'à l'aube", fx: { light: -10, heal: .1 } }] },
  { id: "n_chasse", need: "nuit", n: "La chasse sauvage", t: "Des cors résonnent dans le ciel. Une meute de cavaliers spectraux passe au-dessus de vous.", ch: [{ n: "Les défier", fx: { fight: 1, loot: 1 } }, { n: "Se jeter au sol", fx: { morale: -10 } }] },
  { id: "n_lanterne", need: "nuit", n: "Le porteur de lanterne", t: "Un vieillard sans visage tend une lanterne. « Elle brûle avec ce que tu lui donnes. »", ch: [{ n: "Lui donner de l'or (100)", fx: { cost: 100, light: 40 } }, { n: "Lui donner du sang", fx: { hurt: .1, light: 30, relic: 1 } }, { n: "Refuser", fx: {} }] },
  { id: "n_veillee", need: "nuit", n: "La veillée des pendus", t: "Des cordes pendent d'un arbre noir. Aux pieds des pendus, des offrandes encore fraîches.", ch: [{ n: "Prendre les offrandes", fx: { gold: 160, curse: 1 } }, { n: "Prier pour eux", fx: { morale: 15, xp: 40 } }] },
);
