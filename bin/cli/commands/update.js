const { outro, isCancel, cancel, log } = require("@clack/prompts");
const { theme } = require("../ui/theme");
const {
  showIntro,
  showConfigFileStatus,
  showResults,
  showAvailableCommands,
} = require("../ui/display");
const { getExistingProjectConfigSelection } = require("../ui/prompts");
const { installDependencies } = require("../services/project");
const {
  CONFIG_FILES,
  checkConfigFileStatus,
  applyConfigFile,
  updateGitignore,
  collectDependencies,
} = require("../config-files");
const { updatePackageJsonExisting } = require("../package");
const { globalOptions } = require("../utils/global-options");
const { handleError } = require("../utils/errors");

function createUpdateCommand(dependencies = {}) {
  const {
    outroFn = outro,
    isCancelFn = isCancel,
    cancelFn = cancel,
    logRef = log,
    themeModule = theme,
    showIntroFn = showIntro,
    showConfigFileStatusFn = showConfigFileStatus,
    showResultsFn = showResults,
    showAvailableCommandsFn = showAvailableCommands,
    getExistingProjectConfigSelectionFn = getExistingProjectConfigSelection,
    installDependenciesFn = installDependencies,
    configFiles = CONFIG_FILES,
    checkConfigFileStatusFn = checkConfigFileStatus,
    applyConfigFileFn = applyConfigFile,
    updateGitignoreFn = updateGitignore,
    collectDependenciesFn = collectDependencies,
    updatePackageJsonExistingFn = updatePackageJsonExisting,
    globalOptionsRef = globalOptions,
    handleErrorFn = handleError,
    processRef = process,
    consoleRef = console,
  } = dependencies;

  return async function updateCommand() {
    try {
      showIntroFn();
      const fileStatus = checkConfigFileStatusFn();
      showConfigFileStatusFn(fileStatus);
      const selectedConfigs =
        await getExistingProjectConfigSelectionFn(fileStatus);
      if (
        selectedConfigs === null ||
        selectedConfigs === undefined ||
        isCancelFn(selectedConfigs)
      ) {
        cancelFn(themeModule.warning("設定をキャンセルしました"));
        return;
      }

      const otherConfigs = selectedConfigs.filter((id) => id !== "gitignore");
      const results = [];
      for (const configId of otherConfigs) {
        const configFile = configFiles.find((file) => file.id === configId);
        if (configFile) {
          const fileInfo = fileStatus.find((file) => file.id === configId);
          const result = applyConfigFileFn(configFile, processRef.cwd());
          result.wasExisting = !!fileInfo?.exists;
          results.push(result);
        }
      }

      if (selectedConfigs.includes("gitignore")) {
        const gitignoreResult = updateGitignoreFn(
          processRef.cwd(),
          otherConfigs,
        );
        if (gitignoreResult.success) {
          results.push({
            success: true,
            file: ".gitignore",
            wasExisting: true,
          });
        } else {
          results.push({
            success: false,
            file: ".gitignore",
            error: gitignoreResult.error,
            wasExisting: true,
          });
        }
      }

      const newlyAddedConfigs = otherConfigs.filter((configId) => {
        const fileInfo = fileStatus.find((file) => file.id === configId);
        return !fileInfo?.exists;
      });
      if (newlyAddedConfigs.length > 0) {
        const dependenciesToInstall = collectDependenciesFn(newlyAddedConfigs);
        await installDependenciesFn(processRef.cwd(), dependenciesToInstall);
        const packageUpdateResult =
          updatePackageJsonExistingFn(newlyAddedConfigs);
        if (
          packageUpdateResult?.success &&
          Object.keys(packageUpdateResult.scripts || {}).length > 0
        ) {
          showAvailableCommandsFn(packageUpdateResult);
        }
      }

      showResultsFn(results);
      if (globalOptionsRef.dryRun) {
        consoleRef.log();
        logRef.success(
          themeModule.warning("[DRY RUN] 実際には変更は行われませんでした"),
        );
      }
      outroFn(themeModule.success("設定が完了しました!"));
    } catch (error) {
      handleErrorFn(error);
    }
  };
}

const updateCommand = createUpdateCommand();

module.exports = { createUpdateCommand, updateCommand };
