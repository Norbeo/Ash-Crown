# Génère les ambiances et bruitages du jeu (synthèse hors ligne, aucune source externe) → source/sfx/*.mp3
# python3 audio/gen_audio.py   (depuis source/)
import numpy as np, subprocess, os, wave
from scipy import signal
SR = 32000
OUT = os.path.join(os.path.dirname(__file__), "..", "sfx")
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)
T = lambda d: np.arange(int(SR * d)) / SR

def noise(d): return rng.standard_normal(int(SR * d))
def bp(x, lo, hi, o=2): b, a = signal.butter(o, [lo / (SR / 2), hi / (SR / 2)], "band"); return signal.lfilter(b, a, x)
def lp(x, f, o=2): b, a = signal.butter(o, f / (SR / 2), "low"); return signal.lfilter(b, a, x)
def hp(x, f, o=2): b, a = signal.butter(o, f / (SR / 2), "high"); return signal.lfilter(b, a, x)
def env(n, a=.005, d=.3, curve=4):
    t = np.arange(n) / SR; e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) * curve / max(d, 1e-3)); return e
def slow(n, rate, depth=1., lo=0.):
    k = max(4, int(n / SR * rate) + 4); pts = rng.random(k); x = np.interp(np.linspace(0, k - 1, n), np.arange(k), pts); x = lp(x, 2, 1) if n > 100 else x
    return lo + (1 - lo) * (1 - depth + depth * x)
_IR = None
def reverb(x, size=2.2, wet=.3, damp=3000):
    global _IR
    n = int(SR * size); ir = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 6.5 / size); ir = lp(ir, damp); ir /= np.abs(ir).sum() ** .5 * 8
    y = signal.fftconvolve(x, ir); xx = np.concatenate([x, np.zeros(len(y) - len(x))]); return xx * (1 - wet) + y * wet
def mix(*xs):
    n = max(len(x) for x in xs); o = np.zeros(n)
    for x in xs: o[:len(x)] += x
    return o
def norm(x, peak=.89): m = np.abs(x).max() or 1; return x / m * peak
def place(buf, snd, t):
    i = int(t * SR); j = min(len(buf), i + len(snd))
    if j > i: buf[i:j] += snd[:j - i]
def save(name, x, br="64k", loop=False):
    x = norm(x, .85 if not loop else .6)
    if loop:  # fondu croisé pour boucler sans clic
        f = int(SR * 1.5); x[:f] = x[:f] * np.linspace(0, 1, f) + x[-f:] * np.linspace(1, 0, f); x = x[:-f]
    tmp = os.path.join(OUT, "_tmp.wav")
    with wave.open(tmp, "wb") as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", tmp, "-ac", "1", "-b:a", br, os.path.join(OUT, name + ".mp3")], check=True); os.remove(tmp)
    print(name, round(len(x) / SR, 2), "s")

# ── briques sonores ──
def metal(f0=420, d=1.2, v=1.):  # partiels inharmoniques d'une lame / d'une cloche de métal
    t = T(d); x = np.zeros_like(t)
    for r, a, dc in [(1, 1, 3), (2.76, .6, 4.5), (5.4, .4, 7), (8.93, .25, 9), (13.3, .15, 12)]:
        x += a * np.sin(2 * np.pi * f0 * r * t + rng.random() * 6) * np.exp(-t * dc / d * 1.6)
    return x * v
def thud(f=90, d=.35): t = T(d); return np.sin(2 * np.pi * f * t * (1 - t * .8)) * env(len(t), .002, d * .5, 5)
def whoosh(d=.28, lo=500, hi=4500): n = noise(d); e = np.sin(np.linspace(0, np.pi, len(n))) ** 2; return bp(n, lo, hi) * e
def crack(d=.05): n = noise(d); return hp(n, 1500) * env(len(n), .0005, .02, 6)
def drip(f=1400):
    t = T(.18); return np.sin(2 * np.pi * (f * (1 + 1.6 * np.exp(-t * 40))) * t) * env(len(t), .001, .06, 5)
def chirp(f=4600, n=3):  # grillon
    out = np.zeros(int(SR * .25))
    for k in range(n):
        t = T(.03); s = np.sin(2 * np.pi * f * t) * np.sin(np.pi * t / .03) ** 2; place(out, s * .7, k * .045)
    return out
def croak(f=110):  # crapaud : impulsions résonantes
    out = np.zeros(int(SR * .5))
    for k in range(rng.integers(3, 6)):
        t = T(.05); s = np.sin(2 * np.pi * f * t) * np.sign(np.sin(2 * np.pi * f * 2 * t)) * .5 * np.sin(np.pi * t / .05)
        place(out, bp(s, f * .8, f * 6), k * .07)
    return out
