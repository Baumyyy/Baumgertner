import React, { useState } from 'react';
import './About.css';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useLang } from '../useLang';
import { GithubIcon, LinkedinIcon, InstagramIcon, MailIcon } from './Icons';
import { Mark } from './BrandMark';
import { about } from '../content/about';

// Keyed off the entry's id so the content file stays free of components.
var socialIcons = {
  email: MailIcon,
  github: GithubIcon,
  linkedin: LinkedinIcon,
  instagram: InstagramIcon,
};

// One figure per answer, drawn to the same rules as the problem section:
// the structure in currentColor at low opacity, and exactly one element
// in the signal red - the one the answer is actually about.

// Scope, design, build, live: one line straight through. Nothing is
// handed between hands, so the red is the end of it rather than a seam.
const FlowFigure = () => (
  <svg className="diagram" viewBox="0 0 152 44" aria-hidden="true" focusable="false">
    <path d="M22 22h18M58 22h18M94 22h16" className="dg-link" />
    <rect x="4.5" y="14.5" width="17" height="15" rx="2.5" className="dg-node" />
    <rect x="40.5" y="14.5" width="17" height="15" rx="2.5" className="dg-node" />
    <rect x="76.5" y="14.5" width="17" height="15" rx="2.5" className="dg-node" />
    <rect x="110.5" y="9.5" width="37" height="25" rx="2.5" className="dg-node-on" />
    <rect x="115" y="14" width="28" height="3" rx="1.5" className="dg-mark" />
    <rect x="115" y="21" width="19" height="2" rx="1" className="dg-dim" />
    <rect x="115" y="26" width="24" height="2" rx="1" className="dg-dim" />
  </svg>
);

// What the visitor does is the red one: the message they send is the
// only step in the sequence that is theirs.
const ReplyFigure = () => (
  <svg className="diagram" viewBox="0 0 152 44" aria-hidden="true" focusable="false">
    <path d="M38 22C52 22 52 22 66 22M84 22h14M116 22h10" className="dg-link" />
    <g>
      <rect x="4.5" y="12.5" width="33" height="20" rx="2.5" className="dg-node-on" />
      <path d="M8 16l13 9 13-9" className="dg-link" style={{ opacity: 0.55 }} />
    </g>
    <circle cx="75" cy="22" r="8.5" className="dg-node" />
    <path d="M71 22h8M71 18.5h8M71 25.5h5" className="dg-link" style={{ opacity: 0.45 }} />
    <rect x="98.5" y="14.5" width="17" height="15" rx="2.5" className="dg-node" />
    <path d="M102 19h10M102 23h10M102 26h6" className="dg-link" style={{ opacity: 0.45 }} />
    <rect x="126.5" y="10.5" width="21" height="23" rx="2.5" className="dg-node" />
    <rect x="130" y="15" width="14" height="2" rx="1" className="dg-dim" />
    <rect x="130" y="20" width="14" height="2" rx="1" className="dg-dim" />
    <rect x="130" y="25" width="9" height="2" rx="1" className="dg-dim" />
  </svg>
);

// The rail runs past the span on both sides: four to eight weeks is where
// most land, not a promise that nothing ever sits outside it.
const TimelineFigure = () => (
  <svg className="diagram" viewBox="0 0 152 44" aria-hidden="true" focusable="false">
    <path d="M6 26h140" className="dg-link" />
    {[6, 40, 74, 108, 142].map((x, i) => (
      <path key={i} d={'M' + x + ' 22v8'} className="dg-link" />
    ))}
    <rect x="40" y="14" width="68" height="7" rx="3.5" className="dg-mark" />
    <rect x="6" y="16.5" width="30" height="2" rx="1" className="dg-dim" />
    <rect x="112" y="16.5" width="34" height="2" rx="1" className="dg-dim" />
  </svg>
);

