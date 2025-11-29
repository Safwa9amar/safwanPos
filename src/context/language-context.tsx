"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, Suspense } from 'react';
import { I18nextProvider, useTranslation as useI18nextTranslation } from 'react-i18next';
import i18n from '@/lib/i18n';
import { useTheme } from './theme-context';

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
  const { i18n: i18nInstance } = useI18nextTranslation();
  const [isClient, setIsClient] = useState(false);
  const [language, setLanguageState] = useState<Language>(i18n.language as Language || 'en');

  useEffect(() => {
    setIsClient(true);
    const storedLanguage = localStorage.getItem('language') as Language;
    if (storedLanguage && i18n.language !== storedLanguage) {
        i18n.changeLanguage(storedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };
  
  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
        setLanguageState(lng as Language);
    };
    i18n.on('languageChanged', handleLanguageChanged);
    return () => {
        i18n.off('languageChanged', handleLanguageChanged);
    };
  }, []);

  const dir = (language === 'ar') ? 'rtl' : 'ltr';

  const contextValue = { language, setLanguage: handleSetLanguage, dir };

  return (
    <LanguageContext.Provider value={contextValue}>
        <I18nextProvider i18n={i18n}>
            {children}
        </I18nextProvider>
    </LanguageContext.Provider>
  );
};
