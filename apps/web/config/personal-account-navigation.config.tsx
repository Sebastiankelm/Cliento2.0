import { Building2, CreditCard, Home, User } from 'lucide-react';
import { z } from 'zod';

import { NavigationConfigSchema } from '@kit/ui/navigation-schema';

import featureFlagsConfig from '~/config/feature-flags.config';
import pathsConfig from '~/config/paths.config';

const iconClasses = 'w-4';

const baseRoutes = [
  {
    label: 'common:routes.application',
    children: [
      {
        label: 'common:routes.home',
        path: pathsConfig.app.home,
        Icon: <Home className={iconClasses} />,
        end: true,
      },
    ],
  },
  {
    label: 'common:routes.settings',
    children: [
      {
        label: 'common:routes.profile',
        path: pathsConfig.app.personalAccountSettings,
        Icon: <User className={iconClasses} />,
      },
      featureFlagsConfig.enablePersonalAccountBilling
        ? {
            label: 'common:routes.billing',
            path: pathsConfig.app.personalAccountBilling,
            Icon: <CreditCard className={iconClasses} />,
          }
        : undefined,
    ].filter((route) => !!route),
  },
] satisfies z.infer<typeof NavigationConfigSchema>['routes'];

/**
 * Get personal account navigation config with team accounts links
 */
export function getPersonalAccountNavigationConfig(accounts: Array<{
  label: string | null;
  value: string | null;
  image: string | null;
}>) {
  const teamAccountsRoutes = accounts.length > 0
    ? [
        {
          label: 'common:teamAccounts',
          children: accounts.map((account) => ({
            label: account.label ?? account.value ?? 'Team Account',
            path: pathsConfig.app.accountHome.replace('[account]', account.value ?? ''),
            Icon: <Building2 className={iconClasses} />,
          })),
        },
      ]
    : [];

  const routes = [...baseRoutes, ...teamAccountsRoutes] satisfies z.infer<typeof NavigationConfigSchema>['routes'];

  return NavigationConfigSchema.parse({
    routes,
    style: process.env.NEXT_PUBLIC_USER_NAVIGATION_STYLE,
    sidebarCollapsed: process.env.NEXT_PUBLIC_HOME_SIDEBAR_COLLAPSED,
    sidebarCollapsedStyle: process.env.NEXT_PUBLIC_SIDEBAR_COLLAPSIBLE_STYLE,
  });
}

/**
 * Static config for backward compatibility
 */
export const personalAccountNavigationConfig = NavigationConfigSchema.parse({
  routes: baseRoutes,
  style: process.env.NEXT_PUBLIC_USER_NAVIGATION_STYLE,
  sidebarCollapsed: process.env.NEXT_PUBLIC_HOME_SIDEBAR_COLLAPSED,
  sidebarCollapsedStyle: process.env.NEXT_PUBLIC_SIDEBAR_COLLAPSIBLE_STYLE,
});
