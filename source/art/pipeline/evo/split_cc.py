# split_cc.py EXPORT n1 n2 : planche de 2 sujets sur fond noir, découpe par composantes connexes (sujets qui débordent du milieu)
import sys, numpy as np
from PIL import Image
from scipy import ndimage
im=Image.open(sys.argv[1]).convert('RGB'); a=np.asarray(im).astype(int)
g=a.max(2)>4; g=ndimage.binary_closing(g,iterations=12); g=ndimage.binary_fill_holes(g); g=ndimage.binary_opening(g,iterations=2)
lab,k=ndimage.label(g); sz=np.bincount(lab.ravel()); sz[0]=0
big=[i for i in np.argsort(sz)[::-1] if sz[i]>sz.max()*.25][:len(sys.argv)-2]
boxes=[]
for i in big:
    ys,xs=np.where(lab==i); boxes.append((xs.min(),ys.min(),xs.max(),ys.max(),i))
boxes.sort()
for (x0,y0,x1,y1,i),n in zip(boxes,sys.argv[2:]):
    m=ndimage.binary_dilation(ndimage.binary_fill_holes(lab==i),iterations=20); b=np.where(m[...,None],a,0).astype(np.uint8)
    Image.fromarray(b).crop((max(0,x0-16),max(0,y0-16),x1+16,y1+16)).save(f'/tmp/claude-0/canva/raw/{n}.png'); print(n,(x0,y0,x1,y1))
