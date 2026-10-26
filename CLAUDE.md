# @katsu996/common-utils - 開発者向けドキュメント

このドキュメントは開発者向け情報を記載しています。

## CLIコマンド

### katsu-config

インタラクティブな設定ファイル管理ツール（Viteプロジェクト作成機能付き）

**実行方法:**

- 新規プロジェクト作成（package.jsonが無いフォルダ）: `pnpm dlx @katsu996/common-utils katsu-config` ※ `pnpm katsu-config` は package.jsonが無いフォルダでは ERR_PNPM_NO_IMPORTER_MANIFEST_FOUND になり使用不可（グローバルインストール済みなら `katsu-config` を直接実行）
- 既存プロジェクト更新（package.jsonが有るフォルダ）: `pnpm katsu-config`（ローカル/グローバルインストール済み）、未インストールなら `pnpm dlx @katsu996/common-utils katsu-config`
- クロスプラットフォーム: `npx @katsu996/common-utils katsu-config`（※ `pnpm dlx katsu-config` はパッケージ名が存在しないため実行不可）

**機能:**

- package.json存在判定による自動モード分岐
- 新規プロジェクト: Viteプロジェクト自動生成 + プロジェクト名入力 + 設定ファイル選択
- 既存プロジェクト: 現在状況表示 + 設定ファイル更新選択（既存ファイルのみデフォルト選択） + 新規設定ファイル追加時の自動依存関係インストールとスクリプト追加
- デフォルト選択: 新規プロジェクトは全選択、既存プロジェクトは既存ファイルのみ選択
- **選択した設定ファイルに応じた動的な依存関係インストール**
- **選択した設定ファイルに応じた動的なnpmスクリプト追加**
- @clack/prompts使用のモダンUI（視認性の高い操作ガイド表示）
- クロスプラットフォーム対応（Windows、Linux、macOS）

**対応設定ファイル:**

- TypeScript設定 (tsconfig.json)
- Biome設定 (biome.jsonc)
- OXC設定 (oxlint.json)
- Mise設定 (mise.toml)
- Vite設定 (vite.config.ts)
- Vitest設定 (vitest.config.ts)
- .gitignore設定 (.gitignore)

**新規プロジェクトの動作:**

1. プロジェクト名の入力
2. 設定ファイルの選択
3. `pnpm create vite` でViteプロジェクトを作成
4. 選択した設定ファイルをプロジェクトに追加
5. **選択した設定ファイルに応じて必要なパッケージを動的にインストール（バージョン固定）**
   - `@katsu996/common-utils` - 共通設定（常に最新版）
   - `typescript`, `@types/node` - TypeScript設定選択時
   - `@biomejs/biome` - Biome設定選択時
   - `vitest`, `@vitest/coverage-v8` - Vitest設定選択時
   - **本プロジェクトのpackage.jsonと同じバージョンで固定インストール**
6. **選択した設定ファイルに応じて動的にnpmスクリプトを追加とESモジュール設定（`"type": "module"`）**
7. 利用可能コマンド一覧の表示
8. 完了メッセージと開始コマンドの表示

**設定ファイル別の自動追加スクリプト:**

**TypeScript設定選択時:**

- `pnpm type-check` - TypeScript型チェック

**Biome設定選択時:**

- `pnpm lint` - Biomeによるlint
- `pnpm lint:fix` - lint問題を自動修正
- `pnpm check` - Biomeによる総合チェック
- `pnpm check:fix` - check問題を自動修正
- `pnpm format` - コードフォーマット
- `pnpm format:check` - フォーマット確認

**Vitest設定選択時:**

- `pnpm test` - テスト実行
- `pnpm test:watch` - テスト監視モード
- `pnpm test:coverage` - テストカバレッジ

**技術仕様:**

- 新規プロジェクトはESモジュール（`"type": "module"`）で作成
- **選択した設定ファイルに応じた動的な環境構築**
- スタンドアローンなVite/Vitest設定ファイルを生成（外部依存なし）
- **設定ファイル選択に基づく最適化されたdevDependenciesインストール**
- **バージョン固定インストール（本プロジェクトのpackage.jsonと同一バージョン）**
- **設定ファイル選択に基づく動的なnpmスクリプト生成**
- **既存プロジェクトでの新規設定ファイル追加時の自動処理**
  - 新規設定ファイルのみの依存関係インストール
  - 対応するnpmスクリプトの自動追加
  - 既存スクリプトとの重複回避
- 本パッケージはCommonJS形式で最大互換性を確保
- クロスプラットフォーム対応（Windows、Linux、macOS）
