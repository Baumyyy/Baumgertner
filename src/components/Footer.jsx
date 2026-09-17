import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import { scrollPageTo } from '../smoothScroll';
import { useLang } from '../useLang';
import { Wordmark } from './BrandMark';
import { GithubIcon, LinkedinIcon, InstagramIcon, MailIcon } from './Icons';
import { about } from '../content/about';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

// No band, no rules across the page, no surface of its own - the footer
// sits on the same black as everything above it. What marks it as the
// end is scale: a small mark, icons instead of words, and a short rule
// over the copyright.
var socialIcons = {
  linkedin: LinkedinIcon,
  github: GithubIcon,
  instagram: InstagramIcon,
  email: MailIcon,
};

var Footer = function() {
  var currentYear = new Date().getFullYear();
  var sectionRef = useScrollAnimation();
  var { t, lang } = useLang();

  var toTop = function() {
    scrollPageTo(0);
  };

  return (
    <footer className="footer" ref={sectionRef}>
      <div className="footer-inner">
        <div className="ft-row fade-in stagger-1">
          <button type="button" className="ft-brand" onClick={toTop}>
            <span className="sr-only">Baumgertner</span>
            <Wordmark className="ft-wordmark" decorative />
          </button>

          <ul className="ft-socials">
            {about.socials.map(function(social) {
              var Icon = socialIcons[social.id];
              var external = social.href.indexOf('http') === 0;
              return (
                <li key={social.id}>
                  <a
                    className="ft-icon"
                    href={social.href}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                  >
                    {Icon ? <Icon /> : null}
                    {/* The icon carries no name of its own. */}
                    <span className="sr-only">{social.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="ft-legal">
            <Link className="ft-link" to={'/' + lang + '/privacy'}>{t.footer_privacy}</Link>
            <Link className="ft-link" to={'/' + lang + '/terms'}>{t.footer_terms}</Link>
          </div>
        </div>

        {/* No entrance on this one: it sets an opacity of its own,
            which wins over the one the entrance animates, so it would
            slide in without ever fading. */}
        <p className="ft-copy">&copy; {currentYear} Anthony Baumgertner</p>
      </div>
    </footer>
  );
};

export default Footer;
