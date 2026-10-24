# Suivi des lots

Pour chaque lot : relecture du texte, des planches et des pièces 3D par Lamine, corrections, puis passage à « validé » dans `build/lots.json`, commit et étiquette `lot-N`.

## Lot 0 · Le vélo en 3D · en relecture

- La page d'accueil montre ton Grizl CF 8 Di2 en 3D : réf. 4556, taille M, coloris Floating Violet, pièces d'origine. Trois rendus : schéma 2D, 3D simple et 3D réaliste (three.js 0.160.0).
- Trois zones d'atelier, chacune avec sa pastille sur le vélo et sa carte dans « Où intervenir » : disques de frein, étrier et plaquettes, manettes et durites. Une pastille ou le bouton d'une carte choisit la zone : la 3D la vise et la carte devient active. Les liens de la carte mènent aux pages de ses ateliers. Sur une seule colonne, une pastille ne fait pas défiler la page, et le bouton d'une carte ramène l'image à l'écran.
- Une variante, sur la zone de l'étrier : plaquettes en place ou sorties. Les disques n'en ont plus : les Deore XT MT800 sont d'origine.
- Sans WebGL, la page passe au schéma 2D et le dit. Si un fichier de la page ne se charge pas, elle le dit aussi et retire la scène qui ne peut pas s'afficher : les liens de « Où intervenir » et le menu mènent toujours aux ateliers.
- Le site en plusieurs pages, d'après la maquette validée le 21/10/2026 : menu des catégories à gauche (derrière le bouton « Menu » sous 900 px), fil d'Ariane et recherche en haut, une page par catégorie, par atelier et par référence. Une page d'atelier a ses étapes repliables, « Tout déplier », le mode pas à pas, et à droite la planche ou la pièce 3D, ce qu'il faut démonter, « Il te faut », les couples et la vidéo. Pour un atelier qui remplace une pièce, sa page dit la pièce d'origine et la pièce à monter. Les anciennes adresses restent valables : `#freins-plaquettes` ouvre `freins/plaquettes/`. Sans JavaScript, tout reste lisible.
- Cotes : celles de la fiche Canyon et des documents Shimano, Schwalbe et Fizik enregistrés dans `src/scene/sources.js`. Ce qui n'est pas publié est dessiné au mieux et listé plus bas.
- Contrôle du site en plusieurs pages le 21/10/2026, avec `tools/scene-check.js` sur les 20 pages : 1440 x 900 en clair et en sombre, 1024 x 768, 420 x 900, 360 x 780, 420 x 900 sans WebGL, 1440 x 900 sans JavaScript, et 1440 x 900 sans réduire les animations. Aucune erreur, pas de défilement horizontal, menu hors de l'écran sous 900 px jusqu'au clic sur « Menu ». Les pastilles et les cartes de « Où intervenir », les anciennes ancres, le filtre « Remplacer », la pièce 3D de l'atelier 2.3, « Tout déplier », le mode pas à pas, la recherche et les modules absents se comportent comme prévu. Au plus 240 286 triangles par image, pour un budget de 500 000. Refait le même jour après les corrections de la revue finale, sur les huit mêmes réglages, avec des contrôles en plus : chaque page tout dépliée, les pièces 3D des ateliers 2.2, 2.3 et 2.7 ouvertes par leur onglet, le menu du téléphone modal au clavier, le lien « Aller au contenu », l'accueil sans JavaScript et la politique de contenu du serveur. Aucun écart. Le contrôle de la page unique (20/10/2026, refait le 21/10/2026) avait aussi vérifié la scène en paysage 844 x 390.
- Passage au Grizl CF 8 Di2 le 23/10/2026, d'après [sa conception](superpowers/specs/2026-10-23-grizl-cf8-di2-design.md) et [le relevé du vélo](recherche/composants-origine.md) : roues GR 30 CF, pneus G-One RX, selle Fizik, tige SP100 VCLS 2.1, transmission Di2, manette droite ST-RX825 (la gauche, ST-RX825-L ou BL-RX825-L, est à lire sur la pièce), disques XT et mains posées au stack et au reach efficaces du CF 8. Le cadre, la fourche, la peinture et la géométrie restent.
- Comparaison des 20 et 21/10/2026, faite sur la 3D du Grizl CF 7, avant ce passage, avec la photo officielle de son coloris (`canyon-photo-4553-fv`), vélo vu de profil et calé sur les axes des roues. Le tube oblique et le tube supérieur ont la même largeur sur les deux images, à quelques pixels près. Écarts visibles, tous laissés tels quels sauf la teinte de la cassette et de la chaîne :
  - cocottes plus hautes et un peu plus en arrière que sur la photo : la main est posée au point publié par Canyon (stack et reach efficaces), dont la définition reste à vérifier ;
  - cocottes et leviers : cocotte plus ronde et corne plus basse, deux lames fines et droites au lieu d'un levier large et courbé ; formes approchées ;
  - manivelle : bras droit en barre, au lieu du bras GRX sculpté avec son araignée ; forme approchée ;
  - pédalier : position choisie pour la lisibilité, plus inclinée que sur la photo ;
  - chaîne et dérailleur : la chaîne est dessinée sur un pignon moyen choisi pour la lisibilité, la photo la montre sur un petit pignon ; la chape du dérailleur penche donc autrement, et elle est pleine au lieu d'ajourée ; formes approchées ;
  - cassette et chaîne : leur teinte suit maintenant la photo, un acier argenté un peu chaud, au lieu d'un blanc presque uniforme (réglage du 21/10/2026). De profil, les pignons se fondent encore en un seul disque, alors que la photo les montre bien séparés : leurs faces sont parallèles et le dessin n'a pas les ombres entre les pignons. De même, les maillons de la chaîne ne se distinguent pas de loin ;
  - peinture : plus rose et marbrée dans la 3D, plus lie-de-vin avec un motif en traits sur la photo ; c'est la peinture de la maquette validée, et sa teinte change avec l'éclairage du studio ;
  - pas de logos ni de marquages : « CANYON » et « GRIZL » sur le cadre, DT Swiss sur les jantes, Continental et Terra Adventure sur les pneus ;
  - durite avant : trajet approché ; de profil, côté transmission, elle dépasse derrière le fourreau, alors qu'on ne la voit pas sur la photo ;
  - couronne de fourche : un ressaut net sous la douille dans la 3D, une jonction lisse sur la photo ; forme approchée ;
  - valve : couleur laiton sur la photo, acier dans la 3D ; elle est trop petite pour se voir à la largeur d'un téléphone ;
  - pneus : un peu plus grands sur la photo, d'un écart du même ordre que l'incertitude du relevé ; le rayon extérieur du pneu monté reste approché ;
  - pédale : la photo en montre une, la fiche dit « Pédales : Non inclus » ; la 3D suit la fiche ;
  - selle : galbe plus marqué sur la photo, avec un bec qui plonge ; forme approchée ;
  - haubans : dans la 3D, ils rejoignent le tube de selle un peu sous le tube supérieur ; sur la photo, ils arrivent à sa hauteur (écart relevé le 21/10/2026).
