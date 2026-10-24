/* Atelier Grizl : pédale Shimano PD-ME700 et cale SM-SH51, pour l'atelier 1.6 « Pédales et cales ».
   Ton vélo arrive sans pédales (fiche Canyon, « None included »). Valeurs du manuel revendeur Shimano DM-MAPD001-07 :
   - pédale : la figure « PD-ME700 / PD-MT520 » donne la clé plate de 15 mm et 35-55 Nm ; un peu de graisse sur le
     filetage ; la pédale droite a un pas à droite, la gauche un pas à gauche, repères L et R (étapes 8.2 et 8.3 du
     guide de démarrage Canyon, QSG R126 V02, p.20, avec leurs flèches) ;
   - cale SM-SH51 (noire), réglable sur 20 mm d'avant en arrière et 5 mm de gauche à droite, pour le pied gauche comme
     pour le droit ; vis de cale : 2,5 Nm de serrage provisoire, puis 5-6 Nm en alternant, six-pans de 4 mm ;
   - tension de déclenchement : une vis à l'arrière de chaque mécanisme d'accrochage, quatre pour les deux pédales,
     six-pans de 3 mm pour la PD-ME700 ; en sens horaire la cale tient plus fort ; quatre clics par tour ; plaquette de
     réglage pour mettre les quatre au même réglage.
   Outils du chapitre : la TW-6.2 et une tête de clé plate de 15 mm pour 35-55 Nm ; la clé Canyon du carton pour 2,5 Nm,
   si sa plage le permet (à lire sur l'outil), car aucun de tes outils ne descend si bas ; l'ATD-1.2 pour 5-6 Nm.
   Bascule « Pédale droite (R) » / « Pédale gauche (L) » : la gauche est dessinée en miroir de la droite, avec son
   filetage à pas à gauche, son repère L et sa chaussure gauche. Les flèches orange montrent le sens du serrage :
   horaire vu du bout de la pédale droite, antihoraire vu du bout de la gauche. Curseur « Vissage » : la pédale entre
   dans l'œil de la manivelle et son axe tourne dans le sens de la flèche. Vue éclatée : la pédale s'écarte de la
   manivelle ; la semelle, la cale, sa plaquette et ses vis se séparent.
   Seule cote publiée de la pédale : 15 mm sur les méplats de l'axe (clé de la figure Shimano), respectée ici.
   Formes approchées (aucune autre cote publiée dans les documents cités) :
   - plateforme, picots, noyau, flasques et mâchoires du mécanisme : forme approchée ; picots : nombre et place
     approchés ;
   - axe : épaulement, longueur et place des méplats, col, joint, diamètre et pas du filetage approchés ; repère L ou R :
     place approchée, sur le méplat ;
   - vis de tension, son six-pans de 3 mm et la plaquette de réglage : forme et place approchées, à l'arrière de la
     mâchoire arrière comme le dit Shimano ;
   - manivelle, en transparence : forme approchée ;
   - semelle en coupe : forme de la chaussure, épaisseurs, crampons et creux de la cale approchés ; fentes de réglage
     dessinées pour les 20 mm du manuel, leur vraie longueur dépend de ta chaussure ;
   - cale SM-SH51 : contour, épaisseurs et trous oblongs approchés, ces trous donnant les 5 mm de gauche à droite ;
     plaquette sous les têtes de vis et vis à six-pans de 4 mm : forme approchée ;
   - pédale gauche : miroir de la droite, forme approchée ;
   - couleurs : aluminium noir, acier, cale noire, semelle : teintes approchées ;
   - flèches orange : des repères de dessin, comme les flèches du guide, pas des pièces ; la pédale est montrée
     au-dessus de la semelle, sans la cale engagée.
   Repère local : celui de la pédale gauche, x le long de l'axe (manivelle vers -x, face d'appui de la manivelle en
   x = -55,4), y vers le haut (semelle au-dessus), z vers l'avant du pied. La pédale droite est son miroir (x vers -x).
   Unités : mm. */
