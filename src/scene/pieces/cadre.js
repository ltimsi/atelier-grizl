// Pièce 3D : cadre Canyon Grizl CF, fourche FK0143, collier GP0596-01, tige de selle Canyon SP100 VCLS 2.1 CF 27.2
// et selle Fizik Argo Terra X5.
//
// Repère de geometrie.js, en millimètres : x vers l'avant, y vers le haut, z vers la droite du cycliste.
// Les cotes viennent de GEO, de points() et de COTES, chacune avec son document dans SOURCES.
// Tous les autres nombres de ce fichier sont des valeurs de dessin : largeurs des tubes, raccords, positions des
// inserts, lues au mieux sur la photo officielle de profil (canyon-photo-4556-fv), calée sur les pneus ; lames et tête
// de la tige, contour et galbe de la selle, lus sur cette photo et sur celle de la tige et de la selle
// (canyon-photo-4556-confort). Ces formes ne sont pas publiées. META.approche les liste, sans chiffre.
// Aucun import : le module ne reçoit que les outils de construction, les points et GEO.

const FICHE = 'canyon-4556';
const MARQUAGE = 'canyon-photo-sp100-marquage'; // la photo officielle de la tige, avec ses cotes imprimées
const FIZIK = 'fizik-argo-terra-x5';
const cote = (v, src) => Object.freeze({ v, src });

// Cotes publiées propres à ces pièces.
export const COTES = Object.freeze({
  axeArriere: cote(142, FICHE), // cadre, « Axe 12x142 mm »
  axeAvant: cote(100, FICHE), // fourche FK0143, « Axe 12x100 mm »
  degagementPneu: cote(54, FICHE), // cadre et fourche, « espace pneus 54MM »
  diametreTige: cote(27.2, MARQUAGE), // « DIAMETER 27,2 mm », comme les « 27,2 mm » de la fiche
  longueurTige: cote(350, MARQUAGE), // « LENGHT 350 mm » (sic), comme les « 350 mm » de la fiche
  reculTete: cote(18, MARQUAGE), // « SETBACK 18 / 6 mm », selon le sens de la tête
  largeurSelle: cote(150, FIZIK), // « Width 150 mm », comme les « 150 mm » de la fiche
  longueurSelle: cote(270, FIZIK), // « Length 270 mm »
  // Le « 75mm » des deux cotes suivantes, lu comme l'endroit où la selle a cette largeur (lecture à vérifier).
  largeurRepere: cote(75, FIZIK),
  repereDepuisBec: cote(113, FIZIK), // « Length from nose at 75mm 113 mm »
  hauteurRepere: cote(51, FIZIK), // « Height at 75mm 51 mm », prise ici depuis l'axe des rails
  rail: cote(7, FIZIK), // « Rail Dimension 7x7 », lu comme une section en millimètres (lecture à vérifier)
});

export const META = Object.freeze({
  id: 'cadre',
  nom: 'Cadre, fourche, tige de selle SP100 VCLS 2.1 et selle Fizik Argo Terra X5',
  zone: null, // aucun atelier du cadre ni de la selle dans cette livraison
  sources: Object.freeze([
    FICHE,
    'canyon-photo-4556-fv',
    'canyon-photo-4556-confort',
    'canyon-photo-4556-degagement',
    'canyon-sp100',
    'canyon-photo-sp100',
    MARQUAGE,
    FIZIK,
  ]),
  approche: Object.freeze([
    'Profils et diamètres des tubes du cadre : non publiés, formes approchées d’après la photo officielle de profil.',
    'Raccords entre les tubes : formes approchées.',
    'Haubans : ils rejoignent le tube de selle un peu sous le tube supérieur. Sur la photo officielle, ils arrivent ' +
      'à la hauteur du tube supérieur. La hauteur exacte n’est pas publiée.',
    'Fourche : forme des fourreaux et de la couronne approchée d’après les photos officielles.',
    'Déport de la fourche : non publié. Il découle ici des autres cotes de la géométrie.',
    'Pattes du cadre, de la fourche et patte de dérailleur : formes approchées. Seul l’écartement des axes est publié.',
    'Jeu laissé autour du pneu le plus large : non publié, approché.',
    'Protections noires et inserts de fixation : forme et position approchées d’après la photo officielle.',
    'Boîte de pédalier : largeur publiée par la fiche, diamètre approché.',
    'Collier de selle : forme approchée.',
    'Tige de selle : deux lames séparées par une fente sur leur longueur, qui s’écartent puis se rejoignent dans la ' +
      'tête, comme sur les photos officielles de Canyon. Épaisseur et courbe des lames, place de la fente, yeux des ' +
      'vis et forme de la tête sont approchés.',
    'Selle : largeur, longueur, largeur à un repère mesuré depuis le bec et hauteur à ce repère publiées par Fizik. ' +
      'Fizik ne dit pas d’où il prend cette hauteur : elle part ici de l’axe des rails, ce qui s’accorde avec la photo ' +
      'officielle. Contour, galbe, bec court plongeant, place sur les rails et courbe des rails sont approchés ' +
      'd’après les photos officielles.',
    'Inscriptions de la tige, de la tête et de la selle : non dessinées.',
  ]),
  aVerifier: Object.freeze([
    'type de patte de dérailleur',
    'sens de la tête de la tige de selle à la livraison, donc son recul',
    'marquage de la tige de selle : la fiche la nomme de plusieurs façons, à lire sur la tige',
    'ce que mesure la longueur publiée par Fizik, la selle ou ses rails',
    'cotes de Fizik : le repère lu comme l’endroit où la selle a sa largeur publiée, et la section des rails lue ' +
      'en millimètres. Deux lectures à vérifier sur la selle',
  ]),
});

