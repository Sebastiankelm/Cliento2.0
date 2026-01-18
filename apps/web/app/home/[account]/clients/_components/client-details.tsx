'use client';

import { useState, useTransition } from 'react';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';

import { Tables } from '@kit/supabase/database';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { If } from '@kit/ui/if';
import { Separator } from '@kit/ui/separator';
import { toast } from '@kit/ui/sonner';

import { ClientForm } from './client-form';
import { DeleteClientDialog } from './delete-client-dialog';
import { updateClientAction } from '../_lib/server/clients-server-actions';
import { CustomFieldsManager } from '../[id]/_components/custom-fields-manager';
import { InteractionHistory } from '../[id]/_components/interaction-history';

type Client = Tables<'clients'>;
type CustomField = Tables<'client_custom_fields'>;
type CustomFieldValue = Tables<'client_field_values'> & {
  custom_field: CustomField;
};
type Interaction = Tables<'client_interactions'>;

interface ClientDetailsProps {
  client: Client;
  accountId: string;
  accountSlug: string;
  canUpdate: boolean;
  canDelete: boolean;
  backLink?: string; // Optional custom back link
  customFields?: CustomField[];
  fieldValues?: CustomFieldValue[];
  interactions?: Interaction[];
}

export function ClientDetails({
  client,
  accountId,
  accountSlug,
  canUpdate,
  canDelete,
  backLink,
  customFields = [],
  fieldValues = [],
  interactions = [],
}: ClientDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  const statusColors: Record<string, 'default' | 'secondary' | 'outline'> = {
    lead: 'outline',
    active: 'default',
    customer: 'default',
    inactive: 'secondary',
  };

  if (isEditing && canUpdate) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Edit Client</CardTitle>
          <CardDescription>Update client information</CardDescription>
        </CardHeader>
        <CardContent>
          <ClientForm
            accountId={accountId}
            client={{
              first_name: client.first_name,
              last_name: client.last_name,
              email: client.email || undefined,
              phone: client.phone || undefined,
              company: client.company || undefined,
              address: client.address || undefined,
              status: client.status,
              source: client.source || undefined,
              notes: client.notes || undefined,
            }}
            onSubmit={async (data) => {
              startTransition(async () => {
                try {
                  await updateClientAction({
                    ...data,
                    id: client.id,
                    account_id: accountId,
                  });
                  toast.success('Client updated successfully');
                  setIsEditing(false);
                } catch (error) {
                  if (isRedirectError(error)) {
                    throw error;
                  }
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : 'Failed to update client',
                  );
                }
              });
            }}
            SubmitButton={({ pending }) => (
              <div className="flex gap-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={pending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                {client.first_name} {client.last_name}
              </CardTitle>
              <CardDescription>
                <Badge variant={statusColors[client.status] || 'outline'}>
                  {client.status}
                </Badge>
              </CardDescription>
            </div>

            <div className="flex gap-x-2">
              <If condition={canUpdate}>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  data-test="edit-client-button"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </If>

              <If condition={canDelete}>
                <DeleteClientDialog
                  clientId={client.id}
                  clientName={`${client.first_name} ${client.last_name}`}
                >
                  <Button variant="destructive" data-test="delete-client-button">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </DeleteClientDialog>
              </If>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
              <p className="text-sm">
                {client.email ? (
                  <a
                    href={`mailto:${client.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {client.email}
                  </a>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Phone</h4>
              <p className="text-sm">
                {client.phone || <span className="text-muted-foreground">—</span>}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Company</h4>
              <p className="text-sm">
                {client.company || <span className="text-muted-foreground">—</span>}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Source</h4>
              <p className="text-sm">
                {client.source || <span className="text-muted-foreground">—</span>}
              </p>
            </div>
          </div>

          <If condition={!!client.address}>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Address</h4>
              <p className="text-sm whitespace-pre-line">{client.address}</p>
            </div>
          </If>

          <If condition={!!client.notes}>
            <Separator />
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Notes</h4>
              <p className="text-sm whitespace-pre-line">{client.notes}</p>
            </div>
          </If>

          <Separator />

          <div className="text-xs text-muted-foreground">
            <p>
              Created: {new Date(client.created_at).toLocaleDateString()}
            </p>
            {client.updated_at && (
              <p>
                Last updated: {new Date(client.updated_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <CustomFieldsManager
        clientId={client.id}
        accountId={accountId}
        customFields={customFields}
        fieldValues={fieldValues}
        canUpdate={canUpdate}
      />

      <InteractionHistory
        clientId={client.id}
        interactions={interactions}
        canUpdate={canUpdate}
      />

      <div>
        <Link href={backLink || `/home/${accountSlug}/clients`}>
          <Button variant="outline">← Back to Clients</Button>
        </Link>
      </div>
    </div>
  );
}
