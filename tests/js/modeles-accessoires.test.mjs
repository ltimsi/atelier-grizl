// Tests de comportement de la pièce 3D de l'atelier 5.3 (src/js/models/m-rack.js), en plus de son texte, que
// test_pieces_3d_accessoires (tests/test_pages.py) épingle mot pour mot. La visionneuse et la pièce tournent dans le banc
// partagé (banc-modeles.mjs) : faux DOM, contexte vm, sans WebGL.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../../vendor/three/three.module.min.js';
import { basDeLAide, lire, piece, vue } from './banc-modeles.mjs';

// Les titres des étapes de 5.3, dans le chapitre, sans balises, apostrophes typographiques.
function titres() {
  const html = lire('src/parts/60-accessoires.html'), debut = html.indexOf('id="accessoires-rack"');
  const section = html.slice(debut, html.indexOf('</section>', debut));
  return [...section.matchAll(/<p class="st-t">([\s\S]*?)<\/p>/g)].map(m => m[1].replace(/<[^>]+>/g, '').replace(/'/g, '’'));
}
const rack = () => piece('rack', 'm-rack.js');
const monde = o => o.getWorldPosition(new THREE.Vector3());
function boite(o) { o.updateWorldMatrix(true, true); return new THREE.Box3().setFromObject(o); }
const centre = o => boite(o).getCenter(new THREE.Vector3());
// L'étendue d'une pièce le long d'un axe : ses sommets, dans le repère du monde, projetés sur cet axe.
function etendue(o, projette) {
  let min = Infinity, max = -Infinity; const P = new THREE.Vector3();
  o.updateWorldMatrix(true, true);
  o.traverse(m => {
    if (!m.isMesh) return;
    const pos = m.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) { const v = projette(P.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld)); min = Math.min(min, v); max = Math.max(max, v); }
  });
  return [min, max];
}

test('rack : six pastilles au plus par étape, celle que nomme chaque titre, et chacune montrée à une étape', () => {
  const r = rack(), t = titres(), vus = new Set();
  assert.equal(t.length, 14, 'quatorze étapes en 5.3');
  const attendus = { 'Visse le plateau': 'Vis L', 'Étape facultative : deux vis K': 'Vis K', 'Visse les pattes': 'Pattes M',
    'Pose les pattes': 'Patte basculée', 'Pose le bras avant': 'Bras avant', 'Visse la rondelle H': 'Rondelle H',
    'Visse la vis J': 'Vis J', 'Visse le collier': 'Collier C', 'Ferme la sangle': 'Sangle du collier',
    'Étape facultative : vis antivol E': 'Vis antivol E', 'Contrôle le centrage': 'Entretoise', 'Contrôle le côté droit': 'Côté droit',
    'Contrôle le pneu': 'Pneu' };
  for (let n = 1; n <= t.length; n++) {
    r.cran(n);
    const textes = r.textes();
    assert.ok(textes.length >= 1 && textes.length <= 6, `étape ${n} : ${textes.length} pastilles`);
    textes.forEach(x => vus.add(x));
    for (const [titre, pastille] of Object.entries(attendus)) {
      if (t[n - 1].replace(/ /g, ' ').startsWith(titre)) assert.ok(textes.some(x => x.startsWith(pastille)), `étape ${n} : ${pastille}`);
    }
    // vue éclatée : l'axe, l'embout, l'entretoise et l'adaptateur s'ajoutent ; le porte-bagages et les pièces restées
    // autour de l'axe (patte posée, patte UDH, côté droit) s'effacent ; six pastilles au plus, sans doublon
    r.v.ex = r.v.exT = 1; r.v.model.onFrame(0.016);
    const ecl = r.textes();
    for (const debut of ['Universal Thru Axle', 'Embout M12', 'Entretoise', 'Adaptateur UDH']) assert.ok(ecl.some(x => x.startsWith(debut)), `étape ${n}, éclatée : ${debut}`);
    for (const debut of ['Journey Rack', 'Patte basculée', 'Patte SRAM UDH', 'Côté droit']) assert.ok(!ecl.some(x => x.startsWith(debut)), `étape ${n}, éclatée : ${debut} effacée`);
    for (const x of textes) if (!/^(Journey Rack|Patte basculée|Patte SRAM UDH|Côté droit)/.test(x)) assert.ok(ecl.includes(x), `étape ${n}, éclatée : ${x.slice(0, 20)} gardée`);
    assert.ok(ecl.length <= 6 && new Set(ecl).size === ecl.length, `étape ${n}, éclatée : ${ecl.length} pastilles`);
    r.v.ex = r.v.exT = 0; r.v.model.onFrame(0.016);
  }
  const fichier = lire('src/js/models/m-rack.js');
  const toutes = [...fichier.matchAll(/text: '((?:[^'\\]|\\.)*)'/g)].map(x => x[1]);
  assert.deepEqual([...vus].sort(), toutes.slice().sort(), 'chaque pastille est montrée à une étape au moins');
});

