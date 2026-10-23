/* ═══════════════════════ Démarrage ═══════════════════════ */
if (HASWIN) {
  const boot = () => {
    sceneInit(); uiEvents();
    if (window.CC_SW && "serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => { });
    go("title");
    document.addEventListener("pointerdown", () => { audioInit(); if (SND.ctx && SND.ctx.state === "suspended") SND.ctx.resume(); if (!SND.mOn && S) musicPlay(UI.screen === "combat" ? "combat" : "bastion"); else if (!SND.mOn) musicPlay("titre"); }, { once: false });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
}
