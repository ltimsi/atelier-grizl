/* Atelier Grizl : tronçon de la chaîne Shimano CN-M8100 du Grizl CF 8 Di2 (4556, taille M), fermé par son attache
   rapide SM-CN910-12, et l'indicateur d'usure Park Tool CC-3.2 posé dessus, pour les ateliers 4.3 « Mesurer l'usure de
   la chaîne » et 4.4 « Remplacer la chaîne ».
   Ce que disent les documents cités par le chapitre, repris ici : la face marquée de la chaîne va dehors (DM-MACN001,
   « The side with the mark shown in the figure is the front (outer side) ») ; l'attache se pose entre deux maillons
   intérieurs, une goupille de chaque côté, la flèche de sa face dans le sens de rotation de la manivelle, vue de face
   (DM-MACN001) ; elle se ferme et s'ouvre en faisant glisser ses deux côtés ; une attache déposée ne se remonte jamais ;
   chaque bout coupé finit par un maillon intérieur. Park Tool, pour le CC-3.2 : le bout marqué « 0.5 », le crochet sur
   un maillon à plaques intérieures, contre le rouleau ; l'autre bout entre dans la chaîne quand elle s'est allongée de
   0,5 % (le seuil de Park pour son outil ; le critère de Shimano est sa jauge, 4.3).
   Bascule « Usure, 4.3 » ou « Attache, 4.4 » : le curseur « Pas à pas » suit les étapes 1 à 5 de 4.3, le geste du
   CC-3.2, ou les étapes 6 à 10 de 4.4, la coupe et l'attache. Son compteur reste court, « Étape n / N », n le numéro de
   l'étape dans le chapitre et N le nombre d'étapes de l'atelier ; le titre entier de l'étape s'écrit sur une ligne sous
   la barre des commandes, qui revient à la ligne, comme pour la mèche de 3.5. Bascule « Allongée de 0,5 % (exagérée
   8 fois) », en mode 4.3 seulement : la chaîne s'allonge, et l'autre bout du CC-3.2 entre entre deux rouleaux ; son
   libellé dit l'exagération du dessin. En mode 4.4, où le CC-3.2 n'est pas dessiné, la bascule est cachée et la chaîne
   revient neuve. Chaque atelier a sa vue ; chaque cran ne montre que la première pastille et celles de son étape
   (PASTILLES, numéros des pastilles dans l'ordre du fichier) : la liste sous la figure suit le cran.
   Vue éclatée : les deux moitiés de la chaîne s'écartent, les deux côtés de l'attache sortent de part et d'autre de la
   chaîne, le CC-3.2 se lève.
   Formes approchées (Shimano et Park Tool ne publient les cotes ni des maillons ni de l'indicateur) :
   - chaîne : pas de 12,7 mm, la valeur retenue par la scène de l'accueil (src/scene/geometrie.js), qui n'est pas relevée
     sur un document Shimano ; rouleaux, axes, plaques intérieures et extérieures en forme et en épaisseurs approchées ;
     plaques extérieures grises et plaques intérieures plus claires d'après la fiche Shimano de la chaîne (« Pin link
     plate Gray », « Roller link plate Chromizing ») ;
   - marquage : chaque plaque extérieure de la face marquée porte un repère dessiné, une simple gravure en forme
     approchée ; le vrai marquage, son texte et sa place sont à lire sur ta chaîne (Shimano le montre sur une figure) ;
   - attache : deux côtés identiques, chacun avec une goupille et un trou en serrure où glisse la goupille de l'autre ;
     forme, course et épaisseur approchées ;
   - flèche : dessinée sur le côté extérieur de l'attache, forme approchée ; le tronçon est pris sur le brin du haut, qui
     avance vers l'avant quand tu pédales : la flèche pointe donc vers l'avant (+x), une déduction de ce site d'après la
     phrase de Shimano, à vérifier sur la figure du DM-MACN001 ;
   - indicateur CC-3.2 : forme générique d'une plaque à crochet et à doigt, longueur, épaisseur et doigts approchés ;
     seul le marquage « 0.5 » vient de Park Tool, sa place est approchée ; l'autre côté de l'outil n'est pas dessiné ;
   - usure : l'allongement de 0,5 % est exagéré huit fois pour se voir, une valeur de dessin ;
   - coupe : à l'étape 6 de 4.4, les deux bouts sont écartés pour le dessin, et l'attache neuve attend à côté ;
   - couleurs : chaîne, attache et indicateur en teintes approchées ; repère et flèche gravés en gris foncé.
   Repère : la chaîne court selon x, l'avant du vélo vers +x ; y vers le haut ; z vers l'extérieur du vélo, côté de la
   face marquée. Unités : mm. */
