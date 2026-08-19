import { afterEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const display = require("../bin/cli/ui/display");
const { createPrompts } = require("../bin/cli/ui/prompts");
const configFiles = require("../bin/cli/config-files");
const packageUtils = require("../bin/cli/package");
const { setGlobalOptions } = require("../bin/cli/utils/global-options");

function createPromptDependencies(overrides = {}) {
  return {
    textFn: vi.fn().mockResolvedValue("project"),
    selectFn: vi.fn().mockResolvedValue("oxc"),
    multiselectFn: vi.fn().mockResolvedValue(["typescript"]),
    isCancelFn: vi.fn().mockReturnValue(false),
    cancelFn: vi.fn(),
    themeModule: {
      warning: vi.fn((text) => text),
      muted: vi.fn((text) => text),
    },
    configFiles: [
      { id: "typescript", label: "TypeScript設定" },
      { id: "oxc", label: "OXC設定" },
      { id: "biome", label: "Biome設定" },
    ],
    globalOptionsRef: { config: null },
    validateConfigIdsFn: vi.fn(),
    ...overrides,
  };
}

describe("display edge cases", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("イントロとアウトロを表示し、バージョン読込失敗時は unknown を返す", () => {
    display.showIntro();
    display.showOutro("completed");
    const readSpy = vi.spyOn(fs, "readFileSync").mockImplementation(() => {
      throw new Error("read failed");
    });

    expect(display.getPackageVersion()).toBe("unknown");
    expect(readSpy).toHaveBeenCalled();
  });
});

describe("prompt edge cases", () => {
  it("linter 選択が undefined の場合は設定選択を中止する", async () => {
    const dependencies = createPromptDependencies({
      selectFn: vi.fn().mockResolvedValue(undefined),
    });

    await expect(
      createPrompts(dependencies).getConfigFileSelection(),
    ).resolves.toBeNull();
    expect(dependencies.multiselectFn).not.toHaveBeenCalled();
  });

  it("既存プロジェクトのグローバル指定を検証して返す", async () => {
    const dependencies = createPromptDependencies({
      globalOptionsRef: { config: ["typescript"] },
    });

    await expect(
      createPrompts(dependencies).getExistingProjectConfigSelection([]),
    ).resolves.toEqual(["typescript"]);
    expect(dependencies.validateConfigIdsFn).toHaveBeenCalledWith([
      "typescript",
    ]);
  });

  it("既存プロジェクトの linter と複数選択のキャンセルを通知する", async () => {
    const linterCancel = Symbol("linter-cancel");
    const multiselectCancel = Symbol("multiselect-cancel");
    const dependencies = createPromptDependencies({
      selectFn: vi.fn().mockResolvedValue(linterCancel),
      multiselectFn: vi.fn().mockResolvedValue(multiselectCancel),
      isCancelFn: vi.fn(
        (value) => value === linterCancel || value === multiselectCancel,
      ),
    });

    await expect(
      createPrompts(dependencies).getExistingProjectConfigSelection([]),
    ).resolves.toBeNull();
    expect(dependencies.cancelFn).toHaveBeenCalledTimes(2);
  });
});

describe("config and package edge cases", () => {
  let temporaryDirectory;
  let originalDirectory;

  afterEach(() => {
    vi.restoreAllMocks();
    setGlobalOptions({
      dryRun: false,
      skipInstall: false,
      config: null,
      skipGitignore: false,
    });
    if (originalDirectory) process.chdir(originalDirectory);
    if (temporaryDirectory)
      fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  });

  it("gitignore の読み込み失敗を未存在として扱う", () => {
    originalDirectory = process.cwd();
    temporaryDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), "coverage-gitignore-"),
    );
    fs.writeFileSync(
      path.join(temporaryDirectory, ".gitignore"),
      "# 設定ファイル\n",
    );
    process.chdir(temporaryDirectory);
    const originalReadFileSync = fs.readFileSync;
    vi.spyOn(fs, "readFileSync").mockImplementation((filePath, ...args) => {
      if (filePath === path.join(temporaryDirectory, ".gitignore")) {
        throw new Error("permission denied");
      }
      return originalReadFileSync.call(fs, filePath, ...args);
    });

    const status = configFiles.checkConfigFileStatus();

    expect(status.find((file) => file.id === "gitignore")).toMatchObject({
      exists: false,
    });
  });

  it("dry-run 時に既存設定ファイルを更新対象として報告する", () => {
    temporaryDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), "coverage-apply-"),
    );
    const source = path.join(temporaryDirectory, "source.txt");
    const destination = path.join(temporaryDirectory, "target.txt");
    fs.writeFileSync(source, "content");
    fs.writeFileSync(destination, "old");
    setGlobalOptions({ dryRun: true });

    expect(
      configFiles.applyConfigFile(
        { source, destination: "target.txt" },
        temporaryDirectory,
      ),
    ).toMatchObject({
      success: true,
      dryRun: true,
      wouldCreate: false,
      wouldUpdate: true,
    });
  });

  it("scripts のない package.json に既存設定スクリプトを追加する", () => {
    originalDirectory = process.cwd();
    temporaryDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), "coverage-package-"),
    );
    fs.writeFileSync(
      path.join(temporaryDirectory, "package.json"),
      JSON.stringify({ name: "demo", version: "1.0.0" }),
    );
    process.chdir(temporaryDirectory);

    expect(
      packageUtils.updatePackageJsonExisting(["typescript"]),
    ).toMatchObject({
      success: true,
    });
    const updated = JSON.parse(
      fs.readFileSync(path.join(temporaryDirectory, "package.json"), "utf8"),
    );
    expect(updated.scripts).toMatchObject({ "type-check": "tsc --noEmit" });
  });
});
