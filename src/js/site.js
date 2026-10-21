// Comportements communs à toutes les pages du site : menu sur téléphone, recherche, cases cochées, étapes (« Tout
// déplier » et mode pas à pas), onglets des figures, filtres des cartes, et à la racine, les anciennes ancres.
//
// Sans JavaScript, tout reste lisible : le menu, le fil d'Ariane et les liens sont du HTML, les étapes et les blocs
// sont des <details>. Ce module n'ajoute que des commandes : sans lui, les deux figures d'un atelier restent à la
// suite, aucune carte n'est filtrée et il n'y a pas de mode pas à pas. La tête (00-head.html) pose la classe « js »
// sur <html> avant l'affichage : la feuille de style s'en sert pour replier le menu sur téléphone et montrer la
// recherche, les filtres et la barre des étapes, sans que la page saute à l'arrivée du module. Ce module pose
// window.siteBranche en démarrant ; s'il ne tourne pas, la tête retire la classe à DOMContentLoaded.
//
// Pas d'API plus récente qu'ES2020 (tests/js/site.test.mjs le vérifie) : un Safari un peu ancien doit suivre.
//
// Les adresses de l'index de la recherche (window.RECHERCHE, posé par js/recherche.js) partent de la racine du site :
// data-base de div.app donne le chemin qui y remonte depuis la page (« ../../ » sur un atelier).
//
// Les cases cochées sont gardées dans ce navigateur, sous la clé atelier-grizl:checks : un objet { id de la case: 1 }.
// Chaque accès au stockage est dans un try/catch (navigation privée, stockage refusé).
//
// Module ES sans import. Importé sous Node (tests), il ne se branche sur rien : seuls ses calculs servent.

const CLE_CASES = 'atelier-grizl:checks';
const MAX_RESULTATS = 12;

// ---- Calculs purs ----

/**
 * Le texte tel que la recherche le compare : minuscules, sans accents ni ligatures, apostrophes et espaces
 * insécables ramenés à ceux du clavier.
 * @param {string} s
 * @returns {string}
 */
