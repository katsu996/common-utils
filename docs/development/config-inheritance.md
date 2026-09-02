# 設定ファイルの継承方法

本パッケージが提供する各設定ファイルの継承方法をまとめます。

## TypeScript 設定

```json
{
  "extends": "@katsu996/common-utils/tsconfig",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

## Biome 設定

```jsonc
{
  "extends": ["@katsu996/common-utils/biome"],
  "files": {
    "includes": ["src/**/*"],
  },
}
```

## Vite 設定

```typescript
import { defineConfig, mergeConfig } from "vite";
import baseConfig from "@katsu996/common-utils/vite";

export default mergeConfig(
  baseConfig,
  defineConfig({
    build: {
      lib: {
        entry: { index: "src/index.ts" },
        formats: ["cjs"],
      },
    },
  }),
);
```

## Vitest 設定

```typescript
import { defineConfig, mergeConfig } from "vitest/config";
import baseConfig from "@katsu996/common-utils/vitest";

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ["tests/**/*.{test,spec}.{js,ts}"],
    },
  }),
);
```

## エクスポートパス一覧

| パス                              | 設定ファイル            | 継承方法          | 備考                                                                                                       |
| --------------------------------- | ----------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------- |
| `@katsu996/common-utils/tsconfig` | `tsconfig.base.json`    | `extends`         |                                                                                                            |
| `@katsu996/common-utils/biome`    | `biome.base.jsonc`      | `extends`（配列） | `minimumReleaseAgeExclude` による即時反映を `pnpm-workspace.yaml` で担保（Biome 2.5.10 + 8 platform CLIs） |
| `@katsu996/common-utils/vite`     | `vite.config.base.ts`   | `mergeConfig`     |                                                                                                            |
| `@katsu996/common-utils/vitest`   | `vitest.config.base.ts` | `mergeConfig`     |                                                                                                            |
| `@katsu996/common-utils/mise`     | `mise.toml`             | 手動コピー        | `mise` の継承機構なし — プロジェクト側で手動コピーが必須（配布の外部性）                                   |

## ワークスペース外部性（pnpm）

`pnpm-workspace.yaml` の `minimumReleaseAgeExclude` は `Biome` のプラットフォーム別CLI（`@biomejs/cli-*` 8種）をバージョン固定（`2.5.10`）で即時インストール可能にする pnpm ワークアラウンドです。`Shared Config Inheritance Flow` ハイパーエッジに含まれない孤立した外部性であり、`Mise Manual Copy` と双子関係にあります（`pnpm-workspace.yaml: minimumReleaseAgeExclude --rationale_for--> Biome Platform-Specific CLIs`）。
