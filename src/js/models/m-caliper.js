/* Atelier Grizl : étrier flat mount du Grizl CF 8 Di2 à deux pistons opposés, plaquettes en résine à ailettes.
   Canyon ne nomme ni l'étrier ni les plaquettes. L'étrier est dessiné sur le BR-RX820, celui que Shimano recommande avec
   les manettes ST-RX825 (fiche ST-RX825, fiche BR-RX820) : modèle monté à lire sur la pièce. Les plaquettes sont les
   L05A-RF, en résine, à ailettes (« w/ fin » sur la fiche BR-RX820, plaquette standard du tableau C-192), les plaquettes
   d'origine à confirmer sur la pièce. Couples du chapitre 2 : axe de plaquettes du BR-RX820 1-1,5 Nm à la clé Allen de
   3 mm (DM-GADBR01-11), vis de fixation 6-8 Nm (DM-GADBR01), raccord de durite côté étrier 5-7 Nm (DM-GADBR10).
   Pièces : corps monobloc, deux pistons en résine (fiche BR-RX820), deux plaquettes et leurs garnitures, ressort,
   axe et clip de retenue, raccord et vis de purge sous leurs caches, raccord de durite, segment de disque, support
   flat mount et ses deux vis.
   Formes approchées (aucune cote publiée dans les documents cités) :
   - corps, ponts, logements des pistons et joints : forme approchée ;
   - pistons : forme approchée ; leur couleur aussi, la fiche dit seulement « Resin » ;
   - plaquettes : plaque, garniture et ailettes en forme approchée d'après la vue éclatée EV-BR-RX820-5000C, où les
     ailettes de la L05A-RF sortent au-dessus de la plaque, en peigne, vers l'extérieur ; repères L et R : place
     approchée ;
   - ressort, axe, tête d'axe et clip : forme approchée ;
   - raccord de purge et vis de purge, sous leurs caches : place et forme approchées d'après les figures du DM-GADBR10
     et de la vue éclatée, qui les montrent sur la même face du corps ;
   - raccord et durite : forme et trajet approchés ;
   - segment de disque : piste, épaisseur et fentes à cinq pans approchées, comme le disque de 2.2 ;
   - support flat mount et vis : forme approchée (support exact, avec ou sans adaptateur, à lire sur la pièce).
   Repère : x le long de l'étrier (arrière vers +x), y vers le haut (sortie des plaquettes, à l'opposé du centre du disque),
   z à travers la fente (côté vis de fixation vers +z). Disque dans le plan XY, en z = 0. Unités : mm. */
