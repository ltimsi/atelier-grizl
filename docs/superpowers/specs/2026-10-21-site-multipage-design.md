# Atelier Grizl : un vrai site en plusieurs pages

Document de conception, 21 octobre 2026. Il part de la maquette cliquable validée par Lamine le même jour (« ok c'est bien, go pour le vrai site »), copiée dans [2026-10-21-maquette-site.html](2026-10-21-maquette-site.html).

Il complète [2026-10-20-velo-3d-ateliers-design.md](2026-10-20-velo-3d-ateliers-design.md) et [PASSATION.md](../../PASSATION.md) sans les remplacer. Leurs règles restent valables : règle des sources, rien d'inventé, formes approchées signalées, aucune donnée personnelle dans le dépôt public, rien sur le serveur sans l'accord de Lamine, règles de style.

## Pourquoi

Le site en ligne (lots 0 et 1) met tout sur une seule page : la scène 3D, la fiche, puis le chapitre Freins en entier. Lamine trouve cela « hyper difficile » : on ne voit pas les sections et il y a « beaucoup trop de lecture ». Il utilisera le site surtout **sur son ordinateur**, plus que sur son téléphone. Il veut « un vrai site avec un menu des catégories », qui prenne toute la largeur de l'écran.

## Ce que Lamine a validé (la maquette)

1. **Un menu fixe à gauche**, toujours visible sur ordinateur, dans cet ordre :
   - « Mon vélo » ;
   - « Ateliers » : Freins, avec le nombre de ses ateliers, puis les catégories des lots suivants, en pointillés avec leur numéro de lot ;
   - « Références » : Composants d'origine, Outils, Couples de serrage, Ce qui est approché, Sources.

   La catégorie ouverte déroule la liste de ses ateliers. Sur téléphone, le menu se replie derrière un bouton « Menu ».
2. **Une barre en haut** avec le fil d'Ariane (par exemple Ateliers / Freins / 2.3 Changer les plaquettes) et une recherche qui trouve un atelier, une étape, un outil ou une pièce d'origine.
3. **Mon vélo** (page d'accueil) :
   - le vélo 3D en grand, à gauche ;
   - « Où intervenir » à droite : les zones du vélo, chacune avec ses ateliers en liens ;
   - dessous : les pièces d'origine à remplacer et leur atelier, le vélo en bref, toutes les catégories.
4. **Une page par catégorie** :
   - l'en-tête du chapitre ;
   - l'ordre du jour J ;
   - une grille de cartes, une par atelier : numéro, titre, type, zone, pièce d'origine et pièce à monter, ce qu'il faut démonter, nombre d'étapes, couples ;
   - des filtres par type (Comprendre, Remplacer, Régler, Entretenir) ;
   - les couples de la catégorie sur le côté.
5. **Une page par atelier, en deux colonnes** :
   - **À gauche**, le texte de l'atelier. Chaque étape tient sur une ligne : son numéro, son titre et son premier couple. On clique pour lire le détail. Les boutons « Tout déplier » et « Mode pas à pas » sont au-dessus.
   - **À droite**, et toujours visibles à l'écran : la planche ou la pièce 3D, ce qu'il faut démonter, la liste « Il te faut » à cocher, les couples de l'atelier et la vidéo.
   - **En bas**, l'atelier précédent et le suivant.
6. **Le mode pas à pas** : une étape à la fois, en très gros, pour lire de loin les mains dans le vélo. Les flèches du clavier passent d'une étape à l'autre, Échap ferme.
7. **Les fiches « comprendre »** (2.1, 2.6, 2.8) sont découpées en blocs courts, un par intertitre. Chaque bloc s'ouvre d'un clic.
8. **Les catégories à venir** ont leur page : leur lot et ce qui y est prévu.
9. **Pleine largeur** sur ordinateur, avec le même habillage que le site actuel : couleurs, polices, thème clair et thème sombre.

## Ce qui ne change pas

- **Le contenu.** Les textes, chiffres, sources et liens des ateliers restent ceux de `src/parts/20-freins.html`, mot pour mot. La refonte les découpe et les range, elle n'en écrit pas de nouveaux. Seules exceptions : les libellés d'interface (menu, boutons, titres de colonnes), les pages de référence de la section « Références » (voir plus bas) et ce qui est prévu pour les lots à venir, repris de la conception du 20 octobre.
- **La scène 3D.** Même vélo, mêmes zones, mêmes variantes, même liste « Ce qui est approché », même schéma 2D de secours, même garde-fou si un fichier ne se charge pas.
- **Les pièces 3D des ateliers** (`rotor`, `caliper`, `bleed`), avec la même visionneuse.
- **Le site reste statique.** `build/assemble.py` produit toutes les pages, sans framework. three.js reste embarqué en local pour le serveur.
- **Les statuts des lots.** Les lots 0 et 1 restent « en relecture ».

## Les adresses

Une vraie adresse par page, en dossiers, avec des liens relatifs pour que le même site marche sur le serveur et dans l'aperçu Claude :

| Page | Adresse |
|---|---|
| Mon vélo | `/` |
| Catégorie Freins | `/freins/` |
| Un atelier | `/freins/<atelier>/`, où `<atelier>` est l'id de la section sans le préfixe `freins-` (exemple : `/freins/plaquettes/`) |
| Une catégorie à venir | `/<id>/` (exemple : `/transmission/`) |
| Références | `/composants/`, `/outils/`, `/couples/`, `/approche/`, `/sources/` |

Les anciennes adresses restent valables. `/#freins-plaquettes` ouvre `/freins/plaquettes/`, et `/#freins` ouvre `/freins/`.

## Les pages de référence

- **Composants d'origine.** C'est le relevé de la fiche Canyon de `docs/recherche/composants-origine.md` : les composants et la géométrie de la taille M, avec le lien vers la fiche. Les valeurs sont recopiées telles quelles. Les contradictions relevées restent signalées.
- **Outils.** Chaque outil des listes « Il te faut » des ateliers publiés, avec les ateliers qui en ont besoin. La page est générée, rien n'est écrit à la main.
- **Couples de serrage.** Les tableaux de couples des chapitres publiés, regroupés par catégorie. La page est générée.
- **Ce qui est approché.** La liste que montre le bouton de la scène, sur sa propre page. Elle vient des mêmes données (META des pièces et cotes approchées de la géométrie).
- **Sources.** Le registre des documents officiels de la 3D (`src/scene/sources.js`), avec ce qu'ils justifient, et un renvoi vers les manuels du chapitre Freins (atelier 2.8).

## Contraintes

- **Ordinateur d'abord, téléphone toujours.**
  - À partir d'environ 1100 px de large : deux colonnes, menu à gauche, colonne de droite collante dans les ateliers.
  - Plus étroit : une seule colonne.
  - Sous 900 px : le menu passe derrière son bouton.
  - Jamais de défilement horizontal de la page.
- **Sans JavaScript, tout reste lisible.** Les étapes et les blocs se replient avec `<details>`, que le navigateur sait ouvrir seul. Le menu, le fil d'Ariane et les liens sont du HTML. Sans JavaScript, on perd seulement la recherche, les filtres, le mode pas à pas, les onglets des figures et la mémoire des cases cochées.
- **Les contrôles du build valent pour chaque page** : pas de tiret cadratin ni demi-cadratin, pas d'id en double, des ateliers complets. Un nouveau contrôle vérifie que chaque lien interne, d'une page à l'autre, mène à une page générée et à une ancre qui existe.
- **Règles de style.** Français, tutoiement, phrases courtes, jamais de tiret cadratin ni demi-cadratin.

## Mes choix, à vérifier par Lamine

- **Les noms des catégories à venir** sont ceux de la maquette : Montage à la livraison (lot 2), Pneus et tubeless (lot 3), Transmission (lot 4), Accessoires des trajets (lot 5), Révision et couples (lot 6). Ils suivent le découpage de la conception du 20 octobre, plutôt que les anciens titres de `build/lots.json`.
- **La liste « Il te faut » devient une liste à cocher**, gardée dans le navigateur comme les autres listes.
- **Les couples d'un atelier**, dans sa colonne de droite, sont relevés dans ses étapes. Chaque ligne donne le numéro et le titre de l'étape, puis la valeur, sans libellé écrit à la main.
- **Le bouton « Ce qui est approché » de la scène** garde sa fenêtre. La page `/approche/` montre la même liste.
- **L'aperçu dans Claude** reprend la même arborescence de pages.

## Ce qui est laissé au constructeur

- Le découpage du code de `build/` en modules.
- La forme exacte des données générées : index de la recherche, métadonnées des ateliers.
- Les détails de mise en page, dans la limite de la maquette.

## Non-objectifs

- Écrire du contenu nouveau pour les ateliers.
- Changer la 3D du vélo ou des pièces.
- Mettre en ligne sans l'accord de Lamine.
