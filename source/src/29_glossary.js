/* ═══════════════════════ Glossaire : à quoi correspond chaque bonus ═══════════════════════
   GLOSS : définition de chaque terme du jeu. gl(texte) entoure les termes connus d'une étiquette
   (souligné pointillé) ; un toucher ou un survol affiche la bulle d'explication (tipShow).
   Tout élément portant data-tip="clé" (ou data-tipn/data-tipd) ouvre aussi la bulle. */
const GLOSS = {
  // ── combat ──
  resolution: { n: "Résolution", ic: "banner", d: "Le moral du groupe pendant un combat, de 0 à 100. On démarre à 50, plus les bonus de la Chapelle, des reliques, des synergies et des veilles au camp. Un coup critique donne +3 et un ennemi tué +5 ; un héros à l'agonie coûte −8 et un héros tombé −15.<br><b>80 et plus — Exaltés :</b> +15 % de dégâts et +5 % de critique.<br><b>20 et moins — Ébranlés :</b> −15 % de dégâts et −10 de précision." },
  lueur: { n: "Lueur", ic: "torch", d: "La torche du groupe pendant une expédition. Elle baisse à chaque salle traversée. <b>Sous 30</b>, l'obscurité rend les ennemis plus dangereux (+12 % de dégâts), mais vos héros frappent plus fort (+5 % de dégâts, +5 % de critique) et le butin est meilleur. Les camps, la veille et certains événements la ravivent." },
  agonie: { n: "Agonie", ic: "skull", d: "À 0 PV, un héros ne meurt pas : il est à l'agonie. Chaque coup reçu peut alors l'achever (25 à 70 % de chances, moins avec une bonne résistance). Le moindre soin le tire d'affaire." },
  ultime: { n: "Ultime", ic: "flare", d: "La jauge sous chaque héros se remplit quand il agit (+18), reçoit des coups (+8) ou porte un critique (+6). Pleine, elle permet de lancer sa compétence ultime, bien plus puissante, puis se vide." },
  rage: { n: "Rage", ic: "rage", d: "Les combats ne s'éternisent pas : après le tour 14, les ennemis gagnent +12 % de dégâts à chaque tour et leurs soins sont divisés par deux. Après le tour 18, vos héros gagnent à leur tour +5 % de dégâts par tour." },
  intention: { n: "Intention", ic: "eye", d: "L'icône au-dessus d'un ennemi annonce ce qu'il prépare (attaque, soin, altération…), pour vous laisser le temps de réagir." },
  rang: { n: "Rangs", ic: "swords", d: "Les héros se tiennent sur 4 rangs, le 1 étant en première ligne. Chaque compétence ne s'utilise que depuis certains rangs et ne touche que certains rangs ennemis (les pastilles sous la compétence)." },
  pv: { n: "PV", ic: "heart", d: "Points de vie. À 0, un héros tombe à l'agonie ; un ennemi meurt." },
  protection: { n: "Protection", ic: "shield", d: "Réduit en pourcentage les dégâts reçus (85 % au maximum)." },
  esquive: { n: "Esquive", ic: "cloak", d: "Chance d'éviter complètement une attaque. Elle s'oppose à la précision de l'attaquant." },
  precision: { n: "Précision", ic: "aim", d: "Chance de toucher. Elle s'oppose à l'esquive de la cible." },
  critique: { n: "Critique", ic: "star", d: "Chance de porter un coup critique : ×1,5 dégâts, +3 de résolution et de l'énergie d'ultime." },
  vitesse: { n: "Vitesse", ic: "wind", d: "Détermine l'ordre de jeu à chaque tour : les plus rapides agissent en premier." },
  resistance: { n: "Résistance", ic: "guard", d: "Réduit les chances de subir une altération (saignement, étourdissement…) et, pour un héros à l'agonie, d'être achevé." },
  vol_vie: { n: "Vol de vie", ic: "drain", d: "Une partie des dégâts infligés soigne l'attaquant." },
  soins: { n: "Soins", ic: "heal", d: "Rendent des PV. Un soin relève aussi un héros à l'agonie." },
  alteration: { n: "Altérations", ic: "curse", d: "Effets néfastes temporaires (saignement, poison, brûlure, étourdissement, affaiblissement…). La résistance aide à les éviter ; certaines compétences les purgent." },
  // ── états ──
  bleed: { n: "Saignement", ic: "blood", d: "Inflige des dégâts au début de chaque tour de la victime, pendant plusieurs tours. Se cumule." },
  poison: { n: "Poison", ic: "flask", d: "Inflige des dégâts au début de chaque tour de la victime. Se cumule." },
  burn: { n: "Brûlure", ic: "fire", d: "Inflige des dégâts de feu au début de chaque tour de la victime. Se cumule." },
  stun: { n: "Étourdi", ic: "stun", d: "La victime perd son prochain tour." },
  weak: { n: "Affaibli", ic: "fear", d: "La victime inflige −25 % de dégâts." },
  vuln: { n: "Vulnérable", ic: "curse", d: "La victime subit +25 % de dégâts." },
  mark: { n: "Marqué", ic: "mark", d: "La cible subit +15 % de dégâts et attire les attaques ; certaines compétences frappent plus fort les cibles marquées." },
  accDn: { n: "Aveuglé", ic: "eye", d: "Précision réduite." },
  spdDn: { n: "Ralenti", ic: "hourglass", d: "Vitesse réduite : joue plus tard dans le tour." },
  protDn: { n: "Armure brisée", ic: "armor", d: "Protection réduite." },
  dodgeDn: { n: "Exposé", ic: "eye", d: "Esquive réduite." },
  protUp: { n: "Protection accrue", ic: "shield", d: "Protection augmentée pendant quelques tours." },
  dmgUp: { n: "Force", ic: "sword", d: "Dégâts augmentés pendant quelques tours." },
  spdUp: { n: "Hâte", ic: "wind", d: "Vitesse augmentée pendant quelques tours." },
  dodgeUp: { n: "Esquive accrue", ic: "cloak", d: "Esquive augmentée pendant quelques tours." },
  accUp: { n: "Précision accrue", ic: "aim", d: "Précision augmentée pendant quelques tours." },
  critUp: { n: "Acuité", ic: "star", d: "Chance de critique augmentée pendant quelques tours." },
  regen: { n: "Régénération", ic: "heal", d: "Rend des PV au début de chaque tour." },
  shield: { n: "Bouclier", ic: "guard", d: "Absorbe les dégâts avant les PV, jusqu'à épuisement." },
  prov: { n: "Provocation", ic: "banner", d: "Les ennemis sont forcés de viser ce héros." },
  riposte: { n: "Riposte", ic: "riposte", d: "Contre-attaque automatiquement quand il est frappé." },
  stealth: { n: "Furtif", ic: "shroud", d: "Ne peut pas être visé tant que d'autres cibles sont disponibles. Disparaît en attaquant." },
  guarded: { n: "Protégé", ic: "guard", d: "Un allié s'interpose et reçoit les attaques à sa place." },
  thorns: { n: "Épines", ic: "thorn", d: "Renvoie une partie des dégâts reçus à l'attaquant." },
  // ── progression ──
  trait: { n: "Traits", ic: "star", d: "Particularités de naissance d'un héros (vert : qualités, rouge : défauts). Ce sont des bonus passifs, toujours actifs." },
  relique: { n: "Reliques", ic: "gem", d: "Trouvées pendant l'expédition : bonus passifs pour tout le groupe, jusqu'à la fin de l'expédition." },
  synergie: { n: "Synergies", ic: "link", d: "Certaines classes se complètent : quand elles partent ensemble, tout le groupe reçoit un bonus passif pendant l'expédition." },
  evolution: { n: "Évolution", ic: "crown", d: "Au niveau 5, chaque héros choisit l'une de ses deux voies : nouvelles compétences et nouvelle apparence (aura)." },
  apogee: { n: "Apogée", ic: "crown", d: "Au niveau 12, un héros évolué atteint l'apogée de sa voie : un bonus passif puissant." },
  palier: { n: "Palier", ic: "armor", d: "Qualité de l'équipement, de I à V. Un palier plus élevé donne plus de dégâts (arme) ou de PV et de protection (armure). La Forge débloque les paliers." },
  rarete: { n: "Rareté", ic: "gem", d: "Commun, rare, épique, légendaire : plus l'objet est rare, plus il porte de bonus supplémentaires." },
  serment: { n: "Serments", ic: "seal", d: "Dans l'Abîme, des contraintes volontaires qui rendent l'expédition plus dure en échange de meilleures récompenses." },
  compagnon: { n: "Compagnon", ic: "paw", d: "L'animal qui suit le groupe : il frappe ou soutient à chaque tour et évolue au niveau 10." },
  // ── ressources ──
  or: { n: "Or", ic: "coin", d: "Monnaie principale : recrues, constructions, forge, soins." },
  eclat: { n: "Éclats de couronne", ic: "shard", d: "Ressource rare laissée par les gardiens : sert à agrandir les bâtiments du Bastion et à faire évoluer les compagnons." },
  ferraille: { n: "Ferraille", ic: "iron", d: "Obtenue en recyclant l'équipement : sert à forger et améliorer les armes et armures." },
  essence: { n: "Essence", ic: "essence", d: "Obtenue en recyclant des objets rares ou plus : sert à forger les hauts paliers et à faire évoluer héros et compagnons." },
  cendre: { n: "Cendres royales", ic: "ember", d: "Obtenues en recyclant des objets légendaires : nécessaires aux paliers IV et V." },
  potion: { n: "Potions", ic: "potion", d: "Soins utilisables pendant l'expédition. La Chapelle en ajoute une par niveau." },
};
// formes du texte → clé (insensible à la casse, mots entiers)
const GLOSS_WORDS = [
  ["résolution", "resolution"], ["lueur", "lueur"], ["agonie", "agonie"], ["ultimes?", "ultime"], ["rage", "rage"],
  ["protection", "protection"], ["esquive", "esquive"], ["précision", "precision"], ["critiques?", "critique"], ["vitesse", "vitesse"],
  ["résistance(?: aux altérations)?", "resistance"], ["vol de vie", "vol_vie"], ["altérations?", "alteration"],
  ["saignements?", "bleed"], ["poisons?", "poison"], ["brûlures?", "burn"], ["étourdi(?:t|e|s|ssement|ssements)?", "stun"], ["affaibli(?:e|s)?", "weak"],
  ["vulnérables?", "vuln"], ["marqu(?:é|ée|és|e)s?", "mark"], ["régénération", "regen"], ["boucliers?", "shield"], ["provo(?:que|cation)", "prov"],
  ["ripostes?", "riposte"], ["furtif|furtive", "stealth"], ["épines", "thorns"], ["hâte", "spdUp"], ["aveugl(?:é|e)s?", "accDn"],
  ["essences?", "essence"], ["ferraille", "ferraille"], ["cendres royales", "cendre"], ["éclats? de couronne", "eclat"],
];
const GLOSS_RE = new RegExp("(^|[^\\p{L}])(" + GLOSS_WORDS.map(w => w[0]).join("|") + ")(?![\\p{L}])", "giu");
function glossKey(word) { const w = word.toLowerCase(); for (const [re, k] of GLOSS_WORDS) if (new RegExp("^(?:" + re + ")$", "iu").test(w)) return k; return null; }
// entoure les termes connus d'une étiquette cliquable (texte simple ou HTML sans balise contenant ces mots)
function gl(text) {
  if (!text) return "";
  return String(text).split(/(<[^>]*>)/).map(part => part.startsWith("<") ? part : part.replace(GLOSS_RE, (m, pre, w) => { const k = glossKey(w); return k ? `${pre}<span class="gl" data-tip="${k}">${w}</span>` : m; })).join("");
}
// attributs de bulle pour un élément quelconque (titre + texte libres)
function tipAttr(n, d) { return `data-tipn="${esc(n)}" data-tipd="${esc(d)}"`; }
const TIP = { el: null, src: null };
function tipShow(src) {
  if (!src.isConnected) return;
  const k = src.dataset.tip, G = k ? GLOSS[k] : null;
  const n = G ? G.n : src.dataset.tipn, d = G ? G.d : gl(esc(src.dataset.tipd || ""));
  if (!n && !d) return;
  if (!TIP.el) { TIP.el = document.createElement("div"); TIP.el.id = "tip"; document.body.appendChild(TIP.el); }
  TIP.src = src;
  TIP.el.innerHTML = `<b>${G && G.ic ? ico(G.ic, "#e8c878", 16) : ""}${n || ""}</b><div>${d}</div>`;
  TIP.el.hidden = false; TIP.el.style.left = "0px"; TIP.el.style.top = "0px";
  const r = src.getBoundingClientRect(), t = TIP.el.getBoundingClientRect(), W = innerWidth, H = innerHeight;
  let x = clamp(r.left + r.width / 2 - t.width / 2, 8, W - t.width - 8), y = r.bottom + 8;
  if (y + t.height > H - 8) y = Math.max(8, r.top - t.height - 8);
  TIP.el.style.left = x + "px"; TIP.el.style.top = y + "px";
}
function tipHide() { if (TIP.el) TIP.el.hidden = true; TIP.src = null; }
function tipEvents() {
  if (!HASWIN) return;
  // toucher / clic : ouvre la bulle (un élément d'action garde son action, la bulle vient en plus seulement s'il n'en a pas)
  document.addEventListener("click", e => {
    const s = e.target.closest("[data-tip],[data-tipn]");
    if (s && !e.target.closest("[data-a],[data-go]")) { e.stopPropagation(); tipShow(s); return; }
    if (!e.target.closest("#tip")) tipHide();
  }, true);
  // souris : survol
  document.addEventListener("pointerover", e => { if (e.pointerType !== "mouse") return; const s = e.target.closest("[data-tip],[data-tipn]"); if (s && s !== TIP.src) tipShow(s); else if (!s && TIP.src && !e.target.closest("#tip")) tipHide(); });
  addEventListener("scroll", tipHide, true); addEventListener("resize", tipHide);
}
