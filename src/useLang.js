import { useContext } from 'react';
import { LanguageContext } from './languageContextObject';

export var useLang = function() {
  return useContext(LanguageContext);
};
