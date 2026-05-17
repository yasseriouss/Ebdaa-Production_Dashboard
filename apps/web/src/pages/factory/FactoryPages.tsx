import { lazy, Suspense, type ComponentType } from "react";
import { FactorySurface } from "../../components/factory/FactorySurface";
import { useTranslation } from "../../context/I18nContext";

const ProductionHub = lazy(() => import("@factory/pages/production-hub"));
const ImportExport = lazy(() => import("@factory/pages/import-export"));
const Workforce = lazy(() => import("@factory/pages/workforce"));
const ProjectsHub = lazy(() => import("@factory/pages/projects-hub"));
const SharedProjects = lazy(() => import("@factory/pages/shared-projects"));
const MetalOrders = lazy(() => import("@factory/pages/metal-orders"));
const WoodenOrders = lazy(() => import("@factory/pages/wooden-orders"));
const MetalOrderDetail = lazy(() => import("@factory/pages/metal-order-detail"));
const WoodenOrderDetail = lazy(() => import("@factory/pages/wooden-order-detail"));
const Analytics = lazy(() => import("@factory/pages/analytics"));
const Planning = lazy(() => import("@factory/pages/planning"));
const ProjectAtlas = lazy(() => import("@factory/pages/internal/project-atlas"));

function FactoryFallback() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[40vh] items-center justify-center p-8 text-brand-metal">
      {t("common.loading")}
    </div>
  );
}

function withFactorySurface<P extends object>(LazyPage: ComponentType<P>) {
  return function FactoryPage(props: P) {
    return (
      <FactorySurface>
        <Suspense fallback={<FactoryFallback />}>
          <LazyPage {...props} />
        </Suspense>
      </FactorySurface>
    );
  };
}

export const ProductionHubPage = withFactorySurface(ProductionHub);
export const ImportExportPage = withFactorySurface(ImportExport);
export const WorkforcePage = withFactorySurface(Workforce);
export const ProjectsHubPage = withFactorySurface(ProjectsHub);
export const SharedProjectsPage = withFactorySurface(SharedProjects);
export const MetalOrdersPage = withFactorySurface(MetalOrders);
export const WoodenOrdersPage = withFactorySurface(WoodenOrders);
export const MetalOrderDetailPage = withFactorySurface(MetalOrderDetail);
export const WoodenOrderDetailPage = withFactorySurface(WoodenOrderDetail);
export const AnalyticsPage = withFactorySurface(Analytics);
export const PlanningPage = withFactorySurface(Planning);

const showProjectAtlas =
  import.meta.env.DEV || import.meta.env.VITE_SHOW_PROJECT_ATLAS === "1";

export function ProjectAtlasPage() {
  if (!showProjectAtlas) return null;
  const Page = withFactorySurface(ProjectAtlas);
  return <Page />;
}
