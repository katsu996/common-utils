import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '@katsu996/common-utils/vitest';

export default mergeConfig(baseConfig, defineConfig({
  // プロジェクト固有の設定をここに追加
}));