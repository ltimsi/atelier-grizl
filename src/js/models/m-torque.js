/* Atelier Grizl : ta clé dynamométrique Park Tool TW-6.2, pour l'atelier 1.1 « Avant de commencer ».
   Clé à déclenchement (« Ratcheting Click-Type Torque Wrench ») : de 10 à 60 Nm, réglable par pas de 0,25 Nm, tête à
   cliquet au carré de 3/8 de pouce (page Park Tool de la TW-6.2, relevé du montage, section 8). Elle porte un embout
   six-pans de 6 mm engagé dans la tête d'un axe avant traversant, serré à 10-15 Nm (tableau de l'étape 5.7 du guide
   de démarrage, QSG R126 V02, p.16, comme dans l'atelier 1.5).
   La clé dynamométrique Canyon du carton n'est pas dessinée : sa plage est à lire sur l'outil.
   Gestes du mode d'emploi Park Tool « TW-5.2 / TW-6.2 Instructions », lié depuis la page de la TW-6.2
   (https://www.parktool.com/assets/doc/product/TW-5.2_TW-6.2_instructions.pdf) : levier du cliquet à droite
   pour tourner en sens horaire, à gauche pour le sens inverse ; pousser la bague de verrouillage pour
   déverrouiller, la tourner jusqu'à ce que la ligne rouge de la fenêtre montre le couple voulu, la tirer pour
   verrouiller ; tenir la poignée et tourner avec une force régulière jusqu'au déclic, entendu et senti dans la clé,
   ou jusqu'à ce que la tête pivote par rapport au corps, puis relâcher aussitôt ; après le travail, ramener le
   réglage au plus petit chiffre de l'échelle. Le même mode d'emploi place les graduations principales de la fenêtre
   tous les 4 Nm. La page Park Tool ajoute qu'elle mesure aussi dans le sens d'un pas à gauche, et qu'elle ne sert
   pas de clé à cliquet ordinaire ; le chapitre propose de la garder pour serrer, pas pour desserrer. Ces lignes Park
   Tool sont citées mot pour mot dans le relevé du montage, section 8.
   Curseur « Couple réglé », de 10 à 60 Nm par pas de 0,25 Nm : la bague avance (déverrouillée), tourne, l'échelle
   défile sous la ligne rouge, puis la bague revient (verrouillée). Bascule « Serrer » : la clé tourne en sens horaire
   avec l'axe, puis le déclic : le corps pivote un instant par rapport à la tête, la tête s'éclaire, « déclic »
   s'affiche. Vue éclatée : la clé se lève de la douille, la douille et son embout de la tête de l'axe.
   Cotes : longueur totale de 362 mm (« Length », page Park Tool), carré de 3/8 de pouce (9,53 mm), embout de 6 mm ;
   la tête de l'axe reprend celle de la pièce 3D de l'atelier 1.5.
   Formes approchées, lues au mieux sur les quatre photos de la page Park Tool, à l'échelle de la longueur publiée :
   - tête à cliquet, col, levier, bouton du dessus et carré : forme, diamètre et épaisseur approchés ;
   - longueurs du col, du tube, de la poignée et de la bague : lues au mieux sur la photo de face ;
   - tube bleu : diamètre approché ; pastille noire près du col : forme approchée, son rôle n'est pas publié ; le corps
     est dessiné pivotant autour d'elle au déclic, place du pivot approchée ;
   - poignée noire : profil approché ; fenêtre de réglage : place et taille approchées ; échelle dessinée sans
     chiffres, un trait tous les 4 Nm, le premier trait à 10 Nm ; départ, chiffres et course de l'échelle approchés, à
     lire sur ta clé ;
   - bague de verrouillage et embout arrière : forme approchée ; seize traits par tour, soit 0,25 Nm par trait si un
     tour vaut 4 Nm, une déduction que Park Tool ne publie pas ; course de la bague approchée ; chiffres non dessinés ;
   - tableau de conversion des Nm en in·lb sur le tube : d'après la photo de près de la page Park Tool, traits fins
     approchés ; inscription « TW-6.2 » : place approchée ; logos non dessinés ;
   - couleurs : tête chromée, tube bleu, poignée et bague noires, teintes approchées d'après les photos ;
   - angle du geste, du déclic et du pivot du corps : exagérés pour se voir ;
   - patte gauche de la fourche FK0143, sa portée et son support de frein : forme approchée, teinte Floating Violet de
     la scène sans ses veines (teinte approchée) ; tête de l'axe, six-pans et tige : forme approchée, comme dans la
     pièce 3D de l'atelier 1.5 ; embout de moyeu, douille porte-embout et embout : forme approchée.
   Repère : modélisé avec l'axe de la vis selon y (tête de l'axe vers +y), puis basculé pour que l'axe de roue soit
   horizontal ; x le long de la clé (centre de la tête en x = 0, poignée vers +x), face du levier et de la fenêtre
   vers +y. Unités : mm. */
