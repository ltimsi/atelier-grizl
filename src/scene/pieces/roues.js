// Pièce 3D : roues Canyon GR 30 CF (jantes carbone sans crochets, moyeux DT Swiss 350 Spline), pneus Schwalbe
// G-One RX, valves et axes traversants.
//
// Repère de geometrie.js, en millimètres : x vers l'avant, y vers le haut, z vers la droite du cycliste.
// Les cotes viennent de GEO, de points() et de COTES, chacune avec son document dans SOURCES.
// Les autres nombres de ce fichier sont des valeurs de dessin : profil de la jante hors hauteur et largeurs,
// section du pneu, crampons, moyeux, rayonnage, valve et têtes d'axe. META.approche les liste, sans chiffre.
// Lu sur la photo officielle de profil (canyon-photo-4556-fv) : jantes, rayons et écrous de rayon noirs, vingt-quatre
// rayons par roue, l'angle de leur trou de jante, leur croisement au plus juste, la valve en haut entre deux rayons, la
// hauteur du pneu au-dessus de la jante, les crampons d'épaule groupés par deux. Sur la photo du passage de pneu
// (canyon-photo-4556-degagement) : petits crampons serrés au centre, plus gros sur les épaules.
// Zones : les deux axes traversants en zone 'axes' (atelier 1.5) ; les pneus, crampons compris, et les valves en zone
// 'pneus' (ateliers 3.1 à 3.6) ; jantes, rayons et moyeux sans zone.
// Aucun import : le module ne reçoit que les outils de construction, les points et GEO.

const FICHE = 'canyon-4556';
const cote = (v, src) => Object.freeze({ v, src });

// Cotes publiées propres à ces pièces.
export const COTES = Object.freeze({
  largeurPneu: cote(45, 'schwalbe-g-one-rx'), // « ETRTO: 45-622 »
  hauteurJante: cote(30, FICHE), // « jante 30 mm », et « Hauteur de la jantee en mm 30 »
  largeurInterneJante: cote(27, FICHE), // « largeur interne 27 mm »
  largeurExterieureJante: cote(33, 'canyon-gr30cf'), // « External width: 33mm, ETRTO 622x27TSS »
  axeAvant: cote(100, FICHE), // roue avant et axe traversant, « 12x100 »
  axeArriere: cote(142, FICHE), // roue arrière et axe traversant, « 12x142 »
  diametreAxe: cote(12, FICHE), // le « 12 » de 12x100 et de 12x142
});

export const META = Object.freeze({
  id: 'roues',
  nom: 'Roues Canyon GR 30 CF, pneus Schwalbe G-One RX et axes traversants',
  zone: null, // les axes en zone 'axes', les pneus et les valves en zone 'pneus'
  sources: Object.freeze([
    FICHE,
    'canyon-photo-4556-fv',
    'canyon-photo-4556-degagement',
    'canyon-gr30cf',
    'schwalbe-g-one-rx',
  ]),
  approche: Object.freeze([
    'Profil de la jante : hauteur, largeur intérieure et largeur extérieure publiées, et Canyon annonce des jantes ' +
      'sans crochets. Flancs, siège du talon et creux central sont approchés.',
    'Section du pneu : ronde, à la largeur publiée. Le rayon extérieur du pneu monté n’est pas publié, il est approché ' +
      'd’après la photo officielle.',
    'Crampons : Schwalbe décrit des crampons extérieurs appariés, sans cote. Petits crampons serrés au centre, ' +
      'crampons d’épaule plus gros et groupés par deux : taille, hauteur, inclinaison et nombre sont approchés ' +
      'd’après les photos officielles.',
    'Moyeux : Canyon nomme des moyeux DT Swiss à rayons droits. Corps, flasques et position des flasques sont approchés.',
    'Rayons : leur nombre est publié. Profil plat, croisement, rayon des flasques et grosseur des rayons sont ' +
      'approchés d’après la photo officielle.',
    'Cannelures Center Lock et corps de roue libre : formes approchées.',
    'Valve : type et longueur non publiés, forme approchée. Sa place suit la photo officielle, sa tête dorée n’est pas ' +
      'rendue.',
    'Inscriptions des jantes et des flancs des pneus : non dessinées.',
    'Axes traversants : seuls leur diamètre et l’écartement des pattes sont publiés. Têtes et embouts sont approchés.',
  ]),
  aVerifier: Object.freeze([
    'pression maximale imprimée sur la jante : à lire sur la jante',
    'corps de roue libre de la roue arrière, Micro Spline attendu : à lire sur le moyeu',
    'version du pneu, gomme et code de sculpture : à lire sur le flanc',
    'valves tubeless : présentes ou non dans le carton',
  ]),
});

