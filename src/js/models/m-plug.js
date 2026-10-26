/* Atelier Grizl : réparation d'une crevaison avec la mèche Park Tool TPT-1, pour l'atelier 3.5 « Crevaison en route »
   du Grizl CF 8 Di2 (4556, taille M). Un morceau du pneu Schwalbe G-One RX 45-622 TLR, au sommet de la bande de
   roulement, coupé dans le plan du trou ; l'outil, l'objet et la mèche ne sont pas coupés.
   Gestes de la notice Park Tool du TPT-1 (« 04/22 »), dans son ordre, comme les étapes « Mèche » de l'atelier : 1,
   trouver le trou et retirer l'objet ; 2, dévisser le capuchon ; 3, aléser le trou en faisant aller et venir la
   partie moletée de la fourche ; 4, enfiler une mèche à mi-longueur dans la fourche ; 5, enfoncer l'outil, la mèche se
   plie en deux, jusqu'à environ 6,35 mm (0,25 pouce) de bouts visibles ; 6, pousser la bague de maintien contre le
   pneu, là où la mèche dépasse ; 7, retirer l'outil en tenant la bague en place ; 8, regonfler pour tester, jamais plus
   de 3,0 bar sur ta jante sans crochet (manuel Canyon des roues), lus sur le manomètre de la mini-pompe, sans
   cartouche de CO2 (Schwalbe). La notice dit l'outil livré avec 5 mèches, et la réparation provisoire : le pneu est à
   remplacer dès que possible. Son étape 9, plusieurs mèches pour un très grand trou, n'est pas dessinée ; la taille de
   trou maximale du TPT-1 n'est pas publiée. Le liquide : Canyon le dit le plus efficace sur les petits trous, un trou
   plus grand pouvant demander une mèche ou une chambre à air.
   Curseur « Notice TPT-1 », de 1 à 8 : chaque cran montre le geste de la notice qui porte ce numéro. Son compteur dit
   « Étape n / 8 » ; le geste entier s'écrit sur une ligne sous la barre des commandes, qui revient à la ligne.
   Vue éclatée : le capuchon, tant qu'il est dessiné, s'éloigne encore de l'outil, et la bague de maintien s'écarte
   de l'aiguille.
   Formes approchées (aucune photo ni cote du TPT-1 n'est relevée ; seule cote publiée, les 6,35 mm de bouts visibles,
   respectée ici) :
   - outil : pièces nommées par la notice, d'après le relevé : le capuchon, la fourche et sa partie moletée, la bague
     de maintien ; la poignée cannelée, l'aiguille et le nez fileté où se visse le capuchon sont déduits ; formes,
     longueurs et diamètres approchés ;
   - capuchon : un tube fermé qui couvre la fourche, forme approchée ; une fois dévissé, il est posé debout à côté de
     la place de l'outil, puis rangé : il n'est plus dessiné à partir du geste 3 ;
   - bague de maintien : une bague qui coulisse sur l'aiguille, forme et course approchées ;
   - mèche : une lanière pliée en deux, longueur, largeur et épaisseur approchées ; ses bouts sont dessinés à 6,35 mm
     au-dessus de la bande de roulement ;
   - objet : un petit clou, dessiné pour l'exemple ;
   - pneu : section de 45 mm de large au plus ; bande de roulement, carcasse, gomme intérieure et couche de liquide en
     épaisseurs approchées, la carcasse plus épaisse sous la bande de roulement ; crampons placés comme dans la pièce de
     3.2 et la scène de l'accueil, petits et serrés au centre, plus gros et groupés par deux sur les épaules ; largeur
     du trou, avant et après l'alésage, approchée ;
   - couleurs, toutes approchées : pneu à flancs noirs, comme sur la photo officielle du vélo ; coupe de la carcasse
     beige, gomme intérieure gris foncé, liquide blanc (sa couleur n'est pas relevée) ; poignée bleue, partie moletée,
     aiguille et nez en métal clair, capuchon et bague noirs, mèche brune, clou en acier.
   Repère : axe de roue selon z, circonférence selon x, trou au sommet de la bande de roulement, à l'origine ; le pneu
   est coupé dans le plan x = 0. L'outil a son origine à la pointe de la fourche, son axe selon +y. Unités : mm. */
