'use client';

import { useState, useTransition } from 'react';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { Calendar, DollarSign, Trash2, User } from 'lucide-react';
import Link from 'next/link';

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { If } from '@kit/ui/if';
import { toast } from '@kit/ui/sonner';

import { deleteDealAction } from '../_lib/server/deals-server-actions';

type Deal = Tables<'deals'> & {
  client: Tables<'clients'>;
  stage: Tables<'pipeline_stages'>;
};

type Stage = Tables<'pipeline_stages'>;

interface DealCardProps {
  deal: Deal;
  accountSlug: string;
  canUpdate: boolean;
  canDelete: boolean;
  onStageChange: (dealId: string, newStageId: string) => void;
  availableStages: Stage[];
}

export function DealCard({
  deal,
  accountSlug,
  canUpdate,
  canDelete,
  onStageChange,
  availableStages,
}: DealCardProps) {
  const [pending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete this deal?')) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteDealAction({ id: deal.id });
        toast.success('Deal deleted');
      } catch (error) {
        if (isRedirectError(error)) {
          throw error;
        }
        toast.error(
          error instanceof Error ? error.message : 'Failed to delete deal',
        );
      }
    });
  };

  const formatCurrency = (value: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(value);
  };

  const formatDate = (date: string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <Link
            href={
              accountSlug
                ? `/home/${accountSlug}/deals/${deal.id}`
                : `/home/deals/${deal.id}`
            }
            className="flex-1"
          >
            <CardTitle className="text-sm font-medium line-clamp-2">
              {deal.name}
            </CardTitle>
          </Link>
          <If condition={canUpdate || canDelete}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <span className="sr-only">Options</span>
                  <span>⋯</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <If condition={canUpdate}>
                  {availableStages
                    .filter((s) => s.id !== deal.stage_id)
                    .map((stage) => (
                      <DropdownMenuItem
                        key={stage.id}
                        onClick={() => onStageChange(deal.id, stage.id)}
                      >
                        Move to {stage.name}
                      </DropdownMenuItem>
                    ))}
                </If>
                <If condition={canDelete}>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive"
                    disabled={pending}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </If>
              </DropdownMenuContent>
            </DropdownMenu>
          </If>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-3 w-3" />
          <span>
            {deal.client.first_name} {deal.client.last_name}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm font-semibold">
          <DollarSign className="h-3 w-3" />
          <span>{formatCurrency(Number(deal.value), deal.currency)}</span>
        </div>

        {deal.expected_close_date && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Close: {formatDate(deal.expected_close_date)}</span>
          </div>
        )}

        {deal.probability_percent !== null && (
          <div className="text-xs text-muted-foreground">
            {deal.probability_percent}% probability
          </div>
        )}

        {deal.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {deal.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
