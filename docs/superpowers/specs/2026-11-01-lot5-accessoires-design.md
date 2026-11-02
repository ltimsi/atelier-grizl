# Atelier Grizl : lot 5, accessoires des trajets (Tailfin)

Document de conception du 1er novembre 2026. Lamine a choisi ce lot (« go lot 5 ») et a pris trois décisions le même jour :
- le lot ne couvre que son matériel Tailfin ; les accessoires prévus pour le CF 7 sont abandonnés ;
- l'entretien courant et le dépannage général passent au lot 6 ;
- son feu arrière sera un Garmin Varia RearVue 820.

Il a aussi transmis la réponse écrite du service client Tailfin. Le relevé en garde les phrases techniques.

Les règles des lots précédents restent valables :
- la règle des sources ;
- rien d'inventé ;
- aucune donnée personnelle (ni poids, ni lieu, ni prix, ni modèle d'ordinateur) ;
- rien sur le serveur sans son accord ;
- le style.

## Source de vérité

La source est [`docs/recherche/accessoires-cf8-di2.md`](../../recherche/accessoires-cf8-di2.md), le relevé du 1/11/2026, et les documents qu'il cite :
- les notices Tailfin : Journey Rack V6, Universal Thru Axle KIT V2, UDH V2, CargoPack, sacoches 22L, étui et bandoulière ;
- le vérificateur de compatibilité Tailfin ;
- la FAQ et le guide Grizl de Tailfin ;
- la réponse écrite du service client Tailfin ;
- le manuel SRAM UDH ;
- le manuel Garmin du RearVue 820 ;
- les documents Canyon.

Ses contradictions (dont celles ajoutées le 1/11) et sa liste « À vérifier au montage » sont reprises telles quelles.

## La règle de prudence du lot

Canyon et Tailfin se contredisent sur deux points :
- **l'axe arrière** : Canyon demande les axes livrés, alors que Tailfin les remplace par le sien ;
- **le porte-bagages** : le manuel Canyon de 2021 l'interdit, alors que la fiche du Grizl annonce des œillets.

Canyon ne publie rien non plus sur l'espace entre le dérailleur Di2 et la patte droite Tailfin.

Choix du rédacteur, pris à défaut de réponse de Lamine : le lot est publié avec un avertissement en tête de chaque atelier de montage, « à confirmer avec Canyon avant de rouler chargé ». Les contradictions y sont dites, ainsi que les valeurs retenues. Un message prêt à coller pour le chat Canyon est donné à Lamine, hors du site.

Les charges sont données comme des limites, la plus basse s'appliquant :
- 120 kg pour l'ensemble, d'après Canyon ;
- celles du Journey Rack, de l'axe, du CargoPack et des sacoches, d'après Tailfin.

Aucun calcul ne se fait avec le poids de Lamine.

## Ce que fait le lot

### La catégorie « Accessoires des trajets », chapitre 5

| N° | Atelier | Type | Contenu, d'après le relevé |
|---|---|---|---|
| 5.1 | Ton matériel Tailfin | comprendre | Les pièces, la compatibilité (vérificateur Tailfin, réponse du service client), les limites de charge, les contradictions avec Canyon, ce qu'il faut vérifier au montage, les couples qu'aucun de ses outils ne couvre (1, 1,5, 2, 3 et 8 Nm) |
| 5.2 | Remplacer l'axe arrière et poser l'adaptateur UDH | remplacer (de « axe arrière DT Swiss livré » à « Universal Thru Axle et adaptateur UDH Tailfin ») | Notices UTA KIT V2 et UDH V2 ; 25 Nm, filetage à gauche ; graisse (contradiction Tailfin contre SRAM) ; dépose et pose de la roue avec cet axe ; renvois depuis 1.5 et 3.5 |
| 5.3 | Monter le Journey Rack | remplacer (de « aucun porte-bagages » à « Journey Rack aluminium ») | Notice Journey Rack V6, couples par vis, fixation sur la tige de selle (le plus bas possible, avant la séparation des lames, d'après le service client), entretoises, contrôles |
| 5.4 | Le garde-boue du Journey Rack | remplacer (de « aucun garde-boue » à « garde-boue du Journey Rack ») | Notice et couple de 3 Nm, passage de 55 mm au plus |
| 5.5 | Sacoches, CargoPack, étuis et bandoulière | régler | Poser et retirer, charges par sac, étanchéité telle que Tailfin l'écrit, ordinateur dans l'étui (sans modèle) |
| 5.6 | Le feu arrière Garmin RearVue 820 | remplacer (de « aucun feu arrière » à « support Tailfin et RearVue 820 ») | Support Tailfin (5 Nm), fixation quart de tour, charge et appairage d'après le manuel Garmin, position d'après le service Tailfin |
| 5.7 | Rouler chargé | comprendre | Contrôles avant chaque sortie chargée, dépose du porte-bagages, entretien d'après les fabricants, roue arrière avec l'axe Tailfin |

**Choix du rédacteur.**
- Le dessin 3D d'atelier `rack` est refait pour le Journey Rack. Il montre l'axe UTA, l'adaptateur UDH, les bras et la sangle de tige de selle. Toutes ses formes sont approchées et déclarées : Tailfin ne publie pas de cotes.
- 1.5 (roues et axes) et 3.5 (crevaison) reçoivent une phrase de renvoi vers 5.2, sans autre changement.

### Zone sur le vélo de l'accueil

Le vélo de l'accueil est livré sans porte-bagages : la 3D n'en dessine pas. Choix du rédacteur :
- une zone 11, `portebagages`, « Porte-bagages Tailfin », ancrée sur l'axe arrière côté droit ou sur la tige de selle, avec les règles de scene-check habituelles ;
- à défaut de place à 360 px, 5.2 à 5.7 passent dans la zone `axes` (axe arrière), sans zone 11, et le rapport le dit ;
- 5.1 reste en zone `axes` ou `portebagages`.

### Lots, références, documentation

- **`build/lots.json`** : le lot 5 devient « Accessoires des trajets », « en relecture », avec la partie `60-accessoires` et le modèle `rack`. Les parties `50-entretien` et `70-depannage` passent au lot 6.
- **Registre** : on n'y ajoute que les documents qu'une pièce ou un modèle cite.
- **Documentation** :
  - `docs/lots.md` ;
  - PASSATION : à vérifier au montage, outils manquants pour 1, 1,5, 2, 3 et 8 Nm ;
  - LISEZMOI ;
  - README.

## Non-objectifs

- L'entretien courant et le dépannage (lot 6).
- Les accessoires du CF 7.
- Un calcul de charge personnel.
