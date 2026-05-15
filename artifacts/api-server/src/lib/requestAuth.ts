/**
 * سياق المصادقة: ضيف (افتراضي بلا قيود في التطوير) أو مستخدم JWT مع صلاحيات ونطاق بيانات.
 */
export type DataScope =
  | { mode: "full" }
  | { mode: "scoped"; factoryIds: string[]; departmentIds: string[] };

export type RequestAuth =
  | {
      kind: "anonymous";
      /** عند true لا تُرفض مسارات الواجهة قبل تسجيل الدخول (الوضع التطويري الافتراضي). */
      unrestricted: boolean;
    }
  | {
      kind: "user";
      userId: string;
      email: string;
      employeeId: string | null;
      permissionKeys: string[];
      dataScope: DataScope;
    };

/** ضيف افتراضي — لا يفرض تسجيل دخول حتى يُضبط التشغيل الصارم. */
export const DEFAULT_ANONYMOUS_AUTH: RequestAuth = {
  kind: "anonymous",
  unrestricted: true,
};

/** تشغيل إنتاجي أو `AUTH_ANONYMOUS_UNRESTRICTED=false`: ضيف بلا صلاحيات. */
export function restrictedAnonymousAuth(): RequestAuth {
  return {
    kind: "anonymous",
    unrestricted: false,
  };
}
