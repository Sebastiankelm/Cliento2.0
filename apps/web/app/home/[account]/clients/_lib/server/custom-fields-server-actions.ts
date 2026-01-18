'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { enhanceAction } from '@kit/next/actions';
import { getLogger } from '@kit/shared/logger';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import {
  CreateCustomFieldSchema,
  UpdateCustomFieldSchema,
  DeleteCustomFieldSchema,
  UpsertCustomFieldValueSchema,
  type CreateCustomFieldInput,
  type UpdateCustomFieldInput,
  type DeleteCustomFieldInput,
  type UpsertCustomFieldValueInput,
} from '../schema/custom-fields.schema';

/**
 * Create a custom field definition
 */
export const createCustomFieldAction = enhanceAction(
  async (data: CreateCustomFieldInput & { account_id: string }, user) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info({ userId: user.id, fieldData: data }, 'Creating custom field...');

    const { data: field, error } = await client
      .from('client_custom_fields')
      .insert({
        account_id: data.account_id,
        name: data.name,
        field_key: data.field_key,
        field_type: data.field_type,
        is_required: data.is_required,
        options: data.options ? JSON.stringify(data.options) : null,
        default_value: data.default_value,
        display_order: data.display_order,
      })
      .select()
      .single();

    if (error) {
      logger.error({ error: error.message, userId: user.id }, 'Failed to create custom field');
      throw new Error(`Failed to create custom field: ${error.message}`);
    }

    logger.info({ fieldId: field.id }, 'Custom field created successfully');

    revalidatePath('/home/[account]/clients', 'page');
    revalidatePath('/home/[account]/clients/[id]', 'page');

    return { success: true, data: field };
  },
  {
    schema: CreateCustomFieldSchema.extend({
      account_id: z.string().uuid(),
    }),
    auth: true,
  },
);

/**
 * Update a custom field definition
 */
export const updateCustomFieldAction = enhanceAction(
  async (data: UpdateCustomFieldInput, user) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info({ userId: user.id, fieldId: data.id }, 'Updating custom field...');

    const { error } = await client
      .from('client_custom_fields')
      .update({
        name: data.name,
        field_type: data.field_type,
        is_required: data.is_required,
        options: data.options ? JSON.stringify(data.options) : null,
        default_value: data.default_value,
        display_order: data.display_order,
      })
      .eq('id', data.id);

    if (error) {
      logger.error({ error: error.message, fieldId: data.id }, 'Failed to update custom field');
      throw new Error(`Failed to update custom field: ${error.message}`);
    }

    logger.info({ fieldId: data.id }, 'Custom field updated successfully');

    revalidatePath('/home/[account]/clients', 'page');
    revalidatePath('/home/[account]/clients/[id]', 'page');

    return { success: true };
  },
  {
    schema: UpdateCustomFieldSchema,
    auth: true,
  },
);

/**
 * Delete a custom field definition
 */
export const deleteCustomFieldAction = enhanceAction(
  async (data: DeleteCustomFieldInput, user) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info({ userId: user.id, fieldId: data.id }, 'Deleting custom field...');

    const { error } = await client
      .from('client_custom_fields')
      .delete()
      .eq('id', data.id);

    if (error) {
      logger.error({ error: error.message, fieldId: data.id }, 'Failed to delete custom field');
      throw new Error(`Failed to delete custom field: ${error.message}`);
    }

    logger.info({ fieldId: data.id }, 'Custom field deleted successfully');

    revalidatePath('/home/[account]/clients', 'page');
    revalidatePath('/home/[account]/clients/[id]', 'page');

    return { success: true };
  },
  {
    schema: DeleteCustomFieldSchema,
    auth: true,
  },
);

/**
 * Upsert a custom field value for a client
 */
export const upsertCustomFieldValueAction = enhanceAction(
  async (data: UpsertCustomFieldValueInput, user) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info({ userId: user.id, clientId: data.client_id }, 'Upserting custom field value...');

    const { data: value, error } = await client
      .from('client_field_values')
      .upsert({
        client_id: data.client_id,
        custom_field_id: data.custom_field_id,
        value: data.value || null,
      })
      .select()
      .single();

    if (error) {
      logger.error({ error: error.message, clientId: data.client_id }, 'Failed to upsert custom field value');
      throw new Error(`Failed to save custom field value: ${error.message}`);
    }

    logger.info({ valueId: value.id }, 'Custom field value saved successfully');

    revalidatePath('/home/[account]/clients/[id]', 'page');

    return { success: true, data: value };
  },
  {
    schema: UpsertCustomFieldValueSchema,
    auth: true,
  },
);
