# Passation du projet Atelier Grizl

Ce document permet à une nouvelle session de reprendre le projet sans rien perdre. Lis-le en entier avant toute action.

## Le projet en bref

Atelier Grizl est un guide d'atelier personnel, en français, pour monter, régler et réparer un Canyon Grizl CF 8 Di2 (réf. 4556, taille M, Floating Violet, version suisse). C'est un site statique en plusieurs pages, pensé d'abord pour l'ordinateur, dont Lamine se sert le plus, et lisible au téléphone : procédures pas à pas, couples de serrage, planches techniques en SVG et pièces en 3D que l'on fait tourner. La page d'accueil « Mon vélo » montre le vélo de Lamine en 3D réaliste ; ses pastilles et la colonne « Où intervenir » mènent aux ateliers, chacun sur sa page. La 3D utilise three.js 0.160.0 en modules ES. Il est servi par nginx dans Docker sur le serveur Hetzner de Lamine. La refonte en plusieurs pages suit [superpowers/specs/2026-10-21-site-multipage-design.md](superpowers/specs/2026-10-21-site-multipage-design.md) et la maquette que Lamine a validée le 21 octobre 2026.

Le 23 octobre 2026, Lamine a changé de vélo. Le site, écrit d'abord pour un autre Grizl, est passé au CF 8 Di2 d'après [superpowers/specs/2026-10-23-grizl-cf8-di2-design.md](superpowers/specs/2026-10-23-grizl-cf8-di2-design.md), sur la branche `cf8-di2`. Le relevé du vélo est dans [recherche/composants-origine.md](recherche/composants-origine.md) et ses sources dans [recherche/sources-cf8-di2.md](recherche/sources-cf8-di2.md). Ce sont les deux seules références pour les pièces du CF 8 Di2. Le relevé du montage à la livraison (lot 2), fait le 24 octobre 2026 sur les documents officiels Canyon, Shimano, DT Swiss et Fizik, est dans [recherche/montage-cf8-di2.md](recherche/montage-cf8-di2.md). Celui du tubeless (lot 3), fait le 26 octobre 2026 sur les documents officiels Canyon, Schwalbe, Muc-Off, Topeak, DT Swiss et Park Tool (pour les gestes et ses propres outils), est dans [recherche/tubeless-cf8-di2.md](recherche/tubeless-cf8-di2.md).

## Décisions de Lamine, à respecter

1. **Règle des sources** ([regle-des-sources.md](regle-des-sources.md)). Chaque chiffre vient d'un document officiel du fabricant de la pièce. Park Tool sert à décrire les gestes, et pour l'usage de ses propres outils (leur plage, leurs crans, leur mode d'emploi). Pas de revendeur, de magazine, de comparateur, de copie non officielle ni de vieil article. Sans valeur officielle : « non publié » ou « à lire sur la pièce », sans chiffre de remplacement. Lamine a refusé une valeur tirée d'un article de 2009 : ce type d'erreur ne doit pas se reproduire.
2. **Un lot à la fois.** On livre un chapitre complet (texte, planches, pièces 3D), Lamine le relit et le valide, puis on passe au suivant. Pas de grande vague de travail d'un coup : il a interrompu une série de 13 agents lancés en parallèle.
3. **De la 3D dans chaque lot.** C'est une attente forte.
4. **Guide de démarrage Canyon.** Ses couples viennent du PDF officiel publié par Canyon sur canyon.com (QSG R126 V02), jamais d'une copie trouvée ailleurs, et restent à comparer aux pages du guide imprimé du carton à la livraison ; en cas d'écart, le guide imprimé s'applique et le site est corrigé. Décision de Lamine du 25/10/2026, qui remplace celle du 20/10 (couples seulement d'après les photos du guide imprimé).
5. **Site public pour l'instant**, en HTTPS derrière le reverse proxy du serveur. Accès par VPN WireGuard plus tard.
6. **Dépôt public : aucune donnée personnelle.** Pas de poids, pas de cotes d'étude posturale, pas de nom de fitter, pas d'adresse, pas d'e-mail. Depuis le passage au CF 8 Di2, pas non plus de prix payé, de numéro de commande, de hauteur de selle conseillée d'après l'entrejambe, ni de commande chez un revendeur. Les commits utilisent l'adresse `183486+ltimsi@users.noreply.github.com`. Avant d'ajouter un lot, demander à Lamine ce qu'il accepte de rendre public.
7. **Serveur.** Avant de modifier quoi que ce soit sur le serveur, expliquer ce qui va changer et pourquoi, et attendre son accord.
8. **Style.** Français, tutoiement, phrases courtes. Jamais de tiret cadratin ni de demi-cadratin. Chaque abréviation est développée à sa première apparition dans un chapitre. Un conseil sans source va dans un encadré « Proposition ».

## État au 26 octobre 2026

