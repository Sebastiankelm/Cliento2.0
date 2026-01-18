'use client';

import { useState, useTransition } from 'react';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { Calendar, CheckCircle2, Circle, Clock, Plus, Trash2, XCircle } from 'lucide-react';

import { Tables } from '@kit/supabase/database';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { If } from '@kit/ui/if';
import { toast } from '@kit/ui/sonner';
import { Trans } from '@kit/ui/trans';

import { deleteTaskAction, updateTaskAction } from '../_lib/server/tasks-server-actions';
import { NewTaskDialog } from './new-task-dialog';

type Task = Tables<'tasks'> & {
  client?: Tables<'clients'> | null;
  deal?: Tables<'deals'> | null;
};

interface TasksListProps {
  tasks: Task[];
  accountId: string;
  accountSlug: string;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

const statusIcons = {
  todo: Circle,
  in_progress: Clock,
  completed: CheckCircle2,
  cancelled: XCircle,
};

const statusColors = {
  todo: 'default',
  in_progress: 'secondary',
  completed: 'default',
  cancelled: 'destructive',
} as const;

const priorityColors = {
  low: 'outline',
  medium: 'default',
  high: 'secondary',
  urgent: 'destructive',
} as const;

export function TasksList({
  tasks,
  accountId,
  accountSlug,
  canCreate,
  canUpdate,
  canDelete,
}: TasksListProps) {
  const [pending, startTransition] = useTransition();

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    if (!canUpdate) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    startTransition(async () => {
      try {
        await updateTaskAction({
          id: taskId,
          client_id: task.client_id,
          deal_id: task.deal_id,
          title: task.title,
          description: task.description,
          status: newStatus,
          priority: task.priority,
          due_date: task.due_date,
          reminder_date: task.reminder_date,
          assigned_to: task.assigned_to,
        });
        toast.success('Task updated');
      } catch (error) {
        if (isRedirectError(error)) {
          throw error;
        }
        toast.error(
          error instanceof Error ? error.message : 'Failed to update task',
        );
      }
    });
  };

  const handleDelete = (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteTaskAction({ id: taskId });
        toast.success('Task deleted');
      } catch (error) {
        if (isRedirectError(error)) {
          throw error;
        }
        toast.error(
          error instanceof Error ? error.message : 'Failed to delete task',
        );
      }
    });
  };

  const formatDate = (date: string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          <Trans i18nKey={'tasks:tasks'} defaults={'Tasks'} />
        </h2>
        <If condition={canCreate}>
          <NewTaskDialog accountId={accountId} />
        </If>
      </div>

      {tasks.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <p>No tasks found.</p>
            <If condition={canCreate}>
              <p className="text-sm mt-2">Create your first task to get started.</p>
            </If>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => {
            const StatusIcon = statusIcons[task.status];
            const isOverdue =
              task.due_date &&
              task.status !== 'completed' &&
              new Date(task.due_date) < new Date();

            return (
              <Card key={task.id} className={isOverdue ? 'border-destructive' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <StatusIcon
                          className={`h-4 w-4 ${
                            task.status === 'completed'
                              ? 'text-green-600'
                              : 'text-muted-foreground'
                          }`}
                        />
                        <CardTitle className="text-base">{task.title}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={statusColors[task.status]}>
                          {task.status}
                        </Badge>
                        <Badge variant={priorityColors[task.priority]}>
                          {task.priority}
                        </Badge>
                        {task.client && (
                          <span className="text-xs text-muted-foreground">
                            Client: {task.client.first_name} {task.client.last_name}
                          </span>
                        )}
                        {task.deal && (
                          <span className="text-xs text-muted-foreground">
                            Deal: {task.deal.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <If condition={canUpdate && task.status !== 'completed'}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange(task.id, 'completed')}
                          disabled={pending}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      </If>
                      <If condition={canDelete}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(task.id)}
                          disabled={pending}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </If>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {task.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {task.description}
                    </p>
                  )}
                  {task.due_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-3 w-3" />
                      <span className={isOverdue ? 'text-destructive font-semibold' : ''}>
                        Due: {formatDate(task.due_date)}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