- Comparaison avec la photo officielle du CF 8 Di2 (`canyon-photo-4556-fv`) faite le 24/10/2026, sur la vue d'ensemble de l'accueil et sur une vue de profil calée sur les axes des roues. La géométrie suit la photo : tube oblique, tube supérieur, pneus et nombre de rayons coïncident. Trois écarts sont corrigés le même jour : le ruban est lisse, les têtes de vis du plateau sont sombres, et la piste du disque a le gris moyen de la photo dans les deux vues. Les autres écarts de forme, de couleur et de marquage sont listés dans « Ce qui est approché », ci-dessous.
- Contrôle complet du passage le 24/10/2026, avec `tools/scene-check.js` sur les 20 pages et les huit réglages du 21/10/2026 : code 0 partout, aucune erreur, pas de défilement horizontal, au plus 245 522 triangles par image.
- Points ouverts : les « À vérifier à la livraison » de la liste ci-dessous, et les contradictions relevées dans [composants-origine.md](recherche/composants-origine.md).

### Ce qui est approché

Liste générée depuis les META des pièces (`src/scene/pieces/*.js`) et les cotes approchées de GEO (`src/scene/geometrie.js`), par `listerApproximations` de `src/scene/scene.js`. C'est la liste que la page ouvre par « Ce qui est approché », sans les documents. Ne la retouche pas à la main : depuis la racine du dépôt, régénère-la avec

```sh
node tools/approximations-md.mjs --lots
```

La commande réécrit le bloc entre les deux marqueurs ci-dessous. Sans `--lots`, elle écrit la liste sur la sortie standard. Le test `tests/js/lots.test.mjs` échoue si le bloc n'est plus à jour.

<!-- début de la liste générée par tools/approximations-md.mjs -->

