// ── Liens entre héros, trophées, primes, météo (oct. 2026) ──
// Liens : deux héros côte à côte pendant 3 expéditions deviennent amis (70 %) ou rivaux.
const BOND_N = 3;
const BOND_T = { ami: { n: "Frères d'armes", d: "Côte à côte : +6 % de protection et +4 d'esquive chacun. Si l'un tombe, l'autre accuse le coup (stress)." },
  rival: { n: "Rivaux", d: "Côte à côte : +7 % de critique et +6 % de dégâts chacun, mais +6 stress par combat." } };
const bondKey = (a, b) => a < b ? a + "|" + b : b + "|" + a;
function bondOf(a, b) { const k = (S.bonds || {})[bondKey(a, b)]; return k && k.t ? k : null; }
function heroBonds(h) { const out = []; for (const k in S.bonds || {}) { const b = S.bonds[k]; if (!b.t) continue; const [x, y] = k.split("|"); if (x === h.id || y === h.id) { const o = heroById(x === h.id ? y : x); if (o) out.push({ h: o, t: b.t }); } } return out; }
function bondsAfterRun(run, res) {
  S.bonds = S.bonds || {}; res.bonds = [];
  const p = run.party.filter(id => heroById(id));
  for (let i = 0; i < p.length - 1; i++) { const k = bondKey(p[i], p[i + 1]), b = S.bonds[k] || (S.bonds[k] = { n: 0 }); b.n++;
    if (!b.t && b.n >= BOND_N) { b.t = chance(.7) ? "ami" : "rival"; res.bonds.push({ a: heroById(p[i]).name, b: heroById(p[i + 1]).name, t: b.t }); } }
}
function applyBonds(B) {
  if (typeof S === "undefined" || !S || !S.bonds) return;
  for (let i = 0; i < B.heroes.length - 1; i++) { const a = B.heroes[i], c = B.heroes[i + 1], b = bondOf(a.hid, c.hid); if (!b) continue;
    for (const u of [a, c]) { u.bond = b.t; if (b.t === "ami") { u.prot = clamp(u.prot + .06, 0, .85); u.dodge += 4; } else { u.crit += 7; u.bondDmg = .06; } }
  }
}
function bondStress(B) { // appelé après chaque combat
  for (const u of [...B.heroes, ...B.fallen]) { const h = heroById(u.hid); if (!h) continue;
    if (u.bond === "rival") h.stress = clamp((h.stress || 0) + 6, 0, 100);
    for (const f of B.fallen) if (f !== u && bondOf(f.hid, u.hid) && bondOf(f.hid, u.hid).t === "ami") h.stress = clamp((h.stress || 0) + 18, 0, 100);
  }
}

// Trophées : chaque gardien vaincu laisse un trophée exposé au Bastion (+1 % de dégâts et +2 % d'or chacun, 15 trophées au plus comptés).
function trophyCount() { return Object.keys(S.trophies || {}).length; }
function trophyHooks() { const n = Math.min(15, trophyCount()); return n ? { dmg: n * .01, gold: n * .02 } : null; }
function trophyAfterBattle(B) {
  if (B.over !== "win") return null; S.trophies = S.trophies || {}; let nw = null;
  for (const e of B.dead || []) if (e.boss && !S.trophies[e.key]) { S.trophies[e.key] = { at: Date.now() }; nw = e.name; }
  return nw;
}

// Primes : chaque jour, une élite nommée à abattre (elle apparaît une fois sur deux dans les salles d'élite).
const BOUNTY_NAMES = ["le Boucher", "l'Écorcheur", "la Veuve", "le Sans-Pitié", "le Fléau", "l'Ombre rouge", "le Mangeur d'hommes", "la Hyène"];
function bountyOf() {
  const d = S.daily; if (!d) return null;
  if (!d.bounty) { const rng = mkRng(hashStr("prime" + d.key)), won = Object.keys(S.beatenElites || {}).filter(k => MONSTERS[k] && MONSTERS[k].elite), pool = won.length ? won : ALL_ELITES.filter(k => !MONSTERS[k].boss); // prime : une élite déjà rencontrée
    const k = rng.pick(pool), lv = Math.max(1, ...S.heroes.map(h => h.lvl));
    d.bounty = { key: k, title: rng.pick(BOUNTY_NAMES), gold: 150 + lv * 40, shards: 2 + Math.floor(lv / 5), done: 0 }; }
  return d.bounty;
}
const bountyKey = () => { const b = S.daily && S.daily.bounty; return b && !b.done ? b.key : null; };
function bountyAfterBattle(B) {
  const b = S.daily && S.daily.bounty; if (!b || b.done || B.over !== "win") return null;
  if (!(B.dead || []).some(e => e.key === b.key && e.elite)) return null;
  b.done = 1; S.gold += b.gold; S.shards = (S.shards || 0) + b.shards; return b;
}
const bountyName = b => `${MONSTERS[b.key].name || MONSTERS[b.key].n}, dit « ${b.title.replace(/^(le |la |l')/, m => m) } »`;

// Météo : tirée au départ de chaque expédition (hors Abîme).
const WEATHERS = {
  brouillard: { n: "Brouillard", ic: "eye", d: "−10 de précision pour tous.", mods: { fog: 10 } },
  pluie: { n: "Pluie battante", ic: "rain", d: "Feu affaibli : compétences de feu −25 %, brûlures −40 %.", mods: { rain: 1 } },
  lune: { n: "Lune rouge", ic: "moon", d: "Ennemis enragés (+15 % de dégâts, +1 vitesse), mais butin amélioré.", mods: { edmgM: .15, espd: 1 }, luck: .06 }
};
function rollWeather(run) { if (run.region === "abime") return null; const r = rnd(); return r < .14 ? "brouillard" : r < .28 ? "pluie" : r < .38 ? "lune" : null; }
