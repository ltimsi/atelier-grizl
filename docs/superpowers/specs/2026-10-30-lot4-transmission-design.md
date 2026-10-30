# Atelier Grizl : lot 4, transmission Di2

Document de conception du 30 octobre 2026. Lamine a choisi ce lot (« go lot 4 ») et a laissé les choix de forme au rédacteur. Il a répondu le même jour sur ses outils :
- sa liste d'outils de chaîne du 20/10 est toujours bonne : Park Tool CC-3.2, MLP-1.2, CT-3.3 et CM-5.3, dégraissant Muc-Off, lubrifiant Motorex Chainlube Wet ;
- pour l'attache rapide, il suit sa pince Park Tool MLP-1.2 ;
- il prévoit l'outil Shimano TL-LR021 pour la cassette.

Les choix marqués « choix du rédacteur » peuvent être changés par Lamine à la relecture.

Les règles des lots précédents restent valables :
- la règle des sources, avec la décision du 25/10/2026 ;
- rien d'inventé, et les formes approchées signalées ;
- aucune donnée personnelle ;
- rien sur le serveur sans son accord ;
- les règles de style.

## Pourquoi

Le brouillon du 20 octobre décrivait la transmission mécanique du CF 7 : câble, molette, butées réglées au câble, cassette CS-M7100, pédalier FC-RX610. Le CF 8 Di2 a une transmission sans fil :
- un dérailleur RD-M8250-GS avec sa batterie BT-DN320 ;
- des manettes ST-RX825 ;
- une cassette CS-M8200-12 9-45 à contre-écrou intégré sur le 9 dents ;
- une chaîne CN-M8100 à attache SM-CN910-12 ;
- un pédalier FC-RX820-1 de 40 dents ;
- un boîtier SM-BB72-41B ;
- une patte UDH.

Le relevé corrige plusieurs consignes du brouillon : couple de fixation, longueur de chaîne, outil de cassette, couples du plateau.

## Source de vérité

[`docs/recherche/transmission-cf8-di2.md`](../../recherche/transmission-cf8-di2.md), relevé du 30/10/2026, et les documents qu'il cite. Les principaux sont :
- Shimano DM-MARD011-07 ;
- UM-3K70A ;
- DM-MACN001-08 ;
- DM-MACS010-02 et la vue éclatée CS-M8200-12 ;
- DM-GAFC001-06 ;
- UM-0RM0B ;
- DM-GADBR10-04 ;
- UM-7J4MA (E-TUBE PROJECT Cyclist) ;
- C-473 ;
- la FAQ Di2 de Shimano ;
- le manuel SRAM UDH ;
- le guide Canyon QSG V02 ;
- les fiches de Motorex, Muc-Off et Park Tool pour les outils de Lamine.

Ses contradictions, sa liste « À lire sur la pièce » et sa liste « Outils de Lamine et ce qui manque » sont reprises telles quelles. Tous les écarts avec le brouillon sont corrigés. Le brouillon `brouillons/parts/40-transmission.html` ne va jamais dans le dépôt.

## Ce que fait le lot

### La catégorie « Transmission », chapitre 4

| N° | Atelier | Type | Zone | Contenu, d'après le relevé |
|---|---|---|---|---|
| 4.1 | Ta transmission Di2 | comprendre | derailleur | Les pièces, les boutons des ST-RX825, l'appairage, la batterie (renvoi à 1.7), ce qu'il faut lire sur les pièces, E-TUBE PROJECT Cyclist (type de cassette GS, mode E-BIKE à couper) |
| 4.2 | Nettoyer et lubrifier la chaîne | entretenir | chaine | Shimano d'abord, puis le CM-5.3, le dégraissant Muc-Off et le Motorex Chainlube Wet, d'après leurs notices ; les écarts entre Shimano et Canyon sur les dégraissants |
| 4.3 | Mesurer l'usure de la chaîne | entretenir | chaine | Le critère Shimano (sa jauge) et la CC-3.2 de Park (0,5 %), donnés comme une contradiction ; la conduite à tenir |
| 4.4 | Remplacer la chaîne | remplacer (de « CN-M8100 usée » à « CN-M8100 neuve et attache SM-CN910-12 neuve ») | chaine | Méthode de longueur du DM-MARD011 (+5 ou +6 maillons), contradiction avec l'article Shimano (+4 ou +5), nombre de maillons du vélo livré à compter et à noter ; CT-3.3, attache neuve à chaque changement ; pose et dépose à la MLP-1.2 d'après Park, en disant que Shimano demande la TL-CN10 |
| 4.5 | Démonter et remonter la cassette | entretenir | chaine | TL-LR021 sur le contre-écrou du 9 dents, fouet SR-12.2, repères 9, 11 et 13, couple de 30 à 50 Nm chez Shimano contre 40 chez Canyon, gants et lunettes |
| 4.6 | Régler le dérailleur Di2 | régler | derailleur | Fixation à 10-12 Nm, vis B sur le 45 dents, butées, mode réglage sur le 24 dents, voyant jaune, boutons X et Y, réglages d'E-TUBE PROJECT |
| 4.7 | La patte UDH | comprendre | derailleur | Ce qu'il faut contrôler, la contradiction Canyon 2021 contre SRAM UDH (graisse, couple, pas à gauche), l'alignement en atelier |
| 4.8 | Pédalier et boîtier | comprendre | pedalier | Les contrôles, les couples publiés (vis de manivelle, vis de plateau 12-16 Nm), le boîtier PF en atelier |
| 4.9 | Dépannage Di2 | comprendre | derailleur | Voyants, pas de passage de vitesse, niveau de batterie, nouvel appairage, piles CR1632 (renvoi à 1.7), mise à jour par E-TUBE PROJECT |

