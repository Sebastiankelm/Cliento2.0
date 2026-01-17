'use client';

import { useState, useTransition } from 'react';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { PlusCircle } from 'lucide-react';

import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@kit/ui/dialog';
import { Trans } from '@kit/ui/trans';
import { toast } from '@kit/ui/sonner';

import { ClientForm } from './client-form';
import { createClientAction } from '../_lib/server/clients-server-actions';

interface NewClientDialogProps {
  accountId: string;
}

export function NewClientDialog({ accountId }: NewClientDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button data-test="new-client-button">
          <PlusCircle className="mr-2 h-4 w-4" />
          <span>
            <Trans i18nKey={'clients:addNewClient'} defaults={'Add New Client'} />
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <Trans i18nKey={'clients:addNewClient'} defaults={'Add New Client'} />
          </DialogTitle>
          <DialogDescription>
            <Trans
              i18nKey={'clients:addNewClientDescription'}
              defaults={'Fill in the information to add a new client to your CRM.'}
            />
          </DialogDescription>
        </DialogHeader>
        <ClientForm
          accountId={accountId}
          onSubmit={async (data) => {
            startTransition(async () => {
              try {
                await createClientAction(data);
                toast.success('Client created successfully');
                setIsOpen(false);
              } catch (error) {
                if (isRedirectError(error)) {
                  throw error;
                }
                toast.error(
                  error instanceof Error
                    ? error.message
                    : 'Failed to create client',
                );
              }
            });
          }}
          SubmitButton={({ pending }) => (
            <Button type="submit" disabled={pending} data-test="submit-client-button">
              {pending ? (
                <Trans i18nKey={'clients:creating'} defaults={'Creating...'} />
              ) : (
                <Trans i18nKey={'clients:createClient'} defaults={'Create Client'} />
              )}
            </Button>
          )}
        />
      </DialogContent>
    </Dialog>
  );
}
