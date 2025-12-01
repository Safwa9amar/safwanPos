
"use client";

import { CompanyProfile } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceSettingsForm } from "./invoice-settings-form";
import { useTranslation } from "@/hooks/use-translation";

interface InvoiceSettingsClientProps {
  initialProfile: CompanyProfile | null;
}

export function InvoiceSettingsClient({ initialProfile }: InvoiceSettingsClientProps) {
  const { t } = useTranslation();

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Invoice & Receipt Settings</CardTitle>
          <CardDescription>
            Customize the information that appears on your printed sales receipts and invoices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InvoiceSettingsForm initialProfile={initialProfile} />
        </CardContent>
      </Card>
    </div>
  );
}
