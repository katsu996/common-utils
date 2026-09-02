# katsu-config — 設定ファイル管理ツール

インタラクティブな設定ファイル管理ツール（Vite プロジェクト作成機能付き）です。

## 実行方法

package.json の有無によって実行方法が異なります。

```bash
# 新規プロジェクト作成（package.jsonが無いフォルダ）
# ※ pnpm katsu-config はpackage.jsonが無いフォルダではERR_PNPM_NO_IMPORTER_MANIFEST_FOUNDになり使用不可
pnpm dlx @katsu996/common-utils katsu-config   # 未インストール
npx @katsu996/common-utils katsu-config        # クロスプラットフォーム

# 既存プロジェクト更新（package.jsonが有るフォルダ）
pnpm katsu-config                               # ローカル/グローバルインストール済み
pnpm dlx @katsu996/common-utils katsu-config   # 未インストール
```

> **注意**: `pnpm dlx katsu-config` はパッケージ名 `katsu-config` が存在しないため `ERR_PNPM_DLX_NO_BIN` になります。必ず `@katsu996/common-utils` を指定してください。

## 使用方法

```bash
# 自動モード（package.json の有無で分岐）
katsu-config [options]

# 明示的なコマンド指定
katsu-config init [options]   # 新規プロジェクト
katsu-config update [options] # 既存プロジェクト更新
katsu-config list             # 利用可能な設定ファイル一覧
```

## CLI オプション

| オプション             | 説明                                 |
| ---------------------- | ------------------------------------ |
| `-V`, `--version`      | バージョン情報を表示                 |
| `-h`, `--help`         | ヘルプを表示                         |
| `-c`, `--config <ids>` | 設定ファイル ID をカンマ区切りで指定 |
| `--skip-install`       | 依存関係のインストールをスキップ     |
| `-n`, `--dry-run`      | ドライラン（変更を実際に行わない）   |

### --config オプションの例

```bash
# 単一の設定ファイルを適用
katsu-config -c typescript

# 複数の設定ファイルを適用（カンマ区切り）
katsu-config -c typescript,biome,vitest
```

## 動作モード

### 新規プロジェクトモード（init）

カレントディレクトリに `package.json` が存在しない場合に自動的に選択されます。

1. プロジェクト名の入力
2. 設定ファイルの選択（デフォルト: 全選択）
3. `pnpm create vite` で Vite プロジェクトを作成（進捗表示: Ora スピナー）
4. 選択した設定ファイルをプロジェクトに追加
5. 選択した設定ファイルに応じてパッケージを自動インストール（バージョン固定）
6. npm スクリプトを自動追加
7. ES モジュール設定 (`"type": "module"`) を自動設定

### 既存プロジェクトモード（update）

カレントディレクトリに `package.json` が存在する場合に自動的に選択されます。

1. 現在の設定ファイル状況を表示
2. 更新する設定ファイルを選択（デフォルト: 既存ファイルのみ選択）
3. 選択した設定ファイルを適用
4. 新規追加の設定ファイルがあれば依存関係をインストール
5. 対応する npm スクリプトを自動追加（重複回避）

## 対応設定ファイル

| ID           | ファイル           | 依存パッケージ                  | 自動追加スクリプト                                                 |
| ------------ | ------------------ | ------------------------------- | ------------------------------------------------------------------ |
| `typescript` | `tsconfig.json`    | `typescript`, `@types/node`     | `type-check`                                                       |
| `biome`      | `biome.jsonc`      | `@biomejs/biome`                | `lint`, `lint:fix`, `check`, `check:fix`, `format`, `format:check` |
| `oxc`        | `oxlint.json`      | `oxlint`, `oxfmt`               | `lint`, `lint:fix`, `format`, `format:check`                       |
| `mise`       | `mise.toml`        | なし                            | なし                                                               |
| `vite`       | `vite.config.ts`   | なし                            | なし                                                               |
| `vitest`     | `vitest.config.ts` | `vitest`, `@vitest/coverage-v8` | `test`, `test:watch`, `test:coverage`                              |
| `gitignore`  | `.gitignore`       | なし                            | なし                                                               |

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

### OXC 設定選択時

```bash
pnpm lint           # OXC による lint
pnpm lint:fix       # lint 問題を自動修正
pnpm format         # コードフォーマット
pnpm format:check   # フォーマット確認
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
