import { describe, it, expect } from 'vitest';
import { rakennaSitemap, viimeksiMuutettu, SITEMAP_REITIT } from '../../scripts/sitemap.js';

var XML = rakennaSitemap();
var LOCIT = [...XML.matchAll(/<loc>([^<]+)<\/loc>/g)].map(function (m) { return m[1]; });

/**
 * The sitemap used to be a file in public/ that somebody had to edit by
 * hand, and its <lastmod> sat four weeks behind the site. That field is
 * the only one in a sitemap with a job - it is how a crawler decides
 * whether a page is worth fetching again - and a date frozen in the past
 * tells Google the opposite of what is true. Nothing warns you: the XML
 * stays valid, Search Console keeps reporting Success, and recrawls just
 * quietly slow down.
 *
 * It is generated now, so these assertions are what stops it from
 * silently going wrong a second way.
 */
describe('sitemap', function () {
  it('is well-formed and lists every route once', function () {
    expect(XML.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(XML.trimEnd().endsWith('</urlset>')).toBe(true);
    expect(LOCIT.length).toBe(SITEMAP_REITIT.length);
    expect(new Set(LOCIT).size).toBe(LOCIT.length);
  });

  // The whole reason Search Console reported "page with redirect": a
  // sitemap entry is a request to crawl that exact address, and "/" is a
  // 301 to the x-default language (nginx.conf, location = /). Listing it
  // asks a crawler to fetch a page only to be sent somewhere else.
  it('never lists an address that redirects', function () {
    expect(LOCIT).not.toContain('https://baumgertner.fi/');
    expect(LOCIT).not.toContain('https://baumgertner.fi');
    LOCIT.forEach(function (u) {
      expect(u.startsWith('https://baumgertner.fi/'), u).toBe(true);
      expect(u.endsWith('/'), u + ' ends in a slash, which redirects').toBe(false);
    });
  });

  it('gives every address all three hreflang alternates', function () {
    var lohkot = XML.split('<url>').slice(1);
    expect(lohkot.length).toBe(SITEMAP_REITIT.length);
    lohkot.forEach(function (lohko) {
      ['en', 'fi', 'x-default'].forEach(function (k) {
        expect(lohko).toContain('hreflang="' + k + '"');
      });
    });
  });

  it('dates every address, and never in the future', function () {
    var paivat = [...XML.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map(function (m) { return m[1]; });
    expect(paivat.length).toBe(SITEMAP_REITIT.length);
    var tanaan = new Date().toISOString().slice(0, 10);
    paivat.forEach(function (p) {
      expect(p).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(p <= tanaan, p + ' is in the future').toBe(true);
    });
  });

  it('takes the newest date when a route is built from several sources', function () {
    var vastaukset = { a: '2026-01-01\n', b: '2026-07-04\n', c: '2026-03-02\n' };
    var paiva = viimeksiMuutettu(['a', 'b', 'c'], function (args) {
      return vastaukset[args[args.length - 1]];
    });
    expect(paiva).toBe('2026-07-04');
  });

  // .git is in .dockerignore, so inside the frontend image git cannot
  // answer at all. The fallback reads file timestamps; if both are
  // unavailable the field is dropped rather than invented, because an
  // absent <lastmod> says "I don't know" and a wrong one says something
  // false.
  it('falls back rather than inventing a date when git is silent', function () {
    var paiva = viimeksiMuutettu(['ei/ole/olemassa'], function () { return null; });
    expect(paiva).toBe(null);
  });

  it('still dates a real path when git is silent', function () {
    var paiva = viimeksiMuutettu(['src/lang/fi.js'], function () { return null; });
    expect(paiva).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
