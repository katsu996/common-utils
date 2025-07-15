# @katsu996/common-utils

TypeScriptプロジェクト向けの共通ユーティリティ関数と厳格な開発設定のコレクションです。

## インストール

```bash
pnpm add @katsu996/common-utils
```

## 使用方法

### プロジェクト設定の初期化

```bash
pnpm dlx katsu-init-config
```

これにより以下が作成されます：

- `biome.json` - 厳格なリント・フォーマット設定
- `tsconfig.json` - 厳格なTypeScript設定

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
  "extends": "@katsu996/common-utils/tsconfig.json"
}
```

## 開発者向け情報

開発に関する詳細は [DEVELOPMENT.md](./DEVELOPMENT.md) を参照してください。

## ライセンス

MIT License
