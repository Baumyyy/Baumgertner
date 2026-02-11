import React, { useState, useEffect } from 'react';
import './Hero.css';

const Hero = () => {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');
    
    const observerOptions = {
      threshold: 0.3,
      rootMargin: '0px 0px -50% 0px'
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          setActiveSection(id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach((section) => observer.observe(section));
    return () => sections.forEach((section) => observer.unobserve(section));
  }, []);

  const handleClick = (e, targetId) => {
    e.preventDefault();
    if (targetId === 'home') {
      const container = document.querySelector('.aurora-container');
      if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(targetId);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-links">
          <a href="#home" className={`nav-link ${activeSection === 'home' ? 'active' : ''}`} onClick={(e) => handleClick(e, 'home')}>
            <span className="nav-dot"></span>Home
          </a>
          <a href="#projects" className={`nav-link ${activeSection === 'projects' ? 'active' : ''}`} onClick={(e) => handleClick(e, 'projects')}>
            <span className="nav-dot"></span>Projects
          </a>
          <a href="#contact" className={`nav-link ${activeSection === 'contact' ? 'active' : ''}`} onClick={(e) => handleClick(e, 'contact')}>
            <span className="nav-dot"></span>Contact
          </a>
        </div>
      </nav>

      <section id="home" className="hero">
        {/* Particles */}
        <div className="hero-particles">
          <div className="particle p1"></div>
          <div className="particle p2"></div>
          <div className="particle p3"></div>
          <div className="particle p4"></div>
          <div className="particle p5"></div>
          <div className="particle p6"></div>
        </div>

        {/* Glow line */}
        <div className="hero-glow-line"></div>

        <div className="hero-main">
          <div className="hero-left">
            <div className="hero-intro">
              <span className="intro-number">01</span>
              <span className="intro-line"></span>
              <span className="intro-text">Introduction</span>
            </div>

            <h1 className="hero-name">
              <span className="greeting-small">Hello, I'm</span>
              <span className="name-first">Anthony</span>
              <span className="name-last">Baumgertner</span>
            </h1>

            <div className="hero-title-bar">
              <span className="title-item">Student Software Engineer</span>
              <span className="title-divider"></span>
              <span className="title-item">Project Manager</span>
              <span className="title-divider"></span>
              <span className="title-item">Beginner Frontend Dev</span>
            </div>

            <div className="hero-actions">
              <a href="#projects" className="btn-primary" onClick={(e) => handleClick(e, 'projects')}>
                Explore Work
                <span className="btn-arrow">→</span>
              </a>
              <a href="#contact" className="btn-ghost" onClick={(e) => handleClick(e, 'contact')}>
                Contact Me
              </a>
            </div>

            <div className="social-links">
              <a href="https://github.com/baumyyy" target="_blank" rel="noopener noreferrer" className="social-link"><i className="fab fa-github"></i></a>
              <a href="https://linkedin.com/in/anthony-baumgertner" target="_blank" rel="noopener noreferrer" className="social-link"><i className="fab fa-linkedin"></i></a>
              <a href="https://instagram.com/baumgertnerr" target="_blank" rel="noopener noreferrer" className="social-link"><i className="fab fa-instagram"></i></a>
            </div>
          </div>

          <div className="hero-right">
            <div className="badge-wrapper">
              <div className="badge-lanyard">
                <div className="lanyard-v"></div>
              </div>

              <div className="badge-card">
                <div className="badge-corner badge-corner-tl"></div>
                <div className="badge-corner badge-corner-tr"></div>
                <div className="badge-corner badge-corner-bl"></div>
                <div className="badge-corner badge-corner-br"></div>

                <div className="badge-photo">
                  <div className="photo-scanline"></div>
                  <span className="photo-text">Photo</span>
                </div>

                <div className="badge-content">
                  <h3 className="badge-name">Anthony Baumgertner</h3>
                  <p className="badge-role-text">Software Engineer & Project Manager</p>
                  
                  <div className="badge-stats">
                    <div className="stat">
                      <span className="stat-value">22</span>
                      <span className="stat-label">Age</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">1.5</span>
                      <span className="stat-label">Years Exp</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">3</span>
                      <span className="stat-label">Languages</span>
                    </div>
                  </div>
                </div>

                <div className="badge-footer">
                  <span className="status-indicator"></span>
                  <span className="status-text">Available for projects</span>
                </div>

                <div className="badge-shine"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;