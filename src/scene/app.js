// Page d'accueil : le vélo en 3D, ses zones d'atelier, la fiche de l'atelier ouvert et la liste
// « Ce qui est approché ».
// Porté de l'interface de la maquette (docs/superpowers/specs/2026-10-20-maquette-velo-3d.html) : onglets de rendu,
// pastilles et puces, fiche, bouton de variante, boucle d'image, ResizeObserver et légende du mode simple.
//
// Chargement : le schéma 2D ne demande pas three.js et se dessine tout de suite. three.js, ses modules d'exemple et la
// scène arrivent ensuite par import() dynamique. Si l'un d'eux manque, ou si WebGL n'est pas là, la page passe au
// schéma 2D, grise les onglets 3D et le dit. La visionneuse des chapitres (viewer.js) démarre dans tous les cas : sans
// window.THREE, elle affiche son propre message.
//
// Ateliers : les section.atelier[data-zone] des chapitres, relevées au démarrage dans l'ordre du document.
// ouvrirZone(id) les liste dans la fiche et ouvre le premier ; ouvrirAtelier(id) déplace la section dans la fiche et
// laisse à sa place un renvoi. Une ancre #id d'atelier, au chargement ou par hashchange, ouvre cet atelier. Toute autre
// ancre garde le comportement du navigateur.
//
// Sans la 3D, la liste « Ce qui est approché » vient des META des pièces : scene.js se charge sans three.js. La note
// « Formes approchées » de la fiche n'apparaît pas : la zone d'une pièce se lit sur ses maillages, que seule la 3D
// construit.
//
// Importé sous Node (tests), le module ne démarre pas : seuls ses calculs servent.
import { GEO, points } from './geometrie.js';
import { dessinerSchema } from './schema2d.js';

// Les modules d'exemple de three.js que demande creerScene, avec le nom qu'ils exportent.
const ADDONS = Object.freeze([
  ['OrbitControls', 'three/addons/controls/OrbitControls.js'],
  ['RoundedBoxGeometry', 'three/addons/geometries/RoundedBoxGeometry.js'],
  ['HorizontalBlurShader', 'three/addons/shaders/HorizontalBlurShader.js'],
  ['VerticalBlurShader', 'three/addons/shaders/VerticalBlurShader.js'],
]);

const TEXTES = Object.freeze({
  aide3d: 'Un doigt pour tourner, deux pour zoomer.',
  aide2d: 'Vue côté transmission. En pointillés : les pièces du côté gauche. Touche une pastille pour zoomer.',
  echec: 'La 3D n’a pas pu se charger sur cet appareil. Le schéma 2D reste disponible.',
  aVenir: 'Atelier à venir.',
  renvoi: 'Atelier ouvert en haut de page',
  listeSans3d: 'La liste vient de la scène 3D, qui n’a pas pu se charger.',
});

/**
 * three.js et les quatre modules d'exemple de la scène, chargés ensemble.
 * @param {(nom: string) => Promise<object>} [importer] import() par défaut ; les tests en passent un faux.
 * @returns {Promise<{THREE: object, OrbitControls: Function, RoundedBoxGeometry: Function,
 *   HorizontalBlurShader: object, VerticalBlurShader: object}>} Rejetée dès qu'un module manque ou n'a pas son export.
 */
export async function chargerLibs(importer = nom => import(nom)) {
  const noms = ['three', ...ADDONS.map(([, chemin]) => chemin)];
  const [THREE, ...modules] = await Promise.all(noms.map(nom => importer(nom)));
  const libs = { THREE };
  ADDONS.forEach(([cle, chemin], i) => {
    if (!modules[i]?.[cle]) throw new Error(`${cle} absent de ${chemin}`);
    libs[cle] = modules[i][cle];
  });
  return libs;
}

/**
 * La note « Formes approchées » d'une zone : les notes `approche` des pièces dont les zones comprennent celle-ci.
 * @param {{piece: string, zones: string[], approche: string[]}[]} liste Le résultat de approximations().
 * @returns {{piece: string, notes: string[]}[]} Dans l'ordre de la liste, sans les pièces sans note.
 */
export function notesDeZone(liste, id) {
  return liste.filter(e => e.zones.includes(id) && e.approche.length)
    .map(e => ({ piece: e.piece, notes: [...e.approche] }));
}

/** La liste des approximations sans la scène : les META des pièces, sans zone, puis la géométrie. */
export function approximationsSansScene({ PIECES, listerApproximations }) {
  return listerApproximations(PIECES.map(m => ({ meta: m.META, zones: [] })));
}

