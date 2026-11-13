/* Déblocage progressif des compétences (13 nov.) : un héros débute avec 4 compétences,
   les suivantes s'ouvrent avec le niveau (toutes celles de la classe au niveau 13),
   puis celles de la voie à l'évolution (2), et les 2 dernières quelques niveaux après. L'ultime reste toujours disponible. */
const SK_LVL_BASE = [1, 1, 1, 1, 3, 5, 7, 10, 13];
const SK_LVL_EVO = [0, 0, 2, 4]; // niveaux après l'évolution (EVO_LVL)
function skillUnlockLvl(h, id) {
  const C = CLASSES[h.cls]; const b = Object.keys(C.skills).indexOf(id);
  if (b >= 0) return SK_LVL_BASE[Math.min(b, SK_LVL_BASE.length - 1)] + Math.max(0, b - SK_LVL_BASE.length + 1) * 2;
  for (const E of Object.values(C.evos || {})) { const e = Object.keys(E.skills || {}).indexOf(id); if (e >= 0) return EVO_LVL + (SK_LVL_EVO[Math.min(e, SK_LVL_EVO.length - 1)] || 0); }
  return 1;
}
function skillOpen(h, id) { return (h.lvl || 1) >= skillUnlockLvl(h, id); }
// compétences encore verrouillées (classe + voie choisie), avec leur niveau
function heroSkillLocked(h) {
  const C = CLASSES[h.cls], all = Object.keys(C.skills).concat(h.evo ? Object.keys(C.evos[h.evo].skills || {}) : []);
  return all.filter(id => !skillOpen(h, id)).map(id => [id, skillUnlockLvl(h, id)]);
}
{ const p0 = heroSkillPool; heroSkillPool = function (h) { return p0.apply(this, arguments).filter(id => skillOpen(h, id)); }; }
// en combat, seules les compétences débloquées servent (anciennes sauvegardes comprises)
{ const hu = heroUnit; heroUnit = function (h) {
    const sv = h.skills, pool = heroSkillPool(h); let l = (sv || []).filter(id => pool.includes(id)).slice(0, 4); if (!l.length) l = pool.slice(0, 4);
    if (l.length === (sv || []).length) return hu.apply(this, arguments);
    h.skills = l; try { return hu.apply(this, arguments); } finally { h.skills = sv; } }; }
// au passage de niveau : nouvelle compétence annoncée, et équipée d'office s'il reste une place libre
function skillUnlockCheck(h, before) {
  const fresh = Object.keys(CLASSES[h.cls].skills).concat(h.evo ? Object.keys(CLASSES[h.cls].evos[h.evo].skills || {}) : []).filter(id => { const l = skillUnlockLvl(h, id); return l > before && l <= h.lvl; });
  for (const id of fresh) { if (h.skills.length < 4 && !h.skills.includes(id)) h.skills.push(id);
    if (typeof toast === "function") try { toast(`<b class="gold">✦ ${esc(h.name.split(" ")[0])}</b> apprend <b>${skillDef(h, id).n}</b>`, "good"); } catch (e) { } }
  return fresh;
}
{ const gx = giveXp; giveXp = function (h) { const b = h && h.lvl; const r = gx.apply(this, arguments); try { if (h && h.lvl > b) skillUnlockCheck(h, b); } catch (e) { } return r; }; }
