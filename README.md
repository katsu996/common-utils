# @katsu996/common-utils

TypeScriptプロジェクト向けの共通ユーティリティ関数と標準化された開発設定のコレクションです。このパッケージでは、再利用可能なユーティリティ関数と、プロジェクト間の一貫性を保つための標準化された開発設定を提供します。

## 機能

- **ユーティリティ関数**: 数学と文字列の汎用ユーティリティ
- **共有設定**: 標準化されたBiome（リント/フォーマット）とTypeScript設定
- **CLIツール**: 新規プロジェクトでの設定の簡単セットアップ
- **型安全性**: 厳格な型チェックによる完全なTypeScriptサポート
- **最新の標準**: 最新ツール（Biome 2.1.1, TypeScript 5.0+）で構築
- **pnpm最適化**: pnpmでの高速・効率的な開発体験

## インストール

```bash
# pnpm を使用（推奨）
pnpm add @katsu996/common-utils
```

> **Note**: このパッケージはpnpmでの使用を強く推奨します。依存関係の管理、ビルドスクリプト、CLIツールすべてがpnpmに最適化されています。

## クイックスタート

### プロジェクト設定の初期化

CLIツールを使用してプロジェクトに標準化された設定を素早くセットアップ：

```bash
# pnpm dlx を使用（推奨）
pnpm dlx katsu-init-config
```

これにより以下が作成されます：

- `biome.json` - リントとフォーマット設定
- `tsconfig.json` - TypeScript設定

### ユーティリティ関数の使用

```typescript
// 全てのユーティリティをインポート
import { add, sub } from "@katsu996/common-utils";

// 特定のモジュールをインポート
import { add, sub } from "@katsu996/common-utils/math";

// 数学ユーティリティ
const sum = add(5, 3); // 8
const difference = sub(10, 4); // 6

// 型定義
const data: CommonData = {
  id: "123",
  name: "Example"
};
```

## API リファレンス

### 数学ユーティリティ（`@katsu996/common-utils/math`）

#### `add(a: number, b: number): number`

2つの数値を足し合わせます。

```typescript
add(5, 3); // 戻り値: 8
```

#### `sub(a: number, b: number): number`

第一引数から第二引数を引きます。

```typescript
sub(10, 4); // 戻り値: 6
```

### 型定義

#### `CommonData`

共通のデータ構造インターフェース。

```typescript
type CommonData = {
  id: string;
  name: string;
};
```

## 設定ファイル

### Biome設定

パッケージには厳格なBiome設定（`biome.base.json`）が含まれています：

- **厳格なリントルール**: コード品質のエラーレベル強制
- **セキュリティルール**: 一般的な脆弱性からの保護
- **パフォーマンスルール**: 最適化の推奨事項
- **フォーマット標準**: 一貫したコードスタイル

#### Biome設定の使用

```json
{
  "extends": ["@katsu996/common-utils/biome"]
}
```

または直接アクセス：

```bash
# biome.json で拡張
{
  "extends": ["@katsu996/common-utils/biome"]
}
```

### TypeScript設定

パッケージには厳格なTypeScript設定が含まれています：

- **厳格な型チェック**: 全ての厳格フラグが有効
- **未使用コード検出**: 未使用変数とパラメータの検出
- **厳密な型**: 厳格なオプショナルプロパティ型
- **安全性の向上**: チェックされていないインデックスアクセスなし
- **最新機能**: 最新のES2022ターゲットとESNextモジュール

#### TypeScript設定の使用

```json
{
  "extends": "@katsu996/common-utils/tsconfig.json",
  "compilerOptions": {
    // プロジェクト固有のオーバーライド
  }
}
```

## CLIツール

### `katsu-init-config`

プロジェクトに標準化された設定を初期化します。

```bash
# pnpm dlx を使用（推奨）
pnpm dlx katsu-init-config

# または npx を使用
npx katsu-init-config
```

**実行内容：**

- このパッケージの設定を拡張する`biome.json`を作成
- このパッケージの設定を拡張する`tsconfig.json`を作成
- 既存のファイルはスキップ（複数回実行しても安全）
- 作成またはスキップされた内容について明確なフィードバックを提供

**出力例：**

```
設定を初期化しています...
✅ biome.json が /path/to/your/project/biome.json に正常に作成されました。
✅ tsconfig.json が /path/to/your/project/tsconfig.json に正常に作成されました。
設定の初期化が完了しました。
```

## 開発

### pnpmスクリプト

このプロジェクトはpnpmに最適化されたスクリプト構成を使用：

```bash
# 開発モード
pnpm dev

# パッケージをビルド
pnpm build

# コードをリント
pnpm lint

# 自動修正付きリント
pnpm lint:fix

# コードをフォーマット
pnpm format

# 型チェック
pnpm type-check

# 品質チェック（型チェック + リント）
pnpm check

# 公開（自動品質チェック + ビルド）
pnpm publish
```

### pnpmの利点

- **高速インストール**: 効率的な依存関係管理
- **ディスク容量節約**: 共有ストレージによる最適化
- **厳密な依存関係**: phantom dependencyの回避
- **モノレポサポート**: ワークスペース機能

### プロジェクト構造

```
@katsu996/common-utils/
├── src/
│   ├── index.ts          # メインエクスポートファイル
│   ├── math.ts           # 数学ユーティリティ
├── bin/
│   └── init-config.js    # CLIツール
├── dist/                 # ビルドファイル（自動生成）
├── biome.base.json       # 共有用の厳格なBiome設定
├── biome.json           # 開発用Biome設定
├── tsconfig.json        # 厳格なTypeScript設定
├── vite.config.ts       # ビルド設定
└── package.json
```

## パッケージエクスポート

パッケージは複数のエクスポートポイントを提供：

```json
{
  ".": "./dist/index.js",           // メインエクスポート
  "./math": "./dist/math.js",       // 数学ユーティリティのみ
  "./biome": "./biome.base.json",   // Biome設定
  "./tsconfig": "./tsconfig.json",  // TypeScript設定
  "./package.json": "./package.json"
}
```

## 要件

- **Node.js**: >=22.0.0
- **pnpm**: >=10.0.0
- **TypeScript**: >=5.0.0

## 設定の厳格性

### TypeScript設定

- 最高レベルの型安全性
- 未使用コードの完全検出
- Null安全性の強制
- インデックスアクセスの安全性チェック

### Biome設定

- エラーレベルでの厳格なリント
- アクセシビリティルールの強制
- セキュリティルールの適用
- パフォーマンス最適化の推奨

## コントリビューション

このプロジェクトの開発にはpnpmを使用してください：

1. リポジトリをクローン
2. pnpmで依存関係をインストール：`pnpm install`
3. 変更を加える
4. 品質チェックを実行：`pnpm check && pnpm build`
5. プルリクエストを送信

### 開発のベストプラクティス

- pnpmのワークスペース機能を活用
- `pnpm dlx` でCLIツールをテスト
- `pnpm link` でローカル開発時の連携テスト

## ライセンス

MIT License。詳細は[LICENSE](./LICENSE)を参照してください。
