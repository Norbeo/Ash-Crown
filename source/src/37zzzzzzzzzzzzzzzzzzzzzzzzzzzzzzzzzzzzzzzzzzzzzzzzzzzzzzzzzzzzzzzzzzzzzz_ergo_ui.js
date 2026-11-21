// Ergonomie (21 nov.) : Forge en 3 onglets, Carnet en 3 groupes, bâtiments débloqués pas à pas, défi sans doublon, appui long sur les compétences

// 1 · Forge : Forger / Inventaire / Améliorer — l'amélioration regroupe Équipement, Bibelots, Panoplies, Gemmes
{ const ob = openBuilding; openBuilding = function (k, tab) { const r = ob.apply(this, arguments);
  if (k === "forge") try { const bar = [...document.querySelectorAll("#modal .tabs")].find(t => t.querySelector('[data-v="forge:craft"]')); if (bar) {
    bar.querySelectorAll(".fatl").forEach(b => b.remove()); document.querySelectorAll("#modal .fsub").forEach(b => b.remove());
    for (const v of ["tr", "sets", "gems"]) bar.querySelectorAll(`[data-v="forge:${v}"]`).forEach(b => b.remove());
    const cur = tab || (typeof UI.bldTab === "string" ? UI.bldTab : UI.bldTab && UI.bldTab.forge) || "craft", grp = ["up", "tr", "sets", "gems"], upB = bar.querySelector('[data-v="forge:up"]');
    if (upB) { upB.classList.toggle("on", grp.includes(cur)); upB.dataset.v = "forge:" + (grp.includes(cur) ? cur : "up"); upB.innerHTML = `${ico("up")}Améliorer`; }
    if (grp.includes(cur)) { const sub = document.createElement("div"); sub.className = "tabs fsub";
      const ntr = S.inv.filter(it => it.kind === "tr").length, ng = Object.values(S.gems || {}).reduce((x, y) => x + y, 0);
      sub.innerHTML = [["up", "up", "Équipement"], ["tr", "ring", `Bibelots (${ntr})`], ["sets", "link", "Panoplies"], ["gems", "gem", `Gemmes (${ng})`]].map(([v, ic, n]) => `<button class="btn sm ${cur === v ? "on" : ""}" data-a="bldTab" data-v="forge:${v}">${ico(ic)}${n}</button>`).join("");
      bar.after(sub); try { gateScan(sub); } catch (e) { } }
  } } catch (e) { }
  return r; }; }

// 2 · Carnet : 3 groupes (Chaque jour · Progression · Collections), sous-onglets du groupe ouvert
const CARNET_GROUPS = [["day", "coin", "Chaque jour", ["login", "orders", "hunt"]], ["prog", "star", "Progression", ["pass", "stars", "rec"]], ["coll", "book", "Collections", ["coll"]]];
{ const c0 = ACT.carnet; ACT.carnet = function (tab) { const r = c0.apply(this, arguments);
  try { const bar = [...document.querySelectorAll("#modal .tabs")].find(t => t.querySelector('[data-a="carnet"]')); if (bar) {
    const cur = UI.carnetTab || "login", G = CARNET_GROUPS.find(g => g[3].includes(cur)) || CARNET_GROUPS[0], btns = {}; bar.querySelectorAll('[data-a="carnet"]').forEach(b => btns[b.dataset.v] = b);
    const main = document.createElement("div"); main.className = "tabs"; main.innerHTML = CARNET_GROUPS.map(g => `<button class="btn sm ${g === G ? "on" : ""}" data-a="carnet" data-v="${g[3][0]}">${ico(g[1])}${g[2]}</button>`).join("");
    bar.before(main); bar.innerHTML = ""; bar.classList.add("fsub"); if (G[3].length > 1) G[3].forEach(k => btns[k] && bar.appendChild(btns[k])); else bar.remove();
  } } catch (e) { }
  return r; }; }

// 5 · Bâtiments débloqués au fil des premières expéditions (Taverne, Forge et la Porte dès le début)
if (typeof GATES !== "undefined") {
  const BLD_GATES = [
    { k: "b_chapelle", n: "La Chapelle", d: "Soignez vos blessés, apaisez le stress et levez les malédictions.", ok: () => ulRuns() >= 1, acts: ["bld:chapelle"], up: ".hot" },
    { k: "b_menagerie", n: "La Ménagerie", d: "Adoptez, entraînez et faites évoluer vos compagnons.", ok: () => ulRuns() >= 2, acts: ["bld:menagerie"], up: ".hot" },
    { k: "b_academie", n: "La Salle des maîtres", d: "Faites monter le rang de vos compétences et l'arbre du Bastion.", ok: () => ulRuns() >= 3, acts: ["bld:academie"], up: ".hot" },
    { k: "b_fonderie", n: "La Fonderie d'âmes", d: "Elle produit de l'or même quand vous n'êtes pas là.", ok: () => ulRuns() >= 4, acts: ["bld:fonderie"], up: ".hot" }];
  for (const G of BLD_GATES) { GATES.push(G); for (const a of G.acts) GATE_BY[a] = G; }
}

// 6 · Défi de combat : seulement le badge (plus d'annonce en double), avec un éclat à son apparition
{ const t0 = toast; toast = function (html, kind) { if (typeof html === "string" && /Défi <b>/.test(html) && UI.screen === "combat") { setTimeout(() => { const b = document.getElementById("cbchal"); if (b) { b.classList.remove("cbnew"); void b.offsetWidth; b.classList.add("cbnew"); } }, 50);
    html = html.split(/<br\s*\/?>|\n/).filter(l => !/Défi <b>/.test(l)).join("<br>"); if (!html.replace(/<[^>]*>/g, "").trim()) return; }
  return t0.call(this, html, kind); }; }

// 7 · Appui long sur une compétence (combat) : description complète, sans la lancer
if (typeof document !== "undefined") { let T = null;
  document.addEventListener("pointerdown", e => { const b = e.target.closest && e.target.closest("#cb-skills .sk[data-a=cbSk]"); clearTimeout(T); if (!b) return;
    T = setTimeout(() => { try { const u = CB.actor, id = b.dataset.v, sk = id === "ult" ? u.ult : u.skills.find(s => s.id === id); if (!sk) return; CB.descOpen = true; selectSkill(sk); buzz && buzz(15); } catch (er) { } }, 480); });
  ["pointerup", "pointercancel", "pointermove"].forEach(ev => document.addEventListener(ev, e => { if (ev !== "pointermove" || Math.abs(e.movementX) + Math.abs(e.movementY) > 6) clearTimeout(T); }));
}