export function normaliser(s) {
  return String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/œ/g, 'oe').replace(/æ/g, 'ae')
    .replace(/[‘’ʼ`]/g, "'")
    .replace(/[   ]/g, ' ');
}

/**
 * Les entrées de l'index dont le genre ou le texte contient la requête, sans casse ni accents, dans l'ordre de
 * l'index. Sous deux caractères (blancs en moins), rien.
 * @param {{k: string, t: string, u: string}[] | null | undefined} index
 * @param {string} requete
 * @param {number} [max]
 * @returns {{k: string, t: string, u: string}[]}
 */
export function chercher(index, requete, max = MAX_RESULTATS) {
  const q = normaliser(requete).trim().replace(/\s+/g, ' ');
  if (q.length < 2 || !Array.isArray(index)) return [];
  const trouves = [];
  for (const e of index) {
    if (trouves.length >= max) break;
    if (normaliser(`${e.k} ${e.t}`).includes(q)) trouves.push(e);
  }
  return trouves;
}

// L'identifiant après le dièse, décodé ; null s'il est vide ou mal encodé.
function idDuHash(hash) {
  if (typeof hash !== 'string') return null;
  try {
    return decodeURIComponent(hash.replace(/^#/, '')) || null;
  } catch {
    return null;
  }
}

/**
 * L'adresse, relative à la racine, de la page qui porte aujourd'hui un ancien « #id » de la page unique :
 * « #freins-plaquettes » donne « freins/plaquettes/ ». null si l'ancre est vide, mal encodée ou inconnue.
 * @param {string} hash location.hash
 * @param {Record<string, string>} liens Le bloc #liens-data de la racine.
 * @returns {string | null}
 */
export function cibleAncienne(hash, liens) {
  const id = idDuHash(hash);
  if (!id || !liens || !Object.prototype.hasOwnProperty.call(liens, id)) return null;
  return typeof liens[id] === 'string' ? liens[id] : null;
}

// ---- Branchement sur la page ----

const el = (tag, classe, texte) => {
  const e = document.createElement(tag);
  if (classe) e.className = classe;
  if (texte !== undefined) e.textContent = texte;
  return e;
};

// Chaque figure rangée derrière un onglet, et de quoi la montrer : une ancre qui vise dedans la remet à l'écran.
const montrerFigure = new Map();

function anciennesAncres() {
  const bloc = document.getElementById('liens-data');
  if (!bloc) return;
  let liens;
  try {
    liens = JSON.parse(bloc.textContent);
  } catch {
    return;
  }
  const suivre = () => {
    const cible = cibleAncienne(location.hash, liens);
    if (cible) location.replace(cible);
  };
  suivre();
  window.addEventListener('hashchange', suivre);
}

function menu() {
  const side = document.getElementById('side'), bouton = document.getElementById('menu-btn');
  if (!side || !bouton) return;
  const ouvert = () => side.classList.contains('open');
  const basculer = (ouvrir, rendreFocus) => {
    side.classList.toggle('open', ouvrir);
    bouton.setAttribute('aria-expanded', String(ouvrir));
    if (ouvrir) (side.querySelector('[aria-current="page"]') ?? side.querySelector('a'))?.focus();
    else if (rendreFocus) bouton.focus();
  };
  bouton.addEventListener('click', () => basculer(!ouvert(), false));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && ouvert()) basculer(false, true);
  });
  // Menu ouvert par-dessus la page : un clic à côté le ferme, sans rien activer d'autre.
  document.addEventListener('click', e => {
    if (!ouvert() || side.contains(e.target) || bouton.contains(e.target)) return;
    if (bouton.offsetParent !== null) {
      e.preventDefault();
      e.stopPropagation();
    }
    basculer(false, false);
  }, true);
  // Au-dessus de 900 px, le menu est toujours là : il n'a plus à rester « ouvert ».
  globalThis.matchMedia?.('(max-width: 900px)').addEventListener?.('change', () => { if (ouvert()) basculer(false, false); });
}

function recherche(base) {
  const champ = document.getElementById('recherche'), liste = document.getElementById('resultats');
  if (!champ || !liste) return;
  liste.setAttribute('aria-label', 'Résultats de la recherche');
  const fermer = () => { liste.hidden = true; };
  const liens = () => [...liste.querySelectorAll('a')];
  const montrer = () => {
    if (normaliser(champ.value).trim().length < 2) {
      liste.replaceChildren();
      fermer();
      return;
    }
    const trouves = chercher(window.RECHERCHE, champ.value);
    liste.replaceChildren(...(trouves.length ? trouves.map(e => {
      const a = el('a');
      a.href = base + e.u;
      a.append(el('span', 'k', e.k), el('span', null, e.t));
      return a;
    }) : [el('p', 'none', `Rien trouvé pour « ${champ.value.trim()} ».`)]));
    liste.hidden = false;
  };
  champ.addEventListener('input', montrer);
  champ.addEventListener('focus', () => { if (liste.childElementCount) liste.hidden = false; });
  champ.addEventListener('keydown', e => {
    const premier = liste.hidden ? null : liens()[0];
    if (e.key === 'Enter' && premier) {
      e.preventDefault();
      location.href = premier.href;
    } else if (e.key === 'ArrowDown' && premier) {
      e.preventDefault();
      premier.focus();
    } else if (e.key === 'Escape' && !liste.hidden) {
      e.preventDefault();
      fermer();
    }
  });
  liste.addEventListener('keydown', e => {
    const tous = liens(), i = tous.indexOf(document.activeElement);
    if (e.key === 'ArrowDown' && i >= 0) {
      e.preventDefault();
      tous[Math.min(i + 1, tous.length - 1)].focus();
    } else if (e.key === 'ArrowUp' && i >= 0) {
      e.preventDefault();
      (i ? tous[i - 1] : champ).focus();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      fermer();
      champ.focus();
    }
  });
  const ailleurs = e => { if (!e.target.closest?.('.search')) fermer(); };
  document.addEventListener('click', ailleurs);
  document.addEventListener('focusin', ailleurs);
}

function lireCases() {
  try {
    const etat = JSON.parse(localStorage.getItem(CLE_CASES) || '{}');
    return etat && typeof etat === 'object' && !Array.isArray(etat) ? etat : {};
  } catch {
    return {};
  }
}

// Relit le stockage avant d'écrire : une autre page ouverte a pu cocher d'autres cases entre-temps.
function noterCases(cases) {
  const etat = lireCases();
  for (const cb of cases) {
    if (!cb.id) continue;
    if (cb.checked) etat[cb.id] = 1;
    else delete etat[cb.id];
  }
  try {
    localStorage.setItem(CLE_CASES, JSON.stringify(etat));
  } catch {
    // stockage refusé : la case reste cochée jusqu'au rechargement
  }
}

function cases() {
  const etat = lireCases();
  for (const cb of document.querySelectorAll('ul.check input[type="checkbox"]')) {
    if (cb.id && etat[cb.id]) cb.checked = true;
    cb.addEventListener('change', () => noterCases([cb]));
  }
  for (const b of document.querySelectorAll('[data-reset]')) {
    b.addEventListener('click', () => {
      const ul = [...document.querySelectorAll('ul.check[data-key]')].find(u => u.dataset.key === b.dataset.reset);
      if (!ul) return;
      const toutes = [...ul.querySelectorAll('input[type="checkbox"]')];
      for (const cb of toutes) cb.checked = false;
      noterCases(toutes);
    });
  }
}

function etapes() {
  const details = [...document.querySelectorAll('li.step > details')];
  if (!details.length) return;
  const tout = document.getElementById('tout-deplier');
  if (tout) {
    const libelle = () => { tout.textContent = details.every(d => d.open) ? 'Tout replier' : 'Tout déplier'; };
    tout.addEventListener('click', () => {
      const ouvrir = !details.every(d => d.open);
      for (const d of details) {
        d.open = ouvrir;
        // Des étapes rangées dans un autre <details> (celles de la purge) : on l'ouvre aussi, pour les voir.
        if (ouvrir) for (let p = d.parentElement.closest('details'); p; p = p.parentElement?.closest('details')) p.open = true;
      }
      libelle();
    });
    document.addEventListener('toggle', e => { if (details.includes(e.target)) libelle(); }, true);
    libelle();
  }
  const bouton = document.getElementById('pas-a-pas');
  if (bouton) pasAPas(bouton, details);
}

// Le mode pas à pas : une étape à la fois, en plein écran, son numéro en très gros, son titre, une copie de son
// texte (div.st-b), une barre de progression, « Étape précédente » et « Étape suivante ». Les flèches gauche et
// droite passent d'une étape à l'autre, Échap ferme, et le focus revient au bouton qui l'a ouvert.
function pasAPas(bouton, details) {
  const app = document.querySelector('.app');
  const etapes = details.map((d, k) => ({
    n: d.querySelector('.st-n')?.textContent.trim() || String(k + 1),
    titre: d.querySelector('.st-t'),
    corps: d.querySelector('.st-b'),
  }));
  const atelier = document.querySelector('.crumbs [aria-current="page"]')?.textContent
    ?? document.querySelector('h1')?.textContent ?? '';
  let ui = null, i = 0;

  const construire = () => {
    const boite = el('div', 'pas-a-pas');
    boite.hidden = true;
    boite.setAttribute('role', 'dialog');
    boite.setAttribute('aria-modal', 'true');
    boite.setAttribute('aria-labelledby', 'pas-a-pas-titre');
    const haut = el('div', 'pap-haut'), barre = el('div', 'pap-barre'), remplie = el('i');
    barre.setAttribute('role', 'progressbar');
    barre.setAttribute('aria-label', 'Avancement');
    barre.setAttribute('aria-valuemin', '1');
    barre.setAttribute('aria-valuemax', String(etapes.length));
    barre.append(remplie);
    const pos = el('span', 'pap-pos'), fermer = el('button', 'btn', 'Fermer');
    fermer.type = 'button';
    haut.append(el('span', 'label', atelier), barre, pos, fermer);
    const corps = el('div', 'pap-corps'), contenu = el('div', 'pap-contenu');
    corps.setAttribute('aria-live', 'polite');
    const n = el('span', 'pap-n'), titre = el('h2');
    titre.id = 'pas-a-pas-titre';
    contenu.append(n, titre);
    corps.append(contenu);
    const nav = el('div', 'pap-nav'), prec = el('button', 'btn', '← Étape précédente'), suiv = el('button', 'btn pri');
    prec.type = suiv.type = 'button';
    nav.append(prec, suiv);
    boite.append(haut, corps, nav);
    document.body.append(boite);
    fermer.addEventListener('click', () => quitter());
    prec.addEventListener('click', () => aller(i - 1));
    suiv.addEventListener('click', () => (i < etapes.length - 1 ? aller(i + 1) : quitter()));
    document.addEventListener('keydown', e => {
      if (boite.hidden || e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === 'ArrowRight' && i < etapes.length - 1) aller(i + 1);
      else if (e.key === 'ArrowLeft' && i > 0) aller(i - 1);
      else if (e.key === 'Escape') quitter();
      else return;
      e.preventDefault();
    });
    ui = { boite, barre, remplie, pos, corps, contenu, n, titre, prec, suiv, texte: null };
  };

  const dessiner = () => {
    const e = etapes[i], total = etapes.length;
    ui.pos.textContent = `${i + 1} / ${total}`;
    ui.remplie.style.width = `${((i + 1) / total) * 100}%`;
    ui.barre.setAttribute('aria-valuenow', String(i + 1));
    ui.n.textContent = e.n;
    ui.titre.replaceChildren(...[...(e.titre?.childNodes ?? [])].map(x => x.cloneNode(true)));
    const texte = e.corps ? e.corps.cloneNode(true) : el('div');
    texte.classList.add('pap-texte');
    // La copie ne doit reprendre aucun id de la page.
    for (const x of [texte, ...texte.querySelectorAll('[id]')]) x.removeAttribute('id');
    if (ui.texte) ui.texte.replaceWith(texte);
    else ui.contenu.append(texte);
    ui.texte = texte;
    ui.prec.disabled = i === 0;
    ui.suiv.textContent = i === total - 1 ? 'Terminé' : 'Étape suivante →';
    ui.corps.scrollTop = 0;
  };

  const aller = k => {
    i = Math.max(0, Math.min(etapes.length - 1, k));
    dessiner();
    if (document.activeElement === ui.prec && ui.prec.disabled) ui.suiv.focus();
  };

  const ouvrir = () => {
    if (!ui) construire();
    i = 0;
    dessiner();
    ui.boite.hidden = false;
    if (app) app.inert = true;
    document.documentElement.classList.add('pap-ouvert');
    ui.suiv.focus();
  };

  const quitter = () => {
    ui.boite.hidden = true;
    if (app) app.inert = false;
    document.documentElement.classList.remove('pap-ouvert');
    bouton.focus();
  };

  bouton.addEventListener('click', ouvrir);
}

function onglets() {
  for (const boite of document.querySelectorAll('div.figures[data-onglets]')) {
    const figures = [...boite.children].filter(e => e.tagName === 'FIGURE');
    if (figures.length < 2) continue;
    const libelles = figures.map(f => (f.classList.contains('v3d') ? 'Pièce en 3D' : 'Planche'));
    const barre = el('div', 'onglets');
    barre.setAttribute('role', 'group');
    barre.setAttribute('aria-label', 'Vue de l’atelier');
    let boutons = [];
    const choisir = k => figures.forEach((f, j) => {
      f.hidden = j !== k;
      boutons[j].setAttribute('aria-pressed', String(j === k));
    });
    boutons = figures.map((f, k) => {
      // Deux figures du même genre : leur rang les distingue.
      const doublon = libelles.filter(l => l === libelles[k]).length > 1;
      const b = el('button', 'btn', doublon ? `${libelles[k]} ${k + 1}` : libelles[k]);
      b.type = 'button';
      b.addEventListener('click', () => choisir(k));
      montrerFigure.set(f, () => choisir(k));
      return b;
    });
    barre.append(...boutons);
    boite.prepend(barre);
    choisir(0);
  }
}

function filtres() {
  const groupe = document.querySelector('div.filtres');
  const cartes = [...document.querySelectorAll('a.carte[data-type]')];
  if (!groupe || !cartes.length) return;
  const boutons = [...groupe.querySelectorAll('button[data-type]')];
  const vide = el('p', 'muted cartes-vide', 'Aucun atelier de ce type pour l’instant.');
  vide.hidden = true;
  cartes[cartes.length - 1].parentElement.after(vide);
  groupe.addEventListener('click', e => {
    const b = e.target.closest('button[data-type]');
    if (!b) return;
    const type = b.dataset.type;
    for (const x of boutons) x.setAttribute('aria-pressed', String(x === b));
    for (const c of cartes) c.hidden = type !== 'tout' && c.dataset.type !== type;
    vide.hidden = cartes.some(c => !c.hidden);
  });
}

// Une ancre qui vise un bloc replié ou une figure rangée derrière un onglet : on l'ouvre, puis on y va.
function revelerAncre() {
  const id = idDuHash(location.hash), cible = id && document.getElementById(id);
  if (!cible) return;
  let change = false;
  for (let d = cible.closest('details'); d; d = d.parentElement?.closest('details')) {
    if (!d.open) {
      d.open = true;
      change = true;
    }
  }
  const figure = cible.closest('figure');
  if (figure?.hidden && montrerFigure.has(figure)) {
    montrerFigure.get(figure)();
    change = true;
  }
  if (change) cible.scrollIntoView({ block: 'start' });
}

// La hauteur réelle de la barre du haut, dans --top-h : les ancres arrivent juste dessous (scroll-padding-top) et la
// colonne de droite d'un atelier se colle dessous, quelle que soit la largeur ou la longueur du fil d'Ariane.
function hauteurBarre() {
  const barre = document.querySelector('.top');
  if (!barre) return;
  const poser = () => {
    document.documentElement.style.setProperty('--top-h', `${Math.ceil(barre.getBoundingClientRect().height)}px`);
  };
  poser();
  if ('ResizeObserver' in window) new ResizeObserver(poser).observe(barre);
  else window.addEventListener('resize', poser);
}

function brancher() {
  // Lu par la tête (00-head.html) à DOMContentLoaded : sans lui, la page reprend la mise en page sans JavaScript.
  window.siteBranche = true;
  const base = document.querySelector('.app')?.dataset.base ?? '';
  // Une partie en panne ne doit pas emporter les autres.
  for (const partie of [anciennesAncres, hauteurBarre, menu, () => recherche(base), cases, etapes, onglets, filtres,
    revelerAncre]) {
    try {
      partie();
    } catch (e) {
      console.error(e);
    }
  }
  window.addEventListener('hashchange', revelerAncre);
}

if (typeof document !== 'undefined') brancher();
