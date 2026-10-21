# Passation du projet Atelier Grizl

Ce document permet à une nouvelle session de reprendre le projet sans rien perdre. Lis-le en entier avant toute action.

## Le projet en bref

Atelier Grizl est un guide d'atelier personnel, en français, pour monter, régler et réparer un Canyon Grizl CF 7 (taille M, version suisse). C'est un site statique pensé pour le téléphone : procédures pas à pas, couples de serrage, planches techniques en SVG et pièces en 3D que l'on fait tourner du doigt. La page d'accueil montre le vélo de Lamine en 3D réaliste ; ses pastilles ouvrent les ateliers des chapitres. La 3D utilise three.js 0.160.0 en modules ES. Il est servi par nginx dans Docker sur le serveur Hetzner de Lamine.

## Décisions de Lamine, à respecter

1. **Règle des sources** ([regle-des-sources.md](regle-des-sources.md)). Chaque chiffre vient d'un document officiel du fabricant de la pièce. Park Tool sert seulement à décrire les gestes. Pas de revendeur, de magazine, de comparateur, de copie non officielle ni de vieil article. Sans valeur officielle : « non publié » ou « à lire sur la pièce », sans chiffre de remplacement. Lamine a refusé une valeur tirée d'un article de 2009 : ce type d'erreur ne doit pas se reproduire.
2. **Un lot à la fois.** On livre un chapitre complet (texte, planches, pièces 3D), Lamine le relit et le valide, puis on passe au suivant. Pas de grande vague de travail d'un coup : il a interrompu une série de 13 agents lancés en parallèle.
3. **De la 3D dans chaque lot.** C'est une attente forte.
4. **Guide de démarrage Canyon.** Ses couples ne seront ajoutés qu'à partir des photos des pages du guide imprimé livré dans le carton, que Lamine prendra à la livraison.
5. **Site public pour l'instant**, en HTTPS derrière le reverse proxy du serveur. Accès par VPN WireGuard plus tard.
6. **Dépôt public : aucune donnée personnelle.** Pas de poids, pas de cotes d'étude posturale, pas de nom de fitter, pas d'adresse, pas d'e-mail. Les commits utilisent l'adresse `183486+ltimsi@users.noreply.github.com`. Avant d'ajouter un lot, demander à Lamine ce qu'il accepte de rendre public.
7. **Serveur.** Avant de modifier quoi que ce soit sur le serveur, expliquer ce qui va changer et pourquoi, et attendre son accord.
8. **Style.** Français, tutoiement, phrases courtes. Jamais de tiret cadratin ni de demi-cadratin. Chaque abréviation est développée à sa première apparition dans un chapitre. Un conseil sans source va dans un encadré « Proposition ».

## État au 20 octobre 2026

