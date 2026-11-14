/* Histoire étoffée (14 nov.) :
   - chaque chapitre gagne des répliques (lieu, enjeu, gardien) insérées avant sa dernière réplique, et un épilogue plus long ;
   - chaque niveau de bâtiment (2 à 10) a sa petite histoire, jouée à l'amélioration et relisible dans Archives › Chroniques. */
const STORY_MORE = {
  bourg: { at: "end", mid: [
    ["narr", "Le Bourg était une ville de foire. Il en reste des étals renversés, des volets cloués de l'intérieur, et des croix de craie sur une porte sur deux."],
    ["ysolde", "Le médecin porte un masque à bec et une lanterne verte. Il entre dans les maisons marquées. Personne n'en ressort, mais quelque chose y remue encore."],
    ["maugrin", "Et méfiez-vous du boucher. Il ne vend plus de viande : il en achète."],
  ], end: [
    ["ysolde", "Le Docteur gardait l'éclat dans sa sacoche, avec ses scalpels. Il croyait guérir la mort en la cousant aux vivants."],
    ["maugrin", "Les cloches se sont tues. Pour la première fois depuis cent ans, le Bourg dort."],
  ] },
  foret: { at: "voix", mid: [
    ["narr", "La route du nord s'enfonce sous des chênes si vieux que leurs branches se rejoignent. Aux plus basses pendent des cordes, et aux cordes, des chasseurs qui avaient cru connaître le chemin."],
    ["ysolde", "Des brigands y ont établi un camp. Ils paient tribut à quelque chose au cœur des bois : un cerf par lune, et parfois un des leurs."],
    ["anselme", "Les dryades de ces bois veillaient jadis sur les pèlerins. Le fragment les a rendues jalouses de tout ce qui respire."],
  ], end: [
    ["anselme", "Les arbres ont lâché leurs pendus. Nous les avons enterrés avec leurs noms, ceux qu'on a pu lire sur leurs bottes."],
  ] },
  catacombes: { at: "voix", mid: [
    ["narr", "L'abbaye de Saint-Morne est debout, intacte, et vide. Les portes de la crypte sont ouvertes de l'intérieur."],
    ["anselme", "Ils l'ont enterré avec sa couronne de fer, celle qu'il portait avant l'autre, et ont juré de veiller sur sa tombe jusqu'à la fin des temps. Ils tiennent parole, à leur façon."],
    ["maugrin", "Prenez des masses. Les os, ça ne craint pas les lames."],
  ], end: [
    ["maugrin", "J'ai pesé la couronne de fer : plus lourde qu'une enclume. Aldemar la portait tous les jours, et il souriait sur ses portraits."],
  ] },
  marais: { at: "voix", mid: [
    ["narr", "La route s'arrête où l'eau commence. Des lanternes flottent sur le marais sans que personne ne les porte, et la vase avale les pas sans bruit."],
    ["ysolde", "Une hydre garde le chenal principal. Les pêcheurs lui jettent leurs prises pour passer. Nous n'avons pas de poisson."],
    ["anselme", "La reine noyée s'appelait Ilse. Elle avait dix-sept ans. On a gratté son nom de tous les registres de la Citadelle."],
  ], end: [
    ["ysolde", "Elle ne voulait pas l'éclat. Elle voulait qu'on se souvienne de son nom. Ilse. Je l'ai gravé sur le mur de la taverne."],
  ] },
  citadelle: { at: "voix", mid: [
    ["narr", "La Citadelle de Cendres est posée sur la colline comme une couronne sur un crâne. Ses murs sont noirs, mais ses fenêtres brillent de l'intérieur, toutes à la fois."],
    ["ysolde", "Ses chevaliers lui sont restés fidèles après leur mort. Un bourreau garde la porte du trône : il n'a jamais raté une tête, dit la chanson."],
    ["anselme", "Si nous tombons là-haut, le Bastion tombe avec nous. Personne d'autre ne viendra."],
  ], end: [
    ["ysolde", "Le Roi de Cendres a dit un dernier mot avant de s'effondrer. Pas un nom. Juste « enfin »."],
  ] },
  terres: { at: "voix", repl: [["Au matin, l'autel", "Au matin, l'autel de la chapelle est vide. Les cinq fragments ont disparu, et Frère Anselme a le front en sang."]], mid: [
    ["narr", "À l'est, la terre est fendue comme une croûte de pain trop cuit. Des pèlerins y marchent pieds nus sur la braise, en chantant."],
    ["maugrin", "Un colosse de braise garde la route. J'ai vu ses traces : des pas de trois coudées, et le sable fondu en verre dedans."],
    ["anselme", "Le Cardinal a toujours dit que la Couronne devait revenir à l'Église. Il a attendu cent ans que quelqu'un d'autre fasse le travail."],
  ], end: [
    ["maugrin", "Les fragments sont tièdes, comme une bête qui dort. Je leur forge un coffre de plomb, et je dormirai à côté."],
  ] },
  abime: { at: "voix", mid: [
    ["narr", "Les marches de l'Abîme sont taillées pour des pieds plus grands que les nôtres. Elles descendent en spirale, et chaque palier porte un nom gravé, celui d'un roi."],
    ["maugrin", "J'ai fait des cordes, des pitons et des lanternes à l'huile de baleine. Ça ne vous ramènera pas, mais vous verrez où vous tombez."],
  ] },
  cimes: { at: "voix", repl: [
    ["Il y en avait une. Les chroniques", "Il y en avait une. Mais les chroniques parlent d'une fiancée qu'Aldemar a abandonnée pour épouser Ilse. Elle s'est faite reine de l'hiver, et elle n'a jamais cessé d'attendre."],
    ["Ma sœur la Reine", "Ma première promise garde ce qui m'appartient. Allez donc le lui demander. Elle a toujours aimé les visiteurs… congelés."],
  ], mid: [
    ["narr", "Au-delà du col du Givre, les morts gelés montent la garde. Leurs yeux suivent les vivants, et le givre craque quand ils tournent la tête."],
    ["ysolde", "Le Jarl de ces montagnes a juré fidélité à la Reine de l'Hiver. Il est mort, mais pas son serment."],
    ["maugrin", "Huile de phoque sur les lames, laine sous les mailles. Le froid tue plus sûrement que les loups."],
  ], end: [
    ["anselme", "Elle attendait un fiancé qui l'avait oubliée. Elle avait gardé son anneau, gelé à son doigt."],
  ] },
  cite: { at: "voix", mid: [
    ["narr", "Les rues de la cité engloutie sont pavées de coquillages. Les maisons ont gardé leurs meubles, leurs tables mises, et leurs habitants, assis, la bouche pleine d'eau."],
    ["ysolde", "Quelque chose de très grand nage dans les citernes. Les égoutiers l'appellent le Léviathan, et ils ne descendent plus."],
    ["anselme", "Le frère d'Aldemar s'appelait Ys. Il était l'aîné. La couronne aurait dû lui revenir."],
  ], end: [
    ["maugrin", "Une lettre de frère à frère, et pas un mot d'amour dedans. Juste des comptes."],
  ] },
  mines: { at: "end", mid: [
    ["narr", "Les galeries descendent si profond que l'air devient chaud et lourd. Les rails sont encore là, et des wagons pleins d'un minerai noir qui palpite."],
    ["maugrin", "Le Contremaître de fer surveille encore la cadence. Il fouette les mineurs morts pour qu'ils creusent plus vite. Ils creusent depuis cent ans."],
    ["ysolde", "Maugrin, tu es sûr de vouloir venir ?"],
    ["maugrin", "Mon arrière-grand-père est en bas. Je lui dois au moins ça."],
  ], end: [
    ["maugrin", "J'ai trouvé le marteau de mon arrière-grand-père. Il avait gravé un seul mot sur le manche : « pardon »."],
  ] },
  trone: { at: "voix", repl: [["Les neuf fragments", "Les huit fragments posés sur l'autel se mettent à briller ensemble, en dessinant une couronne autour d'une place vide."]], mid: [
    ["narr", "L'escalier de la salle du sacre compte mille marches. Sur chacune, un nom gravé : celui d'un roi ou d'une reine qui a porté la Couronne avant Aldemar."],
    ["ysolde", "Le Champion du Roi garde la dernière porte. Il a gagné mille duels. Il n'en a jamais perdu un seul, parce qu'il ne s'arrête que quand l'autre meurt."],
    ["anselme", "Aldemar n'était pas le premier. Il était seulement le dernier à y croire."],
  ], end: [
    ["maugrin", "Le cœur de la Couronne est froid. Je pourrais la fondre, maintenant. Mais je n'ose pas."],
  ] },
  racines: { at: "voix", repl: [["La Couronne brisée, l'Abîme", "La Couronne, entière et muette, repose dans son coffre de plomb. Mais l'Abîme s'est ouvert plus grand, et au fond, des racines larges comme des tours percent la roche."]], mid: [
    ["narr", "Plus bas que la dernière marche, la roche cède la place au bois. Un bois noir, veiné de sève qui luit comme des braises sous l'écorce."],
    ["anselme", "Les racines ont percé les tombes de chaque roi enterré dans le royaume. Elles ont bu leurs os, leurs couronnes, leurs souvenirs."],
    ["ysolde", "Un arbre se tient au milieu de la galerie, couvert de pendus. Les branches se tendent quand on passe. Les éclaireurs l'appellent l'Arbre aux Pendus."],
    ["maugrin", "Haches, cognées, feu. Tout ce qui fait peur au bois."],
    ["capitaine", "Et la Mère de tout ça ? Où dort-elle ?"],
    ["anselme", "Là où toutes les racines se rejoignent. Suivez celle qui bat."],
  ], end: [
    ["maugrin", "Je l'ai mise dans un coffret de plomb, triple serrure. Elle bat contre le couvercle comme un oiseau en cage."],
    ["ysolde", "Une graine, ça veut pousser. Et ça trouve toujours une fissure."],
  ] },
  sel: { at: "end", mid: [
    ["narr", "Les serrures n'ont pas été forcées : elles ont été rongées de l'intérieur, par le sel."],
    ["anselme", "À l'est s'étendait jadis la mer de Saumure. Elle s'est retirée le jour du premier sacre, il y a mille ans. Ce qu'elle a laissé derrière elle n'a jamais pourri."],
    ["ysolde", "Des statues de sel jalonnent la piste. Ce ne sont pas des statues : elles ont des alliances aux doigts."],
    ["maugrin", "Prenez de l'eau. Beaucoup d'eau. Le sel boit tout ce qu'il touche, et il a soif depuis mille ans."],
    ["anselme", "Une reine règne sur ce désert. Elle n'a jamais voulu mourir, et le sel l'a exaucée."],
  ], end: [
    ["anselme", "La graine a laissé des pousses blanches dans le sel. Elle se nourrit en marchant."],
  ] },
  pendus: { at: "voix", mid: [
    ["narr", "Sur la colline, chaque arbre porte une potence, et chaque potence une corde neuve, nouée avec soin. Les nœuds sont tous les mêmes : ceux d'un bourreau royal."],
    ["ysolde", "Un juge tient audience sous le plus grand chêne. Il condamne tous ceux qui passent, pour des crimes qu'ils n'ont pas encore commis."],
    ["maugrin", "Les corbeaux d'ici ne mangent pas les morts. Ils attendent qu'on les rejoigne."],
    ["anselme", "Le Seigneur du Gibet était le bourreau des rois. Chaque pendu ici est quelqu'un qu'il a pendu pour eux."],
  ], end: [
    ["anselme", "La pousse est noire, droite, et elle n'a pas d'ombre."],
  ] },
  monastere: { at: "end", mid: [
    ["narr", "Ses moines ont fait vœu de silence il y a mille ans. Leurs lèvres sont cousues d'un fil d'or, et pourtant le murmure ne s'arrête jamais."],
    ["anselme", "Mon ordre est né ici, Capitaine. Nous l'avions oublié. Ou on nous l'avait fait oublier."],
    ["ysolde", "Le Prieur du Silence garde le cloître. Il punit chaque mot prononcé à voix haute, et il a l'ouïe fine."],
    ["maugrin", "On entrera sans parler, alors. Ça me changera."],
    ["anselme", "Une voix s'éteint chaque nuit. Quand la dernière se taira, ce qu'ils retiennent se réveillera."],
  ], end: [
    ["ysolde", "Ils prient encore, Frère. Tous ensemble. Je les entends à travers les murs."],
    ["anselme", "Ils ne prient plus contre lui. Ils prient pour nous."],
  ] },
  echo: { at: 1, mid: [
    ["ysolde", "J'ai vu un homme sur la crête. Il avait votre manteau, Capitaine. Votre épée. Votre visage."],
    ["anselme", "Les Terres d'Écho rendent ce qu'on leur donne. Chaque coup porté ici reviendra, plus fort."],
    ["maugrin", "Alors frappez bien la première fois."],
    ["anselme", "Depuis le Bourg, la Voix a parlé avec la bouche d'Ilse, d'Aldemar, de son frère noyé. Elle n'a jamais eu de voix à elle."],
  ], end: [
    ["ysolde", "Votre double est tombé en souriant, Capitaine. Il savait quelque chose que nous ignorons."],
  ] },
  mer_cendres: { at: "end", mid: [
    ["narr", "La mer de cendres ondule sous un vent tiède. Des épaves calcinées voguent encore, voiles brûlées, équipages assis au poste."],
    ["ysolde", "Un navire sans équipage croise au large. Il aborde tout ce qui flotte. C'est celui-là qu'on prendra."],
    ["anselme", "L'Amiral était le premier à traverser cette mer, du temps où elle était d'eau. Il cherche encore la rive."],
    ["maugrin", "J'ai calfaté une barque pour vous mener jusqu'à lui. Le reste, c'est votre affaire."],
  ], end: [
    ["maugrin", "La barque a tenu. Je la garde : on ne sait jamais quand il faudra traverser à nouveau."],
  ] },
  cathedrale: { at: "voix", mid: [
    ["narr", "On y entre par le clocher, et l'on descend vers le chœur, tout en bas, où des cierges coulent vers le haut."],
    ["anselme", "On y dit la messe à l'envers. Les cantiques commencent par la fin. Les hosties sont noires."],
    ["ysolde", "Une cloche vivante sonne au fond de la nef. Chaque coup fait saigner les oreilles, et ceux qui l'écoutent trop longtemps se mettent à prier."],
    ["maugrin", "Bouchez-vous les oreilles avec de la cire. Et si la cloche se tait, méfiez-vous encore plus."],
  ], end: [
    ["anselme", "Avant de descendre, j'ai dit une prière à l'endroit. Pour une fois, je crois qu'on m'a entendu."],
  ] },
  jardin_os: { at: "end", mid: [
    ["narr", "Le jardin est soigné avec une patience infinie. Allées ratissées, haies de côtes taillées au cordeau, parterres de crânes en fleurs."],
    ["anselme", "Le Jardinier ne tue pas. Il ramasse. Tout ce qui meurt dans l'Abîme finit ici, planté avec soin."],
    ["ysolde", "Au centre, un arbre fait de côtes entrelacées. Il garde la serre où pousse la graine."],
    ["maugrin", "Pas de feu ici. Les os ne brûlent pas, et vous mettriez le jardinier en colère."],
  ], end: [
    ["ysolde", "Il m'a offert une fleur avant de mourir. Une fleur d'os, parfaite. Je l'ai gardée."],
  ] },
  faille: { at: "voix", mid: [
    ["anselme", "Les anciens disaient que les étoiles étaient les âmes des rois. Si c'est vrai, elles tombent toutes ici."],
    ["ysolde", "Un chevalier en armure d'étoile garde la faille. Il ne parle pas. Il regarde en bas, toujours, comme s'il attendait quelque chose."],
    ["maugrin", "J'ai forgé avec du fer tombé du ciel, une fois. Il chantait sous le marteau. Ce fer-là doit hurler."],
  ], end: [
    ["maugrin", "J'ai ramassé un éclat d'étoile morte. Il est froid comme le premier fragment de la Couronne. Je crois que c'est le même métal."],
  ] },
  coeur: { at: "voix", mid: [
    ["narr", "Plus de ciel, plus de sol. Seulement des parois rouges qui battent, des veines larges comme des rivières, et une chaleur de ventre."],
    ["anselme", "Le cœur du monde. Chaque roi a voulu le posséder. Aldemar a forgé la Couronne pour l'enchaîner, et il a cru que c'était lui qui commandait."],
    ["ysolde", "Une valve garde l'entrée. Elle s'ouvre et se ferme au rythme du battement. Il faudra passer entre deux coups."],
    ["maugrin", "Tout ce que j'ai forgé depuis le premier jour vous a menés ici. Ramenez-moi les armures. Même cabossées."],
    ["anselme", "L'Enfant de la Graine dort contre le cœur. Il n'est pas méchant, Capitaine. Il a faim, c'est tout. Il a toujours eu faim."],
  ], end: [
    ["ysolde", "Le soleil, Capitaine. Le vrai. Au-dessus du Bastion."],
    ["maugrin", "Je vais rallumer la Forge. Pas pour la guerre, cette fois. Pour des socs de charrue."],
  ] },
};
try { if (STORY && STORY.intro && STORY.intro[2]) STORY.intro[2] = "Vous êtes le dernier capitaine du Bastion. Recrutez des âmes perdues, menez-les dans l'ombre, et reprenez un à un les éclats de la Couronne."; } catch (e) { }
for (const k of Object.keys(STORY_MORE)) {
  const X = STORY_MORE[k];
  try {
    const Sc = SCENES[k];
    if (Sc && !Sc._more) {
      let L = Sc.lines.slice();
      for (const [old, nw] of X.repl || []) { const i = L.findIndex(l => l[1].startsWith(old)); if (i >= 0) L[i] = [L[i][0], nw]; }
      if (X.mid && X.mid.length) {
        let at = X.at === "end" ? L.length : typeof X.at === "number" ? X.at : -1;
        if (X.at === "voix") at = L.findIndex(l => l[0] === "voix");
        if (at < 0) at = Math.max(1, L.length - 1);
        L = L.slice(0, at).concat(X.mid, L.slice(at));
      }
      Sc.lines = L; Sc._more = 1;
    }
    if (X.end && X.end.length && SCENE_END[k] && !SCENE_END[k]._more) { const E = SCENE_END[k].concat(X.end); E._more = 1; SCENE_END[k] = E; }
  } catch (e) { }
}

