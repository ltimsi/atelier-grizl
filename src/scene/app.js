// Page d'accueil « Mon vélo » : le vélo en 3D, ses pastilles, le schéma 2D de secours, la variante de la zone choisie
// et la liste « Ce qui est approché ». Sur les pages d'atelier, seulement three.js et la visionneuse des pièces.
// Porté de l'interface de la maquette (docs/superpowers/specs/2026-10-20-maquette-velo-3d.html) : onglets de rendu,
// pastilles, bouton de variante, boucle d'image, ResizeObserver et légende du mode simple.
//
// Chargement : app.js n'a aucun import statique, pour démarrer même si un module de la scène manque. Il pose
// data-app sur <html> dès son démarrage : sans lui, le garde-fou de 99-foot.html prend le relais (à l'accueil, il dit
// que la page n'a pas pu se charger ; sur un atelier, il lance la visionneuse, qui dit que la 3D manque).
// Le schéma 2D (geometrie.js, schema2d.js et les pièces qu'il lit) arrive par import() dynamique, comme three.js, ses
// modules d'exemple et la scène. Si la 3D manque, ou si WebGL n'est pas là, la page passe au schéma 2D, grise les
// onglets 3D et le dit. Si le schéma manque aussi, la page le dit et retire la scène vide. La visionneuse des
// chapitres (viewer.js) démarre dans tous les cas : sans window.THREE, elle affiche son propre message.
//
// Zones : « Où intervenir » (div.zone-carte[data-zone], écrit par build/pages.py) a une carte par zone de zones.json.
// Une pastille ou le bouton d'une carte (button.zone-btn) appelle choisirZone : la pastille et la carte deviennent
// actives, la 3D surligne la zone et la vise, le schéma 2D la cadre, et la variante de la zone s'affiche dans
// l'image. Les liens des cartes mènent aux pages des ateliers, sans JavaScript : sans app.js, ils marchent encore.
// Pastilles : chacune est posée sur la projection de l'ancre de sa zone, en 3D (scene.pastilles) comme en 2D
// (schema.pastilles). Une zone peut avoir un champ decalage, [dx, dy] en pixels de l'écran : sa pastille est posée à ce
// décalage de son ancre, à toutes les largeurs (placeDePastille). Celle des axes a [0, 34] : elle est juste sous la tête
// de l'axe avant, parce que la pastille de l'étrier se projette juste au-dessus du moyeu.
// Défilement après le choix (montrerChoix) : sur deux colonnes, la carte vient à l'écran si elle n'y est pas. Sur une
// seule, la scène est au-dessus des cartes : une pastille ne fait pas défiler la page, pour garder le vélo à l'écran,
// et le bouton d'une carte ramène l'image.
//
// Sans la 3D, la liste « Ce qui est approché » vient des META des pièces : scene.js se charge sans three.js.
//
// Importé sous Node sans document, le module ne démarre pas : seuls ses calculs servent. tests/js/app.test.mjs le
// démarre aussi sur une page factice pour suivre choisirZone et les défilements.
// Les modules d'exemple de three.js que demande creerScene, avec le nom qu'ils exportent.
const ADDONS = Object.freeze([
  ['OrbitControls', 'three/addons/controls/OrbitControls.js'],
  ['RoundedBoxGeometry', 'three/addons/geometries/RoundedBoxGeometry.js'],
  ['HorizontalBlurShader', 'three/addons/shaders/HorizontalBlurShader.js'],
  ['VerticalBlurShader', 'three/addons/shaders/VerticalBlurShader.js'],
]);

