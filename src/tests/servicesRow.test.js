import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

var JUURI = join(import.meta.dirname, '..', 'components');
var CSS = readFileSync(join(JUURI, 'Services.css'), 'utf8');
var JSX = readFileSync(join(JUURI, 'Services.jsx'), 'utf8');

/** CSS with comments stripped, so a figure quoted in prose is not read. */
var PUHDAS = CSS.replace(/\/\*[\s\S]*?\*\//g, '');

/**
 * On a phone the service cards are a snap row, and they arrive by
 * transform. A scroll snap area is the target's *transformed* border box,
 * not its laid-out one - so while that transform animates, a container
 * set to `mandatory` keeps re-snapping to a position that has not stopped
 * moving, and drags the row along behind it. It looked like the cards
 * swaying as they loaded; measured, the row slid exactly the 46px the
 * entrance translates by.
 *
 * The fix is a handover: the row starts with no snapping and .is-ready
 * turns it on once the cards have landed, SV_CARD_IN_MS later. That makes
 * one number in the JSX depend on two in the CSS, and nothing about the
 * page complains if they drift - the row just starts swaying again.
 */
describe('services swipe row', () => {
  it('does not snap until the entrance has finished', () => {
    expect(PUHDAS).toMatch(/\.sv-bento\s*\{[^}]*scroll-snap-type:\s*none/);
    expect(PUHDAS).toMatch(/\.sv-bento\.is-ready\s*\{\s*scroll-snap-type:\s*x\s+mandatory/);
  });

  // is-zoom has to come after is-ready: the two selectors carry the same
  // specificity, so source order is the only thing deciding which wins,
  // and while the reader is pinched in the answer has to be "no snapping".
  it('lets the zoom override beat the ready state', () => {
    var valmis = PUHDAS.indexOf('.sv-bento.is-ready');
    var zoom = PUHDAS.indexOf('.sv-bento.is-zoom');
    expect(valmis).toBeGreaterThan(-1);
    expect(zoom).toBeGreaterThan(valmis);
  });

  it('waits at least as long as the cards take to arrive', () => {
    // .sv-tile's entrance: a transition of N seconds plus the longest
    // stagger, which is two steps because --i is set as n % 3.
    var siirtyma = PUHDAS.match(/transition:\s*opacity\s+([\d.]+)s[^;]*?calc\(var\(--i,\s*0\)\s*\*\s*(\d+)ms\)/);
    expect(siirtyma, 'card entrance transition not found in Services.css').toBeTruthy();

    var kesto = parseFloat(siirtyma[1]) * 1000 + parseInt(siirtyma[2], 10) * 2;

    var vakio = JSX.match(/const SV_CARD_IN_MS = (\d+);/);
    expect(vakio, 'SV_CARD_IN_MS not found in Services.jsx').toBeTruthy();

    expect(Number(vakio[1])).toBeGreaterThanOrEqual(kesto);
  });
});
