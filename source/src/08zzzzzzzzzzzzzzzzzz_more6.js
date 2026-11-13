/* Améliorations du 12 nov. (après-midi) : bestiaire complété par chapitre (+5 % de dégâts contre ses créatures), succès et titres du bestiaire,
   temps de jeu, « tout récupérer » du Carnet (logique). */
// ── Bestiaire : un chapitre est complet quand chacune de ses créatures (ordinaires, élites, gardien) a été vaincue au moins une fois ──
function bestChapters() {
  const L = [];
  for (const r of REGIONS) { const ks = [...new Set([...(r.pool || []), ...(r.elite || []), r.boss].filter(k => k && MONSTERS[k]))]; if (ks.length) L.push({ id: r.id, r, ks }); }
  return L;
}
const bestKilled = k => !!((S.seen && S.seen.monsters && S.seen.monsters[k] > 0) || (S.beaten && S.beaten[k]));
function bestState(id) { const C = bestChapters().find(c => c.id === id); if (!C) return null; const n = C.ks.filter(bestKilled).length; return { n, of: C.ks.length, done: n >= C.ks.length, ks: C.ks }; }
let BEST_CACHE = null;
function bestDoneKeys() { // clés des créatures des chapitres complets (recalculé au début de chaque combat)
  const s = new Set(); for (const C of bestChapters()) if (C.ks.every(bestKilled)) C.ks.forEach(k => s.add(k)); return s;
}
const BEST_DMG = .05;
{ const sm = strikeMul; strikeMul = function (B, u, x) { let m = sm.apply(this, arguments);
    try { if (u && u.side === "h" && x && x.side === "e") { if (!BEST_CACHE || BEST_CACHE.B !== B) BEST_CACHE = { B, s: bestDoneKeys() }; if (BEST_CACHE.s.has(x.key)) m *= 1 + BEST_DMG; } } catch (e) { }
    return m; }; }
function bestRealm(lo, hi) { const C = bestChapters().filter(c => { const i = REGIONS.indexOf(c.r); return c.id !== "abime" && i >= lo && i < hi; }); return C.length > 0 && C.every(c => c.ks.every(bestKilled)); }
const BEST_ACH = [
  { id: "best_1", n: "Naturaliste", d: "Compléter le bestiaire d'un chapitre (vaincre chacune de ses créatures).", gold: 1500, shards: 3, ok: () => bestChapters().some(c => c.id !== "abime" && c.ks.every(bestKilled)) },
  { id: "best_5", n: "Encyclopédiste", d: "Compléter le bestiaire de cinq chapitres.", gold: 4000, shards: 6, ok: () => bestChapters().filter(c => c.id !== "abime" && c.ks.every(bestKilled)).length >= 5 },
  { id: "best_royaume", n: "Chasseur du Royaume", d: "Compléter le bestiaire des chapitres I à X.", gold: 10000, shards: 12, ok: () => REGIONS.length >= 10 && bestRealm(0, 10) },
  { id: "best_envers", n: "Chasseur de l'Envers", d: "Compléter le bestiaire de tous les chapitres de l'Envers (XI et au-delà).", gold: 20000, shards: 20, ok: () => REGIONS.filter(r => r.id !== "abime").length > 10 && bestRealm(10, 99) },
];
if (typeof COLL_ACH !== "undefined") for (const A of BEST_ACH) if (!COLL_ACH.some(a => a.id === A.id)) { COLL_ACH.push(A); if (typeof HIDDEN_ACH !== "undefined" && !HIDDEN_ACH.some(a => a.id === A.id)) HIDDEN_ACH.push(Object.assign({ coll: 1 }, A)); }
if (typeof TITLES_BASE !== "undefined") TITLES_BASE.push(
  { t: "Naturaliste", need: () => BEST_ACH[0].ok() },
  { t: "Chasseur du Royaume", need: () => BEST_ACH[2].ok() },
  { t: "Chasseur de l'Envers", need: () => BEST_ACH[3].ok() });

// ── Carnet : tout récupérer d'un coup ──
function carnetClaimAll() {
  const out = { n: 0, gold: 0, shards: 0 }, add = R => { if (!R) return; out.n++; out.gold += R.gold || 0; out.shards += R.shards || 0; };
  try { add(loginClaim()); } catch (e) { }
  try { for (let l = 1; l <= passLvl(); l++) if (!AD().pass.got.includes(l)) add(passClaim(l)); } catch (e) { }
  try { add(huntClaim()); } catch (e) { }
  try { for (const r of albumRoles()) add(albumClaim(r)); } catch (e) { }
  return out;
}
