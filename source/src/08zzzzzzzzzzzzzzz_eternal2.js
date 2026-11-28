/* Bibelots Éternels : en plus des deux traits tirés au sort et de l'écho de voie de leur classe, chacun porte un trait propre,
   l'« Âme » de ce bibelot (son effet de base renforcé de moitié), qui n'existe sur aucun autre objet. */
const etSoulPas = it => { const T = it && it.kind === "tr" && it.et && TRINKETS[it.key]; return T && T.pas ? T.pas.filter(p => typeof p.v === "number" && p.k !== "cheatDeath").map(p => Object.assign({}, p, { v: Math.round(p.v * .5 * 1000) / 1000 })) : []; };
const etSoulName = it => { const T = TRINKETS[it.key]; return T ? "Âme : " + T.n : "Âme éternelle"; };
PAS_HOOKS.push(h => { const out = []; for (const s of ["tr1", "tr2"]) { const it = h.gear[s]; if (it && it.et) out.push(...etSoulPas(it)); } return out; });
