# Lot 4 « Transmission » Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publier la catégorie « Transmission » (ateliers 4.1 à 4.9) du Grizl CF 8 Di2, une zone « Chaîne et cassette » et trois pièces 3D, avec toutes les valeurs tirées du relevé du 30/10/2026.

**Architecture:** Même chaîne que les lots 2 et 3. Un fragment `src/parts/40-transmission.html` (chapitre `transmission`) est écrit hors publication. Les modèles `m-chain.js`, `m-cassette.js` et `m-derailleur.js` suivent. La publication, la zone et la documentation viennent en dernier.

**Tech Stack:** Python 3 et `unittest`, ES modules et three.js 0.160.0, `node --test`, Playwright via `tools/scene-check.js`.

**Spec:** `docs/superpowers/specs/2026-10-30-lot4-transmission-design.md`, avec le relevé `docs/recherche/transmission-cf8-di2.md`.

## Global Constraints

- **Règle des sources.** Chaque valeur ou geste vient du relevé et du document officiel qu'il cite, avec un `a.src`. Sinon : « non publié » ou « à lire sur la pièce ». Park Tool sert pour les gestes et pour ses propres outils.
- **Outils de Lamine** : Park Tool CC-3.2, MLP-1.2, CT-3.3, CM-5.3, TW-6.2 et ATD-1.2, dégraissant Muc-Off, Motorex Chainlube Wet, clés PB Swiss. Prévu : Shimano TL-LR021 et fouet SR-12.2. Attache rapide : il suit la MLP-1.2 de Park, et le site dit que Shimano demande la TL-CN10.
- **Valeurs clés du relevé, au format du site** (espace insécable, « Nm ») :
  - fixation du dérailleur 10-12 Nm ;
  - cassette 30-50 Nm chez Shimano, contre 40 chez Canyon ;
  - vis de plateau 12-16 Nm ;
  - longueur de chaîne +5 ou +6 maillons, contre +4 ou +5 dans l'article Shimano ;
  - mode réglage sur le 24 dents.
- **Aucune donnée personnelle** : ni magasin, ni prix, ni commande, ni jeton de `brouillons/jetons-personnels.txt`.
- **Style** :
  - français, tutoiement ;
  - aucun tiret cadratin ni demi-cadratin ;
  - abréviations développées à leur première apparition sur chaque page ;
  - avertissements dans le corps des étapes, pour le mode pas à pas ;
  - aucune étape de plus de 1 600 caractères environ.
- **Git** :
  - `git add` explicite, jamais de `git stash` ;
  - commits terminés par `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, jamais de ligne `Claude-Session` ;
  - ni push ni mise en ligne.
- **Identifiants** :
  - chapitre `transmission` ;
  - ateliers `transmission-di2` (4.1), `transmission-nettoyer` (4.2), `transmission-usure` (4.3), `transmission-chaine` (4.4), `transmission-cassette` (4.5), `transmission-reglage` (4.6), `transmission-patte` (4.7), `transmission-pedalier` (4.8), `transmission-depannage` (4.9) ;
  - zones `derailleur`, `chaine` et `pedalier` ;
  - modèles `chain`, `cassette` et `derailleur`.
- **Contrôles** :
  - les deux suites ;
  - le build, qui doit sortir à 0 ;
  - scene-check sous `caffeinate -i`, sur les huit réglages, plus 1280x720 ;
  - 500 000 triangles au plus.

## Review Focus

1. **Une valeur du CF 7 qui reste.** Aucune des valeurs suivantes ne doit subsister :
   - câble, molette ou stabilisateur ;
   - fixation à 8-10 Nm ;
   - « +4/+5 » donné comme règle ;
   - CS-M7100 ;
   - TL-FC36 pour la cassette ;
   - 16-17 Nm au plateau ;
   - RX822 ou RX610.

   La tâche 1 l'épingle.
2. **Un geste Di2 que Shimano ne décrit pas.** La touche qui entre en mode réglage n'est pas publiée par défaut. Le site le dit et renvoie à E-TUBE PROJECT ou à la notice. La tâche 1 l'épingle.
3. **Une valeur sans source officielle.** La tâche 1 l'épingle, comme aux lots 2 et 3.
4. **Dix pastilles sur l'accueil**, ou neuf si la zone `chaine` est abandonnée : 30 px, rien sous l'aide ni sous un bouton, en 3D et en 2D, dans la vue d'ensemble et dans les vues de zone. La tâche 3 l'épingle par scene-check.
5. **Le mode pas à pas de 4.4 et 4.6.** Les avertissements sont dans le corps des étapes : chaîne sans fil sous tension, gants et lunettes, attache neuve. La tâche 1 l'épingle.

---

### Task 1: Le chapitre « Transmission », hors publication

**Files:** Create `src/parts/40-transmission.html`. Test: `tests/test_ateliers.py`, new class `TestTransmission`, built on the shared helpers.

**Interfaces:** It produces:
- `section.chapter#transmission` and `p.ch-num` « Chapitre 4 · Transmission » ;
- nine ateliers with the ids, types and zones of the spec ;
- 4.4 with `data-de` / `data-vers` ;
- `figure.v3d` with `data-model="chain"` (4.3 or 4.4), `"cassette"` (4.5) and `"derailleur"` (4.6).

