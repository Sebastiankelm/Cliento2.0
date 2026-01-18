'use client';

import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';
import { Users, UserCircle } from 'lucide-react';

import { loadPersonalDashboard } from '../_lib/server/personal-dashboard.loader';

type DashboardData = Awaited<ReturnType<typeof loadPersonalDashboard>>;

interface PersonalDashboardProps {
  data: DashboardData;
}

export function PersonalDashboard({ data }: PersonalDashboardProps) {
  const { totalClients, statusCounts } = data;

  return (
    <div className="flex flex-col space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <Trans i18nKey={'clients:totalClients'} defaults={'Total Clients'} />
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground">
              <Trans
                i18nKey={'dashboard:allClients'}
                defaults={'Total clients in your organization'}
              />
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <Trans i18nKey={'clients:active'} defaults={'Active'} />
            </CardTitle>
            <UserCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statusCounts.active || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              <Trans
                i18nKey={'dashboard:activeClients'}
                defaults={'Active clients'}
              />
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <Trans i18nKey={'clients:inactive'} defaults={'Inactive'} />
            </CardTitle>
            <UserCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statusCounts.inactive || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              <Trans
                i18nKey={'dashboard:inactiveClients'}
                defaults={'Inactive clients'}
              />
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              <Trans i18nKey={'clients:clients'} defaults={'Clients'} />
            </CardTitle>
            <CardDescription>
              <Trans
                i18nKey={'dashboard:manageClients'}
                defaults={'Manage your organization clients'}
              />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/home/clients">
              <Button variant="outline" className="w-full">
                <UserCircle className="mr-2 h-4 w-4" />
                <Trans i18nKey={'clients:viewClients'} defaults={'View Clients'} />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <Trans i18nKey={'common:routes.members'} defaults={'Members'} />
            </CardTitle>
            <CardDescription>
              <Trans
                i18nKey={'dashboard:manageMembers'}
                defaults={'Manage organization members'}
              />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/home/members">
              <Button variant="outline" className="w-full">
                <Users className="mr-2 h-4 w-4" />
                <Trans i18nKey={'common:routes.members'} defaults={'Members'} />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      {Object.keys(statusCounts).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              <Trans i18nKey={'dashboard:byStatus'} defaults={'Clients by Status'} />
            </CardTitle>
            <CardDescription>
              <Trans
                i18nKey={'dashboard:statusBreakdown'}
                defaults={'Breakdown of clients by status'}
              />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div
                  key={status}
                  className="flex items-center gap-2 rounded-lg border px-3 py-2"
                >
                  <span className="text-sm font-medium capitalize">{status}</span>
                  <span className="text-lg font-bold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
