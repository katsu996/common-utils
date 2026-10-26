import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createUpdateCommand } = require("../bin/cli/commands/update");

function createDependencies(overrides = {}) {
  return {
    outroFn: vi.fn(),
    isCancelFn: vi.fn().mockReturnValue(false),
    cancelFn: vi.fn(),
    logRef: { success: vi.fn() },
    themeModule: {
      success: vi.fn((message) => message),
      warning: vi.fn((message) => message),
    },
    showIntroFn: vi.fn(),
    showConfigFileStatusFn: vi.fn(),
    showResultsFn: vi.fn(),
    showAvailableCommandsFn: vi.fn(),
    getExistingProjectConfigSelectionFn: vi.fn().mockResolvedValue(["typescript", "gitignore"]),
    installDependenciesFn: vi.fn().mockResolvedValue(undefined),
    configFiles: [{ id: "typescript", filename: "tsconfig.json" }],
    checkConfigFileStatusFn: vi.fn().mockReturnValue([{ id: "typescript", exists: false }]),
    applyConfigFileFn: vi.fn().mockReturnValue({ success: true, file: "tsconfig.json" }),
    updateGitignoreFn: vi.fn().mockReturnValue({ success: true }),
    collectDependenciesFn: vi.fn().mockReturnValue(["typescript", "@types/node"]),
    updatePackageJsonExistingFn: vi.fn().mockReturnValue({
      success: true,
      scripts: { "type-check": "tsc --noEmit" },
    }),
    globalOptionsRef: { dryRun: false },
    handleErrorFn: vi.fn(),
    processRef: { cwd: () => "/workspace" },
    consoleRef: { log: vi.fn() },
    ...overrides,
  };
}

describe("updateCommand", () => {
  let dependencies;

  beforeEach(() => {
    dependencies = createDependencies();
  });

  it("キャンセルされた選択では設定を変更しない", async () => {
    const cancellation = Symbol("cancelled");
    dependencies.getExistingProjectConfigSelectionFn.mockResolvedValue(cancellation);
    dependencies.isCancelFn.mockImplementation((value) => value === cancellation);

    await createUpdateCommand(dependencies)();

    expect(dependencies.cancelFn).toHaveBeenCalledWith("設定をキャンセルしました");
    expect(dependencies.applyConfigFileFn).not.toHaveBeenCalled();
    expect(dependencies.outroFn).not.toHaveBeenCalled();
  });

  it("選択ヘルパーが null を返した場合は更新もエラー処理もしない", async () => {
    dependencies.getExistingProjectConfigSelectionFn.mockResolvedValue(null);

    await createUpdateCommand(dependencies)();

    expect(dependencies.cancelFn).toHaveBeenCalledWith("設定をキャンセルしました");
    expect(dependencies.applyConfigFileFn).not.toHaveBeenCalled();
    expect(dependencies.updateGitignoreFn).not.toHaveBeenCalled();
    expect(dependencies.handleErrorFn).not.toHaveBeenCalled();
    expect(dependencies.outroFn).not.toHaveBeenCalled();
  });

  it("新規設定と gitignore を適用し、必要な依存関係を導入する", async () => {
    await createUpdateCommand(dependencies)();

    expect(dependencies.applyConfigFileFn).toHaveBeenCalledWith(
      { id: "typescript", filename: "tsconfig.json" },
      "/workspace",
    );
    expect(dependencies.updateGitignoreFn).toHaveBeenCalledWith("/workspace", ["typescript"]);
    expect(dependencies.collectDependenciesFn).toHaveBeenCalledWith(["typescript"]);
    expect(dependencies.installDependenciesFn).toHaveBeenCalledWith("/workspace", [
      "typescript",
      "@types/node",
    ]);
    expect(dependencies.updatePackageJsonExistingFn).toHaveBeenCalledWith(["typescript"]);
    expect(dependencies.showAvailableCommandsFn).toHaveBeenCalledOnce();
    expect(dependencies.showResultsFn).toHaveBeenCalledWith([
      { success: true, file: "tsconfig.json", wasExisting: false },
      { success: true, file: ".gitignore", wasExisting: true },
    ]);
    expect(dependencies.outroFn).toHaveBeenCalledWith("設定が完了しました!");
  });

  it("既存の設定だけを選択した場合は依存関係を再導入しない", async () => {
    dependencies.getExistingProjectConfigSelectionFn.mockResolvedValue(["typescript"]);
    dependencies.checkConfigFileStatusFn.mockReturnValue([{ id: "typescript", exists: true }]);

    await createUpdateCommand(dependencies)();

    expect(dependencies.installDependenciesFn).not.toHaveBeenCalled();
    expect(dependencies.updatePackageJsonExistingFn).not.toHaveBeenCalled();
    expect(dependencies.showResultsFn).toHaveBeenCalledWith([
      { success: true, file: "tsconfig.json", wasExisting: true },
    ]);
  });

  it("gitignore 更新の失敗を結果として表示する", async () => {
    dependencies.getExistingProjectConfigSelectionFn.mockResolvedValue(["gitignore"]);
    dependencies.updateGitignoreFn.mockReturnValue({
      success: false,
      error: "write failed",
    });

    await createUpdateCommand(dependencies)();

    expect(dependencies.showResultsFn).toHaveBeenCalledWith([
      {
        success: false,
        file: ".gitignore",
        error: "write failed",
        wasExisting: true,
      },
    ]);
  });

  it("dry-run では注意メッセージを表示する", async () => {
    dependencies.globalOptionsRef.dryRun = true;

    await createUpdateCommand(dependencies)();

    expect(dependencies.consoleRef.log).toHaveBeenCalledOnce();
    expect(dependencies.logRef.success).toHaveBeenCalledWith(
      "[DRY RUN] 実際には変更は行われませんでした",
    );
  });

  it("更新中の例外を handleError に委譲する", async () => {
    const error = new Error("status failed");
    dependencies.checkConfigFileStatusFn.mockImplementation(() => {
      throw error;
    });

    await createUpdateCommand(dependencies)();

    expect(dependencies.handleErrorFn).toHaveBeenCalledWith(error);
  });
});
