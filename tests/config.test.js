import { spawn } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { globalOptions } = require("../bin/cli/utils/global-options");
const {
  CONFIG_FILES,
  getLibraryVersions,
  validateConfigIds,
  checkConfigFileStatus,
  applyConfigFile,
  updateGitignore,
  collectDependencies,
  collectScripts,
} = require("../bin/cli/config-files");
const {
  hasPackageJson,
  getProjectName,
  validateProjectName,
  updatePackageJsonExisting,
  updatePackageJson,
} = require("../bin/cli/package");
const {
  showHelpMessage: displayHelp,
  showConfigList: displayList,
  showAvailableCommands: displayAvailableCommands,
  showResults: displayConfigFileResults,
  showProjectResults: displayProjectResults,
  showConfigFileStatus: displayCurrentFileStatus,
  showCompletionMessage: displayCompletionMessage,
  getPackageVersion,
} = require("../bin/cli/ui/display");
const {
  getProjectNameInput,
  getConfigFileSelection,
  getExistingProjectConfigSelection,
} = require("../bin/cli/ui/prompts");

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

function executeCommand(command, args, cwd, input = null) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: input ? ["pipe", "pipe", "pipe"] : ["ignore", "pipe", "pipe"],
      shell: process.platform === "win32",
    });

    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr?.on("data", (data) => {
      stderr += data.toString();
    });

    if (input && child.stdin) {
      child.stdin.write(input);
      child.stdin.end();
    }

    child.on("close", (code) => {
      resolve({ code, stdout, stderr });
    });

    child.on("error", (error) => {
      reject(error);
    });
  });
}

async function runKatsuConfig(args, cwd, input = null) {
  const configPath = path.resolve(__dirname, "..", "bin", "config.js");
  return executeCommand("node", [configPath, ...args], cwd, input);
}

function configFileExists(dir, filename) {
  return fs.existsSync(path.join(dir, filename));
}

