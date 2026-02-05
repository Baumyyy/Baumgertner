import React from 'react';
import './Projects.css';

const Projects = () => {
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
        <h2 className="projects-title">My Projects</h2>
        <p className="projects-subtitle">
          Check out what I've been working on
        </p>

        <div className="projects-grid">
          {projects.map((project) => (
            <div key={project.id} className="project-card">
              <div className="project-image-placeholder">
                <span className="coming-soon-badge">{project.status}</span>
              </div>
              
              <div className="project-content">
                <h3 className="project-title">{project.title}</h3>
                <p className="project-description">{project.description}</p>
                
                <div className="project-tags">
                  {project.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
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

export default Projects;