// ---- Tige de selle et selle : valeurs de dessin (approchées, voir META.approche) ----
// Lues au mieux sur les photos officielles du CF 8 Di2 (canyon-photo-4556-fv et canyon-photo-4556-confort), à l'échelle
// des cotes publiées. s : le long de la tige depuis son bas ; n : en travers, vers l'avant.
const TIGE = Object.freeze({
  jonction: 30, // les deux lames se rejoignent au bas de la tige, dans le tube de selle
  fente: 275, // au-dessus, elles s'écartent vers les vis de la tête
  jeu: 0.6, // demi-largeur de la fente entre les deux lames
  lame: 6.5, // demi-épaisseur des lames au-dessus de la fente, dans le plan du vélo
  oeil: 8, // rayon des yeux des lames, autour des vis
  vis: Object.freeze([[15, -10.5], [-15, -13]]), // vis de la tête, depuis l'axe des rails : devant, puis derrière
  // Tête, de profil : le bloc entre les yeux, puis les plaques qui serrent les rails dessous et dessus.
  // [x et y du centre depuis l'axe des rails, longueur, hauteur].
  tete: Object.freeze([[0, -6, 26, 16], [0, -5.5, 38, 4], [0, 5, 44, 7]]),
});
const SELLE = Object.freeze({
  recul: 143, // de l'axe des rails dans la tête jusqu'à l'arrière de la selle
  demiBec: 19, // demi-largeur du bec
  retrecit: 0.3, // part de la longueur, depuis l'arrière, où la selle commence à se rétrécir vers le bec
  arrondis: Object.freeze([0.06, 0.08]), // parts de la longueur arrondies à l'arrière et au bec
  // Hauteur du dessus, en millimètres, le long de la selle (part de la longueur depuis l'arrière) : le bec plonge.
  dessus: Object.freeze([[0, 3], [0.085, 4], [0.31, 2], [0.53, 0], [0.715, -3], [0.88, -6.5], [1, -12]]),
  epaisseur: 7.5, // demi-épaisseur de la coque, au milieu de la section
  tombe: Object.freeze([3, 19, 4]), // descente des bords sous le milieu : à l'arrière, au centre, au bec
  carre: 4, // exposant de la section : plus il est grand, plus elle est carrée
  // Rails : attaches sous la coque (part de la longueur, écart au plan du vélo) et tronçon droit serré dans la tête.
  rails: Object.freeze({
    arriere: Object.freeze([0.2, 36]), avant: Object.freeze([0.79, 10]), droit: Object.freeze([-55, 50]), ecart: 20,
  }),
  sections: 44, // sections de la coque le long de la selle
  tour: 36, // points sur le tour d'une section
});

// Vecteurs du plan [x, y].
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const mul = (a, k) => [a[0] * k, a[1] * k];
const nrm = a => { const l = Math.hypot(a[0], a[1]); return [a[0] / l, a[1] / l]; };
const lerp = (a, b, t) => add(a, mul(sub(b, a), t));
const lerp3 = (a, b, t) => a.map((x, i) => x + (b[i] - x) * t);
// Normale d'une direction, tournée d'un quart de tour en sens horaire : vers l'avant pour un tube qui monte vers
// l'arrière, vers le dessous pour un tube qui monte vers l'avant, vers le dessus pour un tube qui va vers l'arrière.
const normale = d => [d[1], -d[0]];
const v = (p, z = 0) => [p[0], p[1], z];
const angle = d => Math.atan2(d[1], d[0]);

