# Grizl CF 8 Di2 (4556, taille M, Floating Violet R126_P06) : recherche de sources officielles

Relevé du 23/10/2026. Toutes les citations sont recopiées telles quelles depuis la source indiquée, lue le 23/10/2026 sauf mention contraire. Les tirets longs des sources sont retirés : une citation qui en contenait est coupée en deux à cet endroit, ou sa valeur est redite en toutes lettres. Règle : document fabricant seulement ; sinon « non publié » ou « à lire sur la pièce ».

Base déjà vérifiée (non refaite) : le relevé de la fiche Canyon, versé dans `composants-origine.md` (liste Canyon, géométrie M, cassette 9-45, roues GR 30 CF).

Téléchargements faits pour lecture, gardés hors du dépôt : la vue éclatée EV-BR-RX820-5000C (Shimano), le guide de démarrage Grizl 2025-2 et le manuel des roues 2025 (Canyon). Les DM Shimano ont été lus dans leur version HTML sur si.shimano.com (le serveur refuse le téléchargement direct en ligne de commande).

## 1. Freins : manettes ST-RX825 et étrier

### 1.1 Le DM qui couvre ST-RX825 : DM-GADBR10, pas DM-GADBR01

- Recherche « ST-RX825 » sur le site des manuels Shimano (https://si.shimano.com/en/manual/search?input_model=ST-RX825), lue le 23/10/2026 : 5 résultats.
  - DM « Hydraulic Disc Brake/Dual Control Lever (Di2) (SHIMANO Hydraulic Mineral Oil) (GADBR10) », daté « 08/19/2026 ». Page : https://si.shimano.com/en/dm/GADBR10 ; PDF : https://si.shimano.com/en/pdfs/dm/GADBR10/DM-GADBR10-04-ENG.pdf (version affichée « DM-GADBR10-04 »).
  - DM « GRAVEL Di2 Series General Guide (GAGN001) », « 08/19/2026 » : https://si.shimano.com/en/dm/GAGN001 ; PDF https://si.shimano.com/en/pdfs/dm/GAGN001/DM-GAGN001-01-ENG.pdf
  - DM « Supported Models for Each Oil Type (BROIL) » : https://si.shimano.com/en/pdfs/dm/BROIL/DM-BROIL-03-ENG.pdf
  - UM « Dual Control Lever (Di2) for Hydraulic Disc Brake Type (SHIMANO Hydraulic Mineral Oil) (0RM0B) » : https://si.shimano.com/en/pdfs/um/0RM0B/UM-0RM0B-007-ENG.pdf
  - EV « ST-RX825-5053B » (vue éclatée) : https://si.shimano.com/en/pdfs/ev/ST-RX825-5053/EV-ST-RX825-5053B.pdf
- Panneau « Information > MODELS » du DM-GADBR10 (https://si.shimano.com/en/dm/GADBR10), lu le 23/10/2026 : « BL-RS717-L », « BL-RX825 », « ST-RX715 », « ST-RX825 », « BL-RS717-LS ». **Aucun étrier n'est dans la liste.**
- Panneau « Information > MODELS » du DM-GADBR01 (https://si.shimano.com/en/dm/GADBR01), lu le 23/10/2026 : « BL-RX600, BL-RX610, BL-RX810, BL-RX810-LE, BL-RX812, BL-RX820, BR-RX400, BR-RX410, BR-RX810, BR-RX820, BR-RX820-LE, ST-RX400, ST-RX600, ST-RX610, ST-RX810, ST-RX810-LA, ST-RX810-LE, ST-RX820, ST-RX820-LA ». **ST-RX825 n'y est pas ; BR-RX820 y est.**
- **Version du DM-GADBR01** : le site affiche « Hydraulic Disc Brake / Dual Control Lever (DM-GADBR01-11) », PDF https://si.shimano.com/en/pdfs/dm/GADBR01/DM-GADBR01-11-ENG.pdf. Le chapitre Freins cite la version 10 (`DM-GADBR01-10-FRE.pdf`) : version à mettre à jour (les numéros de page cités dans le chapitre peuvent avoir bougé).
- **Conclusion** : la manette ST-RX825 relève du **DM-GADBR10** ; l'étrier BR-RX820 reste couvert par le **DM-GADBR01**. Le DM-GADBR10 renvoie lui-même au DM-GADBR01 pour l'étrier : sur https://si.shimano.com/en/dm/GADBR10/install_brake_caliper : « Refer to the Gravel Hydraulic Disc Brake/Dual Control Lever Dealer's Manual to install the brake caliper. » Le lien de ce renvoi pointe vers `dm/GADBR01/...` (vérifié dans le code de https://si.shimano.com/en/dm/GADBR10/replace_brake_pads : `href="dm/GADBR01/replace_brake_pads"`).
- Le DM-GADBR10 sur ST-RX825 (https://si.shimano.com/en/dm/GADBR10/install_dual_control_lever) : « The ST-RX825 / ST-RX715 is for wireless gear shifting only. It does not support wired shifting. »
- Téléchargement direct des PDF par la ligne de commande refusé par le serveur Shimano (« Access Denied », 403) : textes lus dans la version HTML du manuel, section par section, dans le navigateur intégré.

### 1.2 Plaquettes : la procédure du DM-GADBR01 s'applique, par renvoi officiel

- https://si.shimano.com/en/dm/GADBR10/replace_brake_pads : « Refer to the Gravel Hydraulic Disc Brake/Dual Control Lever Dealer's Manual to replace the pads. » (lien vers DM-GADBR01).
- https://si.shimano.com/en/dm/GADBR10/adjust_pistons_when_not_operating : « Refer to the Gravel Hydraulic Disc Brake/Dual Control Lever Dealer's Manual to adjust the pistons. »
- DM-GADBR01-11, https://si.shimano.com/en/dm/GADBR01/replace_brake_pads : usure « When the thickness at the most worn-down part of the pad is 0.5 mm » ; axe : « 1 - 1.5 N·m ( BR-RX820 / BR-RX410 ) », « 0.2 - 0.4 N·m ( BR-RX810 / BR-RX400 ) » ; icône d'outil de l'axe BR-RX820/RX410 sur la figure : clé hexagonale **3** (mm) (lu sur la figure). Cale : « Install the pad spacer (red). » Pistons : « When pushing the pistons back, do so with the oil funnel attached to the dual control lever/brake lever. »
- Point Di2 : pour monter l'entonnoir avant de repousser les pistons, le DM-GADBR01 renvoie à sa section purge. Sur une ST-RX825, la pose de l'entonnoir est décrite dans la purge du DM-GADBR10 (§ 1.3, étapes 3 à 6), pas dans celle du DM-GADBR01. C'est une déduction de lecture des deux manuels, pas une phrase Shimano.

### 1.3 Purge : la procédure ST-RX825 (DM-GADBR10) diffère du DM-GADBR01

Source : https://si.shimano.com/en/dm/GADBR10/replace_genuine_mineral_oil (DM-GADBR10-04), lue le 23/10/2026. Étapes de « Adding SHIMANO hydraulic mineral oil and bleeding air », numérotées comme sur la page :

1. « Secure the bicycle so that it is parallel to the ground using a stand, etc. »
2. « Remove the pads from the calipers, and install the bleed spacer. » (renvoi au DM-GADBR01)
3. « Turn over the bracket cover from the back side. »
4. « Set the lever in a position where the top surface of the bleed screw is parallel with the ground. »
5. « Remove the bleed screw and O-ring. »
6. « Mount the oil funnel. »
7. « Add the oil through the bleed boss. » Sous-étapes : « Remove the bleed boss cap and bleed screw cap. » ; « Loosen the bleed screw by 1/2 of a turn. »
8. « Temporarily close the bleed screw. »
9. « Operate the lever about 10 times. »
10. « Set the lever in a position where the top surface of the oil funnel is 20° to the ground, as shown in the figure. »
11. « Operate the lever. » (« Slowly repeat until no more air bubbles appear. »)
12. « Add the oil through the bleed boss. » (vis de purge desserrée d'un demi-tour)
13. « Temporarily close the bleed screw. »
14. « Depress the brake lever a few times and make sure that the lever becomes stiff. » (« If the lever does not become stiff, repeat the procedures from step 12 . »)
15. « Set the lever in a position where the top surface of the oil funnel is parallel to the ground. »
16. « Remove the syringe. »
17. « Bleed the remaining air. » (sachet branché, vis desserrée, écoulement naturel)
18. « As the oil level drops in the oil funnel, add oil to maintain the oil level and prevent air from getting into the system. »
19. « Once no more air bubbles come out from the bleed boss, tighten the bleed screw. » Figure : clé hexagonale **3**, « 4 - 6 N·m », « Bleed screw » (vis de purge de l'étrier).
20. à 25. Tube retiré, « Install the bleed boss cap. », entonnoir bouché par la butée puis retiré, « Install a bleed screw with O-ring. » Figure : clé hexagonale **2.5**, « 0.5 - 0.7 N·m » (vis de purge de la manette). « Do not operate the lever until the bleed screw is installed. »

Version française du même DM (https://si.shimano.com/fr/dm/GADBR10/replace_genuine_mineral_oil ; PDF https://si.shimano.com/fr/pdfs/dm/GADBR10/DM-GADBR10-04-FRE.pdf), lue le 23/10/2026 : « Retournez le repose-main par l'arrière. » ; « Réglez la manette dans une position dans laquelle la surface supérieure de la vis de purge est parallèle au sol. » ; « Retirez le cache de raccord de purge et le cache de vis de purge. » ; « Desserrez la vis de purge d'1/2 tour. » ; « Actionnez la manette de frein environ 10 fois. » ; « Placez la manette dans une position permettant à la surface supérieure de l'entonnoir d'avoir un angle de 20 ° avec le sol, comme l'indique l'illustration. » ; « Une fois que les bulles d'air ne sortent plus du raccord de purge, serrez la vis de purge. » « 4-6 Nm » ; vis de purge de la manette « 0,5-0,7 Nm » ; « Installez le cache du raccord de purge. »

Différences avec la purge du DM-GADBR01-11 (https://si.shimano.com/en/dm/GADBR01/replace_genuine_mineral_oil), que le chapitre suit :
- **Couvre-cocotte** : DM-GADBR01 : « Turn over the bracket cover from the front side. » ; DM-GADBR10 (purge de la ST-RX825) : « Turn over the bracket cover from the back side. » Le chapitre dit « Retourne le repose-main par l'avant » (DM-GADBR01) : **à corriger pour la ST-RX825** (par l'arrière pour la purge). Pour la course libre et les piles, le DM-GADBR10 dit en revanche « from the front side ».
- **Angle** : DM-GADBR01 : « set the lever in the position where the bracket is at 45° » et « Set the lever in a position where the bracket surface indicated in the figure is parallel with the ground. » DM-GADBR10 : « top surface of the oil funnel is 20° to the ground ». Ce n'est pas la même référence (surface de la cocotte contre dessus de l'entonnoir) ni le même angle.
- **Pompage** : DM-GADBR10 ajoute « Operate the lever about 10 times. » après la première injection, puis un second remplissage à la seringue (étapes 12-13).
- **Étape « 0,5 seconde »** (ouvrir-fermer vite l'étrier, levier serré) : absente du texte du DM-GADBR10.
- **Bouchons** : DM-GADBR10 fait retirer « the bleed boss cap and bleed screw cap » sur l'étrier, et remettre « the bleed boss cap ».
- **Couple de la vis de purge de l'étrier** : DM-GADBR10 donne « 4 - 6 N·m » (clé de 3 mm sur la figure). Le DM-GADBR01-11 n'en donne pas (sa page purge ne contient qu'un seul couple : « 0.5 - 0.7 N·m », celui de la manette). **Le chapitre écrit « non publié » : c'est désormais publié, dans le DM-GADBR10.**
- **Vis de purge de la manette** : même couple dans les deux manuels, « 0.5 - 0.7 N·m » ; outil 2,5 mm lu sur la figure du DM-GADBR10.
- **Vidange** (« Draining SHIMANO hydraulic mineral oil », même page DM-GADBR10) : « Install a bag and tube on the bleed boss. » puis « Loosen the bleed screw. The oil will begin to drain. Operating the brake lever while the oil drains will allow the oil to drain more quickly. »
- Mise en garde propre au Di2 : « When adjusting the angle of the brake lever, be careful not to strain the brake hose or electric wire to avoid damage. »
- Intervalle : « It is recommended to change the oil when it becomes noticeably discolored. » (identique en esprit au DM-GADBR01).
- Outils listés (https://si.shimano.com/en/dm/GADBR10/LIST_OF_TOOLS_TO_BE_USED_RA) : « 2 mm hexagon wrench », « 2.5 mm hexagon wrench », « 3 mm hexagon wrench », « 5 mm hexagon wrench », « 8 mm spanner », « Slotted screwdriver 0.8 x 4 », « TL-BH62 », « TL-BR001 (syringe and tube) », « TL-BR002 (oil funnel and oil stopper) », « Micrometer ».

### 1.4 Réglages de la manette ST-RX825 (DM-GADBR10)

- Course libre, https://si.shimano.com/en/dm/GADBR10/adjust_free_stroke : « Turn over the bracket cover from the front side. » ; « Tightening the free stroke adjustment screw (clockwise) narrows the range of travel of the brake lever, while loosening the screw (counterclockwise) widens it. » ; figure « ST-RX825 / BL-RX825 » : clé hexagonale **2** (lue sur la figure). « Do not remove the washer from the free stroke adjustment screw. »
- Garde, https://si.shimano.com/en/dm/GADBR10/adjust_reach : « Tightening the reach adjustment screw (clockwise) widens the distance between the position of the brake lever and the handlebar, while loosening the screw (counterclockwise) narrows it. » ; figure : clé hexagonale **2**.
- Collier de manette, https://si.shimano.com/en/dm/GADBR10/install_dual_control_lever : « The mounting nut is found on top of the lever bracket when the bracket cover is turned over. » ; « Mounting nut 6 - 8 N·m ».
- Piles de la manette, https://si.shimano.com/en/dm/GADBR10/change_dual_control_lever_battery : « Use two CR1632 coin batteries for each of the left and right dual control levers. » ; « The coin batteries supplied with the dual control levers may be low, as they are intended only for test purposes. » ; niveau : « If you hold down two shift switches simultaneously for 0.5 seconds or longer, the LED changes » (« 11% - 100% Green », « 1% - 10% Red », « 0% Off ») ; accès : « Turn over the bracket cover from the front side. » ; couvercle : « Battery holder 0.16 - 0.24 N·m » (figure ST-RX825).
- Disque : https://si.shimano.com/en/dm/GADBR10/install_disc_brake_rotor_RA : « Refer to the Dealer's Manual for the Wheels to install and remove the rotor. »

### 1.5 L'étrier que Shimano associe à ST-RX825 : BR-RX820

- Lineup GRX RX820 « 1x12-speed, Di2 », https://productinfo.shimano.com/en/lineup/rx820-1x12-di2, lue le 23/10/2026 : « Shift/Hydraulic Disc Brake Lever ST-RX825-L DUAL CONTROL LEVER Wireless connection only », « BL-RX825-L Single lever », « ST-RX825-R », « Sub Brake Lever BL-RX812-L BL-RX812-R », « Hydraulic Disc Brake BR-RX820 Flat mount », « Brake Hose SM-BH90-JK-SSR High power brake hose », « Rotor RT-CL800 CENTER LOCK FREEZA180 mm/160 mm/140 mm ».
- Fiche ST-RX825-R, https://productinfo.shimano.com/en/product/ST-RX825-R : « Recommended brake caliper BR-RX820 » ; « Oil SHIMANO Mineral » ; « Reach adjust ✔ » ; « Clamp band (mm) 23.8-24.2 » ; « Funnel bleeding ✔ » ; « Free stroke adjust ✔ » ; « SERVO WAVE ✔ » ; « Battery CR1632 x 2 » ; « Average weight (g) 415 ( /pair) ». Fiche ST-RX825-L (https://productinfo.shimano.com/en/product/ST-RX825-L) : mêmes valeurs, « Recommended brake caliper BR-RX820 ».
- Fiche BR-RX820, https://productinfo.shimano.com/en/product/BR-RX820 : « Recommended brake lever ST-RX825, ST-RX820, ST-RX820-LA, BL-RX820-L » ; « Mount type Flat mount » ; « Piston 2 » ; « Piston material Resin » ; « ONE WAY BLEEDING ✔ » ; « Caliper fixing screw ... Tool size 4 mm » ; « Anti loosen method Screw fix pin+Snap ring » ; « Pad mount Pad axle » ; « Recommended disc brake rotor w/ metal and resin pad RT-CL800 » ; « Average weight (g) 139 (Front) 122 (Rear) ».
- **Statut** : BR-RX820 est l'étrier recommandé par Shimano pour ST-RX825 (fiches et lineup). Canyon ne nomme toujours pas l'étrier : le modèle monté reste **à lire sur l'étrier**.
- Manette gauche : la lineup 1x12 Di2 propose soit ST-RX825-L, soit « BL-RX825-L Single lever » (fiche https://productinfo.shimano.com/en/product/BL-RX825-L : « Average weight (g) 188 », « Recommended brake caliper BR-RX820 »). Canyon écrit « Shimano GRX ST-RX825 » pour la gauche : présence des boutons à vérifier à la livraison.

### 1.6 Couples freins (ST-RX825 + BR-RX820)

| Élément | Couple | Source |
|---|---|---|
| Axe de plaquettes BR-RX820 | « 1 - 1.5 N·m » (clé 3 mm sur la figure) | DM-GADBR01-11, https://si.shimano.com/en/dm/GADBR01/replace_brake_pads |
| Vis de fixation d'étrier A, B, B2, C, C2 | « 6 - 8 N·m » | DM-GADBR01-11, https://si.shimano.com/en/dm/GADBR01/install_brake_caliper ; outil « 4 mm » d'après la fiche https://productinfo.shimano.com/en/product/BR-RX820 |
| Vis de purge de la manette ST-RX825 | « 0.5 - 0.7 N·m » (clé 2,5 mm sur la figure) | DM-GADBR10-04, https://si.shimano.com/en/dm/GADBR10/replace_genuine_mineral_oil |
| Vis de purge de l'étrier | « 4 - 6 N·m » (clé 3 mm sur la figure) | DM-GADBR10-04, même page, étape 19 |
| Raccord de durite côté manette (écrou à collerette) | « 5 - 6 N·m » (clé plate 8 mm sur la figure, repère (2)) | DM-GADBR10-04, https://si.shimano.com/en/dm/GADBR10/install_brake_hose_RA |
| Raccord de durite côté étrier | « 5 - 7 N·m » (clé plate 8 mm, repère (3)) | même page |
| Écrou du collier de manette | « 6 - 8 N·m » | DM-GADBR10-04, https://si.shimano.com/en/dm/GADBR10/install_dual_control_lever |
| Couvercle des piles CR1632 | « 0.16 - 0.24 N·m » | DM-GADBR10-04, https://si.shimano.com/en/dm/GADBR10/change_dual_control_lever_battery |

Durite : https://si.shimano.com/en/dm/GADBR10/install_brake_hose_RA : « Use the dedicated connector insert supplied with SM-BH90-JK-SS. » ; « Model number: SM-BH90-JK-SSR », « Length: 11.2 mm », « Color: Silver » ; « Use a flare nut with flange on the dual control lever/brake lever side. »

## 2. Plaquettes et disques

### 2.1 Plaquettes de BR-RX820 (C-192 et fiche produit)

- C-192, https://productinfo.shimano.com/en/compatibility/C-192, lu le 23/10/2026, ligne « BR-RX820 » (« Hydraulic ») :
  - tableau L-type/J-type : « BP-L03A-RF » Standard, « BP-L05A-RF » Standard, « BP-L04C-MF » Option (J03A, J05A, J04C : un simple trait dans la case) ;
  - tableau K-type : « BP-K03S-RX » Standard, « BP-K05S-RX » Standard (K03Ti, K05Ti, K04S-MX, K04Ti-MX : un simple trait dans la case).
  - Même chose pour « BR-RX820-LE ».
  - Matières : L03A-RF, L05A-RF, K03S-RX, K05S-RX = « Resin » ; L04C-MF = « Metal ».
- Fiche BR-RX820, https://productinfo.shimano.com/en/product/BR-RX820 : « Pad Standard 1 K05S-RX Resin (w/o fin) », « Standard 2 L05A-RF Resin (w/ fin) », « Option 1 L04C-MF Metal (w/ fin) ». (La fiche ne cite pas les « 03 » que C-192 classe aussi en Standard.)
- Vue éclatée EV-BR-RX820-5000C (https://si.shimano.com/en/pdfs/ev/BR-RX820-5000/EV-BR-RX820-5000C.pdf, « Mar.-2025-5000C ») : « L05A-RF Resin pad with fin and spring (pair) » (Y2EM98010 / EBPL05ARFA), « L04C Metal pad with fin and spring (pair) » (Y8N398040 / IBPL04CMFA), « K05S-RX Resin pad and spring (pair) » (Y2GM98030 / EBPK05SRXA).
- Conclusion : L05A-RF = plaquette d'origine possible (Standard) ; L04C-MF = option métal officielle sur BR-RX820. Les plaquettes réellement montées : **à lire sur la pièce** (Canyon ne les nomme pas).

### 2.2 Disque « Deore XT MT800 » 160 mm

- Fiche Shimano, https://bike.shimano.com/products/components/pdp.P-RT-MT800.html (redirection depuis https://bike.shimano.com/en-EU/product/component/abs2/RT-MT800.html), lue le 23/10/2026 : titre « DISC BRAKE ROTOR ICE TECHNOLOGIES FREEZA », « RT-MT800 » ; texte : « SHIMANO's DEORE XT RT-RT800 compact and lightweight disc brake rotors » (coquille Shimano « RT-RT800 ») ; « CENTER LOCK ✔ », « ICE TECHNOLOGIES FREEZA ✔ », « Outside diameter (mm) 203 ✔ 180 ✔ 160 ✔ 140 ✔ », « Alloy lock ring X », « Pad lining shape compatibility Narrow ✔ », « Average weight 88 (140 mm), 108 (160 mm), 132 (180 mm), 164 (203 mm) » ; technologie : « 3-layer stainless steel-aluminum-stainless steel sandwich structure ».
- **Poids** : Shimano « 108 (160 mm) » ; Canyon « 116 g ». Écart de 8 g, origine non dite (bague comprise ou non) : à peser si besoin.
- **Métal autorisé ?** C-461, https://productinfo.shimano.com/en/compatibility/C-461, tableau « Standard thickness rotor », ligne des étriers route/gravel « ... BR-RX820 BR-RX820-LE BR-RX810 BR-RX410 BR-RX400 », « Brake pad material Metal / Resin », « Pad type Narrow », colonne 160 mm : « RT-CL900 RT-CL800 RT-CL700 RT-MT900 RT-MT800 ... ». RT-MT800 ne porte pas le renvoi « *2 Resin pad only ». Note de la page : « SM-RT56 / SM-RT54 / SM-RT30 / SM-RT26 / SM-RT10 / RT-EM300 / RT-CL300 are compatible with Resin pad caliper specification only. » RT-MT800 n'y figure pas → plaquettes métalliques admises (même raisonnement que le chapitre, revérifié le 23/10/2026).
- **Référence complète et bagues** : C-612 (https://productinfo.shimano.com/en/compatibility/C-612) ne donne **pas** de références RT-MT800 ; il classe les bagues (« Internal spline », « both Internal & external spline », « External spline ») selon les **moyeux Shimano** (« QR type », « 12 mm E-THRU type », « 15 mm E-THRU type », « 20 mm thru axle type » ; « * For E-THRU hub, "Internal & external spline" type lock ring can not be install by TL-LR11. Please Tighten with TL-FC36. »). Les roues du CF 8 ont des moyeux DT Swiss 350 : C-612 ne s'applique pas tel quel.
  - Vue éclatée EV-BR-RX820-5000C : RT-MT800 dessiné avec deux bagues : « 26 Y8K198010 Lock ring and washer » (outil « 27 Y12009230 TL-LR15 Lock ring removal tool ») et « 28 Y2A598030 Lock ring and washer (external spline type) » (outil « 29 Y13098000 TL-FC36 Lock ring removal tool ») ; couple sur la figure : « 40 N·m » pour les deux. Légende des outils : « 3 mm hexagon wrench », « 4 mm hexagon wrench », « 8 mm spanner ».
  - Référence commerciale du disque selon la bague (code article « RT-MT800-S » ou autre) : **non publiée** dans les documents Shimano consultés. Bague livrée avec les disques du vélo : **à lire sur la pièce**.
- **Statut officiel de RT-MT800 (revérifié le 23/10/2026)** :
  - C-461 : dans le code de la page, chaque « RT-MT800 » est un `<span class="discon">` sans lien, alors que « RT-CL800 » et « SM-RT64 » sont des `<span class="model-no">` dans un lien vers leur fiche. La feuille de style donne à `.discon` une couleur propre (`rgb(159 93 27)`) ; la page n'a **aucune légende** qui définisse « discon ».
  - https://productinfo.shimano.com/en/product/RT-MT800 : « No results ».
  - Mais la fiche https://bike.shimano.com/products/components/pdp.P-RT-MT800.html est en ligne, et RT-MT800 **n'apparaît pas** dans la liste officielle des produits abandonnés https://bike.shimano.com/products/discontinued.html (seuls « RT-EM800 » et « RT-EM900 » y figurent parmi les RT-, et « SC-MT800 » pour MT800).
  - Lineup 1x12 Di2 et fiche BR-RX820 : le disque recommandé est « RT-CL800 » (« Recommended disc brake rotor w/ metal and resin pad RT-CL800 »), pas RT-MT800. La vue éclatée de BR-RX820 dessine pourtant un RT-MT800.
  - **Contradiction non tranchée** : statut « abandonné » possible (C-461, productinfo) contre fiche active et absence de la liste des abandons (bike.shimano.com).

## 3. Transmission

Remarque générale : la lineup Shimano GRX « 1x12-speed, Di2 » (https://productinfo.shimano.com/en/lineup/rx820-1x12-di2) associe à ST-RX825 le dérailleur « RD-RX827-SGS » et la cassette « CS-M8200-12 10-51T » ; Canyon monte un dérailleur VTT XT « RD-M8250-GS » et une CS-M8200-12 en 9-45. C'est un montage Canyon hors lineup GRX, pas une erreur à corriger.

### 3.1 Dérailleur RD-M8250-GS

- Fiche, https://productinfo.shimano.com/en/product/RD-M8250-GS, lue le 23/10/2026 : « Series DEORE XT » ; « Rear speeds 12 » ; « Compatible chain HG 12-speed » ; « SHADOW ES ✔ » ; « Applicable derailleur hanger SHIMANO MTB type Direct attachment (conventional) ✔ Direct mount - ... UDH standard ✔ » ; « Max. front difference 0T » ; « Total capacity 36T » ; « Low sprocket Max. 45T Min. 45T » ; « Top sprocket Max. 9T Min. 9T » ; « Pulley Guide pulley bearing Sealed bearing Tension pulley bearing Sealed bearing Teeth 13T » ; « Plate body Material GFRP » ; « Outer plate Material Aluminum » ; « Di2 connectivity wired Di2 shifting - » ; « Di2 connectivity wireless Di2 shifting ✔ » ; « SD300 port (pcs) 0 » ; « Power supply Built-in battery ✔ Wired - Charging port - Charging cable - » ; « Average weight (g) 446 ».
- **Chape** : la fiche Shimano ne donne pas de longueur de chape en mots ; Canyon écrit « Longueur de Cage Medium ». Capacité officielle : 36T (9-45 = 36 dents d'écart).
- **Fixation** : patte classique (« Direct attachment (conventional) ») ou patte UDH (« UDH standard ✔ ») ; pas de montage direct (« Direct mount - »). Le DM décrit la pose sur une patte avec butée de tension B.
- **Poids** : Shimano 446 g ; Canyon 450 g.
- DM : **DM-MARD011-07** « Rear Derailleur (Di2) / Lithium-ion Battery / Battery Charger », https://si.shimano.com/en/dm/MARD011 ; PDF https://si.shimano.com/en/pdfs/dm/MARD011/DM-MARD011-07-ENG.pdf. UM : **UM-3K70A-007** « Rear Derailleur (Di2) », https://si.shimano.com/en/um/3K70A. Vue éclatée : EV-RD-M8250-5104A, https://si.shimano.com/en/pdfs/ev/RD-M8250-5104/EV-RD-M8250-5104A.pdf (non lue).
- Noms des pièces, https://si.shimano.com/en/dm/MARD011/name_of_parts, groupe « RD-M9250 / RD-M8250 / RD-M6250 / RD-RX827 / RD-RX717 » : « Link », « Function button », « LED », « Tension pulley », « Guide pulley », « Battery holder », « Lever », « B-screw », « Low limit screw », « High limit screw », « Plate stopper pin », « B-axle ». Le « Electric wire (protective sleeve) » et le « E-TUBEport » ne figurent que dans le groupe « RD-M9260 / RD-M8260 / RD-M6260 ». → **RD-M8250 : pas de fil électrique**.
- Pose, https://si.shimano.com/en/dm/MARD011/installation_rear_derailleur : « be sure to install the rear derailleur so that the stopper plate contacts the B-tension stop with no gap in between. » ; figure : clé hexagonale **5**, « 10 - 12 N·m », « B-axle ». « Use TL-RD11 to check whether the derailleur hanger is straight or not. »
- Longueur de chaîne, https://si.shimano.com/en/dm/MARD011/check_chain_length : « Join the chain at the largest sprocket. » ; « the proper final chain length is determined by adding a certain number of links to this resulting chain length. The number of links is dependent on the chain connection method. » Figures : avec QUICK-LINK, « 5 links » ou « 6 links » ; avec « Connecting pin », « 6 links » ou « 7 links » selon la position du point zéro.

### 3.2 Cassette CS-M8200-12 en 9-45

- Fiche, https://productinfo.shimano.com/en/product/CS-M8200-12 : « Type HYPERGLIDE+ » ; « Combination name (Group name) 9-45T, 10-51T » ; « Combination * Titanium gear 1 9-11-13-15-17-19-21-24-28-33-39-45T » ; « Spline type MICRO SPLINE ✔ » ; « Aluminum spider arm QTY (pcs) 1 » ; « Aluminum gear QTY (pcs) 1 (9-45T) » ; « Steel gear QTY (pcs) 11 (9-45T) » ; « Average weight (g) 426 (9-45T) » ; « Note TL-LR021, Lock ring tool for 9-45T is compatible with 12mm E-THRU. »
- **Liste des dents (officielle)** : 9, 11, 13, 15, 17, 19, 21, 24, 28, 33, 39, 45.
- Corps de roue libre : la cassette exige un corps « MICRO SPLINE ». Le type du corps DT Swiss 350 des GR 30 CF n'est pas donné par la liste des composants du vélo : **à lire sur la roue** (ou sur la page Canyon de la paire).
- DM : **DM-MACS010-02** « Cassette », https://si.shimano.com/en/dm/MACS010 ; PDF https://si.shimano.com/en/pdfs/dm/MACS010/DM-MACS010-02-ENG.pdf. Pose 9-45T (https://si.shimano.com/en/dm/MACS010/installation_cassette_sprocket) : « The smallest sprocket and the lock ring are combined into a single part. » ; « There are sprocket alignment marks for 9T (smallest sprocket), 11T, and 13T. » ; « Tighten the lock ring. 30 - 50 N·m » ; « Keep TL-LR021 perpendicular to the smallest sprocket during use. »
- UM : « User's Manual (1M90A) », https://si.shimano.com/en/um/1M90A. EV : CS-M8200-12-5110, https://si.shimano.com/en/ev/CS-M8200-12-5110 (non lue).

### 3.3 Pédalier FC-RX820-1

- Fiche, https://productinfo.shimano.com/en/product/FC-RX820-1 (affichée « FC-RX820-1 (42T) ») : « Rear speeds 12 » ; « Chain line (mm) 49.7 » ; « P.C.D. (mm) 110 » ; « Spider/gear arms 4 » ; « Chainring combination 40T, 42T, 44T, 46T » ; « Q-factor (mm) 151 » ; « Crank arm length (mm) 160 ✔ 165 ✔ 167.5 - 170 ✔ 172.5 ✔ 175 ✔ » ; « HOLLOWTECH II ✔ » ; « Recommended bottom bracket Threaded (normal) SM-BBR60 Press-Fit SM-BB72 » ; « Crank arm Material Aluminum » ; « Outer ring Material Aluminum Finish Anodized (teeth)/Painted (body) » ; « Average weight (g) (170 mm, w/o bottom bracket) 646 (40T) ».
- Canyon : « Shimano RX820 », manivelles 165 (S-M), plateau 40 → cohérent avec la fiche (165 et 40T existent).
- DM : **DM-GAFC001-06** « Crankset », https://si.shimano.com/en/dm/GAFC001 ; PDF https://si.shimano.com/en/pdfs/dm/GAFC001/DM-GAFC001-06-ENG.pdf. Modèles (panneau Information) : « FC-RX600, FC-RX610, FC-RX810, FC-RX810-11-1-LE, FC-RX810-11-2-LE, FC-RX820 », « SM-BB72-41B », « SM-BBR60 »… Pose (https://si.shimano.com/en/dm/GAFC001/install_remove_crank) : capuchon « 0.7 - 1.5 N·m » ; vis de la manivelle gauche « 12 - 14 N·m », « Tighten the left crank arm screws alternately until the two mounting screws reach the specified torque. »
- UM : « Crankset / Bottom Bracket (1NJ0A) », https://si.shimano.com/en/um/1NJ0A. EV : FC-RX820-5001B, https://si.shimano.com/en/ev/FC-RX820-5001 (non lue).

### 3.4 Boîtier BB72 / PF 86,5

- Lineup 1x12 Di2 : « Bottom Bracket SM-BB72-41B Press-Fit type ».
- Fiche, https://productinfo.shimano.com/en/product/SM-BB72-41B : « HOLLOWTECH II bottom bracket ... Press-Fit type ✔ » ; « Press-Fit bottom bracket shell width (mm) 86.5 ✔ » ; « Small ball bearing ✔ » ; « Adapter Material Resin » ; « Average weight (g) 69 ».
- Canyon : « Shimano Pressfit BB72 ; PF 86,5 ; 65 g ». Référence exacte (SM-BB72-41B ?) non donnée par Canyon : **à lire sur la pièce**. Poids : 65 g (Canyon) contre 69 g (Shimano).
- DM-GAFC001-06, https://si.shimano.com/en/dm/GAFC001/install_remove_bottom_bracket : « Use a bottom bracket compatible with a shell width of 86.5 mm. » ; « Press-fit until there is no more gap between the bottom bracket and the bottom bracket shell. » ; dépose : « Do not reuse the cups as they can be damaged during removal. » (Pas de couple pour le press-fit.)

### 3.5 Chaîne CN-M8100

- Canyon dit seulement « Shimano XT ». La lineup 1x12 Di2 cite « CN-M8100 HG 12-speed QUICK-LINK SM-CN910-12 ». Que la chaîne montée soit une CN-M8100 est une **déduction** : **à lire sur la chaîne**.
- Fiche, https://productinfo.shimano.com/en/product/CN-M8100 : « Type HG 12-speed » ; « Pin link plate Gray » ; « Roller link plate Chromizing » ; « Average weight (g) (114 links) 252 » ; « Note QUICK-LINK ».
- DM : **DM-MACN001-08** « Chain (12-speed) », https://si.shimano.com/en/dm/MACN001 ; PDF https://si.shimano.com/en/pdfs/dm/MACN001/DM-MACN001-08-ENG.pdf. UM : « Chain (0AH0A) », https://si.shimano.com/en/um/0AH0A.

### 3.6 Batterie BT-DN320 et chargeur EC-DN100

- **Emplacement** : la batterie est **dans le dérailleur arrière**. DM-MARD011, noms des pièces (https://si.shimano.com/en/dm/MARD011/name_of_parts) : « Battery holder », « Lever » sur RD-M8250, et « BT-DN320 (battery) », « EC-DN100 (battery charger) ». Fiche BT-DN320 (https://productinfo.shimano.com/en/product/BT-DN320) : « Type On-board battery » ; « Chemistry Li-Ion » ; « Rated voltage (V) 7.6 » ; « Rated capacity (Ah) 0.305 » ; « Rated capacity (Wh) 2.32 » ; « Compatible charger EC-DN100 » ; « Average weight (g) 26.5 ». Fiche EC-DN100 (https://productinfo.shimano.com/en/product/EC-DN100) : « Compatible battery BT-DN320 » ; « Charging cord Included ».
- Les manettes ST-RX825 ont leurs propres piles : 2 × CR1632 chacune (§ 1.4). Déduction (pas une phrase Shimano) : ce montage n'a ni batterie de cadre ni jonction filaire, puisque le dérailleur a sa batterie et que la fiche RD-M8250 indique « Wired - » et « SD300 port (pcs) 0 ».
- Dépose de la batterie, UM-3K70A, https://si.shimano.com/en/um/3K70A/3K70A_remove_battery : « Pull the lever in the direction of the arrow, then slide the battery holder out to remove it. » ; « Remove the battery from the rear derailleur. »
- Pose, https://si.shimano.com/en/um/3K70A/3K70A_install_battery : « Install the battery to the rear derailleur, with the triangle mark of the battery facing outward » ; « Align the rails of the battery holder and rear derailleur, and slide the battery holder in. Then, push it in firmly until you feel a click. » ; « After installing the battery holder, check that the lever is in the lock position. »
- Charge, UM « Battery Charger (UM-7KZ0A-001) », https://si.shimano.com/en/um/7KZ0A/UM-7KZ0A_charg_ing_method-merge (renvoi depuis https://si.shimano.com/en/dm/MARD011/how_to_charge) : « The battery can be charged by using an AC adapter with a USB port or connecting the battery charger to the USB port of a PC. » ; « Insert the battery with the △ mark of the battery charger aligned with the △ mark of the battery. Then, push it in firmly until you feel a click. » ; « After charging has started, the charge indicator (orange) lights up. » ; « The charging time is about 1 hour. » ; « When the charge indicator (orange) switches off, charging is complete. » Pièces du chargeur (DM-MARD011) : « Charge indicator », « Error indicator », « USB-C port », « USBcable (included with this product) ».
- Spécifications du dérailleur (UM-3K70A, https://si.shimano.com/en/um/3K70A/UM-3K70A_spe_cifi_cations-merge) : « Operating temperature -10°C - 50°C » ; « Wireless specifications ANT ® / Bluetooth ® LE » ; « Firmware version 4.0.0 or later ».

## 4. Patte SRAM UDH sur ce cadre : confirmée par Canyon

- Fiche du vélo, https://www.canyon.com/en-ch/gravel-bikes/adventure/grizl/cf/grizl-cf-8-di2/4556.html, section « Components », onglet « Spare parts », lu le 23/10/2026 : la liste des pièces de rechange de ce vélo contient « SRAM UDH Derailleur Hanger » (lien https://www.canyon.com/en-ch/gear/bike-parts/spare-wear-parts/sram-udh-derailleur-hanger/10006305.html).
- Page de la pièce, https://www.canyon.com/en-ch/gear/bike-parts/spare-wear-parts/sram-udh-derailleur-hanger/10006305.html : « Replacement derailleur hanger for the models listed below » ; « Contents 1x SRAM Universal Rear Derailleur Hanger » ; « Brand SRAM » ; « Weight 31 g ». Fenêtre « See compatible products », rubrique Grizl : « Grizl AL | R075-01 | 2024 », « Grizl AL | R124-01 | 2027 », « Grizl CF | R126-01 | 2026 », « **Grizl CF | R126-01 | 2027** ». Le code R126 est celui du cadre (« QSG R126 » dans la liste Canyon, coloris R126_P06).
- Fiche Shimano du dérailleur : « UDH standard ✔ » (§ 3.1). Montage sur la patte UDH par l'axe B (B-axle), pas en montage direct.
- Source SRAM propre à ce cadre : non cherchée plus loin, la source Canyon suffit.
- Le texte de présentation du vélo et la liste des composants ne mentionnent pas l'UDH ; seul l'onglet « Spare parts » le fait.

## 5. Roues et pneus

### 5.1 GR 30 CF : nombre de rayons publié

- Page Canyon de la paire, https://www.canyon.com/en-de/gear/bike-parts/tyres-and-tubes/wheels/canyon-gr-30-cf-wheelset/10014610.html, lue le 23/10/2026 : « Spokes: DT Swiss Aerocomp, stainless steel, bladed, 24 front and rear » ; « 24 straight-pull DT Aerocomp spokes on each wheel » ; « Nipples: DT Swiss Squorx aluminium, external, black » ; « Hubs: DT Swiss 350 Spline with Ratchet 36 SL (36 points of engagement) ». → **24 rayons droits (straight-pull) par roue, publié.**
- Même page : « The rear hub uses a Microspline freehub body, providing compatibility with any Shimano 11 or 12 speed cassette with a 10T smallest sprocket. » ; « Delivered with tubeless valve, Microspline freehub installed, XDR freehub as psare, tubeless tape installed » ; « Tyre compatbility: from 35 to 71mm. Maximum pressure: 4 bars/58PSI » ; « Intended use: ASTM 2 (fro ujumps less than 15cm), Maximum systemweight: 130kg » (coquilles Canyon). « the spokes are easily replaceable, without removing the rotor ».
- **Contradiction cassette / corps de roue libre** : la page de la paire parle d'une cassette Shimano « with a 10T smallest sprocket », alors que le vélo est livré avec une CS-M8200-12 **9-45** (plus petit pignon 9T). La fiche du vélo (onglet « Spare parts ») liste « DT Swiss 350 End Caps Rear Wheel Shimano Micro Spline 142/12mm » et « DT Swiss 350 Conversion Kit Shimano Micro Spline 142/12mm Freehub Body » (« Coming soon »). Shimano : « Spline type MICRO SPLINE ✔ » pour la CS-M8200-12. Le corps monté sur la roue du vélo : **à lire sur la roue**.
- Pièce de rechange (onglet « Spare parts » du vélo) : « Spokes & Nipples for Canyon GR 30 CF », https://www.canyon.com/en-ch/gear/bike-parts/spare-wear-parts/spokes-and-nipples-for-canyon-gr-30-cf/10015634.html : « Brand DT Swiss », « Weight 38 g » ; longueur des rayons non publiée.
- Manuel Canyon des roues, « WHEELSET OWNER'S MANUAL VERSION: 01_11.06.2025 », lié depuis la page support Grizl CF (https://www.canyon.com/en-ch/customer-service/gravel/grizl/grizl-cf/) : https://www.canyon.com/on/demandware.static/-/Library-Sites-canyon-shared/default/dw22ff8457/documents/customer-service/gravel-bikes/canyon-wheelset-manual-2025.pdf. Tableau « SPECIFIC CASE OF HOOKLESS RIMS » : « With Hookless rim, always never exceed the following maximum pressure: » ; ligne des pneus de 45 à 54 mm de large : « 3.0 » bar et « 43.5 » PSI (colonnes : largeur de pneu en mm, bar, PSI). Le manuel ne nomme pas le modèle GR 30 CF dans le texte extrait et ne donne pas de nombre de rayons. « Never exceed the maximum pressure stated on the rim. »
- **Contradiction pression maximale** : page de la paire « Maximum pressure: 4 bars/58PSI » ; manuel Canyon des roues, jante hookless avec pneu de 45 mm : « 3.0 » bar. La valeur la plus basse s'impose (« never exceed the lower maximum pressure of the two », même manuel) ; pression imprimée sur la jante : **à lire sur la jante**.

### 5.2 Schwalbe G-One RX, 45 mm

- Canyon (liste du vélo) : « Schwalbe G-One RX Performance, 45mm ; 45 mm ; 608 g ». Onglet « Wear parts » de la même fiche (https://www.canyon.com/en-ch/gravel-bikes/adventure/grizl/cf/grizl-cf-8-di2/4556.html) : le pneu de rechange proposé est « Pirelli Cinturato Gravel H 45-622 Tubeless Tyre » (https://www.canyon.com/en-ch/gear/bike-parts/tyres-and-tubes/tyres/pirelli-cinturato-gravel-h-45-622-tubeless-tyre/10015722.html), pas un Schwalbe.
- Page Schwalbe du modèle, https://www.schwalbe.com/en/G-One-RX, et de la variante 45 mm non PRO, https://www.schwalbe.com/en/G-One-RX-11654623 (configurateur : LINE « Schwalbe », WHEELSIZE « 45-622 », VERSION « RACE, RaceGuard », COMPOUND « ADDIX Green », COLOR « Black »), lues le 23/10/2026 :
  - « Details / Product data ETRTO: 45-622 Inch: 28x1.70 Line: Schwalbe Weight: 595 g Französische Bezeichnung: 700x45C Version: RACE, RaceGuard Compound: ADDIX Green Color: Black Bead: Folding E-Bike: E-25 Epi: 67 Load (kg): 100 kg Seal: TLR Tread: HS637 max. Bar: 4 Bar max. Psi: 55 PSI min. Bar: 0 Bar EAN: 4026495957885 » ; « Product number: 11654623 ».
  - Tableau des variantes : la seule autre 45-622 est la PRO (« RACE PRO, V-Guard », « ADDIX Race », 570 g, 4 bar / 55 PSI, n° 11654579 en noir, 11654575 flanc transparent).
  - Description : « NEW: Schwalbe G-ONE RX », suivi de « the sporty gravel tire with maximum grip and excellent self-cleaning properties in muddy conditions. » ; « Your race tire for the best off-road performance » ; « Enormous grip even under challenging conditions (rocky, muddy terrain) » ; « Maximum cornering traction thanks to paired outer blocks » ; « Good self-cleaning in muddy conditions » ; « Race carcass for good puncture protection and high speed » ; « RaceGuard insert for reliable puncture protection under the tread » ; « Tubeless-ready ».
- **Ce que Schwalbe décrit de la bande de roulement** : sculpture « HS637 », des crampons extérieurs appariés (« paired outer blocks ») pour l'adhérence en courbe, un bon autonettoyage dans la boue. Pas de cote de crampon publiée.
- **Pression** : Schwalbe publie un maximum (« 4 Bar », « 55 PSI ») et « min. Bar: 0 Bar » ; **pas de pression recommandée publiée** sur la fiche (le site renvoie à son outil « Pressure Prof », non consulté). Sur jante hookless, le manuel Canyon des roues limite un pneu de 45 mm à « 3.0 » bar (§ 5.1), plus bas que les 4 bar Schwalbe.
- **Désignation** : Schwalbe n'emploie pas le mot « Performance » sur la page actuelle (lignes « Schwalbe PRO » et « Schwalbe »). La variante montée (non PRO 595 g ou autre) : **à lire sur le flanc** (ETRTO, version, gomme, code HS). Poids : Canyon 608 g contre Schwalbe 595 g (non PRO) ou 570 g (PRO).

## 6. Poste de pilotage et selle

### 6.1 Cocotte ST-RX825 : dimensions

- Fiches Shimano ST-RX825-L / -R (https://productinfo.shimano.com/en/product/ST-RX825-R) : aucune cote de cocotte (longueur, hauteur, largeur). Seul chiffre dimensionnel : « Clamp band (mm) 23.8-24.2 ». Les documents listés pour ST-RX825 sur si.shimano.com (DM-GADBR10, DM-GAGN001, DM-BROIL, UM-0RM0B, EV-ST-RX825-5053B) ne comprennent pas de plan coté (la vue éclatée n'a pas été lue).
- **Dimensions de la cocotte : non publiées.** À mesurer sur la pièce pour la 3D.
- Ce que montrent les manuels : vis de garde sous le couvre-cocotte, accès en le retournant « from the back side » (DM-GADBR10, réglage de la garde) ; vis de course libre et logement des piles CR1632 accessibles « from the front side ».

### 6.2 Selle Fizik « Terra Argo X5 »

- Page fizik, https://www.fizik.com/us_en/terra-argo-x5.html (redirigée vers https://www.fizik.com/en-us/products/saddles-terra-argo-x5-black-targox5fa1), lue le 23/10/2026. Titre : « TERRA ARGO X5 » ; « A gravel-specific saddle with a short nose and a combination of a ride-compliant carbon-reinforced nylon shell and S-Alloy rails. »
- Colonne « 150 » du tableau « Technology Specifications » : « Padding technology Pu foam » ; « Shell material description Carbon reinforced nylon with wingflex » ; « Rail material S-alloy » ; « Weight 271 g » ; « Width 150 mm » ; « Height at 75mm 51 mm » ; « Length from nose at 75mm 113 mm » ; « Rail Dimension 7x7 » ; « Length 270 mm ». (La ligne « Length 270 mm » suit « Rail Dimension » ; la page ne précise pas si c'est la longueur de la selle ou du rail. Les trois largeurs 140, 150, 160 donnent « 270 mm ».)
- Autres textes : « closed-loop Mobius rail system » ; « Type-2 foam formulation » ; « dropped-nose design ».
- Canyon : « Fizik Argo Terra X5 ; 150 mm ; Unisexe ; 273 g ». Fizik écrit « Terra Argo X5 » et 271 g. Rails : « S-alloy », « 7x7 » (section en mm, unité non écrite).

### 6.3 Tige de selle Canyon SP100 VCLS 2.1 CF 27.2 (réf. 10016374)

- **Modèle : SP100 VCLS 2.1, confirmé par Lamine (chat Canyon).**
- Page officielle de la pièce, https://www.canyon.com/en-ch/gear/bike-parts/posts-and-clamps/canyon-sp100-vcls-2.1-cf-27.2-seatpost/10016374.html (et /en-de/, /fr-ch/, /de-de/, /en-gb/, /en-us/, /fr-fr/, /de-ch/, même contenu), lue le 23/10/2026 : titre « Canyon SP100 VCLS 2.1 CF 27.2 Seatpost » ; « Product details Brand Canyon Compatibility See compatible products ». **Aucune autre donnée publiée** (pas de poids, de recul, de débattement ni de texte de description). Liste de compatibilité : « Grizl CF | R126-01 | 2026 », « Grizl CF | R126-01 | 2027 » (et Endurace, Grizl AL, Grizl CF SL, Inflite, Ultimate).
- **Marquage lu sur la photo officielle de la pièce** (vue « ALT-1 », https://dma.canyon.com/image/upload/w_1400,c_fit/b_rgb:F2F2F2/f_auto/q_auto/v1778505931/2026_ALT-1_ACC_SP-C000002655-P0100-01-P01-350_10016374_BK_Full_qgacz3) : « SP100 », « VCLS 2.1 CF », « SETBACK 18 / 6 mm », « LENGHT 350 mm » (sic), « DIAMETER 27,2 mm », « CATEGORY 2 » ; plus bas, un repère « MIN » avec graduations, un texte coupé « …E TILT » et une étiquette à QR code. Vue « ALT-2 » (https://dma.canyon.com/image/upload/w_1400,c_fit/b_rgb:F2F2F2/f_auto/q_auto/v1778505932/2026_ALT-2_ACC_SP-C000002655-P0100-01-P01-350_10016374_BK_Full_tweew9) : tête marquée « FLIP HEAD », deux vis, graduations « +5 / 0 / -5 » sur le fût. Vue principale (https://dma.canyon.com/image/upload/w_1400,c_fit/b_rgb:F2F2F2/f_auto/q_auto/v1778239226/2026_full_S-PARTS_SP-C000002655-P0100-01-P01-350_10016374_BK_full_w05odu) : deux lames noires parallèles sur toute la longueur, réunies en bas et dans la tête, cintrées vers l'arrière en haut.
- **Recul** : « SETBACK 18 / 6 mm » (photo officielle du marquage ; la page ne l'écrit pas). Les deux valeurs correspondent vraisemblablement aux deux positions de la tête « FLIP HEAD », mais Canyon ne le dit pas pour la 2.1.
- **Débattement** : non publié pour la 2.1. La fiche du vélo dit pour la tige du vélo « 20 mm of vertical deflection » (en anglais, en la nommant « SP100 VCLS 2.0 »).
- **Poids** : non publié sur la page 2.1 ; la fiche du vélo donne « Canyon SP100 … 238 g ».
- Libellés Canyon contradictoires, chacun avec sa source (lus le 23/10/2026) :
  1. Liste des composants, https://www.canyon.com/en-ch/gravel-bikes/adventure/grizl/cf/grizl-cf-8-di2/4556.html et https://www.canyon.com/fr-ch/velos-de-gravel/adventure/grizl/cf/grizl-cf-8-di2/4556.html : « Canyon SP100 », « 27,2 mm », « Carbon (CF) », « 238 g », « 350 », insertion « 210 » max, « 110 » min.
  2. Présentation, page anglaise (même URL en-ch), bloc « Benchmark rider comfort » : « Providing 20 mm of vertical deflection in a sleek package, the SP100 VCLS 2.0 seatpost is simple, elegant, and beautifully effective. Its innovative carbon leaf spring construction feels firm when you're on the flats… ». (Le relevé précédent n'avait pas trouvé ce texte : il est bien dans la page.)
  3. Présentation, page française (URL fr-ch), bloc « Un confort de référence » : « Offrant 20 mm de flexion verticale dans un design épuré, la tige de selle S15 VCLS 2.0 est simple, élégante et incroyablement efficace. Sa construction innovante en lames de carbone… ».
  4. Onglet « Spare parts » du vélo : « Canyon S15 VCLS 2.0 27.2mm CF Seatpost » (https://www.canyon.com/en-ch/gear/bike-parts/posts-and-clamps/canyon-s15-vcls-2.0-27.2mm-cf-seatpost/148287.html) **et** « Canyon SP100 VCLS 2.1 CF 27.2 Seatpost » (10016374).
  5. Autre vélo Canyon, même tige « Canyon SP100 » dans sa liste (Endurace CF 7 AXS, https://www.canyon.com/en-us/road-bikes/endurance-bikes/endurace/cf/endurace-cf-7-axs/4422.html) : « Our new-look SP0100 VCLS 2.0 seatpost … now has a direct interface for a rear light. Allowing up to 20 mm flex ».
- Pour mémoire, **ne pas appliquer à la 2.1** : la page S15 VCLS 2.0 (148287) publie « Length: 350 mm Setback: 13/25 mm Diameter: 27.2 mm Category: 1 Weight: 220 g », « up to 20 mm travel », « Flip Head design ». Le recul (13/25 contre 18/6 mm), la catégorie (1 contre 2) et le poids (220 contre 238 g) diffèrent de la SP100 VCLS 2.1.

## 7. Photos officielles Canyon du Grizl CF 8 Di2 Floating Violet (R126_P06)

### 7.1 Adresses (vérifiées le 23/10/2026, toutes sur dma.canyon.com)

Images du carrousel de la fiche https://www.canyon.com/en-ch/gravel-bikes/adventure/grizl/cf/grizl-cf-8-di2/4556.html :

- Vue complète, côté transmission (taille d'origine 6622 × 3725 px) : https://dma.canyon.com/image/upload/w_2400,c_fit/b_rgb:F2F2F2/f_auto/q_auto/v1785934014/2027_FULL_grizl_cf-8-di2_4556_R126_P06_vpvgno (pleine résolution : remplacer `w_2400,c_fit` par `w_8000,c_limit`).
- Rangement, côté gauche, avec sacoche de cadre : https://dma.canyon.com/image/upload/w_1400,c_fit/f_auto/q_auto/2027_TOP-2_grizl_cf-8-di2_4556_R126_P06_storage_m34rt0
- Passage de pneu, tête de fourche : https://dma.canyon.com/image/upload/w_1400,c_fit/f_auto/q_auto/2027_TOP-3_grizl_cf-8-di2_4556_R126_P06_tyre-clearance_sa25y3
- Porte-bagages : https://dma.canyon.com/image/upload/w_1400,c_fit/f_auto/q_auto/2027_TOP-4_grizl_cf-8-di2_4556_R126_P06_rack_ko80vo (non examinée en détail)
- Confort, tige et selle : https://dma.canyon.com/image/upload/w_1400,c_fit/f_auto/q_auto/2027_TOP-5_grizl_cf-8-di2_4556_R126_P06_comfort_stzvfz
- À exclure : la 2ᵉ image du carrousel est `2026_TOP-1_grizl_cf-6_4141_R126_P01_og_zj4kw7`, un **Grizl CF 6** d'un autre coloris, pas ce vélo.
- Autres coloris du même vélo : `2027_FULL_grizl_cf-8-di2_4556_R126_P05_qcryz8`, `2027_FULL_grizl_cf-8-di2_4556_R126_P07_jjha7f`.
- Agrandissements : le serveur accepte un recadrage en pixels de l'image d'origine, par exemple https://dma.canyon.com/image/upload/c_crop,x_4234,y_1459,w_1900,h_1900/w_1200,c_fit/f_auto/q_auto/v1785934014/2027_FULL_grizl_cf-8-di2_4556_R126_P06_vpvgno (roue avant entière).

### 7.2 Ce que montrent les photos (observation seule)

- **Manettes** (vue complète, recadrage x 4200, y 150) : cocotte noire, « GRX » en relief sur le flanc du repose-main droit, nervures en travers sur le dessus de la cocotte. Levier de frein noir avec une zone striée et une seconde palette plus petite derrière lui. Ruban noir à motif de triangles en relief. Aucune durite ni gaine ne sort de la cocotte à l'extérieur du ruban.
- **Dérailleur arrière et son fil** (recadrage x 1050, y 1900) : dérailleur noir, logo « XT » blanc avec un petit « DEORE » sur la biellette extérieure, chape noire, deux galets noirs. **Aucun fil ni gaine** ne relie le dérailleur au cadre. Le logement de batterie ne se distingue pas sur la photo.
- **Cassette** : pignons argent-champagne, le plus grand pignon noir, araignée visible derrière les grands pignons. Pignons non comptables avec certitude sur la photo.
- **Pédalier** (recadrage x 2550, y 2100) : manivelle et araignée à 4 bras noires, logo « GRX » blanc sur la manivelle droite. Plateau noir, inscription lisible « SHIMANO GRX 12S CN 40T », dents de hauteurs alternées. Une pédale automatique Shimano marquée « XT » est montée sur la photo, alors que la liste dit « Pédales : Non inclus » (même écart que sur la photo du CF 7). Une pièce noire allongée court sous le tube diagonal, juste devant le plateau.
- **Roues** : **24 rayons comptés sur chaque roue** (6 têtes de rayon par quart de jante, quart haut-droit de la roue avant et quart haut-gauche de la roue arrière ; compte fait sur la photo). C'est cohérent avec le chiffre publié « 24 front and rear » (§ 5.1). Rayons noirs, têtes de rayon visibles à l'extérieur de la jante. Jantes noires. Décors : petit « CANYON » blanc près de la valve sur la jante avant ; sur la jante arrière, près de la valve, « GR 30 CF » en blanc avec « GRAVEL ADVENTURE » dessous, puis un bloc de petits caractères **illisible** sur la photo ; en bas de chaque jante, grandes lettres gris foncé (logo Canyon). Valves à tête dorée.
- **Pneus** : flanc noir marqué « SCHWALBE G-ONE RX TLR », puis « 45-622 », avec le logo oiseau. De profil, crampons d'épaule rectangulaires groupés par deux, espacés régulièrement (vue complète). Sur la photo TOP-3, petits crampons serrés au centre, plus gros sur les épaules.
- **Selle et tige** (recadrage x 1700, y 0 ; photo TOP-5) : selle noire, inscription « ARGO » côté bec. Rails noirs gradués, avec un repère ▼. Tige noire à recul, faite de deux lames séparées par une fente sur sa longueur, qui se rejoignent dans une tête marquée « FLIP HEAD » à deux vis. Les petits caractères près des vis sont illisibles. Pièce de serrage noire au sommet du tube de selle, côté arrière.
- **Cheminement des durites** (vue complète et TOP-2) : les durites passent sous le ruban, en sortent près du collier de potence et plongent dans le haut de la direction, derrière la potence. Aucune durite visible sur le cadre ni sur le fourreau côté transmission. Étrier avant noir (flat mount) derrière le fourreau gauche, marqué « SHIMANO » et d'une référence qui commence par « BR-RX8 », suivie de « JAPAN ». La fin de la référence est floue : **lecture non certaine**. L'étrier arrière se devine derrière la cassette, sans détail lisible.
- **Batterie ou jonction visible** : aucune boîte de jonction, aucun fil électrique, aucun port de charge visible sur le cadre, la potence ou le cintre.

## Contradictions et inconnues

### Contradictions entre documents

1. **DM des freins** : le chapitre s'appuie sur le DM-GADBR01 (version 10) pour la manette. La ST-RX825 relève du DM-GADBR10-04 ; le DM-GADBR01 est passé en version 11 et ne liste pas la ST-RX825. Le DM-GADBR10 renvoie au DM-GADBR01 pour l'étrier, les plaquettes et les pistons (§ 1.1-1.2).
2. **Purge ST-RX825 contre DM-GADBR01** : couvre-cocotte retourné « par l'arrière » contre « from the front side » ; angle de l'entonnoir à 20° contre la cocotte à 45° ; environ 10 coups de levier ; pas d'étape « 0,5 seconde » ; bouchons « bleed boss cap » et « bleed screw cap » (§ 1.3).
3. **Couple de la vis de purge de l'étrier** : « non publié » dans le chapitre (DM-GADBR01) ; « 4 - 6 N·m », clé de 3 mm, dans le DM-GADBR10 (§ 1.3, 1.6).
4. **Pistons de BR-RX820** : fiche Shimano « Piston material Resin » ; le chapitre cite Park Tool, « les pistons sont en céramique » (sur les étriers Shimano flat mount). Pour BR-RX820, la fiche Shimano prime.
5. **Disque** : Canyon liste « Shimano Deore XT MT800 » (116 g) ; l'onglet « Wear parts » du même vélo propose « Shimano Ultegra RT-CL800 Brake Rotor » ; Shimano recommande RT-CL800 avec BR-RX820 (fiche, lineup) mais dessine un RT-MT800 dans la vue éclatée EV-BR-RX820-5000C. Poids : Canyon 116 g ; Shimano RT-MT800 « 108 (160 mm) » ; RT-CL800 « 114 (160 mm) » sans bague.
6. **Statut de RT-MT800** : `discon` dans C-461 et « No results » sur productinfo (3 essais) ; mais fiche bike.shimano.com en ligne et absent de la liste officielle des produits abandonnés.
7. **Cassette 9-45 et roue libre** : la page de la paire GR 30 CF parle de cassettes Shimano « with a 10T smallest sprocket » ; le vélo est livré en 9-45 (9T). Shimano : CS-M8200-12 « MICRO SPLINE ».
8. **Pression maxi** : page de la paire GR 30 CF « 4 bars/58PSI » ; manuel Canyon des roues, hookless, pneu 45-54 mm : « 3.0 » bar ; Schwalbe « 4 Bar », « 55 PSI ».
9. **Pneu** : Canyon « G-One RX Performance », 608 g ; Schwalbe n'emploie plus « Performance » (lignes « Schwalbe » 595 g et « Schwalbe PRO » 570 g en 45-622) ; le pneu de rechange de l'onglet « Wear parts » est un Pirelli Cinturato Gravel H 45-622.
10. **Tige** : « Canyon SP100 » (liste), « SP100 VCLS 2.0 » (texte anglais), « S15 VCLS 2.0 » (texte français), « S15 VCLS 2.0 » et « SP100 VCLS 2.1 » (pièces de rechange), « SP0100 VCLS 2.0 » (page Endurace). Retenu : SP100 VCLS 2.1, confirmé par Lamine (chat Canyon), marquage « SETBACK 18 / 6 mm », « CATEGORY 2 » sur la photo officielle.
11. **Poids divers** : dérailleur 450 g (Canyon) contre 446 g (Shimano) ; boîtier 65 g contre 69 g ; selle 273 g contre 271 g ; roues du vélo 735/878 g contre paire vendue seule 715/810 g ; ST-RX825 389/390 g (Canyon, par manette, contenu non précisé) contre « 415 ( /pair) » (Shimano).
12. **Groupe** : la fiche Canyon annonce « Shimano GRX Di2 electronic shifting », alors que le dérailleur (RD-M8250-GS) et la cassette (CS-M8200-12) sont des Deore XT VTT. Shimano associe à ST-RX825 le RD-RX827-SGS et la CS-M8200-12 en 10-51T.
13. **Pédales** : la photo officielle montre une pédale Shimano « XT » ; la liste dit « Pédales : Non inclus ».
14. **Fizik** : « Argo Terra X5 » (Canyon) contre « TERRA ARGO X5 » (fizik).

### À lire sur le vélo à la livraison

- Modèle gravé sur chaque **étrier** (photo : « BR-RX8… » flou ; Shimano recommande BR-RX820) et type de **vis de purge** (clé de 3 mm attendue d'après le DM-GADBR10).
- **Manette gauche** : ST-RX825-L (avec boutons) ou BL-RX825-L (levier seul) ? Canyon écrit « Shimano GRX ST-RX825 » sans « Di2 ».
- **Plaquettes** d'origine (L05A-RF, K05S-RX ou autre) et leur épaisseur neuve.
- **Disques** : référence exacte (RT-MT800 ou RT-CL800), type de bague (denture intérieure, outil TL-LR15, ou extérieure, outil TL-FC36), épaisseur neuve.
- **Corps de roue libre** de la roue arrière (Micro Spline, compatible 9T) et **pression maximale imprimée sur la jante** (bloc illisible sur la photo).
- **Pneu** : version exacte sur le flanc (photo : « SCHWALBE G-ONE RX TLR », puis « 45-622 ») ; gomme et code HS.
- **Patte UDH** : présence et état (Canyon la liste comme pièce de rechange de ce cadre R126-01 2027).
- **Chaîne** : référence (CN-M8100 supposée) et nombre de maillons ; attache QUICK-LINK.
- **Boîtier** : référence exacte (SM-BB72-41B supposée).
- **Batterie BT-DN320** dans le dérailleur : état de charge à la réception ; piles CR1632 des manettes (« intended only for test purposes » selon Shimano).
- **Tige** : marquage « VCLS 2.1 CF » et « SETBACK 18 / 6 mm » ; position de la tête FLIP HEAD montée ; couple des vis de tête (non publié) ; débattement (non publié pour la 2.1).
- **Cocotte ST-RX825** : dimensions (non publiées) pour la 3D.
- **Selle** : sens de « Length 270 mm » (selle ou rail) à mesurer.
- Couples **non publiés** dans les documents lus : vis de tête de la tige SP100 VCLS 2.1 ; serrage de la patte UDH ; axes traversants (à lire dans le guide Canyon livré).
