import { useEffect } from 'react';

var TITLES = {
  en: 'Anthony Baumgertner | Software Engineer & Project Manager',
  fi: 'Anthony Baumgertner | Ohjelmistokehittäjä & Projektipäällikkö'
};
var DESCRIPTIONS = {
  en: 'Portfolio of Anthony Baumgertner - Software Engineering student, Project Manager, and Developer based in Turku, Finland.',
  fi: 'Anthony Baumgertnerin portfolio - ohjelmistotekniikan opiskelija, projektipäällikkö ja kehittäjä Turusta, Suomesta.'
};

var setMeta = function(selector, attr, value) {
  var el = document.querySelector(selector);
  if (el) el.setAttribute(attr, value);
};

// hreflang alternates need one <link> per language plus x-default, so
// Google can serve the right URL for a Finnish vs. English search instead
// of only ever indexing whichever one happens to be default. index.html
// ships a static fallback of these; this keeps them in sync per route for
// crawlers that do execute JS, and updates title/description/canonical/OG
// to match, since those still need to change even where the *set* of
// hreflang links doesn't.
var ensureAlternate = function(hreflang, href) {
  var el = document.querySelector('link[rel="alternate"][hreflang="' + hreflang + '"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'alternate');
    el.setAttribute('hreflang', hreflang);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
};

export var useHomeSeo = function(lang) {
  useEffect(function() {
    var title = TITLES[lang] || TITLES.en;
    var description = DESCRIPTIONS[lang] || DESCRIPTIONS.en;
    var url = 'https://baumgertner.fi/' + lang;

    document.title = title;
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:url"]', 'content', url);
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', description);
    setMeta('link[rel="canonical"]', 'href', url);

    ensureAlternate('en', 'https://baumgertner.fi/en');
    ensureAlternate('fi', 'https://baumgertner.fi/fi');
    ensureAlternate('x-default', 'https://baumgertner.fi/en');
  }, [lang]);
};
