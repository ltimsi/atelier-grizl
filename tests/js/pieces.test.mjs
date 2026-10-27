// Tests des modules de pièces de la scène 3D (src/scene/pieces/).
//
// Les tests communs parcourent la liste PIECES. Pour ajouter un module : l'importer, puis l'ajouter à PIECES.
// Les tests propres à une pièce suivent, chacun préfixé du nom de son module.
// Le RoundedBoxGeometry de three/addons importe 'three' en nom nu, ce que Node ne sait pas résoudre : un faux le remplace.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../../vendor/three/three.module.min.js';
import { creerOutils } from '../../src/scene/outils3d.js';
import { creerMateriaux, ROLES } from '../../src/scene/materiaux.js';
import { GEO, points } from '../../src/scene/geometrie.js';
import { SOURCES } from '../../src/scene/sources.js';
import * as cadre from '../../src/scene/pieces/cadre.js';
import * as roues from '../../src/scene/pieces/roues.js';
import * as freins from '../../src/scene/pieces/freins.js';
import * as transmission from '../../src/scene/pieces/transmission.js';
import * as poste from '../../src/scene/pieces/poste.js';
import { CF7 } from './cf7.mjs';

const PIECES = [cadre, roues, freins, transmission, poste];

const BUDGET_TRIANGLES = 500000;

class FauxRoundedBox extends THREE.BoxGeometry {
  constructor(w, h, d) {
    super(w, h, d);
  }
}

const materiaux = creerMateriaux(THREE, {});

// Construit un module dans un groupe neuf. Renvoie le groupe, ses maillages et les outils.
function construire(module) {
  const groupe = new THREE.Group();
  const outils = creerOutils(THREE, FauxRoundedBox, groupe, materiaux);
  module.construire(outils, points(GEO), GEO);
  groupe.updateMatrixWorld(true);
  const maillages = [];
  groupe.traverse(o => { if (o.isMesh) maillages.push(o); });
  return { groupe, maillages, outils };
}

// Triangles d'un maillage, instances comprises.
function triangles(m) {
  const g = m.geometry;
  const parInstance = (g.index ? g.index.count : g.attributes.position.count) / 3;
  return parInstance * (m.isInstancedMesh ? m.count : 1);
}

// Sommets d'un maillage, en coordonnées du monde. Une InstancedMesh donne les sommets de chacune de ses instances.
function sommets(m) {
  const pos = m.geometry.attributes.position, o = [];
  const matrices = [];
  if (m.isInstancedMesh) {
    for (let k = 0; k < m.count; k++) {
      const mi = new THREE.Matrix4();
      m.getMatrixAt(k, mi);
      matrices.push(mi.premultiply(m.matrixWorld));
    }
  } else matrices.push(m.matrixWorld);
  for (const mat of matrices) for (let i = 0; i < pos.count; i++) o.push(new THREE.Vector3().fromBufferAttribute(pos, i).applyMatrix4(mat));
  return o;
}

// Parcourt les faces d'un maillage, en coordonnées du monde, par une grille de points espacés d'au plus `pas` mm.
// Les tubes n'ont qu'un segment en longueur : leurs sommets seuls ne disent rien du milieu du tube.
function surFaces(m, pas, visite) {
  const pos = m.geometry.attributes.position, idx = m.geometry.index;
  const n = idx ? idx.count : pos.count;
  const sommet = i => new THREE.Vector3().fromBufferAttribute(pos, idx ? idx.getX(i) : i).applyMatrix4(m.matrixWorld);
  const q = new THREE.Vector3();
  for (let t = 0; t < n; t += 3) {
    const a = sommet(t), ab = sommet(t + 1).sub(a), ac = sommet(t + 2).sub(a);
    const k = Math.max(1, Math.ceil(Math.max(ab.length(), ac.length()) / pas));
    for (let i = 0; i <= k; i++) for (let j = 0; j <= k - i; j++) {
      q.copy(a).addScaledVector(ab, i / k).addScaledVector(ac, j / k);
      if (visite(q) === false) return;
    }
  }
}

// Points des faces d'un maillage, en coordonnées du monde, espacés d'au plus `pas` mm le long des deux côtés de chaque
// triangle : un tube long et fin ne donne pas plus de points qu'il n'en faut. Une InstancedMesh donne les points de
// chacune de ses instances. Avec `boite`, les triangles qui n'y entrent pas sont écartés d'avance.
function echantillons(m, pas, boite = null) {
  const pos = m.geometry.attributes.position, idx = m.geometry.index;
  const n = idx ? idx.count : pos.count;
  const matrices = [];
  if (m.isInstancedMesh) {
    for (let k = 0; k < m.count; k++) {
      const mi = new THREE.Matrix4();
      m.getMatrixAt(k, mi);
      matrices.push(mi.premultiply(m.matrixWorld));
    }
  } else matrices.push(m.matrixWorld);
  const o = [], tri = new THREE.Box3();
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  for (const mat of matrices) for (let t = 0; t < n; t += 3) {
    const sommet = (v, i) => v.fromBufferAttribute(pos, idx ? idx.getX(i) : i).applyMatrix4(mat);
    sommet(a, t); sommet(b, t + 1); sommet(c, t + 2);
    if (boite && !boite.intersectsBox(tri.setFromPoints([a, b, c]))) continue;
    const ab = b.clone().sub(a), ac = c.clone().sub(a);
    const ka = Math.max(1, Math.ceil(ab.length() / pas)), kc = Math.max(1, Math.ceil(ac.length() / pas));
    for (let i = 0; i <= ka; i++) for (let j = 0; j <= kc; j++) {
      if (i / ka + j / kc > 1 + 1e-9) continue;
      o.push(a.clone().addScaledVector(ab, i / ka).addScaledVector(ac, j / kc));
    }
  }
  return o;
}

// Plus petite distance entre deux nuages de points, cherchée dans une grille : seules comptent les distances sous `portee`.
function distanceMini(nuageA, nuageB, portee) {
  const cle = q => `${Math.floor(q.x / portee)},${Math.floor(q.y / portee)},${Math.floor(q.z / portee)}`;
  const grille = new Map();
  for (const q of nuageB) {
    const k = cle(q);
    if (!grille.has(k)) grille.set(k, []);
    grille.get(k).push(q);
  }
  let mini = Infinity, ou = null;
  for (const q of nuageA) {
    const [i, j, k] = [q.x, q.y, q.z].map(v => Math.floor(v / portee));
    for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) for (let dk = -1; dk <= 1; dk++) {
      for (const r of grille.get(`${i + di},${j + dj},${k + dk}`) ?? []) {
        const d = q.distanceTo(r);
        if (d < mini) { mini = d; ou = q; }
      }
    }
  }
  return { mini, ou };
}

const textesDeMeta = meta => [meta.id, meta.nom, ...meta.approche, ...meta.aVerifier];
// Une note parle de la pièce et de ses sources, jamais de l'accès à un document ni du jour où on l'a lu.
const ACCES_OU_DATE = /accessib|consultab|jour du relev|403|maintenance|pendant la rédaction/i;

// ---- Tests communs à tous les modules de pièces ----

