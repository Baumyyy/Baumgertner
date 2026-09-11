import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { Wordmark, Mark } from '../components/BrandMark';
import { readFileSync } from 'node:fs';

afterEach(cleanup);

// The marks are inlined rather than loaded as files so they can inherit
// colour from the token system. That only works if nothing hardcodes a
// fill, and it is only the real identity if the geometry still matches
// the vector masters in brand/svg - so both are asserted here.
function pathFromMaster(file) {
  var svg = readFileSync(new URL('../../brand/svg/' + file, import.meta.url), 'utf8');
  return svg.match(/ d="([^"]+)"/)[1];
}

describe('brand marks', function() {
  it('render as inline svg', function() {
    expect(render(<Wordmark />).container.querySelector('svg')).not.toBeNull();
    cleanup();
    expect(render(<Mark />).container.querySelector('svg')).not.toBeNull();
  });

  it('take their colour from CSS rather than a hardcoded fill', function() {
    var w = render(<Wordmark />).container.querySelector('path');
    expect(w.getAttribute('fill')).toBe('currentColor');
    cleanup();
    var m = render(<Mark />).container.querySelector('path');
    expect(m.getAttribute('fill')).toBe('currentColor');
  });

  it('are labelled for assistive technology', function() {
    var svg = render(<Wordmark />).container.querySelector('svg');
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBe('Baumgertner');
  });

  it('accept a className so layout stays in CSS', function() {
    var svg = render(<Mark className="nav-mark" />).container.querySelector('svg');
    expect(svg.getAttribute('class')).toBe('nav-mark');
  });

  it('match the vector masters in brand/svg exactly', function() {
    var w = render(<Wordmark />).container.querySelector('path');
    expect(w.getAttribute('d')).toBe(pathFromMaster('baumgertner-musta.svg'));
    cleanup();
    var m = render(<Mark />).container.querySelector('path');
    expect(m.getAttribute('d')).toBe(pathFromMaster('b-merkki-musta.svg'));
  });

  it('can be hidden from assistive technology when the name is already text', function() {
    var svg = render(<Wordmark decorative />).container.querySelector('svg');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.getAttribute('role')).toBeNull();
    expect(svg.getAttribute('aria-label')).toBeNull();
  });

  it('keep the viewBox of the masters so proportions are preserved', function() {
    var w = render(<Wordmark />).container.querySelector('svg');
    expect(w.getAttribute('viewBox')).toBe('0 0 1927.24 100');
    cleanup();
    var m = render(<Mark />).container.querySelector('svg');
    expect(m.getAttribute('viewBox')).toBe('0 0 104 100');
  });
});
