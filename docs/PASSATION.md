# Passation du projet Atelier Grizl

Ce document permet à une nouvelle session de reprendre le projet sans rien perdre. Lis-le en entier avant toute action.

## Le projet en bref

Atelier Grizl est un guide d'atelier personnel, en français, pour monter, régler et réparer un Canyon Grizl CF 7 (taille M, version suisse). C'est un site statique pensé pour le téléphone : procédures pas à pas, couples de serrage, planches techniques en SVG et pièces en 3D (three.js r128) que l'on fait tourner du doigt. Il est servi par nginx dans Docker sur le serveur Hetzner de Lamine.

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
| 1 | Freins | `rotor` (disque Center Lock + bague + TL-FC36), `caliper` (étrier flat mount + plaquettes L04C + curseur d'usure), `bleed` (kit de purge animé) | en relecture par Lamine |
| 2 | Avant de commencer, montage à la livraison | `torque`, `cockpit`, `axle`, `pedal` | brouillon hors dépôt |
| 3 | Tubeless et crevaisons | `rim`, `plug` | brouillon hors dépôt |
| 4 | Transmission | `chain`, `cassette`, `derailleur`, `crank` | brouillon hors dépôt |
| 5 | Entretien, accessoires, dépannage | `rack` | brouillon hors dépôt |
| 6 | Aide-mémoire des couples, sources | | brouillon hors dépôt |

Les brouillons des lots 2 à 6 ont été écrits puis relus par des agents, mais ils datent d'avant la règle des sources stricte. Ils contiennent encore des liens de revendeurs et de magazines, des valeurs du guide Canyon lues sur une copie non officielle, et des données personnelles. Les modèles 3D `cockpit`, `axle`, `pedal`, `torque`, `plug` et `crank` ont été écrits par des agents interrompus avant la fin : ils sont à tester et à finir.

## Le dépôt

```
build/lots.json        lots, statut, fragments et pièces 3D de chaque lot
build/assemble.py      assemble le site (Python 3 seul) : dist/site et dist/artifact
src/parts/             00-head (styles), 05-top (haut de page), chapitres, 99-foot
src/js/viewer.js       visionneuse 3D commune (API : AtelierModels.register)
src/js/models/m-*.js   une pièce 3D par fichier, lots publiés seulement
vendor/three/          three.js r128 (MIT)
deploy/                Dockerfile, nginx.conf, DEPLOIEMENT.md
docker-compose.yml     écoute sur 127.0.0.1:8088 (BIND_IP et PORT dans .env)
tools/shoot.js         captures Playwright des planches et des pièces 3D
docs/                  règle des sources, suivi des lots, notes de recherche brutes
```

- `python3 build/assemble.py` publie seulement les lots dont le statut est « en relecture » ou « validé ». Il échoue s'il trouve un tiret cadratin ou un id en double. Les liens internes vers un chapitre non publié deviennent du texte simple.
- `dist/artifact/` sert à l'aperçu dans Claude (page sans squelette, three.js depuis cdnjs). `dist/site/` sert au serveur (document complet, three.js local).
- Contrôle visuel : `cd tools && npm install`, puis `node shoot.js ../dist/site/index.html captures 420 light` (et `dark`). Chromium sans écran rend le WebGL avec `--use-gl=angle --use-angle=swiftshader` : les options sont déjà dans le script. Regarde chaque capture.

## Écrire une pièce 3D

Lis `src/js/viewer.js`, puis un modèle terminé comme `m-caliper.js`. Un modèle s'enregistre avec `AtelierModels.register(nom, { camera, build(ctx) })`. `build` reçoit `ctx.THREE`, `ctx.H` (outils de géométrie), `ctx.M` (matériaux, couleurs déjà converties en linéaire) et `ctx.api`. Il renvoie `{ group, parts, pins, controls, onFrame }` :
- `parts` : les pièces qui bougent en vue éclatée ;
- `pins` : les pastilles numérotées et leur légende ;
- `controls` : des boutons ou des curseurs.

Unités en millimètres. Moins de 120 000 triangles. Les textes des pastilles suivent la règle des sources.

## Procédure pour chaque lot

1. Copier les fragments du lot depuis les brouillons vers `src/parts/` et ses modèles vers `src/js/models/`.
2. Appliquer la règle des sources ligne par ligne : supprimer tout ce qui vient d'une source exclue, remplacer par « non publié » quand il n'existe pas de valeur officielle.
3. Retirer les données personnelles, ou demander à Lamine s'il accepte de les publier.
4. Tester et finir les pièces 3D du lot.
5. Passer le lot à « en relecture » dans `build/lots.json`, assembler, contrôler les captures en clair et en sombre à 420 px de large.
6. Publier l'aperçu pour Lamine et recueillir ses remarques.
7. Après sa validation : statut « validé », commit, étiquette `lot-N`, push.
8. Mettre à jour `docs/lots.md`.

## Points ouverts par lot

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
