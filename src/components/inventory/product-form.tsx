
"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Product, Category, Barcode } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { addProduct, updateProduct } from "@/app/inventory/actions";
import { CalendarIcon, Loader2, PlusCircle, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/auth-context";
import { ProductWithCategoryAndBarcodes } from "@/types";

const units = ["EACH", "KG", "G", "L", "ML"] as const;

const ProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  barcodes: z.array(z.object({ value: z.string().min(1, "Barcode cannot be empty") })).min(1, "At least one barcode is required"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  costPrice: z.coerce.number().min(0, "Cost price cannot be negative"),
  stock: z.coerce.number().min(0, "Stock cannot be negative"),
  categoryId: z.string().optional().nullable(),
  unit: z.enum(units),
  image: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  productionDate: z.coerce.date().optional().nullable(),
  expiryDate: z.coerce.date().optional().nullable(),
});

type ProductFormValues = z.infer<typeof ProductSchema>;

// Helper to format Date to 'yyyy-MM-dd' for input[type=date]
const formatDateForInput = (date: Date | null | undefined): string => {
  if (!date) return '';
  // Adjust for timezone offset before formatting
  const tzOffset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - tzOffset);
  return localDate.toISOString().split('T')[0];
};

interface ProductFormProps {
    product: ProductWithCategoryAndBarcodes | null;
    categories: Category[];
    onFinished: () => void;
    initialData?: Partial<ProductWithCategoryAndBarcodes>;
}

