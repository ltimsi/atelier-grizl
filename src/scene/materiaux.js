// Matières de la scène 3D : pixels de la peinture et des textures, puis les deux jeux de matières (réel et simple).
//
// Aucun canevas, aucun document : les générateurs de pixels renvoient des Uint8ClampedArray RGBA, déterministes.
// Le navigateur (app.js) les met dans une THREE.DataTexture, puis passe les textures à creerMateriaux.
// Module testable sous Node : three.js arrive en paramètre, jamais par import.

// Peinture Floating Violet (coloris R126_P06) : trois teintes, lues sur la photo officielle de Canyon du cadre dans ce
// coloris. La photo du Grizl CF 8 Di2 (SOURCES['canyon-photo-4556-fv']) montre la même peinture.
// deep est le prune profond, base la teinte courante, light le reflet des veines.
export const TEINTES_FLOATING_VIOLET = Object.freeze({
  deep: Object.freeze([58, 8, 32]),
  base: Object.freeze([106, 18, 56]),
  light: Object.freeze([182, 74, 122]),
});

// Les rôles de matière, dans les deux jeux. Chaque maillage de la scène porte l'un d'eux.
export const ROLES = Object.freeze([
  'paint', 'protector', 'carbon', 'black', 'tape', 'hood', 'saddle', 'rubber', 'rim', 'hub', 'spoke', 'steel',
  'rotor', 'rotorSpider', 'caliper', 'pad', 'padFace', 'hose', 'chain', 'cassette', 'cogSpider', 'ring', 'crank',
  'rd', 'pulley', 'housing',
]);

// Générateur pseudo-aléatoire congruentiel, de 0 (exclu) à 1 (exclu). Même graine, même suite.
function generateur(graine) {
  let etat = Math.abs(Math.trunc(graine)) % 2147483647 || 1;
  return () => (etat = etat * 16807 % 2147483647) / 2147483647;
}

/**
 * Pixels de la peinture Floating Violet : un prune profond veiné de reflets plus clairs.
 * Le bruit est périodique, donc la texture se répète sans raccord visible autour des tubes.
 * @param {number} [taille=256] Côté de l'image en pixels.
 * @param {number} [graine=11] Graine du bruit, un entier non nul.
 * @returns {Uint8ClampedArray} taille * taille * 4 valeurs RGBA, tous les pixels opaques.
 */
export function marbre(taille = 256, graine = 11) {
  const S = taille;
  const pixels = new Uint8ClampedArray(S * S * 4);
  const rnd = generateur(graine);
  const P = new Uint8Array(512);
  for (let i = 0; i < 256; i++) P[i] = i;
  for (let i = 255; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [P[i], P[j]] = [P[j], P[i]]; }
  for (let i = 0; i < 256; i++) P[i + 256] = P[i];
  const fade = t => t * t * (3 - 2 * t);
  // Bruit de valeurs de période p : les coordonnées entières se replient modulo p.
  const vn = (x, y, p) => {
    const x0 = Math.floor(x), y0 = Math.floor(y), u = fade(x - x0), v = fade(y - y0), m = k => ((k % p) + p) % p;
    const h = (i, j) => P[(P[m(i)] + m(j)) & 511] / 255;
    return (h(x0, y0) * (1 - u) + h(x0 + 1, y0) * u) * (1 - v) + (h(x0, y0 + 1) * (1 - u) + h(x0 + 1, y0 + 1) * u) * v;
  };
  const fbm = (x, y) => { let s = 0, a = .5, fq = 1; for (let o = 0; o < 4; o++) { s += a * vn(x * fq, y * fq, 6 * fq); a *= .5; fq *= 2; } return s; };
  const { deep, base, light } = TEINTES_FLOATING_VIOLET;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const X = x / S * 6, Yy = y / S * 6;
    const w1 = fbm(X + 1.7, Yy + 9.2), w2 = fbm(X + 8.3, Yy + 2.8);
    const n = fbm(X + 2.4 * w1, Yy + 2.4 * w2);
    const t = Math.min(1, Math.max(0, (n - .3) / .4)), sm = t * t * (3 - 2 * t);
    const veine = Math.pow(Math.max(0, 1 - Math.abs(Math.sin((n * 7 + w2 * 3) * Math.PI))), 12) * .75;
    const o = (y * S + x) * 4;
    for (let k = 0; k < 3; k++) { const col = deep[k] + (base[k] - deep[k]) * sm; pixels[o + k] = col + (light[k] - col) * veine; }
    pixels[o + 3] = 255;
  }
  return pixels;
}

