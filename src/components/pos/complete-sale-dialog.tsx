

"use client";

import { useState } from 'react';
import { useMultiCart } from '@/hooks/use-multi-cart';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CreditCard, Loader2, Banknote, User } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { useCurrency } from '@/hooks/use-currency';
import { Customer } from '@prisma/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList, CommandGroup } from '../ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

type PaymentType = "CASH" | "CARD" | "CREDIT";

interface CompleteSaleDialogProps {
    onConfirm: (paymentType: PaymentType, customerId?: string, amountPaid?: number) => void;
    cart: ReturnType<typeof useMultiCart>;
    isCompleting: boolean;
    customers: Customer[];
}

export function CompleteSaleDialog({ onConfirm, cart, isCompleting, customers }: CompleteSaleDialogProps) {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();
  const activeCart = cart.activeCart;
  
  const [open, setOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [paymentType, setPaymentType] = useState<PaymentType>('CASH');
  const [amountPaid, setAmountPaid] = useState<number | string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const handleConfirm = () => {
    const paidAmountNumber = typeof amountPaid === 'string' ? parseFloat(amountPaid) : amountPaid;
    
    // For cash/card, if no amount is entered, assume full payment
    const finalAmountPaid = (paymentType === 'CASH' || paymentType === 'CARD') && (paidAmountNumber === undefined || isNaN(paidAmountNumber))
        ? activeCart.totalAmount
        : paidAmountNumber;

    onConfirm(paymentType, selectedCustomer?.id, finalAmountPaid || undefined);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
        // Reset state on close
        setPaymentType('CASH');
        setAmountPaid('');
        setSelectedCustomer(null);
    }
    setOpen(isOpen);
  }

  const debt = selectedCustomer ? activeCart.totalAmount - (Number(amountPaid) || 0) : 0;
  const newBalance = selectedCustomer ? selectedCustomer.balance + debt : 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full mt-4" size="lg" disabled={activeCart.items.length === 0 || isCompleting}>
          <CreditCard className="mr-2 h-5 w-5" />
          {isCompleting ? t('pos.processing') : t('pos.completeSaleButton')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('pos.confirmSaleTitle')}</DialogTitle>
          <div className="flex justify-between items-center text-3xl pt-4">
              <span className="text-muted-foreground">{t('pos.total')}</span>
              <span className="font-bold text-primary">{formatCurrency(activeCart.totalAmount)}</span>
          </div>
        </DialogHeader>
        
        <Tabs value={paymentType} onValueChange={(value) => setPaymentType(value as PaymentType)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="CASH"><Banknote className="mr-2 h-4 w-4"/>{t('pos.payment.cash')}</TabsTrigger>
                <TabsTrigger value="CARD"><CreditCard className="mr-2 h-4 w-4"/>{t('pos.payment.card')}</TabsTrigger>
                <TabsTrigger value="CREDIT"><User className="mr-2 h-4 w-4"/>{t('pos.payment.credit')}</TabsTrigger>
            </TabsList>
            <TabsContent value="CASH" className="space-y-4 pt-4">
                <Label htmlFor="cash-paid">{t('pos.amountPaid')}</Label>
                <Input id="cash-paid" type="number" placeholder={formatCurrency(activeCart.totalAmount)} value={amountPaid} onChange={e => setAmountPaid(e.target.value)} />
            </TabsContent>
            <TabsContent value="CARD" className="pt-4">
                 <p className="text-sm text-muted-foreground">{t('pos.cardFullAmount')}</p>
            </TabsContent>
            <TabsContent value="CREDIT" className="space-y-4 pt-4">
                 <div className="space-y-2">
                    <Label>{t('customers.selectCustomer')}</Label>
                     <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" aria-expanded={popoverOpen} className="w-full justify-between">
                                {selectedCustomer ? selectedCustomer.name : t('customers.selectCustomer')}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                                <CommandInput placeholder={t('customers.searchCustomer')} />
                                <CommandList>
                                    <CommandEmpty>{t('customers.noCustomersFound')}</CommandEmpty>
                                    <CommandGroup>
                                        {customers.map((customer) => (
                                            <CommandItem
                                                key={customer.id}
                                                value={customer.name}
                                                onSelect={() => {
                                                    setSelectedCustomer(customer);
                                                    setPopoverOpen(false);
                                                }}
                                            >
                                                {customer.name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                 </div>
                 {selectedCustomer && (
                     <>
                        <div className="space-y-2">
                            <Label htmlFor="credit-paid">{t('pos.amountPaid')}</Label>
                            <Input id="credit-paid" type="number" placeholder="0.00" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} />
                        </div>
                        <div className="text-sm space-y-1 rounded-md border p-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('customers.currentBalance')}</span>
                                <span>{formatCurrency(selectedCustomer.balance)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('customers.debtFromSale')}</span>
                                <span className="text-destructive">+{formatCurrency(debt)}</span>
                            </div>
                            <div className="flex justify-between font-bold">
                                <span>{t('customers.newBalance')}</span>
                                <span>{formatCurrency(newBalance)}</span>
                            </div>
                        </div>
                     </>
                 )}
            </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isCompleting}>{t('pos.cancelButton')}</Button>
          <Button onClick={handleConfirm} disabled={isCompleting || (paymentType === 'CREDIT' && !selectedCustomer)}>
            {isCompleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('pos.confirmAndPrintButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
