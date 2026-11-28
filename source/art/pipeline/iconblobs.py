# iconblobs.py PLANCHE.png cle1,cle2,... : planche d'objets sur fond noir à rangées irrégulières → un objet par tache
# (taches repérées par luminance, triées par rangée puis de gauche à droite) → assets/ui_<clé>.webp 96×96
import sys, os, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
im = Image.open(sys.argv[1]).convert('RGB'); a = np.asarray(im).astype(float); L = a.max(2); keys = sys.argv[2].split(',')
TH = float(os.environ.get('TH', 14))
m = ndimage.binary_dilation(L > TH + 6, iterations=int(L.shape[1] / 160)); lab, n = ndimage.label(m)
obj = ndimage.find_objects(lab); sz = ndimage.sum(m, lab, range(1, n + 1))
big = [i for i in range(n) if sz[i] > sz.max() * .08]
bx = [(obj[i], i) for i in big]
# rangées : regroupe par centre vertical
bx.sort(key=lambda t: (t[0][0].start + t[0][0].stop) / 2); rows = []
for s, i in bx:
    cy = (s[0].start + s[0].stop) / 2
    if rows and abs(cy - rows[-1][0]) < L.shape[0] * .09: rows[-1][1].append((s, i))
    else: rows.append([cy, [(s, i)]])
order = [t for _, r in rows for t in sorted(r, key=lambda t: t[0][1].start)]
print(len(order), 'objets pour', len(keys), 'clés', [len(r[1]) for r in rows])
S = 96
for (s, i), key in zip(order, keys):
    if key == '-': continue
    cell = a[s]; l = cell.max(2); own = (lab[s] == i + 1)
    al = np.clip((l - TH) * 9, 0, 255) * own
    al = Image.fromarray(al.astype(np.uint8)).filter(ImageFilter.GaussianBlur(.7))
    o = Image.fromarray(cell.astype(np.uint8)).convert('RGBA'); o.putalpha(al); bb = al.point(lambda v: 255 if v > 25 else 0).getbbox()
    if bb: o = o.crop(bb)
    o.thumbnail((S - 6, S - 6), Image.LANCZOS); t = Image.new('RGBA', (S, S)); t.alpha_composite(o, ((S - o.width) // 2, (S - o.height) // 2))
    t.save('/home/claude/ash-crown/source/assets/ui_' + key + '.webp', 'WEBP', quality=90, method=6)
