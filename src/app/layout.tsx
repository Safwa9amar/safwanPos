
"use client";

import './globals.css';
import { AuthProvider } from '@/context/auth-context';
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from '@/context/language-context';
import React from 'react';
import { ThemeProvider } from '@/context/theme-context';
import { CurrencyProvider } from '@/context/currency-context';
import { useTranslation } from '@/hooks/use-translation';


// This component now only renders the body and its children, allowing it to use hooks.
const AppShell = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
    const { language } = useTranslation();
    return (
        <body className={`h-full ${language === 'ar' ? 'font-cairo' : 'font-inter'}`}>
            {children}
        </body>
    )
}

// The RootLayout now correctly renders <html>, <head>, and the providers.
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
            <AppWithDirection>
                {children}
                <Toaster />
            </AppWithDirection>
          </AuthProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

// A new component to get language direction and apply it to the <html> tag.
const AppWithDirection = ({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) => {
    const { language, dir } = useTranslation();

    return (
        <html lang={language} dir={dir}>
            <head>
                <title>PrismaPOS</title>
                <meta name="description" content="A minimalist, fully functional Point-of-Sale (POS) system." />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap" rel="stylesheet" />
            </head>
             <body className={`h-full ${language === 'ar' ? 'font-cairo' : 'font-inter'}`}>
                {children}
            </body>
        </html>
    )
}
