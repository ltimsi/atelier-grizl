// Usage, depuis la racine du dépôt :
//   node tools/approximations-md.mjs          écrit la liste en Markdown sur la sortie standard ;
//   node tools/approximations-md.mjs --lots   réécrit la liste dans docs/lots.md, entre ses deux marqueurs.
//
// La liste « Ce qui est approché » telle que la page la construit sans la 3D : listerApproximations sur les META des
// pièces (src/scene/pieces/*.js), puis la géométrie (GEO de src/scene/geometrie.js). Sans les documents, que la page
// montre avec leurs liens. Le test tests/js/lots.test.mjs vérifie que docs/lots.md est à jour.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { PIECES, listerApproximations } from '../src/scene/scene.js';

const LOTS = fileURLToPath(new URL('../docs/lots.md', import.meta.url));
const DEBUT = '<!-- début de la liste générée par tools/approximations-md.mjs -->';
const FIN = '<!-- fin de la liste générée -->';

function markdown() {
  const lignes = [];
  for (const e of listerApproximations(PIECES.map(m => ({ meta: m.META, zones: [] })))) {
    lignes.push(`#### ${e.piece}`, '');
    if (e.approche.length) lignes.push('Formes approchées :', '', ...e.approche.map(t => `- ${t}`), '');
    if (e.aVerifier.length) lignes.push('À vérifier à la livraison :', '', ...e.aVerifier.map(t => `- ${t}`), '');
  }
  return lignes.join('\n');
}

const args = process.argv.slice(2);
if (args.length === 0) process.stdout.write(markdown());
else if (args.length === 1 && args[0] === '--lots') {
  const doc = readFileSync(LOTS, 'utf8');
  const i = doc.indexOf(DEBUT), j = doc.indexOf(FIN);
  if (i < 0 || j < i) {
    console.error(`Marqueurs absents de docs/lots.md : ${DEBUT} puis ${FIN}`);
    process.exit(1);
  }
  writeFileSync(LOTS, doc.slice(0, i + DEBUT.length) + '\n\n' + markdown() + '\n' + doc.slice(j));
  console.log('docs/lots.md : liste « Ce qui est approché » réécrite.');
} else {
  console.error('Usage : node tools/approximations-md.mjs [--lots]');
  process.exit(2);
}