// ---- Valeurs de dessin (approchées, voir META.approche) ----
const FLANC = 4.5; // hauteur du flanc de la jante au-dessus du siège du talon : une jante sans crochets s'arrête là
const CRAMPON = 2.6; // hauteur des crampons du centre, les plus hauts : leur dessus fait le rayon extérieur du pneu
// Sculpture : un motif se répète MOTIFS fois sur le tour. Au centre, quatre rangées de petits crampons, de trois puis
// de deux. Sur chaque épaule, une paire : un crampon incliné vers le centre, puis un crampon long au bord. Les deux
// épaules sont décalées d'un demi-motif. s : place le long de la section, depuis le sommet ; t : place dans le motif.
const MOTIFS = 84;
const CENTRE = Object.freeze({ longueur: 3.6, largeur: 4, rangees: [[-8, 0, 8], [-4, 4], [-8, 0, 8], [-4, 4]] });
const EPAULE = Object.freeze([
  { s: 15, t: 0, longueur: 4.5, largeur: 8.5, hauteur: 3.4, angle: 0.5 },
  { s: 20, t: 0.42, longueur: 10, largeur: 6.5, hauteur: 3.4, angle: 0 },
]);
const RAYON_FLASQUE = 22.5; // cercle des trous de rayons sur les flasques
const RAYON_PLAT = { mince: 0.65, large: 1.25 }; // demi-épaisseurs d'un rayon plat, le long du tour et le long de l'axe
const CROISEMENT = 2; // rayons croisés deux fois
const ANGLE_PREMIER_RAYON = 7.5; // en degrés depuis l'avant, lu sur la photo, comme la valve à quatre-vingt-dix degrés
export const ANGLE_VALVE = 90;
// Moyeux : flasques gauche et droite, en z. Disques à gauche, cassette à droite.
const MOYEUX = {
  avant: { flasques: [-22, 32] },
  arriere: { flasques: [-36, 18], roueLibre: [24, 67] },
};

const D2R = Math.PI / 180;
const pol = (c, r, deg) => [c[0] + r * Math.cos(deg * D2R), c[1] + r * Math.sin(deg * D2R)];

/**
 * Les trois tubes d'une valve, du fond de la jante vers le moyeu : la tige, qui sort de sous le siège du talon,
 * l'écrou contre la jante, puis l'obus au bout. En rayons depuis l'axe de la roue, à l'angle ANGLE_VALVE. Valeurs de
 * dessin (META.approche) ; le schéma 2D dessine les mêmes tubes (schema2d.js).
 * @param {number} siege Le rayon du siège du talon, la moitié de GEO.diametreSiegeJante.
 * @returns {{de: number, a: number, rayon: number, seg: number}[]} seg : facettes du tube en 3D.
 */
export function tubesValve(siege) {
  const bas = siege + FLANC - COTES.hauteurJante.v; // le fond de la jante, où entrent les rayons
  return [
    { de: siege - 4, a: bas - 22, rayon: 3, seg: 16 },
    { de: bas + 0.5, a: bas - 4, rayon: 4.2, seg: 6 },
    { de: bas - 22, a: bas - 31, rayon: 1.6, seg: 12 },
  ];
}

