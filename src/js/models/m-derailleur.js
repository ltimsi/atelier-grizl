/* Atelier Grizl : dérailleur Shimano RD-M8250-GS (Deore XT Di2, sans fil) du Grizl CF 8 Di2 (4556, taille M) sur sa
   patte SRAM UDH, avec sa batterie BT-DN320, devant la cassette 9-45 et la chaîne, pour l'atelier 4.6 « Régler le
   dérailleur Di2 ».
   Ce que disent les documents cités par le chapitre, repris ici : la fiche du dérailleur (« Total capacity 36T »,
   « Low sprocket Max. 45T », « Top sprocket Max. 9T Min. 9T », galets « Teeth 13T », « UDH standard ✔ »,
   « Built-in battery ✔ ») ; les pièces que nomme le DM-MARD011 pour le RD-M8250 : bouton de fonction, voyant (« LED »),
   galet du haut (« Guide pulley ») et du bas (« Tension pulley »), support de batterie et son levier, vis B, vis de
   butée basse et haute, axe B, plaque de butée contre la butée de tension B. Cette liste ne nomme ni fil ni port
   E-TUBE, que Shimano ne nomme que pour d'autres dérailleurs : ce site en déduit que le tien n'en a pas ; son seul
   levier est celui du support de batterie. L'axe B se serre à 10-12 Nm (clé de 5 mm) ; la vis B et les butées se règlent à la clé de 2 mm ; la vis B
   sur le 45 dents, le contour de la plaque extérieure de la chape au niveau de la pointe de la plus haute dent ; le
   mode réglage sur le 24 dents (cinquième pignon en partant du plus grand, déduction du chapitre), voyant jaune fixe.
   Curseur « Pas à pas », de 1 à 13 : chaque cran montre l'étape de 4.6 qui porte ce numéro. Son compteur reste court,
   « Étape n / 13 » ; le titre entier de l'étape s'écrit sur une ligne sous la barre des commandes, qui revient à la
   ligne, comme pour la mèche de 3.5. CIBLE donne le pignon de chaque étape : avant le réglage, le 13 dents, celui où la
   photo officielle montre la chaîne (comme la scène de l'accueil) ; à l'étape 8, la chape va à 55 % (VERS_28) du
   chemin vers le 28 dents, jusqu'au léger bruit, et la chaîne reste sur le 24, qui reste allumé ; à l'étape 5, le
   dérailleur est dessiné sur le 9 dents, au bout du passage des vitesses. Le voyant est jaune fixe aux étapes JAUNE,
   éteint sinon. La pièce de l'étape s'allume : plaque de butée, axe B, vis B, bouton de fonction, vis de butée.
   Chaque étape ne montre que ses pastilles, six au plus (PASTILLES, numéros des pastilles dans l'ordre du fichier) :
   la liste sous la figure suit l'étape.
   Vue éclatée : le support de batterie sort vers l'arrière et la batterie en sort, l'axe B sort de la patte, la
   plaque extérieure de la chape et les galets s'écartent.
   Formes approchées (Shimano ne publie pas les cotes du dérailleur) :
   - corps : contour lu sur la photo officielle du vélo, repris de la scène de l'accueil (src/scene/pieces/transmission.js)
     et partagé en trois : le haut, autour de l'axe B, qui porte la batterie ; les deux biellettes ; le bas, qui porte le
     pivot de la chape ; épaisseurs et formes approchées ;
   - batterie : la BT-DN320 dans son support, sur le haut du corps, à l'arrière, comme dans la scène ; place, logement,
     levier et taille approchés, la photo officielle ne les montre pas ;
   - bouton de fonction et voyant : place et taille approchées, sur la face extérieure du haut du corps ;
   - axe B et patte : la patte SRAM UDH en forme approchée ; l'axe B à tête ronde de forme et de taille approchées,
     son six-pans creux dessiné à la clé de 5 mm, en creux sombre ; la plaque de butée et la butée de tension B en forme
     et en place approchées ;
   - vis B et vis de butée : têtes rondes de forme et de taille approchées, six-pans creux dessinés à la clé de 2 mm ;
     place approchée ; leurs marquages ne sont pas dessinés ;
   - chape et galets : galets de 13 dents (fiche) au pas de 12,7 mm de la scène, écart des galets et angle de la chape
     au 13 dents repris de la scène ; plaques, moyeux et vis approchés ; la plaque extérieure monte au-dessus du galet
     du haut pour montrer le réglage de la vis B ;
   - mouvement : un dessin, pas la mécanique du dérailleur ; les biellettes pivotent sur le haut du corps, le haut du
     corps tourne un peu autour de l'axe B, et la chape tourne pour garder le galet du haut sous le pignon ; au 45 dents,
     le haut de la plaque extérieure affleure la pointe des dents, comme le demande le DM pour la vis B ; aucun écart
     en millimètres n'est publié, celui du dessin aux autres pignons est approché ;
   - cassette : la 9-45 de la fiche, en fantôme, aux plans de la scène (petit pignon à 64 mm de l'axe, écart de 3,9 mm,
     approchés), le pignon de l'étape en violet ;
   - chaîne : rouleaux et plaques en forme approchée, coupée devant le dérailleur ; son plan va de celui du pignon vers
     la ligne de chaîne de 49,7 mm du pédalier (fiche FC-RX820-1) ;
   - couleurs : corps, biellettes et chape noirs comme dans la scène et sur la photo officielle ; support de batterie,
     levier, vis, patte, galets, voyant et chaîne en teintes approchées.
   Repère : celui de la scène de l'accueil, x vers l'avant, y vers le haut, z vers l'extérieur du vélo, origine sur
   l'axe de la roue arrière. Unités : mm. */
