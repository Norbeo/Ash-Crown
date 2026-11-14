/* Icônes peintes propres aux compétences des compagnons (14 nov.) : planches 5×4 assets/psk_<n>.webp.
   6 compagnons par planche (PET_START, PET_ORDER puis familiers légendaires), 3 cases chacun : compétence 1, compétence 2, compétence d'évolution ;
   les 2 dernières cases de chaque planche restent vides. Tant qu'une planche n'est pas peinte, l'icône générique reste. */
const PSK_PER = 6;
function petSkOrder() {
  const seen = new Set(), L = [];
  const add = id => { if (id && PETS[id] && !seen.has(id)) { seen.add(id); L.push(id); } };
  (typeof PET_START !== "undefined" ? PET_START : []).forEach(add);
  (typeof PET_ORDER !== "undefined" ? PET_ORDER : []).forEach(add);
  (typeof LEGEND_PET_IDS !== "undefined" ? LEGEND_PET_IDS : []).forEach(add);
  Object.keys(PETS).forEach(add);
  return L;
}
let PSK_IDX = null;
// nom d'icône de la compétence i (0, 1 ; 2 = évolution) du compagnon id, ou null si la planche n'est pas peinte
function petSkIc(id, i) {
  if (!PSK_IDX) { PSK_IDX = {}; petSkOrder().forEach((k, n) => PSK_IDX[k] = n); }
  const n = PSK_IDX[id]; if (n == null) return null;
  const sheet = Math.floor(n / PSK_PER) + 1, cell = (n % PSK_PER) * 3 + i;
  return artHas("psk_" + sheet) ? "psk/" + sheet + "/" + cell : null;
}
{ const ico1 = ico; ico = function (name, col, size) {
    if (name && name.startsWith("psk/")) { const [, sh, i] = name.split("/"), n = +i, cx = n % SK_COLS, cy = Math.floor(n / SK_COLS);
      const v = typeof window !== "undefined" && window.ART_V && window.ART_V["psk_" + sh] ? "?v=" + window.ART_V["psk_" + sh] : "";
      return `<span class="ic pic skic" style="background:url(assets/psk_${sh}.webp${v}) ${cx / (SK_COLS - 1) * 100}% ${cy / (SK_ROWS - 1) * 100}% / ${SK_COLS * 100}% ${SK_ROWS * 100}% no-repeat${size ? `;width:${size}px;height:${size}px` : ""}"></span>`; }
    return ico1.apply(this, arguments); }; }
// icône d'une compétence de compagnon : peinte si disponible, sinon l'icône générique d'avant
function petSkIco(id, i, s, col, size) { const p = petSkIc(id, i); if (p) return ico(p, col, size); s = s || {}; return ico(i === 2 ? "star" : s.m ? "claw" : s.heal ? "heal" : s.shield ? "shield" : "star", col, size); }
