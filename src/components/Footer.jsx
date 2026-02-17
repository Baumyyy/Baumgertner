import React from 'react';
import './Footer.css';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

var Footer = function() {
  var currentYear = new Date().getFullYear();
  var sectionRef = useScrollAnimation();

  var handleNavClick = function(e, targetId) {
    e.preventDefault();
    if (targetId === 'home') {
      var container = document.querySelector('.aurora-container');
      if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      var element = document.getElementById(targetId);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <footer className="footer" ref={sectionRef}>
      <div className="footer-glow"></div>

      <div className="footer-content">
        <div className="footer-top fade-in stagger-1">
          <div className="footer-brand">
            <h2 className="footer-name">Anthony<span className="footer-name-accent"> Baumgertner</span></h2>
            <p className="footer-tagline">Building digital experiences with passion and precision</p>
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
              <div className="footer-link" onClick={function(e) { handleNavClick(e, 'home'); }} style={{cursor: 'pointer'}}>Home</div>
              <div className="footer-link" onClick={function(e) { handleNavClick(e, 'whatido'); }} style={{cursor: 'pointer'}}>What I Do</div>
              <div className="footer-link" onClick={function(e) { handleNavClick(e, 'projects'); }} style={{cursor: 'pointer'}}>Projects</div>
              <div className="footer-link" onClick={function(e) { handleNavClick(e, 'contact'); }} style={{cursor: 'pointer'}}>Contact</div>
            </div>

            <div className="footer-links-col">
              <h4 className="footer-links-title">Connect</h4>
              <div className="footer-link" onClick={function() { window.open('https://github.com/baumyyy', '_blank'); }} style={{cursor: 'pointer'}}>
                GitHub
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M17 7H7M17 7V17"/>
                </svg>
              </div>
              <div className="footer-link" onClick={function() { window.open('https://linkedin.com/in/anthony-baumgertner', '_blank'); }} style={{cursor: 'pointer'}}>
                LinkedIn
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M17 7H7M17 7V17"/>
                </svg>
              </div>
              <div className="footer-link" onClick={function() { window.open('https://instagram.com/baumgertnerr', '_blank'); }} style={{cursor: 'pointer'}}>
                Instagram
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M17 7H7M17 7V17"/>
                </svg>
              </div>
            </div>

            <div className="footer-links-col">
              <h4 className="footer-links-title">Status</h4>
              <div className="footer-status">
                <span className="footer-status-dot"></span>
                <span>Available for projects</span>
              </div>
              <p className="footer-status-detail">Open to freelance, collaboration and full-time opportunities</p>
            </div>
          </div>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom fade-in stagger-2">
          <p className="footer-copyright">&copy; {currentYear} Anthony Baumgertner</p>
          <p className="footer-credit">Designed and built with
            <span className="footer-heart"> &#9829; </span>
            in Finland
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;