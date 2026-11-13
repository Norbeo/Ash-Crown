# Bruitages à partir des enregistrements Kenney (CC0 : « RPG Audio » et « Impact Sounds »), assombris :
# hauteur abaissée, couches superposées, réverbération de salle de pierre (gen_combat.verb). Sons magiques : chœurs de gen_combat.
# python3 audio/gen_kenney.py <dossier des .ogg>   (depuis source/)
import sys, os, glob, subprocess, numpy as np
sys.path.insert(0, os.path.dirname(__file__))
import gen_combat as G
from gen_combat import SR, buf, put, verb, whoosh, chain, choir, membrane, horn, bell, rumble, crackle, reverse_swell, string_pluck, save, rng
SRC = sys.argv[1] if len(sys.argv) > 1 else "/tmp/claude-0/snd/k"
FILES = {os.path.basename(f)[:-4]: f for f in glob.glob(SRC + "/**/*.ogg", recursive=True)}
_C = {}
def load(name, rate=1.):
    k = (name, rate)
    if k not in _C:
        p = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", FILES[name], "-ac", "1", "-ar", str(int(SR / rate)), "-f", "f32le", "-"], capture_output=True, check=True)
        x = np.frombuffer(p.stdout, np.float32).astype(float); m = np.abs(x).max() or 1; _C[k] = x / m
    return _C[k]
def any_(prefix): return sorted(k for k in FILES if k.startswith(prefix))
def R(prefix, rate=1., i=None):  # un enregistrement au hasard d'une famille, joué plus grave si rate < 1
    L = any_(prefix); n = L[i % len(L)] if i is not None else L[rng.integers(len(L))]; return load(n, rate)
def dark(x, f=5500): return G.lp(x, f)

def fx_slash(i=0):
    B = buf(.9); put(B, whoosh(rng.uniform(.22, .3), 380, 2800, .7), 0, 1, rng.uniform(-.3, .3)); put(B, R("drawKnife", .85, i) * .55, .0); put(B, R("cloth", .9) * .3, .05); return verb(B, .14, "small")
def fx_hit(i=0):
    B = buf(1.5); k = i % 4
    if k == 0: put(B, R("impactPlate_medium", .85) * .9, 0); put(B, R("impactPunch_heavy", .8) * 1., .003)
    elif k == 1: put(B, R("knifeSlice", .85) * .8, 0); put(B, R("impactSoft_heavy", .8) * 1., .01); put(B, chain(.25, 120, .25), .01)
    elif k == 2: put(B, R("impactPunch_heavy", .75) * 1.1, 0); put(B, R("impactMetal_medium", .8) * .5, .004)
    else: put(B, R("impactPlate_heavy", .8) * .8, 0); put(B, R("impactPunch_medium", .7) * .9, .002); put(B, chain(.3, 160, .3), .01)
    return verb(B, .2)
def fx_heavy(i=0):
    B = buf(2.2); put(B, whoosh(.36, 150, 900, .7, 1.), 0)
    put(B, R("impactPunch_heavy", .55) * 1.2, .3); put(B, R("impactWood_heavy", .6) * .8, .3); put(B, R("impactMining", .6) * .6, .31); put(B, rumble(1., .9), .3); put(B, R("impactPlate_heavy", .65) * .4, .32)
    return verb(B, .28)
def fx_crit(i=0):
    B = buf(2.4); put(B, whoosh(.22, 300, 3500, .8), 0)
    put(B, R("impactPlate_heavy", .78) * 1., .2); put(B, R("impactPunch_heavy", .7) * 1.1, .2); put(B, R("impactMetal_heavy", .75) * .7, .205); put(B, G.bone(.8), .21); put(B, rumble(.6, .5), .2)
    return verb(B, .34)
def fx_shoot(i=0):
    B = buf(1.2); put(B, string_pluck(rng.uniform(110, 150), .4) * 1.1, 0); put(B, whoosh(.28, 1800, 5000, .5, 3.), .03, 1, .5)
    put(B, R("impactWood_light", .85) * .9, .33, 1, .6); put(B, R("impactSoft_medium", .9) * .5, .335, 1, .6); return verb(B, .16)
def fx_miss(i=0):
    B = buf(.8); put(B, whoosh(.32, 600, 3000, .7, 1.6), 0, 1, rng.uniform(-.5, .5)); put(B, R("cloth", .85) * .35, .08); return verb(B, .14)
