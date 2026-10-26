import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { CONFIG_FILES, packageRoot } = require("../bin/cli/config-files-data");

describe("config file definitions", () => {
  it("すべての設定 ID、保存先、依存関係、スクリプト定義を公開する", () => {
    expect(CONFIG_FILES.map((file) => file.id)).toEqual([
      "typescript",
      "biome",
      "oxc",
      "mise",
      "vite",
      "vitest",
      "gitignore",
    ]);

    for (const file of CONFIG_FILES) {
      expect(file.destination).toEqual(expect.any(String));
      expect(file.dependencies).toEqual(expect.any(Array));
      expect(file.scripts).toEqual(expect.any(Object));
    }
  });

  it("通常の設定ファイルは実在するテンプレートを参照する", () => {
    const standardFiles = CONFIG_FILES.filter((file) => !file.isSpecial);

    for (const file of standardFiles) {
      expect(file.source).toEqual(expect.any(String));
      expect(fs.existsSync(file.source)).toBe(true);
      expect(path.dirname(file.source).startsWith(packageRoot)).toBe(true);
    }

    expect(CONFIG_FILES.find((file) => file.id === "gitignore")).toMatchObject({
      source: null,
      isSpecial: true,
    });
  });

  it("各 contentModifier がテンプレート内容をそのまま返す", () => {
    const filesWithModifier = CONFIG_FILES.filter((file) => file.contentModifier);

    expect(filesWithModifier.map((file) => file.id)).toEqual([
      "typescript",
      "biome",
      "oxc",
      "vite",
      "vitest",
    ]);
    for (const file of filesWithModifier) {
      expect(file.contentModifier("sample-content")).toBe("sample-content");
    }
  });

  it("設定別の依存関係とスクリプトを正しく定義する", () => {
    const byId = Object.fromEntries(CONFIG_FILES.map((file) => [file.id, file]));

    expect(byId.typescript).toMatchObject({
      dependencies: ["typescript", "@types/node"],
      scripts: { "type-check": "tsc --noEmit" },
    });
    expect(byId.biome.scripts).toMatchObject({ lint: "biome lint ." });
    expect(byId.oxc.scripts).toMatchObject({ lint: "oxlint" });
    expect(byId.vitest).toMatchObject({
      dependencies: ["vitest", "@vitest/coverage-v8"],
      scripts: { test: "vitest", "test:coverage": "vitest --coverage" },
    });
  });
});
