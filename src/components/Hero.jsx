import React, { useState, useEffect } from 'react';
import './Hero.css';
import { api } from '../api';
import { useLang } from '../LanguageContext';

const Hero = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [available, setAvailable] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang, t, toggleLang } = useLang();
  const [avatar, setAvatar] = useState('/Logos/IMG_4680.jpg');

  useEffect(() => {
    const checkSections = () => {
      const container = document.querySelector('.aurora-container');
      if (!container) return;
      const sections = container.querySelectorAll('section[id]');
      const handleScroll = () => {
        const scrollTop = container.scrollTop;
        const windowHeight = container.clientHeight;
        let current = 'home';
        sections.forEach((section) => {
          const sectionTop = section.offsetTop - windowHeight * 0.4;
          if (scrollTop >= sectionTop) {
            current = section.getAttribute('id');
          }
        });
        setActiveSection(current);
      };
      container.addEventListener('scroll', handleScroll);
      handleScroll();
      return () => container.removeEventListener('scroll', handleScroll);
    };
    const timeout = setTimeout(checkSections, 100);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    api.getAvailability().then(function(data) {
      setAvailable(data.available);
    }).catch(function() {});
    api.getProfile().then(function(data) {
      if (data.avatar) setAvatar(data.avatar);
    }).catch(function() {});
  }, []);

  const handleClick = (e, targetId) => {
    e.preventDefault();
    setMenuOpen(false);
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
    <>
      <nav className={'navbar' + (menuOpen ? ' menu-open' : '')}>
        <div className="hamburger" onClick={function() { setMenuOpen(!menuOpen); }}>
          <span className={'hamburger-line' + (menuOpen ? ' open' : '')}></span>
          <span className={'hamburger-line' + (menuOpen ? ' open' : '')}></span>
          <span className={'hamburger-line' + (menuOpen ? ' open' : '')}></span>
        </div>
        <div className={'nav-links' + (menuOpen ? ' nav-open' : '')}>
          <a href="#home" className={`nav-link ${activeSection === 'home' ? 'active' : ''}`} onClick={(e) => { handleClick(e, 'home'); setMenuOpen(false); }}>
            <span className="nav-dot"></span>{t.nav_home}
          </a>
          <a href="#whatido" className={`nav-link ${activeSection === 'whatido' ? 'active' : ''}`} onClick={(e) => { handleClick(e, 'whatido'); setMenuOpen(false); }}>
            <span className="nav-dot"></span>{t.nav_whatido}
          </a>
          <a href="#projects" className={`nav-link ${activeSection === 'projects' ? 'active' : ''}`} onClick={(e) => { handleClick(e, 'projects'); setMenuOpen(false); }}>
            <span className="nav-dot"></span>{t.nav_projects}
          </a>
          <a href="#testimonials" className={`nav-link ${activeSection === 'testimonials' ? 'active' : ''}`} onClick={(e) => { handleClick(e, 'testimonials'); setMenuOpen(false); }}>
            <span className="nav-dot"></span>{t.nav_testimonials}
          </a>
          <a href="#contact" className={`nav-link ${activeSection === 'contact' ? 'active' : ''}`} onClick={(e) => { handleClick(e, 'contact'); setMenuOpen(false); }}>
            <span className="nav-dot"></span>{t.nav_contact}
          </a>
        </div>
        <div className="lang-toggle" onClick={toggleLang}>
          <span className="lang-flag-btn">{lang === 'en' ? '🇫🇮' : '🇺🇸'}</span>
          <span>{lang === 'en' ? 'FI' : 'EN'}</span>
        </div>
      </nav>

      <section id="home" className="hero">
        <div className="hero-center">
          <div className="hero-welcome">{t.hero_welcome || 'Welcome to'}</div>
          <h1 className="hero-big-name">BAUMGERTNER</h1>
          <div className="hero-tagline">
            <span>{t.hero_title1}</span>
            <span className="tagline-dot"></span>
            <span>{t.hero_title2}</span>
            <span className="tagline-dot"></span>
            <span>{t.hero_title3}</span>
          </div>

          <div className="hero-actions">
            <a href="#projects" className="btn-primary" onClick={(e) => handleClick(e, 'projects')}>
              {t.hero_explore}
              <span className="btn-arrow">→</span>
            </a>
            <a href="#contact" className="btn-ghost" onClick={(e) => handleClick(e, 'contact')}>
              {t.hero_contact}
            </a>
          </div>

          <div className="hero-badge-row">
            <div className="hero-mini-card">
              <div className="mini-card-photo">
                <img src={avatar} alt="Anthony Baumgertner" loading="eager" />
              </div>
              <div className="mini-card-info">
                <span className="mini-card-name">Anthony Baumgertner</span>
                <span className="mini-card-role">{t.hero_role}</span>
              </div>
              <div className={'mini-card-status' + (available ? '' : ' status-busy')}>
                <span className={'status-dot' + (available ? '' : ' dot-busy')}></span>
                <span>{available ? t.hero_available : t.hero_busy}</span>
              </div>
            </div>
          </div>

          <div className="hero-stats-row">
            <div className="hero-stat">
              <span className="hero-stat-value">22</span>
              <span className="hero-stat-label">{t.hero_age}</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <span className="hero-stat-value">1.5+</span>
              <span className="hero-stat-label">{t.hero_exp}</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <span className="hero-stat-value">🇫🇮 🇺🇸 🇷🇺</span>
              <span className="hero-stat-label">{t.hero_langs}</span>
            </div>
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
      </section>
    </>
  );
};

export default Hero;