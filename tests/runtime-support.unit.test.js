import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createSpinner, withSpinner } = require("../bin/cli/ui/spinner");
const { createErrorHandlers } = require("../bin/cli/utils/errors");
const { createListCommand } = require("../bin/cli/commands/list");
const { theme } = require("../bin/cli/ui/theme");
const { globalOptions, setGlobalOptions } = require("../bin/cli/utils/global-options");

function createSpinnerDependencies(spinner) {
  return {
    oraFn: vi.fn().mockReturnValue(spinner),
    themeModule: {
      muted: vi.fn((text) => `muted:${text}`),
      success: vi.fn((text) => `success:${text}`),
      error: vi.fn((text) => `error:${text}`),
    },
  };
}

describe("spinner", () => {
  it("スピナーを設定して生成する", () => {
    const spinner = { start: vi.fn(), succeed: vi.fn(), fail: vi.fn() };
    const dependencies = createSpinnerDependencies(spinner);

    expect(createSpinner("Loading", dependencies)).toBe(spinner);
    expect(dependencies.oraFn).toHaveBeenCalledWith({
      text: "muted:Loading",
      spinner: "dots",
      color: "cyan",
    });
  });

  it("成功時に開始・成功状態へ遷移し、処理結果を返す", async () => {
    const spinner = { start: vi.fn(), succeed: vi.fn(), fail: vi.fn() };
    const dependencies = createSpinnerDependencies(spinner);

    await expect(
      withSpinner(
        "Loading",
        async (receivedSpinner) => {
          expect(receivedSpinner).toBe(spinner);
          return "done";
        },
        dependencies,
      ),
    ).resolves.toBe("done");

    expect(spinner.start).toHaveBeenCalledOnce();
    expect(spinner.succeed).toHaveBeenCalledWith("success:Loading");
    expect(spinner.fail).not.toHaveBeenCalled();
  });

  it("失敗時に失敗状態へ遷移し、例外を再送出する", async () => {
    const spinner = { start: vi.fn(), succeed: vi.fn(), fail: vi.fn() };
    const dependencies = createSpinnerDependencies(spinner);
    const error = new Error("failed");

    await expect(
      withSpinner(
        "Loading",
        async () => {
          throw error;
        },
        dependencies,
      ),
    ).rejects.toBe(error);

    expect(spinner.fail).toHaveBeenCalledWith("error:Loading");
    expect(spinner.succeed).not.toHaveBeenCalled();
  });
});

describe("error handlers", () => {
  let handlers;
  let dependencies;

  beforeEach(() => {
    dependencies = {
      cancelFn: vi.fn(),
      themeModule: {
        warning: vi.fn((text) => `warning:${text}`),
        error: vi.fn((text) => `error:${text}`),
      },
      processRef: { on: vi.fn(), exit: vi.fn() },
      consoleRef: { error: vi.fn() },
    };
    handlers = createErrorHandlers(dependencies);
  });

  it("キャンセル例外をキャンセル表示と正常終了に変換する", () => {
    handlers.handleError({ name: "CancelError", message: "cancelled" });

    expect(dependencies.cancelFn).toHaveBeenCalledWith("warning:設定をキャンセルしました");
    expect(dependencies.processRef.exit).toHaveBeenCalledWith(0);
    expect(dependencies.consoleRef.error).not.toHaveBeenCalled();
  });

  it("通常の例外をエラー表示と異常終了に変換する", () => {
    handlers.handleError(new Error("boom"));

    expect(dependencies.consoleRef.error).toHaveBeenCalledWith("\nerror:予期しないエラー: boom");
    expect(dependencies.processRef.exit).toHaveBeenCalledWith(1);
  });

  it("SIGINT・未処理例外・未処理 Promise 拒否のハンドラを登録する", () => {
    handlers.setupProcessHandlers();

    const registrations = Object.fromEntries(
      dependencies.processRef.on.mock.calls.map(([event, handler]) => [event, handler]),
    );
    expect(Object.keys(registrations)).toEqual([
      "SIGINT",
      "uncaughtException",
      "unhandledRejection",
    ]);

    registrations.SIGINT();
    expect(dependencies.processRef.exit).toHaveBeenCalledWith(0);

    registrations.uncaughtException(new Error("uncaught"));
    expect(dependencies.processRef.exit).toHaveBeenCalledWith(1);

    registrations.unhandledRejection({ message: "rejected" });
    expect(dependencies.processRef.exit).toHaveBeenCalledWith(1);
  });
});

describe("list command and common state", () => {
  beforeEach(() => {
    setGlobalOptions({
      config: null,
      dryRun: false,
      skipInstall: false,
      skipGitignore: false,
    });
  });

  it("一覧コマンドが設定一覧表示を一度だけ呼び出す", () => {
    const showConfigListFn = vi.fn();

    createListCommand({ showConfigListFn })();

    expect(showConfigListFn).toHaveBeenCalledOnce();
  });

  it("グローバルオプションの部分更新で未指定の値を維持する", () => {
    setGlobalOptions({
      config: ["typescript"],
      dryRun: true,
      skipInstall: true,
      skipGitignore: true,
    });
    setGlobalOptions({ dryRun: false });

    expect(globalOptions).toEqual({
      config: ["typescript"],
      dryRun: false,
      skipInstall: true,
      skipGitignore: true,
    });
  });

  it("テーマ関数と記号を利用可能にする", () => {
    for (const formatter of [
      theme.brand,
      theme.heading,
      theme.success,
      theme.error,
      theme.warning,
      theme.info,
      theme.muted,
      theme.dim,
      theme.highlight,
      theme.path,
      theme.command,
      theme.label,
      theme.title,
    ]) {
      expect(formatter("text")).toContain("text");
    }
    expect(theme.symbol).toMatchObject({
      success: expect.any(String),
      error: expect.any(String),
      warning: expect.any(String),
      info: expect.any(String),
    });
  });
});
