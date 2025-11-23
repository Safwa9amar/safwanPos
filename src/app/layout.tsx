import type {Metadata} from 'next';
import './globals.css';
import { AuthProvider } from '@/context/auth-context';
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from '@/context/language-context';
import { RootLayoutClient } from '@/components/root-layout-client';

export const metadata: Metadata = {
  title: 'PrismaPOS',
  description: 'A minimalist, fully functional Point-of-Sale (POS) system.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LanguageProvider>
      <RootLayoutClient>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </RootLayoutClient>
    </LanguageProvider>
  );
}
