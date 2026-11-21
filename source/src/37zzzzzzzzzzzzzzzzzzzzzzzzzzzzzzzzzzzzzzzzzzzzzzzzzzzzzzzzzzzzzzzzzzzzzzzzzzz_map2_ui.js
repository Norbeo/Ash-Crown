// ── Carte d'expédition refaite (21 nov.) : bandeau peint compact et collant en haut, compagnie collante en bas
//    (portraits encadrés, barres de PV forgées), étiquettes de salles en plaques, défilement vers les salles à jouer
{ const mh = SCREENS.map.html; SCREENS.map.html = function () { let h = mh.apply(this, arguments); if (!h || !S.run) return h;
    h = h.replace('<div class="panel" style="padding:8px 10px">', '<div class="panel maphud">');
    h = h.replace('<div class="row" style="justify-content:center;gap:6px;margin-top:6px;flex-wrap:nowrap">', '<div class="row mapparty">');
    h = h.replace(/<div class="panel" style="padding:4px;width:84px;text-align:center;([^"]*)">/g, '<div class="mphero" style="$1">');
    h = h.replace(/<div class="bar" style="height:6px"><i style="width:([0-9.]+)%"><\/i><\/div>/g, '<div class="mphp"><i style="width:$1%"></i></div>');
    return h; }; }
{ const mm = SCREENS.map.mount; SCREENS.map.mount = function () { const r = mm && mm.apply(this, arguments);
    setTimeout(() => { try { const v = $("#view"), n = v && v.querySelector(".node.av"); if (!v || !n || UI._mapScrolled === (S.run && S.run.pos && S.run.pos.c)) return;
      UI._mapScrolled = S.run && S.run.pos && S.run.pos.c; const rv = v.getBoundingClientRect(), rn = n.getBoundingClientRect(), y = rn.top - rv.top + v.scrollTop - rv.height * .38;
      v.scrollTo({ top: Math.max(0, y), behavior: "smooth" }); } catch (e) { } }, 250); return r; }; }
