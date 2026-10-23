// Schéma 2D du vélo, vu côté transmission : la vue à plat du guide, et le secours quand la 3D ne se charge pas.
// Porté de build2d() de la maquette, mais dessiné depuis points(), GEO, les cotes des pièces (COTES) et la pose du
// poste de pilotage (poste.js) et de la selle (cadre.js) : étriers à leurs angles, tube de selle, selle et cocottes
// là où les met la 3D.
//
// Repère du dessin : x vers l'avant en millimètres, y du SVG vers le bas. Le haut du vélo est donc en y négatif et le
// sol en y = 0. Les pièces du côté gauche (disques, étriers, durites, manivelle gauche) sont en pointillés.
// Les nombres de DESSIN et des fonctions de ce fichier sont des valeurs de dessin du schéma : largeurs des tubes,
// moyeux, chape, trajet des durites. Ils reprennent la maquette ou les pièces 3D. Aucun n'est une cote.
//
// Classes des formes, à styler par la page (celles de la maquette) : o (pièce claire cernée), n (trait), t (trait
// fin), k (pièce sombre), kb (cintre), kb2 (levier), h (pointillés du côté gauche), ch et ch2 (chaîne), ground (sol).
// Chaque zone a un ou plusieurs groupes <g data-zone="id"> ; surligner(id) leur donne la classe on.
// Aucun import nu. Le DOM ne sert que dans dessinerSchema : le reste se calcule et se teste sous Node.
import { GEO, cheminChaine } from './geometrie.js';
import { COTES as COTES_CADRE, poseSelle } from './pieces/cadre.js';
import { COTES as COTES_ROUES } from './pieces/roues.js';
import { COTES as COTES_TRANSMISSION, DENTS_CASSETTE } from './pieces/transmission.js';
import { poseCintre, COCOTTE, LEVIER } from './pieces/poste.js';

const NS = 'http://www.w3.org/2000/svg';
const D2R = Math.PI / 180;
const DUREE_CADRAGE = 650; // en millisecondes, comme la maquette

// ---- Valeurs de dessin du schéma (voir l'en-tête) ----
const DESSIN = Object.freeze({
  marge: 50, // autour du vélo, pour la vue d'ensemble et le sol
  hauteurZone: 0.7, // hauteur du cadre d'une zone, en part de sa largeur
  piste: 16, // largeur de la piste des disques
  // Rayon du moyeu, cercle des trous de rayons, décalage des rayons en degrés.
  moyeu: 24, flasque: 22.5, decalageRayon: 22,
  contreEcrou: 17,
  // Étrier, comme freins.js : le long du disque, en travers, et son centre au-delà de son point.
  etrier: Object.freeze({ long: 56, large: 32, avance: 6 }),
});

const f = n => Math.round(n * 10) / 10;
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const mul = (a, k) => [a[0] * k, a[1] * k];
const nrm = a => { const l = Math.hypot(a[0], a[1]); return [a[0] / l, a[1] / l]; };
const pol = (c, r, deg) => [c[0] + r * Math.cos(deg * D2R), c[1] + r * Math.sin(deg * D2R)];
const rot = (a, t) => [a[0] * Math.cos(t) - a[1] * Math.sin(t), a[0] * Math.sin(t) + a[1] * Math.cos(t)];
const normale = d => [d[1], -d[0]]; // quart de tour horaire, comme cadre.js
const rayonPrimitif = (dents, pas) => dents * pas / (2 * Math.PI);
const adoucir = k => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const reduit = () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

// Contour d'un engrenage à n dents centré en c : quatre points par dent, comme la maquette.
function engrenage(c, n, rPointe, rPied) {
  const o = [], d = 2 * Math.PI / n;
  for (let i = 0; i < n; i++) {
    const a = i * d;
    o.push([rPied, a], [rPointe, a + d * 0.3], [rPointe, a + d * 0.55], [rPied, a + d * 0.85]);
  }
  return o.map(([r, a]) => [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]);
}

