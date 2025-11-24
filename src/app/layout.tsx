
"use client";

import './globals.css';
import { AuthProvider } from '@/context/auth-context';
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from '@/context/language-context';
import React from 'react';
import { ThemeProvider } from '@/context/theme-context';
import { CurrencyProvider } from '@/context/currency-context';
import { useTranslation } from '@/hooks/use-translation';


// This is the main shell for the app that includes the HTML and body tags.
const AppShell = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
    // We get language and direction here to apply to the html tag
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

// This is the root layout where we compose all the providers.
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
            <AppShell>
              {children}
              <Toaster />
            </AppShell>
          </AuthProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
