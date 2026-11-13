/* Récits du bestiaire étoffé (02yzzz_bestiary.js). */
for (const r in BESTIARY_MORE) for (const [k, , , , t] of BESTIARY_MORE[r]) if (!LORE[k]) LORE[k] = t;
