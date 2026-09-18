/**
 * Writes a real HTML file for every public route, so that a crawler which
 * does not run JavaScript still sees the page.
 *
 * Why this exists: the built index.html contains `<div id="root"></div>`
 * and nothing else. Google executes JavaScript and gets there eventually,
 * but the crawlers behind generative answers - GPTBot, ClaudeBot,
 * PerplexityBot - do not. To them the site was a blank page.
 *
 * How it works: serve dist/, open each route in Chromium, let the app
 * render, then write the resulting HTML back into dist/<route>/index.html.
 * nginx serves it because `try_files $uri $uri/ /index.html` prefers a
 * real file over the SPA fallback (nginx.conf).
 *
 * Nothing in src/ had to change for this. The app renders all of its text
 * on the first pass - `ready` only toggles a CSS class - so the snapshot
 * is the same markup React produces, and on the client createRoot takes
 * over as it always has.
 */
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { rakennaSkeema, skeemaTagiksi } from './schema.js';
import { rakennaLlmsTxt } from './llms.js';

const JUURI = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(JUURI, 'dist');
const KOTISIVU = 'https://baumgertner.fi';

/**
 * The admin panel is deliberately absent: robots.txt disallows it and it
 * is behind a login, so a static copy of its shell would be noise at
 * best. "/" is absent too - it is a redirect that picks a language from
 * the browser, and baking one of the two into a file would send every
 * visitor to the same one.
 */
const REITIT = [
  { polku: '/en', kieli: 'en', vastine: '/fi' },
  { polku: '/fi', kieli: 'fi', vastine: '/en' },
  { polku: '/en/privacy', kieli: 'en', vastine: '/fi/privacy' },
  { polku: '/fi/privacy', kieli: 'fi', vastine: '/en/privacy' },
  { polku: '/en/terms', kieli: 'en', vastine: '/fi/terms' },
  { polku: '/fi/terms', kieli: 'fi', vastine: '/en/terms' },
  // The bare paths predate the language segments and are kept so older
  // links resolve. They point their canonical at the English version so
  // the two do not compete as duplicates.
  { polku: '/privacy', kieli: 'en', kanoninen: '/en/privacy' },
  { polku: '/terms', kieli: 'en', kanoninen: '/en/terms' },

  // Not a route anyone links to - it is what nginx returns, with a real
  // 404 status, for any address that does not exist. Without it every
  // wrong URL answered 200 with the front page, which is what Google
  // calls a soft 404 and reports as an error.
  //
  // The page prints the address that was asked for, read from
  // window.location, so the static copy says '/404' until React mounts
  // and replaces it with the address actually requested.
  { polku: '/404', kieli: 'en', tiedosto: '404.html', vahintaan: 60 }
];

const TYYPIT = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8'
};

function palvele(portti) {
  const palvelin = createServer(async function (pyynto, vastaus) {
    const polku = decodeURIComponent(new URL(pyynto.url, 'http://localhost').pathname);
    let tiedosto = join(DIST, polku);

    // Unknown path means a client route, so hand back the shell the way
    // nginx would. Reading it fresh each time matters: this script also
    // writes into dist while it runs, and a cached shell would let one
    // route's output leak into the next.
    if (!existsSync(tiedosto) || !extname(tiedosto)) tiedosto = join(DIST, 'index.html');

    try {
      const sisalto = await readFile(tiedosto);
      vastaus.writeHead(200, { 'Content-Type': TYYPIT[extname(tiedosto)] || 'application/octet-stream' });
      vastaus.end(sisalto);
    } catch {
      vastaus.writeHead(404).end('not found');
    }
  });

  return new Promise(function (valmis) {
    palvelin.listen(portti, '127.0.0.1', function () { valmis(palvelin); });
  });
}

/**
 * Rewrites the head tags that are per-page but sit in a single static
 * index.html, so every route no longer claims to be the front page.
 * The title and description are already correct in the captured HTML -
 * usePageMeta sets them from the component - these are the ones nothing
 * updates at runtime.
 */
/** These go into a double-quoted attribute, so a quote in a title would end it. */
function htmlTurva(teksti) {
  return String(teksti || '')
    .split('&').join('&amp;')
    .split('"').join('&quot;')
    .split('<').join('&lt;')
    .split('>').join('&gt;');
}

