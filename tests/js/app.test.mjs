// Tests de src/scene/app.js : liste de secours sans la 3D, chargement de three.js, choix d'une zone hors navigateur,
// exports du module et absence d'import statique. Le reste de app.js demande un document et se contrôle dans un
// navigateur : importé sous Node, le module ne démarre pas.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as app from '../../src/scene/app.js';
import * as scene from '../../src/scene/scene.js';

const CODE = readFileSync(new URL('../../src/scene/app.js', import.meta.url), 'utf8');
const { approximationsSansScene, chargerLibs, choisirZone } = app;

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

test('choisirZone : false hors navigateur, la page n’a pas de scène', () => {
  assert.equal(typeof choisirZone, 'function');
  assert.equal(choisirZone('disques'), false);
  assert.equal(choisirZone('inconnue'), false);
});

test('app.js : la fiche et l’historique sont partis, seuls trois calculs restent exportés', () => {
  assert.deepEqual(Object.keys(app).sort(), ['approximationsSansScene', 'chargerLibs', 'choisirZone']);
  for (const nom of ['atelierDuClic', 'ouvrirAtelier', 'ouvrirZone', 'atelierDeLEntree', 'ancreDe', 'lignesPieces',
    'notesDeZone', 'idDuHash']) {
    assert.equal(nom in app, false, `${nom} encore exporté`);
  }
  // Plus de fiche ni de puces dans la page, plus d'écriture dans l'historique.
  for (const motif of [/#fiche\b/, /#chips\b/, /pushState|replaceState|popstate/]) {
    assert.doesNotMatch(CODE, motif);
  }
});

test('app.js : aucun import statique, pour démarrer même si un module de la scène manque', () => {
  assert.ok(!/^\s*import\s[^(]/m.test(CODE), 'import statique dans app.js');
  assert.match(CODE, /import\('\.\/schema2d\.js'\)/, 'le schéma 2D se charge par import()');
  assert.match(CODE, /import\('\.\/scene\.js'\)/, 'la scène se charge par import()');
});
