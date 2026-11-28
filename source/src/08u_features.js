// ── Améliorations du 6 nov. (logique) : gardien de saison à 3 phases, formations, enchaînements, recommencer un combat,
// gemmes, prestige (cycles), maîtrises de classe, familiers légendaires, gardiens errants (codex + événements),
// seconde compagnie (relève), mode Ironman, résumé de séance, notifications ──

// passifs supplémentaires des héros (gemmes, prestige, maîtrise) : lus par heroPassives
const PAS_HOOKS = [];

// 1 · Gardien de saison de l'Abîme : trois phases, le décor change à chaque phase
const SEASON_PHASES = [
  { at: .66, n: "Le gardien de la saison déchire le voile : l'Abîme se teinte de violet.", tint: "rgba(110,30,170,.26)", sfx: [{ k: "dmgUp", v: .2, t: 99 }, { k: "shield", v: .1, t: 2 }] },
  { at: .33, n: "Dernière phase : le sol s'embrase, le gardien n'a plus rien à perdre.", tint: "rgba(190,40,20,.3)", sfx: [{ k: "dmgUp", v: .3, t: 99 }, { k: "spdUp", v: 3, t: 99 }] },
];

// 2 · Formations : bonus selon les rôles placés à chaque rang (rang 1 = devant)
const FORMATIONS = {
  mur: { n: "Mur de boucliers", d: "Deux tanks aux rangs 1 et 2 : +8 % de protection pour eux.", test: r => r[0] === "tank" && r[1] === "tank", apply: us => us.slice(0, 2).forEach(u => u.prot = Math.min(.8, u.prot + .08)) },
  phalange: { n: "Phalange", d: "Un tank devant, un héros de dégâts juste derrière : +10 % de dégâts au rang 2.", test: r => r[0] === "tank" && r[1] === "dps", apply: us => { const u = us[1]; if (u) { u.dmgLo *= 1.1; u.dmgHi *= 1.1; } } },
  arriere: { n: "Ligne d'archers", d: "Deux héros de dégâts aux rangs 3 et 4 : +8 de critique pour eux.", test: r => r[2] === "dps" && r[3] === "dps", apply: us => us.slice(2, 4).forEach(u => u.crit += 8) },
  sanctuaire: { n: "Sanctuaire", d: "Un soigneur au rang 4 et un soutien ou soigneur au rang 3 : +12 % de soins pour tout le groupe.", test: r => r[3] === "soin" && (r[2] === "soutien" || r[2] === "soin"), apply: us => us.forEach(u => u.healPow *= 1.12) },
  equilibre: { n: "Compagnie équilibrée", d: "Un tank, un soigneur et deux autres héros : +5 résistance pour tous.", test: r => r.filter(x => x === "tank").length === 1 && r.filter(x => x === "soin").length === 1 && r.length === 4, apply: us => us.forEach(u => u.res += 5) },
};
function formationsOf(roles) { return Object.keys(FORMATIONS).filter(k => { try { return FORMATIONS[k].test(roles); } catch (e) { return false; } }); }
function applyFormations(B) { const us = B.heroes, roles = us.map(u => u.role); B.formations = formationsOf(roles); for (const k of B.formations) FORMATIONS[k].apply(us); }

// 3 · Enchaînements : un héros qui étourdit ou marque un ennemi lance l'attaque d'un allié de dégâts (une fois par tour de table)
const CHAIN_MULT = .55;
function chainFollowUp(B, u, sk, ev) {
  if (!B || u.side !== "h" || B.over) return; if (B.chainRound === B.round) return;
  const applies = (sk.fx || []).some(f => f.k === "stun" || f.k === "mark"); if (!applies) return;
  const tgt = B.enemies.find(e => alive(e) && e.st.some(s => (s.k === "stun" || s.k === "mark") && s.src === u.uid)) || B.enemies.find(e => alive(e) && e.st.some(s => s.k === "stun" || s.k === "mark"));
  if (!tgt) return;
  const ally = B.heroes.filter(h => alive(h) && h !== u && !h.agony && !h.skip && h.role === "dps").sort((a, b) => (b.dmgLo + b.dmgHi) - (a.dmgLo + a.dmgHi))[0];
  if (!ally) return; B.chainRound = B.round;
  ev.push({ k: "combo", u: tgt.uid, v: CHAIN_MULT, chain: ally.name }); counter(B, ally, tgt, CHAIN_MULT, ev);
}

