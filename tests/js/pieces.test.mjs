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

const PIECES = [cadre];

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

// Sommets d'un maillage, en coordonnées du monde.
function sommets(m) {
  const pos = m.geometry.attributes.position, o = [];
  for (let i = 0; i < pos.count; i++) o.push(new THREE.Vector3().fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld));
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
