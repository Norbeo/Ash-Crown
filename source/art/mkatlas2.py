# mkatlas2.py : regroupe les icônes d'objets (wpn_*, tr_*) en une planche assets/it_atlas.webp + art/it_atlas.json {n: {nom: [x, y, w, h]}}
import os, json
from PIL import Image
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'); A = D + '/assets'
names = sorted(f[:-5] for f in os.listdir(A) if f.startswith(('wpn_', 'tr_')) and f.endswith('.webp'))
W = 2048; x = y = rowh = 0; pos = {}; ims = {}
for n in names:
    a = Image.open(f'{A}/{n}.webp').convert('RGBA'); ims[n] = a; w, h = a.size
    if x + w > W: x = 0; y += rowh + 2; rowh = 0
    pos[n] = [x, y, w, h]; x += w + 2; rowh = max(rowh, h)
im = Image.new('RGBA', (W, y + rowh), (0, 0, 0, 0))
for n, (px, py, w, h) in pos.items(): im.paste(ims[n], (px, py))
im.save(f'{A}/it_atlas.webp', 'WEBP', quality=90, method=6)
json.dump({'n': pos}, open(D + '/art/it_atlas.json', 'w'), separators=(',', ':'))
print(len(names), 'icônes →', im.size)
