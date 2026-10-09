import { useSyncExternalStore } from 'react';

/* Whether the reader has pinched in.
 *
 * Pinch zoom moves the visual viewport and leaves the layout viewport
 * alone, so no media query and no resize handler sees it - the page still
 * believes it is 390px wide. visualViewport.scale is the only thing that
 * knows, and it is worth knowing for two reasons.
 *
 * The first is manners: anything that moves itself on a timer has to stop
 * while someone is holding a magnified view of it, or it slides the thing
 * they were reading out from under them.
 *
 * The second is cost. Zooming makes the browser re-rasterise at the new
 * scale, and the expensive surfaces - stacked backdrop filters, wide
 * blurs - are the ones that grow fastest. On a phone that is where the
 * memory goes.
 *
 * Desktop browser zoom does not show up here, and should not: it changes
 * the layout viewport instead, so the page is genuinely reflowed and
 * nothing needs to stand down.
 */
const tilaa = (cb) => {
  const vv = typeof window !== 'undefined' && window.visualViewport;
  if (!vv) return () => {};
  vv.addEventListener('resize', cb);
  return () => vv.removeEventListener('resize', cb);
};

// 1.05 rather than 1: the scale is a float and settles a hair off exactly
// one, which would otherwise read as permanently zoomed.
const lue = () => {
  const vv = typeof window !== 'undefined' && window.visualViewport;
  return !!vv && vv.scale > 1.05;
};

const luePalvelin = () => false;

export function useZoomed() {
  return useSyncExternalStore(tilaa, lue, luePalvelin);
}
