const { intro, outro, log } = require("@clack/prompts");
const { theme } = require("./theme");
const { CONFIG_FILES } = require("../config-files-data");
const { globalOptions } = require("../utils/global-options");
const { packageRoot } = require("../config-files-data");

function getPackageVersion() {
  try {
    const packageJsonPath = require("path").join(packageRoot, "package.json");
    const packageJson = JSON.parse(
      require("fs").readFileSync(packageJsonPath, "utf8"),
    );
    return packageJson.version;
  } catch {
    return "unknown";
  }
}

function showIntro() {
  intro(theme.title("@katsu996/common-utils 設定ツール"));
}

function showOutro(message) {
  outro(message);
}

function showProjectInfo(currentDir, packageStatus) {
  log.info(`現在のディレクトリ: ${theme.path(currentDir)}`);
  log.info(`package.json: ${packageStatus}`);
}

function showConfigFileStatus(fileStatus) {
  log.info("現在の設定ファイル状況:");
  for (const file of fileStatus) {
    const status = file.exists
      ? theme.success("✓ 存在")
      : theme.muted("✗ 未存在");
    console.log(`  ${status} ${file.destination}`);
  }
}

function showResults(results) {
  const successFiles = results.filter((r) => r.success);
  const updatedFiles = successFiles.filter((r) => r.wasExisting);
  const createdFiles = successFiles.filter((r) => !r.wasExisting);
  const failedFiles = results.filter((r) => !r.success);

  if (updatedFiles.length > 0) {
    log.success(
      globalOptions.dryRun ? "更新されるファイル:" : "更新されたファイル:",
    );
    for (const r of updatedFiles) {
      const prefix = r.dryRun ? `${theme.warning("[DRY RUN]")} ` : "";
      console.log(`  ${prefix}${theme.success("✓")} ${r.file}`);
    }
  }

  if (createdFiles.length > 0) {
    if (updatedFiles.length > 0) console.log();
    log.success(
      globalOptions.dryRun ? "作成されるファイル:" : "作成されたファイル:",
    );
    for (const r of createdFiles) {
      const prefix = r.dryRun ? `${theme.warning("[DRY RUN]")} ` : "";
      console.log(`  ${prefix}${theme.success("✓")} ${r.file}`);
    }
  }

  if (failedFiles.length > 0) {
    console.log();
    log.error("エラーが発生したファイル:");
    for (const r of failedFiles) {
      console.log(`  ${theme.error("✗")} ${r.file}: ${r.error}`);
    }
  }
}

function showProjectResults(projectDir, results, packageUpdateResult) {
  log.success(
    globalOptions.dryRun
      ? "設定ファイルの適用プレビュー [DRY RUN]"
      : "設定ファイルの適用完了",
  );
  console.log();
  log.info(`Viteプロジェクト: ${theme.path(projectDir)}`);
  console.log();

  showResults(results);

  if (packageUpdateResult?.success && packageUpdateResult?.scripts) {
    showAvailableCommands(packageUpdateResult);
  }
}

function showAvailableCommands(packageUpdateResult) {
  const scripts = packageUpdateResult.scripts;
  if (!scripts || Object.keys(scripts).length === 0) return;

  console.log();
  log.info("利用可能なコマンド:");

  const descriptions = {
    "type-check": "TypeScript型チェック",
    lint: "lintを実行",
    "lint:fix": "lint問題を自動修正",
    check: "総合チェック",
    "check:fix": "check問題を自動修正",
    format: "コードフォーマット",
    "format:check": "フォーマット確認",
    test: "テスト実行",
    "test:watch": "テスト監視モード",
    "test:coverage": "テストカバレッジ",
  };

  for (const name of Object.keys(scripts)) {
    const desc = descriptions[name] || "カスタムスクリプト";
    console.log(
      `  ${theme.command(`pnpm ${name}`).padEnd(22)} ${theme.muted(desc)}`,
    );
  }
  console.log();
}

function showCompletionMessage(projectName) {
  console.log();
  log.success(
    "Viteプロジェクトと設定ファイルの準備完了! 以下のコマンドで開発を開始できます:",
  );
  console.log(`  ${theme.command(`cd ${projectName}`)}`);
  console.log(`  ${theme.command("pnpm dev")}`);
}

function showVersion(version) {
  console.log(version);
}

function showHelpMessage() {
  const lines = [
    `${theme.title("@katsu996/common-utils 設定ツール")}`,
    "",
    `${theme.heading("使用方法")}`,
    `  katsu-config ${theme.muted("[command]")} ${theme.muted("[options]")}`,
    "",
    `${theme.heading("コマンド:")}`,
    `  init    ${theme.muted("新規プロジェクトを作成（Vite + 設定ファイル）")}`,
    `  update  ${theme.muted("既存プロジェクトの設定ファイルを更新")}`,
    `  list    ${theme.muted("利用可能な設定ファイル一覧を表示")}`,
    "",
    `${theme.heading("オプション:")}`,
    `  -V, --version          ${theme.muted("バージョン番号を表示")}`,
    `  -h, --help             ${theme.muted("このヘルプを表示")}`,
    `  -c, --config <ids>     ${theme.muted("設定ファイルIDをカンマ区切りで指定")}`,
    `  -n, --dry-run          ${theme.muted("変更を実行せずプレビュー")}`,
    `  --skip-install         ${theme.muted("依存関係のインストールをスキップ")}`,
    "",
    `${theme.heading("設定ファイルID:")}`,
  ];

  for (const file of CONFIG_FILES) {
    lines.push(
      `  ${theme.highlight(file.id).padEnd(14)} ${theme.muted(file.destination)}`,
    );
  }

  console.log(lines.join("\n"));
}

function showConfigList() {
  console.log(`\n${theme.title("利用可能な設定ファイル")}\n`);
  for (const file of CONFIG_FILES) {
    console.log(`${theme.highlight(file.id).padEnd(14)} ${file.label}`);
    console.log(`              ${theme.muted(`-> ${file.destination}`)}`);
    if (file.dependencies?.length > 0) {
      console.log(
        `              ${theme.warning(`依存関係: ${file.dependencies.join(", ")}`)}`,
      );
    }
    console.log();
  }
}

module.exports = {
  showIntro,
  showOutro,
  showProjectInfo,
  showConfigFileStatus,
  showResults,
  showProjectResults,
  showAvailableCommands,
  showCompletionMessage,
  showVersion,
  showHelpMessage,
  showConfigList,
  getPackageVersion,
};