test('rack : l’adaptateur UDH, la patte UDH et l’embout à droite ; l’entretoise et la tête de l’axe à gauche', () => {
  const r = rack();
  for (const nom of ['adaptateur UDH', 'rondelle de cadre', 'patte SRAM UDH', 'embout M12 x 1.0']) assert.ok(centre(r.objet(nom)).z > 0, `${nom} : à droite`);
  // l'adaptateur, sa rondelle et la patte UDH contre la patte droite du cadre, pas dans le moyeu ; l'embout dépasse dehors
  for (const nom of ['adaptateur UDH', 'rondelle de cadre', 'patte SRAM UDH']) assert.ok(boite(r.objet(nom)).min.z > 142 / 2, `${nom} : hors du moyeu`);
  assert.ok(boite(r.objet('adaptateur UDH')).max.z > boite(r.objet('rondelle de cadre')).max.z, 'la rondelle sous l’adaptateur');
  for (const nom of ['entretoise', 'collerette de l’axe']) assert.ok(centre(r.objet(nom)).z < 0, `${nom} : à gauche`);
  assert.ok(boite(r.objet('entretoise')).max.z < -142 / 2, 'entretoise : contre la patte gauche, dehors');
  assert.ok(boite(r.objet('collerette de l’axe')).max.z < boite(r.objet('entretoise')).min.z + 0.01, 'la collerette de l’axe dehors, contre l’entretoise');
  // l'axe traverse : un bout dépasse de chaque côté, au-delà des pattes du cadre
  const axe = boite(r.objet('corps de l’axe')).union(boite(r.objet('embout M12 x 1.0')));
  assert.ok(axe.min.z < -142 / 2 - 15 && axe.max.z > 142 / 2 + 15, 'bouts de l’axe dehors');
  // diamètre de 12 mm, celui de la scène de l'accueil
  const corps = boite(r.objet('corps de l’axe'));
  assert.ok(Math.abs(corps.max.y - corps.min.y - 12) < 0.05, `axe de 12 mm : ${corps.max.y - corps.min.y}`);
});

test('rack : la sangle est fermée le plus bas possible, juste au-dessus du collier du cadre, sous la séparation des lames', () => {
  const r = rack(), t = titres(), sangle = t.findIndex(x => x.startsWith('Ferme la sangle')) + 1;
  // le long de l'axe de la tige, depuis le pédalier de la scène de l'accueil
  const a = 73.5 * Math.PI / 180, d = new THREE.Vector3(-Math.cos(a), Math.sin(a), 0);
  const bb = new THREE.Vector3(Math.sqrt(440 ** 2 - 75 ** 2), -75, 0);
  const s = p => p.clone().sub(bb).dot(d);
  const lePlusBas = o => etendue(o, s);
  r.cran(sangle);
  const [, colHaut] = lePlusBas(r.objet('collier du cadre'));
  const fente = s(monde(r.objet('séparation des lames')));
  const bande = r.objet('sangle'), [bas, haut] = lePlusBas(bande);
  assert.ok(bande.visible, 'sangle fermée à son étape');
  assert.ok(bas > colHaut && bas - colHaut < 8, `juste au-dessus du collier : ${(bas - colHaut).toFixed(1)} mm`);
  assert.ok(haut < fente - 20, `sous la séparation des lames : ${(fente - haut).toFixed(1)} mm`);
  r.cran(sangle - 1);
  assert.equal(r.objet('sangle').visible, false, 'sangle ouverte avant son étape');
  assert.equal(r.objet('sangle ouverte').visible, true);
  // à chaque étape : la sangle ouverte se voit du collier posé jusqu'à la sangle fermée, la fermée ensuite, jamais les deux
  const collier = t.findIndex(x => x.startsWith('Visse le collier')) + 1;
  const vu = o => { for (let x = o; x; x = x.parent) if (!x.visible) return false; return true; };
  for (let n = 1; n <= t.length; n++) {
    r.cran(n);
    assert.equal(vu(r.objet('sangle ouverte')), n >= collier && n < sangle, `étape ${n} : sangle ouverte`);
    assert.equal(vu(r.objet('sangle')), n >= sangle, `étape ${n} : sangle fermée`);
  }
});

