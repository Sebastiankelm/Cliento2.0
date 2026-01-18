'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { enhanceAction } from '@kit/next/actions';
import { getLogger } from '@kit/shared/logger';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { CreateClientSchema, UpdateClientSchema, DeleteClientSchema } from '../schema/client.schema';

/**
 * Create a new client
 */
export const createClientAction = enhanceAction(
  async (data, user) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info({ userId: user.id, clientData: data }, 'Creating client...');

    // Get account_id from workspace (should be passed in the data or context)
    // For now, we'll get it from the user's personal account or require it in schema
    // In practice, this should come from the team workspace context
    const { data: clientRecord, error } = await client
      .from('clients')
      .insert({
        account_id: data.account_id, // This should be passed from the form
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email || null,
        phone: data.phone || null,
        company: data.company || null,
        address: data.address || null,
        status: data.status,
        source: data.source || null,
        notes: data.notes || null,
      })
      .select()
      .single();

    if (error) {
      logger.error(
        {
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          accountId: data.account_id,
          userId: user.id,
        },
        'Failed to create client',
      );
      
      // Provide more user-friendly error messages based on error code
      let errorMessage = 'Failed to create client';
      
      if (error.code === '42501') {
        // Insufficient privilege error (RLS policy violation)
        errorMessage = 'You do not have permission to create clients. Please contact your administrator.';
      } else if (error.code === 'PGRST116') {
        // Row not found or permission denied
        errorMessage = 'Permission denied. Please ensure you have the correct permissions.';
      } else if (error.hint) {
        errorMessage = `${error.message}. ${error.hint}`;
      } else {
        errorMessage = `${error.message}`;
      }
      
      throw new Error(errorMessage);
    }

    logger.info({ clientId: clientRecord.id }, 'Client created successfully');

    // Revalidate both team account and personal account paths
    revalidatePath('/home/[account]/clients', 'page');
    revalidatePath('/home/clients', 'page');
    revalidatePath('/home/[account]', 'page'); // Revalidate dashboard
    revalidatePath('/home', 'page'); // Revalidate personal dashboard

    return { success: true, data: clientRecord };
  },
  {
    schema: CreateClientSchema.extend({
      account_id: z.string().uuid('Account ID is required'),
    }),
    auth: true,
  },
);

/**
 * Update an existing client
 */
export const updateClientAction = enhanceAction(
  async (data, user) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info({ userId: user.id, clientId: data.id }, 'Updating client...');

    const { error } = await client
      .from('clients')
      .update({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email || null,
        phone: data.phone || null,
        company: data.company || null,
        address: data.address || null,
        status: data.status,
        source: data.source || null,
        notes: data.notes || null,
      })
      .eq('id', data.id);

    if (error) {
      logger.error(
        {
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          clientId: data.id,
          userId: user.id,
        },
        'Failed to update client',
      );
      throw new Error(
        `Failed to update client: ${error.message}${error.hint ? ` (${error.hint})` : ''}`,
      );
    }

    logger.info({ clientId: data.id }, 'Client updated successfully');

    // Revalidate both team account and personal account paths
    revalidatePath('/home/[account]/clients', 'page');
    revalidatePath('/home/clients', 'page');
    revalidatePath('/home/[account]/clients/[id]', 'page');
    revalidatePath('/home/clients/[id]', 'page');
    revalidatePath('/home/[account]', 'page');
    revalidatePath('/home', 'page');

    return { success: true };
  },
  {
    schema: UpdateClientSchema.extend({
      account_id: z.string().uuid('Account ID is required'),
    }),
    auth: true,
  },
);

/**
 * Delete a client
 */
export const deleteClientAction = enhanceAction(
  async (data, user) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info({ userId: user.id, clientId: data.id }, 'Deleting client...');

    const { error } = await client
      .from('clients')
      .delete()
      .eq('id', data.id);

    if (error) {
      logger.error(
        {
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          clientId: data.id,
          userId: user.id,
        },
        'Failed to delete client',
      );
      throw new Error(
        `Failed to delete client: ${error.message}${error.hint ? ` (${error.hint})` : ''}`,
      );
    }

    logger.info({ clientId: data.id }, 'Client deleted successfully');

    // Revalidate both team account and personal account paths
    revalidatePath('/home/[account]/clients', 'page');
    revalidatePath('/home/clients', 'page');
    revalidatePath('/home/[account]', 'page');
    revalidatePath('/home', 'page');

    return { success: true };
  },
  {
    schema: DeleteClientSchema,
    auth: true,
  },
);
