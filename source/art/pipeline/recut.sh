#!/bin/sh
# recut.sh <url_export> <nom> : moitié gauche de la page exportée → détourage → remplace l'asset (ancienne gardée) → aperçu /tmp/claude-0/rc.png
set -e
cd /tmp/claude-0/canva/raw && curl -sS -o rc.png "$1"
python3 -c "
from PIL import Image
im=Image.open('rc.png');k=im.width/1920;im.crop((0,0,int(960*k),int(960*k))).save('$2.png')"
cd /home/claude/ash-crown/source/art/pipeline && python3 cut.py $2 >/dev/null
cd ../../assets && mkdir -p /tmp/claude-0/capefill/recut_bak && python3 - <<P
from PIL import Image
import shutil,os
n='$2';o=Image.open(n+'.webp')
if not os.path.exists('/tmp/claude-0/capefill/recut_bak/'+n+'.webp'): shutil.copy(n+'.webp','/tmp/claude-0/capefill/recut_bak/')
c=Image.open('/tmp/claude-0/canva/cut/%s.png'%n);H=max(o.height,330);c=c.resize((int(c.width*H/c.height),H),Image.LANCZOS);c.save(n+'.webp','WEBP',quality=90,method=6)
t=[]
for s in ['/tmp/claude-0/capefill/recut_bak/','']:
  im=Image.open(s+n+'.webp').convert('RGBA');bg=Image.new('RGBA',im.size,(255,0,255,255));bg.alpha_composite(im);t.append(bg)
W=sum(x.width for x in t);out=Image.new('RGBA',(W,max(x.height for x in t)));x=0
for a in t:out.paste(a,(x,0));x+=a.width
out.save('/tmp/claude-0/rc.png');print(n,o.size,'->',c.size)
P
