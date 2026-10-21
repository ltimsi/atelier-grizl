// Les pages « Ce qui est approché » (#approche-page) et « Sources » (#sources-page), remplies depuis les modules de la
// scène 3D, copiés dans js/scene/ :
//   approche  la liste du bouton « Ce qui est approché » de la scène, tirée des META des pièces et de la géométrie
//             (scene.js la donne sans three.js), mise en forme par liste-approche.js ;
//   sources   le registre des documents officiels (sources.js), rangé par type, chaque document avec son lien et les
//             pièces de la 3D qui le suivent.
// Les modules de la scène arrivent par import() dynamique, seulement sur la page qui en a besoin : si l'un manque, la
// page le dit. Importé sous Node (tests), le module ne se branche sur rien : seul sourcesParType sert.

// Les types de documents de sources.js, dans l'ordre de la page, avec leur intertitre.
const TYPES = Object.freeze([['fiche', 'Fiches'], ['manuel', 'Manuels'], ['tableau', 'Tableaux'], ['photo', 'Photos']]);

/**
 * Les documents du registre rangés par type : fiches, manuels, tableaux, photos, puis tout autre type sous son nom.
 * Dans chaque type, l'ordre du registre. Chaque document porte les pièces de la liste qui le suivent.
 * @param {Record<string, {titre: string, url: string, type: string}>} sources SOURCES de src/scene/sources.js.
 * @param {{piece: string, sources: {id: string}[]}[]} liste Le résultat de listerApproximations.
 * @returns {{type: string, titre: string,
 *   sources: {id: string, titre: string, url: string, pieces: string[]}[]}[]} Les types sans document n'y sont pas.
 */
export function sourcesParType(sources, liste) {
  const groupes = new Map(TYPES.map(([type, titre]) => [type, { type, titre, sources: [] }]));
  for (const [id, s] of Object.entries(sources)) {
    if (!groupes.has(s.type)) groupes.set(s.type, { type: s.type, titre: String(s.type), sources: [] });
    const pieces = liste.filter(e => e.sources.some(x => x.id === id)).map(e => e.piece);
    groupes.get(s.type).sources.push({ id, titre: s.titre, url: s.url, pieces });
  }
  return [...groupes.values()].filter(g => g.sources.length);
}

// ---- Branchement sur la page ----

const el = (tag, classe, texte) => {
  const e = document.createElement(tag);
  if (classe) e.className = classe;
  if (texte !== undefined) e.textContent = texte;
  return e;
};

// La liste de listerApproximations pour toutes les pièces, sans zone : celle que montre la scène sans la 3D.
const lister = scene => scene.listerApproximations(scene.PIECES.map(m => ({ meta: m.META, zones: [] })));

async function pageApproche(conteneur) {
  try {
    const [scene, { listeApproche }] = await Promise.all([import('./scene/scene.js'),
      import('./scene/liste-approche.js')]);
    conteneur.replaceChildren(listeApproche(document, lister(scene), 2));
  } catch (e) {
    console.error(e);
    conteneur.replaceChildren(el('p', 'muted', 'La liste n’a pas pu se charger. Recharge la page pour réessayer.'));
  }
}

async function pageSources(conteneur) {
  let SOURCES;
  try {
    ({ SOURCES } = await import('./scene/sources.js'));
  } catch (e) {
    console.error(e);
    conteneur.replaceChildren(el('p', 'muted', 'Le registre n’a pas pu se charger. Recharge la page pour réessayer.'));
    return;
  }
  // Sans la liste des pièces, les documents restent listés, sans les pièces qui les suivent.
  let liste = [];
  try {
    liste = lister(await import('./scene/scene.js'));
  } catch (e) {
    console.warn('scene.js indisponible :', e.message);
  }
  conteneur.replaceChildren(...sourcesParType(SOURCES, liste).map(g => {
    const section = el('section', 'sources-type');
    const titre = el('h2', null, g.titre);
    titre.append(' ', el('span', 'cnt', String(g.sources.length))); // l'espace sépare le nombre du nom, à l'écoute aussi
    const ul = el('ul', 'sources-liste');
    ul.append(...g.sources.map(s => {
      const li = el('li'), a = el('a', null, s.titre);
      a.href = s.url;
      a.target = '_blank';
      a.rel = 'noopener';
      li.append(a);
      if (s.pieces.length) li.append(el('span', 'sources-pieces', `Sert pour : ${s.pieces.join(' · ')}`));
      return li;
    }));
    section.append(titre, ul);
    return section;
  }));
}

if (typeof document !== 'undefined') {
  const approche = document.getElementById('approche-page'), sources = document.getElementById('sources-page');
  if (approche) pageApproche(approche);
  if (sources) pageSources(sources);
}
