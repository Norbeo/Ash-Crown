// ── Carte automatique sans arrêt : chaque fenêtre de l'expédition est résolue toute seule ──
// Butin : rangé dans le butin, équipé seulement sur un emplacement vide (selon le rôle) ; événements : choix au meilleur score ;
// coffres : désamorcer si un spécialiste est là, sinon forcer ; feu de camp : repos si le groupe est blessé, sinon entraînement ;
// colporteurs évités (quittés aussitôt) ; gardien : briefing passé ; Abîme : on descend si le groupe tient debout.
function autoHpRatio(run) {
  const rh = relicHooks(run), party = runParty().filter(h => !run.fallen.includes(h.id)); if (!party.length) return 0;
  return party.reduce((a, h) => { const mx = heroStats(h, rh).hp; return a + (h.hp == null ? 1 : h.hp / mx); }, 0) / party.length;
}
const autoHurt = run => runParty().some(h => !run.fallen.includes(h.id) && h.hp != null && h.hp < heroStats(h, relicHooks(run)).hp - .5);
// rôle préféré d'un bibelot d'après ses effets
function trinketRole(it) {
  const T = TRINKETS[it.key]; if (!T) return null; const ks = (T.pas || []).map(p => p.s || p.k).join(" ");
  if (/healPow|heal|regen/.test(ks)) return "soin";
  if (/\bhp\b|prot|res|thorns|riposte|block|guard/.test(ks)) return "tank";
  if (/dmg|crit|bleed|burn|dot|exec|acc|spd/.test(ks)) return "dps";
  return null;
}
// équipe le butin sur les emplacements vides uniquement (ne remplace jamais un objet porté)
function autoLootEquip(run) {
  if (!run || !run.loot) return 0; let n = 0;
  const party = runParty().filter(h => !run.fallen.includes(h.id));
  for (const it of run.loot.slice()) {
    if (it.kind === "tr") {
      const free = party.filter(h => !h.gear.tr1 || !h.gear.tr2); if (!free.length) continue;
      const role = trinketRole(it), pool = free.filter(h => role && (CLASSES[h.cls].role === role || (role === "dps" && CLASSES[h.cls].role === "soutien")));
      const h = (pool.length ? pool : free).sort((a, b) => b.lvl - a.lvl)[0];
      runEquip(h, it, run, !h.gear.tr1 ? "tr1" : "tr2"); n++;
    } else {
      const h = party.filter(h => !h.gear[it.kind] && canEquip(h, it)).sort((a, b) => b.lvl - a.lvl)[0];
      if (h) { runEquip(h, it, run); n++; }
    }
  }
  if (n) save(); return n;
}
// note d'un effet d'événement : positif = bon pour le groupe, pondéré par l'état des PV
function autoFxScore(fx, run, hpr) {
  if (!fx) return 0; let s = 0;
  if (fx.gamble) { const [p, a, b] = fx.gamble; s += p * autoFxScore(a, run, hpr) + (1 - p) * autoFxScore(b, run, hpr); }
  if (fx.heal) s += fx.heal * (hpr < .7 ? 120 : 30);
  if (fx.hurt) s -= fx.hurt * (hpr < .5 ? 400 : 160);
  if (fx.light) s += fx.light * (run.light < 40 ? .9 : .35);
  if (fx.gold) s += fx.gold * .12; if (fx.cost) s -= fx.cost * .14;
  if (fx.xp) s += fx.xp * .15; if (fx.petXp) s += fx.petXp * .05;
  if (fx.relic) s += 30; if (fx.loot || fx.item) s += 22; if (fx.buff) s += 14;
  if (fx.morale) s += fx.morale * .8; if (fx.mat || fx.ess) s += 6 * ((fx.mat || 0) + (fx.ess || 0));
  if (fx.curse) s -= 30 * fx.curse; if (fx.petHurt) s -= 25; if (fx.potionCost) s -= 12 * fx.potionCost;
  if (fx.fight) s += hpr > .7 ? 4 : -40;
  if (fx.bossWeak) s += 60 * fx.bossWeak; if (fx.bossRage) s += hpr > .8 ? 10 : -50 * fx.bossRage;
  if (fx.sflag) s += 3;
  return s;
}
function autoEventChoice(run, n) {
  const E = EVENTS.find(e => e.id === n.ev); if (!E) return 0; const hpr = autoHpRatio(run);
  let best = 0, bs = -1e9;
  E.ch.forEach((c, i) => { if (c.fx.cost && S.gold + run.gold < c.fx.cost) return; const s = autoFxScore(c.fx, run, hpr); if (s > bs) { bs = s; best = i; } });
  return best;
}
// un bouton de la fenêtre ouverte, s'il existe
const autoBtn = sel => { const m = $("#modal"); return m && !m.hidden ? m.querySelector(sel) : null; };
function autoClick(el) { if (el && !el.disabled) { el.click(); return true; } return false; }
function autoModalStep() {
  const run = S.run; if (!run || !run.autoMap) return false;
  // cinématiques et présentations de gardien
  const cine = document.querySelector("#cine:not([hidden]) button, .bintro, .cineskip"); if (cine) { cine.click(); return true; }
  const m = $("#modal"); if (!m || m.hidden) return false;
  if (UI.screen === "combat" && (m.querySelector("#cblogbox") || !m.querySelector(".btn.main, [data-a=\"retryFight\"], [data-a=\"bossGo\"], [data-a=\"abyssDown\"]"))) return false; // fenêtres ouvertes par le joueur en combat (journal, fiches…) : laissées ouvertes
  if (autoBtn('[data-a="evChoice"]') && UI.evNode) return autoClick(autoBtn(`[data-a="evChoice"][data-v="${autoEventChoice(run, UI.evNode)}"]`) || autoBtn('[data-a="evChoice"]:not([disabled])'));
  if (autoBtn('[data-a="camp"]')) return autoClick(autoBtn(`[data-a="camp"][data-v="${autoHurt(run) ? "rest" : "train"}"]`));
  if (autoBtn('[data-a="trChoice"]')) { const sly = runParty().some(h => !run.fallen.includes(h.id) && SLY.includes(h.cls)); return autoClick(autoBtn(`[data-a="trChoice"][data-v="${sly ? "disarm" : "force"}"]`)); }
  if (autoBtn('[data-a="leaveShop"]')) return autoClick(autoBtn('[data-a="leaveShop"]'));
  if (autoBtn('[data-a="nest"]')) { const on = autoHpRatio(run) > .8 ? 1 : 0; return autoClick(autoBtn(`[data-a="nest"][data-v$=":${on}"]`) || autoBtn('[data-a="nest"]')); }
  if (autoBtn('[data-a="wevChoice"]') && UI.wev) { const ch = UI.wev.W[1], hpr = autoHpRatio(run); let bi = 0, bs = -1e9; ch.forEach((c, i) => { const s = autoFxScore(c[1], run, hpr); if (s > bs) { bs = s; bi = i; } }); return autoClick(autoBtn(`[data-a="wevChoice"][data-v="${bi}"]`)); }
  if (autoBtn('[data-a="retryFight"]')) return autoClick(autoBtn('[data-a="retryFight"]'));
  if (autoBtn('[data-a="bossGo"]')) return autoClick(autoBtn('[data-a="bossGo"]'));
  if (autoBtn('[data-a="abyssDown"]')) return autoClick(autoBtn(autoHpRatio(run) > .45 ? '[data-a="abyssDown"]' : '[data-a="abyssUp"]'));
  // fenêtre de butin / résultat : ranger le butin (emplacements vides seulement) puis continuer
  autoLootEquip(run);
  return autoClick(autoBtn('.btn.main') || autoBtn('[data-a="closeModal"]'));
}
function autoMapLoop() {
  clearInterval(UI.autoLoop);
  UI.autoLoop = setInterval(() => {
    const run = S.run; if (!run || !run.autoMap) { clearInterval(UI.autoLoop); UI.autoLoop = 0; return; }
    try {
      if (UI.screen === "combat" && typeof CB !== "undefined" && !CB.auto && !run.cbManual) { CB.auto = true; const l = $("#cb-auto"); if (l) { l.textContent = "Auto"; l.parentElement.classList.add("on"); } if (CB.resolve && CB.actor) choose(autoChoice(CB.actor)); }
      if (UI.screen === "travel") return;
      if (autoModalStep()) return;
      if (UI.screen === "map" && $("#modal").hidden && !UI.resolving) { autoLootEquip(run); mapAutoTick(); }
    } catch (e) { console.warn("carte auto", e); }
  }, S.opts.fast ? 600 : 1000);
}
