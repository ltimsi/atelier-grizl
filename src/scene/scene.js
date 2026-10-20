// Scène 3D du vélo : rendu, caméra, zones d'atelier, variantes, pastilles et liste des approximations.
// Portée de init3d() de la maquette. Le vélo vient des modules de pièces (pieces/*.js), chacun construit dans son
// groupe à partir de points() et de GEO.
//
// Rendu à la demande : image(now) ne dessine que si la caméra, une animation ou un réglage a changé.
// Repère : celui de geometrie.js, en millimètres. Le groupe du vélo est décalé pour que le centre de sa boîte soit à
// l'origine en x et en y. Le sol (y = 0 du vélo) est alors à -centre.y.
// Les nombres de ce fichier sont des réglages d'affichage, repris de la maquette ou choisis pour l'écran : caméra,
// lumières, durées, marges, course des plaquettes. Aucun n'est une cote.
// Aucun import nu : three.js et ses modules d'exemple arrivent dans `libs`. Les calculs purs exportés à côté de
// creerScene se testent sous Node.
import { GEO, points, approximations as approximationsGeo } from './geometrie.js';
import { SOURCES } from './sources.js';
import { creerMateriaux, marbre, reliefRuban, striesBrossees } from './materiaux.js';
import { creerStudio, creerOmbre } from './studio.js';
import { creerOutils } from './outils3d.js';
import * as cadre from './pieces/cadre.js';
import * as roues from './pieces/roues.js';
import * as freins from './pieces/freins.js';
import * as transmission from './pieces/transmission.js';
import * as poste from './pieces/poste.js';

// Les modules de pièces, dans l'ordre de construction.
export const PIECES = Object.freeze([cadre, roues, freins, transmission, poste]);

const D2R = Math.PI / 180;
const CHAMP = 28; // champ vertical de la caméra, en degrés
const DUREE_VOL = 850; // en millisecondes
const DUREE_PLAQUETTES = 420; // sortie complète des plaquettes, en millisecondes
const COURSE_PLAQUETTES = 46; // en millimètres : un choix d'affichage, pas une cote
const ZONE_PLAQUETTES = 'etrier'; // la zone dont la variante sort les plaquettes de freins.PLAQUETTES
const ETROIT = 1.25; // sous ce rapport largeur / hauteur, les vues d'atelier reculent
const DIR_ENSEMBLE = Object.freeze([0.26, 0.1, 1]); // vue d'ensemble : côté transmission, un peu devant et au-dessus
const MARGE_ENSEMBLE = Object.freeze([1.06, 1.12]); // autour de la boîte du vélo, en largeur et en hauteur
const SURLIGNE = Object.freeze({ reel: [0x6d5bd0, 0.22], simple: [0xffffff, 0.28] }); // émissif et intensité

const adoucir = k => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const reduit = () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
const maintenant = () => globalThis.performance.now();

/**
 * Distance de la caméra à la cible (l'origine) pour que chaque point tienne dans l'image, vu depuis la direction
 * `dir`, perspective comprise : le côté proche de la caméra grossit. Le haut de la caméra est le haut du monde (y).
 * @param {number[][]} pts Les points à garder dans l'image, [x, y, z] autour de la cible.
 * @param {number} champ Champ vertical, en degrés. @param {number} aspect Largeur / hauteur de l'image.
 * @param {number[]} marges [en largeur, en hauteur] : le point le plus écarté s'arrête à 1 / marge du bord.
 * @returns {number}
 */
export function distanceEnsemble(pts, dir, champ, aspect, [mx, my] = [1, 1]) {
  const l = Math.hypot(...dir), u = dir.map(c => c / l);
  // Repère de la caméra, comme lookAt : droite = haut du monde (y) vectoriel u, haut = u vectoriel droite.
  const n = Math.hypot(u[2], u[0]), droite = [u[2] / n, 0, -u[0] / n];
  const haut = [
    u[1] * droite[2] - u[2] * droite[1], u[2] * droite[0] - u[0] * droite[2], u[0] * droite[1] - u[1] * droite[0],
  ];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const tv = Math.tan(champ * D2R / 2), th = tv * aspect;
  let d = 0;
  for (const q of pts) {
    const pz = dot(q, u); // vers la caméra : ce point est d'autant plus proche d'elle
    d = Math.max(d, pz + Math.abs(dot(q, droite)) * mx / th, pz + Math.abs(dot(q, haut)) * my / tv);
  }
  return d;
}

/** Position de la caméra : depuis la cible, à `dist` dans la direction `dir` (normalisée ici). */
export function positionVue(cible, dir, dist) {
  const k = dist / Math.hypot(...dir);
  return cible.map((c, i) => c + dir[i] * k);
}

