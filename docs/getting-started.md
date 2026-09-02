# インストールとセットアップ

## 必要条件

- **Node.js**: `>=24.19.0`
- **pnpm**: `>=11.21.0`

## インストール

```bash
pnpm add @katsu996/common-utils
```

## クイックスタート

### ユーティリティ関数の使用

```typescript
import { add, sum, clamp } from "@katsu996/common-utils";

console.log(add(1, 2)); // 3
console.log(sum([1, 2, 3])); // 6
console.log(clamp(10, 0, 5)); // 5
```

サブパスインポートも可能です:

```typescript
import { add } from "@katsu996/common-utils/math";
```

### 設定ファイルの継承

#### TypeScript 設定

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

#### Biome 設定

```jsonc
{
  "extends": ["@katsu996/common-utils/biome"],
  "files": {
    "includes": ["src/**/*"],
  },
}
```

#### Vite 設定

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

#### Vitest 設定

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

### CLI ツールの使用

```bash
# 既存プロジェクト（package.jsonが有るフォルダ）、インストール済み
pnpm katsu-config

# 未インストール
pnpm dlx @katsu996/common-utils katsu-config

# 新規プロジェクト作成（package.jsonが無いフォルダ）
# ※ pnpm katsu-config はpackage.jsonが無いフォルダではERR_PNPM_NO_IMPORTER_MANIFEST_FOUNDになり使用不可
cd <新規プロジェクトを作成する親フォルダ>
pnpm dlx @katsu996/common-utils katsu-config
```

詳細は [katsu-config ドキュメント](cli/katsu-config.md) を参照してください。

## エクスポートパス

| パス                                  | 内容                                 |
| ------------------------------------- | ------------------------------------ |
| `@katsu996/common-utils`              | メインエントリ（ユーティリティ関数） |
| `@katsu996/common-utils/math`         | 数学ユーティリティ                   |
| `@katsu996/common-utils/package.json` | package.json                         |
| `@katsu996/common-utils/biome`        | Biome ベース設定                     |
| `@katsu996/common-utils/mise`         | Mise 設定                            |
| `@katsu996/common-utils/tsconfig`     | TypeScript ベース設定                |
| `@katsu996/common-utils/vite`         | Vite ベース設定                      |
| `@katsu996/common-utils/vitest`       | Vitest ベース設定                    |
