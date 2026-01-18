'use client';

import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';
import { Plus, Building2, Users } from 'lucide-react';

import { loadPersonalDashboard } from '../_lib/server/personal-dashboard.loader';

type DashboardData = Awaited<ReturnType<typeof loadPersonalDashboard>>;

interface PersonalDashboardProps {
  data: DashboardData;
  canCreateTeamAccount: boolean;
}

export function PersonalDashboard({
  data,
  canCreateTeamAccount,
}: PersonalDashboardProps) {
  const { totalClients, totalTeamAccounts, teamAccounts, statusCounts } = data;

  return (
    <div className="flex flex-col space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <Trans i18nKey={'common:teamAccounts'} defaults={'Team Accounts'} />
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTeamAccounts}</div>
            <p className="text-xs text-muted-foreground">
              <Trans
                i18nKey={'dashboard:totalTeamAccounts'}
                defaults={'Total team accounts'}
              />
            </p>
          </CardContent>
        </Card>

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
                defaults={'Clients across all accounts'}
              />
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <Trans i18nKey={'clients:active'} defaults={'Active'} />
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
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
      </div>

      {/* Team Accounts List */}
      {teamAccounts.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">
              <Trans i18nKey={'dashboard:teamAccounts'} defaults={'Team Accounts'} />
            </h2>
            {canCreateTeamAccount && (
              <Link href="/home">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  <Trans
                    i18nKey={'teams:createTeam'}
                    defaults={'Create Team Account'}
                  />
                </Button>
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teamAccounts.map((account) => (
              <Link
                key={account.id}
                href={`/home/${account.slug}`}
                className="block"
              >
                <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{account.name}</CardTitle>
                      {account.picture_url && (
                        <img
                          src={account.picture_url}
                          alt={account.name}
                          className="h-8 w-8 rounded-full"
                        />
                      )}
                    </div>
                    <CardDescription>
                      <Trans
                        i18nKey={'dashboard:viewDashboard'}
                        defaults={'View dashboard'}
                      />
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          <Trans i18nKey={'clients:clients'} defaults={'Clients'} />
                        </span>
                        <span className="text-lg font-semibold">
                          {account.totalClients}
                        </span>
                      </div>
                      {Object.keys(account.statusCounts).length > 0 && (
                        <div className="pt-2 border-t">
                          <div className="text-xs text-muted-foreground mb-1">
                            <Trans
                              i18nKey={'dashboard:byStatus'}
                              defaults={'By status'}
                            />
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(account.statusCounts).map(
                              ([status, count]) => (
                                <span
                                  key={status}
                                  className="text-xs px-2 py-1 bg-muted rounded"
                                >
                                  {status}: {count}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              <Trans
                i18nKey={'dashboard:noTeamAccounts'}
                defaults={'No Team Accounts'}
              />
            </CardTitle>
            <CardDescription>
              <Trans
                i18nKey={'dashboard:createFirstTeamAccount'}
                defaults={
                  'Create your first team account to start managing clients'
                }
              />
            </CardDescription>
          </CardHeader>
          <CardContent>
            {canCreateTeamAccount ? (
              <Link href="/home">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  <Trans
                    i18nKey={'teams:createTeam'}
                    defaults={'Create Team Account'}
                  />
                </Button>
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground">
                <Trans
                  i18nKey={'dashboard:teamAccountsDisabled'}
                  defaults={'Team accounts are disabled'}
                />
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
