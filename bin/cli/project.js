#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { intro, outro, isCancel, cancel, log } = require("@clack/prompts");
const pc = require("picocolors");

const { globalOptions } = require("./args");
const {
  CONFIG_FILES,
  applyConfigFile,
  updateGitignore,
  collectDependencies,
  collectScripts,
  checkConfigFileStatus,
  validateConfigIds,
} = require("./config-files");
const {
  hasPackageJson,
  getProjectName,
  updatePackageJsonExisting,
  updatePackageJson,
} = require("./package");
const {
  getPackageVersion,
  displayHelp,
  displayList,
  displayAvailableCommands,
  getProjectNameInput,
  getConfigFileSelection,
  getExistingProjectConfigSelection,
  displayConfigFileResults,
  displayProjectResults,
  displayCurrentFileStatus,
  displayCompletionMessage,
} = require("./ui");

function createViteProject(projectName, _projectDir) {
  return new Promise((resolve, reject) => {
    log.info("Viteプロジェクトを作成中...");

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
        log.success(`Viteプロジェクト「${projectName}」を作成しました`);
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

function installDependencies(projectDir, dependencies) {
  return new Promise((resolve, reject) => {
    log.info("依存関係をインストール中...");

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
        log.success("依存関係のインストールが完了しました");
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

async function createViteProjectForNew(projectName, projectDir) {
  if (!globalOptions.dryRun) {
    try {
      await createViteProject(projectName, projectDir);
    } catch (error) {
      console.error(`${pc.red("Viteプロジェクト作成エラー:")} ${error.message}`);
      return false;
    }
  } else {
    log.info(`[DRY RUN] Viteプロジェクト「${projectName}」を作成します`);
  }
  return true;
}

async function installDependenciesForNew(projectDir, dependencies, projectName) {
  const shouldSkipInstall = globalOptions.skipInstall || globalOptions.dryRun;
  if (shouldSkipInstall) {
    if (globalOptions.dryRun) {
      log.info(`[DRY RUN] 依存関係をインストールします: ${dependencies.join(", ")}`);
    } else {
      log.info("依存関係のインストールをスキップしました");
    }
    return;
  }

  try {
    await installDependencies(projectDir, dependencies);
  } catch (error) {
    console.error(`${pc.red("依存関係インストールエラー:")} ${error.message}`);
    console.log(
      `${pc.yellow("手動でインストールしてください:")} cd ${projectName} && pnpm add -D ${dependencies.join(" ")}`,
    );
  }
}

function updatePackageJsonForNew(projectDir, selectedConfigs) {
  if (!globalOptions.dryRun) {
    const packageUpdateResult = updatePackageJson(projectDir, selectedConfigs);
    if (!packageUpdateResult.success) {
      console.error(`${pc.red("package.json更新エラー:")} ${packageUpdateResult.error}`);
    }
    return packageUpdateResult;
  }

  log.info("[DRY RUN] package.jsonを更新します");
  return { success: true, scripts: collectScripts(selectedConfigs) };
}

async function initializeNewProject() {
  if (globalOptions.dryRun) {
    log.info("新規プロジェクトの初期設定 [DRY RUN]");
  } else {
    log.info("新規プロジェクトの初期設定");
  }

  const projectName = await getProjectNameInput();
  if (!projectName) {
    return false;
  }

  const selectedConfigs = await getConfigFileSelection();
  if (!selectedConfigs) {
    return false;
  }

  const projectDir = path.join(process.cwd(), projectName);

  if (!(await createViteProjectForNew(projectName, projectDir))) {
    return false;
  }

  const results = [];
  for (const configId of selectedConfigs) {
    const configFile = CONFIG_FILES.find((f) => f.id === configId);
    if (configFile) {
      const result = applyConfigFile(configFile, projectDir);
      results.push(result);
    }
  }

  const gitignoreResult = updateGitignore(projectDir, selectedConfigs);
  if (!gitignoreResult.success) {
    console.error(`${pc.red(".gitignore更新エラー:")} ${gitignoreResult.error}`);
  }

  const dependencies = collectDependencies(selectedConfigs);
  await installDependenciesForNew(projectDir, dependencies, projectName);

  const packageUpdateResult = updatePackageJsonForNew(projectDir, selectedConfigs);

  displayProjectResults(projectDir, results, packageUpdateResult);
  displayCompletionMessage(projectName);

  return true;
}

function applyConfigFilesForExisting(selectedConfigs, fileStatus) {
  const results = [];
  const gitignoreSelected = selectedConfigs.includes("gitignore");
  const otherConfigs = selectedConfigs.filter((id) => id !== "gitignore");

  for (const configId of otherConfigs) {
    const configFile = CONFIG_FILES.find((f) => f.id === configId);
    if (configFile) {
      const fileInfo = fileStatus.find((f) => f.id === configId);
      const result = applyConfigFile(configFile);
      result.wasExisting = !!fileInfo?.exists;
      results.push(result);
    }
  }

  if (gitignoreSelected) {
    const fileInfo = fileStatus.find((f) => f.id === "gitignore");
    const gitignoreResult = updateGitignore(process.cwd(), otherConfigs);
    if (gitignoreResult.success) {
      results.push({
        success: true,
        file: ".gitignore",
        wasExisting: !!fileInfo?.exists,
      });
    } else {
      results.push({
        success: false,
        file: ".gitignore",
        error: gitignoreResult.error,
        wasExisting: !!fileInfo?.exists,
      });
    }
  }

  return results;
}

async function installDependenciesForNewlyAdded(newlyAddedConfigs) {
  const dependencies = collectDependencies(newlyAddedConfigs);
  if (dependencies.length <= 1) {
    return;
  }

  const shouldSkipInstall = globalOptions.skipInstall || globalOptions.dryRun;
  if (shouldSkipInstall) {
    if (globalOptions.dryRun) {
      log.info(`[DRY RUN] 依存関係をインストールします: ${dependencies.join(", ")}`);
    } else {
      log.info("依存関係のインストールをスキップしました");
    }
    return;
  }

  try {
    await installDependencies(process.cwd(), dependencies);
  } catch (error) {
    console.error(`${pc.red("依存関係インストールエラー:")} ${error.message}`);
    console.log(
      `${pc.yellow("手動でインストールしてください:")} pnpm add -D ${dependencies.join(" ")}`,
    );
  }
}

function updatePackageJsonForNewlyAdded(newlyAddedConfigs) {
  if (!globalOptions.dryRun) {
    const packageUpdateResult = updatePackageJsonExisting(newlyAddedConfigs);
    if (!packageUpdateResult.success) {
      console.error(`${pc.red("package.json更新エラー:")} ${packageUpdateResult.error}`);
      return;
    }

    if (Object.keys(packageUpdateResult.scripts || {}).length > 0) {
      console.log();
      displayAvailableCommands(packageUpdateResult);
    }
    return;
  }

  log.info("[DRY RUN] package.jsonを更新します");
  const scripts = collectScripts(newlyAddedConfigs);
  if (Object.keys(scripts).length > 0) {
    console.log();
    displayAvailableCommands({ success: true, scripts });
  }
}

async function processNewlyAddedConfigs(otherConfigs, fileStatus) {
  const newlyAddedConfigs = otherConfigs.filter((configId) => {
    const fileInfo = fileStatus.find((f) => f.id === configId);
    return !fileInfo?.exists;
  });

  if (newlyAddedConfigs.length === 0) {
    return;
  }

  await installDependenciesForNewlyAdded(newlyAddedConfigs);
  updatePackageJsonForNewlyAdded(newlyAddedConfigs);
}

async function updateExistingProject() {
  const projectName = getProjectName();
  const fileStatus = checkConfigFileStatus();

  if (globalOptions.dryRun) {
    log.info("既存プロジェクトの設定更新 [DRY RUN]");
  }

  displayCurrentFileStatus(projectName, fileStatus);

  const selectedConfigs = await getExistingProjectConfigSelection(fileStatus);

  if (isCancel(selectedConfigs)) {
    cancel("設定をキャンセルしました");
    return false;
  }

  const otherConfigs = selectedConfigs.filter((id) => id !== "gitignore");
  const results = applyConfigFilesForExisting(selectedConfigs, fileStatus);

  await processNewlyAddedConfigs(otherConfigs, fileStatus);

  displayConfigFileResults(results);

  if (globalOptions.dryRun) {
    log.success("[DRY RUN] 実際には変更は行われませんでした");
  }

  return true;
}

async function main() {
  const { parseArguments } = require("./args");
  parseArguments({
    getPackageVersion,
    displayHelp,
    displayList,
    validateConfigIds,
  });

  intro(pc.inverse(" @katsu996/common-utils 設定ツール "));

  console.log();
  const currentDir = fs.realpathSync(process.cwd());
  console.log(` 現在のディレクトリ: ${pc.cyan(currentDir)}`);

  const hasPkg = hasPackageJson();
  const packageStatus = hasPkg ? pc.green("✓ 検出") : pc.gray("✗ 未検出");
  console.log(` package.json: ${packageStatus}`);
  console.log();

  try {
    let completed = false;
    if (hasPkg) {
      completed = await updateExistingProject();
    } else {
      completed = await initializeNewProject();
    }

    if (completed) {
      outro(pc.green("設定が完了しました!"));
    }
  } catch (error) {
    console.error(`${pc.red("エラー:")} ${error.message}`);
    process.exit(1);
  }
}

module.exports = { main, initializeNewProject, updateExistingProject };
