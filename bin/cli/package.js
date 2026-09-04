#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { log } = require("@clack/prompts");

const { collectScripts } = require("./config-files");
const { globalOptions } = require("./utils/global-options");

function hasPackageJson() {
  return fs.existsSync(path.join(process.cwd(), "package.json"));
}

function getProjectName() {
  try {
    const packageJsonPath = path.join(process.cwd(), "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    return packageJson.name || "unknown-project";
  } catch {
    return "unknown-project";
  }
}

function validateProjectName(value) {
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
}

function mergeScripts(packageJson, selectedScripts) {
  const scripts = {};
  const skipped = {};

  for (const [name, command] of Object.entries(selectedScripts)) {
    const existing = packageJson.scripts[name];
    if (existing !== undefined && existing !== command) {
      skipped[name] = existing;
      log.warning(
        `スクリプト "${name}" は既に存在するため上書きしませんでした (既存: ${existing})`,
      );
      continue;
    }
    packageJson.scripts[name] = command;
    scripts[name] = command;
  }

  return { scripts, skipped };
}

function updatePackageJsonExisting(selectedConfigs) {
  try {
    const packageJsonPath = path.join(process.cwd(), "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    const selectedScripts = collectScripts(selectedConfigs);

    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }

    const { scripts, skipped } = mergeScripts(packageJson, selectedScripts);

    if (globalOptions.dryRun) {
      log.info("[DRY RUN] package.jsonにスクリプトを追加します");
      return { success: true, scripts, skipped, dryRun: true };
    }

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    log.success("package.jsonにスクリプトを追加しました");

    return { success: true, scripts, skipped };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function updatePackageJson(projectDir, selectedConfigs) {
  try {
    const packageJsonPath = path.join(projectDir, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    const selectedScripts = collectScripts(selectedConfigs);

    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }

    const { scripts, skipped } = mergeScripts(packageJson, selectedScripts);

    packageJson.type = "module";

    if (globalOptions.dryRun) {
      log.info("[DRY RUN] package.jsonにスクリプトとESモジュール設定を追加します");
      return { success: true, scripts, skipped, dryRun: true };
    }

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    log.success("package.jsonにスクリプトとESモジュール設定を追加しました");

    return { success: true, scripts, skipped };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = {
  hasPackageJson,
  getProjectName,
  validateProjectName,
  updatePackageJsonExisting,
  updatePackageJson,
};
