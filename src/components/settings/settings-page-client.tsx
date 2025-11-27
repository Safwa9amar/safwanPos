
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTranslation } from '@/hooks/use-translation';
import { Moon, Sun, Languages, Milestone, Users, Palette, LayoutGrid, Sidebar } from 'lucide-react';
import Link from 'next/link';
import { useNavigation, type NavigationStyle } from '@/context/navigation-context';

export function SettingsPageClient() {
    const { language, setLanguage } = useLanguage();
    const { theme, setTheme } = useTheme();
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
                <CardContent className="grid md:grid-cols-2 gap-6">
                    <div className="rounded-lg border p-4 space-y-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="dark-mode" className="text-base flex items-center">
                                <Palette className="mr-2 h-5 w-5" />
                                {t('settings.theme')}
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                {t('settings.themeDescription')}
                            </p>
                        </div>
                        <RadioGroup 
                            defaultValue={theme} 
                            onValueChange={(value: Theme) => handleThemeChange(value)}
                            className="flex flex-col sm:flex-row gap-4"
                        >
                            <Label htmlFor="light" className="flex items-center gap-2 border rounded-md p-3 flex-1 cursor-pointer hover:bg-accent [&:has([data-state=checked])]:border-primary">
                                <RadioGroupItem value="light" id="light"/>
                                <Sun className="h-4 w-4" />
                                Light
                            </Label>
                             <Label htmlFor="dark" className="flex items-center gap-2 border rounded-md p-3 flex-1 cursor-pointer hover:bg-accent [&:has([data-state=checked])]:border-primary">
                                <RadioGroupItem value="dark" id="dark" />
                                <Moon className="h-4 w-4" />
                                Dark
                            </Label>
                            <Label htmlFor="dark-purple" className="flex items-center gap-2 border rounded-md p-3 flex-1 cursor-pointer hover:bg-accent [&:has([data-state=checked])]:border-primary">
                                <RadioGroupItem value="dark-purple" id="dark-purple" />
                                <Palette className="h-4 w-4" />
                                Purple
                            </Label>
                        </RadioGroup>
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
                        <RadioGroup 
                            defaultValue={navigationStyle}
                            onValueChange={(value: NavigationStyle) => handleNavChange(value)}
                            className="flex flex-col sm:flex-row gap-4"
                        >
                            <Label htmlFor="sidebar" className="flex items-center gap-2 border rounded-md p-3 flex-1 cursor-pointer hover:bg-accent [&:has([data-state=checked])]:border-primary">
                                <RadioGroupItem value="sidebar" id="sidebar"/>
                                <Sidebar className="h-4 w-4" />
                                Sidebar
                            </Label>
                             <Label htmlFor="launchpad" className="flex items-center gap-2 border rounded-md p-3 flex-1 cursor-pointer hover:bg-accent [&:has([data-state=checked])]:border-primary">
                                <RadioGroupItem value="launchpad" id="launchpad" />
                                <LayoutGrid className="h-4 w-4" />
                                Launchpad
                            </Label>
                        </RadioGroup>
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
