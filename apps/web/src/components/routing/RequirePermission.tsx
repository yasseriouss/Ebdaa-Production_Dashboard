import type { ReactNode } from "react";
import { useTranslation } from "../../context/I18nContext";
import { usePermissions } from "../../context/PermissionContext";
import { ROUTE_REQUIRED_PERMISSION } from "../../lib/routePermissions";

type Props = {
  path: string;
  children: ReactNode;
};

export function RequirePermission({ path, children }: Props) {
  const { t } = useTranslation();
  const { loading, unrestricted, keys } = usePermissions();
  const required = ROUTE_REQUIRED_PERMISSION[path];

  if (!required || loading || unrestricted || keys.has(required)) {
    return children;
  }

  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center"
      role="alert"
    >
      <p className="text-lg font-bold text-brand-luxury">{t("permissions.deniedTitle")}</p>
      <p className="max-w-md text-sm text-brand-metal">{t("permissions.deniedBody")}</p>
    </div>
  );
}