/** Recul d'une vue d'atelier : sur un écran plus étroit que 1,25, la caméra recule pour garder la pièce entière. */
export const reculVue = aspect => Math.max(1, ETROIT / aspect);

/**
 * Point projeté par la caméra (coordonnées normalisées de three.js) vers les pixels d'une image de largeur sur hauteur.
 * Une pastille reste visible jusqu'à `marge` pixels hors de l'image, et disparaît derrière la caméra.
 * @returns {{x: number, y: number, visible: boolean}}
 */
export function versPixels([x, y, z], largeur, hauteur, marge = 20) {
  const px = (x + 1) / 2 * largeur, py = (1 - y) / 2 * hauteur;
  const dedans = px >= -marge && py >= -marge && px <= largeur + marge && py <= hauteur + marge;
  return { x: px, y: py, visible: z <= 1 && dedans };
}

/** Les zones portées par les maillages d'un groupe, sans doublon, dans l'ordre où on les rencontre. */
export function zonesDuGroupe(groupe) {
  const zones = [];
  groupe.traverse(o => {
    const z = o.isMesh ? o.userData?.zone : null;
    if (z && !zones.includes(z)) zones.push(z);
  });
  return zones;
}

/**
 * Ce qui est approché, pièce par pièce, pour les fiches d'atelier et la liste « Ce qui est approché ».
 * Une pièce appartient à une zone dès qu'un de ses maillages la porte. La géométrie vient en dernier.
 * @param {{meta: object, zones: string[]}[]} pieces Le META de chaque module et ses zones.
 * @returns {{piece: string, zones: string[], approche: string[], aVerifier: string[],
 *   sources: {id: string, titre: string, url: string}[]}[]}
 */
export function listerApproximations(pieces, geo = GEO, sources = SOURCES) {
  const source = id => {
    const s = sources[id];
    if (!s) throw new Error(`Source inconnue : ${id}`);
    return { id, titre: s.titre, url: s.url };
  };
  const liste = pieces.map(({ meta, zones }) => ({
    piece: meta.nom,
    zones: [...zones],
    approche: [...meta.approche],
    aVerifier: [...meta.aVerifier],
    sources: meta.sources.map(source),
  }));
  const entrees = Object.values(geo);
  liste.push({
    piece: 'Géométrie',
    zones: [],
    approche: approximationsGeo(geo).map(a => a.note),
    aVerifier: [...new Set(entrees.map(e => e.aVerifier).filter(Boolean))],
    sources: [...new Set(entrees.map(e => e.src).filter(Boolean))].map(source),
  });
  return liste;
}

// Texture de pixels RGBA, filtrée et répétée. Sans ces réglages, une DataTexture reste sans mipmaps et au plus proche.
function texture(THREE, pixels, largeur, hauteur, { repete, srgb = false, anisotropie = 1 }) {
  const octets = new Uint8Array(pixels.buffer, pixels.byteOffset, pixels.length);
  const t = new THREE.DataTexture(octets, largeur, hauteur, THREE.RGBAFormat);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repete);
  t.magFilter = THREE.LinearFilter;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.generateMipmaps = true;
  t.anisotropy = anisotropie;
  t.needsUpdate = true;
  return t;
}

/**
 * Crée la scène du vélo sur un canevas. Au départ : rendu réaliste, vue d'ensemble, pièces d'origine, rien de surligné.
 * @param {{THREE: object, OrbitControls: Function, RoundedBoxGeometry: Function, HorizontalBlurShader: object,
 *   VerticalBlurShader: object}} libs three.js et ses modules d'exemple.
 * @param {HTMLCanvasElement} canvas Le canevas de la scène.
 * @param {object[]} zones Le contenu de zones.json.
 * @returns {object} L'interface de la scène :
 *   rendu('reel' | 'simple') : matières, éclairage et tonalité du mode ;
 *   surligner(id | null) : les maillages de la zone en émissif, les autres normaux ;
 *   viser(id) : vol de la caméra vers la vue de la zone, en 850 ms (tout de suite si l'utilisateur préfère réduire
 *   les animations) ; ensemble() : vol vers la vue d'ensemble ;
 *   variante(id, k) : 'disques' montre les disques de la variante k ; 'etrier' sort (k = 1) ou rentre (k = 0) les
 *   plaquettes. L'ombre est recuite après chaque changement ; pour les plaquettes, à la fin de leur sortie ;
 *   redimensionner(w, h) : taille de l'image, en pixels CSS ;
 *   image(now) : à appeler à chaque image ; dessine si besoin et renvoie true quand il a dessiné ;
 *   pastilles() : la place de l'ancre de chaque zone dans l'image, [{ id, x, y, visible }] ;
 *   approximations() : la liste de listerApproximations pour les pièces de la scène.
 */
