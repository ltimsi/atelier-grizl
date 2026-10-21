// Pièce 3D : roues DT Swiss Gravel LN, pneus Continental Terra Adventure, valves et axes traversants.
//
// Repère de geometrie.js, en millimètres : x vers l'avant, y vers le haut, z vers la droite du cycliste.
// Les cotes viennent de GEO, de points() et de COTES, chacune avec son document dans SOURCES.
// Les autres nombres de ce fichier sont des valeurs de dessin : profil de la jante hors hauteur et largeur intérieure,
// section du pneu, crampons, moyeux, rayonnage, valve et têtes d'axe. META.approche les liste, sans chiffre.
// Lu sur la photo officielle de profil (canyon-photo-4553-fv) : vingt-quatre rayons par roue, l'angle de leur trou de
// jante, leur croisement au plus juste, la valve en haut entre deux rayons.
// Aucun import : le module ne reçoit que les outils de construction, les points et GEO.

const FICHE = 'canyon-4553';
const cote = (v, src) => Object.freeze({ v, src });

// Cotes publiées propres à ces pièces.
export const COTES = Object.freeze({
  largeurPneu: cote(45, FICHE), // « Largeur 45 mm »
  hauteurJante: cote(26, FICHE), // « Hauteur de la jante 26 mm »
  largeurInterneJante: cote(24, FICHE), // « Largeur interne 24 mm »
  axeAvant: cote(100, FICHE), // « Dimension de l'Axe 12x100 mm »
  axeArriere: cote(142, FICHE), // « Dimension de l'Axe 12x142 mm »
  diametreAxe: cote(12, FICHE), // le « 12 » de 12x100 et de 12x142
});

export const META = Object.freeze({
  id: 'roues',
  nom: 'Roues DT Swiss Gravel LN, pneus Continental Terra Adventure et axes traversants',
  zone: null, // l'atelier tubeless n'est pas dans cette livraison
  sources: Object.freeze([
    FICHE,
    'canyon-photo-4553-fv',
    'continental-terra-adventure',
    'continental-photo-terra-adventure-centre',
    'continental-photo-terra-adventure-epaules',
    'dtswiss-manuel-roues',
  ]),
  approche: Object.freeze([
    'Profil de la jante : seules sa hauteur et sa largeur intérieure sont publiées. Flancs, crochets et creux central ' +
      'sont approchés.',
    'Section du pneu : ronde, à la largeur publiée. Le rayon extérieur du pneu monté n’est pas publié, il est approché.',
    'Crampons : Continental décrit des rangées de trois, trois puis quatre crampons au centre, et des crampons ' +
      'd’épaule inclinés. Taille, hauteur et nombre de rangées sont approchés d’après les photos officielles.',
    'Moyeux : Canyon ne nomme pas leur modèle. Corps, flasques et position des flasques sont approchés.',
    'Rayons : leur nombre se compte sur la photo officielle. Croisement, rayon des flasques et grosseur des rayons ' +
      'sont approchés d’après cette photo.',
    'Cannelures Center Lock et corps de roue libre : formes approchées.',
    'Valve : type et longueur non publiés, forme approchée. Sa place suit la photo officielle.',
    'Axes traversants : seuls leur diamètre et l’écartement des pattes sont publiés. Têtes et embouts sont approchés.',
  ]),
  aVerifier: Object.freeze([
    'jante à crochets ou sans crochets : à lire sur le marquage de la jante',
    'modèle des moyeux : à lire sur les moyeux',
    'nombre de rayons, à compter sur la roue',
  ]),
});

// ---- Valeurs de dessin (approchées, voir META.approche) ----
const CROCHET = 5.5; // hauteur des crochets au-dessus du siège du talon
const PAROI = 2; // épaisseur des flancs de la jante
const CRAMPON = 3; // hauteur des crampons
const RANGEES = 264; // rangées de crampons sur un tour, lues au mieux sur la photo de profil
const MOTIF = [ // positions latérales des crampons centraux, en mm le long de la section, et leur largeur
  { s: [-8.5, 0, 8.5], l: 6.5 },
  { s: [-8.5, 0, 8.5], l: 6.5 },
  { s: [-11.25, -3.75, 3.75, 11.25], l: 5 },
];
const EPAULE = { s: 17.5, longueur: 6, largeur: 5.5, hauteur: 3.2, angle: 0.32 };
const RAYON_FLASQUE = 22.5; // cercle des trous de rayons sur les flasques
const CROISEMENT = 2; // rayons croisés deux fois
const ANGLE_PREMIER_RAYON = 7.5; // en degrés depuis l'avant, lu sur la photo, comme la valve à quatre-vingt-dix degrés
const ANGLE_VALVE = 90;
// Moyeux : flasques gauche et droite, en z. Disques à gauche, cassette à droite.
const MOYEUX = {
  avant: { flasques: [-22, 32] },
  arriere: { flasques: [-36, 18], roueLibre: [24, 67] },
};