/** L'identifiant d'une ancre (location.hash), décodé, ou null si elle est vide ou mal encodée. */
export function idDuHash(hash) {
  if (!hash || hash.length < 2) return null;
  try {
    return decodeURIComponent(hash.slice(1));
  } catch {
    return null;
  }
}

const reduit = () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

// ---- État de la page, posé par demarrer ----
let ui = null;
const etat = {
  mode: 'reel', // '2d' | 'simple' | 'reel'
  zone: null, // la zone ouverte
  atelier: null, // l'atelier déplacé dans la fiche
  vue2d: null, // la zone cadrée par le schéma, ou null pour tout le vélo
  scene: null, // l'interface de creerScene, une fois montée
  module: null, // scene.js une fois chargé : la liste de secours en vient
  echec: false, // la 3D n'a pas pu se monter
  variantes: {}, // par zone : l'indice du libellé affiché
};

const el = (tag, classe, texte) => {
  const e = document.createElement(tag);
  if (classe) e.className = classe;
  if (texte !== undefined) e.textContent = texte;
  return e;
};
const ulDe = items => {
  const ul = el('ul');
  ul.append(...items);
  return ul;
};
const zoneDe = id => ui.zones.find(z => z.id === id) ?? null;

/**
 * Ouvre une zone : pastille et puce actives, zone surlignée et visée, ses ateliers listés dans la fiche.
 * Le premier atelier s'ouvre, sauf si l'atelier déjà ouvert est de cette zone. Sans atelier, la fiche le dit.
 * @returns {boolean} false si la page n'a pas de scène ou si la zone est inconnue.
 */
export function ouvrirZone(id) {
  if (!ui || !zoneDe(id)) return false;
  choisirZone(id);
  const ateliers = ui.ateliers.get(id) ?? [];
  if (!ateliers.some(s => s.id === etat.atelier)) {
    if (ateliers.length) deplacer(ateliers[0]);
    else ranger();
  }
  rendreFiche();
  return true;
}

/**
 * Ouvre un atelier : sa section passe dans #fiche, un renvoi prend sa place dans le chapitre, sa zone s'ouvre.
 * @returns {boolean} false si `id` n'est pas un atelier d'une zone connue.
 */
export function ouvrirAtelier(id) {
  const s = ui?.parId.get(id);
  if (!s || !zoneDe(s.dataset.zone)) return false;
  if (etat.zone !== s.dataset.zone) choisirZone(s.dataset.zone);
  deplacer(s);
  rendreFiche();
  return true;
}

// L'atelier ouvert retourne dans son chapitre, à la place de son renvoi.
function ranger() {
  if (etat.atelier === null) return;
  ui.renvois.get(etat.atelier).replaceWith(ui.parId.get(etat.atelier));
  etat.atelier = null;
}

function deplacer(s) {
  if (etat.atelier === s.id) return;
  ranger();
  let renvoi = ui.renvois.get(s.id);
  if (!renvoi) {
    renvoi = el('p', 'muted');
    const a = el('a', null, TEXTES.renvoi);
    a.href = '#fiche';
    renvoi.append(a);
    ui.renvois.set(s.id, renvoi);
  }
  s.before(renvoi);
  preparerFiche();
  ui.f.atelier.append(s);
  etat.atelier = s.id;
}

function choisirZone(id) {
  etat.zone = id;
  etat.vue2d = id;
  ui.zones.forEach((z, i) => {
    const on = z.id === id;
    ui.pins[i].classList.toggle('on', on);
    ui.pins[i].setAttribute('aria-pressed', String(on));
    ui.puces[i].setAttribute('aria-pressed', String(on));
    if (on) montrerPuce(ui.puces[i]);
  });
  ui.schema.surligner(id);
  if (etat.mode === '2d') ui.schema.cadrer(id);
  if (etat.scene) {
    etat.scene.surligner(id);
    etat.scene.viser(id);
  }
}

// Fait défiler la rangée de puces, et elle seule, jusqu'à la puce.
function montrerPuce(b) {
  const rb = b.getBoundingClientRect(), rc = ui.rangee.getBoundingClientRect();
  if (rb.left >= rc.left && rb.right <= rc.right) return;
  ui.rangee.scrollBy({ left: rb.left - rc.left - 16, behavior: reduit() ? 'auto' : 'smooth' });
}

// ---- Fiche ----

