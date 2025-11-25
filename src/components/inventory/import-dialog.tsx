
"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Papa from "papaparse";
import { importProducts } from "@/app/inventory/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, FileCheck2, AlertCircle } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";

interface ImportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

type ImportStatus = 'idle' | 'parsing' | 'uploading' | 'completed' | 'error';

export function ImportDialog({ isOpen, onOpenChange }: ImportDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ImportStatus>('idle');
  const [processedCount, setProcessedCount] = useState(0);
  const [errorDetails, setErrorDetails] = useState<{ row: number; error: string }[]>([]);

  const resetState = () => {
    setFile(null);
    setStatus('idle');
    setProcessedCount(0);
    setErrorDetails([]);
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file || !user) return;
    
    setStatus('parsing');
    setErrorDetails([]);
    setProcessedCount(0);

    const processData = async (data: any[]) => {
        setStatus('uploading');
        const result = await importProducts(user.uid, data);
        if (result.success) {
            setStatus('completed');
            setProcessedCount(result.processed);
            setErrorDetails(result.errors);
        } else {
            setStatus('error');
            setErrorDetails([{row: 0, error: result.error || 'An unknown error occurred during upload.'}]);
        }
    }

    if (file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result;
          const data = JSON.parse(content as string);
          if (Array.isArray(data)) {
            await processData(data);
          } else {
            setStatus('error');
            setErrorDetails([{row: 0, error: "JSON file must contain an array of product objects."}]);
          }
        } catch (err) {
          setStatus('error');
          setErrorDetails([{row: 0, error: "Failed to parse JSON file."}]);
        }
      };
      reader.readAsText(file);
    } else { // Assume CSV
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          await processData(results.data);
        },
        error: (err) => {
          setStatus('error');
          setErrorDetails([{row: 0, error: err.message}]);
        },
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Products</DialogTitle>
          <DialogDescription>
            Upload a CSV or JSON file to import or update products. Barcode is used as the unique key.
          </DialogDescription>
        </DialogHeader>

        {status === 'idle' && (
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="import-file">File (CSV or JSON)</Label>
              <Input id="import-file" type="file" onChange={handleFileChange} accept=".csv, application/json" />
            </div>
            <div className="text-xs text-muted-foreground p-2 border rounded-md">
              <p className="font-semibold">Required columns:</p>
              <ul className="list-disc pl-4">
                <li>name (string)</li>
                <li>barcode (string, unique)</li>
                <li>price (number)</li>
                <li>stock (number)</li>
              </ul>
              <p className="font-semibold mt-2">Optional columns:</p>
              <ul className="list-disc pl-4">
                <li>costPrice (number)</li>
                <li>unit (EACH, KG, G, L, ML)</li>
                <li>image (URL string)</li>
              </ul>
            </div>
          </div>
        )}
        
        {(status === 'parsing' || status === 'uploading') && (
            <div className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">{status === 'parsing' ? 'Parsing file...' : 'Uploading data...'}</p>
            </div>
        )}

        {status === 'completed' && (
            <Alert variant={errorDetails.length > 0 ? "destructive" : "default"}>
                <FileCheck2 className="h-4 w-4" />
                <AlertTitle>Import Complete</AlertTitle>
                <AlertDescription>
                    <p>{processedCount} products processed.</p>
                    {errorDetails.length > 0 && (
                        <div className="mt-4">
                            <p className="font-semibold">{errorDetails.length} rows had errors:</p>
                            <ScrollArea className="h-24 mt-2">
                                <ul className="text-xs list-disc pl-5">
                                    {errorDetails.map((e, i) => <li key={i}>Row {e.row}: {e.error}</li>)}
                                </ul>
                            </ScrollArea>
                        </div>
                    )}
                </AlertDescription>
            </Alert>
        )}

        {status === 'error' && (
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Import Failed</AlertTitle>
                <AlertDescription>
                    <p>{errorDetails[0]?.error || 'An unknown error occurred.'}</p>
                </AlertDescription>
            </Alert>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            {status === 'completed' || status === 'error' ? 'Close' : 'Cancel'}
          </Button>
          {status === 'idle' && (
            <Button type="button" onClick={handleImport} disabled={!file}>
              Import
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
