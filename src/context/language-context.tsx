"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// --- Language Context ---
type Language = 'en' | 'ar';
type Direction = 'ltr' | 'rtl';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  dir: Direction;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// --- Language Provider Component ---
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');
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

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    if (isMounted) {
      document.documentElement.lang = language;
      document.documentElement.dir = dir;
      document.body.className = `font-body antialiased h-full bg-background ${language === 'ar' ? 'font-cairo' : 'font-inter'}`;
    }
  }, [language, dir, isMounted]);

  if (!isMounted) {
    // Avoid rendering mismatch on server and client
    return null;
  }

  const contextValue = { language, setLanguage: handleSetLanguage, dir };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};