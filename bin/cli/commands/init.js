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

async function initCommand() {
  try {
    showIntro();

    const projectName = await getProjectNameInput();
    if (!projectName) return;

    const selectedConfigs = await getConfigFileSelection();
    if (!selectedConfigs) return;

    const projectDir = path.join(process.cwd(), projectName);

    await createViteProject(projectName);

    const results = applyConfigFiles(projectDir, selectedConfigs);

    const gitignoreResult = updateGitignore(projectDir, selectedConfigs);
    if (!gitignoreResult.success) {
      console.error(
        `${theme.error(".gitignore更新エラー:")} ${gitignoreResult.error}`,
      );
    }

    const dependencies = collectDependencies(selectedConfigs);
    await installDependencies(projectDir, dependencies);

    const packageUpdateResult = updatePackageJson(projectDir, selectedConfigs);

    showProjectResults(projectDir, results, packageUpdateResult);

    if (!globalOptions.dryRun) {
      showCompletionMessage(projectName);
    }

    outro(theme.success("設定が完了しました!"));
  } catch (error) {
    handleError(error);
  }
}

module.exports = { initCommand };