export function creerScene(libs, canvas, zones) {
  const { THREE, OrbitControls, RoundedBoxGeometry, HorizontalBlurShader, VerticalBlurShader } = libs;
  const p = points(GEO);
  const ancre = nom => {
    if (!p.ancres[nom]) throw new Error(`Ancre inconnue : ${nom}`);
    return p.ancres[nom];
  };
  const zone = id => {
    const z = zones.find(x => x.id === id);
    if (!z) throw new Error(`Zone inconnue : ${id}`);
    return z;
  };
  for (const z of zones) { ancre(z.ancre); ancre(z.vue.cible); }

  // ---- Rendu, caméra et contrôles d'orbite ----
  let W = Math.max(1, canvas.clientWidth || canvas.width), H = Math.max(1, canvas.clientHeight || canvas.height);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(W, H, false);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(CHAMP, W / H, 10, 30000);
  const controls = new OrbitControls(camera, canvas);
  Object.assign(controls, {
    enableDamping: true, dampingFactor: 0.09, rotateSpeed: 0.8, minDistance: 200, maxDistance: 7000,
    maxPolarAngle: Math.PI * 0.5,
  });

  // ---- Studio et lumières ----
  const environnement = creerStudio(THREE, renderer);
  const ciel = new THREE.HemisphereLight(0xffffff, 0x9aa3ab, 2.1);
  const soleil = new THREE.DirectionalLight(0xffffff, 2);
  soleil.position.set(700, 1900, 1200);
  scene.add(ciel, soleil);

  // ---- Matières, avec les textures des générateurs de pixels ----
  const materiaux = creerMateriaux(THREE, {
    texturePeinture: texture(THREE, marbre(256), 256, 256, { repete: [1, 3], srgb: true, anisotropie: 4 }),
    textureRuban: texture(THREE, reliefRuban(64), 64, 64, { repete: [70, 1] }),
    textureBrossee: texture(THREE, striesBrossees(8, 256), 8, 256, { repete: [1, 1] }),
  });

  // ---- Le vélo : un groupe par pièce, puis centré ----
  const velo = new THREE.Group();
  scene.add(velo);
  const pieces = PIECES.map(module => {
    const g = new THREE.Group();
    g.name = module.META.id;
    velo.add(g);
    module.construire(creerOutils(THREE, RoundedBoxGeometry, g, materiaux), p, GEO);
    return { meta: module.META, zones: zonesDuGroupe(g) };
  });
  // freins.PLAQUETTES décrit la dernière construction : on en garde une copie pour cette scène.
  const plaquettes = freins.PLAQUETTES.map(q => ({ groupe: q.groupe, base: q.base.clone(), dir: q.dir.clone() }));
  const maillages = [];
  velo.traverse(o => { if (o.isMesh) maillages.push(o); });

  const boite = new THREE.Box3().setFromObject(velo);
  const centre = boite.getCenter(new THREE.Vector3());
  velo.position.set(-centre.x, -centre.y, 0);
  const coins = []; // les huit coins de la boîte du vélo, une fois centré : la vue d'ensemble les garde tous
  for (const x of [boite.min.x, boite.max.x]) for (const y of [boite.min.y, boite.max.y]) {
    for (const z of [boite.min.z, boite.max.z]) coins.push([x - centre.x, y - centre.y, z]);
  }
  const versMonde = q => [q[0] - centre.x, q[1] - centre.y, q[2]];
  const ombre = creerOmbre(THREE, renderer, scene, { HorizontalBlurShader, VerticalBlurShader }, { sol: -centre.y });

  // ---- État ----
  let mode = 'reel', zoneSurlignee = null, sale = true, premier = true, vol = null;
  let tPlaquettes = 0, sortie = null;
  const variantes = Object.fromEntries(zones.filter(z => z.variante).map(z => [z.id, 0]));

  // ---- Matières du mode et surlignage ----
  const surlignees = new Map(); // une copie émissive par matière de base et par mode
  const surlignee = base => {
    const cle = base.uuid + mode;
    if (!surlignees.has(cle)) {
      const c = base.clone();
      c.emissive.setHex(SURLIGNE[mode][0]);
      c.emissiveIntensity = SURLIGNE[mode][1];
      surlignees.set(cle, c);
    }
    return surlignees.get(cle);
  };
  function habiller() {
    for (const o of maillages) {
      const base = materiaux[mode][o.userData.role];
      o.material = zoneSurlignee !== null && o.userData.zone === zoneSurlignee ? surlignee(base) : base;
    }
    sale = true;
  }
  function rendu(m) {
    if (!(m in materiaux)) throw new Error(`Rendu inconnu : ${m}`);
    mode = m;
    const reel = m === 'reel';
    renderer.toneMapping = reel ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping;
    renderer.toneMappingExposure = reel ? 1.05 : 1;
    scene.environment = reel ? environnement : null;
    ciel.visible = !reel;
    soleil.intensity = reel ? 1.3 : 2;
    for (const x of Object.values(materiaux[m])) x.needsUpdate = true;
    surlignees.forEach(x => { x.needsUpdate = true; });
    habiller();
  }
  function surligner(id) {
    zoneSurlignee = id ?? null;
    habiller();
  }

  // ---- Caméra ----
  controls.addEventListener('start', () => { vol = null; });
  controls.addEventListener('change', () => { sale = true; });
  function voler(cible, position) {
    const ac = new THREE.Vector3(...cible), ap = new THREE.Vector3(...position);
    if (premier || reduit()) {
      vol = null;
      camera.position.copy(ap);
      controls.target.copy(ac);
      controls.update();
      premier = false;
      sale = true;
      return;
    }
    vol = { dp: camera.position.clone(), dc: controls.target.clone(), ap, ac, t0: maintenant() };
  }
  function viser(id) {
    const v = zone(id).vue, c = versMonde(ancre(v.cible));
    voler(c, positionVue(c, v.dir, v.dist * reculVue(camera.aspect)));
  }
  function ensemble() {
    const d = distanceEnsemble(coins, DIR_ENSEMBLE, CHAMP, camera.aspect, MARGE_ENSEMBLE);
    voler([0, 0, 0], positionVue([0, 0, 0], DIR_ENSEMBLE, d));
  }

  // ---- Variantes ----
  function montrerVariantes() {
    for (const o of maillages) {
      const v = o.userData.variante;
      if (v) o.visible = (variantes[v.zone] ?? 0) === v.k;
    }
  }
  function poserPlaquettes(t) {
    tPlaquettes = t;
    const e = adoucir(t);
    for (const q of plaquettes) q.groupe.position.copy(q.base).addScaledVector(q.dir, COURSE_PLAQUETTES * e);
  }
  function sortirPlaquettes(vers) {
    if (reduit()) {
      sortie = null;
      poserPlaquettes(vers);
      ombre.cuire();
      return;
    }
    sortie = { de: tPlaquettes, vers, t0: maintenant(), duree: DUREE_PLAQUETTES * Math.abs(vers - tPlaquettes) };
  }
  function variante(id, k) {
    variantes[id] = k;
    montrerVariantes();
    if (id === ZONE_PLAQUETTES) sortirPlaquettes(k ? 1 : 0); // l'ombre est recuite à la fin de la sortie
    else ombre.cuire();
    sale = true;
  }

  // ---- Image ----
  function image(now = maintenant()) {
    if (vol) {
      const k = Math.min(1, Math.max(0, (now - vol.t0) / DUREE_VOL)), e = adoucir(k);
      camera.position.lerpVectors(vol.dp, vol.ap, e);
      controls.target.lerpVectors(vol.dc, vol.ac, e);
      if (k === 1) vol = null;
      sale = true;
    }
    if (sortie) {
      const k = sortie.duree > 0 ? Math.min(1, Math.max(0, (now - sortie.t0) / sortie.duree)) : 1;
      poserPlaquettes(sortie.de + (sortie.vers - sortie.de) * k);
      if (k === 1) { sortie = null; ombre.cuire(); }
      sale = true;
    }
    const bouge = controls.update();
    if (!bouge && !sale) return false;
    renderer.render(scene, camera);
    sale = false;
    return true;
  }

  function redimensionner(w, h) {
    W = Math.max(1, w);
    H = Math.max(1, h);
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    sale = true;
  }

  const ndc = new THREE.Vector3();
  function pastilles() {
    camera.updateMatrixWorld();
    return zones.map(z => {
      ndc.set(...versMonde(ancre(z.ancre))).project(camera);
      return { id: z.id, ...versPixels([ndc.x, ndc.y, ndc.z], W, H) };
    });
  }

  const approximations = () => listerApproximations(pieces);

  // ---- Départ ----
  montrerVariantes();
  rendu('reel');
  ensemble();
  ombre.cuire();

  return { rendu, surligner, viser, ensemble, variante, redimensionner, image, pastilles, approximations };
}
