import React, { useState, useEffect } from 'react';
import './Hero.css';
import { api } from '../api';
import { useLang } from '../LanguageContext';

const Hero = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [available, setAvailable] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang, t, toggleLang } = useLang();

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
              <span className="intro-text">{t.hero_intro}</span>
            </div>

            <h1 className="hero-name">
              <span className="greeting-small">{t.hero_greeting}</span>
              <span className="name-first">Anthony</span>
              <span className="name-last">Baumgertner</span>
            </h1>

            <div className="hero-title-bar">
              <span className="title-item">{t.hero_title1}</span>
              <span className="title-divider"></span>
              <span className="title-item">{t.hero_title2}</span>
              <span className="title-divider"></span>
              <span className="title-item">{t.hero_title3}</span>
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
                </div>

                <div className="badge-content">
                  <h3 className="badge-name">Anthony Baumgertner</h3>
                  <p className="badge-role-text">{t.hero_role}</p>

                  <div className="badge-stats">
                    <div className="stat">
                      <span className="stat-value">22</span>
                      <span className="stat-label">{t.hero_age}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">1.5</span>
                      <span className="stat-label">{t.hero_exp}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">3</span>
                      <span className="stat-label">{t.hero_langs}</span>
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
                  <span className="status-text" style={available ? {} : {color: 'rgba(255, 100, 100, 0.8)'}}>{available ? t.hero_available : t.hero_busy}</span>
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