#### Cadre, fourche, tige de selle SP100 VCLS 2.1 et selle Fizik Argo Terra X5

Formes approchées :

- Profils et diamètres des tubes du cadre : non publiés, formes approchées d’après la photo officielle de profil.
- Raccords entre les tubes : formes approchées.
- Haubans : ils rejoignent le tube de selle un peu sous le tube supérieur. Sur la photo officielle, ils arrivent à la hauteur du tube supérieur. La hauteur exacte n’est pas publiée.
- Fourche : forme des fourreaux et de la couronne approchée d’après les photos officielles.
- Déport de la fourche : non publié. Il découle ici des autres cotes de la géométrie.
- Pattes du cadre, de la fourche et patte de dérailleur : formes approchées. Seul l’écartement des axes est publié.
- Jeu laissé autour du pneu le plus large : non publié, approché.
- Protections noires et inserts de fixation : forme et position approchées d’après la photo officielle.
- Boîte de pédalier : largeur publiée par la fiche, diamètre approché.
- Collier de selle : forme approchée.
- Tige de selle : deux lames séparées par une fente sur leur longueur, qui s’écartent puis se rejoignent dans la tête, comme sur les photos officielles de Canyon. Épaisseur et courbe des lames, place de la fente, yeux des vis et forme de la tête sont approchés.
- Selle : largeur, longueur, largeur à un repère mesuré depuis le bec et hauteur à ce repère publiées par Fizik. Fizik ne dit pas d’où il prend cette hauteur : elle part ici de l’axe des rails, ce qui s’accorde avec la photo officielle. Contour, galbe, bec court plongeant, place sur les rails et courbe des rails sont approchés d’après les photos officielles.
- Inscriptions de la tige, de la tête et de la selle : non dessinées.
- Peinture : plus rose et marbrée ici. Sur la photo officielle, elle est lie-de-vin, avec un motif en traits. Sa teinte change aussi avec l’éclairage du studio.
- Marquages du cadre et de la fourche : « CANYON » en grand sur le tube oblique, « GRIZL » sur le haut du tube de selle, et sur la fourche un cadre imprimé dont le texte est illisible sur la photo officielle. Ils ne sont pas dessinés.

À vérifier à la livraison :

- type de patte de dérailleur
- sens de la tête de la tige de selle à la livraison, donc son recul
- marquage de la tige de selle : la fiche la nomme de plusieurs façons, à lire sur la tige
- ce que mesure la longueur publiée par Fizik, la selle ou ses rails
- cotes de Fizik : le repère lu comme l’endroit où la selle a sa largeur publiée, et la section des rails lue en millimètres. Deux lectures à vérifier sur la selle
- angle du tube de selle : sur la photo officielle, il paraît redressé d’environ un degré de plus que l’angle publié, que le dessin applique. Effet de perspective ou retouche de la photo : on ne peut pas trancher, à regarder sur le vélo

#### Roues Canyon GR 30 CF, pneus Schwalbe G-One RX et axes traversants

Formes approchées :

- Profil de la jante : hauteur, largeur intérieure et largeur extérieure publiées, et Canyon annonce des jantes sans crochets. Flancs, siège du talon et creux central sont approchés.
- Section du pneu : ronde, à la largeur publiée. Le rayon extérieur du pneu monté n’est pas publié, il est approché d’après la photo officielle.
- Crampons : Schwalbe décrit des crampons extérieurs appariés, sans cote. Petits crampons serrés au centre, crampons d’épaule plus gros et groupés par deux : taille, hauteur, inclinaison et nombre sont approchés d’après les photos officielles.
- Moyeux : Canyon nomme des moyeux DT Swiss à rayons droits. Corps, flasques et position des flasques sont approchés.
- Rayons : leur nombre est publié. Profil plat, croisement, rayon des flasques et grosseur des rayons sont approchés d’après la photo officielle.
- Cannelures Center Lock et corps de roue libre : formes approchées.
- Valve : type et longueur non publiés, forme approchée. Sa place suit la photo officielle, sa tête dorée n’est pas rendue.
- Inscriptions des jantes et des flancs des pneus : non dessinées.
- Axes traversants : seuls leur diamètre et l’écartement des pattes sont publiés. Têtes et embouts sont approchés.

À vérifier à la livraison :

- pression maximale imprimée sur la jante : à lire sur la jante
- corps de roue libre de la roue arrière, Micro Spline attendu : à lire sur le moyeu
- version du pneu, gomme et code de sculpture : à lire sur le flanc
- valves tubeless : présentes ou non dans le carton

