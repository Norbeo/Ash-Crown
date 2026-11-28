// ── Vignettes peintes des événements (21 nov.) : un thème par événement (mots-clés), affiché en tête de la fenêtre si peint
const EV_THEMES = [
  ["mirror", /miroir|reflet|vision|echo|écho|double|abime|abîme|voix|eclipse|éclipse|etoile|étoile|oracle|osselet/i],
  ["merchant", /marchand|colporteur|march[eé]|apothicaire|herboriste|tresorerie|trésor royal/i],
  ["chest", /coffre|tresor|trésor|epave|épave|charrette|chariot|cache|trouvaille/i],
  ["well", /puits|source|fontaine|lac|abreuvoir|benitier|bénitier|eau/i],
  ["altar", /autel|sanctuaire|idole|totem|pierre_runique|runique|statue|offrande|borne/i],
  ["chapel", /chapelle|eglise|église|cloche|pr[eê]tre|moine|vitrail|confessionnal|procession|flagellant|p[eè]lerin/i],
  ["crypt", /crypte|sarcophage|ossuaire|os\b|d'os|tombe|sentinelle|galerie|fresque|escalier/i],
  ["dead", /charnier|cadavre|fosse|corps|pendu|gibet|noy[eé]e|crieur|medecin_mort|chevalier|carcasse|cimeti/i],
  ["forge", /forge|armure|blason|banniere|bannière|garde|tr[oô]ne|herault|héraut/i],
  ["fire", /feu|brasero|b[uû]cher|braise|cendre|lanterne|lune/i],
  ["beast", /loup|meute|chien|corbeau|rat|crapaud|bete|bête|cerf|sangsue|hurlement|tani[eè]re|pet_/i],
  ["swamp", /marais|barque|tourbe|pilotis|p[eê]cheur|brume/i],
  ["forest", /for[eê]t|arbre|ronce|sorci[eè]re|cercle|champignon|racine|graine|jardin|chasseur/i],
  ["dungeon", /cachot|oubliette|cage|cha[iî]ne|prison|voleur|pi[eè]ge|bandit|brigand|deserteur|déserteur/i],
  ["stranger", /mendiant|ermite|soldat|enfant|ecuyer|écuyer|gu[eé]risseuse|luth|fossoyeur|veilleur|passeur|chambellan|aveugle|banquet|taverne|maison|d[eé]s/i]];
function evTheme(E) { const s = E.id + " " + E.n; for (const [k, re] of EV_THEMES) if (re.test(s)) return k; return "stranger"; }
{ const se = showEvent; showEvent = function (n) { const r = se.apply(this, arguments);
    try { const E = EVENTS.find(e => e.id === n.ev), k = E && "ev_" + evTheme(E), box = $("#modal .box"); if (E && box && artHas(k) && !box.querySelector(".evart")) { const h2 = box.querySelector("h2"); if (h2) h2.insertAdjacentHTML("afterend", `<div class="evart" style="background-image:url(assets/${k}.webp)"></div>`); } } catch (e) { } return r; }; }
