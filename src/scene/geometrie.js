// Géométrie du Canyon Grizl CF 8 Di2, taille M : cotes publiées, cotes approchées, points dérivés.
//
// Repère des points, en millimètres :
//   x vers l'avant, avec l'axe de la roue arrière à x = 0 ;
//   y vers le haut, avec le sol à y = 0 ;
//   z vers la droite du cycliste, donc côté transmission positif et côté disques négatif.
// Les points 2D sont [x, y] (vue côté transmission). Les ancres 3D sont [x, y, z].
//
// Règle des sources (docs/regle-des-sources.md) : chaque entrée de GEO vient d'un document enregistré dans
// SOURCES (src), ou porte approche: true avec une note sans chiffre. Une valeur approchée est dessinée au mieux,
// jamais présentée comme exacte. Module pur : ni three.js ni DOM, utilisable tel quel dans Node.

const D2R = Math.PI / 180;

const FICHE = 'canyon-4556';

// Cote publiée par un document enregistré dans SOURCES.
const pub = (v, src = FICHE, plus = {}) => Object.freeze({ v, src, ...plus });
// Cote non publiée : dessinée au mieux. La note ne contient aucun chiffre.
const apr = (v, note) => Object.freeze({ v, src: null, approche: true, note });

const DEFINITION_MAIN =
  'Canyon définit la position de la main par un lien « En savoir plus » de la fiche. Sa page d’explication de la ' +
  'géométrie dit que ces valeurs sont calculées avec la main posée sur les cocottes, au point où tu saisis la cocotte, ' +
  'en tenant compte de la potence, de la forme du cockpit et des entretoises montées à la livraison. ' +
  'Elle ne précise pas ce point sur la cocotte : à vérifier.';

