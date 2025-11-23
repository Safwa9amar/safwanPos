"use client";

import { useLanguage } from "@/context/language-context";
import { useEffect } from "react";

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
    const { language, dir } = useLanguage();

    // This effect will run on the client and update the document attributes.
    useEffect(() => {
        document.documentElement.lang = language;
        document.documentElement.dir = dir;
        document.body.className = `font-body antialiased h-full bg-background ${language === 'ar' ? 'font-cairo' : 'font-inter'}`;
    }, [language, dir]);

    return (
        <html lang={language} dir={dir}>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap" rel="stylesheet" />
            </head>
            {/* The body tag is necessary for Next.js to inject its scripts */}
            <body className="h-full">
                {children}
            </body>
        </html>
    )
}
