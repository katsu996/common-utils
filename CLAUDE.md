# @katsu996/common-utils - 開発者向けドキュメント

このドキュメントは開発者向け情報を記載しています。

## CLIコマンド

### katsu-config

インタラクティブな設定ファイル管理ツール

**実行方法:**

- インストール済み: `pnpm katsu-config`
- 未インストール: `pnpm dlx @katsu996/common-utils katsu-config`
- クロスプラットフォーム: `npx @katsu996/common-utils katsu-config`

**機能:**

- package.json存在判定による自動モード分岐
- 新規プロジェクト: プロジェクト名入力 + 設定ファイル選択
- 既存プロジェクト: 現在状況表示 + 設定ファイル更新選択
- デフォルトですべての設定ファイルが選択状態
- @clack/prompts使用のモダンUI

**対応設定ファイル:**

- TypeScript設定 (tsconfig.json)
- Biome設定 (biome.json)
- Mise設定 (mise.toml)
- Vite設定 (vite.config.ts)
- Vitest設定 (vitest.config.ts)

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

第4原則： AIはいかなる場合もファイルの修正を行った場合は、ドキュメントの更新(CLAUDE.md含む)が必要であればドキュメントの修正も合わせて行う。

第5原則： AIはいかなる場合もファイルの修正を行った場合は、E2Eテストケースが必要かどうか確認をし、必要であればテストケースの修正も合わせて行う。

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
