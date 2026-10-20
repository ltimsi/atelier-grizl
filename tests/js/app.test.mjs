// Tests des calculs purs de src/scene/app.js : note « Formes approchées » d'une zone, liste de secours sans la 3D,
// ancre d'atelier lue dans l'adresse. Le reste de app.js demande un document et se contrôle dans un navigateur :
// importé sous Node, le module ne démarre pas.
import test from 'node:test';
import assert from 'node:assert/strict';
import { notesDeZone, approximationsSansScene, idDuHash, chargerLibs } from '../../src/scene/app.js';
import * as scene from '../../src/scene/scene.js';

const LISTE = [
  { piece: 'A', zones: ['disques', 'etrier'], approche: ['a1', 'a2'], aVerifier: [], sources: [] },
  { piece: 'B', zones: [], approche: ['b1'], aVerifier: [], sources: [] },
  { piece: 'C', zones: ['etrier'], approche: [], aVerifier: ['c'], sources: [] },
  { piece: 'D', zones: ['etrier', 'manettes'], approche: ['d1'], aVerifier: [], sources: [] },
];

test('notesDeZone : les notes des pièces de la zone, dans l’ordre de la liste', () => {
  assert.deepEqual(notesDeZone(LISTE, 'disques'), [{ piece: 'A', notes: ['a1', 'a2'] }]);
  assert.deepEqual(notesDeZone(LISTE, 'etrier'), [{ piece: 'A', notes: ['a1', 'a2'] }, { piece: 'D', notes: ['d1'] }]);
  assert.deepEqual(notesDeZone(LISTE, 'manettes'), [{ piece: 'D', notes: ['d1'] }]);
  assert.deepEqual(notesDeZone(LISTE, 'inconnue'), []);
});

test('notesDeZone : copie les notes, sans toucher la liste', () => {
  const r = notesDeZone(LISTE, 'disques');
  r[0].notes.push('x');
  assert.deepEqual(LISTE[0].approche, ['a1', 'a2']);
});

test('approximationsSansScene : les META de chaque pièce, sans zone, puis la géométrie', () => {
  const liste = approximationsSansScene(scene);
  assert.equal(liste.length, scene.PIECES.length + 1);
  scene.PIECES.forEach((m, i) => {
    assert.equal(liste[i].piece, m.META.nom);
    assert.deepEqual(liste[i].zones, []);
    assert.deepEqual(liste[i].approche, [...m.META.approche]);
    assert.deepEqual(liste[i].aVerifier, [...m.META.aVerifier]);
    assert.deepEqual(liste[i].sources.map(s => s.id), [...m.META.sources]);
  });
  assert.equal(liste.at(-1).piece, 'Géométrie');
  for (const e of liste) for (const s of e.sources) assert.match(s.url, /^https:\/\//, `${e.piece} : ${s.id}`);
});

test('idDuHash : l’identifiant après le dièse, décodé', () => {
  assert.equal(idDuHash('#freins-disques'), 'freins-disques');
  assert.equal(idDuHash('#atelier%20a'), 'atelier a');
  assert.equal(idDuHash(''), null);
  assert.equal(idDuHash('#'), null);
  assert.equal(idDuHash('#%E0%A4%A'), null, 'un encodage cassé ne lève pas d’erreur');
});

test('chargerLibs : les cinq modules de three.js, ou un échec qui remonte', async () => {
  const demandes = [];
  const faux = async nom => {
    demandes.push(nom);
    const n = nom.split('/').at(-1).replace('.js', '');
    return nom === 'three' ? { REVISION: '160' } : { [n]: n };
  };
  const libs = await chargerLibs(faux);
  assert.deepEqual(demandes, [
    'three',
    'three/addons/controls/OrbitControls.js',
    'three/addons/geometries/RoundedBoxGeometry.js',
    'three/addons/shaders/HorizontalBlurShader.js',
    'three/addons/shaders/VerticalBlurShader.js',
  ]);
  assert.deepEqual(Object.keys(libs), ['THREE', 'OrbitControls', 'RoundedBoxGeometry', 'HorizontalBlurShader',
    'VerticalBlurShader']);
  assert.equal(libs.THREE.REVISION, '160');
  assert.equal(libs.OrbitControls, 'OrbitControls');
  await assert.rejects(chargerLibs(async () => { throw new Error('absent'); }), /absent/);
  // Un module chargé mais vide (mauvais fichier servi) est un échec aussi.
  await assert.rejects(chargerLibs(async nom => (nom === 'three' ? { REVISION: '160' } : {})), /OrbitControls/);
});
