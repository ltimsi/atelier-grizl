// Usage : node scene-check.js <page.html> <dossier> <largeur> <hauteur> <light|dark> [--disable-webgl] [--mouvement]
//
// Contrôle de la page d'accueil (dist/site/index.html), dans Chromium sans écran. Par défaut, le navigateur demande de
// réduire les animations : vols de caméra et défilements instantanés, captures stables. Avec --mouvement, il ne le
// demande pas : vols de caméra, sortie animée des plaquettes, cuisson de l'ombre à la fin, défilements doux.
//   1. la page sans ancre : scene-reel.png (la scène au chargement, rendu réaliste en vue d'ensemble), puis
//      scene-2d.png (onglet « Schéma 2D ») ; ensuite chaque zone par sa puce et chaque atelier par la liste de la
//      fiche, avec une capture atelier-<id>.png par atelier ouvert ; enfin le disque XT en vue d'ensemble, pour
//      compter les triangles de la variante la plus lourde, et la liste « Ce qui est approché ». À chaque atelier
//      ouvert, la tête de la fiche dit « D’origine : … » et « À monter : … » si l'atelier a data-de et data-vers, et
//      ne les dit pas sinon. L'aide de la scène a un fond ;
//   2. la page chargée sur index.html#freins-plaquettes : l'atelier doit se trouver dans #fiche. Une fois la 3D et
//      son bouton de variante montés, le haut du titre de l'atelier doit être sur la ligne où le navigateur pose une
//      ancre (haut de l'écran plus scroll-padding-top), à 6 px près : le bouton de variante ne le pousse pas.
//      Deux réglages montrent la poussée là où Chromium la cacherait : l'ancrage du défilement (overflow-anchor) est
//      coupé, car il la compense tout seul et tous les navigateurs ne l'ont pas ; three.js arrive avec un retard,
//      comme sur un téléphone, pour que la 3D se monte après l'événement load, jusqu'auquel Chromium garde l'ancre
//      en place (capture ancre-freins-plaquettes.png, l'écran tel qu'il s'affiche) ;
//   3. liens entre ateliers et Retour : la puce des manettes puis le bouton de la liste ouvrent freins-purge,
//      l'adresse devient #freins-purge sans nouvelle entrée d'historique. Le lien « 2.3 » de « À démonter avant »
//      ouvre freins-plaquettes dans la fiche, avec une entrée d'historique, sans faire défiler la page plus bas que
//      la fiche. Retour rouvre freins-purge dans la fiche, l'adresse redevient #freins-purge et la carte est à l'écran.
//      Suivant rouvre freins-plaquettes (captures lien-freins-plaquettes.png et retour-freins-purge.png) ;
//   4. modules absents, chacun servi en 404 dans sa propre page :
//      js/scene/scene.js : la page passe au schéma 2D et le dit, les pastilles et les puces ouvrent les ateliers ;
//      js/scene/pieces/roues.js (la 3D et le schéma 2D en ont besoin) : la page le dit, la scène vide disparaît, les
//        puces ouvrent toujours les ateliers dans la fiche ;
//      js/scene/app.js : le garde-fou de la page le dit, la scène et la fiche disparaissent, les ateliers restent
//        lisibles dans leur chapitre et chaque figure 3D des chapitres affiche son propre message.
//      Seules les erreurs du fichier absent sont attendues. Captures absent-<nom>.png.
// Avec --disable-webgl, Chromium démarre sans WebGL : la page doit passer au schéma 2D et le dire, sans erreur.
// scene-reel.png montre alors ce repli.
//
// Le dossier reçoit aussi rapport.json : { erreurs, debordement, triangles, ancreOuverte, ancreDecalage, webgl,
// mouvement, historique, absents, avertissements, attendus, captures }.
//   erreurs : messages d'erreur de la console, erreurs de page, requêtes échouées ou en erreur HTTP, et contrôles
//     de la page qui échouent (préfixe « contrôle : ») ;
//   debordement : la page a défilé en largeur à au moins une étape ;
//   triangles : le plus grand nombre de triangles d'une image 3D, lu sur <html data-triangles> (0 sans WebGL) ;
//   ancreOuverte : #freins-plaquettes est dans #fiche après le chargement sur son ancre ;
//   ancreDecalage : en pixels, le haut du titre de cet atelier moins la ligne de l'ancre ;
//   historique : ce que la passe 3 a vu (adresses, longueurs d'historique, défilement le plus bas) ;
//   absents : pour chaque module servi en 404, ce que la page montre ;
//   avertissements : avertissements de la console, sans doublon (le repli 2D en écrit un, voulu) ;
//   attendus : erreurs de la console et réponses HTTP dues au module servi en 404, que la passe 4 provoque.
// Code de sortie 1 si erreurs n'est pas vide, si debordement est vrai, si triangles dépasse 500 000 ou si
// ancreOuverte est faux ; 2 si les arguments sont faux ; 0 sinon.
//
// La page est servie en HTTP sur 127.0.0.1, depuis son dossier, sur un port libre : Chromium refuse les modules ES
// et les cartes d'imports en file://. Le serveur s'arrête à la fin, même en cas d'échec.
const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs'); const http = require('http');

