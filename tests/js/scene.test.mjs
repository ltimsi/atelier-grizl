// Tests des calculs purs de src/scene/scene.js et src/scene/schema2d.js. La scène elle-même demande WebGL et se
// contrôle dans un navigateur ; ici, on teste ce que Node sait calculer : cadrage de la caméra, projection des
// pastilles, zones lues sur les maillages, liste des approximations, formes et cadrage du schéma 2D.
// Le RoundedBoxGeometry de three/addons importe 'three' en nom nu, ce que Node ne sait pas résoudre.
// Un faux le remplace.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import * as THREE from '../../vendor/three/three.module.min.js';
import { GEO, points, approximations } from '../../src/scene/geometrie.js';
import { SOURCES } from '../../src/scene/sources.js';
import { creerMateriaux } from '../../src/scene/materiaux.js';
import { creerOutils } from '../../src/scene/outils3d.js';
import {
  PIECES, distanceEnsemble, positionVue, reculVue, versPixels, zonesDuGroupe, listerApproximations,
} from '../../src/scene/scene.js';
import { formesSchema, cadreVue, versPixelsSchema } from '../../src/scene/schema2d.js';
import { CF7 } from './cf7.mjs';

const ZONES = JSON.parse(readFileSync(new URL('../../src/scene/zones.json', import.meta.url), 'utf8'));
const D2R = Math.PI / 180;
const proche = (reel, attendu, tol, nom) =>
  assert.ok(Math.abs(reel - attendu) <= tol, `${nom} : ${reel} au lieu de ${attendu} (tolérance ${tol})`);

class FauxRoundedBox extends THREE.BoxGeometry {
  constructor(w, h, d) {
    super(w, h, d);
  }
}
const materiaux = creerMateriaux(THREE, {});

// Construit un module de pièce dans un groupe neuf, comme le fait la scène.
function groupeDe(module) {
  const groupe = new THREE.Group();
  module.construire(creerOutils(THREE, FauxRoundedBox, groupe, materiaux), points(GEO), GEO);
  return groupe;
}

// ---- Scène ----

test('scène : vue d’ensemble, chaque coin tient dans l’image avec sa marge', () => {
  // Vue de face, champ de 90 degrés : la distance vaut la demi-largeur, ou la demi-hauteur sur un écran large.
  const plat = [[-300, -200, 0], [300, -200, 0], [-300, 200, 0], [300, 200, 0]];
  proche(distanceEnsemble(plat, [0, 0, 1], 90, 1, [1, 1]), 300, 1e-9, 'carré, la largeur commande');
  proche(distanceEnsemble(plat, [0, 0, 1], 90, 2, [1, 1]), 200, 1e-9, 'écran large, la hauteur commande');
  proche(distanceEnsemble(plat, [0, 0, 3], 90, 1, [1.5, 1]), 450, 1e-9, 'marge en largeur, direction normalisée');
  // Vue de biais : la perspective grossit le côté proche. On projette les coins avec une vraie caméra.
  const coins = [];
  for (const x of [-894, 894]) for (const y of [-510, 510]) for (const z of [-255, 255]) coins.push([x, y, z]);
  const dir = [0.26, 0.1, 1], marges = [1.06, 1.12], aspect = 420 / 346;
  const d = distanceEnsemble(coins, dir, 28, aspect, marges);
  const camera = new THREE.PerspectiveCamera(28, aspect, 10, 30000);
  camera.position.set(...positionVue([0, 0, 0], dir, d));
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();
  const ndc = coins.map(c => new THREE.Vector3(...c).project(camera));
  const bordX = Math.max(...ndc.map(v => Math.abs(v.x))) * marges[0];
  const bordY = Math.max(...ndc.map(v => Math.abs(v.y))) * marges[1];
  assert.ok(bordX <= 1 + 1e-9 && bordY <= 1 + 1e-9, `coin hors de sa marge : ${bordX}, ${bordY}`);
  proche(Math.max(bordX, bordY), 1, 1e-9, 'au plus près : un coin touche sa marge');
});