#### Disques Deore XT MT800, étriers GRX, plaquettes à ailettes en résine (L05A-RF attendues) et durites

Formes approchées :

- Disque XT : piste, fentes, araignée, rivets et ailettes de refroidissement en forme approchée d’après la photo officielle du vélo, où on le voit à travers la roue. Le même disque aux deux roues.
- Épaisseur du disque : Shimano range ce disque parmi les disques d’épaisseur standard, sans valeur dans les documents cités. Elle est approchée.
- Bague Center Lock : forme approchée, dessinée à denture extérieure.
- Étriers à fixation flat mount : Canyon ne donne pas le modèle. Ils sont dessinés sur celui que Shimano associe aux manettes du vélo. Corps, logements des pistons, raccord et vis approchés d’après la photo officielle, qui montre aussi leur place autour du moyeu.
- Plaquettes : en résine à ailettes, comme l’une des plaquettes standard de cet étrier selon Shimano. Plaque, garniture et ailettes en forme approchée.
- Sortie des plaquettes : sens et course de l’animation approchés. Le chapitre dit seulement de retirer le clip, puis l’axe, puis les plaquettes avec leur ressort. La roue reste en place pour qu’on voie l’étrier.
- Durite avant : elle passe dans le fourreau gauche et en sort par un passage à l’arrière, au-dessus de l’étrier, comme sur la photo officielle de la sacoche de cadre. Seule la partie visible est dessinée : place du passage, grosseur et trajet approchés.
- Durite arrière : grosseur et trajet de l’étrier jusqu’à la base gauche approchés.
- Couleurs : la bande d’ailettes du disque, claire sur la photo officielle, et les ailettes des plaquettes, sombres sur la photo, sont rendues en gris métal. La piste est rendue dans le gris moyen de la photo, en vue d’ensemble comme de profil.

À vérifier à la livraison :

- modèle exact de l'étrier, à lire sur la pièce
- modèle exact du disque : la fiche Canyon nomme un disque XT, ses pièces d’usure proposent un disque Ultegra, à lire sur la pièce
- type de bague Center Lock d'origine, à lire sur la pièce
- épaisseur neuve du disque, à lire sur la pièce
- plaquettes d’origine et leur épaisseur neuve, à lire sur la pièce
- sortie de la durite avant du fourreau et entrée de la durite arrière dans la base, à regarder sur le vélo

#### Pédalier GRX FC-RX820-1, boîtier BB72, cassette XT CS-M8200, chaîne Shimano XT et dérailleur XT Di2 RD-M8250

Formes approchées :

- Plateau : nombre de dents, entraxe des vis et nombre de bras publiés. Profil des dents, épaisseur et découpe intérieure approchés.
- Manivelles et araignée : longueur, facteur Q et nombre de bras publiés. Profil et épaisseur des manivelles approchés. Angle des bras lu au mieux sur la photo officielle.
- Axe de pédalier et cuvettes du boîtier : seule la largeur de la boîte est publiée. Diamètres et formes approchés.
- Cassette : dentures et matières publiées par Shimano. Épaisseur des pignons, fenêtres et araignée approchées. Le grand pignon en aluminium est dessiné foncé, comme sur la photo officielle. Le petit pignon et sa bague de blocage sont dessinés d’une pièce, comme le dit le manuel Shimano de la cassette. De profil, les pignons se fondent en un seul disque, alors que la photo officielle les montre séparés, et leur teinte reste plus pâle que le sable doré de la photo.
- Position de la cassette sur la roue libre et écart entre les pignons : non publiés, approchés.
- Chaîne : la liste de Canyon la nomme Shimano XT, sans référence. Largeur, plaques et rouleaux approchés. Elle est dessinée sur le pignon où la montre la photo officielle. De loin, ses maillons ne se distinguent pas, et sa teinte n’égale pas celle de la photo.
- Dérailleur : chape moyenne selon la fiche Canyon, galets de treize dents, sans fil et à batterie intégrée selon Shimano. Contour du corps, capuchon du pivot, chape et galet bas approchés d’après la photo officielle. Épaisseur du corps, biellettes et place sous la patte approchées.
- Galet haut du dérailleur : caché par le corps sur la photo officielle. Sa place est approchée.
- Batterie : logée dans le corps du dérailleur. Sa place et son logement sont approchés, la photo officielle ne les montre pas distinctement.
- Logos, inscriptions, bouton et voyant du dérailleur, de la cassette et du pédalier : non dessinés.
- Pédales : la photo officielle en montre une, la fiche dit « Pédales : Non inclus ». Le dessin suit la fiche.

