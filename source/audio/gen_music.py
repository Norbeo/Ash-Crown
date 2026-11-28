# Musique par chapitre : une pièce sombre et lente composée par région (cordes graves, chœur, cloches, harpe, tambour)
# mêlée à l'ambiance enregistrée de la région, en boucle sans couture (même durée que l'ambiance d'origine).
# Les ambiances d'origine sont gardées dans audio/amb_src/ ; la sortie remplace sfx/amb_<région>.mp3.
# python3 audio/gen_music.py [régions…]   (depuis source/)
import os, sys, subprocess, shutil
import numpy as np
from scipy.signal import fftconvolve, lfilter

SR = 32000
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC, OUT = os.path.join(D, "audio", "amb_src"), os.path.join(D, "sfx")
os.makedirs(SRC, exist_ok=True)

MODES = {"aeo": [0, 2, 3, 5, 7, 8, 10], "phr": [0, 1, 3, 5, 7, 8, 10], "dor": [0, 2, 3, 5, 7, 9, 10], "har": [0, 2, 3, 5, 7, 8, 11], "loc": [0, 1, 3, 5, 6, 8, 10]}
# root (Hz), mode, progression (degrés), instruments : s cordes, c chœur, b cloches, h harpe, d tambour, o orgue ; br brillance ; mv volume de la musique
R = {
  "bastion":     dict(root=110.0, mode="aeo", prog=[0, 5, 3, 4], s=1, c=.5, b=.3, h=.6, d=0, o=0, br=1.0, mv=.75),
  "bourg":       dict(root=103.8, mode="aeo", prog=[0, 3, 5, 4], s=.9, c=.3, b=.5, h=.4, d=0, o=0, br=.9, mv=.7),
  "foret":       dict(root=98.0, mode="dor", prog=[0, 6, 3, 4], s=.8, c=.4, b=0, h=.8, d=0, o=0, br=.8, mv=.7),
  "catacombes":  dict(root=87.3, mode="phr", prog=[0, 1, 0, 6], s=.7, c=.9, b=.4, h=0, d=.3, o=.3, br=.7, mv=.7),
  "marais":      dict(root=92.5, mode="aeo", prog=[0, 5, 6, 4], s=.8, c=.5, b=0, h=.5, d=.2, o=0, br=.6, mv=.65),
  "citadelle":   dict(root=82.4, mode="har", prog=[0, 5, 1, 4], s=1, c=.7, b=.4, h=0, d=.6, o=.4, br=.9, mv=.75),
  "abime":       dict(root=73.4, mode="loc", prog=[0, 1, 4, 0], s=.6, c=.8, b=.5, h=0, d=.3, o=.5, br=.6, mv=.7),
  "terres":      dict(root=87.3, mode="har", prog=[0, 3, 4, 5], s=1, c=.4, b=.2, h=0, d=.7, o=0, br=1.0, mv=.72),
  "cimes":       dict(root=116.5, mode="aeo", prog=[0, 2, 5, 4], s=.9, c=.6, b=.7, h=.3, d=0, o=0, br=1.2, mv=.7),
  "cite":        dict(root=92.5, mode="dor", prog=[0, 3, 6, 4], s=.7, c=.6, b=.6, h=.5, d=0, o=0, br=.7, mv=.68),
  "mines":       dict(root=77.8, mode="phr", prog=[0, 1, 5, 4], s=.8, c=.3, b=.6, h=0, d=.6, o=0, br=.8, mv=.7),
  "trone":       dict(root=82.4, mode="har", prog=[0, 5, 3, 4], s=1, c=.9, b=.5, h=0, d=.5, o=.6, br=1.0, mv=.75),
  "racines":     dict(root=73.4, mode="dor", prog=[0, 6, 5, 4], s=.8, c=.4, b=0, h=.6, d=.3, o=0, br=.6, mv=.7),
  "sel":         dict(root=98.0, mode="phr", prog=[0, 1, 3, 1], s=.7, c=.5, b=.4, h=.4, d=.3, o=0, br=1.1, mv=.68),
  "pendus":      dict(root=87.3, mode="aeo", prog=[0, 5, 3, 6], s=.9, c=.5, b=.7, h=0, d=.2, o=0, br=.8, mv=.7),
  "monastere":   dict(root=82.4, mode="dor", prog=[0, 3, 0, 4], s=.4, c=1, b=.6, h=0, d=0, o=.8, br=.8, mv=.72),
  "echo":        dict(root=103.8, mode="aeo", prog=[0, 2, 5, 6], s=.6, c=.6, b=.8, h=.5, d=0, o=0, br=1.0, mv=.68),
  "mer_cendres": dict(root=77.8, mode="aeo", prog=[0, 5, 6, 4], s=1, c=.5, b=.2, h=.3, d=.4, o=0, br=.7, mv=.7),
  "cathedrale":  dict(root=73.4, mode="har", prog=[0, 5, 1, 4], s=.6, c=1, b=.6, h=0, d=.2, o=1, br=.9, mv=.75),
  "jardin_os":   dict(root=98.0, mode="loc", prog=[0, 1, 3, 4], s=.7, c=.4, b=.5, h=.7, d=0, o=0, br=.9, mv=.68),
  "faille":      dict(root=69.3, mode="loc", prog=[0, 4, 1, 0], s=.7, c=.7, b=.9, h=.3, d=0, o=.3, br=1.1, mv=.7),
  "coeur":       dict(root=65.4, mode="har", prog=[0, 5, 1, 4], s=1, c=.8, b=.3, h=0, d=.9, o=.5, br=.8, mv=.75),
}
rng = np.random.default_rng(7)

