import { Redirect, Route } from "wouter";
import { ORDERS_METAL_LIST_REDIRECT, ORDERS_WOOD_LIST_REDIRECT } from "../../lib/canonicalRoutes";

/** Canonical apps/web paths for bookmarks from legacy factory-app URLs. */
export function LegacyFactoryRedirects() {
  return (
    <>
      <Route path="/metal/orders">
        <Redirect to={ORDERS_METAL_LIST_REDIRECT} />
      </Route>
      <Route path="/metal/orders/:id">
        {(params) => <Redirect to={`/orders/metal/${params.id}`} />}
      </Route>
      <Route path="/wooden/orders">
        <Redirect to={ORDERS_WOOD_LIST_REDIRECT} />
      </Route>
      <Route path="/wooden/orders/:id">
        {(params) => <Redirect to={`/orders/wood/${params.id}`} />}
      </Route>
      <Route path="/projects">
        <Redirect to="/projects/hub" />
      </Route>
      <Route path="/dashboard/classic">
        <Redirect to="/" />
      </Route>
      <Route path="/dashboard/factory">
        <Redirect to="/#executive" />
      </Route>
    </>
  );
}
