
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// --- English Translations ---
import commonEN from '@/locales/en/common.json';
import sidebarEN from '@/locales/en/sidebar.json';
import homeEN from '@/locales/en/home.json';
import authEN from '@/locales/en/auth.json';
import posEN from '@/locales/en/pos.json';
import inventoryEN from '@/locales/en/inventory.json';
import suppliersEN from '@/locales/en/suppliers.json';
import customersEN from '@/locales/en/customers.json';
import reportsEN from '@/locales/en/reports.json';
import statsEN from '@/locales/en/stats.json';
import settingsEN from '@/locales/en/settings.json';
import repairsEN from '@/locales/en/repairs.json';
import expensesEN from '@/locales/en/expenses.json';
import incomeEN from '@/locales/en/income.json';
import purchasesEN from '@/locales/en/purchases.json';

// --- Arabic Translations ---
import commonAR from '@/locales/ar/common.json';
import sidebarAR from '@/locales/ar/sidebar.json';
import homeAR from '@/locales/ar/home.json';
import authAR from '@/locales/ar/auth.json';
import posAR from '@/locales/ar/pos.json';
import inventoryAR from '@/locales/ar/inventory.json';
import suppliersAR from '@/locales/ar/suppliers.json';
import customersAR from '@/locales/ar/customers.json';
import reportsAR from '@/locales/ar/reports.json';
import statsAR from '@/locales/ar/stats.json';
import settingsAR from '@/locales/ar/settings.json';
import repairsAR from '@/locales/ar/repairs.json';
import expensesAR from '@/locales/ar/expenses.json';
import incomeAR from '@/locales/ar/income.json';
import purchasesAR from '@/locales/ar/purchases.json';

const resources = {
  en: {
    translation: {
      ...commonEN,
      ...sidebarEN,
      ...homeEN,
      ...authEN,
      ...posEN,
      ...inventoryEN,
      ...suppliersEN,
      ...customersEN,
      ...reportsEN,
      ...statsEN,
      ...settingsEN,
      ...repairsEN,
      ...expensesEN,
      ...incomeEN,
      ...purchasesEN,
    },
  },
  ar: {
    translation: {
      ...commonAR,
      ...sidebarAR,
      ...homeAR,
      ...authAR,
      ...posAR,
      ...inventoryAR,
      ...suppliersAR,
      ...customersAR,
      ...reportsAR,
      ...statsAR,
      ...settingsAR,
      ...repairsAR,
      ...expensesAR,
      ...incomeAR,
      ...purchasesAR,
    },
  },
};

const getInitialLanguage = () => {
    if (typeof window !== 'undefined') {
        const storedLang = localStorage.getItem('language');
        if (storedLang === 'en' || storedLang === 'ar') {
            return storedLang;
        }
    }
    return 'en';
}


i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(), // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    react: {
        useSuspense: false, // this is important for server-side rendering
    }
  });

export default i18n;
