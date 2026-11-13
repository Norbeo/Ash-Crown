# Bruitages de combat « réalistes » (oct. 2026) : synthèse physique hors ligne, stéréo 44,1 kHz, plusieurs variantes par son.
# Lames (modes d'une barre d'acier), armures (plaques + mailles), chair et os, flèches, boucliers, chœurs à formants,
# cor de guerre et tambours, salle de pierre (réverbération à réflexions précoces).
# python3 audio/gen_combat.py   (depuis source/) → sfx/fx_<nom>_<n>.mp3
import numpy as np, subprocess, os, wave
from scipy import signal
SR = 44100
OUT = os.path.join(os.path.dirname(__file__), "..", "sfx")
rng = np.random.default_rng(1307)
T = lambda d: np.arange(int(SR * d)) / SR
N = lambda d: int(SR * d)

def noise(d): return rng.standard_normal(N(d))
def bp(x, lo, hi, o=2): b, a = signal.butter(o, [max(20, lo) / (SR / 2), min(hi, SR / 2 - 100) / (SR / 2)], "band"); return signal.lfilter(b, a, x)
def lp(x, f, o=2): b, a = signal.butter(o, min(f, SR / 2 - 100) / (SR / 2), "low"); return signal.lfilter(b, a, x)
def hp(x, f, o=2): b, a = signal.butter(o, f / (SR / 2), "high"); return signal.lfilter(b, a, x)
def reson(x, f, q):  # résonateur (pic étroit)
    b, a = signal.iirpeak(min(f, SR / 2 - 200) / (SR / 2), q); return signal.lfilter(b, a, x)
def ad(n, a=.002, d=.2, c=5.):
    t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) * c / max(d, 1e-3))
def buf(d): return np.zeros((N(d), 2))
def put(B, x, t=0., g=1., pan=0.):  # mono → stéréo (panoramique à puissance constante)
    i = int(t * SR); x = np.asarray(x)
    if x.ndim == 1: l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4); x = np.stack([x * l * 1.414, x * r * 1.414], 1)
    j = min(len(B), i + len(x))
    if j > i: B[i:j] += x[:j - i] * g
def sweep_bp(x, f0, f1, q=1.2, steps=24):  # filtre passe-bande qui glisse (effet Doppler d'une lame)
    out = np.zeros_like(x); n = len(x); seg = n // steps + 1
    for k in range(steps):
        a, b = k * seg, min(n, (k + 1) * seg + 256)
        if a >= n: break
        f = f0 * (f1 / f0) ** (k / max(1, steps - 1)); y = bp(x[max(0, a - 256):b], f / (1 + 1 / q), f * (1 + 1 / q))
        y = y[(a - max(0, a - 256)):]; w = np.ones(len(y)); out[a:a + len(y)] += y[:n - a] * w[:n - a]
    return out

# ── salle de pierre : réflexions précoces + queue diffuse, décorrélée gauche/droite ──
def hall_ir(rt=1.4, damp=4200, pre=.012):
    n = N(rt * 1.2); ir = np.zeros((n, 2))
    for ch in range(2):
        for _ in range(14):  # réflexions précoces sur les murs
            k = int((pre + rng.random() * .07) * SR); ir[k, ch] += (rng.random() * .6 + .2) * (1 if rng.random() > .3 else -1) * .5
        tail = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 6.9 / rt); tail[:int(pre * SR)] = 0
        ir[:, ch] += lp(tail, damp) * .09
    return ir / np.sqrt((ir ** 2).sum() / 2)
IR = {"hall": hall_ir(1.5), "crypt": hall_ir(2.6, 3000, .02), "small": hall_ir(.7, 6000, .006)}
def verb(B, wet=.22, kind="hall"):
    ir = IR[kind]; y = np.stack([signal.fftconvolve(B[:, c], ir[:, c]) for c in range(2)], 1)
    out = np.zeros_like(y); out[:len(B)] += B * (1 - wet * .5); out += y * wet * .55
    # fin naturelle : coupe quand le son est retombé
    e = np.abs(out).max(1); thr = e.max() * 10 ** (-58 / 20); idx = np.where(e > thr)[0]; end = (idx[-1] + N(.05)) if len(idx) else len(out)
    out = out[:end]; f = min(len(out), N(.08)); out[-f:] *= np.linspace(1, 0, f)[:, None]; return out

