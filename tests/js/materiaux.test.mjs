// Tests de src/scene/materiaux.js : pixels de la peinture et des textures, rôles de matières.
// Rien ne touche à WebGL ni au DOM : three.js est importé directement depuis vendor/.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../../vendor/three/three.module.min.js';
import {
  marbre, reliefRuban, striesBrossees, creerMateriaux, ROLES, TEINTES_FLOATING_VIOLET,
} from '../../src/scene/materiaux.js';

const ROLES_ATTENDUS = [
  'paint', 'protector', 'carbon', 'black', 'tape', 'hood', 'saddle', 'rubber', 'rim', 'hub', 'spoke', 'steel',
  'rotor', 'rotorSpider', 'caliper', 'pad', 'padFace', 'hose', 'chain', 'cassette', 'cogSpider', 'ring', 'crank',
  'rd', 'pulley', 'housing',
];

// Le marbre de 256 x 256 coûte un peu de calcul : il est fait une fois pour tous les tests qui en ont besoin.
const marbreParDefaut = marbre();

const moyenne = (pixels, canal) => {
  let somme = 0;
  for (let i = canal; i < pixels.length; i += 4) somme += pixels[i];
  return somme / (pixels.length / 4);
};

test('marbre déterministe', () => {
  assert.deepEqual(marbre(64), marbre(64));
  assert.deepEqual(marbre(64, 5), marbre(64, 5));
});

test('marbre : une autre graine donne une autre veine', () => {
  assert.notDeepEqual(marbre(64, 11), marbre(64, 12));
});

test('marbre : valeurs par défaut 256 et 11', () => {
  assert.ok(marbreParDefaut instanceof Uint8ClampedArray);
  assert.equal(marbreParDefaut.length, 256 * 256 * 4);
  assert.deepEqual(marbre(256, 11), marbreParDefaut);
});

test('marbre violet : R > B > G en moyenne', () => {
  const r = moyenne(marbreParDefaut, 0);
  const g = moyenne(marbreParDefaut, 1);
  const b = moyenne(marbreParDefaut, 2);
  assert.ok(r > b, `R ${r} doit dépasser B ${b}`);
  assert.ok(b > g, `B ${b} doit dépasser G ${g}`);
});

test('marbre : opaque, et chaque canal reste entre les trois teintes de la fiche', () => {
  const teintes = Object.values(TEINTES_FLOATING_VIOLET);
  for (let canal = 0; canal < 3; canal++) {
    const valeurs = teintes.map(t => t[canal]);
    const mini = Math.min(...valeurs);
    const maxi = Math.max(...valeurs);
    for (let i = canal; i < marbreParDefaut.length; i += 4) {
      assert.ok(marbreParDefaut[i] >= mini && marbreParDefaut[i] <= maxi, `canal ${canal} hors des teintes : ${marbreParDefaut[i]}`);
    }
  }
  for (let i = 3; i < marbreParDefaut.length; i += 4) assert.equal(marbreParDefaut[i], 255);
});

test('teintes du Floating Violet : celles de la photo officielle', () => {
  assert.deepEqual(TEINTES_FLOATING_VIOLET.deep, [58, 8, 32]);
  assert.deepEqual(TEINTES_FLOATING_VIOLET.base, [106, 18, 56]);
  assert.deepEqual(TEINTES_FLOATING_VIOLET.light, [182, 74, 122]);
});

test('marbre : se raccorde sans couture quand la texture se répète', () => {
  // Le bruit est périodique. L'écart entre le dernier pixel et le premier ressemble donc à l'écart entre deux voisins.
  const S = 256;
  const rouge = (x, y) => marbreParDefaut[(y * S + x) * 4];
  let couture = 0;
  let voisins = 0;
  for (let i = 0; i < S; i++) {
    couture += Math.abs(rouge(S - 1, i) - rouge(0, i)) + Math.abs(rouge(i, S - 1) - rouge(i, 0));
    voisins += Math.abs(rouge(127, i) - rouge(128, i)) + Math.abs(rouge(i, 127) - rouge(i, 128));
  }
  assert.ok(couture < voisins * 2 + S, `couture visible : écart moyen ${couture / S / 2} contre ${voisins / S / 2} entre voisins`);
});

test('reliefRuban : déterministe, en niveaux de gris, avec une bande sombre en diagonale', () => {
  const r = reliefRuban();
  assert.ok(r instanceof Uint8ClampedArray);
  assert.equal(r.length, 64 * 64 * 4);
  assert.deepEqual(r, reliefRuban(64));
  const px = (x, y) => r[(y * 64 + x) * 4];
  assert.equal(px(32, 32), 0, 'la diagonale est noire');
  assert.equal(px(60, 4), 255, 'loin de la diagonale, le fond est blanc');
  assert.equal(px(4, 60), 255);
  assert.equal(px(0, 63), px(63, 0), 'la bande se raccorde en répétant la texture');
  for (let i = 0; i < r.length; i += 4) {
    assert.equal(r[i], r[i + 1]);
    assert.equal(r[i], r[i + 2]);
    assert.equal(r[i + 3], 255);
  }
});

