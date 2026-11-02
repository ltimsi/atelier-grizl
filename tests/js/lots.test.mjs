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
  assert.deepEqual(publies.map(l => l.lot), [0, 1, 2, 3, 4, 5]);
  const titres = [...doc.matchAll(/^## Lot (\d+) · (.+)$/gm)].map(m => [Number(m[1]), m[2]]);
  assert.deepEqual(titres, publies.map(l => [l.lot, `${l.titre} · ${l.statut}`]));
  // L'entrée du lot 2 dit ce qu'il publie : son chapitre, ses cinq zones et ses quatre pièces 3D.
  const lot2 = doc.slice(doc.indexOf('## Lot 2 · '), doc.indexOf('\n## ', doc.indexOf('## Lot 2 · ') + 1));
  for (const attendu of ['11-montage', 'Poste de pilotage', 'Selle et tige', 'Axes des roues', 'Pédalier et pédales',
    'Dérailleur Di2', '`torque`', '`cockpit`', '`axle`', '`pedal`', 'scene-check']) {
    assert.ok(lot2.includes(attendu), `entrée du lot 2 : « ${attendu} » absent`);
  }
  // L'entrée du lot 3 : son chapitre, sa zone, ses deux pièces 3D, la limite de 3,0 bar et le contrôle des neuf
  // pastilles.
  const lot3 = doc.slice(doc.indexOf('## Lot 3 · '), doc.indexOf('\n## ', doc.indexOf('## Lot 3 · ') + 1));
  for (const attendu of ['30-tubeless', 'Pneus et valves', '`rim`', '`plug`', '3,0 bar', 'scene-check', 'neuf pastilles']) {
    assert.ok(lot3.includes(attendu), `entrée du lot 3 : « ${attendu} » absent`);
  }
  // L'entrée du lot 4 : son chapitre, sa zone, ses trois pièces 3D, le couple de fixation du dérailleur, l'outil de
  // la cassette et le contrôle des dix pastilles.
  const lot4 = doc.slice(doc.indexOf('## Lot 4 · '), doc.indexOf('\n## ', doc.indexOf('## Lot 4 · ') + 1));
  for (const attendu of ['40-transmission', 'Chaîne et cassette', '`chain`', '`cassette`', '`derailleur`', '10-12 Nm',
    'TL-LR021', 'scene-check', 'dix pastilles']) {
    assert.ok(lot4.includes(attendu), `entrée du lot 4 : « ${attendu} » absent`);
  }
  assert.ok(!/\bcrank\b/.test(lot4), 'entrée du lot 4 : la pièce crank du brouillon');
  // L'entrée du lot 5 : son chapitre, sa zone, sa pièce 3D, l'avertissement du lot, les couples qu'aucun outil de
  // Lamine ne couvre, et le contrôle des onze pastilles. Rien des accessoires du CF 7, abandonnés le 1/11/2026.
  const lot5 = doc.slice(doc.indexOf('## Lot 5 · '), doc.indexOf('\n## ', doc.indexOf('## Lot 5 · ') + 1));
  for (const attendu of ['60-accessoires', 'Porte-bagages Tailfin', '`rack`', 'à confirmer avec Canyon',
    '1, 1,5, 2, 3 et 8 Nm', 'scene-check', 'onze pastilles']) {
    assert.ok(lot5.includes(attendu), `entrée du lot 5 : « ${attendu} » absent`);
  }
  assert.ok(!/Ortlieb|DEFEND|Knog/.test(lot5), 'entrée du lot 5 : un accessoire du CF 7');
  assert.ok(!/[\u2014\u2013]/.test(doc), 'tiret long dans lots.md');
});
