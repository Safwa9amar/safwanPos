
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type NavigationStyle = 'sidebar' | 'launchpad';

interface NavigationContextType {
  navigationStyle: NavigationStyle;
  setNavigationStyle: (style: NavigationStyle) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const getNavigationPreference = (): NavigationStyle => {
  if (typeof window !== 'undefined') {
    const storedStyle = localStorage.getItem('navigationStyle') as NavigationStyle;
    if (storedStyle && ['sidebar', 'launchpad'].includes(storedStyle)) {
        return storedStyle;
    }
  }
  return 'launchpad'; // Default to launchpad
}

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [navigationStyle, setNavigationStyle] = useState<NavigationStyle>('launchpad');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setNavigationStyle(getNavigationPreference());
  }, []);

  const handleSetStyle = (newStyle: NavigationStyle) => {
    setNavigationStyle(newStyle);
    localStorage.setItem('navigationStyle', newStyle);
  };

  const contextValue = {
    navigationStyle,
    setNavigationStyle: handleSetStyle,
  };
  
  if (!isMounted) {
      return null;
  }

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
};
