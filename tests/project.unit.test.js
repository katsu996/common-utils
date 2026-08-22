import { beforeEach, describe, expect, it, vi } from "vitest";
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
    themeModule: { warning: vi.fn((message) => message) },
    globalOptionsRef: { dryRun: false, skipInstall: false },
    configFiles: [{ id: "typescript", filename: "tsconfig.json" }],
    applyConfigFileFn: vi
      .fn()
      .mockReturnValue({ success: true, file: "tsconfig.json" }),
    processRef: { platform: "linux", cwd: () => "/workspace" },
    ...overrides,
  };
}

describe("project service", () => {
  let dependencies;

  beforeEach(() => {
    dependencies = createDependencies();
  });

  it("Vite プロジェクトを作成し、成功時に完了を通知する", async () => {
    const child = createChild();
    dependencies.spawnFn.mockReturnValue(child);
    const service = createProjectService(dependencies);

    const creating = service.createViteProject("sample-app");
    child.emit("close", 0);
    await creating;

    expect(dependencies.spawnFn).toHaveBeenCalledWith(
      "pnpm",
      ["create", "vite", "sample-app"],
      { cwd: "/workspace", stdio: "inherit", shell: false },
    );
    expect(dependencies.logRef.success).toHaveBeenCalledWith(
      "Viteプロジェクト「sample-app」を作成しました",
    );
  });

  it("外部コマンドが失敗した場合は終了コードを含むエラーを返す", async () => {
    const child = createChild();
    dependencies.spawnFn.mockReturnValue(child);
    const service = createProjectService(dependencies);

    const creating = service.createViteProject("sample-app");
    child.emit("close", 1);

    await expect(creating).rejects.toThrow(
      "pnpm の実行に失敗しました (exit code: 1)",
    );
  });

  it("dry-run 時は Vite プロジェクトを作成しない", async () => {
    dependencies.globalOptionsRef.dryRun = true;
    const service = createProjectService(dependencies);

    await service.createViteProject("sample-app");

    expect(dependencies.spawnFn).not.toHaveBeenCalled();
    expect(dependencies.logRef.info).toHaveBeenCalledWith(
      "[DRY RUN] pnpm create vite sample-app",
    );
  });

  it("依存関係を導入し、成功時に完了を通知する", async () => {
    const child = createChild();
    dependencies.spawnFn.mockReturnValue(child);
    const service = createProjectService(dependencies);

    const installing = service.installDependencies("/workspace/app", [
      "typescript",
      "vitest",
    ]);
    child.emit("close", 0);
    await installing;

    expect(dependencies.spawnFn).toHaveBeenCalledWith(
      "pnpm",
      ["add", "-D", "--save-exact", "typescript", "vitest"],
      { cwd: "/workspace/app", stdio: "inherit", shell: false },
    );
    expect(dependencies.logRef.success).toHaveBeenCalledWith(
      "依存関係のインストールが完了しました",
    );
  });

  it("依存関係が空、または skip-install 時は外部コマンドを起動しない", async () => {
    const service = createProjectService(dependencies);
    await service.installDependencies("/workspace/app", []);

    dependencies.globalOptionsRef.skipInstall = true;
    await service.installDependencies("/workspace/app", ["typescript"]);

    expect(dependencies.spawnFn).not.toHaveBeenCalled();
    expect(dependencies.logRef.info).toHaveBeenCalledWith(
      "依存関係のインストールをスキップしました",
    );
  });

  it("gitignore と未知の設定 ID を除外して既知の設定のみ適用する", () => {
    const service = createProjectService(dependencies);

    const results = service.applyConfigFiles("/workspace/app", [
      "typescript",
      "gitignore",
      "not-found",
    ]);

    expect(dependencies.applyConfigFileFn).toHaveBeenCalledWith(
      { id: "typescript", filename: "tsconfig.json" },
      "/workspace/app",
    );
    expect(results).toEqual([{ success: true, file: "tsconfig.json" }]);
  });
});
