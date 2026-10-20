# Atelier Grizl : le vélo en 3D et ses ateliers

Document de conception, 20 octobre 2026. Réponses de Lamine intégrées le même jour ; à valider avant le plan de travail.

## Intention

Lamine a choisi un Canyon Grizl CF 7, taille M, coloris Floating Violet, livré à domicile et monté par lui-même. Il veut apprendre la mécanique vélo sur son propre vélo et devenir autonome : faire son service, entretenir le vélo, et monter lui-même les pièces qu'il a choisies. Le site est son outil d'apprentissage et d'atelier. Il le consulte sur son téléphone, posé à côté du vélo, les outils en main.

Ce document complète [PASSATION.md](../../PASSATION.md) et ne la remplace pas. Les décisions de la passation restent valables : règle des sources, un lot à la fois, de la 3D dans chaque lot, aucune donnée personnelle dans le dépôt public, rien sur le serveur sans l'accord de Lamine, règles de style.

## Ce que Lamine a décidé

1. **L'entrée du site est son vélo en 3D.** Le Grizl CF 7 entier, en taille M et en Floating Violet, tel qu'il sort du carton, donc avec les pièces d'origine. On le fait tourner du doigt et on zoome.
2. **Toucher une zone ouvre ses ateliers.** Une pastille numérotée sur le vélo, ou une puce sous la scène, ouvre la fiche de l'atelier et rapproche la vue de la pièce.
3. **Une fiche d'atelier dit :** ce qu'il faut démonter avant, les outils à sortir, les gestes dans l'ordre, et une vidéo du geste.
4. **Pour une pièce neuve, un bouton montre la pièce d'origine ou la pièce neuve directement sur le vélo.** La maquette le fait déjà pour les disques (SM-RT64 ou XT RT-MT800), les pédales (livré sans pédales ou PD-ME700) et les plaquettes (en place ou sorties de l'étrier).
5. **Le rendu est réaliste, pièce par pièce.** Il ressemble à une photo de studio : peinture vernie, métal, caoutchouc, ombre au sol. Lamine a jugé la première version « pas assez réaliste » et a validé le niveau de la maquette du 20 octobre.
6. **Ne jamais inventer, toujours vérifier.** La règle des sources s'étend à la 3D : chaque cote, chaque forme et chaque référence d'une pièce vient d'un document officiel du fabricant ou d'une photo de son vélo.
7. **Le contenu couvre trois besoins :** apprendre la mécanique, faire son service et l'entretien, monter les pièces qu'il veut mettre en place.
8. **On commence sans attendre la livraison.** Le socle 3D se construit tout de suite. Les photos de son vélo, prises à la livraison, servent ensuite à corriger ce qui ne se vérifie que sur la pièce : modèle exact de l'étrier, type de patte de dérailleur, chape du dérailleur.
9. **La première livraison réunit le socle et les freins.** La page d'accueil 3D arrive avec les ateliers Freins (disques XT, plaquettes, rodage, purge), tirés du chapitre Freins déjà sourcé. C'est la seule exception à « un lot à la fois ». Les remarques de Lamine sur le chapitre Freins en relecture restent prises en compte.
10. **Les formes non publiées sont approchées et signalées.** Une pièce dont la forme exacte n'est publiée nulle part est dessinée au plus juste d'après les photos et documents officiels, et marquée « forme approchée », jamais présentée comme exacte. Les chiffres, eux, ne sont jamais approchés.

## La maquette de référence

Une maquette jetable a servi au brainstorming. C'est un artefact privé, dont le lien est dans le message de passation de Lamine. Elle contient :

- le vélo entier en 3D réaliste : environnement de studio, ombre de contact au sol, peinture marbrée vernie, crampons des pneus, maillons de chaîne, visserie ;
- trois rendus au choix : schéma 2D, 3D simple aux couleurs par fonction, 3D réaliste ;
- six ateliers d'exemple, avec le bouton pièce d'origine ou pièce neuve.