/**
 * Les formes du schéma, sans DOM : des groupes de formes SVG, dans l'ordre du dessin (du fond vers l'avant).
 * @param {object} p Les points de points(geo).
 * @param {object} [geo=GEO] GEO, ou un objet de même forme.
 * @returns {{groupes: {zone: string|null, formes: {tag: string, attrs: object, nom?: string}[]}[],
 *   boite: {x: number, y: number, w: number, h: number}}} boite : le vélo entier, sol compris, en coordonnées du SVG.
 */
export function formesSchema(p, geo = GEO) {
  const groupes = [];
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity; // en millimètres du vélo, y vers le haut
  const etendre = (q, r = 0) => {
    x0 = Math.min(x0, q[0] - r); x1 = Math.max(x1, q[0] + r);
    y0 = Math.min(y0, q[1] - r); y1 = Math.max(y1, q[1] + r);
  };
  const groupe = (zone = null) => { const g = { zone, formes: [] }; groupes.push(g); return g; };
  const ajouter = (g, tag, attrs, nom) => g.formes.push(nom ? { tag, attrs, nom } : { tag, attrs });
  const P = q => `${f(q[0])} ${f(-q[1])}`;

  const chemin = (g, pts, cls, ferme = true, nom) => {
    pts.forEach(q => etendre(q));
    ajouter(g, 'path', { d: pts.map((q, i) => (i ? 'L' : 'M') + P(q)).join('') + (ferme ? 'Z' : ''), class: cls }, nom);
  };
  const cercle = (g, c, r, cls) => {
    etendre(c, r);
    ajouter(g, 'circle', { cx: f(c[0]), cy: f(-c[1]), r: f(r), class: cls });
  };
  // Capsule de a (rayon r1) à b (rayon r2) : un tube vu de côté.
  const capsule = (g, a, b, r1, r2, cls) => {
    const d = nrm(sub(b, a)), n = [-d[1], d[0]];
    const p1 = add(a, mul(n, r1)), p2 = add(b, mul(n, r2)), p3 = add(b, mul(n, -r2)), p4 = add(a, mul(n, -r1));
    etendre(a, r1); etendre(b, r2);
    ajouter(g, 'path', {
      d: `M${P(p1)}L${P(p2)}A${f(r2)} ${f(r2)} 0 0 1 ${P(p3)}L${P(p4)}A${f(r1)} ${f(r1)} 0 0 1 ${P(p1)}Z`, class: cls,
    });
  };
  // Rectangle de w sur h centré en c, son côté w tourné de deg degrés.
  const boite = (g, c, w, h, deg, cls, nom) => {
    const ux = pol([0, 0], 1, deg), uy = pol([0, 0], 1, deg + 90);
    const coin = ([x, y]) => add(add(c, mul(ux, x)), mul(uy, y));
    chemin(g, [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]].map(coin), cls, true, nom);
  };
  // Anneau entre les rayons r1 et r2 : le pneu.
  const anneau = (g, c, r1, r2, cls) => {
    etendre(c, Math.max(r1, r2));
    const [cx, cy] = [f(c[0]), f(-c[1])];
    const un = r => `M${f(cx - r)} ${cy}a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0Z`;
    ajouter(g, 'path', { d: un(r1) + un(r2), class: cls, 'fill-rule': 'evenodd' });
  };

  const { RA, FA, BB, HTt, HTb, STt, S0, S1, PR, PL, CF, CR, CROWN, dHT, dST, rayons } = p;
  const { poulieHaute, poulieBasse } = p;
  const rDisque = geo.diametreDisque.v / 2, pas = geo.pasChaine.v;
  const siege = geo.diametreSiegeJante.v / 2;

  // Étriers : av(radial, long) et ar(radial, long) partent du point de l'étrier, vers l'extérieur du disque, puis le
  // long du disque.
  const repereEtrier = (c, deg) => (r, l) => add(add(c, pol([0, 0], r, deg)), pol([0, 0], l, deg + 90));
  const av = repereEtrier(CF, geo.angleEtrierAvant.v), ar = repereEtrier(CR, geo.angleEtrierArriere.v);
  const E = DESSIN.etrier;

  const sol = groupe();

  // ---- Côté gauche, en pointillés, derrière les roues ----
  const gDisques = groupe('disques');
  for (const c of [RA, FA]) { cercle(gDisques, c, rDisque, 'h'); cercle(gDisques, c, rDisque - DESSIN.piste, 'h'); }

  // Durites : du fourreau gauche à l'étrier avant, de l'étrier arrière à la base gauche, du cintre au jeu de direction.
  // Trajets repris de freins.js et de poste.js.
  const gDurites = groupe('manettes');
  const u = nrm(sub(CROWN, FA)), lFourreau = Math.hypot(...sub(CROWN, FA)), derriere = [-u[1], u[0]];
  const leFourreau = (t, ecart) => add(add(FA, mul(u, lFourreau * t)), mul(derriere, ecart));
  chemin(gDurites, [av(10, 38), av(40, 52), leFourreau(0.45, 28), leFourreau(0.75, 29), leFourreau(1, 18)], 'h', false);
  chemin(gDurites, [ar(10, -38), ar(10, -48), add(RA, [125, 5]), add(RA, [170, -1]), add(RA, [200, -10])], 'h', false);
  const pose = poseCintre(p, geo);
  const arrierePivot = [-dHT[1], dHT[0]];
  const lePivot = (k, r) => add(add(HTt, mul(dHT, k)), mul(arrierePivot, r));
  const axeCintre = pose.points.map(q => [q[0], q[1]]);
  const sousLeRuban = axeCintre.slice(0, pose.iCollier + 1).reverse();
  chemin(gDurites, [...sousLeRuban, lePivot(32, 40), lePivot(16, 31), lePivot(6, 21)], 'h', false);

  capsule(groupe(), BB, PL, 14, 10, 'h'); // manivelle gauche

  // ---- Roues ----
  const gRoues = groupe();
  const rJante = siege - COTES_ROUES.hauteurJante.v, n = geo.nombreRayons.v;
  for (const c of [RA, FA]) {
    anneau(gRoues, c, geo.rayonPneu.v, siege, 'k');
    cercle(gRoues, c, siege, 'n');
    cercle(gRoues, c, rJante, 't');
    for (let i = 0; i < n; i++) {
      const a = i * 360 / n, cote = (i % 4 < 2 ? 1 : -1) * DESSIN.decalageRayon;
      const [h, r] = [pol(c, DESSIN.flasque, a + cote), pol(c, rJante, a)];
      ajouter(gRoues, 'line', { x1: f(h[0]), y1: f(-h[1]), x2: f(r[0]), y2: f(-r[1]), class: 't' });
    }
    cercle(gRoues, c, DESSIN.moyeu, 'o');
    cercle(gRoues, c, COTES_ROUES.diametreAxe.v / 2, 'n');
  }

  // ---- Cadre et fourche, avec les valeurs de dessin de cadre.js ----
  const gCadre = groupe();
  const avantST = normale(dST);
  capsule(gCadre, [BB[0] + 5, BB[1] + 30], [RA[0] + 14, RA[1] - 8], 33, 8, 'o'); // base
  capsule(gCadre, add(STt, mul(dST, -72)), [RA[0] + 5, RA[1] + 35], 11, 10, 'o'); // hauban
  boite(gCadre, [RA[0] + 8, RA[1] + 12], 46, 56, 0.25 / D2R, 'o'); // patte arrière
  const avantF = mul(normale(nrm(sub(FA, CROWN))), -1);
  capsule(gCadre, add(CROWN, mul(avantF, 6)), FA, 24.5, 20.5, 'o'); // fourreau
  const couronne = add(add(CROWN, mul(dHT, 3)), mul(normale(dHT), 4));
  boite(gCadre, couronne, 52, 26, Math.atan2(dHT[1], dHT[0]) / D2R - 90, 'o'); // couronne
  capsule(gCadre, add(BB, [6, -7]), add(HTb, mul(dHT, 64)), 30.5, 30.5, 'o'); // tube oblique
  capsule(gCadre, add(BB, mul(avantST, 4.5)), add(STt, mul(avantST, 4.5)), 16, 19.5, 'o'); // tube de selle
  capsule(gCadre, add(STt, mul(dST, -26)), add(HTt, mul(dHT, -30)), 14, 17.5, 'o'); // tube supérieur
  capsule(gCadre, HTb, HTt, 26.5, 26.5, 'o'); // douille
  cercle(gCadre, BB, 26.5, 'o'); // boîte de pédalier

  // ---- Cassette, plateau, chaîne ----
  const gCassette = groupe();
  DENTS_CASSETTE.forEach((dents, k) => {
    cercle(gCassette, RA, rayonPrimitif(dents, pas) + 2.5, k === 0 || k === DENTS_CASSETTE.length - 1 ? 'n' : 't');
  });
  cercle(gCassette, RA, DESSIN.contreEcrou, 'n');
  const gPlateau = groupe();
  chemin(gPlateau, engrenage(BB, geo.dentsPlateau.v, rayons.plateau + 4.5, rayons.plateau - 2), 'o');
  cercle(gPlateau, BB, COTES_TRANSMISSION.entraxe.v / 2, 'n');
  const gChaine = groupe();
  const chaine = cheminChaine(p);
  chemin(gChaine, chaine, 'ch');
  chemin(gChaine, chaine, 'ch2');

  // ---- Collier, tige et selle, posés comme dans la 3D (poseSelle de cadre.js) ----
  const gSelle = groupe();
  const rTige = COTES_CADRE.diametreTige.v / 2, selle = poseSelle(p, geo);
  capsule(gSelle, add(STt, mul(dST, -8)), add(STt, mul(dST, 12)), rTige + 5, rTige + 5, 'k'); // collier
  capsule(gSelle, add(STt, mul(dST, 12)), selle.fente, rTige, rTige, 'k'); // tige, ses deux lames serrées
  for (const lame of selle.lames) {
    lame.slice(1).forEach((q, i) => capsule(gSelle, lame[i], q, selle.rayonLame, selle.rayonLame, 'k'));
  }
  for (const c of selle.vis) cercle(gSelle, c, selle.rayonOeil, 'k');
  for (const { centre, longueur, hauteur } of selle.tete) boite(gSelle, centre, longueur, hauteur, 0, 'k'); // tête
  chemin(gSelle, selle.rails[0].map(q => [q[0], q[1]]), 'n', false);
  // Selle : sa silhouette de profil, le dessus de l'arrière au bec, puis le dessous du bec à l'arrière.
  const hauts = selle.sections.map(t => [t[0][0], Math.max(...t.map(q => q[1]))]);
  const bas = selle.sections.map(t => [t[0][0], Math.min(...t.map(q => q[1]))]).reverse();
  chemin(gSelle, [...hauts, ...bas], 'k');

  // ---- Jeu de direction, potence et cintre ----
  const gPoste = groupe();
  const du = nrm(sub(S1, S0));
  capsule(gPoste, HTt, add(S0, mul(dHT, -21)), 23, 19, 'k'); // capot et entretoise
  capsule(gPoste, add(S0, mul(dHT, -21)), add(S0, mul(dHT, 25)), 21, 17, 'k'); // serrage de la potence
  capsule(gPoste, add(S0, mul(du, 12)), add(S1, mul(du, -14)), 16, 14, 'k'); // corps de la potence
  chemin(gPoste, [S1, ...axeCintre], 'kb', false); // cintre droit, vu de côté
  cercle(gPoste, S1, 21.5, 'k'); // collier du cintre

  // ---- Cocotte et levier, posés comme dans la 3D : la prise tombe sur la main publiée ----
  const gManette = groupe('manettes');
  const versVelo = q => add(pose.collier, rot(q, pose.angle));
  const contour = [...COCOTTE.map(([x, h]) => [x, h]), ...COCOTTE.map(([x, , b]) => [x, b]).reverse()];
  chemin(gManette, contour.map(versVelo), 'k', true, 'cocotte');
  chemin(gManette, LEVIER.map(versVelo), 'kb2', false, 'levier');

  // ---- Côté droit, devant : manivelle et dérailleur ----
  const gManivelle = groupe();
  capsule(gManivelle, BB, PR, 15, 11, 'k');
  cercle(gManivelle, BB, 12, 'n');
  const gDerailleur = groupe();
  boite(gDerailleur, [RA[0] - 6, RA[1] - 16], 16, 34, -0.3 / D2R, 'k'); // patte de dérailleur, comme cadre.js
  const pied = add(RA, [-8.7, -24.6]), moyeuChape = add(poulieHaute, [8, 10]); // comme transmission.js
  capsule(gDerailleur, add(pied, [3, -10]), add(moyeuChape, [-2, 10]), 9, 8, 'k');
  capsule(gDerailleur, poulieHaute, poulieBasse, 14, 30, 'n'); // chape
  for (const c of [poulieHaute, poulieBasse]) {
    chemin(gDerailleur, engrenage(c, geo.dentsPoulie.v, rayons.poulie + 2.2, rayons.poulie - 1.5), 'o');
    cercle(gDerailleur, c, 4, 'n');
  }

  // ---- Les étriers, en pointillés, par-dessus la fourche et les haubans pour rester lisibles ----
  boite(groupe('etrier'), av(E.avance, 0), E.long, E.large, geo.angleEtrierAvant.v + 90, 'h', 'étrier avant');
  boite(groupe(), ar(E.avance, 0), E.long, E.large, geo.angleEtrierArriere.v + 90, 'h', 'étrier arrière');

  // Le sol, sous tout le reste, sans compter dans la boîte du vélo.
  ajouter(sol, 'line', { x1: f(x0 - DESSIN.marge), y1: 0, x2: f(x1 + DESSIN.marge), y2: 0, class: 'ground' });

  return { groupes, boite: { x: x0, y: -y1, w: x1 - x0, h: y1 - y0 } };
}