(function () {
  'use strict';
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function sstep(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  var ETAPES_USURE = ['Prends le côté 0.5 de ton CC-3.2', 'Accroche le crochet sur un maillon à plaques intérieures', 'Essaie d’engager l’autre bout', 'Lis le résultat d’après Park Tool', 'Décide avec le critère Shimano'];
  var ETAPES_ATTACHE = ['Coupe au CT-3.3, un maillon intérieur à chaque bout', 'Passe la chaîne dans la chape, côté corps du dérailleur', 'Pose l’attache SM-CN910-12 neuve, flèche dans le sens de rotation', 'Ferme l’attache à la MLP-1.2', 'Contrôle que l’attache est engagée à fond'];
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  AtelierModels.register('chain', {
    camera: { yaw: 0.36, pitch: 0.42, dist: 104, target: [2, 1, 0], min: 40, max: 420 },
    explodeLabel: 'Vue éclatée',
    build: function (ctx) {
      var THREE = ctx.THREE, H = ctx.H, api = ctx.api, V2 = H.V2;
      var PAS = 12.7;
      var HALF = PAS / 2, RR = 3.875;                 // demi-pas ; rayon du rouleau, valeur de dessin
      var WEAR = 0.005 * 8;                           // 0,5 % d'allongement, exagéré huit fois
      var Z_IN0 = 0.95, Z_IN1 = 1.75, Z_OUT0 = 1.77, Z_OUT1 = 2.55; // faces des plaques, valeurs de dessin
      var root = new THREE.Group();

      /* ---------- Matériaux (teintes approchées, voir l'en-tête) ---------- */
      function S(c, met, rough, extra) { return new THREE.MeshStandardMaterial(Object.assign({ color: c, metalness: met, roughness: rough }, extra || {})); }
      var mOuter = S(0x8c9096, 1, 0.36);              // plaques extérieures grises
      var mInner = S(0xc8ccd1, 1, 0.24);              // plaques intérieures chromées, plus claires
      var mRoller = S(0xb4b9bf, 1, 0.34), mPin = S(0xdfe2e6, 1, 0.2);
      var mQuick = S(0x9da2a8, 1, 0.3);
      var mEngr = S(0x3c3e43, 0.6, 0.62);
      var mTool = S(0xc2c9d0, 0.9, 0.4);

      /* ---------- Contour en « 8 » : deux lobes reliés par des arcs concaves ---------- */
      function eight(R, w, segLobe, segArc) {
        var Rc = (HALF * HALF + w * w - R * R) / (2 * (R - w)), c = w + Rc;
        var phiT = Math.atan2(c, -HALF);
        var tx = HALF + R * Math.cos(phiT), ty = R * Math.sin(phiT);
        var aR = Math.atan2(ty - c, tx), aL = -Math.PI - aR;
        var top = [], i, a;
        for (i = 0; i <= segLobe; i++) { a = phiT * i / segLobe; top.push([HALF + R * Math.cos(a), R * Math.sin(a)]); }
        for (i = 1; i < segArc; i++) { a = aR + (aL - aR) * i / segArc; top.push([Rc * Math.cos(a), c + Rc * Math.sin(a)]); }
        for (i = 0; i <= segLobe; i++) { a = Math.PI - phiT + phiT * i / segLobe; top.push([-HALF + R * Math.cos(a), R * Math.sin(a)]); }
        var pts = top.slice();
        for (i = top.length - 2; i >= 1; i--) pts.push([top[i][0], -top[i][1]]);
        return pts.map(function (p) { return V2(p[0], p[1]); });
      }
      function circ(r, cx, seg) { var p = []; for (var i = 0; i < seg; i++) { var a = i / seg * Math.PI * 2; p.push(V2(cx + r * Math.cos(a), r * Math.sin(a))); } return p; }
      /* trou en serrure : grand trou vers le milieu de la plaque, fente étroite vers son bout, où la goupille s'arrête */
      function keyhole(cxEnd, dir, rBig, hs) {
        var kc = cxEnd - dir * 2.0, pts = [], i, a;
        var a0 = Math.asin(hs / rBig);
        for (i = 0; i <= 10; i++) { a = -Math.PI / 2 + Math.PI * i / 10; pts.push(V2(cxEnd + dir * hs * Math.cos(a), hs * Math.sin(a))); }
        for (i = 0; i <= 24; i++) { a = a0 + (Math.PI * 2 - 2 * a0) * i / 24; pts.push(V2(kc + dir * rBig * Math.cos(a), rBig * Math.sin(a))); }
        return pts;
      }
      var BEV = 0.11;
      function plateGeo(R, w, holes) {
        var sh = H.shape(eight(R - BEV, w - BEV, 14, 10));
        holes.forEach(function (h) { sh.holes.push(H.path(h)); });
        return H.extrude(sh, 0.8 - 2 * BEV, { bevel: BEV, bevelSize: BEV, bevelSegments: 2 });
      }
      var gInner = plateGeo(4.35, 3.12, [circ(1.95 + BEV, -HALF, 24), circ(1.95 + BEV, HALF, 24)]);
      var gOuter = plateGeo(4.22, 2.82, [circ(1.82 + BEV, -HALF, 24), circ(1.82 + BEV, HALF, 24)]);
      var gQuick = plateGeo(4.32, 3.28, [circ(1.82 + BEV, -HALF, 24), keyhole(HALF, 1, 1.98 + BEV, 1.42 + BEV)]);

      /* ---------- Rouleau et axes, tours autour de z ---------- */
      function latheZ(prof, seg) { var g = H.lathe(prof, seg || 40); g.rotateX(Math.PI / 2); return g; }
      var gRoller = latheZ([[1.86, -0.93], [3.55, -0.93], [3.8, -0.86], [3.875, -0.66], [3.875, 0.66], [3.8, 0.86], [3.55, 0.93], [1.86, 0.93], [1.86, -0.93]], 40);
      var hz = Z_OUT1;
      var gPin = latheZ([[0, -hz - 0.03], [0.55, -hz - 0.05], [1.25, -hz - 0.12], [1.8, -hz - 0.09], [1.96, -hz], [1.8, -hz + 0.1], [1.8, hz - 0.1], [1.96, hz], [1.8, hz + 0.09], [1.25, hz + 0.12], [0.55, hz + 0.05], [0, hz + 0.03]], 28);
      /* goupille de l'attache : rivée sur son côté (+z local), gorge et tête de l'autre côté */
      var gQPin = latheZ([[0, -hz - 0.42], [1.0, -hz - 0.44], [1.62, -hz - 0.36], [1.75, -hz - 0.2], [1.75, -hz - 0.04], [1.36, -hz + 0.02], [1.36, -Z_OUT0 + 0.02], [1.8, -Z_OUT0 + 0.08], [1.8, hz - 0.1], [1.96, hz], [1.8, hz + 0.09], [1.25, hz + 0.12], [0.55, hz + 0.05], [0, hz + 0.03]], 28);
      /* repère gravé de la face marquée : forme approchée, sans texte */
      var gMark = new THREE.ExtrudeGeometry(H.roundRect(3.4, 1.3, 0.62), { depth: 0.03, bevelEnabled: false });

      /* ---------- Assemblage : dix rouleaux, l'attache entre les rouleaux 3 et 4 ---------- */
      var NR = 10, rollers = [], segL = new THREE.Group(), segR = new THREE.Group();
      root.add(segL); root.add(segR);
      function segOf(k) { return k <= 3 ? segL : segR; }
      for (var k = 0; k < NR; k++) { rollers.push(H.mesh(gRoller, mRoller, segOf(k))); rollers[k].name = 'rouleau ' + k; }
      var links = [];
      function inner(a, b) {
        var g = new THREE.Group(); segOf(a).add(g);
        H.mesh(gInner, mInner, g, [0, 0, (Z_IN0 + Z_IN1) / 2]);
        H.mesh(gInner, mInner, g, [0, 0, -(Z_IN0 + Z_IN1) / 2]);
        links.push({ obj: g, a: a, b: b }); return g;
      }
      var marks = [];
      function outer(a, b) {
        var g = new THREE.Group(); segOf(a).add(g);
        H.mesh(gOuter, mOuter, g, [0, 0, (Z_OUT0 + Z_OUT1) / 2]);
        H.mesh(gOuter, mOuter, g, [0, 0, -(Z_OUT0 + Z_OUT1) / 2]);
        H.mesh(gPin, mPin, g, [-HALF, 0, 0]); H.mesh(gPin, mPin, g, [HALF, 0, 0]);
        marks.push(H.mesh(gMark, mEngr, g, [0, 0, Z_OUT1 - 0.005]));
        links.push({ obj: g, a: a, b: b }); return g;
      }
      /* maillons intérieurs (0-1, 2-3, 4-5, 6-7, 8-9) et extérieurs (1-2, 5-6, 7-8) ; l'attache relie 3 et 4 */
      inner(0, 1); var I1 = inner(2, 3); inner(4, 5); inner(6, 7); inner(8, 9);
      outer(1, 2); outer(5, 6); outer(7, 8);

      /* Attache : deux côtés identiques, le second tourné d'un demi-tour autour de y ; chacun dans son support de vue
         éclatée. Le côté A porte sa plaque dehors (+z), sa goupille au bout gauche et la flèche gravée. */
      function quickHalf(withArrow) {
        var g = new THREE.Group();
        H.mesh(gQuick, mQuick, g, [0, 0, (Z_OUT0 + Z_OUT1) / 2]);
        H.mesh(gQPin, mPin, g, [-HALF, 0, 0]);
        if (withArrow) {
          var s = new THREE.Shape();
          s.moveTo(-3.6, -0.5); s.lineTo(0.9, -0.5); s.lineTo(0.9, -1.45); s.lineTo(3.6, 0); s.lineTo(0.9, 1.45); s.lineTo(0.9, 0.5); s.lineTo(-3.6, 0.5); s.lineTo(-3.6, -0.5);
          var fleche = H.mesh(new THREE.ExtrudeGeometry(s, { depth: 0.04, bevelEnabled: false }), mEngr, g, [-0.4, 0, Z_OUT1 - 0.005]);
          g.userData.fleche = fleche;
        }
        return g;
      }
      var wA = new THREE.Group(), wB = new THREE.Group(); root.add(wA); root.add(wB);
      var qA = quickHalf(true), qB = quickHalf(false);
      qB.rotation.y = Math.PI;
      wA.add(qA); wB.add(qB);

      /* ---------- Indicateur d'usure, forme générique (voir l'en-tête) ---------- */
      var HF = 7, FW = 1.25, TB = 8;                  // longueur et demi-largeur des doigts, hauteur de la plaque
      var XHOOK = RR + 0.02 + FW;
      var LT = 7.5 * PAS * (1 + WEAR) + XHOOK;        // du crochet au doigt : il tombe entre deux rouleaux à l'usure
      function finger(pts, x0) {
        pts.push([x0 - FW - 0.3, HF], [x0 - FW + 0.2, 0.6], [x0 - FW + 0.75, 0], [x0 + FW - 0.75, 0], [x0 + FW - 0.2, 0.6], [x0 + FW + 0.3, HF]);
      }
      var tp = [], xa = -6.5, xb = LT + 6.5, yT = HF + TB, rc = 3.6, i, aa;
      tp.push([xa + rc, HF]);
      finger(tp, 0);
      finger(tp, LT);
      tp.push([xb - rc, HF]);
      for (i = 1; i <= 6; i++) { aa = -Math.PI / 2 + i / 6 * Math.PI / 2; tp.push([xb - rc + rc * Math.cos(aa), HF + rc + rc * Math.sin(aa)]); }
      tp.push([xb, yT - rc]);
      for (i = 1; i <= 6; i++) { aa = i / 6 * Math.PI / 2; tp.push([xb - rc + rc * Math.cos(aa), yT - rc + rc * Math.sin(aa)]); }
      tp.push([xa + rc, yT]);
      for (i = 1; i <= 6; i++) { aa = Math.PI / 2 + i / 6 * Math.PI / 2; tp.push([xa + rc + rc * Math.cos(aa), yT - rc + rc * Math.sin(aa)]); }
      tp.push([xa, HF + rc]);
      for (i = 1; i < 6; i++) { aa = Math.PI + i / 6 * Math.PI / 2; tp.push([xa + rc + rc * Math.cos(aa), HF + rc + rc * Math.sin(aa)]); }
      var toolSh = H.shape(tp.map(function (p) { return V2(p[0], p[1]); }));
      toolSh.holes.push(H.path(circ(2.0, LT / 2, 28).map(function (v) { return V2(v.x, v.y + HF + TB / 2); })));
      var toolHolder = new THREE.Group(), toolPivot = new THREE.Group(), toolInner = new THREE.Group();
      root.add(toolHolder); toolHolder.add(toolPivot); toolPivot.add(toolInner);
      toolInner.position.set(-XHOOK, -HF, 0);
      H.mesh(H.extrude(toolSh, 1.0, { bevel: 0.14, bevelSize: 0.14, bevelSegments: 1, curve: 8 }), mTool, toolInner);
      /* marquage « 0.5 » : le bout de l'outil à utiliser (place approchée) */
      var stamp = (function () {
        var c = document.createElement('canvas'); c.width = 256; c.height = 116;
        var g = c.getContext('2d'); g.fillStyle = 'rgba(25,28,34,0.9)'; g.font = '700 90px Arial, Helvetica, sans-serif';
        g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('0.5', c.width / 2, c.height / 2 + 2);
        var t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
        var m = new THREE.Mesh(new THREE.PlaneGeometry(11, 4.95), new THREE.MeshStandardMaterial({ map: t, transparent: true, metalness: 0.4, roughness: 0.6, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 }));
        m.position.set(LT - 12, HF + TB / 2, 0.66); toolInner.add(m);
        return m;
      })();

      /* ---------- Poses : rouleaux, attache, indicateur ---------- */
      var w = 0, wT = 0;                              // usure, de 0 (neuve) à 1 (allongée de 0,5 %)
      function pitch() { return PAS * (1 + WEAR * w); }
      function xr(k, p, g) { return k <= 3 ? -(p + g) / 2 - (3 - k) * p : (p + g) / 2 + (k - 4) * p; }
      /* angle de l'indicateur posé : le crochet contre le rouleau 1, le doigt sur un rouleau, ou dans la chaîne */
      function contact(p) {
        var x1 = xr(1, p, 0), th = 0, L = LT - XHOOK;
        for (var it = 0; it < 600; it++) {
          var c = Math.cos(th), s = Math.sin(th), hit = false;
          for (var q = 5; q < NR && !hit; q++) {
            var cx = xr(q, p, 0) - x1, cy = -RR;
            var lx = c * cx + s * cy, ly = -s * cx + c * cy;
            var qx = Math.max(L - 0.5, Math.min(lx, L + 0.5)), qy = Math.max(-HF, Math.min(ly, -HF + 0.6));
            if ((lx - qx) * (lx - qx) + (ly - qy) * (ly - qy) < RR * RR) hit = true;
            qx = Math.max(L - FW + 0.2, Math.min(lx, L + FW - 0.2)); qy = Math.max(-HF + 0.6, Math.min(ly, 0));
            if ((lx - qx) * (lx - qx) + (ly - qy) * (ly - qy) < RR * RR) hit = true;
          }
          if (!hit) break; th += 0.0005;
        }
        return th;
      }
      /* 4.3, étapes 1 à 5 : outil levé, crochet posé, autre bout qui descend, posé */
      var CLE_USURE = [{ lift: 16, th: 0.05, c: 0 }, { lift: 0, th: 0.16, c: 0 }, { lift: 0, th: 0.035, c: 1 }, { lift: 0, th: 0, c: 1 }, { lift: 0, th: 0, c: 1 }];
      /* 4.4, étapes 6 à 10 : bouts écartés et attache à côté, la même chose, attache posée ouverte, fermée, contrôlée */
      var CLE_ATTACHE = [{ g: 9, aside: 1, open: 1 }, { g: 9, aside: 1, open: 1 }, { g: -2, aside: 0, open: 1 }, { g: 0, aside: 0, open: 0 }, { g: 0, aside: 0, open: 0 }];
      var mode = 'attache';
      function pose(s) {
        var cles = mode === 'usure' ? CLE_USURE : CLE_ATTACHE, k = clamp(Math.floor(s), 1, cles.length), t = sstep(s - k);
        var a = cles[k - 1], b = cles[Math.min(cles.length, k + 1) - 1], st = {};
        Object.keys(a).forEach(function (n) { st[n] = lerp(a[n], b[n], t); });
        return st;
      }
      var thC = contact(pitch());
      function apply(st) {
        var p = pitch(), g = mode === 'usure' ? 0 : st.g;
        for (var q = 0; q < NR; q++) rollers[q].position.set(xr(q, p, g), 0, 0);
        links.forEach(function (l) { l.obj.position.set((xr(l.a, p, g) + xr(l.b, p, g)) / 2, 0, 0); });
        var aside = mode === 'usure' ? 0 : st.aside, open = mode === 'usure' ? 0 : st.open;
        qA.position.set(open * 1.0 - aside * 5, aside * 13, aside * 5);
        qB.position.set(-open * 1.0 + aside * 9, aside * 17, -aside * 5);
        toolHolder.visible = mode === 'usure';
        montrerPastilles();
        if (mode === 'usure') {
          toolPivot.position.set(xr(1, p, 0), RR + st.lift, 0);
          toolPivot.rotation.z = st.th + st.c * thC;
        }
      }

      /* ---------- Vues de chaque atelier : 4.3 l'indicateur entier, 4.4 l'attache de près ---------- */
      var VUES = { usure: { target: [14, 5, 0], dist: 170 }, attache: { target: [2, 1, 0], dist: 104 } };
      var vueT = null;

      /* Le compteur du curseur reste court (« Étape 8 / 12 ») ; le titre entier de l'étape s'écrit sur la ligne du geste
         de la visionneuse (api.geste), sous la barre des commandes, posée de nouveau à la première image (onFrame), après
         la liste numérotée. */
      function numero(v) { return mode === 'usure' ? v : v + 5; }
      var placee = false;
      function geste(v) {
        api.geste('Étape ' + numero(v) + ' de ' + (mode === 'usure' ? '4.3' : '4.4') + ' : ' + (mode === 'usure' ? ETAPES_USURE : ETAPES_ATTACHE)[v - 1]);
      }
      var s = 5, sT = 5;
      /* les pastilles de chaque cran, par leur numéro dans l'ordre du fichier : la première, puis celles de l'étape */
      var PASTILLES = { usure: [[1, 2], [1, 3], [1, 4], [1, 4], [1, 5]], attache: [[1, 10], [1, 10], [1, 6, 8], [1, 9], [1, 7]] };
      var pins = null, pret = false, clePins = '';
      function pinsDe(n) { return PASTILLES[mode][n - 1].map(function (i) { return pins[i - 1]; }); }
      function montrerPastilles() {
        var n = clamp(Math.round(s), 1, 5);
        if (mode + n !== clePins) { clePins = mode + n; if (pret) api.setPins(pinsDe(n)); }
      }
      apply(pose(s));

      /* ---------- Pastilles : la première est commune, puis celles de 4.3, puis celles de 4.4 ---------- */
      pins = [
        { obj: marks[1], p: [1.2, 0.2, 0.05], text: 'Chaîne Shimano CN-M8100, face marquée dehors, vers toi quand tu te tiens côté transmission' },
        { obj: stamp, p: [-7.5, 0, 0.05], text: 'Indicateur d’usure Park Tool CC-3.2, côté 0.5 : celui des chaînes de 11 et 12 vitesses' },
        { obj: toolInner, p: [0, 2.2, 0.66], text: 'Bout en crochet : sur un maillon à plaques intérieures, pour mesurer contre le rouleau, pas contre les plaques' },
        { obj: toolInner, p: [LT, 2.2, 0.66], text: 'Autre bout : s’il n’entre pas, ta chaîne n’a pas atteint 0,5 % d’usure ; s’il entre, elle s’est allongée de 0,5 % depuis qu’elle était neuve' },
        { obj: toolInner, p: [LT / 2 - 14, HF + TB, 0.66], text: 'S’il entre, Proposition : fais confirmer l’usure à une jauge Shimano par un mécanicien ; le critère du fabricant de ta chaîne prime' },
        { obj: qA, p: [-3.6, 3.9, Z_OUT1 + 0.05], text: 'Attache rapide SM-CN910-12 neuve : une chaîne neuve, une attache neuve ; jette toujours une attache déposée' },
        { obj: qA, p: [-HALF, 0, Z_OUT1 + 0.15], text: 'Goupilles de l’attache entre les deux maillons intérieurs, une de chaque côté : engagées à fond, des deux côtés' },
        { obj: qA.userData.fleche, p: [3.4, 0, 0.05], text: 'Flèche de l’attache dans le sens où tourne la manivelle quand tu pédales, vue de face' },
        { obj: qA, p: [HALF, -3.9, Z_OUT1 + 0.05], text: 'Fais glisser les deux côtés de l’attache pour la fermer ou l’ouvrir, à ta pince Park Tool MLP-1.2 ; Shimano demande sa TL-CN10' },
        { obj: I1, p: [-1.5, -3.1, Z_IN1 + 0.05], text: 'Bouts coupés au CT-3.3 : un maillon intérieur à chaque bout ; ne coupe jamais à l’endroit d’une attache' }
      ];
      pret = true;
      function usee(v) { wT = v ? 1 : 0; if (reduce) { w = wT; thC = contact(pitch()); apply(pose(s)); } api.dirty(); }
      /* la bascule de l'usure n'a de sens qu'avec le CC-3.2 : cachée en mode 4.4, la chaîne y revient neuve */
      function boutonUsure() {
        var vw = api.viewer, bs = vw ? vw.fig.querySelectorAll('.v3d-bar button') : [];
        for (var i = 0; i < bs.length; i++) if (bs[i].textContent === controles[2].label) return bs[i];
        return null;
      }
      function montrerBascule() {
        var b = boutonUsure(); if (!b) return;
        b.hidden = mode !== 'usure';
        if (b.hidden && wT) { b.setAttribute('aria-pressed', 'false'); usee(false); }
      }
      function setMode(v) {
        if (v === mode) return;
        mode = v; s = sT; montrerBascule();
        var vw = api.viewer; vueT = VUES[v];
        if (vw) {
          vw.cam0 = Object.assign({}, vw.cam0, { target: vw.cam0.target.slice(), dist: vueT.dist });
          var out = vw.fig.querySelector('.v3d-bar output'); if (out) out.textContent = controles[1].format(sT);
        }
        apply(pose(s)); api.dirty();
      }
      var controles = [
        { type: 'segmented', value: 'attache', options: [{ value: 'usure', label: 'Usure, 4.3' }, { value: 'attache', label: 'Attache, 4.4' }],
          onChange: setMode },
        { type: 'range', label: 'Pas à pas', min: 1, max: 5, step: 1, value: 5,
          format: function (v) { geste(v); return 'Étape ' + numero(v) + ' / ' + (mode === 'usure' ? 5 : 12); },
          onChange: function (v) { sT = v; if (reduce) { s = sT; apply(pose(s)); } api.dirty(); } },
        { type: 'toggle', label: 'Allongée de 0,5 % (exagérée 8 fois)', value: false, onChange: usee }
      ];

      return {
        group: root,
        parts: [{ obj: segL, off: [-7, 0, 0] }, { obj: segR, off: [7, 0, 0] }, { obj: wA, off: [0, 2.5, 12] }, { obj: wB, off: [0, -2.5, -12] }, { obj: toolHolder, off: [0, 15, 0] }],
        pins: pinsDe(sT),
        controls: controles,
        onFrame: function (dt) {
          var anim = false, vw = api.viewer;
          if (!placee) { placee = true; geste(sT); montrerBascule(); }
          if (w !== wT) {
            var dw = (dt || 0.016) / 0.7;
            w = wT > w ? Math.min(wT, w + dw) : Math.max(wT, w - dw);
            thC = contact(pitch()); anim = true;
          }
          if (s !== sT) {
            var sp = (dt || 0.016) / 1.0 * (1 + 0.6 * Math.max(0, Math.abs(sT - s) - 1));
            s = sT > s ? Math.min(sT, s + sp) : Math.max(sT, s - sp);
            anim = true;
          }
          if (anim) apply(pose(s));
          if (vueT && vw) {
            var t = vw.cam0.target, f = Math.min(1, (dt || 0.016) * 4), moving = false;
            for (var j = 0; j < 3; j++) { var d = vueT.target[j] - t[j]; if (Math.abs(d) > 0.05) { t[j] += d * f; moving = true; } else t[j] = vueT.target[j]; }
            var dd = vueT.dist - vw.dist; if (Math.abs(dd) > 0.3) { vw.dist += dd * f; moving = true; } else vw.dist = vueT.dist;
            if (!moving) vueT = null;
            anim = true;
          }
          return anim;
        }
      };
    }
  });
})();
