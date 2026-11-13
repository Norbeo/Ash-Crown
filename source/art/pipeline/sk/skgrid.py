# skgrid.py EXPORT cls : planche 5×4 sur fond noir (export 1920×1080, image left 285 1350×1080) → assets/sk_<cls>.webp
# les cases sont repérées par les bandes sombres entre elles (marges irrégulières de l'image générée)
import sys, numpy as np
from PIL import Image
from scipy import ndimage
im = Image.open(sys.argv[1]).convert('RGB'); W, H = im.size; k = W / 1920
z = im.crop((int(285 * k), 0, int((285 + 1350) * k), H)); a = np.asarray(z).astype(float).mean(2)
def bands(prof, n):
    # n segments clairs séparés par des creux : seuil adaptatif sur le profil lissé
    p = ndimage.uniform_filter1d(prof, 9); t = p.min() + (np.median(p) - p.min()) * .35; on = p > t
    lab, m = ndimage.label(on); segs = [(np.where(lab == i)[0][0], np.where(lab == i)[0][-1]) for i in range(1, m + 1)]
    segs = [s for s in segs if s[1] - s[0] > len(prof) / n * .5]
    if len(segs) != n: L = len(prof); return [(int(L * i / n), int(L * (i + 1) / n)) for i in range(n)], False
    return segs, True
cx, okx = bands(a.mean(0), 5); cy, oky = bands(a.mean(1), 4); print('cases détectées', okx, oky, cx, cy)
S = 128; out = Image.new('RGB', (5 * S, 4 * S))
for r, (y0, y1) in enumerate(cy):
    for c, (x0, x1) in enumerate(cx):
        w, h = x1 - x0, y1 - y0; s = min(w, h); ox, oy = x0 + (w - s) // 2, y0 + (h - s) // 2; i = int(s * .02)
        out.paste(z.crop((ox + i, oy + i, ox + s - i, oy + s - i)).resize((S, S), Image.LANCZOS), (c * S, r * S))
out.save(f'/home/claude/ash-crown/source/assets/sk_{sys.argv[2]}.webp', 'WEBP', quality=88, method=6)
out.save(f'/tmp/claude-0/canva/sk/sk_{sys.argv[2]}.png'); print('ok', sys.argv[2])