const D2R = Math.PI / 180;
const pol = (c, r, deg) => [c[0] + r * Math.cos(deg * D2R), c[1] + r * Math.sin(deg * D2R)];

/**
 * Ajoute au groupe des outils les deux roues : pneus et crampons, jantes, moyeux, rayons et écrous, valves, axes.
 * Aucun maillage n'a de zone ni de variante, et les outils en ressortent sans zone ni variante.
 * Noms des maillages que vérifient les tests : pneu, jante, moyeu avant, moyeu arrière, rayons, axe avant, axe arrière.
 * @param {object} o Les outils de creerOutils.
 * @param {object} p Les points de points(geo).
 * @param {object} geo GEO, ou un objet de même forme.
 * @returns {void}
 */
export function construire(o, p, geo) {
  o.zone(null);
  o.variante(null);
  const roues = [
    { c: p.FA, cote: 'avant', largeur: COTES.axeAvant.v, plan: -geo.decalageDisqueAvant.v, ...MOYEUX.avant },
    { c: p.RA, cote: 'arrière', largeur: COTES.axeArriere.v, plan: -geo.decalageDisqueArriere.v, ...MOYEUX.arriere },
  ];
  for (const r of roues) {
    roue(o, r, geo);
    moyeu(o, r);
  }
  // Axes : la tige traverse les pattes, la tête et l'embout se posent sur leur face extérieure. Faces extérieures
  // des pattes dessinées par cadre.js : bouts de fourche, pattes arrière, puis patte de dérailleur côté droit.
  axe(o, p.FA, 'axe avant', [-74, -66], [66, 71]);
  axe(o, p.RA, 'axe arrière', [-88, -80], [85, 91]);
  o.zone(null);
  o.variante(null);
}

