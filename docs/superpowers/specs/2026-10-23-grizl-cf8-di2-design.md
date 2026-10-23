# Atelier Grizl : passage au Grizl CF 8 Di2

Document de conception du 23 octobre 2026. Lamine a validé le plan en chat le même jour (« ok pour tout »).

Ce document complète les conceptions du [20 octobre](2026-10-20-velo-3d-ateliers-design.md) et du [21 octobre](2026-10-21-site-multipage-design.md). Leurs règles restent valables :

- la règle des sources : chaque chiffre, forme ou référence vient d'un document officiel du fabricant, sinon on écrit « non publié » ou « à lire sur la pièce » ;
- rien d'inventé, et les formes approchées sont signalées ;
- aucune donnée personnelle dans le dépôt public ;
- rien sur le serveur sans l'accord de Lamine ;
- les règles de style.

## Pourquoi

Le 23 octobre 2026, Lamine a acheté un autre vélo : le **Canyon Grizl CF 8 Di2**, modèle 2027, réf. 4556, en taille M et en coloris Floating Violet (code Canyon R126_P06). Le site décrivait un Grizl CF 7 qu'il n'aura pas.

## Ce que Lamine a décidé

1. **Le site passe entièrement sur le CF 8 Di2.** Le CF 7 disparaît du site : la 3D, les composants, les textes et les ateliers ne parlent plus que du CF 8 Di2.
2. **Les plaquettes.** Lamine garde les plaquettes L05A-RF d'origine (résine) et en a commandé une paire. Le passage aux plaquettes métalliques L04C-MF est abandonné. L'atelier « Changer les plaquettes » devient un vrai pas à pas pour quelqu'un qui ne l'a jamais fait.
3. **La tige de selle** est la Canyon SP100 VCLS 2.1 CF 27.2 (réf. 10016374), confirmée par Lamine d'après le chat Canyon.
4. **Il valide le plan proposé**, y compris l'atelier 2.2 transformé en « Déposer et reposer un disque ».

## Ce qui reste du site actuel

- **Le cadre, la fourche, la peinture et la géométrie.** Le cadre Canyon Grizl CF et la fourche FK0143 sont les mêmes. Les cotes de la taille M sont identiques : tube de selle 522, tube supérieur 581, douille 158, angles 71° et 73,5°, bases 440, empattement 1 076, stack 596, reach 404, hauteur 826, drop 75. Le coloris a le même code.
- **Le poste de pilotage.** Potence ST0046 de 60, cintre HB0067 de 440 et ruban Ergospeed Gel sont inchangés.
- **La structure du site en plusieurs pages**, avec son menu, ses pages, ses contrôles et sa mise en ligne.

## Ce qui change

Les valeurs ci-dessous viennent de la fiche Canyon suisse du 23 octobre 2026. Elles seront complétées par la recherche des documents officiels, enregistrée dans `docs/recherche/`.

- **Transmission Shimano Di2.**
  - Dérailleur Deore XT Di2 RD-M8250-GS, chape moyenne.
  - Manettes GRX ST-RX825, l'une Di2 Dual Control, l'autre GRX ST-RX825.
  - Batterie BT-DN320 et chargeur EC-DN100.
  - Cassette Deore XT CS-M8200-12 en 9-45, d'après la page anglaise.
  - Pédalier Shimano RX820, 1 plateau de 40, manivelles de 165 en M.
  - Boîtier Pressfit BB72 en PF 86,5.
  - Chaîne Shimano XT.
- **Freins.**
  - Disques Deore XT MT800 de 160 devant et derrière, montés d'origine.
  - Étriers non nommés par Canyon : leur référence est à lire sur la pièce.
  - Plaquettes d'origine L05A-RF, d'après Lamine et la liste de pièces Canyon : à confirmer sur la pièce.
- **Roues et pneus.**
  - Roues Canyon GR 30 CF en carbone, hookless, prêtes pour le tubeless : jante de 30 mm de haut et 27 mm de large à l'intérieur, moyeux DT Swiss 350 Spline d'après la page des roues.
  - Pneus Schwalbe G-One RX Performance de 45 mm.
- **Selle et tige.** Selle Fizik Argo Terra X5 de 150 mm, tige SP100 VCLS 2.1 en carbone à deux lames.
- **Position des mains.** Le stack efficace est de 690 et le reach efficace de 531, au lieu de 683 et 544.

## Ce qu'il faut faire

1. **Composants d'origine.**
   - Remplacer `docs/recherche/composants-origine.md` par le relevé du CF 8 Di2, avec ses contradictions et ce qui reste à lire sur le vélo : étriers, patte de dérailleur, valves.
   - Refaire la page Composants du site à partir de ce relevé.
2. **La 3D.**
   - Garder le cadre, la fourche, la peinture et la géométrie.
   - Refaire, d'après les documents et la photo officielle du CF 8 Di2 :
     - les manettes ST-RX825 ;
     - le dérailleur RD-M8250 et son câble Di2 ;
     - la cassette 9-45, le pédalier RX820 et la chaîne ;
     - les roues GR 30 CF et le nombre de rayons ;
     - les pneus G-One RX ;
     - la selle Fizik et la tige VCLS.
   - Placer les mains aux valeurs du CF 8.
   - Mettre à jour le registre des sources et la liste « Ce qui est approché ».
   - Retirer la variante « disques d'origine ou XT ». La variante des plaquettes, en place ou sorties, reste.
3. **Le chapitre Freins.**
   - **2.1** : décrire les étriers et les manettes du CF 8 Di2.
   - **2.2** devient « Déposer et reposer un disque ». Ce n'est plus un remplacement : les disques XT sont d'origine. On garde les étapes et les sources qui restent vraies pour cette pièce.
   - **2.3** « Changer les plaquettes » passe aux L05A-RF, comme un pas à pas complet pour un débutant.
   - **Purge et couples** : les vérifier pour les manettes ST-RX825.
   - Une procédure ne change que si la source officielle de cette pièce le dit. Sinon, le texte reste celui du chapitre.
4. **La page d'accueil et les lots.**
   - Les pièces à monter deviennent les pédales PD-ME700 et le tubeless, avec des valves non fournies d'après le chat Canyon.
   - Les ateliers Di2 à venir rejoignent le lot Transmission : charger la batterie, régler le dérailleur Di2.
5. **Les contrôles.** Les tests, scene-check et la relecture indépendante tournent avant toute mise en ligne. La mise en ligne se fait avec l'accord de Lamine.

## Contraintes

- **Données personnelles.** Le prix payé, les numéros de commande, la hauteur de selle conseillée d'après l'entrejambe et les commandes chez les revendeurs ne vont jamais dans le dépôt.
- **Les écarts entre la fiche Canyon et le résumé de Lamine** sont tranchés par la source officielle, ou signalés comme « à lire sur la pièce ».
- **La cible** reste le site en plusieurs pages (branche `cf8-di2`, partie de `site-multipage`).

## Non-objectifs

- Écrire maintenant les ateliers Di2 : ils viennent avec le lot 4.
- Garder une trace du CF 7 sur le site.
