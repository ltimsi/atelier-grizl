# Chapitre « Freins » : matière technique vérifiée, Canyon Grizl CF 7

**Trois points à corriger dans les hypothèses de départ :**
- **Leviers :** la fiche Canyon actuelle du Grizl CF 7 n'indique pas de levier BL-RX610. Elle liste deux leviers « Shimano GRX BL-RX820 » à 2 pistons, de 420 g et 500 g. Le seul composant RX610 de la fiche est le pédalier FC-RX610 en 1x 40 dents. L'étrier n'est pas indiqué. Sources : https://www.canyon.com/zh-hk/grizl-cf-7/50047695.html, https://www.canyon.com/en-fi/grizl-cf-7/50046045.html et https://www.canyon.com/en-cy/gravel-bikes/adventure/grizl/cf/grizl-cf-7/4167.html. Il faut lire le modèle gravé sur l'étrier à la livraison.
- **BR-RX610 n'existe pas.** Le DM-GADBR01-10 (DM : Dealer's Manual, manuel revendeur Shimano) ne liste que quatre étriers GRX : BR-RX820, BR-RX810, BR-RX410 et BR-RX400 (https://si.shimano.com/en/pdfs/dm/GADBR01/DM-GADBR01-10-ENG.pdf).
- **TL-BH62 ne sert pas à repousser les pistons.** C'est l'outil de coupe de durite et d'insertion du raccord (même DM). Shimano demande pour les pistons un « outil plat », sans le tourner ni utiliser d'outil pointu.

**Limites de la recherche :**
- Le site produit bike.shimano.com est en maintenance jusqu'au 21 octobre 12:00 JST (Japan Standard Time, heure du Japon). Les fiches produit L04C-MF et RT-MT800 n'ont donc pas pu être lues.
- Le quota de recherches web de la session est épuisé. Les points restés « non trouvé » pourront être relancés dans un message suivant.

---

## 1. Étrier, fixation, plaquettes, couples

**Étrier probable :**
- Avec des leviers RX820, Shimano associe l'étrier BR-RX820 (flat mount) : https://productinfo.shimano.com/en/lineup/rx820-2x12-di2
- Avec ST-RX610, Shimano associe le BR-RX410 : https://productinfo.shimano.com/en/lineup/rx610-2x12
- Des revendeurs vendent aussi le levier BL-RX610 avec un BR-RX410 (https://worldwidecyclery.com/products/shimano-grx-bl-rx610-brake-lever-with-br-rx410-hydraulic-disc-brake-caliper-left-front-flat-mount-caliper-black) ou avec un BR-RX400 (https://shop.tunecycles.com.au/shimano-grx-bl-rx610-br-rx400-rear-hydraulic-disc-brake-lever-set).
- L'étrier réellement monté par Canyon : **non trouvé**.

**Fixation :**
- Flat mount, à l'avant comme à l'arrière, en version 140/160 ou 160/180. Diamètres de disque : 140 (SS), 160 (S), 180 (M). Source : DM-GADBR01-10, lien ci-dessus.
- Le vélo est livré en disques 160/160 (fiches Canyon citées plus haut).
- Version exacte du support (cadre et fourche), avec ou sans adaptateur : **non trouvé**.

**Plaquettes compatibles** (S = standard, O = option), selon le tableau Shimano C-192 (https://productinfo.shimano.com/en/compatibility/C-192) :

| Étrier | Plaquettes standard | L04C-MF |
|---|---|---|
| BR-RX820 | L03A-RF, L05A-RF, K03S-RX, K05S-RX | O (option) |
| BR-RX410 | L05A-RF, K05S-RX | O |
| BR-RX400 | L03A-RF, L05A-RF, K03S-RX, K05S-RX (K04S-MX en option) | O |

- La L04C-MF est donc compatible avec les trois étriers possibles.
- L'outil de lecture signale un texte de tableau mal aligné. À recouper sur le tableau original.
- Shimano intitule la pièce « BP-L04C-MF METAL WITH FIN » (titre de la page Shimano vu en résultat de recherche ; page elle-même inaccessible pour cause de maintenance) : https://bike.shimano.com/en-NA/products/service-and-upgrade-parts/pdp.P-BP-L04C-MF.html
- Plaquettes de la série L avec ailettes : elles portent des repères gauche (L) et droite (R), à orienter comme sur la figure du DM-GADBR01-10.

**Couples de serrage** (DM-GADBR01-10, confirmé par le DM-GADBR01-09 d'avril 2023 : https://si.shimano.com/en/pdfs/dm/GADBR01/DM-GADBR01-09-ENG.pdf) :

| Élément | Modèles | Couple |
|---|---|---|
| Vis de fixation de l'étrier (A, B/B2, C/C2) | tous | 6 à 8 N·m |
| Axe de plaquettes (« pad axle », bloqué par un clip de retenue) | BR-RX820 et BR-RX410 | 1 à 1,5 N·m |
| Axe de plaquettes | BR-RX810 et BR-RX400 | 0,2 à 0,4 N·m |
| Raccord de durite côté manette | tous | 5 à 6 N·m |
| Raccord de durite côté étrier | tous | 5 à 7 N·m |

- N·m signifie newton-mètre.
- Les couples de l'axe figurent sur les figures, à côté de l'axe et du clip, sans libellé explicite dans le texte.
- Park Tool donne aussi environ 6 à 8 N·m pour les vis d'étrier : https://www.parktool.com/en-int/blog/repair-help/hydraulic-disc-brake-alignment

## 2. Disques Center Lock

**Couple de la bague : 40 N·m.**
- RT-MT800 : 40 N·m, outils « TL-FC36 / TL-LR15 + clé à molette ». Source DM-TORQUE-03 d'octobre 2023 : https://si.shimano.com/en/pdfs/dm/TORQUE/DM-TORQUE-03-ENG.pdf
- 40 N·m aussi dans https://si.shimano.com/en/pdfs/dm/HB0002/DM-HB0002-14-ENG.pdf : TL-FC36 pour E-THRU (l'axe traversant Shimano), TL-LR15 pour blocage rapide.
- 40 N·m (350 in·lbs) dans https://si.shimano.com/en/pdfs/si/0095A/SI-0095A.pdf
- Pour les moyeux DT Swiss, le manuel DT renvoie aux instructions du fabricant du disque. Il donne 40 Nm pour l'adaptateur Center Lock : https://images.bike24.com/i/mb/a7/1d/0b/dt-swiss-hubs-001-1030599.pdf

**Outils :**
- TL-LR15 pour la bague à denture intérieure, TL-FC36 pour la bague à denture extérieure (DM-TORQUE-03).
- Usage du TL-FC32 sur une bague de disque : **non trouvé**. Shimano ne le cite que pour les cuvettes de boîtier de pédalier.
- Équivalents Park Tool : FR-5.2 pour les cannelures intérieures ; BBT-9, BBT-69.4 ou BBT-169 pour les encoches extérieures. Source : https://www.parktool.com/en-us/blog/repair-help/disc-brake-rotor-removal-installation
- **Le TL-FC36 a-t-il un carré de 3/8" ? Non trouvé.**

**Sens de montage et propreté** (Park Tool, même page) :
- La flèche du disque doit suivre le sens de rotation de la roue. Sans flèche, le côté marqué se place vers l'extérieur.
- Pas de graisse.
- Nettoyer les deux faces du disque à l'alcool isopropylique, puis vérifier le centrage de l'étrier.
- Alignement des cannelures (cannelure de repère, par exemple) : **non trouvé**.

**Bague intérieure ou extérieure sur moyeu 12 mm :**
- Les roues Shimano en 12 mm E-THRU utilisent la bague à cannelures intérieures, serrée au TL-LR15 avec une clé de 24 mm ou une clé à molette : https://si.shimano.com/en/pdfs/dm/RAWH010/DM-RAWH010-02-ENG.pdf
- Un revendeur indique que la bague à denture intérieure convient au blocage rapide 9/10 mm et à l'axe traversant 12 mm. Pour le 15 et le 20 mm, il faut la bague extérieure : https://www.bike-components.de/en/Shimano/RT-MT800-Center-Lock-Brake-Rotor-for-XT-Ultegra-Internal-Teeth-p71448
- Park Tool prévient qu'une bague intérieure peut ne pas être accessible avec certains embouts de moyeu. Il faut alors une bague à encoches extérieures.
- Shimano distingue trois types de bague : intérieure, intérieure et extérieure, extérieure. Une bague « intérieure et extérieure » sur moyeu E-THRU se serre au TL-FC36 : https://productinfo.shimano.com/en/compatibility/C-612
- **Conclusion :** en 12 mm, les deux types se montent. La bague intérieure ne convient que si l'outil passe par-dessus l'embout DT Swiss.
- Confirmation propre à DT Swiss, et modèle du moyeu Gravel LN : **non trouvés**.

**Versions du RT-MT800 160 mm** (sources revendeurs, pas Shimano) :
- RT-MT800-SI, bague intérieure, code I-RTMT800SI (bike-components, lien ci-dessus).
- RT-MT800-SE, bague extérieure, code IRTMT800SE : https://www.wheelandsprocket.com/product/shimano-deore-xt-rt-mt800-disc-brake-rotor-374623-1.htm
- Liste complète SSI/SSE, SI/SE, MI/ME, LI/LE : https://www.allterraincycles.co.uk/products/shimano-xtr-rt-mt800-centre-lock-disc-rotor-with-internal-lockring-160mm
- Le RT-MT800 160 mm est compatible avec les BR-RX820, RX810, RX410 et RX400 : https://productinfo.shimano.com/en/compatibility/C-461

## 3. Caractéristiques

**Épaisseurs :**
- Disque neuf (RT-MT800 et RT64) : **non trouvé**.
- Limite d'usure du disque, selon Shimano : ne plus l'utiliser à 1,5 mm ou moins, ni si l'aluminium devient visible (DM-GADBR01-10).
- Version française : « N'utilisez pas le disque si son épaisseur est inférieure à 1,5 mm » : https://si.shimano.com/fr/pdfs/dm/GADBR01/DM-GADBR01-10-FRE.pdf

**Plaquettes métalliques :**
- RT-MT800 et SM-RT64 ne figurent pas dans la liste « Resin pad only » de C-461. Les plaquettes métalliques y sont donc admises (déduction tirée du tableau).
- Des revendeurs l'indiquent aussi pour le RT-MT800 : « Metal and resin » (https://www.lordgun.com/shimano-deore-xt-rt-mt800-s-disc-rotor-1).

**Poids :**
- RT-MT800 160 mm : 108 g selon allterraincycles (chiffre de pré-série), 109 g selon https://www.performancebike.com/shimano-xt-rtmt800-disc-brake-rotor-centerlock-140mm-external-spline-type-irtmt800sse/p1010849
- SM-RT64 160 mm : 140 g selon la fiche Canyon.
- Poids officiels Shimano : **non trouvé**.

**Plaquettes L04C :**
- Remplacer quand la partie la plus usée atteint 0,5 mm, si elles sont souillées d'huile, ou si le ressort touche le disque (DM-GADBR01-10).
- Park Tool donne une règle générale d'au moins 1 mm de garniture, à mesurer au pied à coulisse : https://www.parktool.com/en-int/blog/repair-help/disc-brake-pad-removal-installation
- Épaisseur neuve de la L04C : **non trouvé**.

## 4. Procédures officielles

**Remplacement des plaquettes** (DM-GADBR01-10, pages 47 à 49) :
1. Déposer la roue, puis le clip de retenue, l'axe et les plaquettes.
2. Nettoyer les pistons. Les repousser à fond, bien droit, avec un outil plat. **Monter l'entonnoir sur la manette avant de les repousser**, sinon la membrane de la manette peut être endommagée.
3. Placer le ressort sur les plaquettes neuves (repères L et R).
4. Monter les plaquettes, l'axe au couple du modèle, le clip, puis la cale de plaquettes rouge.
5. Actionner le levier jusqu'à ce qu'il soit ferme.
6. Retirer la cale et remonter la roue. En cas de frottement, contrôler d'abord le montage de la roue, puis l'étrier.
- Couleur des cales : la cale de plaquettes est rouge au remplacement et orange au premier montage. La cale de purge est jaune.
- Park Tool : sur les étriers Shimano flat mount, appuyer de façon égale pour ne pas casser les pistons en céramique. Outils proposés : PP-1.2, démonte-pneu ou clé à cônes.

**Centrage de l'étrier :**
- Shimano : laisser l'étrier libre, serrer le levier, puis serrer les vis par paliers en alternant, à 6 à 8 N·m.
- Park Tool : même méthode. Si le disque frotte encore, desserrer une vis et pousser l'étrier vers le côté qui frotte.

**Rodage officiel Shimano :**
1. Sur une zone plane, sûre et dégagée, monter à une vitesse moyenne.
2. Freiner jusqu'à l'allure de la marche. Un seul levier à la fois, l'avant avec modération.
3. Répéter au moins 20 fois à l'avant et 20 fois à l'arrière.
- Source : DM-GADBR01-10, versions anglaise et française.
- Vitesse en km/h : **non trouvé**.

**Nettoyage :**
- Park Tool : alcool isopropylique et chiffon propre sur le disque.
- Shimano interdit les nettoyants pour freins et les produits anti-bruit du commerce, et demande de remplacer les plaquettes souillées d'huile.
- Shimano ne cite l'alcool isopropylique que pour les durites et les outils.

**Si ça frotte ou si ça grince** (Park Tool) :
- Vérifier l'assise de la roue, un disque voilé, un jeu du disque ou des roulements, et des pistons collants.
- Un grincement, un levier plus dur et une surface sombre qui laisse une trace au doigt signalent une contamination. Il faut en chercher l'origine.
- Entretien des pistons selon Shimano : nettoyer, repousser, et vérifier qu'ils sortent de façon égale. Ne jamais déposer les pistons (DM-GADBR01-10, page 71).

**Disque voilé** (https://www.parktool.com/en-int/blog/repair-help/disc-brake-rotor-truing) :
- Redresser avec l'outil DT-2.2.
- Sur un disque deux pièces, ne cintrer que la piste extérieure, jamais les bras.
- Remplacer le disque s'il n'y a pas de progrès en quelques minutes ou après un choc.

## 5. Purge

**Quand :** Shimano ne donne pas d'intervalle fixe. Il recommande de remplacer l'huile quand elle est visiblement décolorée (DM-GADBR01-10, versions anglaise et française).

**Kit :**
- Huile minérale Shimano d'origine uniquement.
- TL-BR001 (seringue et tuyau), TL-BR002 (entonnoir et bouchon d'entonnoir), cale de purge jaune.
- Clé plate de 7 mm pour le purgeur de l'étrier BR-RX400 (BR-RX810 également).
- Le TL-BT03S figure dans la liste d'outils, mais aucune étape ne l'emploie.

**Procédure Shimano** (DM-GADBR01-10, pages 50 à 66 ; la même pour ST/BL-RX610 et RX820) :
1. Déposer les plaquettes. Monter l'entonnoir, repousser les pistons, puis poser la cale jaune avec l'axe et le clip.
2. Rabattre le capuchon de cocotte vers l'avant. Placer le haut de la vis de purge parallèle au sol, puis retirer la vis et son joint torique.
3. Placer la surface de la cocotte parallèle au sol. Ne pas toucher au levier pendant le remplissage.
4. Brancher la seringue à l'étrier, selon le modèle :
   - BR-RX820 et RX410 (embase de purge) : desserrer la vis de purge d'un demi-tour.
   - BR-RX400 et RX810 (purgeur) : desserrer d'un huitième de tour.
5. Injecter jusqu'à ce qu'il ne sorte plus de bulles dans l'entonnoir. Incliner la cocotte à 45°, compléter, refermer provisoirement et retirer la seringue.
6. Brancher un sachet à l'étrier et laisser couler par gravité, en tapotant la durite, la cocotte et l'étrier.
7. Levier serré, ouvrir puis fermer rapidement (environ 0,5 s), 2 à 3 fois. Serrer et nettoyer.
8. Cocotte à plat puis à 45° : actionner lentement le levier jusqu'à disparition des bulles. Le levier doit être ferme ; sinon, reprendre à l'étape 6.
9. Boucher l'entonnoir et le retirer. Remonter la vis de purge, serrer jusqu'à débordement de l'huile, **à 0,5 à 0,7 N·m**, sans actionner le levier.
10. Retirer la cale jaune et remonter les plaquettes.
- Couple de la vis ou du purgeur de l'étrier GRX : **non trouvé**.
- À titre indicatif seulement, pour des étriers route, pas GRX (DM-TORQUE-03) : vis de purge 4 à 6 N·m (BR-R9270, R8170, R7170) et purgeur 4 à 7 N·m (BR-R9170, R8070, R7070).
- Variante Park Tool (kit BKM-1.2, entonnoirs M5 ou M7, angles par type de manette) : https://www.parktool.com/en-us/blog/repair-help/brake-bleeding-for-shimano-drop-bar-hydraulic-brakes-using-the-bkm-1

## 6. Sécurité

D'après le DM-GADBR01-10 :
- Garder les doigts loin du disque en rotation.
- Ne pas toucher l'étrier ni le disque après un freinage : ils sont brûlants.
- Aucune huile ni graisse sur les disques et les plaquettes. Remplacer les plaquettes souillées.
- Ne pas utiliser les freins en cas de fuite.
- Utiliser uniquement l'huile minérale Shimano, issue d'un flacon propre et fermé. Ne laisser entrer ni eau ni bulles d'air.
- Ne pas chauffer, souder ni mettre sous pression le flacon d'huile.
- Roue démontée : poser les cales et **ne pas actionner le levier**, sinon les pistons sortent anormalement.
- Prévoir une période de rodage, aussi après chaque changement de plaquettes ou de disque.
- Porter des lunettes de protection pendant la purge.
- Porter des gants avec le TL-FC36 : les bords du disque coupent (DM-HB0002-14).

D'après Park Tool :
- Ne jamais mélanger huile minérale et liquide DOT, ni les kits de purge de l'un et de l'autre.

## 7. Vidéos vérifiées (chaîne Park Tool, titres relevés sur YouTube)

| Sujet | Titre exact | Lien |
|---|---|---|
| Disque | « How to Replace a Bicycle Disc Brake Rotor » | https://www.youtube.com/watch?v=SE9DJKXmIy8 |
| Plaquettes (générique, pas propre à Shimano) | « How to Replace Bicycle Disc Brake Pads » | https://www.youtube.com/watch?v=Xqw0SaZl-jo |
| Centrage de l'étrier | « How to Align a Hydraulic Disc Brake on a Bike » | https://www.youtube.com/watch?v=uk_nC9anQcM |
| Frottements | « Pad/Rotor Rub - Additional Causes » (titre lu dans les métadonnées) | https://www.youtube.com/watch?v=OuWhc_9RciU |
| Pistons | « How To Clean Hydraulic Brake Pistons - Tech Tuesday #104 » | https://www.youtube.com/watch?v=vQXFFgRButo |
| Purge | « How to Bleed Hydraulic Brakes - Shimano® Drop Bar Levers » | https://www.youtube.com/watch?v=mAEeAKmCLFU |
| Disque voilé | « How to True a Bicycle Disc Brake Rotor » | https://www.youtube.com/watch?v=O0c2Ez2v0PU |

- Rodage : aucune vidéo Park Tool ou Shimano trouvée. Une alternative existe, mais elle n'est pas officielle : GMBN Tech, « The Best Way To Bed In Disc Brakes | Boost Your Performance For Free! », https://www.youtube.com/watch?v=kUBJvizA27Y

**Manuels Shimano utiles :**
- DM-GADBR01-10, étriers et manettes GRX dont BL-RX610 et RX820 :
  - anglais : https://si.shimano.com/en/pdfs/dm/GADBR01/DM-GADBR01-10-ENG.pdf
  - français : https://si.shimano.com/fr/pdfs/dm/GADBR01/DM-GADBR01-10-FRE.pdf
- Montage des disques :
  - roues : https://si.shimano.com/en/pdfs/dm/RAWH010/DM-RAWH010-02-ENG.pdf
  - moyeux : https://si.shimano.com/en/pdfs/dm/HB0002/DM-HB0002-14-ENG.pdf
- Couples : https://si.shimano.com/en/pdfs/dm/TORQUE/DM-TORQUE-03-ENG.pdf
- Vue éclatée du BR-RX400 : https://si.shimano.com/en/pdfs/ev/BR-RX400-4574/EV-BR-RX400-4574C.pdf
- Manuel dédié au RT-MT800 : **non trouvé**.

---

## Points « non trouvé »
1. Étrier réellement monté sur le Grizl CF 7, et version de support flat mount du cadre et de la fourche.
2. Couple du purgeur ou de la vis de purge de l'étrier GRX (BR-RX820, RX410, RX400).
3. Taille des clés Allen pour la vis de purge de la manette, les vis d'étrier et l'axe de plaquettes.
4. Carré d'entraînement de 3/8" sur le TL-FC36.
5. Usage du TL-FC32 sur une bague de disque.
6. Alignement des cannelures Center Lock (cannelure de repère).
7. Type de bague (intérieure ou extérieure) préconisé par DT Swiss pour ses moyeux de 12 mm, et modèle du moyeu Gravel LN.
8. Épaisseur neuve des disques RT-MT800 et RT64.
9. Poids officiels Shimano du RT-MT800 et du RT64.
10. Épaisseur neuve de la plaquette L04C-MF.
11. Vitesse chiffrée du rodage.
12. Usage de l'outil TL-BT03S.
13. Vidéo officielle Park Tool ou Shimano sur le rodage, et vidéos Shimano officielles.
14. Manuel revendeur ou vue éclatée dédiés au RT-MT800.
15. Fiches produit bike.shimano.com (site en maintenance).

