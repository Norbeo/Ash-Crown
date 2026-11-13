/* Icônes peintes propres à chaque compétence (13 nov.) : une planche 5×4 par classe, assets/sk_<classe>.webp.
   Ordre des cases : 9 compétences de base, l'ultime, puis pour chaque voie ses 4 compétences et son ultime (20 cases).
   Tant que la planche d'une classe n'est pas peinte, ses compétences gardent leurs icônes génériques. */
const SK_COLS = 5, SK_ROWS = 4;
function skillArtOrder(cls) {
  const C = CLASSES[cls], L = Object.keys(C.skills).map(k => [k, C.skills[k]]); L.push(["ult", C.ult]);
  for (const [ek, E] of Object.entries(C.evos || {})) { for (const k of Object.keys(E.skills || {})) L.push([k, E.skills[k]]); if (E.ult) L.push(["ult_" + ek, E.ult]); }
  return L;
}
const SK_FALL = {};
function skillIconsApply() {
  for (const cls of Object.keys(CLASSES)) {
    if (!artHas("sk_" + cls)) continue;
    skillArtOrder(cls).forEach(([k, s], i) => { if (!s || i >= SK_COLS * SK_ROWS) return; const name = "sk/" + cls + "/" + i; if (s.ic && !s.ic.startsWith("sk/")) SK_FALL[name] = s.ic; s.ic = name; });
  }
}
{ const ico0 = ico; ico = function (name, col, size) {
    if (name && name.startsWith("sk/")) { const [, cls, i] = name.split("/"), n = +i, cx = n % SK_COLS, cy = Math.floor(n / SK_COLS);
      if (!artHas("sk_" + cls)) return ico0(SK_FALL[name] || "star", col, size);
      const v = typeof window !== "undefined" && window.ART_V && window.ART_V["sk_" + cls] ? "?v=" + window.ART_V["sk_" + cls] : "";
      return `<span class="ic pic skic" style="background:url(assets/sk_${cls}.webp${v}) ${cx / (SK_COLS - 1) * 100}% ${cy / (SK_ROWS - 1) * 100}% / ${SK_COLS * 100}% ${SK_ROWS * 100}% no-repeat${size ? `;width:${size}px;height:${size}px` : ""}"></span>`; }
    return ico0.apply(this, arguments); }; }
skillIconsApply();
