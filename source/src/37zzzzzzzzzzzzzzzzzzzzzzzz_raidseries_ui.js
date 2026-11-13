/* Raid et séries : le raid (combat spécial) est grisé pendant une série classique ; une « Série de raids » enchaîne les assauts. */
{ const sp = specialHTML; specialHTML = function (E) { let h = sp.apply(this, arguments); if (!h) return h;
    if (UI.seriesN && !UI.seriesRaid) h = h.replace(/<button class="btn sm [^"]*" data-a="specialSet" data-v="(raid|arena)">/g, (m, k) => `<button class="btn sm ghost off" disabled title="Indisponible pendant une série classique">`)
      + `<div class="tiny dim" style="margin-top:2px">${ico("lock", "#9a8c7a", 11)} Raid et arène : combats spéciaux, indisponibles pendant une série classique. Choisissez « Série de raids » dans les options de série.</div>`;
    return h; }; }
{ const sh = seriesHTML; seriesHTML = function (E) { let h = sh.apply(this, arguments); if (!h || !(UI.seriesN > 0) || E.region === "abime" || !raidOpen() || !raidState()) return h;
    const on = !!UI.seriesRaid, b = `<div class="row" style="gap:6px;margin-top:6px;flex-wrap:wrap"><button class="btn sm ${on ? "gold" : "ghost"}" data-a="seriesRaid">${ico("skull", "#ff6a4a", 12)} Série de raids</button><span class="tiny dim">${on ? `Chaque expédition de la série est un assaut du raid (${RAID_ROUNDS} tours) contre ${esc(MONSTERS[raidState().key].n)} ; la série s'arrête si un héros tombe ou est blessé.` : "Enchaîner les assauts du raid au lieu des expéditions classiques."}</span></div>`;
    return h + b; }; }
ACT.seriesRaid = () => { UI.seriesRaid = !UI.seriesRaid; if (UI.seriesRaid) UI.seriesEvo = 0; refresh(); };
{ const sn = ACT.seriesN; if (sn) ACT.seriesN = function (v) { const r = sn.apply(this, arguments); if (!(+v > 0)) UI.seriesRaid = 0; return r; }; }
function raidSeriesLaunch(R) { const E = UI.expe; go("expe"); Object.assign(E, { party: R.cfg.party.slice(), pet: R.cfg.pet, special: "raid", rush: false, daily: false });
  specialStart("raid"); if (S.run) { S.run.autoMap = 1; save(); if (typeof autoMapLoop === "function") setTimeout(autoMapLoop, 500); } }
{ const L = ACT.launch; ACT.launch = function (...a) { const E = UI.expe;
    if (!S.run && E && UI.seriesN > 0 && UI.seriesRaid && raidOpen() && raidState() && E.party.length) { // série de raids
      S.repeat = { raid: 1, left: UI.seriesN - 1, cfg: { party: E.party.slice(), pet: E.pet }, rep: { n: 0, win: 0, gold: 0, loot: 0, kills: 0, fallen: 0, bosses: {}, floor: 0, abyss0: S.abyss.best || 0, t0: Date.now(), seen: (S.journal && S.journal[0] && S.journal[0].t) || 0, region: "raid" } };
      UI.seriesN = 0; UI.seriesRaid = 0; raidSeriesLaunch(S.repeat); return; }
    if (!S.run && E && UI.seriesN > 0 && E.special) E.special = null; // série classique : jamais de combat spécial
    return L.apply(this, a); }; }
{ const st = seriesTick; seriesTick = function () { const R = S.repeat; if (!R || !R.raid) return st.apply(this, arguments); if (UI.screen !== "results" || UI.seriesT) return;
    seriesAccount(R); const last = (S.journal || [])[0], hs = R.cfg.party.map(heroById);
    const stop = !R.left ? "Série de raids terminée." : !last || last.outcome === "wipe" ? "Série de raids arrêtée : la compagnie a été défaite." : hs.some(h => !h || isInjured(h)) ? "Série de raids arrêtée : un héros est blessé ou absent." : (last.fallen || []).length ? "Série de raids arrêtée : un héros est tombé." : null;
    if (stop) { const rep = R.rep; S.repeat = null; save(); seriesReport(rep, stop); return; }
    UI.seriesT = setTimeout(() => { UI.seriesT = null; if (!S.repeat || !S.repeat.raid || UI.screen !== "results") return; S.repeat.left--; raidSeriesLaunch(S.repeat); toast(S.repeat.left > 900 ? "Série de raids sans fin : assaut suivant." : `Série de raids : encore ${S.repeat.left} assaut(s) après celui-ci.`); }, 2500); }; }
