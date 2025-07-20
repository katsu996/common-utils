# @katsu996/common-utils

TypeScriptプロジェクト向けの共通ユーティリティ関数と厳格な開発設定のコレクションです。

> **注意**: このパッケージは個人用として作成されており、個人の開発スタイルや設定に最適化されています。

## インストール

```bash
pnpm add @katsu996/common-utils
```

## 使用方法

### プロジェクト設定の初期化・更新

```bash
pnpm dlx katsu-config
```

**新規プロジェクト（package.json未検出）の場合：**
- プロジェクト名の入力
- 適用する設定ファイルを選択（デフォルト：全選択）

**既存プロジェクト（package.json検出）の場合：**
- 現在の設定ファイル状況を表示
- 更新・追加する設定ファイルを選択（デフォルト：全選択）

作成される設定ファイル：

- `biome.json` - 厳格なリント・フォーマット設定
- `tsconfig.json` - 厳格なTypeScript設定
- `mise.toml` - Node.jsとpnpmのバージョン管理設定
- `vite.config.ts` - Viteビルド設定（ベース継承）
- `vitest.config.ts` - Vitestテスト設定（ベース継承）

### ユーティリティ関数

```typescript
import { add, sub } from "@katsu996/common-utils";

const sum = add(5, 3); // 8
const diff = sub(10, 4); // 6
```

## 設定ファイル

### Biome設定(biome.json)

```json
{
  "extends": ["@katsu996/common-utils/biome"]
}
```

### TypeScript設定(tsconfig.json)

```json
{
  "extends": "@katsu996/common-utils/tsconfig"
}
```

### Mise設定(mise.toml)

```toml
[tools]
node = "22.16.0"
pnpm = "10.12.4"
```

### Vite設定(vite.config.ts)

```typescript
import baseConfig from "@katsu996/common-utils/vite";
import { defineConfig, mergeConfig } from "vite";

export default mergeConfig(baseConfig, defineConfig({
  // プロジェクト固有の設定をここに追加
}));
```

### Vitest設定(vitest.config.ts)

```typescript
import baseConfig from "@katsu996/common-utils/vitest";
import { defineConfig, mergeConfig } from "vitest/config";

export default mergeConfig(baseConfig, defineConfig({
  // プロジェクト固有の設定をここに追加
}));
```

## エクスポート

このパッケージは以下のパスでアクセス可能です：

| パス | 説明 |
|------|------|
| `@katsu996/common-utils` | メインユーティリティ関数 |
| `@katsu996/common-utils/math` | 数学関数 |
| `@katsu996/common-utils/biome` | Biome設定ファイル |
| `@katsu996/common-utils/tsconfig` | TypeScript設定ファイル |
| `@katsu996/common-utils/vite` | Viteベース設定 |
| `@katsu996/common-utils/vitest` | Vitestベース設定 |

## 開発者向け情報

開発に関する詳細は [DEVELOPMENT.md](./DEVELOPMENT.md) を参照してください。

## ライセンス

MIT License
