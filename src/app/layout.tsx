
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/context/language-context";
import React from "react";
import { ThemeProvider } from "@/context/theme-context";
import { CurrencyProvider } from "@/context/currency-context";
import { AppWithDirection } from "@/components/root-layout-client";
import { NavigationProvider } from "@/context/navigation-context";
import { Background } from "@/components/background";
import { SoundProvider } from "@/context/sound-context";
import type { Metadata } from 'next';
import { ProductExpirationNotifier } from "@/components/product-expiration-notifier";

export const metadata: Metadata = {
  title: 'SafwanPOS',
  description: 'A minimalist, fully functional Point-of-Sale (POS) system.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
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
