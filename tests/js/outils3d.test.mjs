// Tests de src/scene/outils3d.js : étiquetage, orientation et formes des outils de construction.
// Le RoundedBoxGeometry de three/addons importe 'three' en nom nu, ce que Node ne sait pas résoudre : un faux le remplace.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../../vendor/three/three.module.min.js';
import { creerOutils } from '../../src/scene/outils3d.js';
import { creerMateriaux } from '../../src/scene/materiaux.js';

const appels = [];
class FauxRoundedBox extends THREE.BoxGeometry {
  constructor(w, h, d, ...reste) {
    super(w, h, d);
    appels.push([w, h, d, ...reste]);
  }
}

const materiaux = creerMateriaux(THREE, {});
const nouveau = () => {
  const groupe = new THREE.Group();
  return { groupe, o: creerOutils(THREE, FauxRoundedBox, groupe, materiaux) };
};
const proche = (reel, attendu, tol = 1e-6, nom = '') =>
  assert.ok(Math.abs(reel - attendu) <= tol, `${nom} : ${reel} au lieu de ${attendu}`);
const vecteurProche = (v, attendu, tol = 1e-6, nom = '') =>
  attendu.forEach((a, i) => proche([v.x, v.y, v.z][i], a, tol, `${nom}[${i}]`));
const boite = obj => new THREE.Box3().setFromObject(obj);

test('étiquetage : zone et variante se retrouvent dans userData', () => {
  const { groupe, o } = nouveau();
  o.zone('disques');
  o.variante({ zone: 'disques', k: 1 });
  const t = o.tube([0, 0, 0], [0, 100, 0], 5, 5, 'rotor');
  assert.deepEqual(t.userData, { role: 'rotor', zone: 'disques', variante: { zone: 'disques', k: 1 } });
  assert.equal(t.parent, groupe);
});

test('étiquetage : sans zone ni variante, userData les porte à null', () => {
  const { o } = nouveau();
  const t = o.tube([0, 0, 0], [0, 100, 0], 5, 5, 'paint');
  assert.deepEqual(t.userData, { role: 'paint', zone: null, variante: null });
});

test('étiquetage : zone(null) et variante(null) remettent à zéro', () => {
  const { o } = nouveau();
  o.zone('disques');
  o.variante({ zone: 'disques', k: 1 });
  o.zone(null);
  o.variante(null);
  assert.deepEqual(o.ell([0, 0, 0], [1, 1, 1], 'paint').userData, { role: 'paint', zone: null, variante: null });
});

test('étiquetage : tous les outils étiquettent, instances comprises', () => {
  const { groupe, o } = nouveau();
  o.zone('transmission');
  o.variante({ zone: 'transmission', k: 2 });
  const attendu = { zone: 'transmission', variante: { zone: 'transmission', k: 2 } };
  const maillages = [
    o.mesh(new THREE.BoxGeometry(1, 1, 1), 'paint'),
    o.inst(new THREE.BoxGeometry(1, 1, 1), 'chain', 3),
    o.tube([0, 0, 0], [10, 0, 0], 2, 2, 'paint'),
    o.tubeZ([0, 0], -5, 5, 2, 'paint'),
    o.ell([0, 0, 0], [1, 2, 3], 'paint'),
    o.rbox([0, 0, 0], [4, 5, 6], 0, 'paint', 1),
    o.boulon([0, 0, 0], [0, 0, 1]),
    o.extr(new THREE.Shape().moveTo(0, 0).lineTo(1, 0).lineTo(0, 1), 2, 'paint'),
    o.tubeCourbe([[0, 0, 0], [10, 0, 0], [20, 5, 0]], 1, 'hose'),
    o.lathe([[1, 0], [2, 3]], 8, 'cassette'),
  ];
  for (const m of maillages) {
    assert.equal(m.userData.zone, attendu.zone);
    assert.deepEqual(m.userData.variante, attendu.variante);
    assert.equal(m.parent, groupe);
  }
  assert.equal(groupe.children.length, maillages.length);
});

test('étiquetage : modifier l’objet passé à variante() ne change pas les maillages déjà faits', () => {
  const { o } = nouveau();
  const v = { zone: 'pedales', k: 0 };
  o.variante(v);
  const t = o.ell([0, 0, 0], [1, 1, 1], 'paint');
  v.k = 9;
  assert.equal(t.userData.variante.k, 0);
});

test('matière : un rôle inconnu est refusé avec son nom', () => {
  const { o } = nouveau();
  assert.throws(() => o.mesh(new THREE.BoxGeometry(1, 1, 1), 'plutonium'), /plutonium/);
  assert.throws(() => o.inst(new THREE.BoxGeometry(1, 1, 1), 'plutonium', 2), /plutonium/);
});

test('matière : le maillage reçoit la matière réaliste de son rôle', () => {
  const { o } = nouveau();
  assert.equal(o.mesh(new THREE.BoxGeometry(1, 1, 1), 'steel').material, materiaux.reel.steel);
  assert.equal(o.inst(new THREE.BoxGeometry(1, 1, 1), 'chain', 2).material, materiaux.reel.chain);
});