def note(root, mode, deg, octv=0):
    sc = MODES[mode]; o, d = divmod(deg, 7)
    return root * 2 ** ((sc[d] + 12 * (o + octv)) / 12)

def chord(root, mode, deg):
    return [note(root, mode, deg), note(root, mode, deg + 2), note(root, mode, deg + 4), note(root, mode, deg, 1)]

def env(n, a, r):
    e = np.ones(n); na, nr = int(a * SR), int(r * SR)
    if na: e[:na] = np.linspace(0, 1, na) ** 1.5
    if nr: e[-nr:] *= np.linspace(1, 0, nr) ** 1.5
    return e

def lowpass(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); return lfilter([1 - a], [1, -a], x)

def saw(f, n, ph=0):
    t = np.arange(n) / SR; vib = 1 + .0025 * np.sin(2 * np.pi * (4.6 + rng.random()) * t + rng.random() * 6)
    p = (np.cumsum(f * vib) / SR + ph) % 1.0; return 2 * p - 1

def strings(freqs, dur, br):
    n = int(dur * SR); out = np.zeros(n)
    for f in freqs:
        for det in (-.004, 0, .0035):
            out += saw(f * (1 + det), n, rng.random()) * .25
    out = lowpass(lowpass(out, 650 * br), 1400 * br)
    return out * env(n, min(1.8, dur * .4), min(1.6, dur * .4)) / len(freqs)

VOW = {"a": [(700, 1.0, 110), (1220, .5, 120), (2600, .25, 160)], "o": [(450, 1.0, 100), (800, .45, 110), (2830, .1, 170)], "u": [(325, 1.0, 90), (700, .3, 100), (2530, .05, 160)]}
def choir(freqs, dur, vowel="o"):
    n = int(dur * SR); t = np.arange(n) / SR; out = np.zeros(n); F = VOW[vowel]
    for f in freqs:
        for voice in range(3):
            fv = f * (1 + (voice - 1) * .006); vib = np.sin(2 * np.pi * (5.2 + voice * .3) * t + voice) * .006
            ph = 2 * np.pi * np.cumsum(fv * (1 + vib)) / SR
            for k in range(1, 28):
                hk = fv * k
                if hk > 4000: break
                amp = sum(g * np.exp(-((hk - fc) / bw) ** 2 / 2) for fc, g, bw in F) + .02 / k
                out += amp * np.sin(k * ph + voice) / k ** .3
    out *= env(n, min(2.2, dur * .45), min(2.0, dur * .45))
    return out / (len(freqs) * 6)

def organ(freqs, dur):
    n = int(dur * SR); t = np.arange(n) / SR; out = np.zeros(n)
    for f in freqs:
        for k, a in ((.5, .6), (1, 1), (2, .5), (3, .25), (4, .2)):
            out += a * np.sin(2 * np.pi * f * k * t)
    return lowpass(out, 1800) * env(n, .6, 1.2) / (len(freqs) * 3)

def bell(f, dur=4.0):
    n = int(dur * SR); t = np.arange(n) / SR; out = np.zeros(n)
    for r, a, dc in ((1, 1, 1.1), (2.76, .5, 1.8), (5.40, .3, 2.6), (8.93, .15, 3.5), (.5, .4, .8)):
        out += a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * dc)
    return out * np.minimum(1, t / .004) * .35

