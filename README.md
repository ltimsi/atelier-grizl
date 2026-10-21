# Atelier Grizl

Guide d'atelier personnel pour monter, régler et réparer un Canyon Grizl CF 7 (taille M, Floating Violet) : procédures pas à pas, couples de serrage, planches techniques en SVG et pièces en 3D à faire tourner. Site statique en plusieurs pages, pensé d'abord pour l'ordinateur et lisible au téléphone, servi par nginx sur le serveur Hetzner derrière le reverse proxy.

La page d'accueil « Mon vélo » montre le vélo en 3D réaliste, avec ses pièces d'origine. Ses pastilles et la colonne « Où intervenir » mènent aux ateliers : disques, étrier et plaquettes, manettes et durites pour l'instant. Chaque atelier a sa page : ses étapes, ou les blocs d'une fiche « comprendre », se déplient d'un clic, un mode pas à pas montre les étapes une à une, et à droite viennent, selon l'atelier, la planche ou la pièce 3D, ce qu'il faut démonter, les outils et les couples. Sans WebGL, un schéma 2D prend le relais. Ce qui n'est pas publié par les fabricants est dessiné au mieux et listé sous « Ce qui est approché ». La 3D utilise three.js 0.160.0 en modules ES : en local depuis `vendor/three/` pour le site, depuis jsDelivr pour l'aperçu.

## Les pages

| Page | Adresse |
|---|---|
| Mon vélo : le vélo en 3D, « Où intervenir », les pièces à remplacer, les catégories | la racine |
| Catégorie Freins : ordre du jour J, filtres, une carte par atelier, couples | `freins/` |
| Un atelier | `freins/<atelier>/`, par exemple `freins/plaquettes/` |
| Catégorie à venir : son lot et ce qui y est prévu | `montage/`, `tubeless/`, `transmission/`, `accessoires/`, `revision/` |
| Références | `composants/`, `outils/`, `couples/`, `approche/`, `sources/` |

Chaque page est le fichier `index.html` de son dossier, et tous ses liens sont relatifs : le même site marche à la racine d'un serveur, dans un sous-dossier et dans l'aperçu Claude. Le menu des catégories est à gauche, le fil d'Ariane et la recherche en haut. Sous 1100 px de large, tout passe sur une colonne ; sous 900 px, le menu se range derrière le bouton « Menu ».

Les anciennes adresses de la page unique restent valables : `#freins-plaquettes` à la racine ouvre `freins/plaquettes/`, `#freins` ouvre `freins/`, et une ancre de planche comme `#freins-pl-2` ouvre la page de son atelier, sur la planche.

Sans JavaScript, tout reste lisible : les étapes et les blocs s'ouvrent d'un clic, le menu et le fil d'Ariane sont des liens. On perd seulement la 3D, la recherche, les filtres, le mode pas à pas, les onglets des figures et la mémoire des cases cochées.

## Comment le site avance : par lots validés

Le contenu est publié lot par lot. Un lot n'apparaît sur le site que s'il est « en relecture » ou « validé » dans `build/lots.json`. Chaque lot validé fait l'objet d'un commit et d'une étiquette Git (`lot-1`, `lot-2`…).

| Lot | Contenu | Pièces 3D | Statut |
|---|---|---|---|
| 0 | Le vélo en 3D de la page d'accueil, et le site en plusieurs pages | cadre, roues, freins, transmission, poste de pilotage | en relecture |
| 1 | Freins, en huit ateliers | disque Center Lock, étrier, kit de purge | en relecture |
| 2 | Avant de commencer, montage à la livraison | clé dynamométrique, poste de pilotage, axe traversant, pédale | à faire |
| 3 | Tubeless et crevaisons | coupe de roue, mèche | à faire |
| 4 | Transmission | chaîne, cassette, dérailleur, pédalier | à faire |
| 5 | Entretien, accessoires, dépannage | porte-bagages | à faire |
| 6 | Aide-mémoire des couples, sources | | à faire |

