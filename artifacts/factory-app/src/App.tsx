import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AppLayout } from "@/components/layout";
import ProjectAtlas from "@/pages/internal/project-atlas";

// Pages
import Dashboard from "@/pages/dashboard";
import MetalOrderDetail from "@/pages/metal-order-detail";
import WoodenOrderDetail from "@/pages/wooden-order-detail";
import MetalOrders from "@/pages/metal-orders";
import WoodenOrders from "@/pages/wooden-orders";
import Production from "@/pages/production-hub";
import Projects from "@/pages/projects-hub";
import Planning from "@/pages/planning";
import Analytics from "@/pages/analytics";
import ImportExport from "@/pages/import-export";
import Workforce from "@/pages/workforce";

const queryClient = new QueryClient();

const showProjectAtlas =
  import.meta.env.DEV || import.meta.env.VITE_SHOW_PROJECT_ATLAS === "1";

function Router() {
  const [location] = useLocation();

  if (showProjectAtlas && location === "/__internal/project-atlas") {
    return <ProjectAtlas />;
  }

  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/production" component={Production} />
        <Route path="/metal/orders/:id" component={MetalOrderDetail} />
        <Route path="/metal/orders" component={MetalOrders} />
        <Route path="/wooden/orders/:id" component={WoodenOrderDetail} />
        <Route path="/wooden/orders" component={WoodenOrders} />
        <Route path="/projects" component={Projects} />
        <Route path="/workforce" component={Workforce} />
        <Route path="/planning" component={Planning} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/import-export" component={ImportExport} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <div dir="rtl" lang="ar" className="min-h-svh">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
