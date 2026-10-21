// Page d'accueil : le vélo en 3D, ses zones d'atelier, la fiche de l'atelier ouvert et la liste
// « Ce qui est approché ».
// Porté de l'interface de la maquette (docs/superpowers/specs/2026-10-20-maquette-velo-3d.html) : onglets de rendu,
// pastilles et puces, fiche, bouton de variante, boucle d'image, ResizeObserver et légende du mode simple.
//
// Chargement : app.js n'a aucun import statique, pour démarrer même si un module de la scène manque. Il pose
// data-app sur <html> dès son démarrage : sans lui, le garde-fou de 99-foot.html dit que la page n'a pas pu se charger.
// Le schéma 2D (geometrie.js, schema2d.js et les pièces qu'il lit) arrive par import() dynamique, comme three.js, ses
// modules d'exemple et la scène. Si la 3D manque, ou si WebGL n'est pas là, la page passe au schéma 2D, grise les
// onglets 3D et le dit. Si le schéma manque aussi, la page le dit et retire la scène vide : les puces ouvrent toujours
// les ateliers. La visionneuse des chapitres (viewer.js) démarre dans tous les cas : sans window.THREE, elle affiche
// son propre message.
//
// Ateliers : les section.atelier[data-zone] des chapitres, relevées au démarrage dans l'ordre du document.
// ouvrirZone(id) les liste dans la fiche et ouvre le premier ; ouvrirAtelier(id) déplace la section dans la fiche et
// laisse à sa place un renvoi. La tête de la fiche dit la pièce d'origine et la pièce à monter (data-de, data-vers).
//
// Adresse et historique : l'atelier ouvert est dans l'ancre de l'adresse. Une pastille, une puce ou un bouton de la
// liste la remplace (history.replaceState) ; un lien du texte vers un atelier ouvre l'atelier dans la fiche et ajoute
// une entrée (history.pushState), sans passer par le saut d'ancre du navigateur. Retour et Suivant (popstate) rouvrent
// l'atelier de l'entrée, puis le navigateur rend la position de lecture de cette entrée. Au chargement, ou par
// hashchange, une ancre d'atelier ouvre cet atelier. Toute autre ancre garde le comportement du navigateur.
//
// Sans la 3D, la liste « Ce qui est approché » vient des META des pièces : scene.js se charge sans three.js. La note
// « Formes approchées » de la fiche n'apparaît pas : la zone d'une pièce se lit sur ses maillages, que seule la 3D
// construit.
//
// Importé sous Node (tests), le module ne démarre pas : seuls ses calculs servent.
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
  echecTout: 'Ni la 3D ni le schéma 2D n’ont pu se charger. Les zones ci-dessous ouvrent quand même leurs ateliers.',
  aVenir: 'Atelier à venir.',
  renvoi: 'Atelier ouvert en haut de page',
  listeSans3d: 'La liste vient de la scène 3D, qui n’a pas pu se charger.',
  listeAbsente: 'La liste n’a pas pu se charger. Elle est aussi sur la page « Ce qui est approché ».',
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

/** L'ancre d'un atelier dans l'adresse, encodée comme idDuHash la décode. */
export const ancreDe = id => '#' + encodeURIComponent(id);

/**
 * L'atelier visé par un clic, ou null pour laisser faire le navigateur : un clic simple (bouton principal, sans
 * touche de modification, pas déjà traité) sur un lien interne #id, ouvert dans cette page, dont l'id est un atelier.
 * @param {MouseEvent} e Le clic. @param {(id: string) => boolean} estAtelier
 */
export function atelierDuClic(e, estAtelier) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return null;
  const a = e.target?.closest?.('a[href^="#"]');
  if (!a || (a.target && a.target !== '_self')) return null;
  const id = idDuHash(a.getAttribute('href'));
  return id && estAtelier(id) ? id : null;
}

