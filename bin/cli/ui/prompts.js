const { text, select, multiselect, isCancel, cancel } = require("@clack/prompts");
const { theme } = require("./theme");
const { CONFIG_FILES } = require("../config-files-data");
const { globalOptions } = require("../utils/global-options");
const { validateConfigIds } = require("../config-files");

async function getProjectNameInput() {
  const result = await text({
    message: "プロジェクト名を入力してください",
    placeholder: "my-project",
    defaultValue: "my-project",
    validate: (value) => {
      if (!value || value.trim().length === 0) return undefined;
      if (value.length > 255) return "プロジェクト名は255文字以内で入力してください";
      if (!/^[a-zA-Z0-9-_]+$/.test(value))
        return "プロジェクト名は英数字とハイフン、アンダースコアのみ使用可能です";
      return undefined;
    },
  });

  if (isCancel(result)) {
    cancel(theme.warning("設定をキャンセルしました"));
    return null;
  }

  return result?.trim() || "my-project";
}

function getNonLinterConfigs() {
  return CONFIG_FILES.filter((f) => f.id !== "oxc" && f.id !== "biome");
}

async function getLinterSelection(existingLinter) {
  const options = [
    { value: "oxc", label: "OXC設定 (oxlint.json)" },
    { value: "biome", label: "Biome設定 (biome.jsonc)" },
    { value: null, label: "使用しない" },
  ];

  const initialValue = existingLinter || "oxc";

  const result = await select({
    message: "使用するLinter, Formatterを選択してください",
    options,
    initialValue,
  });

  if (isCancel(result)) {
    cancel(theme.warning("設定をキャンセルしました"));
    return null;
  }

  return result;
}

async function getConfigFileSelection() {
  if (globalOptions.config) {
    validateConfigIds(globalOptions.config);
    return globalOptions.config;
  }

  const linter = await getLinterSelection();
  if (linter === undefined) return null;

  const otherConfigs = getNonLinterConfigs();
  const initialValues = otherConfigs.map((f) => f.id);

  const selectedOthers = await multiselect({
    message: `適用する設定ファイルを選択してください（複数選択可）\n${theme.muted("Spaceキーで選択/選択解除、Enterキーで確定")}`,
    options: otherConfigs.map((file) => ({
      value: file.id,
      label: file.label,
    })),
    initialValues,
  });

  if (isCancel(selectedOthers)) {
    cancel(theme.warning("設定をキャンセルしました"));
    return null;
  }

  const result = linter ? [...selectedOthers, linter] : selectedOthers;
  return result;
}

async function getExistingProjectConfigSelection(fileStatus) {
  if (globalOptions.config) {
    validateConfigIds(globalOptions.config);
    return globalOptions.config;
  }

  const existingLinter = fileStatus.find((f) => (f.id === "oxc" || f.id === "biome") && f.exists);
  const currentLinterId = existingLinter?.id || null;

  const linter = await getLinterSelection(currentLinterId);
  if (linter === undefined) return null;

  const otherConfigs = getNonLinterConfigs();
  const initialValues = otherConfigs
    .filter((f) => fileStatus.find((s) => s.id === f.id)?.exists)
    .map((f) => f.id);

  const selectedOthers = await multiselect({
    message: `更新・追加する設定ファイルを選択してください\n${theme.muted("Spaceキーで選択/選択解除、Enterキーで確定")}`,
    options: otherConfigs.map((file) => {
      const fileInfo = fileStatus.find((f) => f.id === file.id);
      const action = fileInfo?.exists ? "更新" : "追加";
      return {
        value: file.id,
        label: `${file.label.replace(/設定/, `設定を${action}`)}`,
      };
    }),
    initialValues,
  });

  if (isCancel(selectedOthers)) {
    cancel(theme.warning("設定をキャンセルしました"));
    return null;
  }

  const result = linter ? [...selectedOthers, linter] : selectedOthers;
  return result;
}

module.exports = {
  getProjectNameInput,
  getConfigFileSelection,
  getExistingProjectConfigSelection,
};