// 4 · Recommencer un combat perdu : une fois par expédition, contre 30 lueur (pas en mode Ironman)
const RETRY_LIGHT = 30;
const canRetry = run => !!run && !run.retried && !(S && S.ironman) && run.light >= RETRY_LIGHT;

// 5 · Gemmes : emplacements sur les objets Mythiques et mieux (1 à 4), six pierres, niveaux 1 à 6 (fusion 3 → 1)
const GEMS = {
  rubis: { n: "Rubis", c: "#ff4a5a", d: v => `+${Math.round(v * 100)} % de dégâts`, pas: v => [{ k: "stat", s: "dmg", v }], v: .03 },
  saphir: { n: "Saphir", c: "#4a8aff", d: v => `+${Math.round(v * 100)} % de PV`, pas: v => [{ k: "stat", s: "hp", v }], v: .04 },
  emeraude: { n: "Émeraude", c: "#4ad07a", d: v => `+${Math.round(v * 100)} % de soins`, pas: v => [{ k: "stat", s: "healPow", v }], v: .04 },
  topaze: { n: "Topaze", c: "#ffc84a", d: v => `+${Math.round(v)} de critique`, pas: v => [{ k: "stat", s: "crit", v }], v: 2 },
  onyx: { n: "Onyx", c: "#a0a0b8", d: v => `+${Math.round(v * 100)} % de protection`, pas: v => [{ k: "stat", s: "prot", v }], v: .02 },
  opale: { n: "Opale", c: "#e8d0ff", d: v => `+${Math.round(v)} de résistance`, pas: v => [{ k: "stat", s: "res", v }], v: 4 },
};
const GEM_MAX = 10;
const gemVal = (k, l) => GEMS[k].v * l;
const sockets = it => !it ? 0 : it.rar >= 9 ? 5 : it.kind !== "tr" && it.rar >= 5 ? Math.min(4, it.rar - 4) : 0; /* Éternel : 5 emplacements, bibelots compris */
function gemAdd(k, l = 1, n = 1) { S.gems = S.gems || {}; const id = k + ":" + l; S.gems[id] = (S.gems[id] || 0) + n; }
function gemTake(id) { if (!S.gems || !S.gems[id]) return false; if (--S.gems[id] <= 0) delete S.gems[id]; return true; }
function gemFuse(id) { const [k, l] = id.split(":"); if (+l >= GEM_MAX || !S.gems || (S.gems[id] || 0) < 3) return false; S.gems[id] -= 3; if (!S.gems[id]) delete S.gems[id]; gemAdd(k, +l + 1); return true; }
function gemSocket(it, id) { if (!it || (it.gems || []).length >= sockets(it) || !gemTake(id)) return false; (it.gems = it.gems || []).push(id); return true; }
function gemUnsocket(it, i) { if (!it || !it.gems || !it.gems[i]) return false; const id = it.gems.splice(i, 1)[0]; const [k, l] = id.split(":"); gemAdd(k, +l); return true; }
function gemRoll(rng, lvlMax = 1) { const k = rng.pick(Object.keys(GEMS)), l = 1 + Math.floor(rng() * lvlMax); return k + ":" + Math.min(GEM_MAX, l); }
PAS_HOOKS.push(h => { const out = []; for (const s of ["wpn", "arm", "tr1", "tr2"]) { const it = h.gear[s]; for (const id of (it && it.gems) || []) { const [k, l] = id.split(":"); if (GEMS[k]) out.push(...GEMS[k].pas(gemVal(k, +l))); } } return out; });
// butin : élites 20 %, gardiens 55 % (niveau 1–2, plus haut dans l'Abîme), coffres 10 %
function gemDrop(run, node, rng = RNG) {
  const t = node && node.type, deep = run.region === "abime" ? Math.floor((run.floor || 1) / 10) : 0;
  const p = t === "boss" ? .55 : t === "elite" ? .2 : t === "treasure" ? .1 : 0; if (!p || !rng.chance(p)) return null;
  return gemRoll(rng, (t === "boss" ? 2 : 1) + deep);
}

