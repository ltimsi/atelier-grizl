// Pièce 3D : disques Shimano SM-RT64 d'origine et Deore XT RT-MT800, étriers GRX flat mount, plaquettes, durites du
// cadre et de la fourche jusqu'aux étriers.
//
// Repère de geometrie.js, en millimètres : x vers l'avant, y vers le haut, z vers la droite du cycliste.
// Disques et étriers sont à gauche (z négatif). Leur position vient de GEO et de points() : CF, CR, plans des disques.
// Les cotes viennent de GEO et de COTES, chacune avec son document dans SOURCES. Les autres nombres de ce fichier sont
// des valeurs de dessin : bras, trous, ailettes, bagues, étriers, plaquettes, trajet des durites. META.approche les
// liste, sans chiffre.
// Zones : les deux disques et leurs bagues en zone 'disques', variante k = 0 pour le SM-RT64 et k = 1 pour le
// RT-MT800 ; l'étrier avant et ses plaquettes en zone 'etrier' ; l'étrier arrière sans zone ; les durites en zone
// 'manettes' (la tâche du poste de pilotage construit celles du cintre jusqu'au jeu de direction).
// Aucun import : le module ne reçoit que les outils de construction, les points et GEO.

const FICHE = 'canyon-4553';
const cote = (v, src) => Object.freeze({ v, src });

// Cotes publiées propres à ces pièces. Le diamètre des disques est dans GEO (diametreDisque).
export const COTES = Object.freeze({
  // « Rotor thickness : Standard 1.75 (mm) ». Le RT-MT800 figure parmi les disques d'épaisseur standard (C-461).
  epaisseurDisque: cote(1.75, 'shimano-sm-rt64'),
});
const EP = COTES.epaisseurDisque.v;

/**
 * Les deux plaquettes de l'étrier avant, pour l'animation de sortie de la scène.
 * Chaque `construire` vide ce tableau puis le remplit : il décrit toujours la dernière construction.
 * groupe : le THREE.Group d'une plaquette (plaque et garniture, zone 'etrier'), posé dans le groupe des outils.
 * base : sa position au repos, en mm. dir : vecteur unitaire qui sort du disque en passant par l'étrier.
 * La scène place le groupe en base + dir × course × t. La course est un choix d'affichage, pas une cote.
 * @type {{groupe: object, base: object, dir: object}[]}
 */
export const PLAQUETTES = [];

export const META = Object.freeze({
  id: 'freins',
  nom: 'Disques SM-RT64 et XT RT-MT800, étriers GRX, plaquettes et durites',
  zone: null, // trois zones selon les maillages : 'disques', 'etrier' et 'manettes'
  sources: Object.freeze([
    FICHE,
    'canyon-photo-4553-fv',
    'shimano-sm-rt64',
    'shimano-deore-xt-m8000',
    'shimano-c-461',
    'shimano-dm-hb0002',
    'shimano-rx610-2x12',
    'shimano-dm-gadbr01',
  ]),
  approche: Object.freeze([
    'Disque d’origine : piste en acier sur un support en aluminium peint, comme le dit la fiche Shimano. Bras, ' +
      'trous et rivets sont approchés d’après la photo officielle de Canyon.',
    'Disque XT : piste, araignée, rivets et ailettes de refroidissement en forme approchée. Les photos produit de ' +
      'Shimano n’étaient pas accessibles le jour du relevé.',
    'Épaisseur du disque XT : Shimano le range parmi les disques d’épaisseur standard. Il est dessiné à l’épaisseur ' +
      'standard donnée par la fiche du disque d’origine.',
    'Bagues Center Lock : forme approchée. Celle du XT est dessinée à denture extérieure, celle d’origine reste ' +
      'à identifier.',
    'Étriers GRX à fixation flat mount : Canyon ne donne pas le modèle. Forme approchée d’après la photo officielle, ' +
      'qui montre aussi leur place autour du moyeu.',
    'Plaquettes : forme approchée.',
    'Durites : grosseur et trajet le long de la fourche et de la base approchés. Aucune photo officielle ne montre ' +
      'le côté gauche du vélo.',
  ]),
  aVerifier: Object.freeze([
    'modèle exact de l\'étrier, à lire sur la pièce',
    'type de bague Center Lock d\'origine, à lire sur la pièce',
    'trajet des durites le long de la fourche et de la base, à regarder sur le vélo',
  ]),
});

