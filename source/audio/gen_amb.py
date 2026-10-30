# Ambiances de toutes les régions et sons d'interface, à partir d'enregistrements réels (Kenney CC0 + ambiances/magie fournies).
# Aucune synthèse « électronique » : seulement des enregistrements filtrés, ralentis, superposés, et quelques chœurs/cloches de gen_combat.
# python3 audio/gen_amb.py   (depuis source/)
import sys, os, numpy as np
sys.path.insert(0, os.path.dirname(__file__))
import gen_combat as G, gen_magic as M
sys.argv = sys.argv[:1]
import gen_kenney as K
from gen_combat import SR, buf, put, verb, choir, bell, membrane, save, rng
def st(x):  # mono → stéréo
    return np.stack([x, x], 1) if x.ndim == 1 else x
def lpst(x, f): return np.stack([G.lp(x[:, c], f) for c in range(2)], 1)
def hpst(x, f): return np.stack([G.hp(x[:, c], f) for c in range(2)], 1)
def loop_bed(f, rate, dur, lp=None, hp=None, g=1.):
    x = M.load(f, rate, 2); n = int(SR * dur)
    while len(x) < n: x = np.concatenate([x, x])
    x = x[:n]
    if lp: x = lpst(x, lp)
    if hp: x = hpst(x, hp)
    return x * g
def sprinkle(B, maker, every, g, spread=.6, start=2.):  # sons ponctuels répartis dans la boucle
    t = start
    while t < len(B) / SR - 4:
        put(B, maker() * g, t, 1, rng.uniform(-spread, spread)); t += every * rng.uniform(.6, 1.4)
D, C1, C2 = M.find("dungeon_ambient")[0], M.find("dark_cavern_ambient_001")[0], M.find("dark_cavern_ambient_002")[0]
A = M.find("ambience-")
def far(x, f=1800): return G.lp(x, f)
def region(name, bed, layers):
    B = bed.copy()
    for fn in layers: fn(B)
    M.save_amb("amb_" + name, B)
DUR = 100.
if __name__ == "__main__":
    # Bastion : cour de pierre, feu, forge lointaine
    region("bastion", loop_bed(C1, 1., DUR, lp=2500, g=.7), [lambda B: sprinkle(B, lambda: far(K.R("impactMetal_heavy", .8)) * .5, 7, .5), lambda B: put(B, st(G.crackle(DUR, 25, .15)), 0)])
    # Bourg pestiféré : rues mortes, cloche du glas, portes qui grincent
    region("bourg", loop_bed(D, .9, DUR, lp=2000, g=.75), [lambda B: sprinkle(B, lambda: far(K.R("impactBell_heavy", .45), 1200), 22, .45), lambda B: sprinkle(B, lambda: far(K.R("creak", .7)), 14, .35)])
    # Forêt des Pendus : vent dans les branches, bois qui grince
    region("foret", loop_bed(C2, 1.15, DUR, hp=180, lp=3500, g=.6), [lambda B: sprinkle(B, lambda: far(K.R("creak", .55), 1500), 9, .5), lambda B: sprinkle(B, lambda: far(K.R("impactWood_light", .6), 1200), 13, .25)])
    # Catacombes : donjon
    region("catacombes", loop_bed(D, 1., DUR, g=1.), [lambda B: sprinkle(B, lambda: far(K.R("impactMining", .6), 1400), 17, .3)])
    # Marais : eaux lourdes, bulles
    region("marais", loop_bed(C2, .85, DUR, lp=1500, g=.8), [lambda B: sprinkle(B, lambda: G.bubbles(.8, 6, .3), 6, .5), lambda B: sprinkle(B, lambda: far(M.imp("Water", rng.integers(5), .6), 1200), 15, .3)])
    # Citadelle de cendres : grande salle, braises
    region("citadelle", loop_bed(D, .8, DUR, lp=2500, g=.8), [lambda B: put(B, st(G.crackle(DUR, 40, .2)), 0), lambda B: sprinkle(B, lambda: far(K.R("impactPlate_heavy", .6), 1000), 19, .3)])
    # Terres brûlées : vent chaud, feu
    region("terres", loop_bed(C1, 1.1, DUR, hp=150, g=.6), [lambda B: put(B, st(G.crackle(DUR, 70, .3)), 0), lambda B: sprinkle(B, lambda: far(M.imp("Fire", rng.integers(5), .7), 1500), 12, .3)])
    # Cimes gelées : air glacé, glace qui craque
    region("cimes", loop_bed(C2, 1.3, DUR, hp=300, lp=6000, g=.6), [lambda B: sprinkle(B, lambda: far(M.imp("Ice", rng.integers(5), .7), 2500), 11, .25), lambda B: sprinkle(B, lambda: K.R("footstep_snow", .8) * .15, 8, .2)])
    region("cite", loop_bed(C1, .9, DUR, lp=2500, g=.8), [lambda B: sprinkle(B, lambda: G.bubbles(.6, 5, .3), 7, .4), lambda B: sprinkle(B, lambda: far(K.R("impactBell_heavy", .4), 900), 25, .35)])
    region("mines", loop_bed(C1, 1., DUR, g=1.), [lambda B: sprinkle(B, lambda: far(K.R("impactMining", .8), 2500), 6, .35), lambda B: sprinkle(B, lambda: far(K.R("impactMetal_medium", .7), 1800), 10, .25)])
    region("trone", loop_bed(D, .85, DUR, lp=3000, g=.85), [lambda B: sprinkle(B, lambda: far(K.R("impactBell_heavy", .35), 800), 30, .3)])
    region("abime", loop_bed(C2, .75, DUR, lp=2200, g=1.), [lambda B: sprinkle(B, lambda: far(M.load(A[rng.integers(len(A))], .7), 1500), 14, .35)])
    # interface
    def fx_click(i=0): B = buf(.4); put(B, K.R("metalClick", 1.) * .5, 0); put(B, K.R("cloth", 1.2) * .3, 0); return verb(B, .1, "small")
    def fx_level(i=0): B = buf(4.); put(B, K.R("impactBell_heavy", .6) * .6, 0); put(B, choir([146.8, 220., 293.7], 2.6, "a", .3, 1.2) * .45, .05); put(B, M.mag(7, .9) * .5, .05); return verb(B, .4, "crypt")
    def fx_win(i=0): B = buf(4.5); put(B, membrane(55, 1., .8), 0); put(B, membrane(55, 1., .7), .35); put(B, G.horn(110., 2., .45), .6); put(B, choir([110., 164.8, 220.], 2.6, "a", .5, 1.2) * .4, .7); return verb(B, .38)
    def fx_lose(i=0): B = buf(5.); put(B, K.R("impactBell_heavy", .4) * .7, 0); put(B, choir([98., 116.5, 146.8], 3.4, "u", .6, 1.6) * .45, .1); return verb(B, .45, "crypt")
    for k, f in [("click", fx_click), ("level", fx_level), ("win", fx_win), ("lose", fx_lose)]: save(f"fx_{k}_1", f())
