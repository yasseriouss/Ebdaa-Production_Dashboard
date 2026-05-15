import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiJson } from "../lib/api/client";

export type PermissionContextValue = {
  loading: boolean;
  unrestricted: boolean;
  keys: Set<string>;
  refresh: () => Promise<void>;
};

const PermissionContext = createContext<PermissionContextValue | null>(null);

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [unrestricted, setUnrestricted] = useState(true);
  const [keys, setKeys] = useState<Set<string>>(new Set());

  const fetchEffective = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiJson<{ unrestricted?: boolean; keys?: string[] }>(
        "/api/auth/effective-permissions",
      );
      setUnrestricted(Boolean(data?.unrestricted));
      setKeys(new Set(Array.isArray(data?.keys) ? data.keys : []));
    } catch {
      setUnrestricted(true);
      setKeys(new Set());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchEffective();
  }, [fetchEffective]);

  const value = useMemo<PermissionContextValue>(
    () => ({
      loading,
      unrestricted,
      keys,
      refresh: fetchEffective,
    }),
    [loading, unrestricted, keys, fetchEffective],
  );

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}

export function usePermissions(): PermissionContextValue {
  const ctx = useContext(PermissionContext);
  if (!ctx) {
    throw new Error("usePermissions must be used within PermissionProvider");
  }
  return ctx;
}

/** إذا لم يُحمَّل السياق بعد، يُعتبر المسموح `true` لتجنب إخفاء القائمة قبل التحميل. */
export function useRouteAllowed(requiredPermission: string | undefined): boolean {
  const { loading, unrestricted, keys } = usePermissions();
  if (!requiredPermission) return true;
  if (loading || unrestricted) return true;
  return keys.has(requiredPermission);
}
