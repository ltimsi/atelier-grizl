// Outils de construction de la scène 3D : tubes, ellipsoïdes, boîtes arrondies, boulons, extrusions, engrenages,
// tubes courbes et solides de révolution. Un outil qui crée un maillage l'ajoute au groupe et l'étiquette.
//
// Repère : celui de geometrie.js, en millimètres. x vers l'avant, y vers le haut, z vers la droite du cycliste.
// Module testable sous Node : three.js et RoundedBoxGeometry arrivent en paramètres, jamais par import.

// Contour d'un engrenage à n dents, à plat dans le plan x y. Quatre points par dent : pied, deux pointes, pied.
function pointsEngrenage(n, rPointe, rPied) {
  const o = [], d = 2 * Math.PI / n;
  for (let i = 0; i < n; i++) { const a = i * d; o.push([rPied, a], [rPointe, a + d * .3], [rPointe, a + d * .55], [rPied, a + d * .85]); }
  return o.map(([r, a]) => [r * Math.cos(a), r * Math.sin(a)]);
}

/**
 * Les outils de construction de la scène. Ils ne gardent qu'un état : la zone et la variante en cours.
 * Tout maillage créé reçoit userData = { role, zone, variante } et rejoint `groupe`.
 * Les signatures sont celles de la maquette. Seuls boulon, engrenage et tubeCourbe changent de nom.
 * @param {object} THREE Le module three.js.
 * @param {Function} RoundedBoxGeometry La classe de three/addons/geometries/RoundedBoxGeometry.js.
 * @param {object} groupe Le THREE.Group qui reçoit les maillages.
 * @param {{reel: Object<string, object>}} materiaux Le résultat de creerMateriaux : seul le jeu `reel` sert ici.
 * @returns {object} Les outils :
 *   zone(id | null) : zone des prochains maillages (celle qu'on surligne dans l'atelier) ;
 *   variante({ zone, k } | null) : variante des prochains maillages, visible seulement si la zone est sur k ;
 *   mesh(geo, role), inst(geo, role, n) : un maillage, une InstancedMesh de n instances ;
 *   tube(a, b, r1, r2, role, { seg, open, sx, sz }) : cône tronqué de a (rayon r1) à b (rayon r2), aplatissable par sx et sz ;
 *   tubeZ([x, y], z0, z1, r, role, seg) : tube parallèle à z ;
 *   ell([x, y, z], [sx, sy, sz], role, rotZ) : ellipsoïde ;
 *   rbox([x, y, z], [l, h, p], rotZ, role, rayon) : boîte à arêtes arrondies ;
 *   boulon([x, y, z], dir, r, l, role) : hexagone d'axe dir ;
 *   extr(forme, profondeur, role, biseau) : forme extrudée, centrée sur z ;
 *   engrenage(n, rPointe, rPied, trou, fenetres) : THREE.Shape d'un pignon, fenetres = { n, gap, r0, r1 } ;
 *   tubeCourbe(points, r, role, seg) : tube qui suit une courbe de Catmull-Rom ;
 *   lathe(profil, seg, role) : solide de révolution autour de z, profil = [[rayon, z], ...].
 */
export function creerOutils(THREE, RoundedBoxGeometry, groupe, materiaux) {
  let zoneCourante = null, varianteCourante = null;
  const Yv = new THREE.Vector3(0, 1, 0);

  const matiere = role => {
    const m = materiaux.reel[role];
    if (!m) throw new Error(`Rôle de matière inconnu : ${role}`);
    return m;
  };
  const etiqueter = (m, role) => {
    m.userData = { role, zone: zoneCourante, variante: varianteCourante };
    groupe.add(m);
    return m;
  };

  const zone = id => { zoneCourante = id ?? null; };
  const variante = v => { varianteCourante = v ? Object.freeze({ zone: v.zone, k: v.k }) : null; };

  const mesh = (geo, role) => etiqueter(new THREE.Mesh(geo, matiere(role)), role);
  const inst = (geo, role, n) => etiqueter(new THREE.InstancedMesh(geo, matiere(role), n), role);

  function tube(a, b, r1, r2, role, o = {}) {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A), l = d.length();
    const g = new THREE.CylinderGeometry(r2, r1, l, o.seg || 32, 1, !!o.open);
    if (o.sx || o.sz) g.scale(o.sx || 1, 1, o.sz || 1);
    const m = mesh(g, role);
    m.position.copy(A).add(B).multiplyScalar(.5);
    m.quaternion.setFromUnitVectors(Yv, d.normalize());
    return m;
  }
  const tubeZ = (p, z0, z1, r, role, seg = 32) => tube([p[0], p[1], z0], [p[0], p[1], z1], r, r, role, { seg });

  function ell(p, s, role, rotZ = 0) {
    const m = mesh(new THREE.SphereGeometry(1, 32, 20), role);
    m.position.set(...p);
    m.scale.set(...s);
    m.rotation.z = rotZ;
    return m;
  }

  function rbox(c, s, rot, role, rad) {
    const m = mesh(new RoundedBoxGeometry(s[0], s[1], s[2], 3, rad), role);
    m.position.set(...c);
    m.rotation.z = rot;
    return m;
  }

  function boulon(p, dir, r = 3.2, l = 3, role = 'steel') {
    const m = mesh(new THREE.CylinderGeometry(r, r, l, 6), role);
    m.position.set(...p);
    m.quaternion.setFromUnitVectors(Yv, new THREE.Vector3(...dir).normalize());
    return m;
  }

  function extr(forme, profondeur, role, biseau = 0) {
    const g = new THREE.ExtrudeGeometry(forme, {
      depth: profondeur, bevelEnabled: biseau > 0, bevelThickness: biseau, bevelSize: biseau, bevelSegments: 3, curveSegments: 24,
    });
    g.translate(0, 0, -profondeur / 2);
    return mesh(g, role);
  }

  function engrenage(n, rPointe, rPied, trou, fenetres) {
    const s = new THREE.Shape();
    pointsEngrenage(n, rPointe, rPied).forEach((p, i) => i ? s.lineTo(p[0], p[1]) : s.moveTo(p[0], p[1]));
    s.closePath();
    if (trou) { const h = new THREE.Path(); h.absarc(0, 0, trou, 0, Math.PI * 2, true); s.holes.push(h); }
    if (fenetres) for (let i = 0; i < fenetres.n; i++) {
      const a0 = i / fenetres.n * Math.PI * 2 + fenetres.gap, a1 = (i + 1) / fenetres.n * Math.PI * 2 - fenetres.gap, h = new THREE.Path();
      h.absarc(0, 0, fenetres.r1, a0, a1, false); h.absarc(0, 0, fenetres.r0, a1, a0, true); h.closePath(); s.holes.push(h);
    }
    return s;
  }

  const tubeCourbe = (points, r, role, seg = 64) =>
    mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))), seg, r, 12, false), role);

  function lathe(profil, seg, role) {
    const g = new THREE.LatheGeometry(profil.map(([r, z]) => new THREE.Vector2(r, z)), seg);
    g.rotateX(Math.PI / 2);
    return mesh(g, role);
  }

  return { zone, variante, mesh, inst, tube, tubeZ, ell, rbox, boulon, extr, engrenage, tubeCourbe, lathe };
}
