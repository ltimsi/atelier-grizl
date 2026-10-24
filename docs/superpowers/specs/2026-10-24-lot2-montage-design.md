# Atelier Grizl : lot 2, montage à la livraison

Document de conception du 24 octobre 2026. Lamine a choisi ce lot (« ok lot 2 ») et a laissé les choix de forme au rédacteur, sans séance de questions. Les choix marqués « choix du rédacteur » peuvent être changés par Lamine à la relecture.

Ce document complète les conceptions du [20 octobre](2026-10-20-velo-3d-ateliers-design.md), du [21 octobre](2026-10-21-site-multipage-design.md) et du [23 octobre](2026-10-23-grizl-cf8-di2-design.md). Leurs règles restent valables :

- la règle des sources ;
- rien d'inventé, et les formes approchées sont signalées ;
- aucune donnée personnelle dans le dépôt public ;
- rien sur le serveur sans l'accord de Lamine ;
- les règles de style.

## Pourquoi

Lamine a commandé son Grizl CF 8 Di2 (réf. 4556, taille M). Le jour de la livraison, il veut le monter lui-même, site ouvert à côté, sans jamais l'avoir fait. Le site n'a encore que la 3D et les freins. Les brouillons du 20 octobre ont été écrits pour le CF 7 : plusieurs valeurs y sont fausses pour le CF 8, et certaines contredisent Canyon. Exemples :

- l'insertion minimale de la tige ;
- l'ordre de serrage du capot de potence ;
- le conseil de serrer la tige dans le pied d'atelier ;
- la clé des pédales ;
- le contrôle d'un câble de dérailleur qui n'existe pas en Di2 sans fil.

## Source de vérité

Toutes les valeurs, gestes et références du lot viennent de [`docs/recherche/montage-cf8-di2.md`](../../recherche/montage-cf8-di2.md), relevé du 24/10/2026, et des documents qu'il cite. Ce relevé utilise :

- le guide de démarrage Canyon « QUICK START GUIDE GRIZL R126 », version 31.07.25 V02 ;
- le manuel Canyon des roues ;
- le manuel route Canyon de 2021 ;
- Shimano DM-MAPD001-07 (pédales et cales) ;
- les pages Shimano du Di2 ;
- Fizik, Schwalbe et DT Swiss.

Ses contradictions et sa liste « À lire sur la pièce ou sur l'outil » sont reprises telles quelles, jamais tranchées en silence.

Les brouillons `brouillons/parts/10-avant.html` et `11-montage.html` servent de matière de départ seulement. Chaque écart listé dans la section « Écarts avec les brouillons du 20/10 » du relevé est corrigé. Les brouillons restent hors du dépôt et ne sont jamais poussés.

## Ce que fait le lot

### Une catégorie « Montage à la livraison », chapitre 1

Elle prend la place de la page « à venir » `montage/`. Elle a neuf ateliers, numérotés 1.1 à 1.9, au format des ateliers Freins. Chaque atelier a :

- son type, comprendre, remplacer, régler ou entretenir ;
- ses étapes repliables, « Tout déplier » et le mode pas à pas ;
- « À démonter avant » et « Il te faut » ;
- ses couples dans un tableau ;
- sa planche ou sa pièce 3D ;
- ses vidéos et manuels.

