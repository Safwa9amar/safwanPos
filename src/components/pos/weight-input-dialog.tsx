
"use client";

import { useState, useEffect } from 'react';
import { Product } from '@prisma/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import { Loader2, Weight } from 'lucide-react';

interface WeightInputDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    product: Product | null;
    onConfirm: (product: Product, weight: number) => void;
}

export function WeightInputDialog({ isOpen, onOpenChange, product, onConfirm }: WeightInputDialogProps) {
    const { t } = useTranslation();
    const [weight, setWeight] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setWeight('');
        }
    }, [isOpen]);
    
    if (!product) return null;
    
    const handleConfirm = () => {
        const weightValue = parseFloat(weight);
        if (!isNaN(weightValue) && weightValue > 0) {
            setIsLoading(true);
            onConfirm(product, weightValue);
            setIsLoading(false);
            onOpenChange(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Weight /> Enter Weight for {product.name}
                    </DialogTitle>
                    <DialogDescription>
                        This product is sold by weight. Please enter the quantity in {product.unit}.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2">
                    <Label htmlFor="weight">Weight ({product.unit})</Label>
                    <Input 
                        id="weight"
                        type="number"
                        step="0.01"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="e.g., 0.5"
                        autoFocus
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                        {t('pos.cancelButton')}
                    </Button>
                    <Button onClick={handleConfirm} disabled={isLoading || !weight || parseFloat(weight) <= 0}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add to Cart
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
