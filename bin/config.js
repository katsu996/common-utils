#!/usr/bin/env node

const { cancel } = require("@clack/prompts");
const pc = require("picocolors");
const { main } = require("./cli/project");

process.on("SIGINT", () => {
  cancel("設定をキャンセルしました");
  process.exit(0);
});

main().catch((error) => {
  console.error(`${pc.red("予期しないエラー:")} ${error.message}`);
  process.exit(1);
});
