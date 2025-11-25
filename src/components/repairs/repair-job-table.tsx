"use client";

import { useState } from "react";
import { RepairJob } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { deleteRepairJob } from "@/app/repairs/actions";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { Badge } from "../ui/badge";
import { format } from "date-fns";

interface RepairJobTableProps {
    jobs: RepairJob[], 
    onEdit: (job: RepairJob) => void;
}

export function RepairJobTable({ jobs, onEdit }: RepairJobTableProps) {
  const { t } = useTranslation("translation");
  const { toast } = useToast();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedJob, setSelectedJob] = useState<RepairJob | null>(null);

  const handleDeleteClick = (job: RepairJob) => {
    setSelectedJob(job);
    setIsAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedJob) return;

    setIsDeleting(true);
    const result = await deleteRepairJob(selectedJob.id);
    setIsDeleting(false);

    if (result.success) {
      toast({
        title: t('repairs.deleteSuccess'),
      });
      setIsAlertOpen(false);
      setSelectedJob(null);
    } else {
      toast({
        variant: "destructive",
        title: t('repairs.deleteFailed'),
        description: result.error,
      });
      setIsAlertOpen(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'default';
      case 'COLLECTED': return 'outline';
      case 'IN_PROGRESS': return 'secondary';
      case 'PENDING':
      default:
        return 'destructive';
    }
  };

  if (jobs.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        {t("repairs.noJobs")}
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("repairs.customerName")}</TableHead>
            <TableHead>{t("repairs.deviceModel")}</TableHead>
            <TableHead>{t("repairs.reportedProblem")}</TableHead>
            <TableHead>{t("repairs.date")}</TableHead>
            <TableHead>{t("repairs.status")}</TableHead>
            <TableHead className="w-[80px] text-right">{t("inventory.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell className="font-medium">{job.customerName}</TableCell>
              <TableCell>{job.deviceModel}</TableCell>
              <TableCell className="max-w-[200px] truncate">{job.reportedProblem}</TableCell>
              <TableCell>{format(new Date(job.createdAt), "PP")}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(job.status)}>{t(`repairs.statuses.${job.status}`)}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(job)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      {t("inventory.edit")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteClick(job)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t("inventory.delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{t('repairs.deleteConfirmTitle')}</AlertDialogTitle>
                <AlertDialogDescription>{t('repairs.deleteConfirmDescription')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>{t('pos.cancelButton')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting}>
                    {isDeleting ? t('inventory.saving') : t('inventory.delete')}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
