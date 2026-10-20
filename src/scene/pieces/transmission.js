// Pièce 3D : transmission d'origine. Pédalier Shimano GRX FC-RX610-1 (plateau de 40, manivelles de 165), boîtier
// BB-RS500-PB, cassette SLX CS-M7100-12 en 10-45, chaîne CN-M7100, dérailleur GRX RD-RX822-GS à chape courte et sa gaine.
// Pas de pédales : le vélo est livré sans.
//
// Repère de geometrie.js, en millimètres : x vers l'avant, y vers le haut, z vers la droite du cycliste.
// Les cotes viennent de GEO, de points() et de COTES, chacune avec son document dans SOURCES. Les autres nombres de ce
// fichier sont des valeurs de dessin : épaisseurs des pignons et du plateau, profil des dents, chaîne, bras, cuvettes,
// corps et chape du dérailleur, trajet de la gaine. META.approche les liste, sans chiffre.
// Lu sur la photo officielle de profil (canyon-photo-4553-fv) : angle des quatre bras du plateau par rapport à la
// manivelle, grand pignon foncé, place du dérailleur sous la patte, sortie de la gaine près de la patte.
// Aucune zone : les ateliers de la transmission ne sont pas dans cette livraison.
// Un seul import : cheminChaine, du module pur geometrie.js. three.js arrive par les outils.
import { cheminChaine } from '../geometrie.js';

const FICHE = 'canyon-4553';
const cote = (v, src) => Object.freeze({ v, src });

// Cotes publiées propres à ces pièces. Ligne de chaîne, plateau, manivelles et galets sont dans GEO.
export const COTES = Object.freeze({
  entraxe: cote(110, 'shimano-fc-rx610-1'), // « P.C.D. (mm) 110 »
  brasPlateau: cote(4, 'shimano-fc-rx610-1'), // « Spider/gear arms 4 »
  facteurQ: cote(151, 'shimano-fc-rx610-1'), // « Q-factor (mm) 151 »
  largeurBoite: cote(86.5, 'shimano-bb-rs500-pb'), // « Press-Fit bottom bracket shell width (mm) 86.5 »
});

// Dentures de la CS-M7100-12 en 10-45, du plus petit pignon au plus grand :
// « Combination 10-12-14-16-18-21-24-28-32-36-40-45T » (shimano-cs-m7100-12).
export const DENTS_CASSETTE = Object.freeze([10, 12, 14, 16, 18, 21, 24, 28, 32, 36, 40, 45]);

export const META = Object.freeze({
  id: 'transmission',
  nom: 'Pédalier GRX FC-RX610-1, boîtier BB-RS500, cassette SLX CS-M7100, chaîne CN-M7100 et dérailleur GRX RD-RX822',
  zone: null, // les ateliers de la transmission ne sont pas dans cette livraison
  sources: Object.freeze([
    FICHE,
    'canyon-photo-4553-fv',
    'shimano-rx610-1x12',
    'shimano-fc-rx610-1',
    'shimano-bb-rs500-pb',
    'shimano-cs-m7100-12',
    'shimano-cn-m7100',
    'shimano-rd-rx822-gs',
  ]),
  approche: Object.freeze([
    'Plateau : nombre de dents, entraxe des vis et nombre de bras publiés. Profil des dents, épaisseur et découpe ' +
      'intérieure approchés.',
    'Manivelles et araignée : longueur, facteur Q et nombre de bras publiés. Profil et épaisseur des manivelles ' +
      'approchés. Angle des bras lu au mieux sur la photo officielle.',
    'Axe de pédalier et cuvettes du boîtier : seule la largeur de la boîte est publiée. Diamètres et formes approchés.',
    'Cassette : dentures et matières publiées par Shimano. Épaisseur des pignons, fenêtres et araignée approchées. ' +
      'Le grand pignon en aluminium est dessiné foncé, comme sur la photo officielle.',
    'Position de la cassette sur la roue libre et écart entre les pignons : non publiés, approchés.',
    'Chaîne : largeur, plaques et rouleaux approchés. Elle est dessinée sur un seul pignon, choisi pour la lisibilité.',
    'Dérailleur : chape courte selon la fiche Canyon, galets de treize dents selon Shimano. Corps, biellettes, chape, ' +
      'écart des galets et place sous la patte approchés d’après la photo officielle.',
    'Gaine du dérailleur : sortie du cadre et trajet approchés d’après la photo officielle.',
  ]),
  aVerifier: Object.freeze([
    'longueur des manivelles, gravée sur la manivelle',
    'place du dérailleur sous la patte : elle dépend du type de patte, à regarder sur le vélo',
  ]),
});