/**
 * L'atelier qu'une entrée d'historique demande quand Retour ou Suivant y revient : celui de son ancre ; sinon celui
 * que la page y a noté avant de suivre un lien (null : aucun atelier ouvert) ; sinon undefined, pour une entrée que la
 * page n'a pas écrite (une ancre de chapitre, par exemple) : rien ne change.
 * @param {string} hash location.hash. @param {*} etatEntree history.state. @param {(id: string) => boolean} estAtelier
 * @returns {string | null | undefined}
 */
export function atelierDeLEntree(hash, etatEntree, estAtelier) {
  const id = idDuHash(hash);
  if (id && estAtelier(id)) return id;
  if (etatEntree && typeof etatEntree === 'object' && 'atelier' in etatEntree) return etatEntree.atelier ?? null;
  return undefined;
}

/** Les deux lignes de la tête de fiche pour un atelier qui remplace une pièce : rien s'il manque data-de ou data-vers. */
export function lignesPieces(donnees) {
  return donnees?.de && donnees?.vers ? [`D’origine : ${donnees.de}`, `À monter : ${donnees.vers}`] : [];
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
  sansRendu: false, // ni la 3D ni le schéma 2D
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
const estAtelier = id => Boolean(ui?.parId.has(id) && zoneDe(ui.parId.get(id).dataset.zone));

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
  ui.schema?.surligner(id);
  if (etat.mode === '2d') ui.schema?.cadrer(id);
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
  const pieces = el('div', 'fiche-pieces');
  titres.append(el('p', 'eyebrow', 'Zone du vélo'), titre, pieces);
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
  ui.f = { num, titre, pieces, swap, liste, atelier, vide, approche };
}

