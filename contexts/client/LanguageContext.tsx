'use client'
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { en } from '../../constants/en';
import { ro } from '../../constants/ro';

type Language = 'en' | 'ro';
type Translations = typeof en;

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  isLanguageLoaded: boolean;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('ro');
  const [translations, setTranslations] = useState<Translations>(ro);
  const [isLanguageLoaded, setIsLanguageLoaded] = useState(false);

  useEffect(() => {
    const storedLanguage = localStorage.getItem('language') as Language;
    if (storedLanguage) {
      setLanguage(storedLanguage);
      setTranslations(storedLanguage === 'en' ? en : ro);
    }
    setIsLanguageLoaded(true);
  }, []);

  useEffect(() => {
    if (isLanguageLoaded) {
      localStorage.setItem('language', language);
      setTranslations(language === 'en' ? en : ro);
    }
  }, [language, isLanguageLoaded]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations, isLanguageLoaded }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
