// Tests des calculs purs de src/js/site.js (recherche, anciennes ancres de la racine), de src/js/references.js
// (sources rangées par type) et de src/scene/liste-approche.js (la liste « Ce qui est approché »). Le reste de
// site.js et de references.js demande un document et se contrôle dans un navigateur : importés sous Node, ces
// modules ne se branchent sur rien.
import test from 'node:test';
import assert from 'node:assert/strict';
import { normaliser, chercher, cibleAncienne } from '../../src/js/site.js';
import { sourcesParType } from '../../src/js/references.js';
import { listeApproche } from '../../src/scene/liste-approche.js';
import * as scene from '../../src/scene/scene.js';
import { SOURCES } from '../../src/scene/sources.js';

const INDEX = [
  { k: 'Catégorie', t: 'Freins', u: 'freins/' },
  { k: 'Atelier 2.3', t: 'Changer les plaquettes', u: 'freins/plaquettes/' },
  { k: 'Atelier 2.5', t: 'Centrer l’étrier', u: 'freins/centrage/' },
  { k: 'Étape · 2.5', t: 'Libère l’étrier', u: 'freins/centrage/' },
  { k: 'Outil · 2.2', t: 'Outil Center Lock TL-FC36', u: 'freins/disques/' },
  { k: 'Pièce d’origine', t: 'Disques · Shimano SM-RT64', u: 'composants/#composants-freins' },
];

test('normaliser : minuscules, sans accents', () => {
  assert.equal(normaliser('Étrier À'), 'etrier a');
  assert.equal(normaliser('DÉRAILLEUR GRX'), 'derailleur grx');
  assert.equal(normaliser('Ça'), 'ca');
  assert.equal(normaliser(''), '');
});

test('normaliser : apostrophes, ligatures et espaces insécables comme au clavier', () => {
  assert.equal(normaliser('l’étrier'), normaliser("l'etrier"));
  assert.equal(normaliser('Nœud'), 'noeud');
  assert.equal(normaliser('40 Nm'), '40 nm');
  assert.equal(normaliser('40 Nm'), '40 nm');
});

test('chercher : rien sous deux caractères', () => {
  assert.deepEqual(chercher(INDEX, ''), []);
  assert.deepEqual(chercher(INDEX, 'e'), []);
  assert.deepEqual(chercher(INDEX, '   e  '), [], 'les blancs ne comptent pas');
});

test('chercher : sous-chaîne sans casse ni accents, dans l’ordre de l’index', () => {
  const t = r => r.map(e => e.t);
  assert.deepEqual(t(chercher(INDEX, 'etrier')), ['Centrer l’étrier', 'Libère l’étrier']);
  assert.deepEqual(t(chercher(INDEX, 'ÉTRIER')), ['Centrer l’étrier', 'Libère l’étrier']);
  assert.deepEqual(t(chercher(INDEX, "l'étrier")), ['Centrer l’étrier', 'Libère l’étrier'], 'apostrophe droite');
  assert.deepEqual(chercher(INDEX, 'TL-FC36'), [INDEX[4]]);
  assert.deepEqual(chercher(INDEX, 'tl-fc36'), [INDEX[4]]);
  assert.deepEqual(chercher(INDEX, '  plaquettes '), [INDEX[1]]);
  assert.deepEqual(chercher(INDEX, 'introuvable'), []);
});

test('chercher : le genre compte aussi, « 2.5 » trouve l’atelier et ses étapes', () => {
  assert.deepEqual(chercher(INDEX, '2.5'), [INDEX[2], INDEX[3]]);
  assert.deepEqual(chercher(INDEX, 'piece d’origine'), [INDEX[5]]);
});

test('chercher : au plus `max` résultats, 12 par défaut', () => {
  const grand = Array.from({ length: 30 }, (_, i) => ({ k: 'Étape', t: `Étape ${i + 1}`, u: 'freins/' }));
  assert.equal(chercher(grand, 'etape').length, 12);
  assert.deepEqual(chercher(grand, 'etape', 3), grand.slice(0, 3));
  assert.deepEqual(chercher(grand, 'etape 2', 50).map(e => e.t), ['Étape 2', 'Étape 20', 'Étape 21', 'Étape 22',
    'Étape 23', 'Étape 24', 'Étape 25', 'Étape 26', 'Étape 27', 'Étape 28', 'Étape 29']);
});

test('chercher : sans index (recherche.js absent), aucun résultat', () => {
  assert.deepEqual(chercher(undefined, 'freins'), []);
  assert.deepEqual(chercher(null, 'freins'), []);
});

test('cibleAncienne : l’adresse d’un ancien #id de la racine, ou null', () => {
  const liens = { 'freins-plaquettes': 'freins/plaquettes/', freins: 'freins/', 'freins-pl-2': 'freins/plaquettes/#freins-pl-2' };
  assert.equal(cibleAncienne('#freins-plaquettes', liens), 'freins/plaquettes/');
  assert.equal(cibleAncienne('#freins', liens), 'freins/');
  assert.equal(cibleAncienne('#freins-pl-2', liens), 'freins/plaquettes/#freins-pl-2');
  assert.equal(cibleAncienne('#freins%2Dplaquettes', liens), 'freins/plaquettes/', 'ancre encodée');
  assert.equal(cibleAncienne('#inconnu', liens), null);
  assert.equal(cibleAncienne('', liens), null);
  assert.equal(cibleAncienne('#', liens), null);
  assert.equal(cibleAncienne('#%E0', liens), null, 'un encodage invalide ne lève pas d’erreur');
  assert.equal(cibleAncienne('#constructor', liens), null, 'pas de clé héritée');
  assert.equal(cibleAncienne('#toString', {}), null);
  assert.equal(cibleAncienne('#freins', null), null, 'sans table');
  assert.equal(cibleAncienne('#freins', { freins: 42 }), null, 'seulement une adresse');
});

