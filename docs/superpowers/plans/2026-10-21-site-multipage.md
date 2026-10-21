# Site en plusieurs pages : plan de réalisation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformer le site d'une seule page en un vrai site : un menu des catégories, une page par catégorie, une page par atelier en deux colonnes, des pages de référence, en pleine largeur pour l'ordinateur.

**Architecture:** Le contenu reste écrit dans les fragments de `src/parts/`. `build/assemble.py` les lit à travers un petit arbre HTML (`build/dom.py`), qui relit le source à l'identique et permet de déplacer et d'envelopper des blocs. Il découpe les chapitres en ateliers (`build/ateliers.py`), habille chaque page d'un gabarit commun avec menu, fil d'Ariane et recherche (`build/gabarit.py`), puis écrit une page par adresse (`build/pages.py`). Côté navigateur, `js/site.js` (module ES) gère le menu sur téléphone, la recherche, les listes à cocher, les étapes, le mode pas à pas, les onglets de figures et les filtres. `js/scene/app.js` garde la scène 3D de la page d'accueil, sans la fiche.

**Tech Stack:** Python 3 (bibliothèque standard seulement), HTML et CSS statiques, JavaScript en modules ES, three.js 0.160.0 (déjà dans `vendor/three/`), Node 24 (`node:test`), Playwright 1.56.0 (`tools/`).

**Spec:** `docs/superpowers/specs/2026-10-21-site-multipage-design.md` (maquette validée : `docs/superpowers/specs/2026-10-21-maquette-site.html`)

## Global Constraints

- Aucun texte d'atelier n'est réécrit. Les textes, chiffres, sources et liens de `src/parts/20-freins.html` passent tels quels dans les pages. On ajoute seulement des attributs `data-resume`, sans toucher au texte.
- Sont permis seulement : les libellés d'interface, la page Composants d'origine (recopiée de `docs/recherche/composants-origine.md`) et les listes « prévu » des lots à venir (fixées en tâche 3).
- Aucun tiret cadratin ni demi-cadratin (— –) dans aucune page générée, ni dans aucun fichier écrit.
- Français, tutoiement, phrases courtes.
- Aucune donnée personnelle, aucun lien privé (claude.ai, docs.google.com) dans le dépôt.
- Le build n'utilise que la bibliothèque standard de Python.
- Tous les liens et chemins des pages sont relatifs. Aucun ne commence par `/`.
- La carte d'imports du site pointe vers `./vendor/three/` à la racine et vers `../` (répété selon la profondeur) ailleurs. Ne jamais écrire un nom nu : Chromium ignorerait la ligne.
- Les lots 0 et 1 restent « en relecture ».
- Les adresses :

  | Page | Adresse |
  |---|---|
  | Mon vélo | `` (la racine) |
  | Catégorie | `freins/` |
  | Atelier | `freins/<id sans "freins-">/` |
  | Catégorie à venir | `<id de catégorie>/` |
  | Références | `composants/`, `outils/`, `couples/`, `approche/`, `sources/` |

  Chaque page est le fichier `index.html` de son dossier.
- Les anciennes ancres de la racine redirigent : `#freins-plaquettes` vers `freins/plaquettes/`, `#freins` vers `freins/`, `#freins-pl-2` vers `freins/plaquettes/#freins-pl-2`.
- Sans JavaScript, tout reste lisible : étapes et blocs en `<details>`, menu et fil d'Ariane en HTML.
- Points de rupture :
  - au-dessus de 1100 px : deux colonnes ;
  - en dessous : une seule colonne ;
  - sous 900 px : menu derrière le bouton « Menu ».
- La page ne défile jamais horizontalement.
- Tests Python : `python3 -m unittest discover -s tests -p 'test_*.py'`.
- Tests Node : `node --test 'tests/js/**/*.test.mjs'`. La forme `node --test tests/js/` échoue sous Node 24.18.
- Commits avec `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, jamais de ligne `Claude-Session`.

## Review Focus

1. **Ancien favori `/#freins-plaquettes`.** Il ouvre la page de l'atelier, pas la page d'accueil vide. Testé en tâche 5 (`cibleAncienne`) et en tâche 7 (scene-check).
2. **Page profonde `freins/plaquettes/`.** Scripts, three.js, pièces 3D et liens s'y chargent avec les bons chemins relatifs. Testé en tâche 4 (`liens_casses` couvre aussi les `src` des fichiers) et en tâche 7 (canvas de la pièce 3D dessiné).
3. **Navigateur sans JavaScript.** Les étapes et les blocs restent ouvrables et aucun contenu n'est caché par un attribut `hidden`. Testé en tâche 2 (aucun `hidden` dans les colonnes) et en tâche 7 (scénario `--sans-js`).
4. **Fenêtres de 360 px, 1024 px et 1440 px.** Pas de défilement horizontal, menu replié sous 900 px, colonne de droite qui ne recouvre pas la gauche. Testé en tâche 7.
5. **Ateliers aux figures inégales** : planche et 3D (2.2, 2.3, 2.7), planche seule (2.4, 2.5), ou rien (2.1, 2.6, 2.8). La colonne de droite n'a pas d'onglets vides et aucune boîte ne reste vide. Testé en tâche 2.

---

### Task 1: Arbre HTML fidèle (`build/dom.py`)

**Files:**
- Create: `build/dom.py`
- Test: `tests/test_dom.py`