for (const module of PIECES) {
  const { META } = module;
  const nom = META?.id ?? 'module sans META';

  test(`${nom} : META valide`, () => {
    assert.equal(typeof META.id, 'string');
    assert.ok(META.id.length > 0, 'id vide');
    assert.equal(typeof META.nom, 'string');
    assert.ok(META.nom.length > 0, 'nom vide');
    assert.ok(META.zone === null || typeof META.zone === 'string', 'zone : une chaîne ou null');
    for (const cle of ['sources', 'approche', 'aVerifier']) assert.ok(Array.isArray(META[cle]), `${cle} : un tableau`);
    assert.ok(META.sources.length > 0, 'au moins une source');
    for (const id of META.sources) assert.ok(SOURCES[id], `source inconnue : ${id}`);
    for (const t of [...META.approche, ...META.aVerifier]) {
      assert.equal(typeof t, 'string');
      assert.ok(!/\d/.test(t), `chiffre dans « ${t} »`);
    }
    for (const t of textesDeMeta(META)) assert.ok(!/[\u2014\u2013]/.test(t), `tiret long dans « ${t} »`);
  });

  test(`${nom} : notes sans accès ni date de lecture`, () => {
    for (const t of [...META.approche, ...META.aVerifier]) {
      assert.ok(!ACCES_OU_DATE.test(t), `accès ou date dans « ${t} »`);
    }
  });

  test(`${nom} : les cotes publiées citent une source de META`, () => {
    for (const [cle, c] of Object.entries(module.COTES ?? {})) {
      assert.equal(typeof c.v, 'number', `${cle} : valeur`);
      assert.ok(META.sources.includes(c.src), `${cle} : source ${c.src} absente de META.sources`);
    }
  });

  test(`${nom} : construction`, () => {
    const { maillages } = construire(module);
    assert.ok(maillages.length > 0, 'aucun maillage');
    for (const m of maillages) {
      assert.ok(ROLES.includes(m.userData.role), `rôle inconnu : ${m.userData.role}`);
      const pos = m.geometry.attributes.position.array;
      assert.ok(pos.every(Number.isFinite), `${m.name || m.userData.role} : sommet non fini`);
      assert.ok(m.matrixWorld.elements.every(Number.isFinite), `${m.name || m.userData.role} : placement non fini`);
    }
  });

  test(`${nom} : laisse les outils sans zone, et sans variante`, () => {
    const { outils } = construire(module);
    const temoin = outils.ell([0, 0, 0], [1, 1, 1], 'paint');
    assert.equal(temoin.userData.zone, null);
    assert.equal('variante' in temoin.userData, false);
  });
}


test('aucune pièce ni cote ne cite une source du CF 7, et chaque source citée existe', () => {
  for (const { META, COTES } of PIECES) {
    const ids = [...META.sources, ...Object.values(COTES ?? {}).map(c => c.src)];
    for (const id of ids) {
      assert.ok(SOURCES[id], `${META.id} : source inconnue ${id}`);
      assert.ok(!CF7.test(id) && !CF7.test(SOURCES[id].titre), `${META.id} : source du CF 7 ${id}`);
    }
    for (const t of textesDeMeta(META)) assert.ok(!CF7.test(t), `${META.id} : « ${t} »`);
  }
  for (const [cle, e] of Object.entries(GEO)) if (e.src) assert.ok(!CF7.test(e.src), `GEO.${cle} : ${e.src}`);
});

test('aucun maillage ne porte de variante : la zone des disques n’en a plus', () => {
  for (const module of PIECES) for (const m of construire(module).maillages) {
    assert.equal('variante' in m.userData, false, `${module.META.id} : ${m.name || m.userData.role}`);
  }
});

test('budget : toutes les pièces ensemble, instances comprises', () => {
  let total = 0;
  for (const module of PIECES) for (const m of construire(module).maillages) total += triangles(m);
  assert.ok(total > 0);
  assert.ok(total < BUDGET_TRIANGLES, `${total} triangles, pour un budget de ${BUDGET_TRIANGLES}`);
});

// ---- Cadre, fourche, tige de selle et selle ----

const parNom = (maillages, nom) => maillages.filter(m => m.name === nom);

test('cadre : la patte de dérailleur reste à vérifier', () => {
  assert.ok(cadre.META.aVerifier.includes('type de patte de dérailleur'));
});

test('cadre : les pattes tiennent les axes de la fiche, 12x142 à l’arrière et 12x100 à l’avant', () => {
  const { maillages } = construire(cadre);
  for (const [nom, ecartement] of [['patte arrière', 142], ['patte avant', 100]]) {
    const pattes = parNom(maillages, nom);
    assert.equal(pattes.length, 2, `${nom} : une de chaque côté`);
    const faces = pattes.map(m => {
      const z = sommets(m).map(v => v.z);
      return Math.min(...z) > 0 ? Math.min(...z) : Math.max(...z);
    }).sort((a, b) => a - b);
    assert.ok(Math.abs(faces[0] + ecartement / 2) < 0.5, `${nom} gauche : face intérieure à ${faces[0]}`);
    assert.ok(Math.abs(faces[1] - ecartement / 2) < 0.5, `${nom} droite : face intérieure à ${faces[1]}`);
  }
});

test('cadre : place pour un pneu de la largeur du dégagement publié, 54 mm', () => {
  // Le pneu le plus large que permet la fiche : une section ronde de 54 mm, posée sous le rayon extérieur de la roue
  // dessinée. Plus près du moyeu, toute la largeur reste interdite, jante et rayons compris.
  const p = points(GEO), rayon = GEO.rayonPneu.v, demi = 54 / 2, centre = rayon - demi;
  const dansLePneu = (q, axe) => {
    const rho = Math.hypot(q.x - axe[0], q.y - axe[1]);
    if (rho >= rayon) return false;
    const largeur = rho <= centre ? demi : Math.sqrt(demi * demi - (rho - centre) ** 2);
    return Math.abs(q.z) < largeur;
  };
  const { maillages } = construire(cadre);
  for (const m of maillages) {
    let fautif = null;
    surFaces(m, 4, q => {
      if (Math.abs(q.z) >= demi) return;
      if (dansLePneu(q, p.RA) || dansLePneu(q, p.FA)) { fautif = q.clone(); return false; }
    });
    assert.equal(fautif, null, `${m.name || m.userData.role} entre dans l’enveloppe du pneu en ${fautif?.toArray().map(Math.round)}`);
  }
});

test('cadre : la tige de selle de 350 mm reste insérée entre 110 et 210 mm', () => {
  const p = points(GEO);
  const tige = parNom(construire(cadre).maillages, 'tige de selle');
  assert.ok(tige.length > 0, 'tige absente');
  const n = Math.hypot(...p.dST);
  const s = tige.flatMap(sommets).map(v => ((v.x - p.BB[0]) * p.dST[0] + (v.y - p.BB[1]) * p.dST[1]) / n);
  const bas = Math.min(...s), haut = Math.max(...s);
  const insertion = Math.hypot(p.STt[0] - p.BB[0], p.STt[1] - p.BB[1]) - bas;
  assert.ok(insertion >= 110 && insertion <= 210, `insertion de ${insertion} mm`);
  assert.ok(haut - bas <= 350 + 0.5, `tige de ${haut - bas} mm le long du tube`);
});

test('cadre : le META cite la selle Fizik et la photo de la tige du CF 8 Di2, et nomme les deux pièces', () => {
  for (const id of ['fizik-argo-terra-x5', 'canyon-photo-4556-confort', 'canyon-photo-sp100-marquage']) {
    assert.ok(cadre.META.sources.includes(id), `${id} absent`);
  }
  assert.match(cadre.META.nom, /Fizik Argo Terra X5/);
  assert.match(cadre.META.nom, /SP100 VCLS 2\.1/);
  // Plus rien du CF 7 : ni sa fiche, ni ses photos, ni sa selle.
  for (const id of cadre.META.sources) assert.ok(!/4553/.test(id), `source du CF 7 : ${id}`);
  for (const t of textesDeMeta(cadre.META)) assert.ok(!/SRX|Selle Royal/.test(t), `ancienne selle dans « ${t} »`);
});

test('cadre : la lecture des cotes Fizik, repère de largeur et section des rails, reste à vérifier', () => {
  const t = cadre.META.aVerifier.find(x => /Fizik/.test(x) && /repère/.test(x) && /rails/.test(x));
  assert.ok(t, 'aucune ligne sur le repère et les rails de Fizik');
  assert.match(t, /vérifier/);
});