// Tube à section elliptique dont la demi-largeur dans le plan du vélo (l) et la demi-épaisseur en z (e) varient
// chacune à leur rythme, de a à b. L'outil tube ne donne qu'un seul rapport des deux : on étire donc un tube de rayon
// un, anneau par anneau. Le tube n'a qu'un segment en longueur : chaque anneau est à un bout.
function fuseau(o, a, b, [la, ea], [lb, eb], role, seg = 32) {
  const m = o.tube(a, b, 1, 1, role, { seg });
  const pos = m.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const [l, e] = pos.getY(i) > 0 ? [lb, eb] : [la, ea];
    pos.setXYZ(i, pos.getX(i) * l, pos.getY(i), pos.getZ(i) * e);
  }
  pos.needsUpdate = true;
  m.geometry.computeVertexNormals();
  return m;
}

/**
 * Ajoute au groupe des outils le cadre, la fourche, le collier, la tige de selle et la selle.
 * Aucun maillage n'a de zone ni de variante, et les outils en ressortent sans zone ni variante.
 * Les maillages dont un test vérifie la cote portent un nom : patte arrière, patte avant, boîte de pédalier,
 * tige de selle, rail de selle, selle.
 * @param {object} o Les outils de creerOutils.
 * @param {object} p Les points de points(geo).
 * @param {object} geo GEO, ou un objet de même forme.
 * @returns {void}
 */
export function construire(o, p, geo) {
  o.zone(null);
  o.variante(null);
  cadre(o, p, geo);
  fourche(o, p);
  tigeEtSelle(o, p, geo);
}

