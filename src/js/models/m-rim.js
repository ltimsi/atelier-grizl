/* Atelier Grizl : coupe d'une portion de roue du Grizl CF 8 Di2 (4556, taille M), pour l'atelier 3.2 « Passer en
   tubeless ». Jante Canyon GR 30 CF en carbone, sans crochet (TSS, Tubeless Straight Side) : « Rim height 30 mm »,
   « Inner width 27 mm », « Rim material Carbon » sur la fiche du vélo ; « Internal width: 27mm hookless », « External
   width: 33mm, ETRTO 622x27TSS » sur la page Canyon de la paire GR 30 CF. Ruban tubeless, pneu Schwalbe G-One RX
   45-622 TLR (fiche Schwalbe : « ETRTO: 45-622 », « Seal: TLR »), liquide Muc-Off Road & Gravel (70 à 80 ml au
   minimum pour ton pneu de 45 mm, et jusqu'à 20 ml de plus, page Muc-Off du liquide), valve tubeless Presta à obus
   démontable, sans marque : tes valves ne sont pas encore choisies, le chapitre en donne les critères (3.1).
   Jamais plus de 3,0 bar dans le pneu, même pour talonner (manuel Canyon des roues, p.4 imprimée, « always never
   exceed ») : une pastille le dit, et rien dans cette pièce ne parle d'une autre pression.
   Cotes publiées, respectées ici : hauteur de jante de 30 mm, largeur intérieure de 27 mm, largeur extérieure de 33 mm,
   siège du talon au diamètre de 622 mm (le « 622 » de la désignation, comme dans la scène de l'accueil,
   src/scene/geometrie.js) ; pneu de 45 mm de large au plus ; 24 rayons par roue (page de la paire).
   Choix déclarés, comme dans la scène (src/scene/pieces/roues.js) : la hauteur est prise du haut des bords de jante au
   fond de la jante, la largeur intérieure entre les faces intérieures des bords, la largeur extérieure sur les bords ;
   Canyon ne dit pas où il les mesure. Déduction : chaque bord a 3 mm d'épaisseur, la moitié de 33 moins 27.
   Formes approchées (aucune autre cote publiée dans les documents cités) :
   - jante : hauteur des bords au-dessus du siège (4,5 mm), siège du talon, petit bourrelet et creux central repris des
     valeurs de dessin de la scène ; haut des bords arrondi, flancs droits, fond en U, caisson creux et épaisseurs du
     carbone approchés ; trous de rayons du fond de jante et trou de valve : place et taille approchées ;
   - ruban : largeur de dessin, du creux central jusqu'aux bords, et épaisseur exagérée pour se voir ; sa largeur
     est à lire sur ton ruban ;
   - pneu : section, épaisseur de la carcasse, talons et leurs tringles, bande de roulement et crampons approchés ;
     crampons placés comme dans la scène, petits et serrés au centre, plus gros et groupés par deux sur les épaules
     (photos officielles du vélo) ; inscriptions des flancs non dessinées ;
   - liquide : dessiné en couche sous la bande de roulement, comme après l'avoir réparti en faisant tourner la roue ;
     épaisseur et répartition approchées ;
   - valve : forme générique d'une valve Presta tubeless à obus démontable, longueur de dessin ; sa vraie longueur pour
     ta jante de 30 mm est à lire sur la pièce ; pied en caoutchouc, filetage, écrou moleté et obus en forme approchée ;
   - rayons et écrous de rayon : place autour de la valve, croisement et profil plat comme dans la scène ; seuls les 4
     de la portion sont dessinés, coupés avant le moyeu ;
   - cotes en violet : des repères de dessin, pas des pièces ;
   - couleurs, toutes approchées : jante, rayons et écrous de rayon noirs, pneu à flancs noirs, comme sur la photo
     officielle du vélo ; coupe du carbone gris foncé ; ruban bleu pour se voir (celui de la vidéo Canyon est noir, le
     tien est à lire sur la jante) ; liquide blanc translucide, sa couleur n'est pas relevée ; tringles des talons
     jaunes ; valve en aluminium, écrou gris, pied noir, obus en laiton.
   Bascule « Pneu transparent » : le pneu s'efface presque, pour voir le ruban, le pied de la valve et le liquide.
   Vue éclatée : le pneu monte, le ruban se lève et montre les trous de rayons du fond de jante, la valve sort vers le
   pneu, son écrou et son obus descendent.
   Repère : profils en (r, a), r rayon depuis l'axe de roue, a position latérale ; axe de roue selon z ; portion de 60°
   depuis le haut de la roue, à la valve (x = 0), vers -x ; la face de coupe visible est dans le plan x = 0. Unités : mm. */