// ---- Valeurs de dessin (approchées, voir META.approche) ----
const D2R = Math.PI / 180;
const DENT = { pointe: 3, pied: 1.5 }; // dents des pignons et du plateau, au-dessus et sous le cercle primitif
const EP_PIGNON = 1.6;
const EP_PLATEAU = 2;
const RAYON_CORPS = 17.6; // trou des petits pignons, posés sur le corps de roue libre dessiné par roues.js
const ARAIGNEE = { dentsMin: 28, trou: 34, coque: [31, 35], voile: 4 }; // grands pignons portés par l'araignée
// Chaîne : centres des plaques intérieures et extérieures de part et d'autre du plan de la chaîne, épaisseur et
// demi-hauteur des plaques, rayon et longueur des rouleaux et des axes.
const CHAINE = { int: 1.55, ext: 2.35, ep: 0.8, demiHauteur: 4.4, rouleau: 3.8, longRouleau: 2.3, axe: 1.8, longAxe: 5.6 };
// Pédalier : vis du plateau à ces angles de la manivelle droite, lus au mieux sur la photo officielle.
const ANGLES_VIS = [56, 125, 228, 303];
const BRAS = { ep: 4.5, largeurPied: 22, largeurBout: 14 }; // bras de l'araignée, devant le plateau
const MANIVELLE = { ep: 13, biseau: 2, rayonAxe: 17, rayonOeil: 11.5, trouPedale: 6.35, moyeu: 20 };
const COUPELLE = { rayon: 24, ep: 3 }; // collerette des cuvettes du boîtier, contre la boîte
const RAYON_AXE = 12;
// Dérailleur : pied sur la patte dessinée par cadre.js, face extérieure de cette patte, chape et galets.
const PIED_DERAILLEUR = [-8.7, -24.6]; // depuis l'axe de la roue arrière
const FACE_PATTE = 85;
const CHAPE = { ecart: 6, ep: 1.8, lobeHaut: 14, lobeHautInterieur: 11, lobeBas: 30, lobeBasInterieur: 26 };
const GALET = { pointe: 2.2, pied: 1.5, ep: 2.2, moyeu: 7 };
const GAINE = 2.6;

const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const mul = (a, k) => [a[0] * k, a[1] * k];
const pol = (c, r, deg) => [c[0] + r * Math.cos(deg * D2R), c[1] + r * Math.sin(deg * D2R)];
const v3 = (q, z) => [q[0], q[1], z];

/**
 * Ajoute au groupe des outils le pédalier, le boîtier, la cassette, la chaîne, le dérailleur et sa gaine.
 * Aucun maillage n'a de zone ni de variante, et les outils en ressortent sans zone ni variante.
 * Noms des maillages que vérifient les tests : pignon 10 à pignon 45, plateau, manivelle droite, manivelle gauche,
 * chaîne, galet. Les autres : araignée de cassette, contre-écrou, axe de pédalier, boîtier, capuchon, dérailleur, gaine.
 * @param {object} o Les outils de creerOutils.
 * @param {object} p Les points de points(geo).
 * @param {object} geo GEO, ou un objet de même forme.
 * @returns {void}
 */
export function construire(o, p, geo) {
  o.zone(null);
  o.variante(null);
  const pas = geo.pasChaine.v;
  const kDessine = DENTS_CASSETTE.indexOf(geo.dentsPignonDessine.v);
  if (kDessine < 0) throw new Error(`GEO.dentsPignonDessine : ${geo.dentsPignonDessine.v} dents, absent de la cassette`);
  const zPignon = k => geo.zPetitPignon.v - k * geo.ecartPignons.v;
  const plans = { avant: geo.ligneChaine.v, arriere: zPignon(kDessine) };

  pedalier(o, p, geo, plans.avant);
  cassette(o, p, pas, zPignon);
  chaine(o, p, pas, plans);
  derailleur(o, p, geo, plans.arriere);
  o.zone(null);
  o.variante(null);
}

