
"use client";

import { useTheme } from "@/context/theme-context";
import { cn } from "@/lib/utils";

export function Background() {
  const { backgroundImage, defaultBackgroundImage } = useTheme();

  const finalBackgroundImage = backgroundImage || defaultBackgroundImage;

  return (
    <div
      className={cn(
        "fixed inset-0 -z-10 transition-all"
      )}
      style={{
        backgroundImage: finalBackgroundImage ? `url('${finalBackgroundImage}')` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    />
  );
}