def caw():  # corbeau : bruit rauque modulé
    t = T(.38); f = 700 + 300 * np.sin(np.pi * t / .38); ph = np.cumsum(2 * np.pi * f / SR)
    s = np.sign(np.sin(ph)) * (.6 + .4 * np.sin(2 * np.pi * 37 * t)) + noise(.38) * .4
    return bp(s, 500, 2600) * np.sin(np.pi * t / .38) ** .6
def hoot():  # chouette
    t = T(.9); f = 380 * (1 - .06 * t); s = np.sin(np.cumsum(2 * np.pi * f / SR)) * (np.sin(np.pi * np.clip(t / .35, 0, 1)) + np.sin(np.pi * np.clip((t - .45) / .45, 0, 1)) * .8)
    return s * .6
def bell(f=196, d=4): return metal(f, d, 1) * .8
def fire(d):  # crépitement continu
    out = lp(noise(d), 500) * .5 * slow(int(SR * d), 1.5, .6)
    for k in range(int(d * 18)): place(out, crack(.04 + rng.random() * .05) * (.3 + rng.random() * .9), rng.random() * (d - .1))
    return out
def wind(d, lo=150, hi=900, rate=.25):
    n = noise(d); a = slow(len(n), rate, .9, .1); b = slow(len(n), rate * 1.7, .7, .2)
    return bp(n, lo, hi) * a + bp(n, hi * .8, hi * 2.2) * b * .35
def drone(d, f, partials=(1, 1.5, 2, 3)):
    t = T(d); x = sum(np.sin(2 * np.pi * f * p * t + p) / (i + 1) for i, p in enumerate(partials)); return x * slow(len(t), .1, .5, .5)

# ── ambiances de région (boucles de 40 s) ──
D = 41.5
def amb_bourg():
    x = wind(D, 120, 700, .2) * .55 + drone(D, 55) * .05
    for k in range(5): place(x, caw() * .35, 2 + rng.random() * (D - 4))
    place(x, reverb(bell(147, 5), 3, .6)[:SR * 6] * .25, 12); place(x, reverb(bell(147, 5), 3, .6)[:SR * 6] * .2, 31)
    for k in range(8): place(x, reverb(thud(70, .3), 1.5, .5)[:SR] * .12, rng.random() * (D - 1))  # volets qui claquent au loin
    return reverb(x, 1.8, .2)[:int(SR * D)]
def amb_foret():
    x = wind(D, 300, 2500, .35) * .35
    for k in range(70): place(x, chirp(4300 + rng.random() * 900) * .12, rng.random() * (D - .3))
    for k in range(3): place(x, reverb(hoot(), 2.5, .5)[:SR * 3] * .3, 4 + rng.random() * (D - 8))
    for k in range(40): place(x, crack(.03) * .2, rng.random() * (D - .1))  # brindilles
    return reverb(x, 2, .25)[:int(SR * D)]
def amb_catacombes():
    x = drone(D, 41, (1, 2, 2.5, 3.01)) * .12 + wind(D, 60, 300, .1) * .35
    for k in range(45): place(x, reverb(drip(1000 + rng.random() * 900), 3, .6)[:SR * 3] * .3, rng.random() * (D - 3))
    for k in range(4):  # chaînes
        c = np.zeros(int(SR * 1.2))
        for j in range(6): place(c, metal(900 + rng.random() * 400, .4, .25), j * .14 + rng.random() * .05)
        place(x, reverb(c, 3, .7)[:SR * 4] * .25, rng.random() * (D - 4))
    return reverb(x, 3.2, .45)[:int(SR * D)]
def amb_marais():
    x = lp(noise(D), 300) * .25 * slow(int(SR * D), .2, .5) + wind(D, 200, 1200, .25) * .2
    for k in range(40): place(x, croak(80 + rng.random() * 70) * .35, rng.random() * (D - .6))
    for k in range(60): place(x, chirp(5200 + rng.random() * 1200, 2) * .07, rng.random() * (D - .3))
    for k in range(25):  # bulles
        t = T(.08); place(x, np.sin(2 * np.pi * (300 + 900 * t / .08) * t) * env(len(t), .002, .05) * .25, rng.random() * (D - .1))
    return reverb(x, 2.2, .3)[:int(SR * D)]
