import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import en from './lang/en';
import fi from './lang/fi';
import { LanguageContext } from './languageContextObject';

var languages = { en: en, fi: fi };

// Only /en and /fi carry a language in the URL (search engines need a
// distinct URL per language to index both - see useHomeSeo). Every other
// route (privacy, terms, admin, 404) has no language segment, so it just
// falls back to 'en' here rather than losing state on navigation.
var getLangFromPath = function(pathname) {
  return pathname.indexOf('/fi') === 0 ? 'fi' : 'en';
};

export var LanguageProvider = function({ children }) {
  var location = useLocation();
  var navigate = useNavigate();
  var state = useState(getLangFromPath(location.pathname));
  var lang = state[0];
  var setLang = state[1];

  useEffect(function() {
    var pathLang = getLangFromPath(location.pathname);
    if (pathLang !== lang) setLang(pathLang);
    // Keeps the <html lang> attribute in sync on every route (not just
    // /en and /fi) - matters for accessibility and search engines alike.
    document.documentElement.lang = pathLang;
  }, [location.pathname, lang, setLang]);

  var t = languages[lang];

  // Only meaningful on /en or /fi - elsewhere (privacy, terms, admin)
  // there's no per-language URL to switch to, so this is a no-op there.
  var toggleLang = function() {
    if (location.pathname.indexOf('/en') !== 0 && location.pathname.indexOf('/fi') !== 0) return;
    navigate('/' + (lang === 'en' ? 'fi' : 'en'));
  };

  return (
    <LanguageContext.Provider value={{ lang: lang, t: t, toggleLang: toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
};