def fx_block(i=0):
    B = buf(1.3); put(B, R("impactWood_heavy", .8) * 1., 0); put(B, R("impactMetal_light", .75) * .55, 0, 1, .3); return verb(B, .2)
def fx_bleed(i=0):
    B = buf(1.); put(B, R("knifeSlice", .8) * .9, 0); put(B, R("impactSoft_medium", .75) * .7, .02); return verb(B, .2)
def fx_die(i=0):
    B = buf(2.4); put(B, R("impactSoft_heavy", .65) * 1.1, 0); put(B, rumble(.5, .5), 0)
    for k in range(3): put(B, R("impactPlate_light" if k else "impactPlate_heavy", .8 - k * .05) * (.5 - k * .1), .08 + k * rng.uniform(.07, .13), 1, rng.uniform(-.5, .5))
    put(B, chain(.4, 120, .3), .05); return verb(B, .3)
def fx_fall(i=0):
    B = buf(3.6); put(B, R("impactSoft_heavy", .6) * 1.1, 0); put(B, R("impactPlate_heavy", .7) * .5, .1); put(B, R("impactMetal_light", .7) * .3, .25)
    put(B, R("impactBell_heavy", .5) * .35, .4); put(B, choir([98., 116.5], 2.4, "u", .4, 1.2, 3) * .35, .45); return verb(B, .42, "crypt")
def fx_stun(i=0):
    B = buf(1.8); put(B, R("impactMetal_heavy", .8) * .9, 0); put(B, R("impactPunch_heavy", .75) * .8, 0); put(B, R("impactBell_heavy", 1.4) * .15, .05); return verb(B, .25)
def fx_buff(i=0):
    B = buf(2.8); put(B, membrane(rng.uniform(55, 68), 1., .8), 0); put(B, membrane(60, 1., .7), .32); put(B, horn(rng.choice([98., 110.]), 1.5, .5), .3)
    put(B, R("clothBelt", .9) * .4, .05); put(B, R("beltHandle", .9) * .35, .2); return verb(B, .35)
def fx_ult(i=0):
    B = buf(4.); put(B, reverse_swell(1.1, .7), 0); put(B, choir([73.4, 110., 146.8], 1.6, "a", .9, .3) * .55, 0)
    put(B, membrane(48, 1.4, 1.1), 1.1); put(B, R("impactPunch_heavy", .5) * 1.2, 1.1); put(B, R("impactPlate_heavy", .6) * .7, 1.1); put(B, rumble(1.5, 1.), 1.1); put(B, horn(73.4, 1.8, .35), 1.15)
    return verb(B, .4, "crypt")
# interface et Bastion
def fx_coin(i=0): B = buf(.9); put(B, R("handleCoins", 1., i) * .9, 0); return verb(B, .14, "small")
def fx_door(i=0): B = buf(2.4); put(B, R("doorOpen", .8, i) * .9, 0); put(B, R("creak", .75) * .5, .1); put(B, R("doorClose", .75) * .8, .9); return verb(B, .3)
def fx_step(i=0): B = buf(.6); put(B, R("footstep_concrete", .85, i) * .8, 0); return verb(B, .18)
def fx_forge(i=0): B = buf(2.); put(B, R("impactMetal_heavy", .9, i) * 1., 0); put(B, R("impactBell_heavy", 1.3) * .25, 0); put(B, crackle(.5, 40, .3), .05); return verb(B, .3)
def fx_open(i=0): B = buf(1.2); put(B, R("bookOpen", .85) * .7, 0); put(B, R("cloth", .85) * .4, .05); return verb(B, .22, "small")
def fx_bell(i=0): B = buf(5.); put(B, R("impactBell_heavy", .5, i) * .9, 0); put(B, bell(98, 4.5, .3), 0); return verb(B, .5, "crypt")

VAR = {"slash": 3, "hit": 4, "heavy": 2, "crit": 2, "shoot": 2, "miss": 2, "block": 2, "bleed": 2, "die": 2, "fall": 1, "stun": 1, "buff": 1, "ult": 1, "coin": 2, "door": 2, "step": 3, "forge": 2, "open": 1, "bell": 1}
if __name__ == "__main__":
    print(len(FILES), "enregistrements")
    for k, n in VAR.items():
        for i in range(n): save(f"fx_{k}_{i + 1}", globals()["fx_" + k](i))
