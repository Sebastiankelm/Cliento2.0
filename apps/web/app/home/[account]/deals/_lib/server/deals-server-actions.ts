'use server';

import { revalidatePath } from 'next/cache';
import { enhanceAction } from '@kit/next/actions';
import { getLogger } from '@kit/shared/logger';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import {
  CreateDealSchema,
  UpdateDealSchema,
  UpdateDealStageSchema,
  DeleteDealSchema,
  type CreateDealInput,
  type UpdateDealInput,
  type UpdateDealStageInput,
  type DeleteDealInput,
} from '../schema/deal.schema';

/**
 * Create a new deal
 */
export const createDealAction = enhanceAction(
  async (data: CreateDealInput, user) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info({ userId: user.id, dealData: data }, 'Creating deal...');

    // Get account_id from client
    const { data: clientData, error: clientError } = await client
      .from('clients')
      .select('account_id')
      .eq('id', data.client_id)
      .single();

    if (clientError || !clientData) {
      throw new Error('Client not found');
    }

    const { data: deal, error } = await client
      .from('deals')
      .insert({
        account_id: clientData.account_id,
        client_id: data.client_id,
        pipeline_id: data.pipeline_id,
        stage_id: data.stage_id,
        name: data.name,
        description: data.description || null,
        value: data.value,
        currency: data.currency || 'USD',
        expected_close_date: data.expected_close_date || null,
        probability_percent: data.probability_percent || null,
        assigned_to: data.assigned_to || null,
        source: data.source || null,
        notes: data.notes || null,
        status: 'open',
      })
      .select()
      .single();

    if (error) {
      logger.error({ error: error.message, userId: user.id }, 'Failed to create deal');
      throw new Error(`Failed to create deal: ${error.message}`);
    }

    logger.info({ dealId: deal.id }, 'Deal created successfully');

    revalidatePath('/home/[account]/deals', 'page');
    revalidatePath('/home/[account]/clients/[id]', 'page');

    return { success: true, data: deal };
  },
  {
    schema: CreateDealSchema,
    auth: true,
  },
);

/**
 * Update an existing deal
 */
export const updateDealAction = enhanceAction(
  async (data: UpdateDealInput, user) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info({ userId: user.id, dealId: data.id }, 'Updating deal...');

    const { error } = await client
      .from('deals')
      .update({
        name: data.name,
        description: data.description || null,
        value: data.value,
        currency: data.currency || 'USD',
        expected_close_date: data.expected_close_date || null,
        probability_percent: data.probability_percent || null,
        assigned_to: data.assigned_to || null,
        source: data.source || null,
        notes: data.notes || null,
      })
      .eq('id', data.id);

    if (error) {
      logger.error({ error: error.message, dealId: data.id }, 'Failed to update deal');
      throw new Error(`Failed to update deal: ${error.message}`);
    }

    logger.info({ dealId: data.id }, 'Deal updated successfully');

    revalidatePath('/home/[account]/deals', 'page');
    revalidatePath('/home/[account]/deals/[id]', 'page');

    return { success: true };
  },
  {
    schema: UpdateDealSchema,
    auth: true,
  },
);

/**
 * Update deal stage (for drag & drop in kanban)
 */
export const updateDealStageAction = enhanceAction(
  async (data: UpdateDealStageInput, user) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info({ userId: user.id, dealId: data.id, stageId: data.stage_id }, 'Updating deal stage...');

    // Get the stage to check if it's closed/won or lost
    const { data: stage, error: stageError } = await client
      .from('pipeline_stages')
      .select('is_closed, is_lost')
      .eq('id', data.stage_id)
      .single();

    if (stageError || !stage) {
      throw new Error('Stage not found');
    }

    const status = stage.is_closed ? 'won' : stage.is_lost ? 'lost' : 'open';
    const actual_close_date = status !== 'open' ? new Date().toISOString().split('T')[0] : null;

    const { error } = await client
      .from('deals')
      .update({
        stage_id: data.stage_id,
        status,
        actual_close_date,
      })
      .eq('id', data.id);

    if (error) {
      logger.error({ error: error.message, dealId: data.id }, 'Failed to update deal stage');
      throw new Error(`Failed to update deal stage: ${error.message}`);
    }

    logger.info({ dealId: data.id }, 'Deal stage updated successfully');

    revalidatePath('/home/[account]/deals', 'page');
    revalidatePath('/home/[account]/deals/[id]', 'page');

    return { success: true };
  },
  {
    schema: UpdateDealStageSchema,
    auth: true,
  },
);

/**
 * Delete a deal
 */
export const deleteDealAction = enhanceAction(
  async (data: DeleteDealInput, user) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info({ userId: user.id, dealId: data.id }, 'Deleting deal...');

    const { error } = await client
      .from('deals')
      .delete()
      .eq('id', data.id);

    if (error) {
      logger.error({ error: error.message, dealId: data.id }, 'Failed to delete deal');
      throw new Error(`Failed to delete deal: ${error.message}`);
    }

    logger.info({ dealId: data.id }, 'Deal deleted successfully');

    revalidatePath('/home/[account]/deals', 'page');

    return { success: true };
  },
  {
    schema: DeleteDealSchema,
    auth: true,
  },
);