// Le cadre : tubes, raccords, bases, haubans, pattes, protections noires et inserts.
function cadre(o, p, geo) {
  const { BB, RA, HTt, HTb, STt, dHT, dST } = p;
  const avantST = normale(dST); // vers l'avant, perpendiculaire au tube de selle

  // Tube oblique : sur la photo, il rejoint la douille vers le milieu de sa hauteur.
  const debutDT = add(BB, [6, -7]), finDT = add(HTb, mul(dHT, 64));
  const dDT = nrm(sub(finDT, BB)), dessousDT = normale(dDT);
  const demiDT = 30.5;
  o.tube(v(debutDT), v(finDT), demiDT, demiDT, 'paint', { sz: .88, seg: 40 });

  // Douille, tube de selle (un peu en avant de l'axe de la tige, comme sur la photo), tube supérieur, boîte de pédalier
  o.tube(v(HTb), v(HTt), 26.5, 26.5, 'paint', { sz: .9, seg: 44 });
  const avanceST = 4.5, demiST = [16, 19.5];
  o.tube(v(add(BB, mul(avantST, avanceST))), v(add(STt, mul(avantST, avanceST))), ...demiST, 'paint', { sz: .9, seg: 36 });
  const ttA = add(STt, mul(dST, -26)), ttB = add(HTt, mul(dHT, -30));
  const dTT = nrm(sub(ttB, ttA)), dessousTT = normale(dTT), demiTT = [14, 17.5];
  o.tube(v(ttA), v(ttB), ...demiTT, 'paint', { sz: 1.1, seg: 36 });
  const demiBoite = geo.largeurBoite.v / 2; // PF 86,5 : la moitié de chaque côté du plan du vélo
  o.tubeZ(BB, -demiBoite, demiBoite, 26.5, 'paint', 44).name = 'boîte de pédalier';

  // Raccords
  o.ell(v(add(add(HTb, mul(dHT, 40)), [-12, -6])), [30, 52, 26], 'paint', angle(dHT) - Math.PI / 2);
  o.ell(v(add(HTt, mul(dHT, -26))), [24, 20, 19], 'paint', angle(dTT));
  o.ell(v(add(STt, mul(dST, -38))), [21, 42, 20], 'paint', angle(dST) - Math.PI / 2);
  o.ell(v(add(add(STt, mul(dST, -56)), mul(avantST, -6))), [14, 30, 30], 'paint', angle(dST) - Math.PI / 2);
  o.ell([BB[0] + 6, BB[1] + 10, 0], [40, 34, 30], 'paint', .5);

  // Bases et haubans : ils s'écartent jusqu'aux pattes, dont la face intérieure tient l'axe de 142.
  // Sur la photo, la base est haute près du boîtier et fine vers la patte. Près du boîtier, elle reste à l'intérieur
  // du plateau ; plus loin, elle s'écarte pour laisser passer le pneu.
  const zPatte = COTES.axeArriere.v / 2, ePatte = 9;
  const avantBase = [BB[0] + 5, BB[1] + 30], arriereBase = [RA[0] + 14, RA[1] - 8];
  const attacheHauban = add(STt, mul(dST, -72)), basHauban = [RA[0] + 5, RA[1] + 35];
  const base = { l: [33, 8], e: [7, 6], z: [26, zPatte + 6] };
  for (const s of [-1, 1]) {
    const [bAvant, bArriere] = [v(avantBase, s * base.z[0]), v(arriereBase, s * base.z[1])];
    fuseau(o, bAvant, bArriere, [base.l[0], base.e[0]], [base.l[1], base.e[1]], 'paint');
    fuseau(o, v(attacheHauban, s * 26), v(basHauban, s * (zPatte + 6)), [11, 7.5], [10, 6], 'paint');
    o.rbox([RA[0] + 8, RA[1] + 12, s * (zPatte + ePatte / 2)], [46, 56, ePatte], .25, 'paint', 4).name = 'patte arrière';
  }

  // Patte de dérailleur, côté transmission, contre la face extérieure de la patte
  o.rbox([RA[0] - 6, RA[1] - 16, zPatte + ePatte + 2.5], [16, 34, 5], -.3, 'black', 2);

  // Protection de base côté transmission : elle coiffe le haut de la base, du plateau jusqu'avant la patte,
  // plus haute à l'avant qu'à l'arrière, comme sur la photo.
  const dBase = nrm(sub(arriereBase, avantBase)), dessusBase = normale(dBase);
  const surBase = (t, h) => {
    const l = base.l[0] + (base.l[1] - base.l[0]) * t, e = base.e[0] + (base.e[1] - base.e[0]) * t;
    const c = add(lerp(avantBase, arriereBase, t), mul(dessusBase, l - h / 2 + 1));
    return { c: v(c, base.z[0] + (base.z[1] - base.z[0]) * t), l: h / 2 + 1, e: e + 1.5 };
  };
  const [p0, p1] = [surBase(.3, 21), surBase(.82, 8)];
  fuseau(o, p0.c, p1.c, [p0.l, p0.e], [p1.l, p1.e], 'protector');

  // Protections du tube oblique : garde sous le tube près du boîtier, plaque sur le dessus
  const surDT = (s, n) => add(add(debutDT, mul(dDT, s)), mul(dessousDT, n));
  fuseau(o, v(surDT(70, demiDT + 1)), v(surDT(165, demiDT + 1)), [4.5, 18], [4.5, 18], 'protector');
  fuseau(o, v(surDT(380, -demiDT - 2)), v(surDT(478, -demiDT - 2)), [3.5, 14], [3.5, 14], 'protector');

  // Inserts de fixation noirs, posés sur la surface, axe normal à la surface
  const insert = (q, n) => o.boulon(v(q), [n[0], n[1], 0], 4, 3.5, 'black');
  for (const s of [159, 223, 287, 517]) insert(surDT(s, -demiDT - 1), mul(dessousDT, -1));
  const demiSTen = s => demiST[0] + (demiST[1] - demiST[0]) * s / Math.hypot(...sub(STt, BB));
  for (const s of [115, 179]) insert(add(add(BB, mul(dST, s)), mul(avantST, avanceST + demiSTen(s) + 1)), avantST);
  insert(add(add(BB, mul(dST, 196)), mul(avantST, avanceST - demiSTen(196) - 1)), mul(avantST, -1));
  const longTT = Math.hypot(...sub(ttB, ttA));
  const demiTTen = s => demiTT[0] + (demiTT[1] - demiTT[0]) * s / longTT;
  for (const s of [151, 215, 358, 420]) insert(add(add(ttA, mul(dTT, s)), mul(dessousTT, demiTTen(s) + 1)), dessousTT);
  insert(add(add(ttA, mul(dTT, 389)), mul(dessousTT, -demiTTen(389) - 1)), mul(dessousTT, -1));
}

