import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { Command } = require("commander");
const { createProgram, runCli } = require("../bin/config");

function createDependencies(overrides = {}) {
  return {
    fsModule: { existsSync: vi.fn().mockReturnValue(false) },
    pathModule: { join: (...parts) => parts.join("/") },
    programRef: new Command(),
    setupProcessHandlersFn: vi.fn(),
    setGlobalOptionsFn: vi.fn(),
    initCommandFn: vi.fn().mockResolvedValue(undefined),
    updateCommandFn: vi.fn().mockResolvedValue(undefined),
    listCommandFn: vi.fn().mockResolvedValue(undefined),
    packageJsonRef: { version: "1.2.3" },
    processRef: { cwd: () => "/workspace" },
    ...overrides,
  };
}

describe("config CLI", () => {
  let dependencies;

  beforeEach(() => {
    dependencies = createDependencies();
  });

  it("グローバルオプションを正規化して list コマンドへ渡す", async () => {
    const cli = createProgram(dependencies);

    await cli.parseAsync([
      "node",
      "katsu-config",
      "--config",
      "typescript, vite, ,vitest",
      "--dry-run",
      "--skip-install",
      "list",
    ]);

    expect(dependencies.setupProcessHandlersFn).toHaveBeenCalledOnce();
    expect(dependencies.setGlobalOptionsFn).toHaveBeenCalledWith({
      config: ["typescript", "vite", "vitest"],
      dryRun: true,
      skipInstall: true,
    });
    expect(dependencies.listCommandFn).toHaveBeenCalledOnce();
    expect(dependencies.initCommandFn).not.toHaveBeenCalled();
    expect(dependencies.updateCommandFn).not.toHaveBeenCalled();
  });

  it("コマンド未指定かつ package.json がある場合は update を実行する", async () => {
    dependencies.fsModule.existsSync.mockReturnValue(true);
    const cli = createProgram(dependencies);

    await cli.parseAsync(["node", "katsu-config"]);

    expect(dependencies.fsModule.existsSync).toHaveBeenCalledWith("/workspace/package.json");
    expect(dependencies.updateCommandFn).toHaveBeenCalledOnce();
    expect(dependencies.initCommandFn).not.toHaveBeenCalled();
  });

  it("コマンド未指定かつ package.json がない場合は init を実行する", async () => {
    const cli = createProgram(dependencies);

    await cli.parseAsync(["node", "katsu-config"]);

    expect(dependencies.initCommandFn).toHaveBeenCalledOnce();
    expect(dependencies.updateCommandFn).not.toHaveBeenCalled();
  });

  it("--config 未指定時は null と既定フラグを設定する", async () => {
    const cli = createProgram(dependencies);

    await cli.parseAsync(["node", "katsu-config", "list"]);

    expect(dependencies.setGlobalOptionsFn).toHaveBeenCalledWith({
      config: null,
      dryRun: false,
      skipInstall: false,
    });
  });

  it("予期しない CLI 例外を handleError と終了コードへ委譲する", async () => {
    const command = {
      description: vi.fn().mockReturnThis(),
      action: vi.fn().mockReturnThis(),
    };
    const programRef = {
      name: vi.fn().mockReturnThis(),
      description: vi.fn().mockReturnThis(),
      version: vi.fn().mockReturnThis(),
      helpOption: vi.fn().mockReturnThis(),
      option: vi.fn().mockReturnThis(),
      hook: vi.fn().mockReturnThis(),
      command: vi.fn().mockReturnValue(command),
      action: vi.fn().mockReturnThis(),
      parseAsync: vi.fn().mockRejectedValue(new Error("parse failed")),
    };
    const processRef = { cwd: () => "/workspace", exit: vi.fn() };
    const handleErrorFn = vi.fn();

    await runCli({
      ...dependencies,
      programRef,
      processRef,
      handleErrorFn,
      argv: ["node", "katsu-config"],
    });

    expect(handleErrorFn).toHaveBeenCalledWith(
      expect.objectContaining({ message: "parse failed" }),
    );
    expect(processRef.exit).toHaveBeenCalledWith(1);
  });

  it("必須値欠落エラーでは重複したエラー表示を行わず終了する", async () => {
    const command = {
      description: vi.fn().mockReturnThis(),
      action: vi.fn().mockReturnThis(),
    };
    const programRef = {
      name: vi.fn().mockReturnThis(),
      description: vi.fn().mockReturnThis(),
      version: vi.fn().mockReturnThis(),
      helpOption: vi.fn().mockReturnThis(),
      option: vi.fn().mockReturnThis(),
      hook: vi.fn().mockReturnThis(),
      command: vi.fn().mockReturnValue(command),
      action: vi.fn().mockReturnThis(),
      parseAsync: vi.fn().mockRejectedValue({ code: "commander.missingMandatoryOptionValue" }),
    };
    const processRef = { cwd: () => "/workspace", exit: vi.fn() };
    const handleErrorFn = vi.fn();

    await runCli({
      ...dependencies,
      programRef,
      processRef,
      handleErrorFn,
      argv: ["node", "katsu-config"],
    });

    expect(handleErrorFn).not.toHaveBeenCalled();
    expect(processRef.exit).toHaveBeenCalledWith(1);
  });
});
