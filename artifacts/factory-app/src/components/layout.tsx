import { Link, useLocation } from "wouter";
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarTrigger } from "@/components/ui/sidebar";
import { LayoutDashboard, Factory, Wrench, Boxes, CalendarClock, LineChart, FileUp, Users, TreePine } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navigation = [
    { name: "لوحة التحكم", href: "/", icon: LayoutDashboard },
    { name: "المصنع المعدني", href: "/metal/orders", icon: Factory },
    { name: "الإنتاج اليومي المعدني", href: "/metal/production", icon: Wrench },
    { name: "المصنع الخشبي", href: "/wooden/orders", icon: Boxes },
    { name: "الإنتاج اليومي الخشبي", href: "/wooden/production", icon: TreePine },
    { name: "المشاريع المشتركة", href: "/shared-projects", icon: Users },
    { name: "التخطيط والجدولة", href: "/planning", icon: CalendarClock },
    { name: "التحليلات", href: "/analytics", icon: LineChart },
    { name: "الاستيراد والتصدير", href: "/import-export", icon: FileUp },
  ];

  return (
    <SidebarProvider defaultOpen>
      <div className="flex h-screen overflow-hidden bg-background w-full" dir="rtl">
        <Sidebar className="border-l border-border bg-sidebar h-full" side="right">
          <SidebarHeader className="p-4 border-b border-border">
            <h1 className="text-xl font-bold text-primary tracking-tight">نظام إبداع</h1>
            <p className="text-xs text-muted-foreground mt-1">إدارة المصانع</p>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                {navigation.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={location === item.href || (item.href !== "/" && location.startsWith(item.href))}
                      tooltip={item.name}
                    >
                      <Link href={item.href} className="flex items-center gap-3 w-full" data-testid={`nav-${item.href.replace(/\//g, "-")}`}>
                        <item.icon className="h-4 w-4" />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <header className="h-14 border-b border-border bg-card flex items-center px-4 shrink-0">
            <SidebarTrigger />
            <div className="mr-4 font-medium text-foreground">
              {navigation.find(n => location === n.href || (n.href !== "/" && location.startsWith(n.href)))?.name || "نظام إبداع"}
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
