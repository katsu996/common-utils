#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { intro, outro, multiselect, text, isCancel, cancel, log } = require("@clack/prompts");
const pc = require("picocolors");

const packageRoot = path.dirname(__dirname);

// グローバルオプション
const globalOptions = {
  list: false,
  config: null, // カンマ区切りの設定ファイルIDの配列
  skipInstall: false,
  dryRun: false,
};

// パッケージのバージョンを取得する関数
function getPackageVersion() {
  try {
    const packageJsonPath = path.join(packageRoot, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    return packageJson.version;
  } catch {
    return "unknown";
  }
}

// ヘルプを表示する関数
function displayHelp() {
  console.log(`
${pc.inverse(" @katsu996/common-utils 設定ツール ")}
${pc.bold("使用方法:")}
  katsu-config [オプション]

${pc.bold("オプション:")}
  -v, --version          バージョン番号を出力
  -h, --help             このヘルプメッセージを表示
  -l, --list             利用可能な設定ファイルの一覧を表示
  -c, --config <ids>     適用する設定ファイルを指定（カンマ区切り）
                         例: --config typescript,biome
  --skip-install         依存関係のインストールをスキップ
  -n, --dry-run          実際の変更を行わずにプレビュー

${pc.bold("説明:")}
  このツールは、プロジェクトに設定ファイルを追加・更新するためのツールです。
  
  - 新規プロジェクトの場合: Viteプロジェクトを作成し、設定ファイルを適用します
  - 既存プロジェクトの場合: 既存の設定ファイルを更新または新規追加します

${pc.bold("設定ファイルID:")}
  typescript    TypeScript設定 (tsconfig.json)
  biome         Biome設定 (biome.jsonc)
  mise          Mise設定 (mise.toml)
  vite          Vite設定 (vite.config.ts)
  vitest        Vitest設定 (vitest.config.ts)
  gitignore     .gitignore設定
`);
}

// 設定ファイル一覧を表示する関数
function displayList() {
  console.log(`
${pc.inverse(" 利用可能な設定ファイル ")}
`);
  for (const file of CONFIG_FILES) {
    console.log(`${pc.cyan(file.id).padEnd(12)} - ${file.label}`);
    console.log(`            ${pc.gray(`→ ${file.destination}`)}`);
    if (file.dependencies && file.dependencies.length > 0) {
      console.log(`            ${pc.yellow(`依存関係: ${file.dependencies.join(", ")}`)}`);
    }
    console.log();
  }
}

// 設定ファイルIDの検証を行う関数
function validateConfigIds(configIds) {
  const validIds = CONFIG_FILES.map((f) => f.id);
  const invalidIds = configIds.filter((id) => !validIds.includes(id));
  if (invalidIds.length > 0) {
    console.error(`${pc.red("❌ エラー:")} 無効な設定ファイルID: ${invalidIds.join(", ")}`);
    console.error(`  利用可能なID: ${validIds.join(", ")}`);
    process.exit(1);
  }
}

// --configオプションを処理する関数
function handleConfigOption(args, index) {
  if (index + 1 < args.length) {
    const configIds = args[index + 1]
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
    globalOptions.config = configIds;
    return index + 1; // 次のインデックスを返す
  }
  console.error(`${pc.red("❌ エラー:")} --configオプションには設定ファイルIDが必要です`);
  console.error(`  例: ${pc.cyan("--config typescript,biome")}`);
  process.exit(1);
}

// 即座に終了するオプション（-v, -h, -l）を処理する関数
function handleExitOptions(arg) {
  if (arg === "-v" || arg === "--version") {
    console.log(getPackageVersion());
    process.exit(0);
  }

  if (arg === "-h" || arg === "--help") {
    displayHelp();
    process.exit(0);
  }

  if (arg === "-l" || arg === "--list") {
    displayList();
    process.exit(0);
  }

  return false; // 処理されなかった場合
}

// フラグオプションを処理する関数
function handleFlagOptions(arg) {
  if (arg === "--skip-install") {
    globalOptions.skipInstall = true;
    return true;
  }

  if (arg === "-n" || arg === "--dry-run") {
    globalOptions.dryRun = true;
    return true;
  }

  return false; // 処理されなかった場合
}

// コマンドライン引数を解析する関数
function parseArguments() {
  const args = process.argv.slice(2);

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    // 即座に終了するオプション
    if (handleExitOptions(arg)) {
      continue; // process.exit()が呼ばれるので実際には到達しない
    }

    // --configオプション
    if (arg === "-c" || arg === "--config") {
      i = handleConfigOption(args, i);
      continue;
    }

    // フラグオプション
    handleFlagOptions(arg);
  }

  // 設定ファイルIDの検証
  if (globalOptions.config) {
    validateConfigIds(globalOptions.config);
  }
}