test('rack : le porte-bagages se pose sur les bouts de l’axe à l’étape des pattes, le bras et le collier à la leur', () => {
  const r = rack(), t = titres(), etape = debut => t.findIndex(x => x.startsWith(debut)) + 1;
  const pose = etape('Pose les pattes'), bras = etape('Pose le bras avant'), collier = etape('Visse le collier');
  const bout = (nom, cote) => { const b = boite(r.objet(nom)); return new THREE.Vector3(0, 0, cote > 0 ? b.max.z : b.min.z); };
  for (let n = 1; n <= t.length; n++) {
    r.cran(n);
    for (const [crochet, cote] of [['crochet droit', 1], ['crochet gauche', -1]]) {
      const c = monde(r.objet(crochet)), d = Math.hypot(c.x, c.y);
      if (n >= pose) assert.ok(d < 0.5, `étape ${n} : ${crochet} sur le bout de l’axe (${d.toFixed(1)})`);
      else assert.ok(d > 60, `étape ${n} : ${crochet} pas encore posé (${d.toFixed(1)})`);
      const z = bout(cote > 0 ? 'embout M12 x 1.0' : 'corps de l’axe', cote).z;
      if (n >= pose) assert.ok(cote * (z - c.z) > 0, `étape ${n} : ${crochet} sur le bout, pas au-delà`);
    }
    assert.equal(r.objet('bras avant').visible, n >= bras, `étape ${n} : bras`);
    assert.equal(r.objet('collier de tige').visible, n >= collier, `étape ${n} : collier`);
    assert.equal(r.objet('vis K').visible, t[n - 1].includes('vis K'), `étape ${n} : vis K facultatives`);
    assert.equal(r.objet('vis antivol E').visible, t[n - 1].includes('vis antivol E'), `étape ${n} : vis E facultative`);
  }
});

test('rack : la pièce de chaque étape s’allume, et elle seule', () => {
  const r = rack(), t = titres(), haut = r.v.M.highlight;
  const pieces = { 'Visse le plateau': 'vis L', 'Étape facultative : deux vis K': 'vis K', 'Visse les pattes': 'vis N',
    'Visse la rondelle H': 'vis I', 'Visse la vis J': 'vis J', 'Visse le collier': 'fixation D', 'Ferme la sangle': 'sangle',
    'Étape facultative : vis antivol E': 'vis antivol E', 'Contrôle le centrage': 'entretoise', 'Pose les pattes': 'goupille droite',
    'Pose le bras avant': 'bras avant', 'Contrôle le côté droit': 'patte M droite' };
  for (let n = 1; n <= t.length; n++) {
    r.cran(n);
    for (const [titre, nom] of Object.entries(pieces)) {
      let allume = false; r.objet(nom).traverse(o => { if (o.material === haut) allume = true; });
      assert.equal(allume, t[n - 1].replace(/ /g, ' ').startsWith(titre), `étape ${n} : ${nom}`);
    }
    let gauche = false; r.objet('goupille gauche').traverse(o => { if (o.material === haut) gauche = true; });
    assert.equal(gauche, t[n - 1].startsWith('Pose les pattes'), `étape ${n} : goupille gauche`);
  }
});

