import { describe, expect, it, vi } from "vitest";
import { EventEmitter } from "node:events";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createProjectService } = require("../bin/cli/services/project");

function createChild() {
  const child = new EventEmitter();
  child.on = vi.fn(child.on.bind(child));
  return child;
}

function createDependencies(overrides = {}) {
  return {
    spawnFn: vi.fn(),
    logRef: { info: vi.fn(), success: vi.fn() },
    themeModule: { warning: vi.fn((message) => `warning:${message}`) },
    globalOptionsRef: { dryRun: false, skipInstall: false },
    configFiles: [
      { id: "typescript", destination: "tsconfig.json" },
      { id: "vitest", destination: "vitest.config.ts" },
    ],
    applyConfigFileFn: vi.fn((file) => ({
      success: true,
      file: file.destination,
    })),
    processRef: { platform: "linux", cwd: () => "/workspace" },
    ...overrides,
  };
}

describe("project service failure paths", () => {
  it("子プロセスの error イベントを呼び出し元へ再送出する", async () => {
    const child = createChild();
    const dependencies = createDependencies({
      spawnFn: vi.fn().mockReturnValue(child),
    });
    const service = createProjectService(dependencies);
    const error = new Error("spawn failed");

    const executing = service.spawnAsync("pnpm", ["--version"], "/workspace");
    child.emit("error", error);

    await expect(executing).rejects.toBe(error);
  });

  it("Windows では shell と dry-run 用のパイプ出力を利用する", async () => {
    const child = createChild();
    const dependencies = createDependencies({
      spawnFn: vi.fn().mockReturnValue(child),
      processRef: { platform: "win32", cwd: () => "C:/workspace" },
      globalOptionsRef: { dryRun: true, skipInstall: false },
    });
    const service = createProjectService(dependencies);

    const executing = service.spawnAsync("pnpm", ["--version"], "C:/workspace");
    child.emit("close", 0);
    await executing;

    expect(dependencies.spawnFn).toHaveBeenCalledWith("pnpm", ["--version"], {
      cwd: "C:/workspace",
      stdio: "pipe",
      shell: true,
    });
  });

  it("依存関係導入の dry-run ではコマンドを実行せずプレビューを表示する", async () => {
    const dependencies = createDependencies({
      globalOptionsRef: { dryRun: true, skipInstall: false },
    });
    const service = createProjectService(dependencies);

    await service.installDependencies("/workspace/app", [
      "typescript",
      "vitest",
    ]);

    expect(dependencies.spawnFn).not.toHaveBeenCalled();
    expect(dependencies.themeModule.warning).toHaveBeenCalledWith(
      "[DRY RUN] pnpm add -D --save-exact typescript vitest",
    );
    expect(dependencies.logRef.info).toHaveBeenCalledWith(
      "warning:[DRY RUN] pnpm add -D --save-exact typescript vitest",
    );
  });

  it("設定ファイル適用の失敗結果を正常結果とともに保持する", () => {
    const dependencies = createDependencies({
      applyConfigFileFn: vi.fn((file) =>
        file.id === "vitest"
          ? { success: false, file: file.destination, error: "write failed" }
          : { success: true, file: file.destination },
      ),
    });
    const service = createProjectService(dependencies);

    const results = service.applyConfigFiles("/workspace/app", [
      "typescript",
      "vitest",
      "gitignore",
    ]);

    expect(results).toEqual([
      { success: true, file: "tsconfig.json" },
      { success: false, file: "vitest.config.ts", error: "write failed" },
    ]);
  });
});
