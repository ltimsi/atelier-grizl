// Pièce 3D : disques Shimano Deore XT RT-MT800 d'origine du Grizl CF 8 Di2, étriers flat mount dessinés sur le
// modèle du BR-RX820, plaquettes en résine à ailettes L05A-RF, durites de la fourche et du cadre jusqu'aux étriers.
//
// Repère de geometrie.js, en millimètres : x vers l'avant, y vers le haut, z vers la droite du cycliste.
// Disques et étriers sont à gauche (z négatif). Leur position vient de GEO et de points() : CF, CR, plans des disques.
// Le diamètre des disques est dans GEO. Les autres nombres de ce fichier sont des valeurs de dessin : épaisseur, bras,
// trous, ailettes, bagues, étriers, pistons, plaquettes, trajet des durites. META.approche les liste, sans chiffre.
// Sur la photo officielle de la sacoche de cadre (canyon-photo-4556-rangement), la durite avant sort du fourreau
// gauche par un passage à l'arrière, au-dessus de l'étrier, et descend droit dans son raccord : elle passe dans le
// fourreau. Seule cette partie visible est dessinée.
// Lu sur la photo officielle de profil (canyon-photo-4556-fv), à travers la roue : la face intérieure du disque avant
// (fentes, bande d'ailettes claire, araignée noire), l'étrier avant noir derrière le fourreau gauche, son logement de
// piston rond, la tête de l'axe des plaquettes en haut, le raccord de la durite au bout haut de l'étrier, et les
// ailettes des plaquettes qui dépassent du corps vers l'extérieur.
// Zones : les deux disques et leurs bagues en zone 'disques', un seul type de disque et aucune variante ; l'étrier
// avant et ses plaquettes en zone 'etrier' ; l'étrier arrière sans zone ; les durites en zone 'manettes' (la tâche du
// poste de pilotage construit celles du cintre jusqu'au jeu de direction).
// Aucun import : le module ne reçoit que les outils de construction, les points et GEO.

/**
 * Les deux plaquettes de l'étrier avant, pour l'animation de sortie de la scène.
 * Chaque `construire` vide ce tableau puis le remplit : il décrit toujours la dernière construction.
 * groupe : le THREE.Group d'une plaquette (plaque, ailette et garniture, zone 'etrier'), posé dans le groupe des
 * outils. base : sa position au repos, en mm. dir : vecteur unitaire qui sort du disque en passant par l'étrier.
 * La scène place le groupe en base + dir × course × t. La course est un choix d'affichage, pas une cote.
 * @type {{groupe: object, base: object, dir: object}[]}
 */
export const PLAQUETTES = [];

