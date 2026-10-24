// Pièce 3D : poste de pilotage d'origine du Grizl CF 8 Di2. Capot et entretoise du jeu de direction, potence Canyon
// ST0046, cintre Canyon HB0067 et son ruban Ergospeed Gel noir, embouts, manettes Shimano GRX Di2 (droite ST-RX825,
// gauche ST-RX825-L ou BL-RX825-L, à lire sur la pièce ; cocotte, levier de frein et palette), durites du cintre
// jusqu'au capot du jeu de direction. Les manettes passent les vitesses sans fil : aucune gaine ne part du cintre.
//
// Repère de geometrie.js, en millimètres : x vers l'avant, y vers le haut, z vers la droite du cycliste.
// Les cotes viennent de GEO, de points() et de COTES, chacune avec son document dans SOURCES. Les autres nombres de ce
// fichier sont des valeurs de dessin : formes de la potence, du capot, de la courbe du cintre, des cocottes et des
// leviers, épaisseur du ruban, trajet des durites. META.approche les liste, sans chiffre.
// Lu sur la photo officielle de profil (canyon-photo-4556-fv), à l'échelle de l'empattement : le profil de la cocotte
// (repose-main bas et long, haute corne à l'avant), le levier qui descend sous la corne, la palette plus petite derrière
// lui, et les durites qui sortent du ruban près de la potence pour plonger dans le capot du jeu de direction, devant le
// pivot, sous la potence.
//
// La main et la cocotte. Canyon publie la position de la main posée sur la cocotte (ancres.mains : reach et stack
// efficaces), sans dire quel point de la main il prend. Sur la photo officielle, ce point tombe au-dessus du
// repose-main, à peu près d'une épaisseur de main : la main est posée sur la cocotte. La cocotte est donc posée comme
// sur la photo : sa place sur la courbe du cintre et la rotation du cintre dans la potence sont lues sur la photo,
// pas calculées depuis la main. Le cintre est construit en arrière, depuis son collier dans la potence, avec le déport
// et la descente du marquage officiel.
// Zones : capot et entretoise du jeu de direction, potence, capuchon, cintre, ruban et embouts en zone 'poste' (atelier
// 1.3) ; cocottes, leviers, palettes et durites en zone 'manettes'.
// Aucun import : le module ne reçoit que les outils de construction, les points et GEO.

const FICHE = 'canyon-4556';
const MANETTE = 'shimano-st-rx825';
const cote = (v, src) => Object.freeze({ v, src });

// Cotes publiées propres à ces pièces. Potence, largeur, déport et descente du cintre sont dans GEO.
export const COTES = Object.freeze({
  collierCintre: cote(31.8, FICHE), // potence ST0046 et cintre HB0067 : « Diamètre Du Collier 31,8 mm »
  evasement: cote(16, 'canyon-hb0067'), // « Flare 16° », aussi marqué sur le cintre
  inclinaison: cote(5, 'canyon-hb0067'), // « Downsweep: 5° »
  largeurDrops: cote(510, 'canyon-hb0067'), // « 440mm (510mm in the drops) »
  collierCocotteMin: cote(23.8, MANETTE), // « Clamp band (mm) 23.8-24.2 »
  collierCocotteMax: cote(24.2, MANETTE),
});

