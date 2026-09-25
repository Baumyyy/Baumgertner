import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * The work carousel centres its active slide with a transform derived from
 * the slide width. Three things depend on one number:
 *
 *   .wk-stage  --slide-w: <w>
 *   .wk-track  translateX(calc((100% - <w>) / 2 - var(--i) * <w>))
 *   .wk-slide  flex: 0 0 <w>
 *
 * Set the width anywhere else and the transform keeps using the old figure.
 * That has now happened twice. First the slide moved from 76% to 58% for
 * the device mock-ups while the transform kept 76%, so a single shot sat
 * 9% left of centre. Then --slide-w was introduced to make that impossible
 * - and the mobile breakpoint still overrode `flex` directly at 88%, which
 * put the shot 15% off and drifted another 30% with every step.
 *
 * Both were invisible until someone opened the page and looked. These
 * assertions are cheaper than looking.
 */

var CSS = readFileSync(join(import.meta.dirname, '..', 'components', 'Projects.css'), 'utf8');

/** Declaration blocks for a selector, comments stripped. */
function lohkot(valitsin) {
  var puhdas = CSS.replace(/\/\*[\s\S]*?\*\//g, '');
  var re = new RegExp('(^|[,{}\\s])' + valitsin.replace('.', '\\.') + '\\s*(,[^{]*)?\\{([^}]*)\\}', 'g');
  var ulos = [];
  var m;
  while ((m = re.exec(puhdas)) !== null) ulos.push(m[3]);
  return ulos;
}

describe('work carousel slide width', function () {
  it('finds the rules at all', function () {
    // Guards the regex: if it stops matching, everything below passes on
    // empty lists and the file quietly stops testing anything.
    expect(lohkot('.wk-slide').length).toBeGreaterThan(0);
    expect(CSS).toContain('--slide-w');
  });

  it('declares the width only as --slide-w', function () {
    var suorat = lohkot('.wk-slide').filter(function (b) {
      // A flex basis that is a literal length rather than the variable.
      return /flex\s*:\s*[^;]*\d\s*(%|px|rem|em|vw)/.test(b);
    });
    expect(suorat).toEqual([]);
  });

  it('sizes the slide from the variable', function () {
    var kaikki = lohkot('.wk-slide').join('\n');
    expect(kaikki).toMatch(/flex\s*:\s*0\s+0\s+var\(--slide-w\)/);
  });

  it('derives the track transform from the same variable', function () {
    var rata = lohkot('.wk-track').join('\n');
    expect(rata).toContain('var(--slide-w)');
    // Two uses: the centring offset and the per-slide step. One alone
    // means half of it is still a literal.
    expect(rata.match(/var\(--slide-w\)/g)).toHaveLength(2);
    // The old shape, with the numbers written out.
    expect(rata).not.toMatch(/translateX\(calc\(\s*\d/);
  });

  it('overrides the width per breakpoint through the variable', function () {
    // Every --slide-w declaration should be on .wk-stage, which is what
    // the track reads it from.
    var lavat = lohkot('.wk-stage').join('\n');
    var kaikkiMaaritykset = (CSS.replace(/\/\*[\s\S]*?\*\//g, '').match(/--slide-w\s*:/g) || []).length;
    var lavalla = (lavat.match(/--slide-w\s*:/g) || []).length;
    expect(lavalla).toBe(kaikkiMaaritykset);
    expect(kaikkiMaaritykset).toBeGreaterThanOrEqual(2);
  });
});
