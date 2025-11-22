"use client";

import React from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/icons';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
           <Icons.logo className="h-16 w-16 animate-pulse text-primary"/>
           <p className="text-muted-foreground">Securing your session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