export const META = Object.freeze({
  id: 'poste',
  nom: 'Jeu de direction, potence ST0046, cintre HB0067, ruban, manettes GRX Di2 (droite ST-RX825, gauche ' +
    'ST-RX825-L ou BL-RX825-L, à lire sur la pièce) et durites',
  zone: null, // deux zones selon les maillages : 'poste' (jeu de direction, potence, cintre) et 'manettes'
  sources: Object.freeze([
    FICHE,
    'canyon-photo-4556-fv',
    'canyon-geometrie-velo-route',
    'canyon-hb0067',
    'canyon-photo-hb0067-marquage',
    'canyon-photo-st0046',
    MANETTE,
    'shimano-gamme-rx820-1x12-di2',
    'shimano-dm-gadbr10',
  ]),
  approche: Object.freeze([
    'Point de la main : Canyon ne dit pas quel point de la main il prend. La main publiée tombe au-dessus du ' +
      'repose-main, à peu près d’une épaisseur de main, là où la main se pose sur la photo officielle.',
    'Cocottes : Shimano ne publie pas leurs cotes. Repose-main et corne en forme approchée d’après la photo officielle ' +
      'du vélo. La cocotte gauche est dessinée comme la droite. Les nervures et le marquage du repose-main ne sont pas ' +
      'dessinés.',
    'Leviers : levier de frein et palette plus petite derrière lui, en forme approchée d’après la photo officielle du ' +
      'vélo, des deux côtés. La zone striée du levier n’est pas dessinée.',
    'Couleur de la palette : plus claire sur la photo officielle, elle est dessinée en noir mat.',
    'Place des cocottes sur la courbe du cintre et rotation du cintre dans la potence : non publiées. Elles sont lues ' +
      'sur la photo officielle du vélo.',
    'Inclinaison des cocottes : sur la photo officielle, le repose-main ne penche que d’un à deux degrés. Ici, il ' +
      'penche d’environ six degrés et demi. L’écart vient de la courbe du cintre et de la hauteur de la ' +
      'potence, approchées.',
    'Courbe du cintre : seuls le déport, la descente, l’évasement, l’inclinaison et les largeurs sont publiés. ' +
      'La forme de la courbe et la longueur des drops sont approchées.',
    'Inclinaison de la partie haute du cintre : Canyon la donne sans dessin. Elle est dessinée vers le bas, du ' +
      'collier vers les cocottes.',
    'Ruban : épaisseur et début du ruban approchés.',
    'Potence : longueur et angle publiés. Corps, capot de serrage et vis approchés d’après la photo officielle.',
    'Capot et entretoise du jeu de direction : formes et hauteurs approchées. Le nombre d’entretoises n’est pas publié.',
    'Durites : grosseur et trajet approchés. Elles longent le cintre sous le ruban, en sortent près de la potence et ' +
      'entrent dans le capot du jeu de direction, devant le pivot, comme sur la photo officielle.',
  ]),
  aVerifier: Object.freeze([
    'manette gauche : avec ou sans boutons de vitesses, la fiche ne donne pas sa référence complète, à lire sur la pièce',
    'point de la main publié par Canyon : il tombe au-dessus du repose-main, là où se pose la main. La pose des ' +
      'cocottes est lue sur la photo officielle, à regarder sur le vélo',
    'sens de montage de la potence, à regarder sur le vélo',
  ]),
});

// ---- Valeurs de dessin (approchées, voir META.approche) ----
const D2R = Math.PI / 180;
// Cintre : demi-longueur du collier de 31,8, début du ruban, fin de la partie haute, demi-axe avant de la courbe,
// bout des drops dans le repère du cintre, épaisseur du ruban.
const CINTRE = { collier: 47, ruban: 70, finHaut: 140, demiAxeAvant: 50, zCourbe: 196, bout: -40, epRuban: 2.5 };
// Rayon du cintre sous les cocottes (milieu de la plage du collier Shimano), plus le ruban.
const RAYON_RUBAN = (COTES.collierCocotteMin.v + COTES.collierCocotteMax.v) / 4 + CINTRE.epRuban;
// Cocotte : sections le long de la cocotte depuis le collier, sur l'axe du cintre. [x, dessus, dessous, demi-largeur].
// COCOTTE, LEVIER et poseCintre sont exportés pour le schéma 2D (schema2d.js), qui dessine le même poste de profil.
// ST-RX825, de profil sur la photo : un repose-main bas et long sur le cintre, qui monte vers une haute corne arrondie,
// puis le levier sous la corne. PRISE : le point du repose-main où la main se pose, sous la main publiée.
// Pose lue sur la photo officielle : place du collier de la cocotte sur la courbe du cintre (angle t de la courbe) et
// rotation du cintre dans la potence, en degrés. CALAGE : angle entre la cocotte et le cintre à son collier, en degrés.
// Les trois repères de la cocotte (arrière du repose-main, sommet de la corne, nez) tombent ainsi à environ quinze
// millimètres de leur place sur la photo, une fois corrigée la perspective.
const PRISE = [31, 23];
const POSE = { surCourbe: 43.5, roulis: 4 };
const CALAGE = 54;
export const COCOTTE = [
  [-14, 12, -8, 10],
  [-4, 18, -13, 14],
  [8, 21, -16, 15.5],
  [20, 22.5, -18.5, 16],
  [PRISE[0], PRISE[1], -19.5, 16.5],
  [42, 24.5, -19.5, 16.5],
  [52, 27.5, -18.5, 16.5],
  [60, 31, -17, 16],
  [67, 36, -15, 15.5],
  [73, 42.5, -13, 14],
  [79, 48.5, -10, 12.5],
  [87, 51, -6.5, 11.5],
  [95, 49, -2, 10.5],
  [102, 42, 2, 9],
  [108, 31, 5.5, 7],
  [111, 18, 7.5, 4.5],
];
// Leviers, dans le repère de la cocotte : le levier de frein sous la corne, puis la palette, plus petite, derrière lui.
export const LEVIER = [[103, 3], [106, -12], [105, -36], [101, -58], [95, -77], [90, -88]];
const PALETTE = [[88, -2], [87, -26], [83, -48], [77, -66], [73, -76]];
// Potence et jeu de direction, le long du pivot depuis le haut de la douille.
const POTENCE = { serrage: 21, rayonSerrage: 21, rayonCollier: 21.5, demiCollier: 22, capot: 10, bouchon: 4 };
const DURITE = 2.6;
// Entrée des durites dans le capot du jeu de direction : le long du pivot depuis le haut de la douille, devant le pivot,
// et l'écart de chaque durite au plan du vélo.
const ENTREE = { hauteur: 9, avance: 17, z: 5 };

