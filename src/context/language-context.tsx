"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Language = 'en' | 'ar';
type Direction = 'ltr' | 'rtl';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  dir: Direction;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [dir, setDir] = useState<Direction>('ltr');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedLanguage = localStorage.getItem('language') as Language;
    if (storedLanguage && ['en', 'ar'].includes(storedLanguage)) {
      setLanguage(storedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    if(isMounted) {
      localStorage.setItem('language', lang);
    }
  };

  useEffect(() => {
    const newDir = language === 'ar' ? 'rtl' : 'ltr';
    setDir(newDir);
    if (isMounted) {
        document.documentElement.lang = language;
        document.documentElement.dir = newDir;
        if (language === 'ar') {
            document.body.classList.add('font-cairo');
            document.body.classList.remove('font-inter');
        } else {
            document.body.classList.add('font-inter');
            document.body.classList.remove('font-cairo');
        }
    }
  }, [language, isMounted]);

  const contextValue = { language, setLanguage: handleSetLanguage, dir };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
