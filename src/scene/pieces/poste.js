// Pièce 3D : poste de pilotage d'origine. Capot et entretoise du jeu de direction, potence Canyon ST0046, cintre Canyon
// HB0067 et son ruban Ergospeed Gel noir, embouts, cocottes Shimano GRX ST-RX610-R à droite et BL-RX610-L à gauche,
// leviers, durites du cintre jusqu'au capot du jeu de direction et gaine du dérailleur.
//
// Repère de geometrie.js, en millimètres : x vers l'avant, y vers le haut, z vers la droite du cycliste.
// Les cotes viennent de GEO, de points() et de COTES, chacune avec son document dans SOURCES. Les autres nombres de ce
// fichier sont des valeurs de dessin : formes de la potence, du capot, de la courbe du cintre, des cocottes et des
// leviers, épaisseur du ruban, trajet des durites. META.approche les liste, sans chiffre.
//
// La main d'abord. Canyon publie la position de la main sur la cocotte droite (ancres.mains : reach et stack
// efficaces). La cocotte est posée pour que son point de saisie tombe exactement là. Le cintre est ensuite construit
// en arrière, depuis son collier dans la potence, avec le déport et la descente du marquage officiel. Deux réglages
// non publiés rattrapent l'écart : la place de la cocotte sur la courbe du cintre et la rotation du cintre dans la
// potence. Ils sont calculés, pas choisis.
// Zones : cocottes, leviers et durites en zone 'manettes' ; le reste sans zone. Aucune variante.
// Aucun import : le module ne reçoit que les outils de construction, les points et GEO.

const FICHE = 'canyon-4553';
const cote = (v, src) => Object.freeze({ v, src });

// Cotes publiées propres à ces pièces. Potence, largeur, déport et descente du cintre sont dans GEO.
export const COTES = Object.freeze({
  collierCintre: cote(31.8, FICHE), // potence ST0046 et cintre HB0067 : « Diamètre Du Collier 31,8 mm »
  evasement: cote(16, 'canyon-hb0067'), // « Flare 16° », aussi marqué sur le cintre
  inclinaison: cote(5, 'canyon-hb0067'), // « Downsweep: 5° »
  largeurDrops: cote(510, 'canyon-hb0067'), // « 440mm (510mm in the drops) »
  collierCocotteMin: cote(23.8, 'shimano-st-rx610-r'), // « Clamp band / Diameter (mm) 23.8-24.2 »
  collierCocotteMax: cote(24.2, 'shimano-st-rx610-r'),
});