/**
 * Pixels du relief du ruban de guidon : un fond blanc barré d'une bande noire en diagonale.
 * La bande se raccorde d'un bord à l'autre. À poser en bumpMap, avec RepeatWrapping et repeat (70, 1).
 * @param {number} [taille=64] Côté de l'image en pixels.
 * @returns {Uint8ClampedArray} taille * taille * 4 valeurs RGBA en niveaux de gris, tous les pixels opaques.
 */
export function reliefRuban(taille = 64) {
  const pixels = new Uint8ClampedArray(taille * taille * 4);
  const demiLargeur = 3 * taille / 64; // la bande fait 6 pixels de large pour une image de 64
  for (let y = 0; y < taille; y++) for (let x = 0; x < taille; x++) {
    // Écart horizontal à la diagonale x = y, replié pour que la bande passe d'un bord à l'autre.
    const ecart = ((x - y) % taille + taille) % taille;
    const distance = Math.min(ecart, taille - ecart) / Math.SQRT2;
    const v = 255 * Math.min(1, Math.max(0, distance - demiLargeur + .5));
    const o = (y * taille + x) * 4;
    pixels[o] = pixels[o + 1] = pixels[o + 2] = v;
    pixels[o + 3] = 255;
  }
  return pixels;
}

/**
 * Pixels des stries d'un métal brossé : une teinte de gris par ligne, entre 150 et 240.
 * À poser en roughnessMap, avec RepeatWrapping.
 * @param {number} [largeur=8] Largeur de l'image en pixels.
 * @param {number} [hauteur=256] Hauteur de l'image en pixels.
 * @param {number} [graine=1234567] Graine du tirage des lignes, un entier non nul.
 * @returns {Uint8ClampedArray} largeur * hauteur * 4 valeurs RGBA en niveaux de gris, tous les pixels opaques.
 */
export function striesBrossees(largeur = 8, hauteur = 256, graine = 1234567) {
  const pixels = new Uint8ClampedArray(largeur * hauteur * 4);
  const rnd = generateur(graine);
  for (let y = 0; y < hauteur; y++) {
    const v = 150 + rnd() * 90;
    for (let x = 0; x < largeur; x++) {
      const o = (y * largeur + x) * 4;
      pixels[o] = pixels[o + 1] = pixels[o + 2] = v;
      pixels[o + 3] = 255;
    }
  }
  return pixels;
}

/**
 * Les deux jeux de matières de la scène, un par mode d'affichage.
 * `reel` : matières physiques, vernis et métaux, pour le rendu photographique.
 * `simple` : une couleur par famille de pièces (cadre, freins en orange, transmission en violet), pour le mode didactique.
 * Cette fonction ne crée aucun canevas. Les textures arrivent toutes faites, et toute texture absente est omise.
 * Réglages attendus côté navigateur, repris de la maquette :
 *   texturePeinture : SRGBColorSpace, RepeatWrapping, repeat (1, 3), anisotropy 4 ;
 *   textureRuban : RepeatWrapping, repeat (70, 1) ;
 *   textureBrossee : RepeatWrapping, repeat (1, 1).
 * @param {object} THREE Le module three.js.
 * @param {{texturePeinture?: object, textureRuban?: object, textureBrossee?: object}} [textures]
 *   texturePeinture : map de la peinture. textureRuban : bumpMap du ruban. textureBrossee : roughnessMap du rotor.
 * @returns {{reel: Object<string, object>, simple: Object<string, object>}} Une matière par rôle de ROLES, dans chaque jeu.
 */
