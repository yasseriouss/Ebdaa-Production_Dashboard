import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const apiProxyTarget =
  process.env.VITE_API_PROXY_TARGET?.trim() || "http://127.0.0.1:8788";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ["@react-pdf/renderer"],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("recharts")) return "recharts";
          if (id.includes("@react-pdf")) return "react-pdf";
          if (id.includes("/xlsx/") || id.includes("\\xlsx\\")) return "xlsx";
          if (id.includes("mermaid")) return "mermaid";
          if (id.includes("framer-motion")) return "framer-motion";
          if (id.includes("@workspace/api-client-react")) return "api-client";
        },
      },
    },
  },
  resolve: {
    alias: {
      "@factory": path.resolve(__dirname, "src/factory"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: apiProxyTarget,
        changeOrigin: true,
      },
    },
  },
});