def amb_citadelle():
    x = wind(D, 90, 600, .15) * .6 + fire(D) * .45 + drone(D, 49, (1, 1.5, 2)) * .06
    for k in range(3): place(x, reverb(metal(260, 2, .4), 3, .6)[:SR * 4] * .15, 5 + rng.random() * (D - 9))
    return reverb(x, 2.5, .35)[:int(SR * D)]
def amb_abime():
    x = drone(D, 36.7, (1, 1.33, 2, 2.67, 4)) * .2 + wind(D, 50, 250, .08) * .4
    for k in range(10):  # murmures : bruit formanté
        n = noise(1.6); s = bp(n, 600, 1400) * slow(len(n), 8, .9) * np.sin(np.linspace(0, np.pi, len(n))); place(x, reverb(s, 2.5, .7)[:int(SR * 3)] * .2, rng.random() * (D - 3))
    return reverb(x, 4, .55)[:int(SR * D)]
def amb_bastion():
    x = fire(D) * .5 + wind(D, 120, 600, .18) * .3
    for k in range(9):  # marteau sur l'enclume, au loin
        t0 = 3 + rng.random() * (D - 6)
        for j in range(3): place(x, reverb(mix(metal(1250, .6, .5), thud(120, .1)), 1.6, .5)[:SR * 2] * .14, t0 + j * .55)
    return reverb(x, 1.6, .2)[:int(SR * D)]

# ── bruitages ──
def fx_slash(): return whoosh(.24, 1200, 6000) * .8
def fx_hit():
    x = np.zeros(int(SR * .7)); place(x, thud(95, .25) * .9, 0); place(x, bp(noise(.08), 300, 3000) * env(int(SR * .08), .001, .04) * .8, 0); place(x, metal(520, .45, .25), .005)
    return reverb(x, .8, .15)
def fx_heavy():
    x = np.zeros(int(SR * 1)); place(x, whoosh(.18, 300, 2000) * .5, 0); place(x, thud(65, .45) * 1.2, .16); place(x, lp(noise(.3), 600) * env(int(SR * .3), .002, .15) * .6, .16)
    return reverb(x, 1.2, .2)
def fx_crit():
    x = np.zeros(int(SR * 1.4)); place(x, whoosh(.16, 1500, 7000) * .6, 0); place(x, metal(380, 1.1, .8), .14); place(x, thud(70, .4) * 1.1, .14)
    return reverb(x, 1.6, .3)
def fx_shoot():
    x = np.zeros(int(SR * .6)); place(x, thud(300, .05) * .5, 0); place(x, whoosh(.22, 2500, 8000) * .5, .02); return x
def fx_miss(): return whoosh(.3, 2000, 7000) * .5
def fx_fire():
    n = noise(.9); e = env(len(n), .03, .5, 3); x = lp(n, 900) * e + fire(.9) * .5 * e; return reverb(x, 1.5, .3)
def fx_holy():
    x = np.zeros(int(SR * 2.2))
    for i, f in enumerate([523, 659, 784, 1046]): t = T(1.8); place(x, np.sin(2 * np.pi * f * t) * env(len(t), .04, 1.2, 3) * .3, i * .06)
    place(x, bp(noise(1.5), 4000, 9000) * env(int(SR * 1.5), .3, 1, 3) * .15, 0)
    return reverb(x, 2.5, .5)
def fx_dark():
    t = T(1.2); x = np.sin(2 * np.pi * 55 * t * (1 - t * .2)) * env(len(t), .05, .8, 2) * .7 + bp(noise(1.2), 100, 600) * env(len(t), .1, .8, 2) * .6
    return reverb(x, 2.5, .5)
def fx_heal():
    x = np.zeros(int(SR * 1.6))
    for i, f in enumerate([392, 523, 659, 784]): t = T(1.1); place(x, np.sin(2 * np.pi * f * t) * env(len(t), .02, .7, 3) * .3, i * .09)
    place(x, bp(noise(1.2), 3000, 8000) * env(int(SR * 1.2), .2, .8, 3) * .12, 0); return reverb(x, 2, .45)
def fx_die():
    t = T(1.1); f = 140 * (1 - .5 * t / 1.1); s = np.sign(np.sin(np.cumsum(2 * np.pi * f / SR))) * .3 + noise(1.1) * .2
    return reverb(lp(s, 900) * env(len(t), .05, .8, 2), 2, .4)
def fx_coin():
    x = np.zeros(int(SR * .6)); place(x, metal(2400, .35, .6), 0); place(x, metal(3100, .3, .5), .07); return reverb(x, .8, .2)
