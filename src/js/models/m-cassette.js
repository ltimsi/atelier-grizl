/* Atelier Grizl : cassette Shimano CS-M8200-12 en 9-45 du Grizl CF 8 Di2 (4556, taille M) sur son corps de roue libre
   MICRO SPLINE, avec l'outil de contre-écrou Shimano TL-LR021 et un fouet, pour l'atelier 4.5 « Démonter et remonter la
   cassette ».
   Ce que disent les documents cités par le chapitre, repris ici : douze pignons, « 9-11-13-15-17-19-21-24-28-33-39-45T »,
   sur un corps « MICRO SPLINE » (fiche CS-M8200-12) ; le plus petit pignon, le 9 dents, fait corps avec le contre-écrou
   (« The smallest sprocket and the lock ring are combined into a single part », DM-MACS010) ; le TL-LR021 pour la 9-45,
   gardé perpendiculaire au 9 dents ; le fouet sur un pignon plus petit que celui du milieu ; les pignons enfilés du
   plus grand au plus petit, faces marquées dehors, la rainure large du corps en face de la partie large de la cassette ;
   repères des 9, 11 et 13 dents alignés ; trois entretoises, « Sprocket spacer (thin) » et deux « (thick) », de
   0,95 millimètre et de 1,95 millimètre (vue éclatée Shimano) ; contre-écrou serré à 30-50 Nm (Shimano), 40 Nm chez
   Canyon.
   Curseur « Pas à pas », de 1 à 12 : chaque cran montre l'étape de 4.5 qui porte ce numéro. Son compteur reste court,
   « Étape n / 12 » ; le titre entier de l'étape s'écrit sur une ligne sous la barre des commandes, qui revient à la
   ligne, comme pour la mèche de 3.5. Le fouet est là aux étapes FOUET, l'outil aux étapes OUTIL ; le 9 dents est déposé
   aux étapes SANS_9 (à l'étape 5, il sort de quelques millimètres) ; la cassette est sortie du corps aux étapes DEHORS ;
   les repères s'allument à l'étape 10. Au serrage (étape 11), le fouet n'est pas dessiné : le texte du DM ne le cite pas.
   Le sens de dépose n'est pas écrit dans le texte du DM ; le chapitre le lit sur sa figure (4.5, étape 5) : vu de face,
   l'outil tourne dans le sens inverse des aiguilles d'une montre. Le contre-écrou et l'outil sortent donc en tournant
   dans ce sens (rotation de dessin, d'un peu plus d'un sixième de tour), et le 9 dents revient en sens inverse à la
   pose.
   Vue éclatée : les pignons, les entretoises et l'araignée s'écartent le long de l'axe, le 9 dents et l'outil sortent,
   le fouet s'éloigne.
   Formes approchées (Shimano ne publie les cotes ni des pignons ni des outils) :
   - pignons : nombres de dents publiés ; rayon primitif déduit du pas de 12,7 mm, la valeur retenue par la scène de
     l'accueil (src/scene/geometrie.js), et écart de 3,9 mm entre deux pignons, la valeur approchée de la scène ;
     épaisseurs, profil des dents et fenêtres des grands pignons approchés ; le grand pignon en aluminium et les autres
     en acier, d'après la fiche Shimano, dessinés comme dans la scène, le grand foncé ;
   - araignée : celle de la fiche (« Aluminum spider arm ») ; elle porte les pignons de 28 dents et plus, comme dans la
     scène ; forme et taille approchées, rivets non dessinés ;
   - contre-écrou : d'une pièce avec le 9 dents ; bague, manchon fileté et prise de l'outil en forme approchée, la prise
     dessinée comme une couronne de cannelures intérieures pour l'exemple ;
   - repères : un petit triangle gravé sur les 9, 11 et 13 dents, alignés ; forme et place approchées ; les lettres
     gravées de chaque pignon ne sont pas dessinées ;
   - entretoises : une fine de 0,95 millimètre et deux épaisses de 1,95 millimètre ; leur diamètre est approché, et leur
     place dans la cassette est une place de dessin : la vraie est à lire sur la figure du DM et sur la pièce ;
   - corps de roue libre : cannelures en nombre et en forme approchés, une rainure large dessinée comme le dit le DM ;
   - moyeu : seul un bout du moyeu arrière est dessiné, en forme approchée ; ni le corps DT Swiss ni ses embouts ne sont
     dessinés d'après leurs cotes, et la roue est déposée ;
   - outil TL-LR021 : forme générique d'une douille à six-pans, percée pour un axe de 12 mm (fiche de la cassette) ; la
     taille de son six-pans et une prise pour une clé dynamométrique sont à lire sur l'outil ; la clé réglable qui le
     tourne n'est pas dessinée ;
   - fouet : forme générique d'un manche et d'une chaîne, dessinée sur le 15 dents ; ni le SR-12.2 de Park Tool ni le
     TL-SR24 de Shimano n'est dessiné d'après ses cotes ; son manche part vers le haut et vers la droite de la cassette
     vue de face, comme le fouet de la figure du DM-MACS010 (rubrique « 9-45T ») que lit le relevé du lot 4
     (docs/recherche/transmission-cf8-di2.md, section 5) ;
     sa place autour du pignon et la longueur du manche sont un choix de dessin ; le sens de dépose est celui de
     l'outil qui tourne (voir plus haut) ;
   - couleurs : pignons en acier argenté un peu chaud et grand pignon et araignée foncés, comme dans la scène ; corps,
     moyeu, entretoises, outil, fouet et repères en teintes approchées.
   Repère : axe de roue selon x, extérieur du vélo vers +x (le 9 dents, dehors, est dans le plan x = 0) ; y vers le
   haut. Unités : mm. */
