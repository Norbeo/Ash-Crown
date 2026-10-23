/* ═══════════════════════ Écran-titre et nouvelle partie ═══════════════════════ */
const GAME_URL = "https://norbeo.github.io/Ash-Crown/";
const PWA = { prompt: null,
  standalone: HASWIN && ((window.matchMedia && (matchMedia("(display-mode: standalone)").matches || matchMedia("(display-mode: fullscreen)").matches)) || navigator.standalone === true),
  framed: HASWIN && (() => { try { return window.top !== window.self; } catch (e) { return true; } })(),
  ios: HASWIN && (/iphone|ipad|ipod/i.test(navigator.userAgent || "") || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)),
  android: HASWIN && /android/i.test(navigator.userAgent || "") };
if (HASWIN) { addEventListener("beforeinstallprompt", e => { e.preventDefault(); PWA.prompt = e; if (UI.screen === "title" || UI.screen === "options") refresh(); }); addEventListener("appinstalled", () => { PWA.prompt = null; toast("Couronne de Cendres est installée !", "good"); }); }
SCREENS.title = {
  noHud: 1, noNav: 1,
  scene: () => backdrop("titre", { align: .6, after: (x, t) => { const w = SC.w, h = SC.h; glow(x, w / 2, h * .32, Math.min(w, h) * .45, "#ff5a1a", .12 + Math.sin(t * 1.3) * .04); } }),
  html: () => {
    const has = !!load();
    return `<div class="titlebox">
      <div class="logo">Couronne<br>de Cendres<small>LE DERNIER BASTION</small></div>
      <p class="lore" style="max-width:460px;margin:6px 0 14px">Un royaume maudit. Une couronne brisée. Des héros perdus, et vous pour les mener dans l'ombre.</p>
      ${has ? `<button class="btn main glow" data-a="continue">${ico("castle")}Continuer</button>` : ""}
      <button class="btn ${has ? "" : "main glow"}" data-a="newgame">${ico("plus")}Nouvelle partie</button>
      ${PWA.standalone ? "" : `<button class="btn ghost" data-a="install">${ico("install")}Installer l'appli</button>`}
      <p class="tiny dim" style="margin-top:10px">Jeu sauvegardé sur cet appareil · fonctionne hors connexion une fois installé</p>
    </div>`;
  },
  mount: () => { audioInit(); },
};
ACT.continue = () => { S = load(); if (!S) return; dailyCheck(); musicPlay("bastion"); const bank = idleBank(); if (S.run) go("map"); else go("bastion"); if (bank >= 10) toast(`${ico("furnace", "#ff9a3a")} La Fonderie a produit <b>${bank} or</b> en votre absence.`, "good"); };
ACT.newgame = () => { const go2 = () => { NG.step = 0; NG.hard = false; NG.pets = rollStarterPets(3); NG.pet = NG.pets[0]; NG.petRolls = NG_PET_ROLLS; NG.cls = rollStartParty(); NG.heroes = NG.cls.map(c => makeHero(c)); NG.rolls = NG_ROLLS; go("newgame"); musicPlay("titre"); }; if (load()) confirmBox("Une partie existe déjà sur cet appareil. Elle sera <b>effacée</b>.", go2, { yes: "Recommencer" }); else go2(); };
ACT.install = async () => {
  if (PWA.prompt) { PWA.prompt.prompt(); try { await PWA.prompt.userChoice; } catch (e) { } PWA.prompt = null; refresh(); return; }
  let how;
  if (PWA.framed) how = `<p>Ici, le jeu est affiché dans un aperçu : il ne peut pas s'installer depuis cette page.</p><p>Ouvrez le jeu sur son site, puis installez-le :</p><p style="text-align:center"><a class="btn main" href="${GAME_URL}" target="_blank" rel="noopener">${ico("map")}Ouvrir le jeu</a></p><p class="small dim" style="text-align:center">${GAME_URL}</p>`;
  else if (PWA.ios) how = `<ol><li>Ouvrez cette page dans <b>Safari</b>.</li><li>Touchez le bouton <b>Partager</b> (le carré avec une flèche vers le haut).</li><li>Choisissez <b>« Sur l'écran d'accueil »</b>, puis <b>Ajouter</b>.</li></ol>`;
  else if (PWA.android) how = `<ol><li>Ouvrez cette page dans <b>Chrome</b>.</li><li>Touchez le menu <b>⋮</b> en haut à droite.</li><li>Choisissez <b>« Installer l'application »</b> (ou « Ajouter à l'écran d'accueil »).</li></ol>`;
  else how = `<ol><li>Dans <b>Chrome</b> ou <b>Edge</b>, cliquez sur l'icône d'installation à droite de la barre d'adresse (un écran avec une flèche).</li><li>Ou menu <b>⋮</b> → <b>« Installer Couronne de Cendres »</b>.</li></ol>`;
  modal(`<h2>${ico("install", "#e8c878")} Installer le jeu</h2>${how}<p class="small dim">Une fois installé, le jeu s'ouvre en plein écran depuis l'écran d'accueil et fonctionne hors connexion. Votre sauvegarde reste sur l'appareil.</p>`);
};

const NG = { step: 0, pet: "loup", pets: [], petRolls: 0, hard: false, cls: [], heroes: [], rolls: 0 };
const NG_ROLLS = 3, NG_PET_ROLLS = 1;
const ngRollTag = n => `<span class="tag ${n ? "gold" : ""}">${ico("dice", n ? "#e8c878" : "#7a6a5a", 13)} ${n} relance${n > 1 ? "s" : ""}</span>`;
SCREENS.newgame = {
  noHud: 1, noNav: 1,
  scene: () => backdrop("titre", { dark: .35, align: .6 }),
  html: () => {
    if (NG.step === 0) return `<div style="min-height:100%;display:flex;align-items:center;justify-content:center;padding:20px" data-a="ngNext"><div class="storybox">${STORY.intro.map((l, i) => `<p style="animation:fade 1.2s ${i * 1.4}s both">${l}</p>`).join("")}<p class="tiny dim" style="animation:fade 1s 4.4s both;font-style:normal;margin-top:24px">Touchez pour continuer</p></div></div>`;
    if (NG.step === 1) {
      const pets = NG.pets;
      return `<div class="wrap"><h1 style="text-align:center;margin-top:10px">Votre premier compagnon</h1><p class="lore" style="text-align:center">Trois bêtes ont suivi vos traces jusqu'aux portes du Bastion. Une seule vous accompagnera : elle combattra à vos côtés, gagnera en puissance et pourra évoluer.</p>
      <div class="row" style="justify-content:center;gap:8px">${ngRollTag(NG.petRolls)}<button class="btn ghost sm" data-a="ngPetRoll" ${NG.petRolls ? "" : "disabled"}>${ico("dice")}Autres bêtes</button></div>
      <div class="grid ctr" style="--min:200px;margin-top:12px">${pets.map(k => { const P = PETS[k]; return `<div class="card ${NG.pet === k ? "sel" : ""}" data-a="ngPet" data-v="${k}" style="text-align:center">${canvasSlot("pet:" + k, 200, 150)}<h3>${P.n}</h3>${roleTag(P.role)}<p class="small dim">${P.d}</p><p class="tiny">${P.sk.map(s => "<b>" + s.n + "</b>").join(" · ")}</p><button class="btn ghost sm" data-a="ngPetInfo" data-v="${k}">${ico("info")}Compétences</button></div>`; }).join("")}</div>
      <div class="stickybar"><button class="btn main glow" data-a="ngNext">Choisir ${PETS[NG.pet].n}</button></div></div>`;
    }
    return `<div class="wrap"><h1 style="text-align:center;margin-top:10px">Votre compagnie</h1><p class="lore" style="text-align:center">Quatre âmes ont répondu à l'appel, au hasard des routes : un rempart, un soigneur et deux lames. Les autres viendront à la Taverne.</p>
      <div class="row" style="justify-content:center;gap:8px">${ngRollTag(NG.rolls)}<button class="btn ghost sm" data-a="ngRollAll" ${NG.rolls ? "" : "disabled"}>${ico("dice")}Tout relancer</button></div>
      <div class="grid ctr" style="--min:180px;margin-top:12px">${NG.heroes.map((h, i) => { const C = CLASSES[h.cls]; return `<div class="card" style="text-align:center">${canvasSlot("hero:" + i, 170, 212)}<h3>${esc(h.name)}</h3><div class="row" style="justify-content:center">${roleTag(C.role)}<span class="tag">${C.n}</span></div><p class="tiny lore" style="margin:4px 0">${C.lore}</p><p class="tiny dim">${h.traits.map(t => `<span class="${TRAITS[t].good ? "good" : "bad"}">${TRAITS[t].n}</span>`).join(" · ")}</p><div class="row" style="justify-content:center;gap:4px"><button class="btn ghost sm" data-a="ngInfo" data-v="${i}">${ico("info")}Détails</button><button class="btn ghost sm" data-a="ngReroll" data-v="${i}" ${NG.rolls ? "" : "disabled"}>${ico("dice")}Autre recrue</button></div></div>`; }).join("")}</div>
      <div class="panel" style="padding:12px;margin-top:14px"><label class="row" style="cursor:pointer"><input type="checkbox" id="ng-hard" ${NG.hard ? "checked" : ""}> <b>Mode Hardi</b> <span class="small dim">— les héros tombés meurent pour de bon. Pour les vétérans.</span></label></div>
      <div class="stickybar"><button class="btn ghost" data-a="ngBack">Retour</button><button class="btn main glow" data-a="ngStart">${ico("castle")}Entrer au Bastion</button></div></div>`;
  },
  mount: () => {
    fillCanvases($("#view"), (c, id) => { const [k, v] = id.split(":"); if (k === "pet") paintPet(c, v, 0); if (k === "hero") paintHero(c, NG.heroes[+v], true); });
    const hb = $("#ng-hard"); if (hb) hb.onchange = () => NG.hard = hb.checked;
  },
};
ACT.ngNext = () => { NG.step++; refresh(); };
ACT.ngBack = () => { NG.step = 1; refresh(); };
ACT.ngPet = v => { NG.pet = v; refresh(); };
ACT.ngReroll = i => { if (!NG.rolls) return; i = +i; NG.rolls--; const c = rollStartClass(i, NG.cls.filter((_, j) => j !== i).concat(NG.cls[i])); NG.cls[i] = c; NG.heroes[i] = makeHero(c); sfx("coin"); refresh(); };
ACT.ngInfo = i => heroSheet(NG.heroes[+i], `<div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn main" data-a="closeModal">Fermer</button></div>`);
ACT.ngPetInfo = (k, el, e) => { e && e.stopPropagation(); petSheet(k, `<div class="row" style="justify-content:flex-end;gap:6px;margin-top:12px"><button class="btn ghost" data-a="closeModal">Fermer</button><button class="btn main" data-a="ngPetPick" data-v="${k}">Choisir ${PETS[k].n}</button></div>`); };
ACT.ngPetPick = k => { NG.pet = k; closeModal(); refresh(); };
ACT.ngRollAll = () => { if (!NG.rolls) return; NG.rolls--; NG.cls = rollStartParty(); NG.heroes = NG.cls.map(c => makeHero(c)); sfx("coin"); refresh(); };
ACT.ngPetRoll = () => { if (!NG.petRolls) return; NG.petRolls--; const old = NG.pets; let pool = PET_IDS.filter(p => PETS[p].starter && !old.includes(p)); RNG.shuffle(pool); NG.pets = pool.concat(RNG.shuffle(old.slice())).slice(0, 3); NG.pet = NG.pets[0]; sfx("coin"); refresh(); };
ACT.ngStart = () => {
  newGame(NG.pet, { hardcore: NG.hard, classes: NG.cls, heroes: NG.heroes });
  save(); sfx("bell"); musicPlay("bastion");
  go("bastion");
  setTimeout(() => modal(`<h2>${ico("castle")} Le Dernier Bastion</h2><p class="lore">Les murs tiennent encore. Pour combien de temps ?</p><p>Votre objectif : franchir la <b>Porte</b> pour mener des expéditions, rapporter or et équipement, puis faire grandir le Bastion.</p><ul class="small"><li><b>Combat</b> : chaque héros agit selon sa vitesse. Sa <b>position</b> (rangs 1 à 4) décide de ses compétences.</li><li>Les ennemis montrent leur <b>intention</b> au-dessus de leur tête : anticipez !</li><li>Un héros à 0 PV est <b>à l'agonie</b> : soignez-le vite.</li><li>Au niveau ${EVO_LVL}, chaque héros peut <b>évoluer</b> vers l'une de ses deux voies.</li></ul><div class="row" style="justify-content:flex-end"><button class="btn main" data-a="closeModal">Compris</button></div>`), 500);
};