Lot 4 stays « à faire ».

- [ ] **Step 1: Write the failing tests.** Cover:
  - ids, types and zones ;
  - the relevé values ;
  - Review Focus 1, 2, 3 and 5 ;
  - personal data, through the shared helper ;
  - « texte conservé » ;
  - step length.
- [ ] **Step 2: Run them, expect FAIL.**
- [ ] **Step 3: Write the chapter from the relevé**, in the style of `11-montage.html` and `30-tubeless.html`.
- [ ] **Step 4: Run the full suites and the build, expect PASS and exit 0.**
- [ ] **Step 5: Commit** `Transmission : chapitre 4 du CF 8 Di2 (non publié)`

### Task 2: Pièces 3D `chain`, `cassette` et `derailleur`

**Files:** Create `src/js/models/m-chain.js`, `m-cassette.js` and `m-derailleur.js`, starting from `brouillons/js/`. Test: `tests/test_pages.py`, new `test_pieces_3d_transmission`, which checks:
- the exact complete text of every label ;
- that no CF 7 part appears ;
- « approchée » in each header ;
- a pressure and value guard, as in lot 3.

- [ ] **Step 1: Write the failing test, expect FAIL.**
- [ ] **Step 2: Implement.** Use only the published figures. Everything else is declared approximated.
- [ ] **Step 3: Render the pieces with Playwright, with no console error. Run the suites. Kill each mutation.**
- [ ] **Step 4: Commit** `Transmission : pièces 3D de la chaîne, de la cassette et du dérailleur`

### Task 3: Publication du lot 4, zone `chaine`, documentation

**Files:**
- `build/lots.json`
- `src/scene/zones.json`
- `src/scene/geometrie.js` (ancre)
- `src/scene/pieces/transmission.js` (chain and cassette tagged `chaine`)
- `src/scene/sources.js`
- `docs/lots.md`, PASSATION, LISEZMOI, README

**Tests:** zones, scene, geometrie, `test_pages` (cards, served copies of the three models), lots.

- [ ] **Step 1: Update the tests first, expect FAIL.**
- [ ] **Step 2: Implement.** Apply the fallback rule of the spec if the zone does not fit at 360 px. Regenerate `docs/lots.md`.
- [ ] **Step 3: Run scene-check under `caffeinate -i`, on the 8 settings plus 1280x720, all exit 0. Look at the home page at 1440 and 360, in 3D and 2D.**
- [ ] **Step 4: Run the suites and the build, expect PASS.**
- [ ] **Step 5: Commit** `Transmission : lot 4 publié, zone de la chaîne, documentation`
