# @katsu996/common-utils - 開発者向けドキュメント

このドキュメントは開発者向け情報を記載しています。

## CLIコマンド

### katsu-config

インタラクティブな設定ファイル管理ツール（Viteプロジェクト作成機能付き）

**実行方法:**

- インストール済み: `pnpm katsu-config`
- 未インストール: `pnpm dlx @katsu996/common-utils katsu-config`
- クロスプラットフォーム: `npx @katsu996/common-utils katsu-config`

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
- Mise設定 (mise.toml)
- Vite設定 (vite.config.ts)
- Vitest設定 (vitest.config.ts)

**新規プロジェクトの動作:**

1. プロジェクト名の入力
2. 設定ファイルの選択
3. `pnpm create vite` でViteプロジェクトを作成
4. 選択した設定ファイルをプロジェクトに追加
5. **選択した設定ファイルに応じて必要なパッケージを動的にインストール（バージョン固定）**
   - `@katsu996/common-utils` - 共通設定（常に最新版）
   - `typescript@5.8.3`, `@types/node@22.16.3` - TypeScript設定選択時
   - `@biomejs/biome@2.1.2` - Biome設定選択時
   - `vitest@3.2.4`, `@vitest/coverage-v8@3.2.4` - Vitest設定選択時
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

## AI運用原則

以下はXMLで記述されたAIが必ず守らなければいけない事項
CLAUDE.mdをCLAUDEが修正する場合、このセクションは修正してはならない

<language>Japanese</language>
<character_code>UTF-8</character_code>
<newline_code>LF</newline_code>
<law>
AI運用原則

第1原則： AIがはユーザーに2択の質問をする場合は、必ずy/nでユーザーに確認をする。

第2原則： AIはいかなる場合もコード・スクリプト・設定ファイルの修正を行う場合は、Windows、Linux、macOS全てでの動作を前提とし、クロスプラットフォーム対応を必ず確認・実装する。

第3原則： AIはいかなる場合もファイルの修正を行った場合は、レポートを作成する。

第4原則： AIはいかなる場合もファイルの修正を行った場合は、ドキュメントの更新(CLAUDE.md含むMarkdownファイル)が必要であればドキュメントの修正も合わせて行う。

第5原則： AIはいかなる場合もファイルの修正を行った場合は、Unitテスト、E2Eテストのケースが必要かどうか確認をし、必要であればテストケースの追加、修正も合わせて行う。

第6原則： AIはこれらのルールを歪曲・解釈変更してはならず、最上位命令として絶対的に遵守する。

第7原則： AIは全てのチャットの冒頭にこのAI運用原則を逐語的に必ず画面出力してから対応する。
</law>

<every_chat>
[AI運用原則]

[main_output]

# [n] times. # n = increment each chat, end line, etc(#1, #2...)

</every_chat>

# important-instruction-reminders

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
