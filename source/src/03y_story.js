/* ═══════════════════════ Histoire : dialogues avant chaque chapitre, avec une continuité de chapitre en chapitre ═══════════════════════
   Personnages récurrents : Frère Anselme (chapelain du Bastion), Ysolde (maîtresse d'armes), Maugrin (forgeron), le Capitaine (vous). */
const SPEAKERS = {
  anselme: { n: "Frère Anselme", c: "#e8d8a0" }, ysolde: { n: "Ysolde", c: "#ff9a7a" }, maugrin: { n: "Maugrin le forgeron", c: "#d8a870" },
  narr: { n: "", c: "#c8b8a0" }, voix: { n: "Une voix dans la Cendre", c: "#b08aff" }, capitaine: { n: "Le Capitaine", c: "#9ac8ff" },
};
const SCENES = {
  bourg: { t: "Chapitre I — Le Bourg pestiféré", lines: [
    ["narr", "Le Bastion n'est plus qu'une coquille de pierre. Quatre âmes vous ont suivi jusqu'ici. Au loin, les cloches de Morvaine sonnent toutes seules."],
    ["anselme", "Capitaine. Les cloches ne sonnent plus pour les vivants depuis cent ans. Si elles sonnent ce soir, c'est que quelque chose les tire."],
    ["ysolde", "Le Bourg est à une heure de marche. Les réfugiés parlent d'un médecin masqué qui « soigne » les malades… et qu'ils se relèvent ensuite."],
    ["capitaine", "Alors c'est là que tout commence."],
    ["anselme", "Le Roi Aldemar a brisé sa Couronne en cinq éclats avant de sombrer. Chaque éclat a corrompu un gardien. Rapportez-les, et peut-être que la Cendre cessera de tomber."],
    ["maugrin", "Et rapportez du fer, aussi. On ne gagne pas une guerre avec des prières et des couteaux à pain."],
  ] },
  foret: { t: "Chapitre II — La Forêt des Pendus", lines: [
    ["narr", "Le premier fragment repose sur l'autel de la chapelle. Il est froid comme une main morte, et il chuchote la nuit."],
    ["anselme", "Je ne dors plus. Le fragment murmure un nom : « Mère ». Il appelle quelque chose, plus au nord, sous les arbres."],
    ["ysolde", "La Forêt des Pendus. Les chasseurs disent que les arbres y portent des fruits humains, et qu'ils tournent quand on les regarde."],
    ["voix", "Vous avez pris ce qui m'appartient… Venez donc me le rendre, petits voleurs."],
    ["capitaine", "Tu l'as entendue aussi ?"],
    ["anselme", "Tout le Bastion l'a entendue. Partez avant qu'elle ne vienne d'elle-même."],
  ] },
  catacombes: { t: "Chapitre III — Les Catacombes de Saint-Morne", lines: [
    ["narr", "Deux fragments. Quand on les rapproche, ils s'emboîtent, et la Cendre se met à tomber à l'envers, vers le ciel."],
    ["maugrin", "J'ai essayé de les fondre. Le creuset a gelé. Ce métal n'est pas de ce monde, Capitaine."],
    ["anselme", "Les archives de l'ordre parlent de l'abbaye de Saint-Morne. Les moines y ont enterré Aldemar… ou du moins ce qu'ils croyaient être Aldemar."],
    ["ysolde", "Dix mille moines sous la terre. Et d'après les fossoyeurs, plus un seul ne repose dans sa tombe."],
    ["voix", "Le Roi n'est pas mort. Le Roi attend. Le Roi a faim de couronnes."],
    ["capitaine", "Alors descendons voir ce qu'il garde."],
  ] },
  marais: { t: "Chapitre IV — Le Marais des Noyés", lines: [
    ["narr", "Sous la couronne de fer de la Liche, un parchemin : la carte d'un marais, et une date — celle du couronnement d'Aldemar."],
    ["anselme", "Le Roi avait une épouse. Elle s'est noyée la nuit du couronnement. On n'a jamais retrouvé le corps."],
    ["ysolde", "Le Marais des Noyés. Les pêcheurs n'y vont plus : ils disent que l'eau chante avec la voix d'une reine."],
    ["maugrin", "J'ai renforcé vos armures. La vase ronge l'acier, alors ne traînez pas."],
    ["voix", "Il m'a donnée à l'eau pour devenir immortel. Rapportez-lui sa Couronne… et moi, je lui rapporterai sa femme."],
    ["capitaine", "Même ses alliés le haïssent. Bien. Ça fera un ennemi de moins à la fin."],
  ] },
  citadelle: { t: "Chapitre V — La Citadelle de Cendres", lines: [
    ["narr", "Quatre fragments. Ils brûlent sans flamme, et la Citadelle, à l'horizon, s'est rallumée pour la première fois depuis un siècle."],
    ["anselme", "Il sait que nous venons. Il nous attend. Capitaine… s'il porte de nouveau la Couronne entière, plus rien ne l'arrêtera."],
    ["ysolde", "Alors on ne lui laisse pas le temps de la mettre. On entre, on frappe, on la brise."],
    ["maugrin", "J'ai forgé ce que je pouvais. Le reste, c'est à vous de le gagner."],
    ["voix", "Venez, mes enfants. Venez me rendre ma Couronne. Je vous ferai rois de la Cendre."],
    ["capitaine", "Il y a cent ans, il a voulu vaincre la mort. Ce soir, on lui rend la sienne."],
  ] },
  abime: { t: "L'Abîme sans fin", lines: [
    ["narr", "Le Roi est tombé. Mais sous la Citadelle, la pierre s'est ouverte sur un puits sans fond, et la Cendre en remonte toujours."],
    ["anselme", "La Couronne n'était qu'un sceau. Ce qui est en bas… ce n'est pas Aldemar. C'est ce qu'il a voulu enfermer."],
    ["ysolde", "Chaque marche qu'on descend en révèle dix autres. Mais chaque marche qu'on prend, c'est une nuit de plus pour le Bastion."],
    ["voix", "Vous avez brisé ma prison. Merci. Descendez, petits héros. Je vous attends tout en bas."],
  ] },
};
// fin d'un chapitre : une réplique de transition, qui annonce le suivant
const SCENE_END = {
  bourg: [["anselme", "Le premier fragment. Il est chaud… non, il est vivant. Rentrons avant qu'il ne parle."]],
  foret: [["ysolde", "La Mère des Ronces est morte en appelant un nom : « Saint-Morne ». Ça vous dit quelque chose, Frère ?"]],
  catacombes: [["anselme", "Une carte et une date. Le Roi a sacrifié quelqu'un pour sa Couronne. Il faut savoir qui."]],
  marais: [["voix", "Allez, maintenant. Allez lui rendre visite. Et dites-lui que sa reine l'attend au fond de l'eau."]],
  citadelle: [["capitaine", "C'est fini…"], ["anselme", "Non, Capitaine. Écoutez. Sous nos pieds. Ça vient de commencer."]],
};
