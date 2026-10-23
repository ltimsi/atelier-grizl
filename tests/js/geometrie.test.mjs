// Tests de src/scene/geometrie.js et src/scene/sources.js : données et fonctions pures, sans three.js ni DOM.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GEO, points, cheminChaine, approximations } from '../../src/scene/geometrie.js';
import { SOURCES } from '../../src/scene/sources.js';

const D2R = Math.PI / 180;
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const inclinaison = (a, b) => Math.atan2(Math.abs(b[1] - a[1]), Math.abs(b[0] - a[0])) / D2R;
const proche = (reel, attendu, tol, nom) =>
  assert.ok(Math.abs(reel - attendu) <= tol, `${nom} : ${reel} au lieu de ${attendu} (tolérance ${tol})`);
const textesDeGEO = () => Object.values(GEO).flatMap(e => [e.note, e.aVerifier]).filter(t => t !== undefined);

// Les cotes du cadre, colonne M de la fiche du Grizl CF 8 Di2 (canyon-4556).
const COTES_FICHE = [
  'empattement', 'bases', 'differenceBoitierMoyeu', 'stack', 'reach', 'longueurDouille', 'angleDirection',
  'angleTubeSelle', 'longueurTubeSelle', 'longueurTubeSuperieur', 'stackEfficace', 'reachEfficace', 'largeurBoite',
  'diametreDisque', 'longueurManivelle', 'dentsPlateau', 'longueurPotence', 'largeurCintre',
];

test('cotes Canyon : la fiche 4556 du Grizl CF 8 Di2, taille M', () => {
  for (const cle of COTES_FICHE) {
    assert.equal(GEO[cle].src, 'canyon-4556', `${cle} : source`);
    assert.ok(!GEO[cle].approche, `${cle} : publiée`);
  }
  const p = points();
  proche(p.FA[0] - p.RA[0], 1076, 0.5, 'empattement');
  proche(dist(p.BB, p.RA), 440, 0.5, 'bases');
  proche(p.RA[1] - p.BB[1], 75, 0.5, 'différence axe boîtier / axe moyeu');
  proche(p.HTt[1] - p.BB[1], 596, 0.5, 'stack');
  proche(p.HTt[0] - p.BB[0], 404, 0.5, 'reach');
  proche(dist(p.HTt, p.HTb), 158, 0.5, 'douille de direction');
  proche(inclinaison(p.HTb, p.HTt), 71, 0.1, 'angle de direction');
  proche(inclinaison(p.BB, p.STt), 73.5, 0.1, 'angle du tube de selle');
  proche(dist(p.PR, p.BB), 165, 0.5, 'manivelle droite');
  proche(dist(p.PL, p.BB), 165, 0.5, 'manivelle gauche');
  proche(dist(p.S1, p.S0), 60, 0.5, 'potence');
  proche(dist(p.STt, p.BB), 522, 0.5, 'tube de selle');
  // Tube supérieur horizontal : de l'axe du tube de selle, à la hauteur de HTt, jusqu'à HTt.
  const xAxe = p.BB[0] + (p.HTt[1] - p.BB[1]) * (p.STt[0] - p.BB[0]) / (p.STt[1] - p.BB[1]);
  proche(p.HTt[0] - xAxe, 581, 0.5, 'tube supérieur horizontal');
  proche(GEO.longueurTubeSuperieur.v, 581, 0, 'tube supérieur de la fiche');
});

test('position des mains : stack et reach efficaces du CF 8 Di2, cintre de 440 d’axe en axe', () => {
  const p = points();
  const m = p.ancres.mains;
  assert.equal(GEO.reachEfficace.v, 531);
  assert.equal(GEO.stackEfficace.v, 690);
  proche(m[0] - p.BB[0], 531, 0.05, 'reach efficace');
  proche(m[1] - p.BB[1], 690, 0.05, 'stack efficace');
  proche(m[2], 220, 0.01, 'cocotte droite, côté transmission');
  const g = p.ancres.cocotteGauche;
  proche(g[0], m[0], 0.01, 'cocotte gauche, x');
  proche(g[1], m[1], 0.01, 'cocotte gauche, y');
  proche(g[2], -220, 0.01, 'cocotte gauche, z');
  assert.match(GEO.reachEfficace.aVerifier, /cocotte/);
});