// Every strand of the work converging on one node, and one line out of
// it. The node is the answer, so the node is the red.
const SoloFigure = () => (
  <svg className="diagram" viewBox="0 0 152 44" aria-hidden="true" focusable="false">
    <path
      d="M26 8C46 8 48 22 62 22M26 18C42 18 48 21 62 21M26 28C42 28 48 23 62 23M26 38C46 38 48 22 62 22"
      className="dg-link"
    />
    <path d="M90 22h14" className="dg-link" />
    {[4, 14, 24, 34].map((y, i) => (
      <rect key={i} x="4.5" y={y + 0.5} width="21" height="8" rx="2" className="dg-node" />
    ))}
    <rect x="62.5" y="10.5" width="27" height="23" rx="4" className="dg-node-on" />
    <circle cx="76" cy="22" r="5" className="dg-mark" />
    <rect x="104.5" y="8.5" width="43" height="27" rx="2.5" className="dg-node" />
    <path d="M104.5 15.5h43" className="dg-link" />
    <rect x="109" y="20" width="24" height="3" rx="1.5" className="dg-node-fill" />
    <rect x="109" y="26" width="34" height="3" rx="1.5" className="dg-node-fill" />
  </svg>
);

// The old page is drawn as the template it is - dashed, because it was
// never really yours - and the new one carries the mark.
const ReplaceFigure = () => (
  <svg className="diagram" viewBox="0 0 152 44" aria-hidden="true" focusable="false">
    <rect x="4.5" y="6.5" width="52" height="31" rx="2.5" className="dg-frame dg-dashed" />
    <rect x="10" y="12" width="16" height="3" rx="1.5" className="dg-dim" />
    <rect x="10" y="19" width="41" height="8" rx="2" className="dg-solid" />
    <rect x="10" y="30" width="12" height="3" rx="1.5" className="dg-solid" />
    <rect x="25" y="30" width="12" height="3" rx="1.5" className="dg-solid" />
    <rect x="40" y="30" width="11" height="3" rx="1.5" className="dg-solid" />

    <path d="M64 22h18" className="dg-link" />
    <path d="M78 18.5l4 3.5-4 3.5" className="dg-link" />

    <rect x="90.5" y="6.5" width="57" height="31" rx="2.5" className="dg-node" />
    <rect x="96" y="12" width="20" height="3" rx="1.5" className="dg-mark" />
    <rect x="96" y="19" width="46" height="8" rx="2" className="dg-node-fill" />
    <rect x="96" y="30" width="30" height="3" rx="1.5" className="dg-node-fill" />
  </svg>
);

// Three options weighed, one picked, the finished site put on it. The
// pick is the red - that is the part that is a decision rather than a
// default.
const HostingFigure = () => (
  <svg className="diagram" viewBox="0 0 152 44" aria-hidden="true" focusable="false">
    <rect x="4.5" y="4.5" width="46" height="10" rx="2.5" className="dg-node" />
    <rect x="4.5" y="17.5" width="46" height="10" rx="2.5" className="dg-node-on" />
    <rect x="4.5" y="30.5" width="46" height="10" rx="2.5" className="dg-node" />
    <rect x="9" y="8" width="18" height="3" rx="1.5" className="dg-dim" />
    <rect x="9" y="21" width="24" height="3" rx="1.5" className="dg-mark" />
    <rect x="9" y="34" width="14" height="3" rx="1.5" className="dg-dim" />

    <path d="M52 22h20" className="dg-link" />
    <path d="M68 18.5l4 3.5-4 3.5" className="dg-link" />

    <rect x="80.5" y="6.5" width="30" height="9" rx="2" className="dg-node" />
    <rect x="80.5" y="18.5" width="30" height="9" rx="2" className="dg-node" />
    <rect x="80.5" y="30.5" width="30" height="9" rx="2" className="dg-node" />
    <circle cx="86" cy="11" r="1.6" className="dg-dim" />
    <circle cx="86" cy="23" r="1.6" className="dg-dim" />
    <circle cx="86" cy="35" r="1.6" className="dg-dim" />

    <path d="M112 22h10" className="dg-link" />
    <circle cx="134" cy="22" r="12.5" className="dg-node" />
    <path d="M121.5 22h25M134 9.5c5 5 5 20 0 25M134 9.5c-5 5-5 20 0 25" className="dg-link" />
  </svg>
);

