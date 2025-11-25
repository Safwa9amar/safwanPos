"use client";

import { User } from "@prisma/client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useTranslation } from "@/hooks/use-translation";
import { UserForm } from "./user-form";
import { ScrollArea } from "../ui/scroll-area";

interface UserSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export function UserSheet({ isOpen, onOpenChange, user }: UserSheetProps) {
  const { t } = useTranslation();
  const title = user ? t("users.editUser") : t("users.addUser");
  const description = user ? t("users.editDescription") : t("users.addDescription");
  
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="py-4">
            <UserForm user={user} onFinished={() => onOpenChange(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
