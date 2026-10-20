# Socle 3D et ateliers Freins : plan de réalisation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** La page d'accueil montre le Grizl CF 7 de Lamine (taille M, Floating Violet, pièces d'origine) en 3D réaliste. Ses pastilles ouvrent les ateliers Freins, tirés du chapitre Freins déjà sourcé.

**Architecture:** Une scène three.js r160 en modules ES, sans import nu sauf dans `app.js`. La géométrie, les pièces, les matières et le studio reçoivent `THREE` par paramètre, ce qui permet de les tester sous Node. Les ateliers restent des sections HTML du fragment `20-freins.html`, marquées par des attributs `data-*`. `app.js` les déplace dans le panneau de fiche quand on touche une zone. `build/assemble.py` injecte la carte d'imports (fichiers locaux pour `dist/site`, jsDelivr pour `dist/artifact`), les zones en JSON, et contrôle la cohérence des ateliers.

**Tech Stack:** three.js 0.160.0 (MIT), modules ES, Python 3 sans dépendance (assemblage et tests `unittest`), Node 24 (`node --test`), Playwright 1.56.0 (contrôle visuel).

**Spec:** [docs/superpowers/specs/2026-10-20-velo-3d-ateliers-design.md](../specs/2026-10-20-velo-3d-ateliers-design.md). La maquette de référence est dans le même dossier : `2026-10-20-maquette-velo-3d.html`. Lire aussi `docs/PASSATION.md` et `docs/regle-des-sources.md`.

## Global Constraints

- **Règle des sources**, étendue à la 3D :
  - chaque cote, forme et référence vient d'un document officiel du fabricant ou d'une photo officielle ;
  - Park Tool sert seulement pour les gestes ;
  - sources exclues : revendeurs, magazines, tests, comparateurs, forums, vidéos non officielles, copies non officielles, anciens articles ;
  - valeur absente : « non publié » ou « à lire sur la pièce ».
- **Formes non publiées** : une forme absente des documents est dessinée au plus juste et marquée « forme approchée », jamais présentée comme exacte. Les chiffres ne sont jamais approchés dans le texte.
- **Style** : français, tutoiement, phrases courtes, jamais de tiret cadratin ni demi-cadratin, abréviations développées à leur première apparition, conseil sans source dans un encadré « Proposition ».
- **Données personnelles** : ni poids, ni cotes de position, ni nom de fitter, ni adresse, ni lieux de sortie, ni prix d'achat dans le dépôt ou sur le site servi.
- **`dist/site`** embarque toutes ses bibliothèques en local. **`dist/artifact`** charge three.js depuis `https://cdn.jsdelivr.net/npm/three@0.160.0/`.
- **Téléphone d'abord.** Si la 3D ne se charge pas, le schéma 2D prend le relais.
- **Commits** : adresse `183486+ltimsi@users.noreply.github.com` (déjà configurée), fin de message `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, jamais de ligne `Claude-Session`.
- **Pas de push, pas de serveur**, pas d'étiquette `lot-N` avant la validation de Lamine.
- **Ne jamais lire ni copier `brouillons/`** dans le dépôt.

## Review Focus

1. **Téléphone sans WebGL.** La page affiche le schéma 2D avec ses pastilles, les fiches s'ouvrent, et aucune erreur ne remonte. Test : tâche 10, passe `--disable-webgl`.
2. **Lien direct vers un atelier** (`#freins-plaquettes`, depuis la liste « Le jour de la livraison » ou un favori). L'atelier s'ouvre dans le panneau et la scène vise sa zone. Test : tâche 10.
3. **Mode sombre.** Le fond du studio, les pastilles et le texte restent lisibles. Test : tâche 10, captures `dark`.
4. **Écran étroit (360 px) et paysage.** Pas de défilement horizontal, la scène tient dans l'écran. Test : tâche 10, largeurs 360 et 844×390.
5. **Une valeur approchée qui passerait pour exacte.** La liste « Ce qui est approché » et les notes des fiches ne contiennent aucun chiffre. Test : tâche 2 (`approximations()`) et tâche 4 (META).

