/* Déblocage progressif (12 nov.) : les systèmes avancés n'apparaissent qu'au moment où ils servent.
   Chaque « porte » cache les boutons dont l'action (data-a, ou data-a:data-v) lui appartient, tant que sa condition n'est pas remplie.
   À l'ouverture, une annonce « Nouveau » explique la fonction (une seule fois, mémorisée dans S.unl).
   Une partie déjà avancée voit tout d'emblée (les conditions portent sur la progression réelle). Option « Tout afficher » dans les réglages. */
function ulRuns() { return (S && S.stats && S.stats.runs) || 0; }
function ulCh() { try { return REGIONS.filter(r => r.id !== "abime" && S.prog[r.id] && S.prog[r.id].clears > 0).length; } catch (e) { return 0; } }
function ulAdv() { try { return advLevel(); } catch (e) { return 1; } }
const GATES = [
  { k: "panel", n: "Tableau du Bastion", d: "Défis du jour, expédition du jour et défi de la semaine.", ok: () => ulRuns() >= 1, acts: ["hubPanel", "dailyRun"] },
  { k: "upgrade", n: "Améliorer l'équipement", d: "À la Forge, renforcez une arme ou une armure contre de l'or (+1, +2…).", ok: () => ulRuns() >= 2, acts: ["bldTab:forge:up"] },
  { k: "carnet", n: "Le Carnet", d: "Connexion quotidienne, passe de saison, chasses et album : des récompenses à récupérer d'un toucher.", ok: () => ulRuns() >= 2, acts: ["carnet"] },
  { k: "quick", n: "Départ rapide", d: "Relancez une expédition avec la même compagnie en un toucher.", ok: () => ulRuns() >= 2, acts: ["quickStart"] },
  { k: "expeopts", n: "Options d'expédition", d: "Serments, nuit, difficulté : de quoi corser une expédition contre plus de butin.", ok: () => ulRuns() >= 2, acts: ["expePane:opts"] },
  { k: "merchant", n: "Le marchand ambulant", d: "Chaque jour, un marchand passe au Bastion : achat et revente d'objets.", ok: () => ulRuns() >= 3, acts: ["merchant"] },
  { k: "quests", n: "Contrats & quêtes", d: "À la Taverne : contrats de chasse et quêtes qui révèlent des traits uniques.", ok: () => ulCh() >= 1, acts: ["bldTab:taverne:quest"] },
  { k: "chest", n: "Le coffre du gardien", d: "Chaque gardien vaincu remplit un coffre qui s'ouvre au bout de quelques heures.", ok: () => ulCh() >= 1, acts: ["chestOpen"] },
  { k: "bounty", n: "La prime du jour", d: "Une élite désignée chaque jour : abattez-la pour une forte récompense.", ok: () => ulCh() >= 1, acts: ["bounty"] },
  { k: "legends", n: "Légendes de la Taverne", d: "Des héros légendaires, chacun avec un don unique, à recruter à prix d'or.", ok: () => ulCh() >= 2, acts: ["bldTab:taverne:leg"] },
  { k: "atelier", n: "L'Atelier de la Forge", d: "Bibelots, panoplies et gemmes : fusionnez, gravez, sertissez.", ok: () => ulCh() >= 2, acts: ["forgeAtelier", "bldTab:forge:tr", "bldTab:forge:sets", "bldTab:forge:gems"] },
  { k: "market", n: "Marché des éclats", d: "À la Fonderie, échangez votre or contre des éclats, de la cendre ou des gemmes.", ok: () => ulCh() >= 2, acts: ["market:shard", "market:cendre", "market:gem"] },
  { k: "special", n: "Expéditions spéciales", d: "Raids, épreuves de classe, arènes et expéditions de panoplie.", ok: () => ulCh() >= 3, acts: ["expePane:special"] },
  { k: "codexmore", n: "Archives complètes", d: "Variantes, uniques, errants et trouvailles rejoignent les Archives.", ok: () => ulCh() >= 3, acts: ["codexTab:variantes", "codexTab:uniques", "codexTab:errants", "codexTab:finds"] },
  { k: "btree", n: "Arbre du Bastion", d: "À la Salle des maîtres : un point par niveau d'aventure, des bonus permanents pour toute la compagnie.", ok: () => ulAdv() >= 4, acts: ["btreeAdd", "btreeReset"] },
];
const GATE_BY = {}; for (const G of GATES) for (const a of G.acts) GATE_BY[a] = G;
function gateOpen(G) { if (!S) return true; if (S.opts && S.opts.showAll) return true; try { return !!(S.unl && S.unl[G.k]) || G.ok(); } catch (e) { return true; } }
function gateOf(el) { const a = el.dataset.a; if (!a) return null; return GATE_BY[a + ":" + (el.dataset.v || "")] || GATE_BY[a] || null; }
function gateScan(root) {
  if (!root || !root.querySelectorAll || !S) return;
  for (const el of root.querySelectorAll("[data-a]")) { const G = gateOf(el); if (!G) continue; const open = gateOpen(G); const tgt = (G.up && el.closest(G.up)) || el; if (!open) { tgt.style.display = "none"; el.dataset.gated = 1; } else if (el.dataset.gated) { tgt.style.display = ""; delete el.dataset.gated; } }
}
// annonces : vérifiées au retour au Bastion (et une fois au chargement : une partie avancée débloque tout sans bruit)
function gateCheck(silent) {
  if (!S) return; S.unl = S.unl || {};
  const fresh = [];
  for (const G of GATES) { if (S.unl[G.k]) continue; let ok = false; try { ok = G.ok(); } catch (e) { } if (ok) { S.unl[G.k] = 1; fresh.push(G); } }
  if (!S.unlInit) { S.unlInit = 1; return; } // première fois : tout ce qui est déjà acquis l'est en silence
  if (silent || !fresh.length) return;
  if (fresh.length > 3) { const rest = fresh.splice(3); setTimeout(() => { try { toast(`<b class="gold">✦ Et aussi :</b> <span class="small">${rest.map(G => G.n).join(", ")}</span>`, "good"); } catch (e) { } }, 600 + 3 * 1700); }
  fresh.forEach((G, i) => setTimeout(() => { try { toast(`<b class="gold">✦ Nouveau : ${G.n}</b><br><span class="small">${G.d}</span>`, "good"); } catch (e) { } }, 600 + i * 1700));
  try { save(); } catch (e) { }
}
{ const g0 = go; go = function (scr) { const r = g0.apply(this, arguments); try { if (scr === "bastion") gateCheck(); } catch (e) { } return r; }; }
if (typeof document !== "undefined" && typeof MutationObserver !== "undefined") {
  let pend = 0;
  const run = () => { pend = 0; for (const id of ["view", "modal", "hud"]) gateScan(document.getElementById(id)); };
  const mo = new MutationObserver(() => { if (!pend) { pend = 1; requestAnimationFrame(run); } });
  const start = () => { for (const id of ["view", "modal", "hud"]) { const n = document.getElementById(id); if (n) mo.observe(n, { childList: true, subtree: true }); } run(); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else setTimeout(start, 0);
}
