/* Atelier Grizl : disque Center Lock de 160 mm du Grizl CF 8 Di2 sur le moyeu avant DT Swiss 350 (axe 12x100), sa
   bague et l'outil de serrage, en vue éclatée.
   Canyon liste un disque « Shimano Deore XT MT800 » de 160 mm (fiche suisse) ; l'onglet des pièces d'usure de sa fiche
   anglaise propose un RT-CL800. Modèle exact, RT-MT800 ou RT-CL800 : à lire sur la pièce. Le disque est dessiné en
   disque XT : piste, araignée à six bras, ailettes de refroidissement (ICE TECHNOLOGIES FREEZA sur la fiche Shimano).
   Bague Center Lock : Shimano dessine le RT-MT800 avec deux bagues, l'une à serrer au TL-LR15, l'autre « external
   spline type » au TL-FC36, toutes deux à 40 Nm (EV-BR-RX820-5000C). Type de bague d'origine : à lire sur la pièce.
   Ici, la bague est dessinée à denture extérieure, l'un des deux types possibles, avec son outil TL-FC36 ; une bague
   à denture intérieure se serre au TL-LR15 avec une clé de 24 mm (DM-RAWH010).
   Pièces : moyeu et ses cannelures, piste, ailettes, araignée et rivets, flèche de rotation, bague, outil.
   Formes approchées (aucune cote publiée dans les documents cités) :
   - moyeu, flasques, trous de rayons, cannelures et embouts : forme approchée ;
   - piste, pattes de rivetage, araignée, rivets et ailettes : forme approchée ; épaisseur de la piste approchée,
     épaisseur neuve à lire sur la pièce ;
   - fentes de la piste : une rangée de fentes à cinq pans, comme sur la vue éclatée EV-BR-RX820-5000C et la photo
     officielle du vélo ; nombre, taille et forme approchés ;
   - couleur des ailettes : claires sur la photo officielle, rendues en gris métal ;
   - flèche peinte : place et forme approchées ;
   - bague à denture extérieure : forme et nombre d'encoches approchés ;
   - outil TL-FC36 : douille, crans et carré d'entraînement approchés (carré à lire sur l'outil).
   Plan du disque : XY. Axe de roue : z (côté extérieur du vélo vers +z). Unités : mm. */
