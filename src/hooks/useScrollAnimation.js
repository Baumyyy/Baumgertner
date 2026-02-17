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

    if (ref.current) {
      var fadeElements = ref.current.querySelectorAll('.fade-in');
      fadeElements.forEach(function(el) {
        observer.observe(el);
      });
    }

    return function() {
      if (ref.current) {
        var fadeElements = ref.current.querySelectorAll('.fade-in');
        fadeElements.forEach(function(el) {
          observer.unobserve(el);
        });
      }
    };
  }, []);

  return ref;
};