**Interfaces:**
- Produces:
  - `analyser(texte: str) -> Element` : la racine, dont `tag` vaut `None`.
  - `class Element` : `tag: str | None`, `attrs: list[tuple[str, str | None]]`, `enfants: list[Element | Texte | Commentaire]`, `parent: Element | None`.
    - Méthodes : `get(nom) -> str | None`, `set(nom, valeur)`, `classes() -> list[str]`, `html() -> str`, `interieur() -> str`, `texte() -> str` (texte décodé, espaces réduits), `retirer()`, `inserer(i, noeud)`, `ajouter(noeud)`.
  - `class Texte(brut: str)`.
  - `class Commentaire(brut: str)`.
  - `selectionner(racine: Element, selecteur: str) -> list[Element]` : descendants dans l'ordre du document. Formes acceptées : `tag`, `.classe`, `tag.classe`, `tag.classe1.classe2`, `[attr]`, `tag[attr="valeur"]`, et une descendance directe `a > b` d'un seul niveau.
  - `fragment(texte: str) -> list[noeud]` : analyse un bout de HTML et rend ses nœuds de premier niveau, à insérer.

- [ ] **Step 1: Write the failing tests** in `tests/test_dom.py`:
  - `test_aller_retour_exact` : pour chaque fichier de `src/parts/*.html`, `analyser(t).html() == t`.
  - `test_attributs_et_classes` : `analyser('<p class="a b" id="x">t</p>')`. Le premier enfant a `classes() == ["a", "b"]` et `get("id") == "x"`. Après `set("id", "y")`, `html() == '<p class="a b" id="y">t</p>'`.
  - `test_texte` : `analyser("<p>Serre à <span class=\"nm\">40&nbsp;Nm</span> .</p>").enfants[0].texte() == "Serre à 40 Nm ."`.
  - `test_selection` : sur le source de 20-freins.html, `len(selectionner(r, "section.atelier")) == 8` et `len(selectionner(r, "ol.steps > li")) == 41`.
  - `test_deplacer` : retirer un nœud puis l'ajouter ailleurs met à jour `parent` et le HTML des deux côtés.
  - `test_vides_et_autofermants` : `<br>`, `<input type="checkbox" id="c">` et `<path d="M0,1"/>` reviennent à l'identique.

- [ ] **Step 2: Run** `python3 -m unittest tests.test_dom -v`. Expected: FAIL (module absent).

- [ ] **Step 3: Implement `build/dom.py`** sur `html.parser.HTMLParser` avec `convert_charrefs=False`.
  - Chaque élément garde sa balise d'ouverture brute (`get_starttag_text()`) et la réécrit telle quelle tant que `set()` n'a pas été appelé.
  - Le texte garde ses entités brutes (`handle_entityref` et `handle_charref` réécrivent `&nom;` et `&#n;`).
  - Les éléments vides HTML (`area br col embed hr img input link meta source track wbr`) n'ont pas de balise fermante.
  - `<script>` et `<style>` gardent leur contenu brut.

- [ ] **Step 4: Run** `python3 -m unittest tests.test_dom -v`. Expected: PASS.

- [ ] **Step 5: Commit**: `git add build/dom.py tests/test_dom.py && git commit -m "Arbre HTML fidèle pour découper les chapitres"`

---

### Task 2: Les ateliers d'un chapitre (`build/ateliers.py`)

**Files:**
- Create: `build/ateliers.py`
- Modify: `src/parts/20-freins.html`. Seulement deux attributs :
  - `data-resume="couples"` sur le `div.tbl` qui suit `<h4>Les couples de tes freins</h4>` ;
  - `data-resume="ordre"` sur l'`aside.note.prop` dont le titre est « Proposition : l'ordre du jour J ».
- Test: `tests/test_ateliers.py`