// Plateau, araignée, manivelles, axe et cuvettes du boîtier.
function pedalier(o, p, geo, zPlateau) {
  const T = o.THREE;
  const { BB } = p;
  const angle = geo.angleManivelle.v;
  const R = p.rayons.plateau;
  const nom = n => m => { m.name = n; return m; };

  // Plateau : denture, découpe intérieure à quatre pattes sous les vis, trous des vis.
  const forme = o.engrenage(geo.dentsPlateau.v, R + DENT.pointe, R - DENT.pied, 0);
  const rVis = COTES.entraxe.v / 2;
  const interieur = [];
  for (let i = 0; i < 144; i++) {
    const a = i * 2.5;
    let patte = 0;
    for (const v of ANGLES_VIS) {
      const d = Math.abs(((a - v + 540) % 360) - 180);
      if (d < 20) patte = Math.max(patte, 0.5 * (1 + Math.cos(Math.PI * d / 20)));
    }
    interieur.push(new T.Vector2(...pol([0, 0], 64 - 16 * patte, a)));
  }
  forme.holes.push(new T.Path(interieur.reverse()));
  for (const v of ANGLES_VIS) {
    const h = new T.Path();
    h.absarc(...pol([0, 0], rVis, v), 4.3, 0, Math.PI * 2, true);
    forme.holes.push(h);
  }
  const plateau = nom('plateau')(o.extr(forme, EP_PLATEAU, 'ring'));
  plateau.position.set(BB[0], BB[1], zPlateau);
  plateau.rotation.z = angle * D2R;

  // Araignée de la manivelle droite : quatre bras, devant le plateau, jusqu'aux vis.
  const zBras = zPlateau + EP_PLATEAU / 2 + BRAS.ep / 2;
  for (const v of ANGLES_VIS) {
    const s = new T.Shape();
    s.moveTo(MANIVELLE.moyeu - 4, -BRAS.largeurPied / 2);
    s.lineTo(rVis, -BRAS.largeurBout / 2);
    s.absarc(rVis, 0, BRAS.largeurBout / 2, -Math.PI / 2, Math.PI / 2, false);
    s.lineTo(MANIVELLE.moyeu - 4, BRAS.largeurPied / 2);
    s.closePath();
    const bras = nom('manivelle droite')(o.extr(s, BRAS.ep, 'crank'));
    bras.position.set(BB[0], BB[1], zBras);
    bras.rotation.z = (angle + v) * D2R;
    const [x, y] = pol(BB, rVis, angle + v);
    nom('manivelle droite')(o.boulon([x, y, zBras + BRAS.ep / 2 + 0.6], [0, 0, 1], 4, 1.2, 'steel'));
  }

  // Manivelles : face extérieure au bout à la moitié du facteur Q, moyeu jusqu'à la cuvette.
  const L = geo.longueurManivelle.v;
  const profil = new T.Shape();
  profil.moveTo(0, -MANIVELLE.rayonAxe);
  profil.lineTo(L, -MANIVELLE.rayonOeil);
  profil.absarc(L, 0, MANIVELLE.rayonOeil, -Math.PI / 2, Math.PI / 2, false);
  profil.lineTo(0, MANIVELLE.rayonAxe);
  profil.absarc(0, 0, MANIVELLE.rayonAxe, Math.PI / 2, Math.PI * 1.5, false);
  const oeil = new T.Path();
  oeil.absarc(L, 0, MANIVELLE.trouPedale, 0, Math.PI * 2, true);
  profil.holes.push(oeil);
  const demiQ = COTES.facteurQ.v / 2, demiEp = MANIVELLE.ep / 2 + MANIVELLE.biseau;
  const zBoite = COTES.largeurBoite.v / 2, zMoyeu = zBoite + COUPELLE.ep + 0.75;
  for (const [s, cote, a] of [[1, 'droite', angle], [-1, 'gauche', angle + 180]]) {
    const n = nom(`manivelle ${cote}`);
    const m = n(o.extr(profil, MANIVELLE.ep, 'crank', MANIVELLE.biseau));
    m.position.set(BB[0], BB[1], s * (demiQ - demiEp));
    m.rotation.z = a * D2R;
    n(o.tubeZ(BB, s * zMoyeu, s * (demiQ - demiEp), MANIVELLE.moyeu, 'crank', 40));
  }
  // Manivelle gauche : capuchon de précharge et deux vis de serrage sur le moyeu.
  nom('capuchon')(o.tubeZ(BB, -demiQ - 0.6, -demiQ + 1, 10, 'black', 32));
  const dos = pol([0, 0], 1, angle + 180 + 90);
  const c = pol(BB, MANIVELLE.moyeu + 0.5, angle + 180 + 90);
  for (const dz of [-5.5, 5.5]) {
    nom('manivelle gauche')(o.boulon([c[0], c[1], -(zMoyeu + 8 + dz)], [dos[0], dos[1], 0], 3, 2, 'steel'));
  }

  // Axe creux et cuvettes pressées dans la boîte de pédalier.
  nom('axe de pédalier')(o.tubeZ(BB, -zMoyeu - 6, zMoyeu + 6, RAYON_AXE, 'steel', 32));
  for (const s of [-1, 1]) {
    nom('boîtier')(o.tubeZ(BB, s * zBoite, s * (zBoite + COUPELLE.ep), COUPELLE.rayon, 'black', 40));
  }
}

