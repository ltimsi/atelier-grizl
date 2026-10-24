/* Atelier Grizl : poste de pilotage du Grizl CF 8 Di2 (4556, taille M), pour l'atelier 1.3 « Cintre et potence ».
   Potence Canyon ST0046 (« LENGTH 60 mm », « ANGLE 6° », « STEERER 1 1/8" » sur sa photo officielle) serrée sur le pivot
   de la fourche FK0143 par 2 vis M6x18, son capot à 4 vis M5x22 (kit GP7585-01) sur le cintre Canyon HB0067 (collier
   de 31,8 mm, 440 mm en taille M), entretoises, capuchon de direction et sa vis, capot du jeu de direction et haut de
   la douille, cocottes Shimano GRX ST-RX825 (la gauche : ST-RX825-L ou BL-RX825-L, à lire sur la pièce) et les deux
   durites de frein. Les manettes passent les vitesses sans fil : aucune gaine ne part du cintre.
   Curseur « Serrage du capot », d'après les pictogrammes du guide Canyon (QSG R126 V02, p.10 et 11) : capot posé, vis
   vissées sans serrer ; 1, les 2 vis du haut à 6 Nm, clé de 4 mm, et le haut du capot se ferme sans jour contre la
   potence (« NO GAP! ») ; 2, les 2 vis du bas à 6 Nm, clé de 4 mm, et le jour reste en bas (« GAP! »). Vis du pivot :
   6 Nm, clé de 5 mm (pictogramme p.57). Vis du capuchon : 2 Nm, clé de 3 mm (pictogramme p.56), serrée avant les vis
   du pivot. Bascule de vue : le capot de près, ou le poste entier avec les cocottes.
   Cotes reprises de la scène de l'accueil (src/scene/geometrie.js et pieces/poste.js) : angle de direction de 71°,
   potence de 60 mm à 6° montée vers le bas, collier de 31,8 mm, 440 mm d'axe en axe aux cocottes et 510 mm aux drops,
   déport de 70 mm et descente de 128 mm du marquage du cintre, évasement de 16°, inclinaison de 5°, collier des
   cocottes de 23,8 à 24,2 mm (fiche ST-RX825), pose des cocottes et rotation du cintre lues sur la photo officielle du
   vélo, comme dans la scène.
   Formes approchées (aucune cote publiée dans les documents cités) :
   - potence : corps, collier du pivot, fente, oreilles et collier du cintre en forme approchée d'après sa photo
     officielle ; hauteur du collier du pivot et largeur du collier du cintre approchées ;
   - capot de potence : forme, épaisseur et place des vis approchées ; le jour est exagéré pour se voir, sa taille
     n'est pas publiée ; inscription « ZERO GAP 6 Nm » et flèches : place et taille approchées d'après le dessin agrandi
     du guide, p.10, à lire sur ta pièce ;
   - vis : têtes cylindriques à six-pans creux en forme approchée ; diamètres et longueurs du kit GP7585-01, clés des
     pictogrammes ; côté des têtes des vis du pivot approché ;
   - entretoises : nombre et hauteurs non publiés, à lire sur la pièce ; deux sont dessinées, dans la hauteur de
     potence approchée de la scène ;
   - capuchon et sa vis : forme approchée, seule la clé de 3 mm vient du guide ;
   - capot du jeu de direction, entrée des durites et haut de la douille : forme approchée, comme dans la scène ;
   - pivot de la fourche, en carbone comme la fourche FK0143 de la liste des composants : épaisseur approchée ;
   - cintre : forme de la courbe et longueur des drops approchées, comme dans la scène ;
   - ruban : épaisseur et début approchés, lisse comme sur la photo officielle ;
   - cocottes, leviers et palettes : forme approchée d'après la photo officielle du vélo, comme dans la scène ; la
     cocotte gauche est dessinée comme la droite ;
   - durites : grosseur et trajet approchés, comme dans la scène ;
   - couleurs : potence, capot, cintre, ruban, vis, cocottes et durites en teintes approchées ; douille dans le violet
     de la peinture Floating Violet de la scène, sans ses veines (teinte approchée) ;
   - repère orange du jour, entre le capot et la potence : un repère de dessin, pas une pièce ; numéros 1 et 2 sur les
     vis : l'ordre du guide.
   Repère : x vers l'avant, y vers le haut, z vers la droite du cycliste, origine en haut de la douille. Groupe rig :
   y le long du pivot, penché comme la douille. Unités : mm. */