**Interfaces:**
- Consumes: `build/dom.py` (tâche 1).
- Produces:
  - `@dataclass Etape` : `titre: str`, `couples: list[str]`. `couples` contient les textes des `span.nm` du corps de l'étape, dans l'ordre et sans doublon.
  - `@dataclass Atelier` :
    - `id`, `slug` (l'id sans le préfixe `<chapitre>-`), `num` (« 2.3 »), `titre` (« Changer les plaquettes »), `type`, `zone` ;
    - `de: str | None`, `vers: str | None`, `demonter: str | None` (texte du `p` de `.a-dem`) ;
    - `outils: list[str]` (textes des `li` de `.kit`) ;
    - `etapes: list[Etape]` : tous les `ol.steps > li` de la section, y compris ceux dans un `<details>` ;
    - `blocs: list[str]` : pour le type comprendre, les titres de ses blocs repliables (voir `test_blocs_comprendre`) ;
    - `modeles: list[str]` : les valeurs de `data-model` ;
    - `section: Element`.
  - `@dataclass Chapitre` : `id`, `tete: Element` (le `header.ch-head`), `ateliers: list[Atelier]`, `resumes: dict[str, list[Element]]` (par valeur de `data-resume`).
  - `relever_chapitre(texte: str) -> Chapitre`.
  - `colonnes(a: Atelier) -> tuple[str, str]` : le HTML de la colonne de gauche et celui de la colonne de droite, après transformation d'une **copie** de la section.

- [ ] **Step 1: Write the failing tests** in `tests/test_ateliers.py`. Elles portent sur le vrai `src/parts/20-freins.html` :
  - `test_releve` :
    - 8 ateliers, ids et slugs dans l'ordre (`systeme, disques, plaquettes, rodage, centrage, controles, purge, securite`) ;
    - `plaquettes` : `num == "2.3"`, `titre == "Changer les plaquettes"`, `de == "Plaquettes d’origine"`, `vers == "Shimano L04C-MF"`, `demonter == "La roue."`, `len(outils) == 9`, `len(etapes) == 10`, `etapes[5].couples == ["1-1,5 Nm", "0,2-0,4 Nm"]` ;
    - `purge` : 11 étapes ;
    - `controles` : `len(blocs) == 8`, sans « Vidéos » ;
    - `resumes["couples"]` et `resumes["ordre"]` ont un élément chacun.
  - `test_etapes_repliables` : dans la gauche de `plaquettes`, il y a 10 `li.step`.
    - Chaque `li.step` contient un `details` dont le `summary` a, dans l'ordre : `span.st-n` (« 1 » à « 10 »), `span.st-t` (le titre), puis, s'il existe, un `span.nm` (le premier couple de l'étape).
    - Le corps est dans `div.st-b`.
    - Aucun `p.st-t` ne reste.
  - `test_blocs_comprendre` : pour le type comprendre, deux sortes de blocs repliables.
    - Chaque `div.flow > div.q` devient un `details.q`. Son `summary` est le texte du `b`, et le reste forme le corps.
    - Chaque `h4` enfant direct de la section, et chaque `div.check-head`, ouvre un `details.bloc`. Le bloc va jusqu'au bloc suivant. Son `summary` est le texte du `h4`. Le bouton d'un `check-head` passe en tête du corps.
    - Un `h4` « Vidéo » ou « Vidéos » n'ouvre pas de bloc : il reste visible avec ce qui le suit.
    - Le premier `details.bloc` porte `open`, et le contenu placé avant la première limite reste visible hors des blocs.
    - Attendu pour `controles` : 7 `details.q` et 1 `details.bloc`. `blocs` vaut 8 titres, du premier « Disque usé » au dernier « Après un chantier de freins ».
    - Attendu pour `systeme` : 5 `details.bloc`, dont « Les couples de tes freins ».
    - `Atelier.blocs` contient les titres des `details.bloc`, et ceux des `details.q` qui ne sont dans aucun bloc.
  - `test_droite` : la droite de `plaquettes` contient, dans l'ordre :
    - `div.figures[data-onglets]` avec ses 2 figures (`figure.plate`, `figure.v3d`) ;
    - `div.a-dem` ;
    - `div.kit` dont la liste est un `ul.check[data-key="kit-freins-plaquettes"]` de 9 cases, ids `ck-freins-plaquettes-kit-1` à `-9` ;
    - `div.couples-atelier`, avec une ligne par étape qui a un couple, sous la forme « Étape 6 · Monte l'ensemble et serre l'axe » ;
    - la vidéo (`h4` puis `ul.media`).

    La gauche ne contient plus aucun de ces blocs.
  - `test_figures_inegales` :
    - `rodage` : une seule figure et pas de `data-onglets` ;
    - `systeme` : aucune `div.figures`, et ses vidéos (`p.a-video`) restent à gauche, comme tout le contenu des fiches « comprendre » ;
    - aucune boîte vide à droite (pas de `div.couples-atelier` sans ligne).
  - `test_sans_hidden` : ni la gauche ni la droite d'aucun atelier ne contiennent l'attribut `hidden`.
  - `test_texte_conserve` : pour chaque atelier, chaque texte de `p` et de `li` de la section source se retrouve dans `gauche + droite` (comparaison sur `texte()`).

- [ ] **Step 2: Run** `python3 -m unittest tests.test_ateliers -v`. Expected: FAIL.

- [ ] **Step 3: Add the two `data-resume` attributes** to `src/parts/20-freins.html`. Then implement `build/ateliers.py`.
  - Ce qui passe à droite :
    - pour tous les types : les figures ;
    - pour les types autres que comprendre : aussi `.a-dem`, `.kit`, les couples relevés, puis le dernier `h4` de vidéo et le `ul.media` ou `p.a-video` qui le suit.
  - Le `h3` ne passe dans aucune colonne : le gabarit en fait le `h1`.

- [ ] **Step 4: Run** `python3 -m unittest tests.test_ateliers tests.test_dom -v`. Expected: PASS.

- [ ] **Step 5: Commit**: `git commit -m "Découpe des chapitres en ateliers : étapes repliables, colonne de droite"`

---

### Task 3: Gabarit commun, menu et liens (`build/gabarit.py`, `build/lots.json`)

**Files:**
- Create: `build/gabarit.py`
- Modify: `build/lots.json`
- Modify: `src/parts/00-head.html`, `src/parts/99-foot.html`. Seulement : retirer `<title>` de 00-head, et retirer de 99-foot le script des listes à cocher et de la barre de chapitres, qui passent dans `site.js` en tâche 5.
- Test: `tests/test_gabarit.py`

**Interfaces:**
- Consumes: `Chapitre` et `Atelier` (tâche 2).
- Produces:
  - `build/lots.json` :
    - chaque lot publié qui a une catégorie gagne `"categorie": {"id": ..., "menu": ...}` ;
    - chaque lot à faire gagne `"categorie"` et `"prevu": [str]` ;
    - le champ `"nav"` disparaît.

    Valeurs exactes :

    - lot 1 : `{"id": "freins", "menu": "Freins"}`.
    - lot 2 : `{"id": "montage", "menu": "Montage à la livraison"}`, prévu :
      - « Monter le vélo sorti du carton : cintre, roue avant, selle, contrôles avant la première sortie. »
      - « Monter les pédales PD-ME700 et les cales SPD. »
      - « Reporter ta position sur le Grizl : la forme de cet atelier sera décidée au lot 2. »
    - lot 3 : `{"id": "tubeless", "menu": "Pneus et tubeless"}`, prévu :
      - « Passer les pneus en tubeless : valves, liquide, pompe à réservoir. »
      - « Crevaisons. »
    - lot 4 : `{"id": "transmission", "menu": "Transmission"}`, prévu :
      - « Chaîne : usure, nettoyage, lubrification. »
      - « Réglage du dérailleur. »
      - « Kit montée : plateau GRX de 38 dents, cassette SLX 10-51, dérailleur RD-RX822-SGS, chaîne CN-M7100. »
    - lot 5 : `{"id": "accessoires", "menu": "Accessoires des trajets"}`, prévu :
      - « Porte-bagages Ortlieb Quick-Rack L. »
      - « Garde-boue Canyon DEFEND. »
      - « Éclairage Knog Blinder et sonnette Knog Oi Luxe. »
      - « Porte-bidons et support d'antivol. »
    - lot 6 : `{"id": "revision", "menu": "Révision et couples"}`, prévu :
      - « Ma révision : ce qu'il faut contrôler et quand, avec uniquement des intervalles publiés. »
      - « Aide-mémoire des couples des lots validés. »
  - `@dataclass Page` :
    - `chemin: str` (`""`, `"freins/"`, `"freins/plaquettes/"`…), `titre: str` (pour `<title>`, « Atelier Grizl » à la racine, sinon « <titre> · Atelier Grizl ») ;
    - `fil: list[tuple[str, str | None]]` (libellé, chemin ou None) ;
    - `contenu: str` ;
    - `categorie: str | None` (id de la catégorie à déplier dans le menu) ;
    - `scripts: dict` avec les clés :
      - `zones: bool`, `liens: bool`, `three: bool`, `modeles: list[str]`, `app: bool`, `references: bool`, `garde_fou: bool`.
  - `base(chemin: str) -> str` : `""` à la racine, `"../"` répété selon la profondeur.
  - `menu(config: dict, chapitres: dict[str, Chapitre], page: Page) -> str` : `<nav class="nav">`.
    - Groupes :
      - « Mon vélo » ;
      - « Ateliers » : les catégories des lots publiés avec leur nombre d'ateliers ; quand `page.categorie` vaut leur id, la liste de leurs ateliers (« 2.1 » et titre) ;
      - les catégories à venir, en `class="soon"` avec « lot N » ;
      - « Références », dans cet ordre : Composants d'origine, Outils, Couples de serrage, Ce qui est approché, Sources.
    - Le lien de la page courante porte `aria-current="page"`. Tous les liens sont relatifs à `page.chemin`.
  - `fil_ariane(page: Page) -> str`.
  - `reecrire_liens(html: str, chemin: str, ancres: dict[str, str]) -> str` :
    - `ancres` associe chaque id à la page qui le porte ;
    - un `href="#id"` devient le chemin relatif de cette page, suivi de `#id` sauf quand l'id est celui de la page elle-même (atelier ou chapitre) ;
    - un id inconnu devient `<span class="muted">texte</span>` (comportement actuel).
  - `document(page: Page, config: dict, chapitres: dict, cible: str) -> str`.
    - Le document comprend :
      - la tête (00-head et `<title>`) ;
      - `<div class="app" data-base="...">` avec le menu (`aside.side#side`), puis la barre du haut (bouton `#menu-btn`, fil d'Ariane, `input#recherche` et `div#resultats`), puis `main.page` avec le contenu ;
      - le pied (99-foot) et les scripts.
    - Selon la cible :
      - pour `"site"` : document complet (`<!doctype html>`, `<html lang="fr">`) ;
      - pour `"artifact"` : sans squelette à la racine, document complet ailleurs.
    - Les scripts :
      - toujours `js/recherche.js` (classique) puis `js/site.js` (module) ;
      - selon `page.scripts` : `zones-data`, `liens-data`, la carte d'imports (site : vendor local relatif ; artifact : jsDelivr), `js/viewer.js` et `js/m-<modele>.js`, `js/scene/app.js`, `js/references.js`, et le garde-fou de 99-foot.

- [ ] **Step 1: Write the failing tests** in `tests/test_gabarit.py` :
  - `test_base` : `base("") == ""`, `base("freins/") == "../"`, `base("freins/plaquettes/") == "../../"`.
  - `test_menu_courant` :
    - pour une page `freins/plaquettes/` de catégorie `freins`, le menu contient `aria-current="page"` sur le lien `href="./"` de l'atelier 2.3, et les 8 ateliers ;
    - le lien de Mon vélo vaut `href="../../"` ;
    - « Transmission » porte `class="soon"` et « lot 4 ».
  - `test_menu_replie` : sur la page `outils/`, la liste des ateliers de Freins n'est pas dépliée.
  - `test_reecrire_liens` :
    - depuis `freins/purge/`, `href="#freins-plaquettes"` devient `href="../plaquettes/"` ;
    - `href="#freins-pl-2"` devient `href="../plaquettes/#freins-pl-2"` ;
    - `href="#montage"` (absent) devient `<span class="muted">` ;
    - depuis la racine, `href="#freins"` devient `href="freins/"`.
  - `test_carte_imports` :
    - site, profondeur 2 : `"three": "../../vendor/three/three.module.min.js"` ;
    - racine : `"./vendor/three/three.module.min.js"` ;
    - artifact : jsDelivr 0.160.0, comme aujourd'hui.
  - `test_document_artifact` : `document(...)` pour la racine en cible artifact ne contient ni `<!doctype` ni `<html`, et pour `freins/` il les contient.

- [ ] **Step 2: Run** `python3 -m unittest tests.test_gabarit -v`. Expected: FAIL.

- [ ] **Step 3: Implement** `build/gabarit.py`, then update `build/lots.json`, `00-head.html` and `99-foot.html`.
  - Le garde-fou de 99-foot ne vise plus `#fiche` ni `#chips`. Son message devient : « La page n’a pas pu se charger en entier. Les ateliers restent accessibles par le menu et par « Où intervenir ». »

- [ ] **Step 4: Run** `python3 -m unittest tests.test_gabarit -v`. Expected: PASS.

- [ ] **Step 5: Commit**: `git commit -m "Gabarit commun : menu des catégories, fil d'Ariane, liens entre pages"`

---

### Task 4: Les pages et leur écriture (`build/pages.py`, `build/assemble.py`)

**Files:**
- Create: `build/pages.py`
- Create: `src/parts/composants.html`
- Modify: `build/assemble.py` (réécriture de l'orchestration)
- Modify: `deploy/nginx.conf`. Toutes les pages `.html` sont servies sans cache, pas seulement `/index.html`.
- Test: `tests/test_pages.py`
- Modify: `tests/test_assemble.py`. Il faut adapter les tests qui supposaient une page unique.

**Interfaces:**
- Consumes: tâches 2 et 3.
- Produces:
  - Constructeurs, chacun rendant une `Page` :
    - `page_accueil(config, chapitres, zones: list[dict]) -> Page` : le contenu de 05-top. Le build y remplace trois marques que la tâche 6 placera :
      - `<!--OU-INTERVENIR-->` : un `div.zone-carte[data-zone]` par zone, avec son numéro, `button.zone-btn[data-zone]` à son nom, et la liste de ses ateliers publiés (numéro, titre, type), en liens ;
      - `<!--A-REMPLACER-->` : une ligne par atelier de type remplacer, « vers » à la place de « de », lien vers l'atelier ;
      - `<!--CATEGORIES-->` : une carte par catégorie, publiée ou à venir.

      Tant que la tâche 6 n'est pas faite, les marques absentes sont ignorées.
    - `page_categorie(lot, chapitre) -> Page` :
      - en-tête : badge du lot, puis le `ch-head` du chapitre ;
      - le résumé `ordre` ;
      - `div.filtres` avec des boutons `data-type` (tout, comprendre, remplacer, regler, entretenir) ;
      - `div.cartes` : une `a.carte[data-type]` par atelier avec numéro, type, titre, zone, `dl` des faits (Change, Démonter, Étapes, Couples, ou « N blocs à lire ») ;
      - côté : les résumés `couples`.
    - `page_atelier(chapitre, i) -> Page` :
      - fil Ateliers / <catégorie> / <num titre> ;
      - en-tête : `h1`, pastilles type, nombre d'étapes, « À démonter : … », ligne « D’origine » vers « À monter » ;
      - barre d'étapes : `button#tout-deplier` et `button#pas-a-pas` s'il y a des étapes ;
      - `div.atelier-cols` avec les deux colonnes de `colonnes()` (la droite est un `aside.atelier-droite`) ;
      - `nav.precsuiv`.
    - `page_a_venir(lot) -> Page` ;
    - `page_composants() -> Page` : à partir de `src/parts/composants.html` ;
    - `page_outils(chapitres) -> Page` : chaque outil distinct des `.kit`, suivi des liens vers ses ateliers ;
    - `page_couples(chapitres) -> Page` : les résumés `couples`, par catégorie ;
    - `page_approche() -> Page` et `page_sources() -> Page` : un en-tête et un conteneur `#approche-page` ou `#sources-page`, rempli par `js/references.js` (tâche 5) ;
    - `toutes_les_pages(config) -> list[Page]` ;
    - `index_recherche(config, chapitres) -> list[dict]` : `{"k": genre, "t": texte, "u": chemin}`. Les genres :
      - « Atelier 2.3 », « Étape · 2.3 », « Outil · 2.3 » ;
      - « Pièce d’origine » (une entrée par ligne de composants.html) ;
      - « Catégorie » ;
      - « Lot N · à venir ».
  - `build/assemble.py` :
    - pour chaque cible, il écrit `dist/<cible>/<chemin>index.html` et `js/recherche.js` (`window.RECHERCHE = [...];`) ;
    - il copie `js/viewer.js`, `js/m-*.js`, `js/site.js`, `js/references.js`, `js/scene/` et, pour le site, `vendor/three/` ;
    - les chemins des fichiers sont identiques dans les deux cibles ;
    - les contrôles : `controle_ateliers` sur les chapitres sources, puis `controles(page)` (tirets, ids en double) sur chaque page, puis `liens_casses(pages, fichiers)` sur tout le site.
  - `liens_casses(pages: dict[str, str], fichiers: set[str]) -> list[str]` :
    - chaque `href` ou `src` relatif qui ne commence ni par `#` ni par un schéma (`http:`, `https:`, `mailto:`, `data:`) doit mener à une page générée (`…/` donne `…/index.html`) ou à un fichier copié ;
    - une ancre `#id` doit exister dans la page visée ;
    - un `href="#id"` seul doit exister dans la même page.
  - `src/parts/composants.html` : les tableaux de `docs/recherche/composants-origine.md`, recopiés tels quels :
    - Cadre, Transmission, Freins, Roues et pneus, Poste de pilotage et selle, Accessoires livrés, Géométrie de la taille M ;
    - avec leurs remarques et la section des contradictions ;
    - et le lien vers la fiche Canyon suisse.

    Les identifiants internes entre parenthèses (`canyon-4553`…) ne sont pas recopiés.

- [ ] **Step 1: Write the failing tests** in `tests/test_pages.py`. Elles construisent le site dans un dossier temporaire :
  - `test_pages_generees` : ces chemins existent et sont 21 au total :
    - `index.html`, `freins/index.html` ;
    - les 8 `freins/<slug>/index.html` ;
    - `montage/`, `tubeless/`, `transmission/`, `accessoires/`, `revision/` ;
    - `composants/`, `outils/`, `couples/`, `approche/`, `sources/`.
  - `test_aucun_lien_casse` : `liens_casses` rend `[]` pour les deux cibles.
  - `test_page_atelier` : `freins/plaquettes/index.html` contient :
    - `<h1>`, le texte « Changer les plaquettes » ;
    - 10 `li class="step"` ;
    - `aside class="atelier-droite"` ;
    - `id="tout-deplier"` et `id="pas-a-pas"` ;
    - `<script src="../../js/m-caliper.js">` ;
    - un lien précédent vers `../disques/` et suivant vers `../rodage/`.
  - `test_page_categorie` : `freins/index.html` contient :
    - 8 `class="carte"` ;
    - `data-type="remplacer"` sur les cartes 2.2 et 2.3 ;
    - le tableau `data-resume="couples"` ;
    - les 5 boutons de filtre.
  - `test_menu_partout` : chaque page contient `class="side"` et `id="recherche"`.
  - `test_texte_des_ateliers_conserve` : chaque texte de `p`, `li` et `td` d'un atelier source se retrouve dans sa page.
  - `test_recherche` : l'index contient au moins :
    - une entrée `{"k": "Atelier 2.3", "u": "freins/plaquettes/"}` ;
    - une entrée « Outil · 2.2 » au texte « Outil Center Lock TL-FC36 » ;
    - une entrée « Pièce d’origine » qui contient « RD-RX822 ».
  - `test_sans_tiret_ni_doublon` : `controles(page) == []` pour toutes les pages.
  - `test_nginx_html_sans_cache` (dans `tests/test_assemble.py`) : `deploy/nginx.conf` sert les `.html` avec `Cache-Control: no-cache`.

- [ ] **Step 2: Run** `python3 -m unittest tests.test_pages -v`. Expected: FAIL.

- [ ] **Step 3: Implement** `build/pages.py`, `src/parts/composants.html`, the new `build/assemble.py`, `deploy/nginx.conf`, and adapt `tests/test_assemble.py`.
  - `ancres` se calcule en parcourant les ids de chaque page.
  - Pour les figures, la page d'un atelier est la page de son id.
  - `python3 build/assemble.py --target all` doit sortir avec le code 0.

- [ ] **Step 4: Run** the full Python suite. Expected: all PASS.

- [ ] **Step 5: Commit**: `git commit -m "Une page par catégorie, par atelier et par référence"`

---

### Task 5: Habillage et comportements communs (`00-head.html`, `js/site.js`, `js/references.js`)

**Files:**
- Modify: `src/parts/00-head.html` : la mise en page de la maquette (`docs/superpowers/specs/2026-10-21-maquette-site.html`), avec les jetons de couleur et les polices actuels.
  - Retirer `.wrap` (colonne de 46rem), `.chapnav`, `.masthead`.
  - Garder tous les styles du contenu : `.nm`, `.verif`, `.src`, `.note`, `.kit`, `.tbl`, `ul.media`, `ul.check`, `.flow`, `details`, planches SVG, `.v3d`, scène.
- Create: `src/js/site.js` (module ES, aucun import)
- Create: `src/js/references.js` (module ES)
- Create: `src/scene/liste-approche.js`. Il contient `remplirListe` sorti de `app.js` : `listeApproche(doc: Document, entrees) -> DocumentFragment`. `app.js` l'importe dynamiquement.
- Test: `tests/js/site.test.mjs`

**Interfaces:**
- Consumes: le HTML des tâches 3 et 4 (ids `#side`, `#menu-btn`, `#recherche`, `#resultats`, `.app[data-base]`, `details.bloc`, `li.step > details`, `#tout-deplier`, `#pas-a-pas`, `div.figures[data-onglets]`, `div.filtres button[data-type]`, `a.carte[data-type]`, `ul.check`, `#liens-data`).
- Produces, exporté par `js/site.js` :
  - `normaliser(s: string) -> string` : minuscules, sans accents.
  - `chercher(index: {k,t,u}[], requete: string, max = 12) -> {k,t,u}[]` : vide sous 2 caractères ; correspondance par sous-chaîne normalisée, dans l'ordre de l'index.
  - `cibleAncienne(hash: string, liens: Record<string,string>) -> string | null` : l'adresse relative d'un ancien `#id`, ou null.

  Le module se branche sur la page seulement si `document` existe :
  - le menu se déplie sur téléphone (`.side.open`, `aria-expanded`), et Échap le ferme ;
  - la recherche montre des liens préfixés par `data-base`, et Entrée ouvre le premier résultat ;
  - les cases cochées sont gardées sous la clé `atelier-grizl:checks`, comme aujourd'hui, toujours dans un try/catch ;
  - `#tout-deplier` ouvre ou referme tous les `li.step > details` et change de libellé (« Tout déplier » ou « Tout replier ») ;
  - `#pas-a-pas` ouvre `div.pas-a-pas` : une étape à la fois, son numéro en très gros, son titre, le contenu cloné de `div.st-b`, une barre de progression, les boutons précédent et suivant ;
    - les flèches gauche et droite naviguent, Échap ferme, et le focus revient au bouton à la fermeture ;
  - `div.figures[data-onglets]` gagne un bouton par figure (libellé « Planche » ou « Pièce en 3D »), et une seule figure reste visible ; sans JavaScript, les deux restent empilées ;
  - les filtres masquent les cartes d'un autre type (attribut `hidden`) et posent `aria-pressed` ;
  - à la racine, si `location.hash` donne une cible par `cibleAncienne`, `location.replace` vers cette cible.
- `js/references.js` :
  - sur `#approche-page`, il importe `./scene/scene.js` et `./scene/liste-approche.js` et affiche `listerApproximations(PIECES.map(m => ({ meta: m.META, zones: [] })))` ;
  - sur `#sources-page`, il importe `./scene/sources.js` et liste `SOURCES` par type (fiche, manuel, photo…), avec titre et lien.

- [ ] **Step 1: Write the failing tests** in `tests/js/site.test.mjs` :
  - `normaliser("Étrier À") === "etrier a"`.
  - `chercher(index, "e")` rend `[]`. `chercher(index, "etrier")` trouve « Centrer l’étrier ». `chercher(index, "TL-FC36")` trouve l'outil. Il y a au plus `max` résultats.
  - `cibleAncienne("#freins-plaquettes", {"freins-plaquettes": "freins/plaquettes/"}) === "freins/plaquettes/"`. `cibleAncienne("#inconnu", …) === null`. `cibleAncienne("", …) === null`. `cibleAncienne("#%E0", …) === null` (encodage invalide).
  - Importer `site.js` sous Node ne touche à aucun `document`.

- [ ] **Step 2: Run** `node --test 'tests/js/**/*.test.mjs'`. Expected: FAIL (site.js absent).

- [ ] **Step 3: Implement** `00-head.html`, `site.js`, `references.js` and `liste-approche.js`, and update `app.js` to import `liste-approche.js`.
  - Rebuild with `python3 build/assemble.py --target site`.
  - Check by eye with `node tools/scene-check.js ../dist/site/index.html <dossier> 1440 900 light` from `tools/` (until task 7, the script only looks at the home page) and with the in-app browser on the pages served by a local server.
  - Matches the mockup:
    - menu on the left;
    - full width;
    - atelier in two columns, with the right column sticky;
    - cards in a grid;
    - step mode.

- [ ] **Step 4: Run** both suites. Expected: all PASS.

- [ ] **Step 5: Commit**: `git commit -m "Habillage du site : menu, recherche, étapes, pas à pas, filtres"`

---

### Task 6: Page d'accueil « Mon vélo » (`05-top.html`, `app.js`)

**Files:**
- Modify: `src/parts/05-top.html` : la mise en page de la maquette.
  - En-tête : eyebrow, `h1` « Ton Grizl CF 7, tel qu’il sort du carton », lead : « Fais tourner le vélo, touche une pastille, ou choisis une zone à droite pour ouvrir ses ateliers. »
  - `div.accueil-grille` :
    - à gauche, la `figure.scene` actuelle, sans la rangée `#chips` ni `#fiche`, avec un `div.swap#variante` dans le stage ;
    - à droite, `<!--OU-INTERVENIR-->`.
  - Dessous :
    - « D’origine, puis à monter » avec `<!--A-REMPLACER-->` ;
    - le bloc d'intro actuel (`dl.specs`, `ol.plan`, légende, règle des sources), sans changer son texte ;
    - « Toutes les catégories » avec `<!--CATEGORIES-->`.
- Modify: `src/scene/app.js`.
  - Retirer :
    - la fiche (`ouvrirZone` qui déplace des sections, `ouvrirAtelier`, `ranger`, `deplacer`, `preparerFiche`, `rendreFiche`, `rendreNoteApproche`) ;
    - l'historique (`historique`, `noterAtelier`, `suivreLien`, `revenir`, `defilerVers`, `suivreAncre`, `garderAncre`) ;
    - les exports `atelierDuClic`, `atelierDeLEntree`, `ancreDe`, `lignesPieces` et `notesDeZone`.
  - Garder : `chargerLibs`, `approximationsSansScene`, `idDuHash`, les modes, les pastilles, le schéma, `monter3D`, `echec3D`, la liste « Ce qui est approché » et la variante.
  - Ajouter `export function choisirZone(id) -> boolean` :
    - pastille active et carte active (`.zone-carte[data-zone]` reçoit `aria-current="true"`) ;
    - surlignage et visée en 3D, cadrage en 2D ;
    - la variante de la zone affichée dans `#variante` ;
    - la carte défile dans la vue si elle n'y est pas.

    Les pastilles et les `button.zone-btn` appellent `choisirZone`.
- Modify: `tests/js/app.test.mjs` : retirer les tests des exports supprimés et ajouter ceux de `choisirZone` sans page (rend false).
- Modify: `build/pages.py` seulement si les marques demandent un ajustement.

- [ ] **Step 1: Write the failing test** in `tests/js/app.test.mjs` :
  - `choisirZone("disques") === false` hors navigateur (pas de page) ;
  - `app.js` n'exporte plus `atelierDuClic` ni `ouvrirAtelier` ;
  - `app.js : aucun import statique` reste vrai.

- [ ] **Step 2: Run** `node --test 'tests/js/**/*.test.mjs'`. Expected: FAIL.

- [ ] **Step 3: Implement** `05-top.html` and `app.js`.
  - Le garde-fou (tâche 3) reste valable : sans `app.js`, la scène est retirée, l'alerte s'affiche, et les liens de « Où intervenir » marchent.

- [ ] **Step 4: Run** both suites, rebuild, and look at the home page at 1440 and 420 with `tools/scene-check.js`. Expected: tests PASS. Sur la page :
  - la scène est dessinée ;
  - un clic sur une pastille active la carte de sa zone ;
  - le bouton de variante change le disque.

- [ ] **Step 5: Commit**: `git commit -m "Mon vélo : la scène et « Où intervenir », sans la fiche"`

---

### Task 7: Contrôle navigateur, aperçu et documentation

**Files:**
- Modify: `tools/scene-check.js`. Le script sert `dist/site/` en entier et contrôle plusieurs pages.
- Modify: `README.md`, `docs/PASSATION.md` (structure des pages, commande de contrôle), `docs/lots.md` (lot 0 : le site en plusieurs pages), `deploy/DEPLOIEMENT.md` (port 3013 sur le serveur actuel, mise à jour par archive, pages en dossiers)
- Test: `tools/scene-check.js` itself (exit code)

**Interfaces:**
- Consumes: tout ce qui précède.
- Produces: `node scene-check.js <dossier dist/site> <sortie> <largeur> <hauteur> <clair|sombre> [--disable-webgl] [--mouvement] [--sans-js]`. Code de sortie 0 seulement si tout passe.
  - **Accueil.** La scène est dessinée (sans `--disable-webgl`). Un clic sur la pastille 2 met `aria-current` sur la carte « Étrier et plaquettes ». `index.html#freins-plaquettes` arrive sur `freins/plaquettes/`.
  - **Catégorie.** Le filtre « Remplacer » laisse 2 cartes visibles.
  - **Atelier `freins/plaquettes/`.** La pièce 3D (`figure.v3d canvas`) est dessinée, sauf sans WebGL. « Tout déplier » ouvre les 10 étapes. Le mode pas à pas s'ouvre, la flèche droite passe à « 2 / 10 », Échap le ferme.
  - **Toutes les pages.** Aucune erreur dans la console, pas de défilement horizontal (`scrollWidth <= innerWidth`). Sous 900 px, `#side` est hors de l'écran tant que `#menu-btn` n'est pas cliqué.
  - **Recherche.** « TL-FC36 » donne au moins un résultat, qui mène à `freins/disques/`.
  - **`--sans-js`.** Sur `freins/plaquettes/`, cliquer le `summary` de l'étape 1 l'ouvre, et aucun texte d'étape n'est caché par `hidden`.
  - **Captures.** Une capture par page dans `<sortie>`, et `rapport.json`.

- [ ] **Step 1: Rewrite `tools/scene-check.js`.**
  - Garder : le lancement de Chromium avec SwiftShader, le serveur local, les drapeaux existants et le budget de triangles de l'accueil (500 000).
  - Les scénarios « lien 2.3 puis Retour » et « ancre au chargement dans la fiche » disparaissent avec la fiche. Ils sont remplacés par la redirection des anciennes ancres.

- [ ] **Step 2: Run** from `tools/` on a fresh build, à chaque combinaison suivante :
  - 1440x900 clair ;
  - 1440x900 sombre ;
  - 1024x768 clair ;
  - 420x900 clair ;
  - 360x780 clair ;
  - 420x900 `--disable-webgl` ;
  - 1440x900 `--sans-js` ;
  - 1440x900 `--mouvement`.

  Expected: exit 0 each time. Look at the 1440 and 420 captures of the home page, `freins/` and `freins/plaquettes/` and compare them with the mockup.

- [ ] **Step 3: Build the preview** with `python3 build/assemble.py --target artifact` and check:
  - `dist/artifact/index.html` has no skeleton, the other pages do ;
  - `liens_casses` is empty.

  Publishing on Claude is done by the controller, not by this task.

- [ ] **Step 4: Update the documentation** (README, PASSATION, lots.md, DEPLOIEMENT). Lots stay « en relecture ».

- [ ] **Step 5: Run** both suites and commit: `git commit -m "Contrôle du site en plusieurs pages et documentation"`