---

### Task 1: Passer à three.js r160 et aux modules ES

**Files:**
- Create: `vendor/three/three.module.min.js`, `vendor/three/addons/controls/OrbitControls.js`, `vendor/three/addons/geometries/RoundedBoxGeometry.js`, `vendor/three/addons/shaders/HorizontalBlurShader.js`, `vendor/three/addons/shaders/VerticalBlurShader.js`, `vendor/three/LICENSE` (remplacé)
- Delete: `vendor/three/three.min.js`
- Modify: `build/assemble.py` (`pied`, `ecrire_site`, `ecrire_artifact`), `src/js/viewer.js`, `src/parts/99-foot.html`
- Create: `src/scene/app.js` (amorce seulement), `tests/test_assemble.py`

**Interfaces:**
- Produces: `assemble.carte_imports(cible: str) -> str` renvoie le bloc `<script type="importmap">` qui associe `three` et `three/addons/` à `vendor/three/…` pour `site` et à jsDelivr 0.160.0 pour `artifact`. `dist/site/js/scene/` et `dist/artifact/js/scene/` reçoivent une copie de `src/scene/`. `app.js` fait `import * as THREE from 'three'`, puis `window.THREE = THREE` et `window.AtelierViewer.start()`.

- [ ] **Step 0: Capture the r128 baseline before any change.** `python3 build/assemble.py`, then `cd tools && npm install && npx playwright install chromium && node shoot.js ../dist/site/index.html shots-r128 420 light`. Keep the `rotor`, `caliper`, `bleed` captures for Step 6.
- [ ] **Step 1: Write the failing tests** in `tests/test_assemble.py`:
  - `test_carte_imports_site` : la sortie contient `"three": "vendor/three/three.module.min.js"` et `"three/addons/": "vendor/three/addons/"` ;
  - `test_carte_imports_artifact` : la sortie contient `https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js` ;
  - `test_build_site` : il lance `python3 build/assemble.py`, attend un code 0, puis vérifie que `dist/site/vendor/three/three.module.min.js` et `dist/site/js/scene/app.js` existent, et que `index.html` contient `type="importmap"` avant `type="module"` et ne contient plus `three.min.js`.
- [ ] **Step 2: Run** `python3 -m unittest discover -s tests -p 'test_*.py' -v`. Expected: FAIL, `carte_imports` n'existe pas.
- [ ] **Step 3: Vendor three 0.160.0.**
  - Commandes : `npm pack three@0.160.0` dans le dossier de travail temporaire, puis `tar xzf`.
  - Copier les cinq fichiers listés et `LICENSE` sous `vendor/three/`, en gardant les chemins d'`examples/jsm/` sous `addons/`.
  - Supprimer `three.min.js` (r128).
- [ ] **Step 4: Implement** `carte_imports(cible)`. Dans `pied()`, remplacer les balises r128 par :
  - la carte d'imports ;
  - `viewer.js` et les `m-*.js` en scripts classiques, inchangés ;
  - `<script type="module" src="js/scene/app.js">` (artifact : même chemin relatif).
- [ ] **Step 5: Port `viewer.js` to r160.**
  - Supprimer `lin()` : la gestion des couleurs de r160 convertit déjà les hex.
  - `r.outputEncoding = THREE.sRGBEncoding` devient `r.outputColorSpace = THREE.SRGBColorSpace`.
  - Multiplier par `Math.PI` les intensités des lumières (unités physiques depuis r155).
  - Supprimer le démarrage automatique en bas de fichier : `start()` sera appelé par `app.js`.
  - Si `window.THREE` est absent, le message de secours reste celui du fichier actuel.
