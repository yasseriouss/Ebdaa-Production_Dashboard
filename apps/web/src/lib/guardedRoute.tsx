import type { ComponentType } from "react";
import { RequirePermission } from "../components/routing/RequirePermission";

export function guardedRoute<P extends object>(path: string, Component: ComponentType<P>) {
  return function GuardedRoute(props: P) {
    return (
      <RequirePermission path={path}>
        <Component {...props} />
      </RequirePermission>
    );
  };
}
