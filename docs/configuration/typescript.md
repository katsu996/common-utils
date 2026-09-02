# TypeScript 設定

`@katsu996/common-utils/tsconfig` として公開されている厳格な TypeScript 設定です。

## 継承方法

```json
{
  "extends": "@katsu996/common-utils/tsconfig",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

## 設定概要

### 基本設定

| オプション         | 値        | 説明                             |
| ------------------ | --------- | -------------------------------- |
| `target`           | `ES2022`  | ターゲット JavaScript バージョン |
| `module`           | `ESNext`  | モジュールシステム               |
| `moduleResolution` | `bundler` | モジュール解決方法               |
| `strict`           | `true`    | 厳格モード                       |

### 厳格チェック

以下の strict ファミリオプションがすべて有効です:

| オプション                     | 説明                                   |
| ------------------------------ | -------------------------------------- |
| `strictNullChecks`             | null と undefined の厳格なチェック     |
| `strictFunctionTypes`          | 関数型の厳格なチェック                 |
| `strictBindCallApply`          | `bind`/`call`/`apply` の厳格なチェック |
| `strictPropertyInitialization` | プロパティ初期化の厳格なチェック       |
| `noImplicitAny`                | 暗黙の `any` を禁止                    |
| `noImplicitThis`               | 暗黙の `this` を禁止                   |
| `alwaysStrict`                 | 常に strict モード                     |

### 追加チェック

| オプション                           | 説明                                               |
| ------------------------------------ | -------------------------------------------------- |
| `noUnusedLocals`                     | 未使用のローカル変数を禁止                         |
| `noUnusedParameters`                 | 未使用のパラメーターを禁止                         |
| `exactOptionalPropertyTypes`         | オプショナルプロパティの型を厳密に解釈             |
| `noImplicitReturns`                  | 関数の戻り値を明示的に必須化                       |
| `noFallthroughCasesInSwitch`         | switch のフォールスルーを禁止                      |
| `noUncheckedIndexedAccess`           | インデックスアクセスの型を未定義可能に             |
| `noImplicitOverride`                 | `override` キーワードを必須化                      |
| `noPropertyAccessFromIndexSignature` | インデックスシグネチャへのプロパティアクセスを禁止 |

### 出力設定

| オプション       | 説明                                |
| ---------------- | ----------------------------------- |
| `declaration`    | `true` — 型定義ファイルを生成       |
| `declarationMap` | `true` — 型定義のソースマップを生成 |
| `sourceMap`      | `true` — ソースマップを生成         |
| `removeComments` | `true` — コメントを削除             |

### モジュール設定

| オプション                         | 説明                                               |
| ---------------------------------- | -------------------------------------------------- |
| `isolatedModules`                  | 各ファイルを独立したモジュールとしてトランスパイル |
| `verbatimModuleSyntax`             | インポート/エクスポートの型構文を維持              |
| `esModuleInterop`                  | CommonJS モジュールとの相互運用性を確保            |
| `resolveJsonModule`                | JSON モジュールのインポートを許可                  |
| `forceConsistentCasingInFileNames` | ファイル名の大文字小文字の一貫性を強制             |

## カスタマイズ例

```json
{
  "extends": "@katsu996/common-utils/tsconfig",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "noUnusedLocals": false
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```
