import path from "node:path";
import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      include: ["src/**/*.{test,spec}.{ts,tsx}"],
      coverage: {
        provider: "v8",
        include: ["src/lib/**", "src/i18n/**", "src/components/routing/**"],
      },
    },
    resolve: {
      alias: {
        "@factory": path.resolve(__dirname, "src/factory"),
      },
    },
  }),
);
