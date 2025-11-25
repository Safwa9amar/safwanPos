"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getBusinessReport } from '@/app/reports/actions';
import { FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import { useTranslation } from '@/hooks/use-translation';

export function ReportsPageClient() {
    const [report, setReport] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { t, language } = useTranslation();

    const handleGenerateReport = async () => {
        setIsLoading(true);
        setReport(null);
        try {
            const result = await getBusinessReport(language);
            if (result.error) {
                throw new Error(result.error);
            }
            setReport(result.summary);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: t('reports.generationFailedTitle'),
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>{t('reports.title')}</CardTitle>
                    <CardDescription>
                        {t('reports.description')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleGenerateReport} disabled={isLoading}>
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <FileText className="mr-2 h-4 w-4" />
                        )}
                        {t('reports.generateButton')}
                    </Button>
                </CardContent>
            </Card>

            {isLoading && (
                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <div>
                                    <p className="font-semibold">{t('reports.loadingTitle')}</p>
                                    <p className="text-sm text-muted-foreground">{t('reports.loadingDescription')}</p>
                                </div>
                            </div>
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    </CardContent>
                </Card>
            )}

            {report && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t('reports.summaryTitle')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div 
                            className="prose prose-sm dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: report }}
                        />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
