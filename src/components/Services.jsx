/*
 * Services v3.
 *
 * Two halves. A diagram puts the mark in the middle with the six
 * services around it, wired to it; the active one cycles on its own and
 * follows the pointer. Below it a bento grid shows each service instead
 * of describing it - a client site on a desktop and a phone, Lighthouse
 * targets, a search result with the structured data behind it, a brand
 * board, a deployment card, a schedule.
 *
 * One accent colour, spent twice: the mark in the hub and the live dot
 * on the deployment card. Everything else is greys, which is what lets
 * those two mean something.
 *
 * Where the words come from, and why it is split:
 *
 *   The six service names and lines come from src/lang - the same place
 *   the old cards read them from - because scripts/schema.js and
 *   scripts/llms.js build the structured data and the llms.txt out of
 *   those exact keys. Restating them here would mean the page could say
 *   one thing while the JSON-LD told Google another, and the copy nobody
 *   looks at is the copy that drifts.
 *
 *   The mock chrome inside the previews is different: "Sinun Yritys",
 *   the Lighthouse row, the deployment table, the phase names. Nothing
 *   outside this file consumes any of it, it is illustration rather than
 *   claim, and putting it in the shared language file would invite it
 *   into the structured data. So it lives in UI below.
 */
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import './Services.css';
import {
  SiCaddy, SiCloudflare, SiDocker, SiNginx,
  SiNodedotjs, SiPostgresql, SiReact, SiVite,
} from 'react-icons/si';
import { useLang } from '../useLang';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useZoomed } from '../hooks/useZoomed';

/* --------------------------------------------- mock copy, this file only */
const UI = {
  en: {
    client: 'Your Company', url: 'yourcompany.fi', nav: ['Services', 'Work', 'Contact'],
    heroH: 'Electrical work in Turku', heroP: 'Installations, repairs and inspections.', heroCta: 'Ask for a quote',
    serpTitle: 'Your Company — Electrical work in Turku',
    serpDesc: 'Installations, repairs and inspections for homes and businesses in Turku. Ask for a quote.',
    schemaType: 'Electrician',
    lhTitle: 'Lighthouse', lhTarget: 'Target on every project',
    lh: ['Performance', 'Accessibility', 'Best practices', 'SEO'],
    deployTitle: 'Production', deployStatus: 'Live',
    deployRows: [['Domain', 'yourcompany.fi'], ['SSL', 'Active'], ['Hosting', 'Chosen for the project'], ['Owner', 'You']],
    steps: ['Build', 'Deploy', 'Live'],
    phases: ['Discovery', 'Design', 'Build', 'Launch'],
    // The real <title> of this page, so the tab is the actual tab.
    brandTab: 'Baumgertner | Custom websites, designed and built in Turku',
    example: 'Example schedule', weeks: '4–8 weeks', today: 'Now',
  },
  fi: {
    client: 'Sinun Yritys', url: 'sinunyritys.fi', nav: ['Palvelut', 'Työt', 'Yhteys'],
    heroH: 'Sähkötyöt Turussa', heroP: 'Asennukset, korjaukset ja tarkastukset.', heroCta: 'Pyydä tarjous',
    serpTitle: 'Sinun Yritys — Sähkötyöt Turussa',
    serpDesc: 'Asennukset, korjaukset ja tarkastukset koteihin ja yrityksiin Turussa. Pyydä tarjous.',
    schemaType: 'Electrician',
    lhTitle: 'Lighthouse', lhTarget: 'Tavoite jokaisessa projektissa',
    lh: ['Suorituskyky', 'Saavutettavuus', 'Käytännöt', 'SEO'],
    deployTitle: 'Tuotanto', deployStatus: 'Julkaistu',
    deployRows: [['Verkkotunnus', 'sinunyritys.fi'], ['SSL', 'Voimassa'], ['Palvelin', 'Valittu projektiin'], ['Omistaja', 'Sinä']],
    steps: ['Build', 'Julkaisu', 'Live'],
    phases: ['Kartoitus', 'Suunnittelu', 'Rakennus', 'Julkaisu'],
    brandTab: 'Baumgertner | Räätälöidyt verkkosivut, Turku',
    example: 'Esimerkkiaikataulu', weeks: '4–8 viikkoa', today: 'Nyt',
  },
};

/* The keys, in the order src/lang numbers the services. The order below
   is also what the diagram nodes and the schema offer list follow, so it
   is one list rather than three that have to agree. */
