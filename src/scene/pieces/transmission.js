// Pièce 3D : transmission d'origine du Grizl CF 8 Di2. Pédalier Shimano GRX FC-RX820-1 (plateau de 40, manivelles de
// 165), boîtier Pressfit BB72, cassette Deore XT CS-M8200-12 en 9-45, chaîne Shimano XT et dérailleur Deore XT Di2
// RD-M8250-GS à chape moyenne. Le dérailleur est sans fil et porte sa batterie : aucune gaine ni aucun fil ne le relie
// au cadre, comme sur la photo officielle. Pas de pédales : le vélo est livré sans.
//
// Repère de geometrie.js, en millimètres : x vers l'avant, y vers le haut, z vers la droite du cycliste.
// Les cotes viennent de GEO, de points() et de COTES, chacune avec son document dans SOURCES. Les autres nombres de ce
// fichier sont des valeurs de dessin : épaisseurs des pignons et du plateau, profil des dents, chaîne, bras, cuvettes,
// corps, batterie et chape du dérailleur. META.approche les liste, sans chiffre.
// Lu sur la photo officielle de profil (canyon-photo-4556-fv), à l'échelle de l'empattement : angle des quatre bras du
// plateau par rapport à la manivelle, grand pignon foncé, contour du corps du dérailleur, son axe B sous la patte, le
// capuchon du pivot de la chape, le galet bas et le brin de chaîne entre les galets. La chaîne y est sur le treize dents.
// La cassette : son petit pignon et sa bague de blocage ne font qu'une pièce (« The smallest sprocket and the lock ring
// are combined into a single part », manuel Shimano DM-MACS010, shimano-dm-macs010).
// Aucune zone : les ateliers de la transmission ne sont pas dans cette livraison.
// Un seul import : cheminChaine, du module pur geometrie.js. three.js arrive par les outils.
import { cheminChaine } from '../geometrie.js';

const FICHE = 'canyon-4556';
const DERAILLEUR = 'shimano-rd-m8250-gs';
const cote = (v, src) => Object.freeze({ v, src });

// Cotes publiées propres à ces pièces. Ligne de chaîne, plateau, manivelles, galets et largeur de la boîte de pédalier
// sont dans GEO.
export const COTES = Object.freeze({
  entraxe: cote(110, 'shimano-fc-rx820-1'), // « P.C.D. (mm) 110 »
  brasPlateau: cote(4, 'shimano-fc-rx820-1'), // « Spider/gear arms 4 »
  facteurQ: cote(151, 'shimano-fc-rx820-1'), // « Q-factor (mm) 151 »
  capacite: cote(36, DERAILLEUR), // « Total capacity 36T »
  grandPignonMax: cote(45, DERAILLEUR), // « Low sprocket Max. 45T »
  petitPignonMin: cote(9, DERAILLEUR), // « Top sprocket ... Min. 9T »
});

// Dentures de la CS-M8200-12 en 9-45, du plus petit pignon au plus grand :
// « Combination ... 9-11-13-15-17-19-21-24-28-33-39-45T » (shimano-cs-m8200-12).
export const DENTS_CASSETTE = Object.freeze([9, 11, 13, 15, 17, 19, 21, 24, 28, 33, 39, 45]);

