'use client';

import { useMemo } from 'react';

import { Cell, Pie, PieChart } from 'recharts';

import { Tables } from '@kit/supabase/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from '@kit/ui/chart';
import { Link } from '@kit/ui/link';

import { loadClientsStats } from '../clients/_lib/server/clients-page.loader';

type Client = Tables<'clients'>;

interface CRMDashboardProps {
  stats: Awaited<ReturnType<typeof loadClientsStats>>;
}

export function CRMDashboard({ stats }: CRMDashboardProps) {
  const statusChartData = useMemo(() => {
    return Object.entries(stats.statusCounts).map(([status, count]) => ({
      name: status,
      value: count,
      fill: `var(--color-${status})`,
    }));
  }, [stats.statusCounts]);

  const sourceChartData = useMemo(() => {
    return Object.entries(stats.sourceCounts).map(([source, count]) => ({
      name: source,
      value: count,
      fill: `var(--color-source)`,
    }));
  }, [stats.sourceCounts]);

  const statusConfig = useMemo(() => {
    const config: ChartConfig = {};
    statusChartData.forEach((item) => {
      config[item.name] = { label: item.name, color: `hsl(var(--chart-${statusChartData.indexOf(item) + 1}))` };
    });
    return config;
  }, [statusChartData]);

  return (
    <div className="flex flex-col space-y-4 pb-36">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Clients</CardTitle>
            <CardDescription>All clients in your CRM</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalCount}</div>
          </CardContent>
        </Card>

        {Object.entries(stats.statusCounts).map(([status, count]) => (
          <Card key={status}>
            <CardHeader>
              <CardTitle className="capitalize">{status}</CardTitle>
              <CardDescription>Clients with {status} status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{count}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {statusChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Clients by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={statusConfig} className="h-[300px]">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie data={statusChartData} dataKey="value" cx="50%" cy="50%" outerRadius={80}>
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {stats.recentClients.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Clients</CardTitle>
              <CardDescription>Last 5 clients added</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.recentClients.map((client) => (
                  <div key={client.id} className="flex justify-between">
                    <span>{client.first_name} {client.last_name}</span>
                    <span className="text-muted-foreground text-sm">
                      {new Date(client.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
