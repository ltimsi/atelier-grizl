# Atelier Grizl : lot 3, tubeless et crevaisons

Document de conception du 26 octobre 2026. Lamine a choisi ce lot (« ok lot 3 »). Il a laissé les choix de forme au rédacteur, et a répondu le même jour sur son matériel :
- valves pas encore choisies ;
- liquide Muc-Off ;
- pompe à réservoir Topeak JoeBlow Booster ;
- mèches Park Tool TPT-1.

Les choix marqués « choix du rédacteur » peuvent être changés par Lamine à la relecture.

Ce document suit les conceptions des lots précédents (20, 21, 23 et 24 octobre) et leurs règles :
- la règle des sources, avec la décision du 25/10/2026 sur le guide Canyon ;
- rien d'inventé, et les formes approchées signalées ;
- aucune donnée personnelle dans le dépôt public ;
- rien sur le serveur sans l'accord de Lamine ;
- les règles de style.

## Pourquoi

Le plan « Le jour de la livraison » de l'accueil prévoit de passer en tubeless avant de rouler. Le brouillon du 20 octobre a été écrit pour le CF 7, qui avait des jantes aluminium à crochets et des pneus Continental. Le CF 8 Di2 a des jantes carbone sans crochet (GR 30 CF, TSS 622x27) et des Schwalbe G-One RX 45-622 TLR. Plusieurs consignes du brouillon sont donc fausses, et certaines dangereuses : la principale est de gonfler « jusqu'au maximum du flanc » pour talonner. Le brouillon calculait aussi des pressions à partir du poids de Lamine, une donnée personnelle.

## Source de vérité

Toutes les valeurs, gestes et références du lot viennent de [`docs/recherche/tubeless-cf8-di2.md`](../../recherche/tubeless-cf8-di2.md), relevé du 26/10/2026, et des documents qu'il cite :
- le manuel Canyon des roues 01_11.06.2025 ;
- les pages Canyon du vélo, de la paire GR 30 CF et du ruban ;
- les vidéos du Service Hub Canyon ;
- les FAQ et tableaux Schwalbe ;
- le guide Topeak du JoeBlow Booster ;
- Park Tool pour ses outils ;
- la notice du liquide Muc-Off.

Ses contradictions et sa liste « À lire sur la pièce à la livraison » sont reprises telles quelles. Les écarts listés dans sa section « Écarts avec les brouillons du 20/10 » sont tous corrigés. Le brouillon `brouillons/parts/30-tubeless.html` sert de matière de départ seulement, ne va jamais dans le dépôt et n'est jamais poussé.

## La règle de sécurité du lot

Sur ces jantes sans crochet, la pression ne dépasse jamais 3,0 bar, à aucun moment : ni pour talonner, ni pour rouler. C'est la plus basse des sources : le manuel Canyon des roues (« 3.0 » bar pour 45 à 54 mm, « always never exceed ») et le tableau sans crochet de Schwalbe. Quand une autre source dit de gonfler davantage pour talonner (Schwalbe « slightly over-inflate », Park Tool), le site le signale comme une contradiction et applique 3,0 bar.

Choix du rédacteur : si le pneu ne talonne pas sous 3,0 bar, le site ne propose aucune pression plus haute. Il renvoie aux causes listées par les sources (ruban, savon, valve, pneu bien centré) et, en dernier recours, au service Canyon.

## Ce que fait le lot

### La catégorie « Pneus et tubeless », chapitre 3

Elle remplace la page « à venir » `tubeless/`, au format des ateliers des lots 1 et 2.

