
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/context/language-context';
import { useTheme, type Theme } from '@/context/theme-context';
import { useCurrency } from '@/context/currency-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from '@/hooks/use-translation';
import { Languages, Milestone, Users, Palette, LayoutGrid, Sidebar, Image as ImageIcon, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useNavigation, type NavigationStyle } from '@/context/navigation-context';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';

type ThemeOption = {
    id: Theme;
    name: string;
    colors: {
        bg: string;
        fg: string;
        primary: string;
    };
};

const themeOptions: ThemeOption[] = [
    { id: 'light', name: 'Light', colors: { bg: 'hsl(0 0% 100%)', fg: 'hsl(222.2 84% 4.9%)', primary: 'hsl(221 83% 53%)' }},
    { id: 'dark', name: 'Dark', colors: { bg: 'hsl(240 10% 10%)', fg: 'hsl(210 40% 98%)', primary: 'hsl(217 91% 60%)' }},
    { id: 'dark-purple', name: 'Purple', colors: { bg: 'hsl(260 20% 10%)', fg: 'hsl(260 10% 95%)', primary: 'hsl(250 80% 70%)' }},
    { id: 'theme-ocean-light', name: 'Ocean Light', colors: { bg: 'hsl(200 50% 95%)', fg: 'hsl(210 50% 10%)', primary: 'hsl(210 90% 50%)' }},
    { id: 'theme-ocean-dark', name: 'Ocean Dark', colors: { bg: 'hsl(210 40% 8%)', fg: 'hsl(200 20% 95%)', primary: 'hsl(200 80% 60%)' }},
    { id: 'theme-forest-light', name: 'Forest Light', colors: { bg: 'hsl(110 20% 96%)', fg: 'hsl(120 40% 10%)', primary: 'hsl(130 60% 40%)' }},
    { id: 'theme-forest-dark', name: 'Forest Dark', colors: { bg: 'hsl(120 25% 10%)', fg: 'hsl(110 10% 95%)', primary: 'hsl(130 70% 50%)' }},
    { id: 'theme-desert-light', name: 'Desert Light', colors: { bg: 'hsl(35 40% 95%)', fg: 'hsl(30 50% 10%)', primary: 'hsl(30 80% 55%)' }},
    { id: 'theme-desert-dark', name: 'Desert Dark', colors: { bg: 'hsl(30 20% 8%)', fg: 'hsl(40 15% 95%)', primary: 'hsl(40 90% 60%)' }},
];


const ThemePreviewCard = ({ option, isSelected, onClick }: { option: ThemeOption, isSelected: boolean, onClick: (id: Theme) => void }) => (
    <div 
        className={cn(
            "p-2 border-2 rounded-lg cursor-pointer transition-all",
            isSelected ? "border-primary" : "border-transparent hover:border-muted-foreground/50"
        )}
        onClick={() => onClick(option.id)}
    >
        <div className="flex items-center gap-2 mb-2">
            {isSelected && <CheckCircle className="h-4 w-4 text-primary" />}
            <p className="text-sm font-medium">{option.name}</p>
        </div>
        <div className="h-16 w-full rounded-md flex overflow-hidden" style={{ backgroundColor: option.colors.bg }}>
            <div className="w-1/3 h-full" style={{ backgroundColor: option.colors.fg }}></div>
            <div className="w-2/3 h-full flex items-center justify-center" style={{ backgroundColor: option.colors.bg }}>
                 <div className="w-8 h-8 rounded-full" style={{ backgroundColor: option.colors.primary }}></div>
            </div>
        </div>
    </div>
);


export function SettingsPageClient() {
    const { language, setLanguage } = useLanguage();
    const { theme, setTheme, backgroundImage, setBackgroundImage } = useTheme();
    const { currency, setCurrency } = useCurrency();
    const { navigationStyle, setNavigationStyle } = useNavigation();
    const { t } = useTranslation();

    const handleThemeChange = (newTheme: Theme) => {
        setTheme(newTheme);
    }
    
    const handleNavChange = (newNav: NavigationStyle) => {
        setNavigationStyle(newNav);
    }

    return (
        <div className="p-4 md:p-6 space-y-6">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>{t('settings.title')}</CardTitle>
                    <CardDescription>{t('settings.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                     <div className="space-y-4">
                        <div className="space-y-0.5">
                            <Label className="text-base flex items-center">
                                <Palette className="mr-2 h-5 w-5" />
                                {t('settings.theme')}
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                {t('settings.themeDescription')}
                            </p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                           {themeOptions.map(option => (
                               <ThemePreviewCard 
                                    key={option.id}
                                    option={option}
                                    isSelected={theme === option.id}
                                    onClick={handleThemeChange}
                               />
                           ))}
                        </div>
                    </div>

                    <div className="rounded-lg border p-4 space-y-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="nav-style" className="text-base flex items-center">
                                <LayoutGrid className="mr-2 h-5 w-5" />
                                {t('settings.navStyle')}
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                {t('settings.navStyleDescription')}
                            </p>
                        </div>
                         <div className="flex flex-col sm:flex-row gap-4">
                            <div className={cn("flex items-center gap-2 border rounded-md p-3 flex-1 cursor-pointer hover:bg-accent", navigationStyle === 'sidebar' && "border-primary ring-2 ring-primary")} onClick={() => handleNavChange('sidebar')}>
                                <Sidebar className="h-4 w-4" />
                                Sidebar
                            </div>
                             <div className={cn("flex items-center gap-2 border rounded-md p-3 flex-1 cursor-pointer hover:bg-accent", navigationStyle === 'launchpad' && "border-primary ring-2 ring-primary")} onClick={() => handleNavChange('launchpad')}>
                                <LayoutGrid className="h-4 w-4" />
                                Launchpad
                            </div>
                        </div>
                    </div>

                     <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="background" className="text-base flex items-center">
                                <ImageIcon className="mr-2 h-5 w-5" />
                                Background Image
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Set a custom background URL for the app.
                            </p>
                        </div>
                        <Input 
                            id="background"
                            placeholder="Enter image URL..."
                            className="w-[280px]"
                            value={backgroundImage || ''}
                            onChange={(e) => setBackgroundImage(e.target.value)}
                        />
                    </div>


                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="language" className="text-base flex items-center">
                                <Languages className="mr-2 h-5 w-5" />
                                {t('settings.language')}
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                {t('settings.languageDescription')}
                            </p>
                        </div>
                        <Select onValueChange={(value) => setLanguage(value as 'en' | 'ar')} defaultValue={language}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="ar">العربية (Arabic)</SelectItem>
                          </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="currency" className="text-base flex items-center">
                                <Milestone className="mr-2 h-5 w-5" />
                                {t('settings.currency')}
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                {t('settings.currencyDescription')}
                            </p>
                        </div>
                        <Select onValueChange={(value) => setCurrency(value as 'USD' | 'DZD')} defaultValue={currency}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="DZD">DZD (DA)</SelectItem>
                          </SelectContent>
                        </Select>
                    </div>
                    <Link href="/settings/users" className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent transition-colors">
                        <div className="space-y-0.5">
                            <Label className="text-base flex items-center cursor-pointer">
                                <Users className="mr-2 h-5 w-5" />
                                {t('settings.userManagement')}
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                {t('settings.userManagementDescription')}
                            </p>
                        </div>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}
