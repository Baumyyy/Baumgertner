import React, { useState, useEffect, useRef } from 'react';
import './Hero.css';
import { useLang } from '../useLang';
import { Wordmark } from './BrandMark';
import { useContactPanel } from '../useContactPanel';
import { scrollPageTo } from '../smoothScroll';

// Where a section sits inside the scroll container. offsetTop was the
// obvious answer and was correct until the sections moved inside the
// sheet that travels over the hero: offsetTop is measured from the
// nearest positioned ancestor, so with the sheet in between every
// section read a full hero height short and the navigation landed
// eight hundred pixels above where it should. Measured against the
// container instead - the thing actually being scrolled - which no
// amount of rearranging the markup can put out of step.
// The container's own position is passed in rather than read here: this
// runs once per section on every scroll event, and reading it inside
// would measure the same unchanging number five times a frame.
var sectionTopIn = function(el, containerTop, scrollTop) {
  return el.getBoundingClientRect().top - containerTop + scrollTop;
};

const Hero = ({ ready }) => {
  const [activeSection, setActiveSection] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useLang();
  const { open: openContact } = useContactPanel();
  const navRef = useRef(null);
  const progressBarRef = useRef(null);

  useEffect(() => {
    const checkSections = () => {
      const container = document.querySelector('.aurora-container');
      if (!container) return;
      const sections = container.querySelectorAll('section[id]');
      const handleScroll = () => {
        const scrollTop = container.scrollTop;
        const windowHeight = container.clientHeight;
        const containerTop = container.getBoundingClientRect().top;
        setScrolled(scrollTop > 60);
        let current = 'home';
        sections.forEach((section) => {
          const sectionTop = sectionTopIn(section, containerTop, scrollTop) - windowHeight * 0.4;
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

  const handleClick = (e, targetId) => {
    e.preventDefault();
    setMenuOpen(false);
    var container = document.querySelector('.aurora-container');
    if (targetId === 'home') {
      scrollPageTo(container, 0);
    } else {
      var element = document.getElementById(targetId);
      if (element && container) {
        var elementTop = sectionTopIn(
          element, container.getBoundingClientRect().top, container.scrollTop) - 60;
        scrollPageTo(container, elementTop);
      }
    }
  };

  return (
    <>
      {/* Floating pill. The bar itself is a transparent full-width strip;
          the visible chrome is the pill inside it, so the navigation reads
          as an object sitting on the page rather than a band across it. */}
      <nav className={'navbar' + (scrolled ? ' scrolled' : '') + (menuOpen ? ' menu-open' : '')} ref={navRef}>
        <div className="nav-progress-bar" ref={progressBarRef}></div>
        <div className="nav-pill">
          <a href="#" className="nav-logo" onClick={function(e) { handleClick(e, 'home'); }}>
            <Wordmark className="nav-logo-mark" />
          </a>

          <div className={'nav-links' + (menuOpen ? ' nav-open' : '')}>
            <a href="#projects" className={`nav-link ${activeSection === 'projects' ? 'active' : ''}`} onClick={(e) => { handleClick(e, 'projects'); setMenuOpen(false); }}>
              {t.nav_projects}
            </a>
            <a href="#about" className={`nav-link ${activeSection === 'about' ? 'active' : ''}`} onClick={(e) => { handleClick(e, 'about'); setMenuOpen(false); }}>
              {t.nav_about}
            </a>
            {/* Not a link any more: there is no contact section to
                scroll to, the form lives in a panel. */}
            <button type="button" className="nav-link" onClick={() => { setMenuOpen(false); openContact(); }}>
              {t.nav_contact}
            </button>
          </div>

          <div className="nav-end">
            <button type="button" className="btn-primary nav-cta" onClick={openContact}>
              {t.hero_cta_primary}
            </button>
            <button className="hamburger" onClick={function() { setMenuOpen(!menuOpen); }} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}>
              <span className={'hamburger-line' + (menuOpen ? ' open' : '')}></span>
              <span className={'hamburger-line' + (menuOpen ? ' open' : '')}></span>
              <span className={'hamburger-line' + (menuOpen ? ' open' : '')}></span>
            </button>
          </div>
        </div>
      </nav>

      <section id="home" className={'hero' + (ready ? ' hero-ready' : '')}>
        {/* Decorative backdrop. The portrait crop is served below 768px so
            phones get a frame composed for their shape rather than a
            centre-cropped landscape. */}
        <div className="hero-bg" aria-hidden="true">
          <picture>
            <source media="(max-width: 768px)" type="image/webp" srcSet="/hero/valley-tall.webp" />
            <source media="(max-width: 768px)" srcSet="/hero/valley-tall.jpg" />
            <source type="image/webp" srcSet="/hero/valley-wide.webp" />
            <img src="/hero/valley-wide.jpg" alt="" fetchPriority="high" decoding="async" />
          </picture>
          <div className="hero-scrim"></div>
        </div>

        <div className={'hero-center' + (ready ? ' hero-ready' : '')}>
          {/* The claim is the page's actual message, so it is the h1. The
              name identifies in the navigation wordmark, the page title
              and the structured data rather than competing here. */}
          <h1 className="hero-claim">
            <span className="hero-claim-line">{t.hero_claim1}</span>
            <span className="hero-claim-line">{t.hero_claim2}</span>
          </h1>

          {/* Two lines, written as two lines. The second is the turn, so
              it gets its own line rather than whatever the measure decides. */}
          <p className="hero-lede">
            <span className="hero-lede-line">{t.hero_lede}</span>
            <span className="hero-lede-line">{t.hero_lede2}</span>
          </p>

          <div className="hero-actions">
            <button type="button" className="btn-primary" onClick={openContact}>
              {t.hero_cta_primary}
              <span className="btn-arrow">→</span>
            </button>
            <a href="#projects" className="btn-secondary" onClick={(e) => handleClick(e, 'projects')}>
              {t.hero_cta_secondary}
            </a>
          </div>

        </div>

        {/* Scroll cue. Used to be drawn as a pseudo-element on the social
            links, which meant it disappeared with them - it gets its own
            element so it is anchored to the section, not to a sibling. */}
        <div className={'hero-scroll-cue' + (ready ? ' hero-ready' : '')} aria-hidden="true">
          <span className="hero-scroll-chevron"></span>
        </div>
      </section>
    </>
  );
};

export default Hero;