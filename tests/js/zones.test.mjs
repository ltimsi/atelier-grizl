// Tests de src/scene/zones.json : les zones d'atelier de la scène, leurs ancres, leurs vues et leurs variantes.
// Les noms d'ancres renvoient à points().ancres, calculées depuis GEO : une zone ne porte aucune coordonnée.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { points } from '../../src/scene/geometrie.js';

const ZONES = JSON.parse(readFileSync(new URL('../../src/scene/zones.json', import.meta.url), 'utf8'));
const { ancres } = points();
const parId = Object.fromEntries(ZONES.map(z => [z.id, z]));

test('ancres connues', () => {
  for (const z of ZONES) {
    for (const [champ, nom] of [['ancre', z.ancre], ['vue.cible', z.vue?.cible], ['schema.centre', z.schema?.centre]]) {
      assert.ok(Object.hasOwn(ancres, nom), `${z.id} : ${champ} « ${nom} » absente de points().ancres`);
    }
  }
});

test('zones attendues : les trois des freins, puis les cinq du montage', () => {
  assert.deepEqual(ZONES.map(z => z.id),
    ['disques', 'etrier', 'manettes', 'poste', 'selle', 'axes', 'pedalier', 'derailleur']);
});

test('zones du montage : noms et ancres, pastilles 4 à 8', () => {
  const attendu = [
    ['poste', 'Poste de pilotage', 'potence'],
    ['selle', 'Selle et tige', 'teteTige'],
    ['axes', 'Axes des roues', 'axeAvant'],
    ['pedalier', 'Pédalier et pédales', 'manivelleDroite'],
    ['derailleur', 'Dérailleur Di2', 'batterieDi2'],
  ];
  assert.deepEqual(ZONES.slice(3).map(z => [z.id, z.nom, z.ancre]), attendu);
  // La vue et le cadre du schéma visent la pièce de la pastille. Celle des axes est posée sous l'axe avant, pour
  // laisser la place à la pastille de l'étrier : sa vue et son cadre visent la tête de l'axe elle-même.
  for (const z of ZONES.slice(3)) {
    const cible = z.id === 'axes' ? 'teteAxeAvant' : z.ancre;
    assert.equal(z.vue.cible, cible, `${z.id} : vue.cible`);
    assert.equal(z.schema.centre, cible, `${z.id} : schema.centre`);
  }
});

test('zones des freins inchangées', () => {
  assert.deepEqual(ZONES.slice(0, 3).map(z => [z.id, z.nom, z.ancre]), [
    ['disques', 'Disques de frein', 'disqueArriere'],
    ['etrier', 'Étrier et plaquettes', 'etrierAvant'],
    ['manettes', 'Manettes et durites', 'cocotteGauche'],
  ]);
});

test('variantes : seule la zone de l’étrier en a une, les disques n’en ont plus', () => {
  assert.equal(parId.disques.variante, undefined, 'un seul type de disque');
  assert.deepEqual(ZONES.filter(z => z.variante).map(z => z.id), ['etrier']);
  assert.deepEqual(parId.etrier.variante.libelles, ['Plaquettes en place', 'Plaquettes sorties']);
  assert.equal(parId.manettes.variante, undefined, 'les manettes n’ont pas de variante');
});

test('forme des zones : nom, vue et cadre du schéma', () => {
  for (const z of ZONES) {
    assert.equal(typeof z.nom, 'string', `${z.id} : nom`);
    assert.ok(z.nom.length > 0, `${z.id} : nom vide`);
    // Di2, le nom des vitesses électroniques Shimano, n'est pas une cote : seul chiffre permis dans un nom.
    assert.ok(!/\d/.test(z.nom.replace(/\bDi2\b/g, '')), `${z.id} : chiffre dans le nom « ${z.nom} »`);
    assert.ok(!/[\u2014\u2013]/.test(JSON.stringify(z)), `${z.id} : tiret long`);
    assert.equal(z.vue.dir.length, 3, `${z.id} : vue.dir en trois dimensions`);
    assert.ok(z.vue.dir.every(Number.isFinite) && Math.hypot(...z.vue.dir) > 0, `${z.id} : vue.dir`);
    assert.ok(Number.isFinite(z.vue.dist) && z.vue.dist > 0, `${z.id} : vue.dist`);
    assert.ok(Number.isFinite(z.schema.largeur) && z.schema.largeur > 0, `${z.id} : schema.largeur`);
    if (z.variante) assert.equal(z.variante.libelles.length, 2, `${z.id} : deux libellés`);
  }
});
