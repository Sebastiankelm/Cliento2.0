'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { Trans } from '@kit/ui/trans';

interface AutomationDashboardProps {
  accountId: string;
  canManage: boolean;
}

export function AutomationDashboard({ accountId, canManage }: AutomationDashboardProps) {
  return (
    <div className="flex flex-col space-y-4">
      <div>
        <h2 className="text-2xl font-bold">
          <Trans i18nKey={'automation:automation'} defaults={'Automation'} />
        </h2>
        <p className="text-muted-foreground">
          Automate your CRM workflows with rules and sequences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Automation Rules</CardTitle>
            <CardDescription>Create rules to automate actions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Rule builder coming soon. You can create IF-THEN rules to automate
              status changes, assignments, and task creation.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Sequences</CardTitle>
            <CardDescription>Automated email follow-ups</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Sequence builder coming soon. Create automated email sequences
              with delays and conditions.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
