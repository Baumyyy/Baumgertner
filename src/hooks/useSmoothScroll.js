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
export function useSmoothScroll(wrapperRef, contentRef) {
  useEffect(function() {
    var wrapper = wrapperRef.current;
    var content = contentRef.current;
    if (!wrapper || !content) return;

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
      // The page scrolls inside .aurora-container, not on the document,
      // so both ends of the scroll have to be named: the box that
      // scrolls, and the box whose height decides how far.
      wrapper: wrapper,
      content: content,

      // How much of the remaining distance is covered each frame. Lower
      // is heavier. This is the value the reference site runs.
      lerp: 0.1,

      // A touchscreen already has inertia, and it is the one the person
      // holding the phone has been using all day. Adding a second one on
      // top is how this kind of scrolling gets its bad name, so touch is
      // left alone entirely and only the wheel is handled.
      syncTouch: false,

      autoRaf: true,
    });

    registerSmoothScroll(lenis);

    return function() {
      registerSmoothScroll(null);
      lenis.destroy();
    };
  }, [wrapperRef, contentRef]);
}
