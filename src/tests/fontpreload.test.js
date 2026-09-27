import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

var JUURI = join(import.meta.dirname, '..', '..');

/**
 * The preload in vite.config.js matches the built font by filename. That
 * match is the whole mechanism, and it fails silently: rename the file
 * upstream and the plugin finds nothing, injects nothing, and the build
 * still succeeds. The headline just goes back to waiting for the
 * stylesheet before the font is even requested.
 *
 * Dependabot updates @fontsource on its own schedule, so this is a
 * question of when rather than whether. These tests read the package as
 * installed, which is what a dependency bump changes.
 */
describe('display font preload', function () {
  var konfiguraatio = readFileSync(join(JUURI, 'vite.config.js'), 'utf8');
  var fontit = join(JUURI, 'node_modules', '@fontsource', 'orbitron', 'files');

  it('still ships the file the plugin looks for', function () {
    expect(existsSync(fontit)).toBe(true);
    var nimet = readdirSync(fontit);
    expect(nimet).toContain('orbitron-latin-700-normal.woff2');
  });

  it('matches that filename with the hash Vite adds', function () {
    // Vite rewrites files/orbitron-latin-700-normal.woff2 to
    // assets/orbitron-latin-700-normal-<hash>.woff2, so the pattern has to
    // tolerate the hash while still telling the two weights apart.
    expect(konfiguraatio).toContain('orbitron-latin-700-normal');

    var kaava = /orbitron-latin-700-normal-[^/]*\.woff2$/;
    expect(kaava.test('assets/orbitron-latin-700-normal-4jsRXGGJ.woff2')).toBe(true);
    expect(kaava.test('assets/orbitron-latin-400-normal-U6xZUhur.woff2')).toBe(false);
    expect(kaava.test('assets/orbitron-latin-700-normal-4jsRXGGJ.woff')).toBe(false);
  });

  it('preloads the weight the headline actually uses', function () {
    // If --weight-display moves off 700 the preload is fetching a font
    // nothing on the critical path renders in - wasted bandwidth on the
    // exact connection this was meant to help.
    var tokenit = readFileSync(join(JUURI, 'src', 'styles', 'tokens.css'), 'utf8');
    var paino = (tokenit.match(/--weight-display:\s*(\d+)/) || [])[1];
    expect(paino).toBe('700');
  });

  it('declares the attributes a font preload needs', function () {
    // Without crossorigin the browser fetches the font twice: once for the
    // preload and once for the real request, because font requests are
    // always CORS and a non-CORS preload cannot satisfy one.
    expect(konfiguraatio).toContain("rel: 'preload'");
    expect(konfiguraatio).toContain("as: 'font'");
    expect(konfiguraatio).toContain("type: 'font/woff2'");
    expect(konfiguraatio).toContain('crossorigin');
  });
});
