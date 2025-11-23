"use client";

import { useLanguage } from "@/context/language-context";

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
    const { language, dir } = useLanguage();

    return (
        <html lang={language} dir={dir} className="h-full">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap" rel="stylesheet" />
            </head>
            <body className={`font-body antialiased h-full bg-background ${language === 'ar' ? 'font-cairo' : 'font-inter'}`}>
                {children}
            </body>
        </html>
    )
}
