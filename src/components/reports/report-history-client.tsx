
"use client";

import { useState, useMemo, useEffect } from "react";
import { Report } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Trash2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { getReportHistory, deleteReport } from "@/app/reports/actions";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";

export function ReportHistoryClient() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null);

  useEffect(() => {
    if (user) {
      const fetchReports = async () => {
        setIsLoading(true);
        const { reports: fetchedReports, error } = await getReportHistory(user.id);
        if (fetchedReports) setReports(fetchedReports);
        if (error) toast({ variant: "destructive", title: "Error", description: error });
        setIsLoading(false);
      };
      fetchReports();
    }
  }, [user, toast]);
  
  const handleViewDetails = (report: Report) => {
    setSelectedReport(report);
    setIsDetailOpen(true);
  };

  const handleDeleteClick = (report: Report) => {
    setReportToDelete(report);
    setIsAlertOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!reportToDelete || !user) return;
    setIsDeleting(true);
    const result = await deleteReport(reportToDelete.id, user.id);
    setIsDeleting(false);
    if (result.success) {
      setReports(prev => prev.filter(r => r.id !== reportToDelete.id));
      toast({ title: "Report Deleted" });
      setIsAlertOpen(false);
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
      setIsAlertOpen(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t('reports.history.title')}</CardTitle>
          <CardDescription>{t('reports.history.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('reports.history.title')}</TableHead>
                <TableHead>{t('reports.history.date')}</TableHead>
                <TableHead className="w-[80px] text-right">{t("inventory.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.title}</TableCell>
                  <TableCell>{format(new Date(report.createdAt), "PPp")}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleViewDetails(report)}>
                        <Eye className="h-4 w-4"/>
                    </Button>
                     <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteClick(report)}>
                        <Trash2 className="h-4 w-4"/>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {reports.length === 0 && !isLoading && (
            <p className="text-center text-muted-foreground py-12">{t('reports.history.noReports')}</p>
          )}
          {isLoading && (
             <p className="text-center text-muted-foreground py-12">{t('inventory.saving')}</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-4xl h-[90vh]">
              <DialogHeader>
                  <DialogTitle>{selectedReport?.title}</DialogTitle>
                  <DialogDescription>{format(new Date(selectedReport?.createdAt || Date.now()), "PPPP p")}</DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-full">
                <div 
                    className="prose prose-sm dark:prose-invert max-w-none p-4"
                    dangerouslySetInnerHTML={{ __html: selectedReport?.content || "" }}
                />
              </ScrollArea>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>{t('history.close')}</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
      
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>{t('reports.history.deleteConfirmTitle')}</AlertDialogTitle>
                  <AlertDialogDescription>{t('reports.history.deleteConfirmDescription')}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>{t('pos.cancelButton')}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting}>
                      {isDeleting ? t('inventory.saving') : t('inventory.delete')}
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