(function () {
  'use strict';
  var TAU = Math.PI * 2;

  AtelierModels.register('pedal', {
    camera: { yaw: 2.62, pitch: 0.14, dist: 265, target: [-4, 16, 0], min: 110, max: 600 },
    explodeLabel: 'Vue éclatée',
    build: function (ctx) {
      var THREE = ctx.THREE, H = ctx.H, api = ctx.api;
      var root = new THREE.Group();
      /* repère de la pédale gauche ; la droite en est le miroir (scale.x = -1) */
      var side = new THREE.Group(); root.add(side);

      /* ---------- Outils ---------- */
      function S(c, met, rough, extra) { return new THREE.MeshStandardMaterial(Object.assign({ color: c, metalness: met, roughness: rough }, extra || {})); }
      /* Polygone [[u, v], ...] à coins arrondis (r par sommet possible). */
      function rpoly(pts, r, seg) {
        var out = [], n = pts.length; seg = seg || 4;
        for (var i = 0; i < n; i++) {
          var p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n];
          var rr = Array.isArray(r) ? r[i] : r;
          var d1x = p0[0] - p1[0], d1y = p0[1] - p1[1], l1 = Math.hypot(d1x, d1y);
          var d2x = p2[0] - p1[0], d2y = p2[1] - p1[1], l2 = Math.hypot(d2x, d2y);
          var d = Math.min(rr, l1 / 2, l2 / 2);
          if (!(d > 1e-3)) { out.push(H.V2(p1[0], p1[1])); continue; }
          var ax = p1[0] + d1x / l1 * d, ay = p1[1] + d1y / l1 * d, bx = p1[0] + d2x / l2 * d, by = p1[1] + d2y / l2 * d;
          for (var k = 0; k <= seg; k++) {
            var t = k / seg, u = 1 - t;
            out.push(H.V2(u * u * ax + 2 * u * t * p1[0] + t * t * bx, u * u * ay + 2 * u * t * p1[1] + t * t * by));
          }
        }
        return out;
      }
      function rrect(x0, z0, x1, z1, r, seg) { return rpoly([[x0, z0], [x1, z0], [x1, z1], [x0, z1]], r, seg); }
      function pill(cx, cy, len, wid, ang, n) {
        var p = [], r = wid / 2, h = len / 2 - r, ca = Math.cos(ang), sa = Math.sin(ang); n = n || 6;
        for (var s = 0; s < 2; s++) for (var i = 0; i <= n; i++) {
          var t = -Math.PI / 2 + i / n * Math.PI + s * Math.PI, ex = (s ? -h : h) + r * Math.cos(t), ey = r * Math.sin(t);
          p.push(H.V2(cx + ex * ca - ey * sa, cy + ex * sa + ey * ca));
        }
        return p;
      }
      function shp(outer, holes) { var s = H.shape(outer); (holes || []).forEach(function (h) { s.holes.push(H.path(h)); }); return s; }
      /* Extrusion d'un contour en plan (x, z) entre y0 et y1 ; avec chanfrein b, les flancs sont décalés de b vers l'extérieur. */
      function planG(sh, y0, y1, b, curve) {
        var T = y1 - y0;
        var g = b > 0 ? H.extrude(sh, T - 2 * b, { bevel: b, bevelSegments: 2, curve: curve || 10 }) : H.extrude(sh, T, { curve: curve || 10 });
        g.rotateX(Math.PI / 2); g.translate(0, (y0 + y1) / 2, 0); return g;
      }
      /* Extrusion d'un profil (z, y) le long de x, entre x0 et x1. */
      function sideG(sh, x0, x1, b) {
        var T = x1 - x0;
        var g = b > 0 ? H.extrude(sh, T - 2 * b, { bevel: b, bevelSegments: 2, curve: 8 }) : H.extrude(sh, T, { curve: 8 });
        g.rotateY(-Math.PI / 2); g.translate((x0 + x1) / 2, 0, 0); return g;
      }
      /* Tour autour de x, arêtes vives (sommets doublés aux angles marqués). Profil [[rayon, x], ...]. */
      function latheX(prof, seg) {
        var out = [prof[0]];
        for (var i = 1; i < prof.length - 1; i++) {
          var a = prof[i - 1], b = prof[i], c = prof[i + 1];
          var ux = b[0] - a[0], uy = b[1] - a[1], vx = c[0] - b[0], vy = c[1] - b[1];
          var cs = (ux * vx + uy * vy) / (Math.hypot(ux, uy) * Math.hypot(vx, vy) || 1);
          out.push(b); if (cs < 0.82) out.push([b[0], b[1]]);
        }
        out.push(prof[prof.length - 1]);
        var g = H.lathe(out, seg || 40); g.rotateZ(-Math.PI / 2); return g;   /* axe y -> axe x */
      }
      function latheZ(prof, seg) { var g = H.lathe(prof, seg || 24); g.rotateX(Math.PI / 2); return g; }   /* axe y -> axe z */
      function latheY(prof, seg) {
        var out = [prof[0]];
        for (var i = 1; i < prof.length - 1; i++) { out.push(prof[i]); out.push(prof[i]); }
        out.push(prof[prof.length - 1]);
        return H.lathe(out, seg || 24);
      }
      function hexPts(af, cx, cy) { var p = [], rc = af / Math.sqrt(3); for (var i = 0; i < 6; i++) p.push(H.pol(rc, i / 6 * TAU, cx, cy)); return p; }
      /* Lettre gravée ; miroir : dessinée à l'envers, pour se lire à l'endroit dans le repère miroir de la pédale droite. */
      function label(txt, col, miroir) {
        var c = document.createElement('canvas'); c.width = c.height = 64; var g = c.getContext('2d');
        if (miroir) { g.translate(64, 0); g.scale(-1, 1); }
        g.fillStyle = col; g.font = 'bold 50px Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 32, 35);
        var t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
        return new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: 0.5, metalness: 0.3, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
      }

      /* ---------- Matériaux (teintes approchées) ---------- */
      var bodyMat = S(0x212226, 0.55, 0.35, { envMapIntensity: 1.15 });       /* aluminium anodisé noir */
      var coreMat = S(0x1c1d21, 0.65, 0.4);                                  /* noyau du mécanisme */
      var jawMat = S(0xb3b8be, 1, 0.3);                                     /* mâchoires en acier */
      var spMat = S(0xd2d5d9, 1, 0.22);                                      /* axe en acier */
      var pinMat = S(0x9ea4ab, 1, 0.34);
      var dark = S(0x050506, 0.1, 0.9);
      var sealMat = S(0x101012, 0, 0.75);
      var cleatMat = S(0x141517, 0.5, 0.4);                                /* cale SM-SH51 noire */
      var plateMat = S(0xb8bcc1, 1, 0.36);
      var boltMat = S(0xa9aeb4, 1, 0.3);
      var outsole = S(0x27282b, 0, 0.88), midsole = S(0x585c63, 0.05, 0.6), insole = S(0x24282e, 0, 0.95);
      var ghost = S(0xa3abb3, 0.2, 0.6, { transparent: true, opacity: 0.13, depthWrite: false });
      var ghostLine = new THREE.LineBasicMaterial({ color: 0x7b848d, transparent: true, opacity: 0.4 });
      var slotMat = S(0x060606, 0, 0.95, { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
      var arrowMat = S(0xe07a1a, 0.1, 0.45, { emissive: 0x5a2a00, emissiveIntensity: 0.35 });

      /* ================= PÉDALE ================= */
      var pedalEx = new THREE.Group(); side.add(pedalEx);     /* écartée en vue éclatée */
      var pedal = new THREE.Group(); pedalEx.add(pedal);      /* avance au vissage */
      var YT = 7.6, BV = 1.7;                                  /* demi-épaisseur de la plateforme, chanfrein */
      function taper(z) { return 1 - 0.32 * Math.max(0, Math.min(1, (Math.abs(z) - 31) / 11.1)); }
      var platform;

      /* Plateforme : cadre, baie centrale du mécanisme (encoches d'accès aux vis de tension), quatre fenêtres. */
      (function () {
        var outer = [], X = 40 - BV, Zc = 43 - BV, RC = 10.7, k;
        function bulge(x) { var u = x / (X - RC); return 1.6 * (1 - u * u); }
        for (k = 0; k <= 10; k++) { var x1 = -(X - RC) + 2 * (X - RC) * k / 10; outer.push(H.V2(x1, -Zc - bulge(x1))); }
        for (k = 1; k < 8; k++) { var t1 = -Math.PI / 2 + k / 8 * Math.PI / 2; outer.push(H.V2(X - RC + RC * Math.cos(t1), -Zc + RC + RC * Math.sin(t1))); }
        for (k = 0; k <= 4; k++) outer.push(H.V2(X, -Zc + RC + 2 * (Zc - RC) * k / 4));
        for (k = 1; k < 8; k++) { var t2 = k / 8 * Math.PI / 2; outer.push(H.V2(X - RC + RC * Math.cos(t2), Zc - RC + RC * Math.sin(t2))); }
        for (k = 0; k <= 10; k++) { var x2 = (X - RC) - 2 * (X - RC) * k / 10; outer.push(H.V2(x2, Zc + bulge(x2))); }
        for (k = 1; k < 8; k++) { var t3 = Math.PI / 2 + k / 8 * Math.PI / 2; outer.push(H.V2(-X + RC + RC * Math.cos(t3), Zc - RC + RC * Math.sin(t3))); }
        for (k = 0; k <= 4; k++) outer.push(H.V2(-X, Zc - RC - 2 * (Zc - RC) * k / 4));
        for (k = 1; k < 8; k++) { var t4 = Math.PI + k / 8 * Math.PI / 2; outer.push(H.V2(-X + RC + RC * Math.cos(t4), -Zc + RC + RC * Math.sin(t4))); }
        var e = BV;
        var bay = rpoly([[-15 - e, -34 - e], [-7 - e, -34 - e], [-7 - e, -37.5 - e], [0 + e, -37.5 - e], [0 + e, -34 - e], [15 + e, -34 - e],
          [15 + e, 34 + e], [0 + e, 34 + e], [0 + e, 37.5 + e], [-7 - e, 37.5 + e], [-7 - e, 34 + e], [-15 - e, 34 + e]],
          [3, 1.5, 1.5, 1.5, 1.5, 3, 3, 1.5, 1.5, 1.5, 1.5, 3], 3);
        var holes = [bay, rrect(19.5 - e, -34 - e, 33 + e, 34 + e, 5.5, 5), rrect(-33 - e, -34 - e, -19.5 + e, 34 + e, 5.5, 5)];
        var g = planG(shp(outer, holes), -YT, YT, BV, 10), pos = g.attributes.position;
        /* traverses avant et arrière amincies vers le bord (profil en coin vu de côté) */
        for (var i = 0; i < pos.count; i++) pos.setY(i, pos.getY(i) * taper(pos.getZ(i)));
        g.computeVertexNormals();
        platform = H.mesh(g, bodyMat, pedal);
        /* tube d'axe visible dans les fenêtres, bossage côté manivelle, bouchon côté extérieur */
        H.mesh(latheX([[0, -39.5], [7.3, -39.5], [7.3, 39.5], [0, 39.5]], 40), bodyMat, pedal);
        H.mesh(latheX([[0, -41.6], [9.8, -41.6], [10.6, -41.0], [10.6, -38.5], [0, -38.5]], 48), bodyMat, pedal);
        H.mesh(latheX([[0, 39], [7.6, 39], [7.6, 40.6], [7.0, 41.3], [0, 41.3]], 40), bodyMat, pedal);
        H.mesh(new THREE.CircleGeometry(2.4, 6), dark, pedal, [41.32, 0, 0]).rotation.y = Math.PI / 2;
      })();

      /* Picots : 4 par face, sur les traverses avant et arrière. */
      var pinG = latheY([[0, 0], [1.45, 0], [1.45, 1.05], [1.05, 1.5], [0, 1.5]], 14);
      [-1, 1].forEach(function (face) {
        [[-25, -38.5], [25, -38.5], [-25, 38.5], [25, 38.5]].forEach(function (q) {
          var m = H.mesh(pinG, pinMat, pedal, [q[0], face * (YT * taper(q[1]) - 0.2), q[1]]);
          if (face < 0) m.rotation.x = Math.PI;
        });
      });

      /* Noyau du mécanisme (lit de la cale à y = ±7,8) et boîtiers de ressort aux deux bouts. */
      var BED = 7.8;
      H.mesh(planG(shp(rrect(-12.4 + 0.5, -20.8 + 0.5, 12.4 - 0.5, 20.8 - 0.5, 2, 3)), -BED, BED, 0.5, 6), coreMat, pedal);
      [-1, 1].forEach(function (s) {
        H.mesh(planG(shp(rrect(-12, s > 0 ? 20.6 : -27, 12, s > 0 ? 27 : -20.6, 1, 2)), -3.05, 3.05, 0, 4), coreMat, pedal);
        /* flasques latérales en acier qui portent les mâchoires */
        var fl = H.shape(rpoly([[-26.5, -7.1], [26.5, -7.1], [26.5, 7.1], [-26.5, 7.1]], 2.2, 3));
        H.mesh(sideG(fl, s * 13.55 - 0.8, s * 13.55 + 0.8, 0.15), jawMat, pedal);
        [-22.5, 0, 22.5].forEach(function (z) { H.cyl(1.4, 0.6, 'x', spMat, pedal, [s * 14.45, z ? 0 : -3.6, z], 14); });
      });

      /* Mâchoires SPD en acier : avant fixe, arrière avec la vis de tension et la plaquette de réglage.
         La face du dessous reprend le même mécanisme tourné de 180° autour de l'axe. */
      var LIPB = 10.3, LIPT = 12.1;
      /* Mâchoire en tôle d'acier pliée : lèvre au bord courbe (en plan) et dosseret vertical. s = +1 avant, -1 arrière. */
      function jawG(s) {
        var b = 0.22, p = [], i, k2 = s > 0 ? 0.022 : 0.009;
        for (i = 0; i <= 16; i++) { var x = -12 + b + (24 - 2 * b) * i / 16; p.push([x, s * (15.5 + b + k2 * x * x)]); }
        p.push([12 - b, s * (27 - b)], [-12 + b, s * (27 - b)]);
        var r = p.map(function (q, k) { return k > 16 ? 1.2 : (k === 0 || k === 16 ? 0.8 : 0); });
        var lip = planG(H.shape(rpoly(p, r, 3)), LIPB, LIPT, b, 6);
        var z0 = s > 0 ? 25.0 : -27, z1 = s > 0 ? 27 : -25.0;
        var back = planG(H.shape(rrect(-11 + 0.22, z0 + 0.22, 11 - 0.22, z1 - 0.22, 0.8, 2)), 4.4, LIPB + 0.6, 0.22, 4);
        return [lip, back];
      }
      var frontG = jawG(1), rearG = jawG(-1);
      /* vis de tension : tête à six-pans creux de 3 mm, vers l'arrière */
      var boltG = latheZ([[0, -30.3], [2.4, -30.3], [2.75, -29.8], [2.75, -27.3], [0, -27.3]], 28);
      function binding(face) {
        var g = new THREE.Group(); pedal.add(g); if (face < 0) g.rotation.x = Math.PI;
        frontG.forEach(function (q) { H.mesh(q, jawMat, g); });
        rearG.forEach(function (q) { H.mesh(q, jawMat, g); });
        var bolt = H.mesh(boltG, spMat, g, [-3.5, 7.3, 0]);
        var hx = H.mesh(new THREE.ShapeGeometry(H.shape(hexPts(3))), dark, g, [-3.5, 7.3, -30.32]); hx.rotation.y = Math.PI;
        H.cyl(1.4, 1.6, 'z', spMat, g, [-3.5, 7.3, -26.6], 12);
        /* plaquette de réglage : support, fenêtre et index */
        var plq = H.mesh(planG(shp(rrect(0.8, -27.9, 7.6, -27, 0.6, 2)), 4.6, 10.0, 0, 4), coreMat, g);
        H.box(1.9, 3.8, 0.3, dark, g, [4.2, 7.3, -27.95]);
        H.box(2.6, 1.1, 0.9, spMat, g, [4.2, 8.1, -28.0]);
        return { g: g, bolt: bolt, plq: plq };
      }
      var top = binding(1);
      binding(-1);

      /* Axe acier : épaulement, méplats de 15 mm, col, joint, filetage dans la manivelle. Il tourne au vissage. */
      var spindle = new THREE.Group(); pedal.add(spindle);
      H.mesh(latheX([[7.2, -55.4], [9.4, -55.4], [9.8, -55.0], [9.8, -53.4], [7.2, -53.4]], 40), spMat, spindle);
      var flats = (function () {
        /* profil (z, y) : méplats horizontaux en y = ±(F + b) = ±7,5, soit 15 mm sur plats, la clé de la figure Shimano */
        var R = 9.85, F = 7.15, a = Math.asin(F / R), p = [], i;
        for (i = 0; i <= 12; i++) { var t = -a + (2 * a) * i / 12; p.push([R * Math.cos(t), R * Math.sin(t)]); }
        for (i = 0; i <= 12; i++) { var t2 = Math.PI - a + (2 * a) * i / 12; p.push([R * Math.cos(t2), R * Math.sin(t2)]); }
        var sh = H.shape(p.map(function (q) { return H.V2(q[0], q[1]); }));
        return H.mesh(sideG(sh, -53.4, -45.2, 0.35), spMat, spindle);
      })();
      H.mesh(latheX([[0, -45.3], [8.0, -45.3], [8.0, -43.4], [0, -43.4]], 32), spMat, spindle);
      H.mesh(latheX([[0, -43.5], [8.6, -43.5], [9.6, -42.9], [9.6, -42.0], [9.0, -41.5], [0, -41.5]], 40), sealMat, spindle);
      var THR0 = -68, THR1 = -55.4, PAS = 1.27;
      var threadCore = H.mesh(latheX([[0, THR0], [5.6, THR0], [6.35, THR0 + 0.8], [6.35, THR1], [0, THR1]], 32), spMat, spindle);
      (function () {
        /* filet à pas à gauche dans ce repère : la pédale droite, son miroir, a un pas à droite */
        var L = THR1 - 0.3 - (THR0 + 0.9), turns = L / PAS, N = Math.ceil(turns * 18), hp = [];
        for (var i = 0; i <= N; i++) {
          var t = i / N, an = t * turns * TAU;
          hp.push([THR0 + 0.9 + t * L, 6.72 * Math.cos(an), -6.72 * Math.sin(an)]);
        }
        H.tube(hp, 0.5, spMat, spindle, false, N, 6);
      })();
      /* repère gravé sur le méplat supérieur : R (dessiné à l'envers, lu dans le miroir) ou L */
      function lettre(txt, miroir) {
        var m = H.mesh(new THREE.PlaneGeometry(6.4, 6.4), label(txt, '#2b2e33', miroir), spindle, [-49.3, 7.53, 0]);
        m.rotation.set(Math.PI / 2, Math.PI, 0); return m;
      }
      var lblR = lettre('R', true), lblL = lettre('L', false);

      /* Flèches du sens du serrage (repères de dessin) : rotation positive autour de +x dans ce repère, donc antihoraire
         vue du bout de la pédale gauche, et horaire vue du bout de la droite, son miroir. */
      function fleche(x0, r, phi0, arc, parent) {
        var g = new THREE.Group(); parent.add(g);
        var tg = new THREE.TorusGeometry(r, 0.85, 8, 56, arc); tg.rotateZ(phi0); tg.rotateY(Math.PI / 2);
        H.mesh(tg, arrowMat, g, [x0, 0, 0]);
        var p1 = phi0 + arc, P = new THREE.Vector3(x0, r * Math.sin(p1), -r * Math.cos(p1)), T = new THREE.Vector3(0, Math.cos(p1), Math.sin(p1));
        var cone = H.mesh(new THREE.ConeGeometry(2.3, 5.6, 18), arrowMat, g);
        cone.position.copy(P).addScaledVector(T, 2.2); cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), T);
        return g;
      }
      var flecheBout = fleche(46.5, 11, -0.6, 4.6, pedal);
      fleche(-49.3, 13.4, 2.2, 4.4, pedal);

      /* ================= MANIVELLE (en transparence) ================= */
      var crank = new THREE.Group(); side.add(crank);
      (function () {
        var p = [];
        for (var i = 0; i <= 20; i++) { var t = Math.PI / 2 + i / 20 * Math.PI; p.push(H.V2(15.5 * Math.cos(t), 15.5 * Math.sin(t))); }
        p.push(H.V2(72, -13), H.V2(72, 13));
        var sh = H.shape(p); sh.holes.push(H.path(H.circlePts(7.3, 32)));
        var g = sideG(sh, -72.5, -55.4, 1.2);
        H.mesh(g, ghost, crank);
        crank.add(new THREE.LineSegments(new THREE.EdgesGeometry(g, 28), ghostLine));
      })();

      /* ================= SEMELLE + CALE ================= */
      var HOV = 18;                                            /* semelle au-dessus de la pédale, cale dégagée */
      var shoe = new THREE.Group(); side.add(shoe); shoe.position.y = HOV;
      var sole = new THREE.Group(), cleat = new THREE.Group(), plate = new THREE.Group(), bolts = new THREE.Group();
      shoe.add(sole); shoe.add(cleat); shoe.add(plate); shoe.add(bolts);
      var Z0 = -24, CH = 19, ZCH = 50;                        /* coupe arrière de la section, demi-largeur et bout du creux */
      var Y_LUG = 10.6, Y_CEIL = 14.8, Y_BASE = 18.0, Y_WRAP = 20.8, Y_MID = 23.2, Y_INS = 25.0;
      var SLOT = { x: 7, len: 25.6, w: 5.6 };                  /* fentes : 20 mm de réglage plus le diamètre de la vis */
      /* contour de l'avant-pied (côté médial vers -x, vers la manivelle), du bord de coupe au bout arrondi */
      var OUT = (function () {
        var p = [], i, n = 10;
        function lat(z) { return 44.5 - 0.0012 * (z - 10) * (z - 10); }
        function med(z) { return -(46.5 - 0.001 * (z - 15) * (z - 15)); }
        function bez(a, b, c, d, t) { var u = 1 - t; return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d; }
        for (i = 0; i <= n; i++) { var z = Z0 + (50 - Z0) * i / n; p.push([lat(z), z]); }
        var La = lat(50), Me = med(50), tx = -6, tz = 91;
        for (i = 1; i <= 10; i++) { var t = i / 10; p.push([bez(La, La, tx + 0.55 * (La - tx), tx, t), bez(50, 50 + 0.55 * (tz - 50), tz, tz, t)]); }
        for (i = 1; i <= 10; i++) { var t2 = i / 10; p.push([bez(tx, tx - 0.55 * (tx - Me), Me, Me, t2), bez(tz, tz, 50 + 0.55 * (tz - 50), 50, t2)]); }
        for (i = 1; i <= n; i++) { var z2 = 50 - (50 - Z0) * i / n; p.push([med(z2), z2]); }
        return p;
      })();
      function offset(d) {   /* contour décalé de d vers l'intérieur, extrémités maintenues sur la coupe */
        var n = OUT.length, r = [];
        for (var i = 0; i < n; i++) {
          var a = OUT[Math.max(0, i - 1)], c = OUT[Math.min(n - 1, i + 1)], tx = c[0] - a[0], tz = c[1] - a[1], l = Math.hypot(tx, tz) || 1;
          r.push([OUT[i][0] - tz / l * d, (i === 0 || i === n - 1) ? Z0 : OUT[i][1] + tx / l * d]);
        }
        return r;
      }
      function sideAt(poly, z, s) {
        var best = null;
        for (var i = 0; i < poly.length; i++) {
          var a = poly[i], b = poly[(i + 1) % poly.length];
          if (a[1] === b[1] || (a[1] - z) * (b[1] - z) > 0) continue;
          var x = a[0] + (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]);
          if (best === null || (s > 0 ? x > best : x < best)) best = x;
        }
        return best;
      }
      function toV(p) { return p.map(function (q) { return H.V2(q[0], q[1]); }); }
      function fentes() { return [-SLOT.x, SLOT.x].map(function (x) { return pill(x, 0, SLOT.len, SLOT.w, Math.PI / 2, 6); }); }
      /* semelle d'usure, percée des deux fentes du réglage avant-arrière */
      var outsoleM = H.mesh(planG(shp(toV(offset(0)), fentes()), Y_CEIL, Y_BASE, 0), outsole, sole);
      H.mesh(planG(H.shape(toV(offset(0.5))), Y_BASE, Y_MID, 0), midsole, sole);
      H.mesh(planG(H.shape(toV(offset(1.6))), Y_MID, Y_INS, 0), insole, sole);
      /* caoutchouc remontant sur les flancs et sur le bout */
      H.mesh(planG(H.shape(toV(offset(-0.15).concat(offset(1.4).reverse()))), Y_BASE - 0.1, Y_WRAP, 0), outsole, sole);
      /* crampons, bords et fond du creux de la cale */
      (function () {
        var b = 0.4, IN = offset(1.3);
        function lug(x0, z0, x1, z1, r) {
          z0 = Math.max(z0, Z0); if (z1 - z0 < 2) return;
          var zs = [z0, (z0 + z1) / 2, z1];
          var xl = Math.min.apply(null, zs.map(function (z) { return sideAt(IN, z, 1); })), xm = Math.max.apply(null, zs.map(function (z) { return sideAt(IN, z, -1); }));
          x0 = Math.max(x0, xm); x1 = Math.min(x1, xl); if (x1 - x0 < 3) return;
          var c = z0 <= Z0 ? 0 : r;
          H.mesh(planG(H.shape(rpoly([[x0 + b, z0 + b], [x1 - b, z0 + b], [x1 - b, z1 - b], [x0 + b, z1 - b]], [c, c, r, r], 3)), Y_LUG, Y_CEIL + 0.2, b, 4), outsole, sole);
        }
        [1, -1].forEach(function (s) {
          function X(a, c) { return s > 0 ? [a, c] : [-c, -a]; }
          var e = X(CH, CH + 2.6); lug(e[0], Z0, e[1], ZCH + 2.6, 0);
          [-20, -8, 4, 16, 28, 40].forEach(function (zc) { var q = X(CH + 3.6, 30.5); lug(q[0], zc - 4.6, q[1], zc + 4.6, 1.6); });
          [-14, -2, 10, 22, 34, 46].forEach(function (zc) { var q = X(32, 60); lug(q[0], zc - 4.6, q[1], zc + 4.6, 1.6); });
        });
        lug(-CH, ZCH, CH, ZCH + 2.6, 0);
        [[58, 0], [69, 6], [80, 0]].forEach(function (row) {
          [[-44, -29], [-26, -12], [-9, 6], [9, 23], [26, 44]].forEach(function (w) { lug(w[0] + row[1], row[0] - 4.4, w[1] + row[1], row[0] + 4.4, 1.6); });
        });
      })();
      /* fond des fentes */
      fentes().forEach(function (f) {
        var g = new THREE.ShapeGeometry(H.shape(f)); g.rotateX(Math.PI / 2); H.mesh(g, slotMat, sole, [0, Y_BASE - 0.03, 0]);
      });
      /* relevé de la pointe */
      sole.traverse(function (o) {
        if (!o.isMesh) return;
        var pa = o.geometry.attributes.position;
        for (var i = 0; i < pa.count; i++) { var z = pa.getZ(i); if (z > 46) pa.setY(i, pa.getY(i) + 0.0032 * (z - 46) * (z - 46)); }
        o.geometry.computeVertexNormals();
      });

      /* Cale SM-SH51 : semelle à pattes avant et arrière, corps, poche de la plaquette, trous oblongs (réglage latéral). */
      (function () {
        var b = 0.3, Y1 = BED, Y2 = 9.6, Y3 = 11.6, Y4 = Y_CEIL;
        var pocket = rrect(-13.1 - b, -6.2 - b, 13.1 + b, 6.2 + b, 1.6, 3);
        var o = [[-10.5, -19.5], [10.5, -19.5], [10.5, -14], [15, -11.5], [15, 11.5], [8, 13]], i;
        var nose = [];
        for (i = 1; i < 12; i++) { var t = i / 12 * Math.PI; nose.push([8 * Math.cos(t), 13 + 7.5 * Math.sin(t)]); }
        var pts = o.concat(nose, [[-8, 13], [-15, 11.5], [-15, -11.5], [-10.5, -14]]);
        var rr = pts.map(function (q, k) { return (k >= 6 && k < 6 + nose.length) ? 0 : 1.2; });
        var L1 = rpoly(pts.map(function (q) { return [q[0] * (1 - b / 15), q[1] * (1 - b / 20)]; }), rr, 3);
        H.mesh(planG(shp(L1, [pocket]), Y1, Y2, b, 8), cleatMat, cleat);
        H.mesh(planG(shp(rrect(-15 + b, -11.5 + b, 15 - b, 11.5 - b, 2, 3), [pocket]), Y2, Y3, b, 8), cleatMat, cleat);
        H.mesh(planG(shp(rrect(-14.6 + b, -11.2 + b, 14.6 - b, 11.2 - b, 2.4, 3), [pill(-7, 0, 10.9, 5.9, 0, 5), pill(7, 0, 10.9, 5.9, 0, 5)]), Y3, Y4, b, 8), cleatMat, cleat);
      })();
      /* plaquette en acier dans la poche, sous les têtes de vis */
      H.mesh(planG(shp(rrect(-10.6 + 0.25, -5.4 + 0.25, 10.6 - 0.25, 5.4 - 0.25, 1.6, 3), [H.circlePts(2.75, 20, -7, 0), H.circlePts(2.75, 20, 7, 0)]), 9.9, 11.6, 0.25, 8), plateMat, plate);
      /* 2 vis : tête basse à six-pans creux de 4 mm, tige filetée */
      var headG = latheY([[0, 8.2], [3.8, 8.2], [4.3, 8.65], [4.3, 9.9], [0, 9.9]], 28);
      var shaftG = (function () {
        var p = [[0, 9.9], [2.4, 9.9]];
        for (var k = 0; k < 9; k++) { var y = 10.3 + k * 0.8; p.push([2.45, y], [2.1, y + 0.4]); }
        p.push([2.0, 17.9], [0, 17.9]);
        return H.lathe(p, 18);
      })();
      var boltHeads = [];
      [-7, 7].forEach(function (x) {
        boltHeads.push(H.mesh(headG, boltMat, bolts, [x, 0, 0]));
        H.mesh(shaftG, boltMat, bolts, [x, 0, 0]);
        var hx = H.mesh(new THREE.ShapeGeometry(H.shape(hexPts(4))), dark, bolts, [x, 8.18, 0]); hx.rotation.x = Math.PI / 2;
      });

      /* ---------- Côté et vissage ---------- */
      var droite = true, ins = 100, lastEx = 0;
      var ENG = 12.2, OUT0 = 22;                               /* longueur engagée du filetage, sortie à 0 % */
      function poser() {
        side.scale.x = droite ? -1 : 1;
        lblR.visible = droite; lblL.visible = !droite;
        var off = OUT0 * (1 - ins / 100);
        pedal.position.x = off;
        /* rotation positive autour de +x quand la pédale avance vers la manivelle ; nulle une fois vissée à fond */
        spindle.rotation.x = -Math.min(off, ENG) / PAS * TAU;
        api.dirty();
      }

      /* ---------- Pastilles ---------- */
      function pinsNow() {
        return [
          { obj: platform, p: [30, YT, -39], text: 'Pédale Shimano PD-ME700, SPD (le système de cales Shimano) : un mécanisme d’accrochage par face' },
          { obj: flats, p: [-49.3, 0, -10.3], text: 'Méplats de l’axe : clé plate de 15 mm ; serre la pédale à 35-55 Nm, à la TW-6.2 avec une tête de clé plate de 15 mm' },
          { obj: threadCore, p: [-64, 0, -6.9], text: 'Filetage : un peu de graisse (non fournie), puis les premiers tours à la main' },
          droite
            ? { obj: lblR, p: [0, -5.6, 0.2], text: 'Repère R, pédale droite : pas à droite, elle se visse comme une vis ordinaire (flèche de l’étape 8.3 du guide)' }
            : { obj: lblL, p: [0, -5.6, 0.2], text: 'Repère L, pédale gauche : pas à gauche, elle se visse dans le sens inverse de la droite (flèche de l’étape 8.2 du guide)' },
          droite
            ? { obj: flecheBout, p: [46.5, 0, 11], text: 'Flèches orange : le sens du serrage, horaire vu du bout de la pédale droite' }
            : { obj: flecheBout, p: [46.5, 0, 11], text: 'Flèches orange : le sens du serrage, antihoraire vu du bout de la pédale gauche' },
          { obj: top.bolt, p: [0, 0, -30.4], text: 'Vis de tension, à l’arrière du mécanisme : clé six-pans de 3 mm ; en sens horaire, la cale tient plus fort ; quatre clics par tour' },
          { obj: top.plq, p: [4.2, 10, -27.9], text: 'Plaquette de réglage : mets les quatre vis au même réglage, en la regardant et en comptant les tours' },
          { obj: cleat, p: [12, 8.4, -14], text: 'Cale SM-SH51, noire : elle va au pied gauche comme au droit ; ni jeu ni cale qui bouge avant de rouler' },
          { obj: boltHeads[1], p: [0, 9, -4.4], text: 'Vis de cale, six-pans de 4 mm : d’abord 2,5 Nm à la clé Canyon si sa plage le permet (à lire sur l’outil), aucun de tes outils ne descend si bas ; puis 5-6 Nm en alternant, à l’ATD-1.2' },
          { obj: outsoleM, p: [-30, Y_CEIL, Z0], text: 'Semelle d’une chaussure SPD à deux vis, en coupe : la cale se règle sur 20 mm d’avant en arrière et 5 mm de gauche à droite' }
        ];
      }
      poser();

      return {
        group: root,
        parts: [
          { obj: pedalEx, off: [48, 0, 0] },
          { obj: sole, off: [0, 58, 0] }, { obj: cleat, off: [0, 38, 0] }, { obj: plate, off: [0, 26, 0] }, { obj: bolts, off: [0, 14, 0] }
        ],
        pins: pinsNow(),
        controls: [
          { type: 'segmented', value: 'R', options: [{ label: 'Pédale droite (R)', value: 'R' }, { label: 'Pédale gauche (L)', value: 'L' }],
            onChange: function (v) { droite = v === 'R'; poser(); api.setPins(pinsNow()); } },
          { type: 'range', label: 'Vissage', min: 0, max: 100, step: 1, value: 100,
            format: function (v) { return v >= 100 ? 'à fond, puis 35-55 Nm' : v > 45 ? 'elle se visse' : 'à la main'; },
            onChange: function (v) { ins = v; poser(); } }
        ],
        /* vue éclatée : le tout descend un peu, pour garder la semelle dans le cadre */
        onFrame: function () {
          var e = api.viewer ? api.viewer.ex : 0;
          if (e !== lastEx) { lastEx = e; root.position.y = -26 * e * e * (3 - 2 * e); }
          return false;
        }
      };
    }
  });
})();
