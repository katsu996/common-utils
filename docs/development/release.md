# リリースプロセス

## CI パイプラインによるリリース（推奨）

### 前提条件

1. **Trusted Publisher (OIDC)** が設定されていること
2. GitHub Actions のワークフローが正しく動作すること

### リリース手順

バージョン番号の更新は Publish ワークフローが自動的に行います（`create-tag` job 内の `pnpm version` により、main ブランチへバージョン更新コミットを作成し Git タグをプッシュします）。事前の手動バージョン更新は不要です。

1. **main ブランチへのマージを確認**

   リリース対象のコードが main ブランチにマージされていることを確認する（ワークフローは main ブランチをチェックアウトして実行されるため）

2. **GitHub Actions の Publish ワークフローを手動トリガー**

   GitHub リポジトリの Actions タブ → Publish to npm → **Run workflow**

   | パラメーター | 説明                                 |
   | ------------ | ------------------------------------ |
   | `version`    | `patch` / `minor` / `major` から選択 |

3. **自動処理**

   - CI チェック（テスト、リント、ビルド）
   - バージョン更新コミットの作成と Git タグの作成・プッシュ（`create-tag` job）
   - 作成されたタグから npm へのパブリッシュ（Trusted Publisher / OIDC 認証）
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
# ※ unpublish は発行後 72 時間以内、かつレジストリ上で依存するパッケージが存在しない場合のみ可能
# ※ 72 時間経過後は、さらに週間ダウンロード数 300 未満・オーナー / メンテナが 1 人であることが条件
# ※ 条件を満たさない場合は unpublish できないため、deprecate を使用
npm unpublish @katsu996/common-utils@1.x.x

# または deprecated マーク
npm deprecate @katsu996/common-utils@1.x.x "重大な問題のため使用しないでください"
```

## GitHub Secrets 設定

OIDC を使用しない場合、以下の Secrets が必要です:

| Secret      | 説明                                                                                  |
| ----------- | ------------------------------------------------------------------------------------- |
| `NPM_TOKEN` | npm グラニュラーアクセストークン（対象パッケージの書き込み権限と 2FA バイパスを設定） |

## リリースフロー図

```text
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
  ┌─ create-tag job ─────────┐
  │  pnpm version            │
  │ （バージョン更新・タグ作成）│
  │  git push origin main    │
  │  git push --tags         │
  └──────────────────────────┘
        ↓
  ┌─ publish job ───────────┐
  │  pnpm publish (OIDC)    │
  └──────────────────────────┘
        ↓
  ┌─ create-release job ────┐
  │  GitHub Release 作成    │
  └──────────────────────────┘
```
