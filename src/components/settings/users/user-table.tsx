"use client";

import { useState } from "react";
import { User } from "@prisma/client";
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
import { deleteUser } from "@/app/settings/users/actions";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import { useAuth } from "@/context/auth-context";


interface UserTableProps {
    users: User[], 
    onEdit: (user: User) => void;
}

export function UserTable({ users, onEdit }: UserTableProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setIsAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    setIsDeleting(true);
    const result = await deleteUser(selectedUser.id);
    setIsDeleting(false);

    if (result.success) {
      toast({ title: t('users.deleteSuccess') });
      setIsAlertOpen(false);
      setSelectedUser(null);
    } else {
      toast({ variant: 'destructive', title: t('users.deleteFailed'), description: result.error });
      setIsAlertOpen(false);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("users.name")}</TableHead>
            <TableHead>{t("users.email")}</TableHead>
            <TableHead>{t("users.role")}</TableHead>
            <TableHead>{t("users.joined")}</TableHead>
            <TableHead className="w-[80px] text-right">{t("inventory.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                    {user.role}
                </Badge>
              </TableCell>
              <TableCell>{format(new Date(user.createdAt), "PP")}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(user)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      {t("inventory.edit")}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                        onClick={() => handleDeleteClick(user)}
                        disabled={user.id === currentUser?.id}
                        className="text-destructive focus:text-destructive"
                    >
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
       {users.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
                <p>{t('users.noUsers')}</p>
            </div>
        )}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{t('users.deleteConfirmTitle')}</AlertDialogTitle>
                <AlertDialogDescription>{t('users.deleteConfirmDescription')}</AlertDialogDescription>
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