(function () {
  'use strict';
  var TAU = Math.PI * 2, DEG = Math.PI / 180;
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function sstep(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }

  AtelierModels.register('cockpit', {
    camera: { yaw: 0.72, pitch: 0.28, dist: 320, target: [25, 40, 0], min: 120, max: 1900 },
    explodeLabel: 'Vue éclatée',
    build: function (ctx) {
      var THREE = ctx.THREE, H = ctx.H, M = ctx.M, api = ctx.api, V2 = H.V2;
      var root = new THREE.Group();

      /* ---------- Outils ---------- */
      /* Tour à arêtes vives : un point dupliqué à chaque angle marqué coupe le lissage des normales. */
      function lath(prof, seg) {
        var out = [prof[0]];
        for (var i = 1; i < prof.length - 1; i++) {
          var a = prof[i - 1], b = prof[i], c = prof[i + 1];
          var ux = b[0] - a[0], uy = b[1] - a[1], vx = c[0] - b[0], vy = c[1] - b[1];
          var cs = (ux * vx + uy * vy) / (Math.hypot(ux, uy) * Math.hypot(vx, vy) || 1);
          out.push(b); if (cs < 0.82) out.push([b[0], b[1]]);
        }
        out.push(prof[prof.length - 1]);
        return H.lathe(out, seg || 64);
      }
      /* Extrusion centrée sur z = 0 dont les flancs restent sur le contour (biseau pris vers l'intérieur). */
      function ext(sh, depth, bev, curve) {
        var g = new THREE.ExtrudeGeometry(sh, { depth: depth - 2 * bev, bevelEnabled: bev > 0, bevelThickness: bev, bevelSize: bev, bevelOffset: -bev, bevelSegments: 3, curveSegments: curve || 10, steps: 1 });
        g.translate(0, 0, -(depth - 2 * bev) / 2); return g;
      }
      /* Normales lissées sous un angle limite : arcs et biseaux lisses, arêtes vives conservées. */
      function crease(g, ang) {
        if (g.index) g = g.toNonIndexed();
        var pos = g.attributes.position, n = pos.count, cosT = Math.cos(ang), fn = [], map = {}, i, k;
        var a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), e1 = new THREE.Vector3(), e2 = new THREE.Vector3();
        function key(j) { return Math.round(pos.getX(j) * 50) + ',' + Math.round(pos.getY(j) * 50) + ',' + Math.round(pos.getZ(j) * 50); }
        for (i = 0; i < n; i += 3) {
          a.fromBufferAttribute(pos, i); b.fromBufferAttribute(pos, i + 1); c.fromBufferAttribute(pos, i + 2);
          var f = e1.subVectors(c, b).clone().cross(e2.subVectors(a, b)); fn.push({ v: f, u: f.clone().normalize() });
          for (k = 0; k < 3; k++) { var kk = key(i + k); (map[kk] || (map[kk] = [])).push(i / 3); }
        }
        var nor = new Float32Array(n * 3), acc = new THREE.Vector3();
        for (i = 0; i < n; i++) {
          var f0 = fn[(i / 3) | 0].u; acc.set(0, 0, 0);
          map[key(i)].forEach(function (j) { if (fn[j].u.dot(f0) > cosT) acc.add(fn[j].v); });
          if (acc.lengthSq() < 1e-12) acc.copy(f0); acc.normalize();
          nor[i * 3] = acc.x; nor[i * 3 + 1] = acc.y; nor[i * 3 + 2] = acc.z;
        }
        g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
        return g;
      }
      function arc(r, a0, a1, n, cx, cy) { var p = []; for (var i = 0; i <= n; i++) { var t = a0 + (a1 - a0) * i / n; p.push(V2((cx || 0) + r * Math.cos(t), (cy || 0) + r * Math.sin(t))); } return p; }
      /* Tube conique de a (rayon r1) à b (rayon r2), comme tube() de la scène. */
      var Yv = new THREE.Vector3(0, 1, 0);
      function tubeAB(a, b, r1, r2, m, parent, seg) {
        var A = new THREE.Vector3(a[0], a[1], a[2]), B = new THREE.Vector3(b[0], b[1], b[2]), d = B.clone().sub(A);
        var o = H.mesh(new THREE.CylinderGeometry(r2, r1, d.length(), seg || 32), m, parent);
        o.position.copy(A).add(B).multiplyScalar(0.5); o.quaternion.setFromUnitVectors(Yv, d.normalize()); return o;
      }
      function canvasMat(w, h, draw, extra) {
        var c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
        var t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
        return new THREE.MeshStandardMaterial(Object.assign({ map: t, transparent: true, roughness: 0.6, metalness: 0, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }, extra || {}));
      }

      /* ---------- Matériaux (teintes approchées, voir l'en-tête) ---------- */
      function std(c, met, rough, extra) { return new THREE.MeshStandardMaterial(Object.assign({ color: c, metalness: met, roughness: rough }, extra || {})); }
      function phy(o) { return new THREE.MeshPhysicalMaterial(o); }
      var mStem = phy({ color: 0x131416, metalness: 0.75, roughness: 0.3 });
      var mBar = phy({ color: 0x131416, metalness: 0.7, roughness: 0.34 });
      var mTape = phy({ color: 0x0d0d0e, metalness: 0, roughness: 0.88 });
      var mHood = phy({ color: 0x101011, metalness: 0, roughness: 0.68, side: THREE.DoubleSide });
      var mCover = phy({ color: 0x131416, metalness: 0.6, roughness: 0.38 });
      var mSpacer = phy({ color: 0x141517, metalness: 0.55, roughness: 0.36 });
      /* Floating Violet de la scène : teinte de base, sans ses veines */
      var mPaint = phy({ color: 0x4f0d2c, metalness: 0.3, roughness: 0.34, clearcoat: 1, clearcoatRoughness: 0.03 });
      var mCarbon = phy({ color: 0x0f1012, metalness: 0.1, roughness: 0.42, clearcoat: 0.4, clearcoatRoughness: 0.35 });
      var mHose = phy({ color: 0x0c0c0d, metalness: 0, roughness: 0.35, clearcoat: 0.5 });
      var mBolt = std(0xc9ccd0, 1, 0.24);
      var mDark = std(0x050506, 0, 0.9);
      var mCut = std(0x151516, 0.1, 0.85);

      /* ---------- Cotes ---------- */
      var TILT = (90 - 71) * DEG;          // angle de direction de 71° (geometrie.js)
      var STEM_A = 6 * DEG;                // « ANGLE 6° », potence montée vers le bas comme dans la scène
      var STEM_L = 60;                     // « LENGTH 60 mm »
      var R_ST = 28.6 / 2, R_STI = 11.8;   // pivot de 1 1/8 pouce ; intérieur approché
      var Y_CV = 10;                       // dessus du capot du jeu de direction (poste.js)
      var Y_S0 = 42, HC = 42;              // axe de la potence le long du pivot (geometrie.js, approché), hauteur du collier
      var Y_SB = Y_S0 - HC / 2, Y_ST = Y_S0 + HC / 2;
      var SPC = [Y_CV, (Y_CV + Y_SB) / 2, Y_SB];   // deux entretoises (nombre et hauteurs approchés)
      var Y_STT = Y_ST - 3;                // haut du pivot (approché)
      var RC = 18.5, RB = 14.35, ZE = 10.5;
      var D = new THREE.Vector3(Math.cos(STEM_A), -Math.sin(STEM_A), 0), NUP = new THREE.Vector3(Math.sin(STEM_A), Math.cos(STEM_A), 0);
      var S0 = new THREE.Vector3(0, Y_S0, 0), B = S0.clone().addScaledVector(D, STEM_L);
      var R_BAR = 31.8 / 2, R_CL = 15.95, R_OUT = 19.5, EAR = 27, FP_T = 9, BACK = -14, CW = 44;
      var FBY = 22, FBZ = 14;              // vis du capot, depuis l'axe du cintre (approché)
      /* jour du capot, exagéré : vis approchées, puis haut serré, puis bas serré */
      var G0 = 1.3, G1 = 2.8, G2 = 1.9;

      var rig = new THREE.Group(); root.add(rig); rig.rotation.z = TILT;

      /* ---------- Haut de la douille (cadre) ---------- */
      var frame = new THREE.Group(); rig.add(frame);
      var ht = H.mesh(new THREE.CylinderGeometry(26.5, 26.5, 45, 64, 1, true), mPaint, frame, [0, -22.5, 0]); ht.scale.z = 0.9;
      var g0 = new THREE.CircleGeometry(26.5, 64); g0.rotateX(Math.PI / 2); g0.scale(1, 1, 0.9); H.mesh(g0, mCut, frame, [0, -45, 0]);

      /* ---------- Pivot de fourche en carbone ---------- */
      var steer = new THREE.Group(); rig.add(steer);
      var LST = Y_STT + 45;
      H.mesh(new THREE.CylinderGeometry(R_ST, R_ST, LST, 64, 1, true), mCarbon, steer, [0, Y_STT - LST / 2, 0]);
      H.mesh(new THREE.CylinderGeometry(R_STI, R_STI, LST, 40, 1, true), std(0x0b0b0c, 0, 0.9, { side: THREE.BackSide }), steer, [0, Y_STT - LST / 2, 0]);
      g0 = new THREE.RingGeometry(R_STI, R_ST, 64); g0.rotateX(-Math.PI / 2); H.mesh(g0, mCut, steer, [0, Y_STT, 0]);

      /* ---------- Capot du jeu de direction et entrée des durites, devant le pivot ---------- */
      var cover = new THREE.Group(); rig.add(cover);
      H.mesh(lath([[R_ST + 0.3, 0], [26.5, 0], [26.5, 1.2], [21.5, Y_CV], [R_ST + 0.3, Y_CV]], 80), mCover, cover);
      var port = H.mesh(ext(H.roundRect(12, 10, 3), 24, 1.5, 6), mCover, cover, [17, 8, 0]);
      [-5, 5].forEach(function (z) { var h = H.mesh(new THREE.CircleGeometry(3, 20), mDark, cover, [17, 13.03, z]); h.rotation.x = -Math.PI / 2; });

      /* ---------- Entretoises ---------- */
      var spacers = [];
      for (var si = 0; si < SPC.length - 1; si++) {
        var y0 = SPC[si], y1 = SPC[si + 1];
        spacers.push(H.mesh(lath([[R_ST + 0.15, y0], [18, y0], [18.5, y0 + 0.5], [18.5, y1 - 0.5], [18, y1], [R_ST + 0.15, y1], [R_ST + 0.15, y0]], 80), mSpacer, rig));
      }

      /* ---------- Visserie ---------- */
      /* Vis à tête cylindrique à six-pans creux, axe local z : tête de 0 à hH, tige vers -z. hexAF : clé (sur plats).
         Le groupe ex sert à la vue éclatée, le groupe spin au serrage. */
      function bolt(rH, hH, rS, len, hexAF) {
        var ex = new THREE.Group(), spin = new THREE.Group(); ex.add(spin);
        var parts = [];
        parts.push(H.mesh(H.orient(lath([[0, 0], [rH - 0.3, 0], [rH, 0.3], [rH, hH - 0.45], [rH - 0.45, hH], [hexAF / Math.sqrt(3) + 0.3, hH], [0, hH]], 36), 'z'), mBolt, spin));
        parts.push(H.mesh(H.orient(new THREE.CylinderGeometry(rS, rS, len, 18), 'z'), mBolt, spin, [0, 0, -len / 2]));
        H.mesh(new THREE.CircleGeometry(hexAF / Math.sqrt(3), 6), mDark, spin, [0, 0, hH + 0.03]);
        ex.userData = { parts: parts, spin: spin, hH: hH };
        return ex;
      }
      function seat(parent, r, pos, rot) { var m = H.mesh(new THREE.CircleGeometry(r, 32), mDark, parent, pos); if (rot) m.rotation.set(rot[0], rot[1], rot[2]); return m; }

      /* ---------- Potence ST0046 ---------- */
      var stem = new THREE.Group(); rig.add(stem);
      /* Collier du pivot, vu de dessus : cylindre, oreilles arrière et fente de serrage. */
      (function () {
        var p = [], XB = -25.5, RCo = 4.5, SL = 1.0, n = 72;
        var aJ = Math.atan2(ZE, -Math.sqrt(RC * RC - ZE * ZE));
        p.push(V2(XB, SL), V2(XB, ZE - RCo));
        p = p.concat(arc(RCo, Math.PI, Math.PI / 2, 6, XB + RCo, ZE - RCo).slice(1));
        p = p.concat(arc(RC, aJ, -aJ, n));
        p = p.concat(arc(RCo, -Math.PI / 2, -Math.PI, 6, XB + RCo, -(ZE - RCo)));
        p.push(V2(XB, -SL));
        var aB = Math.atan2(SL, -Math.sqrt(RB * RB - SL * SL));
        p = p.concat(arc(RB, -aB, aB, n));
        var g = ext(H.shape(p), HC, 0.9); g.rotateX(-Math.PI / 2);
        H.mesh(crease(g, 40 * DEG), mStem, stem, [0, Y_S0, 0]);
      })();
      /* Corps : section arrondie qui part du collier du pivot et se fond dans le collier du cintre. */
      (function () {
        var NR = 30, NS = 56, PW = 3.4, pos = [], idx = [], r, k;
        for (r = 0; r <= NR; r++) {
          var t = r / NR, w = Math.sin(Math.PI * t);
          var a = 13.4 + (12.8 - 13.4) * t - 1.3 * w, b = 16.6 + (14.2 - 16.6) * t - 0.9 * w;
          for (k = 0; k < NS; k++) {
            var ph = k / NS * TAU, c = Math.cos(ph), s = Math.sin(ph);
            var zc = a * Math.sign(c) * Math.pow(Math.abs(c), 2 / PW), yc = b * Math.sign(s) * Math.pow(Math.abs(s), 2 / PW);
            var s0 = (Math.sqrt(17.4 * 17.4 - zc * zc) - yc * Math.sin(STEM_A)) / Math.cos(STEM_A);
            var xe = Math.abs(yc) <= 13.5 ? -Math.sqrt(R_OUT * R_OUT - yc * yc) : BACK;
            var sv = s0 + (STEM_L + xe + 1.2 - s0) * t;
            pos.push(S0.x + sv * D.x + yc * NUP.x, S0.y + sv * D.y + yc * NUP.y, zc);
          }
        }
        for (r = 0; r < NR; r++) for (k = 0; k < NS; k++) {
          var i0 = r * NS + k, i1 = r * NS + (k + 1) % NS;
          idx.push(i0, i0 + NS, i1, i1, i0 + NS, i1 + NS);
        }
        var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
        H.mesh(g, mStem, stem);
      })();
      /* Repère du collier du cintre : origine au centre du cintre, x le long de la potence, y vers le haut du capot. */
      var sfr = new THREE.Group(); stem.add(sfr); sfr.position.copy(B); sfr.rotation.z = -STEM_A;
      /* moitié arrière du collier, dans la potence ; sa face d'appui est en x = 0 */
      (function () {
        var yB = Math.sqrt(R_OUT * R_OUT - BACK * BACK), aO = Math.atan2(yB, BACK), cr = 1.8, p = [];
        p.push(V2(0, EAR));
        p = p.concat(arc(R_CL, Math.PI / 2, 3 * Math.PI / 2, 48));
        p.push(V2(0, -EAR), V2(BACK + cr, -EAR));
        p = p.concat(arc(cr, -Math.PI / 2, -Math.PI, 4, BACK + cr, -EAR + cr).slice(1));
        p = p.concat(arc(R_OUT, TAU - aO, aO, 40));
        p = p.concat(arc(cr, Math.PI, Math.PI / 2, 4, BACK + cr, EAR - cr));
        H.mesh(crease(ext(H.shape(p), CW, 1.4), 40 * DEG), mStem, sfr);
        [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (s) { seat(sfr, 2.5, [0.03, s[0] * FBY, s[1] * FBZ], [0, Math.PI / 2, 0]); });
      })();
      /* Vis du pivot : 2 vis M6x18 à l'arrière, clé de 5 mm, têtes côté droit (côté approché). */
      var pivBolts = [Y_S0 + 10.5, Y_S0 - 10.5].map(function (yb) {
        var g = bolt(5.0, 6.0, 3.0, 18, 5); stem.add(g); g.position.set(-19.9, yb, ZE - 2.0);
        seat(stem, 5.7, [-19.9, yb, ZE + 0.03]);
        return g;
      });

      /* ---------- Capot de potence et ses 4 vis M5x22 ---------- */
      var faceEx = new THREE.Group(); sfr.add(faceEx);
      /* le capot pivote autour de son bord haut pour montrer le jour */
      var facePiv = new THREE.Group(); faceEx.add(facePiv); facePiv.position.set(G0, EAR, 0);
      var face = new THREE.Group(); facePiv.add(face); face.position.set(0, -EAR, 0);
      (function () {
        var xf = FP_T, yA = Math.sqrt(R_OUT * R_OUT - xf * xf), aA = Math.atan2(yA, xf), cr = 1.8, p = [];
        p.push(V2(0, EAR), V2(xf - cr, EAR));
        p = p.concat(arc(cr, Math.PI / 2, 0, 4, xf - cr, EAR - cr).slice(1));
        p = p.concat(arc(R_OUT, aA, -aA, 44));
        p = p.concat(arc(cr, 0, -Math.PI / 2, 4, xf - cr, -EAR + cr));
        p.push(V2(0, -EAR));
        p = p.concat(arc(R_CL, -Math.PI / 2, Math.PI / 2, 48));
        H.mesh(crease(ext(H.shape(p), CW, 1.4), 40 * DEG), mStem, face);
      })();
      /* Inscription « ZERO GAP 6 Nm » et flèches sur le haut du capot, d'après le dessin agrandi du guide (place
         approchée). Le bas du texte est du côté de la potence, là où le capot se ferme. */
      (function () {
        var mt = canvasMat(512, 80, function (g, w, h) {
          g.fillStyle = '#eceae4'; g.font = 'bold 44px Arial, Helvetica, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
          g.fillText('ZERO GAP 6 Nm', w / 2, h / 2 - 4);
          [30, w - 30].forEach(function (x) { g.beginPath(); g.moveTo(x - 14, 12); g.lineTo(x + 14, 12); g.lineTo(x, h - 8); g.closePath(); g.fill(); });
        });
        var pg = new THREE.PlaneGeometry(38, 6); pg.rotateX(-Math.PI / 2); pg.rotateY(-Math.PI / 2);
        H.mesh(pg, mt, face, [4.2, EAR + 0.03, 0]);
      })();
      /* Vis, capot vu de face : haut droite, haut gauche, bas droite, bas gauche (droite : côté droit du vélo, +z). */
      var FB = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
      var fpBolts = FB.map(function (s) {
        var g = bolt(4.25, 5.0, 2.5, 22, 4); face.add(g);
        g.position.set(FP_T - 1.0, s[0] * FBY, s[1] * FBZ); g.rotation.y = Math.PI / 2;
        seat(face, 4.8, [FP_T + 0.03, s[0] * FBY, s[1] * FBZ], [0, Math.PI / 2, 0]);
        g.userData.haut = s[0] > 0;
        return g;
      });
      var topBolts = fpBolts.filter(function (b) { return b.userData.haut; }), botBolts = fpBolts.filter(function (b) { return !b.userData.haut; });

      /* ---------- Cintre HB0067, ruban, cocottes ST-RX825 (pose de la scène, poste.js) ---------- */
      var barG = new THREE.Group(); sfr.add(barG); barG.rotation.z = STEM_A - TILT;   // repère du vélo, origine au centre du cintre
      var barRoll = new THREE.Group(); barG.add(barRoll);
      var CINTRE = { collier: 47, ruban: 70, finHaut: 140, demiAxeAvant: 50, zCourbe: 196, bout: -40, epRuban: 2.5 };
      var DEPORT = 70, DESCENTE = 128, LARGEUR = 440, DROPS = 510, EVASEMENT = 16, INCLINAISON = 5;
      var RAYON_RUBAN = (23.8 + 24.2) / 4 + CINTRE.epRuban;   // collier des cocottes de 23,8 à 24,2 mm, plus le ruban
      var PRISE = [31, 23], POSE = { surCourbe: 43.5, roulis: 4 }, CALAGE = 54;
      var COCOTTE = [
        [-14, 12, -8, 10], [-4, 18, -13, 14], [8, 21, -16, 15.5], [20, 22.5, -18.5, 16], [PRISE[0], PRISE[1], -19.5, 16.5],
        [42, 24.5, -19.5, 16.5], [52, 27.5, -18.5, 16.5], [60, 31, -17, 16], [67, 36, -15, 15.5], [73, 42.5, -13, 14],
        [79, 48.5, -10, 12.5], [87, 51, -6.5, 11.5], [95, 49, -2, 10.5], [102, 42, 2, 9], [108, 31, 5.5, 7], [111, 18, 7.5, 4.5]
      ];
      var LEVIER = [[103, 3], [106, -12], [105, -36], [101, -58], [95, -77], [90, -88]];
      var PALETTE = [[88, -2], [87, -26], [83, -48], [77, -66], [73, -76]];
      barRoll.rotation.z = POSE.roulis * DEG;

      var pose = (function () {
        var zC = LARGEUR / 2, pente = Math.tan(INCLINAISON * DEG), flare = Math.tan(EVASEMENT * DEG);
        function yHaut(z) { return -Math.max(0, z - CINTRE.collier) * pente; }
        var yDessus = yHaut(CINTRE.finHaut) - 1;
        var a = CINTRE.demiAxeAvant, b = (DESCENTE + yDessus) / 2, O = [DEPORT - a, yDessus - b];
        function courbe(t) { return [O[0] + a * Math.cos(t), O[1] + b * Math.sin(t)]; }
        function cap(t) { return Math.atan2(-b * Math.cos(t), a * Math.sin(t)); }
        var tC = POSE.surCourbe * DEG, C = courbe(tC);
        function zSous(y) { return zC + (C[1] - y) * flare; }
        var pts = [];
        [CINTRE.ruban, (CINTRE.ruban + CINTRE.finHaut) / 2, CINTRE.finHaut].forEach(function (z) { pts.push([0, yHaut(z), z]); });
        pts.push([O[0] * 0.45, yDessus + 0.4, (CINTRE.finHaut + CINTRE.zCourbe) / 2 + 4]);
        var degC = tC / DEG, iCollier = -1;
        [90, 75, degC, 25, 0, -25, -50, -72, -90].filter(function (t) { return t === degC || Math.abs(t - degC) > 6; })
          .sort(function (u, w) { return w - u; }).forEach(function (deg) {
            var t = deg * DEG, q = courbe(t);
            if (deg === degC) iCollier = pts.length;
            var z = t >= tC ? CINTRE.zCourbe + (zC - CINTRE.zCourbe) * (1 - Math.sin(t)) / (1 - Math.sin(tC)) : zSous(q[1]);
            pts.push([q[0], q[1], z]);
          });
        pts.push([O[0] - 22, -DESCENTE + 0.5, zSous(-DESCENTE) + 1.5]);
        pts.push([CINTRE.bout, -DESCENTE + 2.5, DROPS / 2]);
        return { points: pts, iCollier: iCollier, collier: C, angle: cap(tC) + CALAGE * DEG, courbe: courbe, cap: cap, tC: tC };
      })();

      /* collier de 31,8 mm, raccord jusqu'au ruban, ruban, embouts */
      var barMesh = H.mesh(H.orient(new THREE.CylinderGeometry(R_BAR, R_BAR, 2 * CINTRE.collier, 64), 'z'), mBar, barRoll);
      var tapeCurves = [];
      [1, -1].forEach(function (s) {
        var pts = pose.points.map(function (q) { return [q[0], q[1], s * q[2]]; });
        tubeAB([0, 0, s * CINTRE.collier], pts[0], R_BAR, RAYON_RUBAN - CINTRE.epRuban, mBar, barRoll, 48);
        var curve = new THREE.CatmullRomCurve3(pts.map(function (q) { return new THREE.Vector3(q[0], q[1], q[2]); }));
        tapeCurves.push(curve);
        H.mesh(new THREE.TubeGeometry(curve, 160, RAYON_RUBAN, 20, false), mTape, barRoll);
        /* bord du ruban, à son début : il ferme le tube du ruban autour du cintre */
        var bord = H.mesh(new THREE.RingGeometry(RAYON_RUBAN - CINTRE.epRuban - 0.2, RAYON_RUBAN, 32), mTape, barRoll, pts[0]);
        bord.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), curve.getTangent(0).multiplyScalar(-1));
        var fin = pts[pts.length - 1], av = pts[pts.length - 2], d = [fin[0] - av[0], fin[1] - av[1], fin[2] - av[2]], l = Math.hypot(d[0], d[1], d[2]);
        var u = d.map(function (x) { return x / l; });
        tubeAB(fin.map(function (x, i) { return x - u[i] * 0.5; }), fin.map(function (x, i) { return x + u[i] * 4.5; }), RAYON_RUBAN + 0.3, RAYON_RUBAN + 0.3, mHood, barRoll, 32);
      });

      /* Volume d'une cocotte : sections superelliptiques lissées, fermées aux deux bouts (comme poste.js). */
      function volume(cles, n, e) {
        n = n || 24; e = e || 2.6;
        var lisse = [], i, k, j;
        function at(q) { return cles[Math.max(0, Math.min(cles.length - 1, q))]; }
        for (i = 0; i < cles.length - 1; i++) for (k = 0; k < 3; k++) {
          var t = k / 3, p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
          lisse.push(p1.map(function (_, q) {
            return 0.5 * (2 * p1[q] + (p2[q] - p0[q]) * t + (2 * p0[q] - 5 * p1[q] + 4 * p2[q] - p3[q]) * t * t + (3 * p1[q] - p0[q] - 3 * p2[q] + p3[q]) * t * t * t);
          }));
        }
        lisse.push(cles[cles.length - 1]);
        function puiss(x) { return Math.sign(x) * Math.pow(Math.abs(x), 2 / e); }
        var pos = [], idx = [];
        lisse.forEach(function (s) {
          var cy = (s[1] + s[2]) / 2, hh = (s[1] - s[2]) / 2;
          for (j = 0; j < n; j++) {
            var tt = TAU * j / n;
            pos.push(s[0], j === n / 4 ? s[1] : cy + hh * puiss(Math.sin(tt)), j === n / 4 ? 0 : s[3] * puiss(Math.cos(tt)));
          }
        });
        var S = lisse.length;
        for (i = 0; i < S - 1; i++) for (j = 0; j < n; j++) {
          var a = i * n + j, b = i * n + (j + 1) % n, c = (i + 1) * n + j, d = (i + 1) * n + (j + 1) % n;
          idx.push(a, c, d, a, d, b);
        }
        [0, S - 1].forEach(function (ii) {
          var s = lisse[ii], centre = pos.length / 3;
          pos.push(s[0], (s[1] + s[2]) / 2, 0);
          for (j = 0; j < n; j++) { var a = ii * n + j, b = ii * n + (j + 1) % n; if (ii === 0) idx.push(centre, b, a); else idx.push(centre, a, b); }
        });
        var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
        return g;
      }
      /* Levier : une lame qui suit son chemin (comme poste.js). */
      function lame(chemin, z, de, dl, m, parent) {
        var f = new THREE.Shape(); f.moveTo(-de, -dl); f.lineTo(de, -dl); f.lineTo(de, dl); f.lineTo(-de, dl); f.closePath();
        var trajet = new THREE.CatmullRomCurve3(chemin.map(function (q) { return new THREE.Vector3(q[0], q[1], z); }));
        return H.mesh(new THREE.ExtrudeGeometry(f, { steps: 40, bevelEnabled: false, extrudePath: trajet }), m, parent);
      }
      function rot2(q, t) { return [q[0] * Math.cos(t) - q[1] * Math.sin(t), q[0] * Math.sin(t) + q[1] * Math.cos(t)]; }
      /* Le cintre dans le repère de la cocotte, pour que l'arrière de la cocotte l'entoure. */
      var hoodSections = (function () {
        var C = pose.collier, a = -(pose.cap(pose.tC) + CALAGE * DEG), axe = [];
        for (var t = pose.tC - 50 * DEG; t <= Math.PI / 2; t += DEG) { var q = pose.courbe(t); axe.push(rot2([q[0] - C[0], q[1] - C[1]], a)); }
        function yAxe(x) {
          for (var i = 0; i < axe.length - 1; i++) {
            var p0 = axe[i], p1 = axe[i + 1];
            if ((p0[0] - x) * (p1[0] - x) > 0 || p0[0] === p1[0]) continue;
            return p0[1] + (p1[1] - p0[1]) * (x - p0[0]) / (p1[0] - p0[0]);
          }
          return null;
        }
        return COCOTTE.map(function (r) {
          var y = r[0] <= 6 ? yAxe(r[0]) : null;
          if (y === null) return r;
          return [r[0], Math.max(r[1], y + RAYON_RUBAN + 2), y - RAYON_RUBAN - 2, Math.max(r[3], RAYON_RUBAN + 2)];
        });
      })();
      var hoodGeo = volume(hoodSections);
      var hoods = [1, -1].map(function (s) {
        var hd = new THREE.Group(); barRoll.add(hd);
        hd.position.set(pose.collier[0], pose.collier[1], s * LARGEUR / 2); hd.rotation.z = pose.angle;
        H.mesh(hoodGeo, mHood, hd);
        lame(LEVIER, 0, 3.5, 8, mStem, hd);
        lame(PALETTE, -s * 3, 2.5, 5, mHood, hd);
        return hd;
      });

      /* ---------- Capuchon de direction et sa vis (clé de 3 mm) ---------- */
      var cap = new THREE.Group(); stem.add(cap);
      H.mesh(lath([[3.3, Y_ST], [17.4, Y_ST], [17.8, Y_ST + 0.4], [17.8, Y_ST + 1.7], [16.5, Y_ST + 3.4], [12.6, Y_ST + 5.0], [7.4, Y_ST + 5.9], [6.6, Y_ST + 5.9], [6.05, Y_ST + 5.3], [6.05, Y_ST + 2.4], [3.3, Y_ST + 2.4], [3.3, Y_ST]], 80), mStem, cap);
      var capBolt = bolt(4.75, 2.8, 2.5, 30, 3); cap.add(capBolt); capBolt.position.set(0, Y_ST + 2.4, 0); capBolt.rotation.x = -Math.PI / 2;

      /* ---------- Durites de frein : de la cocotte, sous le ruban, jusqu'à l'entrée du capot du jeu de direction ---------- */
      var hoses = new THREE.Group(); root.add(hoses);
      root.updateMatrixWorld(true);
      (function () {
        var tC = pose.iCollier / (pose.points.length - 1), w = new THREE.Vector3(-0.45, -0.89, 0).normalize();
        [1, -1].forEach(function (s, k) {
          var curve = tapeCurves[k], q = [], i;
          for (i = 0; i <= 20; i++) {
            var t = tC * (1 - i / 20);
            var c = barRoll.localToWorld(curve.getPoint(t)), d = barRoll.localToWorld(curve.getPoint(t).add(curve.getTangent(t))).sub(c).normalize();
            var off = w.clone().addScaledVector(d, -w.dot(d)).normalize().multiplyScalar(RAYON_RUBAN - 0.6);
            q.push(c.add(off));
          }
          var so = q[q.length - 1];
          q.push(new THREE.Vector3(so.x - 4, so.y - 14, so.z - s * 18));
          [[26, 30, 26], [20, 17, 10], [17, 10, 5]].forEach(function (r) { q.push(rig.localToWorld(new THREE.Vector3(r[0], r[1], s * r[2]))); });
          H.mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(q), 90, 2.6, 12, false), mHose, hoses);
        });
      })();

      /* ---------- Ordre de serrage : vis en couleur et numéro sur la tête ---------- */
      function tagMat(txt, on) {
        var c = document.createElement('canvas'); c.width = c.height = 64; var g = c.getContext('2d');
        g.fillStyle = on ? '#f2b62b' : '#9aa0a7'; g.strokeStyle = '#141414'; g.lineWidth = 4;
        g.beginPath(); g.arc(32, 32, 27, 0, TAU); g.fill(); g.stroke();
        g.fillStyle = '#141414'; g.font = 'bold 40px Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 32, 34);
        var t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
        return new THREE.SpriteMaterial({ map: t, transparent: true, toneMapped: false });
      }
      var tags = { 1: [tagMat('1', false), tagMat('1', true)], 2: [tagMat('2', false), tagMat('2', true)] };
      fpBolts.forEach(function (b) {
        var n = b.userData.haut ? 1 : 2, sp = new THREE.Sprite(tags[n][0]); sp.scale.set(6.5, 6.5, 1); sp.renderOrder = 2;
        sp.position.set(0, b.userData.haut ? 9 : -9, 6); b.add(sp); b.userData.tag = sp; b.userData.n = n;
      });

      /* Repère du jour, en orange : un repère de dessin entre le capot et la potence, pas une pièce. Il suit la taille
         du jour (exagérée), en haut tant que le haut n'est pas serré, en bas jusqu'au bout. */
      var mJour = std(0xe07a1a, 0.1, 0.5, { emissive: 0xe07a1a, emissiveIntensity: 0.55, transparent: true, opacity: 0.9 });
      var jourHaut = H.mesh(new THREE.BoxGeometry(1, EAR - 17.6, CW - 3), mJour, sfr, [0, EAR - (EAR - 17.6) / 2, 0]);
      var jourBas = H.mesh(new THREE.BoxGeometry(1, EAR - 17.6, CW - 3), mJour, sfr, [0, -EAR + (EAR - 17.6) / 2, 0]);

      var tgt = 0, st = 0, shown = -1;
      function gaps(v) {
        var top = v < 1 ? G0 * (1 - sstep(v)) : 0;
        var bot = v < 1 ? G0 + (G1 - G0) * sstep(v) : G1 + (G2 - G1) * sstep(v - 1);
        return [top, bot];
      }
      function applyState() {
        var g = gaps(st);
        facePiv.position.x = g[0];
        facePiv.rotation.z = Math.asin((g[1] - g[0]) / (2 * EAR));
        var gh = g[0] + (g[1] - g[0]) * 0.09, gb = g[0] + (g[1] - g[0]) * 0.91;
        var horsEclate = !api.viewer || api.viewer.ex < 0.02;
        jourHaut.visible = horsEclate && g[0] > 0.05; jourBas.visible = horsEclate; jourHaut.scale.x = Math.max(gh, 0.01); jourHaut.position.x = gh / 2;
        jourBas.scale.x = gb; jourBas.position.x = gb / 2;
        var a1 = -TAU * 1.5 * sstep(st), a2 = -TAU * 1.5 * sstep(st - 1);
        topBolts.forEach(function (b) { b.userData.spin.rotation.z = a1; });
        botBolts.forEach(function (b) { b.userData.spin.rotation.z = a2; });
        if (shown !== tgt) {
          shown = tgt;
          fpBolts.forEach(function (b) {
            var on = b.userData.n === tgt;
            b.userData.parts.forEach(function (m) { m.material = on ? M.highlight : mBolt; });
            b.userData.tag.material = tags[b.userData.n][on ? 1 : 0];
          });
        }
      }
      applyState();

      /* ---------- Vues : le capot de près, ou le poste entier ---------- */
      var VUES = {
        capot: { target: [25, 40, 0], dist: 320, min: 120, max: 1900 },
        poste: { target: [72, -10, 0], dist: 900, min: 300, max: 1900 }
      };
      var vueT = null;
      function setVue(v) {
        var w = api.viewer; vueT = VUES[v]; if (!w) return;
        w.cam0 = Object.assign({}, w.cam0, { target: w.cam0.target.slice(), dist: vueT.dist });
        w.min = vueT.min; w.max = vueT.max;
      }

      /* ---------- Pastilles ---------- */
      var ang = 0.95;   // côté tourné vers la vue de départ
      var pins = [
        { obj: topBolts[0], p: [0, 0, 5.4], text: 'Vis du haut du capot : serre-les en premier, 6 Nm, clé de 4 mm' },
        { obj: sfr, p: [0, EAR, 12], text: 'Haut du capot : sans jour contre la potence (« NO GAP! » du guide, p.11)' },
        { obj: botBolts[0], p: [0, 0, 5.4], text: 'Vis du bas du capot : ensuite, 6 Nm, clé de 4 mm' },
        { obj: jourBas, p: [0.5, -(EAR - 17.6) / 2, 12], text: 'Bas du capot : le jour reste (« GAP! » du guide, p.11)' },
        { obj: face, p: [R_OUT, 0, 6], text: 'Capot de la ST0046, 4 vis M5x22, couples des pictogrammes du guide, p.10 ; « ZERO GAP 6 Nm » à lire sur la pièce' },
        { obj: pivBolts[0], p: [0, 0, 6.2], text: 'Vis du pivot : 2 vis M6x18, 6 Nm, clé de 5 mm, après le capuchon (pictogramme du guide, p.57)' },
        { obj: capBolt, p: [0, 0, 3], text: 'Vis du capuchon : 2 Nm, clé de 3 mm, avant les vis du pivot (pictogramme du guide, p.56) ; à la clé Canyon, aucun de tes outils ne descend à 2 Nm' },
        { obj: spacers[0], p: [18.5 * Math.sin(ang), (SPC[0] + SPC[1]) / 2, 18.5 * Math.cos(ang)], text: 'Entretoises : leur nombre est à lire sur la pièce' },
        { obj: stem, p: [31.4, 53.5, 0], text: 'Potence ST0046 : 60 mm, 6°, pivot de 1 1/8 pouce, sur sa photo officielle' },
        { obj: barMesh, p: [R_BAR * Math.cos(50 * DEG), R_BAR * Math.sin(50 * DEG), 34], text: 'Cintre HB0067, collier de 31,8 mm : centre-le dans la potence' },
        { obj: hoods[0], p: [PRISE[0], PRISE[1] + 1, 0], text: 'Cocottes ST-RX825, montées sur le cintre à la livraison (la gauche : ST-RX825-L ou BL-RX825-L, à lire sur la pièce)' }
      ];

      return {
        group: root,
        parts: [
          { obj: stem, off: [0, 22, 0] },
          { obj: pivBolts[0], off: [0, 0, 22] }, { obj: pivBolts[1], off: [0, 0, 22] },
          { obj: barG, off: [18, 0, 0] },
          { obj: faceEx, off: [34, 0, 0] },
          { obj: fpBolts[0], off: [18, 0, 0] }, { obj: fpBolts[1], off: [18, 0, 0] }, { obj: fpBolts[2], off: [18, 0, 0] }, { obj: fpBolts[3], off: [18, 0, 0] },
          { obj: cap, off: [0, 16, 0] }, { obj: capBolt, off: [0, 14, 0] }
        ],
        pins: pins,
        controls: [
          { type: 'segmented', label: 'Vue', value: 'capot', options: [{ value: 'capot', label: 'Vue du capot' }, { value: 'poste', label: 'Vue du poste' }],
            onChange: setVue },
          { type: 'range', label: 'Serrage du capot', min: 0, max: 2, step: 1, value: 0,
            format: function (v) { return v === 0 ? 'vis posées' : v === 1 ? '1, haut : 6 Nm' : '2, bas : 6 Nm'; },
            onChange: function (v) { tgt = v; } }
        ],
        onFrame: function (dt) {
          var anim = false, w = api.viewer;
          var show = !w || w.ex < 0.02;
          if (hoses.visible !== show) { hoses.visible = show; jourBas.visible = show; jourHaut.visible = show && gaps(st)[0] > 0.05; anim = true; }
          if (st !== tgt || shown !== tgt) {
            var step = dt * 0.9;
            st = Math.abs(tgt - st) <= step ? tgt : st + (tgt > st ? step : -step);
            applyState(); anim = true;
          }
          if (vueT && w) {
            var t = w.cam0.target, k = Math.min(1, dt * 4), moving = false;
            for (var i = 0; i < 3; i++) { var d = vueT.target[i] - t[i]; if (Math.abs(d) > 0.05) { t[i] += d * k; moving = true; } else t[i] = vueT.target[i]; }
            var dd = vueT.dist - w.dist; if (Math.abs(dd) > 0.5) { w.dist += dd * k; moving = true; } else w.dist = vueT.dist;
            if (!moving) vueT = null;
            anim = true;
          }
          return anim;
        }
      };
    }
  });
})();
