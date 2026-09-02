import { afterEach, describe, expect, it, vi } from "vitest";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { Command } = require("commander");
const { createProgram } = require("../bin/config");

describe("config default process handlers", () => {
  const registered = [];

  afterEach(() => {
    for (const [event, handler] of registered.splice(0)) {
      process.off(event, handler);
    }
    vi.restoreAllMocks();
  });

  it("依存関係が未指定なら既定のプロセスハンドラを登録する", () => {
    const onSpy = vi.spyOn(process, "on");
    onSpy.mockImplementation((event, handler) => {
      registered.push([event, handler]);
      return process;
    });

    createProgram({
      programRef: new Command(),
      fsModule: { existsSync: vi.fn().mockReturnValue(false) },
      pathModule: { join: (...parts) => parts.join("/") },
      setGlobalOptionsFn: vi.fn(),
      initCommandFn: vi.fn(),
      updateCommandFn: vi.fn(),
      listCommandFn: vi.fn(),
      packageJsonRef: { version: "1.0.0" },
      processRef: { cwd: () => "/workspace" },
    });

    expect(onSpy.mock.calls.map(([event]) => event)).toEqual(
      expect.arrayContaining([
        "SIGINT",
        "uncaughtException",
        "unhandledRejection",
      ]),
    );
  });
});
