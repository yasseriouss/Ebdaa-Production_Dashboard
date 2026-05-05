import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AppLayout } from "@/components/layout";

// Pages
import Dashboard from "@/pages/dashboard";
import MetalOrders from "@/pages/metal-orders";
import MetalOrderDetail from "@/pages/metal-order-detail";
import MetalProduction from "@/pages/metal-production";
import WoodenOrders from "@/pages/wooden-orders";
import WoodenOrderDetail from "@/pages/wooden-order-detail";
import SharedProjects from "@/pages/shared-projects";
import Planning from "@/pages/planning";
import Analytics from "@/pages/analytics";
import ImportExport from "@/pages/import-export";

const queryClient = new QueryClient();

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/metal/orders" component={MetalOrders} />
        <Route path="/metal/orders/:id" component={MetalOrderDetail} />
        <Route path="/metal/production" component={MetalProduction} />
        <Route path="/wooden/orders" component={WoodenOrders} />
        <Route path="/wooden/orders/:id" component={WoodenOrderDetail} />
        <Route path="/shared-projects" component={SharedProjects} />
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
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