// 本プロジェクトのpackage.jsonからライブラリバージョンを取得する関数
function getLibraryVersions() {
  try {
    const packageJsonPath = path.join(packageRoot, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    return {
      "@katsu996/common-utils": packageJson.version,
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };
  } catch (error) {
    console.warn(`警告: ライブラリバージョンの取得に失敗しました: ${error.message}`);
    console.warn("代替処理: 基本的なバージョンを使用します。");
    // package.jsonの読み込みが失敗した場合の代替値
    // 通常この状況は発生しないが、安全のため最小限のデフォルト値を提供
    return {
      "@katsu996/common-utils": "latest",
    };
  }
}

// 設定ファイルの定義
const CONFIG_FILES = [
  {
    id: "typescript",
    label: "TypeScript設定 (tsconfig.json)",
    source: path.resolve(packageRoot, "tsconfig.base.json"),
    destination: "tsconfig.json",
    dependencies: ["typescript", "@types/node"],
    scripts: {
      "type-check": "tsc --noEmit",
    },
    contentModifier: (content) => {
      // base.jsonファイルの内容をそのまま使用（ライブラリ非依存）
      return content;
    },
  },
  {
    id: "biome",
    label: "Biome設定 (biome.jsonc)",
    source: path.resolve(packageRoot, "biome.base.jsonc"),
    destination: "biome.jsonc",
    dependencies: ["@biomejs/biome"],
    scripts: {
      lint: "biome lint .",
      "lint:fix": "biome lint --write .",
      check: "biome check .",
      "check:fix": "biome check --write .",
      format: "biome format --write .",
      "format:check": "biome format .",
    },
    contentModifier: (content) => {
      // base.jsonファイルの内容をそのまま使用（ライブラリ非依存）
      return content;
    },
  },
  {
    id: "mise",
    label: "Mise設定 (mise.toml)",
    source: path.resolve(packageRoot, "mise.toml"),
    destination: "mise.toml",
    dependencies: [],
    scripts: {},
  },
  {
    id: "vite",
    label: "Vite設定 (vite.config.ts)",
    source: path.resolve(packageRoot, "vite.config.base.ts"),
    destination: "vite.config.ts",
    dependencies: [],
    scripts: {},
    contentModifier: (content) => {
      // base.tsファイルの内容を使用
      return content;
    },
  },
  {
    id: "vitest",
    label: "Vitest設定 (vitest.config.ts)",
    source: path.resolve(packageRoot, "vitest.config.base.ts"),
    destination: "vitest.config.ts",
    dependencies: ["vitest", "@vitest/coverage-v8"],
    scripts: {
      test: "vitest",
      "test:watch": "vitest --watch",
      "test:coverage": "vitest --coverage",
    },
    contentModifier: (content) => {
      // base.tsファイルの内容を使用
      return content;
    },
  },
  {
    id: "gitignore",
    label: ".gitignore設定",
    source: null,
    destination: ".gitignore",
    dependencies: [],
    scripts: {},
    isSpecial: true, // 特別な処理が必要なファイル
  },
];

// package.jsonの存在確認
function hasPackageJson() {
  return fs.existsSync(path.join(process.cwd(), "package.json"));
}

// package.jsonからプロジェクト名を取得
function getProjectName() {
  try {
    const packageJsonPath = path.join(process.cwd(), "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    return packageJson.name || "unknown-project";
  } catch {
    return "unknown-project";
  }
}

// 設定ファイルの存在状況を確認
function checkConfigFileStatus() {
  return CONFIG_FILES.map((file) => {
    if (file.id === "gitignore") {
      // .gitignoreの場合は、ファイルの存在と設定ファイルセクションの存在を確認
      const gitignorePath = path.join(process.cwd(), file.destination);
      const exists = fs.existsSync(gitignorePath);
      if (exists) {
        try {
          const content = fs.readFileSync(gitignorePath, "utf8");
          // 設定ファイルセクションが存在するか確認
          return {
            ...file,
            exists: content.includes("# 設定ファイル"),
          };
        } catch {
          return { ...file, exists: false };
        }
      }
      return { ...file, exists: false };
    }
    return {
      ...file,
      exists: fs.existsSync(path.join(process.cwd(), file.destination)),
    };
  });
}

// 設定ファイルを作成/更新（プロジェクトフォルダ内）
function applyConfigFile(file, projectDir = process.cwd()) {
  const { source, destination, contentModifier } = file;
  const fullDestination = path.join(projectDir, destination);

  try {
    let content = fs.readFileSync(source, "utf8");
    if (contentModifier) {
      content = contentModifier(content);
    }

    if (globalOptions.dryRun) {
      // dry-runモード: ファイルの存在確認のみ
      const exists = fs.existsSync(fullDestination);
      return { success: true, file: destination, dryRun: true, wouldCreate: !exists, wouldUpdate: exists };
    }

    fs.writeFileSync(fullDestination, content, "utf8");
    return { success: true, file: destination };
  } catch (error) {
    return { success: false, file: destination, error: error.message };
  }
}

// .gitignoreから既存のパターンを取得する関数
function getExistingGitignorePatterns(gitignoreContent) {
  const existingPatterns = new Set();
  const lines = gitignoreContent.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      existingPatterns.add(trimmed);
    }
  }
  return existingPatterns;
}

