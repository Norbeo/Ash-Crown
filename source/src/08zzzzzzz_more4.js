/* ═══════════ Améliorations du 7 nov. (soir) — logique ═══════════ */
// ── 13 · Éveil d'un objet Éternel : sacrifier un autre Éternel de la même classe pour relancer UN trait ──
const AWAKEN_GOLD = 25000;
function awakenCands(it) { return S.inv.filter(x => x !== it && x.et && !x.lock && x.et.cls === it.et.cls); }
function awakenTrait(it, idx, sacId) { if (!it || !it.et) return { err: "Impossible." }; const sac = S.inv.find(x => x.id === sacId); if (!sac || !awakenCands(it).includes(sac)) return { err: "Il faut sacrifier un autre objet Éternel de la même classe." };
  if (S.gold < AWAKEN_GOLD) return { err: "Or insuffisant." }; const pool = Object.keys(ETERNAL_TRAITS).filter(k => !it.et.traits.includes(k)); S.gold -= AWAKEN_GOLD; S.inv.splice(S.inv.indexOf(sac), 1); it.et.traits[idx] = pick(pool); return { ok: 1, t: it.et.traits[idx] }; }
// ── 14 · Renaissance d'un héros au niveau 100 : retour au niveau 50, bonus permanent cumulable ──
const REBORN_LVL = 100, REBORN_BACK = 50, REBORN_B = .08;
const canReborn = h => h && h.lvl >= REBORN_LVL;
function reborn(h) { if (!canReborn(h)) return false; h.reborn = (h.reborn || 0) + 1; h.lvl = REBORN_BACK; h.xp = 0; return true; }
PAS_HOOKS.push(h => h.reborn ? [{ k: "stat", s: "dmg", v: REBORN_B * h.reborn }, { k: "stat", s: "hp", v: REBORN_B * h.reborn }, { k: "stat", s: "res", v: 5 * h.reborn }] : []);
// ── 15 · Collection de compagnons : +2 % de dégâts et de PV par tranche de 10 compagnons évolués ──
const petColl = () => (S && S.pets ? S.pets.owned.filter(p => typeof petEvolved === "function" && petEvolved(p)).length : 0);
PAS_HOOKS.push(() => { const b = Math.floor(petColl() / 10); return b ? [{ k: "stat", s: "dmg", v: .02 * b }, { k: "stat", s: "hp", v: .02 * b }] : []; });
// ── 8 · Trouvailles rares (Primordial, Éternel, uniques) ──
{ const gr0 = grantReward; grantReward = function (run, R) { try { for (const it of (R && R.loot) || []) if (it && (it.rar >= 8 || it.uniq || it.et)) { (S.finds = S.finds || []).unshift({ t: Date.now(), n: gearName(it), rar: it.rar, reg: run && run.region, uniq: !!it.uniq, et: !!it.et }); S.finds.length = Math.min(S.finds.length, 80); } } catch (e) { } return gr0.apply(this, arguments); }; }
// ── 16 · Observatoire : prévision de la météo et du gardien de la prochaine expédition d'un chapitre ──
const obsOpen = () => regionsCleared() >= 3;
function forecast(reg) { if (!obsOpen() || reg === "abime" || !S.prog[reg] || !S.prog[reg].clears) return null; S.forecast = S.forecast || {}; let F = S.forecast[reg];
  if (!F) { const pool = beatenBosses().filter(k => MONSTERS[k] && !MONSTERS[k].secret); F = S.forecast[reg] = { weather: typeof rollWeather === "function" ? rollWeather({ region: reg }) : null, boss: pool.length ? pick(pool) : null }; } return F; }
{ const sr0 = startRun; startRun = function (regionId, partyIds, petId, opt = {}) { const r = sr0.apply(this, arguments); try { const F = S.forecast && S.forecast[regionId]; if (F && S.run && !opt.rush && !opt.daily) { S.run.weather = F.weather; if (F.boss && !S.run.forceBoss) S.run.forceBoss = F.boss; delete S.forecast[regionId]; } } catch (e) { } return r; }; }
// ── 10 · Gardiens jumeaux en menace V ──
{ const ge0 = genEncounter; genEncounter = function (run, node, rng = RNG) { const fresh = node && !node.enc; const enc = ge0.apply(this, arguments);
    try { if (fresh && node.type === "boss" && run.threat >= 4 && run.region !== "abime" && !run.rush && (node.twin || rng.chance(.35))) { const b = enc.find(e => MONSTERS[e.key] && MONSTERS[e.key].boss); const pool = beatenBosses().filter(k => b && k !== b.key && MONSTERS[k] && !MONSTERS[k].secret);
        if (b && pool.length) { const k2 = rng.pick(pool); const out = [b, { key: k2, lvl: b.lvl, f: b.f ? Object.assign({}, b.f) : undefined, twin: 1 }]; node.twin = 1; node.enc = out.map(e => Object.assign({}, e)); return out; } } } catch (e) { } return enc; }; }