// Les douze pignons, l'araignée qui porte les grands et le contre-écrou.
function cassette(o, p, pas, zPignon) {
  const { RA } = p;
  const dernier = DENTS_CASSETTE[DENTS_CASSETTE.length - 1];
  DENTS_CASSETTE.forEach((n, k) => {
    const r = n * pas / (2 * Math.PI);
    const porte = n >= ARAIGNEE.dentsMin;
    const fenetres = porte ? { n: n >= 36 ? 6 : 5, r0: ARAIGNEE.trou + 6, r1: r - 9, gap: 0.2 } : null;
    const forme = o.engrenage(n, r + DENT.pointe, r - DENT.pied, porte ? ARAIGNEE.trou : RAYON_CORPS, fenetres);
    // Le grand pignon est en aluminium anodisé, les autres en acier (fiche Shimano) : il est foncé sur la photo.
    const m = o.extr(forme, EP_PIGNON, n === dernier ? 'cogSpider' : 'cassette');
    m.position.set(RA[0], RA[1], zPignon(k));
    m.name = `pignon ${n}`;
  });
  // Araignée : une coque sous les grands pignons et un voile sur la roue libre.
  const portes = DENTS_CASSETTE.map((n, k) => [n, zPignon(k)]).filter(([n]) => n >= ARAIGNEE.dentsMin).map(([, z]) => z);
  const zBas = Math.min(...portes) - EP_PIGNON / 2, zHaut = Math.max(...portes) + EP_PIGNON / 2;
  const [c0, c1] = ARAIGNEE.coque;
  // Profil parcouru dans ce sens pour que les faces regardent vers l'extérieur.
  const araignee = o.lathe([
    [RAYON_CORPS, zHaut - ARAIGNEE.voile], [c0, zHaut - ARAIGNEE.voile], [c0, zBas], [c1, zBas], [c1, zHaut],
    [RAYON_CORPS, zHaut], [RAYON_CORPS, zHaut - ARAIGNEE.voile],
  ], 48, 'cogSpider');
  araignee.position.set(RA[0], RA[1], 0);
  araignee.name = 'araignée de cassette';
  // Contre-écrou à crans, contre le petit pignon.
  const z0 = zPignon(0) + EP_PIGNON / 2, ep = 2.2;
  const ecrou = o.extr(o.engrenage(12, 20, 18.6, 12.5), ep, 'cogSpider');
  ecrou.position.set(RA[0], RA[1], z0 + ep / 2);
  ecrou.name = 'contre-écrou';
}