# ── matières ──
BAR = [1, 2.756, 5.404, 8.933, 13.344, 18.638]  # modes d'une barre libre (lame)
def blade(f0=520, d=1.6, v=1., bright=1.):  # lame d'acier frappée : modes inharmoniques, aigus qui meurent vite
    t = T(d); x = np.zeros_like(t)
    for i, r in enumerate(BAR):
        f = f0 * r * (1 + (rng.random() - .5) * .012)
        if f > SR / 2.2: break
        a = (.9 ** i) * (bright if i > 1 else 1) * (rng.random() * .4 + .8); dc = 2.2 + i * 2.8 + f / 2500
        beat = 1 + .25 * np.sin(2 * np.pi * (1.5 + rng.random() * 3) * t)  # légère battement (2 modes voisins)
        x += a * np.sin(2 * np.pi * f * t + rng.random() * 6) * np.exp(-t * dc) * beat
    hit = hp(noise(.006), 2000) * ad(N(.006), .0002, .003, 3) * 1.5
    x[:len(hit)] += hit; return x * v
def plate(f0=210, d=.7, n=22, v=1.):  # plaque d'armure : modes denses et courts
    t = T(d); x = np.zeros_like(t)
    for i in range(n):
        f = f0 * (1 + i * .9 + rng.random() * 1.8)
        if f > 9000: break
        x += np.sin(2 * np.pi * f * t + rng.random() * 6) * np.exp(-t * (9 + f / 300)) * (rng.random() * .7 + .3) / (1 + i * .15)
    return x * v
def chain(d=.25, dens=180, v=1.):  # mailles : centaines de petits chocs métalliques
    x = np.zeros(N(d))
    for _ in range(int(dens * d)):
        k = int(rng.random() ** 1.6 * (len(x) - 300)); f = 3000 + rng.random() * 5000; g = N(.004)
        x[k:k + g] += np.sin(2 * np.pi * f * np.arange(g) / SR) * np.exp(-np.arange(g) / SR * 1400) * (rng.random() * .8 + .2)
    return hp(x, 1800) * v
def body(d=.22, f=110, v=1.):  # impact sourd dans la chair : choc grave qui chute + masse humide
    t = T(d); thump = np.sin(2 * np.pi * np.cumsum(f * (1 - .55 * np.minimum(1, t / d))) / SR) * ad(len(t), .001, d * .35, 4)
    mass = lp(noise(d), 700) * ad(len(t), .0008, .05, 4) * .9
    wet = bp(noise(d), 500, 1800) * ad(len(t), .002, .07, 4) * (1 + np.sin(2 * np.pi * 37 * t)) * .25
    return (thump * 1.1 + mass + wet) * v
def bone(v=1.):  # craquement d'os : rafale de petits claquements + résonance sèche
    x = np.zeros(N(.12))
    for i in range(rng.integers(4, 8)):
        k = int((i * .006 + rng.random() * .004) * SR); c = hp(noise(.004), 2200) * ad(N(.004), .0001, .0015, 3) * (1 - i * .08)
        x[k:k + len(c)] += c
    return (x + reson(x, 1600 + rng.random() * 900, 6) * .6) * v
def flesh_cut(v=1.):  # lame qui entaille : déchirure + glissement
    d = .2; t = T(d); tear = bp(noise(d), 900, 4500) * ad(len(t), .001, .06, 3) * (1 + .8 * np.sin(2 * np.pi * 60 * t))
    return (tear * .7 + body(d, 140) * .7) * v
def whoosh(d=.3, f0=500, f1=2600, v=1., q=1.3):  # passage d'une arme : souffle qui monte (Doppler)
    x = noise(d); x = sweep_bp(x, f0, f1, q); e = np.sin(np.pi * np.minimum(1, T(d) / d)) ** 2.2; return x * e * v
def wood(f0=150, d=.35, v=1.):  # bois (bouclier, hampe) : modes amortis
    t = T(d); x = np.zeros_like(t)
    for r, a in [(1, 1), (2.32, .6), (3.9, .4), (5.3, .25)]:
        x += a * np.sin(2 * np.pi * f0 * r * t + rng.random()) * np.exp(-t * (18 + r * 12))
    return (x + lp(noise(d), 1500) * ad(len(t), .0005, .02, 4) * .8) * v
