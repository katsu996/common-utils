# Biome 設定

`@katsu996/common-utils/biome` として公開されている厳格な Biome 設定です。

## 継承方法

```jsonc
{
  "extends": ["@katsu996/common-utils/biome"],
  "files": {
    "includes": ["src/**/*"],
  },
}
```

## 設定概要

### フォーマッター

| 項目        | 値      |
| ----------- | ------- |
| indentStyle | `space` |
| lineWidth   | 119     |

### リンタールール

#### Suspicious（疑わしいコード）

| ルール            | レベル  | 説明                                       |
| ----------------- | ------- | ------------------------------------------ |
| `noExplicitAny`   | `error` | `any` 型の明示的使用を禁止                 |
| `noDebugger`      | `error` | `debugger` 文を禁止                        |
| `noArrayIndexKey` | `error` | 配列インデックスをキーに使用することを禁止 |
| `noSkippedTests`  | `error` | スキップされたテストを禁止                 |
| `noFocusedTests`  | `error` | フォーカスされたテストを禁止               |

#### Style（スタイル）

| ルール               | レベル  | 説明                                   |
| -------------------- | ------- | -------------------------------------- |
| `noNonNullAssertion` | `error` | 非 null アサーション `!` を禁止        |
| `useBlockStatements` | `error` | ブロック文の強制                       |
| `useConst`           | `error` | `const` の使用を強制                   |
| `useExportType`      | `error` | 型のエクスポートに `type` 修飾子を強制 |
| `useImportType`      | `error` | 型のインポートに `type` 修飾子を強制   |
| `useNumberNamespace` | `error` | `Number` 名前空間の使用を強制          |
| `useTemplate`        | `error` | テンプレートリテラルの使用を強制       |

#### Performance（パフォーマンス）

| ルール     | レベル  | 説明                        |
| ---------- | ------- | --------------------------- |
| `noDelete` | `error` | `delete` 演算子の使用を禁止 |

#### Correctness（正確性）

| ルール                  | レベル  | 説明                   |
| ----------------------- | ------- | ---------------------- |
| `noUnusedVariables`     | `error` | 未使用変数を禁止       |
| `noUnusedImports`       | `error` | 未使用インポートを禁止 |
| `noUndeclaredVariables` | `error` | 未宣言変数を禁止       |

#### Complexity（複雑性）

| ルール                           | レベル  | 説明                      |
| -------------------------------- | ------- | ------------------------- |
| `noExcessiveCognitiveComplexity` | `error` | 過度な認知複雑性を禁止    |
| `noForEach`                      | `error` | `forEach` の使用を禁止    |
| `noVoid`                         | `error` | `void` 演算子の使用を禁止 |

### VCS 統合

```jsonc
"vcs": {
  "enabled": true,
  "clientKind": "git",
  "root": "./",
  "useIgnoreFile": true
}
```

`.gitignore` のパターンが Biome の ignored files として自動適用されます。

## カスタマイズ例

```jsonc
{
  "extends": ["@katsu996/common-utils/biome"],
  "linter": {
    "rules": {
      "suspicious": {
        "noExplicitAny": "off",
      },
      "complexity": {
        "noForEach": "warn",
      },
    },
  },
  "formatter": {
    "lineWidth": 100,
  },
}
```