| N° | Atelier | Type | Zone | Contenu, d'après le relevé |
|---|---|---|---|---|
| 1.1 | Avant de commencer | comprendre | aucune | Règles d'or, outils de Lamine et ce qu'ils couvrent (point 8 du relevé, avec les couples qu'aucun outil ne couvre : 2, 2,5 et 7 Nm), serrer au couple, interdiction Canyon de serrer une tige ou un cadre carbone dans les mâchoires |
| 1.2 | Déballer et vérifier | comprendre | aucune | Contenu du carton (point 1), ce qui est à lire sur les pièces et l'outil, version du guide imprimé à comparer au relevé |
| 1.3 | Cintre et potence | régler | poste | Capot de potence (deux vis du haut d'abord, sans jour, puis le bas, 6 Nm, pictogramme), vis du pivot 6 Nm, capuchon 2 Nm, entretoises (QSG p.10, 11, 56, 57) |
| 1.4 | Tige de selle et selle | régler | selle | Insertion de 110 mm au moins, jamais le repère MIN visible ; pâte de montage ; collier 6 Nm ; vis de tête 5 Nm ; vis d'inclinaison 7 Nm ; repères des rails (QSG p.13, 14, 26, 27, fiche de la tige, Fizik) |
| 1.5 | Roues et axes | régler | roue avant | Axe avant 10 à 15 Nm, clé de 6 mm ; axe arrière au levier, couple non publié par Canyon (type d'axe à lire) ; pression maximale 3,0 bar d'après le manuel Canyon des roues, la plus basse des sources |
| 1.6 | Pédales et cales | remplacer (de « aucune pédale » à PD-ME700) | pédalier | Graisse, pas à gauche, 35 à 55 N·m, clé plate de 15 mm ; cales SM-SH51 à 2,5 N·m puis 5 à 6 N·m, clé de 4 mm ; tension de déclenchement, clé de 3 mm (DM-MAPD001-07) |
| 1.7 | Charger et vérifier le Di2 | entretenir | dérailleur | Charge de la BT-DN320 avec l'EC-DN100 (environ une heure, voyants), niveau sur le dérailleur, piles CR1632 des manettes (« pour test » à la livraison), contrôle de l'appairage et des vitesses, E-TUBE PROJECT pas nécessaire le premier jour (pages Shimano du point 6) |
| 1.8 | Reporter ta position | régler | selle | Méthode seulement (point 9) : hauteur de selle définie par Canyon, recul et inclinaison avec les repères de la tige et de la selle, hauteur du cintre par entretoises, geste de mesure de Park Tool, plage de hauteur de selle de la taille M |
| 1.9 | Avant la première sortie | comprendre | aucune | Listes Canyon « avant la première sortie » et « avant chaque sortie » (QSG p.60, 61), renvois vers 2.4 Roder les freins et 2.6 Contrôles, sans les recopier |

**Choix du rédacteur.**

- « Avant de commencer » (l'ancien chapitre 0) devient l'atelier 1.1, pour garder une seule catégorie.
- « Charger la batterie Di2 » passe du lot 4 au lot 2 (atelier 1.7), parce que c'est un geste du jour de la livraison. Le lot 4 garde « Régler le dérailleur Di2 ».
- « Reporter ta position » donne la méthode, sans aucune cote de Lamine. Ses mesures restent hors du dépôt public : la page lui dit de les noter ailleurs.

### Ateliers sans zone

1.1, 1.2 et 1.9 ne concernent pas une pièce du vélo. Le format actuel exige une zone de `zones.json` pour chaque atelier. Le lot autorise donc un atelier sans zone, seulement pour le type « comprendre ». Un tel atelier :

- n'a ni pastille ni mention « Zone N » ;
- n'apparaît pas dans « Où intervenir » ;
- figure dans le menu, la catégorie, la recherche et le fil d'Ariane comme les autres.

Le contrôle du build reste strict pour tous les autres types.

### Cinq nouvelles zones sur le vélo de l'accueil

| Zone | Ancre (à poser dans `geometrie.js`) | Ateliers |
|---|---|---|
| Poste de pilotage | potence, au-dessus du capot | 1.3 |
| Selle et tige | tête de tige, sous la selle | 1.4, 1.8 |
| Roue avant et axes | tête de l'axe avant, côté gauche | 1.5 |
| Pédalier et pédales | bout de la manivelle droite, là où se visse la pédale | 1.6 |
| Dérailleur Di2 | batterie BT-DN320 sur le dérailleur | 1.7 |

Chaque zone a :

- sa pastille, numérotée à la suite des trois zones des freins ;
- sa vue de caméra ;
- son cadrage dans le schéma 2D ;
- sa carte dans « Où intervenir ».

Une ancre est un placement de vue, pas une cote.

Le vélo reste livré sans pédales : la 3D de l'accueil n'en dessine pas. Elle montre la pièce d'origine, comme pour les freins.

### Quatre pièces 3D pour les ateliers

Elles sont reprises des brouillons `brouillons/js/` et refaites pour le CF 8 Di2 et ses documents. Chaque pièce déclare ses formes approchées dans son en-tête, au format des pièces des freins. Ses libellés reprennent les valeurs exactes de l'atelier.

| Pièce | Atelier | Ce qu'elle montre |
|---|---|---|
| `cockpit` | 1.3 | Potence ST0046 et son capot à 4 vis, cintre HB0067, entretoises, capuchon, cocottes ST-RX825. L'ordre de serrage du capot (haut puis bas) est montré pas à pas. |
| `axle` | 1.5 | Bas de fourche, moyeu avant, axe traversant de 12 x 100 serré à la clé de 6 mm. Type d'axe à lire sur la pièce, forme approchée. |
| `pedal` | 1.6 | PD-ME700 droite, méplats de 15 mm, cale SM-SH51 et ses deux vis, sens de vissage de chaque pédale |
| `torque` | 1.1 | Clé à déclenchement TW-6.2 sur un axe, réglage et déclic. Elle ne dit rien de la clé Canyon, dont la plage est à lire. |

### Accueil, lots, références

- **Le plan « Le jour de la livraison » de l'accueil** :
  - « Monter le vélo » et « Reporter ta position » renvoient aux nouvelles pages ;
  - une ligne « Charger le Di2 » s'ajoute avant le premier tour de roue ;
  - les libellés « Chapitre 1 » deviennent des liens.
- **`build/lots.json`** :
  - le lot 2 passe « en relecture », avec la partie `11-montage` et les modèles `cockpit`, `axle`, `pedal` et `torque` ;
  - le lot 4 perd « Charger la batterie Di2 BT-DN320. ».
- **Les pages de référence** reprennent d'elles-mêmes les ateliers publiés : Couples, Outils, Sources et Ce qui est approché. Les nouveaux documents entrent dans `src/scene/sources.js` ; seuls ceux qu'une page ou une pièce cite y restent.
- **La documentation** :
  - `docs/lots.md` : l'entrée du lot 2 ;
  - PASSATION : ce que Lamine doit lire sur le vélo à la livraison ;
  - le LISEZMOI de la recherche.

## Ce qui reste à lire sur la pièce ou sur l'outil

C'est la liste du relevé, telle quelle :

- la clé Canyon ;
- le guide imprimé ;
- les marquages du capot, du collier et de la tige ;
- les repères de la selle ;
- les entretoises ;
- les deux axes ;
- les pneus et les jantes ;
- les pédales et les chaussures ;
- l'état du Di2 ;
- les réflecteurs.

Le site les montre en `span.verif`. L'atelier 1.2 les regroupe en une liste à cocher.

## Contraintes

- **Couples lus sur un pictogramme.** Le site dit qu'ils viennent d'un pictogramme du guide Canyon, avec la page, et qu'ils sont à comparer au guide imprimé du carton (règle 5 de `docs/regle-des-sources.md`).
- **Contradictions.** Celles du relevé sont signalées sur la page concernée :
  - couples de potence et de collier, guide de 2021 contre guide de 2025 ;
  - axe arrière ;
  - pression ;
  - charge admise ;
  - contenu du carton.

  La valeur appliquée est celle que le relevé retient (QSG R126 V02, 3,0 bar, 120 kg), et le site dit pourquoi.
- **Aucune donnée personnelle :** ni numéro de commande, ni prix, ni hauteur de selle de Lamine, ni cote de position, ni revendeur lié à une commande.
- **Aucune valeur Park Tool.** Park Tool sert pour les gestes seulement.
- **Les contrôles d'avant mise en ligne passent tous :**
  - les tests Python et Node ;
  - le build ;
  - scene-check sur les huit réglages ;
  - la relecture par tâche ;
  - la relecture finale de la branche.
- **La mise en ligne** se fait seulement avec l'accord de Lamine. Il la lance lui-même avec un script, ou il autorise la commande.

## Non-objectifs

- Le tubeless (lot 3) : 1.5 ne donne que la pression maximale pour le premier gonflage.
- Le réglage fin du dérailleur Di2 et l'entretien de la chaîne (lot 4).
- Les accessoires Tailfin (lot 5).
- Une fiche de position remplie avec les cotes de Lamine.
- Des pédales dans la 3D de l'accueil.

## Laissé au constructeur

- Le découpage du code de l'atelier sans zone.
- La forme exacte des ancres et des vues de caméra.
- La découpe des étapes de chaque atelier, à partir du relevé.
- Les planches 2D éventuelles, quand une pièce 3D n'est pas prévue.
