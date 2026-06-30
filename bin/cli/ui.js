#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { intro, outro, multiselect, text, isCancel, cancel, log } = require("@clack/prompts");
const pc = require("picocolors");

const { globalOptions } = require("./args");
const { CONFIG_FILES } = require("./config-files");

const packageRoot = path.resolve(__dirname, "../..");

function getPackageVersion() {
  try {
    const packageJsonPath = path.join(packageRoot, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    return packageJson.version;
  } catch {
    return "unknown";
  }
}

function displayHelp() {
  console.log(`
${pc.inverse(" @katsu996/common-utils 設定ツール ")}
${pc.bold("使用方法")}
  katsu-config [オプション]

${pc.bold("オプション:")}
  -v, --version          バージョン番号を表示
  -h, --help             このヘルプメッセージを表示
  -l, --list             利用可能な設定ファイルの一覧を表示
  -c, --config <ids>     適用する設定ファイルを指定（カンマ区切り）
                         例: --config typescript,biome
  --skip-install         依存関係のインストールをスキップ
  -n, --dry-run          実際の変更を行わずにプレビュー

${pc.bold("説明")}
  このツールは、プロジェクトに設定ファイルを追加・更新するためのツールです。
  - 新規プロジェクトの場合: Viteプロジェクトを作成し、設定ファイルを適用します
  - 既存プロジェクトの場合: 既存の設定ファイルを更新または新規追加します
${pc.bold("設定ファイルID:")}
  typescript    TypeScript設定 (tsconfig.json)
  biome         Biome設定 (biome.jsonc)
  mise          Mise設定 (mise.toml)
  vite          Vite設定 (vite.config.ts)
  vitest        Vitest設定 (vitest.config.ts)
  gitignore     .gitignore設定`);
}

function displayList() {
  console.log(`
${pc.inverse(" 利用可能な設定ファイル ")}
`);
  for (const file of CONFIG_FILES) {
    console.log(`${pc.cyan(file.id).padEnd(12)} - ${file.label}`);
    console.log(`            ${pc.gray(`-> ${file.destination}`)}`);
    if (file.dependencies && file.dependencies.length > 0) {
      console.log(`            ${pc.yellow(`依存関係: ${file.dependencies.join(", ")}`)}`);
    }
    console.log();
  }
}

function displayAvailableCommands(packageUpdateResult) {
  if (
    !(packageUpdateResult.success && packageUpdateResult.scripts) ||
    Object.keys(packageUpdateResult.scripts).length === 0
  ) {
    return;
  }

  console.log();
  console.log("利用可能なコマンド");

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

async function getProjectNameInput() {
  const projectNameInput = await text({
    message: "プロジェクト名を入力してください",
    placeholder: "my-project",
    defaultValue: "my-project",
    validate: (value) => {
      if (!value || value.trim().length === 0) {
        return undefined;
      }
      if (value.length > 255) {
        return "プロジェクト名は255文字以内で入力してください";
      }
      if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
        return "プロジェクト名は英数字とハイフン、アンダースコアのみ使用可能です";
      }
      return undefined;
    },
  });

  const projectName = projectNameInput?.trim() ? projectNameInput.trim() : "my-project";

  if (isCancel(projectName)) {
    cancel("設定をキャンセルしました");
    return null;
  }

  return projectName;
}

async function getConfigFileSelection() {
  if (globalOptions.config) {
    return globalOptions.config;
  }

  const selectedConfigs = await multiselect({
    message:
      "適用する設定ファイルを選択してください（複数選択可）\n" +
      pc.yellow("操作方法: Spaceキーで選択/選択解除、Enterキーで確定"),
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

async function getExistingProjectConfigSelection(fileStatus) {
  if (globalOptions.config) {
    return globalOptions.config;
  }

  const existingFiles = fileStatus.filter((f) => f.exists).map((f) => f.id);

  return await multiselect({
    message:
      "更新・追加する設定ファイルを選択してください\n" +
      pc.yellow("操作方法: Spaceキーで選択/選択解除、Enterキーで確定"),
    options: CONFIG_FILES.map((file) => {
      const fileInfo = fileStatus.find((f) => f.id === file.id);
      const action = fileInfo?.exists ? "更新" : "追加";
      return {
        value: file.id,
        label: `${file.label.replace(/設定/, `設定を${action}`)}`,
        hint: file.destination,
      };
    }),
    initialValues: existingFiles,
  });
}

function displayFileResult(result) {
  if (result.dryRun) {
    console.log(`  ${pc.yellow("[DRY RUN]")} ${pc.green("✓")} ${result.file}`);
  } else {
    console.log(`  ${pc.green("✓")} ${result.file}`);
  }
}

function displayUpdatedFiles(updatedFiles) {
  if (updatedFiles.length === 0) {
    return false;
  }

  console.log(globalOptions.dryRun ? "更新されるファイル:" : "更新されたファイル:");
  for (const r of updatedFiles) {
    displayFileResult(r);
  }
  return true;
}

function displayCreatedFiles(createdFiles, hasUpdatedFiles) {
  if (createdFiles.length === 0) {
    return;
  }

  if (hasUpdatedFiles) {
    console.log();
  }
  console.log(globalOptions.dryRun ? "作成されるファイル:" : "作成されたファイル:");
  for (const r of createdFiles) {
    displayFileResult(r);
  }
}

function displayFailedFiles(failedFiles) {
  if (failedFiles.length === 0) {
    return;
  }

  console.log();
  console.log("エラーが発生したファイル:");
  for (const r of failedFiles) {
    console.log(`  ${pc.red("✗")} ${r.file}: ${r.error}`);
  }
}

function displayConfigFileResults(results) {
  if (globalOptions.dryRun) {
    log.success("設定ファイルの適用プレビュー [DRY RUN]");
  } else {
    log.success("設定ファイルの適用完了");
  }
  console.log();

  const successFiles = results.filter((r) => r.success);
  const updatedFiles = successFiles.filter((r) => r.wasExisting);
  const createdFiles = successFiles.filter((r) => !r.wasExisting);
  const failedFiles = results.filter((r) => !r.success);

  const hasUpdatedFiles = displayUpdatedFiles(updatedFiles);
  displayCreatedFiles(createdFiles, hasUpdatedFiles);
  displayFailedFiles(failedFiles);
}

function displayProjectResults(projectDir, results, packageUpdateResult) {
  if (globalOptions.dryRun) {
    log.success("設定ファイルの適用プレビュー [DRY RUN]");
  } else {
    log.success("設定ファイルの適用完了");
  }
  console.log();
  console.log(` Viteプロジェクト: ${pc.cyan(projectDir)}`);
  console.log();

  const successFiles = results.filter((r) => r.success);
  if (successFiles.length > 0) {
    console.log(globalOptions.dryRun ? "作成されるファイル:" : "作成されたファイル:");
    for (const r of successFiles) {
      if (r.dryRun) {
        console.log(`  ${pc.yellow("[DRY RUN]")} ${pc.green("✓")} ${r.file}`);
      } else {
        console.log(`  ${pc.green("✓")} ${r.file}`);
      }
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

function displayCurrentFileStatus(projectName, fileStatus) {
  log.info("既存プロジェクトの設定更新");
  console.log(` プロジェクト: ${pc.cyan(projectName)}`);
  console.log();

  console.log("現在の設定ファイル状況:");
  for (const file of fileStatus) {
    const status = file.exists ? pc.green("✓ 存在") : pc.gray("✗ 未存在");
    console.log(`  ${status} ${file.destination}`);
  }
  console.log();
}

function displayCompletionMessage(projectName) {
  if (globalOptions.dryRun) {
    log.success("[DRY RUN] 実際には変更は行われませんでした");
  } else {
    log.success("Viteプロジェクトと設定ファイルの準備完了! 以下のコマンドで開発を開始できます:");
    console.log(`  ${pc.cyan(`cd ${projectName}`)}`);
    console.log(`  ${pc.cyan("pnpm dev")}`);
  }
}

module.exports = {
  getPackageVersion,
  displayHelp,
  displayList,
  displayAvailableCommands,
  getProjectNameInput,
  getConfigFileSelection,
  getExistingProjectConfigSelection,
  displayFileResult,
  displayUpdatedFiles,
  displayCreatedFiles,
  displayFailedFiles,
  displayConfigFileResults,
  displayProjectResults,
  displayCurrentFileStatus,
  displayCompletionMessage,
};