var About = function() {
  var sectionRef = useScrollAnimation();
  var { t } = useLang();

  // Several at once rather than one at a time. These are short answers
  // people compare against each other, and closing the one you just read
  // to open the next is a cost with nothing bought by it - unlike the
  // project list, where the panels are tall enough to matter.
  var openState = useState([]);
  var open = openState[0];
  var setOpen = openState[1];

  var toggle = function(id) {
    setOpen(function(prev) {
      return prev.indexOf(id) === -1
        ? prev.concat([id])
        : prev.filter(function(x) { return x !== id; });
    });
  };

  // Ordered the way a client meets them: what happens, how it happens,
  // how long it takes, who does it, and then the two that only matter
  // once they are already interested.
  var questions = [
    { id: 'q1', q: t.about_q1, a: t.about_a1, figure: <FlowFigure /> },
    { id: 'q2', q: t.about_q2, a: t.about_a2, figure: <ReplyFigure /> },
    { id: 'q3', q: t.about_q3, a: t.about_a3, figure: <TimelineFigure /> },
    { id: 'q4', q: t.about_q4, a: t.about_a4, figure: <SoloFigure /> },
    { id: 'q5', q: t.about_q5, a: t.about_a5, figure: <ReplaceFigure /> },
    { id: 'q6', q: t.about_q6, a: t.about_a6, figure: <HostingFigure /> },
  ];

  return (
    <section id="about" className="about" ref={sectionRef}>
      <div className="about-inner">
        <div className="section-tag fade-in stagger-1">
          <span className="tag-label">{t.about_tag}</span>
        </div>

        <h2 className="section-claim about-claim fade-in stagger-1">
          <span className="section-claim-line">{t.about_claim1}</span>
          <span className="section-claim-line stop">{t.about_claim2}</span>
        </h2>

        <p className="section-lede about-lede fade-in stagger-2">{t.about_lede}</p>

        <div className="about-body fade-in stagger-2">
          {/* The frame is drawn at the shape and size the photograph will
              take, so putting the file in place later moves nothing else
              on the page. */}
          <figure className="about-portrait">
            {about.portrait ? (
              <img className="about-portrait-img" src={about.portrait} alt="" />
            ) : (
              <Mark className="about-portrait-mark" decorative />
            )}
          </figure>

          <div className="about-text">
            <p className="about-para">{t.about_body1}</p>
            <p className="about-para">{t.about_body2}</p>

            <dl className="about-facts">
              <div className="about-fact">
                <dt>{t.about_education_label}</dt>
                <dd>
                  {t.about_education_degree}
                  <span className="about-fact-sub">{t.about_education_school}</span>
                </dd>
              </div>
              <div className="about-fact">
                <dt>{t.about_location_label}</dt>
                <dd>{t.location_value}</dd>
              </div>
            </dl>

            <div className="about-social">
              <p className="about-social-label">{t.about_social_label}</p>
              <ul className="about-social-list">
                {about.socials.map(function(social) {
                  var Icon = socialIcons[social.id];
                  // mailto: hands off to a mail client, so a new tab and
                  // a noopener relationship mean nothing there.
                  var external = social.href.indexOf('http') === 0;
                  return (
                    <li key={social.id}>
                      <a
                        className="about-social-link"
                        href={social.href}
                        target={external ? '_blank' : undefined}
                        rel={external ? 'noopener noreferrer' : undefined}
                      >
                        {Icon ? <Icon /> : null}
                        {/* The handle alone does not say which platform
                            it belongs to once the icon is skipped. */}
                        <span className="sr-only">{social.label + ': '}</span>
                        {social.handle}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        {/* Part of this section rather than a second one: a label and a
            list, with no claim of its own. A display heading here would
            announce a new section, which is exactly what these questions
            are not - they are the rest of the same introduction. */}
        <div className="about-approach fade-in stagger-3">
          <p className="about-approach-label">{t.about_approach_tag}</p>

          <ul className="ap-list">
            {questions.map(function(item) {
              var isOpen = open.indexOf(item.id) !== -1;
              var panelId = 'ap-panel-' + item.id;
              var buttonId = 'ap-button-' + item.id;

              return (
                <li className={'ap-item' + (isOpen ? ' is-open' : '')} key={item.id}>
                  <h3 className="ap-heading">
                    <button
                      type="button"
                      id={buttonId}
                      className="ap-trigger"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={function() { toggle(item.id); }}
                    >
                      <span className="ap-q">{item.q}</span>
                      <span className="ap-sign" aria-hidden="true"></span>
                    </button>
                  </h3>

                  {/* 0fr to 1fr is what makes this animate: height:auto
                      cannot be transitioned. visibility keeps a closed
                      answer out of the tab order and the a11y tree. */}
                  <div
                    className="ap-panel"
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                  >
                    <div className="ap-panel-inner">
                      <div className="ap-body">
                        <p className="ap-a">{item.a}</p>
                        <figure className="ap-figure">{item.figure}</figure>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default About;
