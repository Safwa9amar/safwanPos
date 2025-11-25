"use client";

import { useState } from "react";
import { RepairJob } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { RepairJobSheet } from "./repair-job-sheet";
import { RepairJobTable } from "./repair-job-table";

interface RepairsPageClientProps {
  initialJobs: RepairJob[];
}

export function RepairsPageClient({ initialJobs }: RepairsPageClientProps) {
  const { t } = useTranslation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<RepairJob | null>(null);

  const handleAddJob = () => {
    setEditingJob(null);
    setIsSheetOpen(true);
  };

  const handleEditJob = (job: RepairJob) => {
    setEditingJob(job);
    setIsSheetOpen(true);
  };
  
  const onSheetClose = () => {
    setEditingJob(null);
    setIsSheetOpen(false);
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t("repairs.title")}</CardTitle>
            <CardDescription>{t("repairs.description")}</CardDescription>
          </div>
          <Button onClick={handleAddJob}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("repairs.add")}
          </Button>
        </CardHeader>
        <CardContent>
          <RepairJobTable 
            jobs={initialJobs}
            onEdit={handleEditJob}
          />
        </CardContent>
      </Card>
      
      <RepairJobSheet
        isOpen={isSheetOpen}
        onOpenChange={onSheetClose}
        job={editingJob}
      />
    </div>
  );
}