test('cadre : la selle Fizik fait 150 mm de large et 270 mm de long, 75 mm de large à 113 mm du bec', () => {
  const selle = parNom(construire(cadre).maillages, 'selle');
  assert.equal(selle.length, 1);
  assert.equal(cadre.COTES.largeurSelle.v, 150);
  // « Width 150 mm », « Length 270 mm », « Length from nose at 75mm 113 mm », « Height at 75mm 51 mm »,
  // « Rail Dimension 7x7 » : la colonne « 150 » de la page Fizik.
  const fizik = { largeurSelle: 150, longueurSelle: 270, largeurRepere: 75, repereDepuisBec: 113, hauteurRepere: 51, rail: 7 };
  for (const [c, val] of Object.entries(fizik)) {
    assert.equal(cadre.COTES[c].v, val, c);
    assert.equal(cadre.COTES[c].src, 'fizik-argo-terra-x5', c);
  }
  const v = sommets(selle[0]);
  const z = v.map(q => q.z), x = v.map(q => q.x);
  assert.ok(Math.abs(Math.max(...z) - Math.min(...z) - 150) < 0.5, `largeur de ${Math.max(...z) - Math.min(...z)} mm`);
  assert.ok(Math.abs(Math.max(...x) - Math.min(...x) - 270) < 0.5, `longueur de ${Math.max(...x) - Math.min(...x)} mm`);
  // Largeur à 113 mm du bec, interpolée entre les deux sections de la coque qui encadrent ce point.
  const xc = Math.max(...x) - cadre.COTES.repereDepuisBec.v;
  const parSection = new Map();
  for (const q of v) {
    const k = q.x.toFixed(6);
    const s = parSection.get(k) ?? { x: q.x, z0: Infinity, z1: -Infinity };
    s.z0 = Math.min(s.z0, q.z);
    s.z1 = Math.max(s.z1, q.z);
    parSection.set(k, s);
  }
  const sections = [...parSection.values()].sort((a, b) => a.x - b.x);
  const i = sections.findIndex(s => s.x >= xc);
  assert.ok(i > 0, 'aucune section autour du point');
  const [a, b] = [sections[i - 1], sections[i]];
  assert.ok(b.x - a.x < 12, `sections trop espacées : ${b.x - a.x} mm`);
  const t = (xc - a.x) / (b.x - a.x);
  const largeur = (a.z1 - a.z0) + ((b.z1 - b.z0) - (a.z1 - a.z0)) * t;
  assert.ok(Math.abs(largeur - 75) < 1, `largeur de ${largeur} mm à 113 mm du bec`);
});

test('cadre : le dessus de la selle est à 51 mm au-dessus de l’axe des rails, là où elle fait 75 mm de large', () => {
  const { maillages } = construire(cadre);
  const v = sommets(parNom(maillages, 'selle')[0]);
  const rails = parNom(maillages, 'rail de selle');
  assert.equal(rails.length, 2, 'un rail de chaque côté');
  const xc = Math.max(...v.map(q => q.x)) - cadre.COTES.repereDepuisBec.v;
  const dessus = Math.max(...v.filter(q => Math.abs(q.x - xc) < 6).map(q => q.y));
  // Sous la tête de tige, les rails sont droits : leur axe est à un rayon au-dessus de leur point le plus bas.
  const axeRail = Math.min(...rails.flatMap(sommets).map(q => q.y)) + cadre.COTES.rail.v / 2;
  const hauteur = dessus - axeRail;
  assert.ok(Math.abs(hauteur - cadre.COTES.hauteurRepere.v) < 1.5, `dessus à ${hauteur} mm de l’axe des rails`);
});

test('cadre : la tige VCLS a deux lames, séparées par une fente au-dessus du collier', () => {
  const p = points(GEO), tige = parNom(construire(cadre).maillages, 'tige de selle');
  const axe = Math.hypot(...p.dST), d = [p.dST[0] / axe, p.dST[1] / axe], avant = [d[1], -d[0]];
  const haut = Math.hypot(p.STt[0] - p.BB[0], p.STt[1] - p.BB[1]) + 12; // dessus du collier, le long du tube
  const ecarts = [];
  for (const m of tige) surFaces(m, 2, q => {
    const rx = q.x - p.BB[0], ry = q.y - p.BB[1];
    const s = rx * d[0] + ry * d[1];
    if (s > haut + 10 && s < haut + 60) ecarts.push(rx * avant[0] + ry * avant[1]);
  });
  assert.ok(ecarts.length > 0, 'pas de tige au-dessus du collier');
  assert.ok(ecarts.some(n => n > 10) && ecarts.some(n => n < -10), 'une lame devant, une lame derrière');
  const pres = ecarts.reduce((m, n) => Math.min(m, Math.abs(n)), Infinity);
  const loin = ecarts.reduce((m, n) => Math.max(m, Math.abs(n)), 0);
  assert.ok(pres >= 0.5, `de la matière à ${pres.toFixed(2)} mm de l’axe : pas de fente`);
  assert.ok(loin <= cadre.COTES.diametreTige.v / 2 + 0.05, `la tige s’étend à ${loin} mm de son axe`);
});

test('cadre : recul de 18 mm et diamètre de 27,2 mm, lus sur le marquage de la tige', () => {
  assert.equal(cadre.COTES.reculTete.v, 18);
  assert.equal(cadre.COTES.diametreTige.v, 27.2);
  assert.equal(cadre.COTES.longueurTige.v, 350);
  for (const c of ['reculTete', 'diametreTige', 'longueurTige']) {
    assert.equal(cadre.COTES[c].src, 'canyon-photo-sp100-marquage', c);
  }
});

test('cadre : boîte de pédalier PF 86,5, 43,25 mm de chaque côté du plan du vélo', () => {
  const boite = parNom(construire(cadre).maillages, 'boîte de pédalier');
  assert.equal(boite.length, 1);
  const z = sommets(boite[0]).map(v => v.z);
  assert.ok(Math.abs(Math.min(...z) + 43.25) < 0.01 && Math.abs(Math.max(...z) - 43.25) < 0.01,
    `boîte de ${Math.min(...z)} à ${Math.max(...z)}`);
});

// ---- Roues : pneus, jantes, moyeux, rayons, valves et axes ----

// Distance d'un point à l'axe d'une roue, dans le plan du vélo.
const auMoyeu = (q, axe) => Math.hypot(q.x - axe[0], q.y - axe[1]);
// La roue d'un maillage : celle dont l'axe est le plus proche du centre de sa boîte.
function roueDe(m, p) {
  const c = new THREE.Box3().setFromPoints(sommets(m)).getCenter(new THREE.Vector3());
  return Math.hypot(c.x - p.FA[0], c.y - p.FA[1]) < Math.hypot(c.x - p.RA[0], c.y - p.RA[1]) ? 'avant' : 'arrière';
}
const etendueZ = ms => {
  const z = ms.flatMap(sommets).map(v => v.z);
  return [Math.min(...z), Math.max(...z)];
};

test('roues : axes en zone axes (1.5), pneus et valves en zone pneus (3.1 à 3.6), le reste sans zone, sans variante', () => {
  const { maillages } = construire(roues);
  for (const nom of ['axe avant', 'axe arrière', 'pneu', 'valve']) {
    assert.ok(parNom(maillages, nom).length > 0, `${nom} absent`);
  }
  const zoneDe = { 'axe avant': 'axes', 'axe arrière': 'axes', pneu: 'pneus', valve: 'pneus' };
  for (const m of maillages) {
    const attendue = zoneDe[m.name] ?? null;
    assert.equal(m.userData.zone, attendue, `${m.name || m.userData.role} : zone ${m.userData.zone}`);
    assert.equal('variante' in m.userData, false);
  }
});

// La valve est décrite une fois, dans roues.js (tubesValve et ANGLE_VALVE), pour la 3D et pour le schéma 2D.
test('roues : chaque valve est faite des tubes de tubesValve, en haut de sa roue', () => {
  const p = points(GEO), { maillages } = construire(roues);
  const tubes = roues.tubesValve(GEO.diametreSiegeJante.v / 2);
  assert.equal(roues.ANGLE_VALVE, 90, 'en haut de la roue, comme sur la photo officielle');
  const valves = parNom(maillages, 'valve');
  assert.equal(valves.length, 2 * tubes.length);
  for (const cote of ['avant', 'arrière']) {
    const axe = cote === 'avant' ? p.FA : p.RA;
    const ms = valves.filter(m => roueDe(m, p) === cote);
    assert.equal(ms.length, tubes.length, cote);
    ms.forEach((m, i) => {
      const r = sommets(m).map(v => auMoyeu(v, axe));
      const [de, a] = [Math.max(tubes[i].de, tubes[i].a), Math.min(tubes[i].de, tubes[i].a)];
      assert.ok(Math.abs(Math.max(...r) - de) < 0.1 && Math.abs(Math.min(...r) - a) < 0.1,
        `${cote}, tube ${i} : de ${Math.min(...r)} à ${Math.max(...r)} au lieu de ${a} à ${de}`);
      for (const v of sommets(m)) assert.ok(Math.abs(v.x - axe[0]) <= tubes[i].rayon + 1e-6, `${cote}, tube ${i} : en haut`);
    });
  }
});

