// « Prochain objectif » (20 nov.) : une seule action conseillée, toujours visible au Bastion, au-dessus de « Départ rapide »
function nextGoal() {
  let G = []; try { G = goalsAll(); } catch (e) { return null; }
  const prog = G.filter(g => g.cat === "prog" && g.st !== "done"), day = G.filter(g => g.cat === "day" && g.st === "ready");
  const pick = prog.find(g => g.hot && /Recruter/.test(g.t)) || prog.find(g => /blessé/.test(g.t)) || prog.find(g => g.st === "ready" && /évoluer/i.test(g.t))
    || prog.find(g => g.hot) || prog.find(g => g.st === "ready") || day[0] || prog[0];
  return pick || null;
}
function nextGoalHTML() {
  if (S.run || (typeof UI !== "undefined" && UI.hubOpen)) return "";
  const g = nextGoal(); if (!g) return "";
  return `<button id="nextgoal" class="nextgoal" data-a="${g.a || "goals"}" data-v="${esc(String(g.v == null ? "" : g.v))}"><span class="ngk">${ico(g.ic || "star", "#ffd27a", 20)}</span><span class="ngt"><i>Prochain objectif</i><b>${g.t}</b>${g.d ? `<small>${g.d}</small>` : ""}</span><span class="nga">›</span></button>`;
}
{ const bh = SCREENS.bastion.html; SCREENS.bastion.html = (...a) => bh(...a) + nextGoalHTML(); }
