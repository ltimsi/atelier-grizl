// Tests de comportement des pièces 3D des ateliers de la transmission (src/js/models/m-chain.js, m-cassette.js et
// m-derailleur.js), en plus de leur texte, que test_pieces_3d_transmission (tests/test_pages.py) épingle mot pour mot.
// La visionneuse et la pièce tournent dans le banc partagé (banc-modeles.mjs) : faux DOM, contexte vm, sans WebGL.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../../vendor/three/three.module.min.js';
import { El, MEDIAS, basDeLAide, lire, piece, vue } from './banc-modeles.mjs';

// Les titres des étapes d'un atelier, dans le chapitre, sans balises.
function titres(id) {
  const html = lire('src/parts/40-transmission.html');
  const section = html.slice(html.indexOf(`id="${id}"`), html.indexOf('</section>', html.indexOf(`id="${id}"`)));
  return [...section.matchAll(/<p class="st-t">([\s\S]*?)<\/p>/g)].map(m => m[1].replace(/<[^>]+>/g, ''));
}

test('dérailleur : le voyant est jaune fixe en mode réglage, éteint sinon, d’après les titres de 4.6', () => {
  const d = piece('derailleur', 'm-derailleur.js'), t = titres('transmission-reglage');
  const entre = t.findIndex(x => x.includes('voyant jaune fixe')) + 1, sort = t.findIndex(x => x.includes('voyant éteint')) + 1;
  assert.ok(entre > 0 && sort > entre, 'titres du mode réglage');
  const voyant = d.objet('voyant');
  for (let n = 1; n <= t.length; n++) {
    d.cran(n);
    const jaune = voyant.material.emissiveIntensity > 0 && voyant.material.color.getHex() === 0xffd21a;
    assert.equal(jaune, n >= entre && n < sort, `étape ${n}`);
  }
});

test('dérailleur : la pastille du 24 dents est sur le 24 dents, à la pointe de ses dents', () => {
  const d = piece('derailleur', 'm-derailleur.js');
  d.cran(6);
  const repere = d.objet('repère du 24 dents').getWorldPosition(new THREE.Vector3());
  for (const n of [24, 28]) {
    const p = d.objet(`pignon ${n}`); p.geometry.computeBoundingBox();
    const b = p.geometry.boundingBox.clone().applyMatrix4(p.matrixWorld);
    const dedans = repere.z >= b.min.z - 1 && repere.z <= b.max.z + 1;
    assert.equal(dedans, n === 24, `plan du ${n} dents`);
  }
  const p24 = d.objet('pignon 24'), pos = p24.geometry.attributes.position;
  let rMax = 0; for (let i = 0; i < pos.count; i++) rMax = Math.max(rMax, Math.hypot(pos.getX(i), pos.getY(i)));
  assert.ok(Math.abs(Math.hypot(repere.x, repere.y) - rMax) < 0.5, 'à la pointe des dents du 24');
  // La pastille est montrée là où le chapitre parle du 24 dents : à l'étape qui y passe.
  assert.ok(d.textes().some(x => x.startsWith('Cinquième pignon')), 'pastille du 24 dents à l’étape 6');
});

