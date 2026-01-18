'use server';

import { revalidatePath } from 'next/cache';
import { enhanceAction } from '@kit/next/actions';
import { getLogger } from '@kit/shared/logger';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import {
  CreateInteractionSchema,
  UpdateInteractionSchema,
  DeleteInteractionSchema,
  type CreateInteractionInput,
  type UpdateInteractionInput,
  type DeleteInteractionInput,
} from '../schema/interactions.schema';

/**
 * Create a new interaction
 */
export const createInteractionAction = enhanceAction(
  async (data: CreateInteractionInput, user) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info({ userId: user.id, clientId: data.client_id }, 'Creating interaction...');

    // Get account_id from client
    const { data: clientData, error: clientError } = await client
      .from('clients')
      .select('account_id')
      .eq('id', data.client_id)
      .single();

    if (clientError || !clientData) {
      throw new Error('Client not found');
    }

    const { data: interaction, error } = await client
      .from('client_interactions')
      .insert({
        client_id: data.client_id,
        account_id: clientData.account_id,
        interaction_type: data.interaction_type,
        subject: data.subject || null,
        content: data.content || null,
        interaction_date: data.interaction_date ? new Date(data.interaction_date).toISOString() : new Date().toISOString(),
        duration_minutes: data.duration_minutes || null,
        location: data.location || null,
        participants: data.participants ? JSON.stringify(data.participants) : null,
        outcome: data.outcome || null,
        metadata: data.metadata || {},
      })
      .select()
      .single();

    if (error) {
      logger.error({ error: error.message, clientId: data.client_id }, 'Failed to create interaction');
      throw new Error(`Failed to create interaction: ${error.message}`);
    }

    logger.info({ interactionId: interaction.id }, 'Interaction created successfully');

    revalidatePath('/home/[account]/clients/[id]', 'page');

    return { success: true, data: interaction };
  },
  {
    schema: CreateInteractionSchema,
    auth: true,
  },
);

/**
 * Update an existing interaction
 */
export const updateInteractionAction = enhanceAction(
  async (data: UpdateInteractionInput, user) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info({ userId: user.id, interactionId: data.id }, 'Updating interaction...');

    const { error } = await client
      .from('client_interactions')
      .update({
        interaction_type: data.interaction_type,
        subject: data.subject || null,
        content: data.content || null,
        interaction_date: data.interaction_date ? new Date(data.interaction_date).toISOString() : undefined,
        duration_minutes: data.duration_minutes || null,
        location: data.location || null,
        participants: data.participants ? JSON.stringify(data.participants) : null,
        outcome: data.outcome || null,
        metadata: data.metadata || {},
      })
      .eq('id', data.id);

    if (error) {
      logger.error({ error: error.message, interactionId: data.id }, 'Failed to update interaction');
      throw new Error(`Failed to update interaction: ${error.message}`);
    }

    logger.info({ interactionId: data.id }, 'Interaction updated successfully');

    revalidatePath('/home/[account]/clients/[id]', 'page');

    return { success: true };
  },
  {
    schema: UpdateInteractionSchema,
    auth: true,
  },
);

/**
 * Delete an interaction
 */
export const deleteInteractionAction = enhanceAction(
  async (data: DeleteInteractionInput, user) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info({ userId: user.id, interactionId: data.id }, 'Deleting interaction...');

    const { error } = await client
      .from('client_interactions')
      .delete()
      .eq('id', data.id);

    if (error) {
      logger.error({ error: error.message, interactionId: data.id }, 'Failed to delete interaction');
      throw new Error(`Failed to delete interaction: ${error.message}`);
    }

    logger.info({ interactionId: data.id }, 'Interaction deleted successfully');

    revalidatePath('/home/[account]/clients/[id]', 'page');

    return { success: true };
  },
  {
    schema: DeleteInteractionSchema,
    auth: true,
  },
);
