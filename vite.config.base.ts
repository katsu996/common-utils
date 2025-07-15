import { resolve } from "node:path";
import { defineConfig } from "vite";

const isProduction = process.env.NODE_ENV === "production";

export default defineConfig({
  build: {
    target: "esnext",
    minify: isProduction,
    sourcemap: !isProduction,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});