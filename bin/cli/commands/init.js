const path = require("node:path");
const { outro } = require("@clack/prompts");
const { theme } = require("../ui/theme");
const {
  showIntro,
  showProjectResults,
  showCompletionMessage,
} = require("../ui/display");
const {
  getProjectNameInput,
  getConfigFileSelection,
} = require("../ui/prompts");
const {
  createViteProject,
  installDependencies,
  applyConfigFiles,
} = require("../services/project");
const { updateGitignore, collectDependencies } = require("../config-files");
const { updatePackageJson } = require("../package");
const { globalOptions } = require("../utils/global-options");
const { handleError } = require("../utils/errors");

function createInitCommand(dependencies = {}) {
  const {
    pathModule = path,
    outroFn = outro,
    themeModule = theme,
    showIntroFn = showIntro,
    showProjectResultsFn = showProjectResults,
    showCompletionMessageFn = showCompletionMessage,
    getProjectNameInputFn = getProjectNameInput,
    getConfigFileSelectionFn = getConfigFileSelection,
    createViteProjectFn = createViteProject,
    installDependenciesFn = installDependencies,
    applyConfigFilesFn = applyConfigFiles,
    updateGitignoreFn = updateGitignore,
    collectDependenciesFn = collectDependencies,
    updatePackageJsonFn = updatePackageJson,
    globalOptionsRef = globalOptions,
    handleErrorFn = handleError,
    processRef = process,
    consoleRef = console,
  } = dependencies;

  return async function initCommand() {
    try {
      showIntroFn();
      const projectName = await getProjectNameInputFn();
      if (!projectName) return;

      const selectedConfigs = await getConfigFileSelectionFn();
      if (!selectedConfigs) return;

      const projectDir = pathModule.join(processRef.cwd(), projectName);
      await createViteProjectFn(projectName);
      const results = applyConfigFilesFn(projectDir, selectedConfigs);
      const gitignoreResult = updateGitignoreFn(projectDir, selectedConfigs);
      if (!gitignoreResult.success) {
        consoleRef.error(
          `${themeModule.error(".gitignore更新エラー:")} ${gitignoreResult.error}`,
        );
      }

      const dependenciesToInstall = collectDependenciesFn(selectedConfigs);
      await installDependenciesFn(projectDir, dependenciesToInstall);
      const packageUpdateResult = updatePackageJsonFn(
        projectDir,
        selectedConfigs,
      );
      showProjectResultsFn(projectDir, results, packageUpdateResult);
      const hasFailure =
        !gitignoreResult.success || results.some((result) => !result.success);
      if (!globalOptionsRef.dryRun && !hasFailure) {
        showCompletionMessageFn(projectName);
      }
      outroFn(
        hasFailure
          ? themeModule.warning(
              "一部の設定処理に失敗しました。出力を確認してください",
            )
          : themeModule.success("設定が完了しました!"),
      );
      return !hasFailure;
    } catch (error) {
      handleErrorFn(error);
    }
  };
}

const initCommand = createInitCommand();

module.exports = { createInitCommand, initCommand };