| Lot | Contenu | Pièces 3D | État |
|---|---|---|---|
| 0 | Le vélo en 3D sur la page d'accueil, ses zones d'atelier et la liste « Ce qui est approché » | `src/scene/pieces/` : cadre, roues, freins, transmission, poste de pilotage | en relecture par Lamine |
| 1 | Freins, découpés en huit ateliers | `rotor` (disque Center Lock + bague + TL-FC36), `caliper` (étrier flat mount + plaquettes L04C + curseur d'usure), `bleed` (kit de purge animé) | en relecture par Lamine |
| 2 | Avant de commencer, montage à la livraison | `torque`, `cockpit`, `axle`, `pedal` | brouillon hors dépôt |
| 3 | Tubeless et crevaisons | `rim`, `plug` | brouillon hors dépôt |
| 4 | Transmission | `chain`, `cassette`, `derailleur`, `crank` | brouillon hors dépôt |
| 5 | Entretien, accessoires, dépannage | `rack` | brouillon hors dépôt |
| 6 | Aide-mémoire des couples, sources | | brouillon hors dépôt |

Les brouillons des lots 2 à 6 ont été écrits puis relus par des agents, mais ils datent d'avant la règle des sources stricte. Ils contiennent encore des liens de revendeurs et de magazines, des valeurs du guide Canyon lues sur une copie non officielle, et des données personnelles. Les modèles 3D `cockpit`, `axle`, `pedal`, `torque`, `plug` et `crank` ont été écrits par des agents interrompus avant la fin : ils sont à tester et à finir.

## Le dépôt

```
build/lots.json          lots, statut, fragments et pièces 3D de chaque lot
build/assemble.py        assemble le site (Python 3 seul) : dist/site et dist/artifact
src/parts/               00-head (styles), 05-top (haut de page et scène), chapitres, 99-foot
src/scene/               le vélo en 3D de la page d'accueil, en modules ES
  app.js                 la page : onglets, pastilles, puces, fiche, variantes, repli 2D, ancres d'atelier
  scene.js               creerScene : rendu, caméra, zones, variantes, pastilles, approximations, triangles
  geometrie.js           GEO (cotes de la taille M, publiées ou approchées) et points du vélo
  sources.js             registre des documents officiels cités par la 3D
  materiaux.js           matières des rendus réaliste et simple, textures calculées
  studio.js              éclairage du studio et ombre au sol
  outils3d.js            outils de construction des pièces
  schema2d.js            le schéma 2D, sans three.js
  zones.json             les zones d'atelier : nom, ancre, vue de la caméra, cadre du schéma, variante
  pieces/*.js            cadre, roues, freins, transmission, poste : META et construire()
src/js/viewer.js         visionneuse des pièces 3D des chapitres (API : AtelierModels.register)
src/js/models/m-*.js     une pièce 3D de chapitre par fichier, lots publiés seulement
vendor/three/            three.js 0.160.0 (MIT) : module, modules d'exemple utilisés, licence
tests/test_assemble.py   tests de l'assemblage et des ateliers (unittest)
tests/js/*.test.mjs      tests des modules de src/scene (node --test)
deploy/                  Dockerfile, nginx.conf, DEPLOIEMENT.md
docker-compose.yml       écoute sur 127.0.0.1:8088 (BIND_IP et PORT dans .env)
tools/shoot.js           captures Playwright des planches et des pièces 3D des chapitres
tools/scene-check.js     contrôle de la page d'accueil : captures, erreurs, débordement, triangles, ancre
tools/approximations-md.mjs  liste « Ce qui est approché » de docs/lots.md, générée depuis les META et GEO
docs/                    règle des sources, suivi des lots, notes de recherche brutes
```

- `python3 build/assemble.py` publie seulement les lots dont le statut est « en relecture » ou « validé ». Il échoue s'il trouve un tiret cadratin ou un id en double. Les liens internes vers un chapitre non publié deviennent du texte simple.
- three.js 0.160.0 se charge en modules ES par une carte d'imports. `dist/site/` sert au serveur : document complet, three.js servi en local depuis `vendor/three/`. `dist/artifact/` sert à l'aperçu dans Claude : page sans squelette, three.js depuis jsDelivr (`https://cdn.jsdelivr.net/npm/three@0.160.0/`).
- Tests, depuis la racine du dépôt :

  ```sh
  python3 -m unittest discover -s tests -p 'test_*.py'
  node --test 'tests/js/**/*.test.mjs'
  ```

  Garde les guillemets du motif. Sous Node 24, `node --test tests/js/` échoue : le dossier seul n'est plus parcouru.
- Contrôle visuel : `cd tools && npm ci` (Playwright 1.56.0, figé par `package-lock.json`), puis `npx playwright install chromium` la première fois. Chromium sans écran rend le WebGL avec `--use-gl=angle --use-angle=swiftshader` : les options sont déjà dans les scripts. Les captures vont dans `tools/shots*/`, ignoré par Git. Regarde chaque capture.
  - Pièces 3D des chapitres : `node shoot.js ../dist/site/index.html shots 420 light` (et `dark`).
  - Page d'accueil : `node scene-check.js ../dist/site/index.html shots-accueil 420 900 light`. Le script sert la page lui-même sur 127.0.0.1, enregistre `scene-reel.png`, `scene-2d.png`, une capture par atelier ouvert et `rapport.json`. Il sort en erreur s'il voit une erreur, un défilement horizontal, plus de 500 000 triangles, ou si `#freins-plaquettes` ne s'ouvre pas dans la fiche. Passe-le à 420 en `light` et `dark`, à 360, en paysage 844 x 390, et à 420 avec `--disable-webgl` : le schéma 2D doit prendre le relais.

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
5. Passer le lot à « en relecture » dans `build/lots.json`, assembler, lancer les tests, contrôler les captures en clair et en sombre à 420 px de large avec `shoot.js` et `scene-check.js`.
6. Publier l'aperçu pour Lamine et recueillir ses remarques.
7. Après sa validation : statut « validé », commit, étiquette `lot-N`, push.
8. Mettre à jour `docs/lots.md`.

## Points ouverts par lot

- **Lot 0** : les points « à vérifier à la livraison » et les contradictions relevées dans les documents sont listés dans [lots.md](lots.md) et dans [recherche/composants-origine.md](recherche/composants-origine.md).
- **Lot 1** :
  - modèle exact de l'étrier (BR-RX410, BR-RX820 ou BR-RX400), à lire sur la pièce ;
  - référence de la version à denture extérieure du RT-MT800 (fiche Shimano en maintenance pendant la rédaction) ;
  - couple du purgeur d'étrier GRX, non publié par Shimano ;
  - couple de l'axe avant, à prendre dans le guide du carton.
- **Lot 2** :
  - tous les couples du guide Canyon, sur photos ;
  - longueur réelle des manivelles (165 mm sur la fiche suisse, 170 mm et plus ailleurs) ;
  - type d'axe arrière ;
  - plage de la clé dynamométrique Canyon ;
  - outil à faible plage pour les couples de 0,2 à 2 Nm.
- **Lot 3** :
  - longueur de valve pour une jante de 26 mm ;
  - pression maximale du flanc du pneu ;
  - calculs de charge et de pression fondés sur le poids de Lamine, à valider avec lui avant toute publication.
- **Lot 4** :
  - +4 ou +5 maillons pour le RD-RX822 (figure page 14 du DM-GARD010-02) ;
  - patte UDH ou classique ;
  - boîtier PF86 ;
  - référence de la manette droite.
- **Lot 5** : couples Ortlieb, publiés seulement dans les figures de la notice ; compatibilité du garde-boue DEFEND avec le Quick-Rack.
- **Lot 6** : l'aide-mémoire ne reprend que les valeurs des lots validés.

## Déploiement

La procédure complète est dans [../deploy/DEPLOIEMENT.md](../deploy/DEPLOIEMENT.md). Restent à connaître : le reverse proxy utilisé sur le serveur (Caddy, Traefik, Nginx Proxy Manager…) et le sous-domaine voulu. L'image Docker n'a pas encore été construite : la session précédente n'avait pas de démon Docker. Le premier `docker compose up -d --build` sur le serveur servira de test.

## Liens

### Projet

- Dépôt : https://github.com/ltimsi/atelier-grizl
- Liens privés (aperçu du site, fichiers de transfert, liste d'achat) : dans le message de passation que Lamine colle dans la nouvelle session. Ils ne sont pas écrits ici parce que ce dépôt est public.

### Vélo (Canyon, officiel)

- Fiche suisse du Grizl CF 7 : https://www.canyon.com/de-ch/gravel-bikes/adventure/grizl/cf/grizl-cf-7/4553.html
- Page support Grizl CF (vidéos officielles : montage, chargement, porte-bagages, garde-boue, ruban, rodage) : https://www.canyon.com/en-us/customer-service/gravel/grizl/grizl-cf/

### Freins (lot 1)

- Shimano DM-GADBR01-10, freins et manettes GRX, en français : https://si.shimano.com/fr/pdfs/dm/GADBR01/DM-GADBR01-10-FRE.pdf
- Le même en anglais : https://si.shimano.com/en/pdfs/dm/GADBR01/DM-GADBR01-10-ENG.pdf
- Shimano DM-TORQUE-03, couples de serrage : https://si.shimano.com/en/pdfs/dm/TORQUE/DM-TORQUE-03-ENG.pdf
- Shimano DM-HB0002-14, moyeux et disques Center Lock : https://si.shimano.com/en/pdfs/dm/HB0002/DM-HB0002-14-ENG.pdf
- Shimano DM-RAWH010-02, roues : https://si.shimano.com/en/pdfs/dm/RAWH010/DM-RAWH010-02-ENG.pdf
- Vue éclatée BR-RX400 : https://si.shimano.com/en/pdfs/ev/BR-RX400-4574/EV-BR-RX400-4574C.pdf
- Compatibilité des plaquettes (C-192) : https://productinfo.shimano.com/en/compatibility/C-192
- Compatibilité des disques (C-461) : https://productinfo.shimano.com/en/compatibility/C-461
- Types de bague Center Lock (C-612) : https://productinfo.shimano.com/en/compatibility/C-612
- Gammes GRX RX610 et RX820 : https://productinfo.shimano.com/en/lineup/rx610-2x12 et https://productinfo.shimano.com/en/lineup/rx820-2x12-di2
- Fiche des plaquettes L04C-MF (site en maintenance en octobre 2026) : https://bike.shimano.com/en-NA/products/service-and-upgrade-parts/pdp.P-BP-L04C-MF.html
- DT Swiss, manuel des roues : https://d2a13k6araex7u.cloudfront.net/pmt/00/00/00/00/00/00/00/10/00/00/00/85/8/MAN_WXWXXXXXX1610S_WEB_ZZ_001.pdf?v=57647
- Park Tool, gestes :
  - disques : https://www.parktool.com/en-us/blog/repair-help/disc-brake-rotor-removal-installation
  - plaquettes : https://www.parktool.com/en-int/blog/repair-help/disc-brake-pad-removal-installation
  - centrage de l'étrier : https://www.parktool.com/en-int/blog/repair-help/hydraulic-disc-brake-alignment
  - redresser un disque : https://www.parktool.com/en-int/blog/repair-help/disc-brake-rotor-truing
  - purge Shimano : https://www.parktool.com/en-us/blog/repair-help/brake-bleeding-for-shimano-drop-bar-hydraulic-brakes-using-the-bkm-1

### Lots suivants

Les liens des lots 2 à 6 se trouvent dans les notes de recherche (`docs/recherche/*.md`). Ces notes mélangent sources officielles et sources exclues : chaque lien doit être vérifié contre la règle des sources avant d'être cité.

Documents officiels principaux :

- Transmission :
  - dérailleur RD-RX822, DM-GARD010-02 : https://si.shimano.com/en/pdfs/dm/GARD010/DM-GARD010-02-ENG.pdf
  - chaîne, DM-MACN001-08 : https://si.shimano.com/en/pdfs/dm/MACN001/DM-MACN001-08-ENG.pdf
  - cassette, DM-MACS001-05 : https://si.shimano.com/en/pdfs/dm/MACS001/DM-MACS001-05-ENG.pdf
  - pédalier, DM-GAFC001-06 : https://si.shimano.com/en/pdfs/dm/GAFC001/DM-GAFC001-06-ENG.pdf
  - compatibilités C-454 : https://productinfo.shimano.com/en/compatibility/C-454
- Pédales, DM-MAPD001-07 : https://si.shimano.com/en/pdfs/dm/MAPD001/DM-MAPD001-07-ENG.pdf
- Tubeless :
  - ruban et valve DT Swiss : https://d2a13k6araex7u.cloudfront.net/pmt/00/00/00/00/00/00/00/10/00/00/05/96/9/MAN_TDXXXXXX05969S_WEB_ZZ_001.pdf?v=331
  - Continental : https://www.continental-tires.com/tire-knowledge/tubeless-ready/
- Ortlieb Quick-Rack L : https://downloads.ortlieb.com/datasheet/en/quick_rack_l.pdf et https://downloads.ortlieb.com/instructions/quick_rack.pdf
