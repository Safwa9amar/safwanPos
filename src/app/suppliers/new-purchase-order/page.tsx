
import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { getSuppliers } from "../actions";
import { getProducts } from "@/app/inventory/actions";
import { NewPurchaseOrderClient } from "@/components/suppliers/new-purchase-order-client";
import { redirect } from "next/navigation";
import { getUserIdFromRequest } from "@/lib/server-auth";
import { ProductWithCategoryAndBarcodes } from "@/types";

export default async function NewPurchaseOrderPage() {
    const userId = await getUserIdFromRequest();
    if (!userId) {
        redirect('/login');
    }

    const [suppliersRes, productsRes] = await Promise.all([
        getSuppliers(userId),
        getProducts(userId)
    ]);

    const error = suppliersRes.error || productsRes.error;

    if (error) {
        return (
            <AuthGuard>
                <MainLayout>
                    <div className="p-4">Error loading data: {error}</div>
                </MainLayout>
            </AuthGuard>
        );
    }

    return (
        <AuthGuard>
            <MainLayout>
                <NewPurchaseOrderClient 
                    suppliers={suppliersRes.suppliers || []} 
                    products={productsRes.products as ProductWithCategoryAndBarcodes[] || []} 
                />
            </MainLayout>
        </AuthGuard>
    );
}
