// Usage : node scene-check.js <dossier dist/site> <sortie> <largeur> <hauteur> <clair|sombre> [--disable-webgl]
//         [--mouvement] [--sans-js]
//
// Contrôle du site en plusieurs pages (dist/site/), dans Chromium sans écran. Par défaut, le navigateur demande de
// réduire les animations : vols de caméra et défilements instantanés, captures stables. Avec --mouvement, il ne le
// demande pas : vols de caméra, sortie animée des plaquettes, défilements doux, menu qui glisse. Avec --disable-webgl,
// Chromium démarre sans WebGL : l'accueil doit passer au schéma 2D et le dire, la pièce 3D d'un atelier doit afficher
// son message. Avec --sans-js, JavaScript est coupé : seules les passes 1 et 8 tournent, les autres en ont besoin.
//
// Points de rupture du site : une seule colonne jusqu'à 1100 px de large, menu derrière son bouton jusqu'à 900 px.
//
//   1. toutes les pages, chaque index.html du dossier hors js/ et vendor/ : aucune erreur dans la console ni requête
//      en échec, pas de défilement horizontal (scrollWidth <= innerWidth), une capture <page>.png de l'écran à
//      l'arrivée, et la page entière <page>-page.png pour l'accueil, freins/ et freins/plaquettes/. Sous 900 px, #side
//      est hors de l'écran tant que #menu-btn n'est pas cliqué ; le bouton l'ouvre et rend le reste de la page (.main)
//      inerte, Échap le referme et lève l'inertie (capture menu-ouvert.png sur freins/plaquettes/, où Tab, menu
//      ouvert, ne doit jamais sortir du menu). Sans JavaScript, le menu est en tête de page et le bouton n'est pas
//      affiché. Les pages « Ce qui est approché » et « Sources » doivent se remplir. Chaque pièce 3D (figure.v3d) est
//      ouverte par son onglet et doit se dessiner (sans WebGL : afficher son message). Puis la page est tout dépliée
//      (chaque <details> ouvert, chaque figure des onglets montrée) et ne doit toujours pas défiler en largeur ;
//   2. accueil : la scène est dessinée (sans WebGL : le schéma 2D, et la page le dit). L'aide de la scène a un fond qui
//      ne passe sur aucune pastille, en 3D comme en 2D. Un clic sur la pastille 2 rend active (aria-current) la carte
//      « Étrier et plaquettes » de « Où intervenir », puis la pastille 3 celle des manettes, puis le bouton de la carte
//      « Étrier et plaquettes » la sienne. Les pastilles sont cliquées à la souris là où elles sont, sans que le script
//      fasse défiler la page ; le bouton aussi, une fois la page descendue jusqu'à lui, comme après avoir lu les
//      cartes. Sur une seule colonne, une pastille ne fait pas défiler la page et le bouton d'une carte ramène l'image à
//      l'écran (95 % au moins entre la barre du haut et le bas de l'écran) ; sur deux colonnes, la carte choisie est à
//      l'écran. Ensuite, avec WebGL, les variantes de #variante (disque XT en vue d'ensemble, la
//      plus lourde, pour le budget de triangles ; plaquettes sorties) ; l'onglet « Schéma 2D » ; la fenêtre « Ce qui
//      est approché », qui s'ouvre et se remplit ;
//   3. anciennes ancres de la racine : index.html#freins-plaquettes et #freins-plaquettes arrivent sur
//      freins/plaquettes/, #freins sur freins/, #freins-pl-2 sur freins/plaquettes/#freins-pl-2, avec la planche à
//      l'écran sous la barre. La racine ne reste pas derrière Retour : Retour quitte le site ;
//   4. catégorie freins/ : le filtre « Remplacer » laisse 2 cartes visibles, « Tout » les rend toutes ;
//   5. atelier freins/plaquettes/ : le lien du fil d'Ariane, atteint par Tab, garde son anneau de focus entier (aucun
//      parent ne le rogne). La pièce 3D (figure.v3d canvas, derrière l'onglet « Pièce en 3D ») est dessinée : la
//      visionneuse a fait au moins une image, et une image refaite sur le moment couvre au moins 2 % du canevas. Sans
//      WebGL, elle affiche son message. « Tout déplier » ouvre les 10 étapes. Le mode pas à pas s'ouvre sur « 1 / 10 »,
//      la flèche droite passe à « 2 / 10 », Échap le ferme et rend le focus à son bouton. Sur une page neuve, le
//      premier Tab montre « Aller au contenu » à l'écran, Entrée mène à #contenu et le Tab suivant reste dans le
//      contenu (capture evitement.png) ;
//   6. recherche, depuis freins/plaquettes/ : « TL-FC36 » donne au moins un résultat, et le premier mène à
//      freins/disques/ ;
//   7. modules absents, chacun servi en 404 dans sa propre page d'accueil :
//      js/scene/scene.js : la page passe au schéma 2D et le dit, les boutons des cartes choisissent toujours la zone ;
//      js/scene/pieces/roues.js (la 3D et le schéma 2D en ont besoin) : la page le dit et retire la scène vide ;
//      js/scene/app.js : le garde-fou de la page le dit et retire la scène.
//      Dans les trois cas, les liens de « Où intervenir » restent. Seules les erreurs du fichier absent sont attendues ;
//   8. sans JavaScript (--sans-js) : sur freins/plaquettes/, cliquer le summary de l'étape 1 l'ouvre, aucun contenu de
//      la page (main) n'est caché par un attribut hidden, les deux figures sont à la suite, et ni la barre des étapes,
//      ni la recherche, ni le bouton Menu ne s'affichent, puisqu'ils ne feraient rien. Sur freins/, pas de filtres et
//      toutes les cartes. À l'accueil, ni onglets de rendu, ni aide, ni boutons de la scène, et la scène dit « Le vélo
//      en 3D a besoin de JavaScript. » au lieu de « Montage du vélo en 3D… » ; les liens de « Où intervenir » restent.
// Captures : une par page, et celles des passes, dans <sortie>.
//
// <sortie> reçoit aussi rapport.json : { erreurs, debordement, debordements, triangles, ancienFavori, webgl, mouvement,
// sansJs, pages, accueil, anciennesAncres, categorie, atelier, recherche, absents, sansJavaScript, avertissements,
// attendus, captures }.
//   erreurs : messages d'erreur de la console, erreurs de page, requêtes échouées ou en erreur HTTP, et contrôles qui
//     échouent (préfixe « contrôle : »), chacun avec la page où il arrive ;
//   debordement : la page a défilé en largeur à au moins une étape ; debordements dit où ;
//   triangles : le plus grand nombre de triangles d'une image 3D de l'accueil, lu sur <html data-triangles> (0 sans
//     WebGL ou sans JavaScript) ;
//   ancienFavori : index.html#freins-plaquettes arrive sur la page de l'atelier 2.3 (null sans JavaScript) ;
//   pages, accueil, anciennesAncres, categorie, atelier, recherche, absents, sansJavaScript : ce que chaque passe a
//     relevé (null pour une passe qui n'a pas tourné) ;
//   avertissements : avertissements de la console, sans doublon (le repli 2D en écrit un, voulu) ;
//   attendus : ce que le contrôle provoque lui-même : erreurs du module servi en 404, et requêtes abandonnées
//     (net::ERR_ABORTED) par la racine ouverte sur une ancienne ancre, qui part aussitôt ailleurs. Ailleurs, une
//     requête abandonnée est une erreur.
// Code de sortie 1 si erreurs n'est pas vide, si debordement est vrai, si triangles dépasse 500 000 ou si, avec
// JavaScript, ancienFavori n'est pas vrai ; 2 si les arguments sont faux ; 0 sinon.
//
// Le dossier est servi en HTTP sur 127.0.0.1, sur un port libre, comme nginx sur le serveur : une adresse en
// « dossier/ » sert dossier/index.html, et « dossier » sans barre finale renvoie vers « dossier/ ». Chaque réponse porte
// la politique de contenu (Content-Security-Policy) de deploy/nginx.conf, relue au démarrage : une violation devient
// une erreur de console, comme en ligne. Une adresse qui sort de la racine est refusée (403), une adresse mal encodée
// ou qui contient un octet nul aussi (400). Chromium refuse les modules ES et les cartes d'imports en file://. Le
// serveur s'arrête à la fin, même en cas d'échec.
const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs'); const http = require('http');

