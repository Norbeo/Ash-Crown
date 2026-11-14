# Bruitages de combat à partir des seuls enregistrements (14 nov.) : Kenney « RPG Audio » + « Impact Sounds » (CC0),
# Lentikula « Spell Impacts » et « magical_1-7 » (CC0). Hauteur naturelle (ou à peine plus grave), réverbération courte,
# plus aucun chœur, cor ou cloche de synthèse.   python3 audio/gen_real.py   (depuis source/)
import sys, os
sys.argv = sys.argv[:1]; sys.path.insert(0, os.path.dirname(__file__))
import numpy as np
import gen_combat as G
from gen_combat import buf, put, verb, save, rng
import gen_kenney as K, gen_magic as M
R, imp, mag = K.R, M.imp, M.mag
def sw(v=.3): return G.whoosh(rng.uniform(.18, .24), 450, 2200, v, 1.2)  # léger souffle d'élan

def fx_slash(i=0): B = buf(.8); put(B, sw(.3), 0, 1, rng.uniform(-.3, .3)); put(B, R("drawKnife", .95, i) * .6, 0); put(B, R("cloth", 1.) * .35, .03); return verb(B, .08, "small")
def fx_hit(i=0):
    B = buf(1.); k = i % 2
    if k == 0: put(B, R("impactPunch_heavy", .95) * 1., 0); put(B, R("impactPlate_light", 1.) * .35, .003)
    else: put(B, R("knifeSlice", .95) * .7, 0); put(B, R("impactSoft_heavy", .95) * .9, .01)
    return verb(B, .1, "small")
def fx_heavy(i=0): B = buf(1.4); put(B, sw(.35), 0); put(B, R("impactPunch_heavy", .8) * 1.1, .2); put(B, R("impactWood_heavy", .85) * .6, .2); put(B, R("impactMining", .85) * .4, .21); return verb(B, .12, "small")
def fx_crit(i=0): B = buf(1.4); put(B, sw(.35), 0); put(B, R("impactPlate_heavy", .95) * .8, .17); put(B, R("impactPunch_heavy", .9) * 1., .17); put(B, R("impactMetal_heavy", .95) * .45, .175); return verb(B, .14, "small")
def fx_shoot(i=0): B = buf(1.); put(B, G.string_pluck(rng.uniform(120, 150), .3) * .8, 0); put(B, G.whoosh(.24, 1800, 4800, .35, 3.), .03, 1, .5); put(B, R("impactWood_light", 1.) * .8, .28, 1, .6); return verb(B, .08, "small")
def fx_miss(i=0): B = buf(.6); put(B, sw(.45), 0, 1, rng.uniform(-.5, .5)); put(B, R("cloth", 1.) * .4, .05); return verb(B, .06, "small")
def fx_block(i=0): B = buf(1.); put(B, R("impactWood_heavy", .95) * 1., 0); put(B, R("impactMetal_light", .95) * .45, 0, 1, .3); return verb(B, .1, "small")
def fx_bleed(i=0): B = buf(.8); put(B, R("knifeSlice", .9) * .8, 0); put(B, R("impactSoft_medium", .9) * .5, .02); return verb(B, .08, "small")
def fx_die(i=0):
    B = buf(1.6); put(B, R("impactSoft_heavy", .8) * 1., 0)
    for k in range(2): put(B, R("impactPlate_light", .95) * (.35 - k * .1), .1 + k * rng.uniform(.08, .14), 1, rng.uniform(-.5, .5))
    put(B, R("dropLeather", .95) * .5, .05); return verb(B, .12, "small")
def fx_fall(i=0): B = buf(2.); put(B, R("impactSoft_heavy", .75) * 1., 0); put(B, R("impactPlate_heavy", .85) * .4, .1); put(B, R("dropLeather", .9) * .5, .05); return verb(B, .14, "small")
def fx_stun(i=0): B = buf(1.2); put(B, R("impactMetal_heavy", .95) * .8, 0); put(B, R("impactPunch_heavy", .9) * .7, 0); return verb(B, .12, "small")
def fx_buff(i=0): B = buf(2.); put(B, mag(4, .95) * .6, 0); put(B, R("clothBelt", 1.) * .4, .05); put(B, R("beltHandle", 1.) * .35, .2); return verb(B, .14, "small")
def fx_ult(i=0): B = buf(2.6); put(B, mag(7, .9) * .6, 0); put(B, R("impactPunch_heavy", .75) * 1.1, .55); put(B, R("impactPlate_heavy", .8) * .6, .55); put(B, R("impactMining", .8) * .4, .56); return verb(B, .18, "hall")
def fx_holy(i=0): B = buf(3.); put(B, mag([7, 5, 6][i % 3], 1.) * .8, 0); return verb(B, .2, "hall")
def fx_heal(i=0): B = buf(2.6); put(B, imp("Healing", i * 3 + 1, 1.) * .9, 0); return verb(B, .14, "hall")
def fx_debuff(i=0): B = buf(2.2); put(B, mag(1, .85) * .8, 0); return verb(B, .16, "hall")
def fx_dark(i=0): B = buf(2.6); put(B, mag(1, .75) * .7, 0); put(B, M.load(M.find("ambience-")[[0, 4][i % 2]], .9) * .5, .1); return verb(B, .18, "hall")
def fx_fire(i=0): B = buf(2.6); put(B, imp("Fire", i, 1.) * 1., 0); return verb(B, .1, "small")
def fx_frost(i=0): B = buf(2.4); put(B, imp("Ice", i, 1.) * 1., 0); return verb(B, .12, "small")
def fx_shock(i=0): B = buf(2.6); put(B, imp("Lightning", i, 1.) * 1., 0); return verb(B, .1, "small")
def fx_poison(i=0): B = buf(2.); put(B, imp("Water", i, .9) * .8, 0); return verb(B, .1, "small")
VAR = {"slash": 2, "hit": 2, "heavy": 2, "crit": 2, "shoot": 2, "miss": 2, "block": 2, "bleed": 2, "die": 2, "fall": 1, "stun": 1, "buff": 1, "ult": 1,
       "holy": 2, "heal": 2, "debuff": 2, "dark": 2, "fire": 2, "frost": 2, "shock": 2, "poison": 2}
if __name__ == "__main__":
    for k, n in VAR.items():
        for i in range(n): save(f"fx_{k}_{i + 1}", globals()["fx_" + k](i))