(function () {
  'use strict';
  var DEG = Math.PI / 180;

  AtelierModels.register('rim', {
    camera: { yaw: 1.0, pitch: 0.14, dist: 205, target: [-12, 308, -2], min: 80, max: 700 },
    explodeLabel: 'Vue éclatée',
    build: function (ctx) {
      var THREE = ctx.THREE, H = ctx.H, M = ctx.M;
      var root = new THREE.Group();
      var PH0 = Math.PI, PHL = Math.PI / 3, SEG = 72;

      /* ---------- Outils de profil ---------- */
      function V(p) { return H.V2(p[0], p[1]); }
      function mir(pts) { return pts.map(function (p) { return [p[0], -p[1]]; }); }
      function area(pts) { var s = 0; for (var i = 0; i < pts.length; i++) { var a = pts[i], b = pts[(i + 1) % pts.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; }
      function spline(pts, n) { return new THREE.SplineCurve(pts.map(V)).getPoints(n).map(function (v) { return [v.x, v.y]; }); }
      /* tour d'un contour fermé avec arêtes vives aux angles marqués ; outward : normales vers l'extérieur du contour */
      function loopLathe(loop, outward, seg, ph0, phl) {
        var L = loop.slice(); if ((area(L) > 0) !== outward) L.reverse();
        L.push(L[0]);
        var out = [L[0]];
        for (var i = 1; i < L.length - 1; i++) {
          var a = L[i - 1], b = L[i], c = L[i + 1];
          var ux = b[0] - a[0], uy = b[1] - a[1], vx = c[0] - b[0], vy = c[1] - b[1];
          var cs = (ux * vx + uy * vy) / (Math.hypot(ux, uy) * Math.hypot(vx, vy) || 1);
          out.push(b); if (cs < 0.6) out.push([b[0], b[1]]);
        }
        out.push(L[L.length - 1]);
        return H.lathe(out, seg || SEG, ph0 == null ? PH0 : ph0, phl == null ? PHL : phl);
      }
      function caps(loop, holes, mat, parent) {
        H.latheCaps(loop, PH0, PHL, holes || []).forEach(function (x) { H.mesh(x, mat, parent); });
      }
      /* garde la partie d'un demi-profil (qui part de a = 0 et y revient) où a >= amin */
      function clipHalf(pts, amin) {
        var out = [], i;
        for (i = 0; i < pts.length - 1; i++) {
          var p = pts[i], q = pts[i + 1];
          if (p[1] >= amin) out.push(p);
          if ((p[1] - amin) * (q[1] - amin) < 0) { var t = (amin - p[1]) / (q[1] - p[1]); out.push([p[0] + t * (q[0] - p[0]), amin]); }
        }
        if (pts[pts.length - 1][1] >= amin) out.push(pts[pts.length - 1]);
        return out;
      }
      /* demi-polyligne partant du centre (a = 0) vers a > 0 : polyligne complète de gauche à droite */
      function full(half) { return mir(half.slice(1)).reverse().concat(half); }
      /* décalage d'une polyligne ouverte selon la normale gauche (dr, da) -> (da, -dr) */
      function offset(pts, d) {
        return pts.map(function (p, i) {
          var a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], tr = b[0] - a[0], ta = b[1] - a[1], L = Math.hypot(tr, ta) || 1;
          var dd = typeof d === 'function' ? d(p, i) : d;
          return [p[0] + ta / L * dd, p[1] - tr / L * dd];
        });
      }
      function dbl(m) { var c = m.clone(); c.side = THREE.DoubleSide; return c; }
      /* point du plan de coupe (r, a) dans un groupe tourné : (0, a, -r) devient (0, r, a) */
      function onCut(r, a) { return [0, a, -r]; }

      /* ---------- Matériaux (teintes approchées, voir l'en-tête) ---------- */
      function std(c, met, rough, extra) { return new THREE.MeshStandardMaterial(Object.assign({ color: c, metalness: met, roughness: rough }, extra || {})); }
      var rimMat = std(0x0f1012, 0.05, 0.5, { envMapIntensity: 0.45 });
      var cutCarbon = std(0x3a3c41, 0.15, 0.82, { side: THREE.DoubleSide });
      var cavMat = std(0x18191c, 0.1, 0.75);
      var holeMat = new THREE.MeshBasicMaterial({ color: 0x030303, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
      var tapeMat = std(0x2f58d8, 0.05, 0.42, { emissive: 0x0a1a60, emissiveIntensity: 0.5 });
      var tapeCut = dbl(tapeMat);
      var tyreMat = std(0x161618, 0, 0.8);
      var tyreCut = std(0x2c2c2f, 0, 0.92, { side: THREE.DoubleSide });
      var treadMat = std(0x111113, 0, 0.84);
      var treadCut = std(0x232325, 0, 0.94, { side: THREE.DoubleSide });
      var beadMat = std(0xb8902c, 0.1, 0.6, { side: THREE.DoubleSide });
      var sealMat = new THREE.MeshPhysicalMaterial({ color: 0xeef2ea, roughness: 0.18, metalness: 0, transparent: true, opacity: 0.62, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false });
      var spokeMat = std(0x121315, 0.7, 0.35);
      var rubberV = std(0x0b0b0c, 0, 0.75);
      var stemMat = M.alu, nutMat = M.aluDark, coreMat = M.brass;
      var dimMat = new THREE.MeshBasicMaterial({ color: 0x8f7cf0 });
      var tireMats = [tyreMat, tyreCut, treadMat, treadCut, beadMat];

      /* ---------- Cotes publiées et valeurs de dessin ---------- */
      var SIEGE = 622 / 2;                         // siège du talon : le « 622 » de 622x27TSS
      var HAUTEUR = 30, DEMI_INT = 27 / 2, DEMI_EXT = 33 / 2, DEMI_PNEU = 45 / 2;
      var BORD = 4.5;                              // bords au-dessus du siège : valeur de dessin de la scène
      var HAUT = SIEGE + BORD, BAS = HAUT - HAUTEUR; // 315,5 et 285,5
      var R_BORD = (DEMI_EXT - DEMI_INT) / 2;      // haut des bords arrondi sur toute leur épaisseur (3 mm)
      var C_BORD = [HAUT - R_BORD, (DEMI_INT + DEMI_EXT) / 2];
      var CREUX = SIEGE - 4.5;                     // fond du creux central, comme dans la scène
      var RUBAN = 0.3;                             // épaisseur du ruban, exagérée pour se voir
      var VH = 3.3;                                // rayon du trou de valve (approché)

      /* ---------- Jante : demi-profils (a >= 0), du milieu du dessous au milieu du creux central ---------- */
      function arc(c, r, t0, t1, n) { var p = []; for (var i = 0; i <= n; i++) { var t = t0 + (t1 - t0) * i / n; p.push([c[0] + r * Math.sin(t), c[1] + r * Math.cos(t)]); } return p; }
      var fondU = spline([[BAS, 0], [BAS + 0.4, 3.5], [BAS + 1.7, 7], [BAS + 4.1, 10.4], [BAS + 7.7, 13.2], [BAS + 12.3, 15.2], [BAS + 17, 16.2], [BAS + 20.5, DEMI_EXT]], 24);
      var lit = [[SIEGE, DEMI_INT], [SIEGE, DEMI_INT - 3], [SIEGE + 0.5, DEMI_INT - 3.5], [SIEGE + 0.6, DEMI_INT - 4], [SIEGE + 0.2, DEMI_INT - 4.5],
        [SIEGE - 1.2, DEMI_INT - 5.5], [SIEGE - 3.2, DEMI_INT - 7.5], [CREUX + 0.2, 4.6], [CREUX, 4], [CREUX, 0]];
      var RO = fondU.concat([[C_BORD[0], DEMI_EXT]], arc(C_BORD, R_BORD, 0, Math.PI, 12).slice(1), lit);
      var RC = spline([[BAS + 2.5, 0], [BAS + 2.9, 3.2], [BAS + 4.1, 6.3], [BAS + 6.3, 9.3], [BAS + 9.5, 11.8], [BAS + 13.5, 13.6], [BAS + 17.5, 14.4], [BAS + 20.5, 14.5]], 22)
        .concat([[SIEGE - 2, 14.5], [SIEGE - 2, 11.2], [SIEGE - 2.1, 10], [SIEGE - 3.1, 8.6], [SIEGE - 4.9, 6.7], [CREUX - 1.6, 5.2], [CREUX - 2, 4.2], [CREUX - 2, 0]]);
      var rimOuter = RO.concat(mir(RO.slice(1, -1)).reverse());
      var rimCav = RC.concat(mir(RC.slice(1, -1)).reverse());
      var rim = new THREE.Group(); root.add(rim);
      var rimBody = H.mesh(loopLathe(rimOuter, true), rimMat, rim);
      H.mesh(loopLathe(rimCav, false), cavMat, rim);
      /* faces de coupe en carbone ; trou de valve dans la face x = 0 */
      var rp = clipHalf(RO, VH).concat(clipHalf(RC, VH).reverse());
      H.mesh(H.latheCaps(rp, PH0, PHL)[0], cutCarbon, rim);
      H.mesh(H.latheCaps(mir(rp), PH0, PHL)[0], cutCarbon, rim);
      H.mesh(H.latheCaps(rimOuter, PH0, PHL, [rimCav])[1], cutCarbon, rim);
      /* trous de rayons du fond de jante, sous le ruban, un par rayon (place et taille approchées) */
      var ANGLES_RAYONS = [7.5, 22.5, 37.5, 52.5];  // degrés depuis la valve, comme dans la scène
      ANGLES_RAYONS.forEach(function (d) {
        var ph = PH0 + d * DEG, R = new THREE.Vector3(Math.sin(ph), 0, Math.cos(ph));
        var h = H.mesh(new THREE.CircleGeometry(2.2, 24), holeMat, rim);
        h.position.copy(R).multiplyScalar(CREUX + 0.02); h.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), R);
      });

      /* ---------- Ruban tubeless : du creux central jusqu'aux bords (largeur de dessin) ---------- */
      var tapeHalf = lit.slice().reverse();        // du milieu du creux central vers le bord
      var tapeFull = full(tapeHalf);
      var tLo = offset(tapeFull, 0.02), tHi = offset(tapeFull, RUBAN);
      var tapeLoop = tLo.concat(tHi.slice().reverse());
      var tape = new THREE.Group(); root.add(tape);
      var tapeBody = H.mesh(loopLathe(tapeLoop, true), tapeMat, tape);
      var tH = offset(tapeHalf, 0.02), tH2 = offset(tapeHalf, RUBAN);
      var tc = tH.filter(function (p) { return p[1] >= VH; }).concat(tH2.filter(function (p) { return p[1] >= VH; }).reverse());
      H.mesh(H.latheCaps(tc, PH0, PHL)[0], tapeCut, tape); H.mesh(H.latheCaps(mir(tc), PH0, PHL)[0], tapeCut, tape);
      H.mesh(H.latheCaps(tapeLoop, PH0, PHL)[1], tapeCut, tape);

      /* ---------- Pneu : carcasse, talons et tringles, bande de roulement, crampons ---------- */
      var tire = new THREE.Group(); root.add(tire);
      var S0 = SIEGE + RUBAN + 0.02;                // le talon s'assied sur le ruban
      var BO = [[S0, DEMI_INT - 3.1], [S0, DEMI_INT - 0.02]].concat(arc(C_BORD, R_BORD + 0.02, Math.PI, Math.PI * 2 / 3, 4));
      var SO = spline([BO[BO.length - 1], [316.3, 15.85], [317.8, 17.6], [320.0, 19.4], [323.0, 21.0], [326.8, 22.15], [331.0, DEMI_PNEU],
        [335.2, 22.2], [339.4, 21.1], [343.2, 19.2], [346.6, 16.2], [349.2, 12.2], [350.6, 7.4], [351.0, 0]], 40);
      SO[SO.length - 1][1] = 0;
      var SI = SO.map(function (p, k) {
        var a = SO[Math.max(0, k - 1)], b = SO[Math.min(SO.length - 1, k + 1)], tr = b[0] - a[0], ta = b[1] - a[1], Ln = Math.hypot(tr, ta);
        var th = p[1] > 15 ? 1.25 : p[1] < 11 ? 1.7 : 1.7 - (p[1] - 11) / 4 * 0.45; // plus épais sous la bande de roulement
        return [p[0] + ta / Ln * th, p[1] - tr / Ln * th];
      });
      SI[SI.length - 1][1] = 0;
      var BI = [[315.8, 12.6], [314.6, 11.4], [313.1, 10.6], [S0 + 0.6, DEMI_INT - 3.2]];
      var casing = BO.concat(SO.slice(1), mir(SO).reverse().slice(1), mir(BO).reverse().slice(1), mir(BI).reverse(), mir(SI), SI.slice().reverse().slice(1), BI);
      var beadC = [312.95, 12.1], beadR = 0.95;
      var beadHole = H.circlePts(beadR, 16, beadC[0], beadC[1]).map(function (v) { return [v.x, v.y]; });
      var tyreBody = H.mesh(loopLathe(casing, true), tyreMat, tire);
      caps(casing, [beadHole, mir(beadHole)], tyreCut, tire);
      [1, -1].forEach(function (sd) {
        var loop = beadHole.map(function (p) { return [p[0], p[1] * sd]; });
        H.mesh(loopLathe(loop, true, 60), beadMat, tire); caps(loop, [], beadMat, tire);
      });
      /* bande de roulement sur le sommet, jusqu'aux épaules */
      var kMax = 0; SO.forEach(function (p, k) { if (p[1] > SO[kMax][1]) kMax = k; });
      function upper(arr, amax) { return arr.slice(kMax).filter(function (p) { return p[1] <= amax; }).reverse(); }
      var TMAX = 22.2;
      var TI = full(upper(SO, TMAX));
      var TO = offset(TI, function (p) { var u = Math.min(1, Math.abs(p[1]) / TMAX); return 0.5 + 1.9 * (1 - u * u); });
      var treadLoop = TO.concat(TI.slice().reverse());
      H.mesh(loopLathe(treadLoop, true), treadMat, tire);
      caps(treadLoop, [], treadCut, tire);
      /* crampons, comme dans la scène : par motif, quatre rangées de petits crampons au centre, puis une paire sur
         chaque épaule, les deux épaules décalées d'un demi-motif ; s : place le long de la section depuis le sommet */
      var MOTIFS = 84, CENTRE = { L: 3.6, W: 4, h: 2.6, rangees: [[-8, 0, 8], [-4, 4], [-8, 0, 8], [-4, 4]] };
      var EPAULE = [{ s: 15, t: 0, L: 4.5, W: 8.5, h: 3.4, ang: 0.5 }, { s: 20, t: 0.42, L: 10, W: 6.5, h: 3.4, ang: 0 }];
      var iC = 0; TO.forEach(function (p, k) { if (Math.abs(p[1]) < Math.abs(TO[iC][1])) iC = k; });
      function surf(s) { /* point et normale (vers l'extérieur) de la bande de roulement, à s mm du sommet */
        var dir = s < 0 ? -1 : 1, rest = Math.abs(s), k = iC;
        while (k + dir >= 0 && k + dir < TO.length) {
          var p = TO[k], q = TO[k + dir], L = Math.hypot(q[0] - p[0], q[1] - p[1]);
          if (L >= rest) {
            var t = rest / L, dr = (q[0] - p[0]) * dir, da = (q[1] - p[1]) * dir, Ln = Math.hypot(dr, da);
            return { r: p[0] + t * (q[0] - p[0]), a: p[1] + t * (q[1] - p[1]), nr: da / Ln, na: -dr / Ln };
          }
          rest -= L; k += dir;
        }
        return null;
      }
      var knobG = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
      (function () { var pos = knobG.attributes.position; for (var i = 0; i < pos.count; i++) if (pos.getY(i) > 0.5) pos.setXYZ(i, pos.getX(i) * 0.75, pos.getY(i), pos.getZ(i) * 0.75); knobG.computeVertexNormals(); })();
      var poses = [], pas = 360 / MOTIFS;
      for (var m = 0; m * pas <= 60 + pas; m++) {
        var a0 = m * pas;
        CENTRE.rangees.forEach(function (rang, k) {
          rang.forEach(function (s) { poses.push({ d: a0 + k * pas / CENTRE.rangees.length, s: s, L: CENTRE.L, W: CENTRE.W, h: CENTRE.h, ang: 0 }); });
        });
        [[1, 0], [-1, 0.5]].forEach(function (cd) {
          EPAULE.forEach(function (e) { poses.push({ d: a0 + (e.t + cd[1]) * pas, s: cd[0] * e.s, L: e.L, W: e.W, h: e.h, ang: cd[0] * e.ang }); });
        });
      }
      var knobs = [];
      poses.forEach(function (o) {
        var sf = surf(o.s); if (!sf) return;
        var ph = PH0 + o.d * DEG, half = (Math.abs(o.L * Math.cos(o.ang)) + Math.abs(o.W * Math.sin(o.ang))) / 2 / sf.r;
        if (ph - half < PH0 + 0.002 || ph + half > PH0 + PHL - 0.002) return; // le pneu est coupé : aucun crampon ne dépasse
        knobs.push({ ph: ph, sf: sf, o: o });
      });
      var knobMesh = new THREE.InstancedMesh(knobG, treadMat, knobs.length), m4 = new THREE.Matrix4(), sc = new THREE.Matrix4();
      knobs.forEach(function (k, i) {
        var sp = Math.sin(k.ph), cp = Math.cos(k.ph);
        var R = new THREE.Vector3(sp, 0, cp), T = new THREE.Vector3(cp, 0, -sp), A = new THREE.Vector3(0, 1, 0);
        var N = R.clone().multiplyScalar(k.sf.nr).add(A.clone().multiplyScalar(k.sf.na)).normalize();
        var Tg = T.clone(), Bn = new THREE.Vector3().crossVectors(Tg, N);
        if (k.o.ang) { Tg.multiplyScalar(Math.cos(k.o.ang)).addScaledVector(Bn, Math.sin(k.o.ang)).normalize(); Bn.crossVectors(Tg, N); }
        var P = R.clone().multiplyScalar(k.sf.r).add(A.clone().multiplyScalar(k.sf.a)).addScaledVector(N, -0.5);
        m4.makeBasis(Tg, N, Bn).multiply(sc.makeScale(k.o.L, k.o.h + 0.5, k.o.W)).setPosition(P);
        knobMesh.setMatrixAt(i, m4);
      });
      tire.add(knobMesh);
      /* liquide réparti sous la bande de roulement */
      var sealHalf = upper(SI, 11.5);
      var SLo = offset(full(sealHalf), -0.14);
      var SLi = offset(SLo, function (p) { var u = Math.min(1, Math.abs(p[1]) / 11.2); return -(0.2 + 1.0 * (1 - Math.pow(u, 4))); });
      var sealLoop = SLi.concat(SLo.slice().reverse());
      var seal = H.mesh(loopLathe(sealLoop, true), sealMat, tire); seal.renderOrder = 2;
      caps(sealLoop, [], sealMat, tire);
      var sealPin = (function () { var k = 0; SLo.forEach(function (p, i) { if (Math.abs(p[1] - 8) < Math.abs(SLo[k][1] - 8)) k = i; }); return [(SLo[k][0] + SLi[k][0]) / 2, SLo[k][1]]; })();

      /* les pièces du profil sont tournées autour de y : on bascule l'axe de roue vers z */
      [rim, tape, tire].forEach(function (g) { g.rotation.x = Math.PI / 2; });

      /* ---------- Rayons plats et écrous de rayon, comme dans la scène (roue avant) ---------- */
      var spokes = new THREE.Group(); root.add(spokes);
      var FLASQUES = [-22, 32], DECALAGE = 720 * 2 / 24, R_FIN = 235, NIP_TOP = BAS + 2.5 + 1.2;
      ANGLES_RAYONS.forEach(function (d, k) {
        var i = 6 + k, deg = 90 + d, sens = Math.floor(i / 2) % 2 ? 1 : -1, ah = (deg + sens * DECALAGE) * DEG;
        var A = new THREE.Vector3(22.5 * Math.cos(ah), 22.5 * Math.sin(ah), FLASQUES[i % 2]);
        var B = new THREE.Vector3((BAS + 1) * Math.cos(deg * DEG), (BAS + 1) * Math.sin(deg * DEG), 0);
        var D = B.clone().sub(A).normalize();
        var Z = new THREE.Vector3(0, 0, 1).addScaledVector(D, -D.z).normalize(), X = new THREE.Vector3().crossVectors(D, Z);
        /* écrou : tête dans le caisson, posée sur le fond, corps qui sort sous la jante */
        var top = B.clone().addScaledVector(D, (NIP_TOP - (BAS + 1)) / Math.abs(D.dot(B.clone().normalize())));
        var nip = H.mesh(H.lathe([[0, -12], [1.3, -12], [1.6, -11.5], [1.75, -2], [2.0, -1.2], [2.0, 0], [0, 0]], 16), spokeMat, spokes);
        nip.position.copy(top); nip.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), D);
        var start = top.clone().addScaledVector(D, -10), rs = Math.hypot(start.x, start.y);
        var len = (rs - R_FIN) / Math.abs(D.dot(start.clone().setZ(0).normalize()));
        var g = new THREE.CylinderGeometry(1, 1, len, 8, 1); g.translate(0, -len / 2, 0);
        g.applyMatrix4(new THREE.Matrix4().makeBasis(X, D, Z).multiply(new THREE.Matrix4().makeScale(0.65, 1, 1.25)).setPosition(start));
        H.mesh(g, spokeMat, spokes);
      });

      /* ---------- Valve Presta tubeless, coupée en deux par la face de coupe (moitié x <= 0) ---------- */
      function half(prof, mat, parent, seg) {
        var g = new THREE.Group(); parent.add(g);
        H.mesh(loopLathe(prof, true, seg || 32, Math.PI, Math.PI), mat, g);
        H.latheCaps(prof, Math.PI, Math.PI).forEach(function (c) { H.mesh(c, mat.side === THREE.DoubleSide ? mat : dbl(mat), g); });
        return g;
      }
      var PIED = CREUX + RUBAN, BOUT = 262;          // pied sur le ruban ; bout de la tige : longueur de dessin
      var valve = new THREE.Group(); root.add(valve);
      half([[3.02, PIED - 2.2], [3.25, PIED - 2.2], [3.25, PIED], [3.9, PIED], [5.2, PIED + 1.1], [5.6, PIED + 2.0], [5.3, PIED + 2.8], [3.02, PIED + 2.8]], rubberV, valve, 40);
      var stem = half([[2.0, BOUT], [2.9, BOUT], [3.0, BOUT + 0.4], [3.0, PIED + 3.7], [2.6, PIED + 4.2], [1.1, PIED + 4.2], [1.1, BOUT + 3.6], [2.0, BOUT + 3.0]], stemMat, valve, 32);
      for (var th = 0; th < 28; th++) {
        var tg = new THREE.TorusGeometry(3.0, 0.2, 5, 14, Math.PI); tg.rotateX(Math.PI / 2); tg.rotateY(-Math.PI / 2);
        H.mesh(tg, stemMat, valve, [0, BOUT + 1.5 + th * 0.75, 0]);
      }
      /* écrou moleté, contre le dessous de la jante */
      var nutSh = [], nk = 18, k3;
      for (k3 = 0; k3 <= nk; k3++) { var an = Math.PI / 2 + k3 / nk * Math.PI, rk = k3 % 2 ? 5.0 : 5.45; nutSh.push(H.pol(k3 === 0 || k3 === nk ? 5.2 : rk, an)); }
      for (k3 = 16; k3 >= 0; k3--) nutSh.push(H.pol(3.02, Math.PI / 2 + k3 / 16 * Math.PI));
      var nutG = H.extrude(H.shape(nutSh), 4.2, { bevel: 0.25, curve: 2 }); nutG.rotateX(-Math.PI / 2);
      var nut = H.mesh(nutG, nutMat, root, [0, BAS - 2.35 - 0.02, 0]);
      /* obus démontable, vissé dans le bout de la tige */
      var core = new THREE.Group(); root.add(core);
      half([[0, BOUT + 3.0], [1.95, BOUT + 3.0], [1.95, BOUT - 1.1], [2.35, BOUT - 1.4], [2.35, BOUT - 3.2], [0.95, BOUT - 3.7], [0.95, BOUT - 9.4],
        [1.6, BOUT - 9.6], [1.6, BOUT - 10.8], [0.95, BOUT - 11.0], [0.95, BOUT - 12.4], [0, BOUT - 12.6]], coreMat, core, 24);

      /* ---------- Cotes, en violet, devant la face de coupe ---------- */
      var dim = new THREE.Group(); root.add(dim);
      var XD = 0.8;
      function trait(axis, a0, a1, at) {   // trait de cote et ses deux flèches ; at : les deux autres coordonnées
        var L = a1 - a0, mid = (a0 + a1) / 2, pos = axis === 'y' ? [XD, mid, at] : [XD, at, mid];
        H.cyl(0.22, L - 3, axis, dimMat, dim, pos, 8);
        [a0, a1].forEach(function (e, j) {
          var s = j ? 1 : -1, p = axis === 'y' ? [XD, e - s * 0.8, at] : [XD, at, e - s * 0.8];
          var cone = H.cyl(0.8, 1.6, axis, dimMat, dim, p, 10, 0.01);
          if (axis === 'y') cone.scale.y = s; else cone.scale.z = s;
        });
      }
      function rep(axis, a0, a1, at) { var mid = (a0 + a1) / 2; H.cyl(0.12, a1 - a0, axis, dimMat, dim, axis === 'y' ? [XD, mid, at] : [XD, at, mid], 6); }
      var Y_INT = 320, Y_EXT = 276, Z_HAUT = -20.5;
      trait('z', -DEMI_INT, DEMI_INT, Y_INT); rep('y', C_BORD[0], Y_INT + 0.8, -DEMI_INT); rep('y', C_BORD[0], Y_INT + 0.8, DEMI_INT);
      trait('z', -DEMI_EXT, DEMI_EXT, Y_EXT); rep('y', Y_EXT - 0.8, BAS + 20.5, -DEMI_EXT); rep('y', Y_EXT - 0.8, BAS + 20.5, DEMI_EXT);
      trait('y', BAS, HAUT, Z_HAUT); rep('z', Z_HAUT - 0.8, -6, BAS); rep('z', Z_HAUT - 0.8, -C_BORD[1], HAUT);

      /* ---------- Bascule : pneu transparent ---------- */
      function setGhost(on) {
        tireMats.forEach(function (mt) { mt.transparent = on; mt.opacity = on ? 0.16 : 1; mt.depthWrite = !on; mt.needsUpdate = true; });
      }

      var pins = [
        { obj: rimBody, p: onCut(297, -13.9), text: 'Jante Canyon GR 30 CF en carbone, sans crochet (TSS, Tubeless Straight Side), désignée 622x27TSS : profil approché, Canyon ne publie que sa hauteur et ses largeurs' },
        { obj: dim, p: [XD, (BAS + HAUT) / 2, Z_HAUT], text: 'Hauteur de la jante : 30 mm' },
        { obj: dim, p: [XD, Y_INT, 6], text: 'Largeur intérieure : 27 mm' },
        { obj: dim, p: [XD, Y_EXT, -9], text: 'Largeur extérieure : 33 mm' },
        { obj: rimBody, p: onCut(C_BORD[0] + 0.6, C_BORD[1]), text: 'Bord de jante droit, sans crochet, et siège du talon : forme approchée' },
        { obj: tapeBody, p: onCut(309.1, -7.1), text: 'Ruban tubeless : il couvre tous les trous de rayons, sans aucun trou découvert, et se change au moins une fois par an ; sa largeur est à lire sur ton ruban' },
        { obj: stem, p: [0, 296, -3.0], text: 'Valve tubeless Presta à obus démontable, sans marque (à choisir, 3.1) : sa longueur pour ta jante de 30 mm est à lire sur la pièce' },
        { obj: nut, p: [0, 1.2, 5.35], text: 'Écrou de valve : serré à la main seulement, sans outil ; un couple éventuel est à lire sur la notice de ta valve' },
        { obj: core, p: [0, BOUT - 7, 0.95], text: 'Obus démontable : retire-le pour injecter le liquide par la valve, puis remets-le' },
        { obj: tyreBody, p: onCut(331, -21.9), text: 'Pneu Schwalbe G-One RX 45-622 TLR (Tubeless Ready) : version exacte à lire sur le flanc' },
        { obj: tyreBody, p: onCut(314.7, -12.6), text: 'Talon du pneu assis le long du bord de la jante : la ligne du pneu à égale distance du bord, des deux côtés' },
        { obj: seal, p: onCut(sealPin[0], sealPin[1]), text: 'Liquide Muc-Off Road & Gravel : 70 à 80 ml au minimum par pneu, et jusqu’à 20 ml de plus' },
        { obj: tyreBody, p: onCut(337, -5), text: 'Jamais plus de 3,0 bar dans le pneu, même pour talonner (manuel Canyon des roues, p.4 imprimée)' }
      ];

      return {
        group: root,
        parts: [{ obj: tire, off: [0, 30, 0] }, { obj: tape, off: [0, 7, 0] }, { obj: valve, off: [0, 13, 0] }, { obj: nut, off: [0, -12, 0] }, { obj: core, off: [0, -26, 0] }],
        pins: pins,
        controls: [{ type: 'toggle', label: 'Pneu transparent', value: false, onChange: setGhost }]
      };
    }
  });
})();