export const META = Object.freeze({
  id: 'freins',
  nom: 'Disques Deore XT MT800, étriers GRX, plaquettes L05A-RF et durites',
  zone: null, // trois zones selon les maillages : 'disques', 'etrier' et 'manettes'
  sources: Object.freeze([
    'canyon-4556',
    'canyon-4556-en',
    'canyon-photo-4556-fv',
    'canyon-photo-4556-rangement',
    'shimano-deore-xt-m8000',
    'shimano-c-461',
    'shimano-st-rx825',
    'shimano-br-rx820',
    'shimano-ev-br-rx820',
    'shimano-dm-gadbr01-11',
  ]),
  approche: Object.freeze([
    'Disque XT : piste, fentes, araignée, rivets et ailettes de refroidissement en forme approchée d’après la photo ' +
      'officielle du vélo, où on le voit à travers la roue. Le même disque aux deux roues.',
    'Épaisseur du disque : Shimano range ce disque parmi les disques d’épaisseur standard, sans valeur dans les ' +
      'documents cités. Elle est approchée.',
    'Bague Center Lock : forme approchée, dessinée à denture extérieure.',
    'Étriers à fixation flat mount : Canyon ne donne pas le modèle. Ils sont dessinés sur celui que Shimano associe ' +
      'aux manettes du vélo. Corps, logements des pistons, raccord et vis approchés d’après la photo officielle, qui ' +
      'montre aussi leur place autour du moyeu.',
    'Plaquettes : en résine à ailettes, comme l’une des plaquettes standard de cet étrier selon Shimano. Plaque, ' +
      'garniture et ailettes en forme approchée.',
    'Sortie des plaquettes : sens et course de l’animation approchés. Le chapitre dit seulement de retirer le clip, ' +
      'puis l’axe, puis les plaquettes avec leur ressort. La roue reste en place pour qu’on voie l’étrier.',
    'Durite avant : elle passe dans le fourreau gauche et en sort par un passage à l’arrière, au-dessus de l’étrier, ' +
      'comme sur la photo officielle de la sacoche de cadre. Seule la partie visible est dessinée : place du passage, ' +
      'grosseur et trajet approchés.',
    'Durite arrière : grosseur et trajet de l’étrier jusqu’à la base gauche approchés.',
    'Couleurs : la bande d’ailettes du disque, claire sur la photo officielle, et les ailettes des plaquettes, sombres ' +
      'sur la photo, sont rendues en gris métal.',
  ]),
  aVerifier: Object.freeze([
    'modèle exact de l\'étrier, à lire sur la pièce',
    'modèle exact du disque : la fiche Canyon nomme un disque XT, ses pièces d’usure proposent un disque Ultegra, ' +
      'à lire sur la pièce',
    'type de bague Center Lock d\'origine, à lire sur la pièce',
    'épaisseur neuve du disque, à lire sur la pièce',
    'plaquettes d’origine et leur épaisseur neuve, à lire sur la pièce',
    'sortie de la durite avant du fourreau et entrée de la durite arrière dans la base, à regarder sur le vélo',
  ]),
});

// ---- Valeurs de dessin (approchées, voir META.approche) ----
const D2R = Math.PI / 180;
const EP = 1.75; // épaisseur du disque : valeur de dessin, approchée
const BRAS = 6;
// Disque, lu au mieux sur la photo officielle, où on voit sa face intérieure à travers la roue : piste grise percée
// d'une rangée de fentes à cinq pans, bande d'ailettes claire entre la piste et l'araignée, araignée noire à six bras.
const MT800 = {
  piste: 62.5, patte: 56, rivet: 59.5, balayage: 22, araignee: 27, epaisseurAraignee: 3,
  ailettes: { r: [49.5, 63], ecartBras: 8, epaisseur: 2.6 },
  fentes: { n: 30, r: 69.5, hauteur: 8.5, demiLargeur: 3.4 },
};
const BAGUE = { r: 21, epaisseur: 6, encoches: 16 };
const PASSAGE = 18.7; // trou central du support : il coiffe les cannelures du moyeu
const DURITE = 2.6;
// Passage de la durite avant, lu au mieux sur la photo de la sacoche de cadre : à l'arrière du fourreau gauche dessiné
// par cadre.js, à cette part de sa longueur depuis l'axe avant, et à l'écart de son axe et en z du fourreau à cette
// hauteur.
const PASSAGE_FOURREAU = { t: 0.44, ecart: 22, z: -51.8, rayon: 3.6 };
// Étrier, dans son repère : radial vers l'extérieur du disque depuis son point, puis le long du disque.
// Moitiés de part et d'autre du disque, pont au-delà du bord du disque, logements ronds des deux pistons opposés.
const ETRIER = { moitie: [56, 32, 12], ecartMoitie: 12, pont: [50, 14, 30], piston: { radial: -2, rayon: 11, saillie: 3 } };
// Plaquette : plaque et garniture, puis l'ailette qui sort du corps vers l'extérieur, et ses nervures.
const PLAQUETTE = {
  plaque: [34, 22, 1.6], garniture: [30, 16, 2.4], ailette: { centre: 22, taille: [20, 20, 1.6] }, nervures: [25, 31],
};

const pol = (r, a) => [r * Math.cos(a), r * Math.sin(a)];

/**
 * Ajoute au groupe des outils les disques, leurs bagues, les étriers, les plaquettes et les durites du cadre.
 * Les outils en ressortent sans zone ni variante. Vide puis remplit PLAQUETTES.
 * Noms des maillages que vérifient les tests : piste, étrier avant, étrier arrière, « étrier avant, piston »,
 * « étrier arrière, piston », plaquette, ailette, durite. Les autres : bague, et les morceaux sans nom des disques.
 * @param {object} o Les outils de creerOutils.
 * @param {object} p Les points de points(geo).
 * @param {object} geo GEO, ou un objet de même forme.
 * @returns {void}
 */
