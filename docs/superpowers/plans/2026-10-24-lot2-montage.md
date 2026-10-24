# Lot 2 « Montage à la livraison » Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publier la catégorie « Montage à la livraison » (ateliers 1.1 à 1.9) du Grizl CF 8 Di2, avec cinq nouvelles zones sur le vélo de l'accueil et quatre pièces 3D d'atelier, toutes ses valeurs tirées du relevé du 24/10/2026.

**Architecture:** Même chaîne que le lot 1. Les étapes sont dans l'ordre où les contrôles du build le permettent :
1. Un fragment `src/parts/11-montage.html` (section.chapter « montage », sections `.sub.atelier`) est écrit et testé hors publication.
2. Les modèles `src/js/models/m-*.js` (format `AtelierModels.register`) sont ajoutés.
3. Les zones (`src/scene/zones.json`, ancres de `geometrie.js`, maillages des pièces) entrent dans la tâche qui publie le lot dans `build/lots.json`.

Le build (`build/*.py`) n'accepte un atelier sans zone que pour le type « comprendre ».

**Tech Stack:** Python 3 (bibliothèque standard) pour le build et ses tests `unittest`, ES modules et three.js 0.160.0 pour la scène, `node --test`, Playwright via `tools/scene-check.js`.

**Spec:** `docs/superpowers/specs/2026-10-24-lot2-montage-design.md`, avec sa source de vérité `docs/recherche/montage-cf8-di2.md` (le « relevé »).

## Global Constraints

- **Règle des sources.** Chaque chiffre, geste ou référence vient du relevé et du document officiel qu'il cite, avec un lien `a.src`. Sinon, le texte dit « non publié », « à lire sur la pièce » ou « à lire sur l'outil ». Park Tool sert pour un geste, jamais pour une valeur.
- **Couples lus sur un pictogramme du QSG R126 V02** (capot 6 Nm, pivot 6 Nm, capuchon 2 Nm, collier 6 Nm, tête de tige 5 Nm, inclinaison 7 Nm) : le site le dit, donne la page et renvoie au guide imprimé du carton.
- **Valeurs exactes, dans les pages avec l'espace insécable `\xa0` comme le chapitre 2 :**

  | Pièce | Valeur | Clé |
  |---|---|---|
  | Capot de potence | 6 Nm, les deux vis du haut d'abord, sans jour, puis le bas | 4 mm |
  | Vis du pivot | 6 Nm | 5 mm |
  | Capuchon | 2 Nm | 3 mm |
  | Collier de selle | 6 Nm | 4 mm |
  | Vis de tête de tige | 5 Nm | 4 mm |
  | Vis d'inclinaison | 7 Nm | 4 mm |
  | Axe avant | 10-15 Nm | 6 mm |
  | Axe arrière | couple non publié par Canyon | à lire sur l'axe |
  | Pédales PD-ME700 | 35-55 N·m | clé plate de 15 mm |
  | Cales SM-SH51 | 2,5 N·m puis 5-6 N·m | 4 mm |
  | Tension de déclenchement | | 3 mm |

  - Insertion de la tige : 110 mm au moins, 210 mm au plus, repère MIN jamais visible.
  - Pression maximale : 3,0 bar.
  - Charge totale : 120 kg.
  - Charge de la BT-DN320 : environ une heure.
- **Couples qu'aucun outil de Lamine ne couvre** : 2 Nm, 2,5 N·m et 7 Nm. La TW-6.2 va de 10 à 60 Nm, l'ATD-1.2 a les crans 4, 4,5, 5, 5,5 et 6 Nm. Le site le dit, et renvoie à la clé Canyon du carton, dont la plage est à lire sur l'outil.
- **Aucune donnée personnelle** : ni numéro de commande, ni prix, ni hauteur de selle ou cote de Lamine, ni revendeur lié à une commande, ni lien privé, ni chemin local.
- **Style** :
  - français, tutoiement ;
  - aucun tiret cadratin ni demi-cadratin ;
  - abréviations développées à la première apparition ;
  - les brouillons de `brouillons/` ne sont jamais ajoutés au dépôt.
