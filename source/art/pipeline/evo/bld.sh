#!/bin/sh
# bld.sh "exportUrl" nom1 nom2 — planche de 2 bâtiments : découpe + détourage par luminance + build
set -e
C=/tmp/claude-0/canva; cd $C
curl -sS -o raw/sheet_tmp.png "$1"; shift
python3 evo/split_cc.py raw/sheet_tmp.png "$@"
T=${T:-3} IT=${IT:-8} python3 cutlum.py "$@"
for n in "$@"; do rm -f /home/claude/ash-crown/source/assets/$n.webp; done
python3 mkassets.py | tail -1
cd /home/claude/ash-crown/source && sh build.sh >/dev/null && echo built
