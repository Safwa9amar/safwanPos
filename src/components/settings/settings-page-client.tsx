"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export function SettingsPageClient() {
    return (
        <div className="p-4 md:p-6 space-y-6">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Settings</CardTitle>
                    <CardDescription>
                        Manage your account and application settings.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="dark-mode" className="text-base">Dark Mode</Label>
                            <p className="text-sm text-muted-foreground">
                                Toggle the application&apos;s theme.
                            </p>
                        </div>
                        <Switch id="dark-mode" disabled />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