const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const mul = (a, k) => [a[0] * k, a[1] * k];
const rot = (a, t) => [a[0] * Math.cos(t) - a[1] * Math.sin(t), a[0] * Math.sin(t) + a[1] * Math.cos(t)];
const v = (q, z = 0) => [q[0], q[1], z];

/**
 * Ajoute au groupe des outils le jeu de direction, la potence, le cintre, le ruban, les embouts, les cocottes, les
 * leviers, les palettes et les durites. Les outils en ressortent sans zone.
 * Noms des maillages que vérifient les tests : cocotte droite, cocotte gauche, levier, palette, durite, collier du
 * cintre, embout de cintre. Les autres : cintre, potence, jeu de direction.
 * @param {object} o Les outils de creerOutils.
 * @param {object} p Les points de points(geo).
 * @param {object} geo GEO, ou un objet de même forme.
 * @returns {void}
 */
export function construire(o, p, geo) {
  o.zone('poste');
  directionEtPotence(o, p);
  const pose = poseCintre(p, geo);
  const cotes = [1, -1].map(s => ({ s, pts: pose.points.map(([x, y, z]) => [x, y, s * z]) }));
  for (const { pts } of cotes) cintre(o, p, pts);

  o.zone('manettes');
  for (const { s } of cotes) cocotte(o, pose, s, p);
  for (const { s, pts } of cotes) durites(o, p, pts, pose.iCollier, s);
  o.zone(null);
}

// Capot, entretoise, potence, capot de serrage, vis et bouchon.
function directionEtPotence(o, p) {
  const { HTt, S0, S1, dHT } = p;
  const le = (k, q = HTt) => add(q, mul(dHT, k));
  const arriere = [-dHT[1], dHT[0]]; // perpendiculaire au pivot, vers l'arrière
  const jeu = m => { m.name = 'jeu de direction'; return m; };
  const potence = m => { m.name = 'potence'; return m; };

  // Capot conique sur la douille, entrée des durites devant le pivot, entretoise jusqu'à la potence.
  jeu(o.tube(v(HTt), v(le(POTENCE.capot)), 26.5, 21.5, 'black', { seg: 44 }));
  const entree = add(le(ENTREE.hauteur - 1), mul(arriere, -ENTREE.avance));
  jeu(o.rbox(v(entree), [12, 10, 24], Math.atan2(dHT[1], dHT[0]) - Math.PI / 2, 'black', 3));
  const basPotence = le(-POTENCE.serrage, S0);
  if (Math.hypot(...sub(basPotence, le(POTENCE.capot))) > 0.5) {
    jeu(o.tube(v(le(POTENCE.capot)), v(basPotence), 18.5, 18.5, 'black', { seg: 40 }));
  }

  // Potence : serrage sur le pivot, corps, collier du cintre, capot avant à quatre vis, deux vis de serrage à l'arrière.
  const u = sub(S1, S0), l = Math.hypot(...u);
  const du = mul(u, 1 / l), nu = [-du[1], du[0]];
  const rS = POTENCE.rayonSerrage;
  potence(o.tube(v(basPotence), v(le(POTENCE.serrage, S0)), rS, rS, 'black', { seg: 44 }));
  potence(o.tube(v(add(S0, mul(du, 12))), v(add(S1, mul(du, -14))), 15.5, 14, 'black', { sz: 1.35, seg: 36 }));
  potence(o.tubeZ(S1, -POTENCE.demiCollier, POTENCE.demiCollier, POTENCE.rayonCollier, 'black', 44));
  const face = add(S1, mul(du, POTENCE.rayonCollier - 2));
  potence(o.rbox(v(face), [9, 44, 2 * POTENCE.demiCollier], Math.atan2(du[1], du[0]), 'black', 3));
  for (const k of [-13, 13]) for (const z of [-14, 14]) {
    potence(o.boulon(v(add(add(face, mul(du, 4.6)), mul(nu, k)), z), [du[0], du[1], 0], 2.8, 1.6, 'steel'));
  }
  const oreille = add(S0, mul(arriere, POTENCE.rayonSerrage + 3));
  potence(o.rbox(v(oreille), [10, 34, 22], Math.atan2(dHT[1], dHT[0]) - Math.PI / 2, 'black', 3));
  for (const k of [-8, 8]) potence(o.boulon(v(add(oreille, mul(dHT, k))), [0, 0, 1], 3, 26, 'steel'));
  // Bouchon de direction sur la potence, et sa vis.
  const haut = le(POTENCE.serrage, S0);
  potence(o.tube(v(haut), v(le(POTENCE.bouchon, haut)), 17.5, 16, 'black', { seg: 40 }));
  potence(o.boulon(v(le(POTENCE.bouchon + 0.6, haut)), [dHT[0], dHT[1], 0], 4, 1.2, 'steel'));
}

