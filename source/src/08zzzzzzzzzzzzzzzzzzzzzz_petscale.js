/* Compagnons (13 nov.) : leurs dégâts suivent aussi la force réelle du groupe (niveau, équipement, talents, ascension, panoplies…).
   Plancher = PET_TEAM × dégâts moyens des héros du combat × √rang × bonus du compagnon (collier, trait, spécialisation),
   +1,5 %/niveau du compagnon. Les soins et boucliers sont déjà proportionnels aux PV max des héros. */
const PET_TEAM = .42;
function petTeamDmg(B, id) {
  const H = (B.heroes || []).filter(u => u && u.dmgHi > 0); if (!H.length) return 0;
  const avg = H.reduce((a, u) => a + (u.dmgLo + u.dmgHi) / 2, 0) / H.length;
  const r = (PETS[id] && PETS[id].rank) || 1, m = typeof petMul === "function" ? petMul(id) : { dmg: 1 }, lv = petLvl(id);
  return avg * PET_TEAM * Math.sqrt(r) * m.dmg * (1 + .015 * (lv - 1));
}
{ const nb = newBattle; newBattle = function () { const B = nb.apply(this, arguments);
    try { if (B && B.pet && B.pet.pw) { const f = petTeamDmg(B, B.pet.id); if (f > B.pet.pw.dmg) { B.pet.pw.dmgBase = B.pet.pw.dmg; B.pet.pw.dmg = f; } } } catch (e) { }
    return B; }; }
