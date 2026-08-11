import { useEffect, useRef } from 'react';

export const useScrollAnimation = () => {
  var ref = useRef(null);

  useEffect(function() {
    var container = document.querySelector('.aurora-container');
    
    var observer = new IntersectionObserver(
      function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        root: container || null
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