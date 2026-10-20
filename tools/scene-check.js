// Usage : node scene-check.js <page.html> <dossier> <largeur> <hauteur> <light|dark> [--disable-webgl]
//
// Contrôle visuel de la page d'accueil (dist/site/index.html), dans Chromium sans écran :
//   1. la page sans ancre : scene-reel.png (la scène au chargement, rendu réaliste en vue d'ensemble), puis
//      scene-2d.png (onglet « Schéma 2D ») ; ensuite chaque zone par sa puce et chaque atelier par la liste de la
//      fiche, avec une capture atelier-<id>.png par atelier ouvert ; enfin le disque XT en vue d'ensemble, pour
//      compter les triangles de la variante la plus lourde, et la liste « Ce qui est approché » ;
//   2. la page chargée sur index.html#freins-plaquettes : l'atelier doit se trouver dans #fiche
//      (capture ancre-freins-plaquettes.png, l'écran tel qu'il s'affiche).
// Avec --disable-webgl, Chromium démarre sans WebGL : la page doit passer au schéma 2D et le dire, sans erreur.
// scene-reel.png montre alors ce repli.
//
// Le dossier reçoit aussi rapport.json : { erreurs, debordement, triangles, ancreOuverte, webgl, avertissements,
// captures }.
//   erreurs : messages d'erreur de la console, erreurs de page, requêtes échouées ou en erreur HTTP, et contrôles
//     de la page qui échouent (préfixe « contrôle : ») ;
//   debordement : la page a défilé en largeur à au moins une étape ;
//   triangles : le plus grand nombre de triangles d'une image 3D, lu sur <html data-triangles> (0 sans WebGL) ;
//   ancreOuverte : #freins-plaquettes est dans #fiche après le chargement sur son ancre ;
//   avertissements : avertissements de la console, sans doublon (le repli 2D en écrit un, voulu).
// Code de sortie 1 si erreurs n'est pas vide, si debordement est vrai, si triangles dépasse 500 000 ou si
// ancreOuverte est faux ; 2 si les arguments sont faux ; 0 sinon.
//
// La page est servie en HTTP sur 127.0.0.1, depuis son dossier, sur un port libre : Chromium refuse les modules ES
// et les cartes d'imports en file://. Le serveur s'arrête à la fin, même en cas d'échec.
const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs'); const http = require('http');

const BUDGET_TRIANGLES = 500000;
const ANCRE = 'freins-plaquettes';
const ARGS_GL = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.css': 'text/css', '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8', '.png': 'image/png',
  '.webp': 'image/webp',
};
const USAGE = 'Usage : node scene-check.js <page.html> <dossier> <largeur> <hauteur> <light|dark> [--disable-webgl]';

function lireArguments(argv) {
  const sansGl = argv.includes('--disable-webgl');
  const [page, dossier, largeur, hauteur, theme] = argv.filter(a => a !== '--disable-webgl');
  const w = Number(largeur), h = Number(hauteur);
  const ok = page && dossier && Number.isInteger(w) && w > 0 && Number.isInteger(h) && h > 0 &&
    (theme === 'light' || theme === 'dark') && fs.existsSync(page);
  return ok ? { page: path.resolve(page), dossier: path.resolve(dossier), largeur: w, hauteur: h, theme, sansGl } : null;
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
  const { page: fichier, dossier, largeur, hauteur, theme, sansGl } = opts;
  const rapport = {
    erreurs: [], debordement: false, triangles: 0, ancreOuverte: false, webgl: !sansGl, avertissements: [],
    captures: [],
  };
  const erreur = s => { rapport.erreurs.push(s); };
  const controle = (ok, s) => { if (!ok) erreur('contrôle : ' + s); };
  fs.mkdirSync(dossier, { recursive: true });

  const srv = await servir(path.dirname(fichier));
  const base = `http://127.0.0.1:${srv.address().port}/${path.basename(fichier)}`;
  let browser = null;
  try {
    browser = await chromium.launch({ args: sansGl ? [...ARGS_GL, '--disable-webgl'] : ARGS_GL });

    async function ouvrir(ancre) {
      const ctx = await browser.newContext({
        viewport: { width: largeur, height: hauteur }, deviceScaleFactor: 2, colorScheme: theme, reducedMotion: 'reduce',
      });
      const page = await ctx.newPage();
      page.on('console', m => {
        const t = m.text();
        if (m.type() === 'error') erreur('console : ' + t);
        else if (m.type() === 'warning' && !rapport.avertissements.includes(t)) rapport.avertissements.push(t);
      });
      page.on('pageerror', e => erreur('page : ' + e.message));
      page.on('requestfailed', r => erreur('requête échouée : ' + r.url() + ' (' + (r.failure()?.errorText ?? '') + ')'));
      page.on('response', r => { if (r.status() >= 400) erreur('HTTP ' + r.status() + ' : ' + r.url()); });
      await page.goto(base + ancre);
      // Prête : le message « Montage du vélo en 3D… » disparaît quand la scène est montée ou que la page passe au 2D.
      await page.waitForFunction(() => document.getElementById('scene-statut')?.hidden === true, null, { timeout: 180000 });
      return { ctx, page };
    }

    const etat = page => page.evaluate(() => ({
      debordement: document.documentElement.scrollWidth > window.innerWidth + 1,
      triangles: Number(document.documentElement.dataset.triangles ?? 0),
      alerte: document.getElementById('scene-alerte').hidden ? null : document.getElementById('scene-alerte').textContent,
      svg2d: !document.getElementById('plan').hasAttribute('hidden') &&
        document.getElementById('plan').getBoundingClientRect().height > 0,
      canevas: !document.getElementById('gl').hidden,
      titre: document.getElementById('fiche-titre')?.textContent ?? null,
      ouvert: document.querySelector('#fiche .fiche-atelier > section.atelier')?.id ?? null,
    }));
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
        await pause(400);
        return;
      }
      await page.evaluate(() => { delete document.documentElement.dataset.triangles; });
      await action();
      await page.waitForFunction(() => document.documentElement.dataset.triangles !== undefined, null, { timeout: 60000 })
        .catch(() => erreur('contrôle : aucune image 3D dessinée après ' + nom));
      await pause(300);
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

    // ---- 1. La page sans ancre ----
    {
      const { ctx, page } = await ouvrir('');
      if (!sansGl) {
        await page.waitForFunction(() => document.documentElement.dataset.triangles !== undefined, null, { timeout: 60000 })
          .catch(() => erreur('contrôle : aucune image 3D dessinée au chargement'));
      }
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
      const { ctx, page } = await ouvrir('#' + ANCRE);
      await pause(1500);
      const e = await relever(page);
      rapport.ancreOuverte = e.ouvert === ANCRE &&
        await page.evaluate(id => Boolean(document.querySelector('#fiche #' + id)), ANCRE);
      const puces = await page.$$eval('#chips button', bs => bs.map(b => b.getAttribute('aria-pressed')));
      controle(puces.filter(p => p === 'true').length === 1, 'ancre : aucune zone choisie ' + JSON.stringify(puces));
      await page.screenshot({ path: path.join(dossier, `ancre-${ANCRE}.png`) });
      rapport.captures.push(`ancre-${ANCRE}.png`);
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
