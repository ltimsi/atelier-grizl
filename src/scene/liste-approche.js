// La liste « Ce qui est approché », pièce par pièce : la fenêtre du bouton de la scène (js/scene/app.js) et la page
// « Ce qui est approché » (js/references.js) la montrent toutes les deux. Sortie de app.js telle quelle.
// Module pur : il ne touche qu'au document qu'on lui passe, et se teste sous Node avec un faux document.

/**
 * La liste « Ce qui est approché » : une section.appr par entrée, avec le nom de la pièce, puis ses documents (liens
 * qui s'ouvrent à part), ses formes approchées et ce qui reste à vérifier à la livraison. Un intertitre sans élément
 * n'apparaît pas.
 * @param {Document} doc Le document qui crée les éléments.
 * @param {{piece: string, approche: string[], aVerifier: string[], sources: {titre: string, url: string}[]}[]} entrees
 *   Le résultat de listerApproximations (src/scene/scene.js) ou de scene.approximations().
 * @param {number} [niveau] Le niveau du titre de chaque pièce (h3 par défaut) ; ses intertitres prennent le suivant.
 * @returns {DocumentFragment}
 */
export function listeApproche(doc, entrees, niveau = 3) {
  const el = (tag, classe, texte) => {
    const e = doc.createElement(tag);
    if (classe) e.className = classe;
    if (texte !== undefined) e.textContent = texte;
    return e;
  };
  const ulDe = items => {
    const ul = el('ul');
    ul.append(...items);
    return ul;
  };
  const fragment = doc.createDocumentFragment();
  fragment.append(...entrees.map(e => {
    const s = el('section', 'appr');
    s.append(el(`h${niveau}`, null, e.piece));
    const bloc = (titre, items) => { if (items.length) s.append(el(`h${niveau + 1}`, null, titre), ulDe(items)); };
    bloc('Documents', e.sources.map(src => {
      const a = el('a', null, src.titre);
      a.href = src.url;
      a.target = '_blank';
      a.rel = 'noopener';
      const li = el('li');
      li.append(a);
      return li;
    }));
    bloc('Formes approchées', e.approche.map(t => el('li', null, t)));
    bloc('À vérifier à la livraison', e.aVerifier.map(t => el('li', null, t)));
    return s;
  }));
  return fragment;
}