Les brouillons des lots « à faire » ne sont pas dans ce dépôt public : ils ne respectent pas encore la règle des sources et contiennent des données personnelles (position d'étude posturale, poids pour les calculs de charge et de pression). Chaque lot entre dans le dépôt au moment de sa relecture.

## Règle des sources

Voir [docs/regle-des-sources.md](docs/regle-des-sources.md). En résumé : chaque chiffre vient d'un document officiel du fabricant de la pièce ; Park Tool sert seulement à décrire les gestes ; sinon « non publié ».

## Arborescence

```
build/lots.json        liste des lots, leur statut et leurs pièces 3D
build/assemble.py      assemble le site (Python 3, sans dépendance) et contrôle chaque page
build/pages.py         les pages, une par adresse : accueil, catégories, ateliers, catégories à venir, références
build/ateliers.py      découpe un chapitre en ateliers : étapes repliables, colonne de droite, couples
build/gabarit.py       habille chaque page : menu, fil d'Ariane, recherche, pied, scripts, liens relatifs
build/dom.py           arbre HTML fidèle, pour déplacer les blocs d'un chapitre sans réécrire son texte
src/parts/             fragments HTML : en-tête et styles (00), page d'accueil et scène (05), chapitres,
                       composants d'origine, pied (99)
src/js/site.js         commun à toutes les pages : menu, recherche, cases cochées, « Tout déplier », pas à pas,
                       onglets des figures, filtres, anciennes ancres
src/js/references.js   remplit les pages « Ce qui est approché » et « Sources »
src/scene/             le vélo en 3D de la page d'accueil : page (app.js), scène, géométrie, sources, matières,
                       studio, schéma 2D, liste « Ce qui est approché », zones d'atelier (zones.json), pièces
src/js/viewer.js       visionneuse des pièces 3D des ateliers
src/js/models/m-*.js   un fichier par pièce 3D d'atelier, lots publiés seulement
vendor/three/          three.js 0.160.0 en modules ES (licence MIT)
tests/                 tests du build (Python) et des modules JavaScript (Node)
deploy/                Dockerfile, configuration nginx du conteneur, procédure de déploiement
docker-compose.yml     service atelier-grizl, sur 127.0.0.1 derrière le reverse proxy
tools/                 contrôle dans le navigateur (Playwright) : scene-check.js pour tout le site, shoot.js pour
                       les figures d'une page (à adapter aux onglets, voir docs/PASSATION.md) ;
                       approximations-md.mjs régénère la liste « Ce qui est approché » de docs/lots.md
docs/                  règle des sources, suivi des lots, conception, notes de recherche brutes
```

## Construire

```sh
python3 build/assemble.py            # dist/site (serveur) et dist/artifact (aperçu Claude)
python3 build/assemble.py --target site
```

Le script refuse de terminer sans erreur s'il trouve, dans une page, un tiret cadratin, un id en double, ou un lien, un script ou une ancre qui ne mène à rien.

## Tester

```sh
python3 -m unittest discover -s tests -p 'test_*.py'
node --test 'tests/js/**/*.test.mjs'
cd tools && npm ci && npx playwright install chromium   # une fois
node scene-check.js ../dist/site shots-site 1440 900 clair
```

`scene-check.js` ouvre les 20 pages de `dist/site/` dans Chromium, avec la politique de contenu du serveur, et enregistre une capture par page. Il sort en erreur s'il voit une erreur dans une page, un défilement horizontal (à l'arrivée et page tout dépliée), un menu à l'écran sous 900 px avant le clic sur « Menu », plus de 500 000 triangles dans la 3D de l'accueil, ou un des parcours qui ne marche pas : pastilles et « Où intervenir », anciennes ancres, filtres, pièces 3D des ateliers, « Tout déplier », pas à pas, menu et « Aller au contenu » au clavier, recherche, modules absents, accueil sans JavaScript. `--disable-webgl` le lance sans WebGL, `--mouvement` sans réduire les animations, `--sans-js` sans JavaScript. Le détail est dans [docs/PASSATION.md](docs/PASSATION.md).

## Déployer

Voir [deploy/DEPLOIEMENT.md](deploy/DEPLOIEMENT.md).