export const GEO = Object.freeze({
  // ---- Cadre : colonne M de la fiche Canyon 4556 (repères entre parenthèses) ----
  empattement: pub(1076), // (h)
  bases: pub(440), // (g) de l'axe du boîtier à l'axe de la roue arrière
  differenceBoitierMoyeu: pub(75), // (l) axe du boîtier sous l'axe du moyeu
  stack: pub(596), // (i)
  reach: pub(404), // (j)
  longueurDouille: pub(158), // (d)
  angleDirection: pub(71, FICHE, {
    aVerifier:
      'La fiche nomme cette cote « inclinaison du cintre ». C’est très probablement l’angle de direction. ' +
      'À confirmer avec le schéma de la fiche.',
  }), // (e) en degrés
  angleTubeSelle: pub(73.5), // (f) en degrés
  longueurTubeSelle: pub(522), // (b) du boîtier au haut du tube, sur son axe
  longueurTubeSuperieur: pub(581), // (c) horizontale, de l'axe du tube de selle à la douille
  stackEfficace: pub(690, FICHE, { aVerifier: DEFINITION_MAIN }), // (o)
  reachEfficace: pub(531, FICHE, { aVerifier: DEFINITION_MAIN }), // (p)
  // Boîte de pédalier : « Shimano Pressfit BB72 ; PF 86,5 », donc 86,5 de large. Le cadre (cadre.js) la dessine à
  // moitié de chaque côté du plan du vélo, et les cuvettes du boîtier (transmission.js) s'y appuient.
  largeurBoite: pub(86.5),

  // ---- Cadre : cotes non publiées ----
  rayonPneu: apr(356, 'Le rayon extérieur du pneu monté n’est pas publié. Il est approché.'),
  hauteurSelle: apr(760,
    'La fiche donne une plage de hauteurs de selle, pas une valeur. La selle est posée vers le milieu de cette plage.'),
  // Le haut de la tige est pris à la hauteur de l'axe des rails, dans la tête. Fizik publie une hauteur de selle
  // (« Height at 75mm 51 mm ») sans dire d'où il la prend : elle est lue ici depuis l'axe des rails, comme dans
  // cadre.js. Avec le recul de la tête, l'écart en découle, arrondi.
  retraitSelle: apr(48,
    'La forme de la tête de tige n’est pas publiée. L’écart entre le haut de la tige et le dessus de la selle est ' +
    'approché d’après la hauteur de selle que publie Fizik, lue ici depuis l’axe des rails.'),
  ecartCouronne: apr(16,
    'La forme de la fourche n’est pas publiée. La position de la couronne sous la douille est approchée.'),

  // ---- Roues et freins ----
  diametreSiegeJante: pub(622, 'schwalbe-g-one-rx'), // « ETRTO: 45-622 » du pneu monté
  // « 24 front and rear » sur la page des roues GR 30 CF. On en compte aussi vingt-quatre à chaque roue sur la photo
  // officielle du vélo (canyon-photo-4556-fv).
  nombreRayons: pub(24, 'canyon-gr30cf'),
  diametreDisque: pub(160), // « diamètre 160 / 160 », avant et arrière
  decalageDisqueAvant: apr(40, 'La position latérale du disque avant n’est pas publiée. Elle est approchée.'),
  decalageDisqueArriere: apr(57, 'La position latérale du disque arrière n’est pas publiée. Elle est approchée.'),
  rayonEtrier: apr(72, 'La distance des étriers à leur moyeu n’est pas publiée. Elle est approchée.'),
  angleEtrierAvant: apr(146,
    'La position de l’étrier avant autour du moyeu n’est pas publiée. Elle est lue au mieux sur la photo officielle.'),
  angleEtrierArriere: apr(26,
    'La position de l’étrier arrière autour du moyeu n’est pas publiée. Elle est lue au mieux sur la photo officielle.'),

  // ---- Transmission ----
  longueurManivelle: pub(165), // « 165,0 (S-M) »
  dentsPlateau: pub(40), // « plateau 40 »
  angleManivelle: apr(-25,
    'Le pédalier est dessiné dans une position choisie pour la lisibilité. Ce n’est pas une position réelle.'),
  pasChaine: apr(12.7,
    'Le pas de la chaîne n’est pas relevé sur un document du fabricant. La valeur retenue est celle du pas courant des chaînes de vélo.'),
  // La chaîne et le dérailleur sont dessinés comme sur la photo officielle de profil (canyon-photo-4556-fv) : la chaîne
  // y est sur le treize dents, la chape tournée vers l'arrière, le galet bas derrière et sous le galet haut.
  dentsPignonDessine: apr(13,
    'La chaîne est dessinée sur un seul pignon, celui où la montre la photo officielle, lu au mieux.'),
  ligneChaine: pub(49.7, 'shimano-fc-rx820-1'), // « Chain line (mm) 49.7 » de la FC-RX820-1 : plan du plateau
  zPetitPignon: apr(64, 'La position latérale de la cassette n’est pas publiée. Elle est approchée.'),
  ecartPignons: apr(3.9, 'L’écart entre deux pignons de la cassette n’est pas publié. Il est approché.'),
  // Galet haut : caché par le corps du dérailleur sur la photo. Il est placé pour que le brin de chaîne visible entre
  // les deux galets leur soit tangent.
  decalagePoulieHaute: apr(14,
    'La position du galet haut du dérailleur n’est pas publiée. Il est caché sur la photo officielle : sa place est ' +
    'approchée d’après le brin de chaîne visible.'),
  descentePoulieHaute: apr(52,
    'La distance entre le pignon et le galet haut du dérailleur n’est pas publiée. Elle est approchée d’après la ' +
    'photo officielle.'),
  ecartPoulies: apr(91,
    'La fiche indique une chape moyenne, sans cote. L’écart entre les galets est approché d’après la photo officielle.'),
  // Négatif : le galet bas est derrière le galet haut, comme sur la photo.
  angleCage: apr(-40,
    'L’inclinaison de la chape du dérailleur n’est pas publiée. Elle est approchée d’après la photo officielle.'),
  dentsPoulie: pub(13, 'shimano-rd-m8250-gs'), // « Teeth 13T » : le rayon des galets en découle avec le pas

  // ---- Poste de pilotage ----
  longueurPotence: pub(60), // « 60 (S-L) »
  largeurCintre: pub(440), // « 440 (M-2XL) », d'axe en axe au niveau des cocottes
  hauteurPotence: apr(42,
    'Le nombre d’entretoises montées à la livraison n’est pas publié. La hauteur de la potence est approchée.'),
  // Potence de 60 : marquage « ANGLE 6° » sur la photo officielle. Montée vers le bas, elle monte de 90 - 71 - 6 degrés.
  anglePotence: pub(6, 'canyon-photo-st0046', {
    aVerifier:
      'Canyon ne dit pas dans quel sens la potence est montée à la livraison. Elle est dessinée vers le bas, ' +
      'comme sur la photo officielle du vélo. À regarder sur le vélo.',
  }),
  // Cintre HB0067 : marquage « REACH 70 mm » et « DROP 128 mm » sur la photo officielle (cintre de 420).
  deportCintre: pub(70, 'canyon-photo-hb0067-marquage', {
    aVerifier:
      'La page du cintre annonce un déport plus long que le marquage de sa photo officielle. ' +
      'Le cintre photographié est le plus étroit des deux. À lire sur le cintre.',
  }),
  descenteCintre: pub(128, 'canyon-photo-hb0067-marquage', {
    aVerifier: 'Lue sur le marquage du cintre photographié, le plus étroit des deux. À lire sur le cintre.',
  }),
});

