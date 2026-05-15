import { Link, useLocation } from "wouter";
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarTrigger } from "@/components/ui/sidebar";
import { LayoutDashboard, Factory, CalendarClock, LineChart, FileUp, UserCheck, FolderKanban } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navigation = [
    { name: "لوحة التحكم", href: "/", icon: LayoutDashboard },
    { name: "الإنتاج", href: "/production", icon: Factory },
    { name: "المشاريع", href: "/projects", icon: FolderKanban },
    { name: "القوة البشرية", href: "/workforce", icon: UserCheck },
    { name: "التخطيط والجدولة", href: "/planning", icon: CalendarClock },
    { name: "التحليلات", href: "/analytics", icon: LineChart },
    { name: "الاستيراد والتصدير", href: "/import-export", icon: FileUp },
  ];

  return (
    <SidebarProvider defaultOpen>
      <div className="flex h-screen overflow-hidden bg-background w-full" dir="rtl">
        <Sidebar className="border-l border-foreground/5 bg-surface h-full" side="right">
          <SidebarHeader className="p-8 mb-4">
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }}
              className="space-y-1"
            >
              <h1 className="text-2xl font-bold text-foreground tracking-[-0.04em]">نظام إبداع</h1>
              <div className="h-1 w-8 bg-accent rounded-full" />
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold pt-2">Executive Suite</p>
            </motion.div>
          </SidebarHeader>
          <SidebarContent className="px-4">
            <SidebarGroup>
              <SidebarMenu className="gap-2">
                {navigation.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={location === item.href || (item.href !== "/" && location.startsWith(item.href))}
                      tooltip={item.name}
                      className="h-12 rounded-2xl transition-all duration-300 ease-executive data-[active=true]:bg-accent/10 data-[active=true]:text-accent hover:bg-foreground/5 group"
                    >
                      <Link href={item.href} className="flex items-center gap-4 w-full px-4">
                        <div className="p-2 rounded-xl bg-foreground/5 group-hover:scale-110 transition-transform duration-300 ease-executive group-data-[active=true]:bg-accent group-data-[active=true]:text-white">
                          <item.icon className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-sm tracking-tight">{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <header className="h-20 border-b border-foreground/5 bg-surface/50 backdrop-blur-md flex items-center gap-8 px-12 shrink-0 z-10">
            <SidebarTrigger className="hover:bg-foreground/5 rounded-xl h-10 w-10" />
            <div className="font-bold text-xl tracking-tight text-foreground/80 font-editorial">
              {navigation.find(n => location === n.href || (n.href !== "/" && location.startsWith(n.href)))?.name || "نظام إبداع"}
            </div>
          </header>
          <main className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location}
                initial={{ opacity: 0, y: 30, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.99 }}
                transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                className="min-h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