test('scène : position de vue, direction normalisée, recul sur un écran étroit', () => {
  assert.deepEqual(positionVue([10, 20, 30], [0, 0, 2], 100), [10, 20, 130]);
  assert.deepEqual(positionVue([0, 0, 0], [3, 0, 4], 50), [30, 0, 40]);
  assert.equal(reculVue(2), 1, 'écran large : pas de recul');
  assert.equal(reculVue(1.25), 1, 'à partir de 1,25');
  proche(reculVue(0.5), 2.5, 1e-9, 'écran étroit : 1,25 / 0,5');
});

test('scène : projection vers les pixels et visibilité des pastilles', () => {
  assert.deepEqual(versPixels([0, 0, 0.5], 400, 300), { x: 200, y: 150, visible: true });
  assert.deepEqual(versPixels([-1, 1, 0.5], 400, 300), { x: 0, y: 0, visible: true });
  assert.equal(versPixels([1.05, 0, 0.5], 400, 300).visible, true, 'marge de vingt pixels');
  assert.equal(versPixels([1.2, 0, 0.5], 400, 300).visible, false, 'hors champ à droite');
  assert.equal(versPixels([0, -1.2, 0.5], 400, 300).visible, false, 'hors champ en bas');
  assert.equal(versPixels([0, 0, 1.01], 400, 300).visible, false, 'derrière la caméra');
});

test('scène : zones lues sur les maillages de chaque pièce', () => {
  const attendu = {
    cadre: [], roues: [], freins: ['disques', 'etrier', 'manettes'], transmission: [], poste: ['manettes'],
  };
  assert.deepEqual(PIECES.map(m => m.META.id), Object.keys(attendu));
  for (const module of PIECES) {
    assert.deepEqual(zonesDuGroupe(groupeDe(module)), attendu[module.META.id], module.META.id);
  }
});

test('scène : chaque zone de zones.json a des maillages, aucun maillage hors des zones', () => {
  const vues = new Set(PIECES.flatMap(m => zonesDuGroupe(groupeDe(m))));
  assert.deepEqual([...vues].sort(), ZONES.map(z => z.id).sort());
});

test('scène : approximations par pièce, avec leurs zones et leurs sources, puis la géométrie', () => {
  const pieces = PIECES.map(m => ({ meta: m.META, zones: zonesDuGroupe(groupeDe(m)) }));
  const liste = listerApproximations(pieces);
  assert.equal(liste.length, PIECES.length + 1);
  PIECES.forEach((m, i) => {
    const e = liste[i];
    assert.equal(e.piece, m.META.nom);
    assert.deepEqual(e.zones, pieces[i].zones);
    assert.deepEqual(e.approche, [...m.META.approche]);
    assert.deepEqual(e.aVerifier, [...m.META.aVerifier]);
    assert.deepEqual(e.sources.map(s => s.id), [...m.META.sources]);
    for (const s of e.sources) assert.deepEqual(s, { id: s.id, titre: SOURCES[s.id].titre, url: SOURCES[s.id].url });
  });
  const freins = liste.find(e => e.piece === PIECES.find(m => m.META.id === 'freins').META.nom);
  assert.deepEqual(freins.zones, ['disques', 'etrier', 'manettes'], 'freins : trois zones, lues sur les maillages');

  const geo = liste[liste.length - 1];
  assert.equal(geo.piece, 'Géométrie');
  assert.deepEqual(geo.zones, []);
  assert.deepEqual(geo.approche, approximations(GEO).map(a => a.note));
  assert.ok(geo.aVerifier.includes(GEO.angleDirection.aVerifier), 'angle de direction à vérifier');
  assert.equal(new Set(geo.aVerifier).size, geo.aVerifier.length, 'pas de doublon');
  const ids = geo.sources.map(s => s.id);
  assert.ok(ids.includes('canyon-4556'), 'fiche Canyon du Grizl CF 8 Di2');
  assert.ok(!ids.some(id => /4553/.test(id)), 'plus de fiche du CF 7');
  assert.deepEqual(new Set(ids), new Set(Object.values(GEO).map(e => e.src).filter(Boolean)));
});

