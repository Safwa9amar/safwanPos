
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Icons } from '@/components/icons';
import { useTranslation } from '@/hooks/use-translation';
import { getNavigationPreference } from '@/context/navigation-context';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    if (!loading) {
      if (user) {
        const preferredNav = getNavigationPreference();
        if (preferredNav === 'launchpad') {
            router.replace('/home');
        } else {
            router.replace('/pos');
        }
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  return (
     <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
           <Icons.logo className="h-16 w-16 animate-pulse text-primary"/>
           <p className="text-muted-foreground">{t('home.loading')}</p>
        </div>
      </div>
  );
}