export function construire(o, p, geo) {
  PLAQUETTES.length = 0;
  o.zone(null);
  o.variante(null);
  const R = geo.diametreDisque.v / 2;
  const avant = { c: p.FA, plan: -geo.decalageDisqueAvant.v };
  const arriere = { c: p.RA, plan: -geo.decalageDisqueArriere.v };

  o.zone('disques');
  for (const d of [avant, arriere]) {
    disqueMT800(o, d, R);
    bague(o, d);
  }

  o.zone('etrier');
  const fixAvant = etrier(o, p.CF, geo.angleEtrierAvant.v, avant.plan, 'étrier avant', -1, true);
  o.zone(null);
  const fixArriere = etrier(o, p.CR, geo.angleEtrierArriere.v, arriere.plan, 'étrier arrière', -1, false);

  o.zone('manettes');
  durites(o, p, fixAvant, fixArriere);
  o.zone(null);
  o.variante(null);
}

// Forme fermée à partir de points [x, y].
function forme(T, pts, trous = []) {
  const s = new T.Shape(pts.map(([x, y]) => new T.Vector2(x, y)));
  for (const t of trous) s.holes.push(new T.Path(t.map(([x, y]) => new T.Vector2(x, y))));
  return s;
}
const cercle = (cx, cy, r, n = 20) => Array.from({ length: n }, (_, i) => [cx + r * Math.cos(i / n * 2 * Math.PI), cy + r * Math.sin(i / n * 2 * Math.PI)]);

// RT-MT800 : piste en acier à pattes de rivetage et fentes, araignée noire à six bras, bande d'ailettes FREEZA claire
// entre les bras.
function disqueMT800(o, { c, plan }, R) {
  const T = o.THREE;
  const { piste, patte, rivet, balayage, araignee, epaisseurAraignee, ailettes, fentes } = MT800;
  const angleBras = k => (k * 360 / BRAS + 15 + balayage) * D2R;
  // Bord intérieur de la piste : un cercle creusé de six pattes arrondies.
  const bord = [];
  for (let i = 0; i < 360; i++) {
    const a = i * D2R;
    let creux = 0;
    for (let k = 0; k < BRAS; k++) {
      const d = Math.abs(Math.atan2(Math.sin(a - angleBras(k)), Math.cos(a - angleBras(k)))) / D2R;
      if (d < 7.5) creux = Math.max(creux, 0.5 * (1 + Math.cos(Math.PI * d / 7.5)));
    }
    bord.push(pol(piste - (piste - patte) * creux, a));
  }
  // Fentes à cinq pans : le bord extérieur droit, la pointe vers le moyeu.
  const { n, r: rf, hauteur, demiLargeur } = fentes;
  const percages = [];
  for (let i = 0; i < n; i++) {
    const a = (i + 0.5) / n * 2 * Math.PI, ur = [Math.cos(a), Math.sin(a)], ut = [-ur[1], ur[0]];
    const q = (radial, travers) => [ur[0] * radial + ut[0] * travers, ur[1] * radial + ut[1] * travers];
    const h = hauteur / 2;
    percages.push([q(rf + h, -demiLargeur), q(rf + h, demiLargeur), q(rf - h / 3, demiLargeur), q(rf - h, 0),
      q(rf - h / 3, -demiLargeur)]);
  }
  const acier = o.extr(forme(T, cercle(0, 0, R, 128), [bord, ...percages]), EP, 'rotor');
  acier.position.set(c[0], c[1], plan);
  acier.name = 'piste';

  // Araignée : anneau central et six bras courbes jusqu'aux pattes, côté moyeu.
  const phi = (k, r) => angleBras(k) - balayage * D2R * (rivet - r) / (rivet - araignee);
  const w = r => r < araignee + 6 ? 5 + 3 * ((araignee + 6 - r) / 6) ** 2 : r < rivet - 4 ? 4 : 5;
  const contour = [];
  for (let k = 0; k < BRAS; k++) {
    for (let r = araignee; r <= rivet; r += 1.5) contour.push(pol(r, phi(k, r) - w(r) / r));
    for (let u = -1; u <= 1.0001; u += 0.25) contour.push(pol(rivet + 2 * Math.sqrt(1 - u * u), phi(k, rivet) + u * 5 / rivet));
    for (let r = rivet; r >= araignee; r -= 1.5) contour.push(pol(r, phi(k, r) + w(r) / r));
    const a0 = phi(k, araignee) + w(araignee) / araignee, a1 = phi(k + 1, araignee) - w(araignee) / araignee;
    for (let j = 1; j < 6; j++) contour.push(pol(araignee, a0 + (a1 - a0) * j / 6));
  }
  o.extr(forme(T, contour, [cercle(0, 0, PASSAGE, 48)]), epaisseurAraignee, 'rotorSpider')
    .position.set(c[0], c[1], plan + EP / 2 + epaisseurAraignee / 2);

  // Ailettes : une bande claire par intervalle entre deux bras, sous le bord intérieur de la piste.
  const [r0, r1] = ailettes.r;
  for (let k = 0; k < BRAS; k++) {
    const a0 = angleBras(k) + ailettes.ecartBras * D2R, a1 = angleBras(k + 1) - ailettes.ecartBras * D2R;
    const pts = [];
    for (let j = 0; j <= 16; j++) pts.push(pol(r1, a0 + (a1 - a0) * j / 16));
    for (let j = 16; j >= 0; j--) pts.push(pol(r0, a0 + (a1 - a0) * j / 16));
    o.extr(forme(T, pts), ailettes.epaisseur, 'rotor').position.set(c[0], c[1], plan);
  }
  for (let k = 0; k < BRAS; k++) {
    const [x, y] = pol(rivet, angleBras(k));
    o.tubeZ([c[0] + x, c[1] + y], plan - EP / 2 - 0.6, plan + EP / 2 + epaisseurAraignee + 0.6, 2.2, 'steel', 16);
  }
}