test('scène : la variante de l’étrier est la seule, et plus aucun maillage ne porte de variante', () => {
  const avecVariante = ZONES.filter(z => z.variante).map(z => z.id);
  assert.deepEqual(avecVariante, ['etrier']);
  for (const module of PIECES) groupeDe(module).traverse(o => {
    if (o.isMesh) assert.equal('variante' in o.userData, false, `${module.META.id} : ${o.name || o.userData.role}`);
  });
  const code = readFileSync(new URL('../../src/scene/scene.js', import.meta.url), 'utf8');
  assert.ok(!/'disques' montre/.test(code), 'scene.js décrit encore la variante des disques');
  // La variante par maillage a disparu : ni dans la scène, ni dans les outils, ni dans les pièces.
  assert.ok(!/userData\.variante|montrerVariantes/.test(code), 'scene.js lit encore une variante par maillage');
  const outils = readFileSync(new URL('../../src/scene/outils3d.js', import.meta.url), 'utf8');
  assert.ok(!/variante/.test(outils), 'outils3d.js garde la variante par maillage');
  for (const f of ['cadre', 'freins', 'poste', 'roues', 'transmission']) {
    const piece = readFileSync(new URL(`../../src/scene/pieces/${f}.js`, import.meta.url), 'utf8');
    assert.ok(!/o\.variante\(/.test(piece), `${f}.js appelle encore o.variante`);
  }
});

// Les textes qui peuvent citer un document du registre : les pages du guide (src/parts, par l'adresse du document) et
// la recherche (docs/recherche, par son id ou son adresse). La page « Sources » montre tout le registre.
const textes = dossier => readdirSync(new URL(`../../${dossier}/`, import.meta.url))
  .filter(f => /\.(html|md)$/.test(f))
  .map(f => readFileSync(new URL(`../../${dossier}/${f}`, import.meta.url), 'utf8'));

test('registre : chaque document est cité, par une pièce, la géométrie, une page ou la recherche, et aucun n’est du CF 7', () => {
  const parLaScene = new Set([
    ...PIECES.flatMap(m => [...m.META.sources, ...Object.values(m.COTES ?? {}).map(c => c.src)]),
    ...Object.values(GEO).map(e => e.src).filter(Boolean),
  ]);
  const pages = textes('src/parts').join('\n'), recherche = textes('docs/recherche').join('\n');
  for (const [id, s] of Object.entries(SOURCES)) {
    assert.ok(!CF7.test(id) && !CF7.test(s.titre) && !CF7.test(s.url), `${id} : document du CF 7`);
    const cite = parLaScene.has(id) || pages.includes(s.url) || recherche.includes(id) || recherche.includes(s.url);
    assert.ok(cite, `${id} : cité ni par une pièce, ni par la géométrie, ni par une page, ni par la recherche`);
  }
  for (const id of parLaScene) assert.ok(SOURCES[id], `source inconnue : ${id}`);
});

test('scène : une source absente de SOURCES est refusée', () => {
  const meta = { nom: 'Pièce', sources: ['inconnue'], approche: [], aVerifier: [] };
  assert.throws(() => listerApproximations([{ meta, zones: [] }]), /inconnue/);
});

// ---- Schéma 2D ----

const p = points(GEO);
const schema = formesSchema(p, GEO);
const formes = schema.groupes.flatMap(g => g.formes.map(f => ({ ...f, zone: g.zone })));
const nombres = d => (d.match(/-?\d+(\.\d+)?/g) || []).map(Number);
const coins = f => { const n = nombres(f.attrs.d); return [0, 2, 4, 6].map(i => [n[i], -n[i + 1]]); };

test('schéma : chaque zone de zones.json a ses formes, et aucune autre zone', () => {
  const zones = new Set(schema.groupes.map(g => g.zone).filter(Boolean));
  assert.deepEqual([...zones].sort(), ZONES.map(z => z.id).sort());
  for (const z of ZONES) assert.ok(formes.some(f => f.zone === z.id), `${z.id} sans forme`);
});

test('schéma : coordonnées toutes finies', () => {
  for (const f of formes) for (const [k, v] of Object.entries(f.attrs)) {
    assert.ok(!/NaN|undefined|Infinity/.test(String(v)), `${f.nom || f.tag} : ${k} = ${v}`);
  }
});

test('schéma : étriers à leur place et tournés selon GEO', () => {
  for (const [nom, c, deg, zone] of [
    ['étrier avant', p.CF, GEO.angleEtrierAvant.v, 'etrier'],
    ['étrier arrière', p.CR, GEO.angleEtrierArriere.v, null],
  ]) {
    const f = formes.find(x => x.nom === nom);
    assert.ok(f, `${nom} absent`);
    assert.equal(f.zone, zone, `${nom} : zone`);
    const q = coins(f);
    const centre = [0, 1].map(i => q.reduce((s, k) => s + k[i], 0) / 4);
    // Le centre de l'étrier est sur le rayon qui passe par son point, au plus à quelques millimètres.
    const radial = [Math.cos(deg * D2R), Math.sin(deg * D2R)];
    const ecart = [centre[0] - c[0], centre[1] - c[1]];
    proche(ecart[0] * radial[1] - ecart[1] * radial[0], 0, 0.2, `${nom} : centre sur le rayon`);
    proche(Math.hypot(...ecart), 6, 0.2, `${nom} : centre au-delà de son point`);
    // Le grand côté est tangent au disque : perpendiculaire au rayon.
    const cote = [q[1][0] - q[0][0], q[1][1] - q[0][1]];
    proche((cote[0] * radial[0] + cote[1] * radial[1]) / Math.hypot(...cote), 0, 0.01, `${nom} : tangent au disque`);
  }
});

test('schéma : la main publiée est posée au-dessus du repose-main de la cocotte dessinée, comme dans la 3D', () => {
  const cocotte = formes.find(f => f.nom === 'cocotte');
  assert.ok(cocotte, 'cocotte absente');
  assert.equal(cocotte.zone, 'manettes');
  const n = nombres(cocotte.attrs.d), sommets = [];
  for (let i = 0; i < n.length; i += 2) sommets.push([n[i], -n[i + 1]]);
  // Le contour suit le dessus de l'arrière vers le nez, puis le dessous : le dessus est sa première moitié.
  const dessus = sommets.slice(0, sommets.length / 2);
  const [mx, my] = p.ancres.mains;
  let y = null;
  for (let i = 0; i < dessus.length - 1; i++) {
    const [a, b] = [dessus[i], dessus[i + 1]];
    if ((a[0] - mx) * (b[0] - mx) <= 0 && a[0] !== b[0]) y = a[1] + (b[1] - a[1]) * (mx - a[0]) / (b[0] - a[0]);
  }
  assert.ok(y !== null, 'la main n’est pas au-dessus de la cocotte');
  assert.ok(my - y >= 20 && my - y <= 50, `main à ${(my - y).toFixed(1)} mm au-dessus du repose-main`);
});

test('schéma : boîte d’ensemble, des pneus au sol', () => {
  const { x, y, w, h } = schema.boite;
  proche(x, p.RA[0] - GEO.rayonPneu.v, 0.5, 'arrière du pneu arrière');
  proche(x + w, p.FA[0] + GEO.rayonPneu.v, 0.5, 'avant du pneu avant');
  proche(y + h, 0, 0.5, 'sol');
  assert.ok(-y > p.ancres.mains[1], 'la boîte monte au-dessus des mains');
});

test('schéma : cadre centré, élargi au rapport de l’écran', () => {
  assert.deepEqual(cadreVue(100, -50, 400, 280), { x: -100, y: -190, w: 400, h: 280 });
  const large = cadreVue(0, 0, 400, 280, 2);
  assert.deepEqual(large, { x: -280, y: -140, w: 560, h: 280 });
  const haut = cadreVue(0, 0, 400, 280, 1);
  assert.deepEqual(haut, { x: -200, y: -200, w: 400, h: 400 });
});

test('schéma : pastilles, en pixels pour un SVG en xMidYMid meet', () => {
  const vb = { x: 0, y: -200, w: 400, h: 200 };
  // Même rapport : le centre du cadre tombe au centre de l'image.
  assert.deepEqual(versPixelsSchema([200, 100], vb, 800, 400), { x: 400, y: 200, visible: true });
  // Image deux fois plus haute que le cadre : bandes vides en haut et en bas.
  assert.deepEqual(versPixelsSchema([0, 200], vb, 400, 400), { x: 0, y: 100, visible: true });
  assert.equal(versPixelsSchema([600, 100], vb, 400, 200).visible, false, 'hors cadre');
});