test('budget : les rayons instanciés comptent pour toutes leurs instances', () => {
  const rayons = construire(roues).maillages.filter(m => m.isInstancedMesh && m.userData.role === 'spoke');
  assert.equal(rayons.length, 2, 'un jeu de rayons par roue');
  for (const m of rayons) {
    const parInstance = (m.geometry.index ? m.geometry.index.count : m.geometry.attributes.position.count) / 3;
    assert.ok(m.count > 1, `${m.count} instance`);
    assert.equal(triangles(m), parInstance * m.count);
  }
});

test('roues : pneus de 45 mm de large, au rayon de la roue, assis sur le siège de 622', () => {
  const p = points(GEO), { maillages } = construire(roues);
  for (const cote of ['avant', 'arrière']) {
    const axe = cote === 'avant' ? p.FA : p.RA;
    const pneu = parNom(maillages, 'pneu').filter(m => roueDe(m, p) === cote);
    assert.ok(pneu.length > 0, `pneu ${cote} absent`);
    const [z0, z1] = etendueZ(pneu);
    assert.ok(Math.abs(z1 - z0 - 45) < 0.5, `pneu ${cote} : ${z1 - z0} mm de large`);
    const r = pneu.flatMap(sommets).map(v => auMoyeu(v, axe));
    assert.ok(Math.abs(Math.max(...r) - GEO.rayonPneu.v) < 0.5, `pneu ${cote} : rayon extérieur ${Math.max(...r)}`);
    assert.ok(Math.abs(Math.min(...r) - GEO.diametreSiegeJante.v / 2) < 0.5, `pneu ${cote} : talon à ${Math.min(...r)}`);
  }
});

test('roues : jantes GR 30 CF de 30 mm de haut, 27 mm à l’intérieur, 33 mm à l’extérieur, siège à 622', () => {
  const p = points(GEO), { maillages } = construire(roues), siege = GEO.diametreSiegeJante.v / 2;
  const jantes = parNom(maillages, 'jante');
  assert.equal(jantes.length, 2);
  assert.equal(roues.COTES.hauteurJante.v, 30);
  assert.equal(roues.COTES.largeurInterneJante.v, 27);
  // « External width: 33mm, ETRTO 622x27TSS » sur la page de la paire de roues.
  assert.equal(roues.COTES.largeurExterieureJante.v, 33);
  assert.equal(roues.COTES.largeurExterieureJante.src, 'canyon-gr30cf');
  assert.ok(!roues.META.approche.some(t => /[Ll]argeur extérieure[^.]*approch/.test(t)), 'largeur extérieure publiée');
  for (const m of jantes) {
    const axe = roueDe(m, p) === 'avant' ? p.FA : p.RA;
    const v = sommets(m), r = v.map(q => auMoyeu(q, axe));
    assert.ok(Math.abs(Math.max(...r) - Math.min(...r) - 30) < 0.05, `hauteur de ${Math.max(...r) - Math.min(...r)} mm`);
    // Au siège du talon, la face intérieure des flancs est à 13,5 mm de chaque côté du plan de la roue.
    const auSiege = v.filter((q, i) => Math.abs(r[i] - siege) < 0.05).map(q => q.z);
    for (const s of [-1, 1]) {
      assert.ok(auSiege.some(z => Math.abs(z - s * 13.5) < 0.05), `pas de face intérieure en z ${s * 13.5}`);
    }
    const [z0, z1] = etendueZ([m]);
    assert.ok(Math.abs(z1 - z0 - 33) < 0.05, `largeur extérieure de ${z1 - z0} mm`);
    // Sans crochets : en haut des flancs, rien de la jante ne revient vers le plan de la roue. Le bourrelet du siège,
    // qui retient le talon, reste tout près du siège.
    const surLeTalon = v.filter((q, i) => r[i] > siege + 2 && Math.abs(q.z) < 13.5 - 0.05);
    assert.equal(surLeTalon.length, 0, 'un crochet dépasse au-dessus du siège');
  }
});

test('roues : le META cite la page des GR 30 CF et celle du G-One RX, plus aucune source Continental ni du CF 7', () => {
  for (const id of ['canyon-gr30cf', 'schwalbe-g-one-rx', 'canyon-4556', 'canyon-photo-4556-fv']) {
    assert.ok(roues.META.sources.includes(id), `${id} absent`);
  }
  for (const id of roues.META.sources) {
    assert.ok(!/continental|4553/i.test(id) && !/Continental/.test(SOURCES[id].titre), `source à retirer : ${id}`);
  }
  assert.match(roues.META.nom, /GR 30 CF/);
  assert.match(roues.META.nom, /G-One RX/);
  for (const t of textesDeMeta(roues.META)) assert.ok(!/Continental|Gravel LN|Terra/.test(t), `ancienne pièce dans « ${t} »`);
  // Les cotes des pneus et des jantes viennent de documents du CF 8 Di2.
  assert.equal(roues.COTES.largeurPneu.src, 'schwalbe-g-one-rx');
  for (const c of ['hauteurJante', 'largeurInterneJante', 'axeAvant', 'axeArriere', 'diametreAxe']) {
    assert.equal(roues.COTES[c].src, 'canyon-4556', c);
  }
});

test('roues : vingt-quatre rayons à chaque roue, et leur nombre n’est plus à compter', () => {
  const rayons = construire(roues).maillages.filter(m => m.name === 'rayons');
  assert.equal(rayons.length, 2);
  for (const m of rayons) assert.equal(m.count, 24);
  for (const t of roues.META.aVerifier) assert.ok(!/nombre de rayons/.test(t), `« ${t} »`);
  assert.ok(!roues.META.aVerifier.some(t => /crochet/.test(t)), 'la jante est sans crochets, publiée');
});

test('roues : sculpture du G-One RX, petits crampons serrés au centre, crampons d’épaule plus gros et par paires', () => {
  const p = points(GEO);
  const crampons = construire(roues).maillages.filter(m => m.name === 'pneu' && m.isInstancedMesh && roueDe(m, p) === 'avant');
  assert.equal(crampons.length, 1, 'les crampons du pneu avant, en une InstancedMesh');
  const m = crampons[0], mi = new THREE.Matrix4(), pos = new THREE.Vector3(), q = new THREE.Quaternion();
  const ech = new THREE.Vector3();
  const centre = [], epaule = [];
  for (let k = 0; k < m.count; k++) {
    m.getMatrixAt(k, mi);
    mi.decompose(pos, q, ech);
    const surface = ech.x * ech.z; // empreinte au sol du crampon
    const angle = Math.atan2(pos.y - p.FA[1], pos.x - p.FA[0]);
    (Math.abs(pos.z) < 12 ? centre : epaule).push({ surface, angle, z: pos.z });
  }
  assert.ok(centre.length > 0 && epaule.length > 0);
  const maxCentre = Math.max(...centre.map(c => c.surface)), minEpaule = Math.min(...epaule.map(c => c.surface));
  assert.ok(maxCentre < minEpaule, `crampon central de ${maxCentre} mm², crampon d’épaule de ${minEpaule} mm²`);
  // D'un côté, les crampons d'épaule vont par deux : entre deux paires, l'écart est plus grand que dans une paire.
  // Les écarts se suivent donc petit, grand, petit, grand, quel que soit le crampon où commence le tour.
  const cote = epaule.filter(c => c.z > 0).map(c => c.angle).sort((a, b) => a - b);
  assert.ok(cote.length % 2 === 0 && cote.length >= 40, `${cote.length} crampons d’épaule d’un côté`);
  const ecarts = cote.map((a, i) => (i + 1 < cote.length ? cote[i + 1] : cote[0] + 2 * Math.PI) - a);
  const [pairs, impairs] = [0, 1].map(r => ecarts.filter((e, i) => i % 2 === r));
  const alternent = Math.max(...pairs) < Math.min(...impairs) || Math.max(...impairs) < Math.min(...pairs);
  assert.ok(alternent, 'les crampons d’épaule ne vont pas par paires');
});

