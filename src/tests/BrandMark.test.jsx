import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { Wordmark, Mark, Lockup } from '../components/BrandMark';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

afterEach(cleanup);

// The marks are inlined rather than loaded as files so they can inherit
// colour from the token system. That only works if nothing hardcodes a
// fill, and it is only the real identity if the geometry still matches the
// vector masters - so both are asserted here.
//
// The masters live under brand/, which is gitignored: they are source
// material, not something the site serves. That means they are on the
// designer's machine and not in a CI checkout, so the geometry comparison
// runs where the files exist and is skipped where they do not. Everything
// else in this file runs everywhere.
//
// Skipping rather than failing is the right trade here. A CI box has no
// way to verify geometry it cannot see, and a red build that only means
// "this machine has no brand folder" teaches people to ignore red builds.
var MASTERIT = '../../brand/Baumgertner-logo-v2/01-logo/';

function masterPolku(tiedosto) {
  return fileURLToPath(new URL(MASTERIT + tiedosto, import.meta.url));
}

function onMasterit() {
  return existsSync(masterPolku('04-sanamerkki/baumgertner-sanamerkki-valkoinen.svg'));
}

function pathFromMaster(tiedosto) {
  var svg = readFileSync(masterPolku(tiedosto), 'utf8');
  return svg.match(/ d="([^"]+)"/)[1];
}

describe('brand marks', function() {
  it('render as inline svg', function() {
    expect(render(<Wordmark />).container.querySelector('svg')).not.toBeNull();
    cleanup();
    expect(render(<Mark />).container.querySelector('svg')).not.toBeNull();
    cleanup();
    expect(render(<Lockup />).container.querySelector('svg')).not.toBeNull();
  });

  it('take their colour from CSS rather than a hardcoded fill', function() {
    var w = render(<Wordmark />).container.querySelector('path');
    expect(w.getAttribute('fill')).toBe('currentColor');
    cleanup();
    var m = render(<Mark />).container.querySelector('path');
    expect(m.getAttribute('fill')).toBe('currentColor');
  });

  // The one exception, and it is deliberate: the signal is red by
  // definition, so that half cannot follow the background. It is pinned to
  // the token rather than to a literal, so it still moves with the theme.
  it('paints the lockup signal from the token and the wordmark from CSS', function() {
    var polut = render(<Lockup />).container.querySelectorAll('path');
    expect(polut).toHaveLength(2);
    expect(polut[0].getAttribute('fill')).toBe('var(--signal)');
    expect(polut[1].getAttribute('fill')).toBe('currentColor');
  });

  it('never hardcode a hex colour', function() {
    var kaikki = [<Wordmark key="w" />, <Mark key="m" />, <Lockup key="l" />];
    kaikki.forEach(function(el) {
      var html = render(el).container.innerHTML;
      expect(html).not.toMatch(/fill="#/);
      cleanup();
    });
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
    expect(m.getAttribute('viewBox')).toBe('0 0 588.082 260');
    cleanup();
    var l = render(<Lockup />).container.querySelector('svg');
    expect(l.getAttribute('viewBox')).toBe('0 0 2333.36 135');
  });

  // The lockup ships the same wordmark as the standalone one. If these
  // ever diverge the site is showing two different logos and nobody would
  // spot it from a screenshot.
  it('draws the same wordmark in the lockup as on its own', function() {
    var yksin = render(<Wordmark />).container.querySelector('path').getAttribute('d');
    cleanup();
    var lukossa = render(<Lockup />).container.querySelectorAll('path')[1].getAttribute('d');
    expect(lukossa).toBe(yksin);
  });

  describe.skipIf(!onMasterit())('geometry against the vector masters', function() {
    it('wordmark matches its master', function() {
      var w = render(<Wordmark />).container.querySelector('path');
      expect(w.getAttribute('d')).toBe(pathFromMaster('04-sanamerkki/baumgertner-sanamerkki-valkoinen.svg'));
    });

    it('mark matches its master', function() {
      var m = render(<Mark />).container.querySelector('path');
      expect(m.getAttribute('d')).toBe(pathFromMaster('03-merkki/baumgertner-merkki-kompakti-valkoinen.svg'));
    });

    it('lockup signal matches its master', function() {
      var svg = readFileSync(masterPolku('01-vaaka/baumgertner-vaaka-signaali.svg'), 'utf8');
      var signaali = svg.match(/fill="#E5242A" d="([^"]+)"/)[1];
      var piirretty = render(<Lockup />).container.querySelectorAll('path')[0];
      expect(piirretty.getAttribute('d')).toBe(signaali);
    });
  });
});
