# Atelier Grizl

Guide d'atelier personnel pour monter, régler et réparer un Canyon Grizl CF 7 (taille M, Floating Violet) : procédures pas à pas, couples de serrage, planches techniques en SVG et pièces en 3D à faire tourner du doigt. Site statique, pensé pour le téléphone, servi par nginx sur le serveur Hetzner derrière le reverse proxy.

La page d'accueil montre le vélo en 3D réaliste, avec ses pièces d'origine. Ses pastilles ouvrent les ateliers des chapitres : disques, étrier et plaquettes, manettes et durites pour l'instant. Sans WebGL, un schéma 2D prend le relais. Ce qui n'est pas publié par les fabricants est dessiné au mieux et listé sur la page, sous « Ce qui est approché ». La 3D utilise three.js 0.160.0 en modules ES : en local depuis `vendor/three/` pour le site, depuis jsDelivr pour l'aperçu.

## Comment le site avance : par lots validés

Le contenu est publié lot par lot. Un lot n'apparaît sur le site que s'il est « en relecture » ou « validé » dans `build/lots.json`. Chaque lot validé fait l'objet d'un commit et d'une étiquette Git (`lot-1`, `lot-2`…).

| Lot | Contenu | Pièces 3D | Statut |
|---|---|---|---|
| 0 | Le vélo en 3D de la page d'accueil | cadre, roues, freins, transmission, poste de pilotage | en relecture |
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
build/assemble.py      assemble le site (Python 3, sans dépendance)
src/parts/             fragments HTML : en-tête et styles (00), haut de page et scène (05), chapitres, pied (99)
src/scene/             le vélo en 3D de la page d'accueil : page (app.js), scène, géométrie, sources, matières,
                       studio, schéma 2D, zones d'atelier (zones.json) et pièces (pieces/)
src/js/viewer.js       visionneuse des pièces 3D des chapitres
src/js/models/m-*.js   un fichier par pièce 3D de chapitre, lots publiés seulement
vendor/three/          three.js 0.160.0 en modules ES (licence MIT)
tests/                 tests de l'assemblage (Python) et des modules de src/scene (Node)
deploy/                Dockerfile, configuration nginx, procédure de déploiement
docker-compose.yml     service atelier-grizl, sur 127.0.0.1 derrière le reverse proxy
tools/                 contrôle visuel (Playwright) : shoot.js pour les chapitres, scene-check.js pour l'accueil
docs/                  règle des sources, suivi des lots, notes de recherche brutes
```

## Construire

```sh
python3 build/assemble.py            # dist/site (serveur) et dist/artifact (aperçu Claude)
python3 build/assemble.py --target site
```

Le script refuse de terminer sans erreur s'il trouve un tiret cadratin ou un id en double.

## Tester

```sh
python3 -m unittest discover -s tests -p 'test_*.py'
node --test 'tests/js/**/*.test.mjs'
cd tools && npm ci && npx playwright install chromium   # une fois
node scene-check.js ../dist/site/index.html shots-accueil 420 900 light
```

`scene-check.js` sort en erreur s'il voit une erreur dans la page, un défilement horizontal, plus de 500 000 triangles, ou si l'atelier `#freins-plaquettes` ne s'ouvre pas dans la fiche. Le détail est dans [docs/PASSATION.md](docs/PASSATION.md).

## Déployer

Voir [deploy/DEPLOIEMENT.md](deploy/DEPLOIEMENT.md).
