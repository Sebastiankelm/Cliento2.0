'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';

import { CreateClientSchema, type CreateClientInput } from '../_lib/schema/client.schema';

interface ClientFormProps {
  client?: CreateClientInput & { id?: string };
  onSubmit: (data: CreateClientInput & { account_id: string }) => Promise<void>;
  SubmitButton: React.ComponentType<{ pending?: boolean }>;
  accountId: string;
}

export function ClientForm({
  client,
  onSubmit,
  SubmitButton,
  accountId,
}: ClientFormProps) {
  const form = useForm<CreateClientInput>({
    resolver: zodResolver(CreateClientSchema),
    defaultValues: client || {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      company: '',
      address: '',
      status: 'lead',
      source: '',
      notes: '',
    },
  });

  const handleSubmit = async (data: CreateClientInput) => {
    await onSubmit({ ...data, account_id: accountId });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col space-y-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey={'clients:firstName'} defaults={'First Name'} />
                </FormLabel>
                <FormControl>
                  <Input required {...field} data-test="client-first-name-input" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey={'clients:lastName'} defaults={'Last Name'} />
                </FormLabel>
                <FormControl>
                  <Input required {...field} data-test="client-last-name-input" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey={'clients:email'} defaults={'Email'} />
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="client@example.com"
                  {...field}
                  value={field.value || ''}
                  data-test="client-email-input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey={'clients:phone'} defaults={'Phone'} />
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="+1 234 567 890"
                  {...field}
                  value={field.value || ''}
                  data-test="client-phone-input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey={'clients:company'} defaults={'Company'} />
              </FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} data-test="client-company-input" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey={'clients:address'} defaults={'Address'} />
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Street address, city, country"
                  {...field}
                  value={field.value || ''}
                  data-test="client-address-input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey={'clients:status'} defaults={'Status'} />
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger data-test="client-status-select">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="source"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey={'clients:source'} defaults={'Source'} />
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="website, referral, cold_call, etc."
                  {...field}
                  value={field.value || ''}
                  data-test="client-source-input"
                />
              </FormControl>
              <FormDescription>
                <Trans
                  i18nKey={'clients:sourceDescription'}
                  defaults={'How did you find this client?'}
                />
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey={'clients:notes'} defaults={'Notes'} />
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Additional information about the client..."
                  {...field}
                  value={field.value || ''}
                  data-test="client-notes-input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <SubmitButton />
      </form>
    </Form>
  );
}
