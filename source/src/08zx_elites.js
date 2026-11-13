// ── Élites (oct. 2026) : élites nommées, nids d'élites, marques de chasse, récits, codex, vengeance, embuscades de nuit ──
const ELITE_INFO = {
  boucher: ["Le boucher de la grand-place", "« Approchez. J'ai de la place sur l'étal. »", "Couperet du Boucher", "Recule devant la lumière sainte : +15 % de dégâts sacrés"],
  alpha: ["Le chef de meute", "« … » Il hurle, et la forêt répond.", "Croc d'alpha", "Ralenti, il perd sa meute : vulnérable au Ralenti"],
  chevalier_os: ["Le gardien de la crypte", "« Nul ne passe avant le Jugement. »", "Écu d'os", "Ses os craquent sous les masses : sensible aux coups étourdissants"],
  prieur: ["Le prieur sanglant", "« Votre sang lavera mes péchés. »", "Fouet du Prieur", "Il saigne autant qu'il fait saigner"],
  hydre: ["La jeune hydre", "Trois têtes sifflent ensemble.", "Écaille d'hydre", "Le feu cautérise ses têtes"],
  ogre: ["Le mangeur d'hommes", "« Encore… faim… »", "Massue de l'Ogre", "Lent : agissez avant lui"],
  bourreau: ["La hache du roi", "« Agenouillez-vous. C'est plus propre. »", "Hache du Bourreau", "Sans armure : la protection brisée le ruine"],
  colosse_braise: ["Le géant de lave", "Le sol fond sous ses pas.", "Cœur de braise", "La glace fend sa carapace"],
  jarl_mort: ["Le seigneur des Cimes", "« Mon trône de glace ne sera jamais vôtre. »", "Hache des glaces", "Le feu le ramollit"],
  leviathan: ["La bête des citernes", "Les tentacules sortent de l'eau noire.", "Œil du Léviathan", "Hors de l'eau, il s'épuise : les dégâts sur la durée le ruinent"],
  contremaitre: ["Le contremaître de fer", "« Au travail. Jusqu'à la mort. »", "Fouet de chaînes", "Son armure rouille : la protection brisée le ruine"],
  champion_roi: ["Invaincu en cent duels", "« Le cent unième. Enfin. »", "Rapière du Champion", "Il ne frappe qu'un seul ennemi à la fois"],
};
const ELITE_EPI = ["revenu des morts", "le Revenant", "qui ne meurt pas", "à la rancune tenace", "aux cicatrices neuves"];
const HUNT_N = 10; // victoires pour la marque de chasse
// élite d'un autre chapitre : surnom, +10 % PV, une compétence en plus
function namedElite(u) {
  u.named = 1; u.name = u.name + ", " + ELITE_EPI[hashStr(u.key) % ELITE_EPI.length]; u.hpMax = Math.round(u.hpMax * 1.1); u.hp = u.hpMax;
  u.skills = u.skills.concat([{ id: "rev", n: "Rancune du revenant", m: 1.25, t: "e", at: [1, 2, 3], fx: [{ k: "bleed", v: .5, t: 3, ch: .9 }, { k: "weak", t: 2, ch: .5 }], cd: 2, w: .8 }]);
}
const eliteStats = k => ((S.eliteLog || (S.eliteLog = {}))[k] = S.eliteLog[k] || { wins: 0, met: 0, drops: 0 });
const huntMark = k => eliteStats(k).wins >= HUNT_N;
// après un combat : victoires, marques de chasse, rancunes (héros mis à terre par une élite)
function elitesAfterBattle(B, run) {
  const out = { marks: [], grudges: [] };
  for (const e of [...B.enemies, ...(B.dead || [])]) if (e.elite) eliteStats(e.key).met++;
  if (B.over === "win") for (const e of B.dead || []) if (e.elite) { const L = eliteStats(e.key); L.wins++; if (L.wins === HUNT_N) out.marks.push(e.name.split(",")[0]); }
  for (const u of [...B.heroes, ...B.fallen]) { if (!u.agonyN && !u.fallen) continue; const h = heroById(u.hid); const el = [...B.enemies, ...(B.dead || [])].find(e => e.elite); if (h && el) { h.grudge = el.key; out.grudges.push({ h: h.name, e: el.name.split(",")[0] }); } }
  return out;
}
// au début d'un combat : marque de chasse (+10 % contre l'élite), vengeance (+20 % pour le héros qui lui en veut)
function eliteBonuses(B) {
  for (const e of B.enemies) { if (!e.elite) continue;
    if (huntMark(e.key)) { e.hunted = 1; e.st.push({ k: "vuln", t: 99, v: 0, hunt: 1 }); }
    for (const u of B.heroes) { const h = heroById(u.hid); if (h && h.grudge === e.key) { u.st.push({ k: "dmgUp", v: .2, t: 99 }); u.revenge = e.key; } } }
}
// butin favori : 10 % de chance par victoire contre une élite, qualité Épique au minimum
function eliteFavDrop(B, lvl) {
  const e = (B.dead || []).find(x => x.elite && ELITE_INFO[x.key]); if (!e || !chance(.1)) return null;
  const it = lootGear(lvl + 1, .3, null, 3); it.fav = e.key; eliteStats(e.key).drops++; return it;
}
