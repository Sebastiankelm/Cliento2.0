'use client';

import Link from 'next/link';
import { useMemo } from 'react';

import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';
import { DataTable } from '@kit/ui/data-table';
import { If } from '@kit/ui/if';
import { Badge } from '@kit/ui/badge';

import { DeleteClientDialog } from '~/home/[account]/clients/_components/delete-client-dialog';

type Client = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: string;
  source: string | null;
  notes: string | null;
  account_id: string;
  created_at: string;
  updated_at: string | null;
};

interface ClientsTableProps {
  data: Client[];
  account: { id: string; slug: string };
  canManageClients: boolean;
}

export function ClientsTable({
  data,
  account,
  canManageClients,
}: ClientsTableProps) {
  const columns = useGetColumns(account, canManageClients);

  return <DataTable data={data} columns={columns} />;
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
            href={`/home/clients/${client.id}`}
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
        return (
          <Badge variant="outline" className="capitalize">
            {status}
          </Badge>
        );
      },
    },
    {
      header: '',
      id: 'actions',
      cell: ({ row }) => {
        const client = row.original;
        const canUpdate = canManageClients;
        const canDelete = canManageClients;

        return (
          <div className="flex justify-end gap-x-2">
            <If condition={canUpdate}>
              <Link href={`/home/clients/${client.id}`}>
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