/**
 * Pose du cintre et de la cocotte droite. Dans le repère du cintre (origine au centre du collier, x vers l'avant),
 * la courbe avant est une demi-ellipse : son point le plus en avant est au déport, son bas à la descente.
 * La cocotte est posée sur cette courbe et le cintre tourné dans la potence comme sur la photo officielle (POSE).
 * La main publiée, ancres.mains, tombe alors au-dessus du repose-main. Renvoie les points de l'axe du cintre droit
 * (dans le repère du vélo), l'indice du point du collier de la cocotte, la position et l'angle de la cocotte.
 */
export function poseCintre(p, geo) {
  const D = geo.deportCintre.v, H = geo.descenteCintre.v, zCocotte = geo.largeurCintre.v / 2;
  const pente = Math.tan(COTES.inclinaison.v * D2R), flare = Math.tan(COTES.evasement.v * D2R);
  const yHaut = z => -Math.max(0, z - CINTRE.collier) * pente;
  const yDessus = yHaut(CINTRE.finHaut) - 1;
  const a = CINTRE.demiAxeAvant, b = (H + yDessus) / 2, O = [D - a, yDessus - b];
  const courbe = t => [O[0] + a * Math.cos(t), O[1] + b * Math.sin(t)];
  const cap = t => Math.atan2(-b * Math.cos(t), a * Math.sin(t)); // direction du cintre qui descend
  const tC = POSE.surCourbe * D2R, C = courbe(tC), roulis = POSE.roulis * D2R;

  // Axe du cintre droit : partie haute, avancée vers la courbe, courbe avant, drops. z vaut la demi-largeur publiée
  // au collier de la cocotte, puis s'ouvre de l'évasement sous la cocotte jusqu'à la demi-largeur des drops au bout.
  const zSous = y => zCocotte + (C[1] - y) * flare;
  const pts = [];
  for (const z of [CINTRE.ruban, (CINTRE.ruban + CINTRE.finHaut) / 2, CINTRE.finHaut]) pts.push([0, yHaut(z), z]);
  pts.push([O[0] * 0.45, yDessus + 0.4, (CINTRE.finHaut + CINTRE.zCourbe) / 2 + 4]);
  const degC = tC / D2R;
  // Du haut de la courbe vers le bas des drops, dans l'ordre, quelle que soit la place de la cocotte.
  const angles = [90, 75, degC, 25, 0, -25, -50, -72, -90].filter(t => t === degC || Math.abs(t - degC) > 6)
    .sort((u, w) => w - u);
  let iCollier = -1;
  for (const deg of angles) {
    const t = deg * D2R, q = courbe(t);
    if (deg === degC) iCollier = pts.length;
    const z = t >= tC
      ? CINTRE.zCourbe + (zCocotte - CINTRE.zCourbe) * (1 - Math.sin(t)) / (1 - Math.sin(tC))
      : zSous(q[1]);
    pts.push([q[0], q[1], z]);
  }
  const zBas = zSous(-H);
  pts.push([O[0] - 22, -H + 0.5, zBas + 1.5]);
  pts.push([CINTRE.bout, -H + 2.5, COTES.largeurDrops.v / 2]);

  const versVelo = ([x, y, z]) => [...add(p.S1, rot([x, y], roulis)), z];
  return {
    points: pts.map(versVelo),
    iCollier,
    collier: add(p.S1, rot(C, roulis)),
    angle: cap(tC) + CALAGE * D2R + roulis,
    local: { courbe, cap, tC },
  };
}

