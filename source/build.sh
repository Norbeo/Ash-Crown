#!/bin/sh
# Assemble le jeu : index.html (aperçu publié) et dist/ (appli installable)
cd "$(dirname "$0")"
OUT=/tmp/claude-0/cc/all.js
# liste des illustrations livrées et de celles à retourner (lues par 17_art_images.js)
ARTJS="window.ART_LIST=[$(ls assets 2>/dev/null | sed -n 's/\.webp$//p' | sed 's/.*/"&"/' | paste -sd,)];window.ART_FLIP=[$(grep -v '^#' art/flip.txt 2>/dev/null | grep . | sed 's/.*/"&"/' | paste -sd,)];"
{ echo "$ARTJS"; cat src/0*.js src/1*.js src/2*.js src/3*.js; } > $OUT && node --check $OUT || exit 1
PWAHEAD='<meta name="theme-color" content="#07060a">
<meta name="color-scheme" content="dark">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Couronne de Cendres">
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
ARTVER=$(ls -l assets 2>/dev/null | md5sum | cut -c1-8)
sed "s/__VERSION__/$VER/;s/__ARTVER__/$ARTVER/" pwa/sw.template.js > dist/sw.js
echo "build ok · $(wc -c < index.html) octets · v$VER"
