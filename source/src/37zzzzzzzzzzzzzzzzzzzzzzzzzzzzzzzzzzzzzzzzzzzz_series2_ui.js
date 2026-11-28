/* Séries simplifiées et carte automatique (13 nov.).
   - Séries ET carte automatique : débloquées seulement après avoir fini toute l'histoire ET entamé un nouveau cycle.
   - Deux choix : « Série ×N » (le même niveau en boucle N fois) ou « Série infinie » (progresse seule : menaces I→V puis chapitre suivant).
     La compagnie se complète seule si un héros est blessé. */
seriesOpen = function () { try { return typeof cycleN === "function" && cycleN() >= 1; } catch (e) { return false; } };
const SERIES_LOCK = "Achevez toute l'histoire et entamez un nouveau cycle pour débloquer les séries et la carte automatique.";
function series2HTML(E) {
  if (E.rush || E.daily) return "";
  if (!seriesOpen()) return `<div class="row" style="margin-top:8px"><span class="tiny dim">${ico("lock", "#7a6a5a", 13)} ${SERIES_LOCK}</span></div>`;
  const n = UI.seriesN || 0, inf = n >= 999, mode = !n ? "off" : inf ? "inf" : "n";
  return `<div class="panel" style="padding:10px;margin-top:8px"><b class="small">${ico("auto", "#e8c878", 14)} Série</b>
    <div class="row" style="gap:6px;flex-wrap:wrap;margin-top:6px">
      <button class="btn sm ${mode === "off" ? "gold" : "ghost"}" data-a="ser2" data-v="off">Aucune</button>
      <button class="btn sm ${mode === "n" ? "gold" : "ghost"}" data-a="ser2" data-v="n">Série</button>
      <button class="btn sm ${mode === "inf" ? "gold" : "ghost"}" data-a="ser2" data-v="inf">Série infinie</button></div>
    ${mode === "n" ? `<div class="row" style="gap:6px;align-items:center;margin-top:8px"><button class="btn sm ghost" data-a="ser2Step" data-v="-1">−</button><input type="number" min="1" max="998" class="invf" data-ser2n="1" value="${n}" style="width:70px;text-align:center"><button class="btn sm ghost" data-a="ser2Step" data-v="1">+</button><span class="small">fois</span></div>` : ""}
    <div class="tiny dim" style="margin-top:6px">${mode === "off" ? "Une seule expédition." : mode === "n" ? `Refait ${n} fois la même expédition, en automatique.` : "Enchaîne les expéditions sans fin : chaque gardien vaincu fait monter d'une menace, puis passer au chapitre suivant."} S'arrête sur une défaite ; arrêt possible à tout moment depuis la carte.</div></div>`;
}
seriesHTML = E => UI._xpOpts ? series2HTML(E) : "";
ACT.ser2 = v => { UI.seriesGoalOn = 0; UI.seriesRaid = 0;
  if (v === "off") { UI.seriesN = 0; UI.seriesEvo = 0; }
  else if (v === "inf") { UI.seriesN = 999; UI.seriesEvo = 1; UI.seriesAuto = 1; }
  else { UI.seriesN = UI.seriesN && UI.seriesN < 999 ? UI.seriesN : 5; UI.seriesEvo = 0; UI.seriesAuto = 1; }
  refresh(); };
ACT.ser2Step = d => { UI.seriesN = clamp((UI.seriesN && UI.seriesN < 999 ? UI.seriesN : 0) + +d, 1, 998); refresh(); };
if (typeof document !== "undefined") document.addEventListener("change", e => { const t = e.target; if (t && t.matches && t.matches("input[data-ser2n]")) { UI.seriesN = clamp(Math.floor(+t.value || 1), 1, 998); UI.seriesEvo = 0; refresh(); } });

// carte automatique : même déblocage que les séries
runFlowHTML = function (E) {
  if (!seriesOpen()) { E.autoMap = 0; return `<h2 style="margin-top:12px">${ico("auto", "#e8c878")} Déroulement</h2><p class="tiny dim">${ico("lock", "#7a6a5a", 13)} ${SERIES_LOCK}</p>`; }
  const on = !!E.autoMap;
  let h = `<h2 style="margin-top:12px">${ico("auto", "#e8c878")} Déroulement</h2><div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn sm ${on ? "ghost" : "gold"}" data-a="expeAuto" data-v="0">${ico("hand")}Carte manuelle</button><button class="btn sm ${on ? "gold" : "ghost"}" data-a="expeAuto" data-v="1">${ico("auto")}Carte automatique</button></div>`;
  UI._xpSpecial = 1; UI._xpOpts = 1; try { h += seriesHTML(E); } finally { UI._xpSpecial = 0; UI._xpOpts = 0; }
  return h; };
{ const ea = ACT.expeAuto; ACT.expeAuto = v => { if (+v && !seriesOpen()) return toast(SERIES_LOCK, "bad"); return ea(v); }; }
{ const ma = ACT.mapAuto; ACT.mapAuto = function () { if (S.run && !S.run.autoMap && !seriesOpen()) return toast(SERIES_LOCK, "bad"); return ma.apply(this, arguments); }; }
{ const sr = startRun; startRun = function () { const run = sr.apply(this, arguments); try { if (run && !seriesOpen()) { run.autoMap = 0; if (S.opts) S.opts.autoMap = 0; } } catch (e) { } return run; }; }
{ const al = autoMapLoop; autoMapLoop = function () { if (S.run && S.run.autoMap && !seriesOpen()) { S.run.autoMap = 0; return; } return al.apply(this, arguments); }; }
// bouton Auto/Manuel de la carte masqué tant que ce n'est pas débloqué
{ const mh = SCREENS.map.html; SCREENS.map.html = function () { const s = mh.apply(this, arguments); return seriesOpen() ? s : s.replace(/<button[^>]*data-a="mapAuto"[^>]*>[\s\S]*?<\/button>/, ""); }; }