/**
 * Cadre de vue centré en (cx, cy), de largeur l et de hauteur h au moins, élargi au rapport largeur / hauteur de
 * l'écran quand il est connu.
 * @returns {{x: number, y: number, w: number, h: number}} Le viewBox du SVG.
 */
export function cadreVue(cx, cy, l, h, rapport) {
  if (rapport > 0) { if (l / h > rapport) h = l / rapport; else l = h * rapport; }
  return { x: cx - l / 2, y: cy - h / 2, w: l, h };
}

/**
 * Point du vélo [x, y] (millimètres, y vers le haut) vers les pixels d'un SVG de w sur h en xMidYMid meet.
 * Une pastille reste visible jusqu'à vingt pixels hors de l'image, comme dans la maquette.
 * @returns {{x: number, y: number, visible: boolean}}
 */
export function versPixelsSchema([x, y], vb, w, h, marge = 20) {
  const s = Math.min(w / vb.w, h / vb.h), ox = (w - vb.w * s) / 2, oy = (h - vb.h * s) / 2;
  const px = ox + (x - vb.x) * s, py = oy + (-y - vb.y) * s;
  return { x: px, y: py, visible: px >= -marge && py >= -marge && px <= w + marge && py <= h + marge };
}

/**
 * Dessine le schéma dans un <svg> vide (il est vidé s'il ne l'est pas) et règle son cadre sur la vue d'ensemble.
 * @param {SVGSVGElement} svg Le SVG de la scène.
 * @param {object} p Les points de points().
 * @param {object[]} zones Le contenu de zones.json.
 * @returns {{cadrer: Function, pastilles: Function, surligner: Function}}
 *   cadrer(id | null) : cadre la zone (son schema.centre et sa largeur) ou tout le vélo, en 650 ms, ou tout de suite
 *   si l'utilisateur préfère réduire les animations. Pendant le cadrage, rappelle pastilles à chaque image.
 *   pastilles(w, h) : la place en pixels de l'ancre de chaque zone, pour un SVG de w sur h : [{ id, x, y, visible }].
 *   surligner(id | null) : la classe on sur les groupes de la zone, et sur eux seuls.
 * Le cadre prend le rapport de l'image du SVG au moment de cadrer : rappelle cadrer après un changement de taille, ou
 * quand le SVG redevient visible.
 */