describe("config.js（インタラクティブCLI）", () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDirectory();
  });

  afterEach(() => {
    cleanupDirectory(tempDir);
  });

  describe("モジュール構成", () => {
    it("全モジュールが正しくエクスポートされている", () => {
      expect(globalOptions).toBeDefined();
      expect(CONFIG_FILES).toBeDefined();
      expect(getLibraryVersions).toBeDefined();
      expect(validateConfigIds).toBeDefined();
      expect(checkConfigFileStatus).toBeDefined();
      expect(applyConfigFile).toBeDefined();
      expect(updateGitignore).toBeDefined();
      expect(collectDependencies).toBeDefined();
      expect(collectScripts).toBeDefined();
      expect(hasPackageJson).toBeDefined();
      expect(getProjectName).toBeDefined();
      expect(validateProjectName).toBeDefined();
      expect(updatePackageJsonExisting).toBeDefined();
      expect(updatePackageJson).toBeDefined();
      expect(getPackageVersion).toBeDefined();
      expect(displayHelp).toBeDefined();
      expect(displayList).toBeDefined();
      expect(displayAvailableCommands).toBeDefined();
      expect(getProjectNameInput).toBeDefined();
      expect(getConfigFileSelection).toBeDefined();
      expect(getExistingProjectConfigSelection).toBeDefined();
      expect(displayConfigFileResults).toBeDefined();
      expect(displayProjectResults).toBeDefined();
      expect(displayCurrentFileStatus).toBeDefined();
      expect(displayCompletionMessage).toBeDefined();
    });
  });

  describe("設定ファイル定義", () => {
    it("CONFIG_FILESに必要な設定ファイルがすべて定義されている", () => {
      const configIds = CONFIG_FILES.map((f) => f.id);
      expect(configIds).toContain("typescript");
      expect(configIds).toContain("biome");
      expect(configIds).toContain("oxc");
      expect(configIds).toContain("mise");
      expect(configIds).toContain("vite");
      expect(configIds).toContain("vitest");
      expect(configIds).toContain("gitignore");

      const typeScript = CONFIG_FILES.find((f) => f.id === "typescript");
      expect(typeScript?.dependencies).toEqual(["typescript", "@types/node"]);
      expect(typeScript?.scripts?.["type-check"]).toBe("tsc --noEmit");

      const biome = CONFIG_FILES.find((f) => f.id === "biome");
      expect(biome?.dependencies).toEqual(["@biomejs/biome"]);
      expect(biome?.scripts?.lint).toBe("biome lint .");

      const vitest = CONFIG_FILES.find((f) => f.id === "vitest");
      expect(vitest?.dependencies).toEqual(["vitest", "@vitest/coverage-v8"]);

      const oxc = CONFIG_FILES.find((f) => f.id === "oxc");
      expect(oxc?.dependencies).toEqual(["oxlint", "oxfmt"]);
      expect(oxc?.scripts?.lint).toBe("oxlint");
      expect(oxc?.scripts?.format).toBe("oxfmt --write .");
      expect(oxc?.destination).toBe("oxlint.json");
    });

    it("collectDependenciesが指定した設定ファイルの依存関係を収集する", () => {
      const deps = collectDependencies(["typescript", "biome"]);
      expect(deps.length).toBeGreaterThan(0);
      expect(deps.some((d) => d.startsWith("typescript@"))).toBe(true);
    });

    it("collectDependenciesがoxcの依存関係を収集する", () => {
      const deps = collectDependencies(["oxc"]);
      expect(deps.some((d) => d.startsWith("oxlint@"))).toBe(true);
      expect(deps.some((d) => d.startsWith("oxfmt@"))).toBe(true);
    });

    it("collectScriptsが指定した設定ファイルのスクリプトを収集する", () => {
      const scripts = collectScripts(["typescript", "biome"]);
      expect(scripts["type-check"]).toBe("tsc --noEmit");
      expect(scripts.lint).toBe("biome lint .");
      expect(scripts.test).toBeUndefined();
    });

    it("validateConfigIdsが無効なIDでエラーを投げる", () => {
      const originalExit = process.exit;
      const originalConsoleError = console.error;
      let exitCode = null;
      console.error = () => {};
      process.exit = (code) => {
        exitCode = code;
      };
      try {
        validateConfigIds(["invalid"]);
        expect(exitCode).toBe(1);
      } finally {
        process.exit = originalExit;
        console.error = originalConsoleError;
      }
    });

    it("validateConfigIdsが有効なIDでエラーを投げない", () => {
      expect(() => validateConfigIds(["typescript", "biome"])).not.toThrow();
    });
  });

  describe("ユーティリティ関数", () => {
    it("hasPackageJsonが存在を正しく検出する", () => {
      const dirWithoutPkg = createTempDirectory();
      try {
        const originalCwd = process.cwd;
        process.cwd = () => dirWithoutPkg;
        expect(hasPackageJson()).toBe(false);
        process.cwd = () => tempDir;
        createPackageJson(tempDir);
        expect(hasPackageJson()).toBe(true);
        process.cwd = originalCwd;
      } finally {
        cleanupDirectory(dirWithoutPkg);
      }
    });

    it("validateProjectNameが正しく検証する", () => {
      expect(validateProjectName("valid-project")).toBeUndefined();
      expect(validateProjectName("valid_project")).toBeUndefined();
      expect(validateProjectName("validProject123")).toBeUndefined();
      expect(validateProjectName("")).toBeUndefined();
      expect(validateProjectName(null)).toBeUndefined();
      expect(validateProjectName("invalid project")).toBe(
        "プロジェクト名は英数字とハイフン、アンダースコアのみ使用可能です",
      );
      expect(validateProjectName("invalid@project")).toBe(
        "プロジェクト名は英数字とハイフン、アンダースコアのみ使用可能です",
      );
    });

    it("getPackageVersionがバージョン文字列を返す", () => {
      const version = getPackageVersion();
      expect(typeof version).toBe("string");
      expect(version).not.toBe("unknown");
    });

    it("getLibraryVersionsが依存関係のバージョンを返す", () => {
      const versions = getLibraryVersions();
      expect(versions["@katsu996/common-utils"]).toBeDefined();
      expect(versions["oxlint"]).toBeDefined();
      expect(versions["oxfmt"]).toBeDefined();
      expect(versions["typescript"]).toBeDefined();
    });

    it("applyConfigFileが設定ファイルを作成する", () => {
      const tsConfig = CONFIG_FILES.find((f) => f.id === "typescript");
      const result = applyConfigFile(tsConfig, tempDir);
      expect(result.success).toBe(true);
      expect(result.file).toBe("tsconfig.json");
      expect(configFileExists(tempDir, "tsconfig.json")).toBe(true);
    });

    it("checkConfigFileStatusがファイルの存在を報告する", () => {
      const status = checkConfigFileStatus();
      expect(Array.isArray(status)).toBe(true);
      expect(status.length).toBe(CONFIG_FILES.length);
      for (const s of status) {
        expect(s.exists).toBeDefined();
        expect(typeof s.exists).toBe("boolean");
      }
    });
  });

  describe("エラーハンドリング", () => {
    it("SIGINTハンドラが実装されている", () => {
      const errorsPath = path.resolve(__dirname, "..", "bin", "cli", "utils", "errors.js");
      const content = fs.readFileSync(errorsPath, "utf-8");
      expect(content).toContain("SIGINT");
      expect(content).toContain("設定をキャンセルしました");
    });

    it("setupProcessHandlersがconfig.jsで呼び出されている", () => {
      const configPath = path.resolve(__dirname, "..", "bin", "config.js");
      const content = fs.readFileSync(configPath, "utf-8");
      expect(content).toContain("setupProcessHandlers()");
    });
  });

  describe("CRIコマンド処理", () => {
    it("displayListが全設定ファイルを表示する", () => {
      const output = [];
      const originalLog = console.log;
      console.log = (...args) => output.push(args.join(" "));
      displayList();
      console.log = originalLog;
      const text = output.join(" ");
      expect(text).toContain("typescript");
      expect(text).toContain("biome");
      expect(text).toContain("oxc");
      expect(text).toContain("mise");
      expect(text).toContain("vite");
      expect(text).toContain("vitest");
    });

    it("displayHelpがヘルプを表示する", () => {
      const output = [];
      const originalLog = console.log;
      console.log = (...args) => output.push(args.join(" "));
      displayHelp();
      console.log = originalLog;
      const text = output.join(" ");
      expect(text).toContain("katsu-config");
      expect(text).toContain("--config");
      expect(text).toContain("--dry-run");
    });
  });

  describe("--configオプション", () => {
    describe("統合テスト", () => {
      describe("基本的な設定ファイル指定", () => {
        it("単一設定ファイル（typescript）が適用される", async () => {
          const testDir = createTempDirectory();
          try {
            createPackageJson(testDir);
            const result = await runKatsuConfig(["-c", "typescript"], testDir, "my-project\n");
            expect(result.code).not.toBe(1);
            expect(configFileExists(testDir, "tsconfig.json")).toBe(true);
            expect(configFileExists(testDir, "biome.jsonc")).toBe(false);
            expect(configFileExists(testDir, "vitest.config.ts")).toBe(false);
          } finally {
            cleanupDirectory(testDir);
          }
        });

        it("複数設定ファイル（typescript,biome）が適用される", async () => {
          const testDir = createTempDirectory();
          try {
            createPackageJson(testDir);
            const result = await runKatsuConfig(["-c", "typescript,biome"], testDir, "my-project\n");
            expect(result.code).not.toBe(1);
            expect(configFileExists(testDir, "tsconfig.json")).toBe(true);
            expect(configFileExists(testDir, "biome.jsonc")).toBe(true);
            expect(configFileExists(testDir, "vitest.config.ts")).toBe(false);
          } finally {
            cleanupDirectory(testDir);
          }
        });

        it("すべての設定ファイルが適用される", async () => {
          const testDir = createTempDirectory();
          try {
            createPackageJson(testDir);
            const result = await runKatsuConfig(
              ["-c", "typescript,oxc,mise,vite,vitest,gitignore"],
              testDir,
              "my-project\n",
            );
            expect(result.code).not.toBe(1);
            expect(configFileExists(testDir, "tsconfig.json")).toBe(true);
            expect(configFileExists(testDir, "oxlint.json")).toBe(true);
            expect(configFileExists(testDir, "mise.toml")).toBe(true);
            expect(configFileExists(testDir, "vite.config.ts")).toBe(true);
            expect(configFileExists(testDir, "vitest.config.ts")).toBe(true);
            expect(configFileExists(testDir, ".gitignore")).toBe(true);
          } finally {
            cleanupDirectory(testDir);
          }
        }, 10000);

        it("部分的な組み合わせ（typescript,vitest）が適用される", async () => {
          const testDir = createTempDirectory();
          try {
            createPackageJson(testDir);
            const result = await runKatsuConfig(["-c", "typescript,vitest"], testDir, "my-project\n");
            expect(result.code).not.toBe(1);
            expect(configFileExists(testDir, "tsconfig.json")).toBe(true);
            expect(configFileExists(testDir, "vitest.config.ts")).toBe(true);
            expect(configFileExists(testDir, "biome.jsonc")).toBe(false);
          } finally {
            cleanupDirectory(testDir);
          }
        }, 10000);
      });

      describe("エラーハンドリング", () => {
        it("無効なIDでエラーが発生する", async () => {
          const testDir = createTempDirectory();
          try {
            createPackageJson(testDir);
            const result = await runKatsuConfig(["-c", "invalid"], testDir);
            expect(result.code).toBe(1);
            expect(result.stderr).toContain("無効な設定ファイルID");
            expect(result.stderr).toContain("invalid");
          } finally {
            cleanupDirectory(testDir);
          }
        });

        it("--configオプションに引数がない場合エラーが発生する", async () => {
          const testDir = createTempDirectory();
          try {
            createPackageJson(testDir);
            const result = await runKatsuConfig(["-c"], testDir);
            expect(result.code).toBe(1);
            expect(result.stderr).toContain("error");
          } finally {
            cleanupDirectory(testDir);
          }
        });

        it("重複IDが許可される", async () => {
          const testDir = createTempDirectory();
          try {
            createPackageJson(testDir);
            const result = await runKatsuConfig(["-c", "typescript,typescript"], testDir, "my-project\n");
            expect(result.code).not.toBe(1);
            expect(configFileExists(testDir, "tsconfig.json")).toBe(true);
          } finally {
            cleanupDirectory(testDir);
          }
        });
      });

      describe("オプション組み合わせ", () => {
        it("--skip-installとの組み合わせで依存関係インストールがスキップされる", async () => {
          const testDir = createTempDirectory();
          try {
            createPackageJson(testDir);
            const result = await runKatsuConfig(["-c", "typescript,biome", "--skip-install"], testDir, "my-project\n");
            expect(result.code).not.toBe(1);
            expect(result.stdout).toContain("依存関係のインストールをスキップしました");
            expect(configFileExists(testDir, "tsconfig.json")).toBe(true);
            expect(configFileExists(testDir, "biome.jsonc")).toBe(true);
          } finally {
            cleanupDirectory(testDir);
          }
        });

        it("--dry-runとの組み合わせでプレビューモードが動作する", async () => {
          const testDir = createTempDirectory();
          try {
            createPackageJson(testDir);
            const result = await runKatsuConfig(["-c", "typescript,biome", "--dry-run"], testDir, "my-project\n");
            expect(result.code).not.toBe(1);
            expect(result.stdout).toContain("[DRY RUN]");
            expect(configFileExists(testDir, "tsconfig.json")).toBe(false);
            expect(configFileExists(testDir, "biome.jsonc")).toBe(false);
          } finally {
            cleanupDirectory(testDir);
          }
        });
      });
    });

    describe("エッジケース", () => {
      it("スペースを含むIDが正しく処理される", async () => {
        const testDir = createTempDirectory();
        try {
          createPackageJson(testDir);
          const result = await runKatsuConfig(["-c", "typescript, biome"], testDir, "my-project\n");
          expect(result.code).not.toBe(1);
          expect(configFileExists(testDir, "tsconfig.json")).toBe(true);
        } finally {
          cleanupDirectory(testDir);
        }
      }, 10000);

      it("空文字列のIDがフィルタリングされる", async () => {
        const testDir = createTempDirectory();
        try {
          createPackageJson(testDir);
          const result = await runKatsuConfig(["-c", "typescript,,biome"], testDir, "my-project\n");
          expect(result.code).not.toBe(1);
          expect(configFileExists(testDir, "tsconfig.json")).toBe(true);
          expect(configFileExists(testDir, "biome.jsonc")).toBe(true);
        } finally {
          cleanupDirectory(testDir);
        }
      });

      it("gitignoreファイルが存在する場合の処理", async () => {
        const testDir = createTempDirectory();
        try {
          createPackageJson(testDir);
          fs.writeFileSync(path.join(testDir, ".gitignore"), "node_modules/\n");
          const result = await runKatsuConfig(["-c", "typescript,gitignore"], testDir);
          expect(result.code).not.toBe(1);
          if (configFileExists(testDir, ".gitignore")) {
            const gitignoreContent = fs.readFileSync(path.join(testDir, ".gitignore"), "utf-8");
            expect(gitignoreContent).toContain("# 設定ファイル");
          }
        } finally {
          cleanupDirectory(testDir);
        }
      });

      it("gitignoreファイルが存在しない場合の処理", async () => {
        const testDir = createTempDirectory();
        try {
          createPackageJson(testDir);
          const result = await runKatsuConfig(["-c", "typescript,gitignore"], testDir);
          expect(result.code).not.toBe(1);
          expect(configFileExists(testDir, ".gitignore")).toBe(true);
        } finally {
          cleanupDirectory(testDir);
        }
      });

      it("既存のgitignoreに設定ファイルセクションがある場合の処理", async () => {
        const testDir = createTempDirectory();
        try {
          createPackageJson(testDir);
          fs.writeFileSync(path.join(testDir, ".gitignore"), "node_modules/\n# 設定ファイル\ntsconfig.json\n");
          const result = await runKatsuConfig(["-c", "biome,gitignore"], testDir);
          expect(result.code).not.toBe(1);
          if (configFileExists(testDir, ".gitignore")) {
            const gitignoreContent = fs.readFileSync(path.join(testDir, ".gitignore"), "utf-8");
            expect(gitignoreContent).toContain("biome.jsonc");
          }
        } finally {
          cleanupDirectory(testDir);
        }
      });

      it("複数の設定ファイルを指定した場合のgitignore更新", async () => {
        const testDir = createTempDirectory();
        try {
          createPackageJson(testDir);
          const result = await runKatsuConfig(["-c", "typescript,biome,vitest"], testDir);
          expect(result.code).not.toBe(1);
          if (configFileExists(testDir, ".gitignore")) {
            const gitignoreContent = fs.readFileSync(path.join(testDir, ".gitignore"), "utf-8");
            expect(gitignoreContent).toContain("tsconfig.json");
            expect(gitignoreContent).toContain("biome.jsonc");
            expect(gitignoreContent).toContain("vitest.config.ts");
          }
        } finally {
          cleanupDirectory(testDir);
        }
      }, 15000);
    });
  });
});