// .gitignoreに新しいパターンを追加する関数
function addPatternsToGitignore(content, newPatterns) {
  const hasConfigSection = content.includes("# 設定ファイル");

  if (!hasConfigSection) {
    // セクションがない場合は追加
    const separator = content && !content.endsWith("\n") ? "\n" : "";
    return `${content}${separator}\n# 設定ファイル\n${newPatterns.join("\n")}\n`;
  }

  // セクションがある場合は、そのセクションの最後に追加
  const sectionIndex = content.indexOf("# 設定ファイル");
  if (sectionIndex === -1) {
    // セクションが見つからない場合は末尾に追加
    return `${content}\n${newPatterns.join("\n")}\n`;
  }

  // セクションの終わりを見つける（次のセクションまたはファイルの終わり）
  const afterSection = content.substring(sectionIndex);
  const nextSectionMatch = afterSection.match(/\n# [^\n]/);
  const sectionEnd = nextSectionMatch ? sectionIndex + nextSectionMatch.index : content.length;

  // セクションの最後にパターンを追加
  const sectionContent = content.substring(sectionIndex, sectionEnd);
  const patternText = newPatterns.join("\n");
  const newline = sectionContent.endsWith("\n") ? "" : "\n";

  return `${content.substring(0, sectionEnd)}${newline}${patternText}\n${content.substring(sectionEnd)}`;
}

// .gitignoreテンプレートを取得する関数
function getTemplateGitignore() {
  try {
    const templateGitignorePath = path.join(packageRoot, ".gitignore.template");
    if (fs.existsSync(templateGitignorePath)) {
      return fs.readFileSync(templateGitignorePath, "utf8");
    }
  } catch (error) {
    // テンプレートの読み込みに失敗した場合は空文字を返す
    console.warn(`警告: .gitignoreテンプレートの読み込みに失敗しました: ${error.message}`);
  }
  return "";
}

// .gitignoreファイルを更新する関数
function updateGitignore(projectDir, selectedConfigs) {
  try {
    const gitignorePath = path.join(projectDir, ".gitignore");
    let gitignoreContent = "";

    // .gitignoreが存在する場合は読み込む
    if (fs.existsSync(gitignorePath)) {
      gitignoreContent = fs.readFileSync(gitignorePath, "utf8");
    } else {
      // 存在しない場合は、このパッケージの.gitignoreをテンプレートとして使用
      gitignoreContent = getTemplateGitignore();
    }

    // 選択された設定ファイルのパターンを取得
    const configFilePatterns = selectedConfigs
      .map((configId) => {
        const configFile = CONFIG_FILES.find((f) => f.id === configId);
        return configFile?.destination;
      })
      .filter(Boolean);

    // 既存のパターンを確認
    const existingPatterns = getExistingGitignorePatterns(gitignoreContent);

    // 新しいパターンをフィルタリング
    const newPatterns = configFilePatterns.filter((pattern) => !existingPatterns.has(pattern));

    // 新しいパターンがある場合のみ更新
    if (newPatterns.length > 0) {
      if (globalOptions.dryRun) {
        log.info(`[DRY RUN] .gitignoreに設定ファイルを追加します: ${newPatterns.join(", ")}`);
        return { success: true, added: newPatterns, dryRun: true };
      }

      const updatedContent = addPatternsToGitignore(gitignoreContent, newPatterns);
      fs.writeFileSync(gitignorePath, updatedContent, "utf8");
      log.success(`✅ .gitignoreに設定ファイルを追加しました: ${newPatterns.join(", ")}`);
      return { success: true, added: newPatterns };
    }

    return { success: true, added: [] };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// プロジェクト名のバリデーション
function validateProjectName(value) {
  // 空文字や未入力の場合は有効とする（デフォルト値を使用するため）
  if (!value || value.trim().length === 0) {
    return undefined;
  }
  if (value.length > 255) {
    return "プロジェクト名は255文字以内で入力してください";
  }
  if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
    return "プロジェクト名は英数字とハイフン、アンダースコアのみ使用可能です";
  }
  return undefined;
}

// Viteプロジェクトを作成する関数
function createViteProject(projectName, _projectDir) {
  return new Promise((resolve, reject) => {
    log.info("🚀 Viteプロジェクトを作成中...");

    // クロスプラットフォーム対応: WindowsではCOMSPECを使用、それ以外はshを使用
    const isWindows = process.platform === "win32";
    const shell = !!isWindows;
    const command = "pnpm";
    const args = ["create", "vite", projectName];

    const child = spawn(command, args, {
      cwd: process.cwd(),
      stdio: "inherit",
      shell: shell,
    });

    child.on("close", (code) => {
      if (code === 0) {
        log.success(`✅ Viteプロジェクト「${projectName}」を作成しました`);
        resolve();
      } else {
        reject(new Error(`Viteプロジェクトの作成に失敗しました (exit code: ${code})`));
      }
    });

    child.on("error", (error) => {
      reject(new Error(`Viteプロジェクトの作成でエラーが発生しました: ${error.message}`));
    });
  });
}

// 選択された設定ファイルから依存関係を収集する関数（バージョン固定）
function collectDependencies(selectedConfigs) {
  const versions = getLibraryVersions();
  const dependencies = new Set();

  // 常に含める基本依存関係（本パッケージは常に最新版）
  dependencies.add("@katsu996/common-utils@latest");

  for (const configId of selectedConfigs) {
    const configFile = CONFIG_FILES.find((f) => f.id === configId);
    if (configFile?.dependencies) {
      for (const dep of configFile.dependencies) {
        const version = versions[dep];
        if (version) {
          dependencies.add(`${dep}@${version}`);
        } else {
          // バージョンが見つからない場合は警告を出して、パッケージ名のみ追加
          console.warn(`警告: ${dep} のバージョンが見つかりません。最新版をインストールします。`);
          dependencies.add(dep);
        }
      }
    }
  }

  return Array.from(dependencies);
}

// 選択された設定ファイルからスクリプトを収集する関数
function collectScripts(selectedConfigs) {
  const scripts = {};

  for (const configId of selectedConfigs) {
    const configFile = CONFIG_FILES.find((f) => f.id === configId);
    if (configFile?.scripts) {
      Object.assign(scripts, configFile.scripts);
    }
  }

  return scripts;
}

// 依存関係をインストールする関数
function installDependencies(projectDir, dependencies) {
  return new Promise((resolve, reject) => {
    log.info("📦 依存関係をインストール中...");

    // クロスプラットフォーム対応
    const isWindows = process.platform === "win32";
    const shell = !!isWindows;
    const command = "pnpm";
    const args = ["add", "-D", ...dependencies];

    const child = spawn(command, args, {
      cwd: projectDir,
      stdio: "inherit",
      shell: shell,
    });

    child.on("close", (code) => {
      if (code === 0) {
        log.success("✅ 依存関係のインストールが完了しました");
        resolve();
      } else {
        reject(new Error(`依存関係のインストールに失敗しました (exit code: ${code})`));
      }
    });

    child.on("error", (error) => {
      reject(new Error(`依存関係のインストールでエラーが発生しました: ${error.message}`));
    });
  });
}

// package.jsonを修正する関数（既存プロジェクト用）
function updatePackageJsonExisting(selectedConfigs) {
  try {
    const packageJsonPath = path.join(process.cwd(), "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    // 選択された設定ファイルに基づいてスクリプトを収集
    const selectedScripts = collectScripts(selectedConfigs);

    // scriptsセクションに動的にスクリプトを追加
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }

    packageJson.scripts = {
      ...packageJson.scripts,
      ...selectedScripts,
    };

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    log.success("✅ package.jsonにスクリプトを追加しました");

    return { success: true, scripts: selectedScripts };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// package.jsonを修正する関数
function updatePackageJson(projectDir, selectedConfigs) {
  try {
    const packageJsonPath = path.join(projectDir, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    // 選択された設定ファイルに基づいてスクリプトを収集
    const selectedScripts = collectScripts(selectedConfigs);

    // scriptsセクションに動的にスクリプトを追加
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }

    packageJson.scripts = {
      ...packageJson.scripts,
      ...selectedScripts,
    };

    // ESモジュール対応
    packageJson.type = "module";

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    log.success("✅ package.jsonにスクリプトとESモジュール設定を追加しました");

    return { success: true, scripts: selectedScripts };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 利用可能なコマンドを表示する関数
function displayAvailableCommands(packageUpdateResult) {
  if (
    !(packageUpdateResult.success && packageUpdateResult.scripts) ||
    Object.keys(packageUpdateResult.scripts).length === 0
  ) {
    return;
  }

  console.log();
  console.log("利用可能なコマンド:");

  const scriptDescriptions = {
    "type-check": "TypeScript型チェック",
    lint: "Biomeによるlint",
    "lint:fix": "lint問題を自動修正",
    check: "Biomeによる総合チェック",
    "check:fix": "check問題を自動修正",
    format: "コードフォーマット",
    "format:check": "フォーマット確認",
    test: "テスト実行",
    "test:watch": "テスト監視モード",
    "test:coverage": "テストカバレッジ",
  };

  for (const scriptName of Object.keys(packageUpdateResult.scripts)) {
    const description = scriptDescriptions[scriptName] || "カスタムスクリプト";
    console.log(`  ${pc.cyan(`pnpm ${scriptName}`).padEnd(22)} - ${description}`);
  }
  console.log();
}

// プロジェクト入力を取得する関数
async function getProjectNameInput() {
  const projectNameInput = await text({
    message: "プロジェクト名を入力してください",
    placeholder: "my-project",
    defaultValue: "my-project",
    validate: validateProjectName,
  });

  const projectName = projectNameInput?.trim() ? projectNameInput.trim() : "my-project";

  if (isCancel(projectName)) {
    cancel("設定をキャンセルしました");
    return null;
  }

  return projectName;
}

// 設定ファイル選択を取得する関数
async function getConfigFileSelection() {
  // --configオプションが指定されている場合は対話をスキップ
  if (globalOptions.config) {
    return globalOptions.config;
  }

  const selectedConfigs = await multiselect({
    message:
      "適用する設定ファイルを選択してください（複数選択可）\n" +
      pc.yellow("操作方法: Spaceキーで選択/選択解除、Enterキーで確定"),
    options: CONFIG_FILES.map((file) => ({
      value: file.id,
      label: file.label,
      hint: file.destination,
    })),
    initialValues: CONFIG_FILES.map((file) => file.id),
  });

  if (isCancel(selectedConfigs)) {
    cancel("設定をキャンセルしました");
    return null;
  }

  return selectedConfigs;
}

// Viteプロジェクトを作成する（新規プロジェクト用）
async function createViteProjectForNew(projectName, projectDir) {
  if (!globalOptions.dryRun) {
    try {
      await createViteProject(projectName, projectDir);
    } catch (error) {
      console.error(`${pc.red("❌ Viteプロジェクト作成エラー:")} ${error.message}`);
      return false;
    }
  } else {
    log.info(`[DRY RUN] Viteプロジェクト「${projectName}」を作成します`);
  }
  return true;
}

// 依存関係をインストールする（新規プロジェクト用）
async function installDependenciesForNew(projectDir, dependencies, projectName) {
  const shouldSkipInstall = globalOptions.skipInstall || globalOptions.dryRun;
  if (shouldSkipInstall) {
    if (globalOptions.dryRun) {
      log.info(`[DRY RUN] 依存関係をインストールします: ${dependencies.join(", ")}`);
    } else {
      log.info("⏭️  依存関係のインストールをスキップしました");
    }
    return;
  }

  try {
    await installDependencies(projectDir, dependencies);
  } catch (error) {
    console.error(`${pc.red("❌ 依存関係インストールエラー:")} ${error.message}`);
    console.log(
      `${pc.yellow("⚠️ 手動でインストールしてください:")} cd ${projectName} && pnpm add -D ${dependencies.join(" ")}`,
    );
  }
}

// package.jsonを更新する（新規プロジェクト用）
function updatePackageJsonForNew(projectDir, selectedConfigs) {
  if (!globalOptions.dryRun) {
    const packageUpdateResult = updatePackageJson(projectDir, selectedConfigs);
    if (!packageUpdateResult.success) {
      console.error(`${pc.red("❌ package.json更新エラー:")} ${packageUpdateResult.error}`);
    }
    return packageUpdateResult;
  }

  log.info(`[DRY RUN] package.jsonを更新します`);
  return { success: true, scripts: collectScripts(selectedConfigs) };
}

// 完了メッセージを表示する（新規プロジェクト用）
function displayCompletionMessage(projectName) {
  if (globalOptions.dryRun) {
    log.success("🎉 [DRY RUN] 実際には変更は行われませんでした");
  } else {
    log.success("🎉 Viteプロジェクトと設定ファイルの準備完了！以下のコマンドで開発を開始できます：");
    console.log(`  ${pc.cyan(`cd ${projectName}`)}`);
    console.log(`  ${pc.cyan("pnpm dev")}`);
  }
}

// 新規プロジェクト用の初期設定
async function initializeNewProject() {
  if (globalOptions.dryRun) {
    log.info("🚀 新規プロジェクトの初期設定 [DRY RUN]");
  } else {
    log.info("🚀 新規プロジェクトの初期設定");
  }

  const projectName = await getProjectNameInput();
  if (!projectName) {
    return false;
  }

  const selectedConfigs = await getConfigFileSelection();
  if (!selectedConfigs) {
    return false;
  }

  const projectDir = path.join(process.cwd(), projectName);

  // Viteプロジェクトを作成
  if (!(await createViteProjectForNew(projectName, projectDir))) {
    return false;
  }

  // 設定ファイルの適用
  const results = [];
  for (const configId of selectedConfigs) {
    const configFile = CONFIG_FILES.find((f) => f.id === configId);
    if (configFile) {
      const result = applyConfigFile(configFile, projectDir);
      results.push(result);
    }
  }

  // .gitignoreの更新
  const gitignoreResult = updateGitignore(projectDir, selectedConfigs);
  if (!gitignoreResult.success) {
    console.error(`${pc.red("❌ .gitignore更新エラー:")} ${gitignoreResult.error}`);
  }

  // 依存関係のインストール
  const dependencies = collectDependencies(selectedConfigs);
  await installDependenciesForNew(projectDir, dependencies, projectName);

  // package.jsonの更新
  const packageUpdateResult = updatePackageJsonForNew(projectDir, selectedConfigs);

  // 結果表示
  displayProjectResults(projectDir, results, packageUpdateResult);
  displayCompletionMessage(projectName);

  return true;
}

// プロジェクト結果を表示する関数
function displayProjectResults(projectDir, results, packageUpdateResult) {
  if (globalOptions.dryRun) {
    log.success("✨ 設定ファイルの適用プレビュー [DRY RUN]");
  } else {
    log.success("✨ 設定ファイルの適用完了");
  }
  console.log();
  console.log(`📁 Viteプロジェクト: ${pc.cyan(projectDir)}`);
  console.log();

  const successFiles = results.filter((r) => r.success);
  if (successFiles.length > 0) {
    console.log(globalOptions.dryRun ? "作成されるファイル:" : "作成されたファイル:");
    for (const r of successFiles) {
      if (r.dryRun) {
        console.log(`  ${pc.yellow("[DRY RUN]")} ${pc.green("✓")} ${r.file}`);
      } else {
        console.log(`  ${pc.green("✓")} ${r.file}`);
      }
    }
  }

  const failedFiles = results.filter((r) => !r.success);
  if (failedFiles.length > 0) {
    console.log();
    console.log("エラーが発生したファイル:");
    for (const r of failedFiles) {
      console.log(`  ${pc.red("✗")} ${r.file}: ${r.error}`);
    }
  }

  displayAvailableCommands(packageUpdateResult);
}

// 現在の設定ファイル状況を表示する関数
function displayCurrentFileStatus(projectName, fileStatus) {
  log.info("🔄 既存プロジェクトの設定更新");
  console.log(`📦 プロジェクト: ${pc.cyan(projectName)}`);
  console.log();

  console.log("現在の設定ファイル状況:");
  for (const file of fileStatus) {
    const status = file.exists ? pc.green("✓ 存在") : pc.gray("✗ 未存在");
    console.log(`  ${status} ${file.destination}`);
  }
  console.log();
}

// 設定ファイル選択を取得する関数（既存プロジェクト用）
async function getExistingProjectConfigSelection(fileStatus) {
  // --configオプションが指定されている場合は対話をスキップ
  if (globalOptions.config) {
    return globalOptions.config;
  }

  const existingFiles = fileStatus.filter((f) => f.exists).map((f) => f.id);

  return await multiselect({
    message:
      "更新・追加する設定ファイルを選択してください\n" +
      pc.yellow("操作方法: Spaceキーで選択/選択解除、Enterキーで確定"),
    options: CONFIG_FILES.map((file) => {
      const fileInfo = fileStatus.find((f) => f.id === file.id);
      const action = fileInfo?.exists ? "更新" : "追加";
      return {
        value: file.id,
        label: `${file.label.replace(/設定/, `設定を${action}`)}`,
        hint: file.destination,
      };
    }),
    initialValues: existingFiles,
  });
}

// ファイル結果を表示する関数
function displayFileResult(result) {
  if (result.dryRun) {
    console.log(`  ${pc.yellow("[DRY RUN]")} ${pc.green("✓")} ${result.file}`);
  } else {
    console.log(`  ${pc.green("✓")} ${result.file}`);
  }
}

// 更新されたファイルを表示する関数
function displayUpdatedFiles(updatedFiles) {
  if (updatedFiles.length === 0) {
    return false;
  }

  console.log(globalOptions.dryRun ? "更新されるファイル:" : "更新されたファイル:");
  for (const r of updatedFiles) {
    displayFileResult(r);
  }
  return true;
}

// 作成されたファイルを表示する関数
function displayCreatedFiles(createdFiles, hasUpdatedFiles) {
  if (createdFiles.length === 0) {
    return;
  }

  if (hasUpdatedFiles) {
    console.log();
  }
  console.log(globalOptions.dryRun ? "作成されるファイル:" : "作成されたファイル:");
  for (const r of createdFiles) {
    displayFileResult(r);
  }
}

// エラーが発生したファイルを表示する関数
function displayFailedFiles(failedFiles) {
  if (failedFiles.length === 0) {
    return;
  }

  console.log();
  console.log("エラーが発生したファイル:");
  for (const r of failedFiles) {
    console.log(`  ${pc.red("✗")} ${r.file}: ${r.error}`);
  }
}

// 設定ファイル適用結果を表示する関数
function displayConfigFileResults(results) {
  if (globalOptions.dryRun) {
    log.success("✨ 設定ファイルの適用プレビュー [DRY RUN]");
  } else {
    log.success("✨ 設定ファイルの適用完了");
  }
  console.log();

  const successFiles = results.filter((r) => r.success);
  const updatedFiles = successFiles.filter((r) => r.wasExisting);
  const createdFiles = successFiles.filter((r) => !r.wasExisting);
  const failedFiles = results.filter((r) => !r.success);

  const hasUpdatedFiles = displayUpdatedFiles(updatedFiles);
  displayCreatedFiles(createdFiles, hasUpdatedFiles);
  displayFailedFiles(failedFiles);
}

// 設定ファイルを適用する関数（既存プロジェクト用）
function applyConfigFilesForExisting(selectedConfigs, fileStatus) {
  const results = [];
  const gitignoreSelected = selectedConfigs.includes("gitignore");
  const otherConfigs = selectedConfigs.filter((id) => id !== "gitignore");

  for (const configId of otherConfigs) {
    const configFile = CONFIG_FILES.find((f) => f.id === configId);
    if (configFile) {
      const fileInfo = fileStatus.find((f) => f.id === configId);
      const result = applyConfigFile(configFile);
      result.wasExisting = !!fileInfo?.exists;
      results.push(result);
    }
  }

  // .gitignoreの更新処理
  if (gitignoreSelected) {
    const fileInfo = fileStatus.find((f) => f.id === "gitignore");
    const gitignoreResult = updateGitignore(process.cwd(), otherConfigs);
    if (gitignoreResult.success) {
      results.push({
        success: true,
        file: ".gitignore",
        wasExisting: !!fileInfo?.exists,
      });
    } else {
      results.push({
        success: false,
        file: ".gitignore",
        error: gitignoreResult.error,
        wasExisting: !!fileInfo?.exists,
      });
    }
  }

  return results;
}

// 新しく追加された設定ファイルの依存関係をインストールする関数
async function installDependenciesForNewlyAdded(newlyAddedConfigs) {
  const dependencies = collectDependencies(newlyAddedConfigs);
  if (dependencies.length <= 1) {
    return;
  }

  const shouldSkipInstall = globalOptions.skipInstall || globalOptions.dryRun;
  if (shouldSkipInstall) {
    if (globalOptions.dryRun) {
      log.info(`[DRY RUN] 依存関係をインストールします: ${dependencies.join(", ")}`);
    } else {
      log.info("⏭️  依存関係のインストールをスキップしました");
    }
    return;
  }

  try {
    await installDependencies(process.cwd(), dependencies);
  } catch (error) {
    console.error(`${pc.red("❌ 依存関係インストールエラー:")} ${error.message}`);
    console.log(`${pc.yellow("⚠️ 手動でインストールしてください:")} pnpm add -D ${dependencies.join(" ")}`);
  }
}

// 新しく追加された設定ファイルのpackage.jsonを更新する関数
function updatePackageJsonForNewlyAdded(newlyAddedConfigs) {
  if (!globalOptions.dryRun) {
    // updatePackageJsonExisting(newlyAddedConfigs) の呼び出し
    const packageUpdateResult = updatePackageJsonExisting(newlyAddedConfigs);
    if (!packageUpdateResult.success) {
      console.error(`${pc.red("❌ package.json更新エラー:")} ${packageUpdateResult.error}`);
      return;
    }

    if (Object.keys(packageUpdateResult.scripts || {}).length > 0) {
      console.log();
      displayAvailableCommands(packageUpdateResult);
    }
    return;
  }

  log.info(`[DRY RUN] package.jsonを更新します`);
  const scripts = collectScripts(newlyAddedConfigs);
  if (Object.keys(scripts).length > 0) {
    console.log();
    displayAvailableCommands({ success: true, scripts });
  }
}

// 新しく追加された設定ファイルの依存関係とスクリプトを処理する関数
async function processNewlyAddedConfigs(otherConfigs, fileStatus) {
  const newlyAddedConfigs = otherConfigs.filter((configId) => {
    const fileInfo = fileStatus.find((f) => f.id === configId);
    return !fileInfo?.exists;
  });

  // 新しく追加された設定ファイルがある場合のみ処理を実行
  // newlyAddedConfigs.length > 0 のチェック
  if (newlyAddedConfigs.length === 0) {
    return;
  }

  // 依存関係のインストール（dependencies.length > 1 のチェックは installDependenciesForNewlyAdded 内で実施）
  await installDependenciesForNewlyAdded(newlyAddedConfigs);

  // package.jsonの更新（updatePackageJsonExisting(newlyAddedConfigs) は updatePackageJsonForNewlyAdded 内で呼び出し）
  updatePackageJsonForNewlyAdded(newlyAddedConfigs);
}

// 既存プロジェクト用の設定更新
async function updateExistingProject() {
  const projectName = getProjectName();
  const fileStatus = checkConfigFileStatus();

  if (globalOptions.dryRun) {
    log.info("🔄 既存プロジェクトの設定更新 [DRY RUN]");
  }

  displayCurrentFileStatus(projectName, fileStatus);

  const selectedConfigs = await getExistingProjectConfigSelection(fileStatus);

  if (isCancel(selectedConfigs)) {
    cancel("設定をキャンセルしました");
    return false;
  }

  const otherConfigs = selectedConfigs.filter((id) => id !== "gitignore");
  const results = applyConfigFilesForExisting(selectedConfigs, fileStatus);

  await processNewlyAddedConfigs(otherConfigs, fileStatus);

  displayConfigFileResults(results);

  if (globalOptions.dryRun) {
    log.success("🎉 [DRY RUN] 実際には変更は行われませんでした");
  }

  return true;
}

// メイン関数
async function main() {
  // コマンドライン引数を解析
  parseArguments();

  intro(pc.inverse(" @katsu996/common-utils 設定ツール "));

  console.log();
  // 現在の作業ディレクトリを取得（シンボリックリンクを解決したパスを使用）
  const currentDir = fs.realpathSync(process.cwd());
  console.log(`📂 現在のディレクトリ: ${pc.cyan(currentDir)}`);

  const hasPackage = hasPackageJson();
  const packageStatus = hasPackage ? pc.green("✓ 検出") : pc.gray("✗ 未検出");
  console.log(`📋 package.json: ${packageStatus}`);
  console.log();

  try {
    let completed = false;
    if (hasPackage) {
      completed = await updateExistingProject();
    } else {
      completed = await initializeNewProject();
    }

    // キャンセルされていない場合のみ完了メッセージを表示
    if (completed) {
      outro(pc.green("設定が完了しました！"));
    }
  } catch (error) {
    console.error(`${pc.red("❌ エラー:")} ${error.message}`);
    process.exit(1);
  }
}

// エラーハンドリング
process.on("SIGINT", () => {
  cancel("設定をキャンセルしました");
  process.exit(0);
});

// 実行
main().catch((error) => {
  console.error(`${pc.red("❌ 予期しないエラー:")} ${error.message}`);
  process.exit(1);
});
