# 移行ガイド

既存プロジェクトに `@katsu996/common-utils` の設定を適用する方法を説明します。

## CLI ツールを使う（推奨）

### 1. パッケージをインストール

```bash
pnpm add -D @katsu996/common-utils
```

### 2. katsu-config を実行

```bash
pnpm katsu-config
```

対話メニューが表示されるので、適用したい設定ファイルを選択します。

### 3. --config オプションを使う（非対話）

```bash
# すべての設定ファイルを適用
pnpm katsu-config -c all

# 特定の設定のみ適用
pnpm katsu-config -c typescript biome vitest
```

## 手動移行

CLI ツールを使わず、手動で設定を追加することもできます。

### TypeScript 設定

1. `tsconfig.json` を作成または編集:

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

2. 依存関係をインストール:

```bash
pnpm add -D typescript @types/node
```

3. スクリプトを `package.json` に追加:

```json
{
  "scripts": {
    "type-check": "tsc --noEmit"
  }
}
```

### Biome 設定

1. `biome.jsonc` を作成:

```jsonc
{
  "extends": ["@katsu996/common-utils/biome"],
  "files": {
    "includes": ["src/**/*"]
  }
}
```

2. 依存関係をインストール:

```bash
pnpm add -D @biomejs/biome
```

3. スクリプトを `package.json` に追加:

```json
{
  "scripts": {
    "lint": "biome lint .",
    "lint:fix": "biome lint --write .",
    "check": "biome check .",
    "check:fix": "biome check --write .",
    "format": "biome format --write .",
    "format:check": "biome format ."
  }
}
```

### Vite 設定

1. `vite.config.ts` を作成:

```typescript
import { defineConfig, mergeConfig } from "vite";
import baseConfig from "@katsu996/common-utils/vite";

export default mergeConfig(baseConfig, defineConfig({
  build: {
    outDir: "dist",
  },
}));
```

### Vitest 設定

1. `vitest.config.ts` を作成:

```typescript
import { defineConfig, mergeConfig } from "vitest/config";
import baseConfig from "@katsu996/common-utils/vitest";

export default mergeConfig(baseConfig, defineConfig({
  test: {
    include: ["tests/**/*.{test,spec}.{js,ts}"],
  },
}));
```

2. 依存関係をインストール:

```bash
pnpm add -D vitest @vitest/coverage-v8
```

3. スクリプトを `package.json` に追加:

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage"
  }
}
```

## CI/CD 移行

GitHub Actions を使用している場合、`.github/workflows/ci.yml` を参考に CI パイプラインを構築できます。

最低限必要なチェック:

```yaml
- run: pnpm install
- run: pnpm type-check    # TypeScript 型チェック
- run: pnpm check         # Biome チェック
- run: pnpm test          # テスト
- run: pnpm build         # ビルド
```
