# face.py : cadre du visage de chaque monstre/compagnon -> art/faces.json {nom: [cx, cy, s]} (fractions de la largeur / hauteur ; s = côté / hauteur)
import os, json, numpy as np
from PIL import Image
from scipy.ndimage import binary_opening, label
O = '/home/claude/ash-crown/source/assets'; R = '/home/claude/ash-crown/source/art/'
FLIP = set(l.strip() for l in open(R + 'flip.txt') if l.strip() and not l.startswith('#'))
OV = json.load(open(R + 'faces_fix.json')) if os.path.exists(R + 'faces_fix.json') else {}
F = {}
for f in sorted(os.listdir(O)):
    if not (f.startswith('mon_') or f.startswith('pet_')): continue
    n = f[:-5]
    if n in OV: F[n] = OV[n]; continue
    im = Image.open(O + '/' + f).convert('RGBA'); W0, H0 = im.size
    k = 300 / max(W0, H0); im = im.resize((max(1, int(W0 * k)), max(1, int(H0 * k))))
    a = np.asarray(im)[:, :, 3] > 70; H, W = a.shape
    r = max(2, int(min(W, H) * .045))
    yy, xx = np.mgrid[-r:r + 1, -r:r + 1]; st = xx * xx + yy * yy <= r * r
    o = binary_opening(a, structure=st)
    lab, nl = label(o)
    if nl: sz = np.bincount(lab.ravel()); sz[0] = 0; o = lab == sz.argmax()
    else: o = a
    ys, xs = np.nonzero(o); top, bot, lft, rgt = ys.min(), ys.max(), xs.min(), xs.max(); bh, bw = bot - top + 1, rgt - lft + 1
    right = (n in FLIP) if n.startswith('mon_') else (n not in FLIP)  # tourné vers la droite dans l'image source
    if bw > bh * 1.15:  # bête allongée : la tête est devant
        s = bh * .62
        side = o[:, lft:lft + int(bw * .4)] if not right else o[:, rgt - int(bw * .4):rgt + 1]
        sy, sx = np.nonzero(side); sx = sx + (lft if not right else rgt - int(bw * .4))
        ht = sy.min(); hx = sx[sy < ht + s * .6].mean()
        cy = ht + s * .45; cx = hx + (s * .08 if not right else -s * .08)
    else:
        s = bh * (.30 if n.startswith('pet_') else .27) if bh > bw * 1.4 else bh * .36
        rows = o[top:top + int(s * .7)]
        ry, rx = np.nonzero(rows); cx = rx.mean(); cy = top + s * .46
    F[n] = [round(cx / W, 3), round(cy / H, 3), round(s / H, 3)]
json.dump(F, open(R + 'faces.json', 'w'), separators=(',', ':'))
print(len(F))
