import { useEffect, useState } from 'react';
import { useSmoothScroll } from '../hooks/useSmoothScroll';
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
// Roughly the height of the footer band, so the button steps aside for
// the whole of it rather than only once it has already overlapped.
const FOOTER_CLEARANCE = 160;

// The two corner glows. Exported because they are needed twice: once
// behind the whole page, and once inside the sheet that travels over the
// hero - the sheet has to be opaque to hide the hero, which means it also
// hides the layer below it, so it carries its own copy of the light.
// Same markup and same CSS both times, so the two cannot drift apart.
export const BackdropGlow = ({ className }) => (
  <div className={className} aria-hidden="true">
    <div className="bg-glow bg-glow-primary" />
    <div className="bg-glow bg-glow-secondary" />
  </div>
);

const AuroraBackground = ({ children }) => {
  useSmoothScroll();
  const [showCta, setShowCta] = useState(false);
  const [nearEnd, setNearEnd] = useState(false);
  const { t } = useLang();
  const { open, isOpen } = useContactPanel();

  useEffect(() => {
    // Hidden again at the very bottom: down there it covers the footer's
    // own links, and the footer already offers the same thing in text.
    const onScroll = () => {
      const top = window.scrollY;
      const past = top > 400;
      const atEnd = top + window.innerHeight
        > document.documentElement.scrollHeight - FOOTER_CLEARANCE;
      setShowCta(past && !atEnd);
      // The same end of the page, for the same reason. Down there the
      // footer's own last line sits inside the blurred band, and a
      // copyright and two legal links that can never be read sharply are
      // not an effect, they are a defect.
      setNearEnd(atEnd);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <BackdropGlow className="bg-layer" />
      <div className="aurora-container">
        <div className="aurora-content">
          {children}
        </div>
      </div>
      {/* The page does not stop at the bottom of the window, it softens
          into it. Below the sticky call to action and the navigation, so
          both of those stay sharp on top of it, and above the page so
          there is something for it to blur. */}
      <div
        className={'page-blur' + (nearEnd ? ' is-clear' : '')}
        aria-hidden="true"
      >
        <span></span>
        <span></span>
        <span></span>
        <span></span>
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
