// Test de docs/lots.md : la liste « Ce qui est approché » du document est celle que génère
// tools/approximations-md.mjs depuis les META des pièces et GEO. Personne ne la retouche à la main.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const RACINE = fileURLToPath(new URL('../../', import.meta.url));
const OUTIL = fileURLToPath(new URL('../../tools/approximations-md.mjs', import.meta.url));
const DEBUT = '<!-- début de la liste générée par tools/approximations-md.mjs -->';
const FIN = '<!-- fin de la liste générée -->';

const generer = (...args) => spawnSync(process.execPath, [OUTIL, ...args], { cwd: RACINE, encoding: 'utf8' });

test('approximations-md : la liste en Markdown, pièce par pièce, puis la géométrie', () => {
  const r = generer();
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^#### Cadre, fourche, tige de selle SP100 VCLS 2\.1 et selle Fizik Argo Terra X5\n\nFormes approchées :\n\n- /);
  assert.match(r.stdout, /\n#### Géométrie\n/);
  assert.match(r.stdout, /\nÀ vérifier à la livraison :\n\n- /);
  assert.match(r.stdout, /\n#### Roues Canyon GR 30 CF, pneus Schwalbe G-One RX et axes traversants\n/);
  assert.match(r.stdout, /\n- pression maximale imprimée sur la jante : à lire sur la jante\n/);
  assert.ok(!/nombre de rayons/.test(r.stdout), 'le nombre de rayons est publié : plus à compter');
  assert.ok(!/[\u2014\u2013]/.test(r.stdout), 'tiret long');
});

test('lots.md : la liste « Ce qui est approché » est à jour', () => {
  const doc = readFileSync(new URL('../../docs/lots.md', import.meta.url), 'utf8');
  const i = doc.indexOf(DEBUT), j = doc.indexOf(FIN);
  assert.ok(i >= 0 && j > i, 'marqueurs de la liste absents de docs/lots.md');
  const bloc = doc.slice(i + DEBUT.length, j).trim();
  assert.equal(bloc, generer().stdout.trim(), 'liste périmée : lance node tools/approximations-md.mjs --lots');
});

test('lots.md : une entrée par lot publié de build/lots.json, avec son titre et son statut, dans l’ordre des lots', () => {
  const doc = readFileSync(new URL('../../docs/lots.md', import.meta.url), 'utf8');
  const config = JSON.parse(readFileSync(new URL('../../build/lots.json', import.meta.url), 'utf8'));
  const publies = config.lots.filter(l => ['validé', 'en relecture'].includes(l.statut));
  assert.deepEqual(publies.map(l => l.lot), [0, 1, 2]);
  const titres = [...doc.matchAll(/^## Lot (\d+) · (.+)$/gm)].map(m => [Number(m[1]), m[2]]);
  assert.deepEqual(titres, publies.map(l => [l.lot, `${l.titre} · ${l.statut}`]));
  // L'entrée du lot 2 dit ce qu'il publie : son chapitre, ses cinq zones et ses quatre pièces 3D.
  const lot2 = doc.slice(doc.indexOf('## Lot 2 · '), doc.indexOf('\n## ', doc.indexOf('## Lot 2 · ') + 1));
  for (const attendu of ['11-montage', 'Poste de pilotage', 'Selle et tige', 'Axes des roues', 'Pédalier et pédales',
    'Dérailleur Di2', '`torque`', '`cockpit`', '`axle`', '`pedal`', 'scene-check']) {
    assert.ok(lot2.includes(attendu), `entrée du lot 2 : « ${attendu} » absent`);
  }
  assert.ok(!/[\u2014\u2013]/.test(doc), 'tiret long dans lots.md');
});
