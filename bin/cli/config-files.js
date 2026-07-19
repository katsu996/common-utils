#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { log } = require("@clack/prompts");
const pc = require("picocolors");

const { globalOptions } = require("./args");
const { CONFIG_FILES, packageRoot } = require("./config-files-data");

function getLibraryVersions() {
  try {
    const packageJsonPath = path.join(packageRoot, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    return {
      "@katsu996/common-utils": packageJson.version,
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };
  } catch (error) {
    console.warn(`警告: ライブラリバージョンの取得に失敗しました: ${error.message}`);
    console.warn("代替処理: 基本バージョンを使用します。");
    return {
      "@katsu996/common-utils": "latest",
    };
  }
}

function validateConfigIds(configIds) {
  const validIds = CONFIG_FILES.map((f) => f.id);
  const invalidIds = configIds.filter((id) => !validIds.includes(id));
  if (invalidIds.length > 0) {
    console.error(`${pc.red("エラー:")} 無効な設定ファイルID: ${invalidIds.join(", ")}`);
    console.error(`  利用可能なID: ${validIds.join(", ")}`);
    process.exit(1);
  }
}

function checkConfigFileStatus() {
  return CONFIG_FILES.map((file) => {
    if (file.id === "gitignore") {
      const gitignorePath = path.join(process.cwd(), file.destination);
      const exists = fs.existsSync(gitignorePath);
      if (exists) {
        try {
          const content = fs.readFileSync(gitignorePath, "utf8");
          return {
            ...file,
            exists: content.includes("# 設定ファイル"),
          };
        } catch {
          return { ...file, exists: false };
        }
      }
      return { ...file, exists: false };
    }
    return {
      ...file,
      exists: fs.existsSync(path.join(process.cwd(), file.destination)),
    };
  });
}

function applyConfigFile(file, projectDir = process.cwd()) {
  const { source, destination, contentModifier } = file;
  const fullDestination = path.join(projectDir, destination);

  try {
    let content = fs.readFileSync(source, "utf8");
    if (contentModifier) {
      content = contentModifier(content);
    }

    if (globalOptions.dryRun) {
      const exists = fs.existsSync(fullDestination);
      return {
        success: true,
        file: destination,
        dryRun: true,
        wouldCreate: !exists,
        wouldUpdate: exists,
      };
    }

    fs.writeFileSync(fullDestination, content, "utf8");
    return { success: true, file: destination };
  } catch (error) {
    return { success: false, file: destination, error: error.message };
  }
}

function getExistingGitignorePatterns(gitignoreContent) {
  const existingPatterns = new Set();
  const lines = gitignoreContent.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      existingPatterns.add(trimmed);
    }
  }
  return existingPatterns;
}

function addPatternsToGitignore(content, newPatterns) {
  const hasConfigSection = content.includes("# 設定ファイル");

  if (!hasConfigSection) {
    const separator = content && !content.endsWith("\n") ? "\n" : "";
    return `${content}${separator}\n# 設定ファイル\n${newPatterns.join("\n")}\n`;
  }

  const sectionIndex = content.indexOf("# 設定ファイル");
  if (sectionIndex === -1) {
    return `${content}\n${newPatterns.join("\n")}\n`;
  }

  const afterSection = content.substring(sectionIndex);
  const nextSectionMatch = afterSection.match(/\n# [^\n]/);
  const sectionEnd = nextSectionMatch ? sectionIndex + nextSectionMatch.index : content.length;

  const sectionContent = content.substring(sectionIndex, sectionEnd);
  const patternText = newPatterns.join("\n");
  const newline = sectionContent.endsWith("\n") ? "" : "\n";

  return `${content.substring(0, sectionEnd)}${newline}${patternText}\n${content.substring(sectionEnd)}`;
}

function getTemplateGitignore() {
  try {
    const templateGitignorePath = path.join(packageRoot, ".gitignore.template");
    if (fs.existsSync(templateGitignorePath)) {
      return fs.readFileSync(templateGitignorePath, "utf8");
    }
  } catch (error) {
    console.warn(`警告: .gitignoreテンプレートの読み込みに失敗しました: ${error.message}`);
  }
  return "";
}

function updateGitignore(projectDir, selectedConfigs) {
  try {
    const gitignorePath = path.join(projectDir, ".gitignore");
    let gitignoreContent = "";

    if (fs.existsSync(gitignorePath)) {
      gitignoreContent = fs.readFileSync(gitignorePath, "utf8");
    } else {
      gitignoreContent = getTemplateGitignore();
    }

    const configFilePatterns = selectedConfigs
      .map((configId) => {
        const configFile = CONFIG_FILES.find((f) => f.id === configId);
        return configFile?.destination;
      })
      .filter(Boolean);

    const existingPatterns = getExistingGitignorePatterns(gitignoreContent);

    const newPatterns = configFilePatterns.filter((pattern) => !existingPatterns.has(pattern));

    if (newPatterns.length > 0) {
      if (globalOptions.dryRun) {
        log.info(`[DRY RUN] .gitignoreに設定ファイルを追加します: ${newPatterns.join(", ")}`);
        return { success: true, added: newPatterns, dryRun: true };
      }

      const updatedContent = addPatternsToGitignore(gitignoreContent, newPatterns);
      fs.writeFileSync(gitignorePath, updatedContent, "utf8");
      log.success(`.gitignoreに設定ファイルを追加しました: ${newPatterns.join(", ")}`);
      return { success: true, added: newPatterns };
    }

    return { success: true, added: [] };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function collectDependencies(selectedConfigs) {
  const versions = getLibraryVersions();
  const dependencies = new Set();

  dependencies.add("@katsu996/common-utils@latest");

  for (const configId of selectedConfigs) {
    const configFile = CONFIG_FILES.find((f) => f.id === configId);
    if (configFile?.dependencies) {
      for (const dep of configFile.dependencies) {
        const version = versions[dep];
        if (version) {
          dependencies.add(`${dep}@${version}`);
        } else {
          console.warn(`警告: ${dep} のバージョンが見つかりません。最新版をインストールします。`);
          dependencies.add(dep);
        }
      }
    }
  }

  return Array.from(dependencies);
}

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

module.exports = {
  CONFIG_FILES,
  getLibraryVersions,
  validateConfigIds,
  checkConfigFileStatus,
  applyConfigFile,
  updateGitignore,
  collectDependencies,
  collectScripts,
};