// Les emplacements de la fiche, créés à la première ouverture à la place de la phrase d'accueil.
function preparerFiche() {
  if (ui.f) return;
  const tete = el('div', 'fiche-tete');
  tete.setAttribute('aria-live', 'polite');
  const num = el('span', 'num');
  num.setAttribute('aria-hidden', 'true');
  const titre = el('h2');
  titre.id = 'fiche-titre';
  const titres = el('div');
  titres.append(el('p', 'eyebrow', 'Zone du vélo'), titre);
  tete.append(num, titres);
  const swap = el('div', 'swap');
  swap.setAttribute('role', 'group');
  swap.setAttribute('aria-label', 'Pièce affichée sur le vélo');
  const liste = el('ul', 'fiche-ateliers');
  liste.setAttribute('aria-label', 'Ateliers de la zone');
  const atelier = el('div', 'fiche-atelier');
  const vide = el('p', 'muted', TEXTES.aVenir);
  const approche = el('details', 'fiche-approche');
  approche.append(el('summary'), el('div'));
  ui.fiche.replaceChildren(tete, swap, liste, atelier, vide, approche);
  ui.fiche.setAttribute('aria-labelledby', 'fiche-titre');
  ui.f = { num, titre, swap, liste, atelier, vide, approche };
}

function rendreFiche() {
  if (etat.zone === null) return;
  preparerFiche();
  const z = zoneDe(etat.zone), f = ui.f, ateliers = ui.ateliers.get(z.id) ?? [];
  f.num.textContent = String(ui.zones.indexOf(z) + 1);
  f.titre.textContent = z.nom;
  f.liste.replaceChildren(...(ateliers.length > 1 ? ateliers.map(s => {
    const b = el('button', null, s.querySelector('h3')?.textContent.trim() || s.id);
    b.type = 'button';
    b.setAttribute('aria-pressed', String(s.id === etat.atelier));
    b.addEventListener('click', () => ouvrirAtelier(s.id));
    const li = el('li');
    li.append(b);
    return li;
  }) : []));
  f.liste.hidden = ateliers.length < 2;
  f.vide.hidden = ateliers.length > 0;
  rendreVariante();
  rendreNoteApproche();
}

// Le bouton de variante : seulement en 3D, seulement si la zone en a une dans zones.json.
function rendreVariante() {
  if (!ui.f) return;
  const z = zoneDe(etat.zone), swap = ui.f.swap;
  const montrer = Boolean(z?.variante && etat.scene && etat.mode !== '2d');
  swap.hidden = !montrer;
  if (!montrer) return;
  const k = etat.variantes[z.id] ?? 0;
  swap.replaceChildren(...z.variante.libelles.map((texte, j) => {
    const b = el('button', null, texte);
    b.type = 'button';
    b.setAttribute('aria-pressed', String(j === k));
    b.addEventListener('click', () => {
      etat.variantes[z.id] = j;
      etat.scene.variante(z.id, j);
      rendreVariante();
    });
    return b;
  }));
}

// « Formes approchées : … », d'après les pièces de la zone. Sans la scène, les zones des pièces ne sont pas connues.
function rendreNoteApproche() {
  const d = ui.f.approche;
  const notes = etat.scene ? notesDeZone(etat.scene.approximations(), etat.zone) : [];
  d.hidden = notes.length === 0;
  if (!notes.length) return;
  const [resume, corps] = d.children;
  resume.textContent = 'Formes approchées : ' + notes.map(n => n.piece).join(' ; ');
  corps.replaceChildren(...notes.flatMap(n => [el('p', null, n.piece), ulDe(n.notes.map(t => el('li', null, t)))]));
}

// ---- Liste « Ce qui est approché » ----

function remplirListe(entrees) {
  if (!entrees) {
    ui.contenu.replaceChildren(el('p', 'muted', TEXTES.listeSans3d));
    return;
  }
  ui.contenu.replaceChildren(...entrees.map(e => {
    const s = el('section', 'appr');
    s.append(el('h3', null, e.piece));
    const bloc = (titre, items) => { if (items.length) s.append(el('h4', null, titre), ulDe(items)); };
    bloc('Documents', e.sources.map(src => {
      const a = el('a', null, src.titre);
      a.href = src.url;
      a.target = '_blank';
      a.rel = 'noopener';
      const li = el('li');
      li.append(a);
      return li;
    }));
    bloc('Formes approchées', e.approche.map(t => el('li', null, t)));
    bloc('À vérifier à la livraison', e.aVerifier.map(t => el('li', null, t)));
    return s;
  }));
}

