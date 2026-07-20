# @katsu996/common-utils - 開発者向けドキュメント

このドキュメントは開発者向け情報を記載しています。

## 開発環境セットアップ

### 初期セットアップ

```bash
# リポジトリをクローン
git clone <repository-url>
cd common-utils

# 依存関係をインストール
pnpm install

# 開発用ビルド
pnpm build
```

## 開発フロー

### 利用可能なスクリプト

```bash
# 開発モード（ファイル監視）
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

### 開発ワークフロー

1. **機能追加・修正**

   ```bash
   # 新しいブランチを作成
   git checkout -b feature/new-feature

   # 開発モードで作業
   pnpm dev
   ```

2. **コード品質チェック**

   ```bash
   # 品質チェックを実行
   pnpm check

   # 自動修正可能な問題を修正
   pnpm lint:fix
   pnpm format
   ```

3. **ビルドテスト**

   ```bash
   # プロダクションビルド
   pnpm build
   ```

4. **コミット・プッシュ**

   ```bash
   git add .
   git commit -m "feat: 新機能の説明"
   git push origin feature/new-feature
   ```

## プロジェクト構造

```
@katsu996/common-utils/
├── bin/                   # CLIツール
│   ├── config.js          # katsu-config エントリーポイント (Commander.js)
│   ├── config.cmd         # katsu-config CLIスクリプト (Windows)
│   └── cli/               # CLIモジュール
│       ├── commands/      # コマンドハンドラ
│       │   ├── init.js    # katsu-config init
│       │   ├── update.js  # katsu-config update
│       │   └── list.js    # katsu-config list
│       ├── services/      # ビジネスロジック
│       │   └── project.js # Vite作成・依存インストール
│       ├── ui/            # UI表現レイヤー
│       │   ├── theme.js   # picocolors カラーテーマ（一元管理）
│       │   ├── spinner.js # Ora ローディングスピナーラッパー
│       │   ├── prompts.js # @clack/prompts 対話ラッパー
│       │   └── display.js # 表示ヘルパー
│       ├── utils/         # 横断的ユーティリティ
│       │   ├── errors.js  # エラーハンドリング統合
│       │   └── global-options.js # グローバルオプション状態
│       ├── config-files.js       # 設定ファイル操作
│       ├── config-files-data.js  # 設定ファイル定義データ
│       └── package.js            # package.json操作
├── dist/                  # ビルドファイル（自動生成）
├── src/                   # ソースコード
│   ├── index.ts           # メインエクスポートファイル
│   └── math.ts            # 数学ユーティリティ
├── tests/                 # テストファイル
│   ├── config.test.js     # CLI設定テスト
│   └── math.test.ts       # 数学ユーティリティテスト
├── biome.base.jsonc       # 共有用Biome設定
├── biome.jsonc            # プロジェクト用Biome設定
├── CLAUDE.md              # AI開発者向け指示
├── DEVELOPMENT.md         # このファイル
├── mise.toml              # Mise設定テンプレート
├── package.json           # パッケージ設定
├── README.md              # ユーザー向けドキュメント
├── RELEASE.md             # リリースノート
├── tsconfig.base.json     # 共有用TypeScript設定
├── tsconfig.json          # プロジェクト用TypeScript設定
├── vite.config.base.ts    # 共有用Vite設定
├── vite.config.ts         # プロジェクト用Vite設定
├── vitest.config.base.ts  # 共有用Vitest設定
└── vitest.config.ts       # プロジェクト用Vitest設定
```

## CLIツール

### katsu-config

インタラクティブな設定ファイル管理ツール（Vite プロジェクト作成機能付き）

#### 技術スタック

| レイヤー         | ライブラリ            | 用途                       |
| ---------------- | --------------------- | -------------------------- |
| 引数解析         | Commander.js          | コマンド・オプション解析   |
| 対話UI          | @clack/prompts        | プロンプト・入力検証       |
| ローディング     | Ora                   | 進捗スピナー表示           |
| 色付け           | picocolors            | カラーテーマ（一元管理）   |

#### アーキテクチャ

```
config.js (Commander エントリーポイント)
  → コマンドディスパッチ (init | update | list)
    → commands/*.js   (オーケストレーション)
      → services/*.js (ビジネスロジック)
      → ui/*.js       (プロンプト・表示・スピナー)
```

#### 実行方法

```bash
# インストール済みプロジェクト内
pnpm katsu-config

# 未インストール環境
pnpm dlx @katsu996/common-utils katsu-config
```

#### 機能

- **自動モード分岐**: package.json存在判定で新規/既存プロジェクトを自動判別
- **明示的コマンド**: `katsu-config init` / `update` / `list` サブコマンド対応
- **新規プロジェクト**: プロジェクト名入力 + 設定ファイル選択
- **既存プロジェクト**: 現在状況表示 + 設定ファイル更新選択
- **デフォルト全選択**: 全設定ファイルがデフォルトで選択状態
- **ローディングスピナー**: OraによるVite作成・依存インストールの進捗表示
- **モダンUI**: @clack/prompts使用のインタラクティブUI
- **カラーテーマ**: picocolorsによる統一テーマ

## コーディング規約

### TypeScript設定

プロジェクトは厳格なTypeScript設定を使用：

- **strict**: true
- **noUncheckedIndexedAccess**: true
- **noUnusedLocals**: true
- **noUnusedParameters**: true
- **exactOptionalPropertyTypes**: true

### Biome設定

厳格なリント・フォーマット設定：

- エラーレベルでの厳格なリント
- セキュリティルールの適用
- パフォーマンス最適化の推奨
- アクセシビリティルールの強制

### コミットメッセージ規約

[Conventional Commits](https://www.conventionalcommits.org/)に従う：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Type:**

- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント変更
- `style`: コードスタイル変更
- `refactor`: リファクタリング
- `rename`: ファイル名変更
- `move`: ファイル移動
- `perf`: パフォーマンス改善
- `test`: テスト追加・修正
- `chore`: その他の変更

## リリースプロセス

### バージョニング

[Semantic Versioning](https://semver.org/)に従う：

- **MAJOR**: 破壊的変更
- **MINOR**: 後方互換性のある機能追加
- **PATCH**: 後方互換性のあるバグ修正

### リリース手順

1. **変更の確認**

   ```bash
   # 品質チェック
   pnpm check

   # ビルドテスト
   pnpm build
   ```

2. **バージョン更新**

   ```bash
   # package.jsonのバージョンを更新
   npm version [patch|minor|major]
   ```

3. **リリース**

   ```bash
   # NPMに公開
   pnpm publish
   ```

## テスト

### テスト戦略

- **単体テスト**: 各ユーティリティ関数
- **統合テスト**: CLIツール
- **型テスト**: TypeScript型の正確性

### テスト実行

```bash
# 全テスト実行
pnpm test

# テスト監視モード
pnpm test:watch

# カバレッジレポート
pnpm test:coverage
```

## トラブルシューティング

### よくある問題

1. **pnpmインストールエラー**

   ```bash
   # キャッシュクリア
   pnpm store prune

   # node_modules削除して再インストール
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

2. **katsu-configが実行できない**

   ```bash
   # package.jsonなしの場合
   pnpm dlx @katsu996/common-utils katsu-config

   # Windows環境の場合、PowerShellまたはコマンドプロンプトを使用
   ```

3. **型エラー**

   ```bash
   # TypeScriptキャッシュクリア
   rm -rf dist
   pnpm type-check
   ```

4. **リントエラー**

   ```bash
   # 自動修正を試行
   pnpm lint:fix
   pnpm format
   ```

## コントリビューション

### プルリクエストガイドライン

1. **事前チェック**
   - [ ] `pnpm check` が成功する
   - [ ] `pnpm build` が成功する
   - [ ] 適切なコミットメッセージ
   - [ ] 必要に応じてドキュメント更新

2. **レビューポイント**
   - コードの可読性
   - 型安全性
   - パフォーマンス
   - セキュリティ

### 開発のベストプラクティス

- **小さなコミット**: 論理的な単位でコミット
- **明確な命名**: 関数・変数の意図を明確に
- **型注釈**: 必要に応じて明示的な型指定
- **ドキュメント**: 公開APIには適切なドキュメント

## ライセンス

MIT License。詳細は[LICENSE](./LICENSE)を参照してください。
