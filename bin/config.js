#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { intro, outro, multiselect, text, isCancel, cancel, log } = require("@clack/prompts");
const pc = require("picocolors");

const packageRoot = path.dirname(__dirname);

// 本プロジェクトのpackage.jsonからライブラリバージョンを取得する関数
function getLibraryVersions() {
  try {
    const packageJsonPath = path.join(packageRoot, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    
    return {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };
  } catch (error) {
    console.warn(`警告: ライブラリバージョンの取得に失敗しました: ${error.message}`);
    return {};
  }
}

// 設定ファイルの定義
const CONFIG_FILES = [
  {
    id: "typescript",
    label: "TypeScript設定 (tsconfig.json)",
    source: path.join(packageRoot, "tsconfig.base.json"),
    destination: "tsconfig.json",
    dependencies: ["typescript", "@types/node"],
    scripts: {
      "type-check": "tsc --noEmit",
    },
    contentModifier: (content) => {
      JSON.parse(content); // Parse to validate JSON
      const baseConfig = {
        extends: "@katsu996/common-utils/tsconfig",
        compilerOptions: {
          outDir: "./dist",
          rootDir: "./src",
          noEmit: false,
        },
        include: ["src/**/*"],
        exclude: ["node_modules", "dist"],
      };
      return JSON.stringify(baseConfig, null, 2);
    },
  },
  {
    id: "biome",
    label: "Biome設定 (biome.json)",
    source: path.join(packageRoot, "biome.base.json"),
    destination: "biome.json",
    dependencies: ["@biomejs/biome"],
    scripts: {
      lint: "biome lint .",
      "lint:fix": "biome lint --write .",
      check: "biome check .",
      "check:fix": "biome check --write .",
      format: "biome format --write .",
      "format:check": "biome format .",
    },
    contentModifier: (content) => {
      const config = JSON.parse(content);
      const baseConfig = {
        extends: ["@katsu996/common-utils/biome"],
        ...config,
      };
      return JSON.stringify(baseConfig, null, 2);
    },
  },
  {
    id: "mise",
    label: "Mise設定 (mise.toml)",
    source: path.resolve(packageRoot, "mise.toml"),
    destination: "mise.toml",
    dependencies: [],
    scripts: {},
  },
  {
    id: "vite",
    label: "Vite設定 (vite.config.ts)",
    source: path.resolve(packageRoot, "vite.config.template.ts"),
    destination: "vite.config.ts",
    dependencies: [],
    scripts: {},
    contentModifier: (_content) => {
      // 外部参照を使わずにスタンドアローンなvite.config.tsを生成
      return `import { resolve } from "node:path";
import { defineConfig } from "vite";

const isProduction = process.env.NODE_ENV === "production";

export default defineConfig({
  build: {
    target: "esnext",
    minify: isProduction,
    sourcemap: !isProduction,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  // プロジェクト固有の設定をここに追加
});`;
    },
  },
  {
    id: "vitest",
    label: "Vitest設定 (vitest.config.ts)",
    source: path.resolve(packageRoot, "vitest.config.template.ts"),
    destination: "vitest.config.ts",
    dependencies: ["vitest", "@vitest/coverage-v8"],
    scripts: {
      test: "vitest",
      "test:watch": "vitest --watch",
      "test:coverage": "vitest --coverage",
    },
    contentModifier: (_content) => {
      // 外部参照を使わずにスタンドアローンなvitest.config.tsを生成
      return `import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["**/*.{test,spec}.{js,ts}"],
    exclude: ["node_modules", "dist", "build"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "build/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/coverage/**",
      ],
    },
  },
  // プロジェクト固有の設定をここに追加
});`;
    },
  },
];

// package.jsonの存在確認
function hasPackageJson() {
  return fs.existsSync(path.join(process.cwd(), "package.json"));
}

// package.jsonからプロジェクト名を取得
function getProjectName() {
  try {
    const packageJsonPath = path.join(process.cwd(), "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    return packageJson.name || "unknown-project";
  } catch {
    return "unknown-project";
  }
}

// 設定ファイルの存在状況を確認
function checkConfigFileStatus() {
  return CONFIG_FILES.map((file) => ({
    ...file,
    exists: fs.existsSync(path.join(process.cwd(), file.destination)),
  }));
}

// 設定ファイルを作成/更新（プロジェクトフォルダ内）
function applyConfigFile(file, projectDir = process.cwd()) {
  const { source, destination, contentModifier } = file;
  const fullDestination = path.join(projectDir, destination);

  try {
    let content = fs.readFileSync(source, "utf8");
    if (contentModifier) {
      content = contentModifier(content);
    }
    fs.writeFileSync(fullDestination, content, "utf8");
    return { success: true, file: destination };
  } catch (error) {
    return { success: false, file: destination, error: error.message };
  }
}

// プロジェクト名のバリデーション
function validateProjectName(value) {
  // 空文字や未入力の場合は有効とする（デフォルト値を使用するため）
  if (!value || value.trim().length === 0) {
    return undefined;
  }
  if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
    return "プロジェクト名は英数字とハイフン、アンダースコアのみ使用可能です";
  }
  return undefined;
}

// Viteプロジェクトを作成する関数
function createViteProject(projectName, _projectDir) {
  return new Promise((resolve, reject) => {
    log.info("🚀 Viteプロジェクトを作成中...");

    // クロスプラットフォーム対応: WindowsではCOMSPECを使用、それ以外はshを使用
    const isWindows = process.platform === "win32";
    const shell = !!isWindows;
    const command = "pnpm";
    const args = ["create", "vite", projectName];

    const child = spawn(command, args, {
      cwd: process.cwd(),
      stdio: "inherit",
      shell: shell,
    });

    child.on("close", (code) => {
      if (code === 0) {
        log.success(`✅ Viteプロジェクト「${projectName}」を作成しました`);
        resolve();
      } else {
        reject(new Error(`Viteプロジェクトの作成に失敗しました (exit code: ${code})`));
      }
    });

    child.on("error", (error) => {
      reject(new Error(`Viteプロジェクトの作成でエラーが発生しました: ${error.message}`));
    });
  });
}

// 選択された設定ファイルから依存関係を収集する関数（バージョン固定）
function collectDependencies(selectedConfigs) {
  const versions = getLibraryVersions();
  const dependencies = new Set();
  
  // 常に含める基本依存関係（本パッケージは常に最新版）
  dependencies.add("@katsu996/common-utils");

  for (const configId of selectedConfigs) {
    const configFile = CONFIG_FILES.find((f) => f.id === configId);
    if (configFile?.dependencies) {
      for (const dep of configFile.dependencies) {
        const version = versions[dep];
        if (version) {
          dependencies.add(`${dep}@${version}`);
        } else {
          // バージョンが見つからない場合は警告を出して、パッケージ名のみ追加
          console.warn(`警告: ${dep} のバージョンが見つかりません。最新版をインストールします。`);
          dependencies.add(dep);
        }
      }
    }
  }

  return Array.from(dependencies);
}

// 選択された設定ファイルからスクリプトを収集する関数
function collectScripts(selectedConfigs) {
  const scripts = {};

  for (const configId of selectedConfigs) {
    const configFile = CONFIG_FILES.find((f) => f.id === configId);
    if (configFile?.scripts) {
      Object.assign(scripts, configFile.scripts);
    }
  }

  return scripts;
}

// 依存関係をインストールする関数
function installDependencies(projectDir, dependencies) {
  return new Promise((resolve, reject) => {
    log.info("📦 依存関係をインストール中...");

    // クロスプラットフォーム対応
    const isWindows = process.platform === "win32";
    const shell = !!isWindows;
    const command = "pnpm";
    const args = ["add", "-D", ...dependencies];

    const child = spawn(command, args, {
      cwd: projectDir,
      stdio: "inherit",
      shell: shell,
    });

    child.on("close", (code) => {
      if (code === 0) {
        log.success("✅ 依存関係のインストールが完了しました");
        resolve();
      } else {
        reject(new Error(`依存関係のインストールに失敗しました (exit code: ${code})`));
      }
    });

    child.on("error", (error) => {
      reject(new Error(`依存関係のインストールでエラーが発生しました: ${error.message}`));
    });
  });
}

// package.jsonを修正する関数
function updatePackageJson(projectDir, selectedConfigs) {
  try {
    const packageJsonPath = path.join(projectDir, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    // 選択された設定ファイルに基づいてスクリプトを収集
    const selectedScripts = collectScripts(selectedConfigs);

    // scriptsセクションに動的にスクリプトを追加
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }

    packageJson.scripts = {
      ...packageJson.scripts,
      ...selectedScripts,
    };

    // ESモジュール対応
    packageJson.type = "module";

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    log.success("✅ package.jsonにスクリプトとESモジュール設定を追加しました");

    return { success: true, scripts: selectedScripts };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 利用可能なコマンドを表示する関数
function displayAvailableCommands(packageUpdateResult) {
  if (
    !(packageUpdateResult.success && packageUpdateResult.scripts) ||
    Object.keys(packageUpdateResult.scripts).length === 0
  ) {
    return;
  }

  console.log();
  console.log("利用可能なコマンド:");

  const scriptDescriptions = {
    "type-check": "TypeScript型チェック",
    lint: "Biomeによるlint",
    "lint:fix": "lint問題を自動修正",
    check: "Biomeによる総合チェック",
    "check:fix": "check問題を自動修正",
    format: "コードフォーマット",
    "format:check": "フォーマット確認",
    test: "テスト実行",
    "test:watch": "テスト監視モード",
    "test:coverage": "テストカバレッジ",
  };

  for (const scriptName of Object.keys(packageUpdateResult.scripts)) {
    const description = scriptDescriptions[scriptName] || "カスタムスクリプト";
    console.log(`  ${pc.cyan(`pnpm ${scriptName}`).padEnd(22)} - ${description}`);
  }
  console.log();
}

// プロジェクト入力を取得する関数
async function getProjectNameInput() {
  const projectNameInput = await text({
    message: "プロジェクト名を入力してください",
    placeholder: "my-project",
    defaultValue: "my-project",
    validate: validateProjectName,
  });

  const projectName = projectNameInput?.trim() ? projectNameInput.trim() : "my-project";

  if (isCancel(projectName)) {
    cancel("設定をキャンセルしました");
    return null;
  }

  return projectName;
}

// 設定ファイル選択を取得する関数
async function getConfigFileSelection() {
  const selectedConfigs = await multiselect({
    message: "適用する設定ファイルを選択してください（複数選択可）",
    instructions: "Spaceキーで選択/選択解除、Enterキーで確定",
    options: CONFIG_FILES.map((file) => ({
      value: file.id,
      label: file.label,
      hint: file.destination,
    })),
    initialValues: CONFIG_FILES.map((file) => file.id),
  });

  if (isCancel(selectedConfigs)) {
    cancel("設定をキャンセルしました");
    return null;
  }

  return selectedConfigs;
}

// 新規プロジェクト用の初期設定
async function initializeNewProject() {
  log.info("🚀 新規プロジェクトの初期設定");

  const projectName = await getProjectNameInput();
  if (!projectName) {
    return;
  }

  const selectedConfigs = await getConfigFileSelection();
  if (!selectedConfigs) {
    return;
  }

  const projectDir = path.join(process.cwd(), projectName);

  // Viteプロジェクトを作成
  try {
    await createViteProject(projectName, projectDir);
  } catch (error) {
    console.error(`${pc.red("❌ Viteプロジェクト作成エラー:")} ${error.message}`);
    return;
  }

  // 設定ファイルの適用
  const results = [];
  for (const configId of selectedConfigs) {
    const configFile = CONFIG_FILES.find((f) => f.id === configId);
    if (configFile) {
      const result = applyConfigFile(configFile, projectDir);
      results.push(result);
    }
  }

  // 依存関係とpackage.jsonの処理
  const dependencies = collectDependencies(selectedConfigs);

  try {
    await installDependencies(projectDir, dependencies);
  } catch (error) {
    console.error(`${pc.red("❌ 依存関係インストールエラー:")} ${error.message}`);
    console.log(
      `${pc.yellow("⚠️ 手動でインストールしてください:")} cd ${projectName} && pnpm add -D ${dependencies.join(" ")}`,
    );
  }

  const packageUpdateResult = updatePackageJson(projectDir, selectedConfigs);
  if (!packageUpdateResult.success) {
    console.error(`${pc.red("❌ package.json更新エラー:")} ${packageUpdateResult.error}`);
  }

  // 結果表示
  displayProjectResults(projectDir, results, packageUpdateResult);

  log.success("🎉 Viteプロジェクトと設定ファイルの準備完了！以下のコマンドで開発を開始できます：");
  console.log(`  ${pc.cyan(`cd ${projectName}`)}`);
  console.log(`  ${pc.cyan("pnpm dev")}`);
}

// プロジェクト結果を表示する関数
function displayProjectResults(projectDir, results, packageUpdateResult) {
  log.success("✨ 設定ファイルの適用完了");
  console.log();
  console.log(`📁 Viteプロジェクト: ${pc.cyan(projectDir)}`);
  console.log();

  const successFiles = results.filter((r) => r.success);
  if (successFiles.length > 0) {
    console.log("作成されたファイル:");
    for (const r of successFiles) {
      console.log(`  ${pc.green("✓")} ${r.file}`);
    }
  }

  const failedFiles = results.filter((r) => !r.success);
  if (failedFiles.length > 0) {
    console.log();
    console.log("エラーが発生したファイル:");
    for (const r of failedFiles) {
      console.log(`  ${pc.red("✗")} ${r.file}: ${r.error}`);
    }
  }

  displayAvailableCommands(packageUpdateResult);
}

// 既存プロジェクト用の設定更新
async function updateExistingProject() {
  const projectName = getProjectName();
  log.info("🔄 既存プロジェクトの設定更新");
  console.log(`📦 プロジェクト: ${pc.cyan(projectName)}`);
  console.log();

  // 現在の設定ファイル状況を表示
  const fileStatus = checkConfigFileStatus();
  console.log("現在の設定ファイル状況:");
  for (const file of fileStatus) {
    const status = file.exists ? pc.green("✓ 存在") : pc.gray("✗ 未存在");
    console.log(`  ${status} ${file.destination}`);
  }
  console.log();

  // 設定ファイル選択（デフォルトで全選択）
  const selectedConfigs = await multiselect({
    message: "更新・追加する設定ファイルを選択してください",
    instructions: "Spaceキーで選択/選択解除、Enterキーで確定",
    options: CONFIG_FILES.map((file) => {
      const action = file.exists ? "更新" : "追加";
      return {
        value: file.id,
        label: `${file.label.replace(/設定/, `設定を${action}`)}`,
        hint: file.destination,
      };
    }),
    initialValues: CONFIG_FILES.map((file) => file.id), // デフォルトで全選択
  });

  if (isCancel(selectedConfigs)) {
    cancel("設定をキャンセルしました");
    return;
  }

  // 設定ファイルの適用
  const results = [];
  for (const configId of selectedConfigs) {
    const configFile = CONFIG_FILES.find((f) => f.id === configId);
    if (configFile) {
      const result = applyConfigFile(configFile);
      results.push(result);
    }
  }

  // 結果の表示
  log.success("✨ 設定ファイルの適用完了");
  console.log();

  const successFiles = results.filter((r) => r.success);
  if (successFiles.length > 0) {
    console.log("作成されたファイル:");
    for (const r of successFiles) {
      console.log(`  ${pc.green("✓")} ${r.file}`);
    }
  }

  const failedFiles = results.filter((r) => !r.success);
  if (failedFiles.length > 0) {
    console.log();
    console.log("エラーが発生したファイル:");
    for (const r of failedFiles) {
      console.log(`  ${pc.red("✗")} ${r.file}: ${r.error}`);
    }
  }
}

// メイン関数
async function main() {
  intro(pc.inverse(" @katsu996/common-utils 設定ツール "));

  console.log();
  console.log(`📂 現在のディレクトリ: ${pc.cyan(process.cwd())}`);

  const hasPackage = hasPackageJson();
  const packageStatus = hasPackage ? pc.green("✓ 検出") : pc.gray("✗ 未検出");
  console.log(`📋 package.json: ${packageStatus}`);
  console.log();

  try {
    if (hasPackage) {
      await updateExistingProject();
    } else {
      await initializeNewProject();
    }
  } catch (error) {
    console.error(`${pc.red("❌ エラー:")} ${error.message}`);
    process.exit(1);
  }

  outro(pc.green("設定が完了しました！"));
}

// エラーハンドリング
process.on("SIGINT", () => {
  cancel("設定をキャンセルしました");
  process.exit(0);
});

// 実行
main().catch((error) => {
  console.error(`${pc.red("❌ 予期しないエラー:")} ${error.message}`);
  process.exit(1);
});
