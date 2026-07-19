# リリースガイド

このドキュメントでは、`@katsu996/common-utils` パッケージのリリース手順を説明します。

## 🔄 CI（継続的インテグレーション）

プルリクエストがmainブランチにマージされると、CIパイプラインが自動的に以下を実行します：

1. **品質チェック**: TypeScript型チェック + Biome lint
2. **テスト実行**: Vitestによるユニットテスト
3. **ビルド**: パッケージのビルド
4. **セキュリティ監査**: 依存関係の脆弱性チェック

これらのステップは、コードの品質を保証するために自動実行されます。

## 🚀 パブリッシュ（リリース）

パッケージをリリースするには、GitHub Actionsの「Publish to npm」ワークフローを手動で実行します：

1. **バージョン更新**: セマンティックバージョニングに基づくバージョン更新（patch/minor/majorを選択）
2. **タグ作成**: Gitタグの自動生成
3. **NPM公開**: **Trusted Publisher** を使用して npm レジストリへ自動公開
4. **GitHubリリース**: リリースノートの自動作成

### パブリッシュの手順

1. 以下のURLにアクセス：
   [https://github.com/katsu996/common-utils/actions/workflows/publish.yml](https://github.com/katsu996/common-utils/actions/workflows/publish.yml)
2. 「Run workflow」をクリック
3. バージョンタイプ（patch/minor/major）を選択
4. 「Run workflow」ボタンをクリック

ワークフローは以下の順序で実行されます：

- CIの実行（品質チェック、テスト、ビルド）
- バージョン更新とタグ作成
- NPMへの公開（Trusted Publisher経由）
- GitHubリリースの作成

## 🛠 手動リリース（緊急時）

### 前提条件

- npm cli でログインしている（`npm login`）
- リポジトリへの書き込み権限がある
- パッケージのコラボレーター権限がある

### 手順

```bash
# 1. 品質チェック
pnpm check

# 2. ビルド
pnpm build

# 3. テスト実行
pnpm test

# 4. バージョン更新
# パッチバージョン（バグ修正）
pnpm version patch
# マイナーバージョン（新機能）
pnpm version minor
# メジャーバージョン（破壊的変更）
pnpm version major

# 5. タグをプッシュ
git push origin main --tags

# 6. NPMに公開
pnpm publish --access public --no-git-checks
```

## 📋 必要な設定（初回のみ）

### Trusted Publisher の設定

本パッケージは **NPMトークンを使用せず**、npm の Trusted Publisher（OpenID Connect）による認証で公開します。

#### 前提条件

- `@katsu996` 組織が npmjs.com に存在すること
- 組織の管理者権限があること

#### 設定手順

1. [npmjs.com](https://www.npmjs.com) にログイン
2. `@katsu996/common-utils` のパッケージページを開く
   - 未作成の場合は先に `pnpm publish --access public --dry-run` で公開を試み、404 エラーを確認した上で `npm init --scope=katsu996` 等で作成する
3. パッケージ設定 > "Access" セクション > "Manage Access"
4. 「Add Integration」→「GitHub Actions」を選択
5. 以下の情報を入力：

   | 項目        | 値                         |
   | ----------- | -------------------------- |
   | Owner       | `katsu996`                 |
   | Repository  | `common-utils`             |
   | Workflow    | `publish.yml`              |
   | Environment | 空欄（すべての環境を許可） |

6. 「Create Integration」をクリック

#### 確認

設定が完了すると、GitHub Actions の publish ワークフローが `id-token: write` 権限を使用して npm に認証できるようになります。

### GitHub Secrets

| シークレット名 | 説明                     | 備考                           |
| -------------- | ------------------------ | ------------------------------ |
| `GITHUB_TOKEN` | GitHubのアクセストークン | 自動的に提供される（設定不要） |

> **Note**: `NPM_TOKEN` は不要です。認証は Trusted Publisher（OIDC）によって行われます。

## 🔍 リリース確認

### リリース後のチェック

1. **NPMでの確認**

   ```bash
   pnpm view @katsu996/common-utils
   ```

2. **インストールテスト**

   ```bash
   # 別ディレクトリでテスト
   mkdir test-install && cd test-install
   pnpm init -y
   pnpm add @katsu996/common-utils
   ```

3. **機能テスト**

   ```javascript
   // test.js
   const { add } = require("@katsu996/common-utils");
   console.log(add(2, 3)); // 5
   ```

4. **CLIツールテスト**

   ```bash
   # katsu-configコマンドのテスト
   pnpm dlx @katsu996/common-utils katsu-config
   ```

## 📝 リリースノート

リリースノートには以下を含めることを推奨：

- **🎉 新機能**: 追加された機能
- **🐛 バグ修正**: 修正されたバグ
- **⚠️ 破壊的変更**: 互換性のない変更
- **📚 ドキュメント**: ドキュメントの更新
- **🔧 内部変更**: 開発者向けの変更

## 🚨 トラブルシューティング

### よくある問題

1. **NPM公開エラー**
   - Trusted Publisher の設定が正しいか確認（npm パッケージ設定 > Access > Integrations）
   - `@katsu996` 組織が npmjs.com に存在するか確認
   - publish.yml に `id-token: write` 権限が付与されているか確認
   - 初回公開時は手動で `npm publish` が必要な場合あり（package の作成）
   - パッケージ名の重複チェック
   - ネットワーク接続の確認

2. **ビルドエラー**
   - TypeScript型エラーの解決
   - 依存関係の更新

3. **テストエラー**
   - ユニットテストの失敗確認: `pnpm test`
   - テスト監視モード: `pnpm test:watch`
   - カバレッジ確認: `pnpm test:coverage`

4. **katsu-configエラー**
   - Windows環境でのshebang問題
   - PowerShell/コマンドプロンプトの使用
   - `pnpm dlx`での実行

5. **GitHub Actions失敗**
   - ワークフローログの確認
   - Trusted Publisher（Integration）設定の確認

### ロールバック

問題のあるバージョンをリリースした場合：

```bash
# NPMから特定バージョンを非推奨化
npm deprecate @katsu996/common-utils@0.6.2 "This version has critical issues"

# または完全に削除（72時間以内のみ）
npm unpublish @katsu996/common-utils@0.6.2
```

## 📊 リリース統計

リリース後の統計確認：

- **NPMダウンロード数**: [npm-stat.com](https://npm-stat.com/charts.html?package=@katsu996/common-utils)
- **GitHub Analytics**: リポジトリのInsightsタブ
- **パッケージサイズ**: [bundlephobia.com](https://bundlephobia.com/package/@katsu996/common-utils)
