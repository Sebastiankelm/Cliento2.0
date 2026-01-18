import { requireUser } from '@kit/supabase/require-user';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { SiteFooter } from '~/(marketing)/_components/site-footer';
import { SiteHeader } from '~/(marketing)/_components/site-header';
import { withI18n } from '~/lib/i18n/with-i18n';

async function SiteLayout(props: React.PropsWithChildren) {
  const client = getSupabaseServerClient();
  const auth = await requireUser(client, { verifyMfa: false });

  // Marketing layout should work for both authenticated and unauthenticated users
  // If there's an error, we just pass null to SiteHeader (it handles both cases)
  const user = auth.error ? null : auth.data;

  return (
    <div className={'flex min-h-[100vh] flex-col'}>
      <SiteHeader user={user} />

      {props.children}

      <SiteFooter />
    </div>
  );
}

export default withI18n(SiteLayout);