test('ancres : les cinq noms attendus, en trois dimensions, disques à gauche', () => {
  const { ancres } = points();
  for (const nom of ['disqueArriere', 'disqueAvant', 'etrierAvant', 'cocotteGauche', 'mains']) {
    assert.equal(ancres[nom]?.length, 3, nom);
    assert.ok(ancres[nom].every(Number.isFinite), nom);
  }
  for (const nom of ['disqueArriere', 'disqueAvant', 'etrierAvant']) assert.ok(ancres[nom][2] < 0, `${nom} côté gauche`);
  const p = points();
  proche(ancres.disqueArriere[0], p.RA[0], 0.01, 'disque arrière au-dessus de son axe');
  proche(ancres.disqueArriere[1] - p.RA[1], 80, 0.01, 'disque de 160 : rayon de 80');
  proche(ancres.disqueAvant[1] - p.FA[1], 80, 0.01, 'disque avant de 160 : rayon de 80');
  assert.deepEqual([ancres.etrierAvant[0], ancres.etrierAvant[1]], p.CF);
});

test('tige de selle : l’insertion reste dans la plage publiée', () => {
  const p = points();
  const sorti = dist(p.BB, p.SPt) - dist(p.BB, p.STt);
  // SP100 : longueur de 350, insertion de 110 à 210, donc 140 à 240 sortis du tube de selle.
  assert.ok(sorti >= 140 && sorti <= 240, `longueur sortie ${sorti}`);
  proche(dist(p.BB, p.SPt) + GEO.retraitSelle.v, GEO.hauteurSelle.v, 0.01, 'hauteur de selle');
  assert.ok(GEO.hauteurSelle.v >= 710 && GEO.hauteurSelle.v <= 810, 'dans la plage de la fiche');
  // L'écart entre le haut de la tige et le dessus de la selle reste approché : Fizik publie une hauteur de selle sans
  // dire d'où il la prend. La note ne lui prête pas de repère.
  assert.equal(GEO.retraitSelle.approche, true);
  assert.match(GEO.retraitSelle.note, /Fizik/);
  assert.match(GEO.retraitSelle.note, /lue ici depuis l’axe des rails/);
  assert.ok(!/au-dessus des rails/.test(GEO.retraitSelle.note), GEO.retraitSelle.note);
});

test('poste de pilotage : la main est devant le coude du cintre, au-dessus de la potence', () => {
  const p = points();
  const dx = p.ancres.mains[0] - p.S1[0];
  const dy = p.ancres.mains[1] - p.S1[1];
  assert.ok(dx > GEO.deportCintre.v, `main à ${dx} devant la potence, coude à ${GEO.deportCintre.v}`);
  assert.ok(dy > 0, `main à ${dy} au-dessus de la potence`);
  assert.ok(p.S1[1] > p.S0[1], 'la potence monte');
  assert.ok(p.S1[1] - GEO.descenteCintre.v > 0, 'le bas des drops reste au-dessus du sol');
});

test('géométrie dérivée de la donnée : points(geo) lit son paramètre', () => {
  const geo = { ...GEO, empattement: { ...GEO.empattement, v: 1100 } };
  proche(points(geo).FA[0], 1100, 1e-9, 'empattement modifié');
  proche(points().FA[0], 1076, 0.5, 'GEO par défaut inchangé');
});

