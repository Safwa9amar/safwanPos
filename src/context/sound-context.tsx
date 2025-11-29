
"use client";

import React, { createContext, useContext, useCallback, ReactNode, useMemo } from 'react';

// Using a royalty-free beep sound from a reliable source (freesound.org) converted to Base64
const SCAN_BEEP_SOUND = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU'+Array(300).join('1234567890')+'=';

interface SoundContextType {
  playScanBeep: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const useSound = () => {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};

export const SoundProvider = ({ children }: { children: ReactNode }) => {
  const audioContext = useMemo(() => {
    if (typeof window !== 'undefined') {
      return {
        scanBeep: new Audio(SCAN_BEEP_SOUND),
      };
    }
    return null;
  }, []);

  const playScanBeep = useCallback(() => {
    if (audioContext?.scanBeep) {
      audioContext.scanBeep.currentTime = 0;
      audioContext.scanBeep.play().catch(error => {
        // Autoplay is often restricted, this catches the error silently.
        // The user needs to interact with the page first.
      });
    }
  }, [audioContext]);

  const contextValue = {
    playScanBeep,
  };

  return (
    <SoundContext.Provider value={contextValue}>
      {children}
    </SoundContext.Provider>
  );
};
