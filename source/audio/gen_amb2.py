# Ambiances des chapitres XI–XX (mêmes enregistrements que gen_amb.py). python3 audio/gen_amb2.py [régions…]  (depuis source/)
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
ARGS = sys.argv[1:]; sys.argv = sys.argv[:1]
import gen_amb as A
from gen_amb import G, M, K, st, loop_bed, sprinkle, far, region, rng, D, C1, C2, DUR, put
R = {
  # Racines du Monde : caverne humide, bois qui travaille
  "racines": lambda: region("racines", loop_bed(C2, .8, DUR, lp=1800, g=.85), [lambda B: sprinkle(B, lambda: far(K.R("creak", .45), 1100), 8, .45), lambda B: sprinkle(B, lambda: G.bubbles(.5, 4, .25), 11, .25)]),
  # Désert de Sel : vent sec, sable
  "sel": lambda: region("sel", loop_bed(C1, 1.25, DUR, hp=250, lp=5000, g=.6), [lambda B: sprinkle(B, lambda: far(K.R("footstep_snow", .6), 3000) * .3, 9, .2), lambda B: sprinkle(B, lambda: far(K.R("impactWood_light", .5), 900), 21, .2)]),
  # Colline des Gibets : vent, cordes et bois qui grincent, corbeaux lointains
  "pendus": lambda: region("pendus", loop_bed(C2, 1.1, DUR, hp=200, lp=3200, g=.65), [lambda B: sprinkle(B, lambda: far(K.R("creak", .4), 1300), 6, .5), lambda B: sprinkle(B, lambda: far(K.R("impactBell_heavy", .3), 700), 33, .25)]),
  # Monastère Noir : nef, chœur lointain, cloche
  "monastere": lambda: region("monastere", loop_bed(D, .8, DUR, lp=2200, g=.8), [lambda B: sprinkle(B, lambda: far(st(A.choir([98., 146.8, 196.], 4., "u", .35, 2.)), 1500), 16, .3), lambda B: sprinkle(B, lambda: far(K.R("impactBell_heavy", .5), 1000), 27, .35)]),
  # Écho : grande salle vide, sons répétés
  "echo": lambda: region("echo", loop_bed(C1, .7, DUR, lp=2000, g=.8), [lambda B: sprinkle(B, lambda: far(K.R("impactMetal_medium", .45), 1300), 9, .3), lambda B: sprinkle(B, lambda: far(K.R("impactMetal_medium", .45), 700), 9, .15, .8, 2.7)]),
  # Mer de Cendres : houle lourde, braises
  "mer_cendres": lambda: region("mer_cendres", loop_bed(C2, .7, DUR, lp=1400, g=.9), [lambda B: put(B, st(G.crackle(DUR, 30, .15)), 0), lambda B: sprinkle(B, lambda: far(M.imp("Water", rng.integers(5), .5), 900), 9, .35)]),
  # Cathédrale basse : orgue grave (chœur), cloches
  "cathedrale": lambda: region("cathedrale", loop_bed(D, .75, DUR, lp=2600, g=.8), [lambda B: sprinkle(B, lambda: far(st(A.choir([73.4, 110., 146.8], 5., "o", .4, 2.5)), 1800), 13, .35), lambda B: sprinkle(B, lambda: far(K.R("impactBell_heavy", .35), 900), 19, .3)]),
  # Jardin d'os : vent, os qui s'entrechoquent
  "jardin_os": lambda: region("jardin_os", loop_bed(C2, 1., DUR, hp=180, lp=3000, g=.65), [lambda B: sprinkle(B, lambda: far(K.R("impactWood_light", .9), 2500), 5, .3), lambda B: sprinkle(B, lambda: far(K.R("creak", .6), 1300), 14, .3)]),
  # Faille : bourdon cosmique, magie lointaine
  "faille": lambda: region("faille", loop_bed(C1, .6, DUR, lp=1600, g=.95), [lambda B: sprinkle(B, lambda: far(M.load(A.A[rng.integers(len(A.A))], .55), 1300), 10, .35)]),
  # Cœur du monde : battement profond
  "coeur": lambda: region("coeur", loop_bed(D, .65, DUR, lp=1500, g=.9), [lambda B: sprinkle(B, lambda: st(A.membrane(42, .9, .9)), 1.6, .45, .1, 1.)]),
}
for k in (ARGS or R.keys()):
    try: R[k](); print("ok", k)
    except Exception as e: print("ERR", k, e)
