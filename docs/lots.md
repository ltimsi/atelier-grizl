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
- Points ouverts, à lire sur la pièce à la livraison : modèle exact de l'étrier, BR-RX820 attendu ; modèle exact des disques, RT-MT800 ou RT-CL800, et type de leur bague Center Lock, à denture intérieure (outil TL-LR15) ou extérieure (outil TL-FC36) ; plaquettes d'origine, L05A-RF attendues, et leur épaisseur neuve ; manette gauche, ST-RX825-L ou BL-RX825-L. Couple de l'axe avant : 10-15 Nm d'après le guide Canyon V02 (atelier 1.5), à comparer au guide imprimé du carton.
- Statut du RT-MT800 non tranché : dans le tableau Shimano C-461, son nom porte la classe `discon`, sans lien vers une fiche produit, et la page n'a pas de légende ; sa fiche bike.shimano.com est pourtant en ligne, et il n'est pas dans la liste Shimano des produits abandonnés. Aucun achat n'en dépend plus : les disques XT sont d'origine. Le détail est dans [composants-origine.md](recherche/composants-origine.md).

## Lot 2 · Avant de commencer et montage à la livraison · en relecture

- Le chapitre « Montage à la livraison » (`src/parts/11-montage.html`) est découpé en neuf ateliers, chacun sur sa page (`montage/<atelier>/`) : 1.1 Avant de commencer, 1.2 Déballer et vérifier, 1.3 Cintre et potence, 1.4 Tige de selle et selle, 1.5 Roues et axes, 1.6 Pédales et cales, 1.7 Charger et vérifier le Di2, 1.8 Reporter ta position, 1.9 Avant la première sortie. 1.1, 1.2 et 1.9 sont des fiches « comprendre » sans zone : elles s'ouvrent par le menu, la recherche et la catégorie, sans pastille. D'après [sa conception](superpowers/specs/2026-10-24-lot2-montage-design.md) et [le relevé du montage](recherche/montage-cf8-di2.md).
- Sources : le guide de démarrage Canyon dans sa version PDF officielle (QSG R126 V02), dont les couples lus sur un pictogramme sont donnés avec leur page et restent à comparer au guide imprimé du carton, qui s'applique en cas d'écart (règle 5 de la [règle des sources](regle-des-sources.md), décision de Lamine du 25/10/2026) ; le manuel Canyon des roues et le manuel Canyon du vélo de route de 2021 ; le manuel DT Swiss des axes RWS ; les manuels Shimano DM-MAPD001-07 (pédales et cales), DM-MARD011-07, UM-3K70A, UM-7KZ0A et UM-0RM0B (Di2), DM-GADBR10-04 (piles des manettes) ; Fizik pour la selle. Park Tool ne sert que pour les gestes et pour ses propres outils, la TW-6.2 et l'ATD-1.2. Le registre `src/scene/sources.js` reçoit les deux documents que citent les pièces 3D des ateliers : le QSG R126 V02 et le DM-MAPD001-07.
- Cinq zones de plus sur le vélo de l'accueil, pastilles 4 à 8, chacune avec sa vue de caméra, son cadrage du schéma 2D et sa carte dans « Où intervenir » : Poste de pilotage (1.3), Selle et tige (1.4, 1.8), Axes des roues (1.5), Pédalier et pédales (1.6), Dérailleur Di2 (1.7). Les ancres sont des placements de vue, pas des cotes. Pour que deux pastilles ne se chevauchent pas sur un écran de 360 px, celle du dérailleur est au bas de son corps, sous la batterie BT-DN320, et celle du poste au dos du serrage de la potence sur le pivot. Celle des axes est ancrée sur la tête de l'axe avant et posée 34 px plus bas à l'écran, en 3D comme en 2D (champ `decalage` de `zones.json`) : la pastille de l'étrier se projette juste au-dessus du moyeu. Le vélo reste dessiné sans pédales, comme la fiche Canyon le livre.
- Pièces 3D : la clé dynamométrique Park Tool TW-6.2 (`torque`, 1.1), le poste de pilotage et l'ordre de serrage du capot (`cockpit`, 1.3), l'axe avant de 12 x 100 (`axle`, 1.5), la pédale PD-ME700 et la cale SM-SH51 (`pedal`, 1.6).
- Accueil, « Le jour de la livraison » : « Monter le vélo » mène à `montage/`, une ligne « Charger le Di2 » mène à `montage/di2/`, « Reporter ta position » mène à `montage/position/`, et chaque « Chapitre 1 » est un lien. Les anciennes adresses restent valables : `#montage` ouvre `montage/`, `#montage-position` ouvre `montage/position/`. Le lot 4 ne prévoit plus la charge de la batterie Di2, faite en 1.7.
- Contrôle du 24/10/2026, avec `tools/scene-check.js` sur les 29 pages et les huit réglages : 1440 x 900 en clair et en sombre, 1024 x 768, 420 x 900, 360 x 780, 420 x 900 sans WebGL, 1440 x 900 sans JavaScript, et 1440 x 900 sans réduire les animations. Code 0 partout, aucune erreur, pas de défilement horizontal, au plus 245 522 triangles par image pour un budget de 500 000. Nouveaux contrôles : dans la vue d'ensemble, en 3D puis dans le schéma 2D, les huit pastilles ont leurs centres à 30 px au moins (32,9 px en 3D et 30,9 px en 2D au plus serré, à 360 px de large) et aucune ne touche le rectangle de l'aide ; la pastille 4 rend active la carte « Poste de pilotage » ; `#montage` et `#montage-position` arrivent sur leurs pages. L'aide du schéma 2D tient sur une ligne, et la légende des pointillés est sous l'image. Les pièces 3D des ateliers 1.1, 1.3, 1.5 et 1.6 sont ouvertes par leur onglet et se dessinent.
- Points ouverts : ce qui est à lire sur la pièce ou sur l'outil à la livraison, listé dans l'atelier 1.2 et recopié dans [PASSATION.md](PASSATION.md) ; les contradictions du relevé, signalées sur les pages concernées (couples de la potence et du collier, guide de 2025 contre manuel de 2021 ; axe arrière ; pression maximale, 3,0 bar retenus ; charge admise, 120 kg retenus ; contenu du carton) ; les couples de 2 Nm, 2,5 N·m et 7 Nm, qu'aucun outil de Lamine ne couvre, à serrer à la clé Canyon du carton si sa plage le permet.

