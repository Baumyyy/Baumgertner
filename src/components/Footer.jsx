import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const handleNavClick = (e, targetId) => {
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
    <footer className="footer">
      <div className="footer-glow"></div>
      
      <div className="footer-content">
        {/* Top section */}
        <div className="footer-top">
          <div className="footer-brand">
            <h2 className="footer-name">Anthony<span className="footer-name-accent"> Baumgertner</span></h2>
            <p className="footer-tagline">Building digital experiences with passion & precision</p>
            <div className="footer-location">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>Turku, Finland</span>
            </div>
          </div>

          <div className="footer-links-grid">
            <div className="footer-links-col">
              <h4 className="footer-links-title">Navigate</h4>
              <a href="#home" className="footer-link" onClick={(e) => handleNavClick(e, 'home')}>Home</a>
              <a href="#projects" className="footer-link" onClick={(e) => handleNavClick(e, 'projects')}>Projects</a>
              <a href="#contact" className="footer-link" onClick={(e) => handleNavClick(e, 'contact')}>Contact</a>
            </div>

            <div className="footer-links-col">
              <h4 className="footer-links-title">Connect</h4>
              <a href="https://github.com/baumyyy" target="_blank" rel="noopener noreferrer" className="footer-link">
                GitHub
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M17 7H7M17 7V17"/>
                </svg>
              </a>
              <a href="https://linkedin.com/in/anthony-baumgertner" target="_blank" rel="noopener noreferrer" className="footer-link">
                LinkedIn
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M17 7H7M17 7V17"/>
                </svg>
              </a>
              <a href="https://instagram.com/baumgertnerr" target="_blank" rel="noopener noreferrer" className="footer-link">
                Instagram
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M17 7H7M17 7V17"/>
                </svg>
              </a>
            </div>

            <div className="footer-links-col">
              <h4 className="footer-links-title">Status</h4>
              <div className="footer-status">
                <span className="footer-status-dot"></span>
                <span>Available for projects</span>
              </div>
              <p className="footer-status-detail">Open to freelance, collaboration & full-time opportunities</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider"></div>

        {/* Bottom section */}
        <div className="footer-bottom">
          <p className="footer-copyright">© {currentYear} Anthony Baumgertner</p>
          <p className="footer-credit">Designed & built with
            <span className="footer-heart"> ♥ </span>
            in Finland
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;