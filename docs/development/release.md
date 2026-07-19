# リリースプロセス

## CI パイプラインによるリリース（推奨）

### 前提条件

1. **Trusted Publisher (OIDC)** が設定されていること
2. GitHub Actions のワークフローが正しく動作すること

### リリース手順

1. **リリースブランチを作成**

```bash
git checkout -b release/v1.x.x
# バージョン更新
# package.json の version フィールドを更新
git add package.json
git commit -m "chore: bump version to 1.x.x"
git push origin release/v1.x.x
```

2. **PR を作成して main にマージ**

3. **GitHub Actions の Publish ワークフローを手動トリガー**

   GitHub リポジトリの Actions タブ → Publish → **Run workflow**

   | パラメーター   | 説明                                 |
   | -------------- | ------------------------------------ |
   | `version_bump` | `patch` / `minor` / `major` から選択 |

4. **自動処理**

   - CI チェック（テスト、リント、ビルド）
   - Git タグの作成とプッシュ
   - npm へのパブリッシュ（OIDC 認証）
   - GitHub Release の作成

## 手動リリース（緊急時）

OIDC が利用できない場合の代替手段:

```bash
# 1. パッケージをビルド
pnpm build

# 2. npm にログイン
npm login

# 3. 公開（dry-run で事前確認）
npm publish --dry-run

# 4. 公開
npm publish

# 5. Git タグを作成
git tag v1.x.x
git push origin v1.x.x

# 6. GitHub Release を作成
gh release create v1.x.x --title "v1.x.x" --notes "リリースノート"
```

## リリース後の確認

```bash
# インストール確認
pnpm dlx @katsu996/common-utils --version

# パッケージ確認
npm view @katsu996/common-utils versions
```

## ロールバック手順

```bash
# 該当バージョンを unpublish
# ※ unpublish は発行後 72 時間以内のみ可能
npm unpublish @katsu996/common-utils@1.x.x

# または deprecated マーク
npm deprecate @katsu996/common-utils@1.x.x "重大な問題のため使用しないでください"
```

## GitHub Secrets 設定

OIDC を使用しない場合、以下の Secrets が必要です:

| Secret      | 説明                                        |
| ----------- | ------------------------------------------- |
| `NPM_TOKEN` | npm automation token（`automation` タイプ） |

## リリースフロー図

```
main ブランチにマージ
        ↓
  Publish ワークフロー手動実行
  （patch / minor / major 選択）
        ↓
  ┌─ ci job ─────────────────┐
  │  type-check / lint       │
  │  test / build            │
  └──────────────────────────┘
        ↓
  ┌─ create-tag job ────────┐
  │  git tag v1.x.x         │
  │  git push --tags        │
  └──────────────────────────┘
        ↓
  ┌─ publish job ───────────┐
  │  npm publish (OIDC)     │
  └──────────────────────────┘
        ↓
  ┌─ create-release job ────┐
  │  GitHub Release 作成    │
  └──────────────────────────┘
```