test('roues : les moyeux tiennent entre les pattes du cadre, les axes les traversent', () => {
  const { maillages } = construire(roues), duCadre = construire(cadre).maillages;
  for (const [cote, ecartement, patte] of [['arrière', 142, 'patte arrière'], ['avant', 100, 'patte avant']]) {
    const [z0, z1] = etendueZ(parNom(maillages, `moyeu ${cote}`));
    assert.ok(Math.abs(z0 + ecartement / 2) < 0.05 && Math.abs(z1 - ecartement / 2) < 0.05,
      `moyeu ${cote} de ${z0} à ${z1}`);
    const [a0, a1] = etendueZ(parNom(maillages, `axe ${cote}`));
    const [p0, p1] = etendueZ(parNom(duCadre, patte));
    assert.ok(a0 < p0 && a1 > p1, `axe ${cote} de ${a0} à ${a1}, pattes de ${p0} à ${p1}`);
  }
});

// ---- Freins : disques, étriers, plaquettes et durites du cadre ----

test('freins : un seul type de disque, en zone disques, sans variante', () => {
  const { maillages } = construire(freins);
  const disques = maillages.filter(m => m.userData.zone === 'disques');
  assert.ok(disques.length > 0, 'aucun maillage en zone disques');
  for (const m of maillages) assert.equal('variante' in m.userData, false, m.name || m.userData.role);
  // Une seule piste par roue : il n'y a plus de second disque à montrer en variante.
  assert.equal(parNom(maillages, 'piste').length, 2);
});

test('freins : pistes de 160 mm, une par roue, dans le plan de chaque disque', () => {
  const p = points(GEO), { maillages } = construire(freins);
  const pistes = parNom(maillages, 'piste');
  assert.equal(pistes.length, 2, 'une piste par roue');
  for (const cote of ['avant', 'arrière']) {
    const m = pistes.filter(x => roueDe(x, p) === cote);
    assert.equal(m.length, 1, `piste ${cote}`);
    assert.equal(m[0].userData.zone, 'disques');
    const axe = cote === 'avant' ? p.FA : p.RA;
    const r = sommets(m[0]).map(v => auMoyeu(v, axe));
    assert.ok(Math.abs(Math.max(...r) - GEO.diametreDisque.v / 2) < 0.5, `piste ${cote} : rayon ${Math.max(...r)}`);
    const [z0, z1] = etendueZ(m);
    const plan = -(cote === 'avant' ? GEO.decalageDisqueAvant.v : GEO.decalageDisqueArriere.v);
    assert.ok(Math.abs((z0 + z1) / 2 - plan) < 0.05, `piste ${cote} centrée en ${(z0 + z1) / 2}`);
  }
});

test('freins : le META cite l’étrier BR-RX820, le disque XT et la fiche du CF 8 Di2, plus le SM-RT64', () => {
  for (const id of ['shimano-br-rx820', 'shimano-rt-mt800', 'canyon-4556', 'canyon-4556-en', 'canyon-photo-4556-fv']) {
    assert.ok(freins.META.sources.includes(id), `${id} absent`);
  }
  assert.match(freins.META.nom, /MT800/);
  assert.match(freins.META.nom, /L05A-RF/);
  // Les plaquettes d'origine restent à lire sur la pièce : le nom les dit attendues, pas certaines.
  assert.match(freins.META.nom, /plaquettes à ailettes en résine \(L05A-RF attendues\)/);
  // La page de la gamme Deore XT M8000 servait au CF 7 : la fiche du disque RT-MT800 la remplace.
  assert.ok(!freins.META.sources.includes('shimano-deore-xt-m8000'));
  for (const t of textesDeMeta(freins.META)) assert.ok(!/SM-RT64|RT64|d’origine · /.test(t), `ancien disque dans « ${t} »`);
  // Canyon liste un disque XT, mais propose un disque Ultegra dans ses pièces d'usure : à lire sur la pièce.
  const disque = freins.META.aVerifier.find(t => /disque/.test(t) && /XT/.test(t) && /Ultegra/.test(t));
  assert.ok(disque, 'la contradiction sur le disque n’est pas notée');
  assert.match(disque, /à lire sur la pièce/);
  assert.equal(freins.COTES, undefined, 'l’épaisseur du disque n’a plus de source : elle est approchée');
  assert.ok(freins.META.approche.some(t => /^Épaisseur du disque/.test(t)), 'épaisseur approchée');
});

test('freins : étriers à deux pistons opposés, et plaquettes à ailettes qui dépassent du corps', () => {
  const p = points(GEO), { maillages } = construire(freins);
  for (const [nom, c, plan] of [['étrier avant', p.CF, -GEO.decalageDisqueAvant.v], ['étrier arrière', p.CR, -GEO.decalageDisqueArriere.v]]) {
    const pistons = parNom(maillages, `${nom}, piston`);
    assert.equal(pistons.length, 2, `${nom} : deux logements de piston`);
    const z = pistons.map(m => new THREE.Box3().setFromPoints(sommets(m)).getCenter(new THREE.Vector3()).z - plan);
    assert.ok(z[0] * z[1] < 0, `${nom} : un piston de chaque côté du disque`);
    assert.ok(parNom(maillages, nom).length > 0, `${nom} absent`);
  }
  // Ailettes des plaquettes avant : au-delà du bord du disque et du corps de l'étrier, vers l'extérieur.
  const corps = parNom(maillages, 'étrier avant').flatMap(sommets);
  const rCorps = Math.max(...corps.map(q => auMoyeu(q, p.FA)));
  for (const { groupe } of freins.PLAQUETTES) {
    const ailettes = [];
    groupe.updateMatrixWorld(true);
    groupe.traverse(o => { if (o.isMesh && o.name === 'ailette') ailettes.push(o); });
    assert.ok(ailettes.length > 0, 'plaquette sans ailette');
    const r = Math.max(...ailettes.flatMap(sommets).map(q => auMoyeu(q, p.FA)));
    assert.ok(r > rCorps + 3, `ailette à ${r.toFixed(1)} mm de l’axe, corps de l’étrier à ${rCorps.toFixed(1)}`);
  }
});

test('freins : zones de l’étrier avant, de l’étrier arrière et des durites', () => {
  const { maillages } = construire(freins);
  const zones = new Set(maillages.map(m => m.userData.zone));
  for (const z of zones) assert.ok([null, 'disques', 'etrier', 'manettes'].includes(z), `zone inattendue : ${z}`);
  for (const [nom, zone] of [['étrier avant', 'etrier'], ['étrier arrière', null], ['durite', 'manettes']]) {
    const ms = parNom(maillages, nom);
    assert.ok(ms.length > 0, `${nom} absent`);
    for (const m of ms) assert.equal(m.userData.zone, zone, `${nom} : zone ${m.userData.zone}`);
  }
});

test('freins : PLAQUETTES décrit les deux plaquettes de l’étrier avant', () => {
  const p = points(GEO);
  construire(freins);
  construire(freins); // chaque construction repart d'un tableau vide
  assert.equal(freins.PLAQUETTES.length, 2);
  for (const { groupe, base, dir } of freins.PLAQUETTES) {
    assert.ok(groupe.isGroup, 'groupe : un THREE.Group');
    const ms = [];
    groupe.traverse(o => { if (o.isMesh) ms.push(o); });
    assert.ok(ms.length > 0, 'plaquette vide');
    for (const m of ms) {
      assert.equal(m.userData.zone, 'etrier');
      assert.ok(['pad', 'padFace'].includes(m.userData.role), `rôle ${m.userData.role}`);
    }
    assert.ok(base.isVector3 && dir.isVector3);
    assert.ok(base.equals(groupe.position), 'base : la position de repos du groupe');
    assert.ok(Math.abs(dir.length() - 1) < 1e-9, 'dir unitaire');
    assert.ok(Math.abs(dir.z) < 1e-9, 'dir dans le plan du disque');
    // dir sort du disque en passant par l'étrier : même sens que de l'axe avant vers l'étrier avant.
    const versEtrier = new THREE.Vector3(p.CF[0] - p.FA[0], p.CF[1] - p.FA[1], 0).normalize();
    assert.ok(dir.dot(versEtrier) > 0.99, `dir ${dir.toArray()}`);
  }
  const [a, b] = freins.PLAQUETTES.map(x => x.base.z);
  const plan = -GEO.decalageDisqueAvant.v;
  assert.ok((a - plan) * (b - plan) < 0, 'une plaquette de chaque côté du disque avant');
});

