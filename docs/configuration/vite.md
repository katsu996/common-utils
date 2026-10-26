# Vite 設定

`@katsu996/common-utils/vite` として公開されている Vite ビルド設定です。

## 継承方法

```typescript
import { resolve } from "node:path";
import { defineConfig, mergeConfig } from "vite";
import baseConfig from "@katsu996/common-utils/vite";

export default mergeConfig(
  baseConfig,
  defineConfig({
    build: {
      lib: {
        entry: {
          index: resolve(__dirname, "src/index.ts"),
        },
        formats: ["cjs"],
      },
    },
  }),
);
```

## 設定概要

| オプション        | 値                               | 説明                       |
| ----------------- | -------------------------------- | -------------------------- |
| `build.target`    | `esnext`                         | 最新ターゲット向けにビルド |
| `build.minify`    | 本番時: `true` / 開発時: `false` | 環境に応じた minify        |
| `build.sourcemap` | 本番時: `false` / 開発時: `true` | 環境に応じたソースマップ   |

### エイリアス

```typescript
resolve: {
  alias: {
    "@": resolve(__dirname, "src"),
  },
}
```

`@/` で `src/` ディレクトリを参照できます。

## プロジェクト設定例

### ライブラリモード（CommonJS 出力）

```typescript
import { resolve } from "node:path";
import { defineConfig, mergeConfig } from "vite";
import baseConfig from "@katsu996/common-utils/vite";

export default mergeConfig(
  baseConfig,
  defineConfig({
    build: {
      lib: {
        entry: {
          index: resolve(__dirname, "src/index.ts"),
          math: resolve(__dirname, "src/math.ts"),
        },
        formats: ["cjs"],
      },
      rollupOptions: {
        external: [],
        output: {
          entryFileNames: "[name].js",
          chunkFileNames: "[name].js",
        },
      },
    },
  }),
);
```

### アプリケーションモード

```typescript
import { defineConfig, mergeConfig } from "vite";
import baseConfig from "@katsu996/common-utils/vite";

export default mergeConfig(
  baseConfig,
  defineConfig({
    build: {
      outDir: "build",
    },
  }),
);
```
