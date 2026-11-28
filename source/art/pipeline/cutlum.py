# cutlum.py nom... : détourage par luminance (sujet sur noir pur) -> cut/<nom>.png
import sys, numpy as np
from PIL import Image, ImageFilter
from scipy.ndimage import binary_fill_holes, binary_closing, label
import os
T = float(os.environ.get("T", 14)); IT = int(os.environ.get("IT", 4))
for n in sys.argv[1:]:
    im = Image.open(f"/tmp/claude-0/canva/raw/{n}.png").convert("RGB")
    L = np.asarray(im, dtype=np.float32).max(axis=2)
    b = L > T
    b = binary_closing(b, iterations=IT)
    lab, k = label(b)
    if k:
        sz = np.bincount(lab.ravel()); sz[0] = 0
        keep = sz >= sz.max() * .02
        b = keep[lab]
    b = binary_fill_holes(b)
    soft = np.clip((L - 4) * 18, 0, 255)
    a = np.where(b, 255, 0).astype(np.uint8)
    a = Image.fromarray(np.minimum(a, np.maximum(soft, np.asarray(Image.fromarray(a).filter(ImageFilter.MinFilter(5))))).astype(np.uint8)).filter(ImageFilter.GaussianBlur(.7))
    out = im.convert("RGBA"); out.putalpha(a)
    bb = a.point(lambda v: 255 if v > 20 else 0).getbbox()
    if bb: out = out.crop((max(0, bb[0]-6), max(0, bb[1]-6), min(im.width, bb[2]+6), min(im.height, bb[3]+6)))
    out.save(f"/tmp/claude-0/canva/cut/{n}.png"); print(n, out.size)