À vérifier à la livraison :

- longueur des manivelles, gravée sur la manivelle
- place du dérailleur sous la patte : elle dépend du type de patte, à regarder sur le vélo
- référence de la chaîne : la liste de Canyon dit seulement Shimano XT, et l’onglet des pièces d’usure de la fiche anglaise propose une chaîne Shimano de douze vitesses, à lire sur la chaîne
- référence exacte du boîtier de pédalier, à lire sur la pièce

#### Jeu de direction, potence ST0046, cintre HB0067, ruban, manettes GRX Di2 (droite ST-RX825, gauche ST-RX825-L ou BL-RX825-L, à lire sur la pièce) et durites

Formes approchées :

- Point de la main : Canyon ne dit pas quel point de la main il prend. La main publiée tombe au-dessus du repose-main, à peu près d’une épaisseur de main, là où la main se pose sur la photo officielle.
- Cocottes : Shimano ne publie pas leurs cotes. Repose-main et corne en forme approchée d’après la photo officielle du vélo. La cocotte gauche est dessinée comme la droite. Les nervures et le marquage du repose-main ne sont pas dessinés.
- Leviers : levier de frein et palette plus petite derrière lui, en forme approchée d’après la photo officielle du vélo, des deux côtés. La zone striée du levier n’est pas dessinée.
- Couleur de la palette : plus claire sur la photo officielle, elle est dessinée en noir mat.
- Place des cocottes sur la courbe du cintre et rotation du cintre dans la potence : non publiées. Elles sont lues sur la photo officielle du vélo.
- Inclinaison des cocottes : sur la photo officielle, le repose-main ne penche que d’un à deux degrés. Ici, il penche d’environ six degrés et demi. L’écart vient de la courbe du cintre et de la hauteur de la potence, approchées.
- Courbe du cintre : seuls le déport, la descente, l’évasement, l’inclinaison et les largeurs sont publiés. La forme de la courbe et la longueur des drops sont approchées.
- Inclinaison de la partie haute du cintre : Canyon la donne sans dessin. Elle est dessinée vers le bas, du collier vers les cocottes.
- Ruban : épaisseur et début du ruban approchés.
- Potence : longueur et angle publiés. Corps, capot de serrage et vis approchés d’après la photo officielle.
- Capot et entretoise du jeu de direction : formes et hauteurs approchées. Le nombre d’entretoises n’est pas publié.
- Durites : grosseur et trajet approchés. Elles longent le cintre sous le ruban, en sortent près de la potence et entrent dans le capot du jeu de direction, devant le pivot, comme sur la photo officielle.

À vérifier à la livraison :

- manette gauche : avec ou sans boutons de vitesses, la fiche ne donne pas sa référence complète, à lire sur la pièce
- point de la main publié par Canyon : il tombe au-dessus du repose-main, là où se pose la main. La pose des cocottes est lue sur la photo officielle, à regarder sur le vélo
- sens de montage de la potence, à regarder sur le vélo

#### Géométrie

Formes approchées :

- Le rayon extérieur du pneu monté n’est pas publié. Il est approché.
- La fiche donne une plage de hauteurs de selle, pas une valeur. La selle est posée vers le milieu de cette plage.
- La forme de la tête de tige n’est pas publiée. L’écart entre le haut de la tige et le dessus de la selle est approché d’après la hauteur de selle que publie Fizik, lue ici depuis l’axe des rails.
- La forme de la fourche n’est pas publiée. La position de la couronne sous la douille est approchée.
- La position latérale du disque avant n’est pas publiée. Elle est approchée.
- La position latérale du disque arrière n’est pas publiée. Elle est approchée.
- La distance des étriers à leur moyeu n’est pas publiée. Elle est approchée.
- La position de l’étrier avant autour du moyeu n’est pas publiée. Elle est lue au mieux sur la photo officielle.
- La position de l’étrier arrière autour du moyeu n’est pas publiée. Elle est lue au mieux sur la photo officielle.
- Le pédalier est dessiné dans une position choisie pour la lisibilité. Ce n’est pas une position réelle.
- Le pas de la chaîne n’est pas relevé sur un document du fabricant. La valeur retenue est celle du pas courant des chaînes de vélo.
- La chaîne est dessinée sur un seul pignon, celui où la montre la photo officielle, lu au mieux.
- La position latérale de la cassette n’est pas publiée. Elle est approchée.
- L’écart entre deux pignons de la cassette n’est pas publié. Il est approché.
- La position du galet haut du dérailleur n’est pas publiée. Il est caché sur la photo officielle : sa place est approchée d’après le brin de chaîne visible.
- La distance entre le pignon et le galet haut du dérailleur n’est pas publiée. Elle est approchée d’après la photo officielle.
- La fiche indique une chape moyenne, sans cote. L’écart entre les galets est approché d’après la photo officielle.
- L’inclinaison de la chape du dérailleur n’est pas publiée. Elle est approchée d’après la photo officielle.
- Le nombre d’entretoises montées à la livraison n’est pas publié. La hauteur de la potence est approchée.

