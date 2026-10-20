/* Atelier Grizl : purge d'un frein Shimano GRX (DM-GADBR01-10, pages 50 à 66).
   En haut, manette BL-RX820 sur un bout de cintre : capuchon rabattu vers l'avant, vis de purge retirée,
   entonnoir TL-BR002 vissé à sa place. La durite descend vers un étrier flat mount simplifié (roue et plaquettes
   déposées, cale de purge jaune entre les pistons). Sur le purgeur : seringue TL-BR001 (Injecter) ou sachet (Gravité).
   Repère : x vers l'arrière du vélo (le bec de la cocotte pointe vers -x), y vers le haut, z vers l'extérieur
   de la manette. Unités : mm. */
(function () {
  'use strict';
  var TAU = Math.PI * 2;

  AtelierModels.register('bleed', {
    camera: { yaw: 0.24, pitch: 0.28, dist: 455, target: [50, -24, 0], min: 180, max: 900 },
    build: function (ctx) {
      var THREE = ctx.THREE, H = ctx.H, M = ctx.M, api = ctx.api, V2 = H.V2;
      var root = new THREE.Group();
      var i, x;

      /* ---------- Outils ---------- */
      function V3(a, b, c) { return new THREE.Vector3(a, b, c || 0); }
      function lin(m) { if (m.color) m.color.convertSRGBToLinear(); if (m.emissive) m.emissive.convertSRGBToLinear(); return m; }
      function S(c, met, rough, extra) { return lin(new THREE.MeshStandardMaterial(Object.assign({ color: c, metalness: met, roughness: rough }, extra || {}))); }
      function P(o) { return lin(new THREE.MeshPhysicalMaterial(o)); }
      var seed = 11;
      function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
      function canvasTex(w, h, draw, rep) {
        var c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
        var t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; if (rep) t.repeat.set(rep[0], rep[1]);
        return t;
      }
      /* Extrusion centrée sur z = 0, épaisseur totale T, chanfrein arrondi b sans déborder du contour. */
      function ext(sh, T, b, curve) {
        var g = new THREE.ExtrudeGeometry(sh, { depth: T - 2 * b, bevelEnabled: b > 0, bevelThickness: b, bevelSize: b, bevelOffset: -b, bevelSegments: 3, curveSegments: curve || 12, steps: 1 });
        g.translate(0, 0, -(T - 2 * b) / 2); return g;
      }
      function hexPts(rc, rot) { var p = []; for (var k = 0; k < 6; k++) p.push(H.pol(rc, k / 6 * TAU + (rot || 0))); return p; }
      function prism(sh, T, b, axis) { var g = ext(sh, T, b, 4); if (axis === 'x') g.rotateY(Math.PI / 2); else if (axis === 'y') g.rotateX(-Math.PI / 2); return g; }
      function crv(pts, closed) { return new THREE.CatmullRomCurve3(pts.map(function (p) { return p.isVector3 ? p.clone() : V3(p[0], p[1], p[2]); }), !!closed, 'centripetal'); }
      function smoothPts(pts, n) { return crv(pts, true).getSpacedPoints(n).slice(0, -1).map(function (p) { return V2(p.x, p.y); }); }
      /* Pièce transparente : faces arrière d'abord, liquide ensuite, faces avant en dernier. */
      function glass(geo, mat, parent, pos) {
        var back = mat.clone(); back.side = THREE.BackSide;
        var mb = H.mesh(geo, back, parent, pos); mb.renderOrder = 1;
        var mf = H.mesh(geo, mat, parent, pos); mf.renderOrder = 3;
        return mf;
      }

      /* ---------- Textures ---------- */
      var hoodBump = canvasTex(64, 64, function (g, w, h) {
        g.fillStyle = '#9a9a9a'; g.fillRect(0, 0, w, h);
        for (var j = 0; j < 4; j++) for (var k = 0; k < 5; k++) {
          var cx = k * 16 + (j % 2) * 8, cy = j * 16 + 8, gr = g.createRadialGradient(cx, cy, 0, cx, cy, 6.5);
          gr.addColorStop(0, '#3c3c3c'); gr.addColorStop(1, '#9a9a9a'); g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, 6.5, 0, TAU); g.fill();
        }
      }, [1 / 7, 1 / 7]);
      var tapeTex = canvasTex(64, 64, function (g, w, h) {
        g.fillStyle = '#9a9a9a'; g.fillRect(0, 0, w, h);
        for (var k = -1; k <= 1; k++) {
          g.save(); g.translate(k * w, 0);
          g.strokeStyle = '#555'; g.lineWidth = 8; g.beginPath(); g.moveTo(-2, 0); g.lineTo(w - 2, h); g.stroke();
          g.strokeStyle = '#d0d0d0'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(4, 0); g.lineTo(w + 4, h); g.stroke();
          g.restore();
        }
        for (var n = 0; n < 420; n++) { g.fillStyle = rnd() < 0.5 ? '#7e7e7e' : '#b2b2b2'; g.fillRect(rnd() * w, rnd() * h, 1, 1); }
      });
      var tickTex = canvasTex(32, 256, function (g, w, h) {
        g.clearRect(0, 0, w, h); g.fillStyle = '#fff';
        for (var k = 0; k <= 12; k++) { var yy = 6 + k * (h - 12) / 12; g.fillRect(0, yy - 1.5, k % 2 ? 12 : 24, 3); }
      });
      tickTex.wrapS = tickTex.wrapT = THREE.ClampToEdgeWrapping;

      /* ---------- Matériaux ---------- */
      var mBody = S(0x26272b, 0.2, 0.5);
      var mCover = S(0x161617, 0, 0.82, { bumpMap: hoodBump, bumpScale: 0.45 });
      var mBlade = S(0x1d1e21, 0.6, 0.36);
      var mBar = S(0x222327, 0.75, 0.4);
      var mTape = S(0x1c1c1e, 0, 0.8, { bumpMap: tapeTex, bumpScale: 0.7 });
      var mVinyl = P({ color: 0x0e0e0f, roughness: 0.2, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08 });
      var mHole = S(0x050505, 0, 1, { side: THREE.BackSide });
      var mCal = S(0x1c1d21, 0.6, 0.3);
      var mYellow = S(0xf2c31b, 0, 0.48);
      var mBlackPl = S(0x18181a, 0.05, 0.48);
      var mWhite = S(0xd3d8de, 0, 0.36);
      var mClear = P({ color: 0xd2dbe2, metalness: 0, roughness: 0.06, transparent: true, opacity: 0.3, depthWrite: false, clearcoat: 1, clearcoatRoughness: 0.04 });
      var mFunnel = P({ color: 0xc4ced8, metalness: 0, roughness: 0.05, transparent: true, opacity: 0.36, depthWrite: false, clearcoat: 1, clearcoatRoughness: 0.04 });
      var mOil = P({ color: 0xe8586c, metalness: 0, roughness: 0.1, transparent: true, opacity: 0.62, depthWrite: false, side: THREE.DoubleSide });
      var mOilCore = P({ color: 0xe8586c, metalness: 0, roughness: 0.15, transparent: true, opacity: 0.7, depthWrite: false });
      var mBead = S(0xe24a60, 0, 0.22, { emissive: 0x5c0c18, emissiveIntensity: 0.55 });
      var mBubble = S(0xf4f8fb, 0.25, 0.08);
      var mTick = new THREE.MeshBasicMaterial({ color: 0x1e2024, map: tickTex, transparent: true, depthWrite: false, alphaTest: 0.25 });

      /* =====================================================================
         Manette et bout de cintre, dans un groupe qui pivote pour « Cocotte à 45° »
         ===================================================================== */
      var PIV = [0, -40];
      var lev = new THREE.Group(); lev.position.set(PIV[0], PIV[1], 0); root.add(lev);
      var L = new THREE.Group(); L.position.set(-PIV[0], -PIV[1], 0); lev.add(L);

      /* Cintre : rampe coupée en x = 64, courbe du drop (rayon 60), bas du drop jusqu'au bouchon. */
      function barCtl(x0, x1) {
        var c = [];
        for (var xx = x0; xx > 10.5; xx -= 9) c.push(V3(xx, 0, 0));
        for (var k = 0; k <= 36; k++) { var ph = k / 36 * Math.PI; c.push(V3(10 - 60 * Math.sin(ph), -60 + 60 * Math.cos(ph), 0)); }
        for (xx = 17; xx < x1; xx += 7) c.push(V3(xx, -120, 0));
        c.push(V3(x1, -120, 0)); return c;
      }
      H.mesh(new THREE.TubeGeometry(crv(barCtl(64, 40)), 220, 11.9, 28, false), mBar, L);
      var tapeCurve = crv(barCtl(50, 39));
      var tapeG = new THREE.TubeGeometry(tapeCurve, 260, 14.1, 28, false);
      tapeTex.repeat.set(Math.round(tapeCurve.getLength() / 24), 1);
      H.mesh(tapeG, mTape, L);
      /* ruban de finition, coupe du cintre, bouchon */
      H.cyl(14.45, 12, 'x', mVinyl, L, [50, 0, 0], 36);
      var cut = new THREE.RingGeometry(10.2, 11.9, 32); cut.rotateY(Math.PI / 2); H.mesh(cut, M.alu, L, [64, 0, 0]);
      H.mesh(H.orient(new THREE.CylinderGeometry(10.2, 10.2, 10, 28, 1, true), 'x'), mHole, L, [59, 0, 0]);
      var plugDisc = new THREE.CircleGeometry(10.2, 24); plugDisc.rotateY(Math.PI / 2); H.mesh(plugDisc, S(0x050505, 0, 1), L, [54.5, 0, 0]);
      H.mesh(H.orient(H.lathe([[0, 0], [14.4, 0], [14.6, 1.2], [14.2, 2.6], [12, 3.4], [0, 3.8]], 36), 'x'), mBlackPl, L, [39.2, -120, 0]);

      /* Corps de la cocotte (profil latéral extrudé). */
      var bodyCtl = [[14, 16], [4, 19.5], [-8, 23.5], [-20, 26.5], [-32, 28.5], [-44, 31.5], [-55, 37], [-64, 45], [-71, 54], [-77, 60], [-83, 62], [-89, 59.5], [-94, 52],
        [-96.5, 41], [-95.5, 29], [-91, 18], [-84, 9], [-75, 3], [-65, -1], [-54, -5], [-46, -10], [-39, -16], [-30, -13.5], [-18, -9], [-6, -5], [6, -2.5], [14, 2]];
      var bodyPts = smoothPts(bodyCtl, 170);
      H.mesh(ext(H.shape(bodyPts), 28, 3.5, 12), mBody, L);

      /* Capuchon caoutchouc rabattu vers l'avant : il ne couvre plus que le bec, avec un bourrelet roulé. */
      (function () {
        var n = bodyPts.length, area = 0, off = [], k;
        for (k = 0; k < n; k++) { var q = bodyPts[(k + 1) % n]; area += bodyPts[k].x * q.y - q.x * bodyPts[k].y; }
        var sg = area > 0 ? 1 : -1;
        for (k = 0; k < n; k++) {
          var a = bodyPts[(k - 1 + n) % n], b = bodyPts[(k + 1) % n], tx = b.x - a.x, ty = b.y - a.y, l = Math.hypot(tx, ty);
          off.push(V2(bodyPts[k].x + sg * ty / l * 2.6, bodyPts[k].y - sg * tx / l * 2.6));
        }
        var XC = -52, st = 0, run = [];
        for (k = 0; k < n; k++) if (off[k].x <= XC && off[(k - 1 + n) % n].x > XC) { st = k; break; }
        for (k = 0; k < n; k++) { var p = off[(st + k) % n]; if (p.x > XC) break; run.push(p); }
        H.mesh(ext(H.shape(run), 34, 4.5, 12), mCover, L);
        var lip = [[-52, -11.5, 9], [-52.3, -9, 17], [-52.6, 6, 18.8], [-52.6, 24, 18.8], [-52.4, 34.5, 15.5], [-52.2, 40, 8], [-52, 41.5, 0],
          [-52.2, 40, -8], [-52.4, 34.5, -15.5], [-52.6, 24, -18.8], [-52.6, 6, -18.8], [-52.3, -9, -17], [-52, -11.5, -9]];
        var lipG = new THREE.TubeGeometry(crv(lip), 90, 4.2, 14, false); lipG.translate(52, 0, 0); lipG.scale(1.7, 1, 1); lipG.translate(-52.5, 0, 0);
        H.mesh(lipG, mCover, L);
      })();

      /* Levier de frein. */
      (function () {
        var bl = crv([[-82, 10], [-90, -12], [-96, -36], [-98, -62], [-94, -88], [-84, -110], [-69, -128]]);
        var wid = [24, 21, 18.5, 17, 16, 15, 14], NB = 44, left = [], right = [], k;
        function wAt(u) { var f = u * (wid.length - 1), j = Math.min(wid.length - 2, Math.floor(f)); return wid[j] + (wid[j + 1] - wid[j]) * (f - j); }
        for (k = 0; k <= NB; k++) {
          var u = k / NB, c = bl.getPointAt(u), tg = bl.getTangentAt(u), w = wAt(u) / 2;
          left.push(V2(c.x - tg.y * w, c.y + tg.x * w)); right.push(V2(c.x + tg.y * w, c.y - tg.x * w));
        }
        var ce = bl.getPointAt(1), te = bl.getTangentAt(1), we = wid[wid.length - 1] / 2, a0 = Math.atan2(te.y, te.x), tip = [];
        for (k = 1; k < 8; k++) { var aa = a0 + Math.PI / 2 - k / 8 * Math.PI; tip.push(V2(ce.x + we * Math.cos(aa), ce.y + we * Math.sin(aa))); }
        H.mesh(ext(H.shape(left.concat(tip, right.reverse())), 12, 2.4, 8), mBlade, L);
      })();

      /* Bossage du trou de purge, embase noire et entonnoir TL-BR002 avec l'huile. */
      var LEVEL = 64.5;
      var fun = new THREE.Group(); fun.position.set(-25, 0, 0); L.add(fun);
      H.cyl(6.6, 6.5, 'y', mBody, fun, [0, 27.25, 0], 32);
      var adapter = H.mesh(prism(H.shape(hexPts(6.3)), 4.2, 0.4, 'y'), mBlackPl, fun, [0, 32.6, 0]);
      H.cyl(4.7, 2.6, 'y', mBlackPl, fun, [0, 35.8, 0], 28);
      glass(H.lathe([[4.0, 34], [4.0, 39], [4.6, 40], [13.6, 50.3], [13.6, 79.7], [15.0, 80.5], [15.0, 82.5], [12.6, 82.5], [12.6, 51.4], [2.2, 40.9], [2.2, 34], [4.0, 34]], 48), mFunnel, fun);
      var oilProf = [[0, 40.7], [2.0, 40.7], [7.2, 46], [12.35, 51.3]];
      for (var yy = 52.3; yy < 81.5; yy += 1) oilProf.push([12.35, yy]);
      oilProf.push([12.35, 81.5], [8, 81.5], [4, 81.5], [0, 81.5]);
      var oilGeo = H.lathe(oilProf, 40), oilP0 = Float32Array.from(oilGeo.attributes.position.array);
      var oilMesh = H.mesh(oilGeo, mOil, fun); oilMesh.renderOrder = 2;

      /* =====================================================================
         Étrier flat mount simplifié (roue et plaquettes déposées)
         ===================================================================== */
      var cal = new THREE.Group(); cal.position.set(118, -101, 0); root.add(cal);
      var halfG = ext(H.roundRect(58, 30, 7, 0, 1), 14, 2.2, 10);
      var bossG = H.orient(H.lathe([[0, 0], [12.5, 0], [12.5, 0.8], [11.6, 1.9], [9, 2.5], [0, 2.6]], 56), 'z');
      var panelG = ext(H.roundRect(50, 23, 5, 0, 0.5), 1.4, 0.5, 8);
      [1, -1].forEach(function (sd) {
        H.mesh(halfG, mCal, cal, [0, 0, sd * 14]);
        H.mesh(panelG, mCal, cal, [0, 0, sd * 21.2]);
        var bo = H.mesh(bossG, mCal, cal, [0, -2, sd * 21.8]); if (sd < 0) bo.scale.z = -1;
        H.mesh(ext(H.roundRect(10, 9, 2, 0, 0), 14.4, 0.8, 6), mCal, cal, [sd * 24, 11.5, 0]);
      });
      /* semelle flat mount sous la moitié extérieure, deux taraudages */
      H.mesh(ext(H.roundRect(52, 12, 4, 0, 0), 4, 1, 8).rotateX(Math.PI / 2), mCal, cal, [0, -15.2, 14]);
      [-16, 16].forEach(function (xx) { H.mesh(new THREE.CircleGeometry(2.6, 20).rotateX(Math.PI / 2), S(0x050505, 0, 1), cal, [xx, -17.25, 14]); });
      /* cale de purge jaune, dans la fente à la place des plaquettes */
      var blockSh = new THREE.Shape();
      blockSh.moveTo(-15, -9); blockSh.lineTo(15, -9); blockSh.quadraticCurveTo(18.5, -9, 18.5, -5.5); blockSh.lineTo(18.5, 13.5); blockSh.quadraticCurveTo(18.5, 17, 15, 17);
      blockSh.lineTo(8.5, 17); blockSh.quadraticCurveTo(6.5, 17, 6.5, 19); blockSh.lineTo(6.5, 24.5); blockSh.quadraticCurveTo(6.5, 28, 3, 28); blockSh.lineTo(-3, 28);
      blockSh.quadraticCurveTo(-6.5, 28, -6.5, 24.5); blockSh.lineTo(-6.5, 19); blockSh.quadraticCurveTo(-6.5, 17, -8.5, 17); blockSh.lineTo(-15, 17);
      blockSh.quadraticCurveTo(-18.5, 17, -18.5, 13.5); blockSh.lineTo(-18.5, -5.5); blockSh.quadraticCurveTo(-18.5, -9, -15, -9);
      blockSh.holes.push(H.path(H.circlePts(2.4, 20, 0, 23)));
      var block = H.mesh(ext(blockSh, 13.6, 0.7, 8), mYellow, cal);
      /* axe de plaquettes et clip de retenue (ils tiennent la cale) */
      H.cyl(1.5, 46, 'z', M.steel, cal, [0, 12.5, 0], 16);
      H.mesh(H.orient(H.lathe([[0, 0], [3.3, 0], [3.3, 1.7], [2.9, 2.2], [0, 2.2]], 28), 'z'), M.steel, cal, [0, 12.5, -23.4]).scale.z = -1;
      (function () {
        var o = [], k, n = 36, ga = 0.55;
        for (k = 0; k <= n; k++) o.push(H.pol(3.5, -Math.PI / 2 + ga + (TAU - 2 * ga) * k / n));
        for (k = n; k >= 0; k--) o.push(H.pol(1.3, -Math.PI / 2 + ga + (TAU - 2 * ga) * k / n));
        H.mesh(H.extrude(H.shape(o), 0.7, { curve: 4 }), M.steel, cal, [0, 12.5, 22.4]);
      })();
      /* purgeur (6 pans de 7 mm) sur la moitié extérieure, capuchon retiré */
      var nip = new THREE.Group(); nip.position.set(22, 16, 14); cal.add(nip);
      H.cyl(5.4, 1.2, 'y', mCal, nip, [0, 0.2, 0], 28);
      var nipHex = H.mesh(prism(H.shape(hexPts(4.04)), 3.4, 0.3, 'y'), M.steelDark, nip, [0, 2.4, 0]);
      H.cyl(2.3, 4.6, 'y', M.steelDark, nip, [0, 6.4, 0], 18);
      H.cyl(2.3, 1.8, 'y', M.steelDark, nip, [0, 9.6, 0], 18, 1.6);
      /* raccord de durite à l'avant de l'étrier */
      var fit = new THREE.Group(); fit.position.set(-29, 7, 14); cal.add(fit);
      H.cyl(5, 4, 'x', mCal, fit, [-1.5, 0, 0], 28);
      H.mesh(prism(H.shape(hexPts(4.62, Math.PI / 6)), 5.5, 0.35, 'x'), M.steelDark, fit, [-6.2, 0, 0]);
      H.cyl(2.7, 3.2, 'x', M.rubber, fit, [-10.5, 0, 0], 24, 3.1);
      var FIT = V3(118 - 41, -101 + 7, 14), NIP = V3(118 + 22, -101 + 16 + 6, 14);

      /* =====================================================================
         Durite (reconstruite quand la cocotte pivote)
         ===================================================================== */
      var Mlev = new THREE.Matrix4(), tilt = 0, tiltT = 0;
      var hoseMesh = H.mesh(new THREE.BufferGeometry(), M.hose, root), hoseCurve = null;
      var hoseMid = new THREE.Object3D(); root.add(hoseMid);
      var tailFlat = [V3(62, -60, 7), V3(63, -84, 12), V3(69, -93.3, 14)], tailTilt = [V3(56, -86, 9), V3(60, -92, 12), V3(68, -94.3, 14)];
      function buildHose() {
        var k = tilt / (Math.PI / 4), E = V3(55.5, -12.6, 0).applyMatrix4(Mlev), d = V3(0.55, -0.835, 0).transformDirection(Mlev);
        var pts = [E, E.clone().addScaledVector(d, 9), E.clone().addScaledVector(d, 20)];
        for (var j = 0; j < 3; j++) pts.push(tailFlat[j].clone().lerp(tailTilt[j], k));
        pts.push(FIT.clone());
        hoseCurve = crv(pts);
        hoseMesh.geometry.dispose(); hoseMesh.geometry = new THREE.TubeGeometry(hoseCurve, 100, 2.5, 12, false);
        hoseMid.position.copy(hoseCurve.getPointAt(0.4)); hoseMid.position.z += 2;
      }
      function updateOil() {
        var nx = -Math.sin(tilt), ny = Math.cos(tilt), d = LEVEL * ny, a = oilGeo.attributes.position.array;
        for (var j = 0; j < a.length; j += 3) {
          var px = oilP0[j], py = oilP0[j + 1], k = nx * px + ny * py - d;
          a[j] = px; a[j + 1] = k > 0 ? py - k / ny : py; a[j + 2] = oilP0[j + 2];
        }
        oilGeo.attributes.position.needsUpdate = true; oilGeo.computeVertexNormals();
      }

      /* =====================================================================
         Seringue TL-BR001 et son tuyau (Injecter)
         ===================================================================== */
      var SX = 172, SY = -88;
      var syr = new THREE.Group(); syr.position.set(SX, SY, 3); root.add(syr);
      glass(H.lathe([[1.0, 0.2], [1.8, 0.2], [2.6, 8], [5, 10], [10.2, 12], [10.2, 86], [9.3, 86], [9.3, 13.6], [4.2, 11.6], [1.0, 10.6], [1.0, 0.2]], 40), mClear, syr);
      var flG = new THREE.CylinderGeometry(10, 10, 2.4, 32); flG.scale(1.85, 1, 0.95);
      glass(flG, mClear, syr, [0, 87.2, 0]);
      var ticks = H.mesh(new THREE.CylinderGeometry(10.3, 10.3, 58, 8, 1, true, -0.28, 0.56), mTick, syr, [0, 50, 0]); ticks.renderOrder = 4;
      var col = H.mesh(new THREE.CylinderGeometry(9.15, 9.15, 1, 32).translate(0, 0.5, 0), mOilCore, syr, [0, 13.8, 0]); col.renderOrder = 2;
      var plunger = new THREE.Group(); syr.add(plunger);
      H.mesh(H.lathe([[0, 0], [8.9, 0], [9.25, 1], [8.8, 2.5], [9.25, 4], [8.8, 5.5], [9.25, 7], [8.6, 8], [0, 8]], 32), M.rubber, plunger);
      H.box(15, 78, 1.8, mWhite, plunger, [0, 47, 0]);
      H.box(1.8, 78, 15, mWhite, plunger, [0, 47, 0]);
      H.cyl(10.5, 2.4, 'y', mWhite, plunger, [0, 87.2, 0], 32);
      function setPlunger(y) { plunger.position.y = y; col.scale.y = Math.max(0.5, y - 13.8); }
      setPlunger(50);
      var stubeCurve = crv([NIP, V3(140, -70, 14), V3(145, -64, 13), V3(152, -66, 11), V3(155, -78, 8), V3(157, -94, 6), V3(163, -102, 4.5), V3(SX - 2, -102, 3.5), V3(SX, -96, 3), V3(SX, SY + 2.5, 3)]);
      var stube = new THREE.Group(); root.add(stube);
      H.mesh(new THREE.TubeGeometry(stubeCurve, 110, 3, 12, false), mClear, stube).renderOrder = 3;
      H.mesh(new THREE.TubeGeometry(stubeCurve, 110, 1.9, 8, false), mOilCore, stube).renderOrder = 2;

      /* =====================================================================
         Sachet de récupération et son tuyau (Gravité)
         ===================================================================== */
      function pouch(sc, tMax, cap) {
        var nt = 30, nr = 40, pos = [], idx = [], a, b;
        function sm(g) { g = Math.max(0, Math.min(1, g)); return g * g * (3 - 2 * g); }
        /* corps plat soudé en bas, froncé sous l'élastique, collerette au-dessus */
        function hw(t) {
          if (t >= 0.92) return 4.2 + 4.6 * sm((t - 0.92) / 0.08);
          var bot = t < 0.05 ? 0.55 + 0.45 * Math.sqrt(1 - Math.pow(1 - t / 0.05, 2)) : 1;
          return Math.min(17 * bot, 4.2 + 12.8 * (1 - sm((t - 0.62) / 0.3)));
        }
        function hd(t) {
          if (t >= 0.92) return hw(t);
          var bot = t < 0.1 ? Math.sqrt(1 - Math.pow(1 - t / 0.1, 2)) : 1, d = 8 - 5 * t;
          return Math.min(d * bot, 4.2 + (d - 4.2) * (1 - sm((t - 0.66) / 0.26)));
        }
        for (a = 0; a <= nt; a++) {
          var t = a / nt * tMax;
          for (b = 0; b <= nr; b++) {
            var th = b / nr * TAU, st = Math.sin(th), wr = 1 + (0.025 * Math.sin(7 * th + 13 * t) + 0.02 * Math.sin(15 * th - 6 * t)) * (t < 0.6 ? 1 : 2.5);
            var gth = sm((t - 0.6) / 0.3), lens = 0.3 + 0.7 * Math.abs(st), crease = 1 + 0.12 * Math.sin(9 * t + 2 * Math.cos(th)) * (t > 0.15 && t < 0.85 ? 1 : 0);
            var pleat = 1 + (t >= 0.92 ? 0.55 : 0.4 * gth) * (Math.abs(Math.sin(3 * th + 0.4 + 4 * t)) - 0.5);
            lens = lens + (1 - lens) * gth;
            pos.push(sc * hw(t) * Math.cos(th) * wr * pleat, -32 + 64 * t, sc * hd(t) * st * lens * wr * crease * pleat);
          }
        }
        for (a = 0; a < nt; a++) for (b = 0; b < nr; b++) {
          var p0 = a * (nr + 1) + b, p1 = p0 + 1, p2 = p0 + nr + 1, p3 = p2 + 1;
          idx.push(p0, p2, p1, p1, p2, p3);
        }
        if (cap) {
          var c0 = pos.length / 3, top0 = nt * (nr + 1); pos.push(0, -32 + 64 * tMax, 0);
          for (b = 0; b < nr; b++) idx.push(c0, top0 + b, top0 + b + 1);
        }
        var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
        return g;
      }
      var bag = new THREE.Group(); bag.position.set(172, -103, 4); bag.scale.setScalar(0.9); root.add(bag);
      glass(pouch(1, 1, false), P({ color: 0xe9eef2, metalness: 0, roughness: 0.3, transparent: true, opacity: 0.48, depthWrite: false, clearcoat: 1, clearcoatRoughness: 0.1 }), bag);
      var pool = H.mesh(pouch(0.9, 0.24, true), mOil, bag); pool.renderOrder = 2;
      var band = new THREE.TorusGeometry(4.9, 1.1, 8, 24); band.rotateX(Math.PI / 2); H.mesh(band, M.rubber, bag, [0, 26.9, 0]);
      var btubeCurve = crv([NIP, V3(140, -70, 14), V3(143, -62, 13), V3(152, -57, 10.5), V3(163, -60, 7), V3(170, -66, 5), V3(172, -73, 4), V3(172, -84, 4)]);
      var btube = new THREE.Group(); root.add(btube);
      H.mesh(new THREE.TubeGeometry(btubeCurve, 100, 3, 12, false), mClear, btube).renderOrder = 3;
      H.mesh(new THREE.TubeGeometry(btubeCurve, 100, 1.9, 8, false), mOilCore, btube).renderOrder = 2;

      /* =====================================================================
         Circuit de l'huile : billes d'huile et bulles le long de la courbe
         ===================================================================== */
      function seg(pts, frame, key) {
        var cum = [0]; for (var k = 1; k < pts.length; k++) cum.push(cum[k - 1] + pts[k].distanceTo(pts[k - 1]));
        return { pts: pts, frame: frame, key: key, cum: cum, len: cum[cum.length - 1] };
      }
      function rev(s) { return seg(s.pts.slice().reverse(), s.frame, s.key); }
      var segLev = seg(crv([[-25, 77], [-25, 40.5], [-25, 34], [-25, 27], [-22.5, 19], [-15, 11], [-5, 3], [7, -6], [20, -10.2], [40, -10.8], [55.5, -12.6]]).getSpacedPoints(170), 'lev', 'lev');
      var segCal = seg(crv([FIT, V3(86, -94, 14), V3(100, -95.5, 12.5), V3(118, -95, 12), V3(134, -91, 13.5), V3(140, -86, 14), NIP]).getSpacedPoints(60), 'root', 'cal');
      var segST = seg(stubeCurve.getSpacedPoints(100), 'root', 'stube');
      var segSyr = seg([V3(SX, SY + 2, 3), V3(SX, SY + 13, 3), V3(SX, SY + 24, 3)], 'root', 'syr');
      var segBT = seg(btubeCurve.getSpacedPoints(100), 'root', 'btube');
      var segDrop = seg([V3(172, -85, 4), V3(172, -116, 4)], 'root', 'drop');
      var mode = 'inj', track = [], trackLen = 1;
      function buildTrack() {
        var segHose = seg(hoseCurve.getSpacedPoints(100), 'root', 'hose');
        track = mode === 'inj' ? [rev(segSyr), rev(segST), rev(segCal), rev(segHose), rev(segLev)] : [segLev, segHose, segCal, segBT, segDrop];
        trackLen = track.reduce(function (s, q) { return s + q.len; }, 0);
      }
      var NP = 34, parts = [], sphere = new THREE.SphereGeometry(1, 12, 8);
      for (i = 0; i < NP; i++) {
        var pm = H.mesh(sphere, mBead, root); pm.visible = false;
        parts.push({ mesh: pm, f: i / NP, type: 0, ph: rnd() * TAU });
      }
      function setTypes() {
        parts.forEach(function (p, k) {
          p.type = mode === 'inj' ? ((k % 5 === 1 || k % 5 === 3) ? 1 : 0) : (k % 6 === 2 ? 1 : 0);
          p.mesh.material = p.type ? mBubble : mBead;
        });
      }
      var tmp = V3(0, 0, 0);
      function radiusFor(key, type, lp) {
        if (mode === 'inj') {
          if (key === 'syr') return type ? 0 : 2.4;
          if (key === 'stube') return type ? 0 : 1.9;
          if (key === 'hose') return 3.15;
          if (key === 'lev') return (type && lp.x < -20 && lp.y > 41.5 && lp.y < LEVEL - 1.8) ? 1.9 : 0;
          return 0;
        }
        if (key === 'hose') return 3.15;
        if (key === 'btube') return type ? 2.1 : 1.9;
        if (key === 'drop') return type ? 0 : 2.2;
        return 0;
      }
      function placeParticles() {
        parts.forEach(function (p) {
          var s = p.f * trackLen, k = 0;
          while (k < track.length - 1 && s > track[k].len) { s -= track[k].len; k++; }
          var sg = track[k], c = sg.cum, j = 1;
          while (j < c.length - 1 && c[j] < s) j++;
          var u = c[j] - c[j - 1] > 1e-6 ? (s - c[j - 1]) / (c[j] - c[j - 1]) : 0;
          tmp.copy(sg.pts[j - 1]).lerp(sg.pts[j], Math.max(0, Math.min(1, u)));
          var r = radiusFor(sg.key, p.type, tmp);
          if (!r) { p.mesh.visible = false; return; }
          if (sg.key === 'lev' && tmp.y > 41.5) { tmp.x += 2.4 * Math.sin(0.33 * tmp.y + p.ph); tmp.z += 2.4 * Math.cos(0.29 * tmp.y + p.ph); }
          if (sg.frame === 'lev') tmp.applyMatrix4(Mlev);
          p.mesh.position.copy(tmp); p.mesh.scale.setScalar(r); p.mesh.visible = true;
        });
      }

      /* ---------- Pivot de la cocotte ---------- */
      function applyTilt() {
        lev.rotation.z = -tilt; lev.updateMatrix(); L.updateMatrix(); Mlev.multiplyMatrices(lev.matrix, L.matrix);
        buildHose(); updateOil(); buildTrack();
      }

      /* ---------- Pastilles ---------- */
      var pinCommon = [
        { obj: adapter, p: [0, 0, 6.2], text: 'Vis de purge de la manette : 0,5 à 0,7 Nm' },
        { obj: fun, p: [12, 81.5, 7.5], text: 'Entonnoir TL-BR002, vissé à la place de la vis de purge' },
        { obj: block, p: [-12, 17.3, 2], text: 'Cale de purge jaune, tenue par l’axe et le clip' }
      ];
      var pinNip = { obj: nipHex, p: [0, 0, 4.1], text: 'Étrier : desserrer 1/2 tour (RX820, RX410), 1/8 (RX400, RX810)' };
      var pinTap = { obj: hoseMid, p: [0, 0, 0], text: 'Tapoter durite, cocotte et étrier pour décoller les bulles' };
      var pinSyr = { obj: syr, p: [0, 42, 10.3], text: 'Seringue TL-BR001 : huile minérale Shimano uniquement' };
      var pinBag = { obj: bag, p: [-9, 10, 4.5], text: 'Sachet de récupération : l’huile y descend par gravité' };
      function pinsFor() { return pinCommon.concat([mode === 'inj' ? pinSyr : pinBag, pinNip, pinTap]); }

      function setMode(v) {
        mode = v;
        syr.visible = stube.visible = v === 'inj';
        bag.visible = btube.visible = v !== 'inj';
        buildTrack(); setTypes(); placeParticles();
      }

      applyTilt(); setMode('inj');

      var time = 0, acc = 0;
      return {
        group: root,
        pins: pinsFor(),
        controls: [
          { type: 'segmented', label: 'Étape', value: 'inj', options: [{ value: 'inj', label: 'Injecter' }, { value: 'grav', label: 'Gravité' }],
            onChange: function (v) { if (v === mode) return; setMode(v); api.setPins(pinsFor()); api.dirty(); } },
          { type: 'toggle', label: 'Cocotte à 45°', value: false, onChange: function (v) { tiltT = v ? Math.PI / 4 : 0; api.dirty(); } }
        ],
        onFrame: function (dt) {
          dt = Math.min(dt || 0, 0.05);
          var moved = false;
          if (Math.abs(tilt - tiltT) > 1e-4) {
            tilt += (tiltT - tilt) * Math.min(1, dt * 4);
            if (Math.abs(tilt - tiltT) < 0.003) tilt = tiltT;
            applyTilt(); moved = true;
          }
          time += dt; acc += dt;
          if (acc < 1 / 30 && !moved) return false;
          var step = acc; acc = 0;
          var v = mode === 'inj' ? 34 : 20;
          parts.forEach(function (p) { p.f = (p.f + v * step / trackLen) % 1; });
          if (mode === 'inj') setPlunger(52 - 24 * ((time / 20) % 1));
          placeParticles();
          return true;
        }
      };
    }
  });
})();