| Lot | Contenu | Pièces 3D | État |
|---|---|---|---|
| 0 | Le vélo en 3D sur la page d'accueil, ses zones d'atelier et la liste « Ce qui est approché », et le site en plusieurs pages | `src/scene/pieces/` : cadre, roues, freins, transmission, poste de pilotage | en relecture par Lamine |
| 1 | Freins, découpés en huit ateliers, une page chacun | `rotor` (disque Deore XT MT800 + bague, dessinée à denture extérieure, + TL-FC36), `caliper` (étrier BR-RX820 + plaquettes L05A-RF + curseur d'usure), `bleed` (kit de purge du DM-GADBR10, animé) | en relecture par Lamine |
| 2 | Avant de commencer et montage à la livraison, en neuf ateliers, une page chacun, et cinq zones de plus sur le vélo de l'accueil | `torque` (clé TW-6.2), `cockpit` (poste de pilotage et serrage du capot), `axle` (axe avant de 12 x 100), `pedal` (pédale PD-ME700 et cale SM-SH51) | en relecture par Lamine |
| 3 | Tubeless et crevaisons, en six ateliers, une page chacun, et une zone de plus sur le vélo de l'accueil | `rim` (coupe de roue GR 30 CF : jante sans crochet, ruban, pneu, liquide, valve), `plug` (mèche Park Tool TPT-1) | en relecture par Lamine |
| 4 | Transmission | `chain`, `cassette`, `derailleur`, `crank` | brouillon hors dépôt |
| 5 | Entretien, accessoires, dépannage | `rack` | brouillon hors dépôt |
| 6 | Aide-mémoire des couples, sources | | brouillon hors dépôt |

Les brouillons des lots 4 à 6 ont été écrits puis relus par des agents, mais ils datent d'avant la règle des sources stricte et d'avant le changement de vélo : leurs références de pièces sont à reprendre d'après le relevé du CF 8 Di2. Ils contiennent encore des liens de revendeurs et de magazines, des valeurs du guide Canyon lues sur une copie non officielle, et des données personnelles. Le modèle 3D `crank` a été écrit par un agent interrompu avant la fin : il est à tester et à finir. Le lot 2 a été refait le 24 octobre 2026 d'après [sa conception](superpowers/specs/2026-10-24-lot2-montage-design.md), sur la branche `lot2-montage`, et ses quatre modèles 3D finis. Le lot 3 a été refait le 26 octobre 2026 d'après [sa conception](superpowers/specs/2026-10-26-lot3-tubeless-design.md), sur la branche `lot3-tubeless`, et ses deux modèles 3D finis.

## Les pages du site

| Page | Adresse | Fait par |
|---|---|---|
| Mon vélo : le vélo en 3D, « Où intervenir », les pièces d'origine à remplacer, toutes les catégories | la racine | `src/parts/05-top.html`, complété par `build/pages.py` |
| Une catégorie publiée : en-tête du chapitre, ordre du jour J, filtres, une carte par atelier, couples sur le côté | `montage/` (chapitre 1), `freins/` (chapitre 2), `tubeless/` (chapitre 3) | `build/pages.py` |
| Un atelier, en deux colonnes : le texte et ses étapes repliables à gauche, à droite la planche ou la pièce 3D, ce qu'il faut démonter, « Il te faut », les couples et la vidéo | `freins/<atelier>/`, `montage/<atelier>/` et `tubeless/<atelier>/`, l'id de la section sans le préfixe du chapitre (exemples : `freins/plaquettes/`, `montage/di2/`, `tubeless/passer/`) | `build/ateliers.py` et `build/pages.py`, depuis `src/parts/20-freins.html`, `src/parts/11-montage.html` et `src/parts/30-tubeless.html` |
| Une catégorie à venir : son lot et ce qui y est prévu | `transmission/`, `accessoires/`, `revision/` | `build/pages.py` |
| Références : composants d'origine, outils, couples de serrage, ce qui est approché, sources | `composants/`, `outils/`, `couples/`, `approche/`, `sources/` | `build/pages.py`, `src/parts/composants.html`, `src/js/references.js` |

- Chaque page est le fichier `index.html` de son dossier. Tous les liens et chemins sont relatifs, jamais en `/…` : le même site marche sur le serveur, dans un sous-dossier et dans l'aperçu Claude. Dans `dist/site/`, la carte d'imports pointe vers `./vendor/three/` à la racine et vers `../` répété selon la profondeur ailleurs.
- Les anciennes adresses de la page unique restent valables : à la racine, `src/js/site.js` lit le bloc `#liens-data` et renvoie `#freins-plaquettes` vers `freins/plaquettes/`, `#freins` vers `freins/`, `#freins-pl-2` vers `freins/plaquettes/#freins-pl-2`, `#montage` vers `montage/`, `#montage-position` vers `montage/position/` et `#tubeless` vers `tubeless/`, sans laisser la racine derrière Retour.
- Les catégories publiées sont rangées par numéro de chapitre, pas par numéro de lot : `gabarit.numero_de_chapitre` le lit dans le premier chiffre du nom du fragment (`11-montage` : chapitre 1 ; `20-freins` : chapitre 2 ; `30-tubeless` : chapitre 3), celui que le `p.ch-num` du chapitre écrit. Le menu, les cartes des catégories de l'accueil, les pièces à remplacer, l'index de la recherche et les pages Couples, Outils et Sources suivent cet ordre ; les catégories à venir gardent l'ordre des lots.
- Points de rupture : deux colonnes au-dessus de 1100 px, une seule en dessous ; sous 900 px, le menu passe derrière le bouton « Menu ». La page ne défile jamais en largeur.
- Sans JavaScript, tout reste lisible : étapes et blocs en `<details>`, menu et fil d'Ariane en HTML, aucun contenu caché par `hidden`. On perd la 3D, la recherche, les filtres, le mode pas à pas, les onglets des figures et la mémoire des cases cochées. La tête de chaque page pose la classe `js` avant l'affichage et la retire si `site.js` n'a pas tourné. À l'accueil, un `<noscript>` (pas `html:not(.js)`, qui vaut aussi quand seul `site.js` manque) cache les onglets de rendu, l'aide et les deux boutons de la scène, qui dit « Le vélo en 3D a besoin de JavaScript. ».
- Si `js/scene/app.js` ne démarre pas, le garde-fou de `src/parts/99-foot.html` prend le relais : à l'accueil, il le dit et retire la scène ; sur un atelier qui a une pièce 3D, il lance la visionneuse, qui affiche dans la boîte de la pièce « La 3D n'a pas pu se charger ».
- Clavier : sur chaque page, le premier arrêt de Tab est « Aller au contenu », caché tant qu'il n'a pas le focus, qui saute le menu vers `main#contenu`. Sous 900 px, le menu ouvert est modal : `.main` et ce lien sont inertes (`inert`), Tab reste dans le menu, Échap le ferme et rend le focus au bouton « Menu ».
- Un lien « #id » du texte mène à la page qui porte l'id. L'id d'une catégorie à venir mène à sa page (`#transmission` mène à `transmission/`). Un id qui n'est sur aucune page devient du texte gris.
- Les textes des ateliers passent tels quels de `src/parts/20-freins.html`, `src/parts/11-montage.html` et `src/parts/30-tubeless.html` : le build les découpe et les range, il n'en écrit pas. Il n'ajoute que des libellés d'interface et des copies tirées des ateliers eux-mêmes (titres, faits des cartes, liens).

## Le dépôt

```
build/lots.json          lots, statut, fragments et pièces 3D de chaque lot
build/assemble.py        assemble le site (Python 3 seul) : dist/site et dist/artifact, puis contrôle chaque page
build/pages.py           les pages, une par adresse (voir le tableau plus haut), et l'index de la recherche
build/ateliers.py        relit un chapitre en ateliers : étapes, outils, couples, et les deux colonnes d'un atelier
build/gabarit.py         le gabarit commun : tête, menu, barre du haut (Menu, fil d'Ariane, recherche), pied, scripts,
                         liens « #id » réécrits vers la page qui porte l'id
build/dom.py             arbre HTML fidèle : déplacer et envelopper des blocs sans réécrire un texte
src/parts/               00-head (styles), 05-top (page d'accueil et scène), chapitres, composants (page
                         Composants d'origine), 99-foot
src/js/site.js           commun à toutes les pages : menu, recherche, cases cochées, « Tout déplier », pas à pas,
                         onglets des figures, filtres, anciennes ancres
src/js/references.js     remplit les pages « Ce qui est approché » et « Sources » depuis les modules de la scène
src/scene/               le vélo en 3D de la page d'accueil, en modules ES
  app.js                 la page d'accueil : onglets, pastilles, « Où intervenir », variantes, repli 2D ; sur les
                         pages d'atelier, three.js et la visionneuse
  scene.js               creerScene : rendu, caméra, zones, variantes, pastilles, approximations, triangles
  liste-approche.js      la liste « Ce qui est approché », pour la fenêtre de l'accueil et pour sa page
  geometrie.js           GEO (cotes de la taille M, publiées ou approchées) et points du vélo
  sources.js             registre des documents officiels cités par la 3D
  materiaux.js           matières des rendus réaliste et simple, textures calculées
  studio.js              éclairage du studio et ombre au sol
  outils3d.js            outils de construction des pièces
  schema2d.js            le schéma 2D, sans three.js
  zones.json             les zones d'atelier : nom, ancre, vue de la caméra, cadre du schéma, variante
  pieces/*.js            cadre, roues, freins, transmission, poste : META et construire()
src/js/viewer.js         visionneuse des pièces 3D des ateliers (API : AtelierModels.register)
src/js/models/m-*.js     une pièce 3D d'atelier par fichier, lots publiés seulement
vendor/three/            three.js 0.160.0 (MIT) : module, modules d'exemple utilisés, licence
tests/test_*.py          tests du build : assemblage, ateliers, arbre HTML, gabarit, pages (unittest)
tests/js/*.test.mjs      tests des modules JavaScript : scène, accueil, site.js, lots.md (node --test)
deploy/                  Dockerfile, nginx.conf (celui du conteneur), DEPLOIEMENT.md
docker-compose.yml       écoute sur 127.0.0.1, au port PORT de .env
tools/scene-check.js     contrôle de tout le site dans Chromium : captures, erreurs, débordement, menu, parcours
tools/shoot.js           captures des planches et des pièces 3D d'une page (écrit pour la page unique, voir plus bas)
tools/approximations-md.mjs  liste « Ce qui est approché » de docs/lots.md, générée depuis les META et GEO
docs/                    règle des sources, suivi des lots, conception (superpowers/specs/), notes de recherche
```

- `python3 build/assemble.py` publie seulement les lots dont le statut est « en relecture » ou « validé ». Il échoue s'il trouve, dans une page, un tiret cadratin, un id en double, ou un lien, un script ou une ancre qui ne mène à rien (`liens_casses`), et s'il manque à un atelier un bloc de son type. Les liens internes vers un chapitre non publié deviennent du texte simple.
- three.js 0.160.0 se charge en modules ES par une carte d'imports. `dist/site/` sert au serveur : documents complets, three.js servi en local depuis `vendor/three/`. `dist/artifact/` sert à l'aperçu dans Claude : la même arborescence, mais la page d'accueil sans squelette HTML (l'hôte pose le sien) et three.js depuis jsDelivr (`https://cdn.jsdelivr.net/npm/three@0.160.0/`).
- Tests, depuis la racine du dépôt :

  ```sh
  python3 -m unittest discover -s tests -p 'test_*.py'
  node --test 'tests/js/**/*.test.mjs'
  ```

  Garde les guillemets du motif. Sous Node 24, `node --test tests/js/` échoue : le dossier seul n'est plus parcouru.