const KEYS = ['web', 'brand', 'perf', 'seo', 'launch', 'pm'];

/* Matches --sv-pulse in Services.css. The impulse runs twice before the
   active service changes, so the cycle is this doubled. */
const SV_PULSE_MS = 2600;

/* How long the diagram takes to assemble, from the hub appearing to
   the last service landing. Matches the delays in Services.css. */
const SV_ENTRANCE_MS = 2300;

/* How long the cards take to arrive on a phone: the .92s transition plus
   the longest stagger, two steps of 150ms. Snapping is held off until
   this has passed - see the note on .sv-bento. Keep it in step with the
   transition in Services.css. */
const SV_CARD_IN_MS = 1250;

/* --------------------------------------------------------------- icons */
const ICONS = {
  web: <><rect x="2.5" y="4" width="19" height="16" rx="2" /><path d="M2.5 9h19" /></>,
  brand: <><rect x="9" y="9" width="11" height="11" rx="2" /><circle cx="9" cy="9" r="5.5" /></>,
  perf: <><circle cx="12" cy="12" r="9" /><path d="M13.2 6.5L9 12.6h3.1l-.7 4.9 4.2-6.1h-3.1z" /></>,
  seo: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.2 15.2L21 21" /></>,
  launch: <><rect x="3" y="4" width="18" height="6.5" rx="1.5" /><rect x="3" y="13.5" width="18" height="6.5" rx="1.5" /><path d="M6.5 7.25h.01M6.5 16.75h.01" /></>,
  pm: <><path d="M3.5 6.5l1.5 1.5 3-3M3.5 16.5l1.5 1.5 3-3" /><path d="M11 6.5h9.5M11 11.5h9.5M11 16.5h6" /></>,
};
const Icon = ({ k, size = 20 }) => (
  <svg className="sv-icon" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{ICONS[k]}</svg>
);

/* The compact wing mark. Written out here rather than imported from
   BrandMark because these two need a plain fill they can be handed - the
   hub wants the signal red and the brand board wants it at a different
   size - where the shared components take their colour from
   currentColor by design. The geometry is the same path. */
const MARK_D = 'M188.637 86L124.637 86L223.041 260L287.041 260ZM64 0L31.936 0A18.628 18.628 0 0 0 15.721 27.798L147.041 260L211.041 260ZM301.041 260L365.041 260L463.445 86L399.445 86ZM377.041 260L441.041 260L572.361 27.798A18.628 18.628 0 0 0 556.146 0L524.082 0Z';

const Mark = ({ w = 48, color = 'var(--signal)' }) => (
  <svg viewBox="0 0 588.08 260" width={w} height={(w * 260) / 588.08} aria-hidden="true" focusable="false"><path fill={color} d={MARK_D} /></svg>
);

