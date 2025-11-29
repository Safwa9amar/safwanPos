
"use client";

import { useLanguage } from "@/context/language-context";
import React, { useEffect } from "react";

export const AppWithDirection = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const { language, dir } = useLanguage();

  useEffect(() => {
    console.log("klsjadkljklj",dir)
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    const bodyClass = language === "ar" ? "font-cairo" : "font-inter";
    document.body.className = `h-full ${bodyClass}`;
  }, [language, dir]);

  return <>{children}</>;
};