- Contrôle dans le navigateur : `cd tools && npm ci` (Playwright 1.56.0, figé par `package-lock.json`), puis `npx playwright install chromium` la première fois. Chromium sans écran rend le WebGL avec `--use-gl=angle --use-angle=swiftshader` : les options sont déjà dans les scripts. Les captures vont dans `tools/shots*/`, ignoré par Git. Regarde les captures.
  - Tout le site : `node scene-check.js ../dist/site shots-1440 1440 900 clair`. Arguments : le dossier du site, le dossier des captures, la largeur, la hauteur, `clair` ou `sombre`, puis au choix `--disable-webgl`, `--mouvement` (sans réduire les animations) et `--sans-js`. Le script sert le dossier lui-même sur 127.0.0.1, comme nginx (`freins/` sert `freins/index.html`), avec la politique de contenu lue dans `deploy/nginx.conf` (une violation devient une erreur de console), puis :
    - ouvre chacune des 35 pages : aucune erreur dans la console ni requête en échec (seule la racine qui renvoie une ancienne ancre ailleurs a le droit d'abandonner des requêtes), pas de défilement horizontal, une capture par page (et la page entière pour l'accueil, `freins/` et `freins/plaquettes/`) ; sous 900 px, le menu est hors de l'écran tant que « Menu » n'est pas cliqué, le bouton l'ouvre et rend la page inerte (sur `freins/plaquettes/`, Tab ne sort pas du menu), Échap le referme ; chaque pièce 3D (1.1, 1.3, 1.5, 1.6, 2.2, 2.3, 2.7, 3.2, 3.5) est ouverte par son onglet et doit se dessiner, ou sans WebGL afficher son message ; enfin la page est tout dépliée (chaque `<details>` ouvert, les deux figures montrées) et ne doit toujours pas défiler en largeur ;
    - accueil : la scène est dessinée ; dans la vue d'ensemble, en 3D puis dans le schéma 2D, toutes les pastilles du bloc `#zones-data` de la page (celui qu'app.js lit, copie de `zones.json`) sont affichées, à 30 px au moins l'une de l'autre, et aucune ne touche le rectangle de l'aide ; la pastille 2 rend active la carte « Étrier et plaquettes » de « Où intervenir », la pastille 3 celle des manettes, la pastille 4 celle du poste de pilotage, la pastille 9 celle des pneus et des valves ; sur une colonne, une pastille ne fait pas défiler la page et le bouton d'une carte ramène l'image à l'écran ; sur deux colonnes, la colonne « Où intervenir » défile seule, la carte choisie y est en entier à l'écran, et après une pastille la moitié de l'image au moins reste à l'écran ; puis chaque vue de zone, en 3D et dans le schéma 2D, pastille par pastille depuis la vue d'ensemble : aucune pastille affichée, la choisie comme les autres, ne touche l'aide ni un bouton de la scène, et deux pastilles affichées restent à 30 px au moins l'une de l'autre, sinon c'est une erreur ; zone des disques sans variante, puis vue d'ensemble pour le budget de 500 000 triangles, variante des plaquettes sorties, schéma 2D et sa légende `#legende-2d` (visible en 2D, cachée en 3D), fenêtre « Ce qui est approché » ;
    - anciennes ancres : `index.html#freins-plaquettes` arrive sur `freins/plaquettes/`, de même `#freins` et `#freins-pl-2`, `#montage` sur `montage/`, `#montage-position` sur `montage/position/` et `#tubeless` sur `tubeless/`, et Retour quitte le site ;
    - `freins/` : le filtre « Remplacer » laisse 1 carte, les plaquettes (la dépose du disque est un entretien) ;
    - `freins/plaquettes/` : l'anneau de focus du lien du fil d'Ariane n'est pas rogné, la pièce 3D est dessinée, « Tout déplier » ouvre les 10 étapes, le pas à pas passe de « 1 / 10 » à « 2 / 10 » par la flèche droite et se ferme par Échap ; sur une page neuve, le premier Tab montre « Aller au contenu », Entrée mène au contenu et le Tab suivant y reste ;
    - recherche : « TL-FC36 » mène à `freins/disques/` ;
    - trois modules de la scène servis en 404 (`scene.js`, `pieces/roues.js`, `app.js`) : la page le dit et garde ses liens vers les ateliers ;
    - avec `--sans-js` : le résumé de l'étape 1 s'ouvre d'un clic, rien n'est caché par `hidden`, aucune commande inerte ne s'affiche ; à l'accueil, ni onglets de rendu, ni aide, ni boutons de la scène, qui dit « Le vélo en 3D a besoin de JavaScript. ».

    Il écrit `rapport.json` et sort en 1 au moindre écart. Passe-le, sur un build neuf, en 1440 x 900 `clair` et `sombre`, 1024 x 768, 420 x 900, 360 x 780, 420 x 900 `--disable-webgl`, 1440 x 900 `--sans-js`, 1440 x 900 `--mouvement` et 1280 x 720 : sur deux colonnes, l'image qui sort de l'écran après une pastille ne s'est vue qu'à 1280 x 720 et 1440 x 900. Chaque passage prend environ une minute.
  - `shoot.js` date de la page unique : il sert le dossier de la page qu'on lui donne, donc les scripts d'une page d'atelier (`../../js/`) ne s'y chargent pas, et il ne sait pas ouvrir l'onglet « Pièce en 3D ». Avec une adresse http, il marche pour une page dont toutes les figures sont visibles (`python3 -m http.server -d ../dist/site 8000`, puis `node shoot.js http://127.0.0.1:8000/freins/rodage/ shots 420 light`). Il reste à l'adapter aux onglets. En attendant, `scene-check.js` capture la pièce 3D de `freins/plaquettes/`.