/* ------------------------------------------------------------- helpers */
const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function useInView(ref, threshold = 0.3) {
  const [state, setState] = useState({ seen: false, inView: false });
  useEffect(() => {
    const el = ref.current;
    // No observer means no way to tell, and a preview nobody can see is
    // worse than one that arrived early - so assume visible.
    if (!el || typeof IntersectionObserver === 'undefined') { setState({ seen: true, inView: true }); return; }
    const io = new IntersectionObserver(([e]) => setState((s) => ({ seen: s.seen || e.isIntersecting, inView: e.isIntersecting })), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold]);
  return state;
}

/* The bento turns into a swipe row on a phone, and two things in this
   file have to know which it is. A media query cannot tell React that a
   card three screens to the right will never intersect the viewport, so
   the breakpoint is read here as well - once, with a listener, rather
   than measured per frame. */
const SWIPE_MQ = '(max-width: 900px)';
const tilaaSwipe = (cb) => {
  const mq = window.matchMedia?.(SWIPE_MQ);
  if (!mq) return () => {};
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};
// Prerender has no viewport to measure, so the built HTML is the wide
// layout and hydration moves it if the phone disagrees. The CSS does the
// actual reflow either way - this only decides the dots and the fallback.
const lueSwipe = () => !!window.matchMedia?.(SWIPE_MQ).matches;
const lueSwipePalvelin = () => false;

function useSwipeRow() {
  return useSyncExternalStore(tilaaSwipe, lueSwipe, lueSwipePalvelin);
}

/* The phone has no diagram, so the cards have to carry the section on
   their own: they advance themselves every five seconds and wrap, which
   is the overview the tree used to give, spent over time instead of over
   space.

   Everything here is derived from scroll position rather than driven
   into it, so a thumb and the timer cannot disagree - a swipe just moves
   the scroller, and the next tick picks up from wherever it landed. */
const CARD_MS = 5000;

function useCarousel(rowRef, enabled, inView, zoomed) {
  // vpos is the position along the row, dom is which child sits there -
  // not the same number, because the technology card is pulled to the
  // front with CSS order and the dots have to count what the eye counts.
  const [tila, setTila] = useState({ vpos: 0, dom: 0 });
  const [soineet, setSoineet] = useState(() => new Set([0]));

  useEffect(() => {
    const el = rowRef.current;
    if (!el || !enabled) return undefined;
    let raf = 0;
    const laske = () => {
      raf = 0;
      // The cards snap to the middle of the row, so that is what each
      // one is measured against - its own centre, not its left edge.
      // clientWidth includes the padding that lets the end cards reach
      // the middle, which is why the two halves line up.
      const keski = el.scrollLeft + el.clientWidth / 2;
      const nakyva = Array.from(el.children)
        .map((c, dom) => ({ c, dom, x: c.offsetLeft, k: c.offsetLeft + c.offsetWidth / 2 }))
        .sort((a, b) => a.x - b.x);
      let vpos = 0, lyhin = Infinity;
      nakyva.forEach((k, i) => {
        const ero = Math.abs(k.k - keski);
        if (ero < lyhin) { lyhin = ero; vpos = i; }
        // How far off the snap point, in card widths. The card being
        // read comes forward and the ones beside it sit back; written to
        // the element because this changes every frame of a flick and a
        // re-render per frame is a lot of React for a brightness value.
        k.c.style.setProperty('--d', Math.min(1, ero / k.c.offsetWidth).toFixed(3));
      });
      const dom = nakyva[vpos].dom;
      setTila((v) => (v.vpos === vpos && v.dom === dom ? v : { vpos, dom }));
      setSoineet((v) => (v.has(dom) ? v : new Set(v).add(dom)));
    };
    const vieritti = () => { if (!raf) raf = requestAnimationFrame(laske); };
    el.addEventListener('scroll', vieritti, { passive: true });
    // Deferred, not called here: setting state straight from an effect
    // body cascades a render.
    raf = requestAnimationFrame(laske);
    return () => {
      el.removeEventListener('scroll', vieritti);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [rowRef, enabled]);

  const siirry = useCallback((vpos) => {
    const el = rowRef.current;
    if (!el) return;
    const kohde = Array.from(el.children).sort((a, b) => a.offsetLeft - b.offsetLeft)[vpos];
    if (!kohde) return;
    el.scrollTo({
      left: kohde.offsetLeft + kohde.offsetWidth / 2 - el.clientWidth / 2,
      behavior: reduceMotion() ? 'auto' : 'smooth',
    });
  }, [rowRef]);

  /* The timer restarts from whatever the row settled on, so a swipe does
     not fight it: moving the cards yourself resets the five seconds
     rather than queueing a jump on top of your own. Off screen it does
     not run at all. */
  useEffect(() => {
    const el = rowRef.current;
    // Not while someone is pinched in. Advancing the row would drag the
    // card they are holding a magnified view of out of the frame, and a
    // programmatic scroll inside a mandatory-snap container while the
    // visual viewport is scaled is the browser fighting itself.
    if (!el || !enabled || !inView || zoomed || reduceMotion()) return undefined;
    const maara = el.children.length;
    const id = setTimeout(() => siirry((tila.vpos + 1) % maara), CARD_MS);
    return () => clearTimeout(id);
  }, [rowRef, enabled, inView, zoomed, tila.vpos, siirry]);

  return { ...tila, soineet, siirry };
}

/* ------------------------------------------------------------- diagram *//* ------------------------------------------------------------- diagram */
const VW = 1200, VH = 440, HUB = { x: 600, y: 220 }, HUB_HALF = 70, NODE_W = 240;
const NODES = [
  { x: 150, y: 80, side: 'l' }, { x: 150, y: 220, side: 'l' }, { x: 150, y: 360, side: 'l' },
  { x: 1050, y: 80, side: 'r' }, { x: 1050, y: 220, side: 'r' }, { x: 1050, y: 360, side: 'r' },
];
const wire = (n) => {
  const sx = n.side === 'l' ? HUB.x - HUB_HALF : HUB.x + HUB_HALF;
  const ex = n.side === 'l' ? n.x + NODE_W / 2 : n.x - NODE_W / 2;
  const mx = (sx + ex) / 2;
  return `M${sx} ${HUB.y} C${mx} ${HUB.y} ${mx} ${n.y} ${ex} ${n.y}`;
};
const pct = (v, t) => `${(v / t) * 100}%`;

function Diagram({ items, active, onPick, onRelease, outerRef, seen, armed }) {
  return (
    <div ref={outerRef} className={'sv-diagram' + (seen ? ' is-in' : '') + (armed ? ' is-armed' : '')}>
      <svg className="sv-wires" viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none" aria-hidden="true">
        {NODES.map((n, i) => (
          <path
            key={i}
            className={`sv-wire${active === i ? ' is-on' : ''}`}
            pathLength="100"
            style={{ '--i': i }}
            d={wire(n)}
          />
        ))}
        {/* Keyed on the active index so the travel restarts from the hub
            each time the service changes rather than continuing from
            wherever the previous cycle happened to be. */}
        {armed && !reduceMotion() && ['halo', 'ring', 'core'].map((layer) => (
          <path
            key={'dot-' + layer + '-' + active}
            className={'sv-dot sv-dot-' + layer}
            pathLength="100"
            d={wire(NODES[active])}
          />
        ))}
      </svg>

      <div
        className="sv-hub"
        style={{ '--x': pct(HUB.x, VW), '--y': pct(HUB.y, VH) }}
        aria-hidden="true"
      >
        <span className="sv-port l" /><span className="sv-port r" />
        <Mark w={70} />
      </div>

      {NODES.map((n, i) => {
        const it = items[i];
        return (
          <button key={it.key} type="button"
            className={`sv-node${active === i ? ' is-on' : ''}`}
            style={{ '--x': pct(n.x, VW), '--y': pct(n.y, VH), '--i': i }}
            onMouseEnter={() => onPick(i)} onMouseLeave={onRelease} onFocus={() => onPick(i)} onBlur={onRelease}
            onClick={() => document.getElementById(`sv-${it.key}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
            <span className={`sv-port ${n.side === 'l' ? 'r' : 'l'}`} />
            <Icon k={it.key} size={18} />
            <span>{it.name}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------ previews */

/* The same client site, drawn twice - once in the browser frame and once
   in the phone. Declared here rather than inside WebPreview: a component
   defined during a render is a new type on every pass, so React throws
   the old tree away and rebuilds it instead of updating it. */
const Site = ({ u, phone }) => (
  <div className={`sv-site${phone ? ' phone' : ''}`}>
    <div className="sv-site-nav"><b>{u.client.toUpperCase()}</b>{!phone && <span>{u.nav.map((n) => <i key={n}>{n}</i>)}</span>}{phone && <span className="burger" />}</div>
    <div className="sv-site-hero">
      <h4>{u.heroH}</h4>
      <p>{u.heroP}</p>
      <em>{u.heroCta}</em>
    </div>
    {!phone && <div className="sv-site-row"><span /><span /><span /></div>}
  </div>
);

function WebPreview({ u }) {
  return (
    <div className="sv-web">
      <div className="sv-browser">
        <div className="sv-chrome"><i /><i /><i /><span>{u.url}</span></div>
        <Site u={u} />
      </div>
      <div className="sv-phone"><div className="sv-notch" /><Site u={u} phone /></div>
    </div>
  );
}

function PerfPreview({ u, run }) {
  const C = 2 * Math.PI * 17;
  return (
    <div className="sv-panel sv-lh">
      <div className="sv-panel-head"><span>{u.lhTitle}</span><small>{u.lhTarget}</small></div>
      <div className="sv-lh-row">
        {u.lh.map((label, i) => (
          <div className="sv-lh-item" key={label}>
            <svg viewBox="0 0 40 40" aria-hidden="true">
              <circle cx="20" cy="20" r="17" className="trk" />
              <circle cx="20" cy="20" r="17" className="val" style={{ strokeDasharray: C, strokeDashoffset: run ? C * 0.1 : C, transitionDelay: `${0.15 * i}s` }} />
            </svg>
            <b>90+</b>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SeoPreview({ u }) {
  return (
    <div className="sv-seo">
      <div className="sv-panel sv-serp">
        <div className="site"><span className="fav">{u.client[0]}</span><div><b>{u.client}</b><small>https://{u.url}</small></div></div>
        <h5>{u.serpTitle}</h5>
        <p>{u.serpDesc}</p>
      </div>
      <pre className="sv-panel sv-code" aria-hidden="true">{`{
  "@type": "${u.schemaType}",
  "name": "${u.client}",
  "areaServed": "Turku",
  "url": "https://${u.url}"
}`}</pre>
    </div>
  );
}

/* The palette as src/styles/tokens.css declares it - the four a client
   would be handed, shown as colour and nothing else. */
const PALETTE = ['#000000', '#FFFFFF', '#E5242A', '#8C8C8C'];

function BrandPreview({ u }) {
  return (
    <div className="sv-panel sv-brand">
      <div className="sv-brand-tab">
        <i><Mark w={10} color="#fff" /></i>
        <span>{u.brandTab}</span>
      </div>

      <div className="sv-brand-marks">
        <span className="sv-brand-icon"><Mark w={28} color="#fff" /></span>
        <span className="sv-brand-avatar"><Mark w={24} /></span>
      </div>

      <div className="sv-brand-foot">
        <span className="sv-brand-dots">
          {PALETTE.map((hex) => <i key={hex} style={{ background: hex }} />)}
        </span>
        <span className="sv-brand-faces">
          <em className="is-display">Aa</em>
          <em className="is-body">Aa</em>
        </span>
      </div>
    </div>
  );
}

function LaunchPreview({ u, run }) {
  return (
    <div className="sv-panel sv-deploy">
      <div className="sv-panel-head"><span>{u.deployTitle}</span><em className={run ? 'on' : ''}><i />{u.deployStatus}</em></div>
      <dl>{u.deployRows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
      <ol className={run ? 'on' : ''}>{u.steps.map((s, i) => <li key={s} style={{ transitionDelay: `${0.3 + i * 0.35}s` }}>{s}</li>)}</ol>
    </div>
  );
}

function PmPreview({ u, run }) {
  const spans = [[0, 1.5], [1.5, 3.5], [3.5, 6.5], [6.5, 8]];
  const now = 5.2 / 8;
  return (
    <div className="sv-panel sv-pm">
      <div className="sv-panel-head"><span>{u.example}</span><small>{u.weeks}</small></div>
      <div className="sv-pm-grid" style={{ '--now': now }}>
        {u.phases.map((p, i) => {
          const [a, b] = spans[i];
          const done = Math.max(0, Math.min(1, (now * 8 - a) / (b - a)));
          return (
            <div className="sv-pm-row" key={p}>
              <span className="lbl">{p}</span>
              <span className="track">
                <span className="bar" style={{ left: `${(a / 8) * 100}%`, width: `${((b - a) / 8) * 100}%` }}>
                  <span className="fill" style={{ transform: `scaleX(${run ? done : 0})`, transitionDelay: `${0.2 + i * 0.25}s` }} />
                </span>
              </span>
            </div>
          );
        })}
        <span className={`sv-now${run ? ' on' : ''}`}><b>{u.today}</b></span>
      </div>
    </div>
  );
}

/* The stack this site actually runs on, checked against package.json and
   docker-compose.yml rather than chosen for how the logos look.

   The icons come from react-icons, imported one by one. The package is
   ESM with sideEffects:false, so Vite ships these eight and drops the
   rest - the install is large on disk and small in the bundle, and the
   difference is measured rather than assumed.

   Eight, thinning inward: three on the outside, three in the middle,
   two closest in. Twelve did not fit and the arithmetic says why - the
   card is 280px like every other preview, so the orbit caps at 252, the
   outer radius at 113, and three evenly spaced rings put the innermost
   at 37. A 26px badge there reaches 24px from the centre, which is
   exactly where a 48px mark ends. They met at the pixel.

   Two badges on the inner ring sit opposite each other, so the mark has
   the other two quarters to itself.

   Each ring starts a third of a step round from the one inside it, so no
   two badges ever share a spoke. */
const ORBITS = [
  { ring: 0, offset: 0, items: [[SiReact, 'React'], [SiVite, 'Vite']] },
  { ring: 1, offset: 30, items: [[SiNodedotjs, 'Node'], [SiPostgresql, 'Postgres'], [SiDocker, 'Docker']] },
  { ring: 2, offset: 60, items: [[SiNginx, 'nginx'], [SiCaddy, 'Caddy'], [SiCloudflare, 'Cloudflare']] },
];

function TechPreview() {
  return (
    <div className="sv-orb">
      <span className="sv-orb-core"><Mark w={72} /></span>
      {ORBITS.map((o) => (
        <div key={o.ring} className={'sv-orb-ring sv-orb-ring-' + o.ring}>
          {o.items.map(([Logo, name], i) => (
            <span
              key={name}
              className="sv-orb-chip"
              style={{ '--a': o.offset + (360 / o.items.length) * i + 'deg' }}
            >
              <span className="sv-orb-undo">
                <span className="sv-orb-badge" title={name}>
                  <Logo aria-hidden="true" focusable="false" />
                </span>
              </span>
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

const PREVIEWS = { web: WebPreview, perf: PerfPreview, seo: SeoPreview, brand: BrandPreview, launch: LaunchPreview, pm: PmPreview };

function Tile({ it, u, active, onPick, onRelease, delay, rowRun, play }) {
  const ref = useRef(null);
  // 0.52, the same reading the diagram uses: far enough in that the
  // card is being looked at rather than still arriving from below.
  const { seen } = useInView(ref, 0.52);
  // rowRun is the phone: in the swipe row only the first card is ever on
  // screen, so its own observer would leave the other six at opacity 0
  // with their previews frozen. There the row arriving is the cue.
  const run = seen || rowRun || reduceMotion();
  // Two separate things. run is whether the card has arrived, which on a
  // phone is the whole row at once - otherwise the card beside the one
  // being read would sit at opacity 0 and there would be nothing to
  // swipe towards. play is whether its preview should be animating, and
  // that waits until the card is the one in front of you.
  const P = PREVIEWS[it.key];
  return (
    <li ref={ref} id={`sv-${it.key}`}
      className={`sv-tile sv-t-${it.key}${active ? ' is-on' : ''}${run ? ' is-run' : ''}`}
      style={{ '--i': delay }}
      onMouseEnter={onPick} onMouseLeave={onRelease}>
      <div className="sv-visual" aria-hidden="true"><P u={u} run={play ?? run} /></div>
      <div className="sv-copy">
        <h3><Icon k={it.key} size={18} />{it.name}</h3>
        <p>{it.line}</p>
      </div>
    </li>
  );
}

/* The technology card is not one of the six services, so it is not part
   of the cycle and takes no active state - but it arrives the same way
   the others do, which means the same observer and the same beats. */
function TechTile({ title, body, rowRun, active }) {
  const ref = useRef(null);
  const { seen } = useInView(ref, 0.52);
  const run = seen || rowRun || reduceMotion();
  return (
    <li ref={ref}
      className={'sv-tile sv-t-tech' + (active ? ' is-on' : '') + (run ? ' is-run' : '')}
      style={{ '--i': 2 }}>
      <div className="sv-visual" aria-hidden="true"><TechPreview /></div>
      <div className="sv-copy">
        <h3>{title}</h3>
        <p>{body}</p>
      </div>
    </li>
  );
}

/* ---------------------------------------------------------------- main */
const Services = () => {
  const { t, lang } = useLang();
  // Owns the .fade-in entrance for the whole section, the same as every
  // other section. Its observer also watches for nodes added later, so
  // the tiles are picked up whether they render on the first pass or not.
  const sectionRef = useScrollAnimation();
  const innerRef = useRef(null);
  const { inView } = useInView(innerRef, 0.05);

  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);

  // The diagram gets its own threshold rather than the shared .fade-in
  // one, which fires at a tenth visible - for something this tall the
  // reveal would be over before it was properly on screen.
  const diagramRef = useRef(null);
  const { seen: diagramSeen } = useInView(diagramRef, 0.55);

  const swipe = useSwipeRow();
  const bentoRef = useRef(null);
  const { seen: rowSeen, inView: rowInView } = useInView(bentoRef, 0.3);
  const zoomed = useZoomed();

  /* A snap target's snap area is its *transformed* border box, and the
     cards arrive by transform - so while that animates, a mandatory
     container keeps re-snapping to a position that is still moving and
     drags the whole row along with it. Measured at exactly the 46px the
     entrance translates by. Snapping starts once the cards have landed. */
  const [rowReady, setRowReady] = useState(false);
  useEffect(() => {
    if (!swipe || !rowSeen) return undefined;
    const id = setTimeout(() => setRowReady(true), SV_CARD_IN_MS);
    return () => clearTimeout(id);
  }, [swipe, rowSeen]);

  const kortit = useCarousel(bentoRef, swipe, rowInView, zoomed);

  // Nothing pulses until the tree has finished assembling. The impulse
  // used to start the moment the component mounted, which is long before
  // the diagram is on screen: it burned through both passes in the dark
  // and the cycle had already moved on, so the first service never got
  // one at all.
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!diagramSeen) return undefined;
    const id = setTimeout(() => setArmed(true), SV_ENTRANCE_MS);
    return () => clearTimeout(id);
  }, [diagramSeen]);

  const u = UI[lang] || UI.fi;
  const items = KEYS.map((key, i) => ({
    key,
    name: t['services_' + (i + 1) + '_title'],
    line: t['services_' + (i + 1) + '_body'],
  }));

  // Two passes of the impulse, then the next service. The pulse length
  // itself lives in Services.css as --sv-pulse; this is that doubled, so
  // the switch lands exactly when the second pass finishes rather than
  // cutting one short.
  //
  // Cycles only while the section is on screen: a timer running against
  // a section nobody is looking at is work with no viewer.
  useEffect(() => {
    if (held || !armed || !inView || reduceMotion()) return undefined;
    const id = setInterval(() => setActive((a) => (a + 1) % KEYS.length), SV_PULSE_MS * 2);
    return () => clearInterval(id);
  }, [held, armed, inView]);

  const pick = (i) => { setHeld(true); setActive(i); };
  const release = () => setHeld(false);

  // web spans two columns and pm spans three, so the row breaks fall
  // after perf and after launch. Changing this order without changing
  // the spans in the CSS leaves a hole in the grid.
  const order = [0, 2, 3, 1, 4, 5];

  return (
    <section id="services" className="services sv" ref={sectionRef}>
      <div className="services-inner" ref={innerRef}>
        <div className="section-tag fade-in stagger-1">
          <span className="tag-label">{t.services_tag}</span>
        </div>

        <h2 className="section-claim services-claim fade-in stagger-1">
          <span className="section-claim-line">{t.services_claim1}</span>
          <span className="section-claim-line stop">{t.services_claim2}</span>
        </h2>

        <p className="section-lede services-lede fade-in stagger-2">{t.services_lede}</p>

        <Diagram
          items={items} active={active} onPick={pick} onRelease={release}
          outerRef={diagramRef} seen={diagramSeen} armed={armed}
        />

        <ul
          className={'sv-bento' + (rowReady ? ' is-ready' : '') + (zoomed ? ' is-zoom' : '')}
          ref={bentoRef}
        >
          {order.map((i, n) => (
            <Tile key={items[i].key} it={items[i]} u={u}
              active={swipe ? kortit.dom === n : active === i}
              onPick={() => pick(i)} onRelease={release} delay={n % 3}
              rowRun={swipe && rowSeen}
              play={swipe ? kortit.soineet.has(n) : undefined} />
          ))}

          {/* Not a seventh service - the six in the diagram are the offer,
              and scripts/schema.js still builds exactly those six. This is
              what they are built with, which is why it sits apart from the
              cycle and takes no active state. */}
          <TechTile title={t.tech_title} body={t.tech_body} rowRun={swipe && rowSeen}
            active={swipe && kortit.dom === order.length}
            />
        </ul>

        {/* A sideways row hides whatever is past the right edge, and the
            peek of the next card is easy to miss. The dots say how many
            there are and how far in you are - the one thing a vertical
            list told you for free. Same red pill as the work scroller,
            and tappable for the same reason: having drawn a position
            indicator, it would be odd if it were the one thing on the
            row you could not use to move. */}
        {swipe && (
          <div className={'sv-dots' + (rowSeen ? ' is-in' : '')}>
            {Array.from({ length: order.length + 1 }, (_, k) => (
              <button
                key={k} type="button"
                className={'sv-dot' + (k === kortit.vpos ? ' is-on' : '')}
                aria-label={`${k + 1} / ${order.length + 1}`}
                onClick={() => kortit.siirry(k)}
              />
            ))}
          </div>
        )}

        {/* The closing statement only, centred like every other head on
            the page. The call to action lives in the hero, at the end of
            the work list and in the sticky button - a fourth one here
            would be asking three times on one screen. */}
        <div className="services-close fade-in stagger-2">
          <p className="services-proof">{t.services_proof}</p>
        </div>
      </div>
    </section>
  );
};

export default Services;
