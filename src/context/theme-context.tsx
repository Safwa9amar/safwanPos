
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'dark-purple';

// Define a default background image URL
const DEFAULT_BACKGROUND_IMAGE = "https://images.unsplash.com/photo-1554189097-9497412497a4?q=80&w=2940&auto=format&fit=crop";


interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  backgroundImage: string | null;
  setBackgroundImage: (url: string) => void;
  defaultBackgroundImage: string;
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
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Theme setup
    const storedTheme = localStorage.getItem('theme') as Theme;
    const validThemes: Theme[] = ['light', 'dark', 'dark-purple'];
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (storedTheme && validThemes.includes(storedTheme)) {
      setTheme(storedTheme);
    } else {
      setTheme(prefersDark ? 'dark' : 'light');
    }

    // Background image setup
    const storedBackgroundImage = localStorage.getItem('backgroundImage');
    if (storedBackgroundImage) {
        setBackgroundImage(storedBackgroundImage);
    } else {
        setBackgroundImage(DEFAULT_BACKGROUND_IMAGE);
    }


  }, []);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };
  
  const handleSetBackgroundImage = (url: string) => {
      setBackgroundImage(url);
      if (url) {
          localStorage.setItem('backgroundImage', url);
      } else {
          localStorage.removeItem('backgroundImage');
          setBackgroundImage(DEFAULT_BACKGROUND_IMAGE); // Fallback to default when URL is cleared
      }
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
    backgroundImage,
    setBackgroundImage: handleSetBackgroundImage,
    defaultBackgroundImage: DEFAULT_BACKGROUND_IMAGE
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
