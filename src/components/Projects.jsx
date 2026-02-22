import React, { useState, useEffect } from 'react';
import './Projects.css';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { api } from '../api';
import { useLang } from '../LanguageContext';

var Projects = function() {
  var state = useState(null);
  var hoveredCard = state[0];
  var setHoveredCard = state[1];
  var projectsState = useState([]);
  var projects = projectsState[0];
  var setProjects = projectsState[1];
  var loadingState = useState(true);
  var loading = loadingState[0];
  var setLoading = loadingState[1];
  var sectionRef = useScrollAnimation();
  var { t } = useLang();

  useEffect(function() {
    api.getProjects().then(function(data) {
      setProjects(data);
      setLoading(false);
    }).catch(function() {
      setLoading(false);
    });
  }, []);

  var renderProject = function(project, index) {
    var isComingSoon = project.status === 'Coming Soon';
    var hasLink = project.link !== null && project.link !== '';
    var hasImage = project.image !== null && project.image !== '';

    return (
      <div
        key={project.id || index}
        className={'project-card' + (hoveredCard === index ? ' hovered' : '') + (hoveredCard !== null && hoveredCard !== index ? ' dimmed' : '') + (isComingSoon ? ' coming-soon' : '')}
        onMouseEnter={function() { setHoveredCard(index); }}
        onMouseLeave={function() { setHoveredCard(null); }}
        onClick={hasLink ? function() { window.open(project.link, '_blank'); } : undefined}
        style={hasLink ? {cursor: 'pointer'} : {}}
      >
        <div className="project-preview">
          {hasImage ? (
            <div className="preview-image-wrapper">
              <img src={project.image} alt={project.title} className="preview-image" />
            </div>
          ) : (
            <div className="preview-placeholder">
              <div className="preview-dots">
                <span className="preview-dot"></span>
                <span className="preview-dot"></span>
                <span className="preview-dot"></span>
              </div>
              <div className="preview-content">
                {isComingSoon ? (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                ) : (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 18 22 12 16 6"/>
                    <polyline points="8 6 2 12 8 18"/>
                  </svg>
                )}
              </div>
            </div>
          )}
          <div className="project-status">
            <span className={'status-dot' + (isComingSoon ? ' status-dot-pending' : '')}></span>
            <span>{project.status}</span>
          </div>
        </div>
        <div className="project-info">
          <h3 className="project-name">{project.title}</h3>
          <p className="project-desc">{project.description}</p>
          {project.tags && project.tags.length > 0 && (
            <div className="project-tags">
              {project.tags.map(function(tag, i) {
                return <span className="project-tag" key={i}>{tag}</span>;
              })}
            </div>
          )}
          {hasLink && (
            <div className="project-link-row">
              <span>{t.projects_view}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7M17 7H7M17 7V17"/>
              </svg>
            </div>
          )}
        </div>
        <div className="project-border-glow"></div>
      </div>
    );
  };

  return (
    <section id="projects" className="projects" ref={sectionRef}>
      <div className="projects-content">
        <div className="projects-header fade-in stagger-1">
          <div className="section-tag">
            <span className="tag-number">03</span>
            <span className="tag-line"></span>
            <span className="tag-label">{t.projects_tag}</span>
          </div>
          <h2 className="projects-title">
            {t.projects_title1} <span className="title-accent">{t.projects_title2}</span>
          </h2>
          <p className="projects-subtitle">{t.projects_subtitle}</p>
        </div>

        <div className="projects-grid fade-in stagger-2">
          {loading ? (
            <p style={{color: 'rgba(255,255,255,0.3)', gridColumn: '1/-1', textAlign: 'center'}}>{t.projects_loading}</p>
          ) : (
            projects.map(function(project, index) {
              return renderProject(project, index);
            })
          )}
        </div>

        <div className="projects-cta fade-in stagger-3">
          <div
            className="projects-github-btn"
            onClick={function() { window.open('https://github.com/baumyyy', '_blank'); }}
            style={{cursor: 'pointer'}}
          >
            <i className="fab fa-github"></i>
            <span>{t.projects_github}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12H19M19 12L12 5M19 12L12 19"/>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;