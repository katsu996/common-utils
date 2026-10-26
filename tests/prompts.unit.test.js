import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createPrompts } = require("../bin/cli/ui/prompts");

const configFiles = [
  { id: "typescript", label: "TypeScript設定", destination: "tsconfig.json" },
  { id: "vite", label: "Vite設定", destination: "vite.config.ts" },
  { id: "oxc", label: "OXC設定", destination: "oxlint.json" },
  { id: "biome", label: "Biome設定", destination: "biome.jsonc" },
];

function createDependencies(overrides = {}) {
  return {
    textFn: vi.fn().mockResolvedValue("sample-app"),
    selectFn: vi.fn().mockResolvedValue("oxc"),
    multiselectFn: vi.fn().mockResolvedValue(["typescript"]),
    isCancelFn: vi.fn().mockReturnValue(false),
    cancelFn: vi.fn(),
    themeModule: {
      warning: vi.fn((message) => message),
      muted: vi.fn((message) => message),
    },
    configFiles,
    globalOptionsRef: { config: null },
    validateConfigIdsFn: vi.fn(),
    ...overrides,
  };
}

describe("prompts", () => {
  let dependencies;

  beforeEach(() => {
    dependencies = createDependencies();
  });

  it("プロジェクト名をトリムし、空入力には既定名を返す", async () => {
    dependencies.textFn.mockResolvedValue("  sample-app  ");
    const prompts = createPrompts(dependencies);

    await expect(prompts.getProjectNameInput()).resolves.toBe("sample-app");

    dependencies.textFn.mockResolvedValue("   ");
    await expect(prompts.getProjectNameInput()).resolves.toBe("my-project");
  });

  it("プロジェクト名入力のキャンセルを通知して undefined を返す", async () => {
    const { createPrompts } = require("../bin/cli/ui/prompts");
    const cancelled = Symbol("cancelled");
    dependencies.textFn.mockResolvedValue(cancelled);
    dependencies.isCancelFn.mockImplementation((value) => value === cancelled);
    const prompts = createPrompts(dependencies);
    const result = await prompts.getProjectNameInput();
    expect(result).toBeUndefined();
    expect(dependencies.cancelFn).toHaveBeenCalledWith("設定をキャンセルしました");
  });

  it("プロジェクト名のバリデーションで文字数と使用可能文字を検証する", async () => {
    const prompts = createPrompts(dependencies);
    await prompts.getProjectNameInput();
    const validate = dependencies.textFn.mock.calls[0][0].validate;

    expect(validate("a".repeat(256))).toBe("プロジェクト名は255文字以内で入力してください");
    expect(validate("invalid name")).toBe(
      "プロジェクト名は英数字とハイフン、アンダースコアのみ使用可能です",
    );
    expect(validate("valid_name-1")).toBeUndefined();
  });

  it("グローバル指定の設定 ID は検証後にそのまま返す", async () => {
    dependencies.globalOptionsRef.config = ["typescript", "vite"];

    const result = await createPrompts(dependencies).getConfigFileSelection();

    expect(result).toEqual(["typescript", "vite"]);
    expect(dependencies.validateConfigIdsFn).toHaveBeenCalledWith(["typescript", "vite"]);
    expect(dependencies.selectFn).not.toHaveBeenCalled();
  });

  it("対話選択では linter を設定ファイル選択結果に追加する", async () => {
    const result = await createPrompts(dependencies).getConfigFileSelection();

    expect(result).toEqual(["typescript", "oxc"]);
    expect(dependencies.multiselectFn).toHaveBeenCalledWith(
      expect.objectContaining({ initialValues: ["typescript", "vite"] }),
    );
  });

  it("linter を使用しない場合はその他の選択だけを返す", async () => {
    dependencies.selectFn.mockResolvedValue(null);
    dependencies.multiselectFn.mockResolvedValue(["vite"]);

    await expect(createPrompts(dependencies).getConfigFileSelection()).resolves.toEqual(["vite"]);
  });

  it("設定ファイル選択のキャンセルを通知して null を返す", async () => {
    const cancelled = Symbol("cancelled");
    dependencies.multiselectFn.mockResolvedValue(cancelled);
    dependencies.isCancelFn.mockImplementation((value) => value === cancelled);

    const result = await createPrompts(dependencies).getConfigFileSelection();

    expect(result).toBeNull();
    expect(dependencies.cancelFn).toHaveBeenCalledWith("設定をキャンセルしました");
  });

  it("既存プロジェクトでは存在する設定を初期選択し、linter を保持する", async () => {
    dependencies.selectFn.mockResolvedValue("biome");
    dependencies.multiselectFn.mockResolvedValue(["typescript", "vite"]);
    const fileStatus = [
      { id: "typescript", exists: true },
      { id: "vite", exists: false },
      { id: "oxc", exists: false },
      { id: "biome", exists: true },
    ];

    const result = await createPrompts(dependencies).getExistingProjectConfigSelection(fileStatus);

    expect(result).toEqual(["typescript", "vite", "biome"]);
    expect(dependencies.selectFn).toHaveBeenCalledWith(
      expect.objectContaining({ initialValue: "biome" }),
    );
    expect(dependencies.multiselectFn).toHaveBeenCalledWith(
      expect.objectContaining({ initialValues: ["typescript"] }),
    );
  });
});
