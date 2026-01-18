'use client';

import { useState } from 'react';

import { Upload } from 'lucide-react';

import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@kit/ui/dialog';
import { toast } from '@kit/ui/sonner';
import { Trans } from '@kit/ui/trans';

interface ImportClientsDialogProps {
  accountId: string;
}

export function ImportClientsDialog({ accountId }: ImportClientsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleImport = async (file: File) => {
    try {
      // TODO: Implement CSV/Excel import
      toast.info('Import functionality coming soon');
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to import clients');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          <Trans i18nKey={'clients:import'} defaults={'Import'} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans i18nKey={'clients:importClients'} defaults={'Import Clients'} />
          </DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file to import clients
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleImport(file);
              }
            }}
            className="w-full"
          />
          <p className="text-sm text-muted-foreground">
            Import functionality coming soon
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