def string_pluck(f=130, d=.5):  # corde d'arc (Karplus-Strong)
    n = N(d); p = int(SR / f); y = np.zeros(n); y[:p] = rng.standard_normal(p) * .8
    for i in range(p, n): y[i] = .497 * (y[i - p] + y[i - p + 1]) if i - p + 1 < n else 0
    return lp(y, 2500) * ad(n, .0005, d * .4, 3)
def membrane(f=62, d=1.1, v=1.):  # tambour de guerre : modes d'une membrane + chute de hauteur
    t = T(d); x = np.zeros_like(t); fd = f * (1 + .25 * np.exp(-t * 18))
    for r, a, dc in [(1, 1, 4), (1.594, .5, 7), (2.136, .35, 9), (2.653, .2, 12)]:
        x += a * np.sin(2 * np.pi * np.cumsum(fd * r) / SR) * np.exp(-t * dc)
    return (x + lp(noise(d), 300) * ad(len(t), .001, .05, 4) * .6) * v
def saw(f, d, vib=0., vr=5.):
    t = T(d); fr = f * (1 + vib * np.sin(2 * np.pi * vr * t + rng.random() * 6)); ph = np.cumsum(fr / SR); return 2 * (ph % 1) - 1
VOW = {"a": [(800, 1, 80), (1150, .5, 90), (2900, .25, 120)], "o": [(450, 1, 70), (800, .45, 80), (2830, .1, 100)], "u": [(325, 1, 50), (700, .3, 60), (2530, .06, 100)], "e": [(400, 1, 60), (1600, .5, 80), (2700, .3, 100)]}
def voice(f, d, vow="a", vib=.006, breath=.12):  # voix chantée : source en dents de scie filtrée par les formants
    src = saw(f, d, vib, 4.8 + rng.random()) + noise(d) * breath; y = np.zeros(N(d))
    for F, g, bw in VOW[vow]: y += reson(src, F * (1 + (rng.random() - .5) * .04), F / bw) * g
    return y
def choir(chord, d, vow="a", att=.5, rel=.6, voices=4):
    t = T(d); x = np.zeros(N(d))
    for f in chord:
        for _ in range(voices): x += voice(f * (1 + (rng.random() - .5) * .008), d, vow)
    e = np.minimum(1, t / att) * np.minimum(1, np.maximum(0, d - t) / rel); return x * e / (len(chord) * voices) * 3
def horn(f=110, d=1.6, v=1.):  # cor de guerre : cuivre qui s'ouvre
    t = T(d); s = saw(f * (1 - .03 * np.exp(-t * 6)), d, .003, 5) + .5 * saw(f * 1.5, d, .003, 5.3)
    out = np.zeros(N(d)); seg = N(.02)
    env = np.minimum(1, t / .18) * np.minimum(1, np.maximum(0, d - t) / .5)
    for k in range(0, len(s), seg):  # filtre qui s'ouvre avec le souffle
        fc = 400 + 2200 * env[k] ** 1.5; y = lp(s[max(0, k - 400):k + seg], fc, 2); out[k:k + seg] = y[-len(out[k:k + seg]):]
    return out * env * v
def bell(f=147, d=5., v=1.):  # cloche de bronze (partiels de cloche d'église)
    t = T(d); x = np.zeros_like(t)
    for r, a, dc in [(.5, .6, .5), (1, 1, .8), (1.183, .5, 1.1), (1.506, .4, 1.4), (2, .35, 1.8), (2.514, .2, 2.4), (3.011, .15, 3)]:
        x += a * np.sin(2 * np.pi * f * r * t + rng.random()) * np.exp(-t * dc)
    st = hp(noise(.01), 1500) * .3 * ad(N(.01), .0002, .004, 3); x[:len(st)] += st; return x * v
def rumble(d=1., v=1.): return lp(noise(d), 120, 3) * np.sin(np.pi * np.minimum(1, T(d) / d)) * v
def crackle(d=1., dens=60, v=1.):
    x = np.zeros(N(d))
    for _ in range(int(dens * d)):
        k = rng.integers(0, len(x) - 200); c = hp(noise(.003), 1500) * ad(N(.003), .0001, .001, 3) * rng.random()
        x[k:k + len(c)] += c
    return x * v