test('chaîne : quatre arcs sur le pignon, les deux poulies et le plateau', () => {
  const p = points();
  const chemin = cheminChaine(p);
  assert.ok(Array.isArray(chemin) && chemin.length > 40);
  assert.ok(chemin.every(q => q.length === 2 && q.every(Number.isFinite)));
  const rPlateau = GEO.dentsPlateau.v * GEO.pasChaine.v / (2 * Math.PI);
  const surPlateau = chemin.filter(q => Math.abs(dist(q, p.BB) - rPlateau) < 1e-6);
  assert.ok(surPlateau.length >= 10, 'le plateau de 40 dents donne son rayon primitif');
  const pres = chemin.filter(q => dist(q, p.BB) < 2 * rPlateau);
  assert.ok(pres.length >= 10 && pres.every(q => dist(q, p.BB) <= rPlateau + 1e-6), 'rien ne dépasse du plateau');
  assert.ok(chemin.every(q => q[1] > 0), 'la chaîne reste au-dessus du sol');
  // Chape moyenne, comme sur la photo officielle : le galet bas est derrière le galet haut, et plus bas.
  assert.ok(p.poulieBasse[0] < p.poulieHaute[0] && p.poulieBasse[1] < p.poulieHaute[1], 'chape tournée vers l’arrière');
  // Entre les deux galets, la chaîne croise : elle part du devant du galet haut et arrive derrière le galet bas.
  // Le brin est tangent aux deux galets.
  const r = p.rayons.poulie;
  const brin = chemin.filter(q => Math.abs(dist(q, p.poulieHaute) - r) < 1e-6 || Math.abs(dist(q, p.poulieBasse) - r) < 1e-6);
  const dernierHaut = chemin.filter(q => Math.abs(dist(q, p.poulieHaute) - r) < 1e-6).at(-1);
  const premierBas = chemin.find(q => Math.abs(dist(q, p.poulieBasse) - r) < 1e-6);
  assert.ok(brin.length > 4 && dernierHaut && premierBas, 'arcs des galets');
  const d = [premierBas[0] - dernierHaut[0], premierBas[1] - dernierHaut[1]], l = Math.hypot(...d);
  for (const [c, q] of [[p.poulieHaute, dernierHaut], [p.poulieBasse, premierBas]]) {
    const rayon = [q[0] - c[0], q[1] - c[1]];
    proche((rayon[0] * d[0] + rayon[1] * d[1]) / l, 0, 1e-6, 'brin tangent au galet');
  }
});

test('sources connues : chaque cote a une source enregistrée ou est approchée', () => {
  for (const [cle, e] of Object.entries(GEO)) {
    assert.ok(Number.isFinite(e.v), `${cle} : valeur`);
    assert.ok(e.src === null || typeof e.src === 'string', `${cle} : src`);
    assert.ok((e.src && SOURCES[e.src]) || e.approche === true, `${cle} : ni source connue ni approche`);
  }
  assert.equal(GEO.rayonPneu.approche, true, 'rayon extérieur du pneu non publié');
  assert.equal(GEO.diametreSiegeJante.v, 622);
  assert.ok(GEO.rayonPneu.v > GEO.diametreSiegeJante.v / 2, 'le pneu entoure le siège de jante');
  // Angle de la potence, déport et descente du cintre sont publiés : voir le test des cotes officielles qui suit.
  assert.equal(GEO.hauteurSelle.approche, true, 'hauteurSelle');
});

test('transmission et poste : cotes officielles Shimano et Canyon', () => {
  const attendu = {
    ligneChaine: [49.7, 'shimano-fc-rx820-1'], // « Chain line (mm) 49.7 »
    dentsPoulie: [13, 'shimano-rd-m8250-gs'], // « Teeth 13T »
    longueurManivelle: [165, 'canyon-4556'], // « 165,0 (S-M) »
    dentsPlateau: [40, 'canyon-4556'], // « plateau 40 »
    anglePotence: [6, 'canyon-photo-st0046'], // marquage « ANGLE 6° » de la potence de 60
    deportCintre: [70, 'canyon-photo-hb0067-marquage'], // marquage « REACH 70 mm »
    descenteCintre: [128, 'canyon-photo-hb0067-marquage'], // marquage « DROP 128 mm »
  };
  for (const [cle, [v, src]] of Object.entries(attendu)) {
    assert.equal(GEO[cle]?.v, v, `${cle} : valeur`);
    assert.equal(GEO[cle].src, src, `${cle} : source`);
    assert.ok(!GEO[cle].approche, `${cle} : publiée`);
  }
  for (const cle of ['anglePotence', 'deportCintre', 'descenteCintre']) assert.ok(GEO[cle].aVerifier, `${cle} : à vérifier`);
  assert.equal(GEO.rayonPoulie, undefined, 'le rayon des galets découle de leurs dents');
  const p = points();
  proche(p.rayons.poulie, 13 * GEO.pasChaine.v / (2 * Math.PI), 1e-9, 'rayon primitif des galets');
  // Potence de six degrés montée vers le bas : la perpendiculaire à la direction, moins l'angle de la potence.
  proche(inclinaison(p.S0, p.S1), 90 - GEO.angleDirection.v - GEO.anglePotence.v, 1e-9, 'inclinaison de la potence');
  assert.ok(p.S1[0] > p.S0[0] && p.S1[1] > p.S0[1], 'la potence monte vers l’avant');
});

