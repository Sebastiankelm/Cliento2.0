import {
  CreditCard,
  LayoutDashboard,
  Settings,
  Users,
  UserCircle,
  Briefcase,
  CheckSquare,
  Zap,
  Mail,
  BarChart3,
} from 'lucide-react';

import { NavigationConfigSchema } from '@kit/ui/navigation-schema';

import featureFlagsConfig from '~/config/feature-flags.config';
import pathsConfig from '~/config/paths.config';

const iconClasses = 'w-4';

const getRoutes = (account: string) => [
  {
    label: 'common:routes.application',
    children: [
      {
        label: 'common:routes.dashboard',
        path: pathsConfig.app.accountHome.replace('[account]', account),
        Icon: <LayoutDashboard className={iconClasses} />,
        end: true,
      },
    ],
  },
  {
    label: 'common:routes.crm',
    children: [
      {
        label: 'common:routes.dashboard',
        path: pathsConfig.app.accountHome.replace('[account]', account),
        Icon: <LayoutDashboard className={iconClasses} />,
      },
      {
        label: 'common:routes.clients',
        path: `/home/${account}/clients`,
        Icon: <UserCircle className={iconClasses} />,
      },
      {
        label: 'common:routes.deals',
        path: `/home/${account}/deals`,
        Icon: <Briefcase className={iconClasses} />,
      },
      {
        label: 'common:routes.tasks',
        path: `/home/${account}/tasks`,
        Icon: <CheckSquare className={iconClasses} />,
      },
      {
        label: 'common:routes.automation',
        path: `/home/${account}/automation`,
        Icon: <Zap className={iconClasses} />,
      },
      {
        label: 'common:routes.integrations',
        path: `/home/${account}/integrations`,
        Icon: <Mail className={iconClasses} />,
      },
      {
        label: 'common:routes.reports',
        path: `/home/${account}/reports`,
        Icon: <BarChart3 className={iconClasses} />,
      },
    ],
  },
  {
    label: 'common:routes.settings',
    collapsible: false,
    children: [
      {
        label: 'common:routes.settings',
        path: createPath(pathsConfig.app.accountSettings, account),
        Icon: <Settings className={iconClasses} />,
      },
      {
        label: 'common:routes.members',
        path: createPath(pathsConfig.app.accountMembers, account),
        Icon: <Users className={iconClasses} />,
      },
      featureFlagsConfig.enableTeamAccountBilling
        ? {
            label: 'common:routes.billing',
            path: createPath(pathsConfig.app.accountBilling, account),
            Icon: <CreditCard className={iconClasses} />,
          }
        : undefined,
    ].filter(Boolean),
  },
];

export function getTeamAccountSidebarConfig(account: string) {
  return NavigationConfigSchema.parse({
    routes: getRoutes(account),
    style: process.env.NEXT_PUBLIC_TEAM_NAVIGATION_STYLE,
    sidebarCollapsed: process.env.NEXT_PUBLIC_TEAM_SIDEBAR_COLLAPSED,
    sidebarCollapsedStyle: process.env.NEXT_PUBLIC_SIDEBAR_COLLAPSIBLE_STYLE,
  });
}

function createPath(path: string, account: string) {
  return path.replace('[account]', account);
}
