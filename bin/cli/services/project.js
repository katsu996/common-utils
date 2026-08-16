const { spawn } = require("node:child_process");
const { log } = require("@clack/prompts");
const { theme } = require("../ui/theme");
const { globalOptions } = require("../utils/global-options");
const { CONFIG_FILES, applyConfigFile } = require("../config-files");

function spawnAsync(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const isWindows = process.platform === "win32";
    const child = spawn(command, args, {
      cwd,
      stdio: globalOptions.dryRun ? "pipe" : "inherit",
      shell: isWindows,
    });

    child.on("close", (code) => {
      if (code === 0) resolve();
      else
        reject(
          new Error(`${command} の実行に失敗しました (exit code: ${code})`),
        );
    });
    child.on("error", (error) => reject(error));
  });
}

async function createViteProject(projectName) {
  if (globalOptions.dryRun) {
    log.info(theme.warning(`[DRY RUN] pnpm create vite ${projectName}`));
    return;
  }
  log.info("Viteプロジェクトを作成中...");
  await spawnAsync("pnpm", ["create", "vite", projectName], process.cwd());
  log.success(`Viteプロジェクト「${projectName}」を作成しました`);
}

async function installDependencies(projectDir, dependencies) {
  if (dependencies.length === 0) return;

  if (globalOptions.skipInstall) {
    log.info("依存関係のインストールをスキップしました");
    return;
  }

  if (globalOptions.dryRun) {
    log.info(theme.warning(`[DRY RUN] pnpm add -D ${dependencies.join(" ")}`));
    return;
  }

  log.info("依存関係をインストール中...");
  await spawnAsync("pnpm", ["add", "-D", ...dependencies], projectDir);
  log.success("依存関係のインストールが完了しました");
}

function applyConfigFiles(projectDir, selectedConfigs) {
  const results = [];
  const normalConfigs = selectedConfigs.filter((id) => id !== "gitignore");
  for (const configId of normalConfigs) {
    const configFile = CONFIG_FILES.find((f) => f.id === configId);
    if (configFile) {
      const result = applyConfigFile(configFile, projectDir);
      results.push(result);
    }
  }
  return results;
}

module.exports = { createViteProject, installDependencies, applyConfigFiles };
