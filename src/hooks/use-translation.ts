"use client";

import { useTranslation as useI18nextTranslation } from 'react-i18next';
import { useLanguage } from '@/context/language-context';

export const useTranslation = () => {
    const { t, i18n } = useI18nextTranslation();
    const { language } = useLanguage();

    return { t, language, i18n };
};
