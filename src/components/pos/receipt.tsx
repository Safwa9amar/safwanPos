"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Icons } from "../icons";
import { useEffect } from "react";
import { Printer, CheckCircle } from "lucide-react";

type CompletedSale = {
  id: number;
  saleDate: Date;
  totalAmount: number;
  items: {
    quantity: number;
    price: number;
    product: {
      name: string;
    }
  }[];
}

type ReceiptProps = {
  sale: CompletedSale;
  onDone: () => void;
};

export function Receipt({ sale, onDone }: ReceiptProps) {
  
  useEffect(() => {
    const handlePrint = () => {
        // This is a browser-only action
        setTimeout(() => window.print(), 500);
    }
    handlePrint();
  }, []);

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-4">
        <div className="absolute top-4 right-4 no-print space-x-2">
            <Button onClick={onDone}><CheckCircle className="mr-2 h-4 w-4"/> New Sale</Button>
            <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4"/> Print</Button>
        </div>

        <div className="w-full max-w-sm mx-auto print-only">
             <Card className="shadow-none border-none">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <Icons.logo className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle>PrismaPOS</CardTitle>
                    <CardDescription>Sale Receipt</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between text-sm text-muted-foreground mb-4">
                        <span>Sale ID: #{sale.id}</span>
                        <span>Date: {new Date(sale.saleDate).toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="my-4 space-y-2">
                        {sale.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-baseline text-sm">
                                <div>
                                    <p>{item.product.name}</p>
                                    <p className="text-muted-foreground">
                                        {item.quantity} x ${item.price.toFixed(2)}
                                    </p>
                                </div>
                                <p>${(item.quantity * item.price).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                    <Separator />
                    <div className="my-4 space-y-2">
                        <div className="flex justify-between font-semibold text-lg">
                            <span>Total</span>
                            <span>${sale.totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                    <Separator />
                    <p className="text-center text-sm text-muted-foreground mt-6">
                        Thank you for your purchase!
                    </p>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
