
"use client";

import { useState } from "react";
import { CapitalEntry, IncomeCategory } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Banknote, PlusCircle, Lightbulb } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { IncomeTable } from "./income-table";
import { IncomeSheet } from "./income-sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { IncomeCategoryManager } from "./income-category-manager";

type IncomeEntryWithCategory = CapitalEntry & { category: IncomeCategory | null };

interface IncomePageClientProps {
  initialEntries: IncomeEntryWithCategory[];
  initialCategories: IncomeCategory[];
}

export function IncomePageClient({ initialEntries, initialCategories }: IncomePageClientProps) {
  const { t } = useTranslation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<IncomeEntryWithCategory | null>(null);

  const handleAddEntry = () => {
    setEditingEntry(null);
    setIsSheetOpen(true);
  };
  
  const handleEditEntry = (entry: IncomeEntryWithCategory) => {
    setEditingEntry(entry);
    setIsSheetOpen(true);
  };

  const onSheetClose = () => {
    setEditingEntry(null);
    setIsSheetOpen(false);
  };


  return (
    <div className="p-4 md:p-6 space-y-6">
       <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertTitle>{t('income.addTitle')}</AlertTitle>
        <AlertDescription>
          {t('income.description')}
        </AlertDescription>
      </Alert>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><Banknote /> {t('income.title')}</CardTitle>
            <CardDescription>{t('income.addDescription')}</CardDescription>
          </div>
          <Button onClick={handleAddEntry}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("income.add")}
          </Button>
        </CardHeader>
        <CardContent>
           <Tabs defaultValue="entries">
            <TabsList>
              <TabsTrigger value="entries">{t('income.entries')}</TabsTrigger>
              <TabsTrigger value="categories">{t('income.manageCategories')}</TabsTrigger>
            </TabsList>
            <TabsContent value="entries" className="pt-4">
              <IncomeTable entries={initialEntries} onEdit={handleEditEntry} />
            </TabsContent>
            <TabsContent value="categories" className="pt-4">
              <IncomeCategoryManager initialCategories={initialCategories} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <IncomeSheet
        isOpen={isSheetOpen}
        onOpenChange={onSheetClose}
        entry={editingEntry}
        categories={initialCategories}
      />
    </div>
  );
}
