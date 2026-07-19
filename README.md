# @katsu996/common-utils

TypeScriptプロジェクト向けの共通ユーティリティ関数と厳格な開発設定のコレクションです。

> **注意**: このパッケージは個人用として作成されており、個人の開発スタイルや設定に最適化されています。

## インストール

```bash
pnpm add @katsu996/common-utils
```

## 使用方法

### プロジェクト設定の初期化・更新

**パッケージがインストール済みの場合：**

```bash
pnpm katsu-config
```

**パッケージが未インストールの場合：**

```bash
pnpm dlx katsu-config
```

**新規プロジェクト（package.json未検出）の場合：**

1. **プロジェクト名の入力**
   - プロジェクト名は英数字、ハイフン、アンダースコアのみ使用可能
   - 必須入力項目として検証

2. **設定ファイル選択**
   - デフォルトで全ての設定ファイルが選択状態
   - 複数選択可能（Space キーで選択/解除）

3. **設定完了後の推奨コマンド**

   ```bash
   pnpm install
   pnpm dev
   ```

**既存プロジェクト（package.json検出）の場合：**

- 現在の設定ファイル状況を表示
- 更新・追加する設定ファイルを選択

作成される設定ファイル：

- `biome.jsonc` - 厳格なリント・フォーマット設定
- `tsconfig.json` - 厳格なTypeScript設定
- `mise.toml` - Node.jsとpnpmのバージョン管理設定
- `vite.config.ts` - Viteビルド設定（ベース継承）
- `vitest.config.ts` - Vitestテスト設定（ベース継承）

### ユーティリティ関数

#### 基本的な使用例

```typescript
import { add, sub } from "@katsu996/common-utils";

// 数値の加算
const sum = add(5, 3); // 8
const negativeSum = add(-2, -3); // -5
const decimalSum = add(1.5, 2.3); // 3.8

// 数値の減算
const diff = sub(10, 4); // 6
const negativeDiff = sub(-5, -3); // -2
const decimalDiff = sub(3.8, 1.5); // 2.3
```

#### 型定義の使用例

```typescript
import { CommonData } from "@katsu996/common-utils";

const user: CommonData = {
  id: "123",
  name: "John Doe",
};
```

#### 数学関数のみをインポート

```typescript
import { add, sub } from "@katsu996/common-utils/math";

const result = add(10, 20); // 30
```

## 設定ファイル

### Biome設定(biome.jsonc)

```jsonc
{
  "extends": ["@katsu996/common-utils/biome"],
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
node = "22.23.1"
pnpm = "10.34.5"
```

### Vite設定(vite.config.ts)

```typescript
import baseConfig from "@katsu996/common-utils/vite";
import { defineConfig, mergeConfig } from "vite";

export default mergeConfig(
  baseConfig,
  defineConfig({
    // プロジェクト固有の設定をここに追加
  }),
);
```

### Vitest設定(vitest.config.ts)

```typescript
import baseConfig from "@katsu996/common-utils/vitest";
import { defineConfig, mergeConfig } from "vitest/config";

export default mergeConfig(
  baseConfig,
  defineConfig({
    // プロジェクト固有の設定をここに追加
  }),
);
```

## エクスポート

このパッケージは以下のパスでアクセス可能です：

| パス                              | 説明                     |
| --------------------------------- | ------------------------ |
| `@katsu996/common-utils`          | メインユーティリティ関数 |
| `@katsu996/common-utils/math`     | 数学関数                 |
| `@katsu996/common-utils/biome`    | Biome設定ファイル        |
| `@katsu996/common-utils/tsconfig` | TypeScript設定ファイル   |
| `@katsu996/common-utils/vite`     | Viteベース設定           |
| `@katsu996/common-utils/vitest`   | Vitestベース設定         |

## よくある質問（FAQ）

### Q: katsu-configコマンドが実行できない

**A:** 以下の方法を試してください：

1. パッケージがインストールされている場合：

   ```bash
   pnpm katsu-config
   ```

2. パッケージがインストールされていない場合：

   ```bash
   pnpm dlx katsu-config
   ```

3. Windows環境の場合、PowerShellまたはコマンドプロンプトを使用してください。

### Q: 設定ファイルを個別に更新したい

**A:** `katsu-config`コマンドを実行すると、既存プロジェクトでは現在の設定ファイル状況が表示され、更新・追加するファイルを選択できます。

### Q: 既存の設定ファイルは上書きされますか？

**A:** はい、選択した設定ファイルは上書きされます。カスタマイズした設定がある場合は、事前にバックアップを取ることを推奨します。

### Q: どのバージョンのNode.jsが必要ですか？

**A:** Node.js >= 22.23.1 が必要です。Mise設定ファイルでバージョンが指定されています。

## トラブルシューティング

### 依存関係のインストールエラー

```bash
# キャッシュをクリアして再インストール
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### TypeScript型エラー

```bash
# distディレクトリを削除して再ビルド
rm -rf dist
pnpm build
pnpm type-check
```

### Biomeリントエラー

```bash
# 自動修正を試行
pnpm lint:fix
pnpm format
```

### katsu-configが設定ファイルを作成しない

1. 実行時のディレクトリに書き込み権限があるか確認
2. package.jsonが正しく検出されているか確認
3. エラーメッセージを確認し、手動でインストールコマンドを実行

### Viteプロジェクトの作成に失敗する

1. pnpmが正しくインストールされているか確認：`pnpm --version`
2. ネットワーク接続を確認
3. 手動でプロジェクトを作成：`pnpm create vite`

## ベストプラクティス

### 設定ファイルの管理

- プロジェクト固有の設定が必要な場合、ベース設定を継承した後、必要な部分のみ上書きしてください
- チーム全体で同じ設定を使用する場合、このパッケージの設定を推奨します

### ユーティリティ関数の使用

- 基本的な数学演算は`add`と`sub`関数を使用してください
- より複雑な計算が必要な場合は、プロジェクト固有の関数として実装してください
- 型安全性を保つため、TypeScriptの型チェックを有効にしてください

### 開発ワークフロー

1. **新規プロジェクト開始時**：

   ```bash
   pnpm katsu-config  # 設定ファイルの初期化
   pnpm install       # 依存関係のインストール
   ```

2. **コード品質チェック**：

   ```bash
   pnpm check         # 型チェック + リント
   pnpm test          # テスト実行
   ```

3. **コミット前**：
   ```bash
   pnpm format        # コードフォーマット
   pnpm check         # 品質チェック
   ```

### セキュリティ

- 定期的に依存関係の脆弱性をチェック：`pnpm audit`
- 依存関係を最新の状態に保つ
- セキュリティアップデートがある場合は速やかに適用

## 開発者向け情報

開発に関する詳細は [DEVELOPMENT.md](./DEVELOPMENT.md) を参照してください。

## ライセンス

MIT License
