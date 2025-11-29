
"use client";

import { RepairJob } from "@prisma/client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useTranslation } from "@/hooks/use-translation";
import { RepairJobForm } from "./repair-job-form";
import { ScrollArea } from "../ui/scroll-area";

interface RepairJobSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  job: RepairJob | null;
}

export function RepairJobSheet({ isOpen, onOpenChange, job }: RepairJobSheetProps) {
  const { t } = useTranslation();
  const title = job ? t("repairs.editTitle") : t("repairs.addTitle");
  const description = job ? t("repairs.editDescription") : t("repairs.addDescription");
  
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="py-4 pr-6">
            <RepairJobForm job={job} onFinished={() => onOpenChange(false)} />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
