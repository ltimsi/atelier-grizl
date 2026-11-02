# Lot 5 « Accessoires des trajets » Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publier la catégorie « Accessoires des trajets » (ateliers 5.1 à 5.7) pour le matériel Tailfin de Lamine, avec une pièce 3D `rack` et une zone sur le vélo de l'accueil, toutes valeurs tirées du relevé du 1/11/2026.

**Architecture:** Même chaîne que les lots 2 à 4 : le chapitre `src/parts/60-accessoires.html` hors publication, puis le modèle `m-rack.js`, puis la publication, la zone et la documentation.

**Tech Stack:** Python 3 avec `unittest`, three.js 0.160.0, `node --test`, Playwright par `tools/scene-check.js`.

**Spec:** `docs/superpowers/specs/2026-11-01-lot5-accessoires-design.md`. Le relevé est `docs/recherche/accessoires-cf8-di2.md`.

## Global Constraints

- **Règle des sources.**
  - Chaque valeur vient du relevé et d'un document officiel : Tailfin, Canyon, Garmin, SRAM, DT Swiss.
  - La réponse écrite du service client Tailfin se cite comme telle, sans lien.
  - Sinon : « non publié » ou « à lire sur la pièce ».
  - Lectures et déductions sont dites.
- **Prudence.** Chaque atelier de montage (5.2 à 5.6) commence par « à confirmer avec Canyon avant de rouler chargé ». Les contradictions Canyon contre Tailfin y sont dites, avec la valeur retenue.
- **Charges.** Ce sont des limites ; la plus basse s'applique. Aucun calcul avec le poids de Lamine.
- **Aucune donnée personnelle.** Ni poids, ni lieu, ni prix, ni modèle d'ordinateur, ni magasin, ni jeton de `brouillons/jetons-personnels.txt`.
- **Style.**
  - Français et tutoiement.
  - Aucun tiret cadratin ni demi-cadratin.
  - Abréviations développées à leur première apparition sur chaque page.
  - Avertissements dans le corps des étapes.
  - Étapes de 1 600 caractères au plus environ.
  - Espace insécable avant les unités, et « Nm ».
- **Git.**
  - `git add` explicite, jamais de `git stash`.
  - Fin des messages : `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Jamais de ligne `Claude-Session`.
  - Ni push, ni mise en ligne.
- **Identifiants.**
  - Chapitre `accessoires`.
  - Ateliers `accessoires-materiel` (5.1), `accessoires-axe` (5.2), `accessoires-rack` (5.3), `accessoires-gardeboue` (5.4), `accessoires-sacs` (5.5), `accessoires-feu` (5.6) et `accessoires-charge` (5.7).
  - Zone `portebagages`, ou `axes` en repli.
  - Modèle `rack`.
- **Contrôles.**
  - Les deux suites.
  - Le build, qui sort à 0.
  - scene-check sous `caffeinate -i`, sur les huit réglages plus 1280x720 et 1920x1080.
  - 500 000 triangles au plus.

## Review Focus

1. **Une limite de charge mal retenue.** Il faut la plus basse de chaque paire en contradiction (12 ou 9 kg dessus, 10 ou 9 kg par côté), plus les limites hors route des sacs. La tâche 1 l'épingle.
2. **La sangle sur la tige VCLS 2.1 à deux lames.** Elle se pose le plus bas possible, avant la séparation, et reste à vérifier au montage. La tâche 1 l'épingle.
3. **L'axe Tailfin.** Il se serre par la gauche à la clé de 5 mm et se défait par la droite, sans levier. 1.5 et 3.5 y renvoient. La tâche 1 l'épingle, avec les renvois.
4. **Une valeur sans source officielle,** une donnée personnelle, une valeur du CF 7 (Ortlieb, DEFEND, Knog, « Charge totale : ton calcul »). La tâche 1 l'épingle.
5. **Onze pastilles, ou dix en repli.** 30 px entre elles, rien sous l'aide ni sous un bouton, en vue d'ensemble et en vues de zone. La tâche 3 l'épingle.

---

### Task 1: Le chapitre « Accessoires des trajets », hors publication

**Files:**
- Create : `src/parts/60-accessoires.html`.
- Modify : `src/parts/11-montage.html` (1.5) et `src/parts/30-tubeless.html` (3.5), une phrase de renvoi chacun vers `#accessoires-axe`.
- Test : `tests/test_ateliers.py`, nouvelle classe `TestAccessoires` sur les helpers partagés, plus un test des deux renvois.

