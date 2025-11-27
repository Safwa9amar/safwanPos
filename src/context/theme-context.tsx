
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'dark-purple';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedTheme = localStorage.getItem('theme') as Theme;
    const validThemes: Theme[] = ['light', 'dark', 'dark-purple'];
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (storedTheme && validThemes.includes(storedTheme)) {
      setTheme(storedTheme);
    } else {
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };
  
  useEffect(() => {
    if (isMounted) {
        document.documentElement.classList.remove('light', 'dark', 'dark-purple');
        document.documentElement.classList.add(theme);
    }
  }, [theme, isMounted]);

  const contextValue = {
    theme,
    setTheme: handleSetTheme,
  };
  
  if (!isMounted) {
      return null;
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
