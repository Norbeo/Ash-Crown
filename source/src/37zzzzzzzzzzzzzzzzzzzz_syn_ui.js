/* Synergies nombreuses : affichage replié (nombre + liste dépliable), étiquette unique sur la carte. */
{ const nt = synergyNeedText; synergyNeedText = Y => Y === SYNERGIES.rg_quatre ? "4 héros" : nt(Y); }
{ const sh = synergyHTML; synergyHTML = function (classes) { const act = activeSynergies(classes); let h = sh.apply(this, arguments); if (!h || act.length <= 4) return h;
    const open = !!UI.synOpen, i = h.indexOf('<div class="synr on"'), j = h.lastIndexOf('<div class="synr on"'), jEnd = j < 0 ? -1 : h.indexOf("</div>", h.indexOf("</span>", j)) + 6;
    if (i < 0 || jEnd < 6) return h;
    const head = `<div class="synr on" data-a="synToggle" style="cursor:pointer">${ico("link", "#e8c878", 14)}<b>${act.length} synergies actives</b><span class="tiny">${open ? "▾ replier" : "▸ voir le détail"}</span></div>`;
    return h.slice(0, i) + head + (open ? h.slice(i, jEnd) : "") + h.slice(jEnd); }; }
ACT.synToggle = () => { UI.synOpen = !UI.synOpen; refresh(); };
