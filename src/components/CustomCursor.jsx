import React, { useEffect, useRef } from 'react';
import './CustomCursor.css';

var CustomCursor = function() {
  var ringRef = useRef(null);
  var pos = useRef({ x: -100, y: -100 });
  var target = useRef({ x: -100, y: -100 });

  useEffect(function() {
    // No real cursor to follow on touch-only devices - skip entirely rather
    // than run a rAF loop forever for a ring nobody sees.
    var isFinePointer = !window.matchMedia || window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) return;

    var animationId = null;

    var animate = function() {
      var dx = target.current.x - pos.current.x;
      var dy = target.current.y - pos.current.y;
      // Once within a couple pixels (imperceptible on an 8px ring), snap
      // exactly to the target and stop scheduling frames instead of
      // looping for several more seconds to resolve sub-pixel decay;
      // handleMouse restarts the loop on the next mousemove.
      var settled = Math.abs(dx) <= 2 && Math.abs(dy) <= 2;
      if (settled) {
        pos.current.x = target.current.x;
        pos.current.y = target.current.y;
      } else {
        pos.current.x += dx * 0.15;
        pos.current.y += dy * 0.15;
      }

      if (ringRef.current) {
        ringRef.current.style.left = pos.current.x + 'px';
        ringRef.current.style.top = pos.current.y + 'px';
      }

      if (settled) {
        animationId = null;
      } else {
        animationId = requestAnimationFrame(animate);
      }
    };

    var handleMouse = function(e) {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
      if (animationId === null) {
        animationId = requestAnimationFrame(animate);
      }
    };

    window.addEventListener('mousemove', handleMouse);
    animationId = requestAnimationFrame(animate);

    return function() {
      if (animationId !== null) cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  return <div className="cursor-ring" ref={ringRef}></div>;
};

export default CustomCursor;