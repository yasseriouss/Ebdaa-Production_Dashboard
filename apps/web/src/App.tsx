import { Redirect, Route, Switch } from "wouter";
import { BrandLogo } from "./components/brand/BrandLogo";
import { Layout } from "./components/layout/Layout";
import { LegacyFactoryRedirects } from "./components/routing/LegacyFactoryRedirects";
import { RequirePermission } from "./components/routing/RequirePermission";
import { ToastProvider } from "./components/ui/Toast";
import { useTranslation } from "./context/I18nContext";
import { guardedRoute } from "./lib/guardedRoute";
import Dashboard from "./pages/Dashboard";
import ProjectAnalytics from "./pages/ProjectAnalytics";
import NewProject from "./pages/NewProject";
import WorkOrderAnalysis from "./pages/WorkOrderAnalysis";
import DailyProduction from "./pages/DailyProduction";
import AboutSystem from "./pages/AboutSystem";
import WorkflowRoutingMapPage from "./pages/WorkflowRoutingMap";
import EquipmentRegistry from "./pages/EquipmentRegistry";
import PermissionsAdmin from "./pages/PermissionsAdmin";
import Login from "./pages/Login";
import Departments from "./pages/Departments";
import AuditLog from "./pages/AuditLog";
import PerformanceDepartments from "./pages/PerformanceDepartments";
import PerformancePeople from "./pages/PerformancePeople";
import DevToolsMap from "./pages/DevToolsMap";
import {
  AnalyticsPage,
  ImportExportPage,
  MetalOrderDetailPage,
  MetalOrdersPage,
  PlanningPage,
  ProductionHubPage,
  ProjectAtlasPage,
  ProjectsHubPage,
  SharedProjectsPage,
  WorkforcePage,
  WoodenOrderDetailPage,
  WoodenOrdersPage,
} from "./pages/factory/FactoryPages";

const G = guardedRoute;

function DailyMetalPage() {
  return (
    <RequirePermission path="/daily/metal">
      <DailyProduction factory="metal" />
    </RequirePermission>
  );
}

function DailyWoodPage() {
  return (
    <RequirePermission path="/daily/wood">
      <DailyProduction factory="wood" />
    </RequirePermission>
  );
}

function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center gap-6 min-h-[60vh]">
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
          <Route path="/" component={G("/", Dashboard)} />
          <Route path="/dashboard/classic">
            <Redirect to="/" />
          </Route>
          <Route path="/login" component={Login} />
          <Route path="/departments" component={G("/departments", Departments)} />
          <Route path="/audit-log" component={G("/audit-log", AuditLog)} />
          <Route path="/performance/departments" component={G("/performance/departments", PerformanceDepartments)} />
          <Route path="/performance/people" component={G("/performance/people", PerformancePeople)} />

          <Route path="/production" component={G("/production", ProductionHubPage)} />

          <Route path="/orders/metal" component={G("/orders/metal", MetalOrdersPage)} />
          <Route path="/orders/metal/:id" component={G("/orders/metal", MetalOrderDetailPage)} />
          <Route path="/orders/wood" component={G("/orders/wood", WoodenOrdersPage)} />
          <Route path="/orders/wood/:id" component={G("/orders/wood", WoodenOrderDetailPage)} />

          <Route path="/daily/metal" component={DailyMetalPage} />
          <Route path="/daily/wood" component={DailyWoodPage} />

          <Route path="/projects/joint" component={G("/projects/joint", SharedProjectsPage)} />
          <Route path="/projects/hub" component={G("/projects/hub", ProjectsHubPage)} />
          <Route path="/projects/new" component={G("/projects/new", NewProject)} />
          <Route path="/projects/work-order-analysis" component={G("/projects/work-order-analysis", WorkOrderAnalysis)} />

          <Route path="/workforce" component={G("/workforce", WorkforcePage)} />
          <Route path="/import-export" component={G("/import-export", ImportExportPage)} />

          <Route path="/planning" component={G("/planning", PlanningPage)} />
          <Route path="/about-system" component={G("/about-system", AboutSystem)} />
          <Route path="/workflow-routing" component={G("/workflow-routing", WorkflowRoutingMapPage)} />
          <Route path="/equipment" component={G("/equipment", EquipmentRegistry)} />

          <Route path="/analytics" component={G("/analytics", AnalyticsPage)} />
          <Route path="/analytics/wood" component={G("/analytics/wood", AnalyticsPage)} />
          <Route path="/analytics/metal" component={G("/analytics/metal", AnalyticsPage)} />
          <Route path="/project-analytics" component={G("/project-analytics", ProjectAnalytics)} />

          <Route path="/admin/permissions" component={G("/admin/permissions", PermissionsAdmin)} />

          <Route path="/dev/tools" component={G("/dev/tools", DevToolsMap)} />
          <Route path="/dev/project-atlas" component={G("/dev/project-atlas", ProjectAtlasPage)} />

          <Route component={NotFoundPage} />
        </Switch>
      </Layout>
    </ToastProvider>
  );
}

export default App;
