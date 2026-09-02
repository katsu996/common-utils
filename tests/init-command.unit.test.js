import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createInitCommand } = require("../bin/cli/commands/init");

function createDependencies(overrides = {}) {
  return {
    pathModule: { join: (...parts) => parts.join("/") },
    outroFn: vi.fn(),
    themeModule: {
      error: vi.fn((message) => message),
      success: vi.fn((message) => message),
      warning: vi.fn((message) => message),
    },
    showIntroFn: vi.fn(),
    showProjectResultsFn: vi.fn(),
    showCompletionMessageFn: vi.fn(),
    getProjectNameInputFn: vi.fn().mockResolvedValue("sample-app"),
    getConfigFileSelectionFn: vi.fn().mockResolvedValue(["typescript"]),
    createViteProjectFn: vi.fn().mockResolvedValue(undefined),
    installDependenciesFn: vi.fn().mockResolvedValue(undefined),
    applyConfigFilesFn: vi
      .fn()
      .mockReturnValue([{ success: true, file: "tsconfig.json" }]),
    updateGitignoreFn: vi.fn().mockReturnValue({ success: true }),
    collectDependenciesFn: vi
      .fn()
      .mockReturnValue(["typescript", "@types/node"]),
    updatePackageJsonFn: vi
      .fn()
      .mockReturnValue({ success: true, addedScripts: ["type-check"] }),
    globalOptionsRef: { dryRun: false },
    handleErrorFn: vi.fn(),
    processRef: { cwd: () => "/workspace" },
    consoleRef: { error: vi.fn() },
    ...overrides,
  };
}

describe("initCommand", () => {
  let dependencies;

  beforeEach(() => {
    dependencies = createDependencies();
  });

  it("プロジェクト名の入力をキャンセルした場合は副作用なく終了する", async () => {
    dependencies.getProjectNameInputFn.mockResolvedValue(null);

    await createInitCommand(dependencies)();

    expect(dependencies.showIntroFn).toHaveBeenCalledOnce();
    expect(dependencies.getConfigFileSelectionFn).not.toHaveBeenCalled();
    expect(dependencies.createViteProjectFn).not.toHaveBeenCalled();
  });

  it("設定選択をキャンセルした場合はプロジェクトを作成しない", async () => {
    dependencies.getConfigFileSelectionFn.mockResolvedValue(null);

    await createInitCommand(dependencies)();

    expect(dependencies.createViteProjectFn).not.toHaveBeenCalled();
    expect(dependencies.installDependenciesFn).not.toHaveBeenCalled();
  });

  it("選択された設定でプロジェクトを初期化し、結果を表示する", async () => {
    await createInitCommand(dependencies)();

    expect(dependencies.createViteProjectFn).toHaveBeenCalledWith("sample-app");
    expect(dependencies.applyConfigFilesFn).toHaveBeenCalledWith(
      "/workspace/sample-app",
      ["typescript"],
    );
    expect(dependencies.updateGitignoreFn).toHaveBeenCalledWith(
      "/workspace/sample-app",
      ["typescript"],
    );
    expect(dependencies.collectDependenciesFn).toHaveBeenCalledWith([
      "typescript",
    ]);
    expect(dependencies.installDependenciesFn).toHaveBeenCalledWith(
      "/workspace/sample-app",
      ["typescript", "@types/node"],
    );
    expect(dependencies.updatePackageJsonFn).toHaveBeenCalledWith(
      "/workspace/sample-app",
      ["typescript"],
    );
    expect(dependencies.showProjectResultsFn).toHaveBeenCalledOnce();
    expect(dependencies.showCompletionMessageFn).toHaveBeenCalledWith(
      "sample-app",
    );
    expect(dependencies.outroFn).toHaveBeenCalledWith("設定が完了しました!");
  });

  it("dry-run 時は完了メッセージを表示しない", async () => {
    dependencies.globalOptionsRef.dryRun = true;

    await createInitCommand(dependencies)();

    expect(dependencies.showCompletionMessageFn).not.toHaveBeenCalled();
    expect(dependencies.outroFn).toHaveBeenCalledWith("設定が完了しました!");
  });

  it("gitignore 更新の失敗を表示しつつ、残りの初期化処理を継続する", async () => {
    dependencies.updateGitignoreFn.mockReturnValue({
      success: false,
      error: "write failed",
    });

    await createInitCommand(dependencies)();

    expect(dependencies.consoleRef.error).toHaveBeenCalledOnce();
    expect(dependencies.installDependenciesFn).toHaveBeenCalledOnce();
    expect(dependencies.updatePackageJsonFn).toHaveBeenCalledOnce();
    expect(dependencies.showCompletionMessageFn).not.toHaveBeenCalled();
    expect(dependencies.outroFn).toHaveBeenCalledWith(
      "一部の設定処理に失敗しました。出力を確認してください",
    );
  });

  it("設定ファイル適用の失敗時は完了メッセージの代わりに部分失敗を通知する", async () => {
    dependencies.applyConfigFilesFn.mockReturnValue([
      { success: false, file: "tsconfig.json", error: "write failed" },
    ]);

    await createInitCommand(dependencies)();

    expect(dependencies.showCompletionMessageFn).not.toHaveBeenCalled();
    expect(dependencies.outroFn).toHaveBeenCalledWith(
      "一部の設定処理に失敗しました。出力を確認してください",
    );
  });

  it("初期化中の例外を handleError に委譲する", async () => {
    const error = new Error("create failed");
    dependencies.createViteProjectFn.mockRejectedValue(error);

    await createInitCommand(dependencies)();

    expect(dependencies.handleErrorFn).toHaveBeenCalledWith(error);
  });
});
