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
    ['axes', 'Axes des roues', 'teteAxeAvant'],
    ['pedalier', 'Pédalier et pédales', 'manivelleDroite'],
    ['derailleur', 'Dérailleur Di2', 'batterieDi2'],
  ];
  assert.deepEqual(ZONES.slice(3).map(z => [z.id, z.nom, z.ancre]), attendu);
  // La vue et le cadre du schéma visent la pièce de la pastille.
  for (const z of ZONES.slice(3)) {
    assert.equal(z.vue.cible, z.ancre, `${z.id} : vue.cible`);
    assert.equal(z.schema.centre, z.ancre, `${z.id} : schema.centre`);
  }
});

// decalage : [dx, dy] en pixels de l'écran, facultatif. app.js pose la pastille à ce décalage de la projection de son
// ancre, en 3D comme en 2D, à toutes les largeurs. Seule la zone des axes en a un : sa pastille est juste sous la tête
// de l'axe avant, parce que la pastille de l'étrier se projette juste au-dessus du moyeu.
test('décalage des pastilles : seule celle des axes, vers le bas, assez pour l’écart de 30 px avec l’étrier', () => {
  assert.deepEqual(ZONES.filter(z => 'decalage' in z).map(z => z.id), ['axes']);
  const d = parId.axes.decalage;
  assert.equal(d.length, 2);
  assert.ok(d.every(Number.isFinite), 'deux nombres');
  assert.equal(d[0], 0, 'droit sous l’ancre');
  // La pastille de l'étrier (2) est au-dessus du moyeu, celle des axes (6) à d[1] pixels sous lui : leurs centres sont
  // au moins à d[1] pixels l'un de l'autre, quelle que soit la largeur.
  assert.ok(ancres.etrierAvant[1] > ancres[parId.axes.ancre][1], 'l’étrier au-dessus de l’axe');
  assert.ok(d[1] >= 30, `décalage de ${d[1]} px, moins que l’écart minimal des pastilles`);
  assert.ok(d[1] <= 40, `décalage de ${d[1]} px : la pastille s’éloigne de son axe`);
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
    const connus = ['id', 'nom', 'ancre', 'vue', 'schema', 'variante', 'decalage'];
    for (const cle of Object.keys(z)) assert.ok(connus.includes(cle), `${z.id} : champ inconnu « ${cle} »`);
  }
});
