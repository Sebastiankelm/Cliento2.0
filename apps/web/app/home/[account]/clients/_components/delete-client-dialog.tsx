'use client';

import { useState, useTransition } from 'react';

import { isRedirectError } from 'next/dist/client/components/redirect-error';

import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@kit/ui/alert-dialog';
import { Button } from '@kit/ui/button';
import { If } from '@kit/ui/if';
import { Trans } from '@kit/ui/trans';
import { toast } from '@kit/ui/sonner';

import { deleteClientAction } from '../_lib/server/clients-server-actions';

interface DeleteClientDialogProps {
  clientId: string;
  clientName: string;
  children: React.ReactNode;
}

export function DeleteClientDialog({
  clientId,
  clientName,
  children,
}: DeleteClientDialogProps) {
  const [isSubmitting, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onDelete = () => {
    startTransition(async () => {
      try {
        await deleteClientAction({ id: clientId });
        toast.success('Client deleted successfully');
      } catch (err) {
        if (isRedirectError(err)) {
          throw err;
        }
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to delete client';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <Trans i18nKey={'clients:deleteClient'} defaults={'Delete Client'} />
          </AlertDialogTitle>

          <AlertDialogDescription>
            <Trans
              i18nKey={'clients:deleteClientDescription'}
              defaults={'Are you sure you want to delete {{name}}? This action cannot be undone.'}
              values={{ name: clientName }}
            />
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col space-y-6">
          <If condition={!!error}>
            <Alert variant={'destructive'}>
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </If>

          <AlertDialogFooter>
            <AlertDialogCancel>
              <Trans i18nKey={'common:cancel'} defaults={'Cancel'} />
            </AlertDialogCancel>

            <Button
              variant={'destructive'}
              disabled={isSubmitting}
              onClick={onDelete}
              data-test={`confirm-delete-client-${clientId}`}
            >
              {isSubmitting ? (
                <Trans i18nKey={'clients:deleting'} defaults={'Deleting...'} />
              ) : (
                <Trans i18nKey={'clients:delete'} defaults={'Delete'} />
              )}
            </Button>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
