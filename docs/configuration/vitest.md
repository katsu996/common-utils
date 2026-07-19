# Vitest 設定

`@katsu996/common-utils/vitest` として公開されている Vitest テスト設定です。

## 継承方法

```typescript
import { defineConfig, mergeConfig } from "vitest/config";
import baseConfig from "@katsu996/common-utils/vitest";

export default mergeConfig(baseConfig, defineConfig({
  test: {
    include: ["tests/**/*.{test,spec}.{js,ts}"],
  },
}));
```

## 設定概要

### テスト設定

| オプション | 値 | 説明 |
|-----------|-----|------|
| `globals` | `true` | グローバル API（`describe`, `it`, `expect` など）を有効化 |
| `environment` | `node` | Node.js 環境でテストを実行 |

### ファイルパターン

```typescript
include: ["**/*.{test,spec}.{js,ts}"]
exclude: ["node_modules", "dist", "build"]
```

### カバレッジ設定

| オプション | 値 | 説明 |
|-----------|-----|------|
| `provider` | `v8` | V8 カバレッジプロバイダーを使用 |
| `reporter` | `["text", "json", "html"]` | 3 種類のレポート形式 |

**カバレッジ除外パターン:**

- `node_modules/`
- `dist/`
- `build/`
- `**/*.d.ts`
- `**/*.config.*`
- `**/coverage/**`

## プロジェクト設定例

```typescript
import { defineConfig, mergeConfig } from "vitest/config";
import baseConfig from "@katsu996/common-utils/vitest";

export default mergeConfig(baseConfig, defineConfig({
  test: {
    include: ["src/**/*.{test,spec}.{js,ts}"],
    coverage: {
      reporter: ["text", "lcov"],
    },
  },
}));
```
