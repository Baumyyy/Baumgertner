import React, { useState, useRef } from 'react';
import './Projects.css';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useLang } from '../useLang';
import { useContactPanel } from '../useContactPanel';
import { GithubIcon } from './Icons';
import { Wordmark } from './BrandMark';
import WorkCarousel from './WorkCarousel';
import { work } from '../content/work';

// How far from the pointer the notification sits.
var HINT_X = 20;

var WorkRow = function({ project, isOpen, onToggle, statusLabel, t, index }) {
  var itemRef = useRef(null);
  var hintRef = useRef(null);
  var panelId = 'wk-panel-' + project.slug;
  var buttonId = 'wk-button-' + project.slug;

  // Written straight onto the node instead of through state. A pointermove
  // that went through React would re-render the whole list on every sample
  // the mouse produces - dozens a second, for a label that is not part of
  // the component's data at all.
  var place = function(e) {
    if (e.pointerType === 'touch') return;
    var hint = hintRef.current;
    var item = itemRef.current;
    if (!hint || !item) return;

    var r = item.getBoundingClientRect();
    var x = e.clientX - r.left;
    var w = hint.offsetWidth;

    // Flips to the left of the pointer near the right edge, so the
    // notification never hangs off the end of the row.
    var left = x + HINT_X + w > r.width ? x - HINT_X - w : x + HINT_X;

    hint.style.setProperty('--hx', left + 'px');
    hint.style.setProperty('--hy', (e.clientY - r.top) + 'px');
  };

  return (
    <li
      className={'wk-item' + (isOpen ? ' is-open' : '') + ' fade-in stagger-' + ((index % 3) + 1)}
      ref={itemRef}
    >
      <h3 className="wk-heading">
        <button
          type="button"
          id={buttonId}
          className="wk-trigger"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          onPointerEnter={place}
          onPointerMove={place}
        >
          {/* A real mark where there is one, the name set as type where
              there is not. The name is always present as text for screen
              readers either way. */}
          <span className="wk-brand">
            <span className="sr-only">{project.name}</span>
            {project.logo === 'wordmark' ? (
              <Wordmark className="wk-wordmark" decorative />
            ) : project.logo ? (
              <img className="wk-logo-img" src={project.logo} alt="" />
            ) : (
              <span className="wk-name" aria-hidden="true">{project.name}</span>
            )}
          </span>

          <span className={'wk-status is-' + project.status}>
            <span className="wk-status-dot" aria-hidden="true"></span>
            {statusLabel[project.status] || project.status}
          </span>

          <span className="wk-sign" aria-hidden="true"></span>
        </button>
      </h3>

      {/* Rides the pointer across a closed row. It sits outside the button
          so the button stays a plain grid of three things, and it is inert
          so it can never eat the click it is inviting. */}
      <span className="wk-cursor-hint" ref={hintRef} aria-hidden="true">
        <span className="wk-cursor-chip">{t.projects_open_hint}</span>
      </span>

      {/* Collapsed to zero height and hidden from assistive technology,
          but not display:none - that cannot be transitioned, and the
          panel has to animate open. */}
      <div
        className="wk-panel"
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
      >
        <div className="wk-panel-inner">
          <WorkCarousel shots={project.shots} active={isOpen} label={project.name} />

          {/* The information bar under the images: what it is on the left,
              why it matters in the middle, the hard facts on the right. */}
          <div className="wk-meta">
            <div className="wk-meta-main">
              <p className="wk-title">{project.title}</p>
              <ul className="wk-tags">
                {project.tags.map(function(tag) {
                  return <li className="wk-tag" key={tag}>{tag}</li>;
                })}
              </ul>
            </div>

            <div className="wk-meta-body">
              {project.body.map(function(para) {
                return <p key={para.slice(0, 32)}>{para}</p>;
              })}

              {project.feedback && (
                <figure className="wk-feedback">
                  <blockquote>{project.feedback.quote}</blockquote>
                  <figcaption>
                    {project.feedback.name}
                    {project.feedback.role ? ' · ' + project.feedback.role : ''}
                  </figcaption>
                </figure>
              )}
            </div>

            <dl className="wk-facts">
              <div className="wk-fact">
                <dt>{t.projects_industry}</dt>
                <dd>{project.industry}</dd>
              </div>
              {project.site && (
                <div className="wk-fact">
                  <dt>{t.projects_live_site}</dt>
                  <dd>
                    <a href={project.site.href} target="_blank" rel="noopener noreferrer">
                      {project.site.label}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </li>
  );
};

var Projects = function() {
  var sectionRef = useScrollAnimation();
  var { t } = useLang();
  var openContact = useContactPanel().open;

  // One open at a time: opening a project closes the one before it, so
  // the section stays roughly the same height however many projects the
  // list grows to.
  var openState = useState(null);
  var open = openState[0];
  var setOpen = openState[1];

  var statusLabel = {
    live: t.projects_status_live,
    progress: t.projects_status_progress,
  };

  return (
    <section id="projects" className="projects" ref={sectionRef}>
      <div className="projects-inner">
        <div className="section-tag fade-in stagger-1">
          <span className="tag-label">{t.projects_tag}</span>
        </div>

        <h2 className="section-claim projects-claim fade-in stagger-1">
          <span className="section-claim-line">{t.projects_claim1}</span>
          <span className="section-claim-line stop">{t.projects_claim2}</span>
        </h2>

        <p className="section-lede projects-lede fade-in stagger-2">{t.projects_lede}</p>

        <ul className="wk-list">
          {work.map(function(project, i) {
            return (
              <WorkRow
                key={project.slug}
                project={project}
                index={i}
                isOpen={open === project.slug}
                onToggle={function() {
                  setOpen(open === project.slug ? null : project.slug);
                }}
                statusLabel={statusLabel}
                t={t}
              />
            );
          })}
        </ul>

        {/* The list ends on an invitation rather than a filler row: an
            empty slot sitting among real work reads as a gap in it. Set
            the way the problem section turns - the page reads left
            aligned the whole way down, then squares up to the middle for
            the one thing that is not a statement about the work. */}
        <div className="projects-outro fade-in stagger-2">
          <p className="projects-outro-claim">
            <span className="projects-outro-line">{t.projects_outro1}</span>
            <span className="projects-outro-line stop">{t.projects_outro2}</span>
          </p>
          <div className="projects-outro-actions">
            <a
              className="btn-secondary"
              href="https://github.com/baumyyy"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GithubIcon />
              {t.projects_github}
            </a>
            <button type="button" className="btn-primary" onClick={openContact}>
              {t.projects_cta}
              <span className="btn-arrow">→</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;
