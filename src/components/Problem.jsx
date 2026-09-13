import React from 'react';
import './Problem.css';
import { useLang } from '../useLang';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { Wordmark } from './BrandMark';

// One generic template layout: a header bar, a hero block, three cards and
// a footer. Drawn rather than photographed, and repeated so the sameness
// is the point - the reader sees the argument before reading it.
const TemplateSketch = () => (
  <svg className="sameness-tile" viewBox="0 0 100 76" aria-hidden="true" focusable="false">
    <rect x="0.5" y="0.5" width="99" height="75" rx="3" className="sk-frame" />
    <rect x="8" y="8" width="18" height="3" rx="1.5" className="sk-mark" />
    <rect x="62" y="8.5" width="9" height="2" rx="1" className="sk-dim" />
    <rect x="74" y="8.5" width="9" height="2" rx="1" className="sk-dim" />
    <rect x="8" y="19" width="84" height="24" rx="2" className="sk-block" />
    <rect x="8" y="48" width="25" height="14" rx="2" className="sk-block" />
    <rect x="37.5" y="48" width="25" height="14" rx="2" className="sk-block" />
    <rect x="67" y="48" width="25" height="14" rx="2" className="sk-block" />
    <rect x="8" y="67" width="40" height="2" rx="1" className="sk-dim" />
  </svg>
);

const SamenessRow = () => (
  <div className="sameness-row">
    {Array.from({ length: 4 }, (_, n) => <TemplateSketch key={n} />)}
  </div>
);

// Slow: a request waterfall. Bars keep starting long after the first one
// finished, which is what a page builder's network panel actually looks
// like. Horizontal and staggered, so it does not read as a second version
// of the sameness row beside it.
const LoadWaterfall = () => {
  const bars = [
    [0, 46], [7, 34], [16, 40], [23, 28], [32, 52], [43, 31],
    [55, 42], [68, 36], [82, 48], [97, 30],
  ];
  return (
    <svg className="diagram" viewBox="0 0 140 46" aria-hidden="true" focusable="false">
      {bars.map(([x, w], i) => (
        <rect
          key={i}
          x={x}
          y={i * 4.5 + 1}
          width={w}
          height="2.6"
          rx="1.3"
          /* The tail turns red: past a point the requests are no longer
             the page loading, they are the page costing you visitors. */
          className={i >= 6 ? 'dg-bar dg-bar-late' : 'dg-bar'}
          style={{ opacity: 0.5 - i * 0.032 }}
        />
      ))}
    </svg>
  );
};

// Ownership: your site as a solid block sitting inside a platform's
// boundary, with the boundary closed by a lock. A containment shape, not
// a row - the third diagram has to differ from the first two.
const LockedIn = () => (
  <svg className="diagram" viewBox="0 0 100 54" aria-hidden="true" focusable="false">
    <rect x="0.5" y="0.5" width="99" height="53" rx="3" className="dg-frame dg-dashed" />
    <rect x="14" y="12" width="44" height="30" rx="2" className="dg-solid" />
    <rect x="20" y="19" width="26" height="2" rx="1" className="dg-dim" />
    <rect x="20" y="25" width="32" height="2" rx="1" className="dg-dim" />
    <rect x="20" y="31" width="18" height="2" rx="1" className="dg-dim" />
    <g>
      <path d="M74 25v-4a5 5 0 0 1 10 0v4" className="dg-shackle" />
      <rect x="71" y="25" width="16" height="13" rx="2" className="dg-body" />
    </g>
  </svg>
);

const Problem = () => {
  const { t } = useLang();
  const sectionRef = useScrollAnimation();

  // All three are shown at once, so there is no disclosure state to keep.
  // Three columns fit the argument in one pass, which was the point of
  // collapsing them in the first place.
  const points = [
    { title: t.problem_1_title, body: t.problem_1_body, caption: t.problem_1_caption, figure: <SamenessRow /> },
    { title: t.problem_2_title, body: t.problem_2_body, caption: t.problem_2_caption, figure: <LoadWaterfall /> },
    { title: t.problem_3_title, body: t.problem_3_body, caption: t.problem_3_caption, figure: <LockedIn /> },
  ];

  return (
    <section id="problem" className="problem" ref={sectionRef}>
      <div className="problem-grid">
        <div className="problem-aside">
          <div className="section-tag fade-in stagger-1">
            <span className="tag-label">{t.problem_tag}</span>
          </div>

          <h2 className="section-claim problem-claim fade-in stagger-1">
            <span className="section-claim-line">{t.problem_claim1}</span>
            <span className="section-claim-line stop">{t.problem_claim2}</span>
          </h2>

          <p className="section-lede problem-lede fade-in stagger-2">{t.problem_lede}</p>
        </div>

        {/* A list, because these are three parallel items rather than a
            sequence of sections. */}
        <ul className="problem-points">
          {points.map((p, i) => (
            <li className={`problem-point fade-in stagger-${i + 1}`} key={p.title}>
              <h3 className="problem-point-title stop">{p.title}</h3>
              <p className="problem-point-body">{p.body}</p>
              <figure className="problem-figure">
                <div className="problem-figure-art" aria-hidden="true">{p.figure}</div>
                <figcaption className="problem-figure-caption">{p.caption}</figcaption>
              </figure>
            </li>
          ))}
        </ul>

        {/* The turn out of the complaint and into the answer. The wordmark
            is the sentence's subject, so it is set as artwork with the
            name carried as real text beside it - a screen reader reads one
            clean sentence, not a gap. */}
        <p className="problem-turn fade-in stagger-3">
          <span className="problem-turn-line">{t.problem_turn_pre}</span>
          <span className="problem-turn-mark">
            <span className="sr-only">Baumgertner</span>
            <Wordmark className="problem-turn-wordmark" decorative />
          </span>
          <span className="problem-turn-line">{t.problem_turn_post}</span>
        </p>
      </div>
    </section>
  );
};

export default Problem;
