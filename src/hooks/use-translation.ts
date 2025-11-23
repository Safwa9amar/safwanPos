"use client";

import { useLanguage } from '@/context/language-context';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';

const translations = { en, ar };

type TranslationKey = keyof typeof en;

export const useTranslation = () => {
  const { language } = useLanguage();

  const t = (key: TranslationKey) => {
    return translations[language][key] || translations['en'][key];
  };

  return { t, language };
};
