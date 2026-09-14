import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  registerSmoothScroll,
  scrollPageTo,
  pauseScrolling,
  resumeScrolling,
} from '../smoothScroll';

// The branch with no instance is not a corner case - it is what runs for
// anyone who has asked for less motion, and for every frame between first
// paint and the hook mounting. It has no library behind it to be correct
// on its behalf, so it is the branch worth asserting.
function fakeLenis() {
  return {
    scrollTo: vi.fn(),
    stop: vi.fn(),
    start: vi.fn(),
  };
}

function fakeContainer() {
  return { scrollTo: vi.fn() };
}

describe('smooth scrolling', function() {
  beforeEach(function() {
    registerSmoothScroll(null);
  });

  it('scrolls the container itself when there is no instance', function() {
    var container = fakeContainer();
    scrollPageTo(container, 900);
    expect(container.scrollTo).toHaveBeenCalledTimes(1);
    expect(container.scrollTo.mock.calls[0][0].top).toBe(900);
  });

  it('hands the jump to the instance instead, so the two do not both drive it', function() {
    var lenis = fakeLenis();
    var container = fakeContainer();
    registerSmoothScroll(lenis);

    scrollPageTo(container, 900);

    expect(lenis.scrollTo).toHaveBeenCalledWith(900);
    expect(container.scrollTo).not.toHaveBeenCalled();
  });

  it('does not animate the fallback for someone who asked for less motion', function() {
    var container = fakeContainer();
    window.matchMedia = function(q) {
      return { matches: q.indexOf('prefers-reduced-motion') >= 0 };
    };

    scrollPageTo(container, 400);

    expect(container.scrollTo.mock.calls[0][0].behavior).toBe('auto');
    delete window.matchMedia;
  });

  it('animates the fallback when no such preference is set', function() {
    var container = fakeContainer();
    window.matchMedia = function() { return { matches: false }; };

    scrollPageTo(container, 400);

    expect(container.scrollTo.mock.calls[0][0].behavior).toBe('smooth');
    delete window.matchMedia;
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
