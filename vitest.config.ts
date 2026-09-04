import { defineConfig, mergeConfig } from "vitest/config";
import baseConfig from "./vitest.config.base";

const config = mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ["tests/**/*.{test,spec}.{js,ts}"],
    },
  }),
);

// mergeConfig は配列を連結するため、base の広い include を上書きする
config.test = {
  ...config.test,
  include: ["tests/**/*.{test,spec}.{js,ts}"],
};

export default config;