// Collier de 31,8, raccord jusqu'au ruban, ruban sur tout le cintre, embout au bout du drop.
function cintre(o, p, pts) {
  const s = Math.sign(pts[0][2]);
  const rCollier = COTES.collierCintre.v / 2;
  if (s > 0) {
    const collier = o.tubeZ(p.S1, -CINTRE.collier, CINTRE.collier, rCollier, 'black', 44);
    collier.name = 'collier du cintre';
  }
  const debut = [p.S1[0], p.S1[1], s * CINTRE.collier];
  o.tube(debut, pts[0], rCollier, RAYON_RUBAN - CINTRE.epRuban, 'black', { seg: 32 }).name = 'cintre';
  o.tubeCourbe(pts, RAYON_RUBAN, 'tape', 160).name = 'cintre';
  const fin = pts[pts.length - 1], avant = pts[pts.length - 2];
  const d = fin.map((x, i) => x - avant[i]), l = Math.hypot(...d), u = d.map(x => x / l);
  const [e0, e1] = [-0.5, 4.5].map(k => fin.map((x, i) => x + u[i] * k));
  o.tube(e0, e1, RAYON_RUBAN + 0.3, RAYON_RUBAN + 0.3, 'black', { seg: 32 }).name = 'embout de cintre';
}

// Cocotte, levier de frein et palette.
// L'arrière de la cocotte serre le cintre au plus près.
function cocotte(o, pose, s, p) {
  const T = o.THREE;
  const zMilieu = s * p.ancres.mains[2];
  const nom = s > 0 ? 'cocotte droite' : 'cocotte gauche';
  // Le cintre dans le repère de la cocotte, pour que l'arrière de la cocotte l'entoure.
  const { courbe, cap, tC } = pose.local;
  const C = courbe(tC), a = -(cap(tC) + CALAGE * D2R);
  const axe = [];
  for (let t = tC - 50 * D2R; t <= Math.PI / 2; t += D2R) axe.push(rot(sub(courbe(t), C), a));
  const yAxe = x => {
    for (let i = 0; i < axe.length - 1; i++) {
      const [p0, p1] = [axe[i], axe[i + 1]];
      if ((p0[0] - x) * (p1[0] - x) > 0 || p0[0] === p1[0]) continue;
      return p0[1] + (p1[1] - p0[1]) * (x - p0[0]) / (p1[0] - p0[0]);
    }
    return null;
  };
  const sections = COCOTTE.map(([x, dessus, dessous, demi]) => {
    const y = x <= 6 ? yAxe(x) : null;
    if (y === null) return [x, dessus, dessous, demi];
    return [x, Math.max(dessus, y + RAYON_RUBAN + 2), y - RAYON_RUBAN - 2, Math.max(demi, RAYON_RUBAN + 2)];
  });
  const corps = o.mesh(volume(T, sections), 'hood');
  const placer = m => {
    m.position.set(pose.collier[0], pose.collier[1], zMilieu);
    m.rotation.z = pose.angle;
    return m;
  };
  placer(corps).name = nom;

  // Leviers : une lame qui suit le chemin, épaisse dans le plan du vélo, fine en travers.
  const lame = (chemin, z, demiEpaisseur, demiLargeur, role, nomLame) => {
    const forme = new T.Shape();
    forme.moveTo(-demiEpaisseur, -demiLargeur);
    forme.lineTo(demiEpaisseur, -demiLargeur);
    forme.lineTo(demiEpaisseur, demiLargeur);
    forme.lineTo(-demiEpaisseur, demiLargeur);
    forme.closePath();
    const trajet = new T.CatmullRomCurve3(chemin.map(([x, y]) => new T.Vector3(x, y, z)));
    const m = o.mesh(new T.ExtrudeGeometry(forme, { steps: 40, bevelEnabled: false, extrudePath: trajet }), role);
    placer(m).name = nomLame;
  };
  lame(LEVIER, 0, 3.5, 8, 'black', 'levier');
  lame(PALETTE, -s * 3, 2.5, 5, 'hood', 'palette');
}

