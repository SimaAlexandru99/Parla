import {
  LayoutGrid,
  LineChart,
  PhoneCall,
  Users,
  Bot,
  FolderCog,
} from "lucide-react";

export const navItems = (t: any) => [
  {
    icon: LayoutGrid,
    tooltip: t.buttons.dashboard,
    view: "dashboard",
    title: t.buttons.dashboard,
    text: t.buttons.dashboard,
    href: "/dashboard",
  },
  {
    icon: LineChart,
    tooltip: t.call_page.analytics,
    view: "analytics",
    title: t.call_page.analytics,
    text: t.call_page.analytics,
    href: "/analytics",
  },
  {
    icon: PhoneCall,
    tooltip: t.call_page.calls,
    view: "calls",
    title: t.call_page.calls,
    text: t.call_page.calls,
    href: "/calls",
  },
  {
    icon: Users,
    tooltip: t.call_page.agents,
    view: "agents",
    title: t.call_page.agents,
    text: t.call_page.agents,
    href: "/agents",
  },
  {
    icon: FolderCog,
    tooltip: t.projectsPage.title,
    view: "projects",
    title: t.projectsPage.title,
    text: t.projectsPage.title,
    href: "/projects",
  },
  {
    icon: Bot,
    tooltip: t.call_page.chat,
    view: "next-ai",
    title: t.call_page.chat,
    text: t.call_page.chat,
    href: "/next-ai",
  },
];