## Écrire une pièce 3D

Deux familles de pièces 3D.

**Pièces de la page d'accueil** (`src/scene/pieces/*.js`). Chaque module exporte `META` (nom, sources, formes approchées, points à vérifier) et `construire(o, p, geo)`. Il reçoit les outils de `outils3d.js`, les points de `geometrie.js` et GEO. Il n'importe pas three.js : il le reçoit par les outils (`o.THREE`). Chaque cote vient de GEO ou d'une entrée `COTES` qui cite son document de `sources.js`. Une forme non publiée va dans `META.approche`, sans chiffre. Toutes les pièces ensemble restent sous 500 000 triangles (`tests/js/pieces.test.mjs`).

**Pièces des chapitres** (`src/js/models/m-*.js`). Lis `src/js/viewer.js`, puis un modèle terminé comme `m-caliper.js`. Un modèle s'enregistre avec `AtelierModels.register(nom, { camera, build(ctx) })`. `build` reçoit `ctx.THREE`, `ctx.H` (outils de géométrie), `ctx.M` (matériaux ; les couleurs sont écrites en hexadécimal sRGB, three.js les convertit lui-même) et `ctx.api`. Il renvoie `{ group, parts, pins, controls, onFrame }` :
- `parts` : les pièces qui bougent en vue éclatée ;
- `pins` : les pastilles numérotées et leur légende ;
- `controls` : des boutons ou des curseurs.