def harp(f, dur=3.0):
    n = int(dur * SR); N = max(2, int(SR / f)); buf = rng.uniform(-1, 1, N); out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % N]; buf[i % N] = .497 * (buf[i % N] + buf[(i + 1) % N])
    return lowpass(out, 2400) * .5

def drum(dur=1.4):
    n = int(dur * SR); t = np.arange(n) / SR; f = 38 + 30 * np.exp(-t * 18)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.2) * .9 + lowpass(rng.normal(0, 1, n), 300) * np.exp(-t * 30) * .3

def reverb(x, secs=3.2, wet=.35):
    n = int(secs * SR); t = np.arange(n) / SR
    ir = rng.normal(0, 1, n) * np.exp(-t * 6.9 / secs); ir = lowpass(ir, 3000); ir /= np.sqrt(np.sum(ir ** 2))
    return x * (1 - wet) + fftconvolve(x, ir)[:len(x)] * wet * 1.4

def put(buf, x, at):
    i = int(at * SR); L = len(buf)
    j = i % L; m = min(len(x), L - j); buf[j:j + m] += x[:m]
    if m < len(x): buf[:len(x) - m] += x[m:]  # enroulement : boucle sans couture

def compose(name, P, total):
    L = int(total * SR); mus = np.zeros(L); bars = 24; bar = total / bars; beat = bar / 4
    root, mode, prog = P["root"], P["mode"], P["prog"]
    for b in range(bars):
        deg = prog[(b // 2) % len(prog)]
        t0 = b * bar
        if b % 2 == 0:  # un accord tient 2 mesures
            ch = chord(root, mode, deg)
            if P["s"]: put(mus, strings(ch[:3], bar * 2 + 1.2, P["br"]) * P["s"], t0)
            if P["s"]: put(mus, strings([ch[0] / 2], bar * 2 + 1.2, P["br"] * .8) * P["s"] * .7, t0)
            if P["c"] and (b // 2) % 2 == 0: put(mus, choir([ch[0] * 2, ch[1] * 2, ch[2] * 2], bar * 2 + 1.5, "o" if (b // 4) % 2 else "a") * P["c"], t0 + .2)
            if P["o"]: put(mus, organ(ch[:3], bar * 2 + .8) * P["o"], t0)
        if P["d"]:  # battement lent : temps 1 (et 3 sur les mesures paires)
            put(mus, drum() * P["d"], t0)
            if b % 2: put(mus, drum() * P["d"] * .6, t0 + 2 * beat)
        if P["h"] and b % 4 in (1, 3):  # arpège de harpe
            ch = chord(root, mode, deg)
            for k, f in enumerate([ch[0] * 2, ch[1] * 2, ch[2] * 2, ch[3] * 2]):
                put(mus, harp(f) * P["h"] * .55, t0 + k * beat * .5 + rng.random() * .03)
        if P["b"] and b % 4 == 2:  # motif de cloche : 3 notes descendantes dans le mode
            top = 4 + deg
            for k, d in enumerate([top + 4, top + 2, top]):
                put(mus, bell(note(root, mode, d, 2)) * P["b"] * .5, t0 + k * beat * 1.5)
    mus = reverb(mus, 3.4, .38)
    mus /= np.max(np.abs(mus)) + 1e-9
    return mus

def load_mp3(f):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", f, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)

def main(names):
    for name in names:
        P = R[name]; orig = os.path.join(OUT, "amb_%s.mp3" % name); keep = os.path.join(SRC, "amb_%s.mp3" % name)
        if not os.path.exists(keep):
            if not os.path.exists(orig): print("absent", name); continue
            shutil.copy(orig, keep)
        amb = load_mp3(keep); total = len(amb) / SR
        mus = compose(name, P, total)
        st = np.stack([np.roll(mus, 0), np.roll(mus, int(.011 * SR))], 1)  # léger élargissement stéréo
        mix = amb * .6 + st * P["mv"] * .62
        mix /= max(1.0, np.max(np.abs(mix)) / .95)
        pcm = (np.clip(mix, -1, 1) * 32767).astype("<i2").tobytes()
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "2", "-i", "-", "-b:a", "64k", orig], input=pcm, check=True)
        print("ok", name, round(total, 1), "s")

if __name__ == "__main__":
    main(sys.argv[1:] or list(R.keys()))
