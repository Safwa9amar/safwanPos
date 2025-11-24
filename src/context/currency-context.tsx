"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Currency = 'USD' | 'DZD';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }

  const formatCurrency = (value: number, options?: Intl.NumberFormatOptions) => {
    const defaultOptions: Intl.NumberFormatOptions = {
        style: 'currency',
        currency: context.currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    };
    
    // For DZD, we can customize it to show 'DA' and place it correctly
    if(context.currency === 'DZD') {
        const formatter = new Intl.NumberFormat('fr-DZ', { ...defaultOptions, ...options, currency: 'DZD' });
        // Intl may format as "1 234,56 DZD". We can replace DZD with DA if needed.
        return formatter.format(value).replace('DZD', 'DA');
    }

    const formatter = new Intl.NumberFormat('en-US', { ...defaultOptions, ...options, currency: context.currency });
    return formatter.format(value);
  };

  return { ...context, formatCurrency };
};

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<Currency>('DZD');

  useEffect(() => {
    const storedCurrency = localStorage.getItem('currency') as Currency;
    if (storedCurrency && ['USD', 'DZD'].includes(storedCurrency)) {
      setCurrency(storedCurrency);
    }
  }, []);

  const handleSetCurrency = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    localStorage.setItem('currency', newCurrency);
  };

  const contextValue = {
    currency,
    setCurrency: handleSetCurrency,
  };

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
};
