'use client';

import { Download } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { toast } from '@kit/ui/sonner';
import { Trans } from '@kit/ui/trans';

interface ExportClientsButtonProps {
  accountId: string;
}

export function ExportClientsButton({ accountId }: ExportClientsButtonProps) {
  const handleExport = async () => {
    try {
      // TODO: Implement CSV/Excel export
      toast.info('Export functionality coming soon');
    } catch (error) {
      toast.error('Failed to export clients');
    }
  };

  return (
    <Button variant="outline" onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" />
      <Trans i18nKey={'clients:export'} defaults={'Export'} />
    </Button>
  );
}
