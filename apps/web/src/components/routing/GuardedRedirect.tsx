import { Redirect } from "wouter";
import { RequirePermission } from "./RequirePermission";

export function GuardedRedirect({ path, to }: { path: string; to: string }) {
  return (
    <RequirePermission path={path}>
      <Redirect to={to} />
    </RequirePermission>
  );
}
