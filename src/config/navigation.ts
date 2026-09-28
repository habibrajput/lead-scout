import {
  Globe,
  LayoutDashboard,
  type LucideIcon,
  MessageSquare,
  Search,
  Settings,
  Users,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Not built yet — rendered disabled with a "Soon" tag. */
  comingSoon?: boolean;
};

export type NavSection = {
  title?: string;
  items: NavItem[];
};

export const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      { label: "Lead finder", href: "/", icon: Search },
      { label: "Overview", href: "/overview", icon: LayoutDashboard, comingSoon: true },
    ],
  },
  {
    title: "Pipeline",
    items: [
      { label: "Leads", href: "/leads", icon: Users, comingSoon: true },
      { label: "Outreach", href: "/outreach", icon: MessageSquare, comingSoon: true },
      { label: "Sites", href: "/sites", icon: Globe, comingSoon: true },
    ],
  },
  {
    title: "Workspace",
    items: [{ label: "Settings", href: "/settings", icon: Settings, comingSoon: true }],
  },
];