def whisper(d=1.2, v=1.):  # chuchotements : bruit filtré par des formants qui changent
    x = np.zeros(N(d)); seg = N(.09)
    for k in range(0, len(x), seg):
        vw = VOW[rng.choice(list(VOW))]; n = noise(.09 + .02)[:min(seg, len(x) - k)]; y = np.zeros_like(n)
        for F, g, bw in vw: y += reson(n, F * 1.1, F / bw) * g
        x[k:k + len(y)] = y * np.hanning(len(y))
    return hp(x, 300) * v
def bubbles(d=.8, n=14, v=1.):
    x = np.zeros(N(d))
    for _ in range(n):
        k = rng.integers(0, len(x) - N(.06)); f = 250 + rng.random() * 700; t = T(.05)
        x[k:k + len(t)] += np.sin(2 * np.pi * np.cumsum(f * (1 + 3 * t / .05)) / SR) * np.exp(-t * 60) * rng.random()
    return x * v
def reverse_swell(d=1., v=1.):
    x = lp(noise(d), 3000) * np.linspace(0, 1, N(d)) ** 3; return x * v

# ── bruitages (chaque fonction renvoie une variante ; appelée plusieurs fois) ──
def fx_slash():  # attaque à l'arme : élan
    B = buf(.55); p = rng.uniform(-.4, .4)
    put(B, whoosh(rng.uniform(.22, .32), rng.uniform(350, 600), rng.uniform(2000, 3600), .9), 0, 1, p)
    put(B, chain(.18, 90, .12), .02, 1, -p); return verb(B, .14, "small")
def fx_hit():  # coup porté : lame sur armure, ou dans la chair
    B = buf(1.4); k = rng.integers(0, 3)
    if k == 0:  # lame contre plaque
        put(B, blade(rng.uniform(380, 640), 1.2, .55, .8), 0, 1, rng.uniform(-.3, .3)); put(B, plate(rng.uniform(170, 260), .45, v=.7), 0); put(B, body(.18, 95, .6), .002); put(B, chain(.22, 160, .35), .01)
    elif k == 1:  # entaille
        put(B, flesh_cut(1.1), 0); put(B, chain(.25, 140, .3), .01, 1, .3); put(B, blade(rng.uniform(600, 900), .5, .12), 0)
    else:  # coup sourd dans le flanc + maille
        put(B, body(.25, rng.uniform(85, 120), 1.2), 0); put(B, chain(.3, 220, .45), .005); put(B, plate(300, .3, v=.35), 0)
    return verb(B, .2)
def fx_heavy():  # coup d'une créature massive : souffle énorme, choc, sol qui tremble
    B = buf(2.2); put(B, whoosh(.38, 160, 900, .8, 1.), 0)
    put(B, body(.5, rng.uniform(48, 60), 1.4), .3); put(B, bone(.6), .3); put(B, plate(150, .6, v=.6), .3); put(B, chain(.4, 200, .4), .31)
    put(B, rumble(1.2, 1.1), .3); put(B, crackle(.6, 50, .4), .35, 1, .5); return verb(B, .28)
def fx_crit():  # coup critique : élan, choc acier, os qui cède, réverbération longue
    B = buf(2.4); p = rng.uniform(-.3, .3)
    put(B, whoosh(.24, 300, 3800, .9), 0, 1, p)
    put(B, blade(rng.uniform(300, 420), 1.8, .9, 1.1), .2, 1, -p); put(B, body(.35, 70, 1.3), .2); put(B, bone(1.), .205); put(B, plate(190, .5, v=.6), .2)
    put(B, chain(.35, 220, .5), .21); put(B, rumble(.8, .6), .2); return verb(B, .34)
def fx_shoot():  # arc / arbalète : corde, sifflement, impact
    B = buf(1.1); put(B, string_pluck(rng.uniform(110, 160), .45) * 1.2, 0); put(B, wood(260, .08, .4), 0)
    put(B, whoosh(.3, 1800, 5200, .55, 3.), .03, 1, .5); put(B, wood(rng.uniform(140, 200), .25, .8), .34, 1, .6); put(B, body(.15, 120, .5), .34, 1, .6)
    return verb(B, .16)
def fx_miss():  # esquive : la lame fend l'air
    B = buf(.7); put(B, whoosh(.34, 700, 3200, .7, 1.6), 0, 1, rng.uniform(-.6, .6)); put(B, chain(.2, 60, .1), .1); return verb(B, .14)
