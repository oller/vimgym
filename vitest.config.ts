import { configDefaults, defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./tests/setup.ts"],
      exclude: [...configDefaults.exclude, "packages/**", "tests/e2e/**"],
    },
  }),
);
