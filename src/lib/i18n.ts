import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';
import dz from '@/locales/dz.json';

const resources = {
  en: {
    translation: en,
  },
  ar: {
    translation: ar,
  },
  dz: {
    translation: dz,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    react: {
        useSuspense: false, // this is important for server-side rendering
    }
  });

export default i18n;