(function () {
  'use strict';
  var PI = Math.PI;
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function sstep(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  var LABELS = ['Trouve le trou et retire l’objet', 'Dévisse le capuchon du TPT-1', 'Alèse le trou', 'Enfile une mèche à mi-longueur dans la fourche de l’outil', 'Enfonce l’outil, environ 6,35 mm de mèche visibles', 'Pousse la bague de maintien sur le pneu', 'Retire l’outil en tenant la bague', 'Regonfle pour tester, jamais plus de 3,0 bar'];
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  AtelierModels.register('plug', {
    camera: { yaw: 1.12, pitch: 0.26, dist: 172, target: [-3, 17, 13], min: 40, max: 420 },
    explodeLabel: 'Vue éclatée',
    build: function (ctx) {
      var THREE = ctx.THREE, H = ctx.H, M = ctx.M, api = ctx.api;
      var root = new THREE.Group();
      var DS = THREE.DoubleSide;

      /* ---------- Matériaux (teintes approchées, voir l'en-tête) ---------- */
      function S(c, met, rough, extra) { return new THREE.MeshStandardMaterial(Object.assign({ color: c, metalness: met, roughness: rough }, extra || {})); }
      function PH(o) { return new THREE.MeshPhysicalMaterial(o); }
      var mTread = S(0x1a1a1c, 0, 0.8, { side: DS });
      var mTreadCut = S(0x2e2e31, 0, 0.95, { side: DS });
      var mSide = S(0x1c1c1e, 0, 0.72, { side: DS });
      var mCasingCut = S(0xa89070, 0, 0.9, { side: DS });
      var mLiner = S(0x2a2a2d, 0, 0.7, { side: DS });
      var mLinerCut = S(0x3a3a3d, 0, 0.9, { side: DS });
      var mSeal = PH({ color: 0xd9d6cc, roughness: 0.4, metalness: 0, clearcoat: 0.6, clearcoatRoughness: 0.3, side: DS });
      var mSealCut = S(0xf0ede4, 0, 0.5, { side: DS });
      var mPlug = PH({ color: 0x6b3d1d, roughness: 0.38, metalness: 0, clearcoat: 0.9, clearcoatRoughness: 0.2 });
      var mHandle = S(0x2d63c4, 0.5, 0.34, { side: DS });
      var mKnurl = S(0xc6cbd1, 1, 0.4, { side: DS });
      var mNeedle = M.steel;
      var mNose = M.alu;
      var mCap = S(0x1d1e21, 0.2, 0.5, { side: DS });
      var mRet = S(0x1f2023, 0.1, 0.48);
      var mNail = M.steelDark;

      /* ---------- Profil du pneu (r = rayon depuis l'axe de roue, a = position latérale) ---------- */
      var A = 45 / 2, B = 22.0, RC = 330;          // demi-largeur du pneu de 45 mm, centre de la section
      function P(th) { return [RC + B * Math.sin(th), A * Math.cos(th)]; }
      function Nn(th) { var nr = A * Math.sin(th), na = B * Math.cos(th), L = Math.hypot(nr, na); return [nr / L, na / L]; }
      function off(th, s) { var p = P(th), n = Nn(th); return [p[0] + n[0] * s, p[1] + n[1] * s]; }
      function treadT(a) { var u = Math.min(1, Math.abs(a) / 20); return 0.4 + 1.7 * Math.pow(1 - u * u, 0.7); }
      function sealT(a) { var u = Math.min(1, Math.abs(a) / 14); return 0.22 + 0.7 * Math.pow(Math.max(0, 1 - u * u), 1.5); }
      function casT(a) { var u = Math.min(1, Math.abs(a) / 16); return 1.0 + 0.5 * (1 - u * u); } // plus épaisse sous la bande de roulement
      var R0 = RC + B + treadT(0);                  // sommet de la bande de roulement, au trou
      var LIN = 0.3;                                // gomme intérieure
      var Y_IN = -(treadT(0) + casT(0) + LIN + sealT(0)); // surface intérieure du liquide, sous le trou
      var TH0 = -0.05, TH1 = PI + 0.05, NS = 72, LEN = 28, DMAX = 1.35;

      /* contour fermé : bord extérieur (fo) puis bord intérieur (fi) ; tags : 's' surface, 'c' coupe */
      function makeLoop(fo, fi, t0, t1, n, endTag) {
        var pts = [], tags = [], i;
        for (i = 0; i <= n; i++) { pts.push(fo(t0 + (t1 - t0) * i / n)); tags.push('s'); }
        tags[tags.length - 1] = endTag;
        for (i = n; i >= 0; i--) { pts.push(fi(t0 + (t1 - t0) * i / n)); tags.push('s'); }
        tags[tags.length - 1] = endTag;
        return { pts: pts, tags: tags };
      }
      function casIn(t) { return off(t, -casT(A * Math.cos(t))); }
      function linIn(t) { return off(t, -casT(A * Math.cos(t)) - LIN); }
      var thA = Math.acos(20 / A);
      var loops = {
        tread: makeLoop(function (t) { return off(t, treadT(A * Math.cos(t))); }, function (t) { return off(t, 0); }, thA, PI - thA, 64, 's'),
        casing: makeLoop(function (t) { return off(t, 0); }, casIn, TH0, TH1, NS, 'c'),
        liner: makeLoop(casIn, linIn, TH0, TH1, NS, 'c'),
        seal: makeLoop(linIn, function (t) { var p = linIn(t), n = Nn(t), d = sealT(A * Math.cos(t)); return [p[0] - n[0] * d, p[1] - n[1] * d]; }, TH0, TH1, NS, 'c')
      };
      var layers = [
        { loop: loops.tread, mS: mTread, mC: mTreadCut },
        { loop: loops.casing, mS: mSide, mC: mCasingCut },
        { loop: loops.liner, mS: mLiner, mC: mLinerCut },
        { loop: loops.seal, mS: mSeal, mC: mSealCut }
      ];

      /* découpe d'un contour par le demi-plan a >= c (ou a <= c) ; le bord créé est marqué 'k' (coupe) */
      function clipLoop(L, c, keepGreater) {
        var Pp = L.pts, T = L.tags, n = Pp.length, op = [], ot = [];
        function inside(p) { return keepGreater ? p[1] >= c : p[1] <= c; }
        for (var i = 0; i < n; i++) {
          var p = Pp[i], q = Pp[(i + 1) % n], ip = inside(p), iq = inside(q), I = null;
          if (ip !== iq) { var t = (c - p[1]) / (q[1] - p[1]); I = [p[0] + t * (q[0] - p[0]), c]; }
          if (ip && iq) { op.push(p); ot.push(T[i]); }
          else if (ip) { op.push(p); ot.push(T[i]); op.push(I); ot.push('k'); }
          else if (iq) { op.push(I); ot.push(T[i]); }
        }
        return { pts: op, tags: ot };
      }
      function sharp(pts) {
        var out = [pts[0]];
        for (var i = 1; i < pts.length - 1; i++) {
          var a = pts[i - 1], b = pts[i], c = pts[i + 1];
          var ux = b[0] - a[0], uy = b[1] - a[1], vx = c[0] - b[0], vy = c[1] - b[1];
          var lu = Math.hypot(ux, uy), lv = Math.hypot(vx, vy);
          out.push(b);
          if (lu > 1e-6 && lv > 1e-6 && (ux * vx + uy * vy) / (lu * lv) < 0.6) out.push([b[0], b[1]]);
        }
        out.push(pts[pts.length - 1]);
        return out;
      }
      /* tour d'un contour, découpé en suites d'arêtes de même nature (surface ou coupe) */
      function revolve(L, mS, mC, phi0, dphi, seg, parent) {
        var Pp = L.pts, T = L.tags, n = Pp.length, start = -1, runs = [], i;
        function isC(tag) { return tag !== 's'; }
        for (i = 0; i < n; i++) if (isC(T[i]) !== isC(T[(i - 1 + n) % n])) { start = i; break; }
        if (start < 0) runs.push({ c: isC(T[0]), pts: Pp.concat([Pp[0]]) });
        else {
          var cur = null;
          for (var k = 0; k < n; k++) {
            var e = (start + k) % n, c = isC(T[e]);
            if (!cur || cur.c !== c) { cur = { c: c, pts: [Pp[e]] }; runs.push(cur); }
            cur.pts.push(Pp[(e + 1) % n]);
          }
        }
        runs.forEach(function (r) {
          if (r.pts.length < 2) return;
          var g = new THREE.LatheGeometry(sharp(r.pts).map(function (p) { return new THREE.Vector2(p[0], p[1]); }), seg, phi0, dphi);
          parent.add(new THREE.Mesh(g, r.c ? mC : mS));
        });
      }
      function cap(pts, phi, mat, parent) {
        var cl = [];
        pts.forEach(function (p) { var q = cl[cl.length - 1]; if (!q || Math.hypot(p[0] - q[0], p[1] - q[1]) > 1e-4) cl.push(p); });
        if (cl.length > 2 && Math.hypot(cl[0][0] - cl[cl.length - 1][0], cl[0][1] - cl[cl.length - 1][1]) < 1e-4) cl.pop();
        if (cl.length < 3) return;
        var g = new THREE.ShapeGeometry(new THREE.Shape(cl.map(function (p) { return new THREE.Vector2(p[0], p[1]); })));
        g.rotateY(-PI / 2); g.rotateY(phi);
        parent.add(new THREE.Mesh(g, mat));
      }

      var tire = new THREE.Group(); root.add(tire);
      tire.rotation.x = PI / 2; tire.position.y = -R0;   // (r, a) du tour -> (x, y, z) : face de coupe x = 0, a -> z
      var phiMain = PI + DMAX / R0, phiEnd = PI + LEN / R0;
      layers.forEach(function (Ly) {
        revolve(Ly.loop, Ly.mS, Ly.mC, phiMain, phiEnd - phiMain, 14, tire);
        cap(Ly.loop.pts, phiEnd, Ly.mC, tire);
      });
      /* tranche près de la face de coupe, refaite quand le trou s'élargit (largeur w, profondeur dep) */
      var dyn = new THREE.Group(); tire.add(dyn);
      var curW = -1, curD = -1;
      function buildGroove(w, dep) {
        while (dyn.children.length) { var o = dyn.children[0]; dyn.remove(o); o.geometry.dispose(); }
        layers.forEach(function (Ly) {
          var phB = PI + dep / R0;
          if (DMAX - dep > 0.02) revolve(Ly.loop, Ly.mS, Ly.mC, phB, (DMAX - dep) / R0, 1, dyn);
          cap(Ly.loop.pts, phB, Ly.mC, dyn);
          [clipLoop(Ly.loop, w / 2, true), clipLoop(Ly.loop, -w / 2, false)].forEach(function (Hh) {
            if (Hh.pts.length < 3) return;
            revolve(Hh, Ly.mS, Ly.mC, PI, dep / R0, 1, dyn);
            cap(Hh.pts, PI, Ly.mC, dyn);
          });
        });
        curW = w; curD = dep;
      }

      /* ---------- Crampons, comme dans la pièce de 3.2 : au centre, rangées de trois puis de deux petits crampons ;
         sur chaque épaule, une paire, les deux épaules décalées d'un demi-motif. s : place le long de la section. ---------- */
      var TO = [];
      for (var it = 0; it <= 64; it++) { var tt = thA + (PI - 2 * thA) * it / 64; TO.push(off(tt, treadT(A * Math.cos(tt)))); }
      var iC = 32;
      function surf(s) { /* point et normale (vers l'extérieur) de la bande de roulement, à s mm du sommet */
        var dir = s < 0 ? 1 : -1, rest = Math.abs(s), k = iC;   // TO va de a > 0 vers a < 0
        while (k + dir >= 0 && k + dir < TO.length) {
          var p = TO[k], q = TO[k + dir], L = Math.hypot(q[0] - p[0], q[1] - p[1]);
          if (L >= rest) {
            var t = rest / L, r = p[0] + t * (q[0] - p[0]), a = p[1] + t * (q[1] - p[1]);
            var gr = (q[0] - p[0]) * dir, ga = (q[1] - p[1]) * dir, Ln = Math.hypot(gr, ga); // dans le sens de TO
            return { r: r, a: a, nr: -ga / Ln, na: gr / Ln };
          }
          rest -= L; k += dir;
        }
        return null;
      }
      var MOTIFS = 84;
      var CENTRE = { L: 3.6, W: 4, h: 2.6, rangees: [[-8, 0, 8], [-4, 4], [-8, 0, 8], [-4, 4]] };
      var EPAULE = [{ s: 15, t: 0, L: 4.5, W: 8.5, h: 3.4, ang: 0.5 }, { s: 20, t: 0.42, L: 10, W: 6.5, h: 3.4, ang: 0 }];
      var MOTIF = 360 / MOTIFS * PI / 180 * R0;     // longueur d'un motif sur le tour
      var C0 = 5.3 - MOTIF / 4;                     // début du motif : le premier rang dessiné, de deux crampons, est à 5,3 mm du trou
      var kl = [];
      for (var mo = -1; mo < 2; mo++) {
        CENTRE.rangees.forEach(function (rang, k) {
          rang.forEach(function (s) { kl.push({ c: C0 + mo * MOTIF + k * MOTIF / 4, s: s, L: CENTRE.L, W: CENTRE.W, h: CENTRE.h, ang: 0 }); });
        });
        [[1, 0], [-1, 0.5]].forEach(function (cd) {
          EPAULE.forEach(function (e) { kl.push({ c: C0 + mo * MOTIF + (e.t + cd[1]) * MOTIF, s: cd[0] * e.s, L: e.L, W: e.W, h: e.h, ang: cd[0] * e.ang }); });
        });
      }
      var knobG = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
      (function () { var pos = knobG.attributes.position; for (var i = 0; i < pos.count; i++) if (pos.getY(i) > 0.5) pos.setXYZ(i, pos.getX(i) * 0.75, pos.getY(i), pos.getZ(i) * 0.75); knobG.computeVertexNormals(); })();
      var knobs = kl.filter(function (o) {
        var hl = (Math.abs(o.L * Math.cos(o.ang)) + Math.abs(o.W * Math.sin(o.ang))) / 2;
        o.sf = surf(o.s);
        return o.sf && o.c - hl > DMAX + 0.45 && o.c + hl < LEN - 0.4;   // le pneu est coupé : aucun crampon ne dépasse
      });
      var knobMesh = new THREE.InstancedMesh(knobG, mTread, knobs.length), m4 = new THREE.Matrix4(), sc4 = new THREE.Matrix4();
      knobs.forEach(function (o, i) {
        var ph = PI + o.c / o.sf.r, sp = Math.sin(ph), cp = Math.cos(ph);
        var Rv = new THREE.Vector3(sp, 0, cp), Tv = new THREE.Vector3(cp, 0, -sp), Av = new THREE.Vector3(0, 1, 0);
        var N = Rv.clone().multiplyScalar(o.sf.nr).add(Av.clone().multiplyScalar(o.sf.na)).normalize();
        var Tg = Tv.clone(), Bn = new THREE.Vector3().crossVectors(Tg, N);
        if (o.ang) { Tg.multiplyScalar(Math.cos(o.ang)).addScaledVector(Bn, Math.sin(o.ang)).normalize(); Bn.crossVectors(Tg, N); }
        var Pv = Rv.clone().multiplyScalar(o.sf.r).add(Av.clone().multiplyScalar(o.sf.a)).addScaledVector(N, -0.5);
        m4.makeBasis(Tg, N, Bn).multiply(sc4.makeScale(o.L, o.h + 0.5, o.W)).setPosition(Pv);
        knobMesh.setMatrixAt(i, m4);
      });
      tire.add(knobMesh);

      /* ---------- Outil Park Tool TPT-1 (origine à la pointe de la fourche, axe +y) ---------- */
      var RN = 1.2, GAP = 0.72, TINE = 7, KNURL_TOP = TINE + 2.6, NEEDLE = 27, NOSE = 4;
      function paramSurf(nu, nv, fn, closedU) {
        var pos = [], idx = [], i, j;
        for (j = 0; j <= nv; j++) for (i = 0; i <= nu; i++) { var p = fn(i / nu, j / nv); pos.push(p[0], p[1], p[2]); }
        for (j = 0; j < nv; j++) for (i = 0; i < nu; i++) { var a = j * (nu + 1) + i, b = a + 1, c = a + nu + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
        var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
        if (closedU) {
          var nm = g.attributes.normal;
          for (j = 0; j <= nv; j++) {
            var i0 = j * (nu + 1), i1 = i0 + nu, x = nm.getX(i0) + nm.getX(i1), y = nm.getY(i0) + nm.getY(i1), z = nm.getZ(i0) + nm.getZ(i1), L = Math.hypot(x, y, z) || 1;
            nm.setXYZ(i0, x / L, y / L, z / L); nm.setXYZ(i1, x / L, y / L, z / L);
          }
        }
        return g;
      }
      var KP = 2 * PI * RN / 13;                    // pas du moletage croisé, périodique sur le tour
      function tri(x) { x -= Math.floor(x); return 1 - Math.abs(x - 0.5) * 2; }
      function knurl(s, y) { return 0.09 * (tri((s + y) / KP) + tri((s - y) / KP)) * 0.5; }
      function rProng(y) { return y < 1.5 ? lerp(0.78, RN, Math.sqrt(y / 1.5)) : RN; }
      var tool = new THREE.Group(); root.add(tool);
      [1, -1].forEach(function (sx) {
        H.mesh(paramSurf(16, 54, function (u, v) {
          var y = v * TINE, R = rProng(y), th0 = Math.acos(clamp(GAP / R, -1, 1)), th = (u * 2 - 1) * th0;
          var s = (sx > 0 ? th : PI - th) * RN;
          var r = R - knurl(s, y) * Math.sqrt(Math.sin(u * PI)) * sstep(0.4, 1.4, y);
          return [sx * r * Math.cos(th), y, r * Math.sin(th)];
        }), mKnurl, tool);
        H.mesh(paramSurf(3, 14, function (u, v) {
          var y = v * TINE, R = rProng(y), zm = Math.sqrt(Math.max(0, R * R - GAP * GAP));
          return [sx * GAP, y, (u * 2 - 1) * zm];
        }), mKnurl, tool);
      });
      H.mesh(paramSurf(64, 22, function (u, v) {
        var th = u * 2 * PI, y = TINE + v * (KNURL_TOP - TINE), r = RN - knurl(th * RN, y) * (1 - sstep(KNURL_TOP - 0.5, KNURL_TOP, y));
        return [r * Math.cos(th), y, r * Math.sin(th)];
      }, true), mKnurl, tool);
      var slotEnd = new THREE.CircleGeometry(RN, 24); slotEnd.rotateX(PI / 2); H.mesh(slotEnd, mNeedle, tool, [0, TINE, 0]);
      var shaftG = new THREE.CylinderGeometry(RN, RN, NEEDLE - KNURL_TOP + 0.3, 24, 1, true);
      H.mesh(shaftG, mNeedle, tool, [0, (KNURL_TOP + NEEDLE + 0.3) / 2 - 0.15, 0]);
      /* nez fileté, où se visse le capuchon */
      var noseP = [[RN, NEEDLE - 0.3], [1.8, NEEDLE + 0.2], [2.6, NEEDLE + 0.55]];
      for (var th2 = 0; th2 < 9; th2++) { var y0 = NEEDLE + 0.7 + th2 * 0.36; noseP.push([2.62, y0], [2.95, y0 + 0.18]); }
      noseP.push([2.62, NEEDLE + NOSE - 0.05], [3.1, NEEDLE + NOSE]);
      H.mesh(H.lathe(noseP, 40), mNose, tool);
      /* poignée cannelée */
      var HB0 = NEEDLE + NOSE;
      var hp = [[3.1, 0], [4.8, 0.05], [5.5, 0.6], [5.8, 1.8], [5.95, 5], [6.0, 13], [5.8, 20], [6.05, 27], [6.15, 34], [6.0, 37.5], [5.4, 39.2], [4.2, 40.0], [2.2, 40.35], [0, 40.4]].map(function (p) { return [p[0], p[1] * 0.94]; });
      var hl = [0]; for (var k2 = 1; k2 < hp.length; k2++) hl.push(hl[k2 - 1] + Math.hypot(hp[k2][0] - hp[k2 - 1][0], hp[k2][1] - hp[k2 - 1][1]));
      function hAt(s) {
        for (var k = 1; k < hp.length; k++) if (s <= hl[k] || k === hp.length - 1) { var t = clamp((s - hl[k - 1]) / (hl[k] - hl[k - 1]), 0, 1); return [lerp(hp[k - 1][0], hp[k][0], t), lerp(hp[k - 1][1], hp[k][1], t)]; }
      }
      H.mesh(paramSurf(72, 70, function (u, v) {
        var q = hAt(v * hl[hl.length - 1]), th = u * 2 * PI, y = q[1];
        var fy = sstep(5, 7.5, y) * (1 - sstep(31, 33.5, y));
        var r = q[0] - 0.42 * fy * Math.pow(Math.max(0, Math.cos(12 * th)), 6);
        return [r * Math.cos(th), HB0 + y, r * Math.sin(th)];
      }, true), mHandle, tool);
      /* bague de maintien : elle coulisse sur l'aiguille ; retEx l'écarte en vue éclatée */
      var RET_LEN = 3.5, RET_PARK = NEEDLE - RET_LEN - 0.05, RET_MIN = KNURL_TOP + 0.1, RET_PRESS = 1.95;
      var retEx = new THREE.Group(); tool.add(retEx);
      var ret = new THREE.Group(); retEx.add(ret);
      H.mesh(H.lathe([[1.24, 0], [2.3, 0], [2.6, 0.3], [2.6, RET_LEN - 0.3], [2.3, RET_LEN], [1.24, RET_LEN], [1.24, 0]], 40), mRet, ret);
      var aTool = new THREE.Object3D(); aTool.position.set(4.6, HB0 + 10, 3.9); tool.add(aTool);
      var aKnurl = new THREE.Object3D(); aKnurl.position.set(0.3, KNURL_TOP - 0.3, RN + 0.05); tool.add(aKnurl);

      /* ---------- Capuchon : vissé sur le nez au geste 1, posé debout à côté de l'outil au geste 2, puis rangé ---------- */
      var PARK = { z: 30, y: -2, t: 0 };            // place de l'outil avant l'alésage, à côté du pneu
      var capFrame = new THREE.Group(); root.add(capFrame);
      capFrame.position.set(0, PARK.y, PARK.z); capFrame.rotation.x = PARK.t;
      var capEx = new THREE.Group(); capFrame.add(capEx);
      var capM = H.mesh(H.lathe([[0, -2.0], [3.3, -2.0], [3.6, -1.6], [3.6, HB0 - 0.1], [3.0, HB0 - 0.1], [3.0, -1.2], [0, -1.2]], 40), mCap, capEx);
      var CAP_OFF = [9, -6];                         // capuchon posé : à côté de l'outil, plus loin du pneu
      function capAt(c) {
        var a = sstep(0, 0.55, c), b = sstep(0.55, 1, c);
        capM.position.set(0, -36 * a + (36 + CAP_OFF[1]) * b, CAP_OFF[0] * b);
        capM.rotation.y = -a * PI * 6;               // il se dévisse
      }

      /* ---------- Petit clou ---------- */
      var nail = new THREE.Group(); root.add(nail);
      H.mesh(H.lathe([[0, 0], [0.7, 1.5], [0.7, 11.5], [1.75, 11.55], [1.75, 12.0], [1.4, 12.25], [0, 12.35]], 28), mNail, nail);

      /* ---------- Mèche : lanière balayée le long d'un chemin dans le plan x = 0 ---------- */
      var TAIL = 6.35;                               // bouts visibles, notice Park Tool
      var LH = 21, RHO = 0.8, HQ = 0.68, HBN = 0.65, RTB = 1.0, DROOP = -0.1, ANG4 = PI / 3, ANG5 = PI / 4;
      function halfPath(g, ang1, ang2, yb, rt) {
        var pts = [[0, yb]], z = 0, y = yb, inc = 0, L = 0, ds = 0.04;
        function adv(len, dang) {
          if (len <= 1e-6) return;
          var n = Math.max(1, Math.ceil(len / ds)), h = len / n, dp = dang / n;
          for (var i = 0; i < n && L < LH - 1e-6; i++) {
            var hh = Math.min(h, LH - L), f = hh / h;
            inc += dp * f / 2; z += Math.cos(inc) * hh; y += Math.sin(inc) * hh; inc += dp * f / 2; L += hh;
            pts.push([z, y]);
          }
        }
        adv(g, 0);
        adv(RHO * Math.abs(ang1), ang1);
        if (ang1 > 0.15 && y < 0) adv(-y / Math.sin(ang1), 0);
        adv(rt * Math.abs(ang2 - inc), ang2 - inc);
        adv(LH - L, 0);
        /* rééchantillonnage régulier */
        var out = [pts[0]], acc = 0, step = 0.3, need = step;
        for (var k = 1; k < pts.length; k++) {
          var a = pts[k - 1], b = pts[k], dl = Math.hypot(b[0] - a[0], b[1] - a[1]);
          while (acc + dl >= need && dl > 0) { var t = (need - acc) / dl; out.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]); need += step; }
          acc += dl;
        }
        var last = pts[pts.length - 1], ol = out[out.length - 1];
        if (Math.hypot(last[0] - ol[0], last[1] - ol[1]) > 0.05) out.push(last);
        return out;
      }
      function huAt(y, z) {
        var zone = sstep(Y_IN - 1.0, Y_IN + 0.3, y) * (1 - sstep(-0.3, 0.8, y)) * (1 - sstep(3, 4, Math.abs(z)));
        return RHO - (RHO - HQ) * zone;
      }
      function sweep(P3) {
        var n = P3.length, NC = 3, K = 4 * (NC + 1), pos = [], nor = [], idx = [];
        var Bv = new THREE.Vector3(1, 0, 0), T = new THREE.Vector3(), N = new THREE.Vector3(), i, k;
        var tans = [];
        for (i = 0; i < n; i++) {
          T.subVectors(P3[Math.min(n - 1, i + 1)], P3[Math.max(0, i - 1)]).normalize(); tans.push(T.clone());
          N.crossVectors(Bv, T).normalize();
          var hu = huAt(P3[i].y, P3[i].z), hv = HBN, rr = Math.min(0.32, hu * 0.9, hv * 0.9);
          for (var q = 0; q < 4; q++) {
            var su = (q === 0 || q === 3) ? 1 : -1, sv = q < 2 ? 1 : -1;
            for (var j = 0; j <= NC; j++) {
              var ang = (q + j / NC) * PI / 2, cu = Math.cos(ang), cv = Math.sin(ang);
              var u = su * (hu - rr) + rr * cu, v = sv * (hv - rr) + rr * cv;
              pos.push(P3[i].x + N.x * u + Bv.x * v, P3[i].y + N.y * u + Bv.y * v, P3[i].z + N.z * u + Bv.z * v);
              nor.push(N.x * cu + Bv.x * cv, N.y * cu + Bv.y * cv, N.z * cu + Bv.z * cv);
            }
          }
        }
        for (i = 0; i < n - 1; i++) for (k = 0; k < K; k++) {
          var a = i * K + k, b = i * K + (k + 1) % K, c = a + K, d = b + K; idx.push(a, b, d, a, d, c);
        }
        [0, n - 1].forEach(function (ri, e) {
          var tn = tans[ri], sg = e ? 1 : -1, base = pos.length / 3, P0 = P3[ri];
          pos.push(P0.x, P0.y, P0.z); nor.push(tn.x * sg, tn.y * sg, tn.z * sg);
          for (k = 0; k < K; k++) { var vi = (ri * K + k) * 3; pos.push(pos[vi], pos[vi + 1], pos[vi + 2]); nor.push(tn.x * sg, tn.y * sg, tn.z * sg); }
          for (k = 0; k < K; k++) { var k1 = (k + 1) % K; if (e) idx.push(base, base + 1 + k, base + 1 + k1); else idx.push(base, base + 1 + k1, base + 1 + k); }
        });
        var g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setIndex(idx);
        return g;
      }
      var plugFrame = new THREE.Group(); root.add(plugFrame);
      var plug = new THREE.Mesh(new THREE.BufferGeometry(), mPlug); plugFrame.add(plug);
      var plugKey = '', plugEnds = null;
      function buildPlug(g, ang1, ang2, yb, zOff, rt) {
        var key = [g, ang1, ang2, yb, zOff, rt].map(function (v) { return v.toFixed(3); }).join(',');
        if (key === plugKey) return; plugKey = key;
        var hp2 = halfPath(g, ang1, ang2 * (ang2 > 0 ? 1.06 : 1), yb, rt), hpL = halfPath(g, ang1, ang2 * (ang2 > 0 ? 0.9 : 1.1), yb, rt);
        var fullP = hpL.slice().reverse().map(function (p) { return [-p[0], p[1]]; }).concat(hp2.slice(1));
        var P3 = fullP.map(function (p) { return new THREE.Vector3(0, p[1], p[0] + zOff); });
        plug.geometry.dispose(); plug.geometry = sweep(P3);
        plugEnds = { left: P3[P3.length - 1].clone() };
      }

      /* ---------- Repères des pastilles ---------- */
      var FAR = [0, 1e5, 0];
      var aHole = new THREE.Object3D(); aHole.position.set(0.02, -1.4, 1.9); root.add(aHole);
      var aFork = new THREE.Object3D(), aTail = new THREE.Object3D(); root.add(aFork); root.add(aTail);
      var aSeal = new THREE.Object3D(), aAir = new THREE.Object3D(), aProv = new THREE.Object3D(); root.add(aSeal); root.add(aAir); root.add(aProv);
      /* liquide, air et trou écartés du groupe de la mèche, sur leur pièce, pour que les numéros ne se couvrent pas */
      (function () { var th = Math.acos(15 / A), q = linIn(th), d = sealT(15) * 0.5, n = Nn(th); aSeal.position.set(0.03, q[0] - n[0] * d - R0, q[1] - n[1] * d); })();
      aAir.position.set(0.03, Y_IN - 22, -13);
      (function () { var th = 0.22, p = off(th, 0), ph = PI + 15 / p[0]; aProv.position.set(p[0] * Math.sin(ph), -p[0] * Math.cos(ph) - R0, p[1] + 0.05); })();

      /* ---------- Étapes de la notice : la pose au cran v montre le geste v ; entre deux crans, le geste suivant ---------- */
      var TIP2 = -9, SLOT_Y = TINE - RHO;
      var TIP3 = 3, P5 = { z: 13, y: 10, t: 0.62 };
      var TIP4 = -(LH - RN - PI / 2 * RHO - TAIL) - RHO - SLOT_Y; /* environ 6,35 mm de mèche au-dessus de la bande de roulement */
      var YB4 = TIP4 + SLOT_Y;
      function sousLaBague(nat, rb) { return Math.min(nat, Math.asin(clamp((rb - 1.55) / 5, 0, 1))); } // la bague rabat les bouts
      function pose(s) {
        var st = { nailVis: false, nailTip: 2, nailZ: -3, nailTilt: 0.35, tipY: PARK.y, toolZ: PARK.z, tilt: PARK.t, ret: RET_PARK, cap: 1,
          plugVis: false, inTool: false, g: RN, ang1: 0, ang2: -0.22, rt: 34, yb: SLOT_Y, zOff: 0, reamed: s >= 3, capVis: s < 2.5 };
        var k = Math.min(7, Math.floor(s)), t = s - k, a, b, c, dd;
        if (k < 1) { k = 1; t = 0; }
        if (k === 1) {                                  // 1 -> 2 : l'objet s'en va, le capuchon se dévisse
          a = sstep(0, 0.35, t);
          st.nailVis = t < 0.35; st.nailTip = 2 + 14 * a; st.nailZ = -3 - 10 * a; st.nailTilt = 0.35 + 0.3 * a;
          st.cap = sstep(0.3, 1, t);
        } else if (k === 2) {                           // 2 -> 3 : l'outil va au trou, s'enfonce et l'alèse
          var m = sstep(0, 0.45, t), d = sstep(0.45, 0.7, t), w = clamp((t - 0.7) / 0.3, 0, 1);
          st.toolZ = lerp(PARK.z, 0, m); st.tilt = lerp(PARK.t, 0, m);
          st.tipY = lerp(PARK.y, TIP3, m) + (TIP2 - TIP3) * d - 2.4 * Math.pow(Math.sin(w * PI * 2), 2);
          st.reamed = t > 0.7;
        } else if (k === 3) {                           // 3 -> 4 : l'outil sort, une mèche entre dans la fourche
          a = sstep(0, 0.3, t); b = sstep(0.78, 1, t); c = sstep(0.36, 0.72, t);
          st.toolZ = 0; st.tilt = 0;
          st.tipY = lerp(lerp(TIP2, 16, a), TIP3, b);
          st.plugVis = t > 0.34; st.inTool = true; st.yb = lerp(-2.6, SLOT_Y, c); st.zOff = lerp(8, 0, c);
        } else if (k === 4) {                           // 4 -> 5 : l'outil enfonce la mèche, qui se plie en deux
          st.toolZ = 0; st.tilt = 0; st.plugVis = true;
          st.tipY = lerp(TIP3, TIP4, sstep(0, 1, t));
          if (st.tipY + SLOT_Y > 4.5) { st.inTool = true; st.ang2 = lerp(-0.22, DROOP, sstep(TIP3 + SLOT_Y, 4.5, st.tipY + SLOT_Y)); }
          else {
            st.yb = st.tipY + SLOT_Y; dd = -st.yb;
            st.ang1 = PI / 2 * sstep(-0.9, 1.4, dd); st.rt = lerp(34, RTB, sstep(-4.5, -0.5, dd));
            st.ang2 = sousLaBague(lerp(DROOP, ANG4, sstep(0.3, 9, dd)), st.tipY + RET_PARK);
          }
        } else {                                        // 5 -> 6 : la bague descend ; 6 -> 7 : l'outil sort, puis s'écarte
          var p1 = k === 5 ? sstep(0, 1, t) : 1, p2 = k === 6 ? sstep(0, 0.55, t) : k > 6 ? 1 : 0, p4 = k === 6 ? sstep(0.55, 0.95, t) : k > 6 ? 1 : 0;
          st.tipY = lerp(lerp(TIP4, 6.5, p2), P5.y, p4); st.toolZ = lerp(0, P5.z, p4); st.tilt = lerp(0, P5.t, p4);
          var retW = lerp(TIP4 + RET_PARK, RET_PRESS, p1);
          st.ret = clamp(retW - st.tipY, RET_MIN, RET_PARK);
          var col = sstep(-12.5, 0.5, st.tipY);
          st.plugVis = true; st.g = RN * (1 - col); st.yb = YB4 - 0.6 * col; st.ang1 = PI / 2; st.rt = RTB;
          st.ang2 = sousLaBague(lerp(ANG4, ANG5, col), st.tipY + st.ret * Math.cos(st.tilt));
        }
        return st;
      }
      var tmpV = new THREE.Vector3(), cur = null;
      function apply(st) {
        cur = st;
        var e = api.viewer ? api.viewer.ex : 0, k = e * e * (3 - 2 * e);
        nail.visible = st.nailVis; nail.position.set(0, st.nailTip, st.nailZ); nail.rotation.x = st.nailTilt;
        tool.position.set(0, st.tipY, st.toolZ); tool.rotation.x = st.tilt; ret.position.y = st.ret;
        capAt(st.cap); capEx.position.set(0, -14 * k, 0); retEx.position.set(7 * k, 0, 0);
        capFrame.visible = st.capVis;                  // rangé : ni capuchon ni pastille
        if (st.capVis) capFrame.position.set(0, PARK.y, PARK.z); else capFrame.position.set(FAR[0], FAR[1], FAR[2]);
        plug.visible = st.plugVis;
        if (st.inTool) { plugFrame.position.copy(tool.position); plugFrame.rotation.x = st.tilt; }
        else { plugFrame.position.set(0, 0, 0); plugFrame.rotation.x = 0; }
        if (st.plugVis) buildPlug(st.inTool ? RN : st.g, st.inTool ? 0 : st.ang1, st.ang2, st.yb, st.zOff, st.rt);
        /* largeur du trou : objet, aiguille ou mèche qui l'occupent */
        var needleIn = Math.abs(st.toolZ) < 0.3 && Math.abs(st.tilt) < 0.01 && st.tipY < 0.2 ? 1 : 0;
        var legsIn = st.plugVis && !st.inTool ? sstep(-0.5, 1.2, -st.yb) : 0;
        var w = Math.max(st.reamed ? 2.2 : 1.55, needleIn * 2.38, legsIn * (2 * (st.g + RHO + HQ) - 0.1));
        var dep = needleIn ? 1.25 : legsIn > 0.5 ? 0.72 : clamp(w / 2, 0.75, 1.1);
        if (Math.abs(w - curW) > 0.004 || Math.abs(dep - curD) > 0.004) buildGroove(w, dep);
        /* pastilles mobiles : la mèche n'a de repère que quand elle est là */
        plugFrame.updateMatrixWorld(true);
        if (st.plugVis && plugEnds) {
          var en = plugEnds.left;
          aTail.position.copy(plugFrame.localToWorld(tmpV.set(HBN + 0.02, en.y, en.z)));
          if (st.inTool || st.g > RN / 2) aFork.position.copy(plugFrame.localToWorld(tmpV.set(HBN + 0.02, st.yb - 0.4, st.zOff - (st.g + 1.5))));  // bas du pli, côté extérieur
          else aFork.position.set(FAR[0], FAR[1], FAR[2]);  // la fourche est sortie de la mèche
        } else { aTail.position.set(FAR[0], FAR[1], FAR[2]); aFork.position.set(FAR[0], FAR[1], FAR[2]); }
      }
      /* Le compteur du curseur reste court (« Étape 4 / 8 ») : un texte long écraserait le curseur, que la barre
         partage avec les boutons. Le geste entier s'écrit sur une ligne à lui, sous la barre des commandes, qui revient
         à la ligne : « jamais plus de 3,0 bar » du geste 8 n'est jamais coupé, et rien au-dessus du curseur ne change de
         hauteur d'un cran à l'autre. La barre est l'élément qui suit la pièce (la visionneuse l'y pose). format() est
         appelé à la création de la barre, puis à chaque cran ; la liste numérotée, posée ensuite sous la barre, passe
         sous la ligne à la première image (onFrame). */
      var ligne = null, placee = false;
      function geste(v) {
        var stage = api.viewer && api.viewer.stage, barre = stage && stage.nextElementSibling;
        if (!ligne) {
          ligne = document.createElement('p'); ligne.className = 'v3d-geste'; ligne.setAttribute('aria-live', 'polite');
          ligne.style.cssText = 'margin:0;padding:8px 12px;border-top:1px solid var(--line-2);font-family:var(--f-mono);font-size:.76rem;line-height:1.45;color:var(--acc);white-space:normal';
        }
        if (barre && barre !== ligne && barre.nextElementSibling !== ligne) barre.insertAdjacentElement('afterend', ligne);
        ligne.textContent = 'Étape ' + v + ' de la notice : ' + LABELS[v - 1];
      }
      var s = 6, sT = 6, lastE = -1;
      apply(pose(s));
      /* pièce vide à décalage nul : la visionneuse n'affiche « Vue éclatée » que si parts n'est pas vide ; l'éclaté est fait par apply() */
      var dummy = new THREE.Group(); root.add(dummy);

      return {
        group: root,
        parts: [{ obj: dummy, off: [0, 0, 0] }],
        pins: [
          { obj: aSeal, p: [0, 0, 0], text: 'Liquide dans le pneu : le plus efficace sur les petits trous ; un trou plus grand peut demander une mèche ou une chambre à air (Canyon)' },
          { obj: aHole, p: [0, 0, 0], text: 'Trou dans la bande de roulement : trouve-le, et retire l’objet qui l’a fait s’il y est encore' },
          { obj: aTool, p: [0, 0, 0], text: 'Park Tool TPT-1, livré avec 5 mèches' },
          { obj: capM, p: [3.6, 14, 0], text: 'Capuchon du TPT-1 : dévisse-le et retire-le avant les étapes suivantes' },
          { obj: aKnurl, p: [0, 0, 0], text: 'Partie moletée de la fourche : enfonce l’outil dans le trou et alèse la zone abîmée en la faisant aller et venir' },
          { obj: aFork, p: [0, 0, 0], text: 'Mèche enfilée à mi-longueur dans la fourche de l’outil' },
          { obj: aTail, p: [0, 0, 0], text: 'Bouts de la mèche : environ 6,35 mm (0,25 pouce) encore visibles ; la mèche se plie en deux en entrant' },
          { obj: ret, p: [2.62, RET_LEN / 2, 0], text: 'Bague de maintien : pousse-la contre le pneu, là où la mèche dépasse, puis tiens-la en place en retirant l’outil' },
          { obj: aAir, p: [0, 0, 0], text: 'Regonfle pour tester, jamais plus de 3,0 bar, lus sur le manomètre de ta mini-pompe, sans cartouche de CO2 (dioxyde de carbone) ; ta jante reste sans crochet' },
          { obj: aProv, p: [0, 0, 0], text: 'Réparation provisoire : remplace le pneu dès que possible (notice Park Tool)' }
        ],
        controls: [{ type: 'range', label: 'Notice TPT-1', min: 1, max: 8, step: 1, value: 6,
          format: function (v) { geste(v); return 'Étape ' + v + ' / 8'; },
          onChange: function (v) { sT = v; if (reduce) { s = sT; apply(pose(s)); } api.dirty(); } }],
        onFrame: function (dt) {
          if (!placee) { placee = true; geste(sT); }
          var e = api.viewer ? api.viewer.ex : 0;
          if (s === sT) { if (e !== lastE) { lastE = e; apply(cur); } return false; }
          var sp = (dt || 0.016) / 1.15 * (1 + 0.6 * Math.max(0, Math.abs(sT - s) - 1));
          s = sT > s ? Math.min(sT, s + sp) : Math.max(sT, s - sp);
          lastE = e; apply(pose(s)); return true;
        }
      };
    }
  });
})();
