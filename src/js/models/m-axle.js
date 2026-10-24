/* Atelier Grizl : roue avant du Grizl CF 8 Di2 (4556, taille M) dans sa fourche, pour l'atelier 1.5 « Roues et axes ».
   Bas de la fourche FK0143 (rigide, axe de 12 x 100 mm, en carbone), moyeu avant DT Swiss 350 de la roue Canyon GR 30
   CF (Center Lock, 24 rayons droits), disque Deore XT MT800 de 160 mm (fiche suisse ; l'onglet des pièces d'usure de
   la fiche anglaise propose un RT-CL800 : modèle à lire sur la pièce) et sa bague, étrier flat mount simplifié et sa
   durite, axe traversant de 12 x 100 mm.
   L'axe : la liste des composants dit « Canyon Through Axle », en aluminium ; le guide Canyon (QSG R126 V02, p.15 et
   16) dessine une tête marquée « DT SWISS », serrée à la clé de 6 mm ; la photo de la pièce de rechange GP0197-02
   montre un axe à levier. Type d'axe et forme de sa tête : à lire sur la pièce. Il est dessiné comme le guide : une
   tête ronde à six-pans creux de 6 mm, sans inscription. Couple : 10-15 Nm, clé de 6 mm, ligne « RIGID FORK 10-15 NM »
   du tableau de l'étape 5.7 (p.16) ; la fourche FK0143 est sans suspension d'après la liste des composants, à
   confirmer sur ton vélo. Pour serrer : la TW-6.2 et un embout six-pans de 6 mm au carré de 3/8 de pouce.
   Curseur « Pose de l'axe » : l'axe traverse la patte côté disque et le moyeu, puis se visse dans la patte opposée ;
   au bout, l'embout de 6 mm. Vue éclatée : l'axe sort, puis la roue descend, et la cale de transport de l'étrier
   apparaît (étape 5.4 : la retirer avant de poser la roue, sans serrer le levier de frein).
   Cotes reprises de la scène de l'accueil (src/scene/geometrie.js, pieces/roues.js, cadre.js et freins.js) : axe de
   12 mm, écartement de 100 mm entre les pattes, disque de 160 mm, 24 rayons ; valeurs de dessin de la scène pour les
   flasques, les fourreaux, les pattes, la place du disque, le trajet de la durite et la tête de l'axe.
   Formes approchées (aucune cote publiée dans les documents cités) :
   - fourreaux, pattes et leurs portées : forme approchée, comme dans la scène ; peinture Floating Violet de la scène
     sans ses veines (teinte approchée) ; insert de la patte opposée : forme approchée ;
   - moyeu : corps, flasques, épaulement, cannelures Center Lock et embouts en forme approchée, comme dans la scène ;
     couleur noire approchée ;
   - rayons : nombre publié, profil plat et croisement de la scène ; jante, pneu et bout des rayons non dessinés, les
     rayons s'estompent ;
   - disque : piste, fentes, araignée, rivets, ailettes et flèche en forme approchée, comme le disque de 2.2
     (m-rotor.js, mêmes constantes, épinglées par un test) ; épaisseur approchée ;
   - bague Center Lock : dessinée à denture extérieure, l'un des deux types possibles ; type à lire sur la pièce ;
   - étrier : simplifié comme dans la scène (deux moitiés, logements des pistons, pont, plaquettes à ailettes, axe,
     vis de purge et raccord) ; support flat mount et vis : place et forme approchées ; place de l'étrier autour du
     moyeu approchée : à 160° autour du moyeu, au lieu des 146° de la scène (geometrie.js), pour ne pas entrer dans le
     fourreau dessiné ;
   - cale de transport : forme approchée ; elle est en orange comme sur le dessin du guide, qui colore ainsi chaque
     pièce travaillée, sa couleur réelle est à lire sur la pièce ;
   - durite et son passage dans le fourreau : grosseur et trajet approchés, comme dans la scène ;
   - axe : longueur, tête, six-pans, filetage et son pas approchés ; côté d'entrée de l'axe, côté disque comme dans
     la scène, à regarder sur le dessin du guide imprimé et sur ton vélo ; couleur noire approchée ;
   - embout de 6 mm et son porte-embout : forme approchée ;
   - couleurs, toutes approchées : piste du disque en acier gris, ailettes gris métal, araignée noire, bague gris foncé,
     rivets acier, flèche blanche ; étrier noir, plaques des plaquettes en métal clair, garnitures brun foncé ; durite
     noire ; rayons noirs ; moyeu, axe et insert noirs ; aucun document cité ne donne ces teintes.
   Repère : x vers l'avant, y vers le haut, z vers la droite du cycliste (disque à gauche, en z négatif) ; origine au
   centre du moyeu. Unités : mm. */
