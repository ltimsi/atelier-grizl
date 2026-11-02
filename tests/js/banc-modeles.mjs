// Banc partagé des tests de comportement des pièces 3D d'atelier (modeles-transmission.test.mjs,
// modeles-accessoires.test.mjs). La visionneuse (src/js/viewer.js) et la pièce tournent dans un contexte vm, avec un
// faux DOM réduit à ce qu'elles touchent. Sans WebGL, la visionneuse construit la pièce, sa barre et ses pastilles,
// puis s'arrête sur son message : le curseur, les bascules et les pastilles marchent comme dans la page, sans rendu.
// Pour placer les pastilles à l'écran, vue() donne à la visionneuse une caméra et un faux moteur de rendu, et appelle
// son propre placePins.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import * as THREE from '../../vendor/three/three.module.min.js';

export const lire = chemin => readFileSync(new URL(`../../${chemin}`, import.meta.url), 'utf8');

// Les seules requêtes de média que la visionneuse et les pièces posent : une autre fait échouer le test, au lieu de
// recevoir en silence la réponse du mouvement réduit.
export const MEDIAS = new Set(['(prefers-reduced-motion: reduce)']);

export class El {
  constructor(tag) {
    const classes = new Set();
    Object.assign(this, { tagName: tag.toUpperCase(), children: [], parent: null, attrs: {}, ecoute: {}, className: '',
      textContent: '', hidden: false, dataset: {}, style: {},
      // classList comme celle du DOM, pour lire ce que la visionneuse fait des pastilles (« hide », « on »)
      classList: {
        toggle(nom, force) { const v = force === undefined ? !classes.has(nom) : !!force; if (v) classes.add(nom); else classes.delete(nom); return v; },
        add(nom) { classes.add(nom); }, remove(nom) { classes.delete(nom); }, contains(nom) { return classes.has(nom); } } });
  }
  appendChild(c) { c.parent = this; this.children.push(c); return c; }
  // comme le DOM : sans référence, en fin de liste ; une référence qui n'est pas un enfant est une erreur
  insertBefore(c, ref) {
    if (ref == null) return this.appendChild(c);
    const i = this.children.indexOf(ref);
    if (i < 0) throw new Error('insertBefore : la référence n’est pas un enfant');
    c.parent = this; this.children.splice(i, 0, c); return c;
  }
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
export function piece(modele, fichier) {
  const fig = new El('figure'); fig.className = 'v3d'; fig.dataset.model = modele;
  const scene = new El('div'); scene.className = 'v3d-stage'; fig.appendChild(scene);
  const contexte = { document: { createElement: t => new El(t), querySelectorAll: () => [fig] }, requestAnimationFrame: () => 1,
    console, setTimeout: () => 0 };
  contexte.window = contexte;
  // mouvement réduit : chaque cran se pose aussitôt
  contexte.matchMedia = q => { assert.ok(MEDIAS.has(q), `requête de média inattendue : ${q}`); return { matches: true }; };
  vm.createContext(contexte);
  vm.runInContext(lire('src/js/viewer.js'), contexte);
  vm.runInContext(lire(`src/js/models/${fichier}`), contexte);
  contexte.THREE = THREE;
  contexte.AtelierViewer.start();
  const v = contexte.AtelierViewer.viewers[0];
  assert.ok(v && v.model, `${modele} : pièce construite`);
  const curseur = fig.querySelector('input');
  return {
    v, fig, scene,
    cran(n) { curseur.value = String(n); curseur.declencher('input'); },
    textes() { return Array.from(v.pins, p => p.text); },   // un tableau de ce contexte-ci, pas de celui de la pièce
    pastille(debut) { const p = v.pins.find(x => x.text.startsWith(debut)); assert.ok(p, `${modele} : ${debut}`); return p; },
    objet(nom) { const o = v.model.group.getObjectByName(nom); assert.ok(o, `${modele} : ${nom}`); return o; },
    bouton(texte) { return fig.querySelectorAll('.v3d-bar button').find(b => b.textContent === texte); },
  };
}

// Donne à la visionneuse une scène de `largeur` px, au format 4/3 de .v3d-stage (00-head.html), une caméra et un faux
// moteur de rendu qui, comme le vrai, met la caméra à jour ; puis, à chaque appel, pose la caméra par défaut de la pièce
// (ou celle du test) et place les pastilles avec placePins. Renvoie, pour chaque pastille de l'étape : texte, x, y en
// px depuis le coin haut gauche de la scène, et si la visionneuse la cache.
export function vue(m, largeur) {
  const { v, scene } = m, hauteur = Math.round(largeur * 3 / 4);
  scene.clientWidth = largeur; scene.clientHeight = hauteur;
  v.renderer = { render(s, camera) { camera.updateMatrixWorld(); } };
  v.camera = new THREE.PerspectiveCamera(32, largeur / hauteur, 0.5, 8000);
  v.pinsEl = new El('div'); v.renderPins();
  let t = 1000;
  return (reglage = () => v.reset()) => {
    reglage(); v.dirty = true; v.tick(t += 16);
    return v.pins.map((p, i) => {
      const [, x, y] = /translate\(([-\d.]+)px,([-\d.]+)px\)/.exec(v.pinEls[i].style.transform).map(Number);
      return { texte: p.text, x, y, cachee: v.pinEls[i].classList.contains('hide'), largeur, hauteur };
    });
  };
}

// L'aide « Glisse sur le côté pour tourner… » de la visionneuse (.v3d-hint, 00-head.html : 8 px du haut, police de
// 0,7 rem) tient sur deux lignes sous 480 px de large, sur une au-dessus : une ligne compte 15 px. Une pastille fait
// 24 px de diamètre.
export function basDeLAide(largeur) { return 8 + (largeur < 480 ? 2 : 1) * 15; }
