// ── Barre du Bastion resserrée (21 nov.) : 5 boutons au plus, les autres regroupés (un toucher ouvre le groupe)
const RAIL_GROUPS = [
  { k: "lvl", has: ["hubPanel"] },
  { k: "goals", n: "Objectifs", ic: "star", has: ["goals", "dailyRun", "bounty"] },
  { k: "shop", n: "Marchands", ic: "coin", has: ["merchant", "visitor"] },
  { k: "book", n: "Carnet", ic: "book", has: ["carnet", "trophies"] },
  { k: "chest", has: ["chestOpen"] }];
const RAIL_STORE = {};
{ const hr = hubRailHTML; hubRailHTML = function () { const was = UI.railMore; let full = ""; try { UI.railMore = true; full = hr.apply(this, arguments); } finally { UI.railMore = was; }
    try { const btns = (full.match(/<button class="hrail[^"]*"[\s\S]*?<\/button>/g) || []).filter(b => !/data-a="railMore"/.test(b)); const by = {}; for (const b of btns) { const a = (b.match(/data-a="([^"]*)"/) || [])[1]; if (a) by[a] = b; }
      const used = new Set(), out = [];
      const groups = RAIL_GROUPS.concat([{ k: "more", n: "Plus", ic: "plus", has: Object.keys(by).filter(a => !RAIL_GROUPS.some(g => g.has.includes(a))) }]);
      for (const g of groups) { const L = g.has.filter(a => by[a]); if (!L.length) continue; L.forEach(a => used.add(a)); RAIL_STORE[g.k] = L.map(a => by[a]);
        if (L.length === 1) { out.push(by[L[0]]); continue; }
        let badge = 0, bang = false; for (const a of L) { const m = by[a].match(/<i>([^<]*)<\/i>/); if (m) { if (/^\d+$/.test(m[1])) badge += +m[1]; else bang = true; } }
        out.push(`<button class="hrail" data-a="railGrp" data-v="${g.k}" title="${g.n}">${ico(g.ic, "#e8c878", 22)}<span>${g.n}</span>${badge ? `<i>${badge}</i>` : bang ? "<i>!</i>" : ""}</button>`); }
      return `<div class="hubrail">${out.join("")}</div>`; } catch (e) { return full; } }; }
ACT.railGrp = k => { const L = RAIL_STORE[k] || []; const G = RAIL_GROUPS.find(g => g.k === k) || { n: "Plus" };
  modal(`<h2>${esc(G.n || "")}</h2><div class="railgrp">${L.map(b => b.replace(/class="hrail([^"]*)"/, 'class="hrail big$1"')).join("")}</div>`);
};
const quickTeamsHTML0 = quickTeamsHTML;
// bas du Bastion : « Départ rapide » rangé dans le bandeau « Prochain objectif » (un seul élément en bas)
{ const ng = nextGoalHTML; nextGoalHTML = function () { const h = ng.apply(this, arguments); if (!h) return h; const q = quickTeamsHTML0(); if (!q) return h;
    return h.replace('<span class="nga">›</span>', `<span class="ngq" data-a="quickStart" title="Relancer la dernière expédition">${ico("map", "#e8c878", 16)}<b>Repartir</b></span><span class="nga">›</span>`); }; }
quickTeamsHTML = function () { try { if (!S.run && !UI.hubOpen && nextGoal && nextGoal()) return ""; } catch (e) { } return quickTeamsHTML0.apply(this, arguments); };
