# Suivi des lots

Pour chaque lot : relecture du texte, des planches et des pièces 3D par Lamine, corrections, puis passage à « validé » dans `build/lots.json`, commit et étiquette `lot-N`.

## Lot 0 · Le vélo en 3D · en relecture

- La page d'accueil montre ton Grizl CF 7 en 3D : taille M, coloris Floating Violet, pièces d'origine. Trois rendus : schéma 2D, 3D simple et 3D réaliste (three.js 0.160.0).
- Trois zones d'atelier, chacune avec sa pastille et sa puce : disques de frein, étrier et plaquettes, manettes et durites. Une zone ouvre ses ateliers dans la fiche, sous la scène. Un lien direct vers un atelier, comme `#freins-plaquettes`, l'ouvre aussi.
- Deux variantes : disques d'origine SM-RT64 ou XT RT-MT800, plaquettes en place ou sorties.
- Sans WebGL, la page passe au schéma 2D et le dit.
- Cotes : celles de la fiche Canyon et des documents Shimano, Continental et DT Swiss enregistrés dans `src/scene/sources.js`. Ce qui n'est pas publié est dessiné au mieux et listé plus bas.
- Contrôle visuel du 20/10/2026 avec `tools/scene-check.js` : 420 px en clair et en sombre, 360 px, 844 x 390 en paysage, 420 px sans WebGL. Aucune erreur, pas de défilement horizontal, l'atelier `#freins-plaquettes` s'ouvre dans la fiche. Au plus 240 286 triangles par image, pour un budget de 500 000.
- Comparaison avec la photo officielle du coloris (`canyon-photo-4553-fv`), vélo vu de profil et calé sur les axes des roues. Le tube oblique et le tube supérieur ont la même largeur sur les deux images, à quelques pixels près. Écarts visibles, laissés tels quels :
  - cocottes plus hautes que sur la photo : la main est posée au point publié par Canyon (stack et reach efficaces), dont la définition reste à vérifier ;
  - forme des cocottes, des leviers, de la manivelle, de la chape du dérailleur et de la couronne de fourche : formes approchées ;
  - pédalier et chaîne : position choisie pour la lisibilité ;
  - pas de logos ni de marquages sur le cadre, les jantes et les pneus ;
  - teinte et motif de la peinture : ceux de la maquette, ils changent avec l'éclairage du studio ;
  - durite avant : trajet approché ; de profil, côté transmission, elle dépasse derrière le fourreau, alors qu'on ne la voit pas sur la photo ;
  - pédale : la photo en montre une, la fiche dit « Pédales : Non inclus » ; la 3D suit la fiche.
- Points ouverts : les « À vérifier à la livraison » de la liste ci-dessous, et les contradictions relevées dans [composants-origine.md](recherche/composants-origine.md).

### Ce qui est approché

Liste tirée le 20/10/2026 des META des pièces (`src/scene/pieces/*.js`) et des cotes approchées de GEO (`src/scene/geometrie.js`), par `listerApproximations` de `src/scene/scene.js`. C'est la liste que la page ouvre par « Ce qui est approché », sans les documents. Ne la retouche pas à la main : régénère-la depuis le code.

```sh
node --input-type=module -e "import { PIECES, listerApproximations } from './src/scene/scene.js'; console.log(JSON.stringify(listerApproximations(PIECES.map(m => ({ meta: m.META, zones: [] }))), null, 2));"
```

#### Cadre, fourche, tige de selle et selle

Formes approchées :

- Profils et diamètres des tubes du cadre : non publiés, formes approchées d’après la photo officielle de profil.
- Raccords entre les tubes : formes approchées.
- Haubans : ils rejoignent le tube de selle un peu sous le tube supérieur, comme sur la photo officielle. La hauteur exacte n’est pas publiée.
- Fourche : forme des fourreaux et de la couronne approchée d’après les photos officielles.
- Déport de la fourche : non publié. Il découle ici des autres cotes de la géométrie.
- Pattes du cadre, de la fourche et patte de dérailleur : formes approchées. Seul l’écartement des axes est publié.
- Jeu laissé autour du pneu le plus large : non publié, approché.
- Protections noires et inserts de fixation : forme et position approchées d’après la photo officielle.
- Boîte de pédalier : largeur approchée d’après le standard nommé par la fiche.
- Collier de selle : forme approchée.
- Tige de selle : forme des lames et de la tête approchée d’après les photos officielles de Canyon.
- Selle et rails : longueur, galbe et position sur les rails non publiés, formes approchées. Seule la largeur de la selle est publiée.

À vérifier à la livraison :

- type de patte de dérailleur
- sens de la tête de la tige de selle à la livraison, donc son recul
- modèle exact de la tige de selle : la liste des composants et le texte de la fiche ne la nomment pas de la même façon

#### Roues DT Swiss Gravel LN, pneus Continental Terra Adventure et axes traversants

Formes approchées :