// Chaîne : maillons le long du chemin de geometrie.js. Plan du plateau à l'avant, du pignon dessiné à l'arrière,
// droite entre les deux. Le nombre de maillons est pair, comme sur une vraie chaîne.
function chaine(o, p, pas, plans) {
  const T = o.THREE;
  const xArriere = Math.max(p.poulieHaute[0], p.poulieBasse[0]) + p.rayons.poulie, xAvant = p.BB[0];
  const zChaine = x => {
    const t = Math.min(1, Math.max(0, (x - xArriere) / (xAvant - xArriere)));
    return plans.arriere + (plans.avant - plans.arriere) * t;
  };
  const chemin = cheminChaine(p).map(([x, y]) => new T.Vector3(x, y, zChaine(x)));
  const courbe = new T.CatmullRomCurve3(chemin, true, 'centripetal');
  const N = 2 * Math.round(courbe.getLength() / pas / 2);
  const pts = courbe.getSpacedPoints(N);

  // Plaque en huit, centrée sur le maillon, épaisseur en z.
  const h = pas / 2, R = CHAINE.demiHauteur, taille = R * 0.65;
  const plaque = new T.Shape();
  plaque.moveTo(-h, R);
  plaque.quadraticCurveTo(0, taille, h, R);
  plaque.absarc(h, 0, R, Math.PI / 2, -Math.PI / 2, true);
  plaque.quadraticCurveTo(0, -taille, -h, -R);
  plaque.absarc(-h, 0, R, -Math.PI / 2, Math.PI / 2, true);
  const gPlaque = new T.ExtrudeGeometry(plaque, { depth: CHAINE.ep, bevelEnabled: false, curveSegments: 8 });
  gPlaque.translate(0, 0, -CHAINE.ep / 2);
  const cylindre = (r, l, seg) => new T.CylinderGeometry(r, r, l, seg).rotateX(Math.PI / 2);
  const plaques = o.inst(gPlaque, 'chain', N * 2);
  const rouleaux = o.inst(cylindre(CHAINE.rouleau, CHAINE.longRouleau, 12), 'chain', N);
  const axes = o.inst(cylindre(CHAINE.axe, CHAINE.longAxe, 8), 'chain', N);
  for (const m of [plaques, rouleaux, axes]) m.name = 'chaîne';

  // Repère de chaque maillon : x le long du maillon, z au plus près de l'axe z du vélo. Un quaternion pris de x au
  // maillon basculerait les plaques du brin du haut, qui va vers l'arrière.
  const Dx = new T.Vector3(), Dy = new T.Vector3(), Dz = new T.Vector3(), P = new T.Vector3(), Q = new T.Vector3();
  const mtx = new T.Matrix4();
  for (let i = 0; i < N; i++) {
    const a = pts[i], b = pts[i + 1];
    Dx.copy(b).sub(a).normalize();
    Dz.set(0, 0, 1).addScaledVector(Dx, -Dx.z).normalize();
    Dy.crossVectors(Dz, Dx);
    mtx.makeBasis(Dx, Dy, Dz);
    P.copy(a).add(b).multiplyScalar(0.5);
    const ecart = i % 2 ? CHAINE.ext : CHAINE.int; // maillons intérieurs et extérieurs en alternance
    for (const s of [-1, 1]) {
      plaques.setMatrixAt(i * 2 + (s > 0 ? 1 : 0), mtx.setPosition(Q.copy(P).addScaledVector(Dz, s * ecart)));
    }
    mtx.setPosition(a);
    rouleaux.setMatrixAt(i, mtx);
    axes.setMatrixAt(i, mtx);
  }
}

