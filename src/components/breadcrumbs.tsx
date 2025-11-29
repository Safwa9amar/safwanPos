
"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  // Don't show breadcrumbs on root-level pages like /home or /pos
  if (segments.length <= 1) {
    return null;
  }

  const capitalize = (s: string) => {
    return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ');
  };

  return (
    <nav aria-label="Breadcrumb" className="text-sm font-medium">
      <ol className="flex items-center gap-1.5">
        <li>
          <Link href="/home" className="text-muted-foreground hover:text-foreground">
            Home
          </Link>
        </li>
        {segments.map((segment, index) => {
          const href = '/' + segments.slice(0, index + 1).join('/');
          const isLast = index === segments.length - 1;

          return (
            <React.Fragment key={href}>
              <li className="flex items-center gap-1.5">
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                <Link
                  href={href}
                  className={cn(
                    "hover:text-foreground",
                    isLast ? "text-foreground pointer-events-none" : "text-muted-foreground"
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {capitalize(segment)}
                </Link>
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