def fx_block():  # coup paré au bouclier
    B = buf(1.3); put(B, wood(rng.uniform(120, 170), .4, 1.1), 0); put(B, blade(rng.uniform(700, 1000), .9, .35), 0, 1, .3); put(B, plate(260, .35, v=.4), 0)
    return verb(B, .2)
def fx_fire():  # embrasement : ignition, souffle, crépitement
    B = buf(2.); d = 1.6; t = T(d)
    roar = lp(noise(d), 700, 3) * (1 + .5 * np.sin(2 * np.pi * 7 * t) * rng.random()) * np.minimum(1, t / .08) * np.exp(-t * 1.6)
    put(B, whoosh(.4, 200, 1500, .8, 1.), 0); put(B, roar * 1.1, .05); put(B, crackle(1.4, 90, .6), .1, 1, .3); put(B, crackle(1.2, 70, .5), .15, 1, -.3)
    return verb(B, .25)
def fx_holy():  # lumière sacrée : chœur à l'unisson + cloche lointaine
    B = buf(4.); ch = rng.choice([[146.8, 220., 293.7], [130.8, 196., 261.6], [164.8, 246.9, 329.6]])
    x = choir(ch, 2.8, "a", .6, 1.2); put(B, x * .9, 0, 1, -.15); put(B, choir([c * 2 for c in ch[:2]], 2.6, "o", .7, 1.1, 3) * .35, .1, 1, .2)
    put(B, bell(ch[0], 3.5, .35), .05); put(B, hp(noise(2.5), 6000) * np.sin(np.pi * T(2.5) / 2.5) * .04, .2)
    return verb(B, .45, "crypt")
def fx_heal():  # soin : chœur doux + souffle chaud + cristal
    B = buf(3.2); ch = rng.choice([[196., 293.7], [174.6, 261.6], [220., 329.6]])
    put(B, choir(ch, 2.2, "o", .45, 1., 3) * .9, 0); t = T(1.8)
    shimmer = sum(np.sin(2 * np.pi * f * t + rng.random()) * np.exp(-t * (1.2 + i * .4)) for i, f in enumerate([ch[0] * 4, ch[0] * 6, ch[0] * 8.02]))
    put(B, shimmer * np.minimum(1, t / .15) * .06, .25, 1, .4); put(B, bp(noise(1.5), 800, 2500) * np.sin(np.pi * T(1.5) / 1.5) * .05, .1)
    return verb(B, .45, "crypt")
def fx_buff():  # renforcement : cor de guerre, tambours, armures qui se resserrent
    B = buf(2.8); f = rng.choice([98., 110., 87.3])
    put(B, membrane(rng.uniform(55, 70), 1.0, .9), 0, 1, -.2); put(B, membrane(rng.uniform(55, 70), 1.0, .8), .32, 1, .2)
    put(B, horn(f, 1.5, .55), .3, 1, 0); put(B, chain(.4, 160, .35), .05); put(B, plate(220, .3, v=.25), .05)
    return verb(B, .35)
def fx_debuff():  # malédiction : cordes graves dissonantes qui descendent + chuchotements
    B = buf(2.4); d = 1.8; t = T(d); x = np.zeros(N(d))
    for f in [73.4, 77.8, 110.]: x += lp(saw(f * (1 - .06 * t / d), d, .004, 6.5), 900) * (1 + .4 * np.sin(2 * np.pi * 9 * t))
    put(B, x * np.minimum(1, t / .3) * np.minimum(1, (d - t) / .6) * .22, 0); put(B, whisper(1.6, .35), .1, 1, .4)
    return verb(B, .4, "crypt")
def fx_dark():  # magie des ténèbres : aspiration inversée, grondement, voix
    B = buf(3.); put(B, reverse_swell(.7, .6), 0); d = 2.; t = T(d)
    growl = lp(noise(d), 260) * (1 + np.sin(2 * np.pi * 31 * t)) * np.minimum(1, t / .05) * np.exp(-t * 1.3)
    sub = np.sin(2 * np.pi * np.cumsum(46 * (1 - .2 * t / d)) / SR) * np.minimum(1, t / .03) * np.exp(-t * 1.2)
    put(B, growl * .9 + sub * .9, .7); put(B, whisper(1.6, .45), .65, 1, -.4); put(B, choir([61.7, 92.5], 1.6, "u", .2, .8, 3) * .5, .7)
    return verb(B, .45, "crypt")
