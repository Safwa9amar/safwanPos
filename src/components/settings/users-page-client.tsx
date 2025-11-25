"use client";

import { useState } from "react";
import { User } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { UserTable } from "./user-table";
import { UserSheet } from "./user-sheet";

interface UsersPageClientProps {
  initialUsers: User[];
}

export function UsersPageClient({ initialUsers }: UsersPageClientProps) {
  const { t } = useTranslation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleAddUser = () => {
    setEditingUser(null);
    setIsSheetOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsSheetOpen(true);
  };
  
  const onSheetClose = () => {
    setEditingUser(null);
    setIsSheetOpen(false);
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t("users.title")}</CardTitle>
            <CardDescription>{t("users.description")}</CardDescription>
          </div>
          <Button onClick={handleAddUser}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("users.addUser")}
          </Button>
        </CardHeader>
        <CardContent>
          <UserTable 
            users={initialUsers}
            onEdit={handleEditUser}
          />
        </CardContent>
      </Card>
      
      <UserSheet
        isOpen={isSheetOpen}
        onOpenChange={onSheetClose}
        user={editingUser}
      />
    </div>
  );
}
