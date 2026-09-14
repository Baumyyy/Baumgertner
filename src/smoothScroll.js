// The page has one scroll container and therefore one smooth-scroll
// instance. Everything that moves the page goes through here rather than
// calling scrollTo on the container directly: a native scroll animation
// and the smooth-scroll loop would both be driving the same scrollTop,
// and the result is the two of them fighting for it for the length of the
// jump.
//
// Registered from the hook that owns the instance rather than created
// here, so this file cannot decide when scrolling starts - it only knows
// where to send it.
var instance = null;

export function registerSmoothScroll(lenis) {
  instance = lenis;
}

function prefersReducedMotion() {
  return !!(window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

// Jump to a position in the page. Falls back to the browser's own
// scrolling when there is no instance - which is the case with reduced
// motion, and for the moment between first paint and the hook mounting.
export function scrollPageTo(container, top) {
  if (instance) {
    instance.scrollTo(top);
    return;
  }
  if (!container) return;
  container.scrollTo({ top: top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}

// Held while the contact panel is open. The container's overflow is
// hidden at that moment, so a wheel event that still reached the
// smooth-scroll loop would move a page nobody can see moving, and the
// position would have quietly changed underneath the panel by the time it
// closes.
export function pauseScrolling() {
  if (instance) instance.stop();
}

export function resumeScrolling() {
  if (instance) instance.start();
}
