// ── Accueil apaisé (27 nov.) : au retour, plus de fenêtre ni de pluie de notifications.
//    Un seul bandeau discret « Pendant votre absence » qui s'efface seul (toucher = le détail),
//    les notifications des premières secondes vont dans la pile, les pastilles deviennent de simples braises.
const CALM = { until: 0 };
{ const rs = retShow; retShow = function () {
    if (RET.shown || UI.screen !== "bastion") return; if (!$("#modal").hidden) return void (RET.timer = setTimeout(retShow, 1200));
    const L = RET.lines.slice(), I = RET.idle; if (!L.length && !I) return;
    if (S.opts && S.opts.retFull) return rs.apply(this, arguments);
    RET.shown = 1; UI._retDetail = { L, I };
    // résumé en une ligne : or, éclats, niveaux gagnés
    const txt = L.map(x => String(x.t || "").replace(/<[^>]+>/g, "")); let gold = 0, sh = 0;
    for (const t of txt) { const g = t.match(/\+([\d\s  ]+)\s*or/); if (g) gold += +g[1].replace(/\D/g, ""); const e = t.match(/\+(\d+)\s*éclat/); if (e) sh += +e[1]; }
    const ups = I && I.out ? I.out.filter(o => o.up).length : 0, bits = [];
    if (gold) bits.push(`${ico("coin", "#e8c060", 14)} +${fmt(gold)}`); if (sh) bits.push(`${ico("shard", "#c090ff", 14)} +${sh}`); if (ups) bits.push(`${ico("up")} ${ups} héros plus forts`);
    if (!bits.length) bits.push(`${L.length} nouvelle${L.length > 1 ? "s" : ""}`);
    const d = document.createElement("div"); d.className = "calmret"; d.innerHTML = `<span class="ct">Pendant votre absence</span><span class="cb">${bits.join('<i class="sep">·</i>')}</span>`;
    d.onclick = () => { d.remove(); ACT.retDetail(); }; document.body.appendChild(d);
    setTimeout(() => d.classList.add("out"), 6500); setTimeout(() => d.remove(), 7400);
  }; }
ACT.retDetail = () => { const R = UI._retDetail; if (!R) return; RET.shown = 0; RET.lines = R.L; RET.idle = R.I; const o = S.opts.retFull; S.opts.retFull = 1; try { retShow(); } finally { S.opts.retFull = o; } };
// les premières secondes au Bastion : rien ne surgit, tout va dans la pile (lisible d'un toucher)
{ const bm = SCREENS.bastion.mount; SCREENS.bastion.mount = function () { if (!UI._calmDone) { UI._calmDone = 1; CALM.until = Date.now() + 9000; } return bm && bm.apply(this, arguments); }; }
{ const t0 = toast; toast = function (msg, kind = "") {
    if (Date.now() < CALM.until && UI.screen === "bastion" && kind !== "bad") { if (kind === "hint") return; try { TPILE.list.push({ msg, kind, at: Date.now() }); } catch (e) { } return; }
    return t0.apply(this, arguments); }; }
// Pastilles vues (27 nov.) : toucher un bouton du Bastion (ou l'ouvrir depuis un groupe) éteint sa pastille pour la journée ;
// elle ne se rallume que si le compte augmente (nouvelle récompense, nouvelle offre).
function railSeen() { const d = new Date().toDateString(); if (!S.railSeen || S.railSeen._d !== d) S.railSeen = { _d: d }; return S.railSeen; }
const railNum = t => /^\d+$/.test(t) ? +t : 1;
{ const hr = hubRailHTML; hubRailHTML = function () { const h = hr.apply(this, arguments); try { const seen = railSeen();
      return h.replace(/<button class="hrail[^"]*"[^>]*data-a="([^"]*)"(?:[^>]*data-v="([^"]*)")?[^>]*>[\s\S]*?<\/button>/g, (btn, a, v) => {
        const m = btn.match(/<i>([^<]*)<\/i>/); if (!m) return btn; const key = a + "|" + (v || ""), n = railNum(m[1]);
        return seen[key] != null && n <= seen[key] ? btn.replace(m[0], "") : btn.replace("<button ", `<button data-rk="${esc(key)}" data-rn="${n}" `); }); } catch (e) { return h; } }; }
document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("[data-rk]"); if (!b || !S) return; railSeen()[b.dataset.rk] = +b.dataset.rn || 1; b.querySelectorAll(":scope > i, .rrb").forEach(i => i.remove()); try { save(); } catch (er) { } }, true);
{ const rg = ACT.railGrp; ACT.railGrp = function (k) { const r = rg.apply(this, arguments); try { document.querySelectorAll("#modal .railrow").forEach(row => { const bd = row.querySelector(".rrb"); if (!bd) return; const key = row.dataset.a + "|" + (row.dataset.v || ""), n = railNum(bd.textContent.trim()); if (railSeen()[key] != null && n <= railSeen()[key]) bd.remove(); else { row.dataset.rk = key; row.dataset.rn = n; } }); } catch (e) { } return r; }; }
