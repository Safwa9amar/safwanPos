"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Product } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { addProduct, updateProduct } from "@/app/inventory/actions";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const ProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  barcode: z.string().min(1, "Barcode is required"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  costPrice: z.coerce.number().min(0, "Cost price cannot be negative"),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
});

type ProductFormValues = z.infer<typeof ProductSchema>;

export function ProductForm({ product, onFinished }: { product: Product | null, onFinished: () => void }) {
  const { t } = useTranslation("translation");
  const { toast } = useToast();
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      id: product?.id,
      name: product?.name || "",
      barcode: product?.barcode || "",
      price: product?.price || 0,
      costPrice: product?.costPrice || 0,
      stock: product?.stock || 0,
    },
  });

  const { formState } = form;

  const onSubmit = async (data: ProductFormValues) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        if(value !== undefined && value !== null){
            formData.append(key, String(value));
        }
    });

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
                form.setError(field as keyof ProductFormValues, { type: 'manual', message: messages[0] });
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...form.register("id")} />
      <div className="space-y-2">
        <Label htmlFor="name">{t("inventory.productName")}</Label>
        <Input id="name" {...form.register("name")} />
        {formState.errors.name && <p className="text-sm text-destructive">{formState.errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="barcode">{t("inventory.barcode")}</Label>
        <Input id="barcode" {...form.register("barcode")} />
        {formState.errors.barcode && <p className="text-sm text-destructive">{formState.errors.barcode.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">{t("inventory.price")}</Label>
          <Input id="price" type="number" step="0.01" {...form.register("price")} />
          {formState.errors.price && <p className="text-sm text-destructive">{formState.errors.price.message}</p>}
        </div>
        <div className="space-y-2">
            <Label htmlFor="costPrice">{t("inventory.costPrice")}</Label>
            <Input id="costPrice" type="number" step="0.01" {...form.register("costPrice")} />
            {formState.errors.costPrice && <p className="text-sm text-destructive">{formState.errors.costPrice.message}</p>}
        </div>
      </div>
       <div className="space-y-2">
          <Label htmlFor="stock">{t("inventory.stock")}</Label>
          <Input id="stock" type="number" step="1" {...form.register("stock")} />
          {formState.errors.stock && <p className="text-sm text-destructive">{formState.errors.stock.message}</p>}
        </div>
      <Button type="submit" disabled={formState.isSubmitting} className="w-full">
        {formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {formState.isSubmitting ? t("inventory.saving") : t("inventory.save")}
      </Button>
    </form>
  );
}
