/* ═══════════════════════ Salles : événements, camp, colporteur, combats ═══════════════════════ */
function lightCost(run) { let c = 7; const rh = relicHooks(run); if (rh.lightSave) c *= 1 - rh.lightSave; if (run.oaths.includes("nuit")) c *= 2; if (rh.lightDrain) c *= 2; if (run.night) c *= 1.3; return c; }
function enterNode(run, node) {
  run.pos = { c: node.c, i: node.i };
  run.light = clamp(run.light - lightCost(run), 0, 100);
  contractProgress("rooms");
  node.visited = true;
  if (node.type === "event") node.ev = node.ev || pickEvent(run);
  if (node.type === "shop") node.stock = node.stock || shopStock(run);
}
function pickEvent(run) {
  run.seenEv = run.seenEv || [];
  const fl = run.flags || [], sf = (S && S.flags) || [];
  const ok = e => (!e.reg || e.reg.includes(run.region)) && (!e.need || fl.includes(e.need)) && (!e.sneed || sf.includes(e.sneed));
  const here = EVENTS.filter(ok), pool = here.filter(e => !run.seenEv.includes(e.id));
  const chains = pool.filter(e => e.chain); // une suite attendue a de bonnes chances d'arriver
  const e = chains.length && chance(.6) ? pick(chains) : pick(pool.filter(e => !e.chain).length ? pool.filter(e => !e.chain) : here.filter(e => !e.chain));
  if (e.sneed && S.flags) S.flags = S.flags.filter(f => f !== e.sneed); run.seenEv.push(e.id); return e.id;
}
// ce que fait un choix, en clair (affiché sous chaque choix avant de décider)
function fxText(fx) {
  const P = [], pc = v => Math.round(v * 100) + " %";
  const one = f => {
    const o = [];
    if (f.cost) o.push(["bad", "−" + f.cost + " or"]);
    if (f.gold) o.push(["good", "+" + f.gold + " or"]);
    if (f.heal) o.push(["good", "Soins " + pc(f.heal)]);
    if (f.hurt) o.push(["bad", "−" + pc(f.hurt) + " PV au groupe"]);
    if (f.poison) o.push(["bad", "Poison (−8 % PV)"]);
    if (f.relic) o.push(["good", "Relique"]);
    if (f.loot) o.push(["good", "Équipement"]);
    if (f.trinket) o.push(["good", "Bibelot"]);
    if (f.mat) o.push(["good", "+" + f.mat + " ferraille"]);
    if (f.ess) o.push(["good", "+" + f.ess + " essence"]);
    if (f.light) o.push([f.light > 0 ? "good" : "bad", (f.light > 0 ? "+" : "−") + Math.abs(f.light) + " lueur"]);
    if (f.morale) o.push([f.morale > 0 ? "good" : "bad", (f.morale > 0 ? "+" : "−") + Math.abs(f.morale) + " résolution"]);
    if (f.xp) o.push(["good", "+" + f.xp + " expérience"]);
    if (f.petXp) o.push(["good", "Expérience du compagnon"]);
    if (f.potion) o.push(["good", "+1 potion"]);
    if (f.potionCost) o.push(["bad", "−1 potion"]);
    if (f.cleanse) o.push(["good", "Purification"]);
    if (f.buff) o.push(["good", "+20 % dégâts au prochain combat"]);
    if (f.upgrade) o.push(["good", "Améliore une arme ou armure"]);
    if (f.curse) o.push(["bad", "Malédiction (ennemis +10 % dégâts)"]);
    if (f.fight) o.push(["bad", "Combat"]);
    if (f.flag || f.sflag) o.push(["risk", "✦ Aura une suite"]);
    return o.map(([c, t]) => `<span class="fx ${c}">${t}</span>`).join("");
  };
  const rest = Object.assign({}, fx); delete rest.gamble;
  const base = one(rest); if (base) P.push(base);
  if (fx.gamble) { const [p, a, b] = fx.gamble; P.push(`<span class="fx risk">${Math.round(p * 100)} % de chances :</span>${one(a) || '<span class="fx">rien</span>'}<span class="fx risk">sinon :</span>${one(b) || '<span class="fx">rien</span>'}`); }
  return P.join("") || '<span class="fx">Rien ne se passe</span>';
}
// applique l'effet d'un choix d'événement ; renvoie { text:[], fight }
function resolveEvent(run, evId, ci) {
  const E = EVENTS.find(e => e.id === evId), C = E.ch[ci], out = { text: [], fight: false };
  let fx = C.fx;
  if (fx.cost) { if (S.gold + run.gold < fx.cost) { out.text.push("Vous n'avez pas assez d'or."); return out; } if (run.gold >= fx.cost) run.gold -= fx.cost; else { S.gold -= fx.cost - run.gold; run.gold = 0; } }
  const apply = f => {
    const party = runParty().filter(h => !run.fallen.includes(h.id));
    if (f.gold) { run.gold += f.gold; out.text.push("+" + f.gold + " or"); }
    if (f.hurt) { for (const h of party) { const mx = heroStats(h, relicHooks(run)).hp; h.hp = Math.max(1, Math.round((h.hp == null ? mx : h.hp) - mx * f.hurt)); } out.text.push("Le groupe est blessé."); }
    if (f.heal) { healParty(run, f.heal); out.text.push("Le groupe reprend des forces."); }
    if (f.relic) { const r = randRelic(run); if (r) { addRelic(run, r); out.text.push("Relique obtenue : " + RELICS[r].n); out.relic = r; } }
    if (f.loot) { const it = lootGear(runLevel(run, null) + 1, .05); run.loot.push(it); out.text.push("Butin : " + gearName(it)); out.item = it; }
    if (f.trinket) { const it = makeGear("tr", null, 1, rollRarity(.05)); run.loot.push(it); out.text.push("Bibelot : " + gearName(it)); out.item = it; }
    if (f.mat) { run.mats.fer += f.mat; out.text.push("+" + f.mat + " ferraille"); }
    if (f.ess) { run.mats.essence += f.ess; out.text.push("+" + f.ess + " essence"); }
    if (f.light) { run.light = clamp(run.light + f.light, 0, 100); out.text.push((f.light > 0 ? "+" : "") + f.light + " lueur"); }
    if (f.morale) { run.morale = clamp((run.morale || 0) + f.morale, -30, 30); out.text.push((f.morale > 0 ? "+" : "") + f.morale + " résolution au prochain combat"); }
    if (f.xp) { for (const h of party) giveXp(h, f.xp); out.text.push("+" + f.xp + " expérience"); }
    if (f.petXp && run.pet) { givePetXp(run.pet, f.petXp); out.text.push("Votre compagnon gagne en expérience."); }
    if (f.potion) { run.potions++; out.text.push("+1 potion"); }
    if (f.potionCost) { if (run.potions > 0) { run.potions--; out.text.push("-1 potion"); } else out.text.push("Vous n'aviez plus de potion… il vous remercie quand même."); }
    if (f.cleanse) out.text.push("Les esprits s'apaisent.");
    if (f.curse) { run.curse = (run.curse || 0) + 1; out.text.push("Une malédiction pèse sur vous : les ennemis frappent plus fort."); }
    if (f.poison) { for (const h of party) { const mx = heroStats(h, relicHooks(run)).hp; h.hp = Math.max(1, Math.round((h.hp == null ? mx : h.hp) - mx * .08)); } out.text.push("Empoisonnés !"); }
    if (f.buff) { run.buff = (run.buff || 0) + 1; out.text.push("Une chaleur étrange : +20 % de dégâts au prochain combat."); }
    if (f.upgrade) { const its = party.flatMap(h => [h.gear.wpn, h.gear.arm]).filter(it => it && it.up < 10); if (its.length) { const it = pick(its); it.up++; out.text.push(gearName(it) + " est amélioré."); } }
    if (f.fight) { out.fight = true; out.text.push("Une embuscade !"); }
    if (f.flag) { run.flags = (run.flags || []).concat(f.flag); out.text.push("<i>Ce geste aura peut-être une suite…</i>"); }
    if (f.sflag) { S.flags = (S.flags || []).filter(x => x !== f.sflag).concat(f.sflag); out.text.push("<i>Quelqu'un se souviendra de vous…</i>"); }
  };
  if (fx.gamble) { const [p, a, b] = fx.gamble; const ok = chance(p); out.text.push(ok ? "La chance vous sourit." : "Mauvaise fortune…"); apply(ok ? a : b); }
  const rest = Object.assign({}, fx); delete rest.gamble; delete rest.cost; apply(rest);
  if (!out.text.length) out.text.push("Vous poursuivez votre route.");
  return out;
}
function healParty(run, frac) {
  const rh = relicHooks(run);
  for (const h of runParty()) { if (run.fallen.includes(h.id)) continue; const mx = heroStats(h, rh).hp; h.hp = Math.min(mx, Math.round((h.hp == null ? mx : h.hp) + mx * frac)); }
}
// colporteur
function shopStock(run) {
  const lvl = runLevel(run, null);
  const st = [{ k: "potion", n: "Potion de soin", d: "Soigne 40 % et purge les altérations.", cost: 35 + lvl * 2 }, { k: "heal", n: "Onguents", d: "Soigne tout le groupe de 35 %.", cost: 50 + lvl * 4 }, { k: "light", n: "Torches", d: "+40 lueur.", cost: 30 + lvl }];
  const r1 = randRelic(run), r2 = randRelic(run, RNG, 1);
  if (r1) st.push({ k: "relic", id: r1, n: RELICS[r1].n, d: RELICS[r1].d, cost: 90 + RELICS[r1].r * 60 + lvl * 3 });
  if (r2 && r2 !== r1) st.push({ k: "relic", id: r2, n: RELICS[r2].n, d: RELICS[r2].d, cost: 90 + RELICS[r2].r * 60 + lvl * 3 });
  const it = lootGear(lvl + 1, .1); st.push({ k: "item", it, n: gearName(it), d: RARITY[it.rar].n, cost: 70 + it.tier * 40 + it.rar * 70 });
  return st;
}
function shopBuy(run, node, idx) {
  const o = node.stock[idx]; if (!o || o.sold) return false;
  const have = run.gold + S.gold; if (have < o.cost) return false;
  if (run.gold >= o.cost) run.gold -= o.cost; else { S.gold -= o.cost - run.gold; run.gold = 0; }
  o.sold = 1;
  if (o.k === "potion") run.potions++;
  if (o.k === "heal") healParty(run, .35);
  if (o.k === "light") run.light = clamp(run.light + 40, 0, 100);
  if (o.k === "relic") addRelic(run, o.id);
  if (o.k === "item") run.loot.push(o.it);
  return true;
}
// feu de camp : un seul choix
const CAMP = [
  { k: "rest", n: "Se reposer", d: "Soigne tout le groupe de 45 %." },
  { k: "train", n: "S'entraîner", d: "Chaque héros gagne de l'expérience." },
  { k: "watch", n: "Veiller", d: "+35 lueur et +10 résolution au prochain combat." },
];
function doCamp(run, k) {
  if (k === "rest") healParty(run, .45 * (run.week && weekRule() && weekRule().campX || 1));
  for (const h of runParty()) h.stress = Math.max(0, (h.stress || 0) - (k === "rest" ? 30 : 15)); // le feu apaise
  if (k === "train") { const xp = 30 + runLevel(run, null) * 8; for (const h of runParty()) if (!run.fallen.includes(h.id)) giveXp(h, xp); }
  if (k === "watch") { run.light = clamp(run.light + 35, 0, 100); run.morale = clamp((run.morale || 0) + 10, -30, 30); }
}
// préparation et fin d'un combat
function battleFor(run, node, enc) {
  const party = runParty().filter(h => !run.fallen.includes(h.id));
  const D = diffOf(), mods = { hp: D.hp, dmg: D.dmg * (1 + (run.curse || 0) * .1), prot: 0, spd: 0 };
  if (run.night) { mods.hp *= 1.15; mods.dmg *= 1.15; } // expédition de nuit
  const W = run.weather && WEATHERS[run.weather]; if (W) { if (W.mods.fog) mods.fog = W.mods.fog; if (W.mods.rain) mods.rain = 1; if (W.mods.edmgM) mods.dmg *= 1 + W.mods.edmgM; if (W.mods.espd) mods.spd += W.mods.espd; } // météo
  if (run.region === "abime") { mods.hp *= 1 + run.floor * .04; mods.dmg *= 1 + run.floor * .025; }
  for (const o of run.oaths) { if (o === "sang") mods.dmg *= 1 + OATHS.sang.v; if (o === "fer") mods.hp *= 1 + OATHS.fer.v; if (o === "hate") mods.spd += OATHS.hate.v; if (o === "pierre") mods.prot += OATHS.pierre.v; }
  const rh = relicHooks(run);
  if (run.week && weekRule()) { const W = weekRule(); if (W.heroDmg) rh.dmg = (rh.dmg || 0) + W.heroDmg; if (W.morale) rh.morale = (rh.morale || 0) + W.morale; if (W.heroHp) rh.hp = (rh.hp || 0) + W.heroHp; }
  if (run.buff) { rh.dmg = (rh.dmg || 0) + .2; }
  const B = newBattle(party, enc, { relicH: rh, pet: run.pet, light: run.light, mods, morale: (run.morale || 0) + S.bld.chapelle * 2, onLight: v => { run.light = clamp(run.light + v, 0, 100); B.light = run.light; } });
  B.node = node;
  return B;
}
function afterBattle(run, B) {
  run.buff = 0; run.morale = 0;
  if (typeof stressAfterBattle === "function") stressAfterBattle(run, B);
  if (typeof bondStress === "function") { bondStress(B); const t = trophyAfterBattle(B); if (t) (run.trophyNew = run.trophyNew || []).push(t); const b = bountyAfterBattle(B); if (b) run.bountyDone = b; if (B.lastBreaths) run.lastBreaths = (run.lastBreaths || 0) + B.lastBreaths; }
  // PV conservés, héros tombés
  for (const u of [...B.heroes, ...B.fallen]) { const h = heroById(u.hid); if (!h) continue; h.hp = u.fallen ? 0 : u.hp; if (u.fallen && !run.fallen.includes(h.id)) { run.fallen.push(h.id); run.flawless = false; } }
  const rh = relicHooks(run);
  if (rh.postHeal && B.over === "win") healParty(run, rh.postHeal);
  run.kills += B.kills; run.combats++;
  // bilan : cumul par héros, plus beau coup, ennemis notables vaincus
  const L = run.sum || (run.sum = { dmg: {}, heal: {}, taken: {}, kills: {}, best: null, foes: [], crits: 0 });
  const T = B.tally || { dmg: {}, heal: {}, taken: {} };
  for (const k of ["dmg", "heal", "taken"]) for (const id in T[k]) L[k][id] = (L[k][id] || 0) + T[k][id];
  for (const u of [...B.heroes, ...B.fallen]) if (u.kills) L.kills[u.hid] = (L.kills[u.hid] || 0) + u.kills;
  if (T.best && (!L.best || T.best.v > L.best.v)) L.best = T.best;
  L.crits += B.crits || 0;
  if (B.over === "win") for (const e of B.dead || []) if (e.boss || e.elite) L.foes.push({ name: e.name, boss: !!e.boss });
  questsAfterBattle(run, B);
  S.stats.kills += B.kills; if (B.over === "win") S.stats.wins++;
  contractProgress("kills", B.kills); contractProgress("crits", B.crits); contractProgress("ults", B.ults || 0);
  contractProgress("impie", (B.dead || []).filter(e => e.tags.includes("impie")).length);
  if (B.node && B.node.type === "elite" && B.over === "win") contractProgress("elites");
  for (const e of B.dead || []) S.seen.monsters[e.key] = (S.seen.monsters[e.key] || 0) + 1;
}
// une potion : soigne 40 % et purge (utilisée à la place d'une action)
function usePotion(B, run, u, tgt) {
  if (run.potions <= 0) return null;
  run.potions--; run.potionsUsed = (run.potionsUsed || 0) + 1;
  const ev = [{ k: "act", u: u.uid, sk: "Potion", anim: "potion", tgt: tgt.uid, t: "a" }];
  healUnit(B, null, tgt, tgt.hpMax * .4, ev); cleanse(tgt, ev);
  return ev;
}
// combat complet automatique (bots, mode auto)
function simBattle(B, run, style = "bal") {
  let guard = 0;
  while (!B.over && guard++ < 60) {
    startRound(B);
    let u;
    while (!B.over && (u = nextActor(B))) {
      beginTurn(B, u);
      if (!alive(u)) { checkEnd(B); continue; }
      if (u.skip) { endTurn(B, u); continue; }
      if (u.side === "e") enemyTurn(B, u);
      else {
        const dying = B.heroes.find(h => alive(h) && (h.agony || h.hp / h.hpMax < .18));
        if (dying && run && run.potions > 0 && (style !== "agr" || dying.agony) && !B.heroes.some(h => h.role === "soin" && alive(h) && h !== dying && !h.skip && chance(.6))) { usePotion(B, run, u, dying); }
        else { const a = heroAuto(B, u, style); if (a.move) swapHero(B, u, a.move); else { if (a.sk.isUlt) B.ults = (B.ults || 0) + 1; act(B, u, a.sk, a.tgt); } }
      }
      endTurn(B, u);
    }
    if (!B.over) { const ev = []; petAct(B, ev); checkEnd(B); }
  }
  if (!B.over) B.over = "lose";
  return B.over;
}