À vérifier à la livraison :

- La fiche nomme cette cote « inclinaison du cintre ». C’est très probablement l’angle de direction. À confirmer avec le schéma de la fiche.
- Canyon définit la position de la main par un lien « En savoir plus » de la fiche. Sa page d’explication de la géométrie dit que ces valeurs sont calculées avec la main posée sur les cocottes, au point où tu saisis la cocotte, en tenant compte de la potence, de la forme du cockpit et des entretoises montées à la livraison. Elle ne précise pas ce point sur la cocotte : à vérifier.
- Canyon ne dit pas dans quel sens la potence est montée à la livraison. Elle est dessinée vers le bas, comme sur la photo officielle du vélo. À regarder sur le vélo.
- La page du cintre annonce un déport plus long que le marquage de sa photo officielle. Le cintre photographié est le plus étroit des deux. À lire sur le cintre.
- Lue sur le marquage du cintre photographié, le plus étroit des deux. À lire sur le cintre.

<!-- fin de la liste générée -->

## Lot 1 · Freins · en relecture

- Règle des sources appliquée le 20/10/2026 : suppression des liens revendeurs (poids et versions du RT-MT800, association BR-RX400, « Metal and resin »), de la copie non officielle du guide Canyon (couple de l'axe avant, ordre de montage, rodage), de la règle Park Tool « 1 mm » et des couples d'étriers route donnés à titre indicatif, de la vidéo GMBN.
- Le chapitre Freins est découpé en huit ateliers, chacun sur sa page (`freins/<atelier>/`), rangés dans les zones de la page d'accueil : disques (2.2, 2.4), étrier et plaquettes (2.3, 2.5, 2.6), manettes et durites (2.1, 2.7, 2.8).
- Passage au Grizl CF 8 Di2 le 23/10/2026 : 2.1 décrit les manettes ST-RX825, la gauche à lire sur la pièce, et l'étrier BR-RX820 attendu ; 2.2 devient « Déposer et reposer un disque », car les disques XT sont d'origine ; 2.3 remplace les plaquettes d'origine, L05A-RF attendues, en pas à pas complet ; 2.7 suit la purge du DM-GADBR10, entonnoir à 20°, vis de purge de l'étrier à 4-6 Nm.
- Pièces 3D : disque Deore XT MT800, sa bague, dessinée à denture extérieure, et l'outil TL-FC36 (`rotor`) ; étrier BR-RX820 et plaquettes L05A-RF (`caliper`) ; kit de purge du DM-GADBR10 (`bleed`).
- Points ouverts, à lire sur la pièce à la livraison : modèle exact de l'étrier, BR-RX820 attendu ; modèle exact des disques, RT-MT800 ou RT-CL800, et type de leur bague Center Lock, à denture intérieure (outil TL-LR15) ou extérieure (outil TL-FC36) ; plaquettes d'origine, L05A-RF attendues, et leur épaisseur neuve ; manette gauche, ST-RX825-L ou BL-RX825-L. Couple de l'axe avant : dans le guide du carton.
- Statut du RT-MT800 non tranché : dans le tableau Shimano C-461, son nom porte la classe `discon`, sans lien vers une fiche produit, et la page n'a pas de légende ; sa fiche bike.shimano.com est pourtant en ligne, et il n'est pas dans la liste Shimano des produits abandonnés. Aucun achat n'en dépend plus : les disques XT sont d'origine. Le détail est dans [composants-origine.md](recherche/composants-origine.md).

## Données personnelles

Le dépôt est public. Les brouillons des lots suivants restent hors du dépôt tant qu'ils contiennent des données personnelles. Avant d'ajouter un lot, vérifier qu'il n'expose que ce que Lamine accepte de rendre public.