// Pneu, jante, rayons et valve d'une roue.
function roue(o, { c, flasques }, geo) {
  const siege = geo.diametreSiegeJante.v / 2;
  const nom = n => m => { m.name = n; return m; };

  // Jante : profil fermé, crochets en haut des flancs, creux central. Sens de parcours : la matière à gauche.
  const demi = COTES.largeurInterneJante.v / 2, ext = demi + PAROI;
  const haut = siege + CROCHET, bas = haut - COTES.hauteurJante.v;
  const demiProfil = [ // de z = +demi en haut du crochet, vers l'extérieur puis le fond de jante
    [haut, demi], [haut, ext], [haut - 3.5, ext], [siege - 11, ext - 0.4], [bas + 3.5, ext - 2.5], [bas + 0.7, 6], [bas, 0],
  ];
  const fond = [ // du siège du talon côté z négatif au siège côté z positif, par le creux central
    [siege, -demi], [siege, -(demi - 2.5)], [siege - 1.5, -(demi - 3.5)], [siege - 4, -5], [siege - 5.5, -4],
    [siege - 5.5, 4], [siege - 4, 5], [siege - 1.5, demi - 3.5], [siege, demi - 2.5], [siege, demi],
  ];
  const profilJante = [
    ...demiProfil,
    ...demiProfil.slice(0, -1).reverse().map(([r, z]) => [r, -z]),
    [haut - 1.5, -(demi - 0.7)], [siege + 2.5, -demi],
    ...fond,
    [siege + 2.5, demi], [haut - 1.5, demi - 0.7], [haut, demi],
  ];
  nom('jante')(o.lathe(profilJante, 180, 'rim')).position.set(c[0], c[1], 0);

  // Pneu : section ronde de la largeur publiée, talons assis sur le siège, sommet de la carcasse sous les crampons.
  const R = COTES.largeurPneu.v / 2, sommet = geo.rayonPneu.v - CRAMPON, centre = sommet - R;
  // L'arc passe exactement par les deux points les plus larges, à plus et moins un quart de tour.
  const tMax = Math.acos((siege + 9 - centre) / R), quart = Math.PI / 2;
  const arc = [];
  const echantillons = (t0, t1, n, dernier) => {
    for (let i = 0; i < n + (dernier ? 1 : 0); i++) {
      const t = t0 + (t1 - t0) * i / n;
      arc.push([centre + R * Math.cos(t), R * Math.sin(t)]);
    }
  };
  echantillons(-tMax, -quart, 4);
  echantillons(-quart, quart, 24);
  echantillons(quart, tMax, 4, true);
  const profilPneu = [
    [siege, -(demi - 0.1)], [haut + 0.1, -(demi + 0.2)], [haut + 1.7, -(demi + 3.4)],
    ...arc,
    [haut + 1.7, demi + 3.4], [haut + 0.1, demi + 0.2], [siege, demi - 0.1],
  ];
  nom('pneu')(o.lathe(profilPneu, 160, 'rubber')).position.set(c[0], c[1], 0);
  nom('pneu')(crampons(o, c, centre, R));

  // Rayons et écrous de rayon : InstancedMesh, un trou de jante tous les quinze degrés pour vingt-quatre rayons.
  const T = o.THREE, n = geo.nombreRayons.v;
  const rayons = nom('rayons')(o.inst(new T.CylinderGeometry(1, 1, 1, 6, 1), 'spoke', n));
  const ecrous = nom('écrous de rayon')(o.inst(new T.CylinderGeometry(2, 2, 1, 8, 1), 'steel', n));
  const Y = new T.Vector3(0, 1, 0), A = new T.Vector3(), B = new T.Vector3(), D = new T.Vector3();
  const q = new T.Quaternion(), mtx = new T.Matrix4(), un = new T.Vector3(1, 1, 1);
  const decalage = 720 * CROISEMENT / n; // angle entre le trou de flasque et le trou de jante d'un même rayon
  for (let i = 0; i < n; i++) {
    const a = ANGLE_PREMIER_RAYON + i * 360 / n;
    const sens = Math.floor(i / 2) % 2 ? 1 : -1; // tirants et poussants alternent par paires, comme sur la photo
    const h = pol(c, RAYON_FLASQUE, a + sens * decalage), j = pol(c, bas + 1, a);
    A.set(h[0], h[1], flasques[i % 2]);
    B.set(j[0], j[1], 0);
    D.copy(B).sub(A);
    const l = D.length();
    q.setFromUnitVectors(Y, D.normalize());
    mtx.compose(A.clone().add(B).multiplyScalar(0.5), q, un.clone().setY(l));
    rayons.setMatrixAt(i, mtx);
    mtx.compose(B.clone().addScaledVector(D, -4), q, un.clone().setY(12));
    ecrous.setMatrixAt(i, mtx);
  }

  // Valve : tige qui sort du fond de jante vers le moyeu, écrou contre la jante, obus au bout.
  const v = r => [...pol(c, r, ANGLE_VALVE), 0];
  nom('valve')(o.tube(v(siege - 4), v(bas - 22), 3, 3, 'steel', { seg: 16 }));
  nom('valve')(o.tube(v(bas + 0.5), v(bas - 4), 4.2, 4.2, 'steel', { seg: 6 }));
  nom('valve')(o.tube(v(bas - 22), v(bas - 31), 1.6, 1.6, 'steel', { seg: 12 }));
}

