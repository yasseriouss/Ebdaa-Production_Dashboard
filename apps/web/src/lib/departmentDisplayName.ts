const DEPARTMENT_DISPLAY_ALIASES: Record<string, string> = {
  DEPT_PANEL_PROC: "قسم المسطحات",
};

const LEGACY_NAME_ALIASES: Record<string, string> = {
  "قسم المسطحات والتشغيل الآلي": "قسم المسطحات",
};

/** عرض اسم قسم مختصر في الواجهة (مثلاً DEPT_PANEL_PROC → قسم المسطحات). */
export function formatDepartmentDisplayName(name: string, departmentId?: string): string {
  if (departmentId && DEPARTMENT_DISPLAY_ALIASES[departmentId]) {
    return DEPARTMENT_DISPLAY_ALIASES[departmentId];
  }
  return LEGACY_NAME_ALIASES[name] ?? name;
}
