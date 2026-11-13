// ── Noms : beaucoup plus de prénoms et surnoms dark fantasy ; légendes et Mythes nommés au hasard (une fois par partie),
// toujours accordés au sexe de la classe (celui de son illustration) ──
NAMES_M.push("Aldemar", "Baudouin", "Corbin", "Draven", "Enguerrand", "Faramond", "Galeran", "Gondemar", "Hadrien", "Ingram", "Jaufré", "Kaelen", "Léodegar", "Malachie", "Mordred", "Néhémie",
  "Orsin", "Pépin", "Quentin", "Ragnar", "Renaud", "Séverin", "Sigebert", "Thorvald", "Urbain", "Vauquelin", "Wilbrord", "Xavier", "Ysaric", "Zéphirin", "Achard", "Barthélemy", "Childéric",
  "Dreux", "Erwan", "Foulques", "Garnier", "Grimoald", "Hélias", "Ivain", "Jourdain", "Lambert", "Mainard", "Néron", "Odilon", "Raymbaud", "Sylvain", "Theobald", "Varin", "Vorlath");
NAMES_F.push("Albérade", "Anstrude", "Brunehaut", "Carcasse", "Dagna", "Elfride", "Ermessinde", "Fauve", "Garsende", "Gwenaëlle", "Hermine", "Ide", "Isaure", "Jacquette", "Kriemhild", "Lysande",
  "Malvina", "Morwenna", "Nimue", "Ombre", "Perrine", "Plectrude", "Quitterie", "Ragnhild", "Rixende", "Sélène", "Siglinde", "Theudelinde", "Ulfhilde", "Vesperine", "Wanda", "Yolande",
  "Zélie", "Arsinoé", "Berthe", "Cyrielle", "Domitille", "Esclarmonde", "Galiane", "Hermengarde", "Iolanthe", "Lucrèce", "Mélusine", "Nébule", "Ossiane", "Sabeline", "Thérèse", "Vivienne");
NAMES_F.splice(NAMES_F.indexOf("Carcasse"), 1); NAMES_F.splice(NAMES_F.indexOf("Ombre"), 1); // pas de prénoms qui prêtent à confusion
SURNAMES.push(["le Noir", "la Noire"], ["Fléau-des-Morts"], ["le Sanglant", "la Sanglante"], ["Porte-Deuil"], ["le Brûlé", "la Brûlée"], ["Sang-Froid"], ["le Juré", "la Jurée"], ["Corbeau-Blanc"],
  ["le Fossoyeur", "la Fossoyeuse"], ["Ronce-Noire"], ["l'Oublié", "l'Oubliée"], ["Mange-Cendres"], ["le Rouge", "la Rouge"], ["Croix-de-Fer"], ["le Sourd", "la Sourde"], ["Pleure-Sang"],
  ["le Parjure", "la Parjure"], ["Dent-de-Loup"], ["le Revenu", "la Revenue"], ["Brise-Lames"], ["l'Aveugle", "l'Aveugle"], ["Givrecœur"], ["le Dernier", "la Dernière"], ["Sans-Visage"]);

// titres et épithètes de légende, accordés
const LG_HONOR = { exorciste: ["Frère", "Sœur"], pretresse: ["Père", "Mère"], revenant: ["Ser", "Dame"], templier: ["Ser", "Dame"], pyromancien: ["Maître", "Maîtresse"], medecin_peste: ["Docteur", "Docteure"], necromancien: ["Maître", "Maîtresse"], hallebardier: ["Sergent", "Sergente"] };
const LG_EPI_PAIRS = [["le Briseur de Peste", "la Briseuse de Peste"], ["des Ronces"], ["de Saint-Morne"], ["le Noyé", "la Noyée"], ["Cendrelame"], ["l'Inhumé", "l'Inhumée"], ["de l'Aube"],
  ["Mange-Cendres"], ["Sans-Reflet"], ["le Calciné", "la Calcinée"], ["le Fossoyeur", "la Fossoyeuse"], ["Grave-Pierre"], ["du Trône Brisé"],
  ["l'Impitoyable"], ["Brise-Rois"], ["aux Cent Batailles"], ["le Veilleur", "la Veilleuse"], ["Cœur-de-Loup", "Cœur-de-Louve"], ["Porte-Aube"], ["l'Inflexible"], ["aux Yeux Gris"], ["le Revenu", "la Revenue"],
  ["Lame-du-Soir"], ["le Sans-Sommeil", "la Sans-Sommeil"], ["des Neuf Tombes"], ["Ronge-Ténèbres"], ["l'Écorché", "l'Écorchée"], ["Couronne-de-Givre"], ["le Dernier Debout", "la Dernière Debout"]];
const MYTH_TITLES = [["Premier Roi", "Première Reine"], ["l'Inextinguible"], ["l'Ombre du Trône"], ["aux Corbeaux"], ["Brise-Montagne"], ["Seigneur des Tombes", "Reine des Tombes"], ["Forgeur d'Orages", "Forgeuse d'Orages"],
  ["le Dernier Saint", "la Dernière Sainte"], ["Mangeur de Soleils", "Mangeuse de Soleils"], ["l'Éternel", "l'Éternelle"], ["Fléau des Couronnes"], ["qui Marchait sur l'Abîme"]];
