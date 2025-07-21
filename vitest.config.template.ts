import baseConfig from "@katsu996/common-utils/vitest";
import { defineConfig, mergeConfig } from "vitest/config";

export default mergeConfig(baseConfig, defineConfig({
  // プロジェクト固有の設定をここに追加
}));