import React, { useState, useEffect } from 'react';
import './Hero.css';
import { api } from '../api';


const Hero = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [available, setAvailable] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');
    const container = document.querySelector('.aurora-container');

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          setActiveSection(id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.3,
      root: container,
      rootMargin: '0px 0px -40% 0px'
    });

    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  useEffect(() => {
    api.getAvailability().then(function(data) {
      setAvailable(data.available);
    }).catch(function() {});
  }, []);

  const handleClick = (e, targetId) => {
    e.preventDefault();
    setMenuOpen(false);
    
    if (targetId === 'home') {
      const container = document.querySelector('.aurora-container');
      if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(targetId);
      const container = document.querySelector('.aurora-container');
      if (element && container) {
        const elementTop = element.offsetTop - 60;
        container.scrollTo({ top: elementTop, behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <nav className={'navbar' + (menuOpen ? ' menu-open' : '')}>
  <div className="hamburger" onClick={function() { setMenuOpen(!menuOpen); }}>
    <span className={'hamburger-line' + (menuOpen ? ' open' : '')}></span>
    <span className={'hamburger-line' + (menuOpen ? ' open' : '')}></span>
    <span className={'hamburger-line' + (menuOpen ? ' open' : '')}></span>
  </div>
  <div className={'nav-links' + (menuOpen ? ' nav-open' : '')}>
    <a href="#home" className={`nav-link ${activeSection === 'home' ? 'active' : ''}`} onClick={(e) => { handleClick(e, 'home'); setMenuOpen(false); }}>
      <span className="nav-dot"></span>Home
    </a>
    <a href="#whatido" className={`nav-link ${activeSection === 'whatido' ? 'active' : ''}`} onClick={(e) => { handleClick(e, 'whatido'); setMenuOpen(false); }}>
      <span className="nav-dot"></span>What I Do
    </a>
    <a href="#projects" className={`nav-link ${activeSection === 'projects' ? 'active' : ''}`} onClick={(e) => { handleClick(e, 'projects'); setMenuOpen(false); }}>
      <span className="nav-dot"></span>Projects
    </a>
    <a href="#contact" className={`nav-link ${activeSection === 'contact' ? 'active' : ''}`} onClick={(e) => { handleClick(e, 'contact'); setMenuOpen(false); }}>
      <span className="nav-dot"></span>Contact
    </a>
  </div>
</nav>

      <section id="home" className="hero">
        <div className="hero-particles">
          <div className="particle p1"></div>
          <div className="particle p2"></div>
          <div className="particle p3"></div>
          <div className="particle p4"></div>
          <div className="particle p5"></div>
          <div className="particle p6"></div>
        </div>

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
              <a href="https://github.com/baumyyy" target="_blank" rel="noopener noreferrer" className="social-link">
                <i className="fab fa-github"></i>
              </a>
              <a href="https://linkedin.com/in/anthony-baumgertner" target="_blank" rel="noopener noreferrer" className="social-link">
                <i className="fab fa-linkedin"></i>
              </a>
              <a href="https://instagram.com/baumgertnerr" target="_blank" rel="noopener noreferrer" className="social-link">
                <i className="fab fa-instagram"></i>
              </a>
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

  <div className="badge-photo-wrapper">
    <div className="badge-photo">
      <img src="/Logos/IMG_4680.jpg" alt="Anthony Baumgertner" className="badge-photo-img" />
    </div>
    <div className="badge-photo-ring"></div>
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

    <div className="badge-languages">
  <span className="badge-lang">
    <span className="lang-flag">🇫🇮</span>
    <span>Finnish</span>
  </span>
  <span className="badge-lang">
  <span className="lang-flag">🇺🇸</span>
  <span>English</span>
</span>
  <span className="badge-lang">
    <span className="lang-flag">🇷🇺</span>
    <span>Russian</span>
  </span>
</div>
  </div>

 <div className={'badge-footer' + (available ? '' : ' footer-busy')}>
  <span className={'status-indicator' + (available ? '' : ' status-busy')}></span>
  <span className="status-text">{available ? 'Available for projects' : 'Currently busy'}</span>
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