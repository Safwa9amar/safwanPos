
"use client";

import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/context/language-context";
import React, { useEffect } from "react";
import { ThemeProvider } from "@/context/theme-context";
import { CurrencyProvider } from "@/context/currency-context";
import { AppWithDirection } from "@/components/root-layout-client";
import { NavigationProvider } from "@/context/navigation-context";
import { Background } from "@/components/background";
import { SoundProvider } from "@/context/sound-context";
import type { Metadata } from 'next';
import { ProductExpirationNotifier } from "@/components/product-expiration-notifier";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  useEffect(() => {
    // This observer fixes an issue where Radix UI modals (Dialog, Sheet)
    // add 'pointer-events: none;' to the body, making the sidebar unclickable.
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const body = document.body;
          if (body.style.pointerEvents === 'none') {
            body.style.pointerEvents = 'auto';
          }
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
    });

    return () => observer.disconnect();
  }, []);
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
          <title>SafwanPOS</title>
          <meta name="description" content="A minimalist, fully functional Point-of-Sale (POS) system." />
      </head>
      <body>
          <LanguageProvider>
            <ThemeProvider>
                <AppWithDirection>
                  <NavigationProvider>
                    <CurrencyProvider>
                        <AuthProvider>
                          <SoundProvider>
                            <ProductExpirationNotifier />
                            <Background />
                            {children}
                            <Toaster />
                          </SoundProvider>
                        </AuthProvider>
                    </CurrencyProvider>
                  </NavigationProvider>
                </AppWithDirection>
            </ThemeProvider>
          </LanguageProvider>
      </body>
    </html>
  );
}
