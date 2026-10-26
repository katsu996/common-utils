const { spawn } = require("node:child_process");
const { log } = require("@clack/prompts");
const { theme } = require("../ui/theme");
const { globalOptions } = require("../utils/global-options");
const { CONFIG_FILES, applyConfigFile } = require("../config-files");

function createProjectService(dependencies = {}) {
  const {
    spawnFn = spawn,
    logRef = log,
    themeModule = theme,
    globalOptionsRef = globalOptions,
    configFiles = CONFIG_FILES,
    applyConfigFileFn = applyConfigFile,
    processRef = process,
  } = dependencies;

  function spawnAsync(command, args, cwd) {
    return new Promise((resolve, reject) => {
      const isWindows = processRef.platform === "win32";
      const child = spawnFn(command, args, {
        cwd,
        stdio: globalOptionsRef.dryRun ? "pipe" : "inherit",
        shell: isWindows,
      });
      child.on("close", (code) => {
        if (code === 0) resolve();
        else {
          reject(new Error(`${command} の実行に失敗しました (exit code: ${code})`));
        }
      });
      child.on("error", (error) => reject(error));
    });
  }

  async function createViteProject(projectName) {
    // Validate projectName before passing to spawn to prevent shell injection
    if (!projectName || projectName.trim().length === 0) {
      throw new Error("プロジェクト名が指定されていません");
    }
    // Reject shell metacharacters that could be dangerous for Windows shell execution
    const shellMetacharacters = /[&|<>^%$`\\]/;
    if (shellMetacharacters.test(projectName)) {
      throw new Error("プロジェクト名に使用できない文字が含まれています (& | < > ^ % $ ` \\ )");
    }
    if (globalOptionsRef.dryRun) {
      logRef.info(themeModule.warning(`[DRY RUN] pnpm create vite ${projectName}`));
      return;
    }
    logRef.info("Viteプロジェクトを作成中...");
    await spawnAsync("pnpm", ["create", "vite", projectName], processRef.cwd());
    logRef.success(`Viteプロジェクト「${projectName}」を作成しました`);
  }

  async function installDependencies(projectDir, dependenciesToInstall) {
    if (dependenciesToInstall.length === 0) return;
    if (globalOptionsRef.skipInstall) {
      logRef.info("依存関係のインストールをスキップしました");
      return;
    }
    if (globalOptionsRef.dryRun) {
      logRef.info(
        themeModule.warning(
          `[DRY RUN] pnpm add -D --save-exact ${dependenciesToInstall.join(" ")}`,
        ),
      );
      return;
    }
    logRef.info("依存関係をインストール中...");
    await spawnAsync("pnpm", ["add", "-D", "--save-exact", ...dependenciesToInstall], projectDir);
    logRef.success("依存関係のインストールが完了しました");
  }

  function applyConfigFiles(projectDir, selectedConfigs) {
    const results = [];
    const normalConfigs = selectedConfigs.filter((id) => id !== "gitignore");
    for (const configId of normalConfigs) {
      const configFile = configFiles.find((file) => file.id === configId);
      if (configFile) {
        const result = applyConfigFileFn(configFile, projectDir);
        results.push(result);
      }
    }
    return results;
  }

  return {
    spawnAsync,
    createViteProject,
    installDependencies,
    applyConfigFiles,
  };
}

const projectService = createProjectService();

module.exports = { createProjectService, ...projectService };
