import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["**/*.{test,spec}.{js,ts}"],
    exclude: ["node_modules", "dist", "build"],
    coverage: {
      provider: "v8",
      all: true,
      include: ["src/**/*.{js,ts}", "bin/**/*.{js,ts}"],
      exclude: ["node_modules/", "dist/", "build/", "**/*.d.ts", "**/*.config.*", "**/coverage/**"],
      reporter: ["text", "html", "lcov", "json-summary"],
      reportsDirectory: "coverage",
      reportOnFailure: true,
    },
  },
});
