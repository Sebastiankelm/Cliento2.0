'use client';

import { useState, useTransition } from 'react';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { Plus } from 'lucide-react';

import { Tables } from '@kit/supabase/database';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { If } from '@kit/ui/if';
import { toast } from '@kit/ui/sonner';
import { Trans } from '@kit/ui/trans';

import { updateDealStageAction } from '../_lib/server/deals-server-actions';
import { DealCard } from './deal-card';
import { NewDealDialog } from './new-deal-dialog';

type Pipeline = Tables<'sales_pipelines'> & {
  stages?: Tables<'pipeline_stages'>[];
};

type Deal = Tables<'deals'> & {
  client?: Tables<'clients'> | null;
  stage?: Tables<'pipeline_stages'> | null;
  pipeline?: Tables<'sales_pipelines'> | null;
};

type Client = Tables<'clients'>;

interface DealsPipelineViewProps {
  pipeline: Pipeline;
  pipelines: Pipeline[];
  deals: Deal[];
  clients: Client[];
  accountId: string;
  accountSlug: string;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export function DealsPipelineView({
  pipeline,
  pipelines,
  deals,
  clients,
  accountId,
  accountSlug,
  canCreate,
  canUpdate,
  canDelete,
}: DealsPipelineViewProps) {
  const [pending, startTransition] = useTransition();

  // Group deals by stage
  const dealsByStage = deals.reduce(
    (acc, deal) => {
      const stageId = deal.stage_id;
      if (stageId) {
        if (!acc[stageId]) {
          acc[stageId] = [];
        }
        acc[stageId].push(deal);
      }
      return acc;
    },
    {} as Record<string, Deal[]>,
  );

  const handleStageChange = (dealId: string, newStageId: string) => {
    if (!canUpdate) return;

    startTransition(async () => {
      try {
        await updateDealStageAction({
          id: dealId,
          stage_id: newStageId,
        });
        toast.success('Deal moved');
      } catch (error) {
        if (isRedirectError(error)) {
          throw error;
        }
        toast.error(
          error instanceof Error ? error.message : 'Failed to move deal',
        );
      }
    });
  };

  // Sort stages by position
  const sortedStages = [...(pipeline.stages || [])].sort(
    (a, b) => (a.position || 0) - (b.position || 0),
  );

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{pipeline.name}</h2>
          {pipeline.description && (
            <p className="text-sm text-muted-foreground">{pipeline.description}</p>
          )}
        </div>
        <If condition={canCreate}>
          <NewDealDialog
            accountId={accountId}
            pipelineId={pipeline.id}
            stages={sortedStages}
            clients={clients}
          />
        </If>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {sortedStages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground w-full">
            <p>No stages configured for this pipeline.</p>
            <p className="text-sm mt-2">Please add stages to the pipeline first.</p>
          </div>
        ) : (
          sortedStages.map((stage) => {
          const stageDeals = dealsByStage[stage.id] || [];
          const stageValue = stageDeals.reduce(
            (sum, deal) => sum + Number(deal.value || 0),
            0,
          );

          return (
            <div
              key={stage.id}
              className="flex-shrink-0 w-80 flex flex-col"
            >
              <Card className="h-full">
                <CardHeader
                  className="pb-3"
                  style={{
                    borderBottomColor: stage.color || undefined,
                    borderBottomWidth: stage.color ? '3px' : undefined,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{stage.name}</CardTitle>
                    <span className="text-xs text-muted-foreground">
                      {stageDeals.length} deals
                    </span>
                  </div>
                  {stageValue > 0 && (
                    <p className="text-sm font-semibold text-muted-foreground">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(stageValue)}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-2 pt-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                  {stageDeals.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No deals in this stage
                    </div>
                  ) : (
                    stageDeals.map((deal) => (
                      <DealCard
                        key={deal.id}
                        deal={deal}
                        accountSlug={accountSlug}
                        canUpdate={canUpdate}
                        canDelete={canDelete}
                        onStageChange={handleStageChange}
                        availableStages={sortedStages}
                      />
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })
        )}
      </div>
    </div>
  );
}
