# Lot 3 « Tubeless et crevaisons » Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publier la catégorie « Pneus et tubeless » (ateliers 3.1 à 3.6) du Grizl CF 8 Di2, une zone « Pneus et valves » sur le vélo de l'accueil et deux pièces 3D, avec toutes les valeurs tirées du relevé du 26/10/2026.

**Architecture:** Même chaîne que le lot 2.
- Un fragment `src/parts/30-tubeless.html` (section.chapter « tubeless ») est écrit et testé hors publication.
- Les modèles `src/js/models/m-rim.js` et `m-plug.js` (format `AtelierModels.register`) sont ajoutés.
- La zone `pneus` (zones.json, ancre de `geometrie.js`, maillages de `roues.js`) entre dans la tâche qui publie le lot dans `build/lots.json`.

**Tech Stack:** Python 3 (bibliothèque standard) et `unittest`, ES modules et three.js 0.160.0, `node --test`, Playwright via `tools/scene-check.js`.

**Spec:** `docs/superpowers/specs/2026-10-26-lot3-tubeless-design.md`, avec sa source de vérité `docs/recherche/tubeless-cf8-di2.md` (le « relevé »).

## Global Constraints

- **Règle des sources.** Chaque chiffre, geste ou référence vient du relevé et du document officiel qu'il cite, avec un lien `a.src`. Sinon, le texte dit « non publié » ou « à lire sur la pièce ». Park Tool sert pour un geste et pour ses propres outils seulement (TPT-1, TL-4.2, démonte-obus).
- **Sécurité.** Jamais plus de 3,0 bar sur ces jantes sans crochet, à aucun moment, talonnage compris (manuel Canyon des roues, tableau sans crochet de Schwalbe). Aucune consigne de gonfler au-delà. Toute source qui dit de surgonfler pour talonner est citée comme contradiction, et 3,0 bar s'applique.
- **Matériel de Lamine** : liquide Muc-Off, pompe à réservoir Topeak JoeBlow Booster, mèches Park Tool TPT-1. Les valves ne sont pas encore choisies : le site donne les critères officiels, sans marque.
- **Aucune donnée personnelle** :
  - ni poids, ni pression calculée pour Lamine ;
  - ni numéro de commande, ni prix, ni magasin, ni chemin local ;
  - les jetons de `brouillons/jetons-personnels.txt` (ignoré par Git) ne sont jamais recopiés.
- **Style** :
  - français, tutoiement ;
  - aucun tiret cadratin ni demi-cadratin ;
  - abréviations développées à leur première apparition sur chaque page ;
  - espace insécable `\xa0` avant les unités ;
  - notation « Nm » ; « bar » pour les pressions, la valeur en psi entre parenthèses seulement si la source la donne ;
  - les brouillons de `brouillons/` ne sont jamais ajoutés au dépôt.
- **Git** :
  - `git add` explicite, jamais de `git stash` ;
  - commits terminés par `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, jamais de ligne `Claude-Session` ;
  - ni push ni mise en ligne.
- **Identifiants fixés** :
  - chapitre `tubeless` ;
  - ateliers `tubeless-materiel` (3.1), `tubeless-passer` (3.2), `tubeless-liquide` (3.3), `tubeless-pression` (3.4), `tubeless-crevaison` (3.5), `tubeless-problemes` (3.6), tous en zone `pneus` ;
  - modèles `rim` et `plug`.
- **Commandes de contrôle** :
  - `python3 -m unittest discover -s tests -p 'test_*.py'` ;
  - `node --test 'tests/js/**/*.test.mjs'` ;
  - `python3 build/assemble.py --target all`, qui doit sortir à 0 ;
  - scene-check sur les huit réglages ;
  - 500 000 triangles au plus.

## Review Focus

1. **Une consigne de pression au-dessus de 3,0 bar.** Aucune ligne du chapitre ni des pièces 3D ne donne, n'implique ni ne conseille plus de 3,0 bar. La seule exception est une citation entre guillemets dans une contradiction, suivie de la valeur appliquée. La tâche 1 l'épingle avec un test qui lit chaque valeur en bar du chapitre.
2. **Le JoeBlow Booster.** Si son guide fait charger le réservoir à une pression élevée, le site distingue clairement la pression du réservoir de celle du pneu, et dit de surveiller le manomètre du pneu et de dégonfler au-delà de 3,0 bar. La tâche 1 l'épingle.
3. **Une valeur sans source officielle.** Toute ligne ou étape qui porte un `span.nm` ou une pression porte un `a.src` officiel. La tâche 1 l'épingle, comme au lot 2.
4. **Neuf pastilles sur l'accueil, de 360 à 1440 px, en 3D et en 2D** : 30 px au moins entre deux pastilles, aucune sous l'aide. La tâche 3 l'épingle par scene-check.
5. **Le mode pas à pas de 3.2.** Les avertissements de sécurité (3,0 bar, solvants sur le carbone, CO2) sont dans le corps des étapes, pas seulement dans un encadré. La tâche 1 l'épingle.

---

### Task 1: Le chapitre « Pneus et tubeless », hors publication

**Files:**
- Create: `src/parts/30-tubeless.html`
- Test: `tests/test_ateliers.py` (new class `TestTubeless`, same helpers as `TestMontage`)

**Interfaces:**
- Produces:
  - `section.chapter#tubeless`, `p.ch-num` « Chapitre 3 · Pneus et tubeless » ;
  - six `section.sub.atelier` with the ids and types of the spec, all `data-zone="pneus"` ;
  - 3.2 with `data-de` / `data-vers` ;
  - `figure.v3d[data-model="rim"]` in 3.2 and `[data-model="plug"]` in 3.5.

  Lot 3 stays « à faire » in `lots.json`.