test('dérailleur et cassette : six pastilles au plus par étape, chacune montrée à son étape', () => {
  const cas = {
    derailleur: ['m-derailleur.js', 'transmission-reglage', { 'Contrôle la plaque de butée': 'Plaque de butée', 'Serre l’axe B': 'Axe B',
      'Passe sur le 45 dents': 'Vis B', 'Roue arrêtée': 'Bouton de fonction', 'Reviens au mode normal': 'Voyant',
      'Butée basse': 'Vis de butée basse', 'Butée haute': 'Vis de butée haute' }],
    cassette: ['m-cassette.js', 'transmission-cassette', { 'Mets des gants': 'Gants', 'Place le fouet': 'Fouet',
      'Engage le TL-LR021': 'Outil de contre-écrou', 'Dévisse': 'Gants', 'Sors la cassette': 'Entretoises',
      'Aligne les repères': 'Repères', 'Serre le contre-écrou': 'Le 9 dents' }],
  };
  for (const [modele, [fichier, id, attendus]] of Object.entries(cas)) {
    const m = piece(modele, fichier), t = titres(id).map(x => x.replace(/'/g, '’')), vus = new Set();
    for (let n = 1; n <= t.length; n++) {
      m.cran(n);
      const textes = m.textes();
      assert.ok(textes.length >= 1 && textes.length <= 6, `${modele}, étape ${n} : ${textes.length} pastilles`);
      textes.forEach(x => vus.add(x));
      for (const [titre, pastille] of Object.entries(attendus)) {
        if (t[n - 1].startsWith(titre)) assert.ok(textes.some(x => x.startsWith(pastille)), `${modele}, étape ${n} : ${pastille}`);
      }
    }
    const fichierTexte = lire(`src/js/models/${fichier}`);
    const toutes = [...fichierTexte.matchAll(/text: '((?:[^'\\]|\\.)*)'/g)].map(x => x[1]);
    assert.deepEqual([...vus].sort(), toutes.slice().sort(), `${modele} : chaque pastille est montrée à une étape au moins`);
  }
});

test('chaîne : à chaque cran, la pastille de la chaîne et celles de l’étape', () => {
  const c = piece('chain', 'm-chain.js');
  const attendus = { 'Attache, 4.4': [['Bouts coupés'], ['Bouts coupés'], ['Attache rapide', 'Flèche'], ['Fais glisser'], ['Goupilles']],
    'Usure, 4.3': [['Indicateur d’usure'], ['Bout en crochet'], ['Autre bout'], ['Autre bout'], ['S’il entre']] };
  for (const [mode, crans] of Object.entries(attendus)) {
    c.bouton(mode).declencher('click');
    crans.forEach((debuts, i) => {
      c.cran(i + 1);
      const textes = c.textes();
      assert.ok(textes[0].startsWith('Chaîne Shimano CN-M8100'), `${mode}, cran ${i + 1}`);
      assert.deepEqual(textes.slice(1).map(x => debuts.find(d => x.startsWith(d))), debuts, `${mode}, cran ${i + 1}`);
    });
  }
});

test('chaîne : la bascule de l’usure n’est montrée qu’avec le CC-3.2, en mode 4.3', () => {
  const c = piece('chain', 'm-chain.js');
  c.v.model.onFrame(0.016);
  const bascule = c.fig.querySelectorAll('.v3d-bar button').find(b => b.textContent.startsWith('Allongée de 0,5'));
  assert.ok(bascule, 'bascule');
  assert.match(bascule.textContent, /exagérée 8 fois/);
  assert.equal(bascule.hidden, true, 'cachée en mode 4.4');
  c.bouton('Usure, 4.3').declencher('click');
  assert.equal(bascule.hidden, false, 'montrée en mode 4.3');
  bascule.declencher('click');
  assert.equal(bascule.getAttribute('aria-pressed'), 'true');
  c.bouton('Attache, 4.4').declencher('click');
  assert.equal(bascule.hidden, true, 'cachée de nouveau');
  assert.equal(bascule.getAttribute('aria-pressed'), 'false', 'la chaîne revient neuve');
});

// ---------------------------------------------------------------------------------------------------------------
// Vague finale du lot 4 : ce que la relecture de la tâche 2 (task-2-rereview.md, N1, N2, B1, B2, B4, B10) et la relecture
// finale (final-review.md, M3, M4, M5) ont trouvé non gardé.

test('faux DOM : requêtes de média et insertBefore comme dans le navigateur', () => {
  const p = new El('div'), a = new El('p'), b = new El('p');
  p.insertBefore(a, null);
  assert.equal(p.lastChild, a, 'sans référence : en fin de liste');
  p.insertBefore(b, a);
  assert.equal(p.firstChild, b);
  assert.throws(() => p.insertBefore(new El('p'), new El('p')), /référence/);
  const c = new El('b');
  assert.equal(c.classList.toggle('hide', true), true);
  assert.ok(c.classList.contains('hide'));
  c.classList.toggle('hide', false);
  assert.ok(!c.classList.contains('hide'));
  assert.ok(MEDIAS.has('(prefers-reduced-motion: reduce)'));
});

test('visionneuse : une pastille du côté opposé de la pièce est cachée, sauf la pastille choisie', () => {
  const d = piece('derailleur', 'm-derailleur.js'), voir = vue(d, 760);
  d.cran(7);
  assert.ok(voir().every(p => !p.cachee), 'étape 7, vue par défaut : tout se voit');
  const derriere = () => { d.v.reset(); d.v.yaw += Math.PI; };
  const caches = voir(derriere).map((p, i) => p.cachee ? i : -1).filter(i => i >= 0);
  assert.ok(caches.length > 0, 'vue de dos : des pastilles passent derrière');
  d.v.select(caches[0]);
  assert.equal(voir(derriere)[caches[0]].cachee, false, 'la pastille choisie reste affichée');
  assert.ok(d.v.legBtns[caches[0]].classList.contains('on'));
});

// À l'angle par défaut, chaque pastille de chaque étape se voit : ni du côté caché, ni hors de la scène, ni sous l'aide ;
// deux pastilles ne se recouvrent pas (24 px à 375 px de large, 30 px à 760 px).
for (const [modele, fichier] of [['derailleur', 'm-derailleur.js'], ['cassette', 'm-cassette.js'], ['chain', 'm-chain.js']]) {
  test(`${modele} : à l’angle par défaut, chaque pastille de chaque étape se voit, hors de l’aide`, () => {
    for (const largeur of [375, 760]) {
      const m = piece(modele, fichier), voir = vue(m, largeur), N = Number(m.fig.querySelector('input').max);
      const modes = modele === 'chain' ? ['Attache, 4.4', 'Usure, 4.3'] : [null];
      for (const mode of modes) {
        if (mode) { m.bouton(mode).declencher('click'); for (let i = 0; i < 400; i++) m.v.model.onFrame(0.05); }
        for (let n = 1; n <= N; n++) {
          m.cran(n);
          const ps = voir(), ou = `${modele}${mode ? `, ${mode}` : ''}, ${largeur} px, étape ${n}`;
          for (const p of ps) {
            const quoi = `${ou} : ${p.texte.slice(0, 40)}`;
            assert.equal(p.cachee, false, `${quoi} : cachée`);
            assert.ok(p.x >= 12 && p.x <= p.largeur - 12 && p.y <= p.hauteur - 12, `${quoi} : hors de la scène (${p.x}, ${p.y})`);
            assert.ok(p.y - 12 >= basDeLAide(largeur), `${quoi} : sous l’aide (${p.y})`);
          }
          for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
            const dist = Math.hypot(ps[i].x - ps[j].x, ps[i].y - ps[j].y);
            assert.ok(dist >= (largeur < 480 ? 24 : 30), `${ou} : ${i + 1} et ${j + 1} à ${dist.toFixed(1)} px`);
          }
        }
      }
    }
  });
}