**Interfaces :**
- `section.chapter#accessoires`, avec `p.ch-num` « Chapitre 5 · Accessoires des trajets ».
- Sept ateliers, avec les ids et les types de la spec, tous en zone `portebagages`. La tâche 3 les passe à `axes` en cas de repli.
- `data-de` et `data-vers` sur les ateliers « remplacer ».
- `figure.v3d[data-model="rack"]` en 5.3.
- Le lot 5 reste « à faire ».

- [ ] **Step 1 : écrire les tests qui doivent échouer.** Ils couvrent les ids, les types, les zones, les valeurs du relevé, les Review Focus 1 à 4, les données personnelles, le texte conservé et la longueur des étapes.
- [ ] **Step 2 : lancer les tests et vérifier qu'ils échouent.**
- [ ] **Step 3 : écrire le chapitre d'après le relevé, et ajouter les deux renvois.**
- [ ] **Step 4 : lancer les deux suites et le build.** Les tests passent et le build sort à 0.
- [ ] **Step 5 : committer** `Accessoires : chapitre 5 Tailfin (non publié), renvois de 1.5 et 3.5`.

### Task 2: Pièce 3D `rack`

**Files :**
- Create : `src/js/models/m-rack.js`. Le brouillon `brouillons/js/m-rack.js` (Ortlieb) sert de matière seulement.
- Test : `tests/test_pages.py`, `test_pieces_3d_accessoires`. Il vérifie le texte complet de chaque libellé, l'absence de Ortlieb, DEFEND et Knog, et le mot « approchée » dans l'en-tête.

- [ ] **Step 1 : écrire le test et vérifier qu'il échoue.**
- [ ] **Step 2 : construire la pièce.** Elle montre le Journey Rack, l'axe UTA avec ses embouts, l'adaptateur UDH (25 Nm, filetage à gauche) et la sangle sur la tige, posée bas. Ses libellés sont ceux de 5.2 et 5.3. Toutes ses formes sont approchées et déclarées.
- [ ] **Step 3 : faire le rendu dans Playwright sous `caffeinate -i`, sans erreur de console. Lancer les suites et les mutations.**
- [ ] **Step 4 : committer** `Accessoires : pièce 3D du Journey Rack`.

### Task 3: Publication du lot 5, zone, documentation

**Files :**
- `build/lots.json` : le lot 5 devient « Accessoires des trajets », `parts: ["60-accessoires"]`, `modeles: ["rack"]` ; `50-entretien` et `70-depannage` passent au lot 6.
- `src/scene/zones.json`.
- `src/scene/geometrie.js` (ancre).
- `src/scene/pieces/*.js` : le maillage de l'axe arrière ou de la tige, s'il est étiqueté.
- `src/scene/sources.js`.
- Docs : `docs/lots.md`, PASSATION, LISEZMOI, README.

- [ ] **Step 1 : mettre à jour les tests d'abord** (zones, pièces, cartes, lots, copies servies) **et vérifier qu'ils échouent.**
- [ ] **Step 2 : implémenter.** Appliquer le repli de la spec s'il le faut. Régénérer `docs/lots.md`.
- [ ] **Step 3 : lancer scene-check sur les 10 réglages, sous `caffeinate -i`.** Tous sortent à 0. Regarder l'accueil à 1440 et à 360, en 3D et en 2D.
- [ ] **Step 4 : lancer les suites et le build.** Les tests passent et le build sort à 0.
- [ ] **Step 5 : committer** `Accessoires : lot 5 publié, zone du porte-bagages, documentation`.
