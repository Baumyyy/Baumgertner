import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * nginx no longer falls back to index.html for unknown addresses - it
 * returns a real 404, which is what stops Google seeing a soft 404 on every
 * mistyped URL. The trade is that a client-side route only works if
 * something actually serves it: either scripts/prerender.js wrote a file
 * for it, or nginx.conf names it explicitly.
 *
 * Add a route to src/App.jsx and forget both, and it 404s in production
 * while working perfectly in `npm run dev`. That is the gap this closes.
 */

var JUURI = join(import.meta.dirname, '..', '..');

function lue(suhteellinen) {
  return readFileSync(join(JUURI, suhteellinen), 'utf8');
}

/** Every path= on a <Route> in App.jsx. */
function reititSovelluksesta() {
  var app = lue('src/App.jsx');
  var ulos = [];
  var osuma;
  var re = /<Route\s+path="([^"]+)"/g;
  while ((osuma = re.exec(app)) !== null) ulos.push(osuma[1]);
  return ulos;
}

/** Every polku: '...' in the prerender route table. */
function prerenderoidyt() {
  var skripti = lue('scripts/prerender.js');
  var ulos = [];
  var osuma;
  var re = /\{\s*polku:\s*'([^']+)'/g;
  while ((osuma = re.exec(skripti)) !== null) ulos.push(osuma[1]);
  return ulos;
}

describe('every client route is actually served', function () {
  var reitit = reititSovelluksesta();
  var esirenderoidyt = prerenderoidyt();
  var nginx = lue('nginx.conf');

  it('finds the route table at all', function () {
    // If the regexes above stop matching, every assertion below passes
    // vacuously and the guard quietly stops guarding.
    expect(reitit.length).toBeGreaterThan(5);
    expect(esirenderoidyt.length).toBeGreaterThan(5);
  });

  reititSovelluksesta().forEach(function (reitti) {
    // '*' is the catch-all that renders NotFound, and '/' is the language
    // redirect - the directory index covers it.
    if (reitti === '*' || reitti === '/') return;

    it(reitti + ' is prerendered or named in nginx.conf', function () {
      var onEsirenderoity = esirenderoidyt.indexOf(reitti) >= 0;

      // Only location lines count. Searching the whole file would let a
      // route like /en pass on the "en" inside server_name or Content-Type,
      // which is a guard that reports success for the wrong reason.
      var onNginxissa = nginx.split('\n')
        .filter(function (rivi) { return rivi.trim().indexOf('location') === 0; })
        .some(function (rivi) { return rivi.indexOf(reitti) >= 0; });

      expect(onEsirenderoity || onNginxissa).toBe(true);
    });
  });

  it('serves a 404 page rather than falling back to the front page', function () {
    expect(esirenderoidyt).toContain('/404');
    expect(nginx).toContain('error_page 404 /404.html');

    // Comments stripped first: the config explains what it replaced by
    // quoting the old directive, and matching that text would fail on the
    // documentation rather than on the configuration.
    var direktiivit = nginx.split('\n')
      .filter(function (rivi) { return rivi.trim().indexOf('#') !== 0; })
      .join('\n');
    expect(direktiivit).not.toContain('try_files $uri $uri/ /index.html');
  });

  it('allows the analytics beacon through the content security policy', function () {
    // Both hosts, or Cloudflare Web Analytics is blocked in the browser and
    // reports nothing, without an error anywhere.
    expect(nginx).toContain('https://static.cloudflareinsights.com');
    expect(nginx).toContain('https://cloudflareinsights.com');
  });
});
