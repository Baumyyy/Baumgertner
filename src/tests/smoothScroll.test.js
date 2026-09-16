import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  registerSmoothScroll,
  scrollPageTo,
  pageOffsetOf,
  pauseScrolling,
  resumeScrolling,
} from '../smoothScroll';

// The branch with no instance is not a corner case - it is what runs for
// anyone who has asked for less motion, and for every frame between first
// paint and the hook mounting. It has no library behind it to be correct
// on its behalf, so it is the branch worth asserting.
//
// The page itself is what scrolls now, so these assert against window
// rather than against an element handed in by the caller.
function fakeLenis() {
  return {
    scrollTo: vi.fn(),
    stop: vi.fn(),
    start: vi.fn(),
  };
}

describe('smooth scrolling', function() {
  var alkuperainenScrollTo;

  beforeEach(function() {
    registerSmoothScroll(null);
    alkuperainenScrollTo = window.scrollTo;
    window.scrollTo = vi.fn();
  });

  afterEach(function() {
    window.scrollTo = alkuperainenScrollTo;
    delete window.matchMedia;
  });

  it('scrolls the page itself when there is no instance', function() {
    scrollPageTo(900);
    expect(window.scrollTo).toHaveBeenCalledTimes(1);
    expect(window.scrollTo.mock.calls[0][0].top).toBe(900);
  });

  it('hands the jump to the instance instead, so the two do not both drive it', function() {
    var lenis = fakeLenis();
    registerSmoothScroll(lenis);

    scrollPageTo(900);

    expect(lenis.scrollTo).toHaveBeenCalledWith(900);
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it('does not animate the fallback for someone who asked for less motion', function() {
    window.matchMedia = function(q) {
      return { matches: q.indexOf('prefers-reduced-motion') >= 0 };
    };

    scrollPageTo(400);

    expect(window.scrollTo.mock.calls[0][0].behavior).toBe('auto');
  });

  it('animates the fallback when no such preference is set', function() {
    window.matchMedia = function() { return { matches: false }; };

    scrollPageTo(400);

    expect(window.scrollTo.mock.calls[0][0].behavior).toBe('smooth');
  });

  it('measures an element against the page, not its positioned ancestor', function() {
    // offsetTop is relative to the nearest positioned ancestor and goes
    // wrong the moment one is introduced in between; rect plus scroll
    // position does not.
    var el = { getBoundingClientRect: function() { return { top: 120 }; } };
    window.scrollY = 500;

    expect(pageOffsetOf(el)).toBe(620);
  });

  it('stops and starts the instance when the contact panel takes the page', function() {
    var lenis = fakeLenis();
    registerSmoothScroll(lenis);

    pauseScrolling();
    resumeScrolling();

    expect(lenis.stop).toHaveBeenCalledTimes(1);
    expect(lenis.start).toHaveBeenCalledTimes(1);
  });

  it('lets the panel open and close harmlessly when there is no instance', function() {
    expect(function() {
      pauseScrolling();
      resumeScrolling();
    }).not.toThrow();
  });
});
