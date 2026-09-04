import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { setGlobalOptions } = require("../bin/cli/utils/global-options");
const configFiles = require("../bin/cli/config-files");

function createTemporaryDirectory() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "config-files-unit-"));
}

describe("config files", () => {
  let temporaryDirectory;
  let originalDirectory;

  beforeEach(() => {
    originalDirectory = process.cwd();
    temporaryDirectory = createTemporaryDirectory();
    setGlobalOptions({ dryRun: false, skipInstall: false, config: null });
  });

  afterEach(() => {
    process.chdir(originalDirectory);
    setGlobalOptions({ dryRun: false, skipInstall: false, config: null });
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  });

  it("ライブラリバージョンを取得し、設定 ID を検証する", () => {
    const versions = configFiles.getLibraryVersions();

    expect(versions["@katsu996/common-utils"]).toMatch(/^\d+\.\d+\.\d+$/);
    expect(() => configFiles.validateConfigIds(["typescript", "vitest"])).not.toThrow();
    expect(() => configFiles.validateConfigIds(["missing-config"])).toThrow(
      'process.exit unexpectedly called with "1"',
    );
  });

  it("一時プロジェクト上で設定ファイルの存在状態を報告する", () => {
    process.chdir(temporaryDirectory);
    fs.writeFileSync(path.join(temporaryDirectory, "tsconfig.json"), "{}");

    const status = configFiles.checkConfigFileStatus();
    const typeScriptStatus = status.find((file) => file.id === "typescript");

    expect(typeScriptStatus).toMatchObject({ exists: true });
    expect(status.some((file) => file.exists === false)).toBe(true);
  });

  it("設定ファイルを生成し、dry-run では書き込まない", () => {
    const sourcePath = path.join(temporaryDirectory, "template.txt");
    fs.writeFileSync(sourcePath, "template-content");
    const file = {
      id: "test",
      source: sourcePath,
      destination: "generated.txt",
      contentModifier: (content) => `${content}-modified`,
    };

    const result = configFiles.applyConfigFile(file, temporaryDirectory);

    expect(result).toEqual({ success: true, file: "generated.txt" });
    expect(fs.readFileSync(path.join(temporaryDirectory, "generated.txt"), "utf8")).toBe(
      "template-content-modified",
    );

    setGlobalOptions({ dryRun: true });
    const preview = configFiles.applyConfigFile(
      { ...file, destination: "preview.txt" },
      temporaryDirectory,
    );

    expect(preview).toMatchObject({
      success: true,
      dryRun: true,
      wouldCreate: true,
    });
    expect(fs.existsSync(path.join(temporaryDirectory, "preview.txt"))).toBe(false);
  });

  it("設定ファイルの source 不備を失敗結果として返す", () => {
    expect(
      configFiles.applyConfigFile({ id: "test", destination: "missing.txt" }, temporaryDirectory),
    ).toMatchObject({ success: false, error: "source path is not defined" });
    expect(
      configFiles.applyConfigFile(
        {
          id: "test",
          source: path.join(temporaryDirectory, "not-found"),
          destination: "missing.txt",
        },
        temporaryDirectory,
      ),
    ).toMatchObject({ success: false, file: "missing.txt" });
  });

  it("gitignore に不足パターンを追加し、再実行時は重複追加しない", () => {
    fs.writeFileSync(path.join(temporaryDirectory, ".gitignore"), "node_modules\n");

    const first = configFiles.updateGitignore(temporaryDirectory, ["typescript", "vitest"]);
    const content = fs.readFileSync(path.join(temporaryDirectory, ".gitignore"), "utf8");
    const second = configFiles.updateGitignore(temporaryDirectory, ["typescript", "vitest"]);

    expect(first).toMatchObject({ success: true });
    expect(first.added.length).toBeGreaterThan(0);
    expect(content).toContain("# 設定ファイル");
    expect(second).toEqual({ success: true, added: [] });
  });

  it("gitignore のみ選択かつ未存在の場合はテンプレートから作成する", () => {
    const gitignorePath = path.join(temporaryDirectory, ".gitignore");

    const result = configFiles.updateGitignore(temporaryDirectory, ["gitignore"]);

    expect(result).toEqual({ success: true, added: [] });
    expect(fs.existsSync(gitignorePath)).toBe(true);
    expect(fs.readFileSync(gitignorePath, "utf8")).toContain("node_modules");
  });

  it("gitignore の dry-run と書き込み失敗を扱う", () => {
    setGlobalOptions({ dryRun: true });
    const preview = configFiles.updateGitignore(temporaryDirectory, ["typescript"]);

    expect(preview).toMatchObject({ success: true, dryRun: true });
    expect(fs.existsSync(path.join(temporaryDirectory, ".gitignore"))).toBe(false);

    setGlobalOptions({ dryRun: false });
    const failure = configFiles.updateGitignore(
      path.join(temporaryDirectory, "missing-directory"),
      ["typescript"],
    );
    expect(failure).toMatchObject({ success: false });
  });

  it("依存関係を宣言済みの正確なバージョンで重複なく収集する", () => {
    const versions = configFiles.getLibraryVersions();
    const dependencies = configFiles.collectDependencies(["typescript", "vitest", "typescript"]);
    const scripts = configFiles.collectScripts(["typescript", "vitest", "typescript"]);

    expect(dependencies).toEqual([
      `typescript@${versions.typescript}`,
      `@types/node@${versions["@types/node"]}`,
      `vitest@${versions.vitest}`,
      `@vitest/coverage-v8@${versions["@vitest/coverage-v8"]}`,
    ]);
    expect(scripts).toMatchObject({
      "type-check": "tsc --noEmit",
      test: "vitest",
    });
  });

  it("バージョン不明の依存関係はエラーとして報告する", () => {
    expect(() => configFiles.collectDependencies(["typescript"], {})).toThrow(
      '依存関係 "typescript" のバージョンを解決できませんでした',
    );
    expect(() => configFiles.collectDependencies(["mise"], { typescript: "7.0.2" })).not.toThrow();
  });
});
