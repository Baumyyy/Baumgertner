import React, { useState } from 'react';
import './Projects.css';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

var Projects = function() {
  var state = useState(null);
  var hoveredCard = state[0];
  var setHoveredCard = state[1];
  var sectionRef = useScrollAnimation();

  return (
    <section id="projects" className="projects" ref={sectionRef}>
      <div className="projects-content">
        <div className="projects-header fade-in stagger-1">
          <div className="section-tag">
            <span className="tag-number">02</span>
            <span className="tag-line"></span>
            <span className="tag-label">Portfolio</span>
          </div>
          <h2 className="projects-title">
            My <span className="title-accent">Projects</span>
          </h2>
          <p className="projects-subtitle">Check out what I have been working on</p>
        </div>

        <div className="projects-grid fade-in stagger-2">
          <div
            className={'project-card' + (hoveredCard === 0 ? ' hovered' : '') + (hoveredCard !== null && hoveredCard !== 0 ? ' dimmed' : '')}
            onMouseEnter={function() { setHoveredCard(0); }}
            onMouseLeave={function() { setHoveredCard(null); }}
            onClick={function() { window.open('https://github.com/baumyyy/Baumgertner', '_blank'); }}
            style={{cursor: 'pointer'}}
          >
            <div className="project-preview">
              <div className="preview-placeholder">
                <div className="preview-dots">
                  <span className="preview-dot"></span>
                  <span className="preview-dot"></span>
                  <span className="preview-dot"></span>
                </div>
                <div className="preview-content">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 18 22 12 16 6"/>
                    <polyline points="8 6 2 12 8 18"/>
                  </svg>
                </div>
              </div>
              <div className="project-status">
                <span className="status-dot"></span>
                <span>Live</span>
              </div>
            </div>
            <div className="project-info">
              <h3 className="project-name">Anthony.B Portfolio</h3>
              <p className="project-desc">My personal portfolio website showcasing my projects and skills. Built from scratch with modern technologies.</p>
              <div className="project-tags">
                <span className="project-tag">React</span>
                <span className="project-tag">Node.js</span>
                <span className="project-tag">CSS3</span>
                <span className="project-tag">HTML5</span>
              </div>
              <div className="project-link-row">
                <span>View Project</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M17 7H7M17 7V17"/>
                </svg>
              </div>
            </div>
            <div className="project-border-glow"></div>
          </div>

          <div
            className={'project-card' + (hoveredCard === 1 ? ' hovered' : '') + (hoveredCard !== null && hoveredCard !== 1 ? ' dimmed' : '')}
            onMouseEnter={function() { setHoveredCard(1); }}
            onMouseLeave={function() { setHoveredCard(null); }}
          >
            <div className="project-preview">
              <div className="preview-placeholder">
                <div className="preview-dots">
                  <span className="preview-dot"></span>
                  <span className="preview-dot"></span>
                  <span className="preview-dot"></span>
                </div>
                <div className="preview-content">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 18 22 12 16 6"/>
                    <polyline points="8 6 2 12 8 18"/>
                  </svg>
                </div>
              </div>
              <div className="project-status">
                <span className="status-dot"></span>
                <span>Live</span>
              </div>
            </div>
            <div className="project-info">
              <h3 className="project-name">Customer Site Update</h3>
              <p className="project-desc">Custom website update for a local business. Redesigned the frontend for better user experience and performance.</p>
              <div className="project-tags">
                <span className="project-tag">WordPress</span>
                <span className="project-tag">CSS3</span>
                <span className="project-tag">HTML5</span>
              </div>
            </div>
            <div className="project-border-glow"></div>
          </div>

          <div
            className={'project-card coming-soon' + (hoveredCard === 2 ? ' hovered' : '') + (hoveredCard !== null && hoveredCard !== 2 ? ' dimmed' : '')}
            onMouseEnter={function() { setHoveredCard(2); }}
            onMouseLeave={function() { setHoveredCard(null); }}
          >
            <div className="project-preview">
              <div className="preview-placeholder">
                <div className="preview-dots">
                  <span className="preview-dot"></span>
                  <span className="preview-dot"></span>
                  <span className="preview-dot"></span>
                </div>
                <div className="preview-content">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                </div>
              </div>
              <div className="project-status">
                <span className="status-dot status-dot-pending"></span>
                <span>Coming Soon</span>
              </div>
            </div>
            <div className="project-info">
              <h3 className="project-name">This Could Be Your Project</h3>
              <p className="project-desc">Contact me to collaborate on exciting projects! Always open to new ideas and challenges.</p>
            </div>
            <div className="project-border-glow"></div>
          </div>
        </div>

        <div className="projects-cta fade-in stagger-3">
          <div
            className="projects-github-btn"
            onClick={function() { window.open('https://github.com/baumyyy', '_blank'); }}
            style={{cursor: 'pointer'}}
          >
            <i className="fab fa-github"></i>
            <span>See More on GitHub</span>
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