export const META = Object.freeze({
  id: 'transmission',
  nom: 'Pédalier GRX FC-RX820-1, boîtier BB72, cassette XT CS-M8200, chaîne Shimano XT et dérailleur XT Di2 RD-M8250',
  zone: null, // les ateliers de la transmission ne sont pas dans cette livraison
  sources: Object.freeze([
    FICHE,
    'canyon-4556-en',
    'canyon-photo-4556-fv',
    'shimano-fc-rx820-1',
    'shimano-cs-m8200-12',
    'shimano-dm-macs010',
    DERAILLEUR,
    'shimano-bt-dn320',
  ]),
  approche: Object.freeze([
    'Plateau : nombre de dents, entraxe des vis et nombre de bras publiés. Profil des dents, épaisseur et découpe ' +
      'intérieure approchés.',
    'Manivelles et araignée : longueur, facteur Q et nombre de bras publiés. Profil et épaisseur des manivelles ' +
      'approchés. Angle des bras lu au mieux sur la photo officielle.',
    'Axe de pédalier et cuvettes du boîtier : seule la largeur de la boîte est publiée. Diamètres et formes approchés.',
    'Cassette : dentures et matières publiées par Shimano. Épaisseur des pignons, fenêtres et araignée approchées. ' +
      'Le grand pignon en aluminium est dessiné foncé, comme sur la photo officielle. Le petit pignon et sa bague de ' +
      'blocage sont dessinés d’une pièce, comme le dit le manuel Shimano de la cassette.',
    'Position de la cassette sur la roue libre et écart entre les pignons : non publiés, approchés.',
    'Chaîne : Canyon la nomme Shimano XT, sans référence. Largeur, plaques et rouleaux approchés. Elle est dessinée ' +
      'sur le pignon où la montre la photo officielle.',
    'Dérailleur : chape moyenne selon la fiche Canyon, galets de treize dents, sans fil et à batterie intégrée selon ' +
      'Shimano. Contour du corps, capuchon du pivot, chape et galet bas approchés d’après la photo officielle. ' +
      'Épaisseur du corps, biellettes et place sous la patte approchées.',
    'Galet haut du dérailleur : caché par le corps sur la photo officielle. Sa place est approchée.',
    'Batterie : logée dans le corps du dérailleur. Sa place et son logement sont approchés, la photo officielle ne les ' +
      'montre pas distinctement.',
    'Logos, inscriptions, bouton et voyant du dérailleur, de la cassette et du pédalier : non dessinés.',
  ]),
  aVerifier: Object.freeze([
    'longueur des manivelles, gravée sur la manivelle',
    'place du dérailleur sous la patte : elle dépend du type de patte, à regarder sur le vélo',
    'référence de la chaîne : Canyon dit seulement Shimano XT, à lire sur la chaîne',
    'référence exacte du boîtier de pédalier, à lire sur la pièce',
  ]),
});

// ---- Valeurs de dessin (approchées, voir META.approche) ----
const D2R = Math.PI / 180;
const DENT = { pointe: 3, pied: 1.5 }; // dents des pignons et du plateau, au-dessus et sous le cercle primitif
const EP_PIGNON = 1.6;
const EP_PLATEAU = 2;
const RAYON_CORPS = 17.6; // trou des pignons, posés sur le corps de roue libre dessiné par roues.js
// Petit pignon et sa bague de blocage, d'une pièce : le pignon de neuf dents est trop petit pour le corps de roue libre,
// la bague se visse dedans. trou : trou du pignon ; bague : rayons extérieurs des crans et rayon intérieur.
const PETIT_PIGNON = { trou: 12.5, bague: [15.5, 14.4, 11], ep: 2.2 };
const ARAIGNEE = { dentsMin: 28, trou: 34, coque: [31, 35], voile: 4 }; // grands pignons portés par l'araignée
// Chaîne : centres des plaques intérieures et extérieures de part et d'autre du plan de la chaîne, épaisseur et
// demi-hauteur des plaques, rayon et longueur des rouleaux et des axes.
const CHAINE = { int: 1.55, ext: 2.35, ep: 0.8, demiHauteur: 4.4, rouleau: 3.8, longRouleau: 2.3, axe: 1.8, longAxe: 5.6 };
// Pédalier : vis du plateau à ces angles de la manivelle droite, lus au mieux sur la photo officielle.
const ANGLES_VIS = [53, 124, 222, 302];
const BRAS = { ep: 4.5, largeurPied: 22, largeurBout: 14 }; // bras de l'araignée, devant le plateau
const MANIVELLE = { ep: 13, biseau: 2, rayonAxe: 17, rayonOeil: 11.5, trouPedale: 6.35, moyeu: 20 };
const COUPELLE = { rayon: 24, ep: 3 }; // collerette des cuvettes du boîtier, contre la boîte
const RAYON_AXE = 12;
// Dérailleur, de profil, depuis l'axe de la roue arrière, lu sur la photo officielle : l'axe B sur la patte dessinée par
// cadre.js ; le contour du corps (bloc arrière qui loge la batterie, biellettes, bas du corps au-dessus de la chape) ;
// le capuchon du pivot de la chape. Le corps est une épaisseur de ce contour, entre le plan de la chape et le dehors de
// la patte, qu'il coiffe. CORPS_DERAILLEUR et PIVOT_CHAPE servent aussi au schéma 2D (schema2d.js).
const PIED_DERAILLEUR = [-9.5, -27.5];
export const CORPS_DERAILLEUR = Object.freeze([
  [-62.5, -22.5], [-21, -17.8], [-8, -21], [3, -33], [21.5, -43.5], [45, -76], [47, -90], [38, -98], [20, -102],
  [3.5, -101.5], [-17.5, -95.5], [-38.5, -80.5], [-62.5, -68.5],
].map(q => Object.freeze(q)));
export const PIVOT_CHAPE = Object.freeze([34.4, -108.5]);
const CORPS = { z: 83, ep: 26, biseau: 2.5 }; // milieu et épaisseur du corps, en z
const BIELLETTE = { centre: [13, -68], taille: [62, 22, 3], angle: -0.83 }; // biellette extérieure, en relief
// Batterie, dans le bloc arrière du corps, et la trappe de son logement, sur la face extérieure.
const BATTERIE = { centre: [-40, -45], taille: [34, 30, 16], trappe: [30, 24, 1.5] };
const PIVOT = { rayon: 13.5, capuchon: 8.5 };
// Chape : demi-écart des plaques autour du plan de la chaîne, épaisseur, rayons des plaques autour du pivot, du galet
// haut et du galet bas. La plaque extérieure va du pivot au galet bas ; une patte la relie au galet haut.
const CHAPE = { ecart: 6, ep: 1.8, pivot: 14, haut: 11, bas: 22, basInterieur: 19 };
const GALET = { pointe: 2.2, pied: 1.5, ep: 2.2, moyeu: 7 };