/**
 * Ajoute au groupe des outils les deux axes, puis les deux roues : pneus et crampons, jantes, moyeux, rayons et écrous,
 * valves. Les axes sont en zone 'axes', les pneus et les valves en zone 'pneus', le reste sans zone ; les outils en
 * ressortent sans zone.
 * Noms des maillages que vérifient les tests : pneu, valve, jante, moyeu avant, moyeu arrière, rayons, axe avant,
 * axe arrière.
 * @param {object} o Les outils de creerOutils.
 * @param {object} p Les points de points(geo).
 * @param {object} geo GEO, ou un objet de même forme.
 * @returns {void}
 */
export function construire(o, p, geo) {
  // Axes : la tige traverse les pattes, la tête et l'embout se posent sur leur face extérieure. Faces extérieures
  // des pattes dessinées par cadre.js : bouts de fourche, pattes arrière, puis patte de dérailleur côté droit.
  o.zone('axes');
  axe(o, p.FA, 'axe avant', [-74, -66], [66, 71]);
  axe(o, p.RA, 'axe arrière', [-88, -80], [85, 91]);
  o.zone(null);
  const roues = [
    { c: p.FA, cote: 'avant', largeur: COTES.axeAvant.v, plan: -geo.decalageDisqueAvant.v, ...MOYEUX.avant },
    { c: p.RA, cote: 'arrière', largeur: COTES.axeArriere.v, plan: -geo.decalageDisqueArriere.v, ...MOYEUX.arriere },
  ];
  for (const r of roues) {
    roue(o, r, geo);
    moyeu(o, r);
  }
}