(function () {
  'use strict';
  var TAU = Math.PI * 2;
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function ease(u) { return 0.5 - 0.5 * Math.cos(Math.PI * clamp(u, 0, 1)); }
  /* 12.25 -> « 12,25 » */
  function fr(v) { return String(Math.round(v * 100) / 100).replace('.', ','); }

  AtelierModels.register('torque', {
    camera: { yaw: -0.35, pitch: 0.32, dist: 520, target: [140, 8, 45], min: 160, max: 1300 },
    explodeLabel: 'Vue éclatée',
    build: function (ctx) {
      var THREE = ctx.THREE, H = ctx.H, api = ctx.api;
      var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      var root = new THREE.Group();
      /* tout est modélisé avec l'axe de la vis selon y, puis basculé : l'axe de roue devient horizontal */
      var S = new THREE.Group(); S.rotation.x = Math.PI / 2; root.add(S);

      /* ---------- Outils ---------- */
      function std(c, met, rough, extra) { return new THREE.MeshStandardMaterial(Object.assign({ color: c, metalness: met, roughness: rough }, extra || {})); }
      function phy(o) { return new THREE.MeshPhysicalMaterial(o); }
      /* profil de tour [rayon, y] : les angles vifs sont doublés pour garder des arêtes nettes */
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
      function lathX(prof, seg) { var g = lath(prof, seg); g.rotateZ(-Math.PI / 2); return g; }   /* axe du tour selon +x */
      /* extrusion d'épaisseur T selon y, centrée en y = 0 : la forme (x, s) devient (x, z = -s) */
      function flatY(sh, T, b, curve) {
        var g = b > 0 ? H.extrude(sh, T - 2 * b, { bevel: b, curve: curve || 24, bevelSegments: 2 }) : H.extrude(sh, T, { curve: curve || 24 });
        g.rotateX(-Math.PI / 2); return g;
      }
      function hexPts(rc, rot) { var p = []; for (var i = 0; i < 6; i++) p.push(H.pol(rc, i / 6 * TAU + (rot || 0))); return p; }
      function anchor(parent, x, y, z) { var o = new THREE.Object3D(); o.position.set(x, y, z); parent.add(o); return o; }
      function canvas(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
      function texOf(c) { var t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
      function decalMat(t) {
        return new THREE.MeshStandardMaterial({ map: t, transparent: true, depthWrite: false, metalness: 0.2, roughness: 0.55,
          polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });
      }
      /* Surface cylindrique autour de x : u le long de x, v autour (haut du canevas vers a0).
         Angle a : (y, z) = (r cos a, r sin a), a = 0 vers +y. */
      function patchGeo(r, x0, x1, a0, a1, nu, nv) {
        var pos = [], nor = [], uv = [], idx = [], i, j;
        for (i = 0; i <= nu; i++) for (j = 0; j <= nv; j++) {
          var x = x0 + (x1 - x0) * i / nu, a = a0 + (a1 - a0) * j / nv, c = Math.cos(a), s = Math.sin(a);
          pos.push(x, r * c, r * s); nor.push(0, c, s); uv.push(i / nu, 1 - j / nv);
        }
        for (i = 0; i < nu; i++) for (j = 0; j < nv; j++) {
          var p = i * (nv + 1) + j, q = p + nv + 1;
          idx.push(p, p + 1, q, q, p + 1, q + 1);
        }
        var g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
        g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
        g.setIndex(idx); return g;
      }
      function rrect(g, x, y, w, h, r) {
        g.beginPath(); g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r); g.lineTo(x + w, y + h - r);
        g.quadraticCurveTo(x + w, y + h, x + w - r, y + h); g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r);
        g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y); g.closePath();
      }
      /* stries droites (relief seulement) */
      function ridges(n) {
        var c = canvas(n, 4), g = c.getContext('2d'), id = g.createImageData(n, 4), d = id.data;
        for (var y = 0; y < 4; y++) for (var x = 0; x < n; x++) {
          var u = (x + 0.5) / n, h = Math.min(1, 1.6 * (1 - 2 * Math.abs(u - 0.5))), k = Math.round(90 + 165 * h), o = (y * n + x) * 4;
          d[o] = d[o + 1] = d[o + 2] = k; d[o + 3] = 255;
        }
        g.putImageData(id, 0, 0);
        var t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
      }

      /* ---------- Matériaux (teintes approchées d'après les photos Park Tool, voir l'en-tête) ---------- */
      var chrome = std(0xdfe2e6, 1, 0.14);
      var headMat = std(0xd9dce0, 1, 0.2, { emissive: 0x7c68d6, emissiveIntensity: 0 });
      var satin = std(0xb9bdc2, 1, 0.3);
      var blue = phy({ color: 0x1f54b8, metalness: 0.55, roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.18 });
      var rubber = std(0x1c1d20, 0, 0.74);
      var kRidge = ridges(32); kRidge.repeat.set(60, 1);
      var ringMat = std(0x18191c, 0.25, 0.5);
      var capMat = std(0x18191c, 0.25, 0.55, { bumpMap: kRidge, bumpScale: 0.8 });
      var driveMat = std(0x26282c, 0.7, 0.38);
      var bitMat = std(0x404247, 0.85, 0.42);
      var dark = std(0x08090a, 0.2, 0.8);
      var mPaint = phy({ color: 0x4f0d2c, metalness: 0.3, roughness: 0.34, clearcoat: 1, clearcoatRoughness: 0.03 });
      var mCut = phy({ color: 0x1c1e22, metalness: 0.2, roughness: 0.42, clearcoat: 1, clearcoatRoughness: 0.08 });
      var mAxle = phy({ color: 0x1d1f23, metalness: 0.8, roughness: 0.32 });
      var mAxleIn = std(0x111215, 0.6, 0.55);
      var mHub = phy({ color: 0x17181a, metalness: 0.8, roughness: 0.3 });

      /* ---------- Cotes ---------- */
      var L_TOT = 362;                       // « Length: 362 mm », page Park Tool
      var HR = 17, HT = 16;                  // tête : rayon et épaisseur (approchés)
      var YA = 50;                           // axe du tube, au-dessus de la tête de l'axe de roue
      var HTOP = YA + HT / 2;
      var XN = 37, XG = 179, XB = 314;       // début du tube, de la poignée, de la bague (lus sur la photo)
      var XE = L_TOT - HR;                   // bout de l'embout arrière, bague verrouillée
      var RT = 6.5;                          // rayon du tube
      var XP = 45;                           // pastille noire : pivot dessiné du corps
      var K = 0.7;                           // course de l'échelle, mm par Nm (approchée)
      var WX0 = 222, WX1 = 234, WA = 0.36, XR = 228, RW = 13.3;   // fenêtre de réglage, ligne rouge, rayon
      var PUSH = 2.5;                        // course de la bague (approchée)
      var LR = XE - XB - PUSH;               // longueur de la bague et de l'embout arrière
      var TH0 = 0.2, TH1 = -0.22, DMAX = 0.055;   // angles du geste et du déclic (exagérés)

      /* ---------- Patte gauche de la fourche (carbone) ---------- */
      var fork = new THREE.Group(); S.add(fork);
      (function () {
        H.mesh(flatY(H.shape(H.circlePts(16, 64)), 13, 1.4, 48), mPaint, fork, [0, -6.5, 0]);
        var d = new THREE.Vector3(-0.34, 0, -0.94).normalize(), ax1 = new THREE.Vector3(-d.z, 0, d.x), N = 48, E = 0.86;
        var L = 104, SC = [], s;
        for (s = 4; s <= L; s += 7) {
          var t = s / L, a = 13.2 - 1.4 * Math.sin(Math.min(1, s / 70) * Math.PI / 2) + 2.2 * t * t;
          var b = 6.5 + 5 * Math.pow(t, 1.1), top = 3.4 * Math.pow(t, 1.4);
          SC.push({ s: s, a: a, b: b, cy: top - b });
        }
        var pos = [], idx = [], i, j;
        SC.forEach(function (sec) {
          for (j = 0; j < N; j++) {
            var an = j / N * TAU, ca = Math.cos(an), sa = Math.sin(an);
            var ex = Math.sign(ca) * Math.pow(Math.abs(ca), E) * sec.a, ey = Math.sign(sa) * Math.pow(Math.abs(sa), E) * sec.b;
            pos.push(d.x * sec.s + ax1.x * ex, sec.cy + ey, d.z * sec.s + ax1.z * ex);
          }
        });
        for (i = 0; i < SC.length - 1; i++) for (j = 0; j < N; j++) {
          var p0 = i * N + j, p1 = i * N + (j + 1) % N, q0 = p0 + N, q1 = p1 + N;
          idx.push(p0, q0, p1, p1, q0, q1);
        }
        var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
        H.mesh(g, mPaint, fork);
        /* coupe franche en haut du fragment */
        var last = SC[SC.length - 1], cp = [], ci = [], base = (SC.length - 1) * N;
        cp.push(d.x * last.s, last.cy, d.z * last.s);
        for (j = 0; j < N; j++) cp.push(pos[(base + j) * 3], pos[(base + j) * 3 + 1], pos[(base + j) * 3 + 2]);
        for (j = 0; j < N; j++) ci.push(0, 1 + j, 1 + (j + 1) % N);
        var cg = new THREE.BufferGeometry(); cg.setAttribute('position', new THREE.Float32BufferAttribute(cp, 3)); cg.setIndex(ci); cg.computeVertexNormals();
        H.mesh(cg, mCut, fork);
        /* support de frein à l'arrière du fourreau */
        var pad = H.extrude(H.roundRect(44, 11, 3.5, 43, 15), 11, { bevel: 1, curve: 8 });
        var mb = new THREE.Matrix4().makeBasis(d, ax1.clone().negate(), new THREE.Vector3(0, 1, 0)); mb.setPosition(0, -7.4, 0);
        pad.applyMatrix4(mb); H.mesh(pad, mPaint, fork);
      })();
      /* embout de moyeu sous la patte, côté intérieur */
      H.mesh(lath([[6.1, -22.4], [8.6, -22.4], [9.6, -21.4], [9.6, -14], [9.0, -13.2], [6.1, -13.2]], 48), mHub, fork);

      /* ---------- Ensemble entraîné : tête de l'axe (comme l'atelier 1.5) ---------- */
      var drv = new THREE.Group(); S.add(drv);
      var axleHead = new THREE.Group(); drv.add(axleHead);
      (function () {
        var sh = H.shape(H.circlePts(10, 72)); sh.holes.push(H.path(hexPts(6 / Math.sqrt(3) + 0.05, 0).reverse()));
        H.mesh(flatY(sh, 5, 0.6, 48), mAxle, axleHead, [0, 2.5, 0]);
        H.mesh(flatY(H.shape(hexPts(6 / Math.sqrt(3) + 0.05, 0)), 0.2, 0, 6), mAxleIn, axleHead, [0, -0.4, 0]);
        [1.6, 3.4].forEach(function (y) { var t = H.mesh(new THREE.TorusGeometry(10, 0.2, 6, 64), mAxleIn, axleHead, [0, y, 0]); t.rotation.x = Math.PI / 2; });
        H.cyl(6, 7.6, 'y', mAxle, axleHead, [0, -26.2, 0], 32);
        H.mesh(lath([[0, -31.6], [5.2, -31.6], [6, -30.8], [6, -30]], 32), mAxle, axleHead);
      })();
      /* douille porte-embout au carré de 3/8 de pouce et embout six-pans de 6 mm */
      var sock = new THREE.Group(); drv.add(sock);
      H.mesh(lath([[0, 11], [5.5, 11], [6.25, 11.7], [6.25, 16.8], [6.9, 17.5], [9.0, 19.3], [9.3, 20.2], [9.3, 23.4], [8.85, 24], [9.3, 24.6], [9.3, 38.9], [8.5, 40], [0, 40]], 64), chrome, sock);
      H.mesh(flatY(H.shape(hexPts(6 / Math.sqrt(3), 0)), 20, 0.3, 6), bitMat, sock, [0, 10.6, 0]);
      H.mesh(flatY(H.roundRect(9.7, 9.7, 1.0), 0.1, 0, 6), dark, sock, [0, 40.02, 0]);

      /* ---------- Clé ---------- */
      var wrench = new THREE.Group(); S.add(wrench);
      var headShell = new THREE.Group(); wrench.add(headShell);
      var lever;
      (function () {
        /* tête ronde et naissance du col (contour réduit du chanfrein de 1,6 mm), puis col rond jusqu'au tube */
        var a0 = 0.9, BV = 1.6, R0 = HR - BV, s = new THREE.Shape();
        s.absarc(0, 0, R0, a0, TAU - a0, false);
        s.quadraticCurveTo(17, -8, 24, -8 + BV); s.lineTo(24, 8 - BV); s.quadraticCurveTo(17, 8, R0 * Math.cos(a0), R0 * Math.sin(a0));
        H.mesh(flatY(s, HT, BV, 64), headMat, headShell, [0, YA, 0]);
        H.mesh(lathX([[0, 22], [7.9, 22], [7.7, 29], [7.6, XN - 3.4], [0, XN - 3.4]], 64), headMat, headShell, [0, YA, 0]);
        /* bouton du dessus, centre foncé */
        H.mesh(lath([[0, HTOP + 0.9], [5.2, HTOP + 0.9], [6, HTOP + 0.5], [10.4, HTOP + 0.5], [11.2, HTOP + 0.1], [11.2, HTOP - 0.2]].reverse(), 48), satin, headShell);
        H.mesh(new THREE.CircleGeometry(4.6, 40), dark, headShell, [0, HTOP + 0.92, 0]).rotation.x = -Math.PI / 2;
        /* bossage du carré sous la tête */
        H.mesh(lath([[0, YA - HT / 2 - 1.6], [6.6, YA - HT / 2 - 1.6], [7.6, YA - HT / 2 - 0.9], [7.9, YA - HT / 2 + 0.2]], 48), headMat, headShell);
        /* levier d'inversion du cliquet, sur le col */
        lever = new THREE.Group(); headShell.add(lever); lever.position.set(19, HTOP, 0); lever.rotation.y = 0.32;
        var ls = new THREE.Shape(); ls.absarc(0, 0, 4.2, Math.PI / 2 + 0.2, TAU * 0.75 - 0.2, false);
        ls.lineTo(9, -3.2); ls.quadraticCurveTo(12, -3, 12, 0); ls.quadraticCurveTo(12, 3, 9, 3.2); ls.closePath();
        H.mesh(flatY(ls, 2.4, 0.5, 24), chrome, lever, [0, 1.2, 0]);
        H.cyl(1.6, 0.6, 'y', satin, lever, [0, 2.6, 0], 20);
      })();
      /* carré de 3/8 de pouce (9,53 mm sur plats), solidaire du cliquet : il suit la vis */
      var sq = new THREE.Group(); wrench.add(sq);
      H.mesh(flatY(H.roundRect(9.53, 9.53, 0.9), 10.6, 0.45, 6), driveMat, sq, [0, 35.3, 0]);
      var ball = new THREE.Mesh(new THREE.SphereGeometry(1.3, 16, 10), chrome); ball.position.set(4.45, 33.4, 0); sq.add(ball);

      /* corps : il pivote un instant par rapport à la tête au déclic */
      var pivot = new THREE.Group(); wrench.add(pivot); pivot.position.set(XP, 0, 0);
      var body = new THREE.Group(); pivot.add(body); body.position.set(-XP, 0, 0);
      H.mesh(lathX([[0, XN - 4], [7.6, XN - 4], [8.1, XN - 3.4], [8.1, XN + 3], [7.4, XN + 4], [RT + 0.1, XN + 4.6], [0, XN + 4.6]], 64), chrome, body, [0, YA, 0]);
      H.mesh(lathX([[0, XN + 4], [RT, XN + 4], [RT, XG + 2], [0, XG + 2]], 64), blue, body, [0, YA, 0]);
      [1, -1].forEach(function (sd) {
        var m = H.cyl(2.4, 0.6, 'y', dark, body, [XP, YA + sd * (RT + 0.05), 0], 24);
        m.position.y = YA + sd * Math.sqrt(RT * RT - 2.4 * 2.4) + sd * 0.3;
      });
      /* poignée en caoutchouc noir */
      var GRIP = [[RT + 0.2, XG - 1], [9.5, XG], [11.2, XG + 2], [12.6, XG + 7], [13.4, XG + 20], [13.2, XG + 55], [13.0, XG + 75],
        [14.3, XG + 100], [15.0, XG + 118], [14.8, XB - 6], [14.0, XB - 2], [12.8, XB], [10.6, XB]];
      H.mesh(lathX(GRIP, 72), rubber, body, [0, YA, 0]);
      /* manchon chromé sous la bague, visible quand elle est tirée (verrouillée) */
      H.mesh(lathX([[0, XB - 1], [10.4, XB - 1], [10.4, XB + PUSH + 2], [0, XB + PUSH + 2]], 48), satin, body, [0, YA, 0]);

      /* fenêtre de réglage : échelle mobile et ligne rouge fixe */
      var wc = canvas(256, 192), wg = wc.getContext('2d'), wtex = texOf(wc);
      var winMat = new THREE.MeshStandardMaterial({ map: wtex, transparent: true, metalness: 0.05, roughness: 0.4, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });
      H.mesh(patchGeo(RW, WX0, WX1, -WA, WA, 6, 8), winMat, body, [0, YA, 0]);
      function drawWin(T) {
        var g = wg, px = 256 / (WX1 - WX0), v, cx;
        g.clearRect(0, 0, 256, 192);
        rrect(g, 1, 1, 254, 190, 22); g.fillStyle = '#2a4f96'; g.fill();
        g.save(); rrect(g, 14, 14, 228, 164, 14); g.clip();
        g.fillStyle = '#eceae4'; g.fillRect(0, 0, 256, 192);
        g.fillStyle = '#17181b';
        for (v = 10; v <= 60; v += 4) {
          cx = (XR - K * (T - v) - WX0) * px; if (cx < -6 || cx > 262) continue;
          g.fillRect(cx - 2.2, 14, 4.4, 92);
        }
        var gr = g.createLinearGradient(0, 14, 0, 178);
        gr.addColorStop(0, 'rgba(0,0,0,0.35)'); gr.addColorStop(0.18, 'rgba(0,0,0,0)'); gr.addColorStop(0.82, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.3)');
        g.fillStyle = gr; g.fillRect(0, 0, 256, 192);
        g.restore();
        var rx = (XR - WX0) * px;
        g.fillStyle = '#d42a1f'; g.fillRect(rx - 2, 6, 4, 180);
        wtex.needsUpdate = true;
      }
      /* inscription sur le dessus du tube, tableau de conversion dessous */
      (function () {
        var c = canvas(512, 96), g = c.getContext('2d');
        g.fillStyle = 'rgba(236,238,242,0.95)'; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.font = 'bold 64px Arial, Helvetica, sans-serif'; g.fillText('TW-6.2', 256, 50);
        H.mesh(patchGeo(RT + 0.03, 56, 86, -0.5, 0.5, 6, 6), decalMat(texOf(c)), body, [0, YA, 0]);
        /* d'après la photo de près : Nm de 10 à 60, in·lb de 100 à 500 ; 1 Nm = 8,85 in·lb, d'après la table de conversion
           du mode d'emploi Park Tool, p.2 (« Newton meters », « Inch pounds », « 8.85 ») */
        var X0 = 66, X1 = 136, W = 1024, Hc = 150, cc = canvas(W, Hc), q = cc.getContext('2d');
        var A = 0.78, n0 = 0.07, n1 = 0.95;
        function xOf(nm) { return W * (n0 + (n1 - n0) * (nm - 10) / 50); }
        rrect(q, 2, 2, W - 4, Hc - 4, 26); q.fillStyle = '#f4f5f4'; q.fill();
        q.fillStyle = '#2b2d31'; q.fillRect(xOf(10) - 50, 74, xOf(60) - xOf(10) + 50, 3);
        q.textAlign = 'center'; q.textBaseline = 'alphabetic';
        for (var v = 10; v <= 60; v++) {
          var x = xOf(v), big = v % 10 === 0, mid = v % 5 === 0;
          q.fillRect(x - 1.5, big ? 40 : mid ? 52 : 62, 3, big ? 36 : mid ? 24 : 14);
          if (mid) { q.font = (big ? 'bold 30px' : 'bold 22px') + ' Arial, Helvetica, sans-serif'; q.fillText(String(v), x, big ? 36 : 48); }
        }
        q.fillStyle = '#6b6f75';
        for (var w = 90; w <= 530; w += 10) {
          var xi = xOf(w / 8.85); if (w / 8.85 < 10 || w / 8.85 > 60) continue;
          var bg = w % 50 === 0;
          q.fillRect(xi - 1.5, 77, 3, bg ? 26 : 12);
          if (bg) { q.font = (w % 100 === 0 ? 'bold 26px' : 'bold 20px') + ' Arial, Helvetica, sans-serif'; q.fillText(String(w), xi, w % 100 === 0 ? 132 : 124); }
        }
        q.textAlign = 'left'; q.fillStyle = '#2b2d31'; q.font = 'bold 22px Arial, Helvetica, sans-serif'; q.fillText('Nm', 14, 70);
        q.fillStyle = '#6b6f75'; q.font = 'bold 18px Arial, Helvetica, sans-serif'; q.fillText('in lb.', 10, 100);
        H.mesh(patchGeo(RT + 0.03, X0, X1, Math.PI - A, Math.PI + A, 10, 8), decalMat(texOf(cc)), body, [0, YA, 0]);
      })();

      /* bague de verrouillage et embout arrière strié : la bague avance pour déverrouiller et tourne pour régler */
      var lck = new THREE.Group(); body.add(lck);
      H.mesh(lathX([[10.5, 0], [11.6, 0], [12.1, 0.6], [12.1, 10], [11.8, 10.6], [11.8, 11.4]], 72), ringMat, lck);
      H.mesh(lathX([[11.8, 11.4], [12.3, 11.9], [12.3, LR - 3.4]], 72), capMat, lck);
      H.mesh(lathX([[12.3, LR - 3.4], [12.0, LR - 2.2], [10.6, LR - 0.8], [7, LR - 0.1], [0, LR]], 64), ringMat, lck);
      /* seize traits par tour, un plus long tous les quatre */
      (function () {
        var c = canvas(64, 1024), g = c.getContext('2d'), py = 1024 / 16;
        g.fillStyle = 'rgba(232,234,238,0.95)';
        for (var k = 0; k < 16; k++) { var len = k % 4 === 0 ? 46 : 26; g.fillRect(0, k * py + py / 2 - 4, len, 8); }
        H.mesh(patchGeo(12.13, 1.2, 7.2, -Math.PI, Math.PI, 3, 64), decalMat(texOf(c)), lck);
      })();

      /* « déclic » affiché au moment du déclenchement */
      var cc2 = canvas(320, 128), cg = cc2.getContext('2d');
      cg.font = 'bold 72px Arial, Helvetica, sans-serif'; cg.textAlign = 'center'; cg.textBaseline = 'middle';
      cg.lineWidth = 12; cg.strokeStyle = 'rgba(255,255,255,0.92)'; cg.strokeText('déclic', 160, 66);
      cg.fillStyle = '#5b48c9'; cg.fillText('déclic', 160, 66);
      var spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: texOf(cc2), transparent: true, depthTest: false, opacity: 0, toneMapped: false }));
      spr.scale.set(60, 24, 1); spr.position.set(10, YA + 20, -42); spr.visible = false; spr.renderOrder = 10; S.add(spr);

      /* ---------- État et animation ---------- */
      var T0 = 10;
      var st = { T: T0, Tt: T0, unl: 0, unlT: 0, idle: 0, th: TH0, psi: 0, del: 0, ph: 'rest', t: 0, thA: TH0, psiA: 0, fl: -1 };
      function setT(T) { lck.rotation.x = -TAU * (T - 10) / 4; drawWin(T); }
      function setLock() { lck.position.set(XB + PUSH * (1 - st.unl), YA, 0); }
      function pose() { wrench.rotation.y = st.th; sq.rotation.y = st.psi - st.th; drv.rotation.y = st.psi; pivot.rotation.y = -st.del; }
      setT(T0); setLock(); pose();

      var pins = [
        { obj: anchor(body, 71, YA + RT + 0.3, 0), p: [0, 0, 0], text: 'Park Tool TW-6.2, clé à déclenchement : de 10 à 60 Nm (newton-mètres), par pas de 0,25 Nm ; jamais au-delà de 60 Nm' },
        { obj: anchor(lever, 10.5, 2.6, 0), p: [0, 0, 0], text: 'Levier du cliquet : à droite pour tourner en sens horaire, à gauche pour le sens inverse ; la clé mesure aussi un filetage à gauche, comme celui de la pédale gauche' },
        { obj: anchor(lck, 5, 0, 12.6), p: [0, 0, 0], text: 'Bague de verrouillage : pousse-la pour déverrouiller, tourne-la jusqu’au couple voulu, tire-la pour verrouiller' },
        { obj: anchor(body, WX1 + 1, YA + RW + 0.2, 0), p: [0, 0, 0], text: 'Fenêtre de réglage : le couple réglé se lit sous la ligne rouge (chiffres de l’échelle à lire sur ta clé)' },
        { obj: anchor(sock, 6.6, 32, -6.6), p: [0, 0, 0], text: 'Carré de 3/8 de pouce et embout six-pans de 6 mm, si ta caisse l’a ; proposition : engage-le à fond, bien dans l’axe de la vis' },
        { obj: anchor(axleHead, -9.4, 4, -3.4), p: [0, 0, 0], text: 'Axe avant : 10-15 Nm, clé de 6 mm (tableau du guide, p.16) ; ta TW-6.2 commence à 10 Nm' },
        { obj: anchor(body, XG + 95, YA, -14.6), p: [0, 0, 0], text: 'Poignée : tiens-la et tourne avec une force régulière ; proposition : garde la clé pour serrer, pas pour desserrer' },
        { obj: anchor(headShell, -HR - 0.2, YA, 0), p: [0, 0, 0], text: 'Déclic entendu et senti, ou tête qui pivote par rapport au corps : arrête aussitôt, le couple réglé est atteint' },
        { obj: anchor(lck, LR + 0.2, 0, 0), p: [0, 0, 0], text: 'Après le travail : ramène le réglage au plus petit chiffre de l’échelle' },
        { obj: anchor(body, 101, YA - RT - 0.3, 0), p: [0, 0, 0], text: 'Tableau du tube : conversion des Nm en in·lb (pouce-livre)' }
      ];
      var PIN_STOP = 7;
      function hi(on) {
        var v = api.viewer; if (!v || !v.select) return;
        if (on && v.sel !== PIN_STOP) v.select(PIN_STOP);
        if (!on && v.sel === PIN_STOP) v.select(PIN_STOP);
      }
      function serrer(on) {
        if (on) {
          if (reduce) { st.psi += TH1 - st.th; st.th = TH1; st.del = 0; st.ph = 'held'; hi(true); spr.visible = true; spr.material.opacity = 1; }
          else { st.ph = 'pull'; st.t = 0; st.thA = st.th; st.psiA = st.psi; }
        } else {
          hi(false); spr.visible = false; st.fl = -1; headMat.emissiveIntensity = 0; st.del = 0;
          if (reduce) { st.th = TH0; st.ph = 'rest'; } else { st.ph = 'ret'; st.t = 0; st.thA = st.th; }
        }
        pose(); api.dirty();
      }

      return {
        group: root,
        parts: [{ obj: wrench, off: [0, 60, 0] }, { obj: sock, off: [0, 26, 0] }],
        pins: pins,
        controls: [
          { type: 'range', label: 'Couple réglé', min: 10, max: 60, step: 0.25, value: T0,
            format: function (v) { return fr(v) + ' Nm'; },
            onChange: function (v) { st.Tt = v; st.idle = 0; if (reduce) { st.T = v; setT(v); } api.dirty(); } },
          { type: 'toggle', label: 'Serrer', value: false, onChange: serrer }
        ],
        onFrame: function (dt) {
          var anim = false, u;
          dt = dt || 0;
          /* réglage : la bague avance (déverrouillée), puis tourne ; elle revient une demi-seconde après */
          if (!reduce) {
            if (st.T !== st.Tt) { st.unlT = 1; st.idle = 0; } else { st.idle += dt; if (st.idle > 0.5) st.unlT = 0; }
            if (st.unl !== st.unlT) {
              st.unl = st.unlT > st.unl ? Math.min(1, st.unl + dt * 5) : Math.max(0, st.unl - dt * 5);
              setLock(); anim = true;
            }
            if (st.T !== st.Tt && st.unl > 0.95) {
              var d = st.Tt - st.T, stp = Math.max(Math.abs(d) * Math.min(1, dt * 5), dt * 4);
              st.T = Math.abs(d) <= stp ? st.Tt : st.T + Math.sign(d) * stp;
              setT(st.T);
            }
            if (st.T !== st.Tt || st.unlT === 1) anim = true;
          }
          if (st.ph === 'pull') {
            st.t += dt; u = st.t / 1.5;
            st.th = st.thA + (TH1 - st.thA) * ease(u); st.psi = st.psiA + (st.th - st.thA);
            if (u >= 1) { st.ph = 'click'; st.t = 0; st.fl = 0; hi(true); spr.visible = true; }
            anim = true;
          } else if (st.ph === 'click') {
            st.t += dt; u = st.t;
            st.del = u < 0.04 ? DMAX * u / 0.04 : u < 0.2 ? DMAX * (1 + 0.08 * Math.sin((u - 0.04) * 90) * (0.2 - u) / 0.16) : DMAX * (1 - ease((u - 0.2) / 0.4));
            if (u >= 0.6) { st.del = 0; st.ph = 'held'; }
            anim = true;
          } else if (st.ph === 'ret') {
            st.t += dt; u = st.t / 0.9;
            st.th = st.thA + (TH0 - st.thA) * ease(u);
            if (u >= 1) { st.th = TH0; st.ph = 'rest'; }
            anim = true;
          }
          if (st.fl >= 0) {
            st.fl += dt; var f = st.fl;
            headMat.emissiveIntensity = Math.max(0, 0.9 * (1 - f / 0.5));
            var sc = f < 0.12 ? 0.6 + 0.4 * f / 0.12 : 1;
            spr.scale.set(60 * sc, 24 * sc, 1);
            spr.material.opacity = f < 1.2 ? 1 : Math.max(0, 1 - (f - 1.2) / 0.6);
            if (f > 1.8) { st.fl = -1; spr.visible = false; headMat.emissiveIntensity = 0; }
            anim = true;
          }
          if (anim) pose();
          return anim;
        }
      };
    }
  });
})();
