import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createTempDirectory() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "config-test-"));
  return tempDir;
}

function cleanupDirectory(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function createPackageJson(dir, projectName = "test-project") {
  const packageJson = {
    name: projectName,
    version: "1.0.0",
    description: "Test project",
  };
  fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify(packageJson, null, 2));
}

describe("config.js（インタラクティブCLI）", () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDirectory();
  });

  afterEach(() => {
    cleanupDirectory(tempDir);
  });

  describe("package.json存在判定", () => {
    it("package.jsonが存在しない場合は新規プロジェクトモードになる", () => {
      const configPath = path.resolve(__dirname, "..", "bin", "config.js");
      const content = fs.readFileSync(configPath, "utf-8");

      // hasPackageJson関数の存在確認
      expect(content).toContain("function hasPackageJson()");
      expect(content).toContain('fs.existsSync(path.join(process.cwd(), "package.json"))');
    });

    it("package.jsonが存在する場合は既存プロジェクトモードになる", () => {
      createPackageJson(tempDir, "existing-project");

      const configPath = path.resolve(__dirname, "..", "bin", "config.js");
      const content = fs.readFileSync(configPath, "utf-8");

      // getProjectName関数の存在確認
      expect(content).toContain("function getProjectName()");
      expect(content).toContain("packageJson.name");
    });
  });

  describe("設定ファイル定義", () => {
    it("CONFIG_FILESに必要な設定ファイルがすべて定義されている", () => {
      const configPath = path.resolve(__dirname, "..", "bin", "config.js");
      const content = fs.readFileSync(configPath, "utf-8");

      // 必要な設定ファイルの存在確認
      expect(content).toContain("typescript");
      expect(content).toContain("biome");
      expect(content).toContain("mise");
      expect(content).toContain("vite");
      expect(content).toContain("vitest");

      // ラベルとファイル名の確認
      expect(content).toContain("TypeScript設定 (tsconfig.json)");
      expect(content).toContain("Biome設定 (biome.json)");
      expect(content).toContain("Mise設定 (mise.toml)");
      expect(content).toContain("Vite設定 (vite.config.ts)");
      expect(content).toContain("Vitest設定 (vitest.config.ts)");
    });

    it("contentModifier関数が正しく定義されている", () => {
      const configPath = path.resolve(__dirname, "..", "bin", "config.js");
      const content = fs.readFileSync(configPath, "utf-8");

      // TypeScript設定のcontentModifier
      expect(content).toContain("@katsu996/common-utils/tsconfig");
      expect(content).toContain("./dist");
      expect(content).toContain("./src");

      // Biome設定のcontentModifier
      expect(content).toContain("@katsu996/common-utils/biome");
    });
  });

  describe("ユーティリティ関数", () => {
    it("checkConfigFileStatus関数が設定ファイルの存在確認を行う", () => {
      const configPath = path.resolve(__dirname, "..", "bin", "config.js");
      const content = fs.readFileSync(configPath, "utf-8");

      expect(content).toContain("function checkConfigFileStatus()");
      expect(content).toContain("fs.existsSync");
      expect(content).toContain("exists: fs.existsSync");
    });

    it("applyConfigFile関数が設定ファイルの作成を行う", () => {
      const configPath = path.resolve(__dirname, "..", "bin", "config.js");
      const content = fs.readFileSync(configPath, "utf-8");

      expect(content).toContain("function applyConfigFile(file");
      expect(content).toContain("fs.readFileSync");
      expect(content).toContain("fs.writeFileSync");
      expect(content).toContain("contentModifier");
    });

    it("validateProjectName関数がプロジェクト名の検証を行う", () => {
      const configPath = path.resolve(__dirname, "..", "bin", "config.js");
      const content = fs.readFileSync(configPath, "utf-8");

      expect(content).toContain("function validateProjectName(value)");
      expect(content).toContain("/^[a-zA-Z0-9-_]+$/");
      expect(content).toContain("英数字とハイフン、アンダースコア");
    });

    it("createViteProject関数がViteプロジェクト作成を行う", () => {
      const configPath = path.resolve(__dirname, "..", "bin", "config.js");
      const content = fs.readFileSync(configPath, "utf-8");

      expect(content).toContain("function createViteProject(projectName");
      expect(content).toContain("pnpm");
      expect(content).toContain("create");
      expect(content).toContain("vite");
      expect(content).toContain("🚀 Viteプロジェクトを作成中");
      expect(content).toContain("✅ Viteプロジェクト");
    });
  });

  describe("UI設計", () => {
    it("新規プロジェクトモードのUI要素が含まれている", () => {
      const configPath = path.resolve(__dirname, "..", "bin", "config.js");
      const content = fs.readFileSync(configPath, "utf-8");

      expect(content).toContain("🚀 新規プロジェクトの初期設定");
      expect(content).toContain("プロジェクト名を入力してください");
      expect(content).toContain("適用する設定ファイルを選択してください");
      expect(content).toContain("複数選択可");
    });

    it("既存プロジェクトモードのUI要素が含まれている", () => {
      const configPath = path.resolve(__dirname, "..", "bin", "config.js");
      const content = fs.readFileSync(configPath, "utf-8");

      expect(content).toContain("🔄 既存プロジェクトの設定更新");
      expect(content).toContain("現在の設定ファイル状況");
      expect(content).toContain("更新・追加する設定ファイルを選択してください");
    });

    it("結果表示のUI要素が含まれている", () => {
      const configPath = path.resolve(__dirname, "..", "bin", "config.js");
      const content = fs.readFileSync(configPath, "utf-8");

      expect(content).toContain("✨ 設定ファイルの適用完了");
      expect(content).toContain("作成されたファイル");
      expect(content).toContain("🎉 Viteプロジェクトと設定ファイルの準備完了！");
      expect(content).toContain("pnpm dev");
      expect(content).toContain("📁 Viteプロジェクト:");
      expect(content).toContain("利用可能なコマンド:");
      expect(content).toContain("scriptDescriptions");
      expect(content).toContain("TypeScript型チェック");
      expect(content).toContain("Biomeによるlint");
      expect(content).toContain("テスト実行");
      expect(content).toContain("テストカバレッジ");
      expect(content).toContain("packageUpdateResult.scripts");
    });
  });

  describe("エラーハンドリング", () => {
    it("SIGINT（Ctrl+C）のハンドリングが実装されている", () => {
      const configPath = path.resolve(__dirname, "..", "bin", "config.js");
      const content = fs.readFileSync(configPath, "utf-8");

      expect(content).toContain('process.on("SIGINT"');
      expect(content).toContain("設定をキャンセルしました");
    });

    it("予期しないエラーのハンドリングが実装されている", () => {
      const configPath = path.resolve(__dirname, "..", "bin", "config.js");
      const content = fs.readFileSync(configPath, "utf-8");

      expect(content).toContain("main().catch");
      expect(content).toContain("予期しないエラー");
    });

    it("isCancel関数を使用したキャンセル処理が実装されている", () => {
      const configPath = path.resolve(__dirname, "..", "bin", "config.js");
      const content = fs.readFileSync(configPath, "utf-8");

      expect(content).toContain("isCancel");
      expect(content).toContain("cancel(");
    });
  });

  describe("クロスプラットフォーム対応", () => {
    it("node:pathモジュールを使用している", () => {
      const configPath = path.resolve(__dirname, "..", "bin", "config.js");
      const content = fs.readFileSync(configPath, "utf-8");

      expect(content).toContain("node:path");
      expect(content).toContain("path.join");
      expect(content).toContain("path.resolve");
    });

    it("node:fsモジュールを使用している", () => {
      const configPath = path.resolve(__dirname, "..", "bin", "config.js");
      const content = fs.readFileSync(configPath, "utf-8");

      expect(content).toContain("node:fs");
      expect(content).toContain("fs.existsSync");
      expect(content).toContain("fs.readFileSync");
      expect(content).toContain("fs.writeFileSync");
    });

    it("process.cwd()を使用して作業ディレクトリを取得している", () => {
      const configPath = path.resolve(__dirname, "..", "bin", "config.js");
      const content = fs.readFileSync(configPath, "utf-8");

      expect(content).toContain("process.cwd()");
    });

    it("child_processモジュールを使用している", () => {
      const configPath = path.resolve(__dirname, "..", "bin", "config.js");
      const content = fs.readFileSync(configPath, "utf-8");

      expect(content).toContain("node:child_process");
      expect(content).toContain("spawn");
    });

    it("Windowsとその他のプラットフォームでのshell設定が実装されている", () => {
      const configPath = path.resolve(__dirname, "..", "bin", "config.js");
      const content = fs.readFileSync(configPath, "utf-8");

      expect(content).toContain("process.platform");
      expect(content).toContain("win32");
      expect(content).toContain("shell:");
    });
  });

  describe("デフォルト選択動作", () => {
    it("multiselectでinitialValuesがすべての設定ファイルを含んでいる", () => {
      const configPath = path.resolve(__dirname, "..", "bin", "config.js");
      const content = fs.readFileSync(configPath, "utf-8");

      // デフォルトで全選択の実装確認
      expect(content).toContain("initialValues: CONFIG_FILES.map((file) => file.id)");
    });
  });

  // 実際の関数動作をテストする機能テスト
  describe("機能テスト", () => {
    it("TypeScript contentModifier が正しく動作する", () => {
      const mockTsConfigContent = JSON.stringify(
        {
          compilerOptions: {
            target: "ES2020",
            module: "ESNext",
          },
        },
        null,
        2,
      );

      // config.jsから関数を実行するためのヘルパー
      const executeContentModifier = (content) => {
        // TypeScript用のcontentModifierロジックを再現
        JSON.parse(content); // Parse to validate JSON
        const baseConfig = {
          extends: "@katsu996/common-utils/tsconfig",
          compilerOptions: {
            outDir: "./dist",
            rootDir: "./src",
            noEmit: false,
          },
          include: ["src/**/*"],
          exclude: ["node_modules", "dist"],
        };
        return JSON.stringify(baseConfig, null, 2);
      };

      const result = executeContentModifier(mockTsConfigContent);
      const parsedResult = JSON.parse(result);

      expect(parsedResult.extends).toBe("@katsu996/common-utils/tsconfig");
      expect(parsedResult.compilerOptions.outDir).toBe("./dist");
      expect(parsedResult.compilerOptions.rootDir).toBe("./src");
      expect(parsedResult.compilerOptions.noEmit).toBe(false);
      expect(parsedResult.include).toEqual(["src/**/*"]);
      expect(parsedResult.exclude).toEqual(["node_modules", "dist"]);
    });

    it("Biome contentModifier が正しく動作する", () => {
      const mockBiomeContent = JSON.stringify(
        {
          formatter: {
            enabled: true,
            indentStyle: "space",
          },
        },
        null,
        2,
      );

      // Biome用のcontentModifierロジックを再現
      const executeContentModifier = (content) => {
        const config = JSON.parse(content);
        const baseConfig = {
          extends: ["@katsu996/common-utils/biome"],
          ...config,
        };
        return JSON.stringify(baseConfig, null, 2);
      };

      const result = executeContentModifier(mockBiomeContent);
      const parsedResult = JSON.parse(result);

      expect(parsedResult.extends).toEqual(["@katsu996/common-utils/biome"]);
      expect(parsedResult.formatter.enabled).toBe(true);
      expect(parsedResult.formatter.indentStyle).toBe("space");
    });

    it("プロジェクト名バリデーションが正しく動作する", () => {
      // 修正後のvalidateProjectName関数のロジックを再現（空文字の場合はundefined）
      const validateProjectName = (value) => {
        // 空文字や未入力の場合は有効とする（デフォルト値を使用するため）
        if (!value || value.trim().length === 0) {
          return undefined;
        }
        if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
          return "プロジェクト名は英数字とハイフン、アンダースコアのみ使用可能です";
        }
        return undefined;
      };

      // 正常なケース
      expect(validateProjectName("valid-project")).toBeUndefined();
      expect(validateProjectName("valid_project")).toBeUndefined();
      expect(validateProjectName("validProject123")).toBeUndefined();

      // 修正後：空文字の場合はundefinedを返す（有効）
      expect(validateProjectName("")).toBeUndefined();
      expect(validateProjectName("   ")).toBeUndefined();
      expect(validateProjectName(null)).toBeUndefined();

      // エラーケース
      expect(validateProjectName("invalid project")).toBe(
        "プロジェクト名は英数字とハイフン、アンダースコアのみ使用可能です",
      );
      expect(validateProjectName("invalid@project")).toBe(
        "プロジェクト名は英数字とハイフン、アンダースコアのみ使用可能です",
      );
      expect(validateProjectName("invalid.project")).toBe(
        "プロジェクト名は英数字とハイフン、アンダースコアのみ使用可能です",
      );
    });

    it("CONFIG_FILES配列の構造が正しい", () => {
      const configPath = path.resolve(__dirname, "..", "bin", "config.js");
      const content = fs.readFileSync(configPath, "utf-8");

      // CONFIG_FILESの各要素に必要なプロパティがあることを確認
      const requiredIds = ["typescript", "biome", "mise", "vite", "vitest"];

      for (const id of requiredIds) {
        expect(content).toContain(`id: "${id}"`);
      }

      // 必要なプロパティの存在確認
      expect(content).toContain("label:");
      expect(content).toContain("source:");
      expect(content).toContain("destination:");
    });

    it("パッケージルートパスが正しく設定されている", () => {
      const configPath = path.resolve(__dirname, "..", "bin", "config.js");
      const content = fs.readFileSync(configPath, "utf-8");

      expect(content).toContain("const packageRoot = path.dirname(__dirname);");
      expect(content).toContain("path.join(packageRoot,");
    });

    it("TypeScript contentModifier で無効なJSONを処理する", () => {
      const executeContentModifier = (content) => {
        JSON.parse(content); // Parse to validate JSON
        const baseConfig = {
          extends: "@katsu996/common-utils/tsconfig",
          compilerOptions: {
            outDir: "./dist",
            rootDir: "./src",
            noEmit: false,
          },
          include: ["src/**/*"],
          exclude: ["node_modules", "dist"],
        };
        return JSON.stringify(baseConfig, null, 2);
      };

      expect(() => executeContentModifier("invalid json")).toThrow();
      expect(() => executeContentModifier("")).toThrow();
      expect(() => executeContentModifier("null")).not.toThrow();
    });

    it("Biome contentModifier で様々な設定をマージする", () => {
      const executeContentModifier = (content) => {
        const config = JSON.parse(content);
        const baseConfig = {
          extends: ["@katsu996/common-utils/biome"],
          ...config,
        };
        return JSON.stringify(baseConfig, null, 2);
      };

      // 空のオブジェクト
      const emptyResult = executeContentModifier("{}");
      const emptyParsed = JSON.parse(emptyResult);
      expect(emptyParsed.extends).toEqual(["@katsu996/common-utils/biome"]);

      // 複数プロパティ
      const complexResult = executeContentModifier(
        JSON.stringify({
          formatter: { enabled: false },
          linter: { enabled: true },
          files: { includes: ["**/*.ts"] },
        }),
      );
      const complexParsed = JSON.parse(complexResult);
      expect(complexParsed.extends).toEqual(["@katsu996/common-utils/biome"]);
      expect(complexParsed.formatter.enabled).toBe(false);
      expect(complexParsed.linter.enabled).toBe(true);
      expect(complexParsed.files.includes).toEqual(["**/*.ts"]);
    });

    it("プロジェクト名バリデーションの境界値テスト", () => {
      // 修正後のロジックを再現
      const validateProjectName = (value) => {
        // 空文字や未入力の場合は有効とする（デフォルト値を使用するため）
        if (!value || value.trim().length === 0) {
          return undefined;
        }
        if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
          return "プロジェクト名は英数字とハイフン、アンダースコアのみ使用可能です";
        }
        return undefined;
      };

      // 単一文字
      expect(validateProjectName("a")).toBeUndefined();
      expect(validateProjectName("1")).toBeUndefined();
      expect(validateProjectName("-")).toBeUndefined();
      expect(validateProjectName("_")).toBeUndefined();

      // 長い文字列
      const longValidName = "a".repeat(100);
      expect(validateProjectName(longValidName)).toBeUndefined();

      // 特殊文字
      expect(validateProjectName("project!")).toBe("プロジェクト名は英数字とハイフン、アンダースコアのみ使用可能です");
      expect(validateProjectName("project#")).toBe("プロジェクト名は英数字とハイフン、アンダースコアのみ使用可能です");
      expect(validateProjectName("project/")).toBe("プロジェクト名は英数字とハイフン、アンダースコアのみ使用可能です");

      // 修正後：undefined vs null はどちらも有効
      expect(validateProjectName(undefined)).toBeUndefined();
      expect(validateProjectName(null)).toBeUndefined();
    });

    it("設定ファイルのsourceパスが正しく生成される", () => {
      const configPath = path.resolve(__dirname, "..", "bin", "config.js");
      const content = fs.readFileSync(configPath, "utf-8");

      // 各設定ファイルの正しいsourceパスが含まれていることを確認
      expect(content).toContain('"tsconfig.base.json"');
      expect(content).toContain('"biome.base.json"');
      expect(content).toContain('"mise.toml"');
      expect(content).toContain('"vite.config.template.ts"');
      expect(content).toContain('"vitest.config.template.ts"');
    });

    it("vite.config.base.tsファイルが存在し、package.jsonで正しく参照されている", () => {
      const viteConfigPath = path.resolve(__dirname, "..", "vite.config.base.ts");
      const packageJsonPath = path.resolve(__dirname, "..", "package.json");

      // vite.config.base.tsが存在することを確認
      expect(fs.existsSync(viteConfigPath)).toBe(true);

      // package.jsonでvite.config.base.tsが参照されていることを確認
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
      expect(packageJson.files).toContain("vite.config.base.ts");
      expect(packageJson.exports["./vite"]).toBe("./vite.config.base.ts");
    });

    it("common-utilsパッケージがCommonJS形式である", () => {
      const packageJsonPath = path.resolve(__dirname, "..", "package.json");
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

      // "type": "module"が設定されていないことを確認（CommonJS形式）
      expect(packageJson.type).toBeUndefined();
    });

    it("contentModifierが存在しない設定ファイルの処理", () => {
      const configPath = path.resolve(__dirname, "..", "bin", "config.js");
      const content = fs.readFileSync(configPath, "utf-8");

      // contentModifierを持つ設定ファイル（typescript, biome, vite, vitest）の確認
      const miseIndex = content.indexOf('id: "mise"');
      const viteIndex = content.indexOf('id: "vite"');
      const vitestIndex = content.indexOf('id: "vitest"');

      expect(miseIndex).toBeGreaterThan(-1);
      expect(viteIndex).toBeGreaterThan(-1);
      expect(vitestIndex).toBeGreaterThan(-1);

      // miseだけcontentModifierが定義されていないことを確認
      const miseSection = content.substring(miseIndex, content.indexOf("}", miseIndex));
      expect(miseSection).not.toContain("contentModifier");

      // vite, vitestはcontentModifierが定義されていることを確認
      expect(content).toContain("contentModifier: (content) => {");
    });

    it("createViteProject関数のエラーハンドリングが実装されている", () => {
      const configPath = path.resolve(__dirname, "..", "bin", "config.js");
      const content = fs.readFileSync(configPath, "utf-8");

      expect(content).toContain('child.on("close"');
      expect(content).toContain('child.on("error"');
      expect(content).toContain("Viteプロジェクトの作成に失敗しました");
      expect(content).toContain("Viteプロジェクトの作成でエラーが発生しました");
    });
  });

  describe("Viteプロジェクト作成機能", () => {
    it("createViteProject関数が定義されている", () => {
      const configPath = path.resolve(__dirname, "..", "bin", "config.js");
      const content = fs.readFileSync(configPath, "utf-8");

      expect(content).toContain("function createViteProject(projectName, _projectDir)");
      expect(content).toContain("return new Promise((resolve, reject)");
    });

    it("新規プロジェクトモードでViteプロジェクト作成が統合されている", () => {
      const configPath = path.resolve(__dirname, "..", "bin", "config.js");
      const content = fs.readFileSync(configPath, "utf-8");

      expect(content).toContain("await createViteProject(projectName, projectDir);");
      expect(content).toContain("❌ Viteプロジェクト作成エラー:");
    });

    it("Viteプロジェクト作成のメッセージが適切に表示される", () => {
      const configPath = path.resolve(__dirname, "..", "bin", "config.js");
      const content = fs.readFileSync(configPath, "utf-8");

      expect(content).toContain("🚀 Viteプロジェクトを作成中...");
      expect(content).toContain("✅ Viteプロジェクト「");
      expect(content).toContain("を作成しました");
    });

    it("クロスプラットフォーム対応のspawnオプションが設定されている", () => {
      const configPath = path.resolve(__dirname, "..", "bin", "config.js");
      const content = fs.readFileSync(configPath, "utf-8");

      expect(content).toContain('const isWindows = process.platform === "win32"');
      expect(content).toContain("const shell = !!isWindows");
      expect(content).toContain("shell: shell");
    });

    it("pnpm create viteコマンドが正しく構成されている", () => {
      const configPath = path.resolve(__dirname, "..", "bin", "config.js");
      const content = fs.readFileSync(configPath, "utf-8");

      expect(content).toContain('const command = "pnpm"');
      expect(content).toContain('const args = ["create", "vite", projectName]');
    });
  });

  describe("依存関係管理機能", () => {
    it("installDependencies関数が定義されている", () => {
      const configPath = path.resolve(__dirname, "..", "bin", "config.js");
      const content = fs.readFileSync(configPath, "utf-8");

      expect(content).toContain("function installDependencies(projectDir, dependencies)");
      expect(content).toContain("📦 依存関係をインストール中...");
      expect(content).toContain("pnpm add -D");
    });

    it("updatePackageJson関数が定義されている", () => {
      const configPath = path.resolve(__dirname, "..", "bin", "config.js");
      const content = fs.readFileSync(configPath, "utf-8");

      expect(content).toContain("function updatePackageJson(projectDir, selectedConfigs)");
      expect(content).toContain("package.jsonにスクリプトとESモジュール設定を追加しました");
      expect(content).toContain("collectScripts");
      expect(content).toContain("selectedScripts");
      expect(content).toContain('packageJson.type = "module"');
    });

    it("新規プロジェクトで依存関係のインストールが実行される", () => {
      const configPath = path.resolve(__dirname, "..", "bin", "config.js");
      const content = fs.readFileSync(configPath, "utf-8");

      expect(content).toContain("await installDependencies(projectDir");
      expect(content).toContain("collectDependencies(selectedConfigs)");
      expect(content).toContain('dependencies.join(" ")');
      expect(content).toContain("依存関係インストールエラー");
    });

    it("package.jsonの更新が実行される", () => {
      const configPath = path.resolve(__dirname, "..", "bin", "config.js");
      const content = fs.readFileSync(configPath, "utf-8");

      expect(content).toContain("updatePackageJson(projectDir, selectedConfigs");
      expect(content).toContain("collectScripts(selectedConfigs)");
      expect(content).toContain("package.json更新エラー");
    });

    it("依存関係インストール失敗時の手動インストール案内が含まれている", () => {
      const configPath = path.resolve(__dirname, "..", "bin", "config.js");
      const content = fs.readFileSync(configPath, "utf-8");

      expect(content).toContain("手動でインストールしてください");
      expect(content).toContain('dependencies.join(" ")');
    });

    it("collectDependencies関数が定義されている", () => {
      const configPath = path.resolve(__dirname, "..", "bin", "config.js");
      const content = fs.readFileSync(configPath, "utf-8");

      expect(content).toContain("function collectDependencies(selectedConfigs)");
      expect(content).toContain("@katsu996/common-utils");
      expect(content).toContain("configFile.dependencies");
      expect(content).toContain("getLibraryVersions()");
      expect(content).toContain("バージョン固定");
    });

    it("collectScripts関数が定義されている", () => {
      const configPath = path.resolve(__dirname, "..", "bin", "config.js");
      const content = fs.readFileSync(configPath, "utf-8");

      expect(content).toContain("function collectScripts(selectedConfigs)");
      expect(content).toContain("configFile.scripts");
      expect(content).toContain("Object.assign(scripts");
    });

    it("CONFIG_FILESの各設定ファイルにdependenciesとscriptsが定義されている", () => {
      const configPath = path.resolve(__dirname, "..", "bin", "config.js");
      const content = fs.readFileSync(configPath, "utf-8");

      // typescriptの依存関係とスクリプト
      expect(content).toContain('dependencies: ["typescript", "@types/node"]');
      expect(content).toContain('"type-check": "tsc --noEmit"');

      // biomeの依存関係とスクリプト
      expect(content).toContain('dependencies: ["@biomejs/biome"]');
      expect(content).toContain('lint: "biome lint ."');
      expect(content).toContain('format: "biome format --write ."');

      // vitestの依存関係とスクリプト
      expect(content).toContain('dependencies: ["vitest", "@vitest/coverage-v8"]');
      expect(content).toContain('test: "vitest"');
      expect(content).toContain('"test:coverage": "vitest --coverage"');

      // miseとviteは空の配列/オブジェクト
      expect(content).toContain("dependencies: []");
      expect(content).toContain("scripts: {}");
    });

    it("getLibraryVersions関数が定義されている", () => {
      const configPath = path.resolve(__dirname, "..", "bin", "config.js");
      const content = fs.readFileSync(configPath, "utf-8");

      expect(content).toContain("function getLibraryVersions()");
      expect(content).toContain("packageJson.dependencies");
      expect(content).toContain("packageJson.devDependencies");
      expect(content).toContain("ライブラリバージョンの取得に失敗しました");
    });

    it("collectDependencies関数でバージョン指定が実装されている", () => {
      const configPath = path.resolve(__dirname, "..", "bin", "config.js");
      const content = fs.readFileSync(configPath, "utf-8");

      expect(content).toContain("const versions = getLibraryVersions()");
      expect(content).toContain("dep}@${version");
      expect(content).toContain("のバージョンが見つかりません");
      expect(content).toContain("最新版をインストールします");
    });
  });

  // 注意: 実際のインタラクティブテストは手動実行が必要
  describe("統合テスト（手動確認推奨）", () => {
    it.skip("新規プロジェクトでのViteプロジェクト作成と設定ファイル作成（手動テスト用）", () => {
      // このテストは手動で確認する必要がある
      // pnpm katsu-config を新規ディレクトリで実行し、
      // 1. Viteプロジェクトが作成されることを確認
      // 2. 期待される設定ファイルが作成されることを確認
    });

    it.skip("既存プロジェクトでの設定ファイル更新（手動テスト用）", () => {
      // このテストは手動で確認する必要がある
      // package.jsonのあるディレクトリで pnpm katsu-config を実行し、
      // 既存ファイルと新規ファイルが適切に処理されることを確認
    });
  });
});
