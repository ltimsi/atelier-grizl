# Atelier Grizl

Guide d'atelier personnel pour monter, régler et réparer un Canyon Grizl CF 7 (taille M) : procédures pas à pas, couples de serrage, planches techniques en SVG et pièces en 3D (three.js r128) à faire tourner du doigt. Site statique, pensé pour le téléphone, servi par nginx sur le serveur Hetzner derrière le reverse proxy.

## Comment le site avance : par lots validés

Le contenu est publié lot par lot. Un lot n'apparaît sur le site que s'il est « en relecture » ou « validé » dans `build/lots.json`. Chaque lot validé fait l'objet d'un commit et d'une étiquette Git (`lot-1`, `lot-2`…).

| Lot | Contenu | Pièces 3D | Statut |
|---|---|---|---|
| 1 | Freins | disque Center Lock, étrier, kit de purge | en relecture |
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
src/parts/             fragments HTML : en-tête et styles (00), haut de page (05), chapitres, pied (99)
src/js/viewer.js       visionneuse 3D commune
src/js/models/m-*.js   un fichier par pièce 3D des lots publiés
vendor/three/          three.js r128 (licence MIT)
deploy/                Dockerfile, configuration nginx, procédure de déploiement
docker-compose.yml     service atelier-grizl, sur 127.0.0.1 derrière le reverse proxy
tools/                 contrôle visuel (captures Playwright)
docs/                  règle des sources, suivi des lots, notes de recherche brutes
```

## Construire

```sh
python3 build/assemble.py            # dist/site (serveur) et dist/artifact (aperçu Claude)
python3 build/assemble.py --target site
```

Le script refuse de terminer sans erreur s'il trouve un tiret cadratin ou un id en double.

## Déployer

Voir [deploy/DEPLOIEMENT.md](deploy/DEPLOIEMENT.md).
