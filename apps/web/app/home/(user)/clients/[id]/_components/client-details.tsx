'use client';

import Link from 'next/link';

import { Button } from '@kit/ui/button';

import { ClientDetails as BaseClientDetails } from '~/home/[account]/clients/_components/client-details';
import { Tables } from '@kit/supabase/database';

type Client = Tables<'clients'>;

interface ClientDetailsProps {
  client: Client;
  accountId: string;
  accountSlug: string;
  canUpdate: boolean;
  canDelete: boolean;
}

/**
 * Wrapper for ClientDetails component for personal accounts
 * Fixes the back link to use /home/clients instead of /home/[accountSlug]/clients
 */
export function ClientDetails(props: ClientDetailsProps) {
  // Use custom backLink for personal accounts
  return <BaseClientDetails {...props} backLink="/home/clients" />;
}
