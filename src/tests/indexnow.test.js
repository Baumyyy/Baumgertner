import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { osoitteetSivustokartasta, lueOsoitteet } from '../../scripts/indexnow.js';

var JUURI = join(import.meta.dirname, '..', '..');
var PUBLIC = join(JUURI, 'public');

/**
 * IndexNow verifies a submission by fetching /<key>.txt and comparing what
 * is inside it to the key that was sent. That means the key lives in two
 * places at once, and the one failure worth guarding against is them
 * drifting apart: rotate the key in scripts/indexnow.js, forget the file,
 * and every submission from then on is rejected with a 403 that nobody
 * sees because nobody watches a post-deploy ping.
 */
describe('IndexNow', function () {
  var skripti = readFileSync(join(JUURI, 'scripts', 'indexnow.js'), 'utf8');
  var avain = (skripti.match(/const AVAIN = '([^']+)'/) || [])[1];

  it('declares a key of the shape the protocol accepts', function () {
    // 8-128 characters, hexadecimal or dashes, per the IndexNow spec.
    expect(avain).toBeTruthy();
    expect(avain).toMatch(/^[a-zA-Z0-9-]{8,128}$/);
  });

  it('ships a key file named after the key, containing the key', function () {
    var tiedostot = readdirSync(PUBLIC).filter(function (n) {
      return /^[a-zA-Z0-9-]{8,128}\.txt$/.test(n);
    });
    expect(tiedostot).toContain(avain + '.txt');

    var sisalto = readFileSync(join(PUBLIC, avain + '.txt'), 'utf8').trim();
    expect(sisalto).toBe(avain);
  });

  it('reads every address out of the sitemap', function () {
    var osoitteet = lueOsoitteet();
    expect(osoitteet.length).toBeGreaterThanOrEqual(6);
    expect(osoitteet).toContain('https://baumgertner.fi/en');
    expect(osoitteet).toContain('https://baumgertner.fi/fi');
  });

  it('submits only addresses on the site\'s own host', function () {
    // The endpoint rejects the whole batch if one address is off-host, so
    // a stray absolute URL in the sitemap would take the rest down with it.
    lueOsoitteet().forEach(function (o) {
      expect(o.indexOf('https://baumgertner.fi/')).toBe(0);
    });
  });

  it('parses <loc> regardless of surrounding whitespace', function () {
    var xml = '<urlset><url><loc>https://a.fi/x</loc></url>'
      + '<url>\n  <loc>\n    https://a.fi/y\n  </loc>\n</url></urlset>';
    expect(osoitteetSivustokartasta(xml)).toEqual(['https://a.fi/x', 'https://a.fi/y']);
  });
});
