import json, sys
V = sys.argv[1] if len(sys.argv) > 1 else "1.0.0"
desc = """Un royaume maudit, une couronne brisée, et vous pour mener une poignée de héros dans l'ombre.

**Couronne de Cendres** est un RPG tactique dark fantasy au tour par tour : quatre héros sur leurs rangs contre des horreurs peintes à la main.

- **15 classes** et leurs évolutions, armures visibles sur 10 paliers, talents, ascension
- **20 chapitres** d'histoire, des centaines de monstres, élites et gardiens à phases
- **Le Bastion** : taverne, forge, chapelle, ménagerie de 60 compagnons, fonderie
- **L'Abîme sans fin**, défis du jour, saisons, nouveaux cycles toujours plus durs
- Intentions ennemies visibles, agonie, stress et afflictions, synergies de compagnie

Partie sauvegardée en ligne : reprenez-la sur votre téléphone ou votre ordinateur."""
app = {
  "name": "couronne-de-cendres", "displayName": "Couronne de Cendres",
  "subtitle": "RPG tactique dark fantasy au tour par tour",
  "description": desc,
  "controls": "Touchez ou cliquez une compétence, puis sa cible. Clavier : 1–6 compétences, Espace pour passer.",
  "file": "index.html", "version": V, "visibility": "PRIVATE", "authMode": "OPTIONAL",
  "releaseNotes": "Première version PlayDrop : sauvegarde en ligne et classements.",
  "tags": ["game-genre/rpg", "game-genre/strategy", "game-subgenre/turn-based-strategy", "game-subgenre/roguelike",
           "game-theme/fantasy", "game-theme/horror", "game-mood/challenging", "game-mood/story-driven",
           "game-play-mode/single-player", "game-play-mode/daily-challenges", "game-play-mode/mobile-games"],
  "design": {"genre": "game-genre/rpg", "perspective": "perspective/2d-side-view", "controls": "game-controls/tap",
             "visualStyle": "visual-style/hand-drawn", "progression": "game-progression/story", "feel": "game-feel/strategic"},
  "types": ["solo"], "controller": {"support": "off"},
  "surfaceTargets": {"desktop": True, "mobileLandscape": True, "mobilePortrait": True},
  "primarySurface": "MOBILE_PORTRAIT", "sourceLocale": "fr", "color": "#c8461e", "emoji": "👑",
  "listing": {"icon": "listing/icon.png", "heroLandscape": "listing/hero-landscape.png", "heroPortrait": "listing/hero-portrait.png",
              "screenshotsLandscape": [{"path": "listing/shot-combat.png", "alt": "Combat contre un gardien"},
                                       {"path": "listing/shot-bastion.png", "alt": "Le Bastion"},
                                       {"path": "listing/shot-map.png", "alt": "Carte d'expédition"}],
              "screenshotsPortrait": [{"path": "listing/shot-combat-portrait.png", "alt": "Combat sur téléphone"}]},
  "leaderboards": [
    {"key": "abime-profondeur", "displayName": "Profondeur de l'Abîme", "description": "Étage le plus profond atteint dans l'Abîme sans fin", "scoreType": "INTEGER", "sort": "DESC", "unitLabel": "étages"},
    {"key": "niveau-aventure", "displayName": "Niveau d'aventure", "description": "Niveau d'aventure de la compagnie", "scoreType": "INTEGER", "sort": "DESC", "unitLabel": "niv"},
    {"key": "chapitres-vaincus", "displayName": "Chapitres vaincus", "description": "Nombre de chapitres dont le gardien est tombé", "scoreType": "INTEGER", "sort": "DESC"}],
}
print(json.dumps({"apps": [app]}, ensure_ascii=False, indent=1))
