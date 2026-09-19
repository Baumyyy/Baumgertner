import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * `npm run build` ends with scripts/prerender.js, which runs inside the
 * Docker build stage. Anything it imports has to reach the build context,
 * and .dockerignore decides that.
 *
 * This has already failed once: .dockerignore excluded scripts/ and
 * re-admitted prerender.js by name, then prerender.js grew imports of
 * schema.js and llms.js. Locally everything passed - the files are right
 * there on disk - while the production image failed to build on a module
 * it could not resolve. Nothing in the test suite noticed, because nothing
 * was looking at the two files together.
 */

var JUURI = join(import.meta.dirname, '..', '..');

function lue(suhteellinen) {
  return readFileSync(join(JUURI, suhteellinen), 'utf8');
}

/** The .dockerignore patterns, comments and blank lines dropped. */
function saannot() {
  return lue('.dockerignore')
    .split('\n')
    .map(function (rivi) { return rivi.trim(); })
    .filter(function (rivi) { return rivi && rivi.indexOf('#') !== 0; });
}

/**
 * Does `polku` survive .dockerignore? Later rules win, and a leading "!"
 * re-admits. Covers the plain and `*` forms this file uses; it is not a
 * full implementation of Docker's matcher and does not need to be.
 */
function paatyyKontekstiin(polku) {
  var mukana = true;

  saannot().forEach(function (saanto) {
    var kielteinen = saanto.indexOf('!') === 0;
    var kuvio = kielteinen ? saanto.slice(1) : saanto;

    var re = new RegExp(
      '^' + kuvio
        .split('.').join('\\.')
        .split('*').join('[^/]*')
      + '($|/)'
    );

    if (re.test(polku)) mukana = !kielteinen ? false : true;
  });

  return mukana;
}

describe('the Docker build context carries what the build needs', function () {
  var prerender = lue('scripts/prerender.js');

  // Every `from './x.js'` in prerender.js, as a repo-relative path.
  var paikalliset = (prerender.match(/from '\.\/[^']+'/g) || []).map(function (osuma) {
    return 'scripts/' + osuma.replace(/^from '\.\//, '').replace(/'$/, '');
  });

  it('finds the imports at all', function () {
    // Guards the regex above: if it stops matching, every case below
    // passes on an empty list and the test quietly stops testing.
    expect(paikalliset.length).toBeGreaterThan(0);
  });

  paikalliset.forEach(function (polku) {
    it(polku + ' exists and is not excluded by .dockerignore', function () {
      expect(existsSync(join(JUURI, polku))).toBe(true);
      expect(paatyyKontekstiin(polku)).toBe(true);
    });
  });

  it('still keeps the server-side shell scripts out', function () {
    // They run from cron on the VPS and have no place in a frontend image.
    expect(paatyyKontekstiin('scripts/backup.sh')).toBe(false);
    expect(paatyyKontekstiin('scripts/disk-alert.sh')).toBe(false);
  });

  it('keeps node_modules and secrets out', function () {
    expect(paatyyKontekstiin('node_modules')).toBe(false);
    expect(paatyyKontekstiin('.env')).toBe(false);
    expect(paatyyKontekstiin('backend')).toBe(false);
  });
});