function rendreFiche() {
  if (etat.zone === null) return;
  preparerFiche();
  const z = zoneDe(etat.zone), f = ui.f, ateliers = ui.ateliers.get(z.id) ?? [];
  f.num.textContent = String(ui.zones.indexOf(z) + 1);
  f.titre.textContent = z.nom;
  const lignes = lignesPieces(etat.atelier ? ui.parId.get(etat.atelier).dataset : null);
  f.pieces.replaceChildren(...lignes.map(texte => el('p', null, texte)));
  f.pieces.hidden = lignes.length === 0;
  f.liste.replaceChildren(...(ateliers.length > 1 ? ateliers.map(s => {
    const b = el('button', null, s.querySelector('h3')?.textContent.trim() || s.id);
    b.type = 'button';
    b.setAttribute('aria-pressed', String(s.id === etat.atelier));
    b.addEventListener('click', () => { if (ouvrirAtelier(s.id)) noterAtelier(); });
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

// La liste elle-même vient de liste-approche.js, que la page « Ce qui est approché » partage.
async function remplirListe(entrees) {
  if (!entrees) {
    ui.contenu.replaceChildren(el('p', 'muted', TEXTES.listeSans3d));
    return;
  }
  try {
    const { listeApproche } = await import('./liste-approche.js');
    ui.contenu.replaceChildren(listeApproche(document, entrees));
  } catch (e) {
    console.warn('liste-approche.js indisponible :', e.message);
    ui.contenu.replaceChildren(el('p', 'muted', TEXTES.listeAbsente));
  }
}

async function ouvrirListe() {
  let entrees = null;
  if (etat.scene) entrees = etat.scene.approximations();
  else {
    const m = etat.module ?? await ui.moduleScene;
    if (m) entrees = approximationsSansScene(m);
  }
  await remplirListe(entrees);
  const d = ui.dialogue;
  if (d.open) return;
  if (typeof d.showModal === 'function') d.showModal();
  else d.setAttribute('open', '');
}

// ---- Rendu, pastilles et boucle d'image ----

function choisirMode(m) {
  if (etat.sansRendu || (m !== '2d' && etat.echec)) return;
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
    ui.schema?.cadrer(etat.vue2d); // le SVG vient d'apparaître : son cadre prend maintenant le rapport de l'image
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
  if (etat.mode === '2d' && ui.schema) poserPastilles(ui.schema.pastilles(ui.W, ui.H));
  else if (etat.mode !== '2d' && etat.scene) poserPastilles(etat.scene.pastilles());
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
  } else if (etat.scene?.image(now)) {
    placerPastilles();
    noterTriangles();
  }
  demander();
}

// Les triangles de la dernière image, posés sur <html data-triangles> pour tools/scene-check.js. Rien ne s'affiche.
function noterTriangles() {
  const n = String(etat.scene.triangles());
  if (document.documentElement.dataset.triangles !== n) document.documentElement.dataset.triangles = n;
}

function mesurer() {
  ui.W = Math.max(1, ui.stage.clientWidth);
  ui.H = Math.max(1, ui.stage.clientHeight);
  etat.scene?.redimensionner(ui.W, ui.H);
  if (etat.mode === '2d') ui.schema?.cadrer(etat.vue2d);
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

// Le schéma 2D, dessiné dès que ses modules arrivent. null s'il en manque un : l'onglet « Schéma 2D » se grise.
async function chargerSchema() {
  try {
    const [{ GEO, points }, { dessinerSchema }] = await Promise.all([import('./geometrie.js'), import('./schema2d.js')]);
    const schema = dessinerSchema(ui.svg, points(GEO), ui.zones);
    ui.schema = schema;
    schema.surligner(etat.zone);
    if (etat.mode === '2d') schema.cadrer(etat.vue2d);
    placerPastilles();
    return schema;
  } catch (e) {
    console.warn('Schéma 2D indisponible :', e.message);
    ui.onglets.forEach(b => { if (b.dataset.mode === '2d') b.disabled = true; });
    return null;
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
  if (!module || !libs) return echec3D(null, await ui.moduleSchema);
  if (!webglPossible()) return echec3D('WebGL absent', await ui.moduleSchema);
  try {
    const s = module.creerScene(libs, ui.canvas, ui.zones);
    s.redimensionner(ui.W, ui.H);
    s.rendu(etat.mode === '2d' ? 'reel' : etat.mode);
    s.surligner(etat.zone);
    if (etat.zone) s.viser(etat.zone);
    else s.ensemble(); // recadre au rapport de l'image, que le canevas n'avait pas s'il était caché
    etat.scene = s;
  } catch (e) {
    return echec3D(e, await ui.moduleSchema);
  }
  choisirMode(etat.mode);
  rendreFiche();
}

// Sans 3D : le schéma 2D prend le relais. Sans schéma non plus, la page le dit et retire la scène vide.
function echec3D(raison, schema) {
  if (raison) console.warn('Scène 3D indisponible :', raison instanceof Error ? raison.message : raison);
  etat.echec = true;
  ui.onglets.forEach(b => { if (b.dataset.mode !== '2d' || !schema) b.disabled = true; });
  ui.alerte.hidden = false;
  if (schema) {
    ui.alerte.textContent = TEXTES.echec;
    choisirMode('2d');
    return;
  }
  etat.sansRendu = true;
  ui.alerte.textContent = TEXTES.echecTout;
  ui.statut.hidden = true;
  ui.pins.forEach(b => { b.hidden = true; });
  document.getElementById('scene').classList.add('sans-rendu');
}

// ---- Adresse et historique ----

// Les appels à history sont protégés : une page servie dans un cadre qui les refuse ouvre quand même ses ateliers.
function historique(methode, ...args) {
  try {
    history[methode](...args);
  } catch (e) {
    console.warn('Historique indisponible :', e.message);
  }
}

// L'atelier ouvert par une pastille, une puce ou la liste remplace l'ancre de l'entrée courante.
function noterAtelier() {
  if (etat.atelier && location.hash !== ancreDe(etat.atelier)) {
    historique('replaceState', { atelier: etat.atelier }, '', ancreDe(etat.atelier));
  }
}

// Un lien du texte vers un atelier : l'entrée courante garde l'atelier qu'elle montrait, une entrée neuve porte
// l'atelier du lien, puis la page défile jusqu'à lui.
function suivreLien(id) {
  if (location.hash !== ancreDe(id)) {
    const courant = history.state && typeof history.state === 'object' ? history.state : {};
    historique('replaceState', { ...courant, atelier: etat.atelier }, '');
    historique('pushState', { atelier: id }, '', ancreDe(id));
  }
  if (ouvrirAtelier(id)) defilerVers(id, 'smooth');
}

// Retour ou Suivant : l'atelier de l'entrée revient dans la fiche avant que le navigateur rende sa position de lecture.
function revenir() {
  const id = atelierDeLEntree(location.hash, history.state, estAtelier);
  if (id === undefined || id === etat.atelier) return;
  if (id === null) {
    ranger();
    rendreFiche();
  } else ouvrirAtelier(id);
}

function defilerVers(id, comportement) {
  ui.parId.get(id).scrollIntoView({ block: 'start', behavior: reduit() ? 'auto' : comportement });
}

// ---- Démarrage ----

// Une ancre d'atelier au chargement ou par hashchange : l'atelier s'ouvre et la page défile jusqu'à lui. Déjà ouvert
// (Retour l'a rouvert juste avant), il ne bouge pas : le navigateur rend la position de lecture.
// @returns {string | null} l'atelier ouvert ici.
function suivreAncre(comportement) {
  const id = idDuHash(location.hash);
  if (!id || id === etat.atelier || !ouvrirAtelier(id)) return null;
  defilerVers(id, comportement);
  return id;
}

// Au chargement sur l'ancre d'un atelier, la page défile tout de suite jusqu'à lui. Ce qui se monte ensuite au-dessus
// (bouton de variante de la 3D, message d'échec) le pousserait vers le bas, sur un navigateur sans ancrage du
// défilement : une fois la 3D montée ou en échec, la page revise l'atelier, sauf si on a touché, fait défiler à la
// main ou tapé quelque chose entre-temps.
function garderAncre(id, montage) {
  let touche = false;
  const noter = () => { touche = true; };
  const types = ['pointerdown', 'wheel', 'touchstart', 'keydown'];
  types.forEach(t => window.addEventListener(t, noter, { capture: true, passive: true }));
  montage.finally(() => {
    types.forEach(t => window.removeEventListener(t, noter, { capture: true }));
    if (!touche && etat.atelier === id) defilerVers(id, 'auto');
  });
}

function demarrer() {
  document.documentElement.dataset.app = 'demarre'; // lu par le garde-fou de 99-foot.html
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
    pins: [], puces: [], W: 1, H: 1, visible: true, boucle: 0, vbPose: null, schema: null,
    moduleScene: import('./scene.js').catch(e => {
      console.warn('scene.js indisponible :', e.message);
      return null;
    }),
  };
  ui.moduleSchema = chargerSchema();

  zones.forEach((z, i) => {
    const pin = el('button', 'zpin', String(i + 1));
    pin.type = 'button';
    pin.hidden = true;
    pin.setAttribute('aria-label', z.nom);
    pin.setAttribute('aria-pressed', 'false');
    pin.addEventListener('click', () => { if (ouvrirZone(z.id)) noterAtelier(); });
    $('#pins').append(pin);
    const puce = el('button');
    puce.type = 'button';
    puce.setAttribute('aria-pressed', 'false');
    puce.append(el('span', null, String(i + 1)), z.nom);
    puce.addEventListener('click', () => { if (ouvrirZone(z.id)) noterAtelier(); });
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
      ui.schema?.cadrer(null);
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
  document.addEventListener('click', e => {
    const id = atelierDuClic(e, estAtelier);
    if (!id) return;
    e.preventDefault();
    suivreLien(id);
  });
  window.addEventListener('popstate', revenir);
  window.addEventListener('hashchange', () => suivreAncre('smooth'));
  const ancre = suivreAncre('auto');
  const montage = monter3D();
  if (ancre) garderAncre(ancre, montage);
}

if (typeof document !== 'undefined') demarrer();