- [ ] **Step 6: Run** the tests. Expected: PASS. Then `python3 build/assemble.py && cd tools && node shoot.js ../dist/site/index.html shots-r160 420 light`. Expected: `rotor`, `caliper` and `bleed` look close to their `shots-r128` captures (same hues, no black or washed-out render). The `shots*` folders are ignored by Git.
- [ ] **Step 7: Commit** `three.js r160 en modules ES, visionneuse portée`.

### Task 2: Géométrie de la taille M et registre des sources

**Files:**
- Create: `src/scene/geometrie.js`, `src/scene/sources.js`, `tests/js/geometrie.test.mjs`

**Interfaces:**
- Produces:
  - `GEO` : objet `{ cle: { v: number, src: string|null, approche?: true, aVerifier?: string } }` ;
  - `points(geo = GEO)` : renvoie des points 2D en millimètres (x vers l'avant, y vers le haut) `RA, FA, BB, HTt, HTb, STt, SPt, S0, S1, PR, PL, CF, CR, CROWN` et des ancres 3D `ancres: { disqueArriere, disqueAvant, etrierAvant, cocotteGauche }` ;
  - `cheminChaine(p)` : renvoie un tableau de points 2D ;
  - `approximations(geo = GEO)` : renvoie `[{ cle, note }]` ;
  - `SOURCES` : objet `{ id: { titre, url, type: 'fiche'|'manuel'|'photo'|'tableau' } }`.

- [ ] **Step 1: Write the failing tests.**
  - `cotes Canyon` : `points()` doit redonner les cotes de la fiche Canyon 4553, à 0,5 mm ou 0,1° près :
    - `FA[0]-RA[0] = 1076`, `hypot(BB-RA) = 440`, `RA[1]-BB[1] = 75` ;
    - `HTt[1]-BB[1] = 596`, `HTt[0]-BB[0] = 404`, `hypot(HTt-HTb) = 158` ;
    - angle de `HTb→HTt` avec l'horizontale `= 71`, angle du tube de selle `= 73.5` ;
    - `hypot(PR-BB) = 165`, `hypot(S1-S0) = 60`.
  - `sources connues` : chaque `GEO[c]` a soit `src` présent dans `SOURCES`, soit `approche: true`.
  - `approximations sans chiffre` : aucune `note` de `approximations()` ne contient de chiffre (`/\d/`).
  - `angle de direction à vérifier` : `GEO.angleDirection.aVerifier` contient « inclinaison du cintre ».
- [ ] **Step 2: Run** `node --test tests/js/`. Expected: FAIL, modules absents.
- [ ] **Step 3: Implement** `geometrie.js` and `sources.js` from the maquette constants, with these corrections:
  - le cintre de 440 se mesure d'axe en axe au niveau des cocottes, donc `z = ±220` à cet endroit ;
  - la longueur du tube de selle, la hauteur de selle, l'angle de potence, le déport de cintre et le nombre de rayons portent `approche: true`, avec une note sans chiffre.
- [ ] **Step 4: Register the sources** in `SOURCES`:
  - `canyon-4553` : fiche suisse ;
  - `canyon-photo-4553-fv` : photo officielle Floating Violet, URL `https://dma.canyon.com/image/upload/w_1600,c_fit/b_rgb:F2F2F2/f_auto/q_auto/v1785934004/2027_FULL_grizl_cf-7_4553_R126_P06_talwxt` ;
  - les manuels Shimano déjà cités dans `20-freins.html`.
- [ ] **Step 5: Run** the tests. Expected: PASS.
- [ ] **Step 6: Commit** `Géométrie taille M sourcée et registre des sources`.

### Task 3: Matières, studio et outils de construction

**Files:**
- Create: `src/scene/materiaux.js`, `src/scene/studio.js`, `src/scene/outils3d.js`, `tests/js/materiaux.test.mjs`, `tests/js/outils3d.test.mjs`

**Interfaces:**
- Consumes: `THREE` (vendor, importé directement par les tests), et un `RoundedBoxGeometry` factice dans les tests : une classe qui étend `THREE.BoxGeometry`.
- Produces:
  - `marbre(taille = 256, graine = 11)` : renvoie un `Uint8ClampedArray` RGBA, déterministe ;
  - `creerMateriaux(THREE, { texturePeinture })` : renvoie `{ reel: { role: Material }, simple: { role: Material } }`, avec les rôles `paint, protector, carbon, black, tape, hood, saddle, rubber, rim, hub, spoke, steel, rotor, rotorSpider, caliper, pad, padFace, hose, chain, cassette, cogSpider, ring, crank, rd, pulley, housing` ;
  - `creerStudio(THREE, renderer)` : renvoie une `Texture` d'environnement ;
  - `creerOmbre(THREE, renderer, scene, shaders, opts)` : renvoie `{ cuire() }`, avec par défaut `{ largeur: 2400, profondeur: 1100, hauteur: 260, obscurite: 1.25, flou: [2, 0.8], opacite: 0.75 }` ;
  - `creerOutils(THREE, RoundedBoxGeometry, groupe, materiaux)` : renvoie `{ zone(id|null), variante({ zone, k }|null), mesh, inst, tube, tubeZ, ell, rbox, boulon, extr, engrenage, tubeCourbe, lathe }`, toutes les signatures étant celles de la maquette. Chaque maillage reçoit `userData = { role, zone, variante }`.

- [ ] **Step 1: Write the failing tests.**
  - `marbre déterministe` : deux appels donnent des tableaux égaux.
  - `marbre violet` : sur tous les pixels, la moyenne de R est supérieure à celle de B, elle-même supérieure à celle de G.
  - `rôles complets` : `reel` et `simple` ont exactement la liste de rôles ci-dessus.
  - `étiquetage` : après `zone('disques')` et `variante({ zone: 'disques', k: 1 })`, un `tube()` porte ces valeurs dans `userData`.
  - `orientation` : `tube([0,0,0], [0,100,0], …)` a sa position en `[0,50,0]`.
- [ ] **Step 2: Run** `node --test tests/js/`. Expected: FAIL.
- [ ] **Step 3: Implement** by moving the maquette code into these modules.
  - Teintes du Floating Violet : `deep [58,8,32]`, `base [106,18,56]`, `light [182,74,122]`.
  - Lampes du studio : celles de la maquette.
  - `creerMateriaux` ne crée pas de canevas : la texture lui est passée.
- [ ] **Step 4: Run** the tests. Expected: PASS.
- [ ] **Step 5: Commit** `Matières, studio et outils de construction 3D`.

### Task 4: Pièces du cadre, de la fourche et de la selle

**Files:**
- Create: `src/scene/pieces/cadre.js`, `tests/js/pieces.test.mjs`
- Modify: `src/scene/sources.js`

**Interfaces:**
- Consumes: `points()`, `GEO`, `creerOutils`.
- Produces: chaque module de pièce exporte :
  - `META = { id, nom, zone: string|null, sources: string[], approche: string[], aVerifier: string[] }` ;
  - `construire(outils, p, geo)`, qui ajoute ses maillages au groupe des outils.

- [ ] **Step 1: Write the failing tests** in `pieces.test.mjs`, written so that every later piece module goes through them.
  - `META valide` : chaque source de `META.sources` existe dans `SOURCES`, et aucune entrée de `approche` ni de `aVerifier` ne contient de chiffre.
  - `construction` : `construire` ajoute au moins un maillage, et chaque maillage a un `role` connu.
  - `budget` : la somme des triangles de toutes les pièces, instances comprises, reste sous 500 000.
- [ ] **Step 2: Run** the tests. Expected: FAIL.
- [ ] **Step 3: Research the sources** before modelling.
  - Chercher pour le cadre et la fourche les documents Canyon officiels : fiche, page support, photos officielles du coloris.
  - Noter dans `SOURCES` chaque document retenu.
  - Toute forme non publiée va dans `META.approche` : profils des tubes, raccords, haubans, fourche.
  - `aVerifier` : « type de patte de dérailleur ».
- [ ] **Step 4: Implement** `construire` from the maquette, adjusted to the official photo `canyon-photo-4553-fv`:
  - haubans légèrement abaissés sur le tube de selle ;
  - protection de base noire côté transmission ;
  - inserts noirs sur le tube supérieur, le tube oblique et la fourche ;
  - tige SP100 noire ;
  - selle SRX.
- [ ] **Step 5: Run** the tests. Expected: PASS.
- [ ] **Step 6: Commit** `Pièce 3D : cadre, fourche, tige et selle`.

### Task 5: Roues et freins d'origine, disques XT et plaquettes

**Files:**
- Create: `src/scene/pieces/roues.js`, `src/scene/pieces/freins.js`
- Modify: `src/scene/sources.js`, `tests/js/pieces.test.mjs` (liste des modules)

**Interfaces:**
- Produces:
  - `freins.js` étiquette :
    - les disques SM-RT64 `variante { zone: 'disques', k: 0 }` et les RT-MT800 `variante { zone: 'disques', k: 1 }` ;
    - l'étrier avant et ses plaquettes `zone: 'etrier'` ;
    - les cocottes et les durites `zone: 'manettes'`, construites dans la tâche 6.
  - `freins.js` exporte `PLAQUETTES`, un tableau `[{ groupe, base: Vector3, dir: Vector3 }]` qui sert à l'animation de sortie (46 mm de course, comme dans la maquette, mouvement seulement).

- [ ] **Step 1: Add the failing tests.**
  - Variante : les maillages `variante.zone === 'disques'` existent pour `k = 0` et `k = 1`.
  - Plaquettes : `PLAQUETTES.length === 2`.
- [ ] **Step 2: Run** the tests. Expected: FAIL.
- [ ] **Step 3: Research the sources.**
  - DT Swiss Gravel LN : nombre de rayons, profil de jante, moyeux.
  - Continental Terra Adventure : dessin des crampons, photos officielles.
  - Shimano SM-RT64 et RT-MT800 : dessin des branches, trous et ailettes, d'après les pages produit et le manuel DM-HB0002.
  - Étrier GRX flat mount.
  - Le modèle exact de l'étrier va dans `aVerifier` : « modèle exact de l'étrier, à lire sur la pièce ».
- [ ] **Step 4: Implement** from the maquette, with the found forms, and everything else in `approche`.
- [ ] **Step 5: Run** the tests. Expected: PASS.
- [ ] **Step 6: Commit** `Pièces 3D : roues, disques d'origine et XT, étriers et plaquettes`.

### Task 6: Transmission et poste de pilotage

**Files:**
- Create: `src/scene/pieces/transmission.js`, `src/scene/pieces/poste.js`
- Modify: `src/scene/sources.js`, `tests/js/pieces.test.mjs`

**Interfaces:**
- Produces: les cocottes ST-RX610 et les durites de frein portent `zone: 'manettes'`. Pas de pédales : le vélo est livré sans.

- [ ] **Step 1: Add the failing tests.**
  - Cassette : la liste des dentures du module est égale à la source. Valeur attendue pour la CS-M7100 10-45 : `[10,12,14,16,18,21,24,28,32,36,40,45]`. Si le document Shimano dit autre chose, la source gagne.
  - Dérailleur : `META.sources` de `transmission.js` contient la fiche Canyon qui donne la chape courte.
- [ ] **Step 2: Run** the tests. Expected: FAIL.
- [ ] **Step 3: Research the sources.**
  - Shimano : DM-GAFC001 (pédalier), DM-MACS001 (cassette), DM-MACN001 (chaîne), DM-GARD010 (RD-RX822).
  - Canyon : cintre HB0067 (440, collier 31,8), potence ST0046 (60).
  - Le dérailleur d'origine est à chape courte (GS), alors que la maquette avait une chape longue : corriger.
- [ ] **Step 4: Implement** from the maquette, with the hoods posed on the bar curve (maquette code, `hA`/`hB` block).
- [ ] **Step 5: Run** the tests. Expected: PASS.
- [ ] **Step 6: Commit** `Pièces 3D : transmission d'origine et poste de pilotage`.

### Task 7: Scène, zones et schéma 2D

**Files:**
- Create: `src/scene/scene.js`, `src/scene/schema2d.js`, `src/scene/zones.json`, `tests/js/zones.test.mjs`

**Interfaces:**
- Consumes: tous les modules précédents.
- Produces:
  - `zones.json` : `[{ id, nom, ancre: <nom d'ancre de points().ancres>, vue: { cible: <ancre>, dir: [x,y,z], dist }, schema: { centre: <ancre>, largeur }, variante?: { libelles: [string, string] } }]`, pour les zones `disques`, `etrier`, `manettes` ;
  - `creerScene(libs, canvas, zones)` renvoie `{ rendu(mode: 'reel'|'simple'), surligner(id|null), viser(id), ensemble(), variante(id, k), redimensionner(w, h), image(now) -> bool, pastilles() -> [{ id, x, y, visible }], approximations() -> [{ piece, approche, aVerifier, sources }] }` ;
  - `dessinerSchema(svg, p, zones)` renvoie `{ cadrer(id|null), pastilles(w, h) -> [{ id, x, y, visible }], surligner(id|null) }`.

- [ ] **Step 1: Write the failing tests.**
  - `ancres connues` : chaque `ancre`, `vue.cible` et `schema.centre` de `zones.json` existe dans `points().ancres`.
  - `zones attendues` : les identifiants sont exactement `['disques', 'etrier', 'manettes']`.
  - `variantes` : `disques.variante.libelles` vaut `['D’origine · SM-RT64', 'XT · RT-MT800']` et `etrier.variante.libelles` vaut `['Plaquettes en place', 'Plaquettes sorties']`.
- [ ] **Step 2: Run** `node --test tests/js/`. Expected: FAIL.
- [ ] **Step 3: Implement** `scene.js` from the maquette's `init3d`.
  - Rendu à la demande : `image()` ne dessine que si quelque chose a bougé.
  - Surlignage émissif `0x6d5bd0` à 0,22 en rendu réaliste.
  - Vol de caméra en 850 ms, instantané si l'utilisateur préfère réduire les animations.
  - L'ombre est recuite après chaque changement de variante.
- [ ] **Step 4: Implement** `schema2d.js` from the maquette's `build2d`, driven by `zones.json`.
- [ ] **Step 5: Run** the tests. Expected: PASS.
- [ ] **Step 6: Commit** `Scène 3D, zones et schéma 2D`.

### Task 8: Page d'accueil, panneau de fiche et liste des approximations

**Files:**
- Modify: `src/parts/05-top.html`, `src/parts/00-head.html`, `src/parts/99-foot.html`, `src/scene/app.js`, `build/assemble.py`, `build/lots.json`, `tests/test_assemble.py`

**Interfaces:**
- Consumes: `creerScene`, `dessinerSchema`, et `<script type="application/json" id="zones-data">`, injecté par `assemble.py` depuis `src/scene/zones.json`.
- Produces:
  - balisage de la scène dans `05-top.html` : `figure#scene` avec les trois onglets de la maquette `Schéma 2D | 3D simple | 3D réaliste`, la 3D réaliste ouverte par défaut, `svg#plan`, `canvas#gl`, `#pins`, `#chips`, `#fiche`, `button#approche` et `dialog#approche-liste` ;
  - `ouvrirAtelier(id)` dans `app.js`, qui déplace la section `#id` dans `#fiche` et laisse à sa place un `<p class="muted">` « Atelier ouvert en haut de page » ;
  - `build/lots.json` gagne le lot 0 `{ "lot": 0, "titre": "Le vélo en 3D", "statut": "en relecture", "parts": [], "nav": [], "modeles": [] }`.

- [ ] **Step 1: Write the failing tests** in `test_assemble.py`.
  - `test_zones_injectees` : `index.html` contient `id="zones-data"` et le JSON de `zones.json`.
  - `test_scene_presente` : `index.html` contient `canvas id="gl"`, `svg id="plan"` et `dialog id="approche-liste"`.
  - `test_lot0` : la sortie du script liste `0 (en relecture)`.
- [ ] **Step 2: Run** the tests. Expected: FAIL.
- [ ] **Step 3: Implement** the markup and the CSS.
  - Reprendre la maquette avec les jetons existants de `00-head.html`.
  - Pied de page : remplacer « Les pièces en 3D sont des modèles simplifiés : elles montrent la disposition et l'ordre de montage, pas les cotes exactes. » par « Le vélo et ses pièces sont dessinés d'après les documents officiels. Ce qui n'est pas publié est marqué « forme approchée » : la liste est derrière le bouton « Ce qui est approché ». »
- [ ] **Step 4: Implement** `app.js`.
  - Si la 3D échoue, basculer vers le schéma 2D.
  - Pastilles et puces : `ouvrirZone(id)` liste les ateliers de la zone (`section.atelier[data-zone=id]`), ouvre le premier, vise la zone et surligne.
  - Bouton de variante, si la zone en a une et si la vue est en 3D.
  - Dans chaque fiche, note « Formes approchées : … », construite depuis les `META` des pièces de la zone.
  - Dialogue des approximations : par pièce, ce qui est sourcé (liens), ce qui est approché, ce qui reste à vérifier à la livraison.
  - Une ancre `#id` d'atelier dans l'URL, au chargement ou par `hashchange`, appelle `ouvrirAtelier`.
- [ ] **Step 5: Run** the tests. Expected: PASS.
- [ ] **Step 6: Commit** `Page d'accueil : vélo 3D, fiches d'ateliers, approximations`.

### Task 9: Le chapitre Freins devient des ateliers

**Files:**
- Modify: `src/parts/20-freins.html`, `build/assemble.py` (`controles`), `tests/test_assemble.py`

**Interfaces:**
- Produces: chaque atelier est une `section class="sub atelier"` qui porte `data-zone` et `data-type` (`comprendre|entretenir|regler|remplacer`), plus `data-de` et `data-vers` pour `remplacer`. Elle contient :
  - `.a-dem` : à démonter avant ;
  - `.kit` : outils ;
  - `ol.steps` : gestes ;
  - `ul.media` : vidéo, ou une phrase `p.a-video` qui dit qu'aucune vidéo officielle n'existe.
  
  Les types `comprendre` n'ont ni `.a-dem`, ni `.kit`, ni `ol.steps`.

- [ ] **Step 1: Write the failing tests.**
  - `test_ateliers_complets` : chaque `section.atelier` a ses blocs obligatoires selon son type.
  - `test_zones_des_ateliers` : chaque `data-zone` existe dans `zones.json`, et chaque zone a au moins un atelier publié.
  - `test_correspondance` : les attributs exacts :

| section | data-zone | data-type | data-de | data-vers |
|---|---|---|---|---|
| `freins-systeme` | manettes | comprendre | | |
| `freins-disques` | disques | remplacer | Shimano SM-RT64 | Shimano Deore XT RT-MT800 |
| `freins-plaquettes` | etrier | remplacer | Plaquettes d’origine | Shimano L04C-MF |
| `freins-rodage` | disques | entretenir | | |
| `freins-centrage` | etrier | regler | | |
| `freins-controles` | etrier | entretenir | | |
| `freins-purge` | manettes | entretenir | | |
| `freins-securite` | manettes | comprendre | | |

- [ ] **Step 2: Run** the tests. Expected: FAIL.
- [ ] **Step 3: Implement** the restructuring, without adding any fact.
  - `.a-dem` reprend uniquement ce que disent les gestes existants. Exemple pour les disques : « La roue », d'après le geste « Dépose la roue et pose la cale ».
  - Les vidéos de 2.8 sont réparties :

| Atelier | Vidéos |
|---|---|
| disques | `SE9DJKXmIy8` |
| plaquettes | `Xqw0SaZl-jo` |
| centrage | `uk_nC9anQcM`, `OuWhc_9RciU` |
| contrôles | `vQXFFgRButo`, `O0c2Ez2v0PU` |
| purge | `mAEeAKmCLFU` |
| rodage | page support Canyon |
| système | `p.a-video` « Pas de vidéo officielle de présentation. Les manuels sont dans l'atelier Sécurité et manuels. » |

  - 2.8 garde la sécurité et les manuels.
- [ ] **Step 4: Run** the tests, then `python3 build/assemble.py`. Expected: PASS, code 0, no dash, no duplicate id.
- [ ] **Step 5: Commit** `Lot 1 : le chapitre Freins devient des ateliers`.

### Task 10: Contrôle visuel, documentation et aperçu pour Lamine

**Files:**
- Create: `tools/scene-check.js`
- Modify: `docs/lots.md`, `docs/PASSATION.md`, `README.md`

**Interfaces:**
- Consumes: `dist/site/index.html`.
- Produces: `node scene-check.js <page.html> <dossier> <largeur> <hauteur> <light|dark> [--disable-webgl]`. Le script enregistre `scene-reel.png`, `scene-2d.png`, une capture par atelier ouvert, et `rapport.json` : `{ erreurs: [], debordement: bool, triangles: number, ancreOuverte: bool }`.

- [ ] **Step 1: Write** `scene-check.js`, which fails (exit 1) in these cases:
  - `erreurs` n'est pas vide ;
  - `debordement` est vrai ;
  - `triangles` dépasse 500 000 ;
  - en chargeant `index.html#freins-plaquettes`, l'atelier ne se trouve pas dans `#fiche`.
- [ ] **Step 2: Run it** on every combination below. Expected: exit 0 for each.
  - Largeur 420 : `light` et `dark`.
  - Largeur 360.
  - Paysage 844×390.
  - Largeur 420 avec `--disable-webgl` : le 2D doit être visible, sans erreur.
- [ ] **Step 3: Look at every capture** and compare the realistic render to the official photo `canyon-photo-4553-fv`. Fix what differs only when a source supports the fix.
- [ ] **Step 4: Update the documentation.**
  - `docs/lots.md` : lot 0 et lot 1 en relecture, liste des approximations.
  - `docs/PASSATION.md` : nouvelle arborescence `src/scene/`, commandes de test.
  - `README.md` : description et arborescence.
- [ ] **Step 5: Commit** `Contrôle visuel de la scène et documentation`.
- [ ] **Step 6: Publish the preview.**
  - Construire `python3 build/assemble.py --target artifact`.
  - Publier `dist/artifact` sur l'aperçu privé existant de Lamine : lien dans `atelier-grizl-liens-prives`, chemins `index.html`, `js/…` et `viewer.js`.
  - Lui envoyer le lien avec la liste de ce qui reste approché. Puis attendre sa relecture : pas de push, pas de serveur.

## Après la validation de Lamine

Statuts « validé » dans `build/lots.json`, commit, étiquettes `lot-0` et `lot-1`, push vers GitHub. Le déploiement sur le serveur se fait seulement après son accord explicite, en suivant `deploy/DEPLOIEMENT.md`.