Unités en millimètres. Moins de 120 000 triangles. Les textes des pastilles suivent la règle des sources.

## Procédure pour chaque lot

1. Copier les fragments du lot depuis les brouillons vers `src/parts/` et ses modèles vers `src/js/models/`.
2. Appliquer la règle des sources ligne par ligne : supprimer tout ce qui vient d'une source exclue, remplacer par « non publié » quand il n'existe pas de valeur officielle.
3. Retirer les données personnelles, ou demander à Lamine s'il accepte de les publier.
4. Tester et finir les pièces 3D du lot.
5. Passer le lot à « en relecture » dans `build/lots.json`, assembler, lancer les tests, passer `scene-check.js` sur les neuf réglages de la liste plus haut et regarder les captures, en clair et en sombre, sur ordinateur et sur téléphone.
6. Publier l'aperçu pour Lamine et recueillir ses remarques.
7. Après sa validation : statut « validé », commit, étiquette `lot-N`, push.
8. Mettre à jour `docs/lots.md`.

## À lire sur le vélo à la livraison

La liste de l'atelier 1.2 « Déballer et vérifier » (`montage/deballer/`), où Lamine la coche sur le site. Ce sont les valeurs et les références qu'aucun document publié ne donne, ou que le site ne peut pas trancher : elles se lisent sur la pièce, sur l'outil ou dans le guide imprimé. Entre parenthèses, l'atelier qui s'en sert.

