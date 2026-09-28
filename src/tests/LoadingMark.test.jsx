import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Mark, MarkKnockout, MarkStrokes } from '../components/BrandMark';

afterEach(cleanup);

var JUURI = join(import.meta.dirname, '..', '..');

/**
 * The loading screen opens through the mark: its four strokes are holes
 * in a black field, and the field is scaled up from a point inside one of
 * them until none of it is on screen.
 *
 * Two things hold that together, and both fail silently.
 *
 * MarkStrokes splits MARK_PATH on Z to animate each stroke separately. If
 * the geometry is ever redrawn with a different number of subpaths, the
 * split still succeeds - it just returns a different count, and
 * LoadingScreen.css, which names loading-strk-1 through -4 one by one,
 * animates the wrong set. Nothing throws; the mark simply arrives wrong.
 *
 * And the split must lose nothing. Reassembled, the strokes have to be
 * the mark exactly, or the holes stop matching the shape drawn over them.
 */
describe('loading mark', function () {
  function piirra(el) {
    return render(el).container.querySelector('svg');
  }

  it('splits into exactly the four strokes the CSS animates', function () {
    var svg = piirra(<MarkStrokes />);
    var polut = svg.querySelectorAll('path');
    expect(polut).toHaveLength(4);

    // LoadingScreen.css sets a delay on each of these by name.
    [1, 2, 3, 4].forEach(function (n) {
      expect(svg.querySelector('.loading-strk-' + n)).toBeTruthy();
    });
    svg.querySelectorAll('path').forEach(function (p) {
      expect(p.getAttribute('class')).toContain('loading-strk');
    });
  });

  it('loses nothing in the split', function () {
    var kokonainen = piirra(<Mark decorative />).querySelector('path').getAttribute('d');
    cleanup();
    var osat = Array.from(piirra(<MarkStrokes />).querySelectorAll('path'))
      .map(function (p) { return p.getAttribute('d'); })
      .join('');
    expect(osat).toBe(kokonainen);
  });

  it('shares the mark viewBox so the holes register with the strokes', function () {
    var knock = piirra(<MarkKnockout />);
    cleanup();
    var strokes = piirra(<MarkStrokes />);
    expect(knock.getAttribute('viewBox')).toBe('0 0 588.082 260');
    expect(strokes.getAttribute('viewBox')).toBe('0 0 588.082 260');
  });

  it('cuts the mark out of the field rather than drawing it on top', function () {
    var p = piirra(<MarkKnockout />).querySelector('path');
    // evenodd is what turns the mark into holes; without it the field is
    // a solid rectangle and the opening never opens.
    expect(p.getAttribute('fill-rule')).toBe('evenodd');
    expect(p.getAttribute('d').indexOf('M-20000 -20000')).toBe(0);
    expect(p.getAttribute('fill')).toBe('currentColor');
  });

  it('opens from a point that is inside a stroke, not in the gap', function () {
    // The centre of the mark is solid: the space between the two inner
    // strokes is field, not hole. A transform-origin there would spread
    // black over black and end on a black screen instead of the page.
    var css = readFileSync(join(JUURI, 'src', 'components', 'LoadingScreen.css'), 'utf8');
    var origin = (css.match(/transform-origin:\s*([\d.]+)%\s+([\d.]+)%/) || []);
    var x = parseFloat(origin[1]);
    var y = parseFloat(origin[2]);

    expect(Number.isFinite(x)).toBe(true);
    expect(Number.isFinite(y)).toBe(true);
    // The measured hole sits low and just right of centre. These bounds
    // are wide enough to allow retuning and tight enough to catch a
    // change back to the middle or to an edge.
    expect(x).toBeGreaterThan(50);
    expect(x).toBeLessThan(62);
    expect(y).toBeGreaterThan(88);
  });

  it('travels far enough to clear the tightest viewport measured', function () {
    // 90 was the worst case across eight viewports; see the table in
    // LoadingScreen.css. Anything at or below that leaves black on screen.
    var css = readFileSync(join(JUURI, 'src', 'components', 'LoadingScreen.css'), 'utf8');
    var zoom = parseFloat((css.match(/--loading-zoom:\s*([\d.]+)/) || [])[1]);
    expect(zoom).toBeGreaterThanOrEqual(110);
  });
});