// Crampons d'un pneu, dans une seule InstancedMesh : pavés à flancs inclinés, plantés dans la carcasse.
function crampons(o, c, centre, R) {
  const T = o.THREE;
  const g = new T.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) if (pos.getY(i) > 0.5) pos.setXYZ(i, pos.getX(i) * 0.75, pos.getY(i), pos.getZ(i) * 0.75);
  g.computeVertexNormals();

  const pose = [];
  const pas = 360 / RANGEES;
  for (let r = 0; r < RANGEES; r++) {
    const rang = MOTIF[r % MOTIF.length];
    for (const s of rang.s) pose.push({ a: r * pas, s, longueur: 5.4, largeur: rang.l, hauteur: CRAMPON, angle: 0 });
  }
  // Épaules : deux crampons par motif de chaque côté, décalés d'un côté à l'autre.
  for (let m = 0; m < RANGEES / MOTIF.length; m++) {
    const a0 = m * MOTIF.length * pas;
    for (const [cote, rangs] of [[1, [0.25, 1.75]], [-1, [1, 2.5]]]) for (const k of rangs) {
      pose.push({ a: a0 + k * pas, s: cote * EPAULE.s, longueur: EPAULE.longueur, largeur: EPAULE.largeur,
        hauteur: EPAULE.hauteur, angle: cote * EPAULE.angle });
    }
  }

  const im = o.inst(g, 'rubber', pose.length);
  const N = new T.Vector3(), Tg = new T.Vector3(), Bn = new T.Vector3(), P = new T.Vector3();
  const mtx = new T.Matrix4(), echelle = new T.Matrix4();
  pose.forEach(({ a, s, longueur, largeur, hauteur, angle }, k) => {
    const th = a * D2R, t = s / R, r = centre + R * Math.cos(t);
    N.set(Math.cos(t) * Math.cos(th), Math.cos(t) * Math.sin(th), Math.sin(t));
    Tg.set(-Math.sin(th), Math.cos(th), 0);
    Bn.crossVectors(Tg, N);
    if (angle) {
      Tg.multiplyScalar(Math.cos(angle)).addScaledVector(Bn, Math.sin(angle)).normalize();
      Bn.crossVectors(Tg, N);
    }
    P.set(c[0] + r * Math.cos(th), c[1] + r * Math.sin(th), R * Math.sin(t)).addScaledVector(N, -0.5);
    mtx.makeBasis(Tg, N, Bn).multiply(echelle.makeScale(longueur, hauteur + 0.5, largeur)).setPosition(P);
    im.setMatrixAt(k, mtx);
  });
  return im;
}

// Moyeu : corps et flasques, cannelures Center Lock côté disque, roue libre à l'arrière, embouts jusqu'aux pattes.
function moyeu(o, { c, cote, largeur, plan, flasques, roueLibre }) {
  const nom = m => { m.name = `moyeu ${cote}`; return m; };
  const [g, d] = flasques, demi = largeur / 2;
  const flasque = z => [[21, z - 3], [25.5, z - 1.5], [25.5, z + 1.5], [21, z + 3]];
  nom(o.lathe([
    [11, g - 6], [14, g - 5], ...flasque(g), [15, g + 8], [14, (g + d) / 2], [15, d - 8], ...flasque(d), [14, d + 5], [11, d + 6],
  ], 48, 'hub')).position.set(c[0], c[1], 0);
  // Côté disque : épaulement contre le support du disque, cannelures coiffées par la bague du disque, embout.
  const debut = plan + 4.4, fin = plan - 4;
  nom(o.tubeZ(c, debut, g - 6, 19, 'hub', 40));
  nom(o.extr(o.engrenage(24, 18.6, 17.6, 9), debut - fin, 'hub')).position.set(c[0], c[1], (debut + fin) / 2);
  nom(o.tubeZ(c, -demi, fin, 12, 'hub', 32));
  // Côté droit : roue libre à l'arrière, puis embout jusqu'à la patte
  const finDroite = roueLibre ? roueLibre[1] : d + 6;
  if (roueLibre) nom(o.tubeZ(c, d + 6, roueLibre[1], 17.5, 'hub', 40));
  nom(o.tubeZ(c, finDroite, demi, 12, 'hub', 32));
}

// Axe traversant : tige de douze, tête côté disques, embout côté transmission, empreintes hexagonales.
function axe(o, c, nom, [t0, t1], [e0, e1]) {
  const r = COTES.diametreAxe.v / 2;
  const n = m => { m.name = nom; return m; };
  n(o.tubeZ(c, t0, e1, r, 'black', 24));
  n(o.tubeZ(c, t0, t1, 10, 'black', 32));
  n(o.tubeZ(c, e0, e1, 9, 'black', 32));
  n(o.boulon([c[0], c[1], t0 - 0.1], [0, 0, 1], 3.5, 0.4, 'rubber'));
  n(o.boulon([c[0], c[1], e1 + 0.1], [0, 0, 1], 3.5, 0.4, 'rubber'));
}