- **Git** :
  - commits avec `git add` explicite, jamais de `git stash` ;
  - messages terminés par `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, jamais de ligne `Claude-Session` ;
  - ni push, ni mise en ligne.
- **Identifiants fixés :**
  - chapitre `montage` ;
  - ateliers `montage-avant` (1.1), `montage-deballer` (1.2), `montage-cintre` (1.3), `montage-selle` (1.4), `montage-roues` (1.5), `montage-pedales` (1.6), `montage-di2` (1.7), `montage-position` (1.8), `montage-controles` (1.9) ;
  - zones `poste`, `selle`, `axes`, `pedalier`, `derailleur` ;
  - modèles `cockpit`, `axle`, `pedal`, `torque`.
- **Commandes de contrôle** :
  - `python3 -m unittest discover -s tests -p 'test_*.py'` ;
  - `node --test 'tests/js/**/*.test.mjs'` ;
  - `python3 build/assemble.py --target all`, qui doit sortir à 0 ;
  - triangles de la scène : 500 000 au plus.

## Review Focus

1. **Huit pastilles sur le vélo de l'accueil, de 360 à 1440 px.** Deux pastilles ne doivent jamais se chevaucher : centres à 30 px au moins, dans la vue d'ensemble. Aucune ne passe sous le panneau de l'aide. La tâche 5 l'ajoute à scene-check.
2. **Un atelier sans zone (1.1, 1.2, 1.9)** :
   - il s'ouvre depuis le menu, la recherche et la catégorie ;
   - sa page n'affiche ni « Zone » ni pastille ;
   - « Où intervenir » ne le liste pas ;
   - app.js ne plante pas sur un atelier sans `data-zone`.

   La tâche 1 l'épingle.
3. **Un couple qu'aucun outil ne couvre.** Chaque mention de 2 Nm, 2,5 N·m ou 7 Nm dit quel outil s'en charge, ou qu'aucun de tes outils ne le couvre. La tâche 2 l'épingle.
4. **Une valeur sans source officielle.** Toute ligne ou étape qui porte un `span.nm` porte aussi un `a.src` qui ne pointe pas vers parktool.com. La tâche 2 l'épingle.
5. **Les anciennes adresses de l'accueil.** `#montage` et `#montage-position` mènent aux nouvelles pages, et la page `montage/` n'est plus « à venir ». La tâche 5 l'épingle.

---

### Task 1: Ateliers sans zone, pour le type « comprendre »