test('freins : la sortie des plaquettes est signalée comme approchée', () => {
  // L'animation de la variante « Plaquettes sorties » choisit un sens et une course : le manuel ne les donne pas.
  const note = freins.META.approche.find(t => /^Sortie des plaquettes/.test(t));
  assert.ok(note, 'aucune note sur la sortie des plaquettes');
  assert.match(note, /sens et course de l’animation approchés/);
  for (const mot of ['clip', 'axe', 'ressort']) assert.ok(note.includes(mot), `« ${mot} » absent de la note`);
});

test('freins : la durite avant sort du fourreau gauche au-dessus de l’étrier, comme sur la photo officielle', () => {
  // Sur la photo de la sacoche de cadre, elle passe dans le fourreau : on ne dessine que sa partie visible.
  assert.ok(freins.META.sources.includes('canyon-photo-4556-rangement'));
  assert.ok(!freins.META.approche.some(t => /ne montrent pas ce trajet/.test(t)));
  const p = points(GEO), { maillages } = construire(freins);
  const d = [p.CROWN[0] - p.FA[0], p.CROWN[1] - p.FA[1]], l = Math.hypot(...d), u = [d[0] / l, d[1] / l];
  const le = q => ((q.x - p.FA[0]) * u[0] + (q.y - p.FA[1]) * u[1]) / l; // part du fourreau, depuis l'axe avant
  const avant = parNom(maillages, 'durite').filter(m => roueDe(m, p) === 'avant');
  assert.equal(avant.length, 1, 'une durite avant');
  const v = sommets(avant[0]), haut = Math.max(...v.map(le));
  assert.ok(haut > 0.3 && haut < 0.55, `la durite avant monte jusqu’à ${haut.toFixed(2)} du fourreau`);
  const passage = parNom(maillages, 'passage de durite');
  assert.equal(passage.length, 1, 'un passage à l’arrière du fourreau');
  // Le passage est au-dessus de l'étrier, et derrière l'axe du fourreau.
  const c = new THREE.Box3().setFromPoints(sommets(passage[0])).getCenter(new THREE.Vector3());
  const hautEtrier = Math.max(...parNom(maillages, 'étrier avant').flatMap(sommets).map(le));
  assert.ok(le(c) > hautEtrier, `passage à ${le(c).toFixed(2)} du fourreau, haut de l’étrier à ${hautEtrier.toFixed(2)}`);
  assert.ok((c.x - p.FA[0]) * -u[1] + (c.y - p.FA[1]) * u[0] > 0, 'le passage n’est pas à l’arrière du fourreau');
});

test('freins : le modèle de l’étrier et les plaquettes d’origine restent à lire sur la pièce', () => {
  assert.ok(freins.META.aVerifier.includes('modèle exact de l\'étrier, à lire sur la pièce'));
  assert.ok(freins.META.aVerifier.some(t => /plaquettes d’origine/.test(t) && /à lire sur la pièce/.test(t)));
});

// ---- Transmission : pédalier, boîtier, cassette, chaîne et dérailleur ----

// « Combination ... 9-11-13-15-17-19-21-24-28-33-39-45T » : fiche Shimano de la CS-M8200-12.
const DENTS_CS_M8200_9_45 = [9, 11, 13, 15, 17, 19, 21, 24, 28, 33, 39, 45];

test('transmission : dentures de la cassette CS-M8200 9-45, celles de la fiche Shimano', () => {
  assert.deepEqual([...transmission.DENTS_CASSETTE], DENTS_CS_M8200_9_45);
  assert.ok(transmission.META.sources.includes('shimano-cs-m8200-12'));
  // Les pignons dessinés : un par denture, du plus petit à l'extérieur au plus grand vers le moyeu.
  const pignons = construire(transmission).maillages.filter(m => /^pignon \d+$/.test(m.name));
  const parZ = pignons.map(m => ({ n: Number(m.name.split(' ')[1]), z: m.position.z })).sort((a, b) => b.z - a.z);
  assert.deepEqual(parZ.map(x => x.n), DENTS_CS_M8200_9_45);
  parZ.forEach(({ z }, k) => {
    assert.ok(Math.abs(z - (GEO.zPetitPignon.v - k * GEO.ecartPignons.v)) < 1e-9, `pignon ${k} en z ${z}`);
  });
});

test('transmission : le META cite le dérailleur, la cassette, le pédalier et la fiche du CF 8 Di2', () => {
  for (const id of ['shimano-rd-m8250-gs', 'shimano-cs-m8200-12', 'shimano-fc-rx820-1', 'canyon-4556', 'canyon-photo-4556-fv']) {
    assert.ok(transmission.META.sources.includes(id), `${id} absent`);
  }
  assert.match(transmission.META.nom, /RD-M8250/);
  assert.match(transmission.META.nom, /CS-M8200/);
  assert.match(transmission.META.nom, /FC-RX820-1/);
  // Canyon dit « Shimano XT » pour la chaîne : sa référence reste à lire.
  assert.ok(transmission.META.aVerifier.some(t => /chaîne/.test(t) && /à lire sur la chaîne/.test(t)));
});

test('transmission : le dérailleur tient la cassette, d’après sa capacité et son grand pignon publiés', () => {
  const { capacite, grandPignonMax, petitPignonMin } = transmission.COTES;
  for (const c of [capacite, grandPignonMax, petitPignonMin]) assert.equal(c.src, 'shimano-rd-m8250-gs');
  assert.deepEqual([capacite.v, grandPignonMax.v, petitPignonMin.v], [36, 45, 9]);
  const D = transmission.DENTS_CASSETTE, petit = D[0], grand = D[D.length - 1];
  assert.ok(grand <= grandPignonMax.v && petit >= petitPignonMin.v, `cassette ${petit}-${grand}`);
  assert.ok(grand - petit <= capacite.v, `écart de ${grand - petit} dents pour une capacité de ${capacite.v}`);
  assert.ok(D.includes(GEO.dentsPignonDessine.v), 'la chaîne est dessinée sur un pignon de la cassette');
});

test('transmission : ni gaine ni fil, et la batterie est logée dans le dérailleur', () => {
  const { maillages } = construire(transmission);
  for (const m of maillages) {
    assert.notEqual(m.userData.role, 'housing', `${m.name} : une gaine`);
    assert.ok(!/gaine|fil/.test(m.name), `${m.name}`);
  }
  const batterie = parNom(maillages, 'batterie'), corps = parNom(maillages, 'corps du dérailleur');
  assert.equal(batterie.length, 1, 'une batterie');
  assert.equal(corps.length, 1, 'un corps de dérailleur');
  // Dans le corps seul, pas dans la chape ni les galets : en z, entre ses deux faces ; de profil, dans son contour.
  const vc = sommets(corps[0]), vb = sommets(batterie[0]);
  const [z0, z1] = [Math.min(...vc.map(q => q.z)), Math.max(...vc.map(q => q.z))];
  assert.ok(vb.every(q => q.z > z0 && q.z < z1), 'la batterie dépasse des faces du corps');
  const contour = transmission.CORPS_DERAILLEUR.map(([x, y]) => [x + points(GEO).RA[0], y + points(GEO).RA[1]]);
  const dedans = (x, y) => {
    let n = false;
    for (let i = 0, j = contour.length - 1; i < contour.length; j = i++) {
      const [xi, yi] = contour[i], [xj, yj] = contour[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) n = !n;
    }
    return n;
  };
  for (const q of vb) assert.ok(dedans(q.x, q.y), `la batterie sort du contour du corps en ${q.x.toFixed(1)}, ${q.y.toFixed(1)}`);
  assert.ok(transmission.META.sources.includes('shimano-bt-dn320'), 'la batterie a sa source');
});

