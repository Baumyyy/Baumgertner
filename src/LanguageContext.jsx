import React, { useState } from 'react';
import en from './lang/en';
import fi from './lang/fi';
import { LanguageContext } from './languageContextObject';

var languages = { en: en, fi: fi };

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
