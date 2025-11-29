
"use client";

import { useState } from "react";
import { CapitalEntry } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Banknote, PlusCircle, Lightbulb } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { IncomeTable } from "./income-table";
import { IncomeSheet } from "./income-sheet";

interface IncomePageClientProps {
  initialEntries: CapitalEntry[];
}

export function IncomePageClient({ initialEntries }: IncomePageClientProps) {
  const { t } = useTranslation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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
          <Button onClick={() => setIsSheetOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("income.add")}
          </Button>
        </CardHeader>
        <CardContent>
          <IncomeTable entries={initialEntries} />
        </CardContent>
      </Card>
      
      <IncomeSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />
    </div>
  );
}
