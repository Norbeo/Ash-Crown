# Couronne de Cendres (Ash Crown)

RPG tactique dark fantasy médiéval, jouable dans le navigateur et installable sur téléphone (PWA).

- **Jouer** : https://norbeo.github.io/Ash-Crown/
- 15 classes (tanks, soigneurs, soutiens, dégâts), 30 évolutions, 18 compagnons, 5 chapitres et l'Abîme sans fin. Compagnie et compagnon de départ tirés au sort.

## Structure
- À la racine : le jeu prêt à servir (`index.html`, `sw.js`, `manifest.webmanifest`, icônes).
- `source/` : le code (`src/`), les bots de test (`test/sim.js`) et `build.sh`, qui régénère le jeu dans `source/dist/`.
