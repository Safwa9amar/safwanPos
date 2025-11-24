"use client";

import { useCurrency as useCurrencyContext } from '@/context/currency-context';

export const useCurrency = () => {
    return useCurrencyContext();
};
