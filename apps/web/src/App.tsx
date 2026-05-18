import { Redirect, Route, Switch } from "wouter";
import { BrandLogo } from "./components/brand/BrandLogo";
import { Layout } from "./components/layout/Layout";
import { GuardedRedirect } from "./components/routing/GuardedRedirect";
import { LegacyFactoryRedirects } from "./components/routing/LegacyFactoryRedirects";
import { ToastProvider } from "./components/ui/Toast";
import { useTranslation } from "./context/I18nContext";
import { guardedRoute } from "./lib/guardedRoute";
import { ORDERS_METAL_LIST_REDIRECT, ORDERS_WOOD_LIST_REDIRECT } from "./lib/canonicalRoutes";
import {
  AboutSystemPage,
  AuditLogPage,
  DailyMetalPage,
  DailyWoodPage,
  DashboardPage,
  DepartmentsPage,
  DevToolsMapPage,
  EquipmentRegistryPage,
  LoginPage,
  NewProjectPage,
  PerformanceDepartmentsPage,
  PerformancePeoplePage,
  PermissionsAdminPage,
  ProjectAnalyticsPage,
  WorkOrderAnalysisPage,
  WorkflowRoutingMapRoute,
} from "./pages/AppPages";
import {
  AnalyticsPage,
  ImportExportPage,
  MetalOrderDetailPage,
  PlanningPage,
  ProductionHubPage,
  ProjectAtlasPage,
  ProjectsHubPage,
  SharedProjectsPage,
  WorkforcePage,
  WoodenOrderDetailPage,
} from "./pages/factory/FactoryPages";

const G = guardedRoute;

function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <div data-testid="not-found" className="flex flex-col items-center justify-center gap-6 min-h-[60vh]">
      <BrandLogo className="h-14 w-auto max-w-[200px] object-contain opacity-80" />
      <h2 className="text-2xl font-bold text-brand-error tracking-tight text-center">{t("notFound.title")}</h2>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <Layout>
        <LegacyFactoryRedirects />
        <Switch>
          <Route path="/" component={DashboardPage} />
          <Route path="/dashboard/classic">
            <Redirect to="/" />
          </Route>
          <Route path="/login" component={LoginPage} />
          <Route path="/departments" component={DepartmentsPage} />
          <Route path="/audit-log" component={AuditLogPage} />
          <Route path="/performance/departments" component={PerformanceDepartmentsPage} />
          <Route path="/performance/people" component={PerformancePeoplePage} />

          <Route path="/production" component={G("/production", ProductionHubPage)} />

          <Route path="/orders/metal">
            <GuardedRedirect path="/orders/metal" to={ORDERS_METAL_LIST_REDIRECT} />
          </Route>
          <Route path="/orders/metal/:id" component={G("/orders/metal", MetalOrderDetailPage)} />
          <Route path="/orders/wood">
            <GuardedRedirect path="/orders/wood" to={ORDERS_WOOD_LIST_REDIRECT} />
          </Route>
          <Route path="/orders/wood/:id" component={G("/orders/wood", WoodenOrderDetailPage)} />

          <Route path="/daily/metal" component={DailyMetalPage} />
          <Route path="/daily/wood" component={DailyWoodPage} />

          <Route path="/projects/joint" component={G("/projects/joint", SharedProjectsPage)} />
          <Route path="/projects/hub" component={G("/projects/hub", ProjectsHubPage)} />
          <Route path="/projects/new" component={NewProjectPage} />
          <Route path="/projects/work-order-analysis" component={WorkOrderAnalysisPage} />

          <Route path="/workforce" component={G("/workforce", WorkforcePage)} />
          <Route path="/import-export" component={G("/import-export", ImportExportPage)} />

          <Route path="/planning" component={G("/planning", PlanningPage)} />
          <Route path="/about-system" component={AboutSystemPage} />
          <Route path="/workflow-routing" component={WorkflowRoutingMapRoute} />
          <Route path="/equipment" component={EquipmentRegistryPage} />

          <Route path="/analytics" component={G("/analytics", AnalyticsPage)} />
          <Route path="/analytics/wood" component={G("/analytics/wood", AnalyticsPage)} />
          <Route path="/analytics/metal" component={G("/analytics/metal", AnalyticsPage)} />
          <Route path="/project-analytics" component={ProjectAnalyticsPage} />

          <Route path="/admin/permissions" component={PermissionsAdminPage} />

          <Route path="/dev/tools" component={DevToolsMapPage} />
          <Route path="/dev/project-atlas" component={G("/dev/project-atlas", ProjectAtlasPage)} />

          <Route component={NotFoundPage} />
        </Switch>
      </Layout>
    </ToastProvider>
  );
}

export default App;