// La fourche FK0143 : couronne dans le prolongement de la douille, fourreaux droits, bouts arrondis, inserts.
function fourche(o, p) {
  const { FA, CROWN, dHT } = p;
  const zPatte = COTES.axeAvant.v / 2;
  const zLibre = COTES.degagementPneu.v / 2 + 4; // face intérieure des fourreaux sous la couronne : pneu et jeu
  const haut = { l: 24.5, e: 13 }, bas = { l: 20.5, e: 8 };
  // Couronne : un peu en avant de l'axe de direction, à fleur de la douille. Fourreaux : leur axe passe par celui
  // de la roue et, sous la couronne, un peu devant l'axe de direction.
  const couronne = add(add(CROWN, mul(dHT, 3)), mul(normale(dHT), 4));
  o.rbox(v(couronne), [52, 26, 2 * (zLibre + 2 * haut.e)], angle(dHT) - Math.PI / 2, 'paint', 10);
  const avantF = mul(normale(nrm(sub(FA, CROWN))), -1);
  const sommet = add(CROWN, mul(avantF, 6));
  for (const s of [-1, 1]) {
    const h = v(sommet, s * (zLibre + haut.e)), b = v(FA, s * (zPatte + bas.e));
    fuseau(o, h, b, [haut.l, haut.e], [bas.l, bas.e], 'paint');
    o.ell(b, [bas.l, bas.l, bas.e], 'paint').name = 'patte avant';
    for (const t of [.375, .535, .695]) {
      const q = add(lerp(sommet, FA, t), mul(avantF, 2));
      const zExterieur = lerp3(h, b, t)[2] + s * (haut.e + (bas.e - haut.e) * t);
      o.boulon([q[0], q[1], zExterieur + s * 1.5], [0, 0, s], 4, 3.5, 'black');
    }
  }
}


// ---- Tige de selle et selle ----

// Valeur lissée d'une table [[u, valeur], ...] rangée par u croissant : passe par chaque point, sans cassure.
function lisse(table, u) {
  const n = table.length;
  let i = 0;
  while (i < n - 2 && u > table[i + 1][0]) i++;
  const [u1, y1] = table[i], [u2, y2] = table[i + 1];
  const [u0, y0] = i > 0 ? table[i - 1] : [2 * u1 - u2, 2 * y1 - y2];
  const [u3, y3] = i + 2 < n ? table[i + 2] : [2 * u2 - u1, 2 * y2 - y1];
  const t = (u - u1) / (u2 - u1), h = u2 - u1;
  const m1 = (y2 - y0) / (u2 - u0) * h, m2 = (y3 - y1) / (u3 - u1) * h;
  return (2 * t ** 3 - 3 * t ** 2 + 1) * y1 + (t ** 3 - 2 * t ** 2 + t) * m1 + (3 * t ** 2 - 2 * t ** 3) * y2 + (t ** 3 - t ** 2) * m2;
}

// La selle le long de sa longueur (u, de l'arrière au bec) : demi-largeur vue de dessus, arrondi des deux bouts,
// hauteur du dessus et descente des bords. La largeur suit les cotes de Fizik : pleine largeur à l'arrière, puis un
// rétrécissement qui passe par la largeur publiée au repère, à la distance publiée du bec, et finit sur le bec court.
function profilSelle() {
  const L = COTES.longueurSelle.v, demi = COTES.largeurSelle.v / 2;
  const demiRepere = COTES.largeurRepere.v / 2, uRepere = 1 - COTES.repereDepuisBec.v / L;
  const rampe = t => (1 - Math.cos(Math.PI * Math.min(1, Math.max(0, t)))) / 2;
  const tRepere = Math.acos(1 - 2 * (demi - demiRepere) / (demi - SELLE.demiBec)) / Math.PI;
  const fin = SELLE.retrecit + (uRepere - SELLE.retrecit) / tRepere;
  const [ra, rb] = SELLE.arrondis, [ta, tm, tb] = SELLE.tombe;
  return {
    L,
    largeur: u => demi - (demi - SELLE.demiBec) * rampe((u - SELLE.retrecit) / (fin - SELLE.retrecit)),
    bout: u => {
      if (u < ra) return Math.cbrt(1 - (1 - u / ra) ** 3);
      if (u > 1 - rb) return Math.sqrt(Math.max(0, 1 - ((u - 1 + rb) / rb) ** 2));
      return 1;
    },
    dessus: u => lisse(SELLE.dessus, u),
    tombe: u => {
      const bout = u < 0.5 ? ta : tb;
      return bout + (tm - bout) * Math.sqrt(Math.sin(Math.PI * u));
    },
  };
}

