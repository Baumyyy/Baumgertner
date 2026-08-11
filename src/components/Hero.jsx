import React, { useState, useEffect, useRef } from 'react';
import './Hero.css';
import { api } from '../api';
import { useLang } from '../LanguageContext';

const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const useCountUp = (target, duration, delay, decimals, start) => {
  const [value, setValue] = useState(() => (prefersReducedMotion() ? target : 0));

  useEffect(() => {
    if (!start || prefersReducedMotion()) return;
    let raf;
    let startTs;
    const step = (timestamp) => {
      if (!startTs) startTs = timestamp;
      const progress = Math.min((timestamp - startTs) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Number((eased * target).toFixed(decimals)));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    const timeout = setTimeout(() => { raf = requestAnimationFrame(step); }, delay);
    return () => { clearTimeout(timeout); if (raf) cancelAnimationFrame(raf); };
  }, [target, duration, delay, decimals, start]);

  return value;
};

const Hero = ({ ready }) => {
  const [activeSection, setActiveSection] = useState('home');
  const [available, setAvailable] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { lang, t, toggleLang } = useLang();
  const [avatar, setAvatar] = useState('/avatar.jpg');
  const navRef = useRef(null);
  const progressBarRef = useRef(null);
  const ageValue = useCountUp(22, 1400, 1800, 0, ready);
  const expValue = useCountUp(1.5, 1400, 1800, 1, ready);

  useEffect(() => {
    const checkSections = () => {
      const container = document.querySelector('.aurora-container');
      if (!container) return;
      const sections = container.querySelectorAll('section[id]');
      const handleScroll = () => {
        const scrollTop = container.scrollTop;
        const windowHeight = container.clientHeight;
        setScrolled(scrollTop > 60);
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
    const container = document.querySelector('.aurora-container');
    if (!container) return;
    let rafId;
    const updateProgressBar = () => {
      const scrollable = container.scrollHeight - container.clientHeight;
      const progress = scrollable > 0 ? Math.min(1, container.scrollTop / scrollable) : 0;
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = 'scaleX(' + progress + ')';
      }
      rafId = requestAnimationFrame(updateProgressBar);
    };
    rafId = requestAnimationFrame(updateProgressBar);
    return () => cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuOpen && navRef.current && !navRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [menuOpen]);

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
      <nav className={'navbar' + (scrolled ? ' scrolled' : '') + (menuOpen ? ' menu-open' : '')} ref={navRef}>
        <div className="nav-progress-bar" ref={progressBarRef}></div>
        <a href="#" className="nav-logo" onClick={function(e) { handleClick(e, 'home'); }}>
          <span className="nav-logo-text">&lt;Baumgertner/&gt;</span>
        </a>
        <button className="hamburger" onClick={function() { setMenuOpen(!menuOpen); }} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}>
          <span className={'hamburger-line' + (menuOpen ? ' open' : '')}></span>
          <span className={'hamburger-line' + (menuOpen ? ' open' : '')}></span>
          <span className={'hamburger-line' + (menuOpen ? ' open' : '')}></span>
        </button>
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
          <span>{lang === 'en' ? 'FI' : 'EN'}</span>
        </div>
      </nav>

      <section id="home" className="hero">
        <div className={'hero-center' + (ready ? ' hero-ready' : '')}>
          <div className="hero-welcome">{t.hero_welcome || 'Welcome to'}</div>
          <h1 className="hero-big-name">&lt;Baumgertner/&gt;</h1>
          <div className="hero-tagline">
            <span className="tagline-word tw1">{t.hero_title1}</span>
            <span className="tagline-dot d1"></span>
            <span className="tagline-word tw2">{t.hero_title2}</span>
            <span className="tagline-dot d2"></span>
            <span className="tagline-word tw3">{t.hero_title3}</span>
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
                <picture>
                  {avatar === '/avatar.jpg' && <source srcSet="/avatar.webp" type="image/webp" />}
                  <img src={avatar} alt="Anthony Baumgertner" loading="eager" />
                </picture>
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
              <span className="hero-stat-value">{ageValue}</span>
              <span className="hero-stat-label">{t.hero_age}</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <span className="hero-stat-value">{expValue}+</span>
              <span className="hero-stat-label">{t.hero_exp}</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <span className="hero-stat-value hero-stat-langs">FI · EN · RU</span>
              <span className="hero-stat-label">{t.hero_langs}</span>
            </div>
          </div>

          <div className="social-links">
            <a href="https://github.com/baumyyy" target="_blank" rel="noopener noreferrer" className="social-link">
              <i className="fab fa-github"></i>
            </a>
            <a href="https://www.linkedin.com/in/anthony-baumgertner-022191429/" target="_blank" rel="noopener noreferrer" className="social-link">
              <i className="fab fa-linkedin"></i>
            </a>
            <a href="https://www.instagram.com/baumgertnerr/" target="_blank" rel="noopener noreferrer" className="social-link">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;