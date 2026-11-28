#!/usr/bin/env python3
"""Cartes du monde composées à partir des illustrations des chapitres.
Chaque chapitre devient une région de la carte : son propre décor (bg_<id>) découpé en île aux bords fondus,
posée à son emplacement le long d'une route en serpentin. Deux cartes : A « Le Royaume » (I–X + l'Abîme), B « L'Envers » (XI–XX),
chacune en version large (écran PC / paysage) et en hauteur (téléphone).
La route est tracée par le jeu (or plein = parcourue).
Sorties : assets/bg_wmap_a.webp, bg_wmap_a_t.webp, bg_wmap_b.webp, bg_wmap_b_t.webp + art/wmap.json (positions, lues par le jeu).
Relancé par build.sh : une région n'apparaît que si son décor est peint (les autres restent dans la brume)."""
import json, math, os, random
import numpy as np
from PIL import Image, ImageFilter, ImageDraw

D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A_IDS = ["bourg", "foret", "catacombes", "marais", "citadelle", "abime", "terres", "cimes", "cite", "mines", "trone"]
B_IDS = ["racines", "sel", "pendus", "monastere", "echo", "mer_cendres", "cathedrale", "jardin_os", "faille", "coeur"]


def slots(ids, tall):
    """Positions (fractions 0–1) le long d'un serpentin ; l'Abîme sur le tournant entre V et VI (carte large)."""
    P = {}
    main = [i for i in ids if i != "abime"]
    if not tall:
        xs = [.1, .29, .48, .67, .86] if "abime" not in ids else [.085, .26, .435, .61, .785]
        for k, r in enumerate(main):
            row, c0 = divmod(k, 5)
            c = 4 - c0 if row else c0
            wave = (.06 if c % 2 else -.05) * (-1 if row else 1)
            P[r] = [xs[c], (.73 if row else .27) + wave]
        if "abime" in ids:
            P["abime"] = [.93, .5]
    else:
        L = ids
        rows = math.ceil(len(L) / 2)
        for k, r in enumerate(L):
            row = k // 2
            c = (1 - k % 2) if row % 2 else k % 2
            P[r] = [.71 if c else .29, (row + .5) / rows]
    return P