test('transmission : le boîtier lit la largeur de boîte de GEO, 43,25 mm de chaque côté', () => {
  assert.equal(transmission.COTES.largeurBoite, undefined, 'une seule largeur de boîte : GEO.largeurBoite');
  const cuvettes = parNom(construire(transmission).maillages, 'boîtier');
  assert.equal(cuvettes.length, 2);
  const faces = cuvettes.map(m => {
    const z = sommets(m).map(v => Math.abs(v.z));
    return Math.min(...z);
  });
  for (const f of faces) assert.ok(Math.abs(f - GEO.largeurBoite.v / 2) < 0.01, `cuvette contre la boîte en ${f}`);
});

test('transmission : pédalier et dérailleur dans leurs zones (ateliers 1.6 et 1.7), le reste sans zone', () => {
  // Le pédalier : plateau, araignée et manivelles, leur axe et le capuchon ; les cuvettes du boîtier, pressées dans le
  // cadre, n'en sont pas. Le dérailleur entier, avec sa batterie BT-DN320. Cassette et chaîne restent sans zone.
  const pedalier = ['plateau', 'manivelle droite', 'manivelle gauche', 'capuchon', 'axe de pédalier'];
  const derailleur = ['dérailleur', 'corps du dérailleur', 'batterie', 'galet'];
  const { maillages } = construire(transmission);
  for (const nom of [...pedalier, ...derailleur, 'boîtier', 'chaîne']) {
    assert.ok(parNom(maillages, nom).length > 0, `${nom} absent`);
  }
  for (const m of maillages) {
    const attendue = pedalier.includes(m.name) ? 'pedalier' : derailleur.includes(m.name) ? 'derailleur' : null;
    assert.equal(m.userData.zone, attendue, `${m.name || m.userData.role} : zone ${m.userData.zone}`);
    assert.equal('variante' in m.userData, false);
  }
});

test('transmission : plateau de 40 dents sur la ligne de chaîne de la FC-RX820-1', () => {
  const p = points(GEO), plateau = parNom(construire(transmission).maillages, 'plateau');
  assert.equal(plateau.length, 1);
  const v = sommets(plateau[0]), [z0, z1] = etendueZ(plateau);
  assert.ok(Math.abs((z0 + z1) / 2 - GEO.ligneChaine.v) < 1e-6, `plateau centré en z ${(z0 + z1) / 2}`);
  const r = Math.max(...v.map(q => auMoyeu(q, p.BB)));
  assert.ok(r > p.rayons.plateau && r < p.rayons.plateau + 5, `rayon extérieur ${r}`);
});

test('transmission : manivelles de 165 mm, facteur Q de 151 mm', () => {
  const p = points(GEO), { maillages } = construire(transmission);
  for (const [nom, bout, signe] of [['manivelle droite', p.PR, 1], ['manivelle gauche', p.PL, -1]]) {
    const v = parNom(maillages, nom).flatMap(sommets);
    assert.ok(v.length > 0, `${nom} absente`);
    // Face extérieure au bout de la manivelle : la moitié du facteur Q de chaque côté.
    const z = v.map(q => signe * q.z);
    assert.ok(Math.abs(Math.max(...z) - 151 / 2) < 0.05, `${nom} : face extérieure à ${Math.max(...z)}`);
    // L'œil de la pédale est centré au bout de la manivelle de 165 : le point le plus loin de l'axe est dans son axe.
    const loin = v.reduce((a, q) => auMoyeu(q, p.BB) > auMoyeu(a, p.BB) ? q : a);
    const angle = Math.atan2(loin.y - p.BB[1], loin.x - p.BB[0]) - Math.atan2(bout[1] - p.BB[1], bout[0] - p.BB[0]);
    assert.ok(Math.abs(Math.atan2(Math.sin(angle), Math.cos(angle))) < 0.05, `${nom} : orientée vers son bout`);
    const d = auMoyeu(loin, p.BB);
    assert.ok(d > 165 && d < 165 + 15, `${nom} : bout à ${d}`);
  }
});

test('transmission : galets de 13 dents aux deux poulies du dérailleur, dans le plan de la chaîne', () => {
  const p = points(GEO), galets = parNom(construire(transmission).maillages, 'galet');
  assert.equal(galets.length, 2);
  for (const c of [p.poulieHaute, p.poulieBasse]) {
    const g = galets.filter(m => Math.hypot(m.position.x - c[0], m.position.y - c[1]) < 1e-6);
    assert.equal(g.length, 1, `galet en ${c}`);
    const r = Math.max(...sommets(g[0]).map(q => auMoyeu(q, c)));
    assert.ok(r > p.rayons.poulie && r < p.rayons.poulie + 4, `rayon extérieur ${r}`);
  }
});

test('transmission : plateau, chaîne et manivelles passent à distance du cadre', () => {
  const noms = ['plateau', 'chaîne', 'manivelle droite', 'manivelle gauche'];
  const pieces = construire(transmission).maillages.filter(m => noms.includes(m.name));
  for (const nom of noms) assert.ok(pieces.some(m => m.name === nom), `${nom} absent`);
  const nuage = pieces.flatMap(m => echantillons(m, 1.5));
  const boite = new THREE.Box3().setFromPoints(nuage).expandByScalar(5);
  const cadreNuage = construire(cadre).maillages.flatMap(m => echantillons(m, 1.5, boite));
  const { mini, ou } = distanceMini(nuage, cadreNuage, 3);
  assert.ok(mini >= 2, `à ${mini.toFixed(2)} mm du cadre en ${ou?.toArray().map(Math.round)}`);
});

// ---- Poste de pilotage : jeu de direction, potence, cintre, ruban, cocottes, leviers et durites ----

test('poste : la main publiée est posée au-dessus du repose-main de chaque cocotte, dans sa longueur', () => {
  // Canyon publie la position de la main posée sur la cocotte. Sur la photo officielle, elle tombe au-dessus du
  // repose-main, à peu près d'une épaisseur de main : entre deux et cinq centimètres au-dessus de son dessus.
  const p = points(GEO), { maillages } = construire(poste);
  for (const [nom, main] of [['cocotte droite', p.ancres.mains], ['cocotte gauche', p.ancres.cocotteGauche]]) {
    const ms = parNom(maillages, nom);
    assert.ok(ms.length > 0, `${nom} absente`);
    const x = ms.flatMap(sommets).map(q => q.x);
    assert.ok(main[0] > Math.min(...x) && main[0] < Math.max(...x), `${nom} : la main n’est pas au-dessus de la cocotte`);
    // La main est dans la moitié arrière de la cocotte, sur le repose-main, pas sur la corne.
    assert.ok(main[0] < (Math.min(...x) + Math.max(...x)) / 2, `${nom} : la main est sur la corne`);
    let dessus = -Infinity;
    for (const m of ms) surFaces(m, 1, q => {
      if (Math.abs(q.x - main[0]) <= 1.5 && Math.abs(q.z - main[2]) <= 1.5) dessus = Math.max(dessus, q.y);
    });
    const ecart = main[1] - dessus;
    assert.ok(ecart >= 20 && ecart <= 50, `${nom} : la main est à ${ecart.toFixed(1)} mm au-dessus du repose-main`);
  }
});

test('poste : la cocotte est posée comme sur la photo officielle, le cintre à peine tourné', () => {
  // Pose lue sur la photo : la cocotte sur le coude du cintre, pas sur sa partie haute, presque à plat.
  const pose = poste.poseCintre(points(GEO), GEO);
  const tC = pose.local.tC * 180 / Math.PI, angle = pose.angle * 180 / Math.PI;
  assert.ok(tC > 30 && tC < 60, `cocotte à ${tC.toFixed(1)}° sur la courbe`);
  assert.ok(angle > 0 && angle < 12, `cocotte inclinée de ${angle.toFixed(1)}°`);
  // L'axe du cintre ne revient jamais en arrière, sous la cocotte comme ailleurs : deux tronçons qui se suivent vont
  // dans le même sens.
  const pts = pose.points;
  for (let i = 1; i < pts.length - 1; i++) {
    const u = pts[i].map((v, k) => v - pts[i - 1][k]), w = pts[i + 1].map((v, k) => v - pts[i][k]);
    assert.ok(u.reduce((s, v, k) => s + v * w[k], 0) > 0, `le cintre revient en arrière au point ${i}`);
  }
});