def fx_door():
    x = lp(noise(1.2), 400) * env(int(SR * 1.2), .2, .7, 2) * .6
    t = T(1.0); creak = np.sign(np.sin(np.cumsum(2 * np.pi * (180 + 60 * np.sin(t * 9)) / SR))) * .15 * np.sin(np.pi * t)
    place(x, bp(creak, 200, 2000), 0); place(x, thud(60, .5) * .8, .9); return reverb(x, 2, .4)
def fx_forge():
    x = np.zeros(int(SR * 1.6)); place(x, metal(1250, 1.2, .8), 0); place(x, thud(140, .1) * .6, 0); place(x, bp(noise(.05), 2000, 8000) * .4, 0); return reverb(x, 1.5, .3)
def fx_step(): return lp(noise(.12), 500) * env(int(SR * .12), .003, .05, 5) * .7
def fx_bell(): return reverb(bell(196, 4) * .7, 3, .5)
def fx_open(): return reverb(mix(lp(noise(.5), 1200) * env(int(SR * .5), .05, .3, 3) * .4, thud(110, .2) * .3), 1, .3)

# ── version sombre (oct. 2026) : sons plus graves, plus organiques, sans arpèges « jouets » ──
def saw(f, d): t = T(d); ph = np.cumsum(2 * np.pi * np.broadcast_to(f, t.shape) / SR); return ((ph / np.pi) % 2 - 1)
def creak(d=.9, f0=90):  # bois qui grince
    t = T(d); f = f0 + 40 * np.sin(t * 7) + 25 * np.sin(t * 23); s = saw(f, d) * np.sin(np.pi * t / d) ** 2
    return bp(s, 200, 1800) * .25
def howl(d=3.2, f0=310):  # hurlement lointain
    t = T(d); f = f0 * (1 + .25 * np.sin(np.pi * t / d)) * (1 - .15 * t / d); x = np.sin(np.cumsum(2 * np.pi * f / SR)) + .3 * np.sin(np.cumsum(4 * np.pi * f / SR))
    return lp(x * np.sin(np.pi * t / d) ** 1.5, 1400) * .3
def choir(d, fs, att=.4):  # chœur grave : sinus désaccordés + souffle
    t = T(d); x = sum(np.sin(2 * np.pi * f * (1 + dv) * t) for f in fs for dv in (-.004, 0, .005)) / (3 * len(fs))
    br = bp(noise(d), 300, 1200) * .15; e = np.minimum(1, t / att) * np.minimum(1, (d - t) / (d * .5))
    return (x + br * slow(len(t), 3, .6, .4)) * e
def fx_slash(): x = whoosh(.26, 700, 4000) * .75; place(x, bp(noise(.12), 2500, 6000) * env(int(SR * .12), .002, .08) * .25, .06); return reverb(x, .7, .12)
def fx_hit():
    x = np.zeros(int(SR * .8)); place(x, thud(70, .3) * 1.1, 0); place(x, lp(noise(.12), 900) * env(int(SR * .12), .001, .07, 4) * .9, 0); place(x, metal(310, .35, .12), .004)
    return reverb(x, .9, .15)
def fx_heavy():
    x = np.zeros(int(SR * 1.2)); place(x, whoosh(.22, 200, 1400) * .5, 0); place(x, thud(48, .6) * 1.3, .18); place(x, lp(noise(.45), 400) * env(int(SR * .45), .002, .25) * .7, .18)
    return reverb(x, 1.5, .25)
def fx_crit():
    x = np.zeros(int(SR * 1.6)); place(x, whoosh(.18, 900, 5000) * .55, 0); place(x, thud(52, .55) * 1.3, .15); place(x, lp(noise(.2), 1200) * env(int(SR * .2), .001, .1) * .8, .15); place(x, metal(220, 1.2, .35), .15)
    return reverb(x, 1.9, .3)
def fx_shoot(): x = np.zeros(int(SR * .7)); place(x, thud(160, .06) * .6, 0); place(x, creak(.05, 220) * 2, 0); place(x, whoosh(.25, 1200, 5000) * .45, .02); return reverb(x, .6, .1)
def fx_miss(): return whoosh(.32, 900, 4000) * .45
def fx_fire(): n = noise(1.1); e = env(len(n), .05, .7, 2); x = lp(n, 600) * e * .9 + fire(1.1) * .4 * e; place(x, thud(55, .5) * .3, 0); return reverb(x, 1.8, .3)
def fx_holy(): x = choir(2.4, [146.8, 174.6, 220.0, 293.7], .5) * .9; place(x, reverb(bell(98, 3), 3, .5)[:int(SR * 2.4)] * .25, 0); return reverb(x, 3, .55)
def fx_dark():
    t = T(1.6); x = np.sin(2 * np.pi * 41 * t * (1 - t * .15)) * env(len(t), .1, 1, 2) * .8 + bp(noise(1.6), 80, 400) * env(len(t), .2, 1, 2) * .7
    place(x, howl(1.4, 140) * .5, .1); return reverb(x, 3, .55)
