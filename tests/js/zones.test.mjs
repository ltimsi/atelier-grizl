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

test('zones attendues', () => {
  assert.deepEqual(ZONES.map(z => z.id), ['disques', 'etrier', 'manettes']);
});

test('variantes', () => {
  assert.deepEqual(parId.disques.variante.libelles, ['D’origine · SM-RT64', 'XT · RT-MT800']);
  assert.deepEqual(parId.etrier.variante.libelles, ['Plaquettes en place', 'Plaquettes sorties']);
  assert.equal(parId.manettes.variante, undefined, 'les manettes n’ont pas de variante');
});

test('forme des zones : nom, vue et cadre du schéma', () => {
  for (const z of ZONES) {
    assert.equal(typeof z.nom, 'string', `${z.id} : nom`);
    assert.ok(z.nom.length > 0, `${z.id} : nom vide`);
    assert.ok(!/\d/.test(z.nom), `${z.id} : chiffre dans le nom « ${z.nom} »`);
    assert.ok(!/[\u2014\u2013]/.test(JSON.stringify(z)), `${z.id} : tiret long`);
    assert.equal(z.vue.dir.length, 3, `${z.id} : vue.dir en trois dimensions`);
    assert.ok(z.vue.dir.every(Number.isFinite) && Math.hypot(...z.vue.dir) > 0, `${z.id} : vue.dir`);
    assert.ok(Number.isFinite(z.vue.dist) && z.vue.dist > 0, `${z.id} : vue.dist`);
    assert.ok(Number.isFinite(z.schema.largeur) && z.schema.largeur > 0, `${z.id} : schema.largeur`);
    if (z.variante) assert.equal(z.variante.libelles.length, 2, `${z.id} : deux libellés`);
  }
});
