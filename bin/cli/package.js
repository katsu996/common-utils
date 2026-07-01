#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { log } = require("@clack/prompts");

const { collectScripts } = require("./config-files");

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

function updatePackageJsonExisting(selectedConfigs) {
  try {
    const packageJsonPath = path.join(process.cwd(), "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    const selectedScripts = collectScripts(selectedConfigs);

    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }

    packageJson.scripts = {
      ...packageJson.scripts,
      ...selectedScripts,
    };

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    log.success("package.jsonにスクリプトを追加しました");

    return { success: true, scripts: selectedScripts };
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

    packageJson.scripts = {
      ...packageJson.scripts,
      ...selectedScripts,
    };

    packageJson.type = "module";

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    log.success("package.jsonにスクリプトとESモジュール設定を追加しました");

    return { success: true, scripts: selectedScripts };
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
