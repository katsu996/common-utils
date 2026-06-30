#!/usr/bin/env node

const pc = require("picocolors");

const globalOptions = {
  list: false,
  config: null,
  skipInstall: false,
  dryRun: false,
};

function handleConfigOption(args, index) {
  if (index + 1 < args.length) {
    const configIds = args[index + 1]
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
    globalOptions.config = configIds;
    return index + 1;
  }
  console.error(`${pc.red("エラー:")} --configオプションには設定ファイルIDが必要です`);
  console.error(`  例: ${pc.cyan("--config typescript,biome")}`);
  process.exit(1);
}

function handleExitOptions(arg, helpers) {
  if (arg === "-v" || arg === "--version") {
    console.log(helpers.getPackageVersion());
    process.exit(0);
  }

  if (arg === "-h" || arg === "--help") {
    helpers.displayHelp();
    process.exit(0);
  }

  if (arg === "-l" || arg === "--list") {
    helpers.displayList();
    process.exit(0);
  }

  return false;
}

function handleFlagOptions(arg) {
  if (arg === "--skip-install") {
    globalOptions.skipInstall = true;
    return true;
  }

  if (arg === "-n" || arg === "--dry-run") {
    globalOptions.dryRun = true;
    return true;
  }

  return false;
}

function parseArguments(helpers) {
  const args = process.argv.slice(2);

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (handleExitOptions(arg, helpers)) {
      continue;
    }

    if (arg === "-c" || arg === "--config") {
      i = handleConfigOption(args, i);
      continue;
    }

    handleFlagOptions(arg);
  }

  if (globalOptions.config) {
    helpers.validateConfigIds(globalOptions.config);
  }
}

module.exports = { globalOptions, parseArguments };