// Volume d'une cocotte : sections superelliptiques, lissées en Catmull-Rom, fermées aux deux bouts.
// Chaque section a un sommet exactement en haut, au milieu. Celui de la section PRISE est le point du repose-main
// sous la main publiée : la main est posée au-dessus, à peu près d'une épaisseur de main (voir l'en-tête).
function volume(T, cles, n = 24, e = 2.6) {
  const lisse = [];
  const at = i => cles[Math.max(0, Math.min(cles.length - 1, i))];
  for (let i = 0; i < cles.length - 1; i++) for (let k = 0; k < 3; k++) {
    const t = k / 3, [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    lisse.push(p1.map((_, j) => 0.5 * (2 * p1[j] + (p2[j] - p0[j]) * t
      + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t * t + (3 * p1[j] - p0[j] - 3 * p2[j] + p3[j]) * t * t * t)));
  }
  lisse.push(cles[cles.length - 1]);
  const puiss = x => Math.sign(x) * Math.abs(x) ** (2 / e);
  const pos = [], idx = [];
  for (const [x, dessus, dessous, demi] of lisse) {
    const cy = (dessus + dessous) / 2, hh = (dessus - dessous) / 2;
    for (let j = 0; j < n; j++) {
      const t = 2 * Math.PI * j / n;
      pos.push(x, j === n / 4 ? dessus : cy + hh * puiss(Math.sin(t)), j === n / 4 ? 0 : demi * puiss(Math.cos(t)));
    }
  }
  const S = lisse.length;
  for (let i = 0; i < S - 1; i++) for (let j = 0; j < n; j++) {
    const a = i * n + j, b = i * n + (j + 1) % n, c = (i + 1) * n + j, d = (i + 1) * n + (j + 1) % n;
    idx.push(a, c, d, a, d, b); // faces tournées vers l'extérieur
  }
  const bouts = [[0, lisse[0]], [S - 1, lisse[S - 1]]];
  for (const [i, [x, dessus, dessous]] of bouts) {
    const centre = pos.length / 3;
    pos.push(x, (dessus + dessous) / 2, 0);
    for (let j = 0; j < n; j++) {
      const a = i * n + j, b = i * n + (j + 1) % n;
      if (i === 0) idx.push(centre, b, a); else idx.push(centre, a, b);
    }
  }
  const g = new T.BufferGeometry();
  g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// Durite de frein : de la cocotte le long du cintre, sous le ruban, jusqu'au début du ruban, puis vers le bas, sous la
// potence, jusqu'à l'entrée du capot du jeu de direction, devant le pivot.
function durites(o, p, pts, iCollier, s) {
  const T = o.THREE;
  const axe = new T.CatmullRomCurve3(pts.map(q => new T.Vector3(...q)));
  const { HTt, dHT } = p;
  const arriere = [-dHT[1], dHT[0]];
  const le = (k, r) => add(add(HTt, mul(dHT, k)), mul(arriere, r));
  const trace = (vers, zEntree, role, nom) => {
    const w = new T.Vector3(...vers, 0).normalize(), q = [];
    const tC = iCollier / (pts.length - 1);
    for (let i = 0; i <= 20; i++) {
      const t = tC * (1 - i / 20);
      const c = axe.getPoint(t), d = axe.getTangent(t);
      const off = w.clone().addScaledVector(d, -w.dot(d)).normalize().multiplyScalar(RAYON_RUBAN - 0.6);
      q.push(c.add(off).toArray());
    }
    const sortie = q[q.length - 1];
    q.push([sortie[0] - 4, sortie[1] - 14, sortie[2] - s * 18]);
    q.push(v(le(30, -26), s * 26), v(le(17, -ENTREE.avance - 3), s * (zEntree + 5)),
      v(le(ENTREE.hauteur + 1, -ENTREE.avance), s * zEntree));
    const m = o.tubeCourbe(q, DURITE, role, 90);
    m.name = nom;
    return m;
  };
  trace([-0.45, -0.89], ENTREE.z, 'hose', 'durite');
}