test('rayons : vingt-quatre par roue, publiés par Canyon pour les GR 30 CF', () => {
  // « 24 front and rear » sur la page de la paire de roues, et vingt-quatre comptés sur la photo officielle du vélo.
  assert.equal(GEO.nombreRayons.v, 24);
  assert.equal(GEO.nombreRayons.src, 'canyon-gr30cf');
  assert.ok(!GEO.nombreRayons.approche);
  assert.equal(GEO.nombreRayons.aVerifier, undefined, 'le nombre n’est plus à compter');
});

test('siège de jante : 622, l’ETRTO 45-622 du pneu Schwalbe', () => {
  assert.equal(GEO.diametreSiegeJante.v, 622);
  assert.equal(GEO.diametreSiegeJante.src, 'schwalbe-g-one-rx');
  assert.ok(!GEO.diametreSiegeJante.approche);
});

test('boîte de pédalier : PF 86,5 d’après la fiche du CF 8 Di2, soit 43,25 de chaque côté', () => {
  assert.equal(GEO.largeurBoite.v, 86.5);
  assert.equal(GEO.largeurBoite.src, 'canyon-4556');
  assert.ok(!GEO.largeurBoite.approche);
  assert.equal(GEO.largeurBoite.v / 2, 43.25);
});

test('étriers : position approchée d’après la photo officielle, l’avant au-dessus de l’axe et derrière lui', () => {
  const p = points();
  for (const cle of ['angleEtrierAvant', 'angleEtrierArriere', 'rayonEtrier']) assert.equal(GEO[cle].approche, true, cle);
  assert.ok(p.CF[0] < p.FA[0] && p.CF[1] > p.FA[1], 'étrier avant en haut, vers l’arrière');
  assert.ok(p.CR[0] > p.RA[0] && p.CR[1] > p.RA[1], 'étrier arrière en haut, vers l’avant, sur la base');
});

test('approximations sans chiffre : une note par cote approchée', () => {
  const liste = approximations();
  const approchees = Object.keys(GEO).filter(c => GEO[c].approche);
  assert.deepEqual(liste.map(a => a.cle), approchees);
  for (const { cle, note } of liste) {
    assert.ok(typeof note === 'string' && note.length > 10, `${cle} : note`);
    assert.ok(!/\d/.test(note), `${cle} : chiffre dans la note « ${note} »`);
  }
  const geo = { ...GEO, zzz: { v: 1, src: null, approche: true } };
  assert.ok(approximations(geo).some(a => a.cle === 'zzz' && !/\d/.test(a.note)), 'note de repli sans chiffre');
});

test('angle de direction à vérifier : le nom de la fiche est cité', () => {
  assert.match(GEO.angleDirection.aVerifier, /inclinaison du cintre/);
});

test('textes du guide : français sans chiffre ni tiret long', () => {
  for (const t of textesDeGEO()) {
    assert.ok(!/[—–]/.test(t), `tiret long dans « ${t} »`);
    assert.ok(!/\d/.test(t), `chiffre dans « ${t} »`);
  }
  for (const [id, s] of Object.entries(SOURCES)) assert.ok(!/[—–]/.test(s.titre), `${id} : tiret long`);
});