test('striesBrossees : déterministe, une valeur par ligne, entre 150 et 240', () => {
  const s = striesBrossees();
  assert.ok(s instanceof Uint8ClampedArray);
  assert.equal(s.length, 8 * 256 * 4);
  assert.deepEqual(s, striesBrossees(8, 256));
  assert.notDeepEqual(s, striesBrossees(8, 256, 99));
  const vus = new Set();
  for (let y = 0; y < 256; y++) {
    const v = s[y * 8 * 4];
    assert.ok(v >= 150 && v <= 240, `ligne ${y} hors de 150 à 240 : ${v}`);
    vus.add(v);
    for (let x = 0; x < 8; x++) {
      const o = (y * 8 + x) * 4;
      assert.equal(s[o], v);
      assert.equal(s[o + 1], v);
      assert.equal(s[o + 2], v);
      assert.equal(s[o + 3], 255);
    }
  }
  assert.ok(vus.size > 50, 'les lignes doivent varier');
});

test('rôles complets : reel et simple ont exactement la liste du plan', () => {
  assert.deepEqual([...ROLES], ROLES_ATTENDUS);
  const m = creerMateriaux(THREE, {});
  assert.deepEqual(Object.keys(m).sort(), ['reel', 'simple']);
  assert.deepEqual(Object.keys(m.reel).sort(), [...ROLES_ATTENDUS].sort());
  assert.deepEqual(Object.keys(m.simple).sort(), [...ROLES_ATTENDUS].sort());
  for (const role of ROLES_ATTENDUS) {
    assert.ok(m.reel[role] instanceof THREE.MeshPhysicalMaterial, `reel.${role}`);
    assert.ok(m.simple[role] instanceof THREE.MeshStandardMaterial, `simple.${role}`);
  }
});

test('creerMateriaux sans argument de textures', () => {
  assert.deepEqual(Object.keys(creerMateriaux(THREE).reel).sort(), [...ROLES_ATTENDUS].sort());
});

test('creerMateriaux : une texture absente est omise, sans avertissement de three.js', () => {
  const avertissements = [];
  const memoire = console.warn;
  console.warn = (...a) => avertissements.push(a.join(' '));
  let m;
  try {
    m = creerMateriaux(THREE, {});
  } finally {
    console.warn = memoire;
  }
  assert.deepEqual(avertissements, []);
  assert.equal(m.reel.paint.map, null);
  assert.equal(m.reel.tape.bumpMap, null);
  assert.equal(m.reel.rotor.roughnessMap, null);
});

test('creerMateriaux : les textures passées vont sur la peinture, le ruban et le rotor', () => {
  const peinture = new THREE.DataTexture(marbre(8), 8, 8);
  const ruban = new THREE.DataTexture(reliefRuban(8), 8, 8);
  const brossee = new THREE.DataTexture(striesBrossees(2, 4), 2, 4);
  const m = creerMateriaux(THREE, { texturePeinture: peinture, textureRuban: ruban, textureBrossee: brossee });
  assert.equal(m.reel.paint.map, peinture);
  assert.equal(m.reel.tape.bumpMap, ruban);
  assert.equal(m.reel.tape.bumpScale, 1.5);
  assert.equal(m.reel.rotor.roughnessMap, brossee);
  assert.equal(m.simple.paint.map, null, 'le mode simple reste sans texture');
});

test('creerMateriaux : la peinture est vernie, mi-métal, blanche pour laisser parler la texture', () => {
  const { paint } = creerMateriaux(THREE, {}).reel;
  assert.equal(paint.clearcoat, 1);
  assert.equal(paint.metalness, 0.3);
  assert.equal(paint.color.getHex(), 0xffffff);
});

test('creerMateriaux : chaque appel crée des matières neuves', () => {
  const a = creerMateriaux(THREE, {});
  const b = creerMateriaux(THREE, {});
  assert.notEqual(a.reel.paint, b.reel.paint);
  assert.notEqual(a.simple.paint, b.simple.paint);
});

test('creerMateriaux : cassette et chaîne en acier argenté un peu chaud, pas blanc, comme sur la photo officielle', () => {
  // Sur canyon-photo-4553-fv, la cassette et la chaîne sont d'un acier argenté tirant sur le chaud. Le rendu les
  // donnait presque blanches.
  const { cassette, chain } = creerMateriaux(THREE, {}).reel;
  for (const [nom, m] of [['cassette', cassette], ['chaîne', chain]]) {
    assert.equal(m.metalness, 1, `${nom} : métal`);
    const hsl = m.color.getHSL({}, THREE.SRGBColorSpace);
    assert.ok(hsl.l < 0.75, `${nom} : trop clair (${hsl.l})`);
    const rgb = m.color.getRGB({}, THREE.SRGBColorSpace);
    assert.ok(rgb.r > rgb.b, `${nom} : teinte froide`);
  }
  assert.ok(chain.color.getHSL({}, THREE.SRGBColorSpace).l < cassette.color.getHSL({}, THREE.SRGBColorSpace).l,
    'la chaîne est plus sombre que la cassette');
});
