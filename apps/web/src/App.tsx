import { Route, Switch } from "wouter";
import { ArabicText } from "./components/brand/ArabicText";
import { BrandLogo } from "./components/brand/BrandLogo";
import { Layout } from "./components/layout/Layout";
import { ToastProvider } from "./components/ui/Toast";
import Dashboard from "./pages/Dashboard";
import WoodOrders from "./pages/WoodOrders";
import { AnalyticsAll, AnalyticsMetal, AnalyticsWood } from "./pages/Analytics";
import ProjectAnalytics from "./pages/ProjectAnalytics";
import NewProject from "./pages/NewProject";
import WorkOrderAnalysis from "./pages/WorkOrderAnalysis";
import DailyProduction from "./pages/DailyProduction";
import AboutSystem from "./pages/AboutSystem";
import EquipmentRegistry from "./pages/EquipmentRegistry";
import PlanningKpi from "./pages/PlanningKpi";

const Placeholder = ({ title, arabicTitle, hint }: { title: string; arabicTitle: string; hint?: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] glass-panel p-12 border-dashed">
    <BrandLogo className="h-16 w-auto max-w-[min(280px,85vw)] object-contain mb-8 opacity-90" />
    <h2 className="text-4xl font-bold tracking-tighter uppercase mb-4">{title}</h2>
    <ArabicText block className="text-xl font-medium text-brand-metal mb-8">
      {arabicTitle}
    </ArabicText>
    {hint ? (
      <p className="text-xs text-brand-metal text-center max-w-lg mb-8 leading-relaxed">{hint}</p>
    ) : null}
    <div className="flex gap-4">
      <div className="w-12 h-px bg-brand-border" />
      <p className="text-[10px] text-brand-metal uppercase tracking-[0.5em]">Module Under Construction</p>
      <div className="w-12 h-px bg-brand-border" />
    </div>
  </div>
);

function App() {
  return (
    <ToastProvider>
      <Layout>
        <Switch>
          <Route path="/" component={Dashboard} />

          {/* Production Orders */}
          <Route path="/orders/metal">
            <Placeholder
              title="Metal Factory Orders"
              arabicTitle="أوامر مصنع المعادن"
              hint="العقد الحالي: واجهة GET /api/metal/orders على خادم ERP. شاشة لوحة الويب الموحّدة ستتصل بـ factory-hub عند توفر نموذج JSON للمعدّن."
            />
          </Route>
          <Route path="/orders/wood" component={WoodOrders} />

          {/* Daily Production */}
          <Route path="/daily/metal">
            <DailyProduction factory="metal" />
          </Route>
          <Route path="/daily/wood">
            <DailyProduction factory="wood" />
          </Route>

          {/* Projects */}
          <Route path="/projects/joint">
            <Placeholder title="Joint Projects" arabicTitle="المشاريع المشتركة" />
          </Route>
          <Route path="/projects/new" component={NewProject} />
          <Route path="/projects/work-order-analysis" component={WorkOrderAnalysis} />

          <Route path="/planning" component={PlanningKpi} />

          <Route path="/about-system" component={AboutSystem} />
          <Route path="/equipment" component={EquipmentRegistry} />

          {/* Analytics */}
          <Route path="/analytics" component={AnalyticsAll} />
          <Route path="/analytics/wood" component={AnalyticsWood} />
          <Route path="/analytics/metal" component={AnalyticsMetal} />
          <Route path="/project-analytics" component={ProjectAnalytics} />

          {/* 404 */}
          <Route>
            <div className="flex flex-col items-center justify-center gap-6 min-h-[60vh]">
              <BrandLogo className="h-14 w-auto max-w-[200px] object-contain opacity-80" />
              <h2 className="text-2xl font-bold uppercase tracking-widest text-brand-error">
                404 | Out of Bounds
              </h2>
            </div>
          </Route>
        </Switch>
      </Layout>
    </ToastProvider>
  );
}

export default App;