// ── Histoires du Bastion : une petite scène à chaque niveau de bâtiment (2 à 10) ──
const BLD_STORY = {
  taverne: {
    2: [["narr", "Quelqu'un a rebouché les trous du toit et remis un tonneau en perce. La Taverne du Pendu rouvre ses volets pour la première fois depuis la peste."], ["ysolde", "Une bière tiède et un feu qui fume. Pour nos gars, c'est déjà un palais."]],
    3: [["ysolde", "La taverne se remplit. Des déserteurs, des veuves, des fous. Exactement ce qu'il nous faut."], ["narr", "Un vieux soldat s'assoit dans un coin, commande à boire, et pose son épée sur la table. Il ne repartira pas."]],
    4: [["narr", "Un tavernier est arrivé de la côte avec deux mules et un baril de vin du sud. Il dit que là-bas, les morts sortent de la mer, et qu'il ne veut plus jamais voir d'eau."], ["ysolde", "Tant qu'il ne met pas d'eau dans le vin, il peut rester."]],
    5: [["ysolde", "On refuse du monde, Capitaine. Le bruit court qu'au Bastion, on rend les coups à la Cendre."], ["anselme", "Les pèlerins s'arrêtent ici avant de partir sur les routes. Ils laissent des cierges sur le comptoir. Je ne sais pas à qui ils les offrent."]],
    6: [["narr", "Un ménestrel a écrit une chanson sur vos exploits. Elle est fausse d'un bout à l'autre, et toute la salle la connaît par cœur."], ["capitaine", "« Le Capitaine aux mille cicatrices » ? Je n'en ai que trois."], ["ysolde", "Laissez-les rêver. C'est ce qui les fait revenir."]],
    7: [["narr", "On a ajouté un étage, des chambres, et un tableau où les recrues inscrivent leur nom. La craie ne suffit plus : il faut graver dans le bois."], ["ysolde", "Des mercenaires de l'autre côté des montagnes. Ils ne parlent pas notre langue, mais ils comprennent très bien le mot « or »."]],
    8: [["narr", "L'Auberge fortifiée a désormais des murs de pierre et une herse. Les marchands y dorment en sécurité, et les héros y racontent leurs histoires jusqu'à l'aube."], ["maugrin", "J'ai forgé la grille de la cheminée. Si un spectre essaie de descendre par là, il finira en tranches."]],
    9: [["narr", "Des héros d'autres royaumes demandent audience. Ils ont entendu parler du Bastion jusque dans les cités libres de l'est."], ["ysolde", "Une chevalière du Nord m'a provoquée en duel pour savoir si notre réputation était méritée. Elle boit avec nous, maintenant."]],
    10: [["narr", "La Salle des Héros : une grande nef de chêne où brûle un feu qui ne s'éteint jamais. Aux murs, les boucliers de tous ceux qui sont tombés pour le Bastion."], ["anselme", "Chaque soir, on lit un nom. Chaque soir, quelqu'un se lève pour prendre sa place."], ["capitaine", "Alors il y aura toujours quelqu'un."]],
  },
  forge: {
    2: [["maugrin", "J'ai retrouvé mon enclume sous les gravats. Fendue, mais elle chante encore. On va pouvoir faire mieux que des couteaux à pain."]],
    3: [["maugrin", "Le nouveau soufflet tire comme un dragon. Rapportez-moi du bon fer et je vous forgerai des armures dignes d'un roi."], ["ysolde", "Pas d'un roi. On en a déjà un, et il est mort deux fois."]],
    4: [["narr", "Deux apprentis sont arrivés, des orphelins du Bourg. Maugrin grogne qu'ils sont maladroits. Il leur a quand même donné ses vieux tabliers."], ["maugrin", "Le premier qui touche au creuset sans moi, je le trempe avec l'acier."]],
    5: [["maugrin", "Cette enclume a été bénie par trois prêtres et maudite par un quatrième. C'est ce qu'il faut pour travailler l'acier des cendres."]],
    6: [["maugrin", "J'ai appris à tremper l'acier dans l'eau bénite et le sang de bête. Il en ressort noir et dur comme une rancune. Les armures de voie, je peux les faire, maintenant."], ["anselme", "Mon eau bénite, Maugrin ? Toute ma réserve ?"], ["maugrin", "Elle protégera nos gars. C'est mieux que de dormir dans un bénitier."]],
    7: [["narr", "La forge tourne nuit et jour. Une deuxième cheminée est sortie de terre, et le fracas des marteaux couvre le vent."], ["maugrin", "Le fer des montagnes, c'est autre chose. Il se souvient de chaque coup. Il faut lui parler doucement."]],
    8: [["narr", "Des forgerons des villages brûlés sont venus prêter main-forte. Ils travaillent sans un mot et ne mangent qu'une fois par jour."], ["maugrin", "Ils connaissent des gestes que j'avais oubliés. Les gestes de mon arrière-grand-père."]],
    9: [["maugrin", "J'ai fondu une pierre tombée du ciel dans l'acier. Il a crié pendant une heure, puis il s'est tu. La lame qui en est sortie ne rouille pas, et elle ne reflète rien."], ["ysolde", "Une lame sans reflet. Je la veux."]],
    10: [["narr", "La Grande Forge occupe tout le flanc du Bastion. Ses fourneaux éclairent la nuit comme un second soleil, et l'on entend ses enclumes jusqu'au Bourg."], ["maugrin", "Il n'y a plus rien que je ne puisse forger. Sauf une couronne. Ça, jamais plus."]],
  },
  chapelle: {
    2: [["anselme", "J'ai balayé les gravats et relevé l'autel. Il manque la moitié du toit, mais Dieu voit mieux à travers les trous."]],
    3: [["anselme", "J'ai rallumé les cierges de la nef. La lumière tient mieux, maintenant. Les blessés dorment sans cris."]],
    4: [["narr", "Deux sœurs hospitalières sont arrivées du sud avec des herbes, du fil et des onguents. Elles parlent peu et recousent vite."], ["anselme", "Elles ont soigné plus de blessés en une semaine que moi en un mois. Je prie, elles cousent. C'est un bon partage."]],
    5: [["anselme", "Le fragment de la Couronne ne chuchote plus quand je prie à côté. Je ne sais pas si c'est bon signe."]],
    6: [["narr", "Un vitrail neuf orne le chœur : quatre silhouettes sans visage marchent vers une couronne brisée. Les verriers ont refusé d'être payés."], ["anselme", "Ce sont vous, Capitaine. Les gens ont besoin de saints. Pardonnez-leur."]],
    7: [["anselme", "Des pèlerins nous ont confié les reliques d'un saint oublié. Elles reposent ici, désormais. Les malades guérissent plus vite quand ils dorment près d'elles."], ["ysolde", "Ou alors ce sont les sœurs."], ["anselme", "Les deux, sans doute."]],
    8: [["narr", "L'Église fortifiée a désormais un clocher de pierre et des murs épais. Quand la cloche sonne, les morts des environs se rendorment."], ["anselme", "Une cloche qui sonne pour les vivants. Ça faisait longtemps."]],
    9: [["anselme", "Un moine est arrivé d'on ne sait où, les lèvres cousues d'un fil d'or. Il ne parle pas. Il prie à côté de moi, chaque nuit."], ["narr", "Depuis qu'il est là, les cauchemars des héros se font plus rares."]],
    10: [["narr", "La Cathédrale de l'Ordre s'élève au-dessus du Bastion. Ses voûtes sont si hautes qu'on y voit les nuages entrer par les rosaces."], ["anselme", "J'ai été un moine sans église, un chapelain sans fidèles. Regardez-nous maintenant."], ["capitaine", "C'est vous qui l'avez bâtie, Frère."], ["anselme", "Non. Ce sont ceux qui sont revenus."]],
  },
  academie: {
    2: [["ysolde", "J'ai planté des mannequins de paille dans la cour. Il pleut dessus, ils pourrissent, et nos recrues tapent dedans quand même. C'est un début."]],
    3: [["ysolde", "J'ai trouvé deux vieux maîtres d'armes dans les ruines. Ils boitent, mais ils frappent juste."]],
    4: [["narr", "Une bibliothèque de fortune s'est installée sous les combles : traités d'escrime, bestiaires, carnets de chasseurs morts."], ["anselme", "Chaque monstre a une faiblesse. Il suffit que quelqu'un l'ait écrite avant de mourir."]],
    5: [["anselme", "La bibliothèque de l'ordre est presque complète. Il manque un seul livre : celui qui raconte la fin d'Aldemar."]],
    6: [["ysolde", "Les maîtres enseignent maintenant les voies : la lumière, le sang, l'ombre, la rage. Chacun choisit la sienne. Certains en meurent."], ["narr", "Dans la cour, une recrue tient sa garde depuis l'aube. Elle ne baissera pas les bras avant que la maîtresse d'armes le lui dise."]],
    7: [["narr", "Un vieux mage aveugle est venu proposer ses services. Il ne voit rien, mais il sait toujours où frapper."], ["ysolde", "Il m'a désarmée trois fois. Je l'ai engagé."]],
    8: [["narr", "La Haute Salle des maîtres a son propre cloître, ses salles d'armes et une tour d'étude. Les héros y apprennent ce que les livres n'osent pas écrire."], ["anselme", "J'ai enfin trouvé le livre qui manquait. Aldemar n'a pas été tué. Il s'est couronné, et il a disparu."]],
    9: [["ysolde", "Les anciens élèves reviennent enseigner. Certains ont des cicatrices que je leur ai faites. Ils me remercient."], ["narr", "Sur le mur de la grande salle, une liste de noms s'allonge : ceux qui ont maîtrisé leur voie."]],
    10: [["narr", "La Citadelle des Grands Maîtres domine le Bastion. On y vient de tous les royaumes pour apprendre à combattre ce qui ne devrait pas exister."], ["ysolde", "Quand je suis arrivée, il y avait quatre épées et un capitaine. Maintenant, il y a une école."], ["capitaine", "Il y a toujours quatre épées, Ysolde. Les meilleures."]],
  },
  menagerie: {
    2: [["narr", "Un enclos de planches, une mangeoire et une botte de paille. Le premier compagnon y dort en boule, le museau tourné vers la porte."], ["ysolde", "Les bêtes sentent la peur. Celle-là a senti la nôtre, et elle est restée."]],
    3: [["ysolde", "Les bêtes sentent la Cendre avant nous. Écoutez-les quand elles grognent dans le noir."]],
    4: [["narr", "Un dresseur des montagnes est arrivé avec un faucon sur le poing et des cicatrices plein les bras. Il parle aux bêtes plus qu'aux hommes."], ["maugrin", "Il m'a demandé des colliers en fer. Il dit que les bêtes de l'Abîme mangent le cuir."]],
    5: [["narr", "Les cages ont été renforcées. La nuit, on entend hurler, griffer et chanter, des bruits qu'aucune bête ordinaire ne fait."], ["anselme", "J'ai béni les enclos. Une des créatures a béni les miens en retour. Je n'ai pas osé demander comment."]],
    6: [["ysolde", "Une louve des montagnes a mis bas dans la paille. Six petits, les yeux déjà ouverts, déjà méfiants."], ["narr", "Les recrues se disputent pour les nourrir. Les petits mordent tout le monde, sauf le Capitaine."]],
    7: [["narr", "Un enclos de pierre accueille désormais des bêtes trop dangereuses pour la paille : une salamandre de braise, un corbeau qui parle, un cerf aux bois tordus comme des racines."], ["maugrin", "Le corbeau m'appelle par mon nom. Je ne le lui ai jamais dit."]],
    8: [["narr", "La Grande Ménagerie a ses fosses, ses volières et ses bassins. Les bêtes de tous les chapitres y vivent côte à côte, et étrangement, elles ne se battent pas."], ["ysolde", "Elles savent qui est l'ennemi. Mieux que certains hommes."]],
    9: [["narr", "Un compagnon revenu d'expédition a rapporté dans sa gueule un os gravé de runes. Le dresseur l'a enterré au fond de l'enclos, sous une pierre."], ["anselme", "Des runes de l'ancien sacre… Surveillez cet endroit. Jour et nuit."]],
    10: [["narr", "Le Donjon des Bêtes est une forteresse à part entière. Ses tours abritent des créatures que les bestiaires disaient éteintes depuis des siècles."], ["ysolde", "On a commencé avec un loup maigre et une botte de paille."], ["capitaine", "Et ce loup dort toujours devant la porte."]],
  },
  fonderie: {
    2: [["maugrin", "J'ai rallumé le vieux four. Il fume, il tousse, mais il crache de l'or. Un peu."]],
    3: [["maugrin", "La fonderie tourne même la nuit. Les âmes coincées dans le minerai, ça chauffe bien, faut croire."]],
    4: [["narr", "Des mineurs du Bourg ont rejoint la fonderie. Ils ramènent du minerai des collines et repartent avec un salaire et une soupe chaude."], ["maugrin", "Ils ne posent pas de questions sur les cris dans le four. Je les aime bien."]],
    5: [["anselme", "Le minerai qui sort de la fonderie est trop pur, Maugrin. On dirait qu'il a été purifié par le feu… et par autre chose."], ["maugrin", "Il est purifié par les âmes qui partent en fumée. Elles sont plus légères en sortant. Je crois qu'elles nous remercient."]],
    6: [["narr", "Une roue à aubes a été construite sur le ruisseau. Elle actionne les soufflets jour et nuit, et sa chanson grinçante berce tout le Bastion."], ["maugrin", "Le rendement a doublé. Le bruit aussi."]],
    7: [["narr", "Un marchand des cités libres a ouvert un comptoir à la fonderie. Il achète les éclats, revend des essences, et prend sa part sur tout."], ["ysolde", "Il sourit trop pour être honnête."], ["maugrin", "Il paie trop bien pour être pendu."]],
    8: [["narr", "Trois hauts fourneaux brûlent désormais côte à côte. La nuit, la fonderie éclaire tout le versant comme un incendie qui ne prend jamais."], ["maugrin", "Les âmes qui montent par la cheminée dessinent des visages dans la fumée. Les enfants du Bastion leur font signe."]],
    9: [["maugrin", "J'ai trouvé dans le minerai une pièce d'or frappée à l'effigie d'Aldemar. Une seule. Elle est froide, et elle pèse plus lourd que toutes les autres."], ["anselme", "Gardez-la loin du trésor, Maugrin."], ["maugrin", "Elle est au fond du puits. Avec une pierre dessus."]],
    10: [["narr", "La Fonderie d'Âmes est devenue une cité de forges et de fourneaux. L'or y coule comme de l'eau, et le Bastion ne manquera plus jamais de rien."], ["maugrin", "On a commencé avec un four qui toussait. Regardez-le maintenant : il chante."], ["capitaine", "Il chante pour qui ?"], ["maugrin", "Pour ceux qui ne reviennent pas. Ça les aide à monter."]],
  },
};
for (const k of Object.keys(BLD_STORY)) BLD_SCENES[k] = Object.assign({}, BLD_SCENES[k] || {}, BLD_STORY[k]);
