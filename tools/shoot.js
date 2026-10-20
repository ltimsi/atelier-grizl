// Usage : NODE_PATH=$(npm root -g) node shoot.js <page.html | http://...> <dossier-sortie> [largeur] [theme: light|dark]
// Ouvre la page dans Chromium sans écran, fait défiler chaque figure .v3d et .plate, et enregistre une capture par figure.
// Un fichier local est servi en HTTP depuis son dossier : Chromium refuse les modules ES et les cartes d'imports en file://.
const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs'); const http = require('http');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.css': 'text/css', '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8', '.png': 'image/png', '.webp': 'image/webp' };
function serve(racine) {
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      const f = path.join(racine, decodeURIComponent(req.url.split('?')[0]));
      if (f !== racine && !f.startsWith(racine + path.sep)) { res.writeHead(403); res.end(); return; }
      fs.readFile(f, (err, buf) => {
        if (err) { res.writeHead(404); res.end(); return; }
        res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); res.end(buf);
      });
    });
    srv.listen(0, '127.0.0.1', () => resolve(srv));
  });
}
(async () => {
  const arg = process.argv[2]; const out = path.resolve(process.argv[3] || 'shots');
  const width = Number(process.argv[4] || 420); const theme = process.argv[5] || 'light';
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 2, colorScheme: theme, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const logs = [];
  page.on('console', m => logs.push(m.type() + ': ' + m.text()));
  page.on('pageerror', e => logs.push('pageerror: ' + e.message));
  let srv = null, url = arg;
  if (!/^https?:\/\//.test(arg)) {
    const fichier = path.resolve(arg); srv = await serve(path.dirname(fichier));
    url = 'http://127.0.0.1:' + srv.address().port + '/' + path.basename(fichier);
  }
  await page.goto(url);
  await page.waitForTimeout(800);
  const figs = await page.$$('figure.v3d, figure.plate');
  let i = 0;
  for (const f of figs) {
    i++;
    await f.scrollIntoViewIfNeeded();
    await page.waitForTimeout((await f.getAttribute('class')).includes('v3d') ? 1800 : 150);
    const name = (await f.getAttribute('data-model')) || ('plate' + i);
    await f.screenshot({ path: path.join(out, String(i).padStart(2, '0') + '-' + name + '.png') });
  }
  const sw = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  logs.push('horizontal-overflow: ' + sw);
  fs.writeFileSync(path.join(out, 'console.txt'), logs.join('\n'));
  console.log(logs.join('\n'));
  await browser.close();
  if (srv) srv.close();
})();
