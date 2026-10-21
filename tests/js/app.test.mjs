// Tests de src/scene/app.js : liste de secours sans la 3D, chargement de three.js, choix d'une zone hors navigateur,
// exports du module et absence d'import statique. Puis, sur une page factice écrite ici (aucune bibliothèque DOM) :
// choisirZone avec une page, et le défilement après une pastille ou un bouton de carte, sur une ou deux colonnes. Le
// rendu (3D, schéma 2D, mise en page) se contrôle dans un navigateur.
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

// ---- Une page factice, sans bibliothèque DOM : juste ce que demarrer() lit et écrit ----

class Faux {
  constructor(donnees = {}) {
    this.attrs = new Map();
    this.dataset = { ...donnees };
    this.style = {};
    this.hidden = false;
    this.ecouteurs = {};
    this.enfants = [];
    this.defilements = [];
    this.rect = { top: 0, bottom: 0 };
    const classes = new Set();
    this.classList = {
      toggle: (c, oui) => ((oui ?? !classes.has(c)) ? classes.add(c) : classes.delete(c)),
      add: c => classes.add(c),
      contains: c => classes.has(c),
    };
  }
  setAttribute(k, v) { this.attrs.set(k, String(v)); }
  getAttribute(k) { return this.attrs.get(k) ?? null; }
  removeAttribute(k) { this.attrs.delete(k); }
  toggleAttribute(k, oui) { if (oui) this.attrs.set(k, ''); else this.attrs.delete(k); }
  addEventListener(type, f) { (this.ecouteurs[type] ??= []).push(f); }
  cliquer() { for (const f of this.ecouteurs.click ?? []) f({ target: this }); }
  append(...e) { this.enfants.push(...e); }
  replaceChildren(...e) { this.enfants = e; }
  getBoundingClientRect() { return this.rect; }
  scrollIntoView(options) { this.defilements.push(options); }
  getContext() { return null; }
  focus() {}
}

const ZONES = JSON.parse(readFileSync(new URL('../../src/scene/zones.json', import.meta.url), 'utf8'));
const MEDIA = /^const UNE_COLONNE = '([^']+)';$/m.exec(CODE)?.[1];

// Monte app.js (une copie neuve du module) sur une page factice et attend la fin de son démarrage : sous Node,
// three.js manque et le schéma 2D ne trouve pas de document SVG, donc la scène finit « sans rendu ». Les globales
// factices restent posées jusqu'à la fin du test `t`.
let copies = 0;
async function pageFactice(t) {
  const el = Object.fromEntries(['#scene', '#scene-stage', '#plan', '#gl', '#variante', '#scene-aide', '#key',
    '#scene-statut', '#scene-alerte', '#approche-liste', '#approche-contenu', '#pins', '#scene .modes', '#vue-ensemble',
    '#approche', '.top'].map(s => [s, new Faux()]));
  el['#zones-data'] = Object.assign(new Faux(), { textContent: JSON.stringify(ZONES) });
  el['.top'].rect = { top: 0, bottom: 60 };
  const onglets = ['2d', 'simple', 'reel'].map(mode => new Faux({ mode }));
  const cartes = ZONES.map(z => new Faux({ zone: z.id }));
  const boutons = ZONES.map(z => new Faux({ zone: z.id }));
  const toutes = { '#scene .modes [role="tab"]': onglets, '.zone-carte[data-zone]': cartes,
    'button.zone-btn[data-zone]': boutons };
  const medias = { [MEDIA]: false, '(prefers-reduced-motion: reduce)': true };
  const globaux = {
    document: {
      documentElement: { dataset: {} },
      querySelector: s => el[s] ?? null,
      querySelectorAll: s => toutes[s] ?? [],
      getElementById: id => el['#' + id] ?? null,
      createElement: () => new Faux(),
    },
    window: globalThis, innerHeight: 800, addEventListener() {}, requestAnimationFrame: () => 1,
    matchMedia: q => ({ matches: medias[q] === true }),
  };
  const avant = Object.fromEntries(Object.keys(globaux).map(k => [k, Object.getOwnPropertyDescriptor(globalThis, k)]));
  const warn = console.warn;
  t.after(() => {
    console.warn = warn;
    for (const [k, d] of Object.entries(avant)) {
      if (d) Object.defineProperty(globalThis, k, d);
      else delete globalThis[k];
    }
  });
  console.warn = () => {}; // les replis de la 3D et du schéma 2D, attendus ici
  Object.assign(globalThis, globaux);
  const module = await import(`../../src/scene/app.js?page-factice-${++copies}`);
  for (let i = 0; i < 300 && !el['#scene'].classList.contains('sans-rendu'); i++) {
    await new Promise(r => setTimeout(r, 10));
  }
  assert.ok(el['#scene'].classList.contains('sans-rendu'), 'le démarrage de la page factice n’a pas fini');
  return { module, el, cartes, boutons, pins: el['#pins'].enfants, medias, doc: globaux.document };
}

