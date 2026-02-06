import React, { useState, useEffect } from 'react';
import './Hero.css';

const Hero = () => {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
  const sections = document.querySelectorAll('section[id]');
  console.log('Found sections:', sections.length, Array.from(sections).map(s => s.id));
  
  const observerOptions = {
    threshold: 0.3,
    rootMargin: '0px 0px -50% 0px'
  };

  const observerCallback = (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        console.log('✅ Active section changed to:', id);
        setActiveSection(id);
      }
    });
  };

  const observer = new IntersectionObserver(observerCallback, observerOptions);
  
  sections.forEach((section) => {
    console.log('Observing section:', section.id);
    observer.observe(section);
  });

  return () => {
    sections.forEach((section) => observer.unobserve(section));
  };
}, []);


const handleClick = (e, targetId) => {
  e.preventDefault();
  
  if (targetId === 'home') {
    // Scrollaa aurora-containeria
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
            <p className="hero-greeting">Hi, I'm Anthony Baumgertner</p>
            <h1 className="hero-title">
              Junior<br />Software<br />Developer
            </h1>
            <p className="hero-subtitle">Project manager</p>
            
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
              Here will be my phrase soon
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;