- [ ] **Step 1: Write the failing tests**

```python
def test_ateliers_ids_types_zones(self):
    self.assertEqual([(a.id, a.num, a.type, a.zone) for a in self.ch.ateliers], [
        ("tubeless-materiel", "3.1", "comprendre", "pneus"), ("tubeless-passer", "3.2", "remplacer", "pneus"),
        ("tubeless-liquide", "3.3", "entretenir", "pneus"), ("tubeless-pression", "3.4", "regler", "pneus"),
        ("tubeless-crevaison", "3.5", "entretenir", "pneus"), ("tubeless-problemes", "3.6", "comprendre", "pneus")])
def test_jamais_plus_de_3_bar(self):  # Review Focus 1
    # chaque nombre suivi de « bar » (et chaque psi) du chapitre est <= 3,0, sauf dans un élément .contradiction ou une
    # citation entre « » dont le même paragraphe dit « 3,0 bar s'applique »
def test_reservoir_contre_pneu(self):  # Review Focus 2 : le corps de l'étape du talonnage distingue réservoir et pneu
def test_valeur_avec_source_officielle(self):  # Review Focus 3
def test_pas_a_pas_securite(self):  # Review Focus 5 : 3,0 bar, solvants, CO2 dans le corps des étapes de 3.2
def test_materiel(self):  # « Muc-Off », « JoeBlow Booster », « TPT-1 » présents ; aucune marque de valve
def test_sans_ecarts_des_brouillons(self):  # jetons précis tirés de la section « Écarts » du relevé (Continental, Gravel LN, « maximum du flanc », …)
def test_aucune_donnee_personnelle(self):  # comme TestMontage : jetons génériques + lecture de brouillons/jetons-personnels.txt
def test_texte_conserve(self):  # comme TestMontage
```

Each test is written in full, with the values read in the relevé. Apostrophes ’ and ' are both accepted.

- [ ] **Step 2: Run them, expect FAIL**
- [ ] **Step 3: Write `src/parts/30-tubeless.html` from the relevé.** Follow the blocks and the style of `src/parts/11-montage.html` and `20-freins.html`. Every contradiction is noted on its page, with the value applied and why.
- [ ] **Step 4: Run the tests, the full suites and the build. Expect PASS and exit 0.**
- [ ] **Step 5: Commit** `Tubeless : chapitre 3 du CF 8 Di2 (non publié)`

### Task 2: Pièces 3D `rim` et `plug`

**Files:**
- Create: `src/js/models/m-rim.js` and `m-plug.js`, starting from `brouillons/js/`
- Test: `tests/test_pages.py`, new `test_pieces_3d_tubeless` asserting the exact complete text of every pin and slider label, the absences (« Gravel LN », « Continental », « à crochets », any pressure above 3,0 bar) and « approchée » in each header

**Interfaces:**
- Consumes: the values of 3.2 and 3.5 from Task 1, read at its commit.
- Produces: `AtelierModels.register('rim', …)` and `AtelierModels.register('plug', …)`.

- [ ] **Step 1: Write the failing test, expect FAIL**
- [ ] **Step 2: Implement.** The GR 30 CF rim is hookless and carbon. Only the published figures are used: 30 mm high, 27 mm inside, 33 mm outside, TSS 622x27. The bead seat shape and everything else unpublished is declared approximated. The plug follows the Park Tool TPT-1 instructions.
- [ ] **Step 3: Check the rendering with a playwright harness: no console error, screenshots for the reviewer. Run the full suites. Expect PASS.**
- [ ] **Step 4: Commit** `Tubeless : pièces 3D de la jante et de la mèche`

### Task 3: Publication du lot 3, zone `pneus`, documentation

**Files:**
- Modify:
  - `build/lots.json` (lot 3 « en relecture », `parts: ["30-tubeless"]`, `modeles: ["rim","plug"]`) ;
  - `src/scene/zones.json` (zone 9 `pneus`, « Pneus et valves ») ;
  - `src/scene/geometrie.js` (ancre `valve` or a tyre point, commented as a view placement) ;
  - `src/scene/pieces/roues.js` (tyres and valves tagged `pneus`) ;
  - `src/scene/sources.js` ;
  - `src/parts/05-top.html` (« Passer en tubeless » links to `#tubeless`) ;
  - `tools/scene-check.js` if needed ;
  - `docs/lots.md`, `docs/PASSATION.md`, `docs/recherche/LISEZMOI.md`, `README.md`.
- Test:
  - `tests/js/zones.test.mjs` (nine ids) ;
  - `tests/js/scene.test.mjs` (`roues: ['axes','pneus']`) ;
  - `tests/js/geometrie.test.mjs` ;
  - `tests/test_pages.py` (nine cards, `#tubeless` → `tubeless/`, served copies of the two models) ;
  - `tests/js/lots.test.mjs`.

- [ ] **Step 1: Update the tests first, expect FAIL**
- [ ] **Step 2: Implement.** Use the `decalage` field if needed to keep 30 px. Regenerate `docs/lots.md` with `node tools/approximations-md.mjs --lots`.
- [ ] **Step 3: Run the 8 scene-check settings on a fresh build. All must exit 0. Look at the 1440 and 360 home screenshots in 3D and 2D yourself.**
- [ ] **Step 4: Run the full suites and the build. Expect PASS.**
- [ ] **Step 5: Commit** `Tubeless : lot 3 publié, zone des pneus, documentation`