(function () {
  'use strict';
  var TAU = Math.PI * 2;

  AtelierModels.register('rotor', {
    camera: { yaw: 0.86, pitch: 0.4, dist: 345, target: [0, -5, 2], min: 140, max: 700 },
    explodeLabel: 'Vue éclatée',
    build: function (ctx) {
      var THREE = ctx.THREE, H = ctx.H, M = ctx.M, api = ctx.api;
      var root = new THREE.Group();

      /* Profil de tour avec arêtes vives : un sommet doublé à chaque angle marqué. */
      function lath(prof, seg) {
        var out = [prof[0]];
        for (var i = 1; i < prof.length - 1; i++) {
          var a = prof[i - 1], b = prof[i], c = prof[i + 1];
          var ux = b[0] - a[0], uy = b[1] - a[1], vx = c[0] - b[0], vy = c[1] - b[1];
          var cs = (ux * vx + uy * vy) / (Math.hypot(ux, uy) * Math.hypot(vx, vy) || 1);
          out.push(b); if (cs < 0.82) out.push([b[0], b[1]]);
        }
        out.push(prof[prof.length - 1]);
        return H.orient(H.lathe(out, seg || 72), 'z');
      }
      /* Extrusion d'épaisseur totale T (chanfrein compris), centrée sur zc. */
      function ext(sh, T, b, zc, curve) {
        var g = b > 0 ? H.extrude(sh, T - 2 * b, { bevel: b, curve: curve || 24 }) : H.extrude(sh, T, { curve: curve || 24 });
        if (zc) g.translate(0, 0, zc); return g;
      }
      /* Fente à cinq pans n° j sur 30, centrée à 69,5 mm du centre : 8,5 de haut, 6,8 de large (valeurs de dessin). */
      function slot5(j) {
        var a = (j + 0.5) / 30 * TAU, ca = Math.cos(a), sa = Math.sin(a), h = 4.25, w = 3.4, rf = 69.5;
        function q(r, t) { return H.V2(ca * r - sa * t, sa * r + ca * t); }
        return [q(rf + h, -w), q(rf + h, w), q(rf - h / 3, w), q(rf - h, 0), q(rf - h / 3, -w)].reverse();
      }

      /* ---------- Matériaux propres au modèle ---------- */
      var cv = document.createElement('canvas'); cv.width = cv.height = 512;
      var g2 = cv.getContext('2d'); g2.fillStyle = 'rgb(70,70,70)'; g2.fillRect(0, 0, 512, 512);
      for (var rr = 1; rr < 256; rr += 0.75) {
        var mm = rr / 256 * 85, onTrack = mm > 64.5 && mm < 79.2;
        var v = onTrack ? 34 + Math.random() * 26 : 62 + Math.random() * 40;
        g2.strokeStyle = 'rgb(' + (v | 0) + ',' + (v | 0) + ',' + (v | 0) + ')'; g2.lineWidth = 1;
        g2.beginPath(); g2.arc(256, 256, rr, 0, TAU); g2.stroke();
      }
      var rough = new THREE.CanvasTexture(cv); rough.repeat.set(1 / 170, 1 / 170); rough.offset.set(0.5, 0.5);
      var trackMat = new THREE.MeshStandardMaterial({ color: 0xdfe2e6, metalness: 1, roughness: 1, roughnessMap: rough });
      var hubMat = new THREE.MeshStandardMaterial({ color: 0xa9aeb4, metalness: 0.92, roughness: 0.36 });
      var spiderMat = new THREE.MeshStandardMaterial({ color: 0x050506, metalness: 0.4, roughness: 0.42, envMapIntensity: 0.9 });
      /* ailettes : claires sur la photo officielle du vélo, rendues en gris métal (couleur approchée) */
      var finMat = new THREE.MeshStandardMaterial({ color: 0xaeb3b9, metalness: 0.9, roughness: 0.4, envMapIntensity: 0.8 });
      var holeMat = new THREE.MeshStandardMaterial({ color: 0x020202, metalness: 0.2, roughness: 0.9 });
      var capMat = new THREE.MeshStandardMaterial({ color: 0x060607, metalness: 0.45, roughness: 0.38 });
      var paint = new THREE.MeshStandardMaterial({ color: 0xf4f4f0, metalness: 0, roughness: 0.55, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
      var toolMat = new THREE.MeshStandardMaterial({ color: 0x1a1c1f, metalness: 0.85, roughness: 0.36, transparent: true, opacity: 1 });

      /* ---------- Moyeu avant DT Swiss 350 (axe 12x100), forme approchée ---------- */
      var hub = new THREE.Group(); root.add(hub);
      H.mesh(lath([[11.2, -84], [13, -84], [16, -82.5], [17, -72], [22, -71.2], [27.4, -70.6], [28, -70], [28, -67], [27.4, -66.4], [19, -65.4],
        [16, -62], [14.3, -50], [14, -40], [14.3, -30], [16, -20], [19, -16.6], [27.4, -15.6], [28, -15], [28, -12], [27.4, -11.4], [22, -10.8],
        [21, -10], [21, -2.6], [20.4, -2], [16.9, -2], [11.2, -2]], 96), hubMat, hub);
      /* trous de rayons dans les deux flasques */
      [-13.5, -68.5].forEach(function (zf, f) {
        for (var i = 0; i < 12; i++) {
          var a = i / 12 * TAU + f * TAU / 24;
          H.cyl(1.25, 3.3, 'z', holeMat, hub, [23.5 * Math.cos(a), 23.5 * Math.sin(a), zf], 10);
        }
      });
      /* interface Center Lock : cannelures extérieures */
      var spl = H.shape(H.gearPts(24, 17, 18.3, { tip: 0.3, flank: 0.1 }));
      spl.holes.push(H.path(H.circlePts(16.9, 64)));
      var splines = H.mesh(ext(spl, 6.6, 0.2, 1.3, 4), hubMat, hub);
      /* embouts d'axe 12 mm (noirs) */
      var cap = H.mesh(lath([[6, -1.8], [11, -1.8], [11, 12.6], [10.4, 13.6], [9.2, 14], [6.8, 14], [6, 13.3], [6, -1.8]], 64), capMat, hub);
      H.mesh(lath([[6, -93.3], [6.8, -94], [9.2, -94], [10.4, -93.6], [11, -92.6], [11, -84], [6, -84], [6, -93.3]], 64), capMat, hub);
      H.mesh(new THREE.CircleGeometry(6.05, 32), holeMat, hub, [0, 0, 8]);

      /* ---------- Disque : piste acier + araignée alu noir ---------- */
      var rotor = new THREE.Group(); root.add(rotor);
      var sweep = 0.2, R0 = 25.3, Rt = 62.4, rivR = 58.6;
      function phi(k, r) { return k * TAU / 6 + Math.PI / 2 + sweep * Math.max(0, r - R0) / (Rt - R0); }
      function hw(r) {
        if (r < 31) return 6.6 + (31 - r) * (31 - r) * 0.16;
        if (r < 50) return 6.6 - (r - 31) * 0.02;
        if (r < 55) { var t = (r - 50) / 5; t = t * t * (3 - 2 * t); return 6.22 + t * 1.6; }
        return 7.82;
      }
      function adiff(a, b) { return Math.atan2(Math.sin(a - b), Math.cos(a - b)); }
      /* piste : bord intérieur à 63 mm avec 6 pattes de rivetage */
      var track = H.shape(H.circlePts(80, 220));
      var inner = [], NI = 600, i, k, q, r;
      for (i = 0; i < NI; i++) {
        var a = i / NI * TAU, rIn = 63;
        for (k = 0; k < 6; k++) {
          var s = adiff(a, phi(k, rivR)) * 63 / 8.6;
          if (Math.abs(s) < 1) rIn = Math.min(rIn, 63 - 9.6 * Math.pow(1 - Math.pow(Math.abs(s), 3), 0.5));
        }
        inner.push(H.pol(rIn, a));
      }
      track.holes.push(H.path(inner));
      /* une rangée de 30 fentes à cinq pans, bord extérieur droit, pointe vers le moyeu (forme approchée d'après la
         vue éclatée EV-BR-RX820-5000C et la photo officielle du vélo, comme la pièce de la scène) */
      for (var j = 0; j < 30; j++) track.holes.push(H.path(slot5(j)));
      var trackM = H.mesh(ext(track, 1.8, 0.18, 0, 12), trackMat, rotor);
      /* ailettes de refroidissement noires (peigne) entre les bras, plaquées sur le bord intérieur de la piste */
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
      var fins = H.mesh(ext(finsSh, 2.4, 0.3, 2.1, 4), finMat, rotor);
      /* moyeu de l'araignée (trou cannelé Center Lock) */
      var ring = H.shape(H.circlePts(25.7, 96));
      ring.holes.push(H.path(H.gearPts(24, 18.45, 17.15, { tip: 0.3, flank: 0.1, phase: -TAU / 48 })));
      H.mesh(ext(ring, 6.6, 0.4, 1.3, 4), spiderMat, rotor);
      /* six bras */
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
      var armM = H.mesh(ext(armSh, 3, 0.35, 2.4, 6), spiderMat, rotor);
      /* rivets : tête bombée dehors, tête plate côté moyeu */
      var rivTop = new THREE.SphereGeometry(2.8, 20, 8, 0, TAU, 0, Math.PI / 2); rivTop.scale(1, 0.45, 1); rivTop.rotateX(Math.PI / 2);
      for (k = 0; k < 6; k++) {
        var ra = phi(k, rivR), rx = rivR * Math.cos(ra), ry = rivR * Math.sin(ra);
        H.mesh(rivTop, M.steel, rotor, [rx, ry, 3.9]);
        H.cyl(2.6, 0.5, 'z', M.steel, rotor, [rx, ry, -1.15], 20);
      }
      /* flèche blanche peinte : sens de rotation (antihoraire vu de l'extérieur) */
      var ka = 0, rA = 39.5, aA = phi(ka, rA), arr = new THREE.Shape();
      arr.moveTo(-5.6, -1.3); arr.lineTo(0.8, -1.3); arr.lineTo(0.8, -3.4); arr.lineTo(5.9, 0); arr.lineTo(0.8, 3.4); arr.lineTo(0.8, 1.3); arr.lineTo(-5.6, 1.3); arr.lineTo(-5.6, -1.3);
      var arrow = H.mesh(new THREE.ShapeGeometry(arr), paint, rotor, [rA * Math.cos(aA), rA * Math.sin(aA), 3.93]);
      arrow.rotation.z = aA + Math.PI / 2;

      /* ---------- Bague Center Lock dessinée à denture extérieure, l'un des deux types possibles (forme approchée) ---------- */
      var lock = new THREE.Group(); root.add(lock);
      var lr = H.shape(H.gearPts(16, 20.7, 22.5, { tip: 0.6, flank: 0.05 }));
      lr.holes.push(H.path(H.circlePts(15.5, 64)));
      var lockM = H.mesh(ext(lr, 3.5, 0.3, 6.35, 3), M.lockring, lock);
      H.mesh(lath([[15.5, -1.9], [16.8, -1.9], [16.8, 4.62], [15.5, 4.62], [15.5, -1.9]], 64), M.lockring, lock);
      for (i = 0; i < 6; i++) H.mesh(new THREE.TorusGeometry(16.8, 0.28, 6, 48), M.lockring, lock, [0, 0, -1.2 + i * 0.95]);

      /* ---------- Outil Shimano TL-FC36, celui de la bague à denture extérieure : douille à crans, carré d'entraînement
         (forme approchée) ---------- */
      var tool = new THREE.Group(); root.add(tool);
      var tl = H.shape(H.circlePts(26, 96));
      tl.holes.push(H.path(H.gearPts(16, 23, 20.95, { tip: 0.22, flank: 0.03, phase: -TAU / 32 })));
      var toolLug = H.mesh(ext(tl, 3.8, 0.25, 6.5, 3), toolMat, tool);
      H.mesh(lath([[12.5, 8.4], [26, 8.4], [26, 15.2], [25.2, 16], [12.5, 16], [12.5, 8.4]], 96), toolMat, tool);
      [10.6, 12.8].forEach(function (z) { H.mesh(new THREE.TorusGeometry(26, 0.35, 6, 96), holeMat, tool, [0, 0, z]); });
      var hex = H.shape(H.circlePts(18.5, 6)); hex.holes.push(H.path(H.roundRect(9.6, 9.6, 0.5).getPoints(2)));
      H.mesh(ext(hex, 7, 0.5, 19.5, 2), toolMat, tool);
      H.mesh(new THREE.PlaneGeometry(9.6, 9.6), holeMat, tool, [0, 0, 17]);
      tool.visible = false;

      /* ---------- Pastilles ---------- */
      function pp(r, a, z) { return [r * Math.cos(a), r * Math.sin(a), z]; }
      var pinsBase = [
        { obj: trackM, p: pp(76, -2.0, 0.9), text: 'Disque Deore XT MT800, 160 mm : modèle exact à lire sur la pièce' },
        { obj: trackM, p: pp(72, -0.35, 0.9), text: 'Piste : hors d’usage à 1,5 mm ou si l’aluminium se voit' },
        { obj: fins, p: pp(57.5, phi(0, rivR) + 0.62, 3.3), text: 'Araignée et ailettes de refroidissement' },
        { obj: arrow, p: [0, -12, 0], text: 'Flèche : dans le sens de rotation de la roue' },
        { obj: splines, p: pp(18.3, -1.2, 4.6), text: 'Cannelures Center Lock : propres, sans graisse' },
        { obj: lockM, p: pp(22.2, 1.75, 1.75), text: 'Bague, ici à denture extérieure (type à lire) : 40 Nm' },
        { obj: cap, p: [0, 0, 14], text: 'Moyeu DT Swiss 350, axe traversant de 12 mm' }
      ];
      var pinTool = { obj: tool, p: pp(26, 0.3, 14), text: 'Outil TL-FC36, avec des gants (bague à denture intérieure : TL-LR15)' };
      var toolShown = false;

      return {
        group: root,
        parts: [{ obj: rotor, off: [0, 0, 18] }, { obj: lock, off: [0, 0, 38] }, { obj: tool, off: [0, 0, 62] }],
        pins: pinsBase,
        onFrame: function () {
          var e = api.viewer ? api.viewer.ex : 0, show = e > 0.03;
          toolMat.opacity = Math.min(1, e * 1.6);
          if (show !== toolShown) { toolShown = show; tool.visible = show; api.setPins(show ? pinsBase.concat([pinTool]) : pinsBase); }
          return false;
        }
      };
    }
  });
})();