- Profil de la jante : seules sa hauteur et sa largeur intérieure sont publiées. Flancs, crochets et creux central sont approchés.
- Section du pneu : ronde, à la largeur publiée. Le rayon extérieur du pneu monté n’est pas publié, il est approché.
- Crampons : Continental décrit des rangées de trois, trois puis quatre crampons au centre, et des crampons d’épaule inclinés. Taille, hauteur et nombre de rangées sont approchés d’après les photos officielles.
- Moyeux : Canyon ne nomme pas leur modèle. Corps, flasques et position des flasques sont approchés.
- Rayons : leur nombre se compte sur la photo officielle. Croisement, rayon des flasques et grosseur des rayons sont approchés d’après cette photo.
- Cannelures Center Lock et corps de roue libre : formes approchées.
- Valve : type et longueur non publiés, forme approchée. Sa place suit la photo officielle.
- Axes traversants : seuls leur diamètre et l’écartement des pattes sont publiés. Têtes et embouts sont approchés.

À vérifier à la livraison :

- jante à crochets ou sans crochets : à lire sur le marquage de la jante
- modèle des moyeux : à lire sur les moyeux

#### Disques SM-RT64 et XT RT-MT800, étriers GRX, plaquettes et durites

Formes approchées :

- Disque d’origine : piste en acier sur un support en aluminium peint, comme le dit la fiche Shimano. Bras, trous et rivets sont approchés d’après la photo officielle de Canyon.
- Disque XT : piste, araignée, rivets et ailettes de refroidissement en forme approchée. Les photos produit de Shimano n’étaient pas accessibles le jour du relevé.
- Épaisseur du disque XT : Shimano le range parmi les disques d’épaisseur standard. Il est dessiné à l’épaisseur standard donnée par la fiche du disque d’origine.
- Bagues Center Lock : forme approchée. Celle du XT est dessinée à denture extérieure, celle d’origine reste à identifier.
- Étriers GRX à fixation flat mount : Canyon ne donne pas le modèle. Forme approchée d’après la photo officielle, qui montre aussi leur place autour du moyeu.
- Plaquettes : forme approchée.
- Durites : grosseur et trajet le long de la fourche et de la base approchés. Aucune photo officielle ne montre le côté gauche du vélo.

À vérifier à la livraison :

- modèle exact de l'étrier, à lire sur la pièce
- type de bague Center Lock d'origine, à lire sur la pièce
- trajet des durites le long de la fourche et de la base, à regarder sur le vélo

#### Pédalier GRX FC-RX610-1, boîtier BB-RS500, cassette SLX CS-M7100, chaîne CN-M7100 et dérailleur GRX RD-RX822

Formes approchées :

- Plateau : nombre de dents, entraxe des vis et nombre de bras publiés. Profil des dents, épaisseur et découpe intérieure approchés.
- Manivelles et araignée : longueur, facteur Q et nombre de bras publiés. Profil et épaisseur des manivelles approchés. Angle des bras lu au mieux sur la photo officielle.
- Axe de pédalier et cuvettes du boîtier : seule la largeur de la boîte est publiée. Diamètres et formes approchés.
- Cassette : dentures et matières publiées par Shimano. Épaisseur des pignons, fenêtres et araignée approchées. Le grand pignon en aluminium est dessiné foncé, comme sur la photo officielle.
- Position de la cassette sur la roue libre et écart entre les pignons : non publiés, approchés.
- Chaîne : largeur, plaques et rouleaux approchés. Elle est dessinée sur un seul pignon, choisi pour la lisibilité.
- Dérailleur : chape courte selon la fiche Canyon, galets de treize dents selon Shimano. Corps, biellettes, chape, écart des galets et place sous la patte approchés d’après la photo officielle.
- Gaine du dérailleur : sortie du cadre et trajet approchés d’après la photo officielle.

À vérifier à la livraison :

- longueur des manivelles, gravée sur la manivelle
- place du dérailleur sous la patte : elle dépend du type de patte, à regarder sur le vélo

#### Jeu de direction, potence ST0046, cintre HB0067, ruban, cocottes GRX, leviers et durites

Formes approchées :

- Point de saisie de la cocotte : Canyon ne le précise pas. Il est pris sur le dessus de la cocotte, au plat où se pose la main, avant la corne.
- Cocottes : forme approchée d’après la photo officielle du vélo. La cocotte gauche est dessinée comme la droite.
- Leviers : forme approchée d’après la photo officielle du vélo. Le petit levier de la manette droite est approché.
- Place des cocottes sur la courbe du cintre et rotation du cintre dans la potence : non publiées. Elles sont calculées pour que la main tombe au point publié par Canyon.
- Courbe du cintre : seuls le déport, la descente, l’évasement, l’inclinaison et les largeurs sont publiés. La forme de la courbe et la longueur des drops sont approchées.
- Inclinaison de la partie haute du cintre : Canyon la donne sans dessin. Elle est dessinée vers le bas, du collier vers les cocottes.
- Ruban : épaisseur et début du ruban approchés.
- Potence : longueur et angle publiés. Corps, capot de serrage et vis approchés d’après la photo officielle.
- Capot et entretoise du jeu de direction : formes et hauteurs approchées. Le nombre d’entretoises n’est pas publié.
- Durites et gaine : grosseur et trajet approchés. Elles longent le cintre sous le ruban et entrent dans le capot du jeu de direction, comme sur la photo officielle.

