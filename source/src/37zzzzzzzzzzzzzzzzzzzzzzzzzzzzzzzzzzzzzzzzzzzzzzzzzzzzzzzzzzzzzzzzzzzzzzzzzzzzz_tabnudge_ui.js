// ── Onglets et replis (21 nov.) : à l'ouverture, l'écran descend un peu pour montrer ce qui vient de s'ouvrir
function nudgeBox(el) { for (let n = el; n && n !== document.body; n = n.parentElement) { const cs = getComputedStyle(n); if (/(auto|scroll)/.test(cs.overflowY) && n.scrollHeight > n.clientHeight + 4) return n; } return null; }
function nudgeTo(el, fold) { const box = nudgeBox(el); if (!box) return; const rb = box.getBoundingClientRect(), re = el.getBoundingClientRect();
  const topNow = re.top - rb.top; // position du titre de l'onglet dans la zone visible
  const want = fold ? rb.height * .12 : 6; const d = topNow - want; if (d < 24) return; // déjà en haut : rien à faire
  const room = box.scrollHeight - box.clientHeight - box.scrollTop; const by = Math.min(d, room, rb.height * .6); if (by < 24) return;
  box.scrollBy({ top: by, behavior: S && S.opts && S.opts.calm ? "auto" : "smooth" }); }
if (HASWIN) document.addEventListener("click", e => {
  if (UI.screen === "combat") return;
  const t = e.target.closest(".tabs button,.chips>button,.chips>.btn,.xptabs button,.fsub button,button.atfold,details>summary,[data-a='bldTab'],[data-a='expePane'],[data-a='xp3'],[data-a='heroPane'],[data-a='codexTab'],[data-a='carnet'],[data-a='goals']");
  if (!t || t.closest("#hud,#nav,.hubrail")) return;
  const fold = t.matches("button.atfold,details>summary"), a = t.dataset.a, v = t.dataset.v, inModal = !!t.closest("#modal"), bar = t.parentElement;
  if (fold) { const det = t.closest("details"); const willOpen = det ? !det.open : !t.classList.contains("on"); if (!willOpen) return; }
  setTimeout(() => { let el = t.isConnected ? (fold ? t : bar) : null;
    if (!el && a) { const root = inModal ? $("#modal") : $("#view"); const q = root && root.querySelector(`[data-a="${a}"]${v != null ? `[data-v="${CSS.escape(v)}"]` : ""}`); el = q ? q.parentElement : null; }
    if (el) nudgeTo(el, fold); }, fold ? 60 : 180);
}, true);