Ce qui y est vérifié, d'après la fiche Canyon suisse du Grizl CF 7 (référence 4553) : stack 596, reach 404, angle du tube de selle 73,5°, bases 440, empattement 1076, douille 158, drop 75, manivelles 165, cintre 440, potence 60, cassette 10-45, plateau 40, disques SM-RT64 de 160, pneus de 45, jante de 26 de haut et 24 de large intérieure, dérailleur RD-RX822 à chape courte, coloris. La fiche nomme « inclinaison du cintre » l'angle de 71° utilisé comme angle de direction : à confirmer.

Ce qui y est inventé ou estimé, donc à remplacer ou à signaler : formes et diamètres des tubes, longueur du tube de selle, hauteur de selle, angle de potence, dessin du cintre, nombre de rayons, formes des cocottes, des étriers, du dérailleur (la maquette lui donne une chape longue, alors que celle d'origine est courte), des disques XT et des pédales, motif des crampons, marbré de la peinture, textes des fiches.

Le code de la maquette est dans [2026-10-20-maquette-velo-3d.html](2026-10-20-maquette-velo-3d.html). Il sert de point de départ technique et de niveau de rendu minimal, pas de contenu : ses textes d'ateliers sont des exemples.

## Les ateliers à prévoir

La liste vient du tableau privé de Lamine (liste d'achat, évolutions, outils). L'ordre de montage est celui de ce tableau : les freins d'abord.

**À la livraison**

- Monter le vélo sorti du carton : cintre, roue avant, selle, contrôles avant la première sortie.
- Remplacer les disques SM-RT64 par des Deore XT RT-MT800, puis les roder.
- Passer aux plaquettes métalliques L04C-MF.
- Passer les pneus en tubeless : valves, liquide, pompe à réservoir.
- Monter les pédales PD-ME700 et les cales SPD.
- Reporter sa position de bike fit sur le Grizl. Les cotes sont des données personnelles : elles ne vont jamais dans le dépôt public. Tant que le site est public, rien de ce qui est servi n'en contient non plus. La forme de cet atelier est reportée : Lamine en décidera au moment du lot 2.

**Pour les trajets**

Porte-bagages Ortlieb Quick-Rack L, garde-boue Canyon DEFEND, éclairage Knog Blinder, sonnette Knog Oi Luxe, porte-bidons, support d'antivol.

**Plus tard**

- Kit montée : plateau GRX de 38 dents, cassette SLX 10-51, dérailleur RD-RX822-SGS, chaîne CN-M7100.
- Changer de pneus.
- Selle, ruban de cintre.
- Roues de rechange.
- Sacoches de bikepacking et supports de fourche.

**Entretien et révision, sans pièce neuve**

- Nettoyage.
- Chaîne : usure, nettoyage, lubrification.
- Freins : contrôle des plaquettes, purge.
- Pneus : pression, liquide.
- Serrages.
- Réglage du dérailleur.
- Une page « Ma révision » rassemble ce qu'il faut contrôler et quand, avec uniquement des intervalles publiés par Shimano, Canyon ou le fabricant de la pièce.

**Comprendre**

Pour chaque système (freins, transmission, roues, poste de pilotage) : comment il fonctionne, en vue éclatée 3D, avec le nom de chaque élément.

## Le découpage en lots proposé

On garde « un lot à la fois ». Chaque lot apporte ses ateliers et ses pièces 3D modélisées d'après les documents officiels.

| Lot | Contenu |
|---|---|
| 0 et 1, livrés ensemble | Socle : page d'accueil avec le vélo 3D d'origine, système d'ateliers et de pastilles, bouton d'origine ou neuf, schéma 2D de secours. Freins : le chapitre en relecture devient les ateliers disques XT, plaquettes, rodage, purge, et la fiche « comprendre les freins » |
| 2 | Livraison : montage du vélo, pédales et cales, report de position (cotes privées) |
| 3 | Tubeless et crevaisons |
| 4 | Transmission : entretien de la chaîne, réglage du dérailleur, puis le kit montée |
| 5 | Accessoires des trajets |
| 6 | Révision et aide-mémoire des couples |

## Contraintes

- **Téléphone d'abord.** La scène 3D doit rester fluide sur un téléphone récent. Si la 3D ne se charge pas, le schéma 2D prend le relais.
- **Site statique**, servi par nginx dans Docker sur le serveur Hetzner, public en HTTPS pour l'instant, derrière un VPN plus tard. `dist/site` embarque toutes ses bibliothèques en local. `dist/artifact` sert à l'aperçu dans Claude et charge les bibliothèques depuis un CDN autorisé.
- **three.js** : le dépôt embarque aujourd'hui la r128. Le rendu de studio de la maquette utilise la r160 et ses modules d'exemple : contrôles d'orbite, boîtes arrondies, flous pour l'ombre de contact. Les deux sous licence MIT.
- **Règle des sources** pour les chiffres, les formes et les références. Park Tool sert seulement pour les gestes. Une valeur absente s'écrit « non publié » ou « à lire sur la pièce ».
- **Style** : français, tutoiement, phrases courtes, jamais de tiret cadratin ni demi-cadratin, abréviations développées à leur première apparition, conseil sans source dans un encadré « Proposition ».
- **Données personnelles** : ni poids, ni cotes de position, ni nom de fitter, ni adresse, ni lieux de sortie, ni prix d'achat dans le dépôt.

## Non-objectifs

- Un guide pour tous les vélos. Le site ne parle que de ce Grizl CF 7 et des pièces que Lamine a choisies.
- Une boutique ou un comparateur. Pas de prix ni de liens d'achat sur le site.
- Un chantier mené d'un bloc. Pas de grande vague de travail en parallèle.

## Ce qui ferait échouer le projet, même s'il fonctionne

- Un chiffre, une forme ou une référence inventés, ou repris d'une source exclue, présentés comme exacts.
- Une donnée personnelle publiée.
- Un vélo qui ne ressemble pas au sien, ou un rendu « maquette » là où il attend du réalisme.
- Un site lent ou inutilisable au téléphone pendant qu'il travaille.

## Mes choix, à vérifier par Lamine

- **Vidéos en lien.** Le site renvoie vers la vidéo officielle par un lien plutôt que de l'intégrer. Cela évite le pistage de tiers et reste simple.
- **Trois rendus.** On garde le schéma 2D, utile comme secours et pour les détails, ainsi que la 3D réaliste. La 3D simple reste en option dans le socle, à retirer si elle ne sert pas.
- **Bibliothèque 3D.** Passer à la r160 de three.js, embarquée localement en modules ES avec une carte d'imports, plutôt que de rester sur la r128. Les trois modèles du lot 1 (`rotor`, `caliper`, `bleed`) sont portés dans la nouvelle scène ; leur aspect change, ce qui est attendu puisque le lot 1 devient des ateliers.
- **Photos officielles.** Les photos de produit publiées par Canyon et par les fabricants des pièces comptent comme documents officiels pour dessiner les formes. Les photos de son vélo, prises à la livraison, servent ensuite à corriger.
- **Où voir ce qui est approché.** Chaque fiche signale ses pièces à forme approchée. Sur la scène, un bouton discret ouvre la liste des pièces approchées et de ce qui reste à vérifier à la livraison.

## Ce qui est laissé au constructeur

- L'organisation du code de la scène et des modèles. Un fichier par pièce reste une bonne base, avec en tête de fichier la liste des documents qui justifient ses cotes.
- Le format des données d'atelier : fragments HTML ou JSON assemblés par `build/assemble.py`.
- Le portage des modèles existants du lot 1 (`rotor`, `caliper`, `bleed`) vers la nouvelle scène.
- Le budget de triangles et les réglages de rendu pour le téléphone.

## Reporté

- **Atelier de position (lot 2).** Méthode seule, cotes saisies et gardées sur le téléphone, ou contenu privé derrière le VPN : à décider avec Lamine au lot 2.
- **« Ma révision » (lot 6).** Liste fixe des intervalles publiés, ou carnet de ses propres révisions : à décider au lot 6.
