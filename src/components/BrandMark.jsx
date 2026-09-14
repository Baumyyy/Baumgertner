// Brand marks, inlined so they inherit colour from CSS through
// currentColor. A monochrome identity should take its colour from the
// token system rather than shipping separate black and white files -
// that also removes the whole class of "wrong variant on wrong
// background" bugs.
//
// Geometry is copied verbatim from brand/svg/. Do not redraw or reformat
// these paths; a test asserts they still match the vector masters.

// The B mark - brand/svg/b-merkki-musta.svg
const MARK_PATH = 'M0 0L79 0A20 20 0 0 1 99 20L99 33A20 20 0 0 1 95.343 44.528A20 20 0 0 1 104 61L104 80A20 20 0 0 1 84 100L0 100L0 0ZM12 12L12 41L79 41A8 8 0 0 0 87 33L87 20A8 8 0 0 0 79 12L12 12ZM12 53L12 88L84 88A8 8 0 0 0 92 80L92 61A8 8 0 0 0 84 53L12 53Z';

// The wordmark - brand/svg/baumgertner-musta.svg
// Aspect ratio is roughly 19.3:1, so always size it by width and let
// height follow. Never set a height on it.
const WORDMARK_PATH = 'M0 0L79 0A20 20 0 0 1 99 20L99 33A20 20 0 0 1 95.343 44.528A20 20 0 0 1 104 61L104 80A20 20 0 0 1 84 100L0 100L0 0ZM12 12L12 41L79 41A8 8 0 0 0 87 33L87 20A8 8 0 0 0 79 12L12 12ZM12 53L12 88L84 88A8 8 0 0 0 92 80L92 61A8 8 0 0 0 84 53L12 53ZM222.547 0L236.333 0L292.88 100L279.094 100L229.44 12.19L179.786 100L166 100L222.547 0ZM374.88 88L438.88 88A8 8 0 0 0 446.88 80L446.88 0L458.88 0L458.88 80A20 20 0 0 1 438.88 100L374.88 100A20 20 0 0 1 354.88 80L354.88 0L366.88 0L366.88 80A8 8 0 0 0 374.88 88ZM540.88 0L554.726 0L605.36 87.972L655.994 0L669.84 0L669.84 100L657.84 100L657.84 20.849L612.283 100L598.437 100L552.88 20.849L552.88 100L540.88 100L540.88 0ZM771.84 0L861.04 0L861.04 12L771.84 12A8 8 0 0 0 763.84 20L763.84 80A8 8 0 0 0 771.84 88L841.04 88A8 8 0 0 0 849.04 80L849.04 62L811.9 62L811.9 50L861.04 50L861.04 80A20 20 0 0 1 841.04 100L771.84 100A20 20 0 0 1 751.84 80L751.84 20A20 20 0 0 1 771.84 0ZM940.04 0L1035.72 0L1035.72 12L952.04 12L952.04 44L1026.152 44L1026.152 56L952.04 56L952.04 88L1035.72 88L1035.72 100L940.04 100L940.04 0ZM1101.72 0L1182.525 0L1202.04 19.515L1202.04 33.485L1185.679 49.846L1214.04 100L1200.254 100L1173.677 53L1101.72 53L1101.72 41L1177.555 41L1190.04 28.515L1190.04 24.485L1177.555 12L1101.72 12L1101.72 0ZM1286.04 0L1390.04 0L1390.04 12L1344.04 12L1344.04 100L1332.04 100L1332.04 12L1286.04 12L1286.04 0ZM1462.04 0L1478.413 0L1559.24 87.073L1559.24 0L1571.24 0L1571.24 100L1554.867 100L1474.04 12.927L1474.04 100L1462.04 100L1462.04 0ZM1653.24 0L1748.92 0L1748.92 12L1665.24 12L1665.24 44L1739.352 44L1739.352 56L1665.24 56L1665.24 88L1748.92 88L1748.92 100L1653.24 100L1653.24 0ZM1814.92 0L1895.725 0L1915.24 19.515L1915.24 33.485L1898.879 49.846L1927.24 100L1913.454 100L1886.877 53L1814.92 53L1814.92 41L1890.755 41L1903.24 28.515L1903.24 24.485L1890.755 12L1814.92 12L1814.92 0Z';

// `decorative` hides the mark from assistive technology, for the case
// where the surrounding element already carries the name as real text.
// Without it a heading containing both would be announced twice.
const BrandSvg = ({ viewBox, path, className, title, decorative }) => (
  <svg
    className={className}
    viewBox={viewBox}
    xmlns="http://www.w3.org/2000/svg"
    {...(decorative
      ? { 'aria-hidden': 'true', focusable: 'false' }
      : { role: 'img', 'aria-label': title })}
  >
    <path fill="currentColor" d={path} />
  </svg>
);

export const Mark = ({ className, title = 'Baumgertner', decorative = false }) => (
  <BrandSvg
    viewBox="0 0 104 100"
    path={MARK_PATH}
    className={className}
    title={title}
    decorative={decorative}
  />
);

export const Wordmark = ({ className, title = 'Baumgertner', decorative = false }) => (
  <BrandSvg
    viewBox="0 0 1927.24 100"
    path={WORDMARK_PATH}
    className={className}
    title={title}
    decorative={decorative}
  />
);

// The wordmark as a hole rather than a shape: a field of colour with the
// letters knocked out of it. Scaling this up carries the viewer through
// the letters onto the page behind, which is the site opening.
//
// One path with an even-odd fill, not a mask. A mask forces the browser
// to rasterise a separate buffer, and this element is scaled two hundred
// and fifty times - at that size the browser intermittently gives up on
// the buffer and paints the field solid, which is a black screen instead
// of an opening. Measured at 2560 wide: it happened on two runs out of
// five, at every zoom level, so it was the mask rather than the travel.
//
// Even-odd does the same job with no buffer at all. A point inside the
// field alone is crossed once and fills; inside the field and a letter,
// twice, and drops out; inside a counter as well - the enclosed middle
// of a B - three times, and fills again, which is exactly right, because
// a counter is background too.
//
// The field is enormous in viewBox units so it still covers the screen
// while the svg box is only as big as the wordmark, and it has to be
// only that big: that is what keeps the holes registered with the drawn
// mark sitting behind them.
const KNOCKOUT_FIELD = 'M-20000 -20000L20000 -20000L20000 20000L-20000 20000Z';

export const WordmarkKnockout = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 1927.24 100"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d={KNOCKOUT_FIELD + WORDMARK_PATH}
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);
