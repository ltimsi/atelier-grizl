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

  test(`${nom} : laisse les outils sans zone ni variante`, () => {
    const { outils } = construire(module);
    const temoin = outils.ell([0, 0, 0], [1, 1, 1], 'paint');
    assert.equal(temoin.userData.zone, null);
    assert.equal(temoin.userData.variante, null);
  });
}

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

test('cadre : la selle SRX fait 148 mm de large', () => {
  const selle = parNom(construire(cadre).maillages, 'selle');
  assert.equal(selle.length, 1);
  const z = sommets(selle[0]).map(v => v.z);
  assert.ok(Math.abs(Math.max(...z) - Math.min(...z) - 148) < 0.5, `largeur de ${Math.max(...z) - Math.min(...z)} mm`);
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

test('roues : aucune zone, aucune variante', () => {
  for (const m of construire(roues).maillages) {
    assert.equal(m.userData.zone, null, `${m.name || m.userData.role} : zone ${m.userData.zone}`);
    assert.equal(m.userData.variante, null);
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

test('roues : jantes de 26 mm de haut et 24 mm de large à l’intérieur, siège à 622', () => {
  const p = points(GEO), { maillages } = construire(roues), siege = GEO.diametreSiegeJante.v / 2;
  const jantes = parNom(maillages, 'jante');
  assert.equal(jantes.length, 2);
  for (const m of jantes) {
    const axe = roueDe(m, p) === 'avant' ? p.FA : p.RA;
    const v = sommets(m), r = v.map(q => auMoyeu(q, axe));
    assert.ok(Math.abs(Math.max(...r) - Math.min(...r) - 26) < 0.05, `hauteur de ${Math.max(...r) - Math.min(...r)} mm`);
    // Au siège du talon, la face intérieure des flancs est à 12 mm de chaque côté du plan de la roue.
    const auSiege = v.filter((q, i) => Math.abs(r[i] - siege) < 0.05).map(q => q.z);
    for (const s of [-1, 1]) assert.ok(auSiege.some(z => Math.abs(z - s * 12) < 0.05), `pas de face intérieure en z ${s * 12}`);
  }
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

test('freins : disques d’origine et XT, deux variantes de la zone disques', () => {
  const { maillages } = construire(freins);
  for (const k of [0, 1]) {
    const disques = maillages.filter(m => m.userData.variante?.zone === 'disques' && m.userData.variante.k === k);
    assert.ok(disques.length > 0, `aucun maillage pour k = ${k}`);
    for (const m of disques) assert.equal(m.userData.zone, 'disques');
  }
  for (const m of maillages) if (m.userData.variante) assert.equal(m.userData.variante.zone, 'disques');
});

test('freins : pistes de 160 mm, dans le plan de chaque disque, pour les deux variantes', () => {
  const p = points(GEO), { maillages } = construire(freins);
  const pistes = parNom(maillages, 'piste');
  for (const k of [0, 1]) for (const cote of ['avant', 'arrière']) {
    const m = pistes.filter(x => x.userData.variante.k === k && roueDe(x, p) === cote);
    assert.equal(m.length, 1, `piste ${cote} k = ${k}`);
    const axe = cote === 'avant' ? p.FA : p.RA;
    const r = sommets(m[0]).map(v => auMoyeu(v, axe));
    assert.ok(Math.abs(Math.max(...r) - GEO.diametreDisque.v / 2) < 0.5, `piste ${cote} k = ${k} : rayon ${Math.max(...r)}`);
    const [z0, z1] = etendueZ(m);
    const plan = -(cote === 'avant' ? GEO.decalageDisqueAvant.v : GEO.decalageDisqueArriere.v);
    assert.ok(Math.abs((z0 + z1) / 2 - plan) < 0.05, `piste ${cote} k = ${k} centrée en ${(z0 + z1) / 2}`);
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

test('freins : le modèle de l’étrier reste à lire sur la pièce', () => {
  assert.ok(freins.META.aVerifier.includes('modèle exact de l\'étrier, à lire sur la pièce'));
});

// ---- Transmission : pédalier, boîtier, cassette, chaîne et dérailleur ----

const DENTS_CS_M7100_10_45 = [10, 12, 14, 16, 18, 21, 24, 28, 32, 36, 40, 45]; // fiche Shimano de la CS-M7100-12

test('transmission : dentures de la cassette CS-M7100 10-45, celles de la fiche Shimano', () => {
  assert.deepEqual([...transmission.DENTS_CASSETTE], DENTS_CS_M7100_10_45);
  assert.ok(transmission.META.sources.includes('shimano-cs-m7100-12'));
  // Les pignons dessinés : un par denture, du plus petit à l'extérieur au plus grand vers le moyeu.
  const pignons = construire(transmission).maillages.filter(m => /^pignon \d+$/.test(m.name));
  const parZ = pignons.map(m => ({ n: Number(m.name.split(' ')[1]), z: m.position.z })).sort((a, b) => b.z - a.z);
  assert.deepEqual(parZ.map(x => x.n), DENTS_CS_M7100_10_45);
  parZ.forEach(({ z }, k) => {
    assert.ok(Math.abs(z - (GEO.zPetitPignon.v - k * GEO.ecartPignons.v)) < 1e-9, `pignon ${k} en z ${z}`);
  });
});

test('transmission : la fiche Canyon qui donne la chape courte est une source du dérailleur', () => {
  assert.ok(transmission.META.sources.includes('canyon-4553'));
  assert.ok(transmission.META.sources.includes('shimano-rd-rx822-gs'));
});

test('transmission : aucune zone, aucune variante', () => {
  for (const m of construire(transmission).maillages) {
    assert.equal(m.userData.zone, null, `${m.name || m.userData.role} : zone ${m.userData.zone}`);
    assert.equal(m.userData.variante, null);
  }
});

test('transmission : plateau de 40 dents sur la ligne de chaîne de la FC-RX610-1', () => {
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

test('poste : la main tombe sur le dessus de chaque cocotte, au point publié par Canyon', () => {
  const p = points(GEO), { maillages } = construire(poste);
  for (const [nom, main] of [['cocotte droite', p.ancres.mains], ['cocotte gauche', p.ancres.cocotteGauche]]) {
    const ms = parNom(maillages, nom);
    assert.ok(ms.length > 0, `${nom} absente`);
    // Le point de saisie est un sommet de la cocotte, posé exactement sur la main : en x, en y et en z.
    // Le dessus est presque plat et porte un sommet tous les cinq ou six millimètres : une tolérance de l'ordre du
    // millimètre laisserait passer une cocotte décalée d'une section. On exige donc le sommet lui-même.
    const M = new THREE.Vector3(...main);
    const pres = Math.min(...ms.flatMap(sommets).map(q => q.distanceTo(M)));
    assert.ok(pres <= 0.05, `${nom} : sommet le plus proche de la main à ${pres.toFixed(3)} mm`);
    // Et ce point est bien sur le dessus de la cocotte.
    let dessus = -Infinity;
    for (const m of ms) surFaces(m, 1, q => {
      if (Math.abs(q.x - main[0]) <= 1.5 && Math.abs(q.z - main[2]) <= 1.5) dessus = Math.max(dessus, q.y);
    });
    assert.ok(Math.abs(dessus - main[1]) <= 2, `${nom} : dessus à ${dessus}, main à ${main[1]}`);
  }
});

test('poste : cocottes, leviers et durites en zone manettes, le reste sans zone ni variante', () => {
  const { maillages } = construire(poste);
  const manettes = ['cocotte droite', 'cocotte gauche', 'levier', 'durite'];
  for (const nom of manettes) assert.ok(parNom(maillages, nom).length > 0, `${nom} absent`);
  for (const m of parNom(maillages, 'durite')) assert.equal(m.userData.role, 'hose');
  for (const m of maillages) {
    assert.equal(m.userData.variante, null);
    const attendue = manettes.includes(m.name) ? 'manettes' : null;
    assert.equal(m.userData.zone, attendue, `${m.name || m.userData.role} : zone ${m.userData.zone}`);
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