test('inst : une InstancedMesh qui garde son nombre d’instances', () => {
  const { o } = nouveau();
  const m = o.inst(new THREE.BoxGeometry(1, 1, 1), 'chain', 7);
  assert.ok(m.isInstancedMesh);
  assert.equal(m.count, 7);
});

test('orientation : tube([0,0,0], [0,100,0]) est centré en [0,50,0]', () => {
  const { o } = nouveau();
  const t = o.tube([0, 0, 0], [0, 100, 0], 10, 10, 'paint');
  vecteurProche(t.position, [0, 50, 0], 1e-9, 'position');
  proche(t.geometry.parameters.height, 100, 1e-9, 'longueur');
});

test('orientation : le rayon r1 est du côté de a et r2 du côté de b', () => {
  const { o } = nouveau();
  const a = [10, 20, 30];
  const b = [40, 60, 30];
  const t = o.tube(a, b, 8, 3, 'paint');
  const l = Math.hypot(30, 40, 0);
  proche(t.geometry.parameters.height, l, 1e-9, 'longueur');
  t.updateMatrix();
  const haut = new THREE.Vector3(0, l / 2, 0).applyMatrix4(t.matrix);
  const bas = new THREE.Vector3(0, -l / 2, 0).applyMatrix4(t.matrix);
  vecteurProche(haut, b, 1e-9, 'bout haut');
  vecteurProche(bas, a, 1e-9, 'bout bas');
  assert.equal(t.geometry.parameters.radiusTop, 3, 'r2 au bout b');
  assert.equal(t.geometry.parameters.radiusBottom, 8, 'r1 au bout a');
});

test('orientation : un tube dessiné vers le bas ne se retourne pas', () => {
  const { o } = nouveau();
  const t = o.tube([0, 100, 0], [0, 0, 0], 5, 5, 'paint');
  t.updateMatrix();
  vecteurProche(new THREE.Vector3(0, 50, 0).applyMatrix4(t.matrix), [0, 0, 0], 1e-9, 'bout haut');
});

test('tube : seg et open règlent la section, sx et sz l’aplatissent', () => {
  const { o } = nouveau();
  const defaut = o.tube([0, 0, 0], [0, 10, 0], 4, 4, 'paint');
  assert.equal(defaut.geometry.parameters.radialSegments, 32);
  assert.equal(defaut.geometry.parameters.openEnded, false);
  const regle = o.tube([0, 0, 0], [0, 10, 0], 4, 4, 'paint', { seg: 12, open: true });
  assert.equal(regle.geometry.parameters.radialSegments, 12);
  assert.equal(regle.geometry.parameters.openEnded, true);
  const plat = o.tube([0, 0, 0], [0, 10, 0], 4, 4, 'paint', { sx: 1.5, sz: 0.5 });
  plat.geometry.computeBoundingBox();
  const { min, max } = plat.geometry.boundingBox;
  proche(max.x - min.x, 4 * 2 * 1.5, 1e-6, 'largeur en x');
  proche(max.z - min.z, 4 * 2 * 0.5, 1e-6, 'largeur en z');
});

test('tubeZ : un tube le long de z, à la position x y du point', () => {
  const { o } = nouveau();
  const t = o.tubeZ([12, 34], -20, 40, 6, 'steel');
  vecteurProche(t.position, [12, 34, 10], 1e-9, 'position');
  proche(t.geometry.parameters.height, 60, 1e-9, 'longueur');
  assert.equal(t.geometry.parameters.radialSegments, 32);
  assert.equal(o.tubeZ([0, 0], 0, 1, 1, 'steel', 8).geometry.parameters.radialSegments, 8);
  t.updateMatrix();
  vecteurProche(new THREE.Vector3(0, 30, 0).applyMatrix4(t.matrix), [12, 34, 40], 1e-9, 'bout z1');
});

test('ell : une sphère mise à l’échelle, placée et tournée autour de z', () => {
  const { o } = nouveau();
  const e = o.ell([1, 2, 3], [4, 5, 6], 'paint', 0.5);
  vecteurProche(e.position, [1, 2, 3]);
  vecteurProche(e.scale, [4, 5, 6]);
  proche(e.rotation.z, 0.5);
  assert.equal(e.geometry.parameters.radius, 1);
  assert.equal(o.ell([0, 0, 0], [1, 1, 1], 'paint').rotation.z, 0, 'rotZ vaut 0 par défaut');
});

test('rbox : transmet largeur, hauteur, profondeur, 3 segments et rayon au RoundedBoxGeometry', () => {
  const { o } = nouveau();
  appels.length = 0;
  const b = o.rbox([5, 6, 7], [20, 30, 40], 0.25, 'paint', 2.5);
  assert.deepEqual(appels, [[20, 30, 40, 3, 2.5]]);
  vecteurProche(b.position, [5, 6, 7]);
  proche(b.rotation.z, 0.25);
});

