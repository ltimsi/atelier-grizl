# Grizl CF 8 Di2 (4556, taille M) : sources du lot 4, transmission

Relevé du 30/10/2026. Toutes les citations sont recopiées telles quelles depuis la source indiquée, lue le 30/10/2026 sauf mention contraire. Les tirets longs et demi-longs des sources sont retirés : une valeur qui en contenait est redite en toutes lettres, ou la citation est coupée à cet endroit. Règle suivie : document du fabricant de la pièce seulement ; sinon « non publié » ou « à lire sur la pièce ». Park Tool n'est cité que pour un geste, ou pour les données de ses propres outils (règle des sources, point 2). Ce qui ne vient d'aucune source est marqué « Proposition », et ce qui est déduit par ce relevé est marqué « déduction » ou « lecture de ce relevé ».

Base déjà vérifiée, non refaite : `composants-origine.md` et `sources-cf8-di2.md` (§ 3 transmission, § 4 patte UDH, § 8 pièces d'usure), et `montage-cf8-di2.md` § 6 (Di2 le jour de la livraison : charge de la BT-DN320, niveau de la batterie, piles CR1632, appairage sans application, E-TUBE PROJECT le premier jour). Ce relevé ne recopie pas ces points : il y renvoie, et n'ajoute que ce qui sert à l'entretien et au dépannage.

## Documents lus

**Manuels Shimano en HTML** sur si.shimano.com, lus section par section dans le navigateur intégré (texte de la page, figures agrandies à l'écran). Le serveur refuse la ligne de commande (« 403 ») pour les pages comme pour les PDF :

| Document | Version affichée | Adresse |
|---|---|---|
| Rear Derailleur (Di2) / Lithium-ion Battery / Battery Charger | DM-MARD011-07 | https://si.shimano.com/en/dm/MARD011 |
| Rear Derailleur (Di2), manuel utilisateur | UM-3K70A-007 | https://si.shimano.com/en/um/3K70A |
| Chain (12-speed) | DM-MACN001-08 | https://si.shimano.com/en/dm/MACN001 |
| Chain, manuel utilisateur | UM-0AH0A-007 | https://si.shimano.com/en/um/0AH0A |
| Cassette (liste de recherche : « 06/15/2026 ») | DM-MACS010-02 | https://si.shimano.com/en/dm/MACS010 |
| Vue éclatée CS-M8200-12 (liste de recherche : « 06/19/2025 ») | EV CS-M8200-12-5110 | https://si.shimano.com/en/ev/CS-M8200-12-5110 |
| Crankset | DM-GAFC001-06 | https://si.shimano.com/en/dm/GAFC001 |
| Crankset, manuel utilisateur | UM-1NJ0A-007 | https://si.shimano.com/en/um/1NJ0A |
| Crankset (Inspection Method) | DM-RAFC012-02 | https://si.shimano.com/en/dm/RAFC012 |
| Hydraulic Disc Brake/Dual Control Lever (Di2) | DM-GADBR10-04 | https://si.shimano.com/en/dm/GADBR10 |
| Dual Control Lever (Di2), manuel utilisateur | UM-0RM0B-007 | https://si.shimano.com/en/um/0RM0B |
| GRAVEL Di2 Series General Guide | DM-GAGN001-01 | https://si.shimano.com/en/dm/GAGN001 |
| E-TUBE PROJECT Cyclist, manuel utilisateur | UM-7J4MA-025 | https://si.shimano.com/en/um/7J4MA |
| M9200 Technical Tips (XTR, lu pour comparaison) | DM-M9200TIPS-00 | https://si.shimano.com/en/dm/M9200TIPS |
| Vue éclatée des outils | EV TOOL4-3637C | https://si.shimano.com/en/ev/TOOL4-3637 |
| Codes d'erreur et d'avertissement | page « ERROR & WARNING CODE » | https://si.shimano.com/en/error |

**Autres pages Shimano** : FAQ Di2 (https://bike.shimano.com/support-and-service/faq/DI20A.html, questions dépliées dans le navigateur) ; article « How to Check Your Chain Length » (https://bike.shimano.com/stories/article/determine-chain-length.html, date affichée « 09/10/2026 ») ; tableau de compatibilité C-473 (https://productinfo.shimano.com/en/compatibility/C-473, schéma « Di2 with BT-DN320 » agrandi à l'écran) ; fiche SM-CN910-12 (https://productinfo.shimano.com/en/product/SM-CN910-12). L'adresse de l'article citée par les brouillons, https://mtb.shimano.com/stories/determine-chain-length, ne répond plus le 30/10/2026 (« Could not resolve host ») : l'article est maintenant sur bike.shimano.com.

**PDF téléchargés** avec curl dans le dossier de travail de la session, gardés hors du dépôt, lus en texte et en images de pages, jamais dans le navigateur :

| Document | Fichier et version | Adresse officielle |
|---|---|---|
| SRAM, UDH (Universal Derailleur Hanger) User Manual | `udh-user-manual.pdf`, 13 pages, « 95-7918-014-000 Rev C © 2026 SRAM, LLC » | https://www.sram.com/globalassets/document-hierarchy/user-manuals/sram-mtb/drivetrain/udh-universal-derailleur-hanger-user-manual.pdf (lié depuis la page service SRAM https://www.sram.com/en/service/models/ac-drhg-udh-a1) |
| MOTOREX, fiche technique CHAINLUBE FOR WET CONDITIONS | `chainlube-wet-datasheet.pdf`, 1 page, datée en pied de page de juillet 2023, révision « 10 » | Lien « Technical datasheet » de la page produit https://motorex.com/en-us/chainlube-for-wet-conditions--49642 (fichier PDF sur motorex.com, dossier `Pdf/TI/Motorex/Kettenoel-Pflege/CHAINLUBE-FOR-WET-CONDITIONS/` ; adresse complète non recopiée, à cause du contrôle des jetons personnels) |
| Canyon, manuel du vélo de route | `Canyon RR EN_2021-08-30_Web.pdf`, 63 pages PDF, deux pages imprimées par page PDF | https://www.canyon.com/on/demandware.static/-/Library-Sites-canyon-shared/default/dw1f6db954/documents/customer-service/road-bikes/Canyon%20RR%20EN_2021-08-30_Web.pdf |
| Canyon, guide de démarrage (QSG) | PDF V02 déjà téléchargé au lot 3, « VERSION: 31.07.25 \| 20030528 \| 056-V02 », p.60 à 67 relues en images | https://www.canyon.com/on/demandware.static/-/Library-Sites-canyon-shared/default/dw237d861e/documents/customer-service/gravel-bikes/canyon-grizl-quick-start-guide-2025-2.pdf |

**Pages HTML** lues avec curl : Canyon, article « How to clean and maintain your bike chain » (https://www.canyon.com/en-ch/blog-content/advice/how-to-clean-bike-chain/b29072021.html, « Last update: Mar 23, 2026 »), page support Grizl CF (https://www.canyon.com/en-ch/customer-service/gravel/grizl/grizl-cf/), pièce « SRAM UDH Derailleur Hanger » (https://www.canyon.com/en-ch/gear/bike-parts/spare-wear-parts/sram-udh-derailleur-hanger/10006305.html) ; Park Tool, articles et fiches produits listés aux points 2 à 8 ; PB Swiss Tools (point « Outils »). Dans le navigateur intégré : la page MOTOREX du lubrifiant (bandeau de cookies refusé, « Deny ») et la page Muc-Off du dégraissant.

**Non lus**, parce que Shimano ne les publie qu'en PDF sur si.shimano.com (refusé en ligne de commande, et la consigne interdit d'ouvrir un PDF dans le navigateur) : SI-CN42A-000 (outil d'usure TL-CN42, « 04/26/2013 », https://si.shimano.com/en/pdfs/si/CN42A/SI-CN42A-000-ENG.pdf), SI-0085A-001 (outil TL-RD11, https://si.shimano.com/en/pdfs/si/0085A/SI-0085A-001-ENG.pdf), la remise à zéro du Di2 (https://si.shimano.com/pdfs/information/reference/About_system_power_reset-ENG.pdf), les vues éclatées du RD-M8250 et du FC-RX820. Ce qu'ils contiennent reste **non vérifié**.

## 1. Ta transmission

### 1.1 Les pièces

Références tirées du relevé du 23/10 (`sources-cf8-di2.md` § 3 et § 8), complétées le 30/10 :

| Pièce | Référence | Ce que publient les fabricants |
|---|---|---|
| Dérailleur | RD-M8250-GS (Deore XT Di2) | Fiche Shimano : « Total capacity 36T », « Low sprocket Max. 45T », « Top sprocket Max. 9T Min. 9T », « Teeth 13T » (galets), « UDH standard ✔ », « Built-in battery ✔ » (relevé du 23/10) |
| Batterie | BT-DN320, dans le dérailleur | Voir `montage-cf8-di2.md` § 6.1 |
| Manettes | ST-RX825-R ; gauche ST-RX825-L ou BL-RX825-L | Gauche : à lire sur la pièce (`composants-origine.md`) |
| Cassette | CS-M8200-12, 9-45 | « 9-11-13-15-17-19-21-24-28-33-39-45T », « MICRO SPLINE ✔ » (relevé du 23/10) |
| Chaîne | CN-M8100 (pièce d'usure Canyon, 138 maillons) | Chaîne montée : à lire sur la pièce |
| Attache rapide | SM-CN910-12 | Fiche Shimano, lue le 30/10 : « Compatible chain HG 12-speed », « Note QUICK-LINK for HG 12-speed chain ». Canyon écrit « SM-CN910 », sans « -12 » |
| Pédalier | FC-RX820-1, plateau 40, manivelles 165 en M | « Chain line (mm) 49.7 », « Chainring combination 40T, 42T, 44T, 46T » (relevé du 23/10) |
| Boîtier | SM-BB72-41B (II en pièce d'usure), PF 86,5 | À lire sur la pièce |
| Patte | SRAM UDH | Pièce de rechange Canyon du cadre « Grizl CF \| R126-01 \| 2027 » (relevé du 23/10) |

**Ce montage est-il prévu par Shimano ?** Oui. Tableau C-473, schéma « Di2 with BT-DN320 » (https://productinfo.shimano.com/en/compatibility/C-473), lu à l'écran : batterie « On-board Battery BT-DN320 » ; manettes, groupe « Wireless only spec. » : « ST-RX825-L », « ST-RX825-R » ; dérailleur, « 12-speed » : « RD-M9250-GS », « RD-M8250-GS » ; appareil PC « SM-PCE02 » et « E-TUBE PROJECT Professional » ; mobile « E-TUBE PROJECT Cyclist ». Le renvoi « *2 Wireless pairing without App is not supported. » est placé à côté des ST-R9270 et ST-R8170, pas à côté des ST-RX825 (lecture du schéma).

**Chaîne admise.** DM-MACS010, https://si.shimano.com/en/dm/MACS010/TO_ENSURE_SAFETY : « Always use the CS-M9200 / CS-M8200 / CS-M7200 / CS-M6200 in combination with the CN-M9100 / CN-M8100 / CN-M7100 / CN-M6100. » ; « Other chains cannot be used because the dimensions do not match. » DM-GAFC001, https://si.shimano.com/en/dm/GAFC001/TO_ENSURE_SAFETY, tableau « Crankset / Recommended chain » : « FC-RX820 », « CN-M8100 ». DM-MACN001, https://si.shimano.com/en/dm/MACN001/TO_ENSURE_SAFETY : « CN-M9100 / CN-M8100 / CN-M7100 / CN-M6100 », « SM-CN910-12 », outil d'attache « TL-CN10 », dérive-chaîne « TL-CN29, TL-CN35 ».

### 1.2 Le Di2 sans fil : ce qui fait quoi

**Pas de fil.** DM-GADBR10, https://si.shimano.com/en/dm/GADBR10/install_dual_control_lever : « The ST-RX825 / ST-RX715 is for wireless gear shifting only. It does not support wired shifting. » DM-MARD011, https://si.shimano.com/en/dm/MARD011/name_of_parts, pièces du groupe qui comprend le RD-M8250 : « Link », « Function button », « LED », « Tension pulley », « Guide pulley », « Battery holder », « Lever », « B-screw », « Low limit screw », « High limit screw », « Plate stopper pin », « B-axle ». Le « E-TUBEport » et le fil n'apparaissent que dans le groupe « RD-M9260 / RD-M8260 / RD-M6260 » : **le RD-M8250 n'a pas de port E-TUBE**. Le « Lever » est celui du support de batterie (UM-3K70A, « Pull the lever in the direction of the arrow, then slide the battery holder out », relevé du lot 2). **Aucun levier de stabilisateur ON/OFF** n'est nommé.

**Les pièces de la manette ST-RX825.** UM-0RM0B, https://si.shimano.com/en/um/0RM0B/name_of_parts-merge : « Bracket cover », « Shift switch », « Brake lever », « LED », « Hood button », « Battery holder », « Battery case », « Satellite shifter connection port » ; « The E-TUBE port is not used. Be sure to attach a dummy plug to it. »

**Les boutons, réglage d'usine.**
- Droite, https://si.shimano.com/en/um/0RM0B/rear_shift_switch_operation : « <Shift switch [X]> Shifts to a larger sprocket. » ; « <Shift switch [Y]> Shifts to a smaller sprocket. » Sur la figure, [X] est la palette placée juste derrière le levier de frein, [Y] celle qui est derrière elle (lecture de la figure, à repérer sur la pièce).
- Gauche, https://si.shimano.com/en/um/0RM0B/front_shift_switch_operation : « <Shift switch [X]> Shifts to a larger chainring. » ; « <Shift switch [Y]> Shifts to a smaller chainring. » Ce que font ces boutons sur un mono-plateau sans dérailleur avant : **non publié**. Même page : « The settings for each switch can be changed as follows. For details about changing settings, contact the place of purchase. » Réglages cités : « Reverse the shifting up and shifting down functions for shift switches [X] and [Y] », « Reverse the rear and front shift switches », « Multi-shift mode setting », « Configure the hood button as a shift switch ».
- Bouton du repose-main, https://si.shimano.com/en/um/0RM0B/hood_button_Initial_setting : « The hood button sends signals via the rear derailleur to compatible products. »
- Toujours pédaler, https://si.shimano.com/en/um/0RM0B/gear_shift_operation : « Be sure to rotate the crank while performing all switch operations related to shifting. »
- Après une pause, https://si.shimano.com/en/um/0RM0B/front_shift_switch_operation : « If no switch operations are performed for 30 minutes, shifting will not be performed with the first switch operation after that. Shifting will be performed from the second switch operation. » Côté dérailleur, UM-3K70A : « the rear derailleur switches to the low power consumption mode » (relevé du lot 2, § 6.4).

**Affecter les boutons.** E-TUBE PROJECT Cyclist, https://si.shimano.com/en/um/7J4MA/switch : « Assign functions to the buttons on the left and right switches. » Fonctions de la liste, entre autres : « [Rear shift up] », « [Rear shift down] », « [RD function] » (« Performs the same operation as the function button of the rear derailleur. »), « [Shifting/Adj. mode] » (« Switches between the adjustment mode and regular (gear shifting) mode and switches the AUTO SHIFT mode. »), « [D-FLY Ch. 1] » à « [D-FLY Ch. 4] ».

**Appairage.** Procédure sans application : `montage-cf8-di2.md` § 6.4, non recopiée. Ajouts du 30/10 :
- DM-GADBR10, https://si.shimano.com/en/dm/GADBR10/pairing : « Pairing is required after reinstalling or replacing the dual control levers or rear derailleur. » ; « When pairing, ensure that the product firmware has been updated to the latest version. »
- Numéro de série pour l'application, https://si.shimano.com/en/um/7J4MA/scanning_qr_code, pour « ST-RX825 » : « The product serial ID is marked on the switch unit inside the lever. »
- Mémoire du dérailleur, DM-GADBR10, https://si.shimano.com/en/dm/GADBR10/unpairing : « The rear derailleur can be paired with only one dual control lever on each side (-L / -R). To pair it with another dual control lever, the existing pairing must be canceled. »

**Ce que le dérailleur envoie.** DM-MARD011, https://si.shimano.com/en/dm/MARD011/wireless_function : « Gear position (rear) », « Di2 battery level », « Shift switch battery level », « Adjustment mode », par « Bluetooth ® LE connection or ANT ® connection ».

**La batterie.** Charge, niveau et voyants : `montage-cf8-di2.md` § 6.1 et 6.2. Autonomie, FAQ Di2 de Shimano, question « How many days can I ride on a single charge? (D-6010) » : « Normally, the battery lasts about 10 days without recharging for a professional cyclist who rides 200 km a day, and over a month with normal rides of about 20 km a day, but this can vary with gear shifting frequency and other usage conditions. » ; « Note that using a bicycle connected to E-TUBE RIDE or an external cycle computer via Bluetooth®LE can drain the battery completely in about half the time. » Question NM-6100 : « With frequent use, you can use the battery for about a month on a single charge. » Usure, DM-MARD011, https://si.shimano.com/en/dm/MARD011/NOTICE_FOR_USE : « The battery is an exhaustible item. » ; « If the ambient temperature is low, the battery's usable time will be shorter. » ; « When the battery is completely depleted, charge it as soon as possible. If you leave the battery without charging it, it will cause the battery to deteriorate. »

**Deux réglages de l'application qui concernent ce vélo.**
- Mode E-BIKE. UM-3K70A, https://si.shimano.com/en/um/3K70A/3K70A_e-bike_mode_setting : « This setting is enabled by default, so disable it when using a bicycle other than an E-BIKE. For details on the setting procedures, refer to the user's manual for E-TUBE PROJECT Cyclist. » DM-MARD011, https://si.shimano.com/en/dm/MARD011/cause_remedy, pour « The shifting interval is too long. » : « Is the E-BIKE mode enabled? », « Disable it when using a bicycle other than an E-BIKE. » État sur ton vélo à la livraison : **à lire dans l'application**.
- Type de cassette. DM-MARD011, https://si.shimano.com/en/dm/MARD011/configurable_e_tube_project : « Rear cassette combination settings (RD-M9250 / RD-M8250) », « Switches between the SGS type and GS type. » Ton dérailleur est un GS avec une 9-45, donc le type GS (lecture de ce relevé) : valeur réglée à la livraison **à lire dans l'application**.

### 1.3 Ce qu'il faut lire sur les pièces à la livraison

Voir la section « À lire sur la pièce à la livraison », en fin de relevé.

## 2. Nettoyer et lubrifier la chaîne

### 2.1 Ce que dit Shimano

- DM-MACN001, https://si.shimano.com/en/dm/MACN001/TO_ENSURE_SAFETY : « Clean the chain and QUICK-LINK with an appropriate chain cleaner regularly. » ; « Intervals between maintenance depend on the use and riding circumstances. Never use alkali- or acid-based solvents such as rust cleaners. If those solvents are used the chain or QUICK-LINK might break and cause serious injury. » ; « The chainrings should be periodically washed with a neutral detergent and lubricated. In addition, cleaning the chain and QUICK-LINK with a neutral detergent and lubricating them can be an effective way of extending the life of the chain and QUICK-LINK. » ; « For maximum performance we highly recommend SHIMANO lubricants and maintenance products. »
- DM-MACS010, https://si.shimano.com/en/dm/MACS010/TO_ENSURE_SAFETY : « The sprockets should be periodically washed with a neutral detergent then lubricated. »
- DM-MARD011, https://si.shimano.com/en/dm/MARD011/NOTICE_FOR_USE : « The gears should be periodically washed with a neutral detergent then lubricated. » ; « Do not use the thinners or harsh solvents to clean the products. Such solvents may damage the surface. » ; « Do not clean the bicycle with a high-pressure wash. If water gets into any of the components, operating problems or rusting may result. » ; « When cleaning the product, use a cloth moistened with a diluted neutral detergent. » ; « Periodically clean the shifting unit and lubricate all moving parts (mechanisms). »
- UM-3K70A, https://si.shimano.com/en/um/3K70A/3K70A_NOTICE_FOR_USE-merge : « Wash the bicycle with the battery installed. If you wash the bicycle with the battery removed, water or dirt may adhere to the terminals, which can cause malfunction. »
- DM-GAFC001, https://si.shimano.com/en/dm/GAFC001/TO_ENSURE_SAFETY : « Use a neutral detergent to clean the crank arms and the bottom bracket. Using alkaline or acidic detergents may cause discoloration. » ; « Do not wash the surrounding area of the bottom bracket with a high-pressure wash. Water may enter the bearing section and cause noise or adhesion. »
- Article Shimano « How to Check Your Chain Length », rubrique « Clean regularly » : « I recommend cleaning the chain at least during every second wash. First, get rid of all the superficial dirt on the chain and then use a degreaser. » ; « Once the chain is thoroughly degreased, you can dry it, and then apply fresh chain lube. » ; « To do so, hold the bottle of chain lube against the inside of the chain and keep turning the crank until every chain link has been lubricated. The chain should then be wiped down with a rag to get rid of excess lube. »
- Fréquence chiffrée : **non publiée** par Shimano (« Intervals between maintenance depend on the use and riding circumstances. »).

### 2.2 Ce que dit Canyon

- QSG V02, p.64 « MAINTENANCE / AFTER EVERY RIDE », rubrique « 2 Drivetrain » : quatre pictogrammes, lus avec la légende de la p.62 : « DRY CLEAN », « USE BIKE CLEANER », « LUBRICATE COMPONENT », et le nettoyeur haute pression barré (p.63 : « DON'T USE A PRESSURE WASHER »).
- QSG V02, p.65 « EVERY 2 WEEKS », « 1 Drivetrain components » : pictogrammes « INSPECT », « RETIGHTEN SCREWS, BOLTS & NUTS » et le triangle « ALWAYS USE CORRECT TORQUE » (légende p.62 et p.63).
- Article Canyon (https://www.canyon.com/en-ch/blog-content/advice/how-to-clean-bike-chain/b29072021.html), tableau « Riding type / Frequency » : « Gravel », « after dusty or wet rides » ; « High-pressure water cleaners should never be used on bicycles » ; « Under no circumstances should a chain be soaked in degreaser. If left for too long, the cleaning solution can corrode the metal and cause cracks. » ; « After being cleaned, chains should always be thoroughly dried then lubricated with a high-quality product. Apply a small drop of lube in the joint of each link rather than drenching the chain in oil, and wipe off any excess residue prior to riding. » ; méthode au seau : « fill a bucket with warm water, add a cleaning agent of choice (whether it be a liquid kitchen detergent, degreaser or another bike cleaner), and use a stiff-bristled brush to scrub the chain. »
- Manuel route Canyon 2021, p.84 imprimée (PDF p.44), « CHAIN MAINTENANCE » : « Clean your chain from dirt and lubricant with an oily rag from time to time. There is no need to use special degreasers. » ; « To lubricate the chain, drip the lubricant onto the rollers while you turn the crank. » ; « Let your Canyon then rest for a few minutes so that the lubricant can disperse. » ; « Finally rub off excess lubricant with a rag so that it does not spatter around or attract dirt during riding. » ; « For the sake of the environment, only use biodegradable lubricants. » ; « Make sure that the brake discs, the braking surfaces of the rims or the brake pads remain clear of lubricants. Otherwise, the brakes will fail! »

### 2.3 Ton lubrifiant : MOTOREX

Les brouillons écrivent « Motorex Chainlube WET » (`brouillons/parts/10-avant.html:55`). MOTOREX vend aujourd'hui une « CHAINLUBE FOR WET CONDITIONS » en flacon et une « CHAINLUBE WET SPRAY » (https://motorex.com/en/chainlube-wet-spray--49640). Produit exact : **à lire sur le flacon**. Ce qui suit vaut pour le flacon.

- Page produit, onglet « APPLICATION » (https://motorex.com/en-us/chainlube-for-wet-conditions--49642) : « Ensure the chain is dry and clean before application. If necessary, clean thoroughly with MOTOREX BIKE CHAIN DEGREASER. » ; « Apply MOTOREX CHAINLUBE FOR WET CONDITIONS in three passes to the inner running surface of the chain while slowly turning the crank backward: once on the center of the chain rollers and on both narrow sides of the chain plates. This ensures optimal fluid coverage. Apply sparingly to avoid dripping. » ; « After applying, rotate the crank backward several times to distribute the fluid evenly between the chain links. Allow the fluid to act for several minutes, ideally overnight, so it penetrates all spaces. » ; « Remove excess fluid from the chain surface using a lint-free cloth. Grasp the chain firmly with the cloth and pull it through while turning the crank. » ; « The chain should appear dry on the surface: the fluid remains only inside the gaps, ensuring lubrication while minimizing dirt adhesion on the outside. » ; « After rides in dusty, wet, or muddy conditions, clean the chain surface preventively and reapply lubricant to prevent corrosion. »
- Fiche technique, p.1 : « fully synthetic chain lubricant specially for humid or wet conditions » ; « Warning: Avoid contact with the brakes so that the brake action is not impaired. »

### 2.4 Ton dégraissant : Muc-Off

Les brouillons écrivent « Muc-Off Drivetrain Cleaner » (`brouillons/parts/40-transmission.html:44`). Le produit de la page Muc-Off s'appelle « Bio Drivetrain Cleaner » (https://muc-off.com/products/bio-drivetrain-cleaner). Produit exact : **à lire sur le flacon**.

- Rubrique « HOW TO » : « Shake bottle vigorously » ; « Spray all over the drive chain including cassette, chainrings, chain and derailleurs » ; « Leave for up to 1 minute and agitate with a brush if required. (If you are using with a chain cleaning device, unscrew the trigger sprayer and fill the device with the formula) » ; « After agitation thoroughly rinse off with water making sure all of the formula has been removed » ; « Now apply Bike Protect to disperse moisture before applying a chain lube ».
- Description : « safe for metal, plastic, rubber and seals » ; « Removes all chain oil and wax residue ».
- Mises en garde : « DANGER: May be fatal if swallowed and enters airways. », « H315 - Causes skin irritation. », « H319 - Causes serious eye irritation. »
- Acide ou alcalin, ce que Shimano interdit : **non publié** par la page. À lire sur le flacon ou sur sa fiche de données de sécurité.

### 2.5 Le nettoyeur Park Tool CM-5.3 (geste et outil)

- Fiche, https://www.parktool.com/en-us/product/cyclone-chain-scrubber-cm-5-3 : « Holds 59 mL (2 fl. oz.) of solvent » ; « For best results, use with Park Tool CB-4 ChainBrite™ Degreaser » ; « When turning pedals, hold CM-5.3 body straight with chain to avoid chain coming off sprockets. » ; « Do not use gasoline, petrol, kerosene or other highly volatile or flammable solvents. »
- Geste, https://www.parktool.com/en-us/blog/repair-help/chain-cleaning-with-a-park-tool-chain-scrubber : « Fill the chain cleaner with solvent to the fill line marked on the body of the CM-5.3 or CM-25. » ; « begin turning the cranks of your bicycle backwards for at least thirty revolutions. » ; rinçage à l'eau savonneuse, puis « Wipe off your chain by running it through a clean, dry rag and leave your chain to air-dry ». Le dépôt d'une goutte par rivet est le geste de Park avec son lubrifiant ; pour ton lubrifiant, c'est la méthode MOTOREX (2.3) qui s'applique.

## 3. Mesurer l'usure de la chaîne

- **Shimano, manuels de la chaîne : aucun seuil chiffré.** DM-MACN001-08 n'en donne pas (sections relues le 30/10). UM-0AH0A, https://si.shimano.com/en/um/0AH0A/before_riding_the_bicycle-merge : « Does the chain have deformations or cracks? » ; « Does the chain skip or does unintended gear shifting occur? » UM-3K70A, https://si.shimano.com/en/um/3K70A/3K70A_before_riding_the_bicycle-merge : « Has the chain become elongated? »
- **Shimano, article « How to Check Your Chain Length »**, rubrique « Measuring chain wear » : « You can use a SHIMANO chain gauge to determine whether a chain is still good to go or whether it needs replacement. » ; « Due to normal wear and tear, the chain elements eventually grow apart, so that the teeth of the chain gauge completely fall into the chain. Then, it is time to replace the chain. For SHIMANO chains, it is important to use a SHIMANO chain gauge. Many dealers use chain gauges from other brands which often leads to premature chain replacements. » L'outil Shimano est nommé dans la vue éclatée EV TOOL4-3637C : « TL-CN42 Chain wear indicator ». Sa notice SI-CN42A date de 2013 et n'a pas été lue : son usage sur une chaîne 12 vitesses est **non vérifié**.
- **Park Tool CC-3.2, ton outil.** Fiche, https://www.parktool.com/en-us/product/chain-wear-indicator-cc-3-2 : « 11-to-12-speed chains*: replace at or just before 0.5% » ; « Check with manufacturer for specific replacement instructions » ; « *Use the CC-4.2 for SRAM® Flattop™ and SRAM® T-Type 12-speed chains. » Geste, https://www.parktool.com/en-us/blog/repair-help/when-to-replace-a-chain-on-a-bicycle : « locate the end of the tool with the 0.5 stamp. Install the hook end on a link with inner plates to ensure you're measuring against the roller and not the side plates. Attempt to install the other end into the chain. » ; « If it doesn't go in, your chain is not yet 0.5 percent worn. If it does insert into the chain, it means that your chain is now 0.5 percent longer than when it was new. » Le même article : « Every drivetrain manufacturer has their own specifications, so consult with the manufacturer for the recommended wear level for your system. »
- **Canyon.** QSG V02, p.67 « AFTER 6 MONTHS », « 1 Chain wear » : pictogrammes « INSPECT » et « SEE A MECHANIC IF NECESSARY » (légende p.62), dessin d'un indicateur posé à plat (coche) et d'un indicateur qui entre dans la chaîne (croix). Manuel route 2021, p.85 imprimée (PDF p.44), « CHAIN WEAR » : « With road bikes chains running on derailleur gears are worn out after about 1,200 to 4,000 km (740 to 2,500 miles). » ; « run the chain on the large chainring. Take the chain between your thumb and index finger and try to lift it off the teeth. If you can lift it off clearly, it is severely lengthened and has to be replaced. » ; « There are accurate measuring instruments for precise chain inspection. The chain should be replaced by an expert. » Article Canyon, « When should you replace your chain? » : « Skipping gears under load », « Persistent noise despite cleaning and lubrication », « Visible wear or elongation ».
- **Critère de remplacement pour ta chaîne CN-M8100 : en pourcentage, non publié par Shimano.** Shimano publie un critère d'outil : remplacer quand la jauge Shimano entre complètement dans la chaîne. Le 0,5 % est la valeur de Park pour son CC-3.2, que Park renvoie lui-même au fabricant (voir Contradictions).
- **Cassette et plateau usés.** DM-MACS010 : « If the chain keeps skipping during use, consult the place of purchase. » UM-3K70A, https://si.shimano.com/en/um/3K70A/3K70A_NOTICE_FOR_USE-merge : « If the chain keeps skipping during use, replace the gears and chain at the place of purchase. » DM-GAFC001 : « If the chain keeps coming off the gears during use, replace the chainrings and the chain. » Critère chiffré d'usure de la cassette ou du plateau : **non publié**.

## 4. Remplacer la chaîne

### 4.1 La longueur : méthode Shimano du RD-M8250

DM-MACN001, https://si.shimano.com/en/dm/MACN001/Confirm_chain_length : « Refer to the dealer's manual of the rear derailleur for the method to check the length of the chain. » Pour le RD-M8250, c'est le DM-MARD011, https://si.shimano.com/en/dm/MARD011/check_chain_length :

1. « Join the chain at the largest sprocket. » ; « In order to check the length at the rear of the cassette, join the two ends of the chain at the rear of the cassette as shown in the figure. »
2. « With the zero point of the chain established on the rear of the largest sprocket, the proper final chain length is determined by adding a certain number of links to this resulting chain length. The number of links is dependent on the chain connection method. See the figures. »
3. Figures « QUICK-LINK » : « QUICK-LINK + 5 links » et « QUICK-LINK + 6 links ». Figures « Connecting pin » : « 6 links » et « 7 links ». Les deux figures de chaque paire diffèrent par la façon dont les bouts se terminent au point zéro.

**Lecture des figures QUICK-LINK, 30/10/2026, seconde passe.** Page HTML ouverte dans le navigateur intégré, sans PDF. Les figures sont des dessins SVG intégrés à la page ; ce relevé les a agrandis à l'écran et a lu la place et la couleur de chaque maillon dans le dessin même.

Ce que montrent les figures :
- **Deux couleurs, sans légende.** Les maillons sont orange (#FCD68C) ou bleu clair (#DFF2FC), en alternance. L'attache est grise.
- **Les bouts libres** sont bleu clair, avec un trou vide. L'attache vient s'y engager (« Insert the QUICK-LINK pins between the inner links from both sides », DM-MACN001, 4.4 ci-dessous). Lecture de ce relevé : **bleu clair = maillon intérieur, orange = maillon extérieur**.
- **Le recouvrement.** À chaque goupille, la plaque orange est dessinée par-dessus la plaque bleu clair du maillon voisin (relu à l'écran le 30/10/2026, vague finale) : sur une chaîne, les plaques d'un maillon intérieur sont entre celles des maillons extérieurs (lecture de ce relevé).
- **La disposition.** Au point zéro (le point noir, derrière le grand pignon), un brin de la chaîne arrive par le pignon et continue tout droit, à plat : ce sont les maillons à ajouter, numérotés 1, 2, 3… à partir du point zéro. Chaque numéro est sous un seul maillon, intérieur ou extérieur, en alternance. Juste sous le point zéro, l'autre bout de la chaîne est un maillon bleu clair, intérieur, à bout libre, dans les deux figures.
- **« QUICK-LINK + 5 links ».** Le dernier maillon du brin qui arrive au point zéro, côté pignon, est orange (extérieur). Les maillons 1, 3 et 5 sont bleu clair (intérieurs), 2 et 4 orange (extérieurs). Le 5e, le dernier, est intérieur.
- **« QUICK-LINK + 6 links ».** Le dernier maillon du brin qui arrive au point zéro est bleu clair (intérieur). Les maillons 1, 3 et 5 sont orange (extérieurs), 2, 4 et 6 bleu clair (intérieurs). Le 6e, le dernier, est intérieur.

Lecture de ce relevé :
- **La règle.** 5 maillons quand le maillon qui arrive au point zéro est extérieur, 6 quand il est intérieur. Dans les deux cas, la chaîne finit par deux maillons intérieurs, que relie l'attache.
- **Le comptage.** Un « link » de la figure est un seul maillon, intérieur ou extérieur. L'attache est comptée à part (« QUICK-LINK + »).
- **Le total**, à comparer au compte de l'ancienne chaîne : les maillons de la chaîne neuve de son bout libre au point zéro, plus 5 ou 6, plus 1 pour l'attache.
- **Ce que Shimano ne dit pas** : si un nombre de maillons d'une chaîne fermée compte l'attache. Non publié.

Les figures « Connecting pin » n'ont pas été relues ainsi : la CN-M8100 se ferme par une attache (4.1, plus bas).
4. « For full suspension bikes, check the length of the chain with the suspension in its fully extended, uncompressed position. » Ne concerne pas le Grizl, sans suspension arrière.

Ce que le DM ne dit pas : si la chaîne passe dans le dérailleur pendant la mesure (**non précisé**), et le plateau (la phrase ne parle que du pignon ; ton pédalier n'a qu'un plateau de 40). Park Tool, pour les pignons de 42 dents et plus, mesure sans passer par le dérailleur : « Without passing through the rear derailleur, route the chain over the front ring and the largest rear spocket. » (sic) (https://www.parktool.com/en-us/blog/repair-help/chain-length-sizing, geste seulement).

**Attache, pas de goupille.** DM-MACN001, https://si.shimano.com/en/dm/MACN001/Connection_chain : « Instead of connecting this product with a conventional connecting pin, use a QUICK-LINK to connect the chain. » Pour la CN-M8100, ce sont donc les figures QUICK-LINK (5 ou 6 maillons) qui s'appliquent.

**Résultat pour ton vélo (plateau de 40, plus grand pignon de 45) : nombre final de maillons non publié.** Shimano publie la méthode, pas un nombre. Les 138 maillons de la pièce d'usure Canyon sont la longueur vendue, à raccourcir. L'article Shimano donne une autre voie : « If you know that the old chain was of the correct length originally, you can count the chain links and adjust the new chain accordingly. » Nombre de maillons de la chaîne montée à la livraison : **à lire sur la pièce** (à compter).

Comparaison, RD-M9250 (XTR, même DM) : DM-M9200TIPS, https://si.shimano.com/en/dm/M9200TIPS/RD-M9250-xx_RD-M9260-xx, tableau « Bike type / Number of links added » : « Hardtail bikes », « Full suspension bikes », « 5 to 6 links + a QUICK-LINK ».

**Passage dans la chape.** DM-MARD011, même page : « The rear derailleur plate assembly is equipped with a pin or plate that prevents chain derailment. When routing the chain through the rear derailleur plate assembly, route it so that it is on the rear derailleur body side of the chain derailment prevention plate, as shown in the figure. If the chain is not passed through the correct position, damage may be caused to the chain or the rear derailleur. »

### 4.2 Le sens

DM-MACN001, https://si.shimano.com/en/dm/MACN001/TO_ENSURE_SAFETY : « In order to achieve good gear shifting performance, this chain has a front side and a reverse side and must be fitted in the correct orientation. » ; « The side with the mark shown in the figure is the front (outer side). » Article Shimano : « Make sure that you pull the chain properly through the rear derailleur and that the labeled part of the chain faces toward you on the outside. »

### 4.3 Couper

DM-MACN001, https://si.shimano.com/en/dm/MACN001/Cutting_chain : « Cut the chain if it is too long. » ; « Set the chain correctly. If the chain cutter is used without properly placing the chain, the positioning plate may be damaged. » ; « Push the center of the pin to completely remove the pin from the chain. » Outils Shimano : « TL-CN29 », « TL-CN35 » (https://si.shimano.com/en/dm/MACN001/LIST_OF_TOOLS_TO_BE_USED). À ne pas faire : « If it is necessary to readjust the length of the chain due to a change in the sprocket configuration, etc., cut the chain in a place other than where it has been joined by a QUICK-LINK. The chain cutter will be damaged if the chain is cut at a place where it has been joined by a QUICK-LINK. »

Ton dérive-chaîne Park Tool CT-3.3, fiche https://www.parktool.com/en-us/product/chain-tool-ct-3-3 : « Compatible with all 5-speed to 12-speed bicycle chains* including SRAM® T-Type, SRAM® Flattop™, and Shimano® XTR® 12-speed » ; « Always position the chain onto the floating shelf, not below or above it. »

### 4.4 Poser l'attache QUICK-LINK

DM-MACN001, https://si.shimano.com/en/dm/MACN001/Connection_chain :
1. « Install the QUICK-LINK onto the chain. » ; « Insert the QUICK-LINK pins between the inner links from both sides as shown in the figure. Place so that the arrow on the surface is pointing in the rotation direction of the crank when viewed from the front. »
2. « Secure the QUICK-LINK. » ; « Slide both sides of the QUICK-LINK so that they will be inserted securely. » La figure montre la pince « TL-CN10 », mâchoires marquées « CONNECT » (lu sur la figure).
3. « Make sure that both sides of the QUICK-LINK are inserted securely as shown in the figure. »

Règles, https://si.shimano.com/en/dm/MACN001/TO_ENSURE_SAFETY : « Do not reuse a QUICK-LINK that has been removed. If the QUICK-LINK is reused, there is a risk that it will loosen and become detached, which could cause the rider to lose control of the bicycle and fall. » ; « When replacing the chain with a new one, be sure to replace the QUICK-LINK with a new one as well. » ; « When installing the QUICK-LINK, make sure that the QUICK-LINK pins are inserted securely as far as they will go. » ; « Only use the tool and QUICK-LINK models specified in the table to connect the chain. If an unsuitable QUICK-LINK or tool is used to connect the chain, insufficient connecting force may cause chain separation or skip. »

### 4.5 Déposer l'attache

DM-MACN001, https://si.shimano.com/en/dm/MACN001/Removing_quick_link : « Remove the QUICK-LINK. » ; « Slide both sides of the QUICK-LINK to remove. » Figure : pince « TL-CN10 ». Même manuel : « A SHIMANO original tool is required to remove the QUICK-LINK. Consult your place of purchase or a distributor. » Article Shimano : « A QUICK-LINK should only be opened using the original SHIMANO chain tool TL-CN10. »

Ta pince Park Tool MLP-1.2, fiche https://www.parktool.com/en-us/product/master-link-pliers-mlp-1-2 : « Compatible with 5-to-13-speed derailleur chains that use a master link, including SRAM® eTap® AXS®, Shimano® XTR® 12-speed, and Campagnolo® Ekar 13-speed. » Voir Contradictions. Le geste, sur la même page, relue le 30/10/2026 avec curl (texte de présentation ; le prix affiché n'est pas recopié) : « Simply insert the specially-shaped jaws into the master link. Then squeeze the handles to open or pull the handles to close the link. » Une notice PDF existe (https://www.parktool.com/assets/doc/product/MLP-1.2_instructions.pdf), non lue.

### 4.6 Outils de ce point

Shimano : TL-CN10 (attache), TL-CN29 ou TL-CN35 (dérive-chaîne). Tes outils Park Tool : MLP-1.2 et CT-3.3 (voir « Outils de Lamine »).

## 5. Démonter et remonter la cassette CS-M8200-12, 9-45

**Outils.** DM-MACS010, https://si.shimano.com/en/dm/MACS010/LIST_OF_TOOLS_TO_BE_USED : « TL-LR10 », « TL-LR15 », « TL-LR021 », « TL-SR24 », « Adjustable wrench ». Vue éclatée EV CS-M8200-12-5110 : « TL-LR021 Lock ring tool for 9T » (Y0T498030), « TL-SR24 Sprocket remover » (Y13098730), « TL-LR15 Lock ring tool for 10T » (Y12009230). Pour ta 9-45, c'est le **TL-LR021** : DM-M9200TIPS, https://si.shimano.com/en/dm/M9200TIPS/compatible_MICRO_SPLINE : « TL-LR021 for 9-45T Cassette ».

**Dépose**, https://si.shimano.com/en/dm/MACS010/cassette_sprocket_removal, rubrique « 9-45T » :
1. « Remove the lock ring. » ; « Place the TL-SR24 on a sprocket smaller than the middle sprocket to secure the assembly, as shown. If the TL-SR24 is set on a sprocket inward from the middle sprocket, it will not be stable. » Figure : « 9T + lock ring unit ».
2. « Warning: When removing the lock ring, wear gloves and eye protection, and gradually apply force. A sudden release of resistance on the lock ring may cause serious injury. »
3. « Keep TL-LR021 perpendicular to the smallest sprocket during use. »
4. « Remove the cassette from the freewheel body unit. »

**Roue déposée, côté frein.** DM-GADBR01-11, page HTML https://si.shimano.com/en/dm/GADBR01/TO_ENSURE_SAFETY, lue le 30/10/2026 dans le navigateur intégré, après « Be sure to also inform users of the following: » : « When the bicycle wheel has been removed, it is recommended that pad spacers are installed. Do not depress the brake lever while the wheel is removed. If the brake lever is depressed without the pad spacers installed, the pistons will protrude further than normal. If that happens, consult a place of purchase. » Même consigne au site, 2.2 (`src/parts/20-freins.html`, DM-GADBR01 en PDF) et 1.5 (Canyon QSG V02 p.15, encadré barré, `src/parts/11-montage.html`). La roue arrière reste déposée de la dépose de la cassette à sa pose.

Sens de dépose : le texte ne le dit pas. Figure de la rubrique « 9-45T » (dessin SVG de la page, relu à l'écran le 30/10/2026) : la clé à molette coiffe le TL-LR021 au centre de la cassette, son manche part vers la gauche, et une flèche pousse le bout du manche vers le bas. Le fouet TL-SR24 part vers le haut et la droite, sans flèche. La cassette est vue de face, petit pignon vers le lecteur. Lecture de ce relevé : sur la figure, l'outil tourne dans le sens inverse des aiguilles d'une montre. Figure relue à l'écran le 30/10/2026 (vague finale) : la clé coiffe l'outil engagé sur le petit pignon, au centre, les grands pignons derrière. Sens à confirmer sur la pièce, la cassette vue du côté du petit pignon, comme sur la figure.

**Pose**, https://si.shimano.com/en/dm/MACS010/installation_cassette_sprocket, rubrique « 9-45T » :
1. « Place all of the sprockets other than the smallest sprocket on the freewheel body unit. » ; « Place the sprockets in descending order from the largest sprocket. » ; « Align the wide groove section of the freewheel body unit with the wide convex section of the cassette. » ; « The marked side of the sprockets must be facing outward. »
2. « Place the smallest sprocket. » ; « Place the sprocket so that the wide section on the inner side of the smallest sprocket is aligned with the wide section of the second sprocket. » ; « The smallest sprocket and the lock ring are combined into a single part. »
3. « There are sprocket alignment marks for 9T (smallest sprocket), 11T, and 13T. Assemble so that the marks of each sprocket are aligned. »
4. « Tighten the lock ring. » **« 30 - 50 N·m »**. « Keep TL-LR021 perpendicular to the smallest sprocket during use. » La figure montre le TL-LR021 entraîné par une clé à molette (lu sur la figure).

Sécurité, https://si.shimano.com/en/dm/MACS010/TO_ENSURE_SAFETY : « Install the sprockets with the wide sections (protrusions and grooves) aligned. If the lock ring is tightened with the sprockets improperly positioned, the splines on the sprockets may be damaged during tightening. »

**Serrer au couple avec le TL-LR021 : non publié.** Shimano dessine une clé à molette ; la taille du six-pans de l'outil, et s'il accepte un carré de clé dynamométrique, ne sont pas publiés : **à lire sur l'outil**.

**Repères des pignons de la CS-M8200 9-45**, https://si.shimano.com/en/dm/MACS010/sprocket_pattern, colonne « Mark » : 9 « A », 11 « D », 13 « E », 15 « F », 17 « N », 19 « Q », 21 « V », 24 « J », 28 « K », 33 « D », 39 « E », 45 « H ». Entretoises dessinées : « Sprocket spacer (thin) », « Sprocket spacer (thick) », « Sprocket spacer (thick) ». Vue éclatée : « Lock ring with sprocket 9T A » (Y0T498010) ; entretoises Y0T49809T de 0,95 millimètre et Y0T49810T de 1,95 millimètre ; « Adhesive ring » (Y0GX01500). Quelle entretoise va où : à lire sur la figure du DM et sur la pièce.

**Bague adhésive**, https://si.shimano.com/en/dm/MACS010/replace_adhesive_ring : « Remove the old adhesive ring. » ; « Clean where the adhesive ring was affixed and rinse it with water. » ; « Use neutral detergent for cleaning. » ; « The adhesive force weakens if there is any dirt, water, or oil on the surface where the adhesive ring was affixed. » ; « Firmly press down on the adhesive ring so that it adheres firmly to the mating face of the cassette. »

**Corps de roue libre.** Fiche Shimano de la cassette : « MICRO SPLINE ✔ » et « TL-LR021, Lock ring tool for 9-45T is compatible with 12mm E-THRU. » (relevé du 23/10). La page Canyon des roues GR 30 CF parle d'un corps Micro Spline pour cassette « with a 10T smallest sprocket » (relevé du 23/10, Contradictions). Passage du TL-LR021 sur l'axe et les embouts du moyeu DT Swiss 350 : **non publié**.

**Graisse sur le filetage.** Shimano ne la mentionne pas pour le 9T à contre-écrou intégré : **non publié**. Park Tool, geste général : « Grease the threads of the lockring and thread the lockring into the freehub. » (https://www.parktool.com/en-us/blog/repair-help/cassette-removal-and-installation).

Couple de 30 à 50 N·m, déjà relevé (DM-MACS010) ; Canyon dessine 40 Nm sur un pictogramme du manuel des roues (`montage-cf8-di2.md`, Contradictions, point 8).

## 6. Régler le dérailleur Di2 RD-M8250

L'ordre du DM-MARD011 : poser le dérailleur, vérifier la longueur de chaîne, poser la chaîne, puis « Adjusting the B-screw », « Shifting adjustment », « Adjusting the low / high limits ». Outils du DM, https://si.shimano.com/en/dm/MARD011/LIST_OF_TOOLS_TO_BE_USED : « TL-EW300 », « 2 mm hexagon wrench », « 3 mm hexagon wrench », « 5 mm hexagon wrench », « Cross head screwdriver [#2] », « Slotted screwdriver ».

### 6.1 Pose sur la patte

https://si.shimano.com/en/dm/MARD011/installation_rear_derailleur : « The rear derailleur will not shift properly if the derailleur hanger is not straight. Use TL-RD11 to check whether the derailleur hanger is straight or not. » ; « Be careful not to insert the B-axle in the derailleur hanger at an angle. In addition, be sure to install the rear derailleur so that the stopper plate contacts the B-tension stop with no gap in between. » ; axe B **« 10 - 12 N·m »**, clé hexagonale de 5 lue sur la figure (relevé du 23/10). « Periodically check to make sure that there is no gap between the B-tension stop and the stopper plate. If there is a gap between these two parts, problems with shifting performance may occur. »

### 6.2 Vis B

https://si.shimano.com/en/dm/MARD011/adjust_rear_derailleur, « Adjusting the B-screw » :
1. « Turn the crank arm forward and shift the chain to the largest sprocket. » Note : « If there is interference between the sprocket and plate when shifting, tighten the B-screw to a position that eliminates the interference. »
2. « Adjust the B-screw. » ; « Align the contour of the outer plate with the tip of the tallest tooth on the largest sprocket. » Icône de l'outil sur la figure : six-pans de 2 (lu sur la figure).
3. « Turn the crank arm and shift through all the gears to ensure the shifting is smooth. »

Cote en millimètres : **non publiée** par Shimano. Le DM-MARD011 ne parle ni d'un outil de réglage du galet fourni, ni d'une règle propre à la patte UDH.

### 6.3 Butées basse et haute (le RD-M8250 en a)

Même page, « Adjusting the low / high limits » :
- « Adjust the low limit. » ; « Shift the rear derailleur to the largest sprocket. » ; « Tighten the low limit screw until it just touches the low limit stopper. »
- « Adjust the high limit. » ; « Shift the rear derailleur to the smallest sprocket. » ; « Tighten the high limit screw until it just touches the high limit stopper. »
- Icône de l'outil sur les deux figures : six-pans de 2 (lu sur la figure).
- Ce qui arrive si elles sont mal réglées : « Shifting to the smallest or largest sprocket is not possible. Even if the shifting is performed, the gear may shift back by one gear after approximately 5 seconds. » ; « Shifting noise does not stop. » ; « The battery level drops quickly because an undue load is being placed on the motor. » ; « The motor may be damaged due to overload (irreparable). » ; « The chain will become derailed from the sprocket and damage the rear derailleur, wheel, frame, etc. »
- « Tip: During shifting, the rear derailleur may temporarily move to a position other than the target position. This ensures accurate shifting, and the rear derailleur will stop at the target position after the move is complete. »
- DM-MARD011, NOTICE : « Be sure to adjust the high limit screw and the low limit screw according to the instructions given in the adjustment section. If these instructions are not observed, the chain may become clamped between the spokes and the largest sprocket and the wheel may lock, or the chain may fall off the small sprocket. »

### 6.4 Le mode réglage (« Shifting adjustment »)

Même page :
1. « Shift the rear derailleur to the fifth gear position from the largest sprocket. » Sur ta 9-45 (45, 39, 33, 28, 24…), c'est le pignon de 24 dents, et le quatrième est le 28 (déduction de la liste des dents ; Shimano ne nomme pas le pignon).
2. « Switch the system to adjustment mode. » ; « Press and hold either the function button on the rear derailleur or switch (A) on the shift switch for 2 to 5 seconds, until the LED turns solid yellow. The LED lights solid yellow when the system switches to adjustment mode. » ; « Make sure to switch the system to the adjustment mode with the wheels stopped. Your fingers can be seriously injured if caught. » ; « Switch the system to the adjustment mode after confirming that the rear derailleur can perform shifting. »
3. « Press switch (X) while turning the crank arm, and move it to the position where the chain makes contact with the fourth gear and a subtle noise is heard. » ; « Tip: The derailleur can adjust 18 steps inward and 18 steps outward from the initial position, for a total of 37 positions. » ; « In adjustment mode, the guide pulley will overrun slightly, then move back in an exaggerated manner so that you can check the adjustment direction. When checking the positions of the guide pulley and the gear, perform the check when the rear derailleur has come to a stop. » ; « If a noise is not heard when the guide pulley is moved at the fifth gear, perform the same adjustment around the third or fourth gear. »
4. « Press shift switch (Y) 5 times, and move the guide pulley five steps toward the smallest sprocket. » ; « This position will serve as the target for adjustment. »
5. « Switch the system back to normal mode. » ; « Press and hold the function button of the rear derailleur for 0.5 seconds or longer, or switch (A) of the shift switch for 2 seconds or longer. » ; « When the shifting system switches back to the normal mode, the LED turns off. »
6. « Shift to each gear and check that no noise is generated at any sprocket position. » ; « If fine adjustment is needed, switch back to adjustment mode and readjust the rear derailleur. »

Tableau des modes, https://si.shimano.com/en/dm/MARD011/switch_operation_mode, ligne « Di2 » : « Switching to adjustment mode », « Press and hold (for 2 seconds or longer) », « Solid yellow » ; « Switching to normal mode », « Press and hold (for 0.5 seconds or longer) », « Adjustment mode », « Off ».

### 6.5 Par les manettes

- Le « switch (A) » de la figure du DM-MARD011 est dessiné sur une commande de VTT, pas sur une ST-RX825 (lu sur la figure).
- UM-0RM0B, https://si.shimano.com/en/um/0RM0B/shift_adjust_mode : « Press and hold the shift switch assigned to the mode switch function for 2 to 5 seconds to switch the mode. » ; « For the setting procedure, contact your place of purchase or a distributor. »
- Bouton qui porte cette fonction sur ta ST-RX825 à la livraison : **non publié**. Dans E-TUBE PROJECT Cyclist, la fonction s'appelle « [Shifting/Adj. mode] » (1.2). Sans elle, le bouton de fonction du dérailleur suffit.
- En mode réglage, ce que font [X] et [Y] de la ST-RX825 : **non publié**. Le DM-MARD011 dessine « switch (X) » et « shift switch (Y) » sur une commande de VTT, comme « switch (A) » (figures relues à l'écran le 30/10/2026, vague finale) ; UM-0RM0B ne donne [X] et [Y] qu'en mode normal, page « Rear shift switch operation (default setting) » (https://si.shimano.com/en/um/0RM0B/rear_shift_switch_operation) ; « Switching to the adjustment mode » (https://si.shimano.com/en/um/0RM0B/shift_adjust_mode) ne parle que de la touche qui porte la fonction de mode. Déduction de ce relevé : (X) est la palette [X] de la manette droite, celle qui passe sur un plus grand pignon, et (Y) la palette [Y]. Contrôle sur le vélo : le DM fait aller le galet vers le quatrième pignon avec (X) et « five steps toward the smallest sprocket » avec (Y), et il le fait dépasser à chaque appui « so that you can check the adjustment direction » (étape 3 ci-dessus) ; si le galet part dans l'autre sens, prendre l'autre palette. Les fonctions des palettes ont pu être inversées à la livraison (« Reverse the shifting up and shifting down functions for shift switches [X] and [Y] », 1.2).

### 6.6 Par l'application E-TUBE PROJECT Cyclist

https://si.shimano.com/en/um/7J4MA/gearbox_adjustment, « Adjusting the rear derailleur » : « You can adjust the gear shifting of the rear derailleur. It is necessary to turn the crank when performing adjustment. » ; « Tap the current setting area of [Rear shifting unit] on the maintenance screen. » ; « If the battery charge is low, a confirmation screen is displayed and you cannot perform adjustment. » ; « Be sure to perform adjustment while turning the crank. » ; « Tap [Done]. » Méthode de l'application : « Move the chain to the 5th sprocket. » ; « Move the guide pulley toward the inside until the chain touches the 4th sprocket and makes a slight noise. » ; « Move the guide pulley toward the outside by 4 steps (5 steps for MTB and RD-R9250/RD-R8150) to the target position. » Le RD-M8250 est un dérailleur VTT : 5 crans, comme dans le DM-MARD011 (lecture de ce relevé).

Débrancher ensuite : « Disconnect the connection between E-TUBE PROJECT Cyclist and the rear derailleur when not using E-TUBE PROJECT Cyclist. The rear derailleur does not shift when connected to E-TUBE PROJECT Cyclist. » (DM-MARD011, NOTICE).

### 6.7 Galets et axe B (au-delà du débutant, pour mémoire)

https://si.shimano.com/en/dm/MARD011/replace_pulleys : « The pulleys do not have a specific direction of rotation. » ; « 2.5 - 5 N·m » pour chaque vis de galet. https://si.shimano.com/en/dm/MARD011/replacement_of_mounting_screw : remplacement de l'axe B, graisse « Premium Grease(Y04110000) » sur « the side of the B-axle collar ». DM-MARD011, NOTICE : « If there is a large amount of excess play in the pulleys and extra noise is generated while riding, replace the pulleys at your place of purchase. »

## 7. La patte UDH

- **Présence sur ce cadre** : pièce de rechange Canyon « SRAM UDH Derailleur Hanger », « Contents 1x SRAM Universal Rear Derailleur Hanger », compatible « Grizl CF \| R126-01 \| 2027 » (relevé du 23/10, page https://www.canyon.com/en-ch/gear/bike-parts/spare-wear-parts/sram-udh-derailleur-hanger/10006305.html relue le 30/10). Shimano : « UDH standard ✔ » pour le RD-M8250-GS.
- **Contrôle, Shimano.** DM-MARD011 : « Use TL-RD11 to check whether the derailleur hanger is straight or not. » (6.1) ; NOTICE : « If shifting adjustments cannot be carried out adequately, the rear dropout may not be properly aligned. Use the SHIMANO TL-RD11 to check and align the rear dropout. » EV TOOL4-3637C : « TL-RD11 Dropout alignment tool ».
- **Contrôle, SRAM**, manuel UDH Rev C, p.3 : « Confirm the hanger is seated in the bicycle frame hanger pocket or is against the frame stop tab before applying torque to the UDH hanger bolt. » ; « Confirm the hanger has not moved after applying torque and is secure in the bicycle frame. » P.11 : « Regularly check and confirm the UDH hanger is tight and has not moved before and after riding the bicycle. »
- **Pose d'une patte neuve, SRAM** (p.6 à 9) : « Apply grease ONLY to the thru axle threads. Do NOT apply grease to the UDH hanger or the UDH bolt threads. » ; « Rotate the UDH hanger forward until it is completely seated in the hanger pocket or contacts the rotational stop tab. » ; « Install the frame-specific UDH washer. » ; « Slowly rotate the bolt clockwise until you find the start of the thread. Once engaged, rotate counterclockwise and tighten the bolt to the specified torque. The UDH hanger bolt is left-hand threaded. » ; « A reversible (left-hand and right-hand thread) torque wrench MUST be used to ensure proper left-hand thread bolt torque. » Figure p.9 : clé hexagonale de 8 et **« 25 N·m (221 in-lb) »**. P.4 : « We recommend that you have a qualified bicycle mechanic install your SRAM components. »
- **Ta TW-6.2 et le filetage à gauche**, fiche https://www.parktool.com/en-us/product/ratcheting-click-type-torque-wrench-tw-6-2 : « Reads and registers torque values for both left hand and right hand threading » ; « Torque range: 10 to 60 Newton meters ».
- **Redresser une patte UDH : non publié** par SRAM, Shimano et Canyon. Le DAG-3 de Park Tool, fiche https://www.parktool.com/en-us/product/derailleur-hanger-alignment-gauge-dag-3 : « Fits low-clearance thru-axle derailleur hangers and Shimano® Direct Mount hangers » ; la fiche ne nomme pas l'UDH. Geste Park avec son outil (https://www.parktool.com/en-us/blog/repair-help/rear-derailleur-hanger-alignment) : « If three points 90 degrees apart are within 3 mm, the hanger is aligned. » ; « If a hanger has been subject to repeated bending from impact or attempted realignment, it may fail during the alignment process. In that case, you will need to look into replacement. »
- **Canyon, texte général** : voir Contradictions (manuel route 2021, graisse et 1,5 Nm).

## 8. Pédalier et boîtier

**Contrôles et couples officiels utiles au débutant**, DM-GAFC001-06, https://si.shimano.com/en/dm/GAFC001/TO_ENSURE_SAFETY :
- « Check that there are no cracks in the crank arms before riding the bicycle. If there are any cracks, the crank arm may break and you may fall off the bicycle. »
- « The two left crank arm screws should be tightened alternately in stages rather than each fully tightened at once. Use a torque wrench to check that the tightening torques are within the range of 12 - 14 N·m. Also, after riding approximately 100 km (60 miles), use a torque wrench to re-check the tightening torques. Thereafter, continue to check the tightening torques periodically. »
- « Re-checking the tightening torque of the crank arm is necessary when the crank arm is subjected to strong blows from a fall. »
- « Check that there is no excess play or looseness in any fastening sections before riding the bicycle. Also, be sure to retighten the crank arm and pedals at periodic intervals. »
- « If you feel any excess play in the bearing section, the bottom bracket should be replaced. »
- « If a squeaking noise is heard coming from the bottom bracket axle and the left crank arm connector, apply grease to the fastening section, then tighten it to the specified torque. »
- Pédales : « Tightening torque is 35 - 55 N·m. The right crank arm has a right-hand thread, and the left crank arm has a left-hand thread. »

**Pose de la manivelle gauche**, https://si.shimano.com/en/dm/GAFC001/install_remove_crank : capuchon « 0.7 - 1.5 N·m », outil « TL-FC16 / TL-FC18 » (lu sur la figure) ; « Set the stopper plate in the direction shown in the figure and push it in. » ; « Check that the plate pin is securely inserted. » ; « Tighten the left crank arm screws alternately until the two mounting screws reach the specified torque. » ; « 12 - 14 N·m », icône six-pans de 5 sur la figure (lu sur la figure).

**Plateau du FC-RX820**, https://si.shimano.com/en/dm/GAFC001/replace_chainring : « With the marked side facing outward, set the chainring so that the alignment tab is positioned under the crank arm. » ; vis de plateau **« (FC-RX820 / FC-RX810) » « 12 - 16 N·m »** (« 16 - 17 N·m » est la valeur des FC-RX610 / FC-RX600). Empreinte des vis : à lire sur la pièce (la liste d'outils du DM cite une clé « Hexalobular [#30] »).

**Boîtier SM-BB72-41B : un travail d'atelier, selon ce que disent les sources.** DM-GAFC001, https://si.shimano.com/en/dm/GAFC001/LIST_OF_TOOLS_TO_BE_USED, « SM-RS500-PB / SM-BB72-41B » : « TL-BB12 », « TL-BB13 ». https://si.shimano.com/en/dm/GAFC001/install_remove_bottom_bracket : « Use a bottom bracket compatible with a shell width of 86.5 mm. » ; « Press-fit until there is no more gap between the bottom bracket and the bottom bracket shell. » ; dépose au maillet souple ; « Do not reuse the cups as they can be damaged during removal. » Le manuel utilisateur UM-1NJ0A, https://si.shimano.com/en/um/1NJ0A/1NJ0A_IMPORTANT_NOTICE-merge : « Contact the place of purchase or a distributor for information on installation, adjustment, and replacement of the products which are not found in the user's manual. A dealer's manual for professional and experienced bicycle mechanics is available on our website ». Contrôles avant chaque sortie, https://si.shimano.com/en/um/1NJ0A/1NJ0A_inspection_prior_to_each_ride-merge : « Are there any cracks in the crank arms? » ; « Is the pedaling performance smooth? » ; « Is there looseness in the component parts? » ; « Do any abnormal noises occur while riding? »

**Canyon.** QSG V02, p.66 « EVERY MONTH », « 3 Pedals, Crank & Bottom Bracket » : pictogrammes « CHECK BEARING CLEARANCE », « RETIGHTEN SCREWS, BOLTS & NUTS », « ALWAYS USE CORRECT TORQUE », « GREASE COMPONENT », « SEE A MECHANIC IF NECESSARY » (légende p.62 et 63). Manuel route 2021, p.30-31 imprimées (PDF p.17) : « Press Fit PF-86 mm being used preferably. » ; « Common cartridge bearings can be mounted directly into the bottom bracket shell of all models with high-grade grease. Observe the torque specifications of the bottom bracket manufacturer. »

**Campagne d'inspection des manivelles Shimano** (DM-RAFC012-02, https://si.shimano.com/en/dm/RAFC012/inspection_model) : « FC-R9100 », « FC-R9100-P », « FC-9000 », « FC-R8000 », « FC-6800 ». Le FC-RX820 n'est pas dans la liste.

## 9. Dépannage Di2 (pages Shimano seulement)

### 9.1 Voyants

| Où | Ce que tu vois | Sens | Source |
|---|---|---|---|
| Dérailleur, un clic sur le bouton de fonction | vert fixe / vert clignotant / rouge fixe / éteint | « Solid green: 51 - 100% », « Flashing green: 26 - 50% », « Solid red: 1 - 25% », « Off: 0% » | DM-MARD011, switch_operation_mode |
| Dérailleur, appui de 0,5 à 1,9 s | bleu clignotant | « Bluetooth ® LE connection mode » ; UM-3K70A : « Press the function button until the LED flashes blue. The bicycle side is ready to connect. » ; « When disconnecting, cancel the Bluetooth ® LE connection from the smartphone. (The bicycle will switch from the connection mode to the normal operation mode.) » | DM-MARD011 ; https://si.shimano.com/en/um/3K70A/3K70A_connect_to_smartphone |
| Dérailleur, appui de 2 s ou plus | jaune fixe | mode réglage ; retour : « Off » | DM-MARD011 |
| Dérailleur, appairage | bleu fixe, bref clignotement bleu, puis vert clignotant | « lights solid blue », « quickly flashes blue then returns to solid blue », « When the LED flashes green several times, pairing is complete. » | DM-MARD011, system_pairing (`montage-cf8-di2.md` § 6.4) |
| Dérailleur, pendant un passage | rouge clignotant | « The battery level may be too low to perform shifting. » | DM-MARD011, cause_remedy |
| Manette, deux boutons 0,5 s | vert / rouge / éteint | « 11% - 100% Solid green », « 1% - 10% Solid red », « 0% Off » | https://si.shimano.com/en/um/0RM0B/shift_switch_battery_level |
| Application, écran « Status » | rouge clignotant / vert / « - » | « flashing red: battery level at 10% or less; green: sufficient battery level; -: battery level not retrieved » (piles de la manette) | https://si.shimano.com/en/um/7J4MA/status |
| Chargeur EC-DN100 | orange, voyant d'erreur | `montage-cf8-di2.md` § 6.1 | UM-7KZ0A |

Sortir du mode de connexion sans avoir connecté de téléphone : **non publié** (le tableau du DM-MARD011 ne donne un retour au mode normal que depuis le mode réglage, relu le 30/10/2026, vague finale). Qu'un bleu clignotant pendant l'entrée en mode réglage veuille dire un appui relâché trop tôt (moins de 2 s) est une lecture de ce tableau par ce relevé.

La FAQ « The indicator LED is flashing red. (S-6900) » parle d'un vélo électrique (« An error or warning has occurred in the E-BIKE. ») : elle ne s'applique pas à ce vélo.

### 9.2 Les vitesses ne passent pas

DM-MARD011, https://si.shimano.com/en/dm/MARD011/cause_remedy, symptôme « Shifting is not performed. » :
- « Is the pairing correct? », « Perform system pairing with a wireless connection or E-TUBE PROJECT Cyclist. »
- « Is there sufficient charge remaining in the battery? », « Charge the battery and check again. »
- « Shifting is not performed when the switch is next operated if a certain amount of time has elapsed since the last time shifting was performed. », « Operate the shift switch again while rotating the crank. The rear derailleur will operate slightly and shifting will become possible again. »
- « Is there sufficient charge remaining in the battery of the shift switch? », « Check the battery level of the shift switch, and replace the battery if insufficient charge remains. »
- « The firmware may be temporarily unable to operate. », « Remove the battery, and install it again. »
- Symptôme « No shifting is performed in any gear. » : « The shifting position may be misaligned. », « Use E-TUBE PROJECT Professional to conduct an error check. » (logiciel des revendeurs).
- Symptôme « A sound is heard when the rear derailleur shifts or operates. » : « The rear derailleur has a protection function to protect it from damage if it receives a strong impact. » ; « Perform shifting adjustment. » (6.4).
- Symptôme « The shifting interval is too long. » : batterie, ou mode E-BIKE à désactiver (1.2).
- Application connectée : « The rear derailleur does not shift when connected to E-TUBE PROJECT Cyclist. » (DM-MARD011, NOTICE).
- Batterie vide : « When the battery is completely drained, the derailleurs are fixed at the last gear position. » (switch_operation_mode).
- Un rapport refusé, FAQ « I cannot shift into a certain gear. (NP-5051) » : « Gear position control may be engaged, depending on the product. Gear position control is a program that prevents shifting into gears that would lower the chain tension. »
- Appairage fait mais rien ne passe, https://si.shimano.com/en/um/7J4MA/failure_in_pairing : « The shifter/switch may have been paired with another rear derailleur and motor unit. » ; « Check whether the ID displayed in E-TUBE PROJECT is the same as the product serial ID marked on the product. » ; « Disconnect E-TUBE PROJECT. Gear shifting cannot be performed while E-TUBE PROJECT is connected. »

### 9.3 Niveau de la batterie

Voir 9.1 et `montage-cf8-di2.md` § 6.2. Batterie qui se vide vite, FAQ NM-6100 : « If you feel your battery is draining really fast, updating the firmware to the latest version using the latest version of E-TUBE PROJECT may resolve the issue. » ; « Please check the battery consumption at your local dealer that has SM-PCE02. » DM-MARD011, NOTICE : « Using the rear derailleur communication function without disconnecting the connection to E-TUBE PROJECT Cyclist increases battery consumption. » Charge qui échoue, DM-MARD011, https://si.shimano.com/en/dm/MARD011/cause_remedy, relu le 30/10/2026 (vague finale), deux symptômes distincts. « Cannot charge. » : « Is the USB cable connected securely? », « Connect the USB cable securely, and charge the battery again. If charging is still not performed, check whether the USB cable is damaged. » ; « The battery may have reached the end of its life. », « Replace the battery with a new one. » ; « Is the battery fully charged? », « The charge indicator of the battery charger turns off when the battery is fully charged, but this is normal. » « The error indicator flashes while charging. » : « The current may be insufficient for charging. », « Use an AC adapter with a current capacity higher than 1.5 A that is compatible with a USB port. If you are using a USB hub, reconnect the USB cable to the AC adapter directly. » L'adaptateur de plus de 1,5 A ne répond qu'au voyant d'erreur.

### 9.4 Réappairer

- Annuler d'abord : DM-MARD011, system_pairing : « If you want to pair a rear derailleur that has already been paired with a different shift switch, use E-TUBE PROJECT to cancel the pairing with the original shift switch. » DM-M9200TIPS (XTR) : « Note: Before re-pairing, the shift switch and rear derailleur must be unpaired with E-TUBE PROJECT. »
- Dans l'application, https://si.shimano.com/en/um/7J4MA/scanning_qr_code : « To cancel a pairing, tap the product serial ID display of the shifter/switch to cancel, then tap [Yes] on the confirmation dialog that is subsequently displayed. »
- Puis la procédure sans application (`montage-cf8-di2.md` § 6.4) ou par l'application (lecture du code 2D ou saisie du numéro de série).
- Échec, https://si.shimano.com/en/um/7J4MA/failure_in_pairing : « In particular, check for "O" being mistaken for "0 (  )" or "1" being mistaken for "l". » ; « The letter "O" is not used in the product serial ID. » La solution de secours « Pairing can also be performed with a wired connection. » demande un fil branché au dérailleur (« Three electric wires are required. ») : le RD-M8250 n'ayant pas de port E-TUBE, elle ne s'applique pas à ce vélo (déduction).

### 9.5 Les piles CR1632

Contrôle et remplacement : `montage-cf8-di2.md` § 6.3. Durée, FAQ NM-6100, tableau « Model Name / Approximate Usage Period » : « ST-RX825 », « 3 years ». Rangement, DM-GADBR10, NOTICE : « Remove the coin batteries if you do not use them for a long period. » ; « When the coin batteries are depleted, remove them immediately. » ; « When using after a long period of non-use, be sure to replace the coin batteries with new ones. »

### 9.6 Micrologiciel par E-TUBE PROJECT

- DM-MARD011, https://si.shimano.com/en/dm/MARD011/etube_project : « E-TUBE PROJECT is needed to configure the settings and update firmware. » ; « If your version of E-TUBE PROJECT and the firmware for each component are not up to date, there could be problems operating the bicycle. Check the version and update them to the latest ones. » Version minimale : « Firmware version 4.0.0 or later » (UM-3K70A et UM-0RM0B, spécifications).
- Vérifier, FAQ NP-6021 : « Start the E-TUBE PROJECT app and check the firmware status of each unit. If you can update to the latest firmware, [UPDATE AVAILABLE] is displayed. Please update the firmware in a place with a good wireless environment. »
- Dérailleur, sans fil, https://si.shimano.com/en/um/7J4MA/updating_firmware : « Do not operate your smartphone during a firmware update. » ; « Leave your smartphone near the wireless unit and do not move it away while the firmware is updating. » ; échec : « it is necessary to use the dealer software (E-TUBE PROJECT Professional) to restore the firmware. Contact the place of purchase. » (https://si.shimano.com/en/um/7J4MA/RESTORE_FIRMWARE).
- **Manettes ST-RX825 : pas de mise à jour sans fil.** FAQ D-7020 : « Wireless firmware update is not available for the wireless shifter/switch due to its product specifications. Use E-TUBE PROJECT Cyclist to update the firmware over a wired connection or use E-TUBE PROJECT Professional and SM-PCE02 to update the firmware. Contact your place of purchase or a distributor. » UM-7J4MA, https://si.shimano.com/en/um/7J4MA/upload_wireless_shifting_lever : « It is necessary to perform an update via a wired connection to units of the bicycle such as the rear derailleur using an electric wire. » ; pour la ST-RX825, citée dans la note de la même page avec d'autres manettes, « is not connected by wires, [UPDATE AVAILABLE] is not displayed even when an update is possible. » ; « If you cannot prepare the part required for connection (indicated in red) or the connection tool (TL-EW300), contact a nearby place of purchase. » Sur ce vélo, le dérailleur n'a pas de port (1.2) : la mise à jour des manettes passe par un atelier équipé du SM-PCE02 (déduction).
- Mise à jour d'août 2024, FAQ D-7030 : « ST-RX825 4.0.1 » ; « Even if you do not apply the updates, you can keep using your Di2 system without any issues. » Le RD-M8250 n'est pas dans cette liste.

### 9.7 Codes d'erreur

Ils se lisent dans l'application, écran « Error log » (https://si.shimano.com/en/um/7J4MA/status : « For information on the error codes, see https://si.shimano.com/error . »), pas sur le voyant. Dans la liste Shimano, un seul code vise le dérailleur : « E401 », « An abnormality was detected in the rear derailleur or motor unit. » (https://si.shimano.com/en/error). La remise à zéro (« When the system does not start up, performing a power reset of the system may fix the problem. (D-6270) ») renvoie à un PDF **non lu**.

## 10. Vidéos officielles

- **Shimano** : aucune vidéo de réglage ou d'entretien du RD-M8250, de la ST-RX825, de la CS-M8200 ou de la CN-M8100 trouvée sur une chaîne Shimano le 30/10/2026. Les vidéos d'appairage et de réglage trouvées sont publiées par des tiers (chaînes « SeeYouUpTheRoad », « Cycling Professor », « Garage 31 », etc.) : exclues par la règle 3. Vidéo de présentation seulement : « Introducing GRX RX825 Di2 », chaîne « SHIMANO | Shimano Singapore », https://www.youtube.com/watch?v=oM8Vj9GeL5w. La vidéo « SHIMANO GRX Di2 2x12-fach und FRONT SHIFT NEXT: Electrify your ride! » (chaîne Shimano Germany, https://www.youtube.com/watch?v=a0YAoGhgAK8) porte sur le 2x12.
- **Canyon** : la page support Grizl CF propose des vidéos de montage, de chargement, de porte-bagages, de garde-boue, de ruban et de rodage des freins, **aucune sur la transmission**. L'article Canyon sur la chaîne intègre une vidéo, « Professioniell & gründlich: Mountainbike waschen! Canyon Factory Racing TIPPS | Fabio Schäfer How-To » (https://www.youtube.com/watch?v=Y6W6djIOdnM), publiée sur la chaîne de Fabio Schäfer et non sur celle de Canyon : à toi de dire si elle compte comme officielle (règle 3).
- **Park Tool**, pour les gestes (titres et chaîne vérifiés le 30/10) : « When to Replace a Chain on a Bicycle » (https://www.youtube.com/watch?v=gXd-3UnqoaM) ; « How To Clean and Lube a Bicycle Chain with a Park Tool Chain Cleaner » (https://www.youtube.com/watch?v=MuwS_nSevy4) ; « How to Size a Bicycle Chain » (https://www.youtube.com/watch?v=O0YibMDWBAw) ; « How to Replace a Chain on a Bike - Sizing & Installation » (https://www.youtube.com/watch?v=VdUQKVMPF5I) ; « Cassette Removal & Installation » (https://www.youtube.com/watch?v=9KAaP7pbFV0) ; « DAG-3 Derailleur Hanger Alignment Gauge » (https://www.youtube.com/watch?v=fr88o54Uuyg) ; « Crank Removal and Installation - Two Piece Compression Slotted (Hollowtech II, FSA) » (https://www.youtube.com/watch?v=QqBtB8Kyl2U) ; « How to Remove and Install Bottom Brackets - Press Fit » (https://www.youtube.com/watch?v=2VnwKrC9rS0). La vidéo de réglage d'un dérailleur à câble (https://www.youtube.com/watch?v=UkZxPIZ1ngY) ne vaut pas pour le Di2.

## Contradictions

1. **Maillons à ajouter.** DM-MARD011 (RD-M8250) : « QUICK-LINK + 5 links » ou « + 6 links ». DM-M9200TIPS (RD-M9250) : « Hardtail bikes », « 5 to 6 links + a QUICK-LINK ». Article Shimano « How to Check Your Chain Length » : « Hard tail bike with QUICK-LINK + 4/5 links ». Park Tool (gros pignons) : « count four additional rivets (two inches) », valeur Park non retenue (règle 2). Le DM propre au dérailleur et l'article général ne donnent pas le même nombre.
2. **Goupille ou attache.** DM-MARD011 dessine aussi « Connecting pin », « 6 links » ou « 7 links ». DM-MACN001 pour la CN-M8100 : « Instead of connecting this product with a conventional connecting pin, use a QUICK-LINK to connect the chain. »
3. **Outil de l'attache.** Shimano : « A SHIMANO original tool is required to remove the QUICK-LINK. » (DM-MACN001), « A QUICK-LINK should only be opened using the original SHIMANO chain tool TL-CN10. » (article). Park Tool annonce sa MLP-1.2 compatible « Shimano® XTR® 12-speed ». L'article Shimano se contredit aussi : « With a QUICK-LINK, you won't need a tool for installation. » et l'astuce de fermer l'attache à la pédale, contre « Make sure to use the original SHIMANO chain tool TL-CN10 in order to slide in and fasten the pins. » Le DM montre la TL-CN10 pour fermer et pour ouvrir.
4. **Critère d'usure.** Shimano : jauge Shimano qui « completely fall into the chain », et « it is important to use a SHIMANO chain gauge. Many dealers use chain gauges from other brands which often leads to premature chain replacements. » Park Tool, pour son CC-3.2 : « 11-to-12-speed chains*: replace at or just before 0.5% », avec « Check with manufacturer ». Canyon : contrôle « AFTER 6 MONTHS » (QSG V02 p.67), « about 1,200 to 4,000 km » pour une chaîne de vélo de route et test du soulèvement sur le plateau (manuel route 2021, p.85). Aucun pourcentage Shimano.
5. **Produits de nettoyage.** Shimano, manuels : détergent neutre, « Never use alkali- or acid-based solvents », « Do not use the thinners or harsh solvents ». Shimano, article : « then use a degreaser ». Canyon, manuel 2021 : « There is no need to use special degreasers. » Canyon, article : liquide vaisselle, dégraissant ou nettoyant vélo, mais « Under no circumstances should a chain be soaked in degreaser. » Muc-Off : pulvériser, laisser agir « up to 1 minute », rincer à l'eau ; pH non publié.
6. **Geste de lubrification.** Canyon, article : « a small drop of lube in the joint of each link ». Canyon, manuel 2021 : « drip the lubricant onto the rollers while you turn the crank ». Shimano, article : flacon contre l'intérieur de la chaîne en tournant la manivelle. Park Tool : « Apply a small drop to each individual rivet. » MOTOREX, pour son produit : trois passages sur la face intérieure en pédalant en arrière, temps de pose « several minutes, ideally overnight », surface essuyée jusqu'à paraître sèche.
7. **Couple de la cassette.** Shimano DM-MACS010 : « 30 - 50 N·m ». Canyon, manuel des roues, pictogramme : 40 Nm (`montage-cf8-di2.md`, Contradictions, point 8). Park Tool : « at least 40 Nm or whatever is recommended by the manufacturer » (valeur Park non retenue).
8. **Plus petit pignon.** Page Canyon de la paire GR 30 CF : corps Micro Spline pour cassette « with a 10T smallest sprocket ». Vélo livré en 9-45, plus petit pignon de 9 avec contre-écrou intégré (DM-MACS010). Déjà relevé le 23/10.
9. **Patte de dérailleur.** Manuel route Canyon 2021, p.30-31 imprimées (PDF p.17), texte général sur les « replaceable derailleur hangers » : « When replacing the derailleur hanger, make sure to apply a little grease between derailleur hanger and frame! » ; « Do not exceed the maximum torque of 1.5 Nm when replacing the replaceable derailleur hanger » ; « Observe the indicated torque value specified on the derailleur hanger itself. » SRAM, manuel UDH : « Do NOT apply grease to the UDH hanger or frame. » et « 25 N·m (221 in-lb) », filetage à gauche. Le texte Canyon de 2021 ne nomme pas l'UDH ; le manuel SRAM est celui de la pièce montée.
10. **Le Di2 dans le manuel Canyon 2021.** P.80-81 imprimées (PDF p.42) : Di2 à fils, « The power supply is provided by a rechargeable battery that is mounted in the frame. », niveau lu « on the control unit », « A new, fully charged battery allows you to ride approx. 1,000 km (620 miles). », « Recharging the (empty) battery will take about 1.5 hours. » Ce vélo : batterie dans le dérailleur, voyant sur le dérailleur, « The charging time is about 1 hour. » (UM-7KZ0A, lot 2), autonomie « over a month with normal rides of about 20 km a day » (FAQ Shimano D-6010). Le texte Canyon décrit une autre génération de Di2.
11. **Durée de l'appui pour le mode réglage.** DM-MARD011, tableau : « Press and hold (for 2 seconds or longer) » ; même DM, page de réglage, et UM-0RM0B : « for 2 to 5 seconds ». Retour au mode normal : bouton du dérailleur « 0.5 seconds or longer », bouton de la manette « 2 seconds or longer ».
12. **Crans du réglage fin.** DM-MARD011, pour tout son groupe de dérailleurs (dont le RD-RX827 de gravel) : « five steps ». Application : « 4 steps (5 steps for MTB and RD-R9250/RD-R8150) ». Pour le RD-M8250, dérailleur VTT, les deux donnent 5 (lecture de ce relevé) ; l'écart ne vaut que pour les dérailleurs de route et de gravel.
13. **Réglage GS ou SGS.** DM-MARD011 range « Rear cassette combination settings (RD-M9250 / RD-M8250) » dans « Items configurable in E-TUBE PROJECT », sans dire quelle version de l'application. DM-M9200TIPS, pour un changement de chape du RD-M9250 : « The cage length setting must be changed in E-TUBE PROJECT Professional ». Possible dans E-TUBE PROJECT Cyclist : non publié.
14. **Port E-TUBE de la ST-RX825.** UM-0RM0B : « The E-TUBE port is not used. Be sure to attach a dummy plug to it. » DM-GADBR10 : « PC linkage devices can be connected to the E-TUBE port when performing maintenance. » UM-7J4MA : mise à jour des manettes par un fil relié au dérailleur, que le RD-M8250 n'a pas.
15. **Nom de l'attache.** Canyon : « SM-CN910 ». Shimano : « SM-CN910-12 ». L'article Shimano conseille pour la route « the SM-CN900 », qui n'est pas dans le tableau du DM-MACN001 pour la CN-M8100.
16. **Chaîne recommandée.** DM-MACS010 admet quatre chaînes avec la CS-M8200 (CN-M9100, M8100, M7100, M6100). DM-GAFC001 recommande « CN-M8100 » pour le FC-RX820. Pas une contradiction de chiffre, deux listes différentes.
17. **Graisse du boîtier pressé.** Canyon, manuel 2021 : « Common cartridge bearings can be mounted directly into the bottom bracket shell of all models with high-grade grease. » Shimano, pose du SM-BB72-41B : aucune graisse ni produit de fixation cité ; la graisse n'est citée que pour les cuvettes filetées. Park Tool propose son produit RC-1 (geste). Non tranché.
18. **Fréquence de nettoyage et de contrôle.** Shimano : pas de chiffre. Canyon, QSG V02 : transmission nettoyée et lubrifiée « AFTER EVERY RIDE », contrôlée « EVERY 2 WEEKS », usure « AFTER 6 MONTHS » ; article Canyon : gravel « after dusty or wet rides ». MOTOREX : relubrifier après les sorties poussiéreuses, humides ou boueuses.

## À lire sur la pièce à la livraison

- **Dérailleur** : marquage RD-M8250-GS ; plaque de butée contre la butée de vis B, sans jeu ; patte SRAM UDH présente, bien en place dans son logement, marquage de couple éventuel sur la vis.
- **Manettes** : gauche ST-RX825-L (avec boutons) ou BL-RX825-L ; position de [X] et [Y] ; numéro de série sur l'unité de commande, à l'intérieur du levier ; bouchon du port E-TUBE en place.
- **Chaîne** : marquage CN-M8100 ; nombre de maillons montés, à compter (repère pour la chaîne suivante) ; attache SM-CN910-12, flèche dans le sens de rotation ; face marquée vers l'extérieur.
- **Cassette** : repères des pignons (9 « A » à 45 « H ») ; 9 dents à contre-écrou intégré ; corps Micro Spline du moyeu ; passage du TL-LR021 sur l'axe et les embouts du moyeu DT Swiss.
- **Pédalier** : marquage FC-RX820, manivelles de 165, plateau de 40 ; empreinte des vis de plateau ; plaque de sécurité de la manivelle gauche.
- **Boîtier** : SM-BB72-41B (ou II).
- **Dans E-TUBE PROJECT Cyclist** : versions des micrologiciels (« [UPDATE AVAILABLE] ») ; mode E-BIKE (activé d'usine, Shimano demande de le couper sur un vélo non électrique) ; type de cassette (GS) ; fonctions des boutons, dont celui qui porte « [Shifting/Adj. mode] » et ce que font les boutons de gauche sans dérailleur avant ; réglage du changement multiple ; communication sans fil (ANT+, Bluetooth LE).
- **Niveaux** : batterie (un clic sur le bouton du dérailleur), piles CR1632 (deux boutons, 0,5 s) : `montage-cf8-di2.md` § 6.
- **Produits** : nom exact du lubrifiant MOTOREX (flacon ou spray) et du dégraissant Muc-Off ; acide ou alcalin, sur la fiche de données de sécurité.
- **Outils** : taille du six-pans du TL-LR021 et prise pour une clé dynamométrique ; plage de la clé Canyon du carton.

## Outils de Lamine et ce qui manque

Liste tirée des brouillons du 20/10 (`brouillons/parts/10-avant.html:46` à `:67`, sous « ta liste d'outils, classée comme dans ton fichier ») et du site en ligne (`src/parts/11-montage.html:32` et `:33`, `src/parts/20-freins.html:83`). Elle date du 20/10 : **à reconfirmer par Lamine**.

| Outil | Statut | Page officielle | Ce que la source dit pour ce lot |
|---|---|---|---|
| Indicateur d'usure Park Tool CC-3.2 | a | https://www.parktool.com/en-us/product/chain-wear-indicator-cc-3-2 | 0,5 % pour 11 à 12 vitesses, selon Park ; Shimano veut sa propre jauge (Contradictions, point 4) |
| Pince Park Tool MLP-1.2 | a | https://www.parktool.com/en-us/product/master-link-pliers-mlp-1-2 | Annoncée compatible Shimano XTR 12 vitesses ; Shimano exige la TL-CN10 (point 3) |
| Dérive-chaîne Park Tool CT-3.3 | a | https://www.parktool.com/en-us/product/chain-tool-ct-3-3 | Compatible 12 vitesses Shimano XTR, selon Park |
| Nettoyeur de chaîne Park Tool CM-5.3 | a | https://www.parktool.com/en-us/product/cyclone-chain-scrubber-cm-5-3 | 59 mL de solvant ; pas de solvant inflammable |
| Dégraissant, nettoyant et brosses Muc-Off | a | https://muc-off.com/products/bio-drivetrain-cleaner | Nom exact à lire sur le flacon ; rincer à l'eau |
| Lubrifiant MOTOREX « Chainlube WET » | a | https://motorex.com/en-us/chainlube-for-wet-conditions--49642 | Produit exact à lire (flacon ou spray) |
| Clé dynamométrique Park Tool TW-6.2 | a | https://www.parktool.com/en-us/product/ratcheting-click-type-torque-wrench-tw-6-2 | 10 à 60 Nm, carré de 3/8 de pouce, filetage à gauche et à droite : couvre l'axe B (10 à 12), la manivelle gauche (12 à 14), le plateau (12 à 16), la cassette (30 à 50, si l'outil a une prise), la patte UDH (25) |
| Tournevis dynamométrique Park Tool ATD-1.2 | a | https://www.parktool.com/en-us/product/adjustable-torque-driver-atd-1-2 | 4 à 6 Nm : aucun couple de ce lot dans sa plage ; capuchon de manivelle (0,7 à 1,5) en dessous |
| Clés Allen PB Swiss 212.LH-10 | a | https://www.pbswisstools.com/en/tools/quality-hand-tools/hex-key-l-wrenches/product/pb-212-lh | « PB 212.LH-10 » : « 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10 » ; le 2 sert pour la vis B et les butées |
| Clés Torx PB Swiss | a | (page non relevée) | Empreinte des vis de plateau à lire sur la pièce |
| Graisse Shimano | a | (page non relevée) | Shimano cite « Premium Grease(Y04110000) » pour l'axe B (6.7) ; pour le grincement de la manivelle gauche (8), le DM-GAFC001 dit « apply grease » sans nommer de graisse |
| Pied d'atelier Park Tool PCS-10.3 | a | (page relevée au lot 2) | Ne jamais serrer la tige carbone (lot 2) |
| Outil Center Lock Shimano TL-FC36 | a | (lot 1) | Ne sert pas à la cassette 9-45 |
| Démonte-cassette Park Tool FR-5.2H | prévu (« Plus tard ») | https://www.parktool.com/en-us/product/lockring-tool-with-handle-fr-5-2h | Park : « 12-spline tool fittings with an approximate outer diameter of 23.4 mm » ; compatibilité avec le 9 dents à contre-écrou intégré : **non publiée** ; Shimano demande le TL-LR021 |
| Fouet Park Tool SR-12.2 | prévu (« Plus tard ») | https://www.parktool.com/en-us/product/sprocket-remover-chain-whip-sr-12-2 | « Compatible with 7-to-13 speed road and mountain bike cassettes including SRAM® eTap® AXS® & Shimano® XTR® » ; Shimano dessine le TL-SR24 |
| Dérive-chaîne et attache rapide du kit de route | prévus (`10-avant.html:67`) | | Attache : SM-CN910-12 |

**À prévoir pour ce lot (sans choix de modèle à la place de Lamine) :**
- Un outil de contre-écrou pour le 9 dents : Shimano TL-LR021 (DM-MACS010, EV CS-M8200-12-5110), et de quoi le tourner (« Adjustable wrench » dans la liste du DM). Serrer au couple avec lui : non publié.
- Un fouet, si le SR-12.2 prévu n'est pas acheté : Shimano TL-SR24.
- Des attaches SM-CN910-12 neuves : une à chaque changement de chaîne (« be sure to replace the QUICK-LINK with a new one as well »), et une de secours.
- La pince Shimano TL-CN10, si Lamine suit Shimano plutôt que Park pour l'attache (Contradictions, point 3).
- Des embouts au carré de 3/8 de pouce pour la TW-6.2 : six-pans de 5 (axe B du dérailleur, vis de la manivelle gauche) ; six-pans de 8 (vis de la patte UDH, seulement pour poser une patte neuve). Le site prévoit déjà un embout de 6 et une tête de clé plate de 15 (`src/parts/11-montage.html:38`).
- Des gants et des lunettes de protection : Shimano les demande pour le contre-écrou (« wear gloves and eye protection ») et pour l'entretien. Source de cette seconde phrase, trouvée le 30/10/2026 : DM-MACN001, https://si.shimano.com/en/dm/MACN001/TO_ENSURE_SAFETY, « Wear approved eye protection while performing maintenance tasks such as replacing components. »
- Un chiffon non pelucheux pour MOTOREX (« lint-free cloth ») ; le « Bike Protect » que Muc-Off cite après son dégraissant, si Lamine suit Muc-Off.
- L'application E-TUBE PROJECT Cyclist sur le téléphone.
- **Travail d'atelier, pas d'achat à prévoir pour un débutant** : outils de boîtier TL-BB12 et TL-BB13 ; contrôle de la patte au TL-RD11 (ou au DAG-3 de Park, qui ne nomme pas l'UDH) ; mise à jour des manettes par SM-PCE02 ; outil de capuchon TL-FC16 ou TL-FC18, seulement pour déposer la manivelle.

## Écarts avec les brouillons du 20/10

Fichier lu : `brouillons/parts/40-transmission.html` (798 lignes, écrit pour le Grizl CF 7, transmission GRX RX822 mécanique, CS-M7100, FC-RX610). « Faux » : contredit par une source CF 8 ; « non vérifié » : pas de source officielle CF 8 ; « ne vaut pas » : pièce absente du CF 8 ; « à remplacer » : bonne idée, mauvaise source ou source d'une autre pièce.

### 4.1 Ta transmission

- **40-transmission.html:5** : « Shimano GRX mono-plateau 12 vitesses » et réglage « dans l'ordre du manuel Shimano » : **à remplacer**. Manettes GRX ST-RX825, dérailleur et cassette Deore XT, Di2 sans fil ; ordre du DM-MARD011.
- **:13** : manette ST-RX610 (revendeur bike-discount, exclu) ou BL-RX820 (fiche Qatar) : **faux**, ST-RX825 Di2 sans fil.
- **:14** : RD-RX822 GS, capacité « 35 dents » (Rose Bikes, revendeur exclu) : **faux**, RD-M8250-GS, « Total capacity 36T ».
- **:15** : SLX CS-M7100 10-45, DM-MACS001 : **faux**, CS-M8200-12 9-45, DM-MACS010-02.
- **:16** : chaîne CN-M6100 : **faux**, CN-M8100 en pièce d'usure (à lire sur la pièce).
- **:17** : FC-RX610-1 ; 170 à 175 mm sur la fiche Qatar : **faux**, FC-RX820-1, 165 en S-M.
- **:18** : BB-RS500 PF86, test n-1 et 99spokes (exclus), « boîtier fileté de 68 mm » : **faux**, SM-BB72-41B, PF 86,5.
- **:19** : UDH sourcée sur le test n-1 (exclu), « pas confirmé » : **à remplacer**, pièce Canyon « SRAM UDH Derailleur Hanger » du R126-01 2027 et « UDH standard ✔ » chez Shimano.
- **:20** : roue DT Swiss Gravel LN : **faux**, GR 30 CF, moyeu DT Swiss 350, Micro Spline.
- **:22** : tableau C-454 (manettes mécaniques) : **ne vaut pas**, C-473, « Di2 with BT-DN320 ».
- **:24** : développés des préfixes (« Front Chainwheel », « Cassette Sprocket »…) : **non vérifiés**, aucune source Shimano lue ne les donne.
- **:29 à :34** (relevés à faire) : ST-RX610 ou ST-RX820, CN-M6100, 165 à 175 mm, PF86 ou fileté, RD-RX822 GS : **à remplacer** par la liste « À lire sur la pièce » de ce relevé.

### 4.2 Nettoyer et lubrifier

- **:41** : règles Shimano justes ; source DM-MACS001 **à remplacer** par DM-MACS010 (même phrase sur les pignons).
- **:44, :48** : « Muc-Off Drivetrain Cleaner », « Motorex Chainlube WET » : noms **à vérifier** (« Bio Drivetrain Cleaner », « CHAINLUBE FOR WET CONDITIONS » sur les pages des fabricants).
- **:51** : composition « à lire sur le flacon » : **juste**, Muc-Off ne publie pas le pH.
- **:53 à :57** : gestes Park CM-5.3, justes pour l'outil ; l'étape « une petite goutte par rivet » (:56) **ne vaut pas pour ton lubrifiant** : MOTOREX demande trois passages et un temps de pose (2.3).
- **:58** : galets, DM-GARD010 (RD-RX822) : **à remplacer**, DM-MARD011 : « Periodically clean the shifting unit and lubricate all moving parts (mechanisms). »
- **:61** : haute pression, DM-GAFC001 juste ; **manque** la consigne Di2 : laver avec la batterie en place (UM-3K70A).
- **:62** : « Aucune source ne donne de fréquence » : **faux** pour Canyon (QSG V02 p.64 et 65 ; article Canyon, gravel « after dusty or wet rides »). Shimano, lui, n'en donne pas.

### 4.3 Mesurer l'usure

- **:74** : seuil de 0,5 % « fixé par Park » pour 12 vitesses : valeur Park, recevable seulement comme mode d'emploi du CC-3.2 ; Shimano veut sa propre jauge (Contradictions, point 4). « Le manuel Shimano de la chaîne ne donne aucun seuil » : **juste** (DM-MACN001-08).
- **:181** : méthode à la règle, 24 rivets et 1/16 de pouce : **valeur Park hors outil Park**, exclue par la règle 2.
- **:183** : Proposition toutes les deux semaines : à confronter au QSG (« AFTER 6 MONTHS », contrôle d'usure) et à garder en Proposition.

### 4.4 Remplacer la chaîne

- **:189, :191** : CN-M6100 ou CN-M7100, tableau C-454 : **faux**, CN-M8100 recommandée pour le FC-RX820 (DM-GAFC001) ; SM-CN910-12 juste.
- **:193, :197, :355** : MLP-1.2 « celle que tu as » pour ouvrir l'attache : **contredit** par Shimano (TL-CN10 obligatoire). Pages « p. 4 à 6 », « p. 5 », « p. 4 » du DM-MACN001 : **non vérifiées** (PDF non lu ; sections HTML citées ici).
- **:200 à :204** : méthode et pages du DM-GARD010 (RD-RX822) : **ne vaut pas**, DM-MARD011, check_chain_length.
- **:340, :341** : « QUICK-LINK + 4 maillons » ou « + 5 » : **faux** pour le RD-M8250, « + 5 links » ou « + 6 links » ; lien https://mtb.shimano.com/stories/determine-chain-length **mort** (article déplacé sur bike.shimano.com, qui dit « + 4/5 », Contradictions, point 1).
- **:343 à :346** : pages 12 à 15 du DM-GARD010 : **ne valent pas**.
- **:349** : contrôle Park « 4 rivets, soit 2 pouces » : **valeur Park**, exclue comme chiffre (règle 2).
- **:350, :360** : règles UDH du DM-GARD010 (mou, vis B) : **ne valent pas** ; le DM-MARD011 n'a pas de règle UDH.
- **:356, :360** : stabilisateur sur OFF puis ON : **faux**, le RD-M8250 n'a pas de levier de stabilisateur dans ses noms de pièces.
- **:357** : face marquée dehors : **juste** (DM-MACN001).
- **:358** : passage dans la chape, DM-GARD010 p.15 : même règle dans le DM-MARD011, **à remplacer** ; ne pas couper à l'attache : **juste**.
- **:359** : flèche de l'attache : **juste** ; « p. 4 », « p. 9 » : **non vérifiées**.
- **:366** : attache de secours SM-CN910-12 : **juste**.

### 4.5 Cassette

- **:372** : CS-M7100, 10-45 ou 10-51 : **faux**, CS-M8200-12 9-45.
- **:374, :375, :380** : TL-LR15 ou FR-5.2H, TL-SR24 ou SR-12.2 ; vue éclatée CS-M7100 ; Excel Sports (revendeur, exclu) : **faux** pour la 9-45, TL-LR021 (« Lock ring tool for 9T ») ; le TL-LR15 est « Lock ring tool for 10T » ; compatibilité du FR-5.2H avec le 9 dents : non publiée.
- **:384** : axe 12x142, fiche CF 7 : même valeur sur la fiche 4556, **à remplacer** (source).
- **:385** : fouet sur un pignon « côté extérieur » : **juste**, même règle dans le DM-MACS010, **à remplacer** (source).
- **:394** : entretoises A et B, Y0GY00300 et Y0GY00310 : **faux**, entretoises Y0T49809T et Y0T49810T de la CS-M8200 ; place selon le DM-MACS010.
- **:395** : pignon de 10 dents, repères 10, 12 et 14 : **faux**, 9 dents à contre-écrou intégré, repères 9, 11 et 13.
- **:396** : 30 à 50 Nm juste ; « Park dit au moins 40 Nm », « Entre 40 et 50 Nm, tu respectes les deux » : **valeur Park exclue** et règle inventée ; graisse du filetage : non publiée par Shimano pour le 9 dents.
- **:397** : bague adhésive Y0GX01500 : **juste** (même référence dans l'EV CS-M8200-12-5110).
- **:402, :403** : tableau 10-45 et 10-51 : **faux**, 9-11-13-15-17-19-21-24-28-33-39-45.
- **:407, :410** : pièces et 3D de la CS-M7100 : **faux**.
- **:412** : pas de critère chiffré d'usure de la cassette : **juste** ; renvoi Shimano au revendeur : juste, source **à remplacer** (DM-MACS010, UM-3K70A).

### 4.6 Dérailleur

- **:418** : stabilisateur Shadow RD+, levier ON/OFF : **faux** pour le RD-M8250.
- **:419** : vis H, L, B : noms justes (« High limit screw », « Low limit screw », « B-screw »), réglages différents (6.2 et 6.3).
- **:424, :427** : pince coupe-câble, clé de 5,5, Torx 27, TL-CT12 : **ne valent pas** (pas de câble).
- **:428** : 8 à 10 Nm (fixation) et 6 à 7 Nm (serre-câble) : **faux**, axe B 10 à 12 N·m ; pas de serre-câble.
- **:431** : ordre du DM-GARD010 : **faux**, ordre du DM-MARD011 (6).
- **:434** : plaque contre la butée de vis B : **juste** ; 8 à 10 Nm : **faux**.
- **:435** : butée H par alignement du galet sur le petit pignon, avant la chaîne : **faux**, vis vissée jusqu'au contact de la butée, dérailleur passé électriquement sur le petit pignon.
- **:437 à :444** : câble, 11 coups de levier, serre-câble, 30 mm de câble : **ne valent pas**.
- **:449, :450, :497** : butée L par le galet sous le grand pignon, premier écart à la vis B (version allemande du DM-GARD010) : **faux**, vis vissée jusqu'au contact.
- **:501** : pas de cote en millimètres : **juste** pour le RD-M8250 aussi ; règle de 5 à 6 mm de Park : **valeur Park exclue**.
- **:504, :606** : vis B en chape GS, contour de la plaque extérieure sur la pointe de la plus haute dent : **juste**, même phrase dans le DM-MARD011, **à remplacer** (source).
- **:505, :506** : chape SGS et outil de réglage du galet fourni : **ne valent pas** ou **non vérifiés** (le DM-MARD011 ne cite pas d'outil fourni).
- **:608** : refaire la vis B à chaque changement de cassette : **non vérifié** pour le RD-M8250.
- **:611 à :618** : indexation SIS par la molette, stabilisateur : **faux** pour le Di2 ; mode réglage (6.4).
- **:614** : 5e pignon « le 28 dents » : **faux** sur une 9-45, le 5e en partant du plus grand est le 24 (le 28 est le 4e).
- **:616** : « reviens de 5 crans » à la molette : remplacé par « Press shift switch (Y) 5 times ».
- **:620 à :622** : 3D du RD-RX822 (molette, serre-câble, stabilisateur) : **faux**.
- **:625 à :637** : couples du RD-RX822 : axe B **faux** (10 à 12) ; galets 2,5 à 5 juste pour le RD-M8250 ; capot de chape, axe de chape, goupille : **non vérifiés** ; « sa flèche va dans le sens de rotation » (:637) : **faux**, « The pulleys do not have a specific direction of rotation. »
- **:639 à :649** : friction du stabilisateur : **ne vaut pas**.
- **:650 à :660** : câble et gaine, OT-RS900, passage par le capot de direction (test n-1, exclu) : **ne valent pas**.

### 4.7 Patte

- **:666** : TL-RD11, DM-GARD010 : **à remplacer**, DM-MARD011 (même outil).
- **:668 à :672** : gestes et seuil de 3 mm du DAG-3 : gestes Park pour son outil, recevables ; Lamine n'a pas le DAG-3.
- **:673** : remontage à 8 à 10 Nm : **faux**, 10 à 12 N·m.
- **:675** : « Aucune source consultée ne décrit le redressage d'une patte UDH » : **toujours juste** ; **manque** le manuel SRAM (25 N·m, filetage à gauche, pas de graisse, contrôle avant et après chaque sortie).
- **:676** : Proposition de faire redresser par Canyon ou un atelier : reste une Proposition ; SRAM recommande aussi un mécanicien pour la pose.

### 4.8 Pédalier et boîtier

- **:682, :683, :692** : FC-RX610-1, « le DM-GAFC001 consulté décrit le FC-RX610 double » : **faux**, FC-RX820-1 ; le DM-GAFC001-06 couvre le FC-RX820 et le type « Single chainring ».
- **:687, :697** : outil TL-FC16 ou TL-FC18 et capuchon 0,7 à 1,5 : **justes** (figure du DM) ; Park BBT-9 et BBT-10.2 : outils Park, non relus.
- **:698 à :700** : plaque de sécurité, 12 à 14 N·m en alternance, contrôle après environ 100 km : **justes**.
- **:703** : pédales 35 à 55 N·m : **juste** ; « Vis de plateau : section 4.9 » : la valeur de 4.9 est **fausse** pour le FC-RX820 (12 à 16 N·m).
- **:705, :706** : BB-RS500, outils Park BBT-90.3, BBP-1.2, HHP-3 : **faux** pour la référence (SM-BB72-41B, outils Shimano TL-BB12 et TL-BB13) ; « un boîtier pressé déposé doit être remplacé » : **juste**, Shimano le dit aussi ; produit RC-1 : non publié par Shimano.

### 4.9 Kit montée

- **:711 à :746** : tout le chantier (plateau GRX 38 dents Y0SR9801T, CS-M7100 10-51, RD-RX822-SGS, CN-M7100, C-454, sources Performance Bike, Competitive Cyclist, SJS Cycles exclues) : **ne vaut pas** pour le CF 8. Le FC-RX820-1 n'est publié qu'en « 40T, 42T, 44T, 46T » : pas de 38. La CS-M8200-12 existe en « 10-51T » et le RD-M8250-SGS existe (C-473), avec le réglage « SGS type » dans l'application : un kit montée CF 8 serait à rechercher à neuf, si Lamine le veut encore.
- **:726** : vis de plateau 16 à 17 N·m : **faux** pour le FC-RX820, 12 à 16 N·m.

### 4.10 Dépannage et liens

- **:754 à :761** : causes par le câble et la molette, stabilisateur : **ne valent pas** ; à remplacer par le tableau du DM-MARD011 (9.2). « Remplace plateau et chaîne » (:761) : **juste** (DM-GAFC001).
- **:762 à :765** : bruits, galets, chape : gestes Park recevables ; galet « à changer s'il a du jeu » : juste (DM-MARD011, NOTICE).
- **:775, :778, :779** : vidéos Park de réglage à câble, de câble et de gaine : **ne valent pas**.
- **:786 à :788** : DM-GARD010 en trois langues : **ne valent pas**.
- **:790, :791** : DM-MACS001 et EV CS-M7100 : **à remplacer** (DM-MACS010, EV CS-M8200-12-5110).
- **:792** : DM-GAFC001-06 « Version double plateau seulement » : **faux** (type mono-plateau couvert).
- **:793, :794** : EV FC-RX610 et UM « FC-RX610 » : **à remplacer** (FC-RX820 ; EV non lue).
- **:795** : C-454 : **à remplacer** (C-473).

### Pièces 3D des brouillons

- `brouillons/js/m-chain.js` : tronçon de chaîne 12 vitesses et attache SM-CN910-12 ; l'indicateur dessiné est un CC-3.2 « simplifié » : cotes de rouleau et de plaques approchées, non publiées par Shimano.
- `brouillons/js/m-cassette.js:1, :6 à :9, :249` : CS-M7100 10-45 et 10-51, outil « TL-LR15 ou FR-5.2H » : **faux** pour la CS-M8200-12 9-45 (TL-LR021).
- `brouillons/js/m-derailleur.js:1, :186, :237 à :375` : RD-RX822 à câble, serre-câble « 6 à 7 N·m », levier de stabilisateur : **faux** pour le RD-M8250.
- `brouillons/js/m-crank.js:1, :3, :10, :13, :267` : FC-RX610-1, manivelle de 170, plateaux Y0SR9802T et Y0SR9801T, boîtier PF86 BB-RS500 : **faux** (FC-RX820-1, 165, SM-BB72-41B). Ligne de chaîne 49,7 et Q-factor 151 : mêmes valeurs publiées pour le FC-RX820-1.

### Note sur `docs/recherche/transmission.md`

Note brute du CF 7, à garder comme historique. Ses valeurs du RD-RX822 (DM-GARD010), de la CS-M7100 (DM-MACS001), du FC-RX610 et du kit montée ne valent pas pour le CF 8 Di2. Ses liens de revendeurs (Rose Bikes, SJS Cycles, Excel Sports, bike-discount, Performance Bike, Competitive Cyclist), de 99spokes et du test n-1 sont exclus par la règle des sources.

## Données personnelles

Ce relevé ne contient ni cote personnelle, ni numéro de commande, ni prix, ni magasin. La liste de jetons de `brouillons/jetons-personnels.txt` a été lue pour les éviter et n'est pas recopiée.