def fx_poison():  # poison : bouillonnement, sifflement acide
    B = buf(1.6); put(B, bubbles(.9, 16, .5), 0, 1, -.2); put(B, bp(noise(1.), 3000, 8000) * np.sin(np.pi * T(1.) / 1.) * .1, .05, 1, .3)
    put(B, body(.15, 160, .3), 0); return verb(B, .25)
def fx_bleed():  # saignement : déchirure humide
    B = buf(1.); put(B, flesh_cut(.8), 0); d = T(.03)
    for k in range(3): put(B, np.sin(2 * np.pi * (900 + 400 * k) * d * (1 + d * 30)) * np.exp(-d * 120) * .25, .15 + k * .12 + rng.random() * .05)
    return verb(B, .22)
def fx_die():  # ennemi abattu : chute du corps, armure qui s'écrase
    B = buf(2.4); put(B, body(.5, 58, 1.3), 0); put(B, rumble(.6, .5), 0)
    for k in range(rng.integers(3, 6)): put(B, plate(rng.uniform(160, 320), .3, v=.35 * (1 - k * .15)), .05 + k * rng.uniform(.06, .12), 1, rng.uniform(-.5, .5))
    put(B, chain(.5, 150, .35), .03); put(B, lp(noise(.6), 600) * ad(N(.6), .05, .3, 3) * .25, .4)
    return verb(B, .3)
def fx_fall():  # héros tombé : chute, puis une note funèbre
    B = buf(3.6); put(B, body(.5, 55, 1.2), 0); put(B, chain(.5, 160, .35), .02)
    for k in range(3): put(B, plate(rng.uniform(180, 260), .35, v=.3), .08 + k * .1)
    put(B, bell(98, 3., .3), .35); put(B, choir([98., 116.5], 2.4, "u", .4, 1.2, 3) * .4, .4)
    return verb(B, .42, "crypt")
def fx_stun():  # étourdi : casque qui sonne, acouphène
    B = buf(1.8); put(B, plate(330, .6, v=.8), 0); put(B, blade(900, 1.2, .25), 0); put(B, body(.2, 90, .8), 0); t = T(1.4)
    put(B, np.sin(2 * np.pi * 3100 * t) * np.minimum(1, t / .2) * np.exp(-t * 2) * .05, .1); return verb(B, .25)
def fx_ult():  # ultime : montée, chœur, impact colossal
    B = buf(4.); put(B, reverse_swell(1.1, .7), 0); put(B, choir([73.4, 110., 146.8], 1.6, "a", .9, .3) * .6, 0)
    put(B, membrane(48, 1.4, 1.2), 1.1); put(B, body(.6, 45, 1.4), 1.1); put(B, blade(260, 2.2, .7), 1.1); put(B, rumble(1.6, 1.1), 1.1); put(B, chain(.5, 240, .5), 1.12)
    put(B, horn(73.4, 1.8, .4), 1.15); return verb(B, .4, "crypt")

FX = ["slash", "hit", "heavy", "crit", "shoot", "miss", "block", "fire", "holy", "heal", "buff", "debuff", "dark", "poison", "bleed", "die", "fall", "stun", "ult"]
VAR = {"hit": 4, "slash": 3, "miss": 2, "crit": 2, "shoot": 2, "block": 2, "heavy": 2, "die": 2}

def save(name, B):
    m = np.abs(B).max() or 1; B = B / m * .92
    tmp = os.path.join(OUT, "_t.wav")
    with wave.open(tmp, "wb") as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(B, -1, 1) * 32767).astype(np.int16).tobytes())
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", tmp, "-af", "loudnorm=I=-16:TP=-1.0:LRA=11", "-ar", "44100", "-b:a", "96k", os.path.join(OUT, name + ".mp3")], check=True); os.remove(tmp)
    print(name, round(len(B) / SR, 2), "s")

if __name__ == "__main__":
    import sys
    only = sys.argv[1:]
    for k in FX:
        if only and k not in only: continue
        for i in range(VAR.get(k, 1)): save(f"fx_{k}_{i + 1}", globals()["fx_" + k]())