const BUDGET_TRIANGLES = 500000;
const ARGS_GL = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.css': 'text/css', '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png', '.webp': 'image/webp',
};
const DRAPEAUX = ['--disable-webgl', '--mouvement', '--sans-js'];
const THEMES = { clair: 'light', sombre: 'dark' };
const USAGE = 'Usage : node scene-check.js <dossier dist/site> <sortie> <largeur> <hauteur> <clair|sombre> ' +
  '[--disable-webgl] [--mouvement] [--sans-js]';
// Les points de rupture du site (00-head.html) : max-width:1100px et max-width:900px.
const UNE_COLONNE = 1100;
const MENU_REPLIE = 900;
// Les pages que les passes ouvrent : sans elles, le contrôle ne vaut rien.
const ACCUEIL = '', CATEGORIE = 'freins/', ATELIER = 'freins/plaquettes/', DISQUES = 'freins/disques/';
const PLEINE_PAGE = [ACCUEIL, CATEGORIE, ATELIER];
const ETAPES_ATELIER = 10; // les étapes de freins/plaquettes/
const CARTES_REMPLACER = 2; // les ateliers « Remplacer » de freins/
// Ancienne adresse de la racine, page d'arrivée.
const ANCIENNES_ANCRES = [
  ['index.html#freins-plaquettes', 'freins/plaquettes/'],
  ['#freins-plaquettes', 'freins/plaquettes/'],
  ['#freins', 'freins/'],
  ['#freins-pl-2', 'freins/plaquettes/#freins-pl-2'],
];
const FAVORI = 'index.html#freins-plaquettes';
const TITRE_ATELIER = 'Changer les plaquettes';
const MODULES_ABSENTS = [['scene', 'js/scene/scene.js'], ['roues', 'js/scene/pieces/roues.js'], ['app', 'js/scene/app.js']];
const STATUT_SANS_JS = 'Le vélo en 3D a besoin de JavaScript.'; // la scène de l'accueil sans JavaScript (05-top.html)
// La politique de contenu que nginx envoie en ligne, lue dans deploy/nginx.conf ; null si elle n'y est plus.
const CSP = (() => {
  const conf = fs.readFileSync(path.join(__dirname, '..', 'deploy', 'nginx.conf'), 'utf8');
  return conf.match(/add_header\s+Content-Security-Policy\s+"([^"]+)"/)?.[1] ?? null;
})();

function lireArguments(argv) {
  const drapeaux = argv.filter(a => a.startsWith('--'));
  if (drapeaux.some(d => !DRAPEAUX.includes(d))) return null;
  const [dossier, sortie, largeur, hauteur, theme, ...reste] = argv.filter(a => !a.startsWith('--'));
  const w = Number(largeur), h = Number(hauteur);
  const ok = dossier && sortie && Number.isInteger(w) && w > 0 && Number.isInteger(h) && h > 0 &&
    Object.prototype.hasOwnProperty.call(THEMES, theme) && fs.existsSync(path.join(dossier, 'index.html')) &&
    reste.length === 0;
  return ok ? {
    racine: fs.realpathSync(path.resolve(dossier)), sortie: path.resolve(sortie), largeur: w, hauteur: h,
    theme: THEMES[theme], sansGl: drapeaux.includes('--disable-webgl'), mouvement: drapeaux.includes('--mouvement'),
    sansJs: drapeaux.includes('--sans-js'),
  } : null;
}

// Les pages du site : chaque dossier qui a un index.html, hors js/ et vendor/ à la racine. L'accueil d'abord.
function pagesDu(racine) {
  const pages = [];
  (function parcourir(rel) {
    const dossier = path.join(racine, rel);
    if (fs.existsSync(path.join(dossier, 'index.html'))) pages.push(rel);
    for (const e of fs.readdirSync(dossier, { withFileTypes: true })) {
      if (e.isDirectory() && !(rel === '' && ['js', 'vendor'].includes(e.name))) parcourir(rel + e.name + '/');
    }
  })('');
  return pages.sort((a, b) => (a === '' ? -1 : b === '' ? 1 : a.localeCompare(b)));
}

