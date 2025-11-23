
"use client";

import './globals.css';
import { AuthProvider } from '@/context/auth-context';
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from '@/context/language-context';
import React from 'react';


// --- Root Layout ---
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LanguageProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
    </LanguageProvider>
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