// Bague Center Lock, à l'extérieur du disque, à encoches extérieures.
function bague(o, { c, plan }) {
  const z1 = plan + EP / 2, z0 = z1 - BAGUE.epaisseur;
  const m = o.extr(o.engrenage(BAGUE.encoches, BAGUE.r + 1.5, BAGUE.r - 0.4, 13), BAGUE.epaisseur, 'steel');
  m.position.set(c[0], c[1], (z0 + z1) / 2);
  m.name = 'bague';
}

// Étrier flat mount : deux moitiés de part et d'autre du disque, avec le logement rond de leur piston, pont au-delà du
// bord du disque, axe de plaquettes, raccord de durite au bout `bout` (+1 ou -1 le long du disque), deux plaquettes à
// ailettes dans des groupes déplaçables. Renvoie le départ de la durite et la direction dans laquelle elle sort.
function etrier(o, c, deg, plan, nom, bout, enregistrer) {
  const T = o.THREE;
  const n = (m, x = nom) => { m.name = x; return m; };
  const rot = (deg + 90) * D2R, dehors = [Math.cos(deg * D2R), Math.sin(deg * D2R)], le = [Math.cos(rot), Math.sin(rot)];
  const a = (radial, long) => [c[0] + dehors[0] * radial + le[0] * long, c[1] + dehors[1] * radial + le[1] * long];
  const { moitie, ecartMoitie, pont, piston } = ETRIER;
  for (const dz of [-1, 1]) {
    n(o.rbox([...a(6, 0), plan + dz * ecartMoitie], moitie, rot, 'caliper', 5));
    // Logement du piston : un dôme rond sur la face de chaque moitié.
    const f = plan + dz * (ecartMoitie + moitie[2] / 2);
    n(o.tubeZ(a(piston.radial, 0), Math.min(f, f + dz * piston.saillie), Math.max(f, f + dz * piston.saillie),
      piston.rayon, 'caliper', 32), `${nom}, piston`);
  }
  n(o.rbox([...a(16, 0), plan], pont, rot, 'caliper', 4));
  n(o.boulon([...a(13, -10), plan - 18.4], [0, 0, 1], 2.8, 1.2, 'steel')); // tête de l'axe de plaquettes
  n(o.boulon([...a(23.5, -12), plan + 6], [dehors[0], dehors[1], 0], 2.2, 3, 'steel')); // vis de purge
  // Raccord de durite
  n(o.tube([...a(10, bout * 28), plan], [...a(10, bout * 36), plan], 4.5, 4.5, 'black', { seg: 16 }));
  n(o.boulon([...a(10, bout * 32), plan - 4.5], [0, 0, 1], 3.5, 1.5, 'steel'));

  // Plaquettes : plaque, garniture et ailette, une de chaque côté du disque. Dans le groupe, x va le long du disque et
  // y vers l'intérieur du disque : l'ailette, qui sort du corps vers l'extérieur, est en y négatif.
  const { plaque, garniture, ailette, nervures } = PLAQUETTE;
  for (const dz of [-1, 1]) {
    const g = o.sousGroupe();
    g.position.set(c[0], c[1], plan + dz * 3.3);
    g.rotation.z = rot;
    const morceaux = [
      [o.rbox([0, 0, dz * 1.6], plaque, 0, 'pad', 0.7), 'plaquette'],
      [o.rbox([0, 0, -dz * 0.5], garniture, 0, 'padFace', 0.9), 'plaquette'],
      [o.rbox([0, -ailette.centre, dz * 1.6], ailette.taille, 0, 'pad', 0.6), 'ailette'],
      ...nervures.map(y => [o.rbox([0, -y, dz * 2.8], [ailette.taille[0] - 2, 1.4, 2.4], 0, 'pad', 0.4), 'ailette']),
    ];
    for (const [m, x] of morceaux) { m.name = x; g.add(m); }
    if (enregistrer) PLAQUETTES.push({ groupe: g, base: g.position.clone(), dir: new T.Vector3(dehors[0], dehors[1], 0) });
  }
  return { depart: [...a(10, bout * 38), plan], sens: [le[0] * bout, le[1] * bout] };
}

