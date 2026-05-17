import { Redirect, Route } from "wouter";

/** Canonical apps/web paths for bookmarks from legacy factory-app URLs. */
export function LegacyFactoryRedirects() {
  return (
    <>
      <Route path="/metal/orders">
        <Redirect to="/orders/metal" />
      </Route>
      <Route path="/metal/orders/:id">
        {(params) => <Redirect to={`/orders/metal/${params.id}`} />}
      </Route>
      <Route path="/wooden/orders">
        <Redirect to="/orders/wood" />
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
