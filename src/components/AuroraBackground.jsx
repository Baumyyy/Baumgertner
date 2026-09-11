import { useEffect, useRef, useState } from 'react';
import './AuroraBackground.css';
import { ChevronUpIcon } from './Icons';

// Owns three things: the backdrop, the page scroll container, and the
// scroll-to-top control. The page does not scroll on <body> - it scrolls
// inside .aurora-container - so this is structural, not decorative.
//
// The canvas particle field it used to draw is gone. It cost a
// requestAnimationFrame loop on every frame for an effect that no longer
// belongs to the brand, and it made the component untestable in jsdom,
// which has no canvas implementation.
const AuroraBackground = ({ children }) => {
  const containerRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onScroll = () => setShowScrollTop(container.scrollTop > 400);
    container.addEventListener('scroll', onScroll);
    return () => container.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    const container = containerRef.current;
    if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div className="bg-layer" aria-hidden="true">
        <div className="bg-glow bg-glow-primary" />
        <div className="bg-glow bg-glow-secondary" />
      </div>
      <div className="aurora-container" ref={containerRef}>
        {children}
      </div>
      <button
        className={'scroll-top-btn' + (showScrollTop ? ' visible' : '')}
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <ChevronUpIcon />
      </button>
    </>
  );
};

export default AuroraBackground;