// Pneu, jante, rayons et valve d'une roue : le pneu et la valve en zone 'pneus', la jante et les rayons sans zone.
function roue(o, { c, flasques }, geo) {
  const siege = geo.diametreSiegeJante.v / 2;
  const nom = n => m => { m.name = n; return m; };

  // Jante sans crochets : flancs droits arrondis en haut, siège du talon et son bourrelet, creux central, puis le dessous
  // en U jusqu'au fond, où entrent les rayons. Sens de parcours : la matière à gauche.
  const demi = COTES.largeurInterneJante.v / 2, ext = COTES.largeurExterieureJante.v / 2;
  const haut = siege + FLANC, bas = haut - COTES.hauteurJante.v;
  const demiProfil = [ // de z = +demi en haut du flanc, vers l'extérieur puis le fond de jante
    [haut, demi + 0.6], [haut, ext - 0.9], [haut - 0.35, ext - 0.3], [haut - 1, ext], [haut - 7, ext],
    [siege - 12, ext - 0.6], [bas + 9, ext - 2.5], [bas + 4, ext - 5.5], [bas + 1.2, 7], [bas, 0],
  ];
  const fond = [ // du siège du talon côté z négatif au siège côté z positif, par le bourrelet et le creux central
    [siege, -demi], [siege, -(demi - 2.2)], [siege + 0.8, -(demi - 3)], [siege - 0.4, -(demi - 4)], [siege - 3.5, -5.5],
    [siege - 4.5, -4], [siege - 4.5, 4], [siege - 3.5, 5.5], [siege - 0.4, demi - 4], [siege + 0.8, demi - 3],
    [siege, demi - 2.2], [siege, demi],
  ];
  const profilJante = [
    ...demiProfil,
    ...demiProfil.slice(0, -1).reverse().map(([r, z]) => [r, -z]),
    [haut - 0.6, -demi],
    ...fond,
    [haut - 0.6, demi], [haut, demi + 0.6],
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
  o.zone('pneus');
  nom('pneu')(o.lathe(profilPneu, 160, 'rubber')).position.set(c[0], c[1], 0);
  nom('pneu')(crampons(o, c, centre, R));
  o.zone(null);

  // Rayons plats et écrous de rayon noirs : InstancedMesh, un trou de jante tous les quinze degrés pour vingt-quatre
  // rayons. Un rayon plat est large le long de l'axe de la roue et mince le long du tour : de profil, on voit sa tranche.
  const T = o.THREE, n = geo.nombreRayons.v;
  const rayons = nom('rayons')(o.inst(new T.CylinderGeometry(1, 1, 1, 6, 1), 'spoke', n));
  const ecrous = nom('écrous de rayon')(o.inst(new T.CylinderGeometry(2, 2, 1, 8, 1), 'black', n));
  const A = new T.Vector3(), B = new T.Vector3(), D = new T.Vector3(), X = new T.Vector3(), Z = new T.Vector3();
  const mtx = new T.Matrix4(), echelle = new T.Matrix4();
  const pose = (m, i, centre, l, mince, large) => {
    mtx.makeBasis(X, D, Z).multiply(echelle.makeScale(mince, l, large)).setPosition(centre);
    m.setMatrixAt(i, mtx);
  };
  const decalage = 720 * CROISEMENT / n; // angle entre le trou de flasque et le trou de jante d'un même rayon
  for (let i = 0; i < n; i++) {
    const a = ANGLE_PREMIER_RAYON + i * 360 / n;
    const sens = Math.floor(i / 2) % 2 ? 1 : -1; // tirants et poussants alternent par paires, comme sur la photo
    const h = pol(c, RAYON_FLASQUE, a + sens * decalage), j = pol(c, bas + 1, a);
    A.set(h[0], h[1], flasques[i % 2]);
    B.set(j[0], j[1], 0);
    D.copy(B).sub(A);
    const l = D.length();
    D.normalize();
    Z.set(0, 0, 1).addScaledVector(D, -D.z).normalize(); // l'axe de la roue, ramené en travers du rayon
    X.crossVectors(D, Z);
    pose(rayons, i, A.clone().add(B).multiplyScalar(0.5), l, RAYON_PLAT.mince, RAYON_PLAT.large);
    pose(ecrous, i, B.clone().addScaledVector(D, -4), 12, 1, 1);
  }

  // Valve : tige qui sort du fond de jante vers le moyeu, écrou contre la jante, obus au bout.
  const v = r => [...pol(c, r, ANGLE_VALVE), 0];
  o.zone('pneus');
  for (const t of tubesValve(siege)) nom('valve')(o.tube(v(t.de), v(t.a), t.rayon, t.rayon, 'steel', { seg: t.seg }));
  o.zone(null);
}

// Crampons d'un pneu, dans une seule InstancedMesh : pavés à flancs inclinés, plantés dans la carcasse.
// Chaque motif : les rangées du centre, puis la paire d'épaule de chaque côté, la gauche décalée d'un demi-motif.
function crampons(o, c, centre, R) {
  const T = o.THREE;
  const g = new T.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) if (pos.getY(i) > 0.5) pos.setXYZ(i, pos.getX(i) * 0.75, pos.getY(i), pos.getZ(i) * 0.75);
  g.computeVertexNormals();

  const pose = [];
  const pas = 360 / MOTIFS;
  for (let m = 0; m < MOTIFS; m++) {
    const a0 = m * pas;
    CENTRE.rangees.forEach((rang, k) => {
      for (const s of rang) {
        pose.push({ a: a0 + k * pas / CENTRE.rangees.length, s, longueur: CENTRE.longueur, largeur: CENTRE.largeur,
          hauteur: CRAMPON, angle: 0 });
      }
    });
    for (const [cote, demiMotif] of [[1, 0], [-1, 0.5]]) for (const e of EPAULE) {
      pose.push({ a: a0 + (e.t + demiMotif) * pas, s: cote * e.s, longueur: e.longueur, largeur: e.largeur,
        hauteur: e.hauteur, angle: cote * e.angle });
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
