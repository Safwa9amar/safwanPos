
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/context/language-context";
import React from "react";
import { ThemeProvider } from "@/context/theme-context";
import { CurrencyProvider } from "@/context/currency-context";
import { AppWithDirection } from "@/components/root-layout-client";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>PrismaPOS</title>
        <meta
          name="description"
          content="A minimalist, fully functional Point-of-Sale (POS) system."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
          <LanguageProvider>
            <ThemeProvider>
                <AppWithDirection>
                    <CurrencyProvider>
                        <AuthProvider>
                        {children}
                        <Toaster />
                        </AuthProvider>
                    </CurrencyProvider>
                </AppWithDirection>
            </ThemeProvider>
          </LanguageProvider>
      </body>
    </html>
  );
}