// Nom de fichier d'une page : « accueil », « freins », « freins-plaquettes ».
const nomDe = rel => (rel === '' ? 'accueil' : rel.replace(/\/$/, '').replace(/\//g, '-'));

function servir(racine) {
  return new Promise(resolve => {
    const securite = CSP ? { 'Content-Security-Policy': CSP } : {};
    const srv = http.createServer((req, res) => {
      const fin = (code, entetes = {}) => {
        res.writeHead(code, { ...securite, ...entetes });
        res.end();
      };
      let rel;
      try {
        rel = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
      } catch {
        fin(400);
        return;
      }
      // Un octet nul ferait lever fs.stat hors de son rappel, et tomber le serveur.
      if (rel.includes('\0')) {
        fin(400);
        return;
      }
      const f = path.join(racine, rel);
      if (f !== racine && !f.startsWith(racine + path.sep)) {
        fin(403);
        return;
      }
      fs.stat(f, (err, st) => {
        if (err) {
          fin(404);
          return;
        }
        if (st.isDirectory() && !rel.endsWith('/')) {
          fin(301, { Location: encodeURI(rel + '/') });
          return;
        }
        const fichier = st.isDirectory() ? path.join(f, 'index.html') : f;
        fs.readFile(fichier, (e, buf) => {
          if (e) {
            fin(404);
            return;
          }
          res.writeHead(200, {
            ...securite, 'Content-Type': TYPES[path.extname(fichier)] || 'application/octet-stream', 'Cache-Control': 'no-cache',
          });
          res.end(buf);
        });
      });
    });
    srv.listen(0, '127.0.0.1', () => resolve(srv));
  });
}

const pause = ms => new Promise(r => setTimeout(r, ms));
const premiereLigne = e => (e && e.stack ? e.stack.split('\n')[0] : String(e));

async function controler(opts) {
  const { racine, sortie, largeur, hauteur, theme, sansGl, mouvement, sansJs } = opts;
  const rapport = {
    erreurs: [], debordement: false, debordements: [], triangles: 0, ancienFavori: null, webgl: !sansGl, mouvement,
    sansJs, pages: {}, accueil: null, anciennesAncres: null, categorie: null, atelier: null, recherche: null,
    absents: null, sansJavaScript: null, avertissements: [], attendus: [], captures: [],
  };
  const erreur = s => { rapport.erreurs.push(s); };
  const controle = (ok, s) => {
    if (!ok) erreur('contrôle : ' + s);
    return Boolean(ok);
  };
  // Après une action qui anime (vol de caméra, plaquettes, défilement doux), le temps que l'animation finisse.
  const PAUSE_ANIMATION = mouvement ? 1400 : 300;
  const PAUSE_MENU = mouvement ? 500 : 150; // le menu glisse en 0,2 s
  const uneColonne = largeur <= UNE_COLONNE, menuReplie = largeur <= MENU_REPLIE;
  fs.mkdirSync(sortie, { recursive: true });

  const pages = pagesDu(racine);
  for (const p of [ACCUEIL, CATEGORIE, ATELIER, DISQUES]) controle(pages.includes(p), `page absente : ${p || 'accueil'}`);
  controle(CSP, 'deploy/nginx.conf : pas de Content-Security-Policy à envoyer avec les pages');
  const srv = await servir(racine);
  const base = `http://127.0.0.1:${srv.address().port}/`;
  let browser = null;
  // Les contextes ouverts par la passe en cours, fermés à sa fin, même si elle échoue.
  let contextes = [];
  const fermer = async ctx => {
    await ctx.close().catch(() => {});
    contextes = contextes.filter(c => c !== ctx);
  };

  // Où l'on est, pour les messages : le chemin de la page, « accueil » pour la racine.
  const ici = page => {
    try {
      return decodeURI(new URL(page.url()).pathname).replace(/^\//, '') || 'accueil';
    } catch {
      return '?';
    }
  };

  // Ouvre `adresse` (relative à la racine) dans un contexte neuf et attend qu'elle soit prête.
  // `absent` : chemin servi en 404, dont les erreurs sont attendues. `arrivee` : la page part ailleurs dès son
  // chargement (ancienne ancre) ; on attend l'adresse qui satisfait ce prédicat, puis le chargement de cette page.
  // Seule une page ouverte avec `arrivee` a le droit d'abandonner des requêtes (net::ERR_ABORTED) : celles de la racine
  // qu'elle quitte aussitôt. `image` : attendre la première image 3D de l'accueil.
  async function ouvrir(adresse, { absent = null, attente = 180000, arrivee = null, image = true } = {}) {
    const ctx = await browser.newContext({
      viewport: { width: largeur, height: hauteur }, deviceScaleFactor: 2, colorScheme: theme,
      reducedMotion: mouvement ? 'no-preference' : 'reduce', javaScriptEnabled: !sansJs,
    });
    contextes.push(ctx);
    const duAbsent = url => absent !== null && url.endsWith('/' + absent);
    if (absent) await ctx.route(u => duAbsent(u.href), r => r.fulfill({ status: 404, body: '' }));
    const page = await ctx.newPage();
    page.on('console', m => {
      const t = m.text();
      if (m.type() === 'error') {
        if (duAbsent(m.location()?.url ?? '')) rapport.attendus.push(`${ici(page)} : ${absent} : console : ${t}`);
        else erreur(`${ici(page)} : console : ${t}`);
      } else if (m.type() === 'warning' && !rapport.avertissements.includes(t)) rapport.avertissements.push(t);
    });
    page.on('pageerror', e => erreur(`${ici(page)} : page : ${e.message}`));
    page.on('requestfailed', r => {
      const raison = r.failure()?.errorText ?? '';
      const t = `${ici(page)} : requête échouée : ${r.url()} (${raison})`;
      if (duAbsent(r.url()) || (arrivee && raison === 'net::ERR_ABORTED')) rapport.attendus.push(t);
      else erreur(t);
    });
    page.on('response', r => {
      if (r.status() < 400) return;
      if (duAbsent(r.url())) rapport.attendus.push(`${ici(page)} : ${absent} : HTTP ${r.status()}`);
      else erreur(`${ici(page)} : HTTP ${r.status()} : ${r.url()}`);
    });
    if (arrivee) {
      await page.goto(base + adresse, { waitUntil: 'commit' });
      await page.waitForURL(arrivee, { timeout: 30000 })
        .catch(() => erreur(`contrôle : ${adresse} : la page n’est pas partie ailleurs (${ici(page)})`));
    } else {
      await page.goto(base + adresse);
    }
    await pret(page, { attente, image: image && !absent });
    return { ctx, page };
  }

  // Prête : site.js branché, et à l'accueil, la scène montée (ou le repli affiché) et sa première image ; les pages
  // « Ce qui est approché » et « Sources » remplies ; les polices chargées. Sans JavaScript : l'événement load.
  async function pret(page, { attente, image }) {
    const ou = ici(page);
    if (!sansJs) {
      await page.waitForFunction(() => window.siteBranche === true, null, { timeout: 30000 })
        .catch(() => erreur(`contrôle : ${ou} : site.js ne s’est pas branché`));
      if (await page.$('#scene')) {
        // Le message « Montage du vélo en 3D… » disparaît quand la scène est montée, que la page passe au 2D, ou que
        // la page dit qu'elle n'a ni l'un ni l'autre.
        await page.waitForFunction(() => {
          const s = document.getElementById('scene-statut');
          return s && (s.hidden || s.getClientRects().length === 0);
        }, null, { timeout: attente }).catch(() => erreur(`contrôle : ${ou} : la page reste sur « Montage du vélo en 3D… »`));
        if (image) await premiereImage(page, `${ou} au chargement`);
      }
      if (await page.$('#approche-page, #sources-page')) {
        await page.waitForSelector('#approche-page section.appr, #sources-page section.sources-type', { timeout: 30000 })
          .catch(() => erreur(`contrôle : ${ou} : la liste de la page ne s’est pas remplie`));
      }
    } else {
      await page.waitForLoadState('load');
    }
    await page.evaluate(() => document.fonts.ready.then(() => true)).catch(() => {});
    await pause(300);
  }

  // Attend la première image 3D de l'accueil (rien à attendre sans WebGL).
  async function premiereImage(page, quand) {
    if (sansGl) return;
    await page.waitForFunction(() => document.documentElement.dataset.triangles !== undefined, null, { timeout: 60000 })
      .catch(() => erreur('contrôle : aucune image 3D dessinée ' + quand));
  }

  // Après chaque étape : défilement en largeur, et les triangles de la dernière image 3D de l'accueil.
  async function relever(page, quand) {
    const e = await page.evaluate(() => ({
      large: document.documentElement.scrollWidth, ecran: window.innerWidth,
      triangles: Number(document.documentElement.dataset.triangles ?? 0),
    }));
    if (e.large > e.ecran) {
      rapport.debordement = true;
      rapport.debordements.push(`${quand} : ${e.large} px pour ${e.ecran}`);
    }
    rapport.triangles = Math.max(rapport.triangles, e.triangles);
    return e;
  }

  // Une capture de l'écran, de la page entière (`pleine`), ou d'un élément (`sel`), découpé dans la page entière :
  // la capture d'élément de Playwright laisse un bas vide quand l'élément est presque aussi haut que l'écran.
  // La page entière est prise à l'échelle CSS (1 pixel par pixel CSS) : au double, l'accueil sur téléphone dépasse
  // 8 192 pixels de haut, la taille de texture la plus grande de SwiftShader, la capture échoue et le processus GPU
  // de Chromium tombe avec elle (plus de WebGL pour la suite).
  async function capturer(page, nom, { sel = null, pleine = false } = {}) {
    const fichier = path.join(sortie, nom);
    if (sel) {
      await page.locator(sel).first().scrollIntoViewIfNeeded();
      const clip = await page.$eval(sel, e => {
        const r = e.getBoundingClientRect();
        return { x: r.left + window.scrollX, y: r.top + window.scrollY, width: r.width, height: r.height };
      });
      await page.screenshot({ path: fichier, fullPage: true, clip });
    } else {
      await page.screenshot({ path: fichier, fullPage: pleine, scale: pleine ? 'css' : 'device' });
    }
    rapport.captures.push(nom);
  }

  // Une passe : ses erreurs de script n'arrêtent pas les suivantes, et ses contextes sont fermés à la fin.
  async function passe(nom, corps) {
    try {
      await corps();
    } catch (e) {
      erreur(`script, ${nom} : ${premiereLigne(e)}`);
    } finally {
      for (const ctx of [...contextes]) await fermer(ctx);
    }
  }

  // Sous 900 px : #side hors de l'écran (et hors d'atteinte du clavier) tant que #menu-btn n'est pas cliqué ; le
  // bouton l'ouvre et rend .main inerte (le tiroir est modal), Échap le referme et lève l'inertie. Avec `tab`, Tab est
  // pressé, menu ouvert, une fois de plus qu'il n'y a de liens dans le menu : le focus ne doit jamais aller ailleurs
  // dans .app (ni dans .main, ni sur le lien d'évitement).
  // Sans JavaScript : le menu en tête de page, sans bouton.
  async function controlerMenu(page, ou, nomCapture, tab = false) {
    const lire = () => page.evaluate(() => {
      const s = document.getElementById('side'), b = document.getElementById('menu-btn');
      const r = s ? s.getBoundingClientRect() : null;
      return s ? {
        gauche: Math.round(r.left), droite: Math.round(r.right), visibilite: getComputedStyle(s).visibility,
        bouton: Boolean(b) && b.getClientRects().length > 0, ouvert: b ? b.getAttribute('aria-expanded') : null,
        ecran: window.innerWidth, inerte: Boolean(document.querySelector('.main')?.inert),
      } : null;
    });
    const horsEcran = m => m.droite <= 0 && m.visibilite === 'hidden';
    const avant = await lire();
    if (!controle(avant, `${ou} : pas de #side`)) return null;
    if (sansJs) {
      controle(avant.gauche >= 0 && avant.droite > 0 && avant.visibilite === 'visible' && !avant.bouton,
        `${ou} : sans JavaScript, le menu n’est pas en tête de page ou le bouton Menu s’affiche ${JSON.stringify(avant)}`);
      return { avant };
    }
    controle(avant.bouton, `${ou} : pas de bouton Menu sous 900 px`);
    controle(horsEcran(avant), `${ou} : le menu est à l’écran avant le clic sur Menu ${JSON.stringify(avant)}`);
    controle(!avant.inerte, `${ou} : la page est inerte avant le clic sur Menu`);
    await page.click('#menu-btn');
    await pause(PAUSE_MENU);
    const ouvert = await lire();
    controle(ouvert.gauche >= 0 && ouvert.droite > 0 && ouvert.droite <= ouvert.ecran &&
      ouvert.visibilite === 'visible' && ouvert.ouvert === 'true', `${ou} : Menu n’ouvre pas le menu ${JSON.stringify(ouvert)}`);
    controle(ouvert.inerte, `${ou} : menu ouvert, le reste de la page (.main) n’est pas inerte`);
    await relever(page, `${ou}, menu ouvert`);
    if (nomCapture) await capturer(page, nomCapture);
    if (tab) {
      const liens = await page.$$eval('#side a', as => as.length);
      ouvert.tab = [];
      for (let i = 0; i <= liens; i++) {
        await page.keyboard.press('Tab');
        ouvert.tab.push(await page.evaluate(() => {
          const a = document.activeElement;
          return a?.closest('#side') ? 'menu' : a?.closest('.app') ? 'page' : (a?.tagName.toLowerCase() ?? 'rien');
        }));
      }
      controle(!ouvert.tab.includes('page'), `${ou} : menu ouvert, Tab sort du menu vers la page ${JSON.stringify(ouvert.tab)}`);
    }
    await page.keyboard.press('Escape');
    await pause(PAUSE_MENU);
    const apres = await lire();
    controle(horsEcran(apres) && apres.ouvert === 'false', `${ou} : Échap ne referme pas le menu ${JSON.stringify(apres)}`);
    controle(!apres.inerte, `${ou} : menu refermé, le reste de la page reste inerte`);
    return { avant, ouvert, apres };
  }

  // Chaque pièce 3D de la page (figure.v3d), derrière son onglet : l'onglet cliqué et la pièce amenée à l'écran, la
  // visionneuse la construit ; on attend sa première image, ou sans WebGL, son message. Une pièce qui ne se construit
  // pas laisse aussi une erreur dans la console.
  async function dessinerPieces(page, ou) {
    const pieces = page.locator('figure.v3d');
    const vues = [];
    for (let k = 0, n = await pieces.count(); k < n; k++) {
      const f = pieces.nth(k);
      const vue = { modele: await f.getAttribute('data-model') };
      if (await f.evaluate(x => x.hidden)) {
        // Les boutons des onglets suivent l'ordre des figures de leur boîte.
        const rang = await f.evaluate(x => [...x.parentElement.children].filter(e => e.tagName === 'FIGURE').indexOf(x));
        await f.locator('xpath=..').locator(':scope > .onglets button').nth(rang).click();
      }
      await f.scrollIntoViewIfNeeded();
      if (sansGl) {
        vue.message = await f.locator('.v3d-fallback').first().waitFor({ timeout: 30000 }).then(() => true, () => false);
        controle(vue.message, `${ou} : sans WebGL, la pièce 3D « ${vue.modele} » n’affiche pas son message`);
      } else {
        vue.images = await page.waitForFunction(x => {
          const v = x.__viewer;
          return v && v.renderer && v.renderer.info.render.frame > 0 ? v.renderer.info.render.frame : false;
        }, await f.elementHandle(), { timeout: 60000 }).then(h => h.jsonValue(), () => 0);
        controle(vue.images > 0, `${ou} : la pièce 3D « ${vue.modele} » ne se dessine pas derrière son onglet`);
      }
      await relever(page, `${ou}, pièce 3D « ${vue.modele} »`);
      vues.push(vue);
    }
    return vues;
  }

  // La page tout dépliée : chaque <details> ouvert et chaque figure rangée derrière un onglet montrée. C'est dépliée
  // qu'on lit une étape au téléphone : elle ne doit pas défiler en largeur non plus.
  async function toutDeplier(page, ou) {
    const ouverts = await page.evaluate(() => {
      const details = [...document.querySelectorAll('details')].filter(d => !d.open);
      for (const d of details) d.open = true;
      const figures = [...document.querySelectorAll('.figures > figure')].filter(f => f.hidden);
      for (const f of figures) f.hidden = false;
      return { details: details.length, figures: figures.length };
    });
    await pause(300);
    const e = await relever(page, `${ou}, tout déplié`);
    return { ...ouverts, large: e.large };
  }

  try {
    browser = await chromium.launch({ args: sansGl ? [...ARGS_GL, '--disable-webgl'] : ARGS_GL });

    // ---- 1. Toutes les pages ----
    await passe('toutes les pages', async () => {
      for (const adresse of pages) {
        const ou = adresse || 'accueil';
        const { ctx, page } = await ouvrir(adresse);
        const nom = nomDe(adresse);
        const e = await relever(page, ou);
        const fiche = { large: e.large, ecran: e.ecran };
        await capturer(page, nom + '.png');
        if (PLEINE_PAGE.includes(adresse)) await capturer(page, nom + '-page.png', { pleine: true });
        if (menuReplie) {
          fiche.menu = await controlerMenu(page, ou, adresse === ATELIER ? 'menu-ouvert.png' : null, adresse === ATELIER);
        }
        await relever(page, ou);
        if (!sansJs) fiche.pieces3d = await dessinerPieces(page, ou);
        fiche.deplie = await toutDeplier(page, ou);
        rapport.pages[ou] = fiche;
        await fermer(ctx);
      }
    });

    if (!sansJs) {
      // ---- 2. Accueil ----
      await passe('accueil', async () => {
        const a = rapport.accueil = {};
        const { page } = await ouvrir(ACCUEIL);
        const etat = () => page.evaluate(() => {
          const vu = e => Boolean(e) && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden';
          const st = document.getElementById('scene-stage'), r = st.getBoundingClientRect();
          const haut = document.querySelector('.top')?.getBoundingClientRect().bottom ?? 0;
          const cartes = [...document.querySelectorAll('.zone-carte[data-zone]')];
          const actives = cartes.filter(c => c.getAttribute('aria-current') === 'true');
          const aLEcran = c => {
            const q = c.getBoundingClientRect();
            return q.top >= haut - 1 && q.bottom <= window.innerHeight + 1;
          };
          const alerte = document.getElementById('scene-alerte');
          return {
            alerte: vu(alerte) ? alerte.textContent : null,
            svg2d: !document.getElementById('plan').hasAttribute('hidden') &&
              document.getElementById('plan').getBoundingClientRect().height > 0,
            canevas: !document.getElementById('gl').hidden,
            scene: vu(st),
            actives: actives.map(c => c.dataset.zone),
            nomActif: actives.length === 1 ? (actives[0].querySelector('.zone-btn')?.textContent.trim() ?? null) : null,
            cartesALEcran: cartes.filter(aLEcran).map(c => c.dataset.zone),
            scrollY: Math.round(window.scrollY),
            // La part de l'image entre la barre du haut et le bas de l'écran.
            image: r.height ? Math.round(Math.max(0, Math.min(r.bottom, window.innerHeight) - Math.max(r.top, haut)) /
              r.height * 1000) / 1000 : 0,
            variante: vu(document.getElementById('variante')) ?
              [...document.querySelectorAll('#variante button')].map(b => b.textContent) : null,
          };
        });
        // Fait `action`, attend l'image 3D qu'elle demande (data-triangles est retiré avant, la page le repose à
        // l'image suivante), puis le temps que l'animation finisse. Sans 3D, ou pour une action qui ne change pas la
        // 3D, une pause suffit.
        const agir = async (nom, action, redessine = true) => {
          if (sansGl || !redessine) {
            await action();
            await pause(Math.max(400, PAUSE_ANIMATION));
            return;
          }
          await page.evaluate(() => { delete document.documentElement.dataset.triangles; });
          await action();
          await page.waitForFunction(() => document.documentElement.dataset.triangles !== undefined, null,
            { timeout: 60000 }).catch(() => erreur('contrôle : accueil : aucune image 3D dessinée après ' + nom));
          await pause(PAUSE_ANIMATION);
        };
        // Clique la pastille n (1 à 3) à la souris, là où elle est. Un clic de Playwright ferait d'abord défiler la
        // page jusqu'à elle, et « la pastille ne fait pas défiler la page » ne se verrait plus. Si la pastille n'est
        // pas à l'écran, l'image y est ramenée d'abord. Rend le défilement juste avant le clic, ou null.
        const cliquerPastille = async n => {
          const viser = () => page.evaluate(k => {
            const b = document.querySelectorAll('#pins .zpin')[k];
            if (!b || b.hidden) return null;
            const r = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
            const haut = document.querySelector('.top')?.getBoundingClientRect().bottom ?? 0;
            const ecran = x > 0 && x < window.innerWidth && y > haut && y < window.innerHeight;
            return { x, y, ecran, dessus: ecran && b.contains(document.elementFromPoint(x, y)) };
          }, n - 1);
          let p = await viser();
          if (p && !p.ecran) {
            await page.evaluate(() => document.getElementById('scene-stage').scrollIntoView({ block: 'center', behavior: 'instant' }));
            p = await viser();
          }
          if (!controle(p, `accueil : la pastille ${n} n’est pas affichée`)) return null;
          if (!controle(p.dessus, `accueil : la pastille ${n} est couverte`)) return null;
          const y0 = await page.evaluate(() => Math.round(window.scrollY));
          await page.mouse.click(p.x, p.y);
          return y0;
        };
        // Après le choix d'une zone : sa carte, seule active, et le défilement de la page.
        const choix = async (quoi, zone, nom, y0, depuisCarte) => {
          const e = await etat();
          await relever(page, 'accueil, ' + quoi);
          controle(e.actives.length === 1 && e.actives[0] === zone && e.nomActif === nom,
            `accueil, ${quoi} : carte active ${JSON.stringify(e.actives)} (« ${e.nomActif} ») au lieu de « ${nom} »`);
          if (!uneColonne) {
            controle(e.cartesALEcran.includes(zone), `accueil, ${quoi} : la carte « ${nom} » n’est pas à l’écran`);
          } else if (!depuisCarte) {
            controle(e.scrollY === y0, `accueil, ${quoi} : la page a défilé de ${y0} à ${e.scrollY} px (une colonne)`);
          } else {
            controle(e.image >= 0.95, `accueil, ${quoi} : l’image n’est qu’à ${Math.round(e.image * 100)} % à l’écran (une colonne)`);
          }
          return { scrollAvant: y0, scrollApres: e.scrollY, image: e.image, actives: e.actives, cartesALEcran: e.cartesALEcran };
        };

        let e = await etat();
        await relever(page, 'accueil au chargement');
        if (sansGl) {
          controle(e.alerte !== null, 'accueil : sans WebGL, la page ne dit pas que la 3D manque');
          controle(e.svg2d && !e.canevas, 'accueil : sans WebGL, le schéma 2D n’est pas visible');
          controle(await page.$eval('#mode-reel', b => b.disabled), 'accueil : sans WebGL, l’onglet 3D réaliste reste actif');
        } else {
          controle(e.alerte === null, 'accueil : la 3D ne s’est pas montée : ' + e.alerte);
          controle(e.canevas && !e.svg2d, 'accueil : le rendu réaliste n’est pas affiché');
        }
        a.chargement = { alerte: e.alerte, svg2d: e.svg2d, canevas: e.canevas };
        const fondAide = await page.$eval('#scene-aide', x => getComputedStyle(x).backgroundColor);
        controle(!/^(transparent|rgba\(0, 0, 0, 0\))$/.test(fondAide), 'accueil : l’aide de la scène n’a pas de fond : ' + fondAide);
        // Aucune pastille visible sous le panneau de l'aide : le centre de chaque pastille doit montrer la pastille
        // et pas l'aide. L'aide ignore le pointeur : le temps du relevé, elle le reprend pour que elementFromPoint la
        // voie.
        const controlerPastilles = async quand => {
          await page.locator('#scene').scrollIntoViewIfNeeded();
          const couvertes = await page.evaluate(() => {
            const aide = document.getElementById('scene-aide');
            const avant = aide.style.pointerEvents;
            aide.style.pointerEvents = 'auto';
            const sous = [...document.querySelectorAll('#pins .zpin')].filter(b => b.getClientRects().length).filter(b => {
              const r = b.getBoundingClientRect();
              const x = r.left + r.width / 2, y = r.top + r.height / 2;
              if (x < 0 || y < 0 || x >= window.innerWidth || y >= window.innerHeight) return false;
              return aide.contains(document.elementFromPoint(x, y));
            }).map(b => b.textContent);
            aide.style.pointerEvents = avant;
            return sous;
          });
          controle(couvertes.length === 0, `accueil, ${quand} : l’aide passe sur la pastille ${couvertes.join(', ')}`);
        };
        await controlerPastilles(sansGl ? 'schéma 2D' : 'vue d’ensemble');
        await capturer(page, 'accueil-scene.png', { sel: '#scene' });

        // Pastille 2, depuis le haut de la page : la carte « Étrier et plaquettes ».
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
        let y0 = null;
        await agir('la pastille 2', async () => { y0 = await cliquerPastille(2); });
        if (y0 !== null) a.pastille2 = await choix('pastille 2', 'etrier', 'Étrier et plaquettes', y0, false);
        await capturer(page, 'accueil-pastille-2.png');

        // Pastille 3, après la vue d'ensemble (la pastille 3 peut sortir du cadre de l'étrier) et depuis le haut.
        await agir('la vue d’ensemble', () => page.click('#vue-ensemble'));
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
        y0 = null;
        await agir('la pastille 3', async () => { y0 = await cliquerPastille(3); });
        if (y0 !== null) a.pastille3 = await choix('pastille 3', 'manettes', 'Manettes et durites', y0, false);

        // Le bouton de la carte « Étrier et plaquettes », comme après avoir lu les cartes : il est au milieu de
        // l'écran, et l'image en partie au-dessus.
        const bouton = page.locator('button.zone-btn[data-zone="etrier"]');
        await bouton.evaluate(b => b.scrollIntoView({ block: 'center', behavior: 'instant' }));
        await pause(200);
        const avantBouton = await etat();
        const bb = await bouton.boundingBox();
        await agir('le bouton « Étrier et plaquettes »', () => page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2));
        a.boutonEtrier = {
          imageAvant: avantBouton.image,
          ...await choix('bouton « Étrier et plaquettes »', 'etrier', 'Étrier et plaquettes', avantBouton.scrollY, true),
        };
        await capturer(page, 'accueil-bouton-etrier.png');

        if (!sansGl) {
          // Le disque XT en vue d'ensemble : la variante la plus lourde, pour le budget de triangles.
          const variantes = page.locator('#variante button');
          await agir('le bouton des disques', () => page.click('button.zone-btn[data-zone="disques"]'));
          if (await variantes.count() >= 2) {
            await agir('la variante XT', () => variantes.nth(1).click());
            controle(await variantes.nth(1).getAttribute('aria-pressed') === 'true', 'accueil : la variante XT n’est pas pressée');
            await agir('la vue d’ensemble', () => page.click('#vue-ensemble'));
            await relever(page, 'accueil, disque XT en vue d’ensemble');
            await capturer(page, 'accueil-variante-xt.png', { sel: '#scene-stage' });
            await agir('la variante d’origine', () => variantes.nth(0).click());
          } else erreur('contrôle : accueil : pas de bouton de variante pour les disques');
          // La sortie des plaquettes, animée avec --mouvement, puis leur retour.
          await agir('le bouton de l’étrier', () => page.click('button.zone-btn[data-zone="etrier"]'));
          if (await variantes.count() >= 2) {
            await agir('les plaquettes sorties', () => variantes.nth(1).click());
            await relever(page, 'accueil, plaquettes sorties');
            await agir('les plaquettes en place', () => variantes.nth(0).click());
          } else erreur('contrôle : accueil : pas de bouton de variante pour l’étrier');
          a.triangles = rapport.triangles;
        } else {
          await agir('le bouton des disques', () => page.click('button.zone-btn[data-zone="disques"]'), false);
          e = await etat();
          controle(e.variante === null, 'accueil : sans WebGL, la variante des disques s’affiche');
        }

        // L'onglet « Schéma 2D ».
        await agir('l’onglet 2D', () => page.click('#mode-2d'), false);
        e = await etat();
        await relever(page, 'accueil, schéma 2D');
        controle(e.svg2d, 'accueil, onglet « Schéma 2D » : le schéma n’est pas visible');
        controle(e.variante === null, 'accueil, onglet « Schéma 2D » : la variante reste affichée');
        await controlerPastilles('schéma 2D');
        await capturer(page, 'accueil-2d.png', { sel: '#scene' });
        if (!sansGl) await agir('l’onglet 3D réaliste', () => page.click('#mode-reel'));

        // La fenêtre « Ce qui est approché » s'ouvre et se remplit.
        await page.click('#approche');
        await pause(500);
        a.approche = await page.evaluate(() => ({
          ouverte: document.getElementById('approche-liste').open,
          pieces: document.querySelectorAll('#approche-contenu section.appr').length,
        }));
        controle(a.approche.ouverte && a.approche.pieces > 0, 'accueil, « Ce qui est approché » : ' + JSON.stringify(a.approche));
        await relever(page, 'accueil, « Ce qui est approché »');
        await page.click('#approche-liste form button');
        await relever(page, 'accueil, fin');
      });

      // ---- 3. Anciennes ancres de la racine ----
      await passe('anciennes ancres', async () => {
        rapport.anciennesAncres = {};
        for (const [depart, cible] of ANCIENNES_ANCRES) {
          const [chemin, ancre = ''] = cible.split('#');
          const { ctx, page } = await ouvrir(depart, { arrivee: u => u.pathname === '/' + chemin });
          await pause(PAUSE_ANIMATION);
          const r = await page.evaluate(id => {
            const haut = document.querySelector('.top')?.getBoundingClientRect().bottom ?? 0;
            const c = id ? document.getElementById(id) : null, q = c ? c.getBoundingClientRect() : null;
            return {
              chemin: location.pathname, ancre: location.hash, historique: history.length,
              titre: document.querySelector('h1')?.textContent.trim() ?? null,
              cible: c ? {
                haut: Math.round(q.top), bas: Math.round(q.bottom), barre: Math.round(haut),
                vue: q.height > 0 && q.top >= haut - 2 && q.top < window.innerHeight,
              } : null,
            };
          }, ancre);
          const arrive = r.chemin === '/' + chemin && r.ancre === (ancre ? '#' + ancre : '');
          controle(arrive, `${depart} arrive sur ${r.chemin}${r.ancre} au lieu de /${cible}`);
          if (ancre) controle(r.cible && r.cible.vue, `${depart} : #${ancre} n’est pas à l’écran sous la barre ${JSON.stringify(r.cible)}`);
          if (chemin === ATELIER) controle(r.titre === TITRE_ATELIER, `${depart} : la page s’appelle « ${r.titre} »`);
          if (depart === FAVORI) {
            rapport.ancienFavori = arrive && r.titre === TITRE_ATELIER;
            await capturer(page, 'ancre-freins-plaquettes.png');
          }
          if (ancre) await capturer(page, `ancre-${ancre}.png`);
          await relever(page, `${depart} arrivé sur ${ici(page)}`);
          // Retour quitte le site : la racine n'est pas restée derrière. Si elle y était, Retour la rouvrirait et elle
          // renverrait aussitôt vers la même page. (Le nouvel onglet de Playwright commence par about:blank.)
          await page.goBack({ timeout: 10000 }).catch(() => null);
          await pause(500);
          r.retour = page.url();
          controle(!r.retour.startsWith(base), `${depart} : Retour reste sur le site (${r.retour}), la racine est derrière`);
          rapport.anciennesAncres[depart] = { ...r, arrive };
          await fermer(ctx);
        }
      });

      // ---- 4. Catégorie ----
      await passe('catégorie', async () => {
        const { page } = await ouvrir(CATEGORIE);
        const visibles = () => page.$$eval('a.carte[data-type]',
          cs => cs.filter(c => !c.hidden && c.getClientRects().length > 0).map(c => c.dataset.type));
        const toutes = await visibles();
        await page.click('div.filtres button[data-type="remplacer"]');
        await pause(200);
        const remplacer = await visibles();
        const presse = await page.$eval('div.filtres button[data-type="remplacer"]', b => b.getAttribute('aria-pressed'));
        await relever(page, 'freins/, filtre « Remplacer »');
        await capturer(page, 'freins-remplacer.png');
        await page.click('div.filtres button[data-type="tout"]');
        await pause(200);
        const retour = await visibles();
        rapport.categorie = { toutes: toutes.length, remplacer, presse, retour: retour.length };
        controle(remplacer.length === CARTES_REMPLACER && remplacer.every(t => t === 'remplacer'),
          `freins/, filtre « Remplacer » : cartes visibles ${JSON.stringify(remplacer)} au lieu de ${CARTES_REMPLACER} « remplacer »`);
        controle(presse === 'true', 'freins/, filtre « Remplacer » : le bouton n’est pas pressé');
        controle(toutes.length > CARTES_REMPLACER && retour.length === toutes.length,
          `freins/, filtre « Tout » : ${retour.length} cartes sur ${toutes.length}`);
      });

      // ---- 5. Atelier ----
      await passe('atelier', async () => {
        const at = rapport.atelier = {};
        const { page } = await ouvrir(ATELIER);

        // Le lien du fil d'Ariane, atteint au clavier depuis le haut de la page : son anneau de focus ne doit être
        // rogné par aucun parent (overflow). Sous 900 px, .crumbs tient sur une ligne en overflow:hidden.
        let atteint = false;
        for (let i = 0; i < 80 && !atteint; i++) {
          await page.keyboard.press('Tab');
          atteint = await page.evaluate(() => document.activeElement?.matches('.crumbs a') ?? false);
        }
        if (controle(atteint, 'freins/plaquettes/ : Tab n’atteint pas le lien du fil d’Ariane')) {
          at.focusFil = await page.evaluate(() => {
            const a = document.activeElement, s = getComputedStyle(a), r = a.getBoundingClientRect();
            const marge = (parseFloat(s.outlineOffset) || 0) + (parseFloat(s.outlineWidth) || 0);
            const anneau = { haut: r.top - marge, bas: r.bottom + marge, gauche: r.left - marge, droite: r.right + marge };
            const rognePar = [];
            for (let p = a.parentElement; p && p !== document.documentElement; p = p.parentElement) {
              const cs = getComputedStyle(p);
              if (cs.overflowX === 'visible' && cs.overflowY === 'visible') continue;
              const q = p.getBoundingClientRect(), bord = k => parseFloat(cs[k]) || 0;
              const boite = {
                haut: q.top + bord('borderTopWidth'), bas: q.bottom - bord('borderBottomWidth'),
                gauche: q.left + bord('borderLeftWidth'), droite: q.right - bord('borderRightWidth'),
              };
              if (anneau.haut < boite.haut - 0.5 || anneau.bas > boite.bas + 0.5 || anneau.gauche < boite.gauche - 0.5 ||
                anneau.droite > boite.droite + 0.5) rognePar.push(p.tagName.toLowerCase() + '.' + String(p.className).split(' ')[0]);
            }
            return { lien: a.textContent, focusVisible: a.matches(':focus-visible'), contour: s.outlineStyle, marge, rognePar };
          });
          controle(at.focusFil.focusVisible && at.focusFil.contour !== 'none',
            'freins/plaquettes/ : pas d’anneau de focus sur le lien du fil d’Ariane');
          controle(at.focusFil.rognePar.length === 0,
            `freins/plaquettes/ : l’anneau de focus du fil d’Ariane est rogné par ${at.focusFil.rognePar.join(', ')}`);
          await capturer(page, 'fil-ariane-focus.png', { sel: '.top' });
        }

        // La pièce 3D, derrière son onglet.
        const figure = page.locator('figure.v3d');
        if (controle(await figure.count() === 1, 'freins/plaquettes/ : pas de pièce 3D (figure.v3d)')) {
          if (await figure.evaluate(f => f.hidden)) {
            await page.locator('div.figures .onglets button', { hasText: 'Pièce en 3D' }).click();
          }
          await figure.scrollIntoViewIfNeeded();
          if (sansGl) {
            const message = await page.waitForSelector('figure.v3d .v3d-fallback', { timeout: 30000 }).then(() => true, () => false);
            const canevas = await page.$('figure.v3d canvas');
            at.piece3d = { message, canevas: Boolean(canevas) };
            controle(message && !canevas, 'freins/plaquettes/ : sans WebGL, la pièce 3D n’affiche pas son message');
          } else {
            await page.waitForFunction(() => {
              const v = document.querySelector('figure.v3d')?.__viewer;
              return Boolean(v && v.renderer && v.renderer.info.render.frame > 0);
            }, null, { timeout: 60000 }).catch(() => {});
            // Les images faites par la visionneuse, puis une image refaite sur le moment et relue tout de suite :
            // une fois affiché, le tampon d'un canevas WebGL ne se relit plus.
            at.piece3d = await page.evaluate(() => {
              const v = document.querySelector('figure.v3d')?.__viewer;
              const c = document.querySelector('figure.v3d .v3d-stage canvas');
              if (!v || !v.renderer || !c) return { canevas: Boolean(c), images: 0 };
              const images = v.renderer.info.render.frame;
              v.renderer.render(v.scene, v.camera);
              const gl = v.renderer.getContext(), w = gl.drawingBufferWidth, h = gl.drawingBufferHeight;
              const px = new Uint8Array(w * h * 4);
              gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px);
              let pleins = 0;
              for (let i = 3; i < px.length; i += 4) if (px[i] > 0) pleins++;
              const r = c.getBoundingClientRect();
              return {
                canevas: true, images, triangles: v.renderer.info.render.triangles,
                couvert: Math.round(pleins / (w * h) * 1000) / 1000, largeur: Math.round(r.width), hauteur: Math.round(r.height),
              };
            });
            controle(at.piece3d.canevas && at.piece3d.images > 0 && at.piece3d.couvert >= 0.02 && at.piece3d.largeur > 0 &&
              at.piece3d.hauteur > 0, 'freins/plaquettes/ : la pièce 3D n’est pas dessinée ' + JSON.stringify(at.piece3d));
          }
          await relever(page, 'freins/plaquettes/, pièce 3D');
          await capturer(page, 'freins-plaquettes-3d.png', { sel: 'figure.v3d' });
        }

        // « Tout déplier », puis « Tout replier ».
        const etapes = () => page.$$eval('li.step > details', ds => ({ toutes: ds.length, ouvertes: ds.filter(d => d.open).length }));
        const depart = await etapes();
        await page.click('#tout-deplier');
        await pause(200);
        const deplie = await etapes();
        const libelle = await page.$eval('#tout-deplier', b => b.textContent);
        await relever(page, 'freins/plaquettes/, tout déplié');
        await page.click('#tout-deplier');
        await pause(200);
        const replie = await etapes();
        at.toutDeplier = { depart, deplie, libelle, replie };
        controle(depart.toutes === ETAPES_ATELIER && depart.ouvertes === 0,
          `freins/plaquettes/ : ${depart.toutes} étapes (${depart.ouvertes} ouvertes) au lieu de ${ETAPES_ATELIER} repliées`);
        controle(deplie.ouvertes === ETAPES_ATELIER && libelle === 'Tout replier',
          `freins/plaquettes/ : « Tout déplier » ouvre ${deplie.ouvertes} étapes (« ${libelle} »)`);
        controle(replie.ouvertes === 0, `freins/plaquettes/ : « Tout replier » laisse ${replie.ouvertes} étapes ouvertes`);

        // Le mode pas à pas.
        const pap = () => page.evaluate(() => {
          const b = document.querySelector('div.pas-a-pas');
          return {
            ouvert: Boolean(b) && !b.hidden && b.getClientRects().length > 0,
            position: b?.querySelector('.pap-pos')?.textContent ?? null,
            titre: b?.querySelector('h2')?.textContent ?? null, focus: document.activeElement?.id ?? null,
          };
        });
        await page.click('#pas-a-pas');
        await pause(300);
        const ouvert = await pap();
        await page.keyboard.press('ArrowRight');
        await pause(300);
        const suivant = await pap();
        await relever(page, 'freins/plaquettes/, pas à pas');
        await capturer(page, 'freins-plaquettes-pas-a-pas.png');
        await page.keyboard.press('Escape');
        await pause(300);
        const ferme = await pap();
        at.pasAPas = { ouvert, suivant, ferme };
        controle(ouvert.ouvert && ouvert.position === `1 / ${ETAPES_ATELIER}`,
          'freins/plaquettes/ : le pas à pas ne s’ouvre pas sur la première étape ' + JSON.stringify(ouvert));
        controle(suivant.ouvert && suivant.position === `2 / ${ETAPES_ATELIER}`,
          'freins/plaquettes/ : la flèche droite ne passe pas à l’étape 2 ' + JSON.stringify(suivant));
        controle(!ferme.ouvert && ferme.focus === 'pas-a-pas',
          'freins/plaquettes/ : Échap ne ferme pas le pas à pas ou ne rend pas le focus ' + JSON.stringify(ferme));

        // Le lien d'évitement, sur une page neuve : le premier Tab le montre à l'écran, Entrée mène au contenu, et le
        // Tab suivant reste dans le contenu, sans repasser par le menu.
        const { page: neuve } = await ouvrir(ATELIER);
        await neuve.keyboard.press('Tab');
        const lien = await neuve.evaluate(() => {
          const a = document.activeElement, r = a.getBoundingClientRect();
          const x = r.left + r.width / 2, y = r.top + r.height / 2;
          return {
            evitement: a.matches('a.evitement'), texte: a.textContent,
            aLEcran: r.width > 1 && r.height > 1 && r.top >= 0 && r.left >= 0 && r.bottom <= window.innerHeight &&
              r.right <= window.innerWidth,
            dessus: a.contains(document.elementFromPoint(x, y)),
          };
        });
        await capturer(neuve, 'evitement.png');
        await neuve.keyboard.press('Enter');
        await pause(PAUSE_ANIMATION);
        await neuve.keyboard.press('Tab');
        const suite = await neuve.evaluate(() => ({
          ancre: location.hash, dansLeContenu: Boolean(document.activeElement?.closest('main#contenu')),
          focus: document.activeElement ? document.activeElement.tagName.toLowerCase() +
            (document.activeElement.id ? '#' + document.activeElement.id : '') : null,
        }));
        at.evitement = { ...lien, ...suite };
        controle(lien.evitement && lien.texte === 'Aller au contenu' && lien.aLEcran && lien.dessus,
          'freins/plaquettes/ : le premier Tab ne montre pas « Aller au contenu » ' + JSON.stringify(lien));
        controle(suite.ancre === '#contenu' && suite.dansLeContenu,
          'freins/plaquettes/ : « Aller au contenu » ne mène pas au contenu ' + JSON.stringify(suite));
        await relever(neuve, 'freins/plaquettes/, après « Aller au contenu »');
      });

      // ---- 6. Recherche ----
      await passe('recherche', async () => {
        const { page } = await ouvrir(ATELIER);
        await page.fill('#recherche', 'TL-FC36');
        await page.waitForSelector('#resultats:not([hidden]) a', { timeout: 5000 }).catch(() => {});
        const resultats = await page.$$eval('#resultats a', as => as.map(a => ({ texte: a.textContent, adresse: a.href })));
        await relever(page, 'recherche « TL-FC36 »');
        await capturer(page, 'recherche.png');
        const r = rapport.recherche = { resultats, arrivee: null };
        if (controle(resultats.length >= 1, 'recherche « TL-FC36 » : aucun résultat')) {
          await Promise.all([
            page.waitForURL(u => u.pathname === '/' + DISQUES, { timeout: 30000 }).catch(() => {}),
            page.locator('#resultats a').first().click(),
          ]);
          r.arrivee = new URL(page.url()).pathname;
          controle(r.arrivee === '/' + DISQUES, `recherche « TL-FC36 » : le premier résultat mène à ${r.arrivee}`);
          await pret(page, { attente: 30000, image: false });
          await relever(page, 'recherche, arrivée');
        }
      });

      // ---- 7. Modules absents ----
      await passe('modules absents', async () => {
        rapport.absents = {};
        for (const [nom, absent] of MODULES_ABSENTS) {
          const { ctx, page } = await ouvrir(ACCUEIL, { absent, attente: 30000 });
          await pause(1000);
          const quoi = `accueil, ${absent} absent`;
          const vue = await page.evaluate(() => {
            const vu = el => Boolean(el) && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
            const alerte = document.getElementById('scene-alerte');
            return {
              alerte: vu(alerte) ? alerte.textContent : null,
              scene: vu(document.getElementById('scene-stage')),
              svg2d: !document.getElementById('plan').hasAttribute('hidden') &&
                document.getElementById('plan').getBoundingClientRect().height > 0,
              canevas: !document.getElementById('gl').hidden,
              pastilles: [...document.querySelectorAll('#pins .zpin')].filter(vu).length,
              liens: [...document.querySelectorAll('.ou-intervenir a[href]')].filter(vu).length,
            };
          });
          controle(vue.alerte !== null && vue.alerte.trim().length > 0, `${quoi} : la page ne dit rien`);
          if (nom === 'scene') {
            controle(vue.scene && vue.svg2d && !vue.canevas, `${quoi} : le schéma 2D n’est pas affiché`);
            controle(vue.pastilles > 0, `${quoi} : aucune pastille sur le schéma`);
          } else {
            controle(!vue.scene, `${quoi} : la scène vide reste à l’écran`);
          }
          controle(vue.liens > 0, `${quoi} : aucun lien vers les ateliers dans « Où intervenir »`);
          if (nom !== 'app') {
            // Les boutons des cartes choisissent toujours la zone.
            await page.click('button.zone-btn[data-zone="etrier"]');
            await pause(300);
            vue.carteActive = await page.$$eval('.zone-carte[aria-current="true"]', cs => cs.map(c => c.dataset.zone));
            controle(vue.carteActive.length === 1 && vue.carteActive[0] === 'etrier',
              `${quoi} : le bouton « Étrier et plaquettes » rend active ${JSON.stringify(vue.carteActive)}`);
          }
          rapport.absents[nom] = vue;
          await relever(page, quoi);
          await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
          await capturer(page, `absent-${nom}.png`);
          await fermer(ctx);
        }
      });
    } else {
      // ---- 8. Sans JavaScript ----
      await passe('sans JavaScript', async () => {
        const s = rapport.sansJavaScript = {};
        let { page } = await ouvrir(ATELIER);
        const etape = page.locator('li.step > details').first();
        const avant = await etape.evaluate(d => d.open);
        await etape.locator('summary').click();
        await pause(200);
        s.etape1 = { avant, apres: await etape.evaluate(d => d.open) };
        controle(!s.etape1.avant && s.etape1.apres, 'sans JavaScript : le summary de l’étape 1 ne l’ouvre pas ' + JSON.stringify(s.etape1));
        Object.assign(s, await page.evaluate(() => {
          const montre = sel => [...document.querySelectorAll(sel)].some(e => e.getClientRects().length > 0);
          const etapes = [...document.querySelectorAll('li.step')];
          return {
            js: document.documentElement.classList.contains('js'),
            etapes: etapes.length,
            etapesCachees: etapes.filter(li => li.closest('[hidden]') || li.querySelector('[hidden]')).length,
            cachesDansLaPage: [...document.querySelectorAll('main [hidden]')].map(e => e.tagName.toLowerCase() +
              (e.id ? '#' + e.id : '') + (e.className ? '.' + String(e.className).split(' ')[0] : '')),
            figures: [...document.querySelectorAll('.figures > figure')].map(f => !f.hidden && f.getClientRects().length > 0),
            commandes: ['.etapes-barre', '.search', '#menu-btn'].filter(montre),
          };
        }));
        controle(!s.js, 'sans JavaScript : la classe js est posée');
        controle(s.etapes === ETAPES_ATELIER && s.etapesCachees === 0, `sans JavaScript : ${s.etapesCachees} étape(s) cachée(s) sur ${s.etapes}`);
        controle(s.cachesDansLaPage.length === 0, 'sans JavaScript : contenu caché par hidden : ' + s.cachesDansLaPage.join(', '));
        controle(s.figures.length === 2 && s.figures.every(Boolean), 'sans JavaScript : figures ' + JSON.stringify(s.figures));
        controle(s.commandes.length === 0, 'sans JavaScript : commandes inertes affichées : ' + s.commandes.join(', '));
        await relever(page, 'sans JavaScript, étape 1 ouverte');
        await capturer(page, 'sans-js-etape-1.png', { sel: 'ol.steps' });

        ({ page } = await ouvrir(CATEGORIE));
        s.categorie = await page.evaluate(() => {
          const cartes = [...document.querySelectorAll('a.carte[data-type]')];
          return {
            filtres: [...document.querySelectorAll('div.filtres')].some(e => e.getClientRects().length > 0),
            cartes: cartes.length, visibles: cartes.filter(c => !c.hidden && c.getClientRects().length > 0).length,
          };
        });
        controle(!s.categorie.filtres, 'sans JavaScript : les filtres de freins/ s’affichent');
        controle(s.categorie.cartes > 0 && s.categorie.visibles === s.categorie.cartes,
          `sans JavaScript : ${s.categorie.visibles} cartes visibles sur ${s.categorie.cartes}`);

        // L'accueil : rien d'inerte dans la scène, et elle dit pourquoi elle reste vide.
        ({ page } = await ouvrir(ACCUEIL));
        s.accueil = await page.evaluate(() => {
          const vu = e => Boolean(e) && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden';
          return {
            commandes: ['#scene .modes', '#scene-aide', '#scene-statut', '#approche', '#vue-ensemble']
              .filter(sel => vu(document.querySelector(sel))),
            statut: [...document.querySelectorAll('#scene .status')].filter(vu).map(e => e.textContent.trim()),
            liens: [...document.querySelectorAll('.ou-intervenir a[href]')].filter(vu).length,
          };
        });
        controle(s.accueil.commandes.length === 0,
          'sans JavaScript : accueil : commandes inertes ou aide affichées : ' + s.accueil.commandes.join(', '));
        controle(s.accueil.statut.length === 1 && s.accueil.statut[0] === STATUT_SANS_JS,
          `sans JavaScript : accueil : la scène dit ${JSON.stringify(s.accueil.statut)} au lieu de « ${STATUT_SANS_JS} »`);
        controle(s.accueil.liens > 0, 'sans JavaScript : accueil : aucun lien vers les ateliers dans « Où intervenir »');
        await relever(page, 'sans JavaScript, accueil');
        await capturer(page, 'sans-js-accueil.png', { sel: '#scene' });
      });
    }
  } catch (e) {
    erreur('script : ' + premiereLigne(e));
  } finally {
    if (browser) await browser.close().catch(() => {});
    await new Promise(r => srv.close(r));
  }
  return rapport;
}

(async () => {
  const opts = lireArguments(process.argv.slice(2));
  if (!opts) {
    console.error(USAGE);
    process.exitCode = 2;
    return;
  }
  const rapport = await controler(opts);
  fs.writeFileSync(path.join(opts.sortie, 'rapport.json'), JSON.stringify(rapport, null, 2) + '\n');
  const echecs = [];
  if (rapport.erreurs.length) echecs.push(rapport.erreurs.length + ' erreur(s)');
  if (rapport.debordement) echecs.push('défilement horizontal');
  if (rapport.triangles > BUDGET_TRIANGLES) echecs.push(`${rapport.triangles} triangles pour ${BUDGET_TRIANGLES}`);
  if (!opts.sansJs && rapport.ancienFavori !== true) echecs.push(`${FAVORI} n’arrive pas sur ${ATELIER}`);
  console.log(JSON.stringify({
    erreurs: rapport.erreurs, debordements: rapport.debordements, triangles: rapport.triangles,
    ancienFavori: rapport.ancienFavori, webgl: rapport.webgl, mouvement: rapport.mouvement, sansJs: rapport.sansJs,
    pages: Object.keys(rapport.pages).length, captures: rapport.captures.length,
    avertissements: rapport.avertissements.length, attendus: rapport.attendus.length,
  }, null, 2));
  console.log(echecs.length ? 'ÉCHEC : ' + echecs.join(' ; ') : 'OK');
  process.exitCode = echecs.length ? 1 : 0;
})();