const TEXTES = Object.freeze({
  aide3d: 'Un doigt pour tourner, deux pour zoomer.',
  // Une ligne sur un écran de 360 px, comme l'aide de la 3D. La vue côté transmission et les pointillés du côté gauche
  // sont dits sous l'image, par la légende #legende-2d que montre le mode 2D.
  aide2d: 'Touche une pastille pour zoomer.',
  echec: 'La 3D n’a pas pu se charger sur cet appareil. Le schéma 2D reste disponible.',
  echecTout: 'Ni la 3D ni le schéma 2D n’ont pu se charger. Les ateliers restent accessibles par le menu et par ' +
    '« Où intervenir ».',
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

/** La liste des approximations sans la scène : les META des pièces, sans zone, puis la géométrie. */
export function approximationsSansScene({ PIECES, listerApproximations }) {
  return listerApproximations(PIECES.map(m => ({ meta: m.META, zones: [] })));
}

const reduit = () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
// Une seule colonne : la requête de la règle « Une seule colonne sous 1100 px » de 00-head.html, à l'identique
// (tests/js/app.test.mjs le vérifie).
const UNE_COLONNE = '(max-width:1100px)';
const uneColonne = () => globalThis.matchMedia?.(UNE_COLONNE).matches === true;

// ---- État de la page, posé par demarrer ----
let ui = null;
const etat = {
  mode: 'reel', // '2d' | 'simple' | 'reel'
  zone: null, // la zone choisie
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
const zoneDe = id => ui.zones.find(z => z.id === id) ?? null;

/**
 * Choisit une zone : sa pastille et sa carte de « Où intervenir » deviennent actives, la 3D la surligne et la vise,
 * le schéma 2D la surligne et la cadre, et sa variante s'affiche dans l'image. Ne fait pas défiler la page : les
 * pastilles et les boutons des cartes s'en chargent (montrerChoix).
 * @param {string} id L'id d'une zone de zones.json.
 * @returns {boolean} false si la page n'a pas de scène ou si la zone est inconnue.
 */
export function choisirZone(id) {
  if (!ui || !zoneDe(id)) return false;
  etat.zone = id;
  etat.vue2d = id;
  ui.zones.forEach((z, i) => {
    const on = z.id === id;
    ui.pins[i].classList.toggle('on', on);
    ui.pins[i].setAttribute('aria-pressed', String(on));
  });
  for (const carte of ui.cartes) {
    if (carte.dataset.zone === id) carte.setAttribute('aria-current', 'true');
    else carte.removeAttribute('aria-current');
  }
  for (const b of ui.boutons) b.setAttribute('aria-pressed', String(b.dataset.zone === id));
  ui.schema?.surligner(id);
  if (etat.mode === '2d') ui.schema?.cadrer(id);
  if (etat.scene) {
    etat.scene.surligner(id);
    etat.scene.viser(id);
  }
  rendreVariante();
  return true;
}

// Choisit la zone, puis fait défiler la page. Deux colonnes : la carte de la zone vient à l'écran si elle n'y est pas
// en entier, après une pastille comme après un bouton. Une seule colonne : la scène est au-dessus des cartes ; une
// pastille ne fait pas défiler la page, pour garder le vélo à l'écran, et le bouton d'une carte (`depuisCarte`)
// ramène l'image, son haut sous la barre.
function montrerChoix(id, depuisCarte) {
  if (!choisirZone(id)) return;
  if (!uneColonne()) montrer(ui.cartes.find(c => c.dataset.zone === id), 'nearest');
  else if (depuisCarte) montrer(ui.stage, 'start');
}

// Fait défiler la page jusqu'à l'élément, seulement s'il n'est pas en entier entre la barre du haut et le bas de
// l'écran. scroll-padding-top (00-head.html) le garde sous la barre. Doux, sauf si l'appareil demande moins de
// mouvement.
function montrer(e, bloc) {
  if (!e) return;
  const r = e.getBoundingClientRect();
  const haut = document.querySelector('.top')?.getBoundingClientRect().bottom ?? 0;
  if (r.top >= haut && r.bottom <= window.innerHeight) return;
  e.scrollIntoView({ block: bloc, behavior: reduit() ? 'auto' : 'smooth' });
}

// Les boutons de la variante, dans l'image : seulement en 3D, seulement si la zone en a une dans zones.json.
function rendreVariante() {
  const z = zoneDe(etat.zone), swap = ui.variante;
  if (!swap) return;
  const montrer = Boolean(z?.variante && etat.scene && etat.mode !== '2d');
  swap.hidden = !montrer;
  if (!montrer) {
    swap.replaceChildren();
    return;
  }
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
  if (ui.legende2d) ui.legende2d.hidden = m !== '2d';
  ui.aide.textContent = m === '2d' ? TEXTES.aide2d : TEXTES.aide3d;
  ui.statut.hidden = m === '2d' || etat.scene !== null || etat.echec;
  if (m === '2d') {
    ui.schema?.cadrer(etat.vue2d); // le SVG vient d'apparaître : son cadre prend maintenant le rapport de l'image
    ui.vbPose = null;
  } else if (etat.scene) etat.scene.rendu(m);
  rendreVariante();
  placerPastilles();
}

/**
 * La place d'une pastille : la projection de l'ancre de sa zone, plus le décalage de la zone (decalage de zones.json,
 * [dx, dy] en pixels de l'écran) s'il en a un. La visibilité reste celle de l'ancre.
 * @param {{x: number, y: number, visible: boolean}} place La projection de l'ancre, en pixels de l'image.
 * @param {object} zone Une zone de zones.json.
 * @returns {{x: number, y: number, visible: boolean}}
 */
export function placeDePastille(place, zone) {
  const [dx, dy] = zone.decalage ?? [0, 0];
  return { ...place, x: place.x + dx, y: place.y + dy };
}

function poserPastilles(places) {
  places.forEach((p, i) => {
    const b = ui.pins[i], q = placeDePastille(p, ui.zones[i]);
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
  choisirMode(etat.mode); // montre aussi la variante d'une zone choisie avant que la 3D soit là
}

// Sans 3D : le schéma 2D prend le relais. Sans schéma non plus, la page le dit et retire la scène vide ; les liens de
// « Où intervenir » mènent toujours aux ateliers.
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

// ---- Démarrage ----

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
  ui = {
    zones,
    stage: $('#scene-stage'), svg: $('#plan'), canvas: $('#gl'), variante: $('#variante'),
    aide: $('#scene-aide'), legende: $('#key'), legende2d: $('#legende-2d'), statut: $('#scene-statut'),
    alerte: $('#scene-alerte'),
    dialogue: $('#approche-liste'), contenu: $('#approche-contenu'),
    onglets: [...document.querySelectorAll('#scene .modes [role="tab"]')],
    cartes: [...document.querySelectorAll('.zone-carte[data-zone]')],
    boutons: [...document.querySelectorAll('button.zone-btn[data-zone]')],
    pins: [], W: 1, H: 1, visible: true, boucle: 0, vbPose: null, schema: null,
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
    pin.addEventListener('click', () => montrerChoix(z.id, false));
    $('#pins').append(pin);
    ui.pins.push(pin);
  });
  for (const b of ui.boutons) {
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => montrerChoix(b.dataset.zone, true));
  }

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
  monter3D();
}

if (typeof document !== 'undefined') demarrer();