async function ouvrirListe() {
  let entrees = null;
  if (etat.scene) entrees = etat.scene.approximations();
  else {
    const m = etat.module ?? await ui.moduleScene;
    if (m) entrees = approximationsSansScene(m);
  }
  remplirListe(entrees);
  const d = ui.dialogue;
  if (d.open) return;
  if (typeof d.showModal === 'function') d.showModal();
  else d.setAttribute('open', '');
}

// ---- Rendu, pastilles et boucle d'image ----

function choisirMode(m) {
  if (m !== '2d' && etat.echec) return;
  etat.mode = m;
  ui.onglets.forEach(b => {
    const on = b.dataset.mode === m;
    b.setAttribute('aria-selected', String(on));
    b.tabIndex = on ? 0 : -1;
  });
  ui.stage.setAttribute('aria-labelledby', 'mode-' + m);
  ui.svg.toggleAttribute('hidden', m !== '2d'); // un élément SVG n'a pas la propriété hidden des éléments HTML
  ui.canvas.hidden = m === '2d';
  ui.stage.classList.toggle('studio', m === 'reel');
  ui.legende.hidden = m !== 'simple';
  ui.aide.textContent = m === '2d' ? TEXTES.aide2d : TEXTES.aide3d;
  ui.statut.hidden = m === '2d' || etat.scene !== null || etat.echec;
  if (m === '2d') {
    ui.schema.cadrer(etat.vue2d); // le SVG vient d'apparaître : son cadre prend maintenant le rapport de l'image
    ui.vbPose = null;
  } else if (etat.scene) etat.scene.rendu(m);
  rendreVariante();
  placerPastilles();
}

function poserPastilles(places) {
  places.forEach((q, i) => {
    const b = ui.pins[i];
    b.hidden = !q.visible;
    b.style.transform = `translate(${q.x.toFixed(1)}px, ${q.y.toFixed(1)}px)`;
  });
}

function placerPastilles() {
  if (etat.mode === '2d') poserPastilles(ui.schema.pastilles(ui.W, ui.H));
  else if (etat.scene) poserPastilles(etat.scene.pastilles());
  else ui.pins.forEach(b => { b.hidden = true; });
}

// Une image à chaque trame tant que la scène est à l'écran. En 3D, les pastilles suivent chaque image dessinée ;
// en 2D, chaque changement du cadre du SVG, que le cadrage anime.
function demander() {
  if (ui.visible && !ui.boucle) ui.boucle = requestAnimationFrame(tour);
}

function tour(now) {
  ui.boucle = 0;
  if (etat.mode === '2d') {
    const vb = ui.svg.getAttribute('viewBox');
    if (vb !== ui.vbPose) {
      ui.vbPose = vb;
      placerPastilles();
    }
  } else if (etat.scene?.image(now)) placerPastilles();
  demander();
}

function mesurer() {
  ui.W = Math.max(1, ui.stage.clientWidth);
  ui.H = Math.max(1, ui.stage.clientHeight);
  etat.scene?.redimensionner(ui.W, ui.H);
  if (etat.mode === '2d') ui.schema.cadrer(etat.vue2d);
  placerPastilles();
}

// ---- Montage de la 3D ----