| N° | Atelier | Type | Contenu, d'après le relevé |
|---|---|---|---|
| 3.1 | Ce que tu as | comprendre | Roues GR 30 CF sans crochet, pneus G-One RX TLR, ruban, valves (contradiction du carton), limite de 3,0 bar, ce qu'il faut lire sur la pièce à la livraison, le matériel de Lamine |
| 3.2 | Passer en tubeless | remplacer (de « chambres à air si le vélo en est livré, à lire » à « tubeless, valves et liquide Muc-Off ») | Les étapes de la section 5 du relevé, dans l'ordre : roue (renvoi à 1.5), dépose, ruban, valve, pneu, talonnage au JoeBlow Booster sans jamais dépasser 3,0 bar, liquide Muc-Off, répartition, fuites, pression, contrôle les jours suivants |
| 3.3 | Le liquide | entretenir | Contrôle et renouvellement selon Muc-Off, avec les écarts de quantité et d'intervalle entre Muc-Off, Schwalbe et Canyon |
| 3.4 | La pression | régler | La méthode et les tableaux officiels, les limites (3,0 bar au plus, minimum du flanc à lire) ; aucune valeur calculée pour Lamine, qui note sa pression ailleurs que sur le site |
| 3.5 | Crevaison en route | entretenir | Mèche Park Tool TPT-1, chambre de secours sur un montage tubeless (taille et longueur de valve d'après le relevé), CO2 (contradiction Schwalbe contre Canyon : le site applique la consigne la plus prudente et dit pourquoi), kit de route en « Proposition » quand aucune source ne le fixe |
| 3.6 | Problèmes fréquents | comprendre | Pneu qui ne talonne pas, fuites à la valve ou au ruban, fuites lentes, déjantage léger, d'après la section 9 du relevé |

Chaque atelier a ses vidéos officielles (section 10 du relevé) ou un `p.a-video`.

**Choix du rédacteur.**
- Pas d'atelier « Vidéos et notices » séparé : les vidéos vont dans les ateliers, comme au lot 2.
- Les valves ne sont nommées par aucune marque tant que Lamine n'a pas choisi : le site donne les critères officiels (Presta tubeless, longueur adaptée à 30 mm de haut, d'après le relevé).

### Une zone sur le vélo de l'accueil

Une zone « Pneus et valves » (id `pneus`), avec :
- sa pastille, la n° 9 ;
- son ancre sur une valve ou le pneu ;
- sa vue de caméra ;
- son cadrage 2D ;
- sa carte dans « Où intervenir ».

Ses maillages sont les pneus et les valves, dans `roues.js`. La règle de scene-check reste : 30 px au moins entre deux pastilles, à toutes les largeurs, en 3D et en 2D, et aucune sous l'aide. Si la place manque, le champ `decalage` de `zones.json` est permis, comme pour la pastille 6.

Tous les ateliers 3.1 à 3.6 vont dans cette zone. Le format des ateliers sans zone n'est pas nécessaire ici.

### Deux pièces 3D pour les ateliers

Elles sont reprises des brouillons `brouillons/js/m-rim.js` et `m-plug.js`, refaites pour le CF 8 Di2. Chaque pièce déclare ses formes approchées dans son en-tête, et ses libellés reprennent les valeurs exactes de l'atelier. Leur test vérifie le texte entier de chaque libellé, comme au lot 2.

| Pièce | Atelier | Ce qu'elle montre |
|---|---|---|
| `rim` | 3.2 | Coupe d'une portion de roue GR 30 CF : jante sans crochet (profil approché, cotes publiées seulement), ruban, pneu G-One RX 45, liquide, valve Presta tubeless. La limite de 3,0 bar figure sur une pastille. |
| `plug` | 3.5 | Réparation à la mèche avec l'outil Park Tool TPT-1, d'après son mode d'emploi |

### Accueil, lots, références, documentation

- **Accueil** : dans le plan « Le jour de la livraison », « Passer en tubeless » renvoie à `#tubeless`. Le libellé « Chapitre 3 » devient un lien.
- **`build/lots.json`** : le lot 3 passe « en relecture », avec la partie `30-tubeless` et les modèles `rim` et `plug`.
- **Registre** : les documents cités par une pièce ou un modèle entrent dans `src/scene/sources.js`.
- **Documentation** :
  - `docs/lots.md` : l'entrée du lot 3 ;
  - PASSATION : ce qu'il faut lire à la livraison ;
  - le LISEZMOI de la recherche ;
  - le README.

## Contraintes

- **La note publique du CF 7** (`docs/recherche/tubeless.md`) reste un historique daté, marqué comme ne valant pas pour le CF 8.
- **Aucune donnée personnelle** :
  - ni poids, ni pression calculée pour Lamine ;
  - ni numéro de commande, ni prix, ni magasin.

  Les jetons personnels restent dans `brouillons/jetons-personnels.txt`, ignoré par Git, et le test du chapitre les lit.
- **Aucune valeur Park Tool**, sauf pour ses propres outils.
- **Les contrôles d'avant mise en ligne passent tous** :
  - les tests ;
  - le build ;
  - scene-check sur les huit réglages ;
  - la relecture par tâche ;
  - la relecture finale.
- **La mise en ligne** se fait avec l'accord de Lamine, par son script.

## Non-objectifs

- Une pression calculée pour Lamine.
- Une marque de valves.
- La transmission (lot 4) et les accessoires Tailfin (lot 5).

## Laissé au constructeur

- La place exacte de l'ancre `pneus`.
- La découpe des étapes, à partir du relevé.
- Les planches 2D éventuelles.
