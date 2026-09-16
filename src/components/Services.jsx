import React from 'react';
import './Services.css';
import { useLang } from '../useLang';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

// Line icons drawn to the same rules as the rest of the identity:
// geometric, one stroke weight, no fill. Two-tone by a consistent rule -
// the structure is white and exactly one element is red, and that element
// is always the part that carries the meaning. Red never outlines the
// whole shape, which would make it decoration rather than a mark.
var ico = {
  viewBox: '0 0 24 24',
  fill: 'none',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
  focusable: 'false',
};

// Websites: the frame is the page, the dots are the browser it lives in.
const WindowIcon = () => (
  <svg className="svc-icon" {...ico}>
    <rect className="ic-base" x="2.5" y="4" width="19" height="16" rx="2" />
    <path className="ic-base" d="M2.5 9h19" />
    <path className="ic-accent" d="M6 6.5h.01M8.5 6.5h.01M11 6.5h.01" />
  </svg>
);

// Branding: two marks overlapping. Identity is the relationship between
// parts, so this is the one icon where the two colours are the subject.
const BrandIcon = () => (
  <svg className="svc-icon" {...ico}>
    <rect className="ic-base" x="9" y="9" width="11" height="11" rx="2" />
    <circle className="ic-accent" cx="9" cy="9" r="5.5" />
  </svg>
);

// Performance: the bolt is the energy, so the bolt is the red part and
// the dial around it stays structural.
const BoltIcon = () => (
  <svg className="svc-icon" {...ico}>
    <circle className="ic-base" cx="12" cy="12" r="9" />
    <path className="ic-accent" d="M13.2 6.5L9 12.6h3.1l-.7 4.9 4.2-6.1h-3.1z" />
  </svg>
);

// SEO: the lens is the looking, the handle is the finding.
const SearchIcon = () => (
  <svg className="svc-icon" {...ico}>
    <circle className="ic-base" cx="10.5" cy="10.5" r="6.5" />
    <path className="ic-accent" d="M15.2 15.2L21 21" />
  </svg>
);

// Launch: the racks are the server, the lights are it running.
const ServerIcon = () => (
  <svg className="svc-icon" {...ico}>
    <rect className="ic-base" x="3" y="4" width="18" height="6.5" rx="1.5" />
    <rect className="ic-base" x="3" y="13.5" width="18" height="6.5" rx="1.5" />
    <path className="ic-accent" d="M6.5 7.25h.01M6.5 16.75h.01" />
  </svg>
);

// Project management: the lines are the work, the ticks are it done.
const PlanIcon = () => (
  <svg className="svc-icon" {...ico}>
    <path className="ic-base" d="M12.5 6.8H21" />
    <path className="ic-base" d="M12.5 17.8H21" />
    <path className="ic-accent" d="M4 6.5l1.6 1.6L9 4.7" />
    <path className="ic-accent" d="M4 17.5l1.6 1.6L9 15.7" />
  </svg>
);

const Services = () => {
  const { t } = useLang();
  const sectionRef = useScrollAnimation();

  const services = [
    { icon: <WindowIcon />, title: t.services_1_title, body: t.services_1_body },
    { icon: <BrandIcon />, title: t.services_2_title, body: t.services_2_body },
    { icon: <BoltIcon />, title: t.services_3_title, body: t.services_3_body },
    { icon: <SearchIcon />, title: t.services_4_title, body: t.services_4_body },
    { icon: <ServerIcon />, title: t.services_5_title, body: t.services_5_body },
    { icon: <PlanIcon />, title: t.services_6_title, body: t.services_6_body },
  ];

  return (
    <section id="services" className="services" ref={sectionRef}>
      <div className="services-inner">
        <div className="section-tag fade-in stagger-1">
          <span className="tag-label">{t.services_tag}</span>
        </div>

        <h2 className="section-claim services-claim fade-in stagger-1">
          <span className="section-claim-line">{t.services_claim1}</span>
          <span className="section-claim-line stop">{t.services_claim2}</span>
        </h2>

        <p className="section-lede services-lede fade-in stagger-2">{t.services_lede}</p>

        {/* Cut-corner cards, the same chamfer the buttons use, so the
            geometry of the identity shows up here too.

            Each card carries its own index as a custom property. That is
            the whole mechanism behind the stack: the index times a step
            is the card's sticky offset, so each one parks a little lower
            than the one before it and the pile builds itself. Doing it in
            CSS with nth-child would mean six rules that have to be kept
            in step with an array of six. */}
        <ul className="svc-grid">
          {services.map((s, i) => (
            <li className={`svc-card fade-in stagger-${(i % 3) + 1}`} key={s.title} style={{ '--i': i }}>
              {s.icon}
              <h3 className="svc-name">{s.title}</h3>
              <p className="svc-line">{s.body}</p>
            </li>
          ))}
        </ul>

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
