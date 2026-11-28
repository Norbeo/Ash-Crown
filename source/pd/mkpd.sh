#!/bin/sh
# Version PlayDrop : index.html seul (illustrations et sons servis depuis GitHub Pages via <base>), SDK PlayDrop, catalogue.json et visuels de la fiche.
# Usage : sh pd/mkpd.sh [version]   (depuis source/, après build.sh)
set -e
V=${1:-1.0.0}
rm -rf dist_pd && mkdir -p dist_pd/listing
sed -e 's#<head><meta charset="utf-8">#<head><meta charset="utf-8"><base href="https://norbeo.github.io/Ash-Crown/">#' \
    -e 's#<script>window.CC_SW = 1;</script>#<script src="https://assets.playdrop.ai/sdk/playdrop.js"></script><script>window.CC_PD = 1;</script>#' dist/index.html > dist_pd/index.html
grep -q 'window.CC_PD = 1' dist_pd/index.html && grep -q '<base href' dist_pd/index.html
cp pd/listing/*.png dist_pd/listing/
python3 pd/catalogue.py "$V" > dist_pd/catalogue.json
echo "paquet PlayDrop $V : $(ls dist_pd dist_pd/listing | wc -l) entrées"
