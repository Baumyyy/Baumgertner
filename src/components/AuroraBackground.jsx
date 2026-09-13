import { useEffect, useRef, useState } from 'react';
import './AuroraBackground.css';
import { useLang } from '../useLang';
import { useContactPanel } from '../useContactPanel';
import { MailIcon } from './Icons';

// Owns three things: the backdrop, the page scroll container, and the
// sticky call to action. The page does not scroll on <body> - it scrolls
// inside .aurora-container - so this is structural, not decorative.
//
// The canvas particle field it used to draw is gone. It cost a
// requestAnimationFrame loop on every frame for an effect that no longer
// belongs to the brand, and it made the component untestable in jsdom,
// which has no canvas implementation.
//
// The scroll-to-top button that used to live here has been replaced by
// the call to action. Two floating controls in the same corner is one
// more than the corner can carry, and getting back to the top is
// something the browser and the navbar already do.
const AuroraBackground = ({ children }) => {
  const containerRef = useRef(null);
  const [showCta, setShowCta] = useState(false);
  const { t } = useLang();
  const { open, isOpen } = useContactPanel();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onScroll = () => setShowCta(container.scrollTop > 400);
    container.addEventListener('scroll', onScroll);
    return () => container.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div className="bg-layer" aria-hidden="true">
        <div className="bg-glow bg-glow-primary" />
        <div className="bg-glow bg-glow-secondary" />
      </div>
      <div className="aurora-container" ref={containerRef}>
        {children}
      </div>
      {/* An icon rather than the label, because this one follows the
          reader down the whole page and a word-wide button at that
          persistence turns into a thing to get around. The label is
          still there for anything that is not looking at pixels.

          Hidden while the panel is open: it would sit under the scrim
          offering to do the thing that is already happening. */}
      <button
        type="button"
        className={'sticky-cta btn-primary' + (showCta && !isOpen ? ' visible' : '')}
        onClick={open}
        aria-label={t.cp_tag}
        title={t.cp_tag}
      >
        <MailIcon className="sticky-cta-icon" />
      </button>
    </>
  );
};

export default AuroraBackground;