test('textes du guide : ni accès à un document ni date de lecture', () => {
  const ACCES_OU_DATE = /accessib|consultab|jour du relev|403|maintenance|pendant la rédaction/i;
  for (const t of textesDeGEO()) assert.ok(!ACCES_OU_DATE.test(t), `accès ou date dans « ${t} »`);
  // Le motif attrape bien les tournures visées.
  for (const t of ['pas accessibles le jour du relevé', 'page non consultable', 'erreur 403', 'site en maintenance']) {
    assert.ok(ACCES_OU_DATE.test(t), t);
  }
});

test('registre des sources : forme, types et documents attendus', () => {
  const types = ['fiche', 'manuel', 'photo', 'tableau'];
  for (const [id, s] of Object.entries(SOURCES)) {
    assert.match(id, /^[a-z0-9-]+$/, id);
    assert.ok(s.titre && typeof s.titre === 'string', `${id} : titre`);
    assert.match(s.url, /^https:\/\/\S+$/, `${id} : url`);
    assert.ok(types.includes(s.type), `${id} : type ${s.type}`);
  }
  const manuels = Object.values(SOURCES).filter(s => s.type === 'manuel').map(s => s.url);
  for (const url of [
    'https://si.shimano.com/fr/pdfs/dm/GADBR01/DM-GADBR01-10-FRE.pdf',
    'https://si.shimano.com/en/pdfs/dm/HB0002/DM-HB0002-14-ENG.pdf',
    'https://si.shimano.com/en/pdfs/dm/TORQUE/DM-TORQUE-03-ENG.pdf',
    'https://si.shimano.com/en/pdfs/dm/RAWH010/DM-RAWH010-02-ENG.pdf',
  ]) assert.ok(manuels.includes(url), `manuel Shimano absent : ${url}`);
  assert.ok(!Object.values(SOURCES).some(s => /parktool|bikeradar|youtube/i.test(s.url)), 'source non officielle');
});

