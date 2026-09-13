import React, { useState } from 'react';
import './About.css';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useLang } from '../useLang';
import { GithubIcon, LinkedinIcon, InstagramIcon } from './Icons';
import { Mark } from './BrandMark';
import { about } from '../content/about';

// Keyed off the entry's id so the content file stays free of components.
var socialIcons = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  instagram: InstagramIcon,
};

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
    { id: 'q1', q: t.about_q1, a: t.about_a1 },
    { id: 'q2', q: t.about_q2, a: t.about_a2 },
    { id: 'q3', q: t.about_q3, a: t.about_a3 },
    { id: 'q4', q: t.about_q4, a: t.about_a4 },
    { id: 'q5', q: t.about_q5, a: t.about_a5 },
    { id: 'q6', q: t.about_q6, a: t.about_a6 },
  ];

  return (
    <section id="about" className="about" ref={sectionRef}>
      <div className="about-inner">
        <div className="section-tag fade-in stagger-1">
          <span className="tag-label">{t.about_tag}</span>
        </div>

        <h2 className="about-claim fade-in stagger-1">
          <span className="about-claim-line">{t.about_claim1}</span>
          <span className="about-claim-line stop">{t.about_claim2}</span>
        </h2>

        <p className="about-lede fade-in stagger-2">{t.about_lede}</p>

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
                  return (
                    <li key={social.id}>
                      <a
                        className="about-social-link"
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
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
                      <p className="ap-a">{item.a}</p>
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
