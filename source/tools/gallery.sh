#!/bin/sh
# galerie de test : héros par classe et palier
cd "$(dirname "$0")/.."
OUT=/tmp/claude-0/cc/gallery.html
{ echo '<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;background:#1a1614}canvas{display:block}</style></head><body><canvas id="c"></canvas><script>'
  cat src/00_util.js src/01_classes.js src/02_world.js src/03_items.js src/04_state.js src/10_art_core.js src/11_art_hero.js src/12_art_gear.js src/13_art_monsters.js src/14_art_pets.js src/15_art_scenes.js 2>/dev/null
  cat tools/gallery.js
  echo '</script></body></html>'; } > $OUT
echo ok