// Les ancres se posent juste à gauche de la pièce, du côté des disques, pour rester visibles (placement de vue, pas une cote).
const DEVANT_DISQUE = 5;
const DEVANT_ETRIER = 24;
// Les ancres des zones du montage, chacune sur sa pièce, du côté où la vue d'ensemble la montre. Sur l'image la plus
// étroite de l'accueil (360 px de large), trente pixels valent à peu près dix-neuf centimètres du vélo : chaque ancre
// est assez loin des autres pour que deux pastilles ne se chevauchent pas (tools/scene-check.js). Placement de vue,
// pas une cote.
const DOS_POTENCE = 28; // le long de l'arrière du pivot, jusqu'au dos du serrage de la potence, où sont ses deux vis
const FACE_POTENCE = 11; // côté transmission, sur la face de ce serrage
// Sous l'axe avant, côté gauche, là où se trouve la tête de l'axe : la pastille de l'étrier est juste au-dessus du
// moyeu, et deux pastilles sur l'axe se chevaucheraient. La vue de la zone vise la tête de l'axe elle-même.
const SOUS_AXE = 160;
const GAUCHE_AXE = 80;
const FACE_MANIVELLE = 80; // côté transmission, juste au-delà de la face extérieure de la manivelle
// Batterie Di2 : depuis l'axe de la roue arrière, en arrière, vers le bas et côté transmission. Le bas du corps du
// dérailleur, sous la batterie que transmission.js loge dans le bloc arrière du corps, sur sa face extérieure.
const SOUS_BATTERIE = Object.freeze([-20, -98, 98]);

const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const mul = (a, k) => [a[0] * k, a[1] * k];
const pol = (c, r, deg) => [c[0] + r * Math.cos(deg * D2R), c[1] + r * Math.sin(deg * D2R)];
const rayonPrimitif = (dents, pas) => dents * pas / (2 * Math.PI);

function arc(c, r, a0, a1, pas = 12) {
  const n = Math.max(1, Math.ceil(Math.abs(a1 - a0) / pas)), o = [];
  for (let i = 0; i <= n; i++) o.push(pol(c, r, a0 + (a1 - a0) * i / n));
  return o;
}