export const META = Object.freeze({
  id: 'poste',
  nom: 'Jeu de direction, potence ST0046, cintre HB0067, ruban, cocottes GRX, leviers et durites',
  zone: null, // cocottes, leviers et durites en zone 'manettes', le reste sans zone
  sources: Object.freeze([
    FICHE,
    'canyon-photo-4553-fv',
    'canyon-geometrie-velo-route',
    'canyon-hb0067',
    'canyon-photo-hb0067-marquage',
    'canyon-photo-st0046',
    'shimano-rx610-1x12',
    'shimano-st-rx610-r',
    'shimano-bl-rx610-l',
  ]),
  approche: Object.freeze([
    'Point de saisie de la cocotte : Canyon ne le précise pas. Il est pris sur le dessus de la cocotte, au plat où ' +
      'se pose la main, avant la corne.',
    'Cocottes : forme approchée d’après la photo officielle du vélo. Les photos produit de Shimano ne sont pas ' +
      'consultables. La cocotte gauche est dessinée comme la droite.',
    'Leviers : forme approchée d’après la photo officielle du vélo. Le petit levier de la manette droite est approché.',
    'Place des cocottes sur la courbe du cintre et rotation du cintre dans la potence : non publiées. Elles sont ' +
      'calculées pour que la main tombe au point publié par Canyon.',
    'Courbe du cintre : seuls le déport, la descente, l’évasement, l’inclinaison et les largeurs sont publiés. ' +
      'La forme de la courbe et la longueur des drops sont approchées.',
    'Inclinaison de la partie haute du cintre : Canyon la donne sans dessin. Elle est dessinée vers le bas, du ' +
      'collier vers les cocottes.',
    'Ruban : épaisseur et début du ruban approchés.',
    'Potence : longueur et angle publiés. Corps, capot de serrage et vis approchés d’après la photo officielle.',
    'Capot et entretoise du jeu de direction : formes et hauteurs approchées. Le nombre d’entretoises n’est pas publié.',
    'Durites et gaine : grosseur et trajet approchés. Elles longent le cintre sous le ruban et entrent dans le capot ' +
      'du jeu de direction, comme sur la photo officielle.',
  ]),
  aVerifier: Object.freeze([
    'référence du levier gauche : la fiche ne donne pas sa référence complète, à lire sur la pièce',
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
// La main se pose au plat, PRISE. CALAGE : angle entre la cocotte et le cintre à son collier, en degrés.
const PRISE = [42, 48];
const CALAGE = 40;
const COCOTTE = [
  [-24, 13, -9, 10],
  [-15, 35, -15, 14.5],
  [-4, 42, -17.5, 16],
  [9, 46, -17, 16.5],
  [24, 47.5, -14, 17],
  [PRISE[0], PRISE[1], -9, 17],
  [58, 50, -3, 16],
  [70, 56, 2, 14.5],
  [80, 64, 6, 13],
  [88, 70, 10, 11.5],
  [94, 71, 16, 10],
  [98.5, 65, 24, 8],
  [101, 54, 33, 5.5],
];
// Leviers, dans le repère de la cocotte : le grand levier de frein, puis le petit levier de la manette droite.
const LEVIER = [[82, 12], [88, -10], [92, -40], [90, -70], [83, -96], [75, -110]];
const PETIT_LEVIER = [[78, 8], [84, -16], [86, -40]];
// Potence et jeu de direction, le long du pivot depuis le haut de la douille.
const POTENCE = { serrage: 21, rayonSerrage: 21, rayonCollier: 21.5, demiCollier: 22, capot: 10, bouchon: 4 };
const DURITE = 2.6;
const ENTREE = { hauteur: 6, recul: 21 }; // entrée des durites à l'arrière du capot du jeu de direction

const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const mul = (a, k) => [a[0] * k, a[1] * k];
const rot = (a, t) => [a[0] * Math.cos(t) - a[1] * Math.sin(t), a[0] * Math.sin(t) + a[1] * Math.cos(t)];
const v = (q, z = 0) => [q[0], q[1], z];

/**
 * Ajoute au groupe des outils le jeu de direction, la potence, le cintre, le ruban, les embouts, les cocottes, les
 * leviers, les durites et la gaine du cintre. Les outils en ressortent sans zone ni variante.
 * Noms des maillages que vérifient les tests : cocotte droite, cocotte gauche, levier, durite, collier du cintre,
 * embout de cintre. Les autres : cintre, potence, jeu de direction, gaine.
 * @param {object} o Les outils de creerOutils.
 * @param {object} p Les points de points(geo).
 * @param {object} geo GEO, ou un objet de même forme.
 * @returns {void}
 */
export function construire(o, p, geo) {
  o.zone(null);
  o.variante(null);
  directionEtPotence(o, p);
  const pose = poseCintre(p, geo);
  const cotes = [1, -1].map(s => ({ s, pts: pose.points.map(([x, y, z]) => [x, y, s * z]) }));
  for (const { pts } of cotes) cintre(o, p, pts);

  o.zone('manettes');
  for (const { s } of cotes) cocotte(o, pose, s, p);
  for (const { s, pts } of cotes) durites(o, p, pts, pose.iCollier, s);
  o.zone(null);
  o.variante(null);
}

// Capot, entretoise, potence, capot de serrage, vis et bouchon.
function directionEtPotence(o, p) {
  const { HTt, S0, S1, dHT } = p;
  const le = (k, q = HTt) => add(q, mul(dHT, k));
  const arriere = [-dHT[1], dHT[0]]; // perpendiculaire au pivot, vers l'arrière
  const jeu = m => { m.name = 'jeu de direction'; return m; };
  const potence = m => { m.name = 'potence'; return m; };

  // Capot conique sur la douille, entrée des durites à l'arrière, entretoise jusqu'à la potence.
  jeu(o.tube(v(HTt), v(le(POTENCE.capot)), 26.5, 21.5, 'black', { seg: 44 }));
  const entree = add(le(ENTREE.hauteur), mul(arriere, ENTREE.recul - 3));
  jeu(o.rbox(v(entree), [12, 11, 30], Math.atan2(dHT[1], dHT[0]) - Math.PI / 2, 'black', 3));
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
 * On cherche la place de la cocotte sur cette courbe, puis la rotation du cintre, pour que le point de saisie de la
 * cocotte tombe sur ancres.mains. Renvoie les points de l'axe du cintre droit (dans le repère du vélo), l'indice du
 * point du collier de la cocotte, la position et l'angle de la cocotte.
 */
function poseCintre(p, geo) {
  const D = geo.deportCintre.v, H = geo.descenteCintre.v, zCocotte = geo.largeurCintre.v / 2;
  const pente = Math.tan(COTES.inclinaison.v * D2R), flare = Math.tan(COTES.evasement.v * D2R);
  const yHaut = z => -Math.max(0, z - CINTRE.collier) * pente;
  const yDessus = yHaut(CINTRE.finHaut) - 1;
  const a = CINTRE.demiAxeAvant, b = (H + yDessus) / 2, O = [D - a, yDessus - b];
  const courbe = t => [O[0] + a * Math.cos(t), O[1] + b * Math.sin(t)];
  const cap = t => Math.atan2(-b * Math.cos(t), a * Math.sin(t)); // direction du cintre qui descend
  const prise = t => add(courbe(t), rot(PRISE, cap(t) + CALAGE * D2R));

  // Place de la cocotte : la distance de la prise au collier doit être celle de la main au collier.
  const G = p.ancres.mains, vers = sub(G, p.S1), d = Math.hypot(...vers);
  const ecart = t => Math.hypot(...prise(t)) - d;
  let t0 = 20 * D2R, t1 = 88 * D2R;
  if (ecart(t0) * ecart(t1) > 0) throw new Error('poste : la main publiée est hors de portée de la cocotte dessinée');
  for (let i = 0; i < 60; i++) {
    const m = (t0 + t1) / 2;
    if (ecart(t0) * ecart(m) <= 0) t1 = m; else t0 = m;
  }
  const tC = (t0 + t1) / 2, C = courbe(tC);
  const roulis = Math.atan2(vers[1], vers[0]) - Math.atan2(...prise(tC).slice().reverse());

  // Axe du cintre droit : partie haute, avancée vers la courbe, courbe avant, drops. z vaut la demi-largeur publiée
  // au collier de la cocotte, puis s'ouvre de l'évasement sous la cocotte jusqu'à la demi-largeur des drops au bout.
  const zSous = y => zCocotte + (C[1] - y) * flare;
  const pts = [];
  for (const z of [CINTRE.ruban, (CINTRE.ruban + CINTRE.finHaut) / 2, CINTRE.finHaut]) pts.push([0, yHaut(z), z]);
  pts.push([O[0] * 0.45, yDessus + 0.4, (CINTRE.finHaut + CINTRE.zCourbe) / 2 + 4]);
  const degC = tC / D2R;
  const angles = [90, 75, degC, 25, 0, -25, -50, -72, -90].filter(t => t === degC || Math.abs(t - degC) > 6);
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

// Cocotte, grand levier et, à droite, le petit levier de la manette.
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
  const lame = (chemin, z, demiLargeur) => {
    const forme = new T.Shape();
    forme.moveTo(-3.5, -demiLargeur);
    forme.lineTo(3.5, -demiLargeur);
    forme.lineTo(3.5, demiLargeur);
    forme.lineTo(-3.5, demiLargeur);
    forme.closePath();
    const trajet = new T.CatmullRomCurve3(chemin.map(([x, y]) => new T.Vector3(x, y, z)));
    const m = o.mesh(new T.ExtrudeGeometry(forme, { steps: 40, bevelEnabled: false, extrudePath: trajet }), 'black');
    placer(m).name = 'levier';
  };
  lame(LEVIER, 0, 8);
  if (s > 0) lame(PETIT_LEVIER, -6, 5);
}

// Volume d'une cocotte : sections superelliptiques, lissées en Catmull-Rom, fermées aux deux bouts.
// Chaque section a un sommet exactement en haut, au milieu : le point de saisie en est un.
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

// Durite de frein (et gaine du dérailleur à droite) : de la cocotte le long du cintre, sous le ruban, jusqu'au début
// du ruban, puis vers le bas et l'arrière jusqu'à l'entrée du capot du jeu de direction.
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
    q.push([sortie[0] - 14, sortie[1] - 20, sortie[2] - s * 10]);
    q.push(v(le(32, 40), s * 24), v(le(16, 31), s * zEntree), v(le(ENTREE.hauteur, ENTREE.recul), s * zEntree));
    const m = o.tubeCourbe(q, DURITE, role, 90);
    m.name = nom;
    return m;
  };
  trace([-0.45, -0.89], 5, 'hose', 'durite');
  if (s > 0) {
    o.zone(null);
    trace([-0.92, -0.39], 12, 'housing', 'gaine');
    o.zone('manettes');
  }
}
