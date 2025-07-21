#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { intro, outro, multiselect, text, isCancel, cancel, log } = require("@clack/prompts");
const pc = require("picocolors");

const packageRoot = path.resolve(__dirname, "..");

// 設定ファイルの定義
const CONFIG_FILES = [
  {
    id: "typescript",
    label: "TypeScript設定 (tsconfig.json)",
    source: path.join(packageRoot, "tsconfig.base.json"),
    destination: "tsconfig.json",
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
  },
  {
    id: "vite",
    label: "Vite設定 (vite.config.ts)",
    source: path.resolve(packageRoot, "vite.config.template.ts"),
    destination: "vite.config.ts",
  },
  {
    id: "vitest",
    label: "Vitest設定 (vitest.config.ts)",
    source: path.resolve(packageRoot, "vitest.config.template.ts"),
    destination: "vitest.config.ts",
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

// 新規プロジェクト用の初期設定
async function initializeNewProject() {
  log.info("🚀 新規プロジェクトの初期設定");

  // プロジェクト名の入力
  const projectNameInput = await text({
    message: "プロジェクト名を入力してください",
    placeholder: "my-project",
    defaultValue: "my-project",
    validate: validateProjectName,
  });

  // 空文字の場合はデフォルト値を使用
  const projectName = projectNameInput?.trim() ? projectNameInput.trim() : "my-project";

  if (isCancel(projectName)) {
    cancel("設定をキャンセルしました");
    return;
  }

  // 設定ファイル選択（デフォルトで全選択）
  const selectedConfigs = await multiselect({
    message: "適用する設定ファイルを選択してください（複数選択可）",
    instructions: "スペースキーで選択、Enterキーで確定",
    options: CONFIG_FILES.map((file) => ({
      value: file.id,
      label: file.label,
      hint: file.destination,
    })),
    initialValues: CONFIG_FILES.map((file) => file.id), // デフォルトで全選択
  });

  if (isCancel(selectedConfigs)) {
    cancel("設定をキャンセルしました");
    return;
  }

  // プロジェクトフォルダを作成
  const projectDir = path.join(process.cwd(), projectName);
  try {
    fs.mkdirSync(projectDir, { recursive: true });
    log.info(`📁 プロジェクトフォルダ作成: ${projectDir}`);
  } catch (error) {
    console.error(`${pc.red("❌ フォルダ作成エラー:")} ${error.message}`);
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

  // 結果の表示
  log.success("✨ 設定ファイルの適用完了");
  console.log();
  console.log(`📁 プロジェクトフォルダ: ${pc.cyan(projectDir)}`);
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

  console.log();
  log.success("🎉 設定完了！以下のコマンドで開発を開始できます：");
  console.log(`  ${pc.cyan(`cd ${projectName}`)}`);
  console.log(`  ${pc.cyan("pnpm install")}`);
  console.log(`  ${pc.cyan("pnpm dev")}`);
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
