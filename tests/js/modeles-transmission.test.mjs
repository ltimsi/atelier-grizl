// Tests de comportement des pièces 3D des ateliers de la transmission (src/js/models/m-chain.js, m-cassette.js et
// m-derailleur.js), en plus de leur texte, que test_pieces_3d_transmission (tests/test_pages.py) épingle mot pour mot.
// La visionneuse (src/js/viewer.js) et la pièce tournent dans un contexte vm, avec un faux DOM réduit à ce qu'elles
// touchent. Sans WebGL, la visionneuse construit la pièce, sa barre et ses pastilles, puis s'arrête sur son message :
// le curseur, les bascules et les pastilles marchent comme dans la page, sans rendu.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import * as THREE from '../../vendor/three/three.module.min.js';

const lire = chemin => readFileSync(new URL(`../../${chemin}`, import.meta.url), 'utf8');

class El {
  constructor(tag) {
    Object.assign(this, { tagName: tag.toUpperCase(), children: [], parent: null, attrs: {}, ecoute: {}, className: '',
      textContent: '', hidden: false, dataset: {}, style: {}, classList: { toggle() {}, add() {}, remove() {} } });
  }
  appendChild(c) { c.parent = this; this.children.push(c); return c; }
  insertBefore(c, ref) { c.parent = this; this.children.splice(Math.max(0, this.children.indexOf(ref)), 0, c); return c; }
  insertAdjacentElement(ou, el) {
    const freres = this.parent.children;
    if (el.parent) el.parent.children.splice(el.parent.children.indexOf(el), 1);
    el.parent = this.parent; freres.splice(freres.indexOf(this) + 1, 0, el); return el;
  }
  get nextElementSibling() { const f = this.parent.children; return f[f.indexOf(this) + 1] || null; }
  get firstChild() { return this.children[0] || null; }
  get lastChild() { return this.children[this.children.length - 1] || null; }
  set innerHTML(v) { this.children = []; if (v.includes('<span>')) { this.appendChild(new El('span')); this.appendChild(new El('span')); } }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
  addEventListener(type, fn) { (this.ecoute[type] ||= []).push(fn); }
  declencher(type) { (this.ecoute[type] || []).forEach(fn => fn({})); }
  remove() { if (this.parent) this.parent.children.splice(this.parent.children.indexOf(this), 1); }
  getContext(type) {
    return type === '2d' ? { fillText() {}, set fillStyle(v) {}, set font(v) {}, set textAlign(v) {}, set textBaseline(v) {} } : null;
  }
  descendants() { return this.children.flatMap(c => [c, ...c.descendants()]); }
  querySelectorAll(selecteur) {
    const parties = selecteur.trim().split(/\s+/);
    const va = (el, s) => {
      const m = /^(\w+)?(?:\.([\w-]+))?(?:\[(\w+)=(\w+)\])?$/.exec(s);
      return (!m[1] || el.tagName === m[1].toUpperCase()) && (!m[2] || el.className.split(' ').includes(m[2]))
        && (!m[3] || el[m[3]] === m[4] || el.attrs[m[3]] === m[4]);
    };
    let courant = [this];
    for (const p of parties) courant = [...new Set(courant.flatMap(e => e.descendants().filter(d => va(d, p))))];
    return courant;
  }
  querySelector(s) { return this.querySelectorAll(s)[0] || null; }
}

/** Construit une pièce dans la visionneuse, sans WebGL. Renvoie la visionneuse, la figure et des aides. */
function piece(modele, fichier) {
  const fig = new El('figure'); fig.className = 'v3d'; fig.dataset.model = modele;
  const scene = new El('div'); scene.className = 'v3d-stage'; fig.appendChild(scene);
  const contexte = { document: { createElement: t => new El(t), querySelectorAll: () => [fig] }, requestAnimationFrame: () => 1,
    console, setTimeout: () => 0 };
  contexte.window = contexte;
  contexte.matchMedia = () => ({ matches: true });   // mouvement réduit : chaque cran se pose aussitôt
  vm.createContext(contexte);
  vm.runInContext(lire('src/js/viewer.js'), contexte);
  vm.runInContext(lire(`src/js/models/${fichier}`), contexte);
  contexte.THREE = THREE;
  contexte.AtelierViewer.start();
  const v = contexte.AtelierViewer.viewers[0];
  assert.ok(v && v.model, `${modele} : pièce construite`);
  const curseur = fig.querySelector('input');
  return {
    v, fig,
    cran(n) { curseur.value = String(n); curseur.declencher('input'); },
    textes() { return Array.from(v.pins, p => p.text); },   // un tableau de ce contexte-ci, pas de celui de la pièce
    objet(nom) { const o = v.model.group.getObjectByName(nom); assert.ok(o, `${modele} : ${nom}`); return o; },
    bouton(texte) { return fig.querySelectorAll('.v3d-bar button').find(b => b.textContent === texte); },
  };
}

// Les titres des étapes d'un atelier, dans le chapitre, sans balises.
function titres(id) {
  const html = lire('src/parts/40-transmission.html');
  const section = html.slice(html.indexOf(`id="${id}"`), html.indexOf('</section>', html.indexOf(`id="${id}"`)));
  return [...section.matchAll(/<p class="st-t">([\s\S]*?)<\/p>/g)].map(m => m[1].replace(/<[^>]+>/g, ''));
}

test('dérailleur : le voyant est jaune fixe en mode réglage, éteint sinon, d’après les titres de 4.6', () => {
  const d = piece('derailleur', 'm-derailleur.js'), t = titres('transmission-reglage');
  const entre = t.findIndex(x => x.includes('voyant jaune fixe')) + 1, sort = t.findIndex(x => x.includes('voyant éteint')) + 1;
  assert.ok(entre > 0 && sort > entre, 'titres du mode réglage');
  const voyant = d.objet('voyant');
  for (let n = 1; n <= t.length; n++) {
    d.cran(n);
    const jaune = voyant.material.emissiveIntensity > 0 && voyant.material.color.getHex() === 0xffd21a;
    assert.equal(jaune, n >= entre && n < sort, `étape ${n}`);
  }
});

