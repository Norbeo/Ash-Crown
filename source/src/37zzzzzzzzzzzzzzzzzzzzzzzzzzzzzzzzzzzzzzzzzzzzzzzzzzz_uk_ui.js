// Refonte de l'interface (20 nov.) : les boutons sans texte (icône seule) prennent la pastille peinte, pas la plaque à pointes.
if (typeof document !== "undefined") {
  const ukIcoMark = root => { for (const b of (root || document).querySelectorAll(".btn:not(.icob)")) if (!b.textContent.trim() && b.querySelector("svg,img,.ico,canvas,i,span")) b.classList.add("icob"); };
  const ukObs = new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1) ukIcoMark(n.parentNode || n); });
  const ukStart = () => { ukIcoMark(document); ukObs.observe(document.body, { childList: true, subtree: true }); };
  if (document.body) ukStart(); else document.addEventListener("DOMContentLoaded", ukStart);
}
