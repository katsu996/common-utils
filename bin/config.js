#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { program } = require("commander");
const { setupProcessHandlers } = require("./cli/utils/errors");
const { setGlobalOptions } = require("./cli/utils/global-options");
const { initCommand } = require("./cli/commands/init");
const { updateCommand } = require("./cli/commands/update");
const { listCommand } = require("./cli/commands/list");

setupProcessHandlers();

const packageJson = require("../package.json");

program
  .name("katsu-config")
  .description("@katsu996/common-utils 設定ツール")
  .version(packageJson.version, "-V, --version", "バージョン番号を表示")
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
    setGlobalOptions({
      config: configIds,
      dryRun: opts.dryRun || false,
      skipInstall: opts.skipInstall || false,
    });
  });

program
  .command("init")
  .description("新規プロジェクトを作成（Vite + 設定ファイル）")
  .action(initCommand);

program.command("update").description("既存プロジェクトの設定ファイルを更新").action(updateCommand);

program.command("list").description("利用可能な設定ファイル一覧を表示").action(listCommand);

program.action(async () => {
  const hasPackage = fs.existsSync(path.join(process.cwd(), "package.json"));
  if (hasPackage) {
    await updateCommand();
  } else {
    await initCommand();
  }
});

program.parseAsync(process.argv).catch((error) => {
  if (error?.code !== "commander.missingMandatoryOptionValue") {
    const { handleError } = require("./cli/utils/errors");
    handleError(error);
  }
  process.exit(1);
});