// 6 · Prestige : chaque nouveau cycle (après la fin de l'histoire) donne un bonus permanent et dore le Bastion
const prestigeRank = () => (typeof S !== "undefined" && S && S.cycle) || 0;
PAS_HOOKS.push(() => { const p = prestigeRank(); return p ? [{ k: "stat", s: "dmg", v: .04 * p }, { k: "stat", s: "hp", v: .04 * p }] : []; });
const prestigeGold = () => 1 + .1 * prestigeRank();

// 7 · Maîtrise de classe : 50 expéditions réussies avec une classe → tenue de maître et passif
const MASTERY_WINS = 50;
const mastered = cls => ((typeof S !== "undefined" && S && S.classWins) || {})[cls] >= MASTERY_WINS;
PAS_HOOKS.push(h => mastered(h.cls) ? [{ k: "stat", s: "dmg", v: .05 }, { k: "stat", s: "hp", v: .05 }, { k: "stat", s: "res", v: 5 }] : []);

// 8 · Familiers légendaires : versions mythiques de trois compagnons, gagnées en vainquant les gardiens errants
const LEGEND_PETS = [
  ["fenrir", "loup", "Fenrir des Cendres", "#ff7a2a", 7],
  ["corbeau_fin", "corbeau", "Corbeau de la Fin", "#9a6aff", 14],
  ["ours_titan", "ours", "Ours-Titan", "#ffd27a", 20],
];
for (const [id, base, n, hue, need] of LEGEND_PETS) { const B = PETS[base]; if (!B || PETS[id]) continue;
  PETS[id] = Object.assign(JSON.parse(JSON.stringify(B)), { n, artOf: base, hue, legend: need, starter: 0, pool0: 0, cost: 20000 + need * 1000, rank: 1.8, d: (B.d || "") + " Version légendaire : plus puissante en tout.", unl: null }); if (!PET_IDS.includes(id)) PET_IDS.push(id); }
// noms propres des formes évoluées (sans doublon avec le loup ou le corbeau ordinaires)
{ const EVN = { fenrir: "Fenrir, Dévoreur de Soleils", corbeau_fin: "Héraut de la Fin", ours_titan: "Ours-Titan ancestral" }; for (const id in EVN) if (PETS[id] && PETS[id].evo) PETS[id].evo.n = EVN[id]; }
const wanderBeaten = () => typeof WANDER_BOSSES === "undefined" ? [] : Object.keys(WANDER_BOSSES).filter(k => (S.beaten || {})[k]);
const wanderVariantsBeaten = () => typeof WANDER_BOSSES === "undefined" ? 0 : Object.keys(S.beaten || {}).filter(k => MONSTERS[k] && MONSTERS[k].variantOf && WANDER_BOSSES[MONSTERS[k].variantOf]).length;
const legendPetOpen = id => { const P = PETS[id]; return !!(P && P.legend && wanderBeaten().length >= P.legend); };