// À l'angle par défaut, dans la vue assemblée comme dans la vue éclatée, chaque pastille de chaque étape se voit : ni du
// côté caché, ni hors de la scène, ni sous l'aide ; deux centres de pastilles sont à 24 px au moins sur une scène de
// 341 px, celle d'un téléphone de 375 px (page à 16 px de marge, bordure de la figure), et à 30 px sur une scène de
// 760 px. Sur une scène de 286 px, celle d'un téléphone de 320 px, elles ne se recouvrent pas non plus (24 px) ; l'aide,
// qui disparaît à la première touche, n'y est pas comptée.
function eclater(r, on) {
  r.v.ex = r.v.exT = on ? 1 : 0;
  r.v.parts.forEach(p => { p.obj.position.copy(p.base); if (on) p.obj.position.add(p.off); });
  r.v.model.onFrame(0.016);
}
for (const [largeur, seuil, aide] of [[341, 24, true], [760, 30, true], [286, 24, false]]) {
  test(`rack : à l’angle par défaut, sur une scène de ${largeur} px, chaque pastille de chaque étape se voit, à ${seuil} px des autres, dans les deux vues`, () => {
    const r = rack(), voir = vue(r, largeur);
    let pire = Infinity;
    for (const eclatee of [false, true]) for (let n = 1; n <= 14; n++) {
      r.cran(n); eclater(r, eclatee);
      const ps = voir(() => r.v.reset()), ou = `${largeur} px, ${eclatee ? 'vue éclatée' : 'vue assemblée'}, étape ${n}`;
      for (const p of ps) {
        const quoi = `${ou} : ${p.texte.slice(0, 40)}`;
        assert.equal(p.cachee, false, `${quoi} : cachée`);
        assert.ok(p.x >= 12 && p.x <= p.largeur - 12 && p.y >= 12 && p.y <= p.hauteur - 12, `${quoi} : hors de la scène (${p.x}, ${p.y})`);
        if (aide) assert.ok(p.y - 12 >= basDeLAide(largeur), `${quoi} : sous l’aide (${p.y})`);
      }
      for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
        const dist = Math.hypot(ps[i].x - ps[j].x, ps[i].y - ps[j].y);
        pire = Math.min(pire, dist);
        assert.ok(dist >= seuil, `${ou} : ${ps[i].texte.slice(0, 20)} et ${ps[j].texte.slice(0, 20)} à ${dist.toFixed(1)} px`);
      }
      eclater(r, false);
    }
    assert.ok(pire < Infinity, 'au moins une paire de pastilles mesurée');
  });
}

// La vue éclatée écarte vraiment les pièces de l'axe : le corps sort par la gauche, l'embout, l'adaptateur et la rondelle
// par la droite, l'entretoise s'écarte du cadre ; le porte-bagages se soulève ; la patte UDH reste dans le cadre.
test('rack : en vue éclatée, l’axe et ses pièces sortent de chaque côté, le porte-bagages se soulève', () => {
  const r = rack();
  r.cran(10);
  const avant = {}, noms = ['corps de l’axe', 'collerette de l’axe', 'entretoise', 'embout M12 x 1.0', 'adaptateur UDH', 'rondelle de cadre', 'patte SRAM UDH', 'crochet droit'];
  for (const nom of noms) avant[nom] = centre(r.objet(nom));
  avant['crochet droit'] = monde(r.objet('crochet droit'));
  eclater(r, true);
  const apres = nom => nom === 'crochet droit' ? monde(r.objet(nom)) : centre(r.objet(nom));
  for (const nom of ['corps de l’axe', 'collerette de l’axe', 'entretoise']) assert.ok(apres(nom).z < avant[nom].z - 30, `${nom} : sort par la gauche`);
  for (const nom of ['embout M12 x 1.0', 'adaptateur UDH', 'rondelle de cadre']) assert.ok(apres(nom).z > avant[nom].z + 30, `${nom} : sort par la droite`);
  assert.ok(boite(r.objet('adaptateur UDH')).min.z > boite(r.objet('rondelle de cadre')).max.z - 0.01, 'la rondelle reste entre le cadre et l’adaptateur');
  assert.ok(apres('crochet droit').y > avant['crochet droit'].y + 10, 'le porte-bagages se soulève');
  assert.ok(apres('patte SRAM UDH').distanceTo(avant['patte SRAM UDH']) < 1e-6, 'la patte UDH reste dans le cadre');
});

test('rack : la ligne du geste suit la barre et dit l’étape de 5.3, à chaque cran', () => {
  const r = rack(), t = titres();
  r.v.model.onFrame(0.016);
  const barre = r.fig.querySelector('.v3d-bar'), ligne = barre.nextElementSibling;
  assert.equal(ligne.className, 'v3d-geste', 'ligne après la barre');
  assert.equal(ligne.textContent, `Étape 10 de 5.3 : ${t[9]}`);
  for (let n = 1; n <= t.length; n++) {
    r.cran(n);
    assert.equal(ligne.textContent, `Étape ${n} de 5.3 : ${t[n - 1]}`);
    assert.equal(r.fig.querySelector('output').textContent, `Étape ${n} / 14`);
  }
  assert.equal(r.fig.querySelectorAll('p.v3d-geste').length, 1, 'une seule ligne');
});

// M11 de la revue finale : l'en-tête de la pièce est coupé vers 125 caractères, comme le reste de son commentaire.
test('rack : l’en-tête de la pièce est coupé à 125 caractères au plus', () => {
  const source = lire('src/js/models/m-rack.js'), entete = source.slice(0, source.indexOf('*/') + 2);
  for (const [i, ligne] of entete.split('\n').entries()) {
    assert.ok(ligne.length <= 125, `ligne ${i + 1} : ${ligne.length} caractères`);
  }
});