**Files:**
- Modify: `build/ateliers.py` (`Atelier.zone`), `build/assemble.py` (`controle_ateliers`), `build/pages.py` (`_zone`, `_carte`, `page_atelier`, `cartes_des_zones`, l'index de recherche), `src/scene/app.js` seulement si un atelier sans `data-zone` y passe
- Test: `tests/test_assemble.py`, `tests/test_pages.py`, `tests/js/app.test.mjs` si app.js change

**Interfaces:**
- Produces: `Atelier.zone: str | None` (None quand la section n'a pas de `data-zone`). `controle_ateliers(texte, zones) -> list[str]` accepte une section sans `data-zone` si et seulement si `data-type="comprendre"`.

- [ ] **Step 1: Write the failing tests**

```python
# tests/test_assemble.py
def test_atelier_sans_zone_comprendre_accepte(self):
    # fragment minimal : un atelier comprendre sans data-zone (avec p.a-video) et un atelier regler en zone « disques »
    self.assertEqual(controle_ateliers(FRAGMENT_COMPRENDRE_SANS_ZONE, ["disques"]), [])
def test_atelier_sans_zone_regler_refuse(self):
    erreurs = controle_ateliers(FRAGMENT_REGLER_SANS_ZONE, ["disques"])
    self.assertTrue(any("data-zone" in e for e in erreurs))
```

```python
# tests/test_pages.py : page d'un atelier sans zone, construite depuis un chapitre de test
def test_page_atelier_sans_zone(self):
    html = page_atelier(chapitre_test_sans_zone, 0).html
    self.assertNotIn("Zone ", html)          # ni « Zone N · … » dans l'en-tête ni dans la carte
    self.assertNotIn('data-zone=', html)
def test_cartes_des_zones_ignorent_sans_zone(self):
    self.assertNotIn("montage-avant", cartes_des_zones({"t": chapitre_test_sans_zone}, ZONES_TEST))
```

- [ ] **Step 2: Run them, expect FAIL**

Run: `python3 -m unittest tests.test_assemble tests.test_pages -v`
Expected: FAIL. `controle_ateliers` reports « data-zone «  » absente », and `_zone(None)` raises ValueError.

- [ ] **Step 3: Implement**

- In `controle_ateliers`, the zone check skips `type_ == "comprendre"` when `zone` is empty, and stays strict otherwise.
- In `pages.py`, an atelier with `zone is None` has no « Zone N, nom » in `page_atelier`, no zone span in `_carte`, no `data-zone` attribute, and no entry in `cartes_des_zones`.
- Check `js/recherche.js` (built by `pages.py`) and `src/scene/app.js` for a zone dependency, and make them skip None.

- [ ] **Step 4: Run the full suites and the build, expect PASS and exit 0**

- [ ] **Step 5: Commit** `Build : atelier « comprendre » sans zone`

### Task 2: Le chapitre « Montage à la livraison », hors publication

**Files:**
- Create: `src/parts/11-montage.html`
- Test: `tests/test_ateliers.py` (new `TestMontage` class reading the source file with `relever_chapitre`)

**Interfaces:**
- Consumes: the Task 1 rules (ateliers 1.1, 1.2 and 1.9 have no `data-zone`).
- Produces:
  - `section.chapter#montage`, `header.ch-head` with `p.ch-num` « Chapitre 1 · Montage à la livraison »;
  - nine `section.sub.atelier`, with the ids, types and zones of the spec table;
  - 1.6 has `data-de="Aucune pédale, non fournies"` and `data-vers="Shimano PD-ME700 et cales SM-SH51"`;
  - `figure.v3d[data-model]`: `torque` in 1.1, `cockpit` in 1.3, `axle` in 1.5, `pedal` in 1.6.

Lot 2 stays « à faire » in `lots.json`: the build does not publish it yet.

- [ ] **Step 1: Write the failing tests** (`tests/test_ateliers.py`, class `TestMontage`, one `relever_chapitre` of `src/parts/11-montage.html`)

```python
def test_ateliers_ids_types_zones(self):
    self.assertEqual([(a.id, a.num, a.type, a.zone) for a in self.ch.ateliers], [
        ("montage-avant", "1.1", "comprendre", None), ("montage-deballer", "1.2", "comprendre", None),
        ("montage-cintre", "1.3", "regler", "poste"), ("montage-selle", "1.4", "regler", "selle"),
        ("montage-roues", "1.5", "regler", "axes"), ("montage-pedales", "1.6", "remplacer", "pedalier"),
        ("montage-di2", "1.7", "entretenir", "derailleur"), ("montage-position", "1.8", "regler", "selle"),
        ("montage-controles", "1.9", "comprendre", None)])
def test_valeurs_du_releve(self):
    t = {a.id: texte_de(a.section) for a in self.ch.ateliers}
    for ident, valeurs in {
        "montage-cintre": ("6\xa0Nm", "2\xa0Nm", "4\xa0mm", "5\xa0mm", "3\xa0mm", "sans jour", "pictogramme", "guide imprimé"),
        "montage-selle": ("110\xa0mm", "MIN", "6\xa0Nm", "5\xa0Nm", "7\xa0Nm", "pâte de montage", "pictogramme"),
        "montage-roues": ("10-15\xa0Nm", "6\xa0mm", "non publié", "3,0\xa0bar"),
        "montage-pedales": ("35-55\xa0N·m", "15\xa0mm", "2,5\xa0N·m", "5-6\xa0N·m", "3\xa0mm", "à gauche"),
        "montage-di2": ("BT-DN320", "EC-DN100", "une heure", "CR1632", "E-TUBE PROJECT"),
        "montage-avant": ("TW-6.2", "ATD-1.2", "mâchoires", "à lire sur l’outil"),
    }.items():
        for v in valeurs: self.assertIn(v, t[ident], f"{ident} : {v}")
def test_aucun_outil_pour_2_25_7(self):  # Review Focus 3
    # chaque phrase ou ligne qui porte 2 Nm, 2,5 N·m ou 7 Nm nomme un outil ou dit qu'aucun ne le couvre
def test_valeur_avec_source_officielle(self):  # Review Focus 4
    # tout li d'étape et toute tr de tableau contenant un span.nm contient un a.src dont le href n'a pas parktool.com
def test_sans_ecarts_des_brouillons(self):
    texte = texte_complet(self.ch)
    for absent in ("68\xa0mm", "en croix", "8\xa0mm", "SIS", "câble", "CF\xa07", "Ortlieb"):
        self.assertNotIn(absent, texte)
def test_renvois_freins(self):  # 1.9 renvoie à 2.4 et 2.6 sans les recopier
    self.assertIn('href="#freins-rodage"', html_de("montage-controles")); self.assertIn('href="#freins-controles"', html_de("montage-controles"))
```

`texte_de`, `texte_complet` and `html_de` are small helpers in the test class, built on the `dom.py` API already used in `test_ateliers.py`. Check each token of `test_sans_ecarts_des_brouillons` against the « Écarts avec les brouillons du 20/10 » section of the relevé, and adjust a token if it would forbid a correct phrase. Example: « câble » is fine in « câble de charge » for the Di2, so the test should forbid « câble de dérailleur » instead.

- [ ] **Step 2: Run them, expect FAIL** (the file does not exist yet)

- [ ] **Step 3: Write `src/parts/11-montage.html`**

Write it from the relevé, sections 1 to 9 plus « Contradictions » and « À lire ». Use the brouillons only as a starting point, and correct every gap the relevé lists. Follow the structure and the blocks of `src/parts/20-freins.html`:
- `.a-dem`, `.kit`, `ol.steps`, `.tbl` for the torques, `ul.media` or `p.a-video`, `aside.note`;
- `span.verif` for everything « à lire »;
- 1.2 has a `ul.check` of the « À lire sur la pièce ou sur l'outil » list;
- each contradiction from the relevé is noted on its page with the value applied and why.

1.8 contains no number from Lamine, and tells him to write his measurements down somewhere other than the site.

- [ ] **Step 4: Run the tests, expect PASS.** Then run the full suites and the build. The build ignores the unpublished part.

- [ ] **Step 5: Commit** `Montage : chapitre 1 du CF 8 Di2 (non publié)`

### Task 3: Pièces 3D `cockpit` et `axle`

**Files:**
- Create: `src/js/models/m-cockpit.js`, `src/js/models/m-axle.js`, both starting from `brouillons/js/m-cockpit.js` and `m-axle.js`
- Test: `tests/test_pages.py` (`test_pieces_3d_montage`, extended by Task 4)

**Interfaces:**
- Consumes: the values of 1.3 and 1.5 written in Task 2.
- Produces: `AtelierModels.register('cockpit', …)` and `AtelierModels.register('axle', …)`, loaded as `js/m-cockpit.js` and `js/m-axle.js` once lot 2 lists them (Task 5).

- [ ] **Step 1: Write the failing test** (`test_pieces_3d_montage`: reads `src/js/models/m-<nom>.js` only; Task 5 extends it to the served copies)

```python
attendus = {"m-cockpit.js": ("ST0046", "HB0067", "ST-RX825", "6\xa0Nm", "2\xa0Nm", "haut", "sans jour"),
            "m-axle.js": ("12 x 100", "10-15\xa0Nm", "6\xa0mm", "à lire sur la pièce")}
absents = ("CF 7", "CF\xa07", "GRX 610", "RX610", "RX820 mécanique", "en croix", "DT Swiss 350 Center Lock disque SM-RT64")
# plus : l'en-tête de chaque fichier contient « approchée »
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement the two models**

Use the CF 8 parts:
- ST-RX825 hoods;
- GR 30 CF wheel with a DT Swiss 350 hub;
- XT MT800 disc;
- an axle whose type is to be read on the part.

The cockpit animates the faceplate tightening order (the two top bolts, then the bottom ones). Every label value is identical to the chapter's. List each shape that is not published as approximated in the header, in the style of `src/js/models/m-caliper.js`.

- [ ] **Step 4: Run the test and the full suites, expect PASS**

- [ ] **Step 5: Commit** `Montage : pièces 3D du poste de pilotage et de l'axe avant`

### Task 4: Pièces 3D `pedal` et `torque`

**Files:**
- Create: `src/js/models/m-pedal.js` and `src/js/models/m-torque.js`, starting from `brouillons/js/`
- Test: extend `test_pieces_3d_montage`

**Interfaces:**
- Consumes: the values of 1.6 and 1.1.
- Produces: `AtelierModels.register('pedal', …)` and `AtelierModels.register('torque', …)`.

- [ ] **Step 1: Extend the test, expect FAIL**

```python
"m-pedal.js": ("PD-ME700", "SM-SH51", "35-55\xa0N·m", "15\xa0mm", "2,5\xa0N·m", "5-6\xa0N·m", "à gauche"),
"m-torque.js": ("TW-6.2", "10 à 60\xa0Nm", "déclic"),
# absents en plus : « 8\xa0mm » dans m-pedal.js ; le nom de la clé Canyon avec une plage chiffrée dans m-torque.js
```

- [ ] **Step 2: Implement.** Same rules as Task 3. The pedal shows the thread direction of each side. The torque wrench says nothing about the Canyon wrench beyond « plage à lire sur l'outil ».

- [ ] **Step 3: Run the test and the full suites, expect PASS**

- [ ] **Step 4: Commit** `Montage : pièces 3D de la pédale et de la clé dynamométrique`

### Task 5: Publication du lot 2, zones de l'accueil, documentation

**Files:**
- Modify:
  - `build/lots.json`;
  - `src/scene/zones.json`;
  - `src/scene/geometrie.js` (ancres);
  - `src/scene/pieces/poste.js`, `cadre.js`, `roues.js` and `transmission.js` (`o.zone(...)` on the meshes);
  - `src/scene/sources.js` (documents cited by a piece or a model);
  - `src/parts/05-top.html` (the « Le jour de la livraison » plan);
  - `tools/scene-check.js`;
  - `docs/lots.md`, `docs/PASSATION.md` and `docs/recherche/LISEZMOI.md`.
- Test:
  - `tests/js/zones.test.mjs`, `tests/js/scene.test.mjs`, `tests/js/geometrie.test.mjs` and `tests/js/lots.test.mjs`;
  - `tests/test_pages.py`, where `test_cartes` is at line 840, plus the served copies in `test_pieces_3d_montage`.

**Interfaces:**
- Consumes: Tasks 1 to 4.
- Produces: the published lot 2 and the zones in this order:

  | N° | Id | Nom | Ancre |
  |---|---|---|---|
  | 4 | `poste` | Poste de pilotage | `potence` |
  | 5 | `selle` | Selle et tige | `teteTige` |
  | 6 | `axes` | Axes des roues | `axeAvant`, côté gauche |
  | 7 | `pedalier` | Pédalier et pédales | `manivelleDroite`, au bout du bras |
  | 8 | `derailleur` | Dérailleur Di2 | `batterieDi2` |

  The first three zones are unchanged.

- [ ] **Step 1: Update the tests first, expect FAIL**
  - `zones.test.mjs`: the ids are `['disques','etrier','manettes','poste','selle','axes','pedalier','derailleur']`.
  - `scene.test.mjs`, the zones per piece:
    - `cadre: ['selle']`;
    - `roues: ['axes']`;
    - `freins: ['disques','etrier','manettes']`;
    - `transmission: ['pedalier','derailleur']`;
    - `poste: ['manettes','poste']`.

    Adjust if a mesh falls more naturally in another piece, and say so in the report.
  - `geometrie.test.mjs`: the five new anchors exist, each with 3 coordinates.
  - `test_pages.py:840`: the eight cards, in the order above.
  - A test that `liens-data` sends `#montage` to `montage/` and `#montage-position` to `montage/position/`, and that `montage/` is no longer a « à venir » page. This is Review Focus 5.
  - `lots.json`:
    - lot 2 is « en relecture » with `parts: ["11-montage"]` and `modeles: ["torque","cockpit","axle","pedal"]`;
    - lot 4 no longer has « Charger la batterie Di2 BT-DN320. ».
- [ ] **Step 2: Implement**
  - Zones, anchors and meshes, each with a camera view (`vue`) and a 2D framing (`schema`).
  - `lots.json`.
  - The home page plan:
    - « Monter le vélo » links to `#montage`;
    - add « Charger le Di2 » (link `#montage-di2`) before the first ride;
    - « Reporter ta position » links to `#montage-position`;
    - the « Chapitre 1 » labels become links.
  - The registry entries for the documents cited by a META or a model: QSG R126 V02, the Canyon wheel manual, DM-MAPD001-07, the Shimano Di2 pages, the SP100 VCLS 2.1 page and Fizik. Each comes with its URL from the relevé.
  - Regenerate `docs/lots.md` with `node tools/approximations-md.mjs --lots`.
  - Write the lot 2 entry in `docs/lots.md`, and add the list of things to read at delivery to PASSATION.
- [ ] **Step 3: scene-check.** Add the check « no two pins less than 30 px apart, no pin under the help panel » in the overview (Review Focus 1). Keep the existing clicks on pins 2 and 3. Add a click on pin 4 that activates the « Poste de pilotage » card. Then run the 8 settings on a fresh build:
  - 1440x900 clair;
  - 1440x900 sombre;
  - 1024x768;
  - 420x900;
  - 360x780;
  - 420x900 `--disable-webgl`;
  - 1440x900 `--sans-js`;
  - 1440x900 `--mouvement`.

  All must exit 0, with the triangle count at 500 000 at most.
- [ ] **Step 4: Run the full suites and the build, expect PASS and exit 0**
- [ ] **Step 5: Commit** `Montage : lot 2 publié, cinq zones sur le vélo, documentation`
