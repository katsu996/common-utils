import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { setGlobalOptions } = require("../bin/cli/utils/global-options");
const display = require("../bin/cli/ui/display");

describe("display", () => {
  let logSpy;

  beforeEach(() => {
    setGlobalOptions({ dryRun: false, skipInstall: false, config: null });
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    setGlobalOptions({ dryRun: false, skipInstall: false, config: null });
    vi.restoreAllMocks();
  });

  it("パッケージバージョンを取得する", () => {
    expect(display.getPackageVersion()).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("プロジェクト情報と設定ファイルの存在状態を表示する", () => {
    display.showProjectInfo("/workspace/demo", true);
    display.showProjectInfo("/workspace/demo", false);
    display.showConfigFileStatus([
      { id: "typescript", destination: "tsconfig.json", exists: true },
      { id: "vite", destination: "vite.config.ts", exists: false },
    ]);

    expect(logSpy).toHaveBeenCalled();
  });

  it("更新・作成・失敗の結果を区分して表示する", () => {
    display.showResults([
      { success: true, file: "existing.json", wasExisting: true },
      { success: true, file: "new.json", wasExisting: false },
      { success: false, file: "failed.json", error: "write failed" },
    ]);

    expect(logSpy).toHaveBeenCalled();
  });

  it("dry-run の結果とプロジェクト結果を表示する", () => {
    setGlobalOptions({ dryRun: true });
    display.showResults([
      { success: true, file: "preview.json", wasExisting: false, dryRun: true },
    ]);
    display.showProjectResults(
      "/workspace/demo",
      [
        {
          success: true,
          file: "preview.json",
          wasExisting: false,
          dryRun: true,
        },
      ],
      { success: true, scripts: { test: "vitest" } },
    );

    expect(logSpy).toHaveBeenCalled();
  });

  it("利用可能なコマンド、完了メッセージ、バージョンを表示する", () => {
    display.showAvailableCommands({
      scripts: { test: "vitest", custom: "node custom.js" },
    });
    display.showAvailableCommands({ scripts: {} });
    display.showCompletionMessage("sample-app");
    display.showVersion("1.2.3");

    expect(logSpy).toHaveBeenCalled();
  });

  it("ヘルプと設定ファイル一覧を表示する", () => {
    display.showHelpMessage();
    display.showConfigList();

    expect(logSpy).toHaveBeenCalled();
  });
});
