"use client";

import { useLanguage } from '@/context/language-context';
import { useMemo } from 'react';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';

const translations = { en, ar };

// This creates a recursive keyof type.
type Paths<T> = T extends object ? {
    [K in keyof T]: `${Exclude<K, symbol>}${"" | `.${Paths<T[K]>}`}`
}[keyof T] : never;

type TranslationKey = Paths<typeof en>;

export const useTranslation = () => {
  const { language } = useLanguage();

  const t = useMemo(() => {
    return (key: TranslationKey, substitutions?: Record<string, string | number>): string => {
      // Function to get a nested property from an object
      const getNested = (obj: any, path: string): string | undefined => {
        const parts = path.split('.');
        let current = obj;
        for (let i = 0; i < parts.length; i++) {
          if (current === null || typeof current !== 'object') {
            return undefined;
          }
          current = current[parts[i]];
        }
        return typeof current === 'string' ? current : undefined;
      };

      // Attempt to get the translation from the current language
      let translation = getNested(translations[language], key);

      // Fallback to English if the translation is not found
      if (translation === undefined) {
        translation = getNested(translations['en'], key);
      }
      
      // If still not found, return the key itself as a last resort
      if (translation === undefined) {
        return key;
      }
      
      // Handle substitutions
      if (substitutions) {
        Object.entries(substitutions).forEach(([subKey, value]) => {
          translation = translation!.replace(new RegExp(`{{${subKey}}}`, 'g'), String(value));
        });
      }

      return translation;
    };
  }, [language]);

  return { t, language };
};
