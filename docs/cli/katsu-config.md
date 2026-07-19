# katsu-config — 設定ファイル管理ツール

インタラクティブな設定ファイル管理ツール（Vite プロジェクト作成機能付き）です。

## 実行方法

```bash
# インストール済み
pnpm katsu-config

# 未インストール
pnpm dlx @katsu996/common-utils katsu-config

# クロスプラットフォーム
npx @katsu996/common-utils katsu-config
```

## CLI オプション

| オプション | 説明 |
|-----------|------|
| `-v`, `--version` | バージョン情報を表示 |
| `-h`, `--help` | ヘルプを表示 |
| `-l`, `--list` | 利用可能な設定ファイル一覧を表示 |
| `-c`, `--config <ids...>` | 設定ファイル ID を直接指定（スキップ可能: `skip`） |
| `--skip-install` | 依存関係のインストールをスキップ |
| `-n`, `--dry-run` | ドライラン（変更を実際に行わない） |

### --config オプションの例

```bash
# 単一の設定ファイルを適用
katsu-config -c typescript

# 複数の設定ファイルを適用
katsu-config -c typescript biome vitest

# 全設定ファイルを適用
katsu-config -c all

# スキップ（メッセージのみ表示）
katsu-config -c skip
```

## 動作モード

### 新規プロジェクトモード

カレントディレクトリに `package.json` が存在しない場合に自動的に選択されます。

1. プロジェクト名の入力
2. 設定ファイルの選択（デフォルト: 全選択）
3. `pnpm create vite` で Vite プロジェクトを作成
4. 選択した設定ファイルをプロジェクトに追加
5. 選択した設定ファイルに応じてパッケージを自動インストール（バージョン固定）
6. npm スクリプトを自動追加
7. ES モジュール設定 (`"type": "module"`) を自動設定

### 既存プロジェクトモード

カレントディレクトリに `package.json` が存在する場合に自動的に選択されます。

1. 現在の設定ファイル状況を表示
2. 更新する設定ファイルを選択（デフォルト: 既存ファイルのみ選択）
3. 選択した設定ファイルを適用
4. 新規追加の設定ファイルがあれば依存関係をインストール
5. 対応する npm スクリプトを自動追加（重複回避）

## 対応設定ファイル

| ID | ファイル | 依存パッケージ | 自動追加スクリプト |
|----|---------|---------------|-------------------|
| `typescript` | `tsconfig.json` | `typescript`, `@types/node` | `type-check` |
| `biome` | `biome.jsonc` | `@biomejs/biome` | `lint`, `lint:fix`, `check`, `check:fix`, `format`, `format:check` |
| `mise` | `mise.toml` | なし | なし |
| `vite` | `vite.config.ts` | なし | なし |
| `vitest` | `vitest.config.ts` | `vitest`, `@vitest/coverage-v8` | `test`, `test:watch`, `test:coverage` |
| `gitignore` | `.gitignore` | なし | なし |

## 自動追加スクリプト

### TypeScript 設定選択時

```bash
pnpm type-check    # TypeScript 型チェック
```

### Biome 設定選択時

```bash
pnpm lint          # Biome による lint
pnpm lint:fix      # lint 問題を自動修正
pnpm check         # Biome による総合チェック
pnpm check:fix     # check 問題を自動修正
pnpm format        # コードフォーマット
pnpm format:check  # フォーマット確認
```

### Vitest 設定選択時

```bash
pnpm test           # テスト実行
pnpm test:watch     # テスト監視モード
pnpm test:coverage  # テストカバレッジ
```

## 技術仕様

- 新規プロジェクトは ES モジュール (`"type": "module"`) で作成
- スタンドアローンな Vite/Vitest 設定ファイルを生成（外部依存なし）
- バージョン固定インストール（本プロジェクトの package.json と同一バージョン）
- 既存スクリプトとの重複回避
- 本パッケージは CommonJS 形式で最大互換性を確保
- クロスプラットフォーム対応（Windows、Linux、macOS）
