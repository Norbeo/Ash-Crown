# mkatlas2.py : regroupe en planches les petites illustrations pour rester sous la limite de fichiers de l'artefact
#  - it_atlas.webp : icônes d'objets wpn_* et tr_*
#  - hx_<classe>.webp : armures de voie (paliers VI à X) hero_<classe>_<voie>[_t7…_t10]
# art/it_atlas.json = {n: {nom: [x, y, w, h]}, f: {nom: planche}}
import os, json, re
from PIL import Image
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'); A = D + '/assets'
CLS = json.load(open(D + '/art/classes.json')) if os.path.exists(D + '/art/classes.json') else None
files = sorted(f[:-5] for f in os.listdir(A) if f.endswith('.webp'))
groups = {'it_atlas': [n for n in files if n.startswith(('wpn_', 'tr_'))]}
for n in files:
    m = re.match(r'^hero_(.+?)_(t[1-5])$', n)
    if m or not n.startswith('hero_'): continue
    # hero_<classe>_<voie> ou hero_<classe>_<voie>_t<n> : la classe est le plus long préfixe connu
    rest = n[5:]; cls = None
    for c in sorted(CLS or [], key=len, reverse=True):
        if rest.startswith(c + '_'): cls = c; break
    if not cls: continue
    groups.setdefault('hx_' + cls, []).append(n)
pos, fil = {}, {}
for g, names in groups.items():
    if not names: continue
    W = 2048; x = y = rowh = 0; ims = {}
    for n in names:
        a = Image.open(f'{A}/{n}.webp').convert('RGBA'); ims[n] = a; w, h = a.size
        if x + w > W: x = 0; y += rowh + 2; rowh = 0
        pos[n] = [x, y, w, h]; fil[n] = g; x += w + 2; rowh = max(rowh, h)
    im = Image.new('RGBA', (W, y + rowh), (0, 0, 0, 0))
    for n in names: im.paste(ims[n], tuple(pos[n][:2]))
    im.save(f'{A}/{g}.webp', 'WEBP', quality=90, method=6)
json.dump({'n': pos, 'f': fil}, open(D + '/art/it_atlas.json', 'w'), separators=(',', ':'))
print(len(pos), 'images dans', len([g for g in groups if groups[g]]), 'planches')
