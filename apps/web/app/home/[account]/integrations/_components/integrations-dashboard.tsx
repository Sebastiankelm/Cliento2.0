'use client';

import { Mail } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { Trans } from '@kit/ui/trans';
import { toast } from '@kit/ui/sonner';

interface IntegrationsDashboardProps {
  accountId: string;
  canManage: boolean;
}

export function IntegrationsDashboard({
  accountId,
  canManage,
}: IntegrationsDashboardProps) {
  const handleConnectGmail = () => {
    toast.info('Gmail OAuth integration coming soon');
  };

  const handleConnectOutlook = () => {
    toast.info('Outlook OAuth integration coming soon');
  };

  return (
    <div className="flex flex-col space-y-4">
      <div>
        <h2 className="text-2xl font-bold">
          <Trans i18nKey={'integrations:integrations'} defaults={'Integrations'} />
        </h2>
        <p className="text-muted-foreground">
          Connect your email and calendar accounts
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Gmail
            </CardTitle>
            <CardDescription>
              Connect your Gmail account to sync emails and calendar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleConnectGmail} disabled={!canManage}>
              Connect Gmail
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              OAuth integration coming soon
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Outlook
            </CardTitle>
            <CardDescription>
              Connect your Outlook account to sync emails and calendar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleConnectOutlook} disabled={!canManage}>
              Connect Outlook
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              OAuth integration coming soon
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
