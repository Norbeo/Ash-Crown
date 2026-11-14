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
  const h = boss || elite ? h0 : Math.max(140, Math.min(225, 190 + (h0 - 190) * .5)), maxW = boss ? 320 : elite ? 210 : Math.round(185 * h / 190);
  return imgSprite(im, { sc, cx: ART_CX[n], h, maxW, flip: !ART_FLIP.has(n),
    pose: { atk: pose.atk, lean: f.lean, hx: f.hx }, tint: f.lean < 0 ? "rgba(170,20,20,.16)" : null, hue: M.hue || null });
}

// ── Combat : barre compacte — 4 compétences principales (et l'ultime quand elle est prête), le reste derrière « Plus » ──
{ const cbx = cbBar; cbBar = function (u) { cbx.apply(this, arguments);
    try { const box = $("#cb-skills"); if (!box || !u || !box.children.length) return; let n = 0;
      for (const b of [...box.children]) { const main = b.dataset.a === "cbSk" && !b.classList.contains("ult") && n < 4; if (main) n++; const ultReady = b.classList.contains("ult") && b.classList.contains("ready");
        b.classList.toggle("skx", !main && !ultReady); }
      const t = document.createElement("button"); t.className = "sk skmore"; t.dataset.a = "cbMore"; t.innerHTML = `${ico(CB.moreOpen ? "back" : "plus", "#e8c878")}<span>${CB.moreOpen ? "Moins" : "Plus"}</span>`; box.appendChild(t);
      const bar = $("#cbar"); if (bar) { bar.classList.toggle("more", !!CB.moreOpen); CB.barH = bar.offsetHeight + 6; cbLayout(); }
    } catch (e) { } }; }
ACT.cbMore = () => { CB.moreOpen = !CB.moreOpen; const bar = $("#cbar"); if (bar) bar.classList.toggle("more", CB.moreOpen); const t = document.querySelector("#cb-skills .skmore"); if (t) t.innerHTML = `${ico(CB.moreOpen ? "back" : "plus", "#e8c878")}<span>${CB.moreOpen ? "Moins" : "Plus"}</span>`; try { if (bar) { CB.barH = bar.offsetHeight + 6; cbLayout(); } } catch (e) { } };

// ── Fiche d'un compagnon : « Retour à la Ménagerie » seulement si on vient de la Ménagerie ──
{ const pi = ACT.petInfo; ACT.petInfo = function (id, el, e) { const fromMen = UI.inBld && UI.bldOpen === "menagerie" && !$("#modal").hidden;
    if (fromMen) return pi.apply(this, arguments); e && e.stopPropagation && e.stopPropagation(); petSheet(id, ""); }; }

// ── Tableau du Bastion réduit au niveau d'aventure : expédition du jour et défi de la semaine dans l'onglet Destination, défis du jour dans les Objectifs ──
{ const eh = SCREENS.expe.html; SCREENS.expe.html = function () { let h = eh.apply(this, arguments); if (S.run || (UI.expePane || "dest") !== "dest") return h;
    try { const i = h.indexOf('<div class="stickybar">'); if (i < 0) return h; let add = "";
      if (S.daily && UI.expe && !UI.expe.daily) add += `<div class="card" style="cursor:default;margin:8px 0"><div class="row sp" style="gap:8px;flex-wrap:wrap"><div class="small">${ico("star", "#e8c878", 15)} <b>Expédition du jour</b><div class="tiny dim">Destination et règles imposées, récompenses en plus.</div></div><button class="btn sm ${S.daily.done ? "ghost off" : "main"}" data-a="dailyRun">${S.daily.done ? "Accomplie ✓" : "Partir"}</button></div></div>`;
      if (!S.week && typeof weekCheck === "function") weekCheck(); const W = typeof weekRule === "function" ? weekRule() : null;
      if (W && S.week && UI.expe && !UI.expe.week) { const R = weekReward(); add += `<div class="card" style="cursor:default;margin:8px 0"><div class="row sp" style="gap:8px;flex-wrap:wrap"><div class="small">${ico("trophy", "#e8c878", 15)} <b>Défi de la semaine : ${W.n}</b><div class="tiny dim">${gl(W.d)} — ${regionById(S.week.region).n}. Victoire : +${R.gold} or, +${R.shards} éclats, +${R.essence} essence.</div></div><button class="btn sm ${S.week.done ? "ghost off" : "gold"}" data-a="weekRun">${S.week.done ? "Relevé ✓" : "Relever"}</button></div></div>`; }
      return add ? h.slice(0, i) + add + h.slice(i) : h; } catch (e) { return h; } }; }
{ const ga2 = goalsAll; goalsAll = function () { const G = ga2.apply(this, arguments);
    try { if (!S.week && typeof weekCheck === "function") weekCheck(); const W = weekRule(); if (W && S.week) G.push({ cat: "day", st: S.week.done ? "done" : "todo", ic: "trophy", t: `Défi de la semaine : ${W.n}`, d: `${regionById(S.week.region).n} — ${W.d}`, a: "weekRun", v: "" }); } catch (e) { }
    return G; }; }

// ── Fiche d'un gardien : la marque qu'il laisse sur les héros (bonus et contrepartie), purifiable à la Chapelle ──
function bossMarkOf(k) { try { const M = MONSTERS[k]; if (!M || !M.boss) return null; const base = typeof bossBase === "function" ? bossBase(k) : k;
    if (GUARD_MARKS["b:" + base]) return GUARD_MARKS["b:" + base]; const R = REGIONS.find(r => r.boss === base || r.boss2 === base); return R && GUARD_MARKS[R.id] ? GUARD_MARKS[R.id] : null; } catch (e) { return null; } }
{ const ms = ACT.monSheet; ACT.monSheet = function (k) { const r = ms.apply(this, arguments);
    try { const G = bossMarkOf(k); const box = document.querySelector("#modal .box") || document.querySelector("#modal"); if (G && box) { const h3 = [...box.querySelectorAll("h3")].find(e => /Compétences/.test(e.textContent));
        const html = `<div class="panel" style="padding:8px 10px;margin-top:10px;border-color:#b08aff66">${ico("curse", "#c8a0ff", 15)} <b>Marque laissée : ${G.n}</b><div class="small" style="margin-top:2px">${G.d}</div><div class="tiny dim">Chaque héros présent à la victoire porte cette marque. Elle se purifie à la Chapelle (le bonus part avec la contrepartie).</div></div>`;
        if (h3) h3.insertAdjacentHTML("beforebegin", html); else box.insertAdjacentHTML("beforeend", html); } } catch (e) { }
    return r; }; }