1. La clé dynamométrique Canyon du carton : sa plage, son type (à aiguille et à échelle d'après le manuel Canyon de 2021) et la taille de ses six embouts (1.1).
2. Le guide de démarrage imprimé : sa version, au dos, p.72, et ses couples, à comparer à ceux du chapitre, relevés sur le PDF officiel V02.
3. Le capot de potence : l'inscription « ZERO GAP 6 Nm » et les repères d'écart (1.3).
4. Le collier de selle GP0596-01 : un couple gravé éventuel (1.4).
5. La tige SP100 VCLS 2.1 : son repère « MIN », un couple gravé près des vis de tête et de la vis d'inclinaison, la position de sa tête « FLIP HEAD » et son échelle d'inclinaison (1.4).
6. La selle Fizik : ses repères des 75 mm, sur le dessus et sur les rails, et les repères « max » et « min » des rails (1.4).
7. Le nombre d'entretoises sous la potence et au-dessus (1.3).
8. L'axe avant : son type (six-pans de 6 mm ou levier), sa marque et l'inscription de sa tête (1.5).
9. L'axe arrière : son modèle (EP1916-01 ?), RWS (le système d'axe à levier de DT Swiss) ou non, levier amovible ou non, l'emplacement de sa clé de 6 mm et une inscription de couple (1.5).
10. Les pneus : la plage de pression imprimée sur le flanc ; les jantes : leur pression maximale imprimée (1.5).
11. Les pédales PD-ME700 : leurs méplats de 15 mm et leurs repères L et R ; dans leur boîte, les cales SM-SH51 et la cale d'épaisseur de 1,0 mm (1.6).
12. Les chaussures : compatibles SPD (le système de cales Shimano) à deux vis (1.6).
13. Le Di2 : le niveau de la batterie BT-DN320 (un clic sur le bouton du dérailleur), celui des piles CR1632 des manettes (deux boutons tenus 0,5 s), le passage des vitesses et l'appairage (1.7).
14. Les réflecteurs : le contenu des deux lots et leur visserie. Canyon ne publie ni leur pose ni un couple (1.9).
15. Les freins : les modèles des étriers, des disques, des plaquettes et de la manette gauche (2.1).

Pour le tubeless, la liste de l'atelier 3.1 « Ce que tu as » (`tubeless/materiel/`), que Lamine coche aussi sur le site, avant de passer chaque roue en tubeless (3.2) :

1. Ce qu'il y a dans les pneus : chambres à air, ou valves tubeless et liquide (3.2, étape 4).
2. Le ruban de chaque jante : présent ou non, sa marque, sa largeur, l'impression « TUBELESS SEALANT QUANTITY » et son tableau de doses, son état, son recouvrement, les trous de rayons tous couverts.
3. Les valves : dans le carton, sur les roues ou absentes ; leur marque, leur longueur, un obus démontable, leur écrou.
4. La jante : sa pression maximale imprimée, qui s'applique si elle est sous 3,0 bar, le marquage « 622x27TSS », le type et le diamètre du trou de valve, des trous de rayons centrés ou décalés.
5. Le pneu, sur le flanc : sa version (PRO ou non), sa gomme, « TLR », « 45-622 », sa plage de pression, minimum et maximum, et la flèche du sens de rotation.
6. Les démonte-pneus Park Tool TL-4.2 : en plastique, comme l'exige Canyon.
7. La pompe Topeak JoeBlow Booster : son modèle exact, TJB-BST2 ou TJB-BST3, et sa notice dans la boîte.
8. Les valves, une fois choisies : une longueur prévue pour une jante de 30 mm selon leur notice, un obus démontable, un écrou, le type Presta.
9. Le sachet ou le flacon Muc-Off Road & Gravel : ses repères de remplissage par taille de pneu (« fill lines »), le nom du produit et sa date d'achat, à noter pour « use within 2 years of purchase ».
10. Un liquide déjà présent dans les pneus à la livraison : à retirer entièrement avant le Muc-Off (3.2, étape 4).
11. Le guide imprimé du carton, sa version au dos, p.72 : s'il contient une page tubeless absente du PDF V02.

## Points ouverts par lot

- **Lot 0** : les points « à vérifier à la livraison » et les contradictions relevées dans les documents sont listés dans [lots.md](lots.md) et dans [recherche/composants-origine.md](recherche/composants-origine.md).
- **Lot 1**, à lire sur la pièce à la livraison :
  - modèle exact de l'étrier, BR-RX820 attendu ;
  - modèle exact des disques, RT-MT800 ou RT-CL800, et type de leur bague Center Lock : denture intérieure (outil TL-LR15) ou extérieure (outil TL-FC36) ;
  - plaquettes d'origine, L05A-RF attendues, et leur épaisseur neuve ;
  - manette gauche, ST-RX825-L ou BL-RX825-L ;
  - couple de l'axe avant : 10-15 Nm d'après le guide Canyon V02 (atelier 1.5), à comparer au guide imprimé du carton.