const BUDGET_TRIANGLES = 500000;
const ANCRE = 'freins-plaquettes';
const TOLERANCE_ANCRE = 6; // en pixels
const ARGS_GL = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.css': 'text/css', '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8', '.png': 'image/png',
  '.webp': 'image/webp',
};
const DRAPEAUX = ['--disable-webgl', '--mouvement'];
const USAGE = 'Usage : node scene-check.js <page.html> <dossier> <largeur> <hauteur> <light|dark> ' +
  '[--disable-webgl] [--mouvement]';

function lireArguments(argv) {
  const drapeaux = argv.filter(a => a.startsWith('--'));
  if (drapeaux.some(d => !DRAPEAUX.includes(d))) return null;
  const [page, dossier, largeur, hauteur, theme, ...reste] = argv.filter(a => !a.startsWith('--'));
  const w = Number(largeur), h = Number(hauteur);
  const ok = page && dossier && Number.isInteger(w) && w > 0 && Number.isInteger(h) && h > 0 &&
    (theme === 'light' || theme === 'dark') && fs.existsSync(page) && reste.length === 0;
  return ok ? {
    page: path.resolve(page), dossier: path.resolve(dossier), largeur: w, hauteur: h, theme,
    sansGl: drapeaux.includes('--disable-webgl'), mouvement: drapeaux.includes('--mouvement'),
  } : null;
}

function servir(racine) {
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      let rel;
      try {
        rel = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
      } catch {
        res.writeHead(400);
        res.end();
        return;
      }
      const f = path.join(racine, rel);
      if (!f.startsWith(racine + path.sep)) { res.writeHead(403); res.end(); return; }
      fs.readFile(f, (err, buf) => {
        if (err) { res.writeHead(404); res.end(); return; }
        res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
        res.end(buf);
      });
    });
    srv.listen(0, '127.0.0.1', () => resolve(srv));
  });
}

const pause = ms => new Promise(r => setTimeout(r, ms));

