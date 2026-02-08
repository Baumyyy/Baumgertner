import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-left">
            <h3 className="footer-name">Anthony Baumgertner</h3>
            <p className="footer-tagline">Student Software Engineer & Project Manager</p>
            <p className="footer-location">
            <svg className="location-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
             <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
             </svg>
             Turku, Finland
            </p>
          </div>

          <div className="footer-links">
            <div className="footer-section">
              <h4>Navigate</h4>
              <a href="#home">Home</a>
              <a href="#projects">Projects</a>
              <a href="#contact">Contact</a>
            </div>

            <div className="footer-section">
              <h4>Connect</h4>
              <a href="https://github.com/baumyyy" target="_blank" rel="noopener noreferrer">GitHub</a>
              <a href="https://linkedin.com/in/anthony-baumgertner" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <a href="https://instagram.com/baumgertnerr" target="_blank" rel="noopener noreferrer">Instagram</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">© {currentYear} Anthony Baumgertner. All rights reserved.</p>
          <div className="footer-availability">
            <span className="footer-dot"></span>
            Available for new projects
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;