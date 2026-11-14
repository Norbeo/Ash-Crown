/* Correctifs du 14 nov. :
   - expédition éclair : « Refaire l'expédition éclair » ou « Retour au Bastion » sur le bilan ;
   - préparation : listes de héros et de compagnons repliées à l'ouverture ;
   - ouvrir un autre bâtiment depuis un bâtiment ne laisse pas le premier dans la pile du retour ;
   - pas de tutoriel quand on arrive dans un bâtiment depuis un objectif ;
   - objectifs : plus de ligne « objets meilleurs que l'équipement porté » ; pastille effacée à l'ouverture, revient après une expédition s'il y a du nouveau ;
   - monstres ordinaires à une taille homogène (élites et gardiens restent plus grands). */

// ── Expédition éclair : enchaîner ──
{ const fr = flashResolve; flashResolve = function () { UI._wasFlash = 1; return fr.apply(this, arguments); }; }
ACT.flashAgain = () => {
  if (S.run) return go("map");
  const P = S.lastExpe; if (!P || !P.party) return go("bastion");
  const party = P.party.filter(id => heroById(id) && !isInjured(heroById(id)));
  if (!party.length) return toast("Les héros de la dernière expédition sont blessés : passez par la Chapelle.", "bad");
  go("expe"); Object.assign(UI.expe, { rush: false, daily: false, special: null, twin: false, legend: false, week: false }, P, { party, pet: P.pet && S.pets.owned.includes(P.pet) ? P.pet : UI.expe.pet });
  UI._wasFlash = 0; ACT.flashRun();
};
{ const rh = SCREENS.results.html; SCREENS.results.html = function (res) { let s = rh.apply(this, arguments); if (!UI._wasFlash) return s;
    s = s.replace(/<button class="btn" data-a="quickStart"[^>]*>[\s\S]*?<\/button>/, "");
    return s.replace('<button class="btn main" data-go="bastion">', `<button class="btn gold" data-a="flashAgain" style="margin-right:6px">${ico("speed")}Refaire l'expédition éclair</button><button class="btn main" data-go="bastion">`); }; }
{ const g0 = go; go = function (scr) { if (scr !== "results") UI._wasFlash = 0; if (scr === "expe") { UI.expeTab = null; UI.petTab = null; } return g0.apply(this, arguments); }; }

// ── Bâtiments : changer de bâtiment efface le retour vers le précédent ──
{ const ob = openBuilding; openBuilding = function (k) {
    try { if (typeof MNAV !== "undefined" && !MNAV.restoring && !$("#modal").hidden && UI.inBld && UI.bldOpen && UI.bldOpen !== k) { MNAV.stack = []; MNAV.cur = null; MNAV.closed = null; } } catch (e) { }
    return ob.apply(this, arguments); }; }
// arrivée depuis un objectif : pas de tutoriel (il restera proposé à la prochaine visite)
{ const gs = guideShow; guideShow = function () { if (UI._noGuideOnce) { UI._noGuideOnce = 0; return false; } return gs.apply(this, arguments); }; }
{ const gb = ACT.goalBld; ACT.goalBld = function () { UI._noGuideOnce = 1; try { return gb.apply(this, arguments); } finally { UI._noGuideOnce = 0; } }; }

// ── Objectifs ──
{ const ga = goalsAll; goalsAll = function () { return ga.apply(this, arguments).filter(g => !/meilleurs que l'équipement porté/.test(g.t || "")); }; }
const goalKey = g => (g.cat === "day" ? dayKey() + ":" : "") + (g.t || "");
{ const gl = goalsList; goalsList = function () { const L = gl.apply(this, arguments); if (UI._goalsRaw) return L; if (S.goalMute) return []; const seen = S.goalSeen || {}; return L.filter(g => !seen[goalKey(g)]); }; }
{ const go2 = ACT.goals; ACT.goals = function () {
    try { UI._goalsRaw = 1; const L = goalsList(); UI._goalsRaw = 0; S.goalSeen = S.goalSeen || {}; for (const g of L) S.goalSeen[goalKey(g)] = 1; const ks = Object.keys(S.goalSeen); if (ks.length > 400) for (const k of ks.slice(0, ks.length - 400)) delete S.goalSeen[k];
      if (!S.goalMute) { S.goalMute = 1; save(); if (UI.screen === "bastion" && $("#modal").hidden) refresh(); } } catch (e) { UI._goalsRaw = 0; }
    return go2.apply(this, arguments); }; }
{ const fr2 = finishRun; finishRun = function () { S.goalMute = 0; return fr2.apply(this, arguments); }; }

// ── Taille des monstres : les monstres ordinaires ont tous à peu près la même stature ──
function monImgSprite(key, pose, sc) {
  const M = MONSTERS[key] || {}, n = "mon_" + (M.art || key), im = artImg(n); if (!im) return null;
  const big = (M.sz || 1) > 1, f = pose.fig || {}, boss = M.boss || big, elite = M.elite;
  const h0 = MON_H[M.art || key] || (boss ? 335 : elite ? 240 : 190);
  const h = boss || elite ? h0 : Math.max(175, Math.min(205, h0)), maxW = boss ? 320 : elite ? 210 : 175;
  return imgSprite(im, { sc, cx: ART_CX[n], h, maxW, flip: !ART_FLIP.has(n),
    pose: { atk: pose.atk, lean: f.lean, hx: f.hx }, tint: f.lean < 0 ? "rgba(170,20,20,.16)" : null, hue: M.hue || null });
}