**Choix du rédacteur.**
- Le « kit montée » du brouillon (passage à 10-51) disparaît : il valait pour le CF 7.
- Le boîtier, l'alignement de la patte et la mise à jour par câble restent des travaux d'atelier : le site le dit, sans pas à pas.
- Les vidéos sont données atelier par atelier, quand le relevé en a d'officielles. Sinon, l'atelier a un `p.a-video`.

### Une zone de plus : « Chaîne et cassette »

Une zone 10, `chaine`, « Chaîne et cassette », avec :
- son ancre sur le brin inférieur de la chaîne ou sur la cassette ;
- sa vue ;
- son cadrage 2D ;
- sa carte.

Ses maillages sont la chaîne et la cassette, dans `transmission.js` ; le plateau reste au pédalier. La règle de scene-check reste la même : 30 px entre deux pastilles en 3D et en 2D, aucune sous l'aide ni sous un bouton, dans les vues d'ensemble et dans les vues de zone. Le champ `decalage` est permis.

Choix du rédacteur : si aucune place ne tient la règle à 360 px, les ateliers 4.2 à 4.5 passent dans la zone `derailleur`, et la zone 10 n'est pas créée. Le rapport le dit.

### Pièces 3D

Elles sont reprises des brouillons `brouillons/js/m-chain.js`, `m-cassette.js` et `m-derailleur.js`, et refaites pour le CF 8 Di2. Leurs en-têtes déclarent les formes approchées. Leurs libellés reprennent les valeurs exactes du chapitre, et leurs tests vérifient le texte entier de chaque libellé.

| Pièce | Atelier | Ce qu'elle montre |
|---|---|---|
| `chain` | 4.3 et 4.4 | Tronçon de CN-M8100 avec l'attache SM-CN910-12 et la jauge CC-3.2 |
| `cassette` | 4.5 | Cassette CS-M8200-12 9-45, contre-écrou intégré au 9 dents, TL-LR021, fouet, repères |
| `derailleur` | 4.6 | RD-M8250-GS avec sa batterie BT-DN320, axe B, vis B, butées, galets de 13 dents ; le mode réglage et son voyant |

Le pédalier n'a pas de pièce 3D d'atelier : 4.8 est une fiche « comprendre ».

### Accueil, lots, références, documentation

- **`build/lots.json`** : le lot 4 passe « en relecture », avec la partie `40-transmission` et les modèles `chain`, `cassette` et `derailleur`.
- **Accueil** : si le plan « Le jour de la livraison » n'a pas de ligne pour la transmission, il n'en reçoit pas. Le Di2 du jour J est déjà en 1.7.
- **Registre** : les documents cités par une pièce ou un modèle entrent dans `src/scene/sources.js`.
- **Documentation** :
  - `docs/lots.md` : l'entrée du lot 4 ;
  - PASSATION : ce qu'il faut lire à la livraison, et les outils à prévoir (TL-LR021, attaches SM-CN910-12 de rechange, embouts, gants et lunettes) ;
  - le LISEZMOI ;
  - le README.

## Contraintes

- **Aucune donnée personnelle**, et aucun magasin.
- **Park Tool** pour ses propres outils et pour les gestes.
- **Les contrôles d'avant mise en ligne passent tous**, scene-check sous `caffeinate -i`.
- **La mise en ligne** se fait avec l'accord de Lamine, par son script.

## Non-objectifs

- Le remplacement du boîtier, l'alignement de la patte et la mise à jour par câble.
- Un pédalier en 3D.
- Les accessoires Tailfin (lot 5).
