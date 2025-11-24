"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/context/language-context';
import { useTheme } from '@/context/theme-context';
import { useCurrency } from '@/context/currency-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from '@/hooks/use-translation';
import { Moon, Sun, Languages, Milestone } from 'lucide-react';

export function SettingsPageClient() {
    const { language, setLanguage } = useLanguage();
    const { theme, setTheme } = useTheme();
    const { currency, setCurrency } = useCurrency();
    const { t } = useTranslation();

    const handleThemeChange = (isChecked: boolean) => {
        setTheme(isChecked ? 'dark' : 'light');
    }

    return (
        <div className="p-4 md:p-6 space-y-6">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>{t('settings.title')}</CardTitle>
                    <CardDescription>{t('settings.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="dark-mode" className="text-base flex items-center">
                                {theme === 'dark' ? <Moon className="mr-2 h-5 w-5" /> : <Sun className="mr-2 h-5 w-5" />}
                                {t('settings.darkMode')}
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                {t('settings.darkModeDescription')}
                            </p>
                        </div>
                        <Switch 
                            id="dark-mode" 
                            checked={theme === 'dark'}
                            onCheckedChange={handleThemeChange}
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
                </CardContent>
            </Card>
        </div>
    );
}