(function () {
  'use strict';
  var TAU = Math.PI * 2, DEG = Math.PI / 180;
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function sstep(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }

  AtelierModels.register('axle', {
    camera: { yaw: -2.25, pitch: 0.26, dist: 600, target: [-30, 25, -40], min: 160, max: 1200 },
    explodeLabel: 'Vue éclatée',
    build: function (ctx) {
      var THREE = ctx.THREE, H = ctx.H, M = ctx.M, api = ctx.api, V2 = H.V2;
      var root = new THREE.Group();

      /* ---------- Outils ---------- */
      /* Tour à arêtes vives (sommet doublé aux angles marqués), axe du tour le long de z. Profil : [rayon, z]. */
      function lath(prof, seg) {
        var out = [prof[0]];
        for (var i = 1; i < prof.length - 1; i++) {
          var a = prof[i - 1], b = prof[i], c = prof[i + 1];
          var ux = b[0] - a[0], uy = b[1] - a[1], vx = c[0] - b[0], vy = c[1] - b[1];
          var cs = (ux * vx + uy * vy) / (Math.hypot(ux, uy) * Math.hypot(vx, vy) || 1);
          out.push(b); if (cs < 0.82) out.push([b[0], b[1]]);
        }
        out.push(prof[prof.length - 1]);
        return H.orient(H.lathe(out, seg || 64), 'z');
      }
      /* Extrusion d'épaisseur totale T (chanfrein compris), centrée sur zc. */
      function ext(sh, T, b, zc, curve) {
        var g = b > 0 ? H.extrude(sh, T - 2 * b, { bevel: b, curve: curve || 16, bevelSegments: 3 }) : H.extrude(sh, T, { curve: curve || 16 });
        if (zc) g.translate(0, 0, zc); return g;
      }
      /* Boîte aux arêtes arrondies de taille exacte L x h x d, tournée de rz autour de z. */
      function rbox(L, h, d, r, m, parent, pos, rz) {
        var b = Math.min(r, d / 2 - 0.05, 1.2);
        var o = H.mesh(ext(H.roundRect(L - 2 * b, h - 2 * b, Math.max(0.1, r - b)), d, b, 0, 6), m, parent, pos);
        o.rotation.z = rz || 0; return o;
      }
      function cylZ(r, z0, z1, m, parent, x, y, seg) { return H.cyl(r, Math.abs(z1 - z0), 'z', m, parent, [x || 0, y || 0, (z0 + z1) / 2], seg || 32); }
      var Yv = new THREE.Vector3(0, 1, 0);
      function tubeAB(a, b, r, m, parent, seg) {
        var A = new THREE.Vector3(a[0], a[1], a[2]), B = new THREE.Vector3(b[0], b[1], b[2]), d = B.clone().sub(A);
        var o = H.mesh(new THREE.CylinderGeometry(r, r, d.length(), seg || 24), m, parent);
        o.position.copy(A).add(B).multiplyScalar(0.5); o.quaternion.setFromUnitVectors(Yv, d.normalize()); return o;
      }
      function hexPts(rc, rot) { var p = []; for (var i = 0; i < 6; i++) p.push(H.pol(rc, i / 6 * TAU + (rot || 0))); return p; }
      function disk(r, m, parent, z, dir, seg) { var d = H.mesh(new THREE.CircleGeometry(r, seg || 32), m, parent, [0, 0, z]); if (dir < 0) d.rotation.y = Math.PI; return d; }

      /* ---------- Matériaux (teintes approchées, voir l'en-tête) ---------- */
      function std(c, met, rough, extra) { return new THREE.MeshStandardMaterial(Object.assign({ color: c, metalness: met, roughness: rough }, extra || {})); }
      function phy(o) { return new THREE.MeshPhysicalMaterial(o); }
      var mPaint = phy({ color: 0x4f0d2c, metalness: 0.3, roughness: 0.34, clearcoat: 1, clearcoatRoughness: 0.03 });
      var mHub = phy({ color: 0x17181a, metalness: 0.8, roughness: 0.3 });
      var mAxle = phy({ color: 0x1d1f23, metalness: 0.8, roughness: 0.32 });
      var mAxleIn = std(0x111215, 0.6, 0.55);
      var mBlack = phy({ color: 0x131416, metalness: 0.75, roughness: 0.3 });
      var mTrack = std(0x7c7f84, 1, 0.5);
      var mFin = std(0xaeb3b9, 0.9, 0.4);
      var mSpider = std(0x141517, 0.8, 0.3);
      var mCaliper = phy({ color: 0x18191b, metalness: 0.7, roughness: 0.36 });
      var mPad = std(0x8a8c90, 1, 0.3), mLining = std(0x3a3532, 0.2, 0.9);
      var mHose = phy({ color: 0x0c0c0d, metalness: 0, roughness: 0.35, clearcoat: 0.5 });
      var mDark = std(0x050506, 0.1, 0.9);
      var mPaintW = std(0xf4f4f0, 0, 0.55, { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
      var mSpoke = std(0x1a1b1d, 0.9, 0.28, { vertexColors: true, transparent: true, depthWrite: false });
      var mSpokeHead = std(0x1a1b1d, 0.9, 0.28);

      /* ---------- Cotes et valeurs de dessin de la scène ---------- */
      var AXE = 100, R_AXE = 12 / 2;            // « 12x100 »
      var PATTE = { e: 8, l: 20.5 };            // pattes de la fourche : de 50 à 66 mm du plan du vélo (cadre.js)
      var Z_PATTE = AXE / 2 + PATTE.e;          // milieu de la patte
      var PLAN = -40;                           // plan du disque (geometrie.js, approché)
      var FLASQUES = [-22, 32];                 // flasques du moyeu avant (roues.js)
      var R_DISQUE = 160 / 2;
      var U = [-0.4542, 0.8907], L_FOURREAU = 400;   // fourreau : de l'axe vers la couronne (geometrie.js)
      var DERR = [-U[1], U[0]];                 // perpendiculaire au fourreau, vers l'arrière
      var ETRIER = { r: 72, deg: 160 };         // pastille de l'étrier : rayon de la scène, angle approché (voir l'en-tête)

      /* ---------- Fourche FK0143 : bas des fourreaux, pattes, portées, insert ---------- */
      var fork = new THREE.Group(); root.add(fork);
      var TL = 0.6, legs = [];
      function legGeom(s) {
        var N = 40, NS = 14, pos = [], idx = [], i, j;
        for (i = 0; i <= NS; i++) {
          var t = TL * i / NS, l = PATTE.l + 4 * t, e = PATTE.e + 5 * t, zc = s * (Z_PATTE - 14 * t);
          var cx = U[0] * L_FOURREAU * t, cy = U[1] * L_FOURREAU * t;
          for (j = 0; j < N; j++) {
            var th = j / N * TAU, ca = Math.cos(th), sa = Math.sin(th);
            pos.push(cx + DERR[0] * l * ca, cy + DERR[1] * l * ca, zc + e * sa * s);
          }
        }
        for (i = 0; i < NS; i++) for (j = 0; j < N; j++) {
          var a = i * N + j, b = i * N + (j + 1) % N, c = (i + 1) * N + j, d = (i + 1) * N + (j + 1) % N;
          if (s > 0) idx.push(a, b, d, a, d, c); else idx.push(a, d, b, a, c, d);
        }
        var top = NS * N, ct = pos.length / 3, tt = TL;
        pos.push(U[0] * L_FOURREAU * tt, U[1] * L_FOURREAU * tt, s * (Z_PATTE - 14 * tt));
        for (j = 0; j < N; j++) { if (s > 0) idx.push(ct, top + (j + 1) % N, top + j); else idx.push(ct, top + j, top + (j + 1) % N); }
        var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
        return g;
      }
      [-1, 1].forEach(function (s) {
        var leg = H.mesh(legGeom(s), mPaint, fork); legs.push(leg);
        var tip = H.mesh(new THREE.SphereGeometry(1, 40, 24), mPaint, fork, [0, 0, s * Z_PATTE]); tip.scale.set(PATTE.l, PATTE.l, PATTE.e);
        /* portée plane autour du trou de l'axe, de chaque côté de la patte */
        cylZ(12, s * (AXE / 2), s * (AXE / 2 + 2 * PATTE.e), mPaint, fork, 0, 0, 48);
        disk(R_AXE + 0.15, mDark, fork, s * (AXE / 2 - 0.02), -s);
        if (s < 0) disk(R_AXE + 0.15, mDark, fork, -(AXE / 2 + 2 * PATTE.e + 0.02), -1);
      });
      /* insert fileté de la patte opposée (côté droit) */
      H.mesh(lath([[R_AXE, AXE / 2 + 16], [9, AXE / 2 + 16], [9, AXE / 2 + 20.4], [8.4, AXE / 2 + 21], [R_AXE + 0.3, AXE / 2 + 21], [R_AXE, AXE / 2 + 20.5]], 48), mBlack, fork);
      H.mesh(new THREE.CylinderGeometry(R_AXE, R_AXE, 5, 32, 1, true), std(0x0b0b0c, 0, 0.9, { side: THREE.BackSide }), fork, [0, 0, AXE / 2 + 18.5]).rotation.x = Math.PI / 2;

      /* ---------- Roue : moyeu DT Swiss 350, rayons, disque et bague ---------- */
      var wheelEx = new THREE.Group(); root.add(wheelEx);
      var hub = new THREE.Group(); wheelEx.add(hub);
      var g = FLASQUES[0], d = FLASQUES[1];
      function flasque(z) { return [[21, z - 3], [25.5, z - 1.5], [25.5, z + 1.5], [21, z + 3]]; }
      var shell = H.mesh(lath([[11, g - 6], [14, g - 5]].concat(flasque(g), [[15, g + 8], [14, (g + d) / 2], [15, d - 8]], flasque(d), [[14, d + 5], [11, d + 6]]), 72), mHub, hub);
      cylZ(19, -38, g - 6, mHub, hub, 0, 0, 48);                                     // épaulement contre le disque
      var splSh = H.shape(H.gearPts(24, 17, 18.3, { tip: 0.3, flank: 0.1 })); splSh.holes.push(H.path(H.circlePts(R_AXE + 0.2, 32)));
      var splines = H.mesh(ext(splSh, 7, 0.2, -41.5, 4), mHub, hub);                  // cannelures Center Lock
      cylZ(15.4, -48.4, -45, mHub, hub, 0, 0, 48);                                    // filetage de la bague
      cylZ(11, -AXE / 2, -48.4, mHub, hub, 0, 0, 40);                                 // embouts de 12 mm
      cylZ(12, d + 6, AXE / 2, mHub, hub, 0, 0, 40);
      disk(R_AXE + 0.1, mDark, hub, -AXE / 2 - 0.03, -1); disk(R_AXE + 0.1, mDark, hub, AXE / 2 + 0.03, 1);

      /* rayons plats, 24, deux flasques, croisement de la scène : ils s'estompent avant la jante */
      (function () {
        var n = 24, A = new THREE.Vector3(), B = new THREE.Vector3(), Dv = new THREE.Vector3(), X = new THREE.Vector3(), Z = new THREE.Vector3();
        var R_FIN = 150, decal = 720 * 2 / n, rimR = 622 / 2 + 4.5 - 30 + 1;
        for (var i = 0; i < n; i++) {
          var a = (7.5 + i * 360 / n) * DEG, sens = Math.floor(i / 2) % 2 ? 1 : -1, ah = a + sens * decal * DEG;
          A.set(22.5 * Math.cos(ah), 22.5 * Math.sin(ah), FLASQUES[i % 2]); B.set(rimR * Math.cos(a), rimR * Math.sin(a), 0);
          Dv.copy(B).sub(A).normalize();
          /* longueur jusqu'au rayon R_FIN depuis l'axe de la roue */
          var px = A.x, py = A.y, dx = Dv.x, dy = Dv.y, qa = dx * dx + dy * dy, qb = 2 * (px * dx + py * dy), qc = px * px + py * py - R_FIN * R_FIN;
          var len = (-qb + Math.sqrt(qb * qb - 4 * qa * qc)) / (2 * qa);
          Z.set(0, 0, 1).addScaledVector(Dv, -Dv.z).normalize(); X.crossVectors(Dv, Z);
          var geo = new THREE.CylinderGeometry(1, 1, len, 6, 12, true); geo.translate(0, len / 2, 0);
          geo.applyMatrix4(new THREE.Matrix4().makeBasis(X, Dv, Z).multiply(new THREE.Matrix4().makeScale(0.65, 1, 1.25)).setPosition(A));
          var pc = geo.attributes.position, col = [];
          for (var k = 0; k < pc.count; k++) { var rr = Math.hypot(pc.getX(k), pc.getY(k)); col.push(1, 1, 1, 1 - sstep((rr - 60) / 85)); }
          geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 4));
          H.mesh(geo, mSpoke, hub);
          var head = H.mesh(new THREE.CylinderGeometry(1.7, 1.7, 3, 10), mSpokeHead, hub); head.position.copy(A).addScaledVector(Dv, -0.6); head.quaternion.setFromUnitVectors(Yv, Dv);
        }
      })();

      /* Disque Deore XT MT800 de 160 mm, comme celui de 2.2 : repère du disque, plan XY, z vers l'extérieur du vélo. */
      var rotor = new THREE.Group(); wheelEx.add(rotor); rotor.position.z = PLAN; rotor.rotation.y = Math.PI;
      var trackM, finsM;
      (function () {
        var sweep = 0.2, R0 = 25.3, Rt = 62.4, rivR = 58.6, i, k, q, r;
        function phi(kk, rr) { return kk * TAU / 6 + Math.PI / 2 + sweep * Math.max(0, rr - R0) / (Rt - R0); }
        function hw(rr) {
          if (rr < 31) return 6.6 + (31 - rr) * (31 - rr) * 0.16;
          if (rr < 50) return 6.6 - (rr - 31) * 0.02;
          if (rr < 55) { var t = (rr - 50) / 5; t = t * t * (3 - 2 * t); return 6.22 + t * 1.6; }
          return 7.82;
        }
        function adiff(x, y) { return Math.atan2(Math.sin(x - y), Math.cos(x - y)); }
        function slot5(j) {
          var a = (j + 0.5) / 30 * TAU, ca = Math.cos(a), sa = Math.sin(a), h = 4.25, w = 3.4, rf = 69.5;
          function pt(rr, t) { return V2(ca * rr - sa * t, sa * rr + ca * t); }
          return [pt(rf + h, -w), pt(rf + h, w), pt(rf - h / 3, w), pt(rf - h, 0), pt(rf - h / 3, -w)].reverse();
        }
        var track = H.shape(H.circlePts(R_DISQUE, 200)), inner = [], NI = 480;
        for (i = 0; i < NI; i++) {
          var a = i / NI * TAU, rIn = 63;
          for (k = 0; k < 6; k++) { var s = adiff(a, phi(k, rivR)) * 63 / 8.6; if (Math.abs(s) < 1) rIn = Math.min(rIn, 63 - 9.6 * Math.pow(1 - Math.pow(Math.abs(s), 3), 0.5)); }
          inner.push(H.pol(rIn, a));
        }
        track.holes.push(H.path(inner));
        for (var j = 0; j < 30; j++) track.holes.push(H.path(slot5(j)));
        trackM = H.mesh(ext(track, 1.8, 0.18, 0, 12), mTrack, rotor);
        var finsSh = [];
        for (k = 0; k < 6; k++) {
          var aS = phi(k, rivR) + 0.2, aE = phi(k + 1, rivR) - 0.2, nt = 6, P = [], fw = 1.6, rc = 56.4;
          for (q = 0; q <= 10; q++) P.push(H.pol(66, aS + (aE - aS) * q / 10));
          for (q = nt - 1; q >= 0; q--) {
            var ac = aS + (aE - aS) * (q + 0.5) / nt, w = fw / 60;
            P.push(H.pol(60.6, ac + w));
            for (var tt = 0; tt <= 6; tt++) { var t6 = tt / 6 * Math.PI; P.push(H.pol(rc - fw * Math.sin(t6), ac + fw * Math.cos(t6) / rc)); }
            P.push(H.pol(60.6, ac - w));
          }
          finsSh.push(H.shape(P));
        }
        finsM = H.mesh(ext(finsSh, 2.4, 0.3, 2.1, 4), mFin, rotor);
        var ring = H.shape(H.circlePts(25.7, 96)); ring.holes.push(H.path(H.gearPts(24, 18.45, 17.15, { tip: 0.3, flank: 0.1, phase: -TAU / 48 })));
        H.mesh(ext(ring, 6.6, 0.4, 1.3, 4), mSpider, rotor);
        var arms = [];
        for (k = 0; k < 6; k++) {
          var st = [];
          for (r = R0; r <= 61; r += 1) st.push(H.pol(r, phi(k, r) - hw(r) / r));
          var at = phi(k, Rt), hwt = hw(61) / Rt;
          for (q = 0; q <= 10; q++) { var tq = -1 + q / 5; st.push(H.pol(61 + 1.6 * Math.sqrt(1 - tq * tq), at + tq * hwt)); }
          for (r = 61; r >= R0; r -= 1) st.push(H.pol(r, phi(k, r) + hw(r) / r));
          var a1 = phi(k, R0) + hw(R0) / R0, a2 = phi(k + 1, R0) - hw(R0) / R0;
          for (q = 1; q < 6; q++) st.push(H.pol(R0, a1 + (a2 - a1) * q / 6));
          arms = arms.concat(st);
        }
        var armSh = H.shape(arms); armSh.holes.push(H.path(H.circlePts(22, 48)));
        H.mesh(ext(armSh, 3, 0.35, 2.4, 6), mSpider, rotor);
        var rivTop = new THREE.SphereGeometry(2.8, 20, 8, 0, TAU, 0, Math.PI / 2); rivTop.scale(1, 0.45, 1); rivTop.rotateX(Math.PI / 2);
        for (k = 0; k < 6; k++) {
          var ra = phi(k, rivR), rx = rivR * Math.cos(ra), ry = rivR * Math.sin(ra);
          H.mesh(rivTop, M.steel, rotor, [rx, ry, 3.9]); H.cyl(2.6, 0.5, 'z', M.steel, rotor, [rx, ry, -1.15], 20);
        }
        var rA = 39.5, aA = phi(0, rA), arr = new THREE.Shape();
        arr.moveTo(-5.6, -1.3); arr.lineTo(0.8, -1.3); arr.lineTo(0.8, -3.4); arr.lineTo(5.9, 0); arr.lineTo(0.8, 3.4); arr.lineTo(0.8, 1.3); arr.lineTo(-5.6, 1.3); arr.lineTo(-5.6, -1.3);
        H.mesh(new THREE.ShapeGeometry(arr), mPaintW, rotor, [rA * Math.cos(aA), rA * Math.sin(aA), 3.93]).rotation.z = aA + Math.PI / 2;
        /* bague à denture extérieure, l'un des deux types possibles */
        var lr = H.shape(H.gearPts(16, 20.7, 22.5, { tip: 0.6, flank: 0.05 })); lr.holes.push(H.path(H.circlePts(15.5, 64)));
        H.mesh(ext(lr, 3.5, 0.3, 6.35, 3), M.lockring, rotor);
        H.mesh(H.orient(H.lathe([[15.5, -1.9], [16.8, -1.9], [16.8, 4.62], [15.5, 4.62], [15.5, -1.9]], 64), 'z'), M.lockring, rotor);
      })();

      /* ---------- Étrier flat mount simplifié (comme freins.js), sur le bord arrière du disque ---------- */
      var cal = new THREE.Group(); root.add(cal);
      var rotE = (ETRIER.deg + 90) * DEG, dh = [Math.cos(ETRIER.deg * DEG), Math.sin(ETRIER.deg * DEG)], le = [Math.cos(rotE), Math.sin(rotE)];
      var CE = [ETRIER.r * dh[0], ETRIER.r * dh[1]];
      function ap(radial, long) { return [CE[0] + dh[0] * radial + le[0] * long, CE[1] + dh[1] * radial + le[1] * long]; }
      var calBody = new THREE.Group(); cal.add(calBody);
      [-1, 1].forEach(function (dz) {
        var p = ap(6, 0); rbox(56, 32, 12, 5, mCaliper, calBody, [p[0], p[1], PLAN + dz * 12], rotE);
        var f = PLAN + dz * 18, q = ap(-2, 0); cylZ(11, f, f + dz * 3, mCaliper, calBody, q[0], q[1], 40);
      });
      (function () {
        var p = ap(16, 0); rbox(50, 14, 30, 4, mCaliper, calBody, [p[0], p[1], PLAN], rotE);
        var hx = ap(13, -10); H.mesh(H.orient(new THREE.CylinderGeometry(2.8, 2.8, 1.2, 6), 'z'), M.steel, calBody, [hx[0], hx[1], PLAN - 18.6]);
        var bs = ap(23.5, -12); var bl = H.mesh(new THREE.CylinderGeometry(2.2, 2.2, 3, 6), M.steel, calBody, [bs[0], bs[1], PLAN + 6]); bl.rotation.z = ETRIER.deg * DEG - Math.PI / 2;
        var f0 = ap(10, -28), f1 = ap(10, -36); tubeAB([f0[0], f0[1], PLAN], [f1[0], f1[1], PLAN], 4.5, mBlack, calBody, 16);
        var nt = ap(10, -32); H.mesh(H.orient(new THREE.CylinderGeometry(3.5, 3.5, 1.5, 6), 'z'), M.steel, calBody, [nt[0], nt[1], PLAN - 4.5]);
        /* support flat mount, sous la moitié extérieure, et ses deux vis par en dessous (place et forme approchées) */
        var sp = ap(-14.5, -4); rbox(64, 9, 12, 3, mPaint, calBody, [sp[0], sp[1], PLAN - 12], rotE);
        [-20, 12].forEach(function (l) {
          var b = ap(-21, l), v = H.mesh(new THREE.CylinderGeometry(4.2, 4.2, 4, 24), M.steelDark, calBody, [b[0], b[1], PLAN - 12]);
          v.rotation.z = ETRIER.deg * DEG - Math.PI / 2;
          var hb = ap(-23.05, l), hx2 = H.mesh(new THREE.CircleGeometry(2.3, 6), mDark, calBody, [hb[0], hb[1], PLAN - 12]);
          hx2.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(-dh[0], -dh[1], 0));
        });
      })();
      /* plaquettes à ailettes, de part et d'autre du disque */
      [-1, 1].forEach(function (dz) {
        var pg = new THREE.Group(); calBody.add(pg); pg.position.set(CE[0], CE[1], PLAN + dz * 3.3); pg.rotation.z = rotE;
        rbox(34, 22, 1.6, 0.7, mPad, pg, [0, 0, dz * 1.6]);
        rbox(30, 16, 2.4, 0.9, mLining, pg, [0, 0, -dz * 0.5]);
        rbox(20, 20, 1.6, 0.6, mPad, pg, [0, -22, dz * 1.6]);
        [25, 31].forEach(function (y) { rbox(18, 1.4, 2.4, 0.4, mPad, pg, [0, -y, dz * 2.8]); });
      });
      /* cale de transport, entre les plaquettes, sa languette sort par le bas de l'étrier : visible roue démontée.
         En orange comme sur le dessin du guide (couleur réelle à lire sur la pièce), forme approchée. */
      var cale = new THREE.Group(); calBody.add(cale); cale.position.set(CE[0], CE[1], PLAN); cale.rotation.z = rotE;
      rbox(28, 18, 3, 1.5, M.orange, cale, [0, 2, 0]);
      rbox(24, 12, 3, 3, M.orange, cale, [36, 2, 0]);
      cale.visible = false;
      /* durite : du raccord, le long de la face intérieure du fourreau, jusqu'à son passage à l'arrière du fourreau */
      (function () {
        function surF(t, ecart, z) { return new THREE.Vector3(U[0] * L_FOURREAU * t + DERR[0] * ecart, U[1] * L_FOURREAU * t + DERR[1] * ecart, z); }
        var f = ap(10, -38), f2 = ap(10, -48);
        var pts = [new THREE.Vector3(f[0], f[1], PLAN), new THREE.Vector3(f2[0], f2[1], PLAN), surF(0.33, 16, -41), surF(0.40, 26, -47.8), surF(0.44, 19, -51.8)];
        H.mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 2.6, 12, false), mHose, cal);
        var p0 = surF(0.44, 21, -51.8), p1 = surF(0.44, 23.5, -51.8);
        tubeAB([p0.x, p0.y, p0.z], [p1.x, p1.y, p1.z], 3.6, mBlack, cal, 20);
      })();

      /* ---------- Axe traversant de 12 x 100, dessiné serré (tête côté disque) ---------- */
      var Z_TETE = -(AXE / 2 + 2 * PATTE.e), Z_BOUT = AXE / 2 + 20.5, PAS = 1.5, FIL = 18;
      var axleEx = new THREE.Group(); root.add(axleEx);
      var axleIns = new THREE.Group(); axleEx.add(axleIns);
      var R_HEX = 6 / Math.sqrt(3);
      var head = H.mesh(lath([[0, Z_TETE - 3], [4.4, Z_TETE - 3], [4.4, Z_TETE - 8], [8.2, Z_TETE - 8], [9.4, Z_TETE - 7.6], [10, Z_TETE - 6.6], [10, Z_TETE - 0.6], [9.6, Z_TETE], [R_AXE, Z_TETE]], 64), mAxle, axleIns);
      var hexSh = H.shape(H.circlePts(4.45, 40)); hexSh.holes.push(H.path(hexPts(R_HEX)));
      H.mesh(ext(hexSh, 5, 0, Z_TETE - 5.5, 4), mAxleIn, axleIns);
      disk(4.4, mDark, axleIns, Z_TETE - 3.02, -1, 24);
      [Z_TETE - 2.6, Z_TETE - 4.2].forEach(function (z) { H.mesh(new THREE.TorusGeometry(10, 0.2, 6, 64), mAxleIn, axleIns, [0, 0, z]); });
      var shank = cylZ(R_AXE, Z_TETE, Z_BOUT - FIL, mAxle, axleIns, 0, 0, 40);
      /* filetage à droite, pas approché, chanfrein en bout */
      var thread = (function () {
        var z0 = Z_BOUT - FIL, z1 = Z_BOUT, NA = 40, NZ = Math.round((z1 - z0) / (PAS / 8)), pos = [], idx = [], i, j;
        for (i = 0; i <= NZ; i++) {
          var z = z0 + (z1 - z0) * i / NZ;
          for (j = 0; j < NA; j++) {
            var th = j / NA * TAU, f = (z - PAS * th / TAU) / PAS; f -= Math.floor(f);
            var dd = Math.abs(f - 0.5) * 2, r = 5.1 + 0.9 * clamp((dd - 0.15) / 0.7, 0, 1);
            r = Math.min(r, 4.9 + (z1 - z) * 1.0);
            if (z < z0 + 1.2) r = Math.max(r, 5.1 + 0.9 * (z0 + 1.2 - z) / 1.2);
            pos.push(r * Math.cos(th), r * Math.sin(th), z);
          }
        }
        for (i = 0; i < NZ; i++) for (j = 0; j < NA; j++) {
          var a = i * NA + j, b = (i + 1) * NA + j, c = i * NA + (j + 1) % NA, d2 = (i + 1) * NA + (j + 1) % NA;
          idx.push(a, c, b, b, c, d2);
        }
        var gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); gg.setIndex(idx); gg.computeVertexNormals();
        return H.mesh(gg, mAxle, axleIns);
      })();
      disk(4.9, mAxleIn, axleIns, Z_BOUT + 0.01, 1, 32);
      /* embout six-pans de 6 mm et son porte-embout, au carré de 3/8 de pouce (forme approchée) */
      var bit = new THREE.Group(); axleIns.add(bit);
      H.mesh(ext(H.shape(hexPts(R_HEX - 0.05)), 14, 0, Z_TETE - 3 - 7, 2), M.steel, bit);
      H.mesh(lath([[0, Z_TETE - 34], [8, Z_TETE - 34], [8, Z_TETE - 11.5], [7, Z_TETE - 10], [0, Z_TETE - 10]], 40), M.steelDark, bit);
      rbox(9.5, 9.5, 8, 1, M.steelDark, bit, [0, 0, Z_TETE - 38]);
      bit.visible = false;

      /* ---------- Pose de l'axe et vue éclatée ---------- */
      var INS0 = 150, ENG = FIL - 2, ins = 100, lastE = -1, bitOn = false, caleOn = false, pret = false;
      function offset(v) { var t = v / 100; return t <= 0.7 ? INS0 - (INS0 - ENG) * t / 0.7 : ENG * (1 - (t - 0.7) / 0.3); }
      var pinsBase, pinCale, pinBit;
      function pinsNow() { return pinsBase.concat(caleOn ? [pinCale] : [], bitOn ? [pinBit] : []); }
      function apply() {
        var off = offset(ins), e = api.viewer ? api.viewer.ex : 0;
        axleIns.position.z = -off;
        axleIns.rotation.z = off < ENG ? (ENG - off) / PAS * TAU : 0;
        var k1 = sstep(e / 0.55), k2 = sstep((e - 0.45) / 0.55);
        axleEx.position.z = -Math.max(0, 160 - off) * k1;
        wheelEx.position.y = -75 * k2;
        var b = ins >= 70 && e < 0.03, c = k2 > 0.5;
        bit.visible = b; cale.visible = c;
        if (b !== bitOn || c !== caleOn) { bitOn = b; caleOn = c; if (pret) api.setPins(pinsNow()); }
        lastE = e;
      }

      /* ---------- Pastilles ---------- */
      pinsBase = [
        { obj: head, p: [0, 7, Z_TETE - 8], text: 'Axe avant traversant de 12 x 100 : 10-15 Nm, clé de 6 mm (tableau du guide, p.16)' },
        { obj: head, p: [10.1 * Math.cos(-0.8), 10.1 * Math.sin(-0.8), Z_TETE - 4], text: 'Type d’axe et forme de sa tête : à lire sur la pièce (liste : « Canyon Through Axle » ; guide : tête « DT SWISS »)' },
        { obj: thread, p: [0, 0, Z_BOUT], text: 'Bout fileté : il se visse dans la patte opposée à la tête (côté d’entrée à regarder sur le guide imprimé et sur ton vélo)' },
        { obj: legs[0], p: [U[0] * 120, U[1] * 120, -(Z_PATTE - 14 * 0.3) - (PATTE.e + 5 * 0.3)], text: 'Fourche FK0143 rigide, axe de 12 x 100 : ligne « RIGID FORK » du guide, à confirmer sur ton vélo' },
        { obj: shell, p: [-18.2, 18.2, FLASQUES[0]], text: 'Moyeu avant DT Swiss 350 de la roue GR 30 CF (d’après la page de la paire), Center Lock' },
        { obj: trackM, p: [76 * Math.cos(-0.6), 76 * Math.sin(-0.6), 1], text: 'Disque Deore XT MT800 (ou RT-CL800), 160 mm : modèle à lire sur la pièce' },
        { obj: calBody, p: [ap(6, 18)[0], ap(6, 18)[1], PLAN - 18], text: 'Étrier flat mount, simplifié : le disque passe entre les plaquettes' }
      ];
      pinCale = { obj: cale, p: [42, 2, 1.6], text: 'Cale de transport de l’étrier : retire-la avant de poser la roue, sans serrer le levier de frein (couleur à lire sur la pièce)' };
      pinBit = { obj: bit, p: [0, 8, Z_TETE - 24], text: 'Embout six-pans de 6 mm au carré de 3/8 de pouce, si ta caisse l’a, sur ta TW-6.2 : 10-15 Nm' };
      apply();
      /* pièce vide à décalage nul : la visionneuse n'affiche « Vue éclatée » que si parts n'est pas vide ; l'éclaté est fait par apply() */
      var dummy = new THREE.Group(); root.add(dummy);

      return {
        group: root,
        parts: [{ obj: dummy, off: [0, 0, 0] }],
        pins: pinsNow(),
        controls: [{ type: 'range', label: 'Pose de l’axe', min: 0, max: 100, step: 1, value: 100,
          format: function (v) { return v >= 100 ? 'serré, 10-15 Nm' : v > 70 ? 'il se visse' : v + ' %'; },
          onChange: function (v) { ins = v; apply(); } }],
        onFrame: function () { pret = true; if (api.viewer && api.viewer.ex !== lastE) apply(); return false; }
      };
    }
  });
})();