// 10 · Événement propre à chaque gardien errant, juste avant le combat
const WANDER_EV = {
  bourreau_morvaine: ["Sur l'échafaud, le Bourreau aiguise sa hache. Une liste de noms est clouée au poteau : les vôtres.", [["Arracher la liste", { bossWeak: .1, morale: -4 }], ["Le défier à voix haute", { morale: 8, bossRage: .1, gold: 60 }]]],
  tisseuse_peste: ["Des fils poisseux barrent la ruelle. Chaque fil vibre au rythme d'une toux lointaine.", [["Brûler les toiles (−10 lueur)", { light: -10, bossWeak: .12 }], ["Les traverser", { hurt: .06 }]]],
  dame_lanternes: ["Une lanterne flotte devant vous, puis une autre. Elles veulent vous montrer un chemin.", [["Les éteindre une à une", { light: -8, bossWeak: .1 }], ["Les suivre", { light: 15, bossRage: .1 }]]],
  pere_corbeaux: ["Un champ de croix de paille. Sur chacune, un corbeau vous fixe sans un cri.", [["Jeter du grain", { morale: 6 }], ["Abattre les croix", { bossWeak: .12, morale: -3 }]]],
  cerf_pendu: ["Des cordes pendent des arbres, toutes tendues vers la même clairière.", [["Couper les cordes", { bossWeak: .12, xp: 20 }], ["Prier pour les pendus", { morale: 8, heal: .05 }]]],
  veneur_sauvage: ["Un cor résonne. Des chiens fantômes tournent autour du groupe sans attaquer… pas encore.", [["Leur jeter de la viande", { cost: 40, bossWeak: .12 }], ["Courir vers la clairière", { morale: -4, light: 10 }]]],
  ossuaire_vivant: ["Les murs d'os craquent. Des crânes roulent vers vous en claquant des dents.", [["Les briser un à un", { bossWeak: .1, hurt: .04 }], ["Avancer sans les regarder", { morale: -5 }]]],
  sacristine: ["Un murmure de litanie. Les cierges s'allument seuls à votre passage.", [["Souffler les cierges", { light: -10, bossWeak: .12 }], ["Joindre les mains", { heal: .08, bossRage: .08 }]]],
  ver_tombes: ["Le sol tremble. Des cercueils remontent à la surface, éventrés de l'intérieur.", [["Sceller les tombes", { xp: 25, bossWeak: .1 }], ["Fouiller les cercueils", { gold: 80, bossRage: .1 }]]],
  crapaud_roi: ["Un chœur de crapauds. Tous se taisent quand vous approchez du grand nénuphar.", [["Offrir une pièce d'or", { cost: 30, morale: 8, bossWeak: .08 }], ["Écraser le nénuphar", { bossRage: .12, gold: 70 }]]],
  lavandiere: ["Au bord de l'eau, une femme frotte un linceul. Elle chante votre nom.", [["Lui prendre le linceul", { bossWeak: .15, curse: 1 }], ["Passer votre chemin", { morale: -6 }]]],
  idole_engloutie: ["La surface du lac bout. Des bulles portent des mots dans une langue morte.", [["Répondre dans cette langue", { bossWeak: .12, morale: -4 }], ["Jeter une relique au lac", { bossWeak: .2, morale: 4 }]]],
  connetable: ["Un étendard royal en lambeaux barre le corridor. Un spectre en armure monte la garde.", [["Saluer l'étendard", { morale: 10 }], ["Déchirer l'étendard", { bossWeak: .12, bossRage: .05 }]]],
  gargouille_mere: ["Sur les toits, des dizaines de gargouilles tournent la tête vers vous.", [["Avancer à couvert", { light: -10 }], ["Briser les petites", { bossRage: .12, xp: 30 }]]],
  inquisiteur_noir: ["Un tribunal vide. Sur le banc des accusés, vos noms sont gravés.", [["Plaider", { heal: .06, morale: 5 }], ["Renverser le banc", { bossWeak: .1, curse: 1, gold: 50 }]]],
  horloger_fou: ["Mille horloges sonnent minuit à la fois. Le temps semble ralentir.", [["Arrêter les balanciers", { bossWeak: .12 }], ["Remonter une horloge", { xp: 40, bossRage: .1 }]]],
  forgeron_braise: ["Une enclume rougeoyante, des armes à moitié forgées. L'une porte votre blason.", [["Tremper la lame dans l'eau", { bossWeak: .12 }], ["La prendre", { gold: 90, bossRage: .1 }]]],
  grande_salamandre: ["Le sable fond en verre sous vos pieds. Une chaleur folle monte du cratère.", [["Contourner le cratère (−15 lueur)", { light: -15, bossWeak: .1 }], ["Plonger droit dedans", { hurt: .08, bossRage: .05 }]]],
  titan_suie: ["Une pluie de suie noircit tout. Respirer devient une épreuve.", [["Se couvrir le visage", { heal: .05 }], ["Raviver les torches", { light: 20, bossRage: .08 }]]],
  mangeur_rois: ["Une salle de trône. Cent couronnes rongées jonchent le sol.", [["Ramasser une couronne", { gold: 120, bossRage: .12 }], ["Les laisser aux morts", { morale: 8, bossWeak: .08 }]]],
};
function wanderEvApply(run, fx) {
  const out = [], party = runParty().filter(h => !run.fallen.includes(h.id)), rh = relicHooks(run);
  if (fx.cost) { const c = Math.min(fx.cost, run.gold + S.gold); const fr = Math.min(run.gold, c); run.gold -= fr; S.gold -= c - fr; out.push(`−${c} or.`); }
  if (fx.gold) { run.gold += fx.gold; out.push(`+${fx.gold} or.`); }
  if (fx.light) { run.light = clamp(run.light + fx.light, 0, 100); out.push(`${fx.light > 0 ? "+" : ""}${fx.light} lueur.`); }
  if (fx.morale) { run.morale = clamp((run.morale || 0) + fx.morale, -30, 30); out.push(`${fx.morale > 0 ? "+" : ""}${fx.morale} résolution au prochain combat.`); }
  if (fx.heal) { healParty(run, fx.heal); out.push("Le groupe reprend des forces."); }
  if (fx.hurt) { for (const h of party) { const mx = heroStats(h, rh).hp; h.hp = Math.max(1, Math.round((h.hp == null ? mx : h.hp) - mx * fx.hurt)); } out.push("Le groupe est blessé."); }
  if (fx.xp) { for (const h of party) giveXp(h, fx.xp); out.push(`+${fx.xp} expérience.`); }
  if (fx.curse) { run.curse = (run.curse || 0) + fx.curse; out.push("Une malédiction vous suit."); }
  if (fx.bossWeak) { run.bossWeak = (run.bossWeak || 0) + fx.bossWeak; out.push(`Le gardien est affaibli (−${Math.round(fx.bossWeak * 100)} % de PV).`); }
  if (fx.bossRage) { run.bossRage = (run.bossRage || 0) + fx.bossRage; out.push(`Le gardien est enragé (+${Math.round(fx.bossRage * 100)} % de PV, meilleur butin).`); }
  return out;
}

