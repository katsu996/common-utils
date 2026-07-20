const { cancel } = require("@clack/prompts");
const { theme } = require("../ui/theme");

function handleError(error) {
  if (error?.name === "CancelError" || error?.message === "cancel") {
    cancel(theme.warning("設定をキャンセルしました"));
    process.exit(0);
  }
  console.error(`\n${theme.error("予期しないエラー:")} ${error.message}`);
  process.exit(1);
}

function setupProcessHandlers() {
  process.on("SIGINT", () => {
    cancel(theme.warning("設定をキャンセルしました"));
    process.exit(0);
  });
  process.on("uncaughtException", handleError);
  process.on("unhandledRejection", handleError);
}

module.exports = { handleError, setupProcessHandlers };