// Points 2D du vélo, rayons de la transmission et ancres 3D, calculés depuis GEO.
export function points(geo = GEO) {
  const g = cle => {
    if (!geo[cle]) throw new Error(`GEO.${cle} est absent`);
    return geo[cle].v;
  };

  // Roues et cadre
  const RA = [0, g('rayonPneu')];
  const FA = [g('empattement'), RA[1]];
  const BB = [Math.sqrt(g('bases') ** 2 - g('differenceBoitierMoyeu') ** 2), RA[1] - g('differenceBoitierMoyeu')];

  // Direction (dHT) et tube de selle (dST) : vecteurs unitaires qui montent en penchant vers l'arrière
  const dHT = [-Math.cos(g('angleDirection') * D2R), Math.sin(g('angleDirection') * D2R)];
  const dST = [-Math.cos(g('angleTubeSelle') * D2R), Math.sin(g('angleTubeSelle') * D2R)];
  const HTt = add(BB, [g('reach'), g('stack')]);
  const HTb = add(HTt, mul(dHT, -g('longueurDouille')));
  const CROWN = add(HTb, mul(dHT, -g('ecartCouronne')));
  const STt = add(BB, mul(dST, g('longueurTubeSelle')));
  const SPt = add(BB, mul(dST, g('hauteurSelle') - g('retraitSelle')));

  // Poste de pilotage : S0 est l'axe de la potence sur le tube de direction, S1 le centre du cintre.
  // La potence part à angle droit du pivot, moins son angle : elle est montée vers le bas (GEO.anglePotence.aVerifier).
  const S0 = add(HTt, mul(dHT, g('hauteurPotence')));
  const montee = (90 - g('angleDirection') - g('anglePotence')) * D2R;
  const S1 = add(S0, mul([Math.cos(montee), Math.sin(montee)], g('longueurPotence')));

  // Pédalier et étriers
  const PR = pol(BB, g('longueurManivelle'), g('angleManivelle'));
  const PL = pol(BB, g('longueurManivelle'), g('angleManivelle') + 180);
  const CF = pol(FA, g('rayonEtrier'), g('angleEtrierAvant'));
  const CR = pol(RA, g('rayonEtrier'), g('angleEtrierArriere'));

  // Transmission : rayons primitifs et poulies du dérailleur
  const rayons = {
    pignon: rayonPrimitif(g('dentsPignonDessine'), g('pasChaine')),
    plateau: rayonPrimitif(g('dentsPlateau'), g('pasChaine')),
    poulie: rayonPrimitif(g('dentsPoulie'), g('pasChaine')),
  };
  const poulieHaute = [RA[0] + g('decalagePoulieHaute'), RA[1] - rayons.pignon - g('descentePoulieHaute')];
  const poulieBasse = add(poulieHaute, [
    g('ecartPoulies') * Math.sin(g('angleCage') * D2R),
    -g('ecartPoulies') * Math.cos(g('angleCage') * D2R),
  ]);

  // Ancres 3D. Les mains sont exactement au stack et au reach efficaces de la fiche, mesurés depuis le boîtier.
  const rayonDisque = g('diametreDisque') / 2;
  const zCocotte = g('largeurCintre') / 2;
  const main = add(BB, [g('reachEfficace'), g('stackEfficace')]);
  // Le dos du serrage de la potence sur le pivot, à la hauteur de l'axe de la potence (S0), au-dessus du capot du jeu
  // de direction.
  const dosPotence = add(S0, mul([-dHT[1], dHT[0]], DOS_POTENCE));
  const ancres = {
    disqueArriere: [RA[0], RA[1] + rayonDisque, -(g('decalageDisqueArriere') + DEVANT_DISQUE)],
    disqueAvant: [FA[0], FA[1] + rayonDisque, -(g('decalageDisqueAvant') + DEVANT_DISQUE)],
    etrierAvant: [CF[0], CF[1], -(g('decalageDisqueAvant') + DEVANT_ETRIER)],
    cocotteGauche: [main[0], main[1], -zCocotte],
    mains: [main[0], main[1], zCocotte],
    // Zones du montage : poste de pilotage, selle et tige, axes des roues, pédalier, dérailleur Di2.
    potence: [dosPotence[0], dosPotence[1], FACE_POTENCE],
    teteTige: [SPt[0], SPt[1], 0], // la tête de la tige, qui serre les rails sous la selle
    axeAvant: [FA[0], FA[1] - SOUS_AXE, -GAUCHE_AXE],
    teteAxeAvant: [FA[0], FA[1], -GAUCHE_AXE],
    manivelleDroite: [PR[0], PR[1], FACE_MANIVELLE], // le bout du bras, là où se visse la pédale
    batterieDi2: [RA[0] + SOUS_BATTERIE[0], RA[1] + SOUS_BATTERIE[1], SOUS_BATTERIE[2]],
  };

  return { RA, FA, BB, HTt, HTb, STt, SPt, S0, S1, PR, PL, CF, CR, CROWN, dHT, dST, poulieHaute, poulieBasse, rayons, ancres };
}

// Chemin 2D de la chaîne : arrière du pignon, devant du galet haut, arrière et dessous du galet bas, avant du plateau.
// Entre les deux galets, de même rayon, la chaîne croise : le brin est leur tangente intérieure, qui touche le galet
// haut sous l'angle a et le galet bas à l'opposé. À lisser par l'appelant.
export function cheminChaine(p) {
  const r = p.rayons.poulie, H = p.poulieHaute, B = p.poulieBasse;
  const d = Math.hypot(B[0] - H[0], B[1] - H[1]);
  if (d <= 2 * r) throw new Error('chaîne : les galets du dérailleur se touchent');
  const a = (Math.atan2(B[1] - H[1], B[0] - H[0]) + Math.acos(2 * r / d)) / D2R;
  const haut = a > 90 ? a - 360 : a; // le galet haut est parcouru de son dessus vers l'avant, en tournant vers le bas
  return [
    ...arc(p.RA, p.rayons.pignon, 90, 270),
    ...arc(H, r, 90, haut),
    ...arc(B, r, haut + 180, 270),
    ...arc(p.BB, p.rayons.plateau, -90, 90),
  ];
}

// Ce qui est approché dans GEO, pour la liste des approximations du guide. Les notes ne contiennent aucun chiffre.
export function approximations(geo = GEO) {
  return Object.entries(geo)
    .filter(([, e]) => e.approche)
    .map(([cle, e]) => ({ cle, note: e.note || 'Forme approchée.' }));
}