// Section de la selle en u : un carré aux coins très arrondis, dont les bords tombent sous le milieu.
// phi part du dessus et tourne vers la droite du cycliste. y0 : hauteur de référence du dessus.
function pointSelle(f, u, phi, x0, y0) {
  const e = f.bout(u), W = f.largeur(u) * e, H = SELLE.epaisseur * e, D = f.tombe(u) * e, k = 2 / SELLE.carre;
  const s = Math.sin(phi), c = Math.cos(phi);
  const zs = Math.sign(s) * Math.abs(s) ** k, ys = Math.sign(c) * Math.abs(c) ** k;
  return [x0 + u * f.L, y0 + f.dessus(u) - H * (1 - ys) - D * zs ** 4, W * zs];
}

// Hauteur du dessous de la coque en u, à la distance z du plan du vélo : là où les rails entrent dans la selle.
function dessousSelle(f, u, z, y0) {
  const e = f.bout(u), W = f.largeur(u) * e, zs = Math.min(1, Math.abs(z) / W);
  const c = Math.sqrt(1 - zs ** SELLE.carre);
  return y0 + f.dessus(u) - SELLE.epaisseur * e * (1 + c ** (2 / SELLE.carre)) - f.tombe(u) * e * zs ** 4;
}

// Chemin lissé passant par une suite de points du plan (Catmull-Rom), n points par intervalle, le dernier compris.
function courbe(points, n) {
  const o = [], P = i => points[Math.max(0, Math.min(points.length - 1, i))];
  for (let i = 0; i < points.length - 1; i++) for (let k = 0; k < n; k++) {
    const t = k / n, [p0, p1, p2, p3] = [P(i - 1), P(i), P(i + 1), P(i + 2)];
    o.push([0, 1].map(c => 0.5 * (2 * p1[c] + (p2[c] - p0[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t * t +
      (3 * p1[c] - p0[c] - 3 * p2[c] + p3[c]) * t ** 3)));
  }
  o.push(points[points.length - 1]);
  return o;
}

// Les deux lames en trois dimensions, en sections : de la jonction à la fente, un demi-disque dont le plat borde la
// fente ; au-dessus, la section s'arrondit en une lame plate, qui garde la largeur de la tige en z, jusqu'à l'œil de sa
// vis. Chaque section fait le tour de la lame ; sens vaut un pour la lame avant, moins un pour la lame arrière.
function lamesEnSections(surTige, lames, mi) {
  const r = COTES.diametreTige.v / 2, th = Math.acos(TIGE.jeu / r);
  const demiDisque = []; // [a, b] : a vers l'extérieur de la lame depuis son milieu, b en travers du vélo
  for (let k = 0; k <= 16; k++) {
    const psi = th - 2 * th * k / 16;
    demiDisque.push([r * Math.cos(psi) - mi, r * Math.sin(psi)]);
  }
  for (let k = 1; k < 6; k++) demiDisque.push([TIGE.jeu - mi, -r * Math.sin(th) * (1 - 2 * k / 6)]);
  const plate = demiDisque.map(([a, b]) => {
    const phi = Math.atan2(b / r, a / TIGE.lame);
    return [TIGE.lame * Math.cos(phi), r * Math.sin(phi)];
  });
  return lames.map((haut, i) => {
    const sens = i === 0 ? 1 : -1, chemin = [];
    for (let s = TIGE.jonction; s < TIGE.fente - 4; s += 25) chemin.push(surTige(s, sens * mi));
    const debut = chemin.length; // la fente : la section commence à s'arrondir
    chemin.push(...courbe(haut, 6));
    let parcouru = 0;
    return chemin.map((q, k) => {
      if (k > debut) parcouru += Math.hypot(...sub(q, chemin[k - 1]));
      const avantK = chemin[Math.min(chemin.length - 1, k + 1)], arriereK = chemin[Math.max(0, k - 1)];
      const nu = mul(normale(nrm(sub(avantK, arriereK))), sens);
      const t = Math.min(1, parcouru / 30), w = t * t * (3 - 2 * t);
      return demiDisque.map(([a, b], j) => {
        const [ae, be] = plate[j], aa = a + (ae - a) * w, bb = b + (be - b) * w;
        return [q[0] + nu[0] * aa, q[1] + nu[1] * aa, -sens * bb];
      });
    });
  });
}

/**
 * La tige et la selle, sans three.js : la 3D (tigeEtSelle) et le schéma 2D (schema2d.js) les dessinent à l'identique.
 * La tête serre les rails au haut de la tige (SPt, sur l'axe), reculée du recul marqué sur la tige. Le dessus de la
 * selle passe par la hauteur de selle, sur l'axe du tube de selle.
 * @param {object} p Les points de points(geo).
 * @param {object} geo GEO, ou un objet de même forme.
 * @returns {{surTige: Function, jonction: number[], fente: number[], pince: number[], vis: number[][],
 *   tete: {centre: number[], longueur: number, hauteur: number}[], lames: number[][][], lames3D: number[][][][],
 *   rayonLame: number, rayonOeil: number, sections: number[][][], rails: number[][][], rayonRail: number}}
 *   surTige(s, n) : point de la tige, à s du bas le long de son axe et à n en travers, vers l'avant ; pince : axe des
 *   rails dans la tête ; vis : vis de la tête, devant puis derrière ; tete : ses trois blocs de profil ; lames : chemins
 *   des deux lames de la fente aux vis, dans le plan du vélo ; lames3D : les deux lames en sections, de la jonction aux
 *   vis ; sections : sections de la coque, de l'arrière au bec ; rails : les deux rails, droite puis gauche. Sections et
 *   rails sont en trois dimensions.
 */
export function poseSelle(p, geo) {
  const { BB, SPt, dST } = p;
  const avant = normale(dST);
  const bas = add(SPt, mul(dST, -COTES.longueurTige.v));
  const surTige = (s, n = 0) => add(add(bas, mul(dST, s)), mul(avant, n));
  const sn = q => { const d = sub(q, bas); return [d[0] * dST[0] + d[1] * dST[1], d[0] * avant[0] + d[1] * avant[1]]; };

  // Tête et lames, dans le plan du vélo
  const pince = add(SPt, mul(avant, -COTES.reculTete.v));
  const vis = TIGE.vis.map(d => add(pince, d));
  const mi = (COTES.diametreTige.v / 2 + TIGE.jeu) / 2, f0 = TIGE.fente;
  const [[sv, nv], [sw, nw]] = vis.map(sn);
  const tete = TIGE.tete.map(([x, y, longueur, hauteur]) => ({ centre: add(pince, [x, y]), longueur, hauteur }));
  const lames = [
    [surTige(f0 - 4, mi), surTige(f0 + 18, mi - 0.5), surTige((f0 + sv) / 2 + 8, (mi + nv) / 2), surTige(sv - 10, nv + 1.5),
      vis[0]],
    [surTige(f0 - 4, -mi), surTige(f0 + 12, -mi - 3.5), surTige(f0 + 32, -mi - 14), surTige(sw - 12, nw + 4), vis[1]],
  ];

  // Coque : sections resserrées vers les bouts, où la forme tourne vite
  const f = profilSelle();
  const dessusAxe = add(BB, mul(dST, geo.hauteurSelle.v));
  const x0 = pince[0] - SELLE.recul;
  const y0 = dessusAxe[1] - f.dessus((dessusAxe[0] - x0) / f.L);
  const sections = [];
  for (let i = 0; i < SELLE.sections; i++) {
    const u = (1 - Math.cos(Math.PI * i / (SELLE.sections - 1))) / 2;
    const tour = [];
    for (let j = 0; j < SELLE.tour; j++) tour.push(pointSelle(f, u, 2 * Math.PI * j / SELLE.tour, x0, y0));
    sections.push(tour);
  }

  // Rails : de l'attache arrière, une courbe jusqu'au tronçon droit serré dans la tête, puis une courbe jusqu'au bec
  const R = SELLE.rails;
  const attache = ([u, z]) => [x0 + u * f.L, dessousSelle(f, u, z, y0) + 1.5, z]; // le bout entre dans la coque
  const bezier = (a, b, c, d, n, premier) => {
    const o = [];
    for (let i = premier ? 0 : 1; i <= n; i++) {
      const t = i / n, w = [(1 - t) ** 3, 3 * t * (1 - t) ** 2, 3 * t * t * (1 - t), t ** 3];
      o.push([0, 1, 2].map(k => w[0] * a[k] + w[1] * b[k] + w[2] * c[k] + w[3] * d[k]));
    }
    return o;
  };
  const A = attache(R.arriere), N = attache(R.avant);
  const B = [pince[0] + R.droit[0], pince[1], R.ecart], C = [pince[0] + R.droit[1], pince[1], R.ecart];
  const unRail = [
    ...bezier(A, [A[0] + 12, A[1] - 10, A[2]], [B[0] - 22, B[1], B[2]], B, 8, true),
    lerp3(B, C, 1 / 3), lerp3(B, C, 2 / 3),
    ...bezier(C, [C[0] + 22, C[1], C[2]], [N[0] - 10, N[1] - 10, N[2]], N, 8, true),
  ];
  const rails = [1, -1].map(s => unRail.map(([x, y, z]) => [x, y, s * z]));

  return {
    surTige, jonction: surTige(TIGE.jonction), fente: surTige(f0), pince, vis, tete, lames,
    lames3D: lamesEnSections(surTige, lames, mi), rayonLame: TIGE.lame, rayonOeil: TIGE.oeil, sections, rails,
    rayonRail: COTES.rail.v / 2,
  };
}

// Un maillage tiré d'une suite de sections de même nombre de points, chacune faisant le tour de la pièce. Sections
// et tours sont parcourus dans le sens qui tourne les faces vers l'extérieur. Les bouts restent ouverts : une section
// réduite à un point les ferme.
function parSections(o, sections, role) {
  const T = o.THREE, nu = sections.length, nt = sections[0].length;
  const positions = new Float32Array(nu * nt * 3);
  sections.forEach((tour, i) => tour.forEach((q, j) => positions.set(q, (i * nt + j) * 3)));
  const index = [];
  for (let i = 0; i < nu - 1; i++) for (let j = 0; j < nt; j++) {
    const a = i * nt + j, b = i * nt + (j + 1) % nt;
    index.push(a, b, a + nt, b, b + nt, a + nt);
  }
  const g = new T.BufferGeometry();
  g.setAttribute('position', new T.BufferAttribute(positions, 3));
  g.setIndex(index);
  g.computeVertexNormals();
  return o.mesh(g, role);
}

// Le collier GP0596-01, la tige SP100 VCLS 2.1 et la selle Fizik Argo Terra X5.
function tigeEtSelle(o, p, geo) {
  const { STt, dST } = p;
  const avant = normale(dST), arriere = mul(avant, -1);
  const rTige = COTES.diametreTige.v / 2;
  const pose = poseSelle(p, geo);

  // Collier : une bague sur le haut du tube de selle, et sa patte de serrage à l'arrière
  o.tube(v(add(STt, mul(dST, -8))), v(add(STt, mul(dST, 12))), rTige + 5, rTige + 5, 'black', { seg: 36 });
  const patte = add(add(STt, mul(dST, 3)), mul(arriere, rTige + 8));
  o.rbox(v(patte), [12, 14, 16], angle(dST) - Math.PI / 2, 'black', 3);
  o.boulon(v(patte), [0, 0, 1], 2.6, 18, 'steel');

  // Tige : un fût rond au bas, dans le tube de selle, puis deux lames séparées par une fente. Au-dessus de la fente, les
  // lames s'écartent jusqu'aux yeux des deux vis de la tête. Elles gardent la largeur de la tige en z.
  const nommer = m => { m.name = 'tige de selle'; return m; };
  nommer(o.tube(v(pose.surTige(0)), v(pose.jonction), rTige, rTige, 'carbon', { seg: 32 }));
  for (const lame of pose.lames3D) nommer(parSections(o, lame, 'carbon'));
  for (const c of pose.vis) {
    nommer(o.tubeZ(c, -rTige, rTige, pose.rayonOeil, 'carbon', 28));
    for (const s of [-1, 1]) o.boulon([c[0], c[1], s * (rTige + 1)], [0, 0, 1], 4, 2, 'black');
  }

  // Tête : le bloc entre les yeux, aussi large que la tige, puis les deux plaques qui serrent les rails par-dessous et
  // par-dessus, aussi larges que l'écart des rails
  const largeurs = [2 * rTige - 4, 2 * (SELLE.rails.ecart + pose.rayonRail + 1.5)];
  pose.tete.forEach(({ centre, longueur, hauteur }, i) => {
    const l = largeurs[Math.min(i, 1)];
    o.rbox(v(centre), [longueur, hauteur, l], 0, 'black', Math.min(3, hauteur / 2 - 0.5)).name = 'tête de tige';
  });

  // Rails de la selle
  for (const rail of pose.rails) o.tubeCourbe(rail, pose.rayonRail, 'black', 48).name = 'rail de selle';

  // Coque de la selle : les sections de poseSelle, fermées aux deux bouts, où elles se réduisent à un point
  parSections(o, pose.sections, 'saddle').name = 'selle';
}