function webglPossible() {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

function demarrerVisionneuse() {
  try {
    window.AtelierViewer?.start();
  } catch (e) {
    console.warn('Visionneuse des chapitres :', e);
  }
}

async function monter3D() {
  const module = await ui.moduleScene;
  let libs = null;
  try {
    libs = await chargerLibs();
    window.THREE = libs.THREE;
  } catch (e) {
    console.warn('three.js indisponible :', e.message);
  }
  demarrerVisionneuse();
  etat.module = module;
  if (!module || !libs) return echec3D();
  if (!webglPossible()) return echec3D('WebGL absent');
  try {
    const s = module.creerScene(libs, ui.canvas, ui.zones);
    s.redimensionner(ui.W, ui.H);
    s.rendu(etat.mode === '2d' ? 'reel' : etat.mode);
    s.surligner(etat.zone);
    if (etat.zone) s.viser(etat.zone);
    else s.ensemble(); // recadre au rapport de l'image, que le canevas n'avait pas s'il était caché
    etat.scene = s;
  } catch (e) {
    return echec3D(e);
  }
  choisirMode(etat.mode);
  rendreFiche();
}

function echec3D(raison) {
  if (raison) console.warn('Scène 3D indisponible :', raison instanceof Error ? raison.message : raison);
  etat.echec = true;
  ui.onglets.forEach(b => { if (b.dataset.mode !== '2d') b.disabled = true; });
  ui.alerte.textContent = TEXTES.echec;
  ui.alerte.hidden = false;
  choisirMode('2d');
}

// ---- Démarrage ----

function suivreAncre(comportement) {
  const id = idDuHash(location.hash);
  if (!id || !ouvrirAtelier(id)) return;
  ui.parId.get(id).scrollIntoView({ block: 'start', behavior: reduit() ? 'auto' : comportement });
}

function demarrer() {
  const $ = s => document.querySelector(s);
  const donnees = $('#zones-data');
  if (!$('#scene') || !donnees) {
    // Page sans scène : seules les figures des chapitres démarrent, avec three.js s'il se charge.
    chargerLibs().then(libs => { window.THREE = libs.THREE; }, () => {}).then(demarrerVisionneuse);
    return;
  }
  const zones = JSON.parse(donnees.textContent);
  const sections = [...document.querySelectorAll('section.atelier[data-zone]')].filter(s => s.id);
  const ateliers = new Map();
  for (const s of sections) {
    if (!ateliers.has(s.dataset.zone)) ateliers.set(s.dataset.zone, []);
    ateliers.get(s.dataset.zone).push(s);
  }
  ui = {
    zones, ateliers, parId: new Map(sections.map(s => [s.id, s])), renvois: new Map(), f: null,
    stage: $('#scene-stage'), svg: $('#plan'), canvas: $('#gl'), fiche: $('#fiche'), rangee: $('#chips'),
    aide: $('#scene-aide'), legende: $('#key'), statut: $('#scene-statut'), alerte: $('#scene-alerte'),
    dialogue: $('#approche-liste'), contenu: $('#approche-contenu'),
    onglets: [...document.querySelectorAll('#scene .modes [role="tab"]')],
    pins: [], puces: [], W: 1, H: 1, visible: true, boucle: 0, vbPose: null,
    moduleScene: import('./scene.js').catch(e => {
      console.warn('scene.js indisponible :', e.message);
      return null;
    }),
  };
  ui.schema = dessinerSchema(ui.svg, points(GEO), zones);

  zones.forEach((z, i) => {
    const pin = el('button', 'zpin', String(i + 1));
    pin.type = 'button';
    pin.hidden = true;
    pin.setAttribute('aria-label', z.nom);
    pin.setAttribute('aria-pressed', 'false');
    pin.addEventListener('click', () => ouvrirZone(z.id));
    $('#pins').append(pin);
    const puce = el('button');
    puce.type = 'button';
    puce.setAttribute('aria-pressed', 'false');
    puce.append(el('span', null, String(i + 1)), z.nom);
    puce.addEventListener('click', () => ouvrirZone(z.id));
    ui.rangee.append(puce);
    ui.pins.push(pin);
    ui.puces.push(puce);
  });

  ui.onglets.forEach(b => b.addEventListener('click', () => choisirMode(b.dataset.mode)));
  $('#scene .modes').addEventListener('keydown', e => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const actifs = ui.onglets.filter(b => !b.disabled), i = actifs.indexOf(document.activeElement);
    if (i < 0) return;
    const b = actifs[(i + (e.key === 'ArrowRight' ? 1 : actifs.length - 1)) % actifs.length];
    e.preventDefault();
    b.focus();
    choisirMode(b.dataset.mode);
  });
  $('#vue-ensemble').addEventListener('click', () => {
    if (etat.mode !== '2d') etat.scene?.ensemble();
    else {
      etat.vue2d = null;
      ui.schema.cadrer(null);
    }
  });
  $('#approche').addEventListener('click', ouvrirListe);
  ui.dialogue.addEventListener('click', e => { if (e.target === ui.dialogue) ui.dialogue.close(); });

  if ('ResizeObserver' in window) new ResizeObserver(mesurer).observe(ui.stage);
  else window.addEventListener('resize', mesurer);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(es => {
      ui.visible = es.some(e => e.isIntersecting);
      demander();
    }).observe(ui.stage);
  }
  mesurer();
  choisirMode(etat.mode);
  demander();
  window.addEventListener('hashchange', () => suivreAncre('smooth'));
  suivreAncre('auto');
  monter3D();
}

if (typeof document !== 'undefined') demarrer();
