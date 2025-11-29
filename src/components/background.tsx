
"use client";

import { useTheme } from "@/context/theme-context";
import { cn } from "@/lib/utils";

export function Background() {
  const { backgroundImage } = useTheme();

  return (
    <div
      className={cn(
        "fixed inset-0 -z-10 bg-background transition-all",
        backgroundImage ? "opacity-100" : "opacity-0"
      )}
      style={{
        backgroundImage: backgroundImage ? `url('${backgroundImage}')` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    />
  );
}
