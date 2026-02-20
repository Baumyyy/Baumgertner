import React, { createContext, useState, useContext } from 'react';
import en from './lang/en';
import fi from './lang/fi';

var languages = { en: en, fi: fi };

var LanguageContext = createContext();

export var LanguageProvider = function({ children }) {
  var state = useState('en');
  var lang = state[0];
  var setLang = state[1];

  var t = languages[lang];

  var toggleLang = function() {
    setLang(lang === 'en' ? 'fi' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ lang: lang, t: t, toggleLang: toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export var useLang = function() {
  return useContext(LanguageContext);
};