// ── Carte du monde (21 nov.) : médaillons peints (vaincu / ouvert / scellé) et chemin de pas de cendres en courbes
const WM_FOOT = `<symbol id="wmfoot" viewBox="-6 -14 12 24" overflow="visible"><ellipse cx="0" cy="-4" rx="3.3" ry="5.2" transform="rotate(7)"/><ellipse cx=".4" cy="5.2" rx="2.5" ry="2.8"/><circle cx="-2.6" cy="-10.2" r="1"/><circle cx="-.9" cy="-11" r="1"/><circle cx=".8" cy="-10.9" r=".95"/><circle cx="2.4" cy="-10.1" r=".85"/></symbol>`;
function wmStepsSVG(a, b, style, i, W) { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, bend = (i % 2 ? -.28 : .28) * L;
  const mx = (a[0] + b[0]) / 2 - dy / L * bend, my = (a[1] + b[1]) / 2 + dx / L * bend, sz = W / 1000 * 3.1, step = sz * 17, gap = sz * 22;
  const P = []; for (let k = 0; k <= 200; k++) { const t = k / 200, u = 1 - t; P.push([u * u * a[0] + 2 * u * t * mx + t * t * b[0], u * u * a[1] + 2 * u * t * my + t * t * b[1]]); }
  let acc = 0, left = true, out = "";
  for (let k = 1; k < P.length; k++) { acc += Math.hypot(P[k][0] - P[k - 1][0], P[k][1] - P[k - 1][1]); if (acc < step) continue; acc = 0; const [x, y] = P[k];
    if (Math.hypot(x - a[0], y - a[1]) < gap || Math.hypot(x - b[0], y - b[1]) < gap) continue;
    const ang = Math.atan2(y - P[k - 1][1], x - P[k - 1][0]), o = (left ? 1 : -1) * sz * 3.3, fx = x - Math.sin(ang) * o, fy = y + Math.cos(ang) * o;
    const hh = 34 * sz, ww = hh * .58, nI = 1 + ((k * 7 + i) % 4);
    out += `<image href="assets/map_step${nI}.webp" width="${ww.toFixed(1)}" height="${hh.toFixed(1)}" x="${(-ww / 2).toFixed(1)}" y="${(-hh / 2).toFixed(1)}" transform="translate(${fx.toFixed(1)},${fy.toFixed(1)}) rotate(${(ang * 180 / Math.PI + 90).toFixed(0)})${left ? "" : " scale(-1,1)"}"/>`; left = !left; }
  return `<g class="wmst ${style}">${out}</g>`; }
{ const wm0 = worldMapHTML; worldMapHTML = function (E, regs) { let h = wm0.apply(this, arguments);
    try { const vb = h.match(/<svg viewBox="0 0 ([\d.]+) ([\d.]+)"/); if (!vb) return h; const W = +vb[1], H = +vb[2];
      const nodes = [...h.matchAll(/<button class="wnode[^"]*" style="left:([\d.]+)%;top:([\d.]+)%" data-a="[^"]*" data-v="([^"]+)"/g)].map(m => ({ x: +m[1] / 100 * W, y: +m[2] / 100 * H, id: m[3] }));
      const near = (x, y) => nodes.reduce((b, n) => !b || Math.hypot(n.x - x, n.y - y) < Math.hypot(b.x - x, b.y - y) ? n : b, null);
      const WM_STEPS = true; let i = 0; if (WM_STEPS) h = h.replace(/<path d="M([\d.-]+),([\d.-]+) [^"]*?([\d.-]+),([\d.-]+)" class="road([^"]*)"\/>/g, (m, x1, y1, x2, y2, cls) => {
        const a = [+x1, +y1], b = [+x2, +y2], nb = near(b[0], b[1]), na = near(a[0], a[1]); if (!nb || !na) return m;
        const clb = S.prog[nb.id] && S.prog[nb.id].clears, cla = S.prog[na.id] && S.prog[na.id].clears, ub = regionUnlocked(nb.id);
        const st = /abyss/.test(cls) ? (ub ? "abyss" : "far") : clb ? "done" : ub && cla ? "next" : "far"; return wmStepsSVG(a, b, st, i++, W); });
      h = h.replace(/<svg viewBox="0 0 ([\d.]+) ([\d.]+)" preserveAspectRatio="none">/, `<svg viewBox="0 0 $1 $2" preserveAspectRatio="none"><defs>${WM_FOOT}<filter id="wmember" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${(W / 400).toFixed(1)}" result="b"/><feFlood flood-color="#ff7a2a"/><feComposite in2="b" operator="in" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`);
      // état des médaillons
      h = h.replace(/<button class="wnode ([^"]*)"([^>]*?)data-v="([^"]+)"/g, (m, c, mid, id) => { const ok = regionUnlocked(id), cl = S.prog[id] && S.prog[id].clears; return `<button class="wnode ${c} ${!ok ? "wlock" : cl ? "wdone" : "wcur"}"${mid}data-v="${id}"`; });
      h = h.replace(/(<button class="wnode[^"]*abyss[^"]*"[^>]*><i[^>]*>)(<\/i>)/, `$1<b class="wnum wabyss">∞</b>$2`);
    } catch (e) { } return h; }; }
