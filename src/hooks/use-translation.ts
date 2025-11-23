"use client";

import { useLanguage } from '@/context/language-context';
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

  const t = (key: TranslationKey, substitutions?: Record<string, string | number>) => {
    let translation = key.split('.').reduce((obj: any, k) => obj?.[k], translations[language]);


    if (!translation) {
      translation = key.split('.').reduce((obj: any, k) => obj?.[k], translations['en']);
    }

    if (translation && substitutions) {
        Object.entries(substitutions).forEach(([k, v]) => {
            translation = translation.replace(`{{${k}}}`, String(v));
        });
    }
    return translation || key;
  };

  return { t, language };
};