export function creerMateriaux(THREE, { texturePeinture, textureRuban, textureBrossee } = {}) {
  const std = (c, r = .7, m = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
  const phy = (c, r, m, o = {}) => new THREE.MeshPhysicalMaterial({ color: c, roughness: r, metalness: m, ...o });
  // Les options d'une texture, ou rien du tout si elle manque : three.js proteste devant une valeur undefined.
  const avec = (texture, options) => (texture ? options : {});

  // Mode simple : couleurs de famille, pas des couleurs réelles. Orange pour les freins, violet pour la transmission.
  const VIOLET = 0x6b5bc2, ORANGE = 0xd9822b;
  const famille = {
    cadre: std(0xa3aeb8, .6), sombre: std(0x3e4955), caoutchouc: std(0x2c3238, .95), jante: std(0x5d6872, .6),
    acier: std(0x8e98a1, .5), freins: std(ORANGE, .5), transmission: std(VIOLET, .5),
  };
  const simple = {
    paint: famille.cadre, protector: famille.sombre, carbon: famille.sombre, black: famille.sombre, tape: famille.sombre,
    hood: famille.sombre, saddle: famille.sombre, rubber: famille.caoutchouc, rim: famille.jante, hub: famille.jante,
    spoke: famille.acier, steel: famille.acier,
    rotor: famille.freins, rotorSpider: famille.freins, caliper: famille.freins, pad: famille.freins, padFace: famille.freins,
    hose: famille.sombre,
    chain: famille.transmission, cassette: famille.transmission, cogSpider: famille.transmission, ring: famille.transmission,
    crank: famille.transmission, rd: famille.transmission, pulley: famille.transmission,
    housing: famille.sombre,
  };

  const reel = {
    paint: phy(0xffffff, .34, .3, { ...avec(texturePeinture, { map: texturePeinture }), clearcoat: 1, clearcoatRoughness: .03 }),
    protector: phy(0x101112, .7, 0),
    carbon: phy(0x0f1012, .42, .1, { clearcoat: .4, clearcoatRoughness: .35 }),
    black: phy(0x131416, .3, .75),
    tape: phy(0x0d0d0e, .88, 0, avec(textureRuban, { bumpMap: textureRuban, bumpScale: 1.5 })),
    hood: phy(0x101011, .68, 0),
    saddle: phy(0x0e0e0f, .5, 0, { clearcoat: .25, clearcoatRoughness: .4 }),
    rubber: phy(0x151515, .9, 0),
    rim: phy(0x111214, .33, .65),
    hub: phy(0x17181a, .3, .8),
    spoke: phy(0x1a1b1d, .28, .9),
    steel: phy(0xc9ccd0, .22, 1),
    rotor: phy(0xd7d9dc, .16, 1, avec(textureBrossee, { roughnessMap: textureBrossee })),
    rotorSpider: phy(0x141517, .3, .8),
    caliper: phy(0x18191b, .36, .7),
    pad: phy(0x8a8c90, .3, 1),
    padFace: phy(0x3a3532, .9, .2),
    hose: phy(0x0c0c0d, .35, 0, { clearcoat: .5 }),
    // Chaîne et cassette : teinte, rugosité et métal réglés d'après la photo officielle de profil
    // (canyon-photo-4556-fv) : un acier argenté un peu chaud, la chaîne plus sombre que la cassette. Leur forme
    // n'a pas changé : de profil, les pignons, tous parallèles, se fondent encore en un disque.
    chain: phy(0x8a857b, .3, 1),
    cassette: phy(0xc9b9a0, .14, 1),
    cogSpider: phy(0x17181a, .32, .8),
    ring: phy(0x141517, .3, .8),
    crank: phy(0x121315, .26, .78, { clearcoat: .3 }),
    rd: phy(0x1a1b1d, .32, .7),
    pulley: phy(0x161616, .6, .1),
    housing: phy(0x0d0d0e, .4, 0, { clearcoat: .4 }),
  };
  return { reel, simple };
}