// Durites, de l'étrier jusqu'au passage du fourreau gauche ou jusqu'à la base gauche dessinés par cadre.js.
function durites(o, p, fixAvant, fixArriere) {
  const { FA, RA, CROWN } = p;
  const pas = (q, s, l) => [q[0] + s[0] * l, q[1] + s[1] * l, q[2]];
  // Fourreau gauche : de l'axe avant vers la couronne. La durite quitte le raccord vers le haut, longe la face
  // intérieure du fourreau, passe derrière lui et rentre par son passage. Plus haut, elle est dans le fourreau.
  const d = [CROWN[0] - FA[0], CROWN[1] - FA[1]], l = Math.hypot(...d), u = [d[0] / l, d[1] / l];
  const derriere = [-u[1], u[0]]; // u monte vers la couronne : cette normale pointe vers l'arrière
  const leFourreau = (t, ecart, z) => [FA[0] + u[0] * l * t + derriere[0] * ecart, FA[1] + u[1] * l * t + derriere[1] * ecart, z];
  const P = PASSAGE_FOURREAU, f = fixAvant.depart;
  o.tubeCourbe([
    f, pas(f, fixAvant.sens, 10), leFourreau(P.t - 0.11, 16, -41), leFourreau(P.t - 0.04, P.ecart + 4, P.z + 4),
    leFourreau(P.t, P.ecart - 3, P.z),
  ], DURITE, 'hose', 40).name = 'durite';
  o.tube(leFourreau(P.t, P.ecart - 1, P.z), leFourreau(P.t, P.ecart + 1.5, P.z), P.rayon, P.rayon, 'black', { seg: 16 })
    .name = 'passage de durite';
  // Base gauche : la durite part de l'avant de l'étrier arrière et rentre dans la base un peu plus loin.
  const r = fixArriere.depart;
  const surBase = (x, y, z) => [RA[0] + x, RA[1] + y, z];
  o.tubeCourbe([r, pas(r, fixArriere.sens, 10), surBase(125, 5, -59), surBase(170, -1, -56), surBase(200, -10, -55)],
    DURITE, 'hose', 30).name = 'durite';
}