test('boulon : un hexagone orienté selon la direction, en acier par défaut', () => {
  const { o } = nouveau();
  const b = o.boulon([1, 2, 3], [0, 0, 5]);
  assert.equal(b.userData.role, 'steel');
  assert.equal(b.geometry.parameters.radialSegments, 6);
  assert.equal(b.geometry.parameters.radiusTop, 3.2);
  assert.equal(b.geometry.parameters.height, 3);
  vecteurProche(b.position, [1, 2, 3]);
  vecteurProche(new THREE.Vector3(0, 1, 0).applyQuaternion(b.quaternion), [0, 0, 1], 1e-9, 'axe');
  const gros = o.boulon([0, 0, 0], [1, 0, 0], 5, 8, 'black');
  assert.equal(gros.userData.role, 'black');
  assert.equal(gros.geometry.parameters.radiusTop, 5);
  assert.equal(gros.geometry.parameters.height, 8);
});

test('extr : une forme extrudée, centrée sur z', () => {
  const { o } = nouveau();
  const forme = new THREE.Shape().moveTo(0, 0).lineTo(10, 0).lineTo(10, 10).lineTo(0, 10);
  const e = o.extr(forme, 6, 'paint');
  e.geometry.computeBoundingBox();
  const { min, max } = e.geometry.boundingBox;
  proche(min.z, -3, 1e-9, 'z min');
  proche(max.z, 3, 1e-9, 'z max');
  const biseaute = o.extr(forme, 6, 'paint', 1);
  biseaute.geometry.computeBoundingBox();
  assert.ok(biseaute.geometry.boundingBox.max.x > 10, 'le biseau déborde de la forme');
});

test('engrenage : n dents, trou central et fenêtres', () => {
  const { o } = nouveau();
  const plein = o.engrenage(12, 25, 21.5);
  assert.ok(plein instanceof THREE.Shape);
  assert.equal(plein.getPoints().length, 12 * 4 + 1, 'quatre points par dent, plus la fermeture');
  assert.equal(plein.holes.length, 0);
  const rayons = plein.getPoints().map(p => Math.hypot(p.x, p.y));
  proche(Math.max(...rayons), 25, 1e-9, 'pointe des dents');
  proche(Math.min(...rayons), 21.5, 1e-9, 'pied des dents');
  assert.equal(o.engrenage(12, 25, 21.5, 5).holes.length, 1);
  assert.equal(o.engrenage(12, 25, 21.5, 5, { n: 5, r0: 8, r1: 18, gap: 0.1 }).holes.length, 6);
});

test('engrenage : la forme s’extrude en maillage', () => {
  const { o } = nouveau();
  const m = o.extr(o.engrenage(40, 70, 64, 20, { n: 5, r0: 30, r1: 50, gap: 0.2 }), 3, 'ring');
  assert.ok(m.geometry.attributes.position.count > 100);
  assert.equal(m.userData.role, 'ring');
});

test('tubeCourbe : un tube qui suit la courbe de bout en bout', () => {
  const { o } = nouveau();
  const pts = [[0, 0, 0], [50, 0, 0], [100, 30, 0], [150, 30, 40]];
  const t = o.tubeCourbe(pts, 2, 'hose');
  assert.equal(t.geometry.parameters.radius, 2);
  assert.equal(t.geometry.parameters.tubularSegments, 64);
  assert.equal(o.tubeCourbe(pts, 2, 'hose', 20).geometry.parameters.tubularSegments, 20);
  vecteurProche(t.geometry.parameters.path.getPoint(0), pts[0], 1e-9, 'début');
  vecteurProche(t.geometry.parameters.path.getPoint(1), pts[3], 1e-9, 'fin');
});

test('lathe : le profil [rayon, z] tourne autour de l’axe z', () => {
  const { o } = nouveau();
  const m = o.lathe([[10, 0], [10, 20], [4, 25]], 24, 'cassette');
  const b = boite(m);
  proche(b.min.z, 0, 1e-6, 'z min');
  proche(b.max.z, 25, 1e-6, 'z max');
  proche(b.max.x, 10, 1e-6, 'rayon max en x');
  proche(b.min.x, -10, 1e-6, 'rayon max en -x');
  proche(b.max.y, 10, 1e-6, 'rayon max en y');
  assert.equal(m.userData.role, 'cassette');
});

test('THREE : les outils transmettent le module reçu, pour les formes et les matrices', () => {
  const { o } = nouveau();
  assert.equal(o.THREE, THREE);
});

test('sousGroupe : un groupe rangé dans le groupe des outils, où l’on peut déplacer des maillages', () => {
  const { groupe, o } = nouveau();
  o.zone('etrier');
  const g = o.sousGroupe();
  assert.ok(g.isGroup);
  assert.equal(g.parent, groupe);
  const m = o.rbox([0, 0, 0], [2, 2, 2], 0, 'pad', 0.5);
  g.add(m);
  assert.equal(m.parent, g);
  assert.equal(m.userData.zone, 'etrier', 'le maillage garde son étiquette');
  assert.ok(!groupe.children.includes(m));
});