(function () {
  'use strict';
  var TAU = Math.PI * 2, DEG = Math.PI / 180;
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function sstep(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  var ETAPES = ['Dans E-TUBE PROJECT Cyclist : type GS et mode E-BIKE coupé, puis déconnecte', 'Contrôle la plaque de butée contre la butée de vis B', 'Serre l’axe B à 10-12 Nm', 'Passe sur le 45 dents et règle la vis B', 'Passe toutes les vitesses', 'Passe sur le 24 dents, le cinquième en partant du plus grand', 'Roue arrêtée, entre en mode réglage : voyant jaune fixe', 'Appuie sur X en tournant la manivelle, jusqu’au léger bruit sur le 28 dents', 'Appuie 5 fois sur Y', 'Reviens au mode normal : voyant éteint', 'Passe chaque vitesse : aucun bruit', 'Butée basse : sur le 45 dents, visse jusqu’au contact', 'Butée haute : sur le 9 dents, visse jusqu’au contact'];
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  AtelierModels.register('derailleur', {
    camera: { yaw: -0.3, pitch: 0.14, dist: 470, target: [12, -108, 40], min: 140, max: 1100 },
    explodeLabel: 'Vue éclatée',
    build: function (ctx) {
      var THREE = ctx.THREE, H = ctx.H, M = ctx.M, api = ctx.api, V2 = H.V2;
      var DENTS = [9, 11, 13, 15, 17, 19, 21, 24, 28, 33, 39, 45];
      var PAS = 12.7, ECART = 3.9, DENTS_GALET = 13;
      /* Ce que montre chaque étape de 4.6 : pignon visé, voyant jaune fixe */
      var CIBLE = [13, 13, 13, 45, 9, 24, 24, 28, 24, 24, 24, 45, 9];
      var JAUNE = [7, 8, 9];
      var VERS_28 = 0.55;                             // étape 8 : part du chemin du 24 vers le 28 dents
      var ALLUME = { 2: 'butee', 3: 'axe', 4: 'visB', 7: 'bouton', 10: 'bouton', 12: 'basse', 13: 'haute' };
      /* Valeurs de la scène de l'accueil (src/scene/geometrie.js et pieces/transmission.js), approchées */
      var Z9 = 64, LIGNE = 49.7, BB = [433.6, -75], DENTS_PLATEAU = 40;
      var PIED = [-9.5, -27.5], PIVOT13 = [34.4, -108.5], G13 = [14, -78.3], ECART_GALETS = 91, CAGE13 = -40 * DEG;
      /* Valeurs de dessin du mouvement (approchées, voir l'en-tête) */
      var B_LIEN = [-4, -46], BZ = 72.5, L_LIEN = 52, DIR_LIEN = [0.6, -0.8], PZ = 30, K_AXE_B = -0.22 * DEG;
      var R_PLAQUE = 30.5, JEU_13 = 26.5;
      function Rp(n) { return PAS / (2 * Math.sin(Math.PI / n)); }
      var RG = Rp(DENTS_GALET), R13 = Rp(13), R45 = Rp(45), TIP = 2.45;
      function rot(v, a) { return [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)]; }
      function add(a, b) { return [a[0] + b[0], a[1] + b[1]]; }
      function sub(a, b) { return [a[0] - b[0], a[1] - b[1]]; }
      var root = new THREE.Group();

      /* ---------- Matériaux (teintes approchées, voir l'en-tête) ---------- */
      function S(c, met, rough, extra) { return new THREE.MeshStandardMaterial(Object.assign({ color: c, metalness: met, roughness: rough }, extra || {})); }
      var mBody = S(0x1a1b1d, 0.32, 0.55), mCover = S(0x26282c, 0.3, 0.45), mHolder = S(0x34373c, 0.3, 0.5), mBatt = S(0x111214, 0.2, 0.6);
      var mPulley = S(0x161616, 0.4, 0.35), mBolt = S(0xc9cdd2, 1, 0.28), mHanger = S(0x2b2d32, 0.75, 0.4), mPlate = S(0x202226, 0.6, 0.4);
      var mChainO = S(0x8c9096, 1, 0.34), mChainI = S(0xc8ccd1, 1, 0.26), mRoll = S(0xa6abb1, 1, 0.34);
      var mLedOff = S(0x3a3d42, 0.2, 0.3), mLedJaune = S(0xffd21a, 0.1, 0.3, { emissive: 0xffc400, emissiveIntensity: 1.4 });
      var mButton = S(0x2f3136, 0.2, 0.5);

      /* ---------- Outils de profil : contours dans (x, y), épaisseur selon z ---------- */
      function circ(r, cx, cy, seg) { var o = []; seg = seg || 24; for (var i = 0; i < seg; i++) { var a = i / seg * TAU; o.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } return o; }
      function hull(pts) {
        var p = pts.slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
        function cr(o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }
        var lo = [], up = [], i;
        for (i = 0; i < p.length; i++) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p[i]) <= 0) lo.pop(); lo.push(p[i]); }
        for (i = p.length - 1; i >= 0; i--) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p[i]) <= 0) up.pop(); up.push(p[i]); }
        up.pop(); lo.pop(); return lo.concat(up);
      }
      function profil(pts, z0, z1, bevel, holes, parent, mat) {
        var b = bevel || 0, sh = H.shape(pts.map(function (p) { return V2(p[0], p[1]); }));
        (holes || []).forEach(function (h) { sh.holes.push(H.path(h.map(function (p) { return V2(p[0], p[1]); }))); });
        var g = H.extrude(sh, z1 - z0 - 2 * b, { bevel: b, bevelSize: b, bevelSegments: 2, curve: 12 });
        return H.mesh(g, mat, parent, [0, 0, (z0 + z1) / 2]);
      }
      function cylZ(r, z0, z1, mat, parent, x, y, seg) { return H.cyl(r, z1 - z0, 'z', mat, parent, [x || 0, y || 0, (z0 + z1) / 2], seg || 24); }
      /* vis à tête cylindrique et six-pans creux de la clé de 2 mm (rayon du cercle des sommets : 2 / √3), axe selon y
         local */
      function vis(rTete, hTete, rCorps, lCorps, parent, mat) {
        var g = new THREE.Group(); parent.add(g);
        H.cyl(rCorps, lCorps, 'y', mBolt, g, [0, -lCorps / 2, 0], 12);
        var t = H.cyl(rTete, hTete, 'y', mat || mBolt, g, [0, hTete / 2, 0], 20);
        H.mesh(new THREE.CylinderGeometry(2 / Math.sqrt(3), 2 / Math.sqrt(3), 0.6, 6), mCover, g, [0, hTete - 0.25, 0]);
        g.userData.tete = t; return g;
      }

      /* ---------- Cassette fantôme 9-45 et bout d'axe ---------- */
      function zk(k) { return Z9 - k * ECART; }
      var pignons = DENTS.map(function (n, k) {
        var sh = H.shape(H.gearPts(n, Rp(n) - 1.5, Rp(n) + TIP, { tip: 0.32, flank: 0.12 }));
        sh.holes.push(H.path(H.circlePts(n >= 28 ? 34 : 17.6, 48)));
        var m = H.mesh(H.extrude(sh, 1.6, { curve: 6 }), M.ghost, root, [0, 0, zk(k)]); m.name = 'pignon ' + n;
        return m;
      });
      cylZ(6, zk(11) - 8, 90, M.steelDark, root, 0, 0, 24);

      /* ---------- Patte SRAM UDH, butée de tension B ---------- */
      var wPatte = new THREE.Group(); root.add(wPatte);
      var patte = profil(hull([].concat(circ(15, 0, 0), circ(11, PIED[0], PIED[1]), circ(10, 4, -14, 16))), 66, 72, 0.6, [circ(6.2, 0, 0, 24), circ(4.3, PIED[0], PIED[1], 20)], wPatte, mHanger);
      var butee = H.box(6, 4, 5, mHanger, wPatte, [6, -21, 74]);

      /* ---------- Haut du corps : tourne autour de l'axe B ; repère local centré sur l'axe B ---------- */
      var bK = new THREE.Group(); bK.position.set(PIED[0], PIED[1], 0); root.add(bK);
      function L(p) { return [p[0] - PIED[0], p[1] - PIED[1]]; }
      var haut = hull([].concat(circ(13, 0, 0), circ(10, -40, -3), circ(9, -42, -28), circ(10, -12, -36), circ(9, L(B_LIEN)[0], L(B_LIEN)[1]), circ(8, 14, -14)));
      var corpsHaut = profil(haut, 74, 94, 1.6, [], bK, mBody);
      profil(hull([].concat(circ(8, -6, -14), circ(6, -26, -26), circ(7, 4, -26))), 93.6, 95.2, 0.5, [], bK, mCover);
      /* plaque de butée, contre la butée de tension B de la patte */
      var plaqueButee = H.box(7, 3, 6, mPlate, bK, [L([6, -21])[0], L([6, -21])[1] - 3.5, 74.2]);
      /* axe B : tête ronde et six-pans creux de la clé de 5 mm (rayon du cercle des sommets : 5 / √3), dans son support
         de vue éclatée */
      var wAxe = new THREE.Group(); bK.add(wAxe);
      var axeB = new THREE.Group(); wAxe.add(axeB);
      H.mesh(H.lathe([[0, 0], [6.4, 0], [6.8, 0.8], [6.8, 5.6], [6.2, 6.4], [0, 6.4]], 32), mBolt, axeB).rotation.x = Math.PI / 2;
      H.cyl(5 / Math.sqrt(3), 0.6, 'z', mCover, axeB, [0, 0, 6.15], 6);
      H.cyl(4.2, 30, 'z', mBolt, axeB, [0, 0, -15], 16);
      axeB.position.set(0, 0, 94.2);
      var axeTete = axeB.children[0];
      /* vis B, à l'arrière du haut, contre la butée ; vis de butée basse et haute, côte à côte sur le dessus */
      var visB = vis(2.6, 2.4, 1.5, 8, bK); visB.position.set(13, 9.5, 82); visB.rotation.z = -0.35;
      var visBasse = vis(2.5, 2.2, 1.4, 7, bK); visBasse.position.set(-17, 10, 86); visBasse.rotation.z = 0.2;
      var visHaute = vis(2.5, 2.2, 1.4, 7, bK); visHaute.position.set(-38, 6.5, 86); visHaute.rotation.z = 0.4;
      /* support de batterie et batterie BT-DN320, à l'arrière ; levier du support sur sa face extérieure */
      var wSupport = new THREE.Group(); bK.add(wSupport);
      var CB = L([-40, -45]);
      var support = H.mesh(H.extrude(H.roundRect(36, 30, 5, CB[0], CB[1]), 18, { bevel: 1.2, bevelSize: 1.2, curve: 6 }), mHolder, wSupport, [0, 0, 87]);
      var wBatt = new THREE.Group(); wSupport.add(wBatt);
      var batterie = H.mesh(H.extrude(H.roundRect(30, 24, 3, CB[0] - 4.5, CB[1]), 14, { bevel: 0.6, bevelSize: 0.6, curve: 6 }), mBatt, wBatt, [0, 0, 87]);
      var levier = H.mesh(H.extrude(H.roundRect(9, 5, 1.6, CB[0] + 8, CB[1] + 9), 2, { bevel: 0.4, bevelSize: 0.4 }), mCover, wSupport, [0, 0, 97.2]);
      /* bouton de fonction et voyant, sur la face extérieure */
      var bouton = cylZ(3.4, 94.4, 96.2, mButton, bK, -8, -40, 28);
      var voyant = H.mesh(new THREE.SphereGeometry(1.6, 20, 12, 0, TAU, 0, Math.PI / 2), mLedOff, bK, [12, -22, 94.6]);
      voyant.name = 'voyant';
      voyant.rotation.x = Math.PI / 2;

      /* ---------- Biellettes : deux plaques tendues entre le haut et le bas du corps, recalculées à chaque pose ---------- */
      var gLien = new THREE.BoxGeometry(1, 13, 4);
      var lienExt = H.mesh(gLien, mBody, root), lienInt = H.mesh(gLien, mBody, root);

      /* ---------- Bas du corps : suit le pivot de la chape, garde l'orientation du haut ---------- */
      var pK = new THREE.Group(); root.add(pK);
      var P_LIEN = sub(add(B_LIEN, [DIR_LIEN[0] * L_LIEN * 0.965, DIR_LIEN[1] * L_LIEN * 0.965]), PIVOT13);   // ancre des biellettes, depuis le pivot
      profil(hull([].concat(circ(14, 0, 0), circ(9, P_LIEN[0], P_LIEN[1]), circ(8, P_LIEN[0] + 6, P_LIEN[1] - 10))), 14, 32, 1.4, [], pK, mBody);
      cylZ(13.5, 7, 14.2, mBody, pK, 0, 0, 36);
      cylZ(8.5, 31.8, 33.4, mCover, pK, 0, 0, 32);

      /* ---------- Chape : repère local centré sur le pivot, tourné avec elle ---------- */
      var cage = new THREE.Group(); root.add(cage);
      var GL = sub(G13, PIVOT13), TL = add(GL, [ECART_GALETS * Math.sin(CAGE13), -ECART_GALETS * Math.cos(CAGE13)]);
      /* haut de la plaque extérieure : au-dessus du galet du haut, à R_PLAQUE de son centre, vers l'axe de roue quand la
         chaîne est sur le 45 dents (direction calculée plus bas, à la pose du 45 dents) */
      var wPlaqueExt = new THREE.Group(), wGalets = new THREE.Group(); cage.add(wPlaqueExt); cage.add(wGalets);
      var plaqueExt = null, plaqueInt;
      function plaques(dirHaut) {
        var tab = add(GL, [dirHaut[0] * (R_PLAQUE - 8), dirHaut[1] * (R_PLAQUE - 8)]);
        plaqueExt = profil(hull([].concat(circ(12, 0, 0), circ(10, GL[0], GL[1]), circ(8, tab[0], tab[1]), circ(15, TL[0], TL[1]))), 6, 7.8, 0.4, [circ(4, GL[0], GL[1], 16), circ(4, TL[0], TL[1], 16)], wPlaqueExt, mPlate);
        plaqueInt = profil(hull([].concat(circ(10, GL[0], GL[1]), circ(13, TL[0], TL[1]))), -7.8, -6, 0.4, [], cage, mPlate);
      }
      function galet(c) {
        var g = new THREE.Group(); wGalets.add(g); g.position.set(c[0], c[1], 0);
        H.mesh(H.extrude(H.shape(H.gearPts(DENTS_GALET, RG - 1.5, RG + 2.2, { tip: 0.36, flank: 0.12 })), 2.2, { curve: 6 }), mPulley, g);
        cylZ(RG - 3, -3.2, 3.2, mPulley, g, 0, 0, 36);
        cylZ(7, -5, 5, mPulley, g, 0, 0, 24);
        cylZ(3.5, 7.8, 9.2, mBolt, g, 0, 0, 6);
        return g;
      }
      var galetHaut = galet(GL), galetBas = galet(TL);

      /* ---------- Chaîne : rouleaux et plaques le long du chemin, coupée devant ---------- */
      var NMAX = 70;
      function huit(R0, w) {
        var half = PAS / 2, Rc = (half * half + w * w - R0 * R0) / (2 * (R0 - w)), c = w + Rc, phiT = Math.atan2(c, -half);
        var tx = half + R0 * Math.cos(phiT), ty = R0 * Math.sin(phiT), aR = Math.atan2(ty - c, tx), aL = -Math.PI - aR, top = [], i, a;
        for (i = 0; i <= 6; i++) { a = phiT * i / 6; top.push([half + R0 * Math.cos(a), R0 * Math.sin(a)]); }
        for (i = 1; i < 5; i++) { a = aR + (aL - aR) * i / 5; top.push([Rc * Math.cos(a), c + Rc * Math.sin(a)]); }
        for (i = 0; i <= 6; i++) { a = Math.PI - phiT + phiT * i / 6; top.push([-half + R0 * Math.cos(a), R0 * Math.sin(a)]); }
        var pts = top.slice(); for (i = top.length - 2; i >= 1; i--) pts.push([top[i][0], -top[i][1]]);
        return H.shape(pts.map(function (p) { return V2(p[0], p[1]); }));
      }
      var gPlO = new THREE.ExtrudeGeometry(huit(4.2, 2.9), { depth: 0.8, bevelEnabled: false, curveSegments: 4 }); gPlO.translate(0, 0, -0.4);
      var gPlI = new THREE.ExtrudeGeometry(huit(4.35, 3.15), { depth: 0.8, bevelEnabled: false, curveSegments: 4 }); gPlI.translate(0, 0, -0.4);
      var gRoll = H.orient(new THREE.CylinderGeometry(3.875, 3.875, 1.9, 12), 'z');
      var gAxe = H.orient(new THREE.CylinderGeometry(1.9, 1.9, 5.3, 8), 'z');
      var iO = new THREE.InstancedMesh(gPlO, mChainO, NMAX * 2), iI = new THREE.InstancedMesh(gPlI, mChainI, NMAX * 2);
      var iR = new THREE.InstancedMesh(gRoll, mRoll, NMAX + 1), iP = new THREE.InstancedMesh(gAxe, mChainO, NMAX + 1);
      [iO, iI, iR, iP].forEach(function (m) { m.frustumCulled = false; root.add(m); });
      /* tangente commune à deux cercles orientés (s = 1 : sens trigonométrique, -1 : sens horaire) */
      function tangente(c1, r1, s1, c2, r2, s2) {
        var dx = c2[0] - c1[0], dy = c2[1] - c1[1], D = Math.hypot(dx, dy), p1 = s1 * r1, p2 = s2 * r2;
        var k = (p1 - p2) / D, al = Math.acos(clamp(k, -1, 1)), ph = Math.atan2(dy, dx), best = null;
        [ph + al, ph - al].forEach(function (a) {
          var n = [Math.cos(a), Math.sin(a)], A = [c1[0] + p1 * n[0], c1[1] + p1 * n[1]], B = [c2[0] + p2 * n[0], c2[1] + p2 * n[1]];
          var o = p1 >= 0 ? n : [-n[0], -n[1]], v = [-o[1] * s1, o[0] * s1], d = (B[0] - A[0]) * v[0] + (B[1] - A[1]) * v[1];
          if (!best || d > best.d) best = { d: d, A: A, B: B };
        });
        return [best.A, best.B];
      }
      function arc(out, c, r, s, a, b, seg) {
        var t0 = Math.atan2(a[1] - c[1], a[0] - c[0]), t1 = Math.atan2(b[1] - c[1], b[0] - c[0]), sw = t1 - t0;
        if (s > 0) { while (sw < 0) sw += TAU; } else { while (sw > 0) sw -= TAU; }
        var n = Math.max(2, Math.ceil(Math.abs(sw) * r / 3));
        for (var i = 1; i <= n; i++) { var t = t0 + sw * i / n; out.push([c[0] + r * Math.cos(t), c[1] + r * Math.sin(t), seg]); }
      }
      var M4 = new THREE.Matrix4(), QZ = new THREE.Quaternion(), EZ = new THREE.Vector3(0, 0, 1), SC = new THREE.Vector3(1, 1, 1), PV = new THREE.Vector3();
      var XCOUPE = 150;
      function chaine(rc, zc, zChape, G, T) {
        var rr = Rp(DENTS_PLATEAU), O = [0, 0];
        var a1 = tangente(BB, rr, 1, O, rc, 1), a2 = tangente(O, rc, 1, G, RG, -1), a3 = tangente(G, RG, -1, T, RG, 1), a4 = tangente(T, RG, 1, BB, rr, 1);
        var pts = [];
        var u = (a1[0][0] - XCOUPE) / (a1[0][0] - a1[1][0]); pts.push([XCOUPE, a1[0][1] + (a1[1][1] - a1[0][1]) * u, 0], [a1[1][0], a1[1][1], 0]);
        arc(pts, O, rc, 1, a1[1], a2[0], 3); pts.push([a2[1][0], a2[1][1], 1]);
        arc(pts, G, RG, -1, a2[1], a3[0], 1); pts.push([a3[1][0], a3[1][1], 1]);
        arc(pts, T, RG, 1, a3[1], a4[0], 1);
        var u2 = (XCOUPE - a4[0][0]) / (a4[1][0] - a4[0][0]); pts.push([XCOUPE, a4[0][1] + (a4[1][1] - a4[0][1]) * u2, 2]);
        /* plan de la chaîne : celui du pignon sur le pignon (3) et devant lui (0), celui de la chape dans la chape (1) et
           derrière elle (2), vers la ligne de chaîne du plateau devant */
        function zDe(p) {
          var z0 = p[2] === 1 || p[2] === 2 ? zChape : zc;
          return p[2] === 1 || p[2] === 3 ? z0 : z0 + (LIGNE - z0) * clamp(p[0] / BB[0], 0, 1);
        }
        var pins = [pts[0]], cur = pts[0], si = 1;
        while (si < pts.length && pins.length < NMAX + 1) {
          var p = pts[si], d = Math.hypot(p[0] - cur[0], p[1] - cur[1]);
          if (d >= PAS) {
            var q = pts[si - 1], lo = 0, hi = 1, m = 0;
            for (var it = 0; it < 30; it++) { m = (lo + hi) / 2; if (Math.hypot(q[0] + (p[0] - q[0]) * m - cur[0], q[1] + (p[1] - q[1]) * m - cur[1]) < PAS) lo = m; else hi = m; }
            cur = [q[0] + (p[0] - q[0]) * m, q[1] + (p[1] - q[1]) * m, p[2]]; pins.push(cur); pts[si - 1] = cur;
          } else si++;
        }
        var nO = 0, nI = 0;
        for (var i = 0; i < pins.length; i++) {
          M4.makeTranslation(pins[i][0], pins[i][1], zDe(pins[i])); iR.setMatrixAt(i, M4); iP.setMatrixAt(i, M4);
          if (i === pins.length - 1) break;
          var a = pins[i], b = pins[i + 1], ext = i % 2 === 0, off = ext ? 2.16 : 1.35;
          QZ.setFromAxisAngle(EZ, Math.atan2(b[1] - a[1], b[0] - a[0]));
          [off, -off].forEach(function (zo) {
            PV.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (zDe(a) + zDe(b)) / 2 + zo);
            M4.compose(PV, QZ, SC);
            if (ext) iO.setMatrixAt(nO++, M4); else iI.setMatrixAt(nI++, M4);
          });
        }
        iO.count = nO; iI.count = nI; iR.count = pins.length; iP.count = pins.length;
        [iO, iI, iR, iP].forEach(function (m) { m.instanceMatrix.needsUpdate = true; });
      }

      /* ---------- Mouvement (dessin, voir l'en-tête) : t va de 0 (9 dents) à 11 (45 dents) ---------- */
      function rayon(t) { var k = clamp(Math.floor(t), 0, 10), f = t - k; return lerp(Rp(DENTS[k]), Rp(DENTS[k + 1]), f); }
      function jeu(R) { return R >= R13 ? lerp(JEU_13, R_PLAQUE + TIP - RG, (R - R13) / (R45 - R13)) : JEU_13 + (R13 - R) * 0.4; }
      function mouvement(t) {
        var R = rayon(t), zc = Z9 - t * ECART, beta = K_AXE_B * (R - R13);
        var angLien = Math.acos(clamp((zc + PZ - BZ) / L_LIEN, -1, 1));
        var pa = add(B_LIEN, [DIR_LIEN[0] * L_LIEN * Math.sin(angLien), DIR_LIEN[1] * L_LIEN * Math.sin(angLien)]);
        var piv = add(PIED, rot(sub(sub(pa, P_LIEN), PIED), beta));
        /* rotation de la chape : la plus grande qui met le galet du haut à la distance voulue de l'axe (la chape tourne
           vers l'avant sur les grands pignons) ; sur les petits, la plus proche */
        var D = R + jeu(R) + RG, ecart = function (a) { var G = add(piv, rot(GL, beta + a)); return Math.hypot(G[0], G[1]) - D; };
        var choix = null, mieux = null, prec = ecart(-1.2);
        for (var a = -1.2 + 0.004; a <= 1.75; a += 0.004) {
          var e = ecart(a);
          if ((e > 0) !== (prec > 0)) choix = a - 0.004 * e / (e - prec);
          if (!mieux || Math.abs(e) < mieux.e) mieux = { a: a, e: Math.abs(e) };
          prec = e;
        }
        return { t: t, R: R, zc: zc, beta: beta, angLien: angLien, piv: piv, a: choix === null ? mieux.a : choix };
      }
      /* direction du haut de la plaque extérieure : vers l'axe de roue, à la pose du 45 dents */
      (function () {
        var m = mouvement(11), G = add(m.piv, rot(GL, m.beta + m.a)), d = Math.hypot(G[0], G[1]);
        plaques(rot([-G[0] / d, -G[1] / d], -(m.beta + m.a)));
      })();
      var bOuter = [L(B_LIEN)[0], L(B_LIEN)[1], 90], bInner = [L(B_LIEN)[0] + 6, L(B_LIEN)[1] - 10, 78];
      function lien(mesh, A, B) {
        var d = new THREE.Vector3(B[0] - A[0], B[1] - A[1], B[2] - A[2]), len = d.length();
        mesh.position.set((A[0] + B[0]) / 2, (A[1] + B[1]) / 2, (A[2] + B[2]) / 2);
        mesh.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), d.normalize());
        mesh.scale.set(len, 1, 1);
      }
      function poser(m, tc) {
        bK.rotation.z = m.beta;
        pK.position.set(m.piv[0], m.piv[1], m.zc); pK.rotation.z = m.beta;
        cage.position.set(m.piv[0], m.piv[1], m.zc); cage.rotation.z = m.beta + m.a;
        root.updateMatrixWorld(true);
        function monde(o, p) { var v = o.localToWorld(new THREE.Vector3(p[0], p[1], p[2])); return [v.x, v.y, v.z]; }
        lien(lienExt, monde(bK, bOuter), monde(pK, [P_LIEN[0], P_LIEN[1], PZ - 6]));
        lien(lienInt, monde(bK, bInner), monde(pK, [P_LIEN[0] + 6, P_LIEN[1] - 10, PZ - 14]));
        var G = monde(cage, [GL[0], GL[1], 0]), T = monde(cage, [TL[0], TL[1], 0]);
        chaine(rayon(tc), Z9 - tc * ECART, m.zc, G, T);
        var kc = Math.round(tc);
        pignons.forEach(function (p, k) { p.material = k === kc ? M.highlight : M.ghost; });
      }

      /* ---------- Poses des étapes ---------- */
      function indice(n) { return DENTS.indexOf(n); }
      function cle(n) {
        var t = indice(CIBLE[n - 1]), tc = t;
        if (n === 8) { tc = indice(24); t = lerp(tc, t, VERS_28); }   // la chape va vers le 28, la chaîne reste sur le 24
        return { t: t, tc: tc, jaune: JAUNE.indexOf(n) >= 0 ? 1 : 0 };
      }
      var allumes = { butee: [plaqueButee], axe: [axeTete], visB: [visB.userData.tete], bouton: [bouton], basse: [visBasse.userData.tete], haute: [visHaute.userData.tete] };
      var materiaux = new Map();
      Object.keys(allumes).forEach(function (q) { allumes[q].forEach(function (o) { materiaux.set(o, o.material); }); });
      function apply(s) {
        var k = clamp(Math.floor(s), 1, ETAPES.length), f = sstep(s - k), a = cle(k), b = cle(Math.min(ETAPES.length, k + 1));
        poser(mouvement(lerp(a.t, b.t, f)), lerp(a.tc, b.tc, f));
        voyant.material = lerp(a.jaune, b.jaune, f) > 0.5 ? mLedJaune : mLedOff;
        var on = ALLUME[Math.round(s)];
        Object.keys(allumes).forEach(function (q) { allumes[q].forEach(function (o) { o.material = q === on ? M.highlight : materiaux.get(o); }); });
        var n = clamp(Math.round(s), 1, ETAPES.length);
        if (n !== etapePins) { etapePins = n; if (pret) api.setPins(pinsDe(n)); }
      }
      /* les pastilles de chaque étape, par leur numéro dans l'ordre du fichier, six au plus */
      var PASTILLES = [[1, 2, 3, 14], [1, 7, 14], [1, 6, 14], [1, 8, 11, 12], [1, 11, 12], [1, 11, 12, 13], [1, 4, 5, 13], [1, 5, 11, 13], [1, 5, 11, 13], [1, 4, 5, 13], [1, 11, 12, 13], [1, 9, 11, 12], [1, 10, 11, 12]];
      var pins = null, pret = false, etapePins = 0;
      function pinsDe(n) { return PASTILLES[n - 1].map(function (i) { return pins[i - 1]; }); }
      var s = 7, sT = 7;
      apply(s);

      /* Le compteur du curseur reste court (« Étape 7 / 13 ») ; le titre entier de l'étape s'écrit sur une ligne à lui,
         sous la barre des commandes, qui revient à la ligne (classe .v3d-geste de 00-head.html), posée à la première
         image (onFrame), après la liste numérotée. */
      var ligne = null, placee = false;
      function geste(v) {
        var stage = api.viewer && api.viewer.stage, barre = stage && stage.nextElementSibling;
        if (!ligne) {
          ligne = document.createElement('p'); ligne.className = 'v3d-geste'; ligne.setAttribute('aria-live', 'polite');
        }
        if (barre && barre !== ligne && barre.nextElementSibling !== ligne) barre.insertAdjacentElement('afterend', ligne);
        ligne.textContent = 'Étape ' + v + ' de 4.6 : ' + ETAPES[v - 1];
      }

      /* ---------- Repères des pastilles ---------- */
      var aCorps = new THREE.Object3D(); aCorps.position.set(-36, -38, 94.4); bK.add(aCorps);
      var aBatt = new THREE.Object3D(); aBatt.position.set(CB[0] - 19.6, CB[1] - 2, 94); wBatt.add(aBatt);
      var a24 = new THREE.Object3D(); a24.position.set(-Rp(24) - TIP, 0, zk(indice(24)) + 0.8); a24.name = 'repère du 24 dents'; root.add(a24);
      var aPatte = new THREE.Object3D(); aPatte.position.set(10, 6, 72); wPatte.add(aPatte);

      pins = [
        { obj: aCorps, p: [0, 0, 0], text: 'Dérailleur Shimano RD-M8250-GS, Deore XT Di2 sans fil : ni fil ni port E-TUBE dans la liste de ses pièces, donc pas de port E-TUBE (déduction de ce site) ; une capacité de 36 dents, l’écart entre ton 9 et ton 45 dents' },
        { obj: aBatt, p: [0, 0, 0], text: 'Batterie Shimano BT-DN320 dans son support, « Battery holder », sur le dérailleur : dépose, pose et charge en 1.7' },
        { obj: levier, p: [CB[0] + 8, CB[1] + 9, 1.2], text: 'Levier du support de batterie : le seul levier de la liste des pièces de Shimano' },
        { obj: bouton, p: [0, 0, 1], text: 'Bouton de fonction : roue arrêtée, tiens-le de 2 à 5 secondes, jusqu’au voyant jaune fixe, pour le mode réglage ; 0,5 s ou plus pour revenir au mode normal' },
        { obj: voyant, p: [0, 1.6, 0], text: 'Voyant, « LED » : jaune fixe en mode réglage, éteint au mode normal ; s’il clignote en bleu, tu as relâché trop tôt' },
        { obj: axeB, p: [0, 0, 6.6], text: 'Axe B sur la patte SRAM UDH : serré à 10-12 Nm, clé six-pans de 5 mm, à ta TW-6.2' },
        { obj: plaqueButee, p: [2, -1.5, 3.2], text: 'Plaque de butée du dérailleur contre la butée de tension B, sans jour ; l’axe B entre droit dans la patte' },
        { obj: visB, p: [0, 2.6, 0], text: 'Vis B, clé de 2 mm : sur le 45 dents, le contour de la plaque extérieure de la chape au niveau de la pointe de la plus haute dent ; aucun écart en millimètres n’est publié' },
        { obj: visBasse, p: [0, 2.4, 0], text: 'Vis de butée basse, clé de 2 mm : sur le 45 dents, visse-la jusqu’à ce qu’elle touche juste sa butée' },
        { obj: visHaute, p: [0, 2.4, 0], text: 'Vis de butée haute, clé de 2 mm : sur le 9 dents, visse-la jusqu’à ce qu’elle touche juste sa butée' },
        { obj: galetHaut, p: [-RG - 2.2, 0, 1.2], text: 'Galet du haut, « Guide pulley », 13 dents : en mode réglage, il dépasse puis revient à chaque appui ; juge sa place dérailleur arrêté' },
        { obj: galetBas, p: [0, -RG - 2.2, 1.2], text: 'Galet du bas, « Tension pulley », 13 dents : les galets n’ont pas de sens de rotation' },
        { obj: a24, p: [0, 0, 0], text: 'Cinquième pignon en partant du plus grand : le 24 dents ; le quatrième, le 28 dents (déduction de ce site)' },
        { obj: aPatte, p: [0, 0, 0], text: 'Patte SRAM UDH : une patte tordue empêche tout réglage ; son contrôle est un travail d’atelier (4.7)' }
      ];
      pret = true;

      return {
        group: root,
        parts: [{ obj: wSupport, off: [-30, 0, 6] }, { obj: wBatt, off: [-22, 0, 0] }, { obj: wAxe, off: [0, 0, 26] }, { obj: wPlaqueExt, off: [0, 0, 22] }, { obj: wGalets, off: [0, 0, 11] }, { obj: wPatte, off: [0, 0, -16] }],
        pins: pinsDe(sT),
        controls: [{ type: 'range', label: 'Pas à pas', min: 1, max: 13, step: 1, value: 7,
          format: function (v) { geste(v); return 'Étape ' + v + ' / 13'; },
          onChange: function (v) { sT = v; if (reduce) { s = sT; apply(s); } api.dirty(); } }],
        onFrame: function (dt) {
          if (!placee) { placee = true; geste(sT); }
          if (s === sT) return false;
          var sp = (dt || 0.016) / 1.2 * (1 + 0.6 * Math.max(0, Math.abs(sT - s) - 1));
          s = sT > s ? Math.min(sT, s + sp) : Math.max(sT, s - sp);
          apply(s); return true;
        }
      };
    }
  });
})();
