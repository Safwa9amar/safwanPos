"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/components/icons';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/pos');
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  return (
     <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
           <Icons.logo className="h-16 w-16 animate-pulse text-primary"/>
           <p className="text-muted-foreground">Loading PrismaPOS...</p>
        </div>
      </div>
  );
}
