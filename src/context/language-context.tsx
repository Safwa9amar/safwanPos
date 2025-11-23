"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, Suspense } from 'react';
import { I18nextProvider, useTranslation as useI18nextTranslation } from 'react-i18next';
import i18n from '@/lib/i18n';

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

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    if (isClient) {
      document.documentElement.lang = language;
      document.documentElement.dir = dir;
      document.body.className = `font-body antialiased h-full bg-background ${language === 'ar' ? 'font-cairo' : 'font-inter'}`;
    }
  }, [language, dir, isClient]);

  const contextValue = { language, setLanguage: handleSetLanguage, dir };

  return (
    <Suspense fallback={
        <html lang="en" dir="ltr">
            <head>
                <title>PrismaPOS</title>
            </head>
            <body></body>
        </html>
    }>
        <LanguageContext.Provider value={contextValue}>
            <I18nextProvider i18n={i18n}>
                 <html lang={language} dir={dir}>
                    <head>
                        <title>PrismaPOS</title>
                        <meta name="description" content="A minimalist, fully functional Point-of-Sale (POS) system." />
                        <link rel="preconnect" href="https://fonts.googleapis.com" />
                        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
                        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap" rel="stylesheet" />
                    </head>
                    <body className={`h-full ${language === 'ar' ? 'font-cairo' : 'font-inter'}`}>
                        {children}
                    </body>
                </html>
            </I18nextProvider>
        </LanguageContext.Provider>
    </Suspense>
  );
};
