/* PlayDrop : actif seulement dans la version publiée sur PlayDrop (window.CC_PD, posé par pd/mkpd.sh, qui charge aussi le SDK).
   – sauvegarde en ligne : la partie suit le joueur d'un appareil à l'autre (sdk.me.appData, code compressé CC1) ;
   – classements : profondeur de l'Abîme, niveau d'aventure, chapitres vaincus ;
   – cycle de vie : ready() à la fin du chargement, pause/reprise, son coupé quand PlayDrop le demande. */
const PD = { sdk: null, on: false, q: Promise.resolve(), last: 0, sent: {}, paused: false, audio: true };
const PD_LB = { abyss: "abime-profondeur", adv: "niveau-aventure", ch: "chapitres-vaincus" };
function pdPlay() { return PD.on && PD.sdk && PD.sdk.host && PD.sdk.host.phase === "play"; }
// démarrage : attendre le SDK (au plus 6 s), puis reprendre la sauvegarde en ligne si elle est plus récente que celle de l'appareil
async function pdInit() {
  if (typeof window === "undefined" || !window.CC_PD || typeof playdrop === "undefined") return;
  try {
    const sdk = await Promise.race([playdrop.init(), new Promise((_, r) => setTimeout(() => r(new Error("délai")), 6000))]);
    PD.sdk = sdk; PD.on = true;
    const H = sdk.host;
    PD.audio = H.audioAllowed !== false; PD.paused = !!H.isPaused;
    H.onAudioAllowedChange && H.onAudioAllowedChange(a => { PD.audio = !!a; pdAudio(); });
    H.onPause && H.onPause(() => { PD.paused = true; pdAudio(); try { save(); pdCloudSave(true); } catch (e) { } });
    H.onResume && H.onResume(() => { PD.paused = false; pdAudio(); });
    const ad = sdk.me && sdk.me.appData, d = ad && ad.data;
    if (d && d.pack) {
      let loc = null; try { loc = JSON.parse(localStorage.getItem(SAVE_KEY) || "null"); } catch (e) { }
      const locTs = (loc && loc.lastSeen) || 0;
      if (!loc || (d.ts || 0) > locTs + 5000) {
        const s = await unpackSave(d.pack);
        if (s && s.heroes) { s.lastSeen = d.ts || Date.now(); localStorage.setItem(SAVE_KEY, JSON.stringify(s)); PD.restored = 1; }
      }
    }
  } catch (e) { PD.on = !!PD.sdk; }
}
function pdAudio() { try { if (!SND || !SND.ctx) return; if (PD.audio && !PD.paused) SND.ctx.resume().catch(() => { }); else SND.ctx.suspend().catch(() => { }); } catch (e) { } }
function pdReady() { try { if (PD.sdk && !PD.readyDone) { PD.readyDone = 1; PD.sdk.host.ready(); if (PD.restored) setTimeout(() => toast("☁ Partie reprise depuis votre sauvegarde en ligne.", "good"), 1200); } } catch (e) { } }
// sauvegarde en ligne : au plus une fois par minute (ou tout de suite à la fin d'une expédition / en pause), écritures en file
function pdCloudSave(now) {
  if (!pdPlay() || !S || !S.heroes || !S.heroes.length) return;
  const t = Date.now(); if (!now && t - PD.last < 60000) return; PD.last = t;
  const snap = JSON.parse(JSON.stringify(S));
  PD.q = PD.q.then(async () => { const pack = await packSave(snap); return PD.sdk.me.updateAppData({ v: 1, ts: snap.lastSeen || t, pack }); }).catch(() => { PD.last = 0; });
}
function pdScores() {
  if (!pdPlay() || !S) return;
  const L = PD.sdk.leaderboards; if (!L || !L.submitScore) return;
  const sc = { [PD_LB.abyss]: (S.abyss && S.abyss.best) || 0, [PD_LB.adv]: typeof advLevel === "function" ? advLevel() : 0, [PD_LB.ch]: typeof regionsCleared === "function" ? regionsCleared() : 0 };
  for (const k in sc) { const v = Math.max(0, Math.floor(sc[k] || 0)); if (v > 0 && v !== PD.sent[k]) { PD.sent[k] = v; L.submitScore(k, v).catch(() => { delete PD.sent[k]; }); } }
}
{ const sv = save; save = function () { const r = sv.apply(this, arguments); try { pdCloudSave(false); } catch (e) { } return r; }; }
{ const er = endRun; endRun = function () { const r = er.apply(this, arguments); try { if (PD.on) setTimeout(() => { pdCloudSave(true); pdScores(); }, 50); } catch (e) { } return r; }; }
{ const bd = bootDone; bootDone = function () { const r = bd.apply(this, arguments); pdReady(); return r; }; }
// classements consultables depuis les Archives (onglet ajouté seulement sur PlayDrop)
async function pdBoardHTML() {
  if (!PD.on || !PD.sdk.leaderboards) return `<p class="dim">Les classements sont disponibles dans la version PlayDrop du jeu.</p>`;
  const names = { [PD_LB.abyss]: "Profondeur de l'Abîme", [PD_LB.adv]: "Niveau d'aventure", [PD_LB.ch]: "Chapitres vaincus" };
  let h = "";
  for (const k in names) {
    try {
      const { leaderboard: lb } = await PD.sdk.leaderboards.get(k, { top: 10, aroundMe: 2 });
      const row = e => `<div class="row"><b>${e.rank}.</b> ${String(e.displayName || e.username || "?").replace(/</g, "&lt;")} <span class="right">${e.score}</span></div>`;
      h += `<h3>${names[k]}</h3>${(lb.top || []).map(row).join("") || `<p class="dim">Personne encore.</p>`}${lb.playerEntry && !(lb.top || []).some(e => e.rank === lb.playerEntry.rank) ? `<div class="dim">…</div>${row(lb.playerEntry)}` : ""}`;
    } catch (e) { h += `<h3>${names[k]}</h3><p class="dim">Indisponible (hors ligne ?).</p>`; }
  }
  return h;
}
ACT.pdBoards = async () => { pdScores(); modal(`<h2>Classements</h2><div id="pdlb"><p class="dim">Chargement…</p></div><div class="row"><button data-a="closeModal">Fermer</button></div>`); const el = document.getElementById("pdlb"); if (el) el.innerHTML = await pdBoardHTML(); };