// ── 9 · Cycles : chapitres corrompus (une partie des ennemis) ──
{ const bf8 = battleFor; battleFor = function (run, node, enc) { const B = bf8.apply(this, arguments); if (!B || !run) return B; const c = typeof cycleN === "function" ? cycleN() : 0;
    if (c && run.region !== "abime") for (const e of B.enemies) if (!e.corrupt && chance(Math.min(.45, .15 * c))) { e.corrupt = 1; e.hpMax = Math.round(e.hpMax * 1.12); e.hp = Math.round(e.hp * 1.12); e.dmgLo = Math.round(e.dmgLo * 1.08); e.dmgHi = Math.round(e.dmgHi * 1.08); }
    if (node && node.twin) for (const e of B.enemies) if (e.boss) { e.hpMax = Math.round(e.hpMax * .75); e.hp = Math.round(e.hp * .75); }
    return B; }; }
{ const rf4 = rewardFor; rewardFor = function (run, node, rng = RNG) { const R = rf4.apply(this, arguments); if (node && node.twin && node.type === "boss") { const lv = Math.max(...run.party.map(id => (heroById(id) || { lvl: 1 }).lvl)); R.loot.push(lootGear(lv + 2, .3, null, 2), lootGear(lv + 2, .3, null, 2)); R.gold = Math.round((R.gold || 0) * 1.6); R.shards = (R.shards || 0) + 2; } return R; }; }
// ── 11 · Épreuves de classe : une expédition courte par classe → tenue de l'Épreuve et trait « Éprouvé » ──
TRAITS.eprouve = TRAITS.eprouve || { n: "Éprouvé", good: 1, d: "A réussi l'Épreuve de sa classe : +6 % de dégâts et de PV, +8 résistance.", pas: [{ k: "stat", s: "dmg", v: .06 }, { k: "stat", s: "hp", v: .06 }, { k: "stat", s: "res", v: 8 }] };
function trialDone(cls) { return !!((S.classTrial || {})[cls]); }
// ── 12 · Recrue légendaire du mois ──
function monthLegend() { if (typeof wanderLegend !== "function" || REGIONS.reduce((a, r) => a + ((S.prog[r.id] || {}).clears || 0), 0) < 2) return null; const d = new Date(), m = d.getFullYear() * 12 + d.getMonth(), R = mkRng(m * 104729 + 7);
  const cls = R.pick(Object.keys(CLASSES)), fem = CLASS_FEMALE.has(cls); const nm = R.pick(fem ? NAMES_F : NAMES_M) + " " + (fem ? "la Saisonnière" : "le Saisonnier");
  const tales = ["Elle a traversé l'hiver seule, de la Citadelle aux Cimes, et n'a jamais dit pourquoi.", "On dit qu'il a refusé une couronne pour garder son épée.", "Elle chante les noms des morts, un par soir, et n'en oublie aucun.", "Il est revenu de l'Abîme avec une cicatrice qui ne saigne pas."];
  let t = R.pick(tales); t = fem ? t.replace(/^Il /, "Elle ").replace(/ il /g, " elle ") : t.replace(/^Elle /, "Il ").replace(/ elle /g, " il ");
  return { id: "mois_" + m, cls, name: nm, wander: 1, month: 1, cond: () => true, how: "", story: t + " (Recrue du mois : repart à la fin du mois.)" }; }
