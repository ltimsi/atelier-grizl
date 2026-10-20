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

const PIECES = [cadre, roues, freins];

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