// 11 · Seconde compagnie : une réserve suit l'expédition ; une relève (échange d'un héros) par expédition ; la réserve gagne la moitié de l'expérience
const RESERVE_MAX = 4;
function pickReserve(party, n = RESERVE_MAX) { return S.heroes.filter(h => !party.includes(h.id) && !(typeof isInjured === "function" && isInjured(h))).sort((a, b) => b.lvl - a.lvl).slice(0, n).map(h => h.id); }
function relieve(run, outId, inId) {
  if (!run || run.relieved || !(run.reserve || []).includes(inId) || !run.party.includes(outId) || run.fallen.includes(outId)) return false;
  const i = run.party.indexOf(outId); run.party[i] = inId; run.reserve[run.reserve.indexOf(inId)] = outId; run.relieved = 1; return true;
}

// 12 · Ironman : morts définitives, pas de seconde chance ni d'import de sauvegarde ; or et expérience ×2
const ironMul = () => (typeof S !== "undefined" && S && S.ironman) ? 2 : 1;

// 15 · Résumé de séance : instantané au chargement, écart enregistré à chaque sauvegarde
function sessSnap() { return { t: Date.now(), gold: S.gold, lv: S.heroes.reduce((a, h) => a + h.lvl, 0), runs: (S.stats && S.stats.runs) || 0, kills: (S.stats && S.stats.kills) || 0, beaten: Object.keys(S.beaten || {}).length, ach: Object.keys(S.ach || {}).length, inv: S.inv.length };}
function sessDiff(a, b) { return { start: a.t, end: b.t, gold: b.gold - a.gold, lv: b.lv - a.lv, runs: b.runs - a.runs, kills: b.kills - a.kills, beaten: b.beaten - a.beaten, ach: b.ach - a.ach }; }
