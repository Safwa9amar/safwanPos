
"use client";

import './globals.css';
import { AuthProvider } from '@/context/auth-context';
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from '@/context/language-context';
import React from 'react';
import { ThemeProvider } from '@/context/theme-context';
import { CurrencyProvider } from '@/context/currency-context';


// --- Root Layout ---
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <CurrencyProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster />
        </CurrencyProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

// Dummy HTML structure for type conformity with the new i18next setup.
// The actual html/body tags are managed by the LanguageProvider.
const DummyShell = ({ children }: { children: React.ReactNode }) => (
    <html>
        <body>
            {children}
        </body>
    </html>
);
