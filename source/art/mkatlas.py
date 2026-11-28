# mkatlas.py : regroupe les icônes d'interface peintes ui_<nom>.webp en une planche (assets/ui_atlas.webp + art/ui_atlas.json)
import os, json
from PIL import Image
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'); A = D + '/assets'
KEEP = {'ui_emblem', 'ui_pawn', 'ui_atlas'}  # servies à part (écran de chargement, PWA, jeton de carte)
names = sorted(f[:-5] for f in os.listdir(A) if f.startswith('ui_') and f.endswith('.webp') and f[:-5] not in KEEP)
C, S = 12, 96; R = (len(names) + C - 1) // C
im = Image.new('RGBA', (C * S, R * S), (0, 0, 0, 0)); idx = {}
for i, n in enumerate(names):
    a = Image.open(f'{A}/{n}.webp').convert('RGBA').resize((S, S), Image.LANCZOS); im.paste(a, ((i % C) * S, (i // C) * S)); idx[n[3:]] = i
im.save(f'{A}/ui_atlas.webp', 'WEBP', quality=90, method=6)
json.dump({'c': C, 'r': R, 's': S, 'n': idx}, open(D + '/art/ui_atlas.json', 'w'), separators=(',', ':'))
print(len(names), 'icônes →', C, 'x', R)
