const { cancel } = require("@clack/prompts");
const { theme } = require("../ui/theme");

function createErrorHandlers(dependencies = {}) {
  const {
    cancelFn = cancel,
    themeModule = theme,
    processRef = process,
    consoleRef = console,
  } = dependencies;

  function handleError(error) {
    if (error?.name === "CancelError" || error?.message === "cancel") {
      cancelFn(themeModule.warning("設定をキャンセルしました"));
      processRef.exit(0);
      return;
    }
    consoleRef.error(
      `\n${themeModule.error("予期しないエラー:")} ${error.message}`,
    );
    processRef.exit(1);
  }

  function setupProcessHandlers() {
    processRef.on("SIGINT", () => {
      cancelFn(themeModule.warning("設定をキャンセルしました"));
      processRef.exit(0);
    });
    processRef.on("uncaughtException", handleError);
    processRef.on("unhandledRejection", handleError);
  }

  return { handleError, setupProcessHandlers };
}

const errorHandlers = createErrorHandlers();

module.exports = { createErrorHandlers, ...errorHandlers };
