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

test('zones attendues : les trois des freins, les cinq du montage, celle des pneus, puis celle de la chaîne', () => {
  assert.deepEqual(ZONES.map(z => z.id),
    ['disques', 'etrier', 'manettes', 'poste', 'selle', 'axes', 'pedalier', 'derailleur', 'pneus', 'chaine']);
});

test('zones du montage : noms et ancres, pastilles 4 à 8', () => {
  const attendu = [
    ['poste', 'Poste de pilotage', 'potence'],
    ['selle', 'Selle et tige', 'teteTige'],
    ['axes', 'Axes des roues', 'teteAxeAvant'],
    ['pedalier', 'Pédalier et pédales', 'manivelleDroite'],
    ['derailleur', 'Dérailleur Di2', 'batterieDi2'],
  ];
  assert.deepEqual(ZONES.slice(3, 8).map(z => [z.id, z.nom, z.ancre]), attendu);
  // La vue et le cadre du schéma visent la pièce de la pastille, au montage, aux pneus et à la chaîne (pastilles 4 à
  // 10).
  for (const z of ZONES.slice(3)) {
    assert.equal(z.vue.cible, z.ancre, `${z.id} : vue.cible`);
    assert.equal(z.schema.centre, z.ancre, `${z.id} : schema.centre`);
  }
});

// La zone du lot 3, pastille 9 : les pneus et les valves (ateliers 3.1 à 3.6). Son ancre est sur la valve de la roue
// avant, sans décalage à l'écran : la vue et le cadre du schéma visent la valve (test précédent).
test('zone des pneus : nom, ancre sur la valve avant, pastille 9', () => {
  assert.deepEqual([ZONES[8].id, ZONES[8].nom, ZONES[8].ancre], ['pneus', 'Pneus et valves', 'valveAvant']);
  assert.equal(parId.pneus.variante, undefined, 'pas de variante');
  assert.equal('decalage' in parId.pneus, false, 'posée sur son ancre');
});

// La zone du lot 4, pastille 10 : la chaîne et la cassette (ateliers 4.2 à 4.5). Son ancre est sur le bord du grand
// pignon de la cassette (geometrie.js), sans variante ; la vue et le cadre du schéma visent cette ancre (test précédent).
test('zone de la chaîne et de la cassette : nom, ancre sur le bord de la cassette, pastille 10', () => {
  assert.equal(ZONES.length, 10);
  assert.deepEqual([ZONES[9].id, ZONES[9].nom, ZONES[9].ancre], ['chaine', 'Chaîne et cassette', 'bordCassette']);
  assert.equal(parId.chaine.variante, undefined, 'pas de variante');
});

// decalage : [dx, dy] en pixels de l'écran, facultatif. app.js pose la pastille à ce décalage de la projection de son
// ancre, en 3D comme en 2D, à toutes les largeurs. Deux zones en ont un. Celle des axes : sa pastille est juste sous la
// tête de l'axe avant, parce que la pastille de l'étrier se projette juste au-dessus du moyeu. Celle de la chaîne : sa
// pastille est décalée vers la droite de l'écran, soit juste devant la cassette dans les vues côté transmission, parce
// que les pastilles du disque arrière et du dérailleur se projettent au-dessus et à gauche de son ancre (geometrie.js).
// L'écart de 30 px qui en résulte, à chaque largeur, est contrôlé par tools/scene-check.js.
test('décalage des pastilles : celle des axes vers le bas, celle de la chaîne vers la droite, près de leur pièce', () => {
  assert.deepEqual(ZONES.filter(z => 'decalage' in z).map(z => z.id), ['axes', 'chaine']);
  const c = parId.chaine.decalage;
  assert.equal(c.length, 2);
  assert.ok(c.every(Number.isFinite), 'deux nombres');
  assert.ok(c[0] > 0 && Math.abs(c[1]) < c[0], `décalage ${c} : vers la droite, plus qu’en hauteur`);
  assert.ok(Math.hypot(...c) <= 25, `décalage de ${Math.hypot(...c).toFixed(1)} px : la pastille s’éloigne de la cassette`);
  assert.ok(ancres.disqueArriere[1] > ancres.bordCassette[1] && ancres.batterieDi2[0] < ancres.bordCassette[0],
    'le disque arrière au-dessus de l’ancre, le dérailleur derrière');
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
