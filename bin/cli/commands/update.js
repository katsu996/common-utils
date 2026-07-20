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

async function updateCommand() {
  try {
    showIntro();

    const fileStatus = checkConfigFileStatus();

    showConfigFileStatus(fileStatus);

    const selectedConfigs = await getExistingProjectConfigSelection(fileStatus);
    if (isCancel(selectedConfigs)) {
      cancel(theme.warning("設定をキャンセルしました"));
      return;
    }

    const otherConfigs = selectedConfigs.filter((id) => id !== "gitignore");

    const results = [];
    for (const configId of otherConfigs) {
      const configFile = CONFIG_FILES.find((f) => f.id === configId);
      if (configFile) {
        const fileInfo = fileStatus.find((f) => f.id === configId);
        const result = applyConfigFile(configFile, process.cwd());
        result.wasExisting = !!fileInfo?.exists;
        results.push(result);
      }
    }

    if (selectedConfigs.includes("gitignore")) {
      const gitignoreResult = updateGitignore(process.cwd(), otherConfigs);
      if (gitignoreResult.success) {
        results.push({ success: true, file: ".gitignore", wasExisting: true });
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
      const fileInfo = fileStatus.find((f) => f.id === configId);
      return !fileInfo?.exists;
    });

    if (newlyAddedConfigs.length > 0) {
      const dependencies = collectDependencies(newlyAddedConfigs);
      await installDependencies(process.cwd(), dependencies);
      const packageUpdateResult = updatePackageJsonExisting(newlyAddedConfigs);
      if (
        packageUpdateResult?.success &&
        Object.keys(packageUpdateResult.scripts || {}).length > 0
      ) {
        showAvailableCommands(packageUpdateResult);
      }
    }

    showResults(results);

    if (globalOptions.dryRun) {
      console.log();
      log.success(theme.warning("[DRY RUN] 実際には変更は行われませんでした"));
    }

    outro(theme.success("設定が完了しました!"));
  } catch (error) {
    handleError(error);
  }
}

module.exports = { updateCommand };