function korjaaOsoitteet(html, reitti, alkupera, meta) {
  const kanoninen = KOTISIVU + (reitti.kanoninen || reitti.polku);

  let ulos = html
    // Vite injects a modulepreload link for every lazy chunk it pulls in,
    // and it writes them as absolute URLs against whatever origin the page
    // was opened on - here, this script's throwaway server. Left in, every
    // page would ship fourteen preloads pointing at a port that does not
    // exist in production. Back to root-relative, which is what the build
    // emits for the chunks it knows about at build time.
    .split(alkupera).join('')
    .replace(/<link rel="canonical"[^>]*>/, '<link rel="canonical" href="' + kanoninen + '"/>')
    .replace(/<meta property="og:url"[^>]*>/, '<meta property="og:url" content="' + kanoninen + '"/>')
    // og:title and og:description are static in index.html and describe
    // the front page, so a legal page pasted into a chat previewed as the
    // portfolio. The rendered page already knows its own.
    .replace(/<meta property="og:title"[^>]*>/, '<meta property="og:title" content="' + htmlTurva(meta.title) + '"/>')
    .replace(/<meta property="og:description"[^>]*>/, '<meta property="og:description" content="' + htmlTurva(meta.kuvaus) + '"/>')
    .replace(/<meta name="twitter:title"[^>]*>/, '<meta name="twitter:title" content="' + htmlTurva(meta.title) + '"/>')
    .replace(/<meta name="twitter:description"[^>]*>/, '<meta name="twitter:description" content="' + htmlTurva(meta.kuvaus) + '"/>')
    .replace(/<html lang="[^"]*"/, '<html lang="' + reitti.kieli + '"')
    // index.html carries one hardcoded set pointing at the two home
    // pages. Correct there, wrong everywhere else - on a legal page it
    // claimed the Finnish alternate was the front page - and doubled up
    // with the route's own set. Cleared here and rebuilt per route.
    .replace(/<link rel="alternate" hreflang="[^"]*"[^>]*>\s*/g, '');

  // index.html carries a single static Person block, which is the right
  // baseline for a route nothing prerenders. Here it is replaced by the
  // route's own graph: the page, the site, and on the two home pages the
  // six services with the area they are offered in.
  ulos = ulos.replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    skeemaTagiksi(rakennaSkeema(reitti, meta))
  );

  if (reitti.vastine) {
    const vastineKieli = reitti.kieli === 'en' ? 'fi' : 'en';
    const tagit =
      '<link rel="alternate" hreflang="' + reitti.kieli + '" href="' + KOTISIVU + reitti.polku + '"/>' +
      '<link rel="alternate" hreflang="' + vastineKieli + '" href="' + KOTISIVU + reitti.vastine + '"/>' +
      '<link rel="alternate" hreflang="x-default" href="' + KOTISIVU + (reitti.kieli === 'en' ? reitti.polku : reitti.vastine) + '"/>';
    ulos = ulos.replace('</head>', tagit + '</head>');
  }

  return ulos;
}

async function aja() {
  if (!existsSync(join(DIST, 'index.html'))) {
    console.error('dist/index.html puuttuu - aja "npm run build" ensin.');
    process.exit(1);
  }

  const portti = 4183;
  const alkupera = 'http://127.0.0.1:' + portti;
  const palvelin = await palvele(portti);
  const selain = await chromium.launch();
  const konteksti = await selain.newContext({ viewport: { width: 1440, height: 900 } });

  // There is no backend here, and the page fires a view-count request on
  // mount. Left alone it would sit waiting for a connection that never
  // comes; the app already ignores the failure.
  await konteksti.route('**/api/**', function (reitti) { reitti.abort(); });

  // This opens every page in a real browser, so the analytics beacon would
  // happily count all eight of them - a wave of phantom visits on every
  // deploy, from a machine that is not a visitor. The tag still ends up in
  // the written HTML; it just does not get to fire while we are the ones
  // loading the page.
  await konteksti.route('**/static.cloudflareinsights.com/**', function (reitti) { reitti.abort(); });
  await konteksti.route('**/cloudflareinsights.com/**', function (reitti) { reitti.abort(); });

  let kirjoitettu = 0;

  for (const reitti of REITIT) {
    const sivu = await konteksti.newPage();
    const virheet = [];
    sivu.on('pageerror', function (e) { virheet.push(e.message); });

    await sivu.goto(alkupera + reitti.polku, { waitUntil: 'load' });

    // The footer is the last thing on every one of these routes, so its
    // presence means the route's own component resolved - these are lazy
    // chunks, and waiting on 'load' alone would catch some of them empty.
    await sivu.waitForSelector('footer, .privacy-page, .nf', { timeout: 15000 });
    // Guards against capturing a route whose lazy chunk has not resolved,
    // which 'load' alone does not catch. The bar is per route because the
    // 404 page is deliberately short - a headline and two rows - and would
    // never clear a threshold set for a page of prose.
    const vahintaan = reitti.vahintaan || 200;
    await sivu.waitForFunction(function (raja) {
      const juuri = document.getElementById('root');
      return juuri && juuri.innerText.trim().length > raja;
    }, vahintaan, { timeout: 15000 });
    await sivu.waitForTimeout(400);

    const html = await sivu.evaluate(function () { return document.documentElement.outerHTML; });
    const merkkeja = await sivu.evaluate(function () { return document.getElementById('root').innerText.trim().length; });
    const meta = await sivu.evaluate(function () {
      const kuvaus = document.querySelector('meta[name="description"]');
      return { title: document.title, kuvaus: kuvaus ? kuvaus.content : '' };
    });

    if (virheet.length) {
      console.error('  ' + reitti.polku + ' heitti virheen: ' + virheet[0]);
      await selain.close();
      palvelin.close();
      process.exit(1);
    }

    const valmis = korjaaOsoitteet(html, reitti, alkupera, meta);

    // The capture server's origin has no business in a shipped file, and
    // the one time it leaked it cost fourteen dead requests per page load
    // without breaking anything visibly. Cheap to assert, easy to miss.
    if (valmis.indexOf('127.0.0.1') >= 0) {
      console.error('  ' + reitti.polku + ': capture-osoite jai HTML:aan');
      await selain.close();
      palvelin.close();
      process.exit(1);
    }

    const kohde = reitti.tiedosto
      ? join(DIST, reitti.tiedosto)
      : join(DIST, reitti.polku, 'index.html');
    await mkdir(dirname(kohde), { recursive: true });
    await writeFile(kohde, '<!doctype html>' + valmis);

    console.log('  ' + reitti.polku.padEnd(14) + merkkeja + ' merkkia tekstia');
    kirjoitettu++;
    await sivu.close();
  }

  await selain.close();
  palvelin.close();

  // Written here rather than dropped in public/ so the services in it come
  // from src/lang at build time, like the JSON-LD does.
  const llms = rakennaLlmsTxt();
  await writeFile(join(DIST, 'llms.txt'), llms);
  console.log('  llms.txt      ' + llms.length + ' merkkia');

  console.log('prerender valmis: ' + kirjoitettu + '/' + REITIT.length + ' reittia');
}

aja().catch(function (virhe) {
  console.error(virhe);
  process.exit(1);
});
