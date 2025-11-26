
"use client";

import { useState } from "react";
import { Category } from "@prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Loader2, Plus, Upload, Download } from "lucide-react";
import { upsertCategory, deleteCategory } from "@/app/inventory/actions";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "../ui/dialog";
import { useAuth } from "@/context/auth-context";
import { CategoryImportDialog } from "./category-import-dialog";

const CategorySchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Category name is required"),
});

type CategoryFormValues = z.infer<typeof CategorySchema>;

export function CategoriesPageClient({ initialCategories }: { initialCategories: Category[] }) {
    const { t } = useTranslation();
    const { toast } = useToast();
    const { user } = useAuth();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(CategorySchema),
    });

    const { formState: { isSubmitting, errors }, register, handleSubmit, reset, setError } = form;

    const handleOpenSheet = (category: Category | null) => {
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
        
        const result = await upsertCategory(formData);

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
    
    const handleDeleteClick = (category: Category) => {
        setSelectedCategory(category);
        setIsAlertOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedCategory || !user) return;
        setIsDeleting(true);
        const result = await deleteCategory(selectedCategory.id, user.id);
        setIsDeleting(false);
        if (result.success) {
            toast({ title: "Category Deleted" });
            setIsAlertOpen(false);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
            setIsAlertOpen(false);
        }
    };

    const downloadFile = (data: string, fileName: string, fileType: string) => {
        const blob = new Blob([data], { type: fileType });
        const a = document.createElement("a");
        a.download = fileName;
        a.href = window.URL.createObjectURL(blob);
        const clickEvt = new MouseEvent("click", {
            view: window,
            bubbles: true,
            cancelable: true,
        });
        a.dispatchEvent(clickEvt);
        a.remove();
    };

    const handleExportJSON = () => {
        const data = initialCategories.map(c => ({ name: c.name }));
        downloadFile(JSON.stringify(data, null, 2), "categories.json", "application/json");
    };

    const handleExportCSV = () => {
        const headers = ["name"];
        const csvContent = [
            headers.join(","),
            ...initialCategories.map(c => `"${c.name}"`),
        ].join("\n");
        downloadFile(csvContent, "categories.csv", "text/csv");
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                    <div>
                        <CardTitle>{t('inventory.manageCategories')}</CardTitle>
                        <CardDescription>{t('inventory.categoriesDescription')}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsImportOpen(true)} className="justify-center">
                            <Upload className="mr-2 h-4 w-4" />
                            Import
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="justify-center">
                                    <Download className="mr-2 h-4 w-4" />
                                    Export
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={handleExportJSON}>Export as JSON</DropdownMenuItem>
                                <DropdownMenuItem onClick={handleExportCSV}>Export as CSV</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button onClick={() => handleOpenSheet(null)}>
                            <Plus className="mr-2 h-4 w-4" /> {t('inventory.addCategory')}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('inventory.categoryName')}</TableHead>
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
                        <p className="text-center text-muted-foreground py-12">{t('inventory.noCategories')}</p>
                     )}
                </CardContent>
            </Card>

            <CategoryImportDialog isOpen={isImportOpen} onOpenChange={setIsImportOpen} />

            <Dialog open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? t('inventory.editCategory') : t('inventory.addCategory')}</DialogTitle>
                        <DialogDescription>{t('inventory.categoryFormDescription')}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">{t('inventory.categoryName')}</Label>
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
                        <AlertDialogTitle>{t('inventory.deleteCategoryConfirmTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>{t('inventory.deleteCategoryConfirmDescription')}</AlertDialogDescription>
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
