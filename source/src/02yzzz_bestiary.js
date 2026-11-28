/* ═══════════ Bestiaire étoffé : au moins dix créatures ordinaires par chapitre ═══════════
   99 nouvelles créatures peintes (planches Canva 3×3 → assets/mon_<clé>.webp, regroupées dans dist en planches mx_<n>).
   Une créature n'entre dans le chapitre qu'une fois peinte (mon_<clé> dans ART_LIST) ; sous node (sim) tout est actif.
   Gabarits ARCH (02yzz) ramenés à la force moyenne des créatures déjà présentes dans le chapitre. */
const BESTIARY_MORE = {
  bourg: [
    ["fossoyeur", "Fossoyeur ivre", "humain", "brute", "Il creuse depuis le début de l'épidémie. Il ne fait plus la différence entre les morts et les vivants, et ça ne le dérange plus."],
    ["nonne_peste", "Nonne pestiférée", "humain", "healer", "Elle soigne encore. Ses onguents sont faits de ce qu'elle racle sur les malades, et ils guérissent — un peu, mal, pour un temps."],
    ["mouches", "Essaim bourdonnant", "bete", "swift", "Des milliers de mouches gorgées de peste. Quand elles se posent ensemble, elles prennent la forme de quelqu'un."],
    ["enfant_bubons", "Enfant aux bubons", "impie", "caster", "Il ne pleure jamais. Ses bubons luisent dans le noir, et ceux qui le regardent trop longtemps se mettent à tousser."],
    ["equarrisseur", "Équarrisseur", "humain", "tank", "Le bourg lui confiait les bêtes mortes. Puis on lui a confié les hommes. Il a gardé son tablier."],
    ["chat_noir", "Chat de gouttière", "bete", "swift", "Gros comme un chien, nourri de rats eux-mêmes nourris de morts. Ses yeux brûlent comme des braises."],
  ],
  foret: [
    ["sanglier_noir", "Sanglier noir", "bete", "tank", "Ses défenses sont noires de sang séché. Les bûcherons disent qu'il ne mange plus de glands depuis l'hiver de la Couronne."],
    ["chasseur_fou", "Chasseur égaré", "humain", "swift", "Parti traquer le cerf blanc il y a dix ans. Il porte aujourd'hui ses bois sur la tête et ne se souvient plus de son nom."],
    ["myconide", "Myconide", "impie", "healer", "Un champignon qui a appris à marcher en poussant dans un cadavre. Ses spores referment les plaies… des siens."],
    ["grand_duc", "Grand-duc spectral", "bete", "caster", "Son cri annonce une mort dans la nuit. Ces temps-ci, il crie sans arrêt."],
    ["troll_mousse", "Troll des mousses", "bete", "brute", "Il dormait sous la colline depuis avant les rois. Le bruit des pendus qui se balancent l'a réveillé."],
  ],
  catacombes: [
    ["porte_cercueil", "Porte-cercueil", "impie", "tank", "Il porte son propre cercueil comme un bouclier. Il attend d'y retourner, mais pas seul."],
    ["rat_os", "Rat des ossuaires", "bete", "swift", "Il a rongé tant d'os qu'il en est devenu un. Il court encore plus vite sans chair."],
    ["soeur_os", "Sœur des ossements", "impie", "healer", "Elle allume des cierges pour les morts depuis trois siècles. Ses prières recousent les squelettes brisés."],
  ],
  marais: [
    ["moustique", "Moustique géant", "bete", "swift", "Il boit un homme en une nuit. Le marais en est plein, et ils ont tous soif."],
    ["tortue_vase", "Tortue des vases", "bete", "tank", "Une carapace couverte de mousse et d'ossements. Elle attend, la gueule ouverte, depuis des générations."],
    ["homme_tourbe", "Homme de tourbe", "impie", "brute", "Les tourbières conservent les noyés intacts. Celui-ci s'est relevé avec la corde encore au cou."],
    ["chaman_batracien", "Chaman batracien", "impie", "healer", "Les hommes-grenouilles l'écoutent comme un prophète. Ses totems de crânes gardent ses fidèles en vie."],
  ],
  citadelle: [
    ["arbaletrier_dechu", "Arbalétrier déchu", "humain", "swift", "Il gardait les remparts d'Aldemar. Il les garde encore, et tire sur tout ce qui monte."],
    ["geolier", "Geôlier", "humain", "tank", "Il a les clés de toutes les cellules. Personne n'est jamais sorti, et il compte bien que cela dure."],
    ["chien_guerre", "Chien de guerre", "bete", "swift", "Bardé de fer, dressé à mordre aux jarrets. Ses maîtres sont morts ; il obéit encore à leurs ordres."],
    ["chapelain_noir", "Chapelain noir", "humain", "healer", "Il bénissait les armées du roi. Il bénit maintenant ce qui reste d'elles, et ce qui reste se relève."],
    ["heraut_flammes", "Héraut des flammes", "impie", "caster", "Il sonne du cor et le feu répond. Chaque note annonce l'arrivée d'un roi qui ne viendra plus."],
    ["chevalier_corbeau", "Chevalier corbeau", "impie", "brute", "Un heaume à bec de corbeau, un fléau d'armes. On dit que les corbeaux de la citadelle sont ses yeux."],
  ],
  terres: [
    ["salamandre", "Salamandre de braise", "bete", "swift", "Elle nage dans la lave comme une anguille dans l'eau. Sa morsure ne saigne pas : elle cautérise."],
    ["errant_cendre", "Errant de cendre", "impie", "brute", "Un homme pris dans l'incendie qui n'a jamais cessé de marcher. Sa peau craquelée laisse voir les braises."],
    ["vautour_calcine", "Vautour calciné", "bete", "caster", "Il tourne au-dessus des Terres Brûlées en attendant que la chaleur fasse son travail."],
    ["pretresse_braise", "Prêtresse de braise", "humain", "healer", "Elle prie le feu de rendre ce qu'il a pris. Parfois, il le rend — à moitié brûlé."],
    ["tortue_magma", "Tortue de magma", "bete", "tank", "Sa carapace est une croûte de roche fondue. Frappez-la, et elle saigne du feu."],
  ],
  cimes: [
    ["yeti", "Yéti des cimes", "bete", "brute", "Les montagnards l'appellent le Vieux. Il garde les cols, et il ne laisse passer personne deux fois."],
    ["aigle_givre", "Aigle de givre", "bete", "swift", "Ses plumes sont des lames de glace. Il plonge du ciel sans un bruit."],
    ["chamane_glace", "Chamane des glaces", "humain", "healer", "Elle parle aux morts gelés dans les glaciers. Ils lui répondent, et ils lui obéissent."],
    ["golem_glace", "Golem de glace", "impie", "tank", "Un glacier qui s'est levé. Il fond un peu à chaque coup, mais la montagne le reconstruit."],
    ["ame_gelee", "Âme gelée", "impie", "caster", "Un voyageur mort de froid dont l'âme n'a pas pu quitter la glace. Elle cherche quelqu'un pour partager son hiver."],
  ],
  cite: [
    ["meduse_abyssale", "Méduse abyssale", "bete", "caster", "Elle flotte entre les colonnes de la cité noyée, et ses filaments paralysent ce qu'ils effleurent."],
    ["garde_noye", "Garde noyé", "impie", "tank", "Il gardait la porte quand la mer est entrée. Le corail a remplacé son armure ; il garde toujours la porte."],
    ["pieuvre_ruines", "Pieuvre des ruines", "bete", "brute", "Elle a fait son nid dans la grande bibliothèque. Ses tentacules arrachent les pierres comme des pages."],
    ["nageur_aveugle", "Nageur aveugle", "impie", "swift", "Né dans le noir des profondeurs, il n'a pas d'yeux. Il n'en a pas besoin : il entend battre votre cœur."],
    ["pretresse_corail", "Prêtresse de corail", "humain", "healer", "Elle a choisi de rester quand la cité a sombré. Le corail a poussé sur elle comme une robe de cérémonie."],
  ],
  mines: [
    ["nain_dement", "Nain dément", "humain", "brute", "Il a creusé trop profond et entendu quelque chose répondre. Depuis, il creuse pour le retrouver."],
    ["araignee_cristal", "Araignée de cristal", "bete", "swift", "Ses pattes sont des éclats de quartz. Sa toile chante quand une proie s'y prend."],
    ["elementaire_charbon", "Élémentaire de charbon", "impie", "tank", "Un filon qui s'est réveillé. Il brûle lentement de l'intérieur et ne s'éteint jamais."],
    ["porion_spectral", "Porion spectral", "impie", "caster", "Il fouettait les mineurs jusqu'à la mort. Il continue, et ses morts continuent de creuser."],
    ["lueur_puits", "Lueur-de-puits", "bete", "healer", "Un champignon lumineux qui attire les mineurs perdus. Sa lueur soigne… ceux qui restent."],
  ],
  trone: [
    ["courtisan_masque", "Courtisan masqué", "humain", "caster", "Il a flatté sept rois. Sous le masque de porcelaine, il n'y a plus de visage — seulement des sourires."],
    ["lion_heraldique", "Lion héraldique", "bete", "brute", "Il a quitté la bannière royale quand le roi est mort. L'or de sa crinière est taché de rouge."],
    ["chambellan_creux", "Chambellan creux", "impie", "healer", "Il tient le protocole d'une cour morte. Il remet chaque courtisan à sa place, même en morceaux."],
    ["duelliste_cour", "Duelliste de cour", "humain", "swift", "Il a défendu l'honneur du roi en cent duels. Il n'a jamais perdu, pas même sa propre mort."],
    ["armure_apparat", "Armure d'apparat", "impie", "tank", "Une armure de parade, dorée, vide. Elle avance quand même, au pas lent des cérémonies."],
  ],
  racines: [
    ["cerf_racine", "Cerf-racine", "bete", "swift", "Ses bois sont des racines vivantes. Là où il passe, la terre se referme derrière lui."],
    ["nymphe_seve", "Nymphe de sève", "impie", "healer", "Elle coule entre les racines comme une rivière ambrée. Les blessés qu'elle touche deviennent un peu arbres."],
    ["scarabee_fouisseur", "Scarabée fouisseur", "bete", "tank", "Il mange les racines et les morts qu'elles enlacent. Sa carapace a la couleur de l'écorce."],
    ["champignon_tombal", "Champignon tombal", "impie", "caster", "Il pousse sur les tombes des rois. Ses spores font rêver de couronnes, puis de rien."],
    ["colosse_ecorce", "Colosse d'écorce", "impie", "brute", "Un tronc qui s'est arraché à la terre pour défendre la Mère. Ses poings sont des souches."],
  ],
  sel: [
    ["scorpion_sel", "Scorpion de sel", "bete", "swift", "Blanc comme le désert, invisible jusqu'à la piqûre. Son venin dessèche de l'intérieur."],
    ["momie_sel", "Momie de sel", "impie", "brute", "Le sel l'a conservée mieux que n'importe quel embaumeur. Elle se souvient de chaque coup reçu de son vivant."],
    ["esprit_sables", "Esprit des sables", "impie", "caster", "Un tourbillon de sel qui murmure avec la voix des noyés. Il aveugle avant de frapper."],
    ["carapace_sel", "Carapace de sel", "bete", "tank", "Une bête dont la carapace a cristallisé. Elle est devenue presque aussi dure que la mer qui l'a tuée."],
    ["ermite_sel", "Ermite du sel", "humain", "healer", "Il vit seul dans le désert depuis la mort de la mer. Ses onguents de saumure brûlent et guérissent."],
  ],
  pendus: [
    ["loup_gibet", "Loup du gibet", "bete", "swift", "Il rôde sous les potences en attendant que les cordes cassent. Il n'a jamais faim longtemps."],
    ["pendue_chantante", "Pendue chantante", "impie", "caster", "Elle chante la berceuse qu'elle chantait le jour de sa pendaison. Ceux qui l'écoutent sentent la corde."],
    ["bourreau_encapuchonne", "Bourreau encapuchonné", "humain", "brute", "Il a noué toutes les cordes de la colline. Il en a encore une pour chacun de vous."],
    ["chene_noueux", "Chêne noueux", "impie", "tank", "Le plus vieil arbre de la colline. Ses branches portent encore les cordes de mille pendaisons."],
    ["confesseur_pendus", "Confesseur des pendus", "humain", "healer", "Il écoutait les dernières paroles des condamnés. Il les répète maintenant, et les morts se relèvent pour l'entendre."],
  ],
  monastere: [
    ["moine_guerrier", "Moine-guerrier", "humain", "brute", "Il a fait vœu de silence et de violence. Il n'a rompu que le premier."],
    ["chauve_clocher", "Chauve-souris du clocher", "bete", "swift", "Elles vivent dans la cloche muette. Quand elles s'envolent toutes, on croit entendre sonner."],
    ["statue_saint", "Statue de saint", "impie", "tank", "Le saint de pierre a les yeux qui pleurent du sang. Il descend de son socle pour défendre le cloître."],
    ["copiste_aveugle", "Copiste aveugle", "humain", "caster", "Il a recopié le livre interdit jusqu'à en perdre la vue. Il en récite maintenant les pages, et l'air brûle."],
    ["soeur_infirmiere", "Sœur infirmière", "humain", "healer", "Elle soigne les moines depuis que le monastère s'est tu. Ils ne guérissent plus, mais ils se relèvent."],
  ],
  echo: [
    ["echo_cavalier", "Écho de cavalier", "impie", "brute", "La charge d'un cavalier mort, répétée à l'infini. On entend les sabots avant de voir la lance."],
    ["echo_assassin", "Écho d'assassin", "impie", "swift", "Le souvenir d'un coup de poignard dans le dos. Il frappe toujours au même endroit."],
    ["echo_mage", "Écho de mage", "impie", "caster", "Un sort lancé il y a mille ans qui n'a jamais fini de retentir."],
    ["echo_rempart", "Écho de rempart", "impie", "tank", "Le souvenir d'un soldat qui a tenu une porte jusqu'à la mort. Il la tient encore."],
    ["echo_chantre", "Écho de chantre", "impie", "healer", "Un chant funèbre qui ne s'est jamais tu. Il relève les échos tombés."],
  ],
  mer_cendres: [
    ["crabe_braise", "Crabe de braise", "bete", "tank", "Ses pinces rougeoient comme des tenailles de forge. Il ramasse les noyés pour les faire cuire."],
    ["goeland_suie", "Goéland de suie", "bete", "swift", "Noirs comme la cendre, ils crient au-dessus des épaves et plongent sur les yeux."],
    ["harponneur", "Harponneur calciné", "humain", "brute", "Il chassait la baleine avant que la mer ne brûle. Il chasse maintenant ce qui reste."],
    ["noye_cendre", "Noyé de cendre", "impie", "caster", "Il s'est noyé dans une mer de cendre. Quand il ouvre la bouche, c'est elle qui sort."],
    ["aumonier_bord", "Aumônier de bord", "humain", "healer", "Il bénissait les marins avant la tempête de feu. Il bénit encore l'équipage — ce qu'il en reste."],
  ],
  cathedrale: [
    ["gargouille_or", "Gargouille d'or", "impie", "tank", "Elle crachait l'eau des toits. La cathédrale renversée, elle crache maintenant vers le ciel… qui est en bas."],
    ["cherubin_creux", "Chérubin creux", "impie", "swift", "Un ange-enfant en porcelaine, vide à l'intérieur. Il rit quand il frappe."],
    ["inquisiteur_renverse", "Inquisiteur renversé", "humain", "brute", "Il brûlait les hérétiques. La foi s'est retournée ; c'est lui, maintenant, qui brûle les fidèles."],
    ["vitrail_vivant", "Vitrail vivant", "impie", "caster", "Un saint de verre coloré descendu de sa fenêtre. La lumière qui le traverse coupe comme une lame."],
    ["abbesse_doree", "Abbesse dorée", "humain", "healer", "Couverte d'or jusqu'aux yeux, elle bénit à l'envers. Ses bénédictions guérissent ce qui devrait mourir."],
  ],
  jardin_os: [
    ["mante_os", "Mante d'ossements", "bete", "swift", "Ses bras sont des faux taillées dans des fémurs. Elle prie avant de frapper."],
    ["lierre_cranes", "Lierre aux crânes", "impie", "caster", "Il pousse sur les murs du jardin et porte des crânes en guise de fleurs. Ils chuchotent ensemble."],
    ["tortue_ossuaire", "Tortue-ossuaire", "bete", "tank", "Sa carapace est faite de côtes cousues. Elle porte sur son dos tout un cimetière."],
    ["cueilleur_dents", "Cueilleur de dents", "humain", "brute", "Le Jardinier lui a confié la récolte. Il a une pince, un sac, et il n'est jamais rassasié."],
    ["phalene_bleme", "Phalène blême", "bete", "healer", "Ses ailes sont fines comme de la peau. La poussière qu'elles laissent tomber referme les os brisés."],
  ],
  faille: [
    ["fragment_meteore", "Fragment de météore", "impie", "tank", "Un morceau d'étoile tombé dans la faille. Il brûle encore, et il ne veut pas qu'on l'approche."],
    ["loup_astral", "Loup astral", "bete", "swift", "Sa fourrure est une nuit étoilée. Il hurle à une lune qui n'existe pas encore."],
    ["mage_confins", "Mage des confins", "humain", "caster", "Il a regardé dans la faille pour en percer le secret. La faille l'a regardé en retour."],
    ["colosse_vide", "Colosse du vide", "impie", "brute", "Un géant fait de nuit pure. Là où il frappe, il ne reste qu'une absence."],
    ["nonne_astres", "Nonne des astres", "humain", "healer", "Elle prie les étoiles mortes. Elles lui répondent avec une lumière qui guérit et qui aveugle."],
  ],
  coeur: [
    ["caillot", "Caillot", "impie", "tank", "Un bloc de sang noir durci. Il bouche les passages du cœur du monde, et il ne bougera pas."],
    ["parasite_rouge", "Parasite rouge", "bete", "swift", "Il vit dans les veines du monde depuis toujours. Il a appris à chasser ce qui y entre."],
    ["nerf_vif", "Nerf vivant", "impie", "caster", "Un nerf du monde, à vif. Il transmet la douleur à tout ce qu'il touche."],
    ["gardien_blanc", "Gardien blanc", "impie", "brute", "Le cœur se défend. Ce chevalier pâle est sa réponse à votre intrusion."],
    ["lymphe", "Lymphe", "impie", "healer", "Une marée claire qui baigne le cœur et répare ses blessures. Les vôtres, elle les laisse ouvertes."],
  ],
};
(function () {
  const L = typeof window !== "undefined" && window.ART_LIST ? new Set(window.ART_LIST) : null; // sous node : tout est actif
  const A = Object.keys(ARCH).map(a => ARCH[a]("", "")), aHp = A.reduce((s, m) => s + m.hp, 0) / A.length, aD = A.reduce((s, m) => s + (m.dmg[0] + m.dmg[1]) / 2, 0) / A.length;
  for (const r of REGIONS) {
    const add = BESTIARY_MORE[r.id]; if (!add) continue;
    const old = r.pool.map(k => MONSTERS[k]).filter(Boolean); if (!old.length) continue;
    const hp = old.reduce((s, m) => s + m.hp, 0) / old.length, d = old.reduce((s, m) => s + (m.dmg[0] + m.dmg[1]) / 2, 0) / old.length;
    const fh = hp / aHp, fd = d / aD;
    for (const [k, n, tg, a] of add) {
      if (MONSTERS[k] || (L && !L.has("mon_" + k))) continue;
      const M = ARCH[a](n, tg); M.hp = Math.max(8, Math.round(M.hp * fh)); M.dmg = M.dmg.map(v => Math.max(1, Math.round(v * fd)));
      MONSTERS[k] = Object.assign(M, { art: k, bmore: r.id }); r.pool.push(k);
    }
  }
})();
