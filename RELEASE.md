# リリースガイド

このドキュメントでは、`@katsu996/common-utils` パッケージのリリース手順を説明します。

## 🚀 自動リリース（推奨）

### 1. 準備

```bash
# 最新のmainブランチに切り替え
git checkout main
git pull origin main

# 依存関係を更新
pnpm install

# 品質チェック
pnpm run check && pnpm run build
```

### 2. バージョン更新

セマンティックバージョニングに従ってバージョンを更新：

```bash
# パッチバージョン（バグ修正）
pnpm version patch

# マイナーバージョン（新機能）
pnpm version minor

# メジャーバージョン（破壊的変更）
pnpm version major
```

### 3. タグをプッシュ

```bash
git push origin main --tags
```

### 4. 自動リリース

GitHubにタグがプッシュされると、自動的に以下が実行されます：

1. **品質チェック**: TypeScript型チェック + Biome lint
2. **ビルド**: パッケージのビルド
3. **NPM公開**: NPMレジストリへの自動公開
4. **GitHubリリース**: リリースノートの自動作成

## 🛠 手動リリース（緊急時）

### 前提条件

- NPMトークンが設定されている
- リポジトリへの書き込み権限がある

### 手順

```bash
# 1. 品質チェック
pnpm run check

# 2. ビルド
pnpm run build

# 3. NPMに公開
pnpm publish --access public
```

## 📋 必要な設定

### GitHub Secrets

以下のシークレットをGitHubリポジトリに設定してください：

| シークレット名 | 説明 | 取得方法 |
|---------------|------|----------|
| `NPM_TOKEN` | NPMレジストリの認証トークン | [npmjs.com](https://www.npmjs.com) > Settings > Access Tokens |
| `GITHUB_TOKEN` | GitHubのアクセストークン | 自動的に提供される（設定不要） |

### NPMトークンの設定

1. [npmjs.com](https://www.npmjs.com) にログイン
2. Settings > Access Tokens
3. "Generate New Token" > "Automation"
4. 生成されたトークンをGitHub Secrets `NPM_TOKEN` に設定

## 🔍 リリース確認

### リリース後のチェック

1. **NPMでの確認**
   ```bash
   npm view @katsu996/common-utils
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
   const { add } = require('@katsu996/common-utils');
   console.log(add(2, 3)); // 5
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
   - NPMトークンの有効性を確認
   - パッケージ名の重複チェック
   - ネットワーク接続の確認

2. **ビルドエラー**
   - TypeScript型エラーの解決
   - 依存関係の更新

3. **GitHub Actions失敗**
   - ワークフローログの確認
   - シークレット設定の確認

### ロールバック

問題のあるバージョンをリリースした場合：

```bash
# NPMから特定バージョンを非推奨化
npm deprecate @katsu996/common-utils@1.0.1 "This version has critical issues"

# または完全に削除（72時間以内のみ）
npm unpublish @katsu996/common-utils@1.0.1
```

## 📊 リリース統計

リリース後の統計確認：

- **NPMダウンロード数**: [npm-stat.com](https://npm-stat.com/charts.html?package=@katsu996/common-utils)
- **GitHub Analytics**: リポジトリのInsightsタブ
- **パッケージサイズ**: [bundlephobia.com](https://bundlephobia.com/package/@katsu996/common-utils)