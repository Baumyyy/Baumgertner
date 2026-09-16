import { useEffect, useRef } from 'react';

export const useScrollAnimation = () => {
  var ref = useRef(null);

  useEffect(function() {
    
    var observer = new IntersectionObserver(
      function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            // A data attribute rather than a class, deliberately. React
            // owns `className` on these elements: the moment one of them
            // re-renders with a changed class - a section with an open
            // accordion row, say - React rewrites className and wipes any
            // class added from outside, leaving the element stuck at
            // opacity 0 because we have already unobserved it. React does
            // not manage attributes it never set, so this survives.
            entry.target.setAttribute('data-visible', 'true');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        // The viewport, which is now also what scrolls.
        root: null
        // No negative bottom margin here, tempting as it is. Holding the
        // trigger back past the blurred band at the foot of the window
        // sounds like an improvement and creates a dead zone: anything
        // that never rises above that band - the footer row, the
        // copyright line - never intersects, never fires, and stays at
        // opacity 0 for good. Measured: two elements permanently
        // invisible at the bottom of the page. An entrance that begins
        // slightly blurred is a far smaller price.
      }
    );

    var mutationObserver;

    if (ref.current) {
      var fadeElements = ref.current.querySelectorAll('.fade-in');
      fadeElements.forEach(function(el) {
        observer.observe(el);
      });

      // Some sections render their .fade-in elements only after async data
      // arrives (e.g. testimonials loaded from the API), which happens after
      // this effect's initial scan. Watch for those being added later too.
      mutationObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          mutation.addedNodes.forEach(function(node) {
            if (node.nodeType !== 1) return;
            if (node.classList && node.classList.contains('fade-in')) {
              observer.observe(node);
            }
            if (node.querySelectorAll) {
              node.querySelectorAll('.fade-in').forEach(function(el) {
                observer.observe(el);
              });
            }
          });
        });
      });
      mutationObserver.observe(ref.current, { childList: true, subtree: true });
    }

    return function() {
      observer.disconnect();
      if (mutationObserver) mutationObserver.disconnect();
    };
  }, []);

  return ref;
};