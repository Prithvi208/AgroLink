import { createContext, useContext, useState } from 'react';
import { translations } from '../translations';

const LanguageContext = createContext(null);

const SUPPORTED = ['en', 'hi', 'mr'];

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('agrolink_lang') || 'en');

  const changeLang = (code) => {
    setLang(code);
    localStorage.setItem('agrolink_lang', code);
  };

  const dict = translations[lang] || translations.en;

  const t = (key, defaultValue) => {
    const parts = key.split('.');
    let val = dict;
    for (const p of parts) {
      if (val == null) return defaultValue;
      val = val[p];
    }
    return val ?? defaultValue;
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLang, t, supported: SUPPORTED, dict }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);