(function () {
  'use strict';
  var TAU = Math.PI * 2;
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function sstep(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  var ETAPES = ['Dépose la roue arrière', 'Mets des gants et des lunettes de protection', 'Place le fouet sur un petit pignon', 'Engage le TL-LR021, bien perpendiculaire', 'Dévisse le contre-écrou peu à peu, gants et lunettes', 'Sors la cassette et repère les entretoises', 'Nettoie les pignons au détergent neutre', 'Enfile les pignons du plus grand au plus petit, sans le 9 dents', 'Pose le 9 dents, parties larges alignées', 'Aligne les repères des 9, 11 et 13 dents', 'Serre le contre-écrou à 30-50 Nm', 'Remonte la roue et passe les vitesses'];
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  AtelierModels.register('cassette', {
    camera: { yaw: 0.8, pitch: 0.26, dist: 370, target: [4, 12, 0], min: 120, max: 1100 },
    explodeLabel: 'Vue éclatée',
    build: function (ctx) {
      var THREE = ctx.THREE, H = ctx.H, M = ctx.M, api = ctx.api, V2 = H.V2;
      var DENTS = [9, 11, 13, 15, 17, 19, 21, 24, 28, 33, 39, 45];
      var PAS = 12.7, ECART = 3.9;
      var EP = 1.6;                                   // épaisseur des pignons, valeur de dessin de la scène
      /* Ce que montre chaque étape de 4.5 (numéros des étapes) */
      var FOUET = [3, 4, 5];
      var OUTIL = [4, 5, 11];
      var SANS_9 = [6, 7, 8];
      var DEHORS = [6, 7];
      var DEVISSE = 5, REPERES = 10;
      var PIGNON_FOUET = 15;
      /* Valeurs de dessin (approchées, voir l'en-tête) */
      var R_CORPS = 16.4, R_PIED = 15.5, N_CANN = 23, TH_LARGE = Math.PI / 2;
      var R_ALES = 12.5, BAGUE = { r: 15.5, ep: 2.2, cran: 11.6, pied: 10.8 };
      var ARAIGNEE = { dentsMin: 28, trou: 34, coque: [31, 35], voile: 4 };
      var FAR = [0, 1e5, 0];
      function xk(k) { return -k * ECART; }           // plan du pignon k, du 9 dents (k = 0) au 45 dents (k = 11)
      function Rp(n) { return PAS / (2 * Math.sin(Math.PI / n)); }
      var root = new THREE.Group();

      /* ---------- Matériaux (teintes approchées, voir l'en-tête) ---------- */
      function S(c, met, rough, extra) { return new THREE.MeshStandardMaterial(Object.assign({ color: c, metalness: met, roughness: rough }, extra || {})); }
      var mSteel = S(0xc9b9a0, 1, 0.3), mAlu = S(0x1c1d20, 0.6, 0.45), mSpacer = S(0x3a3c40, 0.7, 0.4);
      var mBody = M.alu, mHub = S(0x17181a, 0.35, 0.6, { side: THREE.DoubleSide }), mMark = S(0x2b2c30, 0.4, 0.6);
      var mTool = S(0x6b7077, 1, 0.34, { side: THREE.DoubleSide }), mWhip = S(0x2a2d33, 0.5, 0.5), mGrip = M.rubber, mChain = S(0x9a9ea4, 1, 0.32);

      /* ---------- Contours polaires [[angle, rayon], ...], angle compté de +y vers +z ---------- */
      function norm(a) { a %= TAU; return a < 0 ? a + TAU : a; }
      function polarSort(list) { list.forEach(function (p) { p[0] = norm(p[0]); }); list.sort(function (a, b) { return a[0] - b[0]; }); return list; }
      function v2(p) { return V2(p[1] * Math.cos(p[0]), p[1] * Math.sin(p[0])); }
      /* denture : un siège de rouleau par dent, une dent pointue entre deux ; une dent centrée sur l'angle 0 */
      function denture(n, inset) {
        var R = Rp(n), rs = 4.0, beta = 0.92, d = TAU / n, out = [], i, k;
        for (i = 0; i < n; i++) {
          var a = i * d - d / 2, cy = R * Math.cos(a), cz = R * Math.sin(a);
          for (k = 0; k <= 6; k++) {
            var t = a + Math.PI + beta - 2 * beta * k / 6;
            var py = cy + (rs + inset) * Math.cos(t), pz = cz + (rs + inset) * Math.sin(t);
            out.push([Math.atan2(pz, py), Math.hypot(py, pz)]);
          }
          var rT = R + 2.45 - inset, tw = 0.62 / rT;
          out.push([a + d / 2 - tw, rT], [a + d / 2 + tw, rT]);
        }
        return polarSort(out);
      }
      function cercle(r, seg) { var o = []; for (var i = 0; i < seg; i++) o.push([i / seg * TAU, r]); return o; }
      /* cannelures du corps : une arête à chaque pas, sauf à la rainure large ; dr écarte le contour (alésage des pignons) */
      function cannelures(dr) {
        var d = TAU / N_CANN, hw = d * 0.24, f = d * 0.07, o = [];
        for (var i = 0; i < N_CANN; i++) {
          var c = TH_LARGE + i * d;
          if (i === 0) { o.push([c, R_PIED + dr]); continue; }
          o.push([c - hw - f, R_PIED + dr], [c - hw, R_CORPS + dr], [c + hw, R_CORPS + dr], [c + hw + f, R_PIED + dr]);
        }
        return polarSort(o);
      }
      function crans(nC, rIn, rOut) {               // couronne de cannelures intérieures (prise de l'outil)
        var d = TAU / nC, hw = d * 0.22, o = [];
        for (var i = 0; i < nC; i++) { var c = i * d; o.push([c - hw - 0.03, rOut], [c - hw, rIn], [c + hw, rIn], [c + hw + 0.03, rOut]); }
        return polarSort(o);
      }
      function fenetres(n, nW, r0, r1) {
        var span = TAU / nW, half = span * 0.3, list = [];
        for (var i = 0; i < nW; i++) {
          var c = 0.2 + i * span, p = [], k;
          for (k = 0; k <= 6; k++) p.push([c - half + 2 * half * k / 6, r1]);
          for (k = 6; k >= 0; k--) p.push([c - half * 0.62 + 2 * half * 0.62 * k / 6, r0]);
          list.push(p);
        }
        return list;
      }
      var MX = new THREE.Matrix4().set(0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1);   // forme dans (y, z), épaisseur selon x
      var ML = new THREE.Matrix4().set(0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1);   // tour : axe y -> x
      function anneau(outer, holes, depth, bevel) {
        var sh = H.shape(outer.map(v2));
        holes.forEach(function (h) { sh.holes.push(H.path(h.map(v2))); });
        var b = bevel || 0, g = H.extrude(sh, depth - 2 * b, { bevel: b, bevelSize: b, bevelSegments: 1, curve: 4 });
        g.applyMatrix4(MX); return g;
      }
      function tourX(prof, seg) { var g = H.lathe(prof, seg || 64); g.applyMatrix4(ML); return g; }

      /* ---------- Corps de roue libre et bout du moyeu, fixes ---------- */
      var X_FOND = xk(11) - EP / 2 - 3, X_BOUT = xk(1) + EP / 2 + 0.4;
      var fixe = new THREE.Group(); root.add(fixe);
      var corps = H.mesh(anneau(cannelures(0), [cercle(R_ALES + 0.1, 48)], X_BOUT - X_FOND, 0.12), mBody, fixe, [(X_FOND + X_BOUT) / 2, 0, 0]);
      H.mesh(tourX([[R_ALES - 2.5, X_FOND - 6], [21.5, X_FOND - 6], [22.5, X_FOND - 4], [22.5, X_FOND], [R_ALES - 2.5, X_FOND]].reverse(), 64), mHub, fixe);
      H.mesh(tourX([[R_ALES - 2.5, X_FOND - 34], [17.5, X_FOND - 34], [18.5, X_FOND - 30], [18.5, X_FOND - 6], [R_ALES - 2.5, X_FOND - 6]].reverse(), 48), mHub, fixe);
      var P_LARGE = [X_BOUT + 0.05, (R_PIED + 0.2) * Math.cos(TH_LARGE), (R_PIED + 0.2) * Math.sin(TH_LARGE)];
      var aLarge = new THREE.Object3D(); corps.parent.add(aLarge);

      /* ---------- Pignons : chacun dans son support de vue éclatée (w) et de pose (g) ---------- */
      var ALESAGE = cannelures(0.25);
      var pignons = [];
      DENTS.forEach(function (n, k) {
        var w = new THREE.Group(), g = new THREE.Group(); root.add(w); w.add(g);
        var holes, porte = n >= ARAIGNEE.dentsMin;
        if (k === 0) holes = [cercle(R_ALES, 48)];
        else if (porte) holes = [cercle(ARAIGNEE.trou, 96)].concat(fenetres(n, n >= 36 ? 6 : 5, ARAIGNEE.trou + 6, Rp(n) - 9));
        else holes = [ALESAGE];
        var m = H.mesh(anneau(denture(n, 0.2), holes, EP, 0.18), n === 45 ? mAlu : mSteel, g, [xk(k), 0, 0]);
        pignons.push({ n: n, k: k, w: w, g: g, mesh: m, porte: porte });
      });
      function pignon(n) { return pignons[DENTS.indexOf(n)]; }
      /* araignée sous les grands pignons, avec eux */
      var portes = pignons.filter(function (p) { return p.porte; });
      var zHaut = xk(portes[0].k) + EP / 2, zBas = xk(portes[portes.length - 1].k) - EP / 2;
      var araignee = H.mesh(tourX([[R_CORPS + 0.25, zHaut - ARAIGNEE.voile], [ARAIGNEE.coque[0], zHaut - ARAIGNEE.voile], [ARAIGNEE.coque[0], zBas],
        [ARAIGNEE.coque[1], zBas], [ARAIGNEE.coque[1], zHaut], [R_CORPS + 0.25, zHaut], [R_CORPS + 0.25, zHaut - ARAIGNEE.voile]], 72), mAlu, portes[0].g);
      portes.slice(1).forEach(function (p) { root.remove(p.w); });   // les grands pignons suivent l'araignée
      portes.slice(1).forEach(function (p) { portes[0].g.add(p.mesh); });
      /* contre-écrou d'une pièce avec le 9 dents : bague à prise intérieure dehors, manchon fileté dans le corps */
      var neuf = pignon(9);
      var X_BAGUE = xk(0) + EP / 2 + BAGUE.ep / 2;
      var bague = H.mesh(anneau(cercle(BAGUE.r, 72), [crans(12, BAGUE.pied, BAGUE.cran)], BAGUE.ep, 0.2), mSteel, neuf.g, [X_BAGUE, 0, 0]);
      var fil = [[R_ALES - 1.4, xk(0) - EP / 2], [R_ALES - 0.1, xk(0) - EP / 2]], f;
      for (f = 0; f < 8; f++) fil.push([R_ALES - 0.1, xk(0) - EP / 2 - 0.6 - f * 0.7], [R_ALES - 0.5, xk(0) - EP / 2 - 0.95 - f * 0.7]);
      fil.push([R_ALES - 1.4, xk(0) - EP / 2 - 6.4], [R_ALES - 1.4, xk(0) - EP / 2]);
      H.mesh(tourX(fil, 48), mSteel, neuf.g);
      /* repères des 9, 11 et 13 dents : un triangle gravé, au même angle (0, en haut) */
      var gRep = new THREE.ExtrudeGeometry(new THREE.Shape([V2(0, -1.2), V2(2.4, 0), V2(0, 1.2)]), { depth: 0.06, bevelEnabled: false });
      gRep.applyMatrix4(MX);
      var reperes = [[9, 16.9], [11, 22.6], [13, 26.6]].map(function (q) {
        var p = pignon(q[0]), m = H.mesh(gRep, mMark, p.g, [xk(p.k) + EP / 2 - 0.02, q[1] - 1.2, 0]);
        return m;
      });
      /* entretoises : place de dessin (voir l'en-tête), chacune avec le pignon qui la suit vers l'intérieur */
      function entretoise(ep, nDehors) {
        var p = pignon(nDehors), x = xk(p.k) - EP / 2 - ep / 2 - 0.05;
        return H.mesh(anneau(cercle(21, 64), [ALESAGE], ep, 0.08), mSpacer, p.g, [x, 0, 0]);
      }
      var entretoises = [entretoise(1.95, 19), entretoise(1.95, 21), entretoise(0.95, 24)];

      /* ---------- Outil TL-LR021 : prise dans la bague, douille, six-pans, percé pour un axe de 12 mm ---------- */
      var wOutil = new THREE.Group(), outil = new THREE.Group(); root.add(wOutil); wOutil.add(outil);
      var X0 = X_BAGUE - BAGUE.ep / 2;
      H.mesh(anneau(crans(12, BAGUE.pied - 0.2, BAGUE.cran - 0.2), [cercle(6.2, 32)], BAGUE.ep, 0.1), mTool, outil, [X0 + BAGUE.ep / 2, 0, 0]);
      H.mesh(tourX([[6.2, X0 + BAGUE.ep], [14.5, X0 + BAGUE.ep], [15.2, X0 + BAGUE.ep + 0.8], [15.2, X0 + 12], [14.2, X0 + 12.8], [6.2, X0 + 12.8], [6.2, X0 + BAGUE.ep]].reverse(), 56), mTool, outil);
      var hexPts = []; for (var h = 0; h < 6; h++) hexPts.push([h / 6 * TAU + TAU / 12, 14.4]);
      var hex = H.mesh(anneau(hexPts, [cercle(6.2, 32)], 12, 0.5), mTool, outil, [X0 + 19.2, 0, 0]);
      var aOutil = new THREE.Object3D(); aOutil.position.set(X0 + 7, 15.3, 0); outil.add(aOutil);
      var aHex = new THREE.Object3D(); aHex.position.set(X0 + 19.2, 0, 14.4 * Math.cos(TAU / 12)); outil.add(aHex);
      var aGants = new THREE.Object3D(); aGants.position.set(X0 + 25.3, -8.5, -6); outil.add(aGants);

      /* ---------- Fouet : manche et chaîne sur le 15 dents (forme générique, voir l'en-tête) ---------- */
      var wFouet = new THREE.Group(), fouet = new THREE.Group(); root.add(wFouet); wFouet.add(fouet);
      var pf = pignon(PIGNON_FOUET), XF = xk(pf.k), RF = Rp(PIGNON_FOUET), dF = TAU / PIGNON_FOUET;
      var gRoul = H.orient(new THREE.CylinderGeometry(3.875, 3.875, 2.3, 16), 'x');
      var gPl = H.extrude(H.roundRect(PAS + 7.4, 8.2, 4.0), 0.8, {}); gPl.applyMatrix4(MX);
      function maillon(a, b, i) {
        var dy = b[0] - a[0], dz = b[1] - a[1], ang = Math.atan2(dz, dy);
        [1, -1].forEach(function (s) {
          var m = H.mesh(gPl, mChain, fouet, [XF + s * (i % 2 ? 2.0 : 1.55), (a[0] + b[0]) / 2, (a[1] + b[1]) / 2]);
          m.rotation.x = ang;
        });
      }
      var sieges = [], TH0 = -dF - dF / 2;
      for (var r = 0; r <= 6; r++) { var aa = TH0 + r * dF; sieges.push([RF * Math.cos(aa), RF * Math.sin(aa)]); }
      var queue = sieges[sieges.length - 1], tq = TH0 + 6 * dF + Math.PI / 2;
      for (r = 1; r <= 4; r++) sieges.push([queue[0] + r * PAS * Math.cos(tq), queue[1] + r * PAS * Math.sin(tq)]);
      sieges.forEach(function (p, i) { H.mesh(gRoul, mChain, fouet, [XF, p[0], p[1]]); if (i) maillon(sieges[i - 1], p, i); });
      var THM = TH0 - 0.25, dirM = [Math.cos(THM), Math.sin(THM)], baseM = [(RF + 7) * dirM[0], (RF + 7) * dirM[1]];
      H.mesh(gPl, mWhip, fouet, [XF + 2.6, (sieges[0][0] + baseM[0]) / 2, (sieges[0][1] + baseM[1]) / 2]).rotation.x = Math.atan2(baseM[1] - sieges[0][1], baseM[0] - sieges[0][0]);
      var manche = H.mesh(H.orient(new THREE.BoxGeometry(5, 150, 17), 'y'), mWhip, fouet, [XF + 3.4, baseM[0] + 75 * dirM[0], baseM[1] + 75 * dirM[1]]);
      manche.rotation.x = THM;
      var poignee = H.mesh(new THREE.CylinderGeometry(9, 9, 70, 24), mGrip, fouet, [XF + 3.4, baseM[0] + 118 * dirM[0], baseM[1] + 118 * dirM[1]]);
      poignee.rotation.x = THM;
      var aFouet = new THREE.Object3D(); aFouet.position.set(XF + 2.8, sieges[3][0] * 1.08, sieges[3][1] * 1.08); fouet.add(aFouet);

      /* ---------- Repères des pastilles ---------- */
      var a45 = new THREE.Object3D(); a45.position.set(xk(10) + EP / 2, (Rp(39) + 2.4) * Math.cos(0.45), (Rp(39) + 2.4) * Math.sin(0.45)); portes[0].g.add(a45);
      var aFaces = new THREE.Object3D(); aFaces.position.set(xk(11) + EP / 2, 0.92 * Rp(45) * Math.cos(Math.PI * 0.82), 0.92 * Rp(45) * Math.sin(Math.PI * 0.82)); portes[0].g.add(aFaces);
      var aNeuf = new THREE.Object3D(); aNeuf.position.set(xk(0) + EP / 2, 19.5 * Math.cos(2.45), 19.5 * Math.sin(2.45)); neuf.g.add(aNeuf);
      var P_ENTR = [entretoises[1].position.x, 0, 21], aEntr = new THREE.Object3D(); pignon(21).g.add(aEntr);

      /* ---------- Poses : la pose au cran n montre l'étape n ; entre deux crans, le passage ---------- */
      function dans(liste, n) { return liste.indexOf(n) >= 0 ? 1 : 0; }
      function cle(n) {
        return { fouet: dans(FOUET, n), outil: dans(OUTIL, n), neuf: dans(SANS_9, n), dev: n === DEVISSE ? 1 : 0,
          dehors: dans(DEHORS, n), rep: n === REPERES ? 1 : 0 };
      }
      function pose(s) {
        var k = clamp(Math.floor(s), 1, ETAPES.length), t = sstep(s - k), a = cle(k), b = cle(Math.min(ETAPES.length, k + 1)), st = {};
        Object.keys(a).forEach(function (q) { st[q] = lerp(a[q], b[q], t); });
        return st;
      }
      function apply(st) {
        var x9 = st.dev * 8 + st.neuf * 30, tour = Math.min(1, st.dev + st.neuf) * 1.2;   // vu de +x : sens inverse des aiguilles d'une montre
        neuf.g.position.set(x9, st.neuf * 96, 0); neuf.g.rotation.x = tour;
        outil.visible = st.outil > 0.01;
        if (outil.visible) { outil.position.set(x9 + (1 - st.outil) * 46, 0, 0); outil.rotation.x = tour; } else outil.position.set(FAR[0], FAR[1], FAR[2]);
        fouet.visible = st.fouet > 0.01;
        if (fouet.visible) fouet.position.set(0, (1 - st.fouet) * 70 * dirM[0], (1 - st.fouet) * 70 * dirM[1]); else fouet.position.set(FAR[0], FAR[1], FAR[2]);
        pignons.forEach(function (p) {
          if (p.k === 0) return;
          var off = p.porte ? 30 : 30 + (8 - p.k) * 2.6;
          p.g.position.set(st.dehors * off, 0, -st.dehors * 122);
        });
        reperes.forEach(function (m) { m.material = st.rep > 0.5 ? M.highlight : mMark; });
        /* corps et entretoises : cachés par la cassette montée, leur numéro ne se montre que cassette sortie ou éclatée */
        var dedans = st.dehors > 0.5 || (api.viewer && api.viewer.ex > 0.5);
        aLarge.position.fromArray(dedans ? P_LARGE : FAR); aEntr.position.fromArray(dedans ? P_ENTR : FAR);
      }
      var s = 4, sT = 4, lastEx = 0;
      apply(pose(s));

      /* Le compteur du curseur reste court (« Étape 4 / 12 ») ; le titre entier de l'étape s'écrit sur une ligne à lui,
         sous la barre des commandes, qui revient à la ligne (classe .v3d-geste de 00-head.html), posée à la première
         image (onFrame), après la liste numérotée. */
      var ligne = null, placee = false;
      function geste(v) {
        var stage = api.viewer && api.viewer.stage, barre = stage && stage.nextElementSibling;
        if (!ligne) {
          ligne = document.createElement('p'); ligne.className = 'v3d-geste'; ligne.setAttribute('aria-live', 'polite');
        }
        if (barre && barre !== ligne && barre.nextElementSibling !== ligne) barre.insertAdjacentElement('afterend', ligne);
        ligne.textContent = 'Étape ' + v + ' de 4.5 : ' + ETAPES[v - 1];
      }

      /* explosion le long de l'axe, par les supports : grands pignons et araignée vers l'intérieur, petits vers
         l'extérieur, 9 dents et outil plus loin, fouet écarté */
      var parts = [{ obj: portes[0].w, off: [-16, 0, 0] }];
      pignons.forEach(function (p) { if (!p.porte && p.k > 0) parts.push({ obj: p.w, off: [(8 - p.k) * 4, 0, 0] }); });
      parts.push({ obj: neuf.w, off: [40, 0, 0] }, { obj: wOutil, off: [64, 0, 0] }, { obj: wFouet, off: [0, 40 * dirM[0], 40 * dirM[1]] });

      return {
        group: root,
        parts: parts,
        pins: [
          { obj: a45, p: [0, 0, 0], text: 'Cassette Shimano CS-M8200-12 9-45 : douze pignons, « 9-11-13-15-17-19-21-24-28-33-39-45T »' },
          { obj: aLarge, p: [0, 0, 0], text: 'Corps de roue libre MICRO SPLINE : la rainure large du corps en face de la partie large de la cassette' },
          { obj: aNeuf, p: [0, 0, 0], text: 'Le 9 dents fait corps avec le contre-écrou : serre-le à 30-50 Nm (Shimano) ; Canyon dessine 40 Nm, une valeur dans la plage Shimano' },
          { obj: reperes[1], p: [0.06, 1.2, 0], text: 'Repères des 9, 11 et 13 dents alignés ; les lettres gravées sont dans l’encadré « Repères et entretoises »' },
          { obj: aFaces, p: [0, 0, 0], text: 'Pignons enfilés du plus grand au plus petit, faces marquées dehors, puis le 9 dents' },
          { obj: aEntr, p: [0, 0, 0], text: 'Entretoises : trois, une fine et deux épaisses, de 0,95 millimètre et de 1,95 millimètre ; leur place est à lire sur la figure du DM et sur la pièce' },
          { obj: aOutil, p: [0, 0, 0], text: 'Outil de contre-écrou Shimano TL-LR021 (prévu) : garde-le bien perpendiculaire au 9 dents' },
          { obj: aHex, p: [0, 0, 0], text: 'Six-pans du TL-LR021 : tourne-le avec une clé réglable ; sa taille et une prise pour ta TW-6.2 sont à lire sur l’outil' },
          { obj: aFouet, p: [0, 0, 0], text: 'Fouet Park Tool SR-12.2 (prévu), ou Shimano TL-SR24 : sur un pignon plus petit que celui du milieu ; plus près des rayons, il ne tient pas' },
          { obj: aGants, p: [0, 0, 0], text: 'Gants et lunettes de protection avant de forcer : le contre-écrou peut céder d’un coup ; force peu à peu' }
        ],
        controls: [{ type: 'range', label: 'Pas à pas', min: 1, max: 12, step: 1, value: 4,
          format: function (v) { geste(v); return 'Étape ' + v + ' / 12'; },
          onChange: function (v) { sT = v; if (reduce) { s = sT; apply(pose(s)); } api.dirty(); } }],
        onFrame: function (dt) {
          if (!placee) { placee = true; geste(sT); }
          var ex = api.viewer ? api.viewer.ex : 0;
          if ((ex > 0.5) !== (lastEx > 0.5)) { lastEx = ex; apply(pose(s)); }
          lastEx = ex;
          if (s === sT) return false;
          var sp = (dt || 0.016) / 1.1 * (1 + 0.6 * Math.max(0, Math.abs(sT - s) - 1));
          s = sT > s ? Math.min(sT, s + sp) : Math.max(sT, s - sp);
          apply(pose(s)); return true;
        }
      };
    }
  });
})();
