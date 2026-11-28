# icongrid.py PLANCHE.png COLS ROWS cle1,cle2,... : découpe une planche d'icônes peintes sur fond noir
# → assets/ui_<clé>.webp (96×96, fond transparent par luminance, objet centré). Une clé vide « - » saute la case.
import sys, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
src, C, R, keys = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4].split(',')
im = Image.open(src).convert('RGB'); a = np.asarray(im).astype(float); L = a.max(2)
# zone utile : on retire les bandes noires autour de la planche
ys, xs = np.nonzero(ndimage.uniform_filter(L, 15) > 18); y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
def bands(prof, n, off):
    p = ndimage.uniform_filter1d(prof, 9); t = p.min() + (np.median(p) - p.min()) * .3; lab, m = ndimage.label(p > t)
    segs = [(np.where(lab == i)[0][0] + off, np.where(lab == i)[0][-1] + off) for i in range(1, m + 1)]
    segs = [s for s in segs if s[1] - s[0] > len(prof) / n * .35]
    if len(segs) != n: Lp = len(prof); return [(off + int(Lp * i / n), off + int(Lp * (i + 1) / n)) for i in range(n)], False
    return segs, True
cx, okx = bands(L[y0:y1, x0:x1].mean(0), C, x0); cy, oky = bands(L[y0:y1, x0:x1].mean(1), R, y0); print('cases', okx, oky)
OUT = '/home/claude/ash-crown/source/assets/'; S = 96; k = 0
for r, (ya, yb) in enumerate(cy):
    for c, (xa, xb) in enumerate(cx):
        if k >= len(keys): break
        key = keys[k]; k += 1
        if key == '-': continue
        cell = a[ya:yb, xa:xb]; l = cell.max(2)
        import os; TH = float(os.environ.get("TH", 14)); m = np.clip((l - TH) * 9, 0, 255)  # fond noir → transparent
        lab, n = ndimage.label(m > 60)
        if n: sz = ndimage.sum(np.ones_like(l), lab, range(1, n + 1)); keep = np.isin(lab, [i + 1 for i, s in enumerate(sz) if s >= sz.max() * .04]); m = m * ndimage.binary_dilation(keep, iterations=4)
        al = Image.fromarray(m.astype(np.uint8)).filter(ImageFilter.GaussianBlur(.7))
        o = Image.fromarray(cell.astype(np.uint8)).convert('RGBA'); o.putalpha(al); bb = al.point(lambda v: 255 if v > 25 else 0).getbbox()
        if bb: o = o.crop(bb)
        o.thumbnail((S - 6, S - 6), Image.LANCZOS); t = Image.new('RGBA', (S, S)); t.alpha_composite(o, ((S - o.width) // 2, (S - o.height) // 2))
        t.save(OUT + 'ui_' + key + '.webp', 'WEBP', quality=90, method=6); print('ui_' + key)
