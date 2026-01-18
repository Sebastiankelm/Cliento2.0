'use client';

import { useState, useTransition } from 'react';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { Calendar, Clock, Mail, MessageSquare, Phone, Trash2, Users } from 'lucide-react';

import { Tables } from '@kit/supabase/database';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { If } from '@kit/ui/if';
import { Separator } from '@kit/ui/separator';
import { toast } from '@kit/ui/sonner';
import { Trans } from '@kit/ui/trans';

import { deleteInteractionAction } from '../../_lib/server/interactions-server-actions';
import { AddInteractionDialog } from './add-interaction-dialog';

type Interaction = Tables<'client_interactions'>;

interface InteractionHistoryProps {
  clientId: string;
  interactions: Interaction[];
  canUpdate: boolean;
}

const interactionIcons = {
  email: Mail,
  phone: Phone,
  meeting: Calendar,
  note: MessageSquare,
  task: Clock,
  other: MessageSquare,
};

const interactionColors = {
  email: 'text-blue-600',
  phone: 'text-green-600',
  meeting: 'text-purple-600',
  note: 'text-gray-600',
  task: 'text-orange-600',
  other: 'text-gray-600',
};

export function InteractionHistory({
  clientId,
  interactions,
  canUpdate,
}: InteractionHistoryProps) {
  const [pending, startTransition] = useTransition();

  const handleDelete = (interactionId: string) => {
    if (!confirm('Are you sure you want to delete this interaction?')) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteInteractionAction({ id: interactionId });
        toast.success('Interaction deleted');
      } catch (error) {
        if (isRedirectError(error)) {
          throw error;
        }
        toast.error(
          error instanceof Error ? error.message : 'Failed to delete interaction',
        );
      }
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Interaction History</CardTitle>
            <CardDescription>
              Record of all interactions with this client
            </CardDescription>
          </div>
          <If condition={canUpdate}>
            <AddInteractionDialog clientId={clientId} />
          </If>
        </div>
      </CardHeader>
      <CardContent>
        {interactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No interactions recorded yet.</p>
            <If condition={canUpdate}>
              <p className="text-sm mt-2">Add your first interaction to get started.</p>
            </If>
          </div>
        ) : (
          <div className="space-y-4">
            {interactions.map((interaction) => {
              const Icon = interactionIcons[interaction.interaction_type] || MessageSquare;
              const colorClass = interactionColors[interaction.interaction_type] || 'text-gray-600';
              const participants = interaction.participants
                ? (typeof interaction.participants === 'string'
                    ? JSON.parse(interaction.participants)
                    : interaction.participants)
                : [];

              return (
                <div key={interaction.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Icon className={`h-5 w-5 mt-0.5 ${colorClass}`} />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">
                            {interaction.subject || interaction.interaction_type}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(interaction.interaction_date)}
                          </span>
                        </div>

                        <If condition={!!interaction.content}>
                          <p className="text-sm text-muted-foreground whitespace-pre-line">
                            {interaction.content}
                          </p>
                        </If>

                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-2">
                          <If condition={!!interaction.location}>
                            <span>📍 {interaction.location}</span>
                          </If>
                          <If condition={!!interaction.duration_minutes}>
                            <span>⏱️ {interaction.duration_minutes} min</span>
                          </If>
                          <If condition={participants.length > 0}>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>
                                {participants.map((p: any) => p.name).join(', ')}
                              </span>
                            </div>
                          </If>
                        </div>

                        <If condition={!!interaction.outcome}>
                          <div className="mt-2 p-2 bg-muted rounded text-sm">
                            <strong>Outcome:</strong> {interaction.outcome}
                          </div>
                        </If>
                      </div>
                    </div>

                    <If condition={canUpdate}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(interaction.id)}
                        disabled={pending}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </If>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
