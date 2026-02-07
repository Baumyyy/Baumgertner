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
    
    sections.forEach((section) => {
      observer.observe(section);
    });

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  const handleClick = (e, targetId) => {
    e.preventDefault();
    
    if (targetId === 'home') {
      const container = document.querySelector('.aurora-container');
      if (container) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <>
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-links">
          <a 
            href="#home"
            className={`nav-link ${activeSection === 'home' ? 'active' : ''}`}
            onClick={(e) => handleClick(e, 'home')}
          >
            <span className="nav-dot"></span>
            Home
          </a>
          <a 
            href="#projects"
            className={`nav-link ${activeSection === 'projects' ? 'active' : ''}`}
            onClick={(e) => handleClick(e, 'projects')}
          >
            <span className="nav-dot"></span>
            Projects
          </a>
          <a 
            href="#contact"
            className={`nav-link ${activeSection === 'contact' ? 'active' : ''}`}
            onClick={(e) => handleClick(e, 'contact')}
          >
            <span className="nav-dot"></span>
            Contact
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-main">
          <div className="hero-left">
            <div className="availability-badge">
              <span className="availability-dot"></span>
              Available for new projects
            </div>
            
            <h2 className="hero-greeting">Hello, I'm</h2>
            <h1 className="hero-name">Anthony Baumgertner</h1>
            
            <p className="hero-roles">
              Student Software Engineer • Project Manager • Beginner Frontend Developer
            </p>
            
            <div className="social-links">
              <a href="https://github.com/baumyyy" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="GitHub">
                <i className="fab fa-github"></i>
              </a>
              <a href="https://linkedin.com/in/anthony-baumgertner" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="LinkedIn">
                <i className="fab fa-linkedin"></i>
              </a>
              <a href="https://instagram.com/baumgertnerr" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>

          {/* Placeholder kuvalle */}
          <div className="hero-right">
            <div className="hero-image-placeholder">
              <span className="image-text">My photo here soon</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;