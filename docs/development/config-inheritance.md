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

## Mise 設定

Mise は TOML の `extends` 機構を持たないため、内容を参考に直接記述します。

```toml
[tools]
node = "24.18.0"
pnpm = "10.34.5"
```

## エクスポートパス一覧

| パス                              | 設定ファイル            | 継承方法          |
| --------------------------------- | ----------------------- | ----------------- |
| `@katsu996/common-utils/tsconfig` | `tsconfig.base.json`    | `extends`         |
| `@katsu996/common-utils/biome`    | `biome.base.jsonc`      | `extends`（配列） |
| `@katsu996/common-utils/vite`     | `vite.config.base.ts`   | `mergeConfig`     |
| `@katsu996/common-utils/vitest`   | `vitest.config.base.ts` | `mergeConfig`     |
| `@katsu996/common-utils/mise`     | `mise.toml`             | 手動コピー        |