test('site.js et references.js importés sous Node : aucun document touché', () => {
  assert.equal(typeof globalThis.document, 'undefined');
  assert.equal(typeof globalThis.window, 'undefined');
  assert.equal(typeof normaliser, 'function');
  assert.equal(typeof sourcesParType, 'function');
});

test('sourcesParType : chaque source une fois, rangée sous son type, avec les pièces qu’elle justifie', () => {
  const liste = scene.listerApproximations(scene.PIECES.map(m => ({ meta: m.META, zones: [] })));
  const groupes = sourcesParType(SOURCES, liste);
  const vues = groupes.flatMap(g => g.sources.map(s => s.id));
  assert.deepEqual([...vues].sort(), Object.keys(SOURCES).sort());
  assert.deepEqual(groupes.map(g => g.type), ['fiche', 'manuel', 'tableau', 'photo']);
  assert.deepEqual(groupes.map(g => g.titre), ['Fiches', 'Manuels', 'Tableaux', 'Photos']);
  for (const g of groupes) {
    for (const s of g.sources) {
      assert.equal(SOURCES[s.id].type, g.type, s.id);
      assert.equal(s.titre, SOURCES[s.id].titre);
      assert.match(s.url, /^https:\/\//);
      const attendues = liste.filter(e => e.sources.some(x => x.id === s.id)).map(e => e.piece);
      assert.deepEqual(s.pieces, attendues, s.id);
    }
  }
  assert.ok(groupes.some(g => g.sources.some(s => s.pieces.length)), 'au moins une source justifie une pièce');
});

test('sourcesParType : un type inconnu vient en dernier, sous son nom', () => {
  const groupes = sourcesParType({
    a: { titre: 'A', url: 'https://a', type: 'photo' },
    b: { titre: 'B', url: 'https://b', type: 'gabarit' },
    c: { titre: 'C', url: 'https://c', type: 'fiche' },
  }, []);
  assert.deepEqual(groupes.map(g => [g.type, g.titre, g.sources.map(s => s.id)]),
    [['fiche', 'Fiches', ['c']], ['photo', 'Photos', ['a']], ['gabarit', 'gabarit', ['b']]]);
  assert.deepEqual(groupes[0].sources[0].pieces, []);
});

// Un document réduit à ce que demande listeApproche.
function fauxDocument() {
  const noeud = (tag) => ({
    tag, enfants: [], attrs: {}, className: '', textContent: '',
    append(...n) { this.enfants.push(...n); },
    set href(v) { this.attrs.href = v; }, get href() { return this.attrs.href; },
    set target(v) { this.attrs.target = v; }, get target() { return this.attrs.target; },
    set rel(v) { this.attrs.rel = v; }, get rel() { return this.attrs.rel; },
  });
  return { createElement: noeud, createDocumentFragment: () => noeud('#fragment') };
}
const tags = n => n.enfants.map(e => e.tag);

test('listeApproche : une section par pièce, titre, documents en liens, formes approchées, à vérifier', () => {
  const entrees = [
    { piece: 'Freins', approche: ['a1'], aVerifier: ['v1', 'v2'],
      sources: [{ id: 's', titre: 'Shimano DM', url: 'https://si.shimano.com/x.pdf' }] },
    { piece: 'Géométrie', approche: [], aVerifier: [], sources: [] },
  ];
  const f = listeApproche(fauxDocument(), entrees);
  assert.equal(f.tag, '#fragment');
  assert.deepEqual(tags(f), ['section', 'section']);
  const [s, vide] = f.enfants;
  assert.equal(s.className, 'appr');
  assert.deepEqual(tags(s), ['h3', 'h4', 'ul', 'h4', 'ul', 'h4', 'ul']);
  assert.deepEqual(s.enfants.filter((_, i) => i % 2 === 1 || i === 0).map(e => e.textContent),
    ['Freins', 'Documents', 'Formes approchées', 'À vérifier à la livraison']);
  const lien = s.enfants[2].enfants[0].enfants[0];
  assert.deepEqual([lien.tag, lien.textContent, lien.href, lien.target, lien.rel],
    ['a', 'Shimano DM', 'https://si.shimano.com/x.pdf', '_blank', 'noopener']);
  assert.deepEqual(s.enfants[6].enfants.map(li => li.textContent), ['v1', 'v2']);
  assert.deepEqual(tags(vide), ['h3'], 'une pièce sans rien à dire garde son titre seul');
});

test('listeApproche : le niveau des titres se choisit', () => {
  const f = listeApproche(fauxDocument(), [{ piece: 'P', approche: ['a'], aVerifier: [], sources: [] }], 2);
  assert.deepEqual(tags(f.enfants[0]), ['h2', 'h3', 'ul']);
});