export function ProductForm({ product, categories, onFinished, initialData }: ProductFormProps) {
  const { t } = useTranslation("translation");
  const { toast } = useToast();
  const { user } = useAuth();

  const getDefaultValues = () => {
    if (product) { // Editing existing product
        return {
            id: product.id,
            name: product.name || "",
            barcodes: product.barcodes?.map(b => ({ value: b.code })) || [{ value: "" }],
            price: product.price || 0,
            costPrice: product.costPrice || 0,
            stock: product.stock || 0,
            categoryId: product.categoryId || "__none__",
            unit: (product.unit as ProductFormValues['unit']) || "EACH",
            image: product.image || "",
            productionDate: product.productionDate ? new Date(product.productionDate) : null,
            expiryDate: product.expiryDate ? new Date(product.expiryDate) : null,
        }
    }
    if (initialData) { // Creating new product with pre-filled data
        return {
            name: initialData.name || "",
            image: initialData.image || "",
            barcodes: [{ value: "" }],
            price: 0,
            costPrice: 0,
            stock: 0,
            categoryId: "__none__",
            unit: "EACH",
            productionDate: null,
            expiryDate: null,
        }
    }
    // Creating a new product from scratch
    return {
        name: "",
        barcodes: [{ value: "" }],
        price: 0,
        costPrice: 0,
        stock: 0,
        categoryId: "__none__",
        unit: "EACH",
        image: "",
        productionDate: null,
        expiryDate: null,
    }
  }

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(ProductSchema),
    defaultValues: getDefaultValues(),
  });

  const { control, formState, register, handleSubmit, setValue, watch } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "barcodes"
  });

  const onSubmit = async (data: ProductFormValues) => {
    if (!user) {
        toast({ variant: "destructive", title: "Authentication Error" });
        return;
    }
    const formData = new FormData();
    const { barcodes, ...restOfData } = data;
    
    // Append barcodes as an array
    barcodes.forEach((barcode, index) => {
        formData.append(`barcodes[]`, barcode.value);
    });
    
    // Append the rest of the data
    Object.entries(restOfData).forEach(([key, value]) => {
        if (key === 'categoryId' && value === '__none__') {
            formData.append(key, 'null');
        } else if (value !== undefined && value !== null) {
            formData.append(key, value instanceof Date ? value.toISOString() : String(value));
        }
    });
    formData.append('userId', user.id);

    const action = product ? updateProduct : addProduct;
    const result = await action(formData);

    if (result.success) {
      toast({
        title: product ? "Product Updated" : "Product Added",
        description: `${data.name} has been saved.`,
      });
      onFinished();
    } else if (result.errors) {
        Object.entries(result.errors).forEach(([field, messages]) => {
            if(messages){
                form.setError(field as keyof ProductFormValues, { type: 'manual', message: messages.join(', ') });
            }
        })
    } else {
      toast({
        variant: "destructive",
        title: `Error ${product ? 'updating' : 'adding'} product`,
        description: result.message || "An unknown error occurred.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("id")} />
      
      <div className="space-y-2">
        <Label htmlFor="name">{t("inventory.productName")}</Label>
        <Input id="name" {...register("name")} />
        {formState.errors.name && <p className="text-sm text-destructive">{formState.errors.name.message}</p>}
      </div>
      
      <div className="space-y-2">
        <Label>{t("inventory.barcode")}</Label>
        {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-center">
                <Input {...register(`barcodes.${index}.value`)} />
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                    <Trash2 className="h-4 w-4 text-destructive"/>
                </Button>
            </div>
        ))}
         <Button type="button" variant="outline" size="sm" onClick={() => append({ value: "" })}>
            <PlusCircle className="mr-2 h-4 w-4"/> Add Barcode
        </Button>
        {formState.errors.barcodes && <p className="text-sm text-destructive">{formState.errors.barcodes.message || formState.errors.barcodes.root?.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">{t("inventory.price")}</Label>
          <Input id="price" type="number" step="0.01" {...register("price")} />
          {formState.errors.price && <p className="text-sm text-destructive">{formState.errors.price.message}</p>}
        </div>
        <div className="space-y-2">
            <Label htmlFor="costPrice">{t("inventory.costPrice")}</Label>
            <Input id="costPrice" type="number" step="0.01" {...register("costPrice")} />
            {formState.errors.costPrice && <p className="text-sm text-destructive">{formState.errors.costPrice.message}</p>}
        </div>
      </div>
      
       <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
              <Label htmlFor="stock">{t("inventory.stock")}</Label>
              <Input id="stock" type="number" step={watch('unit') === 'EACH' ? '1' : '0.001'} {...register("stock")} />
              {formState.errors.stock && <p className="text-sm text-destructive">{formState.errors.stock.message}</p>}
          </div>
          <div className="space-y-2">
             <Label htmlFor="unit">{t('inventory.unit')}</Label>
             <Select value={watch('unit')} onValueChange={(value: ProductFormValues['unit']) => setValue('unit', value)}>
                <SelectTrigger id="unit">
                    <SelectValue placeholder={t('inventory.selectUnit')} />
                </SelectTrigger>
                <SelectContent>
                    {units.map(unit => (
                        <SelectItem key={unit} value={unit}>{t(`units.${unit}`)}</SelectItem>
                    ))}
                </SelectContent>
             </Select>
             {formState.errors.unit && <p className="text-sm text-destructive">{formState.errors.unit.message}</p>}
          </div>
       </div>

        <div className="space-y-2">
            <Label htmlFor="categoryId">{t('inventory.category')}</Label>
            <Select value={watch('categoryId') || '__none__'} onValueChange={(value) => setValue('categoryId', value)}>
                <SelectTrigger id="categoryId">
                    <SelectValue placeholder={t('inventory.selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="__none__">{t('inventory.noCategory')}</SelectItem>
                    {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        <div className="space-y-2">
            <Label htmlFor="image">{t('inventory.imageUrl')}</Label>
            <Input id="image" {...register("image")} placeholder="https://example.com/image.png"/>
            {formState.errors.image && <p className="text-sm text-destructive">{formState.errors.image.message}</p>}
        </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="productionDate">تاريخ الإنتاج</Label>
           <Input 
             id="productionDate"
             type="date"
             defaultValue={formatDateForInput(watch('productionDate'))}
             onChange={(e) => setValue('productionDate', e.target.value ? new Date(e.target.value) : null)}
           />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expiryDate">تاريخ انتهاء الصلاحية</Label>
          <Input 
             id="expiryDate"
             type="date"
             defaultValue={formatDateForInput(watch('expiryDate'))}
             onChange={(e) => setValue('expiryDate', e.target.value ? new Date(e.target.value) : null)}
           />
        </div>
      </div>

      <Button type="submit" disabled={formState.isSubmitting} className="w-full">
        {formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {formState.isSubmitting ? t("inventory.saving") : t("inventory.save")}
      </Button>
    </form>
  );
}
