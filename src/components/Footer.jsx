import React, { useState, useEffect } from 'react';
import './Footer.css';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { api } from '../api';
import { useLang } from '../LanguageContext';

var Footer = function() {
  var currentYear = new Date().getFullYear();
  var sectionRef = useScrollAnimation();
  var availableState = useState(true);
  var available = availableState[0];
  var setAvailable = availableState[1];
  var { t } = useLang();

  useEffect(function() {
    api.getAvailability().then(function(data) {
      setAvailable(data.available);
    }).catch(function() {});
  }, []);

  var handleNavClick = function(e, targetId) {
    e.preventDefault();
    var container = document.querySelector('.aurora-container');
    if (targetId === 'home') {
      if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      var element = document.getElementById(targetId);
      if (element && container) {
        var elementTop = element.offsetTop - 60;
        container.scrollTo({ top: elementTop, behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="footer" ref={sectionRef}>
      <div className="footer-glow"></div>

      <div className="footer-content">
        <div className="footer-top fade-in stagger-1">
          <div className="footer-brand">
            <h2 className="footer-name">Anthony<span className="footer-name-accent"> Baumgertner</span></h2>
            <p className="footer-tagline">{t.footer_tagline}</p>
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
              <h4 className="footer-links-title">{t.footer_navigate}</h4>
              <div className="footer-link" onClick={function(e) { handleNavClick(e, 'home'); }} style={{cursor: 'pointer'}}>{t.nav_home}</div>
              <div className="footer-link" onClick={function(e) { handleNavClick(e, 'whatido'); }} style={{cursor: 'pointer'}}>{t.nav_whatido}</div>
              <div className="footer-link" onClick={function(e) { handleNavClick(e, 'projects'); }} style={{cursor: 'pointer'}}>{t.nav_projects}</div>
              <div className="footer-link" onClick={function(e) { handleNavClick(e, 'contact'); }} style={{cursor: 'pointer'}}>{t.nav_contact}</div>
            </div>

            <div className="footer-links-col">
              <h4 className="footer-links-title">{t.footer_connect}</h4>
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
              <h4 className="footer-links-title">{t.footer_status}</h4>
              <div className="footer-status">
                <span className={'footer-status-dot' + (available ? '' : ' footer-status-busy')}></span>
                <span style={available ? {} : {color: 'rgba(255, 100, 100, 0.8)'}}>{available ? t.footer_available : t.footer_busy}</span>
              </div>
              <p className="footer-status-detail" style={available ? {} : {color: 'rgba(255, 100, 100, 0.5)'}}>{available ? t.footer_available_desc : t.footer_busy_desc}</p>
            </div>
          </div>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom fade-in stagger-2">
          <p className="footer-copyright">&copy; {currentYear} Anthony Baumgertner</p>
          <p className="footer-credit">{t.footer_credit}
            <span className="footer-heart"> &#9829; </span>
            {t.footer_credit2}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;