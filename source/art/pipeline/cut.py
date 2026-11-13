# cut.py nom... : détoure raw/<nom>.png -> cut/<nom>.png (fond transparent, recadré)
import sys, numpy as np, onnxruntime as ort
from PIL import Image, ImageFilter
S = ort.InferenceSession("/tmp/claude-0/models/isnet.onnx", providers=["CPUExecutionProvider"])
inp = S.get_inputs()[0].name
for n in sys.argv[1:]:
    im = Image.open(f"/tmp/claude-0/canva/raw/{n}.png").convert("RGB")
    x = np.asarray(im.resize((1024, 1024), Image.BILINEAR), dtype=np.float32) / 255.0
    x = (x - 0.5) / 1.0
    x = x.transpose(2, 0, 1)[None]
    m = S.run(None, {inp: x})[0][0, 0]
    m = (m - m.min()) / (m.max() - m.min() + 1e-8)
    a = Image.fromarray((m * 255).astype(np.uint8)).resize(im.size, Image.BILINEAR)
    # durcit le masque (contours nets) tout en gardant un léger lissage
    a = a.point(lambda v: 0 if v < 40 else 255 if v > 200 else int((v - 40) * 255 / 160)).filter(ImageFilter.GaussianBlur(.6))
    import os
    if os.environ.get("LUM"):  # fond noir pur : on récupère aussi les zones sombres/lumineuses que le détourage oublie
        L = np.asarray(im, dtype=np.float32).max(axis=2)
        lm = Image.fromarray(np.clip((L - float(os.environ.get("LUMT", 10))) * 14, 0, 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(.8))
        big = a.point(lambda v: 255 if v > 30 else 0).filter(ImageFilter.MaxFilter(31))  # seulement près du personnage
        lm = Image.fromarray(np.minimum(np.asarray(lm), np.asarray(big)))
        a = Image.fromarray(np.maximum(np.asarray(a), np.asarray(lm)))
    if os.environ.get("FILL"):  # bouche les trous intérieurs (armures très sombres)
        from scipy.ndimage import binary_fill_holes, binary_closing
        b = np.asarray(a) > 60
        b = binary_fill_holes(binary_closing(b, iterations=int(os.environ.get("FILL"))))
        a = Image.fromarray(np.maximum(np.asarray(a), (b * 255).astype(np.uint8)))
    out = im.convert("RGBA"); out.putalpha(a)
    bb = a.point(lambda v: 255 if v > 20 else 0).getbbox()
    if bb: out = out.crop((max(0, bb[0] - 6), max(0, bb[1] - 6), min(im.width, bb[2] + 6), min(im.height, bb[3] + 6)))
    out.save(f"/tmp/claude-0/canva/cut/{n}.png"); print(n, out.size)
