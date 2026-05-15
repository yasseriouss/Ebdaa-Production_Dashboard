/**
 * أقل صلاحية مطلوبة لعرض كل مسار في القائمة الجانبية.
 * عند تفعيل مستخدم مقيد لاحقاً، تُخفى العناصر التي لا يملك مفتاحها.
 */
export const ROUTE_REQUIRED_PERMISSION: Record<string, string> = {
  "/": "dashboard:view",
  "/orders/metal": "orders:metal:view",
  "/orders/wood": "orders:wood:view",
  "/daily/metal": "daily:metal:view",
  "/daily/wood": "daily:wood:view",
  "/projects/joint": "projects:joint:view",
  "/projects/new": "projects:new:view",
  "/projects/work-order-analysis": "projects:wo_analysis:view",
  "/planning": "planning:view",
  "/about-system": "about:view",
  "/equipment": "equipment:view",
  "/analytics": "analytics:multi:view",
  "/analytics/wood": "analytics:wood:view",
  "/analytics/metal": "analytics:metal:view",
  "/project-analytics": "project_analytics:view",
  "/admin/permissions": "admin:permissions:view",
  "/departments": "directory:departments:view",
  "/audit-log": "audit:view",
  "/performance/departments": "performance:departments:view",
  "/performance/people": "performance:people:view",
};
