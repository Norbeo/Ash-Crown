# mkassets.py : cut/*.png et raw/bg_*.png -> source/assets/*.webp (tailles du jeu)
import os
from PIL import Image
C='/tmp/claude-0/canva'; O='/home/claude/ash-crown/source/assets'
BIG={'cardinal','sans_visage','matrone_os','devoreur_lumiere','archonte_cendres','docteur','liche','abbe','reine_sabbat','roi','sans_nom','mere_ronces','mere_noyes','hydre','reine_hiver','roi_noye','coeur_montagne','roi_vide','mere_racines','graine_premiere','reine_sel','noye_sec','seigneur_gibet','fruit_dernier','dernier_abbe','moine_eveille','voix_echo','silence_fait','amiral_cendres','kraken_cendre','pape_bas','saint_sans_nom','jardinier','rose_noire','astre_noir','premiere_etoile','enfant_graine','coeur_premier'}
for f in sorted(os.listdir(C+'/cut')):
    n=f[:-4]; im=Image.open(C+'/cut/'+f)
    if n.startswith('hero_'): H=430
    elif n.startswith('mon_'): H=640 if n[4:] in BIG else 470
    elif n.startswith('pet_'): H=330 if n.endswith('_evo') else 280
    elif n.startswith('bld_') and n!='bld_sheet': H=560
    elif n.startswith('wpn_') and n!='wpn_sheet': H=300
    elif n.startswith('tr_') and n!='tr_sheet': H=200
    elif n.startswith('map_') and n!='map_sheet': H=170
    else: continue
    s=min(1,H/im.height,(H*1.5)/im.width); im=im.resize((round(im.width*s),round(im.height*s)),Image.LANCZOS)
    out=f'{O}/{n}.webp'
    if os.path.exists(out) and os.path.getmtime(out)>os.path.getmtime(C+'/cut/'+f): continue
    im.save(out,'WEBP',quality=82,method=6)
for f in sorted(os.listdir(C+'/raw')):
    if not f.startswith('bg_'): continue
    n=f[:-4]; out=f'{O}/{n}.webp'
    if os.path.exists(out): continue
    im=Image.open(C+'/raw/'+f).convert('RGB').resize((1456,816),Image.LANCZOS); im.save(out,'WEBP',quality=80,method=6)
print(len(os.listdir(O)), sum(os.path.getsize(O+'/'+x) for x in os.listdir(O))//1024,'Ko')