(function () {
  'use strict';
  var TAU = Math.PI * 2;

  AtelierModels.register('caliper', {
    camera: { yaw: 0.62, pitch: 0.42, dist: 215, target: [3, 3, 2], min: 100, max: 520 },
    explodeLabel: 'Vue éclatée',
    build: function (ctx) {
      var THREE = ctx.THREE, H = ctx.H, M = ctx.M, api = ctx.api;
      var root = new THREE.Group();

      function lath(prof, seg) {
        var out = [prof[0]];
        for (var i = 1; i < prof.length - 1; i++) {
          var a = prof[i - 1], b = prof[i], c = prof[i + 1];
          var ux = b[0] - a[0], uy = b[1] - a[1], vx = c[0] - b[0], vy = c[1] - b[1];
          var cs = (ux * vx + uy * vy) / (Math.hypot(ux, uy) * Math.hypot(vx, vy) || 1);
          out.push(b); if (cs < 0.82) out.push([b[0], b[1]]);
        }
        out.push(prof[prof.length - 1]);
        return H.lathe(out, seg || 48);
      }
      function ext(sh, T, b, zc, curve) {
        var g = b > 0 ? H.extrude(sh, T - 2 * b, { bevel: b, curve: curve || 16, bevelSegments: 3 }) : H.extrude(sh, T, { curve: curve || 16 });
        if (zc) g.translate(0, 0, zc); return g;
      }
      function prism(sh, T, b, axis) { var g = ext(sh, T, b, 0, 4); if (axis === 'x') g.rotateY(Math.PI / 2); else if (axis === 'y') g.rotateX(-Math.PI / 2); return g; }
      function hexPts(rc, rot) { var p = []; for (var i = 0; i < 6; i++) p.push(H.pol(rc, i / 6 * TAU + (rot || 0))); return p; }
      function label(txt) {
        var c = document.createElement('canvas'); c.width = c.height = 64; var g = c.getContext('2d');
        g.fillStyle = '#f2f2ee'; g.font = 'bold 52px Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 32, 35);
        return new THREE.MeshStandardMaterial({ map: (function (t) { t.colorSpace = THREE.SRGBColorSpace; return t; })(new THREE.CanvasTexture(c)), transparent: true, roughness: 0.6, metalness: 0, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
      }

      /* ---------- Matériaux ---------- */
      var bodyMat = new THREE.MeshStandardMaterial({ color: 0x060607, metalness: 0.4, roughness: 0.36, envMapIntensity: 0.9 });
      var finMat = new THREE.MeshStandardMaterial({ color: 0x040405, metalness: 0.4, roughness: 0.42, envMapIntensity: 0.8 });
      var lining = new THREE.MeshStandardMaterial({ color: 0x141516, metalness: 0.6, roughness: 0.78 });
      var plateMat = new THREE.MeshStandardMaterial({ color: 0xa4a9ae, metalness: 1, roughness: 0.38 });
      /* pistons en résine : couleur approchée */
      var resinMat = new THREE.MeshStandardMaterial({ color: 0xe4ded0, metalness: 0, roughness: 0.4 });
      var dark = new THREE.MeshStandardMaterial({ color: 0x020202, metalness: 0.1, roughness: 0.9 });
      var hoseMat = new THREE.MeshPhysicalMaterial({ color: 0x040405, roughness: 0.32, metalness: 0, clearcoat: 0.6, clearcoatRoughness: 0.2 });
      var rubber = new THREE.MeshStandardMaterial({ color: 0x050506, roughness: 0.8, metalness: 0 });
      var cw = document.createElement('canvas'); cw.width = cw.height = 64; var gw = cw.getContext('2d');
      for (var yy = 0; yy < 8; yy++) for (var xx = 0; xx < 8; xx++) {
        var on = ((xx + yy) >> 1) % 2 === 0; gw.fillStyle = on ? '#3a3e46' : '#1b1d22'; gw.fillRect(xx * 8, yy * 8, 8, 8);
        gw.fillStyle = 'rgba(255,255,255,0.06)'; gw.fillRect(xx * 8, yy * 8, on ? 8 : 1, on ? 1 : 8);
      }
      var weave = new THREE.CanvasTexture(cw); weave.wrapS = weave.wrapT = THREE.RepeatWrapping; weave.repeat.set(1 / 7, 1 / 7); weave.colorSpace = THREE.SRGBColorSpace;
      var carbonMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, map: weave, metalness: 0.15, roughness: 0.45, clearcoat: 1, clearcoatRoughness: 0.08 });

      var DC = -71.5; /* centre du disque (y) : piste de r 63 à 80, plaquettes centrées vers r 71,5 */
      var GAP = 0.3, LIN0 = 3.8, PL = 2.2, DT = 1.8, AXY = 14.5;

      /* ---------- Corps monobloc ---------- */
      var body = new THREE.Group(); root.add(body);
      var ZC = 14.8; /* milieu de chaque moitié en z */
      [1, -1].forEach(function (sd) {
        var sh = new THREE.Shape();
        sh.moveTo(-20.5, -15.1); sh.lineTo(20.5, -15.1); sh.quadraticCurveTo(26.9, -15.1, 27.0, -8.6); sh.lineTo(27.6, 9.8);
        sh.quadraticCurveTo(27.6, 16.6, 20.8, 16.6); sh.lineTo(-20.8, 16.6); sh.quadraticCurveTo(-27.6, 16.6, -27.6, 9.8);
        sh.lineTo(-27.0, -8.6); sh.quadraticCurveTo(-26.9, -15.1, -20.5, -15.1);
        sh.holes.push(H.path(H.circlePts(13.2, 72, 0, -1)));
        H.mesh(ext(sh, 13.6, 2.4, 0, 24), bodyMat, body, [0, 0, sd * ZC]);
        /* bossage de piston sur la face extérieure */
        var boss = H.mesh(H.orient(lath([[0, 2.0], [11.6, 2.0], [13.2, 1.4], [13.8, 0.4], [13.8, -1.6]].reverse(), 72), 'z'), bodyMat, body, [0, -1, sd * 21.6]);
        if (sd < 0) boss.scale.z = -1;
        /* joint de piston à l'embouchure de l'alésage */
        H.mesh(new THREE.TorusGeometry(11.3, 0.6, 8, 64), dark, body, [0, -1, sd * 9.3]);
      });
      /* ponts au-dessus du disque, de part et d'autre de la fenêtre */
      [1, -1].forEach(function (sx) {
        var s = new THREE.Shape(); var x0 = 20, x1 = 28.6, y0 = 9, y1 = 17.8, r = 8;
        s.moveTo(x0, y0); s.lineTo(x1, y0); s.lineTo(x1, y1 - r); s.quadraticCurveTo(x1, y1, x1 - r, y1); s.lineTo(x0, y1); s.lineTo(x0, y0);
        var g = ext(s, 20.8, 0.6, 0, 10); if (sx < 0) g.scale(-1, 1, 1);
        H.mesh(g, bodyMat, body);
      });
      /* raccord de purge et vis de purge sous leurs caches, sur la face extérieure de la moitié z- (place approchée) */
      var bleed = new THREE.Group(); body.add(bleed); bleed.position.set(0, 0, -ZC - 6.8);
      H.cyl(3.6, 1.6, 'z', bodyMat, bleed, [14, -10, -0.8], 28);
      H.cyl(3.1, 2.4, 'z', rubber, bleed, [14, -10, -2.8], 24);
      H.cyl(3.4, 1.0, 'z', bodyMat, bleed, [-19, 9, -0.5], 28);
      H.cyl(2.9, 1.4, 'z', rubber, bleed, [-19, 9, -1.7], 24);
      /* raccord de durite à l'arrière, durite noire */
      var fit = new THREE.Group(); body.add(fit); fit.position.set(29.6, 6.5, ZC);
      H.cyl(5, 4, 'x', bodyMat, fit, [1.5, 0, 0], 32);
      var nut = H.mesh(prism(H.shape(hexPts(4.62, Math.PI / 6)), 6, 0.35, 'x'), M.steelDark, fit, [6.5, 0, 0]);
      H.cyl(3.1, 3, 'x', rubber, fit, [10.5, 0, 0], 24, 2.7);
      H.tube([[11, 0, 0], [17, 0, 0], [24, 2.5, -1.5], [29, 10, -5], [31, 22, -9], [31, 36, -12]], 2.5, hoseMat, fit, false, 80, 14);

      /* ---------- Segment de disque (acier 1,8 mm) ---------- */
      var disc = new THREE.Group(); root.add(disc);
      var a0 = Math.PI / 2 - 0.78, a1 = Math.PI / 2 + 0.78, P = [], i;
      for (i = 0; i <= 60; i++) P.push(H.pol(80, a0 + (a1 - a0) * i / 60, 0, DC));
      for (i = 60; i >= 0; i--) P.push(H.pol(63, a0 + (a1 - a0) * i / 60, 0, DC));
      var ds = H.shape(P);
      /* une rangée de fentes à cinq pans, comme le disque de 2.2 (forme approchée) */
      for (var j = 0; j < 30; j++) {
        var aa = (j + 0.5) / 30 * TAU, ca = Math.cos(aa), sa = Math.sin(aa); if (aa < a0 + 0.12 || aa > a1 - 0.12) continue;
        var q = function (r, t) { return H.V2(ca * r - sa * t, DC + sa * r + ca * t); };
        ds.holes.push(H.path([q(73.75, -3.4), q(73.75, 3.4), q(68.08, 3.4), q(65.25, 0), q(68.08, -3.4)].reverse()));
      }
      H.mesh(ext(ds, DT, 0.15, 0, 10), M.steel, disc);

      /* ---------- Plaquettes L05A-RF à ailettes (une de chaque côté, la seconde en miroir) ---------- */
      function yArc(r, x) { return Math.sqrt(r * r - x * x) + DC; }
      var linSh = (function () {
        var p = [], k, w = 16.5;
        for (k = 0; k <= 16; k++) { var x = -w + 2 * w * k / 16; p.push(H.V2(x, yArc(79.5, x) - (Math.abs(x) > w - 1.5 ? (Math.abs(x) - w + 1.5) * 0.9 : 0))); }
        for (k = 16; k >= 0; k--) { var x2 = -w + 2 * w * k / 16; p.push(H.V2(x2, yArc(64, x2) + (Math.abs(x2) > w - 1.5 ? (Math.abs(x2) - w + 1.5) * 0.9 : 0))); }
        return H.shape(p);
      })();
      var plateSh = (function () {
        var p = [], k, w = 19;
        for (k = 0; k <= 8; k++) { var x = -w + 1.5 + (2 * w - 3) * k / 8; p.push(H.V2(x, yArc(63, x) - 0.4)); }
        p.push(H.V2(w, yArc(63, w) + 1.5), H.V2(w, yArc(81, w) - 1.5), H.V2(w - 1.5, yArc(81, w - 1.5)));
        p.push(H.V2(7.5, yArc(81, 7.5)), H.V2(6.5, 11), H.V2(6.5, 16), H.V2(5.4, 17.1), H.V2(-5.4, 17.1), H.V2(-6.5, 16), H.V2(-6.5, 11), H.V2(-7.5, yArc(81, 7.5)));
        p.push(H.V2(-w + 1.5, yArc(81, w - 1.5)), H.V2(-w, yArc(81, w) - 1.5), H.V2(-w, yArc(63, w) + 1.5));
        var s = H.shape(p); s.holes.push(H.path(H.circlePts(1.7, 20, 0, AXY))); return s;
      })();
      /* ailette : une plaque qui monte du haut de la plaque d'appui, percée pour l'axe, puis un peigne de lames qui
         sortent vers l'extérieur au-dessus du corps (forme approchée d'après la vue éclatée EV-BR-RX820-5000C) */
      var FIN_X = [-12, -6, 0, 6, 12], FIN_Y = [20.4, 28.4], FIN_D = 7, FIN_T = 2.4;
      var finSh = H.roundRect(30, 20, 2.2, 0, 18.6); finSh.holes.push(H.path(H.circlePts(1.7, 20, 0, AXY)));
      var finG = ext(finSh, FIN_T, 0.3, 0, 6);
      var bladeG = new THREE.BoxGeometry(1.2, FIN_Y[1] - FIN_Y[0], FIN_D);
      var linG = ext(linSh, 1, 0, 0, 8);
      var plateG = ext(plateSh, PL, 0.2, 0, 8);
      var pads = [], lin = [], shift = [], pistons = [];
      [1, -1].forEach(function (sd, n) {
        var part = new THREE.Group(); part.scale.z = sd; root.add(part);
        var lm = H.mesh(linG, lining, part); lin.push(lm);
        var sg = new THREE.Group(); part.add(sg); shift.push(sg);
        var zp = DT / 2 + GAP + LIN0 + PL / 2;
        H.mesh(plateG, plateMat, sg, [0, 0, zp]);
        /* plaque de l'ailette : même face côté disque que la plaque d'appui, un peu plus épaisse vers l'extérieur */
        var zf = zp - PL / 2 + 0.05 + FIN_T / 2;
        H.mesh(finG, finMat, sg, [0, 0, zf]);
        FIN_X.forEach(function (x) { H.mesh(bladeG, finMat, sg, [x, (FIN_Y[0] + FIN_Y[1]) / 2, zf + FIN_T / 2 + FIN_D / 2]); });
        var lb = H.mesh(new THREE.PlaneGeometry(3.6, 3.6), label(n ? 'L' : 'R'), sg, [9, 24.4, zf + FIN_T / 2 + 0.02]);
        if (sd < 0) lb.scale.x = -1;
        pads.push(part);
        /* piston en résine (dans la moitié du corps du même côté) */
        var pg = new THREE.Group(); pg.scale.z = sd; root.add(pg);
        var pin = H.mesh(H.orient(lath([[0, 0], [9.9, 0], [10.5, 0.6], [10.5, 11]], 64), 'z'), resinMat, pg, [0, -1, DT / 2 + GAP + LIN0 + PL]);
        pistons.push(pin);
      });
      /* ressort de plaquettes en W (inox), posé sur l'axe entre les deux plaquettes */
      var spring = new THREE.Group(); root.add(spring);
      (function () {
        var zIn = DT / 2 + GAP + LIN0 - 0.05;
        var pts = [[-zIn, 10.7], [-zIn + 0.1, 13.1], [-zIn + 0.6, 18.4], [-2.1, 16.25], [0, 19.7], [2.1, 16.25], [zIn - 0.6, 18.4], [zIn - 0.1, 13.1], [zIn, 10.7]];
        var t = 0.22, up = [], dn = [];
        for (var k = 0; k < pts.length; k++) {
          var a = pts[Math.max(0, k - 1)], b = pts[Math.min(pts.length - 1, k + 1)], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
          var nx = -dy / L * t, ny = dx / L * t;
          up.push(H.V2(-(pts[k][0] + nx), pts[k][1] + ny)); dn.push(H.V2(-(pts[k][0] - nx), pts[k][1] - ny));
        }
        var sh = H.shape(up.concat(dn.reverse()));
        var g = H.extrude(sh, 11, { curve: 4 }); g.rotateY(Math.PI / 2);
        H.mesh(g, M.steel, spring);
      })();
      /* axe de plaquettes : tête côté intérieur (z-), clip de retenue au bout côté vis (z+) */
      var axle = new THREE.Group(); root.add(axle); axle.position.set(0, AXY, 0);
      H.cyl(1.5, 46.2, 'z', M.steel, axle, [0, 0, 1.5], 20);
      var head = H.mesh(H.orient(lath([[0, 0], [3.4, 0], [3.4, 1.8], [3.0, 2.3], [0, 2.3]], 32), 'z'), M.steel, axle, [0, 0, -21.6]);
      head.scale.z = -1;
      H.mesh(new THREE.CircleGeometry(1.4, 6), dark, axle, [0, 0, -23.92]).rotation.y = Math.PI;
      var clip = new THREE.Group(); root.add(clip); clip.position.set(0, AXY, 23.0);
      (function () {
        var o = [], k, n = 40, ga = 0.55;
        for (k = 0; k <= n; k++) o.push(H.pol(3.6, -Math.PI / 2 + ga + (TAU - 2 * ga) * k / n));
        for (k = n; k >= 0; k--) o.push(H.pol(1.25, -Math.PI / 2 + ga + (TAU - 2 * ga) * k / n));
        H.mesh(ext(H.shape(o), 0.7, 0, 0, 4), M.steel, clip);
        [-1, 1].forEach(function (s) { H.cyl(0.55, 0.9, 'z', M.steel, clip, [s * 1.6, -3.0, 0], 10); });
      })();

      /* ---------- Support flat mount en carbone et vis de fixation ---------- */
      var sup = H.roundRect(66, 9, 3.5, 0, 0);
      var supG = ext(sup, 10.5, 1.4, 0, 10); supG.rotateX(Math.PI / 2);
      var support = H.mesh(supG, carbonMat, root, [0, -22.75, ZC]);
      var bolts = [];
      [-16, 16].forEach(function (x) {
        var b = new THREE.Group(); root.add(b); b.position.set(x, -28.0, ZC);
        H.cyl(2.5, 21, 'y', M.steelDark, b, [0, 10.5, 0], 16);
        H.cyl(4.6, 0.8, 'y', M.steel, b, [0, -0.4, 0], 24);
        var hd = H.mesh(lath([[0, -4.6], [3.6, -4.6], [4.2, -4.1], [4.2, -0.8], [0, -0.8]], 32), M.steelDark, b);
        H.mesh(new THREE.CircleGeometry(1.7, 6), dark, b, [0, -4.62, 0]).rotation.x = Math.PI / 2;
        bolts.push(b); b.userData.head = hd;
      });

      /* ---------- Usure des garnitures (rattrapage automatique) ---------- */
      function setWear(v) {
        var t = LIN0 - (LIN0 - 0.5) * v / 100, d = LIN0 - t;
        lin.forEach(function (m) { m.scale.z = t; m.position.z = DT / 2 + GAP + t / 2; });
        shift.forEach(function (g) { g.position.z = -d; });
        pistons.forEach(function (p) { p.position.z = DT / 2 + GAP + LIN0 + PL - d; });
        spring.children[0].scale.z = (DT / 2 + GAP + LIN0 - d) / (DT / 2 + GAP + LIN0);
      }
      setWear(0);

      var pins = [
        { obj: body, p: [-22, -9, ZC + 7], text: 'Étrier BR-RX820 attendu : modèle à lire sur le corps' },
        { obj: axle, p: [0, 0, 7.5], text: 'Axe du BR-RX820 : 1-1,5 Nm, clé Allen de 3 mm' },
        { obj: clip, p: [-1.2, -1.2, 0.4], text: 'Clip de retenue : il bloque l’axe' },
        { obj: spring, p: [5.5, 19.8, -3.5], text: 'Ressort : s’il touche le disque, change les plaquettes' },
        { obj: pads[0], p: [-13, 28.6, 6.1], text: 'Plaquettes L05A-RF en résine, à confirmer : repères L et R' },
        { obj: lin[0], p: [16.4, 4, 0.5], text: 'Garniture : à changer à 0,5 mm' },
        { obj: pistons[0], p: [0, 0, 0], text: 'Pistons en résine : à repousser bien droit, outil plat' },
        { obj: bolts[1].userData.head, p: [0, -4.6, 3], text: 'Vis de fixation de l’étrier : 6-8 Nm' },
        { obj: nut, p: [0, 0, 0], text: 'Raccord de durite côté étrier : 5-7 Nm' }
      ];

      return {
        group: root,
        parts: [
          { obj: pads[0], off: [0, 25, 12] }, { obj: pads[1], off: [0, 25, -12] }, { obj: spring, off: [0, 34, 0] },
          { obj: axle, off: [0, 0, -40] }, { obj: clip, off: [0, 0, 16] },
          { obj: bolts[0], off: [0, -20, 0] }, { obj: bolts[1], off: [0, -20, 0] }, { obj: disc, off: [0, -30, 0] }
        ],
        pins: pins,
        controls: [{ type: 'range', label: 'Usure', min: 0, max: 100, step: 1, value: 0,
          format: function (v) { return v >= 100 ? '0,5 mm : à changer' : v + ' %'; }, onChange: setWear }]
      };
    }
  });
})();