## Lot 3 · Tubeless et crevaisons · en relecture

- Le chapitre « Pneus et tubeless » (`src/parts/30-tubeless.html`) est découpé en six ateliers, chacun sur sa page (`tubeless/<atelier>/`) : 3.1 Ce que tu as, 3.2 Passer en tubeless, 3.3 Le liquide, 3.4 La pression, 3.5 Crevaison en route, 3.6 Problèmes fréquents. 3.1 et 3.6 sont des fiches « comprendre ». D'après [sa conception](superpowers/specs/2026-10-26-lot3-tubeless-design.md) et [le relevé du tubeless](recherche/tubeless-cf8-di2.md), fait le 26/10/2026.
- Matériel : liquide Muc-Off Road & Gravel Tubeless Sealant, pompe à réservoir Topeak JoeBlow Booster, mèches Park Tool TPT-1 (réponse du 26/10/2026). Les valves ne sont pas encore choisies : 3.1 donne les critères publiés par les fabricants (valve tubeless Presta, obus démontable, écrou, longueur prévue pour une jante de 30 mm), sans marque.
- Sources : le manuel Canyon des roues, le guide de démarrage Canyon (QSG R126 V02), les pages Canyon du vélo, de la paire GR 30 CF et de ses pièces, les articles de conseil et les vidéos officielles de Canyon ; Schwalbe pour le pneu (fiche, FAQ, exigences de roue tubeless, tableau des combinaisons de pneus et de jantes) ; la page et les articles Muc-Off du liquide ; la notice Topeak de la pompe ; DT Swiss pour son ruban et sa valve, comme points de comparaison. Park Tool ne sert que pour les gestes et pour ses propres outils : la TPT-1, les TL-4.2, le démonte-obus VC-1 et l'injecteur TSI-1. Le registre `src/scene/sources.js` reçoit les trois documents que citent les pièces 3D des ateliers, hors Park Tool : la page Muc-Off du liquide, la FAQ tubeless de Schwalbe et l'article Canyon « Tubed vs tubeless ».
- Sécurité : jamais plus de 3,0 bar dans le pneu, à aucun moment, talonnage compris (manuel Canyon des roues, « always never exceed », et tableau Schwalbe des pneus TLE et TLR sur jante sans crochet). Les valeurs plus hautes de la page de la paire et de la fiche du pneu, et les sources qui font surgonfler pour talonner, sont citées comme contradictions : 3,0 bar s'applique. Pour le JoeBlow Booster, la charge du réservoir n'est pas la pression du pneu : le manomètre se lit l'aiguille immobile (une lecture du site, que Topeak n'écrit pas en toutes lettres, dite comme telle), et le pneu se purge au-delà de 3,0 bar. Pas de cartouche de CO2 (dioxyde de carbone) : le site suit Schwalbe, le plus prudent, contre Muc-Off et la vidéo Canyon, cités comme contradiction. Ces consignes sont dans le corps des étapes de 3.2, que le mode pas à pas montre. Aucune pression n'est calculée pour Lamine.
- Une zone de plus sur le vélo de l'accueil, la pastille 9, avec sa vue de caméra, son cadrage du schéma 2D et sa carte dans « Où intervenir » : Pneus et valves (3.1 à 3.6). Ses maillages sont les deux pneus, crampons compris, et les deux valves (`roues.js`) ; dans le schéma 2D, les deux pneus et les deux valves. Son ancre est un placement de vue, pas une cote : la valve de la roue avant, en haut de la roue, là où elle sort du fond de la jante. Celle de la roue arrière tomberait sur la pastille du disque arrière. Aucun décalage à l'écran n'est nécessaire.
- Pièces 3D : la coupe d'une portion de roue GR 30 CF, jante sans crochet, ruban, pneu G-One RX 45-622, liquide et valve Presta tubeless, avec la limite de 3,0 bar sur une pastille (`rim`, 3.2) ; la réparation à la mèche Park Tool TPT-1, geste par geste d'après sa notice (`plug`, 3.5). Leurs formes non publiées sont déclarées approchées dans leur en-tête.
- Accueil, « Le jour de la livraison » : « Passer en tubeless » mène à `tubeless/`, et son « Chapitre 3 » est un lien. L'ancienne adresse `#tubeless` ouvre `tubeless/`, et chaque ancre `#tubeless-<atelier>` la page de son atelier. Dans « D'origine, puis à monter », 3.2 remplace les chambres à air, si le vélo en est livré.
- Contrôle du 26/10/2026, avec `tools/scene-check.js` sur les 35 pages et les huit réglages : 1440 x 900 en clair et en sombre, 1024 x 768, 420 x 900, 360 x 780, 420 x 900 sans WebGL, 1440 x 900 sans JavaScript, et 1440 x 900 sans réduire les animations. Code 0 partout, aucune erreur, pas de défilement horizontal, au plus 245 522 triangles par image pour un budget de 500 000. Dans la vue d'ensemble, en 3D puis dans le schéma 2D, les neuf pastilles ont leurs centres à 30 px au moins (32,9 px en 3D et 30,9 px en 2D au plus serré, à 360 px de large, comme au lot 2 ; la pastille 9 est à 39,8 px en 3D et 43,1 px en 2D de la plus proche, celle de l'étrier) et aucune ne touche le rectangle de l'aide. Nouveaux contrôles : la pastille 9 rend active la carte « Pneus et valves », et `#tubeless` arrive sur `tubeless/`. Les pièces 3D des ateliers 3.2 et 3.5 sont ouvertes par leur onglet et se dessinent.
- Correctifs de la relecture du 26/10/2026 : sur deux colonnes, la colonne « Où intervenir » reste sous la barre du haut et défile seule, comme la colonne de droite d'un atelier ; montrer la carte d'une zone fait défiler cette colonne d'abord, la page seulement du reste. À 1280 x 720 et à 1440 x 900, l'image du vélo reste entière à l'écran après la pastille 9, alors qu'elle en sortait ou n'en gardait qu'un tiers, et la page ne bouge plus pour les pastilles 1 à 8. scene-check vérifie, sur deux colonnes, qu'au moins la moitié de l'image reste à l'écran après chaque pastille, et parcourt les vues de zone en 3D et en 2D : la pastille choisie ne touche ni l'aide ni un bouton de la scène ; les autres pastilles donnent des avertissements (`vuesDeZone`). La valve du schéma 2D reprend les tubes de `roues.js`. La page Couples nomme les chapitres sans couple de serrage (Pneus et tubeless). L'atelier 1.5 cite les 4 bar de la page de la paire et de la fiche du pneu, puis « 3,0 bar s'applique », avec sa raison, comme au chapitre 3.
- Correctifs de la relecture finale du 28/10/2026 : la valve Presta s'ouvre avant de gonfler. Schwalbe fait desserrer son écrou moleté (« Before inflating, the knurled nut must be loosened. ») : 3.2 le dit en entier à l'étape 12, avant d'engager la tête de pompe, chaque étape qui gonfle ou mesure en 3.2, 3.3, 3.4 et 3.5 le rappelle, l'étape 13 dit qu'une aiguille restée sur la charge du réservoir peut venir d'une valve fermée (une lecture du site, dite comme telle), et 3.6 range cette cause. La précision du manomètre du JoeBlow Booster est dite non publiée. L'atelier 1.5 renvoie à 3.4 pour la méthode et le repère Canyon de la pression. Pièce de la mèche : le curseur compte les gestes de la notice (« Geste 6 / 8 ») et la ligne dessous donne aussi l'étape de 3.5 ; son style est dans `00-head.html`. Pièce de la jante : caméra reculée, aucune pastille sous l'aide de 360 à 1440 px. Vues de zone des manettes et des disques recadrées (`zones.json`) : scene-check fait désormais une erreur de toute pastille sous l'aide ou un bouton de la scène, ou à moins de 30 px d'une autre, dans chaque vue de zone, en 3D comme en 2D. Contrôle du 28/10/2026 sur un build neuf, avec `tools/scene-check.js` sur les 35 pages, aux huit réglages plus 1280 x 720 et 1920 x 1080 : code 0 partout, aucune erreur, pas de défilement horizontal, au plus 245 522 triangles par image pour un budget de 500 000 ; dans les vues de zone, aucune pastille sous l'aide ou un bouton, et 45,2 px au plus serré entre deux pastilles (manettes, en 3D, à 360 px de large).
- Points ouverts : ce qui est à lire sur la pièce à la livraison, listé dans l'atelier 3.1 et recopié dans [PASSATION.md](PASSATION.md) ; le choix des valves ; la précision du manomètre, non publiée, et la Proposition de ne pas viser 3,0 bar tout juste, à décider par Lamine ; les contradictions du relevé, signalées sur les pages concernées (valves et ruban fournis ou non, version du pneu, largeur du ruban, dose de liquide pour un pneu de 45 mm, pressions maximales plus hautes, surgonflage pour talonner, CO2).

## Données personnelles

Le dépôt est public. Les brouillons des lots suivants restent hors du dépôt tant qu'ils contiennent des données personnelles. Avant d'ajouter un lot, vérifier qu'il n'expose que ce que Lamine accepte de rendre public.
