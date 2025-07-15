import { defineConfig, mergeConfig } from 'vite';
import { resolve } from 'node:path';
import baseConfig from '@katsu996/common-utils/vite';

export default mergeConfig(baseConfig, defineConfig({
  // プロジェクト固有の設定をここに追加
}));