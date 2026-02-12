import React, { useState } from 'react';
import './Projects.css';

const projects = [
  {
    title: 'Anthony.B Portfolio',
    description: 'My personal portfolio website showcasing my projects and skills. Built from scratch with modern technologies.',
    tags: ['React', 'Node.js', 'CSS3', 'HTML5'],
    status: 'Live',
    link: 'https://github.com/baumyyy/Baumgertner',
    image: null
  },
  {
    title: 'Customer Site Update',
    description: 'Custom website update for a local business. Redesigned the frontend for better user experience and performance.',
    tags: ['WordPress', 'CSS3', 'HTML5'],
    status: 'Live',
    link: null,
    image: null
  },
  {
    title: 'This Could Be Your Project',
    description: 'Contact me to collaborate on exciting projects! Always open to new ideas and challenges.',
    tags: [],
    status: 'Coming Soon',
    link: null,
    image: null
  }
];

const Projects = () => {
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <section id="projects" className="projects">
      <div className="projects-content">
        <div className="projects-header">
          <div className="section-tag">
            <span className="tag-number">03</span>
            <span className="tag-line"></span>
            <span className="tag-label">Portfolio</span>
          </div>
          <h2 className="projects-title">
            My <span className="title-accent">Projects</span>
          </h2>
          <p className="projects-subtitle">Check out what I have been working on</p>
        </div>

        <div className="projects-grid">
          {projects.map(function(project, index) {
            var isComingSoon = project.status === 'Coming Soon';
            var CardTag = project.link ? 'a' : 'div';
            var cardProps = project.link ? {
              href: project.link,
              target: '_blank',
              rel: 'noopener noreferrer'
            } : {};

            return (
              <CardTag
                key={index}
                className={'project-card' + (hoveredCard === index ? ' hovered' : '') + (hoveredCard !== null && hoveredCard !== index ? ' dimmed' : '') + (isComingSoon ? ' coming-soon' : '')}
                onMouseEnter={function() { setHoveredCard(index); }}
                onMouseLeave={function() { setHoveredCard(null); }}
                {...cardProps}
              >
                <div className="project-preview">
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
                  <div className="project-status">
                    <span className={'status-dot' + (isComingSoon ? ' status-dot-pending' : '')}></span>
                    <span>{project.status}</span>
                  </div>
                </div>

                <div className="project-info">
                  <h3 className="project-name">{project.title}</h3>
                  <p className="project-desc">{project.description}</p>

                  {project.tags.length > 0 && (
                    <div className="project-tags">
                      {project.tags.map(function(tag, i) {
                        return (
                          <span className="project-tag" key={i}>{tag}</span>
                        );
                      })}
                    </div>
                  )}

                  {project.link && (
                    <div className="project-link-row">
                      <span>View Project</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 17L17 7M17 7H7M17 7V17"/>
                      </svg>
                    </div>
                  )}
                </div>

                <div className="project-border-glow"></div>
              </CardTag>
            );
          })}
        </div>

        <div className="projects-cta">
          
          <a
            href="https://github.com/baumyyy"
            target="_blank"
            rel="noopener noreferrer"
            className="projects-github-btn"
          >
            <i className="fab fa-github"></i>
            <span>See More on GitHub</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12H19M19 12L12 5M19 12L12 19"/>
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Projects;