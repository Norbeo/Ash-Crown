# cx.py : centre horizontal du corps (jambes + bas du torse) de chaque illustration -> art/cx.json (fraction de la largeur)
import os, json, numpy as np
from PIL import Image
O='/home/claude/ash-crown/source/assets'; M={}
for f in sorted(os.listdir(O)):
    if not f.startswith(('hero_','mon_','pet_')): continue
    im=Image.open(O+'/'+f).convert('RGBA'); k=300/max(im.size); im=im.resize((max(1,int(im.width*k)),max(1,int(im.height*k))))
    a=np.asarray(im)[:,:,3]>80; H,W=a.shape; ys,xs=np.nonzero(a)
    if not len(xs): continue
    top,bot=ys.min(),ys.max(); h=bot-top
    sel=(ys>top+h*.45)&(ys<top+h*.97); c=float(np.median(xs[sel])) if sel.sum()>20 else float(np.median(xs))
    v=round(c/W,3)
    if abs(v-.5)>.03: M[f[:-5]]=v
json.dump(M,open('/home/claude/ash-crown/source/art/cx.json','w'),separators=(',',':'))
print(len(M)); print(sorted(M.items(),key=lambda x:abs(x[1]-.5))[-12:])