const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const pol = (c, r, deg) => [c[0] + r * Math.cos(deg * D2R), c[1] + r * Math.sin(deg * D2R)];

// Enveloppe convexe de cercles [centre, rayon] : le contour d'une plaque de chape, dans le sens trigonométrique.
function enveloppe(cercles) {
  const pts = cercles.flatMap(([c, r]) => Array.from({ length: 48 }, (_, i) => pol(c, r, i * 7.5)));
  pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const vire = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const demi = liste => {
    const h = [];
    for (const q of liste) {
      while (h.length >= 2 && vire(h[h.length - 2], h[h.length - 1], q) <= 0) h.pop();
      h.push(q);
    }
    return h.slice(0, -1);
  };
  return [...demi(pts), ...demi(pts.slice().reverse())];
}

/**
 * Ajoute au groupe des outils le pédalier, le boîtier, la cassette, la chaîne et le dérailleur avec sa batterie.
 * Aucun maillage n'a de zone ni de variante, et les outils en ressortent sans zone ni variante.
 * Noms des maillages que vérifient les tests : pignon 9 à pignon 45, plateau, manivelle droite, manivelle gauche,
 * chaîne, galet, boîtier, dérailleur, batterie. Les autres : araignée de cassette, bague du petit pignon, axe de
 * pédalier, capuchon.
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
  const zBoite = geo.largeurBoite.v / 2, zMoyeu = zBoite + COUPELLE.ep + 0.75;
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

// Les douze pignons, l'araignée qui porte les grands, et la bague de blocage, d'une pièce avec le petit pignon.
function cassette(o, p, pas, zPignon) {
  const { RA } = p;
  const dernier = DENTS_CASSETTE[DENTS_CASSETTE.length - 1];
  DENTS_CASSETTE.forEach((n, k) => {
    const r = n * pas / (2 * Math.PI);
    const porte = n >= ARAIGNEE.dentsMin;
    const fenetres = porte ? { n: n >= 36 ? 6 : 5, r0: ARAIGNEE.trou + 6, r1: r - 9, gap: 0.2 } : null;
    const trou = porte ? ARAIGNEE.trou : k === 0 ? PETIT_PIGNON.trou : RAYON_CORPS;
    const forme = o.engrenage(n, r + DENT.pointe, r - DENT.pied, trou, fenetres);
    // Le grand pignon est en aluminium, les autres en acier (fiche Shimano) : il est foncé sur la photo.
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
  // Bague de blocage à crans, contre le petit pignon, dont elle fait partie.
  const z0 = zPignon(0) + EP_PIGNON / 2, [rCran, rPied, rTrou] = PETIT_PIGNON.bague;
  const bague = o.extr(o.engrenage(12, rCran, rPied, rTrou), PETIT_PIGNON.ep, 'cogSpider');
  bague.position.set(RA[0], RA[1], z0 + PETIT_PIGNON.ep / 2);
  bague.name = 'bague du petit pignon';
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

// Dérailleur à chape moyenne, sans fil : axe B sur la patte, corps avec la batterie, biellette extérieure, pivot et
// capuchon de la chape, plaques de chape et galets. Aucune gaine, aucune molette de réglage de câble.
function derailleur(o, p, geo, z) {
  const T = o.THREE;
  const { RA, poulieHaute: H, poulieBasse: B } = p;
  const rd = (m, nom = 'dérailleur') => { m.name = nom; return m; };
  const versVelo = q => add(RA, q);
  const forme = pts => new T.Shape(pts.map(q => new T.Vector2(...q)));

  // Corps : le contour de la photo, en épaisseur, du côté extérieur de la patte. L'axe B affleure sur sa face.
  const corps = rd(o.extr(forme(CORPS_DERAILLEUR.map(versVelo)), CORPS.ep, 'rd', CORPS.biseau));
  corps.position.z = CORPS.z;
  const face = CORPS.z + CORPS.ep / 2 + CORPS.biseau;
  rd(o.boulon([...versVelo(PIED_DERAILLEUR), face + 0.8], [0, 0, 1], 4.2, 1.6, 'black'));
  rd(o.rbox([...versVelo(BIELLETTE.centre), face + BIELLETTE.taille[2] / 2 - 1.5], BIELLETTE.taille, BIELLETTE.angle,
    'rd', 1.2));
  // Batterie, logée dans le bloc arrière du corps, et la trappe de son logement, à peine en relief.
  const cb = versVelo(BATTERIE.centre);
  rd(o.rbox([...cb, CORPS.z], BATTERIE.taille, 0, 'black', 2), 'batterie');
  rd(o.rbox([cb[0], cb[1] + 3, face + BATTERIE.trappe[2] / 2 - 0.7], BATTERIE.trappe, 0, 'black', 0.6));

  // Pivot de la chape : du dessus de la plaque extérieure au corps, avec son capuchon.
  const P = versVelo(PIVOT_CHAPE), zPlaque = z + CHAPE.ecart + CHAPE.ep / 2;
  const zCorps = CORPS.z - CORPS.ep / 2 - CORPS.biseau;
  rd(o.tubeZ(P, zPlaque, zCorps + 1.5, PIVOT.rayon, 'rd', 32));
  rd(o.tubeZ(P, zCorps + 1.5, zCorps + 4, PIVOT.capuchon, 'black', 32));

  // Chape : la plaque extérieure, du pivot au galet bas, et sa patte jusqu'au galet haut, cachée par le corps ; la
  // plaque intérieure, d'un galet à l'autre.
  const plaques = [
    [1, [[P, CHAPE.pivot], [B, CHAPE.bas]]],
    [1, [[P, CHAPE.pivot - 2], [H, CHAPE.haut]]],
    [-1, [[H, CHAPE.haut], [B, CHAPE.basInterieur]]],
  ];
  for (const [s, cercles] of plaques) {
    const m = rd(o.extr(forme(enveloppe(cercles)), CHAPE.ep, 'rd', 0.4));
    m.position.z = z + s * CHAPE.ecart;
  }

  // Galets de treize dents (fiche Shimano), dans le plan de la chaîne, avec leur moyeu et leur vis.
  const rp = p.rayons.poulie;
  for (const c of [H, B]) {
    const g = o.extr(o.engrenage(geo.dentsPoulie.v, rp + GALET.pointe, rp - GALET.pied, 0), GALET.ep, 'pulley');
    g.position.set(c[0], c[1], z);
    g.name = 'galet';
    rd(o.tubeZ(c, z - CHAPE.ecart + 1, z + CHAPE.ecart - 1, GALET.moyeu, 'pulley', 24));
    rd(o.tubeZ(c, z - CHAPE.ecart - 1.5, z + CHAPE.ecart + 1.5, 3.5, 'steel', 12));
    rd(o.boulon([c[0], c[1], z + CHAPE.ecart + CHAPE.ep / 2 + 1.2], [0, 0, 1], 4, 1, 'black'));
  }
}
