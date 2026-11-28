/* ═══════════ Entraînement en absence : les 4 héros de l'équipe principale gagnent un peu d'expérience (12 h au plus) ═══════════ */
const IDLE_MAX_H = 12, IDLE_RATE = .025; // 2,5 % d'un niveau par heure, soit 30 % d'un niveau au plus
{ const ld0 = load; load = function () { const s = ld0.apply(this, arguments); if (s && s.lastSeen) s._awayMs = Math.max(0, Date.now() - s.lastSeen); return s; }; }
{ const L4 = ACT.launch; ACT.launch = (...a) => { const r = L4(...a); if (S.run && S.run.party) S.mainParty = S.run.party.slice(0, 4); return r; }; }
function idleParty() { const ids = (S.mainParty || []).filter(id => heroById(id)); if (ids.length) return ids.map(heroById); return S.heroes.slice().sort((a, b) => b.lvl - a.lvl).slice(0, 4); }
function idleLvlCap() { const reg = REGIONS.filter(r => regionUnlocked(r.id)); return Math.max(8, ...reg.map(r => (recLevel(r.id, threatMax(r.id)) || r.lvl || 1) + 4)); } // jamais au-delà du chapitre ouvert le plus avancé + 4 niveaux
function idleTrain(ms) {
  const hrs = Math.min(IDLE_MAX_H, ms / 3.6e6); if (hrs < .25 || !S.heroes.length) return null;
  const cap = idleLvlCap(), out = [];
  for (const h of idleParty()) { if (h.lvl >= cap) { out.push({ h, xp: 0, capped: 1 }); continue; } const l0 = h.lvl, v = Math.round(xpNeed(h.lvl) * IDLE_RATE * hrs); giveXp(h, v); if (h.lvl > cap) { h.lvl = cap; h.xp = 0; } out.push({ h, xp: v, up: h.lvl - l0 }); }
  return { hrs, out };
}
function idleReport(R) { if (!R || !R.out.length) return; const hh = Math.floor(R.hrs), mm = Math.round((R.hrs - hh) * 60);
  modal(`<h2>${ico("helm", "#e8c878")} Entraînement en votre absence</h2><p class="small">Pendant ${hh ? hh + " h " : ""}${mm} min, votre équipe principale s'est entraînée dans la cour du Bastion${R.hrs >= IDLE_MAX_H ? " (12 h au plus)" : ""}.</p><div class="col">${R.out.map(({ h, xp, up, capped }) => `<div class="row card" style="cursor:default;gap:10px">${heroLabel(h)}<span class="small" style="margin-left:auto">${capped ? '<span class="dim">au niveau maximal de l\'entraînement</span>' : `+${fmt(xp)} XP${up ? ` · <b class="gold">niveau ${h.lvl}</b>` : ""}`}</span></div>`).join("")}</div><p class="tiny dim">L'entraînement ne dépasse jamais le niveau conseillé de votre chapitre le plus avancé + 4. L'équipe principale est celle de votre dernière expédition.</p><div class="row" style="justify-content:flex-end;margin-top:10px"><button class="btn main" data-a="closeModal">Continuer</button></div>`); }
function idleCheck() { try { const ms = S && S._awayMs || 0; if (S) delete S._awayMs; if (!S || (S.run && !S.run.paused)) return; const R = idleTrain(ms); if (R && R.out.some(x => x.xp)) { save(); const show = () => { if ($("#modal").hidden) idleReport(R); else setTimeout(show, 1500); }; setTimeout(show, 1500); } } catch (e) { console.warn("entraînement", e); } }
{ const ct0 = ACT.continue; ACT.continue = (...a) => { const r = ct0(...a); idleCheck(); return r; }; }
