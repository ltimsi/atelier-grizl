// Pièce 3D : cadre Canyon Grizl CF, fourche FK0143, collier GP0596-01, tige de selle SP100 et selle Selle Royal SRX.
//
// Repère de geometrie.js, en millimètres : x vers l'avant, y vers le haut, z vers la droite du cycliste.
// Les cotes viennent de GEO, de points() et de COTES, chacune avec son document dans SOURCES.
// Tous les autres nombres de ce fichier sont des valeurs de dessin : largeurs des tubes, raccords, positions des
// inserts, lues au mieux sur la photo officielle de profil (canyon-photo-4553-fv), calée sur les pneus.
// Ces formes ne sont pas publiées. META.approche les liste, sans chiffre.
// Aucun import : le module ne reçoit que les outils de construction, les points et GEO.

const FICHE = 'canyon-4553';
const cote = (v, src) => Object.freeze({ v, src });

// Cotes publiées propres à ces pièces.
export const COTES = Object.freeze({
  axeArriere: cote(142, FICHE), // cadre, « Axe 12x142 mm »
  axeAvant: cote(100, FICHE), // fourche FK0143, « Axe 12x100 mm »
  degagementPneu: cote(54, FICHE), // cadre et fourche, « Espace pour les pneus 54MM »
  diametreTige: cote(27.2, FICHE), // tige SP100, « Diamètre Du Collier 27,2 mm »
  longueurTige: cote(350, FICHE), // tige SP100, « Longueur de tige de selle en mm 350 »
  largeurSelle: cote(148, FICHE), // selle SRX, « Largeur 148 mm »
  reculTete: cote(18, 'canyon-photo-sp100-marquage'), // imprimé sur la tige : « SETBACK 18 / 6 mm », selon le sens de la tête
});

