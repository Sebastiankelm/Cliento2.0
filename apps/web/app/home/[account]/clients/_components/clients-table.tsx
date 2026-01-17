'use client';

import Link from 'next/link';

import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Tables } from '@kit/supabase/database';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { DataTable } from '@kit/ui/enhanced-data-table';
import { If } from '@kit/ui/if';
import { Trans } from '@kit/ui/trans';

import { DeleteClientDialog } from './delete-client-dialog';

type Client = Tables<'clients'>;

interface ClientsTableProps {
  data: Client[];
  page: number;
  pageSize: number;
  pageCount: number;
  account: {
    id: string;
    slug: string;
    permissions: string[];
  };
  canManageClients: boolean;
}

export function ClientsTable({
  data,
  page,
  pageSize,
  pageCount,
  account,
  canManageClients,
}: ClientsTableProps) {
  const columns = useGetColumns(account, canManageClients);

  return (
    <div>
      <DataTable
        data={data}
        columns={columns}
        pageIndex={page - 1}
        pageSize={pageSize}
        pageCount={pageCount}
        getRowId={(row) => row.id}
      />
    </div>
  );
}

function useGetColumns(
  account: { id: string; slug: string },
  canManageClients: boolean,
): ColumnDef<Client>[] {
  const { t } = useTranslation('clients');

  return [
    {
      header: t('name', { defaultValue: 'Name' }),
      cell: ({ row }) => {
        const client = row.original;
        const fullName = `${client.first_name} ${client.last_name}`;

        return (
          <Link
            href={`/home/${account.slug}/clients/${client.id}`}
            className="hover:underline font-medium"
          >
            {fullName}
          </Link>
        );
      },
    },
    {
      header: t('email', { defaultValue: 'Email' }),
      accessorKey: 'email',
      cell: ({ row }) => {
        const email = row.original.email;
        return email ? (
          <a href={`mailto:${email}`} className="hover:underline text-blue-600">
            {email}
          </a>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      header: t('phone', { defaultValue: 'Phone' }),
      accessorKey: 'phone',
      cell: ({ row }) => {
        const phone = row.original.phone;
        return phone || <span className="text-muted-foreground">—</span>;
      },
    },
    {
      header: t('company', { defaultValue: 'Company' }),
      accessorKey: 'company',
      cell: ({ row }) => {
        const company = row.original.company;
        return company || <span className="text-muted-foreground">—</span>;
      },
    },
    {
      header: t('status', { defaultValue: 'Status' }),
      accessorKey: 'status',
      cell: ({ row }) => {
        const status = row.original.status;
        const statusColors: Record<string, 'default' | 'secondary' | 'outline'> = {
          lead: 'outline',
          active: 'default',
          customer: 'default',
          inactive: 'secondary',
        };

        return (
          <Badge variant={statusColors[status] || 'outline'}>
            {status}
          </Badge>
        );
      },
    },
    {
      header: t('source', { defaultValue: 'Source' }),
      accessorKey: 'source',
      cell: ({ row }) => {
        const source = row.original.source;
        return source || <span className="text-muted-foreground">—</span>;
      },
    },
    {
      header: t('createdAt', { defaultValue: 'Created' }),
      accessorKey: 'created_at',
      cell: ({ row }) => {
        const date = new Date(row.original.created_at);
        return date.toLocaleDateString();
      },
    },
    {
      header: '',
      id: 'actions',
      cell: ({ row }) => {
        const client = row.original;
        const canUpdate = canManageClients || account.permissions.includes('clients.update');
        const canDelete = canManageClients || account.permissions.includes('clients.delete');

        return (
          <div className="flex justify-end gap-x-2">
            <If condition={canUpdate}>
              <Link href={`/home/${account.slug}/clients/${client.id}`}>
                <Button variant="ghost" size="icon" data-test={`edit-client-${client.id}`}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </Link>
            </If>

            <If condition={canDelete}>
              <DeleteClientDialog clientId={client.id} clientName={`${client.first_name} ${client.last_name}`}>
                <Button variant="ghost" size="icon" data-test={`delete-client-${client.id}`}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </DeleteClientDialog>
            </If>
          </div>
        );
      },
    },
  ];
}
