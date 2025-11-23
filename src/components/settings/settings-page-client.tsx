"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/context/language-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from '@/hooks/use-translation';

export function SettingsPageClient() {
    const { language, setLanguage } = useLanguage();
    const { t } = useTranslation();

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
                            <Label htmlFor="dark-mode" className="text-base">{t('settings.darkMode')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('settings.darkModeDescription')}
                            </p>
                        </div>
                        <Switch id="dark-mode" disabled />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="language" className="text-base">{t('settings.language')}</Label>
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
                </CardContent>
            </Card>
        </div>
    );
}
