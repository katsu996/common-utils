import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const packageUtils = require("../bin/cli/package");

function writePackageJson(directory, value) {
  fs.writeFileSync(
    path.join(directory, "package.json"),
    JSON.stringify(value, null, 2),
  );
}

describe("package utilities", () => {
  let temporaryDirectory;
  let originalDirectory;

  beforeEach(() => {
    originalDirectory = process.cwd();
    temporaryDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), "package-unit-"),
    );
  });

  afterEach(() => {
    process.chdir(originalDirectory);
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  });

  it("package.json の有無とプロジェクト名を取得する", () => {
    process.chdir(temporaryDirectory);
    expect(packageUtils.hasPackageJson()).toBe(false);
    expect(packageUtils.getProjectName()).toBe("unknown-project");

    writePackageJson(temporaryDirectory, {
      name: "demo-project",
      version: "1.0.0",
    });

    expect(packageUtils.hasPackageJson()).toBe(true);
    expect(packageUtils.getProjectName()).toBe("demo-project");
  });

  it("不正な package.json では既定のプロジェクト名を返す", () => {
    fs.writeFileSync(path.join(temporaryDirectory, "package.json"), "{");
    process.chdir(temporaryDirectory);

    expect(packageUtils.getProjectName()).toBe("unknown-project");
  });

  it("プロジェクト名を検証する", () => {
    expect(packageUtils.validateProjectName("")).toBeUndefined();
    expect(packageUtils.validateProjectName("a".repeat(256))).toBe(
      "プロジェクト名は255文字以内で入力してください",
    );
    expect(packageUtils.validateProjectName("invalid name")).toBe(
      "プロジェクト名は英数字とハイフン、アンダースコアのみ使用可能です",
    );
    expect(packageUtils.validateProjectName("valid_name-1")).toBeUndefined();
  });

  it("既存 package.json に設定スクリプトを追加し、依存関係のバージョンを正規化する", () => {
    writePackageJson(temporaryDirectory, {
      name: "demo-project",
      version: "1.0.0",
      dependencies: { commander: "15.0.0" },
      scripts: { existing: "node existing.js" },
    });
    process.chdir(temporaryDirectory);

    const result = packageUtils.updatePackageJsonExisting(["typescript"]);
    const updated = JSON.parse(
      fs.readFileSync(path.join(temporaryDirectory, "package.json"), "utf8"),
    );

    expect(result).toMatchObject({ success: true });
    expect(updated.scripts).toMatchObject({
      existing: "node existing.js",
      "type-check": "tsc --noEmit",
    });
    expect(updated.dependencies.commander).toBe("^15.0.0");
  });

  it("新規プロジェクトの package.json に ES モジュール設定とスクリプトを追加する", () => {
    writePackageJson(temporaryDirectory, {
      name: "demo-project",
      version: "1.0.0",
      devDependencies: { vitest: "4.1.10" },
    });

    const result = packageUtils.updatePackageJson(temporaryDirectory, [
      "vitest",
    ]);
    const updated = JSON.parse(
      fs.readFileSync(path.join(temporaryDirectory, "package.json"), "utf8"),
    );

    expect(result).toMatchObject({ success: true });
    expect(updated.type).toBe("module");
    expect(updated.scripts).toMatchObject({
      test: "vitest",
      "test:watch": "vitest --watch",
      "test:coverage": "vitest --coverage",
    });
    expect(updated.devDependencies.vitest).toBe("^4.1.10");
  });

  it("読み取りに失敗した場合は更新失敗結果を返す", () => {
    fs.writeFileSync(path.join(temporaryDirectory, "package.json"), "{");
    process.chdir(temporaryDirectory);

    expect(
      packageUtils.updatePackageJsonExisting(["typescript"]),
    ).toMatchObject({
      success: false,
    });
    expect(
      packageUtils.updatePackageJson(temporaryDirectory, ["typescript"]),
    ).toMatchObject({
      success: false,
    });
  });
});