test('dérailleur : en vue éclatée, la batterie et le levier du support ont leur pastille, à chaque étape', () => {
  const d = piece('derailleur', 'm-derailleur.js'), voir = vue(d, 760);
  const eclate = on => { d.v.ex = d.v.exT = on ? 1 : 0; d.v.model.onFrame(0.016); };
  for (let n = 1; n <= 13; n++) {
    d.cran(n);
    eclate(true);
    const textes = d.textes();
    assert.ok(textes.some(x => x.startsWith('Batterie Shimano BT-DN320')), `étape ${n} : batterie`);
    assert.ok(textes.some(x => x.startsWith('Levier du support de batterie')), `étape ${n} : levier`);
    assert.ok(textes.length <= 6, `étape ${n} : ${textes.length} pastilles`);
    assert.equal(new Set(textes).size, textes.length, `étape ${n} : pastille en double`);
    const ps = voir(() => d.v.reset());
    for (const p of ps) assert.equal(p.cachee, false, `étape ${n}, vue éclatée : ${p.texte.slice(0, 30)}`);
    eclate(false);
    if (n !== 1) assert.ok(!d.textes().some(x => x.startsWith('Batterie')), `étape ${n} : batterie hors de la vue éclatée`);
  }
});

test('dérailleur : à l’étape 8, la chaîne reste sur le 24 dents pendant que la chape va vers le 28', () => {
  const d = piece('derailleur', 'm-derailleur.js');
  d.cran(8);
  const p24 = d.objet('pignon 24'), rouleaux = d.objet('rouleaux de la chaîne'), M = new THREE.Matrix4(), P = new THREE.Vector3();
  p24.geometry.computeBoundingBox();
  const b = p24.geometry.boundingBox.clone().applyMatrix4(p24.matrixWorld), z24 = (b.min.z + b.max.z) / 2;
  const rp = 12.7 / (2 * Math.sin(Math.PI / 24));
  let sur24 = 0;
  for (let i = 0; i < rouleaux.count; i++) {
    rouleaux.getMatrixAt(i, M); P.setFromMatrixPosition(M);
    // sur l'arc du pignon, les rouleaux sont à son rayon primitif, au centième près (cordes de 3 mm), dans son plan
    if (Math.abs(Math.hypot(P.x, P.y) - rp) < 0.1 && Math.abs(P.z - z24) < 0.5) sur24 += 1;
  }
  assert.ok(sur24 >= 3, `${sur24} rouleaux sur le 24 dents`);
});

