/* Veillée au feu de camp (façon Darkest Dungeon, 12 nov.) : après le choix du groupe, 4 points de veillée à répartir
   entre les compétences de camp de chaque héros (selon son rôle) : soins, apaisement, préparation du prochain combat.
   Les héros liés (amis ou rivaux) échangent quelques mots au coin du feu. */
const CAMP_PTS = 4;
const CAMP_SK = {
  tank: [{ k: "garde", n: "Monter la garde", c: 2, d: "Tout le groupe : +8 % de protection au prochain combat." },
         { k: "bouclier", n: "Couvrir un allié", c: 1, d: "Le héros le plus blessé : +12 % de protection au prochain combat." }],
  soin: [{ k: "panser", n: "Panser les plaies", c: 2, d: "Soigne le héros le plus blessé de 35 % de ses PV." },
         { k: "priere", n: "Prière du soir", c: 1, d: "−20 stress pour le héros le plus éprouvé." }],
  soutien: [{ k: "recits", n: "Récits du feu", c: 2, d: "Tout le groupe : −15 stress." },
            { k: "chant", n: "Chant de marche", c: 1, d: "Tout le groupe : +3 vitesse au prochain combat." }],
  dps: [{ k: "affuter", n: "Affûter les lames", c: 2, d: "Ce héros : +18 % de dégâts au prochain combat." },
        { k: "reperer", n: "Repérer les lieux", c: 1, d: "+15 lueur et +6 % de critique pour ce héros au prochain combat." }],
};
const CAMP_TALK = {
  ami: [["{a} tend sa gourde à {b} sans un mot.", "{b} : « Si je tombe demain, ne fais pas de bêtise. »", "{a} : « Trop tard pour ça. »"],
        ["{a} et {b} rient d'un vieux souvenir.", "{b} : « Tu te rappelles le pont ? »", "{a} : « J'essaie encore d'oublier. »"],
        ["{b} veille pendant que {a} dort.", "{a}, à demi éveillé : « Réveille-moi à mon tour. »", "{b} : « Dors. Je tiens. »"]],
  rival: [["{a} fixe {b} par-dessus les flammes.", "{a} : « Demain, j'en abattrai plus que toi. »", "{b} : « Compte-les bien. Ce sera vite fait. »"],
          ["{b} critique la façon dont {a} tient son arme.", "{a} : « Viens me montrer, alors. »", "Le feu crépite. Personne ne bouge."],
          ["{a} s'assoit le plus loin possible de {b}.", "{b} : « Tu as peur que je morde ? »", "{a} : « J'ai peur de te rendre la pareille. »"]],
};
function campBuffs(run) { return run.campBuff || (run.campBuff = {}); }
function campAlive() { const run = S.run; return runParty().filter(h => !run.fallen.includes(h.id)); }
function campMostHurt() { const rh = relicHooks(S.run); let best = null, bp = 2; for (const h of campAlive()) { const mx = heroStats(h, rh).hp, hp = h.hp == null ? mx : h.hp, p = hp / mx; if (p < bp) { bp = p; best = h; } } return best; }
function campDo(h, sk) {
  const run = S.run, B = campBuffs(run), add = (id, k, v) => { const o = B[id] || (B[id] = {}); o[k] = (o[k] || 0) + v; };
  const all = campAlive();
  switch (sk.k) {
    case "garde": all.forEach(x => add(x.id, "prot", .08)); return "Le groupe dormira à l'abri.";
    case "bouclier": { const t = campMostHurt() || h; add(t.id, "prot", .12); return `${t.name.split(" ")[0]} sera couvert.`; }
    case "panser": { const t = campMostHurt(); if (!t) return "Personne à soigner."; const mx = heroStats(t, relicHooks(run)).hp; t.hp = Math.min(mx, Math.round((t.hp == null ? mx : t.hp) + mx * .35)); return `${t.name.split(" ")[0]} est soigné.`; }
    case "priere": { const t = all.slice().sort((a, b) => (b.stress || 0) - (a.stress || 0))[0]; if (t) t.stress = Math.max(0, (t.stress || 0) - 20); return t ? `${t.name.split(" ")[0]} retrouve un peu de paix.` : ""; }
    case "recits": all.forEach(x => x.stress = Math.max(0, (x.stress || 0) - 15)); return "Les histoires apaisent les cœurs.";
    case "chant": all.forEach(x => add(x.id, "spd", 3)); return "La compagnie repartira d'un bon pas.";
    case "affuter": add(h.id, "dmg", .18); return `${h.name.split(" ")[0]} affûte sa lame.`;
    case "reperer": run.light = clamp((run.light || 0) + 15, 0, 100); add(h.id, "crit", 6); return `${h.name.split(" ")[0]} repère les lieux.`;
  }
  return "";
}
function campTalk() {
  const p = campAlive(); if (p.length < 2 || typeof bondOf !== "function") return "";
  for (let i = 0; i < p.length; i++) for (let j = i + 1; j < p.length; j++) { const b = bondOf(p[i].id, p[j].id); if (!b) continue;
    const L = pick(CAMP_TALK[b.t] || []); if (!L) continue; const a = p[i].name.split(" ")[0], c = p[j].name.split(" ")[0];
    return `<div class="panel camptalk"><div class="tiny gold">${b.t === "ami" ? "Amis" : "Rivaux"} · au coin du feu</div>${L.map(l => `<p class="small lore" style="margin:3px 0">${esc(l.replace(/\{a\}/g, a).replace(/\{b\}/g, c))}</p>`).join("")}</div>`; }
  return "";
}
function vigilHTML() {
  const V = UI.vigil, used = V.used;
  const rows = campAlive().map(h => { const C = CLASSES[h.cls], L = CAMP_SK[C.role] || [];
    return `<div class="card vigrow" style="cursor:default"><div class="row" style="gap:8px;flex-wrap:nowrap">${canvasSlot("h:" + h.id, 52, 58)}<div style="flex:1;min-width:0"><b class="small">${esc(h.name)}</b> <span class="tiny dim">${C.n}</span>
      ${L.map(sk => { const done = used[h.id + ":" + sk.k], can = !done && !used[h.id] && V.pts >= sk.c; return `<button class="btn sm ${can ? "" : "off"} vigbtn" data-a="vigil" data-v="${h.id}|${sk.k}" title="${sk.d}"><b>${sk.n}</b> <span class="tag">${"●".repeat(sk.c)}</span><span class="tiny dim vigd">${sk.d}</span></button>`; }).join("")}</div></div></div>`; }).join("");
  return `<h2>${ico("camp", "#ff9a3a")} Veillée</h2><p class="small">Points de veillée : <b class="gold">${"●".repeat(V.pts)}${"○".repeat(Math.max(0, CAMP_PTS - V.pts))}</b> · une compétence par héros.</p>
    ${V.talk || ""}${V.log.length ? `<div class="tiny good" style="margin:4px 0">${V.log.map(esc).join(" · ")}</div>` : ""}
    <div class="col" style="gap:6px">${rows}</div><div class="row" style="margin-top:10px;justify-content:flex-end"><button class="btn main" data-a="vigilEnd">${ico("camp")}Éteindre le feu</button></div>`;
}
function vigilOpen() { UI.vigil = { pts: CAMP_PTS, used: {}, log: [], talk: campTalk() }; vigilShow(); }
function vigilShow() { modal(vigilHTML(), { close: false, mount: m => fillCanvases(m, (c, id) => paintHero(c, heroById(id.split(":")[1]))) }); }
ACT.vigil = v => { const V = UI.vigil; if (!V || !S.run) return; const [id, k] = String(v).split("|"), h = heroById(id); if (!h || V.used[id]) return;
  const sk = (CAMP_SK[CLASSES[h.cls].role] || []).find(s => s.k === k); if (!sk || V.pts < sk.c) return;
  V.pts -= sk.c; V.used[id] = 1; V.used[id + ":" + k] = 1; const msg = campDo(h, sk); if (msg) V.log.push(msg); try { sfx("buff"); } catch (e) { } save(); vigilShow(); };