export function dessinerSchema(svg, p, zones) {
  const doc = svg.ownerDocument;
  const { groupes, boite } = formesSchema(p, GEO);
  const ancre = nom => {
    if (!p.ancres[nom]) throw new Error(`Ancre inconnue : ${nom}`);
    return p.ancres[nom];
  };
  const zone = id => {
    const z = zones.find(x => x.id === id);
    if (!z) throw new Error(`Zone inconnue : ${id}`);
    return z;
  };
  for (const z of zones) { ancre(z.ancre); ancre(z.schema.centre); }

  svg.replaceChildren();
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  const parZone = [];
  for (const g of groupes) {
    const el = doc.createElementNS(NS, 'g');
    if (g.zone) { el.setAttribute('data-zone', g.zone); parZone.push(el); }
    for (const fo of g.formes) {
      const e = doc.createElementNS(NS, fo.tag);
      for (const [k, v] of Object.entries(fo.attrs)) e.setAttribute(k, v);
      el.appendChild(e);
    }
    svg.appendChild(el);
  }

  // Rapport de l'image du SVG, s'il est affiché. Caché, il n'a pas de taille : le cadre garde son propre rapport.
  const rapport = () => {
    const r = svg.getBoundingClientRect();
    return r.width > 0 && r.height > 0 ? r.width / r.height : null;
  };
  const cible = id => {
    if (id === null || id === undefined) {
      const m = DESSIN.marge;
      return cadreVue(boite.x + boite.w / 2, boite.y + boite.h / 2, boite.w + 2 * m, boite.h + 2 * m, rapport());
    }
    const z = zone(id), c = ancre(z.schema.centre);
    return cadreVue(c[0], -c[1], z.schema.largeur, z.schema.largeur * DESSIN.hauteurZone, rapport());
  };

  let vb = null, anim = null;
  const poser = v => {
    vb = v;
    svg.setAttribute('viewBox', `${f(v.x)} ${f(v.y)} ${f(v.w)} ${f(v.h)}`);
  };
  function cadrer(id) {
    const t = cible(id), raf = globalThis.requestAnimationFrame;
    if (!vb || !raf || reduit()) { anim = null; poser(t); return; }
    const de = { ...vb }, t0 = globalThis.performance.now(), jeton = {};
    anim = jeton;
    const pas = now => {
      if (anim !== jeton) return; // un autre cadrage a pris la main
      const k = Math.min(1, Math.max(0, (now - t0) / DUREE_CADRAGE)), e = adoucir(k);
      const m = c => de[c] + (t[c] - de[c]) * e;
      poser({ x: m('x'), y: m('y'), w: m('w'), h: m('h') });
      if (k < 1) raf(pas); else anim = null;
    };
    raf(pas);
  }
  const pastilles = (w, h) => zones.map(z => ({ id: z.id, ...versPixelsSchema(ancre(z.ancre), vb, w, h) }));
  const surligner = id => { for (const el of parZone) el.classList.toggle('on', el.getAttribute('data-zone') === id); };

  cadrer(null);
  return { cadrer, pastilles, surligner };
}