test('registre des sources : les documents du Grizl CF 8 Di2', () => {
  const ids = [
    'canyon-4556', 'canyon-4556-en', 'canyon-photo-4556-fv', 'canyon-photo-4556-confort',
    'canyon-photo-4556-degagement', 'canyon-gr30cf', 'canyon-manuel-roues',
    'shimano-dm-gadbr10', 'shimano-dm-gadbr01-11', 'shimano-gamme-rx820-1x12-di2', 'shimano-st-rx825',
    'shimano-br-rx820', 'shimano-ev-br-rx820', 'shimano-rd-m8250-gs', 'shimano-cs-m8200-12', 'shimano-fc-rx820-1',
    'shimano-sm-bb72-41b', 'shimano-cn-m8100', 'shimano-bt-dn320',
    'schwalbe-g-one-rx', 'fizik-argo-terra-x5',
  ];
  for (const id of ids) {
    assert.ok(SOURCES[id], `source absente : ${id}`);
    assert.match(SOURCES[id].url, /^https:\/\//, `${id} : url`);
  }
  assert.equal(SOURCES['canyon-4556'].url,
    'https://www.canyon.com/fr-ch/velos-de-gravel/adventure/grizl/cf/grizl-cf-8-di2/4556.html?dwvar_4556_pv_rahmenfarbe=R126_P06');
  assert.equal(SOURCES['canyon-4556-en'].url,
    'https://www.canyon.com/en-ch/gravel-bikes/adventure/grizl/cf/grizl-cf-8-di2/4556.html');
  assert.equal(SOURCES['canyon-photo-4556-fv'].type, 'photo');
  assert.equal(SOURCES['canyon-photo-4556-fv'].url,
    'https://dma.canyon.com/image/upload/w_2400,c_fit/b_rgb:F2F2F2/f_auto/q_auto/v1785934014/2027_FULL_grizl_cf-8-di2_4556_R126_P06_vpvgno');
  assert.equal(SOURCES['shimano-dm-gadbr10'].type, 'manuel');
  assert.match(SOURCES['shimano-dm-gadbr10'].url, /DM-GADBR10-04-/);
  assert.match(SOURCES['shimano-dm-gadbr01-11'].url, /DM-GADBR01-11-/);
  // Les photos viennent du carrousel de la fiche et montrent ce vélo : sa 2e image, un Grizl CF 6, n'y est pas.
  for (const id of ['canyon-photo-4556-fv', 'canyon-photo-4556-confort', 'canyon-photo-4556-degagement']) {
    assert.equal(SOURCES[id].type, 'photo', id);
    assert.match(SOURCES[id].url, /grizl_cf-8-di2_4556_R126_P06/, id);
  }
});

// Le Grizl CF 7 et ses pièces, que le CF 8 Di2 remplace : fiche, photos, pneus, selle, transmission, manettes, disques.
const CF7 = /4553|cf-7|CF 7|continental|terra-adventure|terra adventure|selle royal|\bSRX\b|rx822|m7100|rx610|sm-rt64|rs500/i;

test('registre des sources : plus aucune source du Grizl CF 7 ni de ses pièces', () => {
  for (const [id, s] of Object.entries(SOURCES)) {
    for (const t of [id, s.titre, s.url]) assert.ok(!CF7.test(t), `${id} : « ${t} »`);
  }
  // Le motif attrape bien les anciennes sources.
  for (const t of ['canyon-4553', 'grizl-cf-7', 'continental-terra-adventure', 'Selle Royal SRX', 'shimano-rd-rx822-gs',
    'CS-M7100-12', 'FC-RX610-1', 'shimano-rx610-1x12', 'SM-RT64', 'BB-RS500-PB']) assert.ok(CF7.test(t), t);
  // Les documents du CF 8 Di2 restent, même ceux que seule la recherche cite : la page Sources les montre.
  for (const id of ['canyon-4556-en', 'shimano-sm-bb72-41b', 'shimano-cn-m8100', 'shimano-dm-gadbr10']) {
    assert.ok(SOURCES[id], id);
  }
});

test('géométrie : chaque source citée existe, aucune n’est du CF 7', () => {
  for (const [cle, e] of Object.entries(GEO)) {
    if (e.src === null) continue;
    assert.ok(SOURCES[e.src], `${cle} : source inconnue ${e.src}`);
    assert.ok(!CF7.test(e.src), `${cle} : source du CF 7 ${e.src}`);
  }
});

test('en-tête de geometrie.js : le Grizl CF 8 Di2, plus rien du CF 7', () => {
  const code = readFileSync(new URL('../../src/scene/geometrie.js', import.meta.url), 'utf8');
  assert.match(code.split('\n')[0], /Grizl CF 8 Di2, taille M/);
  assert.ok(!CF7.test(code), 'le CF 7 est encore cité');
});

test('transmission dessinée : la chaîne sur un pignon de la cassette, la chape approchée', () => {
  for (const cle of ['dentsPignonDessine', 'decalagePoulieHaute', 'descentePoulieHaute', 'ecartPoulies', 'angleCage']) {
    assert.equal(GEO[cle].approche, true, cle);
    assert.ok(/photo officielle/.test(GEO[cle].note), `${cle} : « ${GEO[cle].note} »`);
  }
  assert.ok(/moyenne/.test(GEO.ecartPoulies.note), 'la fiche Canyon donne une chape moyenne');
});

test('modules purs : ni import, ni DOM, ni three.js', () => {
  for (const f of ['geometrie.js', 'sources.js']) {
    const code = readFileSync(new URL(`../../src/scene/${f}`, import.meta.url), 'utf8');
    assert.ok(!/^\s*import\b/m.test(code), `${f} : import`);
    assert.ok(!/\b(document|window|navigator|localStorage)\s*[.[]/.test(code), `${f} : DOM`);
    assert.ok(!/\bTHREE\b|from\s+['"]three/.test(code), `${f} : three.js`);
  }
});
