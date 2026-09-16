import React, { useState, useEffect, useRef } from 'react';
import './Hero.css';
import { useLang } from '../useLang';
import { Wordmark } from './BrandMark';
import { MailIcon } from './Icons';
import { useContactPanel } from '../useContactPanel';
import { scrollPageTo, pageOffsetOf, pauseScrolling, resumeScrolling } from '../smoothScroll';

const Hero = ({ ready }) => {
  const [activeSection, setActiveSection] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t, lang, toggleLang } = useLang();
  const { open: openContact } = useContactPanel();
  const navRef = useRef(null);

  useEffect(() => {
    const checkSections = () => {
      const container = document.querySelector('.aurora-container');
      if (!container) return;
      const sections = container.querySelectorAll('section[id]');
      const handleScroll = () => {
        const scrollTop = window.scrollY;
        const windowHeight = window.innerHeight;
        setScrolled(scrollTop > 60);
        let current = 'home';
        sections.forEach((section) => {
          const sectionTop = pageOffsetOf(section) - windowHeight * 0.4;
          if (scrollTop >= sectionTop) {
            current = section.getAttribute('id');
          }
        });
        setActiveSection(current);
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
      return () => window.removeEventListener('scroll', handleScroll);
    };
    const timeout = setTimeout(checkSections, 100);
    return () => clearTimeout(timeout);
  }, []);

  // Two things outside this component have to know the menu is open: the
  // sticky call to action and the blur band, both rendered by
  // AuroraBackground. A class on the body is the smallest way to say so
  // across that gap.
  //
  // The menu covers the window, so the page behind it is frozen for the
  // same reasons the contact panel freezes it: a covered page that still
  // scrolls has moved by the time the cover comes off, and on a phone
  // every swipe aimed at the menu lands on the page instead. Same lock,
  // same scrollbar compensation, same stop to the smooth-scroll loop -
  // which keeps a position of its own and would go on taking wheel
  // events whatever the overflow says.
  useEffect(function() {
    var body = document.body;
    body.classList.toggle('menu-open', menuOpen);
    if (menuOpen) {
      var bar = window.innerWidth - document.documentElement.clientWidth;
      body.style.setProperty('--lock-pad', bar + 'px');
      body.classList.add('scroll-locked');
      pauseScrolling();
    } else {
      body.classList.remove('scroll-locked');
      resumeScrolling();
    }
    return function() {
      body.classList.remove('menu-open');
      body.classList.remove('scroll-locked');
      resumeScrolling();
    };
  }, [menuOpen]);

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

    // The lock comes off in an effect, and effects run after this handler
    // has returned - so a jump started here was handed to a page whose
    // overflow was still hidden and to a smooth-scroll loop that was
    // still stopped, and nothing moved at all. Releasing it by hand is
    // what lets the jump and the closing menu happen in the same tick.
    if (menuOpen) {
      document.body.classList.remove('scroll-locked');
      resumeScrolling();
      setMenuOpen(false);
    }

    if (targetId === 'home') {
      scrollPageTo(0);
      return;
    }

    var element = document.getElementById(targetId);
    if (!element) return;

    // Measured off the pill rather than guessed. A fixed 60px offset left
    // the top of the section under the navigation on a wide screen, where
    // the pill's bottom edge is at 82, and left a gap on a phone, where it
    // is at 54.
    var pill = document.querySelector('.nav-pill');
    var alku = pill ? pill.getBoundingClientRect().bottom + 16 : 60;
    scrollPageTo(pageOffsetOf(element) - alku);
  };

  return (
    <>
      {/* Floating pill. The bar itself is a transparent full-width strip;
          the visible chrome is the pill inside it, so the navigation reads
          as an object sitting on the page rather than a band across it. */}
      <nav className={'navbar' + (scrolled ? ' scrolled' : '') + (menuOpen ? ' menu-open' : '')} ref={navRef}>
        <div className="nav-pill">
          <a href="#" className="nav-logo" onClick={function(e) { handleClick(e, 'home'); }}>
            <Wordmark className="nav-logo-mark" />
          </a>

          <div className={'nav-links' + (menuOpen ? ' nav-open' : '')} data-lenis-prevent>
            <a href="#problem" className={`nav-link ${activeSection === 'problem' ? 'active' : ''}`} onClick={(e) => { handleClick(e, 'problem'); setMenuOpen(false); }}>
              {t.nav_problem}
            </a>
            <a href="#services" className={`nav-link ${activeSection === 'services' ? 'active' : ''}`} onClick={(e) => { handleClick(e, 'services'); setMenuOpen(false); }}>
              {t.nav_services}
            </a>
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

            {/* Under the list rather than in the bar. The bar has room for
                the mark and the menu control and nothing else, and these
                two are not navigation - one is a setting and one is the
                offer. They belong at the end of the list, after what the
                site contains. */}
            <div className="nav-menu-tools">
              {/* Names the language it switches to, not the one being
                  read. A control says what it does. */}
              <button
                type="button"
                className="nav-lang"
                onClick={toggleLang}
                aria-label={lang === 'en' ? 'Vaihda suomeksi' : 'Switch to English'}
              >
                <span className="nav-lang-label">{lang === 'en' ? 'FI' : 'EN'}</span>
              </button>

              {/* The same control as the one at the foot of the page:
                  same fill, same cut, same icon. */}
              <button
                type="button"
                className="btn-primary nav-mail"
                onClick={() => { setMenuOpen(false); openContact(); }}
                aria-label={t.cp_tag}
                title={t.cp_tag}
              >
                <MailIcon className="nav-mail-icon" />
              </button>
            </div>
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
      </section>
    </>
  );
};

export default Hero;