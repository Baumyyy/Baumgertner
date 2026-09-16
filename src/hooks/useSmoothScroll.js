import { useEffect } from 'react';
import Lenis from 'lenis';
import { registerSmoothScroll } from '../smoothScroll';

// Weight on the scroll. The wheel stops being a step and becomes a push:
// the page carries on for a moment after the fingers stop, and comes to
// rest instead of stopping dead.
//
// It drives the container's real scrollTop rather than transforming the
// content, which is what keeps the rest of the page honest - the sticky
// hero, the scroll spy, the progress bar and every anchor all read the
// same number they always did.
export function useSmoothScroll() {
  useEffect(function() {

    // Nothing to add for someone who has asked for less motion. Their
    // browser already scrolls the way they want it to, and every jump on
    // the site falls back to it on its own.
    //
    // No matchMedia at all means there is no way to ask, and taking over
    // the scroll without being able to honour the answer is not a trade
    // worth making - so that case is left alone too.
    if (!window.matchMedia) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var lenis = new Lenis({
      // No wrapper or content named: the document is what scrolls, which
      // is the default, and naming an element here is what stopped the
      // browser hiding its own address bar.

      // How much of the remaining distance is covered each frame. Lower
      // is heavier. This is the value the reference site runs.
      lerp: 0.1,

      // The wheel only. Touch is left to the browser.
      //
      // This was tried the other way and taken back out. Turning it on
      // gives the library the touch events and makes it set the scroll
      // position itself, on the main thread, one frame at a time - while
      // native touch scrolling runs on the compositor and keeps moving
      // even when the main thread is busy. This page has a stack of
      // backdrop-filter layers along the bottom edge, which is the
      // heaviest thing on it: measured, scrolling runs at 32-35fps with
      // that band and 59 without. A wheel gesture survives that, because
      // there is no finger on the glass to compare it against. A touch
      // gesture does not - it reads as stuttering, which is exactly what
      // it was reported as.
      //
      // Both weights were tried, the library's own 0.075 and a much
      // lighter 0.35. The first lagged the finger and the second still
      // stuttered, because the weight was never the problem: where the
      // scrolling runs was.
      //
      // Worth knowing if this is revisited: there is no way to slow
      // native touch scrolling down. Its speed belongs to the operating
      // system, and the only way to change it is to take the gesture
      // over - which is this setting, and this is what that costs. The
      // route to having both would be to make the main thread cheap
      // enough to keep up, which means the blur band.
      syncTouch: false,

      autoRaf: true,
    });

    registerSmoothScroll(lenis);

    return function() {
      registerSmoothScroll(null);
      lenis.destroy();
    };
  }, []);
}