test('dérailleur : la pastille du 24 dents est sur le 24 dents, à la pointe de ses dents', () => {
  const d = piece('derailleur', 'm-derailleur.js');
  d.cran(6);
  const repere = d.objet('repère du 24 dents').getWorldPosition(new THREE.Vector3());
  for (const n of [24, 28]) {
    const p = d.objet(`pignon ${n}`); p.geometry.computeBoundingBox();
    const b = p.geometry.boundingBox.clone().applyMatrix4(p.matrixWorld);
    const dedans = repere.z >= b.min.z - 1 && repere.z <= b.max.z + 1;
    assert.equal(dedans, n === 24, `plan du ${n} dents`);
  }
  const p24 = d.objet('pignon 24'), pos = p24.geometry.attributes.position;
  let rMax = 0; for (let i = 0; i < pos.count; i++) rMax = Math.max(rMax, Math.hypot(pos.getX(i), pos.getY(i)));
  assert.ok(Math.abs(Math.hypot(repere.x, repere.y) - rMax) < 0.5, 'à la pointe des dents du 24');
  // La pastille est montrée là où le chapitre parle du 24 dents : à l'étape qui y passe.
  assert.ok(d.textes().some(x => x.startsWith('Cinquième pignon')), 'pastille du 24 dents à l’étape 6');
});

test('dérailleur et cassette : six pastilles au plus par étape, chacune montrée à son étape', () => {
  const cas = {
    derailleur: ['m-derailleur.js', 'transmission-reglage', { 'Contrôle la plaque de butée': 'Plaque de butée', 'Serre l’axe B': 'Axe B',
      'Passe sur le 45 dents': 'Vis B', 'Roue arrêtée': 'Bouton de fonction', 'Reviens au mode normal': 'Voyant',
      'Butée basse': 'Vis de butée basse', 'Butée haute': 'Vis de butée haute' }],
    cassette: ['m-cassette.js', 'transmission-cassette', { 'Mets des gants': 'Gants', 'Place le fouet': 'Fouet',
      'Engage le TL-LR021': 'Outil de contre-écrou', 'Dévisse': 'Gants', 'Sors la cassette': 'Entretoises',
      'Aligne les repères': 'Repères', 'Serre le contre-écrou': 'Le 9 dents' }],
  };
  for (const [modele, [fichier, id, attendus]] of Object.entries(cas)) {
    const m = piece(modele, fichier), t = titres(id).map(x => x.replace(/'/g, '’')), vus = new Set();
    for (let n = 1; n <= t.length; n++) {
      m.cran(n);
      const textes = m.textes();
      assert.ok(textes.length >= 1 && textes.length <= 6, `${modele}, étape ${n} : ${textes.length} pastilles`);
      textes.forEach(x => vus.add(x));
      for (const [titre, pastille] of Object.entries(attendus)) {
        if (t[n - 1].startsWith(titre)) assert.ok(textes.some(x => x.startsWith(pastille)), `${modele}, étape ${n} : ${pastille}`);
      }
    }
    const fichierTexte = lire(`src/js/models/${fichier}`);
    const toutes = [...fichierTexte.matchAll(/text: '((?:[^'\\]|\\.)*)'/g)].map(x => x[1]);
    assert.deepEqual([...vus].sort(), toutes.slice().sort(), `${modele} : chaque pastille est montrée à une étape au moins`);
  }
});

test('chaîne : à chaque cran, la pastille de la chaîne et celles de l’étape', () => {
  const c = piece('chain', 'm-chain.js');
  const attendus = { 'Attache, 4.4': [['Bouts coupés'], ['Bouts coupés'], ['Attache rapide', 'Flèche'], ['Fais glisser'], ['Goupilles']],
    'Usure, 4.3': [['Indicateur d’usure'], ['Bout en crochet'], ['Autre bout'], ['Autre bout'], ['S’il entre']] };
  for (const [mode, crans] of Object.entries(attendus)) {
    c.bouton(mode).declencher('click');
    crans.forEach((debuts, i) => {
      c.cran(i + 1);
      const textes = c.textes();
      assert.ok(textes[0].startsWith('Chaîne Shimano CN-M8100'), `${mode}, cran ${i + 1}`);
      assert.deepEqual(textes.slice(1).map(x => debuts.find(d => x.startsWith(d))), debuts, `${mode}, cran ${i + 1}`);
    });
  }
});

test('chaîne : la bascule de l’usure n’est montrée qu’avec le CC-3.2, en mode 4.3', () => {
  const c = piece('chain', 'm-chain.js');
  c.v.model.onFrame(0.016);
  const bascule = c.fig.querySelectorAll('.v3d-bar button').find(b => b.textContent.startsWith('Allongée de 0,5'));
  assert.ok(bascule, 'bascule');
  assert.match(bascule.textContent, /exagérée 8 fois/);
  assert.equal(bascule.hidden, true, 'cachée en mode 4.4');
  c.bouton('Usure, 4.3').declencher('click');
  assert.equal(bascule.hidden, false, 'montrée en mode 4.3');
  bascule.declencher('click');
  assert.equal(bascule.getAttribute('aria-pressed'), 'true');
  c.bouton('Attache, 4.4').declencher('click');
  assert.equal(bascule.hidden, true, 'cachée de nouveau');
  assert.equal(bascule.getAttribute('aria-pressed'), 'false', 'la chaîne revient neuve');
});
