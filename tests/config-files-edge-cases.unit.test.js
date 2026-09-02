import { afterEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const configFiles = require("../bin/cli/config-files");
const { setGlobalOptions } = require("../bin/cli/utils/global-options");

function createTemporaryDirectory() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "config-files-edge-"));
}

describe("config files edge cases", () => {
  let temporaryDirectory;
  let originalDirectory;

  afterEach(() => {
    vi.restoreAllMocks();
    setGlobalOptions({
      config: null,
      dryRun: false,
      skipInstall: false,
      skipGitignore: false,
    });
    if (originalDirectory) process.chdir(originalDirectory);
    if (temporaryDirectory)
      fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  });

  it("ライブラリバージョン読み込み失敗時は安全な代替バージョンを返す", () => {
    vi.spyOn(fs, "readFileSync").mockImplementation(() => {
      throw new Error("read failed");
    });
    const warningSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(configFiles.getLibraryVersions()).toEqual({
      "@katsu996/common-utils": "latest",
    });
    expect(warningSpy).toHaveBeenCalledTimes(2);
  });

  it("OXC と Biome の同時指定を終了コード 1 で拒否する", () => {
    expect(() => configFiles.validateConfigIds(["oxc", "biome"])).toThrow(
      'process.exit unexpectedly called with "1"',
    );
  });

  it("設定用マーカーを含む gitignore を既存状態として識別する", () => {
    originalDirectory = process.cwd();
    temporaryDirectory = createTemporaryDirectory();
    fs.writeFileSync(
      path.join(temporaryDirectory, ".gitignore"),
      "node_modules\n# 設定ファイル\ntsconfig.json\n",
    );
    process.chdir(temporaryDirectory);

    expect(
      configFiles
        .checkConfigFileStatus()
        .find((file) => file.id === "gitignore"),
    ).toMatchObject({ exists: true });
  });

  it("改行のない gitignore と後続セクションに安全にパターンを追加する", () => {
    temporaryDirectory = createTemporaryDirectory();
    const gitignorePath = path.join(temporaryDirectory, ".gitignore");
    fs.writeFileSync(gitignorePath, "node_modules");

    expect(
      configFiles.updateGitignore(temporaryDirectory, ["typescript"]),
    ).toMatchObject({
      success: true,
      added: ["tsconfig.json"],
    });
    expect(fs.readFileSync(gitignorePath, "utf8")).toContain(
      "node_modules\n\n# 設定ファイル\ntsconfig.json\n",
    );

    fs.writeFileSync(
      gitignorePath,
      "# 設定ファイル\ntsconfig.json\n# 別セクション\nnode_modules\n",
    );
    expect(
      configFiles.updateGitignore(temporaryDirectory, ["vitest"]),
    ).toMatchObject({
      success: true,
      added: ["vitest.config.ts"],
    });
    const updated = fs.readFileSync(gitignorePath, "utf8");
    expect(updated.indexOf("vitest.config.ts")).toBeLessThan(
      updated.indexOf("# 別セクション"),
    );
  });

  it("gitignore テンプレート読み込み失敗時も空の内容から更新する", () => {
    temporaryDirectory = createTemporaryDirectory();
    const originalReadFileSync = fs.readFileSync;
    const warningSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(fs, "readFileSync").mockImplementation((filePath, ...args) => {
      if (String(filePath).endsWith(".gitignore.template")) {
        throw new Error("template unavailable");
      }
      return originalReadFileSync.call(fs, filePath, ...args);
    });

    expect(
      configFiles.updateGitignore(temporaryDirectory, ["typescript"]),
    ).toMatchObject({
      success: true,
      added: ["tsconfig.json"],
    });
    expect(
      fs.readFileSync(path.join(temporaryDirectory, ".gitignore"), "utf8"),
    ).toContain("tsconfig.json");
    expect(warningSpy).toHaveBeenCalledOnce();
  });
});
