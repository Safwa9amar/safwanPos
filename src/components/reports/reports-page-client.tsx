"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getSalesReport } from '@/app/reports/actions';
import { FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

export function ReportsPageClient() {
    const [report, setReport] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleGenerateReport = async () => {
        setIsLoading(true);
        setReport(null);
        try {
            const result = await getSalesReport();
            if (result.error) {
                throw new Error(result.error);
            }
            setReport(result.summary);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Report Generation Failed',
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
                    <CardTitle>AI-Powered Sales Analysis</CardTitle>
                    <CardDescription>
                        Generate a summary of recent sales to identify trends and potential stock shortages.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleGenerateReport} disabled={isLoading}>
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <FileText className="mr-2 h-4 w-4" />
                        )}
                        Generate Report
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
                                    <p className="font-semibold">Analyzing Sales Data...</p>
                                    <p className="text-sm text-muted-foreground">The AI is processing recent transactions. This may take a moment.</p>
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
                        <CardTitle>Sales Report Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                            {report}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
