// ── Vraie roue de la Taverne : la roue tourne, ralentit et s'arrête sur la récompense ──
const WHEEL_UI = [
  { s: "Bourse", c: "#4a2a18", t: "#f0d090" }, { s: "Éclats", c: "#2a1e30", t: "#e2ccff" }, { s: "Tomes", c: "#3a2614", t: "#bff0ea" },
  { s: "Essence", c: "#152a2a", t: "#8fe0d8" }, { s: "Gemme", c: "#3a1418", t: "#ff9a8a" }, { s: "Légendaire", c: "#4a3008", t: "#ffb848" },
  { s: "Trésor", c: "#40300c", t: "#ffd870" }, { s: "Mythique", c: "#3a0c22", t: "#ff7ac0" }, { s: "Céleste", c: "#0c2440", t: "#9ad8ff" }];
function wheelSVG() {
  const n = WHEEL.length, seg = 360 / n, C = 150;
  let g = "";
  for (let i = 0; i < n; i++) {
    const u = WHEEL_UI[i] || { s: WHEEL[i].n, t: "#e8d0a0" }, am = i * seg + seg / 2, big = u.s.length > 9;
    g += `<text transform="rotate(${am} ${C} ${C}) translate(${C} ${C - 114}) rotate(90)" fill="${u.t}" font-family="var(--f-head, Cinzel), serif" font-size="${big ? 11 : 13.5}" font-weight="700" dominant-baseline="middle" text-anchor="start" style="paint-order:stroke;stroke:#0b0604;stroke-width:3.2px;stroke-linejoin:round">${u.s}</text>`;
  }
  return `<div class="whl"><div class="whl-ptr"><i></i></div><div class="whl-rot" id="whl-rot"><img src="assets/bg_wheel.webp${window.ART_V && window.ART_V.bg_wheel ? "?v=" + window.ART_V.bg_wheel : ""}" alt="" draggable="false"><svg viewBox="0 0 300 300">${g}</svg></div></div>`;
}
function wheelOpen() {
  const ok = wheelReady();
  modal(`<h2>${ico("dice", "#ffb848")} Roue de la Taverne</h2>${wheelSVG()}<div id="whl-out" class="small" style="text-align:center;min-height:1.6em;margin:6px 0">${ok ? "Un tirage gratuit par jour. Que la fortune vous sourie." : "La roue a déjà tourné aujourd'hui. Revenez demain."}</div><div class="row" style="justify-content:center"><button class="btn ${ok ? "gold" : "ghost off"}" id="whl-go" ${ok ? "" : "disabled"}>${ok ? "Lancer la roue" : "Demain"}</button></div>`, { mount: m => { const b = m.querySelector("#whl-go"); if (b && ok) b.onclick = () => wheelGo(); } });
}
function wheelGo() {
  if (UI._whlSpin || !wheelReady()) return; UI._whlSpin = 1;
  const R = wheelSpin(); save(); renderHud();
  const n = WHEEL.length, seg = 360 / n, jit = (rnd() - .5) * seg * .7, turns = 5 + Math.floor(rnd() * 3);
  const end = turns * 360 + (360 - (R.idx * seg + seg / 2)) + jit, dur = S.opts.quick || S.opts.fast ? 2600 : 5200;
  const btn = $("#whl-go"); if (btn) { btn.disabled = true; btn.classList.add("off"); btn.textContent = "…"; }
  const out = $("#whl-out"); if (out) out.textContent = "La roue tourne…";
  const ease = t => 1 - Math.pow(1 - t, 4); let t0 = 0, lastSeg = -1, lastTick = 0;
  const done = () => {
    UI._whlSpin = 0; sfx(R.rar >= 5 ? "win" : "coin"); buzz([20, 40, 60]);
    const g = $("#whl-rot"); if (g) { const tx = g.querySelectorAll("text")[R.idx]; if (tx) tx.classList.add("whl-win"); g.classList.add("done"); }
    const o = $("#whl-out");
    if (o) { o.innerHTML = `La roue s'arrête sur <b class="gold">${R.n}</b>.${m5RewardHTML(R)}`; const b = $("#whl-go"); if (b) b.textContent = "Revenez demain"; }
    else toast(`Roue de la Taverne : ${R.n}`, "good");
    if (R.it && R.it.rar >= 5 && typeof jackpot === "function") jackpot(R.it);
  };
  const step = ts => {
    if (!t0) t0 = ts; const k = Math.min(1, (ts - t0) / dur), a = end * ease(k), g = $("#whl-rot");
    if (!g) { done(); return; }
    g.style.transform = `rotate(${a.toFixed(2)}deg)`;
    const sI = Math.floor((a + seg / 2) / seg); if (sI !== lastSeg) { lastSeg = sI; if (ts - lastTick > 55) { lastTick = ts; sfx("click"); const p = $(".whl-ptr"); if (p) { p.classList.remove("tk"); void p.offsetWidth; p.classList.add("tk"); } } }
    if (k < 1) requestAnimationFrame(step); else done();
  };
  requestAnimationFrame(step);
}
ACT.wheel = () => wheelOpen();