const gPick = (pairs, fem, rng, used) => { let p, n = 0; do { p = rng.pick(pairs); } while (used && used.has(p[0]) && ++n < 40); if (used) used.add(p[0]); return fem && p[1] ? p[1] : p[0]; };
// récits accordés au sexe de la classe
const LG_TALES_G = [["On chante son nom dans les tavernes de trois royaumes."], ["Il a survécu à la chute de son ordre ; il en garde les clés.", "Elle a survécu à la chute de son ordre ; elle en garde les clés."],
  ["Les gardiens le reconnaissent et reculent d'un pas.", "Les gardiens la reconnaissent et reculent d'un pas."], ["Personne ne sait d'où vient sa voie ; tout le monde sait où elle mène."],
  ["Il a vu la Couronne de près, et n'a pas cédé.", "Elle a vu la Couronne de près, et n'a pas cédé."], ["Ses cicatrices racontent une guerre que nul n'a gagnée."], ["Les morts de l'Abîme murmurent son nom avec respect."],
  ["Il est revenu seul d'une expédition de quarante.", "Elle est revenue seule d'une expédition de quarante."], ["On dit qu'il a dîné à la table d'un gardien, et qu'il en est reparti.", "On dit qu'elle a dîné à la table d'un gardien, et qu'elle en est repartie."]];
// les quatre récits écrits pour un héros du mauvais sexe (corrigés selon la classe)
const LG_STORY_FIX = { garance: "Il a porté la couronne une nuit, le temps de la briser sur son genou.", my_vesper: "Il collectionne les malédictions comme d'autres les bijoux.",
  my_lucrece: "Il a entendu la confession d'un gardien secret, et lui a pardonné.", my_kael: "Elle a tué trois rois. Le quatrième l'a engagée." };
function lgUsed() { const u = new Set(); for (const v of Object.values((S && S.lgNames) || {})) { for (const p of LG_EPI_PAIRS.concat(MYTH_TITLES)) if (p.some(x => v.endsWith(" " + x))) u.add(p[0]); } return u; }
function lgGenName(l) {
  const fem = CLASS_FEMALE.has(l.cls), rng = mkRng(Math.floor(Math.random() * 2147483647)); // tiré au hasard une fois par partie (mémorisé dans S.lgNames)
  const taken = new Set(Object.values((S && S.lgNames) || {}).map(v => v.replace(/^(Frère|Sœur|Père|Mère|Ser|Dame|Maître|Maîtresse|Docteur|Docteure|Sergent|Sergente) /, "").split(" ")[0])), pool = (fem ? NAMES_F : NAMES_M).filter(n => !taken.has(n)), first = rng.pick(pool.length ? pool : (fem ? NAMES_F : NAMES_M)), H = LG_HONOR[l.cls], honor = H && rng.chance(.45) ? (fem ? H[1] : H[0]) + " " : "";
  const used = lgUsed(); if (l.ach) return `${first} ${gPick(MYTH_TITLES, fem, rng, used)}`; // Mythe
  return honor + first + " " + gPick(LG_EPI_PAIRS, fem, rng, used);
}
function lgName(l) { if (!l || l.wander) return l && l.name; S.lgNames = S.lgNames || {}; return S.lgNames[l.id] || (S.lgNames[l.id] = lgGenName(l)); }
function lgApply() { if (typeof S === "undefined" || !S) return; for (const l of LEGENDS.concat(LEGENDS_EVO, MYTHS)) { l.name = lgName(l); if (LG_STORY_FIX[l.id]) l.story = LG_STORY_FIX[l.id];
    if (l.evo && !l.ach && LEGENDS_EVO.includes(l)) { const fem = CLASS_FEMALE.has(l.cls), r = mkRng(hashStr(l.id)); l.story = CLASSES[l.cls].evos[l.evo].n + ". " + gPick(LG_TALES_G, fem, r); } } }
{ const lh0 = legendsHTML; legendsHTML = function () { lgApply(); return lh0.apply(this, arguments); }; }
{ const lb0 = legendById; legendById = id => { lgApply(); return lb0(id); }; }
{ const ah0 = ACT.legendHire; ACT.legendHire = id => { lgApply(); return ah0(id); }; }
// légende errante : nom et récit accordés
{ const wl0 = wanderLegend; wanderLegend = function () { const w = wl0.apply(this, arguments); if (!w) return w; const fem = CLASS_FEMALE.has(w.cls), r = mkRng(hashStr(w.id));
  w.name = r.pick(fem ? NAMES_F : NAMES_M) + " " + gPick(LG_EPI_PAIRS, fem, r); w.story = gPick(LG_TALES_G, fem, r) + " (Légende errante : partie à la fin de la semaine.)"; return w; }; }
// héros déjà recrutés : un nom du mauvais sexe (anciennes légendes Garance, Vesper, Lucrèce, Kael) est remplacé
function lgNoComma() { if (!S || !S.heroes || S.lgComma) return; S.lgComma = 1; const nc = n => n.replace(/\s*,\s*/g, " ");
  for (const h of S.heroes) if (h.name && h.name.includes(",")) h.name = nc(h.name); for (const k in S.lgNames || {}) S.lgNames[k] = nc(S.lgNames[k]); for (const g of S.graves || []) if (g.name) g.name = nc(g.name); }
function lgFixHeroes() { lgNoComma(); if (!S || !S.heroes || S.lgFix) return; S.lgFix = 1; const bad = ["garance", "my_vesper", "my_lucrece", "my_kael"];
  for (const h of S.heroes) if (h.legend && bad.includes(h.legend)) { const L = LEGENDS.concat(MYTHS).find(l => l.id === h.legend); if (L) { const old = h.name; h.name = lgName(L); h.female = CLASS_FEMALE.has(h.cls); if (old !== h.name) toast(`${esc(old)} s'appelle désormais <b>${esc(h.name)}</b> (nom accordé à son portrait).`); } } }
if (HASWIN) setInterval(() => { try { if (S && S.heroes) { lgFixHeroes(); } } catch (e) { } }, 3000);
