'use server';

import { revalidatePath } from 'next/cache';
import { enhanceAction } from '@kit/next/actions';
import { getLogger } from '@kit/shared/logger';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import {
  CreateTaskSchema,
  UpdateTaskSchema,
  DeleteTaskSchema,
  type CreateTaskInput,
  type UpdateTaskInput,
  type DeleteTaskInput,
} from '../schema/task.schema';

/**
 * Create a new task
 */
export const createTaskAction = enhanceAction(
  async (data: CreateTaskInput, user) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info({ userId: user.id, taskData: data }, 'Creating task...');

    // Get account_id from client or deal
    let accountId: string | null = null;

    if (data.client_id) {
      const { data: clientData } = await client
        .from('clients')
        .select('account_id')
        .eq('id', data.client_id)
        .single();
      accountId = clientData?.account_id || null;
    } else if (data.deal_id) {
      const { data: dealData } = await client
        .from('deals')
        .select('account_id')
        .eq('id', data.deal_id)
        .single();
      accountId = dealData?.account_id || null;
    }

    if (!accountId) {
      throw new Error('Could not determine account ID');
    }

    const { data: task, error } = await client
      .from('tasks')
      .insert({
        account_id: accountId,
        client_id: data.client_id || null,
        deal_id: data.deal_id || null,
        title: data.title,
        description: data.description || null,
        status: data.status || 'todo',
        priority: data.priority || 'medium',
        due_date: data.due_date ? new Date(data.due_date).toISOString() : null,
        reminder_date: data.reminder_date ? new Date(data.reminder_date).toISOString() : null,
        assigned_to: data.assigned_to || null,
      })
      .select()
      .single();

    if (error) {
      logger.error({ error: error.message }, 'Failed to create task');
      throw new Error(`Failed to create task: ${error.message}`);
    }

    logger.info({ taskId: task.id }, 'Task created successfully');

    revalidatePath('/home/[account]/tasks', 'page');

    return { success: true, data: task };
  },
  {
    schema: CreateTaskSchema,
    auth: true,
  },
);

/**
 * Update an existing task
 */
export const updateTaskAction = enhanceAction(
  async (data: UpdateTaskInput, user) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info({ userId: user.id, taskId: data.id }, 'Updating task...');

    const { error } = await client
      .from('tasks')
      .update({
        title: data.title,
        description: data.description || null,
        status: data.status,
        priority: data.priority,
        due_date: data.due_date ? new Date(data.due_date).toISOString() : null,
        reminder_date: data.reminder_date ? new Date(data.reminder_date).toISOString() : null,
        assigned_to: data.assigned_to || null,
      })
      .eq('id', data.id);

    if (error) {
      logger.error({ error: error.message, taskId: data.id }, 'Failed to update task');
      throw new Error(`Failed to update task: ${error.message}`);
    }

    logger.info({ taskId: data.id }, 'Task updated successfully');

    revalidatePath('/home/[account]/tasks', 'page');

    return { success: true };
  },
  {
    schema: UpdateTaskSchema,
    auth: true,
  },
);

/**
 * Delete a task
 */
export const deleteTaskAction = enhanceAction(
  async (data: DeleteTaskInput, user) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info({ userId: user.id, taskId: data.id }, 'Deleting task...');

    const { error } = await client
      .from('tasks')
      .delete()
      .eq('id', data.id);

    if (error) {
      logger.error({ error: error.message, taskId: data.id }, 'Failed to delete task');
      throw new Error(`Failed to delete task: ${error.message}`);
    }

    logger.info({ taskId: data.id }, 'Task deleted successfully');

    revalidatePath('/home/[account]/tasks', 'page');

    return { success: true };
  },
  {
    schema: DeleteTaskSchema,
    auth: true,
  },
);