export const META = Object.freeze({
  id: 'cadre',
  nom: 'Cadre, fourche, tige de selle et selle',
  zone: null, // aucun atelier du cadre ni de la selle dans cette livraison
  sources: Object.freeze([
    FICHE,
    'canyon-photo-4553-fv',
    'canyon-photo-4553-confort',
    'canyon-photo-4553-degagement',
    'canyon-sp100',
    'canyon-photo-sp100',
    'canyon-photo-sp100-marquage',
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
    'Boîte de pédalier : largeur approchée d’après le standard nommé par la fiche.',
    'Collier de selle : forme approchée.',
    'Tige de selle : forme des lames et de la tête approchée d’après les photos officielles de Canyon.',
    'Selle et rails : longueur, galbe et position sur les rails non publiés, formes approchées. ' +
      'Seule la largeur de la selle est publiée.',
  ]),
  aVerifier: Object.freeze([
    'type de patte de dérailleur',
    'sens de la tête de la tige de selle à la livraison, donc son recul',
    'modèle exact de la tige de selle : la liste des composants et le texte de la fiche ne la nomment pas de la même façon',
  ]),
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
 * Les maillages dont un test vérifie la cote portent un nom : patte arrière, patte avant, tige de selle, selle.
 * @param {object} o Les outils de creerOutils.
 * @param {object} p Les points de points(geo).
 * @param {object} geo GEO, ou un objet de même forme.
 * @returns {void}
 */
export function construire(o, p, geo) {
  o.zone(null);
  o.variante(null);
  cadre(o, p);
  fourche(o, p);
  tigeEtSelle(o, p, geo);
}

// Le cadre : tubes, raccords, bases, haubans, pattes, protections noires et inserts.
function cadre(o, p) {
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
  const demiBoite = 43; // largeur approchée d'après le standard PF 86 nommé par la fiche
  o.tubeZ(BB, -demiBoite, demiBoite, 26.5, 'paint', 44);

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

// Le collier GP0596-01, la tige SP100 et la selle SRX.
function tigeEtSelle(o, p, geo) {
  const { BB, STt, SPt, dST } = p;
  const avant = normale(dST), arriere = mul(avant, -1);
  const rTige = COTES.diametreTige.v / 2;
  // Repère de la tige : s le long de l'axe depuis le bas de la tige, n vers l'avant.
  const bas = add(SPt, mul(dST, -COTES.longueurTige.v));
  const T = (s, n = 0) => add(add(bas, mul(dST, s)), mul(avant, n));

  // Collier : une bague sur le haut du tube de selle, et sa patte de serrage à l'arrière
  o.tube(v(add(STt, mul(dST, -8))), v(add(STt, mul(dST, 12))), rTige + 5, rTige + 5, 'black', { seg: 36 });
  const patte = add(add(STt, mul(dST, 3)), mul(arriere, rTige + 8));
  o.rbox(v(patte), [12, 14, 16], angle(dST) - Math.PI / 2, 'black', 3);
  o.boulon(v(patte), [0, 0, 1], 2.6, 18, 'steel');

  // Tige SP100 : un fût rond, puis deux lames de carbone qui s'écartent jusqu'à la tête, reculée vers l'arrière.
  const nommer = m => { m.name = 'tige de selle'; return m; };
  const fente = 250;
  nommer(o.tube(v(T(0)), v(T(fente)), rTige, rTige, 'carbon', { seg: 32 }));
  const tete = add(add(SPt, mul(dST, -18)), mul(arriere, COTES.reculTete.v));
  const boulons = [add(tete, [16, 0]), add(tete, [-16, 0])]; // avant, arrière
  const lames = [
    [T(fente, rTige / 2), T(fente + 45, rTige / 2 - 2), boulons[0]],
    [T(fente, -rTige / 2), T(fente + 40, -rTige / 2 - 8), boulons[1]],
  ];
  for (const [a, k, c] of lames) {
    nommer(o.tube(v(a), v(k), rTige / 2, rTige / 2, 'carbon', { sx: 1, sz: 2, seg: 24 }));
    nommer(o.tube(v(k), v(c), rTige / 2, rTige / 2, 'carbon', { sx: 1, sz: 2, seg: 24 }));
    nommer(o.ell(v(k), [rTige / 2, rTige / 2, rTige], 'carbon'));
  }
  nommer(o.rbox(v(tete), [46, 18, 2 * rTige], -.08, 'black', 4));
  for (const c of boulons) for (const s of [-1, 1]) o.boulon([c[0], c[1], s * (rTige + 1)], [0, 0, 1], 4.5, 2, 'steel');

  // Rails : sous la coque, serrés sur la tête
  const dessus = add(BB, mul(dST, geo.hauteurSelle.v)); // dessus de la selle, sur l'axe du tube de selle
  const rail = tete[1] + 12;
  for (const s of [-1, 1]) {
    o.tubeCourbe([
      [tete[0] - 105, dessus[1] - 12, s * 36], [tete[0] - 70, rail, s * 22], [tete[0] + 40, rail, s * 20],
      [tete[0] + 115, dessus[1] - 10, s * 10],
    ], 3.5, 'black', 30);
  }

  // Selle SRX : une sphère déformée en coque, sur le patron de la maquette, puis ramenée à la largeur publiée.
  // La sphère vient de l'outil ell, à l'échelle un : on déplace ses sommets.
  const selle = o.ell([tete[0] + 4, dessus[1] - 16, 0], [1, 1, 1], 'saddle');
  const pos = selle.geometry.attributes.position;
  const demiLargeur = COTES.largeurSelle.v / 2;
  let zMax = 0;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i), u = (x + 1) / 2;
    const r = Math.sqrt(Math.max(1e-6, 1 - x * x)), zs = z / r, ys = y / r;
    const e = x < 0 ? Math.pow(1 - Math.pow(-x, 6), 1 / 6) : Math.sqrt(1 - x * x) * .55 + .45 * Math.pow(1 - Math.pow(x, 6), 1 / 6);
    const Z = zs * e * (demiLargeur - 56 * Math.pow(u, 1.3));
    let Y = (ys > 0 ? ys * 14 : ys * 6) * e + 11 * (1 - u) * (1 - u);
    if (ys > 0) Y -= 3.5 * Math.exp(-(Z * Z) / 90) * Math.sin(Math.min(1, u * 1.4) * Math.PI);
    pos.setXYZ(i, -126 + u * 262, Y, Z);
    zMax = Math.max(zMax, Math.abs(Z));
  }
  const k = demiLargeur / zMax;
  for (let i = 0; i < pos.count; i++) pos.setZ(i, pos.getZ(i) * k);
  pos.needsUpdate = true;
  selle.geometry.computeVertexNormals();
  selle.name = 'selle';
}
