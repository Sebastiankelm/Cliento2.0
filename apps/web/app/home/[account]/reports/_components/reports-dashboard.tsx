'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { Trans } from '@kit/ui/trans';

interface ReportsDashboardProps {
  accountId: string;
}

export function ReportsDashboard({ accountId }: ReportsDashboardProps) {
  return (
    <div className="flex flex-col space-y-4">
      <div>
        <h2 className="text-2xl font-bold">
          <Trans i18nKey={'reports:reports'} defaults={'Reports & Analytics'} />
        </h2>
        <p className="text-muted-foreground">
          View sales performance and analytics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Report</CardTitle>
            <CardDescription>Total revenue and conversions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">$0.00</p>
            <p className="text-sm text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales Funnel</CardTitle>
            <CardDescription>Pipeline performance</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">—</p>
            <p className="text-sm text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Stats</CardTitle>
            <CardDescription>Team activity metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">—</p>
            <p className="text-sm text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
