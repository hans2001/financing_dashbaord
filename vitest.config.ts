import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    alias: {
      "@": resolve(__dirname),
    },
    coverage: {
      reporter: ["text", "lcov"],
      include: ["app/**/*.ts", "lib/**/*.ts"],
    },
  },
});