- **Lot 2** :
  - la liste « À lire sur le vélo à la livraison » plus haut ;
  - les couples du guide Canyon, relevés sur le PDF officiel V02 et souvent lus sur un pictogramme, à comparer aux pages du guide imprimé du carton, le guide imprimé s'appliquant en cas d'écart (règle 5 de la règle des sources, décision du 25/10/2026) ; Canyon ne publie pas le couple de l'axe arrière, à lire sur l'axe ;
  - les contradictions du relevé, signalées sur les pages : couples de la potence et du collier (guide de 2025 contre manuel de 2021), axe arrière, pression maximale (3,0 bar retenus), charge admise (120 kg retenus), contenu du carton ;
  - longueur des manivelles : 165 mm en M sur la fiche, à lire sur la manivelle ;
  - les couples de 2 Nm (capuchon), 2,5 N·m (serrage provisoire des cales) et 7 Nm (vis d'inclinaison de la tige) : ni la TW-6.2 (10 à 60 Nm) ni l'ATD-1.2 (4 à 6 Nm) ne les couvrent ; le site renvoie à la clé Canyon du carton, si sa plage le permet ;
  - outil à faible plage pour les couples sous 4 Nm : le plus petit couple publié pour le CF 8 Di2 est celui du couvercle des piles des manettes, 0,16-0,24 Nm (DM-GADBR10) ; pour les freins, c'est la vis de purge de la manette, 0,5-0,7 Nm.
- **Lot 3** :
  - la liste de l'atelier 3.1 plus haut, dont les valves et le ruban, fournis ou non, la pression maximale imprimée sur la jante et la version exacte du pneu ;
  - le choix des valves : le site ne donne que les critères publiés, sans marque ;
  - la limite de 3,0 bar, à aucun moment dépassée, talonnage compris : le manuel Canyon des roues et Schwalbe la fixent pour un pneu de 45 mm sur jante sans crochet ; les valeurs plus hautes et les consignes de surgonfler sont signalées comme contradictions sur les pages ;
  - les autres contradictions du relevé, signalées sur les pages : version du pneu, largeur du ruban, dose de liquide pour un pneu de 45 mm, CO2 ;
  - aucune pression n'est calculée pour Lamine : 3.4 renvoie aux tableaux publiés, sans son poids ;
  - la valve Presta : son écrou moleté se desserre avant de gonfler et se revisse à la main après (Schwalbe) ; pour une valve tubeless, sa notice fait foi, à lire à la livraison ;
  - le manomètre du JoeBlow Booster : sa précision n'est publiée ni par la notice ni par la page de Topeak, et la limite de 3,0 bar se lit sur ce cadran. La relecture finale propose de ne pas viser la limite elle-même : une Proposition, sans chiffre, à décider par Lamine avant de l'écrire dans le chapitre.
- **Lot 4** (la charge de la batterie BT-DN320 et les piles CR1632 des manettes sont dans l'atelier 1.7, au lot 2) :
  - patte de dérailleur UDH, la patte universelle de SRAM : présence et état ;
  - chaîne : référence, nombre de maillons et attache QUICK-LINK ; Canyon propose en pièces d'usure la CN-M8100 de 138 maillons et l'attache SM-CN910 ;
  - boîtier : référence exacte ; Canyon propose en pièce d'usure le SM-BB72-41B II ;
  - corps de roue libre de la roue arrière (Micro Spline, pour le pignon de 9 dents).
- **Lot 5** : la liste Tailfin (porte-bagages et son adaptateur UDH, sacoches, garde-boue, support d'éclairage), dont les documents restent à relever. Lamine n'a pas encore dit s'il garde les garde-boue Canyon DEFEND, l'éclairage et la sonnette Knog, les porte-bidons et le support d'antivol : sans réponse, ils sont retirés du lot.
- **Lot 6** : l'aide-mémoire ne reprend que les valeurs des lots validés.

## Déploiement

La procédure complète est dans [../deploy/DEPLOIEMENT.md](../deploy/DEPLOIEMENT.md). Sur le serveur actuel, nginx sur l'hôte sert de reverse proxy, avec un vhost et un certificat certbot (webroot) pour le sous-domaine, et le conteneur écoute sur `127.0.0.1`, au port libre choisi dans `.env` (3013 aujourd'hui). On le met à jour en copiant une archive `git archive` du commit relu, puis `docker compose up -d --build`. L'adresse exacte et les accès au serveur ne sont pas écrits ici, parce que ce dépôt est public. Toute nouvelle mise en ligne demande l'accord de Lamine (décision 7).

## Liens

### Projet

- Dépôt : https://github.com/ltimsi/atelier-grizl
- Liens privés (aperçu du site, fichiers de transfert, liste d'achat) : dans le message de passation que Lamine colle dans la nouvelle session. Ils ne sont pas écrits ici parce que ce dépôt est public.

### Vélo (Canyon, officiel)

- Fiche suisse du Grizl CF 8 Di2 : https://www.canyon.com/fr-ch/velos-de-gravel/adventure/grizl/cf/grizl-cf-8-di2/4556.html?dwvar_4556_pv_rahmenfarbe=R126_P06
- La même en anglais, avec les onglets des pièces de rechange et d'usure : https://www.canyon.com/en-ch/gravel-bikes/adventure/grizl/cf/grizl-cf-8-di2/4556.html
- Photo officielle du coloris : https://dma.canyon.com/image/upload/w_2400,c_fit/b_rgb:F2F2F2/f_auto/q_auto/v1785934014/2027_FULL_grizl_cf-8-di2_4556_R126_P06_vpvgno
- Manuel Canyon des roues : https://www.canyon.com/on/demandware.static/-/Library-Sites-canyon-shared/default/dw22ff8457/documents/customer-service/gravel-bikes/canyon-wheelset-manual-2025.pdf
- Page support Grizl CF (vidéos officielles : montage, chargement, porte-bagages, garde-boue, ruban, rodage) : https://www.canyon.com/en-us/customer-service/gravel/grizl/grizl-cf/

### Freins (lot 1)

- Shimano DM-GADBR10-04, manettes ST-RX825 et leur purge, en français : https://si.shimano.com/fr/pdfs/dm/GADBR10/DM-GADBR10-04-FRE.pdf
- Shimano DM-GADBR01-11, étriers, plaquettes et pistons GRX, en anglais : https://si.shimano.com/en/pdfs/dm/GADBR01/DM-GADBR01-11-ENG.pdf
- Sa version 10 en français, que citent les phrases gardées du chapitre : https://si.shimano.com/fr/pdfs/dm/GADBR01/DM-GADBR01-10-FRE.pdf
- Shimano DM-TORQUE-03, couples de serrage : https://si.shimano.com/en/pdfs/dm/TORQUE/DM-TORQUE-03-ENG.pdf
- Shimano DM-HB0002-14, moyeux et disques Center Lock : https://si.shimano.com/en/pdfs/dm/HB0002/DM-HB0002-14-ENG.pdf
- Shimano DM-RAWH010-02, roues : https://si.shimano.com/en/pdfs/dm/RAWH010/DM-RAWH010-02-ENG.pdf
- Vue éclatée BR-RX820, avec les deux bagues du RT-MT800 à 40 Nm : https://si.shimano.com/en/pdfs/ev/BR-RX820-5000/EV-BR-RX820-5000C.pdf
- Fiches de la manette ST-RX825-R et de l'étrier BR-RX820 : https://productinfo.shimano.com/en/product/ST-RX825-R et https://productinfo.shimano.com/en/product/BR-RX820
- Compatibilité des plaquettes (C-192) : https://productinfo.shimano.com/en/compatibility/C-192
- Compatibilité des disques (C-461) : https://productinfo.shimano.com/en/compatibility/C-461
- Types de bague Center Lock (C-612) : https://productinfo.shimano.com/en/compatibility/C-612
- Gamme GRX RX820 1x12 Di2 : https://productinfo.shimano.com/en/lineup/rx820-1x12-di2
- Park Tool, gestes :
  - disques : https://www.parktool.com/en-us/blog/repair-help/disc-brake-rotor-removal-installation
  - plaquettes : https://www.parktool.com/en-int/blog/repair-help/disc-brake-pad-removal-installation
  - centrage de l'étrier : https://www.parktool.com/en-int/blog/repair-help/hydraulic-disc-brake-alignment
  - redresser un disque : https://www.parktool.com/en-int/blog/repair-help/disc-brake-rotor-truing
  - purge Shimano : https://www.parktool.com/en-us/blog/repair-help/brake-bleeding-for-shimano-drop-bar-hydraulic-brakes-using-the-bkm-1

### Lots suivants

Pour les pièces du CF 8 Di2, les liens sont dans [recherche/sources-cf8-di2.md](recherche/sources-cf8-di2.md) ; pour le montage à la livraison (lot 2), dans [recherche/montage-cf8-di2.md](recherche/montage-cf8-di2.md) ; pour le tubeless (lot 3), dans [recherche/tubeless-cf8-di2.md](recherche/tubeless-cf8-di2.md). Les autres notes de recherche (`docs/recherche/freins.md`, `montage.md`, `transmission.md`, `tubeless.md`) datent du 20 octobre 2026 et portent sur le premier vélo : leurs références de pièces ne valent pas pour le CF 8 Di2, seules les méthodes et les sources générales peuvent servir de piste. Ces notes mélangent sources officielles et sources exclues : chaque lien doit être vérifié contre la règle des sources avant d'être cité.

Documents officiels principaux :

- Transmission :
  - dérailleur Di2 RD-M8250, sa batterie BT-DN320 et son chargeur EC-DN100, DM-MARD011-07 : https://si.shimano.com/en/pdfs/dm/MARD011/DM-MARD011-07-ENG.pdf
  - charge de la batterie, UM-7KZ0A : https://si.shimano.com/en/um/7KZ0A/UM-7KZ0A_charg_ing_method-merge
  - chaîne, DM-MACN001-08 : https://si.shimano.com/en/pdfs/dm/MACN001/DM-MACN001-08-ENG.pdf
  - cassette CS-M8200-12, DM-MACS010-02 : https://si.shimano.com/en/pdfs/dm/MACS010/DM-MACS010-02-ENG.pdf
  - pédalier et boîtier, DM-GAFC001-06 : https://si.shimano.com/en/pdfs/dm/GAFC001/DM-GAFC001-06-ENG.pdf
- Pédales, DM-MAPD001-07 : https://si.shimano.com/en/pdfs/dm/MAPD001/DM-MAPD001-07-ENG.pdf
- Tubeless (lot 3, les autres liens sont dans son relevé) :
  - page Canyon de la paire GR 30 CF : https://www.canyon.com/en-de/gear/bike-parts/tyres-and-tubes/wheels/canyon-gr-30-cf-wheelset/10014610.html
  - manuel Canyon des roues : son lien est plus haut, avec ceux du vélo
  - Schwalbe G-One RX : https://www.schwalbe.com/en/G-One-RX-11654623
  - Schwalbe, FAQ du tubeless : https://www.schwalbe.com/en/technology-faq/tubeless/
  - Muc-Off Road & Gravel Tubeless Sealant : https://muc-off.com/products/road-gravel-tubeless-sealant
  - notice Topeak du JoeBlow Booster : https://www.topeak.com/storage/app/media/download/product-manual/JoeBlow%E2%84%A2%20Booster/M-TJB-BST2-ML-08-16-web.pdf
  - notice Park Tool de la TPT-1 : https://www.parktool.com/assets/doc/product/TPT-1_instructions.pdf
- Accessoires (lot 5) : les documents Tailfin restent à relever.
