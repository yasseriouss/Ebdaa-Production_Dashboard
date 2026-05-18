import { lazy, Suspense, type ComponentType } from "react";
import { useTranslation } from "../context/I18nContext";
import { RequirePermission } from "../components/routing/RequirePermission";
import { guardedRoute } from "../lib/guardedRoute";

const Dashboard = lazy(() => import("./Dashboard"));
const ProjectAnalytics = lazy(() => import("./ProjectAnalytics"));
const NewProject = lazy(() => import("./NewProject"));
const WorkOrderAnalysis = lazy(() => import("./WorkOrderAnalysis"));
const DailyProduction = lazy(() => import("./DailyProduction"));
const AboutSystem = lazy(() => import("./AboutSystem"));
const WorkflowRoutingMapPage = lazy(() => import("./WorkflowRoutingMap"));
const EquipmentRegistry = lazy(() => import("./EquipmentRegistry"));
const PermissionsAdmin = lazy(() => import("./PermissionsAdmin"));
const Login = lazy(() => import("./Login"));
const Departments = lazy(() => import("./Departments"));
const AuditLog = lazy(() => import("./AuditLog"));
const PerformanceDepartments = lazy(() => import("./PerformanceDepartments"));
const PerformancePeople = lazy(() => import("./PerformancePeople"));
const DevToolsMap = lazy(() => import("./DevToolsMap"));

function PageFallback() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[40vh] items-center justify-center p-8 text-brand-metal">
      {t("common.loading")}
    </div>
  );
}

function withPageSuspense<P extends object>(LazyPage: ComponentType<P>) {
  return function SuspensePage(props: P) {
    return (
      <Suspense fallback={<PageFallback />}>
        <LazyPage {...props} />
      </Suspense>
    );
  };
}

export const DashboardPage = guardedRoute("/", withPageSuspense(Dashboard));
export const ProjectAnalyticsPage = guardedRoute(
  "/project-analytics",
  withPageSuspense(ProjectAnalytics),
);
export const NewProjectPage = guardedRoute("/projects/new", withPageSuspense(NewProject));
export const WorkOrderAnalysisPage = guardedRoute(
  "/projects/work-order-analysis",
  withPageSuspense(WorkOrderAnalysis),
);
export const AboutSystemPage = guardedRoute("/about-system", withPageSuspense(AboutSystem));
export const WorkflowRoutingMapRoute = guardedRoute(
  "/workflow-routing",
  withPageSuspense(WorkflowRoutingMapPage),
);
export const EquipmentRegistryPage = guardedRoute("/equipment", withPageSuspense(EquipmentRegistry));
export const PermissionsAdminPage = guardedRoute(
  "/admin/permissions",
  withPageSuspense(PermissionsAdmin),
);
export const LoginPage = withPageSuspense(Login);
export const DepartmentsPage = guardedRoute("/departments", withPageSuspense(Departments));
export const AuditLogPage = guardedRoute("/audit-log", withPageSuspense(AuditLog));
export const PerformanceDepartmentsPage = guardedRoute(
  "/performance/departments",
  withPageSuspense(PerformanceDepartments),
);
export const PerformancePeoplePage = guardedRoute(
  "/performance/people",
  withPageSuspense(PerformancePeople),
);
export const DevToolsMapPage = guardedRoute("/dev/tools", withPageSuspense(DevToolsMap));

const DailyProductionLazy = withPageSuspense(DailyProduction);

export function DailyMetalPage() {
  return (
    <RequirePermission path="/daily/metal">
      <DailyProductionLazy factory="metal" />
    </RequirePermission>
  );
}

export function DailyWoodPage() {
  return (
    <RequirePermission path="/daily/wood">
      <DailyProductionLazy factory="wood" />
    </RequirePermission>
  );
}