test('chaîne : revenue en 4.4, la chaîne est neuve, au pas de 12,7 mm', () => {
  const c = piece('chain', 'm-chain.js'), pas = () => d(c.objet('rouleau 5'), c.objet('rouleau 4'));
  function d(a, b) { return a.getWorldPosition(new THREE.Vector3()).distanceTo(b.getWorldPosition(new THREE.Vector3())); }
  c.v.model.onFrame(0.016);
  c.cran(5);
  assert.ok(Math.abs(pas() - 12.7) < 1e-6, `neuve : ${pas()}`);
  c.bouton('Usure, 4.3').declencher('click');
  c.v.model.onFrame(0.016);
  c.fig.querySelectorAll('.v3d-bar button').find(b => b.textContent.startsWith('Allongée de 0,5')).declencher('click');
  assert.ok(Math.abs(pas() - 12.7 * 1.04) < 1e-6, `allongée, exagérée 8 fois : ${pas()}`);
  c.bouton('Attache, 4.4').declencher('click');
  c.cran(5);
  assert.ok(Math.abs(pas() - 12.7) < 1e-6, `de nouveau neuve : ${pas()}`);
});

test('cassette : la pastille du corps se montre cassette sortie, et celle des gants est sur le 9 dents', () => {
  const k = piece('cassette', 'm-cassette.js');
  k.cran(6);
  const corps = k.pastille('Corps de roue libre').obj.getWorldPosition(new THREE.Vector3());
  assert.ok(corps.length() < 60, `corps dans le champ : ${corps.toArray()}`);
  k.cran(2);
  const gants = k.pastille('Gants et lunettes'), neuf = k.pastille('Le 9 dents fait corps');
  assert.equal(gants.obj.parent, neuf.obj.parent, 'les gants sur le 9 dents, comme sa pastille');
});

test('les trois pièces : la ligne du geste suit la barre et dit l’étape, à chaque cran', () => {
  for (const [modele, fichier, atelier, debut, n0] of [['derailleur', 'm-derailleur.js', 'transmission-reglage', 1, 7],
    ['cassette', 'm-cassette.js', 'transmission-cassette', 1, 4], ['chain', 'm-chain.js', 'transmission-chaine', 6, 5]]) {
    const m = piece(modele, fichier), t = titres(atelier).map(x => x.replace(/'/g, '’'));
    m.v.model.onFrame(0.016);
    const barre = m.fig.querySelector('.v3d-bar'), ligne = barre.nextElementSibling;
    assert.equal(ligne.className, 'v3d-geste', `${modele} : ligne après la barre`);
    assert.equal(ligne.attrs['aria-live'], 'polite');
    const num = n0 + debut - 1, numero = atelier.split('-')[1];
    assert.equal(ligne.textContent, `Étape ${num} de ${{ reglage: '4.6', cassette: '4.5', chaine: '4.4' }[numero]} : ${t[num - 1]}`);
    m.cran(2);
    assert.ok(ligne.textContent.startsWith(`Étape ${debut + 1} de`), `${modele} : ${ligne.textContent}`);
    assert.equal(m.fig.querySelectorAll('p.v3d-geste').length, 1, `${modele} : une seule ligne`);
  }
});
