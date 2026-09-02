# コントリビューションガイド

## 開発環境のセットアップ

```bash
git clone https://github.com/katsu996/common-utils.git
cd common-utils
pnpm install
```

## 開発ワークフロー

### 1. 機能追加/修正

```bash
# コードを書く
# 変更は src/ または bin/ 配下
```

### 2. 品質チェック

```bash
pnpm type-check    # TypeScript 型チェック
pnpm check         # 総合チェック（型チェック + リント）
pnpm test          # テスト実行
pnpm test:coverage # カバレッジ確認
pnpm build         # ビルド確認
```

### 3. コミット

コミットメッセージは以下のプレフィックスを使用してください:

| プレフィックス | 用途             |
| -------------- | ---------------- |
| `feat:`        | 新機能           |
| `fix:`         | バグ修正         |
| `chore:`       | メンテナンス作業 |
| `docs:`        | ドキュメント更新 |
| `refactor:`    | リファクタリング |
| `test:`        | テスト関連       |
| `ci:`          | CI 設定変更      |

## プロジェクト構造

```
common-utils/
├── src/                  # ソースコード（TypeScript）
│   ├── index.ts          # バレルエクスポート
│   └── math.ts           # 数学ユーティリティ
├── bin/                  # CLI ツール（CommonJS）
│   ├── config.js         # エントリポイント
│   ├── config.cmd        # Windows 用バッチファイル
│   └── cli/              # CLI モジュール
│       ├── commands/     # コマンドハンドラ (init / update / list)
│       ├── services/     # ビジネスロジック (project.js)
│       ├── ui/           # UI 表示 (theme / spinner / prompts / display)
│       ├── utils/        # 横断的ユーティリティ (errors / global-options)
│       ├── config-files-data.js  # 設定ファイル定義
│       ├── config-files.js       # 設定ファイル操作
│       └── package.js    # package.json 操作
├── tests/                # テストファイル
│   ├── math.test.ts      # 数学関数のテスト
│   └── config.test.js    # CLI ツールのテスト
├── *.base.*              # 共有設定ファイルテンプレート
└── 設定ファイル          # プロジェクト自身の設定
```

## コーディング規約

### TypeScript

- 厳格な TypeScript 設定に従う（`tsconfig.base.json`）
- 型定義は常に明示的に記述
- `any` 型の使用は最小限に

### Biome

- プロジェクトの `biome.jsonc` に従う
- コミット前に `pnpm check` を必ず実行

### テスト

- 新機能には対応するテストを追加
- CLI ツールの変更には `tests/config.test.js` にテスト追加
- ユーティリティ関数の変更には `tests/math.test.ts` にテスト追加

## プルリクエスト

PR を作成する際は、`.github/PULL_REQUEST_TEMPLATE.md` に従ってください。

### セマンティックバージョニング

- **パッチ** (`1.0.0 → 1.0.1`): バグ修正、後方互換性のある変更
- **マイナー** (`1.0.0 → 1.1.0`): 新機能、後方互換性のある変更
- **メジャー** (`1.0.0 → 2.0.0`): 後方互換性のない変更
