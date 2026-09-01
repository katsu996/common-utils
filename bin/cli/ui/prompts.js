const {
  text,
  select,
  multiselect,
  isCancel,
  cancel,
} = require("@clack/prompts");
const { theme } = require("./theme");
const { CONFIG_FILES } = require("../config-files-data");
const { globalOptions } = require("../utils/global-options");
const { validateConfigIds } = require("../config-files");

function createPrompts(dependencies = {}) {
  const {
    textFn = text,
    selectFn = select,
    multiselectFn = multiselect,
    isCancelFn = isCancel,
    cancelFn = cancel,
    themeModule = theme,
    configFiles = CONFIG_FILES,
    globalOptionsRef = globalOptions,
    validateConfigIdsFn = validateConfigIds,
  } = dependencies;

  async function getProjectNameInput() {
    const result = await textFn({
      message: "プロジェクト名を入力してください",
      placeholder: "my-project",
      defaultValue: "my-project",
      validate: (value) => {
        if (!value || value.trim().length === 0) return undefined;
        if (value.length > 255)
          return "プロジェクト名は255文字以内で入力してください";
        if (!/^[a-zA-Z0-9-_]+$/.test(value))
          return "プロジェクト名は英数字とハイフン、アンダースコアのみ使用可能です";
        return undefined;
      },
    });
    if (isCancelFn(result)) {
      cancelFn(themeModule.warning("設定をキャンセルしました"));
      return undefined;
    }
    return result?.trim() || "my-project";
  }

  function getNonLinterConfigs() {
    return configFiles.filter(
      (file) => file.id !== "oxc" && file.id !== "biome",
    );
  }

  async function getLinterSelection(existingLinter) {
    const result = await selectFn({
      message: "使用するLinter, Formatterを選択してください",
      options: [
        { value: "oxc", label: "OXC設定 (oxlint.json)" },
        { value: "biome", label: "Biome設定 (biome.jsonc)" },
        { value: null, label: "使用しない" },
      ],
      initialValue: existingLinter || "oxc",
    });
    if (isCancelFn(result)) {
      cancelFn(themeModule.warning("設定をキャンセルしました"));
      return null;
    }
    return result;
  }

  async function getConfigFileSelection() {
    if (globalOptionsRef.config) {
      validateConfigIdsFn(globalOptionsRef.config);
      return globalOptionsRef.config;
    }
    const linter = await getLinterSelection();
    if (linter === undefined) return null;

    const otherConfigs = getNonLinterConfigs();
    const selectedOthers = await multiselectFn({
      message: `適用する設定ファイルを選択してください（複数選択可）\n${themeModule.muted("Spaceキーで選択/選択解除、Enterキーで確定")}`,
      options: otherConfigs.map((file) => ({
        value: file.id,
        label: file.label,
      })),
      initialValues: otherConfigs.map((file) => file.id),
    });
    if (isCancelFn(selectedOthers)) {
      cancelFn(themeModule.warning("設定をキャンセルしました"));
      return null;
    }
    return linter ? [...selectedOthers, linter] : selectedOthers;
  }

  async function getExistingProjectConfigSelection(fileStatus) {
    if (globalOptionsRef.config) {
      validateConfigIdsFn(globalOptionsRef.config);
      return globalOptionsRef.config;
    }

    const existingLinter = configFiles.find(
      (file) =>
        (file.id === "oxc" || file.id === "biome") &&
        fileStatus.find((status) => status.id === file.id)?.exists,
    );
    const linter = await getLinterSelection(existingLinter?.id || null);
    if (linter === undefined) return null;

    const otherConfigs = getNonLinterConfigs();
    const selectedOthers = await multiselectFn({
      message: `更新・追加する設定ファイルを選択してください\n${themeModule.muted("Spaceキーで選択/選択解除、Enterキーで確定")}`,
      options: otherConfigs.map((file) => {
        const fileInfo = fileStatus.find((status) => status.id === file.id);
        const action = fileInfo?.exists ? "更新" : "追加";
        return {
          value: file.id,
          label: file.label.replace(/設定/, `設定を${action}`),
        };
      }),
      initialValues: otherConfigs
        .filter(
          (file) => fileStatus.find((status) => status.id === file.id)?.exists,
        )
        .map((file) => file.id),
    });
    if (isCancelFn(selectedOthers)) {
      cancelFn(themeModule.warning("設定をキャンセルしました"));
      return null;
    }
    return linter ? [...selectedOthers, linter] : selectedOthers;
  }

  return {
    getProjectNameInput,
    getConfigFileSelection,
    getExistingProjectConfigSelection,
  };
}

const promptFunctions = createPrompts();

module.exports = { createPrompts, ...promptFunctions };
