#!/bin/sh
# Assemble le jeu : index.html (aperçu publié) et dist/ (appli installable)
cd "$(dirname "$0")"
OUT=/tmp/claude-0/cc/all.js
# liste des illustrations livrées et de celles à retourner (lues par 17_art_images.js)
# planches d'illustrations (icônes d'objets, armures de voie) régénérées à chaque assemblage
# python3 art/mkworldmap.py (cartes composées, remplacées par les cartes peintes bg_wmap_royaume/envers)
python3 art/mkatlas2.py >/dev/null 2>&1
# bruitages en trop (variantes 3 et 4) : non livrés, pour rester sous la limite de fichiers de l'artefact
SFX_SKIP="^fx_[a-z]+_[34]\.mp3$"
ARTV=$(cd assets && md5sum *.webp 2>/dev/null | awk '{n=$2; sub(/\.webp$/,"",n); printf "%s\"%s\":\"%s\"", (c++?",":""), n, substr($1,1,7)}')
ARTJS="window.ART_V={$ARTV};window.ART_LIST=[$(ls assets 2>/dev/null | sed -n 's/\.webp$//p' | sed 's/.*/"&"/' | paste -sd,)];window.ART_META=$(cat art/meta.json 2>/dev/null | tr -d '\n' || echo {});window.ART_CX=$(cat art/cx.json 2>/dev/null || echo {});window.ART_FACE=$(cat art/faces.json 2>/dev/null || echo {});window.UI_ATLAS=$(cat art/ui_atlas.json 2>/dev/null || echo null);window.IT_ATLAS=$(cat art/it_atlas.json 2>/dev/null || echo null);window.WMAP_POS=$(cat art/wmap.json 2>/dev/null || echo null);window.SFX_LIST=[$(ls sfx 2>/dev/null | grep -Ev "$SFX_SKIP" | sed -n 's/\.mp3$//p' | sed 's/.*/"&"/' | paste -sd,)];window.ART_FLIP=[$(grep -v '^#' art/flip.txt 2>/dev/null | grep . | sed 's/.*/"&"/' | paste -sd,)];"
{ echo "$ARTJS"; cat src/0*.js src/1*.js src/2*.js src/3*.js; } > $OUT && node --check $OUT || exit 1
PWAHEAD='<meta name="theme-color" content="#07060a">
<meta name="color-scheme" content="dark">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Royaume des Cendres">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="icon" type="image/png" href="favicon-64.png">'
{ echo "$PWAHEAD"; cat src/head.html src/body.html; echo "<script>"; cat $OUT; echo "</script>"; } > index.html
VER=$(md5sum $OUT src/head.html | md5sum | cut -c1-10)
rm -rf dist && mkdir -p dist
{ echo '<!doctype html><html lang="fr"><head><meta charset="utf-8">'
  echo '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">'
  echo "$PWAHEAD"; cat src/head.html; echo '</head><body>'; cat src/body.html
  echo '<script>window.CC_SW = 1;</script><script>'; cat $OUT; echo '</script></body></html>'; } > dist/index.html
cp pwa/manifest.webmanifest pwa/*.png dist/ 2>/dev/null
[ -d assets ] && cp -r assets dist/
# icônes d'interface regroupées dans assets/ui_atlas.webp : les fichiers séparés ne sont pas livrés
[ -f art/ui_atlas.json ] && for n in $(python3 -c "import json;print(' '.join(json.load(open('art/ui_atlas.json'))['n']))"); do rm -f dist/assets/ui_$n.webp; done
[ -d sfx ] && cp -r sfx dist/ && for f in $(ls sfx | grep -E "$SFX_SKIP"); do rm -f dist/sfx/$f; done
# icônes d'objets regroupées dans assets/it_atlas.webp
[ -f art/it_atlas.json ] && for n in $(python3 -c "import json;print(' '.join(json.load(open('art/it_atlas.json'))['n']))"); do rm -f dist/assets/$n.webp; done
ARTVER=$( (ls -l assets; ls -l sfx) 2>/dev/null | md5sum | cut -c1-8)
sed "s/__VERSION__/$VER/;s/__ARTVER__/$ARTVER/" pwa/sw.template.js > dist/sw.js
echo "build ok · $(wc -c < index.html) octets · v$VER"
