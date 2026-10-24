/* ═══════════════════════ Actions du Bastion ═══════════════════════ */
function canPay(c) { return S.gold >= (c.gold || 0) && S.mats.fer >= (c.fer || 0) && S.mats.essence >= (c.essence || 0) && S.mats.cendre >= (c.cendre || 0) && S.shards >= (c.shards || 0); }
function pay(c) { if (!canPay(c)) return false; S.gold -= c.gold || 0; S.mats.fer -= c.fer || 0; S.mats.essence -= c.essence || 0; S.mats.cendre -= c.cendre || 0; S.shards -= c.shards || 0; return true; }
function addHero(h) { S.heroes.push(h); S.seen.classes[h.cls] = 1; checkAchievements(); }
function recruit(i) {
  const h = S.recruits[i]; if (!h) return { err: "Recrue introuvable." };
  if (S.heroes.length >= rosterMax()) return { err: "La caserne est pleine : agrandissez la Taverne ou renvoyez un héros." };
  const c = recruitPrice(i); if (S.gold < c) return { err: "Pas assez d'or." };
  S.gold -= c; S.recruits.splice(i, 1); addHero(h); return { ok: h };
}
// si la troupe compte moins de 4 héros, la recrue la moins chère est gratuite : on ne peut jamais être bloqué
function recruitPrice(i) { const c = recruitCost(S.recruits[i]); if (S.heroes.length < 4) { const min = Math.min(...S.recruits.map(recruitCost)); if (c === min) return 0; } return c; }
function rerollRecruits() { const c = 40 + S.bld.taverne * 20; if (S.gold < c) return false; S.gold -= c; refreshRecruits(); return true; }
function dismiss(id) { const h = heroById(id); if (!h || S.heroes.length <= 1) return false; for (const s of ["wpn", "arm", "tr1", "tr2"]) { const it = h.gear[s]; if (it && (s.startsWith("tr") || it.tier > 1 || it.rar > 0 || it.up > 0)) S.inv.push(it); } S.heroes = S.heroes.filter(x => x !== h); return true; }
function healCost(h) { return 30 + h.lvl * 15; }
function healInjured(id) { const h = heroById(id); if (!h || !isInjured(h)) return false; const c = Math.round(healCost(h) * (1 - (S.bld.chapelle - 1) * .15)); if (S.gold < c) return false; S.gold -= c; h.injured = 0; return true; }
// équipement
function canEquip(h, it) { if (!it) return false; if (it.kind === "tr") return true; return it.cls === h.cls && (it.tier < 6 || !!h.evo); } // palier VI : héros évolués
function equip(h, it, slot) {
  if (!canEquip(h, it)) return false;
  slot = slot || (it.kind === "wpn" ? "wpn" : it.kind === "arm" ? "arm" : (!h.gear.tr1 ? "tr1" : !h.gear.tr2 ? "tr2" : "tr1"));
  if (it.kind === "tr" && [h.gear.tr1, h.gear.tr2].some(x => x && x.key === it.key && x !== h.gear[slot])) return false;
  const i = S.inv.indexOf(it); if (i >= 0) S.inv.splice(i, 1);
  const old = h.gear[slot]; h.gear[slot] = it; if (old) S.inv.push(old);
  if (it.tier >= 5) S.stats.tier5 = Math.max(S.stats.tier5, 1);
  return true;
}
function unequip(h, slot) { const it = h.gear[slot]; if (!it || slot === "wpn" || slot === "arm") return false; h.gear[slot] = null; S.inv.push(it); return true; }
function upgradeItem(it) { if (!it || it.up >= 10) return false; if (it.up >= S.bld.forge * 2) return { err: "La Forge doit être améliorée pour aller plus loin." }; const c = upCost(it); if (!pay(c)) return { err: "Ressources insuffisantes." }; it.up++; return { ok: 1 }; }
function salvageItem(it) { const i = S.inv.indexOf(it); if (i < 0) return false; const r = salvage(it); S.inv.splice(i, 1); S.gold += r.gold; S.mats.fer += r.fer; S.mats.essence += r.essence; S.mats.cendre += r.cendre; return r; }
function craft(cls, kind, tier) {
  if (tier > S.bld.forge) return { err: "Améliorez la Forge pour ce palier." };
  const c = craftCost(tier); if (!pay(c)) return { err: "Ressources insuffisantes." };
  const it = makeGear(kind, cls, tier, rollRarity(.04 + S.bld.forge * .015)); S.inv.push(it); S.stats.crafts++;
  if (tier >= 5) S.stats.tier5 = 1; if (it.rar >= 3) S.stats.legend++;
  checkAchievements(); return { ok: it };
}
// évolution et compétences
const EVO_COST = { gold: 250, essence: 2 };
function evolve(h, evo) { if (h.evo || h.lvl < EVO_LVL || !CLASSES[h.cls].evos[evo]) return { err: "Impossible." }; if (!pay(EVO_COST)) return { err: "Il faut 250 or et 2 essences." }; h.evo = evo; for (const k of Object.keys(CLASSES[h.cls].evos[evo].skills)) h.skr[k] = 1; const ns = Object.keys(CLASSES[h.cls].evos[evo].skills); h.skills = h.skills.slice(0, 2).concat(ns); S.stats.evos++; if (h.lvl >= APEX_LVL) S.stats.apex++; checkAchievements(); return { ok: 1 }; }
const skillUpCost = r => ({ gold: Math.round(90 * Math.pow(r, 1.7)), essence: r >= 3 ? r - 2 : 0 });
function skillUp(h, id) { const r = h.skr[id] || 1; if (r >= 5) return { err: "Rang maximal." }; if (r >= skillRankMax()) return { err: "Améliorez la Salle des maîtres." }; if (!pay(skillUpCost(r))) return { err: "Ressources insuffisantes." }; h.skr[id] = r + 1; return { ok: 1 }; }
function setSkills(h, list) { const pool = heroSkillPool(h); const l = list.filter(x => pool.includes(x)).slice(0, 4); if (l.length < 1) return false; h.skills = l; return true; }
// bâtiments
function bldCost(k) { const B = BUILDINGS[k], l = S.bld[k]; if (l >= B.max) return null; return { gold: B.cost[l], shards: B.shards[l] }; }
function upgradeBld(k) { const c = bldCost(k); if (!c) return { err: "Niveau maximal." }; if (!pay(c)) return { err: "Ressources insuffisantes." }; if (k === "fonderie") bankTick(); S.bld[k]++; return { ok: 1 }; }
// compagnons
function adoptPet(id) { const P = PETS[id]; if (S.pets.owned.includes(id)) return { err: "Déjà adopté." }; if (!petUnlocked(id)) return { err: "Pas encore disponible." }; const c = P.cost || 0; if (S.pets.owned.length - 1 >= S.bld.menagerie + 1) return { err: "Agrandissez la Ménagerie." }; if (S.gold < c) return { err: "Pas assez d'or." }; S.gold -= c; S.pets.owned.push(id); S.pets.lvl[id] = Math.max(1, Math.round(petLvl(S.pet || id) * .6)); S.pets.xp[id] = 0; checkAchievements(); return { ok: 1 }; }
const PET_EVO_COST = { gold: 600, essence: 4, shards: 1 };
function evolvePet(id) { if (petEvolved(id) || petLvl(id) < PET_EVO_LVL) return { err: "Niveau 10 requis." }; if (!pay(PET_EVO_COST)) return { err: "Il faut 600 or, 4 essences et 1 éclat." }; S.pets.evo[id] = 1; S.stats.petEvo++; checkAchievements(); return { ok: 1 }; }
// nouvelle partie : 4 héros tirés au sort (un tank, un soigneur, deux autres) et un compagnon parmi trois proposés
const START_SLOTS = [["tank"], ["soin"], ["dps"], ["dps", "soutien"]];
function rollStartClass(slot, taken = []) {
  const pool = CLASS_IDS.filter(c => START_SLOTS[slot].includes(CLASSES[c].role) && !taken.includes(c));
  return pick(pool.length ? pool : CLASS_IDS.filter(c => !taken.includes(c)));
}
function rollStartParty() { const out = []; for (let i = 0; i < START_SLOTS.length; i++) out.push(rollStartClass(i, out)); return out; }
function rollStarterPets(n = 3) { const pool = PET_IDS.filter(p => PETS[p].starter); RNG.shuffle(pool); return pool.slice(0, n); }
function newGame(petId, opt = {}) {
  S = newState(opt);
  const cls = opt.classes || rollStartParty();
  const list = cls.map((c, i) => opt.heroes && opt.heroes[i] && opt.heroes[i].cls === c ? opt.heroes[i] : makeHero(c));
  list.sort((a, b) => CLASSES[a.cls].rk[0] - CLASSES[b.cls].rk[0]);
  for (const h of list) addHero(h);
  S.pets.owned = [petId]; S.pets.lvl[petId] = 1; S.pets.xp[petId] = 0; S.pet = petId;
  S.potions = 0; refreshRecruits(); dailyCheck(); weekCheck(); seasonCheck();
  return S;
}