def fx_heal(): x = choir(1.8, [196.0, 233.1, 293.7], .35) * .8; place(x, bp(noise(1.2), 1500, 4000) * env(int(SR * 1.2), .3, .8, 3) * .06, .2); return reverb(x, 2.4, .5)
def fx_die():
    t = T(1.4); f = 110 * (1 - .55 * t / 1.4); s = lp(saw(f, 1.4), 700) * .5 + lp(noise(1.4), 500) * .35
    x = s * env(len(t), .03, 1, 2); place(x, thud(45, .6) * 1.2, .9); return reverb(x, 2.4, .45)
def fx_coin(): x = np.zeros(int(SR * .7)); place(x, lp(metal(1500, .3, .5), 3500), 0); place(x, lp(metal(1850, .3, .4), 3500), .08); place(x, thud(220, .05) * .2, .02); return reverb(x, 1, .25)
def fx_forge(): x = np.zeros(int(SR * 1.8)); place(x, metal(820, 1.2, .7), 0); place(x, thud(95, .15) * .8, 0); place(x, bp(noise(.06), 1500, 6000) * .35, 0); return reverb(x, 1.8, .35)
def fx_bell(): return reverb(bell(98, 5) * .8, 3.5, .55)
def amb_foret():
    x = wind(D, 150, 1500, .3) * .45 + drone(D, 46, (1, 1.5, 2)) * .05
    for k in range(9): place(x, reverb(creak(1 + rng.random(), 70 + rng.random() * 50), 2, .4)[:SR * 3] * .45, rng.random() * (D - 3))
    for k in range(2): place(x, reverb(howl(3 + rng.random(), 280 + rng.random() * 60), 3.5, .7)[:SR * 5] * .35, 4 + rng.random() * (D - 9))
    for k in range(2): place(x, reverb(hoot(), 2.5, .5)[:SR * 3] * .25, 4 + rng.random() * (D - 8))
    for k in range(25): place(x, crack(.03) * .15, rng.random() * (D - .1))
    return reverb(x, 2.4, .3)[:int(SR * D)]
def amb_marais():
    x = lp(noise(D), 220) * .3 * slow(int(SR * D), .15, .5) + wind(D, 120, 800, .2) * .25 + drone(D, 38, (1, 1.5, 2.01)) * .07
    for k in range(18): place(x, croak(60 + rng.random() * 40) * .3, rng.random() * (D - .6))
    for k in range(30):
        t = T(.12); place(x, lp(np.sin(2 * np.pi * (120 + 400 * t / .12) * t) * env(len(t), .003, .08), 800) * .3, rng.random() * (D - .2))
    for k in range(4): place(x, reverb(creak(1.2, 60), 2.5, .5)[:SR * 3] * .3, rng.random() * (D - 3))
    return reverb(x, 2.6, .35)[:int(SR * D)]
def amb_bastion():
    x = fire(D) * .45 + wind(D, 100, 500, .15) * .35 + drone(D, 49, (1, 1.5, 2)) * .04
    for k in range(7):
        t0 = 3 + rng.random() * (D - 6)
        for j in range(3): place(x, reverb(mix(metal(800, .6, .45), thud(95, .12)), 1.8, .5)[:SR * 2] * .12, t0 + j * .6)
    for k in range(2): place(x, reverb(bell(98, 5), 3.5, .6)[:SR * 6] * .12, 6 + rng.random() * (D - 12))
    return reverb(x, 1.8, .25)[:int(SR * D)]

if __name__ == "__main__":
    for k, f in [("bourg", amb_bourg), ("foret", amb_foret), ("catacombes", amb_catacombes), ("marais", amb_marais), ("citadelle", amb_citadelle), ("abime", amb_abime), ("bastion", amb_bastion)]:
        save("amb_" + k, f(), "48k", loop=True)
    for k in ["slash", "hit", "heavy", "crit", "shoot", "miss", "fire", "holy", "dark", "heal", "die", "coin", "door", "forge", "step", "bell", "open"]:
        save("fx_" + k, globals()["fx_" + k](), "64k")
