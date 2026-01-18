'use client';

import { useState, useTransition } from 'react';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { Plus, Trash2 } from 'lucide-react';

import { Tables } from '@kit/supabase/database';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@kit/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Textarea } from '@kit/ui/textarea';
import { toast } from '@kit/ui/sonner';
import { Trans } from '@kit/ui/trans';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { upsertCustomFieldValueAction } from '../../_lib/server/custom-fields-server-actions';
import { loadCustomFields, loadClientCustomFieldValues } from '../../_lib/server/clients-page.loader';

type CustomField = Tables<'client_custom_fields'>;
type CustomFieldValue = Tables<'client_field_values'> & {
  custom_field: CustomField;
};

interface CustomFieldsManagerProps {
  clientId: string;
  accountId: string;
  customFields: CustomField[];
  fieldValues: CustomFieldValue[];
  canUpdate: boolean;
}

const FieldValueSchema = z.object({
  value: z.string().optional().nullable(),
});

export function CustomFieldsManager({
  clientId,
  accountId,
  customFields,
  fieldValues,
  canUpdate,
}: CustomFieldsManagerProps) {
  const [pending, startTransition] = useTransition();

  const getFieldValue = (fieldId: string) => {
    return fieldValues.find((fv) => fv.custom_field_id === fieldId)?.value || null;
  };

  const handleFieldChange = (fieldId: string, value: string | null) => {
    if (!canUpdate) return;

    startTransition(async () => {
      try {
        await upsertCustomFieldValueAction({
          client_id: clientId,
          custom_field_id: fieldId,
          value: value || null,
        });
        toast.success('Field updated');
      } catch (error) {
        if (isRedirectError(error)) {
          throw error;
        }
        toast.error(
          error instanceof Error ? error.message : 'Failed to update field',
        );
      }
    });
  };

  if (customFields.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Custom Fields</CardTitle>
          <CardDescription>
            No custom fields defined. Contact your administrator to add custom fields.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Fields</CardTitle>
        <CardDescription>
          Additional information specific to your sales process
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {customFields.map((field) => {
          const currentValue = getFieldValue(field.id);
          const isSelect = field.field_type === 'select';
          const isCheckbox = field.field_type === 'checkbox';
          const isTextarea = field.field_type === 'textarea';

          return (
            <div key={field.id} className="space-y-2">
              <label className="text-sm font-medium">
                {field.name}
                {field.is_required && <span className="text-destructive"> *</span>}
              </label>

              {isSelect && field.options ? (
                <Select
                  value={currentValue || ''}
                  onValueChange={(value) => handleFieldChange(field.id, value)}
                  disabled={!canUpdate || pending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {JSON.parse(field.options as string).map((option: string) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : isCheckbox ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={currentValue === 'true'}
                    onChange={(e) =>
                      handleFieldChange(field.id, e.target.checked ? 'true' : 'false')
                    }
                    disabled={!canUpdate || pending}
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-muted-foreground">
                    {field.name}
                  </span>
                </div>
              ) : isTextarea ? (
                <Textarea
                  value={currentValue || ''}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  disabled={!canUpdate || pending}
                  placeholder={field.default_value || ''}
                />
              ) : (
                <Input
                  type={field.field_type === 'number' ? 'number' : field.field_type === 'date' ? 'date' : 'text'}
                  value={currentValue || ''}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  disabled={!canUpdate || pending}
                  placeholder={field.default_value || ''}
                />
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
