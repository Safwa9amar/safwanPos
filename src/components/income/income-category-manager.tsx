
"use client";

import { useState } from "react";
import { IncomeCategory } from "@prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Loader2, Plus } from "lucide-react";
import { upsertIncomeCategory, deleteIncomeCategory } from "@/app/income/actions";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "../ui/dialog";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { useAuth } from "@/context/auth-context";

const CategorySchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Category name is required"),
});

type CategoryFormValues = z.infer<typeof CategorySchema>;

export function IncomeCategoryManager({ initialCategories }: { initialCategories: IncomeCategory[] }) {
    const { t } = useTranslation();
    const { toast } = useToast();
    const { user } = useAuth();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<IncomeCategory | null>(null);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<IncomeCategory | null>(null);

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(CategorySchema),
    });

    const { formState: { isSubmitting, errors }, register, handleSubmit, reset, setError } = form;

    const handleOpenSheet = (category: IncomeCategory | null) => {
        setEditingCategory(category);
        reset(category || { name: '' });
        setIsSheetOpen(true);
    };

    const onSubmit = async (data: CategoryFormValues) => {
        if (!user) return toast({ variant: 'destructive', title: 'Authentication Error' });
        
        const formData = new FormData();
        if (data.id) formData.append('id', data.id);
        formData.append('name', data.name);
        formData.append('userId', user.id);
        
        const result = await upsertIncomeCategory(formData);

        if (result.success) {
            toast({ title: editingCategory ? "Category Updated" : "Category Created" });
            setIsSheetOpen(false);
        } else if (result.errors) {
            Object.entries(result.errors).forEach(([field, messages]) => {
                if (messages) {
                    setError(field as 'name', { type: 'manual', message: messages[0] });
                }
            });
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.message });
        }
    };
    
    const handleDeleteClick = (category: IncomeCategory) => {
        setSelectedCategory(category);
        setIsAlertOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedCategory || !user) return;
        setIsDeleting(true);
        const result = await deleteIncomeCategory(selectedCategory.id, user.id);
        setIsDeleting(false);
        if (result.success) {
            toast({ title: "Category Deleted" });
            setIsAlertOpen(false);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
            setIsAlertOpen(false);
        }
    };

    return (
        <div>
            <Card className="border-none shadow-none">
                <CardHeader className="flex flex-row justify-between items-center px-1">
                    <div>
                        <CardTitle className="text-lg">{t('income.manageCategories')}</CardTitle>
                        <CardDescription>{t('income.categoriesDescription')}</CardDescription>
                    </div>
                    <Button variant="outline" onClick={() => handleOpenSheet(null)}>
                        <Plus className="mr-2 h-4 w-4" /> {t('income.addCategory')}
                    </Button>
                </CardHeader>
                <CardContent className="px-1">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('income.categoryName')}</TableHead>
                                <TableHead className="text-right w-24">{t('inventory.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {initialCategories.map(cat => (
                                <TableRow key={cat.id}>
                                    <TableCell>{cat.name}</TableCell>
                                    <TableCell className="text-right">
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleOpenSheet(cat)}>
                                                    <Pencil className="mr-2 h-4 w-4" /> {t('inventory.edit')}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDeleteClick(cat)} className="text-destructive focus:text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" /> {t('inventory.delete')}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                     {initialCategories.length === 0 && (
                        <p className="text-center text-muted-foreground py-12">{t('income.noCategories')}</p>
                     )}
                </CardContent>
            </Card>

            <Dialog open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? t('income.editCategory') : t('income.addCategory')}</DialogTitle>
                        <DialogDescription>{t('income.categoryFormDescription')}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">{t('income.categoryName')}</Label>
                            <Input id="name" {...register('name')} />
                            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline" disabled={isSubmitting}>{t('pos.cancelButton')}</Button>
                            </DialogClose>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {t('inventory.save')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('income.deleteCategoryConfirmTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>{t('income.deleteCategoryConfirmDescription')}</AlertDialogDescription>
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
