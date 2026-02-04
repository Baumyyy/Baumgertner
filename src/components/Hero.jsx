import React from 'react';
import './Hero.css';

const Hero = () => {
  const scrollToProjects = () => {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-links">
          <a href="#home" className="nav-link active">
            <span className="nav-dot"></span>
            Home
          </a>
          <a href="#projects" className="nav-link" onClick={(e) => { e.preventDefault(); scrollToProjects(); }}>
            Projects
          </a>
          <a href="#contact" className="nav-link" onClick={(e) => { e.preventDefault(); scrollToContact(); }}>
            Contact
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-main">
          <div className="hero-left">
            <p className="hero-greeting">Hi, I'm Anthony Baumgertner</p>
            <h1 className="hero-title">
              Software<br />Developer
            </h1>
            <h2 className="hero-subtitle">
              Project manager
            </h2>
            
            <div className="social-links">
              <a href="https://github.com/baumyyy" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="GitHub">
                <i className="fab fa-github"></i>
              </a>
              <a href="https://linkedin.com/in/yourusername" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="LinkedIn">
                <i className="fab fa-linkedin"></i>
              </a>
              <a href="https://instagram.com/baumgertnerr" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>

          <div className="hero-right">
            <p className="hero-description">
              Here will be my phrace soon
            </p>
          </div>
        </div> 
      </section>
    </>
  );
}    


export default Hero;