import React from 'react';
import './Projects.css';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const Projects = () => {
  const [titleRef, titleVisible] = useScrollAnimation({ threshold: 0.3 });
  const [subtitleRef, subtitleVisible] = useScrollAnimation({ threshold: 0.3 });

  const projects = [
    {
      id: 1,
      title: 'Project One',
      description: 'Description of the project',
      status: 'Coming Soon',
      tags: ['React', 'Node.js', 'MongoDB']
    },
    {
      id: 2,
      title: 'Project Two',
      description: 'Description of the project',
      status: 'Coming Soon',
      tags: ['JavaScript', 'CSS3', 'HTML5']
    },
    {
      id: 3,
      title: 'Project Three',
      description: 'Description of the project',
      status: 'Coming Soon',
      tags: ['React', 'Python', 'Git']
    }
  ];

  return (
    <section id="projects" className="projects-section">
      <div className="projects-container">
        <h2 
          ref={titleRef}
          className={`projects-title fade-in ${titleVisible ? 'visible' : ''}`}
        >
          My Projects
        </h2>
        <p 
          ref={subtitleRef}
          className={`projects-subtitle fade-in ${subtitleVisible ? 'visible' : ''}`}
        >
          Check out what I've been working on
        </p>

        <div className="projects-grid">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>

        <div className="projects-github-link">
          <a href="https://github.com/baumyyy" target="_blank" rel="noopener noreferrer" className="github-btn">
            See More Projects on Git
            <i className="fab fa-github"></i>
          </a>
        </div>
      </div>
    </section>
  );
};

// Own component for project cards
const ProjectCard = ({ project, index }) => {
  const [cardRef, cardVisible] = useScrollAnimation({ threshold: 0.2 });

  return (
    <div 
      ref={cardRef}
      className={`project-card fade-in-up fade-in-delay-${Math.min(index % 3 + 1, 3)} ${cardVisible ? 'visible' : ''}`}
    >
      <div className="project-image-placeholder">
        <span className="coming-soon-badge">{project.status}</span>
      </div>
      
      <div className="project-content">
        <h3 className="project-title">{project.title}</h3>
        <p className="project-description">{project.description}</p>
        
        <div className="project-tags">
          {project.tags.map((tag, i) => (
            <span key={i} className="tag">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;

