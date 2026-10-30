// ── Gardiens : titres, répliques d'entrée, butin unique ; mode Hardi par chapitre ; dernières paroles ──
const BOSS_INFO = {
  docteur_peste: ["Le dernier médecin de Morvaine", "« Restez immobiles. Le remède ne fait mal qu'une fois. »", "Bec du Docteur", "arm"],
  mere_ronces: ["La forêt qui a oublié d'être douce", "« Venez, mes petits. Les branches ont faim. »", "Épine-Mère", "wpn"],
  liche: ["Le prieur qui a vaincu la mort", "« Agenouillez-vous. Les morts prient mieux que vous. »", "Couronne de fer du Prieur", "arm"],
  abbe: ["Le berger des moines morts", "« Mes frères vous attendaient. Ils attendent toujours. »", "Crosse de Saint-Morne", "wpn"],
  mere_noyes: ["La gardienne des eaux noires", "« L'eau garde tout. Elle vous gardera. »", "Larme des Noyés", "tr"],
  reine_sabbat: ["Couronnée de bois mort", "« Dansez avec nous. Jusqu'à l'os. »", "Couronne du Sabbat", "arm"],
  roi_cendres: ["Ce qu'il reste d'Aldemar", "« Prenez-la, cette couronne. Et voyez ce qu'elle fait de vous. »", "Lame d'Aldemar", "wpn"],
  sans_nom: ["Ce qui attendait avant les rois", "« … »", "Éclat sans nom", "tr"],
  cardinal: ["Le confesseur qui voulait régner", "« Ces fragments sont à moi. Dieu me les a promis. »", "Encensoir écarlate", "wpn"],
  sans_visage: ["Un ordre sans visage", "« Menace reconnue. Exécution. »", "Heaume sans visage", "arm"],
  matrone_os: ["La couturière des saints", "« Encore un enfant pour ma collection… »", "Aiguille d'os", "wpn"],
  devoreur_lumiere: ["La faim au fond du noir", "« Éteignez-vous. »", "Lanterne dévorée", "tr"],
  archonte_cendres: ["La voix de tous les rois morts", "« Nous étions des rois. Vous n'êtes que des porteurs. »", "Aile de cendre", "arm"],
  reine_hiver: ["Celle qui a gelé son cœur", "« Ne pleurez pas. Ici, les larmes gèlent avant de tomber. »", "Couronne de givre", "arm"],
  roi_noye: ["Le frère abandonné", "« Aldemar m'a laissé me noyer. À votre tour. »", "Sceptre de corail", "wpn"],
  coeur_montagne: ["Le cœur mis à nu", "« BOUM… BOUM… BOUM… »", "Cœur de magma", "tr"],
  roi_vide: ["Ce que la Couronne laisse des rois", "« Asseyez-vous. Le trône vous attendait. »", "Couronne vide", "arm"],
};
const UNIQ = Object.fromEntries(Object.entries(BOSS_INFO).map(([k, v]) => [k, { n: v[2], kind: v[3], boss: k }]));
// butin unique : 30 % à la première victoire contre ce gardien, 12 % ensuite ; qualité Mythique, +1 propriété
function uniqueDrop(bk, lvl, first) {
  const U = UNIQ[bk]; if (!U || !chance(first ? .3 : .12)) return null;
  const owned = typeof S !== "undefined" && S ? [...new Set(S.heroes.map(h => h.cls))] : [];
  const tier = clamp(TIER_LVL.filter(l => l <= lvl).length - 1, 1, 5);
  const it = U.kind === "tr" ? makeGear("tr", null, 1, 4) : makeGear(U.kind, owned.length ? pick(owned) : pick(CLASS_IDS), tier, 4);
  it.uniq = bk; if (U.kind !== "tr") { const k = pick(Object.keys(AFFIXES).filter(a => !it.aff.some(f => f.k === a) && !(it.kind === "wpn" && a === "prot"))); const A = AFFIXES[k]; let v = A.v[1] * (1 + (it.tier - 1) * .25) * 1.2; v = A.fmt === "pct" ? Math.round(v * 100) / 100 : Math.round(v); it.aff.push({ k, v }); }
  S.uniqs = S.uniqs || {}; S.uniqs[bk] = (S.uniqs[bk] || 0) + 1; return it;
}
// mode Hardi d'un chapitre déjà vaincu : gardien +50 % PV, +30 % dégâts, enragé dès le départ ; trophée doré
const HARD_BOSS = { hp: 1.5, dmg: 1.3 };
// dernières paroles d'un héros tombé (gravées au Mémorial)
const LAST_WORDS = { tank: ["Tenez… la ligne…", "Je n'ai pas reculé. Dites-leur.", "Le mur… tombe enfin."], soin: ["Je n'ai pas pu… tous les sauver.", "La lumière… est si froide…", "Priez pour moi. Moi, je n'ai plus le temps."], soutien: ["Chantez… à ma place…", "La dernière note… est pour vous."], dps: ["Encore un… je pouvais encore…", "Ce n'était pas… mon dernier coup…", "Vengez-moi. Proprement.", "Enfin… le silence."] };
function lastWords(h) { const r = CLASSES[h.cls] ? CLASSES[h.cls].role : "dps"; return pick(LAST_WORDS[{ tank: "tank", soin: "soin", soutien: "soutien" }[r] || "dps"]); }

// migration : pour une partie existante, les élites des monstres déjà vaincus au moins une fois comptent comme vaincues
function migrateElites() { if (!S || S.beatenElites) return; S.beatenElites = {}; for (const k in (S.seen && S.seen.monsters) || {}) if (MONSTERS[k] && MONSTERS[k].elite && S.seen.monsters[k] > 0) S.beatenElites[k] = 1; }
