// 20 nov. (soir) : interface des événements de combat, du défi en direct, des cicatrices et des rivaux
function cevtShow(B, E) {
  if (!E || UI.screen !== "combat") return; const old = $("#cevt"); if (old) old.remove();
  const d = document.createElement("div"); d.id = "cevt"; d.className = "cevt";
  d.innerHTML = `<div class="cevt-t">${ico("star", "#ffd27a", 16)} ${E.t}</div><div class="cevt-c">${E.c.map((c, i) => `<button class="btn ${i ? "" : "gold"}" data-i="${i}"><b>${c.n}</b><small>${c.d}</small></button>`).join("")}</div><div class="cevt-k">Choix automatique dans <span>10</span> s</div>`;
  document.body.appendChild(d);
  let left = 10; const pick = i => { if (!d.isConnected) return; clearInterval(tm); d.remove(); if (CB.B !== B || B.over) return; try { E.c[i].f(B); } catch (e) { console.error(e); } toast(`${E.t} — ${E.c[i].n} : ${E.c[i].d}`); try { sfx("crit"); } catch (e) { } };
  d.querySelectorAll("button").forEach(b => b.addEventListener("click", ev => { ev.stopPropagation(); pick(+b.dataset.i); }));
  const tm = setInterval(() => { if (!d.isConnected || CB.B !== B || B.over) { clearInterval(tm); d.remove(); return; } left--; const s = d.querySelector(".cevt-k span"); if (s) s.textContent = left; if (left <= 0) pick(0); }, 1000);
}
// défi du combat, visible en permanence, avec son état
function chalBadge() { const B = CB.B; let el = $("#cbchal"); if (UI.screen !== "combat" || !B || !B.chal || !CHALLENGES[B.chal]) { if (el) el.remove(); return; }
  const C = CHALLENGES[B.chal]; let st = "…";
  try { if (B.chal === "fast") st = B.round <= 8 ? "en cours" : "raté"; else if (B.chal === "blitz") st = B.round <= 4 ? "en cours" : "raté"; else if (B.chal === "nopot") st = B.potUsed ? "raté" : "tenu"; else if (B.chal === "clean") st = B.agonies ? "raté" : "tenu"; else if (B.chal === "noult") st = B.ultUsed || B.ults ? "raté" : "tenu"; else if (B.chal === "full") st = C.ok(B) ? "tenu" : "en danger"; else if (B.chal === "allhit") { const T = B.tally && B.tally.dmg || {}; st = B.heroes.filter(h => (T[h.hid] || 0) > 0).length + " / " + B.heroes.length; } } catch (e) { }
  if (!el) { el = document.createElement("div"); el.id = "cbchal"; document.body.appendChild(el); }
  el.className = "cbchal " + (st === "raté" ? "ko" : "");
  el.innerHTML = `${ico("trophy", st === "raté" ? "#9a8c7a" : "#e8c878", 14)} <b>${C.n}</b> <span>${C.d}</span> <i>${st}</i>`; }
if (typeof window !== "undefined") setInterval(() => { try { chalBadge(); } catch (e) { } }, 700);
// cicatrices et rivaux annoncés
{ const sb = stressAfterBattle; stressAfterBattle = function (run, B) { const r = sb.apply(this, arguments); try { for (const z of (B && B.newScars) || []) toast(`✠ ${esc(z.name)} garde une cicatrice : <b>${z.n}</b> (${z.d})`); } catch (e) { } return r; }; }
{ const fh = fallHero; fallHero = function (B) { const n0 = S.nemesis; const r = fh.apply(this, arguments); try { if (S.nemesis && S.nemesis !== n0) setTimeout(() => toast(`☠ <b>${esc(S.nemesis.n)}</b> a tué ${esc(S.nemesis.victim)}. Il rôde maintenant dans cette région…`), 900); } catch (e) { } return r; }; }