test('poste : cocottes, leviers et durites en zone manettes, le reste en zone poste, sans variante', () => {
  // La zone poste (atelier 1.3) : capot et entretoise du jeu de direction, potence et capuchon, cintre, ruban, embouts.
  const { maillages } = construire(poste);
  const manettes = ['cocotte droite', 'cocotte gauche', 'levier', 'palette', 'durite'];
  for (const nom of [...manettes, 'jeu de direction', 'potence', 'cintre', 'collier du cintre', 'embout de cintre']) {
    assert.ok(parNom(maillages, nom).length > 0, `${nom} absent`);
  }
  for (const m of parNom(maillages, 'durite')) assert.equal(m.userData.role, 'hose');
  for (const m of maillages) {
    assert.equal('variante' in m.userData, false);
    const attendue = manettes.includes(m.name) ? 'manettes' : 'poste';
    assert.equal(m.userData.zone, attendue, `${m.name || m.userData.role} : zone ${m.userData.zone}`);
  }
});

test('poste : manettes ST-RX825 des deux côtés, sans gaine, une durite par manette', () => {
  const { maillages } = construire(poste);
  for (const id of ['shimano-st-rx825', 'canyon-4556', 'canyon-photo-4556-fv']) {
    assert.ok(poste.META.sources.includes(id), `${id} absent`);
  }
  assert.match(poste.META.nom, /ST-RX825/);
  assert.match(poste.META.nom, /gauche ST-RX825-L ou BL-RX825-L, à lire sur la pièce/);
  for (const c of ['collierCocotteMin', 'collierCocotteMax']) assert.equal(poste.COTES[c].src, 'shimano-st-rx825', c);
  // Manettes sans fil : aucune gaine de dérailleur ne part du cintre.
  for (const m of maillages) assert.notEqual(m.userData.role, 'housing', m.name);
  assert.equal(parNom(maillages, 'gaine').length, 0);
  const durites = parNom(maillages, 'durite');
  assert.equal(durites.length, 2, 'une durite par manette');
  // Chaque côté : un levier de frein et une palette plus petite derrière lui.
  for (const s of [1, -1]) {
    const cote = m => Math.sign(new THREE.Box3().setFromPoints(sommets(m)).getCenter(new THREE.Vector3()).z) === s;
    const levier = parNom(maillages, 'levier').filter(cote), palette = parNom(maillages, 'palette').filter(cote);
    assert.equal(levier.length, 1, `levier côté ${s}`);
    assert.equal(palette.length, 1, `palette côté ${s}`);
    const taille = m => new THREE.Box3().setFromPoints(sommets(m)).getSize(new THREE.Vector3()).length();
    assert.ok(taille(palette[0]) < taille(levier[0]), 'la palette est plus petite que le levier');
  }
  // La manette gauche est nommée ST-RX825 par la fiche : ses boutons restent à lire sur la pièce.
  assert.ok(poste.META.aVerifier.some(t => /manette gauche/.test(t) && /boutons/.test(t)));
});

test('poste : les durites entrent dans le haut de la direction, devant le pivot, sous la potence', () => {
  const p = points(GEO), durites = parNom(construire(poste).maillages, 'durite');
  const axe = Math.hypot(...p.dHT), d = [p.dHT[0] / axe, p.dHT[1] / axe];
  for (const m of durites) {
    // Chaque sommet : le long du pivot depuis le haut de la douille, et devant le pivot (négatif : derrière).
    const v = sommets(m).map(q => {
      const x = q.x - p.HTt[0], y = q.y - p.HTt[1];
      return { le: x * d[0] + y * d[1], devant: x * d[1] - y * d[0] };
    });
    // Le bout de la durite qui descend au capot : à moins d'un rayon de douille du pivot, sous la potence.
    const capot = v.filter(q => Math.abs(q.devant) < 26.5 && q.le < 25);
    assert.ok(capot.length > 0, 'la durite n’arrive pas au capot du jeu de direction');
    const bas = capot.reduce((a, q) => (q.le < a.le ? q : a));
    assert.ok(bas.le > 0 && bas.le < 20, `durite : entrée à ${bas.le.toFixed(1)} mm au-dessus de la douille`);
    // L'entrée est devant le pivot, sous la potence.
    assert.ok(capot.every(q => q.devant > 0), 'la durite passe derrière le pivot');
  }
});

test('poste : cintre serré dans la potence au centre du collier, diamètre 31,8 mm', () => {
  const p = points(GEO), collier = parNom(construire(poste).maillages, 'collier du cintre');
  assert.equal(collier.length, 1);
  const r = sommets(collier[0]).map(q => auMoyeu(q, p.S1));
  assert.ok(Math.abs(Math.max(...r) - 31.8 / 2) < 0.05, `rayon ${Math.max(...r)}`);
  const [z0, z1] = etendueZ(collier);
  assert.ok(Math.abs(z0 + z1) < 1e-6, 'centré sur le plan du vélo');
});

test('poste : cintre de 510 mm au bout des drops, un embout de chaque côté', () => {
  const embouts = parNom(construire(poste).maillages, 'embout de cintre');
  assert.equal(embouts.length, 2);
  const centre = m => new THREE.Box3().setFromPoints(sommets(m)).getCenter(new THREE.Vector3()).z;
  const centres = embouts.map(centre).sort((a, b) => a - b);
  assert.ok(Math.abs(centres[0] + 510 / 2) < 1 && Math.abs(centres[1] - 510 / 2) < 1, `embouts en z ${centres}`);
});

test('photo officielle : vis du plateau sombres, matière de la piste réservée à la piste', () => {
  // Sur canyon-photo-4556-fv, les têtes de vis du plateau sont sombres, à peine visibles, et la bande d'ailettes du
  // disque est claire, plus claire que la piste.
  const vis = construire(transmission).maillages.filter(m => m.name === 'manivelle droite'
    && m.geometry.type === 'CylinderGeometry' && m.geometry.parameters.radialSegments === 6);
  assert.equal(vis.length, 4, 'quatre vis de plateau');
  for (const m of vis) assert.notEqual(m.userData.role, 'steel', 'vis du plateau en acier clair');
  for (const m of construire(freins).maillages) {
    if (m.userData.role === 'rotor') assert.equal(m.name, 'piste', `matière de la piste sur « ${m.name || 'sans nom'} »`);
  }
});

test('META : les écarts avec la photo officielle relevés le 24/10/2026 sont dits, pièce par pièce', () => {
  const trouve = (meta, motif) => [...meta.approche, ...meta.aVerifier].find(t => motif.test(t));
  // Comparaison avec canyon-photo-4556-fv, vue d'ensemble de l'accueil et profil.
  for (const [meta, motif] of [
    [cadre.META, /^Peinture : .*lie-de-vin/],
    [cadre.META, /^Marquages du cadre et de la fourche : .*CANYON.*GRIZL/],
    [transmission.META, /^Pédales : .*Non inclus/],
    [transmission.META, /^Cassette : .*se fondent en un seul disque/],
    [transmission.META, /^Chaîne : .*maillons ne se distinguent pas/],
    [poste.META, /^Inclinaison des cocottes : .*photo officielle/],
  ]) assert.ok(trouve(meta, motif), `${meta.id} : ${motif}`);
  const tube = cadre.META.aVerifier.find(t => /^angle du tube de selle/.test(t));
  assert.ok(tube, 'tube de selle plus redressé sur la photo');
  assert.match(tube, /perspective ou retouche/);
  // La chaîne : la liste de Canyon dit seulement Shimano XT, ses pièces d'usure en proposent une.
  assert.match(transmission.META.aVerifier.find(t => /^référence de la chaîne/.test(t)), /pièces d’usure/);
});
