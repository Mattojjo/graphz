import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setupVitest.ts",
    // You can add reporters, coverage, etc.
    reporters: ["default"],
    // If you need to transform React JSX
    esbuild: {
      loader: "tsx",
    },
  },
});
