import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import App from "./App.tsx";
import { DirectionProvider } from "./context/DirectionContext";
import { I18nProvider } from "./context/I18nContext";
import { PermissionProvider } from "./context/PermissionContext";
import { SidebarCollapseProvider } from "./context/SidebarCollapseContext";
import { setupGeneratedApiClient } from "./lib/api/setupGeneratedClient";

setupGeneratedApiClient();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      retry: 1,
    },
  },
});

if (typeof window !== "undefined") {
  window.addEventListener("fdh-offline-sync-complete", () => {
    void queryClient.invalidateQueries();
  });
}


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SidebarCollapseProvider>
        <DirectionProvider>
          <I18nProvider>
            <PermissionProvider>
              <App />
            </PermissionProvider>
          </I18nProvider>
        </DirectionProvider>
      </SidebarCollapseProvider>
    </QueryClientProvider>
  </StrictMode>,
);
