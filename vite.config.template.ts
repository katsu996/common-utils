import baseConfig from "@katsu996/common-utils/vite";
import { defineConfig, mergeConfig } from "vite";

export default mergeConfig(baseConfig, defineConfig({
  // プロジェクト固有の設定をここに追加
}));