// Dérailleur à chape courte : pied sur la patte, biellettes, corps, chape, galets, butée de gaine et gaine.
function derailleur(o, p, geo, z) {
  const T = o.THREE;
  const { RA, poulieHaute: H, poulieBasse: B } = p;
  const rd = m => { m.name = 'dérailleur'; return m; };
  const pied = add(RA, PIED_DERAILLEUR);

  // Pied : sur la face extérieure de la patte, vis de fixation, bras qui monte vers l'arrière jusqu'à la butée de gaine.
  rd(o.rbox([pied[0] - 8, pied[1] - 2, FACE_PATTE + 6], [26, 22, 12], -0.35, 'rd', 4));
  rd(o.boulon([pied[0], pied[1], FACE_PATTE + 12.6], [0, 0, 1], 3.2, 1.4, 'steel'));
  const butee = add(pied, [-24, 8]);
  rd(o.rbox([butee[0] + 4, butee[1] - 3, FACE_PATTE + 6], [18, 13, 10], 0.6, 'rd', 3));
  const molette = [add(butee, [-3, 4]), add(butee, [-8, 13])];
  rd(o.tube(v3(molette[0], FACE_PATTE + 6), v3(molette[1], FACE_PATTE + 6), 3.4, 3.4, 'black', { seg: 16 }));

  // Biellettes et corps : du pied vers le bas, jusqu'au moyeu de la chape, du côté extérieur de la chaîne.
  const moyeu = add(H, [8, 10]);
  const zMoyeu = z + CHAPE.ecart + CHAPE.ep / 2;
  const a = [pied[0] + 3, pied[1] - 10, FACE_PATTE + 4], b = [moyeu[0] - 2, moyeu[1] + 10, zMoyeu + 6];
  const d = [b[0] - a[0], b[1] - a[1]], l = Math.hypot(...d), n = [-d[1] / l, d[0] / l];
  rd(o.tube(a, b, 9, 8, 'rd', { seg: 24 }));
  const decale = q => [q[0] + n[0] * 11, q[1] + n[1] * 11, q[2] - 3]; // biellette intérieure, plus fine
  rd(o.tube(decale(a), decale(b), 3.5, 3.5, 'rd', { seg: 12 }));
  const milieu = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2 + 5];
  rd(o.ell(milieu, [l * 0.55, 15, 8], 'rd', Math.atan2(d[1], d[0])));
  // Moyeu de la chape (embrayage), son couvercle et le levier du stabilisateur.
  rd(o.tubeZ(moyeu, zMoyeu, zMoyeu + 14, 12, 'rd', 32));
  rd(o.tubeZ(moyeu, zMoyeu + 14, zMoyeu + 16, 9, 'black', 32));
  rd(o.rbox([moyeu[0] + 10, moyeu[1] + 8, zMoyeu + 12], [12, 6, 5], 0.5, 'black', 2));

  // Chape : deux plaques de part et d'autre de la chaîne, un grand lobe autour du galet bas. La plaque intérieure est
  // réduite près du galet haut pour passer sous les grands pignons.
  const dc = [B[0] - H[0], B[1] - H[1]], cl = Math.hypot(...dc), ca = Math.atan2(dc[1], dc[0]);
  const centre = mul(add(H, B), 0.5);
  const plaque = (haut, bas) => {
    const s = new T.Shape();
    s.absarc(-cl / 2, 0, haut, Math.PI / 2, Math.PI * 1.5, false);
    s.lineTo(cl / 2, -bas);
    s.absarc(cl / 2, 0, bas, -Math.PI / 2, Math.PI / 2, false);
    s.closePath();
    return s;
  };
  const plaques = [[1, CHAPE.lobeHaut, CHAPE.lobeBas], [-1, CHAPE.lobeHautInterieur, CHAPE.lobeBasInterieur]];
  for (const [s, haut, bas] of plaques) {
    const m = rd(o.extr(plaque(haut, bas), CHAPE.ep, 'rd', 0.4));
    m.position.set(centre[0], centre[1], z + s * CHAPE.ecart);
    m.rotation.z = ca;
  }

  // Galets de treize dents (fiche Shimano), dans le plan de la chaîne, avec leur moyeu et leur vis.
  const rp = p.rayons.poulie;
  for (const c of [H, B]) {
    const g = o.extr(o.engrenage(geo.dentsPoulie.v, rp + GALET.pointe, rp - GALET.pied, 0), GALET.ep, 'pulley');
    g.position.set(c[0], c[1], z);
    g.name = 'galet';
    rd(o.tubeZ(c, z - CHAPE.ecart + 1, z + CHAPE.ecart - 1, GALET.moyeu, 'pulley', 24));
    rd(o.tubeZ(c, z - CHAPE.ecart - 1.5, z + CHAPE.ecart + 1.5, 3.5, 'steel', 12));
    rd(o.boulon([c[0], c[1], z + CHAPE.ecart + CHAPE.ep / 2 + 1.2], [0, 0, 1], 4, 1, 'steel'));
  }

  // Gaine : elle sort de la base droite, près de la patte, passe au-dessus de l'axe et descend dans la molette.
  const gaine = o.tubeCourbe([
    [RA[0] + 55, RA[1] - 11, 81], [RA[0] + 30, RA[1] + 2, 88], [RA[0] - 8, RA[1] + 17, 94],
    [RA[0] - 36, RA[1] + 12, FACE_PATTE + 7], v3(add(molette[1], [-1, 6]), FACE_PATTE + 6),
    v3(molette[1], FACE_PATTE + 6),
  ], GAINE, 'housing', 48);
  gaine.name = 'gaine';
}