À vérifier à la livraison :

- référence du levier gauche : la fiche ne donne pas sa référence complète, à lire sur la pièce
- sens de montage de la potence, à regarder sur le vélo

#### Géométrie

Formes approchées :

- Le rayon extérieur du pneu monté n’est pas publié. Il est approché.
- La fiche donne une plage de hauteurs de selle, pas une valeur. La selle est posée vers le milieu de cette plage.
- La forme de la tête de tige et des rails de selle n’est pas publiée. L’écart entre le haut de la tige et le dessus de la selle est approché.
- La forme de la fourche n’est pas publiée. La position de la couronne sous la douille est approchée.
- La position latérale du disque avant n’est pas publiée. Elle est approchée.
- La position latérale du disque arrière n’est pas publiée. Elle est approchée.
- La distance des étriers à leur moyeu n’est pas publiée. Elle est approchée.
- La position de l’étrier avant autour du moyeu n’est pas publiée. Elle est lue au mieux sur la photo officielle.
- La position de l’étrier arrière autour du moyeu n’est pas publiée. Elle est lue au mieux sur la photo officielle.
- Le pédalier est dessiné dans une position choisie pour la lisibilité. Ce n’est pas une position réelle.
- Le pas de la chaîne n’est pas relevé sur un document du fabricant. La valeur retenue est celle du pas courant des chaînes de vélo.
- La chaîne est dessinée sur un seul pignon, choisi pour la lisibilité. Ce n’est pas un rapport réel.
- La position latérale de la cassette n’est pas publiée. Elle est approchée.
- L’écart entre deux pignons de la cassette n’est pas publié. Il est approché.
- La position de la poulie haute du dérailleur n’est pas publiée. Elle est approchée.
- La distance entre le pignon et la poulie haute du dérailleur n’est pas publiée. Elle est approchée.
- La fiche indique une cage courte, sans cote. L’écart entre les poulies est approché.
- L’inclinaison de la cage du dérailleur n’est pas publiée. Elle est approchée.
- Le nombre d’entretoises montées à la livraison n’est pas publié. La hauteur de la potence est approchée.

À vérifier à la livraison :

- La fiche nomme cette cote « inclinaison du cintre ». C’est très probablement l’angle de direction. À confirmer avec le schéma de la fiche.
- Canyon définit la position de la main par un lien « En savoir plus » de la fiche. Sa page d’explication de la géométrie dit que ces valeurs sont calculées avec la main posée sur les cocottes, au point où tu saisis la cocotte, en tenant compte de la potence, de la forme du cockpit et des entretoises montées à la livraison. Elle ne précise pas ce point sur la cocotte : à vérifier.
- Canyon ne dit pas dans quel sens la potence est montée à la livraison. Elle est dessinée vers le bas, comme sur la photo officielle du vélo. À regarder sur le vélo.
- La page du cintre annonce un déport plus long que le marquage de sa photo officielle. Le cintre photographié est le plus étroit des deux. À lire sur le cintre.
- Lue sur le marquage du cintre photographié, le plus étroit des deux. À lire sur le cintre.

## Lot 1 · Freins · en relecture

- Règle des sources appliquée le 20/10/2026 : suppression des liens revendeurs (poids et versions du RT-MT800, association BR-RX400, « Metal and resin »), de la copie non officielle du guide Canyon (couple de l'axe avant, ordre de montage, rodage), de la règle Park Tool « 1 mm » et des couples d'étriers route donnés à titre indicatif, de la vidéo GMBN.
- Le chapitre Freins est découpé en huit ateliers, rangés dans les zones de la page d'accueil : disques (2.2, 2.4), étrier et plaquettes (2.3, 2.5, 2.6), manettes et durites (2.1, 2.7, 2.8).
- Pièces 3D : disque RT-MT800 + bague + outil TL-FC36 (`rotor`), étrier flat mount + plaquettes L04C (`caliper`), kit de purge (`bleed`).
- Points ouverts : référence exacte de l'étrier (à lire à la livraison), référence de la version à denture extérieure du RT-MT800 (fiche Shimano inaccessible pendant la rédaction), couple du purgeur d'étrier GRX (non publié), couple de l'axe avant (guide du carton).
- Le tableau Shimano C-461 marque le RT-MT800 comme abandonné : sa disponibilité est à vérifier avant l'achat.

## Données personnelles

Le dépôt est public. Les brouillons des lots suivants restent hors du dépôt tant qu'ils contiennent des données personnelles. Avant d'ajouter un lot, vérifier qu'il n'expose que ce que Lamine accepte de rendre public.
