# Sons de magie et ambiances à partir de packs libres (Lentikula « Basic Spell Impacts » CC0, « magical_1-7 » et ambiances d'OpenGameArt),
# mélangés aux chœurs/cloches de gen_combat et assombris.  python3 audio/gen_magic.py <dossier>
import sys, os, glob, subprocess, wave, numpy as np
sys.path.insert(0, os.path.dirname(__file__))
import gen_combat as G
from gen_combat import SR, buf, put, verb, choir, bell, membrane, horn, whisper, bubbles, rumble, reverse_swell, save, rng, OUT
SRC = sys.argv[1] if len(sys.argv) > 1 else "/tmp/claude-0/snd/m"
ALL = glob.glob(SRC + "/**/*.ogg", recursive=True) + [f for f in glob.glob(SRC + "/**/*.wav", recursive=True) if "__MACOSX" not in f]
def find(pat): return sorted(f for f in ALL if pat.lower() in os.path.basename(f).lower())
_C = {}
def load(f, rate=1., ch=1):
    k = (f, rate, ch)
    if k not in _C:
        p = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", f, "-ac", str(ch), "-ar", str(int(SR / rate)), "-f", "f32le", "-"], capture_output=True, check=True)
        x = np.frombuffer(p.stdout, np.float32).astype(float); x = x.reshape(-1, ch) if ch > 1 else x; m = np.abs(x).max() or 1; _C[k] = x / m
    return _C[k]
MAG = {n: find("magical_" + str(n))[0] for n in range(1, 8) if find("magical_" + str(n))}
def mag(n, rate=1.): return load(MAG[n], rate)
def imp(kind, i, rate=1.): L = find(kind + " Spell Impact"); return load(L[i % len(L)], rate)

def fx_holy(i=0):
    B = buf(4.); ch = [[146.8, 220., 293.7], [130.8, 196., 261.6], [164.8, 246.9, 329.6]][i % 3]
    put(B, mag([7, 5, 6][i % 3], .85) * .8, .05, 1, -.1); put(B, choir(ch, 2.6, "a", .5, 1.1) * .5, 0); put(B, bell(ch[0], 3.2, .25), .05)
    return verb(B, .42, "crypt")
def fx_heal(i=0):  # Lentikula « Healing Spell Impacts » + chœur doux
    B = buf(3.4); put(B, imp("Healing", i * 3 + 1, .92) * .9, 0); put(B, choir([[196., 293.7], [174.6, 261.6], [220., 329.6], [164.8, 246.9]][i % 4], 2., "o", .4, .9, 3) * .25, .05); return verb(B, .35, "crypt")
def fx_buff(i=0):
    B = buf(2.8); put(B, membrane(60, 1., .8), 0); put(B, membrane(58, 1., .7), .3); put(B, horn(98., 1.4, .4), .28); put(B, mag(4, .8) * .55, .05); return verb(B, .35)
def fx_debuff(i=0):
    B = buf(2.4); put(B, mag(1, .62) * .9, 0); put(B, load(find("ambience-")[[2, 3][i % 2]], .9) * .5, .05); put(B, whisper(1.3, .3), .1, 1, .4); return verb(B, .4, "crypt")
def fx_dark(i=0):
    B = buf(3.4); a = find("ambience-"); put(B, reverse_swell(.6, .4), 0); put(B, load(a[[0, 4, 1][i % 3]], .8) * 1., .55); put(B, mag(1, .55) * .5, .6); put(B, whisper(1.4, .35), .6, 1, -.4)
    return verb(B, .42, "crypt")
def fx_fire(i=0): B = buf(3.5); put(B, imp("Fire", i, .88) * 1., 0); put(B, rumble(.8, .3), 0); return verb(B, .25)
def fx_frost(i=0): B = buf(3.); put(B, imp("Ice", i, .85) * 1., 0); return verb(B, .3, "crypt")
def fx_shock(i=0): B = buf(4.); put(B, imp("Lightning", i, .9) * 1., 0); put(B, rumble(1., .4), .05); return verb(B, .25)
def fx_poison(i=0): B = buf(2.6); put(B, imp("Water", i, .72) * .9, 0); put(B, bubbles(.9, 14, .35), .1); return verb(B, .25)
VAR = {"holy": 3, "heal": 4, "buff": 1, "debuff": 2, "dark": 3, "fire": 3, "frost": 2, "shock": 2, "poison": 2}

def save_amb(name, x, fade=3.):  # boucle stéréo sans clic (fondu croisé)
    f = int(SR * fade); y = x[:-f].copy(); y[:f] = y[:f] * np.linspace(0, 1, f)[:, None] + x[-f:] * np.linspace(1, 0, f)[:, None]
    y = y / (np.abs(y).max() or 1) * .8; tmp = os.path.join(OUT, "_a.wav")
    with wave.open(tmp, "wb") as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes())
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", tmp, "-af", "loudnorm=I=-24:TP=-3:LRA=15", "-ar", "44100", "-b:a", "64k", os.path.join(OUT, name + ".mp3")], check=True); os.remove(tmp); print(name, round(len(y) / SR, 1), "s")
def amb(f, rate=1., lp=None):
    x = load(f, rate, 2)
    if lp: x = np.stack([G.lp(x[:, c], lp) for c in range(2)], 1)
    return x
if __name__ == "__main__":
    print(len(ALL), "fichiers")
    only = sys.argv[2:]
    for k, n in VAR.items():
        if only and k not in only: continue
        for i in range(n): save(f"fx_{k}_{i + 1}", globals()["fx_" + k](i))
    if only: sys.exit(0)
    D, C1, C2 = find("dungeon_ambient")[0], find("dark_cavern_ambient_001")[0], find("dark_cavern_ambient_002")[0]
    save_amb("amb_catacombes", amb(D)); save_amb("amb_mines", amb(C1)); save_amb("amb_abime", amb(C2, .8, 3000))
    save_amb("amb_trone", amb(D, .85, 4000)); save_amb("amb_cite", amb(C1, .9, 2500))
