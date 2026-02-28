import React, { useEffect, useRef } from 'react';
import './CustomCursor.css';

var CustomCursor = function() {
  var ringRef = useRef(null);
  var pos = useRef({ x: -100, y: -100 });
  var target = useRef({ x: -100, y: -100 });

  useEffect(function() {
    var animationId;

    var handleMouse = function(e) {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
    };

    var handleMouseOver = function(e) {
      if (e.target.closest('a, button, [role="button"]')) {
        ringRef.current && ringRef.current.classList.add('cursor-hover');
      } else {
        ringRef.current && ringRef.current.classList.remove('cursor-hover');
      }
    };

    window.addEventListener('mousemove', handleMouse);
    window.addEventListener('mouseover', handleMouseOver);

    var animate = function() {
      pos.current.x += (target.current.x - pos.current.x) * 0.15;
      pos.current.y += (target.current.y - pos.current.y) * 0.15;

      if (ringRef.current) {
        ringRef.current.style.left = pos.current.x + 'px';
        ringRef.current.style.top = pos.current.y + 'px';
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return function() {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return <div className="cursor-ring" ref={ringRef}></div>;
};

export default CustomCursor;