test('app.js : une seule colonne se lit avec la requête de la feuille de style', () => {
  assert.equal(MEDIA, '(max-width:1100px)');
  const tete = readFileSync(new URL('../../src/parts/00-head.html', import.meta.url), 'utf8');
  const bloc = tete.split(`@media ${MEDIA}{`)[1]?.split('}')[0] ?? '';
  assert.match(bloc, /\.accueil-grille/, 'la grille de l’accueil ne passe pas à une colonne avec cette requête');
});

test('choisirZone sur une page : zone inconnue refusée, zone connue choisie, sans défilement', async t => {
  const { module, el, cartes, boutons, pins, doc } = await pageFactice(t);
  assert.equal(doc.documentElement.dataset.app, 'demarre');
  assert.equal(pins.length, ZONES.length);
  // Une page, mais une zone inconnue : rien ne change.
  assert.equal(module.choisirZone('inconnue'), false);
  assert.deepEqual(cartes.map(c => c.getAttribute('aria-current')), [null, null, null]);
  assert.deepEqual(pins.map(p => p.classList.contains('on')), [false, false, false]);
  // Une zone connue : sa pastille, sa carte et son bouton seuls.
  assert.equal(module.choisirZone('etrier'), true);
  assert.deepEqual(cartes.map(c => c.getAttribute('aria-current')), [null, 'true', null]);
  assert.deepEqual(pins.map(p => p.getAttribute('aria-pressed')), ['false', 'true', 'false']);
  assert.deepEqual(boutons.map(b => b.getAttribute('aria-pressed')), ['false', 'true', 'false']);
  assert.equal(module.choisirZone('disques'), true);
  assert.deepEqual(cartes.map(c => c.getAttribute('aria-current')), ['true', null, null]);
  // choisirZone seul ne fait jamais défiler la page.
  for (const e of [...cartes, el['#scene-stage']]) assert.deepEqual(e.defilements, []);
});

test('pastilles et boutons de carte : défilement selon une ou deux colonnes', async t => {
  const { el, cartes, boutons, pins, medias } = await pageFactice(t);
  const stage = el['#scene-stage'];
  const vider = () => { for (const e of [...cartes, stage]) e.defilements = []; };
  const hors = { top: 900, bottom: 1040 }, dedans = { top: 200, bottom: 340 };

  // Deux colonnes : la carte de la zone vient à l'écran si elle n'y est pas en entier, rien sinon.
  cartes[2].rect = hors;
  pins[2].cliquer();
  assert.deepEqual(cartes[2].defilements, [{ block: 'nearest', behavior: 'auto' }]);
  assert.equal(cartes[2].getAttribute('aria-current'), 'true');
  vider();
  cartes[1].rect = dedans;
  boutons[1].cliquer();
  assert.deepEqual(cartes[1].defilements, []);
  assert.deepEqual(stage.defilements, []);

  // Une seule colonne : une pastille choisit la zone sans faire défiler la page.
  medias[MEDIA] = true;
  vider();
  pins[2].cliquer();
  assert.equal(cartes[2].getAttribute('aria-current'), 'true');
  assert.deepEqual([...cartes, stage].map(e => e.defilements.length), [0, 0, 0, 0]);
  // Le bouton d'une carte ramène l'image, son haut sous la barre, si elle n'est pas en entier à l'écran.
  stage.rect = { top: -500, bottom: -180 };
  boutons[1].cliquer();
  assert.equal(cartes[1].getAttribute('aria-current'), 'true');
  assert.deepEqual(stage.defilements, [{ block: 'start', behavior: 'auto' }]);
  assert.deepEqual(cartes.map(c => c.defilements.length), [0, 0, 0]);
  // Déjà à l'écran (sous la barre, au-dessus du bas) : rien ne bouge.
  vider();
  stage.rect = { top: 80, bottom: 400 };
  boutons[0].cliquer();
  assert.deepEqual(stage.defilements, []);
  // Sans demande de mouvement réduit, le défilement est doux.
  medias['(prefers-reduced-motion: reduce)'] = false;
  stage.rect = { top: 40, bottom: 360 }; // le haut est sous la barre du haut
  boutons[2].cliquer();
  assert.deepEqual(stage.defilements, [{ block: 'start', behavior: 'smooth' }]);
});