// ---- Valeurs de dessin (approchées, voir META.approche) ----
const D2R = Math.PI / 180;
const BRAS = 6;
const RT64 = { piste: 63.5, pied: 25, rivet: 30.5, balayage: 18, trous: 36, support: 31.5, epaisseurSupport: 3.5 };
const MT800 = { piste: 64.5, patte: 57, rivet: 60.5, balayage: 22, araignee: 27, epaisseurAraignee: 3, ailettes: 5 };
const BAGUE = { r: 21, epaisseur: 6, encoches: 16 };
const PASSAGE = 18.7; // trou central du support : il coiffe les cannelures du moyeu
const DURITE = 2.6;

const pol = (r, a) => [r * Math.cos(a), r * Math.sin(a)];

/**
 * Ajoute au groupe des outils les disques des deux variantes, leurs bagues, les étriers, les plaquettes et les
 * durites du cadre. Les outils en ressortent sans zone ni variante. Vide puis remplit PLAQUETTES.
 * Noms des maillages que vérifient les tests : piste, étrier avant, étrier arrière, plaquette, durite.
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
    o.variante({ zone: 'disques', k: 0 });
    disqueRT64(o, d, R);
    bague(o, d, false);
    o.variante({ zone: 'disques', k: 1 });
    disqueMT800(o, d, R);
    bague(o, d, true);
  }
  o.variante(null);

  o.zone('etrier');
  const fixAvant = etrier(o, p.CF, geo.angleEtrierAvant.v, avant.plan, 'étrier avant', 1, true);
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

// SM-RT64 : piste et bras d'une pièce en acier, posés sur un support en aluminium noir, six rivets.
function disqueRT64(o, { c, plan }, R) {
  const T = o.THREE;
  const { piste, pied, rivet, balayage, trous, support, epaisseurSupport } = RT64;
  const phi = (k, r) => (k * 360 / BRAS + 15 + balayage * (r - pied) / (piste - pied)) * D2R;
  // Demi-largeur des bras : une patte ronde au pied, un bras fin, un congé qui s'évase vers la piste.
  const w = r => r < 34 ? 6.5 : r < 55 ? 6.5 - 2 * (r - 34) / 21 : 4.5 + 4.5 * ((r - 55) / (piste - 55)) ** 2;
  // Bord intérieur : arc de piste entre deux bras, puis chaque bras en descendant, sa patte et en remontant.
  const bord = [];
  for (let k = 0; k < BRAS; k++) {
    const a0 = phi(k - 1, piste) + w(piste) / piste, a1 = phi(k, piste) - w(piste) / piste;
    for (let j = 0; j <= 8; j++) bord.push(pol(piste, a0 + (a1 - a0) * j / 8));
    for (let r = piste - 1; r >= pied + 4; r -= 1.5) bord.push(pol(r, phi(k, r) - w(r) / r));
    for (let u = -1; u <= 1.0001; u += 0.25) bord.push(pol(pied + 4 - 4 * Math.sqrt(1 - u * u), phi(k, pied + 4) + u * w(pied + 4) / (pied + 4)));
    for (let r = pied + 4; r <= piste - 1; r += 1.5) bord.push(pol(r, phi(k, r) + w(r) / r));
  }
  // Trous de la piste : une rangée de trous de deux tailles, en alternance.
  const percages = [];
  for (let i = 0; i < trous; i++) {
    const a = (i + 0.5) / trous * 2 * Math.PI, [r, t] = i % 2 ? [70.3, 2.3] : [72.5, 2.8];
    percages.push(cercle(r * Math.cos(a), r * Math.sin(a), t, 16));
  }
  const acier = o.extr(forme(T, cercle(0, 0, R, 128), [bord, ...percages]), EP, 'rotor');
  acier.position.set(c[0], c[1], plan);
  acier.name = 'piste';
  // Support en aluminium, côté moyeu, et rivets
  const dedans = plan + EP / 2 + epaisseurSupport / 2;
  o.extr(forme(T, cercle(0, 0, support, 64), [cercle(0, 0, PASSAGE, 48)]), epaisseurSupport, 'rotorSpider')
    .position.set(c[0], c[1], dedans);
  for (let k = 0; k < BRAS; k++) {
    const [x, y] = pol(rivet, phi(k, rivet));
    o.tubeZ([c[0] + x, c[1] + y], plan - EP / 2 - 0.6, plan + EP / 2 + epaisseurSupport + 0.6, 2.4, 'steel', 16);
  }
}

// RT-MT800 : piste en acier à pattes de rivetage, araignée noire à six bras, ailettes FREEZA entre les bras.
function disqueMT800(o, { c, plan }, R) {
  const T = o.THREE;
  const { piste, patte, rivet, balayage, araignee, epaisseurAraignee, ailettes } = MT800;
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
  const percages = [];
  for (let i = 0; i < 72; i++) {
    const a = i / 72 * 2 * Math.PI, r = i % 2 ? 69.5 : 74.5;
    percages.push(cercle(r * Math.cos(a), r * Math.sin(a), 1.8, 12));
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

  // Ailettes : un peigne noir par intervalle entre deux pattes, dans le plan du disque.
  for (let k = 0; k < BRAS; k++) {
    const a0 = angleBras(k) + 9 * D2R, a1 = angleBras(k + 1) - 9 * D2R, demi = 1.4 * D2R;
    const pts = [];
    for (let j = 0; j <= 10; j++) pts.push(pol(piste + 0.1, a0 + (a1 - a0) * j / 10));
    pts.push(pol(60.5, a1));
    for (let i = ailettes - 1; i >= 0; i--) {
      const ac = a0 + (a1 - a0) * (i + 0.5) / ailettes;
      pts.push(pol(60.5, ac + demi), pol(54.5, ac + demi), pol(54.5, ac - demi), pol(60.5, ac - demi));
    }
    pts.push(pol(60.5, a0));
    o.extr(forme(T, pts), 2.6, 'rotorSpider').position.set(c[0], c[1], plan);
  }
  for (let k = 0; k < BRAS; k++) {
    const [x, y] = pol(rivet, angleBras(k));
    o.tubeZ([c[0] + x, c[1] + y], plan - EP / 2 - 0.6, plan + EP / 2 + epaisseurAraignee + 0.6, 2.2, 'steel', 16);
  }
}

// Bague Center Lock, à l'extérieur du disque : lisse pour l'origine, à encoches extérieures pour le XT.
function bague(o, { c, plan }, encoches) {
  const z1 = plan + EP / 2, z0 = z1 - BAGUE.epaisseur;
  if (!encoches) {
    o.tubeZ(c, z0, z1, BAGUE.r, 'steel', 48).name = 'bague';
    return;
  }
  const m = o.extr(o.engrenage(BAGUE.encoches, BAGUE.r + 1.5, BAGUE.r - 0.4, 13), BAGUE.epaisseur, 'steel');
  m.position.set(c[0], c[1], (z0 + z1) / 2);
  m.name = 'bague';
}

// Étrier flat mount : deux moitiés de part et d'autre du disque, pont au-delà du bord du disque, axe de plaquettes,
// raccord de durite au bout `bout` (+1 ou -1 le long du disque), deux plaquettes dans des groupes déplaçables.
// Renvoie le départ de la durite, la direction dans laquelle elle sort et un point qui contourne le bout de l'étrier.
function etrier(o, c, deg, plan, nom, bout, enregistrer) {
  const T = o.THREE;
  const n = m => { m.name = nom; return m; };
  const rot = (deg + 90) * D2R, dehors = [Math.cos(deg * D2R), Math.sin(deg * D2R)], le = [Math.cos(rot), Math.sin(rot)];
  const a = (radial, long) => [c[0] + dehors[0] * radial + le[0] * long, c[1] + dehors[1] * radial + le[1] * long];
  for (const dz of [-1, 1]) n(o.rbox([...a(6, 0), plan + dz * 12], [56, 32, 12], rot, 'caliper', 5));
  n(o.rbox([...a(16, 0), plan], [50, 14, 30], rot, 'caliper', 4));
  n(o.boulon([...a(13, 0), plan - 18.4], [0, 0, 1], 2.8, 1.2, 'steel')); // tête de l'axe de plaquettes
  n(o.boulon([...a(23.5, -12), plan + 6], [dehors[0], dehors[1], 0], 2.2, 3, 'steel')); // vis de purge
  // Raccord de durite
  n(o.tube([...a(10, bout * 28), plan], [...a(10, bout * 36), plan], 4.5, 4.5, 'black', { seg: 16 }));
  n(o.boulon([...a(10, bout * 32), plan - 4.5], [0, 0, 1], 3.5, 1.5, 'steel'));

  // Plaquettes : plaque et garniture, une de chaque côté du disque.
  for (const dz of [-1, 1]) {
    const g = o.sousGroupe();
    g.position.set(c[0], c[1], plan + dz * 3.3);
    g.rotation.z = rot;
    const plaque = o.rbox([0, 0, dz * 1.6], [34, 22, 1.6], 0, 'pad', 0.7);
    const garniture = o.rbox([0, 0, -dz * 0.5], [30, 16, 2.4], 0, 'padFace', 0.9);
    for (const m of [plaque, garniture]) { m.name = 'plaquette'; g.add(m); }
    if (enregistrer) PLAQUETTES.push({ groupe: g, base: g.position.clone(), dir: new T.Vector3(dehors[0], dehors[1], 0) });
  }
  return { depart: [...a(10, bout * 38), plan], sens: [le[0] * bout, le[1] * bout], contour: [...a(40, bout * 52), plan - 14] };
}

// Durites, de l'étrier jusqu'à l'entrée dans la fourche ou dans la base gauche dessinées par cadre.js.
function durites(o, p, fixAvant, fixArriere) {
  const { FA, RA, CROWN } = p;
  const pas = (q, s, l) => [q[0] + s[0] * l, q[1] + s[1] * l, q[2]];
  // Fourreau gauche : de l'axe avant vers la couronne. La durite le longe par derrière, puis entre sous la couronne.
  const d = [CROWN[0] - FA[0], CROWN[1] - FA[1]], l = Math.hypot(...d), u = [d[0] / l, d[1] / l];
  const derriere = [-u[1], u[0]]; // u monte vers la couronne : cette normale pointe vers l'arrière
  const leFourreau = (t, ecart, z) => [FA[0] + u[0] * l * t + derriere[0] * ecart, FA[1] + u[1] * l * t + derriere[1] * ecart, z];
  // Elle quitte le raccord dans le sens de l'étrier, contourne son bout par l'extérieur, puis remonte.
  const f = fixAvant.depart, { contour } = fixAvant;
  o.tubeCourbe([
    f, pas(f, fixAvant.sens, 12), contour, leFourreau(0.45, 28, -51), leFourreau(0.75, 29, -47), leFourreau(0.95, 30, -45),
    leFourreau(1, 18, -30),
  ], DURITE, 'hose', 60).name = 'durite';
  // Base gauche : la durite part de l'avant de l'étrier arrière et rentre dans la base un peu plus loin.
  const r = fixArriere.depart;
  const surBase = (x, y, z) => [RA[0] + x, RA[1] + y, z];
  o.tubeCourbe([r, pas(r, fixArriere.sens, 10), surBase(125, 5, -59), surBase(170, -1, -56), surBase(200, -10, -55)],
    DURITE, 'hose', 30).name = 'durite';
}