def noise(w, h, seed, scales=((8, .5), (24, .3), (80, .2))):
    rng = np.random.default_rng(seed)
    out = np.zeros((h, w), np.float32)
    for s, a in scales:
        n = rng.random((max(2, h // s), max(2, w // s))).astype(np.float32)
        out += a * np.asarray(Image.fromarray((n * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC), np.float32) / 255
    return out


def base(w, h, seed, tint):
    """Fond : terre sombre et parchemin brûlé, grain, vignette."""
    n = noise(w, h, seed)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    v = 1 - .75 * (((xx / w - .5) ** 2) * 1.6 + ((yy / h - .5) ** 2) * 1.6)
    v = np.clip(v, .15, 1)
    t = np.array(tint, np.float32)
    img = (t[None, None, :] * (.55 + .7 * n[..., None])) * v[..., None]
    g = noise(w, h, seed + 7, ((2, .6), (5, .4)))
    img *= (.85 + .3 * g[..., None])
    return np.clip(img, 0, 255)


def blob(w, h, cx, cy, rx, ry, seed):
    """Masque d'île : rayon bruité en polaire, bords fondus."""
    rnd = random.Random(seed)
    harm = [(k, rnd.uniform(.03, .09) / (k ** .35), rnd.uniform(0, 6.28)) for k in range(2, 8)]
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    dx, dy = (xx - cx) / rx, (yy - cy) / ry
    th = np.arctan2(dy, dx)
    r = np.sqrt(dx * dx + dy * dy)
    lim = 1 + sum(a * np.sin(k * th + p) for k, a, p in harm)
    edge = noise(w, h, seed + 3, ((6, .6), (18, .4))) - .5
    m = np.clip((lim + .12 * edge - r) / .14, 0, 1)
    m = np.asarray(Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(9)), np.float32) / 255
    return m


def cover(img, w, h, fx=.5, fy=.55):
    iw, ih = img.size
    s = max(w / iw, h / ih)
    im = img.resize((max(1, int(iw * s + 1)), max(1, int(ih * s + 1))), Image.LANCZOS)
    x0 = int((im.width - w) * fx)
    y0 = int((im.height - h) * fy)
    return im.crop((x0, y0, x0 + w, y0 + h))


def compose(ids, tall, out, seed, tint):
    W, H = (1300, 2900 if len(ids) > 10 else 2650) if tall else (2400, 1350)
    if tall:
        H = int(1300 * math.ceil(len(ids) / 2) * .42)
    P = slots(ids, tall)
    img = base(W, H, seed, tint)
    acc = np.zeros((H, W), np.float32)
    drawn = {}
    for i, r in enumerate(ids):
        f = os.path.join(D, "assets", "bg_%s.webp" % r)
        if not os.path.exists(f):
            continue
        cx, cy = P[r][0] * W, P[r][1] * H
        if tall:
            rx, ry = W * .3, H / math.ceil(len(ids) / 2) * .62
        else:
            rx, ry = (W * .118, H * .26) if r != "abime" else (W * .07, H * .2)
        m = blob(W, H, cx, cy, rx, ry, seed * 31 + i)
        x0, y0, x1, y1 = int(max(0, cx - rx * 1.3)), int(max(0, cy - ry * 1.3)), int(min(W, cx + rx * 1.3)), int(min(H, cy + ry * 1.3))
        bw, bh = x1 - x0, y1 - y0
        src = Image.open(f).convert("RGB")
        z = np.asarray(cover(src, bw, bh), np.float32)
        mm = m[y0:y1, x0:x1]
        # bords plus sombres (encre), cœur lumineux
        core = np.asarray(Image.fromarray((mm * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(28)), np.float32) / 255
        z = z * (.45 + .6 * core[..., None])
        a = mm[..., None]
        img[y0:y1, x0:x1] = img[y0:y1, x0:x1] * (1 - a) + z * a
        acc[y0:y1, x0:x1] = np.maximum(acc[y0:y1, x0:x1], mm)
        drawn[r] = 1
    # liseré d'encre autour des régions
    ring = np.asarray(Image.fromarray((acc * 255).astype(np.uint8)).filter(ImageFilter.FIND_EDGES).filter(ImageFilter.GaussianBlur(2)), np.float32) / 255
    img = img * (1 - .55 * ring[..., None])
    # brume légère sur tout (unité de ton)
    fog = noise(W, H, seed + 11, ((40, .7), (120, .3)))
    img = img * (.92 + .1 * fog[..., None])
    im = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))
    im.save(os.path.join(D, "assets", out + ".webp"), quality=82, method=6)
    return {r: [round(P[r][0], 4), round(P[r][1], 4)] for r in ids}, [W, H], drawn


def main():
    outs = [os.path.join(D, "assets", "bg_wmap_%s.webp" % n) for n in ("a", "a_t", "b", "b_t")] + [os.path.join(D, "art", "wmap.json")]
    srcs = [os.path.join(D, "assets", "bg_%s.webp" % r) for r in A_IDS + B_IDS] + [os.path.abspath(__file__)]
    srcs = [f for f in srcs if os.path.exists(f)]
    if all(os.path.exists(o) for o in outs) and min(os.path.getmtime(o) for o in outs) > max(os.path.getmtime(f) for f in srcs):
        return  # à jour
    J = {}
    for key, ids, seed, tint in (("A", A_IDS, 5, (62, 50, 38)), ("B", B_IDS, 9, (44, 32, 46))):
        o = {}
        for tall in (False, True):
            name = "bg_wmap_%s%s" % (key.lower(), "_t" if tall else "")
            P, sz, drawn = compose(ids, tall, name, seed, tint)
            o["tall" if tall else "wide"] = {"pos": P, "size": sz, "img": name}
        J[key] = o
    json.dump(J, open(os.path.join(D, "art", "wmap.json"), "w"))
    print("cartes ok")


if __name__ == "__main__":
    main()
