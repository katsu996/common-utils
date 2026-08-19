#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const { program } = require("commander");
const { setupProcessHandlers, handleError } = require("./cli/utils/errors");
const { setGlobalOptions } = require("./cli/utils/global-options");
const { initCommand } = require("./cli/commands/init");
const { updateCommand } = require("./cli/commands/update");
const { listCommand } = require("./cli/commands/list");
const packageJson = require("../package.json");

function defaultSetupProcessHandlers() {
  setupProcessHandlers();
}

function createProgram(dependencies = {}) {
  const {
    fsModule = fs,
    pathModule = path,
    programRef = program,
    setupProcessHandlersFn = defaultSetupProcessHandlers,
    setGlobalOptionsFn = setGlobalOptions,
    initCommandFn = initCommand,
    updateCommandFn = updateCommand,
    listCommandFn = listCommand,
    packageJsonRef = packageJson,
    processRef = process,
  } = dependencies;

  setupProcessHandlersFn();
  programRef
    .name("katsu-config")
    .description("@katsu996/common-utils 設定ツール")
    .version(packageJsonRef.version, "-V, --version", "バージョン番号を表示")
    .helpOption("-h, --help", "ヘルプを表示")
    .option("-c, --config <ids>", "設定ファイルIDをカンマ区切りで指定")
    .option("-n, --dry-run", "変更を実行せずプレビュー")
    .option("--skip-install", "依存関係のインストールをスキップ")
    .hook("preAction", (thisCommand) => {
      const opts = thisCommand.optsWithGlobals();
      const configIds = opts.config
        ? opts.config
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean)
        : null;
      setGlobalOptionsFn({
        config: configIds,
        dryRun: opts.dryRun || false,
        skipInstall: opts.skipInstall || false,
      });
    });

  programRef
    .command("init")
    .description("新規プロジェクトを作成（Vite + 設定ファイル）")
    .action(initCommandFn);
  programRef
    .command("update")
    .description("既存プロジェクトの設定ファイルを更新")
    .action(updateCommandFn);
  programRef
    .command("list")
    .description("利用可能な設定ファイル一覧を表示")
    .action(listCommandFn);
  programRef.action(async () => {
    const hasPackage = fsModule.existsSync(
      pathModule.join(processRef.cwd(), "package.json"),
    );
    if (hasPackage) {
      await updateCommandFn();
    } else {
      await initCommandFn();
    }
  });

  return programRef;
}

async function runCli(dependencies = {}) {
  const {
    processRef = process,
    handleErrorFn = handleError,
    argv = process.argv,
  } = dependencies;
  const cli = createProgram(dependencies);
  try {
    await cli.parseAsync(argv);
  } catch (error) {
    if (error?.code !== "commander.missingMandatoryOptionValue") {
      handleErrorFn(error);
    }
    processRef.exit(1);
  }
}

if (require.main === module) {
  void runCli();
}

module.exports = { createProgram, runCli };