async function controler(opts) {
  const { page: fichier, dossier, largeur, hauteur, theme, sansGl, mouvement } = opts;
  const rapport = {
    erreurs: [], debordement: false, triangles: 0, ancreOuverte: false, ancreDecalage: null, webgl: !sansGl,
    mouvement, historique: {}, absents: {}, avertissements: [], attendus: [], captures: [],
  };
  const erreur = s => { rapport.erreurs.push(s); };
  const controle = (ok, s) => { if (!ok) erreur('contrôle : ' + s); };
  // Après une action qui anime (vol de caméra, plaquettes, défilement doux), le temps que l'animation finisse.
  const PAUSE_ANIMATION = mouvement ? 1400 : 300;
  fs.mkdirSync(dossier, { recursive: true });

  const srv = await servir(path.dirname(fichier));
  const base = `http://127.0.0.1:${srv.address().port}/${path.basename(fichier)}`;
  let browser = null;
  try {
    browser = await chromium.launch({ args: sansGl ? [...ARGS_GL, '--disable-webgl'] : ARGS_GL });

    // Ouvre la page dans un contexte neuf. `absent` : chemin servi en 404, dont les erreurs sont attendues.
    // `sansAncrage` : coupe l'ancrage du défilement de Chromium, dès que le document a son <head>.
    // `retardThree` : en millisecondes, retard de three.module.min.js, pour une 3D montée après l'événement load.
    async function ouvrir(ancre, { absent = null, attente = 180000, sansAncrage = false, retardThree = 0 } = {}) {
      const ctx = await browser.newContext({
        viewport: { width: largeur, height: hauteur }, deviceScaleFactor: 2, colorScheme: theme,
        reducedMotion: mouvement ? 'no-preference' : 'reduce',
      });
      if (sansAncrage) {
        await ctx.addInitScript(() => document.addEventListener('DOMContentLoaded', () => {
          const s = document.createElement('style');
          s.textContent = '*{overflow-anchor:none!important}';
          document.head.append(s);
        }, { capture: true }));
      }
      const duAbsent = url => absent !== null && url.endsWith('/' + absent);
      if (absent) await ctx.route(u => duAbsent(u.href), r => r.fulfill({ status: 404, body: '' }));
      if (retardThree) {
        await ctx.route(u => u.pathname.endsWith('/three.module.min.js'), async r => {
          await pause(retardThree);
          await r.continue();
        });
      }
      const page = await ctx.newPage();
      page.on('console', m => {
        const t = m.text();
        if (m.type() === 'error') {
          if (duAbsent(m.location()?.url ?? '')) rapport.attendus.push(`${absent} : console : ${t}`);
          else erreur('console : ' + t);
        } else if (m.type() === 'warning' && !rapport.avertissements.includes(t)) rapport.avertissements.push(t);
      });
      page.on('pageerror', e => erreur('page : ' + e.message));
      page.on('requestfailed', r => {
        const t = 'requête échouée : ' + r.url() + ' (' + (r.failure()?.errorText ?? '') + ')';
        if (duAbsent(r.url())) rapport.attendus.push(`${absent} : ${t}`);
        else erreur(t);
      });
      page.on('response', r => {
        if (r.status() < 400) return;
        if (duAbsent(r.url())) rapport.attendus.push(`${absent} : HTTP ${r.status()}`);
        else erreur('HTTP ' + r.status() + ' : ' + r.url());
      });
      await page.goto(base + ancre);
      // Prête : le message « Montage du vélo en 3D… » disparaît quand la scène est montée, que la page passe au 2D,
      // ou que la page dit qu'elle n'a ni l'un ni l'autre.
      await page.waitForFunction(() => {
        const s = document.getElementById('scene-statut');
        return s && (s.hidden || s.getClientRects().length === 0);
      }, null, { timeout: attente }).catch(() => erreur('contrôle : la page reste sur « Montage du vélo en 3D… »' +
        (absent ? ` (${absent} absent)` : '')));
      return { ctx, page };
    }

    const etat = page => page.evaluate(() => {
      const vu = e => Boolean(e) && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden';
      const tete = document.querySelector('#fiche .fiche-tete');
      return {
        debordement: document.documentElement.scrollWidth > window.innerWidth + 1,
        triangles: Number(document.documentElement.dataset.triangles ?? 0),
        alerte: vu(document.getElementById('scene-alerte')) ? document.getElementById('scene-alerte').textContent : null,
        svg2d: !document.getElementById('plan').hasAttribute('hidden') &&
          document.getElementById('plan').getBoundingClientRect().height > 0,
        canevas: !document.getElementById('gl').hidden,
        scene: vu(document.getElementById('scene-stage')),
        fiche: vu(document.getElementById('fiche')),
        titre: document.getElementById('fiche-titre')?.textContent ?? null,
        ouvert: document.querySelector('#fiche .fiche-atelier > section.atelier')?.id ?? null,
        tete: tete ? tete.textContent : null,
        hash: location.hash,
        historique: history.length,
      };
    });
    // Après chaque étape : défilement en largeur, et les triangles de la dernière image 3D.
    async function relever(page) {
      const e = await etat(page);
      rapport.debordement ||= e.debordement;
      rapport.triangles = Math.max(rapport.triangles, e.triangles);
      return e;
    }
    // Fait `action`, puis attend l'image 3D qu'elle demande : data-triangles est retiré avant, et la page le repose
    // à l'image suivante. Sans 3D, ou pour une action qui ne change pas la 3D, une courte pause suffit.
    async function agir(page, nom, action, redessine = true) {
      if (sansGl || !redessine) {
        await action();
        await pause(Math.max(400, PAUSE_ANIMATION));
        return;
      }
      await page.evaluate(() => { delete document.documentElement.dataset.triangles; });
      await action();
      await page.waitForFunction(() => document.documentElement.dataset.triangles !== undefined, null, { timeout: 60000 })
        .catch(() => erreur('contrôle : aucune image 3D dessinée après ' + nom));
      await pause(PAUSE_ANIMATION);
    }
    // La tête de la fiche nomme la pièce d'origine et la pièce à monter si l'atelier ouvert a data-de et data-vers.
    async function controlerTete(page, quand) {
      const t = await page.evaluate(() => {
        const s = document.querySelector('#fiche .fiche-atelier > section.atelier');
        return {
          id: s?.id ?? null, de: s?.dataset.de ?? null, vers: s?.dataset.vers ?? null,
          tete: document.querySelector('#fiche .fiche-tete')?.textContent ?? '',
        };
      });
      if (t.de && t.vers) {
        controle(t.tete.includes(`D’origine : ${t.de}`) && t.tete.includes(`À monter : ${t.vers}`),
          `${quand}, ${t.id} : la tête de fiche ne dit pas « D’origine : ${t.de} » et « À monter : ${t.vers} »`);
      } else {
        controle(!/D’origine :|À monter :/.test(t.tete), `${quand}, ${t.id} : « D’origine » ou « À monter » en trop`);
      }
    }
    // Un élément, découpé dans la page entière : la capture d'élément de Playwright laisse un bas vide quand
    // l'élément est presque aussi haut que l'écran (paysage 844 x 390).
    async function capturer(page, nom, sel) {
      await page.locator(sel).scrollIntoViewIfNeeded();
      const clip = await page.$eval(sel, e => {
        const r = e.getBoundingClientRect();
        return { x: r.left + window.scrollX, y: r.top + window.scrollY, width: r.width, height: r.height };
      });
      await page.screenshot({ path: path.join(dossier, nom), fullPage: true, clip });
      rapport.captures.push(nom);
    }
    // La scène, les puces et le début de la fiche : du haut de la scène jusqu'à une hauteur d'écran dans la fiche.
    async function capturerAtelier(page, nom) {
      await page.locator('#scene').scrollIntoViewIfNeeded();
      const clip = await page.evaluate(h => {
        const y = document.getElementById('scene').getBoundingClientRect().top + window.scrollY;
        const fin = document.getElementById('fiche').getBoundingClientRect().top + window.scrollY + h;
        const bas = Math.min(fin, document.documentElement.scrollHeight);
        return { x: 0, y, width: document.documentElement.clientWidth, height: bas - y };
      }, hauteur);
      await page.screenshot({ path: path.join(dossier, nom), fullPage: true, clip });
      rapport.captures.push(nom);
    }
    async function capturerEcran(page, nom) {
      await page.screenshot({ path: path.join(dossier, nom) });
      rapport.captures.push(nom);
    }
    // Attend la première image 3D (rien à attendre sans WebGL).
    async function premiereImage(page, quand) {
      if (sansGl) return;
      await page.waitForFunction(() => document.documentElement.dataset.triangles !== undefined, null, { timeout: 60000 })
        .catch(() => erreur('contrôle : aucune image 3D dessinée ' + quand));
    }

    // ---- 1. La page sans ancre ----
    {
      const { ctx, page } = await ouvrir('');
      await premiereImage(page, 'au chargement');
      await pause(500);
      let e = await relever(page);
      if (sansGl) {
        controle(e.alerte !== null, 'sans WebGL, la page ne dit pas que la 3D manque');
        controle(e.svg2d && !e.canevas, 'sans WebGL, le schéma 2D n’est pas visible');
        controle(await page.$eval('#mode-reel', b => b.disabled), 'sans WebGL, l’onglet 3D réaliste reste actif');
      } else {
        controle(e.alerte === null, 'la 3D ne s’est pas montée : ' + e.alerte);
        controle(e.canevas && !e.svg2d, 'le rendu réaliste n’est pas affiché');
      }
      const fondAide = await page.$eval('#scene-aide', a => getComputedStyle(a).backgroundColor);
      controle(!/^(transparent|rgba\(0, 0, 0, 0\))$/.test(fondAide), 'l’aide de la scène n’a pas de fond : ' + fondAide);
      await capturer(page, 'scene-reel.png', '#scene');

      await agir(page, 'l’onglet 2D', () => page.click('#mode-2d'), false);
      e = await relever(page);
      controle(e.svg2d, 'onglet « Schéma 2D » : le schéma n’est pas visible');
      await capturer(page, 'scene-2d.png', '#scene');
      if (!sansGl) await agir(page, 'l’onglet 3D réaliste', () => page.click('#mode-reel'));

      // Chaque zone par sa puce, puis chaque autre atelier de la zone par la liste de la fiche.
      const zones = await page.$$eval('#chips button', bs => bs.length);
      const vus = [];
      for (let i = 0; i < zones; i++) {
        const puce = page.locator('#chips button').nth(i);
        const nom = (await puce.textContent()).replace(/^\d+/, '').trim();
        await agir(page, 'la puce ' + nom, () => puce.click());
        e = await relever(page);
        controle(e.titre === nom, `puce « ${nom} » : la fiche s’appelle « ${e.titre} »`);
        controle(e.ouvert !== null, `puce « ${nom} » : aucun atelier dans la fiche`);
        if (e.ouvert) {
          vus.push(e.ouvert);
          await controlerTete(page, `puce « ${nom} »`);
          await capturerAtelier(page, `atelier-${e.ouvert}.png`);
        }
        const autres = await page.$$eval('#fiche .fiche-ateliers button', bs => bs.length);
        for (let j = 0; j < autres; j++) {
          const b = page.locator('#fiche .fiche-ateliers button').nth(j);
          if ((await b.getAttribute('aria-pressed')) === 'true') continue;
          await agir(page, 'un atelier de la liste', () => b.click(), false); // même zone : la 3D ne change pas
          e = await relever(page);
          controle(e.ouvert !== null && !vus.includes(e.ouvert), `zone « ${nom} », bouton ${j + 1} : atelier ${e.ouvert}`);
          if (e.ouvert && !vus.includes(e.ouvert)) {
            vus.push(e.ouvert);
            await controlerTete(page, `zone « ${nom} »`);
            await capturerAtelier(page, `atelier-${e.ouvert}.png`);
          }
        }
      }
      const ateliers = await page.$$eval('section.atelier[data-zone]', ss => ss.map(s => s.id));
      const manquants = ateliers.filter(id => !vus.includes(id));
      controle(manquants.length === 0, 'ateliers jamais ouverts : ' + manquants.join(', '));

      // Le disque XT en vue d'ensemble : la variante la plus lourde, pour le budget de triangles.
      if (!sansGl) {
        await agir(page, 'la puce des disques', () => page.locator('#chips button').nth(0).click());
        const xt = page.locator('#fiche .swap button').nth(1);
        if (await xt.count()) {
          await agir(page, 'la variante XT', () => xt.click());
          await agir(page, 'la vue d’ensemble', () => page.click('#vue-ensemble'));
          await relever(page);
          await agir(page, 'la variante d’origine', () => page.locator('#fiche .swap button').nth(0).click());
        } else erreur('contrôle : pas de bouton de variante pour les disques');
        // La sortie des plaquettes, animée avec --mouvement, puis leur retour.
        await agir(page, 'la puce de l’étrier', () => page.locator('#chips button').nth(1).click());
        const sorties = page.locator('#fiche .swap button').nth(1);
        if (await sorties.count()) {
          await agir(page, 'les plaquettes sorties', () => sorties.click());
          await relever(page);
          await agir(page, 'les plaquettes en place', () => page.locator('#fiche .swap button').nth(0).click());
        } else erreur('contrôle : pas de bouton de variante pour l’étrier');
      }

      // La liste « Ce qui est approché » s'ouvre et se remplit.
      await page.click('#approche');
      await pause(500);
      const liste = await page.evaluate(() => ({
        ouverte: document.getElementById('approche-liste').open,
        pieces: document.querySelectorAll('#approche-contenu section.appr').length,
      }));
      controle(liste.ouverte && liste.pieces > 0, 'liste « Ce qui est approché » : ' + JSON.stringify(liste));
      await page.click('#approche-liste form button');
      await relever(page);
      await ctx.close();
    }

    // ---- 2. La page chargée sur l'ancre d'un atelier ----
    {
      const { ctx, page } = await ouvrir('#' + ANCRE, { sansAncrage: true, retardThree: 2500 });
      // La page a défilé jusqu'à l'atelier : la scène est hors de l'écran et ne dessine pas. Prête quand le bouton de
      // variante est monté (avec WebGL), puis le temps que tout se pose.
      if (!sansGl) {
        await page.waitForFunction(() => document.querySelector('#fiche .swap')?.getClientRects().length > 0, null,
          { timeout: 60000 }).catch(() => {});
      }
      await pause(1500);
      const e = await relever(page);
      rapport.ancreOuverte = e.ouvert === ANCRE &&
        await page.evaluate(id => Boolean(document.querySelector('#fiche #' + id)), ANCRE);
      const puces = await page.$$eval('#chips button', bs => bs.map(b => b.getAttribute('aria-pressed')));
      controle(puces.filter(p => p === 'true').length === 1, 'ancre : aucune zone choisie ' + JSON.stringify(puces));
      const place = await page.evaluate(id => {
        const h = document.querySelector(`#fiche #${id} > h3`);
        const swap = document.querySelector('#fiche .swap');
        return {
          titre: h ? h.getBoundingClientRect().top : null,
          ligne: parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0,
          variante: Boolean(swap) && swap.getClientRects().length > 0,
          ancrage: getComputedStyle(document.documentElement).overflowAnchor,
          chargee: document.readyState,
        };
      }, ANCRE);
      if (place.titre === null) erreur('contrôle : ancre : pas de titre h3 dans l’atelier ouvert');
      else {
        rapport.ancreDecalage = Math.round((place.titre - place.ligne) * 10) / 10;
        controle(Math.abs(rapport.ancreDecalage) <= TOLERANCE_ANCRE,
          `ancre : le titre de l’atelier est à ${rapport.ancreDecalage} px de la ligne de l’ancre`);
      }
      if (!sansGl) controle(place.variante, 'ancre : le bouton de variante n’est pas monté');
      controle(place.ancrage === 'none', 'ancre : l’ancrage du défilement n’est pas coupé : ' + place.ancrage);
      await controlerTete(page, 'ancre');
      await capturerEcran(page, `ancre-${ANCRE}.png`);
      await ctx.close();
    }

    // ---- 3. Liens entre ateliers et Retour ----
    {
      const h = rapport.historique;
      const { ctx, page } = await ouvrir('');
      await premiereImage(page, 'au chargement (historique)');
      const manettes = page.locator('#chips button', { hasText: 'Manettes' });
      await agir(page, 'la puce des manettes', () => manettes.click());
      await agir(page, 'le bouton de la purge', () => page.locator('#fiche .fiche-ateliers button', { hasText: '2.7' }).click(),
        false);
      let e = await relever(page);
      h.purge = { ouvert: e.ouvert, hash: e.hash, historique: e.historique };
      controle(e.ouvert === 'freins-purge', 'historique : la liste n’ouvre pas freins-purge : ' + e.ouvert);
      controle(e.hash === '#freins-purge', 'historique : l’adresse ne dit pas #freins-purge : « ' + e.hash + ' »');
      const lien = page.locator('#fiche #freins-purge .a-dem a[href="#freins-plaquettes"]');
      if (!(await lien.count())) erreur('contrôle : historique : pas de lien vers 2.3 dans la purge ouverte');
      else {
        await lien.scrollIntoViewIfNeeded();
        await pause(300);
        await page.evaluate(() => {
          window.__plusBas = window.scrollY;
          window.addEventListener('scroll', () => { window.__plusBas = Math.max(window.__plusBas, window.scrollY); });
        });
        await agir(page, 'le lien 2.3', () => lien.click(), false); // la scène est hors de l'écran : pas d'image
        await pause(1500); // défilement doux jusqu'au titre de l'atelier
        e = await relever(page);
        const vue = await page.evaluate(() => {
          const f = document.getElementById('fiche').getBoundingClientRect();
          const t = document.querySelector('#fiche #freins-plaquettes > h3')?.getBoundingClientRect();
          return {
            plusBas: window.__plusBas, basFiche: f.bottom + window.scrollY,
            titre: t ? t.top : null, ecran: window.innerHeight,
          };
        });
        h.lien = { ouvert: e.ouvert, hash: e.hash, historique: e.historique, ...vue };
        controle(e.ouvert === 'freins-plaquettes', 'historique : le lien 2.3 n’ouvre pas freins-plaquettes : ' + e.ouvert);
        controle(e.hash === '#freins-plaquettes', 'historique : après le lien, l’adresse est « ' + e.hash + ' »');
        controle(e.historique === h.purge.historique + 1,
          `historique : le lien ajoute ${e.historique - h.purge.historique} entrée(s) au lieu d’une`);
        controle(vue.plusBas <= vue.basFiche,
          `historique : le lien fait défiler la page sous la fiche (${vue.plusBas} pour un bas de fiche à ${vue.basFiche})`);
        controle(vue.titre !== null && vue.titre >= 0 && vue.titre < vue.ecran,
          'historique : le titre de 2.3 n’est pas à l’écran après le lien');
        await capturerEcran(page, 'lien-freins-plaquettes.png');

        await page.goBack({ timeout: 15000 }).catch(err => erreur('contrôle : Retour : ' + err.message.split('\n')[0]));
        await page.waitForFunction(() => location.hash === '#freins-purge', null, { timeout: 10000 }).catch(() => {});
        await pause(PAUSE_ANIMATION + 700);
        e = await relever(page);
        const carte = await page.evaluate(() => {
          const r = document.querySelector('#fiche #freins-purge')?.getBoundingClientRect();
          return r ? { haut: r.top, bas: r.bottom, ecran: window.innerHeight } : null;
        });
        h.retour = { ouvert: e.ouvert, hash: e.hash, titre: e.titre, carte };
        controle(e.ouvert === 'freins-purge', 'historique : Retour ne rouvre pas freins-purge : ' + e.ouvert);
        controle(e.hash === '#freins-purge', 'historique : après Retour, l’adresse est « ' + e.hash + ' »');
        controle(carte !== null && carte.bas > 0 && carte.haut < carte.ecran,
          'historique : après Retour, la carte de la purge n’est pas à l’écran ' + JSON.stringify(carte));
        await capturerEcran(page, 'retour-freins-purge.png');

        await page.goForward({ timeout: 15000 }).catch(err => erreur('contrôle : Suivant : ' + err.message.split('\n')[0]));
        await page.waitForFunction(() => location.hash === '#freins-plaquettes', null, { timeout: 10000 }).catch(() => {});
        await pause(PAUSE_ANIMATION + 700);
        e = await relever(page);
        h.suivant = { ouvert: e.ouvert, hash: e.hash };
        controle(e.ouvert === 'freins-plaquettes' && e.hash === '#freins-plaquettes',
          `historique : Suivant donne ${e.ouvert} et « ${e.hash} »`);
      }
      await ctx.close();
    }

    // ---- 4. Modules absents ----
    for (const [nom, absent] of [['scene', 'js/scene/scene.js'], ['roues', 'js/scene/pieces/roues.js'],
      ['app', 'js/scene/app.js']]) {
      const { ctx, page } = await ouvrir('', { absent, attente: 30000 });
      await pause(1000);
      const e = await relever(page);
      const vue = await page.evaluate(() => {
        const vu = el => Boolean(el) && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
        const ateliers = [...document.querySelectorAll('section.atelier[data-zone]')];
        const figures = [...document.querySelectorAll('figure.v3d[data-model] .v3d-stage')];
        return {
          puces: document.querySelectorAll('#chips button').length,
          pastilles: [...document.querySelectorAll('#pins .zpin')].filter(vu).length,
          ateliersLisibles: ateliers.filter(s => !s.closest('#fiche') && vu(s)).length,
          ateliers: ateliers.length,
          figures: figures.length,
          figuresAvecMessage: figures.filter(f => f.querySelector('.v3d-fallback')).length,
        };
      });
      rapport.absents[nom] = { alerte: e.alerte, scene: e.scene, svg2d: e.svg2d, fiche: e.fiche, ...vue };
      const quoi = `${absent} absent`;
      controle(e.alerte !== null && e.alerte.trim().length > 0, `${quoi} : la page ne dit rien`);
      if (nom === 'scene') {
        controle(e.scene && e.svg2d && !e.canevas, `${quoi} : le schéma 2D n’est pas affiché`);
        controle(vue.pastilles > 0, `${quoi} : aucune pastille sur le schéma`);
      } else {
        controle(!e.scene, `${quoi} : la scène vide reste à l’écran`);
      }
      if (nom === 'app') {
        controle(!e.fiche, `${quoi} : la fiche inerte reste à l’écran`);
        controle(vue.ateliersLisibles === vue.ateliers && vue.ateliers > 0,
          `${quoi} : ${vue.ateliersLisibles} atelier(s) lisible(s) dans le chapitre sur ${vue.ateliers}`);
        controle(vue.figures > 0 && vue.figuresAvecMessage === vue.figures,
          `${quoi} : ${vue.figuresAvecMessage} figure(s) 3D avec leur message sur ${vue.figures}`);
      } else {
        // Chaque puce ouvre un atelier de sa zone dans la fiche.
        controle(vue.puces > 0, `${quoi} : aucune puce`);
        for (let i = 0; i < vue.puces; i++) {
          const puce = page.locator('#chips button').nth(i);
          const zone = (await puce.textContent()).replace(/^\d+/, '').trim();
          await puce.click();
          await pause(300);
          const f = await relever(page);
          controle(f.titre === zone && f.ouvert !== null, `${quoi}, puce « ${zone} » : fiche ${f.titre}, atelier ${f.ouvert}`);
        }
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await capturerEcran(page, `absent-${nom}.png`);
      if (nom === 'app' && vue.figures) {
        await page.locator('figure.v3d[data-model]').first().scrollIntoViewIfNeeded();
        await capturerEcran(page, 'absent-app-figure.png');
      }
      await ctx.close();
    }
  } catch (e) {
    erreur('script : ' + (e && e.stack ? e.stack.split('\n')[0] : String(e)));
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
  fs.writeFileSync(path.join(opts.dossier, 'rapport.json'), JSON.stringify(rapport, null, 2) + '\n');
  const echecs = [];
  if (rapport.erreurs.length) echecs.push(rapport.erreurs.length + ' erreur(s)');
  if (rapport.debordement) echecs.push('défilement horizontal');
  if (rapport.triangles > BUDGET_TRIANGLES) echecs.push(`${rapport.triangles} triangles pour ${BUDGET_TRIANGLES}`);
  if (!rapport.ancreOuverte) echecs.push(`#${ANCRE} absent de #fiche`);
  console.log(JSON.stringify({ ...rapport, avertissements: rapport.avertissements.length }, null, 2));
  console.log(echecs.length ? 'ÉCHEC : ' + echecs.join(' ; ') : 'OK');
  process.exitCode = echecs.length ? 1 : 0;
})();