ACT.vigilEnd = () => { UI.vigil = null; save(); closeModal(); refresh(); };
{ const c0 = ACT.camp; ACT.camp = function (k) { const r = c0.apply(this, arguments); try { if (S.run && campAlive().length) setTimeout(vigilOpen, 350); } catch (e) { } return r; }; }
// bonus de veillée appliqués au prochain combat, puis effacés
{ const nb = newBattle; newBattle = function () { const B = nb.apply(this, arguments);
    try { const run = typeof S !== "undefined" && S && S.run, cb = run && run.campBuff; if (cb && B && B.heroes) { for (const u of B.heroes) { const o = cb[u.hid]; if (!o) continue;
        if (o.prot) u.prot = clamp(u.prot + o.prot, 0, .85); if (o.spd) u.spd += o.spd; if (o.crit) u.crit += o.crit; if (o.dmg) u.bondDmg = (u.bondDmg || 0) + o.dmg; u.camp = 1; }
      run.campBuff = null; } } catch (e) { }
    return B; }; }
// jauge du rituel sous la barre du gardien
{ const bt = bossBarTick; bossBarTick = function () { const r = bt.apply(this, arguments);
    try { const el = $("#cb-boss"), R = CB.B && CB.B.rit; if (!el) return r; let g = el.querySelector(".ritg");
      if (!R) { if (g) g.remove(); return r; }
      if (!g) { g = document.createElement("div"); g.className = "ritg"; el.appendChild(g); }
      const p = Math.min(100, 100 * R.dealt / R.need), k = R.t + ":" + Math.round(p); if (g.dataset.k !== k) { g.dataset.k = k; g.innerHTML = `<span>⚠ ${esc(R.name)} ${R.t > 0 ? `dans ${R.t} tour${R.t > 1 ? "s" : ""}` : "imminent"}</span><div class="ritbar"><i style="width:${p}%"></i></div><span class="tiny">${fmt(Math.round(R.dealt))} / ${fmt(R.need)}</span>`; }
    } catch (e) { }
    return r; }; }
// mode Hardi en cours de partie (sans retour)
ACT.goHardcore = () => confirmBox("Passer en mode <b>Hardi</b> : un héros tombé en expédition meurt pour de bon et rejoint le Mémorial. <b>Impossible de revenir en arrière.</b>", () => { S.opts.hardcore = true; save(); toast("Mode Hardi activé. Que la lumière vous garde.", "bad"); refresh(); }, { yes: "Passer en Hardi" });
